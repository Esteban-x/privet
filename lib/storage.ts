"use client";

import { SrsCard, createNewCard } from "./srs/sm2";
import { CaseId, Gender } from "./grammar/types";

const KEYS = {
  srs: "ru-app:srs-cards",
  caseProgress: "ru-app:case-progress",
  triggerProgress: "ru-app:case-trigger-progress",
  direction: "ru-app:vocab-direction", // + `:${mode}`
};

// --- SRS (vocabulaire) ---

export function loadSrsCards(): Record<string, SrsCard> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEYS.srs);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSrsCards(cards: Record<string, SrsCard>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.srs, JSON.stringify(cards));
}

export function getOrCreateCard(cards: Record<string, SrsCard>, id: string): SrsCard {
  return cards[id] ?? createNewCard(id);
}

// --- Progression par cas grammatical ---

export interface CaseProgressEntry {
  caseId: CaseId;
  gender: Gender;
  attempts: number;
  correct: number;
  lastSeen: number;
}

type CaseProgressMap = Record<string, CaseProgressEntry>; // clé = `${caseId}:${gender}`

export function loadCaseProgress(): CaseProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEYS.caseProgress);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCaseProgress(map: CaseProgressMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.caseProgress, JSON.stringify(map));
}

export function recordCaseAttempt(caseId: CaseId, gender: Gender, wasCorrect: boolean) {
  const map = loadCaseProgress();
  const key = `${caseId}:${gender}`;
  const existing: CaseProgressEntry = map[key] ?? { caseId, gender, attempts: 0, correct: 0, lastSeen: Date.now() };
  existing.attempts += 1;
  existing.correct += wasCorrect ? 1 : 0;
  existing.lastSeen = Date.now();
  map[key] = existing;
  saveCaseProgress(map);
  return map;
}

export function accuracyFor(entry: CaseProgressEntry | undefined): number {
  if (!entry || entry.attempts === 0) return 0;
  return Math.round((entry.correct / entry.attempts) * 100);
}

// Sync best-effort vers le compte (case_progress + case_trigger_progress +
// activity_log + série/XP côté serveur, pour le tableau de bord). Le
// localStorage ci-dessus reste la source instantanée affichée dans
// l'exercice — il fonctionne aussi sans compte ; cet appel échoue
// silencieusement si non connecté.
export function syncCaseAttempt(
  caseId: CaseId,
  gender: Gender,
  correct: boolean,
  triggerId?: string,
  verification?: {
    nounId: string;
    plural: boolean;
    userAnswer: string;
    verifiable: boolean;
    adjectiveId?: string;
  }
) {
  fetch("/api/cases/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // `correct` reste envoyé comme repli (exercices IA / accord adjectif,
    // non recalculables côté serveur sans y dupliquer l'IA) — mais dès que
    // `verification` est fourni pour un nom de la banque curée ou du
    // vocabulaire perso, le serveur recalcule la forme attendue lui-même
    // et ignore ce booléen (voir app/api/cases/attempt/route.ts).
    body: JSON.stringify({ caseId, gender, correct, triggerId, ...verification }),
  }).catch(() => {});
}

// --- Progression locale par déclencheur (pour le sélecteur adaptatif en
// l'absence de compte, ou avant le premier fetch serveur) ---

export interface TriggerProgressEntry {
  triggerId: string;
  attempts: number;
  correct: number;
  lastSeen: number;
}

type TriggerProgressMap = Record<string, TriggerProgressEntry>; // clé = triggerId

export function loadTriggerProgress(): TriggerProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEYS.triggerProgress);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveTriggerProgress(map: TriggerProgressMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.triggerProgress, JSON.stringify(map));
}

export function recordTriggerAttempt(triggerId: string, wasCorrect: boolean) {
  const map = loadTriggerProgress();
  const existing: TriggerProgressEntry =
    map[triggerId] ?? { triggerId, attempts: 0, correct: 0, lastSeen: Date.now() };
  existing.attempts += 1;
  existing.correct += wasCorrect ? 1 : 0;
  existing.lastSeen = Date.now();
  map[triggerId] = existing;
  saveTriggerProgress(map);
  return map;
}

// --- Sens de révision du vocabulaire (carte, frappe, QCM, voix) ---
// "ru-first" = le mot russe est montré en premier, la réponse est en
// français ; "fr-first" = l'inverse. Préférence par mode d'exercice.

export type VocabMode = "flashcards" | "typing" | "voice" | "qcm";
export type VocabDirection = "ru-first" | "fr-first";

export function loadDirection(mode: VocabMode, fallback: VocabDirection): VocabDirection {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${KEYS.direction}:${mode}`);
    return raw === "ru-first" || raw === "fr-first" ? raw : fallback;
  } catch {
    return fallback;
  }
}

export function saveDirection(mode: VocabMode, direction: VocabDirection) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${KEYS.direction}:${mode}`, direction);
}
