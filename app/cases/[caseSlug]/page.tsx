import { notFound } from "next/navigation";
import Link from "next/link";
import { getCase, CASES } from "@/lib/grammar/cases";
import CaseDeclension from "@/components/exercises/CaseDeclension";
import ReferenceTable from "@/components/exercises/ReferenceTable";

export function generateStaticParams() {
  return CASES.map((c) => ({ caseSlug: c.id }));
}

export default async function CasePracticePage({
  params,
}: {
  params: Promise<{ caseSlug: string }>;
}) {
  const { caseSlug } = await params;
  const caseInfo = getCase(caseSlug);
  if (!caseInfo) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/cases"
        className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Tous les cas
      </Link>

      <div className="mb-3 flex items-baseline gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{caseInfo.nameRu}</h1>
        <span className="font-display text-xl text-muted">{caseInfo.nameFr}</span>
      </div>
      <p className="mb-10 max-w-2xl font-display leading-relaxed text-muted">{caseInfo.usage}</p>

      <CaseDeclension caseInfo={caseInfo} />

      <div className="mt-14">
        <ReferenceTable targetCase={caseInfo.id} />
      </div>
    </div>
  );
}
