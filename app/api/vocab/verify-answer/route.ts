import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { translationVerificationPrompt } from "@/lib/ai/prompts";

interface VerificationResult {
  acceptable: boolean;
  reason?: string;
}

// Filet de sécurité IA pour le mode "Frappe" du vocabulaire, appelé
// uniquement quand la comparaison de chaînes (normalizeAnswer) a déjà jugé
// la réponse fausse — voir translationVerificationPrompt.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const expected = typeof body.expected === "string" ? body.expected.slice(0, 200) : "";
  const userAnswer = typeof body.userAnswer === "string" ? body.userAnswer.slice(0, 200) : "";
  const expectedLanguage = body.expectedLanguage === "fr" ? "fr" : "ru";
  if (!expected || !userAnswer) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 150,
      system: translationVerificationPrompt({ expected, userAnswer, expectedLanguage }),
      messages: [{ role: "user", content: "Vérifie cette réponse." }],
    });
    const result = parseJsonResponse<VerificationResult>(textFromMessage(msg));
    return NextResponse.json({ acceptable: result.acceptable === true, reason: result.reason ?? null });
  } catch (err) {
    console.error("vocab verify-answer route error", err);
    // Comme pour cases/verify-answer : jamais "correct" par défaut sur une
    // erreur de vérification, le résultat déterministe déjà affiché reste
    // le choix le plus sûr.
    return NextResponse.json({ acceptable: false, reason: null }, { status: 200 });
  }
}
