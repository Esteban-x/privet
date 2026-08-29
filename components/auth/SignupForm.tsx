"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpAction } from "@/app/signup/actions";
import { INITIAL_SIGNUP_STATE } from "@/lib/auth/signup-state";
import { PASSWORD_MIN } from "@/lib/auth/validation";
import ResendConfirmationForm from "./ResendConfirmationForm";
import TurnstileWidget from "./TurnstileWidget";
import GoogleButton, { AuthDivider } from "./GoogleButton";
import { MailIcon } from "@/components/ui/icons";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, INITIAL_SIGNUP_STATE);
  const [showPassword, setShowPassword] = useState(false);
  // L'échec OAuth ne passe pas par l'action serveur : il n'a donc pas sa
  // place dans `state.message`, qui est remis à zéro à chaque soumission
  // du formulaire mot de passe et effacerait l'erreur de Google.
  const [oauthError, setOauthError] = useState("");

  // Un jeton Turnstile est à usage unique : après chaque échec, le widget doit
  // en redemander un neuf. Ajusté pendant le rendu (plutôt que dans un effet)
  // en comparant à l'état précédemment vu, pour ne pas déclencher de rendu
  // intermédiaire périmé.
  const [seenState, setSeenState] = useState(state);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") setCaptchaResetSignal((n) => n + 1);
  }

  if (state.status === "sent") {
    return <ConfirmationSent email={state.sentTo ?? state.values.email} />;
  }

  return (
    <>
      {/* GOOGLE AVANT LE FORMULAIRE, ET C'EST L'INVERSE DE LA CONNEXION.
          Là-bas, deux champs séparent le haut de la page du bouton ; ici
          il y en a cinq plus un captcha. Placé en dessous, le chemin en un
          clic ne se découvrirait qu'après avoir lu — ou pire, rempli —
          celui qui en demande six. L'ordre à l'écran doit être l'ordre du
          moindre effort, pas l'ordre d'implémentation.

          Google n'a pas de « s'inscrire » distinct de « se connecter » :
          c'est le même appel, le compte est créé au premier retour. Seul
          le libellé change, pour tenir la promesse de la page. */}
      <GoogleButton next="/dashboard" label="S'inscrire avec Google" onError={setOauthError} />
      {oauthError && (
        <p
          role="alert"
          className="mt-3 rounded-[10px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 font-display text-sm text-danger"
        >
          {oauthError}
        </p>
      )}

      <AuthDivider />

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
          <TurnstileWidget action="signup" resetSignal={captchaResetSignal} />
          {state.errors.captcha && (
            <p role="alert" className="mt-1.5 font-display text-xs text-danger">
              {state.errors.captcha}
            </p>
          )}
        </div>

        {state.message && (
          <p
            role="alert"
            className="mt-4 rounded-[10px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 font-display text-sm text-danger"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn surface-interactive surface-static mt-6 h-12 w-full rounded-xl px-4 font-display text-sm font-semibold disabled:opacity-60"
        >
          <span>{pending ? "Création du compte…" : "Créer mon compte"}</span>
        </button>

        <p className="mt-5 text-center font-display text-sm text-muted">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-semibold ml-2 text-text hover:text-accent-ink">
            Se connecter
          </Link>
        </p>
      </form>
    </>
  );
}

// ─── Écran de succès ────────────────────────────────────────────────

function ConfirmationSent({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success">
        <MailIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-display text-xl font-bold">Vérifie ta boîte mail</h2>
      <p className="mt-2 font-display text-sm text-muted">
        Un lien de confirmation a été envoyé à{" "}
        <span className="font-semibold text-text">{email}</span>. Clique dessus pour activer ton
        compte — tu ne pourras pas te connecter avant.
      </p>
      <p className="mt-3 font-display text-xs text-muted">
        Rien reçu au bout de deux minutes ? Regarde dans les spams.
      </p>

      <div className="mt-5">
        <ResendConfirmationForm email={email} />
      </div>

      <p className="mt-6 font-display text-sm text-muted">
        <Link href="/login" className="font-semibold text-text hover:text-accent-ink">
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
      <label htmlFor={name} className="mb-1.5 block font-display text-sm font-medium text-muted">
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
        className={`w-full rounded-[10px] border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none ${
          error ? "border-danger focus:border-danger" : "border-border"
        }`}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 font-display text-xs text-danger">
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
