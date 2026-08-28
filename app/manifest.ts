import type { MetadataRoute } from "next";

/**
 * Le manifeste d'application installable.
 *
 * CE QU'IL CHANGE. Sans lui, « Ajouter à l'écran d'accueil » crée un simple
 * marque-page : l'app s'ouvre dans le navigateur, avec sa barre d'adresse,
 * son bouton de partage et ses onglets. Avec lui, elle s'ouvre en plein
 * écran sous son propre nom et sa propre icône — et le bandeau d'onglets du
 * bas, qui a été dessiné pour ça, cesse d'être une imitation d'application
 * pour en devenir une.
 *
 * `start_url` POINTE SUR LE TABLEAU DE BORD, pas sur l'accueil. Quelqu'un
 * qui installe l'app a déjà un compte : le renvoyer sur la page de vente à
 * chaque ouverture serait absurde. S'il n'est pas connecté, proxy.ts le mène
 * à /login, ce qui est exactement ce qu'il faut faire.
 *
 * PAS DE `orientation` IMPOSÉE. Verrouiller en portrait casse la lecture sur
 * tablette et sur un téléphone posé à l'horizontale — pour un contenu qui
 * est d'abord du texte et des tableaux, c'est une gêne sans contrepartie.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Privetik — apprendre le russe",
    // Ce qui s'affiche SOUS l'icône, sur l'écran d'accueil : douze
    // caractères environ avant que le système ne coupe. « Privetik » seul.
    short_name: "Privetik",
    description:
      "Cours de russe, exercices de déclinaison corrigés par un moteur de règles, et " +
      "vocabulaire en répétition espacée.",
    lang: "fr",
    dir: "ltr",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    categories: ["education"],

    // LE FOND DE L'ÉCRAN DE DÉMARRAGE, celui que le système peint pendant
    // que l'app charge. Il ne peut pas suivre le thème — le manifeste est lu
    // à l'installation, une fois — donc on prend le fond sombre, qui est le
    // défaut de l'app et celui qui supporte le mieux d'être vu une demi-
    // seconde. La couleur de la barre système, elle, suit bien le thème :
    // voir `themeColor` dans app/layout.tsx.
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",

    icons: [
      // `any` : l'icône telle quelle, coins arrondis compris. Utilisée par
      // les systèmes qui n'appliquent pas de masque (bureau, favoris).
      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // `maskable` : fond bord à bord, dessin dans les 80 % centraux. C'est
      // celle qu'Android recadre à sa forme — voir scripts/build-brand.mjs.
      {
        src: "/logo-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    /**
     * Ce qu'un appui long sur l'icône propose.
     *
     * Trois entrées, et ce sont les trois GESTES quotidiens, pas les trois
     * rubriques principales : on n'ouvre pas une app de langue pour
     * consulter un sommaire, on l'ouvre pour réviser ses mots ou faire sa
     * série d'exercices. « Cours » n'y est pas pour cette raison.
     */
    shortcuts: [
      {
        name: "Réviser mon vocabulaire",
        short_name: "Réviser",
        url: "/vocabulary/review",
        icons: [{ src: "/logo-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Faire des exercices",
        short_name: "Exercices",
        url: "/exercices",
        icons: [{ src: "/logo-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Voir ma progression",
        short_name: "Progrès",
        url: "/dashboard",
        icons: [{ src: "/logo-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
