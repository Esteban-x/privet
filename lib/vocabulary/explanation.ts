/**
 * Explication IA d'un mot de vocabulaire.
 *
 * Ce que l'IA produit ici est du COMMENTAIRE — nuance de sens, registre,
 * pièges pour un francophone — et non une forme fléchie ni une correction.
 * C'est la différence avec le module Cas, où toute affirmation
 * grammaticale passe par le dictionnaire : ici il n'y a rien à recalculer,
 * seulement une structure à faire respecter et un affichage à assumer comme
 * généré (le composant le dit explicitement).
 *
 * Le peu qui SOIT vérifiable l'est quand même : un exemple doit contenir le
 * mot expliqué, faute de quoi il illustre autre chose et l'apprenant
 * mémorise une phrase hors sujet. Les exemples fautifs sont retirés.
 */

export interface WordExample {
  ru: string;
  fr: string;
}

export interface WordExplanation {
  /** Sens et nuance, en français, deux ou trois phrases. */
  meaning: string;
  /** Nature : nom, verbe, adjectif… */
  partOfSpeech: string;
  /** Registre d'emploi : courant, familier, soutenu, technique… */
  register: string;
  /** Phrases d'exemple, russe + traduction. */
  examples: WordExample[];
  /** Expressions et associations habituelles du mot. */
  collocations: string[];
  /** Mots proches et ce qui les distingue, en une ligne chacun. */
  related: string[];
  /** Piège pour un francophone : faux-ami, rection, aspect. Facultatif. */
  pitfall?: string;
}

function cleanString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanList(value: unknown, max: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => cleanString(v, maxLength))
    .filter((v) => v.length > 0)
    .slice(0, max);
}

/** Racine approximative : le mot apparaît fléchi dans ses exemples. */
function stemOf(word: string): string {
  const bare = word.trim().toLowerCase().split(/\s+/)[0] ?? "";
  // Deux caractères ôtés couvrent l'essentiel des désinences nominales et
  // verbales sans devenir trop permissif sur un mot court.
  return bare.length > 4 ? bare.slice(0, bare.length - 2) : bare;
}

/**
 * Valide et nettoie la réponse du modèle. Renvoie `null` si l'essentiel
 * manque — mieux vaut ne rien afficher qu'une fiche vide.
 */
export function toWordExplanation(raw: unknown, wordRu: string): WordExplanation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const meaning = cleanString(r.meaning, 600);
  if (meaning.length < 10) return null;

  const stem = stemOf(wordRu);
  const examples: WordExample[] = (Array.isArray(r.examples) ? r.examples : [])
    .map((e) => {
      const item = (e ?? {}) as Record<string, unknown>;
      return { ru: cleanString(item.ru, 200), fr: cleanString(item.fr, 200) };
    })
    .filter((e) => e.ru.length > 0 && e.fr.length > 0)
    // Le seul contrôle de fond possible : l'exemple emploie bien le mot.
    .filter((e) => stem.length === 0 || e.ru.toLowerCase().includes(stem))
    .slice(0, 3);

  return {
    meaning,
    partOfSpeech: cleanString(r.partOfSpeech, 40),
    register: cleanString(r.register, 40),
    examples,
    collocations: cleanList(r.collocations, 5, 120),
    related: cleanList(r.related, 5, 160),
    pitfall: cleanString(r.pitfall, 400) || undefined,
  };
}
