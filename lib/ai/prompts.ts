import { CefrLevel } from "@/lib/supabase/types";
import { CaseId } from "@/lib/grammar/types";
import { CaseTrigger } from "@/lib/grammar/triggers";
import { CASES } from "@/lib/grammar/cases";

const LEVEL_GUIDANCE: Record<CefrLevel, string> = {
  A0: "grand débutant absolu : mots isolés et phrases de 2-3 mots, vocabulaire ultra courant",
  A1: "débutant : présent, phrases simples, vocabulaire quotidien de base",
  A2: "élémentaire : passé/futur simples, phrases coordonnées, vocabulaire du quotidien élargi",
  B1: "intermédiaire : aspects verbaux, subordonnées, vocabulaire thématique",
  B2: "intermédiaire avancé : nuances, expressions idiomatiques courantes, textes plus longs",
  C1: "avancé : registre soutenu, idiomatismes, structures complexes",
  C2: "maîtrise : langue nuancée et précise, registres variés y compris littéraire et scientifique, sous-entendus, syntaxe très libre",
};

// ─── Génération d'exercices contextuels pour un cas donné ───────
//
// L'IA ne choisit PAS le mot et ne calcule AUCUNE forme fléchie : elle
// écrit seulement la phrase qui met en situation un mot imposé.
// `candidatePool` est la banque curée (lib/grammar/nouns-data.ts), dont
// chaque déclinaison est vérifiée par `npm run check:grammar` — un nom
// russe pris au hasard hors de cette banque serait irrégulier d'une façon
// que le moteur de règles ne peut pas connaître (стул -> стулья, отец ->
// отца, человек -> люди), et l'exercice afficherait une forme fausse comme
// bonne réponse. Le serveur (app/api/ai/exercise/route.ts) revérifie que le
// lemme renvoyé appartient bien au pool, puis ne transmet au client que
// l'ID de l'entrée : traduction, genre et animacité viennent de la banque,
// jamais de ce que l'IA en dit.
//
// Le NOMBRE et le GOUVERNEUR du trou sont eux aussi imposés, et pour la même
// raison : la forme attendue est calculée depuis `caseId` + `plural`, sans
// jamais relire la phrase. Une phrase qui contredit cette hypothèse — un
// « несколько » devant le trou d'un exercice au nominatif — transforme une
// bonne réponse de l'apprenant en faute comptée. Ces consignes limitent le
// problème ; c'est lib/grammar/sentence-guard.ts qui le ferme, en refusant
// la phrase quand le modèle passe outre.
export interface ExercisePromptOptions {
  caseId: CaseId;
  level: CefrLevel;
  candidatePool: { ru: string; fr: string }[];
  /** Le trou attend-il un pluriel ? Vient du déclencheur, pas du modèle. */
  plural: boolean;
  trigger?: CaseTrigger;
  recentLemmas?: string[];
  /** Motif du refus de la tentative précédente, pour la seconde demande. */
  rejectedReason?: string;
}

export function exerciseSystemPrompt({
  caseId,
  level,
  candidatePool,
  plural,
  trigger,
  recentLemmas,
  rejectedReason,
}: ExercisePromptOptions) {
  const triggerInstruction = trigger
    ? `Le déclencheur à illustrer est précisément : "${trigger.ru}" (${trigger.meaningFr}). La phrase doit utiliser ce déclencheur exact (cette préposition, ce verbe ou cette expression), pas un autre.
Phrase de référence de ce déclencheur : "${trigger.template.ru}". Garde EXACTEMENT les mots qui gouvernent le trou dans cette référence, et enrichis le reste (contexte, verbe, compléments) pour obtenir une phrase vivante.`
    : `Choisis toi-même un déclencheur naturel du cas "${caseId}" (préposition, verbe à régime ou expression figée) — indique-le dans le champ "trigger_id" si tu peux l'identifier, sinon laisse-le vide.`;
  const avoidRepeatInstruction =
    recentLemmas && recentLemmas.length
      ? `Parmi les mots autorisés, évite ceux déjà vus dans les exercices récents de l'apprenant si d'autres choix restent possibles : ${recentLemmas.join(", ")}.`
      : "";
  const numberInstruction = plural
    ? `- Le trou attend un PLURIEL. Accorde le verbe et les épithètes au pluriel.`
    : `- Le trou attend un SINGULIER. Accorde le verbe et les épithètes au singulier.`;
  const retryInstruction = rejectedReason
    ? `
ATTENTION — ta proposition précédente a été REFUSÉE : ${rejectedReason}.
Écris une phrase différente qui corrige exactement ce point.`
    : "";

  return `Tu es un concepteur d'exercices de russe langue étrangère, pour un apprenant francophone.
Niveau CEFR de l'apprenant : ${level} (${LEVEL_GUIDANCE[level]}).

Liste FERMÉE de mots autorisés (russe = français) : ${candidatePool
    .map((w) => `${w.ru} = ${w.fr}`)
    .join(", ")}.
Le "lemma" DOIT être recopié EXACTEMENT (même orthographe, même casse) depuis cette liste — aucun autre mot n'est accepté, même s'il te semble plus adapté ou plus naturel.

Tâche : produire UN exercice à trou testant le cas grammatical "${caseId}" (cas russe).
${triggerInstruction}
Contraintes STRICTES :
- VARIÉTÉ LEXICALE : pioche largement dans la liste et ne choisis JAMAIS deux fois de suite un mot de la même famille de sens.
${avoidRepeatInstruction}
- La phrase russe contient exactement un trou noté "___" à l'emplacement du mot à décliner.
${numberInstruction}
- RIEN d'autre que le déclencheur demandé ne doit gouverner le trou. Le mot placé juste avant le trou (épithètes mises à part) ne peut être NI une préposition, NI un mot de quantité (много, мало, немного, несколько, сколько, столько, большинство, кусок, стакан…), NI un numéral (два, три, пять, 5, 21…) — sauf si c'est justement le déclencheur demandé. Ces mots imposent leur propre cas et rendraient la phrase fausse pour le cas testé : "Несколько ___" appelle le génitif, quel que soit le cas de l'exercice.
- Le mot à décliner est donné à sa forme du dictionnaire (nominatif singulier) dans le champ "lemma", recopié depuis la liste fermée.
- Tu ne fournis PAS la forme fléchie attendue : elle est calculée par un moteur de règles, pas par toi. N'essaie pas de la deviner ni de l'écrire dans la phrase.
- La traduction française ("sentence_fr") est COMPLÈTE et naturelle, SANS trou ni "___" : le mot à deviner y apparaît normalement traduit. C'est ce qui permet à l'apprenant de savoir QUEL mot français il doit chercher en russe — un trou aussi côté français le laisserait deviner à l'aveugle (ex. pour "sans ___", impossible de savoir s'il faut dire "sucre" ou "lait").
- Dans cette traduction, le mot du trou doit apparaître avec EXACTEMENT la traduction que la liste fermée lui donne (au pluriel si le trou est au pluriel) — jamais un synonyme, un terme plus général ou un autre sens. Écrire "l'homme" pour "герой = héros" rend l'exercice insoluble : l'apprenant répond мужчина, et c'est compté faux. Construis donc la phrase russe et sa traduction autour du sens que la liste donne au mot, pas d'un autre.
- La phrase doit rendre le cas "${caseId}" naturel et non ambigu.
${retryInstruction}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de la forme :
{"sentence_ru":"phrase avec ___","sentence_fr":"traduction française complète, sans trou","lemma":"nominatif singulier, recopié depuis la liste fermée","trigger_id":"identifiant du déclencheur si connu, sinon chaîne vide"}`;
}

// ─── Filet de sécurité : vérification IA d'une réponse jugée fausse ──
// Le moteur de règles (lib/grammar/decline.ts) reste la référence rapide et
// gratuite pour CHAQUE réponse (comparaison de chaînes) ; cet appel IA n'a
// lieu QUE quand cette comparaison a déjà dit "faux" — un coût en tokens
// accepté explicitement par l'utilisateur pour ne jamais refuser à tort une
// réponse en fait correcte (variante orthographique/accentuée, ou bug du
// moteur de règles lui-même). Ne rend JAMAIS l'IA seule juge de la
// grammaire : elle ne fait que rattraper les faux négatifs du moteur, elle
// ne remplace jamais son calcul.
//
// La PHRASE de l'exercice lui est transmise quand il y en a une, pour deux
// raisons distinctes. D'abord l'explication affichée : sans la phrase, le
// modèle commentait une forme hors contexte et sortait des énoncés faux
// (« друзей est au génitif pluriel (cas du complément d'objet direct) »).
// Ensuite un dernier recours en faveur de l'apprenant : si la phrase
// imposait en réalité un autre cas que celui demandé, c'est l'exercice qui
// est fautif, et sa réponse ne doit pas lui être comptée fausse. Ce cas ne
// devrait plus se produire — lib/grammar/sentence-guard.ts refuse ces
// phrases en amont — mais la règle coûte une ligne et ferme le dernier
// scénario où quelqu'un serait pénalisé en ayant raison.
export function answerVerificationPrompt(input: {
  lemma: string;
  gender: string;
  animacy: string;
  targetCase: string;
  plural: boolean;
  computedForm: string;
  userAnswer: string;
  sentence?: string;
}) {
  const context = input.sentence
    ? `Phrase de l'exercice, où "___" est le trou à remplir : "${input.sentence}".\n`
    : "";

  return `Tu es un professeur de russe expert en morphologie, pour un apprenant francophone.

Mot (forme du dictionnaire) : "${input.lemma}" (genre : ${input.gender}, ${
    input.animacy === "animate" ? "animé" : "inanimé"
  }).
Cas grammatical demandé : ${input.targetCase}${input.plural ? ", au PLURIEL" : ", au singulier"}.
${context}Un moteur de règles a calculé la forme attendue : "${input.computedForm}".
L'apprenant a répondu : "${input.userAnswer}".

Question : la réponse de l'apprenant est-elle une forme CORRECTE et ACCEPTABLE pour ce mot, ce cas et ce nombre — soit parce qu'elle est identique (aux différences de casse/espaces/ё-е près) à la forme calculée, soit parce que c'est une variante orthographique ou accentuée tout aussi correcte ? Sois STRICT : une vraie faute de déclinaison (mauvais cas, mauvaise terminaison, faute d'orthographe qui change réellement la forme) doit être refusée. N'accepte JAMAIS une réponse simplement "proche" ou "compréhensible" si elle est grammaticalement fautive — en cas de doute, refuse plutôt que d'accepter à tort.
${
  input.sentence
    ? `- Une exception, et une seule : si CETTE phrase appelait en réalité un autre cas que celui demandé (une préposition, un mot de quantité ou un numéral gouverne le trou), c'est l'exercice qui est fautif, pas l'apprenant — accepte alors sa réponse si elle est juste dans cette phrase.\n`
    : ""
}
Pour "reason" : UNE phrase, en français. Nomme le cas et le nombre de la forme que l'apprenant a écrite, sans lui inventer de fonction grammaticale (ne dis jamais d'un génitif que c'est « le cas du complément d'objet direct »). Si tu n'es pas sûr d'analyser sa forme, dis seulement en quoi elle diffère de la forme attendue.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour : {"acceptable":true|false,"reason":"explication très courte en français"}`;
}

// ─── Filet de sécurité : vérification IA d'une traduction jugée fausse ──
// Même principe que answerVerificationPrompt, pour le mode "Frappe" du
// vocabulaire (app/vocabulary/typing) : la comparaison de chaînes reste la
// référence rapide et gratuite, l'IA n'est appelée qu'en filet de sécurité
// quand elle a déjà dit "faux" — synonyme correct, variante orthographique,
// accord de genre/nombre acceptable selon contexte.
export function translationVerificationPrompt(input: {
  expected: string;
  userAnswer: string;
  expectedLanguage: "ru" | "fr";
}) {
  const lang = input.expectedLanguage === "ru" ? "russe" : "français";
  return `Tu es un professeur de russe-français. Un apprenant devait écrire la traduction ${lang} d'un mot.

Réponse attendue : "${input.expected}".
Réponse de l'apprenant : "${input.userAnswer}".

Question : la réponse de l'apprenant est-elle une traduction ACCEPTABLE et correcte — identique, synonyme tout aussi correct, variante orthographique, ou accord de genre/nombre légitime selon le contexte ? Sois STRICT sur les vraies fautes (mot différent, faute d'orthographe qui change le sens) — refuse-les. En cas de doute, refuse plutôt que d'accepter à tort.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour : {"acceptable":true|false,"reason":"explication très courte en français"}`;
}

// ─── Suggestion de traduction à la saisie d'un mot ──────────────
// L'apprenant tape un mot dans sa liste, dans la langue qu'il veut : un mot
// russe entendu quelque part, ou un mot français dont il cherche
// l'équivalent. On lui propose l'autre moitié plutôt que de le laisser
// ouvrir un dictionnaire à côté.
//
// Ce n'est qu'une PROPOSITION : le formulaire la montre comme telle et la
// première frappe dans le champ la remplace. Rien ici n'entre dans un calcul
// de déclinaison — c'est du contenu que l'apprenant valide.
//
// Une seule traduction, courte : une liste de synonymes séparés par des
// virgules rendrait les modes « Frappe » et « QCM » inutilisables, la
// réponse attendue devant rester un mot qu'on peut taper.
export function translationSuggestionPrompt(word: string, from: "ru" | "fr") {
  const asked =
    from === "ru"
      ? `Mot RUSSE saisi : "${word}". Donne sa traduction française.`
      : `Mot FRANÇAIS saisi : "${word}". Donne le mot russe correspondant.`;

  return `Tu es un dictionnaire russe-français pour un apprenant francophone.

${asked}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{"ru":"...","fr":"...","transliteration":"...","partOfSpeech":"...","confident":true|false}

Consignes :
- "ru" : le mot russe en cyrillique, forme du dictionnaire (nominatif
  singulier pour un nom, infinitif pour un verbe), avec son accent tonique
  marqué par un accent aigu combinant Unicode juste après la voyelle
  accentuée (ex. "спаси́бо"). ${
    from === "ru"
      ? "Recopie le mot saisi, en ajoutant seulement l'accent tonique — ne le corrige pas, ne le remplace pas par un autre mot."
      : "C'est LUI que l'apprenant attend : choisis le mot le plus courant, un seul."
  }
- "fr" : LA traduction française la plus courante, aussi courte que possible
  (un mot, deux si la langue l'exige). Pas de liste de synonymes, pas de
  parenthèses explicatives, pas d'article inutile. Pour un verbe, l'infinitif.${
    from === "fr" ? " Recopie ici le mot français saisi." : ""
  }
- "transliteration" : lecture du mot RUSSE en alphabet latin, orientée
  prononciation pour un francophone (ex. "спасибо" -> "spassiba").
- "partOfSpeech" : en français et en deux mots maximum ("nom masculin",
  "verbe imperfectif", "adjectif", "adverbe"...).
- "confident" : false si la saisie n'est pas un mot reconnaissable, si elle
  est ambiguë, ou si tu n'es pas sûr. Dans ce cas donne quand même ta
  meilleure hypothèse : c'est l'apprenant qui tranche.`;
}

// ─── Classification grammaticale d'un mot de vocabulaire perso ──
// Utilisée UNIQUEMENT pour déduire genre/animacité/type de radical d'un
// mot ajouté par l'utilisateur à une liste perso — jamais pour calculer
// une forme fléchie (ça reste le rôle du moteur de règles). L'heuristique
// locale (lib/vocabulary/grammar-classify.ts) est tentée en premier ; ceci
// ne sert qu'à compléter ce qu'elle ne peut pas déduire (surtout
// l'animacité, qui dépend du sens du mot).
export function vocabGrammarSystemPrompt(word: string, translation: string) {
  return `Tu es un linguiste spécialiste du russe et du français. On te donne un nom commun russe au nominatif singulier : "${word}", traduit en français par : "${translation}".

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de la forme :
{"gender":"masculine|feminine|neuter","animacy":"animate|inanimate","stem_type":"hard|soft|mixed","indeclinable":true|false,"french_gender":"m|f"}

Précisions :
- "animacy":"animate" pour une personne ou un animal, "inanimate" sinon.
- "stem_type":"mixed" si le radical se termine par г, к, х, ж, ч, ш ou щ ; "soft" si le radical est mou (ex. finale -ь, -й, -я, -е d'un vrai adoucissement) ; "hard" sinon.
- "indeclinable" à true pour un emprunt qui ne se décline jamais (ex. кофе, метро, такси).
- "french_gender" est le genre grammatical du mot FRANÇAIS donné en traduction (indépendant du genre russe : ex. "книга" est féminin en russe mais sa traduction "livre" est masculine en français -> "m"). Si la traduction contient plusieurs mots ou options séparées par "/" ou ",", donne le genre du premier substantif.
- Si le mot n'est pas un nom commun russe déclinable normalement (ex. adjectif, verbe, mot étranger non intégré), réponds quand même avec ta meilleure estimation raisonnable — ne laisse jamais un champ vide.`;
}

// ─── Génération d'un texte de lecture gradué (contenu ORIGINAL) ──
const READING_LENGTH_GUIDANCE = {
  short: "court : 4 à 6 phrases",
  medium: "moyen : 8 à 12 phrases",
  long: "long : 15 à 20 phrases",
} as const;
export type ReadingLength = keyof typeof READING_LENGTH_GUIDANCE;

const READING_STYLE_GUIDANCE = {
  narrative: "un récit à la 3e personne (on suit un personnage)",
  dialogue: "un dialogue entre deux personnages (répliques introduites par un tiret \"— \")",
  description: "une description (lieu, personne, objet ou situation, sans intrigue)",
} as const;
export type ReadingStyle = keyof typeof READING_STYLE_GUIDANCE;

export interface ReadingOptions {
  level: CefrLevel;
  length?: ReadingLength;
  style?: ReadingStyle;
  focusCase?: CaseId;
}

// ─── Explication d'un mot de vocabulaire ────────────────────────
// Du COMMENTAIRE, pas du calcul : on demande au modèle ce qu'un
// dictionnaire ne donne pas — la nuance, le registre, le piège pour un
// francophone. Aucune forme fléchie n'est produite ici ; les déclinaisons
// restent du ressort du moteur de règles et du dictionnaire.
export function wordExplanationPrompt(input: {
  ru: string;
  fr: string;
  level: string;
}) {
  return `Tu es un professeur de russe qui enseigne à des francophones. Explique le mot russe "${input.ru}", que l'apprenant a noté avec la traduction "${input.fr}". Son niveau est ${input.level}.

Écris pour quelqu'un qui connaît déjà la traduction : ne répète pas simplement le sens, apporte ce qu'une traduction seule ne dit pas.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{"meaning":"...","partOfSpeech":"...","register":"...","examples":[{"ru":"...","fr":"..."}],"collocations":["..."],"related":["..."],"pitfall":"..."}

Consignes :
- "meaning" : deux ou trois phrases en français. Ce que le mot recouvre exactement, ses connotations, dans quelles situations on l'emploie vraiment.
- "partOfSpeech" : en français ("nom masculin", "verbe imperfectif", "adjectif"...). Pour un verbe, précise l'aspect et donne son partenaire aspectuel.
- "register" : "courant", "familier", "soutenu", "technique", "vieilli"...
- "examples" : deux ou trois phrases COURTES adaptées au niveau ${input.level}, chacune employant réellement le mot "${input.ru}" (fléchi si besoin), avec sa traduction française.
- "collocations" : expressions ou associations habituelles du mot, en russe suivi du français entre parenthèses.
- "related" : mots proches (synonymes, mots de la même famille, ou l'autre membre de la paire aspectuelle), chacun avec ce qui le DISTINGUE en quelques mots.
- "pitfall" : le piège pour un francophone — faux-ami, cas exigé par le verbe, aspect à ne pas confondre, préposition inattendue. Omets ce champ s'il n'y a rien de notable ; n'invente pas de difficulté.
- Tout le français doit être naturel et sans jargon inutile. Le russe doit porter les accents toniques uniquement s'ils sont pédagogiquement utiles.`;
}

export function readingSystemPrompt({
  level,
  length = "medium",
  style = "narrative",
  focusCase,
}: ReadingOptions) {
  const focusCaseInfo = focusCase ? CASES.find((c) => c.id === focusCase) : undefined;
  const focusInstruction = focusCaseInfo
    ? `- Fais un usage RÉPÉTÉ et NATUREL du cas "${focusCaseInfo.nameFr}" (${focusCaseInfo.nameRu}, ${focusCaseInfo.question}) : ${focusCaseInfo.usage} Le texte doit contenir plusieurs occurrences claires de ce cas (prépositions ou verbes qui le déclenchent), sans que ça sonne artificiel.`
    : "";

  return `Tu es un auteur de textes pédagogiques de russe langue étrangère pour francophones.
Niveau CEFR : ${level} (${LEVEL_GUIDANCE[level]}).
Longueur souhaitée : ${READING_LENGTH_GUIDANCE[length]}.
Forme : ${READING_STYLE_GUIDANCE[style]}.
${focusInstruction}

Tâche : écrire un TEXTE ORIGINAL, gradué, adapté au niveau, sur une situation concrète de la vie quotidienne.
IMPORTANT — droit d'auteur :
- Écris un texte 100% original. Ne reproduis JAMAIS d'extrait d'œuvre existante sous droit d'auteur.
- Tu ne dois pas prétendre citer un livre réel. Ce texte est un contenu pédagogique original.

Fournis aussi, pour CHAQUE mot russe, une glose mot-à-mot ET le cas grammatical qu'il porte :
- "case" vaut l'une de ces valeurs EXACTES : "nominative", "genitive", "dative", "accusative",
  "instrumental", "prepositional" — UNIQUEMENT pour un nom/adjectif/pronom/numéral qui porte
  visiblement une marque de cas dans cette phrase précise (pas le nominatif "par défaut" d'un
  sujet neutre : ne tague le nominatif QUE si ça aide à voir un contraste, par exemple un attribut
  après "быть"). Omets "case" (ne mets pas le champ, ou mets null) pour les verbes, adverbes,
  conjonctions, prépositions, la ponctuation, et tout mot invariable.
- Ne devine JAMAIS un cas dont tu n'es pas sûr — mieux vaut omettre "case" qu'en donner un faux.

Réponds UNIQUEMENT avec un JSON valide de la forme :
{"title":"titre en russe","title_fr":"titre en français","level":"${level}",
 "sentences":[[{"ru":"mot","gloss":"traduction ou null pour la ponctuation","case":"genitive ou null"}, ...], ...],
 "summary_fr":"résumé en 1 phrase française"}`;
}
