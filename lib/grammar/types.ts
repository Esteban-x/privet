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

export interface Noun {
  id: string;
  lemma: string; // nominatif singulier
  translation: string;
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
