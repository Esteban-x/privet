import { Adjective } from "./types";

/**
 * Banque d'adjectifs, forme du dictionnaire uniquement.
 *
 * Elle ne dit plus RIEN de ce qu'un adjectif peut qualifier. Elle l'a fait,
 * via `appliesTo` / `onlyNouns`, tant que l'exercice d'accord tirait le nom
 * au hasard dans la banque des 451 noms : il fallait bien empêcher
 * « вку́сная сосе́дка ». L'approximation reposait sur l'animacité
 * grammaticale et laissait passer une phrase sur trois.
 *
 * Le couple adjectif + nom est désormais écrit, contexte par contexte, dans
 * lib/adjectives/exercises.ts : la question « qui va avec quoi » se règle
 * une fois à l'écriture, plus à chaque tirage.
 */

export const ADJECTIVES: Adjective[] = [
  // Dur
  { id: "krasivyy", lemmaM: "краси́вый", translation: "beau / belle", stemType: "hard" },
  { id: "novyy", lemmaM: "но́вый", translation: "nouveau", stemType: "hard" },
  { id: "staryy", lemmaM: "ста́рый", translation: "vieux", stemType: "hard" },
  { id: "interesnyy", lemmaM: "интере́сный", translation: "intéressant", stemType: "hard" },
  { id: "tyoplyy", lemmaM: "тёплый", translation: "chaud (temps)", stemType: "hard" },
  { id: "kholodnyy", lemmaM: "холо́дный", translation: "froid", stemType: "hard" },
  { id: "vkusnyy", lemmaM: "вку́сный", translation: "délicieux", stemType: "hard" },
  { id: "umnyy", lemmaM: "у́мный", translation: "intelligent", stemType: "hard" },

  // Dur, accent sur la désinence (-ой)
  { id: "molodoy", lemmaM: "молодо́й", translation: "jeune", stemType: "hard", stressedEnding: true },

  // Mixte (radical en г к х ж ч ш щ)
  { id: "russkiy", lemmaM: "ру́сский", translation: "russe", stemType: "mixed" },
  { id: "malenkiy", lemmaM: "ма́ленький", translation: "petit", stemType: "mixed" },
  { id: "khoroshiy", lemmaM: "хоро́ший", translation: "bon", stemType: "mixed" },
  { id: "yarkiy", lemmaM: "я́ркий", translation: "brillant", stemType: "mixed" },

  // Mixte, accent sur la désinence (-ой)
  { id: "bolshoy", lemmaM: "большо́й", translation: "grand", stemType: "mixed", stressedEnding: true },
  { id: "plokhoy", lemmaM: "плохо́й", translation: "mauvais", stemType: "mixed", stressedEnding: true },
  { id: "dorogoy", lemmaM: "дорого́й", translation: "cher, précieux", stemType: "mixed", stressedEnding: true },

  // Mou véritable (radical en н suivi de -ий mou)
  { id: "siniy", lemmaM: "си́ний", translation: "bleu (foncé)", stemType: "soft" },
  { id: "domashniy", lemmaM: "дома́шний", translation: "domestique, familial", stemType: "soft" },
];

export function getAdjective(id: string): Adjective | undefined {
  return ADJECTIVES.find((a) => a.id === id);
}
