"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Un menu déroulant : un bouton, un panneau d'actions.
 *
 * POURQUOI PAS `components/ui/Select.tsx`. Celui-là choisit UNE valeur dans
 * une liste ; ces menus-ci font autre chose — naviguer vers un mode de
 * révision, renommer, supprimer. Un sélecteur détourné en menu d'actions
 * ment sur son rôle, et il faudrait lui apprendre les liens.
 *
 * Il ferme au clic ailleurs et à Échap : sans ça il reste ouvert par-dessus
 * la page, et au clavier on s'y trouve enfermé. `children` reçoit la
 * fonction de fermeture, pour que chaque entrée referme après avoir agi.
 */
export default function Dropdown({
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

/** Le chevron des boutons à menu. Tourné vers le bas, sans animation : il
 *  indique qu'il y a un menu, il ne raconte pas son état. */
export function Chevron() {
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
