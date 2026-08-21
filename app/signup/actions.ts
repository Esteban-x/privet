"use server";

import { headers } from "next/headers";
import { createCaptcha, verifyCaptcha } from "@/lib/auth/captcha";
import type { SignupState } from "@/lib/auth/signup-state";
import { normalizeName, validateSignup, type FieldErrors } from "@/lib/auth/validation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Origine de l'app, pour construire le lien de confirmation de l'email. */
async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function signUpAction(
  _previous: SignupState,
  formData: FormData
): Promise<SignupState> {
  const values = {
    firstName: normalizeName(field(formData, "firstName")),
    lastName: normalizeName(field(formData, "lastName")),
    email: field(formData, "email").trim().toLowerCase(),
  };
  const password = field(formData, "password");
  const passwordConfirm = field(formData, "passwordConfirm");

  // Échec ⇒ on renvoie toujours un défi neuf, sinon le formulaire réafficherait
  // une image dont le jeton vient d'être consommé.
  const fail = (errors: FieldErrors, message?: string): SignupState => ({
    status: "error",
    errors,
    message,
    values,
    captcha: createCaptcha(),
  });

  // 1. Captcha d'abord : rien ne sert de valider (ni d'appeler Supabase) si la
  //    requête vient d'un bot.
  if (!verifyCaptcha(field(formData, "captchaToken"), field(formData, "captchaAnswer"))) {
    return fail({ captcha: "Code incorrect ou expiré. Réessaie avec la nouvelle image." });
  }

  // 2. Champs.
  const errors = validateSignup({ ...values, password, passwordConfirm });
  if (Object.keys(errors).length > 0) return fail(errors);

  if (!isSupabaseConfigured()) {
    return fail(
      {},
      "L'authentification n'est pas configurée sur ce serveur (clés Supabase manquantes)."
    );
  }

  // 3. Création du compte. Supabase envoie lui-même l'email de confirmation ;
  //    tant que le lien n'est pas cliqué, aucune session n'est ouverte.
  const supabase = await createClient();
  const origin = await siteOrigin();

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/onboarding")}`,
      data: {
        first_name: values.firstName,
        last_name: values.lastName,
        full_name: `${values.firstName} ${values.lastName}`,
      },
    },
  });

  if (error) {
    const alreadyRegistered =
      error.code === "user_already_exists" || error.status === 422;
    // Si le projet Supabase autorise la divulgation, on reste quand même vague :
    // confirmer qu'une adresse existe permet d'énumérer les comptes.
    if (alreadyRegistered) {
      return { status: "sent", errors: {}, sentTo: values.email, values };
    }
    if (error.code === "over_email_send_rate_limit") {
      return fail({}, "Trop de tentatives. Attends une minute avant de réessayer.");
    }
    if (error.code === "weak_password") {
      return fail({ password: "Ce mot de passe est trop faible. Choisis-en un autre." });
    }
    return fail({}, "L'inscription a échoué. Réessaie dans un instant.");
  }

  // Note : quand l'adresse est déjà prise, Supabase renvoie un utilisateur
  // factice sans identité plutôt qu'une erreur. La réponse ci-dessous est donc
  // identique dans les deux cas — c'est voulu (pas d'énumération de comptes).
  return { status: "sent", errors: {}, sentTo: values.email, values };
}

/** Renvoie l'email de confirmation (lien expiré ou message perdu). */
export async function resendConfirmationAction(
  email: string
): Promise<{ ok: boolean; message: string }> {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned) return { ok: false, message: "Adresse email manquante." };
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "L'authentification n'est pas configurée." };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: cleaned,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/onboarding")}`,
    },
  });

  if (error) {
    return {
      ok: false,
      message:
        error.code === "over_email_send_rate_limit"
          ? "Trop de renvois. Attends une minute."
          : "Le renvoi a échoué. Réessaie dans un instant.",
    };
  }
  return { ok: true, message: "Email renvoyé. Pense à regarder dans les spams." };
}
