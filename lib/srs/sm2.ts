// Implémentation simplifiée de l'algorithme SM-2 (SuperMemo 2).
// Chaque carte a un facteur de facilité (easeFactor), un intervalle (en jours)
// et un nombre de répétitions réussies consécutives.

export interface SrsCard {
  id: string;
  easeFactor: number; // >= 1.3
  intervalDays: number;
  repetitions: number;
  dueAt: number; // timestamp ms
  lastReviewedAt: number | null;
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5; // 0-2 = échec, 3-5 = réussite

export function createNewCard(id: string): SrsCard {
  return {
    id,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: Date.now(),
    lastReviewedAt: null,
  };
}

export function reviewCard(card: SrsCard, quality: Quality): SrsCard {
  const now = Date.now();

  if (quality < 3) {
    // Échec : on recommence la progression mais on garde l'ease factor (légèrement pénalisé)
    return {
      ...card,
      repetitions: 0,
      intervalDays: 1,
      easeFactor: Math.max(1.3, card.easeFactor - 0.2),
      dueAt: now + 1 * 24 * 60 * 60 * 1000,
      lastReviewedAt: now,
    };
  }

  const repetitions = card.repetitions + 1;
  let intervalDays: number;
  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = 6;
  else intervalDays = Math.round(card.intervalDays * card.easeFactor);

  const easeFactor = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    ...card,
    repetitions,
    intervalDays,
    easeFactor,
    dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
    lastReviewedAt: now,
  };
}

export function isDue(card: SrsCard): boolean {
  return card.dueAt <= Date.now();
}
