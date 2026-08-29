"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { normalize } from "@/lib/courses/catalog";
import type { Skill } from "@/lib/exercises/types";
import { BookIcon } from "@/components/ui/icons";

/**
 * Le choix d'un exercice, en une page.
 *
 * Le menu déroulant de la barre suffisait à cinq modules ; il ne suffit plus.
 * Ici tout est visible d'un coup, filtrable par famille et par niveau, et
 * chaque carte se déplie sur ses compétences — on entre donc dans un
 * exercice précis en un clic, sans passer par l'accueil du module.
 *
 * Le filtrage se fait à la frappe, sans requête : la liste est courte, et
 * une page qui attend le réseau pour masquer trois cartes serait plus lente
 * que le regard.
 */

export interface ModuleCard {
  id: string;
  href: string;
  title: string;
  titleRu: string;
  blurb: string;
  family: string;
  color: string;
  levels: string[];
  skills: Skill[];
  lesson: { href: string; label: string };
  /** Totaux cumulés du module, pour la barre de précision. */
  attempts: number;
  correct: number;
}

const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function ExerciseExplorer({
  modules,
  families,
}: {
  modules: ModuleCard[];
  families: string[];
}) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return modules.filter((module) => {
      if (family && module.family !== family) return false;
      if (level && !module.levels.includes(level)) return false;
      if (terms.length === 0) return true;
      const haystack = normalize(
        [
          module.title,
          module.titleRu,
          module.blurb,
          module.family,
          ...module.skills.map((s) => s.title),
        ].join(""),
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [modules, query, family, level]);

  const usedLevels = LEVELS.filter((l) => modules.some((m) => m.levels.includes(l)));

  return (
    <div>
      {/* ── Filtres ──────────────────────────────────────────────── */}
      <div className="sticky top-2 z-20 mb-8 rounded-3xl surface/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-bg2/80">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          aria-label="Chercher un exercice"
          placeholder="Chercher : génitif, aspect, impératif, heure…"
          className="w-full rounded-2xl border border-border bg-bg px-4 py-3 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip active={family === null} onClick={() => setFamily(null)}>
            Tout
          </Chip>
          {families.map((name) => (
            <Chip key={name} active={family === name} onClick={() => setFamily(name)}>
              {name}
            </Chip>
          ))}

          <span aria-hidden className="mx-1 h-4 w-px bg-border" />

          {usedLevels.map((l) => (
            <Chip
              key={l}
              active={level === l}
              onClick={() => setLevel(level === l ? null : l)}
              compact
            >
              {l}
            </Chip>
          ))}

          <span className="ml-auto font-display text-[11px] text-muted">
            {visible.length} module{visible.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* ── Cartes ───────────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <div className="animate-fade-in rounded-3xl border border-dashed border-border px-6 py-8 sm:py-16 text-center">
          <p className="font-display text-lg font-semibold">Aucun exercice sous ce filtre</p>
          <p className="mt-2 font-display text-sm text-muted">
            Essaie un autre niveau, ou cherche par notion : « aspect », « génitif », « accent ».
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((module, i) => {
            const accuracy =
              module.attempts > 0 ? Math.round((module.correct / module.attempts) * 100) : null;
            const open = openId === module.id;
            return (
              <section
                key={module.id}
                className="animate-fade-in flex flex-col overflow-hidden rounded-3xl surface-interactive"
                style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
              >
                <span aria-hidden className="h-1.5 w-full" style={{ background: module.color }} />

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                      {module.family}
                    </span>
                    {module.levels.map((l) => (
                      <span
                        key={l}
                        className="rounded-full border border-border px-1.5 py-0.5 font-display text-[10px] font-bold text-muted"
                      >
                        {l}
                      </span>
                    ))}
                  </div>

                  <Link href={module.href} className="group">
                    <h2 className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-accent-ink">
                      {module.title}
                    </h2>
                    <p className="font-display text-sm text-accent2">{module.titleRu}</p>
                  </Link>

                  <p className="mt-2 flex-1 font-display text-sm leading-relaxed text-muted">
                    {module.blurb}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="font-display text-xs font-semibold text-muted">
                      {accuracy === null
                        ? `${module.skills.length} exercices · jamais travaillé`
                        : `${accuracy}% · ${module.attempts} réponse${module.attempts > 1 ? "s" : ""}`}
                    </span>
                    {accuracy !== null && (
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                        <span
                          className="block h-full rounded-full transition-all duration-500"
                          style={{ width: `${accuracy}%`, background: module.color }}
                        />
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={module.href}
                      className="btn btn-primary btn-sheen rounded-xl px-4 py-2 font-display text-sm"
                    >
                      Commencer
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : module.id)}
                      aria-expanded={open}
                      className="rounded-xl border border-border px-4 py-2 font-display text-sm font-semibold text-muted transition-colors hover:bg-accent/10 hover:border-accent/35 hover:text-text"
                    >
                      {open ? "Masquer" : `${module.skills.length} exercices`}
                    </button>
                    <Link
                      href={module.lesson.href}
                      className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-accent2 underline-offset-4 hover:underline"
                    >
                      <BookIcon className="h-3.5 w-3.5 shrink-0" />
                      {module.lesson.label}
                    </Link>
                  </div>
                </div>

                {/* Repli animé sans hauteur calculée : la grille passe de
                    0fr à 1fr et le navigateur interpole la hauteur réelle. */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="border-t border-border">
                      {module.skills.map((skill) => (
                        <li key={skill.id}>
                          <Link
                            href={`${module.href}/${skill.id}`}
                            className="flex items-center gap-3 border-b border-border/60 px-6 py-3 transition-colors last:border-b-0 hover:bg-bg3/60"
                          >
                            <span
                              aria-hidden
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: module.color }}
                            />
                            <span className="min-w-0 flex-1 font-display text-sm font-semibold">
                              {skill.title}
                            </span>
                            <span className="shrink-0 font-display text-[10px] font-bold text-muted">
                              {skill.level}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  compact = false,
  children,
}: {
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border font-display font-bold transition-colors duration-200 ${
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-xs"
      } ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-bg text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
