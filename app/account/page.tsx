import { redirect } from "next/navigation";
import DangerZone from "@/components/account/DangerZone";
import PasswordSettings from "@/components/account/PasswordSettings";
import PreferencesSettings from "@/components/account/PreferencesSettings";
import ProfileSettings from "@/components/account/ProfileSettings";
import SecurityActions from "@/components/account/SecurityActions";
import SectionLabel from "@/components/ui/SectionLabel";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Profile } from "@/lib/supabase/types";

export const metadata = {
  title: "Mon compte — Privet",
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <SectionLabel>Mon compte</SectionLabel>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Réglages</h1>

      <div className="mt-8 space-y-6">
        <ProfileSettings email={user.email ?? ""} initialDisplayName={profile?.display_name ?? ""} />
        <PreferencesSettings
          initialTopics={profile?.topics ?? []}
          initialGoals={profile?.goals ?? ""}
        />
        <PasswordSettings hasPassword={hasPassword} />
        <SecurityActions />
        <DangerZone />
      </div>
    </div>
  );
}
