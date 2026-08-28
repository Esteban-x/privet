# Base de données — comment on la fait évoluer

La source de vérité, ce sont les fichiers de `migrations/`. Chacun est daté,
appliqué **une seule fois**, et Supabase tient le compte de ce qui a tourné
dans la table `supabase_migrations.schema_migrations`. On ne colle plus rien
dans l'éditeur SQL, et on ne modifie jamais une migration déjà appliquée :
on en ajoute une nouvelle.

`schema.sql` reste comme vue consolidée du schéma, pour le lire d'un coup.
Il n'est plus exécuté.

## Le secret de la CI

Un seul, dans Settings → Secrets and variables → Actions :

```
SUPABASE_DB_URL
postgresql://postgres.wlrobqzxexrcykakcisa:<MOT_DE_PASSE>@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

Le mot de passe est celui de Postgres (Settings → Database → Database
password). **Port 5432**, pas 6543 : le mode transaction ne supporte pas
tout le SQL d'une migration. Un mot de passe contenant `@ : / ? #` doit être
encodé en pourcentage.

Pourquoi pas un jeton d'accès : il expire au bout de 30 jours, et une CI qui
en dépend tombe en panne silencieusement. L'URL de connexion ne périme pas.

Cette automatisation reste **facultative** tant que tu es seul : lancer
`npm run db:push` depuis ta machine fait exactement la même chose. La CI
sert le jour où quelqu'un d'autre fusionne une migration.

## Le rattachement au projet hébergé — à faire une fois

Ces deux commandes demandent tes identifiants, elles n'ont donc pas pu être
lancées à ta place.

```bash
npx supabase login                      # ouvre le navigateur, crée un jeton local
npx supabase link --project-ref <ref>   # <ref> = l'identifiant du projet
```

La référence du projet se lit dans l'URL du tableau de bord Supabase
(`https://supabase.com/dashboard/project/<ref>`) ou dans Settings → General.
Elle se retrouve aussi dans ton `.env.local` : c'est le sous-domaine de
`NEXT_PUBLIC_SUPABASE_URL`.

## Appliquer les migrations en attente

```bash
npm run db:push
```

Trois migrations existent aujourd'hui :

| Fichier | Ce qu'il fait |
|---|---|
| `20260801000000_baseline.sql` | l'état du schéma avant l'adoption des migrations |
| `20260825120000_vocab_words_focus.sql` | la colonne `focus` du vocabulaire |
| `20260825130000_exercise_progress.sql` | la table de progression des modules récents |

La référence reprend l'ancien `schema.sql`, **entièrement idempotent** : la
rejouer sur ta base actuelle ne casse rien et ne duplique rien. C'est
volontaire — cela évite d'avoir à déclarer à la main qu'elle est déjà
appliquée. Les deux suivantes sont celles que ta base n'a pas encore reçues.

Si Supabase refuse la référence parce qu'il la juge déjà appliquée :

```bash
npx supabase migration repair --status applied 20260801000000
```

## Créer une migration

```bash
npm run db:new nom_du_changement     # crée migrations/<horodatage>_nom.sql
```

Écris du SQL ordinaire : plus besoin d'`if not exists`, le fichier ne tourne
qu'une fois. Puis `npm run db:push`.

Si tu as modifié quelque chose à la main dans le Studio, récupère-le en
migration plutôt que de le réécrire :

```bash
npm run db:diff -- -f nom_du_changement
```

## Vérifier que la chaîne tient

```bash
npm run db:start     # lance Postgres, Auth et Studio en local (Docker requis)
npm run db:reset     # efface la base locale et rejoue TOUTES les migrations
npm run db:stop
```

`db:reset` est la commande qui compte : elle prouve que la suite de
migrations reconstruit la base à partir de rien. Tant qu'elle passe, la
production est reproductible. **Elle demande que Docker Desktop soit lancé**
— le démon doit tourner, pas seulement la ligne de commande être installée.

## Sauvegarder

```bash
npm run db:backup     # Docker Desktop doit tourner
```

Le script vide les **données** de production dans `backups/`, garde les dix
dernières, et refuse une sauvegarde suspicieusement petite. Le schéma n'y
est pas : les migrations le reconstruisent, et deux sources de vérité, c'est
ce qu'on vient d'éliminer.

`backups/` est ignoré par git, et doit le rester : ces fichiers contiennent
des comptes et de la progression. Une sauvegarde poussée sur GitHub est une
fuite de données.

### La copie hors site

Une sauvegarde posée à côté de ce qu'elle protège ne protège de rien. Ajoute
à `.env.local` le dossier synchronisé de ton choix :

```
BACKUP_MIRROR=C:\Users\stb\Mon Drive\privetik-sauvegardes
```

Le script y dépose une copie après chaque sauvegarde, avec la même rotation.
Aucune clé d'API : c'est le client de synchronisation (Google Drive,
OneDrive, Dropbox) qui fait le transfert.

## Restaurer — procédure vérifiée

Testée le 25 août 2026 sur la base locale : les 122 lignes du journal, les
trois comptes, les listes et les cartes SRS sont revenus sans une erreur.

```bash
npm run db:start
npm run db:reset                       # le schéma, reconstruit depuis les migrations
docker exec -i supabase_db_<ref> psql -U postgres < backups/<fichier>-data.sql
```

Le nom du conteneur se lit avec `docker ps` (il finit par la référence du
projet). En production, la même chose avec `npm run db:push` pour le schéma,
puis `psql "<SUPABASE_DB_URL>" -f <fichier>`.

Refaire ce test après tout changement du script de sauvegarde : c'est la
seule façon de savoir que le filet tient encore.

## Le seed

`supabase/seed.sql` remplit la base LOCALE à chaque `db:reset` : un compte
(`test@privetik.local` / `motdepasse`), une liste de trois mots couvrant les
trois priorités, et un peu de progression. Il ne part jamais en production —
`db push` n'applique que les migrations.

## Les deux règles qui comptent plus que l'outil

**Rien de destructif en un seul coup.** Pour renommer ou supprimer pendant
que l'application tourne : ajouter la nouvelle colonne → déployer le code
qui l'écrit → recopier les données → déployer le code qui abandonne
l'ancienne → la supprimer dans une migration ultérieure. Une migration qui
supprime une colonne encore lue par le code en production, c'est une panne.

**Une sauvegarde n'existe que si elle a été restaurée.** Supabase sauvegarde
quotidiennement sur les offres payantes. Tant qu'une restauration n'a pas
été faite une fois dans un projet jetable, on ne sait pas si elle
fonctionne — et le jour où on veut le savoir, il est trop tard.
