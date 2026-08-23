import {
  MOTION_PAIRS,
  MOTION_PREFIXES,
  getPair,
  getPrefix,
  type MotionMode,
  type MotionPair,
  type MotionPrefix,
  type TrajectorySchema,
} from "./verbs";
import { getCase } from "@/lib/grammar/cases";

/**
 * Quatre compétences, dans l'ordre où elles se construisent. Chacune isole
 * UNE difficulté : mélanger le mode et la direction dans un même exercice
 * ne dit pas laquelle des deux a fait échouer l'apprenant.
 */
export const MOTION_SKILLS = [
  {
    id: "mode",
    title: "À pied ou en véhicule",
    level: "A1",
    summary:
      "Le français dit « aller » pour tout. Le russe choisit le verbe selon le moyen de déplacement — « Я иду в Москву » signifie qu'on s'y rend à pied.",
  },
  {
    id: "direction",
    title: "Un trajet ou une habitude",
    level: "A2",
    summary:
      "идти = un trajet en cours, dans une direction. ходить = une habitude, un aller-retour, une aptitude. Au passé, « ходил » veut dire qu'on est allé ET revenu.",
  },
  {
    id: "prefix",
    title: "Les préfixes",
    level: "B1",
    summary:
      "при-, у-, в-, вы-, под-… changent le sens et rendent le verbe perfectif. Préfixe + идти donne un perfectif, préfixe + ходить son imperfectif.",
  },
  {
    id: "government",
    title: "Préfixe, préposition et cas",
    level: "B1",
    summary:
      "Chaque préfixe appelle sa préposition, et chaque préposition son cas : выйти из + génitif, подойти к + datif, войти в + accusatif.",
  },
] as const;

export type MotionSkillId = (typeof MOTION_SKILLS)[number]["id"];

export function getSkill(id: string) {
  return MOTION_SKILLS.find((s) => s.id === id);
}

export interface MotionExercise {
  skill: MotionSkillId;
  /** Identifie l'item pour que le serveur puisse rejuger la réponse. */
  itemId: string;
  prompt: string;
  /** Phrase russe à trou, si l'exercice en a une. */
  sentence?: string;
  sentenceFr: string;
  schema?: TrajectorySchema;
  mode?: MotionMode;
  options: string[];
  correctIndex: number;
  explain: string;
}

function shuffleWithAnswer(options: string[], correct: string, random: () => number) {
  const copy = [...options];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return { options: copy, correctIndex: copy.indexOf(correct) };
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

// ─── 1. Mode de déplacement ────────────────────────────────────────
// Le schéma montre le moyen de transport ; la phrase française ne le
// répète pas. L'apprenant lit l'image, pas une traduction.
const MODE_DESTINATIONS: Record<MotionMode, { ru: string; fr: string }[]> = {
  foot: [
    { ru: "в школу", fr: "à l'école" },
    { ru: "в магазин", fr: "au magasin" },
    { ru: "домой", fr: "à la maison" },
  ],
  vehicle: [
    { ru: "в Москву", fr: "à Moscou" },
    { ru: "на работу", fr: "au travail" },
    { ru: "в центр", fr: "dans le centre" },
  ],
  air: [
    { ru: "в Париж", fr: "à Paris" },
    { ru: "домой", fr: "à la maison" },
  ],
  water: [
    { ru: "к острову", fr: "vers l'île" },
    { ru: "через реку", fr: "de l'autre côté de la rivière" },
  ],
  carry: [
    { ru: "книги в библиотеку", fr: "des livres à la bibliothèque" },
    { ru: "сумку домой", fr: "un sac à la maison" },
  ],
};

function modeExercise(random: () => number): MotionExercise {
  // La phrase dit « je vais » : seuls les verbes d'« aller » peuvent être la
  // réponse. Les verbes de manière (courir, porter) restent en distracteurs,
  // où ils testent utilement la confusion aller/courir.
  const pair = pick(MOTION_PAIRS.filter((p) => p.isGoing), random);
  const destination = pick(MODE_DESTINATIONS[pair.mode], random);
  const correct = pair.uniForms.present1;
  const others = MOTION_PAIRS.filter((p) => p.id !== pair.id);
  for (let i = others.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const distractors = others.slice(0, 3).map((p) => p.uniForms.present1);

  const { options, correctIndex } = shuffleWithAnswer(
    [correct, ...distractors],
    correct,
    random
  );
  return {
    skill: "mode",
    itemId: `mode:${pair.id}:${destination.ru}`,
    prompt: "Quel verbe correspond au mode de déplacement montré ?",
    sentence: `Я ___ ${destination.ru}.`,
    sentenceFr: `Je vais ${destination.fr}.`,
    schema: "oneway",
    mode: pair.mode,
    options,
    correctIndex,
    explain: `${pair.uni} / ${pair.multi} = ${pair.translation}. Le russe choisit le verbe selon le moyen de déplacement (${MODE_LABEL_FR[pair.mode]}), là où le français dit « aller » dans tous les cas.`,
  };
}

const MODE_LABEL_FR: Record<MotionMode, string> = {
  foot: "à pied",
  vehicle: "en véhicule",
  air: "en avion",
  water: "par l'eau",
  carry: "en portant quelque chose",
};

// ─── 2. Unidirectionnel vs multidirectionnel ───────────────────────
// Deux variantes : lire un schéma de trajet, ou repérer le marqueur
// temporel dans la phrase. La seconde est celle qui piège vraiment.
interface DirectionContext {
  id: string;
  schema: TrajectorySchema;
  /** Modes compatibles avec la destination de la phrase. */
  modes: MotionMode[];
  /** Marqueur qui impose la réponse. */
  marker: string;
  fr: string;
  form: "present1" | "present3" | "pastM" | "infinitive";
  answer: "uni" | "multi";
  why: string;
}

const DIRECTION_CONTEXTS: DirectionContext[] = [
  {
    id: "now",
    modes: ["foot", "vehicle"],
    schema: "oneway",
    marker: "Сейчас я ___ в университет.",
    fr: "En ce moment, je vais à l'université.",
    form: "present1",
    answer: "uni",
    why: "« Сейчас » : un trajet en cours, dans une direction — unidirectionnel.",
  },
  {
    id: "every-day",
    modes: ["foot", "vehicle"],
    schema: "repeated",
    marker: "Каждый день я ___ в университет.",
    fr: "Chaque jour, je vais à l'université.",
    form: "present1",
    answer: "multi",
    why: "« Каждый день » : une habitude qui se répète — multidirectionnel.",
  },
  {
    id: "usually",
    modes: ["foot", "vehicle"],
    schema: "repeated",
    marker: "Обычно я ___ на работу утром.",
    fr: "D'habitude, je vais au travail le matin.",
    form: "present1",
    answer: "multi",
    why: "« Обычно » marque l'habitude — multidirectionnel.",
  },
  {
    id: "yesterday-roundtrip",
    modes: ["foot", "vehicle"],
    schema: "roundtrip",
    marker: "Вчера он ___ в кино.",
    fr: "Hier, il est allé au cinéma (et il en est revenu).",
    form: "pastM",
    answer: "multi",
    why: "Le piège classique : au passé, le multidirectionnel dit qu'on est allé ET revenu. « Он шёл в кино » signifierait qu'il était en chemin, sans dire s'il y est arrivé.",
  },
  {
    id: "on-the-way",
    modes: ["foot", "vehicle"],
    schema: "oneway",
    marker: "Когда он ___ домой, начался дождь.",
    fr: "Alors qu'il rentrait chez lui, la pluie a commencé.",
    form: "pastM",
    answer: "uni",
    why: "Une action en cours pendant laquelle une autre survient : le trajet n'est pas terminé — unidirectionnel.",
  },
  {
    id: "where-going",
    modes: ["foot", "vehicle"],
    schema: "oneway",
    marker: "Куда ты ___?",
    fr: "Où vas-tu (là, maintenant) ?",
    form: "present1",
    answer: "uni",
    why: "« Куда ты…? » interroge sur un trajet en cours — unidirectionnel.",
  },
  {
    id: "tomorrow",
    // « в Москву » exclut le trajet à pied.
    modes: ["vehicle"],
    schema: "oneway",
    marker: "Завтра я ___ в Москву.",
    fr: "Demain, je vais à Moscou.",
    form: "present1",
    answer: "uni",
    why: "Un déplacement prévu, unique et daté : le présent unidirectionnel sert de futur proche.",
  },
  {
    id: "never",
    modes: ["vehicle"],
    schema: "repeated",
    marker: "Он никогда не ___ в Россию.",
    fr: "Il n'est jamais allé en Russie.",
    form: "pastM",
    answer: "multi",
    why: "« Никогда не » porte sur l'expérience en général, pas sur un trajet précis — multidirectionnel.",
  },
  {
    id: "around-town",
    modes: ["foot", "vehicle"],
    schema: "repeated",
    marker: "Мы долго ___ по городу.",
    fr: "Nous avons longtemps circulé dans la ville.",
    form: "pastM",
    answer: "multi",
    why: "« По + datif » décrit un déplacement sans destination unique, dans tous les sens — multidirectionnel.",
  },
  {
    id: "likes",
    modes: ["foot"],
    schema: "repeated",
    marker: "Я люблю ___ пешком.",
    fr: "J'aime marcher.",
    form: "infinitive",
    answer: "multi",
    why: "Un goût ou une aptitude générale, sans trajet précis — multidirectionnel.",
  },
  {
    id: "can-walk",
    modes: ["foot"],
    schema: "repeated",
    marker: "Ребёнок уже умеет ___.",
    fr: "L'enfant sait déjà marcher.",
    form: "infinitive",
    answer: "multi",
    why: "Savoir faire quelque chose est une aptitude, pas un trajet — multidirectionnel.",
  },
  {
    id: "bus-now",
    modes: ["vehicle"],
    schema: "oneway",
    marker: "Смотри, автобус ___ в центр.",
    fr: "Regarde, le bus va vers le centre.",
    form: "present3",
    answer: "uni",
    why: "Le trajet est visible, en cours, dans une direction — unidirectionnel.",
  },
  {
    id: "often",
    modes: ["foot", "vehicle"],
    schema: "repeated",
    marker: "Он часто ___ к бабушке.",
    fr: "Il va souvent chez sa grand-mère.",
    form: "pastM",
    answer: "multi",
    why: "« Часто » marque la répétition — multidirectionnel.",
  },
];

/** L'infinitif est le lemme lui-même ; les autres formes sont dans la table. */
function formOf(pair: MotionPair, context: DirectionContext, which: "uni" | "multi"): string {
  if (context.form === "infinitive") return which === "uni" ? pair.uni : pair.multi;
  return which === "uni" ? pair.uniForms[context.form] : pair.multiForms[context.form];
}

function directionExercise(random: () => number): MotionExercise {
  const context = pick(DIRECTION_CONTEXTS, random);
  // Le contexte fixe la destination (« в университет », « в кино ») : seuls
  // les verbes d'« aller » dont le mode y mène sont éligibles. On ne va pas
  // au cinéma à la nage.
  const pair = pick(
    MOTION_PAIRS.filter((p) => p.isGoing && context.modes.includes(p.mode)),
    random
  );
  const uniForm = formOf(pair, context, "uni");
  const multiForm = formOf(pair, context, "multi");
  const correct = context.answer === "uni" ? uniForm : multiForm;

  const { options, correctIndex } = shuffleWithAnswer([uniForm, multiForm], correct, random);
  return {
    skill: "direction",
    itemId: `direction:${pair.id}:${context.id}`,
    prompt: "Trajet unique ou habitude ?",
    sentence: context.marker,
    sentenceFr: context.fr,
    schema: context.schema,
    mode: pair.mode,
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct} (${pair.uni} / ${pair.multi}).`,
  };
}

// ─── 3. Préfixes ───────────────────────────────────────────────────
// Le schéma porte tout le sens : une flèche qui entre, qui sort, qui
// s'arrête au bord, qui contourne. L'apprenant lit la géométrie.
function prefixExercise(random: () => number): MotionExercise {
  const target = pick(MOTION_PREFIXES, random);
  const others = MOTION_PREFIXES.filter((p) => p.id !== target.id && p.schema !== target.schema);
  const distractors: MotionPrefix[] = [];
  const shuffled = [...others];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (const p of shuffled) {
    if (distractors.length >= 3) break;
    if (!distractors.some((d) => d.perfective === p.perfective)) distractors.push(p);
  }

  const { options, correctIndex } = shuffleWithAnswer(
    [target.perfective, ...distractors.map((d) => d.perfective)],
    target.perfective,
    random
  );
  return {
    skill: "prefix",
    itemId: `prefix:${target.id}`,
    prompt: "Quel verbe décrit ce trajet ?",
    sentenceFr: target.translation,
    schema: target.schema,
    mode: "foot",
    options,
    correctIndex,
    explain: `${target.prefix} → ${target.perfective} / ${target.imperfective} = ${target.translation}. ${target.example.ru} — ${target.example.fr} Préfixe + идти donne le perfectif, préfixe + ходить l'imperfectif.`,
  };
}

// ─── 4. Préfixe, préposition et cas ────────────────────────────────
// Le pont avec le module Cas : le préfixe impose la préposition, la
// préposition impose le cas.
interface GovernmentTarget {
  prefixId: string;
  /** Groupe attendu, déjà décliné. */
  correct: string;
  distractors: string[];
  sentence: string;
  sentenceFr: string;
}

const GOVERNMENT_ITEMS: GovernmentTarget[] = [
  {
    prefixId: "vy",
    correct: "из магазина",
    distractors: ["из магазин", "от магазина", "с магазина"],
    sentence: "Она вышла ___.",
    sentenceFr: "Elle est sortie du magasin.",
  },
  {
    prefixId: "v",
    correct: "в комнату",
    distractors: ["в комнате", "в комнаты", "к комнате"],
    sentence: "Он вошёл ___.",
    sentenceFr: "Il est entré dans la pièce.",
  },
  {
    prefixId: "pod",
    correct: "к окну",
    distractors: ["к окно", "у окна", "в окно"],
    sentence: "Он подошёл ___.",
    sentenceFr: "Il s'est approché de la fenêtre.",
  },
  {
    prefixId: "ot",
    correct: "от двери",
    distractors: ["от дверь", "из двери", "к двери"],
    sentence: "Она отошла ___.",
    sentenceFr: "Elle s'est écartée de la porte.",
  },
  {
    prefixId: "do",
    correct: "до вокзала",
    distractors: ["до вокзал", "к вокзалу", "на вокзал"],
    sentence: "Мы дошли ___.",
    sentenceFr: "Nous sommes allés jusqu'à la gare.",
  },
  {
    prefixId: "pri",
    correct: "на работу",
    distractors: ["на работе", "к работе", "в работу"],
    sentence: "Он пришёл ___.",
    sentenceFr: "Il est arrivé au travail.",
  },
  {
    prefixId: "u",
    correct: "из дома",
    distractors: ["из дом", "от дома", "с дома"],
    sentence: "Она ушла ___.",
    sentenceFr: "Elle est partie de la maison.",
  },
  {
    prefixId: "pere",
    correct: "через улицу",
    distractors: ["через улице", "через улицы", "по улице"],
    sentence: "Он перешёл ___.",
    sentenceFr: "Il a traversé la rue.",
  },
  {
    prefixId: "vy",
    correct: "из автобуса",
    distractors: ["из автобус", "с автобуса", "от автобуса"],
    sentence: "Он вышел ___.",
    sentenceFr: "Il est descendu du bus.",
  },
  {
    prefixId: "do",
    correct: "до парка",
    distractors: ["до парк", "к парку", "в парк"],
    sentence: "Они дошли ___.",
    sentenceFr: "Ils sont allés jusqu'au parc.",
  },
  {
    prefixId: "pod",
    correct: "к столу",
    distractors: ["к стол", "у стола", "на стол"],
    sentence: "Она подошла ___.",
    sentenceFr: "Elle s'est approchée de la table.",
  },
  {
    prefixId: "pere",
    correct: "через дорогу",
    distractors: ["через дороге", "через дороги", "по дороге"],
    sentence: "Дети перешли ___.",
    sentenceFr: "Les enfants ont traversé la route.",
  },
  {
    prefixId: "ob",
    correct: "дом",
    distractors: ["дома", "дому", "домом"],
    sentence: "Он обошёл ___.",
    sentenceFr: "Il a contourné la maison.",
  },
  {
    prefixId: "za",
    correct: "к другу",
    distractors: ["к друга", "у друга", "в друга"],
    sentence: "Я зашёл ___.",
    sentenceFr: "Je suis passé chez un ami.",
  },
];

function governmentExercise(random: () => number): MotionExercise {
  const item = pick(GOVERNMENT_ITEMS, random);
  const prefix = getPrefix(item.prefixId)!;
  const { options, correctIndex } = shuffleWithAnswer(
    [item.correct, ...item.distractors],
    item.correct,
    random
  );
  const caseName = getCase(prefix.governs)?.nameFr ?? prefix.governs;
  return {
    skill: "government",
    itemId: `government:${item.prefixId}:${item.correct}`,
    prompt: "Quelle préposition, et à quel cas ?",
    sentence: item.sentence,
    sentenceFr: item.sentenceFr,
    schema: prefix.schema,
    mode: "foot",
    options,
    correctIndex,
    explain: `${prefix.perfective} appelle « ${prefix.preposition} » + ${caseName.toLowerCase()} : ${item.correct}.`,
  };
}

const GENERATORS: Record<MotionSkillId, (random: () => number) => MotionExercise> = {
  mode: modeExercise,
  direction: directionExercise,
  prefix: prefixExercise,
  government: governmentExercise,
};

export function generateMotionExercise(
  skill: MotionSkillId,
  random: () => number = Math.random
): MotionExercise {
  return GENERATORS[skill](random);
}

/**
 * Rejoue la correction d'un item à partir de son seul identifiant : le
 * client envoie ce qu'il a répondu, jamais s'il avait juste. Même principe
 * que le module Cas — un seul verdict, côté serveur.
 */
export function checkMotionAnswer(itemId: string, answer: string): boolean | null {
  const [kind, ...rest] = itemId.split(":");
  if (kind === "mode") {
    const pair = getPair(rest[0]);
    return pair ? pair.uniForms.present1 === answer : null;
  }
  if (kind === "direction") {
    const pair = getPair(rest[0]);
    const context = DIRECTION_CONTEXTS.find((c) => c.id === rest[1]);
    if (!pair || !context) return null;
    return formOf(pair, context, context.answer) === answer;
  }
  if (kind === "prefix") {
    const prefix = getPrefix(rest[0]);
    return prefix ? prefix.perfective === answer : null;
  }
  if (kind === "government") {
    const item = GOVERNMENT_ITEMS.find(
      (g) => g.prefixId === rest[0] && g.correct === rest.slice(1).join(":")
    );
    return item ? item.correct === answer : null;
  }
  return null;
}

export const MOTION_CONTEXT_COUNT = DIRECTION_CONTEXTS.length;
export const MOTION_GOVERNMENT_COUNT = GOVERNMENT_ITEMS.length;
export { DIRECTION_CONTEXTS, GOVERNMENT_ITEMS };
export type { MotionPair };
