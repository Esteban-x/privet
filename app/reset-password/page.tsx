import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/layout/Logo";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/** Sans « — Privetik » : le gabarit du layout l'ajoute. */
export const metadata: Metadata = {
  title: "Choisir un nouveau mot de passe",
};

/**
 * L'écran d'arrivée du lien de réinitialisation.
 *
 * IL EST PROTÉGÉ, ET C'EST LE MÉCANISME LUI-MÊME. Le lien reçu par email
 * passe d'abord par /auth/confirm, qui valide le jeton et ouvre une session.
 * Arriver ici sans session signifie donc que le lien n'a pas été suivi, ou
 * qu'il a expiré : proxy.ts renvoie alors vers /login, ce qui est le bon
 * comportement. Aucun jeton ne circule dans l'URL de cette page — il a été
 * consommé une fois, avant.
 *
 * IL EST AUSSI EXEMPTÉ DU GARDE-FOU D'ONBOARDING (voir proxy.ts). Sans ça,
 * quelqu'un qui n'a jamais terminé son inscription et qui perd son mot de
 * passe serait renvoyé vers /onboarding au lieu du formulaire — il ne
 * pourrait littéralement jamais reprendre son compte.
 */
export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts a normalement déjà filtré, mais une page qui dépend d'une
  // session ne s'en remet pas à un middleware : le jour où la liste des
  // chemins protégés change, c'est ici qu'on veut que ça tienne encore.
  if (!user) redirect("/login?error=confirm&type=recovery");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-[20px] surface p-8 shadow-float">
        <div className="mb-7 text-center">
          <Logo className="mx-auto h-9 w-9" />
          <h1 className="mt-4 font-display text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="mt-2 font-display text-sm leading-relaxed text-muted">
            Lien vérifié pour <span className="text-text">{user.email}</span>. Choisis le mot de
            passe avec lequel tu te connecteras désormais.
          </p>
        </div>

        <ResetPasswordForm />

        <p className="mt-6 text-center font-display text-xs text-muted">
          Ce n&apos;est pas toi qui as fait cette demande ?{" "}
          <Link href="/account" className="font-semibold text-accent-ink hover:underline">
            Vérifie ton compte
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
