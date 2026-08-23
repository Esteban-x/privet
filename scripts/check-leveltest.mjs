/**
 * Contrôles du test de placement — `npm run check:leveltest`.
 *
 * Deux natures de vérification :
 *
 * 1. LE VIVIER. Un item mal formé (bonne réponse hors bornes, options en
 *    double, palier trop peu fourni) ne casse rien visiblement : il fausse
 *    juste le classement, en silence. Ces contrôles-là sont structurels.
 *
 * 2. L'ALGORITHME. On simule des candidats de niveau connu et on vérifie que
 *    le test les classe correctement. C'est le garde-fou qui manquait : la
 *    version précédente plaçait un vrai A2 en B1+ dans 58 % des cas et
 *    donnait C1 à un candidat qui ratait la moitié des questions, sans que
 *    rien ne le signale.
 */
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const Q = await jiti.import("../lib/leveltest/questions.ts");
const E = await jiti.import("../lib/leveltest/engine.ts");

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

// ─── 1. Vivier ─────────────────────────────────────────────────────
const OPTIONS_PER_ITEM = 4; // le seuil de validation (3/4) suppose 25 % de hasard
const MIN_PER_TIER = E.BLOCK_SIZE * 2; // deux passations ne doivent pas se ressembler

const ids = new Set();
for (const q of Q.LEVEL_QUESTIONS) {
  require_(!ids.has(q.id), `identifiant en double : ${q.id}`);
  ids.add(q.id);
  require_(
    q.tier >= Q.MIN_TIER && q.tier <= Q.MAX_TIER,
    `${q.id} : palier ${q.tier} hors bornes`
  );
  require_(
    q.options.length === OPTIONS_PER_ITEM,
    `${q.id} : ${q.options.length} options au lieu de ${OPTIONS_PER_ITEM}`
  );
  require_(
    q.correctIndex >= 0 && q.correctIndex < q.options.length,
    `${q.id} : correctIndex ${q.correctIndex} hors bornes`
  );
  require_(
    new Set(q.options).size === q.options.length,
    `${q.id} : options en double (${q.options.join(" / ")})`
  );
  require_(q.prompt.trim().length > 0, `${q.id} : consigne vide`);
  require_(q.explain.trim().length > 0, `${q.id} : explication vide`);
  require_(
    q.skill === "grammaire" || q.skill === "lexique",
    `${q.id} : compétence inconnue "${q.skill}"`
  );
}

for (let tier = Q.MIN_TIER; tier <= Q.MAX_TIER; tier++) {
  const pool = Q.questionsForTier(tier);
  require_(
    pool.length >= MIN_PER_TIER,
    `palier ${tier} (${Q.levelForTier(tier)}) : ${pool.length} items, il en faut au moins ${MIN_PER_TIER}`
  );
  // buildBlock garantit un item de chaque compétence : encore faut-il que le
  // palier en propose.
  for (const skill of ["grammaire", "lexique"]) {
    require_(
      pool.some((q) => q.skill === skill),
      `palier ${tier} : aucun item de type "${skill}"`
    );
  }
}

// ─── 2. Algorithme ─────────────────────────────────────────────────
const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];

// Modèle de candidat : sûr en dessous de son niveau, hésitant au niveau
// suivant, réduit au hasard (25 %) au-delà.
function pCorrect(trueTier, itemTier) {
  if (itemTier <= trueTier - 1) return 0.92;
  if (itemTier === trueTier) return 0.8;
  if (itemTier === trueTier + 1) return 0.4;
  return 0.25;
}

function simulate(answerPicker) {
  let run = E.startRun();
  let guard = 0;
  while (!run.finished && guard++ < 50) {
    const q = E.currentQuestion(run);
    if (!q) break;
    run = E.answerCurrent(run, answerPicker(q));
  }
  require_(run.finished, "une passation ne s'est pas terminée");
  return { result: E.runResult(run), asked: run.answers.length };
}

function pickFor(trueTier) {
  return (q) => {
    if (Math.random() < pCorrect(trueTier, q.tier)) return q.correctIndex;
    const wrong = [0, 1, 2, 3].filter((i) => i !== q.correctIndex);
    return wrong[Math.floor(Math.random() * wrong.length)];
  };
}

const RUNS = 3000;
let exact = 0;
let within1 = 0;
let total = 0;
const perLevel = [];
for (let trueTier = 0; trueTier <= 5; trueTier++) {
  let ok = 0;
  let askedSum = 0;
  for (let i = 0; i < RUNS; i++) {
    const { result, asked } = simulate(pickFor(trueTier));
    const got = LEVELS.indexOf(result.level);
    askedSum += asked;
    total += 1;
    if (got === trueTier) {
      exact += 1;
      ok += 1;
    }
    if (Math.abs(got - trueTier) <= 1) within1 += 1;
  }
  perLevel.push({ level: LEVELS[trueTier], rate: ok / RUNS, items: askedSum / RUNS });
}

const exactRate = exact / total;
const within1Rate = within1 / total;
require_(
  exactRate >= 0.6,
  `placement exact ${(exactRate * 100).toFixed(0)}% — attendu au moins 60%`
);
require_(
  within1Rate >= 0.9,
  `placement à un palier près ${(within1Rate * 100).toFixed(0)}% — attendu au moins 90%`
);
for (const l of perLevel) {
  require_(
    l.rate >= 0.5,
    `candidat ${l.level} : classé correctement seulement ${(l.rate * 100).toFixed(0)}% du temps`
  );
}

// Un candidat qui répond entièrement au hasard doit finir en bas : c'est le
// scénario exact qui produisait des C1 dans la version précédente.
let guesserLow = 0;
for (let i = 0; i < RUNS; i++) {
  const { result } = simulate(() => Math.floor(Math.random() * OPTIONS_PER_ITEM));
  if (result.level === "A0" || result.level === "A1") guesserLow += 1;
}
const guesserRate = guesserLow / RUNS;
require_(
  guesserRate >= 0.9,
  `réponses au hasard classées A0/A1 seulement ${(guesserRate * 100).toFixed(0)}% du temps — attendu au moins 90%`
);

// Le budget d'items doit rester tenable.
const maxItems = E.BLOCK_SIZE * E.MAX_BLOCKS;
for (const l of perLevel) {
  require_(l.items <= maxItems, `candidat ${l.level} : ${l.items.toFixed(1)} items posés, maximum ${maxItems}`);
}

// ─── Rapport ───────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n✗ ${failures.length} problème(s) sur ${checks} contrôles :\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error("");
  process.exit(1);
}

console.log(`✓ ${checks} contrôles passés.`);
console.log(
  `  vivier : ${Q.LEVEL_QUESTIONS.length} items sur ${Q.MAX_TIER} paliers ` +
    `(${Q.questionsForTier(1).length} par palier), blocs de ${E.BLOCK_SIZE}, ${E.MAX_BLOCKS} séries max`
);
console.log(
  `  placement : ${(exactRate * 100).toFixed(0)}% exact, ${(within1Rate * 100).toFixed(0)}% à un palier près`
);
console.log(
  "  par niveau : " + perLevel.map((l) => `${l.level} ${(l.rate * 100).toFixed(0)}%`).join("  ")
);
console.log(`  réponses au hasard classées A0/A1 : ${(guesserRate * 100).toFixed(0)}%`);
