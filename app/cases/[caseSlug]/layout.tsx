import { notFound } from "next/navigation";
import { getCase } from "@/lib/grammar/cases";

/**
 * LE 404 EST TRANCHÉ ICI, ET PAS DANS LA PAGE — UNE QUESTION D'ORDRE.
 *
 * `page.tsx` appelait bien `notFound()` sur un identifiant inconnu, et ça ne
 * suffisait pas : `/cases/nexistepas` répondait « 200 OK » avec une page
 * VIDE, en production comme en local. Ni le contenu, ni la belle 404 qui
 * enseigne le génitif de la négation. Un robot d'indexation y voyait donc
 * une page valide de plus, et l'adresse morte entrait dans l'index.
 *
 * LA CAUSE EST `loading.tsx`, dans ce même dossier. Il crée une frontière
 * Suspense : Next envoie la coquille — donc les EN-TÊTES, donc le statut —
 * dès que la page suspend, et affiche le squelette pendant qu'elle se rend.
 * Quand `notFound()` s'exécute enfin dans le corps de la page, il est trop
 * tard pour changer un statut déjà parti sur le réseau.
 *
 * Un layout, lui, s'exécute AVANT cette frontière. Le contrôle y est donc
 * fait à temps, et le squelette n'a aucune raison de s'afficher pour une
 * adresse qui n'existe pas.
 *
 * `generateStaticParams` ne réglait rien, et `dynamicParams = false` non
 * plus : la page lit la session, ce qui la rend dynamique, et une route
 * dynamique ne fait pas respecter la liste des paramètres statiques.
 *
 * Contrôlé par check:seo, qui exige un 404 sur un identifiant inventé dans
 * chacun des trois arbres de contenu.
 */
export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ caseSlug: string }>;
}) {
  const { caseSlug } = await params;
  if (!getCase(caseSlug)) notFound();
  return children;
}
