import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Mots de vocabulaire perso déjà classifiés grammaticalement (genre connu),
// toutes listes confondues — alimente le pool des exercices de cas
// (module /cases) en plus de la banque curée (lib/grammar/nouns-data.ts).
// Un mot sans genre (classification IA échouée, pas encore tentée) est
// simplement absent de cette liste : il reste utilisable en vocabulaire
// classique, juste pas décliné.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ words: [] });

  const { data, error } = await supabase
    .from("vocab_words")
    .select("id, ru, fr, gender, animacy, stem_type, indeclinable, french_gender")
    .eq("user_id", user.id)
    .not("gender", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    words: (data ?? []).map((w) => ({
      id: w.id,
      ru: w.ru,
      fr: w.fr,
      gender: w.gender,
      animacy: w.animacy ?? "inanimate",
      stemType: w.stem_type ?? "hard",
      indeclinable: w.indeclinable ?? false,
      frenchGender: w.french_gender,
    })),
  });
}
