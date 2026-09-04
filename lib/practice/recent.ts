"use client";

import { loadRecentDraws, saveRecentDraws, type RecentDraws } from "@/lib/storage";

/**
 * La mémoire courte du tirage : ce qui vient d'être montré, et donc ce qu'il
 * vaut mieux ne pas remontrer tout de suite.
 *
 * LE PROBLÈME QU'ELLE RÈGLE. Tous les modules tiraient au hasard sans
 * mémoire — `pickRandom` dans le module Cas, `pick` dans les autres. Sur un
 * vivier de 3 mots (« Я занима́юсь ___ » n'en admet que trois au niveau A1),
 * un tirage sans mémoire redonne le même mot une fois sur trois, et deux
 * fois de suite une fois sur neuf. L'apprenant, lui, appelle ça « je tombe
 * toujours sur les mêmes ».
 *
 * CE QUE CE N'EST PAS. Ni un SRS (la révision espacée vit dans lib/srs), ni
 * une progression (elle est en base, par déclencheur). Juste un anneau
 * d'identifiants par compétence, sur l'appareil, qui biaise le tirage
 * suivant.
 *
 * POURQUOI UN CHOIX ENTRE PLUSIEURS CANDIDATS, ET PAS UN FILTRE. Filtrer le
 * vivier obligerait à savoir ce qu'il contient — or il change selon le
 * niveau, le déclencheur, le nombre demandé —, et un filtre trop large sur
 * un petit vivier ne rend plus rien : il faut alors décider quoi faire de
 * l'écran vide. On tire donc plusieurs fois avec le tirage existant (poids
 * par palier, précision par déclencheur : tout est conservé) et on garde le
 * candidat vu le moins récemment. Sur un vivier de 3, cela donne une
 * rotation quasi parfaite ; sur un vivier de 300, le premier candidat est
 * presque toujours inédit et la boucle s'arrête au premier tour.
 */

/** Tirages mémorisés par compétence. Au-delà, les plus anciens sortent. */
const RING_SIZE = 40;

/**
 * Compétences mémorisées. Il y en a une trentaine dans l'application (huit
 * modules × leurs onglets) : ce plafond n'écarte donc que les pages qu'on
 * n'a pas ouvertes depuis longtemps, et il borne la taille de l'entrée dans
 * le stockage.
 */
const MAX_KEYS = 24;

/** Candidats comparés avant de trancher. */
const DEFAULT_TRIES = 24;

// Le stockage est lu une fois puis tenu en mémoire : `drawFresh` est appelé
// à chaque exercice, relire et reparser le JSON à chaque tirage serait payer
// pour rien. Hors navigateur (scripts de contrôle, rendu serveur) le cache
// existe quand même et fait office de mémoire de session — c'est ce qui
// permet à scripts/check-variety.mjs de rejouer une vraie session.
let cache: RecentDraws | null = null;

function store(): RecentDraws {
  if (cache === null) cache = loadRecentDraws();
  return cache;
}

/**
 * Nombre de tirages effectués depuis la dernière apparition de `id`, sur
 * cette compétence. `Infinity` si on ne l'a jamais vu — c'est le meilleur
 * score possible, et celui qui fait sortir de la boucle au premier tour.
 */
function freshness(ring: string[][], id: string): number {
  for (let i = ring.length - 1; i >= 0; i -= 1) {
    if (ring[i].includes(id)) return ring.length - 1 - i;
  }
  return Infinity;
}

/**
 * Ce que vaut un candidat : d'abord la fraîcheur de son identifiant le PLUS
 * récent, puis celle de tous les autres.
 *
 * POURQUOI DEUX NOMBRES. Un exercice porte plusieurs identifiants — voir
 * `drawFresh` — et il suffit qu'un seul soit frais du jour pour qu'on ait
 * l'impression de le revoir : le minimum commande donc. Mais le minimum
 * seul aveugle le reste. Sur la page du nominatif, qui n'a que cinq
 * déclencheurs, TOUS les candidats en ont un vu récemment : leur minimum est
 * bas et identique, et la phrase — dont il existe pourtant six par
 * déclencheur — n'était plus départagée du tout. Une même phrase sortait
 * onze fois sur cinquante.
 *
 * Le total tranche donc les ex æquo. L'infini y compte pour la taille de
 * l'anneau : « jamais vu » ne doit pas écraser la comparaison à lui seul.
 */
interface Score {
  worst: number;
  total: number;
}

function scoreOf(ring: string[][], ids: string[]): Score {
  let worst = Infinity;
  let total = 0;
  for (const id of ids) {
    const value = freshness(ring, id);
    if (value < worst) worst = value;
    total += Math.min(value, ring.length);
  }
  return { worst, total };
}

function isBetter(a: Score, b: Score): boolean {
  return a.worst !== b.worst ? a.worst > b.worst : a.total > b.total;
}

/** Enregistre un tirage. À appeler une fois l'exercice réellement retenu. */
export function rememberDraw(key: string, ids: string[]) {
  if (ids.length === 0) return;
  const current = store();
  const ring = current[key] ?? [];
  // La clé est réécrite en fin d'objet : l'ordre d'insertion des clés d'un
  // objet JS est conservé, ce qui donne un « moins récemment utilisé »
  // gratuit pour l'élagage ci-dessous.
  delete current[key];
  current[key] = [...ring, ids].slice(-RING_SIZE);

  const keys = Object.keys(current);
  for (const stale of keys.slice(0, Math.max(0, keys.length - MAX_KEYS))) {
    delete current[stale];
  }
  saveRecentDraws(current);
}

/**
 * Choisit un exercice sans l'enregistrer.
 *
 * Réservé au cas où le tirage n'est pas le dernier mot — le module Cas peut
 * encore remplacer le mot choisi par celui d'une phrase rédigée à la volée,
 * et c'est CE mot-là qu'il faut mémoriser. Partout ailleurs, `drawFresh`.
 */
export function pickFresh<T>(
  key: string,
  draw: () => T,
  idsOf: (item: T) => string[],
  tries = DEFAULT_TRIES
): T {
  const ring = store()[key] ?? [];
  let best: T | null = null;
  let bestScore: Score | null = null;

  for (let i = 0; i < tries; i += 1) {
    const candidate = draw();
    const score = scoreOf(ring, idsOf(candidate));
    // Rien de connu là-dedans : inutile de chercher mieux, il n'y a pas mieux.
    if (score.worst === Infinity) return candidate;
    if (bestScore === null || isBetter(score, bestScore)) {
      best = candidate;
      bestScore = score;
    }
  }
  // `best` est renseigné dès le premier tour : `tries` est toujours ≥ 1.
  // Aucun candidat n'est jamais refusé faute de mieux — on ne rend pas un
  // écran vide parce que le vivier est petit, on rend le moins récent.
  return best as T;
}

/**
 * Tire un exercice en évitant ce qui vient de sortir, et le mémorise.
 *
 * `idsOf` rend les identifiants de l'exercice, du plus précis au plus
 * grossier. Le premier identifie l'exercice exact ; les suivants nomment ce
 * qui suffit à donner l'impression du déjà-vu — le déclencheur d'une phrase,
 * le mot décliné. Tous comptent (voir `scoreOf`).
 */
export function drawFresh<T>(
  key: string,
  draw: () => T,
  idsOf: (item: T) => string[],
  tries = DEFAULT_TRIES
): T {
  const chosen = pickFresh(key, draw, idsOf, tries);
  rememberDraw(key, idsOf(chosen));
  return chosen;
}

/**
 * Vide la mémoire. Pour les contrôles, qui rejouent plusieurs sessions
 * indépendantes dans un même processus.
 */
export function resetRecent(key?: string) {
  const current = store();
  if (key === undefined) {
    for (const k of Object.keys(current)) delete current[k];
  } else {
    delete current[key];
  }
  saveRecentDraws(current);
}
