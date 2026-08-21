"use client";

import { useState } from "react";
import { ReadingText } from "@/lib/reading/texts";

export default function ReadingPassage({ text }: { text: ReadingText }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  return (
    <div className="rounded-[20px] border border-border bg-bg2 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
      <div className="space-y-4 font-display text-2xl leading-relaxed">
        {text.sentences.map((sentence, sIdx) => (
          <p key={sIdx}>
            {sentence.map((word, wIdx) => {
              const key = `${sIdx}-${wIdx}`;
              if (!word.gloss) return <span key={key}>{word.ru} </span>;
              const active = activeKey === key;
              return (
                <span key={key} className="relative">
                  <button
                    onClick={() => setActiveKey(active ? null : key)}
                    className={`border-b-2 border-dotted border-accent2 pb-0.5 transition-colors hover:bg-accent2/10 ${
                      active ? "bg-accent2/15" : ""
                    }`}
                  >
                    {word.ru}
                  </button>{" "}
                  {active && (
                    <span className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap rounded-lg border border-border bg-bg3 px-2.5 py-1.5 font-display text-sm font-semibold text-text">
                      {word.gloss}
                    </span>
                  )}
                </span>
              );
            })}
          </p>
        ))}
      </div>
    </div>
  );
}
