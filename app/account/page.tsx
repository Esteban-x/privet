import { redirect } from "next/navigation";
import DangerZone from "@/components/account/DangerZone";
import PasswordSettings from "@/components/account/PasswordSettings";
import PlanSettings from "@/components/account/PlanSettings";
import ProfileSettings from "@/components/account/ProfileSettings";
import SecurityActions from "@/components/account/SecurityActions";
import SectionLabel from "@/components/ui/SectionLabel";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { resolvePlan } from "@/lib/billing/plans";
import { fetchFreeCaps } from "@/lib/billing/free-caps";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Profile } from "@/lib/supabase/types";

export const metadata = {
  title: "Mon compte",
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()) as { data: Profile | null };

  // Un compte créé via Google seul n'a pas d'identité "email" — on lui
  // propose d'en définir un plutôt que de lui parler de "changer".
  const hasPassword = Boolean(user.app_metadata.providers?.includes("email"));

  // resolvePlan et non `profile.plan` : un premium échu (essai terminé,
  // accès bêta arrivé à terme) doit s'afficher comme gratuit, exactement
  // comme le voit consume_ai_quota côté base.
  const plan = resolvePlan(profile);

  // Les plafonds de la formule découverte, lus en base plutôt que recopiés :
  // la carte d'abonnement doit annoncer le chiffre qui bloquera réellement.
  const caps = await fetchFreeCaps(supabase);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:py-12">
      <SectionLabel>Mon compte</SectionLabel>
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl tracking-tight">Réglages</h1>

      <div className="mt-8 space-y-6">
        <ProfileSettings email={user.email ?? ""} initialDisplayName={profile?.display_name ?? ""} />
        <PlanSettings
          isPremium={plan.isPremium}
          source={plan.source}
          expiresAt={plan.expiresAt}
          stripeReady={isStripeConfigured()}
          caps={caps}
        />
        <PasswordSettings hasPassword={hasPassword} />
        <SecurityActions />
        <DangerZone />
      </div>
    </div>
  );
}
