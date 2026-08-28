import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isKnownRoute } from "@/lib/routes";

// Rafraîchit la session à chaque requête et garde les routes privées.
// Routes publiques : accueil, login, inscription, callback OAuth + confirmation
// d'email.
//
// /api/billing/webhook DOIT y figurer : c'est Stripe qui l'appelle, sans
// cookie de session. Sans cette ligne, le garde-fou ci-dessous répondrait
// une redirection 307 vers /login à chaque événement — Stripe la compterait
// comme un échec, rejouerait, puis désactiverait le webhook au bout de
// quelques jours. Les abonnements cesseraient alors d'être enregistrés,
// silencieusement. La route vérifie elle-même la signature Stripe, qui est
// une authentification bien plus forte qu'un cookie.
// /premium doit être publique : c'est la page qui donne envie de payer, et
// renvoyer un visiteur vers /login au moment précis où il compare les
// formules est la façon la plus sûre de le perdre.
//
// ─── LE COURS ET LES TABLES SONT PUBLICS ─────────────────────────────
//
// POURQUOI. Tant que tout était fermé, un moteur de recherche ne voyait que
// deux pages : l'accueil et les tarifs. Les 130 leçons, les six cas,
// l'alphabet et les tables de conjugaison — c'est-à-dire l'intégralité de ce
// qui répond à « déclinaison russe » ou « alphabet cyrillique » — étaient
// invisibles. On ne se classe pas sur une requête d'apprentissage avec deux
// pages, quelles que soient les balises.
//
// CE N'EST PAS UN CADEAU : la page de prix promet déjà « les 130 leçons, en
// entier » dans la formule gratuite. Elles étaient derrière une INSCRIPTION,
// pas derrière un paiement. On déplace la barrière d'un cran, à l'endroit où
// elle a un sens — le moment où l'on s'entraîne, pas celui où l'on lit.
//
// CE QUI RESTE FERMÉ, ET POURQUOI. Tout ce qui écrit quelque chose sur un
// compte : exercices, vocabulaire, lecture générée, progression. C'est là
// que vivent les plafonds du plan gratuit, et les ouvrir aux visiteurs
// reviendrait à offrir un contournement — se déconnecter pour s'entraîner
// sans compteur.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  // Demander un lien de réinitialisation se fait forcément déconnecté :
  // c'est tout l'objet de la page. /reset-password, en revanche, N'EST PAS
  // ici — le lien reçu par email ouvre une session avant d'y mener, et
  // exiger cette session est précisément ce qui protège la page.
  "/forgot-password",
  "/auth",
  "/premium",
  "/api/billing/webhook",
  // Le cours rédigé, unités et leçons.
  "/cours",
  // Les six cas : usage, déclencheurs et tables de terminaisons. La carte
  // d'entraînement qui vit sur ces pages demande, elle, un compte — voir
  // app/cases/[caseSlug]/page.tsx.
  "/cases",
  // Les tables de référence. Leurs sous-pages `/[skill]` sont des exercices
  // et restent fermées : elles ne sont pas listées ici, et le préfixe ne les
  // couvre pas puisqu'on compare sur `p + "/"` — voir plus bas.
  "/alphabet",
  "/conjugation",
  "/numbers",
  // Les guides de référencement. Hors navigation par choix — ils ne
  // font pas partie du produit, ils y mènent — mais publics par nécessité :
  // une page destinée à être trouvée par un moteur ne peut pas exiger une
  // session.
  "/guides",
];

/**
 * Les sections dont l'INDEX est public mais dont les sous-pages sont des
 * exercices. `/alphabet` se lit sans compte, `/alphabet/lecture` non.
 *
 * Sans cette liste, le test `path.startsWith(p + "/")` ouvrirait toute la
 * descendance — et les modules d'entraînement avec elle, plafonds compris.
 */
const INDEX_ONLY = ["/alphabet", "/conjugation", "/numbers"];

// Routes accessibles à un utilisateur connecté même s'il n'a pas terminé
// l'onboarding : l'onboarding lui-même, et les API qu'il appelle pour
// s'enregistrer. Sans cette liste, le garde-fou ci-dessous provoquerait une
// redirection en boucle vers /onboarding.
const ONBOARDING_EXEMPT_PATHS = [
  "/onboarding",
  "/level-test",
  "/account",
  // SANS CETTE LIGNE, UN COMPTE NON FINALISÉ NE POURRAIT JAMAIS ÊTRE
  // RÉCUPÉRÉ. Quelqu'un qui s'inscrit, abandonne avant la fin de
  // l'onboarding, puis oublie son mot de passe, suit son lien de
  // réinitialisation et se fait renvoyer vers /onboarding — où l'on ne
  // choisit pas de mot de passe. Il tourne alors en rond indéfiniment.
  "/reset-password",
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

  // UNE ADRESSE QUI N'EXISTE PAS N'EST PAS UNE ADRESSE PROTÉGÉE. Sans ce
  // passage, le refus par défaut ci-dessous renvoyait vers /login toute URL
  // inconnue : un visiteur déconnecté ne voyait jamais la page introuvable,
  // et un robot d'indexation recevait une redirection là où il attendait un
  // 404 — de quoi laisser des adresses mortes dans l'index pendant des
  // mois. On laisse passer, Next rend app/not-found.tsx (avec son
  // `robots: noindex`).
  if (!isKnownRoute(path)) return response;

  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || (path.startsWith(p + "/") && !INDEX_ONLY.includes(p))
  );

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Connecté mais onboarding pas terminé (test de niveau + thèmes) : on force
  // /onboarding sur TOUTE route protégée, pas seulement /dashboard — sinon
  // quelqu'un qui se connecte puis navigue directement vers /cases ou /reading
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
