-- ════════════════════════════════════════════════════════════════
-- Schéma Privet — à exécuter dans Supabase → SQL Editor → New query
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

-- ─── activity_log ───────────────────────────────────────────────
-- Journal d'activité pour alimenter le dashboard (graphes, streak…).
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,             -- 'case' | 'motion' | 'aspect' | 'participle' | 'vocab' | 'reading' | 'chat'
  correct    boolean,
  meta       jsonb,
  created_at timestamptz default now()
);
create index if not exists activity_log_user_time on public.activity_log (user_id, created_at desc);

-- ─── chat_conversations / chat_messages ──────────────────────────
-- Plusieurs fils de discussion par utilisateur avec le professeur IA
-- (façon ChatGPT/Claude), chacun listé dans la sidebar de /tutor avec
-- possibilité de suppression individuelle.
create table if not exists public.chat_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default 'Nouvelle conversation',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists chat_conversations_user_time on public.chat_conversations (user_id, updated_at desc);

create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null,             -- 'user' | 'assistant'
  content    text not null,
  created_at timestamptz default now()
);
create index if not exists chat_messages_user_time on public.chat_messages (user_id, created_at);

-- Rattachement à une conversation (colonne ajoutée après coup : les
-- messages existaient avant l'introduction des fils multiples).
alter table public.chat_messages add column if not exists conversation_id uuid references public.chat_conversations(id) on delete cascade;

-- Rattrapage idempotent : regroupe les messages déjà en base (avant les
-- fils multiples) dans une conversation "Historique" par utilisateur, pour
-- ne rien perdre. Ne fait rien si tous les messages ont déjà une
-- conversation (relances suivantes, ou base neuve sans messages).
do $$
declare
  u record;
  conv_id uuid;
begin
  for u in select distinct user_id from public.chat_messages where conversation_id is null
  loop
    insert into public.chat_conversations (user_id, title) values (u.user_id, 'Historique')
    returning id into conv_id;
    update public.chat_messages set conversation_id = conv_id
      where user_id = u.user_id and conversation_id is null;
  end loop;
end $$;

alter table public.chat_messages alter column conversation_id set not null;
create index if not exists chat_messages_conversation on public.chat_messages (conversation_id, created_at);

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
alter table public.profiles              enable row level security;
alter table public.level_tests           enable row level security;
alter table public.case_progress         enable row level security;
alter table public.case_trigger_progress enable row level security;
alter table public.motion_progress       enable row level security;
alter table public.aspect_progress       enable row level security;
alter table public.participle_progress   enable row level security;
alter table public.srs_cards             enable row level security;
alter table public.activity_log          enable row level security;
alter table public.chat_conversations    enable row level security;
alter table public.chat_messages         enable row level security;
alter table public.vocab_lists           enable row level security;
alter table public.vocab_words           enable row level security;
alter table public.reading_texts         enable row level security;

-- Helper : politique "propriétaire uniquement" sur user_id.
do $$
declare t text;
begin
  foreach t in array array['level_tests','case_progress','case_trigger_progress','motion_progress','aspect_progress','participle_progress','srs_cards','activity_log','chat_conversations','chat_messages','vocab_lists','vocab_words','reading_texts']
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
-- case_trigger_progress, srs_cards, activity_log, chat_conversations, chat_messages,
-- vocab_lists, vocab_words, reading_texts (toutes `references auth.users(id)
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

-- ─── Migration : suppression des thèmes et de l'objectif ────────────
-- À exécuter une fois sur une base créée avant cette version. Sans effet
-- sur une base neuve (les colonnes n'y ont jamais existé). Les listes de
-- vocabulaire elles-mêmes sont conservées : seul leur rattachement à un
-- thème disparaît.
drop index if exists vocab_lists_user_topic;
alter table public.vocab_lists drop column if exists topic_id;
alter table public.profiles    drop column if exists topics;
alter table public.profiles    drop column if exists goals;

-- ─── Migration : ajout du niveau C2 à l'échelle ────────────────────
-- Sans effet sur une base neuve (le type est déjà créé avec C2 ci-dessus).
-- Le test de placement s'arrête à C1 : C2 sert aux textes de lecture, dont
-- le niveau se demande indépendamment du niveau mesuré.
alter type cefr_level add value if not exists 'C2';

-- ─── Migration : module « verbes de mouvement » ─────────────────────
-- Sans effet si la table existe déjà (create ... if not exists ci-dessus).
-- À exécuter sur une base créée avant ce module.
alter table public.motion_progress enable row level security;

-- ─── Migration : module « aspect verbal » ───────────────────────────
-- Sans effet si la table existe déjà.
alter table public.aspect_progress enable row level security;

-- ─── Migration : module « participes et gérondifs » ─────────────────
alter table public.participle_progress enable row level security;
