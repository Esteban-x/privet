import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { exerciseSystemPrompt } from "@/lib/ai/prompts";
import { CaseId, Noun } from "@/lib/grammar/types";
import { getCase } from "@/lib/grammar/cases";
import { getTrigger, PROPER_NOUN_TRIGGER_ID } from "@/lib/grammar/triggers";
import { DECLINABLE_NOUNS } from "@/lib/grammar/exercise-generator";

// La banque compte plusieurs centaines de mots : l'envoyer entière à chaque
// exercice coûterait ~2 000 tokens de prompt et pousserait le modèle vers
// les mêmes têtes de liste. On tire un échantillon à chaque appel — moins
// cher, et surtout réellement varié d'un exercice à l'autre.
const SAMPLE_SIZE = 40;

function buildCandidatePool(recentLemmas: string[]): Noun[] {
  const recent = new Set(recentLemmas);
  const available = DECLINABLE_NOUNS.filter((n) => !recent.has(n.lemma));
  const pool = available.length >= SAMPLE_SIZE ? available : DECLINABLE_NOUNS;

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
  const candidates = buildCandidatePool(recentLemmas);

  try {
    // "Меня зовут ___" ne devrait jamais atteindre cette route (le client
    // le contourne entièrement, voir CaseDeclension.tsx) — filet de
    // sécurité si jamais un triggerId périmé arrivait quand même ici.
    if (trigger?.id === PROPER_NOUN_TRIGGER_ID) {
      return NextResponse.json({ error: "Déclencheur non IA" }, { status: 400 });
    }

    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      // Marge au-delà d'une phrase RU+FR + quelques champs courts, même
      // logique que le fix sur ai/reading : un JSON tronqué en plein milieu
      // d'une chaîne fait échouer parseJsonResponse plutôt que de juste
      // raccourcir la réponse.
      max_tokens: 700,
      system: exerciseSystemPrompt(
        caseId,
        profile?.level ?? "A1",
        candidates.map((n) => ({ ru: n.lemma, fr: n.translation })),
        trigger,
        recentLemmas
      ),
      messages: [{ role: "user", content: "Génère un exercice." }],
    });
    const exercise = parseJsonResponse<AiExercise>(textFromMessage(msg));

    // Le lemme doit appartenir à la banque : un modèle peut dévier vers un
    // mot hors liste malgré la consigne, et on le rejette alors (le client
    // retombe sur le gabarit fixe). La vérification porte sur la banque
    // ENTIÈRE et pas seulement sur l'échantillon proposé : un mot de la
    // banque hors échantillon reste parfaitement sûr, toutes ses formes sont
    // vérifiées. On ne renvoie ensuite que l'ID — c'est le client qui
    // recharge l'objet complet (paradigme, genre, animacité) plutôt que de
    // reconstruire un mot à partir de ce que l'IA en dit.
    const poolMatch = DECLINABLE_NOUNS.find((n) => n.lemma === exercise.lemma);
    if (!poolMatch) {
      console.error("exercise route: lemme hors pool", exercise.lemma);
      return NextResponse.json({ error: "Mot hors banque vérifiée" }, { status: 502 });
    }

    return NextResponse.json({
      sentence_ru: exercise.sentence_ru,
      sentence_fr: exercise.sentence_fr,
      noun_id: poolMatch.id,
      lemma: poolMatch.lemma,
      hint: poolMatch.translation,
    });
  } catch (err) {
    console.error("exercise route error", err);
    return NextResponse.json(
      { error: "Génération indisponible pour le moment." },
      { status: 502 }
    );
  }
}
