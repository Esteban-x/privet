import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/api/validate";

function field(body: Record<string, unknown>, key: string, max: number): string | undefined {
  const value = body[key];
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, max);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ wordId: string }> }
) {
  const { wordId } = await params;
  if (!isUuid(wordId)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const update: Record<string, string | boolean | null> = {};
  const ru = field(body, "ru", 100);
  const fr = field(body, "fr", 200);
  const transliteration = field(body, "transliteration", 100);
  const exampleRu = field(body, "exampleRu", 300);
  const exampleFr = field(body, "exampleFr", 300);
  if (ru !== undefined) update.ru = ru || null;
  if (fr !== undefined) update.fr = fr || null;
  if (transliteration !== undefined) update.transliteration = transliteration || null;
  if (exampleRu !== undefined) update.example_ru = exampleRu || null;
  if (exampleFr !== undefined) update.example_fr = exampleFr || null;

  // Correction manuelle de la classification grammaticale (filet de
  // sécurité si l'heuristique/IA s'est trompée — voir grammar-classify.ts).
  if (body.gender === "masculine" || body.gender === "feminine" || body.gender === "neuter") {
    update.gender = body.gender;
  } else if (body.gender === null) {
    update.gender = null;
  }
  if (body.animacy === "animate" || body.animacy === "inanimate") {
    update.animacy = body.animacy;
  }
  if (typeof body.indeclinable === "boolean") {
    update.indeclinable = body.indeclinable;
  }
  if (body.frenchGender === "m" || body.frenchGender === "f") {
    update.french_gender = body.frenchGender;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const { error } = await supabase
    .from("vocab_words")
    .update(update)
    .eq("id", wordId)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ wordId: string }> }
) {
  const { wordId } = await params;
  if (!isUuid(wordId)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Nettoie la carte SRS associée si elle existe (pas de clé étrangère —
  // card_id sert aussi aux mots du catalogue intégré).
  await supabase.from("srs_cards").delete().eq("user_id", user.id).eq("card_id", wordId);

  const { error } = await supabase
    .from("vocab_words")
    .delete()
    .eq("id", wordId)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
