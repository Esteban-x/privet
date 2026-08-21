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
// l'utilisateur atterrit sur l'onboarding.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));

  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (tokenHash && rawType && OTP_TYPES.includes(rawType as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: rawType as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}

// N'accepte qu'un chemin interne : empêche `?next=https://ailleurs` de
// transformer la route en redirection ouverte.
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/onboarding";
  return value;
}
