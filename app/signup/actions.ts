"use server";

import { headers } from "next/headers";
import type { ResendState, SignupState } from "@/lib/auth/signup-state";
import { TURNSTILE_FIELD } from "@/lib/auth/turnstile";
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
  const captchaToken = field(formData, TURNSTILE_FIELD);

  const fail = (errors: FieldErrors, message?: string): SignupState => ({
    status: "error",
    errors,
    message,
    values,
  });

  // Le widget n'a peut-être pas fini de se résoudre (JS lent, bloqueur...).
  if (!captchaToken) {
    return fail({ captcha: "Merci de valider le captcha avant de continuer." });
  }

  const errors = validateSignup({ ...values, password, passwordConfirm });
  if (Object.keys(errors).length > 0) return fail(errors);

  if (!isSupabaseConfigured()) {
    return fail(
      {},
      "L'authentification n'est pas configurée sur ce serveur (clés Supabase manquantes)."
    );
  }

  // Création du compte. Supabase vérifie lui-même `captchaToken` auprès de
  // Cloudflare (Authentication → Attack Protection) avant de créer quoi que ce
  // soit, puis envoie l'email de confirmation ; tant que le lien n'est pas
  // cliqué, aucune session n'est ouverte.
  const supabase = await createClient();
  const origin = await siteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: {
      captchaToken,
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/onboarding")}`,
      data: {
        first_name: values.firstName,
        last_name: values.lastName,
        full_name: `${values.firstName} ${values.lastName}`,
      },
    },
  });

  if (error) {
    // Uniquement sur ce code précis — le statut HTTP 422 seul ne suffit pas,
    // GoTrue l'utilise aussi pour weak_password, validation_failed, etc.
    if (error.code === "user_already_exists") {
      return fail({ email: "Cette adresse email est déjà utilisée. Connecte-toi plutôt." });
    }
    if (error.code === "captcha_failed") {
      // Le jeton Turnstile est à usage unique : celui-ci vient d'être
      // consommé par la vérification, qu'elle ait réussi ou non.
      return fail({ captcha: "Le captcha a expiré ou a échoué. Réessaie." });
    }
    if (error.code === "over_email_send_rate_limit") {
      return fail({}, "Trop de tentatives. Attends une minute avant de réessayer.");
    }
    if (error.code === "weak_password") {
      return fail({ password: "Ce mot de passe est trop faible. Choisis-en un autre." });
    }
    if (error.code === "email_address_invalid") {
      return fail({ email: "Cette adresse email est refusée par le serveur." });
    }
    // L'ENVOI DE L'EMAIL A ÉCHOUÉ, ET CE N'EST PAS LA FAUTE DU VISITEUR.
    //
    // GoTrue répond une 500 quand le serveur SMTP refuse le message : clé
    // Resend invalide, domaine d'envoi non vérifié, expéditeur hors du
    // domaine autorisé. Le code renvoyé est `unexpected_failure`, qui
    // tomberait sans ça dans la branche générique — laquelle dit « réessaie
    // dans un instant ». C'est un mauvais conseil : réessayer ne répare pas
    // une configuration SMTP, et le visiteur recommence en boucle en croyant
    // que ça vient de lui.
    //
    // On le distingue donc, et on le dit franchement. Le compte, lui, a pu
    // être créé côté Supabase malgré l'échec de l'email : renvoyer le
    // visiteur vers l'inscription le ferait buter sur « adresse déjà
    // utilisée », d'où la mention de la page de renvoi de confirmation.
    const smtpFailed =
      error.code === "error_sending_confirmation_email" ||
      (error.status === 500 && /sending.*email/i.test(error.message ?? ""));

    if (smtpFailed) {
      console.error("[signup] envoi de l'email de confirmation refusé par le SMTP :", {
        code: error.code,
        status: error.status,
        message: error.message,
      });
      return fail(
        {},
        "Ton compte a peut-être été créé, mais l'email de confirmation n'a pas pu partir — " +
          "c'est un problème de notre côté, pas du tien. Réessaie plus tard, ou demande un " +
          "nouvel envoi depuis la page de renvoi de confirmation."
      );
    }

    // Code non prévu ci-dessus : on logue le détail côté serveur (jamais
    // exposé au client) pour pouvoir diagnostiquer, et on affiche un message
    // générique.
    console.error("[signup] échec Supabase non géré :", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return fail({}, "L'inscription a échoué. Réessaie dans un instant.");
  }

  // Selon la config du projet, une adresse déjà prise ne renvoie pas toujours
  // une erreur : GoTrue peut répondre 200 avec un utilisateur "obfusqué" —
  // reconnaissable à `identities` vide (aucune identité créée, puisque le
  // compte en avait déjà une).
  if (data.user && data.user.identities?.length === 0) {
    return fail({ email: "Cette adresse email est déjà utilisée. Connecte-toi plutôt." });
  }

  return { status: "sent", errors: {}, sentTo: values.email, values };
}

/** Renvoie l'email de confirmation (lien expiré ou message perdu). */
export async function resendConfirmationAction(
  _previous: ResendState,
  formData: FormData
): Promise<ResendState> {
  const email = field(formData, "email").trim().toLowerCase();
  const captchaToken = field(formData, TURNSTILE_FIELD);

  if (!email) return { status: "error", message: "Adresse email manquante." };
  // Supabase protège aussi cet endpoint (Authentication → Attack Protection) :
  // sans jeton, il refuse la requête avant même de vérifier l'email.
  if (!captchaToken) {
    return { status: "error", message: "Merci de valider le captcha avant de continuer." };
  }
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "L'authentification n'est pas configurée." };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      captchaToken,
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/onboarding")}`,
    },
  });

  if (error) {
    if (error.code === "captcha_failed") {
      return { status: "error", message: "Le captcha a expiré ou a échoué. Réessaie." };
    }
    if (error.code === "over_email_send_rate_limit") {
      return { status: "error", message: "Trop de renvois. Attends une minute." };
    }
    // Même distinction qu'à l'inscription : un refus du serveur SMTP n'est pas
    // un incident passager, et inviter à réessayer fait tourner le visiteur
    // en rond. Voir la note dans signUpAction.
    if (
      error.code === "error_sending_confirmation_email" ||
      (error.status === 500 && /sending.*email/i.test(error.message ?? ""))
    ) {
      console.error("[resend] envoi refusé par le SMTP :", {
        code: error.code,
        status: error.status,
        message: error.message,
      });
      return {
        status: "error",
        message:
          "L'email n'a pas pu partir — c'est un problème de notre côté. " +
          "Réessaie plus tard, le compte est intact.",
      };
    }
    console.error("[resend] échec Supabase non géré :", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return { status: "error", message: "Le renvoi a échoué. Réessaie dans un instant." };
  }
  return { status: "sent", message: "Email renvoyé. Pense à regarder dans les spams." };
}
