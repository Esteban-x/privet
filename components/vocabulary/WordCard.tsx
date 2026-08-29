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
 * TROIS ESSAIS AVANT CELUI-CI, et chacun corrigeait le précédent.
 *
 * 1. Trois rangées empilées — commandes, langues, sélecteur de rangement :
 *    130 px par mot, dont la moitié en boutons. Sur cent mots, six écrans
 *    de commandes pour six écrans de vocabulaire.
 * 2. Tout replié derrière un « ⋯ ». Compact, mais un appui de plus pour les
 *    deux gestes qu'on fait constamment — expliquer, ranger. Un menu qui ne
 *    contient que ce qu'on fait souvent est un obstacle, pas un menu.
 * 3. Les commandes remontées sur la ligne du libellé. Elles y flottaient
 *    dans une bande à part, sans rapport visuel avec le mot qu'elles
 *    règlent — et sur téléphone, où ce libellé est masqué, elles se
 *    retrouvaient seules dans un bandeau vide en haut de chaque carte.
 *
 * ELLES SONT DONC SUR LA LIGNE DES MOTS, à droite, et le groupe a une
 * LARGEUR CONSTANTE : trois cases de 28 px, un bouton dont le texte ne
 * change jamais, une corbeille. C'est le point qui manquait aux versions
 * précédentes — le sélecteur changeait de largeur selon le rangement actif
 * (« À travailler » et « Normal » n'ont pas la même longueur), donc la
 * colonne de droite ondulait le long de la liste. Sur une liste, ce qui se
 * voit n'est pas la largeur d'un élément mais l'irrégularité entre les
 * lignes.
 *
 * Sous 640 px, les commandes passent sous les mots plutôt que de les
 * comprimer ; entre 640 et 1024, « Expliquer » se réduit à son étincelle,
 * parce qu'à cette largeur c'est lui qui écrase les deux colonnes de texte.
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
        {/* Le libellé est identique sur CHAQUE carte — toutes les listes vont
            du russe au français — donc il ne distingue rien : c'est une
            étiquette de colonne recopiée sur chaque ligne. Il gagne sa place
            sur grand écran, où les deux langues sont côte à côte et où rien
            d'autre ne dit laquelle est laquelle ; sur téléphone elles
            s'empilent et l'alphabet suffit. */}
        <span className="mb-1.5 hidden font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-muted/70 sm:block">
          Russe → Français
        </span>

        {/* LES COMMANDES SONT SUR LA LIGNE DES MOTS, PAS AU-DESSUS.
            Elles ont d'abord été posées sur la ligne du libellé : sur grand
            écran elles flottaient dans une bande à part, sans rapport visuel
            avec le mot qu'elles règlent, et sur téléphone — où ce libellé
            n'existe pas — elles se retrouvaient seules dans un bandeau vide
            en haut de chaque carte.

            Le groupe a maintenant une largeur CONSTANTE : trois cases de
            28 px, un bouton dont le texte ne change jamais, une corbeille.
            C'est ce qui fait que la colonne de droite s'aligne d'une carte à
            l'autre — l'irrégularité entre les lignes est ce qui se voyait le
            plus. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Les deux langues à égalité, comme dans un dictionnaire ouvert.
              La translittération passe SOUS le mot russe : à côté, elle se
              collait à l'accent tonique de la dernière voyelle. */}
          <div className="grid min-w-0 flex-1 grid-cols-1 items-baseline gap-x-6 gap-y-0.5 sm:grid-cols-2">
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

          {confirming ? (
            <div className="flex shrink-0 items-center justify-end gap-2">
              <span className="font-display text-[11px] text-muted">Supprimer ce mot ?</span>
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
            <div className="flex shrink-0 items-center justify-end gap-1.5">
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
                className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 font-display text-[11px] font-bold transition-colors lg:px-2.5 ${
                  explaining
                    ? "border-accent2 bg-accent2/20 text-accent2"
                    : "border-accent2/40 bg-accent2/10 text-accent2 hover:border-accent2/50 hover:bg-accent2/20"
                }`}
              >
                <AiSpark className="h-3.5 w-3.5" />
                {/* Le mot n'apparaît qu'au-delà de 1024 px : entre 640 et
                    1024, la carte a deux colonnes de texte à loger et c'est
                    lui qui les compresse en premier. */}
                <span className="hidden lg:inline">Expliquer</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Supprimer ${word.ru}`}
                title="Supprimer ce mot"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/15 hover:text-danger"
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
      </div>

      {explaining && (
        <div className="animate-fade-in border-t border-border px-4 py-4">
          <WordExplanation wordId={word.id} autoLoad />
        </div>
      )}
    </div>
  );
}
