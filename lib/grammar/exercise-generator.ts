import { Adjective, Animacy, CaseId, Noun } from "./types";
import { NOUNS } from "./nouns-data";
import { ADJECTIVES } from "./adjectives-data";
import { RUSSIAN_NAMES } from "./names-data";
import { declineNoun } from "./decline";
import { declineAdjective } from "./decline-adjective";
import { CaseTrigger, PROPER_NOUN_TRIGGER_ID, triggersForCase } from "./triggers";
import { CASES } from "./cases";
import { CountForm, countFormFor, randomCountNumber } from "./numerals";
import { fillFrenchBlank, frenchNounPhrase } from "./french-article";

function poolFor(pool: Noun[], trigger: CaseTrigger): Noun[] {
  return trigger.id === PROPER_NOUN_TRIGGER_ID ? RUSSIAN_NAMES : pool;
}

export type ExerciseKind =
  | "isolated"
  | "sentence-fixed"
  | "sentence-ai"
  | "trigger-mcq"
  | "numeral"
  | "adjective-agreement";

export interface CaseExercise {
  kind: ExerciseKind;
  noun: Noun;
  targetCase: CaseId;
  plural: boolean;
  correctForm: string;
  ruleApplied: string;

  // sentence-fixed / sentence-ai / trigger-mcq
  trigger?: CaseTrigger;
  sentenceTemplate?: string;
  sentenceFr?: string;
  hint?: string;

  // trigger-mcq
  options?: string[];

  // numeral
  numeral?: number;
  countForm?: CountForm;

  // adjective-agreement
  adjective?: Adjective;
  adjectiveForm?: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const DECLINABLE_NOUNS = NOUNS.filter((n) => !n.indeclinable);

// ─── Déclinaison isolée ────────────────────────────────────────────
export function generateIsolatedExercise(
  targetCase: CaseId,
  pool: Noun[] = DECLINABLE_NOUNS,
  plural = false
): CaseExercise {
  // Le nominatif singulier EST la forme du dictionnaire : rien à décliner.
  // On force donc le pluriel pour tester une vraie transformation
  // (книга -> книги) plutôt que de faire retaper le mot affiché.
  const effectivePlural = targetCase === "nominative" ? true : plural;
  const noun = pickRandom(pool.length ? pool : DECLINABLE_NOUNS);
  const result = declineNoun(noun, targetCase, effectivePlural);
  return {
    kind: "isolated",
    noun,
    targetCase,
    plural: effectivePlural,
    correctForm: result.form,
    ruleApplied: result.ruleApplied,
  };
}

// ─── Phrase à trou (gabarit fixe, par déclencheur) ─────────────────
export function generateSentenceExercise(
  targetCase: CaseId,
  pool: Noun[] = DECLINABLE_NOUNS,
  trigger?: CaseTrigger
): CaseExercise {
  const chosenTrigger = trigger ?? pickRandom(triggersForCase(targetCase));
  const effectivePool = poolFor(pool, chosenTrigger);
  const noun = pickRandom(effectivePool.length ? effectivePool : DECLINABLE_NOUNS);
  const plural = chosenTrigger.plural ?? false;
  const result = declineNoun(noun, targetCase, plural);

  return {
    kind: "sentence-fixed",
    noun,
    targetCase,
    plural,
    correctForm: result.form,
    ruleApplied: result.ruleApplied,
    trigger: chosenTrigger,
    sentenceTemplate: chosenTrigger.template.ru,
    sentenceFr: fillFrenchBlank(
      chosenTrigger.template.fr,
      frenchNounPhrase(noun.translation, noun.frenchGender, chosenTrigger.article, plural)
    ),
  };
}

// ─── QCM de reconnaissance de déclencheur ──────────────────────────
export function generateMcqExercise(
  targetCase: CaseId,
  pool: Noun[] = DECLINABLE_NOUNS,
  trigger?: CaseTrigger
): CaseExercise {
  const base = generateSentenceExercise(targetCase, pool, trigger);
  const otherCases = CASES.map((c) => c.id).filter((id) => id !== targetCase);

  const distractors = new Set<string>();
  for (const c of shuffle(otherCases)) {
    if (distractors.size >= 3) break;
    const form = declineNoun(base.noun, c, base.plural).form;
    if (form !== base.correctForm) distractors.add(form);
  }
  // Filet de sécurité si le nom a trop de formes identiques (syncrétisme) :
  // complète avec un autre nom du pool décliné au même cas.
  let guard = 0;
  while (distractors.size < 3 && guard < 10) {
    guard += 1;
    const otherNoun = pickRandom(pool.length ? pool : DECLINABLE_NOUNS);
    if (otherNoun.id === base.noun.id) continue;
    const form = declineNoun(otherNoun, targetCase, base.plural).form;
    if (form !== base.correctForm) distractors.add(form);
  }

  const options = shuffle([base.correctForm, ...Array.from(distractors).slice(0, 3)]);
  return { ...base, kind: "trigger-mcq", options };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Accord nom + chiffre cardinal ─────────────────────────────────
export function generateNumeralExercise(pool: Noun[] = DECLINABLE_NOUNS): CaseExercise {
  const numeral = randomCountNumber();
  const countForm = countFormFor(numeral);
  const noun = pickRandom(pool.length ? pool : DECLINABLE_NOUNS);

  const targetCase: CaseId = countForm === "nom-sg" ? "nominative" : "genitive";
  const plural = countForm === "gen-pl";
  const result = declineNoun(noun, targetCase, plural);

  return {
    kind: "numeral",
    noun,
    targetCase,
    plural,
    correctForm: result.form,
    ruleApplied: result.ruleApplied,
    numeral,
    countForm,
  };
}

// ─── Accord adjectif + nom ──────────────────────────────────────────
export function generateAdjectiveExercise(
  targetCase: CaseId,
  nounPool: Noun[] = DECLINABLE_NOUNS,
  adjPool: Adjective[] = ADJECTIVES,
  trigger?: CaseTrigger
): CaseExercise {
  const chosenTrigger = trigger ?? pickRandom(triggersForCase(targetCase));
  const effectivePool = poolFor(nounPool, chosenTrigger);
  const noun = pickRandom(effectivePool.length ? effectivePool : DECLINABLE_NOUNS);
  const adjective = pickRandom(adjPool);
  const plural = chosenTrigger.plural ?? false;

  const nounResult = declineNoun(noun, targetCase, plural);
  const animacy: Animacy = noun.animacy;
  const adjResult = declineAdjective(adjective, targetCase, noun.gender, plural, animacy);

  return {
    kind: "adjective-agreement",
    noun,
    targetCase,
    plural,
    correctForm: `${adjResult.form} ${nounResult.form}`,
    ruleApplied: `${adjResult.ruleApplied} ; ${nounResult.ruleApplied}`,
    trigger: chosenTrigger,
    sentenceTemplate: chosenTrigger.template.ru,
    // Seul le nom est inséré dans la phrase française (comme pour une phrase
    // normale) — concaténer aussi la traduction de l'adjectif produisait du
    // charabia (ex. "vif, éclatant bâtiment") : l'ordre des mots et l'accord
    // en français ne sont pas les mêmes qu'en russe, et certaines
    // traductions d'adjectifs sont des listes ("vif, éclatant"). L'adjectif
    // est déjà révélé séparément (voir `adjective` ci-dessous, affiché par
    // CaseDeclension juste sous la phrase).
    sentenceFr: fillFrenchBlank(
      chosenTrigger.template.fr,
      frenchNounPhrase(noun.translation, noun.frenchGender, chosenTrigger.article, plural)
    ),
    adjective,
    adjectiveForm: adjResult.form,
  };
}

export function normalizeAnswer(str: string): string {
  return str.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
}

export function checkAnswer(exercise: CaseExercise, userInput: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(exercise.correctForm);
}

// Compat : conservé pour les appels existants (isolé / phrase figée simple).
export function generateExercise(
  targetCase: CaseId,
  mode: "isolated" | "sentence" = "isolated",
  plural = false
): CaseExercise {
  return mode === "isolated"
    ? generateIsolatedExercise(targetCase, DECLINABLE_NOUNS, plural)
    : generateSentenceExercise(targetCase, DECLINABLE_NOUNS);
}
