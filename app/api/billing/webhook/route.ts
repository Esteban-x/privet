import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Le seul endroit qui accorde ou retire le premium payant.
 *
 * POURQUOI PAS AU RETOUR DU PAIEMENT. `success_url` est une URL que le
 * navigateur suit — donc que n'importe qui peut ouvrir directement. Accorder
 * le premium là reviendrait à l'offrir à qui connaît l'adresse. Ici, c'est
 * Stripe qui appelle, et la signature `stripe-signature` prouve que le
 * message vient bien de lui.
 *
 * IDEMPOTENT PAR CONSTRUCTION. Stripe rejoue un événement tant qu'il n'a pas
 * reçu de 2xx, et peut en livrer plusieurs pour un même changement. Toutes
 * les opérations ci-dessous sont des UPDATE absolus (« mets le plan à X »),
 * jamais des incréments : rejouer n'a aucun effet de bord.
 */

// Node explicitement : la vérification de signature a besoin du corps BRUT
// et du module `crypto`, indisponibles sur le runtime Edge.
export const runtime = "nodejs";

/**
 * Fin de la période payée. Stripe l'a déplacée de l'abonnement vers ses
 * lignes (`items`) dans les versions récentes de l'API ; on lit les deux
 * pour ne pas dépendre de la version configurée sur le compte.
 */
function periodEnd(sub: Stripe.Subscription): string | null {
  const fromItem = sub.items?.data?.[0]?.current_period_end;
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const seconds = fromItem ?? legacy;
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
}

/** Le compte concerné, sans dépendre de l'événement reçu. */
async function resolveUserId(
  db: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription
): Promise<string | null> {
  const fromMetadata = sub.metadata?.supabase_user_id;
  if (fromMetadata) return fromMetadata;

  // Repli : un abonnement créé à la main dans le tableau de bord Stripe
  // n'a pas notre métadonnée. Le client, lui, est toujours rattaché.
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;
  const { data } = await db
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function applySubscription(sub: Stripe.Subscription) {
  const db = createAdminClient();
  const userId = await resolveUserId(db, sub);
  if (!userId) {
    console.error("webhook: abonnement sans compte identifiable", sub.id);
    return;
  }

  // 'trialing' compte comme actif : l'essai Stripe donne un accès complet.
  // 'past_due' aussi — on ne coupe pas l'accès à la première carte
  // refusée, Stripe relance pendant plusieurs jours et coupera lui-même en
  // passant à 'canceled' ou 'unpaid'.
  const active = ["active", "trialing", "past_due"].includes(sub.status);

  const { error } = await db
    .from("profiles")
    .update({
      plan: active ? "premium" : "free",
      plan_source: active ? "stripe" : null,
      // Résiliation programmée : l'accès court jusqu'à la fin de la période
      // déjà payée. L'écrire ici rend l'app juste même si l'événement de
      // fin d'abonnement se perdait — `consume_ai_quota` relit cette date
      // à chaque appel.
      plan_expires_at: active && sub.cancel_at_period_end ? periodEnd(sub) : null,
      stripe_subscription_id: active ? sub.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    // NE RÉTROGRADE QUE DES ABONNÉS. Un bêta-testeur (plan_source = 'grant')
    // qui aurait aussi essayé l'abonnement ne doit pas perdre son accès
    // offert quand cet abonnement se termine.
    .or("plan_source.is.null,plan_source.eq.stripe");

  if (error) console.error("webhook: mise à jour du plan échouée", userId, error);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("webhook: STRIPE_WEBHOOK_SECRET manquant");
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature absente" }, { status: 400 });

  // `req.text()` et non `req.json()` : la signature porte sur les octets
  // exacts du corps. Le reparser puis le resérialiser la casserait.
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    // Signature invalide = message non émis par Stripe. 400 sans détail.
    console.error("webhook: signature invalide", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applySubscription(event.data.object);
        break;

      case "checkout.session.completed": {
        // L'abonnement n'est pas complet dans cet événement — on le
        // recharge pour lire son statut et sa période réels plutôt que de
        // déduire l'accès du seul fait que la caisse s'est fermée.
        const session = event.data.object;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (subId) {
          const sub = await getStripe().subscriptions.retrieve(subId);
          // Un paiement lancé avant que la métadonnée existe (ou repris
          // d'un lien plus ancien) retrouve son compte par ici.
          if (!sub.metadata?.supabase_user_id && session.client_reference_id) {
            sub.metadata = { ...sub.metadata, supabase_user_id: session.client_reference_id };
          }
          await applySubscription(sub);
        }
        break;
      }

      default:
        // Les autres événements ne changent pas l'accès. Un 200 dit à
        // Stripe de ne pas les rejouer.
        break;
    }
  } catch (err) {
    // 500 : Stripe réessaiera. C'est le comportement voulu pour une panne
    // de base — l'inverse (200 silencieux) laisserait un abonné payant
    // sans son accès, sans trace ni nouvelle tentative.
    console.error("webhook: traitement échoué", event.type, err);
    return NextResponse.json({ error: "Traitement échoué" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
