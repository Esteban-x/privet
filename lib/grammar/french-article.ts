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

// Le h muet compte comme une voyelle pour l'élision ("cet homme", "cet
// hôtel", "cette heure").
const VOWEL_SOUND = /^[aeiouyàâäéèêëîïôöùûüh]/i;

/**
 * Les h ASPIRÉS de la banque, qui refusent l'élision : « ce héros », jamais
 * « cet héros ».
 *
 * Un commentaire affirmait ici qu'il n'y en avait aucun. C'était faux, et
 * ça se lisait à l'écran — « J'admire cet héros ». L'aspiration n'est pas
 * dérivable de l'orthographe : elle s'écrit, mot par mot, comme le schéma
 * accentuel des noms russes.
 *
 * Exportée avec H_REVIEWED : check:grammar vérifie que tout mot de la banque
 * commençant par h figure dans l'une des deux listes, pour qu'un « hasard »
 * ou une « hache » ajoutés plus tard forcent la décision au lieu de prendre
 * l'élision par défaut.
 */
export const ASPIRATED_H = new Set(["héros"]);

/** Les h de la banque déjà tranchés — aspirés ou muets. */
export const H_REVIEWED = new Set([
  "héros",
  "homme",
  "heure",
  "hiver",
  "hôpital",
  "hôtel",
  "histoire",
  "humeur",
]);

// Pluriels français irréguliers présents dans la banque (le -eau -> -eaux
// est traité par la règle ci-dessous ; "travail" ne suit aucune des deux).
const IRREGULAR_PLURALS: Record<string, string> = { travail: "travaux" };

// Pluralise juste le premier "mot" de la traduction (avant un espace ou une
// parenthèse) — suffisant pour la petite banque de noms de ce projet, pas
// un pluralisateur français général. Couvre les cas réellement présents
// dans les données : -s/-x/-z déjà invariants (temps), -eau -> -eaux
// (couteau), sinon +s (livre, nom de famille -> noms de famille).
function pluralizeFirstWord(translation: string): string {
  const match = /^(\S+)(.*)$/.exec(translation);
  if (!match) return translation;
  const [, first, rest] = match;
  const irregular = IRREGULAR_PLURALS[first.toLowerCase()];
  if (irregular) return `${irregular}${rest}`;
  if (/[sxz]$/i.test(first)) return translation;
  if (/eau$/i.test(first)) return `${first}x${rest}`;
  return `${first}s${rest}`;
}

/**
 * Insère l'article français adapté devant une traduction, avec élision
 * (ce -> cet) et accord pluriel (ces/des + "s").
 *
 * Un paramètre `adjective` insérait ici l'adjectif accordé et placé du bon
 * côté, pour écrire la traduction des phrases d'accord assemblées. Ces
 * phrases ne sont plus assemblées : le module d'accord écrit sa traduction
 * à la main (lib/adjectives/exercises.ts), et ce module retrouve son seul
 * travail — un article devant un nom.
 */
export function frenchNounPhrase(
  translation: string,
  gender: FrenchGender,
  article: ArticleMode,
  plural: boolean
): string {
  const core = plural ? pluralizeFirstWord(translation) : translation;

  if (article === "none") return core;
  if (plural) return `${article === "indefinite" ? "des" : "ces"} ${core}`;
  if (article === "indefinite") return `${gender === "f" ? "une" : "un"} ${core}`;

  // demonstrative — élision devant voyelle ou h MUET, jamais devant un h
  // aspiré : « ce héros ».
  const aspirated = ASPIRATED_H.has(core.toLowerCase().split(/[\s(]/)[0]);
  if (gender === "m" && !aspirated && VOWEL_SOUND.test(core)) return `cet ${core}`;
  return `${gender === "f" ? "cette" : "ce"} ${core}`;
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
  const elided = filled.replace(/\bde ([aeiouyàâäéèêëîïôöùûhAEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛH])/, "d'$1");
  // Quelques gabarits commencent par le trou (« ___ a une voiture. ») :
  // la traduction sortait alors en minuscule — « ce directeur a une voiture. »
  return elided.charAt(0).toUpperCase() + elided.slice(1);
}
