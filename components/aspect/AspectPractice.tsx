"use client";

import { useEffect, useState } from "react";
import PaywallNotice from "@/components/ui/PaywallNotice";
import { usePracticeAttempt } from "@/lib/practice/attempt-client";
import TimelineDiagram from "./TimelineDiagram";
import { TIMELINE_LABEL } from "@/lib/aspect/verbs";
import {
  generateAspectExercise,
  type AspectExercise,
  type AspectSkillId,
} from "@/lib/aspect/exercises";

type Feedback = { correct: boolean; reason: string } | null;

export default function AspectPractice({
  skill,
  color,
}: {
  skill: AspectSkillId;
  color: string;
}) {
  // Le tirage est aléatoire : il ne peut pas avoir lieu au rendu initial,
  // sinon serveur et client tireraient des exercices différents. `null` sert
  // d'état de chargement et l'effet le remplit après le montage.
  const [exercise, setExercise] = useState<AspectExercise | null>(null);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  // Le plafond de pratique du plan gratuit. `blocked` remplace la carte
  // par l'écran d'abonnement ; `stopHere` l'anticipe d'un exercice pour
  // ne pas faire répondre à un exercice qui allait être refusé.
  const { blocked, submit, stopHere } = usePracticeAttempt("/api/aspect/attempt");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(generateAspectExercise(skill)).then((next) => {
      if (!cancelled) setExercise(next);
    });
    return () => {
      cancelled = true;
    };
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
    // Le client n'annonce jamais s'il a juste : il envoie l'item et sa
    // réponse, le serveur rejuge. Même règle que le module Cas — un seul
    // verdict, donc écran et base ne peuvent pas diverger.
    const outcome = await submit({ skill, itemId: exercise.itemId, answer: option });
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

    // Serveur indisponible ou visiteur non connecté : on retombe sur le
    // calcul local pour ne pas bloquer l'exercice, la tentative n'est
    // simplement pas comptée.
    const correct = option === exercise.options[exercise.correctIndex];
    setFeedback({ correct, reason: exercise.explain });
    setStreak((s) => (correct ? s + 1 : 0));
  }

  if (blocked) {
    return <PaywallNotice quota={blocked.quota} message={blocked.message} what="les exercices d'aspect" />;
  }

  return (
    <div className="overflow-hidden rounded-[20px] surface shadow-float">
      <div
        className="flex items-center justify-between gap-3 px-5 py-3 text-white sm:px-6 sm:py-3.5"
        style={{ background: color }}
      >
        <span className="min-w-0 truncate font-display text-[13px] font-semibold uppercase tracking-wide sm:text-sm">
          Aspect verbal
        </span>
        <span className="shrink-0 font-display text-xs font-bold">
          Série : {streak}
          {accuracy !== null ? ` · ${accuracy}%` : ""}
        </span>
      </div>

      <div className="p-5 sm:p-7">
        {!exercise ? (
          <div className="animate-fade-in space-y-4">
            <div className="skeleton h-4 w-48 rounded-full" />
            <div className="skeleton mx-auto h-[84px] w-full max-w-[240px] rounded-xl" />
            <div className="skeleton h-6 w-2/3 rounded-lg" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-[50px] rounded-[10px]" />
              ))}
            </div>
          </div>
        ) : (
          <div key={round} className="animate-fade-in">
            <p className="font-display text-sm text-muted">{exercise.prompt}</p>

            {exercise.schema && (
              <figure className="mt-4 flex flex-col items-center rounded-[14px] border border-border bg-bg px-4 py-5">
                <TimelineDiagram schema={exercise.schema} />
                <figcaption className="mt-2 font-display text-xs text-muted">
                  {TIMELINE_LABEL[exercise.schema]}
                </figcaption>
              </figure>
            )}

            {exercise.sentence && (
              <p className="mt-5 font-display text-2xl font-bold">
                {exercise.sentence.split("___")[0]}
                <span className="inline-block min-w-[80px] border-b-2 border-accent">&nbsp;</span>
                {exercise.sentence.split("___")[1]}
              </p>
            )}
            <p className="mt-1 font-display text-sm italic text-muted">{exercise.sentenceFr}</p>

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {exercise.options.map((option) => {
                const isAnswer = feedback && option === exercise.options[exercise.correctIndex];
                const isWrongPick = feedback && !feedback.correct && option === picked;
                return (
                  <button
                    key={option}
                    onClick={() => answer(option)}
                    disabled={Boolean(feedback) || checking}
                    className={`rounded-[10px] border px-4 py-3 font-display text-lg font-semibold transition-colors ${
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
                  className={`mt-5 rounded-xl border p-4 ${
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
                  className="btn btn-primary btn-sheen mt-4 rounded-[10px] bg-bg3 px-6 py-3 font-display text-sm text-text transition-colors hover:"
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
