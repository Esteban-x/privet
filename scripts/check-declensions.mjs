/**
 * Contrôles du module "Cas" — `npm run check:grammar`.
 *
 * Le module affiche la forme qu'il calcule comme LA bonne réponse : une
 * terminaison fausse n'y est pas un bug d'affichage, c'est une faute
 * enseignée. Quatre contrôles, du plus structurel au plus fin :
 *
 * 1. INVARIANTS de la banque importée : 12 formes par mot, identifiants et
 *    traductions uniques, nominatif cohérent avec le lemme, accents présents.
 * 2. TÉMOINS : un échantillon de paradigmes recopiés à la main. Ils ne
 *    testent pas la langue russe (le dictionnaire fait foi) mais la CHAÎNE
 *    d'import : si build-nouns.mjs se casse ou si la source change de
 *    format, ces mots-là le montrent immédiatement.
 * 3. PRÉNOMS : paradigmes écrits à la main (absents du dictionnaire), donc
 *    vérifiés en entier.
 * 4. ADJECTIFS : eux restent calculés par règle (système fermé et régulier),
 *    donc entièrement testés contre une table de référence.
 *
 * Il affiche aussi le taux d'accord entre le moteur de règles et le
 * dictionnaire — la mesure qui justifie l'architecture (le moteur explique,
 * il ne décide pas).
 */
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { declineNoun, stripAccent } = await jiti.import("../lib/grammar/decline.ts");
const { declineAdjective } = await jiti.import("../lib/grammar/decline-adjective.ts");
const { NOUNS } = await jiti.import("../lib/grammar/nouns-data.ts");
const { RUSSIAN_NAMES } = await jiti.import("../lib/grammar/names-data.ts");
const { ADJECTIVES } = await jiti.import("../lib/grammar/adjectives-data.ts");
const { CASE_ORDER } = await jiti.import("../lib/grammar/types.ts");

const failures = [];
let checks = 0;
function expect(label, got, want) {
  checks += 1;
  if (got !== want) failures.push(`${label} : "${got}" au lieu de "${want}"`);
}
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

// ─── 1. Invariants de la banque ────────────────────────────────────
const VOWELS = "аеёиоуыэюя";
const ids = new Map();
const translations = new Map();
for (const n of NOUNS) {
  require_(!ids.has(n.id), `identifiant en double : "${n.id}" (${n.lemma} et ${ids.get(n.id)})`);
  ids.set(n.id, n.lemma);

  const key = n.translation.toLowerCase();
  require_(
    !translations.has(key),
    `traduction en double : "${n.translation}" partagée par ${n.lemma} et ${translations.get(key)} — indice ambigu dans l'exercice`
  );
  translations.set(key, n.lemma);

  require_(n.forms.singular.length === 6, `${n.lemma} : ${n.forms.singular.length} formes au singulier`);
  require_(n.forms.plural.length === 6, `${n.lemma} : ${n.forms.plural.length} formes au pluriel`);
  require_(
    stripAccent(n.forms.singular[0]) === n.lemma,
    `${n.lemma} : le nominatif du paradigme est "${stripAccent(n.forms.singular[0])}"`
  );
  for (const form of [...n.forms.singular, ...n.forms.plural]) {
    const bare = stripAccent(form);
    require_(/^[а-яёА-ЯЁ]+$/.test(bare), `${n.lemma} : forme "${form}" hors alphabet cyrillique`);
    // Le ё porte toujours l'accent en russe : le dictionnaire ne le marque
    // pas en plus, et c'est correct.
    const vowels = [...bare].filter((c) => VOWELS.includes(c.toLowerCase())).length;
    const carriesStress = form !== bare || bare.includes("ё") || bare.includes("Ё");
    require_(
      vowels <= 1 || carriesStress,
      `${n.lemma} : forme "${form}" polysyllabique sans accent tonique`
    );
  }
}

// ─── 2. Paradigmes témoins ─────────────────────────────────────────
// Recopiés à la main, un par difficulté : voyelle mobile, supplétisme,
// pluriel en -ья, radical en ц, radical en -и, 3e déclinaison, masculin
// en -а, chuintante accentuée.
const WITNESSES = {
  "стол": [
    ["стол", "стола", "столу", "стол", "столом", "столе"],
    ["столы", "столов", "столам", "столы", "столами", "столах"],
  ],
  "отец": [
    ["отец", "отца", "отцу", "отца", "отцом", "отце"],
    ["отцы", "отцов", "отцам", "отцов", "отцами", "отцах"],
  ],
  "день": [
    ["день", "дня", "дню", "день", "днём", "дне"],
    ["дни", "дней", "дням", "дни", "днями", "днях"],
  ],
  "человек": [
    ["человек", "человека", "человеку", "человека", "человеком", "человеке"],
    ["люди", "людей", "людям", "людей", "людьми", "людях"],
  ],
  "ребёнок": [
    ["ребёнок", "ребёнка", "ребёнку", "ребёнка", "ребёнком", "ребёнке"],
    ["дети", "детей", "детям", "детей", "детьми", "детях"],
  ],
  "стул": [
    ["стул", "стула", "стулу", "стул", "стулом", "стуле"],
    ["стулья", "стульев", "стульям", "стулья", "стульями", "стульях"],
  ],
  "мальчик": [
    ["мальчик", "мальчика", "мальчику", "мальчика", "мальчиком", "мальчике"],
    ["мальчики", "мальчиков", "мальчикам", "мальчиков", "мальчиками", "мальчиках"],
  ],
  "папа": [
    ["папа", "папы", "папе", "папу", "папой", "папе"],
    ["папы", "пап", "папам", "пап", "папами", "папах"],
  ],
  "врач": [
    ["врач", "врача", "врачу", "врача", "врачом", "враче"],
    ["врачи", "врачей", "врачам", "врачей", "врачами", "врачах"],
  ],
  "сердце": [
    ["сердце", "сердца", "сердцу", "сердце", "сердцем", "сердце"],
    ["сердца", "сердец", "сердцам", "сердца", "сердцами", "сердцах"],
  ],
  "здание": [
    ["здание", "здания", "зданию", "здание", "зданием", "здании"],
    ["здания", "зданий", "зданиям", "здания", "зданиями", "зданиях"],
  ],
  "ночь": [
    ["ночь", "ночи", "ночи", "ночь", "ночью", "ночи"],
    ["ночи", "ночей", "ночам", "ночи", "ночами", "ночах"],
  ],
  "мать": [
    ["мать", "матери", "матери", "мать", "матерью", "матери"],
    ["матери", "матерей", "матерям", "матерей", "матерями", "матерях"],
  ],
  "время": [
    ["время", "времени", "времени", "время", "временем", "времени"],
    ["времена", "времён", "временам", "времена", "временами", "временах"],
  ],
  "окно": [
    ["окно", "окна", "окну", "окно", "окном", "окне"],
    ["окна", "окон", "окнам", "окна", "окнами", "окнах"],
  ],
  "книга": [
    ["книга", "книги", "книге", "книгу", "книгой", "книге"],
    ["книги", "книг", "книгам", "книги", "книгами", "книгах"],
  ],
  "земля": [
    ["земля", "земли", "земле", "землю", "землёй", "земле"],
    ["земли", "земель", "землям", "земли", "землями", "землях"],
  ],
  "сестра": [
    ["сестра", "сестры", "сестре", "сестру", "сестрой", "сестре"],
    ["сёстры", "сестёр", "сёстрам", "сестёр", "сёстрами", "сёстрах"],
  ],
};

const byLemma = new Map(NOUNS.map((n) => [n.lemma, n]));
for (const [lemma, table] of Object.entries(WITNESSES)) {
  const noun = byLemma.get(lemma);
  if (!noun) {
    failures.push(`témoin "${lemma}" absent de la banque — ajoute-le à scripts/data/nouns-fr.tsv ou retire-le d'ici`);
    continue;
  }
  [false, true].forEach((plural, i) => {
    CASE_ORDER.forEach((c, j) => {
      expect(`${lemma} ${plural ? "pl." : "sg."} ${c}`, declineNoun(noun, c, plural).form, table[i][j]);
    });
  });
}

// ─── 3. Prénoms (paradigmes écrits à la main) ──────────────────────
const NAMES = {
  "Анна": [
    ["Анна", "Анны", "Анне", "Анну", "Анной", "Анне"],
    ["Анны", "Анн", "Аннам", "Анн", "Аннами", "Аннах"],
  ],
  "Мария": [
    ["Мария", "Марии", "Марии", "Марию", "Марией", "Марии"],
    ["Марии", "Марий", "Мариям", "Марий", "Мариями", "Мариях"],
  ],
  "Ольга": [
    ["Ольга", "Ольги", "Ольге", "Ольгу", "Ольгой", "Ольге"],
    ["Ольги", "Ольг", "Ольгам", "Ольг", "Ольгами", "Ольгах"],
  ],
  "Екатерина": [
    ["Екатерина", "Екатерины", "Екатерине", "Екатерину", "Екатериной", "Екатерине"],
    ["Екатерины", "Екатерин", "Екатеринам", "Екатерин", "Екатеринами", "Екатеринах"],
  ],
  "Наталья": [
    ["Наталья", "Натальи", "Наталье", "Наталью", "Натальей", "Наталье"],
    ["Натальи", "Наталий", "Натальям", "Наталий", "Натальями", "Натальях"],
  ],
  "Иван": [
    ["Иван", "Ивана", "Ивану", "Ивана", "Иваном", "Иване"],
    ["Иваны", "Иванов", "Иванам", "Иванов", "Иванами", "Иванах"],
  ],
  "Дмитрий": [
    ["Дмитрий", "Дмитрия", "Дмитрию", "Дмитрия", "Дмитрием", "Дмитрии"],
    ["Дмитрии", "Дмитриев", "Дмитриям", "Дмитриев", "Дмитриями", "Дмитриях"],
  ],
  "Александр": [
    ["Александр", "Александра", "Александру", "Александра", "Александром", "Александре"],
    ["Александры", "Александров", "Александрам", "Александров", "Александрами", "Александрах"],
  ],
  "Сергей": [
    ["Сергей", "Сергея", "Сергею", "Сергея", "Сергеем", "Сергее"],
    ["Сергеи", "Сергеев", "Сергеям", "Сергеев", "Сергеями", "Сергеях"],
  ],
  "Николай": [
    ["Николай", "Николая", "Николаю", "Николая", "Николаем", "Николае"],
    ["Николаи", "Николаев", "Николаям", "Николаев", "Николаями", "Николаях"],
  ],
};
require_(
  RUSSIAN_NAMES.length === Object.keys(NAMES).length,
  `${RUSSIAN_NAMES.length} prénoms dans la banque mais ${Object.keys(NAMES).length} dans la table de référence`
);
for (const name of RUSSIAN_NAMES) {
  const table = NAMES[name.lemma];
  if (!table) {
    failures.push(`prénom "${name.lemma}" absent de la table de référence`);
    continue;
  }
  [false, true].forEach((plural, i) => {
    CASE_ORDER.forEach((c, j) => {
      expect(`${name.lemma} ${plural ? "pl." : "sg."} ${c}`, declineNoun(name, c, plural).form, table[i][j]);
    });
  });
}

// ─── 4. Adjectifs (calculés par règle, donc testés en entier) ──────
const ADJ_TABLE = {
  "красивый": {
    masculine: ["красивый", "красивого", "красивому", "красивый", "красивым", "красивом"],
    feminine: ["красивая", "красивой", "красивой", "красивую", "красивой", "красивой"],
    neuter: ["красивое", "красивого", "красивому", "красивое", "красивым", "красивом"],
    plural: ["красивые", "красивых", "красивым", "красивые", "красивыми", "красивых"],
  },
  "русский": {
    masculine: ["русский", "русского", "русскому", "русский", "русским", "русском"],
    feminine: ["русская", "русской", "русской", "русскую", "русской", "русской"],
    neuter: ["русское", "русского", "русскому", "русское", "русским", "русском"],
    plural: ["русские", "русских", "русским", "русские", "русскими", "русских"],
  },
  "хороший": {
    masculine: ["хороший", "хорошего", "хорошему", "хороший", "хорошим", "хорошем"],
    feminine: ["хорошая", "хорошей", "хорошей", "хорошую", "хорошей", "хорошей"],
    neuter: ["хорошее", "хорошего", "хорошему", "хорошее", "хорошим", "хорошем"],
    plural: ["хорошие", "хороших", "хорошим", "хорошие", "хорошими", "хороших"],
  },
  "большой": {
    masculine: ["большой", "большого", "большому", "большой", "большим", "большом"],
    feminine: ["большая", "большой", "большой", "большую", "большой", "большой"],
    neuter: ["большое", "большого", "большому", "большое", "большим", "большом"],
    plural: ["большие", "больших", "большим", "большие", "большими", "больших"],
  },
  "синий": {
    masculine: ["синий", "синего", "синему", "синий", "синим", "синем"],
    feminine: ["синяя", "синей", "синей", "синюю", "синей", "синей"],
    neuter: ["синее", "синего", "синему", "синее", "синим", "синем"],
    plural: ["синие", "синих", "синим", "синие", "синими", "синих"],
  },
};
const ADJ_ANIMATE_ACC = {
  "красивый": { masculine: "красивого", plural: "красивых" },
  "русский": { masculine: "русского", plural: "русских" },
  "хороший": { masculine: "хорошего", plural: "хороших" },
  "большой": { masculine: "большого", plural: "больших" },
  "синий": { masculine: "синего", plural: "синих" },
};
for (const adj of ADJECTIVES) {
  const table = ADJ_TABLE[adj.lemmaM];
  if (!table) continue; // couverture par famille : un modèle représentatif suffit
  for (const key of ["masculine", "feminine", "neuter", "plural"]) {
    const plural = key === "plural";
    const gender = plural ? "masculine" : key;
    CASE_ORDER.forEach((c, j) => {
      expect(
        `${adj.lemmaM} ${key} ${c}`,
        declineAdjective(adj, c, gender, plural, "inanimate").form,
        table[key][j]
      );
    });
  }
  const animate = ADJ_ANIMATE_ACC[adj.lemmaM];
  expect(`${adj.lemmaM} masc. animé acc.`, declineAdjective(adj, "accusative", "masculine", false, "animate").form, animate.masculine);
  expect(`${adj.lemmaM} pl. animé acc.`, declineAdjective(adj, "accusative", "masculine", true, "animate").form, animate.plural);
}

// ─── Rapport ───────────────────────────────────────────────────────
let irregularForms = 0;
let irregularWords = 0;
for (const n of NOUNS) {
  let any = false;
  for (const plural of [false, true]) {
    for (const c of CASE_ORDER) {
      if (declineNoun(n, c, plural).isIrregular) {
        irregularForms++;
        any = true;
      }
    }
  }
  if (any) irregularWords++;
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} problème(s) sur ${checks} contrôles :\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error("");
  process.exit(1);
}

const total = NOUNS.length * 12;
console.log(`✓ ${checks} contrôles passés.`);
console.log(
  `  banque : ${NOUNS.length} noms (${total} formes), ${RUSSIAN_NAMES.length} prénoms, ${ADJECTIVES.length} adjectifs`
);
console.log(
  `  moteur de règles vs dictionnaire : ${(((total - irregularForms) / total) * 100).toFixed(1)}% des formes retrouvées ` +
    `(${irregularWords} mots ont au moins une forme que la règle ne prédit pas — c'est pourquoi le dictionnaire fait foi)`
);
