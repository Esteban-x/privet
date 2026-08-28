import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured, siteUrl } from "@/lib/billing/stripe";

/**
 * Le portail client Stripe : changer de carte, voir ses factures, résilier.
 *
 * POURQUOI NE RIEN RÉIMPLÉMENTER. Une résiliation maison devrait gérer le
 * prorata, les échecs de paiement, les relances, les factures et la
 * conformité — Stripe le fait déjà, et sa page est la seule à rester juste
 * quand ces règles changent. On ne code donc que la redirection.
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
    .select("stripe_customer_id, plan_source")
    .eq("id", user.id)
    .single();

  // Un bêta-testeur ou un compte offert (plan_source = 'grant') n'a pas de
  // client Stripe : le portail n'aurait rien à lui montrer.
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "Aucun abonnement à gérer." }, { status: 400 });
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl()}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("portal: échec Stripe", err);
    return NextResponse.json({ error: "Portail indisponible." }, { status: 502 });
  }
}
