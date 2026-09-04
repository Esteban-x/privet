/**
 * Les contrôles d'hygiène du russe affiché, partagés par tous les scripts.
 *
 * Trois défauts se sont glissés dans les banques précisément parce que
 * chaque script vérifiait la grammaire de SON module et personne ne
 * vérifiait la typographie de tous :
 *
 *   « кни́гa »   un `a` LATIN au milieu d'un mot cyrillique. Indiscernable
 *               à l'œil, la réponse est rejetée sans explication possible.
 *   « бор́щ »    l'accent posé sur une consonne. Il ne se voit pas non plus,
 *               et il fausse la translittération, qui lit l'accent pour
 *               décider de la réduction vocalique.
 *   « решал »   un polysyllabe sans accent, alors que la page qui l'entoure
 *               en porte. L'apprenant ne peut pas prononcer ce qu'il lit.
 *
 * Aucun de ces trois n'est une question de grammaire russe : ce sont des
 * invariants de la DONNÉE, vrais dans les huit modules, et c'est pour ça
 * qu'ils vivent ici plutôt que recopiés huit fois.
 */

const VOWELS = "аеёиоуыэюяАЕЁИОУЫЭЮЯ";
const ACCENT = "\u0301";

export const CYRILLIC_WORD = /[а-яёА-ЯЁ][а-яёА-ЯЁ\u0301-]*/g;

export function stripAccent(form) {
  return form.replace(/\u0301/g, "");
}

export function vowelCount(form) {
  return [...stripAccent(form)].filter((c) => VOWELS.includes(c)).length;
}

/** Le ё porte toujours l'accent en russe : il vaut marque d'accent. */
export function carriesStress(form) {
  return form.includes(ACCENT) || form.includes("ё") || form.includes("Ё");
}

/**
 * L'accent doit suivre une VOYELLE. « бор́щ » place la marque après le `р` :
 * le mot paraît accentué, et ne l'est pas.
 */
export function accentOnConsonant(form) {
  for (let i = 0; i < form.length; i++) {
    if (form[i] !== ACCENT) continue;
    if (i === 0 || !VOWELS.includes(form[i - 1])) return true;
  }
  return false;
}

/**
 * Un mot ne peut pas mêler les deux alphabets. On tolère le trait d'union
 * et l'espace : « из-за », « не́сколько раз » restent des chaînes valides.
 */
export function mixedScript(text) {
  const stripped = text.replace(/[\u0301\s\-–—.,!?;:()«»"'…]/g, "");
  return /[а-яёА-ЯЁ]/.test(stripped) && /[A-Za-z]/.test(stripped);
}

/**
 * Passe les trois contrôles sur une chaîne russe et rend la liste des
 * reproches. `where` situe l'erreur pour que le message soit actionnable.
 *
 * `sentence: true` relâche l'exigence d'accent sur les mots outils d'une
 * syllabe et sur la ponctuation : une phrase entière est traitée mot à mot.
 */
export function inspect(text, where, { requireStress = true, sentence = false } = {}) {
  const problems = [];
  if (mixedScript(text)) {
    problems.push(`${where} : « ${text} » mêle cyrillique et latin`);
  }
  if (accentOnConsonant(text)) {
    problems.push(`${where} : « ${text} » porte l'accent sur une consonne`);
  }
  if (!requireStress) return problems;

  const words = sentence ? text.match(CYRILLIC_WORD) ?? [] : [text];
  for (const word of words) {
    if (UNSTRESSED_FUNCTION_WORDS.has(word.toLowerCase())) continue;
    if (vowelCount(word) >= 2 && !carriesStress(word)) {
      problems.push(`${where} : « ${word} » est polysyllabique et non accentué`);
    }
  }
  return problems;
}

/**
 * Les mots outils qu'on n'accentue pas, même polysyllabiques : l'accent y
 * est soit clitique (préposition), soit inutile (le lecteur ne s'y trompe
 * pas). Liste courte et fermée — tout le reste doit porter sa marque.
 */
export const UNSTRESSED_FUNCTION_WORDS = new Set([
  "или", "если", "чтобы", "когда", "потому", "также", "тоже", "уже", "ещё",
  "меня", "тебя", "себя", "него", "неё", "него", "нему", "ними", "него",
  "его", "ему", "она", "оно", "они", "мои", "твои", "свои", "наши", "ваши",
  // Prépositions composées : clitiques, jamais accentuées, et écrites
  // ainsi dans les gabarits — « Кот вы́лез из-под ___. »
  "из-под", "из-за", "по-над",
]);
