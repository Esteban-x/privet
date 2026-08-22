const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Valide un id de route dynamique avant de l'envoyer à Postgres : un id mal
// formé (colonne `uuid`) fait échouer la requête avec une erreur brute
// PostgREST ("invalid input syntax for type uuid...") qu'on renvoyait telle
// quelle au client avec un 500 — vérifié ici pour répondre 400 proprement
// à la place, sans même toucher la base.
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
