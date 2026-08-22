"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  deriveLevelFromAnswers,
  LevelQuestion,
  MAX_TIER,
  MIN_TIER,
  questionsForTier,
} from "@/lib/leveltest/questions";
import { TOPIC_CATALOG, CefrLevel } from "@/lib/supabase/types";

type Step = "test" | "topics" | "goals" | "done";

// Nombre de questions posées par passation (le vivier en contient 30 : de
// quoi varier d'un essai à l'autre, la branche adaptative empruntée dépendant
// des réponses données).
const MAX_QUESTIONS = 12;
// Palier de départ : au milieu de l'échelle, comme un vrai test de placement
// adaptatif (on ne présume ni débutant ni avancé).
const START_TIER = 3;

interface RunAnswer {
  tier: number;
  correct: boolean;
  questionId: string;
  selectedIndex: number;
}

// Cherche une question pas encore posée au palier visé ; à défaut, élargit la
// recherche palier par palier (3 → 2/4 → 1/5…) jusqu'à en trouver une.
// Déterministe (pas de hasard) : sûr côté hydratation SSR/client.
function pickNextQuestion(targetTier: number, askedIds: Set<string>): LevelQuestion | null {
  for (let offset = 0; offset <= MAX_TIER - MIN_TIER; offset++) {
    for (const tier of [targetTier - offset, targetTier + offset]) {
      if (tier < MIN_TIER || tier > MAX_TIER) continue;
      const candidate = questionsForTier(tier).find((q) => !askedIds.has(q.id));
      if (candidate) return candidate;
    }
  }
  return null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("test");

  // --- Étape test (adaptative : la difficulté suit les réponses) ---
  const [currentQ, setCurrentQ] = useState<LevelQuestion | null>(() =>
    pickNextQuestion(START_TIER, new Set())
  );
  const [askedIds, setAskedIds] = useState<Set<string>>(new Set());
  const [runAnswers, setRunAnswers] = useState<RunAnswer[]>([]);
  const [feedback, setFeedback] = useState<
    { correct: boolean; explain: string; selectedIndex: number } | null
  >(null);
  const [level, setLevel] = useState<CefrLevel | null>(null);
  // Le niveau vient uniquement de /api/level-test/evaluate (recalculé
  // côté serveur à partir des vraies réponses, jamais accepté tel quel du
  // client — voir ce endpoint) : /api/profile n'a pas de champ "level" à
  // dessein. Si cet appel échoue, il ne faut donc PAS terminer
  // l'onboarding en silence sur un niveau jamais enregistré (l'utilisateur
  // resterait bloqué au niveau par défaut indéfiniment) — retenté dans
  // finish() tant qu'il n'a pas réussi.
  const [levelSaved, setLevelSaved] = useState(false);
  const runAnswersRef = useRef<RunAnswer[]>([]);

  // --- Étape thèmes ---
  const [topics, setTopics] = useState<string[]>([]);

  // --- Étape objectif ---
  const [goals, setGoals] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const correctCount = runAnswers.filter((a) => a.correct).length;

  // Enregistre la réponse et affiche le résultat immédiat (comme un vrai
  // test en ligne) — on n'avance qu'au clic sur "Continuer".
  function selectOption(optionIndex: number) {
    if (!currentQ || feedback) return;
    const correct = optionIndex === currentQ.correctIndex;
    setRunAnswers((prev) => [
      ...prev,
      { tier: currentQ.tier, correct, questionId: currentQ.id, selectedIndex: optionIndex },
    ]);
    setAskedIds((prev) => new Set(prev).add(currentQ.id));
    setFeedback({ correct, explain: currentQ.explain, selectedIndex: optionIndex });
  }

  // Tenté une première fois juste après le test (feedback instantané), puis
  // retenté depuis finish() si ce premier essai a échoué — voir `levelSaved`
  // ci-dessus pour pourquoi ça ne peut pas rester silencieux.
  async function saveLevelTest(answers: RunAnswer[]): Promise<boolean> {
    try {
      const res = await fetch("/api/level-test/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail: { answers } }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.level) setLevel(data.level);
      setLevelSaved(true);
      return true;
    } catch {
      return false;
    }
  }

  async function continueAfterFeedback() {
    if (!currentQ || !feedback) return;

    const nextAnswers = runAnswers; // déjà mis à jour par selectOption
    setFeedback(null);

    if (nextAnswers.length >= MAX_QUESTIONS) {
      // Estimation immédiate côté client (affichage instantané) — le
      // niveau réellement enregistré viendra de saveLevelTest, qui recalcule
      // tout côté serveur à partir des mêmes réponses.
      setLevel(deriveLevelFromAnswers(nextAnswers));
      runAnswersRef.current = nextAnswers;
      await saveLevelTest(nextAnswers);
      setStep("topics");
      return;
    }

    const nextTier = feedback.correct
      ? Math.min(MAX_TIER, currentQ.tier + 1)
      : Math.max(MIN_TIER, currentQ.tier - 1);
    setCurrentQ(pickNextQuestion(nextTier, askedIds));
  }

  function toggleTopic(id: string) {
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      if (!levelSaved) {
        const ok = await saveLevelTest(runAnswersRef.current);
        if (!ok) throw new Error("level save failed");
      }
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

      {step === "test" && currentQ && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-accent">
            Test de niveau · question {runAnswers.length + 1}/{MAX_QUESTIONS}
          </p>
          <p className="mt-3 font-display text-sm text-muted">{currentQ.prompt}</p>
          <p className="mt-1 font-display text-3xl font-bold">{currentQ.question}</p>

          <div className="mt-6 grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, i) => {
              const isCorrectOption = i === currentQ.correctIndex;
              const isWrongPick = feedback && !feedback.correct && i === feedback.selectedIndex;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
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
                feedback.correct
                  ? "border-success/40 bg-success/10"
                  : "border-danger/40 bg-danger/10"
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
                onClick={continueAfterFeedback}
                className="mt-4 rounded-[10px] bg-accent px-4 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              >
                Continuer
              </button>
            </div>
          )}
        </div>
      )}

      {step === "topics" && (
        <div className="rounded-[20px] border border-border bg-bg2 p-8">
          {level && (
            <div className="mb-6 rounded-xl border border-accent bg-accent/10 p-4 text-center">
              <p className="font-display text-sm text-muted">Ton niveau estimé</p>
              <p className="font-display text-3xl font-extrabold text-accent">{level}</p>
              <p className="mt-1 font-display text-xs text-muted">
                {correctCount}/{runAnswers.length} bonnes réponses · tu pourras le refaire plus tard
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
            En une phrase — le professeur IA s&apos;en servira pour t&apos;orienter. (facultatif)
          </p>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            placeholder="Ex : pouvoir commander au restaurant lors de mon voyage à Saint-Pétersbourg."
            className="mt-4 w-full rounded-[10px] border border-border bg-bg px-4 py-3 font-display text-base text-text outline-none placeholder:text-muted/60 focus:border-accent"
          />
          {error && <p className="mt-3 font-display text-sm text-danger">{error}</p>}
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
