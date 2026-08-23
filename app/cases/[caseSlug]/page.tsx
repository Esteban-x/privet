import { notFound } from "next/navigation";
import Link from "next/link";
// La page lit la session (niveau CEFR) : elle est rendue à la demande.
// Un generateStaticParams n'y changeait rien — le build la marquait déjà
// dynamique — il donnait juste l'illusion d'un prérendu.
import { getCase } from "@/lib/grammar/cases";
import CaseDeclension from "@/components/exercises/CaseDeclension";
import ReferenceTable from "@/components/exercises/ReferenceTable";
import TriggerReference from "@/components/exercises/TriggerReference";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CefrLevel } from "@/lib/supabase/types";

// `undefined` (déconnecté, ou Supabase non configuré) = pas de biais côté
// sélection de déclencheurs, comportement inchangé.
async function getUserLevel(): Promise<CefrLevel | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return undefined;
  const { data: profile } = await supabase.from("profiles").select("level").eq("id", user.id).single();
  return profile?.level;
}

export default async function CasePracticePage({
  params,
}: {
  params: Promise<{ caseSlug: string }>;
}) {
  const { caseSlug } = await params;
  const caseInfo = getCase(caseSlug);
  if (!caseInfo) notFound();

  // Niveau CEFR de l'utilisateur : biaise le tirage des déclencheurs
  // (lib/grammar/exercise-selector.ts) vers l'essentiel pour un débutant,
  // sans jamais exclure totalement le reste.
  const userLevel = await getUserLevel();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/cases"
        className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Tous les cas
      </Link>

      <div className="mb-3 flex items-baseline gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{caseInfo.nameRu}</h1>
        <span className="font-display text-xl text-muted">{caseInfo.nameFr}</span>
      </div>
      <p className="mb-10 max-w-2xl font-display leading-relaxed text-muted">{caseInfo.usage}</p>

      <CaseDeclension caseInfo={caseInfo} userLevel={userLevel} />

      <div className="mt-14">
        <TriggerReference targetCase={caseInfo.id} color={caseInfo.color} />
      </div>

      <div className="mt-14">
        <ReferenceTable targetCase={caseInfo.id} />
      </div>
    </div>
  );
}
