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
// hôtel"). Aucun h aspiré dans les traductions de la banque curée.
const VOWEL_SOUND = /^[aeiouyàâäéèêëîïôöùûüh]/i;

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
 * Formes françaises d'un adjectif — voir `fr` dans lib/grammar/types.ts.
 * Reprise ici plutôt qu'importée pour garder ce module sans dépendance sur
 * la banque d'adjectifs.
 */
export interface FrenchAdjectiveForms {
  m: string;
  f: string;
  mVowel?: string;
  position: "before" | "after";
}

/**
 * Pluriel d'un adjectif français. Les dix-huit adjectifs de la banque sont
 * tous réguliers de ce point de vue : -s/-x déjà invariants (vieux,
 * mauvais), -eau -> -eaux (beau, nouveau), sinon +s. Le féminin prend
 * toujours un -s.
 */
function pluralizeAdjective(form: string, feminine: boolean): string {
  if (feminine) return `${form}s`;
  if (/[sx]$/i.test(form)) return form;
  if (/eau$/i.test(form)) return `${form}x`;
  return `${form}s`;
}

/**
 * Insère l'article français adapté devant une traduction, avec élision
 * (ce -> cet) et accord pluriel (ces/des + "s").
 *
 * `adjective` sert au mode « accord adjectif » : l'exercice a besoin d'une
 * traduction complète (« C'est une bague brillante ») pour que l'apprenant
 * sache quel adjectif accorder, sans ligne d'explication séparée. Le
 * français ne le place pas toujours du même côté que le russe, qui antépose
 * toujours, et ne l'accorde pas pareil : d'où des formes écrites.
 */
export function frenchNounPhrase(
  translation: string,
  gender: FrenchGender,
  article: ArticleMode,
  plural: boolean,
  adjective?: FrenchAdjectiveForms
): string {
  const noun = plural ? pluralizeFirstWord(translation) : translation;

  let core = noun;
  if (adjective) {
    const feminine = gender === "f";
    // « un bel appartement » : la forme devant voyelle ne vaut que pour un
    // masculin antéposé, et c'est le NOM qui suit, donc lui qu'on teste.
    const base =
      feminine
        ? adjective.f
        : adjective.position === "before" && adjective.mVowel && VOWEL_SOUND.test(noun)
          ? adjective.mVowel
          : adjective.m;
    const form = plural ? pluralizeAdjective(base, feminine) : base;
    core = adjective.position === "before" ? `${form} ${noun}` : `${noun} ${form}`;
  }

  if (article === "none") return core;

  if (plural) {
    // « de beaux livres » : au pluriel, « des » devient « de » devant un
    // adjectif antéposé.
    const indefinite = adjective?.position === "before" ? "de" : "des";
    return `${article === "indefinite" ? indefinite : "ces"} ${core}`;
  }

  if (article === "indefinite") {
    return `${gender === "f" ? "une" : "un"} ${core}`;
  }

  // demonstrative — l'élision dépend du premier mot du groupe, adjectif
  // antéposé compris, pas du nom.
  if (gender === "m" && VOWEL_SOUND.test(core)) return `cet ${core}`;
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
  return filled.replace(/\bde ([aeiouyàâäéèêëîïôöùûhAEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛH])/, "d'$1");
}
