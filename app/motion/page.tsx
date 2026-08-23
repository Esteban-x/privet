import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import TrajectoryDiagram from "@/components/motion/TrajectoryDiagram";
import { MOTION_SKILLS } from "@/lib/motion/exercises";
import { MOTION_PAIRS, MOTION_PREFIXES } from "@/lib/motion/verbs";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Verbes de mouvement — Privet",
};

const SKILL_COLOR: Record<string, string> = {
  mode: "#1C6E5C",
  direction: "#B5762A",
  prefix: "#8B2FA0",
  government: "#2456A6",
};

/** Illustration du hub : le schéma qui résume chaque compétence. */
const SKILL_SCHEMA = {
  mode: "oneway",
  direction: "roundtrip",
  prefix: "into",
  government: "upto",
} as const;

export default async function MotionHub() {
  const progress = new Map<string, { attempts: number; correct: number }>();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("motion_progress")
        .select("skill_id, attempts, correct")
        .eq("user_id", user.id);
      for (const row of data ?? []) {
        progress.set(row.skill_id, { attempts: row.attempts, correct: row.correct });
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel color="accent2">Глаголы движения</SectionLabel>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">
        Verbes de mouvement
      </h1>
      <p className="mb-10 max-w-2xl font-display leading-relaxed text-muted">
        Le français dit « aller » ; le russe demande trois décisions à la fois — à pied ou en
        véhicule, un trajet ou une habitude, et quel préfixe. C&apos;est de la géométrie avant
        d&apos;être du vocabulaire, alors on l&apos;apprend en lisant des schémas.
      </p>

      {/* La distinction fondatrice, montrée avant d'être expliquée. */}
      <div className="mb-12 grid grid-cols-1 gap-4 rounded-[20px] border border-border bg-bg2 p-7 sm:grid-cols-2">
        <figure className="flex flex-col items-center">
          <TrajectoryDiagram schema="oneway" mode="foot" />
          <figcaption className="mt-2 text-center font-display text-sm">
            <span className="font-bold">идти</span>
            <span className="block text-muted">
              un trajet, une direction, en cours — « Сейчас я иду в школу »
            </span>
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center">
          <TrajectoryDiagram schema="roundtrip" mode="foot" />
          <figcaption className="mt-2 text-center font-display text-sm">
            <span className="font-bold">ходить</span>
            <span className="block text-muted">
              une habitude ou un aller-retour — « Вчера я ходил в школу »
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MOTION_SKILLS.map((skill) => {
          const stat = progress.get(skill.id);
          const accuracy =
            stat && stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : null;
          return (
            <Link
              key={skill.id}
              href={`/motion/${skill.id}`}
              className="group rounded-2xl border border-border bg-bg2 p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold text-white"
                  style={{ background: SKILL_COLOR[skill.id] }}
                >
                  {skill.level}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-bold">{skill.title}</h2>
                    {accuracy !== null && (
                      <span
                        className={`shrink-0 font-display text-xs font-bold ${
                          accuracy < 60 ? "text-danger" : "text-success"
                        }`}
                      >
                        {accuracy}%
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-display text-sm leading-relaxed text-muted">
                    {skill.summary}
                  </p>
                  {stat && stat.attempts > 0 && (
                    <p className="mt-2 font-display text-xs text-muted">
                      {stat.attempts} réponses
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-center opacity-70 transition-opacity group-hover:opacity-100">
                <TrajectoryDiagram schema={SKILL_SCHEMA[skill.id]} className="h-[70px]" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tableau de référence : les paires, puis les préfixes. */}
      <div className="mt-14">
        <SectionLabel color="accent">Les paires de base</SectionLabel>
        <div className="overflow-hidden overflow-x-auto rounded-2xl border border-border">
          <table className="w-full border-collapse font-display text-sm">
            <thead>
              <tr className="border-b border-border bg-bg3">
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                  Un trajet
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                  Habitude / aller-retour
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                  Sens
                </th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                  Passé (il / elle)
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg2">
              {MOTION_PAIRS.map((pair) => (
                <tr key={pair.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-bold text-accent">{pair.uni}</td>
                  <td className="px-4 py-3 font-bold">{pair.multi}</td>
                  <td className="px-4 py-3 text-muted">{pair.translation}</td>
                  <td className="px-4 py-3 text-muted">
                    {pair.uniForms.pastM} / {pair.multiForms.pastM}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <SectionLabel color="accent">Les préfixes</SectionLabel>
        <p className="mb-4 max-w-2xl font-display text-sm leading-relaxed text-muted">
          Préfixe + <span className="font-semibold">идти</span> donne un perfectif, préfixe +{" "}
          <span className="font-semibold">ходить</span> son imperfectif. Chaque préfixe appelle
          aussi sa préposition, et donc son cas.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOTION_PREFIXES.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-bg2 p-5">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold text-accent">{p.perfective}</span>
                <span className="font-display text-sm text-muted">/ {p.imperfective}</span>
              </div>
              <p className="mt-0.5 font-display text-sm">{p.translation}</p>
              <p className="mt-1 font-display text-xs text-muted">
                {p.preposition !== "—" ? `${p.preposition} + ` : ""}
                {p.governs === "accusative"
                  ? "accusatif"
                  : p.governs === "genitive"
                    ? "génitif"
                    : "datif"}
              </p>
              <p className="mt-2 font-display text-xs italic text-muted">
                {p.example.ru} — {p.example.fr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
