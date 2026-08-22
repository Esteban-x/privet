"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMyReadingText } from "@/lib/reading/client";

export default function DeleteReadingTextButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      await deleteMyReadingText(id);
      router.push("/reading");
      router.refresh();
    } catch {
      setError("La suppression a échoué. Réessaie.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={remove}
        disabled={deleting}
        className="font-display text-xs font-semibold text-danger transition-colors hover:underline disabled:opacity-60"
      >
        {deleting ? "Suppression…" : "Supprimer ce texte"}
      </button>
      {error && <p className="font-display text-xs text-danger">{error}</p>}
    </div>
  );
}
