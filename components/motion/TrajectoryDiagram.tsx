import type { MotionMode, TrajectorySchema } from "@/lib/motion/verbs";

/**
 * Schémas de trajectoire, en SVG inline.
 *
 * Pourquoi un schéma et pas une image : ce qui sépare идти de ходить n'est
 * pas la scène — c'est un piéton dans les deux cas — mais la FORME du
 * trajet. Une photo ne distingue rien ; une flèche qui revient à son point
 * de départ, si. Idem pour les préfixes, qui encodent une relation à une
 * frontière (entrer, sortir, s'arrêter au bord, contourner) : c'est de la
 * géométrie, donc ça se dessine exactement.
 *
 * Inline plutôt que des fichiers : rien à charger, rien à licencier, et les
 * couleurs suivent le thème via `currentColor`.
 */

const STROKE = 2.5;

function Arrowhead({ id, className }: { id: string; className: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="5"
      markerHeight="5"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" className={className} fill="currentColor" />
    </marker>
  );
}

/** Petit pictogramme du mode de déplacement, posé au départ du trajet. */
function ModeGlyph({ mode, x, y }: { mode: MotionMode; x: number; y: number }) {
  const common = { className: "text-accent2", fill: "currentColor" };
  if (mode === "vehicle") {
    return (
      <g transform={`translate(${x - 13} ${y - 9})`} {...common}>
        <rect x="0" y="6" width="26" height="9" rx="2.5" />
        <path d="M4 6 L8 1 h10 l4 5 z" />
        <circle cx="7" cy="16.5" r="2.8" />
        <circle cx="19" cy="16.5" r="2.8" />
      </g>
    );
  }
  if (mode === "air") {
    return (
      <g transform={`translate(${x - 13} ${y - 9})`} {...common}>
        <path d="M2 11 L24 4 L21 12 L26 17 L20 17 L15 12 L6 15 z" />
      </g>
    );
  }
  if (mode === "water") {
    return (
      <g transform={`translate(${x - 13} ${y - 10})`} {...common}>
        <path d="M13 1 L13 10 M13 3 L22 10 L13 10" />
        <path d="M2 12 h22 l-3 6 h-16 z" />
        <path d="M0 20 q4 3 8 0 t8 0 t8 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
    );
  }
  // à pied / en portant : une silhouette qui marche
  return (
    <g transform={`translate(${x - 6} ${y - 12})`} {...common}>
      <circle cx="6" cy="3" r="3" />
      <path
        d="M6 6.5 L6 14 M6 9 L1.5 12 M6 9 L10.5 12 M6 14 L2.5 21 M6 14 L10 21"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {mode === "carry" && <rect x="9.5" y="9" width="7" height="6" rx="1" />}
    </g>
  );
}

/** Bâtiment de référence : sert de frontière aux schémas préfixés. */
function Building({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 34)`} className="text-muted">
      <rect
        x="0"
        y="0"
        width="46"
        height="42"
        rx="3"
        fill="currentColor"
        fillOpacity="0.13"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M-4 0 L23 -14 L50 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="18" y="24" width="10" height="18" rx="1" fill="currentColor" fillOpacity="0.35" />
    </g>
  );
}

export default function TrajectoryDiagram({
  schema,
  mode,
  className = "",
}: {
  schema: TrajectorySchema;
  mode?: MotionMode;
  className?: string;
}) {
  const head = `arrow-${schema}`;
  const path = "text-accent-ink";
  const arrowProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: STROKE,
    strokeLinecap: "round" as const,
    markerEnd: `url(#${head})`,
  };

  return (
    <svg
      viewBox="0 0 240 90"
      role="img"
      aria-label={SCHEMA_LABEL[schema]}
      className={`h-[90px] w-full max-w-[240px] ${className}`}
    >
      <defs>
        <Arrowhead id={head} className={path} />
      </defs>

      {/* Le bâtiment n'apparaît que pour les schémas qui parlent d'une frontière. */}
      {BUILDING_SCHEMAS.has(schema) && <Building x={132} />}

      <g className={path}>
        {schema === "oneway" && <path d="M30 46 H196" {...arrowProps} />}

        {schema === "roundtrip" && (
          <>
            <path d="M34 40 C 80 12, 150 12, 196 40" {...arrowProps} />
            <path d="M196 54 C 150 82, 80 82, 34 54" {...arrowProps} />
          </>
        )}

        {schema === "repeated" && (
          <>
            <path d="M30 26 H150" {...arrowProps} />
            <path d="M30 50 H150" {...arrowProps} />
            <path d="M30 74 H150" {...arrowProps} />
            <text x="176" y="57" className="fill-current font-display text-[22px] font-bold">
              ×N
            </text>
          </>
        )}

        {schema === "into" && <path d="M26 55 H150" {...arrowProps} />}
        {schema === "outof" && <path d="M150 55 H26" {...arrowProps} />}
        {schema === "upto" && <path d="M26 55 H124" {...arrowProps} />}
        {schema === "awayfrom" && <path d="M126 55 H26" {...arrowProps} />}
        {schema === "around" && (
          <path d="M110 78 C 96 78, 96 22, 132 22 C 172 22, 176 78, 158 78" {...arrowProps} />
        )}
        {schema === "past" && (
          <path d="M26 78 C 90 78, 110 34, 155 34 C 190 34, 196 62, 214 62" {...arrowProps} />
        )}
        {schema === "reach" && (
          <>
            <path d="M26 55 H120" {...arrowProps} />
            <path d="M128 34 V76" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
          </>
        )}
        {schema === "across" && (
          <>
            <path d="M26 55 H210" {...arrowProps} />
            <path
              d="M118 14 V86"
              className="text-muted"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          </>
        )}
      </g>

      {mode && <ModeGlyph mode={mode} x={schema === "outof" || schema === "awayfrom" ? 200 : 24} y={22} />}
    </svg>
  );
}

/** Schémas qui ont besoin du bâtiment comme frontière de référence. */
const BUILDING_SCHEMAS = new Set<TrajectorySchema>([
  "into",
  "outof",
  "upto",
  "awayfrom",
  "around",
  "past",
]);

export const SCHEMA_LABEL: Record<TrajectorySchema, string> = {
  oneway: "trajet dans une seule direction",
  roundtrip: "aller puis retour au point de départ",
  repeated: "trajet répété plusieurs fois",
  into: "entrée à l'intérieur",
  outof: "sortie depuis l'intérieur",
  upto: "approche jusqu'au bord",
  awayfrom: "éloignement depuis le bord",
  across: "traversée d'une limite",
  around: "contournement",
  past: "passage à côté, avec détour",
  reach: "trajet qui s'arrête exactement au but",
};
