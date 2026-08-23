import { CefrLevel } from "@/lib/supabase/types";

/**
 * Banque d'items du test de placement.
 *
 * Calibrage : chaque palier reprend les descripteurs du référentiel ТРКИ /
 * TORFL, le standard officiel du russe langue étrangère, aligné sur le CECR :
 *
 *   1 · A1 — Элементарный : présent, у меня есть, prépositionnel de lieu,
 *            accusatif d'objet direct, possessifs, mots interrogatifs,
 *            lexique du quotidien.
 *   2 · A2 — Базовый : passé et futur, génitif après нет / у, datif avec
 *            нравиться, opposition lieu (в + prép.) / direction (в + acc.),
 *            accord après 2-4, verbes de déplacement идти/ходить/ехать.
 *   3 · B1 — ТРКИ-1 : système casuel complet dont l'instrumental, aspect en
 *            contexte, verbes de déplacement préfixés, subordonnées
 *            (который, чтобы), conditionnel en бы, comparatif/superlatif.
 *   4 · B2 — ТРКИ-2 : participes actifs et passifs, gérondifs, passif,
 *            régime verbal (интересоваться + instr., избегать + gén.,
 *            уделять внимание + dat.), conjonctions complexes, discours
 *            indirect en ли, dérivation.
 *   5 · C1 — ТРКИ-3 : phraséologie, registre, régimes rares, nuances
 *            aspectuelles, corrélations syntaxiques (чем… тем…).
 *
 * Règles de rédaction, pour que le test MESURE au lieu de piéger :
 * - un item = une compétence, testée en contexte (phrase à trou), pas de
 *   question métalinguistique du type « quel est le genre de ce mot ? » ;
 * - une seule réponse défendable : les items dont deux options se disent
 *   réellement en russe ont été écartés (ex. «ушёл/вышел из дома») ;
 * - les distracteurs sont des erreurs plausibles à ce niveau (mauvais cas,
 *   mauvais aspect), pas du remplissage absurde ;
 * - l'explication enseigne la règle, elle ne se contente pas de donner la
 *   réponse.
 */

export type LevelSkill = "grammaire" | "lexique";

export interface LevelQuestion {
  id: string;
  tier: number; // 1 (A1) → 5 (C1)
  skill: LevelSkill;
  prompt: string; // consigne en français
  question: string; // le contenu russe
  options: string[];
  correctIndex: number;
  explain: string;
}

// Un palier par niveau CEFR au-dessus du plancher A0 (palier 1 non validé
// → grand débutant absolu).
export const TIER_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
export const MIN_TIER = 1;
export const MAX_TIER = TIER_LEVELS.length;

export function levelForTier(tier: number): CefrLevel {
  if (tier < MIN_TIER) return "A0";
  return TIER_LEVELS[Math.min(tier, MAX_TIER) - 1];
}

export const LEVEL_QUESTIONS: LevelQuestion[] = [
  // ─── Palier 1 · A1 — Элементарный уровень ────────────────────────
  {
    id: "a1-lex-spasibo",
    tier: 1,
    skill: "lexique",
    prompt: "Que signifie ce mot ?",
    question: "спасибо",
    options: ["bonjour", "merci", "au revoir", "s'il te plaît"],
    correctIndex: 1,
    explain: "«спасибо» = merci. «пожалуйста» = s'il te plaît / je t'en prie.",
  },
  {
    id: "a1-lex-dosvidaniya",
    tier: 1,
    skill: "lexique",
    prompt: "Que signifie cette formule ?",
    question: "До свидания!",
    options: ["Bonjour !", "Bonne nuit !", "Au revoir !", "Bienvenue !"],
    correctIndex: 2,
    explain: "«До свидания» = au revoir (littéralement « jusqu'à la revoyure »).",
  },
  {
    id: "a1-lex-khleb",
    tier: 1,
    skill: "lexique",
    prompt: "Que signifie ce mot ?",
    question: "хлеб",
    options: ["lait", "pain", "eau", "viande"],
    correctIndex: 1,
    explain: "«хлеб» = pain. «молоко» = lait, «вода» = eau, «мясо» = viande.",
  },
  {
    id: "a1-lex-ponedelnik",
    tier: 1,
    skill: "lexique",
    prompt: "Quel jour de la semaine est-ce ?",
    question: "понедельник",
    options: ["dimanche", "lundi", "mardi", "samedi"],
    correctIndex: 1,
    explain: "«понедельник» = lundi, le jour qui suit «неделя» au sens ancien de dimanche.",
  },
  {
    id: "a1-com-kakvaszovut",
    tier: 1,
    skill: "lexique",
    prompt: "Que demande-t-on ?",
    question: "Как вас зовут?",
    options: [
      "Comment allez-vous ?",
      "Où habitez-vous ?",
      "Comment vous appelez-vous ?",
      "Quel âge avez-vous ?",
    ],
    correctIndex: 2,
    explain: "«Как вас зовут?» = comment vous appelle-t-on ? On répond «Меня зовут…».",
  },
  {
    id: "a1-com-kakdela",
    tier: 1,
    skill: "lexique",
    prompt: "Que signifie cette question ?",
    question: "Как дела?",
    options: ["Comment ça va ?", "Qu'est-ce que c'est ?", "Où es-tu ?", "Tu fais quoi ?"],
    correctIndex: 0,
    explain: "«Как дела?» = comment ça va ? (littéralement « comment vont les affaires »).",
  },
  {
    id: "a1-gram-govoryu",
    tier: 1,
    skill: "grammaire",
    prompt: "Complète : « Je parle russe. »",
    question: "Я ___ по-русски.",
    options: ["говорить", "говорит", "говорю", "говорим"],
    correctIndex: 2,
    explain: "1re personne du singulier : говорю. «говорит» = il/elle parle, «говорим» = nous parlons.",
  },
  {
    id: "a1-gram-prep-lieu",
    tier: 1,
    skill: "grammaire",
    prompt: "Complète : « J'habite à Moscou. »",
    question: "Я живу ___ Москве.",
    options: ["в", "на", "из", "с"],
    correctIndex: 0,
    explain: "Le lieu où l'on est se dit «в» + prépositionnel : в Москве.",
  },
  {
    id: "a1-gram-possessif",
    tier: 1,
    skill: "grammaire",
    prompt: "Complète : « C'est ma sœur. »",
    question: "Это ___ сестра.",
    options: ["мой", "моя", "моё", "мои"],
    correctIndex: 1,
    explain: "«сестра» est féminin : le possessif s'accorde → моя.",
  },
  {
    id: "a1-gram-accusatif",
    tier: 1,
    skill: "grammaire",
    prompt: "Complète : « Je lis un livre. »",
    question: "Я читаю ___.",
    options: ["книга", "книгу", "книге", "книги"],
    correctIndex: 1,
    explain: "Complément d'objet direct → accusatif : книга → книгу.",
  },
  {
    id: "a1-gram-est",
    tier: 1,
    skill: "grammaire",
    prompt: "Complète : « J'ai un frère. »",
    question: "У меня ___ брат.",
    options: ["есть", "нет", "быть", "буду"],
    correctIndex: 0,
    explain: "La possession se dit «у меня есть» + nominatif — le russe n'a pas de verbe « avoir ».",
  },
  {
    id: "a1-gram-gde",
    tier: 1,
    skill: "grammaire",
    prompt: "Complète : « Où habites-tu ? »",
    question: "___ ты живёшь?",
    options: ["Кто", "Что", "Где", "Когда"],
    correctIndex: 2,
    explain: "«Где» = où. «Когда» = quand, «Кто» = qui, «Что» = quoi.",
  },

  // ─── Palier 2 · A2 — Базовый уровень ─────────────────────────────
  {
    id: "a2-gram-passe",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Hier, Anna est allée au cinéma. »",
    question: "Вчера Анна ___ в кино.",
    options: ["ходил", "ходила", "ходили", "ходить"],
    correctIndex: 1,
    explain: "Au passé, le verbe s'accorde en genre avec le sujet : Анна (fém.) → ходила.",
  },
  {
    id: "a2-gram-futur",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Demain je vais travailler. »",
    question: "Завтра я ___ работать.",
    options: ["был", "буду", "бы", "быть"],
    correctIndex: 1,
    explain: "Futur imperfectif : буду + infinitif.",
  },
  {
    id: "a2-gram-genitif-net",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Je n'ai pas le temps. »",
    question: "У меня нет ___.",
    options: ["время", "времени", "временем", "времена"],
    correctIndex: 1,
    explain: "«нет» exige toujours le génitif : время → времени.",
  },
  {
    id: "a2-gram-genitif-u",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Mon frère a une voiture. »",
    question: "___ есть машина.",
    options: ["Мой брат", "У мой брат", "У моего брата", "Моему брату"],
    correctIndex: 2,
    explain: "«у» + génitif pour le possesseur : у моего брата.",
  },
  {
    id: "a2-gram-datif-nravitsya",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « J'aime cette musique. »",
    question: "___ нравится эта музыка.",
    options: ["Я", "Меня", "Мне", "Мной"],
    correctIndex: 2,
    explain: "«нравиться» met celui qui aime au datif : мне нравится (littéralement « ça me plaît »).",
  },
  {
    id: "a2-gram-direction",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Chaque matin je vais à l'école. »",
    question: "Каждое утро я иду ___.",
    options: ["в школе", "в школу", "из школы", "школой"],
    correctIndex: 1,
    explain: "Déplacement vers un lieu : в + accusatif (в школу). Le lieu où l'on est prend в + prépositionnel.",
  },
  {
    id: "a2-gram-lieu",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Mon frère travaille à l'école. »",
    question: "Мой брат работает ___.",
    options: ["в школу", "в школе", "на школу", "школы"],
    correctIndex: 1,
    explain: "Lieu où l'on se trouve : в + prépositionnel (в школе), sans mouvement.",
  },
  {
    id: "a2-gram-numeral",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « J'ai deux sœurs. »",
    question: "У меня две ___.",
    options: ["сестра", "сестры", "сестёр", "сёстрам"],
    correctIndex: 1,
    explain: "Après 2, 3 et 4 : génitif singulier → две сестры. Après 5 et plus : génitif pluriel (пять сестёр).",
  },
  {
    id: "a2-gram-motion",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « D'habitude je vais au travail en bus. »",
    question: "Обычно я ___ на работу на автобусе.",
    options: ["иду", "хожу", "еду", "езжу"],
    correctIndex: 3,
    explain:
      "Habitude (обычно) + véhicule → езжу. «хожу» serait à pied, «еду»/«иду» décrivent un trajet en cours.",
  },
  {
    id: "a2-gram-aspect-duree",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Hier j'ai écrit une lettre toute la soirée. »",
    question: "Вчера я весь вечер ___ письмо.",
    options: ["писал", "написал", "пишу", "напишу"],
    correctIndex: 0,
    explain:
      "«весь вечер» décrit un processus qui dure → imperfectif (писал). Le perfectif «написал» insisterait sur le résultat atteint.",
  },
  {
    id: "a2-gram-comparatif",
    tier: 2,
    skill: "grammaire",
    prompt: "Complète : « Moscou est plus grande que Saint-Pétersbourg. »",
    question: "Москва ___, чем Петербург.",
    options: ["большая", "большой", "больше", "самая большая"],
    correctIndex: 2,
    explain: "Comparatif simple : больше. La construction est «больше, чем…».",
  },
  {
    id: "a2-lex-opazdyvat",
    tier: 2,
    skill: "lexique",
    prompt: "Que signifie ce verbe ?",
    question: "опаздывать",
    options: ["se dépêcher", "être en retard", "attendre", "partir"],
    correctIndex: 1,
    explain: "«опаздывать / опоздать» = être en retard. «спешить» = se dépêcher.",
  },

  // ─── Palier 3 · B1 — ТРКИ-1 ──────────────────────────────────────
  {
    id: "b1-gram-instr-metier",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « Mon père travaille comme médecin. »",
    question: "Мой отец работает ___.",
    options: ["врач", "врача", "врачом", "врачу"],
    correctIndex: 2,
    explain: "«работать» + instrumental pour la profession : работает врачом.",
  },
  {
    id: "b1-gram-instr-avec",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « Je vais au cinéma avec un ami. »",
    question: "Я иду в кино с ___.",
    options: ["друг", "друга", "другом", "другу"],
    correctIndex: 2,
    explain: "La préposition «с» (avec) exige l'instrumental : с другом.",
  },
  {
    id: "b1-gram-aspect-delai",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « J'ai lu ce livre en deux jours. »",
    question: "Я ___ эту книгу за два дня.",
    options: ["читал", "прочитал", "читаю", "буду читать"],
    correctIndex: 1,
    explain:
      "«за + durée» indique le temps qu'il a fallu pour ALLER AU BOUT → perfectif : прочитал.",
  },
  {
    id: "b1-gram-chtoby",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « Je suis venu pour t'aider. »",
    question: "Я пришёл, ___ тебе помочь.",
    options: ["что", "чтобы", "потому что", "если"],
    correctIndex: 1,
    explain: "But + infinitif : чтобы. «потому что» donne la cause, pas le but.",
  },
  {
    id: "b1-gram-kotoryy",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « La fille que j'ai rencontrée hier est ma sœur. »",
    question: "Девушка, ___ я встретил вчера, — моя сестра.",
    options: ["которая", "которую", "которой", "которого"],
    correctIndex: 1,
    explain:
      "«который» prend le genre de son antécédent (девушка, fém.) et le cas de sa fonction dans la subordonnée — ici objet direct → которую.",
  },
  {
    id: "b1-gram-motion-prefixe",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « Il est entré dans la pièce et s'est assis. »",
    question: "Он ___ в комнату и сел.",
    // «пришёл» écarté des distracteurs : «прийти в комнату» se dit aussi,
    // l'item n'aurait plus eu une seule réponse défendable. Les quatre
    // options opposent maintenant des préfixes de direction incompatibles.
    options: ["вошёл", "вышел", "перешёл", "отошёл"],
    correctIndex: 0,
    explain:
      "Le préfixe в(о)- marque l'entrée : войти в комнату. вы- = sortir de, пере- = traverser, от- = s'écarter.",
  },
  {
    id: "b1-gram-conditionnel",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « Si j'avais le temps, je t'aiderais. »",
    question: "Если бы у меня было время, я ___ тебе.",
    options: ["помогу", "помог бы", "помогал", "помочь"],
    correctIndex: 1,
    explain: "L'irréel se construit avec «бы» + passé dans LES DEUX propositions : если бы… помог бы.",
  },
  {
    id: "b1-gram-genitif-pluriel",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « Il y a beaucoup d'étudiants dans notre ville. »",
    question: "В нашем городе много ___.",
    options: ["студент", "студенты", "студентов", "студентам"],
    correctIndex: 2,
    explain: "«много» exige le génitif pluriel : студентов.",
  },
  {
    id: "b1-gram-datif-verbe",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « J'aide souvent ma mère. »",
    question: "Я часто помогаю ___.",
    options: ["маму", "маме", "мамой", "мамы"],
    correctIndex: 1,
    explain:
      "«помогать» se construit avec le datif, là où le français a un objet direct : помогаю маме.",
  },
  {
    id: "b1-gram-reflexif",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « Le matin je me réveille à sept heures. »",
    question: "Утром я ___ в семь часов.",
    options: ["просыпаю", "просыпаюсь", "просыпается", "проснуть"],
    correctIndex: 1,
    explain: "Verbe pronominal en -ся, 1re personne : просыпаюсь.",
  },
  {
    id: "b1-gram-superlatif",
    tier: 3,
    skill: "grammaire",
    prompt: "Complète : « C'est le film le plus intéressant de l'année. »",
    question: "Это ___ интересный фильм года.",
    options: ["более", "самый", "очень", "такой"],
    correctIndex: 1,
    explain: "Superlatif : самый + adjectif. «более» sert au comparatif (plus…que).",
  },
  {
    id: "b1-lex-vnezapno",
    tier: 3,
    skill: "lexique",
    prompt: "Que signifie cet adverbe ?",
    question: "внезапно",
    options: ["lentement", "soudain", "souvent", "à peine"],
    correctIndex: 1,
    explain: "«внезапно» = soudainement, tout à coup.",
  },

  // ─── Palier 4 · B2 — ТРКИ-2 ──────────────────────────────────────
  {
    id: "b2-gram-participe-actif",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « L'étudiant qui lit à la bibliothèque est mon ami. »",
    question: "Студент, ___ в библиотеке, — мой друг.",
    options: ["читает", "читающий", "читаемый", "читая"],
    correctIndex: 1,
    explain:
      "Participe présent actif : читающий (celui qui lit). «читаемый» est passif, «читая» est un gérondif.",
  },
  {
    id: "b2-gram-participe-passif",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « Le livre écrit par Tolstoï est devenu un classique. »",
    question: "Книга, ___ Толстым, стала классикой.",
    options: ["написал", "написавший", "написанная", "написав"],
    correctIndex: 2,
    explain:
      "Participe passé passif, accordé avec книга (fém.) : написанная. L'agent se met à l'instrumental (Толстым).",
  },
  {
    id: "b2-gram-gerondif",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « En rentrant chez moi, j'ai croisé un vieil ami. »",
    question: "___ домой, я встретил старого друга.",
    options: ["Возвращаюсь", "Возвращаясь", "Возвращался", "Возвращение"],
    correctIndex: 1,
    explain:
      "Gérondif imperfectif : возвращаясь — l'action accompagne celle du verbe principal, même sujet.",
  },
  {
    id: "b2-gram-regime-interesovatsya",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « Il s'intéresse depuis longtemps à l'histoire. »",
    question: "Он давно интересуется ___.",
    options: ["историю", "истории", "историей", "об истории"],
    correctIndex: 2,
    explain: "«интересоваться» se construit avec l'instrumental : интересуется историей.",
  },
  {
    id: "b2-gram-regime-izbegat",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « Il évite les conflits. »",
    question: "Он избегает ___.",
    options: ["конфликты", "конфликтов", "конфликтам", "конфликтами"],
    correctIndex: 1,
    explain: "«избегать» exige le génitif : избегает конфликтов.",
  },
  {
    id: "b2-gram-regime-udelyat",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « Il accorde beaucoup d'attention aux détails. »",
    question: "Он уделяет много внимания ___.",
    options: ["детали", "деталей", "деталям", "деталями"],
    correctIndex: 2,
    explain: "«уделять внимание» + datif : уделяет внимание деталям.",
  },
  {
    id: "b2-gram-passif",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « Cette maison a été construite au siècle dernier. »",
    question: "Этот дом ___ в прошлом веке.",
    options: ["строил", "построил", "был построен", "строится"],
    correctIndex: 2,
    explain:
      "Passif au passé : был + participe passé passif court (был построен). «строится» est un présent passif.",
  },
  {
    id: "b2-gram-nesmotrya",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « Bien qu'il fût tard, nous avons continué. »",
    question: "___ на то что было поздно, мы продолжили работу.",
    options: ["Несмотря", "Благодаря", "Вопреки", "Из-за"],
    correctIndex: 0,
    explain:
      "Conjonction complexe «несмотря на то что» = bien que. «благодаря» = grâce à, «из-за» = à cause de.",
  },
  {
    id: "b2-gram-li",
    tier: 4,
    skill: "grammaire",
    prompt: "Complète : « Il a demandé si je viendrais demain. »",
    question: "Он спросил, приду ___ я завтра.",
    options: ["что", "если", "ли", "чтобы"],
    correctIndex: 2,
    explain:
      "Interrogation indirecte totale : particule «ли» placée après le mot sur lequel porte la question. «если» ne sert qu'à l'hypothèse.",
  },
  {
    id: "b2-gram-derivation",
    tier: 4,
    skill: "grammaire",
    prompt: "Quel mot désigne la PERSONNE qui exerce l'action de « преподавать » (enseigner) ?",
    question: "преподавать → ?",
    options: ["преподавание", "преподаватель", "преподавательский", "преподанный"],
    correctIndex: 1,
    explain:
      "Suffixe -тель = agent : преподаватель (enseignant). «преподавание» est l'action, «-ский» un adjectif.",
  },
  {
    id: "b2-lex-sokrashchat",
    tier: 4,
    skill: "lexique",
    prompt: "Que signifie ce verbe ?",
    question: "сокращать",
    options: ["augmenter", "réduire", "reporter", "remplacer"],
    correctIndex: 1,
    explain: "«сокращать / сократить» = réduire, raccourcir (d'où «сокращение» : réduction, abréviation).",
  },
  {
    id: "b2-lex-uverennyy",
    tier: 4,
    skill: "lexique",
    prompt: "Que signifie cet adjectif ?",
    question: "уверенный",
    options: ["inquiet", "sûr, assuré", "surpris", "prudent"],
    correctIndex: 1,
    explain: "«уверенный» = sûr de soi, assuré ; «быть уверенным в чём-то» = être sûr de quelque chose.",
  },

  // ─── Palier 5 · C1 — ТРКИ-3 ──────────────────────────────────────
  {
    id: "c1-lex-shlyapa",
    tier: 5,
    skill: "lexique",
    prompt: "Que signifie cette expression figée ?",
    question: "дело в шляпе",
    options: ["c'est un désastre", "c'est dans la poche", "on verra bien", "c'est très compliqué"],
    correctIndex: 1,
    explain: "«дело в шляпе» = l'affaire est réglée, c'est dans la poche.",
  },
  {
    id: "c1-lex-baklushi",
    tier: 5,
    skill: "lexique",
    prompt: "Que signifie cette expression figée ?",
    question: "бить баклуши",
    options: ["travailler dur", "se disputer", "ne rien faire, paresser", "dire la vérité"],
    correctIndex: 2,
    explain: "«бить баклуши» = se tourner les pouces, ne rien faire.",
  },
  {
    id: "c1-lex-lomat-golovu",
    tier: 5,
    skill: "lexique",
    prompt: "Que signifie cette expression figée ?",
    question: "ломать голову",
    options: ["se creuser la tête", "perdre la mémoire", "se mettre en colère", "changer d'avis"],
    correctIndex: 0,
    explain: "«ломать голову над чем-то» = se casser la tête sur quelque chose.",
  },
  {
    id: "c1-gram-izza",
    tier: 5,
    skill: "grammaire",
    prompt: "Complète : « À cause de la pluie, nous sommes restés à la maison. »",
    question: "___ дождя мы остались дома.",
    options: ["Благодаря", "Из-за", "Вопреки", "Согласно"],
    correctIndex: 1,
    explain:
      "«из-за» + génitif introduit une cause NÉGATIVE ; «благодаря» + datif une cause favorable (grâce à).",
  },
  {
    id: "c1-gram-svidetelstvovat",
    tier: 5,
    skill: "grammaire",
    prompt: "Complète : « Cela témoigne de problèmes sérieux. »",
    question: "Это свидетельствует ___ серьёзных проблемах.",
    options: ["о", "про", "за", "на"],
    correctIndex: 0,
    explain: "«свидетельствовать о чём-то» + prépositionnel. «про» existe mais reste familier et régit l'accusatif.",
  },
  {
    id: "c1-gram-prenebregat",
    tier: 5,
    skill: "grammaire",
    prompt: "Complète : « Il néglige les règles. »",
    question: "Он пренебрегает ___.",
    options: ["правила", "правил", "правилам", "правилами"],
    correctIndex: 3,
    explain: "«пренебрегать» exige l'instrumental : пренебрегает правилами.",
  },
  {
    id: "c1-gram-chem-tem",
    tier: 5,
    skill: "grammaire",
    prompt: "Complète : « Plus il travaillait, plus il se fatiguait. »",
    question: "Чем больше он работал, ___ сильнее он уставал.",
    options: ["так", "тем", "что", "как"],
    correctIndex: 1,
    explain: "Corrélation de proportion : «чем… тем…» (plus… plus…).",
  },
  {
    id: "c1-gram-aspect-vspomnit",
    tier: 5,
    skill: "grammaire",
    prompt: "Complète : « Je n'arrive absolument pas à me rappeler son numéro. »",
    question: "Я никак не могу ___ его номер телефона.",
    options: ["вспоминать", "вспомнить", "помнить", "запоминать"],
    correctIndex: 1,
    explain:
      "«никак не могу» vise un résultat qu'on n'atteint pas → perfectif вспомнить. «помнить» = garder en mémoire, état continu.",
  },
  {
    id: "c1-gram-aspect-pytatsya",
    tier: 5,
    skill: "grammaire",
    prompt: "Complète : « J'ai longtemps essayé de le joindre. »",
    question: "Я долго ___ ему дозвониться.",
    options: ["пытался", "попытался", "попробую", "стал"],
    correctIndex: 0,
    explain: "«долго» décrit une tentative qui dure → imperfectif пытался. Le perfectif «попытался» serait ponctuel.",
  },
  {
    id: "c1-lex-registre",
    tier: 5,
    skill: "lexique",
    prompt: "Quel équivalent de « сейчас » appartient au registre écrit et soutenu ?",
    question: "сейчас → ?",
    options: ["щас", "в настоящее время", "потом", "давно"],
    correctIndex: 1,
    explain:
      "«в настоящее время» est la formule administrative/écrite. «щас» est une forme orale relâchée, «потом» = ensuite.",
  },
  {
    id: "c1-lex-predvzyatyy",
    tier: 5,
    skill: "lexique",
    prompt: "Que signifie cet adjectif ?",
    question: "предвзятый",
    options: ["prévoyant", "partial, biaisé", "prévisible", "prétentieux"],
    correctIndex: 1,
    explain: "«предвзятый» = partial, préconçu (предвзятое мнение : une opinion biaisée).",
  },
  {
    id: "c1-lex-obuslovlen",
    tier: 5,
    skill: "lexique",
    prompt: "Que signifie cette forme ?",
    question: "обусловлен",
    options: ["conditionné, déterminé par", "obligatoire", "conclu", "supposé"],
    correctIndex: 0,
    explain: "«обусловлен чем-то» = déterminé/conditionné par quelque chose — registre écrit et analytique.",
  },
];

export function questionsForTier(tier: number): LevelQuestion[] {
  return LEVEL_QUESTIONS.filter((q) => q.tier === tier);
}

export function getQuestion(id: string): LevelQuestion | undefined {
  return LEVEL_QUESTIONS.find((q) => q.id === id);
}
