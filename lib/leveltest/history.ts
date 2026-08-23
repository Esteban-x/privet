import type { SupabaseClient } from "@supabase/supabase-js";
import type { CefrLevel } from "@/lib/supabase/types";
import { freshRunsLeft } from "./engine";

/**
 * Historique des passations et règles d'accès au retest.
 *
 * Deux garde-fous, tous deux au service de la MESURE :
 *
 * - le DÉLAI : repasser le test tous les jours ne mesure rien. La progression
 *   réelle se compte en semaines, et deux passations rapprochées ne
 *   diffèrent que par le bruit. Le délai épargne aussi le vivier.
 * - les ITEMS DÉJÀ VUS : on les exclut du tirage suivant. Sans ça, un retest
 *   mesure la mémoire d'un item et de son explication, pas la compréhension —
 *   le score monte sans que le niveau bouge.
 */

/** Entre deux passations. Assez pour que la pratique ait pu déplacer quelque chose. */
export const RETEST_COOLDOWN_DAYS = 14;

export interface PastTest {
  level: CefrLevel;
  score: number;
  total: number;
  takenAt: string;
}

export interface RetestStatus {
  history: PastTest[];
  /** Items déjà posés lors des passations précédentes. */
  seenIds: string[];
  /** Passations encore possibles sans reposer d'item. */
  freshRuns: number;
  canRetake: boolean;
  /** Jours restants avant de pouvoir repasser le test, 0 si disponible. */
  daysLeft: number;
  lastLevel: CefrLevel | null;
}

interface LevelTestRow {
  result_level: CefrLevel;
  score: number;
  total: number;
  taken_at: string;
  detail: { answers?: { questionId?: unknown }[] } | null;
}

export async function loadRetestStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<RetestStatus> {
  const { data } = await supabase
    .from("level_tests")
    .select("result_level, score, total, taken_at, detail")
    .eq("user_id", userId)
    .order("taken_at", { ascending: false })
    .limit(20);

  const rows = (data ?? []) as LevelTestRow[];

  const seen = new Set<string>();
  for (const row of rows) {
    for (const answer of row.detail?.answers ?? []) {
      if (typeof answer?.questionId === "string") seen.add(answer.questionId);
    }
  }

  const history: PastTest[] = rows.map((r) => ({
    level: r.result_level,
    score: r.score,
    total: r.total,
    takenAt: r.taken_at,
  }));

  const last = rows[0];
  let daysLeft = 0;
  if (last) {
    const elapsed = (Date.now() - new Date(last.taken_at).getTime()) / 86_400_000;
    daysLeft = Math.max(0, Math.ceil(RETEST_COOLDOWN_DAYS - elapsed));
  }

  const seenIds = [...seen];
  return {
    history,
    seenIds,
    freshRuns: freshRunsLeft(seenIds),
    canRetake: daysLeft === 0,
    daysLeft,
    lastLevel: last?.result_level ?? null,
  };
}
