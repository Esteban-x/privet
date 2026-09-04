import fs from "node:fs";
import path from "node:path";

/**
 * « Quel fichier sert cette route ? », groupes de routes compris.
 *
 * POURQUOI CE FICHIER EXISTE. Quatre contrôles — courses, guides, seo,
 * exercises — répondaient chacun à cette question par leur propre
 * `existsSync(dir + "/page.tsx")`. Le jour où les index de /cases, /cours et
 * /guides sont entrés dans un groupe `(index)`, les quatre ont déclaré
 * introuvables trois routes qui fonctionnaient parfaitement. Une hypothèse
 * fausse recopiée quatre fois se corrige quatre fois ; celle-ci vit
 * désormais à un seul endroit.
 *
 * CE QU'EST UN GROUPE DE ROUTES. Un dossier entre parenthèses n'ajoute
 * aucun segment à l'URL : `app/cases/(index)/page.tsx` répond sur `/cases`.
 * Il sert à donner une frontière — un `loading.tsx`, un `layout.tsx` — à
 * une partie d'un dossier sans l'imposer au reste. C'est exactement ce qui
 * permet à l'index de garder son squelette de chargement sans que la page
 * de détail hérite d'un Suspense qui, lui, empêchait son 404 de sortir.
 */
export function pageFileFor(dir) {
  const direct = path.join(dir, "page.tsx");
  if (fs.existsSync(direct)) return direct;
  if (!fs.existsSync(dir)) return null;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("(")) continue;
    const nested = pageFileFor(path.join(dir, entry.name));
    if (nested) return nested;
  }
  return null;
}

/** Vrai si le dossier sert une page, directement ou via un groupe. */
export function servesAPage(dir) {
  return pageFileFor(dir) !== null;
}
