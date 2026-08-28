/**
 * Sauvegarde des données de production — `npm run db:backup`.
 *
 * POURQUOI CE SCRIPT EXISTE. L'offre gratuite de Supabase ne sauvegarde
 * rien. Ce n'est pas « des sauvegardes à surveiller », c'est zéro : une
 * migration malheureuse ou un `delete` de trop, et les données n'existent
 * plus. C'est la seule raison sérieuse de passer au plan payant — et elle
 * se règle ici, gratuitement, tant qu'on accepte de lancer une commande.
 *
 * POURQUOI SEULEMENT LES DONNÉES. Le schéma est déjà versionné dans
 * `supabase/migrations/` : le sauvegarder une seconde fois créerait deux
 * sources de vérité, et c'est justement ce qu'on vient d'éliminer. Une
 * restauration se fait donc en deux temps — les migrations reconstruisent
 * les tables, ce fichier y remet les lignes.
 *
 * CE FICHIER CONTIENT DES DONNÉES PERSONNELLES (comptes, progression). Le
 * dossier `backups/` est ignoré par git, et il doit le rester : une
 * sauvegarde poussée sur GitHub est une fuite de données, pas une
 * sauvegarde.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/** Le point d'entrée JavaScript de la CLI Supabase, lancé par Node. */
const CLI = createRequire(import.meta.url).resolve("supabase/dist/supabase.js");
const BACKUPS = path.join(ROOT, "backups");
/** Nombre de sauvegardes conservées sur le disque. */
const KEEP = 10;

// ─── Ce que .env.local nous apprend ──────────────────────────────
// Lecture directe plutôt qu'une bibliothèque : deux variables à lire ne
// justifient pas une dépendance de plus, et ce script doit pouvoir tourner
// dans une tâche planifiée sans rien charger d'autre que Node.
function readEnv(name) {
  const envPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`));
      if (match) return match[1].replace(/^["']|["']$/g, "");
    }
  }
  return process.env[name] ?? null;
}

const dbUrl = readEnv("SUPABASE_DB_URL");
if (!dbUrl) {
  console.error(`Aucune URL de connexion trouvée.

Ajoute cette ligne à .env.local (le fichier est déjà ignoré par git) :

  SUPABASE_DB_URL=postgresql://postgres.<ref>:<MOT_DE_PASSE>@<hôte-pooler>:5432/postgres

Le mot de passe se réinitialise dans Settings → Database → Database password.
Port 5432, pas 6543 : le mode transaction ne convient pas ici.`);
  process.exit(1);
}

// ─── Le vidage ───────────────────────────────────────────────────
fs.mkdirSync(BACKUPS, { recursive: true });
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const target = path.join(BACKUPS, `${stamp}-data.sql`);

console.log("Sauvegarde des données de production…");
try {
  // La CLI est lancée par son point d'entrée JavaScript, exécuté par Node.
  // Passer par `npx` échouait sous Windows : depuis Node 20, exécuter un
  // `.cmd` sans shell lève EINVAL — et activer le shell mettrait le mot de
  // passe dans une ligne de commande interprétée. Ici, ni l'un ni l'autre.
  execFileSync(
    process.execPath,
    [CLI, "db", "dump", "--db-url", dbUrl, "--data-only", "-f", target],
    { stdio: ["ignore", "inherit", "inherit"], cwd: ROOT }
  );
} catch (error) {
  // Le message de la CLI est déjà passé sur la sortie d'erreur : on n'ajoute
  // que les pistes. La première version de ce script masquait l'échec
  // derrière un texte générique, ce qui transformait une erreur lisible en
  // devinette — l'erreur était d'ailleurs dans le script lui-même.
  console.error(`\nLe vidage a échoué (${error.code ?? "voir le message ci-dessus"}).
Pistes : mot de passe Postgres, port 5432 et non 6543, Docker Desktop lancé.`);
  process.exit(1);
}

const size = fs.statSync(target).size;
console.log(`\n✓ ${path.relative(ROOT, target)} — ${(size / 1024).toFixed(1)} Ko`);

// Une sauvegarde vide est un piège : elle donne l'impression d'exister.
if (size < 1024) {
  console.error(
    "\n⚠ Fichier suspicieusement petit : la base est-elle vraiment celle de production ?"
  );
  process.exit(1);
}

// ─── Rotation ────────────────────────────────────────────────────
function rotate(directory, label) {
  const dumps = fs
    .readdirSync(directory)
    .filter((f) => f.endsWith("-data.sql"))
    .sort()
    .reverse();
  for (const old of dumps.slice(KEEP)) {
    fs.unlinkSync(path.join(directory, old));
    console.log(`  (ancienne sauvegarde supprimée${label} : ${old})`);
  }
}
rotate(BACKUPS, "");

// ─── Copie hors site ─────────────────────────────────────────────
//
// Une sauvegarde posée à côté de ce qu'elle protège ne protège de rien : le
// disque qui meurt emporte l'application ET ses sauvegardes. `BACKUP_MIRROR`
// pointe vers un dossier synchronisé (Google Drive, OneDrive, Dropbox) — le
// fichier part donc chez le fournisseur sans qu'aucune clé d'API ne soit
// nécessaire, c'est le client de synchronisation qui s'en charge.
const mirror = readEnv("BACKUP_MIRROR");
if (!mirror) {
  console.log(`
⚠ Aucune copie hors site. Cette sauvegarde n'existe que sur ce disque.
  Ajoute à .env.local le dossier synchronisé de ton choix, par exemple :
  BACKUP_MIRROR=C:\\Users\\stb\\Mon Drive\\privetik-sauvegardes`);
} else if (!fs.existsSync(mirror)) {
  console.error(`
⚠ BACKUP_MIRROR pointe vers un dossier introuvable : ${mirror}
  La sauvegarde locale est faite, mais elle n'est copiée nulle part.`);
} else {
  const copy = path.join(mirror, path.basename(target));
  fs.copyFileSync(target, copy);
  rotate(mirror, " hors site");
  console.log(`✓ copie hors site : ${copy}`);
}

console.log(`
Pour restaurer, dans l'ordre :
  1. npm run db:push                       les migrations recréent les tables
  2. psql "<URL>" -f ${path.relative(ROOT, target).replace(/\\/g, "/")}
     (ou, en local : npm run db:reset puis le même psql sur la base locale)

Teste-le une fois sur la base LOCALE avant d'en avoir besoin en vrai.`);
