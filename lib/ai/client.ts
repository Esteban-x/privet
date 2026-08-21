import Anthropic from "@anthropic-ai/sdk";

// Client Anthropic instancié UNIQUEMENT côté serveur (routes API).
// La clé ne doit jamais transiter vers le navigateur.
let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY manquante. Copie .env.local.example en .env.local et renseigne ta clé."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const MODEL_FAST = process.env.ANTHROPIC_MODEL_FAST || "claude-haiku-4-5";
export const MODEL_CHAT = process.env.ANTHROPIC_MODEL_CHAT || "claude-sonnet-5";

// Extrait le texte concaténé d'une réponse Messages.
export function textFromMessage(msg: Anthropic.Message): string {
  return msg.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

// Parse un JSON renvoyé par le modèle en tolérant d'éventuels ```fences```.
export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
