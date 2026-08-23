import { getVerb, PARTICIPLE_VERBS, type ParticipleVerb } from "./verbs";

/**
 * Exercices sur les participes et gérondifs.
 *
 * Tout le module repose sur la TRANSFORMATION : on montre la proposition
 * dépliée, l'apprenant produit la forme comprimée. C'est ce que le
 * participe est réellement, et c'est la seule manipulation qui installe la
 * compétence — reconnaître « читающий » dans une liste ne prouve rien, le
 * dériver de « который читает », si.
 *
 * Comme dans les modules Aspect et Mouvement, chaque contexte est lié à UN
 * verbe : la phrase française nomme le verbe, seule la FORME reste à
 * trouver. Le tirage aléatoire du verbe produirait des phrases dont la
 * traduction ne correspond pas à la réponse attendue.
 */

export const PARTICIPLE_SKILLS = [
  {
    id: "active",
    title: "Participes actifs",
    level: "B2",
    summary:
      "« Челове́к, кото́рый чита́ет » se comprime en « чита́ющий ». Présent pour ce qui se fait, passé en -вший pour ce qui s'est fait. Le participe s'accorde comme un adjectif.",
  },
  {
    id: "passive",
    title: "Participes passifs",
    level: "B2",
    summary:
      "« Кни́га, кото́рую написа́л Толсто́й » devient « кни́га, напи́санная Толсты́м ». L'objet devient le support du participe, et l'auteur passe à l'instrumental.",
  },
  {
    id: "short",
    title: "Forme longue ou courte",
    level: "B2",
    summary:
      "« закры́тая дверь » qualifie (épithète), « дверь закры́та » affirme (attribut). Le français dit « fermée » dans les deux cas — le russe non.",
  },
  {
    id: "gerund",
    title: "Gérondifs",
    level: "B2",
    summary:
      "Imperfectif en -я pour une action simultanée (« чита́я »), perfectif en -в pour une action antérieure (« прочита́в »). C'est l'ordre des actions qui décide.",
  },
  {
    id: "subject",
    title: "La règle du sujet unique",
    level: "C1",
    summary:
      "Un gérondif doit avoir le MÊME sujet que le verbe principal. « Возвраща́ясь домо́й, начался́ дождь » est fautif : ce n'est pas la pluie qui rentrait. L'erreur la plus fréquente, et la plus invisible pour un francophone.",
  },
] as const;

export type ParticipleSkillId = (typeof PARTICIPLE_SKILLS)[number]["id"];

export function getSkill(id: string) {
  return PARTICIPLE_SKILLS.find((s) => s.id === id);
}

export interface ParticipleExercise {
  skill: ParticipleSkillId;
  itemId: string;
  prompt: string;
  /** Proposition dépliée — ce qu'on comprime. */
  expanded?: string;
  /** Phrase comprimée, avec ___ à la place de la forme cherchée. */
  compressed: string;
  sentenceFr: string;
  options: string[];
  correctIndex: number;
  explain: string;
}

type Rng = () => number;

function pick<T>(items: T[], random: Rng): T {
  return items[Math.floor(random() * items.length)];
}

function shuffleWithAnswer(options: string[], correct: string, random: Rng) {
  const unique = [...new Set(options)];
  for (let i = unique.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  return { options: unique, correctIndex: unique.indexOf(correct) };
}

// ─── 1. Participes actifs ──────────────────────────────────────────
interface ActiveContext {
  id: string;
  verb: string;
  /** Forme attendue : présent (ce qui se fait) ou passé (ce qui s'est fait). */
  tense: "present" | "past";
  expanded: string;
  compressed: string;
  fr: string;
  why: string;
}

const ACTIVE_CONTEXTS: ActiveContext[] = [
  {
    id: "student-reading",
    verb: "chitat",
    tense: "present",
    expanded: "Студент, который читает в библиотеке, — мой друг.",
    compressed: "Студент, ___ в библиотеке, — мой друг.",
    fr: "L'étudiant qui lit à la bibliothèque est mon ami.",
    why: "L'action est en cours et le sujet la fait : participe présent ACTIF en -щий.",
  },
  {
    id: "man-worked",
    verb: "rabotat",
    tense: "past",
    expanded: "Человек, который работал здесь, уехал.",
    compressed: "Человек, ___ здесь, уехал.",
    fr: "L'homme qui travaillait ici est parti.",
    why: "L'action est révolue : participe passé actif en -вший.",
  },
  {
    id: "people-living",
    verb: "zhit",
    tense: "present",
    expanded: "Люди, которые живут в этом доме, очень дружные.",
    compressed: "Люди, ___ в этом доме, очень дружные.",
    fr: "Les gens qui habitent cet immeuble sont très soudés.",
    why: "État actuel : participe présent actif. Il s'accorde ici au pluriel — comme un adjectif.",
  },
  {
    id: "girl-helped",
    verb: "pomogat",
    tense: "past",
    expanded: "Девушка, которая помогала нам, работает здесь.",
    compressed: "Девушка, ___ нам, работает здесь.",
    fr: "La jeune fille qui nous aidait travaille ici.",
    why: "Action passée et durable : participe passé actif imperfectif en -вший.",
  },
  {
    id: "engineer-building",
    verb: "stroit",
    tense: "present",
    expanded: "Инженер, который строит этот мост, очень опытный.",
    compressed: "Инженер, ___ этот мост, очень опытный.",
    fr: "L'ingénieur qui construit ce pont est très expérimenté.",
    why: "Le sujet accomplit l'action maintenant : participe présent actif.",
  },
  {
    id: "friend-returning",
    verb: "vozvrashchatsya",
    tense: "present",
    expanded: "Друг, который возвращается из Москвы, позвонит вечером.",
    compressed: "Друг, ___ из Москвы, позвонит вечером.",
    fr: "L'ami qui revient de Moscou appellera ce soir.",
    why: "Verbe pronominal : le participe garde le -ся, qui ne devient jamais -сь.",
  },
  {
    id: "teacher-speaking",
    verb: "govorit",
    tense: "present",
    expanded: "Преподаватель, который говорит по-китайски, редкость.",
    compressed: "Преподаватель, ___ по-китайски, редкость.",
    fr: "Un professeur qui parle chinois, c'est rare.",
    why: "Aptitude actuelle : participe présent actif.",
  },
  {
    id: "students-studied",
    verb: "izuchat",
    tense: "past",
    expanded: "Студенты, которые изучали русский, сдали экзамен.",
    compressed: "Студенты, ___ русский, сдали экзамен.",
    fr: "Les étudiants qui étudiaient le russe ont réussi l'examen.",
    why: "Action passée : participe passé actif, accordé au pluriel.",
  },
];

function activeExercise(random: Rng): ParticipleExercise {
  const context = pick(ACTIVE_CONTEXTS, random);
  const verb = getVerb(context.verb)!;
  const correct = context.tense === "present" ? verb.activePresent : verb.activePastImp;
  const other = context.tense === "present" ? verb.activePastImp : verb.activePresent;

  // Distracteurs pris dans le PARADIGME DU MÊME VERBE : c'est la forme
  // qu'il faut choisir, pas le verbe. Un distracteur d'un autre verbe
  // rendrait l'item trivial.
  const distractors = [other, verb.gerundImp, verb.passivePast].filter(
    (f): f is string => typeof f === "string" && f !== correct
  );
  const { options, correctIndex } = shuffleWithAnswer(
    [correct, ...distractors.slice(0, 3)],
    correct,
    random
  );
  return {
    skill: "active",
    itemId: `active:${context.id}`,
    prompt: "Comprime la relative en participe",
    expanded: context.expanded,
    compressed: context.compressed,
    sentenceFr: context.fr,
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct} (${verb.imperfective}).`,
  };
}

// ─── 2. Participes passifs ─────────────────────────────────────────
interface PassiveContext {
  id: string;
  verb: string;
  /** Genre et nombre du support, pour l'accord de la forme longue. */
  agreement: "f" | "m" | "n" | "pl";
  expanded: string;
  compressed: string;
  fr: string;
  why: string;
}

/** Terminaisons de la forme longue selon l'accord. */
function agree(long: string, agreement: PassiveContext["agreement"]): string {
  const stem = long.slice(0, -2); // -ый / -ий / -ой font deux caractères
  const soft = long.endsWith("ий");
  if (agreement === "m") return long;
  if (agreement === "f") return stem + (soft ? "яя" : "ая");
  if (agreement === "n") return stem + (soft ? "ее" : "ое");
  return stem + (soft ? "ие" : "ые");
}

const PASSIVE_CONTEXTS: PassiveContext[] = [
  {
    id: "book-written",
    verb: "pisat",
    agreement: "f",
    expanded: "Книга, которую написал Толстой, стала классикой.",
    compressed: "Книга, ___ Толстым, стала классикой.",
    fr: "Le livre écrit par Tolstoï est devenu un classique.",
    why: "L'objet devient le support du participe passif, et l'auteur passe à l'instrumental (Толстым). Le participe s'accorde avec « книга », féminin.",
  },
  {
    id: "bridge-built",
    verb: "stroit",
    agreement: "m",
    expanded: "Мост, который построили в прошлом веке, ещё стоит.",
    compressed: "___ в прошлом веке мост ещё стоит.",
    fr: "Le pont construit au siècle dernier tient encore.",
    why: "Participe passé passif, accordé au masculin avec « мост ».",
  },
  {
    id: "letter-received",
    verb: "poluchat",
    agreement: "n",
    expanded: "Письмо, которое получили вчера, было важным.",
    compressed: "___ вчера письмо было важным.",
    fr: "La lettre reçue hier était importante.",
    why: "« письмо » est neutre : le participe prend la terminaison neutre.",
  },
  {
    id: "problems-solved",
    verb: "reshat",
    agreement: "pl",
    expanded: "Задачи, которые решили студенты, были трудными.",
    compressed: "___ студентами задачи были трудными.",
    fr: "Les problèmes résolus par les étudiants étaient difficiles.",
    why: "Accord au pluriel, et l'agent au pluriel instrumental (студентами).",
  },
  {
    id: "dinner-prepared",
    verb: "gotovit",
    agreement: "m",
    expanded: "Ужин, который приготовила мама, был вкусным.",
    compressed: "___ мамой ужин был вкусным.",
    fr: "Le dîner préparé par maman était délicieux.",
    why: "L'agent féminin passe aussi à l'instrumental : мамой.",
  },
  {
    id: "work-finished",
    verb: "zakanchivat",
    agreement: "f",
    expanded: "Работа, которую закончили вовремя, получила приз.",
    compressed: "___ вовремя работа получила приз.",
    fr: "Le travail terminé à temps a reçu un prix.",
    why: "Accord au féminin avec « работа ».",
  },
];

function passiveExercise(random: Rng): ParticipleExercise {
  const context = pick(PASSIVE_CONTEXTS, random);
  const verb = getVerb(context.verb)!;
  const correct = agree(verb.passivePast!, context.agreement);

  // Distracteurs : l'actif (contresens de voix), un mauvais accord, et le
  // gérondif. Trois erreurs réellement commises.
  const wrongAgreement = agree(verb.passivePast!, context.agreement === "f" ? "m" : "f");
  const distractors = [verb.activePastPerf, wrongAgreement, verb.gerundPerf].filter(
    (f): f is string => typeof f === "string" && f !== correct
  );
  const { options, correctIndex } = shuffleWithAnswer(
    [correct, ...distractors.slice(0, 3)],
    correct,
    random
  );
  return {
    skill: "passive",
    itemId: `passive:${context.id}`,
    prompt: "Comprime la relative en participe passif",
    expanded: context.expanded,
    compressed: context.compressed,
    sentenceFr: context.fr,
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct}.`,
  };
}

// ─── 3. Forme longue ou forme courte ───────────────────────────────
interface ShortContext {
  id: string;
  verb: string;
  form: "short" | "long";
  agreement: "m" | "f" | "n" | "pl";
  sentence: string;
  fr: string;
  why: string;
}

const SHORT_CONTEXTS: ShortContext[] = [
  {
    id: "door-is-closed",
    verb: "zakryvat",
    form: "short",
    agreement: "f",
    sentence: "Дверь ___ .",
    fr: "La porte est fermée.",
    why: "Le participe est ATTRIBUT : il affirme quelque chose du sujet → forme courte.",
  },
  {
    id: "closed-door",
    verb: "zakryvat",
    form: "long",
    agreement: "f",
    sentence: "Он не заметил ___ дверь.",
    fr: "Il n'a pas remarqué la porte fermée.",
    why: "Le participe est ÉPITHÈTE : il qualifie le nom qu'il accompagne → forme longue, accordée.",
  },
  {
    id: "house-is-built",
    verb: "stroit",
    form: "short",
    agreement: "m",
    sentence: "Дом ___ в прошлом году.",
    fr: "La maison a été construite l'an dernier.",
    why: "Attribut au passif : forme courte, accordée au masculin avec « дом ».",
  },
  {
    id: "window-is-open",
    verb: "otkryvat",
    form: "short",
    agreement: "n",
    sentence: "Окно ___ .",
    fr: "La fenêtre est ouverte.",
    why: "« окно » est neutre : la forme courte prend -о.",
  },
  {
    id: "work-is-done",
    verb: "delat",
    form: "short",
    agreement: "f",
    sentence: "Работа ___ .",
    fr: "Le travail est fait.",
    why: "Attribut : forme courte, accordée avec « работа », féminin.",
  },
  {
    id: "solved-problem",
    verb: "reshat",
    form: "long",
    agreement: "f",
    sentence: "Это уже ___ задача.",
    fr: "C'est un problème déjà résolu.",
    why: "Épithète devant le nom : forme longue accordée.",
  },
  {
    id: "letters-received",
    verb: "poluchat",
    form: "short",
    agreement: "pl",
    sentence: "Все письма ___ .",
    fr: "Toutes les lettres ont été reçues.",
    why: "Attribut au pluriel : forme courte en -ы.",
  },
];

function shortExercise(random: Rng): ParticipleExercise {
  const context = pick(SHORT_CONTEXTS, random);
  const verb = getVerb(context.verb)!;
  const short = verb.passiveShort![context.agreement];
  const long = agree(verb.passivePast!, context.agreement);
  const correct = context.form === "short" ? short : long;

  const { options, correctIndex } = shuffleWithAnswer([short, long], correct, random);
  return {
    skill: "short",
    itemId: `short:${context.id}`,
    prompt: "Attribut ou épithète ?",
    compressed: context.sentence,
    sentenceFr: context.fr,
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct}.`,
  };
}

// ─── 4. Gérondifs ──────────────────────────────────────────────────
interface GerundContext {
  id: string;
  verb: string;
  aspect: "imperfective" | "perfective";
  expanded: string;
  compressed: string;
  fr: string;
  why: string;
}

const GERUND_CONTEXTS: GerundContext[] = [
  {
    id: "finished-then-left",
    verb: "zakanchivat",
    aspect: "perfective",
    expanded: "Когда он закончил работу, он пошёл домой.",
    compressed: "___ работу, он пошёл домой.",
    fr: "Ayant terminé son travail, il est rentré.",
    why: "L'action est ACHEVÉE avant celle du verbe principal → gérondif perfectif en -в.",
  },
  {
    id: "reading-smiled",
    verb: "chitat",
    aspect: "imperfective",
    expanded: "Пока он читал письмо, он улыбался.",
    compressed: "___ письмо, он улыбался.",
    fr: "En lisant la lettre, il souriait.",
    why: "Les deux actions sont SIMULTANÉES → gérondif imperfectif en -я.",
  },
  {
    id: "returning-met",
    verb: "vozvrashchatsya",
    aspect: "imperfective",
    expanded: "Когда я возвращался домой, я встретил друга.",
    compressed: "___ домой, я встретил друга.",
    fr: "En rentrant chez moi, j'ai croisé un ami.",
    why: "Le trajet est en cours quand la rencontre a lieu → gérondif imperfectif. Un verbe pronominal donne -ясь.",
  },
  {
    id: "having-read",
    verb: "chitat",
    aspect: "perfective",
    expanded: "Когда он прочитал письмо, он его выбросил.",
    compressed: "___ письмо, он его выбросил.",
    fr: "Après avoir lu la lettre, il l'a jetée.",
    why: "L'action est terminée avant la suivante → gérondif perfectif.",
  },
  {
    id: "working-listened",
    verb: "rabotat",
    aspect: "imperfective",
    expanded: "Пока он работал, он слушал музыку.",
    compressed: "___ , он слушал музыку.",
    fr: "Pendant qu'il travaillait, il écoutait de la musique.",
    why: "Arrière-plan simultané → gérondif imperfectif.",
  },
  {
    id: "having-arrived",
    verb: "idti",
    aspect: "perfective",
    expanded: "Когда он пришёл домой, он сразу лёг спать.",
    compressed: "___ домой, он сразу лёг спать.",
    fr: "Une fois rentré, il s'est couché aussitôt.",
    why: "Arrivée achevée, puis action suivante → gérondif perfectif (придя).",
  },
  {
    id: "helping-explained",
    verb: "pomogat",
    aspect: "imperfective",
    expanded: "Когда она помогала мне, она всё объясняла.",
    compressed: "___ мне, она всё объясняла.",
    fr: "En m'aidant, elle expliquait tout.",
    why: "Actions simultanées → gérondif imperfectif.",
  },
];

function gerundExercise(random: Rng): ParticipleExercise {
  const context = pick(GERUND_CONTEXTS, random);
  const verb = getVerb(context.verb)!;
  const correct = context.aspect === "imperfective" ? verb.gerundImp! : verb.gerundPerf!;
  const other = context.aspect === "imperfective" ? verb.gerundPerf : verb.gerundImp;

  const distractors = [other, verb.activePresent, verb.activePastImp].filter(
    (f): f is string => typeof f === "string" && f !== correct
  );
  const { options, correctIndex } = shuffleWithAnswer(
    [correct, ...distractors.slice(0, 3)],
    correct,
    random
  );
  return {
    skill: "gerund",
    itemId: `gerund:${context.id}`,
    prompt: "Actions simultanées, ou l'une avant l'autre ?",
    expanded: context.expanded,
    compressed: context.compressed,
    sentenceFr: context.fr,
    options,
    correctIndex,
    explain: `${context.why} Ici : ${correct}.`,
  };
}

// ─── 5. La règle du sujet unique ───────────────────────────────────
/**
 * L'erreur la plus fréquente, et la plus invisible pour un francophone :
 * le gérondif doit avoir le même sujet que le verbe principal. Ici on ne
 * demande pas de produire une forme mais de REPÉRER la phrase correcte.
 */
interface SubjectItem {
  id: string;
  correct: string;
  wrong: string[];
  fr: string;
  why: string;
}

const SUBJECT_ITEMS: SubjectItem[] = [
  {
    id: "rain",
    correct: "Возвращаясь домой, я попал под дождь.",
    wrong: ["Возвращаясь домой, начался дождь.", "Возвращаясь домой, дождь застал меня."],
    fr: "En rentrant chez moi, je me suis fait surprendre par la pluie.",
    why: "Le gérondif et le verbe principal doivent avoir le MÊME sujet. Dans les phrases fautives, c'est la pluie qui « rentrerait à la maison ».",
  },
  {
    id: "reading",
    correct: "Читая эту книгу, я многое понял.",
    wrong: ["Читая эту книгу, мне многое стало ясно.", "Читая эту книгу, всё стало понятно."],
    fr: "En lisant ce livre, j'ai compris beaucoup de choses.",
    why: "« мне » et « всё » ne sont pas des sujets qui lisent : seule la première phrase respecte l'unicité du sujet.",
  },
  {
    id: "finishing",
    correct: "Закончив работу, он выключил компьютер.",
    wrong: ["Закончив работу, компьютер был выключен.", "Закончив работу, ему стало легче."],
    fr: "Ayant terminé son travail, il a éteint l'ordinateur.",
    why: "Un passif ou un datif impersonnel ne fournit pas de sujet au gérondif : ce n'est pas l'ordinateur qui a terminé le travail.",
  },
  {
    id: "entering",
    correct: "Войдя в комнату, она поздоровалась.",
    wrong: ["Войдя в комнату, ей стало холодно.", "Войдя в комнату, было темно."],
    fr: "En entrant dans la pièce, elle a dit bonjour.",
    why: "« ей стало холодно » et « было темно » n'ont pas de sujet agissant : le gérondif reste en l'air.",
  },
  {
    id: "waiting",
    correct: "Ожидая поезда, мы пили кофе.",
    wrong: ["Ожидая поезда, время шло медленно.", "Ожидая поезда, нам было скучно."],
    fr: "En attendant le train, nous buvions du café.",
    why: "Ce n'est pas le temps qui attend le train. Seul « мы » peut à la fois attendre et boire.",
  },
];

function subjectExercise(random: Rng): ParticipleExercise {
  const item = pick(SUBJECT_ITEMS, random);
  const { options, correctIndex } = shuffleWithAnswer(
    [item.correct, ...item.wrong],
    item.correct,
    random
  );
  return {
    skill: "subject",
    itemId: `subject:${item.id}`,
    prompt: "Quelle phrase respecte la règle du sujet unique ?",
    // Pas de gabarit à trou ici : l'exercice porte sur des phrases entières.
    compressed: "",
    sentenceFr: item.fr,
    options,
    correctIndex,
    explain: item.why,
  };
}

const GENERATORS: Record<ParticipleSkillId, (random: Rng) => ParticipleExercise> = {
  active: activeExercise,
  passive: passiveExercise,
  short: shortExercise,
  gerund: gerundExercise,
  subject: subjectExercise,
};

export function generateParticipleExercise(
  skill: ParticipleSkillId,
  random: Rng = Math.random
): ParticipleExercise {
  return GENERATORS[skill](random);
}

/** Rejoue la correction côté serveur, à partir du seul identifiant d'item. */
export function checkParticipleAnswer(itemId: string, answer: string): boolean | null {
  const [kind, id] = itemId.split(":");

  if (kind === "active") {
    const context = ACTIVE_CONTEXTS.find((c) => c.id === id);
    const verb = context ? getVerb(context.verb) : undefined;
    if (!context || !verb) return null;
    return (context.tense === "present" ? verb.activePresent : verb.activePastImp) === answer;
  }
  if (kind === "passive") {
    const context = PASSIVE_CONTEXTS.find((c) => c.id === id);
    const verb = context ? getVerb(context.verb) : undefined;
    if (!context || !verb?.passivePast) return null;
    return agree(verb.passivePast, context.agreement) === answer;
  }
  if (kind === "short") {
    const context = SHORT_CONTEXTS.find((c) => c.id === id);
    const verb = context ? getVerb(context.verb) : undefined;
    if (!context || !verb?.passivePast || !verb.passiveShort) return null;
    const expected =
      context.form === "short"
        ? verb.passiveShort[context.agreement]
        : agree(verb.passivePast, context.agreement);
    return expected === answer;
  }
  if (kind === "gerund") {
    const context = GERUND_CONTEXTS.find((c) => c.id === id);
    const verb = context ? getVerb(context.verb) : undefined;
    if (!context || !verb) return null;
    const expected = context.aspect === "imperfective" ? verb.gerundImp : verb.gerundPerf;
    return expected !== undefined && expected === answer;
  }
  if (kind === "subject") {
    const item = SUBJECT_ITEMS.find((i) => i.id === id);
    return item ? item.correct === answer : null;
  }
  return null;
}

export {
  ACTIVE_CONTEXTS,
  PASSIVE_CONTEXTS,
  SHORT_CONTEXTS,
  GERUND_CONTEXTS,
  SUBJECT_ITEMS,
  agree,
  PARTICIPLE_VERBS,
};
export type { ParticipleVerb };
