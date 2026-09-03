import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * LES TROIS LEÇONS DE PLURIEL ONT ÉTÉ FONDUES DANS LEUR CAS.
   *
   * Chaque cas de l'unité 3 donne maintenant son singulier PUIS son pluriel,
   * au lieu de renvoyer à une leçon séparée trois écrans plus bas. Trois
   * adresses disparaissent donc du catalogue — et elles étaient au sitemap,
   * indexées, et liées depuis un guide.
   *
   * Une 301 plutôt qu'un 404 : le contenu n'a pas été supprimé, il a
   * déménagé dans une page qui le contient en entier. C'est la définition
   * même d'une redirection permanente, et c'est ce qui transmet à la page
   * d'arrivée ce que l'ancienne avait accumulé.
   *
   * `pluriel-des-autres-cas` couvrait trois cas à la fois : faute de page
   * unique qui lui corresponde, elle atterrit sur le datif, qui ouvrait son
   * titre et ses mots-clés.
   */
  async redirects() {
    return [
      { source: "/cours/nominatif-pluriel", destination: "/cours/nominatif", permanent: true },
      { source: "/cours/genitif-pluriel", destination: "/cours/genitif", permanent: true },
      { source: "/cours/pluriel-des-autres-cas", destination: "/cours/datif", permanent: true },
    ];
  },
};

export default nextConfig;
