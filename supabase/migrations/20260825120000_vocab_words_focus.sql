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
