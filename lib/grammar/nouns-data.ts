import { Noun } from "./types";

export const NOUNS: Noun[] = [
  // Masculin dur
  { id: "stol", lemma: "стол", translation: "table", frenchGender: "f", gender: "masculine", animacy: "inanimate", stemType: "hard", example: "Книга лежит на столе." },
  {
    id: "dom",
    lemma: "дом",
    translation: "maison",
    frenchGender: "f",
    gender: "masculine",
    animacy: "inanimate",
    stemType: "hard",
    // Pluriel en -а accentué (irrégulier, ne suit pas la règle générale -ы) :
    // дома́, jamais "домы". Le génitif/datif/instr./prép. pluriels restent
    // réguliers (домов, домам...), seuls nominatif (et accusatif, qui en
    // découle car inanimé) sont concernés.
    irregular: { plural: { nominative: "дома" } },
  },
  {
    id: "gorod",
    lemma: "город",
    translation: "ville",
    frenchGender: "f",
    gender: "masculine",
    animacy: "inanimate",
    stemType: "hard",
    irregular: { plural: { nominative: "города" } },
  },
  { id: "drug", lemma: "друг", translation: "ami", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "hard", irregular: { plural: { nominative: "друзья", genitive: "друзей", dative: "друзьям", instrumental: "друзьями", prepositional: "друзьях" } } },
  { id: "student", lemma: "студент", translation: "étudiant", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "hard" },
  { id: "brat", lemma: "брат", translation: "frère", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "hard", irregular: { plural: { nominative: "братья", genitive: "братьев", dative: "братьям", instrumental: "братьями", prepositional: "братьях" } } },

  // Masculin mou / chuintant
  { id: "uchitel", lemma: "учитель", translation: "professeur", frenchGender: "m", gender: "masculine", animacy: "animate", stemType: "soft", irregular: { plural: { nominative: "учителя", genitive: "учителей" } } },
  { id: "muzey", lemma: "музей", translation: "musée", frenchGender: "m", gender: "masculine", animacy: "inanimate", stemType: "soft" },
  { id: "slovar", lemma: "словарь", translation: "dictionnaire", frenchGender: "m", gender: "masculine", animacy: "inanimate", stemType: "soft" },
  {
    id: "vrach",
    lemma: "врач",
    translation: "médecin",
    frenchGender: "m",
    gender: "masculine",
    animacy: "animate",
    stemType: "mixed",
    // Finale accentuée (врачо́м) : l'alternance о/е par défaut (radical
    // chuintant -> -ем) suppose un accent non final, faux ici. Voir la
    // note sur la voyelle mobile dans decline.ts.
    irregular: { singular: { instrumental: "врачом" } },
  },
  {
    id: "nozh",
    lemma: "нож",
    translation: "couteau",
    frenchGender: "m",
    gender: "masculine",
    animacy: "inanimate",
    stemType: "mixed",
    irregular: { singular: { instrumental: "ножом" } },
  },

  // Féminin dur (-а)
  { id: "kniga", lemma: "книга", translation: "livre", frenchGender: "m", gender: "feminine", animacy: "inanimate", stemType: "hard" },
  { id: "shkola", lemma: "школа", translation: "école", frenchGender: "f", gender: "feminine", animacy: "inanimate", stemType: "hard" },
  { id: "zhena", lemma: "жена", translation: "épouse", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "hard" },
  { id: "podruga", lemma: "подруга", translation: "amie", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "hard" },
  { id: "mashina", lemma: "машина", translation: "voiture", frenchGender: "f", gender: "feminine", animacy: "inanimate", stemType: "hard" },

  // Féminin mou (-я)
  { id: "nedelya", lemma: "неделя", translation: "semaine", frenchGender: "f", gender: "feminine", animacy: "inanimate", stemType: "soft" },
  { id: "zemlya", lemma: "земля", translation: "terre", frenchGender: "f", gender: "feminine", animacy: "inanimate", stemType: "soft", irregular: { plural: { genitive: "земель" } } },
  { id: "familiya", lemma: "фамилия", translation: "nom de famille", frenchGender: "m", gender: "feminine", animacy: "inanimate", stemType: "soft" },

  // Féminin 3e déclinaison (-ь)
  { id: "dver", lemma: "дверь", translation: "porte", frenchGender: "f", gender: "feminine", animacy: "inanimate", stemType: "soft" },
  { id: "noch", lemma: "ночь", translation: "nuit", frenchGender: "f", gender: "feminine", animacy: "inanimate", stemType: "soft" },
  { id: "mat", lemma: "мать", translation: "mère", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "soft", irregular: { singular: { genitive: "матери", dative: "матери", instrumental: "матерью", prepositional: "матери" }, plural: { nominative: "матери", genitive: "матерей", dative: "матерям", instrumental: "матерями", prepositional: "матерях" } } },
  { id: "doch", lemma: "дочь", translation: "fille (de qqn)", frenchGender: "f", gender: "feminine", animacy: "animate", stemType: "soft", irregular: { singular: { genitive: "дочери", dative: "дочери", instrumental: "дочерью", prepositional: "дочери" }, plural: { nominative: "дочери", genitive: "дочерей", dative: "дочерям", instrumental: "дочерями", prepositional: "дочерях" } } },

  // Neutre dur (-о)
  { id: "okno", lemma: "окно", translation: "fenêtre", frenchGender: "f", gender: "neuter", animacy: "inanimate", stemType: "hard", irregular: { plural: { genitive: "окон" } } },
  { id: "slovo", lemma: "слово", translation: "mot", frenchGender: "m", gender: "neuter", animacy: "inanimate", stemType: "hard" },
  { id: "mesto", lemma: "место", translation: "endroit", frenchGender: "m", gender: "neuter", animacy: "inanimate", stemType: "hard" },

  // Neutre mou (-е) et irréguliers
  { id: "more", lemma: "море", translation: "mer", frenchGender: "f", gender: "neuter", animacy: "inanimate", stemType: "soft", irregular: { plural: { genitive: "морей" } } },
  { id: "zdanie", lemma: "здание", translation: "bâtiment", frenchGender: "m", gender: "neuter", animacy: "inanimate", stemType: "soft" },
  { id: "vremya", lemma: "время", translation: "temps", frenchGender: "m", gender: "neuter", animacy: "inanimate", stemType: "soft", irregular: { singular: { genitive: "времени", dative: "времени", instrumental: "временем", prepositional: "времени" }, plural: { nominative: "времена", genitive: "времён", dative: "временам", instrumental: "временами", prepositional: "временах" } } },
  { id: "imya", lemma: "имя", translation: "prénom", frenchGender: "m", gender: "neuter", animacy: "inanimate", stemType: "soft", irregular: { singular: { genitive: "имени", dative: "имени", instrumental: "именем", prepositional: "имени" }, plural: { nominative: "имена", genitive: "имён", dative: "именам", instrumental: "именами", prepositional: "именах" } } },

  // Indéclinables
  { id: "kofe", lemma: "кофе", translation: "café", frenchGender: "m", gender: "masculine", animacy: "inanimate", stemType: "hard", indeclinable: true },
  { id: "metro", lemma: "метро", translation: "métro", frenchGender: "m", gender: "neuter", animacy: "inanimate", stemType: "hard", indeclinable: true },
];

export function getNoun(id: string): Noun | undefined {
  return NOUNS.find((n) => n.id === id);
}
