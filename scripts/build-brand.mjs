/**
 * Produit les fichiers de marque à partir d'une seule source SVG.
 *
 * POURQUOI UN SCRIPT ET NON DES FICHIERS DESSINÉS À LA MAIN. Un logo vit à
 * cinq tailles et dans trois formats : onglet du navigateur, écran
 * d'accueil iOS, partage social, et le composant React de la barre. Les
 * garder synchronisés à la main garantit qu'ils divergeront — c'est
 * toujours le favicon qu'on oublie de refaire.
 *
 * LE « П » EST UN TRACÉ, pas du texte. Un `<text>` dans un favicon dépend
 * d'une police que le contexte de rendu n'a pas forcément : un lecteur RSS,
 * une vignette de partage ou un système d'exploitation qui génère l'icône
 * afficheraient un carré vide. En tracé, la lettre est la même partout.
 *
 * LES COULEURS SONT LITTÉRALES ici, alors que le composant React lit des
 * variables CSS. Un fichier autonome n'a pas de feuille de style : les
 * `var(--flag-blue)` y seraient sans valeur, et le carré sortirait
 * transparent. Ce sont les valeurs du thème sombre, celles sur lesquelles
 * la marque a été réglée.
 *
 *   npm run build:brand
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();

const FLAG_WHITE = "#f6f7fb";
const ACCENT_HI = "#4f86ea";
const FLAG_BLUE = "#1c4fc4";
const MID = "#8f2a6b";
const FLAG_RED = "#d52b1e";

/**
 * Le « П » en tracé : deux jambages et une traverse, dessinés d'un trait.
 * Coordonnées dans le repère 32×32 du logo.
 */
const PI_PATH = "M9 8 h14 v16 h-3.2 v-12.8 h-7.6 v12.8 h-3.2 z";

/** `radius` : 8.5/32 du côté, comme dans le composant React. */
function svg({ size = 32, padding = 0 } = {}) {
  const box = 32;
  const inner = box - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${box} ${box}">
  <defs>
    <linearGradient id="flag" x1="-0.1" y1="-0.1" x2="1.05" y2="1.1">
      <stop offset="0%" stop-color="${FLAG_WHITE}"/>
      <stop offset="18%" stop-color="${ACCENT_HI}"/>
      <stop offset="46%" stop-color="${FLAG_BLUE}"/>
      <stop offset="74%" stop-color="${MID}"/>
      <stop offset="100%" stop-color="${FLAG_RED}"/>
    </linearGradient>
    <radialGradient id="bloomRed" cx="0.82" cy="0.84" r="0.68">
      <stop offset="0%" stop-color="${FLAG_RED}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${FLAG_RED}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bloomWhite" cx="0.24" cy="0.22" r="0.72">
      <stop offset="0%" stop-color="${FLAG_WHITE}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${FLAG_WHITE}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g transform="translate(${padding},${padding}) scale(${inner / box})">
    <rect width="32" height="32" rx="8.5" fill="url(#flag)"/>
    <rect width="32" height="32" rx="8.5" fill="url(#bloomRed)"/>
    <rect width="32" height="32" rx="8.5" fill="url(#bloomWhite)"/>
    <rect width="32" height="32" rx="8.5" fill="url(#edge)"/>
    <path d="${PI_PATH}" fill="#ffffff"/>
  </g>
</svg>`;
}

/**
 * La variante « maskable », pour l'icône d'application installée.
 *
 * ANDROID RECADRE. Il applique sa propre forme — cercle, squircle, goutte
 * selon le constructeur — et ne garantit de conserver que le CERCLE INSCRIT
 * à 80 % de la largeur. Deux conséquences, que la version normale ne
 * supporte pas :
 *
 * 1. Le fond doit aller bord à bord. Nos coins arrondis (rx 8.5) laissent du
 *    transparent : masqué, le système le remplit de blanc, et l'icône se
 *    retrouve avec un liseré clair sur trois côtés. D'où `rx="0"` ici.
 *
 * 2. Le dessin doit tenir dans les 80 % centraux. Le « П » y tient déjà
 *    largement, mais le recadrage mange les coins du dégradé — c'est-à-dire
 *    précisément le blanc en haut à gauche et le rouge en bas à droite, les
 *    deux extrémités du drapeau. On le réduit donc (0,78) pour que la
 *    diagonale complète survive au masque : après recadrage on lit encore
 *    blanc → bleu → rouge, ce qui est tout l'intérêt de la marque.
 *
 * Sans cette variante, il aurait fallu déclarer les icônes en `purpose:
 * "any"` seulement — et Android aurait posé le logo dans une pastille
 * blanche, ce qui est le rendu « site web épinglé », pas celui d'une app.
 */
function maskableSvg({ size = 512 } = {}) {
  const box = 32;
  const scale = 0.78;
  const shift = (box * (1 - scale)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${box} ${box}">
  <defs>
    <linearGradient id="flag" x1="-0.1" y1="-0.1" x2="1.05" y2="1.1">
      <stop offset="0%" stop-color="${FLAG_WHITE}"/>
      <stop offset="18%" stop-color="${ACCENT_HI}"/>
      <stop offset="46%" stop-color="${FLAG_BLUE}"/>
      <stop offset="74%" stop-color="${MID}"/>
      <stop offset="100%" stop-color="${FLAG_RED}"/>
    </linearGradient>
    <radialGradient id="bloomRed" cx="0.82" cy="0.84" r="0.68">
      <stop offset="0%" stop-color="${FLAG_RED}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${FLAG_RED}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bloomWhite" cx="0.24" cy="0.22" r="0.72">
      <stop offset="0%" stop-color="${FLAG_WHITE}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${FLAG_WHITE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="32" height="32" fill="url(#flag)"/>
  <rect width="32" height="32" fill="url(#bloomRed)"/>
  <rect width="32" height="32" fill="url(#bloomWhite)"/>
  <g transform="translate(${shift},${shift}) scale(${scale})">
    <path d="${PI_PATH}" fill="#ffffff"/>
  </g>
</svg>`;
}

/**
 * Assemble un .ico contenant plusieurs PNG.
 *
 * Le format ICO accepte des PNG tels quels depuis Windows Vista, ce qui
 * évite d'écrire un encodeur BMP : un en-tête de 6 octets, une entrée de 16
 * octets par taille, puis les PNG bout à bout. Une taille de 0 signifie
 * 256 — d'où le `% 256`.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // 1 = icône
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size % 256, 0);
    e.writeUInt8(size % 256, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // réservé
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const write = (rel, data) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
  console.log(`  ${rel} — ${(data.length / 1024).toFixed(1)} Ko`);
};

console.log("Marque Privetik :");

// ─── SVG ─────────────────────────────────────────────────────────
// `app/icon.svg` est repris automatiquement par Next comme favicon
// vectoriel ; `public/logo.svg` sert aux usages externes (README, presse).
const master = svg({ size: 512 });
write("app/icon.svg", Buffer.from(master, "utf8"));
write("public/logo.svg", Buffer.from(master, "utf8"));

// ─── PNG ─────────────────────────────────────────────────────────
/**
 * `compressionLevel: 9` et `palette: true` : un dégradé sur fond opaque se
 * réduit très bien à 256 couleurs, et personne ne verra la différence sur
 * une icône de 32 px. Sans ces deux options, le .ico dépassait 140 Ko —
 * pour un fichier que le navigateur charge sur CHAQUE page.
 */
const png = (size, pad = 0, palette = false) =>
  sharp(Buffer.from(svg({ size, padding: pad }), "utf8"))
    .resize(size, size)
    .png({ compressionLevel: 9, palette })
    .toBuffer();

// Les grandes tailles restent en couleurs vraies : elles servent aux
// vignettes de partage, où le dégradé s'étale sur plusieurs centaines de
// pixels et où une palette se verrait.
for (const size of [192, 512]) {
  write(`public/logo-${size}.png`, await png(size));
}
// L'icône iOS ne doit PAS coller aux bords : le système lui applique son
// propre masque arrondi par-dessus, et un dessin plein bord s'y fait rogner.
write("app/apple-icon.png", await png(180, 2));

// ─── Icônes maskables (application installée) ────────────────────
// Déclarées dans app/manifest.ts sous `purpose: "maskable"`. Voir
// maskableSvg pour le pourquoi des deux différences avec la version
// normale : fond bord à bord, dessin réduit à 78 %.
const maskable = (size) =>
  sharp(Buffer.from(maskableSvg({ size }), "utf8"))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

for (const size of [192, 512]) {
  write(`public/logo-maskable-${size}.png`, await maskable(size));
}

// ─── ICO ─────────────────────────────────────────────────────────
// Trois tailles suffisent : 16 pour l'onglet, 32 pour la barre des tâches
// et les écrans à forte densité, 48 pour le raccourci de bureau. Au-delà,
// tous les navigateurs modernes préfèrent `icon.svg`, qui est vectoriel et
// pèse 1,4 Ko — embarquer du 256 px dans le .ico l'alourdissait de 100 Ko
// pour un cas que plus rien n'utilise.
const sizes = [16, 32, 48];
const images = [];
for (const size of sizes) images.push({ size, data: await png(size, 0, true) });
write("app/favicon.ico", ico(images));

console.log(`Terminé — ${sizes.length} tailles dans le .ico (${sizes.join(", ")} px).`);
