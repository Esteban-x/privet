// ─── Cloudflare Turnstile ───────────────────────────────────────────
// La vérification cryptographique du jeton n'est PAS faite ici : on la confie
// à Supabase Auth (Authentication → Attack Protection → Enable Captcha
// protection, provider « Turnstile », avec la clé secrète). Supabase protège
// ainsi l'endpoint lui-même — un bot qui appellerait `/auth/v1/signup`
// directement avec la clé anon est bloqué, pas seulement notre formulaire.
//
// Important : un jeton Turnstile est à usage unique. Le valider nous-mêmes
// auprès de `siteverify` le consommerait et l'appel Supabase échouerait
// ensuite. D'où le partage des rôles : présence du jeton vérifiée côté action,
// validité vérifiée par Supabase.

/** Clé de test Cloudflare : le widget se résout toujours, sans réseau réel. */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

/**
 * Clé publique du widget. Absente en développement, on retombe sur la clé de
 * test pour ne pas bloquer le travail en local ; en production, on renvoie
 * `null` et le formulaire refuse de se soumettre plutôt que de laisser passer
 * les inscriptions sans captcha.
 */
export function turnstileSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (key) return key;
  return process.env.NODE_ENV === "production" ? null : TURNSTILE_TEST_SITE_KEY;
}

/** Nom du champ transportant le jeton, côté formulaire comme côté action. */
export const TURNSTILE_FIELD = "captchaToken";
