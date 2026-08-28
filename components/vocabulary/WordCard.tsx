"use client";

import { useState } from "react";
import type { CustomVocabWord } from "@/lib/vocabulary/custom";
import { type Focus } from "@/lib/vocabulary/focus";
import { speakFr, speakRu } from "@/lib/vocabulary/speech";
import FocusControl from "@/components/vocabulary/FocusControl";
import SpeakButton from "@/components/vocabulary/SpeakButton";
import WordExplanation from "@/components/vocabulary/WordExplanation";
import AiSpark from "@/components/ui/AiSpark";

/**
 * Un mot, en carte.
 *
 * Les actions qui portent sur LA CARTE — expliquer, supprimer — sont dans
 * la barre du haut, sans repli intermédiaire. Les versions précédentes
 * cachaient la suppression derrière un menu « ⋯ » qui ne contenait qu'elle :
 * deux clics pour une action unique, et un pictogramme qui n'annonçait rien
 * de ce qu'il ouvrait.
 *
 * Les actions qui portent sur UN MOT — l'écouter — sont contre ce mot, pas
 * dans cette barre : voir components/vocabulary/SpeakButton.tsx.
 *
 * Ce qui n'y figure pas, et pourquoi : le genre et l'animacité du mot. Ils
 * étaient réglables ici, ce qui revenait à demander à l'apprenant de
 * corriger la classification — or s'il savait que « спаси́бо » n'est pas un
 * nom neutre inanimé, il n'aurait pas besoin de l'app. La classification se
 * fait à l'ajout (app/api/vocab/words) et ne se règle plus nulle part.
 *
 * En revanche la PRIORITÉ DE RÉVISION se règle ici, et nulle part ailleurs.
 * La carte portait avant une pastille « à découvrir / en cours / maîtrisé »
 * déduite du compteur SM-2 : une étiquette que l'apprenant lisait sans
 * jamais pouvoir la contredire. Le sélecteur qui l'a remplacée dit la même
 * chose — où en est ce mot — mais c'est lui qui l'écrit.
 */

export default function WordCard({
  word,
  onDelete,
  onFocusChange,
}: {
  word: CustomVocabWord;
  onDelete: (wordId: string) => void;
  onFocusChange: (wordId: string, focus: Focus) => void;
}) {
  const [explaining, setExplaining] = useState(false);
  // Confirmation en deux temps : la suppression emporte aussi l'historique
  // de révision du mot, qui ne se récupère pas. Elle se joue dans la même
  // rangée, sans déplier la carte ni ouvrir de fenêtre.
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={`rounded-2xl border bg-bg2 transition-colors ${
        confirming
          ? "border-danger/50"
          : explaining
            ? "border-accent2/40"
            : "border-border hover:bg-bg3"
      }`}
    >
      <div className="px-5 pb-3.5 pt-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-muted/70">
            Russe → Français
          </span>

          {confirming ? (
            <div className="ml-auto flex items-center gap-2">
              <span className="font-display text-[11px] text-muted">
                Supprimer ce mot et son historique ?
              </span>
              <button
                type="button"
                onClick={() => onDelete(word.id)}
                autoFocus
                className="rounded-lg bg-danger px-2.5 py-1 font-display text-[11px] font-bold text-white"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="font-display text-[11px] font-semibold text-muted hover:text-text"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExplaining((e) => !e)}
                aria-expanded={explaining}
                title="Expliquer ce mot avec l'IA"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-display text-[11px] font-bold transition-colors ${
                  explaining
                    ? "border-accent2 bg-accent2/20 text-accent2"
                    : "border-accent2/40 bg-accent2/10 text-accent2 hover:border-accent2/50 hover:bg-accent2/20"
                }`}
              >
                <AiSpark className="h-3.5 w-3.5" />
                Expliquer
              </button>

              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Supprimer ${word.ru}`}
                title="Supprimer ce mot"
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Les deux langues à égalité, comme dans un dictionnaire ouvert.
            La translittération passe SOUS le mot russe : à côté, elle se
            collait à l'accent tonique de la dernière voyelle. */}
        <div className="grid grid-cols-1 items-baseline gap-x-6 gap-y-1 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="flex min-w-0 items-baseline gap-1.5 font-display text-lg font-bold leading-snug">
              <span className="min-w-0">{word.ru}</span>
              <SpeakButton
                label={`Écouter ${word.ru} en russe`}
                title="Écouter en russe"
                onSpeak={() => speakRu(word.ru)}
              />
            </p>
            {word.transliteration && (
              <p className="font-display text-xs leading-snug text-muted/80">
                {word.transliteration}
              </p>
            )}
          </div>
          <p className="flex min-w-0 items-baseline gap-1.5 font-display text-lg leading-snug text-text/90">
            <span className="min-w-0">{word.fr}</span>
            <SpeakButton
              label={`Écouter ${word.fr} en français`}
              title="Écouter en français"
              onSpeak={() => speakFr(word.fr)}
            />
          </p>
        </div>

        {/* Sous les deux langues, pas dans la barre d'actions du haut : le
            réglage porte sur le mot qu'on vient de lire, et il se lit en
            colonne quand on parcourt la liste. */}
        <div className="mt-3">
          <FocusControl
            value={word.focus}
            word={word.ru}
            onChange={(focus) => onFocusChange(word.id, focus)}
          />
        </div>
      </div>

      {explaining && (
        <div className="animate-fade-in border-t border-border px-5 py-4">
          <WordExplanation wordId={word.id} autoLoad />
        </div>
      )}
    </div>
  );
}
