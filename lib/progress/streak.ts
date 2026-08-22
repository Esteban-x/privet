import type { createClient } from "@/lib/supabase/server";

// Série de jours consécutifs + XP total : mis à jour à chaque activité
// notée (cas, vocabulaire, lecture...) pour que "Série" et "XP total" sur
// le tableau de bord reflètent une vraie activité plutôt que de rester à 0.
export async function bumpStreakAndXp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  xpGain: number
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, streak_last, xp")
    .eq("id", userId)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const last = profile?.streak_last ?? null;

  let streakCount = profile?.streak_count ?? 0;
  if (last === today) {
    // Déjà comptée aujourd'hui, la série ne bouge pas.
  } else if (last === previousDay(today)) {
    streakCount += 1;
  } else {
    streakCount = 1;
  }

  await supabase
    .from("profiles")
    .update({
      streak_count: streakCount,
      streak_last: today,
      xp: (profile?.xp ?? 0) + xpGain,
    })
    .eq("id", userId);
}

function previousDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
