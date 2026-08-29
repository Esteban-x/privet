import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { READING_TEXTS } from "@/lib/reading/texts";
import ReadingGeneratorSection from "@/components/exercises/ReadingGeneratorSection";
import ReadingPreview from "@/components/exercises/ReadingPreview";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

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
  title: "Lire du russe : textes courts glosés mot à mot",
  description:
    "Des textes russes courts, chaque mot cliquable pour sa traduction et chaque nom décliné " +
    "coloré selon son cas. Un texte complet à essayer sans compte.",
  // LA PAGE EST PUBLIQUE DEPUIS QU'ELLE MONTRE UN APERÇU (voir proxy.ts) :
  // sans adresse canonique elle hériterait de celle du layout et se
  // déclarerait comme un double de l'accueil. `check:seo` refuse ce cas.
  alternates: { canonical: "/reading" },
  openGraph: {
    type: "website",
    url: "/reading",
    title: "Lire du russe : textes courts glosés mot à mot",
    description:
      "Clique sur n'importe quel mot pour sa traduction, sans quitter le texte. " +
      "Les six cas y sont colorés et vérifiés.",
  },
};

/**
 * DEUX PAGES SOUS UNE SEULE ADRESSE.
 *
 * Un abonné arrive dans son espace : le générateur, ses textes, la
 * bibliothèque. Un visiteur, lui, n'a rien à y voir — c'est un espace
 * personnel et le sien est vide. Il recevait donc une redirection sèche
 * vers /login, qui lui apprenait qu'un compte est nécessaire sans jamais
 * lui dire pour quoi faire.
 *
 * On sert la même adresse aux deux, et c'est la session qui décide : la
 * démonstration remplace la redirection. L'URL reste partageable, indexable
 * et n'a pas de doublon en /reading-presentation à tenir à jour.
 */
export default async function ReadingHub() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return <ReadingPreview />;
  }

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
