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
const { transliterate } = await jiti.import("../lib/vocabulary/transliterate.ts");
const { NOUNS } = await jiti.import("../lib/grammar/nouns-data.ts");
const { LEXICON } = await jiti.import("../lib/vocabulary/lexicon.generated.ts");
const { wordKey, sameWord } = await jiti.import("../lib/vocabulary/duplicate.ts");
const { nearMiss } = await jiti.import("../lib/vocabulary/autocomplete.ts");

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

// Le ё écrit е, et l'inverse.
//
// Le russe courant écrit rarement le ё : un texte de lecture dit
// « ребенок » là où la banque a « ребёнок ». Le repli existait — une ligne
// `.replace(/ё/g, "ё")` — mais remplaçait ё par LUI-MÊME, les deux côtés
// étant le même caractère. Elle ne faisait donc rien, et le tag de ces mots
// restait « invérifiable ».
{
  const withoutYo = V.verifyCaseTags([[w("ребенка", "accusative")]]);
  require_(
    withoutYo.report.confirmed === 1,
    `« ребенка » sans ё doit retrouver « ребёнка » dans la banque (${withoutYo.report.confirmed}/1)`
  );
  const withYo = V.verifyCaseTags([[w("ребёнка", "accusative")]]);
  require_(
    withYo.report.confirmed === 1,
    `« ребёнка » avec ё doit rester reconnu (${withYo.report.confirmed}/1)`
  );
}

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

// ─── 5. Translittération ───────────────────────────────────────────
// Elle est CALCULÉE, pas demandée au modèle (lib/vocabulary/transliterate.ts) :
// les mots de la banque et de l'index sortaient sans aucune prononciation
// écrite, puisque seul le chemin IA en produisait une. Une règle qui se
// trompe se trompe sur des milliers de mots à la fois — d'où des témoins
// recopiés à la main, un par difficulté.
const TRANSLIT = [
  // [mot russe accentué, lecture attendue, ce que ce témoin protège]
  ["спаси́бо", "spassiba", "s intervocalique doublé + о atone"],
  ["хорошо́", "kharacho", "deux о atones, х = kh, ш = ch"],
  ["кни́га", "kniga", "cas simple, aucune réduction"],
  ["де́вушка", "dévouchka", "е accentué, у = ou"],
  ["чай", "tchaï", "ч = tch, й après voyelle = ï"],
  ["мужчи́на", "moujtchina", "ж = j"],
  ["ещё", "iechtcho", "е initial mouillé, щ = chtch, ё après chuintante"],
  ["я́блоко", "yablaka", "я initial, deux о atones"],
  ["друзья́", "drouzya", "signe mou : la voyelle suivante se mouille"],
  ["де́ньги", "déngui", "г dur devant и"],
  ["жена́", "jena", "е après chuintante, non mouillé"],
  ["что", "chto", "exception : l'orthographe ment"],
  ["э́то", "èta", "э ouvert, о atone"],
  ["по́езд", "poiezd", "е après voyelle : mouillé"],
  ["стол", "stol", "monosyllabe : l'accent est connu sans être marqué"],
  ["добрый", "dobryï", "accent INCONNU : aucune réduction, о reste о"],
  ["Росси́я", "Rassiya", "majuscule conservée"],
];
for (const [ru, want, why] of TRANSLIT) {
  const got = transliterate(ru);
  require_(got === want, `translittération de « ${ru} » : « ${got} » au lieu de « ${want} » (${why})`);
}

// Rien de latin ne doit ressortir : un champ français n'a pas de
// prononciation à écrire, et le formulaire s'en sert pour ne rien proposer.
require_(transliterate("merci") === "", "un mot latin ne doit pas être translittéré");
require_(transliterate("") === "", "une chaîne vide reste vide");

// Et surtout : la règle rend quelque chose pour CHAQUE mot des deux banques.
// C'est la promesse tenue à l'apprenant — les mots connus sont ceux qui ont
// la meilleure prononciation, pas ceux qui n'en ont aucune.
let silent = 0;
let firstSilent = "";
for (const noun of NOUNS) {
  const out = transliterate(noun.forms.singular[0]);
  if (!out || /[Ѐ-ӿ]/.test(out)) {
    silent += 1;
    if (!firstSilent) firstSilent = noun.lemma;
  }
}
for (const entry of LEXICON) {
  const out = transliterate(entry[0]);
  if (!out || /[Ѐ-ӿ]/.test(out)) {
    silent += 1;
    if (!firstSilent) firstSilent = entry[0];
  }
}
require_(
  silent === 0,
  `${silent} mot(s) des banques sans translittération complète — ex. « ${firstSilent} »`
);

// ─── 4. La clé de doublon ──────────────────────────────────────────
//
// Elle décide si un mot est REFUSÉ à l'ajout. Trop large, elle interdit une
// entrée légitime et l'apprenant ne peut pas noter son mot ; trop étroite,
// elle laisse revenir le doublon qu'on vient de bannir. Les deux dérives
// sont ici.
{
  // Ce qui DOIT se replier : l'accent tonique n'est qu'une aide de lecture,
  // et la banque écrit « кни́га » là où l'apprenant tape « книга ».
  for (const [a, b, why] of [
    ["кни́га", "книга", "accent tonique"],
    ["Книга", "книга", "casse"],
    ["  книга  ", "книга", "espaces autour"],
    ["спаси́бо", "спасибо", "accent tonique"],
  ]) {
    require_(sameWord(a, b), `doublon : « ${a} » et « ${b} » devraient être le même mot (${why})`);
  }

  // Ce qui NE DOIT PAS se replier : ё et й portent du sens. Les confondre
  // interdirait d'avoir « всё » (tout) ET « все » (tous) dans une liste —
  // deux mots que le russe distingue et qu'un apprenant doit apprendre à
  // distinguer. C'est précisément ce que fait `normalizeAnswer`, et c'est
  // pour ça que la clé de doublon ne s'appuie pas dessus.
  for (const [a, b, why] of [
    ["всё", "все", "ё distingue deux mots"],
    ["мой", "мои", "й n'est pas и"],
    ["книга", "стол", "mots sans rapport"],
  ]) {
    require_(!sameWord(a, b), `doublon : « ${a} » et « ${b} » ne sont pas le même mot (${why})`);
  }

  require_(wordKey("   ") === "", "doublon : une saisie vide ne doit produire aucune clé");
  require_(!sameWord("", ""), "doublon : deux vides ne sont pas « le même mot »");
}

// ─── 5. L'orthographe approchante ──────────────────────────────────
//
// LE RISQUE EST LA FAUSSE ALERTE, pas l'oubli. Un formulaire qui souligne
// en rouge un mot correct apprend à ignorer ses avertissements — y compris
// les justes —, et l'index ne connaît qu'une fraction du russe : « absent
// de l'index » ne veut PAS dire « faux ». Ce bloc vérifie donc surtout les
// silences.
{
  // Silence obligatoire : une frappe en cours n'est pas une faute.
  for (const typed of ["кни", "книг", "словар", "мат", "спас", "здра"]) {
    const miss = nearMiss(typed);
    require_(
      miss === null,
      `orthographe : « ${typed} » est le début d'un mot connu, rien ne doit être signalé ` +
        `(proposé : « ${miss?.ru} »)`
    );
  }

  // Silence obligatoire : un mot de l'index, écrit juste, avec ou sans son
  // accent tonique.
  let flaggedCorrect = 0;
  let firstFlagged = null;
  for (const entry of LEXICON) {
    for (const form of [entry[0], entry[0].normalize("NFC").split(String.fromCharCode(0x0301)).join("")]) {
      if (form.includes(" ")) continue;
      if (nearMiss(form) !== null) {
        flaggedCorrect += 1;
        if (!firstFlagged) firstFlagged = form;
      }
    }
  }
  require_(
    flaggedCorrect === 0,
    `orthographe : ${flaggedCorrect} mot(s) JUSTES de l'index sont signalés comme douteux ` +
      `— ex. « ${firstFlagged} ». Un seul suffit à discréditer l'avertissement.`
  );

  // Et ce qu'il doit tout de même attraper : les fautes qu'un francophone
  // fait vraiment, en écrivant ce qu'il entend.
  for (const [typed, expected] of [
    ["спосибо", "спасибо"],
    ["здраствуйте", "здравствуйте"],
  ]) {
    const miss = nearMiss(typed);
    const got = miss ? wordKey(miss.ru) : null;
    require_(
      got === expected,
      `orthographe : « ${typed} » devrait proposer « ${expected} », a proposé « ${got ?? "rien"} »`
    );
  }
}

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
