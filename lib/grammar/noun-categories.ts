import { NOUNS } from "./nouns-data";

/**
 * Classe sémantique de chaque nom de la banque.
 *
 * POURQUOI
 *
 * Un exercice de phrase colle un déclencheur et un nom tirés séparément.
 * Sans contrainte, « Я ем ___ » recevait « помо́щник » — « je mange cet
 * assistant ». La désinence était juste et la phrase impossible : l'apprenant
 * mémorise une tournure qu'il ne dira jamais, et doute de ce qu'il lit.
 *
 * COMMENT
 *
 * Chaque nom reçoit UNE classe, et chaque déclencheur exigeant déclare
 * celles qu'il accepte (`accepts` dans triggers.ts). Une classe unique par
 * nom plutôt qu'un jeu d'étiquettes : c'est vérifiable d'un coup d'œil — un
 * mot manquant ou classé deux fois fait échouer check:grammar, qui le nomme.
 *
 * La clé est la traduction française, pas l'identifiant translittéré : ce
 * fichier est relu à la main, et « поми́мо » ne se relit pas. Les traductions
 * sont uniques dans la banque, et le contrôle le vérifie.
 *
 * ARBITRAGES
 *
 * - `drink` est séparé de `food` : « un verre de ___ » n'accepte pas du riz.
 * - `text` est séparé de `object` : « je lis ___ » n'accepte pas une chaise.
 * - Les collectifs humains (équipe, armée, gouvernement) sont des `human` :
 *   ils font ce que font les personnes dans ces phrases — on les aide, on
 *   leur obéit, on les remercie.
 * - Les parties du corps sont des `object`. Elles se voient, se montrent et
 *   se touchent comme des objets ; leur donner une classe propre
 *   n'améliorerait aucune phrase du corpus.
 * - Un nom à deux faces reçoit sa face la plus fréquente dans ces phrases :
 *   « poisson » est `food` plutôt qu'`animal`, parce que les déclencheurs
 *   qui parlent de poisson ici parlent d'en manger.
 */
export type NounCategory =
  | "human"
  | "animal"
  | "place"
  | "area"
  | "object"
  | "text"
  | "food"
  | "drink"
  | "time"
  | "abstract";

/** Personnes, et collectifs qui se comportent comme elles. */
const HUMAN = [
  "actrice", "amie", "dame", "femme", "fiancée", "fille (de qqn)", "fillette",
  "grand-mère", "infirmière", "jeune fille", "maman", "mère", "personne",
  "princesse", "reine", "sorcière", "sœur", "tante", "voisine", "épouse",
  "équipe", "famille", "armée", "police", "société", "entreprise", "firme",
  "ami", "ange", "assistant", "auteur", "avocat", "bébé", "camarade",
  "capitaine", "champion", "chasseur", "chef", "client", "commandant",
  "conducteur", "copain", "cousin", "criminel", "directeur", "enfant",
  "ennemi", "entraîneur", "espion", "expert", "fantôme", "fiancé", "frère",
  "gardien", "gars", "garçon", "gouvernement", "gouverneur", "grand-père",
  "génie", "gérant", "homme", "héros", "invité", "joueur", "juge", "mari",
  "ministre", "monsieur", "médecin", "officier", "opérateur", "papa",
  "patient", "patron", "peintre", "peuple", "pilote", "poète", "prince",
  "procureur", "professeur", "propriétaire", "président",
  "président (d'assemblée)", "prêtre", "père", "roi", "réalisateur",
  "secrétaire", "soldat", "spécialiste", "sénateur", "témoin", "vieillard",
  "voisin", "voleur", "écrivain", "étudiant",
];

const ANIMAL = [
  "chatte", "animal", "chat", "cheval", "chien", "cochon", "lapin", "loup",
  "oiseau", "ours", "rat", "serpent",
];

/**
 * Lieux où l'on entre ou se rend : bâtiments, institutions, pièces, villes.
 * Séparé de `area` parce que « habiter dans » n'accepte pas un toit ni une
 * rivière, alors que « près de » accepte les deux.
 */
const PLACE = [
  "appartement", "arrêt", "aéroport", "bureau", "bureau (pièce)", "bâtiment",
  "cave", "centre", "club", "coin", "cour", "cuisine", "endroit", "entrée",
  "gare", "hôpital", "hôtel", "jardin", "magasin", "marché", "maison",
  "musée", "parc", "pays", "piscine", "prison", "quartier", "restaurant",
  "scène", "sortie", "station", "théâtre", "tribunal", "université", "ville",
  "école", "étage",
];

/**
 * Étendues et reliefs : on les longe, on les traverse, on les contourne,
 * mais on n'y habite pas. Les voies (rue, route, chemin, pont) sont ici
 * pour la même raison — le russe leur met « на », pas « в ».
 */
const AREA = [
  "bord", "champ", "chemin", "ciel", "espace", "forêt", "lac", "mer",
  "montagne", "océan", "place", "planète", "pont", "rivière", "route", "rue",
  "sol", "terre", "toit", "île",
];

/** Choses concrètes, parties du corps comprises. */
const OBJECT = [
  "assiette", "automobile", "bague", "barque", "bouche", "carte", "chaise",
  "chemise", "clé", "cravate", "fenêtre", "fleur", "image", "jambe", "lampe",
  "liste", "literie", "lune", "main", "moto", "oreille", "peau", "photo",
  "pierre", "pièce", "porte", "robe", "serviette", "signature", "table",
  "tête", "valise", "veste", "voiture", "étoile", "épaule",
  "album", "arbre", "ascenseur", "avion", "ballon", "billet", "bocal",
  "bracelet", "bus", "cadeau", "camion", "canapé", "cerveau", "cheveu",
  "costume", "couteau", "cœur", "doigt", "dos", "fauteuil", "feu", "film",
  "lit", "miroir", "morceau", "mur", "médicament", "navire", "nez",
  "ordinateur", "os", "papier", "parapluie", "passeport", "plan", "programme",
  "réfrigérateur", "sac", "sachet", "sang", "soleil", "tableau",
  "ticket de caisse",
  "tiroir", "train", "téléphone", "téléviseur", "ventre", "verre",
  "verre (à pied)", "visage", "vélo", "vêtement", "œil",
];

/** Ce qui se lit et s'écrit. */
const TEXT = [
  "lettre", "note", "article", "chapitre", "conte", "contrat", "document",
  "journal", "journal intime", "livre", "magazine", "message", "rapport",
  "roman", "récit",
];

/** Ce qui se mange. */
const FOOD = [
  "pomme", "salade", "soupe", "tarte", "viande", "beurre", "biscuit",
  "chocolat", "dessert", "déjeuner", "dîner", "fromage", "gâteau", "pain",
  "petit-déjeuner", "plat", "poisson", "riz", "sel", "sucre", "œuf",
];

/** Ce qui se boit — distinct de `food` : « un verre de riz » ne se dit pas. */
const DRINK = ["bière", "boisson", "eau", "jus", "thé", "vin"];

/** Moments et durées. */
const TIME = [
  "heure", "minute", "nuit", "seconde", "semaine", "soirée", "automne",
  "congé", "dimanche", "délai", "hiver", "jeudi", "jour", "lundi", "mardi",
  "matin", "mois", "moment", "printemps", "siècle", "soir", "temps", "été",
];

/**
 * Tout le reste : notions, sentiments, événements, actions, qualités. C'est
 * la classe la plus large, et volontairement la classe par défaut — un nom
 * qu'on hésite à ranger ailleurs se comporte presque toujours comme un
 * abstrait dans ces phrases.
 */
const ABSTRACT = [
  "addition", "adresse", "affaire", "analyse", "attention", "blague",
  "blessure", "chanson", "colère", "conversation", "couleur", "croissance",
  "danse", "douleur", "décision", "défaite", "erreur", "expérience", "fin",
  "force", "formation", "fête", "guerre", "histoire", "humeur", "idée",
  "information", "joie", "langue", "leçon", "liberté", "loi", "légende",
  "maladie", "mission", "mort", "musique", "méthode", "météo", "nature",
  "neige", "nouvelle", "odeur", "ombre", "opération", "pensée", "peur",
  "pluie", "possibilité", "quantité", "question", "raison", "recette",
  "recherche", "rencontre", "règle", "réponse", "réunion", "santé", "science",
  "signification", "somme", "série", "taille", "tâche", "victoire", "vie",
  "voix", "vérité", "âme",
  "amour", "art", "aspect", "bonheur", "bruit", "but", "caractère", "cas",
  "choix", "concert", "cours", "crime", "côté", "discours", "droit", "début",
  "espoir", "examen", "exemple", "football", "goût", "intérêt", "jeu",
  "mariage (cérémonie)", "match", "mensonge", "mot", "moyen", "mystère",
  "niveau", "nom (d'une chose)", "nom de famille", "nombre", "numéro",
  "pouvoir", "prix", "problème", "projet", "prénom", "repos", "rire",
  "résultat", "rêve", "rêve (souhait)", "rôle", "secret", "sens", "sentiment",
  "service", "son", "succès", "système", "trajet", "travail", "vol", "voyage",
  "âge", "événement",
];

const LISTS: [NounCategory, string[]][] = [
  ["human", HUMAN],
  ["animal", ANIMAL],
  ["place", PLACE],
  ["area", AREA],
  ["object", OBJECT],
  ["text", TEXT],
  ["food", FOOD],
  ["drink", DRINK],
  ["time", TIME],
  ["abstract", ABSTRACT],
];

/** traduction française → classe. Construite une fois au chargement. */
const BY_TRANSLATION = new Map<string, NounCategory>();
for (const [category, words] of LISTS) {
  for (const word of words) BY_TRANSLATION.set(word, category);
}

/** identifiant du nom → classe. */
const BY_ID = new Map<string, NounCategory>();
for (const noun of NOUNS) {
  const category = BY_TRANSLATION.get(noun.translation);
  if (category) BY_ID.set(noun.id, category);
}

/**
 * Classe d'un nom. `undefined` seulement si la banque a changé sans que ce
 * fichier suive — check:grammar l'interdit et nomme le mot en cause.
 */
export function categoryOf(nounId: string): NounCategory | undefined {
  return BY_ID.get(nounId);
}

/** Pour les contrôles : ce que ce fichier déclare, avant croisement. */
export const DECLARED_CATEGORIES = LISTS;

// ─── Ce qui ne se compte pas ────────────────────────────────────────
//
// Deux exercices collent un CHIFFRE devant un nom tiré au hasard : l'onglet
// « Chiffres » des cas (generateNumeralExercise) et l'accord après un nombre
// du module Nombres. Sans filtre, ils servaient « 10 + нача́ло » — « dix
// débuts ». La désinence attendue (нача́л) est juste, la phrase ne veut rien
// dire, et l'apprenant se demande ce qu'il a mal lu plutôt que de réviser
// son génitif pluriel. Même famille de défaut que « je mange cet assistant »,
// que les classes sémantiques ci-dessus corrigent pour les phrases à trou.
//
// LISTE D'EXCLUSION, pas de sélection. Les noms dénombrables sont l'immense
// majorité de la banque : les énumérer serait plus long, et surtout un
// nouveau mot importé arriverait dénombrable par défaut — le bon défaut,
// puisque c'est le cas courant. check:grammar vérifie que chaque entrée
// existe dans la banque, donc une traduction retouchée à l'import ne peut
// pas désactiver une exclusion en silence.
//
// Le critère est « est-ce qu'on dit *dix X* en russe », pas la comptabilité
// du français : masses (вода, сахар, кровь), abstraits qu'on ne dénombre pas
// (счастье, свобода, внимание), référents uniques (со́лнце, луна́, не́бо),
// noms de jours et de saisons, et les quelques mots dont le pluriel existe
// mais ne se compte pas (вре́мя, у́тро). En cas d'hésitation le mot est
// exclu : un exercice en moins ne coûte rien, un exercice absurde si.
//
// À noter : ces mots restent parfaitement bons AILLEURS, y compris après une
// expression de quantité — « мно́го воды́ », « ма́ло вре́мени » sont exactement
// ce que le génitif enseigne. Seul le comptage par un cardinal les exclut.
const UNCOUNTABLE_TRANSLATIONS = [
  "amour", "art", "attention", "automne", "beurre", "bonheur", "bruit",
  "caractère", "chocolat", "ciel", "colère", "congé", "croissance",
  "dimanche", "douleur", "début", "eau", "espace", "espoir", "expérience",
  "feu", "fin", "football", "force", "formation", "fromage", "goût", "hiver",
  "humeur", "information", "intérêt", "jeudi", "joie", "jus", "liberté",
  "literie", "lundi", "lune", "mardi", "matin", "mort", "musique", "météo",
  "nature", "neige", "pain", "papier", "peau", "peur", "pluie", "police",
  "pouvoir", "printemps", "quantité", "repos", "rire", "riz", "sang",
  "santé", "sel", "sol", "soleil", "succès", "sucre", "temps", "terre",
  "thé", "viande", "vie", "vin", "vérité", "âge", "été",
];

const UNCOUNTABLE_IDS = new Set<string>();
for (const noun of NOUNS) {
  if (UNCOUNTABLE_TRANSLATIONS.includes(noun.translation)) UNCOUNTABLE_IDS.add(noun.id);
}

/** Pour les contrôles : la liste brute, avant croisement avec la banque. */
export const DECLARED_UNCOUNTABLE = UNCOUNTABLE_TRANSLATIONS;

/** Peut-on mettre un chiffre devant ce nom sans écrire une absurdité ? */
export function isCountable(nounId: string): boolean {
  return !UNCOUNTABLE_IDS.has(nounId);
}

/**
 * Le sous-ensemble comptable d'un pool. Si le filtre ne laisse rien (pool
 * déjà très réduit par le niveau), on rend le pool tel quel : un exercice
 * bancal reste préférable à un écran vide, et le cas ne se produit pas avec
 * la banque actuelle — check:grammar le vérifie à chaque niveau.
 */
export function countableNouns<T extends { id: string }>(pool: T[]): T[] {
  const kept = pool.filter((n) => isCountable(n.id));
  return kept.length > 0 ? kept : pool;
}

/**
 * Les noms dont le PLURIEL ne s'enseigne pas.
 *
 * Distinct de `isCountable`, qui répond à « peut-on mettre un cardinal
 * devant ». Les deux se recoupent largement — on ne compte pas le riz, et
 * on ne dit pas non plus « des riz » — mais pas complètement, et c'est le
 * pluriel qui a besoin d'une réponse propre depuis que l'apprenant peut le
 * demander.
 *
 * Deux familles :
 *
 * 1. LES INDÉNOMBRABLES, repris tels quels. Le nominatif isolé forçait le
 *    pluriel (pour éviter de faire retaper la forme du dictionnaire), si
 *    bien que la page demandait « ри́сы », « шокола́ды », « мяса́ »,
 *    « хле́бы ». Les formes existent au paradigme ; elles ne sont pas du
 *    russe qu'on apprend.
 *
 * 2. LES PLURIELS DÉFECTIFS, listés ici. Le dictionnaire donne un pluriel à
 *    любо́вь et à ложь parce qu'il complète mécaniquement le paradigme, mais
 *    « любви́ » et « лжи » ne s'emploient pas. Pire pour мечта́ : son génitif
 *    pluriel de dictionnaire est « мечта́ний », qui est celui de мечта́ние —
 *    l'app enseignerait le pluriel d'un autre mot.
 */
const NO_USABLE_PLURAL = new Set(["lyubov", "lozh", "mechta"]);

/** Peut-on demander le pluriel de ce nom sans enseigner une forme morte ? */
export function hasUsablePlural(nounId: string): boolean {
  return isCountable(nounId) && !NO_USABLE_PLURAL.has(nounId);
}

/**
 * Le sous-ensemble d'un pool qu'on peut mettre au pluriel. Même repli que
 * `countableNouns` : un pool vide rend le pool d'origine, parce qu'un
 * exercice bancal reste préférable à un écran vide.
 */
export function pluralisableNouns<T extends { id: string }>(pool: T[]): T[] {
  const kept = pool.filter((n) => hasUsablePlural(n.id));
  return kept.length > 0 ? kept : pool;
}

/** Pour les contrôles : la liste brute des pluriels défectifs. */
export const DECLARED_NO_PLURAL = [...NO_USABLE_PLURAL];
