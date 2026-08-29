import Link from "next/link";
import { redirect } from "next/navigation";
import LevelTestRunner from "@/components/leveltest/LevelTestRunner";
import { BLOCK_SIZE, MAX_BLOCKS } from "@/lib/leveltest/engine";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { loadRetestStatus, RETEST_COOLDOWN_DAYS } from "@/lib/leveltest/history";
import { loadLevelEstimate } from "@/lib/progress/level-estimate";
import SectionLabel from "@/components/ui/SectionLabel";
import type { Profile } from "@/lib/supabase/types";

export const metadata = {
  title: "Repasser le test",
};

export default async function LevelTestPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/level-test");

  const [profileResult, status, estimate] = await Promise.all([
    supabase.from("profiles").select("level").eq("id", user.id).single(),
    loadRetestStatus(supabase, user.id),
    loadLevelEstimate(supabase, user.id),
  ]);
  const profile = profileResult.data as Pick<Profile, "level"> | null;

  // Première fois : on renvoie vers l'onboarding, qui marque le profil.
  if (status.history.length === 0) redirect("/onboarding");

  const testedLevel = profile?.level ?? "A0";

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <SectionLabel color="accent2">Niveau</SectionLabel>
      <h1 className="mb-3 font-display text-3xl font-extrabold tracking-tight">
        Réévaluer ton niveau
      </h1>

      {/* Historique : c'est lui qui transforme un chiffre en trajectoire. */}
      <div className="mb-8 rounded-[20px] surface p-6">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
          Tes passations
        </p>
        <ul className="mt-3 space-y-1.5">
          {status.history.slice(0, 6).map((t, i) => (
            <li
              key={t.takenAt}
              className="flex items-center justify-between rounded-[10px] border border-border bg-bg px-4 py-2.5 font-display text-sm"
            >
              <span className="text-muted">
                {new Date(t.takenAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-muted">
                  {t.score}/{t.total}
                </span>
                <span className={`font-bold ${i === 0 ? "text-accent-ink" : "text-text"}`}>
                  {t.level}
                </span>
              </span>
            </li>
          ))}
        </ul>
        {estimate.meaningful && (
          <p className="mt-4 font-display text-xs leading-relaxed text-muted">
            Ta pratique quotidienne te situe actuellement en{" "}
            <span className="font-semibold text-accent2">{estimate.level}</span> ({estimate.masteredTriggers}{" "}
            déclencheurs maîtrisés sur {estimate.totalTriggers}). Le test, lui, sonde aussi ce que
            l&apos;app n&apos;entraîne pas — aspect, participes, syntaxe.
          </p>
        )}
      </div>

      {status.canRetake ? (
        <LevelTestRunner
          excludeIds={status.seenIds}
          previousLevel={testedLevel}
          finishHref="/dashboard"
          finishLabel="Retour au tableau de bord"
          intro={
            <>
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent-ink">
                Nouvelle passation
              </p>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
                {BLOCK_SIZE * 2} à {BLOCK_SIZE * MAX_BLOCKS} questions, jamais posées
              </h2>
              <p className="mt-3 font-display text-sm leading-relaxed text-muted">
                Les items que tu as déjà vus sont écartés du tirage : sinon le test mesurerait ta
                mémoire de la correction, pas ta compréhension. Tout le reste est identique à ta
                dernière passation — mêmes séries, mêmes seuils —, c&apos;est ce qui rend les deux
                résultats comparables.
              </p>
              <p className="mt-3 font-display text-sm leading-relaxed text-muted">
                Niveau actuellement enregistré : <span className="font-semibold">{testedLevel}</span>.
                {status.freshRuns > 0
                  ? ` Le vivier permet encore ${status.freshRuns} passation${status.freshRuns > 1 ? "s" : ""} entièrement inédite${status.freshRuns > 1 ? "s" : ""}.`
                  : " Tu as vu la plupart des items : certains pourront revenir."}
              </p>
            </>
          }
        />
      ) : (
        <div className="rounded-[20px] surface p-8">
          <h2 className="font-display text-xl font-bold">Encore un peu de patience</h2>
          <p className="mt-3 font-display text-sm leading-relaxed text-muted">
            Tu as passé le test il y a moins de {RETEST_COOLDOWN_DAYS} jours. Deux passations
            rapprochées ne diffèrent que par le hasard : la progression réelle se compte en
            semaines, pas en jours. Reviens dans{" "}
            <span className="font-semibold text-text">
              {status.daysLeft} jour{status.daysLeft > 1 ? "s" : ""}
            </span>
            .
          </p>
          <p className="mt-3 font-display text-sm leading-relaxed text-muted">
            En attendant, ta progression continue d&apos;être mesurée à chaque exercice — c&apos;est
            elle qui bouge vite, pas le test.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/cases"
              className="btn btn-primary btn-sheen rounded-[10px] px-5 py-2.5 font-display text-sm"
            >
              Travailler les cas
            </Link>
            <Link
              href="/motion"
              className="rounded-[10px] border border-border px-5 py-2.5 font-display text-sm font-semibold text-muted transition-colors hover:bg-accent/10 hover:border-accent/35 hover:text-accent-ink"
            >
              Verbes de mouvement
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
