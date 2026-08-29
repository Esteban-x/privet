export type Theme = "light" | "dark";

export const THEME_KEY = "ru-app:theme";

/**
 * Le script anti-flash, injecté tel quel dans le <head>.
 *
 * POURQUOI IL DOIT ÊTRE LÀ, ET BLOQUANT. La préférence vit dans
 * localStorage, que le serveur ne peut pas lire : le HTML part donc
 * toujours avec le thème par défaut. Si on corrigeait après l'hydratation
 * de React, quelqu'un ayant choisi le clair verrait une page noire pendant
 * 200 ms à chaque navigation — le fameux « flash of wrong theme », et
 * l'un des rares défauts qu'un visiteur remarque consciemment.
 *
 * Ce script s'exécute avant le premier rendu et pose l'attribut sur <html>,
 * que le CSS lit immédiatement. Il est volontairement minuscule et
 * enfermé dans un try/catch : localStorage lève en navigation privée sur
 * certains navigateurs, et une erreur ici bloquerait l'affichage de toute
 * la page.
 *
 * Aucun attribut posé = aucune préférence exprimée = les blocs
 * `prefers-color-scheme` de globals.css décident. C'est voulu.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

/**
 * Événement interne émis à chaque bascule.
 *
 * POURQUOI PAS UN ÉTAT REACT PARTAGÉ. Le thème vit sur <html>, posé par un
 * script qui s'exécute avant React — c'est un état EXTERNE. Le lire dans un
 * `useEffect` reviendrait à en garder une copie qui peut diverger, et à
 * poser un setState dans le corps d'un effet (rendus en cascade). Avec cet
 * événement, `useSyncExternalStore` s'abonne à la source réelle.
 */
const THEME_EVENT = "privetik:theme";

/** S'abonne aux deux sources de vérité : le choix explicite et le système. */
export function subscribeTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

/**
 * Le thème rendu côté serveur, faute de pouvoir lire ni localStorage ni la
 * préférence système.
 *
 * CLAIR, ET C'EST UN PARI CALCULÉ. `prefers-color-scheme: light` est vrai
 * pour qui préfère le clair ET pour qui n'a jamais rien réglé — la valeur
 * `no-preference` a disparu de la spécification. La majorité des visiteurs
 * voit donc le thème clair, et parier « sombre » ici faisait afficher la
 * mauvaise icône au ThemeToggle jusqu'à l'hydratation, avec la bascule
 * visible qui va avec.
 *
 * Ce choix ne concerne QUE cet instantané serveur : la page elle-même est
 * peinte par les règles `prefers-color-scheme` de globals.css, évaluées
 * avant le premier rendu. Rien ne clignote de ce côté-là.
 */
export function serverTheme(): Theme {
  return "light";
}

/** Le thème effectivement appliqué, préférence système comprise. */
export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Applique un thème et le mémorise.
 *
 * La classe `theme-switching` n'est posée QUE le temps de la bascule : elle
 * active une transition sur les couleurs (voir globals.css). La laisser en
 * permanence ferait fondre les couleurs à chaque changement de page, ce qui
 * donne une impression de lenteur générale.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Stockage refusé : le thème s'applique quand même pour cette visite.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
  window.setTimeout(() => root.classList.remove("theme-switching"), 250);
}
