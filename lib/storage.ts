"use client";

import { SrsCard, createNewCard } from "./srs/sm2";

// La progression du module "Cas" n'est PAS ici : elle vit uniquement côté
// serveur (app/api/cases/attempt). Un double stockage local + base donnait
// deux compteurs qui divergeaient (l'écran disait "juste", la base "faux"),
// pour un mode hors-ligne qui n'existe pas — /cases exige un compte.
const KEYS = {
  srs: "ru-app:srs-cards",
  direction: "ru-app:vocab-direction", // + `:${mode}`
  addWordFirstSide: "ru-app:add-word-first-side",
  coursesRead: "ru-app:courses-read",
};

/** Exposée pour lib/courses/use-read-lessons.ts, qui lit le brut sans le parser. */
export const COURSES_READ_KEY = KEYS.coursesRead;

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

// --- Formulaire d'ajout : quelle langue en premier ---
//
// Purement visuel : l'ordre des deux champs, pas le sens de la traduction.
// Quelqu'un qui part systématiquement du français ne doit pas le redire à
// chaque mot.

export function loadAddWordFirstSide(): "ru" | "fr" {
  if (typeof window === "undefined") return "ru";
  try {
    return localStorage.getItem(KEYS.addWordFirstSide) === "fr" ? "fr" : "ru";
  } catch {
    // Stockage refusé (navigation privée, cookies bloqués) : le russe
    // d'abord, ce n'est qu'une préférence d'affichage.
    return "ru";
  }
}

export function saveAddWordFirstSide(side: "ru" | "fr") {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.addWordFirstSide, side);
  } catch {}
}

// --- Cours : leçons déjà lues ---
//
// Uniquement local, et volontairement : c'est un marque-page, pas une
// progression pédagogique. Rien n'en dépend (aucun calcul de niveau, aucun
// tirage d'exercice), donc rien ne justifie une table, une requête au
// chargement de la page, ni un compte obligatoire pour lire un cours.

export function loadReadLessons(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.coursesRead);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function saveReadLessons(slugs: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.coursesRead, JSON.stringify(slugs));
  } catch {
    // Quota plein ou stockage refusé : la lecture reste possible, seule la
    // coche est perdue. Rien à signaler à l'apprenant.
  }
}
