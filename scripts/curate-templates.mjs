/**
 * La banque de phrases de chaque déclencheur — `npm run curate:templates`.
 *
 * POURQUOI CE SCRIPT
 *
 * Il y avait UNE phrase par déclencheur. Le mode « Phrase » servait
 * `template.ru` tel quel, si bien que le nombre de phrases qu'un apprenant
 * pouvait voir sur une page valait le nombre de déclencheurs du cas : cinq
 * au nominatif, vingt à l'instrumental. Sur cinquante exercices, une phrase
 * du nominatif revenait seize fois.
 *
 * Le module avait bien un second chemin — une phrase rédigée à l'exécution
 * par l'IA — mais il coûtait un appel réseau par exercice, n'était pas
 * disponible sur le plan gratuit, et laissait passer du français que
 * personne ne relisait (« Je m'occupe de travail »). On écrit donc les
 * phrases ICI, à la construction : validées par le garde-fou, relues, figées.
 * C'est la discipline de curate-trigger-nouns.mjs, appliquée aux phrases.
 *
 * CE QUE LE MODÈLE N'A PAS LE DROIT DE FAIRE
 *
 * - remplir le trou français : il écrit un GABARIT, et c'est
 *   frenchNounPhrase qui posera l'article, en accord avec le mode déclaré
 *   par le déclencheur. C'est ce qui règle « Je m'occupe de travail » ;
 * - poser les accents : ils sont posés ensuite par le dictionnaire, et une
 *   phrase contenant un mot que le dictionnaire ne sait pas trancher est
 *   JETÉE plutôt qu'accentuée au jugé. Un accent faux est pire qu'absent ;
 * - changer le mot qui gouverne le trou : le garde-fou le vérifie, et une
 *   phrase qui appelle un autre cas est une faute enseignée.
 *
 * USAGE
 *   node scripts/curate-templates.mjs                     # tout, cache réutilisé
 *   node scripts/curate-templates.mjs --force             # ignore le cache
 *   node scripts/curate-templates.mjs --only=prep-gen-u   # un déclencheur
 *   node scripts/curate-templates.mjs --report            # ne rien appeler, relire
 */
import Anthropic from "@anthropic-ai/sdk";
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDictionary } from "./lib/dictionary.mjs";
import { buildStressIndex, accentText } from "./lib/accent-text.mjs";
import { inspect } from "./lib/cyrillic.mjs";
import { ACCENT_OVERRIDES } from "./lib/accent-overrides.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, "scripts", ".cache", "templates");
const OUT = path.join(ROOT, "lib", "grammar", "trigger-templates.generated.ts");

// Le script tourne hors Next : la clé se lit à la main dans .env.local.
for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const { TRIGGERS, PROPER_NOUN_TRIGGER_ID, triggerNumber } = await jiti.import(
  "../lib/grammar/triggers.ts"
);
const { NOUNS } = await jiti.import("../lib/grammar/nouns-data.ts");
const { poolFor } = await jiti.import("../lib/grammar/exercise-generator.ts");
const { declineNoun } = await jiti.import("../lib/grammar/decline.ts");
const { validateSentence, validateFrenchTemplate } = await jiti.import(
  "../lib/grammar/sentence-guard.ts"
);
const { CASES } = await jiti.import("../lib/grammar/cases.ts");

const args = process.argv.slice(2);
const force = args.includes("--force");
const report = args.includes("--report");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;

const MODEL = process.env.ANTHROPIC_MODEL_CHAT || "claude-sonnet-5";
const CONCURRENCY = 6;
/** Phrases demandées au modèle. On en garde cinq : la marge paie le tri. */
const ASKED = 8;
const KEPT = 5;
/** En dessous, le déclencheur reste trop pauvre : on redemande une fois. */
const MIN_KEPT = 3;
/** Noms montrés au modèle pour qu'il sache ce qui remplira le trou. */
const SAMPLE = 14;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const stressIndex = buildStressIndex(await loadDictionary());

const CASE_LABEL = Object.fromEntries(CASES.map((c) => [c.id, c.title ?? c.id]));

const NUMBER_RULE = {
  singular: "La phrase doit rester au SINGULIER : le trou reçoit un seul objet.",
  plural: "La phrase doit rester au PLURIEL : le trou reçoit plusieurs objets.",
  both:
    "La phrase doit tenir au singulier COMME au pluriel, sans rien y changer : " +
    "n'écris donc aucune épithète devant le trou, elle imposerait un nombre.",
};

const ARTICLE_RULE = {
  none:
    "Dans le gabarit français, le trou ne prend AUCUN déterminant : il doit suivre " +
    "« de », « des », « comme » ou « devenir » (« un morceau de ___ », « il travaille comme ___ »).",
  indefinite:
    "Dans le gabarit français, « un » / « une » / « des » sera posé AUTOMATIQUEMENT devant " +
    "le trou : ne l'écris surtout pas toi-même. « C'est ___. » — jamais « C'est un ___. », " +
    "qui donnerait « C'est un un livre ».",
  demonstrative:
    "Dans le gabarit français, « ce » / « cette » / « ces » sera posé AUTOMATIQUEMENT devant " +
    "le trou : ne l'écris surtout pas toi-même. « Je regarde ___. » — jamais « Je regarde le " +
    "___. ». Le trou ne peut donc pas suivre « comme » ni « devenir », qui refusent le " +
    "démonstratif. « de » et « à » restent possibles : « la voiture de ___ » donnera « la " +
    "voiture de ce directeur ».",
};

const SYSTEM = `Tu écris des phrases d'exercice pour des francophones qui apprennent le russe.

On te donne un DÉCLENCHEUR — une préposition, un verbe à régime ou une expression qui impose un cas — et la phrase de référence qui l'illustre déjà. Tu en écris d'autres, du même genre, pour que l'apprenant ne revoie pas la même page à chaque exercice.

CHAQUE PHRASE EST UNE PAIRE :
- "ru" : la phrase russe, avec « ___ » à la place du mot à décliner ;
- "fr" : sa traduction française, AVEC LE MÊME TROU. C'est un gabarit, pas une phrase remplie : n'écris jamais de mot ni de déterminant à la place du « ___ ».

RÈGLES ABSOLUES — une seule violation et la phrase est jetée :

1. LE MOT QUI GOUVERNE LE TROU NE CHANGE PAS. Si la référence dit « Я говорю́ о ___ », toutes tes phrases disent « о ___ ». Si la référence est bâtie sur un verbe, toutes tes phrases emploient CE verbe (conjugué comme tu veux : personne, temps, aspect).
2. UN SEUL « ___ » par phrase, du côté russe comme du côté français. Il est séparé des mots voisins par une espace, jamais collé à une désinence.
3. N'ÉCRIS AUCUN ACCENT TONIQUE. Écris le russe nu ; les accents sont posés ensuite par un dictionnaire.
4. RIEN NE DOIT PRÉCÉDER LE TROU RUSSE QUI EN IMPOSE LE NOMBRE : pas d'adjectif, pas de démonstratif juste avant « ___ ».
5. LA PHRASE NE CONTIENT PAS le mot qui remplira le trou, ni aucune de ses formes : l'exercice donnerait sa propre réponse.
6. LE FRANÇAIS EST UNE VRAIE PHRASE, avec un verbe conjugué, et finit par un point, un point d'interrogation ou un point d'exclamation.

STYLE : la langue de tous les jours, une proposition, huit mots au plus. Varie les personnes, les temps, les lieux, les moments — c'est le but. Reste au niveau d'un débutant : pas de tournure littéraire, pas de subordonnée compliquée, pas de vocabulaire rare. Vouvoie ou tutoie librement.

Réponds UNIQUEMENT par un objet JSON, sans texte autour :
{"phrases":[{"ru":"...","fr":"..."}, ...]}`;

/**
 * « Меня зовут ___ » reçoit un PRÉNOM, et la banque en compte des masculins
 * comme des féminins. Une phrase qui nomme la personne — « mon frère
 * s'appelle ___ » — a donc une chance sur deux de produire « mon frère
 * s'appelle Anna ». Le garde-fou ne peut pas le voir : le nominatif d'un
 * prénom est le prénom.
 */
const EXTRA_RULES = {
  // « Меня зовут ___ » reçoit un PRÉNOM, et la banque en compte des
  // masculins comme des féminins. Une phrase qui nomme la personne — « mon
  // frère s'appelle ___ » — a donc une chance sur deux de produire « mon
  // frère s'appelle Anna ». Le garde-fou ne peut pas le voir : le nominatif
  // d'un prénom est le prénom.
  [PROPER_NOUN_TRIGGER_ID]:
    "ATTENTION : le trou reçoit un PRÉNOM russe, masculin ou féminin " +
    "indifféremment, et la phrase ne doit donc rien dire du genre de la personne. " +
    "GARDE « меня зовут » dans TOUTES tes phrases : ne change que ce qu'il y a " +
    "autour — une salutation, une suite de présentation, une question en retour. " +
    "Pas de « его зовут », pas de « её зовут », pas de « моего брата зовут ».",
  // Deux passes de suite ont rendu « Он построил вроде ___ » : la
  // préposition ne se dit pas sans tête nominale, et rien de mécanique ne
  // peut l'attraper. On le dit donc au modèle.
  "prep-gen-vrode":
    "ATTENTION : « вроде » + génitif ne se dit jamais seul. Il lui faut une tête " +
    "nominale devant : « что-то вроде ___ », « нечто вроде ___ ». Garde-la dans " +
    "TOUTES tes phrases — « Он построил вроде ___ » ne se dit pas.",
};

function sampleNouns(trigger) {
  const pool = poolFor(trigger, NOUNS);
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, SAMPLE);
}

function question(trigger, rejected) {
  const number = triggerNumber(trigger);
  const nouns = sampleNouns(trigger)
    .map((n) => `${n.lemma} (${n.translation})`)
    .join(", ");
  const again = rejected?.length
    ? `\n\nUne première tentative a été refusée. Motifs :\n${rejected
        .map((r) => `- « ${r.ru} » : ${r.reason}`)
        .join("\n")}\nÉvite ces défauts.`
    : "";
  return `DÉCLENCHEUR  : ${trigger.ru} — ${trigger.meaningFr}
CAS DEMANDÉ  : ${CASE_LABEL[trigger.caseId] ?? trigger.caseId}
RÉFÉRENCE RU : ${trigger.template.ru}
RÉFÉRENCE FR : ${trigger.template.fr}

${NUMBER_RULE[number]}
${ARTICLE_RULE[trigger.article]}

Le trou recevra l'un de ces noms (échantillon) : ${nouns}.
${EXTRA_RULES[trigger.id] ? `
${EXTRA_RULES[trigger.id]}
` : ""}
Écris ${ASKED} phrases DIFFÉRENTES de la référence et entre elles.${again}`;
}

/** Premier objet JSON complet d'une réponse, par comptage d'accolades. */
function firstJsonObject(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const c = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === "\\") {
      escaped = true;
      continue;
    }
    if (c === '"') inString = !inString;
    if (inString) continue;
    if (c === "{") depth += 1;
    if (c === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Toutes les formes des noms que ce déclencheur peut servir : une phrase qui
 * en contient une donnerait sa propre réponse.
 *
 * Calculé une fois par déclencheur — douze formes par nom, quelques
 * centaines de noms : c'est le contrôle le plus cher du lot, et il attrape
 * ce qu'aucun relecteur ne verrait (« Я ем суп с ___ » servi avec « суп »).
 */
function answerForms(trigger) {
  const forms = new Set();
  for (const noun of poolFor(trigger, NOUNS)) {
    for (const c of CASES) {
      for (const plural of [false, true]) {
        const r = declineNoun(noun, c.id, plural);
        forms.add(r.form.toLowerCase().replace(/́/g, "").replace(/ё/g, "е"));
      }
    }
  }
  return forms;
}

/**
 * Le tri. Une phrase n'entre dans la banque que si elle passe TOUT : c'est
 * ce qui permet de la figer sans la relire mot à mot — la relecture porte
 * alors sur le naturel, pas sur la justesse.
 */
function judge(trigger, candidate, taken, forms) {
  const ru = typeof candidate?.ru === "string" ? candidate.ru.trim() : "";
  const fr = typeof candidate?.fr === "string" ? candidate.fr.trim() : "";
  if (!ru || !fr) return { reason: "phrase vide", ru };

  // 1. Les accents, posés par le dictionnaire. Un mot qu'il ne sait pas
  //    trancher fait jeter la phrase : on n'accentue pas au jugé.
  //
  //    La table des homographes (partagée avec scripts/accent.mjs) tranche
  //    ce que le dictionnaire ne peut pas — « по́сле », « до́ма ». Elle le
  //    fait HORS CONTEXTE : les mots qu'elle a servis sont donc reportés
  //    avec la phrase, pour que la relecture les regarde en premier.
  const accented = accentText(ru, stressIndex, ACCENT_OVERRIDES);
  if (accented.skipped.length > 0) {
    const first = accented.skipped[0];
    return { reason: `accent indécidable sur « ${first.word} » (${first.reason})`, ru };
  }
  const sentence = accented.text;
  const homographs = (ru.match(/[а-яё]+/gi) ?? []).filter(
    (w) => ACCENT_OVERRIDES[w] ?? ACCENT_OVERRIDES[w.toLowerCase()]
  );

  // 2. L'hygiène typographique, la même que pour les huit banques.
  const problems = inspect(sentence, "phrase", { sentence: true });
  if (problems.length > 0) return { reason: problems[0], ru: sentence };

  // 3. Le garde-fou, à chaque nombre que le déclencheur déclare.
  const declared = triggerNumber(trigger);
  for (const plural of declared === "both" ? [false, true] : [declared === "plural"]) {
    const verdict = validateSentence({
      sentence,
      targetCase: trigger.caseId,
      plural,
      trigger,
    });
    if (!verdict.ok) return { reason: verdict.reason, ru: sentence };
  }

  // 4. Le gabarit français.
  const french = validateFrenchTemplate({ templateFr: fr, article: trigger.article });
  if (!french.ok) return { reason: `français — ${french.reason}`, ru: sentence };

  // 5. La phrase ne donne pas sa réponse.
  const bare = sentence.toLowerCase().replace(/́/g, "").replace(/ё/g, "е");
  for (const word of bare.match(/[а-я]+/g) ?? []) {
    if (forms.has(word)) return { reason: `« ${word} » est une réponse possible`, ru: sentence };
  }

  // 6. Pas deux fois la même phrase.
  const key = bare.replace(/\s+/g, " ");
  if (taken.has(key)) return { reason: "phrase déjà retenue", ru: sentence };

  return { ok: true, key, homographs, template: { ru: sentence, fr } };
}

async function ask(trigger, rejected) {
  const msg = await client.messages.create({
    model: MODEL,
    thinking: { type: "disabled" },
    max_tokens: 2000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: question(trigger, rejected) }],
  });
  const raw = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  const object = firstJsonObject(raw);
  if (!object) return [];
  try {
    const parsed = JSON.parse(object);
    return Array.isArray(parsed.phrases) ? parsed.phrases : [];
  } catch {
    return [];
  }
}

async function curate(trigger) {
  const cacheFile = path.join(CACHE_DIR, `${trigger.id}.json`);
  if (!force && fs.existsSync(cacheFile)) {
    return { ...JSON.parse(fs.readFileSync(cacheFile, "utf8")), cached: true };
  }

  const forms = answerForms(trigger);
  // La référence occupe déjà sa place : une phrase générée qui la répète
  // n'ajoute rien.
  const taken = new Set([
    trigger.template.ru.toLowerCase().replace(/́/g, "").replace(/ё/g, "е").replace(/\s+/g, " "),
  ]);
  const kept = [];
  const refused = [];
  const homographs = [];

  // Deux passes au plus : la seconde reçoit les motifs de refus de la
  // première, ce qui suffit presque toujours à corriger le tir.
  for (let attempt = 0; attempt < 2 && kept.length < MIN_KEPT; attempt += 1) {
    const candidates = await ask(trigger, attempt === 0 ? null : refused.slice(0, 4));
    for (const candidate of candidates) {
      if (kept.length >= KEPT) break;
      const verdict = judge(trigger, candidate, taken, forms);
      if (verdict.ok) {
        taken.add(verdict.key);
        kept.push(verdict.template);
        if (verdict.homographs.length > 0) {
          homographs.push({ ru: verdict.template.ru, words: verdict.homographs });
        }
      } else {
        refused.push({ ru: verdict.ru, reason: verdict.reason });
      }
    }
  }

  const result = { templates: kept, refused, homographs };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), "utf8");
  return { ...result, cached: false };
}

// ─── Exécution ─────────────────────────────────────────────────────
// Tous les déclencheurs, « Меня зовут ___ » compris. Il avait d'abord été
// écarté — il tire dans les prénoms, pas dans les noms communs — et le
// contrôle de variété a montré ce que ça coûtait : c'est un déclencheur sur
// cinq au nominatif, et sa phrase unique sortait dix fois sur cinquante.
const targets = TRIGGERS.filter((t) => (only ? only.has(t.id) : true));

const results = new Map();
const problems = [];
let done = 0;

if (report) {
  // Relecture : on ne rappelle personne, on relit ce qui est en cache.
  for (const trigger of targets) {
    const file = path.join(CACHE_DIR, `${trigger.id}.json`);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`\n### ${trigger.id} — ${trigger.ru} (${trigger.tier})`);
    console.log(`    · ${trigger.template.ru}   |   ${trigger.template.fr}`);
    for (const t of data.templates) console.log(`      ${t.ru}   |   ${t.fr}`);
    for (const h of data.homographs ?? []) {
      console.log(`      ⚠ homographe tranché hors contexte : ${h.words.join(", ")} — ${h.ru}`);
    }
    for (const r of data.refused ?? []) console.log(`      ✗ ${r.ru} — ${r.reason}`);
  }
  process.exit(0);
}

async function worker(queue) {
  while (queue.length) {
    const trigger = queue.shift();
    try {
      const r = await curate(trigger);
      results.set(trigger.id, r.templates);
      if (r.templates.length < MIN_KEPT) {
        problems.push(
          `${trigger.id} : ${r.templates.length} phrase(s) retenue(s)` +
            `${r.refused?.[0] ? ` — ex. ${r.refused[0].reason}` : ""}`
        );
      }
      done += 1;
      process.stdout.write(
        `\r  ${done}/${targets.length} — ${trigger.id.padEnd(28)} ` +
          `${String(r.templates.length).padStart(2)} phrases${r.cached ? " (cache)" : "       "}`
      );
    } catch (err) {
      problems.push(`${trigger.id} : ${err.message}`);
      done += 1;
    }
  }
}

console.log(`Rédaction pour ${targets.length} déclencheurs (modèle ${MODEL}, ${CONCURRENCY} en parallèle)`);
const queue = [...targets];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log("");

// Une passe partielle (--only) complète le fichier existant plutôt que de
// l'écraser : sinon corriger un déclencheur effacerait les 134 autres.
if (only && fs.existsSync(OUT)) {
  const existing = await jiti.import("../lib/grammar/trigger-templates.generated.ts");
  for (const [id, list] of Object.entries(existing.TRIGGER_TEMPLATES)) {
    if (!results.has(id)) results.set(id, list);
  }
}

const ordered = TRIGGERS.filter((t) => (results.get(t.id) ?? []).length > 0);
const body = ordered
  .map((t) => {
    const lines = results
      .get(t.id)
      .map((tpl) => `    { ru: ${JSON.stringify(tpl.ru)}, fr: ${JSON.stringify(tpl.fr)} },`)
      .join("\n");
    return `  // ${t.ru} — ${t.template.ru}\n  "${t.id}": [\n${lines}\n  ],`;
  })
  .join("\n");

const total = ordered.reduce((s, t) => s + results.get(t.id).length, 0);
fs.writeFileSync(
  OUT,
  `// Généré par scripts/curate-templates.mjs — ne pas éditer à la main.
//
// Les phrases SUPPLÉMENTAIRES de chaque déclencheur. La première phrase,
// celle qui sert de référence de style, reste écrite à la main dans
// triggers.ts : elle a été relue une par une et c'est elle qu'on montre au
// modèle pour lui dire ce qu'on attend.
//
// Pourquoi ici et pas à l'exécution : une phrase écrite à la construction
// est validée par le garde-fou, relue, puis figée. Une phrase écrite à
// l'exécution ne peut être que l'un ou l'autre, et coûte un appel réseau par
// exercice. Voir l'en-tête du script.
//
// ${ordered.length} déclencheurs, ${total} phrases supplémentaires.

export const TRIGGER_TEMPLATES: Record<string, { ru: string; fr: string }[]> = {
${body}
};
`,
  "utf8"
);

console.log(`✓ ${OUT.replace(ROOT + path.sep, "")}`);
console.log(`  ${ordered.length} déclencheurs, ${total} phrases supplémentaires`);
if (problems.length) {
  console.log(`\n  ${problems.length} point(s) à regarder :`);
  for (const p of problems) console.log(`    ${p}`);
}
