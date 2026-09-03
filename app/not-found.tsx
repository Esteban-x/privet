import Link from "next/link";
import type { Metadata } from "next";
import SectionLabel from "@/components/ui/SectionLabel";
import { BookIcon, TargetIcon, ArrowRightIcon } from "@/components/ui/icons";

/**
 * La page d'une adresse qui n'existe pas.
 *
 * ELLE ENSEIGNE, PLUTÔT QUE DE S'EXCUSER. Une 404 est une seconde d'attention
 * gagnée sur quelqu'un qui n'attendait rien : la dépenser en « oups, page
 * introuvable » la gaspille. « Здесь ничего нет » veut dire exactement ce
 * qu'il se passe — et « ничего » y est au génitif, parce qu'en russe la
 * NÉGATION D'EXISTENCE régit le génitif. C'est le contenu du module Génitif,
 * pas un ornement : la page illustre sa propre matière, et le lien vers le
 * module tombe au moment où la question vient de se poser.
 *
 * Pas de gros « 404 ». Le code de statut est une information de protocole ;
 * il est rendu discrètement, en haut, pour qui le cherche.
 *
 * Next rend ce fichier pour un `notFound()` explicite comme pour une URL
 * inconnue. Il vit sous le layout racine, donc barre et bandeau restent en
 * place : on n'est jamais éjecté de l'application.
 */

export const metadata: Metadata = {
  // Sans « — Privetik » : le gabarit du layout l'ajoute, et l'écrire ici
  // donnait « Page introuvable — Privetik — Privetik ».
  title: "Page introuvable",
  // Une 404 ne doit jamais entrer dans l'index : elle y ferait doublon avec
  // toutes les autres, et diluerait les pages qui, elles, ont un contenu.
  robots: { index: false, follow: true },
};

const EXITS = [
  {
    href: "/cours",
    label: "Le cours",
    detail: "127 leçons, de l'alphabet au discours rapporté",
    Icon: BookIcon,
  },
  {
    href: "/exercices",
    label: "Les exercices",
    detail: "Huit modules, corrigés à la règle",
    Icon: TargetIcon,
  },
];

export default function NotFound() {
  return (
    <div className="relative overflow-x-clip">
      {/* Même lumière d'ambiance que l'accueil : la page reste dans le monde
          de l'app plutôt que de ressembler à un écran d'erreur de serveur. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="glow -top-24 left-[10%] h-[380px] w-[380px]"
          style={{ background: "color-mix(in oklab, var(--flag-blue) 18%, transparent)" }}
        />
        <div
          className="glow -top-10 right-[8%] h-[300px] w-[300px]"
          style={{ background: "color-mix(in oklab, var(--flag-red) 12%, transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-24">
        <SectionLabel>Erreur 404</SectionLabel>

        {/* LA PHRASE D'ABORD, la traduction ensuite. C'est l'ordre d'une
            carte de révision, et c'est celui qui laisse une seconde pour
            essayer de comprendre avant de recevoir la réponse. */}
        <p
          lang="ru"
          className="font-display text-[clamp(2.25rem,8vw,4rem)] font-extrabold leading-[1.05] tracking-tight"
        >
          Здесь ничего нет
        </p>
        <p className="mt-3 font-display text-lg text-muted">
          <span className="italic">zdiéss nitchevo niet</span>
          <span className="mx-2.5 text-border">·</span>
          Il n&apos;y a rien ici
        </p>

        {/* La leçon. Trois lignes, une seule idée, et le lien vers le module
            qui la travaille — la curiosité est déjà ouverte, autant ne pas
            la refermer. */}
        <div className="surface mt-8 rounded-[20px] p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-accent2">
            Au passage
          </p>
          <p className="mt-2.5 font-display leading-relaxed">
            En russe, dire qu&apos;une chose n&apos;existe pas met cette chose au{" "}
            <strong className="font-bold">génitif</strong> : <span lang="ru">нет</span> réclame{" "}
            <span lang="ru">ничего</span>, et jamais <span lang="ru">ничто</span>. C&apos;est la
            même règle pour <span lang="ru">у меня нет времени</span> — « je n&apos;ai pas le
            temps », littéralement « chez moi il n&apos;y a pas de temps ».
          </p>
          <Link
            href="/cases/genitive"
            className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-accent-ink hover:underline"
          >
            Travailler le génitif
            <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>

        {/* Les sorties. Deux destinations réelles plutôt qu'un « retour à
            l'accueil » seul : quelqu'un qui atterrit ici cherchait quelque
            chose, et l'accueil ne le lui donnera pas. */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EXITS.map(({ href, label, detail, Icon }) => (
            <Link
              key={href}
              href={href}
              className="surface-interactive group flex items-start gap-3.5 rounded-[16px] p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent-ink">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display font-bold">{label}</span>
                <span className="mt-0.5 block font-display text-sm leading-snug text-muted">
                  {detail}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-6 inline-block font-display text-sm font-semibold text-muted transition-colors hover:text-accent-ink"
        >
          ← Revenir à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
