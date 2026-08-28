/**
 * Le contrat commun des modules d'exercices ajoutés après les cinq
 * premiers.
 *
 * Cas, Mouvement, Aspect, Participes et Adjectif ont chacun leur générateur,
 * leur composant d'entraînement, leur route d'API et leur table — cinq
 * copies d'une même mécanique, qui ne diffèrent que par ce qu'elles
 * demandent. Les modules suivants partagent tout ce qui ne les distingue
 * pas : un exercice est un QCM avec sa consigne, sa phrase, ses options et
 * son explication, et cela suffit à Nombres comme à Conjugaison.
 *
 * Ce qui reste propre à chaque module : la banque, le tirage et la
 * correction. C'est-à-dire exactement ce qui relève du russe.
 */

export interface PracticeExercise {
  /** `skill:item` — le serveur rejoue la correction à partir de lui. */
  itemId: string;
  /** Ce qu'on demande, en une ligne : « Complète », « Quelle heure est-il ? ». */
  prompt: string;
  /** Le corps de la question. `___` marque le trou, s'il y en a un. */
  question: string;
  /** Traduction ou contexte, sous la question. */
  hint?: string;
  /** Étiquette optionnelle : l'information donnée d'avance (genre, personne…). */
  badge?: string;
  options: string[];
  correctIndex: number;
  /** Pourquoi c'est cette réponse — affiché après le choix, jamais avant. */
  explain: string;
}

/** Une compétence, c'est-à-dire un onglet du module. */
export interface Skill {
  id: string;
  title: string;
  level: string;
  summary: string;
}

/** Générateur pseudo-aléatoire injectable, pour que les tests soient reproductibles. */
export type Rng = () => number;

/** Tire un élément d'une liste non vide. */
export function pick<T>(items: readonly T[], random: Rng): T {
  return items[Math.floor(random() * items.length)];
}

/** Mélange une copie de la liste (Fisher-Yates). */
export function shuffle<T>(items: T[], random: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Assemble les options d'un QCM : la bonne réponse, puis des leurres, sans
 * doublon, mélangés.
 *
 * Le dédoublonnage n'est pas cosmétique : deux options identiques rendraient
 * l'exercice insoluble (deux boutons justes, un seul reconnu), et cela
 * arrive dès qu'un leurre coïncide avec la réponse — ce que la déclinaison
 * russe produit régulièrement, le génitif et l'accusatif ayant souvent la
 * même forme.
 */
export function buildOptions(
  correct: string,
  candidates: string[],
  random: Rng,
  count = 4
): { options: string[]; correctIndex: number } {
  const unique: string[] = [];
  for (const candidate of candidates) {
    if (candidate !== correct && !unique.includes(candidate)) unique.push(candidate);
  }
  const options = shuffle([correct, ...unique.slice(0, count - 1)], random);
  return { options, correctIndex: options.indexOf(correct) };
}
