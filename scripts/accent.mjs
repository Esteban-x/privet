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

/**
 * Les mots que le dictionnaire ne peut pas trancher, tranchés à la main.
 *
 * Deux familles : les HOMOGRAPHES, dont seule la phrase décide (« до́ма » à
 * la maison / « дома́ » des maisons), et les FORMES ABSENTES du dictionnaire
 * — participes, gérondifs, et les distracteurs volontairement inexistants
 * que certains QCM proposent.
 *
 * Chaque entrée a été décidée en lisant l'item qui l'emploie. Une entrée
 * ajoutée sans ce travail vaut moins que pas d'entrée du tout.
 */
const OVERRIDES = {
  // Homographes
  "вода": "вода́",
  "дела": "дела́",
  "дома": "до́ма",
  "сестры": "сестры́",
  "еду": "е́ду",
  "большая": "больша́я",
  "воды": "воды́",
  "уже": "уже́",
  "другом": "дру́гом",
  "помочь": "помо́чь",
  "потом": "пото́м",
  "дабы": "да́бы",
  "часа": "часа́",
  "после": "по́сле",
  "мало": "ма́ло",
  "пошли": "пошли́",
  "почту": "по́чту",
  "берегу": "бе́регу",
  "начался": "начался́",
  "окна": "окна́",
  "двери": "две́ри",
  "парка": "па́рка",
  "парку": "па́рку",
  "дороги": "доро́ги",
  "поезда": "по́езда",
  "стоит": "стои́т",
  "году": "году́",
  "письма": "пи́сьма",
  "матери": "ма́тери",
  "пили": "пи́ли",
  // Absents du dictionnaire
  "буду": "бу́ду",
  "французски": "францу́зски",
  "Анна": "А́нна",
  "нашем": "на́шем",
  "просыпаю": "просыпа́ю",
  "проснуть": "просну́ть",
  "читающий": "чита́ющий",
  "читая": "чита́я",
  "написавший": "написа́вший",
  "написанная": "напи́санная",
  "написав": "написа́в",
  "возвращаясь": "возвраща́ясь",
  "построен": "постро́ен",
  "преподанный": "пре́поданный",
  "заканчивая": "зака́нчивая",
  "закончив": "зако́нчив",
  "помогающий": "помога́ющий",
  "помогавший": "помога́вший",
  "помогая": "помога́я",
  "помогаемый": "помога́емый",
  "него": "него́",
  "баклуши": "баклу́ши",
  "кого": "кого́",
  "решены": "решены́",
  "придя": "придя́",
  "готовя": "гото́вя",
  "достоин": "досто́ин",
  "иканье": "и́канье",
  "пришедши": "прише́дши",
  "выключен": "вы́ключен",
  "войдя": "войдя́",
  "ожидая": "ожида́я",
  "слушая": "слу́шая",
  "сделаны": "сде́ланы",
  "открыв": "откры́в",
  "приехав": "прие́хав",
};

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
