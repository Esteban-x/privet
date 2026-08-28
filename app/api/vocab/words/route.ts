import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { heuristicClassify } from "@/lib/vocabulary/grammar-classify";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { consumeQuota, recordTokens } from "@/lib/ai/quota";
import { vocabGrammarSystemPrompt } from "@/lib/ai/prompts";

interface AiGrammar {
  gender: "masculine" | "feminine" | "neuter";
  animacy: "animate" | "inanimate";
  stem_type: "hard" | "soft" | "mixed";
  indeclinable: boolean;
  french_gender: "m" | "f";
}

// Classification best-effort : heuristique locale d'abord (déterministe),
// puis un appel IA cheap pour combler ce qu'elle ne peut pas déduire
// (surtout l'animacité, et le genre français qui ne se déduit d'aucune
// règle — arbitraire d'une langue à l'autre). Information d'affichage et
// de révision : elle n'alimente PAS le module "Cas", qui ne décline que la
// banque curée et vérifiée (lib/grammar/nouns-data.ts). Ne bloque JAMAIS
// l'ajout du mot : un échec IA laisse simplement les colonnes
// grammaticales à null.
type Db = Awaited<ReturnType<typeof createClient>>;

async function classifyWord(supabase: Db, ru: string, fr: string) {
  const heuristic = heuristicClassify(ru);

  // Hors quota, on garde l'heuristique locale : le mot est ajouté avec le
  // genre et le type de radical qu'elle sait déduire, et seules l'animacité
  // et le genre français restent nuls — exactement ce que fait déjà le
  // `catch` ci-dessous quand l'IA est indisponible. L'ajout d'un mot n'est
  // jamais bloqué par un quota.
  const quota = await consumeQuota(supabase, "classify");
  if (!quota.allowed) {
    return {
      gender: heuristic.gender,
      animacy: null,
      stem_type: heuristic.stemType,
      indeclinable: false,
      french_gender: null,
    };
  }

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 150,
      system: vocabGrammarSystemPrompt(ru, fr),
      messages: [{ role: "user", content: "Classifie ce mot." }],
    });
    await recordTokens(supabase, "classify", msg.usage);
    const ai = parseJsonResponse<AiGrammar>(textFromMessage(msg));
    return {
      gender: heuristic.gender ?? ai.gender,
      animacy: ai.animacy,
      stem_type: heuristic.stemType ?? ai.stem_type,
      indeclinable: ai.indeclinable,
      french_gender: ai.french_gender,
    };
  } catch {
    return {
      gender: heuristic.gender,
      animacy: null,
      stem_type: heuristic.stemType,
      indeclinable: false,
      french_gender: null,
    };
  }
}

function field(body: Record<string, unknown>, key: string, max: number): string | null {
  const value = body[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const listId = typeof body.listId === "string" ? body.listId : "";
  const ru = field(body, "ru", 100);
  const fr = field(body, "fr", 200);
  if (!listId || !ru || !fr) {
    return NextResponse.json({ error: "listId, ru et fr sont requis" }, { status: 400 });
  }

  // RLS empêcherait de toute façon l'insertion sous un list_id qui n'est pas
  // le nôtre (la policy vérifie user_id, pas list_id) — on vérifie donc
  // explicitement que la liste nous appartient avant d'y ajouter un mot.
  const { data: list } = await supabase
    .from("vocab_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .single();
  if (!list) return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });

  const grammar = await classifyWord(supabase, ru, fr);

  const { data, error } = await supabase
    .from("vocab_words")
    .insert({
      list_id: listId,
      user_id: user.id,
      ru,
      fr,
      transliteration: field(body, "transliteration", 100),
      example_ru: field(body, "exampleRu", 300),
      example_fr: field(body, "exampleFr", 300),
      gender: grammar.gender,
      animacy: grammar.animacy,
      stem_type: grammar.stem_type,
      indeclinable: grammar.indeclinable,
      french_gender: grammar.french_gender,
    })
    .select(
      "id, ru, transliteration, fr, example_ru, example_fr, gender, animacy, stem_type, indeclinable, french_gender"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    word: {
      id: data.id,
      ru: data.ru,
      transliteration: data.transliteration,
      fr: data.fr,
      exampleRu: data.example_ru,
      exampleFr: data.example_fr,
      gender: data.gender,
      animacy: data.animacy,
      stemType: data.stem_type,
      indeclinable: data.indeclinable,
      frenchGender: data.french_gender,
      // Un mot ajouté part « normal » : c'est l'apprenant qui le range
      // ensuite, rien ne le fait pour lui.
      focus: "normal" as const,
      srs: null,
    },
  });
}
