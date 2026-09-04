/**
 * Contrôle de variété — `npm run check:variety`.
 *
 * L'INVARIANT QUE CE SCRIPT ÉCRIT. « Je tombe souvent sur les mêmes mots à
 * décliner ou les mêmes phrases. » Aucun contrôle ne disait cela : les
 * autres vérifient qu'un exercice est JUSTE, pas qu'une série d'exercices
 * est SUPPORTABLE. On rejoue donc une session — cinquante exercices
 * d'affilée sur une compétence, comme un apprenant les enchaîne — et on
 * exige trois choses :
 *
 *   1. VARIÉTÉ  : voir au moins 70 % de ce que la compétence peut montrer.
 *   2. ROTATION : rien ne revient plus souvent qu'un tour de rôle équitable,
 *                 à deux passages près.
 *   3. DÉLAI    : le premier doublon n'arrive pas avant d'avoir vu 40 % du
 *                 disponible.
 *
 * « Ce que la compétence peut montrer » n'est pas déclaré à la main : il est
 * MESURÉ, par un long tirage sans mémoire. Un module qui s'appauvrit fait
 * donc baisser la barre en même temps que la note — c'est pour ça que la
 * variété brute est affichée (`--report`) en plus d'être vérifiée : les
 * seuils attrapent une régression du TIRAGE, l'œil attrape une régression de
 * la BANQUE.
 *
 * DEUX AXES sur le module Cas. Le mot décliné et la phrase qui le porte sont
 * deux répétitions distinctes : trente mots différents dans la même phrase,
 * c'est trente fois la même page.
 *
 * DÉTERMINISTE. Math.random est remplacé par un générateur à graine : un
 * échec se rejoue à l'identique, et le contrôle ne clignote pas d'une
 * exécution à l'autre.
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });

// Les chemins passent tous par l'alias "@" : jiti donne une instance de
// module par spécificateur, et lib/practice/recent.ts porte un état (la
// mémoire courte). Deux instances, et le script mesurerait un anneau que
// personne n'écrit — c'est-à-dire rien.
const { pickCaseExercise, drawCaseCandidate, caseExerciseIds, caseRecentKey } = await jiti.import(
  "@/lib/grammar/case-draw"
);
const { rememberDraw, resetRecent, drawFresh } = await jiti.import("@/lib/practice/recent");
const { nounsForLevel } = await jiti.import("@/lib/grammar/nouns-data");
const { CASES } = await jiti.import("@/lib/grammar/cases");

const REPORT = process.argv.includes("--report");

/** Longueur d'une session rejouée. */
const SESSION = 50;
/** Sessions indépendantes par compétence : une seule série peut être chanceuse. */
const SESSIONS = 5;
/** Tirages sans mémoire servant à mesurer ce que la compétence peut montrer. */
const PROBE = 600;

const MIN_SHARE = 0.7; // variété
const SLACK = 2; // rotation : tour de rôle + n
const MIN_DELAY_SHARE = 0.4; // délai avant le premier doublon

// --- Générateur à graine (xorshift32) ------------------------------------
const realRandom = Math.random;
function seed(value) {
  let state = value >>> 0 || 1;
  Math.random = () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}
function unseed() {
  Math.random = realRandom;
}

const failures = [];
let checks = 0;

function measure(ids) {
  const counts = new Map();
  let firstRepeat = null;
  ids.forEach((id, i) => {
    if (counts.has(id) && firstRepeat === null) firstRepeat = i + 1;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  return {
    distinct: counts.size,
    worst: Math.max(...counts.values()),
    firstRepeat: firstRepeat ?? SESSION + 1,
  };
}

/**
 * Vérifie une compétence sur un axe.
 *
 * `reachable` est ce que le tirage sans mémoire finit par montrer ; la barre
 * s'aligne dessus, plafonnée à la longueur de la session (on ne peut pas
 * voir cinquante-cinq choses en cinquante exercices).
 */
function judge(label, axis, reachable, sessions) {
  const target = Math.min(reachable, SESSION);
  const minDistinct = Math.max(1, Math.floor(target * MIN_SHARE));
  const maxWorst = Math.ceil(SESSION / target) + SLACK;
  const minDelay = Math.max(2, Math.floor(target * MIN_DELAY_SHARE));

  // La session la plus mauvaise des cinq : c'est celle-là que quelqu'un vit.
  const worstRun = sessions.reduce((a, b) => (b.worst > a.worst ? b : a));
  const leanest = sessions.reduce((a, b) => (b.distinct < a.distinct ? b : a));
  const earliest = sessions.reduce((a, b) => (b.firstRepeat < a.firstRepeat ? b : a));

  checks += 3;
  if (leanest.distinct < minDistinct) {
    failures.push(
      `${label} — ${axis} : ${leanest.distinct} distincts sur ${SESSION} tirages, ` +
        `il en faut ${minDistinct} (la compétence en propose ${reachable}).`
    );
  }
  if (worstRun.worst > maxWorst) {
    failures.push(
      `${label} — ${axis} : un item sort ${worstRun.worst} fois sur ${SESSION}, ` +
        `maximum ${maxWorst} (${reachable} disponibles).`
    );
  }
  if (earliest.firstRepeat < minDelay) {
    failures.push(
      `${label} — ${axis} : premier doublon au ${earliest.firstRepeat}ᵉ exercice, ` +
        `pas avant le ${minDelay}ᵉ (${reachable} disponibles).`
    );
  }

  return {
    compétence: label,
    axe: axis,
    disponible: reachable,
    distincts: `${leanest.distinct} ≥ ${minDistinct}`,
    "le pire": `${worstRun.worst} ≤ ${maxWorst}`,
    "1er doublon": `${earliest.firstRepeat > SESSION ? "—" : earliest.firstRepeat} ≥ ${minDelay}`,
  };
}

const rows = [];

// ─── Module Cas ───────────────────────────────────────────────────────────
//
// A1 plutôt qu'un niveau élevé : c'est là que le vivier de chaque
// déclencheur est le plus étroit, donc là que la répétition se voit.
const CASE_LEVEL = "A1";

for (const caseInfo of CASES) {
  const tabs = caseInfo.id === "genitive"
    ? ["isolated", "sentence", "mcq", "numeral"]
    : ["isolated", "sentence", "mcq"];

  for (const tab of tabs) {
    const label = `cases/${caseInfo.id}/${tab}`;
    const pool = nounsForLevel(CASE_LEVEL);
    const key = caseRecentKey(caseInfo.id, tab);
    const options = {
      tab,
      caseId: caseInfo.id,
      triggerStats: {},
      level: CASE_LEVEL,
      pool,
      numberMode: "mixed",
    };

    // Ce que l'onglet peut montrer, mesuré sans mémoire.
    seed(1);
    const probeFine = new Set();
    const probePhrase = new Set();
    for (let i = 0; i < PROBE; i += 1) {
      const ex = drawCaseCandidate(options);
      probeFine.add(caseExerciseIds(ex)[0]);
      if (ex.sentenceTemplate) probePhrase.add(ex.sentenceTemplate);
    }
    unseed();

    const fineRuns = [];
    const phraseRuns = [];
    for (let s = 0; s < SESSIONS; s += 1) {
      seed(1000 + s);
      resetRecent(key);
      const fine = [];
      const phrase = [];
      for (let i = 0; i < SESSION; i += 1) {
        const ex = pickCaseExercise(options);
        rememberDraw(key, caseExerciseIds(ex));
        fine.push(caseExerciseIds(ex)[0]);
        if (ex.sentenceTemplate) phrase.push(ex.sentenceTemplate);
      }
      unseed();
      fineRuns.push(measure(fine));
      if (phrase.length === SESSION) phraseRuns.push(measure(phrase));
    }
    resetRecent(key);

    rows.push(judge(label, "exercice", probeFine.size, fineRuns));
    // Les onglets sans phrase (isolée, chiffres) n'ont pas d'axe « phrase ».
    if (phraseRuns.length === SESSIONS) {
      rows.push(judge(label, "phrase", probePhrase.size, phraseRuns));
    }
  }
}

// ─── Les autres modules ───────────────────────────────────────────────────
const MODULES = [
  ["adjectives", "@/lib/adjectives/exercises", "generateAdjectiveExercise", "ADJECTIVE_SKILLS"],
  ["alphabet", "@/lib/alphabet/exercises", "generateAlphabetExercise", "ALPHABET_SKILLS"],
  ["aspect", "@/lib/aspect/exercises", "generateAspectExercise", "ASPECT_SKILLS"],
  ["conjugation", "@/lib/conjugation/exercises", "generateConjugationExercise", "CONJUGATION_SKILLS"],
  ["motion", "@/lib/motion/exercises", "generateMotionExercise", "MOTION_SKILLS"],
  ["numbers", "@/lib/numbers/exercises", "generateNumberExercise", "NUMBER_SKILLS"],
  ["participles", "@/lib/participles/exercises", "generateParticipleExercise", "PARTICIPLE_SKILLS"],
];

for (const [name, file, generatorName, skillsName] of MODULES) {
  const mod = await jiti.import(file);
  const generate = mod[generatorName];
  const skills = mod[skillsName];
  if (typeof generate !== "function" || !Array.isArray(skills)) {
    failures.push(`${name} : ${generatorName}/${skillsName} introuvables — le module a bougé.`);
    continue;
  }

  for (const skill of skills) {
    const label = `${name}/${skill.id}`;
    const key = `${name}:${skill.id}`;

    seed(1);
    const probe = new Set();
    for (let i = 0; i < PROBE; i += 1) probe.add(generate(skill.id).itemId);
    unseed();

    const runs = [];
    for (let s = 0; s < SESSIONS; s += 1) {
      seed(1000 + s);
      resetRecent(key);
      const ids = [];
      for (let i = 0; i < SESSION; i += 1) {
        ids.push(drawFresh(key, () => generate(skill.id), (ex) => [ex.itemId]).itemId);
      }
      unseed();
      runs.push(measure(ids));
    }
    resetRecent(key);

    rows.push(judge(label, "exercice", probe.size, runs));
  }
}

if (REPORT) console.table(rows);

if (failures.length > 0) {
  console.error(`\nVariété : ${failures.length} manquement(s) sur ${checks} contrôles.\n`);
  for (const f of failures) console.error(`  · ${f}`);
  console.error(
    "\nRelancer avec --report pour voir chaque compétence, sa marge et ce qu'elle propose.\n"
  );
  process.exit(1);
}

console.log(
  `Variété : ${checks} contrôles sur ${rows.length} axes, ` +
    `${SESSIONS} sessions de ${SESSION} exercices chacune. Rien ne tourne en rond.`
);
