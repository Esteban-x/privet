import { CefrLevel } from "@/lib/supabase/types";

// Test de niveau déterministe (pas d'IA), inspiré des tests de placement
// russes réels (ТРКИ / TORFL, tests universitaires) : lexique, grammaire
// (cas, aspect, verbes de mouvement), et compréhension de courts textes,
// répartis sur 5 paliers (A1 → C1). Passé de façon ADAPTATIVE (voir
// app/onboarding/page.tsx) plutôt qu'en séquence fixe : la difficulté suit
// les réponses, comme un vrai test de placement.

export interface LevelQuestion {
  id: string;
  tier: number; // 1 (A1) → 5 (C1)
  prompt: string; // consigne en français
  question: string; // le contenu russe / la question
  options: string[];
  correctIndex: number;
  explain: string;
}

// Un palier par niveau CEFR au-dessus du plancher A0 (aucune bonne réponse
// même au palier 1 → grand débutant absolu).
export const TIER_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
export const MIN_TIER = 1;
export const MAX_TIER = TIER_LEVELS.length;

export const LEVEL_QUESTIONS: LevelQuestion[] = [
  // ─── Palier 1 · A1 — salutations, alphabet, vocabulaire de base ──
  {
    id: "t1-1",
    tier: 1,
    prompt: "Que signifie ce mot ?",
    question: "спасибо",
    options: ["bonjour", "merci", "au revoir", "oui"],
    correctIndex: 1,
    explain: "«спасибо» = merci.",
  },
  {
    id: "t1-2",
    tier: 1,
    prompt: "Quelle lettre correspond au son [v] ?",
    question: "?",
    options: ["в", "б", "н", "р"],
    correctIndex: 0,
    explain: "«в» se prononce [v] ; «б» = [b], «н» = [n], «р» = [r].",
  },
  {
    id: "t1-3",
    tier: 1,
    prompt: "Que signifie « Как дела? » ?",
    question: "Как дела?",
    options: [
      "Comment tu t'appelles ?",
      "Comment ça va ?",
      "Où habites-tu ?",
      "Quel âge as-tu ?",
    ],
    correctIndex: 1,
    explain: "«Как дела?» = Comment ça va ?",
  },
  {
    id: "t1-4",
    tier: 1,
    prompt: "Quel est le genre du mot « стол » (table) ?",
    question: "стол",
    options: ["masculin", "féminin", "neutre", "aucun"],
    correctIndex: 0,
    explain: "Terminaison consonne → masculin.",
  },
  {
    id: "t1-5",
    tier: 1,
    prompt: "Combien fait « пять плюс три » (5 + 3) ?",
    question: "Пять плюс три — это …",
    options: ["семь", "восемь", "девять", "шесть"],
    correctIndex: 1,
    explain: "5 + 3 = 8 = восемь.",
  },
  {
    id: "t1-6",
    tier: 1,
    prompt: "Complète : « Я ___ по-русски » (je parle russe)",
    question: "Я ___ по-русски",
    options: ["говорю", "говорить", "говоришь", "говорит"],
    correctIndex: 0,
    explain: "1ʳᵉ personne du singulier, présent : говорю.",
  },

  // ─── Palier 2 · A2 — passé simple, datif d'âge, quotidien ────────
  {
    id: "t2-1",
    tier: 2,
    prompt: "Complète : « Меня ___ Анна » (je m'appelle Anna)",
    question: "Меня ___ Анна",
    options: ["зовут", "имя", "есть", "это"],
    correctIndex: 0,
    explain: "«Меня зовут…» est la formule figée pour se présenter.",
  },
  {
    id: "t2-2",
    tier: 2,
    prompt: "Quel est le genre du mot « книга » (livre) ?",
    question: "книга",
    options: ["masculin", "féminin", "neutre", "aucun"],
    correctIndex: 1,
    explain: "Terminaison en -а → féminin.",
  },
  {
    id: "t2-3",
    tier: 2,
    prompt: "Complète au passé : « Вчера я ___ в кино » (hier je suis allé au cinéma)",
    question: "Вчера я ___ в кино",
    options: ["хожу", "ходил", "пойду", "ходить"],
    correctIndex: 1,
    explain: "Passé (-л) pour une action déjà accomplie hier : ходил.",
  },
  {
    id: "t2-4",
    tier: 2,
    prompt: "Complète : « Мне двадцать ___ » (j'ai vingt ans)",
    question: "Мне двадцать ___",
    options: ["год", "года", "лет", "годов"],
    correctIndex: 2,
    explain: "Après un nombre finissant par 0 (vingt), on utilise «лет».",
  },
  {
    id: "t2-5",
    tier: 2,
    prompt: "Que signifie « У меня есть брат » ?",
    question: "У меня есть брат",
    options: [
      "Je suis un frère",
      "J'ai un frère",
      "Il y a un frère ici",
      "Mon frère est là-bas",
    ],
    correctIndex: 1,
    explain: "«У меня есть…» = j'ai (possession).",
  },
  {
    id: "t2-6",
    tier: 2,
    prompt: "Complète : « Я иду ___ работу » (je vais au travail)",
    question: "Я иду ___ работу",
    options: ["в", "на", "к", "до"],
    correctIndex: 1,
    explain: "«на работу» est l'expression figée pour « au travail ».",
  },

  // ─── Palier 3 · B1 — cas, verbes de mouvement, subordonnées ──────
  {
    id: "t3-1",
    tier: 3,
    prompt: "Choisis la forme correcte : « У меня нет ___ » (je n'ai pas de livre)",
    question: "У меня нет ___",
    options: ["книга", "книгу", "книги", "книге"],
    correctIndex: 2,
    explain: "«нет» + génitif → книга devient книги.",
  },
  {
    id: "t3-2",
    tier: 3,
    prompt: "Quel cas suit la préposition « в » quand elle indique un lieu (où ?) ?",
    question: "Я живу в Москв___",
    options: ["accusatif", "prépositionnel", "génitif", "datif"],
    correctIndex: 1,
    explain: "«в» + lieu (statique) → prépositionnel : в Москве.",
  },
  {
    id: "t3-3",
    tier: 3,
    prompt:
      "Complète : « Каждый день я ___ на работу пешком » (chaque jour je vais au travail à pied)",
    question: "Каждый день я ___ на работу пешком",
    options: ["хожу", "иду", "поеду", "шёл"],
    correctIndex: 0,
    explain:
      "Action habituelle, répétée → verbe de mouvement multidirectionnel «ходить» : хожу. «идти» ne vaudrait que pour un trajet précis en cours.",
  },
  {
    id: "t3-4",
    tier: 3,
    prompt:
      "Complète : « Я не пошёл гулять, ___ шёл дождь » (je ne suis pas sorti me promener parce qu'il pleuvait)",
    question: "Я не пошёл гулять, ___ шёл дождь",
    options: ["потому что", "если", "когда", "чтобы"],
    correctIndex: 0,
    explain: "«потому что» introduit la cause : parce que.",
  },
  {
    id: "t3-5",
    tier: 3,
    prompt:
      "Lis : « Анна живёт в Москве. Она работает врачом. Каждое утро она пьёт кофе. » Kем работает Анна ?",
    question: "Кем работает Анна?",
    options: ["учителем", "студентом", "врачом", "врач"],
    correctIndex: 2,
    explain: "Le texte dit «Она работает врачом» — врачом à l'instrumental (profession).",
  },
  {
    id: "t3-6",
    tier: 3,
    prompt: "Complète : « Москва ___, чем Санкт-Петербург » (Moscou est plus grande que Saint-Pétersbourg)",
    question: "Москва ___, чем Санкт-Петербург",
    options: ["большой", "больше", "самая большая", "более"],
    correctIndex: 1,
    explain: "Comparatif simple : больше (plus grand·e).",
  },

  // ─── Palier 4 · B2 — aspect, préverbes, discours rapporté, registre ──
  {
    id: "t4-1",
    tier: 4,
    prompt: "Complète à l'instrumental : « Я пишу ___ » (j'écris avec un stylo, ручка)",
    question: "Я пишу ___",
    options: ["ручка", "ручку", "ручкой", "ручки"],
    correctIndex: 2,
    explain: "Instrument → instrumental : ручка → ручкой.",
  },
  {
    id: "t4-2",
    tier: 4,
    prompt: "Quel verbe est perfectif (action achevée) ?",
    question: "lire",
    options: ["читать", "прочитать", "читаю", "читал"],
    correctIndex: 1,
    explain: "«прочитать» (préfixe про-) est le perfectif de «читать».",
  },
  {
    id: "t4-3",
    tier: 4,
    prompt:
      "Complète : « Он открыл дверь и ___ из комнаты » (il a ouvert la porte et est sorti de la pièce)",
    question: "Он открыл дверь и ___ из комнаты",
    options: ["вошёл", "пришёл", "вышел", "ушёл"],
    correctIndex: 2,
    explain: "Préverbe вы- = mouvement vers l'extérieur, cohérent avec «из комнаты» : вышел.",
  },
  {
    id: "t4-4",
    tier: 4,
    prompt: "Discours rapporté : « Он сказал, что ___ завтра » (il a dit qu'il viendrait demain)",
    question: "Он сказал, что ___ завтра",
    options: ["пришёл", "приходит", "придёт", "прийти"],
    correctIndex: 2,
    explain:
      "Le russe garde le temps de l'énoncé original (futur) plutôt que de le reculer comme en français : придёт.",
  },
  {
    id: "t4-5",
    tier: 4,
    prompt:
      "En s'adressant poliment à un inconnu plus âgé dans la rue, on dit plutôt :",
    question: "?",
    options: [
      "Эй, ты не знаешь, где метро?",
      "Простите, вы не подскажете, где метро?",
      "Привет, ты как?",
      "Скажи мне, где метро.",
    ],
    correctIndex: 1,
    explain: "Registre formel : «простите» + «вы» pour un inconnu, surtout plus âgé.",
  },
  {
    id: "t4-6",
    tier: 4,
    prompt: "Que signifie l'expression « вешать лапшу на уши » ?",
    question: "вешать лапшу на уши",
    options: [
      "se laver les oreilles",
      "mentir, raconter des salades",
      "être très stressé",
      "bien manger",
    ],
    correctIndex: 1,
    explain: "Idiome familier : «вешать лапшу на уши» = mentir, enjoliver.",
  },

  // ─── Palier 5 · C1 — aspect fin, participes, style, idiomes ──────
  {
    id: "t5-1",
    tier: 5,
    prompt: "Complète : « Если бы я ___ время, я бы поехал » (si j'avais le temps…)",
    question: "Если бы я ___ время",
    options: ["имею", "имел", "иметь", "имея"],
    correctIndex: 1,
    explain: "Conditionnel irréel : «бы» + passé → имел.",
  },
  {
    id: "t5-2",
    tier: 5,
    prompt: "Que signifie l'expression « бить баклуши » ?",
    question: "бить баклуши",
    options: ["travailler dur", "ne rien faire / paresser", "se dépêcher", "se disputer"],
    correctIndex: 1,
    explain: "Idiome : «бить баклуши» = fainéanter.",
  },
  {
    id: "t5-3",
    tier: 5,
    prompt:
      "Complète : « Я час ___ это письмо, но так и не закончил » (j'ai passé une heure à écrire cette lettre, mais je n'ai pas fini)",
    question: "Я час ___ это письмо, но так и не закончил",
    options: ["написал", "писал", "пишу", "напишу"],
    correctIndex: 1,
    explain:
      "Imperfectif «писал» pour une action en cours, prolongée, restée inachevée — le perfectif «написал» impliquerait qu'elle a abouti.",
  },
  {
    id: "t5-4",
    tier: 5,
    prompt:
      "Complète avec le participe correct : « Человек, ___ на скамейке, — мой сосед » (l'homme assis sur le banc est mon voisin)",
    question: "Человек, ___ на скамейке, — мой сосед",
    options: ["сидит", "сидел", "сидящий", "сидя"],
    correctIndex: 2,
    explain: "Participe présent actif, qualifie «человек» : сидящий.",
  },
  {
    id: "t5-5",
    tier: 5,
    prompt: "Que signifie l'expression « дело в шляпе » ?",
    question: "дело в шляпе",
    options: [
      "c'est un désastre",
      "c'est réglé, dans la poche",
      "on verra bien",
      "c'est très compliqué",
    ],
    correctIndex: 1,
    explain: "Idiome : «дело в шляпе» = l'affaire est dans le sac.",
  },
  {
    id: "t5-6",
    tier: 5,
    prompt:
      "Complète : « Несмотря ___ трудности, он закончил проект вовремя » (malgré les difficultés…)",
    question: "Несмотря ___ трудности, он закончил проект вовремя",
    options: ["с", "от", "на", "из"],
    correctIndex: 2,
    explain: "Préposition composée figée : «несмотря на» + accusatif = malgré.",
  },
];

export function questionsForTier(tier: number): LevelQuestion[] {
  return LEVEL_QUESTIONS.filter((q) => q.tier === tier);
}

export function getQuestion(id: string): LevelQuestion | undefined {
  return LEVEL_QUESTIONS.find((q) => q.id === id);
}

/**
 * Dérive le niveau CEFR d'une passation adaptative à partir des réponses
 * effectivement posées (voir app/onboarding/page.tsx pour l'algorithme de
 * paliers). Pure fonction, appelée à la fois côté client (retour immédiat) et
 * côté serveur (source de vérité, ne fait pas confiance à un niveau envoyé
 * tel quel par le client) — voir app/api/level-test/evaluate/route.ts.
 */
export function deriveLevelFromAnswers(
  answers: { tier: number; correct: boolean }[]
): CefrLevel {
  if (answers.length === 0) return "A0";

  // Le palier s'est stabilisé autour de la limite de compétence vers la fin
  // de la passation : on regarde le plus haut palier réussi parmi les
  // dernières réponses plutôt que le score brut, qui n'a pas de sens pour un
  // test adaptatif (converger vers ~50% de bonnes réponses à son niveau réel
  // est le but recherché, pas un signe de faiblesse).
  const recent = answers.slice(-4);
  const highestConfirmedTier = recent
    .filter((a) => a.correct)
    .reduce((max, a) => Math.max(max, a.tier), 0);

  if (highestConfirmedTier === 0) return "A0";
  return TIER_LEVELS[Math.min(highestConfirmedTier, MAX_TIER) - 1];
}
