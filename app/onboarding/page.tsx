"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  answerCurrent,
  currentQuestion,
  runProgress,
  runResult,
  startRun,
  BLOCK_SIZE,
  MAX_BLOCKS,
  type TestResult,
  type TestRun,
} from "@/lib/leveltest/engine";
import { CefrLevel } from "@/lib/supabase/types";

type Step = "intro" | "test" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");

  // Le tirage des questions est aléatoire : il ne peut donc pas avoir lieu
  // au rendu initial (le serveur et le client tireraient des questions
  // différentes). Il démarre au clic sur « Commencer », ce qui est de toute
  // façon la bonne UX pour un test.
  const [run, setRun] = useState<TestRun | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explain: string; picked: number } | null>(
    null
  );

  // Le niveau affiché vient TOUJOURS du serveur (/api/level-test/evaluate),
  // qui rejoue le calcul à partir des réponses : un client ne peut pas
  // s'attribuer un niveau. `localResult` sert au détail par palier, calculé
  // avec la même fonction pure.
  const [localResult, setLocalResult] = useState<TestResult | null>(null);
  const [serverLevel, setServerLevel] = useState<CefrLevel | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = run ? currentQuestion(run) : null;
  const progress = run ? runProgress(run) : null;

  function begin() {
    setRun(startRun());
    setFeedback(null);
    setError(null);
    setStep("test");
  }

  function pick(index: number) {
    if (!run || !question || feedback) return;
    setFeedback({
      correct: index === question.correctIndex,
      explain: question.explain,
      picked: index,
    });
  }

  async function advance() {
    if (!run || !feedback) return;
    const next = answerCurrent(run, feedback.picked);
    setFeedback(null);
    setRun(next);
    if (next.finished) {
      const result = runResult(next);
      setLocalResult(result);
      setStep("done");
      await save(next.answers);
    }
  }

  async function save(answers: TestRun["answers"]): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/level-test/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail: { answers } }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.level) setServerLevel(data.level);
      return true;
    } catch {
      setError("Impossible d'enregistrer ton niveau. Réessaie.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    if (!run) return;
    // Le niveau est enregistré par /api/level-test/evaluate (source de
    // vérité). S'il n'est pas encore passé, on réessaie ici plutôt que de
    // terminer l'onboarding sur un niveau jamais écrit.
    if (!serverLevel) {
      const ok = await save(run.answers);
      if (!ok) return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarded: true }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setError("Impossible d'enregistrer. Réessaie.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      {step === "test" && progress && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between font-display text-xs font-semibold uppercase tracking-wide text-muted">
            <span>
              Série {progress.block}/{progress.maxBlocks} · question {progress.questionInBlock}/
              {progress.blockSize}
            </span>
            <span>{progress.answered} répondues</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: MAX_BLOCKS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < progress.block - 1
                    ? "bg-accent"
                    : i === progress.block - 1
                      ? "bg-accent/40"
                      : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {step === "intro" && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent">
            Avant de commencer
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
            Test de placement
          </h1>
          <p className="mt-3 font-display text-sm leading-relaxed text-muted">
            {BLOCK_SIZE * 2} à {BLOCK_SIZE * MAX_BLOCKS} questions, quelques minutes. Le test
            procède par séries : chaque série cible un niveau, et il faut en réussir la majorité
            pour que ce niveau soit validé et que la suivante monte d&apos;un cran.
          </p>
          <ul className="mt-4 space-y-2 font-display text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-accent">·</span>
              Les questions suivent le référentiel ТРКИ, le standard du russe langue étrangère.
            </li>
            <li className="flex gap-2">
              <span className="text-accent">·</span>
              Réponds sans chercher : un niveau surestimé ne t&apos;avantage pas, il rend les
              exercices inutilisables.
            </li>
            <li className="flex gap-2">
              <span className="text-accent">·</span>
              Tu pourras le repasser plus tard, et ton niveau s&apos;ajuste de toute façon avec ta
              progression réelle.
            </li>
          </ul>
          <button
            onClick={begin}
            className="mt-6 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Commencer le test
          </button>
        </div>
      )}

      {step === "test" && question && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          <p className="font-display text-sm text-muted">{question.prompt}</p>
          <p className="mt-2 font-display text-3xl font-bold">{question.question}</p>

          <div className="mt-6 grid grid-cols-1 gap-2.5">
            {question.options.map((opt, i) => {
              const isCorrectOption = i === question.correctIndex;
              const isWrongPick = feedback && !feedback.correct && i === feedback.picked;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={Boolean(feedback)}
                  className={`rounded-[10px] border px-4 py-3 text-left font-display text-base transition-colors ${
                    feedback
                      ? isCorrectOption
                        ? "border-success bg-success/10 text-text"
                        : isWrongPick
                          ? "border-danger bg-danger/10 text-text"
                          : "border-border bg-bg text-muted"
                      : "border-border bg-bg hover:border-accent hover:bg-accent/10"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                feedback.correct ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"
              }`}
            >
              <p
                className={`font-display text-sm font-semibold ${
                  feedback.correct ? "text-success" : "text-danger"
                }`}
              >
                {feedback.correct ? "Correct !" : "Pas tout à fait."}
              </p>
              <p className="mt-1 font-display text-sm text-muted">{feedback.explain}</p>
              <button
                onClick={advance}
                className="mt-4 rounded-[10px] bg-accent px-4 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              >
                Continuer
              </button>
            </div>
          )}
        </div>
      )}

      {step === "done" && localResult && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          <div className="rounded-xl border border-accent bg-accent/10 p-5 text-center">
            <p className="font-display text-sm text-muted">Ton niveau</p>
            <p className="font-display text-4xl font-extrabold text-accent">
              {serverLevel ?? localResult.level}
            </p>
            <p className="mt-1 font-display text-xs text-muted">
              {localResult.score}/{localResult.total} bonnes réponses
            </p>
          </div>

          {/* Le détail par série répond à la question que tout test de
              placement laisse en suspens : pourquoi CE niveau. */}
          <p className="mt-6 font-display text-xs font-semibold uppercase tracking-wide text-muted">
            Détail par série
          </p>
          <ul className="mt-3 space-y-1.5">
            {localResult.tiers.map((t) => (
              <li
                key={t.tier}
                className="flex items-center justify-between rounded-[10px] border border-border bg-bg px-4 py-2.5 font-display text-sm"
              >
                <span className="font-semibold">{t.level}</span>
                <span className="text-muted">
                  {t.correct}/{t.asked}
                  <span className={`ml-3 font-semibold ${t.validated ? "text-success" : "text-muted"}`}>
                    {t.validated ? "validé" : "non validé"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-display text-xs leading-relaxed text-muted">
            Un niveau est validé à partir de 3 bonnes réponses sur 4 — en dessous, le résultat
            resterait indistinguable du hasard. Ton niveau est le plus haut palier validé.
          </p>

          {error && <p className="mt-4 font-display text-sm text-danger">{error}</p>}
          <button
            onClick={finish}
            disabled={saving}
            className="mt-6 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Accéder au tableau de bord"}
          </button>
        </div>
      )}
    </div>
  );
}
