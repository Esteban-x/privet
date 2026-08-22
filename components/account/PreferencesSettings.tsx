"use client";

import { useState } from "react";
import { TOPIC_CATALOG } from "@/lib/supabase/types";

interface Props {
  initialTopics: string[];
  initialGoals: string;
}

// Mêmes thèmes/objectif que l'onboarding (lib/supabase/types.ts), éditables
// après coup — l'IA (exercices, lecture, professeur) s'en sert en continu,
// pas seulement à l'inscription.
export default function PreferencesSettings({ initialTopics, initialGoals }: Props) {
  const [topics, setTopics] = useState<string[]>(initialTopics);
  const [goals, setGoals] = useState(initialGoals);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function toggleTopic(id: string) {
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, goals }),
      });
      if (!res.ok) throw new Error();
      setFeedback({ ok: true, message: "Préférences mises à jour." });
    } catch {
      setFeedback({ ok: false, message: "Impossible d'enregistrer. Réessaie." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-border bg-bg2 p-6">
      <h2 className="font-display text-lg font-bold">Thèmes & objectif</h2>
      <p className="mt-1 font-display text-sm text-muted">
        Utilisés par l&apos;IA pour générer vocabulaire, textes et dialogue.
      </p>

      <form onSubmit={save} className="mt-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {TOPIC_CATALOG.map((t) => {
            const on = topics.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
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

        <label
          htmlFor="goals"
          className="mb-1.5 mt-5 block font-display text-sm font-medium text-muted"
        >
          Objectif
        </label>
        <textarea
          id="goals"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-[10px] border border-border bg-bg px-4 py-3 font-display text-sm text-text outline-none placeholder:text-muted/60 focus:border-accent"
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-[10px] bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>

        {feedback && (
          <p
            role="status"
            className={`mt-3 font-display text-sm ${feedback.ok ? "text-success" : "text-danger"}`}
          >
            {feedback.message}
          </p>
        )}
      </form>
    </section>
  );
}
