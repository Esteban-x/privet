"use client";

import { useCallback, useRef } from "react";

/**
 * Une surface que le curseur éclaire.
 *
 * CE QU'IL NE FAIT PAS, et c'est l'essentiel : il ne stocke aucun état
 * React. La position de la souris part directement dans deux variables CSS
 * (`--mx`, `--my`) posées sur le nœud ; l'apparence est ensuite entièrement
 * décrite en CSS (classe `.spotlight`, globals.css). Un `useState` sur la
 * position déclencherait un rendu React à chaque pixel parcouru — c'est
 * exactement ce qui fait ramer cet effet partout où on le croise.
 *
 * L'ÉCRITURE EST CALÉE SUR LA TRAME. `mousemove` se déclenche bien plus
 * souvent que l'écran ne se rafraîchit ; sans ce garde, on écrirait
 * plusieurs fois pour une seule image affichée. On garde donc la dernière
 * position connue et on n'écrit qu'une fois par `requestAnimationFrame`.
 *
 * Sur écran tactile, le CSS neutralise l'effet et ce composant devient un
 * simple conteneur — le gestionnaire ne se déclenche jamais.
 *
 * UNE CONTRAINTE À CONNAÎTRE. Les deux couches de lumière sont des
 * pseudo-éléments posés au-dessus du fond ; pour que le contenu reste
 * lisible par-dessus, la règle `.spotlight > *` lui donne `position:
 * relative`. Un enfant DIRECT en `absolute` verrait donc son
 * positionnement écrasé. Si un bloc doit déborder ou se caler dans un
 * coin, enveloppe-le dans un `<div>` intermédiaire plutôt que d'en faire
 * un enfant direct.
 */
export default function Spotlight({
  as: Tag = "div",
  className = "",
  children,
  ...props
}: {
  as?: "div" | "section" | "article";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const next = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    next.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const { x, y } = next.current;
      node.style.setProperty("--mx", `${x}px`);
      node.style.setProperty("--my", `${y}px`);
    });
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      onMouseMove={onMouseMove}
      className={`spotlight ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
