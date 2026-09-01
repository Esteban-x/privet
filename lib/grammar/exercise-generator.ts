import { CaseId, Noun } from "./types";
import { NOUNS } from "./nouns-data";
import { RUSSIAN_NAMES } from "./names-data";
import { declineNoun } from "./decline";
import { CaseTrigger, PROPER_NOUN_TRIGGER_ID, triggersForCase } from "./triggers";
import { CASES } from "./cases";
import { CountForm, countFormFor, randomCountNumber } from "./numerals";
import { fillFrenchBlank, frenchNounPhrase } from "./french-article";
import { categoryOf, countableNouns, type NounCategory } from "./noun-categories";
import { TRIGGER_NOUNS } from "./trigger-nouns.generated";

// Pool unique de tous les exercices : la banque importée, dont chaque forme
// vient du dictionnaire (voir scripts/build-nouns.mjs). Le vocabulaire perso
// de l'apprenant n'y entre PAS — un mot ajouté à la volée n'a ni paradigme
// vérifié, ni irrégularités connues (стул -> стулья, человек -> люди), ni
// schéma accentuel : le moteur en inventerait une déclinaison plausible mais
// fausse, présentée comme la bonne réponse.
//
// Les emprunts indéclinables (кофе, метро) sont écartés à l'import : la
// banque ne contient que des mots qui se déclinent réellement.
export const DECLINABLE_NOUNS = NOUNS;

export type ExerciseKind =
  | "isolated"
  | "sentence-fixed"
  | "sentence-ai"
  | "trigger-mcq"
  | "numeral";

export interface CaseExercise {
  kind: ExerciseKind;
  noun: Noun;
  // Cas réellement demandé par l'exercice. Presque toujours celui de la
  // page, SAUF pour les chiffres : "21 + стол" appelle un nominatif alors
  // que l'onglet vit sur la page du génitif (voir generateNumeralExercise).
  // C'est ce champ, jamais l'id de la page, qui doit servir à vérifier la
  // réponse.
  targetCase: CaseId;
  plural: boolean;
  correctForm: string;
  /** Même forme avec l'accent tonique, pour l'affichage de la réponse. */
  accentedForm: string;
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
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// "Меня зовут ___" n'a de sens qu'avec un prénom : ce déclencheur tire dans
// la banque de prénoms, pas dans celle des noms communs.
/**
 * Noms utilisables avec ce déclencheur — ce qui empêche « Я ем ___ » de
 * recevoir « помо́щник », « je mange cet assistant ».
 *
 * Trois sources, de la plus précise à la plus grossière :
 *
 * 1. « Меня́ зову́т ___ » ne prend qu'un prénom.
 * 2. La LISTE CURÉE (trigger-nouns.generated.ts) : pour chaque déclencheur
 *    exigeant, les mots qui donnent une phrase qu'un russophone dirait
 *    vraiment. Écrite une fois par l'IA, relue, figée — l'exécution reste
 *    déterministe et gratuite. C'est la source normale.
 * 3. Les CLASSES sémantiques (`accepts`), en repli : elles couvrent un
 *    déclencheur ajouté depuis la dernière curation, qui produirait sinon
 *    n'importe quoi en silence.
 *
 * Le pool passé peut être réduit par niveau (un débutant ne voit que les
 * mots fréquents) et ne rien contenir d'utilisable : on élargit alors à la
 * banque entière avant de renoncer. Un mot plus rare vaut mieux qu'une
 * phrase que personne ne dirait.
 *
 * Exporté : la route IA (app/api/ai/exercise/route.ts) doit composer son
 * échantillon avec EXACTEMENT ce filtre. Elle tirait auparavant 40 mots au
 * hasard dans toute la banque du niveau, ce qui court-circuitait la
 * curation : « владеть » (maîtriser) recevait « рот » (bouche) faute d'un
 * seul mot valide dans l'échantillon.
 */
export function poolFor(trigger: CaseTrigger, pool: Noun[]): Noun[] {
  if (trigger.id === PROPER_NOUN_TRIGGER_ID) return RUSSIAN_NAMES;

  const curated = TRIGGER_NOUNS[trigger.id];
  let keep: (n: Noun) => boolean;
  if (curated && curated.length > 0) {
    const allowed = new Set(curated);
    keep = (n) => allowed.has(n.id);
  } else if (trigger.accepts) {
    const accepted = new Set<NounCategory>(trigger.accepts);
    keep = (n) => {
      const category = categoryOf(n.id);
      return category !== undefined && accepted.has(category);
    };
  } else {
    return pool;
  }

  const filtered = pool.filter(keep);
  if (filtered.length > 0) return filtered;

  const widened = DECLINABLE_NOUNS.filter(keep);
  return widened.length > 0 ? widened : pool;
}

// ─── Déclinaison isolée ────────────────────────────────────────────
export function generateIsolatedExercise(
  targetCase: CaseId,
  plural = false,
  pool: Noun[] = DECLINABLE_NOUNS
): CaseExercise {
  // Le nominatif singulier EST la forme du dictionnaire : rien à décliner.
  // On force donc le pluriel pour tester une vraie transformation
  // (книга -> книги) plutôt que de faire retaper le mot affiché.
  const effectivePlural = targetCase === "nominative" ? true : plural;
  const noun = pickRandom(pool);
  const result = declineNoun(noun, targetCase, effectivePlural);
  return {
    kind: "isolated",
    noun,
    targetCase,
    plural: effectivePlural,
    correctForm: result.form,
    accentedForm: result.accented,
    ruleApplied: result.ruleApplied,
  };
}

// ─── Phrase à trou (gabarit fixe, par déclencheur) ─────────────────
export function generateSentenceExercise(
  targetCase: CaseId,
  trigger?: CaseTrigger,
  pool: Noun[] = DECLINABLE_NOUNS
): CaseExercise {
  const chosenTrigger = trigger ?? pickRandom(triggersForCase(targetCase));
  const noun = pickRandom(poolFor(chosenTrigger, pool));
  const plural = chosenTrigger.plural ?? false;
  const result = declineNoun(noun, targetCase, plural);

  return {
    kind: "sentence-fixed",
    noun,
    targetCase,
    plural,
    correctForm: result.form,
    accentedForm: result.accented,
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
  trigger?: CaseTrigger,
  pool: Noun[] = DECLINABLE_NOUNS
): CaseExercise {
  const base = generateSentenceExercise(targetCase, trigger, pool);
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
    const otherNoun = pickRandom(pool);
    if (otherNoun.id === base.noun.id) continue;
    const form = declineNoun(otherNoun, targetCase, base.plural).form;
    if (form !== base.correctForm) distractors.add(form);
  }

  const options = shuffle([base.correctForm, ...Array.from(distractors).slice(0, 3)]);
  return { ...base, kind: "trigger-mcq", options };
}

// ─── Accord nom + chiffre cardinal ─────────────────────────────────
export function generateNumeralExercise(pool: Noun[] = DECLINABLE_NOUNS): CaseExercise {
  const numeral = randomCountNumber();
  const countForm = countFormFor(numeral);
  // Seulement des noms qu'on compte : « 10 + нача́ло » (dix débuts) était
  // grammaticalement juste et sans aucun sens. Voir countableNouns.
  const noun = pickRandom(countableNouns(pool));

  // Un nombre en 1 (1, 21, 31…) laisse le nom au NOMINATIF singulier, même
  // si l'onglet vit sur la page du génitif — d'où `targetCase` porté par
  // l'exercice plutôt que déduit de la page.
  const targetCase: CaseId = countForm === "nom-sg" ? "nominative" : "genitive";
  const plural = countForm === "gen-pl";
  const result = declineNoun(noun, targetCase, plural);

  return {
    kind: "numeral",
    noun,
    targetCase,
    plural,
    correctForm: result.form,
    accentedForm: result.accented,
    ruleApplied: result.ruleApplied,
    numeral,
    countForm,
  };
}

// Résolution d'un id d'exercice vers son Noun : banque curée + banque de
// prénoms (déclencheur "Меня зовут ___"). Utilisée côté serveur pour
// recalculer la forme attendue sans faire confiance au client
// (app/api/cases/attempt/route.ts).
export function resolveExerciseNoun(id: string): Noun | undefined {
  return NOUNS.find((n) => n.id === id) ?? RUSSIAN_NAMES.find((n) => n.id === id);
}

/**
 * Normalisation avant comparaison : casse, espaces, ё/е, et accent tonique.
 * L'accent est affiché à l'apprenant (пра́вда) mais jamais exigé de lui —
 * personne ne le tape, et le copier-coller d'une forme accentuée doit
 * évidemment être accepté.
 */
export function normalizeAnswer(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/́/g, "")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ");
}

export function checkAnswer(exercise: CaseExercise, userInput: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(exercise.correctForm);
}
