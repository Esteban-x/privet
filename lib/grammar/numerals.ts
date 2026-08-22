// Règle d'accord nom + chiffre cardinal — un des déclencheurs de cas les
// plus caractéristiques du russe, indépendant des prépositions/verbes :
// 1 (et 21, 31…) -> nominatif singulier
// 2-4 (et 22-24, 32-34…) -> génitif singulier
// 0, 5-20, 25-30… -> génitif pluriel
// Exception : 11 à 14 sont TOUJOURS au génitif pluriel (пятнадцать книг),
// même si le nombre se termine visuellement par un chiffre 1-4 dans une
// dizaine supérieure (ex. 111 -> onze au sens russe, génitif pluriel).

export type CountForm = "nom-sg" | "gen-sg" | "gen-pl";

export function countFormFor(n: number): CountForm {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "gen-pl";
  const last = n % 10;
  if (last === 1) return "nom-sg";
  if (last >= 2 && last <= 4) return "gen-sg";
  return "gen-pl";
}

export function randomCountNumber(): number {
  // Échantillon volontairement limité à 1-30 : au-delà, les dizaines
  // rendent l'accord mécanique (même règle que 1-9) sans rien ajouter
  // pédagogiquement, si ce n'est des nombres plus longs à lire.
  return 1 + Math.floor(Math.random() * 30);
}
