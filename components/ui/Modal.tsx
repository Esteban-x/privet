"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Boîte de dialogue modale.
 *
 * Rendue dans un portail sur `document.body` : posée dans l'arbre, elle
 * héritait du contexte d'empilement de son parent — c'est ainsi que le
 * formulaire « nouvelle liste » s'était retrouvé collé en bas de la colonne
 * de gauche, au lieu d'être au centre de l'écran.
 *
 * Ce qu'une modale doit faire pour ne pas être un piège, et qui est fait
 * ici : rendre la main sur Échap et au clic sur le fond, empêcher la page
 * derrière de défiler, donner le focus au premier champ à l'ouverture, le
 * garder à l'intérieur tant qu'elle est ouverte, et le rendre à l'élément
 * qui l'a ouverte à la fermeture.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  /** Pictogramme du panneau : donne au dialogue un sujet avant sa première ligne. */
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  // `onClose` est presque toujours une lambda recréée à chaque rendu : la
  // mettre en dépendance ferait rejouer l'effet en boucle, et le focus
  // repartirait sur le premier champ à chaque frappe.
  const closeRef = useRef(onClose);
  // Synchronisée par un effet, pas pendant le rendu : écrire dans une ref au
  // milieu d'un rendu est ce que React déconseille explicitement.
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const selector =
      'input:not([disabled]), button:not([disabled]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])';
    // Le champ d'abord, la croix ensuite : dans l'ordre du DOM le bouton de
    // fermeture vient en premier, et ouvrir une modale focus sur « fermer »
    // demande un geste de plus pour faire ce qu'on est venu faire.
    const field = panel?.querySelector<HTMLElement>("input:not([disabled]), textarea, select");
    (field ?? panel?.querySelector<HTMLElement>(selector))?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      // Piège à focus : Tab sur le dernier élément revient au premier, et
      // Maj+Tab sur le premier va au dernier. Sans ça, la tabulation sort
      // derrière la modale, sur des contrôles qu'on ne voit plus.
      const items = [...panel.querySelectorAll<HTMLElement>(selector)].filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus();
    };
  }, [open]);

  // Pas d'état « monté » : `createPortal` n'a pas de sens au rendu serveur,
  // et une modale ne s'ouvre que sur une action de l'utilisateur — donc
  // toujours APRÈS l'hydratation.
  //
  // Corollaire à respecter : `open` ne doit jamais valoir true au premier
  // rendu. Le serveur ne rendrait rien, le client rendrait le portail, et
  // React signalerait la divergence d'hydratation.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        /* Pas de `backdrop-blur-*` ici : le flou est DANS l'animation
           (globals.css), pour qu'il s'installe en même temps que
           l'assombrissement. Le poser en classe le rendrait instantané
           pendant que le noir monte — on verrait l'interface se flouter
           d'un coup, puis s'assombrir. Le voile est aussi plus clair
           qu'avant, le flou faisant désormais le gros du travail. */
        className="animate-overlay-in absolute inset-0 bg-black/55"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        className="modal-panel animate-modal-in relative w-full max-w-lg overflow-hidden rounded-3xl"
      >
        {/* Un liseré d'accent en haut du panneau, et une lueur diffuse
            derrière le pictogramme : de quoi donner un haut au dialogue sans
            lui coller une barre de titre. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="hover-surface absolute right-4 top-4 z-10 rounded-lg p-2 text-muted hover:text-text"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative px-7 pb-2 pt-7">
          {icon && <div className="mb-4">{icon}</div>}
          <h2 className="pr-10 font-display text-2xl font-extrabold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1.5 max-w-sm font-display text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
        </div>
        <div className="relative px-7 pb-7 pt-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
