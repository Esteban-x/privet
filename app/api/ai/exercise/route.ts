import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { exerciseSystemPrompt } from "@/lib/ai/prompts";
import { CaseId } from "@/lib/grammar/types";
import { getCase } from "@/lib/grammar/cases";

interface AiExercise {
  sentence_ru: string;
  sentence_fr: string;
  lemma: string;
  hint: string;
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

  // Contexte de personnalisation depuis le profil.
  const { data: profile } = await supabase
    .from("profiles")
    .select("level, topics")
    .eq("id", user.id)
    .single();

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 400,
      system: exerciseSystemPrompt(caseId, profile?.level ?? "A1", profile?.topics ?? []),
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
