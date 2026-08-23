import { Adjective } from "./types";

/**
 * Portée sémantique — voir `appliesTo` / `onlyNouns` dans types.ts.
 *
 * Le nom d'un exercice d'accord est tiré au hasard dans 451 mots. Sans
 * contrainte, l'apprenant tombait sur « вку́сная сосе́дке » ou « у́мное
 * коли́чество » : la désinence était juste, la phrase inavouable. On restreint
 * donc les adjectifs qui le demandent, plutôt que d'annoter les 451 noms.
 *
 * La restriction est volontairement PRUDENTE : « молодо́е вино́ » se dit très
 * bien, mais marquer « молодо́й » comme réservé aux animés ne coûte qu'une
 * combinaison légitime et supprime tous les emplois absurdes. L'inverse — un
 * adjectif trop permissif — laisse passer des phrases que personne ne dirait.
 */

/** Noms comestibles de la banque : les seuls que « вку́сный » peut qualifier. */
const EDIBLE = [
  "voda", "chay", "sok", "vino", "pivo", "napitok",
  "sup", "myaso", "syr", "yaytso", "ryba", "yabloko", "khleb",
  "maslo", "ris", "salat", "tort", "pechene", "shokolad", "desert",
  "blyudo", "zavtrak", "obed", "uzhin", "kusok",
];

export const ADJECTIVES: Adjective[] = [
  // Dur
  { id: "krasivyy", lemmaM: "красивый", translation: "beau / belle", stemType: "hard", fr: { m: "beau", f: "belle", mVowel: "bel", position: "before" } },
  { id: "novyy", lemmaM: "новый", translation: "nouveau", stemType: "hard", fr: { m: "nouveau", f: "nouvelle", mVowel: "nouvel", position: "before" } },
  { id: "staryy", lemmaM: "старый", translation: "vieux", stemType: "hard", fr: { m: "vieux", f: "vieille", mVowel: "vieil", position: "before" } },
  { id: "interesnyy", lemmaM: "интересный", translation: "intéressant", stemType: "hard", fr: { m: "intéressant", f: "intéressante", position: "after" } },
  { id: "tyoplyy", lemmaM: "тёплый", translation: "chaud (temps)", stemType: "hard", appliesTo: "inanimate", fr: { m: "chaud", f: "chaude", position: "after" } },
  { id: "kholodnyy", lemmaM: "холодный", translation: "froid", stemType: "hard", appliesTo: "inanimate", fr: { m: "froid", f: "froide", position: "after" } },
  { id: "vkusnyy", lemmaM: "вкусный", translation: "délicieux", stemType: "hard", onlyNouns: EDIBLE, fr: { m: "délicieux", f: "délicieuse", position: "after" } },
  { id: "umnyy", lemmaM: "умный", translation: "intelligent", stemType: "hard", appliesTo: "animate", fr: { m: "intelligent", f: "intelligente", position: "after" } },

  // Dur, accent sur la désinence (-ой)
  { id: "molodoy", lemmaM: "молодой", translation: "jeune", stemType: "hard", stressedEnding: true, appliesTo: "animate", fr: { m: "jeune", f: "jeune", position: "before" } },

  // Mixte (radical en г к х ж ч ш щ)
  { id: "russkiy", lemmaM: "русский", translation: "russe", stemType: "mixed", fr: { m: "russe", f: "russe", position: "after" } },
  { id: "malenkiy", lemmaM: "маленький", translation: "petit", stemType: "mixed", fr: { m: "petit", f: "petite", position: "before" } },
  { id: "khoroshiy", lemmaM: "хороший", translation: "bon", stemType: "mixed", fr: { m: "bon", f: "bonne", position: "before" } },
  { id: "yarkiy", lemmaM: "яркий", translation: "brillant", stemType: "mixed", appliesTo: "inanimate", fr: { m: "brillant", f: "brillante", position: "after" } },

  // Mixte, accent sur la désinence (-ой)
  { id: "bolshoy", lemmaM: "большой", translation: "grand", stemType: "mixed", stressedEnding: true, fr: { m: "grand", f: "grande", position: "before" } },
  { id: "plokhoy", lemmaM: "плохой", translation: "mauvais", stemType: "mixed", stressedEnding: true, fr: { m: "mauvais", f: "mauvaise", position: "before" } },
  { id: "dorogoy", lemmaM: "дорогой", translation: "cher, précieux", stemType: "mixed", stressedEnding: true, fr: { m: "cher", f: "chère", position: "after" } },

  // Mou véritable (radical en н suivi de -ий mou)
  { id: "siniy", lemmaM: "синий", translation: "bleu (foncé)", stemType: "soft", appliesTo: "inanimate", fr: { m: "bleu", f: "bleue", position: "after" } },
  { id: "domashniy", lemmaM: "домашний", translation: "domestique, familial", stemType: "soft", appliesTo: "inanimate", fr: { m: "domestique", f: "domestique", position: "after" } },
];

export function getAdjective(id: string): Adjective | undefined {
  return ADJECTIVES.find((a) => a.id === id);
}
