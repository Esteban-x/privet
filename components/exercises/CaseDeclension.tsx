"use client";

import { useEffect, useMemo, useState } from "react";
import { CaseInfo } from "@/lib/grammar/types";
import { CaseExercise, checkAnswer, generateExercise } from "@/lib/grammar/exercise-generator";
import { accuracyFor, loadCaseProgress, recordCaseAttempt } from "@/lib/storage";

type Mode = "isolated" | "sentence";
type Feedback = { status: "correct" | "incorrect"; exercise: CaseExercise } | null;

const GENDER_LABEL: Record<string, string> = {
  masculine: "masc.",
  feminine: "fém.",
  neuter: "neutre",
};

export default function CaseDeclension({ caseInfo }: { caseInfo: CaseInfo }) {
  const [mode, setMode] = useState<Mode>("isolated");
  const [exercise, setExercise] = useState<CaseExercise | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [streak, setStreak] = useState(0);
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    setExercise(generateExercise(caseInfo.id, mode));
    setFeedback(null);
    setInput("");
  }, [caseInfo.id, mode]);

  const progress = useMemo(() => {
    const map = loadCaseProgress();
    if (!exercise) return null;
    const entry = map[`${caseInfo.id}:${exercise.noun.gender}`];
    return accuracyFor(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressTick, exercise, caseInfo.id]);

  function nextExercise() {
    setExercise(generateExercise(caseInfo.id, mode));
    setFeedback(null);
    setInput("");
  }

  function submit() {
    if (!exercise || !input.trim()) return;
    const isCorrect = checkAnswer(exercise, input);
    recordCaseAttempt(caseInfo.id, exercise.noun.gender, isCorrect);
    setFeedback({ status: isCorrect ? "correct" : "incorrect", exercise });
    setStreak((s) => (isCorrect ? s + 1 : 0));
    setProgressTick((t) => t + 1);
  }

  if (!exercise) return null;

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-bg2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
      {/* En-tête */}
      <div
        className="flex items-center justify-between px-6 py-3.5 text-white"
        style={{ background: caseInfo.color }}
      >
        <span className="font-display text-sm font-semibold uppercase tracking-wide">
          {caseInfo.nameRu} · {caseInfo.question}
        </span>
        <span className="font-display text-xs font-bold">Série : {streak}</span>
      </div>

      {/* Sélecteur de mode */}
      <div className="flex items-center gap-1.5 border-b border-border px-6 py-3.5">
        <div className="inline-flex rounded-full border border-border bg-bg p-1">
          <ModeButton active={mode === "isolated"} onClick={() => setMode("isolated")}>
            Déclinaison isolée
          </ModeButton>
          <ModeButton active={mode === "sentence"} onClick={() => setMode("sentence")}>
            Phrase à trou
          </ModeButton>
        </div>
        {progress !== null && (
          <span className="ml-auto font-display text-xs text-muted">
            Précision ({GENDER_LABEL[exercise.noun.gender]}) : {progress}%
          </span>
        )}
      </div>

      <div className="p-7">
        {mode === "isolated" ? (
          <div className="mb-6">
            <p className="font-display text-sm text-muted">Décline ce mot :</p>
            <p className="font-display text-3xl font-bold">
              {exercise.noun.lemma}{" "}
              <span className="font-display text-lg font-normal text-muted">
                ({exercise.noun.translation})
              </span>
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="font-display text-sm text-muted">Complète la phrase :</p>
            <p className="font-display text-2xl font-bold">
              {exercise.sentenceTemplate?.split("___")[0]}
              <span className="inline-block min-w-[80px] border-b-2 border-accent">&nbsp;</span>
              {exercise.sentenceTemplate?.split("___")[1]}
            </p>
            <p className="mt-1 font-display text-sm italic text-muted">{exercise.sentenceFr}</p>
          </div>
        )}

        <div className="flex gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (feedback ? nextExercise() : submit())}
            placeholder="Écris la réponse en russe…"
            className="flex-1 rounded-[10px] border border-border bg-bg px-4 py-3 font-display text-lg text-text outline-none placeholder:text-muted/60 focus:border-accent"
            autoFocus
          />
          {feedback ? (
            <button
              onClick={nextExercise}
              className="rounded-[10px] bg-bg3 px-6 font-display text-sm font-semibold text-text transition-colors hover:bg-accent"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={submit}
              className="rounded-[10px] bg-accent px-6 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
            >
              Vérifier
            </button>
          )}
        </div>

        {feedback && (
          <div
            className={`mt-5 rounded-xl border p-4 ${
              feedback.status === "correct"
                ? "border-success bg-success/10"
                : "border-accent2 bg-accent2/10"
            }`}
          >
            <p className="font-display text-sm font-bold uppercase tracking-wide">
              {feedback.status === "correct" ? "✓ Correct" : "✗ Pas tout à fait"}
            </p>
            <p className="mt-1 font-display text-xl font-bold">{exercise.correctForm}</p>
            <p className="mt-1 font-display text-sm text-muted">{exercise.ruleApplied}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-colors ${
        active ? "bg-accent text-white" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
