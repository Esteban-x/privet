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
import { DOMAIN_LABEL, DOMAIN_PRACTICE } from "@/lib/leveltest/questions";
import type { CefrLevel } from "@/lib/supabase/types";
import Link from "next/link";

type Step = "intro" | "test" | "done";

/**
 * Passation du test de placement, partagée entre l'onboarding (première
 * fois) et le retest. La MESURE est strictement la même dans les deux cas —
 * mêmes blocs, mêmes seuils, même règle de décision : sans ça, comparer deux
 * passations ne voudrait rien dire. Ce qui change est le contexte
 * (`intro`, `previousLevel`) et les items exclus.
 */
export default function LevelTestRunner({
  excludeIds,
  previousLevel,
  intro,
  finishHref,
  finishLabel,
  markOnboarded = false,
}: {
  excludeIds: string[];
  previousLevel?: CefrLevel | null;
  intro: React.ReactNode;
  finishHref: string;
  finishLabel: string;
  markOnboarded?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [run, setRun] = useState<TestRun | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explain: string; picked: number } | null>(
    null
  );
  const [localResult, setLocalResult] = useState<TestResult | null>(null);
  const [serverLevel, setServerLevel] = useState<CefrLevel | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = run ? currentQuestion(run) : null;
  const progress = run ? runProgress(run) : null;

  function begin() {
    // Tirage aléatoire : impossible au rendu initial (serveur et client
    // tireraient des items différents), donc déclenché par le clic.
    setRun(startRun(Math.random, excludeIds));
    setFeedback(null);
    setError(null);
    setStep("test");
  }

  function pick(index: number) {
    if (!run || !question || feedback) return;
    setFeedback({ correct: index === question.correctIndex, explain: question.explain, picked: index });
  }

  async function advance() {
    if (!run || !feedback) return;
    const next = answerCurrent(run, feedback.picked);
    setFeedback(null);
    setRun(next);
    if (next.finished) {
      setLocalResult(runResult(next));
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
    if (!serverLevel) {
      const ok = await save(run.answers);
      if (!ok) return;
    }
    setSaving(true);
    try {
      if (markOnboarded) {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onboarded: true }),
        });
        if (!res.ok) throw new Error();
      }
      router.push(finishHref);
    } catch {
      setError("Impossible d'enregistrer. Réessaie.");
      setSaving(false);
    }
  }

  const level = serverLevel ?? localResult?.level ?? null;
  const moved =
    previousLevel && level && previousLevel !== level
      ? level > previousLevel
        ? "up"
        : "down"
      : null;

  return (
    <>
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
        <div className="rounded-[20px] surface p-8">
          {intro}
          <button
            onClick={begin}
            className="btn btn-primary btn-sheen mt-6 w-full rounded-[10px] py-3 font-display text-sm"
          >
            Commencer le test
          </button>
        </div>
      )}

      {step === "test" && question && (
        <div className="rounded-[20px] surface p-8">
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
                      : "border-border bg-bg hover:bg-accent/10 hover:border-accent/35"
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
                className="btn btn-primary btn-sheen mt-4 rounded-[10px] px-4 py-2.5 font-display text-sm"
              >
                Continuer
              </button>
            </div>
          )}
        </div>
      )}

      {step === "done" && localResult && (
        <div className="rounded-[20px] surface p-8">
          <div className="rounded-xl border border-accent bg-accent/10 p-5 text-center">
            <p className="font-display text-sm text-muted">Ton niveau</p>
            <p className="font-display text-3xl font-extrabold sm:text-4xl text-accent-ink">{level}</p>
            <p className="mt-1 font-display text-xs text-muted">
              {localResult.score}/{localResult.total} bonnes réponses
            </p>
            {previousLevel && (
              <p className="mt-2 font-display text-sm">
                {moved === "up" ? (
                  <span className="font-semibold text-success">
                    ↑ {previousLevel} → {level}
                  </span>
                ) : moved === "down" ? (
                  <span className="text-muted">
                    {previousLevel} → {level} — un test reste une mesure, pas une sanction.
                  </span>
                ) : (
                  <span className="text-muted">Niveau confirmé ({previousLevel}).</span>
                )}
              </p>
            )}
          </div>

          {/* Le rapport par domaine : la seule partie qui dise QUOI travailler. */}
          <p className="mt-6 font-display text-xs font-semibold uppercase tracking-wide text-muted">
            Par domaine
          </p>
          <ul className="mt-3 space-y-1.5">
            {localResult.domains.map((d) => {
              const ratio = d.correct / d.asked;
              const practice = DOMAIN_PRACTICE[d.domain];
              return (
                <li
                  key={d.domain}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-border bg-bg px-4 py-2.5 font-display text-sm"
                >
                  <span className="font-semibold">{DOMAIN_LABEL[d.domain]}</span>
                  <span className="flex items-center gap-3">
                    <span className={ratio >= 0.75 ? "text-success" : ratio >= 0.5 ? "text-muted" : "text-danger"}>
                      {d.correct}/{d.asked}
                    </span>
                    {ratio < 0.75 && practice && (
                      <Link href={practice.href} className="text-xs font-semibold text-accent-ink hover:underline">
                        {practice.label} →
                      </Link>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-3 font-display text-xs leading-relaxed text-muted">
            Un niveau est validé à partir de 3 bonnes réponses sur 4 — en dessous, le résultat
            resterait indistinguable du hasard. Ton niveau est le plus haut palier validé.
          </p>

          {error && <p className="mt-4 font-display text-sm text-danger">{error}</p>}
          <button
            onClick={finish}
            disabled={saving}
            className="btn btn-primary btn-sheen mt-6 w-full rounded-[10px] py-3 font-display text-sm disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : finishLabel}
          </button>
        </div>
      )}
    </>
  );
}

export { BLOCK_SIZE, MAX_BLOCKS };
