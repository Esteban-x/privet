import { CASE_ORDER, type CaseId } from "@/lib/grammar/types";
import { NOUNS } from "@/lib/grammar/nouns-data";
import { RUSSIAN_NAMES } from "@/lib/grammar/names-data";
import { stripAccent } from "@/lib/grammar/decline";
import type { GlossedWord } from "./texts";

/**
 * Vérification des cas annoncés par l'IA dans un texte de lecture.
 *
 * C'était le dernier endroit de l'app où l'IA affirmait un fait grammatical
 * SANS filet : chaque mot d'un texte généré porte un tag de cas, et
 * ReadingPassage le colorie. Un tag faux enseignait donc une fausse analyse,
 * avec la même autorité visuelle que le module Cas — précisément ce qui a
 * été retiré partout ailleurs.
 *
 * On ne peut pas tout vérifier : un texte emploie n'importe quel mot, la
 * banque en contient 451. D'où trois états plutôt qu'un verdict binaire :
 *
 *   confirmé      la forme existe dans la banque ET le cas annoncé est
 *                 compatible avec elle → coloration pleine ;
 *   contredit     la forme existe dans la banque et le cas annoncé est
 *                 IMPOSSIBLE pour elle → le tag est retiré, silencieusement ;
 *   invérifiable  le mot n'est pas dans la banque → le tag est conservé mais
 *                 signalé comme une analyse non vérifiée.
 *
 * Conservateur par construction : on ne retire que ce qu'on peut prouver
 * faux. Le syncrétisme est géré en prenant l'UNION des cas possibles — книги
 * peut être un génitif singulier, un nominatif ou un accusatif pluriel, et
 * les trois sont acceptés.
 */

/** forme sans accent → ensemble des cas qu'elle peut porter, tous lemmes confondus. */
function buildFormIndex(): Map<string, Set<CaseId>> {
  const index = new Map<string, Set<CaseId>>();
  for (const noun of [...NOUNS, ...RUSSIAN_NAMES]) {
    for (const forms of [noun.forms.singular, noun.forms.plural]) {
      forms.forEach((accented, i) => {
        // Le ё est replié sur е ICI AUSSI, sinon l'index et la recherche ne
        // parlent pas la même langue.
        const bare = fold(accented);
        const set = index.get(bare) ?? new Set<CaseId>();
        set.add(CASE_ORDER[i]);
        index.set(bare, set);
      });
    }
  }
  return index;
}

const FORM_INDEX = buildFormIndex();

/**
 * Repli commun à l'index et à la recherche : minuscules, accent tonique
 * retiré, ё ramené à е, ponctuation ôtée.
 *
 * La ligne `.replace(/ё/g, "ё")` remplaçait ё PAR LUI-MÊME — les deux côtés
 * étaient le même caractère U+0451. Une ligne morte, et le repli qu'elle
 * était censée faire n'avait jamais lieu : un texte de lecture écrit
 * « ребенок » ne retrouvait pas « ребёнок » dans la banque, et son tag de
 * cas restait « invérifiable » au lieu d'être confirmé.
 *
 * Corriger la ligne seule n'aurait rien donné : l'index est bâti avec le
 * même repli, et il gardait le ё. Les deux devaient bouger ensemble.
 */
function fold(word: string): string {
  return stripAccent(word)
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z-]/gi, "");
}

const normalise = fold;

export type CaseTagStatus = "confirmed" | "unverified";

export interface VerificationReport {
  confirmed: number;
  contradicted: number;
  unverified: number;
}

/**
 * Passe un texte au crible. Renvoie les phrases nettoyées — tags contredits
 * retirés, tags confirmés marqués — et le compte de chaque état.
 */
export function verifyCaseTags(sentences: GlossedWord[][]): {
  sentences: GlossedWord[][];
  report: VerificationReport;
} {
  const report: VerificationReport = { confirmed: 0, contradicted: 0, unverified: 0 };

  const checked = sentences.map((sentence) =>
    sentence.map((word) => {
      if (!word.case) return word;
      const possible = FORM_INDEX.get(normalise(word.ru));
      if (!possible) {
        report.unverified += 1;
        return { ...word, caseStatus: "unverified" as CaseTagStatus };
      }
      if (!possible.has(word.case)) {
        // Contredit par la banque : on retire le tag plutôt que d'afficher
        // une analyse fausse. La glose, elle, reste.
        report.contradicted += 1;
        const stripped = { ...word };
        delete stripped.case;
        return stripped;
      }
      report.confirmed += 1;
      return { ...word, caseStatus: "confirmed" as CaseTagStatus };
    })
  );

  return { sentences: checked, report };
}

/** Nombre de formes indexées — utile aux contrôles et au diagnostic. */
export const INDEXED_FORMS = FORM_INDEX.size;
