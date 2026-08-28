-- ════════════════════════════════════════════════════════════════
-- Plans, quotas et compteurs d'usage IA.
--
-- POURQUOI DES QUOTAS EN BASE ET NON DANS LE CODE. Les sept routes qui
-- appellent Anthropic n'avaient aucune borne : un seul compte connecté
-- suffisait à saturer les limites de l'organisation (~120-180 $/h) et à
-- atteindre le plafond de dépense mensuel en trois heures — après quoi
-- l'API répond 429 jusqu'au 1er du mois suivant, pour TOUT LE MONDE. Le
-- risque n'est pas tant la facture que la panne totale auto-infligée.
--
-- POURQUOI UNE TABLE DE PLAFONDS PLUTÔT QUE DES CONSTANTES. Les bons
-- chiffres ne se connaissent qu'après avoir vu l'usage réel. Les mettre en
-- base permet de les corriger par un UPDATE, sans redéploiement — et
-- surtout d'ajouter un plan plus tard (un « pro », un tarif étudiant) sans
-- toucher au code applicatif : une ligne par (plan, fonctionnalité).
-- ════════════════════════════════════════════════════════════════

-- ─── Le plan porté par le profil ────────────────────────────────
-- 'free' | 'premium'. Un essai gratuit ou un bêta-testeur, c'est
-- simplement 'premium' avec une date d'expiration et une `plan_source`
-- différente : pas besoin d'un troisième plan pour ça.
alter table public.profiles add column if not exists plan text not null default 'free';
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'premium'));

-- D'où vient le premium. Sert au webhook Stripe : une résiliation
-- d'abonnement ne doit JAMAIS rétrograder un bêta-testeur ou un compte
-- offert, qui n'ont pas d'abonnement à résilier.
alter table public.profiles add column if not exists plan_source text;
alter table public.profiles drop constraint if exists profiles_plan_source_check;
alter table public.profiles add constraint profiles_plan_source_check
  check (plan_source is null or plan_source in ('stripe', 'grant', 'trial'));

-- null = pas d'échéance (abonnement Stripe actif, ou accès offert sans
-- limite). Une date passée fait retomber en 'free' à la lecture, sans
-- qu'aucune tâche planifiée n'ait à repasser derrière.
alter table public.profiles add column if not exists plan_expires_at timestamptz;

alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
create unique index if not exists profiles_stripe_customer
  on public.profiles (stripe_customer_id) where stripe_customer_id is not null;

-- ─── Le profil est modifiable par son propriétaire… sauf ici ────
-- La politique RLS `own_profile` est un `for all` : sans ce garde-fou,
-- n'importe quel utilisateur connecté pourrait s'offrir le premium par un
-- simple `update profiles set plan = 'premium'` depuis le navigateur, la
-- clé anon étant publique par construction. RLS ne sait pas restreindre
-- une COLONNE — d'où le trigger.
create or replace function public.guard_plan_columns()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  -- auth.role() vaut 'authenticated' pour une requête venue du navigateur,
  -- 'service_role' pour le webhook Stripe, et null depuis l'éditeur SQL.
  -- Seul le premier cas est bridé.
  if coalesce(auth.role(), 'service_role') = 'authenticated' then
    if new.plan is distinct from old.plan
       or new.plan_source is distinct from old.plan_source
       or new.plan_expires_at is distinct from old.plan_expires_at
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
      raise exception 'Les colonnes d''abonnement ne sont pas modifiables depuis le client.'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end $fn$;

drop trigger if exists profiles_guard_plan on public.profiles;
create trigger profiles_guard_plan
  before update on public.profiles
  for each row execute function public.guard_plan_columns();

-- ─── plan_limits : les plafonds, par plan et par fonctionnalité ──
--
-- Quatre bornes complémentaires, chacune contre un usage différent :
--   burst_cap    (par minute) — contre le script parallèle. C'est ELLE qui
--                  empêche de vider un quota journalier en dix secondes.
--   daily_cap                 — contre l'usage déraisonnable d'une journée.
--   monthly_cap               — contre l'usage déraisonnable soutenu : borne
--                  la queue de distribution, donc le coût du pire abonné.
--   lifetime_cap              — pour le gratuit : « 2 textes de lecture, pas
--                  2 par jour ». null = pas de borne de ce type.
--
-- Une fonctionnalité ABSENTE de la table pour un plan donné est refusée :
-- ajouter un plan sans le remplir ne l'ouvre pas par accident.
create table if not exists public.plan_limits (
  plan         text not null,
  feature      text not null,
  burst_cap    int not null default 0,   -- par minute glissante
  daily_cap    int not null default 0,
  monthly_cap  int,
  lifetime_cap int,
  primary key (plan, feature)
);

-- Les plafonds sont lisibles par l'app (afficher « il te reste 3 textes »)
-- mais écrits uniquement par le service_role ou depuis l'éditeur SQL.
--
-- LE `GRANT` EST INDISPENSABLE, la politique RLS ne suffit pas : ce sont
-- deux mécanismes distincts, et PostgreSQL exige les deux. Sans lui, une
-- lecture depuis l'app échoue sur « permission denied for table », la
-- politique n'étant même jamais évaluée. Le projet hébergé accorde ces
-- droits par défaut à la création d'une table, mais une base locale
-- (`supabase db reset`) non — les écrire ici rend les deux identiques.
alter table public.plan_limits enable row level security;
grant select on public.plan_limits to authenticated;
drop policy if exists plan_limits_read on public.plan_limits;
create policy plan_limits_read on public.plan_limits for select to authenticated using (true);

-- ─── Les valeurs ────────────────────────────────────────────────
--
-- COMMENT ELLES ONT ÉTÉ CHOISIES. Coût mesuré par appel (Haiku 4.5,
-- 1 $/M entrée, 5 $/M sortie, prompts comptés avec count_tokens) :
--   reading  0,021 $   explain 0,0066 $   exercise_ai 0,0045 $
--   suggest  0,0015 $  classify 0,0012 $  verify      0,0011 $
-- Les plafonds premium sont placés très au-dessus de ce qu'un humain fait
-- (150 exercices IA = ~2 h de drill quotidien), donc INVISIBLES à l'usage
-- normal : ils ne servent qu'à borner le pire cas.
insert into public.plan_limits (plan, feature, burst_cap, daily_cap, monthly_cap, lifetime_cap) values
  -- ── Gratuit : vitrine. Tout ce qui ne coûte rien reste ouvert en grand
  -- (cours, alphabet, tables, test de niveau, SRS, exercices locaux) et
  -- n'est même pas compté ici. Seuls les appels IA le sont.
  --
  -- exercise_ai à 0 : la route renvoie alors 429 et CaseDeclension retombe
  -- silencieusement sur le gabarit fixe, déjà codé. Le gratuit garde donc
  -- de vrais exercices de déclinaison, simplement pas de mise en situation
  -- rédigée par l'IA.
  ('free', 'exercise_ai',      0,   0,    0,    null),
  -- La lecture est la fonctionnalité la plus impressionnante et la plus
  -- chère : deux textes À VIE, c'est l'hameçon.
  --
  -- LE PLAFOND DE RAFALE EST VOLONTAIREMENT AU-DESSUS DU JOURNALIER. La
  -- rafale est verrouillée en premier (c'est elle qui sérialise les appels
  -- concurrents), donc à égalité elle l'emporte et l'utilisateur lisait
  -- « trop de demandes d'affilée, réessaie dans une minute » là où il
  -- fallait lire « ta découverte est épuisée, voici l'abonnement ». Sur le
  -- plan gratuit, c'est exactement le message qui décide d'un achat.
  ('free', 'reading',          4,   1,    2,    2),
  -- L'explication de mot : présente, mais fortement limitée. Deux par jour
  -- et vingt en tout — de quoi comprendre ce que ça apporte. Elles sont
  -- mises en cache en base, donc elles restent consultables ensuite sans
  -- rien reconsommer.
  ('free', 'explain',          5,   2,    20,   20),
  ('free', 'explain_refresh',  0,   0,    0,    null),
  -- LA SUGGESTION EST OUVERTE AU GRATUIT. Elle était fermée, ce qui la
  -- rendait invisible : le champ d'en face restait vide sans explication, et
  -- c'est précisément la fonctionnalité qui donne envie de s'abonner.
  -- 0,0015 $ l'appel, et la banque curée répond sans modèle pour ses 451
  -- noms — 40 par jour coûtent donc quelques centimes par mois et par
  -- compte actif.
  ('free', 'suggest',          15,  40,   400,  null),
  -- La classification reste fermée : l'heuristique locale déduit déjà le
  -- genre et le radical, et son absence ne se voit pas à l'écran.
  ('free', 'classify',         0,   0,    0,    null),
  -- Le 2e avis IA sur une réponse jugée fausse : le verdict déterministe
  -- reste rendu, seul le rattrapage des faux négatifs est premium.
  ('free', 'verify',           0,   0,    0,    null),

  -- ── Premium : plafonds hauts, pensés comme des coupe-circuits.
  ('premium', 'exercise_ai',   20,  150,  2000, null),
  ('premium', 'reading',       3,   12,   150,  null),
  -- « Pas limitée » en pratique : personne ne lit 100 fiches de mot par
  -- jour. Le vrai frein au coût n'est pas ce chiffre mais explain_refresh
  -- ci-dessous — sans lui, une seule fiche régénérée en boucle
  -- contournerait le cache et rendrait ce plafond atteignable.
  ('premium', 'explain',       10,  100,  800,  null),
  ('premium', 'explain_refresh', 3, 10,   60,   null),
  ('premium', 'suggest',       30,  200,  3000, null),
  ('premium', 'classify',      20,  200,  3000, null),
  ('premium', 'verify',        60,  500,  6000, null)
on conflict (plan, feature) do update set
  burst_cap    = excluded.burst_cap,
  daily_cap    = excluded.daily_cap,
  monthly_cap  = excluded.monthly_cap,
  lifetime_cap = excluded.lifetime_cap;

-- ─── ai_usage : ce qui a réellement été consommé ─────────────────
-- Une ligne par (utilisateur, jour, fonctionnalité). Les colonnes de
-- tokens sont remplies APRÈS l'appel, avec les chiffres renvoyés par
-- Anthropic : c'est la seule façon de connaître le coût réel par
-- utilisateur plutôt que de l'estimer.
create table if not exists public.ai_usage (
  user_id       uuid not null references auth.users(id) on delete cascade,
  day           date not null default current_date,
  feature       text not null,
  count         int not null default 0,
  input_tokens  bigint not null default 0,
  output_tokens bigint not null default 0,
  primary key (user_id, day, feature)
);
create index if not exists ai_usage_day on public.ai_usage (day);

-- Fenêtre glissante d'une minute, pour la limite de rafale.
create table if not exists public.ai_burst (
  user_id      uuid not null references auth.users(id) on delete cascade,
  feature      text not null,
  window_start timestamptz not null default now(),
  count        int not null default 0,
  primary key (user_id, feature)
);

-- L'utilisateur peut LIRE sa consommation (afficher « 8/12 textes
-- aujourd'hui ») mais ne peut rien y écrire : sinon il remettrait ses
-- compteurs à zéro. Toutes les écritures passent par les fonctions
-- security definer ci-dessous.
alter table public.ai_usage enable row level security;
alter table public.ai_burst enable row level security;

-- SELECT et rien d'autre. Les fonctions ci-dessous sont `security definer`
-- et s'exécutent avec les droits de leur propriétaire : elles écrivent sans
-- que l'utilisateur ait besoin du moindre droit d'écriture. `ai_burst` ne
-- reçoit aucun droit du tout — rien ne le lit depuis le client.
grant select on public.ai_usage to authenticated;
drop policy if exists ai_usage_read on public.ai_usage;
create policy ai_usage_read on public.ai_usage for select to authenticated using (auth.uid() = user_id);

-- ─── consume_ai_quota : réserver un appel, ou le refuser ─────────
--
-- POURQUOI UNE FONCTION SQL ET NON UN LIRE-PUIS-ÉCRIRE DANS LA ROUTE.
-- Un `select count` suivi d'un `update` laisse une fenêtre entre les deux :
-- vingt requêtes lancées en parallèle lisent toutes le même compteur et
-- passent toutes. C'est exactement le scénario contre lequel on se
-- protège. Ici, l'UPDATE de ai_burst pose un verrou de ligne qui sérialise
-- les appels concurrents d'un même utilisateur : le 21e voit bien 20.
create or replace function public.consume_ai_quota(p_feature text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_user        uuid := auth.uid();
  v_plan        text;
  v_expires     timestamptz;
  v_burst_cap   int;
  v_daily_cap   int;
  v_month_cap   int;
  v_life_cap    int;
  v_burst_used  int;
  v_daily_used  int;
  v_month_used  int;
  v_life_used   int;
begin
  if v_user is null then
    return jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  end if;

  select plan, plan_expires_at into v_plan, v_expires
    from profiles where id = v_user;

  -- Un premium échu (essai terminé, accès bêta arrivé à terme, paiement
  -- non renouvelé) redevient gratuit ici même, sans tâche de fond.
  if v_plan is null or (v_expires is not null and v_expires < now()) then
    v_plan := 'free';
  end if;

  select burst_cap, daily_cap, monthly_cap, lifetime_cap
    into v_burst_cap, v_daily_cap, v_month_cap, v_life_cap
    from plan_limits where plan = v_plan and feature = p_feature;

  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'not_included',
                              'plan', v_plan, 'feature', p_feature);
  end if;

  -- Fonctionnalité tout simplement absente du plan (plafond à zéro) :
  -- tranché AVANT la rafale, sinon le premier appel d'un compte gratuit
  -- ressortait en « burst » — donc « trop de demandes d'affilée », ce qui
  -- est faux et incompréhensible pour quelqu'un qui vient de cliquer une
  -- fois. Le message doit parler d'abonnement, pas de patience.
  if v_daily_cap = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'not_included',
                              'plan', v_plan, 'feature', p_feature, 'cap', 0);
  end if;

  -- Rafale : elle compte AUSSI les refus, pour qu'un client qui s'acharne
  -- sur un quota épuisé ne rejoue pas la requête mille fois par minute.
  -- Le `case` remet la fenêtre à zéro si la minute est écoulée.
  insert into ai_burst (user_id, feature, window_start, count)
    values (v_user, p_feature, now(), 0)
    on conflict (user_id, feature) do nothing;

  update ai_burst
     set window_start = case when now() - window_start > interval '1 minute' then now() else window_start end,
         count        = case when now() - window_start > interval '1 minute' then 1 else count + 1 end
   where user_id = v_user and feature = p_feature
   returning count into v_burst_used;

  if v_burst_used > v_burst_cap then
    return jsonb_build_object('allowed', false, 'reason', 'burst', 'plan', v_plan,
                              'feature', p_feature, 'cap', v_burst_cap, 'retry_after', 60);
  end if;

  select coalesce(count, 0) into v_daily_used
    from ai_usage where user_id = v_user and day = current_date and feature = p_feature;
  if coalesce(v_daily_used, 0) >= v_daily_cap then
    return jsonb_build_object('allowed', false, 'reason', 'daily', 'plan', v_plan,
                              'feature', p_feature, 'cap', v_daily_cap, 'used', coalesce(v_daily_used, 0));
  end if;

  if v_month_cap is not null then
    select coalesce(sum(count), 0) into v_month_used
      from ai_usage
     where user_id = v_user and feature = p_feature
       and day >= date_trunc('month', current_date)::date;
    if v_month_used >= v_month_cap then
      return jsonb_build_object('allowed', false, 'reason', 'monthly', 'plan', v_plan,
                                'feature', p_feature, 'cap', v_month_cap, 'used', v_month_used);
    end if;
  end if;

  if v_life_cap is not null then
    select coalesce(sum(count), 0) into v_life_used
      from ai_usage where user_id = v_user and feature = p_feature;
    if v_life_used >= v_life_cap then
      return jsonb_build_object('allowed', false, 'reason', 'lifetime', 'plan', v_plan,
                                'feature', p_feature, 'cap', v_life_cap, 'used', v_life_used);
    end if;
  end if;

  -- Accordé : on décompte. Le compteur journalier n'avance QUE sur un
  -- accord, contrairement à la rafale.
  insert into ai_usage (user_id, day, feature, count)
    values (v_user, current_date, p_feature, 1)
    on conflict (user_id, day, feature) do update set count = ai_usage.count + 1;

  return jsonb_build_object('allowed', true, 'plan', v_plan, 'feature', p_feature,
                            'cap', v_daily_cap, 'used', coalesce(v_daily_used, 0) + 1,
                            'remaining', v_daily_cap - coalesce(v_daily_used, 0) - 1);
end $fn$;

revoke all on function public.consume_ai_quota(text) from public;
grant execute on function public.consume_ai_quota(text) to authenticated;

-- ─── record_ai_tokens : le coût réel, après coup ─────────────────
-- Appelée après la réponse d'Anthropic, avec usage.input_tokens et
-- usage.output_tokens. N'influence aucun quota : sert à mesurer, pas à
-- décider. Sans elle, on ne saurait jamais si les plafonds ci-dessus sont
-- au bon endroit.
create or replace function public.record_ai_tokens(p_feature text, p_input int, p_output int)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null then return; end if;
  insert into ai_usage (user_id, day, feature, count, input_tokens, output_tokens)
    values (auth.uid(), current_date, p_feature, 0, greatest(p_input, 0), greatest(p_output, 0))
    on conflict (user_id, day, feature) do update set
      input_tokens  = ai_usage.input_tokens + greatest(p_input, 0),
      output_tokens = ai_usage.output_tokens + greatest(p_output, 0);
end $fn$;

revoke all on function public.record_ai_tokens(text, int, int) from public;
grant execute on function public.record_ai_tokens(text, int, int) to authenticated;

-- ─── refund_ai_quota : rendre un appel qui n'a rien produit ──────
--
-- POURQUOI. Le quota se consomme AVANT l'appel au modèle — sinon deux
-- requêtes parallèles passeraient toutes les deux. Mais un appel qui
-- échoue (réseau, JSON tronqué, réponse hors forme) n'a rien donné à
-- l'apprenant. Sur le plan gratuit, qui n'a que deux textes de lecture À
-- VIE, lui en facturer un pour une panne serait une façon sûre de le
-- perdre.
--
-- Ne rend jamais plus que ce qui a été pris dans la journée (greatest(…,0)),
-- et ne touche pas au compteur de rafale : une erreur ne doit pas offrir
-- une nouvelle tentative immédiate, sans quoi une boucle d'échecs
-- contournerait la limite de débit.
create or replace function public.refund_ai_quota(p_feature text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null then return; end if;
  update ai_usage
     set count = greatest(count - 1, 0)
   where user_id = auth.uid() and day = current_date and feature = p_feature;
end $fn$;

revoke all on function public.refund_ai_quota(text) from public;
grant execute on function public.refund_ai_quota(text) to authenticated;

-- ─── grant_plan : offrir le premium à un bêta-testeur ────────────
--
-- Se lance depuis Supabase → SQL Editor, en une ligne :
--   select * from grant_plan('testeur@example.com', 'premium', now() + interval '6 months');
--   select * from grant_plan('testeur@example.com', 'premium');  -- sans échéance
--   select * from grant_plan('testeur@example.com', 'free');     -- retirer l'accès
--
-- `plan_source = 'grant'` protège ces comptes du webhook Stripe : une
-- résiliation d'abonnement ne rétrograde que les 'stripe'.
-- Exécutable par le service_role uniquement — jamais depuis le navigateur.
create or replace function public.grant_plan(
  p_email text,
  p_plan  text default 'premium',
  p_until timestamptz default null
)
-- Les colonnes de sortie sont préfixées `out_` : nommées `plan` ou `email`,
-- elles entreraient en conflit avec les colonnes du même nom manipulées
-- dans le corps, et PostgreSQL refuserait la référence comme ambiguë.
returns table (out_user_id uuid, out_email text, out_plan text, out_source text, out_expires timestamptz)
language plpgsql
security definer
set search_path = public
as $fn$
declare v_id uuid;
begin
  if p_plan not in ('free', 'premium') then
    raise exception 'Plan inconnu : %. Attendu : free ou premium.', p_plan;
  end if;

  select u.id into v_id from auth.users u where lower(u.email) = lower(trim(p_email));
  if v_id is null then
    raise exception 'Aucun compte pour %. Le bêta-testeur doit s''être inscrit d''abord.', p_email;
  end if;

  update profiles p set
    plan            = p_plan,
    plan_source     = case when p_plan = 'free' then null else 'grant' end,
    plan_expires_at = case when p_plan = 'free' then null else p_until end,
    updated_at      = now()
  where p.id = v_id;

  return query
    select v_id, p_email, p.plan, p.plan_source, p.plan_expires_at
      from profiles p where p.id = v_id;
end $fn$;

revoke all on function public.grant_plan(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.grant_plan(text, text, timestamptz) to service_role;
