import type { SupabaseClient } from "@supabase/supabase-js";
import type { CefrLevel } from "@/lib/supabase/types";
import type { CaseId } from "@/lib/grammar/types";
import { CASES } from "@/lib/grammar/cases";
import { TRIGGERS, type TriggerTier } from "@/lib/grammar/triggers";
import { MASTERY_ACCURACY, MASTERY_MIN_ATTEMPTS_EACH } from "@/lib/grammar/exercise-selector";

/**
 * Niveau de PRATIQUE : ce que la progression réelle démontre, par opposition
 * au niveau TESTÉ (profiles.level), qui est une photo prise une fois.
 *
 * Pourquoi les deux coexistent :
 * - le test mesure la LARGEUR (aspect, verbes de mouvement, participes — que
 *   l'app n'entraîne nulle part), en une douzaine de questions à choix
 *   multiple, donc en reconnaissance ;
 * - la pratique mesure la PROFONDEUR sur ce que l'app entraîne vraiment,
 *   sur des centaines de réponses produites, pas reconnues.
 *
 * Aucun des deux ne remplace l'autre. Les afficher côte à côte est plus
 * honnête que d'en fabriquer un seul chiffre, et l'écart entre les deux est
 * précisément le signal qui indique qu'il est temps de repasser le test.
 *
 * Le calcul reprend la MÊME définition de la maîtrise que le tirage des
 * exercices (lib/grammar/exercise-selector.ts) : un déclencheur est maîtrisé
 * quand le sélecteur cesse de le proposer en priorité. Sans ça, le tableau
 * de bord dirait « acquis » pendant que les exercices continuent d'insister.
 */

export interface TriggerProgressRow {
  trigger_id: string;
  attempts: number;
  correct: number;
}

export interface CaseProgressRow {
  case_id: string;
  attempts: number;
  correct: number;
}

export type CaseState = "untouched" | "started" | "solid";

export interface CaseMastery {
  caseId: CaseId;
  attempts: number;
  /** null tant qu'aucune tentative n'a été faite. */
  accuracy: number | null;
  masteredTriggers: number;
  totalTriggers: number;
  state: CaseState;
}

export interface TierMastery {
  tier: TriggerTier;
  mastered: number;
  total: number;
}

export interface LevelEstimate {
  /** Niveau déduit de la pratique. */
  level: CefrLevel;
  masteredTriggers: number;
  totalTriggers: number;
  tiers: TierMastery[];
  cases: CaseMastery[];
  /** Mots dont l'intervalle de révision montre une vraie mémorisation. */
  vocabKnown: number;
  /** Assez de pratique pour que l'estimation veuille dire quelque chose. */
  meaningful: boolean;
}

/** Un déclencheur est maîtrisé s'il a été assez pratiqué ET assez réussi. */
function isMastered(row: { attempts: number; correct: number } | undefined): boolean {
  if (!row || row.attempts < MASTERY_MIN_ATTEMPTS_EACH) return false;
  return row.correct / row.attempts >= MASTERY_ACCURACY;
}

/**
 * Seuils du niveau de pratique, exprimés en PART des déclencheurs maîtrisés
 * de chaque palier. Deux principes repris du test de placement :
 * un niveau se valide (il ne se touche pas), et il faut avoir consolidé le
 * palier précédent avant que le suivant compte.
 */
const THRESHOLDS: { level: CefrLevel; basic: number; intermediate: number; advanced: number }[] = [
  { level: "C1", basic: 0.8, intermediate: 0.7, advanced: 0.55 },
  { level: "B2", basic: 0.8, intermediate: 0.55, advanced: 0.2 },
  { level: "B1", basic: 0.7, intermediate: 0.25, advanced: 0 },
  { level: "A2", basic: 0.45, intermediate: 0, advanced: 0 },
  { level: "A1", basic: 0.15, intermediate: 0, advanced: 0 },
];

/** En dessous, on n'affiche pas d'estimation : ce serait du bruit. */
const MIN_ATTEMPTS_FOR_ESTIMATE = 30;

export function computeLevelEstimate(
  triggerRows: TriggerProgressRow[],
  caseRows: CaseProgressRow[],
  vocabKnown: number
): LevelEstimate {
  const byTrigger = new Map(triggerRows.map((r) => [r.trigger_id, r]));

  const tierOrder: TriggerTier[] = ["basic", "intermediate", "advanced"];
  const tiers: TierMastery[] = tierOrder.map((tier) => {
    const all = TRIGGERS.filter((t) => t.tier === tier);
    return {
      tier,
      total: all.length,
      mastered: all.filter((t) => isMastered(byTrigger.get(t.id))).length,
    };
  });
  const ratio = (tier: TriggerTier) => {
    const t = tiers.find((x) => x.tier === tier)!;
    return t.total === 0 ? 0 : t.mastered / t.total;
  };

  const caseTotals = new Map<string, { attempts: number; correct: number }>();
  for (const row of caseRows) {
    const cur = caseTotals.get(row.case_id) ?? { attempts: 0, correct: 0 };
    cur.attempts += row.attempts;
    cur.correct += row.correct;
    caseTotals.set(row.case_id, cur);
  }

  const cases: CaseMastery[] = CASES.map((c) => {
    const totals = caseTotals.get(c.id) ?? { attempts: 0, correct: 0 };
    const caseTriggers = TRIGGERS.filter((t) => t.caseId === c.id);
    const masteredTriggers = caseTriggers.filter((t) => isMastered(byTrigger.get(t.id))).length;
    const accuracy = totals.attempts > 0 ? totals.correct / totals.attempts : null;

    // « Solide » veut dire : assez de déclencheurs de ce cas réellement
    // maîtrisés, et une précision globale qui tient. Un cas où l'on a
    // beaucoup répondu au hasard n'est pas solide.
    const solid =
      masteredTriggers >= Math.min(3, caseTriggers.length) &&
      accuracy !== null &&
      accuracy >= 0.75;
    const state: CaseState = totals.attempts === 0 ? "untouched" : solid ? "solid" : "started";

    return {
      caseId: c.id,
      attempts: totals.attempts,
      accuracy,
      masteredTriggers,
      totalTriggers: caseTriggers.length,
      state,
    };
  });

  const totalAttempts = cases.reduce((sum, c) => sum + c.attempts, 0);
  const matched = THRESHOLDS.find(
    (t) =>
      ratio("basic") >= t.basic &&
      ratio("intermediate") >= t.intermediate &&
      ratio("advanced") >= t.advanced
  );

  return {
    level: matched?.level ?? "A0",
    masteredTriggers: tiers.reduce((sum, t) => sum + t.mastered, 0),
    totalTriggers: TRIGGERS.length,
    tiers,
    cases,
    vocabKnown,
    meaningful: totalAttempts >= MIN_ATTEMPTS_FOR_ESTIMATE,
  };
}

/** Un mot est « su » quand la révision espacée l'a repoussé à 21 jours ou plus. */
const KNOWN_INTERVAL_DAYS = 21;

export async function loadLevelEstimate(
  supabase: SupabaseClient,
  userId: string
): Promise<LevelEstimate> {
  const [{ data: triggerRows }, { data: caseRows }, { count: vocabKnown }] = await Promise.all([
    supabase
      .from("case_trigger_progress")
      .select("trigger_id, attempts, correct")
      .eq("user_id", userId),
    supabase.from("case_progress").select("case_id, attempts, correct").eq("user_id", userId),
    supabase
      .from("srs_cards")
      .select("card_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("interval_days", KNOWN_INTERVAL_DAYS),
  ]);

  return computeLevelEstimate(triggerRows ?? [], caseRows ?? [], vocabKnown ?? 0);
}
