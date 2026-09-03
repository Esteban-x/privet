import type { CaseId } from "@/lib/grammar/types";

/**
 * Verbes de mouvement russes — la difficulté n°1 pour un francophone, parce
 * que le français dit « aller » là où le russe impose trois distinctions
 * simultanées :
 *
 *   1. LE MODE      à pied / en véhicule / en avion / par l'eau
 *                   « Я иду в Москву » veut dire qu'on y va À PIED.
 *   2. LA DIRECTION unidirectionnel (un trajet, en cours) vs
 *                   multidirectionnel (habitude, aller-retour, aptitude).
 *                   Le piège : au passé, « вчера я ходил в кино » = j'y suis
 *                   allé ET revenu ; « я шёл в кино » = j'étais en chemin.
 *   3. LE PRÉFIXE   при-, у-, в-, вы-, под-, от-… qui change le sens ET
 *                   l'aspect, et impose sa propre préposition + son cas.
 *
 * Les formes conjuguées sont des DONNÉES, pas des règles : идти fait « шёл »
 * au passé, вы- porte toujours l'accent (вы́шел, jamais « вышёл »). Même
 * discipline que pour les déclinaisons — ce qui n'est pas dérivable est
 * écrit et vérifié (scripts/check-motion.mjs).
 */

export type MotionMode = "foot" | "vehicle" | "air" | "water" | "carry";

export const MODE_LABEL: Record<MotionMode, string> = {
  foot: "à pied",
  vehicle: "en véhicule",
  air: "en avion",
  water: "par l'eau",
  carry: "en portant",
};

/**
 * Les formes servies par les exercices, accentuées.
 *
 * `present2` et `pastPl` MANQUAIENT, et leur absence se voyait à l'écran.
 * Le contexte « Куда ты ___ ? » demandait `present1` faute de mieux, donc
 * « Куда ты иду́ ? » — avec « иду́ » présenté comme la bonne réponse. « Мы
 * до́лго ___ по го́роду » demandait `pastM` : « Мы до́лго ходи́л ». Deux
 * phrases fausses, servies avec l'autorité d'un exercice corrigé.
 *
 * Aucun contrôle ne pouvait les voir : ils vérifiaient que les formes
 * étaient justes (elles l'étaient) et que les distracteurs différaient de
 * la réponse (ils différaient). Personne ne vérifiait que le SUJET de la
 * phrase s'accordait avec la forme attendue — c'est fait maintenant.
 */
export interface MotionForms {
  /** 1re personne du singulier au présent (я …). */
  present1: string;
  /** 2e personne du singulier au présent (ты …). */
  present2: string;
  /** 3e personne du singulier au présent (он/она …). */
  present3: string;
  /** Passé masculin (он …). */
  pastM: string;
  /** Passé féminin (она …). */
  pastF: string;
  /** Passé pluriel (мы/вы/они …). */
  pastPl: string;
}

export interface MotionPair {
  id: string;
  /** Unidirectionnel : un trajet, une direction, en cours. */
  uni: string;
  /** Multidirectionnel : habitude, aller-retour, aptitude générale. */
  multi: string;
  translation: string;
  mode: MotionMode;
  /**
   * Vrai pour les verbes qui traduisent « aller » (идти, ехать, лететь,
   * плыть). Les autres disent une MANIÈRE — courir, porter — et ne peuvent
   * pas servir aux exercices dont la phrase française dit « je vais » :
   * « Je vais à la maison » ne se rend pas par « бегу ».
   */
  isGoing: boolean;
  uniForms: MotionForms;
  multiForms: MotionForms;
}

export const MOTION_PAIRS: MotionPair[] = [
  {
    id: "idti",
    uni: "идти́",
    multi: "ходи́ть",
    translation: "aller (à pied)",
    mode: "foot",
    isGoing: true,
    // Passé supplétif : шёл, aucune règle ne le tire de « идти ».
    uniForms: {
      present1: "иду́",
      present2: "идёшь",
      present3: "идёт",
      pastM: "шёл",
      pastF: "шла",
      pastPl: "шли",
    },
    multiForms: {
      present1: "хожу́",
      present2: "хо́дишь",
      present3: "хо́дит",
      pastM: "ходи́л",
      pastF: "ходи́ла",
      pastPl: "ходи́ли",
    },
  },
  {
    id: "ekhat",
    uni: "е́хать",
    multi: "е́здить",
    translation: "aller (en véhicule)",
    mode: "vehicle",
    isGoing: true,
    uniForms: {
      present1: "е́ду",
      present2: "е́дешь",
      present3: "е́дет",
      pastM: "е́хал",
      pastF: "е́хала",
      pastPl: "е́хали",
    },
    multiForms: {
      present1: "е́зжу",
      present2: "е́здишь",
      present3: "е́здит",
      pastM: "е́здил",
      pastF: "е́здила",
      pastPl: "е́здили",
    },
  },
  {
    id: "letet",
    uni: "лете́ть",
    multi: "лета́ть",
    translation: "voler, aller (en avion)",
    mode: "air",
    isGoing: true,
    uniForms: {
      present1: "лечу́",
      present2: "лети́шь",
      present3: "лети́т",
      pastM: "лете́л",
      pastF: "лете́ла",
      pastPl: "лете́ли",
    },
    multiForms: {
      present1: "лета́ю",
      present2: "лета́ешь",
      present3: "лета́ет",
      pastM: "лета́л",
      pastF: "лета́ла",
      pastPl: "лета́ли",
    },
  },
  {
    id: "plyt",
    uni: "плыть",
    multi: "пла́вать",
    translation: "nager, naviguer",
    mode: "water",
    isGoing: true,
    uniForms: {
      present1: "плыву́",
      present2: "плывёшь",
      present3: "плывёт",
      pastM: "плыл",
      pastF: "плыла́",
      pastPl: "плы́ли",
    },
    multiForms: {
      present1: "пла́ваю",
      present2: "пла́ваешь",
      present3: "пла́вает",
      pastM: "пла́вал",
      pastF: "пла́вала",
      pastPl: "пла́вали",
    },
  },
  {
    id: "bezhat",
    uni: "бежа́ть",
    multi: "бе́гать",
    translation: "courir",
    mode: "foot",
    isGoing: false,
    uniForms: {
      present1: "бегу́",
      present2: "бежи́шь",
      present3: "бежи́т",
      pastM: "бежа́л",
      pastF: "бежа́ла",
      pastPl: "бежа́ли",
    },
    multiForms: {
      present1: "бе́гаю",
      present2: "бе́гаешь",
      present3: "бе́гает",
      pastM: "бе́гал",
      pastF: "бе́гала",
      pastPl: "бе́гали",
    },
  },
  {
    id: "nesti",
    uni: "нести́",
    multi: "носи́ть",
    translation: "porter (en marchant)",
    mode: "carry",
    isGoing: false,
    uniForms: {
      present1: "несу́",
      present2: "несёшь",
      present3: "несёт",
      pastM: "нёс",
      pastF: "несла́",
      pastPl: "несли́",
    },
    multiForms: {
      present1: "ношу́",
      present2: "но́сишь",
      present3: "но́сит",
      pastM: "носи́л",
      pastF: "носи́ла",
      pastPl: "носи́ли",
    },
  },
];

/**
 * Schémas de trajectoire dessinés par components/motion/TrajectoryDiagram.
 * Ce sont des SCHÉMAS, pas des illustrations : ce qui distingue идти de
 * ходить n'est pas la scène (un piéton dans les deux cas) mais la forme du
 * trajet. Une photo de quelqu'un qui marche n'enseigne rien ; une flèche qui
 * revient à son point de départ, si.
 */
export type TrajectorySchema =
  | "oneway"
  | "roundtrip"
  | "repeated"
  | "into"
  | "outof"
  | "upto"
  | "awayfrom"
  | "across"
  | "around"
  | "past"
  | "reach";

export interface MotionPrefix {
  id: string;
  prefix: string;
  /** Perfectif : préfixe + verbe unidirectionnel. */
  perfective: string;
  /** Imperfectif : préfixe + verbe multidirectionnel. */
  imperfective: string;
  translation: string;
  schema: TrajectorySchema;
  /** Passé du perfectif, masculin et féminin. */
  pastM: string;
  pastF: string;
  /** Préposition imposée et cas qu'elle régit. */
  preposition: string;
  governs: CaseId;
  /** Exemple complet, pour l'explication. */
  example: { ru: string; fr: string };
}

/**
 * Règle d'aspect qui structure tout le système : préfixe + unidirectionnel
 * donne un PERFECTIF (прийти), préfixe + multidirectionnel donne son
 * IMPERFECTIF (приходить). Les deux forment une paire aspectuelle régulière.
 */
export const MOTION_PREFIXES: MotionPrefix[] = [
  {
    id: "pri",
    prefix: "при-",
    perfective: "прийти́",
    imperfective: "приходи́ть",
    translation: "arriver, venir",
    schema: "reach",
    pastM: "пришёл",
    pastF: "пришла́",
    preposition: "в / на",
    governs: "accusative",
    example: { ru: "Он пришёл на рабо́ту.", fr: "Il est arrivé au travail." },
  },
  {
    id: "u",
    prefix: "у-",
    perfective: "уйти́",
    imperfective: "уходи́ть",
    translation: "partir, s'en aller",
    schema: "awayfrom",
    pastM: "ушёл",
    pastF: "ушла́",
    preposition: "из / с",
    governs: "genitive",
    example: { ru: "она́ ушла́ из до́ма.", fr: "Elle est partie de la maison." },
  },
  {
    id: "v",
    prefix: "в-",
    perfective: "войти́",
    imperfective: "входи́ть",
    translation: "entrer",
    schema: "into",
    pastM: "вошёл",
    pastF: "вошла́",
    preposition: "в",
    governs: "accusative",
    example: { ru: "Он вошёл в ко́мнату.", fr: "Il est entré dans la pièce." },
  },
  {
    id: "vy",
    prefix: "вы-",
    perfective: "вы́йти",
    imperfective: "выходи́ть",
    translation: "sortir",
    schema: "outof",
    // вы- porte toujours l'accent au perfectif : вы́шел, jamais « вышёл ».
    pastM: "вы́шел",
    pastF: "вы́шла",
    preposition: "из",
    governs: "genitive",
    example: { ru: "она́ вы́шла из магази́на.", fr: "Elle est sortie du magasin." },
  },
  {
    id: "pod",
    prefix: "под-",
    perfective: "подойти́",
    imperfective: "подходи́ть",
    translation: "s'approcher",
    schema: "upto",
    pastM: "подошёл",
    pastF: "подошла́",
    preposition: "к",
    governs: "dative",
    example: { ru: "Он подошёл к две́ри.", fr: "Il s'est approché de la porte." },
  },
  {
    id: "ot",
    prefix: "от-",
    perfective: "отойти́",
    imperfective: "отходи́ть",
    translation: "s'écarter, s'éloigner",
    schema: "awayfrom",
    pastM: "отошёл",
    pastF: "отошла́",
    preposition: "от",
    governs: "genitive",
    example: { ru: "Он отошёл от окна́.", fr: "Il s'est écarté de la fenêtre." },
  },
  {
    id: "pere",
    prefix: "пере́-",
    perfective: "перейти́",
    imperfective: "переходи́ть",
    translation: "traverser",
    schema: "across",
    pastM: "перешёл",
    pastF: "перешла́",
    preposition: "че́рез",
    governs: "accusative",
    example: { ru: "Он перешёл че́рез у́лицу.", fr: "Il a traversé la rue." },
  },
  {
    id: "do",
    prefix: "до-",
    perfective: "дойти́",
    imperfective: "доходи́ть",
    translation: "aller jusqu'à, atteindre",
    schema: "reach",
    pastM: "дошёл",
    pastF: "дошла́",
    preposition: "до",
    governs: "genitive",
    example: { ru: "Мы дошли́ до вокза́ла.", fr: "Nous sommes arrivés jusqu'à la gare." },
  },
  {
    id: "za",
    prefix: "за-",
    perfective: "зайти́",
    imperfective: "заходи́ть",
    translation: "passer (chez), faire un détour",
    schema: "past",
    pastM: "зашёл",
    pastF: "зашла́",
    preposition: "к",
    governs: "dative",
    example: { ru: "Я зашёл к дру́гу.", fr: "Je suis passé chez un ami." },
  },
  {
    id: "ob",
    prefix: "об-",
    perfective: "обойти́",
    imperfective: "обходи́ть",
    translation: "contourner, faire le tour de",
    schema: "around",
    pastM: "обошёл",
    pastF: "обошла́",
    preposition: "—",
    governs: "accusative",
    example: { ru: "Он обошёл дом.", fr: "Il a contourné la maison." },
  },
  {
    id: "s",
    prefix: "с-",
    perfective: "сойти́",
    imperfective: "сходи́ть",
    translation: "descendre de",
    schema: "awayfrom",
    pastM: "сошёл",
    pastF: "сошла́",
    preposition: "с",
    governs: "genitive",
    example: { ru: "она́ сошла́ с по́езда.", fr: "Elle est descendue du train." },
  },
];

export function getPair(id: string): MotionPair | undefined {
  return MOTION_PAIRS.find((p) => p.id === id);
}

export function getPrefix(id: string): MotionPrefix | undefined {
  return MOTION_PREFIXES.find((p) => p.id === id);
}
