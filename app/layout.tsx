import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";

// Police chargée via <link> plutôt que next/font/google pour ne pas dépendre
// d'un accès réseau à fonts.googleapis.com au moment du build.
export const metadata: Metadata = {
  title: "Privet — apprendre le russe",
  description: "Application interactive pour apprendre le russe : cas, vocabulaire, lecture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <NavBar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
