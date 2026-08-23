import { CASE_ORDER, CaseId, DeclensionResult, Noun } from "./types";

/**
 * Deux responsabilités, volontairement séparées :
 *
 * 1. LA FORME est lue dans le paradigme du mot (`noun.forms`), importé du
 *    dictionnaire OpenRussian et vérifié (voir scripts/build-nouns.mjs).
 *    Le module affiche cette forme comme "la bonne réponse" : elle ne peut
 *    pas être le produit d'une règle approximative.
 *
 * 2. LA RÈGLE est calculée ici, par un moteur déterministe. Mesuré sur les
 *    17 800 noms du dictionnaire, ce moteur retombe sur la bonne forme dans
 *    ~76 % des cas : assez pour EXPLIQUER une terminaison, pas assez pour la
 *    produire. Ce qui lui échappe — voyelle mobile (оте́ц -> отца́), schéma
 *    accentuel (врачо́м vs ме́сяцем), pluriels supplétifs (челове́к -> лю́ди)
 *    — n'est pas dérivable de l'orthographe du lemme, par nature.
 *
 * Quand les deux divergent, `isIrregular` passe à vrai et le libellé
 * explique de quel genre d'écart il s'agit, au lieu d'énoncer une règle que
 * la forme affichée contredit.
 */

// ─── Les deux règles d'orthographe russes, à ne pas confondre ──────
//
// Règle des 7 lettres : jamais ы après г к х ж ч ш щ (-> и). Le ц N'EN FAIT
// PAS PARTIE : отцы, улицы, jamais "отци"/"улици".
const SEVEN_LETTERS = ["г", "к", "х", "ж", "ч", "ш", "щ"];
// Chuintantes + ц : imposent (a) о non accentué -> е et (b) l'impossibilité
// d'écrire я/ю après elles (-> а/у : се́рдце -> се́рдца, ночь -> ноча́м).
// г к х n'en font PAS partie : c'est cette confusion qui produisait
// "мальчикей" au génitif pluriel.
const SIBILANTS_AND_TS = ["ж", "ч", "ш", "щ", "ц"];
const SIBILANTS = ["ж", "ч", "ш", "щ"];

const ACCENT = /́/g;

/** Retire l'accent tonique combinant : "рабо́та" -> "работа". */
export function stripAccent(form: string): string {
  return form.replace(ACCENT, "");
}

function lastChar(str: string) {
  return str[str.length - 1];
}

/** Règle des 7 lettres : ы -> и après г к х ж ч ш щ. */
function spellY(stemLastLetter: string, wanted: "ы" | "и"): "ы" | "и" {
  if (wanted === "ы" && SEVEN_LETTERS.includes(stemLastLetter)) return "и";
  return wanted;
}

/**
 * Interdiction orthographique de я/ю après une chuintante ou ц : la
 * désinence molle s'écrit avec la voyelle dure correspondante. Ne touche que
 * la voyelle initiale — "ью" (но́чью) commence par ь et reste intact.
 */
function hardenSoftVowel(stemLastLetter: string, ending: string): string {
  if (!SIBILANTS_AND_TS.includes(stemLastLetter)) return ending;
  if (ending.startsWith("я")) return "а" + ending.slice(1);
  if (ending.startsWith("ю")) return "у" + ending.slice(1);
  return ending;
}

// ─── Classe de déclinaison ─────────────────────────────────────────
//
// Déterminée par la TERMINAISON, jamais par le genre seul : "па́па" est
// masculin mais se décline exactement comme "кни́га". Brancher sur le genre
// produisait "папаа/папау/папаом".
type DeclensionClass = "first" | "second" | "third";

function declensionClass(noun: Noun): DeclensionClass {
  const last = lastChar(noun.lemma);
  if ((last === "а" || last === "я") && noun.gender !== "neuter") return "second";
  if (noun.gender === "feminine" && last === "ь") return "third";
  return "first";
}

interface StemInfo {
  stem: string;
  lastStemLetter: string;
  isSoft: boolean;
}

function getStem(noun: Noun): StemInfo {
  const lemma = noun.lemma;
  const last = lastChar(lemma);
  let stem: string;
  let isSoft: boolean;

  if (last === "а" || last === "о") {
    stem = lemma.slice(0, -1);
    isSoft = false;
  } else if (last === "я" || last === "е" || last === "ё" || last === "ь" || last === "й") {
    stem = lemma.slice(0, -1);
    isSoft = true;
  } else {
    stem = lemma; // terminaison consonantique
    isSoft = false;
  }
  return { stem, lastStemLetter: lastChar(stem), isSoft };
}

/** Forme prédite par la règle, avec la désinence qu'elle ajoute au radical. */
interface RuleResult {
  form: string;
  ending: string;
  rule: string;
}

const dictionaryForm = (noun: Noun): RuleResult => ({
  form: noun.lemma,
  ending: "",
  rule: "forme du dictionnaire",
});

// ─── Singulier ─────────────────────────────────────────────────────

function firstSingular(noun: Noun, c: CaseId, s: StemInfo): RuleResult {
  const { stem, lastStemLetter, isSoft } = s;
  const label = noun.gender === "neuter" ? "neutre" : "masc.";
  const build = (ending: string, rule: string): RuleResult => ({ form: stem + ending, ending, rule });

  switch (c) {
    case "nominative":
      return dictionaryForm(noun);
    case "genitive": {
      const e = hardenSoftVowel(lastStemLetter, isSoft ? "я" : "а");
      return build(e, `${label} : génitif -${e}`);
    }
    case "dative": {
      const e = hardenSoftVowel(lastStemLetter, isSoft ? "ю" : "у");
      return build(e, `${label} : datif -${e}`);
    }
    case "accusative": {
      if (noun.gender === "neuter") {
        return { form: noun.lemma, ending: "", rule: "neutre : accusatif = nominatif" };
      }
      if (noun.animacy === "animate") {
        const e = hardenSoftVowel(lastStemLetter, isSoft ? "я" : "а");
        return build(e, "masc. animé : accusatif = génitif");
      }
      return { form: noun.lemma, ending: "", rule: "masc. inanimé : accusatif = nominatif" };
    }
    case "instrumental": {
      // о/е après chuintante ou ц dépend de l'accent (врачо́м vs ме́сяцем) :
      // non décidable ici, on donne la variante non accentuée et le
      // paradigme tranche.
      const e = isSoft ? "ем" : SIBILANTS_AND_TS.includes(lastStemLetter) ? "ем" : "ом";
      return build(e, `${label} : instrumental -${e}`);
    }
    case "prepositional": {
      // Radical en -и (-ий / -ие : санато́рий, зда́ние) : -ии, jamais "-ие".
      const e = isSoft && stem.endsWith("и") ? "и" : "е";
      return build(e, `${label} : prépositionnel -${e}`);
    }
  }
}

function secondSingular(noun: Noun, c: CaseId, s: StemInfo): RuleResult {
  const { stem, lastStemLetter, isSoft } = s;
  const build = (ending: string, rule: string): RuleResult => ({ form: stem + ending, ending, rule });

  switch (c) {
    case "nominative":
      return dictionaryForm(noun);
    case "genitive": {
      const e = isSoft ? "и" : spellY(lastStemLetter, "ы");
      return build(e, `2e déclinaison (-а/-я) : génitif -${e}`);
    }
    case "dative":
    case "prepositional": {
      // Radical en -и (-ия : фами́лия) : datif/prépositionnel en -ии.
      const e = isSoft && stem.endsWith("и") ? "и" : "е";
      return build(e, `2e déclinaison : datif/prépositionnel -${e}`);
    }
    case "accusative": {
      const e = hardenSoftVowel(lastStemLetter, isSoft ? "ю" : "у");
      return build(e, `2e déclinaison : accusatif -${e}`);
    }
    case "instrumental": {
      const e = isSoft ? "ей" : SIBILANTS_AND_TS.includes(lastStemLetter) ? "ей" : "ой";
      return build(e, `2e déclinaison : instrumental -${e}`);
    }
  }
}

function thirdSingular(noun: Noun, c: CaseId, s: StemInfo): RuleResult {
  const build = (ending: string, rule: string): RuleResult => ({ form: s.stem + ending, ending, rule });
  switch (c) {
    case "nominative":
      return { form: noun.lemma, ending: "", rule: "forme du dictionnaire (3e déclinaison, -ь)" };
    case "genitive":
    case "dative":
    case "prepositional":
      return build("и", "3e déclinaison fém. (-ь) : génitif/datif/prép. -и");
    case "accusative":
      return { form: noun.lemma, ending: "", rule: "3e déclinaison fém. : accusatif = nominatif" };
    case "instrumental":
      return build("ью", "3e déclinaison fém. : instrumental -ью");
  }
}

// ─── Pluriel ───────────────────────────────────────────────────────

function nominativePlural(noun: Noun, s: StemInfo): RuleResult {
  const { stem, lastStemLetter, isSoft } = s;
  const cls = declensionClass(noun);
  const build = (ending: string, rule: string): RuleResult => ({ form: stem + ending, ending, rule });

  if (cls === "third") return build("и", "3e déclinaison : nominatif pluriel -и");
  if (cls === "second" || noun.gender !== "neuter") {
    const e = isSoft ? "и" : spellY(lastStemLetter, "ы");
    return build(e, `nominatif pluriel -${e}`);
  }
  const e = hardenSoftVowel(lastStemLetter, isSoft ? "я" : "а");
  return build(e, `neutre : nominatif pluriel -${e}`);
}

function genitivePlural(noun: Noun, s: StemInfo): RuleResult {
  const { stem, lastStemLetter, isSoft } = s;
  const cls = declensionClass(noun);
  const build = (ending: string, rule: string): RuleResult => ({ form: stem + ending, ending, rule });

  if (cls === "third") return build("ей", "3e déclinaison (-ь) : génitif pluriel -ей");

  if (cls === "first" && noun.gender !== "neuter") {
    // -й (semi-voyelle : музе́й) : -ев, distinct du -ь (слова́рь).
    if (lastChar(noun.lemma) === "й") return build("ев", "masc. en -й : génitif pluriel -ев");
    if (SIBILANTS.includes(lastStemLetter)) return build("ей", "masc. en chuintante : génitif pluriel -ей");
    if (lastStemLetter === "ц") return build("ев", "masc. en ц : génitif pluriel -ев");
    if (isSoft) return build("ей", "masc. mou (-ь) : génitif pluriel -ей");
    return build("ов", "masc. dur : génitif pluriel -ов");
  }
  // Radical en -и (-ия / -ие : фами́лия, зда́ние) : -й.
  if (isSoft && stem.endsWith("и")) return build("й", "radical en -и (-ия/-ие) : génitif pluriel -й");
  if (noun.gender === "neuter" && isSoft) return build("ей", "neutre mou (-е) : génitif pluriel -ей");
  if (cls === "second" && isSoft) return build("ь", "2e déclinaison molle (-я) : génitif pluriel -ь");
  return build("", "génitif pluriel Ø (terminaison zéro)");
}

function decliningPlural(noun: Noun, c: CaseId, s: StemInfo): RuleResult {
  const { stem, lastStemLetter, isSoft } = s;
  const softOrHard = (soft: string, hard: string) =>
    isSoft ? hardenSoftVowel(lastStemLetter, soft) : hard;
  const build = (ending: string, rule: string): RuleResult => ({ form: stem + ending, ending, rule });

  switch (c) {
    case "nominative":
      return nominativePlural(noun, s);
    case "genitive":
      return genitivePlural(noun, s);
    case "dative": {
      const e = softOrHard("ям", "ам");
      return build(e, `pluriel (tous genres) : datif -${e}`);
    }
    case "instrumental": {
      const e = softOrHard("ями", "ами");
      return build(e, `pluriel (tous genres) : instrumental -${e}`);
    }
    case "prepositional": {
      const e = softOrHard("ях", "ах");
      return build(e, `pluriel (tous genres) : prépositionnel -${e}`);
    }
    case "accusative": {
      if (noun.animacy === "animate") {
        const gen = genitivePlural(noun, s);
        return { ...gen, rule: "pluriel animé : accusatif = génitif pluriel" };
      }
      const nom = nominativePlural(noun, s);
      return { ...nom, rule: "pluriel inanimé : accusatif = nominatif pluriel" };
    }
  }
}

/** Ce que la règle générale prédit — pas forcément ce que la langue fait. */
function byRule(noun: Noun, targetCase: CaseId, plural: boolean): RuleResult {
  const stem = getStem(noun);
  if (plural) return decliningPlural(noun, targetCase, stem);
  const cls = declensionClass(noun);
  if (cls === "second") return secondSingular(noun, targetCase, stem);
  if (cls === "third") return thirdSingular(noun, targetCase, stem);
  return firstSingular(noun, targetCase, stem);
}

// ─── Point d'entrée ────────────────────────────────────────────────

export function declineNoun(noun: Noun, targetCase: CaseId, plural = false): DeclensionResult {
  const index = CASE_ORDER.indexOf(targetCase);
  const accented = (plural ? noun.forms.plural : noun.forms.singular)[index];
  const form = stripAccent(accented);

  const predicted = byRule(noun, targetCase, plural);
  if (predicted.form === form) {
    return { case: targetCase, form, accented, ruleApplied: predicted.rule, isIrregular: false };
  }

  // La règle se trompe : reste à dire en quoi, pour que l'apprenant sache
  // quoi mémoriser. Si la désinence prédite est la bonne, c'est le radical
  // qui bouge (voyelle mobile, alternance) ; sinon la terminaison elle-même
  // est irrégulière.
  const sameEnding = predicted.ending.length > 0 && form.endsWith(predicted.ending);
  return {
    case: targetCase,
    form,
    accented,
    ruleApplied: sameEnding
      ? `${predicted.rule} — mais le radical change (voyelle mobile ou alternance)`
      : "forme irrégulière : à mémoriser telle quelle",
    isIrregular: true,
  };
}

export function declineAll(noun: Noun, plural = false): DeclensionResult[] {
  return CASE_ORDER.map((c) => declineNoun(noun, c, plural));
}
