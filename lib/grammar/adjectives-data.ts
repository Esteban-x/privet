import { Adjective } from "./types";

export const ADJECTIVES: Adjective[] = [
  // Dur
  { id: "krasivyy", lemmaM: "красивый", translation: "beau / belle", stemType: "hard" },
  { id: "novyy", lemmaM: "новый", translation: "nouveau", stemType: "hard" },
  { id: "staryy", lemmaM: "старый", translation: "vieux", stemType: "hard" },
  { id: "interesnyy", lemmaM: "интересный", translation: "intéressant", stemType: "hard" },
  { id: "tyoplyy", lemmaM: "тёплый", translation: "chaud (temps)", stemType: "hard" },
  { id: "kholodnyy", lemmaM: "холодный", translation: "froid", stemType: "hard" },
  { id: "vkusnyy", lemmaM: "вкусный", translation: "délicieux", stemType: "hard" },
  { id: "umnyy", lemmaM: "умный", translation: "intelligent", stemType: "hard" },

  // Dur, accent sur la désinence (-ой)
  { id: "molodoy", lemmaM: "молодой", translation: "jeune", stemType: "hard", stressedEnding: true },

  // Mixte (radical en г к х ж ч ш щ)
  { id: "russkiy", lemmaM: "русский", translation: "russe", stemType: "mixed" },
  { id: "malenkiy", lemmaM: "маленький", translation: "petit", stemType: "mixed" },
  { id: "khoroshiy", lemmaM: "хороший", translation: "bon", stemType: "mixed" },
  { id: "yarkiy", lemmaM: "яркий", translation: "vif, éclatant", stemType: "mixed" },

  // Mixte, accent sur la désinence (-ой)
  { id: "bolshoy", lemmaM: "большой", translation: "grand", stemType: "mixed", stressedEnding: true },
  { id: "plokhoy", lemmaM: "плохой", translation: "mauvais", stemType: "mixed", stressedEnding: true },
  { id: "dorogoy", lemmaM: "дорогой", translation: "cher, précieux", stemType: "mixed", stressedEnding: true },

  // Mou véritable (radical en н suivi de -ий mou)
  { id: "siniy", lemmaM: "синий", translation: "bleu (foncé)", stemType: "soft" },
  { id: "domashniy", lemmaM: "домашний", translation: "domestique, familial", stemType: "soft" },
];

export function getAdjective(id: string): Adjective | undefined {
  return ADJECTIVES.find((a) => a.id === id);
}
