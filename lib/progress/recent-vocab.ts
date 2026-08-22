import { SupabaseClient } from "@supabase/supabase-js";

const RECENT_LIMIT = 8;

// Mots de vocabulaire révisés le plus récemment (srs_cards.word_ru est déjà
// dénormalisé, pas besoin de rejoindre vocab_words) — injecté dans le
// prompt du professeur IA pour qu'il réemploie naturellement ce que
// l'utilisateur vient d'apprendre plutôt que de piocher au hasard.
export async function getRecentVocabSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("srs_cards")
    .select("word_ru, last_reviewed")
    .eq("user_id", userId)
    .not("last_reviewed", "is", null)
    .order("last_reviewed", { ascending: false })
    .limit(RECENT_LIMIT);

  const words = (data ?? []).map((r) => r.word_ru).filter((w): w is string => !!w);
  if (words.length === 0) return null;

  return words.join(", ");
}
