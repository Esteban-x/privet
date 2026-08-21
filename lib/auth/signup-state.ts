import type { CaptchaChallenge } from "./captcha";
import type { FieldErrors } from "./validation";

// État partagé entre l'action serveur et le formulaire (`useActionState`).
// Il vit ici plutôt que dans `app/signup/actions.ts` : un module `"use server"`
// ne peut exporter que des fonctions async.

export interface SignupState {
  status: "idle" | "error" | "sent";
  /** Erreurs par champ, affichées sous chaque input. */
  errors: FieldErrors;
  /** Message global (échec réseau, config manquante…). */
  message?: string;
  /** Email auquel la confirmation a été envoyée, pour l'écran de succès. */
  sentTo?: string;
  /** Valeurs à réafficher après un échec — jamais les mots de passe. */
  values: { firstName: string; lastName: string; email: string };
  /** Défi frais : celui qui vient d'être soumis n'est plus réutilisable. */
  captcha?: CaptchaChallenge;
}

export const INITIAL_SIGNUP_STATE: SignupState = {
  status: "idle",
  errors: {},
  values: { firstName: "", lastName: "", email: "" },
};
