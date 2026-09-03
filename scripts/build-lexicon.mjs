/**
 * Construit l'index d'autocomplétion à partir des banques du projet.
 *
 * POURQUOI UN FICHIER GÉNÉRÉ PLUTÔT QU'UN IMPORT DIRECT. Les banques pèsent
 * lourd : `nouns-data.generated.ts` fait 412 Ko à lui seul, avec les douze
 * formes fléchies de chaque nom, le schéma accentuel et l'animacité. Les
 * importer depuis un composant CLIENT enverrait tout cela au navigateur
 * pour n'y lire que deux champs. Ce script en extrait le strict nécessaire
 * — le mot, sa traduction, sa nature — soit une trentaine d'octets par
 * entrée au lieu de plusieurs centaines.
 *
 * La sortie est versionnée, comme `nouns-data.generated.ts` : on ne
 * régénère qu'en ajoutant du vocabulaire, et la construction du site ne
 * dépend d'aucun script.
 *
 *   npm run build:lexicon
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { loadDictionary } from "./lib/dictionary.mjs";
import { gate } from "./lib/lexicon-gate.mjs";

const root = process.cwd();
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, { alias: { "@": root } });
const load = (rel) => jiti(path.join(root, rel));

/** Accent tonique et ё retirés : c'est la forme sur laquelle on compare. */
const bare = (w) =>
  w.normalize("NFC").replace(/́/g, "").replace(/ё/g, "е").trim().toLowerCase();

/**
 * Le dictionnaire OpenRussian, seul arbitre de deux questions que ce
 * script ne savait pas poser : ce mot existe-t-il, et son accent tonique
 * est-il au bon endroit ?
 *
 * Il ne servait jusqu'ici qu'à bâtir la banque de noms. L'index
 * d'autocomplétion, lui, agrégeait des banques écrites à la main et un
 * lexique produit par un modèle, sans que rien ne les confronte à une
 * source : 138 mots inexistants et 234 accents faux y avaient pris place.
 */
const dict = await loadDictionary();
/** Ce que le filtre a corrigé ou supprimé — imprimé à la fin, pour le commit. */
const fixedByDictionary = [];
const droppedByDictionary = [];

/** Une entrée par mot : [affichage accentué, traduction, nature]. */
const entries = new Map();
/** Les clés issues des banques relues à la main — elles font autorité. */
const curated = new Set();

/** Distance d'édition bornée à 1 : on ne cherche qu'un caractère d'écart. */
function differsByOne(a, b) {
  if (a === b) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let diff = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    if (++diff > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return diff + (a.length - i) + (b.length - j) <= 1;
}

/**
 * Une entrée générée est-elle une DÉFORMATION d'un mot déjà connu ?
 *
 * Le modèle a produit « спаси́ба » à côté de « спаси́бо » — une seule lettre
 * d'écart, la même traduction, et la faute passait devant le mot correct
 * dans la liste. C'est le risque propre au vocabulaire généré : il ne se
 * trompe pas au hasard, il se trompe de façon PLAUSIBLE, donc invisible à
 * la relecture rapide.
 *
 * La règle attrape exactement ce cas — un caractère d'écart ET la même
 * traduction — sans écarter les vraies paires minimales (« суп » / « суд »,
 * « мать » / « матч »), qui ont des sens différents.
 */
function isDeformation(key, translation) {
  const fr = translation.trim().toLowerCase();
  for (const other of curated) {
    if (!differsByOne(key, other)) continue;
    if (entries.get(other)?.[1].trim().toLowerCase() === fr) return true;
  }
  return false;
}

function add(display, translation, kind, generated = false) {
  if (!display || !translation) return;

  // LE FILTRE EST ICI, pas dans les sources. Chaque banque a sa raison de
  // se tromper — une glose de leçon recopiée sans accent, un mot inventé
  // par un modèle — et une seule porte donne sur l'index : autant la garder.
  const verdict = gate(display, dict, { generated });
  if (verdict.action === "drop") {
    droppedByDictionary.push(`${display} (${translation})`);
    return;
  }
  if (verdict.action === "fix") {
    fixedByDictionary.push(`${display} -> ${verdict.display}`);
    display = verdict.display;
  }

  const key = bare(display);
  if (!key || entries.has(key)) return;
  if (generated && isDeformation(key, translation)) {
    dropped.push(display.trim());
    return;
  }
  // Le 4e élément marque une entrée RELUE. Il n'est écrit que dans ce cas :
  // sur 1 750 entrées, un `false` explicite partout pèserait plus que
  // l'information qu'il porte.
  const row = [display.normalize("NFC").trim(), translation.trim(), kind];
  if (!generated) {
    row.push(1);
    curated.add(key);
  }
  entries.set(key, row);
}

/** Ce que la règle ci-dessus a écarté — affiché à la fin, pour contrôle. */
const dropped = [];

// ─── Noms : 451, traductions relues à la main ────────────────────
for (const n of load("lib/grammar/nouns-data.ts").NOUNS) {
  // `forms.singular[0]` porte l'accent tonique ; `lemma` ne l'a pas.
  add(n.forms?.singular?.[0] ?? n.lemma, n.translation, "n");
}

// ─── Adjectifs ───────────────────────────────────────────────────
for (const a of load("lib/grammar/adjectives-data.ts").ADJECTIVES) {
  add(a.lemmaM, a.translation, "adj");
}

// ─── Verbes : conjugaison, aspect, mouvement ─────────────────────
for (const v of load("lib/conjugation/verbs.ts").VERBS) {
  add(v.infinitive, v.translation, "v");
}
for (const p of load("lib/aspect/verbs.ts").ASPECT_PAIRS) {
  add(p.imperfective, p.translation, "v");
  add(p.perfective, p.translation, "v");
}
// Les champs s'appellent `uni` et `multi` — pas `unidirectional`. La
// version précédente lisait les mauvais noms et le `catch` avalait le
// résultat vide : les douze verbes de mouvement, les plus fréquents de la
// langue, n'ont jamais atteint l'autocomplétion. Un `catch` muet autour
// d'un accès de champ ne protège de rien, il cache.
{
  const { MOTION_PAIRS } = load("lib/motion/verbs.ts");
  for (const pair of MOTION_PAIRS) {
    add(pair.uni, pair.translation, "v");
    add(pair.multi, pair.translation, "v");
  }
}

// ─── Mots isolés glosés dans les leçons ─────────────────────────
// Les unités contiennent 558 paires ru/fr, dont l'immense majorité sont des
// PHRASES d'exemple. On ne retient que les entrées d'un seul mot : une
// phrase n'a rien à faire dans une liste de complétion.
//
// Les tableaux de familles de mots (« -уч- : учить, учитель, ученик… ») sont
// volontairement écartés : leur glose est celle de la RACINE, pas de chaque
// mot. Proposer « учи́тель = apprendre » serait faux, et une suggestion
// fausse est pire que pas de suggestion.
const PAIR = /\{\s*ru:\s*"([^"]*)"\s*,\s*fr:\s*"([^"]*)"/g;
const unitsDir = path.join(root, "lib/courses/units");
for (const file of fs.readdirSync(unitsDir).filter((f) => f.endsWith(".ts"))) {
  const text = fs.readFileSync(path.join(unitsDir, file), "utf8");
  for (const m of text.matchAll(PAIR)) {
    const [, ru, fr] = m;
    if (ru.trim().split(/\s+/).length !== 1 || ru.trim().length < 3) continue;
    if (!/^[А-Яа-яЁё́-]+$/.test(ru.trim())) continue;
    add(ru, fr, "n");
  }
}

// ─── Vocabulaire produit par le modèle, EN DERNIER ──────────────
//
// L'ORDRE EST LE MÉCANISME DE PRIORITÉ. `add()` ignore une clé déjà
// présente : tout ce qui vient des banques curées ci-dessus — traductions
// relues à la main, accents toniques vérifiés par `npm run check:grammar` —
// est donc à l'abri. Le modèle ne peut que COMPLÉTER, jamais contredire.
//
// C'est ce qui rend acceptable d'élargir l'index par génération : la partie
// dont dépendent les exercices reste entièrement humaine, et la partie
// générée ne sert qu'à proposer un mot dans un menu, où une erreur se
// corrige d'une frappe.
try {
  const { AI_LEXICON } = load("lib/vocabulary/lexicon-ai.generated.ts");
  let added = 0;
  for (const [ru, fr, kind] of AI_LEXICON) {
    const before = entries.size;
    add(ru, fr, kind === "adv" ? "adv" : kind, true);
    if (entries.size > before) added += 1;
  }
  console.log(`Apport du modèle : ${added} mots nouveaux sur ${AI_LEXICON.length}.`);
} catch {
  console.log("Pas de lexique généré (npm run build:lexicon:ai pour le produire).");
}

const rows = [...entries.values()].sort((a, b) => a[0].localeCompare(b[0], "ru"));
const chars = rows.reduce((n, r) => n + r[0].length + r[1].length, 0);

const out = `// GÉNÉRÉ PAR scripts/build-lexicon.mjs — NE PAS ÉDITER À LA MAIN.
//
// Index d'autocomplétion : le mot russe accentué, sa traduction, sa nature.
// Voir lib/vocabulary/autocomplete.ts pour la recherche.

/** n = nom, v = verbe, adj = adjectif, adv = adverbe ou mot de liaison. */
export type LexKind = "n" | "v" | "adj" | "adv";

/**
 * [mot accentué, traduction, nature] — et un 4e élément \`1\` quand l'entrée
 * vient d'une banque RELUE À LA MAIN.
 *
 * Tuple plutôt qu'objet : ${rows.length} entrées, les noms de champs
 * pèseraient plus que les données.
 *
 * POURQUOI DISTINGUER. Le vocabulaire produit par un modèle ne se trompe
 * pas au hasard : il se trompe de façon PLAUSIBLE. La construction écarte
 * les déformations d'un mot connu, mais elle ne peut rien contre une
 * traduction inventée pour un mot qu'aucune banque ne contient. L'apprenant
 * doit donc pouvoir voir, dans la liste, ce qui a été vérifié et ce qui est
 * une proposition.
 */
export type LexEntry = readonly [string, string, LexKind] | readonly [string, string, LexKind, 1];

export const LEXICON: readonly LexEntry[] = [
${rows
  .map(
    ([w, t, k, v]) =>
      `  [${JSON.stringify(w)}, ${JSON.stringify(t)}, ${JSON.stringify(k)}${v ? ", 1" : ""}],`
  )
  .join(String.fromCharCode(10))}
];
`;

const target = path.join(root, "lib/vocabulary/lexicon.generated.ts");
fs.writeFileSync(target, out, "utf8");

if (dropped.length) {
  console.log(`Écartés (déformation d'un mot curé) : ${dropped.join(", ")}`);
}
if (fixedByDictionary.length) {
  console.log(`Accents corrigés par le dictionnaire : ${fixedByDictionary.length}`);
  for (const f of fixedByDictionary) console.log(`   ${f}`);
}
if (droppedByDictionary.length) {
  console.log(`Supprimés (absents du dictionnaire) : ${droppedByDictionary.length}`);
  for (const d of droppedByDictionary) console.log(`   ${d}`);
}

const byKind = rows.reduce((acc, r) => ({ ...acc, [r[2]]: (acc[r[2]] ?? 0) + 1 }), {});
console.log(
  `Lexique : ${rows.length} entrées ` +
    `(${byKind.n ?? 0} noms, ${byKind.v ?? 0} verbes, ${byKind.adj ?? 0} adjectifs), ` +
    `${chars} caractères utiles.`
);
