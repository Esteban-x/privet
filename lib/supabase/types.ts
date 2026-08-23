export type CefrLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export const CEFR_LEVELS: CefrLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

// Niveaux proposés à la génération de textes de lecture. A0 en est exclu :
// un texte suivi n'a pas de sens sans un minimum de langue. C2 y figure
// alors que le test de placement s'arrête à C1 — c'est voulu, la difficulté
// d'un texte qu'on demande est indépendante du niveau qu'on a mesuré.
export const READING_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface Profile {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  level: CefrLevel;
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
  kind: "case" | "motion" | "aspect" | "participle" | "vocab" | "reading" | "chat";
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
