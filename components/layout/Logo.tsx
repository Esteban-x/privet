/**
 * La marque.
 *
 * UN DÉGRADÉ, PAS UN DRAPEAU. Les trois bandes horizontales de la version
 * précédente citaient le drapeau littéralement — trop littéralement : à
 * petite taille ça ressemblait à un sélecteur de langue plutôt qu'à une
 * marque. Ici les mêmes couleurs traversent le carré en diagonale, ce qui
 * garde la référence sans la recopier.
 *
 * LE « П » EST BLANC ET PLEIN, posé par-dessus. Le découper dans le fond
 * (ma version précédente) le rendait dépendant de la couleur de la page :
 * lisible en sombre, il devenait un trou blanc sur blanc en thème clair.
 * Plein, il est le même partout, et c'est lui qu'on reconnaît d'abord.
 *
 * L'ORDRE DES COULEURS SUIT LE DRAPEAU, de haut en bas : le blanc éclaire
 * le coin supérieur, le bleu occupe le corps, le rouge ferme en bas à
 * droite. C'est ce qui fait que la référence se lit même sans y penser.
 *
 * En SVG plutôt qu'en CSS : la lettre doit rester nette à toutes les
 * tailles, favicon comprise, et le dégradé doit être rendu dans le même
 * repère qu'elle.
 */
export default function Logo({
  size = 30,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Privetik"
    >
      <defs>
        {/* TROIS TIERS, PAS UN FONDU. La version précédente plaçait le
            bleu de 26 % à 72 % : il occupait la moitié de la diagonale, et
            comme la lettre couvre le centre, on ne voyait pratiquement que
            lui. Ici chaque couleur tient son tiers et garde une plage
            PLEINE avant de virer — le blanc occupe donc vraiment le coin
            supérieur gauche et le rouge vraiment le coin inférieur droit,
            qui sont les deux zones que la lettre ne cache pas. */}
        {/* ÉTALÉ, PAS SEGMENTÉ. Les paliers pleins de la version précédente
            donnaient trois zones franches — lisible, mais raide, et ça
            citait encore le drapeau au lieu de s'en inspirer. Ici les
            couleurs se fondent en continu sur toute la diagonale, ce qui
            demande de RALLONGER la course : le dégradé part hors du cadre
            (x1/y1 négatifs, x2/y2 au-delà de 1) pour qu'aucune couleur ne
            soit tronquée aux angles. */}
        {/* PLUS COLORÉ, ET SANS PALIER MORT. Le bleu occupait de 30 % à
            62 % à teinte constante : un tiers du carré était un aplat, ce
            qui éteignait le dégradé au centre — là où l'œil se pose. Le
            bleu passe maintenant par une nuance claire puis par le bleu du
            drapeau sans jamais stagner, et le rouge monte plus tôt pour
            être franchement présent. */}
        <linearGradient id="privetik-flag" x1="-0.1" y1="-0.1" x2="1.05" y2="1.1">
          <stop offset="0%" stopColor="var(--flag-white)" />
          <stop offset="18%" stopColor="var(--accent-hi)" />
          <stop offset="46%" stopColor="var(--flag-blue)" />
          <stop offset="74%" stopColor="#8f2a6b" />
          <stop offset="100%" stopColor="var(--flag-red)" />
        </linearGradient>

        {/* Un halo bleu diffus, décalé vers le haut-gauche, et un halo rouge
            vers le bas-droite : ils débordent des paliers et brouillent les
            transitions. C'est ce qui donne la profondeur — le dégradé seul
            reste plat quelle que soit sa douceur. */}
        <radialGradient id="privetik-bloom-b" cx="0.24" cy="0.22" r="0.72">
          <stop offset="0%" stopColor="var(--flag-white)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--flag-white)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="privetik-bloom-r" cx="0.82" cy="0.84" r="0.68">
          <stop offset="0%" stopColor="var(--flag-red)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--flag-red)" stopOpacity="0" />
        </radialGradient>

        {/* Lumière rasante sur l'arête supérieure — la même convention que
            `--edge-light` sur les cartes. Sans elle, le carré est un aplat
            de dégradé ; avec, c'est un objet. */}
        <linearGradient id="privetik-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="32" height="32" rx="8.5" fill="url(#privetik-flag)" />
      <rect x="0" y="0" width="32" height="32" rx="8.5" fill="url(#privetik-bloom-r)" />
      <rect x="0" y="0" width="32" height="32" rx="8.5" fill="url(#privetik-bloom-b)" />
      <rect x="0" y="0" width="32" height="32" rx="8.5" fill="url(#privetik-edge)" />

      <text
        x="16"
        y="16.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Privetik Cyrillic', Inter, system-ui, sans-serif"
        fontSize="18"
        fontWeight="800"
        fill="#fff"
        style={{ paintOrder: "stroke" }}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.6"
      >
        П
      </text>
    </svg>
  );
}
