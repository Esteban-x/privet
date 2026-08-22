import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { exerciseSystemPrompt } from "@/lib/ai/prompts";
import { CaseId, Gender, Noun } from "@/lib/grammar/types";
import { getCase } from "@/lib/grammar/cases";
import { getTrigger, PROPER_NOUN_TRIGGER_ID } from "@/lib/grammar/triggers";
import { DECLINABLE_NOUNS } from "@/lib/grammar/exercise-generator";
import { DEFAULT_FRENCH_GENDER } from "@/lib/vocabulary/custom";

interface AiExercise {
  sentence_ru: string;
  sentence_fr: string;
  lemma: string;
  gender: "masculine" | "feminine" | "neuter";
  animate: boolean;
  hint: string;
  french_gender: "m" | "f";
  indeclinable?: boolean;
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
  // choisi (ex. песня dès que le thème est la musique, en boucle).
  const recentLemmas: string[] = Array.isArray(body.recentLemmas)
    ? body.recentLemmas.filter((w: unknown): w is string => typeof w === "string").slice(0, 12)
    : [];

  const [{ data: profile }, { data: words }] = await Promise.all([
    supabase.from("profiles").select("level, topics").eq("id", user.id).single(),
    supabase
      .from("vocab_words")
      .select("ru, fr, gender, animacy, stem_type, indeclinable, french_gender")
      .eq("user_id", user.id)
      .not("gender", "is", null)
      .limit(30),
  ]);

  // Le lemme n'est PLUS un choix libre de l'IA (voir le commentaire dans
  // exerciseSystemPrompt) : restreint à la banque curée + le vocabulaire
  // perso déjà classifié de l'apprenant, EXACTEMENT le pool des modes
  // non-IA — chaque mot y a une déclinaison déjà vérifiée (irréguliers
  // inclus pour la banque curée).
  const personalPoolNouns: Noun[] = (words ?? [])
    .filter((w) => !w.indeclinable)
    .map((w) => ({
      id: `custom:${w.ru}`,
      lemma: w.ru,
      translation: w.fr,
      frenchGender: (w.french_gender as "m" | "f" | null) ?? DEFAULT_FRENCH_GENDER,
      gender: w.gender as Gender,
      animacy: w.animacy === "animate" ? "animate" : "inanimate",
      stemType: (w.stem_type as Noun["stemType"]) ?? "hard",
    }));
  const pool: Noun[] = [...DECLINABLE_NOUNS, ...personalPoolNouns];

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
        profile?.topics ?? [],
        pool.map((n) => ({ ru: n.lemma, fr: n.translation })),
        trigger,
        recentLemmas
      ),
      messages: [{ role: "user", content: "Génère un exercice." }],
    });
    const exercise = parseJsonResponse<AiExercise>(textFromMessage(msg));

    // Revérifie que le lemme renvoyé correspond bien à une entrée du pool
    // fourni — un modèle peut malgré la consigne dévier vers un mot hors
    // liste. Si oui, ses genre/animacité/traduction sont écrasés par les
    // valeurs déjà vérifiées de cette entrée plutôt que d'être pris au mot
    // (couvre aussi le risque de mauvaise traduction française). Si non,
    // rejeté : le client retombe sur le gabarit fixe (même repli que pour
    // un emprunt indéclinable détecté côté client).
    const poolMatch = pool.find((n) => n.lemma === exercise.lemma);
    if (!poolMatch) {
      console.error("exercise route: lemme hors pool", exercise.lemma);
      return NextResponse.json({ error: "Mot hors banque vérifiée" }, { status: 502 });
    }
    exercise.gender = poolMatch.gender;
    exercise.animate = poolMatch.animacy === "animate";
    exercise.hint = poolMatch.translation;
    exercise.french_gender = poolMatch.frenchGender;
    exercise.indeclinable = false;

    // Un mot de la banque curée peut avoir des formes irrégulières
    // mémorisées (noun.irregular, ex. друг -> друзья/друзей au pluriel) —
    // perdues si le client reconstruit un Noun de zéro à partir des seuls
    // champs JSON ci-dessus. On lui renvoie l'id pour qu'il aille chercher
    // l'objet complet via getNoun() à la place (voir CaseDeclension.tsx).
    // Sans équivalent pour le vocabulaire perso, qui n'a pas cette donnée
    // en base — même limite déjà acceptée ailleurs dans l'app pour ces mots.
    const isCurated = DECLINABLE_NOUNS.some((n) => n.id === poolMatch.id);

    return NextResponse.json({
      exercise,
      pool_noun_id: isCurated ? poolMatch.id : null,
    });
  } catch (err) {
    console.error("exercise route error", err);
    return NextResponse.json(
      { error: "Génération indisponible pour le moment." },
      { status: 502 }
    );
  }
}
