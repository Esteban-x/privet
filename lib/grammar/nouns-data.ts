import { Noun } from "./types";

export const NOUNS: Noun[] = [
  // Masculin dur
  { id: "stol", lemma: "стол", translation: "table", gender: "masculine", animacy: "inanimate", stemType: "hard", example: "Книга лежит на столе." },
  { id: "dom", lemma: "дом", translation: "maison", gender: "masculine", animacy: "inanimate", stemType: "hard" },
  { id: "gorod", lemma: "город", translation: "ville", gender: "masculine", animacy: "inanimate", stemType: "hard" },
  { id: "drug", lemma: "друг", translation: "ami", gender: "masculine", animacy: "animate", stemType: "hard", irregular: { plural: { nominative: "друзья", genitive: "друзей", dative: "друзьям", instrumental: "друзьями", prepositional: "друзьях" } } },
  { id: "student", lemma: "студент", translation: "étudiant", gender: "masculine", animacy: "animate", stemType: "hard" },
  { id: "brat", lemma: "брат", translation: "frère", gender: "masculine", animacy: "animate", stemType: "hard", irregular: { plural: { nominative: "братья", genitive: "братьев" } } },

  // Masculin mou / chuintant
  { id: "uchitel", lemma: "учитель", translation: "professeur", gender: "masculine", animacy: "animate", stemType: "soft", irregular: { plural: { nominative: "учителя", genitive: "учителей" } } },
  { id: "muzey", lemma: "музей", translation: "musée", gender: "masculine", animacy: "inanimate", stemType: "soft" },
  { id: "slovar", lemma: "словарь", translation: "dictionnaire", gender: "masculine", animacy: "inanimate", stemType: "soft" },
  { id: "vrach", lemma: "врач", translation: "médecin", gender: "masculine", animacy: "animate", stemType: "mixed" },
  { id: "nozh", lemma: "нож", translation: "couteau", gender: "masculine", animacy: "inanimate", stemType: "mixed" },

  // Féminin dur (-а)
  { id: "kniga", lemma: "книга", translation: "livre", gender: "feminine", animacy: "inanimate", stemType: "hard" },
  { id: "shkola", lemma: "школа", translation: "école", gender: "feminine", animacy: "inanimate", stemType: "hard" },
  { id: "zhena", lemma: "жена", translation: "épouse", gender: "feminine", animacy: "animate", stemType: "hard" },
  { id: "podruga", lemma: "подруга", translation: "amie", gender: "feminine", animacy: "animate", stemType: "hard" },
  { id: "mashina", lemma: "машина", translation: "voiture", gender: "feminine", animacy: "inanimate", stemType: "hard" },

  // Féminin mou (-я)
  { id: "nedelya", lemma: "неделя", translation: "semaine", gender: "feminine", animacy: "inanimate", stemType: "soft" },
  { id: "zemlya", lemma: "земля", translation: "terre", gender: "feminine", animacy: "inanimate", stemType: "soft", irregular: { plural: { genitive: "земель" } } },
  { id: "familiya", lemma: "фамилия", translation: "nom de famille", gender: "feminine", animacy: "inanimate", stemType: "soft" },

  // Féminin 3e déclinaison (-ь)
  { id: "dver", lemma: "дверь", translation: "porte", gender: "feminine", animacy: "inanimate", stemType: "soft" },
  { id: "noch", lemma: "ночь", translation: "nuit", gender: "feminine", animacy: "inanimate", stemType: "soft" },
  { id: "mat", lemma: "мать", translation: "mère", gender: "feminine", animacy: "animate", stemType: "soft", irregular: { singular: { genitive: "матери", dative: "матери", instrumental: "матерью", prepositional: "матери" }, plural: { nominative: "матери", genitive: "матерей" } } },
  { id: "doch", lemma: "дочь", translation: "fille (de qqn)", gender: "feminine", animacy: "animate", stemType: "soft", irregular: { singular: { genitive: "дочери", dative: "дочери", instrumental: "дочерью", prepositional: "дочери" }, plural: { nominative: "дочери", genitive: "дочерей" } } },

  // Neutre dur (-о)
  { id: "okno", lemma: "окно", translation: "fenêtre", gender: "neuter", animacy: "inanimate", stemType: "hard", irregular: { plural: { genitive: "окон" } } },
  { id: "slovo", lemma: "слово", translation: "mot", gender: "neuter", animacy: "inanimate", stemType: "hard" },
  { id: "mesto", lemma: "место", translation: "endroit / place", gender: "neuter", animacy: "inanimate", stemType: "hard" },

  // Neutre mou (-е) et irréguliers
  { id: "more", lemma: "море", translation: "mer", gender: "neuter", animacy: "inanimate", stemType: "soft", irregular: { plural: { genitive: "морей" } } },
  { id: "zdanie", lemma: "здание", translation: "bâtiment", gender: "neuter", animacy: "inanimate", stemType: "soft" },
  { id: "vremya", lemma: "время", translation: "temps", gender: "neuter", animacy: "inanimate", stemType: "soft", irregular: { singular: { genitive: "времени", dative: "времени", instrumental: "временем", prepositional: "времени" } } },
  { id: "imya", lemma: "имя", translation: "prénom", gender: "neuter", animacy: "inanimate", stemType: "soft", irregular: { singular: { genitive: "имени", dative: "имени", instrumental: "именем", prepositional: "имени" } } },

  // Indéclinables
  { id: "kofe", lemma: "кофе", translation: "café", gender: "masculine", animacy: "inanimate", stemType: "hard", indeclinable: true },
  { id: "metro", lemma: "метро", translation: "métro", gender: "neuter", animacy: "inanimate", stemType: "hard", indeclinable: true },
];

export function getNoun(id: string): Noun | undefined {
  return NOUNS.find((n) => n.id === id);
}
