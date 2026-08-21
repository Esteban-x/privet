export interface VocabItem {
  id: string;
  ru: string;
  transliteration: string;
  fr: string;
  theme: string;
  example?: { ru: string; fr: string };
}

export const VOCAB: VocabItem[] = [
  // Salutations
  { id: "v001", ru: "привет", transliteration: "privet", fr: "salut", theme: "Salutations" },
  { id: "v002", ru: "здравствуйте", transliteration: "zdravstvuyte", fr: "bonjour (formel)", theme: "Salutations" },
  { id: "v003", ru: "спасибо", transliteration: "spasibo", fr: "merci", theme: "Salutations" },
  { id: "v004", ru: "пожалуйста", transliteration: "pozhaluysta", fr: "s'il vous plaît / je vous en prie", theme: "Salutations" },
  { id: "v005", ru: "до свидания", transliteration: "do svidaniya", fr: "au revoir", theme: "Salutations" },
  { id: "v006", ru: "извините", transliteration: "izvinite", fr: "excusez-moi", theme: "Salutations" },

  // Famille
  { id: "v010", ru: "семья", transliteration: "sem'ya", fr: "famille", theme: "Famille" },
  { id: "v011", ru: "мать", transliteration: "mat'", fr: "mère", theme: "Famille" },
  { id: "v012", ru: "отец", transliteration: "otets", fr: "père", theme: "Famille" },
  { id: "v013", ru: "брат", transliteration: "brat", fr: "frère", theme: "Famille" },
  { id: "v014", ru: "сестра", transliteration: "sestra", fr: "sœur", theme: "Famille" },
  { id: "v015", ru: "сын", transliteration: "syn", fr: "fils", theme: "Famille" },
  { id: "v016", ru: "дочь", transliteration: "doch'", fr: "fille", theme: "Famille" },

  // Nourriture
  { id: "v020", ru: "хлеб", transliteration: "khleb", fr: "pain", theme: "Nourriture" },
  { id: "v021", ru: "вода", transliteration: "voda", fr: "eau", theme: "Nourriture" },
  { id: "v022", ru: "чай", transliteration: "chay", fr: "thé", theme: "Nourriture" },
  { id: "v023", ru: "кофе", transliteration: "kofe", fr: "café", theme: "Nourriture" },
  { id: "v024", ru: "яблоко", transliteration: "yabloko", fr: "pomme", theme: "Nourriture" },
  { id: "v025", ru: "суп", transliteration: "sup", fr: "soupe", theme: "Nourriture" },

  // Ville / Lieux
  { id: "v030", ru: "город", transliteration: "gorod", fr: "ville", theme: "Ville" },
  { id: "v031", ru: "улица", transliteration: "ulitsa", fr: "rue", theme: "Ville" },
  { id: "v032", ru: "магазин", transliteration: "magazin", fr: "magasin", theme: "Ville" },
  { id: "v033", ru: "вокзал", transliteration: "vokzal", fr: "gare", theme: "Ville" },
  { id: "v034", ru: "музей", transliteration: "muzey", fr: "musée", theme: "Ville" },
  { id: "v035", ru: "школа", transliteration: "shkola", fr: "école", theme: "Ville" },

  // Verbes courants
  { id: "v040", ru: "говорить", transliteration: "govorit'", fr: "parler", theme: "Verbes" },
  { id: "v041", ru: "читать", transliteration: "chitat'", fr: "lire", theme: "Verbes" },
  { id: "v042", ru: "писать", transliteration: "pisat'", fr: "écrire", theme: "Verbes" },
  { id: "v043", ru: "идти", transliteration: "idti", fr: "aller (à pied)", theme: "Verbes" },
  { id: "v044", ru: "знать", transliteration: "znat'", fr: "savoir", theme: "Verbes" },
  { id: "v045", ru: "хотеть", transliteration: "khotet'", fr: "vouloir", theme: "Verbes" },

  // Adjectifs
  { id: "v050", ru: "большой", transliteration: "bol'shoy", fr: "grand", theme: "Adjectifs" },
  { id: "v051", ru: "маленький", transliteration: "malen'kiy", fr: "petit", theme: "Adjectifs" },
  { id: "v052", ru: "хороший", transliteration: "khoroshiy", fr: "bon", theme: "Adjectifs" },
  { id: "v053", ru: "новый", transliteration: "novyy", fr: "nouveau", theme: "Adjectifs" },
  { id: "v054", ru: "красивый", transliteration: "krasivyy", fr: "beau", theme: "Adjectifs" },
];

export const THEMES = Array.from(new Set(VOCAB.map((v) => v.theme)));
