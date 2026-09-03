/**
 * Contrôles des modules d'exercices récents — `npm run check:exercises`.
 *
 * Ces trois modules (Lire et écrire, Conjugaison, Nombres) tirent leurs
 * exercices au hasard : une erreur n'y apparaît pas au chargement d'une
 * page mais une fois sur cinquante, sur un mot précis. Un contrôle à l'œil
 * ne peut pas les attraper. Ce script joue donc des milliers de tirages
 * avec un générateur reproductible et vérifie, pour chacun :
 *
 * 1. ALLER-RETOUR : la réponse annoncée juste par le générateur est bien
 *    validée par le correcteur du serveur — ce sont deux chemins de code
 *    distincts, et c'est celui du serveur qui compte les points.
 * 2. LEURRES : aucune autre option n'est acceptée. Un QCM avec deux bonnes
 *    réponses est insoluble, et cela arrive dès qu'un leurre coïncide avec
 *    la forme correcte.
 * 3. FORME : quatre options distinctes (trois au minimum), une consigne, un
 *    énoncé, une explication.
 * 4. TÉMOINS : des formes recopiées à la main — l'heure russe, l'accord
 *    après un nombre, des conjugaisons. Elles ne testent pas le tirage mais
 *    MES hypothèses sur ce que le module enseigne.
 * 5. BANQUE : intégrité des verbes (six personnes, accents, terminaisons
 *    conformes à la classe déclarée).
 * 6. LIENS : chaque module pointe vers une route servie et vers une leçon
 *    du cours qui existe, et la liste de routes recopiée dans la barre de
 *    navigation correspond au catalogue.
 */
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });

const numbers = await jiti.import("../lib/numbers/exercises.ts");
const conjugation = await jiti.import("../lib/conjugation/exercises.ts");
const alphabet = await jiti.import("../lib/alphabet/exercises.ts");
const { VERBS } = await jiti.import("../lib/conjugation/verbs.ts");
const { EXERCISE_MODULES, moduleLevels } = await jiti.import("../lib/exercises/catalog.ts");
const { EXERCISE_ROUTES } = await jiti.import("../lib/exercises/routes.ts");
const { findLesson } = await jiti.import("../lib/courses/catalog.ts");
const { CEFR_LEVELS } = await jiti.import("../lib/supabase/types.ts");

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}
function expect(label, got, want) {
  checks += 1;
  if (got !== want) failures.push(`${label} : « ${got} » au lieu de « ${want} »`);
}

/** Générateur reproductible : un échec doit pouvoir se rejouer à l'identique. */
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACCENT = "́";
const VOWELS = "аеёиоуыэюя";
const strip = (word) => word.split(ACCENT).join("");
const vowelCount = (word) => [...strip(word)].filter((c) => VOWELS.includes(c)).length;

// ─── 1 à 3. Tirage, correction, forme ────────────────────────────
const MODULES = [
  {
    id: "numbers",
    skills: numbers.NUMBER_SKILLS,
    generate: numbers.generateNumberExercise,
    check: numbers.checkNumberAnswer,
  },
  {
    id: "conjugation",
    skills: conjugation.CONJUGATION_SKILLS,
    generate: conjugation.generateConjugationExercise,
    check: conjugation.checkConjugationAnswer,
  },
  {
    id: "alphabet",
    skills: alphabet.ALPHABET_SKILLS,
    generate: alphabet.generateAlphabetExercise,
    check: alphabet.checkAlphabetAnswer,
  },
];

const DRAWS = 600;
for (const bank of MODULES) {
  for (const skill of bank.skills) {
    require_(
      CEFR_LEVELS.includes(skill.level),
      `${bank.id} › ${skill.id} : niveau inconnu (${skill.level})`
    );
    require_(
      skill.summary.length >= 60,
      `${bank.id} › ${skill.id} : résumé trop court pour situer la difficulté`
    );

    const random = mulberry32(1234);
    const seen = new Set();
    for (let draw = 0; draw < DRAWS; draw += 1) {
      const exercise = bank.generate(skill.id, random);
      const where = `${bank.id} › ${skill.id} › ${exercise.itemId}`;
      seen.add(exercise.itemId);

      const correct = exercise.options[exercise.correctIndex];
      if (bank.check(exercise.itemId, correct) !== true) {
        failures.push(`${where} : le correcteur refuse la réponse du générateur (${correct})`);
        checks += 1;
        break;
      }
      checks += 1;

      for (const option of exercise.options) {
        if (option !== correct && bank.check(exercise.itemId, option) === true) {
          failures.push(`${where} : le leurre « ${option} » est accepté comme juste`);
        }
      }
      checks += 1;

      if (new Set(exercise.options).size !== exercise.options.length) {
        failures.push(`${where} : options en double`);
      }
      if (exercise.options.length < 3) {
        failures.push(`${where} : seulement ${exercise.options.length} options`);
      }
      if (!exercise.prompt || !exercise.question || !exercise.explain) {
        failures.push(`${where} : consigne, énoncé ou explication vide`);
      }
      checks += 1;
    }

    // Un onglet qui ne tire que deux ou trois items devient une devinette
    // au bout d'une minute.
    require_(seen.size >= 5, `${bank.id} › ${skill.id} : seulement ${seen.size} items distincts`);
  }
}

// ─── 4. Témoins ──────────────────────────────────────────────────
expect("heure 3:00", numbers.tellTime(3, 0), "три часа́");
expect("heure 1:00", numbers.tellTime(1, 0), "час");
expect("heure 5:00", numbers.tellTime(5, 0), "пять часо́в");
expect("heure 4:15", numbers.tellTime(4, 15), "че́тверть пя́того");
expect("heure 4:30", numbers.tellTime(4, 30), "полови́на пя́того");
expect("heure 4:45", numbers.tellTime(4, 45), "без че́тверти пять");
expect("heure 3:20", numbers.tellTime(3, 20), "два́дцать мину́т четвёртого");
expect("heure 3:40", numbers.tellTime(3, 40), "без двадцати́ четы́ре");
expect("heure 12:55", numbers.tellTime(12, 55), "без пяти́ час");
expect("heure 12:30", numbers.tellTime(12, 30), "полови́на пе́рвого");

expect("âge 1", numbers.yearWord(1), "год");
expect("âge 2", numbers.yearWord(2), "го́да");
expect("âge 5", numbers.yearWord(5), "лет");
expect("âge 11", numbers.yearWord(11), "лет");
expect("âge 21", numbers.yearWord(21), "год");
expect("âge 22", numbers.yearWord(22), "го́да");

expect("lecture рестора́н", alphabet.transcribe("рестора́н", []), "restoran");
expect("lecture вход", alphabet.transcribe("вход", []), "vkhod");
expect("lecture хорошо́", alphabet.transcribe("хорошо́", []), "khorocho");

const witnesses = [
  ["chitat", 1, "чита́ешь"],
  ["govorit", 5, "говоря́т"],
  ["pisat", 0, "пишу́"],
  ["lyubit", 0, "люблю́"],
  ["khodit", 0, "хожу́"],
  ["khotet", 3, "хоти́м"],
];
for (const [id, person, form] of witnesses) {
  const verb = VERBS.find((v) => v.id === id);
  expect(`conjugaison ${id}[${person}]`, verb?.present[person], form);
}

// ─── 5. Banque de verbes ─────────────────────────────────────────
const ids = new Set();
for (const verb of VERBS) {
  const where = `verbe ${verb.infinitive}`;
  require_(!ids.has(verb.id), `${where} : identifiant en double (${verb.id})`);
  ids.add(verb.id);
  require_(verb.present.length === 6, `${where} : ${verb.present.length} formes de présent`);
  require_(verb.past.length === 2, `${where} : le passé doit avoir masculin et féminin`);
  require_(verb.translation.length > 0, `${where} : sans traduction`);

  for (const form of [...verb.present, ...verb.past, verb.infinitive]) {
    if (vowelCount(form) >= 2 && !form.includes(ACCENT) && !form.includes("ё")) {
      failures.push(`${where} : « ${form} » n'est pas accentué`);
    }
    checks += 1;
  }

  // La terminaison doit correspondre à la classe déclarée : c'est ce que
  // l'onglet enseigne, une erreur ici enseignerait le contraire.
  if (verb.conjugation === "first") {
    const plural = strip(verb.present[5]);
    require_(
      plural.endsWith("ют") || plural.endsWith("ут"),
      `${where} : 1ʳᵉ conjugaison mais они́ ${verb.present[5]}`
    );
    const you = strip(verb.present[1]);
    require_(
      you.endsWith("ешь") || you.endsWith("ёшь"),
      `${where} : 1ʳᵉ conjugaison mais ты ${verb.present[1]}`
    );
  } else if (verb.conjugation === "second") {
    const plural = strip(verb.present[5]);
    require_(
      plural.endsWith("ят") || plural.endsWith("ат"),
      `${where} : 2ᵉ conjugaison mais они́ ${verb.present[5]}`
    );
    const you = strip(verb.present[1]);
    require_(you.endsWith("ишь"), `${where} : 2ᵉ conjugaison mais ты ${verb.present[1]}`);
  }

  if (verb.mutation) {
    require_(
      !verb.present.includes(verb.mutation.naive),
      `${where} : la forme fautive « ${verb.mutation.naive} » est aussi une forme réelle`
    );
  }
}

// L'onglet « passé » a besoin d'assez de verbes à accent mobile.
require_(
  conjugation.SHIFTING_VERBS.length >= 8,
  `seulement ${conjugation.SHIFTING_VERBS.length} verbes à accent mobile au passé`
);

// ─── 6. Liens et routes ──────────────────────────────────────────
function routeExists(href) {
  const segments = href.split("/").filter(Boolean);
  return fs.existsSync(path.join(ROOT, "app", ...segments, "page.tsx"));
}

const catalogRoutes = new Set(["/exercices", ...EXERCISE_MODULES.map((m) => m.href)]);
for (const entry of EXERCISE_MODULES) {
  require_(routeExists(entry.href), `module ${entry.id} : route absente (${entry.href})`);
  require_(
    findLesson(entry.lesson.href.replace("/cours/", "")) !== undefined,
    `module ${entry.id} : leçon inexistante (${entry.lesson.href})`
  );
  require_(entry.skills.length >= 4, `module ${entry.id} : moins de 4 compétences`);
  require_(moduleLevels(entry).length > 0, `module ${entry.id} : aucun niveau`);
  for (const skill of entry.skills) {
    require_(
      routeExists(`${entry.href}/[skill]`) || routeExists(`${entry.href}/[caseSlug]`),
      `module ${entry.id} : pas de page de compétence`
    );
    require_(skill.title.length > 0, `module ${entry.id} › ${skill.id} : titre vide`);
  }
}

require_(
  EXERCISE_ROUTES.length === catalogRoutes.size &&
    EXERCISE_ROUTES.every((route) => catalogRoutes.has(route)),
  `lib/exercises/routes.ts ne correspond plus au catalogue : ${EXERCISE_ROUTES.join(", ")}`
);

// ─── Rapport ─────────────────────────────────────────────────────
//
// LES ÉCHECS D'ABORD. Le résumé s'imprimait avant eux, si bien qu'un run
// qui échoue commençait par deux lignes rassurantes — « 8 modules,
// 40 compétences » — avant d'annoncer ce qui n'allait pas. Sur un terminal
// qui défile, c'est la première ligne qu'on lit.
if (failures.length > 0) {
  console.error(`\n${failures.length} problème(s) sur ${checks} contrôles :`);
  for (const failure of failures.slice(0, 40)) console.error(`  - ${failure}`);
  if (failures.length > 40) console.error(`  … et ${failures.length - 40} autres`);
  process.exit(1);
}

const skillTotal = EXERCISE_MODULES.reduce((sum, m) => sum + m.skills.length, 0);
console.log(
  `Exercices : ${EXERCISE_MODULES.length} modules, ${skillTotal} compétences, ${DRAWS} tirages par onglet`
);
console.log(
  `Banque de verbes : ${VERBS.length} verbes, ${conjugation.SHIFTING_VERBS.length} à accent mobile au passé`
);
console.log(`${checks} contrôles passés.`);
