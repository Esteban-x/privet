import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_CHAT } from "@/lib/ai/client";
import { tutorSystemPrompt } from "@/lib/ai/prompts";

export const maxDuration = 60;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Non authentifié", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const messages: IncomingMessage[] = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) return new Response("Aucun message", { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("level, goals, topics")
    .eq("id", user.id)
    .single();

  // Persiste le dernier message utilisateur.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: lastUser.content,
    });
  }

  const encoder = new TextEncoder();
  let assistantText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = getAnthropic().messages.stream({
          model: MODEL_CHAT,
          max_tokens: 1024,
          system: tutorSystemPrompt(
            profile?.level ?? "A1",
            profile?.goals ?? null,
            profile?.topics ?? []
          ),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            assistantText += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Persiste la réponse complète du tuteur.
        if (assistantText) {
          await supabase.from("chat_messages").insert({
            user_id: user.id,
            role: "assistant",
            content: assistantText,
          });
          await supabase.from("activity_log").insert({
            user_id: user.id,
            kind: "chat",
            correct: null,
          });
        }
        controller.close();
      } catch (err) {
        console.error("chat route error", err);
        controller.enqueue(encoder.encode("\n\n[Le tuteur est momentanément indisponible.]"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
