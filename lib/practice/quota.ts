import type { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanId, PracticeFeature } from "@/lib/billing/plans";
import { consumeQuota, quotaDeniedResponse } from "@/lib/ai/quota";

/**
 * Le péage devant un exercice corrigé ou une carte notée.
 *
 * POURQUOI DEVANT L'ÉCRITURE, ET NON DANS UN COMPTAGE APRÈS COUP. On aurait
 * pu compter les lignes du jour dans `activity_log` et refuser au-delà de
 * vingt. Mais un `select count` suivi d'un `insert` laisse une fenêtre :
 * vingt requêtes lancées ensemble lisent toutes le même total et passent
 * toutes. `consume_ai_quota` pose un verrou de ligne qui les sérialise —
 * c'est la seule partie délicate du système, et elle existe déjà. D'où la
 * réutilisation, malgré son nom hérité de son premier usage.
 *
 * CE QUE LE REFUS N'EMPÊCHE PAS. Les six routes de correction sont les
 * seules à écrire la progression et l'XP : refuser ici arrête bien la
 * pratique décomptée. Mais tout le reste de l'app — cours, tables de
 * référence, alphabet, listes de vocabulaire — ne passe pas par ici et
 * reste ouvert, ce qui est voulu : on borne l'entraînement, pas la lecture.
 */

export interface PracticeAllowance {
  plan: PlanId;
  /** Le plafond du jour, tel que l'écran doit l'annoncer. */
  cap: number;
  /** Ce qu'il reste APRÈS celui-ci — 0 signifie « c'était le dernier ». */
  remaining: number;
}

export type PracticeGate =
  | { ok: true; allowance: PracticeAllowance }
  | { ok: false; response: NextResponse };

/**
 * À appeler juste après le contrôle d'authentification, AVANT toute
 * correction ou écriture. Un refus ressort en 429 prêt à être renvoyé tel
 * quel ; le client le reconnaît avec `quotaErrorFrom`.
 */
export async function allowPractice(
  supabase: SupabaseClient,
  feature: PracticeFeature
): Promise<PracticeGate> {
  const verdict = await consumeQuota(supabase, feature);
  if (!verdict.allowed) return { ok: false, response: quotaDeniedResponse(verdict) };

  return {
    ok: true,
    allowance: {
      plan: verdict.plan ?? "free",
      cap: verdict.cap ?? 0,
      remaining: verdict.remaining ?? 0,
    },
  };
}
