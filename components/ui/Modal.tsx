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
  /**
   * « sheet » : plein écran sous 640 px, panneau centré au-delà.
   *
   * POUR LES DIALOGUES QUI CONTIENNENT UN FORMULAIRE, pas une question. Un
   * panneau centré de 512 px marche pour « supprimer cette liste ? » ; pour
   * le formulaire d'ajout de mot, qui a deux champs, un sélecteur de sens,
   * une ligne de suggestion et un bouton, il laissait sur un téléphone une
   * boîte étriquée flottant sur un fond noir, avec le clavier virtuel qui en
   * mangeait la moitié. Plein écran, le formulaire a la place qu'il demande
   * et le clavier pousse simplement le contenu.
   */
  variant = "dialog",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "dialog" | "sheet";
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
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

  /**
   * LE DIALOGUE SE CALE SUR LA FENÊTRE VISIBLE, PAS SUR LA FENÊTRE DE MISE EN
   * PAGE — c'est la seule façon de garder son pied au-dessus du clavier.
   *
   * `position: fixed` se réfère à la fenêtre de MISE EN PAGE, et sur iOS
   * celle-ci ne rétrécit pas d'un pixel quand le clavier monte : elle est
   * simplement recouverte. Un `inset-0` s'étend donc SOUS le clavier, et tout
   * ce qui est calé en bas — ici le bouton « Ajouter le mot », `sticky
   * bottom-0` dans le formulaire — se retrouve derrière lui. Rien dans le CSS
   * ne le rattrape : ni `100dvh`, ni `100svh`, ni `env(keyboard-inset-*)`, qui
   * ne parle qu'aux claviers virtuels déclarés par l'application.
   *
   * `visualViewport`, lui, décrit exactement la zone restée visible — sa
   * hauteur retranche le clavier, et `offsetTop` dit de combien iOS a fait
   * glisser cette zone pour montrer le champ actif. Recopier les quatre
   * mesures sur le conteneur le remet pile dans le cadre visible.
   *
   * ÉCRIT DIRECTEMENT DANS LE STYLE DU NŒUD, pas via un état : `scroll` se
   * déclenche à chaque image pendant que le clavier glisse, et un rendu React
   * par image ferait traîner le panneau derrière le clavier.
   *
   * IL POSE AUSSI `data-kb`, ET C'EST LUI QUI FAIT DE LA PLACE. Aucune API
   * ne dit si le clavier virtuel est ouvert : on mesure donc sa CONSÉQUENCE
   * — il ne reste presque plus rien de visible. Sous 520 px de hauteur
   * visible, l'en-tête du dialogue se replie (`group-data-[kb]:` plus bas) ;
   * sur les ~370 px qui survivent au-dessus d'un clavier d'iPhone, les 60 px
   * du titre et du sous-titre sont exactement ce qui décide si le bouton de
   * validation est à l'écran ou dessous.
   *
   * Mesurer la conséquence plutôt que la cause a un avantage : ça marche
   * aussi là où le clavier RÉTRÉCIT la fenêtre de mise en page (Android),
   * cas où l'écart entre les deux fenêtres — le signal évident — reste nul.
   * Et le seuil ne se déclenche pas tout seul : le plus petit iPhone garde
   * 555 px sous la barre d'adresse, clavier fermé.
   */
  useEffect(() => {
    if (!open) return;
    const view = window.visualViewport;
    const el = rootRef.current;
    if (!view || !el) return;

    function sync() {
      if (!view || !el) return;
      el.style.top = `${view.offsetTop}px`;
      el.style.left = `${view.offsetLeft}px`;
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.width = `${view.width}px`;
      el.style.height = `${view.height}px`;
      if (view.height < 520) el.dataset.kb = "";
      else delete el.dataset.kb;
    }

    sync();
    view.addEventListener("resize", sync);
    view.addEventListener("scroll", sync);
    return () => {
      view.removeEventListener("resize", sync);
      view.removeEventListener("scroll", sync);
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

  const sheet = variant === "sheet";

  return createPortal(
    <div
      ref={rootRef}
      className={`group fixed inset-0 z-50 flex justify-center ${
        sheet ? "items-stretch sm:items-center sm:p-4" : "items-center p-4"
      }`}
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
        className={`modal-panel animate-modal-in relative w-full overflow-hidden ${
          sheet
            ? "flex max-h-full flex-col rounded-none sm:max-h-[calc(100vh-2rem)] sm:max-w-lg sm:rounded-3xl"
            : "max-w-lg rounded-3xl"
        }`}
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

        {/* L'EN-TÊTE MAIGRIT QUAND LE CLAVIER MONTE, et seulement alors.
            Le sous-titre d'une feuille explique quoi taper : il a tout son
            sens tant que le champ est vide, et plus aucun une fois qu'on
            tape dedans — moment précis où ses deux lignes, le titre en
            24 px et le pictogramme prennent la place du bouton de
            validation. Repliés, ils la rendent ; refermez le clavier, ils
            reviennent. Réservé à la feuille : un dialogue centré a sa
            place, et son sous-titre porte souvent la question elle-même
            (« … seront perdus. C'est définitif. »). */}
        <div
          className={`relative shrink-0 pb-2 ${
            sheet ? "px-5 pt-6 group-data-[kb]:pt-4 sm:px-7 sm:pt-7" : "px-7 pt-7"
          }`}
        >
          {icon && <div className={`mb-4 ${sheet ? "group-data-[kb]:hidden" : ""}`}>{icon}</div>}
          <h2
            className={`pr-10 font-display text-2xl font-extrabold tracking-tight ${
              sheet ? "group-data-[kb]:text-lg" : ""
            }`}
          >
            {title}
          </h2>
          {description && (
            <p
              className={`mt-1.5 max-w-sm font-display text-sm leading-relaxed text-muted ${
                sheet ? "group-data-[kb]:hidden" : ""
              }`}
            >
              {description}
            </p>
          )}
        </div>
        <div
          /* `scroll-pb-16` : quand le navigateur amène de lui-même le champ
             qu'on vient de toucher dans la zone visible, il le colle au bas
             du conteneur — donc juste au-dessus du bouton de validation, qui
             sort alors de l'écran. Cette réserve de défilement, à la hauteur
             du bouton, lui dit de s'arrêter un cran plus haut et de le garder
             en vue. (Elle valait 28 du temps où le pied était collant : il
             fallait alors réserver de quoi ne pas passer DERRIÈRE lui.)

             Le rembourrage bas suit la zone sûre : sans clavier, le bouton se
             cale au bas de la feuille, c'est-à-dire à l'endroit exact où
             l'iPhone dessine sa barre d'accueil. Avec le clavier, celle-ci
             est dessous — la réserve n'a plus lieu d'être et rend ses pixels
             au formulaire. */
          className={`relative pt-5 ${
            sheet
              ? "flex-1 scroll-pb-16 overflow-y-auto px-5 pb-[max(2rem,env(safe-area-inset-bottom))] group-data-[kb]:pt-3 group-data-[kb]:pb-4 sm:px-7 sm:pb-7"
              : "px-7 pb-7"
          }`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
