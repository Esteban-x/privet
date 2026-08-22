interface Act {
  created_at: string;
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

// `now` vient du composant appelant (Date.now() est impur — un appel direct
// ici rendrait ce composant non déterministe pour un même jeu de props, ce
// que le linter React signale à raison même si ce composant est aujourd'hui
// rendu côté serveur une seule fois par requête).
export default function StreakDots({ activity, now }: { activity: Act[]; now: number }) {
  // Construit les 7 derniers jours (aujourd'hui à droite).
  const days: { date: Date; active: boolean }[] = [];
  const activeDates = new Set(
    activity.map((a) => new Date(a.created_at).toDateString())
  );
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 864e5);
    days.push({ date: d, active: activeDates.has(d.toDateString()) });
  }

  return (
    <div className="flex gap-2.5">
      {days.map((d, i) => {
        const dateLabel = d.date.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              role="img"
              aria-label={`${dateLabel} : ${d.active ? "actif" : "inactif"}`}
              title={dateLabel}
              className={`flex h-9 w-full items-center justify-center rounded-lg ${
                d.active ? "bg-accent2" : "border border-border bg-bg"
              }`}
            >
              {/* Repère non basé uniquement sur la couleur (accessibilité
                  daltonisme) : une coche visible en plus du fond plein. */}
              {d.active && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M2.5 7.5L5.5 10.5L11.5 3.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="font-display text-xs text-muted" aria-hidden>
              {DAY_LABELS[(d.date.getDay() + 6) % 7]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
