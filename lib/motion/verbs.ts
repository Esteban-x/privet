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

export interface MotionForms {
  /** 1re personne du singulier au présent (я …). */
  present1: string;
  /** 3e personne du singulier au présent (он/она …). */
  present3: string;
  /** Passé masculin (он …). */
  pastM: string;
  /** Passé féminin (она …). */
  pastF: string;
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
    uni: "идти",
    multi: "ходить",
    translation: "aller (à pied)",
    mode: "foot",
    isGoing: true,
    // Passé supplétif : шёл, aucune règle ne le tire de « идти ».
    uniForms: { present1: "иду", present3: "идёт", pastM: "шёл", pastF: "шла" },
    multiForms: { present1: "хожу", present3: "ходит", pastM: "ходил", pastF: "ходила" },
  },
  {
    id: "ekhat",
    uni: "ехать",
    multi: "ездить",
    translation: "aller (en véhicule)",
    mode: "vehicle",
    isGoing: true,
    uniForms: { present1: "еду", present3: "едет", pastM: "ехал", pastF: "ехала" },
    multiForms: { present1: "езжу", present3: "ездит", pastM: "ездил", pastF: "ездила" },
  },
  {
    id: "letet",
    uni: "лететь",
    multi: "летать",
    translation: "voler, aller (en avion)",
    mode: "air",
    isGoing: true,
    uniForms: { present1: "лечу", present3: "летит", pastM: "летел", pastF: "летела" },
    multiForms: { present1: "летаю", present3: "летает", pastM: "летал", pastF: "летала" },
  },
  {
    id: "plyt",
    uni: "плыть",
    multi: "плавать",
    translation: "nager, naviguer",
    mode: "water",
    isGoing: true,
    uniForms: { present1: "плыву", present3: "плывёт", pastM: "плыл", pastF: "плыла" },
    multiForms: { present1: "плаваю", present3: "плавает", pastM: "плавал", pastF: "плавала" },
  },
  {
    id: "bezhat",
    uni: "бежать",
    multi: "бегать",
    translation: "courir",
    mode: "foot",
    isGoing: false,
    uniForms: { present1: "бегу", present3: "бежит", pastM: "бежал", pastF: "бежала" },
    multiForms: { present1: "бегаю", present3: "бегает", pastM: "бегал", pastF: "бегала" },
  },
  {
    id: "nesti",
    uni: "нести",
    multi: "носить",
    translation: "porter (en marchant)",
    mode: "carry",
    isGoing: false,
    uniForms: { present1: "несу", present3: "несёт", pastM: "нёс", pastF: "несла" },
    multiForms: { present1: "ношу", present3: "носит", pastM: "носил", pastF: "носила" },
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
    perfective: "прийти",
    imperfective: "приходить",
    translation: "arriver, venir",
    schema: "reach",
    pastM: "пришёл",
    pastF: "пришла",
    preposition: "в / на",
    governs: "accusative",
    example: { ru: "Он пришёл на работу.", fr: "Il est arrivé au travail." },
  },
  {
    id: "u",
    prefix: "у-",
    perfective: "уйти",
    imperfective: "уходить",
    translation: "partir, s'en aller",
    schema: "awayfrom",
    pastM: "ушёл",
    pastF: "ушла",
    preposition: "из / с",
    governs: "genitive",
    example: { ru: "Она ушла из дома.", fr: "Elle est partie de la maison." },
  },
  {
    id: "v",
    prefix: "в-",
    perfective: "войти",
    imperfective: "входить",
    translation: "entrer",
    schema: "into",
    pastM: "вошёл",
    pastF: "вошла",
    preposition: "в",
    governs: "accusative",
    example: { ru: "Он вошёл в комнату.", fr: "Il est entré dans la pièce." },
  },
  {
    id: "vy",
    prefix: "вы-",
    perfective: "выйти",
    imperfective: "выходить",
    translation: "sortir",
    schema: "outof",
    // вы- porte toujours l'accent au perfectif : вы́шел, jamais « вышёл ».
    pastM: "вышел",
    pastF: "вышла",
    preposition: "из",
    governs: "genitive",
    example: { ru: "Она вышла из магазина.", fr: "Elle est sortie du magasin." },
  },
  {
    id: "pod",
    prefix: "под-",
    perfective: "подойти",
    imperfective: "подходить",
    translation: "s'approcher",
    schema: "upto",
    pastM: "подошёл",
    pastF: "подошла",
    preposition: "к",
    governs: "dative",
    example: { ru: "Он подошёл к двери.", fr: "Il s'est approché de la porte." },
  },
  {
    id: "ot",
    prefix: "от-",
    perfective: "отойти",
    imperfective: "отходить",
    translation: "s'écarter, s'éloigner",
    schema: "awayfrom",
    pastM: "отошёл",
    pastF: "отошла",
    preposition: "от",
    governs: "genitive",
    example: { ru: "Он отошёл от окна.", fr: "Il s'est écarté de la fenêtre." },
  },
  {
    id: "pere",
    prefix: "пере-",
    perfective: "перейти",
    imperfective: "переходить",
    translation: "traverser",
    schema: "across",
    pastM: "перешёл",
    pastF: "перешла",
    preposition: "через",
    governs: "accusative",
    example: { ru: "Он перешёл через улицу.", fr: "Il a traversé la rue." },
  },
  {
    id: "do",
    prefix: "до-",
    perfective: "дойти",
    imperfective: "доходить",
    translation: "aller jusqu'à, atteindre",
    schema: "reach",
    pastM: "дошёл",
    pastF: "дошла",
    preposition: "до",
    governs: "genitive",
    example: { ru: "Мы дошли до вокзала.", fr: "Nous sommes arrivés jusqu'à la gare." },
  },
  {
    id: "za",
    prefix: "за-",
    perfective: "зайти",
    imperfective: "заходить",
    translation: "passer (chez), faire un détour",
    schema: "past",
    pastM: "зашёл",
    pastF: "зашла",
    preposition: "к",
    governs: "dative",
    example: { ru: "Я зашёл к другу.", fr: "Je suis passé chez un ami." },
  },
  {
    id: "ob",
    prefix: "об-",
    perfective: "обойти",
    imperfective: "обходить",
    translation: "contourner, faire le tour de",
    schema: "around",
    pastM: "обошёл",
    pastF: "обошла",
    preposition: "—",
    governs: "accusative",
    example: { ru: "Он обошёл дом.", fr: "Il a contourné la maison." },
  },
];

export function getPair(id: string): MotionPair | undefined {
  return MOTION_PAIRS.find((p) => p.id === id);
}

export function getPrefix(id: string): MotionPrefix | undefined {
  return MOTION_PREFIXES.find((p) => p.id === id);
}
