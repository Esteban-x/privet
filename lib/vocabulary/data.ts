// Forme commune utilisée par les pages d'exercice (cartes, frappe, QCM, voix).
// Tous les mots viennent des listes créées par l'utilisateur (voir
// lib/vocabulary/custom.ts) — il n'existe pas de catalogue figé séparé.
export interface VocabItem {
  id: string;
  ru: string;
  transliteration: string;
  fr: string;
  theme: string;
  example?: { ru: string; fr: string };
}
