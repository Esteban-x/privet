"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pour les composants client. Utilise les clés publiques —
// la sécurité repose sur Row Level Security côté base, pas sur le secret.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
