// État partagé entre l'action serveur de suppression de compte et le
// formulaire (`useActionState`). Il vit ici plutôt que dans
// `app/account/actions.ts` : un module `"use server"` ne peut exporter que
// des fonctions async — y exporter cette constante faisait échouer le
// chargement du module, et donc toute la page /account, avec « A "use
// server" file can only export async functions, found object ».
// Même raison et même emplacement que `lib/auth/signup-state.ts`.

export interface DeleteAccountState {
  error: string | null;
}

export const INITIAL_DELETE_ACCOUNT_STATE: DeleteAccountState = { error: null };
