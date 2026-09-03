/**
 * Génère lib/grammar/nouns-data.generated.ts — `npm run build:nouns`.
 *
 * Pourquoi un import plutôt qu'une banque écrite à la main : une part de la
 * morphologie russe n'est PAS dérivable de l'orthographe du lemme (voyelle
 * mobile : кусо́к -> куск-, mais уро́к -> урок- ; schéma accentuel :
 * врачо́м vs ме́сяцем ; pluriels supplétifs : челове́к -> лю́ди). Mesuré sur
 * ce dictionnaire, notre moteur de règles retombe sur la bonne forme dans
 * ~76 % des cas seulement. Pour une app qui présente la forme comme LA
 * bonne réponse, ce n'est pas assez : le dictionnaire fait foi, le moteur
 * ne sert plus qu'à expliquer la règle et à repérer les irrégularités.
 *
 * Sources :
 * - morphologie + accents toniques : OpenRussian (github.com/Badestrand/
 *   russian-dictionary), CC BY-SA 4.0 ;
 * - sélection, traductions françaises et genre français :
 *   scripts/data/nouns-fr.tsv, écrit et relu à la main.
 *
 * Le CSV source (8 Mo) n'est pas versionné : il est téléchargé au premier
 * lancement dans scripts/.cache/ (ignoré par git).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, "scripts", ".cache");
const CSV = path.join(CACHE, "nouns.csv");
const FREQ = path.join(CACHE, "ru_50k.txt");
const SOURCE_URL =
  "https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/nouns.csv";
// Liste de fréquence (sous-titres) : donne à chaque mot un rang d'usage, pour
// servir du vocabulaire courant à un débutant et des mots plus rares à un
// avancé. Ce n'est pas de la morphologie — une approximation d'usage suffit.
const FREQ_URL =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ru/ru_50k.txt";
const TSV = path.join(ROOT, "scripts", "data", "nouns-fr.tsv");
const OUT = path.join(ROOT, "lib", "grammar", "nouns-data.generated.ts");

const FORMS = [
  "sg_nom", "sg_gen", "sg_dat", "sg_acc", "sg_inst", "sg_prep",
  "pl_nom", "pl_gen", "pl_dat", "pl_acc", "pl_inst", "pl_prep",
];
const CYRILLIC = /^[а-яё']+$/;
/** Rang attribué à un mot absent de la liste de fréquence. */
const RARE_RANK = 50000;
const GENDER = { m: "masculine", f: "feminine", n: "neuter" };

/**
 * Animacité corrigée à la main, par lemme.
 *
 * OpenRussian marque `animate=0` sur quelques noms de personnes. L'erreur
 * ne se voit pas dans les FORMES — le dictionnaire donne bien
 * acc.sg = gen.sg (ме́неджера) — mais le drapeau, lui, sert ailleurs :
 * il choisit la désinence de l'ADJECTIF accordé à l'accusatif masculin, et
 * il filtre ce qu'un adjectif peut qualifier. Sans correction, le module
 * proposait « синий менеджер » et attendait « синий » là où il faut
 * « синего ».
 *
 * Les collectifs (семья, полиция, армия, команда…) ne sont PAS concernés :
 * ils désignent des personnes mais sont grammaticalement inanimés en russe,
 * et le dictionnaire a raison sur eux.
 */
const ANIMACY_OVERRIDES = {
  "менеджер": "animate",
  "режиссёр": "animate",
};

/**
 * Formes corrigées à la main, par lemme puis par case.
 *
 * LE DICTIONNAIRE SE TROMPE AUSSI. L'import est fidèle — les 451 noms et
 * leurs 5 412 formes correspondent exactement à OpenRussian — mais fidèle
 * n'est pas juste, et rien ne testait la COHÉRENCE INTERNE d'un paradigme.
 * L'invariant d'animacité (animé => acc. pl. = gén. pl. ; inanimé =>
 * acc. pl. = nom. pl.) suffit à sortir les trois entrées ci-dessous, et il
 * est désormais vérifié par npm run check:grammar.
 *
 * Chaque correction porte sa justification : c'est une divergence assumée
 * d'avec la source, pas une retouche de confort.
 */
const FORM_OVERRIDES = {
  // тень est inanimé : l'accusatif pluriel copie le nominatif (те́ни), pas
  // le génitif. Le dictionnaire donnait « тене́й », ce qui aurait enseigné
  // l'accord animé sur un mot qui ne l'est pas.
  "тень": { pl_acc: "те'ни" },
  // при́зрак est animé en russe (при́зрака, при́зраков) ; le dictionnaire le
  // déclarait animé mais lui donnait un paradigme inanimé, les deux se
  // contredisant dans la même entrée.
  "призрак": { sg_acc: "при'зрака", pl_acc: "при'зраков" },
  // живо́тное est animé et se décline comme un adjectif : accusatif pluriel
  // en -ых, comme le génitif.
  "животное": { pl_acc: "живо'тных" },
};

// Translittération pour les identifiants : стол -> stol, учитель -> uchitel.
// Stable dans le temps (les ids servent de clés dans case_progress et dans
// les composants de référence), donc à ne pas changer à la légère.
const TRANSLIT = {
  а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"yo", ж:"zh", з:"z", и:"i",
  й:"y", к:"k", л:"l", м:"m", н:"n", о:"o", п:"p", р:"r", с:"s", т:"t",
  у:"u", ф:"f", х:"kh", ц:"ts", ч:"ch", ш:"sh", щ:"shch", ъ:"", ы:"y",
  ь:"", э:"e", ю:"yu", я:"ya",
};
const translit = (w) => [...w].map((c) => TRANSLIT[c] ?? "").join("");

const VOWELS = "аеёиоуыэюя";
/** "рабо'та" -> "рабо́та" (accent combinant). Non marqué sur un monosyllabe. */
function accentuate(form) {
  const bare = form.replace(/'/g, "");
  const vowels = [...bare].filter((c) => VOWELS.includes(c)).length;
  if (vowels <= 1) return bare;
  return form.replace(/'/g, "́");
}
const strip = (s) => s.replace(/'/g, "");

async function download(url, target, label) {
  if (fs.existsSync(target)) return;
  fs.mkdirSync(CACHE, { recursive: true });
  process.stdout.write(`Téléchargement ${label}…\n`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`téléchargement impossible (HTTP ${res.status}) : ${url}`);
  fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
}

async function ensureSources() {
  await download(SOURCE_URL, CSV, "du dictionnaire OpenRussian");
  await download(FREQ_URL, FREQ, "de la liste de fréquence");
}

/** lemme -> rang d'usage (1 = le plus fréquent). Absent = mot rare. */
function loadFrequency() {
  const ranks = new Map();
  const lines = fs.readFileSync(FREQ, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const word = lines[i].split(" ")[0];
    if (word && !ranks.has(word)) ranks.set(word, i + 1);
  }
  return ranks;
}

function loadDictionary() {
  const lines = fs.readFileSync(CSV, "utf8").split("\n");
  const head = lines[0].split("\t").map((h) => h.trim());
  const byBare = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split("\t");
    if (cells.length < head.length) continue;
    const r = Object.fromEntries(head.map((h, j) => [h, (cells[j] ?? "").trim()]));
    if (!byBare.has(r.bare)) byBare.set(r.bare, r);
  }
  return byBare;
}

/**
 * Une forme peut lister des variantes ("рабо'той, рабо'тою" — la seconde est
 * archaïsante). On ne garde que la première, la seule qu'un apprenant a
 * intérêt à produire ; les variantes rares restent rattrapées par la
 * vérification IA d'app/api/cases/attempt. Un astérisque marque une forme
 * non standard : le mot entier est alors refusé.
 */
/**
 * TOUTES les formes que le dictionnaire donne pour une case, la principale
 * en tête.
 *
 * On n'en gardait qu'une, et les autres étaient perdues : le dictionnaire
 * écrit « дочерьми́, дочеря́ми » ou « тёть, тёте́й » parce que les deux se
 * disent. Un apprenant qui tapait la seconde était compté FAUX — sauf s'il
 * était connecté, dans son quota, et que la relecture payante par le modèle
 * le rattrapait. Sur le plan gratuit, c'était une faute sèche sur une
 * réponse juste. 148 cases sont concernées.
 */
function canonicalForms(raw) {
  if (!raw || raw.includes("*")) return [];
  return raw
    .split(/,|\/\//)
    .map((f) => f.trim())
    .filter((f) => f && CYRILLIC.test(f));
}

function loadWanted() {
  const wanted = [];
  const lines = fs.readFileSync(TSV, "utf8").split("\n");
  lines.forEach((line, i) => {
    const text = line.replace(/\r$/, "");
    if (!text.trim() || text.startsWith("#")) return;
    const [lemma, translation, frenchGender, ruGender] = text.split("\t");
    if (!lemma || !translation || !frenchGender) {
      throw new Error(`nouns-fr.tsv ligne ${i + 1} : au moins 3 colonnes attendues`);
    }
    if (ruGender && !GENDER[ruGender.trim()]) {
      throw new Error(`nouns-fr.tsv ligne ${i + 1} : genre russe "${ruGender}" invalide (m|f|n)`);
    }
    if (frenchGender !== "m" && frenchGender !== "f") {
      throw new Error(`nouns-fr.tsv ligne ${i + 1} : genre français "${frenchGender}" invalide`);
    }
    wanted.push({
      lemma: lemma.trim(),
      translation: translation.trim(),
      frenchGender,
      ruGender: ruGender ? ruGender.trim() : "",
      line: i + 1,
    });
  });
  return wanted;
}

async function main() {
  await ensureSources();
  const dict = loadDictionary();
  const ranks = loadFrequency();
  const wanted = loadWanted();

  const problems = [];
  const seenLemma = new Map();
  const seenTranslation = new Map();
  const seenId = new Map();
  const nouns = [];

  for (const w of wanted) {
    if (seenLemma.has(w.lemma)) {
      problems.push(`ligne ${w.line} : "${w.lemma}" déjà défini ligne ${seenLemma.get(w.lemma)}`);
      continue;
    }
    seenLemma.set(w.lemma, w.line);

    const key = w.translation.toLowerCase();
    if (seenTranslation.has(key)) {
      problems.push(
        `ligne ${w.line} : traduction "${w.translation}" déjà utilisée ligne ${seenTranslation.get(key)} — deux mots russes indiscernables dans l'exercice`
      );
      continue;
    }
    seenTranslation.set(key, w.line);

    const r = dict.get(w.lemma);
    if (!r) {
      problems.push(`ligne ${w.line} : "${w.lemma}" absent du dictionnaire`);
      continue;
    }
    // ~20 % des entrées du dictionnaire n'ont pas de genre renseigné alors
    // que leur paradigme est complet. La 4e colonne du TSV permet de le
    // déclarer à la main ; elle ne peut jamais CONTREDIRE le dictionnaire,
    // seulement combler son silence.
    if (w.ruGender && GENDER[r.gender] && GENDER[r.gender] !== GENDER[w.ruGender]) {
      problems.push(
        `ligne ${w.line} : "${w.lemma}" — genre déclaré "${w.ruGender}" mais le dictionnaire dit "${r.gender}"`
      );
      continue;
    }
    const gender = GENDER[r.gender] ?? GENDER[w.ruGender];
    if (!gender) {
      problems.push(
        `ligne ${w.line} : "${w.lemma}" sans genre dans le dictionnaire — ajoute une 4e colonne m|f|n après avoir vérifié`
      );
      continue;
    }
    if (r.indeclinable === "1") {
      problems.push(`ligne ${w.line} : "${w.lemma}" est indéclinable`);
      continue;
    }
    if (r.sg_only === "1" || r.pl_only === "1") {
      problems.push(`ligne ${w.line} : "${w.lemma}" n'a qu'un seul nombre (singularia/pluralia tantum)`);
      continue;
    }
    const overrides = FORM_OVERRIDES[w.lemma] ?? {};
    const allForms = FORMS.map((f) => canonicalForms(overrides[f] ?? r[f]));
    const forms = allForms.map((v) => v[0] ?? null);
    // La seconde variante, quand il y en a une : indexée par case, et
    // seulement là où elle existe.
    const variants = { singular: {}, plural: {} };
    allForms.forEach((v, k) => {
      if (v.length < 2) return;
      // Une variante qui ne diffère que par la PLACE DE L'ACCENT n'apporte
      // rien : la comparaison des réponses retire l'accent, donc les deux
      // sont déjà acceptées, et les afficher côte à côte (« у́трам » /
      // « утра́м ») ressemblerait à une coquille. On ne garde que les
      // variantes qui changent les lettres — « дочерьми́ » / « дочеря́ми ».
      if (strip(v[0]) === strip(v[1])) return;
      const target = k < 6 ? variants.singular : variants.plural;
      target[k % 6] = accentuate(v[1]);
    });
    const missing = FORMS.filter((f, k) => !forms[k]);
    if (missing.length) {
      problems.push(`ligne ${w.line} : "${w.lemma}" — formes manquantes ou douteuses : ${missing.join(", ")}`);
      continue;
    }
    if (strip(forms[0]) !== w.lemma) {
      problems.push(`ligne ${w.line} : "${w.lemma}" — le nominatif du dictionnaire est "${strip(forms[0])}"`);
      continue;
    }

    const id = translit(w.lemma);
    if (seenId.has(id)) {
      problems.push(`ligne ${w.line} : identifiant "${id}" déjà pris par "${seenId.get(id)}"`);
      continue;
    }
    seenId.set(id, w.lemma);

    nouns.push({
      id,
      lemma: w.lemma,
      translation: w.translation,
      frenchGender: w.frenchGender,
      gender,
      animacy: ANIMACY_OVERRIDES[w.lemma] ?? (r.animate === "1" ? "animate" : "inanimate"),
      // Hors liste de fréquence : considéré comme rare plutôt qu'exclu — le
      // mot reste jouable, simplement réservé aux niveaux avancés.
      rank: ranks.get(w.lemma) ?? RARE_RANK,
      singular: forms.slice(0, 6).map(accentuate),
      plural: forms.slice(6).map(accentuate),
      variants,
    });
  }

  if (problems.length) {
    console.error(`\n${problems.length} entrée(s) écartée(s) :`);
    for (const p of problems) console.error(`  ${p}`);
    console.error("");
  }

  const body = nouns
    .map((n) => {
      const q = (s) => JSON.stringify(s);
      const sparse = (obj) =>
        Object.keys(obj).length
          ? `{ ${Object.entries(obj)
              .map(([k, v]) => `${k}: ${q(v)}`)
              .join(", ")} }`
          : null;
      const sg = sparse(n.variants.singular);
      const pl = sparse(n.variants.plural);
      const variants =
        sg || pl
          ? `,\n      variants: { ${[sg && `singular: ${sg}`, pl && `plural: ${pl}`]
              .filter(Boolean)
              .join(", ")} }`
          : "";
      return `  { id: ${q(n.id)}, lemma: ${q(n.lemma)}, translation: ${q(n.translation)}, frenchGender: ${q(n.frenchGender)}, gender: ${q(n.gender)}, animacy: ${q(n.animacy)}, rank: ${n.rank},\n    forms: { singular: [${n.singular.map(q).join(", ")}], plural: [${n.plural.map(q).join(", ")}]${variants} } },`;
    })
    .join("\n");

  const out = `// FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Régénérer avec \`npm run build:nouns\` (scripts/build-nouns.mjs).
//
// Morphologie (12 formes + accents toniques) importée du dictionnaire
// OpenRussian — https://github.com/Badestrand/russian-dictionary — publié
// sous licence Creative Commons Attribution-ShareAlike 4.0. Les données
// dérivées présentes dans ce fichier restent sous cette licence.
//
// Sélection, traductions françaises et genre français :
// scripts/data/nouns-fr.tsv (écrit à la main).
//
// Le champ "rank" est un rang d'usage dans une liste de fréquence (1 = le
// plus fréquent, 50000 = hors liste) : il sert à adapter la difficulté du
// vocabulaire au niveau de l'apprenant.
//
// Ordre des formes : nominatif, génitif, datif, accusatif, instrumental,
// prépositionnel. L'accent tonique est un accent aigu combinant (U+0301),
// omis sur les monosyllabes ; lib/grammar/decline.ts le retire pour
// comparer les réponses.
import { GeneratedNoun } from "./types";

export const GENERATED_NOUNS: GeneratedNoun[] = [
${body}
];
`;

  fs.writeFileSync(OUT, out, "utf8");
  const sorted = [...nouns].sort((a, b) => a.rank - b.rank);
  console.log(`${nouns.length} noms écrits dans ${path.relative(ROOT, OUT)}`);
  console.log(
    `  fréquence : médiane ${sorted[Math.floor(sorted.length / 2)].rank}, ` +
      `${nouns.filter((n) => n.rank <= 1000).length} dans le top 1000, ` +
      `${nouns.filter((n) => n.rank >= RARE_RANK).length} hors liste`
  );
  if (problems.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
