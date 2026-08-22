import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Progression complète de l'utilisateur sur le module /cases : par cas ×
// genre (case_progress, existant) et par cas × déclencheur
// (case_trigger_progress, plus fin) — hydrate le sélecteur adaptatif côté
// client (lib/grammar/exercise-selector.ts) et les indicateurs de points
// faibles sur /cases. Renvoie des tableaux vides pour un visiteur non
// connecté (l'exercice reste jouable en local, voir lib/storage.ts).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ caseProgress: [], triggerProgress: [] });

  const [{ data: caseProgress, error: caseError }, { data: triggerProgress, error: triggerError }] =
    await Promise.all([
      supabase
        .from("case_progress")
        .select("case_id, gender, attempts, correct")
        .eq("user_id", user.id),
      supabase
        .from("case_trigger_progress")
        .select("case_id, trigger_id, attempts, correct")
        .eq("user_id", user.id),
    ]);

  if (caseError) return NextResponse.json({ error: caseError.message }, { status: 500 });
  if (triggerError) return NextResponse.json({ error: triggerError.message }, { status: 500 });

  return NextResponse.json({
    caseProgress: caseProgress ?? [],
    triggerProgress: triggerProgress ?? [],
  });
}
