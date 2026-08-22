"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import DirectionToggle from "@/components/exercises/DirectionToggle";
import SessionSummary from "@/components/exercises/SessionSummary";
import { loadDirection, saveDirection, type VocabDirection } from "@/lib/storage";
import { fetchDailyProgress } from "@/lib/vocabulary/custom";
import { useReviewQueue } from "@/lib/vocabulary/useReviewQueue";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QcmPage() {
  return (
    <Suspense fallback={null}>
      <QcmInner />
    </Suspense>
  );
}

function QcmInner() {
  const searchParams = useSearchParams();
  const listId = searchParams.get("list");

  const [direction, setDirection] = useState<VocabDirection>(() => loadDirection("qcm", "ru-first"));
  function changeDirection(d: VocabDirection) {
    setDirection(d);
    saveDirection("qcm", d);
  }

  const [picked, setPicked] = useState<string | null>(null);
  const {
    current,
    review,
    reload,
    pool,
    loading,
    loadError,
    listName,
    sessionIndex,
    sessionCorrect,
    noWordsAtAll,
  } = useReviewQueue(listId);

  const [daily, setDaily] = useState<{ reviewedToday: number; goal: number } | null>(null);
  useEffect(() => {
    fetchDailyProgress().then(setDaily).catch(() => {});
  }, []);

  // Nouveau mot : efface le choix précédent. Ajusté pendant le rendu
  // (comparaison à l'id précédemment vu) plutôt que dans un effet.
  const [seenQuestionId, setSeenQuestionId] = useState(current?.id);
  if (current?.id !== seenQuestionId) {
    setSeenQuestionId(current?.id);
    setPicked(null);
  }

  const expectedIsRussian = direction !== "ru-first";
  const correctAnswer = current ? (expectedIsRussian ? current.ru : current.fr) : "";

  const options = useMemo(() => {
    if (!current) return [];
    const others = pool.filter((w) => w.id !== current.id);
    const shuffledOthers = shuffle(others);
    const seen = new Set([correctAnswer]);
    const distractors: string[] = [];
    for (const w of shuffledOthers) {
      const text = expectedIsRussian ? w.ru : w.fr;
      if (seen.has(text)) continue;
      seen.add(text);
      distractors.push(text);
      if (distractors.length >= 3) break;
    }
    return shuffle([correctAnswer, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, pool, direction]);

  const backHref = listId ? `/vocabulary/lists/${listId}` : "/vocabulary/review";
  const backLabel = listId ? `← ${listName || "Liste"}` : "← Révision";

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-lg text-danger">{loadError}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <ReviewCardSkeleton />
      </div>
    );
  }

  if (noWordsAtAll) {
    return <EmptyState />;
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <SessionSummary
          reviewed={sessionIndex}
          correct={sessionCorrect}
          goal={daily?.goal ?? 15}
          reviewedTodayTotal={(daily?.reviewedToday ?? 0) + sessionIndex}
          backHref={backHref}
          backLabel={backLabel}
          onRestart={reload}
        />
      </div>
    );
  }

  if (options.length < 2) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-lg font-semibold">Pas assez de mots pour un QCM ici</p>
        <p className="mt-2 font-display text-sm text-muted">
          Ajoute d&apos;autres mots à cette liste, ou essaie la révision globale.
        </p>
        <Link
          href={backHref}
          className="mt-5 inline-block rounded-[10px] bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
        >
          {backLabel}
        </Link>
      </div>
    );
  }

  const clue = expectedIsRussian ? current.fr : current.ru;
  const instruction = expectedIsRussian
    ? "Quelle est la traduction en russe ?"
    : "Quelle est la traduction en français ?";

  function selectOption(opt: string) {
    if (picked) return;
    setPicked(opt);
  }

  function next() {
    if (!picked) return;
    review(picked === correctAnswer ? 4 : 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
        >
          {backLabel}
        </Link>
        <DirectionToggle direction={direction} onChange={changeDirection} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
          {current.theme} · mot {sessionIndex + 1}
        </p>
        <p className="font-display text-xs font-semibold text-muted">
          {sessionCorrect}/{sessionIndex} correct
        </p>
      </div>

      <div className="rounded-[20px] border border-border bg-bg2 p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <p className="font-display text-sm text-muted">{instruction}</p>
        <p className="mt-2 font-display text-3xl font-bold text-accent2">{clue}</p>

        <div className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((opt) => {
            const isCorrectOpt = picked && opt === correctAnswer;
            const isPickedWrong = picked === opt && opt !== correctAnswer;
            return (
              <button
                key={opt}
                onClick={() => selectOption(opt)}
                disabled={!!picked}
                className={`rounded-[10px] border px-4 py-3 font-display text-lg font-semibold transition-colors ${
                  isCorrectOpt
                    ? "border-success bg-success/10 text-success"
                    : isPickedWrong
                      ? "border-danger bg-danger/10 text-danger"
                      : "border-border bg-bg text-text hover:border-accent"
                } disabled:cursor-default`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked && (
          <button
            onClick={next}
            className="mt-6 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-display text-lg font-semibold">Aucun mot à réviser pour l&apos;instant</p>
      <p className="mt-2 font-display text-sm text-muted">
        Choisis des thèmes dans ton{" "}
        <Link href="/account" className="text-accent hover:underline">
          profil
        </Link>{" "}
        pour obtenir des mots tout faits, ou crée ta propre liste.
      </p>
      <Link
        href="/vocabulary"
        className="mt-5 inline-block rounded-[10px] bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
      >
        Aller à mes listes
      </Link>
    </div>
  );
}
