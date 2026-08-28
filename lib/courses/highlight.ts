/**
 * Surlignage des termes trouvés, à travers la normalisation.
 *
 * La recherche compare du texte normalisé (minuscules, sans accents) : les
 * positions qu'elle trouve ne correspondent donc pas à celles du texte
 * affiché — « déclinaison » et « declinaison » n'ont même pas la même
 * longueur une fois décomposés. On construit donc la chaîne normalisée AVEC
 * la carte de ses indices d'origine, ce qui permet de resurligner
 * exactement les caractères réellement affichés, accents toniques russes
 * compris.
 */

export interface NormalizedText {
  norm: string;
  /** map[i] = index, dans le texte d'origine, du i-ième caractère normalisé. */
  map: number[];
}

export function normalizeWithMap(text: string): NormalizedText {
  let norm = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const decomposed = text[i].toLowerCase().normalize("NFD");
    for (const char of decomposed) {
      // Marques combinantes (accent tonique russe U+0301 compris) : retirées.
      if (char >= "̀" && char <= "ͯ") continue;
      norm += char;
      map.push(i);
    }
  }
  return { norm, map };
}

export interface HighlightPart {
  text: string;
  hit: boolean;
}

/**
 * Découpe `text` en morceaux surlignés ou non, pour les termes donnés
 * (déjà normalisés). Les intervalles qui se chevauchent sont fusionnés :
 * chercher « cas casse » ne doit pas produire deux marques imbriquées.
 */
export function highlightParts(text: string, terms: string[]): HighlightPart[] {
  const usable = terms.filter((t) => t.length > 0);
  if (usable.length === 0) return [{ text, hit: false }];

  const { norm, map } = normalizeWithMap(text);
  const ranges: [number, number][] = [];
  for (const term of usable) {
    let from = norm.indexOf(term);
    while (from !== -1) {
      const start = map[from];
      const end = map[from + term.length - 1];
      if (start !== undefined && end !== undefined) ranges.push([start, end + 1]);
      from = norm.indexOf(term, from + term.length);
    }
  }
  if (ranges.length === 0) return [{ text, hit: false }];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }

  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), hit: false });
    parts.push({ text: text.slice(start, end), hit: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
  return parts;
}
