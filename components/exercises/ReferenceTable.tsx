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

/**
 * Le tableau montre les DEUX nombres, sur les six cas.
 *
 * Il n'en montrait qu'un : le pluriel au nominatif (où le singulier est la
 * forme du dictionnaire et ne dirait rien), le singulier partout ailleurs.
 * Ce choix suivait l'exercice, qui ne savait pas non plus demander de
 * pluriel en dehors du nominatif et du génitif — et il laissait le lecteur
 * sans le seul endroit où « стол → стола́ми » et « челове́к → людьми́ »
 * s'expliquent d'un coup d'œil, en regard de leur singulier.
 *
 * Le modèle « pluriel supplétif » (челове́к → лю́ди) n'avait d'ailleurs de
 * sens que sur la page du nominatif : ailleurs, sa colonne unique montrait
 * un singulier parfaitement régulier sous une étiquette parlant du pluriel.
 */
export default function ReferenceTable({ targetCase }: { targetCase: CaseId }) {
  const nominative = targetCase === "nominative";

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
              {/* Au nominatif la colonne « Nominatif » répéterait la colonne
                  « Singulier » : on la laisse tomber plutôt que d'afficher
                  deux fois le même mot. */}
              {!nominative && (
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                  Nominatif
                </th>
              )}
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                Singulier
              </th>
              <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-muted">
                Pluriel
              </th>
            </tr>
          </thead>
          <tbody className="bg-bg2">
            {MODELS.map((m) => {
              const noun = getNoun(m.id);
              if (!noun) return null;
              const singular = declineNoun(noun, targetCase, false);
              const plural = declineNoun(noun, targetCase, true);
              return (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted">{m.label}</td>
                  {!nominative && (
                    <td className="px-4 py-3 font-bold">{noun.forms.singular[0]}</td>
                  )}
                  <td className="px-4 py-3 font-bold text-accent-ink">{singular.accented}</td>
                  <td className="px-4 py-3 font-bold text-accent-ink">{plural.accented}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
