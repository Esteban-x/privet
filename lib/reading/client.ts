import type { ReadingText } from "./texts";
import type { ReadingLength, ReadingStyle } from "@/lib/ai/prompts";
import type { CaseId } from "@/lib/grammar/types";
import type { CefrLevel } from "@/lib/supabase/types";

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur réseau");
  return data as T;
}

export interface GenerateReadingOptions {
  /** Absent = le niveau du profil, décidé côté serveur. */
  level?: CefrLevel;
  length?: ReadingLength;
  style?: ReadingStyle;
  focusCase?: CaseId;
}

export function generateReadingText(
  options: GenerateReadingOptions
): Promise<{ text: ReadingText; id: string | null }> {
  return fetch("/api/ai/reading", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  }).then((r) => json(r));
}

export interface SavedReadingTextSummary {
  id: string;
  title: string;
  titleFr: string | null;
  level: CefrLevel;
  sentenceCount: number;
  createdAt: string;
}

export function fetchMyReadingTexts(): Promise<{ texts: SavedReadingTextSummary[] }> {
  return fetch("/api/reading/mine").then((r) => json(r));
}

export function fetchMyReadingText(id: string): Promise<{ text: ReadingText & { summaryFr: string | null } }> {
  return fetch(`/api/reading/mine/${id}`).then((r) => json(r));
}

export function deleteMyReadingText(id: string): Promise<{ ok: true }> {
  return fetch(`/api/reading/mine/${id}`, { method: "DELETE" }).then((r) => json(r));
}
