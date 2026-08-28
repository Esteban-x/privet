-- ════════════════════════════════════════════════════════════════
-- Prononciation : cache global des synthèses vocales.
--
-- POURQUOI UN CACHE GLOBAL ET NON PAR UTILISATEUR. « книга » se prononce
-- pareil pour tout le monde. Un cache par compte referait payer le même
-- mot à chaque nouvel apprenant qui l'ajoute à sa liste — or c'est
-- justement le vocabulaire courant qui se répète d'une liste à l'autre.
-- Ici, la clé est l'EMPREINTE DU TEXTE : le premier qui ajoute « собака »
-- la paie (0,0007 $), tous les suivants l'ont gratuitement et
-- instantanément.
--
-- C'est aussi ce qui rend le pré-chauffage intéressant : passer les 451
-- noms de la banque curée au script de génération coûte 0,47 $ une fois et
-- couvre l'essentiel du vocabulaire que les débutants saisissent.
--
-- CE N'EST PAS UNE DONNÉE PRIVÉE : la table ne contient que des mots russes
-- et des chemins de fichiers, jamais qui les a demandés. Le compteur par
-- utilisateur, lui, reste dans ai_usage.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.tts_audio (
  hash       text primary key,          -- sha256(texte normalisé + voix + modèle)
  ru         text not null,             -- pour l'inspection : ce qui a été dit
  voice_id   text not null,
  model_id   text not null,
  path       text not null,             -- chemin dans le bucket `tts`
  chars      int  not null default 0,   -- facturé par ElevenLabs
  created_at timestamptz default now()
);
create index if not exists tts_audio_ru on public.tts_audio (ru);

alter table public.tts_audio enable row level security;

-- Lecture pour tous les comptes connectés : c'est un cache partagé, et la
-- route a besoin d'y chercher un fichier existant avant de payer une
-- synthèse. Aucune écriture — elle passe par la fonction ci-dessous.
grant select on public.tts_audio to authenticated;
drop policy if exists tts_audio_read on public.tts_audio;
create policy tts_audio_read on public.tts_audio for select to authenticated using (true);

-- ─── Le bucket de stockage ──────────────────────────────────────
-- Public : ce sont des mots de dictionnaire, pas des données de compte, et
-- une URL publique se sert par le CDN sans repasser par l'app à chaque
-- lecture. Le nom du fichier est une empreinte, donc rien ne s'y devine.
insert into storage.buckets (id, name, public)
values ('tts', 'tts', true)
on conflict (id) do update set public = true;

-- ─── record_tts_audio : inscrire une synthèse au cache ──────────
-- security definer : l'utilisateur n'a aucun droit d'écriture sur la table
-- (il pourrait sinon faire pointer un mot vers le fichier d'un autre).
-- `on conflict do nothing` : deux apprenants qui demandent le même mot
-- exactement en même temps ne doivent pas produire d'erreur — le second
-- réutilise simplement la ligne du premier.
create or replace function public.record_tts_audio(
  p_hash text, p_ru text, p_voice_id text, p_model_id text, p_path text, p_chars int
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null then return; end if;
  insert into tts_audio (hash, ru, voice_id, model_id, path, chars)
  values (p_hash, p_ru, p_voice_id, p_model_id, p_path, greatest(p_chars, 0))
  on conflict (hash) do nothing;
end $fn$;

revoke all on function public.record_tts_audio(text, text, text, text, text, int) from public;
grant execute on function public.record_tts_audio(text, text, text, text, text, int) to authenticated;

-- ─── Quotas ─────────────────────────────────────────────────────
--
-- ILS NE COMPTENT QUE LES ÉCHECS DE CACHE. Réécouter un mot déjà synthétisé
-- ne consomme rien, quel que soit le plan : la prononciation est le cœur
-- d'une app de langue, la rationner à l'écoute serait absurde. Seul un mot
-- JAMAIS entendu par personne coûte quelque chose — ~0,0007 $ pièce.
--
-- Le gratuit en a donc largement assez pour découvrir, et le plafond
-- premium (2000/mois = 1,40 $) n'existe que pour borner un script.
insert into public.plan_limits (plan, feature, burst_cap, daily_cap, monthly_cap, lifetime_cap) values
  ('free',    'tts', 10, 30,  200,  null),
  ('premium', 'tts', 30, 200, 2000, null)
on conflict (plan, feature) do update set
  burst_cap    = excluded.burst_cap,
  daily_cap    = excluded.daily_cap,
  monthly_cap  = excluded.monthly_cap,
  lifetime_cap = excluded.lifetime_cap;
