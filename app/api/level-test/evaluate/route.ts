import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateAnswers, type TestAnswer } from "@/lib/leveltest/engine";

/**
 * Reçoit le déroulé du test de placement et en déduit le niveau CEFR.
 *
 * Le client n'envoie QUE des couples (questionId, réponse choisie) : ni le
 * fait d'avoir eu juste, ni le niveau. Le serveur rejoue intégralement le
 * calcul avec `evaluateAnswers` — même fonction pure que côté client — en
 * comparant chaque réponse au vivier (lib/leveltest/questions.ts). Un client
 * ne peut donc pas s'attribuer un niveau : il faudrait pour cela produire
 * les bonnes réponses aux items du palier visé.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const raw = Array.isArray(body.detail?.answers) ? body.detail.answers : [];

  const answers: TestAnswer[] = raw
    .filter((a: unknown): a is Record<string, unknown> => typeof a === "object" && a !== null)
    .map((a: Record<string, unknown>) => ({
      questionId: typeof a.questionId === "string" ? a.questionId : "",
      selectedIndex: Number(a.selectedIndex),
    }))
    .filter((a: TestAnswer) => a.questionId !== "" && Number.isInteger(a.selectedIndex));

  if (answers.length === 0) {
    return NextResponse.json({ error: "Réponses invalides" }, { status: 400 });
  }

  const result = evaluateAnswers(answers);
  if (result.total === 0) {
    return NextResponse.json({ error: "Réponses invalides" }, { status: 400 });
  }

  await supabase.from("level_tests").insert({
    user_id: user.id,
    score: result.score,
    total: result.total,
    result_level: result.level,
    // Le détail par palier explique le niveau obtenu : utile pour un
    // historique lisible, et pour diagnostiquer un placement contesté.
    detail: { answers, tiers: result.tiers },
  });

  await supabase
    .from("profiles")
    .update({ level: result.level, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ level: result.level, score: result.score, total: result.total });
}
