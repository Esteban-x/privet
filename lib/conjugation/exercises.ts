import {
  MUTATION_VERBS,
  PERSONS,
  VERBS,
  getVerb,
  type Verb,
} from "@/lib/conjugation/verbs";
import { buildOptions, pick, type PracticeExercise, type Rng, type Skill } from "@/lib/exercises/types";

/**
 * Conjugaison — le module que le programme réclamait.
 *
 * Le cours enseigne deux conjugaisons, les alternances, le passé et
 * l'impératif ; aucun exercice ne les travaillait. Celui-ci tire dans la
 * banque de verbes (lib/conjugation/verbs.ts) et fabrique ses leurres à
 * partir des formes réelles du MÊME verbe, plus deux erreurs construites :
 * la terminaison de l'autre conjugaison, et l'accent du masculin posé sur
 * le passé féminin. Ce sont les deux fautes qu'un francophone produit
 * réellement — un leurre pris au hasard n'apprendrait rien.
 */

export const CONJUGATION_SKILLS: Skill[] = [
  {
    id: "present1",
    title: "Première conjugaison",
    level: "A1",
    summary:
      "Чита́ю, чита́ешь, чита́ют : la conjugaison en -е-, celle de la majorité des verbes russes. Le -е- devient -ё- dès que l'accent tombe sur la terminaison.",
  },
  {
    id: "present2",
    title: "Deuxième conjugaison",
    level: "A1",
    summary:
      "Говорю́, говори́шь, говоря́т : la conjugaison en -и-. Sa signature est la troisième personne du pluriel en -ят / -ат, qui la distingue de la première d'un seul coup d'œil.",
  },
  {
    id: "mutation",
    title: "Les alternances",
    level: "B1",
    summary:
      "Писа́ть fait пишу́, люби́ть fait люблю́ : une consonne change dans le radical. En première conjugaison l'alternance touche toutes les personnes, en deuxième la première du singulier seulement.",
  },
  {
    id: "past",
    title: "Le passé",
    level: "A1",
    summary:
      "Le passé russe ignore les personnes et s'accorde en genre : он был, она́ была́. Et dans beaucoup de verbes courts, le féminin déplace l'accent sur la terminaison — c'est là que ça s'entend.",
  },
  {
    id: "imperative",
    title: "L'impératif",
    level: "A2",
    summary:
      "Чита́й, скажи́, будь : l'impératif se construit sur le radical de la troisième personne du pluriel, avec -й après une voyelle et -и sous l'accent.",
  },
];

export type ConjugationSkillId = (typeof CONJUGATION_SKILLS)[number]["id"];

export function getConjugationSkill(id: string): Skill | undefined {
  return CONJUGATION_SKILLS.find((s) => s.id === id);
}

const ACCENT = "́";
const VOWELS = "аеёиоуыэюя";

const FIRST_REGULAR = VERBS.filter((v) => v.conjugation === "first" && !v.mutation);
const SECOND_REGULAR = VERBS.filter((v) => v.conjugation === "second" && !v.mutation);
const WITH_IMPERATIVE = VERBS.filter((v) => v.imperative !== null);

// ─────────────────────────────────────────────────────────────────
// Fabrication des leurres
// ─────────────────────────────────────────────────────────────────

/**
 * La même personne, avec la terminaison de l'AUTRE conjugaison.
 *
 * C'est la faute réelle du débutant : appliquer -ешь à un verbe en -ить, ou
 * l'inverse. La table ci-dessous liste les couples, variante accentuée
 * comprise — l'accent est une marque combinante, il fait donc partie de la
 * chaîne à échanger.
 */
const CROSS_ENDINGS: [string, string][] = [
  [`е${ACCENT}шь`, `и${ACCENT}шь`],
  ["ешь", "ишь"],
  [`ё${ACCENT}шь`, `и${ACCENT}шь`],
  ["ёшь", `и${ACCENT}шь`],
  [`е${ACCENT}т`, `и${ACCENT}т`],
  ["ет", "ит"],
  ["ёт", `и${ACCENT}т`],
  [`е${ACCENT}м`, `и${ACCENT}м`],
  ["ем", "им"],
  ["ём", `и${ACCENT}м`],
  ["ете", "ите"],
  ["ёте", `и${ACCENT}те`],
  [`ю${ACCENT}т`, `я${ACCENT}т`],
  ["ют", "ят"],
  [`у${ACCENT}т`, `а${ACCENT}т`],
  ["ут", "ат"],
];

export function crossConjugation(form: string, from: Verb["conjugation"]): string | null {
  for (const [first, second] of CROSS_ENDINGS) {
    const source = from === "first" ? first : second;
    const target = from === "first" ? second : first;
    if (form.endsWith(source)) {
      return form.slice(0, form.length - source.length) + target;
    }
  }
  return null;
}

/** Le rang de la voyelle qui porte l'accent, ou 0 si le mot n'en marque aucun. */
function accentedVowelIndex(word: string): number {
  let vowel = -1;
  for (let i = 0; i < word.length; i += 1) {
    if (VOWELS.includes(word[i])) vowel += 1;
    if (word[i] === ACCENT) return vowel;
  }
  return 0;
}

function stripAccent(word: string): string {
  return word.split(ACCENT).join("");
}

/** Repose l'accent sur la n-ième voyelle d'un mot dépouillé. */
function accentVowel(word: string, index: number): string {
  let vowel = -1;
  for (let i = 0; i < word.length; i += 1) {
    if (VOWELS.includes(word[i])) {
      vowel += 1;
      if (vowel === index) return word.slice(0, i + 1) + ACCENT + word.slice(i + 1);
    }
  }
  return word;
}

/**
 * Le passé féminin avec l'accent du masculin : « жи́ла » au lieu de
 * « жила́ ». Renvoie `null` quand le verbe ne déplace pas son accent — il
 * n'y a alors pas de faute à proposer.
 */
export function pastWithoutShift(verb: Verb): string | null {
  const masculineVowel = accentedVowelIndex(verb.past[0]);
  const feminineVowel = accentedVowelIndex(verb.past[1]);
  if (masculineVowel === feminineVowel) return null;
  const wrong = accentVowel(stripAccent(verb.past[1]), masculineVowel);
  return wrong === verb.past[1] ? null : wrong;
}

/** Les verbes dont le passé féminin déplace l'accent. */
export const SHIFTING_VERBS = VERBS.filter((v) => pastWithoutShift(v) !== null);

// ─────────────────────────────────────────────────────────────────
// Les cinq tirages
// ─────────────────────────────────────────────────────────────────

function presentExercise(pool: Verb[], skill: string, random: Rng): PracticeExercise {
  const verb = pick(pool, random);
  // La première personne ne distingue pas les deux conjugaisons (-ю dans
  // les deux) : la demander n'apprendrait rien ici.
  const person = 1 + Math.floor(random() * 5);
  const correct = verb.present[person];

  const candidates: string[] = [];
  const cross = crossConjugation(correct, verb.conjugation);
  if (cross) candidates.push(cross);
  for (const other of verb.present) if (other !== correct) candidates.push(other);

  const { options, correctIndex } = buildOptions(correct, candidates, random);

  return {
    itemId: `${skill}:${verb.id}:${person}`,
    prompt: "Conjugue",
    question: `${PERSONS[person]} ___`,
    hint: `${verb.infinitive} — ${verb.translation}`,
    badge: verb.conjugation === "first" ? "1ʳᵉ conjugaison" : "2ᵉ conjugaison",
    options,
    correctIndex,
    explain:
      verb.conjugation === "first"
        ? `Première conjugaison : voyelle -е- (ou -ё- sous l'accent), et -ют / -ут à la 3ᵉ personne du pluriel. ${PERSONS[person]} ${correct}.`
        : `Deuxième conjugaison : voyelle -и-, et -ят / -ат à la 3ᵉ personne du pluriel. ${PERSONS[person]} ${correct}.`,
  };
}

function mutationExercise(random: Rng): PracticeExercise {
  const verb = pick(MUTATION_VERBS, random);
  // L'alternance se voit à la 1ʳᵉ personne du singulier dans les deux
  // conjugaisons ; en première conjugaison elle vaut aussi ailleurs.
  const person = verb.conjugation === "second" ? 0 : pick([0, 1, 5], random);
  const correct = verb.present[person];

  const candidates = [verb.mutation!.naive];
  for (const other of verb.present) if (other !== correct) candidates.push(other);

  const { options, correctIndex } = buildOptions(correct, candidates, random);

  return {
    itemId: `mutation:${verb.id}:${person}`,
    prompt: "Conjugue",
    question: `${PERSONS[person]} ___`,
    hint: `${verb.infinitive} — ${verb.translation}`,
    badge: verb.mutation!.label,
    options,
    correctIndex,
    explain:
      verb.conjugation === "second"
        ? `Alternance ${verb.mutation!.label}, et en deuxième conjugaison elle ne touche QUE la première personne du singulier : ${correct}, mais ${verb.present[1]}.`
        : `Alternance ${verb.mutation!.label} : en première conjugaison, elle touche toutes les personnes — ${correct}, ${verb.present[1]}, ${verb.present[5]}.`,
  };
}

function pastExercise(random: Rng): PracticeExercise {
  // Deux tirages sur trois portent sur un verbe à accent mobile : c'est là
  // qu'est la difficulté, et elle ne se travaille pas sur « чита́л ».
  const verb = random() < 0.66 ? pick(SHIFTING_VERBS, random) : pick(VERBS, random);
  const feminine = random() < 0.5;
  const correct = feminine ? verb.past[1] : verb.past[0];

  const candidates = [feminine ? verb.past[0] : verb.past[1], verb.infinitive, verb.present[2]];
  const shifted = pastWithoutShift(verb);
  if (feminine && shifted) candidates.unshift(shifted);

  const { options, correctIndex } = buildOptions(correct, candidates, random);

  return {
    itemId: `past:${verb.id}:${feminine ? "f" : "m"}`,
    prompt: "Mets au passé",
    question: `${feminine ? "Она́" : "Он"} ___`,
    hint: `${verb.infinitive} — ${verb.translation}`,
    badge: feminine ? "féminin" : "masculin",
    options,
    correctIndex,
    explain:
      feminine && shifted
        ? `Au féminin, l'accent passe sur la terminaison : ${verb.past[0]} mais ${verb.past[1]}. C'est la seule différence audible entre les deux.`
        : `Le passé s'accorde en genre, jamais en personne : ${verb.past[0]} au masculin, ${verb.past[1]} au féminin.`,
  };
}

function imperativeExercise(random: Rng): PracticeExercise {
  const verb = pick(WITH_IMPERATIVE, random);
  const correct = verb.imperative!;

  const candidates = [verb.present[1], verb.present[5], verb.infinitive];
  const { options, correctIndex } = buildOptions(correct, candidates, random);

  return {
    itemId: `imperative:${verb.id}`,
    prompt: "Donne l'ordre (à « ты »)",
    question: "___ !",
    hint: `${verb.infinitive} — ${verb.translation}`,
    badge: "impératif",
    options,
    correctIndex,
    explain: `L'impératif se prend sur le radical de « они́ » (${verb.present[5]}) : ${correct}. Pour « вы », on ajoute -те — ${correct}те.`,
  };
}

// ─────────────────────────────────────────────────────────────────
// Tirage et correction
// ─────────────────────────────────────────────────────────────────

export function generateConjugationExercise(
  skill: string,
  random: Rng = Math.random
): PracticeExercise {
  switch (skill) {
    case "present1":
      return presentExercise(FIRST_REGULAR, "present1", random);
    case "present2":
      return presentExercise(SECOND_REGULAR, "present2", random);
    case "mutation":
      return mutationExercise(random);
    case "past":
      return pastExercise(random);
    case "imperative":
      return imperativeExercise(random);
    default:
      throw new Error(`Compétence inconnue : ${skill}`);
  }
}

export function checkConjugationAnswer(itemId: string, answer: string): boolean | null {
  const [skill, verbId, extra] = itemId.split(":");
  const verb = getVerb(verbId ?? "");
  if (!verb) return null;

  switch (skill) {
    case "present1":
    case "present2":
    case "mutation": {
      const person = Number(extra);
      if (!Number.isInteger(person) || person < 0 || person > 5) return null;
      return verb.present[person] === answer;
    }
    case "past":
      if (extra !== "m" && extra !== "f") return null;
      return verb.past[extra === "f" ? 1 : 0] === answer;
    case "imperative":
      if (!verb.imperative) return null;
      return verb.imperative === answer;
    default:
      return null;
  }
}

export { FIRST_REGULAR, SECOND_REGULAR, WITH_IMPERATIVE };
