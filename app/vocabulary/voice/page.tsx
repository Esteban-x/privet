"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import DirectionToggle from "@/components/exercises/DirectionToggle";
import SessionSummary from "@/components/exercises/SessionSummary";
import { loadDirection, saveDirection, type VocabDirection } from "@/lib/storage";
import {
  ANSWER_LANG,
  onSpeechBusy,
  prefetchRu,
  speakRu,
  useSpeechRecognition,
} from "@/lib/vocabulary/speech";
import { fetchDailyProgress } from "@/lib/vocabulary/custom";
import { matchesAnswer } from "@/lib/vocabulary/answer-check";
import { useReviewQueue } from "@/lib/vocabulary/useReviewQueue";
import PaywallNotice from "@/components/ui/PaywallNotice";
import AllKnownState from "@/components/vocabulary/AllKnownState";
import FocusControl from "@/components/vocabulary/FocusControl";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";
import { MicIcon, SpeakerIcon } from "@/components/ui/icons";

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
  const {
    supported: micSupported,
    listening,
    transcript,
    error: micError,
    start,
    stop,
    reset: resetSpeech,
  } = useSpeechRecognition(ANSWER_LANG[direction]);

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
    // Le transcript du mot PRÉCÉDENT restait sous le nouveau : on validait
    // une réponse qu'on n'avait pas donnée.
    resetSpeech();
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

  /**
   * Le transcript ressemble-t-il à la réponse attendue ?
   *
   * `matchesAnswer` est la même comparaison que le mode Frappe — elle
   * tolère les variantes (« voiture, auto »), les articles et les accents
   * français. Ici elle n'ALIMENTE RIEN : ni SRS, ni série, ni précision.
   * C'est un indice affiché à côté de ce qui a été entendu, et l'apprenant
   * garde le dernier mot, parce qu'une reconnaissance vocale se trompe
   * assez souvent pour qu'on ne lui confie pas une note.
   */
  const heardMatches =
    transcript.trim().length > 0 &&
    matchesAnswer(transcript, listenAndRecall ? current.fr : current.ru);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent-ink"
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
        <p className="font-display text-sm text-muted">
          {listenAndRecall ? "Écoute, et dis le sens en français :" : "Dis ce mot en russe :"}
        </p>

        {/* LA SEULE DIFFÉRENCE ENTRE LES DEUX SENS. En « dis ce mot », le
            français est la consigne ; en « écoute et devine », le mot EST la
            réponse et ne peut pas s'afficher. La ligne reste occupée par un
            point d'interrogation de même taille pour que les commandes, en
            dessous, tombent exactement au même endroit dans les deux cartes —
            on ne cherche pas le bouton après avoir changé de sens. */}
        {listenAndRecall ? (
          <p className="mt-2 font-display text-3xl font-bold text-muted/40" aria-hidden>
            ?
          </p>
        ) : (
          <p className="mt-2 font-display text-3xl font-bold text-accent2">{current.fr}</p>
        )}

        {/* Deux pastilles de même forme, même largeur, même rangée : écouter
            et parler sont deux gestes de même rang. L'ancienne carte opposait
            un disque de 80 px d'un côté à un lien souligné de l'autre, et le
            bouton d'enregistrement n'avait pas de `flex` — son pictogramme et
            son libellé ne s'alignaient pas. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => void speakRu(current.ru)}
            aria-busy={loadingAudio}
            aria-label="Écouter le mot russe"
            className="relative inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 font-display text-sm font-semibold text-text transition-colors hover:border-accent/35 hover:bg-accent/10"
          >
            {/* L'anneau est POSÉ SUR le bouton et ne le remplace pas : la
                cible de clic garde sa taille pendant l'attente. */}
            {loadingAudio && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-accent/25"
              />
            )}
            <SpeakerIcon className="h-4 w-4 shrink-0" />
            {loadingAudio ? "Préparation…" : "Écouter"}
          </button>

          {micSupported && (
            <button
              onClick={listening ? stop : start}
              aria-pressed={listening}
              className={`inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-full border px-5 py-2.5 font-display text-sm font-semibold transition-colors ${
                listening
                  ? "border-accent2 bg-accent2/10 text-accent2"
                  : "border-border text-text hover:border-accent/35 hover:bg-accent/10"
              }`}
            >
              <MicIcon className={`h-4 w-4 shrink-0 ${listening ? "wave-pulse" : ""}`} />
              {listening ? "J’écoute…" : listenAndRecall ? "Dire en français" : "Dire en russe"}
            </button>
          )}
        </div>

        {/* CE QUI A ÉTÉ ENTENDU, ET LA MAIN RENDUE À L'APPRENANT.
            Le transcript s'affichait comme une remarque en passant, sans
            suite : il fallait ensuite aller chercher « Révéler la réponse »
            plus bas, comme si on n'avait rien dit. Il devient une étape —
            on valide, ou on recommence.

            LE RAPPROCHEMENT EST UN INDICE, PAS UNE NOTE. La reconnaissance
            se trompe sur un accent, une syllabe avalée, un homophone ; lui
            laisser le dernier mot noterait le micro et non l'apprenant.
            C'est pour ça que « Valider » ne fait que RÉVÉLER : les quatre
            boutons de qualité restent le seul jugement enregistré. */}
        {transcript && !revealed && (
          <div className="mt-4 rounded-xl border border-border bg-bg p-4">
            <p className="font-display text-sm text-muted">
              J&apos;ai entendu : <span className="font-semibold text-text">« {transcript} »</span>
            </p>
            <p
              className={`mt-1 font-display text-xs font-semibold ${
                heardMatches ? "text-success" : "text-muted"
              }`}
            >
              {heardMatches
                ? "✓ Ça correspond à la réponse attendue."
                : "Je ne retrouve pas la réponse attendue — mais je peux avoir mal entendu."}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setRevealed(true)}
                className="btn btn-primary rounded-full px-5 py-2 font-display text-sm font-semibold"
              >
                Valider
              </button>
              <button
                onClick={start}
                className="rounded-full border border-border px-5 py-2 font-display text-sm font-semibold text-text transition-colors hover:border-accent/35 hover:bg-accent/10"
              >
                Redire
              </button>
            </div>
          </div>
        )}

        {/* CE QUI A EMPÊCHÉ L'ÉCOUTE, ÉCRIT. Le micro qui refuse de démarrer
            ne disait rien : le bouton s'allumait et restait allumé. */}
        {micError && <p className="mt-3 font-display text-sm text-danger">{micError}</p>}

        {!micSupported && (
          <p className="mt-4 font-display text-xs text-muted">
            L&apos;enregistrement vocal n&apos;est pas disponible sur ce navigateur (essaie Chrome
            ou Edge) — tu peux quand même écouter et t&apos;auto-évaluer.
          </p>
        )}

        {/* « Révéler la réponse » S'EFFACE DÈS QU'ON A PARLÉ : le « Valider »
            de l'encadré ci-dessus fait exactement la même chose, et deux
            boutons pour un seul geste font hésiter sur ce qui les distingue.
            Il reste pour qui n'utilise pas le micro — ou n'en a pas. */}
        {!revealed ? (
          !transcript && (
            <button
              onClick={() => setRevealed(true)}
              className="btn btn-primary btn-sheen mt-8 w-full rounded-[10px] py-3 font-display text-sm"
            >
              Révéler la réponse
            </button>
          )
        ) : (
          <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4 text-left">
            <p className="font-display text-2xl font-bold text-accent-ink">{current.ru}</p>
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
          <QualityButton label="Bien" color="var(--color-accent-ink)" onClick={() => handleReview(4)} />
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
        <Link href="/account" className="text-accent-ink hover:underline">
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
      className="rounded-[10px] px-1 py-3 font-display text-[11px] font-semibold whitespace-nowrap text-on-tint transition-opacity hover:opacity-90 sm:text-xs"
      style={{ background: color }}
    >
      {label}
    </button>
  );
}
