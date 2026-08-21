// Test de niveau déterministe (pas d'IA) : questions à difficulté croissante.
// Le score détermine le niveau CEFR estimé (voir levelFromScore).

export interface LevelQuestion {
  id: string;
  tier: number; // 1 (facile) → 5 (difficile)
  prompt: string; // consigne en français
  question: string; // le contenu russe / la question
  options: string[];
  correctIndex: number;
  explain: string;
}

export const LEVEL_QUESTIONS: LevelQuestion[] = [
  {
    id: "q1",
    tier: 1,
    prompt: "Que signifie ce mot ?",
    question: "спасибо",
    options: ["bonjour", "merci", "au revoir", "oui"],
    correctIndex: 1,
    explain: "«спасибо» = merci.",
  },
  {
    id: "q2",
    tier: 1,
    prompt: "Quelle lettre correspond au son [v] ?",
    question: "?",
    options: ["в", "б", "н", "р"],
    correctIndex: 0,
    explain: "«в» se prononce [v] ; «б» = [b], «н» = [n], «р» = [r].",
  },
  {
    id: "q3",
    tier: 2,
    prompt: "Complète : « Меня ___ Анна » (je m'appelle Anna)",
    question: "Меня ___ Анна",
    options: ["зовут", "имя", "есть", "это"],
    correctIndex: 0,
    explain: "«Меня зовут…» est la formule figée pour se présenter.",
  },
  {
    id: "q4",
    tier: 2,
    prompt: "Quel est le genre du mot « книга » (livre) ?",
    question: "книга",
    options: ["masculin", "féminin", "neutre", "aucun"],
    correctIndex: 1,
    explain: "Terminaison en -а → féminin.",
  },
  {
    id: "q5",
    tier: 3,
    prompt: "Choisis la forme correcte : « У меня нет ___ » (je n'ai pas de livre)",
    question: "У меня нет ___",
    options: ["книга", "книгу", "книги", "книге"],
    correctIndex: 2,
    explain: "«нет» + génitif → книга devient книги.",
  },
  {
    id: "q6",
    tier: 3,
    prompt: "Quel cas suit la préposition « в » quand elle indique un lieu (où ?) ?",
    question: "Я живу в Москв___",
    options: ["accusatif", "prépositionnel", "génitif", "datif"],
    correctIndex: 1,
    explain: "«в» + lieu (statique) → prépositionnel : в Москве.",
  },
  {
    id: "q7",
    tier: 4,
    prompt: "Complète à l'instrumental : « Я пишу ___ » (j'écris avec un stylo, ручка)",
    question: "Я пишу ___",
    options: ["ручка", "ручку", "ручкой", "ручки"],
    correctIndex: 2,
    explain: "Instrument → instrumental : ручка → ручкой.",
  },
  {
    id: "q8",
    tier: 4,
    prompt: "Quel verbe est perfectif (action achevée) ?",
    question: "lire",
    options: ["читать", "прочитать", "читаю", "читал"],
    correctIndex: 1,
    explain: "«прочитать» (préfixe про-) est le perfectif de «читать».",
  },
  {
    id: "q9",
    tier: 5,
    prompt: "Complète : « Если бы я ___ время, я бы поехал » (si j'avais le temps…)",
    question: "Если бы я ___ время",
    options: ["имею", "имел", "иметь", "имея"],
    correctIndex: 1,
    explain: "Conditionnel irréel : «бы» + passé → имел.",
  },
  {
    id: "q10",
    tier: 5,
    prompt: "Que signifie l'expression « бить баклуши » ?",
    question: "бить баклуши",
    options: ["travailler dur", "ne rien faire / paresser", "se dépêcher", "se disputer"],
    correctIndex: 1,
    explain: "Idiome : «бить баклуши» = fainéanter.",
  },
];
