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
  // LE CATALOGUE DES EXERCICES, MAIS PAS LES EXERCICES. /exercices ne
  // contient aucun entraînement : c'est la liste des huit modules, leurs
  // descriptions et leurs niveaux. `loadAllProgress` renvoyait déjà un
  // objet vide sans session — la page était donc écrite pour un visiteur,
  // et seule cette liste l'en empêchait.
  //
  // POURQUOI ÇA COMPTE PLUS QU'UNE PAGE DE PLUS. C'était la seule page qui
  // dit ce que l'app SAIT FAIRE. Sans elle, un visiteur voyait « Les cas »
  // et en déduisait que l'app entière tenait dans les déclinaisons. Les
  // sous-routes (/cases/…, /aspect/…, /adjectives/…) restent fermées : ce
  // sont elles qui écrivent sur un compte et portent les plafonds.
  "/exercices",
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

/**
 * Les deux accueils qui servent une DÉMONSTRATION à un visiteur et l'espace
 * personnel à un membre — /reading et /vocabulary (voir ReadingPreview et
 * VocabularyPreview).
 *
 * POURQUOI PAS SIMPLEMENT DANS PUBLIC_PATHS. Ça a été la première version,
 * et elle ouvrait un trou : `isPublic` ne dispense pas seulement de la
 * session, il dispense AUSSI du passage obligé par l'onboarding, plus bas.
 * Un compte inscrit mais non finalisé — pas de niveau, pas de thèmes —
 * serait entré dans son atelier de vocabulaire par cette porte, alors que
 * toutes les autres routes continuaient de le renvoyer vers /onboarding. Il
 * se serait retrouvé dans un état mi-figue mi-raisin, sur ces deux pages
 * seulement.
 *
 * Les deux règles sont donc distinctes : ces chemins ne demandent pas de
 * session, mais dès qu'il y en a une, l'onboarding s'applique comme
 * partout. Comparaison EXACTE, jamais par préfixe : /reading/[id],
 * /reading/mine et les quatre modes de /vocabulary restent fermés.
 */
const PREVIEW_PATHS = ["/reading", "/vocabulary"];

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

/**
 * LE VISITEUR SANS SESSION SUR UNE PAGE PUBLIQUE N'A RIEN À FAIRE ICI.
 *
 * Deux choses se réglaient ensemble en le laissant passer plus tôt.
 *
 * LE COÛT. `supabase.auth.getUser()` valide le jeton auprès du serveur
 * d'authentification — un aller-retour réseau. Mesuré : 75 à 136 ms par
 * requête pour une personne connectée, contre 2 à 3 ms sans cookie, où
 * l'appel court-circuite de lui-même. Le construire pour quelqu'un qui n'a
 * pas de cookie du tout, sur une page que tout le monde peut lire, ne
 * décide de rien.
 *
 * LE STATUT. Renvoyer un `NextResponse.next()` fournit à Next une réponse
 * dont le statut vaut déjà 200, et une page qui appelle ensuite
 * `notFound()` ne parvient plus à le corriger : /cases/inexistant répondait
 * « 200 OK » avec une page vide, en production. Ne rien renvoyer laisse Next
 * fabriquer lui-même la réponse — et poser le 404.
 *
 * LA CONDITION EST DOUBLE, ET LES DEUX MOITIÉS COMPTENT. Le chemin doit
 * être public — sinon on n'aurait plus rien à protéger — ET la requête ne
 * doit porter aucun cookie de session, sinon on sauterait le passage par
 * l'onboarding et on cesserait de rafraîchir le jeton de quelqu'un de
 * connecté.
 */
function hasSessionCookie(request: NextRequest): boolean {
  // @supabase/ssr nomme ses cookies `sb-<ref>-auth-token`, parfois découpés
  // en `.0`, `.1` quand le jeton dépasse la taille d'un cookie. On cherche
  // donc le préfixe, pas un nom exact.
  return request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const publicPath =
    PUBLIC_PATHS.some((p) => path === p || (path.startsWith(p + "/") && !INDEX_ONLY.includes(p))) ||
    PREVIEW_PATHS.includes(path);

  if (publicPath && !hasSessionCookie(request)) return;

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

  // Une page d'aperçu se visite sans session — mais elle n'est pas
  // « publique » au sens de la règle d'onboarding ci-dessous.
  const isPreview = PREVIEW_PATHS.includes(path);

  if (!user && !isPublic && !isPreview) {
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
