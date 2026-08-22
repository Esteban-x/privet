import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { CASES } from "@/lib/grammar/cases";
import { createClient } from "@/lib/supabase/server";

// Indicateur de précision par cas (agrégée tous genres confondus), pour
// orienter l'utilisateur vers ses points faibles — visible seulement
// connecté et après au moins une tentative.
async function loadAccuracyByCase(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("case_progress")
    .select("case_id, attempts, correct")
    .eq("user_id", user.id);

  const totals: Record<string, { attempts: number; correct: number }> = {};
  for (const row of data ?? []) {
    const cur = totals[row.case_id] ?? { attempts: 0, correct: 0 };
    cur.attempts += row.attempts;
    cur.correct += row.correct;
    totals[row.case_id] = cur;
  }

  const accuracy: Record<string, number> = {};
  for (const [caseId, t] of Object.entries(totals)) {
    if (t.attempts > 0) accuracy[caseId] = Math.round((t.correct / t.attempts) * 100);
  }
  return accuracy;
}

export default async function CasesPage() {
  const accuracyByCase = await loadAccuracyByCase();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel color="accent2">Падежи</SectionLabel>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">
        Choisis un cas à travailler
      </h1>
      <p className="mb-12 max-w-2xl font-display leading-relaxed text-muted">
        Chaque cas se pratique en deux temps : déclinaison isolée d&apos;un
        mot, puis phrase à trou en contexte. Ta précision par cas est suivie
        localement dans ton navigateur.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CASES.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-bg2 p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
              style={{ background: c.color }}
            >
              {c.number}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
                  {c.question}
                </p>
                {accuracyByCase[c.id] !== undefined && (
                  <span
                    className={`font-display text-xs font-bold ${
                      accuracyByCase[c.id] < 60 ? "text-danger" : "text-success"
                    }`}
                  >
                    {accuracyByCase[c.id]}%
                  </span>
                )}
              </div>
              <h2 className="font-display text-xl font-bold">
                {c.nameRu} <span className="font-normal text-muted">· {c.nameFr}</span>
              </h2>
              <p className="mt-1 font-display text-sm leading-relaxed text-muted">
                {c.usage}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
