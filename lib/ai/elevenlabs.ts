import { createHash } from "node:crypto";

/**
 * Synthèse vocale ElevenLabs — côté serveur uniquement.
 *
 * PÉRIMÈTRE VOLONTAIREMENT ÉTROIT : la prononciation du vocabulaire et la
 * révision vocale. Les cours ne passent pas par ici — c'est de la prose
 * qu'on lit, et la vocaliser coûterait cent mille caractères pour un
 * usage que personne ne réclame.
 */

const API = "https://api.elevenlabs.io/v1/text-to-speech";

// Multilingual v2 : le seul modèle qui tienne le russe correctement.
// Flash v2.5 est deux fois moins cher mais nettement moins bon sur les
// mots isolés — or c'est exactement ce qu'on synthétise ici. Sur un mot de
// sept caractères l'économie est de 0,00035 $ : elle ne vaut pas la
// dégradation.
export const TTS_MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

export type SpeechLang = "ru" | "fr";

// UNE VOIX PAR LANGUE. Le même comédien lisant du russe puis du français
// sonne faux dans au moins une des deux : multilingual v2 traduit
// l'accent du timbre d'origine. Deux voix natives valent bien mieux qu'une
// voix passe-partout, et le coût est identique.
//
// À CHOISIR DANS TA BIBLIOTHÈQUE ELEVENLABS : Voice Library → filtrer sur
// la langue → « Use » → copier l'ID. La valeur de repli est une voix
// préfabriquée disponible sur tous les comptes : elle fonctionne, mais
// n'est native ni de l'une ni de l'autre.
const FALLBACK_VOICE = "21m00Tcm4TlvDq8ikWAM";
export const TTS_VOICES: Record<SpeechLang, string> = {
  ru: process.env.ELEVENLABS_VOICE_ID_RU || FALLBACK_VOICE,
  fr: process.env.ELEVENLABS_VOICE_ID_FR || FALLBACK_VOICE,
};

export function voiceFor(lang: SpeechLang): string {
  return TTS_VOICES[lang] ?? FALLBACK_VOICE;
}

/** L'alphabet attendu — un mot français dans le champ russe ne se synthétise pas. */
export const SPEECH_SCRIPT: Record<SpeechLang, RegExp> = {
  ru: /[Ѐ-ӿ]/,
  fr: /[A-Za-zÀ-ÿ]/,
};

export function isTtsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/**
 * Le texte tel qu'on le PRONONCE, qui n'est pas tout à fait celui qu'on
 * affiche.
 *
 * L'accent tonique (U+0301, l'aigu combinant de « спаси́бо ») est une aide
 * de lecture destinée à l'apprenant. Les moteurs de synthèse ne savent pas
 * quoi en faire : selon les cas ils l'ignorent, le lisent comme une
 * ponctuation, ou coupent le mot. On le retire donc avant de synthétiser —
 * et comme la normalisation sert aussi de clé de cache, « спаси́бо » et
 * « спасибо » partagent le même fichier au lieu d'être payés deux fois.
 */
export function normalizeForSpeech(text: string): string {
  return text
    .normalize("NFC")
    .replace(/́/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Clé de cache. La voix et le modèle en font partie : en changer régénère.
 * Comme la voix dépend de la langue, « merci » (fr) et un hypothétique
 * homographe russe ne peuvent pas se marcher dessus.
 */
export function speechHash(normalized: string, voice: string, model = TTS_MODEL): string {
  return createHash("sha256").update(`${model}|${voice}|${normalized}`).digest("hex").slice(0, 32);
}

/** Synthétise, ou lève. Renvoie les octets MP3 bruts. */
export async function synthesize(normalized: string, lang: SpeechLang): Promise<Buffer> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY manquante.");

  const res = await fetch(`${API}/${voiceFor(lang)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: normalized,
      model_id: TTS_MODEL,
      // `stability` haute et `style` à zéro : on veut une diction nette et
      // REPRODUCTIBLE, pas une interprétation. Un mot de vocabulaire lu
      // deux fois différemment est un mot qu'on apprend mal.
      voice_settings: { stability: 0.75, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status} : ${detail.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** L'URL publique d'un fichier du bucket `tts`. */
export function publicAudioUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/tts/${path}`;
}
