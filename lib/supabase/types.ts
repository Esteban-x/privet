export type CefrLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";

export interface Profile {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  level: CefrLevel;
  goals: string | null;
  topics: string[];
  onboarded: boolean;
  streak_count: number;
  streak_last: string | null;
  xp: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow {
  id: string;
  user_id: string;
  kind: "case" | "vocab" | "reading" | "chat";
  correct: boolean | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatMessageRow {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Catalogue de thèmes proposés à l'inscription.
export const TOPIC_CATALOG: { id: string; label: string; emoji: string }[] = [
  { id: "travel", label: "Voyage", emoji: "✈️" },
  { id: "food", label: "Cuisine & restaurant", emoji: "🍲" },
  { id: "business", label: "Travail & affaires", emoji: "💼" },
  { id: "literature", label: "Littérature classique", emoji: "📚" },
  { id: "daily", label: "Vie quotidienne", emoji: "🏠" },
  { id: "news", label: "Actualité & société", emoji: "📰" },
  { id: "cinema", label: "Cinéma & culture", emoji: "🎬" },
  { id: "science", label: "Science & tech", emoji: "🔬" },
  { id: "sport", label: "Sport", emoji: "⚽" },
  { id: "music", label: "Musique", emoji: "🎵" },
];
