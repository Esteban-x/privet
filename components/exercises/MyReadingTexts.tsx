"use client";

import Link from "next/link";
import type { SavedReadingTextSummary } from "@/lib/reading/client";
import { deleteMyReadingText } from "@/lib/reading/client";
import { CrossIcon } from "@/components/ui/icons";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MyReadingTexts({
  texts,
  onDeleted,
}: {
  texts: SavedReadingTextSummary[];
  onDeleted: (id: string) => void;
}) {
  async function remove(id: string) {
    onDeleted(id); // optimiste, comme la suppression d'une liste de vocabulaire
    try {
      await deleteMyReadingText(id);
    } catch {
      // best-effort : si ça échoue, le texte réapparaîtra au prochain
      // chargement de la page plutôt que de compliquer l'état avec un
      // rollback — cohérent avec le reste des suppressions de l'app.
    }
  }

  if (texts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {texts.map((t) => (
        <div
          key={t.id}
          className="relative rounded-2xl surface-interactive p-7 hover:-translate-y-1 hover:"
        >
          <Link href={`/reading/mine/${t.id}`} className="block pr-6">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full border border-border px-2.5 py-0.5 font-display text-xs font-semibold text-muted">
                {t.level}
              </span>
              <span className="font-display text-xs text-muted">{formatDate(t.createdAt)}</span>
            </div>
            <h2 className="mt-3.5 font-display text-2xl font-bold">{t.title}</h2>
            {t.titleFr && <p className="mt-0.5 font-display text-sm text-muted">{t.titleFr}</p>}
            <p className="mt-1 font-display text-sm text-muted">{t.sentenceCount} phrases</p>
          </Link>
          <button
            onClick={() => remove(t.id)}
            aria-label={`Supprimer le texte ${t.title}`}
            title="Supprimer"
            className="absolute right-4 top-4 rounded-md px-1.5 py-1 font-display text-xs text-muted transition-colors hover:text-danger"
          >
            <CrossIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
