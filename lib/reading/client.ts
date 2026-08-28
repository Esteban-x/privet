import type { ReadingText } from "./texts";
import type { ReadingLength, ReadingStyle } from "@/lib/ai/prompts";
import type { CaseId } from "@/lib/grammar/types";
import type { CefrLevel } from "@/lib/supabase/types";
import { quotaErrorFrom } from "@/lib/billing/quota-client";

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  // Le refus de quota AVANT l'erreur générique : un 429 est une réponse
  // normale (plafond atteint), pas un incident réseau, et il appelle un
  // écran d'abonnement plutôt qu'un message rouge « réessayer ».
  const quota = quotaErrorFrom(res, data);
  if (quota) throw quota;
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
