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

export interface CaseInfo {
  id: CaseId;
  number: number; // ordre traditionnel russe 1-6
  nameRu: string;
  nameFr: string;
  question: string; // "кто? что?" etc.
  usage: string; // explication courte
  color: string; // accent couleur pour l'UI
}

export interface IrregularForms {
  singular?: Partial<Record<CaseId, string>>;
  plural?: Partial<Record<CaseId, string>>;
}

// Genre français de la traduction — INDÉPENDANT du genre russe (ex. "стол"
// est masculin en russe ET en français, mais "книга" livre/féminin en russe
// est masculin en français : "un livre"). Sert à choisir le bon article
// (un/une, ce/cet/cette) quand la traduction est insérée dans une phrase
// française — voir lib/grammar/french-article.ts.
export type FrenchGender = "m" | "f";

export interface Noun {
  id: string;
  lemma: string; // nominatif singulier
  translation: string;
  frenchGender: FrenchGender;
  gender: Gender;
  animacy: Animacy;
  stemType: StemType;
  indeclinable?: boolean; // ex: кофе, метро, такси
  pluraleTantum?: boolean; // n'existe qu'au pluriel (очки, деньги)
  irregular?: IrregularForms;
  example?: string; // phrase d'exemple
}

export interface DeclensionResult {
  case: CaseId;
  form: string;
  ruleApplied: string;
  isIrregular: boolean;
}

export interface Adjective {
  id: string;
  lemmaM: string; // masculin nominatif singulier, forme du dictionnaire (ex. "красивый")
  translation: string;
  stemType: StemType; // "mixed" = radical en г,к,х,ж,ч,ш,щ (règle -ий/-ие)
  stressedEnding?: boolean; // accent sur la désinence -> -ой au masc./neutre au lieu de -ый/-ий (большой, молодой)
}
