import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { exerciseSystemPrompt } from "@/lib/ai/prompts";
import { CaseId } from "@/lib/grammar/types";
import { getCase } from "@/lib/grammar/cases";
import { getTrigger } from "@/lib/grammar/triggers";

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

  // Contexte de personnalisation depuis le profil + un échantillon du
  // vocabulaire perso, pour orienter l'IA vers du réemploi lexical connu.
  const [{ data: profile }, { data: words }] = await Promise.all([
    supabase.from("profiles").select("level, topics").eq("id", user.id).single(),
    supabase.from("vocab_words").select("ru, fr").eq("user_id", user.id).limit(20),
  ]);

  try {
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
        trigger,
        words ?? []
      ),
      messages: [{ role: "user", content: "Génère un exercice." }],
    });
    const exercise = parseJsonResponse<AiExercise>(textFromMessage(msg));
    return NextResponse.json({ exercise });
  } catch (err) {
    console.error("exercise route error", err);
    return NextResponse.json(
      { error: "Génération indisponible pour le moment." },
      { status: 502 }
    );
  }
}
