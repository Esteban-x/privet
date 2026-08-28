/**
 * Pré-chauffage du cache de prononciation.
 *
 * POURQUOI. Le cache de /api/tts est global : le premier apprenant qui
 * ajoute « собака » paie sa synthèse (0,0007 $), tous les suivants l'ont
 * gratuitement. Ce script joue ce premier apprenant à l'avance, sur les
 * 451 noms de la banque curée — le vocabulaire courant que les débutants
 * saisissent en premier. Coût total mesuré : 0,27 $, une fois.
 *
 * Après ça, la grande majorité des mots ajoutés ne coûteront rien et se
 * prononceront instantanément, sans passer par ElevenLabs.
 *
 *   node scripts/build-audio.mjs           # tout ce qui manque
 *   node scripts/build-audio.mjs --dry     # ne synthétise rien, montre le coût
 *   node scripts/build-audio.mjs --limit=50
 *
 * IDEMPOTENT : les mots déjà en cache sont ignorés. On peut donc le
 * relancer après avoir enrichi la banque, ou après une interruption.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();

// ─── Configuration ──────────────────────────────────────────────
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_0-9]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const KEY = process.env.ELEVENLABS_API_KEY;
// Le script ne pré-chauffe que le russe : la banque curée est russe, et le
// français des traductions est saisi par chaque apprenant, donc inconnu ici.
const VOICE = process.env.ELEVENLABS_VOICE_ID_RU || "21m00Tcm4TlvDq8ikWAM";
const MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const dry = process.argv.includes("--dry");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.");
  process.exit(1);
}
if (!KEY && !dry) {
  console.error("ELEVENLABS_API_KEY manquante. Relance avec --dry pour seulement estimer le coût.");
  process.exit(1);
}

// Mêmes règles que lib/ai/elevenlabs.ts — si l'une change, l'autre doit
// suivre, sinon le script remplirait des empreintes que la route ne
// cherchera jamais.
const normalize = (t) => t.normalize("NFC").replace(/́/g, "").replace(/\s+/g, " ").trim();
const hashOf = (t) =>
  createHash("sha256").update(`${MODEL}|${VOICE}|${t}`).digest("hex").slice(0, 32);

// ─── Le corpus : les lemmes de la banque curée ──────────────────
// Les formes fléchies sont volontairement exclues : elles multiplieraient
// le volume par douze pour un usage que rien n'appelle aujourd'hui (le
// module Cas ne prononce rien). Le jour où ça change, il suffira de les
// ajouter ici et de relancer.
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, { alias: { "@": root } });
// Chemin ABSOLU : `createRequire(import.meta.url)` résout le relatif depuis
// scripts/, pas depuis la racine du projet.
const { NOUNS } = jiti(path.join(root, "lib/grammar/nouns-data.ts"));

const corpus = [...new Set(NOUNS.map((n) => normalize(n.lemma)).filter(Boolean))];
console.log(`Banque : ${corpus.length} lemmes distincts.`);

// ─── Ce qui manque réellement ───────────────────────────────────
const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing, error: readError } = await db.from("tts_audio").select("hash");
if (readError) {
  console.error("Lecture du cache impossible :", readError.message);
  process.exit(1);
}
const known = new Set((existing ?? []).map((r) => r.hash));
// `missing` avant `--limit`, sinon le compte « déjà en cache » se calcule
// sur la liste tronquée et annonce des centaines de mots déjà faits qui ne
// le sont pas — exactement le genre de chiffre rassurant et faux qui fait
// croire qu'un pré-chauffage est terminé.
const missing = corpus.filter((w) => !known.has(hashOf(w)));
const todo = missing.slice(0, limit);

const chars = todo.reduce((n, w) => n + w.length, 0);
console.log(
  `Déjà en cache : ${corpus.length - missing.length}. ` +
    `À synthétiser : ${todo.length}` +
    (todo.length < missing.length ? ` (sur ${missing.length} manquants, --limit)` : "") +
    ` (${chars} caractères, ~${((chars / 1000) * 0.1).toFixed(2)} $).`
);
// `process.exit()` ici couperait le processus avec des connexions encore
// ouvertes (jiti, supabase) — ce que libuv signale par une assertion sur
// Windows. On laisse plutôt le script se terminer de lui-même.
if (!dry && todo.length > 0) await synthesizeAll();

// ─── Synthèse ───────────────────────────────────────────────────
async function synthesizeAll() {
  let done = 0;
  let failed = 0;
  for (const word of todo) {
    const hash = hashOf(word);
    const file = `${hash}.mp3`;
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({
            text: word,
            model_id: MODEL,
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true,
            },
          }),
        }
      );
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);

      const audio = Buffer.from(await res.arrayBuffer());
      const { error: upErr } = await db.storage
        .from("tts")
        .upload(file, audio, { contentType: "audio/mpeg", upsert: true });
      if (upErr) throw upErr;

      const { error: insErr } = await db.from("tts_audio").insert({
        hash,
        spoken_text: word,
        lang: "ru",
        voice_id: VOICE,
        model_id: MODEL,
        path: file,
        chars: word.length,
      });
      // 23505 = doublon : un autre passage (ou un utilisateur) a gagné la
      // course entre-temps. Le fichier est identique, rien à réparer.
      if (insErr && insErr.code !== "23505") throw insErr;

      done += 1;
      if (done % 25 === 0) console.log(`  ${done}/${todo.length}…`);
    } catch (err) {
      failed += 1;
      console.error(`  échec sur « ${word} » :`, err.message ?? err);
      // Une erreur d'authentification ou de quota se répétera sur les 450
      // suivants : inutile de marteler l'API pour s'en convaincre.
      if (failed >= 5 && done === 0) {
        console.error("Cinq échecs d'affilée sans succès — arrêt.");
        process.exitCode = 1;
        return;
      }
    }
  }

  console.log(`Terminé : ${done} synthétisés, ${failed} en échec.`);
}
