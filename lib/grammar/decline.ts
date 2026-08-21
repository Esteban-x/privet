import { CaseId, DeclensionResult, Gender, Noun } from "./types";

/**
 * Moteur de déclinaison RULE-BASED (pas d'IA) : la déclinaison russe suit des
 * patterns fermés et bien documentés. On préfère un moteur déterministe +
 * table d'exceptions plutôt qu'une génération IA, qui pourrait halluciner
 * une forme fautive. L'IA n'intervient qu'en amont/aval (génération de
 * phrases, correction pédagogique), jamais pour "calculer" la forme elle-même.
 *
 * Limite assumée : la voyelle mobile о/е dans certaines terminaisons
 * instrumentales/génitives (dépendante de l'accentuation) est simplifiée.
 * Les exceptions notables sont couvertes via `noun.irregular`.
 */

const HISSING = ["г", "к", "х", "ж", "ч", "ш", "щ", "ц"]; // règle des 7/5 lettres
const ALWAYS_SOFT_HISSING = ["ж", "ч", "ш", "щ"];

function endsWith(str: string, suffix: string) {
  return str.endsWith(suffix);
}

function lastChar(str: string) {
  return str[str.length - 1];
}

// Applique la règle d'orthographe russe : jamais ы après г к х ж ч ш щ (-> и)
function spellY(stemLastLetter: string, wanted: "ы" | "и"): "ы" | "и" {
  if (wanted === "ы" && HISSING.includes(stemLastLetter)) return "и";
  return wanted;
}

// Applique la règle : о non accentué -> е après ж ч ш щ ц
function spellO(stemLastLetter: string, wanted: "о" | "е"): "о" | "е" {
  if (wanted === "о" && ALWAYS_SOFT_HISSING.includes(stemLastLetter)) return "е";
  if (wanted === "о" && stemLastLetter === "ц") return "е";
  return wanted;
}

interface StemInfo {
  stem: string;
  lastStemLetter: string;
  isSoft: boolean;
}

function getStem(noun: Noun): StemInfo {
  const lemma = noun.lemma;
  const last = lastChar(lemma);

  if (noun.gender === "masculine") {
    if (endsWith(lemma, "й") || endsWith(lemma, "ь")) {
      const stem = lemma.slice(0, -1);
      return { stem, lastStemLetter: lastChar(stem), isSoft: true };
    }
    return { stem: lemma, lastStemLetter: last, isSoft: false };
  }

  if (noun.gender === "feminine") {
    if (endsWith(lemma, "ь")) {
      const stem = lemma.slice(0, -1);
      return { stem, lastStemLetter: lastChar(stem), isSoft: true }; // 3e déclinaison
    }
    if (endsWith(lemma, "я")) {
      const stem = lemma.slice(0, -1);
      return { stem, lastStemLetter: lastChar(stem), isSoft: true };
    }
    // -а (par défaut)
    const stem = lemma.slice(0, -1);
    return { stem, lastStemLetter: lastChar(stem), isSoft: false };
  }

  // neuter
  if (endsWith(lemma, "е") || endsWith(lemma, "ё")) {
    const stem = lemma.slice(0, -1);
    return { stem, lastStemLetter: lastChar(stem), isSoft: true };
  }
  const stem = lemma.slice(0, -1); // -о
  return { stem, lastStemLetter: lastChar(stem), isSoft: false };
}

// Détecte si le nom relève de la 3e déclinaison féminine (en -ь : дверь, ночь…)
function isThirdDeclensionFeminine(noun: Noun) {
  return noun.gender === "feminine" && endsWith(noun.lemma, "ь");
}

function declineSingular(noun: Noun, c: CaseId): { form: string; rule: string } {
  const { stem, lastStemLetter, isSoft } = getStem(noun);

  if (isThirdDeclensionFeminine(noun)) {
    switch (c) {
      case "nominative":
        return { form: noun.lemma, rule: "forme du dictionnaire (3e déclinaison, -ь)" };
      case "genitive":
      case "dative":
      case "prepositional":
        return { form: stem + "и", rule: "3e déclinaison fém. (-ь) : datif/génitif/prép. -и" };
      case "accusative":
        return { form: noun.lemma, rule: "3e déclinaison fém. : accusatif = nominatif" };
      case "instrumental":
        return { form: stem + "ью", rule: "3e déclinaison fém. : instrumental -ью" };
    }
  }

  if (noun.gender === "masculine") {
    switch (c) {
      case "nominative":
        return { form: noun.lemma, rule: "forme du dictionnaire" };
      case "genitive":
        return {
          form: stem + (isSoft ? "я" : "а"),
          rule: isSoft ? "masc. mou : génitif -я" : "masc. dur : génitif -а",
        };
      case "dative":
        return {
          form: stem + (isSoft ? "ю" : "у"),
          rule: isSoft ? "masc. mou : datif -ю" : "masc. dur : datif -у",
        };
      case "accusative": {
        if (noun.animacy === "animate") {
          const gen = stem + (isSoft ? "я" : "а");
          return { form: gen, rule: "masc. animé : accusatif = génitif" };
        }
        return { form: noun.lemma, rule: "masc. inanimé : accusatif = nominatif" };
      }
      case "instrumental": {
        const ending = spellO(lastStemLetter, "о") === "е" ? "ем" : isSoft ? "ем" : "ом";
        return { form: stem + ending, rule: `masc. : instrumental -${ending}` };
      }
      case "prepositional":
        return { form: stem + "е", rule: "masc. : prépositionnel -е (о + prép.)" };
    }
  }

  if (noun.gender === "feminine") {
    switch (c) {
      case "nominative":
        return { form: noun.lemma, rule: "forme du dictionnaire" };
      case "genitive": {
        const ending = isSoft ? "и" : spellY(lastStemLetter, "ы");
        return { form: stem + ending, rule: `fém. : génitif -${ending}` };
      }
      case "dative":
      case "prepositional":
        return { form: stem + "е", rule: "fém. : datif/prépositionnel -е" };
      case "accusative":
        return { form: stem + (isSoft ? "ю" : "у"), rule: "fém. : accusatif -у/-ю" };
      case "instrumental":
        return { form: stem + (isSoft ? "ей" : "ой"), rule: "fém. : instrumental -ой/-ей" };
    }
  }

  // neuter
  switch (c) {
    case "nominative":
      return { form: noun.lemma, rule: "forme du dictionnaire" };
    case "genitive":
      return { form: stem + (isSoft ? "я" : "а"), rule: "neutre : génitif -а/-я" };
    case "dative":
      return { form: stem + (isSoft ? "ю" : "у"), rule: "neutre : datif -у/-ю" };
    case "accusative":
      return { form: noun.lemma, rule: "neutre : accusatif = nominatif" };
    case "instrumental": {
      const ending = isSoft ? "ем" : "ом";
      return { form: stem + ending, rule: `neutre : instrumental -${ending}` };
    }
    case "prepositional":
      return { form: stem + "е", rule: "neutre : prépositionnel -е" };
  }

  return { form: noun.lemma, rule: "non résolu" };
}

function declineGenitivePlural(noun: Noun): { form: string; rule: string } {
  const { stem, lastStemLetter, isSoft } = getStem(noun);
  if (noun.gender === "masculine") {
    if (HISSING.includes(lastStemLetter) || isSoft) {
      return { form: stem + "ей", rule: "masc. (mou/chuintante) : génitif pluriel -ей" };
    }
    return { form: stem + "ов", rule: "masc. dur : génitif pluriel -ов" };
  }
  if (noun.gender === "feminine" || noun.gender === "neuter") {
    if (isThirdDeclensionFeminine(noun)) {
      return { form: stem + "ей", rule: "fém. (-ь) : génitif pluriel -ей" };
    }
    // терминaison zéro le plus souvent (книга -> книг, окно -> окон)
    return { form: stem, rule: "fém./neutre : génitif pluriel Ø (terminaison zéro)" };
  }
  return { form: stem, rule: "génitif pluriel (approx.)" };
}

function declineNominativePlural(noun: Noun): { form: string; rule: string } {
  const { stem, lastStemLetter, isSoft } = getStem(noun);
  if (noun.gender === "masculine") {
    const ending = spellY(lastStemLetter, isSoft ? "и" : "ы");
    return { form: stem + ending, rule: `masc. : nominatif pluriel -${ending}` };
  }
  if (noun.gender === "feminine") {
    const ending = isSoft ? "и" : spellY(lastStemLetter, "ы");
    return { form: stem + ending, rule: `fém. : nominatif pluriel -${ending}` };
  }
  // neutre
  const ending = isSoft ? "я" : "а";
  return { form: stem + ending, rule: `neutre : nominatif pluriel -${ending}` };
}

function declinePlural(noun: Noun, c: CaseId): { form: string; rule: string } {
  const { stem } = getStem(noun);
  switch (c) {
    case "nominative":
      return declineNominativePlural(noun);
    case "genitive":
      return declineGenitivePlural(noun);
    case "dative":
      return { form: stem + "ам", rule: "pluriel (tous genres) : datif -ам/-ям" };
    case "instrumental":
      return { form: stem + "ами", rule: "pluriel (tous genres) : instrumental -ами/-ями" };
    case "prepositional":
      return { form: stem + "ах", rule: "pluriel (tous genres) : prépositionnel -ах/-ях" };
    case "accusative": {
      if (noun.animacy === "animate") {
        const gen = declineGenitivePlural(noun);
        return { form: gen.form, rule: "pluriel animé : accusatif = génitif pluriel" };
      }
      const nom = declineNominativePlural(noun);
      return { form: nom.form, rule: "pluriel inanimé : accusatif = nominatif pluriel" };
    }
  }
}

export function declineNoun(noun: Noun, targetCase: CaseId, plural = false): DeclensionResult {
  if (noun.indeclinable) {
    return { case: targetCase, form: noun.lemma, ruleApplied: "mot indéclinable (emprunt)", isIrregular: true };
  }

  const irregularSet = plural ? noun.irregular?.plural : noun.irregular?.singular;
  if (irregularSet?.[targetCase]) {
    return {
      case: targetCase,
      form: irregularSet[targetCase]!,
      ruleApplied: "forme irrégulière à mémoriser",
      isIrregular: true,
    };
  }

  if (targetCase === "nominative" && !plural) {
    return { case: targetCase, form: noun.lemma, ruleApplied: "forme du dictionnaire", isIrregular: false };
  }

  const { form, rule } = plural ? declinePlural(noun, targetCase) : declineSingular(noun, targetCase);
  return { case: targetCase, form, ruleApplied: rule, isIrregular: false };
}

export function declineAll(noun: Noun, plural = false): DeclensionResult[] {
  const order: CaseId[] = [
    "nominative",
    "genitive",
    "dative",
    "accusative",
    "instrumental",
    "prepositional",
  ];
  return order.map((c) => declineNoun(noun, c, plural));
}
