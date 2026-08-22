"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface DeleteAccountState {
  error: string | null;
}

export const INITIAL_DELETE_ACCOUNT_STATE: DeleteAccountState = { error: null };

export async function deleteAccountAction(
  _previous: DeleteAccountState,
  _formData: FormData
): Promise<DeleteAccountState> {
  if (!isSupabaseConfigured()) {
    return { error: "L'authentification n'est pas configurée sur ce serveur." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // supprime la ligne auth.users de l'utilisateur courant (voir
  // supabase/schema.sql) — tout le reste (profil, progression, chat…)
  // disparaît par cascade.
  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    console.error("[account] échec de la suppression :", error.message);
    return { error: "La suppression a échoué. Réessaie dans un instant." };
  }

  // La ligne (et donc la session) n'existe plus ; on nettoie quand même les
  // cookies locaux — best effort, une erreur ici ne doit pas bloquer la sortie.
  await supabase.auth.signOut().catch(() => {});
  redirect("/login?deleted=1");
}
