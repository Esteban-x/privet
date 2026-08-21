-- ════════════════════════════════════════════════════════════════
-- Schéma Privet — à exécuter dans Supabase → SQL Editor → New query
-- Idempotent : peut être relancé sans casser l'existant.
-- ════════════════════════════════════════════════════════════════

-- ─── Types ──────────────────────────────────────────────────────
do $$ begin
  create type cefr_level as enum ('A0','A1','A2','B1','B2','C1');
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
  goals         text,                    -- objectif libre ("voyager", "lire Dostoïevski"…)
  topics        text[] default '{}',     -- thèmes choisis à l'inscription
  onboarded     boolean default false,   -- test de niveau + thèmes complétés ?
  streak_count  int default 0,
  streak_last   date,
  xp            int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Rattrapage pour les bases créées avant l'inscription email/mot de passe.
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name  text;

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

-- ─── activity_log ───────────────────────────────────────────────
-- Journal d'activité pour alimenter le dashboard (graphes, streak…).
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,             -- 'case' | 'vocab' | 'reading' | 'chat'
  correct    boolean,
  meta       jsonb,
  created_at timestamptz default now()
);
create index if not exists activity_log_user_time on public.activity_log (user_id, created_at desc);

-- ─── chat_messages ──────────────────────────────────────────────
-- Historique du tuteur IA (pour donner du contexte au modèle + reprise).
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null,             -- 'user' | 'assistant'
  content    text not null,
  created_at timestamptz default now()
);
create index if not exists chat_messages_user_time on public.chat_messages (user_id, created_at);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security : chaque utilisateur ne voit QUE ses données.
-- ════════════════════════════════════════════════════════════════
alter table public.profiles       enable row level security;
alter table public.level_tests    enable row level security;
alter table public.case_progress  enable row level security;
alter table public.srs_cards      enable row level security;
alter table public.activity_log   enable row level security;
alter table public.chat_messages  enable row level security;

-- Helper : politique "propriétaire uniquement" sur user_id.
do $$
declare t text;
begin
  foreach t in array array['level_tests','case_progress','srs_cards','activity_log','chat_messages']
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
