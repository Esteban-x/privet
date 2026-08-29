"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

  /**
   * Décalage horizontal pour que le panneau tienne dans la fenêtre.
   *
   * POURQUOI UNE MESURE, ET PAS UNE LARGEUR MAXIMALE. Le panneau est ancré
   * sur son bouton ; ce qui décide s'il déborde, c'est la POSITION de ce
   * bouton, que le CSS ne connaît pas. Un menu de 290 px ancré à droite d'un
   * bouton situé à 320 px du bord gauche part à −12 px : c'est ce qui
   * arrivait au menu « Réviser » sur téléphone, dont les quatre modes se
   * lisaient « rtes / appe / CM / ix ». Un `max-width` en `vw` ne pouvait
   * pas le rattraper, puisqu'il ignore où commence le bouton.
   */
  const [shift, setShift] = useState(0);

  /**
   * La mesure se fait dans une RÉFÉRENCE-FONCTION, pas dans un effet.
   *
   * C'est le moment prévu pour lire la géométrie : elle est appelée pendant
   * la validation du rendu, avant que le navigateur ne peigne, donc le
   * panneau n'apparaît jamais à la mauvaise place. Un `useEffect` qui pose
   * un état déclenche en plus un second rendu en cascade, ce que le linter
   * refuse à juste titre.
   */
  const measure = useCallback((el: HTMLDivElement | null) => {
    if (!el) {
      setShift(0);
      return;
    }
    const margin = 8;
    const box = el.getBoundingClientRect();
    // `animate-pop-in` peut être à `scale(0.97)` au moment de la mesure, avec
    // `transform-origin: top` — donc une origine horizontale CENTRÉE, et une
    // boîte rétrécie symétriquement. `offsetWidth` ignore les
    // transformations : l'écart entre les deux donne la correction exacte,
    // et vaut zéro si l'animation n'a pas encore commencé.
    const bleed = (el.offsetWidth - box.width) / 2;
    const left = box.left - bleed;
    const right = box.right + bleed;
    if (left < margin) setShift(margin - left);
    else if (right > window.innerWidth - margin) {
      setShift(window.innerWidth - margin - right);
    }
  }, []);

  // Un menu déplié doit se refermer sur un clic ailleurs et sur Échap : sans
  // ça il reste ouvert par-dessus la page, et au clavier on s'y trouve
  // enfermé.
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
          ref={measure}
          role="menu"
          // LE DÉCALAGE PASSE PAR UNE MARGE, PAS PAR `transform` :
          // `animate-pop-in` anime justement `transform` en `fill-mode: both`,
          // et une animation l'emporte sur un style en ligne — le décalage
          // aurait été effacé au premier rendu.
          style={
            shift
              ? align === "right"
                ? { marginRight: -shift }
                : { marginLeft: shift }
              : undefined
          }
          className={`modal-panel animate-pop-in absolute top-full z-50 mt-2 ${width} max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[14px] p-1.5 ${
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
