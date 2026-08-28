-- ════════════════════════════════════════════════════════════════
-- CE FICHIER NE SE COLLE PLUS DANS L'ÉDITEUR SQL.
--
-- La source de vérité est `supabase/migrations/` : une suite de fichiers
-- datés, appliqués une seule fois chacun, dont Supabase tient le compte
-- dans la base. On applique avec `npm run db:push`.
--
-- Ce fichier reste comme VUE CONSOLIDÉE du schéma — utile pour lire d'un
-- coup ce que la base contient, et référencé par quelques commentaires du
-- code. Il n'est plus exécuté par personne, et il peut être régénéré :
--
--     npx supabase db dump --local -f supabase/schema.sql
--
-- Y ajouter une table sans écrire la migration correspondante ne changera
-- donc rien à la base : c'est la migration qui fait foi.
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- Schéma Privetik — à exécuter dans Supabase → SQL Editor → New query
-- Idempotent : peut être relancé sans casser l'existant.
-- ════════════════════════════════════════════════════════════════

-- ─── Types ──────────────────────────────────────────────────────
do $$ begin
  create type cefr_level as enum ('A0','A1','A2','B1','B2','C1','C2');
exception when duplicate_object then null; end $$;

-- ─── profiles ───────────────────────────────────────────────────
-- Une ligne par utilisateur, liée à auth.users. Créée automatiquement
-- à l'inscription via le trigger plus bas.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  first_name    text,                    -- saisis à l'inscription email/mot de passe
  last_name     text,
  avatar_url    text,
  level         cefr_level default 'A0',
  onboarded     boolean default false,   -- test de niveau passé ?
  streak_count  int default 0,
  streak_last   date,
  xp            int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Rattrapage pour les bases créées avant l'inscription email/mot de passe.
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name  text;

-- Objectif quotidien de révision de vocabulaire (module /vocabulary/review,
-- façon Duolingo/Anki) — nombre de mots à réviser par jour, configurable.
alter table public.profiles add column if not exists vocab_daily_goal int default 15;

-- ─── level_tests ────────────────────────────────────────────────
-- Historique des tests de niveau passés (le plus récent fait foi).
create table if not exists public.level_tests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  score        int not null,
  total        int not null,
  result_level cefr_level not null,
  detail       jsonb,                    -- réponses détaillées
  taken_at     timestamptz default now()
);

-- ─── case_progress ──────────────────────────────────────────────
-- Précision par cas × genre (remplace le localStorage précédent).
create table if not exists public.case_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  case_id   text not null,
  gender    text not null,
  attempts  int default 0,
  correct   int default 0,
  last_seen timestamptz default now(),
  primary key (user_id, case_id, gender)
);

-- ─── srs_cards ──────────────────────────────────────────────────
-- État de répétition espacée par carte de vocabulaire.
create table if not exists public.srs_cards (
  user_id        uuid not null references auth.users(id) on delete cascade,
  card_id        text not null,          -- id du mot (banque locale ou généré)
  word_ru        text,
  word_fr        text,
  ease_factor    real default 2.5,
  interval_days  int default 0,
  repetitions    int default 0,
  due_at         timestamptz default now(),
  last_reviewed  timestamptz,
  primary key (user_id, card_id)
);

-- ─── vocab_lists / vocab_words ────────────────────────────────────
-- Listes de vocabulaire personnelles (page /vocabulary/lists) : l'utilisateur
-- crée ses propres listes et y ajoute des mots à réviser, en plus du
-- vocabulaire intégré (lib/vocabulary/data.ts, non stocké en base).
create table if not exists public.vocab_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);
create index if not exists vocab_lists_user on public.vocab_lists (user_id);

create table if not exists public.vocab_words (
  id              uuid primary key default gen_random_uuid(),
  list_id         uuid not null references public.vocab_lists(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  ru              text not null,
  transliteration text,
  fr              text not null,
  example_ru      text,
  example_fr      text,
  created_at      timestamptz default now()
);
create index if not exists vocab_words_list on public.vocab_words (list_id);

-- Classification grammaticale (genre/animacité/radical), déduite à l'ajout
-- du mot (heuristique + IA de secours, voir lib/vocabulary/grammar-classify.ts
-- et app/api/vocab/words/route.ts) pour permettre au mot d'entrer dans le
-- pool des exercices de cas (module /cases). Nullable : un mot pas encore
-- classifié reste utilisable en vocabulaire classique, simplement absent
-- des exercices de déclinaison tant qu'il n'a pas de genre connu.
alter table public.vocab_words add column if not exists gender text;
alter table public.vocab_words add column if not exists animacy text;
alter table public.vocab_words add column if not exists stem_type text;
alter table public.vocab_words add column if not exists indeclinable boolean default false;
-- Genre français de la traduction (m/f) — indépendant du genre russe,
-- nécessaire pour choisir le bon article (un/une, ce/cet/cette) quand le
-- mot est inséré dans une phrase d'exercice de cas. Ne peut pas se déduire
-- heuristiquement (arbitraire d'une langue à l'autre) : uniquement rempli
-- par l'IA de classification.
alter table public.vocab_words add column if not exists french_gender text;

-- Priorité de révision, choisie par l'APPRENANT (« à travailler » /
-- « normal » / « je le sais »). Elle remplace l'ancien classement déduit du
-- nombre de répétitions SRS : la machine décidait qu'un mot était maîtrisé
-- après deux réussites d'affilée, ce que l'apprenant n'a jamais demandé et
-- ne pouvait pas corriger. Ici c'est lui qui range ses mots, et le SM-2 ne
-- sert plus qu'à espacer les « normal » entre eux.
--   priority → toujours dans la file, en tête
--   normal   → soumis à l'intervalle SRS (srs_cards.due_at)
--   known    → hors file tant qu'il n'est pas remis à normal
alter table public.vocab_words add column if not exists focus text not null default 'normal';
alter table public.vocab_words drop constraint if exists vocab_words_focus_check;
alter table public.vocab_words
  add constraint vocab_words_focus_check check (focus in ('priority', 'normal', 'known'));

-- Explication du mot rédigée par l'IA (nuance, registre, exemples, pièges),
-- mise en cache ici parce qu'elle ne dépend que du mot : la calculer une
-- fois évite de repayer des tokens à chaque ouverture de la fiche.
-- Voir lib/vocabulary/explanation.ts et app/api/vocab/explain.
alter table public.vocab_words add column if not exists explanation jsonb;

-- ─── case_trigger_progress ──────────────────────────────────────
-- Précision par cas × déclencheur (préposition/verbe/expression, voir
-- lib/grammar/triggers.ts) — plus fin que case_progress (cas × genre) :
-- sert à prioriser les déclencheurs les moins maîtrisés dans le tirage
-- des exercices (lib/grammar/exercise-selector.ts).
create table if not exists public.case_trigger_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  case_id    text not null,
  trigger_id text not null,
  attempts   int default 0,
  correct    int default 0,
  last_seen  timestamptz default now(),
  primary key (user_id, case_id, trigger_id)
);

-- ─── motion_progress ────────────────────────────────────────────
-- Précision par compétence du module « verbes de mouvement »
-- (lib/motion/exercises.ts : mode, direction, prefix, government). Même
-- forme que case_trigger_progress : un compteur par compétence, alimenté
-- par app/api/motion/attempt.
create table if not exists public.motion_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  skill_id  text not null,
  attempts  int default 0,
  correct   int default 0,
  last_seen timestamptz default now(),
  primary key (user_id, skill_id)
);

-- ─── aspect_progress ────────────────────────────────────────────
-- Précision par compétence du module « aspect verbal »
-- (lib/aspect/exercises.ts : past, markers, future, imperative, pairs).
-- Même forme que motion_progress.
create table if not exists public.aspect_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  skill_id  text not null,
  attempts  int default 0,
  correct   int default 0,
  last_seen timestamptz default now(),
  primary key (user_id, skill_id)
);

-- ─── participle_progress ────────────────────────────────────────
-- Précision par compétence du module « participes et gérondifs »
-- (lib/participles/exercises.ts : active, passive, short, gerund, subject).
create table if not exists public.participle_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  skill_id  text not null,
  attempts  int default 0,
  correct   int default 0,
  last_seen timestamptz default now(),
  primary key (user_id, skill_id)
);

-- ─── adjective_progress ─────────────────────────────────────────
-- Précision par compétence du module « accord de l'adjectif »
-- (lib/adjectives/exercises.ts : nominative, spelling, accusative,
-- oblique, plural). Ce module était un onglet du module Cas ; il en a été
-- sorti parce qu'il y tirait le couple adjectif + nom au hasard dans deux
-- banques, ce qui produisait une phrase sur trois hors de sens. Les
-- réponses de cet onglet vivaient dans case_progress et y restent — elles
-- comptent pour la précision du cas concerné, ce qui reste vrai.
create table if not exists public.adjective_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  skill_id  text not null,
  attempts  int default 0,
  correct   int default 0,
  last_seen timestamptz default now(),
  primary key (user_id, skill_id)
);

-- ─── exercise_progress ──────────────────────────────────────────
-- Précision par module × compétence pour les modules d'exercices ajoutés
-- après les cinq premiers (nombres, conjugaison, alphabet…).
--
-- POURQUOI UNE TABLE UNIQUE ICI, ALORS QUE LES CINQ PREMIERS EN ONT CHACUN
-- UNE. case_progress, motion_progress, aspect_progress, participle_progress
-- et adjective_progress ont la même forme à un nom près : cinq tables pour
-- une seule structure. Elles restent (le calcul de niveau les lit
-- nommément, lib/progress/level-estimate.ts), mais la sixième n'a pas de
-- raison d'être la sixième copie : `module_id` fait le travail du nom de
-- table, et un module de plus ne demande plus de migration.
create table if not exists public.exercise_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  module_id text not null,               -- 'numbers' | 'conjugation' | 'alphabet'
  skill_id  text not null,
  attempts  int default 0,
  correct   int default 0,
  last_seen timestamptz default now(),
  primary key (user_id, module_id, skill_id)
);

-- ─── activity_log ───────────────────────────────────────────────
-- Journal d'activité pour alimenter le dashboard (graphes, streak…).
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,             -- 'case' | 'motion' | 'aspect' | 'participle' | 'adjective'
                                         -- | 'alphabet' | 'conjugation' | 'numbers' | 'vocab' | 'reading'
  correct    boolean,
  meta       jsonb,
  created_at timestamptz default now()
);
create index if not exists activity_log_user_time on public.activity_log (user_id, created_at desc);

-- ─── Purge : professeur IA conversationnel (fonctionnalité retirée) ──
-- Le tuteur/chat n'existe plus dans l'app : ses deux tables et les lignes
-- d'activité qu'il écrivait sont supprimées ici plutôt que laissées
-- orphelines. Ordre imposé par la FK (chat_messages -> chat_conversations).
-- Idempotent : sans objet sur une base neuve, ou déjà purgée.
drop table if exists public.chat_messages;
drop table if exists public.chat_conversations;
delete from public.activity_log where kind = 'chat';

-- ─── reading_texts ────────────────────────────────────────────────
-- Textes de lecture générés par l'IA, sauvegardés automatiquement (comme un
-- mot ajouté à une liste de vocabulaire) plutôt qu'éphémères — listés et
-- supprimables individuellement depuis /reading, même logique que
-- vocab_lists. `sentences` reprend la forme GlossedWord[][] (lib/reading/texts.ts),
-- chaque mot pouvant porter un tag de cas grammatical en plus de sa glose.
create table if not exists public.reading_texts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  title_fr   text,
  level      text not null,
  sentences  jsonb not null,
  summary_fr text,
  created_at timestamptz default now()
);
create index if not exists reading_texts_user_time on public.reading_texts (user_id, created_at desc);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security : chaque utilisateur ne voit QUE ses données.
-- ════════════════════════════════════════════════════════════════
alter table public.exercise_progress     enable row level security;
alter table public.profiles              enable row level security;
alter table public.level_tests           enable row level security;
alter table public.case_progress         enable row level security;
alter table public.case_trigger_progress enable row level security;
alter table public.motion_progress       enable row level security;
alter table public.aspect_progress       enable row level security;
alter table public.participle_progress   enable row level security;
alter table public.adjective_progress    enable row level security;
alter table public.srs_cards             enable row level security;
alter table public.activity_log          enable row level security;
alter table public.vocab_lists           enable row level security;
alter table public.vocab_words           enable row level security;
alter table public.reading_texts         enable row level security;

-- Helper : politique "propriétaire uniquement" sur user_id.
do $$
declare t text;
begin
  foreach t in array array['level_tests','case_progress','case_trigger_progress','motion_progress','aspect_progress','participle_progress','adjective_progress','exercise_progress','srs_cards','activity_log','vocab_lists','vocab_words','reading_texts']
  loop
    execute format('drop policy if exists own_select on public.%I;', t);
    execute format('drop policy if exists own_all on public.%I;', t);
    execute format($f$create policy own_all on public.%I
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);$f$, t);
  end loop;
end $$;

-- profiles utilise `id` (= auth.uid) plutôt que user_id.
drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ════════════════════════════════════════════════════════════════
-- Trigger : créer une ligne profiles à chaque inscription.
-- ════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Google renseigne full_name/name ; l'inscription email/mot de passe envoie
  -- first_name + last_name. On accepte les deux.
  insert into public.profiles (id, display_name, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(trim(concat_ws(' ',
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name')), '')
    ),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════
-- Suppression de compte (self-service, page /account).
-- ════════════════════════════════════════════════════════════════
-- RLS interdit tout accès direct au schéma auth depuis le client (clé anon).
-- Cette fonction, exécutée avec les droits de son propriétaire (security
-- definer) plutôt que ceux de l'appelant, l'autorise à supprimer SA PROPRE
-- ligne — jamais celle d'un autre : auth.uid() vient du JWT de la requête et
-- ne peut pas être falsifié depuis le client. search_path vidé + tout
-- qualifié explicitement, pour ne pas dépendre d'objets résolus ailleurs.
-- La suppression cascade sur profiles, level_tests, case_progress,
-- case_trigger_progress, adjective_progress, srs_cards, activity_log,
-- vocab_lists, vocab_words,
-- reading_texts (toutes `references auth.users(id)
-- on delete cascade`) ainsi que sur les tables internes de Supabase Auth
-- (sessions, identités, tokens…).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

-- ════════════════════════════════════════════════════════════════
-- MISES À JOUR — à exécuter UNE FOIS sur une base créée avant cette
-- version. Tout ce bloc est sans effet sur une base neuve : les tables et
-- le type ci-dessus sont déjà créés dans leur forme finale.
--
-- Copie-colle ce bloc entier dans Supabase → SQL Editor → New query.
-- ════════════════════════════════════════════════════════════════

-- 1. Suppression des thèmes et de l'objectif libre.
--    Les listes de vocabulaire sont conservées : seul leur rattachement à
--    un thème disparaît.
drop index if exists vocab_lists_user_topic;
alter table public.vocab_lists drop column if exists topic_id;
alter table public.profiles    drop column if exists topics;
alter table public.profiles    drop column if exists goals;

-- 2. Niveau C2 sur l'échelle. Le test de placement s'arrête à C1 : C2 sert
--    aux textes de lecture, dont le niveau se demande indépendamment du
--    niveau mesuré.
alter type cefr_level add value if not exists 'C2';

-- 3. Tables de progression des modules de grammaire ajoutés après la
--    version initiale. Le `create table if not exists` plus haut les crée
--    déjà sur une base neuve ; ici on ne fait qu'activer la sécurité au cas
--    où la table préexisterait sans elle.
alter table public.motion_progress     enable row level security;
alter table public.aspect_progress     enable row level security;
alter table public.participle_progress enable row level security;
alter table public.adjective_progress  enable row level security;

-- 4. Politiques « propriétaire uniquement » sur ces tables. Le bloc
--    `do $$` plus haut les couvre déjà : le relancer suffit, cette ligne
--    n'est là que pour rappeler qu'il FAUT le relancer.
--    → remonte au bloc « Row Level Security » et réexécute-le.

-- 5. Explications de vocabulaire mises en cache (option « Expliquer » sur
--    un mot d'une liste personnelle). Créée plus haut sur une base neuve.
alter table public.vocab_words add column if not exists explanation jsonb;
