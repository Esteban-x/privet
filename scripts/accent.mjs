/**
 * Pose l'accent tonique sur les chaînes russes d'un fichier de banque.
 *
 *   node scripts/accent.mjs lib/aspect/exercises.ts          # montre
 *   node scripts/accent.mjs lib/aspect/exercises.ts --apply  # écrit
 *
 * POURQUOI UN OUTIL ET PAS UNE PASSE MANUELLE. Les banques comptent
 * plusieurs milliers de formes, et l'accent tonique est l'information la
 * moins devinable pour un francophone : c'est la première chose qu'on
 * oublie en ajoutant du contenu, et la dernière qu'on remarque en relisant.
 * Les contrôles refusent désormais un polysyllabe nu ; cet outil est ce qui
 * rend le refus facile à satisfaire.
 *
 * IL NE DEVINE JAMAIS. Un accent faux est pire qu'un accent absent : absent,
 * l'apprenant sait qu'il ne sait pas ; faux, il apprend une prononciation
 * erronée avec la même confiance que le reste. L'outil ne pose donc un
 * accent que là où le dictionnaire ne donne qu'une lecture, et IMPRIME ce
 * qu'il a refusé de trancher — à toi de compléter OVERRIDES après avoir
 * regardé la phrase.
 */
import fs from "node:fs";
import { loadDictionary } from "./lib/dictionary.mjs";
import { buildStressIndex, accentText } from "./lib/accent-text.mjs";
// La table des homographes est partagée avec scripts/curate-templates.mjs.
import { ACCENT_OVERRIDES as OVERRIDES } from "./lib/accent-overrides.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage : node scripts/accent.mjs <fichier> [--apply]");
  process.exit(1);
}
const apply = process.argv.includes("--apply");

const index = buildStressIndex(await loadDictionary());
const source = fs.readFileSync(file, "utf8");

let placed = 0;
const skipped = new Map();
const STRING = /"((?:[^"\\]|\\.)*)"/g;

const out = source.replace(STRING, (whole, body) => {
  if (!/[а-яёА-ЯЁ]/.test(body)) return whole;
  const r = accentText(body, index, OVERRIDES);
  placed += r.placed;
  for (const s of r.skipped) {
    if (!skipped.has(s.word)) skipped.set(s.word, { reason: s.reason, ctx: body.slice(0, 60) });
  }
  return `"${r.text}"`;
});

if (apply) fs.writeFileSync(file, out, "utf8");
console.log(
  `${file} : ${placed} accents ${apply ? "posés" : "posables"}, ${skipped.size} mots laissés.`
);
for (const [word, info] of skipped) {
  console.log(`   ${word.padEnd(16)} ${info.reason.slice(0, 34).padEnd(36)} | ${info.ctx}`);
}
if (skipped.size && !apply) {
  console.log(
    "\nComplète OVERRIDES dans ce fichier après avoir lu la phrase de chaque mot."
  );
}
