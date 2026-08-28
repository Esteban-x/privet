import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, isStripeConfigured, siteUrl } from "@/lib/billing/stripe";

/**
 * Ouvre une session Stripe Checkout pour l'abonnement mensuel.
 *
 * LE PRIX N'EST PAS DANS LE CODE : `STRIPE_PRICE_ID` désigne un tarif créé
 * dans le tableau de bord Stripe. Changer de montant, ajouter une TVA ou
 * une promo se fait donc chez Stripe, sans redéploiement — et l'app ne
 * manipule jamais de somme, ce qui lui évite d'être une source de vérité
 * de plus sur ce que coûte l'abonnement.
 */
export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Paiement non configuré." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, display_name")
    .eq("id", user.id)
    .single();

  try {
    const stripe = getStripe();

    // Un client Stripe par compte, réutilisé : sans ça, deux passages à la
    // caisse créeraient deux clients pour la même personne et le portail
    // n'afficherait qu'un des deux abonnements.
    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: profile?.display_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Écrit avec la clé de service : le trigger `guard_plan_columns`
      // interdit au rôle `authenticated` de toucher aux colonnes
      // d'abonnement, y compris celle-ci — c'est ce qui empêche un
      // utilisateur de se rattacher au client Stripe de quelqu'un d'autre.
      const { error } = await createAdminClient()
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      if (error) console.error("checkout: stripe_customer_id non enregistré", error);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      // Deux façons de retrouver le compte au retour du webhook. La
      // métadonnée sur l'ABONNEMENT est la plus importante : elle voyage
      // avec tous les événements ultérieurs (renouvellement, résiliation),
      // là où client_reference_id ne vit que le temps du paiement.
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${siteUrl()}/account?abonnement=ok`,
      cancel_url: `${siteUrl()}/account?abonnement=annule`,
      allow_promotion_codes: true,
      // Stripe collecte et déclare la TVA à notre place ; à activer dans
      // le tableau de bord (Settings → Tax) pour que ce drapeau serve.
      automatic_tax: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout: échec Stripe", err);
    return NextResponse.json({ error: "Le paiement est indisponible." }, { status: 502 });
  }
}
