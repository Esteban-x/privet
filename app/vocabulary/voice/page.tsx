"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import DirectionToggle from "@/components/exercises/DirectionToggle";
import SessionSummary from "@/components/exercises/SessionSummary";
import { loadDirection, saveDirection, type VocabDirection } from "@/lib/storage";
import { canSpeak, speak, useSpeechRecognition } from "@/lib/vocabulary/speech";
import { fetchDailyProgress } from "@/lib/vocabulary/custom";
import { useReviewQueue } from "@/lib/vocabulary/useReviewQueue";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";

const RU_LANG = "ru-RU";

export default function VoicePage() {
  return (
    <Suspense fallback={null}>
      <VoiceInner />
    </Suspense>
  );
}

function VoiceInner() {
  const searchParams = useSearchParams();
  const listId = searchParams.get("list");

  const [direction, setDirection] = useState<VocabDirection>(() =>
    loadDirection("voice", "ru-first")
  );
  function changeDirection(d: VocabDirection) {
    setDirection(d);
    saveDirection("voice", d);
  }

  const [revealed, setRevealed] = useState(false);
  const {
    current,
    review,
    reload,
    loading,
    loadError,
    listName,
    sessionIndex,
    sessionCorrect,
    noWordsAtAll,
  } = useReviewQueue(listId);
  const { supported: micSupported, listening, transcript, start, stop } = useSpeechRecognition(RU_LANG);
  const ttsSupported = canSpeak();

  const [daily, setDaily] = useState<{ reviewedToday: number; goal: number } | null>(null);
  useEffect(() => {
    fetchDailyProgress().then(setDaily).catch(() => {});
  }, []);

  // Nouveau mot : efface la tentative précédente. Ajusté pendant le rendu
  // (plutôt que dans un effet) en comparant à l'id précédemment vu — pas de
  // rendu intermédiaire périmé.
  const [seenQuestionId, setSeenQuestionId] = useState(current?.id);
  if (current?.id !== seenQuestionId) {
    setSeenQuestionId(current?.id);
    setRevealed(false);
  }

  // Lecture automatique de la prononciation en mode écoute (ru-first) : reste
  // dans un effet, c'est un vrai effet de bord (audio) déclenché par le
  // changement de mot, pas un simple ajustement d'état React.
  useEffect(() => {
    if (current && direction === "ru-first" && ttsSupported) speak(current.ru, RU_LANG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  function handleReview(quality: Parameters<typeof review>[0]) {
    review(quality);
    setRevealed(false);
  }

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

  const listenAndRecall = direction === "ru-first";

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

      <p className="mb-4 text-center font-display text-xs font-semibold uppercase tracking-wide text-muted">
        {current.theme} · mot {sessionIndex + 1}
      </p>

      <div className="rounded-[20px] border border-border bg-bg2 p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        {listenAndRecall ? (
          <>
            <p className="font-display text-sm text-muted">Écoute et devine le sens :</p>
            <button
              onClick={() => speak(current.ru, RU_LANG)}
              disabled={!ttsSupported}
              className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Écouter le mot russe"
            >
              🔊
            </button>
            {!ttsSupported && (
              <p className="mt-3 font-display text-xs text-muted">
                La synthèse vocale n&apos;est pas disponible sur ce navigateur.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-display text-sm text-muted">Dis ce mot en russe :</p>
            <p className="mt-2 font-display text-3xl font-bold text-accent2">{current.fr}</p>
            <button
              onClick={() => speak(current.ru, RU_LANG)}
              disabled={!ttsSupported}
              className="mt-4 font-display text-xs font-semibold text-accent underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              🔊 Entendre la prononciation
            </button>
          </>
        )}

        {micSupported && (
          <div className="mt-6">
            <button
              onClick={listening ? stop : start}
              className={`rounded-[10px] border px-5 py-2.5 font-display text-sm font-semibold transition-colors ${
                listening
                  ? "border-accent2 bg-accent2/10 text-accent2"
                  : "border-border text-text hover:border-accent"
              }`}
            >
              {listening ? "● Enregistrement… (clique pour arrêter)" : "🎙 S'enregistrer"}
            </button>
            {transcript && (
              <p className="mt-3 font-display text-sm text-muted">
                J&apos;ai entendu : <span className="text-text">« {transcript} »</span> — à toi de
                juger si c&apos;est ce que tu visais.
              </p>
            )}
          </div>
        )}
        {!micSupported && (
          <p className="mt-4 font-display text-xs text-muted">
            L&apos;enregistrement vocal n&apos;est pas disponible sur ce navigateur (essaie Chrome
            ou Edge) — tu peux quand même écouter et t&apos;auto-évaluer.
          </p>
        )}

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-8 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Révéler la réponse
          </button>
        ) : (
          <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4 text-left">
            <p className="font-display text-2xl font-bold text-accent">{current.ru}</p>
            <p className="font-display text-sm text-muted">{current.transliteration}</p>
            <p className="mt-2 font-display text-base">{current.fr}</p>
            {current.example && (
              <p className="mt-3 font-display text-sm text-muted">
                {current.example.ru} <span className="italic">— {current.example.fr}</span>
              </p>
            )}
          </div>
        )}
      </div>

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
