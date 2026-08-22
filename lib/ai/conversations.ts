// Wrappers fetch vers app/api/ai/conversations/** — fils de discussion avec
// le professeur IA (sidebar de /tutor), même esprit que
// lib/vocabulary/custom.ts pour les listes de vocabulaire.

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur réseau");
  return data as T;
}

export function fetchConversations(): Promise<{ conversations: ConversationSummary[] }> {
  return fetch("/api/ai/conversations").then((r) => json(r));
}

export function renameConversation(id: string, title: string): Promise<{ ok: true }> {
  return fetch(`/api/ai/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  }).then((r) => json(r));
}

export function deleteConversation(id: string): Promise<{ ok: true }> {
  return fetch(`/api/ai/conversations/${id}`, { method: "DELETE" }).then((r) => json(r));
}
