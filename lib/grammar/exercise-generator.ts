import { CaseId, Noun } from "./types";
import { NOUNS } from "./nouns-data";
import { RUSSIAN_NAMES } from "./names-data";
import { declineNoun } from "./decline";
import {
  CaseTrigger,
  PROPER_NOUN_TRIGGER_ID,
  resolveNumber,
  triggersForCase,
} from "./triggers";
import { CASES } from "./cases";
import { CountForm, countFormFor, randomCountNumber } from "./numerals";
import { fillFrenchBlank, frenchNounPhrase } from "./french-article";
import {
  categoryOf,
  countableNouns,
  pluralisableNouns,
  type NounCategory,
} from "./noun-categories";
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

/**
 * Vivier minimal servi à un déclencheur, quel que soit le niveau.
 *
 * CE QUE CE NOMBRE REMPLACE. Le repli ne se déclenchait que sur un vivier
 * VIDE, et sautait alors d'un coup à la banque entière. Deux conséquences.
 * Un vivier d'un seul mot était considéré comme sain : « Я рабо́таю на ___ »
 * ne trouvait que « компью́тер » au niveau A1, et rendait la même phrase au
 * caractère près, indéfiniment. Et le niveau s'inversait — « Дай мне кусо́к
 * ___ » donnait 16 mots à A0 (vivier vide, donc toute la liste curée) contre
 * 2 à A1 (deux mots, donc pas de repli) : un débutant voyait plus de variété
 * qu'un A1.
 *
 * On élargit donc dès qu'on passe SOUS ce seuil, et par ordre de fréquence
 * plutôt que d'un bond : l'élargissement d'un niveau est toujours contenu
 * dans celui du niveau inférieur, l'inversion ne peut pas revenir.
 *
 * Douze : de quoi ne pas reconnaître la phrase d'un exercice à l'autre sur
 * une série de cinquante (voir scripts/check-variety.mjs), sans forcer la
 * curation de listes que la langue ne peut pas remplir — la banque ne
 * contient que six boissons, « un verre de ___ » n'ira pas au-delà.
 */
const MIN_POOL = 12;

/** Banque triée du plus courant au plus rare : l'ordre dans lequel on élargit. */
const BY_FREQUENCY = [...NOUNS].sort((a, b) => a.rank - b.rank);

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
  /**
   * Seconde forme que le dictionnaire donne pour cette case, s'il y en a
   * une. Acceptée comme réponse, et annoncée quand l'apprenant la trouve.
   */
  variantForm?: string;
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
 * Le pool passé est réduit par niveau (un débutant ne voit que les mots
 * fréquents), et ce croisement peut ne presque rien laisser : voir
 * `MIN_POOL` pour ce qu'on fait alors.
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
  if (filtered.length >= MIN_POOL) return filtered;

  // Vivier trop maigre : on le complète par les mots ADMIS les plus
  // fréquents, ceux que le niveau écartait. Jamais au-delà de ce que le
  // déclencheur admet — « Я ем ___ » ne reçoit pas « дом » parce qu'il
  // manquait des aliments.
  const chosen = new Set(filtered.map((n) => n.id));
  const widened = [...filtered];
  for (const noun of BY_FREQUENCY) {
    if (widened.length >= MIN_POOL) break;
    if (chosen.has(noun.id) || !keep(noun)) continue;
    widened.push(noun);
    chosen.add(noun.id);
  }
  return widened.length > 0 ? widened : pool;
}

// ─── Déclinaison isolée ────────────────────────────────────────────
export function generateIsolatedExercise(
  targetCase: CaseId,
  plural = false,
  pool: Noun[] = DECLINABLE_NOUNS
): CaseExercise {
  // Le nominatif SINGULIER est la forme du dictionnaire : rien à décliner,
  // on ferait retaper le mot affiché. Le pluriel etait donc force ici — ce
  // qui réglait ce cas et en créait deux autres : le nominatif singulier
  // devenait intestable, et « ри́сы », « шокола́ды », « мяса́ » étaient
  // demandés parce que le forçage ignorait la dénombrabilité.
  //
  // Le nombre vient maintenant du sélecteur, et le nominatif singulier est
  // simplement écarté du tirage : c'est la seule case des douze qui
  // n'apprend rien.
  const effectivePlural = targetCase === "nominative" ? true : plural;
  const usable = effectivePlural ? pluralisableNouns(pool) : pool;
  const noun = pickRandom(usable);
  const result = declineNoun(noun, targetCase, effectivePlural);
  return {
    kind: "isolated",
    noun,
    targetCase,
    plural: effectivePlural,
    correctForm: result.form,
    accentedForm: result.accented,
    variantForm: result.variant,
    ruleApplied: result.ruleApplied,
  };
}

// ─── Phrase à trou (gabarit fixe, par déclencheur) ─────────────────
export function generateSentenceExercise(
  targetCase: CaseId,
  trigger?: CaseTrigger,
  pool: Noun[] = DECLINABLE_NOUNS,
  wantPlural = false
): CaseExercise {
  const chosenTrigger = trigger ?? pickRandom(triggersForCase(targetCase));
  // La contrainte du gabarit l'emporte sur le souhait de l'apprenant :
  // « несколько ___ » reste au pluriel, « Меня зовут ___ » au singulier.
  const plural = resolveNumber(chosenTrigger, wantPlural);
  const candidates = poolFor(chosenTrigger, pool);
  const noun = pickRandom(plural ? pluralisableNouns(candidates) : candidates);
  const result = declineNoun(noun, targetCase, plural);

  return {
    kind: "sentence-fixed",
    noun,
    targetCase,
    plural,
    correctForm: result.form,
    accentedForm: result.accented,
    variantForm: result.variant,
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
  pool: Noun[] = DECLINABLE_NOUNS,
  wantPlural = false
): CaseExercise {
  const base = generateSentenceExercise(targetCase, trigger, pool, wantPlural);
  const otherCases = CASES.map((c) => c.id).filter((id) => id !== targetCase);

  // La déduplication se fait sur la forme NORMALISÉE, celle qui sert à
  // corriger. Comparer les chaînes brutes laissait passer deux boutons que
  // le serveur aurait tous deux comptés justes — « судьёй » et « судьей »
  // sont la même réponse pour `normalizeAnswer`, pas pour `Set<string>`.
  const taken = new Set([normalizeAnswer(base.correctForm)]);
  const distractors: string[] = [];
  const offer = (form: string): boolean => {
    const key = normalizeAnswer(form);
    if (taken.has(key)) return false;
    taken.add(key);
    distractors.push(form);
    return true;
  };

  for (const c of shuffle(otherCases)) {
    if (distractors.length >= 3) break;
    offer(declineNoun(base.noun, c, base.plural).form);
  }

  // Filet de sécurité quand le nom a trop de formes identiques
  // (syncrétisme) : on complète avec un AUTRE nom, décliné au même cas.
  //
  // Il tire dans le vivier du déclencheur, pas dans le pool brut : « Я ем
  // ___ » propose des aliments, et ses distracteurs aussi. Et il balaie le
  // vivier au lieu d'y piocher dix fois au hasard — l'ancienne boucle
  // pouvait abandonner et rendre un QCM à deux ou trois boutons, sans que
  // rien ne le signale.
  if (distractors.length < 3) {
    for (const other of shuffle(poolFor(base.trigger!, pool))) {
      if (distractors.length >= 3) break;
      if (other.id === base.noun.id) continue;
      offer(declineNoun(other, targetCase, base.plural).form);
    }
  }
  // Dernier recours : la banque entière. Elle contient 451 noms, donc trois
  // formes distinctes s'y trouvent toujours.
  if (distractors.length < 3) {
    for (const other of shuffle(DECLINABLE_NOUNS)) {
      if (distractors.length >= 3) break;
      if (other.id === base.noun.id) continue;
      offer(declineNoun(other, targetCase, base.plural).form);
    }
  }

  const options = shuffle([base.correctForm, ...distractors.slice(0, 3)]);
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
    variantForm: result.variant,
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

/**
 * Toutes les réponses acceptables : la forme du paradigme, et la variante
 * du dictionnaire quand il en donne une.
 *
 * Un seul endroit les énumère, et le client comme le serveur l'appellent —
 * c'est ce qui garantit qu'un écran disant « juste » et une base disant
 * « faux » ne peuvent pas coexister.
 */
export function acceptableForms(exercise: {
  correctForm: string;
  variantForm?: string;
}): string[] {
  return exercise.variantForm ? [exercise.correctForm, exercise.variantForm] : [exercise.correctForm];
}

export function checkAnswer(exercise: CaseExercise, userInput: string): boolean {
  const given = normalizeAnswer(userInput);
  return acceptableForms(exercise).some((form) => normalizeAnswer(form) === given);
}

/**
 * L'apprenant a-t-il répondu par la VARIANTE plutôt que par la forme
 * principale ? C'est ce qui déclenche le « Juste aussi : … ».
 */
export function answeredWithVariant(exercise: CaseExercise, userInput: string): boolean {
  if (!exercise.variantForm) return false;
  const given = normalizeAnswer(userInput);
  return (
    given === normalizeAnswer(exercise.variantForm) &&
    given !== normalizeAnswer(exercise.correctForm)
  );
}
