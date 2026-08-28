/**
 * Banque de verbes conjugués.
 *
 * POURQUOI LES FORMES SONT ÉCRITES ET NON CALCULÉES. La déclinaison du nom
 * est un système fermé : `lib/grammar/decline.ts` la calcule et
 * `npm run check:grammar` la vérifie forme par forme. La conjugaison russe
 * ne l'est pas. Deux verbes au même infinitif se conjuguent différemment
 * (чита́ть → чита́ю mais писа́ть → пишу́), l'accent se déplace sans règle
 * dérivable (смотрю́ mais смо́тришь), et le passé féminin le déplace encore
 * (жил → жила́). Un générateur produirait donc des formes fausses avec
 * l'assurance d'un moteur.
 *
 * Ce qui est écrit ici est ce qu'un dictionnaire donne : les six personnes
 * du présent, le passé masculin et féminin, l'impératif. `npm run
 * check:conjugation` vérifie la cohérence interne — pas de doublon, chaque
 * forme accentuée, terminaisons conformes à la classe déclarée.
 *
 * Le champ `naive` porte la faute que fait un francophone quand il applique
 * la règle sans connaître l'alternance : « писа́ю » au lieu de « пишу́ ». Il
 * sert de leurre dans l'onglet Alternances, et nulle part ailleurs.
 */

export type ConjugationClass = "first" | "second" | "irregular";

export interface Verb {
  id: string;
  /** Infinitif accentué. */
  infinitive: string;
  translation: string;
  conjugation: ConjugationClass;
  /** Présent (ou futur simple pour un perfectif) : я, ты, он, мы, вы, они. */
  present: [string, string, string, string, string, string];
  /** Passé masculin et féminin — le féminin déplace souvent l'accent. */
  past: [string, string];
  /** Impératif singulier. `null` quand le verbe n'en a pas d'usuel. */
  imperative: string | null;
  /** L'alternance de consonne, si le verbe en a une. */
  mutation?: { label: string; naive: string };
  /** Le verbe est-il perfectif ? Son « présent » est alors un futur. */
  perfective?: boolean;
}

export const VERBS: Verb[] = [
  // ─── Première conjugaison, radical régulier ────────────────────
  {
    id: "chitat",
    infinitive: "чита́ть",
    translation: "lire",
    conjugation: "first",
    present: ["чита́ю", "чита́ешь", "чита́ет", "чита́ем", "чита́ете", "чита́ют"],
    past: ["чита́л", "чита́ла"],
    imperative: "чита́й",
  },
  {
    id: "delat",
    infinitive: "де́лать",
    translation: "faire",
    conjugation: "first",
    present: ["де́лаю", "де́лаешь", "де́лает", "де́лаем", "де́лаете", "де́лают"],
    past: ["де́лал", "де́лала"],
    imperative: "де́лай",
  },
  {
    id: "rabotat",
    infinitive: "рабо́тать",
    translation: "travailler",
    conjugation: "first",
    present: ["рабо́таю", "рабо́таешь", "рабо́тает", "рабо́таем", "рабо́таете", "рабо́тают"],
    past: ["рабо́тал", "рабо́тала"],
    imperative: "рабо́тай",
  },
  {
    id: "dumat",
    infinitive: "ду́мать",
    translation: "penser",
    conjugation: "first",
    present: ["ду́маю", "ду́маешь", "ду́мает", "ду́маем", "ду́маете", "ду́мают"],
    past: ["ду́мал", "ду́мала"],
    imperative: "ду́май",
  },
  {
    id: "znat",
    infinitive: "знать",
    translation: "savoir, connaître",
    conjugation: "first",
    present: ["зна́ю", "зна́ешь", "зна́ет", "зна́ем", "зна́ете", "зна́ют"],
    past: ["знал", "зна́ла"],
    imperative: "знай",
  },
  {
    id: "slushat",
    infinitive: "слу́шать",
    translation: "écouter",
    conjugation: "first",
    present: ["слу́шаю", "слу́шаешь", "слу́шает", "слу́шаем", "слу́шаете", "слу́шают"],
    past: ["слу́шал", "слу́шала"],
    imperative: "слу́шай",
  },
  {
    id: "ponimat",
    infinitive: "понима́ть",
    translation: "comprendre",
    conjugation: "first",
    present: ["понима́ю", "понима́ешь", "понима́ет", "понима́ем", "понима́ете", "понима́ют"],
    past: ["понима́л", "понима́ла"],
    imperative: "понима́й",
  },
  {
    id: "otvechat",
    infinitive: "отвеча́ть",
    translation: "répondre",
    conjugation: "first",
    present: ["отвеча́ю", "отвеча́ешь", "отвеча́ет", "отвеча́ем", "отвеча́ете", "отвеча́ют"],
    past: ["отвеча́л", "отвеча́ла"],
    imperative: "отвеча́й",
  },
  {
    id: "igrat",
    infinitive: "игра́ть",
    translation: "jouer",
    conjugation: "first",
    present: ["игра́ю", "игра́ешь", "игра́ет", "игра́ем", "игра́ете", "игра́ют"],
    past: ["игра́л", "игра́ла"],
    imperative: "игра́й",
  },
  {
    id: "gulyat",
    infinitive: "гуля́ть",
    translation: "se promener",
    conjugation: "first",
    present: ["гуля́ю", "гуля́ешь", "гуля́ет", "гуля́ем", "гуля́ете", "гуля́ют"],
    past: ["гуля́л", "гуля́ла"],
    imperative: "гуля́й",
  },
  {
    id: "otdykhat",
    infinitive: "отдыха́ть",
    translation: "se reposer",
    conjugation: "first",
    present: ["отдыха́ю", "отдыха́ешь", "отдыха́ет", "отдыха́ем", "отдыха́ете", "отдыха́ют"],
    past: ["отдыха́л", "отдыха́ла"],
    imperative: "отдыха́й",
  },

  // ─── Première conjugaison, radical modifié ─────────────────────
  {
    id: "zhit",
    infinitive: "жить",
    translation: "vivre, habiter",
    conjugation: "first",
    present: ["живу́", "живёшь", "живёт", "живём", "живёте", "живу́т"],
    past: ["жил", "жила́"],
    imperative: "живи́",
  },
  {
    id: "idti",
    infinitive: "идти́",
    translation: "aller (à pied)",
    conjugation: "first",
    present: ["иду́", "идёшь", "идёт", "идём", "идёте", "иду́т"],
    past: ["шёл", "шла"],
    imperative: "иди́",
  },
  {
    id: "brat",
    infinitive: "брать",
    translation: "prendre",
    conjugation: "first",
    present: ["беру́", "берёшь", "берёт", "берём", "берёте", "беру́т"],
    past: ["брал", "брала́"],
    imperative: "бери́",
  },
  {
    id: "zhdat",
    infinitive: "ждать",
    translation: "attendre",
    conjugation: "first",
    present: ["жду", "ждёшь", "ждёт", "ждём", "ждёте", "ждут"],
    past: ["ждал", "ждала́"],
    imperative: "жди",
  },
  {
    id: "pit",
    infinitive: "пить",
    translation: "boire",
    conjugation: "first",
    present: ["пью", "пьёшь", "пьёт", "пьём", "пьёте", "пьют"],
    past: ["пил", "пила́"],
    imperative: "пей",
  },
  {
    id: "pet",
    infinitive: "петь",
    translation: "chanter",
    conjugation: "first",
    present: ["пою́", "поёшь", "поёт", "поём", "поёте", "пою́т"],
    past: ["пел", "пе́ла"],
    imperative: "пой",
  },
  {
    id: "davat",
    infinitive: "дава́ть",
    translation: "donner",
    conjugation: "first",
    present: ["даю́", "даёшь", "даёт", "даём", "даёте", "даю́т"],
    past: ["дава́л", "дава́ла"],
    imperative: "дава́й",
  },
  {
    id: "mochsya",
    infinitive: "мочь",
    translation: "pouvoir",
    conjugation: "first",
    present: ["могу́", "мо́жешь", "мо́жет", "мо́жем", "мо́жете", "мо́гут"],
    past: ["мог", "могла́"],
    imperative: null,
    mutation: { label: "г → ж", naive: "мо́гешь" },
  },

  // ─── Première conjugaison avec alternance ──────────────────────
  {
    id: "pisat",
    infinitive: "писа́ть",
    translation: "écrire",
    conjugation: "first",
    present: ["пишу́", "пи́шешь", "пи́шет", "пи́шем", "пи́шете", "пи́шут"],
    past: ["писа́л", "писа́ла"],
    imperative: "пиши́",
    mutation: { label: "с → ш", naive: "писа́ю" },
  },
  {
    id: "skazat",
    infinitive: "сказа́ть",
    translation: "dire",
    conjugation: "first",
    perfective: true,
    present: ["скажу́", "ска́жешь", "ска́жет", "ска́жем", "ска́жете", "ска́жут"],
    past: ["сказа́л", "сказа́ла"],
    imperative: "скажи́",
    mutation: { label: "з → ж", naive: "сказа́ю" },
  },
  {
    id: "plakat",
    infinitive: "пла́кать",
    translation: "pleurer",
    conjugation: "first",
    present: ["пла́чу", "пла́чешь", "пла́чет", "пла́чем", "пла́чете", "пла́чут"],
    past: ["пла́кал", "пла́кала"],
    imperative: "плачь",
    mutation: { label: "к → ч", naive: "пла́каю" },
  },
  {
    id: "iskat",
    infinitive: "иска́ть",
    translation: "chercher",
    conjugation: "first",
    present: ["ищу́", "и́щешь", "и́щет", "и́щем", "и́щете", "и́щут"],
    past: ["иска́л", "иска́ла"],
    imperative: "ищи́",
    mutation: { label: "ск → щ", naive: "иска́ю" },
  },

  // ─── Deuxième conjugaison ──────────────────────────────────────
  {
    id: "govorit",
    infinitive: "говори́ть",
    translation: "parler, dire",
    conjugation: "second",
    present: ["говорю́", "говори́шь", "говори́т", "говори́м", "говори́те", "говоря́т"],
    past: ["говори́л", "говори́ла"],
    imperative: "говори́",
  },
  {
    id: "smotret",
    infinitive: "смотре́ть",
    translation: "regarder",
    conjugation: "second",
    present: ["смотрю́", "смо́тришь", "смо́трит", "смо́трим", "смо́трите", "смо́трят"],
    past: ["смотре́л", "смотре́ла"],
    imperative: "смотри́",
  },
  {
    id: "uchit",
    infinitive: "учи́ть",
    translation: "apprendre, enseigner",
    conjugation: "second",
    present: ["учу́", "у́чишь", "у́чит", "у́чим", "у́чите", "у́чат"],
    past: ["учи́л", "учи́ла"],
    imperative: "учи́",
  },
  {
    id: "slyshat",
    infinitive: "слы́шать",
    translation: "entendre",
    conjugation: "second",
    present: ["слы́шу", "слы́шишь", "слы́шит", "слы́шим", "слы́шите", "слы́шат"],
    past: ["слы́шал", "слы́шала"],
    imperative: null,
  },
  {
    id: "stoyat",
    infinitive: "стоя́ть",
    translation: "être debout",
    conjugation: "second",
    present: ["стою́", "стои́шь", "стои́т", "стои́м", "стои́те", "стоя́т"],
    past: ["стоя́л", "стоя́ла"],
    imperative: "стой",
  },
  {
    id: "lezhat",
    infinitive: "лежа́ть",
    translation: "être couché",
    conjugation: "second",
    present: ["лежу́", "лежи́шь", "лежи́т", "лежи́м", "лежи́те", "лежа́т"],
    past: ["лежа́л", "лежа́ла"],
    imperative: "лежи́",
  },
  {
    id: "derzhat",
    infinitive: "держа́ть",
    translation: "tenir",
    conjugation: "second",
    present: ["держу́", "де́ржишь", "де́ржит", "де́ржим", "де́ржите", "де́ржат"],
    past: ["держа́л", "держа́ла"],
    imperative: "держи́",
  },
  {
    id: "pomnit",
    infinitive: "по́мнить",
    translation: "se souvenir",
    conjugation: "second",
    present: ["по́мню", "по́мнишь", "по́мнит", "по́мним", "по́мните", "по́мнят"],
    past: ["по́мнил", "по́мнила"],
    imperative: "по́мни",
  },
  {
    id: "zvonit",
    infinitive: "звони́ть",
    translation: "téléphoner",
    conjugation: "second",
    present: ["звоню́", "звони́шь", "звони́т", "звони́м", "звони́те", "звоня́т"],
    past: ["звони́л", "звони́ла"],
    imperative: "звони́",
  },

  // ─── Deuxième conjugaison avec alternance à la 1ʳᵉ personne ────
  {
    id: "videt",
    infinitive: "ви́деть",
    translation: "voir",
    conjugation: "second",
    present: ["ви́жу", "ви́дишь", "ви́дит", "ви́дим", "ви́дите", "ви́дят"],
    past: ["ви́дел", "ви́дела"],
    imperative: null,
    mutation: { label: "д → ж", naive: "ви́дю" },
  },
  {
    id: "lyubit",
    infinitive: "люби́ть",
    translation: "aimer",
    conjugation: "second",
    present: ["люблю́", "лю́бишь", "лю́бит", "лю́бим", "лю́бите", "лю́бят"],
    past: ["люби́л", "люби́ла"],
    imperative: "люби́",
    mutation: { label: "б → бл", naive: "любю́" },
  },
  {
    id: "prosit",
    infinitive: "проси́ть",
    translation: "demander",
    conjugation: "second",
    present: ["прошу́", "про́сишь", "про́сит", "про́сим", "про́сите", "про́сят"],
    past: ["проси́л", "проси́ла"],
    imperative: "проси́",
    mutation: { label: "с → ш", naive: "просю́" },
  },
  {
    id: "khodit",
    infinitive: "ходи́ть",
    translation: "aller (habituellement)",
    conjugation: "second",
    present: ["хожу́", "хо́дишь", "хо́дит", "хо́дим", "хо́дите", "хо́дят"],
    past: ["ходи́л", "ходи́ла"],
    imperative: "ходи́",
    mutation: { label: "д → ж", naive: "ходю́" },
  },
  {
    id: "kupit",
    infinitive: "купи́ть",
    translation: "acheter",
    conjugation: "second",
    perfective: true,
    present: ["куплю́", "ку́пишь", "ку́пит", "ку́пим", "ку́пите", "ку́пят"],
    past: ["купи́л", "купи́ла"],
    imperative: "купи́",
    mutation: { label: "п → пл", naive: "купю́" },
  },
  {
    id: "platit",
    infinitive: "плати́ть",
    translation: "payer",
    conjugation: "second",
    present: ["плачу́", "пла́тишь", "пла́тит", "пла́тим", "пла́тите", "пла́тят"],
    past: ["плати́л", "плати́ла"],
    imperative: "плати́",
    mutation: { label: "т → ч", naive: "платю́" },
  },
  {
    id: "otvetit",
    infinitive: "отве́тить",
    translation: "répondre",
    conjugation: "second",
    perfective: true,
    present: ["отве́чу", "отве́тишь", "отве́тит", "отве́тим", "отве́тите", "отве́тят"],
    past: ["отве́тил", "отве́тила"],
    imperative: "отве́ть",
    mutation: { label: "т → ч", naive: "отве́тю" },
  },
  {
    id: "gotovit",
    infinitive: "гото́вить",
    translation: "préparer, cuisiner",
    conjugation: "second",
    present: ["гото́влю", "гото́вишь", "гото́вит", "гото́вим", "гото́вите", "гото́вят"],
    past: ["гото́вил", "гото́вила"],
    imperative: "гото́вь",
    mutation: { label: "в → вл", naive: "гото́вю" },
  },

  // ─── Irréguliers ───────────────────────────────────────────────
  {
    id: "khotet",
    infinitive: "хоте́ть",
    translation: "vouloir",
    conjugation: "irregular",
    present: ["хочу́", "хо́чешь", "хо́чет", "хоти́м", "хоти́те", "хотя́т"],
    past: ["хоте́л", "хоте́ла"],
    imperative: null,
  },
  {
    id: "est",
    infinitive: "есть",
    translation: "manger",
    conjugation: "irregular",
    present: ["ем", "ешь", "ест", "еди́м", "еди́те", "едя́т"],
    past: ["ел", "е́ла"],
    imperative: "ешь",
  },
  {
    id: "dat",
    infinitive: "дать",
    translation: "donner",
    conjugation: "irregular",
    perfective: true,
    present: ["дам", "дашь", "даст", "дади́м", "дади́те", "даду́т"],
    past: ["дал", "дала́"],
    imperative: "дай",
  },
  {
    id: "byt",
    infinitive: "быть",
    translation: "être (futur)",
    conjugation: "irregular",
    present: ["бу́ду", "бу́дешь", "бу́дет", "бу́дем", "бу́дете", "бу́дут"],
    past: ["был", "была́"],
    imperative: "будь",
  },
  {
    id: "ekhat",
    infinitive: "е́хать",
    translation: "aller (en véhicule)",
    conjugation: "irregular",
    present: ["е́ду", "е́дешь", "е́дет", "е́дем", "е́дете", "е́дут"],
    past: ["е́хал", "е́хала"],
    imperative: "поезжа́й",
  },
  {
    id: "bezhat",
    infinitive: "бежа́ть",
    translation: "courir",
    conjugation: "irregular",
    present: ["бегу́", "бежи́шь", "бежи́т", "бежи́м", "бежи́те", "бегу́т"],
    past: ["бежа́л", "бежа́ла"],
    imperative: "беги́",
  },
  {
    id: "vzyat",
    infinitive: "взять",
    translation: "prendre",
    conjugation: "irregular",
    perfective: true,
    present: ["возьму́", "возьмёшь", "возьмёт", "возьмём", "возьмёте", "возьму́т"],
    past: ["взял", "взяла́"],
    imperative: "возьми́",
  },
  {
    id: "ponyat",
    infinitive: "поня́ть",
    translation: "comprendre",
    conjugation: "irregular",
    perfective: true,
    present: ["пойму́", "поймёшь", "поймёт", "поймём", "поймёте", "пойму́т"],
    past: ["по́нял", "поняла́"],
    imperative: "пойми́",
  },
  {
    id: "nachat",
    infinitive: "нача́ть",
    translation: "commencer",
    conjugation: "irregular",
    perfective: true,
    present: ["начну́", "начнёшь", "начнёт", "начнём", "начнёте", "начну́т"],
    past: ["на́чал", "начала́"],
    imperative: "начни́",
  },
];

export const PERSONS = ["я", "ты", "он / она́", "мы", "вы", "они́"] as const;

export function getVerb(id: string): Verb | undefined {
  return VERBS.find((v) => v.id === id);
}

/** Les verbes qui ont une alternance de consonne au présent. */
export const MUTATION_VERBS = VERBS.filter((v) => v.mutation);

// Les verbes à accent mobile au passé sont repérés dans exercises.ts, en
// comparant la position réelle de l'accent : les découper à la main ici
// donnait un test faux, l'accent étant une marque combinante qui compte
// comme un caractère à part.
