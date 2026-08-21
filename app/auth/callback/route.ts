import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Reçoit le retour OAuth de Google (via Supabase), échange le code contre une
// session, puis envoie vers l'onboarding si le profil n'est pas encore complété.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Redirige vers l'onboarding tant que le test/thèmes ne sont pas faits.
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarded")
          .eq("id", user.id)
          .single();
        if (!profile?.onboarded) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
