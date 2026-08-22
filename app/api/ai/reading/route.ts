import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { readingSystemPrompt, type ReadingLength, type ReadingStyle } from "@/lib/ai/prompts";
import { toReadingText } from "@/lib/reading/validate";
import { TOPIC_CATALOG } from "@/lib/supabase/types";
import { CaseId } from "@/lib/grammar/types";

const VALID_TOPIC_IDS = new Set(TOPIC_CATALOG.map((t) => t.id));
const VALID_LENGTHS = new Set<ReadingLength>(["short", "medium", "long"]);
const VALID_STYLES = new Set<ReadingStyle>(["narrative", "dialogue", "description"]);
const VALID_CASES = new Set<CaseId>([
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "instrumental",
  "prepositional",
]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("level, topics")
    .eq("id", user.id)
    .single();

  const body = await req.json().catch(() => ({}));
  // Chaque option est facultative et retombe sur un choix par défaut
  // raisonnable si absente/invalide — jamais bloquant.
  const topics: string[] = Array.isArray(body.topics)
    ? body.topics.filter((t: unknown): t is string => typeof t === "string" && VALID_TOPIC_IDS.has(t))
    : (profile?.topics ?? []);
  const length: ReadingLength = VALID_LENGTHS.has(body.length) ? body.length : "medium";
  const style: ReadingStyle = VALID_STYLES.has(body.style) ? body.style : "narrative";
  const focusCase: CaseId | undefined = VALID_CASES.has(body.focusCase) ? body.focusCase : undefined;
  const level = profile?.level ?? "A1";

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      // La glose + le tag de cas mot-à-mot (voir readingSystemPrompt) sont
      // bien plus coûteux en tokens qu'une simple prose — 1200 coupait la
      // réponse en plein milieu d'une chaîne pour un texte un peu long ou
      // un niveau élevé (B1+), produisant un JSON tronqué invalide plutôt
      // qu'un texte plus court.
      max_tokens: 4096,
      system: readingSystemPrompt({ level, topics, length, style, focusCase }),
      messages: [{ role: "user", content: "Écris un texte de lecture gradué." }],
    });
    if (msg.stop_reason === "max_tokens") {
      // Diagnostic clair si ça se reproduit malgré la marge généreuse
      // ci-dessus, plutôt qu'une SyntaxError de JSON.parse opaque à
      // interpréter dans les logs.
      console.error("reading route: réponse tronquée par max_tokens");
    }
    const raw = parseJsonResponse(textFromMessage(msg));
    const text = toReadingText(raw, level);
    if (!text) {
      console.error("reading route: forme inattendue", raw);
      return NextResponse.json({ error: "Génération indisponible pour le moment." }, { status: 502 });
    }

    // Sauvegardé automatiquement (comme un mot ajouté à une liste de
    // vocabulaire) plutôt qu'éphémère — listé et supprimable depuis
    // /reading. Un échec d'insert ne doit pas priver l'utilisateur du texte
    // qu'il vient de générer : il reste affichable, simplement pas listé.
    const titleFrRaw = (raw as { title_fr?: unknown }).title_fr;
    const summaryFrRaw = (raw as { summary_fr?: unknown }).summary_fr;
    const { data: saved, error: saveError } = await supabase
      .from("reading_texts")
      .insert({
        user_id: user.id,
        title: text.title,
        title_fr: typeof titleFrRaw === "string" ? titleFrRaw : null,
        level: text.level,
        sentences: text.sentences,
        summary_fr: typeof summaryFrRaw === "string" ? summaryFrRaw : null,
      })
      .select("id")
      .single();
    if (saveError) console.error("reading route: échec sauvegarde", saveError);

    return NextResponse.json({ text, id: saved?.id ?? null });
  } catch (err) {
    console.error("reading route error", err);
    return NextResponse.json(
      { error: "Génération indisponible pour le moment." },
      { status: 502 }
    );
  }
}
