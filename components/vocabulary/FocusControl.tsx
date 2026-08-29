"use client";

import { FOCUS_META, FOCUS_ORDER, type Focus } from "@/lib/vocabulary/focus";

/**
 * Le seul réglage d'état d'un mot : « à travailler », « normal », « je le
 * sais ». Trois segments côte à côte, un seul actif.
 *
 * POURQUOI UN CHOIX EXCLUSIF, ET PAS DEUX CASES À COCHER. Un mot ne peut pas
 * être à la fois celui qu'on veut voir le plus souvent et celui qu'on met de
 * côté ; deux marqueurs indépendants auraient laissé l'apprenant produire
 * cette combinaison, que la file de révision aurait ensuite dû arbitrer
 * derrière son dos.
 *
 * POURQUOI LES TROIS SONT VISIBLES. Un bouton unique qui cycle entre trois
 * valeurs n'annonce pas les deux autres, et surtout ne dit pas ce que le
 * mot vaut actuellement sans qu'on lise son libellé. Ici la position de la
 * pastille se lit d'un coup d'œil sur une liste de cinquante mots.
 */
export default function FocusControl({
  value,
  word,
  onChange,
  disabled = false,
  compact = false,
}: {
  value: Focus;
  /** Le mot, pour que le lecteur d'écran sache de quoi ce groupe règle la priorité. */
  word: string;
  onChange: (focus: Focus) => void;
  disabled?: boolean;
  /**
   * TROIS CASES DE MÊME LARGEUR, réduites à leur signe.
   *
   * POUR LA LIGNE DE COMMANDES D'UNE CARTE MOT. Les trois libellés en
   * entier font 230 px et ne laissaient de place à rien d'autre.
   *
   * PREMIÈRE TENTATIVE : garder le libellé du seul segment ACTIF. Elle
   * réglait la largeur totale mais pas l'alignement — « À travailler » et
   * « Normal » n'ont pas la même longueur, donc le groupe changeait de
   * taille d'une carte à l'autre et la colonne de commandes ondulait le
   * long de la liste. Ce qui se voit sur une liste, ce n'est pas la largeur
   * d'un élément, c'est l'irrégularité entre les lignes.
   *
   * Les cases font donc toutes 28 px, et l'état se lit à la case remplie —
   * comme n'importe quel groupe de segments. Le libellé complet reste au
   * `title` ET à l'`aria-label` : rien n'est perdu au survol, au clavier ni
   * au lecteur d'écran.
   */
  compact?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={`Priorité de révision de ${word}`}
      className="inline-flex rounded-full border border-border bg-bg p-0.5"
    >
      {FOCUS_ORDER.map((focus) => {
        const meta = FOCUS_META[focus];
        const active = focus === value;
        return (
          <button
            key={focus}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            title={compact ? `${meta.label} — ${meta.hint}` : meta.hint}
            // Cliquer sur le segment déjà actif ne fait rien : il n'y a pas
            // d'état « aucun des trois », et une bascule silencieuse vers
            // « normal » se déclencherait au double-clic.
            onClick={() => !active && onChange(focus)}
            aria-label={compact ? meta.label : undefined}
            className={`inline-flex items-center justify-center rounded-full font-display text-[11px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed ${
              compact ? "h-6 w-7" : "gap-1.5 px-2.5 py-1"
            } ${active ? meta.active : "text-muted hover:text-text"}`}
          >
            <span aria-hidden>{meta.icon}</span>
            {!compact && meta.label}
          </button>
        );
      })}
    </div>
  );
}
