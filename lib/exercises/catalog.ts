import { CASES } from "@/lib/grammar/cases";
import { MOTION_SKILLS } from "@/lib/motion/exercises";
import { ASPECT_SKILLS } from "@/lib/aspect/exercises";
import { PARTICIPLE_SKILLS } from "@/lib/participles/exercises";
import { ADJECTIVE_SKILLS } from "@/lib/adjectives/exercises";
import { NUMBER_SKILLS } from "@/lib/numbers/exercises";
import { CONJUGATION_SKILLS } from "@/lib/conjugation/exercises";
import { ALPHABET_SKILLS } from "@/lib/alphabet/exercises";
import { MODULE_COLORS } from "@/lib/exercises/colors";
import type { Skill } from "@/lib/exercises/types";

/**
 * Le catalogue des modules d'exercices — ce que la page /exercices affiche.
 *
 * Il décrit les modules SANS les faire dépendre les uns des autres : chacun
 * garde sa banque, sa route et sa correction. Ce qui est centralisé ici,
 * c'est ce qu'il faut pour les présenter côte à côte et lire leur
 * progression, y compris pour les cinq premiers, dont chacun a sa propre
 * table historique.
 *
 * Les familles ne sont pas décoratives : elles disent quel savoir un module
 * travaille, et ce sont elles qui rendent la page lisible quand les modules
 * se multiplient.
 */

export type ModuleFamily = "Sons et écriture" | "Le nom" | "Le verbe" | "Chiffres et temps";

export interface ProgressSource {
  /** Table dédiée (les cinq premiers modules) ou table partagée. */
  table: string;
  /** Colonne qui porte l'identifiant de compétence. */
  column: string;
  /** Renseigné seulement pour la table partagée. */
  moduleId?: string;
}

export interface ExerciseModuleEntry {
  id: string;
  href: string;
  title: string;
  titleRu: string;
  /** Une phrase : ce que le module fait travailler, et pourquoi c'est difficile. */
  blurb: string;
  family: ModuleFamily;
  color: string;
  skills: Skill[];
  progress: ProgressSource;
  /** L'unité du cours qui explique ce que le module fait pratiquer. */
  lesson: { href: string; label: string };
}

/** Les six cas ne portent pas la même forme que les autres compétences. */
const CASE_SKILLS: Skill[] = CASES.map((c) => ({
  id: c.id,
  title: c.nameFr,
  level: c.id === "nominative" ? "A0" : c.id === "dative" || c.id === "instrumental" ? "A2" : "A1",
  summary: `${c.question} — ${c.usage}`,
}));

export const EXERCISE_MODULES: ExerciseModuleEntry[] = [
  {
    id: "alphabet",
    href: "/alphabet",
    title: "Lire et écrire",
    titleRu: "Чтение и письмо",
    blurb:
      "Déchiffrer le cyrillique, désamorcer les six lettres qui trompent, placer l'accent et entendre ce qui est réellement prononcé.",
    family: "Sons et écriture",
    color: MODULE_COLORS.alphabet,
    skills: ALPHABET_SKILLS,
    progress: { table: "exercise_progress", column: "skill_id", moduleId: "alphabet" },
    lesson: { href: "/cours/alphabet-cyrillique", label: "Unité 1 · Écriture et sons" },
  },
  {
    id: "cases",
    href: "/cases",
    title: "Les six cas",
    titleRu: "Падежи",
    blurb:
      "La déclinaison du nom, cas par cas : ce que devient un mot selon sa fonction dans la phrase.",
    family: "Le nom",
    color: MODULE_COLORS.cases,
    skills: CASE_SKILLS,
    progress: { table: "case_progress", column: "case_id" },
    lesson: { href: "/cours/a-quoi-servent-les-cas", label: "Unité 3 · Le nom et ses six cas" },
  },
  {
    id: "adjectives",
    href: "/adjectives",
    title: "Accord de l'adjectif",
    titleRu: "Согласование прилагательных",
    blurb:
      "Genre, nombre et cas portés par le même mot : repérer dans une phrase ce sur quoi l'adjectif s'accorde.",
    family: "Le nom",
    color: MODULE_COLORS.adjectives,
    skills: [...ADJECTIVE_SKILLS],
    progress: { table: "adjective_progress", column: "skill_id" },
    lesson: { href: "/cours/accord-de-l-adjectif", label: "Unité 4 · L'adjectif" },
  },
  {
    id: "conjugation",
    href: "/conjugation",
    title: "Conjugaison",
    titleRu: "Спряжение",
    blurb:
      "Deux conjugaisons que l'infinitif ne permet pas de deviner, des alternances de consonnes, et un accent qui se déplace au passé.",
    family: "Le verbe",
    color: MODULE_COLORS.conjugation,
    skills: CONJUGATION_SKILLS,
    progress: { table: "exercise_progress", column: "skill_id", moduleId: "conjugation" },
    lesson: { href: "/cours/present-premiere-conjugaison", label: "Unité 6 · Le verbe" },
  },
  {
    id: "aspect",
    href: "/aspect",
    title: "Aspect verbal",
    titleRu: "Вид глагола",
    blurb:
      "Imperfectif ou perfectif : la catégorie que le français n'a pas, et qu'il faut trancher à chaque phrase.",
    family: "Le verbe",
    color: MODULE_COLORS.aspect,
    skills: [...ASPECT_SKILLS],
    progress: { table: "aspect_progress", column: "skill_id" },
    lesson: { href: "/cours/aspect-le-principe", label: "Unité 7 · L'aspect" },
  },
  {
    id: "motion",
    href: "/motion",
    title: "Verbes de mouvement",
    titleRu: "Глаголы движения",
    blurb:
      "Deux séries, à pied ou en véhicule, plus une douzaine de préfixes qui changent le sens et le cas qui suit.",
    family: "Le verbe",
    color: MODULE_COLORS.motion,
    skills: [...MOTION_SKILLS],
    progress: { table: "motion_progress", column: "skill_id" },
    lesson: { href: "/cours/deux-series", label: "Unité 8 · Verbes de mouvement" },
  },
  {
    id: "participles",
    href: "/participles",
    title: "Participes et gérondifs",
    titleRu: "Причастия и деепричастия",
    blurb:
      "Les formes qui compriment une proposition entière en un mot — omniprésentes à l'écrit, absentes de l'oral.",
    family: "Le verbe",
    color: MODULE_COLORS.participles,
    skills: [...PARTICIPLE_SKILLS],
    progress: { table: "participle_progress", column: "skill_id" },
    lesson: { href: "/cours/participes-vue-d-ensemble", label: "Unité 9 · Participes" },
  },
  {
    id: "numbers",
    href: "/numbers",
    title: "Nombres, heure et dates",
    titleRu: "Числительные",
    blurb:
      "Ce qu'un nombre fait au mot qui suit, et une façon de dire l'heure qui décale d'un cran tous les réflexes français.",
    family: "Chiffres et temps",
    color: MODULE_COLORS.numbers,
    skills: NUMBER_SKILLS,
    progress: { table: "exercise_progress", column: "skill_id", moduleId: "numbers" },
    lesson: { href: "/cours/accord-apres-les-nombres", label: "Unité 10 · Nombres et temps" },
  },
];

export const FAMILY_ORDER: ModuleFamily[] = [
  "Sons et écriture",
  "Le nom",
  "Le verbe",
  "Chiffres et temps",
];

/** Les niveaux couverts par un module, dans l'ordre du CECRL. */
export function moduleLevels(entry: ExerciseModuleEntry): string[] {
  const order = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const found = new Set(entry.skills.map((s) => s.level));
  return order.filter((level) => found.has(level));
}

export const TOTAL_SKILLS = EXERCISE_MODULES.reduce((sum, m) => sum + m.skills.length, 0);
