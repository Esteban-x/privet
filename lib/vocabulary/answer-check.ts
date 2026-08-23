/**
 * Comparaison réponse ↔ attendu pour les exercices de vocabulaire.
 *
 * Isomorphe et sans dépendance : le serveur s'en sert pour JUGER
 * (app/api/vocab/answer), le client uniquement pour afficher un retour
 * immédiat. Le verdict qui compte — celui qui alimente le SRS, la série et
 * l'XP — est toujours celui du serveur, comme dans /api/cases/attempt.
 */

/**
 * Tolérant aux accents français (café/cafe, garçon/garcon) : ce mode peut
 * attendre une réponse française sans clavier AZERTY à disposition, et un
 * accent oublié n'est pas une faute de vocabulaire. La décomposition NFD
 * sépare aussi « ё » en « е » + accent, donc le remplacement explicite est
 * redondant mais gardé par clarté.
 */
export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Articles français en tête de traduction : « le livre » vaut « livre ». */
const FRENCH_ARTICLE = /^(?:l'|le |la |les |un |une |des |du |de la |de l')/;

function stripArticle(s: string): string {
  return s.replace(FRENCH_ARTICLE, "").trim();
}

/**
 * Variantes acceptables d'un attendu. Une traduction est souvent écrite
 * « voiture, auto » ou « parler / dire » : chaque branche est une réponse
 * juste, et n'accepter que la chaîne entière punirait quelqu'un qui connaît
 * le mot. Les parenthèses (« aller (à pied) ») sont traitées comme
 * facultatives.
 */
export function answerVariants(expected: string): string[] {
  const variants = new Set<string>();
  for (const part of expected.split(/[,;/]|\bou\b/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    // Trois lectures d'une précision entre parenthèses : « aller (à pied) »
    // accepte « aller (à pied) », « aller à pied » et « aller » — les trois
    // sont la réponse de quelqu'un qui connaît le mot.
    const withParens = normalizeAnswer(trimmed);
    const parensOpened = normalizeAnswer(trimmed.replace(/[()]/g, " "));
    const withoutParens = normalizeAnswer(trimmed.replace(/\([^)]*\)/g, " "));
    for (const v of [withParens, parensOpened, withoutParens]) {
      if (!v) continue;
      variants.add(v);
      const bare = stripArticle(v);
      if (bare) variants.add(bare);
    }
  }
  return [...variants];
}

/** Vrai si la réponse correspond à l'attendu ou à l'une de ses variantes. */
export function matchesAnswer(userAnswer: string, expected: string): boolean {
  const given = normalizeAnswer(userAnswer);
  if (!given) return false;
  const bare = stripArticle(given);
  const variants = answerVariants(expected);
  return variants.includes(given) || (bare.length > 0 && variants.includes(bare));
}
