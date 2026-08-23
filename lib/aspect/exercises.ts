import {
  ASPECT_PAIRS,
  FORMATION_LABEL,
  getPair,
  type AspectPair,
  type TimelineSchema,
} from "./verbs";

/**
 * Exercices d'aspect.
 *
 * UNE CONTRAINTE GOUVERNE TOUT LE MODULE. L'aspect a de vraies zones
 * ambiguës : beaucoup de contextes admettent les deux formes avec une
 * nuance, pas une faute. Or un exercice à choix unique ne peut porter que
 * sur ce qui est TRANCHÉ. On ne construit donc d'items que là où l'aspect
 * est FORCÉ :
 *
 *   - par un marqueur    долго, весь день, каждый день → imperfectif
 *                        за два часа, вдруг, уже       → perfectif
 *   - par une construction  impératif négatif → imperfectif
 *                           начать / кончить + infinitif → imperfectif
 *   - par un enchaînement de résultats → perfectif
 *
 * Tout ce dont un russophone dirait « les deux, ça dépend » reste hors du
 * module, quitte à couvrir moins. C'est la même règle qui a fait écarter
 * искать/ждать des déclencheurs de l'accusatif.
 */

export const ASPECT_SKILLS = [
  {
    id: "past",
    title: "Processus ou résultat",
    level: "A2",
    summary:
      "« Я реша́л зада́чу » : je planchais dessus. « Я реши́л зада́чу » : je l'ai résolue. Ce n'est pas une question de moment mais de borne atteinte — c'est là que le français induit en erreur avec son imparfait / passé composé.",
  },
  {
    id: "markers",
    title: "Les mots qui tranchent",
    level: "A2",
    summary:
      "Certains compléments imposent l'aspect à eux seuls : « долго », « каждый день », « весь вечер » appellent l'imperfectif ; « за два часа », « вдруг », « уже » appellent le perfectif.",
  },
  {
    id: "future",
    title: "Deux futurs",
    level: "B1",
    summary:
      "« Бу́ду писа́ть » annonce une occupation, « напишу́ » promet un résultat. Le russe a deux futurs là où le français n'en a qu'un.",
  },
  {
    id: "imperative",
    title: "Ordre, prière et interdiction",
    level: "B1",
    summary:
      "À l'impératif négatif, le russe passe à l'imperfectif : « не закрыва́й » interdit, « не закро́й » mettrait en garde contre un accident. Contre-intuitif, et rarement enseigné.",
  },
  {
    id: "pairs",
    title: "Reconnaître la paire",
    level: "B1",
    summary:
      "Le partenaire perfectif s'obtient par préfixe (де́лать → сде́лать), par suffixe (реша́ть → реши́ть), ou pas du tout : говори́ть → сказа́ть. Rien ne le prédit, il faut le savoir.",
  },
] as const;

export type AspectSkillId = (typeof ASPECT_SKILLS)[number]["id"];

export function getSkill(id: string) {
  return ASPECT_SKILLS.find((s) => s.id === id);
}

export interface AspectExercise {
  skill: AspectSkillId;
  /** Permet au serveur de rejuger la réponse sans faire confiance au client. */
  itemId: string;
  prompt: string;
  sentence?: string;
  sentenceFr: string;
  schema?: TimelineSchema;
  options: string[];
  correctIndex: number;
  explain: string;
}

type Rng = () => number;

function pick<T>(items: T[], random: Rng): T {
  return items[Math.floor(random() * items.length)];
}

function shuffleWithAnswer(options: string[], correct: string, random: Rng) {
  const copy = [...options];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return { options: copy, correctIndex: copy.indexOf(correct) };
}

// ─── 1 et 2. Passé : processus vs résultat, et marqueurs ───────────
interface AspectContext {
  id: string;
  /** Gabarit russe : ___ reçoit la forme verbale. */
  template: string;
  fr: string;
  schema: TimelineSchema;
  answer: "imperfective" | "perfective";
  why: string;
  /** UNE paire, pas une liste — voir le commentaire ci-dessous. */
  pair: string;
}

/**
 * Chaque contexte est lié à UNE SEULE paire aspectuelle.
 *
 * Ce n'est pas une limitation, c'est une garantie. La phrase française doit
 * nommer le verbe — sans quoi l'apprenant ne saurait pas lequel employer —
 * et seul l'ASPECT reste à trouver. Si le contexte tirait sa paire au
 * hasard, la phrase française dirait « j'ai lu » pendant que la réponse
 * attendue serait « решил » : « j'ai résolu ce livre ». Lier le contexte à
 * sa paire supprime ce mode d'échec par construction plutôt que par
 * vigilance.
 */
const PAST_CONTEXTS: AspectContext[] = [
  {
    id: "ves-vecher",
    template: "Вчера я весь вечер ___ эту книгу.",
    fr: "Hier, j'ai lu ce livre toute la soirée.",
    schema: "process",
    answer: "imperfective",
    why: "« весь вечер » mesure une durée occupée, sans dire qu'on est arrivé au bout — imperfectif.",
    pair: "chitat",
  },
  {
    id: "za-dva-chasa",
    template: "Я ___ эту книгу за два часа.",
    fr: "J'ai lu ce livre en deux heures.",
    schema: "duration",
    answer: "perfective",
    why: "« за + durée » dit le temps qu'il a fallu pour ALLER AU BOUT : le résultat est atteint — perfectif.",
    pair: "chitat",
  },
  {
    id: "dolgo",
    template: "Он долго ___ эту задачу.",
    fr: "Il a longtemps planché sur ce problème.",
    schema: "attempt",
    answer: "imperfective",
    why: "« долго » décrit l'effort qui dure ; rien ne dit qu'il a abouti — imperfectif.",
    pair: "reshat",
  },
  {
    id: "nakonets",
    template: "Наконец он ___ эту задачу.",
    fr: "Il a fini par résoudre ce problème.",
    schema: "result",
    answer: "perfective",
    why: "« наконец » annonce l'aboutissement après l'effort — perfectif.",
    pair: "reshat",
  },
  {
    id: "kazhdyy-den",
    template: "Каждый день я ___ ей.",
    fr: "Chaque jour, je lui téléphonais.",
    schema: "repetition",
    answer: "imperfective",
    why: "« каждый день » marque la répétition : une suite d'occurrences, pas un événement unique — imperfectif.",
    pair: "zvonit",
  },
  {
    id: "vdrug",
    template: "Вдруг он ___ мне правду.",
    fr: "Soudain, il m'a dit la vérité.",
    schema: "result",
    answer: "perfective",
    why: "« вдруг » signale un événement ponctuel, une rupture — perfectif.",
    pair: "govorit",
  },
  {
    id: "uzhe",
    template: "Я уже ___ этот фильм.",
    fr: "J'ai déjà vu ce film.",
    schema: "result",
    answer: "perfective",
    why: "« уже » pointe un résultat acquis, dont l'effet vaut encore — perfectif.",
    pair: "smotret",
  },
  {
    id: "kogda-zazvonil",
    template: "Когда я ___ письмо, зазвонил телефон.",
    fr: "Pendant que j'écrivais la lettre, le téléphone a sonné.",
    schema: "interrupted",
    answer: "imperfective",
    why: "Un processus en cours pendant lequel un événement survient : la première action n'est pas bornée — imperfectif.",
    pair: "pisat",
  },
  {
    id: "potom",
    template: "Он ___ письмо и сразу отправил его.",
    fr: "Il a écrit la lettre et l'a envoyée aussitôt.",
    schema: "sequence",
    answer: "perfective",
    why: "Deux actions qui s'enchaînent, chacune menée à son terme — perfectif.",
    pair: "pisat",
  },
  {
    id: "obychno",
    template: "Обычно я ___ в семь часов.",
    fr: "D'habitude, je me levais à sept heures.",
    schema: "repetition",
    answer: "imperfective",
    why: "« обычно » décrit une habitude — imperfectif.",
    pair: "vstavat",
  },
  {
    id: "nikogda",
    template: "Я никогда не ___ эту книгу.",
    fr: "Je n'ai jamais lu ce livre.",
    schema: "process",
    answer: "imperfective",
    why: "La négation d'expérience porte sur le fait même, pas sur un résultat manqué — imperfectif.",
    pair: "chitat",
  },
  {
    id: "srazu",
    template: "Она сразу ___ на мой вопрос.",
    fr: "Elle a répondu tout de suite à ma question.",
    schema: "result",
    answer: "perfective",
    why: "« сразу » présente l'action comme un événement unique et abouti — perfectif.",
    pair: "otvechat",
  },
  {
    id: "dva-chasa-gotovil",
    template: "Она два часа ___ ужин.",
    fr: "Elle a préparé le dîner pendant deux heures.",
    schema: "duration",
    answer: "imperfective",
    why: "« два часа » à l'accusatif mesure une durée REMPLIE, pas un délai d'aboutissement — imperfectif. Comparer avec « за два часа » (en deux heures), qui appelle le perfectif.",
    pair: "gotovit",
  },
  {
    id: "za-chas-prigotovila",
    template: "Она ___ ужин за час.",
    fr: "Elle a préparé le dîner en une heure.",
    schema: "duration",
    answer: "perfective",
    why: "« за + durée » = le temps qu'il a fallu pour aboutir — perfectif. C'est la paire exacte de l'item précédent, et c'est la préposition seule qui change tout.",
    pair: "gotovit",
  },
  {
    id: "chasto",
    template: "В детстве он часто ___ этот фильм.",
    fr: "Enfant, il regardait souvent ce film.",
    schema: "repetition",
    answer: "imperfective",
    why: "« часто » marque la répétition — imperfectif.",
    pair: "smotret",
  },
  {
    id: "vypil-srazu",
    template: "Он ___ стакан воды и вышел.",
    fr: "Il a bu un verre d'eau et il est sorti.",
    schema: "sequence",
    answer: "perfective",
    why: "Enchaînement de deux actions achevées — perfectif.",
    pair: "pit",
  },
  {
    id: "poka-govoril",
    template: "Пока он ___ , все молчали.",
    fr: "Pendant qu'il parlait, tout le monde se taisait.",
    schema: "process",
    answer: "imperfective",
    why: "« пока » installe un arrière-plan qui dure — imperfectif.",
    pair: "govorit",
  },
  {
    id: "uzhe-kupil",
    template: "Я уже ___ билеты.",
    fr: "J'ai déjà acheté les billets.",
    schema: "result",
    answer: "perfective",
    why: "« уже » + résultat encore valable — perfectif.",
    pair: "pokupat",
  },
];

function pastExercise(random: Rng, onlyMarkers: boolean): AspectExercise {
  // Le mode « marqueurs » ne retient que les contextes dont le sens tient
  // dans un seul mot : c'est ce mot qu'on apprend à repérer.
  const contexts = onlyMarkers
    ? PAST_CONTEXTS.filter((c) => MARKER_OF[c.id] !== undefined)
    : PAST_CONTEXTS;
  const context = pick(contexts, random);
  const pair = getPair(context.pair)!;
  const correct = context.answer === "imperfective" ? pair.impPast : pair.perfPast;

  const { options, correctIndex } = shuffleWithAnswer(
    [pair.impPast, pair.perfPast],
    correct,
    random
  );
  const marker = MARKER_OF[context.id];
  return {
    skill: onlyMarkers ? "markers" : "past",
    itemId: `${onlyMarkers ? "markers" : "past"}:${context.id}:${pair.id}`,
    prompt: onlyMarkers
      ? `Quel aspect « ${marker} » impose-t-il ?`
      : "Processus en cours, ou résultat atteint ?",
    sentence: context.template,
    sentenceFr: context.fr,
    schema: context.schema,
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct} (${pair.imperfective} / ${pair.perfective}).`,
  };
}

/** Le mot qui, à lui seul, tranche l'aspect du contexte. */
const MARKER_OF: Record<string, string> = {
  "ves-vecher": "весь вечер",
  "za-dva-chasa": "за два часа",
  dolgo: "долго",
  nakonets: "наконец",
  "kazhdyy-den": "каждый день",
  vdrug: "вдруг",
  uzhe: "уже",
  obychno: "обычно",
  srazu: "сразу",
  "dva-chasa-gotovil": "два часа",
  "za-chas-prigotovila": "за час",
  chasto: "часто",
  "uzhe-kupil": "уже",
};

// ─── 3. Les deux futurs ────────────────────────────────────────────
interface FutureContext {
  id: string;
  template: string;
  fr: string;
  schema: TimelineSchema;
  answer: "imperfective" | "perfective";
  why: string;
  pair: string;
}

const FUTURE_CONTEXTS: FutureContext[] = [
  {
    id: "ves-den",
    template: "Завтра я весь день ___ .",
    fr: "Demain, je vais lire toute la journée.",
    schema: "process",
    answer: "imperfective",
    why: "« весь день » annonce une occupation qui remplit du temps, sans borne — futur imperfectif « буду » + infinitif.",
    pair: "chitat",
  },
  {
    id: "i-otpravlyu",
    template: "Завтра я ___ письмо и отправлю его.",
    fr: "Demain, j'écrirai la lettre et je l'enverrai.",
    schema: "sequence",
    answer: "perfective",
    why: "Deux actions qui s'enchaînent, chacune menée à son terme — futur perfectif.",
    pair: "pisat",
  },
  {
    id: "kazhdyy-vecher",
    template: "Каждый вечер я ___ ей.",
    fr: "Chaque soir, je lui téléphonerai.",
    schema: "repetition",
    answer: "imperfective",
    why: "La répétition exclut le perfectif, qui ne décrit qu'une occurrence — futur imperfectif.",
    pair: "zvonit",
  },
  {
    id: "obeshchayu",
    template: "Обещаю, я ___ это сегодня.",
    fr: "Je te promets que je le ferai aujourd'hui.",
    schema: "result",
    answer: "perfective",
    why: "Une promesse porte sur un résultat, pas sur une occupation — futur perfectif.",
    pair: "delat",
  },
  {
    id: "za-chas",
    template: "Я ___ это за час.",
    fr: "Je le ferai en une heure.",
    schema: "duration",
    answer: "perfective",
    why: "« за + durée » mesure le temps nécessaire pour aboutir — futur perfectif.",
    pair: "delat",
  },
  {
    id: "vsyu-nedelyu",
    template: "Я всю неделю ___ к экзамену.",
    fr: "Toute la semaine, je vais préparer l'examen.",
    schema: "process",
    answer: "imperfective",
    why: "« всю неделю » décrit une occupation étalée — futur imperfectif.",
    pair: "gotovit",
  },
  {
    id: "zavtra-vstanu",
    template: "Завтра я ___ в шесть часов.",
    fr: "Demain, je me lèverai à six heures.",
    schema: "result",
    answer: "perfective",
    why: "Un événement unique et daté — futur perfectif.",
    pair: "vstavat",
  },
  {
    id: "tselyy-god",
    template: "Весь год я ___ русский язык.",
    fr: "Toute l'année, je vais étudier le russe.",
    schema: "process",
    answer: "imperfective",
    why: "« весь год » annonce une occupation étalée dans le temps — futur imperfectif.",
    pair: "izuchat",
  },
  {
    id: "kak-tolko",
    template: "Как только приеду, я ___ тебе.",
    fr: "Dès que j'arrive, je t'appellerai.",
    schema: "sequence",
    answer: "perfective",
    why: "Un événement unique déclenché par un autre — futur perfectif.",
    pair: "zvonit",
  },
  {
    id: "nikogda-ne",
    template: "Больше я никогда не ___ об этом.",
    fr: "Je n'en parlerai plus jamais.",
    schema: "process",
    answer: "imperfective",
    why: "« никогда не » nie l'action en général, pas un résultat manqué — futur imperfectif.",
    pair: "govorit",
  },
];

function futureExercise(random: Rng): AspectExercise {
  const context = pick(FUTURE_CONTEXTS, random);
  const pair = getPair(context.pair)!;
  const imperfectiveFuture = `буду ${pair.imperfective}`;
  const correct = context.answer === "imperfective" ? imperfectiveFuture : pair.perfFuture1;

  const { options, correctIndex } = shuffleWithAnswer(
    [imperfectiveFuture, pair.perfFuture1],
    correct,
    random
  );
  return {
    skill: "future",
    itemId: `future:${context.id}:${pair.id}`,
    prompt: "Occupation à venir, ou résultat promis ?",
    sentence: context.template,
    sentenceFr: context.fr,
    schema: context.schema,
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct}.`,
  };
}

// ─── 4. Impératif : ordre, prière, interdiction ────────────────────
interface ImperativeContext {
  id: string;
  template: string;
  fr: string;
  answer: "imperfective" | "perfective";
  why: string;
  pair: string;
}

const IMPERATIVE_CONTEXTS: ImperativeContext[] = [
  {
    id: "negation",
    template: "Не ___ окно, пожалуйста!",
    fr: "Ne ferme pas la fenêtre, s'il te plaît !",
    answer: "imperfective",
    why: "Interdiction : l'impératif NÉGATIF appelle l'imperfectif. Le perfectif « не закрой » serait une mise en garde contre un accident (« attention à ne pas fermer »).",
    pair: "zakryvat",
  },
  {
    id: "negation-opozdat",
    template: "Не ___ мне так поздно!",
    fr: "Ne m'appelle pas si tard !",
    answer: "imperfective",
    why: "Même règle : une interdiction se dit à l'imperfectif.",
    pair: "zvonit",
  },
  {
    id: "polite-request",
    template: "___ , пожалуйста, ещё раз.",
    fr: "Répétez, s'il vous plaît.",
    answer: "perfective",
    why: "Demande ponctuelle et unique, dont on attend le résultat — perfectif.",
    pair: "povtoryat",
  },
  {
    id: "invitation",
    template: "___ , пожалуйста! Чувствуйте себя как дома.",
    fr: "Asseyez-vous, je vous en prie ! Faites comme chez vous.",
    answer: "imperfective",
    why: "Invitation chaleureuse : l'imperfectif « садитесь » accueille, alors que le perfectif « сядьте » sonne comme un ordre.",
    pair: "sadit",
  },
  {
    id: "one-off",
    template: "___ мне соль, пожалуйста.",
    fr: "Passe-moi le sel, s'il te plaît.",
    answer: "perfective",
    why: "Une seule action attendue, avec son résultat — perfectif.",
    pair: "davat",
  },
  {
    id: "negation-brat",
    template: "Не ___ эту книгу без разрешения.",
    fr: "Ne prends pas ce livre sans autorisation.",
    answer: "imperfective",
    why: "Interdiction générale : l'impératif négatif appelle l'imperfectif.",
    pair: "brat",
  },
  {
    id: "negation-govorit",
    template: "Не ___ об этом никому!",
    fr: "N'en parle à personne !",
    answer: "imperfective",
    why: "Défense de faire quelque chose, sans limite de temps — imperfectif.",
    pair: "govorit",
  },
  {
    id: "polite-open",
    template: "___ , пожалуйста, окно.",
    fr: "Ouvrez la fenêtre, s'il vous plaît.",
    answer: "perfective",
    why: "Une action unique dont on attend le résultat immédiat — perfectif.",
    pair: "otkryvat",
  },
  {
    id: "invitation-eat",
    template: "___ , пожалуйста! Всё ещё горячее.",
    fr: "Mangez, je vous en prie ! C'est encore chaud.",
    answer: "imperfective",
    why: "Invitation chaleureuse : l'imperfectif accueille, le perfectif « съешьте » sonnerait comme un ordre.",
    pair: "est",
  },
];

function imperativeExercise(random: Rng): AspectExercise {
  const context = pick(IMPERATIVE_CONTEXTS, random);
  const pair = getPair(context.pair)!;
  const correct = context.answer === "imperfective" ? pair.impImperative : pair.perfImperative;

  const { options, correctIndex } = shuffleWithAnswer(
    [pair.impImperative, pair.perfImperative],
    correct,
    random
  );
  return {
    skill: "imperative",
    itemId: `imperative:${context.id}:${pair.id}`,
    prompt: "Quelle forme de l'impératif ?",
    sentence: context.template,
    sentenceFr: context.fr,
    schema: context.answer === "imperfective" ? "process" : "result",
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct}.`,
  };
}

// ─── 5. Reconnaître la paire ───────────────────────────────────────
function pairsExercise(random: Rng): AspectExercise {
  const pair = pick(ASPECT_PAIRS, random);
  const others = ASPECT_PAIRS.filter((p) => p.id !== pair.id);
  const shuffled = [...others];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const distractors = shuffled.slice(0, 3).map((p) => p.perfective);

  const { options, correctIndex } = shuffleWithAnswer(
    [pair.perfective, ...distractors],
    pair.perfective,
    random
  );
  return {
    skill: "pairs",
    itemId: `pairs:${pair.id}`,
    prompt: "Quel est le partenaire perfectif de ce verbe ?",
    sentence: pair.imperfective,
    sentenceFr: pair.translation,
    options,
    correctIndex,
    explain: `${pair.imperfective} → ${pair.perfective} (${FORMATION_LABEL[pair.formation]}). ${
      pair.formation === "suppletion"
        ? "Aucun rapport de forme entre les deux : cette paire s'apprend telle quelle."
        : "Repérer le procédé aide, mais il ne se devine pas : chaque paire s'apprend."
    }`,
  };
}

const GENERATORS: Record<AspectSkillId, (random: Rng) => AspectExercise> = {
  past: (r) => pastExercise(r, false),
  markers: (r) => pastExercise(r, true),
  future: futureExercise,
  imperative: imperativeExercise,
  pairs: pairsExercise,
};

export function generateAspectExercise(
  skill: AspectSkillId,
  random: Rng = Math.random
): AspectExercise {
  return GENERATORS[skill](random);
}

/**
 * Rejoue la correction à partir du seul identifiant d'item : le client
 * envoie ce qu'il a choisi, jamais s'il avait juste. Même règle que les
 * modules Cas et Mouvement.
 */
export function checkAspectAnswer(itemId: string, answer: string): boolean | null {
  const [kind, ...rest] = itemId.split(":");

  if (kind === "past" || kind === "markers") {
    const context = PAST_CONTEXTS.find((c) => c.id === rest[0]);
    const pair = getPair(rest[1]);
    if (!context || !pair) return null;
    if (kind === "markers" && MARKER_OF[context.id] === undefined) return null;
    return (context.answer === "imperfective" ? pair.impPast : pair.perfPast) === answer;
  }
  if (kind === "future") {
    const context = FUTURE_CONTEXTS.find((c) => c.id === rest[0]);
    const pair = getPair(rest[1]);
    if (!context || !pair) return null;
    const expected =
      context.answer === "imperfective" ? `буду ${pair.imperfective}` : pair.perfFuture1;
    return expected === answer;
  }
  if (kind === "imperative") {
    const context = IMPERATIVE_CONTEXTS.find((c) => c.id === rest[0]);
    const pair = getPair(rest[1]);
    if (!context || !pair) return null;
    return (context.answer === "imperfective" ? pair.impImperative : pair.perfImperative) === answer;
  }
  if (kind === "pairs") {
    const pair = getPair(rest[0]);
    return pair ? pair.perfective === answer : null;
  }
  return null;
}

export { PAST_CONTEXTS, FUTURE_CONTEXTS, IMPERATIVE_CONTEXTS, MARKER_OF };
export type { AspectPair };
