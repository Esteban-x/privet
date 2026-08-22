import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_CHAT } from "@/lib/ai/client";
import { tutorSystemPrompt } from "@/lib/ai/prompts";
import { getWeakCasesSummary } from "@/lib/progress/weak-cases";
import { getRecentVocabSummary } from "@/lib/progress/recent-vocab";

export const maxDuration = 60;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

const HISTORY_LIMIT = 200; // messages relus à l'ouverture d'une conversation
const HISTORY_SEND_LIMIT = 20; // messages envoyés au modèle à chaque tour
const DEFAULT_TITLE = "Nouvelle conversation";

function titleFromMessage(content: string): string {
  const oneLine = content.trim().replace(/\s+/g, " ");
  return oneLine.length > 60 ? `${oneLine.slice(0, 60)}…` : oneLine || DEFAULT_TITLE;
}

// Historique d'UNE conversation (pour la reprendre en cliquant dessus dans
// la sidebar de /tutor) — les messages sont déjà persistés par POST
// ci-dessous, ceci les relit simplement.
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ messages: [] });

  const conversationId = new URL(req.url).searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ messages: [] });

  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("user_id", user.id)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(HISTORY_LIMIT);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    messages: (data ?? []).map((m) => ({ role: m.role, content: m.content })),
  });
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

  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  // Conversation cible : celle fournie (créée à l'avance par le bouton
  // "Nouvelle conversation", ou déjà en cours), sinon on en crée une à la
  // volée — le premier message donne son titre.
  let conversationId = typeof body.conversationId === "string" ? body.conversationId : null;
  if (conversationId) {
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("id, title")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();
    if (!conv) return new Response("Conversation introuvable", { status: 404 });
    if (conv.title === DEFAULT_TITLE && lastUser) {
      await supabase
        .from("chat_conversations")
        .update({ title: titleFromMessage(lastUser.content) })
        .eq("id", conversationId);
    }
  } else {
    const { data: conv, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: lastUser ? titleFromMessage(lastUser.content) : DEFAULT_TITLE })
      .select("id")
      .single();
    if (error || !conv) return new Response("Création de la conversation impossible", { status: 500 });
    conversationId = conv.id;
  }

  const [{ data: profile }, weakCases, recentVocab] = await Promise.all([
    supabase.from("profiles").select("level, goals, topics").eq("id", user.id).single(),
    getWeakCasesSummary(supabase, user.id),
    getRecentVocabSummary(supabase, user.id),
  ]);

  // Persiste le dernier message utilisateur.
  if (lastUser) {
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      conversation_id: conversationId,
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
            profile?.topics ?? [],
            weakCases,
            recentVocab
          ),
          // Le contexte utile (niveau, points faibles, vocabulaire récent)
          // est déjà dans le system prompt ci-dessus : pas besoin de
          // renvoyer TOUT l'historique à chaque tour, ce qui grossirait le
          // coût/latence sans fin sur une longue conversation.
          messages: messages.slice(-HISTORY_SEND_LIMIT).map((m) => ({ role: m.role, content: m.content })),
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

        // Persiste la réponse complète du professeur + fait remonter la
        // conversation en tête de la sidebar (triée par updated_at).
        if (assistantText) {
          await supabase.from("chat_messages").insert({
            user_id: user.id,
            conversation_id: conversationId,
            role: "assistant",
            content: assistantText,
          });
          await supabase
            .from("chat_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);
          await supabase.from("activity_log").insert({
            user_id: user.id,
            kind: "chat",
            correct: null,
            meta: { conversationId },
          });
        }
        controller.close();
      } catch (err) {
        console.error("chat route error", err);
        controller.enqueue(encoder.encode("\n\n[Le professeur IA est momentanément indisponible.]"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversationId,
    },
  });
}
