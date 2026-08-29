import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import BottomNav from "@/components/layout/BottomNav";
import NavProgress from "@/components/layout/NavProgress";
import { THEME_SCRIPT } from "@/lib/theme";
import { resolvePlan } from "@/lib/billing/plans";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Police chargée via <link> plutôt que next/font/google pour ne pas dépendre
// d'un accès réseau à fonts.googleapis.com au moment du build.

/**
 * L'origine publique du site.
 *
 * INDISPENSABLE À `metadataBase`. Sans elle, Next résout les URL d'aperçu en
 * relatif : un lien partagé sur WhatsApp ou LinkedIn pointe alors vers une
 * image qui n'existe nulle part, et l'aperçu s'affiche vide. Le repli local
 * n'est là que pour le développement — en production, la variable doit être
 * le domaine réel (voir .env.local.example).
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Le nom du site tel qu'il s'affiche dans un aperçu de lien. */
const SITE_NAME = "Privetik";

/**
 * Ce que Google et les messageries lisent.
 *
 * LE TITRE PAR DÉFAUT DIT CE QU'ON FAIT, PAS QUI ON EST. « Privetik » seul ne
 * veut rien dire pour quelqu'un qui ne connaît pas l'app — et c'est la
 * totalité des gens qui la découvrent par une recherche. Le gabarit
 * `%s — Privetik` laisse chaque page nommer sa propre matière et garde la
 * marque en second, où elle ne mange pas les 60 caractères utiles.
 *
 * PAS DE BALISE `keywords` : les moteurs l'ignorent depuis 2009, et la
 * remplir est un signal d'amateurisme pour les outils d'audit.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Apprendre le russe : cours, déclinaisons et exercices | Privetik",
    template: `%s — ${SITE_NAME}`,
  },
  // 155 CARACTÈRES MAXIMUM, sans quoi Google coupe en plein milieu — et
  // c'est cette phrase qui décide du clic, pas le titre.
  description:
    "Cours de russe complet et gratuit : alphabet, 6 cas, aspect verbal. " +
    "Chaque correction sort d'une règle, jamais d'une IA qui devine.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // PAS DE `alternates.canonical` ICI. Ce fichier en déclarait un, « / »,
  // et il était juste pour l'accueil : c'est d'ailleurs de lui que l'accueil
  // tenait le sien, faute d'en définir un. Mais Next fait DESCENDRE les
  // métadonnées d'un layout dans toutes les pages qu'il enveloppe, et une
  // page qui oublie de définir la sienne héritait donc de « / » — elle
  // déclarait aux moteurs être un double de l'accueil. Aucune page publique
  // n'était dans ce cas, toutes définissent la leur ; le piège n'attendait
  // que la prochaine. L'accueil déclare maintenant la sienne dans
  // app/page.tsx, là où elle est vraie.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Apprendre le russe en ligne — cours, cas et exercices",
    description:
      "Les six cas, l'aspect et les verbes de mouvement, corrigés à la règle, jamais devinés. " +
      "Cours complet gratuit, exercices quotidiens offerts.",
    // L'image vient de app/opengraph-image.tsx : Next l'ajoute ici tout
    // seul, avec ses dimensions et son texte alternatif.
  },
  twitter: {
    card: "summary_large_image",
    title: "Apprendre le russe en ligne — Privetik",
    description:
      "Les six cas, l'aspect et les verbes de mouvement, corrigés à la règle, jamais devinés.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Sans ces trois-là, Google tronque les extraits à sa guise et
      // n'affiche pas l'aperçu en grand format dans les résultats riches.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

/**
 * La couleur de la barre système, sur mobile et en application installée.
 *
 * DEUX VALEURS, une par thème. Le manifeste n'en porte qu'une — il est lu
 * une fois à l'installation — mais cette balise-ci est relue à chaque
 * chargement : elle peut donc suivre `prefers-color-scheme`. Sans elle, la
 * barre d'état reste blanche au-dessus d'une app sombre, ce qui est le
 * détail qui trahit un site web déguisé en application.
 *
 * Les valeurs sont celles de `--color-bg` (globals.css), recopiées parce
 * qu'une variable CSS n'est pas résolue au moment où le navigateur lit cette
 * balise.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Lu ici plutôt que dans NavBar (composant client) pour que le tout premier
  // rendu envoyé au navigateur reflète déjà l'état de connexion — évite le
  // flash "déconnecté" le temps qu'un fetch client résolve. Cette lecture de
  // cookies rend l'app dynamique par requête (adieu la pré-génération
  // statique globale), un compromis raisonnable puisque le middleware
  // revérifiait de toute façon la session à chaque requête.
  let initialUser = null;
  let initialPro = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialUser = user;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, plan_source, plan_expires_at")
        .eq("id", user.id)
        .single();
      initialPro = resolvePlan(profile).isPremium;
    }
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* AVANT TOUT LE RESTE. Ce script pose data-theme sur <html> à
            partir de localStorage, de façon synchrone, avant le premier
            rendu. Sans lui, quelqu'un ayant choisi le thème clair verrait
            une page noire pendant 200 ms à chaque navigation. `suppress
            HydrationWarning` sur <html> parce que cet attribut est
            précisément une différence attendue entre serveur et client. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Le cyrillique est servi depuis le domaine de l'app (voir
            globals.css et scripts/build-cyrillic-font.py) : préchargé, parce
            qu'il apparaît sur pratiquement chaque page et qu'un texte russe
            repeint après coup est la chose la plus visible du chargement. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/privetik-cyrillic.woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* AVANT LA BARRE DE NAVIGATION, et posé en `fixed` : c'est le seul
            élément qui doit pouvoir peindre par-dessus tout le reste, y
            compris pendant qu'une page l'occupe entièrement. */}
        <NavProgress />
        <NavBar initialUser={initialUser} initialPro={initialPro} />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        {/* APRÈS <main>, pas avant : le bandeau pose dans le flux un jumeau
            de sa propre hauteur, qui ne réserve la place voulue que s'il
            vient à la suite du contenu. */}
        <BottomNav signedIn={Boolean(initialUser)} />
      </body>
    </html>
  );
}
