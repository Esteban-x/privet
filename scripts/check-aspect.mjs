/**
 * Contrôles du module « aspect verbal » — `npm run check:aspect`.
 *
 * Trois risques, tous silencieux :
 *
 * 1. LES FORMES. Les paires ne se dérivent pas (говори́ть → сказа́ть,
 *    брать → взять) : une coquille y enseigne un verbe qui n'existe pas.
 * 2. L'ACCORD PHRASE / RÉPONSE. La phrase française nomme le verbe, la
 *    réponse attendue doit donc être une forme de CE verbe. Un contexte
 *    relié à plusieurs paires produisait « J'ai lu ce livre » → « решил ».
 * 3. L'AMBIGUÏTÉ. Le module ne doit contenir que des contextes où l'aspect
 *    est forcé. On vérifie au moins que chaque contexte porte une
 *    justification explicite, et que les marqueurs nommés existent.
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const V = await jiti.import("../lib/aspect/verbs.ts");
const X = await jiti.import("../lib/aspect/exercises.ts");

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

const CYRILLIC = /^[а-яёА-ЯЁ -]+$/;

// ─── 1. Paires : table de référence relue à la main ────────────────
const EXPECTED = {
  делать: ["сделать", "делал", "сделал", "делаю", "сделаю"],
  писать: ["написать", "писал", "написал", "пишу", "напишу"],
  читать: ["прочитать", "читал", "прочитал", "читаю", "прочитаю"],
  смотреть: ["посмотреть", "смотрел", "посмотрел", "смотрю", "посмотрю"],
  готовить: ["приготовить", "готовил", "приготовил", "готовлю", "приготовлю"],
  строить: ["построить", "строил", "построил", "строю", "построю"],
  учить: ["выучить", "учил", "выучил", "учу", "выучу"],
  пить: ["выпить", "пил", "выпил", "пью", "выпью"],
  есть: ["съесть", "ел", "съел", "ем", "съем"],
  звонить: ["позвонить", "звонил", "позвонил", "звоню", "позвоню"],
  видеть: ["увидеть", "видел", "увидел", "вижу", "увижу"],
  завтракать: ["позавтракать", "завтракал", "позавтракал", "завтракаю", "позавтракаю"],
  решать: ["решить", "решал", "решил", "решаю", "решу"],
  получать: ["получить", "получал", "получил", "получаю", "получу"],
  забывать: ["забыть", "забывал", "забыл", "забываю", "забуду"],
  объяснять: ["объяснить", "объяснял", "объяснил", "объясняю", "объясню"],
  повторять: ["повторить", "повторял", "повторил", "повторяю", "повторю"],
  отвечать: ["ответить", "отвечал", "ответил", "отвечаю", "отвечу"],
  встречать: ["встретить", "встречал", "встретил", "встречаю", "встречу"],
  покупать: ["купить", "покупал", "купил", "покупаю", "куплю"],
  открывать: ["открыть", "открывал", "открыл", "открываю", "открою"],
  закрывать: ["закрыть", "закрывал", "закрыл", "закрываю", "закрою"],
  начинать: ["начать", "начинал", "начал", "начинаю", "начну"],
  заканчивать: ["закончить", "заканчивал", "закончил", "заканчиваю", "закончу"],
  вставать: ["встать", "вставал", "встал", "встаю", "встану"],
  давать: ["дать", "давал", "дал", "даю", "дам"],
  изучать: ["изучить", "изучал", "изучил", "изучаю", "изучу"],
  говорить: ["сказать", "говорил", "сказал", "говорю", "скажу"],
  брать: ["взять", "брал", "взял", "беру", "возьму"],
  класть: ["положить", "клал", "положил", "кладу", "положу"],
  садиться: ["сесть", "садился", "сел", "сажусь", "сяду"],
  ложиться: ["лечь", "ложился", "лёг", "ложусь", "лягу"],
};

const ids = new Set();
for (const pair of V.ASPECT_PAIRS) {
  require_(!ids.has(pair.id), `identifiant en double : ${pair.id}`);
  ids.add(pair.id);
  const expected = EXPECTED[pair.imperfective];
  if (!expected) {
    failures.push(`${pair.imperfective} absent de la table de référence de check-aspect.mjs`);
    continue;
  }
  const got = [pair.perfective, pair.impPast, pair.perfPast, pair.impPresent1, pair.perfFuture1];
  const labels = ["perfectif", "passé imp.", "passé perf.", "présent 1sg", "futur perf. 1sg"];
  got.forEach((form, i) => {
    require_(
      form === expected[i],
      `${pair.imperfective} : ${labels[i]} "${form}" au lieu de "${expected[i]}"`
    );
  });
  for (const form of [...got, pair.impImperative, pair.perfImperative]) {
    require_(CYRILLIC.test(form), `${pair.imperfective} : forme "${form}" hors alphabet cyrillique`);
  }
  require_(
    pair.impImperative !== pair.perfImperative,
    `${pair.imperfective} : les deux impératifs sont identiques, l'exercice n'aurait pas de réponse`
  );
  require_(
    ["prefixe", "suffixe", "suppletion"].includes(pair.formation),
    `${pair.imperfective} : procédé de formation inconnu "${pair.formation}"`
  );
}
require_(
  V.ASPECT_PAIRS.length >= 25,
  `seulement ${V.ASPECT_PAIRS.length} paires, la pratique tournerait en rond`
);
for (const formation of ["prefixe", "suffixe", "suppletion"]) {
  const n = V.ASPECT_PAIRS.filter((p) => p.formation === formation).length;
  require_(n >= 4, `seulement ${n} paires « ${formation} » : le procédé serait sous-représenté`);
}

// ─── 2. Contextes : une paire, une justification ───────────────────
for (const [label, contexts] of [
  ["passé", X.PAST_CONTEXTS],
  ["futur", X.FUTURE_CONTEXTS],
  ["impératif", X.IMPERATIVE_CONTEXTS],
]) {
  const seen = new Set();
  for (const c of contexts) {
    require_(!seen.has(c.id), `${label} : identifiant de contexte en double "${c.id}"`);
    seen.add(c.id);
    require_(
      typeof c.pair === "string" && V.getPair(c.pair) !== undefined,
      `${label} / ${c.id} : paire "${c.pair}" inconnue — un contexte doit être lié à UNE paire`
    );
    require_(
      ["imperfective", "perfective"].includes(c.answer),
      `${label} / ${c.id} : aspect attendu invalide`
    );
    require_(
      c.why.trim().length > 20,
      `${label} / ${c.id} : justification absente ou trop courte — l'item serait un piège, pas une leçon`
    );
    require_(c.fr.trim().length > 0, `${label} / ${c.id} : phrase française manquante`);
    require_(c.template.includes("___"), `${label} / ${c.id} : le gabarit russe n'a pas de trou`);
  }
  require_(contexts.length >= 5, `${label} : seulement ${contexts.length} contextes`);
}

// Le mode « marqueurs » ne tire que des contextes dont le mot déclencheur
// est nommé : sinon la consigne poserait une question sans objet.
for (const id of Object.keys(X.MARKER_OF)) {
  require_(
    X.PAST_CONTEXTS.some((c) => c.id === id),
    `MARKER_OF référence un contexte inexistant : "${id}"`
  );
}
require_(
  Object.keys(X.MARKER_OF).length >= 8,
  `seulement ${Object.keys(X.MARKER_OF).length} marqueurs nommés`
);

// ─── 3. Génération et correction ───────────────────────────────────
for (const skill of X.ASPECT_SKILLS) {
  let malformed = 0;
  let unverifiable = 0;
  let mismatchedPair = 0;
  const items = new Set();

  for (let i = 0; i < 800; i++) {
    const ex = X.generateAspectExercise(skill.id);
    items.add(ex.itemId);
    const answer = ex.options[ex.correctIndex];

    if (ex.options.length < 2 || new Set(ex.options).size !== ex.options.length) malformed += 1;
    if (X.checkAspectAnswer(ex.itemId, answer) !== true) unverifiable += 1;
    const wrong = ex.options.find((o) => o !== answer);
    if (wrong && X.checkAspectAnswer(ex.itemId, wrong) !== false) unverifiable += 1;

    // La réponse doit être une forme de la paire du contexte : c'est le bug
    // « J'ai lu ce livre → решил » qu'on interdit ici par construction.
    if (skill.id !== "pairs") {
      const pair = V.getPair(ex.itemId.split(":")[2]);
      const forms = pair
        ? [
            pair.impPast,
            pair.perfPast,
            pair.perfFuture1,
            `буду ${pair.imperfective}`,
            pair.impImperative,
            pair.perfImperative,
          ]
        : [];
      if (!pair || !forms.includes(answer)) mismatchedPair += 1;
    }
  }

  require_(malformed === 0, `${skill.id} : ${malformed} exercices malformés`);
  require_(
    unverifiable === 0,
    `${skill.id} : ${unverifiable} exercices que le serveur ne rejuge pas correctement`
  );
  require_(
    mismatchedPair === 0,
    `${skill.id} : ${mismatchedPair} exercices dont la réponse n'appartient pas au verbe de la phrase`
  );
  require_(items.size >= 5, `${skill.id} : seulement ${items.size} items distincts`);
}

require_(
  X.checkAspectAnswer("past:inexistant:chitat", "читал") === null,
  "un contexte inconnu doit être rejeté"
);
require_(X.checkAspectAnswer("", "") === null, "un identifiant vide doit être rejeté");

// ─── Rapport ───────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n✗ ${failures.length} problème(s) sur ${checks} contrôles :\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error("");
  process.exit(1);
}

const items = X.ASPECT_SKILLS.map((s) => {
  const seen = new Set();
  for (let i = 0; i < 600; i++) seen.add(X.generateAspectExercise(s.id).itemId);
  return `${s.id} ${seen.size}`;
});
console.log(`✓ ${checks} contrôles passés.`);
console.log(
  `  banque : ${V.ASPECT_PAIRS.length} paires (` +
    ["prefixe", "suffixe", "suppletion"]
      .map((f) => `${f} ${V.ASPECT_PAIRS.filter((p) => p.formation === f).length}`)
      .join(", ") +
    ")"
);
console.log(
  `  contextes : ${X.PAST_CONTEXTS.length} passé, ${X.FUTURE_CONTEXTS.length} futur, ${X.IMPERATIVE_CONTEXTS.length} impératif`
);
console.log(`  items distincts par compétence : ${items.join(", ")}`);
