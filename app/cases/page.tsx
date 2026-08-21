import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { CASES } from "@/lib/grammar/cases";

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel>Падежи</SectionLabel>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">
        Choisis un cas à travailler
      </h1>
      <p className="mb-12 max-w-2xl font-display leading-relaxed text-muted">
        Chaque cas se pratique en deux temps : déclinaison isolée d&apos;un
        mot, puis phrase à trou en contexte. Ta précision par cas est suivie
        localement dans ton navigateur.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CASES.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-bg2 p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
              style={{ background: c.color }}
            >
              {c.number}
            </div>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted">
                {c.question}
              </p>
              <h2 className="font-display text-xl font-bold">
                {c.nameRu} <span className="font-normal text-muted">· {c.nameFr}</span>
              </h2>
              <p className="mt-1 font-display text-sm leading-relaxed text-muted">
                {c.usage}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
