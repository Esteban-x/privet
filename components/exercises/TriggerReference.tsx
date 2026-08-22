"use client";

import { useState } from "react";
import { CaseId } from "@/lib/grammar/types";
import { CaseTrigger, triggersForCase, TriggerKind, TriggerTier } from "@/lib/grammar/triggers";
import SectionLabel from "@/components/ui/SectionLabel";

const KIND_LABEL: Record<TriggerKind, string> = {
  preposition: "Prépositions",
  verb: "Verbes à régime",
  expression: "Expressions",
};

const KIND_ORDER: TriggerKind[] = ["preposition", "verb", "expression"];

// Basique en premier : ce qui reste visible avant "Voir plus" est toujours
// l'essentiel, quel que soit le niveau de l'utilisateur — l'avancé se
// mérite en dépliant, il n'écrase jamais les fondamentaux.
const TIER_RANK: Record<TriggerTier, number> = { basic: 0, intermediate: 1, advanced: 2 };
const TIER_LABEL: Record<TriggerTier, string> = {
  basic: "",
  intermediate: "",
  advanced: "avancé",
};

// Nombre de déclencheurs visibles avant "Voir plus" — le génitif à lui
// seul peut en avoir près de 40 pour une seule catégorie (prépositions),
// sans repli ça écraserait le reste de la page.
const PREVIEW_COUNT = 6;

// Panneau de référence des "déclencheurs" du cas (prépositions, verbes à
// régime, expressions figées) : répond à la question que l'exercice seul
// ne pose jamais explicitement — QUAND ce cas apparaît-il, et pourquoi.
export default function TriggerReference({ targetCase, color }: { targetCase: CaseId; color: string }) {
  const triggers = triggersForCase(targetCase);
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    items: triggers.filter((t) => t.kind === kind).sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div>
      <SectionLabel color="accent2">Déclencheurs</SectionLabel>
      <p className="mb-4 max-w-2xl font-display text-sm leading-relaxed text-muted">
        Les mots et situations qui imposent ce cas — reconnais-les dans une phrase pour savoir quelle
        terminaison utiliser.
      </p>
      {/* items-start : chaque carte garde sa propre hauteur au lieu de
          s'étirer pour matcher la plus grande de sa ligne — sinon déplier
          une carte fait aussi grandir ses voisines de la même ligne. */}
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <TriggerGroup key={g.kind} kind={g.kind} items={g.items} color={color} />
        ))}
      </div>
    </div>
  );
}

function TriggerGroup({ kind, items, color }: { kind: TriggerKind; items: CaseTrigger[]; color: string }) {
  const [expanded, setExpanded] = useState(false);
  const canToggle = items.length > PREVIEW_COUNT;
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hiddenCount = items.length - visible.length;

  return (
    <div className="rounded-2xl border border-border bg-bg2 p-5">
      <p className="mb-3 flex items-baseline gap-1.5 font-display text-xs font-semibold uppercase tracking-wide text-muted">
        {KIND_LABEL[kind]}
        <span className="font-normal normal-case text-muted/60">({items.length})</span>
      </p>
      <ul className="space-y-3">
        {visible.map((t) => (
          <li key={t.id}>
            <span className="font-display text-sm font-bold" style={{ color }}>
              {t.ru}
            </span>
            {TIER_LABEL[t.tier] && (
              <span className="ml-1.5 rounded-full bg-bg3 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted">
                {TIER_LABEL[t.tier]}
              </span>
            )}
            <p className="mt-0.5 font-display text-xs leading-snug text-muted">{t.meaningFr}</p>
          </li>
        ))}
      </ul>
      {canToggle && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 font-display text-xs font-semibold text-accent hover:underline"
        >
          {expanded ? "Voir moins" : `Voir plus (+${hiddenCount})`}
        </button>
      )}
    </div>
  );
}
