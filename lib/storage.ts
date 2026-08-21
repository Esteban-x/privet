"use client";

import { SrsCard, createNewCard } from "./srs/sm2";
import { CaseId, Gender } from "./grammar/types";

const KEYS = {
  srs: "ru-app:srs-cards",
  caseProgress: "ru-app:case-progress",
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
