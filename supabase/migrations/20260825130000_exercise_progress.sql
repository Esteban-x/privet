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

-- Même politique que les autres tables : chacun ne voit que ses lignes.
alter table public.exercise_progress enable row level security;
drop policy if exists own_all on public.exercise_progress;
create policy own_all on public.exercise_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Le journal d'activité reçoit trois types de plus (alphabet, conjugation,
-- numbers). `kind` est un texte libre : rien à modifier en base, seul le
-- commentaire du schéma était devenu incomplet.
comment on column public.activity_log.kind is
  'case | motion | aspect | participle | adjective | alphabet | conjugation | numbers | vocab | reading';
