"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import DirectionToggle from "@/components/exercises/DirectionToggle";
import SessionSummary from "@/components/exercises/SessionSummary";
import { loadDirection, saveDirection, type VocabDirection } from "@/lib/storage";
import { onSpeechBusy, prefetchRu, speakRu, useSpeechRecognition } from "@/lib/vocabulary/speech";
import { fetchDailyProgress } from "@/lib/vocabulary/custom";
import { useReviewQueue } from "@/lib/vocabulary/useReviewQueue";
import PaywallNotice from "@/components/ui/PaywallNotice";
import AllKnownState from "@/components/vocabulary/AllKnownState";
import FocusControl from "@/components/vocabulary/FocusControl";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";
import { MicIcon, SpeakerIcon } from "@/components/ui/icons";

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
  const { supported: micSupported, listening, transcript, start, stop } = useSpeechRecognition(RU_LANG);

  // La synthèse d'un mot INÉDIT demande une seconde et demie. Sur cette
  // page l'attente est la plus pénible de l'app : en mode écoute, le mot
  // part tout seul, et sans rien à l'écran l'apprenant fixe un bouton muet
  // sans savoir si quelque chose arrive.
  //
  // ABONNEMENT, et non état local : « une synthèse est en cours » vit dans
  // la couche audio, pas dans ce composant. La lecture automatique plus bas
  // part d'un effet — y poser un setState placerait une mise à jour dans le
  // corps synchrone de l'effet. Ici c'est la couche audio qui prévient, et
  // le setState a lieu dans son callback : le motif que React recommande.
  // Bénéfice au passage, l'indicateur couvre les deux boutons ET la lecture
  // automatique sans qu'aucun des trois n'ait à s'en occuper.
  const [loadingAudio, setLoadingAudio] = useState(false);
  useEffect(() => onSpeechBusy(setLoadingAudio), []);

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
    if (!current) return;
    if (direction === "ru-first") void speakRu(current.ru);
    // En mode « dis ce mot », l'audio n'est pas joué mais le bouton
    // « entendre la prononciation » est à un clic : on le prépare pendant
    // que l'apprenant réfléchit, sinon le son arrive après coup.
    else prefetchRu(current.ru);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

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

  const listenAndRecall = direction === "ru-first";

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
        {current.theme} · mot {sessionIndex + 1}
      </p>

      {/* Le même sélecteur que sur la carte d'une liste, à la même place
          dans le geste : ce que l'apprenant décide ici vaut pour toutes les
          révisions à venir. */}
      <div className="mb-4 flex justify-center">
        <FocusControl value={currentFocus} word={current.ru} onChange={setFocus} />
      </div>

      <div className="rounded-[20px] surface p-8 text-center shadow-float">
        {listenAndRecall ? (
          <>
            <p className="font-display text-sm text-muted">Écoute et devine le sens :</p>
            {/* L'anneau qui pulse pendant l'attente est POSÉ SUR le bouton
                (inset-0, pointer-events-none) et ne le remplace pas : la
                cible de clic garde sa taille et sa place, on ne perd pas le
                bouton sous le curseur au moment où il s'anime. */}
            <div className="relative mx-auto mt-5 h-20 w-20">
              {loadingAudio && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-accent/40"
                />
              )}
              <button
                onClick={() => void speakRu(current.ru)}
                aria-busy={loadingAudio}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl text-white transition-[filter] hover:brightness-110"
                aria-label="Écouter le mot russe"
              >
                <SpeakerIcon className="h-7 w-7" />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-sm text-muted">Dis ce mot en russe :</p>
            <p className="mt-2 font-display text-3xl font-bold text-accent2">{current.fr}</p>
            <button
              onClick={() => void speakRu(current.ru)}
              aria-busy={loadingAudio}
              className="mx-auto mt-4 inline-flex items-center gap-1.5 font-display text-xs font-semibold text-accent underline-offset-4 hover:underline"
            >
              <SpeakerIcon className="h-3.5 w-3.5 shrink-0" />
              {loadingAudio ? "Préparation…" : "Entendre la prononciation"}
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
                  : "border-border text-text hover:bg-accent/10 hover:border-accent/35"
              }`}
            >
              {listening ? (
                "Enregistrement… (clique pour arrêter)"
              ) : (
                <>
                  <MicIcon className="h-4 w-4" />
                  S&apos;enregistrer
                </>
              )}
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
            className="btn btn-primary btn-sheen mt-8 w-full rounded-[10px] py-3 font-display text-sm"
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
