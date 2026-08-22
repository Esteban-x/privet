import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Progrès de l'objectif quotidien de vocabulaire (façon Duolingo) : combien
// de révisions aujourd'hui vs l'objectif configuré sur le profil. Le
// "aujourd'hui" est calculé en UTC (même convention que streak_last dans
// lib/progress/streak.ts) — volontairement simple, pas de fuseau horaire
// par utilisateur.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ reviewedToday: 0, goal: 15 });

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from("activity_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "vocab")
      .gte("created_at", startOfDay.toISOString()),
    supabase.from("profiles").select("vocab_daily_goal").eq("id", user.id).single(),
  ]);

  return NextResponse.json({
    reviewedToday: count ?? 0,
    goal: profile?.vocab_daily_goal ?? 15,
  });
}
