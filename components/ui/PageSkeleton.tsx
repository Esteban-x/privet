/**
 * Le squelette générique des `loading.tsx`.
 *
 * POURQUOI CE FICHIER EXISTE. Toutes les pages de l'app sont dynamiques —
 * le layout racine lit les cookies de session — et Next NE PRÉCHARGE PAS
 * une route dynamique dépourvue de `loading.tsx` : le clic reste alors sans
 * effet visible jusqu'à la réponse du serveur. Poser un squelette rend la
 * bascule immédiate (Next précharge le squelette et l'affiche pendant que
 * la page se rend), ce qui est la vraie correction ; la barre de
 * progression (NavProgress) ne couvre que ce qui reste.
 *
 * IL EST GÉNÉRIQUE, ET C'EST ASSUMÉ. Un squelette n'a pas à être le calque
 * exact de la page : il doit en annoncer la FORME — un en-tête, puis une
 * grille, ou un texte, ou une carte d'exercice — pour que l'œil sache où se
 * poser. Un fac-similé par route aurait coûté seize fichiers à maintenir en
 * regard de seize pages qui bougent, pour un gain d'un dixième de seconde
 * d'anticipation. Les trois pages dont la mise en page est vraiment
 * singulière (tableau de bord, les six cas, lecture) gardent le leur, écrit
 * à la main.
 */

type Variant =
  /** Une page de listes : catalogue d'exercices, index des cours, guides. */
  | "hub"
  /** Une page de lecture : une leçon, un guide. */
  | "prose"
  /** Une page d'entraînement : l'en-tête, puis une grande carte unique. */
  | "practice";

export default function PageSkeleton({
  variant = "hub",
  /** Largeur du conteneur, alignée sur celle de la vraie page. */
  width = "max-w-5xl",
}: {
  variant?: Variant;
  width?: string;
}) {
  return (
    <div className={`mx-auto ${width} px-6 py-8 sm:py-12`}>
      {/* L'en-tête est commun aux trois : surtitre, titre, chapô. C'est la
          partie qui ne bouge jamais d'une page à l'autre. */}
      <div className="skeleton h-3 w-20 rounded-full" />
      <div className="skeleton mt-3 h-9 w-80 max-w-full rounded-lg" />
      <div className="skeleton mt-4 h-4 w-full max-w-2xl rounded-lg" />
      <div className="skeleton mt-2 h-4 w-2/3 max-w-xl rounded-lg" />

      {variant === "hub" && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-2xl surface p-6">
              <div className="skeleton h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded-full" />
                <div className="skeleton h-5 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "prose" && (
        <div className="mt-10 space-y-8">
          {Array.from({ length: 3 }).map((_, block) => (
            <div key={block} className="space-y-2.5">
              <div className="skeleton h-6 w-56 max-w-full rounded-lg" />
              {/* Des longueurs inégales : quatre barres de largeur
                  identique se lisent comme un tableau, pas comme un
                  paragraphe. */}
              {["100%", "96%", "98%", "72%"].map((w, i) => (
                <div key={i} className="skeleton h-3.5 rounded-md" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {variant === "practice" && (
        <div className="mt-10 rounded-[20px] surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="skeleton h-3 w-28 rounded-full" />
            <div className="skeleton h-3 w-16 rounded-full" />
          </div>
          <div className="skeleton mt-3 h-2 w-full rounded-full" />

          <div className="skeleton mt-8 h-8 w-64 max-w-full rounded-lg" />
          <div className="skeleton mt-3 h-4 w-48 max-w-full rounded-lg" />

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
