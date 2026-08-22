import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Liste des fils de discussion avec le professeur IA (sidebar de /tutor),
// les plus récemment actifs en premier (chat/route.ts touche updated_at à
// chaque message).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ conversations: [] });

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    conversations: (data ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  });
}

// Pas de POST ici : une conversation est créée à la volée par le premier
// message (POST /api/ai/chat, voir titleFromMessage) plutôt qu'à vide —
// "+ Nouvelle conversation" ne fait que réinitialiser l'état local côté
// UI (app/tutor/page.tsx), sans ligne fantôme tant que rien n'est envoyé.
