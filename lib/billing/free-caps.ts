import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Les deux chiffres que la vitrine annonce : « 20 exercices et 20 révisions
 * par jour ».
 *
 * ILS SONT LUS EN BASE, PAS ÉCRITS ICI. `plan_limits` existe précisément
 * pour que ces plafonds bougent par un UPDATE, au vu du taux de conversion
 * réel, sans redéploiement. Les recopier dans la page de prix aurait
 * réintroduit exactement ce qu'on voulait éviter : une valeur qui fait foi
 * pour l'app, une autre pour le client — et un jour où les deux se
 * contredisent sur la page qui demande de payer.
 *
 * Les valeurs ci-dessous ne servent que si la base est injoignable ou pas
 * encore migrée : la page de prix doit s'afficher, même dégradée.
 */
const FALLBACK = { practice: 20, vocabReview: 20 };

export interface FreeCaps {
  practice: number;
  vocabReview: number;
}

export async function fetchFreeCaps(supabase: SupabaseClient | null): Promise<FreeCaps> {
  if (!supabase) return FALLBACK;

  const { data, error } = await supabase
    .from("plan_limits")
    .select("feature, daily_cap")
    .eq("plan", "free")
    .in("feature", ["practice", "vocab_review"]);

  if (error || !data?.length) return FALLBACK;

  const byFeature = new Map(data.map((row) => [row.feature as string, row.daily_cap as number]));
  return {
    practice: byFeature.get("practice") ?? FALLBACK.practice,
    vocabReview: byFeature.get("vocab_review") ?? FALLBACK.vocabReview,
  };
}
