"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  addWord,
  deleteList,
  deleteWord,
  fetchListDetail,
  renameList,
  updateWordGrammar,
  type CustomVocabWord,
} from "@/lib/vocabulary/custom";
import type { Animacy, Gender } from "@/lib/grammar/types";
import { MASTERY_THRESHOLD } from "@/lib/vocabulary/mastery";
import { ListRowsSkeleton } from "@/components/ui/Skeleton";
import Select from "@/components/ui/Select";

const GENDER_LABEL: Record<Gender, string> = {
  masculine: "♂ masc.",
  feminine: "♀ fém.",
  neuter: "⚲ neutre",
};

const REVIEW_MODES = [
  {
    mode: "flashcards",
    icon: "🃏",
    label: "Cartes",
    desc: "Répétition espacée — retourne la carte, évalue-toi.",
  },
  {
    mode: "typing",
    icon: "⌨️",
    label: "Frappe",
    desc: "Tape la traduction au clavier.",
  },
  {
    mode: "qcm",
    icon: "✅",
    label: "QCM",
    desc: "Choix multiple, rapide et efficace.",
  },
  {
    mode: "voice",
    icon: "🎙️",
    label: "Voix",
    desc: "Écoute et prononce à voix haute.",
  },
] as const;

export default function VocabListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const router = useRouter();

  const [listName, setListName] = useState<string | null>(null);
  const [words, setWords] = useState<CustomVocabWord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [ru, setRu] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [fr, setFr] = useState("");
  const [adding, setAdding] = useState(false);

  const [deletingList, setDeletingList] = useState(false);

  const stats = useMemo(() => {
    if (!words || words.length === 0) return null;
    const mastered = words.filter((w) => (w.srs?.repetitions ?? 0) >= MASTERY_THRESHOLD).length;
    const inProgress = words.filter(
      (w) => w.srs && w.srs.repetitions > 0 && w.srs.repetitions < MASTERY_THRESHOLD
    ).length;
    const total = words.length;
    return { mastered, inProgress, total, pct: Math.round((mastered / total) * 100) };
  }, [words]);

  function load() {
    fetchListDetail(listId)
      .then((d) => {
        setListName(d.list.name);
        setNameDraft(d.list.name);
        setWords(d.words);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Liste introuvable."));
  }

  useEffect(load, [listId]);

  async function saveNameEdit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === listName) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await renameList(listId, trimmed);
      setListName(trimmed);
      setEditingName(false);
    } catch {
      setError("Le renommage a échoué.");
    } finally {
      setSavingName(false);
    }
  }

  async function submitWord(e: React.FormEvent) {
    e.preventDefault();
    if (!ru.trim() || !fr.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const { word } = await addWord(listId, {
        ru: ru.trim(),
        fr: fr.trim(),
        transliteration: transliteration.trim() || undefined,
      });
      setWords((prev) => [...(prev ?? []), word]);
      setRu("");
      setTransliteration("");
      setFr("");
    } catch {
      setError("L'ajout a échoué. Réessaie.");
    } finally {
      setAdding(false);
    }
  }

  async function saveGrammar(wordId: string, gender: Gender, animacy: Animacy) {
    setWords((prev) =>
      (prev ?? []).map((w) => (w.id === wordId ? { ...w, gender, animacy } : w))
    );
    try {
      await updateWordGrammar(wordId, { gender, animacy });
    } catch {
      setError("La correction du genre a échoué.");
      load();
    }
  }

  async function removeWord(wordId: string) {
    setWords((prev) => (prev ?? []).filter((w) => w.id !== wordId));
    try {
      await deleteWord(wordId);
    } catch {
      setError("La suppression a échoué.");
      load();
    }
  }

  async function removeList() {
    setDeletingList(true);
    try {
      await deleteList(listId);
      router.push("/vocabulary");
    } catch {
      setError("La suppression a échoué.");
      setDeletingList(false);
    }
  }

  if (error && words === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-lg text-danger">{error}</p>
        <Link href="/vocabulary" className="mt-4 inline-block font-display text-sm text-accent">
          ← Retour aux listes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/vocabulary"
        className="mb-8 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent"
      >
        ← Vocabulaire
      </Link>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        {editingName ? (
          <form onSubmit={saveNameEdit} className="flex gap-2">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              maxLength={80}
              className="rounded-[10px] border border-border bg-bg2 px-3 py-2 font-display text-2xl font-extrabold text-text focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={savingName}
              className="rounded-[10px] bg-accent px-4 py-2 font-display text-sm font-semibold text-white disabled:opacity-60"
            >
              OK
            </button>
          </form>
        ) : (
          <h1
            onClick={() => setEditingName(true)}
            className="cursor-pointer font-display text-4xl font-extrabold tracking-tight hover:text-accent"
            title="Cliquer pour renommer"
          >
            {listName ?? "…"}
          </h1>
        )}

        <button
          onClick={removeList}
          disabled={deletingList}
          className="font-display text-xs font-semibold text-danger underline-offset-4 hover:underline disabled:opacity-60"
        >
          {deletingList ? "Suppression…" : "Supprimer la liste"}
        </button>
      </div>

      {stats && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-muted">
              {stats.mastered} / {stats.total} mot{stats.total === 1 ? "" : "s"} maîtrisé
              {stats.mastered === 1 ? "" : "s"}
            </p>
            <p className="font-display text-sm font-bold text-accent">{stats.pct}%</p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
      )}

      {words !== null && words.length > 0 && (
        <div className="mb-10">
          <p className="mb-3 font-display text-sm font-semibold text-muted">
            Choisis comment réviser
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REVIEW_MODES.map((m) => (
              <Link
                key={m.mode}
                href={`/vocabulary/${m.mode}?list=${listId}`}
                className="group rounded-2xl border-2 border-accent/40 bg-accent/5 p-5 transition-all hover:-translate-y-1 hover:border-accent hover:bg-accent/10 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]"
              >
                <span className="text-2xl">{m.icon}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-accent">{m.label}</h3>
                <p className="mt-1 font-display text-sm leading-snug text-muted">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="mb-3 font-display text-xs font-semibold uppercase tracking-wide text-muted">
        Gérer les mots
      </p>
      <div className="rounded-[20px] border border-border bg-bg2 p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Ajouter un mot</h2>
        <form onSubmit={submitWord} className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <input
            value={ru}
            onChange={(e) => setRu(e.target.value)}
            placeholder="Mot russe (спасибо)"
            className="rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <input
            value={transliteration}
            onChange={(e) => setTransliteration(e.target.value)}
            placeholder="Translittération (facultatif)"
            className="rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <input
            value={fr}
            onChange={(e) => setFr(e.target.value)}
            placeholder="Traduction française"
            className="rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding || !ru.trim() || !fr.trim()}
            className="rounded-[10px] bg-accent px-4 py-2.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-3"
          >
            {adding ? "Ajout…" : "Ajouter le mot"}
          </button>
        </form>
        {error && words !== null && (
          <p className="mt-3 font-display text-sm text-danger">{error}</p>
        )}
      </div>

      <div className="mt-8">
        {words === null ? (
          <ListRowsSkeleton />
        ) : words.length === 0 ? (
          <p className="font-display text-sm text-muted">
            Aucun mot pour l&apos;instant — ajoute-en un ci-dessus.
          </p>
        ) : (
          <div className="space-y-2">
            {words.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-bg2 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-display text-base font-bold">
                    {w.ru}
                    {w.transliteration && (
                      <span className="ml-2 font-normal text-muted">{w.transliteration}</span>
                    )}
                  </p>
                  <p className="font-display text-sm text-muted">{w.fr}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Select
                    value={w.gender ?? ""}
                    onChange={(v) =>
                      saveGrammar(
                        w.id,
                        v as Gender,
                        w.animacy === "animate" ? "animate" : "inanimate"
                      )
                    }
                    title="Genre grammatical du mot russe"
                    className="rounded-lg border border-border bg-bg px-2 py-1 font-display text-xs text-text focus:border-accent focus:outline-none"
                    options={[
                      { value: "", label: "genre ?" },
                      ...(Object.keys(GENDER_LABEL) as Gender[]).map((g) => ({
                        value: g,
                        label: GENDER_LABEL[g],
                      })),
                    ]}
                  />
                  {w.gender && (
                    <Select
                      value={w.animacy === "animate" ? "animate" : "inanimate"}
                      onChange={(v) => saveGrammar(w.id, w.gender as Gender, v as Animacy)}
                      title="Animé (personne/animal) ou inanimé"
                      className="rounded-lg border border-border bg-bg px-2 py-1 font-display text-xs text-text focus:border-accent focus:outline-none"
                      options={[
                        { value: "inanimate", label: "inanimé" },
                        { value: "animate", label: "animé" },
                      ]}
                    />
                  )}
                  <button
                    onClick={() => removeWord(w.id)}
                    className="font-display text-xs font-semibold text-danger hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

