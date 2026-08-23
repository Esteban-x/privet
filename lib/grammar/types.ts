export type Gender = "masculine" | "feminine" | "neuter";
export type CaseId =
  | "nominative"
  | "genitive"
  | "dative"
  | "accusative"
  | "instrumental"
  | "prepositional";
export type Animacy = "animate" | "inanimate";
export type StemType = "hard" | "soft" | "mixed"; // mixed = radical en г,к,х,ж,ч,ш,щ

/** Ordre canonique des formes dans `NounForms` et dans toute l'app. */
export const CASE_ORDER: CaseId[] = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "instrumental",
  "prepositional",
];

export interface CaseInfo {
  id: CaseId;
  number: number; // ordre traditionnel russe 1-6
  nameRu: string;
  nameFr: string;
  question: string; // "кто? что?" etc.
  usage: string; // explication courte
  color: string; // accent couleur pour l'UI
}

// Genre français de la traduction — INDÉPENDANT du genre russe (ex. "стол"
// est masculin en russe ET en français, mais "книга" livre/féminin en russe
// est masculin en français : "un livre"). Sert à choisir le bon article
// (un/une, ce/cet/cette) quand la traduction est insérée dans une phrase
// française — voir lib/grammar/french-article.ts.
export type FrenchGender = "m" | "f";

/**
 * Paradigme complet, accents toniques compris : 6 formes au singulier, 6 au
 * pluriel, dans l'ordre de CASE_ORDER. C'est la RÉFÉRENCE — le moteur de
 * règles (lib/grammar/decline.ts) ne sert plus à produire la forme, mais à
 * expliquer la règle et à repérer ce qui y échappe.
 */
export interface NounForms {
  singular: string[];
  plural: string[];
}

export interface Noun {
  id: string;
  lemma: string; // nominatif singulier, sans accent
  translation: string;
  frenchGender: FrenchGender;
  gender: Gender;
  animacy: Animacy;
  /**
   * Rang d'usage (1 = le plus fréquent, 50000 = hors liste de fréquence).
   * Sert à servir du vocabulaire courant à un débutant et des mots plus
   * rares à un avancé — voir `nounsForLevel` dans nouns-data.ts.
   */
  rank: number;
  forms: NounForms;
}

/** Forme des entrées de lib/grammar/nouns-data.generated.ts. */
export type GeneratedNoun = Noun;

export interface DeclensionResult {
  case: CaseId;
  /** Forme attendue, sans accent tonique — c'est elle qu'on compare à la saisie. */
  form: string;
  /** Même forme avec l'accent tonique, pour l'affichage. */
  accented: string;
  ruleApplied: string;
  /** Vrai quand le moteur de règles ne retombe pas sur la forme du dictionnaire. */
  isIrregular: boolean;
}

export interface Adjective {
  id: string;
  lemmaM: string; // masculin nominatif singulier, forme du dictionnaire (ex. "красивый")
  translation: string;
  stemType: StemType; // "mixed" = radical en г,к,х,ж,ч,ш,щ (règle -ий/-ие)
  stressedEnding?: boolean; // accent sur la désinence -> -ой au masc./neutre au lieu de -ый/-ий
  /**
   * Ce que l'adjectif peut qualifier sans produire d'absurdité.
   *
   * Le nom d'un exercice d'accord est tiré au hasard : sans contrainte, on
   * obtenait « вку́сная сосе́дка » (une voisine savoureuse) ou « у́мное
   * коли́чество » (une quantité intelligente). L'apprenant travaille alors
   * la désinence sur une phrase qu'il n'oserait jamais dire.
   *
   * Absent = convient à peu près à tout (большо́й, но́вый, плохо́й).
   */
  appliesTo?: "animate" | "inanimate";
  /**
   * Adjectif trop étroit pour se laisser décrire par l'animacité : la liste
   * des noms qu'il peut qualifier, par identifiant. « вку́сный » ne va
   * qu'avec de la nourriture, et aucun champ de la banque ne dit qu'un mot
   * est comestible.
   */
  onlyNouns?: string[];
}
