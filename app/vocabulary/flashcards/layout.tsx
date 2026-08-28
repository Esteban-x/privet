import type { Metadata } from "next";

/**
 * CE FICHIER N'EXISTE QUE POUR LE TITRE DE L'ONGLET.
 *
 * La page voisine est un composant client — elle a besoin d'état, de
 * minuteurs et du clavier — et un composant client NE PEUT PAS exporter
 * `metadata` : Next lit les métadonnées au rendu serveur, avant que le
 * navigateur n'existe. Faute de pouvoir les déclarer, la page recevait le
 * `title.default` du layout racine et s'affichait « Apprendre le russe :
 * cours, déclinaisons et exercices » — le titre de l'accueil, sur les cinq
 * modes de révision à la fois.
 *
 * Un layout, lui, reste un composant serveur. Il ne rend rien de plus que
 * ses enfants ; il porte juste le titre que la page ne peut pas porter.
 *
 * Sans « — Privetik » : le gabarit du layout racine l'ajoute.
 */
export const metadata: Metadata = {
  title: "Réviser en cartes",
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
