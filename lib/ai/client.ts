import Anthropic from "@anthropic-ai/sdk";

// Client Anthropic instancié UNIQUEMENT côté serveur (routes API).
// La clé ne doit jamais transiter vers le navigateur.
let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY manquante. Copie .env.local.example en .env.local et renseigne ta clé."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const MODEL_FAST = process.env.ANTHROPIC_MODEL_FAST || "claude-haiku-4-5";

// Extrait le texte concaténé d'une réponse Messages.
export function textFromMessage(msg: Anthropic.Message): string {
  return msg.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

/**
 * Extrait la première valeur JSON complète (objet ou tableau) d'un texte.
 *
 * POURQUOI PAS UNE EXPRESSION RÉGULIÈRE. Il faut compter les accolades pour
 * savoir où la valeur se termine, et ignorer celles qui se trouvent DANS
 * une chaîne — une traduction française comme "l'accolade { ouvrante"
 * casserait un `/\{.*\}/`. Un automate est le seul moyen correct, et il
 * tient en vingt lignes.
 *
 * Renvoie `null` si aucune valeur complète n'est trouvée (réponse tronquée
 * par max_tokens, par exemple).
 */
function extractFirstJsonValue(text: string): string | null {
  const start = text.search(/[{[]/);
  if (start === -1) return null;

  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Parse le JSON renvoyé par le modèle, en tolérant ce qu'il met autour.
 *
 * TROIS CHOSES ARRIVENT EN VRAI, malgré un prompt qui demande « UNIQUEMENT
 * un objet JSON » :
 *   - des ```fences``` autour ;
 *   - une phrase avant ou après (« Voici l'exercice : {...} J'espère que… ») ;
 *   - deux objets à la suite, quand le modèle se reprend.
 * La version précédente ne retirait que les balises collées aux extrémités
 * et échouait sur les deux autres cas — un `SyntaxError: Unexpected
 * non-whitespace character after JSON` observé en production sur
 * /api/vocab/suggest. Les routes l'attrapent, donc rien ne casse à
 * l'écran ; simplement la fonctionnalité échoue en silence APRÈS avoir
 * payé les tokens.
 *
 * On tente d'abord le texte entier — c'est le cas normal, et c'est le
 * chemin le plus strict. On ne se rabat sur l'extraction que si ça échoue.
 */
export function parseJsonResponse<T>(raw: string): T {
  const unfenced = raw
    .trim()
    // `\s*` des deux côtés : la version précédente ancrait sur ```$ sans
    // avoir coupé le retour à la ligne final, donc la balise fermante
    // survivait dès que la réponse se terminait par « ```\n ».
    .replace(/^```[a-z]*\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(unfenced) as T;
  } catch {
    const extracted = extractFirstJsonValue(unfenced);
    if (extracted === null) {
      // Le début de la réponse, pas la totalité : de quoi diagnostiquer
      // dans les logs sans y déverser mille tokens.
      throw new Error(
        `Réponse du modèle non parsable : ${JSON.stringify(unfenced.slice(0, 200))}`
      );
    }
    return JSON.parse(extracted) as T;
  }
}
