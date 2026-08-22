"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  TURNSTILE_FIELD,
  TURNSTILE_TEST_SITE_KEY,
  turnstileSiteKey,
} from "@/lib/auth/turnstile";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface Props {
  /** Étiquette de l'action, visible dans les stats Cloudflare. */
  action: "signup" | "resend" | "login";
  /**
   * Incrémente cette valeur pour forcer un jeton neuf — nécessaire après
   * chaque échec de soumission, puisque le jeton consommé par Supabase ne
   * peut pas être réutilisé.
   */
  resetSignal?: number;
  /**
   * Pour les flux qui n'appellent pas Supabase via un `<form action>` (ex.
   * connexion, qui utilise le SDK client directement) : reçoit le jeton dès
   * qu'il est disponible, pour le passer explicitement à l'appel. Dans ce cas
   * l'input caché habituel de Turnstile n'est pas nécessaire.
   */
  onToken?: (token: string | null) => void;
}

// Widget Turnstile. Par défaut, Turnstile gère lui-même un input caché nommé
// `captchaToken` (`response-field-name`) pour les flux basés sur un
// `<form action>` — la vérification cryptographique du jeton se fait côté
// Supabase (Authentication → Attack Protection), pas ici — voir
// lib/auth/turnstile.ts pour le détail du partage des rôles.
export default function TurnstileWidget({ action, resetSignal = 0, onToken }: Props) {
  const siteKey = turnstileSiteKey();
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [errored, setErrored] = useState(false);

  // Lu via une ref pour ne pas re-monter le widget quand `onToken` change
  // d'identité entre deux rendus du parent. Affectée dans un effet (jamais
  // pendant le rendu) : React peut rendre un composant plusieurs fois avant
  // de commiter, et une ref reflète l'état commité, pas le rendu en cours.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !scriptReady || !container.current || widgetId.current) return;
    const api = window.turnstile;
    if (!api) return;

    widgetId.current = api.render(container.current, {
      sitekey: siteKey,
      action,
      theme: "dark",
      language: "fr",
      size: "flexible",
      retry: "auto",
      "response-field": !onTokenRef.current,
      "response-field-name": TURNSTILE_FIELD,
      "error-callback": () => {
        setErrored(true);
        onTokenRef.current?.(null);
      },
      "expired-callback": () => onTokenRef.current?.(null),
      "timeout-callback": () => onTokenRef.current?.(null),
      callback: (value: string) => {
        setErrored(false);
        onTokenRef.current?.(value);
      },
    });

    const id = widgetId.current;
    return () => {
      widgetId.current = null;
      window.turnstile?.remove(id);
    };
  }, [siteKey, scriptReady, action]);

  // Après un échec de soumission, redemande un jeton frais. Pur appel
  // impératif vers l'API Turnstile — le nouveau jeton arrive de façon
  // asynchrone via `callback` ci-dessus, sans état React à synchroniser ici.
  useEffect(() => {
    if (resetSignal > 0 && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetSignal]);

  if (!siteKey) {
    return (
      <p
        role="alert"
        className="rounded-[10px] border border-danger/40 bg-danger/10 px-3.5 py-2.5 font-display text-sm text-danger"
      >
        Le captcha n&apos;est pas configuré sur ce serveur
        (NEXT_PUBLIC_TURNSTILE_SITE_KEY manquante). L&apos;inscription est
        indisponible.
      </p>
    );
  }

  return (
    <div>
      <Script
        src={SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setErrored(true)}
      />

      <div ref={container} className="min-h-[65px]" />

      {errored && (
        <p role="alert" className="mt-2 font-display text-xs text-danger">
          Le captcha n&apos;a pas pu se charger. Vérifie ta connexion ou tes
          bloqueurs, puis recharge la page.
        </p>
      )}

      {siteKey === TURNSTILE_TEST_SITE_KEY && (
        <p className="mt-2 font-display text-xs text-muted">
          Clé de test Cloudflare : ce captcha réussit toujours. Configure
          NEXT_PUBLIC_TURNSTILE_SITE_KEY avant de déployer.
        </p>
      )}
    </div>
  );
}
