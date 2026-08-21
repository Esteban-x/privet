"use client";

import { useState } from "react";
import { ReadingText } from "@/lib/reading/texts";
import ReadingPassage from "./ReadingPassage";

export default function AiReadingGenerator() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<ReadingText | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/reading", { method: "POST" });
      if (res.status === 401) {
        setError("Connecte-toi pour générer un texte personnalisé.");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      // On adapte la réponse IA au format ReadingText attendu par ReadingPassage.
      const t = data.text;
      setText({
        id: "ai-generated",
        title: t.title ?? "Texte généré",
        level: t.level ?? "A1",
        sentences: t.sentences ?? [],
      });
    } catch {
      setError("Génération indisponible. Vérifie ta configuration Anthropic.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[20px] border border-dashed border-accent/50 bg-accent/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Texte sur mesure</h3>
          <p className="mt-0.5 font-display text-sm text-muted">
            Un texte original généré pour ton niveau et tes thèmes.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-[10px] bg-accent px-5 py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Génération…" : "Générer un texte"}
        </button>
      </div>

      {error && <p className="mt-4 font-display text-sm text-accent2">{error}</p>}

      {text && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-border px-2.5 py-0.5 font-display text-xs font-semibold text-muted">
              {text.level}
            </span>
            <h4 className="font-display text-xl font-bold">{text.title}</h4>
          </div>
          <ReadingPassage text={text} />
        </div>
      )}
    </div>
  );
}
