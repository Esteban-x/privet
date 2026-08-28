import type { Section } from "@/lib/courses/types";

/**
 * Le rendu d'une leçon : un composant par type de bloc.
 *
 * Trois contraintes ont dessiné ces styles. Un tableau de déclinaison doit
 * pouvoir défiler HORIZONTALEMENT dans son propre cadre, sinon c'est la page
 * entière qui déborde sur téléphone. Un exemple doit aligner le russe et le
 * français sans que l'œil ait à chercher lequel est lequel. Et le russe doit
 * respirer : plus grand, plus clair, avec la police qui pose correctement
 * les accents toniques.
 */

/**
 * Chaque bloc titré porte une ancre `#bloc-N` : le sommaire latéral y
 * renvoie, et l'URL d'un tableau précis reste partageable.
 */
export function SectionBlock({ section, id }: { section: Section; id: string }) {
  switch (section.kind) {
    case "prose":
      return (
        <section id={id} className="mt-8 scroll-mt-24 first:mt-0">
          {section.title && <BlockTitle>{section.title}</BlockTitle>}
          <div className="space-y-4">
            {section.body.map((paragraph, i) => (
              <p key={i} className="font-display leading-[1.75] text-text/85">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      );

    case "table":
      return (
        <section id={id} className="mt-8 scroll-mt-24 first:mt-0">
          {section.title && <BlockTitle>{section.title}</BlockTitle>}
          {/* Le cadre défile, pas la page. */}
          <div className="overflow-x-auto rounded-2xl surface">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {section.head.map((cell, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="whitespace-nowrap border-b border-border px-4 py-3 font-display text-[11px] font-bold uppercase tracking-[0.06em] text-muted"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr key={i} className="transition-colors hover:bg-bg3/60">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`border-b border-border/60 px-4 py-2.5 font-display text-sm ${
                          j === 0 ? "font-semibold text-text" : "text-text/80"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {section.note && (
            <p className="mt-2.5 font-display text-xs leading-relaxed text-muted">{section.note}</p>
          )}
        </section>
      );

    case "examples":
      return (
        <section id={id} className="mt-8 scroll-mt-24 first:mt-0">
          {section.title && <BlockTitle>{section.title}</BlockTitle>}
          <ul className="space-y-2.5">
            {section.items.map((item, i) => (
              <li
                key={i}
                className="rounded-2xl surface-interactive px-5 py-3.5"
              >
                <p className="font-display text-lg font-semibold leading-snug">{item.ru}</p>
                <p className="mt-0.5 font-display text-sm leading-snug text-text/70">{item.fr}</p>
                {item.note && (
                  <p className="mt-1.5 font-display text-xs leading-relaxed text-muted">
                    {item.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      );

    case "pitfall":
      return (
        <section id={id} className="mt-8 scroll-mt-24 first:mt-0">
          <div className="rounded-2xl border border-accent2-deep/40 bg-accent2-deep/10 px-5 py-4">
            <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-accent2-deep">
              Piège {section.title ? `· ${section.title}` : ""}
            </p>
            <div className="space-y-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="font-display text-sm leading-[1.7] text-text/85">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      );

    case "keypoints":
      return (
        <section id={id} className="mt-8 scroll-mt-24 first:mt-0">
          <div className="rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4">
            <p className="mb-2.5 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
              {section.title ?? "À retenir"}
            </p>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-2.5 font-display text-sm leading-[1.6] text-text/85">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
  }
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-text">{children}</h2>
  );
}

/** L'ancre d'un bloc, calculée pareil ici et dans le sommaire de la page. */
export function sectionAnchor(index: number): string {
  return `bloc-${index}`;
}

export default function LessonBody({ sections }: { sections: Section[] }) {
  return (
    <div>
      {sections.map((section, i) => (
        <SectionBlock key={i} id={sectionAnchor(i)} section={section} />
      ))}
    </div>
  );
}
