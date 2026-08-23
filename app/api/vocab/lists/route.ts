import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Listes de vocabulaire personnelles (page /vocabulary/lists). Protégées par
// RLS (auth.uid() = user_id) : chaque requête ne voit que ses propres listes.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data, error } = await supabase
    .from("vocab_lists")
    .select("id, name, created_at, vocab_words(count)")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lists = (data ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    createdAt: l.created_at,
    wordCount: (l.vocab_words as { count: number }[] | null)?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ lists });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) return NextResponse.json({ error: "Nom de liste requis" }, { status: 400 });

  const { data, error } = await supabase
    .from("vocab_lists")
    .insert({ user_id: user.id, name })
    .select("id, name, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    list: { id: data.id, name: data.name, createdAt: data.created_at, wordCount: 0 },
  });
}
