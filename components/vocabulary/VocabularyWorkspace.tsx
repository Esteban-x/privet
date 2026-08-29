"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { countFocus, FOCUS_META, type Focus } from "@/lib/vocabulary/focus";
import AddWordForm from "@/components/vocabulary/AddWordForm";
import ListRail, { ListTile } from "@/components/vocabulary/ListRail";
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

/** Le rangement affiché quand un filtre est actif — sinon rien ne le dit. */
const FILTER_LABEL: Record<Filter, string> = {
  all: "tous",
  priority: FOCUS_META.priority.short,
  normal: FOCUS_META.normal.short,
  known: FOCUS_META.known.short,
};

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
  /**
   * LA RECHERCHE EST UN PICTOGRAMME TANT QU'ON NE CHERCHE PAS, et prend
   * toute la barre quand on cherche.
   *
   * Un champ résident coûte sa largeur sur chaque écran, à longueur de
   * session, pour un geste qu'on fait une fois de temps en temps — et sur
   * un téléphone cette largeur se prend au nom de la liste, qui devient
   * illisible. Ouverte, elle remplace le titre plutôt que de s'ajouter
   * dessous : c'est ce qui garde la hauteur de l'en-tête constante, donc
   * la liste immobile.
   */
  const [searching, setSearching] = useState(false);
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
    setSearching(false);
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

  const dueCount = activeList?.dueCount ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-4">
      {/* LE TITRE RESTE, MAIS IL NE PREND PLUS DE PLACE.
          Cette page portait « СЛОВАРЬ / Vocabulaire » en 36 px, trois
          compteurs et une barre de progression — 130 px avant même d'arriver
          à la liste, et les mêmes chiffres réapparaissaient 200 px plus bas
          dans l'en-tête de liste, puis une troisième fois dans les puces de
          filtre. Le nom de la liste ouverte fait un meilleur titre : il dit
          où l'on est, ce que « Vocabulaire » ne disait pas.
          Il reste ici pour les lecteurs d'écran, qui ont toujours besoin
          d'un h1 pour annoncer la page. */}
      <h1 className="sr-only">Vocabulaire</h1>

      {error && (
        <p className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 font-display text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* ── Colonne des listes ─────────────────────────────────── */}
        {/* LA COLONNE DES LISTES N'EXISTE PLUS SOUS 1024 px. En grille à une
            colonne, elle s'empilait AU-DESSUS des mots : la carte
            « Réviser », le bouton « Nouvelle liste » et une tuile par liste
            passaient devant ce qu'on était venu lire. C'était la vraie
            raison pour laquelle il fallait défiler sur téléphone. On change
            de liste par le titre, qui est un menu. */}
        <aside className="hidden lg:sticky lg:top-[calc(var(--nav-h)+0.5rem)] lg:block lg:h-[calc(100vh-var(--nav-h)-3rem)]">
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

        {/* ── Les mots ───────────────────────────────────────────── */}
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
            <>
              {/* ── L'EN-TÊTE, RÉDUIT À CE QU'ON REGARDE ────────────────────────
                  Il portait un nom de liste, un compteur, un champ de recherche
                  résident, une rangée de puces de filtre et une ligne d'ajout : cinq
                  objets permanents devant une liste qu'on vient lire. Sur téléphone,
                  où la colonne des listes s'empilait EN PLUS au-dessus, les mots
                  commençaient hors écran.

                  Il ne reste que le titre, le compte, et deux pictogrammes. Le
                  filtre, l'ajout, le renommage et la suppression sont derrière le
                  « ⋯ » : ce sont des gestes qu'on fait une fois par session, pas une
                  fois par mot. Seul « Réviser » reste à découvert — c'est ce pour
                  quoi la liste existe. */}
              {activeList && (
                <div className="sticky top-[calc(var(--nav-h)+0.5rem)] z-30 mb-4 rounded-2xl surface px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-bg2/85">
                  {searching ? (
                    <div className="flex items-center gap-2">
                      <div className="relative min-w-0 flex-1">
                        <SearchGlyph className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setQuery("");
                              setSearching(false);
                            }
                          }}
                          autoFocus
                          type="text"
                          placeholder="Trouver dans la liste"
                          aria-label="Chercher un mot"
                          className="w-full rounded-xl border border-border bg-bg py-2.5 pl-10 pr-3 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setSearching(false);
                        }}
                        aria-label="Fermer la recherche"
                        className="hover-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted"
                      >
                        <CloseGlyph />
                      </button>
                    </div>
                  ) : editingName ? (
                    <form onSubmit={saveName} className="flex min-w-0 items-center gap-2.5">
                      <input
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        autoFocus
                        maxLength={80}
                        onBlur={saveName}
                        aria-label="Nom de la liste"
                        className="min-w-0 flex-1 rounded-lg border border-accent bg-bg px-2.5 py-1.5 font-display text-lg font-extrabold text-text field-focus focus:outline-none"
                      />
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Dropdown
                        align="left"
                        button={
                          <>
                            <span className="min-w-0 text-left">
                              <span className="block truncate font-display text-lg font-extrabold leading-tight">
                                {activeList.name}
                              </span>
                              <span className="block font-display text-[11px] leading-tight text-muted">
                                {activeList.wordCount} mot{activeList.wordCount === 1 ? "" : "s"}
                                {dueCount > 0 && ` · ${dueCount} à réviser`}
                                {filter !== "all" && ` · ${FILTER_LABEL[filter]}`}
                              </span>
                            </span>
                            <Chevron />
                          </>
                        }
                        className="flex-1"
                        buttonClassName="hover-surface flex w-full min-w-0 items-center gap-1.5 rounded-xl px-2 py-1"
                        label="Changer de liste"
                        width="w-[260px]"
                      >
                        {(close) => (
                          <>
                            {(lists ?? []).map((l) => (
                              <button
                                key={l.id}
                                onClick={() => {
                                  setActiveId(l.id);
                                  close();
                                }}
                                className={`menu-item flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left font-display text-sm ${
                                  l.id === activeId ? "font-bold text-accent-ink" : "text-text"
                                }`}
                              >
                                <ListTile name={l.name} className="h-7 w-7 shrink-0 text-[11px]" />
                                <span className="min-w-0 flex-1 truncate">{l.name}</span>
                                <span className="shrink-0 font-display text-xs text-muted">
                                  {l.wordCount}
                                </span>
                              </button>
                            ))}
                            <div className="my-1 h-px bg-border" />
                            <button
                              onClick={() => {
                                setShowCreate(true);
                                close();
                              }}
                              className="menu-item flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left font-display text-sm font-semibold text-text"
                            >
                              <PlusIcon className="h-4 w-4 shrink-0" />
                              Nouvelle liste
                            </button>
                          </>
                        )}
                      </Dropdown>

                      <div className="flex shrink-0 items-center gap-1 pl-2">
                        <button
                          type="button"
                          onClick={() => setSearching(true)}
                          aria-label="Chercher un mot"
                          title="Chercher un mot"
                          className="hover-surface flex h-9 w-9 items-center justify-center rounded-xl text-muted"
                        >
                          <SearchGlyph className="h-4 w-4" />
                        </button>

                        {activeList.wordCount > 0 && (
                          <Dropdown
                            button={
                              <>
                                <PlayGlyph />
                                {/* Le libellé disparaît sous 640 px : sur un
                                    téléphone, il prenait la place du nom de la
                                    liste, que le pictogramme ne remplace pas. */}
                                <span className="hidden sm:inline">Réviser</span>
                                {dueCount > 0 && (
                                  <span className="rounded-full bg-on-tint/20 px-1.5 font-display text-[11px] font-bold">
                                    {dueCount}
                                  </span>
                                )}
                              </>
                            }
                            buttonClassName="btn btn-primary btn-sheen flex h-9 items-center gap-1.5 rounded-xl px-3 font-display text-sm font-bold"
                            label="Choisir un mode de révision"
                            width="w-[290px]"
                          >
                            {(close) => (
                              <>
                                {REVIEW_MODES.map((m) => (
                                  <Link
                                    key={m.mode}
                                    href={`/vocabulary/${m.mode}?list=${activeList.id}`}
                                    onClick={close}
                                    className="menu-item flex items-start gap-3 rounded-[10px] p-2.5"
                                  >
                                    <span
                                      aria-hidden
                                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg3 text-muted"
                                    >
                                      <ModeIcon name={m.icon} />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block font-display text-sm font-bold text-text">
                                        {m.label}
                                      </span>
                                      <span className="block font-display text-[12px] leading-snug text-muted">
                                        {m.desc}
                                      </span>
                                    </span>
                                  </Link>
                                ))}

                                {totals && totals.due > 0 && (
                                  <>
                                    <div className="my-1 h-px bg-border" />
                                    <Link
                                      href="/vocabulary/review"
                                      onClick={close}
                                      className="menu-item flex items-center gap-2 rounded-[10px] px-2.5 py-2 font-display text-sm font-semibold text-text"
                                    >
                                      <span className="flex-1">Réviser toutes les listes</span>
                                      <span className="font-display text-xs text-muted">{totals.due}</span>
                                    </Link>
                                  </>
                                )}
                              </>
                            )}
                          </Dropdown>
                        )}

                        <Dropdown
                          button={<MoreDots />}
                          buttonClassName="hover-surface flex h-9 w-9 items-center justify-center rounded-xl text-muted"
                          label="Autres actions"
                          width="w-[230px]"
                        >
                          {(close) => (
                            <>
                              <button
                                onClick={() => {
                                  setShowAdd(true);
                                  close();
                                }}
                                className="menu-item flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left font-display text-sm font-semibold text-text"
                              >
                                <PlusIcon className="h-4 w-4 shrink-0" />
                                Ajouter un mot
                              </button>

                              {stats && stats.total > 0 && (
                                <>
                                  <div className="my-1 h-px bg-border" />
                                  <p className="px-3 pb-1 pt-1.5 font-display text-[11px] font-bold uppercase tracking-[0.06em] text-muted">
                                    Afficher
                                  </p>
                                  {FILTERS.map((f) => {
                                    const n = f.id === "all" ? stats.total : stats[f.id];
                                    const on = filter === f.id;
                                    return (
                                      <button
                                        key={f.id}
                                        onClick={() => {
                                          setFilter(f.id);
                                          close();
                                        }}
                                        className={`menu-item flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left font-display text-sm ${
                                          on ? "font-bold text-accent-ink" : "text-text"
                                        }`}
                                      >
                                        <span className="flex-1">{f.label}</span>
                                        <span className="font-display text-xs text-muted">{n}</span>
                                      </button>
                                    );
                                  })}
                                </>
                              )}

                              <div className="my-1 h-px bg-border" />
                              <button
                                onClick={() => {
                                  setNameDraft(activeList.name);
                                  setEditingName(true);
                                  close();
                                }}
                                className="menu-item block w-full rounded-[10px] px-3 py-2 text-left font-display text-sm text-text"
                              >
                                Renommer la liste
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmingDelete(true);
                                  close();
                                }}
                                className="menu-item flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left font-display text-sm text-danger"
                              >
                                <TrashIcon className="h-4 w-4 shrink-0" />
                                Supprimer la liste
                              </button>
                            </>
                          )}
                        </Dropdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2.5">
                {/* AJOUTER UN MOT NE VIT PLUS DANS LE FLUX. La ligne
                    pointillée permanente coûtait 48 px sur chaque écran pour
                    un geste qu'on fait une fois par mot ; elle s'ouvre depuis
                    le « ⋯ », et depuis l'écran vide, qui est le seul moment où
                    elle est le sujet. */}
                {showAdd && (
                  <div className="animate-fade-in rounded-2xl surface p-4">
                    <AddWordForm onAdd={handleAdd} />
                    <button
                      onClick={() => setShowAdd(false)}
                      className="mt-2 font-display text-xs font-semibold text-muted hover:text-text"
                    >
                      Fermer
                    </button>
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
            </>
          )}
        </section>
      </div>

      {/* LA SUPPRESSION D'UNE LISTE PASSE PAR UN DIALOGUE, depuis qu'elle est
          entrée dans un menu : une confirmation en ligne dans la barre
          d'outils aurait fait sauter la mise en page, et un geste
          irréversible mérite mieux qu'un second bouton au même endroit que
          le premier. */}
      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Supprimer cette liste ?"
        description={
          activeList
            ? `« ${activeList.name} » et ses ${activeList.wordCount} mot${activeList.wordCount === 1 ? "" : "s"} seront perdus. C'est définitif.`
            : undefined
        }
        icon={
          <span
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-danger/12 text-danger"
          >
            <TrashIcon className="h-6 w-6" />
          </span>
        }
      >
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="rounded-xl border border-border px-4 py-2.5 font-display text-sm font-semibold text-muted transition-colors hover:border-muted hover:text-text"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={removeList}
            className="btn rounded-xl bg-danger px-5 py-2.5 font-display text-sm font-semibold text-on-tint transition-[filter] hover:brightness-110"
          >
            Supprimer
          </button>
        </div>
      </Modal>

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

/**
 * Un menu déroulant, pour la barre d'outils.
 *
 * POURQUOI UN COMPOSANT LOCAL. `components/ui/Select.tsx` choisit UNE valeur
 * dans une liste ; ici les trois menus font autre chose — naviguer vers un
 * mode de révision, renommer, supprimer. Un sélecteur détourné en menu
 * d'actions ment sur son rôle, et il faudrait lui apprendre les liens.
 *
 * Il ferme au clic ailleurs et à Échap : sans ça il reste ouvert par-dessus
 * la page, et au clavier on s'y trouve enfermé. `children` reçoit la
 * fonction de fermeture, pour que chaque entrée referme après avoir agi.
 */
function Dropdown({
  button,
  buttonClassName,
  /**
   * Habillage de l'ENVELOPPE, distinct de celui du bouton.
   *
   * C'est la seule façon pour le menu de prendre la largeur disponible :
   * l'enveloppe est l'enfant direct de la barre d'outils, donc c'est ELLE
   * que le `flex-1` doit porter. Posé sur le bouton, il n'agissait sur
   * rien — l'enveloppe se dimensionnait sur son contenu, et le titre, la
   * loupe et « Réviser » se retrouvaient tassés à gauche d'une barre à
   * moitié vide. Sur téléphone, c'était pire : faute de place à prendre,
   * le nom de la liste ne se tronquait jamais et passait sous la loupe.
   */
  className = "",
  label,
  children,
  align = "right",
  width = "w-[240px]",
}: {
  button: React.ReactNode;
  buttonClassName: string;
  className?: string;
  label: string;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        title={label}
        className={buttonClassName}
      >
        {button}
      </button>
      {open && (
        <div
          role="menu"
          className={`modal-panel animate-pop-in absolute top-full z-50 mt-2 ${width} max-w-[calc(100vw-3rem)] overflow-hidden rounded-[14px] p-1.5 ${
            align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right"
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** La loupe de la barre d'outils, fermée comme ouverte. */
function SearchGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** La croix qui referme la recherche. */
function CloseGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Le triangle de « Réviser » : le seul bouton plein de la barre. */
function PlayGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

/** Le chevron des boutons à menu. Tourné vers le bas, sans animation : il
 *  indique qu'il y a un menu, il ne raconte pas son état. */
function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 opacity-60"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Les trois points des actions secondaires. */
function MoreDots() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
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
