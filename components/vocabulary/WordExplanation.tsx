"use client";

import { useState } from "react";
import type { WordExplanation as Explanation } from "@/lib/vocabulary/explanation";

/**
 * Fiche d'explication d'un mot, générée à la demande puis mise en cache
 * côté serveur (/api/vocab/explain).
 *
 * Annoncée comme générée par l'IA, sans détour : contrairement aux
 * exercices de déclinaison, rien ici n'est recalculé par le moteur de
 * règles — c'est du commentaire de professeur, utile mais faillible, et
 * l'apprenant a le droit de le savoir.
 */
export default function WordExplanation({ wordId }: { wordId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [explanation, setExplanation] = useState<Explanation | null>(null);

  async function load(refresh = false) {
    setState("loading");
    try {
      const res = await fetch("/api/vocab/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, refresh }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.explanation) {
        setState("error");
        return;
      }
      setExplanation(data.explanation as Explanation);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => load()}
        className="font-display text-xs font-semibold text-accent2 hover:underline"
      >
        ✦ Expliquer
      </button>
    );
  }

  if (state === "loading") {
    return <span className="font-display text-xs text-muted">Explication en cours…</span>;
  }

  if (state === "error" || !explanation) {
    return (
      <button
        onClick={() => load()}
        className="font-display text-xs font-semibold text-danger hover:underline"
      >
        Explication indisponible — réessayer
      </button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-[10px] border border-border bg-bg px-4 py-3 text-left">
      <div className="flex flex-wrap items-center gap-2">
        {explanation.partOfSpeech && (
          <span className="rounded-full bg-accent2/15 px-2 py-0.5 font-display text-[11px] font-bold text-accent2">
            {explanation.partOfSpeech}
          </span>
        )}
        {explanation.register && (
          <span className="rounded-full border border-border px-2 py-0.5 font-display text-[11px] font-semibold text-muted">
            {explanation.register}
          </span>
        )}
      </div>

      <p className="mt-2.5 font-display text-sm leading-relaxed text-text">{explanation.meaning}</p>

      {explanation.pitfall && (
        <p className="mt-3 rounded-lg border border-accent2/40 bg-accent2/10 px-3 py-2 font-display text-sm leading-relaxed text-text">
          <span className="font-bold">À surveiller — </span>
          {explanation.pitfall}
        </p>
      )}

      {explanation.examples.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {explanation.examples.map((ex, i) => (
            <li key={i} className="font-display text-sm">
              <span className="font-semibold text-text">{ex.ru}</span>
              <span className="ml-2 text-muted">{ex.fr}</span>
            </li>
          ))}
        </ul>
      )}

      {explanation.collocations.length > 0 && (
        <Section title="Expressions courantes" items={explanation.collocations} />
      )}
      {explanation.related.length > 0 && (
        <Section title="Mots proches" items={explanation.related} />
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-2.5">
        <p className="font-display text-[11px] leading-relaxed text-muted">
          Explication générée par l&apos;IA. Les nuances et exemples ne sont pas
          vérifiés par le moteur de déclinaison, contrairement aux exercices.
        </p>
        <button
          onClick={() => load(true)}
          className="shrink-0 font-display text-[11px] font-semibold text-muted hover:text-accent2"
        >
          Régénérer
        </button>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="font-display text-sm text-text">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
