"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// `scope: "global"` révoque toutes les sessions du compte (autres
// navigateurs, autres appareils) — pas seulement celle de l'onglet courant.
export default function SecurityActions() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOutEverywhere() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      router.push("/login");
      router.refresh();
    } catch {
      setError("Échec de la déconnexion globale. Réessaie.");
      setPending(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-border bg-bg2 p-6">
      <h2 className="font-display text-lg font-bold">Sécurité</h2>
      <p className="mt-1 font-display text-sm text-muted">
        Termine toutes les sessions actives (autres navigateurs, autres
        appareils) — utile si tu penses qu&apos;un accès t&apos;a échappé.
      </p>
      <button
        onClick={signOutEverywhere}
        disabled={pending}
        className="mt-4 rounded-[10px] border border-border px-5 py-2.5 font-display text-sm font-semibold text-text transition-colors hover:border-accent disabled:opacity-60"
      >
        {pending ? "Déconnexion…" : "Se déconnecter de tous les appareils"}
      </button>
      {error && (
        <p role="alert" className="mt-3 font-display text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
