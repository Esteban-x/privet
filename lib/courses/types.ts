import type { CefrLevel } from "@/lib/supabase/types";

/**
 * Le modèle de contenu du module « Cours ».
 *
 * L'app n'avait que des exercices : elle faisait pratiquer une règle sans
 * jamais l'énoncer. Ce module est la moitié manquante — le programme
 * complet du russe, de l'alphabet aux registres littéraires, rédigé ici et
 * relié aux exercices existants.
 *
 * POURQUOI DES BLOCS TYPÉS, ET PAS DU MARKDOWN. Une leçon de russe est faite
 * à 60 % de tableaux de formes et d'exemples traduits, deux choses qu'un
 * texte libre rend mal : le tableau doit défiler horizontalement sur
 * téléphone sans casser la page, l'exemple doit aligner le russe et le
 * français et laisser la police cyrillique poser ses accents toniques. En
 * blocs, chaque type a son rendu, et le contenu reste vérifiable par script
 * (scripts/check-courses.mjs) plutôt que relu à l'œil.
 */

/** Paragraphes d'explication. Un élément = un paragraphe. */
export interface ProseSection {
  kind: "prose";
  title?: string;
  body: string[];
}

/** Tableau de formes (déclinaison, conjugaison, correspondances). */
export interface TableSection {
  kind: "table";
  title?: string;
  head: string[];
  rows: string[][];
  note?: string;
}

/** Phrases russes et leur traduction, avec au besoin une remarque. */
export interface ExamplesSection {
  kind: "examples";
  title?: string;
  items: { ru: string; fr: string; note?: string }[];
}

/** L'erreur que fait un francophone, et ce qui la produit. */
export interface PitfallSection {
  kind: "pitfall";
  title?: string;
  body: string[];
}

/** Ce qu'il faut retenir si on ne retient qu'une chose. */
export interface KeypointsSection {
  kind: "keypoints";
  title?: string;
  items: string[];
}

export type Section =
  | ProseSection
  | TableSection
  | ExamplesSection
  | PitfallSection
  | KeypointsSection;

export interface PracticeLink {
  /** Route interne d'un module d'exercices existant. Vérifiée par le script. */
  href: string;
  label: string;
}

export interface Lesson {
  /** Identifiant d'URL : /cours/<slug>. Unique dans tout le catalogue. */
  slug: string;
  title: string;
  /** Le terme russe de la notion — c'est celui qu'on retrouvera partout ailleurs. */
  titleRu: string;
  level: CefrLevel;
  /** Durée de lecture annoncée, en minutes. */
  minutes: number;
  /** Une à deux phrases : ce que la leçon règle. Sert aussi de résultat de recherche. */
  summary: string;
  /** Termes que quelqu'un taperait pour trouver cette leçon, y compris en russe. */
  keywords: string[];
  /**
   * Le titre et la description que les moteurs affichent, quand le titre de
   * la leçon ne suffit pas.
   *
   * PAR DÉFAUT, IL N'Y EN A PAS. La page de leçon fabrique
   * « <titre> — cours de russe » à partir du titre, et pour 125 leçons sur
   * 130 c'est exactement ce qu'il faut : personne ne cherche « le génitif de
   * négation » autrement qu'en le nommant.
   *
   * LA POIGNÉE D'EXCEPTIONS EST TOUJOURS LA MÊME. Une leçon dont le titre est
   * la formulation SAVANTE d'une notion que les gens désignent autrement.
   * « L'alphabet cyrillique » est le nom juste ; « alphabet russe » est ce qui
   * se tape, et « prononciation » est ce qu'on cherche vraiment en le tapant.
   * Le titre de la leçon reste le nom juste — il s'affiche dans le cours, où
   * la précision compte — et ce champ dit l'autre nom, celui du dehors.
   *
   * CE N'EST PAS UN ENDROIT OÙ EMPILER DES MOTS-CLÉS. Un titre doit rester une
   * phrase qu'on lirait à voix haute, sous 60 signes de préférence, et décrire
   * honnêtement la page : un titre qui promet plus que la leçon ne donne fait
   * repartir le visiteur en trois secondes, ce qu'un moteur voit et retient.
   */
  seo?: { title?: string; description?: string };
  practice?: PracticeLink[];
  sections: Section[];
}

export interface Unit {
  slug: string;
  title: string;
  titleRu: string;
  /** Une phrase : à quoi sert cette unité dans le parcours. */
  subtitle: string;
  /** Couleur de la tuile, dans la palette du projet. */
  color: string;
  lessons: Lesson[];
}

/** Le texte brut d'une leçon — index de recherche et vérifications. */
export function lessonText(lesson: Lesson): string {
  const parts: string[] = [lesson.title, lesson.titleRu, lesson.summary, ...lesson.keywords];
  for (const section of lesson.sections) {
    if (section.title) parts.push(section.title);
    switch (section.kind) {
      case "prose":
      case "pitfall":
        parts.push(...section.body);
        break;
      case "table":
        parts.push(...section.head, ...section.rows.flat());
        if (section.note) parts.push(section.note);
        break;
      case "examples":
        for (const item of section.items) {
          parts.push(item.ru, item.fr);
          if (item.note) parts.push(item.note);
        }
        break;
      case "keypoints":
        parts.push(...section.items);
        break;
    }
  }
  return parts.join(" ");
}
