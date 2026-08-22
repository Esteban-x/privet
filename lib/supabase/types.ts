export type CefrLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
export const CEFR_LEVELS: CefrLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1"];

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
  vocab_daily_goal: number;
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

export interface ChatConversationRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  user_id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface VocabListRow {
  id: string;
  user_id: string;
  name: string;
  topic_id: string | null;
  created_at: string;
}

export interface VocabWordRow {
  id: string;
  list_id: string;
  user_id: string;
  ru: string;
  transliteration: string | null;
  fr: string;
  example_ru: string | null;
  example_fr: string | null;
  gender: "masculine" | "feminine" | "neuter" | null;
  animacy: "animate" | "inanimate" | null;
  stem_type: "hard" | "soft" | "mixed" | null;
  indeclinable: boolean | null;
  french_gender: "m" | "f" | null;
  created_at: string;
}

export interface CaseTriggerProgressRow {
  user_id: string;
  case_id: string;
  trigger_id: string;
  attempts: number;
  correct: number;
  last_seen: string;
}

export interface SrsCardRow {
  user_id: string;
  card_id: string;
  word_ru: string | null;
  word_fr: string | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  last_reviewed: string | null;
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
