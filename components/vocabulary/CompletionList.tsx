"use client";

import { CheckIcon } from "@/components/ui/icons";
import { kindLabel, type Completion } from "@/lib/vocabulary/autocomplete";

/**
 * Le menu de complétion, sous le champ de saisie.
 *
 * IL NE VOLE JAMAIS LE FOCUS. Les entrées ne sont pas des <button> mais des
 * <li> avec `onMouseDown` : un bouton prendrait le focus au clic, ce qui
 * déclencherait le `blur` du champ et refermerait la liste avant que le
 * clic n'aboutisse — le bug classique de tous les menus d'autocomplétion.
 * `onMouseDown` se déclenche AVANT le blur, et `preventDefault` empêche le
 * transfert de focus.
 *
 * LA NAVIGATION RESTE DANS LE CHAMP. Flèches, Tab et Entrée sont écoutés
 * par l'input lui-même (voir AddWordForm) : on ne quitte jamais la saisie,
 * ce qui permet de continuer à taper après avoir survolé une proposition.
 *
 * Le balisage suit le motif ARIA `combobox` : l'input porte
 * `aria-activedescendant` vers l'entrée active, et chaque entrée a un id
 * stable. Sans ça, un lecteur d'écran annonce la frappe mais jamais les
 * propositions.
 */
export default function CompletionList({
  items,
  activeIndex,
  onPick,
  onHover,
  listId,
}: {
  items: Completion[];
  activeIndex: number;
  onPick: (item: Completion) => void;
  onHover: (index: number) => void;
  listId: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul
      id={listId}
      role="listbox"
      className="modal-panel animate-pop-in absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl p-1"
    >
      {items.map((item, i) => (
        <li
          key={item.ru}
          id={`${listId}-${i}`}
          role="option"
          aria-selected={i === activeIndex}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(item);
          }}
          className={`flex cursor-pointer items-baseline gap-2 rounded-lg px-3 py-2 transition-colors ${
            i === activeIndex ? "bg-accent/12" : ""
          }`}
        >
          <span className="font-display text-sm font-semibold">{item.ru}</span>
          <span className="min-w-0 flex-1 truncate font-display text-xs text-muted">
            {item.fr}
          </span>
          {/* La nature du mot est une information de tri, pas un ornement :
              elle distingue « мать » (nom) de « мять » (verbe) quand les
              deux sortent d'une même faute de frappe. */}
          <span className="shrink-0 font-display text-[10px] uppercase tracking-wide text-muted/60">
            {kindLabel(item.kind)}
          </span>
          {/* L'ORIGINE EST DITE, parce qu'elle change ce qu'on peut en
              attendre. Une entrée relue vient d'une banque dont chaque
              traduction et chaque accent tonique ont été contrôlés ; une
              entrée non marquée a été produite par un modèle à la
              construction de l'index, et peut porter une traduction
              approximative. La différence est réelle, donc elle se voit. */}
          {item.verified && (
            <span
              title="Traduction relue à la main, accent tonique vérifié"
              className="shrink-0 text-success"
              aria-label="vérifié"
            >
              <CheckIcon className="h-3 w-3" />
            </span>
          )}
          {/* Une correction n'est pas une complétion : le mot tapé n'est pas
              un début de celui-ci. Le dire évite de croire qu'on a bien
              commencé à écrire le mot proposé. */}
          {item.corrected && (
            <span
              title="Orthographe approchante"
              className="shrink-0 rounded-full bg-accent2-deep/20 px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wide text-accent2-deep"
            >
              corrigé
            </span>
          )}
        </li>
      ))}

      <li className="px-3 pb-1 pt-1.5 font-display text-[10px] text-muted/60">
        <kbd className="rounded border border-border px-1">Tab</kbd> pour compléter
      </li>
    </ul>
  );
}
