import { CaseId } from "@/lib/grammar/types";
import { declineNoun } from "@/lib/grammar/decline";
import { getNoun } from "@/lib/grammar/nouns-data";
import SectionLabel from "@/components/ui/SectionLabel";

// Un modèle par type de déclinaison réellement distinct — y compris ceux que
// le genre seul ne permet pas de deviner : un masculin en -а se décline
// comme "книга" (папы, папе, папу), une voyelle mobile change le radical dès
// qu'on quitte le nominatif (отец -> отца), et un pluriel supplétif ne suit
// aucune règle (человек -> люди). Les formes portent l'accent tonique.
const MODELS: { id: string; label: string }[] = [
  { id: "stol", label: "masc. dur" },
  { id: "uchitel", label: "masc. mou" },
  { id: "otets", label: "masc. voyelle mobile" },
  { id: "papa", label: "masc. en -а" },
  { id: "kniga", label: "fém. dur (-а)" },
  { id: "nedelya", label: "fém. mou (-я)" },
  { id: "dver", label: "fém. (-ь)" },
  { id: "okno", label: "neutre dur (-о)" },
  { id: "more", label: "neutre mou (-е)" },
  { id: "chelovek", label: "pluriel supplétif" },
];

export default function ReferenceTable({ targetCase }: { targetCase: CaseId }) {
  // Au nominatif, le singulier EST la forme du dictionnaire : la colonne
  // répéterait le mot tel quel. On montre le pluriel à la place — la seule
  // vraie transformation de ce cas, et ce que l'exercice isolé demande.
  const showPlural = targetCase === "nominative";

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
                {showPlural ? "Nominatif pluriel" : "Forme déclinée"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-bg2">
            {MODELS.map((m) => {
              const noun = getNoun(m.id);
              if (!noun) return null;
              const result = declineNoun(noun, targetCase, showPlural);
              return (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted">{m.label}</td>
                  <td className="px-4 py-3 font-bold">{noun.forms.singular[0]}</td>
                  <td className="px-4 py-3 font-bold text-accent">{result.accented}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
