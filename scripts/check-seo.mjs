/**
 * Contrôles de référencement — `npm run check:seo`.
 *
 * TROIS FICHIERS DÉCRIVENT LE MÊME SITE À TROIS PUBLICS, ET RIEN NE LES
 * OBLIGEAIT À DIRE LA MÊME CHOSE.
 *
 *   app/sitemap.ts  ce qu'on ANNONCE aux moteurs
 *   app/robots.ts   ce qu'on les AUTORISE à ouvrir
 *   proxy.ts        ce qu'un visiteur déconnecté PEUT réellement voir
 *
 * Ils sont d'accord aujourd'hui. Ils se contrediront le jour où une page
 * passera derrière l'authentification sans sortir du plan du site — et ce
 * jour-là rien ne cassera : le site se compilera, s'affichera, et se
 * contentera d'envoyer les robots sur une page de connexion en leur ayant
 * promis une leçon. Un moteur qui rencontre ça trop souvent cesse de relire
 * le plan.
 *
 * Ce script fait donc parler les trois ensemble, et ajoute deux vérifications
 * que personne ne fait à l'œil :
 *
 * 1. COHÉRENCE : toute URL annoncée au plan existe, est publique, et est
 *    explorable. Les trois à la fois.
 * 2. EXHAUSTIVITÉ : toute page publique et explorable est au plan. L'oubli
 *    est silencieux dans l'autre sens aussi.
 * 3. ORPHELINES : toute page publique reçoit au moins un lien d'une AUTRE
 *    page. /conjugation et /numbers n'en recevaient aucun — annoncées au
 *    plan, jamais recommandées par le site lui-même, ce qui est la position
 *    la plus faible qu'une page puisse occuper.
 * 4. ADRESSE CANONIQUE : toute page publique déclare la sienne. Sans ça elle
 *    hériterait de celle du layout, et se déclarerait double de l'accueil.
 * 5. TITRES : chaque page en déclare un, et aucune n'écrit « — Privetik » à la
 *    main. Les deux moitiés de la règle ont trouvé des défauts réels :
 *    treize pages écrivaient la marque que le gabarit ajoute déjà, et
 *    quatorze n'avaient pas de titre du tout — elles portaient donc celui de
 *    l'accueil, jusqu'à quatre onglets identiques côte à côte.
 */
import { createJiti } from "jiti";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageFileFor } from "./lib/routes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT } });

const sitemap = (await jiti.import("../app/sitemap.ts")).default;
const robots = (await jiti.import("../app/robots.ts")).default;

const failures = [];
let checks = 0;
function require_(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

// ── Les trois sources, lues et non recopiées ────────────────────────────
const declared = sitemap().map((entry) => {
  const url = new URL(entry.url);
  return url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
});

const disallow = robots().rules.flatMap((rule) => rule.disallow ?? []);
function isBlocked(route) {
  return disallow.some((rule) =>
    // « /alphabet/ » interdit la descendance sans toucher à /alphabet.
    rule.endsWith("/") ? route.startsWith(rule) : route === rule || route.startsWith(`${rule}/`)
  );
}

/**
 * Les chemins publics, lus dans proxy.ts.
 *
 * PAR ANALYSE DU TEXTE, ET C'EST ASSUMÉ. proxy.ts est un middleware Next :
 * l'importer entraîne le client Supabase et les entêtes de requête, pour
 * récupérer deux tableaux de chaînes. On les lit donc à la source, et le
 * script échoue bruyamment si leur forme change — ce qui vaut mieux qu'un
 * contrôle qui passerait sur une liste vide.
 */
const proxySource = fs.readFileSync(path.join(ROOT, "proxy.ts"), "utf8");
function readArray(name) {
  const match = proxySource.match(new RegExp(`const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`));
  if (!match) throw new Error(`proxy.ts : tableau ${name} introuvable — le script est à mettre à jour`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}
const publicPaths = readArray("PUBLIC_PATHS");
const indexOnly = readArray("INDEX_ONLY");
const previewPaths = readArray("PREVIEW_PATHS");
if (publicPaths.length === 0) throw new Error("proxy.ts : PUBLIC_PATHS lu vide");

/**
 * « Atteignable sans session », du point de vue d'un robot.
 *
 * PREVIEW_PATHS COMPTE ICI AU MÊME TITRE QUE PUBLIC_PATHS. Les deux listes
 * diffèrent sur un point qui ne concerne que les comptes — un membre non
 * finalisé est renvoyé vers /onboarding depuis un chemin d'aperçu, pas
 * depuis un chemin public (voir proxy.ts). Un robot n'a jamais de session :
 * pour lui les deux se valent, et c'est cette lecture-là que le plan du
 * site doit refléter.
 *
 * Comparaison EXACTE pour les aperçus, comme dans proxy.ts : /reading est
 * ouverte, /reading/[id] non.
 */
function isPublic(route) {
  if (previewPaths.includes(route)) return true;
  return publicPaths.some(
    (p) => route === p || (route.startsWith(`${p}/`) && !indexOnly.includes(p))
  );
}

// ── L'inventaire réel des pages ─────────────────────────────────────────
const pages = [];
(function walk(dir, route) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "api" || entry.name.startsWith("_")) continue;
    const child = path.join(dir, entry.name);
    // Les groupes de routes « (marketing) » ne créent pas de segment d'URL.
    const childRoute = entry.name.startsWith("(") ? route : `${route}/${entry.name}`;
    if (fs.existsSync(path.join(child, "page.tsx"))) pages.push(childRoute);
    walk(child, childRoute);
  }
})(path.join(ROOT, "app"), "");
if (fs.existsSync(path.join(ROOT, "app/page.tsx"))) pages.unshift("/");

/** Les pages fixes : celles dont l'URL ne dépend d'aucune donnée. */
const staticPages = pages.filter((route) => !route.includes("["));
/**
 * Le fichier qui sert une route, groupe de routes compris.
 *
 * Un index rangé dans un groupe — app/cours/(index)/page.tsx — sert /cours
 * sans que le chemin le dise. Le calcul direct levait ENOENT dès que les
 * trois arbres de contenu ont adopté cette forme.
 */
const sourceOf = (route) => {
  const dir = path.join(ROOT, "app", route === "/" ? "" : route.slice(1));
  const file = pageFileFor(dir);
  if (!file) throw new Error(`aucune page ne sert ${route}`);
  return file;
};

/**
 * « Explorable » et « indexable » ne sont pas la même chose.
 *
 * /login et /signup sont ouverts aux robots EXPRÈS : c'est la seule façon
 * qu'ils lisent le `noindex` qui les en fait sortir (voir app/robots.ts).
 * Ces pages-là ne doivent donc surtout pas figurer au plan du site — on n'y
 * annonce que ce qu'on veut voir indexé — ni déclarer d'adresse canonique,
 * qui contredirait le `noindex`. Sans cette troisième dimension, le contrôle
 * réclamerait exactement l'inverse de ce qui est voulu.
 */
function isIndexable(route) {
  if (!isPublic(route) || isBlocked(route)) return false;
  return !/index:\s*false/.test(fs.readFileSync(sourceOf(route), "utf8"));
}

// ── 1. Cohérence : ce qu'on annonce est ouvert et lisible ───────────────
for (const route of declared) {
  require_(isPublic(route), `plan du site : ${route} est annoncée mais protégée par proxy.ts`);
  require_(!isBlocked(route), `plan du site : ${route} est annoncée mais interdite par robots.ts`);
  if (staticPages.includes(route)) {
    require_(isIndexable(route), `plan du site : ${route} est annoncée mais porte un noindex`);
  }
}

// ── 2. Exhaustivité : ce qui est ouvert est annoncé ─────────────────────
const inSitemap = new Set(declared);
for (const route of staticPages) {
  if (!isIndexable(route)) continue;
  require_(inSitemap.has(route), `plan du site : ${route} est publique et indexable, mais absente`);
}

// ── 3. Orphelines : le site se porte-t-il garant de ses pages ? ─────────
// On cherche les liens dans tout ce qui participe au rendu — une page peut
// être liée depuis un composant partagé (la barre de navigation) aussi bien
// que depuis une autre page, et les guides déclarent les leurs en données.
const linkSources = [];
for (const dir of ["app", "components", "lib"]) {
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const child = path.join(d, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (/\.tsx?$/.test(entry.name)) linkSources.push(child);
    }
  })(path.join(ROOT, dir));
}
const corpus = new Map(linkSources.map((f) => [f, fs.readFileSync(f, "utf8")]));

for (const route of staticPages) {
  if (route === "/" || !isIndexable(route)) continue;
  const own = sourceOf(route);
  // Un lien de la page vers elle-même ne prouve rien : on l'exclut.
  const pattern = new RegExp(`href[=:]\\s*["\`]${route}["\`]`);
  const linked = [...corpus].some(([file, src]) => file !== own && pattern.test(src));
  require_(linked, `${route} : orpheline — aucune autre page ni composant ne pointe vers elle`);
}

// ── 4. Adresse canonique ────────────────────────────────────────────────
for (const route of staticPages) {
  if (!isIndexable(route)) continue;
  const src = fs.readFileSync(sourceOf(route), "utf8");
  require_(
    src.includes("canonical"),
    `${route} : aucune adresse canonique — elle héritera de celle du layout`
  );
}

// ── 5. Un titre, un seul, et sans la marque ─────────────────────────────
//
// LES DEUX MOITIÉS SE VÉRIFIENT SUR TOUTES LES PAGES, PAS SEULEMENT LES
// FIXES. Les pages à paramètre déclarent leur titre dans `generateMetadata`,
// et trois d'entre elles y écrivaient la marque à la main — un contrôle qui
// ne regardait que les pages fixes ne pouvait pas les voir.
//
// LE TITRE PEUT VENIR D'UN LAYOUT VOISIN. Une page « use client » ne peut pas
// exporter `metadata` du tout : cinq modes de révision le déclarent donc dans
// un layout de leur propre dossier. C'est une réponse valable, et le contrôle
// doit l'accepter — sinon il réclamerait l'impossible.
//
// SEUL LE TITRE DE PREMIER NIVEAU EST CONCERNÉ. Le gabarit `%s — Privetik` ne
// s'applique qu'à `metadata.title` : les titres `openGraph` et `twitter` sont
// des titres de PARTAGE, ils voyagent seuls dans une messagerie et doivent
// porter la marque. Une première version de ce contrôle les attrapait aussi
// et réclamait de retirer une marque qui a sa place. D'où la lecture sur
// l'indentation : deux espaces, c'est une clé de l'objet `metadata` ; quatre,
// c'est déjà dans un sous-objet.
const TOP_LEVEL_TITLE = /^ {2}title: "([^"]*)"/gm;
/** `return { title: info ? info.title : "Exercice introuvable" };` */
const RETURNED_TITLE = /^ *return \{.*title:.*$/gm;

const declaresTitle = (src) =>
  new RegExp(TOP_LEVEL_TITLE.source, "m").test(src) || /generateMetadata/.test(src);

for (const route of pages) {
  const own = sourceOf(route);
  const layout = path.join(path.dirname(own), "layout.tsx");
  const sources = [own, ...(fs.existsSync(layout) ? [layout] : [])];

  // L'ACCUEIL EST LA SEULE EXCEPTION, et par construction : le `title.default`
  // du layout racine est écrit POUR lui. C'est même la raison d'être d'un
  // `default` — il nomme la page d'entrée, et sert de filet aux autres. Le
  // problème n'a jamais été qu'il existe, mais que quinze pages s'en
  // contentaient sans le vouloir.
  if (route !== "/") {
    require_(
      sources.some((f) => declaresTitle(fs.readFileSync(f, "utf8"))),
      `${route} : aucun titre déclaré — l'onglet affichera celui de l'accueil`
    );
  }

  for (const file of sources) {
    const src = fs.readFileSync(file, "utf8");
    const titles = [...src.matchAll(TOP_LEVEL_TITLE)].map((m) => m[1]);
    // Les titres rendus par `generateMetadata` tiennent sur la ligne du
    // `return` : on y relève toutes les chaînes, y compris la branche d'erreur.
    for (const [line] of src.matchAll(RETURNED_TITLE)) {
      titles.push(...[...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]));
    }
    for (const title of titles) {
      require_(
        !/—\s*Privetik\s*$/.test(title),
        `${route} : titre « ${title} » — le gabarit du layout ajoute déjà la marque`
      );
    }
  }
}

const NOTFOUND = /notFound\(\)/;

// ── Le 404 des arbres de contenu doit pouvoir sortir ────────────────────
//
// CE QUI S'EST PASSÉ. /cases/inexistant répondait « 200 OK » avec une page
// VIDE — en production. Ni le contenu, ni la 404 qui enseigne le génitif de
// la négation. Un robot y voyait une page valide de plus, et l'adresse morte
// entrait dans l'index.
//
// LA CAUSE EST UN `loading.tsx`. Il crée une frontière Suspense : Next envoie
// la coquille, donc les EN-TÊTES, donc le statut, dès que la page suspend.
// Quand `notFound()` s'exécute ensuite, il est trop tard pour corriger un
// statut déjà parti. Peu importe le niveau : une frontière posée sur le
// segment OU sur l'un de ses parents produit le même effet — c'est ce qui a
// fait échouer deux diagnostics avant le bon.
//
// La parade tient dans une règle de FICHIERS, donc elle se vérifie sans
// serveur : aucune frontière au-dessus d'un segment dynamique qui refuse des
// identifiants. Les index gardent la leur en vivant dans un groupe `(index)`,
// que Next ne fait pas englober ses voisins.
{
  const TREES = [
    ["app/cases", "[caseSlug]"],
    ["app/cours", "[slug]"],
    ["app/guides", "[slug]"],
  ];

  for (const [tree, segment] of TREES) {
    const base = path.join(ROOT, tree);

    require_(
      !fs.existsSync(path.join(base, "loading.tsx")),
      `${tree}/loading.tsx englobe ${segment} : son 404 repartirait en 200. ` +
        `Range l'index dans un groupe (index)/ pour lui garder son squelette.`
    );
    require_(
      !fs.existsSync(path.join(base, segment, "loading.tsx")),
      `${tree}/${segment}/loading.tsx empêche le 404 de sortir — le statut ` +
        `part avec la coquille, avant que notFound() ne s'exécute.`
    );

    const page = path.join(base, segment, "page.tsx");
    require_(fs.existsSync(page), `${tree}/${segment}/page.tsx a disparu`);
    if (fs.existsSync(page)) {
      require_(
        NOTFOUND.test(fs.readFileSync(page, "utf8")),
        `${tree}/${segment} n'appelle plus notFound() : un identifiant inventé serait servi`
      );
    }
  }
}


// ── Verdict ─────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error(`\nRéférencement : ${failures.length} problème(s) sur ${checks} contrôles.\n`);
  for (const failure of failures) console.error(`  • ${failure}`);
  process.exit(1);
}

const indexable = staticPages.filter(isIndexable);
console.log(
  `Référencement : ${declared.length} URL au plan, ${indexable.length} pages fixes indexables.`
);
console.log(`${checks} contrôles passés.`);
