import { absolute, siteUrl } from "./site";

/**
 * Les données structurées, en JSON-LD.
 *
 * À QUOI ÇA SERT VRAIMENT. Un moteur lit une page comme du texte : il devine
 * que « 16,99 € » est un prix et que « Apprendre le russe » est une
 * formation. Le JSON-LD le lui DIT, dans un vocabulaire (schema.org) qu'il
 * n'a pas à interpréter. Ce n'est pas un facteur de classement en soi —
 * Google est explicite là-dessus — mais c'est ce qui débloque les
 * présentations enrichies : les questions dépliables sous un résultat, le
 * prix affiché à côté du lien, le fil d'Ariane à la place de l'URL. À
 * position égale, un résultat enrichi prend deux fois plus de place et
 * capte bien plus de clics.
 *
 * RÈGLE ABSOLUE : ne décrire que ce qui est VISIBLE sur la page. Annoncer une
 * FAQ que le visiteur ne trouve pas, ou un prix qui n'est affiché nulle part,
 * fait retirer la présentation enrichie — et parfois toute la confiance
 * accordée au site. Les questions ci-dessous sont donc reprises mot pour mot
 * de app/premium/page.tsx, et le prix vient de la même constante qu'elle.
 */

const ORGANIZATION_ID = `${siteUrl()}/#organization`;
const WEBSITE_ID = `${siteUrl()}/#website`;

/** L'éditeur. Référencé par tous les autres blocs plutôt que recopié. */
export function organization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Privetik",
    url: siteUrl(),
    logo: absolute("/logo-512.png"),
    description:
      "Application francophone d'apprentissage du russe, centrée sur les cas, " +
      "l'aspect verbal et les verbes de mouvement.",
  };
}

export function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteUrl(),
    name: "Privetik",
    inLanguage: "fr-FR",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Le cours lui-même.
 *
 * C'est le bloc qui compte pour « apprendre le russe » : il dit à un moteur
 * que ce site EST une formation, avec une matière, une langue enseignée et un
 * niveau — et non un blog qui en parle. `teaches` et `educationalLevel` sont
 * ce que Google utilise pour rapprocher la page d'une intention
 * d'apprentissage plutôt que d'une intention de lecture.
 *
 * `hasCourseInstance` est obligatoire depuis 2024 pour prétendre à la
 * présentation enrichie « Cours » : sans lui, le bloc est lu mais jamais
 * affiché.
 */
export function course(params: { lessons: number; levels: string[] }) {
  return {
    "@type": "Course",
    "@id": `${siteUrl()}/#course`,
    name: "Apprendre le russe — cours complet et exercices",
    description:
      "Cours de russe en français : alphabet, six cas, aspect verbal, verbes de mouvement, " +
      "participes et gérondifs. Exercices corrigés par un moteur de règles déterministe et " +
      `vocabulaire en répétition espacée. ${params.lessons} leçons, du niveau A0 au C2.`,
    provider: { "@id": ORGANIZATION_ID },
    inLanguage: "fr-FR",
    // La langue ENSEIGNÉE, distincte de celle de l'interface. Sans cette
    // ligne, un moteur classe le site comme un contenu francophone
    // généraliste et non comme un cours de russe.
    teaches: [
      "Langue russe",
      "Alphabet cyrillique",
      "Déclinaison russe",
      "Aspect verbal russe",
      "Verbes de mouvement russes",
      "Vocabulaire russe",
    ],
    educationalLevel: params.levels.join(", "),
    isAccessibleForFree: true,
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        // « À son rythme » : il n'y a ni session ni date, et le déclarer
        // autrement serait faux.
        courseMode: "online",
        courseWorkload: "PT19H",
        inLanguage: "fr-FR",
      },
    ],
  };
}

/**
 * Une leçon du cours.
 *
 * `LearningResource` plutôt qu'`Article` : les deux décrivent un texte, mais
 * seul le premier porte le niveau, la durée et le fait que le contenu SERT à
 * apprendre. C'est ce qui rapproche la page d'une intention « je veux
 * apprendre » plutôt que « je veux lire à propos de ».
 *
 * `isPartOf` la rattache au cours déclaré sur l'accueil : les 130 leçons
 * cessent d'être 130 pages sans lien pour devenir un programme, ce qu'elles
 * sont.
 */
export function learningResource(lesson: {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  level: string;
  unitTitle: string;
}) {
  return {
    "@type": "LearningResource",
    "@id": absolute(`/cours/${lesson.slug}#lesson`),
    url: absolute(`/cours/${lesson.slug}`),
    name: lesson.title,
    description: lesson.summary,
    inLanguage: "fr-FR",
    teaches: `${lesson.unitTitle} — ${lesson.title}`,
    educationalLevel: lesson.level,
    learningResourceType: "Leçon",
    timeRequired: `PT${lesson.minutes}M`,
    isAccessibleForFree: true,
    isPartOf: { "@id": `${siteUrl()}/#course` },
    provider: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Un cas grammatical.
 *
 * Même logique, appliquée à la page de référence : elle enseigne UN point
 * précis, et c'est ce point que les gens tapent (« génitif russe »,
 * « instrumental russe terminaisons »).
 */
export function grammarResource(params: {
  path: string;
  name: string;
  description: string;
  teaches: string;
}) {
  return {
    "@type": "LearningResource",
    "@id": absolute(`${params.path}#resource`),
    url: absolute(params.path),
    name: params.name,
    description: params.description,
    inLanguage: "fr-FR",
    teaches: params.teaches,
    learningResourceType: "Fiche de grammaire",
    isAccessibleForFree: true,
    isPartOf: { "@id": `${siteUrl()}/#course` },
    provider: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Le fil d'Ariane.
 *
 * Il remplace l'URL sous le titre dans les résultats : « Privetik › Cours ›
 * L'alphabet cyrillique » se lit, « privetik.app/cours/alphabet-cyrillique »
 * non. Sur mobile, où l'URL est tronquée, c'est la différence entre savoir
 * et deviner où mène le lien.
 */
export function breadcrumb(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: absolute(step.path),
    })),
  };
}

/** L'abonnement, tel que la page de prix l'annonce. */
export function subscriptionOffer(priceEur: number) {
  return {
    "@type": "Product",
    "@id": `${siteUrl()}/#premium`,
    name: "Privetik Pro",
    description:
      "Abonnement mensuel : exercices et révisions sans compteur quotidien, textes de lecture " +
      "générés à votre niveau, fiches de mots détaillées et prononciation par voix native.",
    brand: { "@id": ORGANIZATION_ID },
    offers: {
      "@type": "Offer",
      price: priceEur.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: absolute("/premium"),
    },
  };
}

/**
 * Les questions de la page de prix.
 *
 * Reprises telles quelles : le texte ci-dessous doit correspondre à ce que le
 * visiteur lit. Les réponses sont raccourcies — schema.org l'autorise, à
 * condition de ne rien affirmer qui ne soit sur la page.
 */
export function faq(entries: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${siteUrl()}/premium#faq`,
    mainEntity: entries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/**
 * Emballe plusieurs blocs dans un seul graphe.
 *
 * `@graph` plutôt que plusieurs balises <script> : les blocs se référencent
 * entre eux par `@id` (le cours pointe vers son éditeur, l'offre vers sa
 * marque), et un moteur ne résout ces liens de façon fiable qu'à l'intérieur
 * d'un même document.
 */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
