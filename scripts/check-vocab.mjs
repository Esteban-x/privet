/**
 * Contrôles du vocabulaire et de la lecture — `npm run check:vocab`.
 *
 * Deux endroits où l'app juge, et un où elle affiche ce que l'IA affirme :
 *
 * 1. LA COMPARAISON DE RÉPONSE (lib/vocabulary/answer-check.ts). Le serveur
 *    s'en sert pour noter une frappe ou un QCM. Trop stricte, elle punit
 *    quelqu'un qui connaît le mot ; trop laxiste, elle valide n'importe
 *    quoi et le SRS espace une carte non sue. Les deux dérives sont testées.
 * 2. LA VÉRIFICATION DES CAS EN LECTURE (lib/reading/verify-cases.ts). Elle
 *    ne doit JAMAIS retirer un tag juste (syncrétisme compris), et doit
 *    retirer un tag que la banque contredit.
 * 3. LES TEXTES ÉCRITS À LA MAIN. Ils ne passent pas par l'IA, donc pas par
 *    la validation : leurs tags sont contrôlés ici, contre le même
 *    dictionnaire.
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });

const A = await jiti.import("../lib/vocabulary/answer-check.ts");
const V = await jiti.import("../lib/reading/verify-cases.ts");
const T = await jiti.import("../lib/reading/texts.ts");
const E = await jiti.import("../lib/vocabulary/explanation.ts");

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

// ─── 1. Comparaison de réponse ─────────────────────────────────────
// À accepter : la réponse est juste, sous une forme ou une autre.
const ACCEPT = [
  ["книга", "книга"],
  ["Книга", "книга"],
  ["  книга  ", "книга"],
  ["книга", "кни́га"],
  ["cafe", "café"],
  ["café", "cafe"],
  ["garcon", "garçon"],
  ["livre", "le livre"],
  ["le livre", "livre"],
  ["auto", "voiture, auto"],
  ["voiture", "voiture, auto"],
  ["dire", "parler / dire"],
  ["aller", "aller (à pied)"],
  ["aller à pied", "aller (à pied)"],
  ["ели", "ёли"],
  ["une maison", "maison"],
];
for (const [given, expected] of ACCEPT) {
  require_(
    A.matchesAnswer(given, expected) === true,
    `« ${given} » devrait être accepté pour « ${expected} »`
  );
}

// À refuser : un mot différent reste un mot différent. C'est le côté qui
// compte le plus — une comparaison trop généreuse fait espacer par le SRS
// une carte que l'apprenant ne sait pas.
const REJECT = [
  ["книгу", "книга"],
  ["стол", "книга"],
  ["", "книга"],
  ["   ", "книга"],
  ["voitur", "voiture"],
  ["livres", "livre"],
  ["chien", "chat"],
  ["le", "le livre"],
  ["a", "aller (à pied)"],
];
for (const [given, expected] of REJECT) {
  require_(
    A.matchesAnswer(given, expected) === false,
    `« ${given} » ne devrait PAS être accepté pour « ${expected} »`
  );
}

// ─── 2. Vérification des cas ───────────────────────────────────────
const w = (ru, caseId) => ({ ru, gloss: "x", case: caseId });

// Un tag juste survit, et ressort marqué comme confirmé.
const good = V.verifyCaseTags([[w("книгу", "accusative")]]);
require_(good.report.confirmed === 1, "« книгу » à l'accusatif devrait être confirmé");
require_(
  good.sentences[0][0].caseStatus === "confirmed",
  "un tag confirmé doit porter caseStatus « confirmed »"
);

// Un tag faux disparaît — mais la glose reste, elle n'est pas en cause.
const bad = V.verifyCaseTags([[w("книгу", "nominative")]]);
require_(bad.report.contradicted === 1, "« книгу » au nominatif devrait être contredit");
require_(bad.sentences[0][0].case === undefined, "un tag contredit doit être retiré");
require_(bad.sentences[0][0].gloss === "x", "la glose doit survivre au retrait du tag");

// Syncrétisme : « книги » est à la fois génitif singulier, nominatif et
// accusatif pluriel. Aucun des trois ne doit être retiré, sinon la
// vérification effacerait des analyses justes.
for (const caseId of ["genitive", "nominative", "accusative"]) {
  const r = V.verifyCaseTags([[w("книги", caseId)]]);
  require_(
    r.report.contradicted === 0,
    `« книги » au ${caseId} est une lecture possible : elle ne doit pas être retirée`
  );
}

// Mot hors banque : invérifiable, donc conservé mais signalé. Le retirer
// viderait la lecture de sa coloration, l'afficher comme confirmé serait
// mentir.
const unknown = V.verifyCaseTags([[w("абракадаброй", "instrumental")]]);
require_(unknown.report.unverified === 1, "un mot hors banque doit être compté comme invérifiable");
require_(
  unknown.sentences[0][0].case === "instrumental",
  "un tag invérifiable doit être conservé"
);
require_(
  unknown.sentences[0][0].caseStatus === "unverified",
  "un tag invérifiable doit porter caseStatus « unverified »"
);

// Ponctuation collée au mot dans le texte : elle ne doit pas faire échouer
// la reconnaissance, sinon la quasi-totalité des fins de phrase deviendrait
// « invérifiable » pour rien.
const punctuated = V.verifyCaseTags([[w("книгу.", "accusative"), w("Книгу,", "accusative")]]);
require_(
  punctuated.report.confirmed === 2,
  `ponctuation et majuscule ne doivent pas empêcher la vérification (${punctuated.report.confirmed}/2)`
);

// Ce qui n'a pas de tag n'est pas touché.
const untagged = V.verifyCaseTags([[{ ru: "и", gloss: "et" }]]);
require_(
  untagged.report.confirmed + untagged.report.contradicted + untagged.report.unverified === 0,
  "un mot sans tag ne doit rien déclencher"
);

require_(V.INDEXED_FORMS > 2000, `index trop maigre : ${V.INDEXED_FORMS} formes`);

// ─── 3. Textes écrits à la main ────────────────────────────────────
let handContradicted = 0;
let handConfirmed = 0;
let handUnverified = 0;
for (const text of T.READING_TEXTS) {
  const r = V.verifyCaseTags(text.sentences);
  handConfirmed += r.report.confirmed;
  handUnverified += r.report.unverified;
  if (r.report.contradicted > 0) {
    handContradicted += r.report.contradicted;
    failures.push(
      `texte « ${text.title} » : ${r.report.contradicted} tag(s) de cas contredits par la banque`
    );
  }
  checks += 1;

  for (const sentence of text.sentences) {
    for (const word of sentence) {
      require_(word.ru.trim().length > 0, `texte « ${text.title} » : mot vide`);
      require_(
        !word.case || word.gloss,
        `texte « ${text.title} » : « ${word.ru} » porte un cas mais aucune glose`
      );
    }
  }
}

// ─── 4. Validation d'une explication ───────────────────────────────
const okExplanation = E.toWordExplanation(
  {
    meaning: "Livre au sens d'ouvrage imprimé, le mot le plus courant.",
    partOfSpeech: "nom féminin",
    register: "courant",
    examples: [{ ru: "Я читаю книгу.", fr: "Je lis un livre." }],
    collocations: ["интересная книга (un livre intéressant)"],
    related: ["учебник — manuel scolaire"],
  },
  "книга"
);
require_(okExplanation !== null, "une explication bien formée doit être acceptée");
require_(okExplanation?.examples.length === 1, "l'exemple employant le mot doit être conservé");

// Un exemple qui n'emploie pas le mot illustre autre chose : il est retiré
// plutôt que montré, sinon l'apprenant mémorise une phrase hors sujet.
const offTopic = E.toWordExplanation(
  {
    meaning: "Livre au sens d'ouvrage imprimé, le mot le plus courant.",
    examples: [
      { ru: "Я читаю книгу.", fr: "Je lis un livre." },
      { ru: "Он идёт домой.", fr: "Il rentre à la maison." },
    ],
  },
  "книга"
);
require_(
  offTopic?.examples.length === 1,
  "un exemple qui n'emploie pas le mot expliqué doit être écarté"
);

require_(E.toWordExplanation({}, "книга") === null, "une explication vide doit être refusée");
require_(E.toWordExplanation(null, "книга") === null, "une réponse non-objet doit être refusée");
require_(
  E.toWordExplanation({ meaning: "court" }, "книга") === null,
  "un sens quasi vide doit être refusé"
);

// ─── Rapport ───────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n✗ ${failures.length} problème(s) sur ${checks} contrôles :\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error("");
  process.exit(1);
}

const total = handConfirmed + handUnverified + handContradicted;
console.log(`✓ ${checks} contrôles passés.`);
console.log(`  index de vérification : ${V.INDEXED_FORMS} formes fléchies distinctes`);
console.log(
  `  textes écrits à la main : ${T.READING_TEXTS.length} textes, ${total} tags de cas ` +
    `(${handConfirmed} confirmés, ${handUnverified} invérifiables, 0 contredit)`
);
