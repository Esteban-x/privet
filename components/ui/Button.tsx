import Link from "next/link";
import { SpinnerIcon } from "@/components/ui/icons";

/**
 * Le bouton de l'app.
 *
 * POURQUOI UN COMPOSANT ET PAS SEULEMENT DES CLASSES. Les classes CSS
 * (globals.css) portent l'apparence ; ce composant porte les DÉCISIONS
 * qu'on oublie sinon une fois sur deux : `type="button"` (sans quoi un
 * bouton dans un formulaire le soumet), l'état de chargement qui bloque le
 * double-clic, `aria-busy`, et le fait qu'un lien qui ressemble à un bouton
 * doit rester un <a> pour que « ouvrir dans un nouvel onglet » fonctionne.
 *
 * LA LARGEUR NE BOUGE PAS PENDANT LE CHARGEMENT. Le libellé reste en place
 * et devient transparent, la roulette se superpose. Remplacer le texte par
 * « Chargement… » fait sauter la largeur du bouton — et un bouton qui
 * change de taille sous le curseur est la façon la plus sûre de rater son
 * deuxième clic.
 */

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "ai";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "btn-primary btn-sheen",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  danger: "btn-danger",
  ai: "btn-ai",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 rounded-lg px-3.5 text-[13px]",
  md: "h-11 rounded-xl px-5 text-sm",
  lg: "h-[52px] rounded-xl px-7 text-[15px]",
};

interface Common {
  variant?: Variant;
  size?: Size;
  /** Pictogramme avant le libellé. */
  icon?: React.ReactNode;
  /** Pictogramme après — une flèche, un chevron. */
  iconAfter?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = Common &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    loading?: boolean;
  };

export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconAfter,
  loading = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`btn font-display ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...props}
    >
      {loading && (
        <SpinnerIcon className="absolute h-[18px] w-[18px]" />
      )}
      <span
        className={`inline-flex items-center gap-2 transition-opacity duration-150 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        {icon}
        {children}
        {iconAfter}
      </span>
    </button>
  );
}

/**
 * Le même bouton, en lien. Un <button> qui appelle `router.push` casse le
 * clic milieu, le Ctrl+clic et le survol qui montre la destination.
 */
export function ButtonLink({
  variant = "secondary",
  size = "md",
  icon,
  iconAfter,
  className = "",
  children,
  href,
  ...props
}: Common & Omit<React.ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      href={href}
      className={`btn font-display ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {children}
        {iconAfter}
      </span>
    </Link>
  );
}
