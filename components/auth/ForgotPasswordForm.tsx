"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordResetAction } from "@/app/forgot-password/actions";
import { INITIAL_RESET_REQUEST_STATE } from "@/lib/auth/reset-state";
import TurnstileWidget from "./TurnstileWidget";

/**
 * La demande de réinitialisation.
 *
 * UN CAPTCHA MÊME ICI. Supabase applique sa protection Turnstile à
 * l'endpoint `recover` comme aux autres (Authentication → Attack
 * Protection) : sans jeton, l'appel est refusé. Et c'est tant mieux — un
 * formulaire qui déclenche un envoi d'email à une adresse arbitraire est
 * exactement ce qu'on utilise pour faire envoyer du courrier par quelqu'un
 * d'autre.
 *
 * L'ÉCRAN DE SUCCÈS REMPLACE LE FORMULAIRE. Le laisser en place inviterait à
 * recliquer, ce qui butera sur la limite d'envoi de Supabase (une minute
 * entre deux demandes) et donnera l'impression que la première n'a pas
 * marché. On affiche donc la confirmation seule, avec la marche à suivre.
 */
export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    INITIAL_RESET_REQUEST_STATE
  );

  // Un jeton Turnstile est à usage unique : en redemander un neuf après
  // chaque échec. Ajusté pendant le rendu plutôt que dans un effet — même
  // logique que SignupForm et ResendConfirmationForm.
  const [seenState, setSeenState] = useState(state);
  const [resetSignal, setResetSignal] = useState(0);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") setResetSignal((n) => n + 1);
  }

  if (state.status === "sent") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
          ✓
        </div>
        <h2 className="mt-5 font-display text-xl font-bold">Regarde tes emails</h2>
        <p className="mt-2 font-display text-sm leading-relaxed text-muted">{state.message}</p>
        <Link
          href="/login"
          className="mt-7 block w-full rounded-[10px] border border-border px-4 py-2.5 font-display text-sm font-medium transition-colors hover:border-accent/35 hover:bg-accent/10"
        >
          Revenir à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-display text-sm font-medium text-muted"
        >
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="toi@exemple.fr"
          defaultValue={state.email}
          className="w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <TurnstileWidget action="reset" resetSignal={resetSignal} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn surface-interactive surface-static mt-6 h-12 w-full rounded-xl px-4 font-display text-sm font-semibold disabled:opacity-60"
      >
        <span>{pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}</span>
      </button>

      {state.status === "error" && state.message && (
        <p role="alert" className="mt-3 font-display text-sm text-danger">
          {state.message}
        </p>
      )}

      <p className="mt-6 text-center font-display text-sm text-muted">
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Revenir à la connexion
        </Link>
      </p>
    </form>
  );
}
