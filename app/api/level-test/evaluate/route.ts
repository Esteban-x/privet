import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { levelFromScore } from "@/lib/ai/prompts";

// Reçoit le score du test (calculé côté client à partir de questions
// déterministes), en déduit un niveau CEFR, et l'enregistre.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const score = Number(body.score);
  const total = Number(body.total);
  const detail = body.detail ?? null;

  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: "Score invalide" }, { status: 400 });
  }

  const level = levelFromScore(score, total);

  await supabase.from("level_tests").insert({
    user_id: user.id,
    score,
    total,
    result_level: level,
    detail,
  });

  await supabase
    .from("profiles")
    .update({ level, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ level });
}
