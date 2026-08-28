"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Le bouton d'achat, qui sait où en est le visiteur.
 *
 * TROIS SITUATIONS, TROIS DESTINATIONS : déconnecté → inscription (payer
 * suppose un compte auquel rattacher l'abonnement) ; connecté et gratuit →
 * Stripe Checkout ; déjà abonné → portail de gestion. Un bouton unique qui
 * mènerait toujours au paiement afficherait « s'abonner » à quelqu'un qui
 * l'est déjà — le genre de détail qui fait douter du sérieux d'un site au
 * moment précis où on lui donne sa carte.
 */
export default function PricingCta({
  authenticated,
  isPremium,
  stripeReady,
  granted,
}: {
  authenticated: boolean;
  isPremium: boolean;
  stripeReady: boolean;
  granted: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    if (!authenticated) {
      router.push("/signup?next=/premium");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/${isPremium ? "portal" : "checkout"}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "indisponible");
      window.location.href = data.url;
    } catch {
      setError("Le paiement est momentanément indisponible. Réessaie dans un instant.");
      setPending(false);
    }
  }

  // Un accès offert n'a rien à acheter ni à gérer.
  if (granted) {
    return (
      <p className="rounded-xl border border-success/40 bg-success/10 px-5 py-3.5 text-center font-display text-sm font-semibold text-success">
        Accès complet offert — merci de tester Privetik.
      </p>
    );
  }

  if (!stripeReady) {
    return (
      <p className="rounded-xl border border-border px-5 py-3.5 text-center font-display text-sm text-muted">
        L&apos;abonnement ouvre très bientôt.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={go}
        disabled={pending}
        className="btn btn-primary btn-sheen w-full rounded-xl px-8 py-4 font-display text-base font-bold disabled:opacity-70"
      >
        {pending
          ? "Ouverture…"
          : isPremium
            ? "Gérer mon abonnement"
            : authenticated
              ? "Passer à Privetik Pro"
              : "Créer mon compte"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-center font-display text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
