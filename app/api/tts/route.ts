import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { consumeQuota, recordTokens, refundQuota } from "@/lib/ai/quota";
import {
  isTtsConfigured,
  normalizeForSpeech,
  publicAudioUrl,
  SPEECH_SCRIPT,
  speechHash,
  synthesize,
  TTS_MODEL,
  voiceFor,
  type SpeechLang,
} from "@/lib/ai/elevenlabs";

/**
 * L'URL audio d'un mot russe, synthétisée à la première demande puis
 * partagée par tout le monde.
 *
 * LE QUOTA NE FRAPPE QUE LES ÉCHECS DE CACHE. Réécouter un mot déjà
 * synthétisé — par soi ou par n'importe quel autre apprenant — ne consomme
 * rien : c'est une lecture en base suivie d'une URL de CDN. Seul un mot
 * que PERSONNE n'a jamais entendu coûte quelque chose.
 *
 * NE CASSE JAMAIS RIEN. Clé absente, quota épuisé, ElevenLabs en panne :
 * on répond 200 avec `url: null`, et le client repasse sur la voix du
 * navigateur. Une prononciation médiocre reste très préférable à un bouton
 * qui affiche une erreur.
 */
/**
 * Sans ce plafond, Vercel coupe à dix secondes — une 504 sans corps, sans
 * trace, et qui ne se reproduit jamais en local. Voir la note détaillée dans
 * app/api/ai/reading/route.ts.
 */
export const maxDuration = 30;

export const runtime = "nodejs";

// Un mot, une expression courte. Au-delà on n'est plus dans le périmètre
// (prononciation de vocabulaire) et le coût cesse d'être négligeable.
const MAX_CHARS = 120;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const lang: SpeechLang = body.lang === "fr" ? "fr" : "ru";
  const raw = typeof body.text === "string" ? body.text : "";
  const text = normalizeForSpeech(raw).slice(0, MAX_CHARS);
  // Le contrôle d'alphabet n'est pas cosmétique : c'est lui qui empêche de
  // payer une synthèse pour une saisie en latin dans le champ russe (ou
  // l'inverse), que le modèle lirait de toute façon n'importe comment.
  if (!text || !SPEECH_SCRIPT[lang].test(text)) {
    return NextResponse.json({ url: null });
  }

  const voice = voiceFor(lang);
  const hash = speechHash(text, voice);

  // 1. Le cache, avant tout. C'est le chemin de très loin le plus fréquent.
  const { data: cached } = await supabase
    .from("tts_audio")
    .select("path")
    .eq("hash", hash)
    .maybeSingle();
  if (cached?.path) {
    return NextResponse.json({ url: publicAudioUrl(cached.path), cached: true });
  }

  if (!isTtsConfigured()) return NextResponse.json({ url: null });

  // 2. Mot inédit : là seulement, on consomme.
  const quota = await consumeQuota(supabase, "tts");
  if (!quota.allowed) return NextResponse.json({ url: null, quota: quota.reason });

  const path = `${hash}.mp3`;
  try {
    const audio = await synthesize(text, lang);

    // Le service_role pour l'écriture : le bucket n'accorde aucun droit
    // d'upload aux comptes utilisateurs, sinon n'importe qui pourrait
    // remplacer le son d'un mot par le sien pour tous les autres.
    const { error: uploadError } = await createAdminClient()
      .storage.from("tts")
      .upload(path, audio, { contentType: "audio/mpeg", upsert: true });
    if (uploadError) throw uploadError;

    await supabase.rpc("record_tts_audio", {
      p_hash: hash,
      p_text: text,
      p_lang: lang,
      p_voice_id: voice,
      p_model_id: TTS_MODEL,
      p_path: path,
      p_chars: text.length,
    });

    // Le coût d'ElevenLabs se compte en CARACTÈRES, pas en tokens — on le
    // range en entrée pour que la table ai_usage reste homogène, et parce
    // que c'est bien ce qui est facturé. Le calcul de coût par utilisateur
    // doit donc traiter la ligne `tts` à part (0,10 $ / 1000 caractères).
    await recordTokens(supabase, "tts", { input_tokens: text.length, output_tokens: 0 });

    return NextResponse.json({ url: publicAudioUrl(path), cached: false });
  } catch (err) {
    console.error("tts route: synthèse indisponible", err);
    // Rien n'a été produit : on rend le crédit.
    await refundQuota(supabase, "tts");
    return NextResponse.json({ url: null });
  }
}
