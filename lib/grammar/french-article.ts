import { FrenchGender } from "./types";

// Mode d'article à appliquer devant la traduction française insérée dans
// un gabarit de phrase (lib/grammar/triggers.ts) :
// - "none"         : le gabarit gère déjà l'article lui-même (ex. "des ___"
//                    déjà écrit en dur) ou l'usage français est idiomatiquement
//                    sans article (partitif après une expression de quantité :
//                    "beaucoup de ___", "un morceau de ___", "au lieu de ___").
// - "indefinite"    : un/une — identification/classification ("C'est ___.").
// - "demonstrative" : ce/cet/cette/ces — cas par défaut pour tout le reste
//                     (complément d'objet, complément prépositionnel...) ;
//                     ne se contracte jamais avec une préposition précédente
//                     (de/à + ce/cette reste "de ce", jamais "du"), ce qui
//                     évite d'avoir à gérer les contractions au cas par cas.
export type ArticleMode = "none" | "indefinite" | "demonstrative";

const VOWEL_SOUND = /^[aeiouyàâäéèêëîïôöùûü]/i;

// Pluralise juste le premier "mot" de la traduction (avant un espace ou une
// parenthèse) — suffisant pour la petite banque de noms de ce projet, pas
// un pluralisateur français général. Couvre les cas réellement présents
// dans les données : -s/-x/-z déjà invariants (temps), -eau -> -eaux
// (couteau), sinon +s (livre, nom de famille -> noms de famille).
function pluralizeFirstWord(translation: string): string {
  const match = /^(\S+)(.*)$/.exec(translation);
  if (!match) return translation;
  const [, first, rest] = match;
  if (/[sxz]$/i.test(first)) return translation;
  if (/eau$/i.test(first)) return `${first}x${rest}`;
  return `${first}s${rest}`;
}

/** Insère l'article français adapté devant une traduction, avec élision (ce -> cet) et accord pluriel (ces/des + "s"). */
export function frenchNounPhrase(
  translation: string,
  gender: FrenchGender,
  article: ArticleMode,
  plural: boolean
): string {
  if (article === "none") return plural ? pluralizeFirstWord(translation) : translation;

  if (plural) {
    return `${article === "indefinite" ? "des" : "ces"} ${pluralizeFirstWord(translation)}`;
  }

  if (article === "indefinite") {
    return `${gender === "f" ? "une" : "un"} ${translation}`;
  }

  // demonstrative
  if (gender === "m" && VOWEL_SOUND.test(translation)) return `cet ${translation}`;
  return `${gender === "f" ? "cette" : "ce"} ${translation}`;
}

/**
 * Insère `phrase` à la place de "___" dans un gabarit français, puis
 * corrige l'élision "de" -> "d'" quand elle se retrouve juste avant un mot
 * commençant par une voyelle (mode "none" : "J'ai peu de ___." + "endroit"
 * doit donner "J'ai peu d'endroit.", jamais "de endroit"). Sans effet sur
 * les autres articles (ce/cette/un/une ne s'élident jamais devant "de").
 */
export function fillFrenchBlank(templateFr: string, phrase: string): string {
  const filled = templateFr.replace("___", phrase);
  return filled.replace(/\bde ([aeiouyàâäéèêëîïôöùûhAEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛH])/, "d'$1");
}
