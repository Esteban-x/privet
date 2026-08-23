import { Noun } from "./types";

/**
 * `rank: 1` : les prénoms ne passent pas par le filtre de fréquence
 * (`nounsForLevel`) — ils ne sont tirés que pour le déclencheur
 * "Меня зовут ___", à tous les niveaux.
 *
 * Prénoms russes courants, réservés au déclencheur "Меня зовут ___"
 * (lib/grammar/triggers.ts, id "expr-nom-zovut") : ce gabarit n'a de sens
 * qu'avec un prénom, jamais un nom commun de la banque générale (ça
 * produisait des phrases absurdes du type "Меня зовут музыка").
 *
 * Les prénoms sont absents du dictionnaire importé (filtré aux noms communs
 * en minuscules), donc leurs paradigmes sont écrits ici — et vérifiés forme
 * par forme par `npm run check:grammar` au même titre que le reste. Ils
 * servent au nominatif dans la phrase, et aux autres cas pour fabriquer les
 * distracteurs du QCM (А́нна / А́нны / А́нне / А́нну).
 */
export const RUSSIAN_NAMES: Noun[] = [
  {
    id: "name-anna", lemma: "Анна", translation: "Anna", frenchGender: "f",
    gender: "feminine", animacy: "animate", rank: 1,
    forms: {
      singular: ["А́нна", "А́нны", "А́нне", "А́нну", "А́нной", "А́нне"],
      plural: ["А́нны", "Анн", "А́ннам", "Анн", "А́ннами", "А́ннах"],
    },
  },
  {
    id: "name-maria", lemma: "Мария", translation: "Maria", frenchGender: "f",
    gender: "feminine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Мари́я", "Мари́и", "Мари́и", "Мари́ю", "Мари́ей", "Мари́и"],
      plural: ["Мари́и", "Мари́й", "Мари́ям", "Мари́й", "Мари́ями", "Мари́ях"],
    },
  },
  {
    id: "name-olga", lemma: "Ольга", translation: "Olga", frenchGender: "f",
    gender: "feminine", animacy: "animate", rank: 1,
    forms: {
      singular: ["О́льга", "О́льги", "О́льге", "О́льгу", "О́льгой", "О́льге"],
      plural: ["О́льги", "Ольг", "О́льгам", "Ольг", "О́льгами", "О́льгах"],
    },
  },
  {
    id: "name-ekaterina", lemma: "Екатерина", translation: "Ekaterina", frenchGender: "f",
    gender: "feminine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Екатери́на", "Екатери́ны", "Екатери́не", "Екатери́ну", "Екатери́ной", "Екатери́не"],
      plural: ["Екатери́ны", "Екатери́н", "Екатери́нам", "Екатери́н", "Екатери́нами", "Екатери́нах"],
    },
  },
  {
    id: "name-ivan", lemma: "Иван", translation: "Ivan", frenchGender: "m",
    gender: "masculine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Ива́н", "Ива́на", "Ива́ну", "Ива́на", "Ива́ном", "Ива́не"],
      plural: ["Ива́ны", "Ива́нов", "Ива́нам", "Ива́нов", "Ива́нами", "Ива́нах"],
    },
  },
  {
    id: "name-dmitriy", lemma: "Дмитрий", translation: "Dmitri", frenchGender: "m",
    gender: "masculine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Дми́трий", "Дми́трия", "Дми́трию", "Дми́трия", "Дми́трием", "Дми́трии"],
      plural: ["Дми́трии", "Дми́триев", "Дми́триям", "Дми́триев", "Дми́триями", "Дми́триях"],
    },
  },
  {
    id: "name-aleksandr", lemma: "Александр", translation: "Alexandre", frenchGender: "m",
    gender: "masculine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Алекса́ндр", "Алекса́ндра", "Алекса́ндру", "Алекса́ндра", "Алекса́ндром", "Алекса́ндре"],
      plural: ["Алекса́ндры", "Алекса́ндров", "Алекса́ндрам", "Алекса́ндров", "Алекса́ндрами", "Алекса́ндрах"],
    },
  },
  {
    id: "name-sergey", lemma: "Сергей", translation: "Sergueï", frenchGender: "m",
    gender: "masculine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Серге́й", "Серге́я", "Серге́ю", "Серге́я", "Серге́ем", "Серге́е"],
      plural: ["Серге́и", "Серге́ев", "Серге́ям", "Серге́ев", "Серге́ями", "Серге́ях"],
    },
  },
  {
    id: "name-nikolay", lemma: "Николай", translation: "Nikolaï", frenchGender: "m",
    gender: "masculine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Никола́й", "Никола́я", "Никола́ю", "Никола́я", "Никола́ем", "Никола́е"],
      plural: ["Никола́и", "Никола́ев", "Никола́ям", "Никола́ев", "Никола́ями", "Никола́ях"],
    },
  },
  {
    id: "name-natalya", lemma: "Наталья", translation: "Natalia", frenchGender: "f",
    gender: "feminine", animacy: "animate", rank: 1,
    forms: {
      singular: ["Ната́лья", "Ната́льи", "Ната́лье", "Ната́лью", "Ната́льей", "Ната́лье"],
      plural: ["Ната́льи", "Ната́лий", "Ната́льям", "Ната́лий", "Ната́льями", "Ната́льях"],
    },
  },
];
