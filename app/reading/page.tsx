import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { READING_TEXTS } from "@/lib/reading/texts";
import ReadingGeneratorSection from "@/components/exercises/ReadingGeneratorSection";

/**
 * Le titre de l'onglet.
 *
 * SANS LUI, LA PAGE PORTE CELUI DE L'ACCUEIL. Le layout racine définit un
 * `title.default`, et Next le donne à toute page qui n'en déclare pas —
 * cette page affichait donc « Apprendre le russe : cours, déclinaisons et
 * exercices », comme l'accueil, comme un onglet sur deux. Quelqu'un qui
 * travaille avec quatre onglets ouverts ne peut plus les distinguer, et un
 * favori enregistré ici ne dit pas ce qu'il ouvre.
 *
 * Sans « — Privetik » : le gabarit du layout l'ajoute.
 */
export const metadata: Metadata = {
  title: "Lecture",
};

export default function ReadingHub() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-16">
      <SectionLabel>Чтение</SectionLabel>
      <h1 className="mb-3 font-display text-3xl font-extrabold sm:text-4xl tracking-tight">Textes courts</h1>
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
            className="rounded-2xl surface-interactive p-7 hover:-translate-y-1 hover:"
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
