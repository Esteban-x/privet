/**
 * Pose l'accent tonique sur un texte russe, SANS JAMAIS DEVINER.
 *
 * Un accent faux est pire qu'un accent absent : absent, l'apprenant sait
 * qu'il ne sait pas ; faux, il apprend une prononciation erronée avec la
 * même confiance que le reste. Cet outil ne pose donc un accent que
 * lorsqu'une seule lecture est possible, et rend la liste de ce qu'il a
 * refusé de trancher.
 *
 * Trois cas où il s'abstient :
 *
 * 1. LE MOT EST AMBIGU. « за́мок » (château) et « замо́к » (serrure), « до́ма »
 *    (à la maison) et « дома́ » (des maisons), « бо́льшая » et « больша́я ».
 *    Le dictionnaire donne les deux ; seul le contexte tranche, et il faut
 *    un humain.
 * 2. LE MOT EST INCONNU. Participes, gérondifs, mots composés — le
 *    dictionnaire ne les a pas.
 * 3. LE FRAGMENT N'EST PAS UN MOT. Les désinences citées dans une
 *    explication (« -ого, -ому, -ым ») ressemblent à des mots et n'en sont
 *    pas ; les accentuer produirait « -о́го », qui ne veut rien dire.
 */
import { accentuate, canonicalForms, fold, FORM_COLUMNS } from "./dictionary.mjs";
import { vowelCount, carriesStress } from "./cyrillic.mjs";

/**
 * Index « forme repliée -> accentuations possibles ».
 *
 * On garde TOUTES les lectures, pas la première : c'est le nombre de
 * lectures qui dit si le mot est décidable.
 */
export function buildStressIndex(dict) {
  const index = new Map();
  for (const kind of Object.keys(FORM_COLUMNS).concat(["others"])) {
    const rows = dict.of(kind);
    if (!rows) continue;
    for (const row of rows.values()) {
      const columns = FORM_COLUMNS[kind] ?? [];
      for (const raw of [row.accented, ...columns.map((c) => row[c])]) {
        for (const variant of canonicalForms(raw)) {
          const accented = accentuate(variant);
          const key = fold(accented);
          if (!key) continue;
          if (!index.has(key)) index.set(key, new Set());
          index.get(key).add(accented);
        }
      }
    }
  }
  return index;
}

/** Un fragment de désinence cité dans une explication, pas un mot. */
const ENDING_FRAGMENT = /^(ый|ий|ой|ая|яя|ое|ее|ые|ие|ого|его|ому|ему|ым|им|ых|их|ую|юю|ыми|ими|ом|ем|ей|ов|ев|ам|ям|ах|ях|ами|ями|ии|ия|ие|ешь|ишь|ёшь|ут|ют|ат|ят|ся|сь)$/;

/**
 * @returns {{ text: string, placed: number, skipped: {word: string, reason: string}[] }}
 */
export function accentText(text, index, overrides = {}) {
  const skipped = [];
  let placed = 0;

  const out = text.replace(/[а-яёА-ЯЁ][а-яёА-ЯЁ\u0301]*/g, (word, offset) => {
    if (vowelCount(word) < 2 || carriesStress(word)) return word;

    // Une désinence citée est toujours précédée d'un tiret : « -ого ».
    if (offset > 0 && text[offset - 1] === "-" && ENDING_FRAGMENT.test(word.toLowerCase())) {
      return word;
    }

    // Le compteur ne compte que les CHANGEMENTS : une forme qui revient
    // identique n'est pas un accent posé, et un rapport qui annonce
    // « 1 accent posable » à chaque passage sur un fichier déjà traité
    // finit par ne plus rien vouloir dire.
    const keepCase = (form) =>
      word[0] === word[0].toUpperCase() ? form[0].toUpperCase() + form.slice(1) : form;

    const manual = overrides[word] ?? overrides[word.toLowerCase()];
    if (manual) {
      const result = keepCase(manual);
      if (result !== word) placed += 1;
      return result;
    }

    const readings = index.get(fold(word));
    if (!readings) {
      skipped.push({ word, reason: "absent du dictionnaire" });
      return word;
    }
    if (readings.size > 1) {
      skipped.push({ word, reason: `ambigu : ${[...readings].join(" / ")}` });
      return word;
    }
    const only = [...readings][0];
    // Le repli ignore le ё : on ne veut pas le réintroduire ici par
    // surprise, seulement poser l'accent.
    if (fold(only) !== fold(word)) {
      skipped.push({ word, reason: `orthographe différente : ${only}` });
      return word;
    }
    const result = keepCase(only);
    if (result !== word) placed += 1;
    return result;
  });

  return { text: out, placed, skipped };
}
