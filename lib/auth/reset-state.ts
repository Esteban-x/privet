// État partagé entre l'action serveur de demande de réinitialisation et son
// formulaire (`useActionState`). Il vit ici et non dans
// `app/forgot-password/actions.ts` : un module `"use server"` ne peut
// exporter que des fonctions async.

export interface ResetRequestState {
  status: "idle" | "error" | "sent";
  /** Message affiché sous le formulaire, succès comme échec. */
  message?: string;
  /** Réaffiché après un échec, pour ne pas faire retaper l'adresse. */
  email: string;
}

export const INITIAL_RESET_REQUEST_STATE: ResetRequestState = { status: "idle", email: "" };
