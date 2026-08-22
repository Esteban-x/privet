import { Gender, StemType } from "@/lib/grammar/types";

// Classification grammaticale heuristique d'un nom russe à partir de sa
// terminaison — déterministe, aucune IA impliquée (même philosophie que
// lib/grammar/decline.ts : pas de risque d'hallucination sur ce qui peut
// être déduit par une règle). Couvre le genre et le type de radical, qui
// se lisent sur la terminaison ; ne détermine PAS l'animacité, qui dépend
// du sens du mot et nécessite donc l'IA (voir lib/ai/prompts.ts).

const MASCULINE_EXCEPTIONS = new Set(["папа", "дядя", "дедушка", "мужчина"]);
const HISSING = ["г", "к", "х", "ж", "ч", "ш", "щ"];

export interface HeuristicGrammar {
  gender: Gender | null;
  stemType: StemType | null;
}

export function heuristicClassify(ru: string): HeuristicGrammar {
  const word = ru.trim().toLowerCase();
  if (!word) return { gender: null, stemType: null };

  if (MASCULINE_EXCEPTIONS.has(word)) {
    return { gender: "masculine", stemType: "hard" };
  }

  const last = word[word.length - 1];
  const stemLast = word[word.length - 2];

  if (last === "а" || last === "я") {
    return { gender: "feminine", stemType: last === "я" ? "soft" : "hard" };
  }
  if (last === "о") {
    return { gender: "neuter", stemType: "hard" };
  }
  if (last === "е" || last === "ё") {
    return { gender: "neuter", stemType: "soft" };
  }
  if (last === "ь") {
    // Ambigu (дверь fém. / словарь masc.) — trop peu fiable pour une règle,
    // laissé à l'IA de classification.
    return { gender: null, stemType: "soft" };
  }
  if (last === "й") {
    return { gender: "masculine", stemType: "soft" };
  }
  // Termine par une consonne : masculin. Radical "mixte" si la dernière
  // lettre est une chuintante/g-k-h (règle d'orthographe и/е).
  return {
    gender: "masculine",
    stemType: HISSING.includes(last) || HISSING.includes(stemLast ?? "") ? "mixed" : "hard",
  };
}
