/**
 * Les contextes des modules Aspect, Mouvement et Participes —
 * `npm run curate:contexts`.
 *
 * POURQUOI CE SCRIPT
 *
 * Ces trois modules plafonnaient entre huit et dix-huit items par
 * compétence : un contexte est lié à UNE paire de verbes, et c'est justifié
 * — la phrase française nomme le verbe, sinon l'apprenant ne saurait pas
 * lequel employer. La seule façon d'élargir est donc d'écrire plus de
 * contextes.
 *
 * CE QU'ON DEMANDE, ET CE QU'ON N'EST PAS ALLÉ CHERCHER
 *
 * On ne demande PAS au modèle de créer un contexte de toutes pièces. La
 * réponse d'un exercice d'aspect (« весь ве́чер » → imperfectif) et son
 * explication sont sémantiques : rien ne peut les vérifier mécaniquement, et
 * une réponse fausse ferait compter une faute à quelqu'un qui a raison.
 *
 * On demande des VARIANTES d'un contexte existant : même paire de verbes,
 * même marqueur, autre situation. La réponse, le schéma et l'explication
 * sont hérités du contexte d'origine — écrit et relu à la main —, donc justes
 * par construction. Ce qui change est la seule chose que le modèle sache
 * faire sans risque : la mise en situation.
 *
 * Le marqueur est CONTRÔLÉ : il est extrait des guillemets de l'explication
 * du contexte d'origine (« весь ве́чер », « Ка́ждый день ») et doit se
 * retrouver dans la variante. Sans lui, l'explication héritée parlerait d'un
 * mot absent de la phrase.
 *
 * USAGE
 *   node scripts/curate-contexts.mjs                       # tout, cache réutilisé
 *   node scripts/curate-contexts.mjs --force
 *   node scripts/curate-contexts.mjs --only=aspect-past
 *   node scripts/curate-contexts.mjs --report
 */
import Anthropic from "@anthropic-ai/sdk";
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDictionary } from "./lib/dictionary.mjs";
import { buildStressIndex, accentText } from "./lib/accent-text.mjs";
import { inspect, stripAccent } from "./lib/cyrillic.mjs";
import { ACCENT_OVERRIDES } from "./lib/accent-overrides.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, "scripts", ".cache", "contexts");

for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const aspect = await jiti.import("../lib/aspect/exercises.ts");
const motion = await jiti.import("../lib/motion/exercises.ts");
const participles = await jiti.import("../lib/participles/exercises.ts");

/**
 * Les contextes déjà générés, à ÉCARTER des modèles.
 *
 * Les modules fusionnent le fichier généré dans leurs tableaux au chargement
 * — c'est ce qui les sert à l'apprenant. Sans ce filtre, une seconde passe
 * prendrait pour modèle ses propres variantes : les variantes d'une variante
 * dérivent du contexte relu à la main, et le nombre enfle à chaque passage.
 * Mesuré : cent vingt-cinq variantes pour vingt-deux contextes écrits.
 */
async function generatedIds(module) {
  const file = path.join(ROOT, "lib", module, "contexts.generated.ts");
  if (!fs.existsSync(file)) return new Set();
  const mod = await jiti.import(`../lib/${module}/contexts.generated.ts`);
  const ids = new Set();
  for (const list of Object.values(mod.EXTRA_CONTEXTS ?? {})) {
    for (const c of list) ids.add(c.id);
  }
  return ids;
}
const GENERATED = new Map(
  await Promise.all(
    ["aspect", "motion", "participles"].map(async (m) => [m, await generatedIds(m)])
  )
);
const handWritten = (module, list) => list.filter((c) => !GENERATED.get(module).has(c.id));

/**
 * Les entités que le modèle a le droit de CHANGER, et qu'on vérifie.
 *
 * Le verbe ne peut pas être hérité : le modèle réécrit la phrase française,
 * et il y nomme forcément un verbe. Mesuré à la première passe — « Вчера́ я
 * весь ве́чер ___ пи́сьмо сестре́ » traduit par « j'ai écrit une lettre »,
 * avec la paire « чита́ть » héritée : l'exercice proposait чита́л / прочита́л
 * sous une phrase qui parle d'écrire.
 *
 * Il le DÉCLARE donc, et doit recopier la traduction française de ce verbe
 * dans un champ à part. Les deux doivent concorder : un modèle qui change de
 * verbe en cours de phrase ne peut plus le faire en silence.
 *
 * L'aspect, lui, reste hérité : il dépend du MARQUEUR (« весь ве́чер »,
 * « за два часа́ »), pas du verbe, et le marqueur est conservé mot pour mot.
 */
const { ASPECT_PAIRS: PAIRS } = await jiti.import("../lib/aspect/verbs.ts");
const participleVerbs = await jiti.import("../lib/participles/verbs.ts");

const args = process.argv.slice(2);
const force = args.includes("--force");
const report = args.includes("--report");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;

const MODEL = process.env.ANTHROPIC_MODEL_CHAT || "claude-sonnet-5";
/** Variantes demandées par contexte d'origine. */
const PER_PARENT = 2;
/** Contextes d'origine envoyés dans un même appel. */
const BATCH = 6;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const stressIndex = buildStressIndex(await loadDictionary());

/**
 * Les huit banques traitées.
 *
 * `sentences` nomme les champs russes à réécrire ; `keep` ceux qui sont
 * hérités tels quels — la sémantique de l'exercice. `anchor` dit ce qui doit
 * survivre dans la variante pour que l'explication héritée reste vraie.
 */
const BANKS = [
  {
    id: "aspect-past",
    choose: "pair",
    module: "aspect",
    export: "PAST_CONTEXTS",
    contexts: handWritten("aspect", aspect.PAST_CONTEXTS),
    sentences: ["template"],
    keep: ["schema", "answer", "why", "subject"],
    anchor: "marker",
    say:
      "Aspect au passé. Le marqueur temporel de la phrase impose l'aspect : garde-le mot " +
      "pour mot, et change ce qu'il y a autour. Le verbe reste le même — la traduction " +
      "française le nomme, seul l'aspect est à trouver.",
  },
  {
    id: "aspect-future",
    choose: "pair",
    module: "aspect",
    export: "FUTURE_CONTEXTS",
    contexts: handWritten("aspect", aspect.FUTURE_CONTEXTS),
    sentences: ["template"],
    keep: ["schema", "answer", "why"],
    anchor: "marker",
    say:
      "Les deux futurs. Même marqueur, même verbe, autre situation. La phrase reste au " +
      "futur.",
  },
  {
    id: "aspect-imperative",
    choose: "pair",
    module: "aspect",
    export: "IMPERATIVE_CONTEXTS",
    contexts: handWritten("aspect", aspect.IMPERATIVE_CONTEXTS),
    sentences: ["template"],
    keep: ["answer", "why", "address"],
    anchor: "marker",
    say:
      "Impératif. Garde le même type d'acte (ordre, prière, interdiction) et la même " +
      "personne : si l'original tutoie, la variante tutoie.",
  },
  {
    id: "motion-direction",
    module: "motion",
    export: "DIRECTION_CONTEXTS",
    contexts: handWritten("motion", motion.DIRECTION_CONTEXTS),
    sentences: ["marker"],
    keep: ["schema", "modes", "form", "answer", "why"],
    anchor: "marker",
    say:
      "Verbes de mouvement, unidirectionnel contre multidirectionnel. Le marqueur " +
      "temporel commande, garde-le mot pour mot. Garde aussi la PERSONNE et le TEMPS de " +
      "l'original : le champ « form » n'est pas réécrit, et une phrase à une autre " +
      "personne recevrait une forme fausse. La destination, elle, peut changer.",
  },
  {
    id: "participles-active",
    choose: "verb",
    module: "participles",
    export: "ACTIVE_CONTEXTS",
    contexts: handWritten("participles", participles.ACTIVE_CONTEXTS),
    sentences: ["expanded", "compressed"],
    keep: ["tense", "why"],
    anchor: "head",
    say:
      "Participes actifs. « expanded » porte la relative complète (кото́рый …), " +
      "« compressed » la même phrase avec « ___ » à la place de la relative. Garde le même " +
      "SUJET que l'original — c'est sur lui que le participe s'accorde — et le même verbe.",
  },
  {
    id: "participles-passive",
    choose: "verb",
    module: "participles",
    export: "PASSIVE_CONTEXTS",
    contexts: handWritten("participles", participles.PASSIVE_CONTEXTS),
    sentences: ["expanded", "compressed"],
    keep: ["agreement", "why"],
    anchor: "head",
    say:
      "Participes passifs. Garde le même SUPPORT que l'original (le nom que le participe " +
      "qualifie) : c'est lui qui décide de l'accord, et l'accord n'est pas réécrit.",
  },
  // « participles-short » n'y est PAS, et c'est une décision. Son champ
  // `agreement` dit avec quel nom le participe s'accorde, et ce nom n'est pas
  // repérable dans la phrase : il est tantôt sujet, tantôt objet, tantôt
  // après le trou. Hérité tel quel, il donnait « Он не заме́тил откры́тую
  // окно́ » — un accord féminin sur un neutre, c'est-à-dire une faute
  // enseignée, et rien ne pouvait l'attraper. Les onze contextes écrits à la
  // main restent seuls sur cette compétence.
  {
    id: "participles-gerund",
    choose: "verb",
    module: "participles",
    export: "GERUND_CONTEXTS",
    contexts: handWritten("participles", participles.GERUND_CONTEXTS),
    sentences: ["expanded", "compressed"],
    keep: ["aspect", "why"],
    anchor: null,
    say:
      "Gérondifs. « expanded » porte la subordonnée complète (Когда́ …, Пока́ …), " +
      "« compressed » la même phrase avec « ___ » à la place. Garde le même verbe et le " +
      "même rapport de temps que l'original.",
  },
];

const SYSTEM = `Tu écris des exercices de russe pour des francophones.

On te donne des CONTEXTES existants, écrits et relus à la main. Pour chacun, tu écris ${PER_PARENT} VARIANTES : la même chose enseignée, dans une autre situation.

CE QUI NE CHANGE PAS — et c'est le point :
- le verbe, et l'aspect ou la forme attendue ;
- le marqueur ou le mot-clé que l'explication cite entre guillemets : recopie-le à l'identique, accents compris ;
- la personne, le temps et le sujet, quand l'original les fixe.

CE QUI CHANGE : le lieu, le moment, l'objet, l'entourage. Une variante doit se lire comme une autre scène, pas comme la même phrase avec un synonyme.

RÈGLES :
1. « ___ » apparaît EXACTEMENT une fois dans chaque phrase russe qui en porte un, séparé des mots voisins par une espace.
2. N'ÉCRIS AUCUN ACCENT TONIQUE, SAUF sur le marqueur cité, que tu recopies tel quel. Les accents sont posés ensuite par un dictionnaire.
3. La traduction française est complète, naturelle, et nomme le verbe — c'est elle qui dit à l'apprenant quel verbe employer. Elle ne contient pas de trou.
4. Pas de vocabulaire rare, pas de subordonnée compliquée : une proposition, dix mots au plus.

Réponds UNIQUEMENT par un objet JSON, sans texte autour :
{"variants":[{"parent":"identifiant du contexte d'origine","id":"nouvel identifiant en minuscules-avec-tirets", CHAMPS_RUSSES, "fr":"..."}, ...]}
où CHAMPS_RUSSES reprend exactement les champs russes montrés pour ce contexte.`;

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
 * Ce qui doit survivre dans la variante.
 *
 * « marker » : le fragment russe que l'explication cite entre guillemets.
 * C'est lui qui porte la règle enseignée — « весь ве́чер », « Ка́ждый день ».
 * « head » : le premier mot russe de la phrase d'origine, c'est-à-dire le
 * support du participe, celui qui décide de l'accord.
 */
function anchorsOf(bank, context) {
  if (bank.anchor === "marker") {
    const quoted = [...String(context.why).matchAll(/«\s*([^»]+?)\s*»/g)]
      .map((m) => m[1])
      .filter((m) => /[а-яё]/i.test(m));
    return quoted.length > 0 ? [quoted[0]] : [];
  }
  if (bank.anchor === "head") {
    const first = String(context[bank.sentences[0]]).match(/[а-яёА-ЯЁ][а-яё́]*/);
    return first ? [first[0]] : [];
  }
  return [];
}

/** Le catalogue de verbes d'une banque : identifiant → traduction française. */
function catalogue(bank) {
  if (bank.choose === "pair") {
    return new Map(PAIRS.map((p) => [p.id, p.translation]));
  }
  if (bank.choose === "verb") {
    const list = participleVerbs.PARTICIPLE_VERBS ?? participleVerbs.VERBS ?? [];
    return new Map(list.map((v) => [v.id, v.translation]));
  }
  return new Map();
}

function describe(bank, context) {
  const russian = bank.sentences.map((f) => `  "${f}": ${JSON.stringify(context[f])}`).join("\n");
  const anchors = anchorsOf(bank, context);
  return (
    `- parent "${context.id}" :\n${russian}\n  "fr": ${JSON.stringify(context.fr)}\n` +
    `  ce que l'exercice enseigne : ${context.why}\n` +
    (anchors.length ? `  À CONSERVER MOT POUR MOT : « ${anchors.join(" », « ")} »\n` : "")
  );
}

function question(bank, batch, refused) {
  const verbs = catalogue(bank);
  const verbList = verbs.size
    ? `\nVERBES DISPONIBLES (identifiant = français) : ${[...verbs]
        .map(([id, fr]) => `${id} = ${fr}`)
        .join(", ")}.\nChaque variante déclare le verbe qu'elle emploie dans "${bank.choose}", et recopie sa traduction française dans "verbFr". La phrase française doit nommer CE verbe.\n`
    : "";
  const again = refused?.length
    ? `\n\nDes propositions ont été refusées. Motifs :\n${refused
        .map((r) => `- ${r.id} : ${r.reason}`)
        .join("\n")}\nÉvite ces défauts.`
    : "";
  return `MODULE : ${bank.say}

Champs russes attendus pour chaque variante : ${bank.sentences.map((f) => `"${f}"`).join(", ")}.
${verbList}

CONTEXTES D'ORIGINE :
${batch.map((c) => describe(bank, c)).join("\n")}
Écris ${PER_PARENT} variantes par contexte d'origine, soit ${batch.length * PER_PARENT} au total.${again}`;
}

function judge(bank, raw, parents, taken) {
  const parent = parents.get(raw?.parent);
  if (!parent) return { reason: `parent « ${raw?.parent} » inconnu`, id: raw?.id ?? "?" };

  const proposed = typeof raw?.id === "string" ? raw.id.trim().toLowerCase() : "";
  if (!/^[a-z0-9-]{3,60}$/.test(proposed)) {
    return { reason: "identifiant mal formé", id: proposed || "?" };
  }
  let id = proposed;
  for (let n = 2; taken.has(id); n += 1) {
    id = `${proposed}-${n}`;
    if (n > 12) return { reason: "identifiant impossible à désambiguïser", id: proposed };
  }

  const fr = typeof raw?.fr === "string" ? raw.fr.trim() : "";
  if (!fr || fr.includes("___")) return { reason: "traduction absente ou trouée", id };
  if (fr[0] !== fr[0].toUpperCase()) {
    return { reason: "la traduction ne commence pas par une majuscule", id };
  }
  if (!/[.!?…]["»]?\s*$/.test(fr)) {
    return { reason: "la traduction ne finit pas comme une phrase", id };
  }

  const anchors = anchorsOf(bank, parent);
  const sentences = {};
  for (const field of bank.sentences) {
    const value = typeof raw?.[field] === "string" ? raw[field].trim() : "";
    if (!value) return { reason: `champ « ${field} » vide`, id };
    if (/\s[.!?,]/.test(value) || /\s\s/.test(value)) {
      return { reason: `« ${field} » : espace avant la ponctuation, ou espace double`, id };
    }

    const accented = accentText(value, stressIndex, ACCENT_OVERRIDES);
    if (accented.skipped.length > 0) {
      const first = accented.skipped[0];
      return { reason: `accent indécidable sur « ${first.word} » (${first.reason})`, id };
    }
    const problems = inspect(accented.text, field, { sentence: true });
    if (problems.length > 0) return { reason: problems[0], id };

    // Le trou, là où l'original en a un.
    const wanted = String(parent[field]).split("___").length - 1;
    const got = accented.text.split("___").length - 1;
    if (got !== wanted) {
      return { reason: `« ${field} » : ${got} trou(s) au lieu de ${wanted}`, id };
    }
    if (wanted === 1) {
      const at = accented.text.indexOf("___");
      if (/[а-яё́]/i.test(accented.text[at - 1] ?? " ")) {
        return { reason: `« ${field} » : le trou est collé au mot qui précède`, id };
      }
      if (/[а-яё́]/i.test(accented.text[at + 3] ?? " ")) {
        return { reason: `« ${field} » : le trou est collé au mot qui suit`, id };
      }
    }

    // L'ancre : sans elle, l'explication héritée parle d'un mot absent.
    for (const anchor of anchors) {
      if (!stripAccent(accented.text.toLowerCase()).includes(stripAccent(anchor.toLowerCase()))) {
        return { reason: `« ${anchor} » a disparu de « ${field} »`, id };
      }
    }

    if (stripAccent(accented.text) === stripAccent(String(parent[field]))) {
      return { reason: `« ${field} » recopie l'original`, id };
    }
    sentences[field] = accented.text;
  }

  const context = { id, ...sentences, fr };
  for (const field of bank.keep) {
    if (parent[field] !== undefined) context[field] = parent[field];
  }

  // Le verbe déclaré : il doit exister, et le modèle doit avoir recopié SA
  // traduction. Une variante qui change de verbe en cours de route ne peut
  // plus le faire sans le dire.
  if (bank.choose) {
    const verbs = catalogue(bank);
    const chosen = typeof raw?.[bank.choose] === "string" ? raw[bank.choose].trim() : "";
    if (!verbs.has(chosen)) return { reason: `verbe « ${chosen} » inconnu`, id };
    const declared = typeof raw?.verbFr === "string" ? raw.verbFr.trim().toLowerCase() : "";
    if (declared !== verbs.get(chosen).toLowerCase()) {
      return {
        reason: `« ${chosen} » se traduit « ${verbs.get(chosen)} », pas « ${raw?.verbFr} »`,
        id,
      };
    }
    context[bank.choose] = chosen;
  }

  // Une compression ne PERD pas la phrase. « Пока́ он изуча́л ру́сский язы́к,
  // он пил чай » compressé en « ___, он пил чай » a laissé tomber l'objet :
  // le gérondif remplace « Пока он изучал », pas le reste. La traduction
  // française, elle, le nommait toujours.
  if (sentences.expanded && sentences.compressed) {
    const words = (t) => (stripAccent(t).match(/[а-яё]+/gi) ?? []).length;
    const lost = words(sentences.expanded) - words(sentences.compressed);
    if (lost > 4) {
      return { reason: `la compression perd ${lost} mots, la phrase n'y survit pas`, id };
    }
  }

  // Le SUJET ne change pas. Le module Mouvement porte un champ « form »
  // (present1, pastM, pastPl…) qui n'est pas réécrit : une variante qui
  // passe de « я » à « они́ » recevrait une forme fausse — « Они́ никогда́ не
  // ходи́л ». On exige donc le même pronom sujet que l'original.
  const parentSubject = String(parent[bank.sentences[0]])
    .toLowerCase()
    .replace(/́/g, "")
    .match(/(^|[^а-я])(я|ты|он|она|оно|мы|вы|они)([^а-я]|$)/);
  if (parentSubject) {
    const wanted = parentSubject[2];
    const variantSubject = stripAccent(String(sentences[bank.sentences[0]]).toLowerCase()).match(
      /(^|[^а-я])(я|ты|он|она|оно|мы|вы|они)([^а-я]|$)/
    );
    if (!variantSubject || variantSubject[2] !== wanted) {
      return {
        reason: `le sujet passe de « ${wanted} » à « ${variantSubject?.[2] ?? "aucun"} »`,
        id,
      };
    }
  }

  // Deux champs se LISENT dans la phrase plutôt que de s'hériter : le passé
  // russe s'accorde en genre, et l'impératif change de forme selon qu'on
  // tutoie ou qu'on vouvoie. Une variante qui passe de « я » à « она́ »
  // recevrait sinon le passé masculin — « Она́ гото́вил пи́ццу ».
  const russian = stripAccent(Object.values(sentences).join(" ").toLowerCase());
  const has = (words) => new RegExp(`(^|[^а-я])(${words})([^а-я]|$)`).test(russian);
  if (parent.subject !== undefined || has("она")) {
    if (has("она")) context.subject = "f";
    else if (parent.subject === "f") delete context.subject;
  }
  if (parent.address !== undefined) {
    if (has("ты|тебя|тебе|твой|твоя|твоё|твои")) context.address = "ty";
    else if (has("вы|вас|вам|ваш|ваша|ваше|ваши")) context.address = "vy";
  }

  return { ok: true, id, context, parent: parent.id };
}

async function ask(bank, batch, refused) {
  const msg = await client.messages.create({
    model: MODEL,
    thinking: { type: "disabled" },
    max_tokens: 4000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: question(bank, batch, refused) }],
  });
  const text = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  const object = firstJsonObject(text);
  if (!object) return [];
  try {
    const parsed = JSON.parse(object);
    return Array.isArray(parsed.variants) ? parsed.variants : [];
  } catch {
    return [];
  }
}

async function curate(bank) {
  const cacheFile = path.join(CACHE_DIR, `${bank.id}.json`);
  if (!force && fs.existsSync(cacheFile)) {
    return { ...JSON.parse(fs.readFileSync(cacheFile, "utf8")), cached: true };
  }

  const parents = new Map(bank.contexts.map((c) => [c.id, c]));
  const taken = new Set(bank.contexts.map((c) => c.id));
  const kept = [];
  const refused = [];

  for (let i = 0; i < bank.contexts.length; i += BATCH) {
    const batch = bank.contexts.slice(i, i + BATCH);
    const variants = await ask(bank, batch, refused.slice(-3));
    // Le modèle en rend parfois plus que demandé : on plafonne par contexte
    // d'origine, sinon un parent bavard écrase les autres dans le tirage.
    const perParent = new Map();
    for (const variant of variants) {
      const verdict = judge(bank, variant, parents, taken);
      if (!verdict.ok) {
        refused.push({ id: verdict.id, reason: verdict.reason });
        continue;
      }
      const count = perParent.get(verdict.parent) ?? 0;
      if (count >= PER_PARENT) continue;
      perParent.set(verdict.parent, count + 1);
      taken.add(verdict.id);
      kept.push(verdict.context);
    }
  }

  const result = { contexts: kept, refused };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), "utf8");
  return { ...result, cached: false };
}

// ─── Exécution ─────────────────────────────────────────────────────
const targets = BANKS.filter((b) => (only ? only.has(b.id) : true));

if (report) {
  for (const bank of targets) {
    const file = path.join(CACHE_DIR, `${bank.id}.json`);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`\n### ${bank.id} (${data.contexts.length} nouveaux)`);
    for (const c of data.contexts) {
      for (const field of bank.sentences) console.log(`  ${c[field]}`);
      console.log(`      ${c.fr}`);
    }
    for (const r of data.refused ?? []) console.log(`  ✗ ${r.id} — ${r.reason}`);
  }
  process.exit(0);
}

const problems = [];
let done = 0;
const byModule = new Map();

for (const bank of targets) {
  try {
    const r = await curate(bank);
    if (!byModule.has(bank.module)) byModule.set(bank.module, new Map());
    byModule.get(bank.module).set(bank.export, r.contexts);
    if (r.contexts.length < bank.contexts.length) {
      problems.push(
        `${bank.id} : ${r.contexts.length} variantes pour ${bank.contexts.length} contextes`
      );
    }
    done += 1;
    process.stdout.write(
      `\r  ${done}/${targets.length} — ${bank.id.padEnd(22)} ` +
        `${String(r.contexts.length).padStart(2)} variantes${r.cached ? " (cache)" : "        "}`
    );
  } catch (err) {
    problems.push(`${bank.id} : ${err.message}`);
    done += 1;
  }
}
console.log("");

// Une passe partielle complète les fichiers existants.
for (const bank of BANKS) {
  if (byModule.get(bank.module)?.has(bank.export)) continue;
  const cacheFile = path.join(CACHE_DIR, `${bank.id}.json`);
  if (!fs.existsSync(cacheFile)) continue;
  if (!byModule.has(bank.module)) byModule.set(bank.module, new Map());
  byModule
    .get(bank.module)
    .set(bank.export, JSON.parse(fs.readFileSync(cacheFile, "utf8")).contexts);
}

let total = 0;
for (const [module, banks] of byModule) {
  const out = path.join(ROOT, "lib", module, "contexts.generated.ts");
  const body = [...banks.entries()]
    .map(([name, list]) => {
      total += list.length;
      const lines = list
        .map(
          (c) =>
            "    {\n" +
            Object.entries(c)
              .map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`)
              .join("\n") +
            "\n    },"
        )
        .join("\n");
      return `  ${name}: [\n${lines}\n  ],`;
    })
    .join("\n");
  fs.writeFileSync(
    out,
    `// Généré par scripts/curate-contexts.mjs — ne pas éditer à la main.
//
// Des VARIANTES des contextes écrits à la main : même verbe, même marqueur,
// même règle enseignée, autre situation. La réponse, le schéma et
// l'explication sont hérités du contexte d'origine — donc justes par
// construction. Voir l'en-tête du script pour ce qu'on n'a pas demandé au
// modèle, et pourquoi.

export const EXTRA_CONTEXTS: Record<string, Record<string, unknown>[]> = {
${body}
};
`,
    "utf8"
  );
  console.log(`✓ lib/${module}/contexts.generated.ts`);
}

console.log(`  ${total} variantes`);
if (problems.length) {
  console.log(`\n  ${problems.length} point(s) à regarder :`);
  for (const p of problems) console.log(`    ${p}`);
}
