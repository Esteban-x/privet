import { CefrLevel } from "@/lib/supabase/types";
import {
  LEVEL_QUESTIONS,
  LevelQuestion,
  MAX_TIER,
  MIN_TIER,
  levelForTier,
  getQuestion,
  questionsForTier,
} from "./questions";

/**
 * Moteur du test de placement — blocs par niveau + encadrement.
 *
 * POURQUOI PAS UN ESCALIER ITEM PAR ITEM. La version précédente montait
 * d'un palier à chaque bonne réponse, descendait à chaque erreur, et
 * retenait « le plus haut palier réussi parmi les 4 dernières questions ».
 * Une seule bonne réponse au palier C1, même entourée d'échecs, suffisait
 * donc à décrocher C1. Mesuré par simulation : un vrai A2 était classé B1
 * ou plus dans 58 % des cas, et un vrai B2 obtenait C1 plus souvent que B2.
 *
 * CE QUE FONT LES VRAIS TESTS. Un niveau ne se « touche » pas, il se
 * VALIDE : le ТРКИ demande 66 % de réussite à un sous-test pour délivrer le
 * niveau correspondant, et les tests de placement administrent des séries
 * d'items calibrés au même niveau avant de conclure. On reprend ce principe :
 *
 *  1. on administre un BLOC de 4 items d'un même niveau ;
 *  2. le niveau est validé si au moins 3 sur 4 sont justes (75 %, très
 *     au-dessus des 25 % du hasard sur 4 options) ;
 *  3. validé → on monte, échoué → on descend, jusqu'à encadrer le niveau
 *     réel entre le plus haut validé et le plus bas échoué ;
 *  4. le résultat est le plus haut niveau VALIDÉ, jamais un item isolé.
 *
 * L'encadrement se fait par dichotomie : 3 blocs (12 items) suffisent à
 * trancher entre les 5 paliers, soit le même budget de questions qu'avant.
 */

export const BLOCK_SIZE = 4;
/** 3 bonnes réponses sur 4. Le hasard pur en donnerait 1 (4 options). */
export const MASTERY_RATIO = 0.75;
/** On commence à A2 : assez bas pour ne pas décourager, assez haut pour
 *  qu'un faux débutant n'ait pas à subir douze questions triviales. */
export const START_TIER = 2;
/** Suffit à encadrer 5 paliers par dichotomie. */
export const MAX_BLOCKS = 3;
/** En dessous, un palier n'a pas été assez sondé pour être validé. */
const MIN_ITEMS_TO_VALIDATE = 3;

export interface TestAnswer {
  questionId: string;
  selectedIndex: number;
}

export interface TestRun {
  /** Palier du bloc en cours. */
  tier: number;
  /** Plus haut palier validé (0 = aucun → A0). */
  floor: number;
  /** Plus bas palier échoué (MAX_TIER + 1 = aucun encore). */
  ceiling: number;
  blocksDone: number;
  /** Ids restants à poser dans le bloc courant. */
  queue: string[];
  askedIds: string[];
  answers: TestAnswer[];
  finished: boolean;
}

type Rng = () => number;

function shuffle<T>(items: T[], random: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Compose un bloc pour un palier : tirage aléatoire (deux passations ne se
 * ressemblent pas) mais en garantissant au moins un item de chaque
 * compétence quand le palier en propose — un bloc entièrement lexical ne
 * dirait rien de la grammaire, et inversement.
 */
function buildBlock(tier: number, askedIds: string[], random: Rng): string[] {
  const asked = new Set(askedIds);
  const pool = shuffle(
    questionsForTier(tier).filter((q) => !asked.has(q.id)),
    random
  );
  if (pool.length <= BLOCK_SIZE) return pool.map((q) => q.id);

  const picked: LevelQuestion[] = [];
  for (const skill of ["grammaire", "lexique"] as const) {
    const first = pool.find((q) => q.skill === skill && !picked.includes(q));
    if (first) picked.push(first);
  }
  for (const q of pool) {
    if (picked.length >= BLOCK_SIZE) break;
    if (!picked.includes(q)) picked.push(q);
  }
  return shuffle(picked, random).map((q) => q.id);
}

export function startRun(random: Rng = Math.random): TestRun {
  return {
    tier: START_TIER,
    floor: 0,
    ceiling: MAX_TIER + 1,
    blocksDone: 0,
    queue: buildBlock(START_TIER, [], random),
    askedIds: [],
    answers: [],
    finished: false,
  };
}

export function currentQuestion(run: TestRun): LevelQuestion | null {
  const id = run.queue[0];
  return id ? (getQuestion(id) ?? null) : null;
}

/**
 * Choisit le palier du bloc suivant à l'intérieur de l'encadrement courant.
 * Milieu de l'intervalle ouvert ]floor, ceiling[ : c'est ce qui permet de
 * trancher 5 paliers en 3 blocs. `null` = encadrement fermé, test terminé.
 */
function nextTier(floor: number, ceiling: number): number | null {
  const low = Math.max(floor + 1, MIN_TIER);
  const high = Math.min(ceiling - 1, MAX_TIER);
  if (low > high) return null;
  return Math.floor((low + high) / 2);
}

/** Enregistre une réponse et fait avancer la passation. */
export function answerCurrent(run: TestRun, selectedIndex: number, random: Rng = Math.random): TestRun {
  const question = currentQuestion(run);
  if (!question || run.finished) return run;

  const answers = [...run.answers, { questionId: question.id, selectedIndex }];
  const askedIds = [...run.askedIds, question.id];
  const queue = run.queue.slice(1);

  // Bloc en cours : on continue simplement.
  if (queue.length > 0) {
    return { ...run, answers, askedIds, queue };
  }

  // Bloc terminé : on juge le palier.
  const blockIds = new Set(
    askedIds.slice(askedIds.length - BLOCK_SIZE < 0 ? 0 : askedIds.length - BLOCK_SIZE)
  );
  const blockAnswers = answers.filter((a) => blockIds.has(a.questionId));
  const correct = blockAnswers.filter((a) => {
    const q = getQuestion(a.questionId);
    return q && q.correctIndex === a.selectedIndex;
  }).length;
  const mastered = correct / blockAnswers.length >= MASTERY_RATIO;

  const floor = mastered ? Math.max(run.floor, run.tier) : run.floor;
  const ceiling = mastered ? run.ceiling : Math.min(run.ceiling, run.tier);
  const blocksDone = run.blocksDone + 1;

  const following = blocksDone >= MAX_BLOCKS ? null : nextTier(floor, ceiling);
  if (following === null) {
    return { ...run, answers, askedIds, queue: [], floor, ceiling, blocksDone, finished: true };
  }

  return {
    ...run,
    answers,
    askedIds,
    floor,
    ceiling,
    blocksDone,
    tier: following,
    queue: buildBlock(following, askedIds, random),
  };
}

export interface TierScore {
  tier: number;
  level: CefrLevel;
  asked: number;
  correct: number;
  validated: boolean;
}

export interface TestResult {
  level: CefrLevel;
  score: number;
  total: number;
  tiers: TierScore[];
}

/**
 * Calcule le résultat à partir des seules réponses — donc rejouable à
 * l'identique côté serveur, sans faire confiance à l'état du client.
 *
 * Un palier est validé s'il a été suffisamment sondé ET réussi à
 * MASTERY_RATIO. Le niveau retenu est le sommet de la CHAÎNE de paliers
 * validés : on remonte les paliers administrés dans l'ordre et on s'arrête
 * au premier échec. Un client qui n'enverrait que des réponses justes de
 * palier 5 ne décroche donc rien — il n'a validé aucun palier en dessous.
 */
export function evaluateAnswers(answers: TestAnswer[]): TestResult {
  const byTier = new Map<number, { asked: number; correct: number }>();
  let score = 0;
  let total = 0;

  for (const a of answers) {
    const q = getQuestion(a.questionId);
    if (!q) continue; // id inconnu : ignoré plutôt que compté
    const entry = byTier.get(q.tier) ?? { asked: 0, correct: 0 };
    entry.asked += 1;
    total += 1;
    if (q.correctIndex === a.selectedIndex) {
      entry.correct += 1;
      score += 1;
    }
    byTier.set(q.tier, entry);
  }

  const tiers: TierScore[] = [...byTier.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([tier, s]) => ({
      tier,
      level: levelForTier(tier),
      asked: s.asked,
      correct: s.correct,
      validated: s.asked >= MIN_ITEMS_TO_VALIDATE && s.correct / s.asked >= MASTERY_RATIO,
    }));

  let reached = 0;
  for (const t of tiers) {
    if (!t.validated) break;
    reached = t.tier;
  }

  return { level: levelForTier(reached), score, total, tiers };
}

export function runResult(run: TestRun): TestResult {
  return evaluateAnswers(run.answers);
}

/** Progression affichée : bloc courant et position dans le bloc. */
export function runProgress(run: TestRun) {
  const inBlock = BLOCK_SIZE - run.queue.length;
  return {
    block: Math.min(run.blocksDone + 1, MAX_BLOCKS),
    maxBlocks: MAX_BLOCKS,
    questionInBlock: Math.min(inBlock + 1, BLOCK_SIZE),
    blockSize: BLOCK_SIZE,
    answered: run.answers.length,
  };
}

/** Nombre total d'items du vivier, pour les contrôles de cohérence. */
export const QUESTION_COUNT = LEVEL_QUESTIONS.length;
