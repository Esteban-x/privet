"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import DirectionToggle from "@/components/exercises/DirectionToggle";
import SessionSummary from "@/components/exercises/SessionSummary";
import { loadDirection, saveDirection, type VocabDirection } from "@/lib/storage";
import { fetchDailyProgress } from "@/lib/vocabulary/custom";
import { useReviewQueue } from "@/lib/vocabulary/useReviewQueue";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";

// Tolérant aux accents français (café/cafe, garçon/garcon) : ce mode peut
// attendre une réponse française (direction "ru-first") sans clavier AZERTY
// à disposition, et il serait injuste de compter un accent oublié comme
// une vraie faute alors que le mot est correct. La décomposition NFD sépare
// aussi "ё" en "е" + accent, donc le remplacement explicite ci-dessous est
// redondant mais gardé par clarté (fonctionne dans les deux ordres).
function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export default function TypingPage() {
  return (
    <Suspense fallback={null}>
      <TypingInner />
    </Suspense>
  );
}

function TypingInner() {
  const searchParams = useSearchParams();
  const listId = searchParams.get("list");

  const [direction, setDirection] = useState<VocabDirection>(() =>
    loadDirection("typing", "fr-first")
  );
  function changeDirection(d: VocabDirection) {
    setDirection(d);
    saveDirection("typing", d);
  }

  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | "revealed" | null>(null);
  const {
    current,
    review,
    reload,
    loading,
    loadError,
    listName,
    sessionIndex,
    sessionCorrect,
    noWordsAtAll,
  } = useReviewQueue(listId);

  const [daily, setDaily] = useState<{ reviewedToday: number; goal: number } | null>(null);
  useEffect(() => {
    fetchDailyProgress().then(setDaily).catch(() => {});
  }, []);

  // Deuxième Entrée (passer au mot suivant) : déplace le focus clavier sur
  // le bouton "Suivant" une fois le résultat affiché, pour qu'Entrée
  // l'active nativement (comportement natif du navigateur pour un bouton
  // focus). Le déplacement se fait au keyUp du champ (voir plus bas), PAS
  // dans un effet déclenché par `result` : le focus bougerait alors DANS le
  // même appui de touche que celui qui vient de valider — le navigateur
  // active un bouton fraîchement focus à son keyUp, donc ce même relâchement
  // de touche cliquait aussitôt "Suivant" et sautait le mot sans jamais
  // laisser voir le résultat. Attendre le keyUp du champ garantit que la
  // touche qui a validé est bien relâchée avant que "Suivant" ne devienne
  // actif au clavier.
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Nouveau mot : efface la saisie précédente. Ajusté pendant le rendu
  // (comparaison à l'id précédemment vu) plutôt que dans un effet.
  const [seenQuestionId, setSeenQuestionId] = useState(current?.id);
  if (current?.id !== seenQuestionId) {
    setSeenQuestionId(current?.id);
    setInput("");
    setResult(null);
  }

  // Ramène le focus sur le champ de saisie pour le nouveau mot — le focus
  // était sur le bouton "Suivant" (voir l'effet ci-dessus) juste avant.
  useEffect(() => {
    inputRef.current?.focus();
  }, [current?.id]);

  const backHref = listId ? `/vocabulary/lists/${listId}` : "/vocabulary/review";
  const backLabel = listId ? `← ${listName || "Liste"}` : "← Révision";

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-lg text-danger">{loadError}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <ReviewCardSkeleton />
      </div>
    );
  }

  if (noWordsAtAll) {
    return <EmptyState />;
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <SessionSummary
          reviewed={sessionIndex}
          correct={sessionCorrect}
          goal={daily?.goal ?? 15}
          reviewedTodayTotal={(daily?.reviewedToday ?? 0) + sessionIndex}
          backHref={backHref}
          backLabel={backLabel}
          onRestart={reload}
        />
      </div>
    );
  }

  // Le sens détermine ce qui est montré (l'indice) et ce qui est attendu :
  // "ru-first" montre le russe et attend le français, et inversement.
  const expectedIsRussian = direction !== "ru-first";
  const clue = expectedIsRussian ? current.fr : current.ru;
  const instruction = expectedIsRussian ? "Écris ce mot en russe :" : "Écris ce mot en français :";
  const answer = expectedIsRussian ? current.ru : current.fr;

  function submit() {
    if (!current || !input.trim() || result) return;
    const ok = normalize(input) === normalize(answer);
    setResult(ok ? "correct" : "incorrect");
  }

  // Pour quelqu'un qui ne sait vraiment pas — évite de taper n'importe quoi
  // juste pour débloquer "Vérifier" et voir la réponse. Compte comme un
  // échec côté SRS (même `review(1)` que "incorrect" dans next() ci-dessous
  // : la mémoire a clairement besoin de retravailler ce mot), mais affiché
  // sans le ton "faute" du rouge — ce n'est pas une erreur, juste un aveu
  // honnête plutôt qu'une réponse bidon.
  function reveal() {
    if (!current || result) return;
    setResult("revealed");
  }

  function next() {
    if (!result) return;
    review(result === "correct" ? 4 : 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
        >
          {backLabel}
        </Link>
        <DirectionToggle direction={direction} onChange={changeDirection} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
          {current.theme} · mot {sessionIndex + 1}
        </p>
        <p className="font-display text-xs font-semibold text-muted">
          {sessionCorrect}/{sessionIndex} correct{sessionCorrect > 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-[20px] border border-border bg-bg2 p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <p className="font-display text-sm text-muted">{instruction}</p>
        <p className="mt-2 font-display text-3xl font-bold text-accent2">{clue}</p>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !result && submit()}
          onKeyUp={(e) => {
            // Voir le commentaire sur `nextButtonRef` plus haut : ce
            // déplacement de focus attend exprès le relâchement de la
            // touche Entrée qui vient de valider, pour ne pas déclencher
            // "Suivant" sur ce même appui.
            if (e.key === "Enter" && result) nextButtonRef.current?.focus();
          }}
          placeholder="Тапи здесь…"
          ref={inputRef}
          // `readOnly` plutôt que `disabled` : un champ désactivé arrête de
          // recevoir les événements clavier/perd le focus. Le focus est
          // ramené ici au mot suivant (effet plus haut), donc plus besoin de
          // `autoFocus` (qui ne s'appliquerait qu'au tout premier rendu).
          readOnly={!!result}
          className={`mt-6 w-full rounded-[10px] border border-border bg-bg px-4 py-3 text-center font-display text-2xl text-text outline-none placeholder:text-muted/60 focus:border-accent ${
            result ? "opacity-60" : ""
          }`}
        />

        {result && (
          <div
            className={`mt-4 rounded-xl border p-3 ${
              result === "correct"
                ? "border-success bg-success/10"
                : result === "revealed"
                  ? "border-border bg-bg3"
                  : "border-danger bg-danger/10"
            }`}
          >
            <p className="font-display text-sm font-bold uppercase">
              {result === "correct" ? "✓ Correct" : result === "revealed" ? "Réponse" : "✗ Presque"}
            </p>
            <p className="font-display text-xl font-bold">{answer}</p>
            {expectedIsRussian && (
              <p className="font-display text-sm text-muted">{current.transliteration}</p>
            )}
          </div>
        )}

        <button
          ref={nextButtonRef}
          onClick={result ? next : submit}
          className="mt-6 w-full rounded-[10px] bg-accent py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
        >
          {result ? "Suivant →" : "Vérifier"}
        </button>

        {!result && (
          <button
            onClick={reveal}
            className="mt-2.5 w-full rounded-[10px] border border-border py-2.5 font-display text-sm font-semibold text-muted transition-colors hover:border-accent2 hover:text-accent2"
          >
            💡 Je ne sais pas — voir la réponse
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-display text-lg font-semibold">Aucun mot à réviser pour l&apos;instant</p>
      <p className="mt-2 font-display text-sm text-muted">
        Choisis des thèmes dans ton{" "}
        <Link href="/account" className="text-accent hover:underline">
          profil
        </Link>{" "}
        pour obtenir des mots tout faits, ou crée ta propre liste.
      </p>
      <Link
        href="/vocabulary"
        className="mt-5 inline-block rounded-[10px] bg-accent px-5 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
      >
        Aller à mes listes
      </Link>
    </div>
  );
}
