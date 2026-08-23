import { notFound } from "next/navigation";
import Link from "next/link";
import ParticiplePractice from "@/components/participles/ParticiplePractice";
import { getSkill, PARTICIPLE_SKILLS, type ParticipleSkillId } from "@/lib/participles/exercises";

const SKILL_COLOR: Record<string, string> = {
  active: "#1C6E5C",
  passive: "#8B2FA0",
  short: "#B5762A",
  gerund: "#2456A6",
  subject: "#6F4A2E",
};

export default async function ParticipleSkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  const info = getSkill(skill);
  if (!info) notFound();

  const index = PARTICIPLE_SKILLS.findIndex((s) => s.id === info.id);
  const next = PARTICIPLE_SKILLS[index + 1];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/participles"
        className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Participes et gérondifs
      </Link>

      <div className="mb-3 flex items-baseline gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{info.title}</h1>
        <span className="font-display text-sm font-bold text-accent">{info.level}</span>
      </div>
      <p className="mb-10 max-w-2xl font-display leading-relaxed text-muted">{info.summary}</p>

      <ParticiplePractice skill={info.id as ParticipleSkillId} color={SKILL_COLOR[info.id]} />

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
              href={`/participles/${next.id}`}
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
