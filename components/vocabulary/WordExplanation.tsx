"use client";

import { useEffect, useRef, useState } from "react";
import type { WordExplanation as Explanation } from "@/lib/vocabulary/explanation";
import AiSpark from "@/components/ui/AiSpark";
import { LoadingDots } from "@/components/ui/Skeleton";
import PaywallNotice from "@/components/ui/PaywallNotice";
import { quotaErrorFrom, type QuotaInfo } from "@/lib/billing/quota-client";

/**
 * Fiche d'explication d'un mot, générée à la demande puis mise en cache
 * côté serveur (/api/vocab/explain).
 *
 * Annoncée comme générée par l'IA, sans détour : contrairement aux
 * exercices de déclinaison, rien ici n'est recalculé par le moteur de
 * règles — c'est du commentaire de professeur, utile mais faillible, et
 * l'apprenant a le droit de le savoir. D'où la marque `AiSpark` sur le
 * bouton, sur l'en-tête de la fiche et sur sa mention finale : le même
 * symbole partout où le modèle parle.
 */
export default function WordExplanation({
  wordId,
  /** Déclenche le chargement sans clic — le bouton « Expliquer » de la carte. */
  autoLoad = false,
}: {
  wordId: string;
  autoLoad?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error" | "quota">("idle");
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  // Le message du serveur quand un plafond est atteint. Un « Explication
  // indisponible — réessayer » générique serait ici un mensonge : rien ne
  // sert de réessayer, et l'apprenant ne saurait pas que sa découverte
  // gratuite est épuisée ni ce qu'il gagnerait à s'abonner.
  const [blocked, setBlocked] = useState<{ quota: QuotaInfo; message: string } | null>(null);
  const started = useRef(false);

  async function load(refresh = false) {
    started.current = true;
    setState("loading");
    try {
      const res = await fetch("/api/vocab/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, refresh }),
      });
      const data = await res.json().catch(() => ({}));
      const quota = quotaErrorFrom(res, data);
      if (quota) {
        setBlocked({ quota: quota.quota, message: quota.message });
        setState("quota");
        return;
      }
      if (!res.ok || !data.explanation) {
        setState("error");
        return;
      }
      setExplanation(data.explanation as Explanation);
      setState("done");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    if (autoLoad && !started.current) load();
    // `load` est stable pour un wordId donné ; la garde `started` empêche un
    // second appel si le parent repasse autoLoad à true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, wordId]);

  if (state === "idle") {
    return (
      <button
        onClick={() => load()}
        className="inline-flex items-center gap-2 rounded-xl border border-accent2/40 bg-accent2/10 px-3.5 py-2 font-display text-xs font-bold text-accent2 transition-colors hover:border-accent2/35 hover:bg-accent2/20"
      >
        <AiSpark className="h-4 w-4" />
        Expliquer ce mot
      </button>
    );
  }

  if (state === "loading") {
    return (
      <div className="rounded-xl border border-accent2/30 bg-accent2/5 px-4 py-3">
        <LoadingDots label="Le professeur rédige…" />
      </div>
    );
  }

  // Un plafond atteint n'est pas une panne : pas de bouton « réessayer »,
  // qui ne ferait que reconsommer une tentative pour le même refus.
  if (state === "quota" && blocked) {
    return (
      <PaywallNotice
        quota={blocked.quota}
        message={blocked.message}
        what="les explications de mots"
      />
    );
  }

  if (state === "error" || !explanation) {
    return (
      <button
        onClick={() => load()}
        className="inline-flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2 font-display text-xs font-semibold text-danger"
      >
        Explication indisponible — réessayer
      </button>
    );
  }

  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-accent2/30 bg-accent2/[0.04]">
      <div className="flex items-center gap-2 border-b border-accent2/20 bg-accent2/10 px-4 py-2">
        <AiSpark className="h-3.5 w-3.5 text-accent2" />
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.06em] text-accent2">
          Expliqué par l&apos;IA
        </span>
        <button
          onClick={() => load(true)}
          className="ml-auto font-display text-[11px] font-semibold text-muted transition-colors hover:text-accent2"
        >
          Régénérer
        </button>
      </div>

      <div className="px-4 py-3.5 text-left">
        <div className="flex flex-wrap items-center gap-2">
          {explanation.partOfSpeech && (
            <span className="rounded-full bg-accent2/15 px-2 py-0.5 font-display text-[11px] font-bold text-accent2">
              {explanation.partOfSpeech}
            </span>
          )}
          {explanation.register && (
            <span className="rounded-full border border-border px-2 py-0.5 font-display text-[11px] font-semibold text-muted">
              {explanation.register}
            </span>
          )}
        </div>

        <p className="mt-2.5 font-display text-sm leading-relaxed text-text">
          {explanation.meaning}
        </p>

        {explanation.pitfall && (
          <p className="mt-3 rounded-lg border border-accent2-deep/40 bg-accent2-deep/10 px-3 py-2 font-display text-sm leading-relaxed text-text">
            <span className="font-bold">À surveiller — </span>
            {explanation.pitfall}
          </p>
        )}

        {explanation.examples.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {explanation.examples.map((ex, i) => (
              <li key={i} className="font-display text-sm">
                <span className="font-semibold text-text">{ex.ru}</span>
                <span className="ml-2 text-muted">{ex.fr}</span>
              </li>
            ))}
          </ul>
        )}

        {explanation.collocations.length > 0 && (
          <Section title="Expressions courantes" items={explanation.collocations} />
        )}
        {explanation.related.length > 0 && (
          <Section title="Mots proches" items={explanation.related} />
        )}

        <p className="mt-3 border-t border-border pt-2.5 font-display text-[11px] leading-relaxed text-muted">
          Nuances et exemples ne passent pas par le moteur de déclinaison,
          contrairement aux exercices : à prendre comme le commentaire d&apos;un
          professeur, pas comme une référence.
        </p>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="font-display text-sm text-text">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
