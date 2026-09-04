/**
 * Les contextes du module « Accord de l'adjectif » — `npm run curate:adjectives`.
 *
 * POURQUOI CE SCRIPT
 *
 * Chaque compétence n'avait que douze contextes, et un contexte fige un
 * couple adjectif + nom : soixante exercices, à vie. Mesuré sur huit mille
 * tirages, l'apprenant voyait douze items distincts par onglet, et le même
 * revenait tous les trois exercices avant la mémoire courte.
 *
 * POURQUOI PAS UNE LISTE ADJECTIF → NOMS COMPATIBLES, qui laisserait chaque
 * contexte varier son nom. Parce que ce module a été extrait du module Cas
 * précisément pour cesser de croiser deux banques : une phrase sur trois
 * était alors impossible (« une règle brillante », « ce gérant bleu »). Et
 * parce que la traduction française devrait alors accorder l'adjectif et le
 * placer du bon côté du nom — la machinerie que lib/grammar/french-article.ts
 * a perdue, pour la même raison. On écrit donc PLUS DE CONTEXTES, ce que le
 * module fait déjà : c'est sa forme, pas sa limite.
 *
 * CE QUE LE MODÈLE ÉCRIT : le cadre de phrase, sa traduction, l'explication,
 * et le couple adjectif + nom qui les porte. Jamais une forme fléchie —
 * l'adjectif est décliné par le moteur de règles et le nom par le
 * dictionnaire, tous deux vérifiés par check:grammar.
 *
 * USAGE
 *   node scripts/curate-adjectives.mjs                  # tout, cache réutilisé
 *   node scripts/curate-adjectives.mjs --force
 *   node scripts/curate-adjectives.mjs --only=plural
 *   node scripts/curate-adjectives.mjs --report         # relire sans appeler
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
const CACHE_DIR = path.join(ROOT, "scripts", ".cache", "adjectives");
const OUT = path.join(ROOT, "lib", "adjectives", "contexts.generated.ts");

for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });
const { ADJECTIVES, getAdjective } = await jiti.import("../lib/grammar/adjectives-data.ts");
const { NOUNS, getNoun } = await jiti.import("../lib/grammar/nouns-data.ts");
const { declineAdjective } = await jiti.import("../lib/grammar/decline-adjective.ts");
const { declineNoun } = await jiti.import("../lib/grammar/decline.ts");
const { validateFrenchSentence, validateSentence, findGovernor } = await jiti.import(
  "../lib/grammar/sentence-guard.ts"
);
const { ADJECTIVE_SKILLS, ADJECTIVE_CONTEXTS } = await jiti.import(
  "../lib/adjectives/exercises.ts"
);

const args = process.argv.slice(2);
const force = args.includes("--force");
const report = args.includes("--report");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",")) : null;

const MODEL = process.env.ANTHROPIC_MODEL_CHAT || "claude-sonnet-5";
const CONCURRENCY = 3;
/** Contextes demandés par appel, et gardés. Trois appels par compétence. */
const ASKED = 12;
const ROUNDS = 3;
const KEPT = 24;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const stressIndex = buildStressIndex(await loadDictionary());

/**
 * Tous les identifiants déjà pris, toutes compétences confondues : ceux
 * écrits à la main, et ceux qu'un passage précédent a laissés en cache. Le
 * contrôle les veut uniques dans le module entier.
 */
const taken = new Set();
for (const skill of ADJECTIVE_SKILLS) {
  for (const c of ADJECTIVE_CONTEXTS[skill.id]) taken.add(c.id);
  // Une compétence qu'on régénère (--force) va perdre ses identifiants : les
  // précharger la forcerait à suffixer inutilement ceux qu'elle réécrit.
  const cached = path.join(CACHE_DIR, `${skill.id}.json`);
  if (!fs.existsSync(cached)) continue;
  if (force && (!only || only.has(skill.id))) continue;
  for (const c of JSON.parse(fs.readFileSync(cached, "utf8")).contexts) taken.add(c.id);
}

/**
 * Ce que chaque compétence exige, et que le contrôle rejouera
 * (scripts/check-adjectives.mjs, section 2). Écrit ici pour que le tri se
 * fasse avant l'écriture, pas après.
 */
const SKILL_RULES = {
  nominative: {
    cases: ["nominative"],
    plural: false,
    stems: ["hard"],
    say:
      "Nominatif singulier, et UNIQUEMENT des adjectifs à radical dur : un radical " +
      "mou ou mixte y ferait apparaître une règle d'orthographe que la compétence " +
      "suivante est chargée d'introduire. Varie les trois genres.",
  },
  spelling: {
    cases: ["nominative", "genitive", "dative", "accusative", "instrumental", "prepositional"],
    plural: null,
    stems: ["mixed", "soft"],
    say:
      "La règle des 7 lettres (jamais ы après г к х ж ч ш щ) et la règle des 5 lettres " +
      "(о devient е après ж ч ш щ non accentués). N'emploie donc que des adjectifs à " +
      "radical mixte ou mou, et choisis des cas où la règle SE VOIT.",
  },
  accusative: {
    cases: ["accusative"],
    plural: false,
    stems: null,
    say:
      "Accusatif singulier. L'intérêt est le contraste animé / inanimé au masculin " +
      "(ви́жу но́вый стол / ви́жу но́вого студе́нта) et le -ую du féminin : varie les trois.",
  },
  oblique: {
    cases: ["genitive", "dative", "instrumental", "prepositional"],
    plural: false,
    stems: null,
    say: "Génitif, datif, instrumental ou prépositionnel, au singulier. Varie les quatre cas et les genres.",
  },
  plural: {
    cases: ["nominative", "genitive", "dative", "accusative", "instrumental", "prepositional"],
    plural: true,
    stems: null,
    say: "Pluriel, où le genre disparaît. Varie les cas.",
  },
};

const SYSTEM = `Tu écris des exercices d'accord de l'adjectif russe, pour des francophones.

Un CONTEXTE est une phrase à trous, écrite autour d'un couple adjectif + nom choisi pour elle. Tu fournis, pour chacun :
- "id"        : un identifiant en minuscules, mots séparés par des tirets, dérivé du couple (ex. "novyy-dom-ulitsa") ;
- "adjective" : l'identifiant d'un adjectif de la liste ci-dessous, recopié TEL QUEL ;
- "noun"      : l'identifiant d'un nom de la liste ci-dessous, recopié TEL QUEL ;
- "case"      : le cas russe, en anglais (nominative, genitive, dative, accusative, instrumental, prepositional) ;
- "plural"    : true ou false ;
- "ru"        : la phrase russe, avec « ___ » à la place de l'adjectif et « {N} » à la place du nom ;
- "fr"        : sa traduction française, COMPLÈTE — ni « ___ » ni « {N} » : c'est elle qui dit à l'apprenant quel adjectif chercher.

Tu n'écris PAS l'explication de la désinence : elle est calculée à partir du couple, du cas et du nombre. Une explication rédigée librement se trompe — « radical mixte en х » pour хоро́ший, dont le radical finit par ш — et une règle fausse enseignée est pire qu'une règle absente.

RÈGLES ABSOLUES — une violation et le contexte est jeté :

1. LE COUPLE DOIT SE DIRE. « une règle brillante », « ce gérant bleu », « un droit cher » sont grammaticalement possibles et ne se disent pas. Choisis des couples qu'un russophone emploierait dans une conversation ordinaire.
2. « ___ » et « {N} » apparaissent EXACTEMENT une fois chacun dans "ru", séparés des mots voisins par une espace.
3. N'ÉCRIS AUCUN ACCENT TONIQUE, et n'écris AUCUNE forme fléchie de l'adjectif ni du nom : « ___ » et « {N} » sont remplacés par un moteur de règles. La phrase autour, elle, est écrite normalement.
4. La traduction française nomme le nom ET l'adjectif, accordés en français. Elle ne contient ni « ___ » ni « {N} ».
STYLE : la langue de tous les jours, une proposition, dix mots au plus. Varie les situations — la maison, la rue, le travail, l'école, la table, le voyage.

Réponds UNIQUEMENT par un objet JSON, sans texte autour :
{"contexts":[{"id":"...","adjective":"...","noun":"...","case":"...","plural":false,"ru":"...","fr":"..."}, ...]}`;

const GENDER_FR = { masculine: "masculin", feminine: "féminin", neuter: "neutre" };
// L'article est écrit avec le nom du cas : « au nominatif », « à
// l'accusatif ». Le composer à la volée demanderait de savoir si le mot
// commence par une voyelle, ce qui est juste une façon compliquée
// d'écrire six chaînes.
const CASE_FR = {
  nominative: "au nominatif",
  genitive: "au génitif",
  dative: "au datif",
  accusative: "à l'accusatif",
  instrumental: "à l'instrumental",
  prepositional: "au prépositionnel",
};
/** Adjectif à radical dur servant de témoin : ce que la désinence serait sans règle. */
const HARD_REFERENCE = getAdjective("novyy");

/** Le radical d'un adjectif : le lemme masculin moins sa désinence. */
function stemOf(adjective) {
  return adjective.lemmaM.replace(/\u0301/g, "").slice(0, -2);
}

function endingOf(adjective, caseId, gender, plural, animacy) {
  const form = declineAdjective(adjective, caseId, gender, plural, animacy).form;
  return form.slice(stemOf(adjective).length);
}

/**
 * La règle d'orthographe qui sépare cette désinence de celle d'un radical
 * dur, s'il y en a une.
 *
 * On COMPARE plutôt qu'on ne devine : la désinence obtenue et celle qu'un
 * adjectif dur aurait au même endroit. Si elles ne diffèrent que par ы → и,
 * c'est la règle des 7 lettres ; par о → е, celle des 5. Si elles diffèrent
 * autrement (-ый / -ой), c'est l'accent qui parle, pas l'orthographe, et il
 * n'y a rien à annoncer.
 */
function spellingNote(adjective, caseId, gender, plural, animacy) {
  const ours = endingOf(adjective, caseId, gender, plural, animacy);
  const hard = endingOf(HARD_REFERENCE, caseId, gender, plural, animacy);
  if (ours === hard || ours.length !== hard.length) return "";
  const letter = stemOf(adjective).slice(-1);
  let rule = null;
  for (let i = 0; i < ours.length; i += 1) {
    if (ours[i] === hard[i]) continue;
    if (hard[i] === "ы" && ours[i] === "и") {
      if (rule && rule !== 7) return "";
      rule = 7;
    } else if (hard[i] === "о" && ours[i] === "е") {
      if (rule && rule !== 5) return "";
      rule = 5;
    } else {
      return "";
    }
  }
  if (rule === 7) {
    return ` Après ${letter}, la règle des 7 lettres interdit ы : -${hard} s'écrit -${ours}.`;
  }
  if (rule === 5) {
    return ` Après ${letter} non accentué, о devient е : -${hard} s'écrit -${ours}.`;
  }
  return "";
}

/**
 * L'explication montrée après la réponse.
 *
 * CALCULÉE, PAS RÉDIGÉE. Demandée au modèle, elle était fausse une fois sur
 * trois — « radical mixte en х » pour хоро́ший, dont le radical finit par ш ;
 * « après к, о devient е » alors que la règle des 5 lettres ne vaut qu'après
 * ж ч ш щ. Une règle fausse enseignée est pire qu'une règle absente, et
 * c'est le genre de faute qu'un relecteur cesse de voir au vingtième
 * contexte. Ici, chaque affirmation vient du moteur de règles.
 */
function explain(adjective, noun, caseId, plural) {
  const ending = endingOf(adjective, caseId, noun.gender, plural, noun.animacy);
  const number = plural ? "pluriel" : "singulier";
  const who = plural
    ? `« ${noun.lemma} » est au pluriel, où le genre disparaît`
    : `« ${noun.lemma} » est ${GENDER_FR[noun.gender]} ${number}`;
  let head = `${who} : ${CASE_FR[caseId]}, l'adjectif prend -${ending}.`;
  if (caseId === "accusative" && !plural && noun.gender === "masculine") {
    head =
      `« ${noun.lemma} » est masculin ${noun.animacy === "animate" ? "animé" : "inanimé"} : ` +
      `à l'accusatif l'adjectif copie le ${noun.animacy === "animate" ? "génitif" : "nominatif"}, ` +
      `d'où -${ending}.`;
  }
  return head + spellingNote(adjective, caseId, noun.gender, plural, noun.animacy);
}

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

function question(skillId, existing, refused) {
  const rules = SKILL_RULES[skillId];
  const skill = ADJECTIVE_SKILLS.find((s) => s.id === skillId);
  const adjectives = ADJECTIVES.filter((a) => !rules.stems || rules.stems.includes(a.stemType))
    .map((a) => `${a.id} = ${a.lemmaM} (${a.translation})`)
    .join(", ");
  // La banque de noms est longue : on l'envoie entière, mise en cache côté
  // API par le prompt système ? Non — elle dépend de la compétence, donc
  // elle voyage dans la question. On la réduit aux noms courants.
  const nouns = NOUNS.slice(0, 220)
    .map((n) => `${n.id} = ${n.lemma} (${n.translation})`)
    .join(", ");
  const already = existing.map((c) => `${c.adjective}+${c.noun}`).join(", ");
  const again = refused?.length
    ? `\n\nDes propositions ont été refusées. Motifs :\n${refused
        .map((r) => `- ${r.id} : ${r.reason}`)
        .join("\n")}\nÉvite ces défauts.`
    : "";

  return `COMPÉTENCE : ${skill.title} — ${skill.summary}

CE QU'ELLE EXIGE : ${rules.say}
Cas autorisés : ${rules.cases.join(", ")}.
${rules.plural === null ? "Singulier ou pluriel, à ton choix." : rules.plural ? "TOUJOURS au pluriel." : "TOUJOURS au singulier."}

ADJECTIFS DISPONIBLES (identifiant = lemme (français)) : ${adjectives}.

NOMS DISPONIBLES (identifiant = lemme (français)) : ${nouns}.

Couples DÉJÀ écrits, à ne pas reprendre : ${already}.

Écris ${ASKED} contextes.${again}`;
}

function judge(skillId, raw, taken, seenPairs) {
  const rules = SKILL_RULES[skillId];
  const proposed = typeof raw?.id === "string" ? raw.id.trim().toLowerCase() : "";
  if (!/^[a-z0-9-]{3,60}$/.test(proposed)) {
    return { reason: "identifiant mal formé", id: proposed || "?" };
  }
  // Les identifiants sont uniques dans TOUT le module, pas seulement dans la
  // compétence : le même couple peut être écrit deux fois, une fois au
  // datif et une fois au pluriel. Plutôt que de jeter un contexte valable
  // pour une collision de nom, on désambiguïse.
  let id = proposed;
  for (let n = 2; taken.has(id); n += 1) {
    id = n === 2 ? `${proposed}-${raw?.case ?? "bis"}` : `${proposed}-${n}`;
    if (n > 12) return { reason: "identifiant impossible à désambiguïser", id: proposed };
  }

  const adjective = getAdjective(raw?.adjective);
  if (!adjective) return { reason: `adjectif « ${raw?.adjective} » inconnu`, id };
  const noun = getNoun(raw?.noun);
  if (!noun) return { reason: `nom « ${raw?.noun} » inconnu`, id };
  if (rules.stems && !rules.stems.includes(adjective.stemType)) {
    return { reason: `radical ${adjective.stemType} interdit sur cette compétence`, id };
  }
  if (!rules.cases.includes(raw?.case)) return { reason: `cas « ${raw?.case} » interdit`, id };
  const plural = raw?.plural === true;
  if (rules.plural !== null && plural !== rules.plural) {
    return { reason: `${plural ? "pluriel" : "singulier"} interdit ici`, id };
  }

  // La clé porte le CAS : le même couple à deux cas différents est un autre
  // exercice, et l'interdire vidait la compétence « pluriel », où les noms
  // pluralisables ne sont pas si nombreux.
  const pair = `${adjective.id}+${noun.id}+${raw.case}`;
  if (seenPairs.has(pair)) return { reason: `couple ${pair} déjà employé`, id };

  const ru = typeof raw?.ru === "string" ? raw.ru.trim() : "";
  const fr = typeof raw?.fr === "string" ? raw.fr.trim() : "";
  if (ru.split("___").length !== 2) return { reason: "il faut un « ___ » et un seul", id };
  if (ru.split("{N}").length !== 2) return { reason: "il faut un « {N} » et un seul", id };
  // Les deux marques sont remplacées par une forme COMPLÈTE, calculée : une
  // désinence recollée derrière (« {N}ом », « ___о́му ») donne « языко́мом ».
  // Le contrôle de longueur passait, la phrase non.
  for (const mark of ["___", "{N}"]) {
    const at = ru.indexOf(mark);
    if (/[а-яёa-ź]/i.test(ru[at - 1] ?? " ")) {
      return { reason: `« ${mark} » est collé au mot qui précède`, id };
    }
    if (/[а-яёa-ź]/i.test(ru[at + mark.length] ?? " ")) {
      return { reason: `« ${mark} » est collé au mot qui suit`, id };
    }
  }
  if (!fr || fr.includes("___") || fr.includes("{N}")) {
    return { reason: "traduction absente ou trouée", id };
  }
  if (fr[0] !== fr[0].toUpperCase()) {
    return { reason: "la traduction ne commence pas par une majuscule", id };
  }
  if (/\s[.!?]/.test(ru) || /\s\s/.test(ru)) {
    return { reason: "espace avant la ponctuation, ou espace double", id };
  }
  if (!/[.!?]["»]?\s*$/.test(fr)) {
    return { reason: "la traduction ne finit pas comme une phrase", id };
  }

  // Les accents, posés par le dictionnaire. « {N} » et « ___ » ne sont pas
  // cyrilliques : ils traversent intacts.
  const accented = accentText(ru, stressIndex, ACCENT_OVERRIDES);
  if (accented.skipped.length > 0) {
    const first = accented.skipped[0];
    return { reason: `accent indécidable sur « ${first.word} » (${first.reason})`, id };
  }
  const problems = inspect(accented.text.replace("{N}", " "), "phrase", { sentence: true });
  if (problems.length > 0) return { reason: problems[0], id };

  // Le garde-fou du module Cas, sur la phrase montée. Il vérifie ce qui
  // GOUVERNE le trou : une préposition qui appelle un autre cas que celui
  // déclaré rend l'exercice faux, et le module n'avait rien pour le voir.
  const assembled = accented.text.replace("{N}", declineNoun(noun, raw.case, plural).accented);
  const guard = validateSentence({ sentence: assembled, targetCase: raw.case, plural });
  if (!guard.ok) return { reason: `garde-fou — ${guard.reason}`, id };

  // Et le prépositionnel, qui ne s'emploie JAMAIS sans préposition : c'est
  // le seul cas russe dans ce cas, et la règle attrape exactement ce que le
  // garde-fou ne voit pas — « На рынке продают ___ я́блоках », où c'est un
  // verbe, pas une préposition, qui gouverne le trou.
  if (raw.case === "prepositional" && !findGovernor(assembled)) {
    return { reason: "prépositionnel sans préposition devant le trou", id };
  }

  // La traduction doit nommer le nom : c'est elle qui dit sur quoi accorder.
  const french = validateFrenchSentence({ sentenceFr: fr, translation: noun.translation });
  if (!french.ok) return { reason: `français — ${french.reason}`, id };

  // L'exercice doit être jouable : quatre formes distinctes du paradigme.
  const correct = declineAdjective(
    adjective,
    raw.case,
    noun.gender,
    plural,
    noun.animacy
  ).accented;
  const variants = new Set();
  for (const c of rules.cases.length > 1 ? rules.cases : SKILL_RULES.plural.cases) {
    variants.add(declineAdjective(adjective, c, noun.gender, plural, noun.animacy).accented);
  }
  for (const g of ["masculine", "feminine", "neuter"]) {
    variants.add(declineAdjective(adjective, raw.case, g, plural, noun.animacy).accented);
  }
  variants.add(declineAdjective(adjective, raw.case, noun.gender, !plural, noun.animacy).accented);
  variants.delete(correct);
  if (variants.size < 3) return { reason: "moins de trois leurres distincts", id };

  // Et la phrase ne doit pas déjà contenir la réponse.
  const bare = accented.text.toLowerCase().replace(/́/g, "").replace(/ё/g, "е");
  if (new RegExp(`(^|[^а-я])${correct.replace(/́/g, "")}([^а-я]|$)`).test(bare)) {
    return { reason: "la phrase contient déjà la réponse", id };
  }
  // Ni le nom : « {N} » le porte déjà.
  const nounForm = declineNoun(noun, raw.case, plural).form.toLowerCase();
  if (new RegExp(`(^|[^а-я])${nounForm}([^а-я]|$)`).test(bare)) {
    return { reason: "la phrase répète le nom du trou", id };
  }

  return {
    ok: true,
    id,
    pair,
    context: {
      id,
      adjective: adjective.id,
      noun: noun.id,
      case: raw.case,
      ...(plural ? { plural: true } : {}),
      ru: accented.text,
      fr,
      why: explain(adjective, noun, raw.case, plural),
    },
  };
}

async function ask(skillId, existing, refused) {
  const msg = await client.messages.create({
    model: MODEL,
    thinking: { type: "disabled" },
    max_tokens: 4000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: question(skillId, existing, refused) }],
  });
  const raw = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  const object = firstJsonObject(raw);
  if (!object) return [];
  try {
    const parsed = JSON.parse(object);
    return Array.isArray(parsed.contexts) ? parsed.contexts : [];
  } catch {
    return [];
  }
}

async function curate(skillId) {
  const cacheFile = path.join(CACHE_DIR, `${skillId}.json`);
  if (!force && fs.existsSync(cacheFile)) {
    return { ...JSON.parse(fs.readFileSync(cacheFile, "utf8")), cached: true };
  }

  const written = ADJECTIVE_CONTEXTS[skillId];
  const seenPairs = new Set(written.map((c) => `${c.adjective}+${c.noun}+${c.case}`));
  const kept = [];
  const refused = [];

  for (let round = 0; round < ROUNDS && kept.length < KEPT; round += 1) {
    const candidates = await ask(
      skillId,
      [...written, ...kept],
      round === 0 ? null : refused.slice(-4)
    );
    for (const candidate of candidates) {
      if (kept.length >= KEPT) break;
      const verdict = judge(skillId, candidate, taken, seenPairs);
      if (verdict.ok) {
        taken.add(verdict.id);
        seenPairs.add(verdict.pair);
        kept.push(verdict.context);
      } else {
        refused.push({ id: verdict.id, reason: verdict.reason });
      }
    }
  }

  const result = { contexts: kept, refused };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), "utf8");
  return { ...result, cached: false };
}

// ─── Exécution ─────────────────────────────────────────────────────
const targets = ADJECTIVE_SKILLS.filter((s) => (only ? only.has(s.id) : true));

if (report) {
  for (const skill of targets) {
    const file = path.join(CACHE_DIR, `${skill.id}.json`);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`\n### ${skill.id} — ${skill.title} (${data.contexts.length} nouveaux)`);
    for (const c of data.contexts) {
      console.log(`  ${c.case}${c.plural ? "/pl" : ""}  ${c.ru}`);
      console.log(`      ${c.fr}`);
      console.log(`      ${c.why}`);
    }
    for (const r of data.refused ?? []) console.log(`  ✗ ${r.id} — ${r.reason}`);
  }
  process.exit(0);
}

const results = new Map();
const problems = [];
let done = 0;

async function worker(queue) {
  while (queue.length) {
    const skill = queue.shift();
    try {
      const r = await curate(skill.id);
      results.set(skill.id, r.contexts);
      if (r.contexts.length < KEPT / 2) {
        problems.push(`${skill.id} : ${r.contexts.length} contexte(s) seulement`);
      }
      done += 1;
      process.stdout.write(
        `\r  ${done}/${targets.length} — ${skill.id.padEnd(12)} ` +
          `${String(r.contexts.length).padStart(2)} contextes${r.cached ? " (cache)" : "        "}`
      );
    } catch (err) {
      problems.push(`${skill.id} : ${err.message}`);
      done += 1;
    }
  }
}

console.log(`Rédaction pour ${targets.length} compétences (modèle ${MODEL})`);
// UNE file partagée : la passer par copie à chaque ouvrier ferait traiter
// chaque compétence autant de fois qu'il y a d'ouvriers.
const queue = [...targets];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log("");

if (only && fs.existsSync(OUT)) {
  const existing = await jiti.import("../lib/adjectives/contexts.generated.ts");
  for (const [id, list] of Object.entries(existing.ADJECTIVE_CONTEXTS_EXTRA)) {
    if (!results.has(id)) results.set(id, list);
  }
}

const body = ADJECTIVE_SKILLS.filter((s) => (results.get(s.id) ?? []).length > 0)
  .map((s) => {
    const lines = results
      .get(s.id)
      .map(
        (c) =>
          `    {\n` +
          `      id: ${JSON.stringify(c.id)},\n` +
          `      adjective: ${JSON.stringify(c.adjective)},\n` +
          `      noun: ${JSON.stringify(c.noun)},\n` +
          `      case: ${JSON.stringify(c.case)},\n` +
          (c.plural ? `      plural: true,\n` : "") +
          `      ru: ${JSON.stringify(c.ru)},\n` +
          `      fr: ${JSON.stringify(c.fr)},\n` +
          `      why: ${JSON.stringify(c.why)},\n` +
          `    },`
      )
      .join("\n");
    return `  ${s.id}: [\n${lines}\n  ],`;
  })
  .join("\n");

const total = [...results.values()].reduce((sum, list) => sum + list.length, 0);
fs.writeFileSync(
  OUT,
  `// Généré par scripts/curate-adjectives.mjs — ne pas éditer à la main.
//
// Les contextes SUPPLÉMENTAIRES de chaque compétence. Les douze premiers de
// chacune restent écrits à la main dans exercises.ts : ils fixent le style
// et servent de référence au modèle.
//
// Un contexte fige un couple adjectif + nom, et c'est voulu — voir l'en-tête
// d'exercises.ts. Il en faut donc BEAUCOUP, pas des viviers à croiser.
//
// ${total} contextes supplémentaires.

import type { AdjectiveContext } from "./exercises";

export const ADJECTIVE_CONTEXTS_EXTRA: Record<string, AdjectiveContext[]> = {
${body}
};
`,
  "utf8"
);

console.log(`✓ ${OUT.replace(ROOT + path.sep, "")}`);
console.log(`  ${total} contextes supplémentaires`);
if (problems.length) {
  console.log(`\n  ${problems.length} point(s) à regarder :`);
  for (const p of problems) console.log(`    ${p}`);
}
