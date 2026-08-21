import { CaseId } from "@/lib/grammar/types";
import { declineNoun } from "@/lib/grammar/decline";
import { getNoun } from "@/lib/grammar/nouns-data";
import SectionLabel from "@/components/ui/SectionLabel";

const MODELS: { id: string; label: string }[] = [
  { id: "stol", label: "masc. dur" },
  { id: "uchitel", label: "masc. mou" },
  { id: "kniga", label: "fém. dur (-а)" },
  { id: "nedelya", label: "fém. mou (-я)" },
  { id: "dver", label: "fém. (-ь)" },
  { id: "okno", label: "neutre dur (-о)" },
  { id: "more", label: "neutre mou (-е)" },
];

export default function ReferenceTable({ targetCase }: { targetCase: CaseId }) {
  return (
    <div>
      <SectionLabel color="accent">Tableau de référence</SectionLabel>
      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-border">
        <table className="w-full border-collapse font-display text-sm">
          <thead>
            <tr className="border-b border-border bg-bg3">
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                Type
              </th>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                Nominatif
              </th>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                Forme déclinée
              </th>
            </tr>
          </thead>
          <tbody className="bg-bg2">
            {MODELS.map((m) => {
              const noun = getNoun(m.id);
              if (!noun) return null;
              const result = declineNoun(noun, targetCase);
              return (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted">{m.label}</td>
                  <td className="px-4 py-3 font-bold">{noun.lemma}</td>
                  <td className="px-4 py-3 font-bold text-accent">
                    {targetCase === "nominative" ? noun.lemma : result.form}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
