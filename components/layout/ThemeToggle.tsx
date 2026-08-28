"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, readTheme, serverTheme, subscribeTheme, type Theme } from "@/lib/theme";

/**
 * Bascule clair / sombre.
 *
 * DEUX ÉTATS, PAS TROIS. Un troisième choix « système » est plus complet
 * mais demande un menu et une explication ; ici, tant que personne n'a
 * touché au bouton, c'est justement la préférence système qui s'applique
 * (voir les blocs `prefers-color-scheme` de globals.css). Le bouton ne sert
 * qu'à la contredire — et à partir de là, le choix explicite gagne.
 *
 * L'ICÔNE MONTRE LA CIBLE, pas l'état courant : en sombre on affiche un
 * soleil, parce qu'un clic mène au clair. Afficher l'état actuel est le
 * réflexe naturel, et c'est celui qui fait cliquer à l'envers.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  // Le thème vit sur <html>, posé avant React par le script anti-flash :
  // c'est un état EXTERNE. On s'y abonne plutôt que d'en garder une copie —
  // ce qui règle du même coup l'hydratation (le serveur rend le défaut) et
  // la préférence système, qui peut changer pendant la visite.
  const theme = useSyncExternalStore<Theme>(subscribeTheme, readTheme, serverTheme);

  function toggle() {
    applyTheme(theme === "light" ? "dark" : "light");
  }

  const isLight = theme === "light";
  const label = isLight ? "Passer au thème sombre" : "Passer au thème clair";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`hover-surface relative flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-text ${className}`}
    >
      {/* Les deux icônes sont TOUJOURS montées et se croisent en rotation :
          une substitution conditionnelle ferait disparaître puis réapparaître
          quelque chose, ce qui se voit comme un clignotement. Là, le soleil
          pivote et s'efface pendant que la lune arrive. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isLight ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
        style={{ transitionTimingFunction: "var(--ease)" }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isLight ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease)" }}
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
