import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { CASES } from "@/lib/grammar/cases";
import { getNoun, NOUNS } from "@/lib/grammar/nouns-data";
import { declineNoun } from "@/lib/grammar/decline";

export default function Home() {
  const demoNoun = getNoun("kniga") ?? NOUNS[0];
  const demoDecl = declineNoun(demoNoun, "genitive");

  return (
    <div>
      {/* HERO */}
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-[1.05fr_1fr] md:py-28">
        <div>
          <div className="mb-6 inline-block rounded-full border border-border px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.08em] text-accent">
            Méthode russe moderne
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Parlez russe avec confiance, un cas à la fois.
          </h1>
          <p className="mt-5 max-w-md font-display text-lg leading-relaxed text-muted">
            Déclinaisons calculées avec précision, vocabulaire à répétition
            espacée, lecture guidée — un parcours qui s&apos;adapte à votre
            rythme.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/cases"
              className="rounded-[10px] bg-accent px-7 py-3.5 font-display text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Commencer les cas
            </Link>
            <Link
              href="/vocabulary"
              className="rounded-[10px] border border-border px-7 py-3.5 font-display text-[15px] font-semibold text-text transition-colors hover:border-accent hover:bg-accent/10"
            >
              Réviser le vocabulaire
            </Link>
          </div>
        </div>

        {/* Carte "leçon" + motif décoratif */}
        <div className="relative mx-auto flex min-h-[480px] w-full max-w-[460px] items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute -top-8 right-5 h-[200px] w-[200px] rounded-full border-[3px] border-accent2 opacity-45" />
            <div className="absolute top-[70px] -left-12 h-[34px] w-[260px] rotate-[-8deg] rounded-md bg-accent opacity-85" />
            <div className="absolute bottom-2.5 left-5 h-7 w-7 rotate-12 bg-accent2" />
            <div className="animate-float absolute -top-2.5 -left-2.5 select-none font-display text-[88px] font-extrabold text-accent2 opacity-[0.14]">
              Ж
            </div>
            <div className="animate-float absolute -bottom-5 -right-5 select-none font-display text-7xl font-extrabold text-accent opacity-[0.14] [animation-delay:1s]">
              Я
            </div>
            <div className="animate-float-slow absolute top-[45%] -right-11 select-none font-display text-[46px] font-extrabold text-accent2 opacity-[0.14] [animation-delay:.5s]">
              Ю
            </div>
          </div>

          <div className="relative z-10 w-[360px] rounded-[20px] border border-border bg-bg2 p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent2" />
              <div className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-muted">
                Родительный · Génitif
              </div>
            </div>
            <div className="mt-4 font-display text-[27px] font-bold leading-tight">
              У меня нет {demoDecl.form}.
            </div>
            <div className="mt-1 font-display text-[15px] text-muted">
              Je n&apos;ai pas de livre.
            </div>
            <div className="my-5.5 h-px bg-border" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 font-display text-sm text-muted">
                <span>книга (nominatif)</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-accent bg-accent/15 px-4 py-3 font-display text-sm">
                <span>{demoDecl.form} (génitif)</span>
                <span className="font-bold text-accent">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODULES */}
      <div id="modules" className="mx-auto max-w-6xl px-6 py-24">
        <SectionLabel>Méthode</SectionLabel>
        <h2 className="mb-14 max-w-xl font-display text-[38px] font-extrabold tracking-tight">
          Trois modules, un seul moteur fiable
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ModuleCard
            href="/cases"
            glyph="Я"
            title="Падежи"
            subtitle="Les 6 cas"
            description="Déclinaison isolée ou phrase à trou, avec la règle expliquée à chaque réponse — calculée, jamais improvisée."
          />
          <ModuleCard
            href="/vocabulary"
            glyph="↻"
            title="Словарь"
            subtitle="Vocabulaire"
            description="Flashcards à répétition espacée (SM-2) et exercice de frappe cyrillique, par thème."
          />
          <ModuleCard
            href="/reading"
            glyph="Ч"
            title="Чтение"
            subtitle="Lecture"
            description="Textes courts avec traduction mot-à-mot au clic, sans quitter la page."
          />
        </div>
      </div>

      {/* POURQUOI CES 6 CAS */}
      <div className="border-y border-border bg-bg2 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 md:grid-cols-2 md:items-center">
          <div>
            <SectionLabel color="accent">Pourquoi les cas d&apos;abord</SectionLabel>
            <h2 className="mb-4 font-display text-[38px] font-extrabold tracking-tight">
              La mécanique avant le par cœur
            </h2>
            <p className="max-w-md font-display leading-relaxed text-muted">
              Le russe encode le rôle grammatical d&apos;un mot dans sa
              terminaison plutôt que dans l&apos;ordre des mots. Chaque
              déclinaison ici sort d&apos;un moteur de règles testé, jamais
              d&apos;une génération IA qui pourrait halluciner une forme
              fautive.
            </p>
          </div>
          <div className="rounded-[20px] border border-border bg-bg p-8">
            <div className="flex flex-wrap gap-2.5">
              {CASES.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-full border border-border px-4 py-2"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: c.color }}
                  />
                  <span className="font-display text-sm font-semibold">
                    {c.nameRu}
                  </span>
                  <span className="font-display text-xs text-muted">
                    {c.question}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-24 text-center">
        <h2 className="mb-3.5 font-display text-4xl font-extrabold tracking-tight">
          Prêt à parler russe ?
        </h2>
        <p className="mb-8 font-display text-muted">
          Ta progression est enregistrée localement, sans compte à créer.
        </p>
        <Link
          href="/cases"
          className="inline-block rounded-[10px] bg-accent px-8 py-4 font-display text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          Commencer maintenant
        </Link>
      </div>

      {/* FOOTER */}
      <div className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent font-display text-xs font-extrabold text-white">
              П
            </span>
            <span className="font-display text-sm text-muted">
              Privet — apprendre le russe, à votre rythme.
            </span>
          </div>
          <div className="font-display text-sm text-muted">© {new Date().getFullYear()} Privet</div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  href,
  glyph,
  title,
  subtitle,
  description,
}: {
  href: string;
  glyph: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border bg-bg2 p-7 transition-all hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
    >
      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-accent/15 font-display text-2xl font-bold text-accent">
        {glyph}
      </div>
      <p className="mt-4.5 font-display text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {subtitle}
      </p>
      <h3 className="mt-1 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 font-display text-[15px] leading-relaxed text-muted">
        {description}
      </p>
      <span className="mt-4 inline-block font-display text-xs font-bold uppercase tracking-wide text-accent">
        Ouvrir →
      </span>
    </Link>
  );
}
