/**
 * Le filtre qui confronte chaque entrée du lexique au dictionnaire.
 *
 * CE QU'IL RÉPARE. L'index d'autocomplétion contenait 281 mots qui
 * n'existent dans aucun dictionnaire — « абва́к » donné pour « alphabet »,
 * « буста́льтер » pour « soutien-gorge », « враниль » pour « nuit » — et 538
 * accents toniques faux : « аптека́ » au lieu d'« апте́ка », « бы́стро » au
 * lieu de « быстро́ »... euh, l'inverse : « быстро́ » au lieu de « бы́стро ».
 *
 * Ces mots ne restaient pas dans le menu de complétion : l'apprenant les
 * ajoute à sa liste, ils deviennent des cartes, des QCM, des réponses à
 * taper. Un mot inventé est alors appris comme du russe.
 *
 * POURQUOI UN FILTRE ET PAS UNE RELECTURE. Le modèle ne se trompe pas au
 * hasard, il se trompe de façon PLAUSIBLE : « береце́т » ressemble à un mot
 * russe, « артери́я » ressemble à un accent russe. C'est précisément ce
 * qu'une relecture humaine rapide laisse passer et qu'une comparaison
 * mécanique attrape sans faillir.
 *
 * DEUX RÉGIMES, parce que les deux sources n'ont pas le même statut :
 * - une entrée GÉNÉRÉE inconnue du dictionnaire est supprimée ;
 * - une entrée CURÉE inconnue est conservée et signalée. Les banques
 *   relues à la main contiennent du vocabulaire scolaire légitime que le
 *   dictionnaire n'a pas (noms propres, mots composés), et les supprimer
 *   d'office ferait taire l'humain au profit de la source.
 *
 * L'accent, lui, est corrigé dans les deux cas : là où le dictionnaire
 * connaît le mot, il fait foi sur la place de l'accent.
 */
import { stripAccent, accentOnConsonant } from "./cyrillic.mjs";

/**
 * Les mots que le dictionnaire n'a pas, et qui sont pourtant du russe.
 *
 * OpenRussian répertorie мой, твой, свой, его, её — mais ni наш ni ваш.
 * C'est un trou de la source, pas une invention du modèle : les quatre
 * autres possessifs sont là, et ces deux-ci sont parmi les cent mots les
 * plus fréquents de la langue. Les supprimer parce qu'une source les oublie
 * serait laisser le dictionnaire décider de ce qui est russe.
 *
 * Cette liste doit rester COURTE et chaque entrée se justifier en une
 * phrase : c'est une dérogation à la vérification, pas une porte de sortie.
 */
const ABSENT_BUT_REAL = new Map([
  ["наш", "наш"],
  ["наша", "на́ша"],
  ["наше", "на́ше"],
  ["наши", "на́ши"],
  ["ваш", "ваш"],
  ["ваша", "ва́ша"],
  ["ваше", "ва́ше"],
  ["ваши", "ва́ши"],
  // Présent dans le dictionnaire, mais sa colonne `accented` ne porte pas
  // la marque : la source connaît le mot et ignore son accent.
  ["родители", "роди́тели"],
  ["тринадцать", "трина́дцать"],
]);

/**
 * @param {string} display   le mot tel qu'il serait affiché (accentué)
 * @param {object} dict      l'index rendu par loadDictionary()
 * @param {boolean} generated  vrai si l'entrée vient d'un modèle
 * @returns {{action: "keep"|"fix"|"drop", display: string, reason?: string}}
 */
export function gate(display, dict, { generated = false } = {}) {
  const word = display.normalize("NFC").trim();
  const vouched = ABSENT_BUT_REAL.get(stripAccent(word).toLowerCase());
  if (vouched) {
    return vouched === word
      ? { action: "keep", display: word }
      : { action: "fix", display: vouched, reason: `accent (${word} -> ${vouched})` };
  }
  const expected = dict.accentedOf(word);

  if (!expected) {
    if (generated) {
      return { action: "drop", display: word, reason: "absent du dictionnaire" };
    }
    return { action: "keep", display: word, reason: "absent du dictionnaire (entrée curée, conservée)" };
  }

  // Le dictionnaire ignore la casse ; une majuscule initiale légitime
  // (nom propre) ne doit pas être écrasée par la forme minuscule du CSV.
  const cased =
    word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()
      ? expected[0].toUpperCase() + expected.slice(1)
      : expected;

  if (cased === word) return { action: "keep", display: word };

  // ─── Le ё ne se perd jamais ─────────────────────────────────────
  //
  // Le dictionnaire écrit parfois « разъе́м » là où l'orthographe complète
  // demande « разъём » : le ё est facultatif en russe courant, et la source
  // suit l'usage typographique plutôt que la lettre. Une app qui APPREND la
  // langue doit faire l'inverse — le ё porte l'accent et la prononciation,
  // c'est exactement ce qu'un francophone a besoin de voir.
  //
  // Donc, à lettres égales par ailleurs, l'orthographe qui porte le ё
  // l'emporte, d'où qu'elle vienne.
  const wordYo = word.includes("ё");
  const expectedYo = cased.includes("ё");
  if (wordYo !== expectedYo && stripAccent(word).replace(/ё/g, "е").toLowerCase() ===
      stripAccent(cased).replace(/ё/g, "е").toLowerCase()) {
    if (wordYo) return { action: "keep", display: word };
    return { action: "fix", display: cased, reason: `ё rétabli (${word} -> ${cased})` };
  }

  // Même mot, accent différent : le dictionnaire tranche. On ne signale que
  // ce qui change vraiment la prononciation — pas une simple normalisation.
  if (stripAccent(cased).toLowerCase() === stripAccent(word).toLowerCase()) {
    return {
      action: "fix",
      display: cased,
      reason: accentOnConsonant(word)
        ? `accent posé sur une consonne (${word} -> ${cased})`
        : `accent déplacé (${word} -> ${cased})`,
    };
  }

  // Orthographe différente à ё près (le repli de recherche est tolérant) :
  // le dictionnaire fait foi là aussi — « елка » devient « ёлка ».
  return { action: "fix", display: cased, reason: `orthographe (${word} -> ${cased})` };
}

/** Applique le filtre à une liste et rend le détail, pour le rapport. */
export function reviseAll(rows, dict, { generated = false } = {}) {
  const kept = [];
  const dropped = [];
  const fixed = [];
  for (const row of rows) {
    const [display, ...rest] = row;
    const verdict = gate(display, dict, { generated });
    if (verdict.action === "drop") {
      dropped.push({ display, reason: verdict.reason, translation: rest[0] });
      continue;
    }
    if (verdict.action === "fix") fixed.push({ from: display, to: verdict.display, reason: verdict.reason });
    kept.push([verdict.display, ...rest]);
  }
  return { kept, dropped, fixed };
}
