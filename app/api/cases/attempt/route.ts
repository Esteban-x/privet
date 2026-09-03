import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCase } from "@/lib/grammar/cases";
import { CaseId } from "@/lib/grammar/types";
import { bumpStreakAndXp } from "@/lib/progress/streak";
import { declineNoun } from "@/lib/grammar/decline";
import {
  acceptableForms,
  normalizeAnswer,
  resolveExerciseNoun,
} from "@/lib/grammar/exercise-generator";
import { getTrigger } from "@/lib/grammar/triggers";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { consumeQuota, recordTokens } from "@/lib/ai/quota";
import { allowPractice } from "@/lib/practice/quota";
import { answerVerificationPrompt } from "@/lib/ai/prompts";

/**
 * Seule autorité sur "cette réponse est-elle juste ?".
 *
 * Le client compare la saisie à la forme calculée pour afficher un retour
 * instantané, mais ne DÉCIDE de rien : il envoie la réponse brute, le
 * serveur recalcule la forme attendue avec le même moteur déterministe et
 * tranche. Deux raisons :
 * - un client ne peut pas gonfler sa progression/son XP en annonçant
 *   "correct" ;
 * - il n'existe qu'un seul verdict, donc plus de divergence possible entre
 *   ce que l'apprenant voit et ce que la base enregistre.
 *
 * Quand le calcul déterministe dit "faux", et seulement là, une
 * vérification IA rattrape les faux négatifs (variante orthographique ou
 * accentuée tout aussi correcte). Le chemin heureux ne coûte aucun token.
 */

interface VerificationResult {
  acceptable: boolean;
  reason?: string;
}

type Db = Awaited<ReturnType<typeof createClient>>;

async function aiSecondOpinion(
  supabase: Db,
  input: {
    lemma: string;
    gender: string;
    animacy: string;
    targetCase: string;
    plural: boolean;
    computedForm: string;
    userAnswer: string;
    sentence?: string;
  }
): Promise<VerificationResult> {
  // Hors quota, le verdict déterministe (« faux ») tient. C'est déjà ce
  // que fait le `catch` ci-dessous : on ne marque jamais « correct » par
  // défaut. L'apprenant du plan gratuit garde donc une correction complète
  // — il perd seulement le rattrapage des variantes que le moteur de
  // règles refuse à tort.
  const quota = await consumeQuota(supabase, "verify");
  if (!quota.allowed) return { acceptable: false };

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 150,
      system: answerVerificationPrompt(input),
      messages: [{ role: "user", content: "Vérifie cette réponse." }],
    });
    await recordTokens(supabase, "verify", msg.usage);
    const result = parseJsonResponse<VerificationResult>(textFromMessage(msg));
    return { acceptable: result.acceptable === true, reason: result.reason };
  } catch (err) {
    // Échec réseau/parsing : on ne marque JAMAIS "correct" par défaut — le
    // verdict déterministe (incorrect) reste la réponse la plus sûre plutôt
    // que de risquer d'accepter à tort quelque chose de faux.
    console.error("cases/attempt : vérification IA indisponible", err);
    return { acceptable: false };
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // `targetCase` est le cas réellement demandé par l'exercice, pas celui de
  // la page : "21 + стол" appelle un nominatif tout en vivant sur la page
  // du génitif. Recalculer avec le cas de la page comptait ces réponses
  // justes comme fausses.
  const targetCase = body.targetCase as CaseId;
  const nounId = typeof body.nounId === "string" ? body.nounId : "";
  const userAnswer = typeof body.userAnswer === "string" ? body.userAnswer.slice(0, 200) : "";
  const plural = body.plural === true;
  const revealed = body.revealed === true;
  // La phrase de l'exercice, quand il y en a une. Elle ne sert QU'À la
  // seconde lecture IA : le verdict déterministe, lui, ne dépend que du nom,
  // du cas et du nombre — un client ne peut donc rien s'accorder en la
  // trafiquant. Voir answerVerificationPrompt pour ce qu'elle y apporte.
  const sentence =
    typeof body.sentence === "string" && body.sentence.includes("___")
      ? body.sentence.slice(0, 300)
      : undefined;
  // En QCM l'apprenant clique une des formes proposées : une réponse fausse
  // l'est franchement, la seconde lecture IA n'a rien à rattraper.
  const multipleChoice = body.multipleChoice === true;

  if (!getCase(targetCase)) {
    return NextResponse.json({ error: "Cas invalide" }, { status: 400 });
  }
  const noun = resolveExerciseNoun(nounId);
  if (!noun) {
    return NextResponse.json({ error: "Mot inconnu de la banque" }, { status: 400 });
  }

  // Le péage de pratique : vingt exercices par jour au plan gratuit, tous
  // modules confondus.
  //
  // PLACÉ ICI, ET PAS PLUS HAUT. Une requête malformée (cas invalide, nom
  // hors banque) ressort en 400 sans grignoter la journée de personne. Et il
  // reste AVANT la seconde lecture IA et avant toute écriture : un refus n'a
  // donc rien coûté en tokens ni rien laissé derrière lui.
  const gate = await allowPractice(supabase, "practice");
  if (!gate.ok) return gate.response;

  // Un déclencheur inexistant, ou appartenant à un autre cas, polluerait
  // case_trigger_progress (et donc le tirage adaptatif) avec des lignes qui
  // ne correspondent à aucun exercice réel.
  const trigger = typeof body.triggerId === "string" ? getTrigger(body.triggerId) : undefined;
  const triggerId = trigger?.caseId === targetCase ? trigger.id : null;

  // C'est ici, et nulle part ailleurs, que la forme attendue est recalculée :
  // le client n'envoie que l'identifiant du nom et le cas. L'accord de
  // l'adjectif a son propre module (app/api/adjectives/attempt) depuis qu'il
  // a quitté cet onglet.
  const declension = declineNoun(noun, targetCase, plural);
  const expectedForm = declension.form;

  // "Je ne sais pas" compte comme un échec quoi qu'il y ait dans le champ de
  // saisie : sans ce drapeau, une bonne réponse déjà tapée puis révélée
  // était enregistrée comme réussie.
  let correct = false;
  let reason: string | null = null;
  if (!revealed) {
    // Les DEUX formes du dictionnaire, quand il en donne deux : « дочеря́ми »
    // vaut « дочерьми́ ». Le même énumérateur sert au client, sinon l'écran
    // et la base pourraient rendre deux verdicts différents.
    const acceptable = acceptableForms({
      correctForm: expectedForm,
      variantForm: declension.variant,
    });
    const given = normalizeAnswer(userAnswer);
    correct = acceptable.some((form) => normalizeAnswer(form) === given);
    // La relecture par le modèle n'a plus ces 148 cas à rattraper : elle
    // coûtait un appel, n'arrivait qu'après un verdict négatif, et le plan
    // gratuit ne l'a pas.
    if (!correct && !multipleChoice && userAnswer.trim()) {
      const verdict = await aiSecondOpinion(supabase, {
        lemma: noun.lemma,
        gender: noun.gender,
        animacy: noun.animacy,
        targetCase,
        plural,
        computedForm: expectedForm,
        userAnswer,
        sentence,
      });
      correct = verdict.acceptable;
      reason = verdict.reason ?? null;
    }
  }

  const gender = noun.gender;
  const { data: existing } = await supabase
    .from("case_progress")
    .select("attempts, correct")
    .eq("user_id", user.id)
    .eq("case_id", targetCase)
    .eq("gender", gender)
    .single();

  const attempts = (existing?.attempts ?? 0) + 1;
  const correctTotal = (existing?.correct ?? 0) + (correct ? 1 : 0);

  const { error } = await supabase.from("case_progress").upsert(
    {
      user_id: user.id,
      case_id: targetCase,
      gender,
      attempts,
      correct: correctTotal,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "user_id,case_id,gender" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("activity_log").insert({
    user_id: user.id,
    kind: "case",
    correct,
    meta: { caseId: targetCase, gender, triggerId, revealed },
  });

  // Progression par déclencheur (préposition/verbe/expression), plus fine
  // que case_progress — alimente le tirage adaptatif (exercise-selector.ts).
  if (triggerId) {
    const { data: existingTrigger } = await supabase
      .from("case_trigger_progress")
      .select("attempts, correct")
      .eq("user_id", user.id)
      .eq("case_id", targetCase)
      .eq("trigger_id", triggerId)
      .single();

    await supabase.from("case_trigger_progress").upsert(
      {
        user_id: user.id,
        case_id: targetCase,
        trigger_id: triggerId,
        attempts: (existingTrigger?.attempts ?? 0) + 1,
        correct: (existingTrigger?.correct ?? 0) + (correct ? 1 : 0),
        last_seen: new Date().toISOString(),
      },
      { onConflict: "user_id,case_id,trigger_id" }
    );
  }

  await bumpStreakAndXp(supabase, user.id, correct ? 10 : 2);

  return NextResponse.json({
    correct,
    expectedForm,
    reason,
    caseAccuracy: Math.round((correctTotal / attempts) * 100),
    // Ce qu'il reste APRÈS celui-ci : l'écran sait donc qu'il vient de
    // servir le dernier, et propose l'abonnement plutôt qu'un exercice
    // qu'il faudrait refuser une fois répondu.
    quota: gate.allowance,
  });
}
