import { FOCUS_META, focusCountLabel, type Focus } from "@/lib/vocabulary/focus";

/**
 * Comment une liste est rangée : mots mis de côté à gauche, mots à
 * travailler à droite, le reste au milieu.
 *
 * Remplace MasteryBar, qui affichait un pourcentage de « maîtrise » calculé
 * par la machine. Ce que montre cette barre n'est pas un progrès mesuré,
 * c'est un rangement décidé — d'où l'absence de note et de couleur de
 * réussite ailleurs que sur le vert du « je le sais ».
 */
export default function FocusBar({
  total,
  known,
  priority,
  compact = false,
}: {
  total: number;
  known: number;
  priority: number;
  compact?: boolean;
}) {
  if (total === 0) return null;
  const knownPct = Math.round((known / total) * 100);
  const priorityPct = Math.round((priority / total) * 100);
  const normal = total - known - priority;

  return (
    <div>
      {!compact && (
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-sm text-muted">
            <Legend focus="known" count={known} />
            <Legend focus="normal" count={normal} />
            <Legend focus="priority" count={priority} />
          </div>
          <p
            className="font-display text-sm font-bold text-success"
            title="Part de la liste que tu as toi-même mise de côté"
          >
            {knownPct}%
          </p>
        </div>
      )}
      <div
        className={`flex overflow-hidden rounded-full bg-border ${compact ? "h-1.5" : "h-2.5"}`}
        role="img"
        aria-label={`${known} mot${known === 1 ? "" : "s"} mis de côté et ${priority} à travailler sur ${total}`}
      >
        <div className="h-full bg-success transition-all" style={{ width: `${knownPct}%` }} />
        {/* Le milieu, ce sont les « normal » : rien de peint, le fond de la
            piste suffit — les colorer aurait donné trois couleurs pleines
            là où seuls les deux choix explicites méritent l'œil. */}
        <div className="h-full flex-1" />
        <div className="h-full bg-accent transition-all" style={{ width: `${priorityPct}%` }} />
      </div>
    </div>
  );
}

function Legend({ focus, count }: { focus: Focus; count: number }) {
  // Le segment « normal » n'est pas peint dans la barre : sa pastille prend
  // la couleur de la piste pour que la légende corresponde à ce qu'on voit.
  const dot = focus === "normal" ? "bg-border" : FOCUS_META[focus].bar;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
      {count} {focusCountLabel(focus, count)}
    </span>
  );
}
