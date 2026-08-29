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
 * DEUX RANGÉES, ET TOUT EST À DÉCOUVERT. Elle en a porté trois — commandes,
 * langues, sélecteur de rangement — soit 130 px par mot ; puis une seule,
 * les commandes repliées derrière un « ⋯ ». Le repli coûtait un appui à
 * chaque geste sur un mot, pour deux commandes qu'on emploie constamment :
 * expliquer, et ranger. Un menu qui ne contient que ce qu'on fait souvent
 * n'est pas un menu, c'est un obstacle.
 *
 * Tout tient donc sur la ligne du libellé, à droite : le rangement, le
 * bouton d'explication, la corbeille. La rangée existait de toute façon
 * pour porter « Russe → Français » — elle était vide à 70 %.
 *
 * CE QUI A RENDU ÇA POSSIBLE : `FocusControl` en variante compacte. Les
 * trois libellés en entier font 230 px et ne laissaient de place à rien
 * d'autre ; seul le segment ACTIF garde le sien, les deux autres se
 * réduisent à leur signe. L'état courant reste lisible en toutes lettres,
 * ce qui est la seule chose qu'on doit pouvoir lire sans réfléchir.
 *
 * Sous 640 px, « Expliquer » se réduit à son étincelle : à cette largeur,
 * c'est lui ou le mot russe.
 *
 * Ce qui n'y figure toujours pas : le genre et l'animacité. Ils étaient
 * réglables ici, ce qui revenait à demander à l'apprenant de corriger la
 * classification — or s'il savait que « спаси́бо » n'est pas un nom neutre
 * inanimé, il n'aurait pas besoin de l'app.
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
      <div className="px-4 py-3">
        {/* `flex-wrap` plutôt qu'une largeur calculée : sur un écran étroit
            avec un mot long, le groupe de commandes passe proprement à la
            ligne au lieu de comprimer le libellé jusqu'à l'illisible. */}
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="shrink-0 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-muted/70">
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
                className="rounded-lg bg-danger px-2.5 py-1 font-display text-[11px] font-bold text-on-tint"
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
            <div className="ml-auto flex items-center gap-1.5">
              <FocusControl
                compact
                value={word.focus}
                word={word.ru}
                onChange={(focus) => onFocusChange(word.id, focus)}
              />

              <button
                type="button"
                onClick={() => setExplaining((e) => !e)}
                aria-expanded={explaining}
                aria-label={`Expliquer ${word.ru}`}
                title="Expliquer ce mot avec l'IA"
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1.5 font-display text-[11px] font-bold transition-colors sm:px-2.5 ${
                  explaining
                    ? "border-accent2 bg-accent2/20 text-accent2"
                    : "border-accent2/40 bg-accent2/10 text-accent2 hover:border-accent2/50 hover:bg-accent2/20"
                }`}
              >
                <AiSpark className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Expliquer</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Supprimer ${word.ru}`}
                title="Supprimer ce mot"
                className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
              >
                <svg
                  aria-hidden
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
        <div className="grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 sm:grid-cols-2">
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
      </div>

      {explaining && (
        <div className="animate-fade-in border-t border-border px-4 py-4">
          <WordExplanation wordId={word.id} autoLoad />
        </div>
      )}
    </div>
  );
}
