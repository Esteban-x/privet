import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

// ─── Captcha auto-hébergé, sans état ────────────────────────────────
// Le serveur tire un code aléatoire, le dessine en SVG déformé, et renvoie
// un jeton = `expiration.sel.HMAC(secret, expiration|sel|réponse)`. La réponse
// n'est jamais envoyée au navigateur : pour valider, on recalcule le HMAC avec
// ce que l'utilisateur a tapé et on compare. Aucun stockage serveur requis.
//
// Limite assumée : un attaquant peut théoriquement forcer le HMAC hors-ligne
// (32^5 combinaisons). Ce n'est pas moins cher que d'OCR-iser l'image, et la
// courte durée de vie du jeton borne la fenêtre. Pour une protection contre
// des bots déterminés, passer à Turnstile/hCaptcha (voir README).

const TTL_MS = 5 * 60 * 1000;
// Alphabet sans I/O/0/1/S/5 : ambigus à l'écran comme à la saisie.
const ALPHABET = "ABCDEFGHJKLMNPQRTUVWXYZ23469";
const LENGTH = 5;
const WIDTH = 220;
const HEIGHT = 68;

export const CAPTCHA_LENGTH = LENGTH;

export interface CaptchaChallenge {
  /** Jeton signé à renvoyer tel quel avec le formulaire. */
  token: string;
  /** Image du défi, en data URI (utilisable directement dans `<img src>`). */
  image: string;
}

let warnedMissingSecret = false;

function secret(): string {
  const value = process.env.CAPTCHA_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CAPTCHA_SECRET manquant : génère 32+ caractères aléatoires et mets-les dans l'environnement."
    );
  }
  if (!warnedMissingSecret) {
    warnedMissingSecret = true;
    console.warn(
      "[captcha] CAPTCHA_SECRET absent — secret de développement utilisé. " +
        "Ajoute CAPTCHA_SECRET dans .env.local avant de déployer."
    );
  }
  return "dev-only-captcha-secret-change-me";
}

function sign(expiry: number, salt: string, answer: string): string {
  return createHmac("sha256", secret())
    .update(`${expiry}|${salt}|${answer}`)
    .digest("hex");
}

/** Tire un nouveau défi : une image à lire et le jeton qui l'accompagne. */
export function createCaptcha(): CaptchaChallenge {
  const answer = Array.from(
    { length: LENGTH },
    () => ALPHABET[randomInt(ALPHABET.length)]
  ).join("");
  const expiry = Date.now() + TTL_MS;
  // Le sel rend deux jetons différents même si le code tiré est le même.
  const salt = randomBytes(8).toString("hex");

  return {
    token: `${expiry}.${salt}.${sign(expiry, salt, answer)}`,
    image: `data:image/svg+xml;base64,${Buffer.from(renderSvg(answer), "utf8").toString("base64")}`,
  };
}

/** Vrai si `input` est bien le code dessiné dans le défi signé par `token`. */
export function verifyCaptcha(token: unknown, input: unknown): boolean {
  if (typeof token !== "string" || typeof input !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [rawExpiry, salt, signature] = parts;

  // Format strict avant tout : `Buffer.from(x, "hex")` ignore en silence ce
  // qu'il ne sait pas décoder, donc un suffixe parasite passerait la comparaison.
  if (!/^[0-9]{10,16}$/.test(rawExpiry)) return false;
  if (!/^[0-9a-f]{16}$/.test(salt)) return false;
  if (!/^[0-9a-f]{64}$/.test(signature)) return false;

  const expiry = Number(rawExpiry);
  if (Date.now() > expiry) return false;

  const answer = input.trim().toUpperCase();
  if (answer.length !== LENGTH) return false;

  return timingSafeEqual(
    Buffer.from(sign(expiry, salt, answer), "hex"),
    Buffer.from(signature, "hex")
  );
}

// ─── Rendu ──────────────────────────────────────────────────────────
// L'alphabet est limité à [A-Z2-9] : aucun caractère à échapper en XML.

function renderSvg(answer: string): string {
  const step = WIDTH / (LENGTH + 1);

  const glyphs = answer
    .split("")
    .map((char, i) => {
      const x = Math.round(step * (i + 1) + randomInt(-5, 6));
      const y = Math.round(HEIGHT / 2 + randomInt(-5, 8));
      const angle = randomInt(-26, 27);
      const size = randomInt(28, 37);
      const skew = randomInt(-10, 11);
      return (
        `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" ` +
        `font-family="Georgia,'Times New Roman',serif" fill="#f3f4f7" ` +
        `text-anchor="middle" dominant-baseline="central" ` +
        `transform="rotate(${angle} ${x} ${y}) skewX(${skew})">${char}</text>`
      );
    })
    .join("");

  // Traits qui traversent le texte : gênent la segmentation automatique.
  const strokes = Array.from({ length: 3 }, () => {
    const y1 = randomInt(6, HEIGHT - 6);
    const y2 = randomInt(6, HEIGHT - 6);
    const cy = randomInt(-10, HEIGHT + 10);
    return (
      `<path d="M0 ${y1} Q ${WIDTH / 2} ${cy} ${WIDTH} ${y2}" fill="none" ` +
      `stroke="#4a63d6" stroke-opacity="0.55" stroke-width="${randomInt(1, 3)}"/>`
    );
  }).join("");

  const speckles = Array.from({ length: 45 }, () => {
    const cx = randomInt(0, WIDTH);
    const cy = randomInt(0, HEIGHT);
    return `<circle cx="${cx}" cy="${cy}" r="${randomInt(1, 3)}" fill="#9aa1b4" fill-opacity="0.35"/>`;
  }).join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" ` +
    `viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Code de sécurité à recopier">` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="#1c202c"/>` +
    speckles +
    glyphs +
    strokes +
    `</svg>`
  );
}
