import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import ReadingPassage from "@/components/exercises/ReadingPassage";
import { PreviewCta } from "@/components/vocabulary/VocabularyPreview";
import { READING_TEXTS } from "@/lib/reading/texts";
import { CASES } from "@/lib/grammar/cases";
import { BulbIcon, ListIcon, StarIcon, TextIcon } from "@/components/ui/icons";

/**
 * /reading pour quelqu'un qui n'a pas de compte.
 *
 * MÊME RAISON QUE VocabularyPreview : la barre annonce « Lecture » à tout
 * le monde, et la redirection vers /login n'apprenait rien de ce qu'il y a
 * derrière. Mais ici la démonstration est plus facile — et plus
 * convaincante — parce que la bibliothèque est du contenu STATIQUE, déjà
 * glosé mot à mot dans lib/reading/texts.ts.
 *
 * C'EST LE VRAI LECTEUR QU'ON MONTRE, pas une capture : `ReadingPassage`
 * est le composant que voient les abonnés, avec ses mots cliquables, ses
 * couleurs de cas et sa légende. Seul le bouton « J'ai terminé ce texte »
 * est retiré (`readOnly`) — il enregistre une progression, ce qui demande
 * un compte, et le laisser afficherait une confirmation mensongère.
 *
 * POURQUOI OFFRIR LE PREMIER TEXTE EN ENTIER. Il fait quatre phrases de
 * niveau A1. Ce qui se vend ici n'est pas le texte, c'est le GESTE :
 * cliquer un mot et lire sa traduction sans quitter la page. Le montrer sur
 * une phrase tronquée aurait économisé trois lignes et perdu la
 * démonstration.
 */

const FEATURES = [
  {
    Icon: StarIcon,
    title: "Des textes écrits pour ton niveau",
    body: "Donne un thème — le métro, une recette, ton travail — et l'app en écrit un texte gradué, de A1 à C1. C'est la fonctionnalité de l'abonnement.",
  },
  {
    Icon: TextIcon,
    title: "Chaque mot cliquable",
    body: "La traduction s'affiche sous le mot, sans quitter la page. C'est ce que tu viens d'essayer ci-dessus.",
  },
  {
    Icon: BulbIcon,
    title: "Les six cas, en couleur",
    body: "Chaque nom décliné porte la couleur de son cas, et la couleur est vérifiée contre le dictionnaire de déclinaisons — un trait plein quand c'est confirmé, pointillé quand ça ne l'est pas.",
  },
  {
    Icon: ListIcon,
    title: "Tes textes restent",
    body: "Ceux que tu fais générer sont gardés dans « Mes textes » : on relit un texte deux fois, la deuxième sans cliquer nulle part.",
  },
];

export default function ReadingPreview() {
  const [demo, ...rest] = READING_TEXTS;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-14">
      <SectionLabel>Чтение</SectionLabel>
      <h1 className="mb-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Lire du russe sans dictionnaire
      </h1>
      <p className="mb-10 max-w-2xl font-display leading-relaxed text-muted">
        Des textes courts à ton niveau, où chaque mot donne sa traduction d&apos;un clic et où les
        noms déclinés portent la couleur de leur cas. Voici le premier, en entier&nbsp;: clique
        sur n&apos;importe quel mot.
      </p>

      <ReadingPassage text={demo} readOnly />

      <div className="mt-14">
        <SectionLabel color="accent">Ce que le compte ouvre</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl surface p-6">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent"
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
              <p className="mt-1.5 font-display text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <div className="mt-14">
          <SectionLabel>Le reste de la bibliothèque</SectionLabel>
          <p className="mb-5 max-w-2xl font-display text-sm leading-relaxed text-muted">
            {rest.length} autre{rest.length > 1 ? "s" : ""} texte{rest.length > 1 ? "s" : ""}{" "}
            glosé{rest.length > 1 ? "s" : ""} mot à mot, du même genre, avec un compte.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rest.map((t) => {
              // Le `next` mène au texte lui-même : après inscription,
              // l'apprenant retombe sur celui qu'il avait choisi, pas sur un
              // tableau de bord dont il n'a rien à faire.
              const casesHere = CASES.filter((c) =>
                t.sentences.some((s) => s.some((w) => w.case === c.id))
              );
              return (
                <Link
                  key={t.id}
                  href={`/login?next=${encodeURIComponent(`/reading/${t.id}`)}`}
                  className="rounded-2xl surface-interactive p-6 hover:-translate-y-0.5"
                >
                  <span className="inline-block rounded-full border border-border px-2.5 py-0.5 font-display text-xs font-semibold text-muted">
                    {t.level}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold">{t.title}</h3>
                  <p className="mt-1 font-display text-sm text-muted">
                    {t.sentences.length} phrases
                  </p>
                  {/* Les pastilles de cas disent, sans une phrase de plus,
                      que le texte est annoté comme celui du dessus. */}
                  {casesHere.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {casesHere.map((c) => (
                        <span
                          key={c.id}
                          title={c.nameFr}
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <PreviewCta
        title="Ouvre la bibliothèque"
        body="Le compte est gratuit et donne accès aux textes de la bibliothèque. Les textes générés à ton niveau font partie de l'abonnement — deux à l'essai, pour juger."
      />
    </div>
  );
}
