# Privet — apprendre le russe

App Next.js (App Router, TypeScript, Tailwind v4) : déclinaison des 6 cas,
vocabulaire (SRS + frappe), lecture graduée, **inscription email/mot de passe
(confirmation par email + captcha)**, **auth Google via Supabase**,
**test de niveau**, **tuteur IA** et **dashboard**.

L'IA (Anthropic) sert à générer exercices contextuels, textes de lecture
originaux et dialogue. Elle ne calcule **jamais** une déclinaison : ça reste
le rôle du moteur de règles déterministe (`lib/grammar/`).

---

## 1. Prérequis

- Node.js 18+ et npm
- Un compte Supabase (gratuit) — https://supabase.com
- Une clé API Anthropic — https://console.anthropic.com

## 2. Installation

```bash
npm install
cp .env.local.example .env.local   # puis remplis les valeurs (voir §4)
```

## 3. Configurer Supabase

1. Crée un projet sur supabase.com.
2. **SQL Editor → New query** : colle tout le contenu de `supabase/schema.sql`
   et exécute. Ça crée les tables (profiles, progression, SRS, chat…), les
   politiques Row Level Security, le trigger de création de profil, et la
   fonction `delete_own_account` qu'utilise `/account` pour la suppression de
   compte. Le fichier est idempotent — le relancer sur un projet existant (par
   exemple après avoir mis à jour ce dépôt) ne casse rien, ça ajoute juste ce
   qui manque.
3. **Authentication → Providers → Email** : laisse-le activé et garde
   **Confirm email** coché. C'est ce réglage qui fait que Supabase envoie le
   mail de confirmation et refuse la connexion tant que le lien n'est pas
   cliqué. (Sans lui, l'inscription ouvrirait une session immédiatement.)
4. **Authentication → Providers → Google** : active-le. Tu auras besoin d'un
   OAuth Client ID Google (console.cloud.google.com → Credentials). Mets comme
   *Authorized redirect URI* la valeur affichée par Supabase (de la forme
   `https://<projet>.supabase.co/auth/v1/callback`).
5. **Authentication → URL Configuration** : ajoute `http://localhost:3000/**`
   dans *Redirect URLs* (et l'URL de prod plus tard).
6. **Authentication → Emails → Confirm signup** *(recommandé)* : remplace le
   corps du lien par

   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding">
     Confirmer mon inscription
   </a>
   ```

   `type=email`, pas `type=signup` — ce dernier est un alias déprécié côté
   GoTrue (Supabase Auth) qui échoue silencieusement sur les jetons générés
   quand PKCE est actif (`token_hash` préfixé `pkce_`). `email` est la valeur
   utilisée par tous les exemples officiels Supabase pour ce cas précis.

   Le gabarit par défaut (`{{ .ConfirmationURL }}`) marche aussi — la route
   `/auth/confirm` accepte les deux formes — mais il repose sur un flux PKCE
   lié au navigateur : si l'utilisateur ouvre son mail sur un autre appareil,
   le lien échoue. La version ci-dessus n'a pas ce défaut.
7. **Authentication → Attack Protection → Enable Captcha protection**, provider
   **Turnstile**, colle la *Secret Key* Cloudflare (voir §3bis). C'est ce
   réglage qui fait que Supabase refuse une inscription sans jeton valide —
   voir [Le captcha](#le-captcha) plus bas pour le détail.
8. **Project Settings → API** : copie *Project URL* et *anon public key* dans
   `.env.local`.

## 3bis. Configurer Cloudflare Turnstile

1. Crée un compte gratuit sur https://dash.cloudflare.com (pas besoin d'y
   héberger ton domaine).
2. **Turnstile → Add site** : renseigne ton domaine (`localhost` fonctionne en
   dev), widget mode **Managed**.
3. Copie la **Site Key** dans `.env.local`
   (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) et la **Secret Key** dans Supabase
   (étape 7 ci-dessus) — jamais l'inverse, la Secret Key ne doit **pas**
   atterrir dans ce dépôt.

## 4. Variables d'environnement (`.env.local`)

```
ANTHROPIC_API_KEY=sk-ant-...          # TA clé, jamais partagée ni commitée
ANTHROPIC_MODEL_FAST=claude-haiku-4-5
ANTHROPIC_MODEL_CHAT=claude-sonnet-5
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...  # Cloudflare, clé PUBLIQUE
```

> La clé **secrète** Turnstile ne va pas dans `.env.local` : elle se configure
> uniquement dans Supabase (§3, étape 7), qui est le seul à en avoir besoin
> pour vérifier les jetons. Sans `NEXT_PUBLIC_TURNSTILE_SITE_KEY` en
> développement, le formulaire retombe sur la clé de test Cloudflare (le
> captcha réussit toujours) ; en production, l'inscription se désactive
> plutôt que de tourner sans protection.

> ⚠️ La clé Anthropic reste **côté serveur** (pas de préfixe `NEXT_PUBLIC_`).
> Elle n'est lue que dans les routes `app/api/**`. Ne la mets jamais dans un
> composant client ni dans un dépôt public.

## 5. Lancer

```bash
npm run dev             # http://localhost:3000
npm run check             # tous les contrôles
npm run check:grammar     # banque de noms et moteur de déclinaison
npm run check:leveltest   # vivier d'items et qualité du placement
npm run check:progression # adaptation au niveau et estimation continue
npm run check:motion      # verbes de mouvement : formes et cohérence des exercices
npm run check:aspect      # aspect verbal : paires et cohérence des exercices
npm run build:nouns     # régénère la banque depuis le dictionnaire (rare)
```

Voir « Le module Cas » et « Le test de placement » plus bas.

Parcours utilisateur :

- **Inscription** : `/signup` (prénom, nom, email, mot de passe + confirmation,
  captcha) → email de confirmation → clic sur le lien → `/auth/confirm` →
  `/onboarding` (test de placement) → `/dashboard`.
- **Connexion** : `/login`, email/mot de passe ou Google → `/dashboard`.
- **Compte** : `/account` — profil, mot de passe, déconnexion de tous les
  appareils, suppression du compte.

Tant que l'email n'est pas confirmé, la connexion est refusée ; l'écran de
login propose alors de renvoyer le lien.

Tant que l'onboarding (test de niveau) n'est pas terminé, toute page
protégée redirige vers `/onboarding` — pas seulement le dashboard.

Sans clés configurées, l'app se lance quand même : les pages publiques
(accueil, login, inscription) fonctionnent, et les routes privées — dont
`/cases`, `/vocabulary` et `/reading` — redirigent vers `/login` (voir
`PUBLIC_PATHS` dans `proxy.ts`).

---

## Architecture

```
app/
  api/
    ai/exercise      génère un exercice contextuel pour un cas (Haiku)
    ai/reading       génère un texte de lecture original gradué (Haiku)
    ai/chat          tuteur IA en streaming (Sonnet)
    level-test/evaluate  rejoue le calcul du niveau côté serveur
    profile          met à jour le profil (nom affiché, onboarded, objectif
                     quotidien de révision)
  auth/callback      échange le code OAuth Google → session
  auth/confirm       valide le lien reçu par email → session
  auth/confirmed     écran de confirmation avant de continuer
  signup/            page d'inscription + action serveur (actions.ts)
  account/           réglages du compte + action serveur (suppression)
  login, onboarding, dashboard, tutor
  cases, motion, aspect, vocabulary, reading   (modules d'apprentissage)
components/
  auth/              SignupForm, TurnstileWidget
  account/           ProfileSettings, PreferencesSettings, PasswordSettings,
                     SecurityActions, DangerZone
lib/
  auth/              config Turnstile, validation des champs, état du form
  grammar/           déclinaison : paradigmes importés + moteur d'explication
                     (nouns-data.generated.ts est généré, ne pas l'éditer)
  ai/                client Anthropic serveur + prompts système
  supabase/          clients navigateur/serveur + types
  srs/, vocabulary/, reading/, leveltest/
supabase/schema.sql  schéma complet (tables + RLS + trigger)
proxy.ts             rafraîchit la session + protège les routes privées
scripts/
  build-nouns.mjs      importe les paradigmes du dictionnaire -> banque
  check-declensions.mjs contrôles de la banque et du moteur
  data/nouns-fr.tsv     sélection + traductions françaises (écrit à la main)
```

## Le module Cas

Une app d'apprentissage affiche la forme qu'elle calcule comme LA bonne
réponse : une terminaison fausse n'y est pas un bug d'affichage, c'est une
faute enseignée à quelqu'un qui n'a aucun moyen de la détecter. D'où une
règle unique : **on ne fait décliner que des mots dont les formes sont
vérifiées.**

Une partie de la morphologie russe n'est pas dérivable de l'orthographe du
lemme — voyelle mobile (`кусо́к → куск-` mais `уро́к → урок-`), schéma
accentuel (`врачо́м` vs `ме́сяцем`), pluriels supplétifs (`челове́к → лю́ди`).
Mesuré sur les 17 800 noms du dictionnaire, un moteur de règles retrouve la
bonne forme dans ~76 % des cas. C'est assez pour EXPLIQUER une terminaison,
pas pour la produire. D'où le partage :

- **la forme** vient du paradigme importé (`lib/grammar/nouns-data.generated.ts`) ;
- **la règle** est calculée par `lib/grammar/decline.ts`, qui sert aussi à
  repérer ce qui lui échappe : quand la règle et le paradigme divergent, le
  module ne récite pas une règle que la forme contredit, il dit à
  l'apprenant que c'est une forme à mémoriser.

Conséquence assumée : le vocabulaire personnel de l'apprenant n'alimente
PAS les exercices de cas. Un mot ajouté à la volée n'a pas de paradigme
vérifié, et lui inventer une déclinaison plausible serait exactement le
problème qu'on cherche à éviter.

### Faire évoluer la banque

1. Ajouter une ligne à `scripts/data/nouns-fr.tsv` :
   `lemme_ru <TAB> traduction_fr <TAB> genre_fr(m|f)` (+ une 4e colonne
   `m|f|n` si le dictionnaire ne renseigne pas le genre russe).
2. `npm run build:nouns` — télécharge le dictionnaire au premier lancement
   (cache dans `scripts/.cache/`, ignoré par git), puis régénère la banque.
   Tout mot absent, indéclinable, sans pluriel, aux formes douteuses ou dont
   la traduction française est déjà prise par un autre mot est **signalé et
   écarté** : il n'entre jamais dans un exercice.
3. `npm run check:grammar` — invariants de la banque, paradigmes témoins,
   prénoms, adjectifs, et taux d'accord moteur/dictionnaire.

### Attribution

Les paradigmes et les accents toniques proviennent du dictionnaire
[OpenRussian](https://github.com/Badestrand/russian-dictionary), publié sous
licence **Creative Commons Attribution-ShareAlike 4.0**. Les données dérivées
présentes dans `lib/grammar/nouns-data.generated.ts` restent sous cette
licence : si l'app est distribuée, l'attribution doit être visible.

## Le test de placement

`/onboarding` place l'apprenant sur l'échelle CECR. Deux principes, repris
des tests réels :

**Un niveau se VALIDE, il ne se touche pas.** Le ТРКИ demande 66 % de
réussite à un sous-test pour délivrer le niveau correspondant. Ici : un bloc
de 4 items d'un même niveau, validé à partir de 3 bonnes réponses sur 4
(75 %, très au-dessus des 25 % du hasard sur 4 options). Validé → on monte,
échoué → on descend, jusqu'à encadrer le niveau réel. Le résultat est le plus
haut palier validé — jamais un item isolé.

La version précédente montait d'un cran à chaque bonne réponse et retenait
« le plus haut palier réussi parmi les 4 dernières questions » : une seule
bonne réponse en C1, même noyée dans les échecs, suffisait à décrocher C1.
Mesuré par simulation, un vrai A2 était classé B1 ou plus dans 58 % des cas.

**Les items suivent le référentiel ТРКИ** (`lib/leveltest/questions.ts`) :
A1 présent et prépositionnel de lieu, A2 passé/futur et opposition
lieu/direction, B1 instrumental et aspect en contexte, B2 participes,
gérondifs et régime verbal, C1 phraséologie et registre. Chaque item teste
une compétence en contexte, avec une seule réponse défendable — les items
dont deux options se disent réellement en russe ont été écartés.

### Le retest

`/level-test` réévalue le niveau. Trois règles, toutes au service de la
comparabilité :

- **Mêmes règles, mêmes seuils, même calibrage** que la première passation.
  Un test « adapté » à l'apprenant rendrait « je suis passé de A2 à B1 »
  incomparable — c'est le point sur lequel il ne faut pas céder.
- **Items jamais vus** : `level_tests.detail` conserve les réponses item par
  item, donc les questions déjà posées sont écartées du tirage. Sinon le
  retest mesure la mémoire de la correction, pas la compréhension. Le vivier
  tient 5 passations entièrement inédites ; au-delà, les anciens items
  reviennent plutôt que de laisser un palier non sondé.
- **Un délai de 14 jours** entre deux passations. Deux tests rapprochés ne
  diffèrent que par le bruit ; la progression réelle se compte en semaines.

Le rapport est le seul endroit où la personnalisation a sa place : il découpe
le résultat **par domaine** (cas, aspect, verbes de mouvement, participes,
syntaxe, morphologie, lexique), du plus faible au plus solide, et renvoie
vers le module d'entraînement quand il en existe un.

`npm run check:leveltest` vérifie le vivier (4 options, bonne réponse dans
les bornes, assez d'items par palier, domaines représentés), le
**comportement du retest** (aucun item reposé sur 4 passations successives,
et un test qui se déroule quand même une fois le vivier épuisé), ET le
comportement statistique : simulation de candidats de niveau connu, avec des
seuils qui échouent si le placement se dégrade. Mesure actuelle : 100 items,
70 % de placement exact, 96 % à un palier près, et un candidat qui répond au
hasard finit en A0/A1 dans 95 % des cas.

## Les verbes de mouvement

La difficulté n°1 du russe pour un francophone, et longtemps le trou du
programme : le français dit « aller » là où le russe demande trois décisions
en même temps.

1. **Le mode** — à pied, en véhicule, en avion, par l'eau. « Я иду в Москву »
   signifie qu'on s'y rend *à pied*.
2. **La direction** — unidirectionnel (un trajet en cours) contre
   multidirectionnel (habitude, aller-retour, aptitude). Le piège : au passé,
   « вчера я ходил в кино » veut dire qu'on y est allé **et revenu**, alors
   que « я шёл в кино » dit seulement qu'on était en chemin.
3. **Le préfixe** — при-, у-, в-, вы-, под-… qui change le sens, rend le
   verbe perfectif, et impose sa préposition et donc son cas.

`/motion` traite ces trois couches comme quatre compétences séparées, dans
l'ordre où elles se construisent (A1 → B1). Chacune isole UNE difficulté :
mélanger le mode et la direction dans un même exercice ne dirait pas laquelle
des deux a fait échouer l'apprenant.

### Pourquoi des schémas et pas des images

Ce qui sépare `идти` de `ходить` n'est pas la scène — c'est un piéton dans
les deux cas — mais la **forme du trajet**. Une photo de quelqu'un qui marche
ne distingue rien ; une flèche qui revient à son point de départ, si. Les
préfixes encodent de la même façon une relation à une frontière (entrer,
sortir, s'arrêter au bord, contourner) : c'est de la géométrie, donc ça se
dessine exactement.

D'où des schémas SVG inline (`components/motion/TrajectoryDiagram.tsx`) :
rien à charger, rien à licencier, et les couleurs suivent le thème.

### Discipline de données

Les formes conjuguées sont écrites et vérifiées, jamais dérivées : `идти` fait
`шёл` au passé, et le préfixe `вы-` porte toujours l'accent (`вы́шел`, jamais
« вышёл »). Même règle que pour les déclinaisons.

`npm run check:motion` vérifie les formes contre une table de référence
relue à la main, **et** la cohérence sémantique des exercices : un exercice
dont la phrase française dit « je vais » ne peut pas attendre « бегу » (je
cours). Cette incohérence-là est apparue au premier essai de génération.

La correction est rejouée côté serveur (`app/api/motion/attempt`), comme pour
les cas : le client envoie l'item et sa réponse, jamais « j'ai eu juste ».

## L'aspect verbal

L'autre catégorie que le français n'a pas. Un francophone la remplace par
imparfait / passé composé, ce qui marche une fois sur deux et installe donc
une erreur au lieu d'un doute. L'aspect ne dit pas QUAND l'action a lieu,
mais quelle **forme** elle a dans le temps :

- **imperfectif** — un processus, une répétition, une action sans borne :
  « Я реша́л зада́чу » = je planchais dessus, sans dire si j'y suis arrivé ;
- **perfectif** — une borne atteinte, un résultat : « Я реши́л зада́чу ».

`/aspect` découpe ça en cinq compétences (A2 → B1) : processus ou résultat,
les mots qui tranchent, les deux futurs, l'impératif et la négation, et la
reconnaissance des paires. Les schémas sont des **timelines** : une ligne
pour le processus, une ligne qui bute sur une borne pour le résultat, des
points pour la répétition, une ligne coupée pour l'interruption.

### La contrainte qui gouverne le module

L'aspect a de **vraies zones ambiguës** : beaucoup de contextes admettent les
deux formes avec une nuance, pas une faute. Or un exercice à choix unique ne
peut porter que sur ce qui est tranché. On ne construit donc d'items que là
où l'aspect est **forcé** — par un marqueur (`долго`, `за два часа`,
`каждый день`), par une construction (impératif négatif), ou par un
enchaînement de résultats. Tout ce dont un russophone dirait « les deux, ça
dépend » reste dehors, quitte à couvrir moins. C'est la même règle qui avait
fait écarter `искать`/`ждать` des déclencheurs de l'accusatif.

### Un contexte, une paire

La phrase française doit nommer le verbe — sinon l'apprenant ne saurait pas
lequel employer — et seul l'aspect reste à trouver. Chaque contexte est donc
lié à **une seule** paire aspectuelle. Sans cette contrainte, la génération
produisait « J'ai lu ce livre » avec « реши́л » attendu comme réponse :
« j'ai résolu ce livre ». Le lien supprime ce mode d'échec par construction
plutôt que par vigilance, et `check:aspect` le vérifie à chaque tirage.

Les formes sont écrites et vérifiées contre une table relue à la main :
`говори́ть → сказа́ть`, `брать → взять`, `класть → положи́ть` sont supplétifs,
aucune règle ne les prédit.

## Niveau et progression

Deux mesures cohabitent, volontairement :

- **le niveau testé** (`profiles.level`) vient du test de placement. Il
  mesure la LARGEUR — aspect, verbes de mouvement, participes, que l'app
  n'entraîne nulle part — mais en une douzaine de QCM, donc en
  reconnaissance, et une seule fois ;
- **le niveau de pratique** (`lib/progress/level-estimate.ts`) se recalcule
  à chaque visite du tableau de bord depuis ce que l'apprenant produit
  vraiment : déclencheurs maîtrisés par palier, précision par cas, mots
  arrivés à un intervalle de révision mature.

Aucun ne remplace l'autre, et l'écart entre les deux est le signal utile :
quand la pratique dépasse le niveau testé, le tableau de bord propose de
repasser le test.

Un déclencheur est « maîtrisé » selon **une seule** définition, exportée par
`lib/grammar/exercise-selector.ts` et réutilisée par l'estimation — sinon le
tableau de bord annoncerait « acquis » pendant que les exercices continuent
d'insister dessus.

### Ce que le niveau change concrètement

- **Ordre des cas** : `/cases` les présente dans l'ordre d'ACQUISITION
  (nominatif → prépositionnel → accusatif → génitif → datif → instrumental),
  pas dans l'ordre des grammaires russes. Une pastille indique ce qui est de
  saison, ce qui vient ensuite, et ce qui est déjà solide. Rien n'est
  verrouillé.
- **Difficulté du vocabulaire** : chaque nom porte un rang de fréquence, et
  `nounsForLevel` ouvre une part croissante de la banque — 113 mots courants
  à A0, les 451 à partir de B2. Décliner correctement un mot qu'on ne
  comprend pas n'apprend pas grand-chose.
- **Choix des déclencheurs** : le tirage suit les 7 niveaux de l'échelle, et
  la part visée par palier est normalisée par le nombre de déclencheurs de ce
  palier — sans quoi le tirage subit la composition de la banque (le génitif
  compte 24 déclencheurs intermédiaires pour 13 essentiels) au lieu du
  niveau. Un A0 reçoit ~86 % d'essentiels, un C1 une répartition équilibrée.
  Le palier suivant se débloque en avance dès que la maîtrise est démontrée
  **sur ce cas précis**.

`npm run check:progression` verrouille ces comportements par des seuils
explicites : monotonie des pools et de l'estimation, part maximale de
déclencheurs avancés servie à un débutant, et le fait qu'une pratique à 40 %
de réussite reste estimée A0.

## Ce qui reste à faire (pistes)

- Élargir la banque de noms (voir « Faire évoluer la banque » plus haut) :
  451 noms aujourd'hui, le dictionnaire en contient 17 800 exploitables — il
  ne manque que la traduction française.
- Corpus de classiques du domaine public (Pouchkine, Tchekhov…) pour compléter
  la lecture générée.
- Les **participes et gérondifs** : le dernier domaine que le test mesure
  sans que l'app l'entraîne. À traiter par transformation
  (« Человек, который читает → читающий человек ») plutôt que par schéma —
  un participe est une relative comprimée, ça se manipule, ça ne se dessine
  pas.
- Faire entrer `motion_progress` dans l'estimation continue du niveau : les
  seuils actuels sont calibrés sur les 136 déclencheurs de cas, les ajouter
  demande de les recalibrer.
- Étiqueter les 136 déclencheurs par niveau CEFR plutôt que par palier
  (basic/intermediate/advanced) : trois paliers ne permettent pas de séparer
  A1 de A2. Travail de contenu, pas de code.
- Élargir encore le vivier du test : 100 items tiennent 5 passations
  inédites, au-delà les questions commencent à revenir.
- Audio / prononciation via un TTS.

## Le captcha

**Cloudflare Turnstile**, le même système que la majorité des sites récents —
gratuit, illimité, et pour la plupart des visiteurs juste une case qui se
coche seule (pas de grille d'images à résoudre).

Le partage des rôles est volontairement asymétrique :

- **Le navigateur** ([components/auth/TurnstileWidget.tsx](components/auth/TurnstileWidget.tsx))
  affiche le widget et récupère un jeton à usage unique. Turnstile écrit
  lui-même ce jeton dans un input caché (`captchaToken`) que le formulaire
  poste normalement — ça marche même sans JavaScript côté validation finale
  (le widget, lui, a besoin de JS pour se résoudre).
- **L'action serveur** ([app/signup/actions.ts](app/signup/actions.ts))
  transmet ce jeton à `supabase.auth.signUp({ options: { captchaToken } })`.
- **Supabase** (Authentication → Attack Protection) est celui qui vérifie
  cryptographiquement le jeton auprès de Cloudflare, avec la clé secrète.
  C'est la partie importante : ça protège l'endpoint d'inscription
  lui-même — un script qui appellerait l'API Supabase directement, en
  contournant complètement notre formulaire, se ferait quand même rejeter.

Notre code ne voit jamais la clé secrète et ne fait aucun appel réseau vers
Cloudflare — Supabase s'en charge. Si le jeton est absent, expiré, ou déjà
consommé, Supabase renvoie `captcha_failed` ; l'action le traduit en message
et redemande un jeton neuf au widget (ils sont à usage unique).

Sans `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, le formulaire utilise la clé de test
Cloudflare (`1x00000000000000000000AA`) : le widget s'affiche et réussit
toujours, pratique pour développer sans compte Cloudflare, mais ça ne protège
rien — pense à configurer une vraie clé avant de déployer.

## Sécurité — rappel

Ne commite jamais `.env.local`. Si une clé fuite, révoque-la immédiatement dans
la console Anthropic et régénères-en une.

L'inscription ne dit jamais si une adresse est déjà utilisée : le même écran
« vérifie ta boîte mail » s'affiche dans tous les cas, pour éviter d'énumérer
les comptes existants.
#   p r i v e t 
 
 