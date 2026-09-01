/**
 * Le mot russe écrit comme un francophone doit le LIRE.
 *
 * POURQUOI UNE RÈGLE, ET PAS LE MODÈLE. La translittération n'arrivait
 * jusqu'ici que par /api/vocab/suggest, et seulement sur le chemin IA : les
 * mots déjà connus — les 451 noms de la banque, les 1 750 entrées de
 * l'index d'autocomplétion — sortaient avec `transliteration: null`. Autrement
 * dit, les mots les mieux servis de l'app (traduction relue, accent tonique
 * vérifié) étaient les seuls à n'avoir aucune prononciation écrite, et
 * l'apprenant qui tapait « спасибо » n'obtenait rien là où « абракадабра »
 * lui aurait valu un appel au modèle.
 *
 * Or c'est exactement le genre de chose qu'une règle fait mieux qu'un
 * modèle : le système graphique russe est régulier, la lecture d'une lettre
 * dépend de son voisinage et de l'accent — deux informations que nous
 * AVONS, puisque les banques portent l'accent tonique. Le résultat est
 * gratuit, instantané, identique d'un appel à l'autre, et vérifiable par un
 * script.
 *
 * ORIENTÉE FRANÇAIS, pas anglais ni ISO. ч = « tch » et non « ch », х =
 * « kh », у = « ou », ш = « ch » : c'est ce que dit le cours (unité 1,
 * « Taper le russe et le translittérer »), et une romanisation anglaise
 * ferait lire « Chekhov » à quelqu'un qui doit entendre « Tchekhov ».
 *
 * DEUX RÈGLES PHONÉTIQUES, pas plus, et toutes deux conditionnées à l'accent :
 *   - l'akanye : un о NON accentué se lit « a » (хорошо́ -> kharacho) ;
 *   - le s intervocalique se double, sans quoi un francophone le lit « z »
 *     (спаси́бо -> spassiba, jamais « spaziba »).
 * Sans accent tonique connu — un mot tapé à la main — on ne réduit RIEN :
 * mieux vaut une lecture littérale qu'une lecture fausse. Le reste de la
 * réduction vocalique russe (е/я atones, assourdissement final) est
 * volontairement laissé de côté : ça se joue au son, et une aide de lecture
 * n'est pas une transcription phonétique.
 */

const ACUTE = "́";
const VOWELS = "аеёиоуыэюя";
/** Après ces consonnes, е et ё ne sont pas mouillés : жена, чёрный. */
const HUSHING = "жшчщц";

const CONSONANTS: Record<string, string> = {
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  ж: "j",
  з: "z",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "tch",
  ш: "ch",
  щ: "chtch",
};

/**
 * Les mots dont l'orthographe russe ment ouvertement.
 *
 * Une poignée de mots très fréquents ne se lit pas comme elle s'écrit : что
 * se dit « chto », сего́дня « sivodnia », его́ « yevo » — le -го de ces
 * formes-là se prononce -vo. Ce sont des exceptions closes et archi-connues,
 * pas une tendance : en faire une règle générale casserait « мно́го » ou
 * « стро́го ». Une liste, donc, et rien d'autre.
 */
const EXCEPTIONS: Record<string, string> = {
  что: "chto",
  чтобы: "chtoby",
  конечно: "kanechna",
  скучно: "skouchna",
  сегодня: "sivodnia",
  его: "yevo",
  ничего: "nitchevo",
};

function isVowel(letter: string | undefined): boolean {
  return letter !== undefined && VOWELS.includes(letter);
}

/**
 * Un mot, sans son accent tonique, et le rang de la voyelle accentuée.
 *
 * `stressed` vaut -1 quand l'accent est inconnu : ni marque, ni voyelle
 * unique. C'est ce qui désactive l'akanye — voir l'en-tête.
 */
function analyze(word: string): { letters: string[]; stressed: number } {
  const letters: string[] = [];
  let stressed = -1;
  let vowelCount = 0;
  let lastVowel = -1;

  for (const char of word) {
    if (char === ACUTE) {
      // La marque suit la voyelle qu'elle accentue.
      if (lastVowel >= 0) stressed = lastVowel;
      continue;
    }
    const lower = char.toLowerCase();
    if (isVowel(lower)) {
      lastVowel = vowelCount;
      // ё porte toujours l'accent en russe : il n'a pas besoin d'être marqué.
      if (lower === "ё") stressed = vowelCount;
      vowelCount += 1;
    }
    letters.push(char);
  }

  // Un seul son vocalique : l'accent ne peut être ailleurs.
  if (stressed < 0 && vowelCount === 1) stressed = 0;
  return { letters, stressed };
}

/** Un mot cyrillique, lettre à lettre. */
function word(raw: string): string {
  const { letters, stressed } = analyze(raw);

  const bare = letters.join("").toLowerCase().replace(/ё/g, "е");
  const exception = EXCEPTIONS[bare];
  if (exception) {
    const head = raw.replace(ACUTE, "").charAt(0);
    return head && head !== head.toLowerCase()
      ? exception.charAt(0).toUpperCase() + exception.slice(1)
      : exception;
  }

  let out = "";
  let vowelIndex = -1;

  for (let i = 0; i < letters.length; i += 1) {
    const letter = letters[i].toLowerCase();
    const previous = i > 0 ? letters[i - 1].toLowerCase() : undefined;
    const next = i + 1 < letters.length ? letters[i + 1].toLowerCase() : undefined;

    if (!isVowel(letter)) {
      if (letter === "ь" || letter === "ъ") continue; // muets : ils mouillent la voyelle suivante
      if (letter === "й") {
        // « ï » après une voyelle (чай -> tchaï), « y » ailleurs (йогурт).
        out += isVowel(previous) ? "ï" : "y";
        continue;
      }
      if (letter === "с") {
        // Un s entre deux voyelles se lit « z » en français : on le double.
        out += isVowel(previous) && isVowel(next) ? "ss" : "s";
        continue;
      }
      if (letter === "г" && (next === "е" || next === "и")) {
        // « gu » pour garder le g dur : де́ньги -> déngui, а не « denji ».
        out += "gu";
        continue;
      }
      out += CONSONANTS[letter] ?? letters[i];
      continue;
    }

    vowelIndex += 1;
    const isStressed = vowelIndex === stressed;
    // Mouillée : en début de mot, après une voyelle, ou après ь/ъ.
    const iotated = previous === undefined || isVowel(previous) || previous === "ь" || previous === "ъ";
    const afterHushing = previous !== undefined && HUSHING.includes(previous);

    switch (letter) {
      case "а":
        out += "a";
        break;
      case "о":
        // Akanye — seulement quand on SAIT que la syllabe est atone.
        out += isStressed || stressed < 0 ? "o" : "a";
        break;
      case "у":
        out += "ou";
        break;
      case "ы":
        out += "y";
        break;
      case "и":
        out += "i";
        break;
      case "э":
        // « e » seul se lirait comme un e muet français : это -> « eta »
        // devient « euh-ta ». L'accent grave force la valeur ouverte.
        out += "è";
        break;
      case "е":
        if (afterHushing) out += "e";
        else if (iotated) out += isStressed ? "ié" : "ie";
        else out += isStressed ? "é" : "e";
        break;
      case "ё":
        out += afterHushing ? "o" : iotated ? "yo" : "io";
        break;
      case "ю":
        out += iotated ? "you" : "iou";
        break;
      case "я":
        out += iotated ? "ya" : "ia";
        break;
      default:
        out += letters[i];
    }
  }

  // La majuscule initiale suit le mot d'origine — un prénom reste un prénom.
  const first = raw.replace(ACUTE, "").charAt(0);
  if (first && first !== first.toLowerCase()) {
    return out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out;
}

/** Y a-t-il quelque chose à translittérer ? */
const HAS_CYRILLIC = /[Ѐ-ӿ]/;

/**
 * Translittération d'un mot ou d'une expression. Espaces, traits d'union et
 * ponctuation traversent tels quels ; l'accent tonique est cherché mot par
 * mot, puisque c'est là qu'il vit.
 *
 * Rend une chaîne vide si l'entrée ne contient pas de cyrillique — un champ
 * déjà latin n'a pas de prononciation à écrire.
 */
export function transliterate(input: string): string {
  if (!input || !HAS_CYRILLIC.test(input)) return "";
  return input
    .normalize("NFC")
    .split(/([^\p{L}́]+)/u)
    .map((chunk, i) => (i % 2 === 0 ? word(chunk) : chunk))
    .join("")
    .trim();
}
