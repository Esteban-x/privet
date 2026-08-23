import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { translationVerificationPrompt } from "@/lib/ai/prompts";
import { matchesAnswer } from "@/lib/vocabulary/answer-check";
import { recordVocabReview } from "@/lib/vocabulary/record-review";
import type { Quality } from "@/lib/srs/sm2";

/**
 * SEULE AUTORITÉ sur la justesse d'une réponse de vocabulaire en frappe et
 * en QCM — même rôle que /api/cases/attempt pour les déclinaisons.
 *
 * Auparavant le client comparait lui-même et envoyait la note à
 * /api/vocab/srs (`review(picked === correctAnswer ? 4 : 1)`). L'app juge
 * donc désormais à un seul endroit : le serveur relit le mot dans
 * vocab_words, compare, et déduit la note. Le client n'envoie que ce que
 * l'apprenant a produit.
 *
 * La révélation volontaire (« je ne sais pas ») reste déclarée par le
 * client : elle ne prétend à aucune justesse, elle demande seulement à
 * compter comme un échec.
 *
 * L'auto-évaluation des cartes retournées et du mode oral passe, elle,
 * toujours par /api/vocab/srs : il n'y a là rien à vérifier, l'apprenant
 * est le seul à savoir s'il s'est souvenu.
 */

interface VerificationResult {
  acceptable: boolean;
  reason?: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const cardId = typeof body.cardId === "string" ? body.cardId : "";
  const userAnswer = typeof body.userAnswer === "string" ? body.userAnswer.slice(0, 200) : "";
  const expectedLanguage = body.expectedLanguage === "fr" ? "fr" : "ru";
  const mode = body.mode === "qcm" ? "qcm" : "typing";
  const revealed = body.revealed === true;

  if (!cardId) return NextResponse.json({ error: "cardId requis" }, { status: 400 });
  if (!revealed && !userAnswer) {
    return NextResponse.json({ error: "Réponse vide" }, { status: 400 });
  }

  // Le mot est relu en base, filtré sur user_id : le client ne fournit
  // jamais l'attendu, et ne peut pas non plus faire noter le mot d'un autre.
  const { data: word } = await supabase
    .from("vocab_words")
    .select("ru, fr")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (!word) return NextResponse.json({ error: "Mot introuvable" }, { status: 404 });

  const expected = expectedLanguage === "ru" ? word.ru : word.fr;

  let correct = false;
  let aiAccepted = false;
  if (!revealed) {
    correct = matchesAnswer(userAnswer, expected);
    // Filet de sécurité IA, réservé à la frappe : en QCM la réponse est
    // l'une des options proposées, la comparaison est donc exacte par
    // construction et il n'y a rien à rattraper. En frappe, elle couvre un
    // synonyme juste ou une variante orthographique. Ne coûte des tokens
    // que sur une réponse déjà jugée fausse.
    if (!correct && mode === "typing") {
      aiAccepted = await secondOpinion(expected, userAnswer, expectedLanguage);
      correct = aiAccepted;
    }
  }

  // 4 plutôt que 5 : une réponse juste du premier coup sans hésitation
  // mesurable ne justifie pas la note maximale, qui allongerait trop vite
  // l'intervalle. 1 pour une erreur ou un aveu d'ignorance — la carte
  // repart à zéro, ce que fait reviewCard pour toute note < 3.
  const quality: Quality = correct ? 4 : 1;

  const result = await recordVocabReview(supabase, user.id, {
    cardId,
    quality,
    wordRu: word.ru,
    wordFr: word.fr,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({
    correct,
    revealed,
    aiAccepted,
    expected,
    card: result.card,
  });
}

async function secondOpinion(
  expected: string,
  userAnswer: string,
  expectedLanguage: "ru" | "fr"
): Promise<boolean> {
  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 150,
      system: translationVerificationPrompt({ expected, userAnswer, expectedLanguage }),
      messages: [{ role: "user", content: "Vérifie cette réponse." }],
    });
    return parseJsonResponse<VerificationResult>(textFromMessage(msg)).acceptable === true;
  } catch (err) {
    console.error("vocab answer: échec de la seconde vérification", err);
    // Jamais « correct » par défaut sur une erreur de vérification : le
    // verdict déterministe reste le choix le plus sûr.
    return false;
  }
}
