"use client";

import { useActionState, useState } from "react";
import { resendConfirmationAction } from "@/app/signup/actions";
import { INITIAL_RESEND_STATE } from "@/lib/auth/signup-state";
import TurnstileWidget from "./TurnstileWidget";

// Renvoyer l'email de confirmation passe par ce même endpoint Supabase que
// l'inscription (`auth.resend`), donc par la même exigence de captcha
// (Authentication → Attack Protection) — d'où son propre widget, distinct de
// celui du formulaire d'inscription. Partagé entre l'écran post-inscription
// (SignupForm) et le message "compte non confirmé" de /login.
export default function ResendConfirmationForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    resendConfirmationAction,
    INITIAL_RESEND_STATE
  );

  // Un jeton Turnstile est à usage unique : redemande-en un neuf après chaque
  // échec. Ajusté pendant le rendu plutôt que dans un effet — voir
  // SignupForm.tsx pour la même logique commentée en détail.
  const [seenState, setSeenState] = useState(state);
  const [resetSignal, setResetSignal] = useState(0);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") setResetSignal((n) => n + 1);
  }

  return (
    <form action={formAction} className="text-left">
      <input type="hidden" name="email" value={email} />

      <TurnstileWidget action="resend" resetSignal={resetSignal} />

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-[10px] border border-border px-4 py-2.5 font-display text-sm font-medium text-text transition-colors hover:border-accent disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Renvoyer l'email de confirmation"}
      </button>

      {state.message && (
        <p
          role="status"
          className={`mt-3 font-display text-sm ${
            state.status === "sent" ? "text-success" : "text-danger"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
