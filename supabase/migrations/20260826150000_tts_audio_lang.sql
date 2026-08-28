-- La table de cache a été créée quand seul le russe était prononcé : sa
-- colonne s'appelait `ru`. Depuis, le français y entre aussi — et une
-- colonne nommée `ru` qui contient « merci » est exactement le genre de
-- détail qui trompe la personne qui relira ce schéma dans six mois.
--
-- Renommée pendant que la table est encore vide, et complétée par la
-- langue : sans elle, impossible de régénérer « tout le français » après un
-- changement de voix sans deviner l'alphabet à la lecture.
alter table public.tts_audio rename column ru to spoken_text;
alter table public.tts_audio add column if not exists lang text not null default 'ru';
alter table public.tts_audio drop constraint if exists tts_audio_lang_check;
alter table public.tts_audio add constraint tts_audio_lang_check check (lang in ('ru', 'fr'));

drop index if exists tts_audio_ru;
create index if not exists tts_audio_lookup on public.tts_audio (lang, spoken_text);

-- La signature change : l'ancienne version est supprimée explicitement,
-- sinon PostgreSQL garderait les deux en surcharge et l'appel du code
-- deviendrait ambigu.
drop function if exists public.record_tts_audio(text, text, text, text, text, int);

create or replace function public.record_tts_audio(
  p_hash text, p_text text, p_lang text, p_voice_id text, p_model_id text, p_path text, p_chars int
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null then return; end if;
  insert into tts_audio (hash, spoken_text, lang, voice_id, model_id, path, chars)
  values (p_hash, p_text, coalesce(nullif(p_lang, ''), 'ru'), p_voice_id, p_model_id, p_path,
          greatest(p_chars, 0))
  on conflict (hash) do nothing;
end $fn$;

revoke all on function public.record_tts_audio(text, text, text, text, text, text, int) from public;
grant execute on function public.record_tts_audio(text, text, text, text, text, text, int) to authenticated;
