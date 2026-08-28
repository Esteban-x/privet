import { redirect } from "next/navigation";
import LevelTestRunner from "@/components/leveltest/LevelTestRunner";
import { BLOCK_SIZE, MAX_BLOCKS } from "@/lib/leveltest/engine";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { loadRetestStatus } from "@/lib/leveltest/history";

export const metadata = {
  title: "Test de placement",
};

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  // Un compte qui refait l'onboarding a déjà pu passer le test : on exclut
  // quand même les items déjà vus, sinon la mesure porterait sur la mémoire.
  const status = await loadRetestStatus(supabase, user.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <LevelTestRunner
        excludeIds={status.seenIds}
        finishHref="/dashboard"
        finishLabel="Accéder au tableau de bord"
        markOnboarded
        intro={
          <>
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent">
              Avant de commencer
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
              Test de placement
            </h1>
            <p className="mt-3 font-display text-sm leading-relaxed text-muted">
              {BLOCK_SIZE * 2} à {BLOCK_SIZE * MAX_BLOCKS} questions, quelques minutes. Le test
              procède par séries : chaque série cible un niveau, et il faut en réussir la majorité
              pour que ce niveau soit validé et que la suivante monte d&apos;un cran.
            </p>
            <ul className="mt-4 space-y-2 font-display text-sm text-muted">
              <li className="flex gap-2">
                <span className="text-accent">·</span>
                Les questions suivent le référentiel ТРКИ, le standard du russe langue étrangère.
              </li>
              <li className="flex gap-2">
                <span className="text-accent">·</span>
                Réponds sans chercher : un niveau surestimé ne t&apos;avantage pas, il rend les
                exercices inutilisables.
              </li>
              <li className="flex gap-2">
                <span className="text-accent">·</span>
                Tu pourras le repasser plus tard, et ton niveau s&apos;ajuste de toute façon avec ta
                progression réelle.
              </li>
            </ul>
          </>
        }
      />
    </div>
  );
}
