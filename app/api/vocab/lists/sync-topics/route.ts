import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { includesAdvanced, TOPIC_VOCAB } from "@/lib/vocabulary/topics";
import { TOPIC_CATALOG } from "@/lib/supabase/types";

// Amorce les listes de vocabulaire correspondant aux thèmes choisis à
// l'inscription (idempotent : ne crée que les thèmes pas encore
// représentés — voir l'index unique (user_id, topic_id) dans schema.sql).
// Sans thème choisi, aucune liste n'est créée : pas de mot par défaut tant
// que l'utilisateur n'a rien sélectionné. Le niveau CEFR détermine si le
// vocabulaire avancé du thème est inclus dès la création.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("topics, level")
    .eq("id", user.id)
    .single();

  const topics: string[] = profile?.topics ?? [];
  if (topics.length === 0) return NextResponse.json({ created: [] });

  const { data: existing } = await supabase
    .from("vocab_lists")
    .select("topic_id")
    .eq("user_id", user.id)
    .not("topic_id", "is", null);
  const existingTopicIds = new Set((existing ?? []).map((l) => l.topic_id));

  const level = profile?.level ?? "A0";
  const advanced = includesAdvanced(level);
  const labelById = new Map(TOPIC_CATALOG.map((t) => [t.id, t.label]));

  const created: { id: string; name: string; topicId: string }[] = [];

  for (const topicId of topics) {
    if (existingTopicIds.has(topicId)) continue;
    const bank = TOPIC_VOCAB[topicId];
    const label = labelById.get(topicId);
    if (!bank || !label) continue; // thème inconnu (ne devrait pas arriver)

    const { data: list, error: listError } = await supabase
      .from("vocab_lists")
      .insert({ user_id: user.id, name: label, topic_id: topicId })
      .select("id, name")
      .single();
    if (listError || !list) continue;

    const seeds = advanced ? [...bank.basic, ...bank.advanced] : bank.basic;
    const { error: wordsError } = await supabase.from("vocab_words").insert(
      seeds.map((w) => ({
        list_id: list.id,
        user_id: user.id,
        ru: w.ru,
        transliteration: w.transliteration,
        fr: w.fr,
      }))
    );
    if (wordsError) {
      // Liste créée mais vide : pire que de ne rien avoir créé (l'utilisateur
      // la verrait dans /vocabulary sans le mot qu'elle est censée amorcer).
      // On la retire plutôt que de rapporter un succès silencieux.
      console.error("sync-topics: échec insertion des mots", topicId, wordsError);
      await supabase.from("vocab_lists").delete().eq("id", list.id);
      continue;
    }

    created.push({ id: list.id, name: list.name, topicId });
  }

  return NextResponse.json({ created });
}
