import type { GlossedWord, ReadingText } from "./texts";
import type { CaseId } from "@/lib/grammar/types";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/supabase/types";
import { verifyCaseTags } from "./verify-cases";

const CASE_IDS = new Set<CaseId>([
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "instrumental",
  "prepositional",
]);

// L'IA ne renvoie pas toujours EXACTEMENT le schéma demandé dans le prompt
// (lib/ai/prompts.ts) — un champ mal typé ou une structure différente
// planterait ReadingPassage (sentence.map, word.ru) sans error boundary, ou
// pire, serait sauvegardé tel quel en base. Validé ici (utilisé à la fois
// côté serveur avant l'insert et côté client en filet de sécurité) plutôt
// que casté en confiance.
export function toReadingText(raw: unknown, fallbackLevel: CefrLevel = "A1"): ReadingText | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.title !== "string" || !Array.isArray(t.sentences)) return null;

  const sentences: GlossedWord[][] = [];
  for (const rawSentence of t.sentences) {
    if (!Array.isArray(rawSentence)) return null;
    const sentence: GlossedWord[] = [];
    for (const rawWord of rawSentence) {
      if (!rawWord || typeof rawWord !== "object") return null;
      const w = rawWord as Record<string, unknown>;
      if (typeof w.ru !== "string") return null;
      const word: GlossedWord = { ru: w.ru };
      if (typeof w.gloss === "string") word.gloss = w.gloss;
      // Le cas annoncé est ici seulement RECOPIÉ s'il a la bonne forme ;
      // sa justesse est éprouvée plus bas par verifyCaseTags, qui retire
      // les analyses que la banque contredit.
      if (typeof w.case === "string" && CASE_IDS.has(w.case as CaseId)) {
        word.case = w.case as CaseId;
      }
      sentence.push(word);
    }
    sentences.push(sentence);
  }
  if (sentences.length === 0) return null;

  const level = CEFR_LEVELS.includes(t.level as CefrLevel) ? (t.level as CefrLevel) : fallbackLevel;

  // Dernière étape, et la seule qui juge du FOND : les tags de cas passent
  // devant la banque de déclinaisons. Ceux qu'elle contredit disparaissent,
  // ceux qu'elle confirme sont marqués comme tels. Appliqué ici, donc avant
  // l'insert en base : un texte stocké est déjà nettoyé.
  const verified = verifyCaseTags(sentences);

  return {
    id: "ai-generated",
    title: t.title,
    level,
    sentences: verified.sentences,
    caseCheck: verified.report,
  };
}
