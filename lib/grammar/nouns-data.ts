import { Noun } from "./types";
import type { CefrLevel } from "@/lib/supabase/types";
import { GENERATED_NOUNS } from "./nouns-data.generated";

/**
 * Banque de noms du module "Cas".
 *
 * Le contenu vient de `nouns-data.generated.ts` (`npm run build:nouns`) :
 * paradigmes + accents toniques importés du dictionnaire OpenRussian,
 * traductions françaises et thèmes écrits à la main dans
 * scripts/data/nouns-fr.tsv. Rien n'est ajouté ici à la main — un mot dont
 * les formes n'ont pas été importées afficherait une déclinaison inventée.
 */
export const NOUNS: Noun[] = GENERATED_NOUNS;

const BY_ID = new Map(NOUNS.map((n) => [n.id, n]));

export function getNoun(id: string): Noun | undefined {
  return BY_ID.get(id);
}

// Banque triée du plus courant au plus rare, calculée une fois.
const BY_FREQUENCY = [...NOUNS].sort((a, b) => a.rank - b.rank);

/**
 * Part de la banque ouverte à chaque niveau, du plus courant au plus rare.
 *
 * Exprimée en proportion et non en rang absolu : la banque peut grandir ou
 * changer de composition sans que ces seuils deviennent faux. Un débutant
 * décline дом et книга, un avancé croise впечатление et обстоятельство —
 * décliner juste un mot qu'on ne comprend pas n'apprend pas grand-chose.
 *
 * Personne n'est privé de mots : au pire la part est réduite, jamais vide.
 */
const LEVEL_SHARE: Record<CefrLevel, number> = {
  A0: 0.25,
  A1: 0.4,
  A2: 0.6,
  B1: 0.8,
  B2: 1,
  C1: 1,
  C2: 1,
};

/** Sous-ensemble de la banque adapté au niveau. `undefined` = toute la banque. */
export function nounsForLevel(level?: CefrLevel): Noun[] {
  if (!level) return NOUNS;
  const share = LEVEL_SHARE[level] ?? 1;
  if (share >= 1) return NOUNS;
  return BY_FREQUENCY.slice(0, Math.max(40, Math.round(BY_FREQUENCY.length * share)));
}
