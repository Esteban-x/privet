/**
 * L'origine publique, en un seul endroit.
 *
 * Trois fichiers en avaient besoin — le layout pour `metadataBase`, le
 * robots.txt et le plan du site — et chacun l'avait recopiée avec son propre
 * repli. Un jour où l'un d'eux se trompe de repli, il publie des URL absolues
 * vers localhost dans un fichier que les moteurs lisent.
 *
 * En production, `NEXT_PUBLIC_SITE_URL` doit être le domaine réel. Le repli
 * local ne sert qu'au développement.
 */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** URL absolue d'un chemin interne — les moteurs n'acceptent pas le relatif. */
export function absolute(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
