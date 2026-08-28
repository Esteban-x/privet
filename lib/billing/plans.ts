/**
 * Les plans, côté TypeScript.
 *
 * Les PLAFONDS ne sont volontairement PAS ici : ils vivent dans la table
 * `plan_limits` (voir la migration 20260826120000_plans_quotas.sql), pour
 * pouvoir être corrigés par un UPDATE quand l'usage réel les contredira,
 * sans redéploiement. Ce fichier ne contient que ce qui doit être connu à
 * la compilation : le nom des plans et celui des fonctionnalités payantes.
 */

export type PlanId = "free" | "premium";

/** D'où vient le premium — déterminant pour le webhook Stripe. */
export type PlanSource = "stripe" | "grant" | "trial";

/**
 * Les sept postes de dépense IA de l'app, un par appel Anthropic.
 * Ces chaînes sont des CLÉS DE BASE (colonne `plan_limits.feature` et
 * `ai_usage.feature`) : les renommer demande une migration.
 */
export type AiFeature =
  | "exercise_ai"      // app/api/ai/exercise    — phrase de mise en situation
  | "reading"          // app/api/ai/reading     — texte gradué (le plus cher)
  | "explain"          // app/api/vocab/explain  — fiche de mot
  | "explain_refresh"  // idem, mais en contournant le cache
  | "suggest"          // app/api/vocab/suggest  — l'autre moitié du mot
  | "classify"         // app/api/vocab/words    — genre/animacité
  | "verify"           // cases/attempt + vocab/answer — 2e avis sur un faux
  // Seul poste qui n'appelle pas Claude mais ElevenLabs, et le seul
  // facturé au CARACTÈRE (0,10 $/1000) et non au token. Il ne compte que
  // les mots jamais synthétisés : le cache de tts_audio est global, donc
  // réécouter — ou écouter un mot déjà demandé par quelqu'un d'autre — ne
  // consomme rien.
  | "tts";             // app/api/tts            — prononciation

/**
 * Les deux postes de PRATIQUE, qui n'appellent aucun modèle et ne coûtent
 * donc rien à servir. Ils sont comptés quand même : le plan gratuit n'est
 * pas « l'app moins quelques finitions IA », c'est un essai. Sans ces deux
 * plafonds, quelqu'un qui ne tient pas aux textes de lecture n'a aucune
 * raison de s'abonner — il a déjà une app complète.
 *
 * Comme les postes IA, ce sont des CLÉS DE BASE (`plan_limits.feature`,
 * `ai_usage.feature`) : les renommer demande une migration.
 */
export type PracticeFeature =
  | "practice"       // une réponse corrigée, tous modules d'exercices confondus
  | "vocab_review";  // une carte de vocabulaire notée, tous modes confondus

/**
 * Tout ce qui se décompte, quelle qu'en soit la raison. `consume_ai_quota`
 * ne fait aucune différence entre les deux familles : elle lit `plan_limits`,
 * verrouille, décompte. Son nom vient de son premier usage, pas de sa portée.
 */
export type UsageFeature = AiFeature | PracticeFeature;

/**
 * Ce qui reste ouvert sans compter au plan gratuit N'EST PAS listé ici :
 * les cours, l'alphabet, les tables de référence, le test de niveau et la
 * gestion des listes ne sont ni comptés ni bridés. Ce qu'on borne, c'est
 * l'appel au modèle et la pratique quotidienne.
 */

export interface PlanState {
  plan: PlanId;
  source: PlanSource | null;
  expiresAt: string | null;
  /** true si le premium est actif MAINTENANT (échéance prise en compte). */
  isPremium: boolean;
}

/**
 * Le plan effectif, échéance comprise.
 *
 * Un premium échu — essai terminé, accès bêta arrivé à terme, paiement non
 * renouvelé sans que le webhook soit passé — redevient gratuit ici, sans
 * qu'aucune tâche de fond n'ait à repasser derrière. La même règle est
 * appliquée côté SQL dans `consume_ai_quota` : c'est elle qui fait
 * autorité, celle-ci ne sert qu'à l'affichage.
 */
export function resolvePlan(profile: {
  plan?: string | null;
  plan_source?: string | null;
  plan_expires_at?: string | null;
} | null): PlanState {
  const expiresAt = profile?.plan_expires_at ?? null;
  const expired = expiresAt !== null && new Date(expiresAt).getTime() < Date.now();
  const plan: PlanId = profile?.plan === "premium" && !expired ? "premium" : "free";

  return {
    plan,
    source: (profile?.plan_source as PlanSource | null) ?? null,
    expiresAt,
    isPremium: plan === "premium",
  };
}
