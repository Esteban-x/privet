import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/components/layout/Logo";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * PAS DE « — Privetik » DANS LE TITRE : le gabarit du layout l'ajoute.
 *
 * `noindex` PLUTÔT QU'UN `Disallow`. Cette page est liée depuis /login, que
 * les robots ont le droit de lire : ils la trouveront. L'interdire
 * d'exploration la ferait publier en résultat nu, sans qu'on puisse jamais
 * l'en retirer — il faudrait qu'ils lisent la page pour apprendre qu'ils ne
 * doivent pas la garder. Voir la note complète dans app/robots.ts.
 */
export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: true },
};

export default async function ForgotPasswordPage() {
  // Déjà connecté : la personne n'a pas besoin de ce formulaire, elle peut
  // changer son mot de passe depuis son compte. L'y envoyer évite qu'elle
  // s'envoie un email pour rien.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/account");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-[20px] surface p-8 shadow-float">
        <div className="mb-7 text-center">
          <Logo className="mx-auto h-9 w-9" />
          <h1 className="mt-4 font-display text-2xl font-bold">Mot de passe oublié</h1>
          <p className="mt-2 font-display text-sm leading-relaxed text-muted">
            Indique l&apos;adresse de ton compte : on t&apos;envoie un lien pour en choisir un
            nouveau.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
