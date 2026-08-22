import { SupabaseClient } from "@supabase/supabase-js";
import { getCase } from "@/lib/grammar/cases";

const MIN_ATTEMPTS = 3;
const WEAK_THRESHOLD = 70;

// Résumé court des cas grammaticaux les moins maîtrisés (accuracy < 70%,
// avec au moins quelques tentatives pour que ce soit significatif) —
// injecté dans le prompt du professeur IA pour qu'il puisse s'appuyer sur
// la vraie progression de l'utilisateur plutôt que deviner à l'aveugle.
export async function getWeakCasesSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("case_progress")
    .select("case_id, attempts, correct")
    .eq("user_id", userId);
  if (!data || data.length === 0) return null;

  const totals: Record<string, { attempts: number; correct: number }> = {};
  for (const row of data) {
    const cur = totals[row.case_id] ?? { attempts: 0, correct: 0 };
    cur.attempts += row.attempts;
    cur.correct += row.correct;
    totals[row.case_id] = cur;
  }

  const weak = Object.entries(totals)
    .filter(([, t]) => t.attempts >= MIN_ATTEMPTS)
    .map(([caseId, t]) => ({ caseId, accuracy: Math.round((t.correct / t.attempts) * 100) }))
    .filter((c) => c.accuracy < WEAK_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  if (weak.length === 0) return null;

  return weak
    .map((c) => `${getCase(c.caseId)?.nameFr ?? c.caseId} (${c.accuracy}% de réussite)`)
    .join(", ");
}
