import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.onboarded === "boolean") update.onboarded = body.onboarded;
  if (typeof body.display_name === "string") update.display_name = body.display_name.slice(0, 80);
  if (typeof body.vocab_daily_goal === "number" && Number.isFinite(body.vocab_daily_goal)) {
    update.vocab_daily_goal = Math.min(200, Math.max(5, Math.round(body.vocab_daily_goal)));
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return NextResponse.json({ profile });
}
