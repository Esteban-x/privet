/**
 * Contrôles du module « verbes de mouvement » — `npm run check:motion`.
 *
 * Deux natures de risque, toutes deux silencieuses :
 *
 * 1. LA DONNÉE. Les formes sont écrites à la main parce qu'elles ne se
 *    dérivent pas (идти → шёл, вы- toujours accentué → вы́шел). Une faute de
 *    frappe y enseigne une conjugaison fausse sans rien casser.
 * 2. LA SÉMANTIQUE. Un exercice dont la phrase française dit « je vais » ne
 *    doit jamais attendre « бегу » (je cours). Ce genre d'incohérence est
 *    apparu au premier essai : la génération tirait un verbe de manière là
 *    où le contexte demandait un verbe d'aller.
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const V = await jiti.import("../lib/motion/verbs.ts");
const X = await jiti.import("../lib/motion/exercises.ts");

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

const CYRILLIC = /^[а-яёА-ЯЁ -]+$/;

// ─── 1. Paires de base ─────────────────────────────────────────────
// Table de référence recopiée à la main : c'est elle qui attrape une
// coquille dans une forme irrégulière.
const EXPECTED_PAIRS = {
  идти: { multi: "ходить", uni: ["иду", "идёт", "шёл", "шла"], mult: ["хожу", "ходит", "ходил", "ходила"] },
  ехать: { multi: "ездить", uni: ["еду", "едет", "ехал", "ехала"], mult: ["езжу", "ездит", "ездил", "ездила"] },
  лететь: { multi: "летать", uni: ["лечу", "летит", "летел", "летела"], mult: ["летаю", "летает", "летал", "летала"] },
  плыть: { multi: "плавать", uni: ["плыву", "плывёт", "плыл", "плыла"], mult: ["плаваю", "плавает", "плавал", "плавала"] },
  бежать: { multi: "бегать", uni: ["бегу", "бежит", "бежал", "бежала"], mult: ["бегаю", "бегает", "бегал", "бегала"] },
  нести: { multi: "носить", uni: ["несу", "несёт", "нёс", "несла"], mult: ["ношу", "носит", "носил", "носила"] },
};

const ids = new Set();
for (const pair of V.MOTION_PAIRS) {
  require_(!ids.has(pair.id), `identifiant en double : ${pair.id}`);
  ids.add(pair.id);
  const expected = EXPECTED_PAIRS[pair.uni];
  if (!expected) {
    failures.push(`${pair.uni} absent de la table de référence de check-motion.mjs`);
    continue;
  }
  require_(pair.multi === expected.multi, `${pair.uni} : multidirectionnel "${pair.multi}" au lieu de "${expected.multi}"`);
  const uni = [pair.uniForms.present1, pair.uniForms.present3, pair.uniForms.pastM, pair.uniForms.pastF];
  const mult = [pair.multiForms.present1, pair.multiForms.present3, pair.multiForms.pastM, pair.multiForms.pastF];
  uni.forEach((form, i) => require_(form === expected.uni[i], `${pair.uni} : forme "${form}" au lieu de "${expected.uni[i]}"`));
  mult.forEach((form, i) => require_(form === expected.mult[i], `${pair.multi} : forme "${form}" au lieu de "${expected.mult[i]}"`));
  require_(
    [...uni, ...mult].every((f) => CYRILLIC.test(f)),
    `${pair.uni} : une forme sort de l'alphabet cyrillique`
  );
}
require_(
  V.MOTION_PAIRS.filter((p) => p.isGoing).length >= 4,
  "il faut au moins quatre verbes d'« aller » pour varier les exercices de mode"
);

// ─── 2. Préfixes ───────────────────────────────────────────────────
const EXPECTED_PREFIXES = {
  прийти: { imp: "приходить", pastM: "пришёл", pastF: "пришла", governs: "accusative" },
  уйти: { imp: "уходить", pastM: "ушёл", pastF: "ушла", governs: "genitive" },
  войти: { imp: "входить", pastM: "вошёл", pastF: "вошла", governs: "accusative" },
  // вы- porte l'accent : вы́шел, et surtout pas « вышёл »
  выйти: { imp: "выходить", pastM: "вышел", pastF: "вышла", governs: "genitive" },
  подойти: { imp: "подходить", pastM: "подошёл", pastF: "подошла", governs: "dative" },
  отойти: { imp: "отходить", pastM: "отошёл", pastF: "отошла", governs: "genitive" },
  перейти: { imp: "переходить", pastM: "перешёл", pastF: "перешла", governs: "accusative" },
  дойти: { imp: "доходить", pastM: "дошёл", pastF: "дошла", governs: "genitive" },
  зайти: { imp: "заходить", pastM: "зашёл", pastF: "зашла", governs: "dative" },
  обойти: { imp: "обходить", pastM: "обошёл", pastF: "обошла", governs: "accusative" },
  сойти: { imp: "сходить", pastM: "сошёл", pastF: "сошла", governs: "genitive" },
};

for (const p of V.MOTION_PREFIXES) {
  const expected = EXPECTED_PREFIXES[p.perfective];
  if (!expected) {
    failures.push(`${p.perfective} absent de la table de référence`);
    continue;
  }
  require_(p.imperfective === expected.imp, `${p.perfective} : imperfectif "${p.imperfective}" au lieu de "${expected.imp}"`);
  require_(p.pastM === expected.pastM, `${p.perfective} : passé masculin "${p.pastM}" au lieu de "${expected.pastM}"`);
  require_(p.pastF === expected.pastF, `${p.perfective} : passé féminin "${p.pastF}" au lieu de "${expected.pastF}"`);
  require_(p.governs === expected.governs, `${p.perfective} : régit "${p.governs}" au lieu de "${expected.governs}"`);
}

// ─── 3. Génération des exercices ───────────────────────────────────
// Les phrases françaises des exercices « mode » et « direction » disent
// « aller » : la réponse ne peut pas être un verbe de manière.
const MANNER_FORMS = new Set(
  V.MOTION_PAIRS.filter((p) => !p.isGoing).flatMap((p) => [
    p.uniForms.present1, p.uniForms.present3, p.uniForms.pastM, p.uniForms.pastF,
    p.multiForms.present1, p.multiForms.present3, p.multiForms.pastM, p.multiForms.pastF,
  ])
);

for (const skill of X.MOTION_SKILLS) {
  let semanticMismatch = 0;
  let unverifiable = 0;
  let malformed = 0;
  const seenItems = new Set();

  for (let i = 0; i < 800; i++) {
    const ex = X.generateMotionExercise(skill.id);
    seenItems.add(ex.itemId);
    const answer = ex.options[ex.correctIndex];

    if (
      ex.options.length < 2 ||
      new Set(ex.options).size !== ex.options.length ||
      ex.correctIndex < 0
    ) {
      malformed += 1;
    }
    // Le serveur doit rejuger la bonne réponse comme juste, et une mauvaise
    // comme fausse : sans ça, la progression enregistrée serait décorrélée
    // de ce que voit l'apprenant.
    if (X.checkMotionAnswer(ex.itemId, answer) !== true) unverifiable += 1;
    const wrong = ex.options.find((o) => o !== answer);
    if (wrong && X.checkMotionAnswer(ex.itemId, wrong) !== false) unverifiable += 1;

    if ((skill.id === "mode" || skill.id === "direction") && MANNER_FORMS.has(answer)) {
      semanticMismatch += 1;
    }
    require_(ex.sentenceFr.trim().length > 0, `${skill.id} : exercice sans phrase française`);
    require_(ex.explain.trim().length > 0, `${skill.id} : exercice sans explication`);
    checks -= 2; // ces deux-là sont comptés une fois par tirage, on n'en garde qu'un
  }
  checks += 2;

  require_(malformed === 0, `${skill.id} : ${malformed} exercices malformés (options en double ou insuffisantes)`);
  require_(unverifiable === 0, `${skill.id} : ${unverifiable} exercices que le serveur ne rejuge pas correctement`);
  require_(
    semanticMismatch === 0,
    `${skill.id} : ${semanticMismatch} exercices dont la phrase dit « aller » mais attendent un verbe de manière`
  );
  require_(seenItems.size >= 3, `${skill.id} : seulement ${seenItems.size} items distincts, la pratique tournerait en rond`);
}

// Un identifiant inventé ne doit jamais être accepté.
require_(
  X.checkMotionAnswer("prefix:inexistant", "прийти") === null,
  "un item inconnu doit être rejeté, pas jugé"
);
require_(
  X.checkMotionAnswer("", "") === null,
  "un identifiant vide doit être rejeté"
);

// ─── Rapport ───────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n✗ ${failures.length} problème(s) sur ${checks} contrôles :\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error("");
  process.exit(1);
}

const items = X.MOTION_SKILLS.map((s) => {
  const seen = new Set();
  for (let i = 0; i < 600; i++) seen.add(X.generateMotionExercise(s.id).itemId);
  return `${s.id} ${seen.size}`;
});
console.log(`✓ ${checks} contrôles passés.`);
console.log(
  `  banque : ${V.MOTION_PAIRS.length} paires, ${V.MOTION_PREFIXES.length} préfixes, ${X.MOTION_SKILLS.length} compétences`
);
console.log(`  items distincts par compétence : ${items.join(", ")}`);
