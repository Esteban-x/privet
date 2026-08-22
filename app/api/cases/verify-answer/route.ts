import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { answerVerificationPrompt } from "@/lib/ai/prompts";

interface VerificationResult {
  acceptable: boolean;
  reason?: string;
}

// Filet de sécurité IA pour une réponse déjà jugée "fausse" par le moteur de
// règles (voir le commentaire sur answerVerificationPrompt) — appelé UNE
// fois par réponse ratée, jamais pour une réponse déjà acceptée par la
// comparaison de chaînes (checkAnswer), qui reste gratuite et immédiate.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const lemma = typeof body.lemma === "string" ? body.lemma.slice(0, 100) : "";
  const targetCase = typeof body.targetCase === "string" ? body.targetCase.slice(0, 40) : "";
  const computedForm = typeof body.computedForm === "string" ? body.computedForm.slice(0, 200) : "";
  const userAnswer = typeof body.userAnswer === "string" ? body.userAnswer.slice(0, 200) : "";
  if (!lemma || !targetCase || !computedForm || !userAnswer) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }
  const gender = typeof body.gender === "string" ? body.gender : "masculine";
  const animacy = body.animacy === "animate" ? "animate" : "inanimate";
  const plural = body.plural === true;

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 150,
      system: answerVerificationPrompt({ lemma, gender, animacy, targetCase, plural, computedForm, userAnswer }),
      messages: [{ role: "user", content: "Vérifie cette réponse." }],
    });
    const result = parseJsonResponse<VerificationResult>(textFromMessage(msg));
    return NextResponse.json({ acceptable: result.acceptable === true, reason: result.reason ?? null });
  } catch (err) {
    console.error("verify-answer route error", err);
    // Échec de la vérification IA : on NE marque JAMAIS "correct" par
    // défaut sur une erreur réseau/parsing — le résultat déterministe déjà
    // affiché (incorrect) reste la réponse la plus sûre plutôt que de
    // risquer d'accepter à tort quelque chose de faux.
    return NextResponse.json({ acceptable: false, reason: null }, { status: 200 });
  }
}
