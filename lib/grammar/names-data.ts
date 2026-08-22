import { Noun } from "./types";

// Prénoms russes courants, réservés au déclencheur "Меня зовут ___"
// (lib/grammar/triggers.ts, id "expr-nom-zovut") : ce gabarit n'a de sens
// qu'avec un prénom, jamais un nom commun pris dans la banque générale
// (ça produisait des phrases absurdes du type "Меня зовут музыка"). Toujours
// utilisés au nominatif (le seul cas où ce déclencheur s'emploie), donc le
// détail grammatical (genre/animacité/radical) n'est là que par cohérence
// de type — declineNoun renvoie le lemme tel quel au nominatif.
export const RUSSIAN_NAMES: Noun[] = [
  { id: "name-anna", lemma: "Анна", translation: "Anna", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "hard" },
  { id: "name-maria", lemma: "Мария", translation: "Maria", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "soft" },
  { id: "name-olga", lemma: "Ольга", translation: "Olga", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "hard" },
  { id: "name-ekaterina", lemma: "Екатерина", translation: "Ekaterina", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "hard" },
  { id: "name-natalia", lemma: "Наталья", translation: "Natalia", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "soft" },
  { id: "name-ivan", lemma: "Иван", translation: "Ivan", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "hard" },
  { id: "name-dmitri", lemma: "Дмитрий", translation: "Dmitri", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "soft" },
  { id: "name-alexandre", lemma: "Александр", translation: "Alexandre", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "hard" },
  { id: "name-sergei", lemma: "Сергей", translation: "Sergueï", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "soft" },
  { id: "name-nikolai", lemma: "Николай", translation: "Nikolaï", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "soft" },
];
