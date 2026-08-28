-- ════════════════════════════════════════════════════════════════
-- Plafonds sur la PRATIQUE elle-même — exercices et révisions.
--
-- CE QUI CHANGE. Jusqu'ici, le seul axe gratuit/premium était l'appel au
-- modèle : tout ce qui ne coûtait rien à servir (exercices tirés localement,
-- SRS, cours) restait ouvert en grand. Le plan gratuit était donc une app
-- complète à qui il manquait quelques finitions IA — il n'y avait aucune
-- raison de s'abonner pour qui ne tenait pas aux textes de lecture.
--
-- Le gratuit devient un ESSAI : de quoi juger la qualité des exercices sur
-- une session, pas de quoi apprendre le russe pendant six mois.
--
-- POURQUOI ICI ET NON EN CONSTANTES. Même raison que pour les postes IA :
-- ces deux chiffres sont des paramètres commerciaux, pas des invariants
-- techniques. Les corriger doit être un UPDATE, pas un redéploiement —
-- c'est précisément le genre de valeur qu'on veut pouvoir bouger le
-- lendemain d'une mise en ligne, au vu du taux de conversion réel.
--
-- POURQUOI RÉUTILISER consume_ai_quota. La fonction ne sait rien de l'IA :
-- elle lit `plan_limits`, verrouille la ligne de rafale et décompte. Son
-- nom vient de son premier usage, pas de sa portée. Lui donner un second
-- jeu de fonctions jumelles aurait dupliqué la seule partie délicate du
-- système — la sérialisation des appels concurrents.
-- ════════════════════════════════════════════════════════════════

insert into public.plan_limits (plan, feature, burst_cap, daily_cap, monthly_cap, lifetime_cap) values
  -- ── Gratuit ───────────────────────────────────────────────────
  --
  -- `practice` : une réponse corrigée par le serveur, tous modules
  -- confondus (cas, aspect, adjectifs, mouvement, participes, alphabet,
  -- chiffres, conjugaison). Vingt, c'est une session d'entraînement
  -- honnête : assez pour voir la correction, le tirage adaptatif et le
  -- retour détaillé à l'œuvre, trop peu pour progresser jour après jour.
  --
  -- LA RAFALE EST AU-DESSUS DU JOURNALIER, volontairement — même raison
  -- que pour `reading` dans la migration précédente. La rafale est
  -- verrouillée en premier ; à égalité elle l'emporterait et l'apprenant
  -- lirait « trop de demandes d'affilée » là où il faut lire « tes vingt
  -- exercices sont faits, voici l'abonnement ». C'est ce message-là qui
  -- décide d'un achat, pas l'autre.
  ('free', 'practice',     40,  20,   null, null),
  -- `vocab_review` : une carte notée, quel que soit le mode (cartes
  -- retournées, QCM, frappe, oral). Aligné sur les exercices : deux
  -- compteurs distincts, donc vingt de chaque — l'apprenant gratuit garde
  -- une vraie journée d'essai, pas une demi-session partagée.
  ('free', 'vocab_review', 40,  20,   null, null),

  -- ── Premium : coupe-circuits, invisibles à l'usage humain ─────
  -- 2000 réponses en une journée, c'est plus de dix heures de clics sans
  -- pause : le plafond ne peut être atteint que par un script.
  ('premium', 'practice',     120, 2000, null, null),
  ('premium', 'vocab_review', 120, 2000, null, null)
on conflict (plan, feature) do update set
  burst_cap    = excluded.burst_cap,
  daily_cap    = excluded.daily_cap,
  monthly_cap  = excluded.monthly_cap,
  lifetime_cap = excluded.lifetime_cap;

-- ─── La page de prix doit pouvoir annoncer ces chiffres ─────────
--
-- `plan_limits` n'était lisible que par un compte connecté. Or la page qui
-- demande de payer s'adresse d'abord à un VISITEUR : sans ce droit, elle
-- aurait dû recopier « 20 » en dur — c'est-à-dire réintroduire la double
-- source de vérité que la table existe pour supprimer, sur la seule page où
-- se contredire coûte cher. Rien ici n'est secret : ce sont les conditions
-- de l'offre, écrites pour être lues.
grant select on public.plan_limits to anon;
drop policy if exists plan_limits_read on public.plan_limits;
create policy plan_limits_read on public.plan_limits
  for select to anon, authenticated using (true);
