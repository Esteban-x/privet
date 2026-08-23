import { CefrLevel } from "@/lib/supabase/types";
import { CaseTrigger, TriggerTier } from "./triggers";

export interface TriggerStat {
  attempts: number;
  correct: number;
}

export type TriggerProgressMap = Record<string, TriggerStat>; // clé = trigger.id

// Sélection pondérée simple (pas un SRS complet — le drilling de cas est du
// tir rapide, pas de la révision espacée) : un déclencheur jamais vu passe
// en priorité, puis on favorise ceux au taux de réussite le plus faible.
// Un déclencheur maîtrisé garde une petite chance de revenir (poids
// plancher) pour ne pas disparaître complètement de la rotation.
function accuracyWeight(trigger: CaseTrigger, progress: TriggerProgressMap): number {
  const stat = progress[trigger.id];
  if (!stat || stat.attempts === 0) return 3;
  const accuracy = stat.correct / stat.attempts;
  return Math.max(0.15, 1 - accuracy * 0.85);
}

// 3 paliers de déclencheurs (voir triggers.ts) mappés sur 3 étapes de
// progression CEFR plutôt que 6 crans fins — assez pour biaiser le tirage
// sans sur-ingénierie. Un cran au-dessus reste possible mais rare
// (exposition progressive), jamais totalement exclu.
const TIER_RANK: Record<TriggerTier, number> = { basic: 0, intermediate: 1, advanced: 2 };
const LEVEL_STAGE: Record<CefrLevel, number> = { A0: 0, A1: 0, A2: 1, B1: 1, B2: 2, C1: 2, C2: 2 };
const MAX_STAGE = 2;

// Seuils de "maîtrise" pour débloquer le palier suivant plus tôt que le
// niveau du profil ne le suggère — au moins quelques déclencheurs
// DIFFÉRENTS du palier, chacun essayé plusieurs fois, avec une bonne
// précision globale. Un seul mot réussi par chance ne suffit pas.
const MASTERY_MIN_TRIGGERS = 3;
const MASTERY_MIN_ATTEMPTS_EACH = 3;
const MASTERY_ACCURACY = 0.85;

function stageMastered(stage: number, triggers: CaseTrigger[], progress: TriggerProgressMap): boolean {
  const attempted = triggers.filter(
    (t) => TIER_RANK[t.tier] === stage && (progress[t.id]?.attempts ?? 0) >= MASTERY_MIN_ATTEMPTS_EACH
  );
  if (attempted.length < MASTERY_MIN_TRIGGERS) return false;

  let totalAttempts = 0;
  let totalCorrect = 0;
  for (const t of attempted) {
    const stat = progress[t.id]!;
    totalAttempts += stat.attempts;
    totalCorrect += stat.correct;
  }
  return totalCorrect / totalAttempts >= MASTERY_ACCURACY;
}

// Le palier "effectif" part du niveau CEFR du profil mais monte tant que
// l'utilisateur démontre une vraie maîtrise du palier courant SUR CE CAS
// précis — plus réactif qu'un niveau de profil figé, qui ne reflète pas
// forcément la pratique réelle sur un cas donné (ex. un A1 qui a beaucoup
// pratiqué le génitif spécifiquement peut être prêt pour "вопреки" avant
// que son niveau global ne change).
function effectiveStage(baseStage: number, triggers: CaseTrigger[], progress: TriggerProgressMap): number {
  let stage = baseStage;
  while (stage < MAX_STAGE && stageMastered(stage, triggers, progress)) {
    stage += 1;
  }
  return stage;
}

function tierWeight(tier: TriggerTier, stage: number | undefined): number {
  if (stage === undefined) return 1; // pas de niveau connu (déconnecté, etc.) : aucun biais
  const gap = TIER_RANK[tier] - stage;
  if (gap <= 0) return 1;
  return gap === 1 ? 0.35 : 0.1;
}

export function pickWeightedTrigger(
  triggers: CaseTrigger[],
  progress: TriggerProgressMap,
  level?: CefrLevel
): CaseTrigger {
  if (triggers.length === 0) throw new Error("Aucun déclencheur disponible");
  const stage = level ? effectiveStage(LEVEL_STAGE[level], triggers, progress) : undefined;
  const weights = triggers.map((t) => accuracyWeight(t, progress) * tierWeight(t.tier, stage));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < triggers.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return triggers[i];
  }
  return triggers[triggers.length - 1];
}
