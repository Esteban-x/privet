import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import { createCaptcha } from "@/lib/auth/captcha";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Créer un compte — Privet",
};

// Le captcha est tiré au sort à chaque rendu : la page ne doit jamais être
// servie depuis un cache, sinon tout le monde recevrait le même défi.
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  // Déjà connecté : pas de raison de repasser par l'inscription.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-[20px] border border-border bg-bg2 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent font-display text-xl font-extrabold text-white">
            П
          </div>
          <h1 className="font-display text-2xl font-bold">Créer un compte</h1>
          <p className="mt-2 font-display text-sm text-muted">
            Quelques secondes, puis un email de confirmation à valider.
          </p>
        </div>

        <div className="mt-7">
          <SignupForm captcha={createCaptcha()} />
        </div>
      </div>
    </div>
  );
}
