import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/api/validate";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data, error } = await supabase
    .from("reading_texts")
    .select("id, title, title_fr, level, sentences, summary_fr, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Texte introuvable" }, { status: 404 });

  return NextResponse.json({
    text: {
      id: data.id,
      title: data.title,
      titleFr: data.title_fr,
      level: data.level,
      sentences: data.sentences,
      summaryFr: data.summary_fr,
      createdAt: data.created_at,
    },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { error } = await supabase
    .from("reading_texts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
