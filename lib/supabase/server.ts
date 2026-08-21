import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Vrai quand les clés Supabase sont présentes. Permet aux pages/route
// handlers de dégrader proprement (rediriger vers /login) si l'app tourne
// sans configuration plutôt que de jeter une erreur 500.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Client Supabase pour Server Components et Route Handlers. Lit/écrit la
// session via les cookies Next.js. À appeler dans un contexte serveur.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll échoue dans un Server Component pur ; le middleware
            // rafraîchit la session, donc on peut ignorer ici.
          }
        },
      },
    }
  );
}
