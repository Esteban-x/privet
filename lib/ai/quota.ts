import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanId, UsageFeature } from "@/lib/billing/plans";
import { quotaMessage } from "@/lib/billing/quota-messages";

/**
 * Le péage devant chaque action décomptée : un appel Anthropic, un exercice
 * corrigé, une carte de vocabulaire notée.
 *
 * TOUT LE TRAVAIL EST FAIT EN SQL (`consume_ai_quota`), pas ici. Un
 * lire-puis-écrire depuis la route laisserait une fenêtre entre le
 * `select count` et l'`update` : vingt requêtes lancées en parallèle
 * liraient toutes le même compteur et passeraient toutes — précisément le
 * scénario contre lequel on se protège. La fonction SQL pose un verrou de
 * ligne qui sérialise les appels concurrents d'un même utilisateur.
 *
 * CE FICHIER NE DÉCIDE DONC RIEN : il transporte un verdict et le traduit
 * en réponse HTTP.
 */

export type QuotaReason =
  | "unauthenticated"
  | "not_included"  // fonctionnalité absente du plan (ex. IA en gratuit)
  | "burst"         // trop d'appels dans la minute
  | "daily"
  | "monthly"
  | "lifetime"
  | "unavailable";  // la fonction SQL elle-même a échoué

export interface QuotaVerdict {
  allowed: boolean;
  reason?: QuotaReason;
  plan?: PlanId;
  feature?: UsageFeature;
  cap?: number;
  used?: number;
  remaining?: number;
  retryAfter?: number;
}

type Db = SupabaseClient;

/**
 * Réserve un appel, ou le refuse. À appeler APRÈS le contrôle
 * d'authentification et APRÈS tout chemin gratuit (cache en base, banque
 * curée, heuristique locale) : un mot déjà expliqué ou déjà présent dans
 * la banque ne doit rien consommer.
 */
export async function consumeQuota(supabase: Db, feature: UsageFeature): Promise<QuotaVerdict> {
  const { data, error } = await supabase.rpc("consume_ai_quota", { p_feature: feature });

  if (error) {
    // ÉCHEC FERMÉ, volontairement. La fonction manquante (migration pas
    // encore appliquée) ou la base injoignable sont exactement les
    // moments où un abus passerait inaperçu. Le coût d'un refus est une
    // fonctionnalité indisponible quelques minutes ; le coût d'un
    // laissez-passer est le plafond de dépense mensuel de l'organisation.
    // Le workflow de migrations applique la base AVANT l'application
    // (.github/workflows/migrations.yml), donc l'ordre est déjà le bon.
    console.error("quota: consume_ai_quota indisponible", feature, error);
    return { allowed: false, reason: "unavailable", feature };
  }

  const verdict = (data ?? {}) as Record<string, unknown>;
  return {
    allowed: verdict.allowed === true,
    reason: verdict.reason as QuotaReason | undefined,
    plan: verdict.plan as PlanId | undefined,
    feature,
    cap: typeof verdict.cap === "number" ? verdict.cap : undefined,
    used: typeof verdict.used === "number" ? verdict.used : undefined,
    remaining: typeof verdict.remaining === "number" ? verdict.remaining : undefined,
    retryAfter: typeof verdict.retry_after === "number" ? verdict.retry_after : undefined,
  };
}

/**
 * Le coût réel de l'appel, enregistré après coup.
 *
 * N'influence aucun quota — c'est de la MESURE. Sans elle on ne saurait
 * jamais si les plafonds de `plan_limits` sont au bon endroit : on
 * continuerait à raisonner sur des estimations. Un échec est silencieux :
 * ne pas savoir compter ne justifie pas de priver l'utilisateur de ce
 * qu'il vient d'obtenir.
 */
export async function recordTokens(
  supabase: Db,
  feature: UsageFeature,
  usage: { input_tokens?: number; output_tokens?: number } | null | undefined
): Promise<void> {
  if (!usage) return;
  const { error } = await supabase.rpc("record_ai_tokens", {
    p_feature: feature,
    p_input: usage.input_tokens ?? 0,
    p_output: usage.output_tokens ?? 0,
  });
  if (error) console.error("quota: record_ai_tokens a échoué", feature, error);
}

/**
 * Rend un appel qui n'a rien produit.
 *
 * Le quota se prend AVANT l'appel au modèle — c'est la seule façon
 * d'empêcher vingt requêtes parallèles de passer ensemble. Mais un appel
 * qui échoue n'a rien donné à l'apprenant : sur le plan gratuit, qui n'a
 * que deux textes de lecture à vie, lui en facturer un pour une panne
 * serait une façon sûre de le perdre. À n'appeler que sur les chemins où
 * RIEN n'a été rendu.
 */
export async function refundQuota(supabase: Db, feature: UsageFeature): Promise<void> {
  const { error } = await supabase.rpc("refund_ai_quota", { p_feature: feature });
  if (error) console.error("quota: refund_ai_quota a échoué", feature, error);
}

/**
 * La réponse à renvoyer sur refus.
 *
 * 429 plutôt que 402 : c'est un plafond d'usage, pas un mur de paiement —
 * même un abonné peut le rencontrer. `upgrade` dit à l'interface s'il faut
 * proposer l'abonnement ou seulement patienter, ce qui évite au client de
 * réinterpréter `reason` lui-même.
 *
 * CE REFUS NE DOIT JAMAIS CASSER L'APP. Cinq des sept routes ont un repli
 * local (gabarit fixe, banque curée, heuristique, verdict déterministe) et
 * n'appellent donc pas cette fonction : elles dégradent en silence. Seules
 * la lecture et l'explication de mot, qui n'ont pas d'équivalent hors IA,
 * remontent le refus jusqu'à l'écran.
 */
export function quotaDeniedResponse(verdict: QuotaVerdict): NextResponse {
  return NextResponse.json(
    {
      error: quotaMessage(verdict),
      quota: {
        reason: verdict.reason ?? "daily",
        plan: verdict.plan ?? "free",
        feature: verdict.feature,
        cap: verdict.cap,
        used: verdict.used,
        // L'ABONNEMENT LÈVE-T-IL VRAIMENT CETTE LIMITE ? C'est la seule
        // question, et « plan gratuit » n'y répond pas à lui seul. Une
        // rafale retombe en une minute, et `unavailable` est une PANNE de
        // la base — y proposer de payer serait malhonnête, et c'est
        // pourtant ce qui arrivait : `plan` n'est pas renseigné sur ce
        // chemin, donc le `?? "free"` ci-dessus le faisait passer pour un
        // compte gratuit et le bouton s'affichait sur une panne serveur.
        upgrade:
          (verdict.plan ?? "free") === "free" &&
          (verdict.reason === "not_included" ||
            verdict.reason === "daily" ||
            verdict.reason === "monthly" ||
            verdict.reason === "lifetime"),
      },
    },
    {
      status: 429,
      headers: verdict.retryAfter ? { "retry-after": String(verdict.retryAfter) } : undefined,
    }
  );
}
