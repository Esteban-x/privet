// Forme commune utilisée par les pages d'exercice (cartes, frappe, QCM, voix),
// que le mot vienne d'une liste perso ou d'une liste amorcée depuis un thème
// choisi à l'inscription (voir lib/vocabulary/topics.ts et
// lib/vocabulary/custom.ts) — il n'existe plus de catalogue figé séparé.
export interface VocabItem {
  id: string;
  ru: string;
  transliteration: string;
  fr: string;
  theme: string;
  example?: { ru: string; fr: string };
}
