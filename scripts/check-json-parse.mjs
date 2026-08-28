/**
 * Vérifie parseJsonResponse (lib/ai/client.ts).
 *
 * POURQUOI CETTE FONCTION MÉRITE UN CONTRÔLE. Les sept routes IA en
 * dépendent, et elle échoue SILENCIEUSEMENT : chaque route l'entoure d'un
 * try/catch qui dégrade proprement, donc une régression ne casse rien à
 * l'écran — elle fait juste échouer la fonctionnalité après avoir payé les
 * tokens. C'est précisément ce qui s'était produit sur /api/vocab/suggest,
 * repéré par hasard dans les logs du serveur de développement.
 *
 * Les cas ci-dessous sont ceux qu'un modèle produit réellement malgré un
 * prompt qui demande « UNIQUEMENT un objet JSON ».
 *
 *   node scripts/check-json-parse.mjs
 */
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const jiti = createRequire(import.meta.url)("jiti")(import.meta.url, { alias: { "@": root } });
const { parseJsonResponse } = jiti(path.join(root, "lib/ai/client.ts"));

/** [nom, entrée, sous-ensemble attendu du résultat] */
const CASES = [
  ["JSON nu", '{"ru":"книга","fr":"livre"}', { ru: "книга", fr: "livre" }],
  ["fences ```json", '```json\n{"ru":"книга","fr":"livre"}\n```', { ru: "книга" }],
  // La version précédente ancrait sur ```$ sans avoir coupé le retour à la
  // ligne final : la balise fermante survivait et JSON.parse échouait.
  ["fences nues + newline final", '```\n{"ru":"книга"}\n```\n', { ru: "книга" }],
  ["prose avant", 'Voici la traduction :\n{"ru":"книга","fr":"livre"}', { ru: "книга" }],
  // Le cas observé en production.
  ["prose après", '{"ru":"книга","fr":"livre"}\nJ\'espère que cela convient !', { ru: "книга" }],
  ["deux objets à la suite", '{"ru":"книга"}\n{"ru":"стол"}', { ru: "книга" }],
  // Une accolade DANS une chaîne : c'est ce cas qu'aucune expression
  // régulière ne sait traiter, et la raison de l'automate.
  ["accolade dans une chaîne", '{"fr":"l\'accolade { ouvrante","ru":"скобка"}', { fr: "l'accolade { ouvrante" }],
  ["guillemet échappé", '{"fr":"il a dit \\"bonjour\\"","ru":"привет"}', { fr: 'il a dit "bonjour"' }],
  ["objet imbriqué + prose", 'Réponse : {"a":{"b":[1,2]},"c":"x"} voilà.', { c: "x" }],
];

let failures = 0;

for (const [name, input, expected] of CASES) {
  try {
    const got = parseJsonResponse(input);
    const wrong = Object.entries(expected).filter(([k, v]) => got[k] !== v);
    if (wrong.length) {
      console.error(`✗ ${name} : attendu ${JSON.stringify(expected)}, reçu ${JSON.stringify(got)}`);
      failures += 1;
    }
  } catch (err) {
    console.error(`✗ ${name} : ${err.message}`);
    failures += 1;
  }
}

// Un tableau à la racine reste une valeur JSON valide.
try {
  const arr = parseJsonResponse('[{"ru":"книга"}]');
  if (!Array.isArray(arr) || arr[0]?.ru !== "книга") {
    console.error("✗ tableau racine : résultat inattendu", JSON.stringify(arr));
    failures += 1;
  }
} catch (err) {
  console.error(`✗ tableau racine : ${err.message}`);
  failures += 1;
}

// Réponse tronquée (max_tokens atteint en plein milieu) : doit lever un
// message diagnostiquable, pas un SyntaxError opaque.
try {
  parseJsonResponse('{"ru":"книга","fr":"liv');
  console.error("✗ réponse tronquée : aurait dû lever");
  failures += 1;
} catch (err) {
  if (!err.message.startsWith("Réponse du modèle non parsable")) {
    console.error(`✗ réponse tronquée : message peu clair — ${err.message}`);
    failures += 1;
  }
}

if (failures) {
  console.error(`\n${failures} cas en échec.`);
  process.exitCode = 1;
} else {
  console.log(`parseJsonResponse : ${CASES.length + 2} cas vérifiés, tous conformes.`);
}
