"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addWord,
  createList,
  deleteList,
  deleteWord,
  fetchListDetail,
  fetchLists,
  renameList,
  setWordFocus,
  type CustomVocabWord,
  type VocabListSummary,
} from "@/lib/vocabulary/custom";
import { countFocus, focusCountLabel, FOCUS_META, type Focus } from "@/lib/vocabulary/focus";
import AddWordForm from "@/components/vocabulary/AddWordForm";
import ListRail, { ListTile } from "@/components/vocabulary/ListRail";
import FocusBar from "@/components/vocabulary/FocusBar";
import WordCard from "@/components/vocabulary/WordCard";
import { ModeIcon, REVIEW_MODES } from "@/components/vocabulary/ReviewModeGrid";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { ListRowsSkeleton } from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";

/**
   * Le module vocabulaire, en deux panneaux.
   *
   * L'ancienne organisation était une page de listes puis une page par liste :
   * deux navigations complètes pour comparer deux listes, et une page d'accueil
   * qui n'affichait que des noms. Ici les listes tiennent dans une colonne
   * permanente et le panneau de droite montre celle qui est ouverte — on passe
   * de l'une à l'autre sans quitter l'écran.
   *
   * L'URL suit la sélection (`?list=`), donc un lien reste partageable et le
   * retour arrière fonctionne.
   */

/** « Tous », puis les trois rangements que l'apprenant a lui-même posés. */
type Filter = "all" | Focus;

/** Amorces de nom : une liste vide devant soi ne donne pas d'idée. */
const LIST_IDEAS = ["Voyage", "Nourriture", "Verbes courants", "Famille"];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "priority", label: FOCUS_META.priority.label },
  { id: "normal", label: FOCUS_META.normal.label },
  { id: "known", label: FOCUS_META.known.label },
];

export default function VocabularyWorkspace({ initialListId }: { initialListId?: string }) {
  const [lists, setLists] = useState<VocabListSummary[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(initialListId ?? null);
  const [words, setWords] = useState<CustomVocabWord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const activeList = lists?.find((l) => l.id === activeId) ?? null;

  function closeCreate() {
    setShowCreate(false);
    setNewName("");
  }

  useEffect(() => {
    fetchLists()
      .then((d) => {
        setLists(d.lists);
        // Rien de sélectionné : on ouvre la liste qui a le plus à réviser,
        // sinon la première. Arriver sur un panneau vide alors qu'on a des
        // listes n'apprend rien à personne.
        setActiveId((current) => {
          if (current && d.lists.some((l) => l.id === current)) return current;
          if (d.lists.length === 0) return null;
          return [...d.lists].sort((a, b) => b.dueCount - a.dueCount)[0].id;
        });
      })
      .catch(() => setError("Impossible de charger tes listes."));
  }, []);

  // Chargement des mots de la liste ouverte. Le reset se fait pendant le
  // rendu (comparaison au dernier id vu) plutôt que dans l'effet, pour ne
  // pas montrer un instant les mots de la liste précédente.
  const [seenId, setSeenId] = useState<string | null | "init">("init");
  if (activeId !== seenId) {
    setSeenId(activeId);
    setWords(null);
    setQuery("");
    setFilter("all");
    setEditingName(false);
    setConfirmingDelete(false);
    setShowAdd(false);
  }

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    fetchListDetail(activeId)
      .then((d) => {
        if (cancelled) return;
        setNameDraft(d.list.name);
        setWords(d.words);
      })
      .catch(() => !cancelled && setError("Liste introuvable."));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // L'URL suit la sélection sans provoquer de navigation : `replaceState`
  // plutôt que router.replace, qui remonterait jusqu'au serveur pour un
  // changement purement local.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (activeId) url.searchParams.set("list", activeId);
    else url.searchParams.delete("list");
    window.history.replaceState(null, "", url);
  }, [activeId]);

  const totals = useMemo(() => {
    if (!lists) return null;
    return lists.reduce(
      (acc, l) => ({
        words: acc.words + l.wordCount,
        known: acc.known + l.knownCount,
        priority: acc.priority + l.priorityCount,
        due: acc.due + l.dueCount,
      }),
      { words: 0, known: 0, priority: 0, due: 0 },
    );
  }, [lists]);

  const stats = useMemo(() => (words ? countFocus(words) : null), [words]);

  const visible = useMemo(() => {
    if (!words) return null;
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      if (filter !== "all" && w.focus !== filter) return false;
      if (!q) return true;
      return (
        w.ru.toLowerCase().includes(q) ||
        w.fr.toLowerCase().includes(q) ||
        (w.transliteration ?? "").toLowerCase().includes(q)
      );
    });
  }, [words, query, filter]);

  /**
     * Recompte la liste ouverte dans le rail à partir de ses mots.
     *
     * La version précédente incrémentait les compteurs à la main (+1 mot, +1
     * dû). Depuis que l'apprenant range ses mots lui-même, un simple delta ne
     * suffit plus : mettre un mot de côté retire une unité au badge « à
     * réviser » mais pas au nombre de mots, et supprimer un mot déjà mis de
     * côté n'en retire aucune. countFocus est la même fonction que celle du
     * serveur — recompter est ici plus court que d'énumérer les cas.
     */
  function syncCounts(listId: string, nextWords: CustomVocabWord[]) {
    const stat = countFocus(nextWords);
    setLists((prev) =>
      prev
        ? prev.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  wordCount: stat.total,
                  knownCount: stat.known,
                  priorityCount: stat.priority,
                  dueCount: stat.due,
                }
              : l,
          )
        : prev,
    );
  }

  async function submitNewList(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const { list } = await createList(name);
      setLists((prev) => [...(prev ?? []), list]);
      setActiveId(list.id);
      setNewName("");
      setShowCreate(false);
    } catch {
      setError("La création a échoué. Réessaie.");
    } finally {
      setCreating(false);
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    const name = nameDraft.trim();
    if (!activeId || !name || name === activeList?.name) {
      setEditingName(false);
      return;
    }
    setLists((prev) => (prev ? prev.map((l) => (l.id === activeId ? { ...l, name } : l)) : prev));
    setEditingName(false);
    try {
      await renameList(activeId, name);
    } catch {
      setError("Le renommage a échoué.");
    }
  }

  async function handleAdd(input: { ru: string; fr: string; transliteration?: string }) {
    if (!activeId) return null;
    setError(null);
    try {
      const { word } = await addWord(activeId, input);
      // En tête de liste : le mot qu'on vient d'ajouter est celui qu'on veut
      // relire, et en bas de cinquante autres il fallait le chercher.
      const next = [word, ...(words ?? [])];
      setWords(next);
      syncCounts(activeId, next);
      setFilter("all");
      setQuery("");
      return word;
    } catch {
      setError("L'ajout a échoué. Réessaie.");
      return null;
    }
  }

  async function removeWord(wordId: string) {
    const next = (words ?? []).filter((w) => w.id !== wordId);
    setWords(next);
    if (activeId) syncCounts(activeId, next);
    try {
      await deleteWord(wordId);
    } catch {
      setError("La suppression a échoué.");
    }
  }

  /**
     * Range un mot. Appliqué d'abord à l'écran, enregistré ensuite : le geste
     * est un réglage d'affichage autant qu'un réglage de révision, et attendre
     * l'aller-retour réseau ferait clignoter le sélecteur sous le doigt. En
     * cas d'échec on remet la valeur précédente plutôt que de laisser croire
     * à un rangement qui n'a pas été enregistré.
     */
  async function changeFocus(wordId: string, focus: Focus) {
    const previous = words?.find((w) => w.id === wordId)?.focus;
    if (!previous || previous === focus) return;
    const apply = (value: Focus) => {
      const next = (words ?? []).map((w) => (w.id === wordId ? { ...w, focus: value } : w));
      setWords(next);
      if (activeId) syncCounts(activeId, next);
    };
    apply(focus);
    try {
      await setWordFocus(wordId, focus);
    } catch {
      apply(previous);
      setError("Le changement n'a pas été enregistré.");
    }
  }

  async function removeList() {
    if (!activeId) return;
    const id = activeId;
    const previous = lists;
    setLists((prev) => (prev ? prev.filter((l) => l.id !== id) : prev));
    setActiveId(null);
    setConfirmingDelete(false);
    try {
      await deleteList(id);
    } catch {
      setLists(previous);
      setError("La suppression a échoué.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* ── Bandeau : ce que vaut tout le vocabulaire, d'un coup d'œil ── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-1.5 font-display text-xs font-bold uppercase tracking-[0.08em] text-accent2">
            Словарь
          </p>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl tracking-tight">Vocabulaire</h1>
        </div>
        {totals && totals.words > 0 && (
          <div className="flex flex-wrap items-center gap-6">
            <Stat value={totals.words} label={`mot${totals.words > 1 ? "s" : ""}`} />
            <Stat
              value={totals.known}
              label={focusCountLabel("known", totals.known)}
              tone="text-success"
            />
            <Stat value={totals.due} label="à revoir" tone="text-accent-ink" />
            <div className="min-w-[180px] flex-1">
              <FocusBar
                compact
                total={totals.words}
                known={totals.known}
                priority={totals.priority}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 font-display text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ── Colonne des listes ─────────────────────────────────── */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:h-[calc(100vh-var(--nav-h)-4rem)]">
          {lists === null ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-2xl" />
              ))}
            </div>
          ) : (
            <ListRail
              lists={lists}
              activeId={activeId}
              dueTotal={totals?.due ?? 0}
              onSelect={setActiveId}
              onCreate={() => setShowCreate(true)}
            />
          )}
        </aside>

        {/* ── Panneau de la liste ouverte ─────────────────────────── */}
        <section className="min-w-0">
          {lists !== null && lists.length === 0 ? (
            <EmptyState onCreate={() => setShowCreate(true)} />
          ) : !activeList ? (
            <div className="rounded-3xl surface p-16 text-center">
              <p className="font-display text-sm text-muted">
                Choisis une liste à gauche pour en voir les mots.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl surface">
              {/* En-tête de la liste */}
              <div className="border-b border-border px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ListTile name={activeList.name} className="h-11 w-11 text-base" />
                    <div className="min-w-0">
                      {editingName ? (
                        <form onSubmit={saveName} className="flex items-center gap-2">
                          <input
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            autoFocus
                            maxLength={80}
                            onBlur={saveName}
                            className="min-w-0 rounded-lg border border-accent bg-bg px-2 py-1 font-display text-2xl font-extrabold text-text field-focus focus:outline-none"
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => setEditingName(true)}
                          title="Cliquer pour renommer"
                          className="group/name flex items-center gap-2 text-left"
                        >
                          <h2 className="truncate font-display text-2xl font-extrabold tracking-tight">
                            {activeList.name}
                          </h2>
                          <span className="font-display text-sm text-muted opacity-0 transition-opacity group-hover/name:opacity-100">
                            ✎
                          </span>
                        </button>
                      )}
                      <p className="font-display text-sm text-muted">
                        {activeList.wordCount} mot{activeList.wordCount === 1 ? "" : "s"}
                        {stats &&
                          stats.known > 0 &&
                          ` · ${stats.known} ${focusCountLabel("known", stats.known)}`}
                        {stats &&
                          stats.priority > 0 &&
                          ` · ${stats.priority} ${focusCountLabel("priority", stats.priority)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Chercher…"
                      aria-label="Chercher un mot"
                      className="w-40 rounded-xl border border-border bg-bg px-3 py-2 font-display text-sm text-text transition-shadow duration-200 placeholder:text-muted/60 field-focus focus:outline-none"
                    />
                    {confirmingDelete ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={removeList}
                          className="btn h-[38px] rounded-xl bg-danger px-3.5 font-display text-xs font-semibold text-white shadow-soft transition-all hover:brightness-110 active:translate-y-px"
                        >
                          Supprimer la liste
                        </button>
                        <button
                          onClick={() => setConfirmingDelete(false)}
                          className="font-display text-xs text-muted hover:text-text"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(true)}
                        aria-label="Supprimer la liste"
                        title="Supprimer la liste"
                        className="btn btn-danger h-[38px] w-[38px] shrink-0 rounded-xl"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {stats && stats.total > 0 && (
                  <div className="mt-4">
                    <FocusBar total={stats.total} known={stats.known} priority={stats.priority} />
                  </div>
                )}

                {/* LES QUATRE MODES N'ÉTAIENT QU'UNE RANGÉE DE PASTILLES,
                   sans titre ni phrase : rien ne disait qu'il s'agissait de
                   réviser cette liste, ni ce qui distinguait « Frappe » de
                   « QCM ». L'information vivait dans un `title=`, c'est-à-dire
                   nulle part — invisible au tactile et au clavier. Elle est
                   maintenant à l'écran, sous chaque mode. */}
                {activeList.wordCount > 0 && (
                  <div className="mt-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-sm font-bold">Réviser cette liste</h3>
                      <span className="font-display text-xs text-muted">
                        {activeList.wordCount}
                        {" "}
                        {activeList.wordCount > 1 ? "mots" : "mot"} · quatre façons
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {REVIEW_MODES.map((m) => (
                        <Link
                          key={m.mode}
                          href={`/vocabulary/${m.mode}?list=${activeList.id}`}
                          className="surface-interactive group flex items-start gap-3 rounded-xl p-3.5"
                        >
                          <span
                            aria-hidden
                            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg3 text-muted transition-colors duration-200 group-hover:bg-accent/15 group-hover:text-accent-ink"
                            style={{ transitionTimingFunction: "var(--ease)" }}
                          >
                            <ModeIcon name={m.icon} />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display text-sm font-bold">{m.label}</span>
                            <span className="block font-display text-[12.5px] leading-snug text-muted">
                              {m.desc}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ajout + filtres + mots */}
              <div className="space-y-4 px-6 py-5">
                {showAdd ? (
                  <div className="animate-fade-in">
                    <AddWordForm onAdd={handleAdd} />
                    <button
                      onClick={() => setShowAdd(false)}
                      className="mt-2 font-display text-xs font-semibold text-muted hover:text-text"
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  /* AJOUTER UN MOT EST L'ACTION PRINCIPALE DE CE MODULE,
                     et elle était traitée comme une note de bas de page :
                     un rectangle en pointillés gris, du même poids visuel
                     qu'un filtre. Sans mot ajouté, tout le reste du module
                     — révision, prononciation, explications — n'a rien à
                     se mettre sous la dent. Elle se présente donc comme
                     une carte pleine, avec un pictogramme, un titre et ce
                     qu'elle apporte. */
                  <button
                    onClick={() => setShowAdd(true)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-accent/25 bg-accent/[0.07] p-4 text-left transition-all duration-200 hover:border-accent/45 hover:bg-accent/[0.12] hover:shadow-card"
                    style={{ transitionTimingFunction: "var(--ease)" }}
                  >
                    <span
                      aria-hidden
                      className="btn btn-primary btn-sheen flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90"
                      style={{ transitionTimingFunction: "var(--ease)" }}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[15px] font-bold text-text">
                        Ajouter un mot
                      </span>
                      <span className="block font-display text-[13px] leading-snug text-muted">
                        Tape en russe ou en français — la traduction, l&apos;accent tonique et la
                        prononciation suivent.
                      </span>
                    </span>
                  </button>
                )}

                {words !== null && words.length > 0 && (
                  <div className="inline-flex rounded-full border border-border bg-bg p-1">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`rounded-full px-3 py-1 font-display text-xs font-semibold transition-colors ${
                          filter === f.id ? "bg-accent text-white" : "text-muted hover:text-text"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {words === null ? (
                  <ListRowsSkeleton />
                ) : words.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
                    <p className="font-display text-sm text-muted">
                      Liste vide. Tape un mot russe : sa traduction, sa translittération et son
                      accent tonique te sont proposés.
                    </p>
                    {!showAdd && (
                      <button
                        onClick={() => setShowAdd(true)}
                        className="btn btn-primary btn-sheen mt-4 rounded-xl px-4 py-2 font-display text-sm"
                      >
                        Ajouter un premier mot
                      </button>
                    )}
                  </div>
                ) : visible && visible.length === 0 ? (
                  <p className="px-2 py-6 font-display text-sm text-muted">
                    Aucun mot ne correspond.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {visible?.map((w) => (
                      <WordCard
                        key={w.id}
                        word={w}
                        onDelete={removeWord}
                        onFocusChange={changeFocus}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal
        open={showCreate}
        onClose={closeCreate}
        title="Nouvelle liste"
        description="Un thème, un chapitre de manuel, les mots d'un film — ce qui te sert à regrouper."
        icon={
          // La tuile que la liste portera dans la colonne de gauche, avec sa
          // couleur déjà calculée depuis le nom tapé. Le dialogue montre son
          // résultat pendant qu'on le remplit, au lieu de le décrire.
          newName.trim() ? (
            <ListTile name={newName} className="h-14 w-14 text-xl" />
          ) : (
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border text-2xl text-muted/60"
            >
              +
            </span>
          )
        }
      >
        <form onSubmit={submitNewList}>
          <label className="block">
            <span className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-muted">
              Nom de la liste
            </span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Vocabulaire du voyage"
              maxLength={80}
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 font-display text-base text-text placeholder:text-muted/50 field-focus focus:outline-none"
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="font-display text-xs text-muted">Idées :</span>
            {LIST_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setNewName(idea)}
                className="rounded-full border border-border px-2.5 py-1 font-display text-xs text-muted transition-colors hover:bg-accent/10 hover:border-accent/35 hover:text-accent-ink"
              >
                {idea}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-5">
            <button
              type="button"
              onClick={closeCreate}
              className="rounded-xl border border-border px-4 py-2.5 font-display text-sm font-semibold text-muted transition-colors hover:border-muted hover:text-text"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="btn btn-primary btn-sheen rounded-xl px-5 py-2.5 font-display text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? "Création…" : "Créer la liste"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Stat({
  value,
  label,
  tone = "text-text",
}: {
  value: number;
  label: string;
  tone?: string;
}) {
  return (
    <div>
      <p className={`font-display text-2xl font-extrabold leading-none ${tone}`}>{value}</p>
      <p className="mt-1 font-display text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-bg2 p-14 text-center">
      <p className="font-display text-lg font-bold">Commence ton vocabulaire</p>
      <p className="mx-auto mt-2 max-w-md font-display text-sm leading-relaxed text-muted">
        Crée une liste, tape un mot russe : sa traduction, sa translittération et son accent tonique
        te sont proposés. Tu gardes ce qui te convient, tu réécris le reste.
      </p>
      <button
        onClick={onCreate}
        className="btn btn-primary btn-sheen mt-6 rounded-xl px-5 py-2.5 font-display text-sm"
      >
        Créer ma première liste
      </button>
    </div>
  );
}
