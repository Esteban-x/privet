"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const LINKS = [
  { href: "/cases", label: "Cas" },
  { href: "/motion", label: "Mouvement" },
  { href: "/aspect", label: "Aspect" },
  { href: "/vocabulary", label: "Vocabulaire" },
  { href: "/reading", label: "Lecture" },
  { href: "/tutor", label: "Professeur IA" },
];

export default function NavBar({ initialUser }: { initialUser: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  // Amorcé avec la valeur déjà connue côté serveur (voir app/layout.tsx) :
  // le tout premier rendu affiche déjà le bon état, aucun flash "déconnecté"
  // le temps qu'un effet client résolve — un client component peint toujours
  // son état initial avant qu'un effet ne puisse le corriger, donc c'était
  // la seule vraie façon de l'éliminer (réduire le délai ne suffit pas).
  const [user, setUser] = useState<User | null>(initialUser);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    // Garde la nav synchronisée avec les changements côté client (connexion,
    // déconnexion, rafraîchissement de jeton) sans recharger la page — l'état
    // initial, lui, vient déjà du serveur, plus besoin de re-fetch au montage.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Ferme le menu mobile au changement de route — comparaison pendant le
  // rendu plutôt qu'un effet qui appellerait setState de façon synchrone
  // (même pattern que `seenActiveId` dans app/tutor/page.tsx).
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    setMenuOpen(false);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/72 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-accent font-display text-[15px] font-extrabold text-white">
            П
          </span>
          <span className="font-display text-[19px] font-bold">Privet</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hidden px-3.5 py-2 font-display text-sm font-medium transition-colors sm:block ${
                  active ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="ml-2 hidden rounded-lg border border-border px-4 py-2 font-display text-sm font-semibold text-text transition-colors hover:border-accent sm:block"
              >
                Tableau de bord
              </Link>
              <Link
                href="/account"
                className={`ml-1 hidden px-3 py-2 font-display text-sm font-medium transition-colors sm:block ${
                  pathname.startsWith("/account") ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                Mon compte
              </Link>
              <button
                onClick={signOut}
                className="ml-1 hidden px-3 py-2 font-display text-sm text-muted transition-colors hover:text-text sm:block"
                aria-label="Se déconnecter"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-2 hidden rounded-lg bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 sm:block"
            >
              Se connecter
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-text transition-colors hover:bg-border/40 sm:hidden"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {menuOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 5.5h14M3 10h14M3 14.5h14" />}
            </svg>
          </button>
        </nav>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-bg px-6 py-3 sm:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-2.5 font-display text-sm font-medium transition-colors ${
                      active ? "bg-border/40 text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {user ? (
              <>
                <li>
                  <Link href="/dashboard" className="block rounded-lg px-3 py-2.5 font-display text-sm font-medium text-muted transition-colors hover:text-text">
                    Tableau de bord
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="block rounded-lg px-3 py-2.5 font-display text-sm font-medium text-muted transition-colors hover:text-text">
                    Mon compte
                  </Link>
                </li>
                <li>
                  <button
                    onClick={signOut}
                    className="block w-full rounded-lg px-3 py-2.5 text-left font-display text-sm font-medium text-muted transition-colors hover:text-text"
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="block rounded-lg px-3 py-2.5 font-display text-sm font-medium text-muted transition-colors hover:text-text">
                  Se connecter
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
