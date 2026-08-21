"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Comment dire « je voudrais un café » ?",
  "Explique-moi le génitif simplement",
  "Donne-moi 5 mots sur le thème du voyage",
  "Corrige : Я хочу идти в магазин завтра",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error("no stream");
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
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Le tuteur est indisponible. Vérifie que ta clé Anthropic est configurée dans .env.local.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-3xl flex-col px-6 py-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent2 font-display text-lg font-bold text-white">
          П
        </div>
        <div>
          <h1 className="font-display text-lg font-bold">Приветик · ton tuteur</h1>
          <p className="font-display text-xs text-muted">S&apos;adapte à ton niveau et tes objectifs</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-[20px] border border-border bg-bg2 p-5"
      >
        {messages.length === 0 && (
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
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 font-display text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : "border border-border bg-bg text-text"
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Écris ton message…"
          disabled={streaming}
          className="flex-1 rounded-[10px] border border-border bg-bg2 px-4 py-3 font-display text-base text-text outline-none placeholder:text-muted/60 focus:border-accent disabled:opacity-60"
        />
        <button
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
          className="rounded-[10px] bg-accent px-6 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
