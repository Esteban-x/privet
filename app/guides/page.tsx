import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { ArrowRightIcon } from "@/components/ui/icons";
import JsonLd from "@/components/seo/JsonLd";
import { GUIDES } from "@/lib/seo/guides";
import { breadcrumb, graph } from "@/lib/seo/structured-data";

/**
 * L'index des guides.
 *
 * POURQUOI IL EXISTE ALORS QUE LES GUIDES NE SONT PAS DANS LA NAVIGATION.
 * Des pages sans page parente sont des pages orphelines : un moteur les
 * trouve par le plan du site, mais rien ne lui dit qu'elles forment un
 * ensemble ni comment elles se rattachent au reste. Cet index leur donne un
 * parent commun, un fil d'Ariane cohérent, et un endroit d'où elles se
 * pointent les unes les autres.
 *
 * IL NE COMPTE PAS LES GUIDES À LA MAIN. Le texte d'introduction disait
 * « quatre questions » ; il y en a neuf. Une page qui annonce un nombre faux
 * décrédibilise le reste de ce qu'elle affirme, et c'est exactement le genre
 * de détail que personne ne repense en ajoutant un guide. `GUIDES.length`
 * ne peut pas se tromper.
 *
 * Il reste hors barre et hors bandeau : le seul lien interne vers lui est en
 * pied de page d'accueil.
 */

export const metadata: Metadata = {
  title: "Guides pour apprendre le russe : les réponses avant de commencer",
  description:
    "Combien de temps ça prend, si c'est difficile, comment prononcer, quel livre choisir : " +
    "les réponses aux questions qu'un cours de russe ne traite pas.",
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    url: "/guides",
    title: "Guides pour apprendre le russe",
    description: "Les réponses aux questions qu'un cours de russe ne traite pas.",
  },
};

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
      <JsonLd
        data={graph(
          breadcrumb([
            { name: "Privetik", path: "/" },
            { name: "Guides", path: "/guides" },
          ])
        )}
      />

      <SectionLabel>Guides</SectionLabel>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Apprendre le russe : les questions d&apos;avant
      </h1>
      <p className="mt-4 max-w-2xl font-display leading-relaxed text-muted">
        {GUIDES.length} questions qu&apos;on se pose en commençant le russe, et auxquelles un
        cours ne répond pas : combien de temps, à quel prix, avec quel livre, et pourquoi ce
        qu&apos;on entend ne ressemble pas à ce qui est écrit.
      </p>

      <div className="mt-10 space-y-3">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="surface-interactive group flex flex-col rounded-[18px] p-6 transition-transform hover:-translate-y-0.5"
          >
            <span className="font-display text-lg font-bold">{guide.h1}</span>
            <span className="mt-1.5 font-display text-sm leading-relaxed text-muted">
              {guide.lede}
            </span>
            <ArrowRightIcon className="mt-3 h-4 w-4 text-accent" />
          </Link>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <p className="font-display leading-relaxed text-muted">
          Quand vous serez prêt à commencer :{" "}
          <Link href="/cours" className="font-semibold text-accent hover:underline">
            le cours complet
          </Link>{" "}
          ou{" "}
          <Link href="/alphabet" className="font-semibold text-accent hover:underline">
            l&apos;alphabet
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
