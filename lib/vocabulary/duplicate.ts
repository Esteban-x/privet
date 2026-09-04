/**
 * « Est-ce le même mot que celui-là ? », pour refuser un doublon.
 *
 * Isomorphe et sans dépendance : la route d'ajout s'en sert pour REFUSER
 * (app/api/vocab/words), le formulaire pour prévenir avant même d'envoyer.
 * Les deux doivent répondre pareil, sinon le client laisse passer ce que le
 * serveur rejette — et l'apprenant voit une erreur sans comprendre laquelle.
 *
 * PAS `normalizeAnswer`, malgré la ressemblance. Celui-là replie ё sur е,
 * parce qu'un apprenant qui tape « все » en visant « всё » connaît son mot.
 * Ici on RANGE des mots, pas on les corrige : все (tous) et всё (tout) sont
 * deux entrées légitimes, et les confondre interdirait la seconde.
 *
 * Ce qui est replié, en revanche : l'ACCENT TONIQUE, qui n'est qu'une aide
 * de lecture — кни́га et книга sont le même mot, et la banque écrit l'un
 * pendant que l'apprenant tape l'autre. Plus la casse et les espaces.
 */

/** Accent tonique combinant, la seule marque que le russe ajoute pour lire. */
const STRESS_MARKS = [String.fromCharCode(0x0300), String.fromCharCode(0x0301)];

export function wordKey(word: string): string {
  let out = word.trim().toLowerCase().normalize("NFD");
  // ё se décompose en е + TRÉMA (U+0308) et й en и + BRÈVE (U+0306) : ni
  // l'un ni l'autre n'est touché, et la recomposition les rend intacts.
  // Seul l'accent tonique disparaît.
  for (const mark of STRESS_MARKS) out = out.split(mark).join("");
  return out.normalize("NFC").replace(/\s+/g, " ");
}

/** Vrai quand les deux graphies désignent la même entrée de liste. */
export function sameWord(a: string, b: string): boolean {
  const key = wordKey(a);
  return key.length > 0 && key === wordKey(b);
}
