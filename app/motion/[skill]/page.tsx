import { notFound } from "next/navigation";
import Link from "next/link";
import MotionPractice from "@/components/motion/MotionPractice";
import { getSkill, MOTION_SKILLS, type MotionSkillId } from "@/lib/motion/exercises";

const SKILL_COLOR: Record<string, string> = {
  mode: "#1C6E5C",
  direction: "#B5762A",
  prefix: "#8B2FA0",
  government: "#2456A6",
};

export default async function MotionSkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  const info = getSkill(skill);
  if (!info) notFound();

  const index = MOTION_SKILLS.findIndex((s) => s.id === info.id);
  const next = MOTION_SKILLS[index + 1];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/motion"
        className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Verbes de mouvement
      </Link>

      <div className="mb-3 flex items-baseline gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{info.title}</h1>
        <span className="font-display text-sm font-bold text-accent">{info.level}</span>
      </div>
      <p className="mb-10 max-w-2xl font-display leading-relaxed text-muted">{info.summary}</p>

      <MotionPractice skill={info.id as MotionSkillId} color={SKILL_COLOR[info.id]} />

      {next && (
        <div className="mt-10 rounded-[20px] border border-border bg-bg2 p-6">
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
            Étape suivante
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold">{next.title}</p>
              <p className="mt-0.5 font-display text-sm text-muted">{next.summary}</p>
            </div>
            <Link
              href={`/motion/${next.id}`}
              className="shrink-0 rounded-[10px] bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
            >
              Continuer →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
