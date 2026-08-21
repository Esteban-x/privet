"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { resendConfirmationAction, signUpAction } from "@/app/signup/actions";
import type { CaptchaChallenge } from "@/lib/auth/captcha";
import { INITIAL_SIGNUP_STATE } from "@/lib/auth/signup-state";
import { PASSWORD_MIN } from "@/lib/auth/validation";
import CaptchaField from "./CaptchaField";

export default function SignupForm({ captcha }: { captcha: CaptchaChallenge }) {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    INITIAL_SIGNUP_STATE
  );
  const [showPassword, setShowPassword] = useState(false);

  if (state.status === "sent") {
    return <ConfirmationSent email={state.sentTo ?? state.values.email} />;
  }

  return (
    <form action={formAction} className="text-left" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Field
          name="firstName"
          label="Prénom"
          autoComplete="given-name"
          defaultValue={state.values.firstName}
          error={state.errors.firstName}
          required
        />
        <Field
          name="lastName"
          label="Nom de famille"
          autoComplete="family-name"
          defaultValue={state.values.lastName}
          error={state.errors.lastName}
          required
        />
      </div>

      <div className="mt-4">
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="toi@exemple.fr"
          defaultValue={state.values.email}
          error={state.errors.email}
          required
        />
      </div>

      <div className="mt-4">
        <Field
          name="password"
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          error={state.errors.password}
          hint={`${PASSWORD_MIN} caractères minimum, avec au moins une lettre et un chiffre.`}
          required
        />
      </div>

      <div className="mt-4">
        <Field
          name="passwordConfirm"
          label="Confirme le mot de passe"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          error={state.errors.passwordConfirm}
          required
        />
      </div>

      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="mt-2 font-display text-xs text-muted transition-colors hover:text-text"
      >
        {showPassword ? "Masquer les mots de passe" : "Afficher les mots de passe"}
      </button>

      <div className="mt-5">
        <CaptchaField
          initial={captcha}
          replacement={state.captcha}
          error={state.errors.captcha}
        />
      </div>

      {state.message && (
        <p
          role="alert"
          className="mt-4 rounded-[10px] border border-accent2/40 bg-accent2/10 px-3.5 py-2.5 font-display text-sm text-accent2"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-[10px] bg-accent px-4 py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Création du compte…" : "Créer mon compte"}
      </button>

      <p className="mt-5 text-center font-display text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold text-text hover:text-accent">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

// ─── Écran de succès ────────────────────────────────────────────────

function ConfirmationSent({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function resend() {
    startTransition(async () => {
      setFeedback(await resendConfirmationAction(email));
    });
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-2xl">
        ✉️
      </div>
      <h2 className="mt-5 font-display text-xl font-bold">Vérifie ta boîte mail</h2>
      <p className="mt-2 font-display text-sm text-muted">
        Un lien de confirmation a été envoyé à{" "}
        <span className="font-semibold text-text">{email}</span>. Clique dessus pour
        activer ton compte — tu ne pourras pas te connecter avant.
      </p>
      <p className="mt-3 font-display text-xs text-muted">
        Rien reçu au bout de deux minutes ? Regarde dans les spams.
      </p>

      <button
        onClick={resend}
        disabled={pending}
        className="mt-5 rounded-[10px] border border-border px-4 py-2.5 font-display text-sm font-medium text-text transition-colors hover:border-accent disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Renvoyer l'email"}
      </button>

      {feedback && (
        <p
          role="status"
          className={`mt-3 font-display text-sm ${feedback.ok ? "text-success" : "text-accent2"}`}
        >
          {feedback.message}
        </p>
      )}

      <p className="mt-6 font-display text-sm text-muted">
        <Link href="/login" className="font-semibold text-text hover:text-accent">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}

// ─── Champ générique ────────────────────────────────────────────────

interface FieldProps {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
  error,
  hint,
  required,
}: FieldProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block font-display text-sm font-medium text-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full rounded-[10px] border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 focus:outline-none ${
          error ? "border-accent2 focus:border-accent2" : "border-border focus:border-accent"
        }`}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 font-display text-xs text-accent2">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1.5 font-display text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
