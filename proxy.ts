import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rafraîchit la session à chaque requête et garde les routes privées.
// Routes publiques : accueil, login, inscription, callback OAuth + confirmation
// d'email.
const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth"];

// Routes accessibles à un utilisateur connecté même s'il n'a pas terminé
// l'onboarding : l'onboarding lui-même, et les API qu'il appelle pour
// s'enregistrer. Sans cette liste, le garde-fou ci-dessous provoquerait une
// redirection en boucle vers /onboarding.
const ONBOARDING_EXEMPT_PATHS = [
  "/onboarding",
  "/account",
  "/api/profile",
  "/api/level-test/evaluate",
];

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Si Supabase n'est pas configuré (dev sans .env), on laisse passer pour
  // ne pas bloquer le rendu — les pages géreront l'absence de session.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Connecté mais onboarding pas terminé (test de niveau + thèmes) : on force
  // /onboarding sur TOUTE route protégée, pas seulement /dashboard — sinon
  // quelqu'un qui se connecte puis navigue directement vers /tutor ou /cases
  // contourne l'étape.
  if (user && !isPublic) {
    const isExempt = ONBOARDING_EXEMPT_PATHS.some((p) => path === p || path.startsWith(p + "/"));
    if (!isExempt) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .single();
      if (profileError) {
        // Échec transitoire (réseau, DB) : on laisse passer plutôt que de
        // bloquer l'utilisateur, mais on trace l'erreur — un échec
        // persistant contournerait silencieusement l'onboarding sinon.
        console.error("proxy: échec lecture profil.onboarded", profileError);
      }
      if (profile && !profile.onboarded) {
        const onboardingUrl = request.nextUrl.clone();
        onboardingUrl.pathname = "/onboarding";
        onboardingUrl.search = "";
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
