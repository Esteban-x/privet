"use client";

import { useEffect, useState } from "react";
import type { PracticeExercise } from "@/lib/exercises/types";
import PaywallNotice from "@/components/ui/PaywallNotice";
import { usePracticeAttempt } from "@/lib/practice/attempt-client";

/**
 * Le moteur d'entraînement partagé par les modules récents.
 *
 * Il ne sait rien du russe : il reçoit une fonction qui tire un exercice et
 * l'identifiant du module, affiche le QCM, envoie la réponse au serveur et
 * montre le verdict. Toute la matière — la banque, le tirage, la correction
 * — reste dans le module.
 *
 * DEUX RÈGLES REPRISES DES MODULES EXISTANTS. Le tirage a lieu APRÈS le
 * montage, jamais au rendu initial : serveur et client tireraient sinon deux
 * exercices différents et l'hydratation casserait. Et le client n'annonce
 * jamais « j'ai eu juste » — il envoie ce qu'il a choisi, le serveur rejuge
 * depuis la banque, si bien que l'écran ne peut pas afficher autre chose que
 * ce qui est enregistré.
 */

type Feedback = { correct: boolean; reason: string } | null;

export default function PracticeRunner({
  module: moduleId,
  moduleTitle,
  skill,
  color,
  generate,
}: {
  module: string;
  moduleTitle: string;
  skill: string;
  color: string;
  generate: (skill: string) => PracticeExercise;
}) {
  const [exercise, setExercise] = useState<PracticeExercise | null>(null);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  // Le plafond de pratique du plan gratuit. `blocked` remplace la carte
  // par l'écran d'abonnement ; `stopHere` l'anticipe d'un exercice pour
  // ne pas faire répondre à un exercice qui allait être refusé.
  const { blocked, submit, stopHere } = usePracticeAttempt("/api/exercises/attempt");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(generate(skill)).then((next) => {
      if (!cancelled) setExercise(next);
    });
    return () => {
      cancelled = true;
    };
    // `generate` est une fonction stable exportée par le module : la lister
    // ici relancerait le tirage à chaque rendu du parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, round]);

  function next() {
    if (stopHere()) return;
    setFeedback(null);
    setPicked(null);
    setChecking(false);
    setExercise(null);
    setRound((r) => r + 1);
  }

  async function answer(option: string) {
    if (!exercise || feedback || checking) return;
    setPicked(option);
    setChecking(true);
    const outcome = await submit({
      module: moduleId,
      skill,
      itemId: exercise.itemId,
      answer: option,
    });
    setChecking(false);

    // Plafond atteint : le hook a déjà basculé l'écran sur l'abonnement.
    // Surtout ne rien corriger ici — afficher un verdict local reviendrait à
    // laisser la pratique continuer malgré le refus.
    if (outcome.kind === "blocked") return;

    if (outcome.kind === "verdict") {
      const correct = outcome.data.correct === true;
      setFeedback({ correct, reason: exercise.explain });
      setStreak((s) => (correct ? s + 1 : 0));
      if (typeof outcome.data.accuracy === "number") setAccuracy(outcome.data.accuracy);
      return;
    }

    // Serveur indisponible ou visiteur non connecté : on corrige en local
    // pour ne pas bloquer l'entraînement. La tentative n'est simplement pas
    // comptabilisée.
    const correct = option === exercise.options[exercise.correctIndex];
    setFeedback({ correct, reason: exercise.explain });
    setStreak((s) => (correct ? s + 1 : 0));
  }

  const [before, after] = exercise ? splitQuestion(exercise.question) : ["", ""];

  if (blocked) {
    return <PaywallNotice quota={blocked.quota} message={blocked.message} what="les exercices" />;
  }

  return (
    <div className="overflow-hidden rounded-[20px] surface shadow-float">
      <div
        className="flex items-center justify-between gap-3 px-5 py-3 text-white sm:px-6 sm:py-3.5"
        style={{ background: color }}
      >
        <span className="min-w-0 truncate font-display text-[13px] font-semibold uppercase tracking-wide sm:text-sm">
          {moduleTitle}
        </span>
        <span className="shrink-0 font-display text-xs font-bold">
          Série : {streak}
          {accuracy !== null ? ` · ${accuracy}%` : ""}
        </span>
      </div>

      <div className="p-5 sm:p-7">
        {!exercise ? (
          <div className="animate-fade-in space-y-4">
            <div className="skeleton h-4 w-40 rounded-full" />
            <div className="skeleton h-8 w-4/5 rounded-lg" />
            <div className="skeleton h-5 w-2/3 rounded-lg" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-[50px] rounded-[10px]" />
              ))}
            </div>
          </div>
        ) : (
          <div key={round} className="animate-fade-in">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
                {exercise.prompt}
              </span>
              {exercise.badge && (
                <span
                  className="inline-flex items-center rounded-full bg-bg3 px-3 py-1 font-display text-xs font-semibold"
                  style={{ color }}
                >
                  {exercise.badge}
                </span>
              )}
            </div>

            <p className="font-display text-2xl font-bold leading-snug">
              {before}
              {after !== null && (
                <span className="inline-block min-w-[80px] border-b-2 border-accent">&nbsp;</span>
              )}
              {after}
            </p>
            {exercise.hint && (
              <p className="mt-1.5 font-display text-sm italic text-muted">{exercise.hint}</p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {exercise.options.map((option) => {
                const isAnswer = feedback && option === exercise.options[exercise.correctIndex];
                const isWrongPick = feedback && !feedback.correct && option === picked;
                return (
                  <button
                    key={option}
                    onClick={() => answer(option)}
                    disabled={Boolean(feedback) || checking}
                    className={`rounded-[10px] border px-4 py-3 font-display text-lg font-semibold transition-colors duration-200 ${
                      isAnswer
                        ? "border-success bg-success/10 text-success"
                        : isWrongPick
                          ? "border-danger bg-danger/10 text-danger"
                          : "border-border bg-bg text-text hover:bg-accent/10 hover:border-accent/35"
                    } disabled:cursor-default`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <>
                <div
                  className={`mt-5 animate-fade-in rounded-xl border p-4 ${
                    feedback.correct ? "border-success bg-success/10" : "border-danger bg-danger/10"
                  }`}
                >
                  <p className="font-display text-sm font-bold uppercase tracking-wide">
                    {feedback.correct ? "✓ Correct" : "✗ Pas tout à fait"}
                  </p>
                  <p className="mt-1 font-display text-sm leading-relaxed text-muted">
                    {feedback.reason}
                  </p>
                </div>
                <button
                  onClick={next}
                  autoFocus
                  className="btn btn-primary btn-sheen mt-4 rounded-[10px] bg-bg3 px-6 py-3 font-display text-sm text-text transition-colors hover: hover:"
                >
                  Suivant →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Coupe la question autour du trou. Sans `___`, la question s'affiche
 * entière et aucun blanc n'est dessiné — les modules où l'on choisit une
 * traduction ou une lecture n'ont rien à trouer.
 */
function splitQuestion(question: string): [string, string | null] {
  const index = question.indexOf("___");
  if (index === -1) return [question, null];
  return [question.slice(0, index), question.slice(index + 3)];
}
