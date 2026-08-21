"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const LINKS = [
  { href: "/cases", label: "Cas" },
  { href: "/vocabulary", label: "Vocabulaire" },
  { href: "/reading", label: "Lecture" },
  { href: "/tutor", label: "Tuteur" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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

          {ready && user ? (
            <>
              <Link
                href="/dashboard"
                className="ml-2 rounded-lg border border-border px-4 py-2 font-display text-sm font-semibold text-text transition-colors hover:border-accent"
              >
                Tableau de bord
              </Link>
              <button
                onClick={signOut}
                className="ml-1 px-3 py-2 font-display text-sm text-muted transition-colors hover:text-text"
                aria-label="Se déconnecter"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-lg bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
            >
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
