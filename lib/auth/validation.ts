// Validation des champs d'inscription. Côté serveur uniquement : le HTML
// (`required`, `type="email"`, `minLength`) ne sert qu'à guider la saisie.

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export type SignupField = keyof SignupInput | "captcha";
export type FieldErrors = Partial<Record<SignupField, string>>;

// Assez strict pour attraper les fautes de frappe, assez large pour ne pas
// rejeter d'adresse valide : la vraie vérification, c'est l'email de confirmation.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
// Lettres (toutes langues), marques diacritiques, espace, tiret, apostrophe.
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} '’-]*$/u;

export const PASSWORD_MIN = 8;
// GoTrue hache en bcrypt : au-delà de 72 octets, le surplus est ignoré.
const PASSWORD_MAX = 72;

/** Espaces en trop supprimés, espaces internes réduits à un seul. */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function checkName(value: string, label: string): string | undefined {
  if (!value) return `Le ${label} est obligatoire.`;
  if (value.length < 2) return `Le ${label} doit faire au moins 2 caractères.`;
  if (value.length > 40) return `Le ${label} ne doit pas dépasser 40 caractères.`;
  if (!NAME_RE.test(value)) return `Le ${label} contient des caractères non autorisés.`;
  return undefined;
}

/**
 * Les règles du mot de passe, à un seul endroit.
 *
 * ELLES ÉTAIENT ÉCRITES DEUX FOIS, ET DIFFÉREMMENT. L'inscription exigeait
 * huit signes, une lettre et un chiffre ; le changement de mot de passe du
 * compte (components/account/PasswordSettings.tsx) se contentait de la
 * longueur. On pouvait donc contourner la règle du chiffre en s'inscrivant
 * avec un mot de passe conforme puis en le remplaçant aussitôt par « aaaaaaaa ».
 * La récupération de mot de passe ajoutait un troisième endroit où diverger :
 * autant n'en avoir plus qu'un.
 */
export function checkPassword(password: string): string | undefined {
  if (!password) return "Le mot de passe est obligatoire.";
  if (password.length < PASSWORD_MIN) {
    return `Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`;
  }
  // bcrypt (GoTrue) compte des OCTETS, pas des unités UTF-16 : un mot de
  // passe avec des caractères accentués/cyrilliques/emoji peut dépasser la
  // limite réelle sans dépasser `.length`, et serait alors tronqué
  // silencieusement côté serveur d'auth sans que cette validation le voie.
  if (new TextEncoder().encode(password).length > PASSWORD_MAX) {
    return `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX} octets (les caractères accentués ou non-latins en comptent plusieurs chacun).`;
  }
  if (!/[a-zA-Z\p{L}]/u.test(password) || !/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return undefined;
}

/** La saisie de confirmation, séparée : elle a ses propres messages. */
export function checkPasswordConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return "Confirme ton mot de passe.";
  if (password !== confirm) return "Les deux mots de passe ne correspondent pas.";
  return undefined;
}

export function validateSignup(input: SignupInput): FieldErrors {
  const errors: FieldErrors = {};

  const firstNameError = checkName(input.firstName, "prénom");
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = checkName(input.lastName, "nom de famille");
  if (lastNameError) errors.lastName = lastNameError;

  if (!input.email) {
    errors.email = "L'adresse email est obligatoire.";
  } else if (input.email.length > 254 || !EMAIL_RE.test(input.email)) {
    errors.email = "Cette adresse email n'a pas l'air valide.";
  }

  const passwordError = checkPassword(input.password);
  if (passwordError) errors.password = passwordError;

  const confirmError = checkPasswordConfirm(input.password, input.passwordConfirm);
  if (confirmError) errors.passwordConfirm = confirmError;

  return errors;
}
