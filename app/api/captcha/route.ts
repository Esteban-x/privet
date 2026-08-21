import { NextResponse } from "next/server";
import { createCaptcha } from "@/lib/auth/captcha";

// Sert un nouveau défi captcha (bouton « Autre image » du formulaire).
// Route publique : le défi n'est pas un secret, seul le jeton signé compte.
export async function GET() {
  return NextResponse.json(createCaptcha(), {
    headers: { "Cache-Control": "no-store" },
  });
}
