import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { readingSystemPrompt } from "@/lib/ai/prompts";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("level, topics")
    .eq("id", user.id)
    .single();

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 1200,
      system: readingSystemPrompt(profile?.level ?? "A1", profile?.topics ?? []),
      messages: [{ role: "user", content: "Écris un texte de lecture gradué." }],
    });
    const text = parseJsonResponse(textFromMessage(msg));
    return NextResponse.json({ text });
  } catch (err) {
    console.error("reading route error", err);
    return NextResponse.json(
      { error: "Génération indisponible pour le moment." },
      { status: 502 }
    );
  }
}
