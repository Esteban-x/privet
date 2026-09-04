import PageSkeleton from "@/components/ui/PageSkeleton";

// Voir components/ui/PageSkeleton.tsx : ce fichier ne sert pas qu'à
// remplir l'écran, il autorise Next à PRÉCHARGER cette route dynamique et
// donc à basculer dessus au clic, sans attendre le serveur.
export default function CoursLoading() {
  return <PageSkeleton variant="hub" width="max-w-5xl" />;
}
