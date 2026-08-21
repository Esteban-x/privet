import { CaseInfo } from "./types";

export const CASES: CaseInfo[] = [
  {
    id: "nominative",
    number: 1,
    nameRu: "Именительный",
    nameFr: "Nominatif",
    question: "кто? что?",
    usage: "Le sujet de la phrase. La forme du dictionnaire.",
    color: "#C41E3A",
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
    color: "#4A4A4A",
  },
];

export function getCase(id: string): CaseInfo | undefined {
  return CASES.find((c) => c.id === id);
}
