"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * « Continuer avec Google », pour la connexion comme pour l'inscription.
 *
 * POURQUOI UN COMPOSANT ET NON UN COPIER-COLLER. Le bouton existait dans
 * LoginForm ; l'inscription en avait besoin à l'identique. Recopier
 * l'appel OAuth aurait mis DEUX `redirectTo` dans le code — et c'est
 * exactement le genre de valeur qui se désynchronise en silence : une URL
 * de retour qui diverge ne casse rien au build, elle casse une connexion
 * sur deux, en production, sans erreur lisible.
 *
 * IL N'Y A QU'UN SEUL FLUX, PAS UN POUR CHAQUE PAGE. Google ne distingue
 * pas « se connecter » de « s'inscrire » : le compte est créé au premier
 * retour s'il n'existe pas. Seul le LIBELLÉ change, parce que la promesse
 * faite à l'écran change — et `app/auth/callback/route.ts` envoie de
 * toute façon vers /onboarding tant que le profil n'est pas complété,
 * quel que soit le `next` demandé ici.
 *
 * PAS DE CAPTCHA ICI, contrairement aux formulaires mot de passe : le
 * jeton Turnstile est vérifié par Supabase sur `signInWithPassword` et
 * `signUp`, pas sur `signInWithOAuth` — c'est Google qui tient le rôle de
 * preuve d'humanité sur ce chemin.
 */
export default function GoogleButton({
  next = "/dashboard",
  label = "Continuer avec Google",
  disabled = false,
  onError,
  onPending,
}: {
  /** Où atterrir une fois la session posée, si l'onboarding est déjà fait. */
  next?: string;
  label?: string;
  /** Vrai pendant qu'un autre moyen de connexion est en cours. */
  disabled?: boolean;
  onError?: (message: string) => void;
  /** Laisse la page parente neutraliser ses propres boutons. */
  onPending?: (pending: boolean) => void;
}) {
  const [redirecting, setRedirecting] = useState(false);

  async function signInWithGoogle() {
    onError?.("");
    setRedirecting(true);
    onPending?.(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      // Succès : le navigateur part chez Google. On NE remet PAS
      // `redirecting` à faux — la page est en train de disparaître, et
      // rendre le bouton à nouveau cliquable pendant ce laps de temps ne
      // ferait qu'ouvrir une seconde redirection concurrente.
    } catch {
      onError?.("La connexion avec Google a échoué. Réessaie, ou utilise ton adresse e-mail.");
      setRedirecting(false);
      onPending?.(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={disabled || redirecting}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-bg px-4 font-display text-sm font-semibold text-text transition-colors hover:bg-accent/10 disabled:opacity-60"
    >
      <GoogleIcon />
      {redirecting ? "Redirection…" : label}
    </button>
  );
}

/** Le « G » officiel, en quatre chemins — aucune dépendance à charger. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

/** Le séparateur « ou » qui accompagne toujours ce bouton. */
export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="font-display text-xs text-muted">ou</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
