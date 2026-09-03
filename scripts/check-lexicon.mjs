/**
 * Contrôles du lexique d'autocomplétion — `npm run check:lexicon`.
 *
 * POURQUOI CE SCRIPT EXISTE. L'index d'autocomplétion est le seul endroit
 * de l'app où du vocabulaire arrive sans être passé par une banque relue.
 * Il agrège des gloses de leçons, des banques écrites à la main et 1 400
 * mots produits par un modèle. Rien ne le confrontait à une source, et il
 * contenait :
 *
 *   « абва́к »       donné pour « alphabet » — le mot n'existe pas
 *   « буста́льтер »  donné pour « soutien-gorge » — inexistant aussi
 *   « аптека́ »      pour « апте́ка » — accent sur la mauvaise syllabe
 *   « бор́щ »        accent posé sur une consonne, invisible à l'œil
 *   « теплый »      sans son ё, donc imprononçable pour un débutant
 *
 * Ces mots ne restaient pas dans un menu : l'apprenant les ajoute à sa
 * liste, ils deviennent des cartes, des QCM, des réponses à taper. Un mot
 * inventé est alors appris comme du russe, et l'app en est la seule source.
 *
 * Le filtre vit dans scripts/lib/lexicon-gate.mjs et s'applique à la
 * CONSTRUCTION (build-lexicon.mjs, build-lexicon-ai.mjs). Ce script vérifie
 * que la construction a bien été rejouée : un fichier généré qui a dérivé
 * de sa source est un fichier édité à la main, et c'est précisément ce que
 * son en-tête interdit.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
import { loadDictionary } from "./lib/dictionary.mjs";
import { gate } from "./lib/lexicon-gate.mjs";
import { inspect, vowelCount, carriesStress, stripAccent } from "./lib/cyrillic.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });

const { LEXICON } = await jiti.import("../lib/vocabulary/lexicon.generated.ts");
const { AI_LEXICON } = await jiti.import("../lib/vocabulary/lexicon-ai.generated.ts");

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

const dict = await loadDictionary();

/**
 * `generated: true` pour le lexique du modèle : un mot qu'aucun
 * dictionnaire ne connaît y est une invention, et doit avoir été supprimé.
 * `generated: false` pour l'index fusionné : il contient aussi des mots
 * vouchés à la main, que la source ignore sans qu'ils soient faux.
 */
const BANKS = [
  ["lexicon.generated.ts", LEXICON, false],
  ["lexicon-ai.generated.ts", AI_LEXICON, true],
];

const REBUILD = "npm run build:lexicon:ai -- --prune && npm run build:lexicon";

// ─── 1. Chaque entrée tient devant le dictionnaire ─────────────────
for (const [name, rows, generated] of BANKS) {
  for (const entry of rows) {
    const [word, translation] = entry;
    const verdict = gate(word, dict, { generated });
    require_(
      verdict.action === "keep",
      `${name} : « ${word} » (${translation}) — ${verdict.reason}. Rejoue : ${REBUILD}`
    );
  }
}

// ─── 2. Hygiène typographique ──────────────────────────────────────
//
// Trois défauts qu'aucun contrôle grammatical n'attrape parce qu'ils ne
// sont pas grammaticaux : l'alphabet latin mêlé au cyrillique, l'accent
// posé sur une consonne, le polysyllabe nu.
for (const [name, rows] of BANKS) {
  for (const entry of rows) {
    const word = entry[0];
    for (const problem of inspect(word, `${name} : ${word}`, { requireStress: false })) {
      require_(false, problem);
    }
    require_(
      vowelCount(word) <= 1 || carriesStress(word),
      `${name} : « ${word} » est polysyllabique et non accentué — la ` +
        `translittération lit l'accent pour décider de la réduction vocalique`
    );
  }
}

// ─── 3. Pas de doublon à l'accent près ─────────────────────────────
//
// L'index se cherche sur la forme repliée (accent retiré, ё ramené à е) :
// deux entrées qui se replient pareil sont indiscernables à la recherche,
// et la seconde est morte.
for (const [name, rows] of BANKS) {
  const seen = new Map();
  for (const entry of rows) {
    const key = stripAccent(entry[0]).replace(/ё/g, "е").toLowerCase();
    require_(
      !seen.has(key),
      `${name} : « ${entry[0]} » et « ${seen.get(key)} » se replient sur la même clé`
    );
    seen.set(key, entry[0]);
  }
}

// ─── Rapport ───────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n✗ ${failures.length} problème(s) sur ${checks} contrôles :\n`);
  for (const f of failures.slice(0, 40)) console.error(`  ${f}`);
  if (failures.length > 40) console.error(`  … et ${failures.length - 40} autres`);
  console.error("");
  process.exit(1);
}

const reviewed = LEXICON.filter((e) => e[3] === 1).length;
console.log(`✓ ${checks} contrôles passés.`);
console.log(
  `  ${LEXICON.length} entrées dans l'index (${reviewed} issues d'une banque relue), ` +
    `${AI_LEXICON.length} proposées par le modèle`
);
console.log(`  dictionnaire de référence : ${dict.size} lemmes, ${dict.forms} formes fléchies`);
