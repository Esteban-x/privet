import type { Metadata } from "next";
import { redirect } from "next/navigation";

/**
 * Le titre de l'onglet.
 *
 * SANS LUI, LA PAGE PORTE CELUI DE L'ACCUEIL. Le layout racine définit un
 * `title.default`, et Next le donne à toute page qui n'en déclare pas —
 * cette page affichait donc « Apprendre le russe : cours, déclinaisons et
 * exercices », comme l'accueil, comme un onglet sur deux. Quelqu'un qui
 * travaille avec quatre onglets ouverts ne peut plus les distinguer, et un
 * favori enregistré ici ne dit pas ce qu'il ouvre.
 *
 * Sans « — Privetik » : le gabarit du layout l'ajoute.
 */
export const metadata: Metadata = {
  title: "Liste de vocabulaire",
};

// Le détail d'une liste vit maintenant dans le panneau de droite de
// /vocabulary, à côté de la colonne des listes : on passe d'une liste à
// l'autre sans navigation. Gardé comme redirection pour les liens et
// favoris qui pointent encore ici.
export default async function VocabListRedirect({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;
  redirect(`/vocabulary?list=${listId}`);
}
