"use client";

import { useMemo, useState } from "react";
import { ReadingText } from "@/lib/reading/texts";
import { CASES } from "@/lib/grammar/cases";

/**
 * `onCompleted` : quand le parent le fournit, c'est LUI qui décide de la
 * suite (le générateur referme le texte). Sans lui — pages /reading/[id] et
 * /reading/mine/[id], où le texte EST la page — le bouton se contente de
 * passer à l'état « terminé » sur place.
 */
export default function ReadingPassage({
  text,
  onCompleted,
}: {
  text: ReadingText;
  onCompleted?: () => void;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [completion, setCompletion] = useState<"idle" | "saving" | "done">("idle");

  // Cas effectivement présents dans CE texte, dans l'ordre du tableau CASES
  // (même ordre que le module /cases) — sert à la fois à savoir s'il y a
  // quelque chose à colorer et à construire la légende.
  const casesPresent = useMemo(() => {
    const ids = new Set(text.sentences.flatMap((s) => s.map((w) => w.case).filter(Boolean)));
    return CASES.filter((c) => ids.has(c.id));
  }, [text]);

  // Les tags que la banque de déclinaisons n'a pas pu confirmer. Les textes
  // écrits à la main n'ont pas de caseStatus : ils sont contrôlés par
  // check:reading, donc comptés comme confirmés.
  const unverifiedCount = useMemo(
    () =>
      text.sentences
        .flat()
        .filter((w) => w.case && w.caseStatus === "unverified").length,
    [text]
  );

  const [showCases, setShowCases] = useState(true);

  // Un nouveau texte (nouvel id, ou texte généré par IA remplacé) repart
  // sur un bouton "terminé" non coché plutôt que de garder l'état du
  // précédent — comparaison pendant le rendu plutôt qu'un effet (même
  // pattern que `seenPathname` dans components/layout/NavBar.tsx).
  const [seenTextId, setSeenTextId] = useState(text.id);
  if (text.id !== seenTextId) {
    setSeenTextId(text.id);
    setCompletion("idle");
  }

  async function markDone() {
    if (completion !== "idle") return;
    setCompletion("saving");
    try {
      await fetch("/api/reading/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textId: text.id, level: text.level }),
      });
    } catch {
      // best-effort, comme le reste du suivi de progression de l'app
    }
    setCompletion("done");
    onCompleted?.();
  }

  return (
    <div className="rounded-[20px] surface p-8 shadow-float">
      {casesPresent.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-5">
          <button
            onClick={() => setShowCases((v) => !v)}
            className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-text"
          >
            <span
              className={`flex h-4 w-7 items-center rounded-full transition-colors ${showCases ? "bg-accent" : "bg-border"}`}
            >
              <span
                className={`h-3 w-3 rounded-full bg-white transition-transform ${showCases ? "translate-x-3.5" : "translate-x-0.5"}`}
              />
            </span>
            Cas grammaticaux
          </button>
          {showCases && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {casesPresent.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5 font-display text-xs text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.nameFr}
                </span>
              ))}
            </div>
          )}
          {showCases && unverifiedCount > 0 && (
            <p className="w-full font-display text-[11px] leading-relaxed text-muted">
              Soulignement plein : cas confirmé par le dictionnaire de
              déclinaisons. Soulignement pointillé ({unverifiedCount}
              {" "}mot{unverifiedCount > 1 ? "s" : ""}) : analyse de l&apos;IA que
              l&apos;app n&apos;a pas pu vérifier — à prendre comme une
              indication.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4 font-display text-2xl leading-relaxed">
        {text.sentences.map((sentence, sIdx) => (
          <p key={sIdx}>
            {sentence.map((word, wIdx) => {
              const key = `${sIdx}-${wIdx}`;
              if (!word.gloss) return <span key={key}>{word.ru} </span>;
              const active = activeKey === key;
              const caseInfo = showCases && word.case ? CASES.find((c) => c.id === word.case) : undefined;
              const caseInfoForPopover = word.case ? CASES.find((c) => c.id === word.case) : undefined;
              const unverified = word.caseStatus === "unverified";
              return (
                <span key={key} className="relative">
                  <button
                    onClick={() => setActiveKey(active ? null : key)}
                    className={`border-b-2 pb-0.5 transition-colors ${
                      caseInfo
                        ? `${unverified ? "border-dashed" : ""} ${active ? "bg-white/10" : "hover:bg-white/5"}`
                        : `border-dotted border-accent2 ${active ? "bg-accent2/15" : "hover:bg-accent2/10"}`
                    }`}
                    style={caseInfo ? { borderColor: caseInfo.color } : undefined}
                  >
                    {word.ru}
                  </button>{" "}
                  {active && (
                    <span className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap rounded-lg border border-border bg-bg3 px-2.5 py-1.5 font-display text-sm font-semibold text-text">
                      {word.gloss}
                      {caseInfoForPopover && (
                        <span
                          className="ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white"
                          style={{ backgroundColor: caseInfoForPopover.color }}
                        >
                          {caseInfoForPopover.nameFr}
                          {unverified && " ?"}
                        </span>
                      )}
                      {unverified && (
                        <span className="ml-1.5 text-[11px] font-normal text-muted">
                          non vérifié
                        </span>
                      )}
                    </span>
                  )}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      <div className="mt-6 flex justify-end border-t border-border pt-5">
        {completion === "done" ? (
          <span className="font-display text-sm font-semibold text-accent">✓ Texte terminé</span>
        ) : (
          <button
            onClick={markDone}
            disabled={completion === "saving"}
            className="btn btn-primary btn-sheen rounded-[10px] px-5 py-2.5 font-display text-sm disabled:opacity-60"
          >
            {completion === "saving" ? "…" : "J'ai terminé ce texte"}
          </button>
        )}
      </div>
    </div>
  );
}
