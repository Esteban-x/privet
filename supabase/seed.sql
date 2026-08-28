-- Données de développement local, rejouées à chaque `npm run db:reset`.
--
-- POURQUOI CE FICHIER EXISTE. Sans lui, la base locale sort vide : aucun
-- compte, donc impossible de se connecter, donc impossible d'essayer quoi
-- que ce soit sans passer par la production. Une base de test qu'on ne peut
-- pas utiliser ne sert à rien.
--
-- CE FICHIER NE PART JAMAIS EN PRODUCTION. Les migrations sont appliquées
-- par `db push` ; le seed ne l'est que par `db reset`, qui ne touche que la
-- base locale. Le mot de passe ci-dessous est donc sans conséquence — il ne
-- déverrouille rien d'autre qu'un conteneur sur ta machine.
--
-- Identifiants : test@privetik.local / motdepasse

-- ─── Un compte ───────────────────────────────────────────────────
-- Supabase gère les comptes dans le schéma `auth`. On y écrit
-- directement, faute d'API disponible pendant un `db reset`.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'test@privetik.local',
  extensions.crypt('motdepasse', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Test"}'::jsonb
)
on conflict (id) do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"test@privetik.local"}'::jsonb,
  'email', now(), now(), now()
)
on conflict (provider, provider_id) do nothing;

-- ─── Le profil, que l'application attend ─────────────────────────
insert into public.profiles (id, display_name, first_name, level, onboarded, streak_count, xp)
values ('11111111-1111-1111-1111-111111111111', 'Test', 'Test', 'A2', true, 3, 250)
on conflict (id) do nothing;

-- ─── Une liste de vocabulaire, avec les trois priorités ──────────
insert into public.vocab_lists (id, user_id, name)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Premiers mots'
)
on conflict (id) do nothing;

insert into public.vocab_words (id, list_id, user_id, ru, transliteration, fr, gender, animacy, focus)
values
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222',
   '11111111-1111-1111-1111-111111111111', 'спаси́бо', 'spassiba', 'merci',
   'neuter', 'inanimate', 'known'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222',
   '11111111-1111-1111-1111-111111111111', 'кни́га', 'kniga', 'livre',
   'feminine', 'inanimate', 'normal'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
   '11111111-1111-1111-1111-111111111111', 'вре́мя', 'vriemia', 'temps',
   'neuter', 'inanimate', 'priority')
on conflict (id) do nothing;

-- ─── Un peu de progression, pour que les écrans ne soient pas vides ──
insert into public.case_progress (user_id, case_id, gender, attempts, correct)
values
  ('11111111-1111-1111-1111-111111111111', 'nominative', 'masculine', 20, 18),
  ('11111111-1111-1111-1111-111111111111', 'genitive', 'feminine', 15, 9)
on conflict (user_id, case_id, gender) do nothing;

insert into public.exercise_progress (user_id, module_id, skill_id, attempts, correct)
values
  ('11111111-1111-1111-1111-111111111111', 'alphabet', 'letters', 12, 11),
  ('11111111-1111-1111-1111-111111111111', 'conjugation', 'present1', 8, 5),
  ('11111111-1111-1111-1111-111111111111', 'numbers', 'time', 6, 4)
on conflict (user_id, module_id, skill_id) do nothing;
