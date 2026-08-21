"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LEVEL_QUESTIONS } from "@/lib/leveltest/questions";
import { TOPIC_CATALOG, CefrLevel } from "@/lib/supabase/types";

type Step = "test" | "topics" | "goals" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("test");

  // --- Étape test ---
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [level, setLevel] = useState<CefrLevel | null>(null);

  // --- Étape thèmes ---
  const [topics, setTopics] = useState<string[]>([]);

  // --- Étape objectif ---
  const [goals, setGoals] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(
    () =>
      LEVEL_QUESTIONS.reduce(
        (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
        0
      ),
    [answers]
  );

  const currentQ = LEVEL_QUESTIONS[qIndex];

  async function answer(optionIndex: number) {
    const updated = { ...answers, [currentQ.id]: optionIndex };
    setAnswers(updated);

    if (qIndex + 1 < LEVEL_QUESTIONS.length) {
      setQIndex((i) => i + 1);
      return;
    }

    // Test terminé : envoyer le score pour obtenir le niveau.
    const finalScore = LEVEL_QUESTIONS.reduce(
      (acc, q) => acc + (updated[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    try {
      const res = await fetch("/api/level-test/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalScore, total: LEVEL_QUESTIONS.length, detail: updated }),
      });
      const data = await res.json();
      setLevel(data.level ?? "A1");
    } catch {
      setLevel("A1");
    }
    setStep("topics");
  }

  function toggleTopic(id: string) {
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, goals, onboarded: true }),
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
      <ProgressBar step={step} />

      {step === "test" && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent2">
            Test de niveau · question {qIndex + 1}/{LEVEL_QUESTIONS.length}
          </p>
          <p className="mt-3 font-display text-sm text-muted">{currentQ.prompt}</p>
          <p className="mt-1 font-display text-3xl font-bold">{currentQ.question}</p>

          <div className="mt-6 grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                className="rounded-[10px] border border-border bg-bg px-4 py-3 text-left font-display text-base transition-colors hover:border-accent hover:bg-accent/10"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "topics" && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          {level && (
            <div className="mb-6 rounded-xl border border-accent bg-accent/10 p-4 text-center">
              <p className="font-display text-sm text-muted">Ton niveau estimé</p>
              <p className="font-display text-3xl font-extrabold text-accent">{level}</p>
              <p className="mt-1 font-display text-xs text-muted">
                {score}/{LEVEL_QUESTIONS.length} bonnes réponses · tu pourras le refaire plus tard
              </p>
            </div>
          )}
          <h2 className="font-display text-xl font-bold">Qu&apos;est-ce qui t&apos;intéresse ?</h2>
          <p className="mt-1 font-display text-sm text-muted">
            L&apos;IA générera du vocabulaire et des textes autour de tes thèmes.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {TOPIC_CATALOG.map((t) => {
              const on = topics.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  className={`rounded-xl border px-3 py-4 text-center font-display text-sm font-semibold transition-colors ${
                    on
                      ? "border-accent bg-accent/15 text-text"
                      : "border-border bg-bg text-muted hover:border-accent/50"
                  }`}
                >
                  <span className="block text-xl">{t.emoji}</span>
                  <span className="mt-1 block">{t.label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep("goals")}
            disabled={topics.length === 0}
            className="mt-6 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
          >
            Continuer{topics.length > 0 ? ` (${topics.length})` : ""}
          </button>
        </div>
      )}

      {step === "goals" && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          <h2 className="font-display text-xl font-bold">Ton objectif</h2>
          <p className="mt-1 font-display text-sm text-muted">
            En une phrase — le tuteur IA s&apos;en servira pour t&apos;orienter. (facultatif)
          </p>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            placeholder="Ex : pouvoir commander au restaurant lors de mon voyage à Saint-Pétersbourg."
            className="mt-4 w-full rounded-[10px] border border-border bg-bg px-4 py-3 font-display text-base text-text outline-none placeholder:text-muted/60 focus:border-accent"
          />
          {error && <p className="mt-3 font-display text-sm text-accent2">{error}</p>}
          <button
            onClick={finish}
            disabled={saving}
            className="mt-5 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Terminer et accéder au tableau de bord"}
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ step }: { step: Step }) {
  const order: Step[] = ["test", "topics", "goals"];
  const idx = order.indexOf(step);
  return (
    <div className="mb-8 flex items-center gap-2">
      {order.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-accent" : "bg-border"}`}
        />
      ))}
    </div>
  );
}
