import type { PlanId } from "./plans";

/**
 * Ce qu'on dit à l'apprenant quand un plafond tombe.
 *
 * POURQUOI UN MODULE À PART, PLUTÔT QUE DANS lib/ai/quota.ts. Ces phrases
 * ont deux émetteurs. Le serveur les met dans son 429 (le mur qu'on ne
 * franchit pas). Le client les affiche AUSSI par anticipation : quand la
 * dernière réponse acceptée annonce « il t'en restait zéro », l'écran
 * suivant est l'abonnement, sans qu'une 21e requête ait besoin d'être
 * refusée pour l'apprendre. Sans ce module commun, la même limite se serait
 * annoncée avec deux formulations, selon qu'on l'a devancée ou heurtée.
 *
 * Ce fichier est PUR (aucun import serveur) : il est importé des deux côtés.
 */

/** Le nom que l'apprenant donne à ce qu'il vient d'épuiser. */
const NOUN: Record<string, { plural: string; verb: string }> = {
  practice: { plural: "exercices", verb: "t'entraîner" },
  vocab_review: { plural: "révisions", verb: "réviser" },
};

export function quotaMessage(verdict: {
  reason?: string;
  plan?: PlanId;
  feature?: string;
  cap?: number;
}): string {
  const noun = verdict.feature ? NOUN[verdict.feature] : undefined;

  switch (verdict.reason) {
    case "not_included":
      // À UN ABONNÉ, CETTE PHRASE EST UN MENSONGE. `not_included` ne peut
      // lui arriver que si `plan_limits` n'a pas de ligne pour ce couple
      // (plan, fonctionnalité) — c'est-à-dire une migration non appliquée,
      // pas une limite commerciale. C'est arrivé en production : le compte
      // premier de cordée lisait « fait partie de l'abonnement » alors
      // qu'il payait, sur des exercices que rien n'a jamais restreints.
      return verdict.plan === "premium"
        ? "Cette fonctionnalité est momentanément indisponible."
        : "Cette fonctionnalité fait partie de l'abonnement.";
    case "burst":
      return "Trop de demandes d'affilée. Réessaie dans une minute.";
    case "daily":
      // Les postes chiffrables (exercices, révisions) annoncent LE CHIFFRE.
      // « Plafond quotidien atteint » laisse croire à une limite arbitraire
      // qu'on vient de heurter par malchance ; « tes 20 exercices du jour »
      // dit que la journée gratuite a été utilisée en entier, ce qui est à
      // la fois plus juste et la seule version qui donne envie de s'abonner.
      if (noun && verdict.cap) {
        return verdict.plan === "free"
          ? `Tu as fait tes ${verdict.cap} ${noun.plural} du jour. Reviens demain, ou passe à l'abonnement pour ${noun.verb} sans compter.`
          : `Plafond quotidien atteint (${verdict.cap} ${noun.plural}). Il se réinitialise cette nuit.`;
      }
      return verdict.plan === "free"
        ? "Tu as utilisé ta découverte du jour. Reviens demain, ou passe à l'abonnement."
        : "Plafond quotidien atteint. Il se réinitialise cette nuit.";
    case "monthly":
      return "Plafond mensuel atteint.";
    case "lifetime":
      return "Tu as utilisé toute ta découverte. L'abonnement débloque le reste.";
    case "unavailable":
      return "Fonctionnalité momentanément indisponible.";
    default:
      return "Quota atteint.";
  }
}
