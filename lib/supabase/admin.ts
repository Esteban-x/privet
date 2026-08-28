import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase à pleins pouvoirs — RLS contournée.
 *
 * UN SEUL APPELANT LÉGITIME : le webhook Stripe. Il n'a pas de session
 * utilisateur (c'est Stripe qui appelle, pas le navigateur de l'abonné) et
 * doit pourtant écrire `profiles.plan`, colonne que le trigger
 * `guard_plan_columns` interdit justement au rôle `authenticated`.
 *
 * LA CLÉ NE DOIT JAMAIS ÊTRE IMPORTÉE DANS UN COMPOSANT CLIENT. Elle n'a
 * pas de préfixe NEXT_PUBLIC_, donc Next refuserait de l'inclure dans le
 * bundle navigateur, mais la règle vaut d'être écrite : quiconque la
 * possède peut lire et modifier toutes les données de tous les comptes.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante — nécessaire au webhook Stripe " +
        "(Supabase → Settings → API → service_role)."
    );
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
