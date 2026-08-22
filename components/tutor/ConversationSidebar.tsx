"use client";

import { useState } from "react";
import type { ConversationSummary } from "@/lib/ai/conversations";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface Props {
  conversations: ConversationSummary[] | null;
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  // Changer de fil pendant qu'une réponse est en cours de streaming
  // mélangerait les messages entre conversations (le flux n'est pas
  // rattaché à un fil précis côté état) — on bloque juste le changement
  // de fil actif le temps de la réponse plutôt que de complexifier l'état.
  switchDisabled?: boolean;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  open,
  onClose,
  onSelect,
  onNew,
  onRename,
  onDelete,
  switchDisabled,
}: Props) {
  return (
    <>
      {/* Fond semi-transparent en mobile quand la sidebar est ouverte en tiroir */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 transform border-r border-border bg-bg2 transition-transform duration-200 sm:static sm:z-auto sm:h-[calc(100vh-64px)] sm:w-64 sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-3">
          <button
            onClick={onNew}
            disabled={switchDisabled}
            className="mb-3 flex items-center justify-center gap-2 rounded-[10px] border border-accent/40 bg-accent/5 px-4 py-2.5 font-display text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Nouvelle conversation
          </button>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {conversations === null ? (
              <div className="animate-fade-in space-y-1.5 px-1 py-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-lg px-2 py-2.5">
                    <div className="skeleton h-3.5 rounded-full" style={{ width: `${80 - i * 8}%` }} />
                    <div className="skeleton mt-1.5 h-2.5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="px-2 py-3 font-display text-xs text-muted">
                Aucune conversation pour l&apos;instant.
              </p>
            ) : (
              conversations.map((c) => (
                <ConversationRow
                  key={c.id}
                  conversation={c}
                  active={c.id === activeId}
                  disabled={switchDisabled}
                  onSelect={() => !switchDisabled && onSelect(c.id)}
                  onRename={(title) => onRename(c.id, title)}
                  onDelete={() => onDelete(c.id)}
                />
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function ConversationRow({
  conversation,
  active,
  disabled,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: ConversationSummary;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);

  // Le titre peut changer sans que ce composant soit remonté (même `key`) :
  // auto-retitrage après le premier message d'une conversation, resync
  // entre onglets... Comparaison pendant le rendu (pas un effet, pas de
  // setState synchrone dans un effet) ; ignoré pendant une édition en
  // cours pour ne pas écraser la saisie — rattrapé dès qu'elle se termine
  // (setEditing(false) redéclenche ce rendu).
  const [seenTitle, setSeenTitle] = useState(conversation.title);
  if (!editing && conversation.title !== seenTitle) {
    setSeenTitle(conversation.title);
    setDraft(conversation.title);
  }

  function commitRename() {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed && trimmed !== conversation.title) onRename(trimmed);
    else setDraft(conversation.title);
  }

  if (editing) {
    return (
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitRename();
          if (e.key === "Escape") {
            setDraft(conversation.title);
            setEditing(false);
          }
        }}
        autoFocus
        maxLength={80}
        className="w-full rounded-lg border border-accent bg-bg px-3 py-2 font-display text-sm text-text outline-none"
      />
    );
  }

  return (
    <div
      className={`group flex items-center gap-1 rounded-lg px-1 transition-colors ${
        active ? "bg-accent/10" : "hover:bg-bg3"
      }`}
    >
      <button
        onClick={onSelect}
        onDoubleClick={() => !disabled && setEditing(true)}
        title="Double-clique pour renommer"
        className={`min-w-0 flex-1 px-2 py-2.5 text-left font-display text-sm ${
          active ? "font-semibold text-accent" : "text-text"
        }`}
      >
        <p className="truncate">{conversation.title}</p>
        <p className="truncate font-display text-[11px] font-normal text-muted">
          {formatDate(conversation.updatedAt)}
        </p>
      </button>
      <button
        onClick={onDelete}
        disabled={disabled}
        aria-label="Supprimer la conversation"
        title="Supprimer"
        className="shrink-0 rounded-md px-1.5 py-1 font-display text-xs text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
      >
        ✕
      </button>
    </div>
  );
}
