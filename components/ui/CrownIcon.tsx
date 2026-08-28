/**
 * L'emblème de Privetik Pro.
 *
 * UN EMBLÈME, PAS UNE ILLUSTRATION. Tout est droit : trois pointes, un
 * bandeau, trois losanges. Aucune courbe, aucun contour dessiné. Le volume ne
 * vient pas d'un trait qui cerne la forme mais du CONTRASTE ENTRE FACETTES —
 * comme sur un écusson de calandre, où le métal plié renvoie la lumière
 * différemment selon l'inclinaison de chaque plan. C'est ce qui sépare une
 * marque d'un pictogramme : la forme tient seule, sans être soulignée.
 *
 * TROIS POINTES ET NON CINQ. Cinq pointes dans un carré de 24 unités donnent
 * des triangles deux fois plus hauts que larges : à l'écran, ça ne se lit
 * plus comme une couronne mais comme une rangée de piques. Trois pointes
 * larges gardent de la masse, et les creux s'arrêtent à mi-hauteur au lieu de
 * descendre jusqu'au bandeau — sans ça, les pointes se détachent en trois
 * triangles isolés.
 *
 * L'ÉCLAIRAGE EST SYMÉTRIQUE, PAS DIRECTIONNEL. Les deux ailes plongent vers
 * l'axe et sont sombres ; la pointe centrale reste claire, partagée par une
 * arête vive. Une lumière venue d'un seul côté donnerait un objet posé sur
 * une table ; la symétrie donne un logo — c'est la règle de tout emblème.
 *
 * LE JOYAU CENTRAL EST ROUGE, LES DEUX AUTRES BLEUS : le drapeau réduit à
 * trois losanges. C'est le seul rattachement à la marque, et à 13 px c'est
 * aussi le seul détail qui survit — deux points de couleur sur de l'or
 * restent lisibles quand tout le reste est devenu silhouette.
 *
 * LES FACETTES SONT DÉTOURÉES PAR CLIP, pas ajustées à la main. Le tracé de
 * la silhouette sert aussi de masque : les polygones d'ombre débordent
 * volontairement, et le contour reste l'unique source de vérité. Sans ça, la
 * moindre retouche de la silhouette obligerait à recaler chaque facette.
 *
 * `mono` la désature là où la couronne signifie « pas encore » — la carte du
 * plan gratuit.
 */

/** La silhouette : bandeau, deux ailes, une pointe centrale. */
const BODY = "M3.3 14 L2.9 7.6 L7.7 10.9 L12 3.6 L16.3 10.9 L21.1 7.6 L20.7 14 Z";

/** Les deux ailes, débordantes : le clip les recoupe sur la silhouette. */
const WING_L = "M2.9 7.6 L7.7 10.9 L7.7 14.6 L2.4 14.6 Z";
const WING_R = "M21.1 7.6 L16.3 10.9 L16.3 14.6 L21.6 14.6 Z";

/** Le bandeau déborde légèrement de la base : il doit se lire comme une
 *  pièce distincte posée sous les pointes, pas comme leur prolongement. */
const BAND = "M2.9 14 L21.1 14 L20.3 20.7 L3.7 20.7 Z";

/** Un losange : la seule forme de joyau qui reste nette à 13 px. */
const gem = (cx: number, cy: number, w: number, h: number) =>
  `M${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} L${cx - w} ${cy} Z`;

export function CrownIcon({
  size = 20,
  mono = false,
  className = "",
}: {
  /** Côté en pixels CSS. */
  size?: number;
  mono?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
      className={`${mono ? "opacity-45 grayscale" : ""} ${className}`}
      style={{ display: "block" }}
    >
      <defs>
        {/* L'or clair des faces tournées vers l'extérieur. Le passage se fait
            haut dans la forme : une pointe doit s'éclaircir vers son sommet,
            sinon elle paraît tronquée. */}
        <linearGradient id="pv-cr-hi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffeaa6" />
          <stop offset="45%" stopColor="#f6ca47" />
          <stop offset="100%" stopColor="#dfa61c" />
        </linearGradient>
        {/* L'or sombre des ailes. L'écart entre les deux dégradés fait tout le
            relief : trop resserré, l'emblème redevient un aplat. */}
        <linearGradient id="pv-cr-lo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c88b11" />
          <stop offset="100%" stopColor="#8f5d08" />
        </linearGradient>
        <linearGradient id="pv-cr-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffdf85" />
          <stop offset="42%" stopColor="#e5ae28" />
          <stop offset="100%" stopColor="#9c6b0a" />
        </linearGradient>
        <linearGradient id="pv-cr-ruby" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4574a" />
          <stop offset="52%" stopColor="#d0261a" />
          <stop offset="100%" stopColor="#8e1109" />
        </linearGradient>
        <linearGradient id="pv-cr-sapphire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5b93f2" />
          <stop offset="100%" stopColor="#12379c" />
        </linearGradient>
        <clipPath id="pv-cr-clip">
          <path d={BODY} />
        </clipPath>
      </defs>

      <path d={BODY} fill="url(#pv-cr-hi)" />
      <g clipPath="url(#pv-cr-clip)">
        <path d={WING_L} fill="url(#pv-cr-lo)" />
        <path d={WING_R} fill="url(#pv-cr-lo)" />
        {/* L'arête de la pointe centrale : c'est elle qui empêche la pointe
            de se lire comme un triangle plat. */}
        <path d="M11.72 3.6 H12.28 V14 H11.72 Z" fill="#fff6d8" opacity="0.42" />
      </g>

      <path d={BAND} fill="url(#pv-cr-band)" />
      {/* L'arête spéculaire du haut du bandeau : la ligne vive que renvoie
          tout pli de métal, et le seul éclat de l'ensemble. */}
      <path d="M2.9 14 H21.1 L21.02 14.72 H2.98 Z" fill="#fff3cc" opacity="0.6" />

      <path d={gem(12, 17.4, 1.55, 1.95)} fill="url(#pv-cr-ruby)" />
      <path d={gem(7.3, 17.5, 1, 1.25)} fill="url(#pv-cr-sapphire)" />
      <path d={gem(16.7, 17.5, 1, 1.25)} fill="url(#pv-cr-sapphire)" />
    </svg>
  );
}
