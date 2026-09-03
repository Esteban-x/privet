import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { consumeQuota, recordTokens } from "@/lib/ai/quota";
import { exerciseSystemPrompt } from "@/lib/ai/prompts";
import { CaseId, Noun } from "@/lib/grammar/types";
import type { CefrLevel } from "@/lib/supabase/types";
import { getCase } from "@/lib/grammar/cases";
import { CaseTrigger, PROPER_NOUN_TRIGGER_ID, getTrigger, resolveNumber } from "@/lib/grammar/triggers";
import { DECLINABLE_NOUNS, poolFor } from "@/lib/grammar/exercise-generator";
import { nounsForLevel } from "@/lib/grammar/nouns-data";
import { declineNoun } from "@/lib/grammar/decline";
import { validateFrenchSentence, validateSentence } from "@/lib/grammar/sentence-guard";

// La banque compte plusieurs centaines de mots : l'envoyer entière à chaque
// exercice coûterait ~2 000 tokens de prompt et pousserait le modèle vers
// les mêmes têtes de liste. On tire un échantillon à chaque appel — moins
// cher, et surtout réellement varié d'un exercice à l'autre.
const SAMPLE_SIZE = 40;

// L'échantillon part de ce que le DÉCLENCHEUR admet (liste curée de
// trigger-nouns.generated.ts, sinon classes sémantiques), pas de la banque
// entière du niveau. Sans ce filtre, la curation ne protégeait que le
// gabarit fixe et le chemin IA — celui qui sert par défaut — la
// contournait : on demandait au modèle d'illustrer « владеть » en lui
// imposant 40 mots au hasard, dont aucun n'était maîtrisable une fois sur
// trois. Il choisissait alors le moins mauvais (рот) et rédigeait une
// traduction française qui masquait l'écart (« maîtrise la parole »).
function buildCandidatePool(
  recentLemmas: string[],
  level: CefrLevel | undefined,
  trigger: CaseTrigger | undefined
): Noun[] {
  const levelPool = nounsForLevel(level);
  const sayable = trigger ? poolFor(trigger, levelPool) : levelPool;
  const recent = new Set(recentLemmas);
  const available = sayable.filter((n) => !recent.has(n.lemma));
  const pool = available.length >= SAMPLE_SIZE ? available : sayable;

  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, SAMPLE_SIZE);
}

interface AiExercise {
  sentence_ru: string;
  sentence_fr: string;
  lemma: string;
  hint: string;
  trigger_id?: string;
}

/**
 * Sans ce plafond, Vercel coupe à dix secondes — une 504 sans corps, sans
 * trace, et qui ne se reproduit jamais en local. Voir la note détaillée dans
 * app/api/ai/reading/route.ts.
 */
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caseId = body.caseId as CaseId;
  if (!getCase(caseId)) {
    return NextResponse.json({ error: "Cas invalide" }, { status: 400 });
  }
  const triggerId = typeof body.triggerId === "string" ? body.triggerId : undefined;
  // Un déclencheur d'un AUTRE cas (ex. triggerId périmé après un changement
  // rapide d'onglet côté client) produirait un prompt contradictoire
  // ("illustre X au génitif" alors que caseId="datif") — ignoré plutôt que
  // transmis tel quel à l'IA.
  const rawTrigger = triggerId ? getTrigger(triggerId) : undefined;
  const trigger = rawTrigger?.caseId === caseId ? rawTrigger : undefined;

  // Mots récemment vus par l'apprenant (n'importe quel cas) — évite que le
  // modèle reparte systématiquement sur le mot le plus "évident" du thème
  // choisi (ex. музыка dès que le thème est la musique, en boucle).
  // Le nombre demandé par l'apprenant. Il n'est PAS cru sur parole : le
  // gabarit tranche juste en dessous (resolveNumber), donc un client qui
  // réclamerait un pluriel sur « Меня зовут ___ » obtient un singulier.
  const wantPlural = body.plural === true;
  const recentLemmas: string[] = Array.isArray(body.recentLemmas)
    ? body.recentLemmas.filter((w: unknown): w is string => typeof w === "string").slice(0, 12)
    : [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("level")
    .eq("id", user.id)
    .single();

  // Le rôle de l'IA se limite à la MISE EN SITUATION : elle écrit une phrase
  // autour d'un mot de la banque, elle ne choisit pas le mot librement et ne
  // calcule aucune forme fléchie. On lui propose un échantillon renouvelé à
  // chaque appel ; le lemme renvoyé est ensuite revérifié contre la banque
  // entière.
  const candidates = buildCandidatePool(recentLemmas, profile?.level, trigger);

  try {
    // "Меня зовут ___" ne devrait jamais atteindre cette route (le client
    // le contourne entièrement, voir CaseDeclension.tsx) — filet de
    // sécurité si jamais un triggerId périmé arrivait quand même ici.
    if (trigger?.id === PROPER_NOUN_TRIGGER_ID) {
      return NextResponse.json({ error: "Déclencheur non IA" }, { status: 400 });
    }

    // Quota. Le refus n'a volontairement aucun message : CaseDeclension
    // traite tout échec de cette route comme une indisponibilité et
    // retombe sur le gabarit fixe, qui est curé et parfaitement jouable.
    // Un apprenant du plan gratuit fait donc ses exercices de déclinaison
    // normalement — il n'a simplement pas la phrase rédigée par l'IA, et
    // rien à l'écran ne se casse.
    const quota = await consumeQuota(supabase, "exercise_ai");
    if (!quota.allowed) {
      return NextResponse.json({ error: "Génération non disponible." }, { status: 429 });
    }

    // Le NOMBRE ne vient jamais du modèle : c'est lui qui entre dans le
    // calcul de la forme attendue, côté client comme côté serveur. Il vient
    // du choix de l'apprenant, borné par ce que le gabarit supporte.
    const plural = trigger ? resolveNumber(trigger, wantPlural) : wantPlural;
    const allowed = trigger ? poolFor(trigger, DECLINABLE_NOUNS) : DECLINABLE_NOUNS;

    // Deux tentatives au plus. Le contrôle grammatical (sentence-guard) refuse
    // une phrase dont le trou n'est pas gouverné comme l'exercice le suppose ;
    // relancer une fois en disant POURQUOI corrige la quasi-totalité des cas,
    // et coûte moins qu'une retombée sur le gabarit fixe, toujours le même.
    // Au-delà, on renonce : le client retombe alors sur ce gabarit, qui est
    // curé et juste par construction. Une seule unité de quota est consommée
    // pour l'exercice ; seuls les tokens réellement dépensés sont comptés.
    let rejectedReason: string | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const msg = await getAnthropic().messages.create({
        model: MODEL_FAST,
        // Marge au-delà d'une phrase RU+FR + quelques champs courts, même
        // logique que le fix sur ai/reading : un JSON tronqué en plein milieu
        // d'une chaîne fait échouer parseJsonResponse plutôt que de juste
        // raccourcir la réponse.
        max_tokens: 700,
        system: exerciseSystemPrompt({
          caseId,
          level: profile?.level ?? "A1",
          candidatePool: candidates.map((n) => ({ ru: n.lemma, fr: n.translation })),
          plural,
          trigger,
          recentLemmas,
          rejectedReason,
        }),
        messages: [{ role: "user", content: "Génère un exercice." }],
      });
      await recordTokens(supabase, "exercise_ai", msg.usage);
      const exercise = parseJsonResponse<AiExercise>(textFromMessage(msg));

      // Le lemme doit appartenir à la banque : un modèle peut dévier vers un
      // mot hors liste malgré la consigne, et on le rejette alors (le client
      // retombe sur le gabarit fixe, qui lui est curé).
      //
      // La vérification porte sur ce que le DÉCLENCHEUR admet, pas seulement
      // sur la banque : un mot hors échantillon mais admis par le déclencheur
      // reste parfaitement sûr (toutes ses formes sont vérifiées), un mot
      // qu'il n'admet pas produit une phrase que personne ne dirait, même
      // parfaitement déclinée. On ne renvoie ensuite que l'ID — c'est le
      // client qui recharge l'objet complet (paradigme, genre, animacité)
      // plutôt que de reconstruire un mot à partir de ce que l'IA en dit.
      const poolMatch = allowed.find((n) => n.lemma === exercise.lemma);
      if (!poolMatch) {
        rejectedReason = `le mot "${exercise.lemma}" ne figure pas dans la liste fermée`;
        console.error("exercise route: lemme hors pool du déclencheur", exercise.lemma, trigger?.id);
        continue;
      }

      // Contrôle grammatical de la phrase elle-même — le cœur du correctif.
      // Le moteur de règles calcule la réponse à partir de (cas, nombre) sans
      // jamais lire la phrase : si la phrase impose un autre cas, la « bonne
      // réponse » affichée est fausse dans cette phrase-là. Voir
      // lib/grammar/sentence-guard.ts.
      const expected = declineNoun(poolMatch, caseId, plural);
      const verdict = validateSentence({
        sentence: exercise.sentence_ru,
        targetCase: caseId,
        plural,
        trigger,
        forbiddenForms: [expected.form],
      });
      // Et le versant français : la traduction doit nommer le mot du trou.
      // Le modèle a déjà bâti une phrase sur « l'homme » pour un exercice
      // dont la réponse était « герой » — мужчина s'imposait à la lecture,
      // et était compté faux.
      const frenchVerdict = verdict.ok
        ? validateFrenchSentence({
            sentenceFr: exercise.sentence_fr,
            translation: poolMatch.translation,
          })
        : verdict;
      if (!frenchVerdict.ok) {
        rejectedReason = frenchVerdict.reason;
        console.error(
          "exercise route: phrase refusée",
          JSON.stringify({
            trigger: trigger?.id,
            caseId,
            lemma: poolMatch.lemma,
            sentence: exercise.sentence_ru,
            sentenceFr: exercise.sentence_fr,
            reason: frenchVerdict.reason,
          })
        );
        continue;
      }

      return NextResponse.json({
        sentence_ru: exercise.sentence_ru,
        sentence_fr: exercise.sentence_fr,
        noun_id: poolMatch.id,
        lemma: poolMatch.lemma,
        hint: poolMatch.translation,
      });
    }

    return NextResponse.json({ error: "Phrase générée non conforme" }, { status: 502 });
  } catch (err) {
    console.error("exercise route error", err);
    return NextResponse.json(
      { error: "Génération indisponible pour le moment." },
      { status: 502 }
    );
  }
}
