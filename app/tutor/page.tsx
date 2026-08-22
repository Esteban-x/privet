"use client";

import { useEffect, useRef, useState } from "react";
import { canSpeak, segmentByLanguage, speak, speakSegments, type TextSegment } from "@/lib/vocabulary/speech";
import {
  deleteConversation,
  fetchConversations,
  renameConversation,
  type ConversationSummary,
} from "@/lib/ai/conversations";
import ConversationSidebar from "@/components/tutor/ConversationSidebar";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

// Un mot/segment russe cliquable — prononcé seul au clic (aide à la
// prononciation mot par mot, en plus du bouton "Écouter tout" du message).
function RussianSegment({ text, bold }: { text: string; bold: boolean }) {
  const inner = bold ? <strong>{text}</strong> : text;
  if (!canSpeak()) return <>{inner}</>;
  return (
    <button
      type="button"
      onClick={() => speak(text.trim(), "ru-RU")}
      title="Cliquer pour écouter ce mot"
      className="rounded px-0.5 underline decoration-dotted decoration-accent/60 underline-offset-2 transition-colors hover:bg-accent/10 hover:text-accent"
    >
      {inner}
    </button>
  );
}

// Découpe une ligne en tenant compte du markdown gras (**...**) ET de la
// langue de chaque morceau (voir segmentByLanguage) : les passages russes
// deviennent des <RussianSegment> cliquables, le reste du texte normal.
function renderInline(line: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  function pushRun(text: string, bold: boolean) {
    for (const seg of segmentByLanguage(text)) {
      const k = `${keyPrefix}-${key++}`;
      if (seg.lang === "ru") {
        nodes.push(<RussianSegment key={k} text={seg.text} bold={bold} />);
      } else {
        nodes.push(bold ? <strong key={k}>{seg.text}</strong> : <span key={k}>{seg.text}</span>);
      }
    }
  }

  while ((match = boldRegex.exec(line))) {
    if (match.index > lastIndex) pushRun(line.slice(lastIndex, match.index), false);
    pushRun(match[1], true);
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < line.length) pushRun(line.slice(lastIndex), false);

  return nodes;
}

// Une ligne "✏️ faute → correction — explication" (format imposé au
// professeur IA dans lib/ai/prompts.ts pour toute correction) devient un
// encart visuel distinct plutôt qu'une ligne de texte comme les autres.
function renderAssistantContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.trimStart().startsWith("✏️")) {
      return (
        <div
          key={i}
          className="my-1.5 rounded-lg border border-success/40 bg-success/10 px-3 py-2 font-display text-[13px] font-semibold text-success first:mt-0"
        >
          {renderInline(line.trim(), `c${i}`)}
        </div>
      );
    }
    return (
      <span key={i}>
        {renderInline(line, `l${i}`)}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

// Pour le bouton "Écouter tout" : mêmes segments FR/RU que le rendu visuel,
// mais sans distinguer le gras (inutile pour la voix).
function segmentsForSpeech(content: string): TextSegment[] {
  return segmentByLanguage(content.replace(/\*\*/g, ""));
}

const SUGGESTIONS = [
  "Comment dire « je voudrais un café » ?",
  "Explique-moi le génitif simplement",
  "Donne-moi 5 mots sur le thème du voyage",
  "Corrige : Я хочу идти в магазин завтра",
];

export default function TutorPage() {
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Quand send() crée une conversation à la volée (premier message d'un
  // nouveau fil), on connaît déjà les messages localement — inutile (et
  // dangereux, ça couperait le flux en cours) de refetch l'historique tout
  // de suite après. Ce flag saute exactement le fetch qui suivrait.
  const skipNextFetchRef = useRef(false);
  // Annule le flux en cours si le composant démonte (navigation ailleurs)
  // pendant une réponse IA — sans ça, la lecture du flux (et la génération
  // côté serveur, donc son coût) continuait inutilement en arrière-plan.
  const streamAbortRef = useRef<AbortController | null>(null);
  useEffect(() => () => streamAbortRef.current?.abort(), []);

  function refreshConversations() {
    fetchConversations()
      .then((d) => setConversations(d.conversations))
      .catch(() => {});
  }

  useEffect(refreshConversations, []);

  // Changement de conversation active : réinitialise avant de refetch,
  // ajusté pendant le rendu (comparaison au dernier id vu) plutôt que dans
  // l'effet, pour ne pas montrer un instant les messages de l'ancienne.
  const [seenActiveId, setSeenActiveId] = useState<string | null | "init">("init");
  if (activeId !== seenActiveId) {
    setSeenActiveId(activeId);
    setMessages([]);
    setLoadingHistory(activeId !== null);
  }

  useEffect(() => {
    if (!activeId) return;
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    fetch(`/api/ai/chat?conversationId=${activeId}`)
      .then((r) => r.json())
      .then((data: { messages?: Msg[] }) => setMessages(data.messages ?? []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;

    const nextMessages: Msg[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    streamAbortRef.current = controller;
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, conversationId: activeId }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("no stream");
      }

      // Une conversation vient peut-être d'être créée à la volée (premier
      // message d'un nouveau fil) — la route la signale par ce header,
      // connu avant le début du flux.
      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && newConversationId !== activeId) {
        setSeenActiveId(newConversationId); // évite que l'effet de reset vide les messages qu'on est en train de streamer
        skipNextFetchRef.current = true; // évite que l'effet de fetch écrase le flux en cours
        setActiveId(newConversationId);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              "Le professeur IA est indisponible. Vérifie que ta clé Anthropic est configurée dans .env.local.",
          };
          return copy;
        });
      }
    } finally {
      if (streamAbortRef.current === controller) streamAbortRef.current = null;
      setStreaming(false);
      refreshConversations(); // titre/ordre à jour dans la sidebar
    }
  }

  function newConversation() {
    setActiveId(null);
    setSidebarOpen(false);
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  async function handleRename(id: string, title: string) {
    setConversations((prev) => (prev ? prev.map((c) => (c.id === id ? { ...c, title } : c)) : prev));
    try {
      await renameConversation(id, title);
    } catch {
      refreshConversations();
    }
  }

  async function handleDelete(id: string) {
    setConversations((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
    if (id === activeId) setActiveId(null);
    try {
      await deleteConversation(id);
    } catch {
      refreshConversations();
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={selectConversation}
        onNew={newConversation}
        onRename={handleRename}
        onDelete={handleDelete}
        switchDisabled={streaming}
      />

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-6 py-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Conversations"
            className="shrink-0 rounded-lg border border-border p-2 text-muted transition-colors hover:border-accent hover:text-text sm:hidden"
          >
            ☰
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent2 font-display text-lg font-bold text-white">
            П
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-bold">Приветик · ton professeur IA</h1>
            <p className="truncate font-display text-xs text-muted">
              Clique sur un mot russe pour l&apos;écouter, ou « Écouter tout » sous un message
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-[20px] border border-border bg-bg2 p-5"
        >
          {loadingHistory ? (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-end">
                <div className="skeleton h-9 w-2/5 rounded-2xl" />
              </div>
              <div className="flex justify-start">
                <div className="skeleton h-16 w-3/5 rounded-2xl" />
              </div>
              <div className="flex justify-end">
                <div className="skeleton h-9 w-1/3 rounded-2xl" />
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-sm text-muted">
                Pose ta première question, en français ou en russe.
              </p>
              <div className="mt-5 grid w-full max-w-md gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-[10px] border border-border bg-bg px-4 py-2.5 text-left font-display text-sm text-muted transition-colors hover:border-accent hover:text-text"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => {
              const isAssistant = m.role === "assistant";
              const isLast = i === messages.length - 1;
              const isStreamingThis = streaming && isLast;
              return (
                <div
                  key={i}
                  className={`animate-fade-in flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[85%] flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 font-display text-[15px] leading-relaxed ${
                        m.role === "user"
                          ? "bg-accent text-white"
                          : "border border-border bg-bg text-text"
                      }`}
                    >
                      {m.content ? (
                        isAssistant ? (
                          renderAssistantContent(m.content)
                        ) : (
                          m.content
                        )
                      ) : isStreamingThis ? (
                        <span className="flex gap-1 py-1">
                          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-muted [animation-delay:0ms]" />
                          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-muted [animation-delay:160ms]" />
                          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-muted [animation-delay:320ms]" />
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                    {isAssistant && !isStreamingThis && m.content && canSpeak() && (
                      <button
                        onClick={() => speakSegments(segmentsForSpeech(m.content))}
                        className="mt-1 font-display text-xs text-muted hover:text-accent"
                        aria-label="Écouter toute la réponse"
                      >
                        🔊 Écouter tout
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Écris ton message…"
            disabled={streaming || loadingHistory}
            className="flex-1 rounded-[10px] border border-border bg-bg2 px-4 py-3 font-display text-base text-text outline-none placeholder:text-muted/60 focus:border-accent disabled:opacity-60"
          />
          <button
            onClick={() => send(input)}
            disabled={streaming || loadingHistory || !input.trim()}
            className="rounded-[10px] bg-accent px-6 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
