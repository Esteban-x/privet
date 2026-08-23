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
  { id: "krasivyy", lemmaM: "красивый", translation: "beau / belle", stemType: "hard" },
  { id: "novyy", lemmaM: "новый", translation: "nouveau", stemType: "hard" },
  { id: "staryy", lemmaM: "старый", translation: "vieux", stemType: "hard" },
  { id: "interesnyy", lemmaM: "интересный", translation: "intéressant", stemType: "hard" },
  { id: "tyoplyy", lemmaM: "тёплый", translation: "chaud (temps)", stemType: "hard", appliesTo: "inanimate" },
  { id: "kholodnyy", lemmaM: "холодный", translation: "froid", stemType: "hard", appliesTo: "inanimate" },
  { id: "vkusnyy", lemmaM: "вкусный", translation: "délicieux", stemType: "hard", onlyNouns: EDIBLE },
  { id: "umnyy", lemmaM: "умный", translation: "intelligent", stemType: "hard", appliesTo: "animate" },

  // Dur, accent sur la désinence (-ой)
  { id: "molodoy", lemmaM: "молодой", translation: "jeune", stemType: "hard", stressedEnding: true, appliesTo: "animate" },

  // Mixte (radical en г к х ж ч ш щ)
  { id: "russkiy", lemmaM: "русский", translation: "russe", stemType: "mixed" },
  { id: "malenkiy", lemmaM: "маленький", translation: "petit", stemType: "mixed" },
  { id: "khoroshiy", lemmaM: "хороший", translation: "bon", stemType: "mixed" },
  { id: "yarkiy", lemmaM: "яркий", translation: "vif, éclatant", stemType: "mixed", appliesTo: "inanimate" },

  // Mixte, accent sur la désinence (-ой)
  { id: "bolshoy", lemmaM: "большой", translation: "grand", stemType: "mixed", stressedEnding: true },
  { id: "plokhoy", lemmaM: "плохой", translation: "mauvais", stemType: "mixed", stressedEnding: true },
  { id: "dorogoy", lemmaM: "дорогой", translation: "cher, précieux", stemType: "mixed", stressedEnding: true },

  // Mou véritable (radical en н suivi de -ий mou)
  { id: "siniy", lemmaM: "синий", translation: "bleu (foncé)", stemType: "soft", appliesTo: "inanimate" },
  { id: "domashniy", lemmaM: "домашний", translation: "domestique, familial", stemType: "soft", appliesTo: "inanimate" },
];

export function getAdjective(id: string): Adjective | undefined {
  return ADJECTIVES.find((a) => a.id === id);
}
