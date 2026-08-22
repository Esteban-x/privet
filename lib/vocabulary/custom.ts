// Listes de vocabulaire (page /vocabulary) : petits wrappers fetch vers
// app/api/vocab/**, appelés depuis des composants client. Une liste est soit
// amorcée depuis un thème choisi à l'inscription (topicId non nul), soit
// entièrement perso (topicId nul) — les deux se gèrent et se révisent de la
// même façon une fois créées.

import type { SrsCard } from "@/lib/srs/sm2";
import type { Animacy, FrenchGender, Gender, Noun, StemType } from "@/lib/grammar/types";
import type { VocabItem } from "./data";

export interface VocabListSummary {
  id: string;
  name: string;
  topicId: string | null;
  createdAt: string;
  wordCount: number;
}

export interface CustomVocabWord {
  id: string;
  ru: string;
  transliteration: string | null;
  fr: string;
  exampleRu: string | null;
  exampleFr: string | null;
  gender?: Gender | null;
  animacy?: Animacy | null;
  stemType?: StemType | null;
  frenchGender?: FrenchGender | null;
  indeclinable?: boolean | null;
  // Présents seulement dans la file de révision globale (fetchDueWords) où
  // les mots viennent de listes différentes ; absents en contexte liste
  // unique (fetchListDetail), où toVocabItem retombe sur un nom fourni.
  listId?: string;
  listName?: string;
  srs: SrsCard | null;
}

export function fetchDueWords(): Promise<{
  words: CustomVocabWord[];
  dueCount: number;
  totalWords: number;
}> {
  return fetch("/api/vocab/due").then((r) => json(r));
}

export function fetchDailyProgress(): Promise<{ reviewedToday: number; goal: number }> {
  return fetch("/api/vocab/daily-progress").then((r) => json(r));
}

// Mot de vocabulaire perso classifié, tel que renvoyé par
// GET /api/vocab/words/declinable — genre/animacité/radical toujours
// présents (le filtre côté serveur exclut les mots pas encore classifiés).
export interface DeclinableWord {
  id: string;
  ru: string;
  fr: string;
  gender: Gender;
  animacy: Animacy;
  stemType: StemType;
  frenchGender: FrenchGender | null;
  indeclinable: boolean;
}

export function fetchDeclinableWords(): Promise<{ words: DeclinableWord[] }> {
  return fetch("/api/vocab/words/declinable").then((r) => json(r));
}

// Le genre français ne peut PAS se déduire heuristiquement du mot russe
// (arbitraire d'une langue à l'autre) — seule l'IA de classification le
// fournit (voir vocabGrammarSystemPrompt) ; s'il manque (classification pas
// encore faite ou échouée), on retombe sur masculin par défaut plutôt que
// de propager une valeur manquante jusqu'au rendu — un mauvais article vaut
// mieux qu'un article absent ou une phrase cassée.
export const DEFAULT_FRENCH_GENDER: FrenchGender = "m";

export function declinableToNoun(word: DeclinableWord): Noun {
  return {
    id: `custom:${word.id}`,
    lemma: word.ru,
    translation: word.fr,
    frenchGender: word.frenchGender ?? DEFAULT_FRENCH_GENDER,
    gender: word.gender,
    animacy: word.animacy,
    stemType: word.stemType,
    indeclinable: word.indeclinable,
  };
}

// Adapte un mot perso classifié au format Noun du moteur de déclinaison
// (lib/grammar/decline.ts). Retourne `null` si le mot n'a pas encore de
// genre connu — il est alors simplement exclu du pool des exercices de cas.
export function toNoun(word: CustomVocabWord): Noun | null {
  if (!word.gender) return null;
  return {
    id: `custom:${word.id}`,
    lemma: word.ru,
    translation: word.fr,
    frenchGender: word.frenchGender ?? DEFAULT_FRENCH_GENDER,
    gender: word.gender,
    animacy: word.animacy ?? "inanimate",
    stemType: word.stemType ?? "hard",
    indeclinable: word.indeclinable ?? false,
  };
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur réseau");
  return data as T;
}

export function fetchLists(): Promise<{ lists: VocabListSummary[] }> {
  return fetch("/api/vocab/lists").then((r) => json(r));
}

/** Amorce les listes des thèmes choisis à l'inscription pas encore créées (idempotent). */
export function syncTopicLists(): Promise<{ created: { id: string; name: string; topicId: string }[] }> {
  return fetch("/api/vocab/lists/sync-topics", { method: "POST" }).then((r) => json(r));
}

export function createList(name: string): Promise<{ list: VocabListSummary }> {
  return fetch("/api/vocab/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then((r) => json(r));
}

export function renameList(listId: string, name: string): Promise<{ ok: true }> {
  return fetch(`/api/vocab/lists/${listId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then((r) => json(r));
}

export function deleteList(listId: string): Promise<{ ok: true }> {
  return fetch(`/api/vocab/lists/${listId}`, { method: "DELETE" }).then((r) => json(r));
}

export function fetchListDetail(
  listId: string
): Promise<{ list: { id: string; name: string }; words: CustomVocabWord[] }> {
  return fetch(`/api/vocab/lists/${listId}`).then((r) => json(r));
}

export interface WordInput {
  ru: string;
  fr: string;
  transliteration?: string;
  exampleRu?: string;
  exampleFr?: string;
}

export function addWord(listId: string, word: WordInput): Promise<{ word: CustomVocabWord }> {
  return fetch("/api/vocab/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listId, ...word }),
  }).then((r) => json(r));
}

export function updateWord(wordId: string, word: Partial<WordInput>): Promise<{ ok: true }> {
  return fetch(`/api/vocab/words/${wordId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(word),
  }).then((r) => json(r));
}

export function deleteWord(wordId: string): Promise<{ ok: true }> {
  return fetch(`/api/vocab/words/${wordId}`, { method: "DELETE" }).then((r) => json(r));
}

// Correction manuelle du genre/animacité — filet de sécurité si la
// classification auto (heuristique + IA) s'est trompée, puisqu'elle
// alimente directement les exercices de cas.
export function updateWordGrammar(
  wordId: string,
  grammar: { gender: Gender; animacy: Animacy }
): Promise<{ ok: true }> {
  return fetch(`/api/vocab/words/${wordId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grammar),
  }).then((r) => json(r));
}

export function reviewCustomCard(
  cardId: string,
  wordRu: string,
  wordFr: string,
  quality: number
): Promise<{ card: SrsCard }> {
  return fetch("/api/vocab/srs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId, wordRu, wordFr, quality }),
  }).then((r) => json(r));
}

// Adapte un mot de liste perso au format VocabItem, pour réutiliser les
// mêmes pages d'exercice que le catalogue intégré. `fallbackListName` sert
// en contexte liste unique ; en révision globale, chaque mot porte déjà son
// propre `listName` (mots de listes différentes mélangés dans une session).
export function toVocabItem(word: CustomVocabWord, fallbackListName: string): VocabItem {
  return {
    id: word.id,
    ru: word.ru,
    transliteration: word.transliteration ?? "",
    fr: word.fr,
    theme: word.listName || fallbackListName,
    example:
      word.exampleRu && word.exampleFr ? { ru: word.exampleRu, fr: word.exampleFr } : undefined,
  };
}
