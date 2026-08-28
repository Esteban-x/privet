/**
 * Le refus de quota, côté navigateur.
 *
 * POURQUOI UN TYPE D'ERREUR DÉDIÉ. Sans lui, un `catch` ne peut que
 * comparer des chaînes de messages pour deviner s'il a affaire à une panne
 * ou à un plafond atteint — et les deux méritent des écrans opposés : une
 * panne appelle « réessayer », un plafond appelle « voici l'abonnement ».
 * Confondre les deux, c'est soit proposer de réessayer indéfiniment quelque
 * chose qui ne passera pas, soit accuser l'app d'être en panne alors
 * qu'elle fonctionne exactement comme prévu.
 *
 * Le pendant serveur est `quotaDeniedResponse` (lib/ai/quota.ts), qui
 * produit le 429 et la charge utile lue ici.
 */

import { quotaMessage } from "./quota-messages";

export interface QuotaInfo {
  reason: "not_included" | "burst" | "daily" | "monthly" | "lifetime" | "unavailable";
  plan: "free" | "premium";
  feature?: string;
  cap?: number;
  used?: number;
  /** Vrai quand l'abonnement lève réellement la limite — pas pour une rafale. */
  upgrade: boolean;
}

export class QuotaError extends Error {
  readonly quota: QuotaInfo;

  constructor(message: string, quota: QuotaInfo) {
    super(message);
    this.name = "QuotaError";
    this.quota = quota;
  }
}

export function isQuotaError(err: unknown): err is QuotaError {
  return err instanceof QuotaError;
}

/**
 * Le refus, construit d'avance plutôt que subi.
 *
 * POURQUOI DEVANCER LE 429. Les routes de pratique renvoient, avec chaque
 * verdict accepté, ce qu'il reste au compteur. Quand ce reste tombe à zéro,
 * l'app le sait AVANT que l'apprenant ne clique « Suivant » : lui servir un
 * 21e exercice pour le lui refuser une fois répondu serait lui faire perdre
 * son travail, et lui apprendre la limite au pire moment. Il voit donc
 * l'écran d'abonnement à la place de l'exercice suivant.
 *
 * Le message vient du module commun aux deux côtés (quota-messages), pour
 * que la limite devancée et la limite heurtée se disent avec les mêmes mots.
 */
export function exhaustedQuota(
  feature: string,
  plan: "free" | "premium",
  cap: number
): { quota: QuotaInfo; message: string } {
  const quota: QuotaInfo = {
    reason: "daily",
    plan,
    feature,
    cap,
    used: cap,
    upgrade: plan === "free",
  };
  return { quota, message: quotaMessage(quota) };
}

/**
 * Reconnaît un refus de quota dans une réponse HTTP.
 *
 * À appeler AVANT toute autre gestion d'erreur : un 429 est une réponse
 * parfaitement normale ici, pas un incident.
 */
export function quotaErrorFrom(res: Response, body: unknown): QuotaError | null {
  if (res.status !== 429) return null;
  const data = body as { error?: unknown; quota?: Partial<QuotaInfo> };
  if (!data?.quota) return null;
  return new QuotaError(
    typeof data.error === "string" ? data.error : "Quota atteint.",
    {
      reason: data.quota.reason ?? "daily",
      plan: data.quota.plan ?? "free",
      feature: data.quota.feature,
      cap: data.quota.cap,
      used: data.quota.used,
      upgrade: data.quota.upgrade === true,
    }
  );
}
