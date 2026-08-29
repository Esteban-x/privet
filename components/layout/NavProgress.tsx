"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * La barre de chargement en haut de l'écran.
 *
 * LE PROBLÈME QU'ELLE RÉSOUT. Toutes les pages de l'app sont dynamiques :
 * le layout racine lit les cookies pour savoir qui est connecté, ce qui
 * interdit la pré-génération. Next saute donc le préchargement des routes
 * qui n'ont pas de `loading.tsx` (voir la doc `linking-and-navigating`), et
 * un clic sur un lien ne peint STRICTEMENT RIEN tant que le serveur n'a pas
 * répondu — l'ancienne page reste à l'écran, figée. Sur une connexion
 * mobile, l'app paraît alors ne pas avoir enregistré le clic, et on
 * reclique.
 *
 * POURQUOI PAS `useLinkStatus`. C'est l'outil prévu pour ça, mais il ne
 * fonctionne QUE dans un descendant du `<Link>` cliqué : il faudrait le
 * poser dans chaque lien de l'app, y compris les cartes de /exercices, les
 * leçons de /cours et les mots de /vocabulary. Un écouteur unique sur le
 * document couvre les mêmes clics, et surtout ceux qu'on n'a pas encore
 * écrits.
 *
 * ELLE NE REMPLACE PAS `loading.tsx` — les deux se complètent, et c'est
 * l'ordre qui compte : `loading.tsx` rend la navigation INSTANTANÉE (Next
 * précharge le squelette et bascule dessus tout de suite), cette barre ne
 * couvre que le reste, c'est-à-dire l'instant entre le clic et cette
 * bascule. Sur une route pourvue d'un squelette elle ne se voit même pas,
 * grâce au retard de 140 ms ci-dessous.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      // TOUS CES CAS NE NAVIGUENT PAS, et allumer la barre pour eux la
      // laisserait tourner dans le vide : clic droit ou molette, clic avec
      // un modificateur (le navigateur ouvre un onglet et reste ici), lien
      // déjà annulé par un autre gestionnaire, téléchargement, cible
      // externe, ancre vers la page courante.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      setPending(true);
    }

    // En phase de CAPTURE : un lien peut appeler `stopPropagation` dans son
    // propre gestionnaire (les cartes cliquables le font pour ne pas
    // déclencher le clic du parent), et l'événement ne remonterait alors
    // jamais jusqu'au document.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // La route a changé : la nouvelle page est peinte, la barre n'a plus lieu
  // d'être. C'est le seul signal fiable de fin — `usePathname` ne bouge
  // qu'une fois la transition validée par React.
  //
  // Comparé PENDANT LE RENDU et non dans un effet, comme le fait déjà
  // NavBar pour refermer ses menus : un effet qui appelle setState provoque
  // un second rendu en cascade, et la barre resterait visible un cadre de
  // trop — précisément sur la frame où la nouvelle page apparaît.
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    setPending(false);
  }

  // FILET DE SÉCURITÉ. Une navigation peut ne jamais aboutir : redirection
  // du serveur vers la même URL, route qui échoue, réseau coupé. Sans ce
  // délai, la barre resterait allumée jusqu'au prochain clic — c'est-à-dire
  // qu'elle mentirait, ce qui est pire que de ne rien afficher.
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), 12000);
    return () => clearTimeout(timer);
  }, [pending]);

  return <span aria-hidden className={pending ? "nav-progress is-pending" : "nav-progress"} />;
}
