"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import DirectionToggle from "@/components/exercises/DirectionToggle";
import SessionSummary from "@/components/exercises/SessionSummary";
import { loadDirection, saveDirection, type VocabDirection } from "@/lib/storage";
import { fetchDailyProgress } from "@/lib/vocabulary/custom";
import { useReviewQueue } from "@/lib/vocabulary/useReviewQueue";
import PaywallNotice from "@/components/ui/PaywallNotice";
import AllKnownState from "@/components/vocabulary/AllKnownState";
import FocusControl from "@/components/vocabulary/FocusControl";
import WordExplanation from "@/components/vocabulary/WordExplanation";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={null}>
      <FlashcardsInner />
    </Suspense>
  );
}

function FlashcardsInner() {
  const searchParams = useSearchParams();
  const listId = searchParams.get("list");

  const [direction, setDirection] = useState<VocabDirection>(() =>
    loadDirection("flashcards", "ru-first")
  );
  function changeDirection(d: VocabDirection) {
    setDirection(d);
    saveDirection("flashcards", d);
  }

  const [revealed, setRevealed] = useState(false);
  const {
    blocked,
    current,
    review,
    reload,
    loading,
    loadError,
    listName,
    sessionIndex,
    sessionCorrect,
    noWordsAtAll,
    allKnown,
    currentFocus,
    setFocus,
  } = useReviewQueue(listId);

  const [daily, setDaily] = useState<{ reviewedToday: number; goal: number } | null>(null);
  useEffect(() => {
    fetchDailyProgress().then(setDaily).catch(() => {});
  }, []);

  function handleReview(quality: Parameters<typeof review>[0]) {
    review(quality);
    setRevealed(false);
  }

  const backHref = listId ? `/vocabulary/lists/${listId}` : "/vocabulary/review";
  const backLabel = listId ? `← ${listName || "Liste"}` : "← Révision";

  // Le plafond de révisions du plan gratuit passe AVANT tout le reste :
  // une fois atteint, il n'y a plus ni carte à charger ni file à résumer.
  if (blocked) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8 sm:py-16">
        <PaywallNotice
          quota={blocked.quota}
          message={blocked.message}
          what="la révision du vocabulaire"
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-24 text-center">
        <p className="font-display text-lg text-danger">{loadError}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8 sm:py-16">
        <ReviewCardSkeleton />
      </div>
    );
  }

  if (noWordsAtAll) {
    return <EmptyState />;
  }

  if (allKnown) {
    return <AllKnownState backHref={backHref} backLabel={backLabel} />;
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-24">
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

  const frontText = direction === "ru-first" ? current.ru : current.fr;
  const frontSub = direction === "ru-first" ? current.transliteration : null;
  const backText = direction === "ru-first" ? current.fr : current.ru;
  const backSub = direction === "ru-first" ? current.ru : current.transliteration;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
        >
          {backLabel}
        </Link>
        <DirectionToggle direction={direction} onChange={changeDirection} />
      </div>

      <p className="mb-4 text-center font-display text-xs font-semibold uppercase tracking-wide text-muted">
        {current.theme} · carte {sessionIndex + 1}
      </p>

      {/* Le même sélecteur que sur la carte d'une liste, à la même place
          dans le geste : ce que l'apprenant décide ici vaut pour toutes les
          révisions à venir. */}
      <div className="mb-4 flex justify-center">
        <FocusControl value={currentFocus} word={current.ru} onChange={setFocus} />
      </div>

      <button
        onClick={() => setRevealed((r) => !r)}
        className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-[20px] surface-interactive px-6 text-center shadow-float transition-transform hover:-translate-y-0.5"
      >
        {!revealed ? (
          <>
            <span className="font-display text-4xl font-bold">{frontText}</span>
            {frontSub && <span className="mt-3 font-display text-sm text-muted">{frontSub}</span>}
            <span className="mt-8 font-display text-xs font-semibold uppercase tracking-wide text-accent">
              Clique pour révéler
            </span>
          </>
        ) : (
          <>
            <span className="font-display text-3xl font-bold text-accent">{backText}</span>
            {backSub && <span className="mt-4 font-display text-lg text-muted">{backSub}</span>}
          </>
        )}
      </button>

      {/* Une fois la réponse vue, et seulement là : c'est le moment où une
          nuance ou un piège s'ancre, pas avant, où elle donnerait la
          réponse. La fiche est mise en cache côté serveur, donc gratuite
          aux passages suivants. */}
      {revealed && (
        <div className="mt-4 flex justify-center">
          <WordExplanation key={current.id} wordId={current.id} />
        </div>
      )}

      {revealed && (
        <div className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-2.5">
          <QualityButton label="À revoir" color="var(--color-accent2-deep)" onClick={() => handleReview(1)} />
          <QualityButton label="Difficile" color="var(--color-accent2)" onClick={() => handleReview(3)} />
          <QualityButton label="Bien" color="var(--color-accent)" onClick={() => handleReview(4)} />
          <QualityButton label="Facile" color="var(--color-success)" onClick={() => handleReview(5)} />
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md px-6 py-14 sm:py-24 text-center">
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
        className="btn btn-primary btn-sheen mt-5 inline-block rounded-[10px] px-5 py-2.5 font-display text-sm"
      >
        Aller à mes listes
      </Link>
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
      className="rounded-[10px] px-1 py-3 font-display text-[11px] font-semibold whitespace-nowrap text-white transition-opacity hover:opacity-90 sm:text-xs"
      style={{ background: color }}
    >
      {label}
    </button>
  );
}
