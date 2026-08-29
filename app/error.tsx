"use client";

import Link from "next/link";
import { useEffect } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * L'écran d'une erreur non rattrapée.
 *
 * CE N'EST PAS UNE 404. La page introuvable dit « tu cherches quelque chose
 * qui n'existe pas » et s'en amuse ; celle-ci dit « ce que tu cherches
 * existe, et c'est nous qui avons échoué ». Le ton doit être différent :
 * pas de leçon de russe ici, pas de clin d'œil — quelqu'un vient de perdre
 * ce qu'il faisait.
 *
 * ELLE PROPOSE DE RÉESSAYER EN PREMIER, et ce n'est pas de la politesse.
 * `reset()` refait le rendu du segment fautif sans recharger la page : une
 * erreur passagère — une requête qui a expiré, une réponse tronquée — se
 * répare vraiment d'un clic, et c'est le cas le plus fréquent. Renvoyer
 * d'emblée vers l'accueil ferait perdre le contexte pour rien.
 *
 * LE `digest` EST MONTRÉ. Next remplace le message d'erreur réel par un
 * condensé en production, pour ne pas exposer la trace serveur — c'est la
 * bonne décision, mais elle laisse l'utilisateur sans rien à citer quand il
 * écrit. Ce code est la seule chose qui relie son message à une ligne de
 * journal ; le cacher, c'est se condamner à des rapports du type « ça
 * marche pas ».
 *
 * Ce fichier ne couvre PAS une erreur du layout racine lui-même : il vit à
 * l'intérieur de ce layout. Ce cas-là appelle app/global-error.tsx.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // La console du navigateur est le seul endroit où l'erreur complète
    // reste lisible en production : la trace serveur, elle, n'arrive jamais
    // jusqu'ici. Sans cette ligne, un incident reproductible chez un
    // utilisateur ne laisse aucune prise, même en partage d'écran.
    console.error("Erreur non rattrapée :", error);
  }, [error]);

  return (
    <div className="relative overflow-x-clip">
      {/* La même lumière d'ambiance que le reste du site, mais sans le rouge
          du drapeau : ici il se lirait comme un signal d'alarme. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="glow -top-24 left-[12%] h-[360px] w-[360px]"
          style={{ background: "color-mix(in oklab, var(--flag-blue) 16%, transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-24">
        <SectionLabel color="accent2">Erreur</SectionLabel>

        <h1 className="font-display text-[clamp(1.75rem,5vw,2.5rem)] font-extrabold leading-tight tracking-tight">
          Quelque chose n&apos;a pas fonctionné
        </h1>

        <p className="mt-4 max-w-xl font-display leading-relaxed text-muted">
          L&apos;erreur vient de nous, pas de ce que tu as fait. Elle est souvent passagère :
          réessayer suffit dans la plupart des cas, et tu reprends là où tu en étais.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="btn btn-primary btn-sheen rounded-xl px-6 py-3 font-display text-sm font-bold"
          >
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="btn btn-outline rounded-xl px-6 py-3 font-display text-sm font-semibold text-text"
          >
            Retour au tableau de bord
          </Link>
        </div>

        {/* Ce qui reste quand réessayer ne suffit pas. Discret, mais présent :
            c'est la seule chose exploitable dans un message de signalement. */}
        <div className="surface mt-9 rounded-[18px] p-5">
          <p className="font-display text-xs font-bold uppercase tracking-[0.08em] text-muted">
            Si cela se reproduit
          </p>
          <p className="mt-2 font-display text-sm leading-relaxed text-muted">
            Recharge la page entièrement. Si l&apos;erreur revient, écris-nous en citant le code
            ci-dessous — c&apos;est lui qui permet de retrouver ce qui s&apos;est passé.
          </p>
          {error.digest ? (
            <p className="mt-3 select-all rounded-lg bg-bg3 px-3 py-2 font-mono text-xs text-text">
              {error.digest}
            </p>
          ) : (
            <p className="mt-3 font-display text-xs italic text-muted">
              Aucun code n&apos;a été produit pour cette erreur — précise alors la page et
              l&apos;heure.
            </p>
          )}

          <Link
            href="/cours"
            className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-accent-ink hover:underline"
          >
            En attendant, reprendre le cours
            <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
