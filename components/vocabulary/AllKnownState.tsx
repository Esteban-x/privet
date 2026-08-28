import Link from "next/link";

/**
 * « Tout est mis de côté » — l'écran des quatre modes de révision quand
 * l'apprenant a marqué « je le sais » sur tous les mots disponibles.
 *
 * Sans lui, ce cas tombait sur le résumé de fin de session, qui annonçait
 * fièrement zéro mot révisé, ou sur l'état « aucun mot » qui proposait d'en
 * ajouter alors qu'il y en a. Ici on dit ce qui s'est passé et où le
 * défaire.
 */
export default function AllKnownState({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-14 sm:py-24 text-center">
      <p className="font-display text-lg font-semibold">Tu sais déjà tout ce qu&apos;il y a ici</p>
      <p className="mt-2 font-display text-sm text-muted">
        Ces mots sont marqués « je le sais » : ils ne reviennent plus en révision. Rouvre la liste
        et remets-en un ou deux sur « normal » ou « à travailler » pour les revoir.
      </p>
      <Link
        href={backHref}
        className="btn btn-primary btn-sheen mt-5 inline-block rounded-[10px] px-5 py-2.5 font-display text-sm"
      >
        {backLabel}
      </Link>
    </div>
  );
}
