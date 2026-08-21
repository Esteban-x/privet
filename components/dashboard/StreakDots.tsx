interface Act {
  created_at: string;
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export default function StreakDots({ activity }: { activity: Act[] }) {
  // Construit les 7 derniers jours (aujourd'hui à droite).
  const days: { date: Date; active: boolean }[] = [];
  const activeDates = new Set(
    activity.map((a) => new Date(a.created_at).toDateString())
  );
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    days.push({ date: d, active: activeDates.has(d.toDateString()) });
  }

  return (
    <div className="flex gap-2.5">
      {days.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className={`h-9 w-full rounded-lg ${
              d.active ? "bg-accent2" : "border border-border bg-bg"
            }`}
            title={d.date.toLocaleDateString("fr-FR")}
          />
          <span className="font-display text-xs text-muted">
            {DAY_LABELS[(d.date.getDay() + 6) % 7]}
          </span>
        </div>
      ))}
    </div>
  );
}
