"use client";

import { SrsCard, createNewCard } from "./srs/sm2";

// La progression du module "Cas" n'est PAS ici : elle vit uniquement côté
// serveur (app/api/cases/attempt). Un double stockage local + base donnait
// deux compteurs qui divergeaient (l'écran disait "juste", la base "faux"),
// pour un mode hors-ligne qui n'existe pas — /cases exige un compte.
const KEYS = {
  srs: "ru-app:srs-cards",
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
