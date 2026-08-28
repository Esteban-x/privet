import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SectionLabel from "@/components/ui/SectionLabel";
import { ArrowRightIcon } from "@/components/ui/icons";
import JsonLd from "@/components/seo/JsonLd";
import { findGuide, GUIDES } from "@/lib/seo/guides";
import { absolute } from "@/lib/seo/site";
import { breadcrumb, graph, organization } from "@/lib/seo/structured-data";

/**
 * Un guide.
 *
 * QUATRE PAGES, UN SEUL GABARIT. Elles répondent à quatre questions
 * différentes mais ont exactement la même forme : une réponse courte en
 * haut, des sections, des portes vers l'app en bas. Un composant par page
 * aurait donné quatre occasions de diverger sur la mise en page, pour
 * aucun bénéfice — c'est le texte qui les distingue, pas le gabarit.
 *
 * LA RÉPONSE EST ENCADRÉE, EN HAUT. C'est ce que Google extrait pour un
 * extrait optimisé, et c'est aussi ce que cherche quelqu'un qui vient de
 * taper une question : il veut une réponse, pas une introduction. Le reste
 * de la page est là pour ceux que la réponse courte ne satisfait pas.
 */

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return { title: "Guide introuvable", robots: { index: false, follow: true } };

  return {
    // Le gabarit du layout ajoute « — Privetik ».
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      url: `/guides/${guide.slug}`,
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();

  const related = guide.related
    .map((s) => findGuide(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <div className="relative overflow-x-clip">
      <JsonLd
        data={graph(
          organization(),
          {
            "@type": "Article",
            "@id": absolute(`/guides/${guide.slug}#article`),
            headline: guide.h1,
            description: guide.description,
            inLanguage: "fr-FR",
            author: { "@id": `${absolute("/")}#organization` },
            publisher: { "@id": `${absolute("/")}#organization` },
            mainEntityOfPage: absolute(`/guides/${guide.slug}`),
          },
          // La question et sa réponse courte, déclarées telles qu'elles
          // s'affichent : c'est ce qui peut décrocher l'encadré de réponse.
          {
            "@type": "FAQPage",
            "@id": absolute(`/guides/${guide.slug}#faq`),
            mainEntity: [
              {
                "@type": "Question",
                name: guide.h1,
                acceptedAnswer: { "@type": "Answer", text: guide.answer },
              },
            ],
          },
          breadcrumb([
            { name: "Privetik", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.h1, path: `/guides/${guide.slug}` },
          ])
        )}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="glow -top-28 left-[10%] h-[380px] w-[380px]"
          style={{ background: "color-mix(in oklab, var(--flag-blue) 15%, transparent)" }}
        />
      </div>

      <article className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
        <Link
          href="/guides"
          className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
        >
          ← Guides
        </Link>

        <h1 className="font-display text-[clamp(1.9rem,5vw,2.75rem)] font-extrabold leading-[1.1] tracking-tight">
          {guide.h1}
        </h1>

        <p className="mt-4 font-display text-lg leading-relaxed text-muted">{guide.lede}</p>

        {/* La réponse courte, avant tout le reste. */}
        <div className="surface mt-8 rounded-[20px] border-l-[3px] border-l-accent p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-accent">
            En bref
          </p>
          <p className="mt-2.5 font-display text-[17px] leading-relaxed">{guide.answer}</p>
        </div>

        <div className="mt-12 space-y-11">
          {guide.sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 font-display text-2xl font-extrabold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="font-display leading-relaxed text-text/90">
                    {p}
                  </p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 space-y-3.5">
                  {section.bullets.map((b) => (
                    <li key={b.lead} className="border-l-2 border-border pl-4">
                      <p className="font-display font-bold">{b.lead}</p>
                      <p className="mt-1 font-display leading-relaxed text-muted">{b.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Les portes vers l'app. C'est la raison d'être de la page : elle
            attire une recherche, elle doit mener quelque part. */}
        <div className="mt-14">
          <SectionLabel>Continuer</SectionLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {guide.next.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="surface-interactive group flex flex-col rounded-[16px] p-5 transition-transform hover:-translate-y-0.5"
              >
                <span className="font-display font-bold">{item.label}</span>
                <span className="mt-1 font-display text-sm leading-snug text-muted">
                  {item.detail}
                </span>
                <ArrowRightIcon className="mt-3 h-4 w-4 text-accent" />
              </Link>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-muted">
              À lire aussi
            </p>
            <ul className="mt-3 space-y-2">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="font-display font-semibold text-accent hover:underline"
                  >
                    {g.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
