import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODEL_FAST, textFromMessage, parseJsonResponse } from "@/lib/ai/client";
import { consumeQuota, quotaDeniedResponse, recordTokens, refundQuota } from "@/lib/ai/quota";
import { wordExplanationPrompt } from "@/lib/ai/prompts";
import { toWordExplanation } from "@/lib/vocabulary/explanation";

/**
 * Explication d'un mot d'une liste personnelle.
 *
 * MISE EN CACHE en base : une explication ne dépend que du mot, pas du
 * moment. La calculer une fois et la relire ensuite évite de repayer des
 * tokens à chaque ouverture de la fiche, et rend l'affichage instantané au
 * deuxième passage. `?refresh=1` force une nouvelle génération.
 */
/**
 * Sans ce plafond, Vercel coupe à dix secondes — une 504 sans corps, sans
 * trace, et qui ne se reproduit jamais en local. Voir la note détaillée dans
 * app/api/ai/reading/route.ts.
 */
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const wordId = typeof body.wordId === "string" ? body.wordId : "";
  const refresh = body.refresh === true;
  if (!wordId) return NextResponse.json({ error: "wordId requis" }, { status: 400 });

  // Filtré sur user_id : on n'explique que les mots de l'utilisateur.
  const { data: word } = await supabase
    .from("vocab_words")
    .select("ru, fr, explanation")
    .eq("id", wordId)
    .eq("user_id", user.id)
    .single();

  if (!word) return NextResponse.json({ error: "Mot introuvable" }, { status: 404 });

  if (!refresh && word.explanation) {
    // Revalidé au passage : une explication mise en cache avant un
    // changement de forme reste conforme, ou est régénérée.
    const cached = toWordExplanation(word.explanation, word.ru);
    if (cached) return NextResponse.json({ explanation: cached, cached: true });
  }

  // Quota, APRÈS le cache : une fiche déjà rédigée est relue gratuitement,
  // autant de fois qu'on veut et quel que soit le plan. Les vingt
  // explications du plan gratuit sont donc vingt MOTS expliqués, acquis
  // pour de bon — pas vingt consultations.
  //
  // Le rafraîchissement a son propre compteur, beaucoup plus serré. Sans
  // lui, `refresh: true` régénérerait indéfiniment la même fiche en
  // contournant le cache : c'est le chemin par lequel un abonné pourrait
  // à lui seul consommer tout le plafond quotidien d'explications.
  const quota = await consumeQuota(supabase, refresh ? "explain_refresh" : "explain");
  if (!quota.allowed) return quotaDeniedResponse(quota);

  const { data: profile } = await supabase
    .from("profiles")
    .select("level")
    .eq("id", user.id)
    .single();

  try {
    const msg = await getAnthropic().messages.create({
      model: MODEL_FAST,
      max_tokens: 1200,
      system: wordExplanationPrompt({
        ru: word.ru,
        fr: word.fr,
        level: profile?.level ?? "A1",
      }),
      messages: [{ role: "user", content: "Explique ce mot." }],
    });
    await recordTokens(supabase, refresh ? "explain_refresh" : "explain", msg.usage);
    const explanation = toWordExplanation(parseJsonResponse(textFromMessage(msg)), word.ru);
    if (!explanation) {
      console.error("vocab explain: forme inattendue pour", word.ru);
      // Rien n'a été rendu : la fiche ne doit pas être décomptée.
      await refundQuota(supabase, refresh ? "explain_refresh" : "explain");
      return NextResponse.json(
        { error: "Explication indisponible pour le moment." },
        { status: 502 }
      );
    }

    // Un échec d'écriture ne prive pas l'utilisateur de l'explication qu'il
    // vient d'obtenir : elle sera simplement régénérée la prochaine fois.
    const { error: saveError } = await supabase
      .from("vocab_words")
      .update({ explanation })
      .eq("id", wordId)
      .eq("user_id", user.id);
    if (saveError) console.error("vocab explain: échec de la mise en cache", saveError);

    return NextResponse.json({ explanation, cached: false });
  } catch (err) {
    console.error("vocab explain route error", err);
    await refundQuota(supabase, refresh ? "explain_refresh" : "explain");
    return NextResponse.json({ error: "Explication indisponible pour le moment." }, { status: 502 });
  }
}
