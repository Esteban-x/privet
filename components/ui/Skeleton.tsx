// Petits blocs de chargement réutilisables (voir .skeleton/.dot-pulse dans
// app/globals.css) — un texte "Chargement…" statique casse le rythme d'une
// UI par ailleurs animée ; ces primitives donnent un repère visuel qui
// épouse la forme du contenu à venir plutôt qu'un simple message.

/** Puces qui pulsent en cascade + libellé, façon "en train de générer". */
export function LoadingDots({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wide text-muted">
      <span className="flex gap-1">
        <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:0ms]" />
        <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:160ms]" />
        <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:320ms]" />
      </span>
      {label}
    </p>
  );
}

/** Lignes de texte factices à largeurs variables (paragraphe en cours de génération). */
export function SkeletonLines({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["100%", "94%", "88%", "97%", "82%", "91%"];
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded-lg"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

/** Une "carte mot" factice (clue + zone de réponse) pour les modes de révision vocabulaire. */
export function ReviewCardSkeleton() {
  return (
    <div className="animate-fade-in rounded-[20px] border border-border bg-bg2 p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
      <div className="mb-3 flex justify-center">
        <LoadingDots label="Chargement du mot…" />
      </div>
      <div className="skeleton mx-auto h-4 w-40 rounded-full" />
      <div className="skeleton mx-auto mt-3 h-9 w-56 rounded-lg" />
      <div className="skeleton mt-6 h-[52px] w-full rounded-[10px]" />
    </div>
  );
}

/** Grille de cartes "liste" factices (page /vocabulary). */
export function ListCardsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="animate-fade-in grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-bg2 p-5">
          <div className="skeleton h-5 w-2/3 rounded-lg" />
          <div className="skeleton mt-2.5 h-3.5 w-1/4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Lignes de mots factices pour les listes (aperçu ou détail). */
export function ListRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-fade-in space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-[14px] border border-border bg-bg2 px-4 py-3.5"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="skeleton h-3.5 w-1/3 rounded-full" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
          </div>
          <div className="skeleton h-7 w-16 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
