import type { CefrLevel } from "@/lib/supabase/types";
import type { CaseNumberMode } from "@/lib/storage";
import { pickFresh } from "@/lib/practice/recent";
import { CaseId, Noun } from "./types";
import {
  CaseExercise,
  generateIsolatedExercise,
  generateMcqExercise,
  generateNumeralExercise,
  generateSentenceExercise,
} from "./exercise-generator";
import { resolveNumber, triggerAllows, triggersForCase } from "./triggers";
import { pickWeightedTrigger, type TriggerProgressMap } from "./exercise-selector";

/**
 * Le tirage du module Cas, hors composant.
 *
 * POURQUOI PAS DANS CaseDeclension.tsx, D'OÙ IL VIENT. Le contrôle de
 * variété (scripts/check-variety.mjs) doit rejouer une vraie session : s'il
 * recopiait le tirage, il vérifierait sa propre copie, et resterait vert le
 * jour où l'écran ferait autre chose. Le composant garde ce qui le regarde
 * — l'état, l'appel réseau, l'affichage.
 */

export type CaseTab = "isolated" | "sentence" | "mcq" | "numeral";

/** La mémoire courte est tenue par onglet : un mot vu « isolé » n'est pas une phrase vue. */
export function caseRecentKey(caseId: CaseId, tab: CaseTab): string {
  return `cases:${caseId}:${tab}`;
}

/**
 * Ce qui identifie un exercice pour la mémoire courte, du plus précis au
 * plus grossier (voir lib/practice/recent.ts).
 *
 * Le mot et le déclencheur comptent séparément, et pas seulement le couple :
 * reprendre le déclencheur de l'exercice précédent avec un autre mot, c'est
 * déjà remontrer la même phrase — il n'y en a qu'une par déclencheur.
 */
export function caseExerciseIds(exercise: CaseExercise): string[] {
  const context = exercise.trigger?.id ?? exercise.countForm ?? "seul";
  const ids = [
    `${context}:${exercise.noun.id}:${exercise.plural ? "pl" : "sg"}`,
    `noun:${exercise.noun.id}`,
  ];
  if (exercise.trigger) ids.push(`trigger:${exercise.trigger.id}`);
  return ids;
}

export interface CaseDrawOptions {
  tab: CaseTab;
  caseId: CaseId;
  /** Progression serveur par déclencheur : ce qui est mal réussi revient plus souvent. */
  triggerStats: TriggerProgressMap;
  level?: CefrLevel;
  pool: Noun[];
  numberMode: CaseNumberMode;
}

/**
 * Un candidat, tiré sans mémoire : le tirage historique, inchangé (part du
 * palier selon le niveau, priorité aux déclencheurs les moins réussis).
 * `pickCaseExercise` en demande plusieurs et garde le moins récent.
 */
export function drawCaseCandidate({
  tab,
  caseId,
  triggerStats,
  level,
  pool,
  numberMode,
}: CaseDrawOptions): CaseExercise {
  // « Mélange » tire à chaque exercice, pas une fois pour la session : le
  // contraste ne s'apprend qu'en alternant.
  const wantPlural = numberMode === "plural" || (numberMode === "mixed" && Math.random() < 0.5);

  if (tab === "isolated") return generateIsolatedExercise(caseId, wantPlural, pool);
  if (tab === "numeral") return generateNumeralExercise(pool);

  // Le nombre demandé restreint le tirage aux gabarits qui l'acceptent. En
  // « Mélange » on ne restreint rien : chaque gabarit servira le nombre
  // qu'il supporte, ce qui vaut mieux que d'écarter la moitié de la banque.
  const eligible = triggersForCase(caseId).filter(
    (t) => numberMode === "mixed" || triggerAllows(t, wantPlural),
  );
  const trigger = pickWeightedTrigger(
    eligible.length > 0 ? eligible : triggersForCase(caseId),
    triggerStats,
    level,
  );
  const plural = resolveNumber(trigger, wantPlural);

  if (tab === "mcq") return generateMcqExercise(caseId, trigger, pool, plural);
  return generateSentenceExercise(caseId, trigger, pool, plural);
}

/**
 * Le tirage tel que l'apprenant le reçoit : plusieurs candidats, celui vu le
 * moins récemment l'emporte.
 *
 * Ne mémorise PAS : sur l'onglet « Phrase », le mot finalement montré peut
 * encore venir d'une phrase rédigée à la volée. C'est l'appelant qui
 * enregistre, une fois l'exercice arrêté.
 */
export function pickCaseExercise(options: CaseDrawOptions): CaseExercise {
  return pickFresh(
    caseRecentKey(options.caseId, options.tab),
    () => drawCaseCandidate(options),
    caseExerciseIds,
  );
}
