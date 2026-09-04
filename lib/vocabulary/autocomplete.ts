import { LEXICON, type LexEntry } from "./lexicon.generated";

/**
 * L'autocomplétion de la saisie, façon barre de traduction.
 *
 * DEUX BESOINS DISTINCTS, et c'est ce qui commande toute la conception :
 *
 *   1. COMPLÉTER. On tape « сущ », on veut « существова́ть » — un préfixe,
 *      donc, et il doit sortir en tête.
 *   2. CORRIGER. On tape « словар » sans le signe mou, ou « мат » pour
 *      « мать » : ce ne sont pas des préfixes valides du mot visé une fois
 *      qu'on a tapé la fin, ce sont des ORTHOGRAPHES APPROCHANTES. Il faut
 *      donc aussi une distance d'édition.
 *
 * Un seul mécanisme ne couvre pas les deux : un préfixe strict rate toute
 * faute, et une distance seule classe « мать » loin derrière une dizaine de
 * mots plus proches quand on n'a tapé que « ма ». D'où un score en paliers,
 * du plus sûr au plus spéculatif.
 *
 * TOUT EST LOCAL ET INSTANTANÉ. 562 entrées comparées à chaque frappe :
 * quelques dixièmes de milliseconde, aucun appel réseau, aucun token. La
 * suggestion du modèle (app/api/vocab/suggest) reste utile pour les mots
 * absents de la banque — les deux se complètent au lieu de se remplacer.
 */

export interface Completion {
  /** Le mot russe accentué, tel qu'on l'insérera. */
  ru: string;
  fr: string;
  kind: "n" | "v" | "adj" | "adv";
  /** Vrai quand le mot tapé n'est PAS un préfixe : c'est une correction. */
  corrected: boolean;
  /** Vrai quand l'entrée vient d'une banque relue à la main. */
  verified: boolean;
}

const KIND_LABEL: Record<Completion["kind"], string> = {
  n: "nom",
  v: "verbe",
  adj: "adjectif",
  adv: "adverbe",
};

export function kindLabel(kind: Completion["kind"]): string {
  return KIND_LABEL[kind];
}

/**
 * La forme de comparaison : sans accent tonique, sans distinction ё/е.
 *
 * L'accent est une aide de lecture que personne ne tape au clavier, et ё
 * s'écrit couramment « е » en russe courant. Les deux doivent donc
 * disparaître avant toute comparaison, sinon « ещё » ne se trouverait
 * jamais en tapant « еще ».
 */
export function bare(word: string): string {
  return word.normalize("NFC").replace(/́/g, "").replace(/ё/g, "е").trim().toLowerCase();
}

/**
 * La forme « relâchée » : sans les signes qu'on oublie le plus.
 *
 * Le signe mou et le signe dur ne s'entendent pas — ils modifient la
 * consonne qui précède. Un francophone qui écrit ce qu'il entend les omet
 * systématiquement (« словар », « мат »). Й et и se confondent aussi à
 * l'oreille. Les retirer des DEUX côtés de la comparaison rattrape ces
 * fautes sans rien coûter.
 */
function loose(word: string): string {
  return bare(word).replace(/[ьъ]/g, "").replace(/й/g, "и");
}

/**
 * Distance de Levenshtein, abandonnée dès qu'elle dépasse `max`.
 *
 * L'abandon anticipé n'est pas une optimisation gratuite : sans lui, on
 * calculerait la matrice complète pour les 562 entrées à chaque frappe,
 * dont l'immense majorité n'a aucune chance d'être proche. Avec, on sort en
 * quelques cellules pour tout ce qui commence différemment.
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (row[j] < best) best = row[j];
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/** Plus le score est bas, plus la proposition est sûre. */
function score(entry: LexEntry, typedBare: string, typedLoose: string): number | null {
  const wordBare = bare(entry[0]);
  if (wordBare === typedBare) return 0;
  if (wordBare.startsWith(typedBare)) return 1 + wordBare.length / 100;

  const wordLoose = loose(entry[0]);
  if (wordLoose.startsWith(typedLoose)) return 2 + wordLoose.length / 100;

  // La correction ne s'active qu'à partir de trois lettres : en dessous,
  // une distance de 1 rapproche des dizaines de mots sans rapport et la
  // liste devient du bruit.
  if (typedBare.length >= 3) {
    const max = typedBare.length <= 4 ? 1 : 2;
    const d = editDistance(wordLoose, typedLoose, max);
    if (d <= max) return 3 + d;
  }

  // En dernier recours, le mot tapé se trouve QUELQUE PART dans l'entrée :
  // utile pour un préfixe verbal qu'on ne connaît pas (« ходи́ть » depuis
  // « ход »).
  if (typedBare.length >= 4 && wordBare.includes(typedBare)) return 5;
  return null;
}

/**
 * Les complétions d'une saisie russe, de la plus sûre à la plus lointaine.
 *
 * `exclude` évite de proposer le mot déjà exactement écrit : une liste qui
 * ne contient que ce qu'on vient de taper n'apporte rien et occupe l'écran.
 */
export function completeRu(typed: string, limit = 6): Completion[] {
  const typedBare = bare(typed);
  if (typedBare.length < 2) return [];
  const typedLoose = loose(typed);

  const scored: { entry: LexEntry; s: number }[] = [];
  for (const entry of LEXICON) {
    const s = score(entry, typedBare, typedLoose);
    if (s !== null) scored.push({ entry, s });
  }

  // À correspondance équivalente, l'entrée RELUE passe devant : c'est le
  // seul endroit où l'on peut faire pencher la balance vers la donnée
  // contrôlée sans écarter le reste.
  scored.sort(
    (a, b) =>
      a.s - b.s ||
      (b.entry[3] === 1 ? 1 : 0) - (a.entry[3] === 1 ? 1 : 0) ||
      a.entry[0].length - b.entry[0].length
  );

  return scored.slice(0, limit).map(({ entry, s }) => ({
    ru: entry[0],
    fr: entry[1],
    kind: entry[2],
    // Au-delà du palier 2, le mot tapé n'est plus un début du mot proposé :
    // c'est une correction, et l'interface doit le dire autrement.
    corrected: s >= 3,
    verified: entry[3] === 1,
  }));
}

/** Le pendant français : on tape « livre », on obtient « кни́га ». */
export function completeFr(typed: string, limit = 6): Completion[] {
  const key = typed
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^(?:l'|le |la |les |un |une |des )/, "")
    .trim();
  if (key.length < 2) return [];

  const scored: { entry: LexEntry; s: number }[] = [];
  for (const entry of LEXICON) {
    const fr = entry[1]
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    if (fr === key) scored.push({ entry, s: 0 });
    else if (fr.startsWith(key)) scored.push({ entry, s: 1 + fr.length / 100 });
    // Les traductions contiennent souvent plusieurs sens (« beau / belle ») :
    // on cherche donc aussi à l'intérieur.
    else if (key.length >= 3 && fr.includes(key)) scored.push({ entry, s: 2 });
  }

  scored.sort((a, b) => a.s - b.s || a.entry[1].length - b.entry[1].length);
  return scored.slice(0, limit).map(({ entry }) => ({
    ru: entry[0],
    fr: entry[1],
    kind: entry[2],
    corrected: false,
    verified: entry[3] === 1,
  }));
}

/**
 * « Ce n'est pas un mot que je connais, et celui-ci lui ressemble beaucoup. »
 *
 * CE QUE CETTE FONCTION NE DIT PAS, ET NE PEUT PAS DIRE. L'index compte
 * 1655 entrées ; le russe en a des dizaines de milliers. « Ce mot n'existe
 * pas » serait donc faux la plupart du temps, et un formulaire qui accuse
 * l'apprenant d'une faute qu'il n'a pas faite est pire que muet — on
 * apprend à ignorer ses avertissements, y compris les justes. Elle ne
 * signale donc jamais une absence : seulement une RESSEMBLANCE, et
 * seulement quand elle est frappante.
 *
 * TROIS VERROUS CONTRE LA FAUSSE ALERTE :
 *
 *   1. Le mot tapé n'est le DÉBUT d'aucun mot connu. « кни » ne se signale
 *      pas : c'est une frappe en cours, pas une faute. C'est ce verrou qui
 *      fait tout le travail — sans lui, la moitié des saisies clignoterait
 *      en rouge avant d'être finies.
 *   2. Trois lettres au moins, et un seul mot : sur « я не знаю », une
 *      distance d'édition ne veut plus rien dire.
 *   3. Une correction pour les mots courts, deux au-delà — les mêmes
 *      paliers que la complétion, pour que les deux ne se contredisent pas.
 */
export interface NearMiss {
  /** Le mot correct, accentué, prêt à remplacer ce qui est tapé. */
  ru: string;
  fr: string;
  /** Nombre de corrections qui séparent les deux graphies. */
  distance: number;
}

export function nearMiss(typed: string): NearMiss | null {
  const typedBare = bare(typed);
  if (typedBare.length < 3 || typedBare.includes(" ")) return null;
  const typedLoose = loose(typed);
  const max = typedBare.length <= 4 ? 1 : 2;

  let best: { entry: LexEntry; d: number } | null = null;
  for (const entry of LEXICON) {
    const wordBare = bare(entry[0]);
    // Écrit exactement : il n'y a rien à corriger.
    if (wordBare === typedBare) return null;
    // Début d'un mot connu : la frappe est en cours, on se tait.
    if (wordBare.startsWith(typedBare) || loose(entry[0]).startsWith(typedLoose)) return null;

    const d = editDistance(loose(entry[0]), typedLoose, max);
    if (d <= max && (best === null || d < best.d)) best = { entry, d };
  }

  return best ? { ru: best.entry[0], fr: best.entry[1], distance: best.d } : null;
}

/**
 * La réponse EXACTE de l'index, s'il en a une.
 *
 * POURQUOI CE N'EST PAS `completeRu(...)[0]`. La complétion propose des
 * approchants — c'est son rôle dans un menu, où l'apprenant tranche. Ici on
 * répond à sa place : il faut donc une correspondance stricte, à l'accent
 * tonique et au ё près, ou rien. Renvoyer un approchant comme si c'était la
 * traduction demandée serait exactement le défaut qu'on cherche à corriger.
 */
export function exactEntry(
  typed: string,
  from: "ru" | "fr"
): { ru: string; fr: string; kind: Completion["kind"]; verified: boolean } | null {
  if (from === "ru") {
    const key = bare(typed);
    if (!key) return null;
    const hit = LEXICON.find((e) => bare(e[0]) === key);
    return hit ? { ru: hit[0], fr: hit[1], kind: hit[2], verified: hit[3] === 1 } : null;
  }

  const key = typed
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^(?:l'|le |la |les |un |une |des )/, "")
    .trim();
  if (!key) return null;
  const hit = LEXICON.find(
    (e) =>
      e[1]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") === key
  );
  return hit ? { ru: hit[0], fr: hit[1], kind: hit[2], verified: hit[3] === 1 } : null;
}
