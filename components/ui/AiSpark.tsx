/**
 * La marque « c'est l'IA qui parle ».
 *
 * Un seul symbole pour tout ce que le modèle produit — explication d'un mot,
 * traduction proposée, phrase générée. Jusqu'ici chaque endroit choisissait
 * son émoji (✦, ✨, ✏️) : impossible pour l'apprenant d'apprendre à
 * reconnaître d'un coup d'œil ce qui vient d'un dictionnaire vérifié et ce
 * qui vient d'un modèle faillible.
 *
 * Deux étoiles à quatre branches, la petite en écho : dessin reconnaissable
 * à 14 px comme à 32, et qui ne se confond avec aucun autre pictogramme de
 * l'app.
 */
export default function AiSpark({
  className = "h-4 w-4",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={className}
    >
      {title && <title>{title}</title>}
      {/* Grande étoile : les côtés concaves lui donnent son éclat. */}
      <path d="M13.6 2.6a.9.9 0 0 0-1.7 0l-1.2 3.9a5.6 5.6 0 0 1-3.6 3.6l-3.9 1.2a.9.9 0 0 0 0 1.7l3.9 1.2a5.6 5.6 0 0 1 3.6 3.6l1.2 3.9a.9.9 0 0 0 1.7 0l1.2-3.9a5.6 5.6 0 0 1 3.6-3.6l3.9-1.2a.9.9 0 0 0 0-1.7l-3.9-1.2a5.6 5.6 0 0 1-3.6-3.6z" />
      {/* Petite étoile en écho, en haut à droite. */}
      <path
        d="M19.4 1.2a.4.4 0 0 1 .8 0l.4 1.3c.2.6.6 1 1.2 1.2l1.3.4a.4.4 0 0 1 0 .8l-1.3.4c-.6.2-1 .6-1.2 1.2l-.4 1.3a.4.4 0 0 1-.8 0l-.4-1.3a2.1 2.1 0 0 0-1.2-1.2l-1.3-.4a.4.4 0 0 1 0-.8l1.3-.4c.6-.2 1-.6 1.2-1.2z"
        opacity="0.75"
      />
    </svg>
  );
}
