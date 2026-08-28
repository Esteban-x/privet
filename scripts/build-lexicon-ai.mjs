/**
 * Enrichit l'index d'autocomplétion avec un modèle — À LA CONSTRUCTION,
 * jamais à la frappe.
 *
 * POURQUOI PAS D'IA AU MOMENT DE TAPER. Une complétion doit apparaître en
 * 100 à 200 ms pour donner l'impression de répondre au doigt ; les
 * meilleures visent 50 ms. Un appel de modèle en demande 300 à 800, sans
 * compter la variance — c'est un ordre de grandeur au-dessus du budget, et
 * c'est la raison pour laquelle aucun moteur de recherche ni traducteur ne
 * fait tourner un modèle par frappe. L'usage établi est un index de
 * préfixes en mémoire, dont le contenu est calculé à l'avance.
 *
 * CE QUE LE MODÈLE FAIT DONC : il REMPLIT cet index, une fois, ici. C'est
 * exactement le partage que recommande la littérature sur le sujet — le
 * modèle produit le vocabulaire, la structure de données le sert.
 *
 * LA BANQUE CURÉE RESTE PRIORITAIRE. Ses traductions sont relues à la main
 * et ses accents toniques vérifiés par `npm run check:grammar` ; le modèle
 * ne sert qu'à couvrir ce qu'elle ne contient pas. En cas de doublon, c'est
 * la banque qui gagne — voir la fusion dans build-lexicon.mjs.
 *
 *   npm run build:lexicon:ai            # ~2 000 mots, une fois
 *   npm run build:lexicon:ai -- --dry   # montre le plan et le coût
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const root = process.cwd();
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_0-9]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const dry = process.argv.includes("--dry");
const MODEL = process.env.ANTHROPIC_MODEL_FAST || "claude-haiku-4-5";

/**
 * Le découpage par DOMAINE plutôt que par fréquence brute.
 *
 * Demander « les 2 000 mots les plus fréquents » en vingt fois donne vingt
 * fois les deux cents mêmes mots : un modèle n'a pas de mémoire d'un appel
 * à l'autre. Le domaine, lui, borne naturellement la réponse et rend les
 * lots disjoints — la déduplication finale n'a plus qu'à rattraper les
 * chevauchements de bord.
 */
const DOMAINS = [
  ["verbes du quotidien", "aller, venir, prendre, mettre, dire, voir, savoir…"],
  ["verbes de parole et de pensée", "penser, croire, expliquer, demander, répondre…"],
  ["verbes d'action et de travail", "construire, réparer, acheter, vendre, payer…"],
  ["verbes de mouvement et de position", "s'asseoir, se lever, courir, tomber, rester…"],
  ["verbes d'état et de sentiment", "aimer, détester, espérer, craindre, s'ennuyer…"],
  ["famille et relations", "parents, cousin, voisin, collègue, ami…"],
  ["corps humain et santé", "tête, main, dos, douleur, médecin, pharmacie…"],
  ["nourriture et cuisine", "pain, viande, légume, sucre, casserole…"],
  ["maison et mobilier", "cuisine, chambre, armoire, fenêtre, clé…"],
  ["vêtements et apparence", "manteau, chaussure, chemise, taille, couleur…"],
  ["ville et transports", "rue, quartier, gare, billet, voiture, arrêt…"],
  ["nature, animaux et météo", "forêt, rivière, oiseau, pluie, neige, vent…"],
  ["temps, dates et durées", "semaine, mois, saison, hier, bientôt, siècle…"],
  ["travail, études et métiers", "bureau, salaire, examen, université, ingénieur…"],
  ["administration et argent", "passeport, banque, impôt, facture, contrat…"],
  ["technologie et communication", "ordinateur, téléphone, réseau, courriel, écran…"],
  ["culture, art et loisirs", "livre, musique, tableau, théâtre, sport, jeu…"],
  ["abstractions courantes", "idée, raison, problème, chance, sens, force…"],
  ["adjectifs de qualité et de jugement", "utile, difficile, étrange, sérieux, gratuit…"],
  ["adjectifs de taille, forme et couleur", "large, étroit, rond, profond, clair, foncé…"],
  ["adverbes et mots de liaison courants", "toujours, presque, ensuite, pourtant, surtout…"],
  ["quantités, nombres et mesures", "moitié, plusieurs, kilo, mètre, degré, dizaine…"],
  ["émotions et caractère", "joie, colère, timide, patient, courageux…"],
  ["école et langue", "mot, phrase, règle, faute, dictionnaire, sens…"],
  ["vie sociale et politesse", "merci, pardon, invitation, rendez-vous, cadeau…"],
  ["commerce et objets du quotidien", "magasin, prix, sac, boîte, papier, ciseaux…"],
  ["voyage et hébergement", "valise, hôtel, frontière, carte, séjour…"],
  ["religion, histoire et société", "église, guerre, paix, loi, peuple, siècle…"],
];

const PER_DOMAIN = 75;

function prompt(domain, examples) {
  return `Tu construis un lexique russe-français pour un apprenant francophone.

Domaine : ${domain}. (Exemples du type attendu, à titre indicatif : ${examples})

Donne les ${PER_DOMAIN} mots russes les plus COURANTS de ce domaine — ceux qu'un apprenant rencontre réellement, pas des termes rares ou techniques.

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour :
[{"ru":"...","fr":"...","kind":"n|v|adj|adv"}, ...]

Consignes STRICTES :
- "ru" : la forme du DICTIONNAIRE (nominatif singulier pour un nom, infinitif pour un verbe, masculin singulier pour un adjectif), avec l'accent tonique marqué par un accent aigu combinant Unicode juste après la voyelle accentuée — par exemple "спаси́бо", "рабо́тать", "краси́вый". L'accent est obligatoire sur tout mot de deux syllabes ou plus.
- "fr" : LA traduction la plus courante, aussi courte que possible. Un mot, deux si la langue l'exige. Pas de liste de synonymes, pas de parenthèses explicatives. Pour un verbe, l'infinitif français.
- "kind" : n pour un nom, v pour un verbe, adj pour un adjectif, adv pour un adverbe ou un mot de liaison.
- Un mot par entrée, jamais d'expression de plusieurs mots.
- Pas de doublon à l'intérieur de ta réponse.
- Si tu hésites sur l'accent tonique d'un mot, ÉCARTE ce mot plutôt que de deviner : un accent faux est enseigné à l'apprenant, c'est pire que son absence.`;
}

console.log(`${DOMAINS.length} domaines x ${PER_DOMAIN} mots = ${DOMAINS.length * PER_DOMAIN} demandés.`);
console.log(`Modèle : ${MODEL}. Coût estimé : ~${(DOMAINS.length * 0.012).toFixed(2)} $.`);
if (dry) process.exit(0);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY manquante.");
  process.exit(1);
}

const client = new Anthropic();
const KIND_OK = new Set(["n", "v", "adj", "adv"]);
const rows = new Map();
let failed = 0;

/** Même normalisation que l'index : c'est la clé de déduplication. */
const bare = (w) =>
  w.normalize("NFC").replace(/́/g, "").replace(/ё/g, "е").trim().toLowerCase();

for (const [domain, examples] of DOMAINS) {
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: prompt(domain, examples),
      messages: [{ role: "user", content: "Donne la liste." }],
    });
    const raw = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    // Même tolérance que lib/ai/client.ts : le modèle ajoute parfois une
    // phrase ou des balises autour du JSON.
    const start = raw.search(/\[/);
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("pas de tableau JSON");
    const list = JSON.parse(raw.slice(start, end + 1));

    let kept = 0;
    for (const item of list) {
      const ru = typeof item?.ru === "string" ? item.ru.normalize("NFC").trim() : "";
      const fr = typeof item?.fr === "string" ? item.fr.trim() : "";
      const kind = KIND_OK.has(item?.kind) ? item.kind : "n";
      // Un seul mot, en cyrillique, traduction non vide et courte.
      if (!/^[А-Яа-яЁё́-]+$/.test(ru) || ru.length < 2) continue;
      if (!fr || fr.length > 40 || /[{}[\]]/.test(fr)) continue;
      const key = bare(ru);
      if (!key || rows.has(key)) continue;
      rows.set(key, [ru, fr, kind]);
      kept += 1;
    }
    console.log(`  ${domain} : ${kept} retenus (${list.length} proposés)`);
  } catch (err) {
    failed += 1;
    console.error(`  ÉCHEC ${domain} : ${err.message ?? err}`);
  }
}

const sorted = [...rows.values()].sort((a, b) => a[0].localeCompare(b[0], "ru"));
const out = `// GÉNÉRÉ PAR scripts/build-lexicon-ai.mjs — NE PAS ÉDITER À LA MAIN.
//
// Vocabulaire produit par un modèle À LA CONSTRUCTION, pour élargir
// l'autocomplétion au-delà des banques curées. Il ne sert QU'À la
// complétion : rien ici n'alimente le moteur de déclinaison, qui reste
// nourri exclusivement par lib/grammar/nouns-data.ts.
//
// La banque curée l'emporte en cas de doublon (voir build-lexicon.mjs).

export const AI_LEXICON: readonly (readonly [string, string, string])[] = [
${sorted.map(([w, t, k]) => `  [${JSON.stringify(w)}, ${JSON.stringify(t)}, ${JSON.stringify(k)}],`).join("\n")}
];
`;

fs.writeFileSync(path.join(root, "lib/vocabulary/lexicon-ai.generated.ts"), out, "utf8");
console.log(`\nTerminé : ${sorted.length} mots retenus, ${failed} domaine(s) en échec.`);
console.log("Lance maintenant `npm run build:lexicon` pour fusionner.");
