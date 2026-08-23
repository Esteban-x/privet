import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Police chargée via <link> plutôt que next/font/google pour ne pas dépendre
// d'un accès réseau à fonts.googleapis.com au moment du build.
export const metadata: Metadata = {
  title: "Privet — apprendre le russe",
  description: "Application interactive pour apprendre le russe : cas, vocabulaire, lecture.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Lu ici plutôt que dans NavBar (composant client) pour que le tout premier
  // rendu envoyé au navigateur reflète déjà l'état de connexion — évite le
  // flash "déconnecté" le temps qu'un fetch client résolve. Cette lecture de
  // cookies rend l'app dynamique par requête (adieu la pré-génération
  // statique globale), un compromis raisonnable puisque le middleware
  // revérifiait de toute façon la session à chaque requête.
  let initialUser = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialUser = user;
  }

  return (
    <html lang="fr">
      <head>
        {/* Le cyrillique est servi depuis le domaine de l'app (voir
            globals.css et scripts/build-cyrillic-font.py) : préchargé, parce
            qu'il apparaît sur pratiquement chaque page et qu'un texte russe
            repeint après coup est la chose la plus visible du chargement. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/privet-cyrillic.woff2"
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
        <NavBar initialUser={initialUser} />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
