import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Connexion — Privet",
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
