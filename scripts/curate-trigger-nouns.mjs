/**
 * Curation des noms utilisables par chaque déclencheur — `npm run curate:triggers`.
 *
 * POURQUOI CE SCRIPT
 *
 * Un exercice de phrase colle un déclencheur et un nom tirés séparément.
 * « Я ем ___ » recevait « помо́щник » : « je mange cet assistant ». La
 * première correction a rangé les 451 noms en classes sémantiques et fait
 * déclarer à chaque déclencheur celles qu'il accepte. Ça marche, mais une
 * classe est trop grossière pour la langue : « sel » est de la nourriture,
 * et « je mange ce sel » ne se dit pas.
 *
 * L'IA, elle, juge chaque couple. On la fait donc travailler ICI, à la
 * construction, et non à l'exécution :
 *
 *   - l'exécution reste déterministe, gratuite, instantanée et testable ;
 *   - le résultat est relu et figé dans le dépôt avant d'atteindre un
 *     apprenant ;
 *   - un appel réseau qui échoue ne peut pas casser un exercice.
 *
 * C'est la même discipline que partout ailleurs dans l'app : l'IA propose,
 * les données figent, le moteur vérifie, le serveur juge. La DÉCLINAISON
 * elle-même ne passe jamais par ici — elle vient du dictionnaire.
 *
 * Les classes sémantiques ne disparaissent pas : elles cessent d'être le
 * mécanisme pour devenir le CONTRÔLE. check:grammar vérifie que les mots
 * retenus par l'IA tombent dans les classes attendues ; un écart signale
 * soit une erreur du modèle, soit une classe mal posée.
 *
 * USAGE
 *   node scripts/curate-trigger-nouns.mjs            # tout, cache réutilisé
 *   node scripts/curate-trigger-nouns.mjs --force    # ignore le cache
 *   node scripts/curate-trigger-nouns.mjs --only=verb-acc-est,prep-acc-v
 */
import Anthropic from "@anthropic-ai/sdk";
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, "scripts", ".cache", "trigger-nouns");
const OUT = path.join(ROOT, "lib", "grammar", "trigger-nouns.generated.ts");

// Le script tourne hors Next : la clé se lit à la main dans .env.local.
for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const { TRIGGERS } = await jiti.import("../lib/grammar/triggers.ts");
const { NOUNS } = await jiti.import("../lib/grammar/nouns-data.ts");

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;

const MODEL = process.env.ANTHROPIC_MODEL_CHAT || "claude-sonnet-5";
const CONCURRENCY = 8;
/** En dessous, le déclencheur n'aurait plus assez de variété pour ne pas se répéter. */
// Certains déclencheurs sont légitimement étroits : la banque ne contient
// que six boissons, donc « un verre de ___ » ne peut pas en retenir plus.
const MIN_KEPT = 5;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const BY_ID = new Map(NOUNS.map((n) => [n.id, n]));

// La liste complète est envoyée à chaque appel, sans pré-filtrage par
// classe : si une classe est mal posée, le modèle doit pouvoir la
// contredire — c'est précisément ce qu'on veut apprendre de lui.
const CATALOGUE = NOUNS.map((n) => `${n.id} | ${n.lemma} | ${n.translation}`).join("\n");

// Le catalogue et la consigne sont IDENTIQUES aux 120 appels : mis en cache
// côté API, ils ne sont facturés et retraités qu'une fois. Sans ça, chaque
// appel repayait 4 000 jetons de contexte, et le débit tombait à un
// déclencheur par minute.
const SYSTEM = `Tu prépares des exercices de russe pour des francophones. On te donnera une phrase à trou, et voici le catalogue de noms communs disponibles. Ta tâche est de dire lesquels peuvent remplir le trou.

CRITÈRE, ET IL EST STRICT : garde un mot seulement si la phrase obtenue est une phrase qu'un russophone dirait vraiment, dans une conversation ordinaire. Pas « grammaticalement possible » : DICIBLE.

Écarte donc :
- l'absurde ("je mange cet assistant") ;
- le techniquement correct mais que personne ne dit ("je mange ce sel", "un morceau de soupe", "j'habite dans ce toit") ;
- le poétique, le métaphorique, l'humoristique — l'apprenant croirait à une tournure courante ;
- ce qui demanderait un contexte particulier pour se tenir.

Garde en revanche tout ce qui est simplement banal, même sans intérêt : la variété du tirage en dépend, et un déclencheur qui ne retient que cinq mots se répétera jusqu'à l'ennui. Ne te limite pas aux meilleurs exemples ni aux plus typiques — vise l'EXHAUSTIVITÉ sur ce qui est dicible. Si le catalogue le permet, une trentaine de mots est un résultat normal ; moins de dix veut presque toujours dire que tu as été trop sévère.

Le trou n'est pas forcément un usage littéral : « un morceau de » va avec du pain comme avec du papier ou de la pierre. Raisonne sur ce qui se dit, pas sur une catégorie de sens.

Réponds UNIQUEMENT par un objet JSON, sans texte autour :
{"ids":["identifiant", "identifiant", ...]}

RÈGLES SUR LES IDENTIFIANTS — deux erreurs coûtent la totalité de la réponse :

1. Un identifiant se recopie TEL QUEL depuis la première colonne. Ne le mets jamais au pluriel ni à un autre cas, même si la phrase le demande : la déclinaison est faite ailleurs, par un moteur de règles. Pour « У меня есть несколько ___ », on attend « kniga », pas « knig ».
2. Si un mot qui conviendrait parfaitement ne figure pas dans le catalogue, ignore-le. N'écris jamais un identifiant que tu n'as pas lu dans la première colonne — ni approché, ni provisoire, ni suffixé. Un catalogue pauvre sur un sujet donne une liste courte, et c'est une réponse correcte.

CATALOGUE (identifiant | russe | français) :
${CATALOGUE}`;

function question(trigger) {
  // Le nombre est indiqué pour le SENS (« plusieurs livres » n'accepte pas
  // les mêmes noms que « un livre »), jamais comme une consigne de forme :
  // dire « au pluriel » poussait le modèle à renvoyer des formes fléchies au
  // lieu des identifiants du catalogue.
  const number = trigger.plural
    ? "La phrase parle de plusieurs exemplaires — juge le sens en conséquence, mais réponds toujours par l'identifiant du catalogue."
    : "";
  return `PHRASE RUSSE : ${trigger.template.ru}
TRADUCTION   : ${trigger.template.fr}
DÉCLENCHEUR  : ${trigger.ru} — ${trigger.meaningFr}
${number}
Quels noms du catalogue conviennent ?`;
}

/**
 * Premier objet JSON complet d'une réponse, par comptage d'accolades.
 *
 * Une expression régulière gloutonne allait du premier « { » au dernier
 * « } » : quand le modèle ajoute une phrase après son JSON puis se reprend,
 * elle avalait tout et le parsage échouait — ce qui déclenchait une reprise,
 * donc un appel payant de plus.
 */
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

async function curate(trigger) {
  const cacheFile = path.join(CACHE_DIR, `${trigger.id}.json`);
  if (!force && fs.existsSync(cacheFile)) {
    return { ...JSON.parse(fs.readFileSync(cacheFile, "utf8")), cached: true };
  }

  // Une reprise : sur 120 appels, un modèle finit toujours par encadrer son
  // JSON de deux phrases d'introduction. Plutôt que de perdre un
  // déclencheur, on redemande une fois.
  let ids = null;
  let truncated = false;
  let lastError = "";
  for (let attempt = 0; attempt < 2 && ids === null; attempt += 1) {
    const msg = await client.messages.create({
      model: MODEL,
      // Le raisonnement étendu est facturé en jetons de SORTIE, et il est
      // actif par défaut sur Sonnet : une réponse de 300 caractères coûtait
      // 767 jetons dont 616 de raisonnement. Sur 120 appels, c'est
      // l'essentiel de la facture — pour une tâche de tri qui n'en a aucun
      // besoin. Désactivé, la même réponse coûte 72 jetons.
      thinking: { type: "disabled" },
      // 3000 laisse passer les déclencheurs très permissifs, qui retiennent
      // parfois près de 300 identifiants. Le plafond reste un garde-fou :
      // sans raisonnement à facturer, une réponse longue coûte peu.
      max_tokens: 3000,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: question(trigger) }],
    });
    truncated = msg.stop_reason === "max_tokens";
    const raw = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    const object = firstJsonObject(raw);
    if (!object) {
      lastError = "aucun objet JSON dans la réponse";
      continue;
    }
    try {
      const parsed = JSON.parse(object);
      ids = Array.isArray(parsed.ids) ? parsed.ids : [];
    } catch (err) {
      lastError = err.message;
    }
  }
  if (ids === null) throw new Error(`réponse illisible (${lastError})`);

  // Le modèle peut inventer un identifiant ou en répéter un : on ne garde
  // que ce qui existe réellement dans la banque.
  const seen = new Set();
  const kept = [];
  const unknown = [];
  for (const id of ids) {
    if (!BY_ID.has(id)) {
      unknown.push(id);
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    kept.push(id);
  }

  const result = { ids: kept, unknown, truncated };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), "utf8");
  return { ...result, cached: false };
}

// ─── Exécution ─────────────────────────────────────────────────────
// Seuls les déclencheurs exigeants ont besoin d'une liste : les permissifs
// acceptent déjà tout le catalogue, et « Меня́ зову́т ___ » tire dans les
// prénoms, pas dans les noms communs.
const targets = TRIGGERS.filter((t) => (only ? only.has(t.id) : Boolean(t.accepts)));
const results = new Map();
const problems = [];
let done = 0;

async function worker(queue) {
  while (queue.length) {
    const trigger = queue.shift();
    try {
      const r = await curate(trigger);
      results.set(trigger.id, r.ids);
      if (r.unknown.length) {
        problems.push(`${trigger.id} : ${r.unknown.length} identifiant(s) inventé(s) — ignorés`);
      }
      if (r.truncated) problems.push(`${trigger.id} : réponse tronquée (max_tokens)`);
      if (r.ids.length < MIN_KEPT) {
        problems.push(`${trigger.id} : seulement ${r.ids.length} mot(s) retenus`);
      }
      done += 1;
      process.stdout.write(
        `\r  ${done}/${targets.length} — ${trigger.id.padEnd(26)} ${String(r.ids.length).padStart(3)} mots${r.cached ? " (cache)" : "      "}`
      );
    } catch (err) {
      problems.push(`${trigger.id} : ${err.message}`);
      done += 1;
    }
  }
}

console.log(`Curation de ${targets.length} déclencheurs (modèle ${MODEL}, ${CONCURRENCY} en parallèle)`);
const queue = [...targets];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log("");

// Une curation partielle (--only) complète le fichier existant plutôt que
// de l'écraser : sinon corriger un déclencheur effacerait les 135 autres.
if (only && fs.existsSync(OUT)) {
  const existing = await jiti.import("../lib/grammar/trigger-nouns.generated.ts");
  for (const [id, ids] of Object.entries(existing.TRIGGER_NOUNS)) {
    if (!results.has(id)) results.set(id, ids);
  }
}

const ordered = TRIGGERS.filter((t) => results.has(t.id));
const body = ordered
  .map((t) => {
    const ids = results.get(t.id);
    const wrapped = ids.map((id) => `"${id}"`).join(", ");
    return `  // ${t.template.fr}\n  "${t.id}": [${wrapped}],`;
  })
  .join("\n");

fs.writeFileSync(
  OUT,
  `// Généré par scripts/curate-trigger-nouns.mjs — ne pas éditer à la main.
//
// Pour chaque déclencheur, les noms de la banque qui donnent une phrase
// qu'un russophone dirait vraiment. Écrit une fois, relu, puis figé : c'est
// de la donnée, pas un appel réseau. Voir l'en-tête du script pour le
// raisonnement, et check:grammar pour ce qui est vérifié dessus.
//
// ${ordered.length} déclencheurs, ${[...results.values()].reduce((s, v) => s + v.length, 0)} couples au total.

export const TRIGGER_NOUNS: Record<string, string[]> = {
${body}
};
`,
  "utf8"
);

const total = [...results.values()].reduce((s, v) => s + v.length, 0);
const sizes = [...results.values()].map((v) => v.length).sort((a, b) => a - b);
console.log(`✓ ${OUT.replace(ROOT + path.sep, "")}`);
console.log(
  `  ${ordered.length} déclencheurs, ${total} couples ` +
    `(médiane ${sizes[Math.floor(sizes.length / 2)]}, min ${sizes[0]}, max ${sizes[sizes.length - 1]})`
);
if (problems.length) {
  console.log(`\n  ${problems.length} point(s) à regarder :`);
  for (const p of problems) console.log(`    ${p}`);
}
