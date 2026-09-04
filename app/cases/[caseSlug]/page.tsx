import { notFound } from "next/navigation";
import Link from "next/link";
// La page lit la session (niveau CEFR) : elle est rendue à la demande.
// Un generateStaticParams n'y changeait rien — le build la marquait déjà
// dynamique — il donnait juste l'illusion d'un prérendu.
import type { Metadata } from "next";
import { CASES, getCase } from "@/lib/grammar/cases";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumb, graph, grammarResource } from "@/lib/seo/structured-data";
import CaseDeclension from "@/components/exercises/CaseDeclension";
import ReferenceTable from "@/components/exercises/ReferenceTable";
import TriggerReference from "@/components/exercises/TriggerReference";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CefrLevel } from "@/lib/supabase/types";

// `undefined` (déconnecté, ou Supabase non configuré) = pas de biais côté
// sélection de déclencheurs, comportement inchangé.
async function getViewer(): Promise<{ signedIn: boolean; level?: CefrLevel }> {
  if (!isSupabaseConfigured()) return { signedIn: false };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { signedIn: false };
  const { data: profile } = await supabase.from("profiles").select("level").eq("id", user.id).single();
  return { signedIn: true, level: profile?.level };
}

/** Les six pages sont connues à la compilation. */
/**
 * UN IDENTIFIANT HORS LISTE EST UN 404, DÉCIDÉ AVANT LE RENDU.
 *
 * `notFound()` était bien appelé, et il ne suffisait pas : la coquille de
 * mise en page commence à être envoyée avant que le corps de la page ne
 * s'exécute, si bien que les en-têtes — dont le statut — sont déjà partis
 * quand l'appel a lieu. Le visiteur recevait donc « 200 OK » avec une page
 * VIDE : ni le contenu, ni la belle 404 qui enseigne le génitif de la
 * négation. Un robot d'indexation, lui, y voyait une page valide de plus.
 *
 * Vérifié en production : /cases/nexistepas, /cours/nexistepas et
 * /guides/nexistepas répondaient 200 ; seule une route qu'aucun fichier ne
 * couvre répondait 404, parce que Next tranche alors AVANT de rendre.
 *
 * `dynamicParams = false` déplace la décision au même endroit : hors de la
 * liste que `generateStaticParams` déclare, le routeur répond 404 sans rien
 * rendre. Les trois listes sont closes et connues à la construction — six
 * cas, les leçons du catalogue, les guides — donc rien de légitime n'est
 * refusé. Contrôlé par check:seo.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CASES.map((c) => ({ caseSlug: c.id }));
}

/**
 * Le titre porte le nom français ET « russe ».
 *
 * « Génitif » seul est ambigu — le latin, l'allemand et le grec en ont un.
 * « Le génitif russe » est la requête réelle, et c'est aussi ce qui distingue
 * la page des dizaines de fiches de grammaire latine qui occupent le terme.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ caseSlug: string }>;
}): Promise<Metadata> {
  const { caseSlug } = await params;
  const caseInfo = getCase(caseSlug);
  if (!caseInfo) return { title: "Cas introuvable", robots: { index: false, follow: true } };

  // Calibré sur « prépositionnel », le plus long des six : au-delà de 70
  // signes, Google réécrit le titre lui-même et on perd la main dessus.
  const title = `Le ${caseInfo.nameFr.toLowerCase()} russe : emplois et terminaisons`;
  // Composée pour tenir sous 160 caractères quel que soit le cas : `usage`
  // fait 40 à 60 signes selon les six, et le reste est calibré sur le plus
  // long d'entre eux.
  const description =
    `${caseInfo.usage} Ses déclencheurs, ses terminaisons aux trois genres, ` +
    `et des exercices corrigés. Question : ${caseInfo.question}`;

  return {
    title,
    description,
    alternates: { canonical: `/cases/${caseInfo.id}` },
    openGraph: { type: "article", url: `/cases/${caseInfo.id}`, title, description },
  };
}

export default async function CasePracticePage({
  params,
}: {
  params: Promise<{ caseSlug: string }>;
}) {
  const { caseSlug } = await params;
  const caseInfo = getCase(caseSlug);
  if (!caseInfo) notFound();

  // Niveau CEFR de l'utilisateur : biaise le tirage des déclencheurs
  // (lib/grammar/exercise-selector.ts) vers l'essentiel pour un débutant,
  // sans jamais exclure totalement le reste.
  const { signedIn, level: userLevel } = await getViewer();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-16">
      <JsonLd
        data={graph(
          grammarResource({
            path: `/cases/${caseInfo.id}`,
            name: `Le ${caseInfo.nameFr.toLowerCase()} russe (${caseInfo.nameRu})`,
            description: caseInfo.usage,
            teaches: `Déclinaison russe — ${caseInfo.nameFr}`,
          }),
          breadcrumb([
            { name: "Privetik", path: "/" },
            { name: "Les cas russes", path: "/cases" },
            { name: caseInfo.nameFr, path: `/cases/${caseInfo.id}` },
          ])
        )}
      />
      <Link
        href="/cases"
        className="mb-6 inline-block font-display text-xs font-semibold uppercase tracking-wide text-muted hover:text-accent-ink"
      >
        ← Tous les cas
      </Link>

      {/* LE NOM FRANÇAIS EST PASSÉ DANS LE H1. Il vivait dans un <span>
          voisin : la page du génitif avait donc pour titre principal
          « Родительный », c'est-à-dire le seul mot que personne ne tape.
          L'arrangement visuel ne change pas — le russe reste en gros, le
          français à côté — mais les deux sont désormais dans le même
          élément, et « russe » y est écrit. */}
      <h1 className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        <span>{caseInfo.nameRu}</span>
        <span className="font-display text-xl font-normal text-muted">
          {caseInfo.nameFr} russe
        </span>
      </h1>
      <p className="mb-7 sm:mb-10 max-w-2xl font-display leading-relaxed text-muted">{caseInfo.usage}</p>

      <CaseDeclension caseInfo={caseInfo} userLevel={userLevel} signedIn={signedIn} />

      <div className="mt-10 sm:mt-14">
        <TriggerReference targetCase={caseInfo.id} color={caseInfo.color} />
      </div>

      <div className="mt-10 sm:mt-14">
        <ReferenceTable targetCase={caseInfo.id} />
      </div>
    </div>
  );
}
