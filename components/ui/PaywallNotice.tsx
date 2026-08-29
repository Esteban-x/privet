import Link from "next/link";
import type { QuotaInfo } from "@/lib/billing/quota-client";

/**
 * L'écran d'un plafond atteint.
 *
 * CE N'EST PAS UN MESSAGE D'ERREUR, et il ne doit pas y ressembler. Du
 * rouge, une croix, un ton d'incident : l'apprenant croirait que quelque
 * chose s'est cassé, alors que l'app fait exactement ce qu'elle doit. Le
 * bloc est donc calme, dans les couleurs de la marque, et sa seule
 * accentuation est le bouton.
 *
 * IL DIT CE QUI ARRIVE ENSUITE. « Quota atteint » sans suite laisse dans
 * l'impasse : selon la raison, la limite tombe cette nuit, dans une minute,
 * ou seulement avec l'abonnement — et c'est cette phrase-là qui manque
 * partout ailleurs.
 *
 * `upgrade` vient du serveur et non d'une déduction locale : proposer
 * l'abonnement à un abonné qui vient de saturer une rafale serait absurde.
 */
export default function PaywallNotice({
  quota,
  message,
  /** Ce que l'apprenant essayait d'obtenir — « un texte de lecture ». */
  what,
}: {
  quota: QuotaInfo;
  message: string;
  what?: string;
}) {
  const nextStep =
    quota.reason === "burst"
      ? "Réessaie dans une minute."
      : quota.reason === "daily"
        ? "Ta limite se réinitialise cette nuit."
        : quota.reason === "monthly"
          ? "Ta limite se réinitialise le 1er du mois."
          : null;

  return (
    <div className="surface relative overflow-hidden rounded-[20px] p-6">
      {/* Lueur d'accent en haut à gauche : elle range le bloc du côté des
          fonctionnalités désirables, pas des incidents. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent-ink">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <rect x="4" y="10" width="16" height="10" rx="2" strokeLinejoin="round" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
            </svg>
          </span>
          <p className="font-display text-sm font-bold uppercase tracking-[0.06em] text-muted">
            {quota.upgrade ? "Réservé à l'abonnement" : "Limite atteinte"}
          </p>
        </div>

        <p className="mt-3 font-display text-[15px] leading-relaxed text-text">{message}</p>
        {nextStep && (
          <p className="mt-1 font-display text-sm text-muted">{nextStep}</p>
        )}

        {quota.upgrade && (
          <p className="mt-4 font-display text-sm leading-relaxed text-muted">
            L&apos;abonnement ouvre {what ?? "cette fonctionnalité"} sans compter,
            avec les explications de mots et les exercices rédigés sur mesure.
          </p>
        )}

        {/* JAMAIS DE CUL-DE-SAC. Ce bloc n'avait AUCUN bouton dès que
            `upgrade` était faux : l'apprenant lisait une phrase et se
            retrouvait devant un écran mort, sans même de quoi revenir au
            cours. C'est l'écran qu'on a vu en production sur un compte
            payant — le pire cas possible, puisque la phrase parlait
            d'abonnement à quelqu'un qui en avait un.

            Il y a donc toujours une sortie, et c'est `upgrade` qui décide
            LAQUELLE est mise en avant : l'abonnement quand il lève
            réellement la limite, le retour au cours sinon. Un plafond de
            rafale ou une panne ne doivent pas vendre quoi que ce soit. */}
        <div className="mt-5 flex flex-wrap gap-3">
          {quota.upgrade && (
            <Link
              href="/premium"
              className="btn btn-primary btn-sheen rounded-xl px-6 py-3 font-display text-sm font-bold"
            >
              Voir l&apos;abonnement
            </Link>
          )}
          <Link
            href="/cours"
            className={
              quota.upgrade
                ? "btn btn-outline rounded-xl px-6 py-3 font-display text-sm font-semibold text-text"
                : "btn btn-primary btn-sheen rounded-xl px-6 py-3 font-display text-sm font-bold"
            }
          >
            Continuer le cours
          </Link>
        </div>
      </div>
    </div>
  );
}
