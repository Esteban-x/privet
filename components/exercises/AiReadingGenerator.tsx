"use client";

import { useState } from "react";
import { ReadingText } from "@/lib/reading/texts";
import ReadingPassage from "./ReadingPassage";
import { LoadingDots, SkeletonLines } from "@/components/ui/Skeleton";
import Select from "@/components/ui/Select";
import { generateReadingText, type GenerateReadingOptions } from "@/lib/reading/client";
import { CASES } from "@/lib/grammar/cases";
import { READING_LEVELS, type CefrLevel } from "@/lib/supabase/types";
import type { ReadingLength, ReadingStyle } from "@/lib/ai/prompts";
import type { CaseId } from "@/lib/grammar/types";

const LENGTH_OPTIONS: { value: ReadingLength; label: string }[] = [
  { value: "short", label: "Court" },
  { value: "medium", label: "Moyen" },
  { value: "long", label: "Long" },
];

const STYLE_OPTIONS: { value: ReadingStyle; label: string }[] = [
  { value: "narrative", label: "Récit" },
  { value: "dialogue", label: "Dialogue" },
  { value: "description", label: "Description" },
];

export default function AiReadingGenerator({
  onGenerated,
}: {
  onGenerated?: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<ReadingText | null>(null);
  const [completedTitle, setCompletedTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // "" = laisser le serveur prendre le niveau du profil, ce qui évite au
  // client d'aller le chercher juste pour préremplir un menu.
  const [level, setLevel] = useState<CefrLevel | "">("");
  const [length, setLength] = useState<ReadingLength>("medium");
  const [style, setStyle] = useState<ReadingStyle>("narrative");
  const [focusCase, setFocusCase] = useState<CaseId | "">("");

  async function generate() {
    setLoading(true);
    setError(null);
    setCompletedTitle(null);
    try {
      const options: GenerateReadingOptions = { length, style };
      if (level) options.level = level;
      if (focusCase) options.focusCase = focusCase;
      const { text: generated, id } = await generateReadingText(options);
      // L'id validé côté client vaut toujours "ai-generated" (placeholder) —
      // remplacé par le vrai id sauvegardé en base dès qu'on l'a, pour que
      // "J'ai terminé ce texte" (ReadingPassage) logue le bon texte.
      setText(id ? { ...generated, id } : generated);
      if (id) onGenerated?.(id);
    } catch (err) {
      setError(
        err instanceof Error && err.message === "Non authentifié"
          ? "Connecte-toi pour générer un texte personnalisé."
          : "Génération indisponible. Vérifie ta configuration Anthropic."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[20px] border border-dashed border-accent/50 bg-accent/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Texte sur mesure</h3>
          <p className="mt-0.5 font-display text-sm text-muted">
            Un texte original généré pour ton niveau et tes thèmes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOptionsOpen((v) => !v)}
            className={`rounded-[10px] cursor-pointer border px-4 py-3 font-display text-sm font-semibold transition-colors ${
              optionsOpen
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-text"
            }`}
          >
            Options {optionsOpen ? "▲" : "▼"}
          </button>
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-[10px] cursor-pointer bg-accent px-5 py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Génération…" : "Générer un texte"}
          </button>
        </div>
      </div>

      {optionsOpen && (
        <div className="animate-fade-in mt-5 grid grid-cols-1 gap-4 rounded-[14px] border border-border bg-bg2 p-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-muted">
              Niveau
            </label>
            <Select
              value={level}
              onChange={(v) => setLevel(v as CefrLevel | "")}
              wrapperClassName="w-full"
              className="w-full rounded-[10px] border border-border bg-bg px-3 py-2.5 font-display text-sm text-text focus:border-accent focus:outline-none"
              options={[
                { value: "", label: "Mon niveau" },
                ...READING_LEVELS.map((l) => ({ value: l, label: l })),
              ]}
            />
          </div>

          <div>
            <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-muted">
              Longueur
            </label>
            <div className="flex gap-1.5">
              {LENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLength(opt.value)}
                  className={`flex-1 rounded-[10px] border px-2 py-2.5 font-display text-sm font-semibold transition-colors ${
                    length === opt.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:text-text"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-muted">
              Forme
            </label>
            <Select
              value={style}
              onChange={(v) => setStyle(v as ReadingStyle)}
              wrapperClassName="w-full"
              className="w-full rounded-[10px] border border-border bg-bg px-3 py-2.5 font-display text-sm text-text focus:border-accent focus:outline-none"
              options={STYLE_OPTIONS}
            />
          </div>

          <div className="sm:col-span-3">
            <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-muted">
              Cas grammatical à mettre en avant
            </label>
            <p className="mb-2 font-display text-xs text-muted">
              Le texte réutilisera ce cas plus souvent que d&apos;habitude — pratique pour
              t&apos;entraîner à le reconnaître en contexte (voir la coloration pendant la lecture).
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFocusCase("")}
                className={`rounded-full border px-3 py-1.5 font-display text-xs font-semibold transition-colors ${
                  focusCase === ""
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-text"
                }`}
              >
                Aucun (varié)
              </button>
              {CASES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFocusCase(c.id)}
                  className={`rounded-full border px-3 py-1.5 font-display text-xs font-semibold transition-colors ${
                    focusCase === c.id ? "text-white" : "border-border text-muted hover:text-text"
                  }`}
                  style={
                    focusCase === c.id
                      ? { backgroundColor: c.color, borderColor: c.color }
                      : undefined
                  }
                >
                  {c.nameFr}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-4 font-display text-sm text-danger">{error}</p>}

      {loading && (
        <div className="mt-6 animate-fade-in">
          <div className="mb-4">
            <LoadingDots label="Rédaction d'un texte original…" />
          </div>
          <div className="mb-3 flex items-center gap-2">
            <div className="skeleton h-5 w-12 rounded-full" />
            <div className="skeleton h-6 w-48 rounded-lg" />
          </div>
          <div className="rounded-[20px] border border-border bg-bg2 p-8">
            <SkeletonLines lines={6} />
          </div>
        </div>
      )}

      {/* Texte terminé : on referme la lecture au lieu de laisser le pavé
          ouvert sous le générateur. Le texte n'est pas perdu pour autant —
          il a été enregistré à la génération et reste accessible dans
          « Mes textes », ce que la confirmation dit explicitement pour que
          la fermeture ne ressemble pas à une perte. */}
      {!loading && !text && completedTitle && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-accent/40 bg-accent/10 px-5 py-4 animate-fade-in">
          <p className="font-display text-sm text-text">
            <span className="font-semibold text-accent">✓ Texte terminé</span> — «&nbsp;
            {completedTitle}&nbsp;» reste dans « Mes textes » ci-dessous.
          </p>
          <button
            onClick={generate}
            className="rounded-[10px] bg-accent px-4 py-2 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Un autre texte
          </button>
        </div>
      )}

      {!loading && text && (
        <div className="mt-6 animate-fade-in">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-border px-2.5 py-0.5 font-display text-xs font-semibold text-muted">
              {text.level}
            </span>
            <h4 className="font-display text-xl font-bold">{text.title}</h4>
          </div>
          <ReadingPassage
            text={text}
            onCompleted={() => {
              setCompletedTitle(text.title);
              setText(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
