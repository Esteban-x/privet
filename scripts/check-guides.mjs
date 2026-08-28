/**
 * Contrôles du module « Guides » — `npm run check:guides`.
 *
 * Les guides sont les seules pages du site écrites POUR les moteurs autant
 * que pour les lecteurs, et c'est précisément ce qui les rend fragiles : une
 * erreur y est invisible depuis le navigateur. Un `related` qui pointe vers
 * un slug renommé n'affiche simplement pas le lien. Un titre à 84 signes
 * s'affiche entier chez nous et tronqué dans les résultats de recherche. Un
 * lien vers /exercices s'ouvre parfaitement quand on est connecté — et
 * renvoie un robot, qui ne l'est jamais, sur la page de connexion.
 *
 * Rien de tout cela ne casse la compilation ni ne se voit à la relecture.
 * D'où ce script, qui vérifie les cinq choses que le typage ne peut pas :
 *
 * 1. INTÉGRITÉ : slugs uniques, bien formés, et sans collision avec un slug
 *    de leçon — /guides/x et /cours/x sont deux URL distinctes, mais deux
 *    pages homonymes finissent toujours par se faire concurrence.
 * 2. LONGUEURS : titre et description dans ce qu'un moteur affiche. Au-delà,
 *    la fin de la phrase est écrite pour personne.
 * 3. MAILLAGE : `related` ne pointe que vers des guides existants, jamais
 *    vers soi-même, et AUCUN guide n'est orphelin — un guide que personne ne
 *    cite n'est atteignable que par le plan du site, ce qui est le minimum
 *    vital, pas une position.
 * 4. LIENS SORTANTS : chaque `next` vise une route réellement servie par
 *    app/, et PUBLIQUE. La liste des routes protégées n'est pas recopiée
 *    ici : elle est lue dans app/robots.ts, seule source de vérité.
 * 5. ÉDITORIAL : la réponse courte existe et est assez substantielle pour
 *    valoir un extrait, les sections ont un titre et du texte.
 */
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });

const { GUIDES } = await jiti.import("../lib/seo/guides.ts");
const { LESSONS } = await jiti.import("../lib/courses/catalog.ts");
const { CASES } = await jiti.import("../lib/grammar/cases.ts");
const robots = (await jiti.import("../app/robots.ts")).default;

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

/**
 * Les limites d'affichage des moteurs, en signes.
 *
 * Ce ne sont pas des règles officielles — Google coupe en pixels, pas en
 * caractères — mais des seuils de sécurité qui tiennent pour du français en
 * casse normale. Les dépasser ne pénalise rien : ça tronque, et c'est la
 * fin de la phrase, donc souvent l'argument, qui disparaît.
 */
const MAX_TITLE = 70;
const MAX_DESCRIPTION = 160;
/** En dessous, la « réponse courte » ne peut pas décrocher un extrait. */
const MIN_ANSWER = 120;

// ── Ce que les moteurs n'ont pas le droit d'explorer ────────────────────
// Lu dans app/robots.ts plutôt que recopié : le jour où une route passe
// derrière l'authentification, elle entre dans cette liste et les guides qui
// y renvoyaient tombent ici, au lieu d'envoyer les robots sur /login.
const disallow = robots().rules.flatMap((rule) => rule.disallow ?? []);

/** Une route est-elle interdite d'exploration ? */
function isBlocked(href) {
  return disallow.some((rule) =>
    // « /alphabet/ » interdit la descendance sans toucher à /alphabet.
    rule.endsWith("/") ? href.startsWith(rule) : href === rule || href.startsWith(`${rule}/`)
  );
}

/**
 * Une route est-elle réellement servie ?
 *
 * Les pages dynamiques ne peuvent pas se vérifier par l'existence d'un
 * fichier : /cours/genitif-pluriel n'existe que si le slug est au catalogue.
 * On traite donc les trois familles dynamiques par leurs données, et le
 * reste par app/<chemin>/page.tsx.
 */
const lessonSlugs = new Set(LESSONS.map(({ lesson }) => lesson.slug));
const caseIds = new Set(CASES.map((c) => c.id));
const guideSlugs = new Set(GUIDES.map((g) => g.slug));

function routeExists(href) {
  const lesson = href.match(/^\/cours\/([^/]+)$/);
  if (lesson) return lessonSlugs.has(lesson[1]);

  const caseMatch = href.match(/^\/cases\/([^/]+)$/);
  if (caseMatch) return caseIds.has(caseMatch[1]);

  const guide = href.match(/^\/guides\/([^/]+)$/);
  if (guide) return guideSlugs.has(guide[1]);

  const segments = href.replace(/^\//, "");
  const dir = segments === "" ? ROOT + "/app" : path.join(ROOT, "app", segments);
  return fs.existsSync(path.join(dir, "page.tsx"));
}

// ── 1. Intégrité ────────────────────────────────────────────────────────
const seen = new Set();
for (const guide of GUIDES) {
  const g = `guide « ${guide.slug} »`;
  require_(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(guide.slug), `${g} : slug mal formé`);
  require_(!seen.has(guide.slug), `${g} : slug en double`);
  seen.add(guide.slug);
  require_(
    !lessonSlugs.has(guide.slug),
    `${g} : ce slug est déjà celui d'une leçon — /guides et /cours se feraient concurrence`
  );
  require_(guide.h1.trim().length > 0, `${g} : h1 vide`);
  // Pas de contrôle « le h1 est-il une question ». La plupart le sont, parce
  // que c'est la forme sous laquelle on tape ; mais « Les 6 erreurs que font
  // tous les francophones » est une requête aussi réelle, et ce n'en est pas
  // une. Imposer le point d'interrogation forcerait à déformer des titres
  // corrects.
  require_(guide.lede.trim().length > 0, `${g} : chapô vide`);
}

// ── 2. Longueurs d'affichage ────────────────────────────────────────────
for (const guide of GUIDES) {
  const g = `guide « ${guide.slug} »`;
  // « — Privetik » est ajouté par le gabarit du layout : il compte.
  const shown = `${guide.title} — Privetik`.length;
  require_(shown <= MAX_TITLE, `${g} : titre à ${shown} signes, marque comprise (max ${MAX_TITLE})`);
  require_(
    guide.description.length <= MAX_DESCRIPTION,
    `${g} : description à ${guide.description.length} signes (max ${MAX_DESCRIPTION})`
  );
  require_(
    guide.answer.length >= MIN_ANSWER,
    `${g} : réponse courte à ${guide.answer.length} signes — trop brève pour un extrait`
  );
}

// ── 3. Maillage entre guides ────────────────────────────────────────────
const citedBy = new Map(GUIDES.map((g) => [g.slug, 0]));
for (const guide of GUIDES) {
  const g = `guide « ${guide.slug} »`;
  const related = new Set();
  for (const slug of guide.related) {
    require_(guideSlugs.has(slug), `${g} : related pointe vers « ${slug} », qui n'existe pas`);
    require_(slug !== guide.slug, `${g} : related se pointe lui-même`);
    require_(!related.has(slug), `${g} : related cite « ${slug} » deux fois`);
    related.add(slug);
    citedBy.set(slug, (citedBy.get(slug) ?? 0) + 1);
  }
  // Les liens internes des sections « next » comptent aussi comme citations.
  for (const item of guide.next) {
    const match = item.href.match(/^\/guides\/([^/]+)$/);
    if (match) citedBy.set(match[1], (citedBy.get(match[1]) ?? 0) + 1);
  }
}
for (const [slug, count] of citedBy) {
  require_(count > 0, `guide « ${slug} » : orphelin — aucun autre guide ne le cite`);
}

// ── 4. Liens sortants ───────────────────────────────────────────────────
for (const guide of GUIDES) {
  const g = `guide « ${guide.slug} »`;
  require_(guide.next.length >= 1, `${g} : aucune porte vers l'app`);
  for (const item of guide.next) {
    require_(item.href.startsWith("/"), `${g} : lien externe dans « next » (${item.href})`);
    require_(routeExists(item.href), `${g} : « next » pointe vers ${item.href}, qui n'existe pas`);
    require_(
      !isBlocked(item.href),
      `${g} : « next » pointe vers ${item.href}, interdite d'exploration — un robot y trouvera /login`
    );
    require_(item.label.trim().length > 0, `${g} : porte sans libellé`);
    require_(item.detail.trim().length > 0, `${g} : porte sans description`);
  }
}

// ── 5. Éditorial ────────────────────────────────────────────────────────
for (const guide of GUIDES) {
  const g = `guide « ${guide.slug} »`;
  require_(guide.sections.length >= 3, `${g} : moins de trois sections`);
  for (const section of guide.sections) {
    const s = `${g}, section « ${section.title} »`;
    require_(section.title?.trim().length > 0, `${g} : section sans titre`);
    require_(section.paragraphs.length >= 1, `${s} : aucun paragraphe`);
    // LE PLANCHER EST BAS, ET C'EST VOLONTAIRE. La première version de ce
    // contrôle exigeait soixante signes, et il a immédiatement condamné deux
    // phrases justes : « L'ordre utile est différent : », qui annonce une
    // liste, et « Trois choses, et aucune n'est le vocabulaire. », qui ouvre
    // une section. Une phrase courte est un outil de rédaction, pas un
    // défaut. Ce qu'on cherche ici est plus bête et plus réel : le
    // paragraphe vide, la note laissée en place, le fragment collé de
    // travers. Vingt-cinq signes suffisent à les attraper tous les trois
    // sans jamais réclamer de délayer une bonne phrase.
    for (const paragraph of section.paragraphs) {
      const length = paragraph.trim().length;
      require_(length >= 25, `${s} : paragraphe à ${length} signes — fragment ou note oubliée`);
    }
    for (const bullet of section.bullets ?? []) {
      require_(bullet.lead.trim().length > 0, `${s} : puce sans intitulé`);
      require_(bullet.body.trim().length > 0, `${s} : puce sans texte`);
    }
  }
}

// ── Verdict ─────────────────────────────────────────────────────────────
const words = GUIDES.reduce(
  (sum, g) =>
    sum +
    g.sections.reduce(
      (n, s) =>
        n +
        s.paragraphs.join(" ").split(/\s+/).length +
        (s.bullets ?? []).reduce((b, x) => b + x.body.split(/\s+/).length, 0),
      0
    ),
  0
);

if (failures.length > 0) {
  console.error(`\nGuides : ${failures.length} problème(s) sur ${checks} contrôles.\n`);
  for (const failure of failures) console.error(`  • ${failure}`);
  process.exit(1);
}

console.log(`Guides : ${GUIDES.length} pages, ~${words} mots.`);
console.log(`${checks} contrôles passés.`);
