/**
 * Paires aspectuelles russes — l'autre grande difficulté que le français
 * n'a pas.
 *
 * Le français n'a PAS la catégorie. Un francophone la plaque sur
 * imparfait / passé composé, ce qui marche une fois sur deux et installe
 * donc une erreur durable au lieu d'un doute. Or l'aspect ne parle pas du
 * moment de l'action mais de sa FORME :
 *
 *   imperfectif  un processus, une répétition, une action sans borne
 *                « Я реша́л зада́чу » — je planchais dessus, sans dire si
 *                j'y suis arrivé
 *   perfectif    une borne atteinte, un résultat, un événement unique
 *                « Я реши́л зада́чу » — je l'ai résolue
 *
 * FORMATION NON DÉRIVABLE. C'est la même leçon que les déclinaisons :
 * писа́ть → написа́ть se fait par préfixe, реша́ть → реши́ть par suffixe, mais
 * говори́ть → сказа́ть, брать → взять et класть → положи́ть sont supplétifs.
 * Aucune règle ne les prédit, donc tout est écrit et vérifié
 * (scripts/check-aspect.mjs).
 */

/** Comment le partenaire perfectif se forme — l'information que l'apprenant doit repérer. */
export type PairFormation = "prefixe" | "suffixe" | "suppletion";

export const FORMATION_LABEL: Record<PairFormation, string> = {
  prefixe: "par préfixe",
  suffixe: "par suffixe",
  suppletion: "radical différent",
};

export interface AspectPair {
  id: string;
  /** Imperfectif : le processus. */
  imperfective: string;
  /** Perfectif : le résultat. */
  perfective: string;
  translation: string;
  formation: PairFormation;
  /** Passé masculin des deux membres. */
  impPast: string;
  perfPast: string;
  /** Présent 1re personne (imperfectif) — le perfectif n'a pas de présent. */
  impPresent1: string;
  /** Futur 1re personne du perfectif (le futur imperfectif est « буду » + infinitif). */
  perfFuture1: string;
  /** Impératif des deux membres, 2e personne du pluriel/politesse. */
  impImperative: string;
  perfImperative: string;
}

export const ASPECT_PAIRS: AspectPair[] = [
  // ─── Préfixation : le perfectif ajoute un préfixe ────────────────
  {
    id: "delat",
    imperfective: "делать", perfective: "сделать", translation: "faire",
    formation: "prefixe",
    impPast: "делал", perfPast: "сделал",
    impPresent1: "делаю", perfFuture1: "сделаю",
    impImperative: "делайте", perfImperative: "сделайте",
  },
  {
    id: "pisat",
    imperfective: "писать", perfective: "написать", translation: "écrire",
    formation: "prefixe",
    impPast: "писал", perfPast: "написал",
    impPresent1: "пишу", perfFuture1: "напишу",
    impImperative: "пишите", perfImperative: "напишите",
  },
  {
    id: "chitat",
    imperfective: "читать", perfective: "прочитать", translation: "lire",
    formation: "prefixe",
    impPast: "читал", perfPast: "прочитал",
    impPresent1: "читаю", perfFuture1: "прочитаю",
    impImperative: "читайте", perfImperative: "прочитайте",
  },
  {
    id: "smotret",
    imperfective: "смотреть", perfective: "посмотреть", translation: "regarder",
    formation: "prefixe",
    impPast: "смотрел", perfPast: "посмотрел",
    impPresent1: "смотрю", perfFuture1: "посмотрю",
    impImperative: "смотрите", perfImperative: "посмотрите",
  },
  {
    id: "gotovit",
    imperfective: "готовить", perfective: "приготовить", translation: "préparer",
    formation: "prefixe",
    impPast: "готовил", perfPast: "приготовил",
    impPresent1: "готовлю", perfFuture1: "приготовлю",
    impImperative: "готовьте", perfImperative: "приготовьте",
  },
  {
    id: "stroit",
    imperfective: "строить", perfective: "построить", translation: "construire",
    formation: "prefixe",
    impPast: "строил", perfPast: "построил",
    impPresent1: "строю", perfFuture1: "построю",
    impImperative: "стройте", perfImperative: "постройте",
  },
  {
    id: "uchit",
    imperfective: "учить", perfective: "выучить", translation: "apprendre (par cœur)",
    formation: "prefixe",
    impPast: "учил", perfPast: "выучил",
    impPresent1: "учу", perfFuture1: "выучу",
    impImperative: "учите", perfImperative: "выучите",
  },
  {
    id: "pit",
    imperfective: "пить", perfective: "выпить", translation: "boire",
    formation: "prefixe",
    impPast: "пил", perfPast: "выпил",
    impPresent1: "пью", perfFuture1: "выпью",
    impImperative: "пейте", perfImperative: "выпейте",
  },
  {
    id: "est",
    imperfective: "есть", perfective: "съесть", translation: "manger",
    formation: "prefixe",
    impPast: "ел", perfPast: "съел",
    impPresent1: "ем", perfFuture1: "съем",
    impImperative: "ешьте", perfImperative: "съешьте",
  },
  {
    id: "zvonit",
    imperfective: "звонить", perfective: "позвонить", translation: "téléphoner",
    formation: "prefixe",
    impPast: "звонил", perfPast: "позвонил",
    impPresent1: "звоню", perfFuture1: "позвоню",
    impImperative: "звоните", perfImperative: "позвоните",
  },
  {
    id: "videt",
    imperfective: "видеть", perfective: "увидеть", translation: "voir",
    formation: "prefixe",
    impPast: "видел", perfPast: "увидел",
    impPresent1: "вижу", perfFuture1: "увижу",
    impImperative: "смотрите", perfImperative: "посмотрите",
  },
  {
    id: "zavtrakat",
    imperfective: "завтракать", perfective: "позавтракать", translation: "prendre le petit-déjeuner",
    formation: "prefixe",
    impPast: "завтракал", perfPast: "позавтракал",
    impPresent1: "завтракаю", perfFuture1: "позавтракаю",
    impImperative: "завтракайте", perfImperative: "позавтракайте",
  },

  // ─── Suffixation : l'imperfectif est dérivé du perfectif ─────────
  {
    id: "reshat",
    imperfective: "решать", perfective: "решить", translation: "résoudre, décider",
    formation: "suffixe",
    impPast: "решал", perfPast: "решил",
    impPresent1: "решаю", perfFuture1: "решу",
    impImperative: "решайте", perfImperative: "решите",
  },
  {
    id: "zabyvat",
    imperfective: "забывать", perfective: "забыть", translation: "oublier",
    formation: "suffixe",
    impPast: "забывал", perfPast: "забыл",
    impPresent1: "забываю", perfFuture1: "забуду",
    impImperative: "забывайте", perfImperative: "забудьте",
  },
  {
    id: "poluchat",
    imperfective: "получать", perfective: "получить", translation: "recevoir",
    formation: "suffixe",
    impPast: "получал", perfPast: "получил",
    impPresent1: "получаю", perfFuture1: "получу",
    impImperative: "получайте", perfImperative: "получите",
  },
  {
    id: "obyasnyat",
    imperfective: "объяснять", perfective: "объяснить", translation: "expliquer",
    formation: "suffixe",
    impPast: "объяснял", perfPast: "объяснил",
    impPresent1: "объясняю", perfFuture1: "объясню",
    impImperative: "объясняйте", perfImperative: "объясните",
  },
  {
    id: "povtoryat",
    imperfective: "повторять", perfective: "повторить", translation: "répéter",
    formation: "suffixe",
    impPast: "повторял", perfPast: "повторил",
    impPresent1: "повторяю", perfFuture1: "повторю",
    impImperative: "повторяйте", perfImperative: "повторите",
  },
  {
    id: "otvechat",
    imperfective: "отвечать", perfective: "ответить", translation: "répondre",
    formation: "suffixe",
    impPast: "отвечал", perfPast: "ответил",
    impPresent1: "отвечаю", perfFuture1: "отвечу",
    impImperative: "отвечайте", perfImperative: "ответьте",
  },
  {
    id: "vstrechat",
    imperfective: "встречать", perfective: "встретить", translation: "rencontrer",
    formation: "suffixe",
    impPast: "встречал", perfPast: "встретил",
    impPresent1: "встречаю", perfFuture1: "встречу",
    impImperative: "встречайте", perfImperative: "встретьте",
  },
  {
    id: "pokupat",
    imperfective: "покупать", perfective: "купить", translation: "acheter",
    formation: "suffixe",
    impPast: "покупал", perfPast: "купил",
    impPresent1: "покупаю", perfFuture1: "куплю",
    impImperative: "покупайте", perfImperative: "купите",
  },
  {
    id: "otkryvat",
    imperfective: "открывать", perfective: "открыть", translation: "ouvrir",
    formation: "suffixe",
    impPast: "открывал", perfPast: "открыл",
    impPresent1: "открываю", perfFuture1: "открою",
    impImperative: "открывайте", perfImperative: "откройте",
  },
  {
    id: "zakryvat",
    imperfective: "закрывать", perfective: "закрыть", translation: "fermer",
    formation: "suffixe",
    impPast: "закрывал", perfPast: "закрыл",
    impPresent1: "закрываю", perfFuture1: "закрою",
    impImperative: "закрывайте", perfImperative: "закройте",
  },
  {
    id: "nachinat",
    imperfective: "начинать", perfective: "начать", translation: "commencer",
    formation: "suffixe",
    impPast: "начинал", perfPast: "начал",
    impPresent1: "начинаю", perfFuture1: "начну",
    impImperative: "начинайте", perfImperative: "начните",
  },
  {
    id: "zakanchivat",
    imperfective: "заканчивать", perfective: "закончить", translation: "terminer",
    formation: "suffixe",
    impPast: "заканчивал", perfPast: "закончил",
    impPresent1: "заканчиваю", perfFuture1: "закончу",
    impImperative: "заканчивайте", perfImperative: "закончите",
  },
  {
    id: "vstavat",
    imperfective: "вставать", perfective: "встать", translation: "se lever",
    formation: "suffixe",
    impPast: "вставал", perfPast: "встал",
    impPresent1: "встаю", perfFuture1: "встану",
    impImperative: "вставайте", perfImperative: "встаньте",
  },
  {
    id: "davat",
    imperfective: "давать", perfective: "дать", translation: "donner",
    formation: "suffixe",
    impPast: "давал", perfPast: "дал",
    impPresent1: "даю", perfFuture1: "дам",
    impImperative: "давайте", perfImperative: "дайте",
  },
  {
    id: "izuchat",
    imperfective: "изучать", perfective: "изучить", translation: "étudier (à fond)",
    formation: "suffixe",
    impPast: "изучал", perfPast: "изучил",
    impPresent1: "изучаю", perfFuture1: "изучу",
    impImperative: "изучайте", perfImperative: "изучите",
  },

  // ─── Supplétion : aucun rapport de forme entre les deux ──────────
  {
    id: "govorit",
    imperfective: "говорить", perfective: "сказать", translation: "dire",
    formation: "suppletion",
    impPast: "говорил", perfPast: "сказал",
    impPresent1: "говорю", perfFuture1: "скажу",
    impImperative: "говорите", perfImperative: "скажите",
  },
  {
    id: "brat",
    imperfective: "брать", perfective: "взять", translation: "prendre",
    formation: "suppletion",
    impPast: "брал", perfPast: "взял",
    impPresent1: "беру", perfFuture1: "возьму",
    impImperative: "берите", perfImperative: "возьмите",
  },
  {
    id: "klast",
    imperfective: "класть", perfective: "положить", translation: "poser (à plat)",
    formation: "suppletion",
    impPast: "клал", perfPast: "положил",
    impPresent1: "кладу", perfFuture1: "положу",
    impImperative: "кладите", perfImperative: "положите",
  },
  {
    id: "sadit",
    imperfective: "садиться", perfective: "сесть", translation: "s'asseoir",
    formation: "suppletion",
    impPast: "садился", perfPast: "сел",
    impPresent1: "сажусь", perfFuture1: "сяду",
    impImperative: "садитесь", perfImperative: "сядьте",
  },
  {
    id: "lozhitsya",
    imperfective: "ложиться", perfective: "лечь", translation: "se coucher",
    formation: "suppletion",
    impPast: "ложился", perfPast: "лёг",
    impPresent1: "ложусь", perfFuture1: "лягу",
    impImperative: "ложитесь", perfImperative: "лягте",
  },
];

/**
 * Schémas temporels dessinés par components/aspect/TimelineDiagram.
 * L'aspect est littéralement la FORME d'un événement dans le temps : un
 * processus est une ligne, un résultat une ligne qui bute sur une borne,
 * une habitude une suite de points. C'est la représentation classique de
 * la didactique russe, et elle se dessine exactement.
 */
export type TimelineSchema =
  | "process"
  | "result"
  | "repetition"
  | "interrupted"
  | "duration"
  | "sequence"
  | "attempt";

export const TIMELINE_LABEL: Record<TimelineSchema, string> = {
  process: "un processus qui dure, sans borne",
  result: "un processus mené jusqu'à son terme",
  repetition: "une action répétée",
  interrupted: "un processus interrompu par un événement",
  duration: "une durée mesurée",
  sequence: "des actions qui s'enchaînent",
  attempt: "une tentative dont on ne dit pas l'issue",
};

export function getPair(id: string): AspectPair | undefined {
  return ASPECT_PAIRS.find((p) => p.id === id);
}
