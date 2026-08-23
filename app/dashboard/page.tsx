import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CASES } from "@/lib/grammar/cases";
import { Profile } from "@/lib/supabase/types";
import SectionLabel from "@/components/ui/SectionLabel";
import StreakDots from "@/components/dashboard/StreakDots";
import { MASTERY_THRESHOLD } from "@/lib/vocabulary/mastery";
import { loadLevelEstimate } from "@/lib/progress/level-estimate";
import { CEFR_LEVELS } from "@/lib/supabase/types";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()) as { data: Profile | null };

  if (profile && !profile.onboarded) redirect("/onboarding");

  // Activité des 7 derniers jours pour le graphe et le compteur.
  // Server Component asynchrone rendu à la demande : lire l'horloge y est
  // le comportement voulu. La règle de pureté vise les rendus client, qui
  // peuvent se rejouer — ce n'est pas le cas ici.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const since = new Date(now - 7 * 864e5).toISOString();
  // Indépendantes les unes des autres (portent chacune sur une table
  // différente) : lancées en parallèle plutôt qu'en séquence pour ne pas
  // cumuler leurs latences réseau au chargement du tableau de bord.
  const [
    { data: activity },
    { data: caseProg },
    { count: totalWords },
    { data: srsRows },
  ] = await Promise.all([
    supabase
      .from("activity_log")
      .select("kind, correct, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since),
    supabase.from("case_progress").select("case_id, attempts, correct").eq("user_id", user.id),
    supabase
      .from("vocab_words")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.from("srs_cards").select("repetitions, due_at").eq("user_id", user.id),
  ]);

  // Niveau de PRATIQUE, à côté du niveau TESTÉ : l'un mesure ce que la
  // progression démontre au fil des centaines de réponses produites, l'autre
  // est une photo prise une fois en QCM. Voir lib/progress/level-estimate.ts.
  const estimate = await loadLevelEstimate(supabase, user.id);
  const testedLevel = profile?.level ?? "A0";
  const practiceAhead =
    estimate.meaningful && CEFR_LEVELS.indexOf(estimate.level) > CEFR_LEVELS.indexOf(testedLevel);

  const acts = activity ?? [];
  const totalAttempts = acts.filter((a) => a.correct !== null).length;
  const correctAttempts = acts.filter((a) => a.correct === true).length;
  const accuracy = totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Précision par cas.
  const caseAccuracy: Record<string, number> = {};
  for (const c of CASES) {
    const rows = (caseProg ?? []).filter((r) => r.case_id === c.id);
    const att = rows.reduce((s, r) => s + (r.attempts ?? 0), 0);
    const cor = rows.reduce((s, r) => s + (r.correct ?? 0), 0);
    caseAccuracy[c.id] = att ? Math.round((cor / att) * 100) : 0;
  }

  const vocabTotal = totalWords ?? 0;
  const vocabMastered = (srsRows ?? []).filter(
    (r) => r.repetitions >= MASTERY_THRESHOLD
  ).length;
  const vocabDue = (srsRows ?? []).filter((r) => new Date(r.due_at) <= new Date()).length;
  const vocabPct = vocabTotal ? Math.round((vocabMastered / vocabTotal) * 100) : 0;

  const name = profile?.display_name?.split(" ")[0] ?? "toi";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>Tableau de bord</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Привет, {name} 👋
          </h1>
        </div>
        <Link
          href="/tutor"
          className="rounded-[10px] bg-accent px-5 py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
        >
          Parler à ton professeur IA →
        </Link>
      </div>

      {/* Cartes de stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Niveau testé" value={testedLevel} accent />
        <StatCard label="Série" value={`${profile?.streak_count ?? 0} j`} />
        <StatCard label="XP total" value={String(profile?.xp ?? 0)} />
        <StatCard label="Précision (7j)" value={`${accuracy}%`} />
      </div>

      {/* Niveau de pratique : la seule mesure qui bouge sans cérémonie */}
      {estimate.meaningful && (
        <div className="mt-6 rounded-[20px] border border-border bg-bg2 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold text-muted">Niveau de pratique</p>
              <p className="mt-1 font-display text-xs leading-relaxed text-muted">
                Déduit de ce que tu produis réellement dans les exercices, pas d&apos;un test.
              </p>
            </div>
            <span className="font-display text-3xl font-extrabold text-accent2">
              {estimate.level}
            </span>
          </div>

          <div className="space-y-2.5">
            {estimate.tiers.map((t) => {
              const pct = t.total ? Math.round((t.mastered / t.total) * 100) : 0;
              const label =
                t.tier === "basic" ? "Essentiels" : t.tier === "intermediate" ? "Courants" : "Avancés";
              return (
                <div key={t.tier} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-display text-sm font-semibold">{label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent2 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-display text-xs text-muted">
                    {t.mastered}/{t.total}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 font-display text-xs leading-relaxed text-muted">
            {estimate.masteredTriggers} déclencheurs maîtrisés sur {estimate.totalTriggers}
            {estimate.vocabKnown > 0 ? ` · ${estimate.vocabKnown} mots mémorisés` : ""}. Un
            déclencheur compte comme maîtrisé après plusieurs réussites d&apos;affilée — c&apos;est
            aussi à ce moment-là que les exercices cessent de te le proposer en priorité.
          </p>

          {practiceAhead && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-accent/40 bg-accent/10 px-4 py-3">
              <p className="font-display text-sm text-text">
                Ta pratique te situe en <span className="font-semibold text-accent">{estimate.level}</span>,
                au-dessus de ton niveau testé ({testedLevel}).
              </p>
              <Link
                href="/level-test"
                className="shrink-0 rounded-[10px] bg-accent px-4 py-2 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              >
                Repasser le test
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Série */}
      <div className="mt-6 rounded-[20px] border border-border bg-bg2 p-6">
        <p className="font-display text-sm font-semibold text-muted">Cette semaine</p>
        <div className="mt-3">
          <StreakDots activity={acts} now={now} />
        </div>
      </div>

      {/* Maîtrise par cas */}
      <div className="mt-6 rounded-[20px] border border-border bg-bg2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-muted">Maîtrise des cas</p>
          <Link href="/cases" className="font-display text-xs font-semibold text-accent hover:underline">
            S&apos;entraîner →
          </Link>
        </div>
        <div className="space-y-3">
          {CASES.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-32 shrink-0 font-display text-sm font-semibold">
                {c.nameRu}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${caseAccuracy[c.id]}%`, background: c.color }}
                />
              </div>
              <span className="w-10 text-right font-display text-xs text-muted">
                {caseAccuracy[c.id]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progression du vocabulaire */}
      <div className="mt-6 rounded-[20px] border border-border bg-bg2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-muted">Progression du vocabulaire</p>
          <Link href="/vocabulary/review" className="font-display text-xs font-semibold text-accent hover:underline">
            Réviser →
          </Link>
        </div>
        {vocabTotal === 0 ? (
          <p className="font-display text-sm text-muted">
            Pas encore de mots — crée une liste dans{" "}
            <Link href="/vocabulary" className="text-accent hover:underline">
              Vocabulaire
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-sm">
                {vocabMastered} / {vocabTotal} mots maîtrisés
              </span>
              <span className="font-display text-xs text-muted">
                {vocabDue > 0 ? `${vocabDue} à revoir aujourd'hui` : "Rien à revoir aujourd'hui"}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${vocabPct}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Accès rapides */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink href="/cases" title="Cas" desc="Déclinaison guidée" />
        <QuickLink href="/vocabulary/review" title="Vocabulaire" desc="Révision espacée" />
        <QuickLink href="/reading" title="Lecture" desc="Textes gradués" />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[20px] border border-border bg-bg2 p-5">
      <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-3xl font-extrabold ${accent ? "text-accent" : "text-text"}`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-[20px] border border-border bg-bg2 p-5 transition-all hover:-translate-y-1 hover:border-accent"
    >
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mt-0.5 font-display text-sm text-muted">{desc}</p>
    </Link>
  );
}
