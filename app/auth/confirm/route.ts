import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "email",
  "email_change",
  "recovery",
  "invite",
  "magiclink",
];

// Cible du lien reçu par email après une inscription email/mot de passe.
// Deux formes possibles selon le gabarit d'email configuré dans Supabase :
//   • `?token_hash=…&type=signup` (gabarit recommandé, marche d'un autre appareil)
//   • `?code=…`                   (gabarit par défaut, flux PKCE : même navigateur)
// On accepte les deux. En cas de succès, la session est posée en cookie et
// l'utilisateur passe par un écran de confirmation avant `next` (onboarding
// par défaut) — sans ça, il atterrit sans transition et peut douter que le
// clic ait fonctionné.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));

  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const code = searchParams.get("code");

  /**
   * UNE RÉINITIALISATION NE PASSE PAS PAR L'ÉCRAN « COMPTE CONFIRMÉ ».
   *
   * Cet écran existe pour rassurer après une inscription : il dit « ton
   * adresse est validée, ton compte est actif » et propose de continuer.
   * Servi à quelqu'un qui vient de cliquer sur un lien de mot de passe
   * oublié, il ment sur ce qui vient de se passer, et il ajoute un clic
   * entre la personne et le seul formulaire qu'elle cherche. On la dépose
   * donc directement sur `next`.
   */
  const isRecovery = rawType === "recovery";
  const successUrl = isRecovery
    ? `${origin}${next}`
    : `${origin}/auth/confirmed?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();

  if (tokenHash && rawType && OTP_TYPES.includes(rawType as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: rawType as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(successUrl);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(successUrl);
  }

  // Le type du lien est renvoyé dans l'URL d'erreur : /login affiche un
  // message différent pour "recovery" (réinitialisation de mot de passe) ou
  // "email_change" que pour "signup" — un message d'inscription sur un lien
  // de réinitialisation expiré serait trompeur.
  const failedType = rawType && OTP_TYPES.includes(rawType as EmailOtpType) ? rawType : "signup";
  return NextResponse.redirect(`${origin}/login?error=confirm&type=${failedType}`);
}

// N'accepte qu'un chemin interne : empêche `?next=https://ailleurs` de
// transformer la route en redirection ouverte.
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/onboarding";
  return value;
}
