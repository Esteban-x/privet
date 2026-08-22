import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bumpStreakAndXp } from "@/lib/progress/streak";

// Marque un texte de lecture comme terminé (bouton "J'ai terminé" dans
// ReadingPassage). Sans cette route, le module lecture ne contribuait à
// aucune stat du tableau de bord (série, XP, graphe d'activité) — la table
// activity_log documente pourtant déjà 'reading' comme "kind" attendu.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const textId = typeof body.textId === "string" ? body.textId.slice(0, 200) : null;
  const level = typeof body.level === "string" ? body.level.slice(0, 10) : null;

  await supabase.from("activity_log").insert({
    user_id: user.id,
    kind: "reading",
    correct: null,
    meta: { textId, level },
  });

  await bumpStreakAndXp(supabase, user.id, 8);

  return NextResponse.json({ ok: true });
}
