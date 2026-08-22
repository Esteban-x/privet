import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCase } from "@/lib/grammar/cases";
import { CaseId, Gender, Noun } from "@/lib/grammar/types";
import { bumpStreakAndXp } from "@/lib/progress/streak";
import { getNoun } from "@/lib/grammar/nouns-data";
import { getAdjective } from "@/lib/grammar/adjectives-data";
import { declineNoun } from "@/lib/grammar/decline";
import { declineAdjective } from "@/lib/grammar/decline-adjective";
import { normalizeAnswer } from "@/lib/grammar/exercise-generator";
import { DEFAULT_FRENCH_GENDER } from "@/lib/vocabulary/custom";
import { isUuid } from "@/lib/api/validate";
import type { SupabaseClient } from "@supabase/supabase-js";

const GENDERS: Gender[] = ["masculine", "feminine", "neuter"];

// Recalcule la forme attendue côté serveur pour un nom de la banque curée
// ou du vocabulaire perso de l'utilisateur (jamais pour un nom généré par
// IA, dont le lemme n'est pas vérifiable indépendamment) — évite qu'un
// client falsifie `correct` pour gonfler artificiellement case_progress,
// case_trigger_progress, la série et l'XP.
async function resolveNoun(
  supabase: SupabaseClient,
  userId: string,
  nounId: string
): Promise<Noun | null> {
  if (nounId.startsWith("custom:")) {
    const wordId = nounId.slice("custom:".length);
    if (!isUuid(wordId)) return null;
    const { data } = await supabase
      .from("vocab_words")
      .select("ru, fr, gender, animacy, stem_type, indeclinable, french_gender")
      .eq("id", wordId)
      .eq("user_id", userId)
      .single();
    if (!data || !data.gender) return null;
    return {
      id: nounId,
      lemma: data.ru,
      translation: data.fr,
      frenchGender: (data.french_gender as "m" | "f" | null) ?? DEFAULT_FRENCH_GENDER,
      gender: data.gender as Gender,
      animacy: (data.animacy as Noun["animacy"]) ?? "inanimate",
      stemType: (data.stem_type as Noun["stemType"]) ?? "hard",
      indeclinable: data.indeclinable ?? false,
    };
  }
  return getNoun(nounId) ?? null;
}

async function serverVerifiedCorrect(
  supabase: SupabaseClient,
  userId: string,
  caseId: CaseId,
  plural: boolean,
  nounId: string,
  adjectiveId: string | undefined,
  userAnswer: string
): Promise<boolean | null> {
  const noun = await resolveNoun(supabase, userId, nounId);
  if (!noun || noun.indeclinable) return null;
  const nounForm = declineNoun(noun, caseId, plural).form;
  let expected = nounForm;
  if (adjectiveId) {
    const adjective = getAdjective(adjectiveId);
    if (!adjective) return null;
    const adjForm = declineAdjective(adjective, caseId, noun.gender, plural, noun.animacy).form;
    expected = `${adjForm} ${nounForm}`;
  }
  return normalizeAnswer(userAnswer) === normalizeAnswer(expected);
}

// Enregistre une tentative de déclinaison (page /cases/[caseSlug], publique
// et jouable sans compte). Silencieusement ignoré côté client si 401 —
// l'exercice reste utilisable en local (voir lib/storage.ts) pour un
// visiteur non connecté ; connecté, cette route alimente en plus
// case_progress + activity_log + la série/XP du tableau de bord.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caseId = body.caseId as CaseId;
  const gender = body.gender as Gender;
  const triggerId = typeof body.triggerId === "string" ? body.triggerId : null;

  if (!getCase(caseId) || !GENDERS.includes(gender)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  // `correct` déclaré par le client sert de repli pour les exercices non
  // vérifiables (phrase générée par IA) ; sinon le serveur recalcule
  // lui-même la forme attendue et ignore ce booléen.
  let correct = body.correct === true;
  if (
    body.verifiable === true &&
    typeof body.nounId === "string" &&
    typeof body.userAnswer === "string"
  ) {
    const verified = await serverVerifiedCorrect(
      supabase,
      user.id,
      caseId,
      body.plural === true,
      body.nounId,
      typeof body.adjectiveId === "string" ? body.adjectiveId : undefined,
      body.userAnswer
    );
    if (verified !== null) correct = verified;
  }

  const { data: existing } = await supabase
    .from("case_progress")
    .select("attempts, correct")
    .eq("user_id", user.id)
    .eq("case_id", caseId)
    .eq("gender", gender)
    .single();

  const attempts = (existing?.attempts ?? 0) + 1;
  const correctTotal = (existing?.correct ?? 0) + (correct ? 1 : 0);

  const { error } = await supabase.from("case_progress").upsert(
    {
      user_id: user.id,
      case_id: caseId,
      gender,
      attempts,
      correct: correctTotal,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "user_id,case_id,gender" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("activity_log").insert({
    user_id: user.id,
    kind: "case",
    correct,
    meta: { caseId, gender, triggerId },
  });

  // Progression par déclencheur (préposition/verbe/expression), plus fine
  // que case_progress — alimente le tirage adaptatif (exercise-selector.ts).
  if (triggerId) {
    const { data: existingTrigger } = await supabase
      .from("case_trigger_progress")
      .select("attempts, correct")
      .eq("user_id", user.id)
      .eq("case_id", caseId)
      .eq("trigger_id", triggerId)
      .single();

    await supabase.from("case_trigger_progress").upsert(
      {
        user_id: user.id,
        case_id: caseId,
        trigger_id: triggerId,
        attempts: (existingTrigger?.attempts ?? 0) + 1,
        correct: (existingTrigger?.correct ?? 0) + (correct ? 1 : 0),
        last_seen: new Date().toISOString(),
      },
      { onConflict: "user_id,case_id,trigger_id" }
    );
  }

  await bumpStreakAndXp(supabase, user.id, correct ? 10 : 2);

  return NextResponse.json({ attempts, correct: correctTotal });
}
