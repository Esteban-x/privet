-- ════════════════════════════════════════════════════════════════
-- Les droits de table, écrits noir sur blanc.
--
-- LE PROBLÈME. RLS et les GRANT sont deux mécanismes distincts, et
-- PostgreSQL exige les DEUX. Une table peut avoir une politique
-- irréprochable et rester inaccessible : sans droit de table, la politique
-- n'est même jamais évaluée, la requête échoue sur « permission denied for
-- table ». Jusqu'ici, aucune des tables du schéma initial n'avait de GRANT
-- explicite — elles s'en remettaient aux droits par défaut du projet
-- hébergé.
--
-- POURQUOI ÇA NE TIENT PAS. Ces droits par défaut dépendent du RÔLE qui
-- crée la table. Sur une base Supabase récente, `alter default privileges`
-- accorde à `authenticated` tout (arwdDxtm) pour les tables créées par
-- `supabase_admin` — le rôle de l'éditeur SQL du tableau de bord — mais
-- seulement Dxtm (truncate, references, trigger, maintain, JAMAIS
-- select/insert/update/delete) pour celles créées par `postgres`, qui est
-- le rôle utilisé par `supabase db push`, donc par la CI de migrations.
--
-- Autrement dit : toute table née d'une migration est muette pour l'app.
-- C'est déjà le cas d'`exercise_progress` (migration 20260825130000), qui
-- porte la progression de l'alphabet, des chiffres et de la conjugaison —
-- et l'échec est SILENCIEUX côté écran, les modules retombant sur leur
-- correction locale sans rien enregistrer.
--
-- Les trois tables ajoutées ensuite (plan_limits, ai_usage, tts_audio) ont
-- leur GRANT parce que le piège avait été repéré à ce moment-là. Cette
-- migration finit le travail pour les autres, et rend surtout le schéma
-- REPRODUCTIBLE : un `supabase db reset`, une base de recette ou une
-- restauration après incident donnent désormais une app qui fonctionne.
--
-- Sans effet si les droits sont déjà là — GRANT est idempotent.
-- ════════════════════════════════════════════════════════════════

-- ─── Les tables appartenant à un utilisateur ────────────────────
-- RLS les borne déjà à `auth.uid() = user_id` (politique `own_all`, en
-- `for all`) : le droit de table dit ce que le rôle peut faire, la
-- politique dit sur quelles lignes. DELETE compris — c'est l'intention des
-- politiques existantes, et il ne peut porter que sur ses propres lignes.
grant select, insert, update, delete on public.activity_log           to authenticated;
grant select, insert, update, delete on public.adjective_progress     to authenticated;
grant select, insert, update, delete on public.aspect_progress        to authenticated;
grant select, insert, update, delete on public.case_progress          to authenticated;
grant select, insert, update, delete on public.case_trigger_progress  to authenticated;
grant select, insert, update, delete on public.exercise_progress      to authenticated;
grant select, insert, update, delete on public.level_tests            to authenticated;
grant select, insert, update, delete on public.motion_progress        to authenticated;
grant select, insert, update, delete on public.participle_progress    to authenticated;
grant select, insert, update, delete on public.reading_texts          to authenticated;
grant select, insert, update, delete on public.srs_cards              to authenticated;
grant select, insert, update, delete on public.vocab_lists            to authenticated;
grant select, insert, update, delete on public.vocab_words            to authenticated;

-- Le profil : pas de DELETE. Supprimer son compte passe par
-- `delete_own_account()`, une fonction security definer qui efface aussi
-- la ligne auth.users ; un DELETE direct laisserait un compte capable de
-- se reconnecter sans profil.
--
-- L'UPDATE est ouvert, mais le trigger `profiles_guard_plan` interdit les
-- colonnes d'abonnement : RLS ne sait pas restreindre une colonne, lui si.
grant select, insert, update on public.profiles to authenticated;

-- ─── Rien de plus pour le reste ─────────────────────────────────
-- ai_usage    : SELECT seul (déjà accordé) — les écritures passent par
--               consume_ai_quota / record_ai_tokens, security definer.
-- ai_burst    : aucun droit, volontairement. Rien ne le lit côté client.
-- plan_limits : SELECT à anon et authenticated (déjà accordé) — la page de
--               prix doit pouvoir annoncer ses propres plafonds.
-- tts_audio   : SELECT seul (déjà accordé) — écriture par record_tts_audio.
--
-- Aucune séquence dans le schéma (identifiants en uuid) : pas de
-- `grant usage on sequences` à prévoir.
