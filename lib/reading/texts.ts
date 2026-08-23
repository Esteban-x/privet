import type { CaseId } from "@/lib/grammar/types";
import type { CefrLevel } from "@/lib/supabase/types";

export interface GlossedWord {
  ru: string; // tel qu'affiché (avec ponctuation collée si besoin)
  gloss?: string; // traduction au survol/clic ; absent = ponctuation
  // Cas grammatical porté par ce mot (nom/adjectif/pronom décliné), absent
  // pour tout ce qui n'en marque pas (verbes, invariables, ponctuation) —
  // sert au surlignage couleur pendant la lecture (voir ReadingPassage),
  // en réutilisant la même palette que le module /cases (lib/grammar/cases.ts).
  case?: CaseId;
  /**
   * État de vérification du tag de cas (voir lib/reading/verify-cases.ts) :
   * "confirmed" = la forme est dans la banque et le cas est compatible,
   * "unverified" = le mot n'y est pas, l'analyse reste celle de l'IA.
   * Un tag CONTREDIT par la banque est retiré, il n'arrive jamais ici.
   */
  caseStatus?: "confirmed" | "unverified";
}

export interface ReadingText {
  id: string;
  title: string;
  level: CefrLevel;
  sentences: GlossedWord[][];
  /**
   * Bilan de la vérification des cas, présent sur les textes générés par
   * l'IA (voir lib/reading/verify-cases.ts). Affiché dans la légende pour
   * que l'apprenant sache ce qui a été contrôlé et ce qui ne l'a pas été.
   */
  caseCheck?: { confirmed: number; contradicted: number; unverified: number };
}

export const READING_TEXTS: ReadingText[] = [
  {
    id: "moya-semya",
    title: "Моя семья",
    level: "A1",
    sentences: [
      [
        { ru: "Меня", gloss: "moi (accusatif)", case: "accusative" },
        { ru: "зовут", gloss: "on appelle" },
        { ru: "Анна.", gloss: "Anna" },
      ],
      [
        { ru: "У", gloss: "chez / à" },
        { ru: "меня", gloss: "moi" },
        { ru: "есть", gloss: "il y a" },
        { ru: "семья.", gloss: "famille" },
      ],
      [
        { ru: "Мой", gloss: "mon" },
        { ru: "отец", gloss: "père" },
        { ru: "работает", gloss: "travaille" },
        { ru: "в", gloss: "à/dans" },
        { ru: "школе.", gloss: "école (prépositionnel)", case: "prepositional" },
      ],
      [
        { ru: "Моя", gloss: "ma" },
        { ru: "мать", gloss: "mère" },
        { ru: "читает", gloss: "lit" },
        { ru: "книгу", gloss: "livre (accusatif)", case: "accusative" },
        { ru: "каждый", gloss: "chaque" },
        { ru: "вечер.", gloss: "soir" },
      ],
    ],
  },
  {
    id: "v-gorode",
    title: "В городе",
    level: "A2",
    sentences: [
      [
        { ru: "Сегодня", gloss: "aujourd'hui" },
        { ru: "я", gloss: "je" },
        { ru: "иду", gloss: "je vais (à pied)" },
        { ru: "в", gloss: "à/dans" },
        { ru: "магазин.", gloss: "magasin (accusatif)", case: "accusative" },
      ],
      [
        { ru: "В", gloss: "dans" },
        { ru: "магазине", gloss: "magasin (prépositionnel)", case: "prepositional" },
        { ru: "много", gloss: "beaucoup" },
        { ru: "людей.", gloss: "de gens (génitif pluriel)", case: "genitive" },
      ],
      [
        { ru: "Я", gloss: "je" },
        { ru: "покупаю", gloss: "j'achète" },
        { ru: "хлеб", gloss: "pain (accusatif)", case: "accusative" },
        { ru: "и", gloss: "et" },
        { ru: "молоко.", gloss: "lait (accusatif)", case: "accusative" },
      ],
      [
        { ru: "Потом", gloss: "ensuite" },
        { ru: "я", gloss: "je" },
        { ru: "иду", gloss: "je vais" },
        { ru: "домой.", gloss: "à la maison" },
      ],
    ],
  },
];

export function getReadingText(id: string) {
  return READING_TEXTS.find((t) => t.id === id);
}
