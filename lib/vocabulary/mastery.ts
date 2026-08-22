// Seuil de "maîtrise" d'un mot (répétitions SRS réussies consécutives) —
// centralisé ici pour éviter qu'il ne dérive entre le tableau de bord et le
// détail de liste (c'était un nombre magique dupliqué dans les deux avant).
export const MASTERY_THRESHOLD = 2;

export function isMastered(repetitions: number): boolean {
  return repetitions >= MASTERY_THRESHOLD;
}
