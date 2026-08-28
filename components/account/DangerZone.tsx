"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction } from "@/app/account/actions";
import { INITIAL_DELETE_ACCOUNT_STATE } from "@/lib/auth/delete-account-state";

const CONFIRM_WORD = "SUPPRIMER";

// Friction délibérée : retaper le mot n'ajoute rien côté sécurité (l'action
// serveur ne vérifie que la session), c'est un garde-fou contre le clic
// accidentel sur une opération irréversible.
export default function DangerZone() {
  const [state, formAction, pending] = useActionState(
    deleteAccountAction,
    INITIAL_DELETE_ACCOUNT_STATE,
  );
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <section className="rounded-[20px] border border-danger/40 bg-danger/5 p-6">
      <h2 className="font-display text-lg font-bold text-danger">Zone dangereuse</h2>
      <p className="mt-1 font-display text-sm text-muted">
        Supprime définitivement ton compte : progression, statistiques, vocabulaire et historique de
        chat inclus. Cette action est irréversible.
      </p>

      <form action={formAction} className="mt-4">
        <label
          htmlFor="confirmDelete"
          className="mb-1.5 block font-display text-sm font-medium text-muted"
        >
          Tape <span className="font-semibold text-text">{CONFIRM_WORD}</span> pour confirmer
        </label>
        <input
          id="confirmDelete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="w-full max-w-xs rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm uppercase tracking-wide text-text focus:border-danger field-focus focus:outline-none"
        />

        <button
          type="submit"
          disabled={!canDelete || pending}
          className="mt-4 block rounded-[10px] bg-danger px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Suppression…" : "Supprimer définitivement mon compte"}
        </button>

        {state.error && (
          <p role="alert" className="mt-3 font-display text-sm text-danger">
            {state.error}
          </p>
        )}
      </form>
    </section>
  );
}
