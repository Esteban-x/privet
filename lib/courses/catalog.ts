import type { CefrLevel } from "@/lib/supabase/types";
import { lessonText, type Lesson, type Unit } from "./types";
import { UNIT_ECRITURE } from "./units/01-ecriture-et-sons";
import { UNIT_PREMIERES_PHRASES } from "./units/02-premieres-phrases";
import { UNIT_CAS } from "./units/03-les-six-cas";
import { UNIT_ADJECTIF } from "./units/04-adjectif";
import { UNIT_PRONOMS } from "./units/05-pronoms";
import { UNIT_VERBE } from "./units/06-verbe-formes";
import { UNIT_ASPECT } from "./units/07-aspect";
import { UNIT_MOUVEMENT } from "./units/08-verbes-de-mouvement";
import { UNIT_PARTICIPES } from "./units/09-participes";
import { UNIT_NOMBRES } from "./units/10-nombres-et-temps";
import { UNIT_PREPOSITIONS } from "./units/11-prepositions";
import { UNIT_SYNTAXE } from "./units/12-syntaxe";
import { UNIT_LEXIQUE } from "./units/13-lexique";
import { UNIT_REGISTRES } from "./units/14-registres";

/**
 * Le catalogue : l'ordre des unités EST le parcours conseillé.
 *
 * Une leçon n'appartient qu'à une unité, et son slug est unique dans tout le
 * catalogue — l'URL /cours/<slug> n'a donc pas à répéter l'unité, et
 * déplacer une leçon d'une unité à l'autre ne casse aucun lien.
 */
export const UNITS: Unit[] = [UNIT_ECRITURE, UNIT_PREMIERES_PHRASES, UNIT_CAS, UNIT_ADJECTIF, UNIT_PRONOMS, UNIT_VERBE, UNIT_ASPECT, UNIT_MOUVEMENT, UNIT_PARTICIPES, UNIT_NOMBRES, UNIT_PREPOSITIONS, UNIT_SYNTAXE, UNIT_LEXIQUE, UNIT_REGISTRES];

export interface LocatedLesson {
  lesson: Lesson;
  unit: Unit;
  /** Position dans le catalogue entier, pour « précédent / suivant ». */
  index: number;
}

/** Toutes les leçons à plat, dans l'ordre du parcours. */
export const LESSONS: LocatedLesson[] = UNITS.flatMap((unit) =>
  unit.lessons.map((lesson) => ({ lesson, unit, index: 0 }))
).map((entry, index) => ({ ...entry, index }));

const BY_SLUG = new Map(LESSONS.map((entry) => [entry.lesson.slug, entry]));

export function findLesson(slug: string): LocatedLesson | undefined {
  return BY_SLUG.get(slug);
}

export function neighbours(slug: string): {
  previous: LocatedLesson | null;
  next: LocatedLesson | null;
} {
  const entry = BY_SLUG.get(slug);
  if (!entry) return { previous: null, next: null };
  return {
    previous: LESSONS[entry.index - 1] ?? null,
    next: LESSONS[entry.index + 1] ?? null,
  };
}

export const TOTAL_LESSONS = LESSONS.length;
export const TOTAL_MINUTES = LESSONS.reduce((sum, e) => sum + e.lesson.minutes, 0);

/**
 * Normalisation de recherche : minuscules, sans accents.
 *
 * Elle retire l'accent tonique russe (U+0301) comme les diacritiques
 * français, si bien que « declinaison » trouve « déclinaison » et
 * « ударение » trouve « ударе́ние ». Sans elle, la recherche échouerait
 * précisément sur les mots que ce site prend soin d'accentuer.
 */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, " ")
    .trim();
}

/** Ce que le composant de recherche reçoit — volontairement léger. */
export interface LessonIndexEntry {
  slug: string;
  title: string;
  titleRu: string;
  level: CefrLevel;
  minutes: number;
  summary: string;
  unitSlug: string;
  unitTitle: string;
  unitColor: string;
  /** Rang dans le catalogue : sert à trier à égalité de score. */
  index: number;
  /** Champs normalisés, prêts à comparer côté client. */
  haystack: { title: string; keywords: string; body: string };
}

/**
 * Index de recherche.
 *
 * Le texte complet des leçons ne part PAS au navigateur : une centaine de
 * leçons rédigées pèsent quelques centaines de kilo-octets, à télécharger
 * pour filtrer trois lignes. On envoie le titre, le résumé, les mots-clés,
 * les titres de sections et les points-clés — assez pour retrouver une
 * leçon par son contenu, sans embarquer le cours lui-même.
 */
export function buildSearchIndex(): LessonIndexEntry[] {
  return LESSONS.map(({ lesson, unit, index }) => {
    const body: string[] = [lesson.summary];
    for (const section of lesson.sections) {
      if (section.title) body.push(section.title);
      if (section.kind === "keypoints") body.push(...section.items);
    }
    return {
      slug: lesson.slug,
      title: lesson.title,
      titleRu: lesson.titleRu,
      level: lesson.level,
      minutes: lesson.minutes,
      summary: lesson.summary,
      unitSlug: unit.slug,
      unitTitle: unit.title,
      unitColor: unit.color,
      index,
      haystack: {
        title: normalize(`${lesson.title} ${lesson.titleRu}`),
        keywords: normalize(lesson.keywords.join(" ")),
        body: normalize(body.join(" ")),
      },
    };
  });
}

/** Texte intégral d'une leçon — vérifications et statistiques, côté serveur. */
export function fullText(lesson: Lesson): string {
  return lessonText(lesson);
}
