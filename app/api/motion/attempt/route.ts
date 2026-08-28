import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bumpStreakAndXp } from "@/lib/progress/streak";
import { checkMotionAnswer, getSkill } from "@/lib/motion/exercises";
import { allowPractice } from "@/lib/practice/quota";

/**
 * Seule autorité sur la justesse d'une réponse du module « verbes de
 * mouvement », comme app/api/cases/attempt l'est pour les déclinaisons.
 *
 * Le client envoie l'identifiant de l'item et ce qu'il a choisi — jamais
 * « j'ai eu juste ». Le serveur rejoue la correction depuis la banque
 * (lib/motion/exercises.ts) : impossible de gonfler sa progression, et
 * l'écran ne peut pas afficher autre chose que ce qui est enregistré.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const skill = typeof body.skill === "string" ? body.skill : "";
  const itemId = typeof body.itemId === "string" ? body.itemId.slice(0, 120) : "";
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 120) : "";

  if (!getSkill(skill)) {
    return NextResponse.json({ error: "Compétence inconnue" }, { status: 400 });
  }
  const correct = checkMotionAnswer(itemId, answer);
  if (correct === null) {
    return NextResponse.json({ error: "Exercice inconnu" }, { status: 400 });
  }

  // Le péage de pratique : vingt exercices par jour au plan gratuit, tous
  // modules confondus.
  //
  // PLACÉ ICI, ET PAS PLUS HAUT. La correction ci-dessus ne coûte rien —
  // c'est une lecture de banque en mémoire. Ce qu'il faut éviter, c'est
  // qu'une requête malformée (compétence inconnue, item inexistant) grignote
  // la journée de quelqu'un : elle ressort en 400 sans avoir rien consommé.
  // Et le péage reste AVANT toute écriture, donc un refus ne laisse ni
  // progression ni XP derrière lui.
  const gate = await allowPractice(supabase, "practice");
  if (!gate.ok) return gate.response;

  const { data: existing } = await supabase
    .from("motion_progress")
    .select("attempts, correct")
    .eq("user_id", user.id)
    .eq("skill_id", skill)
    .single();

  const attempts = (existing?.attempts ?? 0) + 1;
  const correctTotal = (existing?.correct ?? 0) + (correct ? 1 : 0);

  const { error } = await supabase.from("motion_progress").upsert(
    {
      user_id: user.id,
      skill_id: skill,
      attempts,
      correct: correctTotal,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "user_id,skill_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("activity_log").insert({
    user_id: user.id,
    kind: "motion",
    correct,
    meta: { skill, itemId },
  });

  await bumpStreakAndXp(supabase, user.id, correct ? 10 : 2);

  return NextResponse.json({
    correct,
    accuracy: Math.round((correctTotal / attempts) * 100),
    // Ce qu'il reste APRÈS celui-ci : l'écran sait donc qu'il vient de
    // servir le dernier, et propose l'abonnement plutôt qu'un exercice
    // qu'il faudrait refuser une fois répondu.
    quota: gate.allowance,
  });
}
