"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { fetchDailyProgress, fetchDueWords } from "@/lib/vocabulary/custom";
import ReviewModeGrid from "@/components/vocabulary/ReviewModeGrid";

const GOAL_OPTIONS = [10, 15, 25, 40];

// Point d'entrée global de révision (façon Anki/Duolingo "réviser
// maintenant") : agrège les mots dus de TOUTES les listes plutôt que de
// forcer à choisir une liste d'abord. La révision ciblée par liste reste
// disponible depuis /vocabulary/lists/[listId].
export default function ReviewHubPage() {
  const [queueInfo, setQueueInfo] = useState<{
    dueCount: number;
    knownCount: number;
    totalWords: number;
  } | null>(null);
  const [daily, setDaily] = useState<{ reviewedToday: number; goal: number } | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    fetchDueWords()
      .then((d) =>
        setQueueInfo({ dueCount: d.dueCount, knownCount: d.knownCount, totalWords: d.totalWords })
      )
      .catch(() => setQueueInfo({ dueCount: 0, knownCount: 0, totalWords: 0 }));
    fetchDailyProgress()
      .then(setDaily)
      .catch(() => {});
  }, []);

  async function setGoal(goal: number) {
    setSavingGoal(true);
    setDaily((d) => (d ? { ...d, goal } : d));
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocab_daily_goal: goal }),
      });
    } catch {
      // Best-effort : la valeur locale reste affichée même si l'enregistrement échoue.
    } finally {
      setSavingGoal(false);
    }
  }

  const goalPct = daily && daily.goal > 0 ? Math.min(100, Math.round((daily.reviewedToday / daily.goal) * 100)) : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-16">
      <Link
        href="/vocabulary"
        className="mb-8 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Mes listes
      </Link>

      <SectionLabel>Словарь</SectionLabel>
      <h1 className="mb-3 font-display text-3xl font-extrabold sm:text-4xl tracking-tight">Réviser</h1>
      {queueInfo === null ? (
        <div className="skeleton mb-8 h-5 w-96 max-w-full rounded-lg" />
      ) : (
        <p className="mb-8 max-w-2xl font-display leading-relaxed text-muted">
          {queueInfo.dueCount > 0
            ? `${queueInfo.dueCount} mot${queueInfo.dueCount > 1 ? "s" : ""} à réviser aujourd'hui, toutes listes confondues.`
            : queueInfo.totalWords === 0
              ? "Aucun mot pour l'instant."
              : queueInfo.knownCount === queueInfo.totalWords
                ? "Tu as marqué tous tes mots « je le sais » — remets-en un ou deux dans le circuit depuis tes listes quand tu voudras les revoir."
                : "Rien n'est dû aujourd'hui — entraîne-toi quand même, ça ne peut pas faire de mal."}
        </p>
      )}

      {!daily && (
        <div className="mb-7 sm:mb-10 animate-fade-in rounded-2xl surface p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="skeleton h-4 w-28 rounded-full" />
            <div className="skeleton h-4 w-12 rounded-full" />
          </div>
          <div className="skeleton h-2.5 w-full rounded-full" />
        </div>
      )}

      {daily && (
        <div className="mb-7 sm:mb-10 rounded-2xl surface p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-muted">Objectif du jour</p>
            <p className="font-display text-sm font-bold">
              {daily.reviewedToday} / {daily.goal}
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all ${
                daily.reviewedToday >= daily.goal ? "bg-success" : "bg-accent"
              }`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-display text-xs text-muted">Objectif :</span>
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                disabled={savingGoal}
                className={`rounded-full px-3 py-1 font-display text-xs font-semibold transition-colors ${
                  daily.goal === g ? "bg-accent text-white" : "bg-bg text-muted hover:text-text"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {queueInfo && queueInfo.totalWords === 0 ? (
        <div className="rounded-[20px] surface p-8 text-center">
          <p className="font-display text-base font-semibold">Aucun mot à réviser</p>
          <p className="mt-2 font-display text-sm text-muted">
            Choisis des thèmes dans ton{" "}
            <Link href="/account" className="text-accent hover:underline">
              profil
            </Link>{" "}
            pour recevoir des mots tout faits, ou crée ta propre liste.
          </p>
          <Link
            href="/vocabulary"
            className="btn btn-primary btn-sheen mt-5 inline-block rounded-[10px] px-5 py-2.5 font-display text-sm"
          >
            Aller à mes listes
          </Link>
        </div>
      ) : (
        <ReviewModeGrid />
      )}
    </div>
  );
}
