import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { countFocus, focusOf, reviewQueue } from "@/lib/vocabulary/focus";

// File de révision GLOBALE (module /vocabulary/review) : agrège les mots dus
// de TOUTES les listes de l'utilisateur, contrairement à
// GET /api/vocab/lists/[listId] qui reste scopé à une seule liste. Même
// logique de file que useReviewQueue côté liste unique, et la même
// définition partagée (lib/vocabulary/focus.ts) : les mots « à travailler »
// d'abord, puis les « normal » échus, jamais les « je le sais ».
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ words: [] });

  const [{ data: lists }, { data: words }, { data: srsRows }] = await Promise.all([
    supabase.from("vocab_lists").select("id, name").eq("user_id", user.id),
    supabase
      .from("vocab_words")
      .select(
        "id, list_id, ru, transliteration, fr, example_ru, example_fr, gender, animacy, stem_type, indeclinable, french_gender, focus"
      )
      .eq("user_id", user.id),
    supabase
      .from("srs_cards")
      .select("card_id, ease_factor, interval_days, repetitions, due_at, last_reviewed")
      .eq("user_id", user.id),
  ]);

  const listNameById = new Map((lists ?? []).map((l) => [l.id, l.name]));
  const srsByCardId = new Map((srsRows ?? []).map((r) => [r.card_id, r]));

  const now = Date.now();
  const enriched = (words ?? []).map((w) => {
    const srs = srsByCardId.get(w.id);
    return {
      id: w.id,
      ru: w.ru,
      transliteration: w.transliteration,
      fr: w.fr,
      exampleRu: w.example_ru,
      exampleFr: w.example_fr,
      gender: w.gender,
      animacy: w.animacy,
      stemType: w.stem_type,
      indeclinable: w.indeclinable,
      frenchGender: w.french_gender,
      listId: w.list_id,
      listName: listNameById.get(w.list_id) ?? "",
      focus: focusOf(w),
      srs: srs
        ? {
            easeFactor: srs.ease_factor,
            intervalDays: srs.interval_days,
            repetitions: srs.repetitions,
            dueAt: new Date(srs.due_at).getTime(),
            lastReviewedAt: srs.last_reviewed ? new Date(srs.last_reviewed).getTime() : null,
          }
        : null,
    };
  });

  const counts = countFocus(enriched, now);

  // `totalWords` compte tout, mots mis de côté compris : la page
  // /vocabulary/review s'en sert pour distinguer « aucun mot » de « rien à
  // réviser », deux situations qui n'appellent pas le même message.
  return NextResponse.json({
    words: reviewQueue(enriched, now),
    dueCount: counts.due,
    knownCount: counts.known,
    totalWords: enriched.length,
  });
}
