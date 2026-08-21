"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { VOCAB } from "@/lib/vocabulary/data";
import { getOrCreateCard, loadSrsCards, saveSrsCards } from "@/lib/storage";
import { isDue, Quality, reviewCard } from "@/lib/srs/sm2";

export default function FlashcardsPage() {
  const [cards, setCards] = useState(() => loadSrsCards());
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);

  const queue = useMemo(() => {
    const due = VOCAB.filter((v) => isDue(getOrCreateCard(cards, v.id)));
    return due.length > 0 ? due : VOCAB;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDone]);

  const current = queue[0];

  function handleReview(quality: Quality) {
    if (!current) return;
    const card = getOrCreateCard(cards, current.id);
    const updated = reviewCard(card, quality);
    const nextCards = { ...cards, [current.id]: updated };
    saveSrsCards(nextCards);
    setCards(nextCards);
    setRevealed(false);
    setSessionDone((n) => n + 1);
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-2xl font-bold">Session terminée 🎉</p>
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

      <p className="mb-4 text-center font-display text-xs font-semibold uppercase tracking-wide text-muted">
        {current.theme} · carte {sessionDone + 1}
      </p>

      <button
        onClick={() => setRevealed((r) => !r)}
        className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-[20px] border border-border bg-bg2 px-6 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5"
      >
        {!revealed ? (
          <>
            <span className="font-display text-4xl font-bold">{current.ru}</span>
            <span className="mt-3 font-display text-sm text-muted">{current.transliteration}</span>
            <span className="mt-8 font-display text-xs font-semibold uppercase tracking-wide text-accent">
              Clique pour révéler
            </span>
          </>
        ) : (
          <>
            <span className="font-display text-3xl font-bold text-accent">{current.fr}</span>
            <span className="mt-4 font-display text-lg text-muted">{current.ru}</span>
          </>
        )}
      </button>

      {revealed && (
        <div className="mt-6 grid grid-cols-4 gap-2.5">
          <QualityButton label="À revoir" color="var(--color-accent2-deep)" onClick={() => handleReview(1)} />
          <QualityButton label="Difficile" color="var(--color-accent2)" onClick={() => handleReview(3)} />
          <QualityButton label="Bien" color="var(--color-accent)" onClick={() => handleReview(4)} />
          <QualityButton label="Facile" color="var(--color-success)" onClick={() => handleReview(5)} />
        </div>
      )}
    </div>
  );
}

function QualityButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[10px] py-3 font-display text-xs font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: color }}
    >
      {label}
    </button>
  );
}
