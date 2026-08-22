import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { READING_TEXTS } from "@/lib/reading/texts";
import ReadingGeneratorSection from "@/components/exercises/ReadingGeneratorSection";

export default function ReadingHub() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel>Чтение</SectionLabel>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">Textes courts</h1>
      <p className="mb-8 max-w-2xl font-display leading-relaxed text-muted">
        Clique sur n&apos;importe quel mot pour voir sa traduction, sans
        quitter le texte.
      </p>

      <ReadingGeneratorSection />

      <SectionLabel color="accent">Textes de la bibliothèque</SectionLabel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {READING_TEXTS.map((t) => (
          <Link
            key={t.id}
            href={`/reading/${t.id}`}
            className="rounded-2xl border border-border bg-bg2 p-7 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
          >
            <span className="inline-block rounded-full border border-border px-2.5 py-0.5 font-display text-xs font-semibold text-muted">
              {t.level}
            </span>
            <h2 className="mt-3.5 font-display text-2xl font-bold">{t.title}</h2>
            <p className="mt-1 font-display text-sm text-muted">{t.sentences.length} phrases</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
