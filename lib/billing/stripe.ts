import Stripe from "stripe";

/**
 * Client Stripe, côté serveur uniquement.
 *
 * Instancié paresseusement, comme le client Anthropic : l'app doit pouvoir
 * démarrer et servir les cours, les exercices et le vocabulaire même sans
 * clé Stripe configurée — seule la page d'abonnement en dépend.
 */
let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante. Voir .env.local.");
  }
  if (!stripe) {
    // Pas de `apiVersion` figée ici : la version du compte Stripe fait foi,
    // ce qui évite qu'une mise à jour du paquet npm change silencieusement
    // le format des objets reçus par le webhook.
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

/** L'app, vue depuis Stripe (retours de paiement, portail client). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
