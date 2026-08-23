import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { CASES_BY_LEARNING_ORDER } from "@/lib/grammar/cases";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { loadLevelEstimate, type CaseMastery } from "@/lib/progress/level-estimate";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/supabase/types";

type Badge = { label: string; className: string } | null;

/**
 * Pastille par cas : elle combine le programme (à quel niveau ce cas entre
 * normalement en scène) et la pratique réelle (ce qui est déjà solide).
 * Aucun cas n'est verrouillé — un curieux clique et travaille ce qu'il veut,
 * il est seulement prévenu de ce qui n'est pas encore de saison.
 */
function badgeFor(introducedAt: CefrLevel, level: CefrLevel | undefined, mastery: CaseMastery | undefined): Badge {
  if (mastery?.state === "solid") {
    return { label: "solide", className: "border-success/50 bg-success/10 text-success" };
  }
  if (!level) return null; // niveau inconnu : aucune recommandation
  const gap = CEFR_LEVELS.indexOf(introducedAt) - CEFR_LEVELS.indexOf(level);
  if (gap <= 0) {
    return mastery && mastery.attempts > 0
      ? { label: "en cours", className: "border-accent/50 bg-accent/10 text-accent" }
      : { label: "à commencer", className: "border-accent/50 bg-accent/10 text-accent" };
  }
  if (gap === 1) {
    return { label: "prochaine étape", className: "border-border bg-bg3 text-muted" };
  }
  return { label: `plus tard · ${introducedAt}`, className: "border-border bg-bg3 text-muted" };
}

export default async function CasesPage() {
  let level: CefrLevel | undefined;
  let masteryByCase = new Map<string, CaseMastery>();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const [{ data: profile }, estimate] = await Promise.all([
        supabase.from("profiles").select("level").eq("id", user.id).single(),
        loadLevelEstimate(supabase, user.id),
      ]);
      level = profile?.level;
      masteryByCase = new Map(estimate.cases.map((c) => [c.caseId, c]));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel color="accent2">Падежи</SectionLabel>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">
        Choisis un cas à travailler
      </h1>
      <p className="mb-12 max-w-2xl font-display leading-relaxed text-muted">
        Les six cas sont dans l&apos;ordre où on les apprend — pas dans l&apos;ordre des grammaires
        russes. Rien n&apos;est verrouillé : les pastilles indiquent seulement ce qui est de saison
        pour toi{level ? ` (niveau ${level})` : ""}.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CASES_BY_LEARNING_ORDER.map((c, index) => {
          const mastery = masteryByCase.get(c.id);
          const badge = badgeFor(c.introducedAt, level, mastery);
          const accuracy =
            mastery?.accuracy !== null && mastery?.accuracy !== undefined
              ? Math.round(mastery.accuracy * 100)
              : null;
          return (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-bg2 p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
                style={{ background: c.color }}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
                    {c.question}
                  </p>
                  {badge && (
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 font-display text-[11px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-xl font-bold">
                  {c.nameRu} <span className="font-normal text-muted">· {c.nameFr}</span>
                </h2>
                <p className="mt-1 font-display text-sm leading-relaxed text-muted">{c.usage}</p>
                {mastery && mastery.attempts > 0 && (
                  <p className="mt-2 font-display text-xs text-muted">
                    {accuracy}% de réussite · {mastery.masteredTriggers}/{mastery.totalTriggers}{" "}
                    déclencheurs maîtrisés
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
