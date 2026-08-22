import Link from "next/link";

export const metadata = {
  title: "Compte confirmé — Privet",
};

// Écran affiché juste après qu'un lien de confirmation (inscription, email
// changé…) a été validé avec succès par app/auth/confirm/route.ts. Sert
// uniquement à donner une confirmation visuelle avant de continuer — sans ça,
// l'utilisateur atterrit sans transition sur l'onboarding ou le dashboard et
// peut se demander si le clic a vraiment fonctionné.
export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const continueHref = safeNext(next);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-[20px] border border-border bg-bg2 p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
          ✓
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold">Compte confirmé !</h1>
        <p className="mt-2 font-display text-sm text-muted">
          Ton adresse email est validée et ton compte est actif. Tu peux te
          connecter depuis n&apos;importe quel appareil désormais.
        </p>

        <Link
          href={continueHref}
          className="mt-7 block w-full rounded-[10px] bg-accent px-4 py-3 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110"
        >
          Continuer
        </Link>
      </div>
    </div>
  );
}

// N'accepte qu'un chemin interne : empêche `?next=https://ailleurs` de
// transformer la page en redirection ouverte.
function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/onboarding";
  return value;
}
