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
  /**
   * Impératif des deux membres, 2e personne du PLURIEL (vous de politesse).
   * `null` quand le verbe n'a pas d'impératif usuel : ви́деть n'en a pas, et
   * lui prêter celui de смотре́ть revient à enseigner un autre verbe.
   */
  impImperative: string | null;
  perfImperative: string | null;
  /**
   * Impératif en ты, pour les phrases qui tutoient.
   *
   * Huit contextes sur douze tutoient — « Ne m'appelle pas si tard », « Lis
   * en russe tous les jours, tu apprendras plus vite » — et recevaient la
   * forme de politesse : « Чита́йте … так ты бы́стрее вы́учишь », qui se
   * contredit à l'intérieur d'une même phrase.
   */
  impImperativeTy: string | null;
  perfImperativeTy: string | null;
  /** Passé féminin des deux membres, pour les phrases dont le sujet est « она ». */
  impPastF: string;
  perfPastF: string;
}

export const ASPECT_PAIRS: AspectPair[] = [
  // ─── Préfixation : le perfectif ajoute un préfixe ────────────────
  {
    id: "delat",
    imperfective: "делать", perfective: "сделать", translation: "faire",
    formation: "prefixe",
    impPast: "де́лал", perfPast: "сде́лал",
    impPastF: "де́лала", perfPastF: "сде́лала",
    impPresent1: "де́лаю", perfFuture1: "сде́лаю",
    impImperative: "де́лайте", perfImperative: "сде́лайте",
    impImperativeTy: "де́лай", perfImperativeTy: "сде́лай",
  },
  {
    id: "pisat",
    imperfective: "писать", perfective: "написать", translation: "écrire",
    formation: "prefixe",
    impPast: "писа́л", perfPast: "написа́л",
    impPastF: "писа́ла", perfPastF: "написа́ла",
    impPresent1: "пишу́", perfFuture1: "напишу́",
    impImperative: "пиши́те", perfImperative: "напиши́те",
    impImperativeTy: "пиши́", perfImperativeTy: "напиши́",
  },
  {
    id: "chitat",
    imperfective: "читать", perfective: "прочитать", translation: "lire",
    formation: "prefixe",
    impPast: "чита́л", perfPast: "прочита́л",
    impPastF: "чита́ла", perfPastF: "прочита́ла",
    impPresent1: "чита́ю", perfFuture1: "прочита́ю",
    impImperative: "чита́йте", perfImperative: "прочита́йте",
    impImperativeTy: "чита́й", perfImperativeTy: "прочита́й",
  },
  {
    id: "smotret",
    imperfective: "смотреть", perfective: "посмотреть", translation: "regarder",
    formation: "prefixe",
    impPast: "смотре́л", perfPast: "посмотре́л",
    impPastF: "смотре́ла", perfPastF: "посмотре́ла",
    impPresent1: "смотрю́", perfFuture1: "посмотрю́",
    impImperative: "смотри́те", perfImperative: "посмотри́те",
    impImperativeTy: "смотри́", perfImperativeTy: "посмотри́",
  },
  {
    id: "gotovit",
    imperfective: "готовить", perfective: "приготовить", translation: "préparer",
    formation: "prefixe",
    impPast: "гото́вил", perfPast: "пригото́вил",
    impPastF: "гото́вила", perfPastF: "пригото́вила",
    impPresent1: "гото́влю", perfFuture1: "пригото́влю",
    impImperative: "гото́вьте", perfImperative: "пригото́вьте",
    impImperativeTy: "гото́вь", perfImperativeTy: "пригото́вь",
  },
  {
    id: "stroit",
    imperfective: "строить", perfective: "построить", translation: "construire",
    formation: "prefixe",
    impPast: "стро́ил", perfPast: "постро́ил",
    impPastF: "стро́ила", perfPastF: "постро́ила",
    impPresent1: "стро́ю", perfFuture1: "постро́ю",
    impImperative: "стро́йте", perfImperative: "постро́йте",
    impImperativeTy: "строй", perfImperativeTy: "постро́й",
  },
  {
    id: "uchit",
    imperfective: "учить", perfective: "выучить", translation: "apprendre (par cœur)",
    formation: "prefixe",
    impPast: "учи́л", perfPast: "вы́учил",
    impPastF: "учи́ла", perfPastF: "вы́учила",
    impPresent1: "учу́", perfFuture1: "вы́учу",
    impImperative: "учи́те", perfImperative: "вы́учите",
    impImperativeTy: "учи́", perfImperativeTy: "вы́учи",
  },
  {
    id: "pit",
    imperfective: "пить", perfective: "выпить", translation: "boire",
    formation: "prefixe",
    impPast: "пил", perfPast: "вы́пил",
    impPastF: "пила́", perfPastF: "вы́пила",
    impPresent1: "пью", perfFuture1: "вы́пью",
    impImperative: "пе́йте", perfImperative: "вы́пейте",
    impImperativeTy: "пей", perfImperativeTy: "вы́пей",
  },
  {
    id: "est",
    imperfective: "есть", perfective: "съесть", translation: "manger",
    formation: "prefixe",
    impPast: "ел", perfPast: "съел",
    impPastF: "е́ла", perfPastF: "съе́ла",
    impPresent1: "ем", perfFuture1: "съем",
    impImperative: "е́шьте", perfImperative: "съе́шьте",
    impImperativeTy: "ешь", perfImperativeTy: "съешь",
  },
  {
    id: "zvonit",
    imperfective: "звонить", perfective: "позвонить", translation: "téléphoner",
    formation: "prefixe",
    impPast: "звони́л", perfPast: "позвони́л",
    impPastF: "звони́ла", perfPastF: "позвони́ла",
    impPresent1: "звоню́", perfFuture1: "позвоню́",
    impImperative: "звони́те", perfImperative: "позвони́те",
    impImperativeTy: "звони́", perfImperativeTy: "позвони́",
  },
  {
    id: "videt",
    imperfective: "видеть", perfective: "увидеть", translation: "voir",
    formation: "prefixe",
    impPast: "ви́дел", perfPast: "уви́дел",
    impPastF: "ви́дела", perfPastF: "уви́дела",
    impPresent1: "ви́жу", perfFuture1: "уви́жу",
    impImperative: null, perfImperative: null,
    // ви́деть n'a pas d'impératif usuel — un russophone dit « смотри́ ».
    // La banque portait donc « смотри́те » / « посмотри́те », les impératifs
    // d'un AUTRE verbe, sous l'étiquette de cette paire. Aucun contexte ne
    // les servait, mais le premier ajout les aurait servis sans rien dire.
    impImperativeTy: "видь", perfImperativeTy: "уви́дь",
  },
  {
    id: "zavtrakat",
    imperfective: "завтракать", perfective: "позавтракать", translation: "prendre le petit-déjeuner",
    formation: "prefixe",
    impPast: "за́втракал", perfPast: "поза́втракал",
    impPastF: "за́втракала", perfPastF: "поза́втракала",
    impPresent1: "за́втракаю", perfFuture1: "поза́втракаю",
    impImperative: "за́втракайте", perfImperative: "поза́втракайте",
    impImperativeTy: "за́втракай", perfImperativeTy: "поза́втракай",
  },

  // ─── Suffixation : l'imperfectif est dérivé du perfectif ─────────
  {
    id: "reshat",
    imperfective: "решать", perfective: "решить", translation: "résoudre, décider",
    formation: "suffixe",
    impPast: "реша́л", perfPast: "реши́л",
    impPastF: "реша́ла", perfPastF: "реши́ла",
    impPresent1: "реша́ю", perfFuture1: "решу́",
    impImperative: "реша́йте", perfImperative: "реши́те",
    impImperativeTy: "реша́й", perfImperativeTy: "реши́",
  },
  {
    id: "zabyvat",
    imperfective: "забывать", perfective: "забыть", translation: "oublier",
    formation: "suffixe",
    impPast: "забыва́л", perfPast: "забы́л",
    impPastF: "забыва́ла", perfPastF: "забы́ла",
    impPresent1: "забыва́ю", perfFuture1: "забу́ду",
    impImperative: "забыва́йте", perfImperative: "забу́дьте",
    impImperativeTy: "забыва́й", perfImperativeTy: "забу́дь",
  },
  {
    id: "poluchat",
    imperfective: "получать", perfective: "получить", translation: "recevoir",
    formation: "suffixe",
    impPast: "получа́л", perfPast: "получи́л",
    impPastF: "получа́ла", perfPastF: "получи́ла",
    impPresent1: "получа́ю", perfFuture1: "получу́",
    impImperative: "получа́йте", perfImperative: "получи́те",
    impImperativeTy: "получа́й", perfImperativeTy: "получи́",
  },
  {
    id: "obyasnyat",
    imperfective: "объяснять", perfective: "объяснить", translation: "expliquer",
    formation: "suffixe",
    impPast: "объясня́л", perfPast: "объясни́л",
    impPastF: "объясня́ла", perfPastF: "объясни́ла",
    impPresent1: "объясня́ю", perfFuture1: "объясню́",
    impImperative: "объясня́йте", perfImperative: "объясни́те",
    impImperativeTy: "объясня́й", perfImperativeTy: "объясни́",
  },
  {
    id: "povtoryat",
    imperfective: "повторять", perfective: "повторить", translation: "répéter",
    formation: "suffixe",
    impPast: "повторя́л", perfPast: "повтори́л",
    impPastF: "повторя́ла", perfPastF: "повтори́ла",
    impPresent1: "повторя́ю", perfFuture1: "повторю́",
    impImperative: "повторя́йте", perfImperative: "повтори́те",
    impImperativeTy: "повторя́й", perfImperativeTy: "повтори́",
  },
  {
    id: "otvechat",
    imperfective: "отвечать", perfective: "ответить", translation: "répondre",
    formation: "suffixe",
    impPast: "отвеча́л", perfPast: "отве́тил",
    impPastF: "отвеча́ла", perfPastF: "отве́тила",
    impPresent1: "отвеча́ю", perfFuture1: "отве́чу",
    impImperative: "отвеча́йте", perfImperative: "отве́тьте",
    impImperativeTy: "отвеча́й", perfImperativeTy: "отве́ть",
  },
  {
    id: "vstrechat",
    imperfective: "встречать", perfective: "встретить", translation: "rencontrer",
    formation: "suffixe",
    impPast: "встреча́л", perfPast: "встре́тил",
    impPastF: "встреча́ла", perfPastF: "встре́тила",
    impPresent1: "встреча́ю", perfFuture1: "встре́чу",
    impImperative: "встреча́йте", perfImperative: "встре́тьте",
    impImperativeTy: "встреча́й", perfImperativeTy: "встреть",
  },
  {
    id: "pokupat",
    imperfective: "покупать", perfective: "купить", translation: "acheter",
    formation: "suffixe",
    impPast: "покупа́л", perfPast: "купи́л",
    impPastF: "покупа́ла", perfPastF: "купи́ла",
    impPresent1: "покупа́ю", perfFuture1: "куплю́",
    impImperative: "покупа́йте", perfImperative: "купи́те",
    impImperativeTy: "покупа́й", perfImperativeTy: "купи́",
  },
  {
    id: "otkryvat",
    imperfective: "открывать", perfective: "открыть", translation: "ouvrir",
    formation: "suffixe",
    impPast: "открыва́л", perfPast: "откры́л",
    impPastF: "открыва́ла", perfPastF: "откры́ла",
    impPresent1: "открыва́ю", perfFuture1: "откро́ю",
    impImperative: "открыва́йте", perfImperative: "откро́йте",
    impImperativeTy: "открыва́й", perfImperativeTy: "откро́й",
  },
  {
    id: "zakryvat",
    imperfective: "закрывать", perfective: "закрыть", translation: "fermer",
    formation: "suffixe",
    impPast: "закрыва́л", perfPast: "закры́л",
    impPastF: "закрыва́ла", perfPastF: "закры́ла",
    impPresent1: "закрыва́ю", perfFuture1: "закро́ю",
    impImperative: "закрыва́йте", perfImperative: "закро́йте",
    impImperativeTy: "закрыва́й", perfImperativeTy: "закро́й",
  },
  {
    id: "nachinat",
    imperfective: "начинать", perfective: "начать", translation: "commencer",
    formation: "suffixe",
    impPast: "начина́л", perfPast: "на́чал",
    impPastF: "начина́ла", perfPastF: "начала́",
    impPresent1: "начина́ю", perfFuture1: "начну́",
    impImperative: "начина́йте", perfImperative: "начни́те",
    impImperativeTy: "начина́й", perfImperativeTy: "начни́",
  },
  {
    id: "zakanchivat",
    imperfective: "заканчивать", perfective: "закончить", translation: "terminer",
    formation: "suffixe",
    impPast: "зака́нчивал", perfPast: "зако́нчил",
    impPastF: "зака́нчивала", perfPastF: "зако́нчила",
    impPresent1: "зака́нчиваю", perfFuture1: "зако́нчу",
    impImperative: "зака́нчивайте", perfImperative: "зако́нчите",
    impImperativeTy: "зака́нчивай", perfImperativeTy: "зако́нчи",
  },
  {
    id: "vstavat",
    imperfective: "вставать", perfective: "встать", translation: "se lever",
    formation: "suffixe",
    impPast: "встава́л", perfPast: "встал",
    impPastF: "встава́ла", perfPastF: "вста́ла",
    impPresent1: "встаю́", perfFuture1: "вста́ну",
    impImperative: "встава́йте", perfImperative: "вста́ньте",
    impImperativeTy: "встава́й", perfImperativeTy: "встань",
  },
  {
    id: "davat",
    imperfective: "давать", perfective: "дать", translation: "donner",
    formation: "suffixe",
    impPast: "дава́л", perfPast: "дал",
    impPastF: "дава́ла", perfPastF: "дала́",
    impPresent1: "даю́", perfFuture1: "дам",
    impImperative: "дава́йте", perfImperative: "да́йте",
    impImperativeTy: "дава́й", perfImperativeTy: "дай",
  },
  {
    id: "izuchat",
    imperfective: "изучать", perfective: "изучить", translation: "étudier (à fond)",
    formation: "suffixe",
    impPast: "изуча́л", perfPast: "изучи́л",
    impPastF: "изуча́ла", perfPastF: "изучи́ла",
    impPresent1: "изуча́ю", perfFuture1: "изучу́",
    impImperative: "изуча́йте", perfImperative: "изучи́те",
    impImperativeTy: "изуча́й", perfImperativeTy: "изучи́",
  },

  // ─── Supplétion : aucun rapport de forme entre les deux ──────────
  {
    id: "govorit",
    imperfective: "говорить", perfective: "сказать", translation: "dire",
    formation: "suppletion",
    impPast: "говори́л", perfPast: "сказа́л",
    impPastF: "говори́ла", perfPastF: "сказа́ла",
    impPresent1: "говорю́", perfFuture1: "скажу́",
    impImperative: "говори́те", perfImperative: "скажи́те",
    impImperativeTy: "говори́", perfImperativeTy: "скажи́",
  },
  {
    id: "brat",
    imperfective: "брать", perfective: "взять", translation: "prendre",
    formation: "suppletion",
    impPast: "брал", perfPast: "взял",
    impPastF: "брала́", perfPastF: "взяла́",
    impPresent1: "беру́", perfFuture1: "возьму́",
    impImperative: "бери́те", perfImperative: "возьми́те",
    impImperativeTy: "бери́", perfImperativeTy: "возьми́",
  },
  {
    id: "klast",
    imperfective: "класть", perfective: "положить", translation: "poser (à plat)",
    formation: "suppletion",
    impPast: "клал", perfPast: "положи́л",
    impPastF: "клала", perfPastF: "положи́ла",
    impPresent1: "кладу́", perfFuture1: "положу́",
    impImperative: "клади́те", perfImperative: "положи́те",
    impImperativeTy: "клади́", perfImperativeTy: "положи́",
  },
  {
    id: "sadit",
    imperfective: "садиться", perfective: "сесть", translation: "s'asseoir",
    formation: "suppletion",
    impPast: "сади́лся", perfPast: "сел",
    impPastF: "сади́лась", perfPastF: "се́ла",
    impPresent1: "сажу́сь", perfFuture1: "ся́ду",
    impImperative: "сади́тесь", perfImperative: "ся́дьте",
    impImperativeTy: "сади́сь", perfImperativeTy: "сядь",
  },
  {
    id: "lozhitsya",
    imperfective: "ложиться", perfective: "лечь", translation: "se coucher",
    formation: "suppletion",
    impPast: "ложи́лся", perfPast: "лёг",
    impPastF: "ложи́лась", perfPastF: "легла́",
    impPresent1: "ложу́сь", perfFuture1: "ля́гу",
    impImperative: "ложи́тесь", perfImperative: "ля́гте",
    impImperativeTy: "ложи́сь", perfImperativeTy: "ляг",
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
