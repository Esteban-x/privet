import { NOUNS } from "@/lib/grammar/nouns-data";
import type { Noun } from "@/lib/grammar/types";
import { buildOptions, pick, type PracticeExercise, type Rng, type Skill } from "@/lib/exercises/types";

/**
 * Nombres, heure et dates.
 *
 * POURQUOI CE MODULE EST GÉNÉRATIF, ALORS QUE LES AUTRES ONT UNE BANQUE
 * ÉCRITE. Les modules Aspect, Mouvement et Adjectif portent sur des choix
 * de SENS : aucun calcul ne dit si « он шёл » ou « он ходил » convient dans
 * une situation donnée, il faut l'écrire. Ici, tout est mécanique — le cas
 * du nom après un nombre se déduit de son dernier chiffre, l'heure russe se
 * calcule, la date suit une règle. Écrire ces exercices à la main
 * n'ajouterait que des fautes de frappe et une liste finie là où la règle
 * couvre l'infini.
 *
 * Ce qui est écrit, en revanche : les contextes de durée (за / че́рез / на),
 * qui relèvent bien du sens, et les phrases-cadres, choisies pour que le
 * nombre y soit naturel.
 *
 * LES FORMES VIENNENT DE LA BANQUE. Les noms sont pris dans
 * lib/grammar/nouns-data, dont chaque forme est vérifiée par
 * `npm run check:grammar` — le module ne fabrique aucune terminaison.
 */

export const NUMBER_SKILLS: Skill[] = [
  {
    id: "agreement",
    title: "L'accord après un nombre",
    level: "A2",
    summary:
      "Оди́н дом, два до́ма, пять домо́в : le cas du nom se lit sur le DERNIER chiffre du nombre. 1 appelle le nominatif singulier, 2-4 le génitif singulier, 5 et au-delà le génitif pluriel — et 11 à 14 suivent la règle de 5.",
  },
  {
    id: "time",
    title: "Dire l'heure",
    level: "A2",
    summary:
      "Полови́на пя́того, c'est quatre heures et demie : le russe compte à l'intérieur de l'heure EN COURS. Avant la demie on ajoute les minutes à l'heure suivante, après la demie on les retranche.",
  },
  {
    id: "date",
    title: "Les dates",
    level: "A2",
    summary:
      "Annoncer une date et situer un événement demandent deux formes différentes du même ordinal : сего́дня пя́тое ма́я, mais он прие́дет пя́того ма́я — au génitif, sans préposition.",
  },
  {
    id: "age",
    title: "L'âge",
    level: "A1",
    summary:
      "Мне два́дцать оди́н год : la personne est au datif, et год suit la règle d'accord des nombres — год, го́да, лет. C'est la construction la plus fréquente du russe quotidien.",
  },
  {
    id: "duration",
    title: "Durée et délai",
    level: "B1",
    summary:
      "Quatre questions, quatre constructions : combien de temps (accusatif seul), en combien de temps (за), dans combien de temps (че́рез), pour combien de temps (на).",
  },
];

export type NumberSkillId = (typeof NUMBER_SKILLS)[number]["id"];

export function getNumberSkill(id: string): Skill | undefined {
  return NUMBER_SKILLS.find((s) => s.id === id);
}

// ─────────────────────────────────────────────────────────────────
// 1. L'accord après un nombre
// ─────────────────────────────────────────────────────────────────

/** Les nombres proposés : un par zone d'accord, plus les pièges 11-14 et 21. */
const AGREEMENT_NUMBERS = [
  { value: 1, word: "оди́н", zone: "nom-sg" },
  { value: 2, word: "два", zone: "gen-sg" },
  { value: 3, word: "три", zone: "gen-sg" },
  { value: 4, word: "четы́ре", zone: "gen-sg" },
  { value: 5, word: "пять", zone: "gen-pl" },
  { value: 7, word: "семь", zone: "gen-pl" },
  { value: 11, word: "оди́ннадцать", zone: "gen-pl" },
  { value: 12, word: "двена́дцать", zone: "gen-pl" },
  { value: 21, word: "два́дцать оди́н", zone: "nom-sg" },
  { value: 22, word: "два́дцать два", zone: "gen-sg" },
  { value: 25, word: "два́дцать пять", zone: "gen-pl" },
] as const;

type AgreementZone = (typeof AGREEMENT_NUMBERS)[number]["zone"];

/** Une centaine de noms concrets et dénombrables suffisent : les abstraits se comptent mal. */
const COUNTABLE = NOUNS.filter(
  (n) => n.animacy === "inanimate" && n.forms.plural && n.rank !== undefined && n.rank < 2500
).slice(0, 120);

function formFor(noun: Noun, zone: AgreementZone): string {
  // Ordre des formes dans la banque : nominatif, génitif, datif, accusatif,
  // instrumental, prépositionnel.
  if (zone === "nom-sg") return noun.forms.singular[0];
  if (zone === "gen-sg") return noun.forms.singular[1];
  return noun.forms.plural![1];
}

/**
 * Оди́н s'accorde en genre, contrairement aux autres nombres : « одна́ кни́га »,
 * « одно́ окно́ ». Le nombre affiché doit donc suivre le nom.
 */
function agreeOne(word: string, noun: Noun): string {
  if (!word.endsWith("оди́н")) return word;
  const base = word.slice(0, word.length - "оди́н".length);
  if (noun.gender === "feminine") return `${base}одна́`;
  if (noun.gender === "neuter") return `${base}одно́`;
  return word;
}

function agreementExercise(random: Rng): PracticeExercise {
  const noun = pick(COUNTABLE, random);
  const number = pick(AGREEMENT_NUMBERS, random);
  const correct = formFor(noun, number.zone);
  const numberWord = agreeOne(number.word, noun);

  const candidates = [
    noun.forms.singular[0],
    noun.forms.singular[1],
    noun.forms.plural![1],
    noun.forms.plural![0],
  ];
  const { options, correctIndex } = buildOptions(correct, candidates, random);

  const last = number.value % 100;
  const why =
    last >= 11 && last <= 14
      ? `${number.value} fait partie des « adolescents » 11-14 : malgré son dernier chiffre, il commande le génitif pluriel — ${correct}.`
      : number.zone === "nom-sg"
        ? `Le nombre se termine par 1 : le nom reste au nominatif singulier — ${correct}.`
        : number.zone === "gen-sg"
          ? `Le nombre se termine par 2, 3 ou 4 : génitif singulier — ${correct}.`
          : `À partir de 5, le nom passe au génitif pluriel — ${correct}.`;

  return {
    itemId: `agreement:${noun.id}:${number.value}`,
    prompt: "Complète",
    question: `${numberWord} ___`,
    hint: `${number.value} × ${noun.translation}`,
    badge: noun.lemma,
    options,
    correctIndex,
    explain: why,
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. L'heure
// ─────────────────────────────────────────────────────────────────

const HOUR_CARDINAL = [
  "час", "два", "три", "четы́ре", "пять", "шесть",
  "семь", "во́семь", "де́вять", "де́сять", "оди́ннадцать", "двена́дцать",
];

const HOUR_ORDINAL_GEN = [
  "пе́рвого", "второ́го", "тре́тьего", "четвёртого", "пя́того", "шесто́го",
  "седьмо́го", "восьмо́го", "девя́того", "деся́того", "оди́ннадцатого", "двена́дцатого",
];

const MINUTES_NOM: Record<number, string> = {
  5: "пять мину́т",
  10: "де́сять мину́т",
  15: "че́тверть",
  20: "два́дцать мину́т",
  25: "два́дцать пять мину́т",
};

const MINUTES_GEN: Record<number, string> = {
  5: "пяти́",
  10: "десяти́",
  15: "че́тверти",
  20: "двадцати́",
  25: "двадцати́ пяти́",
};

/** Le mot « heure » accordé : час, часа́, часо́в. */
function hourWord(hour: number): string {
  if (hour === 1) return "";
  if (hour >= 2 && hour <= 4) return " часа́";
  return " часо́в";
}

/** L'heure suivante, sur un cadran de 12. */
function nextHour(hour: number): number {
  return hour === 12 ? 1 : hour + 1;
}

/**
 * L'heure en langue courante. `hour` de 1 à 12, `minute` multiple de 5.
 *
 * Avant la demie, le russe nomme l'heure EN COURS par son ordinal — 16 h 20
 * est « vingt minutes de la cinquième ». Après la demie, il retranche de
 * l'heure suivante. C'est exactement l'inverse du réflexe français, d'où le
 * module.
 */
export function tellTime(hour: number, minute: number): string {
  if (minute === 0) return `${HOUR_CARDINAL[hour - 1]}${hourWord(hour)}`;
  const nextOrdinal = HOUR_ORDINAL_GEN[nextHour(hour) - 1];
  if (minute === 30) return `полови́на ${nextOrdinal}`;
  if (minute < 30) return `${MINUTES_NOM[minute]} ${nextOrdinal}`;
  const remaining = 60 - minute;
  return `без ${MINUTES_GEN[remaining]} ${HOUR_CARDINAL[nextHour(hour) - 1]}`;
}

function timeExercise(random: Rng): PracticeExercise {
  const hour = 1 + Math.floor(random() * 12);
  const minute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], random);
  const correct = tellTime(hour, minute);

  // Trois leurres, trois erreurs réelles : l'heure en cours au lieu de la
  // suivante, la construction inversée autour de la demie, et une quantité
  // de minutes fausse.
  const wrongHour =
    minute === 0
      ? tellTime(nextHour(hour), 0)
      : minute <= 30
        ? `${minute === 30 ? "полови́на" : MINUTES_NOM[minute]} ${HOUR_ORDINAL_GEN[hour - 1]}`
        : `без ${MINUTES_GEN[60 - minute]} ${HOUR_CARDINAL[hour - 1]}`;

  const flipped =
    minute === 0
      ? `полови́на ${HOUR_ORDINAL_GEN[nextHour(hour) - 1]}`
      : minute < 30
        ? `без ${MINUTES_GEN[minute]} ${HOUR_CARDINAL[nextHour(hour) - 1]}`
        : minute === 30
          ? `три́дцать мину́т ${HOUR_ORDINAL_GEN[hour - 1]}`
          : `${MINUTES_NOM[60 - minute]} ${HOUR_ORDINAL_GEN[nextHour(hour) - 1]}`;

  const otherMinute = minute === 0 ? 15 : minute === 15 ? 20 : 15;
  const wrongMinute = tellTime(hour, otherMinute);

  const { options, correctIndex } = buildOptions(
    correct,
    [wrongHour, flipped, wrongMinute],
    random
  );

  const explain =
    minute === 0
      ? `${hour} h pile : le nombre commande l'accord de час — ${correct}.`
      : minute === 30
        ? `La demie se dit « la moitié de l'heure SUIVANTE » : ${hour} h 30 → ${correct}.`
        : minute < 30
          ? `Avant la demie, on ajoute les minutes à l'heure suivante (${nextHour(hour)}ᵉ) : ${correct}.`
          : `Après la demie, on retranche de l'heure suivante avec без + génitif : ${correct}.`;

  return {
    itemId: `time:${hour}:${minute}`,
    prompt: "Quelle heure est-il, en langue courante ?",
    question: `${hour}:${String(minute).padStart(2, "0")}`,
    options,
    correctIndex,
    explain,
  };
}

// ─────────────────────────────────────────────────────────────────
// 3. Les dates
// ─────────────────────────────────────────────────────────────────

const MONTHS_GEN = [
  "января́", "февраля́", "ма́рта", "апре́ля", "ма́я", "ию́ня",
  "ию́ля", "а́вгуста", "сентября́", "октября́", "ноября́", "декабря́",
];

const MONTHS_NOM = [
  "янва́рь", "февра́ль", "март", "апре́ль", "май", "ию́нь",
  "ию́ль", "а́вгуст", "сентя́брь", "октя́брь", "ноя́брь", "дека́брь",
];

const DAY_ORDINAL_NOM = [
  "пе́рвое", "второ́е", "тре́тье", "четвёртое", "пя́тое", "шесто́е",
  "седьмо́е", "восьмо́е", "девя́тое", "деся́тое",
];

const DAY_ORDINAL_GEN = [
  "пе́рвого", "второ́го", "тре́тьего", "четвёртого", "пя́того", "шесто́го",
  "седьмо́го", "восьмо́го", "девя́того", "деся́того",
];

function dateExercise(random: Rng): PracticeExercise {
  const day = 1 + Math.floor(random() * 10);
  const month = Math.floor(random() * 12);
  const situate = random() < 0.5;

  const nom = `${DAY_ORDINAL_NOM[day - 1]} ${MONTHS_GEN[month]}`;
  const gen = `${DAY_ORDINAL_GEN[day - 1]} ${MONTHS_GEN[month]}`;
  const correct = situate ? gen : nom;

  const candidates = [
    situate ? nom : gen,
    `${DAY_ORDINAL_NOM[day - 1]} ${MONTHS_NOM[month]}`,
    `${DAY_ORDINAL_GEN[day - 1]} ${MONTHS_NOM[month]}`,
  ];
  const { options, correctIndex } = buildOptions(correct, candidates, random);

  return {
    itemId: `date:${day}:${month}:${situate ? "when" : "what"}`,
    prompt: situate ? "Situe l'événement" : "Annonce la date",
    question: situate ? "Он прие́дет ___." : "Сего́дня ___.",
    hint: situate
      ? `Il arrivera le ${day} ${MONTHS_GEN[month].replace("я́", "")}…`
      : `Nous sommes le ${day}…`,
    badge: `${day} / ${month + 1}`,
    options,
    correctIndex,
    explain: situate
      ? "Pour SITUER un événement, l'ordinal passe au génitif, et sans aucune préposition. Le mois reste au génitif dans les deux cas."
      : "Pour ANNONCER la date, l'ordinal est au nominatif neutre (число́ sous-entendu) et le mois au génitif.",
  };
}

// ─────────────────────────────────────────────────────────────────
// 4. L'âge
// ─────────────────────────────────────────────────────────────────

const PEOPLE = [
  { subject: "Мне", fr: "J'ai" },
  { subject: "Ему́", fr: "Il a" },
  { subject: "Ей", fr: "Elle a" },
  { subject: "Моему́ бра́ту", fr: "Mon frère a" },
  { subject: "Мое́й сестре́", fr: "Ma sœur a" },
] as const;

const AGES = [1, 2, 3, 4, 5, 7, 11, 12, 18, 21, 22, 25, 31, 40, 51] as const;

/** Год au bon cas : год, го́да, лет — la même règle que pour n'importe quel nom. */
export function yearWord(age: number): string {
  const last = age % 100;
  if (last >= 11 && last <= 14) return "лет";
  const unit = age % 10;
  if (unit === 1) return "год";
  if (unit >= 2 && unit <= 4) return "го́да";
  return "лет";
}

const AGE_NUMERALS: Record<number, string> = {
  1: "оди́н", 2: "два", 3: "три", 4: "четы́ре", 5: "пять", 7: "семь",
  11: "оди́ннадцать", 12: "двена́дцать", 18: "восемна́дцать", 21: "два́дцать оди́н",
  22: "два́дцать два", 25: "два́дцать пять", 31: "три́дцать оди́н", 40: "со́рок",
  51: "пятьдеся́т оди́н",
};

function ageExercise(random: Rng): PracticeExercise {
  const person = pick(PEOPLE, random);
  const age = pick(AGES, random);
  const correct = yearWord(age);
  const { options, correctIndex } = buildOptions(correct, ["год", "го́да", "лет", "года́м"], random);
  const last = age % 100;

  return {
    itemId: `age:${age}`,
    prompt: "Complète",
    question: `${person.subject} ${AGE_NUMERALS[age]} ___.`,
    hint: `${person.fr} ${age} ans.`,
    options,
    correctIndex,
    explain:
      last >= 11 && last <= 14
        ? `${age} est un « adolescent » (11-14) : лет, comme après 5.`
        : correct === "год"
          ? `${age} se termine par 1 : nominatif singulier, год.`
          : correct === "го́да"
            ? `${age} se termine par 2, 3 ou 4 : génitif singulier, го́да.`
            : `${age} appelle le génitif pluriel, et год y fait лет — une forme empruntée à ле́то.`,
  };
}

// ─────────────────────────────────────────────────────────────────
// 5. Durée et délai — les seuls contextes écrits du module
// ─────────────────────────────────────────────────────────────────

interface DurationContext {
  id: string;
  ru: string;
  fr: string;
  correct: string;
  why: string;
}

const DURATION_OPTIONS = ["за час", "че́рез час", "на час", "час"];

const DURATION_CONTEXTS: DurationContext[] = [
  {
    id: "read-two-hours",
    ru: "Я чита́л ___ и о́чень уста́л.",
    fr: "J'ai lu deux heures et je suis très fatigué.",
    correct: "два часа́",
    why: "Combien de temps l'activité a duré : accusatif seul, sans préposition, avec un verbe imperfectif.",
  },
  {
    id: "finished-in-two-hours",
    ru: "Он сде́лал всю рабо́ту ___.",
    fr: "Il a fait tout le travail en deux heures.",
    correct: "за два часа́",
    why: "Le temps qu'il a fallu pour ABOUTIR : за + accusatif, et le verbe est perfectif.",
  },
  {
    id: "call-in-an-hour",
    ru: "Позвони́ мне ___.",
    fr: "Appelle-moi dans une heure.",
    correct: "че́рез час",
    why: "Un délai à partir de maintenant : че́рез + accusatif.",
  },
  {
    id: "came-for-a-week",
    ru: "Он прие́хал в Москву́ ___.",
    fr: "Il est venu à Moscou pour une semaine.",
    correct: "на неде́лю",
    why: "La durée PRÉVUE du séjour, après un verbe de déplacement : на + accusatif.",
  },
  {
    id: "lived-three-years",
    ru: "Мы жи́ли в Петербу́рге ___.",
    fr: "Nous avons vécu trois ans à Saint-Pétersbourg.",
    correct: "три го́да",
    why: "Durée effective : accusatif seul. На три го́да dirait qu'on y était venu POUR trois ans.",
  },
  {
    id: "borrowed-for-a-week",
    ru: "Я взял кни́гу ___.",
    fr: "J'ai emprunté le livre pour une semaine.",
    correct: "на неде́лю",
    why: "На + accusatif : la durée porte sur l'état qui résulte de l'action, pas sur l'action elle-même.",
  },
  {
    id: "ready-in-five-minutes",
    ru: "Всё бу́дет гото́во ___.",
    fr: "Tout sera prêt dans cinq minutes.",
    correct: "че́рез пять мину́т",
    why: "Че́рез compte à partir du moment où l'on parle.",
  },
  {
    id: "wrote-in-a-week",
    ru: "Она́ написа́ла статью́ ___.",
    fr: "Elle a écrit l'article en une semaine.",
    correct: "за неде́лю",
    why: "За + accusatif mesure le temps nécessaire au résultat — le verbe est perfectif (написа́ла).",
  },
];

const DURATION_DISTRACTORS: Record<string, string[]> = {
  "два часа́": ["за два часа́", "че́рез два часа́", "на два часа́"],
  "за два часа́": ["два часа́", "че́рез два часа́", "на два часа́"],
  "че́рез час": ["за час", "на час", "час"],
  "на неде́лю": ["неде́лю", "за неде́лю", "че́рез неде́лю"],
  "три го́да": ["на три го́да", "за три го́да", "че́рез три го́да"],
  "че́рез пять мину́т": ["за пять мину́т", "на пять мину́т", "пять мину́т"],
  "за неде́лю": ["неде́лю", "на неде́лю", "че́рез неде́лю"],
};

function durationExercise(random: Rng): PracticeExercise {
  const context = pick(DURATION_CONTEXTS, random);
  const { options, correctIndex } = buildOptions(
    context.correct,
    DURATION_DISTRACTORS[context.correct] ?? DURATION_OPTIONS,
    random
  );
  return {
    itemId: `duration:${context.id}`,
    prompt: "Complète",
    question: context.ru,
    hint: context.fr,
    options,
    correctIndex,
    explain: context.why,
  };
}

// ─────────────────────────────────────────────────────────────────
// Tirage et correction
// ─────────────────────────────────────────────────────────────────

export function generateNumberExercise(skill: string, random: Rng = Math.random): PracticeExercise {
  switch (skill) {
    case "agreement":
      return agreementExercise(random);
    case "time":
      return timeExercise(random);
    case "date":
      return dateExercise(random);
    case "age":
      return ageExercise(random);
    case "duration":
      return durationExercise(random);
    default:
      throw new Error(`Compétence inconnue : ${skill}`);
  }
}

/**
 * Rejoue la correction côté serveur à partir du seul `itemId`.
 *
 * Chaque identifiant contient tout ce qu'il faut pour recalculer la réponse
 * — le nom et le nombre, l'heure, la date — si bien que le serveur n'a
 * besoin d'aucun état de session et que le client ne peut rien affirmer.
 */
export function checkNumberAnswer(itemId: string, answer: string): boolean | null {
  const [skill, ...rest] = itemId.split(":");
  switch (skill) {
    case "agreement": {
      const [nounId, value] = rest;
      const noun = NOUNS.find((n) => n.id === nounId);
      const number = AGREEMENT_NUMBERS.find((n) => String(n.value) === value);
      if (!noun || !number || !noun.forms.plural) return null;
      return formFor(noun, number.zone) === answer;
    }
    case "time": {
      const hour = Number(rest[0]);
      const minute = Number(rest[1]);
      if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
      if (hour < 1 || hour > 12 || minute % 5 !== 0 || minute > 55) return null;
      return tellTime(hour, minute) === answer;
    }
    case "date": {
      const day = Number(rest[0]);
      const month = Number(rest[1]);
      const situate = rest[2] === "when";
      if (!(day >= 1 && day <= 10) || !(month >= 0 && month <= 11)) return null;
      const expected = `${(situate ? DAY_ORDINAL_GEN : DAY_ORDINAL_NOM)[day - 1]} ${MONTHS_GEN[month]}`;
      return expected === answer;
    }
    case "age": {
      const age = Number(rest[0]);
      if (!AGE_NUMERALS[age]) return null;
      return yearWord(age) === answer;
    }
    case "duration": {
      const context = DURATION_CONTEXTS.find((c) => c.id === rest[0]);
      if (!context) return null;
      return context.correct === answer;
    }
    default:
      return null;
  }
}

export { AGREEMENT_NUMBERS, COUNTABLE, DURATION_CONTEXTS };
