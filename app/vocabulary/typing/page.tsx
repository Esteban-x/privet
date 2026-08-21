"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VOCAB, VocabItem } from "@/lib/vocabulary/data";

function pickRandom(exclude?: string): VocabItem {
  const pool = exclude ? VOCAB.filter((v) => v.id !== exclude) : VOCAB;
  return pool[Math.floor(Math.random() * pool.length)];
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/ё/g, "е");
}

export default function TypingPage() {
  // Le tirage aléatoire ne doit se faire que côté client pour éviter un
  // mismatch d'hydratation SSR/CSR (Math.random diffère entre les deux rendus).
  const [current, setCurrent] = useState<VocabItem | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    setCurrent(pickRandom());
  }, []);

  function submit() {
    if (!current) return;
    if (!input.trim() || result) return;
    const ok = normalize(input) === normalize(current.ru);
    setResult(ok ? "correct" : "incorrect");
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setCurrent((c) => pickRandom(c?.id));
    setInput("");
    setResult(null);
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/vocabulary"
        className="mb-8 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Vocabulaire
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
          {current.theme}
        </p>
        <p className="font-display text-xs font-semibold text-muted">
          Score : {score.correct}/{score.total}
        </p>
      </div>

      <div className="rounded-[20px] border border-border bg-bg2 p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <p className="font-display text-sm text-muted">Écris ce mot en russe :</p>
        <p className="mt-2 font-display text-3xl font-bold text-accent2">{current.fr}</p>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (result ? next() : submit())}
          placeholder="Тапи здесь…"
          disabled={!!result}
          autoFocus
          className="mt-6 w-full rounded-[10px] border border-border bg-bg px-4 py-3 text-center font-display text-2xl text-text outline-none placeholder:text-muted/60 focus:border-accent disabled:opacity-60"
        />

        {result && (
          <div
            className={`mt-4 rounded-xl border p-3 ${
              result === "correct"
                ? "border-success bg-success/10"
                : "border-accent2 bg-accent2/10"
            }`}
          >
            <p className="font-display text-sm font-bold uppercase">
              {result === "correct" ? "✓ Correct" : "✗ Presque"}
            </p>
            <p className="font-display text-xl font-bold">{current.ru}</p>
            <p className="font-display text-sm text-muted">{current.transliteration}</p>
          </div>
        )}

        <button
          onClick={result ? next : submit}
          className="mt-6 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
        >
          {result ? "Suivant →" : "Vérifier"}
        </button>
      </div>
    </div>
  );
}
