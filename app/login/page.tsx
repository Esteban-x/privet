import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * PAS DE « — Privetik » DANS LE TITRE : le gabarit du layout l'ajoute déjà, et
 * l'écrire ici donnait « Connexion — Privetik — Privetik ».
 *
 * `noindex` PLUTÔT QU'UN `Disallow`. Cette page est liée depuis la barre de
 * navigation de toutes les pages publiques : un moteur la découvre de toute
 * façon. L'interdire d'exploration l'aurait fait publier en résultat nu, sans
 * titre ni description, sans qu'on puisse jamais l'en retirer — puisqu'il
 * aurait fallu qu'il lise la page pour apprendre qu'il ne doit pas la garder.
 * On le laisse donc entrer, et on lui demande de ne rien garder. `follow`
 * reste vrai : les liens de la page continuent de compter.
 */
export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Déjà connecté (session encore valide dans ce navigateur) : /login ne
  // sert à rien, ça ne devrait même pas être atteignable. On envoie vers la
  // destination prévue plutôt que de réafficher le formulaire.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { next } = await searchParams;
      redirect(safeNext(next));
    }
  }

  return <LoginForm />;
}

// N'accepte qu'un chemin interne : empêche `?next=https://ailleurs` de
// transformer la page en redirection ouverte.
function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/dashboard";
  }
  return value;
}
