"use client";

import { useRef, useState } from "react";

/**
 * Le lecteur de la vidéo de présentation.
 *
 * IL EST CONÇU POUR VIVRE SANS VIDÉO. Tant que `src` est absente, il rend
 * une affiche soignée avec un bouton désactivé : la page reste complète et
 * intentionnelle, au lieu d'exhiber un trou ou un cadre noir. Le jour où le
 * fichier existe, il suffit de passer `src` — aucune autre modification.
 *
 * IL NE COÛTE RIEN AVANT LE CLIC. `preload="none"` : le navigateur ne
 * télécharge pas un octet de la vidéo tant que personne ne l'a demandée.
 * Sur une page d'accueil, une vidéo préchargée est souvent le poste le plus
 * lourd du chargement — et la majorité des visiteurs ne la regardent pas.
 *
 * L'AFFICHE EST UN VRAI ÉLÉMENT, pas l'attribut `poster` de <video>. Celui
 * du navigateur ne se stylise pas, ne s'anime pas, et affiche des contrôles
 * natifs disparates d'un navigateur à l'autre. Ici l'affiche est du HTML :
 * elle se fond au clic et laisse la vidéo prendre sa place.
 */
export default function VideoPlayer({
  src,
  poster,
  label = "Voir Privetik en deux minutes",
}: {
  /** Absente = affiche seule, bouton désactivé. */
  src?: string;
  poster?: string;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function start() {
    if (!src) return;
    setPlaying(true);
    // Le <video> n'existe qu'une fois `playing` vrai : on attend donc la
    // peinture suivante pour lui demander de jouer.
    requestAnimationFrame(() => void videoRef.current?.play().catch(() => {}));
  }

  return (
    <div className="relative">
      {/* Halos posés derrière le cadre : ils débordent volontairement, ce
          qui donne l'impression que l'écran éclaire la page autour de lui. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow glow-accent -left-16 top-8 h-64 w-64" />
        <div className="glow glow-accent2 -right-12 bottom-0 h-56 w-56" />
      </div>

      <div className="surface relative aspect-video w-full overflow-hidden rounded-[22px]">
        {playing && src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            playsInline
            preload="none"
            className="h-full w-full bg-black object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={!src}
            aria-label={src ? label : "Vidéo de présentation à venir"}
            className="group relative block h-full w-full disabled:cursor-default"
          >
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                style={{ transitionTimingFunction: "var(--ease)" }}
              />
            ) : (
              /* Sans affiche : un fond dessiné plutôt qu'un rectangle vide.
                 Le dégradé et la grille suffisent à ce que le cadre ait
                 l'air choisi, pas oublié. */
              <div className="absolute inset-0 bg-gradient-to-br from-bg3 via-bg2 to-bg">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.55]"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    maskImage: "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                  }}
                />
                <span
                  aria-hidden
                  className="animate-float absolute left-[12%] top-[18%] select-none font-display text-[110px] font-extrabold leading-none text-accent opacity-[0.08]"
                >
                  Ж
                </span>
                <span
                  aria-hidden
                  className="animate-float-slow absolute bottom-[12%] right-[14%] select-none font-display text-[90px] font-extrabold leading-none text-accent2 opacity-[0.08]"
                >
                  Я
                </span>
              </div>
            )}

            {/* Voile sombre en bas seulement : il assoit le bouton et le
                libellé sans ternir l'image entière. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span
                className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform duration-300 ${
                  src ? "bg-accent shadow-glow group-hover:scale-110" : "bg-bg3 ring-1 ring-border"
                }`}
                style={{ transitionTimingFunction: "var(--ease)" }}
              >
                {/* Anneau qui respire, uniquement quand il y a quelque chose
                    à lire : sur un bouton inerte, ce serait mentir. */}
                {src && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full bg-accent/30"
                  />
                )}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`relative ml-1 h-7 w-7 ${src ? "text-white" : "text-muted"}`}
                >
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>

              <span className="font-display text-sm font-semibold text-text/90">
                {src ? label : "Vidéo de présentation — bientôt"}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
