import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { SkillProgress } from "@/components/exercises/ModuleHub";

/**
 * La progression d'un module, lue côté serveur pour son accueil.
 *
 * Renvoie un objet vide dès qu'il n'y a pas de session : un visiteur non
 * connecté doit pouvoir parcourir les modules et s'entraîner, il ne verra
 * simplement aucune précision. C'est la même règle que les cinq premiers
 * modules — l'exercice n'exige pas de compte, seul l'enregistrement en
 * demande un.
 */
export async function loadModuleProgress(
  moduleId: string
): Promise<Record<string, SkillProgress>> {
  if (!isSupabaseConfigured()) return {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("exercise_progress")
    .select("skill_id, attempts, correct")
    .eq("user_id", user.id)
    .eq("module_id", moduleId);

  const progress: Record<string, SkillProgress> = {};
  for (const row of data ?? []) {
    progress[row.skill_id] = { attempts: row.attempts, correct: row.correct };
  }
  return progress;
}

/**
 * La progression de TOUS les modules, pour la page /exercices.
 *
 * Six lectures en parallèle : les cinq tables historiques, plus la table
 * partagée. Les lancer ensemble plutôt qu'en cascade évite d'additionner
 * six latences réseau au chargement d'une page qui n'affiche que des
 * pourcentages.
 */
export async function loadAllProgress(): Promise<
  Record<string, Record<string, SkillProgress>>
> {
  if (!isSupabaseConfigured()) return {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const [cases, adjectives, aspect, motion, participles, shared] = await Promise.all([
    supabase.from("case_progress").select("case_id, attempts, correct").eq("user_id", user.id),
    supabase.from("adjective_progress").select("skill_id, attempts, correct").eq("user_id", user.id),
    supabase.from("aspect_progress").select("skill_id, attempts, correct").eq("user_id", user.id),
    supabase.from("motion_progress").select("skill_id, attempts, correct").eq("user_id", user.id),
    supabase
      .from("participle_progress")
      .select("skill_id, attempts, correct")
      .eq("user_id", user.id),
    supabase
      .from("exercise_progress")
      .select("module_id, skill_id, attempts, correct")
      .eq("user_id", user.id),
  ]);

  const all: Record<string, Record<string, SkillProgress>> = {};
  function put(moduleId: string, skillId: string, attempts: number, correct: number) {
    (all[moduleId] ??= {})[skillId] = { attempts, correct };
  }

  // case_progress est la seule table à compter par cas × genre : deux lignes
  // peuvent porter le même cas, il faut donc les additionner.
  for (const row of cases.data ?? []) {
    const current = all.cases?.[row.case_id];
    put(
      "cases",
      row.case_id,
      (current?.attempts ?? 0) + (row.attempts ?? 0),
      (current?.correct ?? 0) + (row.correct ?? 0)
    );
  }
  for (const [moduleId, result] of [
    ["adjectives", adjectives],
    ["aspect", aspect],
    ["motion", motion],
    ["participles", participles],
  ] as const) {
    for (const row of result.data ?? []) put(moduleId, row.skill_id, row.attempts, row.correct);
  }
  for (const row of shared.data ?? []) put(row.module_id, row.skill_id, row.attempts, row.correct);

  return all;
}
