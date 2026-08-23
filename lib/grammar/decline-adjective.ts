import { Adjective, Animacy, CaseId, DeclensionResult, Gender } from "./types";

/**
 * Déclinaison des adjectifs (forme longue), RULE-BASED — contrairement aux
 * noms, dont les formes viennent du dictionnaire. C'est justifié ici : la
 * déclinaison de l'adjectif long est un système fermé et entièrement
 * régulier (trois tables + deux règles d'orthographe), sans voyelle mobile
 * ni supplétisme. `accented` reprend donc la forme calculée : la banque
 * d'adjectifs ne porte pas d'accent tonique.
 *
 * Trois familles :
 * - "hard"  : radical dur, désinences -ый/-ая/-ое/-ые (новый, старый…).
 * - "soft"  : radical mou véritable, désinences -ий/-яя/-ее/-ие (синий,
 *   домашний…) — table dédiée, pas de correction orthographique à faire.
 * - "mixed" : radical en г к х ж ч ш щ. Se décline comme "hard" mais avec
 *   les deux règles d'orthographe russes (7 lettres : jamais ы après
 *   г к х ж ч ш щ -> и ; 5 lettres : о non accentué après ж ч ш щ ц -> е).
 *   `stressedEnding` (большой, молодой, дорогой) neutralise la règle des 5
 *   lettres (accent sur la désinence) mais pas celle des 7 lettres, et
 *   donne un nominatif masc./neutre en -ой au lieu de -ый/-ий.
 */

const SOFTENING_HISSING = ["ж", "ч", "ш", "щ"];

function stemOf(adj: Adjective): { stem: string; lastLetter: string } {
  const stem = adj.lemmaM.slice(0, -2); // -ый/-ий/-ой font toujours 2 caractères
  return { stem, lastLetter: stem[stem.length - 1] };
}

function applySpelling(ending: string, adj: Adjective, lastLetter: string): string {
  if (adj.stemType !== "mixed") return ending;
  let out = ending.replace(/ы/g, "и"); // règle des 7 lettres, inconditionnelle
  if (!adj.stressedEnding && SOFTENING_HISSING.includes(lastLetter)) {
    out = out.replace(/^о/, "е"); // règle des 5 lettres, seulement si non accentué
  }
  return out;
}

interface EndingSet {
  masc: string;
  fem: string;
  neut: string;
  pl: string;
}

const HARD: Record<
  "nom" | "gen" | "dat" | "instr" | "prep",
  EndingSet
> = {
  nom: { masc: "ый", fem: "ая", neut: "ое", pl: "ые" },
  gen: { masc: "ого", fem: "ой", neut: "ого", pl: "ых" },
  dat: { masc: "ому", fem: "ой", neut: "ому", pl: "ым" },
  instr: { masc: "ым", fem: "ой", neut: "ым", pl: "ыми" },
  prep: { masc: "ом", fem: "ой", neut: "ом", pl: "ых" },
};

const SOFT: Record<"nom" | "gen" | "dat" | "instr" | "prep", EndingSet> = {
  nom: { masc: "ий", fem: "яя", neut: "ее", pl: "ие" },
  gen: { masc: "его", fem: "ей", neut: "его", pl: "их" },
  dat: { masc: "ему", fem: "ей", neut: "ему", pl: "им" },
  instr: { masc: "им", fem: "ей", neut: "им", pl: "ими" },
  prep: { masc: "ем", fem: "ей", neut: "ем", pl: "их" },
};

function nonAccusativeForm(
  adj: Adjective,
  group: "nom" | "gen" | "dat" | "instr" | "prep",
  gender: Gender,
  plural: boolean,
  stem: string,
  lastLetter: string
): { form: string; rule: string } {
  const table = adj.stemType === "soft" ? SOFT : HARD;
  const set = table[group];
  let raw = plural ? set.pl : gender === "masculine" ? set.masc : gender === "feminine" ? set.fem : set.neut;

  if (group === "nom" && !plural && gender === "masculine" && adj.stressedEnding) {
    raw = "ой"; // большой, молодой, дорогой : accent sur la désinence (radical dur ou mixte)
  }

  const ending = applySpelling(raw, adj, lastLetter);
  return { form: stem + ending, rule: `adjectif ${adj.stemType} : ${group} ${plural ? "pl." : gender} -${ending}` };
}

export function declineAdjective(
  adj: Adjective,
  targetCase: CaseId,
  gender: Gender,
  plural: boolean,
  animacy: Animacy
): DeclensionResult {
  const { stem, lastLetter } = stemOf(adj);

  if (targetCase === "nominative") {
    const r = nonAccusativeForm(adj, "nom", gender, plural, stem, lastLetter);
    return { case: targetCase, form: r.form, accented: r.form, ruleApplied: r.rule, isIrregular: false };
  }

  if (targetCase === "accusative") {
    if (!plural && gender === "feminine") {
      const raw = adj.stemType === "soft" ? "юю" : "ую";
      const ending = applySpelling(raw, adj, lastLetter);
      return {
        case: targetCase,
        form: stem + ending,
        accented: stem + ending,
        ruleApplied: `adjectif fém. : accusatif -${ending}`,
        isIrregular: false,
      };
    }
    if (!plural && gender === "neuter") {
      const r = nonAccusativeForm(adj, "nom", gender, plural, stem, lastLetter);
      return { case: targetCase, form: r.form, accented: r.form, ruleApplied: "adjectif neutre : accusatif = nominatif", isIrregular: false };
    }
    // masculin singulier et pluriel (tous genres) : dépend de l'animacité
    if (animacy === "animate") {
      const r = nonAccusativeForm(adj, "gen", gender, plural, stem, lastLetter);
      return { case: targetCase, form: r.form, accented: r.form, ruleApplied: "adjectif animé : accusatif = génitif", isIrregular: false };
    }
    const r = nonAccusativeForm(adj, "nom", gender, plural, stem, lastLetter);
    return { case: targetCase, form: r.form, accented: r.form, ruleApplied: "adjectif inanimé : accusatif = nominatif", isIrregular: false };
  }

  const group = targetCase === "genitive" ? "gen" : targetCase === "dative" ? "dat" : targetCase === "instrumental" ? "instr" : "prep";
  const r = nonAccusativeForm(adj, group, gender, plural, stem, lastLetter);
  return { case: targetCase, form: r.form, accented: r.form, ruleApplied: r.rule, isIrregular: false };
}
