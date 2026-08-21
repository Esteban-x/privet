import { CaseId, Noun } from "./types";
import { NOUNS } from "./nouns-data";
import { declineNoun } from "./decline";

export interface CaseExercise {
  noun: Noun;
  targetCase: CaseId;
  plural: boolean;
  mode: "isolated" | "sentence";
  sentenceTemplate?: string; // avec ___ pour le trou
  sentenceFr?: string;
  correctForm: string;
  ruleApplied: string;
}

// Gabarits de phrases très simples par cas (niveau A1-A2), un mot d'introduction
// suffit pour donner du contexte sans complexifier l'accord des autres mots.
const SENTENCE_TEMPLATES: Record<CaseId, { ru: string; fr: string }> = {
  nominative: { ru: "Это ___.", fr: "C'est ___." },
  genitive: { ru: "У меня нет ___.", fr: "Je n'ai pas de ___." },
  dative: { ru: "Я иду к ___.", fr: "Je vais vers ___." },
  accusative: { ru: "Я вижу ___.", fr: "Je vois ___." },
  instrumental: { ru: "Я горжусь ___.", fr: "Je suis fier de ___." },
  prepositional: { ru: "Я думаю о ___.", fr: "Je pense à ___." },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DECLINABLE_NOUNS = NOUNS.filter((n) => !n.indeclinable);

export function generateExercise(
  targetCase: CaseId,
  mode: "isolated" | "sentence" = "isolated",
  plural = false
): CaseExercise {
  const noun = pickRandom(DECLINABLE_NOUNS);
  const result = declineNoun(noun, targetCase, plural);

  const exercise: CaseExercise = {
    noun,
    targetCase,
    plural,
    mode,
    correctForm: result.form,
    ruleApplied: result.ruleApplied,
  };

  if (mode === "sentence") {
    const tpl = SENTENCE_TEMPLATES[targetCase];
    exercise.sentenceTemplate = tpl.ru;
    exercise.sentenceFr = tpl.fr.replace("___", noun.translation);
  }

  return exercise;
}

export function normalizeAnswer(str: string): string {
  return str.trim().toLowerCase().replace(/ё/g, "е");
}

export function checkAnswer(exercise: CaseExercise, userInput: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(exercise.correctForm);
}
