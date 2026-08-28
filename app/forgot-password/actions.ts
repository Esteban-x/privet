"use server";

import { headers } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { TURNSTILE_FIELD } from "@/lib/auth/turnstile";
import type { ResetRequestState } from "@/lib/auth/reset-state";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Origine de l'app, pour construire le lien de réinitialisation.
 *
 * Même logique que dans app/signup/actions.ts : la variable d'abord, les
 * en-têtes de la requête en repli. Le lien part par email et sera ouvert
 * dans un autre contexte — il ne peut donc pas être relatif.
 */
async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

/**
 * LA MÊME RÉPONSE, QUE L'ADRESSE EXISTE OU NON.
 *
 * C'est la règle qui gouverne tout ce fichier. Un formulaire de mot de passe
 * oublié qui répondrait « aucun compte avec cette adresse » serait un
 * annuaire : on y teste mille adresses et on repart avec la liste de celles
 * qui sont inscrites. Ça vaut pour une app de langue comme pour une banque —
 * savoir qui utilise quel service est une information sur les gens, et elle
 * ne nous appartient pas.
 *
 * Le message ci-dessous est donc volontairement au conditionnel, et il est
 * renvoyé à l'identique dans les deux cas. Supabase aide : `resetPasswordForEmail`
 * ne signale pas non plus une adresse inconnue.
 */
const SENT_MESSAGE =
  "Si un compte existe avec cette adresse, un lien de réinitialisation vient d'y être envoyé. " +
  "Pense à regarder dans les spams — il est valable une heure.";

export async function requestPasswordResetAction(
  _previous: ResetRequestState,
  formData: FormData
): Promise<ResetRequestState> {
  const email = field(formData, "email").trim().toLowerCase();
  const captchaToken = field(formData, TURNSTILE_FIELD);

  if (!email) {
    return { status: "error", message: "Indique ton adresse email.", email };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "L'authentification n'est pas configurée sur ce serveur.",
      email,
    };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();

  // LE LIEN PASSE PAR /auth/confirm, comme la confirmation d'inscription.
  // Cette route sait déjà valider un jeton de type `recovery` et ouvrir la
  // session correspondante ; `next` lui dit où déposer la personne ensuite.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    captchaToken,
    redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/reset-password")}`,
  });

  if (error) {
    // Le captcha se dit franchement : le jeton est à usage unique et vient
    // d'être consommé, il faut en refaire un. Ce n'est pas une information
    // sur l'existence du compte.
    if (error.code === "captcha_failed") {
      return { status: "error", message: "Le captcha a expiré ou a échoué. Réessaie.", email };
    }
    // La limite de débit non plus ne dit rien du compte : elle porte sur
    // l'envoi, pas sur l'adresse.
    if (error.code === "over_email_send_rate_limit") {
      return {
        status: "error",
        message: "Trop de demandes. Attends une minute avant de réessayer.",
        email,
      };
    }
    // Refus du serveur SMTP : ce n'est pas la faute du visiteur, et lui dire
    // de réessayer l'enverrait tourner en rond. Voir la même distinction dans
    // app/signup/actions.ts.
    if (
      error.code === "error_sending_confirmation_email" ||
      (error.status === 500 && /sending.*email/i.test(error.message ?? ""))
    ) {
      console.error("[reset] envoi refusé par le SMTP :", {
        code: error.code,
        status: error.status,
        message: error.message,
      });
      return {
        status: "error",
        message: "L'email n'a pas pu partir — c'est un problème de notre côté. Réessaie plus tard.",
        email,
      };
    }

    // TOUT LE RESTE EST TRAITÉ COMME UN SUCCÈS, VOLONTAIREMENT. Une adresse
    // inconnue, un compte supprimé, une adresse mal formée côté GoTrue :
    // distinguer ces cas dans la réponse rendrait le formulaire bavard sur
    // qui possède un compte. On trace côté serveur pour pouvoir diagnostiquer,
    // et on affiche le même message que si tout s'était bien passé.
    console.error("[reset] échec Supabase non exposé au client :", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
  }

  return { status: "sent", message: SENT_MESSAGE, email };
}
