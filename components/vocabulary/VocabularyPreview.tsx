import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import VocabDemoCard from "@/components/vocabulary/VocabDemoCard";
import { ModeIcon, REVIEW_MODES } from "@/components/vocabulary/ReviewModeGrid";
import { BulbIcon, ListIcon, SpeakerIcon, StarIcon } from "@/components/ui/icons";

/**
 * /vocabulary pour quelqu'un qui n'a pas de compte.
 *
 * POURQUOI CETTE PAGE EXISTE. La barre de navigation annonce « Vocabulaire »
 * à tout le monde, et la section est un espace personnel : sans compte, il
 * n'y a littéralement rien à afficher. La redirection sèche vers /login
 * apprenait qu'il faut un compte, jamais ce qu'il y a dedans — et c'est
 * précisément ce qu'on demande à quelqu'un de payer.
 *
 * ELLE MONTRE, ELLE NE DÉCRIT PAS. Le premier bloc est une carte de
 * révision qui fonctionne, avec les vrais mots de la banque et le vrai
 * calendrier SM-2 (voir VocabDemoCard). Une liste d'arguments à la place
 * aurait été plus courte à écrire et n'aurait convaincu personne : la
 * répétition espacée est une idée qu'on comprend en la voyant tourner, pas
 * en lisant qu'elle existe.
 *
 * LES QUATRE MODES VIENNENT DE REVIEW_MODES, la même constante que la
 * grille des abonnés. Les recopier ici aurait créé une page de vente qui
 * promet des modes que le produit n'a plus.
 */

const FEATURES = [
  {
    Icon: StarIcon,
    title: "Révisé au bon moment",
    body: "Chaque mot revient quand tu es sur le point de l'oublier, pas avant — et un « À revoir » ramène tout à demain. C'est l'algorithme SM-2, celui qui tourne dans la démonstration ci-dessus.",
  },
  {
    Icon: ListIcon,
    title: "Tes listes, tes mots",
    body: "Crée une liste par thème, ajoute un mot en le tapant — l'app propose la traduction, le genre et l'animacité, et te laisse corriger.",
  },
  {
    Icon: BulbIcon,
    title: "Une fiche par mot",
    body: "Sens, registre, mots de la même famille et exemples traduits, rédigés à la demande pour le mot que tu bloques.",
  },
  {
    Icon: SpeakerIcon,
    title: "La prononciation, par un natif",
    body: "Chaque mot se dit à voix haute, avec une voix russe — pas la synthèse du navigateur, qui lit le cyrillique comme du français.",
  },
];

export default function VocabularyPreview() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-14">
      <SectionLabel>Словарь</SectionLabel>
      <h1 className="mb-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Ton vocabulaire, révisé au bon moment
      </h1>
      <p className="mb-10 max-w-2xl font-display leading-relaxed text-muted">
        Tes propres listes, quatre façons de les réviser, et une répétition espacée qui décide
        seule de ce qu&apos;il faut te remontrer aujourd&apos;hui. Essaie&nbsp;: retourne la carte
        et note-toi, plusieurs fois de suite — c&apos;est en répétant que l&apos;échéance
        s&apos;écarte, de demain à trois mois.
      </p>

      <VocabDemoCard />

      <div className="mt-14">
        <SectionLabel color="accent">Quatre façons de réviser le même mot</SectionLabel>
        <p className="mb-5 max-w-2xl font-display text-sm leading-relaxed text-muted">
          Reconnaître un mot et savoir l&apos;écrire sont deux compétences différentes. Les quatre
          modes travaillent la même liste par des entrées différentes.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REVIEW_MODES.map((m) => (
            <div key={m.mode} className="flex gap-4 rounded-2xl surface p-5">
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg3 text-muted"
              >
                <ModeIcon name={m.icon} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold">{m.label}</h3>
                <p className="mt-0.5 font-display text-sm leading-snug text-muted">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <SectionLabel>Ce que le compte ouvre</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl surface p-6">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-ink"
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
              <p className="mt-1.5 font-display text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <PreviewCta
        title="Ouvre ton vocabulaire"
        body="Le compte est gratuit, et le vocabulaire y est compris — vingt révisions par jour pour juger sur pièces."
      />
    </div>
  );
}

/**
 * L'appel à l'action des deux pages d'aperçu.
 *
 * IL EST HONNÊTE SUR LE PLAN GRATUIT, et c'est délibéré : promettre un
 * accès complet à quelqu'un qui butera sur un plafond au bout d'une
 * demi-heure ne fait que déplacer la déception. La page de prix dit les
 * mêmes chiffres.
 */
export function PreviewCta({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-14 rounded-[20px] surface relative overflow-hidden p-8 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-accent/12 blur-3xl"
      />
      <div className="relative">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="mx-auto mt-2 max-w-lg font-display text-sm leading-relaxed text-muted">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="btn btn-primary btn-sheen rounded-xl px-6 py-3 font-display text-sm font-bold"
          >
            Créer un compte gratuit
          </Link>
          <Link
            href="/premium"
            className="btn btn-outline rounded-xl px-6 py-3 font-display text-sm font-semibold text-text"
          >
            Voir les tarifs
          </Link>
        </div>
        <p className="mt-4 font-display text-xs text-muted">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-semibold text-text hover:text-accent-ink">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
