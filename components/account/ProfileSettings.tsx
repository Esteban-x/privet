"use client";

import { useState } from "react";

interface Props {
  email: string;
  initialDisplayName: string;
}

// L'app n'affiche que `display_name` (NavBar, salutation du dashboard) —
// pas de champs prénom/nom séparés ici, ça éviterait juste une resynchro
// inutile entre les deux représentations.
export default function ProfileSettings({ email, initialDisplayName }: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });
      if (!res.ok) throw new Error();
      setFeedback({ ok: true, message: "Profil mis à jour." });
    } catch {
      setFeedback({ ok: false, message: "Impossible d'enregistrer. Réessaie." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-border bg-bg2 p-6">
      <h2 className="font-display text-lg font-bold">Profil</h2>

      <form onSubmit={save} className="mt-4">
        <label
          htmlFor="displayName"
          className="mb-1.5 block font-display text-sm font-medium text-muted"
        >
          Nom affiché
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
          className="w-full max-w-sm rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text focus:border-accent focus:outline-none"
        />

        <p className="mb-1.5 mt-4 font-display text-sm font-medium text-muted">Email</p>
        <p className="font-display text-sm text-text">{email}</p>

        <button
          type="submit"
          disabled={saving || !displayName.trim() || displayName.trim() === initialDisplayName}
          className="mt-5 rounded-[10px] bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
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
