"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Barre de navigation.
 *
 * Elle portait dix entrées à plat, toutes de même poids, qui se repliaient
 * sur deux lignes dès que la fenêtre se resserrait. Le problème n'était pas
 * la place mais la STRUCTURE : quatre de ces liens — Cas, Mouvement,
 * Aspect, Participes — sont le même domaine, la grammaire, et rien ne le
 * disait. Ils sont maintenant regroupés sous une seule entrée dépliante,
 * qui a la place de dire à quoi sert chaque module.
 *
 * Il reste trois niveaux de lecture, en trois colonnes de même poids :
 * - au centre, ce qu'on vient APPRENDRE (grammaire, vocabulaire, lecture,
 *   tuteur) ;
 * - à droite, le tableau de bord, seule action mise en avant ;
 * - au bout, le compte, replié derrière l'initiale de l'utilisateur —
 *   « Mon compte » et « Déconnexion » ne sont pas des destinations
 *   d'apprentissage et n'ont rien à faire au même rang.
 */

interface NavItem {
  href: string;
  label: string;
  /** Ce que le module travaille, affiché dans le menu Grammaire. */
  hint?: string;
}

const GRAMMAR: NavItem[] = [
  { href: "/cases", label: "Les cas", hint: "Six déclinaisons, du nominatif au prépositionnel" },
  { href: "/motion", label: "Verbes de mouvement", hint: "Aller, venir, revenir — et les préfixes" },
  { href: "/aspect", label: "Aspect verbal", hint: "Imperfectif et perfectif, la paire fondamentale" },
  { href: "/participles", label: "Participes et gérondifs", hint: "Comprimer une proposition entière" },
];

const MAIN: NavItem[] = [
  { href: "/vocabulary", label: "Vocabulaire" },
  { href: "/reading", label: "Lecture" },
  { href: "/tutor", label: "Tuteur" },
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
  const [openPanel, setOpenPanel] = useState<"grammar" | "account" | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

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

  // Un menu déplié doit se refermer sur un clic ailleurs et sur Échap :
  // sans ça il reste ouvert par-dessus la page, et au clavier on s'y trouve
  // enfermé.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenPanel(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPanel(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Changement de route : referme tout — comparaison pendant le rendu plutôt
  // qu'un effet qui appellerait setState de façon synchrone (même pattern
  // que `seenActiveId` dans app/tutor/page.tsx).
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    setMenuOpen(false);
    setOpenPanel(null);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const grammarActive = GRAMMAR.some((item) => pathname.startsWith(item.href));
  const initial = (user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/72 backdrop-blur-md">
      <div ref={navRef} className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
        {/* Le `flex-1` est porté par le conteneur et non par le lien : sur le
            lien, tout le tiers gauche de la barre deviendrait une zone
            cliquable qui ramène à l'accueil. */}
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-accent font-display text-[15px] font-extrabold text-white">
              П
            </span>
            <span className="font-display text-[19px] font-bold">Privet</span>
          </Link>
        </div>

        {/* Navigation d'apprentissage, au centre de la barre : le logo et le
            bloc compte qui l'encadrent portent le même `flex-1`, si bien que
            les liens tombent au milieu quelles que soient leurs largeurs
            respectives — un simple `flex-1` sur la nav seule les aurait
            collés au logo.

            Passe au menu replié sous lg : à 640px, quatre entrées plus le
            compte ne tiennent pas sans se couper en deux lignes. */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPanel((p) => (p === "grammar" ? null : "grammar"))}
              aria-expanded={openPanel === "grammar"}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-display text-sm font-medium transition-colors ${
                grammarActive || openPanel === "grammar"
                  ? "text-text"
                  : "text-muted hover:text-text"
              }`}
            >
              Grammaire
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${openPanel === "grammar" ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="M2 4l3 3 3-3" />
              </svg>
            </button>

            {openPanel === "grammar" && (
              <div className="absolute left-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-[14px] border border-border bg-bg2 p-1.5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.75)]">
                {GRAMMAR.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-[10px] px-3 py-2.5 transition-colors ${
                        active ? "bg-accent/12" : "hover:bg-border/40"
                      }`}
                    >
                      <span
                        className={`block font-display text-sm font-semibold ${
                          active ? "text-accent" : "text-text"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="mt-0.5 block font-display text-xs leading-snug text-muted">
                        {item.hint}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {MAIN.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 font-display text-sm font-medium transition-colors ${
                  active ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`hidden whitespace-nowrap rounded-lg border px-4 py-2 font-display text-sm font-semibold transition-colors lg:block ${
                  pathname.startsWith("/dashboard")
                    ? "border-accent bg-accent/12 text-accent"
                    : "border-border text-text hover:border-accent"
                }`}
              >
                Tableau de bord
              </Link>

              {/* Le compte tient dans son initiale : deux entrées qui ne
                  sont pas des destinations d'apprentissage, et qui
                  prenaient auparavant autant de place qu'un module. */}
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setOpenPanel((p) => (p === "account" ? null : "account"))}
                  aria-expanded={openPanel === "account"}
                  aria-haspopup="true"
                  aria-label="Mon compte"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm font-bold transition-colors ${
                    pathname.startsWith("/account") || openPanel === "account"
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border text-muted hover:border-accent hover:text-text"
                  }`}
                >
                  {initial}
                </button>

                {openPanel === "account" && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-[240px] overflow-hidden rounded-[14px] border border-border bg-bg2 p-1.5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.75)]">
                    {user.email && (
                      <p className="truncate px-3 py-2 font-display text-xs text-muted">
                        {user.email}
                      </p>
                    )}
                    <Link
                      href="/account"
                      className="block rounded-[10px] px-3 py-2.5 font-display text-sm font-medium text-text transition-colors hover:bg-border/40"
                    >
                      Mon compte
                    </Link>
                    <button
                      onClick={signOut}
                      className="block w-full rounded-[10px] px-3 py-2.5 text-left font-display text-sm font-medium text-muted transition-colors hover:bg-border/40 hover:text-danger"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden whitespace-nowrap rounded-lg bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 lg:block"
            >
              Se connecter
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text transition-colors hover:bg-border/40 lg:hidden"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {menuOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 5.5h14M3 10h14M3 14.5h14" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-bg px-6 py-4 lg:hidden">
          {/* Le repli mobile garde le même découpage que le bureau : la
              grammaire reste un groupe, sous son intitulé, plutôt qu'une
              liste indifférenciée de neuf liens. */}
          <p className="px-3 font-display text-[11px] font-semibold uppercase tracking-wide text-muted">
            Grammaire
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {GRAMMAR.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-3 py-2.5 font-display text-sm font-medium transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-accent/12 text-accent"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4 px-3 font-display text-[11px] font-semibold uppercase tracking-wide text-muted">
            Pratique
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {MAIN.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-lg px-3 py-2.5 font-display text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? "bg-accent/12 text-accent"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-border pt-3">
            {user ? (
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link
                    href="/dashboard"
                    className={`block rounded-lg px-3 py-2.5 font-display text-sm font-semibold transition-colors ${
                      pathname.startsWith("/dashboard")
                        ? "bg-accent/12 text-accent"
                        : "text-text hover:text-accent"
                    }`}
                  >
                    Tableau de bord
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account"
                    className="block rounded-lg px-3 py-2.5 font-display text-sm font-medium text-muted transition-colors hover:text-text"
                  >
                    Mon compte
                  </Link>
                </li>
                <li>
                  <button
                    onClick={signOut}
                    className="block w-full rounded-lg px-3 py-2.5 text-left font-display text-sm font-medium text-muted transition-colors hover:text-danger"
                  >
                    Déconnexion
                  </button>
                </li>
              </ul>
            ) : (
              <Link
                href="/login"
                className="block rounded-lg bg-accent px-3 py-2.5 text-center font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              >
                Se connecter
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
