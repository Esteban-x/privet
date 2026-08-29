import Link from "next/link";
import type { Skill } from "@/lib/exercises/types";
import { BookIcon } from "@/components/ui/icons";

/**
 * La page d'une compétence : titre, niveau, résumé, l'entraînement, puis
 * l'étape suivante. Identique d'un module à l'autre — seul l'entraînement,
 * passé en `children`, change.
 */
export default function SkillPageShell({
  skill,
  skills,
  basePath,
  backLabel,
  lesson,
  children,
}: {
  skill: Skill;
  skills: Skill[];
  basePath: string;
  backLabel: string;
  lesson?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const index = skills.findIndex((s) => s.id === skill.id);
  const next = skills[index + 1];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-16">
      <Link
        href={basePath}
        className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-accent-ink"
      >
        ← {backLabel}
      </Link>

      <div className="mb-3 flex flex-wrap items-baseline gap-3">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl tracking-tight">{skill.title}</h1>
        <span className="font-display text-sm font-bold text-accent-ink">{skill.level}</span>
      </div>
      <p className="mb-6 max-w-2xl font-display leading-relaxed text-muted">{skill.summary}</p>

      {lesson && (
        <Link
          href={lesson.href}
          className="mb-8 inline-flex items-center gap-2 font-display text-sm font-semibold text-accent2 underline-offset-4 hover:underline"
        >
          <BookIcon className="h-3.5 w-3.5" />
          {lesson.label}
        </Link>
      )}

      {children}

      {next && (
        <div className="mt-10 rounded-[20px] surface p-6">
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
            Étape suivante
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-lg font-bold">{next.title}</p>
              <p className="mt-0.5 font-display text-sm text-muted">{next.summary}</p>
            </div>
            <Link
              href={`${basePath}/${next.id}`}
              className="btn btn-primary btn-sheen shrink-0 rounded-[10px] px-5 py-2.5 font-display text-sm"
            >
              Continuer →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
