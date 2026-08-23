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
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const { declineNoun, stripAccent } = await jiti.import("../lib/grammar/decline.ts");
const { declineAdjective } = await jiti.import("../lib/grammar/decline-adjective.ts");
const { NOUNS } = await jiti.import("../lib/grammar/nouns-data.ts");
const { RUSSIAN_NAMES } = await jiti.import("../lib/grammar/names-data.ts");
const { ADJECTIVES } = await jiti.import("../lib/grammar/adjectives-data.ts");
const { CASE_ORDER } = await jiti.import("../lib/grammar/types.ts");
const { generateAdjectiveExercise, generateSentenceExercise } = await jiti.import(
  "../lib/grammar/exercise-generator.ts"
);
const { TRIGGERS } = await jiti.import("../lib/grammar/triggers.ts");
const { categoryOf, DECLARED_CATEGORIES } = await jiti.import(
  "../lib/grammar/noun-categories.ts"
);
const { TRIGGER_NOUNS } = await jiti.import("../lib/grammar/trigger-nouns.generated.ts");

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

// ─── 5. Mode « accord adjectif » ───────────────────────────────────
// L'exercice demande le SEUL adjectif, le nom étant déjà décliné dans la
// phrase. Trois façons de le casser, toutes vérifiées sur un vrai tirage :
//
//   - demander plusieurs mots, ce qui mêlerait accord et déclinaison dans
//     une seule réponse ;
//   - oublier d'écrire le nom après le blanc, l'apprenant n'ayant alors
//     rien sur quoi accorder ;
//   - tirer une combinaison où la réponse EST la forme du dictionnaire
//     montrée en indice (nominatif masculin, accusatif masculin inanimé) :
//     l'exercice est alors donné.
{
  let multiword = 0;
  let missingNoun = 0;
  let degenerate = 0;
  let serverMismatch = 0;
  let offScope = 0;
  let offList = 0;
  let draws = 0;
  const adjectivesSeen = new Set();

  for (const caseId of CASE_ORDER) {
    for (let i = 0; i < 500; i += 1) {
      const ex = generateAdjectiveExercise(caseId);
      draws += 1;

      if (ex.correctForm.trim().includes(" ")) multiword += 1;
      if (ex.correctForm === ex.adjective.lemmaM) degenerate += 1;
      if (!(ex.sentenceTemplate.split("___")[1] ?? "").trim()) missingNoun += 1;

      // Ce que le serveur recalculera à partir des seuls identifiants
      // envoyés par le client (app/api/cases/attempt/route.ts).
      const server = declineAdjective(
        ex.adjective,
        caseId,
        ex.noun.gender,
        ex.plural,
        ex.noun.animacy
      ).form;
      if (server !== ex.correctForm) serverMismatch += 1;

      // La portée sémantique est-elle respectée sur un vrai tirage ? C'est
      // ce qui empêche « вку́сная сосе́дка » — désinence juste, phrase
      // inavouable.
      adjectivesSeen.add(ex.adjective.id);
      if (ex.adjective.appliesTo && ex.noun.animacy !== ex.adjective.appliesTo) offScope += 1;
      if (ex.adjective.onlyNouns && !ex.adjective.onlyNouns.includes(ex.noun.id)) offList += 1;
    }
  }

  expect(
    `accord adjectif : adjectifs jamais tirés (${adjectivesSeen.size}/${ADJECTIVES.length})`,
    adjectivesSeen.size,
    ADJECTIVES.length
  );

  expect(`accord adjectif : réponses en plusieurs mots (${draws} tirages)`, multiword, 0);
  expect("accord adjectif : nom manquant après le blanc", missingNoun, 0);
  expect("accord adjectif : réponse identique à l'indice", degenerate, 0);
  expect("accord adjectif : forme attendue différente côté serveur", serverMismatch, 0);
  expect("accord adjectif : adjectif hors de sa portée sémantique", offScope, 0);
  expect("accord adjectif : nom hors de la liste autorisée", offList, 0);
}

// La contrainte sémantique ne doit pas se payer en variété : un adjectif
// qui ne sortirait plus jamais, ou un cas qui n'en verrait qu'un seul,
// appauvrirait l'exercice en silence.
{
  const NOUN_IDS = new Set(NOUNS.map((n) => n.id));
  for (const adj of ADJECTIVES) {
    for (const id of adj.onlyNouns ?? []) {
      expect(`${adj.lemmaM} : « ${id} » de onlyNouns absent de la banque`, NOUN_IDS.has(id), true);
    }
    // Chaque adjectif doit rester tirable dans les six cas, au singulier
    // comme au pluriel : sinon la contrainte l'a purement éliminé.
    for (const caseId of CASE_ORDER) {
      for (const plural of [false, true]) {
        const usable = ["masculine", "feminine", "neuter"].flatMap((gender) =>
          ["animate", "inanimate"]
            .filter(
              (animacy) =>
                declineAdjective(adj, caseId, gender, plural, animacy).form !== adj.lemmaM
            )
            .map((animacy) => `${gender}:${animacy}`)
        );
        const allowed = adj.onlyNouns ? new Set(adj.onlyNouns) : null;
        const count = NOUNS.filter(
          (n) =>
            usable.includes(`${n.gender}:${n.animacy}`) &&
            (adj.appliesTo === undefined || n.animacy === adj.appliesTo) &&
            (allowed === null || allowed.has(n.id))
        ).length;
        expect(
          `${adj.lemmaM} : aucun nom disponible au ${caseId}${plural ? " pluriel" : " singulier"}`,
          count > 0,
          true
        );
      }
    }
  }
}

// ─── 6. Genre français des traductions ─────────────────────────────
// Le genre français est écrit à la main dans scripts/data/nouns-fr.tsv, et
// il est INDÉPENDANT du genre russe : гости́ница est féminin en russe, mais
// « hôtel » est masculin. La confusion est facile à faire en saisissant les
// données, et elle se voyait à peine — jusqu'à ce que le mode « accord
// adjectif » écrive la traduction complète et produise « d'hôtel chaude ».
//
// Ce contrôle ne connaît pas le français : il applique les terminaisons qui
// ne trompent pas, avec la liste explicite de leurs exceptions. Il ne
// prétend donc pas tout couvrir, seulement empêcher qu'une faute de ce type
// revienne sans qu'on s'en aperçoive.
{
  const RULES = [
    [/(?:tion|sion)$/i, "f"],
    [/té$/i, "f"],
    [/ette$/i, "f"],
    [/(?:ance|ence)$/i, "f"],
    [/ure$/i, "f"],
    [/esse$/i, "f"],
    [/ment$/i, "m"],
    [/eau$/i, "m"],
    [/oir$/i, "m"],
    [/el$/i, "m"],
    [/age$/i, "m"],
  ];
  // Mots qui contredisent leur terminaison — le français en est plein.
  // « invité » est un participe substantivé, pas un nom en -té comme
  // « liberté » : la terminaison ne dit rien de son genre.
  const EXCEPTIONS = new Set(["côté", "été", "eau", "peau", "image", "invité"]);

  for (const noun of NOUNS) {
    // Le premier mot seul : « ticket de caisse », « nom de famille ».
    const head = noun.translation.split(/[\s(]/)[0].toLowerCase();
    if (EXCEPTIONS.has(head)) continue;
    for (const [pattern, gender] of RULES) {
      if (!pattern.test(head)) continue;
      expect(
        `genre français de « ${noun.translation} » (${noun.lemma})`,
        noun.frenchGender,
        gender
      );
      break;
    }
  }
}

// ─── 7. Classes sémantiques et déclencheurs ────────────────────────
// Un exercice de phrase colle un déclencheur et un nom tirés séparément.
// Sans contrainte, « Я ем ___ » recevait « помо́щник » : « je mange cet
// assistant ». Trois choses doivent tenir.
let curatedTriggers = 0;
let demandingTriggers = 0;
{
  // a) La classification couvre la banque, une classe et une seule par nom.
  //    C'est ce qui rend le fichier relisable : une omission se voit ici,
  //    elle ne se dilue pas dans un tirage.
  const declared = new Map();
  for (const [category, words] of DECLARED_CATEGORIES) {
    for (const word of words) {
      expect(
        `« ${word} » classé deux fois (${declared.get(word)} et ${category})`,
        declared.has(word),
        false
      );
      declared.set(word, category);
    }
  }
  const known = new Set(NOUNS.map((n) => n.translation));
  for (const word of declared.keys()) {
    expect(`« ${word} » classé mais absent de la banque`, known.has(word), true);
  }
  for (const noun of NOUNS) {
    expect(`« ${noun.translation} » (${noun.lemma}) sans classe sémantique`, categoryOf(noun.id) !== undefined, true);
  }

  // b) Aucun déclencheur ne peut se retrouver sans nom à servir. Une classe
  //    trop étroite viderait son pool en silence, et l'exercice retomberait
  //    sur le repli — donc sur des phrases absurdes, sans que rien ne le dise.
  // Certains déclencheurs sont légitimement étroits : la banque ne contient
  // que six boissons, donc « un verre de ___ » ne peut pas dépasser six.
  const MIN_NOUNS = 4;
  for (const trigger of TRIGGERS) {
    if (!trigger.accepts) continue;
    const accepted = new Set(trigger.accepts);
    const count = NOUNS.filter((n) => accepted.has(categoryOf(n.id))).length;
    expect(
      `déclencheur « ${trigger.id} » : ${count} nom(s) disponibles, minimum ${MIN_NOUNS}`,
      count >= MIN_NOUNS,
      true
    );
  }

  // c) La liste curée (trigger-nouns.generated.ts) est la source normale du
  //    tirage : elle doit être saine. C'est de la donnée écrite par un
  //    modèle, donc exactement le genre de chose qu'on ne croit pas sur
  //    parole.
  const NOUN_IDS = new Set(NOUNS.map((n) => n.id));
  for (const [triggerId, ids] of Object.entries(TRIGGER_NOUNS)) {
    const trigger = TRIGGERS.find((t) => t.id === triggerId);
    expect(`liste curée « ${triggerId} » : déclencheur inconnu`, trigger !== undefined, true);
    expect(
      `liste curée « ${triggerId} » : ${ids.length} mot(s), minimum ${MIN_NOUNS}`,
      ids.length >= MIN_NOUNS,
      true
    );
    expect(`liste curée « ${triggerId} » : doublons`, new Set(ids).size, ids.length);
    for (const id of ids) {
      expect(`liste curée « ${triggerId} » : « ${id} » hors banque`, NOUN_IDS.has(id), true);
    }
  }

  // Un déclencheur sans liste curée n'est PAS une anomalie : il retombe sur
  // ses classes sémantiques, qui produisent des phrases correctes, juste un
  // peu moins fines. La curation est un raffinement progressif, pas un
  // prérequis — le compte est reporté en fin de contrôle, il ne fait pas
  // échouer la suite.
  curatedTriggers = TRIGGERS.filter(
    (t) => t.accepts && TRIGGER_NOUNS[t.id]?.length > 0
  ).length;
  demandingTriggers = TRIGGERS.filter((t) => t.accepts).length;

  // d) Sur un vrai tirage, le nom servi vient bien de la liste curée — ou,
  //    à défaut de liste, d'une classe acceptée.
  let outOfPool = 0;
  let draws = 0;
  for (const trigger of TRIGGERS) {
    if (!trigger.accepts) continue;
    const curated = TRIGGER_NOUNS[trigger.id];
    const allowed = curated?.length
      ? new Set(curated)
      : new Set(NOUNS.filter((n) => trigger.accepts.includes(categoryOf(n.id))).map((n) => n.id));
    for (let i = 0; i < 30; i += 1) {
      const ex = generateSentenceExercise(trigger.caseId, trigger);
      draws += 1;
      if (!allowed.has(ex.noun.id)) outOfPool += 1;

      const adj = generateAdjectiveExercise(trigger.caseId, trigger);
      draws += 1;
      if (!allowed.has(adj.noun.id)) outOfPool += 1;
    }
  }
  expect(`nom servi hors du pool autorisé (${draws} tirages)`, outOfPool, 0);
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
  `  déclencheurs exigeants : ${curatedTriggers}/${demandingTriggers} avec liste curée, ` +
    `le reste sur ses classes sémantiques`
);
console.log(
  `  banque : ${NOUNS.length} noms (${total} formes), ${RUSSIAN_NAMES.length} prénoms, ${ADJECTIVES.length} adjectifs`
);
console.log(
  `  moteur de règles vs dictionnaire : ${(((total - irregularForms) / total) * 100).toFixed(1)}% des formes retrouvées ` +
    `(${irregularWords} mots ont au moins une forme que la règle ne prédit pas — c'est pourquoi le dictionnaire fait foi)`
);
