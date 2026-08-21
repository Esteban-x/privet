"use client";

import { useState } from "react";
import type { CaptchaChallenge } from "@/lib/auth/captcha";

interface Props {
  /** Défi initial rendu par le serveur. */
  initial: CaptchaChallenge;
  /** Défi de remplacement renvoyé par l'action après un échec. */
  replacement?: CaptchaChallenge;
  error?: string;
}

// Champ captcha : image + saisie. Le jeton signé voyage dans un input caché,
// c'est lui que le serveur vérifie (l'image seule ne prouve rien).
export default function CaptchaField({ initial, replacement, error }: Props) {
  const [refreshed, setRefreshed] = useState<CaptchaChallenge | null>(null);
  const [seenReplacement, setSeenReplacement] = useState(replacement);
  const [refreshing, setRefreshing] = useState(false);

  // Quand l'action renvoie un défi neuf (après un échec), il prime sur celui
  // que le bouton « Autre image » aurait pu charger. Ajustement pendant le
  // rendu plutôt que dans un effet : pas de rendu intermédiaire périmé.
  if (replacement !== seenReplacement) {
    setSeenReplacement(replacement);
    setRefreshed(null);
  }

  const challenge = refreshed ?? replacement ?? initial;

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" });
      if (res.ok) setRefreshed((await res.json()) as CaptchaChallenge);
    } catch {
      // Réseau indisponible : on garde le défi courant, il est encore valide.
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      <label
        htmlFor="captchaAnswer"
        className="mb-1.5 block font-display text-sm font-medium text-muted"
      >
        Recopie le code
      </label>

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- data URI généré à la volée, hors pipeline d'optimisation */}
        <img
          src={challenge.image}
          alt="Code de sécurité à recopier"
          width={220}
          height={68}
          className="h-[68px] w-[220px] shrink-0 rounded-[10px] border border-border"
        />
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="rounded-[10px] border border-border px-3 py-2 font-display text-xs font-medium text-muted transition-colors hover:border-accent hover:text-text disabled:opacity-50"
        >
          {refreshing ? "…" : "Autre image"}
        </button>
      </div>

      <input type="hidden" name="captchaToken" value={challenge.token} />
      {/* La clé force un remontage à chaque nouveau défi : le code précédemment
          tapé ne reste pas affiché sous une image qui a changé. */}
      <input
        key={challenge.token}
        id="captchaAnswer"
        name="captchaAnswer"
        type="text"
        required
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={8}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "captchaAnswer-error" : undefined}
        className="mt-3 w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 font-display text-sm uppercase tracking-[0.3em] text-text placeholder:tracking-normal placeholder:text-muted/60 focus:border-accent focus:outline-none"
        placeholder="Les 5 caractères"
      />

      {error && (
        <p id="captchaAnswer-error" className="mt-1.5 font-display text-xs text-accent2">
          {error}
        </p>
      )}
    </div>
  );
}
