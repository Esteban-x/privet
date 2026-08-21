import { notFound } from "next/navigation";
import Link from "next/link";
import { READING_TEXTS, getReadingText } from "@/lib/reading/texts";
import ReadingPassage from "@/components/exercises/ReadingPassage";

export function generateStaticParams() {
  return READING_TEXTS.map((t) => ({ textId: t.id }));
}

export default async function ReadingTextPage({
  params,
}: {
  params: Promise<{ textId: string }>;
}) {
  const { textId } = await params;
  const text = getReadingText(textId);
  if (!text) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/reading"
        className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Tous les textes
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-full border border-border px-2.5 py-0.5 font-display text-xs font-semibold text-muted">
          {text.level}
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{text.title}</h1>
      </div>

      <ReadingPassage text={text} />
    </div>
  );
}
