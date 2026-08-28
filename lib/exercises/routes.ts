/**
 * Les routes des modules d'exercices, sans aucune dépendance.
 *
 * La barre de navigation a besoin de savoir si l'on se trouve dans un
 * module pour éclairer l'entrée « Exercices ». Elle ne peut pas lire
 * lib/exercises/catalog.ts pour autant : c'est un composant client, et ce
 * catalogue importe toutes les banques d'exercices — la barre embarquerait
 * les verbes, les noms et les contextes dans le bundle de chaque page.
 *
 * Cette liste est donc recopiée, et `npm run check:exercises` vérifie
 * qu'elle correspond exactement au catalogue. Une copie vérifiée par script
 * vaut mieux qu'un import qui coûte cent kilo-octets à chaque écran.
 */
export const EXERCISE_ROUTES = [
  "/exercices",
  "/alphabet",
  "/cases",
  "/adjectives",
  "/conjugation",
  "/aspect",
  "/motion",
  "/participles",
  "/numbers",
];
