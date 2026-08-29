"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalize, type LessonIndexEntry } from "@/lib/courses/catalog";
import { highlightParts } from "@/lib/courses/highlight";
import { useReadLessons } from "@/lib/courses/use-read-lessons";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/supabase/types";

/**
 * Le catalogue des cours, et sa recherche.
 *
 * DEUX ÉTATS, PAS DEUX PAGES. Tant que le champ est vide, on voit le
 * programme dans son ordre d'apprentissage, unité par unité. Dès la
 * première lettre tapée, la même zone devient une liste de résultats classés.
 * Un formulaire de recherche séparé aurait obligé à valider, donc à attendre,
 * pour une opération qui tient dans une comparaison de chaînes sur une
 * centaine d'entrées : ici tout est filtré à la frappe, sans requête réseau
 * ni délai artificiel.
 *
 * LE CLAVIER EST UN CHEMIN COMPLET. « / » met le focus dans le champ, les
 * flèches parcourent les résultats, Entrée ouvre, Échap efface. On peut
 * traverser tout le module sans souris.
 */

export interface UnitHeader {
  slug: string;
  title: string;
  titleRu: string;
  subtitle: string;
  color: string;
  lessonCount: number;
  minutes: number;
}

const LEVEL_TONE: Record<CefrLevel, string> = {
  A0: "border-success/40 text-success",
  A1: "border-success/40 text-success",
  A2: "border-accent/40 text-accent-ink",
  B1: "border-accent/40 text-accent-ink",
  B2: "border-accent2/50 text-accent2",
  C1: "border-accent2-deep/50 text-accent2-deep",
  C2: "border-accent2-deep/50 text-accent2-deep",
};

export default function CourseExplorer({
  units,
  index,
}: {
  units: UnitHeader[];
  index: LessonIndexEntry[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [levels, setLevels] = useState<CefrLevel[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const { read, toggle } = useReadLessons();

  // « / » ouvre la recherche depuis n'importe où sur la page — sauf si on
  // est déjà en train d'écrire quelque part.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const terms = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);

  const levelFiltered = useMemo(
    () => (levels.length === 0 ? index : index.filter((e) => levels.includes(e.level))),
    [index, levels],
  );

  /**
   * Le classement. Chaque terme doit être trouvé quelque part (ET, pas OU) :
   * taper « genitif pluriel » ne doit pas ramener toutes les leçons qui
   * parlent de pluriel. Le titre pèse plus que les mots-clés, qui pèsent
   * plus que le corps ; un début de titre vaut un bonus, parce que c'est
   * presque toujours la leçon cherchée.
   */
  const results = useMemo(() => {
    if (terms.length === 0) return null;
    const scored: { entry: LessonIndexEntry; score: number }[] = [];
    for (const entry of levelFiltered) {
      let total = 0;
      let missing = false;
      for (const term of terms) {
        let score = 0;
        if (entry.haystack.title.includes(term)) {
          score = entry.haystack.title.startsWith(term) ? 10 : 7;
        } else if (entry.haystack.keywords.includes(term)) {
          score = 5;
        } else if (entry.haystack.body.includes(term)) {
          score = 2;
        }
        if (score === 0) {
          missing = true;
          break;
        }
        total += score;
      }
      if (!missing) scored.push({ entry, score: total });
    }
    return scored
      .sort((a, b) => b.score - a.score || a.entry.index - b.entry.index)
      .map((s) => s.entry);
  }, [levelFiltered, terms]);

  // Une nouvelle recherche remet la sélection sur le premier résultat.
  const [seenQuery, setSeenQuery] = useState(query);
  if (query !== seenQuery) {
    setSeenQuery(query);
    setActive(0);
  }

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!results || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[active];
      if (target) router.push(`/cours/${target.slug}`);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  const readCount = index.filter((e) => read.has(e.slug)).length;
  const readPct = index.length ? Math.round((readCount / index.length) * 100) : 0;

  return (
    <div>
      {/* ── Barre de recherche + filtres, collée en haut ─────────── */}
      <div className="sticky top-2 z-20 mb-8 rounded-3xl surface/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-bg2/80">
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            type="search"
            role="searchbox"
            aria-label="Chercher une leçon"
            placeholder="Chercher : génitif pluriel, aspect, ударение, verbes de mouvement…"
            className="w-full rounded-2xl border border-border bg-bg py-3 pl-11 pr-24 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                input.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 font-display text-xs font-semibold text-muted transition-colors hover:text-text"
            >
              Effacer
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border px-2 py-0.5 font-display text-[11px] text-muted sm:block">
              /
            </kbd>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Niveau
          </span>
          {CEFR_LEVELS.map((level) => {
            const on = levels.includes(level);
            return (
              <button
                key={level}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setLevels((prev) =>
                    prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
                  )
                }
                className={`rounded-full border px-2.5 py-1 font-display text-[11px] font-bold transition-colors duration-200 ${
                  on ? "border-accent bg-accent text-white" : `bg-bg ${LEVEL_TONE[level]}`
                }`}
              >
                {level}
              </button>
            );
          })}
          {levels.length > 0 && (
            <button
              type="button"
              onClick={() => setLevels([])}
              className="font-display text-[11px] font-semibold text-muted underline-offset-2 hover:text-text hover:underline"
            >
              tout afficher
            </button>
          )}
          <span className="ml-auto font-display text-[11px] text-muted">
            {results
              ? `${results.length} résultat${results.length === 1 ? "" : "s"}`
              : `${levelFiltered.length} leçon${levelFiltered.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {/* ── Progression de lecture ───────────────────────────────── */}
      {readCount > 0 && !results && (
        <div className="mb-8 animate-fade-in rounded-2xl surface px-5 py-4">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="font-display text-sm font-semibold">
              {readCount} leçon{readCount === 1 ? "" : "s"} lue{readCount === 1 ? "" : "s"} sur{" "}
              {index.length}
            </p>
            <p className="font-display text-sm font-bold text-success">{readPct}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${readPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Résultats, ou programme ──────────────────────────────── */}
      {results ? (
        results.length === 0 ? (
          <div className="animate-fade-in rounded-3xl border border-dashed border-border px-6 py-8 sm:py-16 text-center">
            <p className="font-display text-lg font-semibold">Rien sous ce mot</p>
            <p className="mx-auto mt-2 max-w-md font-display text-sm leading-relaxed text-muted">
              Essaie le terme grammatical (« génitif », « aspect », « participe »), le mot russe («
              ударение », « вид »), ou ce que tu cherches à dire (« depuis », « il faut »).
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {results.map((entry, i) => (
              <li
                key={entry.slug}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
              >
                <ResultRow
                  entry={entry}
                  terms={terms}
                  active={i === active}
                  read={read.has(entry.slug)}
                  onHover={() => setActive(i)}
                />
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="space-y-4">
          {units.map((unit, unitIndex) => {
            const lessons = levelFiltered.filter((e) => e.unitSlug === unit.slug);
            if (lessons.length === 0) return null;
            const isCollapsed = collapsed.includes(unit.slug);
            const unitRead = lessons.filter((l) => read.has(l.slug)).length;
            return (
              <section key={unit.slug} className="overflow-hidden rounded-3xl surface">
                <button
                  type="button"
                  aria-expanded={!isCollapsed}
                  onClick={() =>
                    setCollapsed((prev) =>
                      prev.includes(unit.slug)
                        ? prev.filter((s) => s !== unit.slug)
                        : [...prev, unit.slug],
                    )
                  }
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-bg3/60"
                >
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-base font-extrabold text-white"
                    style={{ background: unit.color }}
                  >
                    {unitIndex + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="font-display text-lg font-bold tracking-tight">
                        {unit.title}
                      </span>
                      <span className="font-display text-sm text-muted">{unit.titleRu}</span>
                    </span>
                    <span className="mt-0.5 block font-display text-sm leading-snug text-muted">
                      {unit.subtitle}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-right font-display text-xs text-muted sm:block">
                    <span className="block">
                      {lessons.length} leçon{lessons.length === 1 ? "" : "s"}
                    </span>
                    <span className="block">
                      {unitRead > 0
                        ? `${unitRead} lue${unitRead === 1 ? "" : "s"}`
                        : `${unit.minutes} min`}
                    </span>
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
                      isCollapsed ? "" : "rotate-180"
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Repli animé sans hauteur calculée : la grille passe de 0fr
                    à 1fr, le navigateur interpole la hauteur réelle. */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="border-t border-border">
                      {lessons.map((entry) => (
                        <li key={entry.slug}>
                          <LessonRow
                            entry={entry}
                            read={read.has(entry.slug)}
                            onToggleRead={() => toggle(entry.slug)}
                          />
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

function ResultRow({
  entry,
  terms,
  active,
  read,
  onHover,
}: {
  entry: LessonIndexEntry;
  terms: string[];
  active: boolean;
  read: boolean;
  onHover: () => void;
}) {
  return (
    <Link
      href={`/cours/${entry.slug}`}
      onMouseEnter={onHover}
      className={`block rounded-2xl border px-5 py-3.5 transition-colors duration-200 ${
        active
          ? "border-accent bg-accent/10"
          : "border-border bg-bg2 hover:bg-accent/10 hover:border-accent/35"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: entry.unitColor }}
        />
        <span className="font-display text-base font-bold tracking-tight">
          <Highlight text={entry.title} terms={terms} />
        </span>
        <span className="font-display text-sm text-muted">
          <Highlight text={entry.titleRu} terms={terms} />
        </span>
        <LevelChip level={entry.level} />
        {read && (
          <span className="font-display text-[11px] font-semibold text-success" title="Déjà lue">
            ✓ lue
          </span>
        )}
        <span className="ml-auto shrink-0 font-display text-[11px] text-muted">
          {entry.unitTitle} · {entry.minutes} min
        </span>
      </div>
      <p className="mt-1 font-display text-sm leading-snug text-muted">
        <Highlight text={entry.summary} terms={terms} />
      </p>
    </Link>
  );
}

function LessonRow({
  entry,
  read,
  onToggleRead,
}: {
  entry: LessonIndexEntry;
  read: boolean;
  onToggleRead: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3 transition-colors last:border-b-0 hover:bg-bg3/60">
      <button
        type="button"
        onClick={onToggleRead}
        aria-pressed={read}
        title={read ? "Marquer comme non lue" : "Marquer comme lue"}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
          read
            ? "border-success bg-success text-on-tint"
            : "border-border text-transparent hover:border-success"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="h-3 w-3"
        >
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <Link href={`/cours/${entry.slug}`} className="min-w-0 flex-1 py-0.5">
        <span className="flex flex-wrap items-baseline gap-x-2.5">
          <span className={`font-display text-sm font-bold ${read ? "text-muted" : "text-text"}`}>
            {entry.title}
          </span>
          <span className="font-display text-xs text-muted">{entry.titleRu}</span>
        </span>
        <span className="mt-0.5 block truncate font-display text-xs text-muted">
          {entry.summary}
        </span>
      </Link>
      <LevelChip level={entry.level} />
      <span className="hidden shrink-0 font-display text-[11px] text-muted sm:block">
        {entry.minutes} min
      </span>
    </div>
  );
}

export function LevelChip({ level }: { level: CefrLevel }) {
  return (
    <span
      className={`shrink-0 rounded-full border bg-bg px-2 py-0.5 font-display text-[10px] font-bold ${LEVEL_TONE[level]}`}
    >
      {level}
    </span>
  );
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const parts = highlightParts(text, terms);
  return (
    <>
      {parts.map((part, i) =>
        part.hit ? (
          <mark key={i} className="rounded bg-accent/30 text-inherit">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}
