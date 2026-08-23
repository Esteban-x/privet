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
