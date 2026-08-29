"use client";

import { useState } from "react";
import { LEXICON } from "@/lib/vocabulary/lexicon.generated";
import { createNewCard, reviewCard, type Quality, type SrsCard } from "@/lib/srs/sm2";

/**
 * Une carte de révision qui marche, pour quelqu'un qui n'a pas de compte.
 *
 * POURQUOI UNE VRAIE CARTE ET NON UNE CAPTURE. Ce qu'il faut faire
 * comprendre — « l'app décide quand te remontrer ce mot » — ne se lit pas,
 * ça se constate.
 *
 * POURQUOI UN SEUL MOT, RÉVISÉ PLUSIEURS FOIS. Première version : cinq mots
 * différents, une note chacun. Elle ne démontrait RIEN, et c'est le SM-2
 * lui-même qui l'interdisait — à la première révision d'une carte neuve,
 * l'intervalle vaut 1 jour quelle que soit la note (`repetitions === 1`).
 * Les quatre boutons auraient tous affiché « demain », c'est-à-dire
 * exactement le contraire de ce qu'on voulait montrer.
 *
 * L'écart ne naît qu'en RÉPÉTANT : demain, six jours, deux semaines, cinq
 * semaines — et « Facile » écarte plus vite que « Bien » parce qu'il
 * remonte le facteur de facilité. Un « À revoir » ramène tout à demain.
 * C'est ça, la répétition espacée, et ça se voit en quatre clics.
 *
 * ELLE NE MENT PAS. Les intervalles sortent de `reviewCard` — le SM-2 de
 * l'app, celui qui tourne pour les abonnés (lib/srs/sm2.ts) — et le mot
 * vient de LEXICON, la banque relue à la main. Une démonstration aux
 * chiffres inventés serait pire que pas de démonstration : le jour où
 * l'apprenant s'abonne, il compare.
 *
 * RIEN N'EST ENREGISTRÉ, et il n'y a rien à enregistrer : tout l'état vit
 * ici, aucun appel réseau. C'est aussi ce qui permet de la servir à un
 * visiteur sans ouvrir la moindre route.
 */

/** Le mot de la démonstration, tel qu'il figure dans la banque. */
const DEMO_WORD = "кни́га";
const DEMO_TRANSLATION = LEXICON.find((e) => e[0] === DEMO_WORD)?.[1] ?? "livre";

/**
 * Les quatre notes de l'app, avec LEURS valeurs SM-2 — les mêmes qu'en
 * révision réelle (voir app/vocabulary/flashcards/page.tsx). Les recopier
 * approximativement aurait donné une démonstration qui ne correspond à rien.
 */
const GRADES: { label: string; quality: Quality; color: string }[] = [
  { label: "À revoir", quality: 1, color: "var(--color-accent2-deep)" },
  { label: "Difficile", quality: 3, color: "var(--color-accent2)" },
  { label: "Bien", quality: 4, color: "var(--color-accent)" },
  { label: "Facile", quality: 5, color: "var(--color-success)" },
];

/**
 * L'intervalle, en français lisible.
 *
 * LES SEMAINES EXISTENT PARCE QUE 38 JOURS N'EST PAS « UN MOIS ». Sans
 * elles, la quatrième révision — la plus parlante, celle où l'écart devient
 * spectaculaire — s'arrondissait à « dans un mois », soit moins que ce
 * qu'annonçait la troisième une fois arrondie. La démonstration semblait
 * reculer au moment précis où elle avance.
 */
function delay(days: number): string {
  if (days <= 1) return "demain";
  if (days < 14) return `dans ${days} jours`;
  if (days < 60) return `dans ${Math.round(days / 7)} semaines`;
  return `dans ${Math.round(days / 30)} mois`;
}

interface Step {
  grade: string;
  color: string;
  delay: string;
}

export default function VocabDemoCard() {
  const [card, setCard] = useState<SrsCard>(() => createNewCard(DEMO_WORD));
  const [flipped, setFlipped] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  function grade(g: (typeof GRADES)[number]) {
    const next = reviewCard(card, g.quality);
    setCard(next);
    setSteps((prev) => [
      ...prev,
      { grade: g.label, color: g.color, delay: delay(next.intervalDays) },
    ]);
    setFlipped(false);
  }

  function restart() {
    setCard(createNewCard(DEMO_WORD));
    setSteps([]);
    setFlipped(false);
  }

  return (
    <div className="rounded-[20px] surface p-6 shadow-float sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-muted">
          Démonstration
        </p>
        <p className="font-display text-xs text-muted">
          {steps.length === 0
            ? "Carte neuve"
            : `${steps.length} révision${steps.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Hauteur FIXE et non dictée par le contenu : le russe et le français
          n'ont pas la même longueur, et une carte qui change de taille en se
          retournant fait sauter tout ce qui la suit — la moitié de l'effet
          « carte » vient de là. */}
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl surface-interactive px-6 text-center"
      >
        {flipped ? (
          <>
            <p className="font-display text-3xl font-bold text-accent">{DEMO_TRANSLATION}</p>
            <p className="font-display text-sm text-muted">{DEMO_WORD}</p>
          </>
        ) : (
          <>
            <p className="font-display text-4xl font-bold">{DEMO_WORD}</p>
            <p className="font-display text-sm text-muted">Clique pour retourner</p>
          </>
        )}
      </button>

      {/* Les notes n'apparaissent qu'une fois la carte retournée : se noter
          avant d'avoir vu la réponse n'a aucun sens, et les afficher d'emblée
          invite à le faire. La hauteur est réservée pour que la page ne
          sursaute pas à chaque retournement. */}
      <div className="mt-4 min-h-[92px] sm:min-h-[52px]">
        {flipped ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRADES.map((g) => (
              <button
                key={g.label}
                type="button"
                onClick={() => grade(g)}
                className="rounded-xl border px-3 py-2.5 font-display text-sm font-semibold transition-colors hover:bg-bg3"
                style={{ borderColor: g.color, color: g.color }}
              >
                {g.label}
              </button>
            ))}
          </div>
        ) : (
          steps.length > 0 && (
            <p className="pt-3 text-center font-display text-sm text-muted">
              Retourne-la encore : l&apos;écart continue de grandir.
            </p>
          )
        )}
      </div>

      {/* LA TRACE EST LE CŒUR DE LA DÉMONSTRATION. Une échéance isolée ne
          dit rien ; c'est la SUITE qui fait comprendre — et qui rend visible
          qu'un « À revoir » ramène tout à demain. */}
      {steps.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <ol className="space-y-1.5">
            {steps.map((s, i) => (
              <li key={i} className="flex items-baseline gap-2.5 font-display text-sm">
                <span className="w-4 shrink-0 text-right text-xs text-muted">{i + 1}</span>
                <span className="font-semibold" style={{ color: s.color }}>
                  {s.grade}
                </span>
                <span className="text-muted">→ revu</span>
                <span className="font-semibold text-text">{s.delay}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={restart}
            className="mt-3 font-display text-xs font-semibold text-accent hover:underline"
          >
            Repartir d&apos;une carte neuve
          </button>
        </div>
      )}
    </div>
  );
}
