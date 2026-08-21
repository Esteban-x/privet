import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { THEMES, VOCAB } from "@/lib/vocabulary/data";

export default function VocabularyHub() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel>Словарь</SectionLabel>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">
        {VOCAB.length} mots, {THEMES.length} thèmes
      </h1>
      <p className="mb-12 max-w-2xl font-display leading-relaxed text-muted">
        Deux façons de travailler : cartes à répétition espacée (pour
        mémoriser durablement) ou frappe au clavier (pour l&apos;orthographe
        cyrillique).
      </p>

      <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/vocabulary/flashcards"
          className="rounded-2xl border border-border bg-bg2 p-7 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
        >
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-accent/15 font-display text-2xl font-bold text-accent">
            ↻
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold">Карточки</h2>
          <p className="mt-1.5 font-display text-sm text-muted">
            Flashcards avec répétition espacée (SM-2)
          </p>
        </Link>
        <Link
          href="/vocabulary/typing"
          className="rounded-2xl border border-border bg-bg2 p-7 transition-all hover:-translate-y-1 hover:border-accent2 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
        >
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-accent2/15 font-display text-2xl font-bold text-accent2">
            Я
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold">Печать</h2>
          <p className="mt-1.5 font-display text-sm text-muted">
            Exercice de frappe en cyrillique
          </p>
        </Link>
      </div>

      <SectionLabel color="accent">Thèmes</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <span
            key={theme}
            className="rounded-full border border-border px-3.5 py-1.5 font-display text-xs font-semibold text-muted"
          >
            {theme} · {VOCAB.filter((v) => v.theme === theme).length}
          </span>
        ))}
      </div>
    </div>
  );
}
