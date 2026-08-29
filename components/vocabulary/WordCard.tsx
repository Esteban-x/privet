"use client";

import { useState } from "react";
import type { CustomVocabWord } from "@/lib/vocabulary/custom";
import { FOCUS_META, type Focus } from "@/lib/vocabulary/focus";
import { speakFr, speakRu } from "@/lib/vocabulary/speech";
import FocusControl from "@/components/vocabulary/FocusControl";
import SpeakButton from "@/components/vocabulary/SpeakButton";
import WordExplanation from "@/components/vocabulary/WordExplanation";
import AiSpark from "@/components/ui/AiSpark";

/**
 * Un mot, en carte.
 *
 * AU REPOS ELLE NE MONTRE QUE LE MOT. Elle portait en permanence trois
 * rangées : les actions (« Expliquer », la corbeille), les deux langues, et
 * le sélecteur de rangement à trois segments. 130 px par mot, dont la
 * moitié en commandes — sur cent mots, c'est six écrans de boutons pour six
 * écrans de vocabulaire, et c'est ce qui rendait la liste illisible.
 *
 * Les commandes se déplient au clic sur « ⋯ ». Le geste coûte un appui à
 * qui veut supprimer un mot ; il en épargne autant qu'il y a de mots à qui
 * veut simplement lire sa liste, ce qui est l'usage normal.
 *
 * LE RANGEMENT RESTE VISIBLE, lui, parce que c'est une INFORMATION sur le
 * mot et pas une commande : un signe de 12 px dans la couleur du rangement
 * (★ à travailler, ✓ acquis, rien pour « normal », qui est le défaut et n'a
 * pas à se signaler). On le change dans le repli.
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
  const [open, setOpen] = useState(false);
  const [explaining, setExplaining] = useState(false);
  // Confirmation en deux temps : la suppression emporte aussi l'historique
  // de révision du mot, qui ne se récupère pas.
  const [confirming, setConfirming] = useState(false);

  const meta = FOCUS_META[word.focus];

  return (
    <div
      className={`group rounded-2xl border bg-bg2 transition-colors ${
        confirming
          ? "border-danger/50"
          : explaining || open
            ? "border-accent2/40"
            : "border-border hover:bg-bg3"
      }`}
    >
      <div className="flex items-start gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-muted/70">
              Russe → Français
            </span>
            {/* « normal » ne se signale pas : c'est l'état par défaut, et le
                marquer aurait mis un signe sur chaque ligne pour ne rien
                dire. Seuls les deux rangements CHOISIS se voient. */}
            {word.focus !== "normal" && (
              <span
                title={meta.label}
                aria-label={`Rangement : ${meta.label}`}
                className={`font-display text-[12px] leading-none ${meta.text}`}
              >
                {meta.icon}
              </span>
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

        {/* PRESQUE INVISIBLE AU REPOS, ENTIÈREMENT PRÉSENT AU SURVOL et dès
            qu'on l'atteint au clavier. Sur un écran tactile il n'y a pas de
            survol : d'où l'opacité de base à 40 % plutôt que zéro — assez
            pour se voir et se viser, assez peu pour ne pas faire une colonne
            de points le long de la liste. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`Actions sur ${word.ru}`}
          title="Actions sur ce mot"
          className="hover-surface -mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted opacity-40 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="animate-fade-in space-y-3 border-t border-border px-4 py-3">
          <FocusControl
            value={word.focus}
            word={word.ru}
            onChange={(focus) => onFocusChange(word.id, focus)}
          />

          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[12px] text-muted">
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExplaining((e) => !e)}
                aria-expanded={explaining}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-display text-[11px] font-bold transition-colors ${
                  explaining
                    ? "border-accent2 bg-accent2/20 text-accent2"
                    : "border-accent2/40 bg-accent2/10 text-accent2 hover:border-accent2/50 hover:bg-accent2/20"
                }`}
              >
                <AiSpark className="h-3.5 w-3.5" />
                Expliquer ce mot
              </button>

              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Supprimer ${word.ru}`}
                className="ml-auto rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
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
      )}

      {explaining && (
        <div className="animate-fade-in border-t border-border px-4 py-4">
          <WordExplanation wordId={word.id} autoLoad />
        </div>
      )}
    </div>
  );
}
