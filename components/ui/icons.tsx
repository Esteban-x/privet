/**
 * Le jeu d'icônes de l'app.
 *
 * POURQUOI PAS D'ÉMOJIS. Un 🔊 ou un 🎉 n'est pas dessiné par nous : c'est
 * la police du système qui décide, et le rendu change complètement entre
 * Windows, macOS et Android. Ils arrivent en couleurs fixes — donc ils
 * ignorent le thème, ne prennent jamais la couleur du texte qui les
 * entoure, et jurent en thème clair. Leur poids optique n'a aucun rapport
 * avec celui de la typographie. C'est le détail qui fait « projet
 * d'étudiant » plus sûrement que n'importe quel choix de couleur.
 *
 * Ces icônes-là sont tracées sur une grille de 24, épaisseur 2, extrémités
 * et jonctions rondes — les mêmes règles pour toutes, ce qui est la seule
 * façon d'obtenir un jeu qui a l'air d'une famille. Elles héritent de
 * `currentColor` : une icône dans un bouton rouge devient rouge, sans
 * qu'on ait à s'en occuper.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ── Audio ───────────────────────────────────────────────────── */

export function SpeakerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </Icon>
  );
}

export function MicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </Icon>
  );
}

/** Ondes sonores seules — pour un état « écoute en cours ». */
export function WaveIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4" />
    </Icon>
  );
}

/* ── Contenu ─────────────────────────────────────────────────── */

export function BookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H19v16H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v4H6.5A2.5 2.5 0 0 1 4 19.5" />
    </Icon>
  );
}

export function CardsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="7" y="3" width="14" height="14" rx="2.5" />
      <path d="M17 21H6a3 3 0 0 1-3-3V7" />
    </Icon>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </Icon>
  );
}

/* ── Navigation ──────────────────────────────────────────────── */
/*
 * Les trois qui manquaient au bandeau du bas. Le cours réutilise BookIcon
 * et le vocabulaire CardsIcon : à cinq onglets, deux icônes de plus auraient
 * été deux occasions de plus de ne pas ressembler à la famille.
 *
 * Le point central de la cible est tracé comme dans ListIcon — un segment
 * de longueur nulle (`h.01`) que le `stroke-linecap: round` transforme en
 * disque. Un <circle fill> aurait fallu rouvrir le `fill="none"` du parent
 * et se serait épaissi différemment des autres traits.
 */

/** Exercices : viser une forme précise, pas parcourir une liste. */
export function TargetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.75" />
      <path d="M12 12h.01" />
    </Icon>
  );
}

/** Lecture : une page de texte — le livre, lui, dit « cours ». */
export function TextIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8.5h8M8 12.5h8M8 16.5h5" />
    </Icon>
  );
}

/** Progrès : trois barres, ce que la page montre réellement. */
export function ChartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.5 20v-6.5M12 20V4.5M18.5 20v-9.5" />
    </Icon>
  );
}

/* ── Retours ─────────────────────────────────────────────────── */

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12.5 9 17 19.5 6.5" />
    </Icon>
  );
}

export function CrossIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

/** Coupe de réussite — fin de session. Remplace le 🎉. */
export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4M17 6h2.5a2.5 2.5 0 0 1-2.5 4" />
      <path d="M12 14v3M9 20h6M10 17h4l.5 3h-5z" />
    </Icon>
  );
}

/** Ampoule — un indice, une astuce. Remplace le 💡. */
export function BulbIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 17a6 6 0 1 1 5 0" />
      <path d="M9.5 17v1.5a2.5 2.5 0 0 0 5 0V17" />
      <path d="M10 21h4" />
    </Icon>
  );
}

/** Flamme — la série de jours consécutifs. Remplace le 🔥. */
export function FlameIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2.5s5.5 4.2 5.5 9.2a5.5 5.5 0 0 1-11 0c0-1.8.8-3.3 1.8-4.5.3 1 .9 1.8 1.7 2.2C10.4 7.2 11 4.6 12 2.5z" />
    </Icon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />
    </Icon>
  );
}

/* ── Actions ─────────────────────────────────────────────────── */

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Icon>
  );
}

export function SwapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
    </Icon>
  );
}

/** Un chargement circulaire. La rotation est portée par la classe. */
export function SpinnerIcon({ className = "", ...props }: IconProps) {
  return (
    <Icon className={`animate-spin ${className}`} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" />
    </Icon>
  );
}

