import { CaseInfo } from "./types";
import type { CefrLevel } from "@/lib/supabase/types";

/**
 * Ordre d'ACQUISITION, distinct de la numérotation russe.
 *
 * Le tableau CASES ci-dessous garde l'ordre scolaire russe (И-Р-Д-В-Т-П,
 * `number` 1 à 6) : c'est celui des grammaires, et il sert de repère quand
 * on en consulte une. Mais ce n'est pas l'ordre dans lequel un francophone
 * les acquiert. Les manuels de russe langue étrangère et le syllabus ТРКИ
 * suivent celui-ci :
 *
 *   1. nominatif      forme du dictionnaire, это / вот
 *   2. prépositionnel в/на + lieu — il faut « j'habite à Moscou » tout de
 *                     suite, et sa morphologie est la plus simple (-е)
 *   3. accusatif      COD et direction ; peu coûteux, l'inanimé masculin et
 *                     le neutre sont identiques au nominatif
 *   4. génitif        у меня есть / нет, quantité
 *   5. datif          нравиться, âge, к, по
 *   6. instrumental   с, profession, заниматься
 *
 * `introducedAt` = niveau où le cas devient de saison. Il n'interdit RIEN :
 * il sert à recommander un ordre, et à signaler ce qui viendra plus tard.
 */
const LEARNING_ORDER: { id: string; introducedAt: CefrLevel }[] = [
  { id: "nominative", introducedAt: "A0" },
  { id: "prepositional", introducedAt: "A1" },
  { id: "accusative", introducedAt: "A1" },
  { id: "genitive", introducedAt: "A1" },
  { id: "dative", introducedAt: "A2" },
  { id: "instrumental", introducedAt: "A2" },
];

export const CASES: CaseInfo[] = [
  {
    id: "nominative",
    number: 1,
    nameRu: "Именительный",
    nameFr: "Nominatif",
    question: "кто? что?",
    usage: "Le sujet de la phrase. La forme du dictionnaire.",
    color: "#6B7280",
  },
  {
    id: "genitive",
    number: 2,
    nameRu: "Родительный",
    nameFr: "Génitif",
    question: "кого? чего?",
    usage: "Possession, absence (нет + génitif), quantité.",
    color: "#1C6E5C",
  },
  {
    id: "dative",
    number: 3,
    nameRu: "Дательный",
    nameFr: "Datif",
    question: "кому? чему?",
    usage: "Destinataire de l'action, âge (мне 20 лет).",
    color: "#B5762A",
  },
  {
    id: "accusative",
    number: 4,
    nameRu: "Винительный",
    nameFr: "Accusatif",
    question: "кого? что?",
    usage: "Complément d'objet direct, direction (в/на + mouvement).",
    color: "#8B2FA0",
  },
  {
    id: "instrumental",
    number: 5,
    nameRu: "Творительный",
    nameFr: "Instrumental",
    question: "кем? чем?",
    usage: "Moyen, instrument, accompagnement (с + instrumental).",
    color: "#2456A6",
  },
  {
    id: "prepositional",
    number: 6,
    nameRu: "Предложный",
    nameFr: "Prépositionnel",
    question: "о ком? о чём?",
    usage: "Toujours avec préposition : lieu (в/на), sujet (о).",
    color: "#6F4A2E",
  },
];

export function getCase(id: string): CaseInfo | undefined {
  return CASES.find((c) => c.id === id);
}

/** Les six cas dans l'ordre où on les apprend, avec leur niveau d'entrée. */
export const CASES_BY_LEARNING_ORDER: (CaseInfo & { introducedAt: CefrLevel })[] =
  LEARNING_ORDER.map((entry) => {
    const info = CASES.find((c) => c.id === entry.id);
    if (!info) throw new Error(`Cas inconnu dans l'ordre d'apprentissage : ${entry.id}`);
    return { ...info, introducedAt: entry.introducedAt };
  });
