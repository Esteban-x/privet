"use client";

import Link from "next/link";
import type { VocabListSummary } from "@/lib/vocabulary/custom";
import { focusCountLabel } from "@/lib/vocabulary/focus";
import { FlameIcon, PlusIcon } from "@/components/ui/icons";

/**
 * Colonne des listes.
 *
 * Chaque liste porte une tuile colorée dérivée de son nom : deux listes
 * gardent la même couleur d'une session à l'autre, ce qui donne un repère
 * de position bien plus rapide à relire qu'un intitulé. La pastille de
 * droite compte ce que la file proposera — la seule information qui fait
 * choisir par où commencer.
 */

const TILE_COLORS = [
  "bg-[#4a63d6]",
  "bg-[#8B2FA0]",
  "bg-[#1C6E5C]",
  "bg-[#B5762A]",
  "bg-[#2456A6]",
  "bg-[#6F4A2E]",
];

/** Couleur stable pour un nom donné (somme des points de code). */
export function tileColor(name: string): string {
  let sum = 0;
  for (const ch of name) sum += ch.codePointAt(0) ?? 0;
  return TILE_COLORS[sum % TILE_COLORS.length];
}

export function ListTile({ name, className = "h-10 w-10" }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold uppercase text-white ${tileColor(name)} ${className}`}
    >
      {name.trim().charAt(0) || "?"}
    </span>
  );
}

export default function ListRail({
  lists,
  activeId,
  dueTotal,
  onSelect,
  onCreate,
}: {
  lists: VocabListSummary[];
  activeId: string | null;
  dueTotal: number;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Link
        href="/vocabulary/review"
        className="group flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3.5 transition-colors hover:border-accent/35 hover:bg-accent/15"
      >
        <span aria-hidden className="text-xl transition-transform group-hover:scale-110">
          <FlameIcon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-sm font-bold text-accent-ink">Réviser</span>
          <span className="block font-display text-xs text-muted">
            {dueTotal > 0 ? `${dueTotal} mot${dueTotal > 1 ? "s" : ""} en attente` : "rien d'urgent"}
          </span>
        </span>
      </Link>

      <button
        onClick={onCreate}
        className="surface-interactive surface-static group flex items-center gap-3 rounded-2xl border-dashed px-4 py-3 text-left"
      >
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted transition-all duration-300 group-hover:rotate-90 group-hover:border-accent/40 group-hover:text-accent-ink"
          style={{ transitionTimingFunction: "var(--ease)" }}
        >
          <PlusIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="font-display text-sm font-semibold text-muted transition-colors group-hover:text-text">
          Nouvelle liste
        </span>
      </button>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {lists.map((l) => {
          const active = l.id === activeId;
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l.id)}
              aria-current={active ? "true" : undefined}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                active
                  ? "border-border bg-bg3"
                  : "border-transparent hover:border-border hover:bg-bg2"
              }`}
            >
              <ListTile name={l.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-bold">{l.name}</span>
                <span className="block font-display text-xs text-muted">
                  {l.wordCount} mot{l.wordCount === 1 ? "" : "s"}
                  {l.knownCount > 0 &&
                    ` · ${l.knownCount} ${focusCountLabel("known", l.knownCount)}`}
                  {l.priorityCount > 0 && ` · ${l.priorityCount} à travailler`}
                </span>
              </span>
              {l.dueCount > 0 && (
                <span
                  className="shrink-0 rounded-full bg-accent px-2 py-0.5 font-display text-[11px] font-bold text-white"
                  title={`${l.dueCount} à revoir`}
                >
                  {l.dueCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
