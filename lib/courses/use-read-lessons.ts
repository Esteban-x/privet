"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { COURSES_READ_KEY, saveReadLessons } from "@/lib/storage";

/**
 * Les leçons déjà lues, partagées entre la page catalogue et la page leçon.
 *
 * POURQUOI useSyncExternalStore ET PAS UN useEffect. Lire localStorage dans
 * un effet impose un setState au montage : le rendu serveur et le premier
 * rendu client diffèrent, et la règle react-hooks/set-state-in-effect du
 * projet l'interdit à juste titre. Ici React appelle `getServerSnapshot`
 * pour l'hydratation puis se resynchronise tout seul — pas d'effet, pas de
 * clignotement, et deux composants montés en même temps voient la même
 * valeur au même instant.
 */

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  // Un autre onglet qui coche une leçon : `storage` prévient celui-ci.
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/** Snapshot = la chaîne brute stockée. Une primitive, donc comparable telle quelle. */
function getSnapshot(): string {
  try {
    return localStorage.getItem(COURSES_READ_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function parse(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function useReadLessons() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const read = useMemo(() => new Set(parse(raw)), [raw]);

  const setRead = useCallback((slug: string, value: boolean) => {
    const next = new Set(parse(getSnapshot()));
    if (value) next.add(slug);
    else next.delete(slug);
    saveReadLessons([...next]);
    for (const listener of listeners) listener();
  }, []);

  const toggle = useCallback(
    (slug: string) => setRead(slug, !new Set(parse(getSnapshot())).has(slug)),
    [setRead]
  );

  return { read, setRead, toggle };
}
