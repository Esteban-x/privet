export interface GlossedWord {
  ru: string; // tel qu'affiché (avec ponctuation collée si besoin)
  gloss?: string; // traduction au survol/clic ; absent = ponctuation
}

export interface ReadingText {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1";
  sentences: GlossedWord[][];
}

export const READING_TEXTS: ReadingText[] = [
  {
    id: "moya-semya",
    title: "Моя семья",
    level: "A1",
    sentences: [
      [
        { ru: "Меня", gloss: "moi (accusatif)" },
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
        { ru: "школе.", gloss: "école (prépositionnel)" },
      ],
      [
        { ru: "Моя", gloss: "ma" },
        { ru: "мать", gloss: "mère" },
        { ru: "читает", gloss: "lit" },
        { ru: "книгу", gloss: "livre (accusatif)" },
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
        { ru: "магазин.", gloss: "magasin (accusatif)" },
      ],
      [
        { ru: "В", gloss: "dans" },
        { ru: "магазине", gloss: "magasin (prépositionnel)" },
        { ru: "много", gloss: "beaucoup" },
        { ru: "людей.", gloss: "de gens (génitif pluriel)" },
      ],
      [
        { ru: "Я", gloss: "je" },
        { ru: "покупаю", gloss: "j'achète" },
        { ru: "хлеб", gloss: "pain (accusatif)" },
        { ru: "и", gloss: "et" },
        { ru: "молоко.", gloss: "lait (accusatif)" },
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
