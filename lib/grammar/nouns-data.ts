import { Noun } from "./types";
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
