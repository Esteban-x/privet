"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_MIN } from "@/lib/auth/validation";

// `updateUser({ password })` marche même pour un compte inscrit uniquement
// via Google : ça ajoute une identité email/mot de passe au compte existant
// plutôt que d'en créer un nouveau. D'où le libellé qui change selon
// `hasPassword` — « définir » la première fois, « changer » ensuite.
export default function PasswordSettings({ hasPassword }: { hasPassword: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    if (password.length < PASSWORD_MIN) {
      setFeedback({
        ok: false,
        message: `Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`,
      });
      return;
    }
    if (password !== confirm) {
      setFeedback({ ok: false, message: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setFeedback({
        ok: true,
        message: hasPassword
          ? "Mot de passe changé."
          : "Mot de passe défini — tu peux maintenant aussi te connecter avec ton email.",
      });
      setPassword("");
      setConfirm("");
    } catch {
      setFeedback({ ok: false, message: "Le changement a échoué. Réessaie dans un instant." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-border bg-bg2 p-6">
      <h2 className="font-display text-lg font-bold">
        {hasPassword ? "Mot de passe" : "Définir un mot de passe"}
      </h2>
      {!hasPassword && (
        <p className="mt-1 font-display text-sm text-muted">
          Ton compte utilise uniquement Google. Définis un mot de passe pour
          pouvoir aussi te connecter avec ton email.
        </p>
      )}

      <form onSubmit={save} className="mt-4 grid gap-3 sm:max-w-md sm:grid-cols-2">
        <div>
          <label
            htmlFor="newPassword"
            className="mb-1.5 block font-display text-sm font-medium text-muted"
          >
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block font-display text-sm font-medium text-muted"
          >
            Confirme
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="justify-self-start rounded-[10px] bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60 sm:col-span-2"
        >
          {saving ? "Enregistrement…" : hasPassword ? "Changer le mot de passe" : "Définir le mot de passe"}
        </button>

        {feedback && (
          <p
            role="status"
            className={`font-display text-sm sm:col-span-2 ${feedback.ok ? "text-success" : "text-danger"}`}
          >
            {feedback.message}
          </p>
        )}
      </form>
    </section>
  );
}
