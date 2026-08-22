import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deriveLevelFromAnswers, getQuestion } from "@/lib/leveltest/questions";

// Reçoit le déroulé du test adaptatif (calculé côté client à partir de
// questions déterministes), en déduit un niveau CEFR, et l'enregistre.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const rawAnswers = Array.isArray(body.detail?.answers) ? body.detail.answers : [];

  // `correct` n'est JAMAIS pris tel quel du client : chaque réponse est
  // ré-identifiée par son `questionId` dans le vivier de questions
  // (lib/leveltest/questions.ts) et comparée à `correctIndex` — un client
  // qui déclarerait "correct:true" sans avoir vraiment la bonne réponse ne
  // peut donc pas gonfler son niveau CEFR. Une entrée dont l'id est inconnu
  // ou dont le `tier` ne correspond pas à la vraie question est ignorée
  // plutôt que comptée.
  const answers: { tier: number; correct: boolean }[] = rawAnswers
    .filter(
      (a: unknown): a is { questionId: unknown; selectedIndex: unknown; tier: unknown } =>
        typeof a === "object" && a !== null
    )
    .map((a: { questionId: unknown; selectedIndex: unknown; tier: unknown }) => {
      const question = typeof a.questionId === "string" ? getQuestion(a.questionId) : undefined;
      if (!question || question.tier !== Number(a.tier)) return null;
      const selectedIndex = Number(a.selectedIndex);
      return { tier: question.tier, correct: selectedIndex === question.correctIndex };
    })
    .filter(
      (a: { tier: number; correct: boolean } | null): a is { tier: number; correct: boolean } =>
        a !== null
    );

  if (answers.length === 0) {
    return NextResponse.json({ error: "Réponses invalides" }, { status: 400 });
  }

  const score = answers.filter((a) => a.correct).length;
  const total = answers.length;

  // Le niveau se déduit du déroulé adaptatif (paliers réellement atteints),
  // pas d'un pourcentage — voir deriveLevelFromAnswers.
  const level = deriveLevelFromAnswers(answers);

  await supabase.from("level_tests").insert({
    user_id: user.id,
    score,
    total,
    result_level: level,
    detail: body.detail ?? null,
  });

  await supabase
    .from("profiles")
    .update({ level, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ level });
}
