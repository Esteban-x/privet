"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import ResendConfirmationForm from "@/components/auth/ResendConfirmationForm";
import TurnstileWidget from "@/components/auth/TurnstileWidget";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/layout/Logo";

// Le lien de confirmation échoué n'est pas toujours une inscription — un
// message "demande une nouvelle confirmation"serait trompeur pour un lien
// de réinitialisation de mot de passe ou de changement d'email.
function confirmErrorMessage(type: string | null): string {
  if (type === "recovery") {
    return "Ce lien de réinitialisation de mot de passe est invalide ou a expiré. Demande-en un nouveau.";
  }
  if (type === "email_change") {
    return "Ce lien de confirmation de changement d'email est invalide ou a expiré. Ton adresse email n'a pas été modifiée.";
  }
  return "Ce lien de confirmation est invalide ou a expiré. Demande-en un nouveau ci-dessous.";
}

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginCard />
    </Suspense>
  );
}

function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "confirm"
      ? confirmErrorMessage(searchParams.get("type"))
      : searchParams.get("error") === "auth"
        ? "La connexion a échoué. Réessaie."
        : null,
  );
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("deleted") === "1" ? "Ton compte a bien été supprimé." : null,
  );
  const [loading, setLoading] = useState<"password" | "google" | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setUnconfirmed(false);

    // Supabase protège aussi la connexion mot de passe (Authentication →
    // Attack Protection), pas seulement l'inscription — sans jeton, la
    // requête est rejetée avant même de vérifier les identifiants.
    if (!captchaToken) {
      setError("Merci de valider le captcha avant de continuer.");
      return;
    }

    setLoading("password");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
        options: { captchaToken },
      });

      if (error) {
        if (error.code === "email_not_confirmed") {
          setUnconfirmed(true);
          setError("Ton compte n'est pas encore confirmé. Ouvre le lien reçu par email.");
        } else if (error.code === "invalid_credentials") {
          setError("Email ou mot de passe incorrect.");
        } else if (error.code === "captcha_failed") {
          setError("Le captcha a expiré ou a échoué. Réessaie.");
        } else {
          setError("La connexion a échoué. Réessaie dans un instant.");
        }
        // Le jeton vient d'être consommé par Supabase, qu'il ait réussi ou
        // non — il en faut un neuf pour la prochaine tentative. On le vide
        // aussi immédiatement (pas seulement le reset du widget, qui est
        // asynchrone) : sinon une resoumission pendant la fenêtre où le
        // widget n'a pas encore renvoyé de jeton frais repartirait avec
        // l'ancien, déjà invalide côté Supabase.
        setCaptchaToken(null);
        setCaptchaResetSignal((n) => n + 1);
        setLoading(null);
        return;
      }

      // Le cookie de session est posé : on recharge pour que le serveur le voie.
      router.push(next);
      router.refresh();
    } catch {
      setError("La connexion a échoué. Réessaie dans un instant.");
      setCaptchaToken(null);
      setCaptchaResetSignal((n) => n + 1);
      setLoading(null);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading("google");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch {
      setError("La connexion avec Google a échoué. Réessaie, ou utilise ton adresse e-mail.");
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-[20px] surface p-8 shadow-float">
        <div className="text-center">
          {/* Le vrai logo, pas un carré bleu portant une lettre : c'est la
              première chose que voit quelqu'un qui arrive sur le site depuis
              un lien, et elle doit dire « russe ». Le halo reprend celui de
              la barre pour que les deux se répondent. */}
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center">
            <Logo size={48} />
          </div>
          <h1 className="font-display text-2xl font-bold">Bienvenue sur Privetik</h1>
          <p className="mt-2 font-display text-sm text-muted">
            Connecte-toi pour sauvegarder ta progression et retrouver tes modules.
          </p>
        </div>

        <form onSubmit={signInWithPassword} className="mt-7 text-left">
          <label
            htmlFor="email"
            className="mb-1.5 block font-display text-sm font-medium text-muted"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="toi@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none"
          />

          {/* Le lien vit SUR LA LIGNE DU CHAMP, pas en bas de carte : on le
              cherche au moment précis où le mot de passe ne revient pas, et
              c'est là que l'œil se trouve. Relégué sous le bouton, il se lit
              après trois tentatives ratées. */}
          <div className="mb-1.5 mt-4 flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="block font-display text-sm font-medium text-muted">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="font-display text-xs font-semibold text-muted transition-colors hover:text-accent"
            >
              Oublié ?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text field-focus focus:outline-none"
          />

          <div className="mt-4">
            <TurnstileWidget
              action="login"
              onToken={setCaptchaToken}
              resetSignal={captchaResetSignal}
            />
          </div>

          <button
            type="submit"
            disabled={loading !== null}
            className="btn surface-interactive surface-static mt-5 h-12 w-full rounded-xl px-4 font-display text-sm font-semibold disabled:opacity-60"
          >
            <span>{loading === "password" ? "Connexion…" : "Se connecter"}</span>
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 font-display text-sm text-danger">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-4 font-display text-sm text-success">
            {notice}
          </p>
        )}
        {unconfirmed && (
          <div className="mt-4">
            <ResendConfirmationForm email={email} />
          </div>
        )}

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-display text-xs text-muted">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading !== null}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-bg px-4 font-display text-sm font-semibold text-text transition-colors hover:bg-accent/10 disabled:opacity-60"
        >
          <GoogleIcon />
          {loading === "google" ? "Redirection…" : "Continuer avec Google"}
        </button>

        <p className="mt-6 text-center font-display text-sm text-muted">
          Pas encore de compte ?{""}
          <Link href="/signup" className="font-semibold text-text hover:text-accent">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

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
