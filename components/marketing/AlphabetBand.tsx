const ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

/**
 * Le bandeau d'alphabet cyrillique.
 *
 * Rendu deux fois : la boucle du défilement repose sur une translation de
 * -50 % exactement, ce qui suppose que la seconde moitié soit la copie
 * conforme de la première (voir `.alphabet-track` dans globals.css).
 * `aria-hidden` sur l'ensemble : c'est un décor, et un lecteur d'écran qui
 * épellerait soixante-six lettres serait insupportable.
 */
export default function AlphabetBand() {
  const row = [...ALPHABET];
  return (
    <div aria-hidden className="alphabet-band relative select-none overflow-hidden py-6">
      <div className="alphabet-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {row.map((letter, i) => (
              <span
                key={`${copy}-${i}`}
                className="px-5 font-display text-[34px] font-extrabold leading-none text-muted/25"
              >
                {letter}
              </span>
            ))}
          </div>
        ))}
      </div>
      {/* Un filet tricolore sous la bande : il rattache le décor à la
          marque au lieu de le laisser flotter comme un motif générique. */}
      <div className="flag-bar mx-auto mt-6 h-px w-40 opacity-60" />
    </div>
  );
}
