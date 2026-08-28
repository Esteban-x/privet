import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import CourseExplorer, { type UnitHeader } from "@/components/courses/CourseExplorer";
import { buildSearchIndex, TOTAL_LESSONS, TOTAL_MINUTES, UNITS } from "@/lib/courses/catalog";

export const metadata: Metadata = {
  title: "Cours de russe complet en ligne, gratuit",
  description:
    "130 leçons, de l'alphabet cyrillique aux registres littéraires : grammaire expliquée, " +
    "tableaux et exemples traduits. Accès libre, sans compte.",
  alternates: { canonical: "/cours" },
  openGraph: {
    type: "website",
    url: "/cours",
    title: "Cours de russe complet en ligne, gratuit",
    description:
      "De l'alphabet cyrillique aux registres littéraires : grammaire expliquée, tableaux et " +
      "exemples traduits.",
  },
};

/**
 * Ce qui se consulte plutôt que se lit.
 *
 * Quatre pages publiques qui ne sont pas des leçons : on n'y progresse pas,
 * on y revient. Elles sont listées ici et pas dans le catalogue au-dessus
 * parce qu'elles n'ont pas de place dans une progression — l'alphabet se
 * lit une fois, les tables de conjugaison se rouvrent pendant deux ans.
 */
const REFERENCE_TABLES = [
  { href: "/alphabet", label: "L'alphabet", detail: "Les 33 lettres et leur prononciation" },
  { href: "/cases", label: "Les six cas", detail: "Emplois, déclencheurs et terminaisons" },
  { href: "/conjugation", label: "La conjugaison", detail: "Présent, passé, futur et les deux groupes" },
  { href: "/numbers", label: "Les nombres", detail: "Compter, et accorder le nom qui suit" },
];

/**
 * Le catalogue des cours.
 *
 * Page serveur : elle assemble le programme et n'envoie au navigateur qu'un
 * index de recherche allégé (voir buildSearchIndex). Le texte des leçons,
 * lui, ne traverse le réseau que quand on ouvre la leçon.
 */
export default function CoursesPage() {
  const index = buildSearchIndex();
  const units: UnitHeader[] = UNITS.map((unit) => ({
    slug: unit.slug,
    title: unit.title,
    titleRu: unit.titleRu,
    subtitle: unit.subtitle,
    color: unit.color,
    lessonCount: unit.lessons.length,
    minutes: unit.lessons.reduce((sum, l) => sum + l.minutes, 0),
  }));

  const hours = Math.round(TOTAL_MINUTES / 60);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
      <div className="mb-8">
        <SectionLabel>Курс</SectionLabel>
        <h1 className="mb-3 font-display text-3xl font-extrabold sm:text-4xl tracking-tight">
          Cours de russe
        </h1>
        <p className="max-w-2xl font-display leading-relaxed text-muted">
          Le programme complet, dans l&apos;ordre où il s&apos;apprend : l&apos;alphabet, les six
          cas, l&apos;aspect, les verbes de mouvement, la syntaxe, jusqu&apos;aux registres et aux
          particules qui font la langue vivante. Chaque leçon explique la règle, la met en
          tableau, la montre en exemples traduits, et nomme le piège que fait un francophone.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3">
        <Stat value={String(TOTAL_LESSONS)} label={`leçon${TOTAL_LESSONS > 1 ? "s" : ""}`} />
        <Stat value={String(UNITS.length)} label={`unité${UNITS.length > 1 ? "s" : ""}`} />
        <Stat value={`${hours} h`} label="de lecture" />
        <Stat value="A0 → C2" label="du premier mot au littéraire" />
      </div>

      <CourseExplorer units={units} index={index} />

      {/*
        LES TABLES DE RÉFÉRENCE, ET POURQUOI ELLES SONT ICI.
        /conjugation et /numbers étaient déclarées au plan du site, ouvertes
        sans compte, et pointées par STRICTEMENT AUCUNE page — ni la barre de
        navigation, ni l'accueil, ni une leçon. Un moteur les voyait donc
        annoncées et jamais recommandées, ce qui est la position la plus
        faible qu'une page puisse occuper : le site lui-même ne se portait pas
        garant d'elles. Elles avaient été oubliées, tout simplement.
        Elles sont à leur place au bas du programme : quelqu'un qui vient de
        parcourir 130 leçons cherche exactement ça — la table à rouvrir quand
        la règle est sue mais la forme oubliée.
      */}
      <div className="mt-14">
        <SectionLabel>Tables de référence</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REFERENCE_TABLES.map((table) => (
            <Link
              key={table.href}
              href={table.href}
              className="surface-interactive group flex flex-col rounded-[16px] p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="font-display font-bold">{table.label}</span>
              <span className="mt-1 font-display text-sm leading-snug text-muted">
                {table.detail}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/*
        LE SEUL LIEN VERS LES GUIDES DEPUIS UNE PAGE DE PREMIER PLAN.
        Ils étaient atteignables par le pied de page d'accueil et par rien
        d'autre : découvrables, mais rattachés au site par un fil unique. Ce
        lien-ci part de la page que les moteurs explorent le plus souvent
        après l'accueil, et il est à sa place pour un lecteur — quelqu'un qui
        parcourt un programme de 130 leçons sans savoir par où entrer est
        exactement le destinataire de ces pages.
      */}
      <div className="mt-14 border-t border-border pt-8">
        <p className="font-display leading-relaxed text-muted">
          Vous hésitez encore sur la marche à suivre ?{" "}
          <Link href="/guides" className="font-semibold text-accent hover:underline">
            Les guides
          </Link>{" "}
          répondent aux questions d&apos;avant la première leçon : combien de temps ça prend, par
          où commencer, ce qui est gratuit, et pourquoi le russe parlé ne ressemble pas au russe
          écrit.
        </p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="font-display text-xs text-muted">{label}</p>
    </div>
  );
}
