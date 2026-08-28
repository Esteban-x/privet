"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkPassword, checkPasswordConfirm } from "@/lib/auth/validation";

/**
 * La saisie du nouveau mot de passe.
 *
 * ELLE N'A PAS BESOIN DU JETON DE L'EMAIL. Le lien est déjà passé par
 * app/auth/confirm/route.ts, qui a validé le jeton et OUVERT UNE SESSION.
 * Arrivé ici, on est authentifié : `updateUser` s'applique au compte
 * courant, exactement comme le changement de mot de passe dans les
 * réglages. C'est aussi pourquoi la page est protégée par proxy.ts plutôt
 * que publique — sans session valide, il n'y a rien à réinitialiser.
 *
 * LES RÈGLES VIENNENT DE lib/auth/validation. Les réécrire ici aurait donné
 * un troisième jeu de règles, susceptible de diverger de l'inscription : on
 * aurait pu choisir à la réinitialisation un mot de passe que l'inscription
 * aurait refusé.
 *
 * ON REDIRIGE VERS LE TABLEAU DE BORD, PAS VERS /login. La session est
 * ouverte : renvoyer vers le formulaire de connexion demanderait de saisir
 * le mot de passe qu'on vient de choisir, pour arriver là où on était déjà.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const problem = checkPassword(password) ?? checkPasswordConfirm(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setDone(true);
      // `refresh` avant `push` : le layout serveur relit la session et la
      // barre de navigation s'affiche en « connecté » dès l'arrivée.
      router.refresh();
      router.push("/dashboard");
    } catch {
      setError(
        "Le changement a échoué. Le lien a peut-être expiré — redemandes-en un depuis « Mot de passe oublié »."
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block font-display text-sm font-medium text-muted"
        >
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none"
        />
        <p className="mt-1.5 font-display text-xs text-muted">
          8 caractères minimum, avec au moins une lettre et un chiffre.
        </p>
      </div>

      <div className="mt-4">
        <label
          htmlFor="confirm"
          className="mb-1.5 block font-display text-sm font-medium text-muted"
        >
          Confirme le mot de passe
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/60 field-focus focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving || done}
        className="btn surface-interactive surface-static mt-6 h-12 w-full rounded-xl px-4 font-display text-sm font-semibold disabled:opacity-60"
      >
        <span>{done ? "Mot de passe changé ✓" : saving ? "Enregistrement…" : "Choisir ce mot de passe"}</span>
      </button>

      {error && (
        <p role="alert" className="mt-3 font-display text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
