"use client";

import type { VocabDirection } from "@/lib/storage";

export default function DirectionToggle({
  direction,
  onChange,
}: {
  direction: VocabDirection;
  onChange: (d: VocabDirection) => void;
}) {
  return (
    <div className="inline-flex rounded-[10px] border border-border bg-bg p-1">
      <button
        type="button"
        onClick={() => onChange("ru-first")}
        className={`rounded-lg px-3 py-1.5 font-display text-xs font-semibold transition-colors ${
          direction === "ru-first" ? "bg-accent text-white" : "text-muted hover:text-text"
        }`}
      >
        РУ → FR
      </button>
      <button
        type="button"
        onClick={() => onChange("fr-first")}
        className={`rounded-lg px-3 py-1.5 font-display text-xs font-semibold transition-colors ${
          direction === "fr-first" ? "bg-accent text-white" : "text-muted hover:text-text"
        }`}
      >
        FR → РУ
      </button>
    </div>
  );
}
