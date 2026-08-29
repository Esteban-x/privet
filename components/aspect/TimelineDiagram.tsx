import type { TimelineSchema } from "@/lib/aspect/verbs";

/**
 * Schémas temporels de l'aspect, en SVG inline.
 *
 * L'aspect ne dit pas QUAND l'action a lieu — il dit quelle FORME elle a :
 * une ligne qui court (processus), une ligne qui bute sur une borne
 * (résultat), une suite de points (répétition). C'est la représentation
 * classique de la didactique russe, et c'est ce qu'un francophone ne voit
 * pas tant qu'on ne le lui dessine pas : « решал » et « решил » ne se
 * distinguent pas par le moment, mais par le fait d'avoir abouti ou non.
 *
 * Même parti pris que les verbes de mouvement : un schéma, pas une image.
 */

const AXIS = 60;
const STROKE = 3;

function Arrowhead({ id }: { id: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
    </marker>
  );
}

/** L'axe du temps, présent sur tous les schémas. */
function TimeAxis({ head }: { head: string }) {
  return (
    <g className="text-muted">
      <line
        x1="14"
        y1={AXIS}
        x2="226"
        y2={AXIS}
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={`url(#${head})`}
      />
      <text x="226" y={AXIS + 18} textAnchor="end" className="fill-current font-display text-[10px]">
        temps
      </text>
    </g>
  );
}

/** Borne atteinte : le trait vertical qui marque le résultat. */
function Boundary({ x }: { x: number }) {
  return (
    <g className="text-accent2">
      <line x1={x} y1={AXIS - 26} x2={x} y2={AXIS - 2} stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <circle cx={x} cy={AXIS - 30} r="4" fill="currentColor" />
    </g>
  );
}

export default function TimelineDiagram({
  schema,
  className = "",
}: {
  schema: TimelineSchema;
  className?: string;
}) {
  const head = `time-${schema}`;
  const line = {
    stroke: "currentColor",
    strokeWidth: STROKE,
    strokeLinecap: "round" as const,
    fill: "none",
  };

  return (
    <svg
      viewBox="0 0 240 84"
      role="img"
      aria-label={LABEL[schema]}
      className={`h-[84px] w-full max-w-[240px] ${className}`}
    >
      <defs>
        <Arrowhead id={head} />
      </defs>
      <TimeAxis head={head} />

      <g className="text-accent-ink">
        {schema === "process" && (
          <path d="M34 34 H190" {...line} strokeDasharray="1 9" strokeWidth={5} />
        )}

        {schema === "result" && (
          <>
            <path d="M34 34 H162" {...line} strokeDasharray="1 9" strokeWidth={5} />
            <Boundary x={172} />
          </>
        )}

        {schema === "attempt" && (
          <>
            <path d="M34 34 H162" {...line} strokeDasharray="1 9" strokeWidth={5} />
            <g className="text-muted">
              <circle cx="176" cy="34" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              <text x="176" y="38" textAnchor="middle" className="fill-current font-display text-[11px] font-bold">
                ?
              </text>
            </g>
          </>
        )}

        {schema === "repetition" &&
          [44, 84, 124, 164, 204].map((x) => (
            <g key={x}>
              <circle cx={x} cy="34" r="5" fill="currentColor" />
              <line x1={x} y1="40" x2={x} y2={AXIS - 2} stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>
          ))}

        {schema === "interrupted" && (
          <>
            <path d="M34 34 H190" {...line} strokeDasharray="1 9" strokeWidth={5} />
            <g className="text-danger">
              <line x1="120" y1="14" x2="120" y2="52" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
              <circle cx="120" cy="10" r="4" fill="currentColor" />
            </g>
          </>
        )}

        {schema === "duration" && (
          <>
            <path d="M44 34 H186" {...line} strokeDasharray="1 9" strokeWidth={5} />
            <g className="text-muted">
              <path d="M44 16 V26 M186 16 V26 M44 21 H186" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <text x="115" y="12" textAnchor="middle" className="fill-current font-display text-[10px]">
                durée mesurée
              </text>
            </g>
          </>
        )}

        {schema === "sequence" && (
          <>
            <Boundary x={72} />
            <Boundary x={148} />
            <path
              d="M80 22 C 105 6, 120 6, 142 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd={`url(#${head})`}
            />
          </>
        )}
      </g>
    </svg>
  );
}

const LABEL: Record<TimelineSchema, string> = {
  process: "une ligne continue : un processus sans borne",
  result: "une ligne qui bute sur une borne : le résultat est atteint",
  repetition: "des points répétés sur l'axe du temps",
  interrupted: "une ligne coupée par un événement ponctuel",
  duration: "une ligne surmontée d'une durée mesurée",
  sequence: "deux bornes successives : une action puis l'autre",
  attempt: "une ligne qui s'arrête sur un point d'interrogation",
};
