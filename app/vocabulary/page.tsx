"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createList,
  deleteList,
  fetchLists,
  type VocabListSummary,
} from "@/lib/vocabulary/custom";
import SectionLabel from "@/components/ui/SectionLabel";
import { ListCardsSkeleton } from "@/components/ui/Skeleton";

export default function VocabularyPage() {
  const [lists, setLists] = useState<VocabListSummary[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLists()
      .then((d) => setLists(d.lists))
      .catch(() => setError("Impossible de charger tes listes."));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    setError(null);
    try {
      const { list } = await createList(trimmed);
      setLists((prev) => [...(prev ?? []), list]);
      setName("");
    } catch {
      setError("La création a échoué. Réessaie.");
    } finally {
      setCreating(false);
    }
  }

  async function removeList(id: string) {
    const previous = lists;
    setLists((prev) => (prev ? prev.filter((l) => l.id !== id) : prev));
    try {
      await deleteList(id);
    } catch {
      setLists(previous);
      setError("La suppression a échoué. Réessaie.");
    }
  }

  const loading = lists === null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionLabel>Словарь</SectionLabel>
      <h1 className="mb-3 font-display text-4xl font-extrabold tracking-tight">
        Mes listes de vocabulaire
      </h1>
      <p className="mb-8 max-w-2xl font-display leading-relaxed text-muted">
        Chaque liste se révise avec quatre exercices — cartes à répétition
        espacée, frappe au clavier, QCM, ou écoute et prononciation à voix
        haute — et priorise automatiquement les mots que tu maîtrises le
        moins.
      </p>

      <Link
        href="/vocabulary/review"
        className="mb-10 flex items-center justify-between gap-4 rounded-2xl border-2 border-accent/40 bg-accent/5 p-6 transition-all hover:-translate-y-1 hover:border-accent hover:bg-accent/10 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
      >
        <div>
          <p className="font-display text-lg font-bold text-accent">Réviser maintenant →</p>
          <p className="mt-1 font-display text-sm text-muted">
            Tous les mots dus, toutes listes confondues — objectif du jour inclus.
          </p>
        </div>
        <span className="text-3xl">🔥</span>
      </Link>

      <form onSubmit={submit} className="mb-10 flex gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Vocabulaire du voyage"
          maxLength={80}
          className="flex-1 rounded-[10px] border border-border bg-bg2 px-4 py-3 font-display text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="rounded-[10px] bg-accent px-5 py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {creating ? "Création…" : "Nouvelle liste"}
        </button>
      </form>

      {error && <p className="mb-6 font-display text-sm text-danger">{error}</p>}

      {loading ? (
        <ListCardsSkeleton />
      ) : lists && lists.length === 0 ? (
        <div className="rounded-[20px] border border-border bg-bg2 p-8 text-center">
          <p className="font-display text-base font-semibold">Aucune liste pour l&apos;instant</p>
          <p className="mt-2 font-display text-sm text-muted">
            Choisis des thèmes dans ton{" "}
            <Link href="/account" className="text-accent hover:underline">
              profil
            </Link>{" "}
            pour recevoir des mots tout faits, ou crée ta propre liste ci-dessus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lists?.map((l) => (
            <div
              key={l.id}
              className="relative rounded-2xl border border-border bg-bg2 p-5 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
            >
              <Link href={`/vocabulary/lists/${l.id}`} className="block pr-6">
                <h2 className="font-display text-lg font-bold">{l.name}</h2>
                <p className="mt-1 font-display text-sm text-muted">
                  {l.wordCount} mot{l.wordCount === 1 ? "" : "s"}
                </p>
              </Link>
              <button
                onClick={() => removeList(l.id)}
                aria-label={`Supprimer la liste ${l.name}`}
                title="Supprimer la liste"
                className="absolute right-3 top-3 rounded-md px-1.5 py-1 font-display text-xs text-muted transition-colors hover:text-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
