"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Un <select> natif ouvre un popup rendu par l'OS (pas par la page) dans la
// plupart des navigateurs : padding, transition de hover, curseur sur les
// <option> n'y sont PAS stylables en CSS, quel que soit ce qu'on essaie —
// limite de plateforme, pas un bug côté page. Ce composant reconstruit un
// menu déroulant entièrement en DOM normal pour avoir un contrôle complet.
export interface SelectOption {
  value: string;
  label: ReactNode;
}

export default function Select({
  value,
  onChange,
  options,
  title,
  className = "",
  wrapperClassName = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  title?: string;
  className?: string;
  wrapperClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
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
    <div ref={rootRef} className={`relative ${wrapperClassName}`}>
      <button
        type="button"
        title={title}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left ${className}`}
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden
          className={`h-2 w-3 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-fade-in absolute z-20 mt-1.5 max-h-64 min-w-full overflow-auto rounded-[10px] border border-border bg-bg3 p-1.5 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6)]"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`block w-full cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-left font-display text-sm transition-colors duration-150 ${
                  opt.value === value
                    ? "bg-accent/15 text-accent"
                    : "text-text hover:bg-accent/10 hover:text-accent"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
