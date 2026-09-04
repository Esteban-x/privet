import { CaseId } from "./types";
import { ArticleMode } from "./french-article";
// Type seul : évite un cycle de modules avec noun-categories, qui lit la banque.
import type { NounCategory } from "./noun-categories";
import { TRIGGER_TEMPLATES } from "./trigger-templates.generated";

// Banque des "déclencheurs" de chaque cas : prépositions, verbes à régime
// et expressions figées qui imposent le cas. Objectif pédagogique : ne pas
// seulement faire décliner un mot isolé, mais montrer QUAND/POURQUOI ce cas
// apparaît en russe (approche des manuels RLE). Chaque déclencheur fournit
// aussi un gabarit de phrase à trou (`template`), utilisé comme repli
// hors-IA et comme base des exercices QCM.
//
// Couverture volontairement large et déséquilibrée entre cas : le génitif
// a près de trois fois plus de déclencheurs que les autres (~15 prépositions
// courantes + verbes + expressions de quantité/possession) — c'est un fait
// de la langue russe, pas un oubli. Le prépositionnel, à l'inverse, n'a par
// nature que 4 prépositions possibles (в, на, о, при) : sa richesse vient
// des verbes qui l'imposent, pas des prépositions.
//
// Limite assumée : seuls les déclencheurs dont le mot à trou peut être un
// nom commun générique sont inclus (pas de déclencheur du type "jours de la
// semaine" ou "le 5 mai" qui exigerait un nom précis hors de la banque de
// noms, ni de verbe à régime ambigu selon le sens comme искать/ждать qui
// prennent tantôt l'accusatif tantôt le génitif).

export type TriggerKind = "preposition" | "verb" | "expression";

// Palier de fréquence/registre — pas du CEFR fin (trop de granularité à
// maintenir sur autant d'entrées), juste de quoi biaiser le tirage des
// exercices vers l'essentiel pour un débutant et débloquer progressivement
// le reste plutôt que de tout servir à poids égal dès A0.
export type TriggerTier = "basic" | "intermediate" | "advanced";

/**
 * Les nombres qu'un gabarit accepte.
 *
 * CE QUE CE CHAMP REMPLACE. Il y avait un booléen `plural`, vrai sur six
 * déclencheurs — « много ___ », « несколько ___ » — parce que ces
 * expressions EXIGENT le pluriel. Partout ailleurs il valait faux, ce qui
 * ne voulait pas dire « ce gabarit refuse le pluriel » mais « personne n'a
 * eu l'occasion de dire le contraire ». Les six vivaient au nominatif et au
 * génitif : le datif, l'accusatif, l'instrumental et le prépositionnel
 * n'avaient donc AUCUN exercice au pluriel, alors que la banque porte les
 * douze formes de chaque nom, accentuées et vérifiées.
 *
 * Trois etats, parce qu'il y a trois situations réelles :
 * - "plural"   le gabarit impose le pluriel (« несколько ___ ») ;
 * - "singular" il le refuse — le trou est un prenom (« Меня зовут ___ »),
 *   un sujet dont le verbe francais s'accorde (« ___ a une voiture »), ou
 *   une quantité de matière (« un verre de ___ ») ;
 * - "both"     le défaut : le trou est un complément, et « Я говорю с
 *   дру́гом » comme « Я говорю с друзья́ми » sont deux phrases justes.
 *
 * Le défaut est "both" et non "singular" : un complément accepte les deux
 * nombres, c'est le refus qui est l'exception et qui mérite d'être écrit.
 */
export type TriggerNumber = "singular" | "plural" | "both";

export interface CaseTrigger {
  id: string;
  caseId: CaseId;
  kind: TriggerKind;
  tier: TriggerTier;
  ru: string; // ex. "у", "помога́ть (+ дат.)"
  meaningFr: string;
  /**
   * La phrase de RÉFÉRENCE, écrite à la main. « ___ » marque le trou.
   *
   * Ce n'est plus la seule : `templatesFor` y ajoute celles de la banque
   * générée. Celle-ci garde trois rôles qu'aucune autre ne peut tenir —
   * montrer au modèle ce qu'on attend, calibrer le contrôle d'identité du
   * garde-fou, et rester là si la banque est vide.
   */
  template: { ru: string; fr: string };
  /**
   * Nombre(s) que le gabarit accepte. Absent = "both" — voir TriggerNumber
   * pour ce que l'absence signifiait avant, et pourquoi elle ne le signifie
   * plus.
   */
  number?: TriggerNumber;
  // Article français à appliquer devant la traduction insérée dans le trou
  // du template.fr — voir lib/grammar/french-article.ts. Champ obligatoire
  // (pas de défaut implicite) : chaque déclencheur a été revu au cas par
  // cas plutôt que de laisser un mode par défaut potentiellement faux.
  article: ArticleMode;
  /**
   * Classes de noms que ce déclencheur accepte (voir noun-categories.ts).
   *
   * Absent = accepte tout, et c'est une décision, pas un oubli : « Я люблю
   * ___ » ou « Я ду́маю о ___ » vont avec n'importe quel nom, les restreindre
   * appauvrirait le tirage sans rien corriger.
   *
   * Présent = le déclencheur EXIGE quelque chose. « Я ем ___ » tombait sur
   * « помо́щник » — « je mange cet assistant » : désinence juste, phrase
   * impossible. La liste est une alternative (l'un OU l'autre), jamais un
   * cumul.
   */
  accepts?: NounCategory[];
}

// "Меня́ зову́т ___" n'a de sens qu'avec un prénom, jamais un nom commun de
// la banque générale ("Меня́ зову́т му́зыка" est absurde) — repéré par id
// plutôt qu'un champ générique sur CaseTrigger puisque c'est, à ce jour, le
// seul déclencheur dans ce cas. Utilisé à la fois pour réserver le tirage
// du nom (lib/grammar/exercise-generator.ts) et pour adapter le prompt IA
// (lib/ai/prompts.ts).
export const PROPER_NOUN_TRIGGER_ID = "expr-nom-zovut";

export const TRIGGERS: CaseTrigger[] = [
  // ─── Nominatif ──────────────────────────────────────────────────
  {
    id: "expr-nom-eto",
    caseId: "nominative",
    kind: "expression",
    tier: "basic",
    article: "indefinite",
    ru: "э́то",
    meaningFr: "Identifier quelqu'un ou quelque chose.",
    template: { ru: "Э́то ___.", fr: "C'est ___." },
    number: "singular", // « C'est ___ » demanderait « Ce sont » au pluriel
  },
  {
    id: "expr-nom-vot",
    caseId: "nominative",
    kind: "expression",
    tier: "basic",
    article: "demonstrative",
    ru: "вот",
    meaningFr: "Présenter, montrer du doigt.",
    template: { ru: "Вот ___.", fr: "Voici ___." },
  },
  {
    id: "expr-nom-est",
    accepts: ["human", "animal", "object", "food", "drink", "text"],
    caseId: "nominative",
    kind: "expression",
    tier: "basic",
    article: "demonstrative",
    ru: "есть",
    meaningFr: "Existence : \"il y a\" (contraste avec нет + génitif pour l'absence).",
    template: { ru: "Здесь есть ___.", fr: "Il y a ___ ici." },
  },
  {
    id: "expr-nom-zovut",
    caseId: "nominative",
    kind: "expression",
    tier: "basic",
    // Jamais d'article devant un prénom ("Je m'appelle Anna", jamais
    // "Je m'appelle cette Anna") — voir aussi le tirage réservé aux
    // prénoms (RUSSIAN_NAMES) dans exercise-generator.ts pour ce
    // déclencheur précis.
    article: "none",
    ru: "зову́т",
    meaningFr: "Se présenter : le nom reste au nominatif après \"меня́ зову́т\".",
    template: { ru: "Меня́ зову́т ___.", fr: "Je m'appelle ___." },
    number: "singular", // un prénom, jamais un pluriel
  },
  {
    id: "expr-nom-pluriel",
    accepts: ["human", "animal", "object", "food", "drink", "text"],
    caseId: "nominative",
    kind: "expression",
    tier: "basic",
    article: "none",
    ru: "мн. число́",
    meaningFr: "Le sujet est au pluriel.",
    template: { ru: "Здесь то́лько ___.", fr: "Ici il n'y a que des ___." },
    number: "plural",
  },

  // ─── Génitif ────────────────────────────────────────────────────
  // Absence / négation
  {
    id: "expr-gen-net",
    caseId: "genitive",
    kind: "expression",
    tier: "basic",
    article: "none",
    ru: "нет",
    meaningFr: "Absence : нет + génitif.",
    template: { ru: "У меня́ нет ___.", fr: "Je n'ai pas de ___." },
  },
  // Quantité et mesure
  {
    id: "expr-gen-mnogo",
    caseId: "genitive",
    kind: "expression",
    tier: "basic",
    article: "none",
    ru: "мно́го",
    meaningFr: "Quantité importante (+ génitif pluriel).",
    template: { ru: "У меня́ мно́го ___.", fr: "J'ai beaucoup de ___." },
    number: "plural",
  },
  {
    id: "expr-gen-malo",
    caseId: "genitive",
    kind: "expression",
    tier: "basic",
    article: "none",
    ru: "ма́ло",
    meaningFr: "Quantité insuffisante (+ génitif pluriel).",
    template: { ru: "У меня́ ма́ло ___.", fr: "J'ai peu de ___." },
    number: "plural",
  },
  {
    id: "expr-gen-neskolko",
    accepts: ["human", "animal", "object", "food", "drink", "text"],
    caseId: "genitive",
    kind: "expression",
    tier: "intermediate",
    article: "none",
    ru: "не́сколько",
    meaningFr: "\"Plusieurs\" (+ génitif pluriel).",
    template: { ru: "У меня́ есть не́сколько ___.", fr: "J'ai plusieurs ___." },
    number: "plural",
  },
  {
    id: "expr-gen-skolko",
    accepts: ["human", "animal", "object", "food", "drink", "text"],
    caseId: "genitive",
    kind: "expression",
    tier: "basic",
    article: "none",
    ru: "ско́лько",
    meaningFr: "\"Combien de\" (+ génitif).",
    template: { ru: "Ско́лько ___ у тебя́?", fr: "Combien de ___ as-tu ?" },
    number: "plural",
  },
  {
    id: "expr-gen-kusok",
    accepts: ["food"],
    caseId: "genitive",
    kind: "expression",
    tier: "intermediate",
    article: "none",
    ru: "кусо́к",
    meaningFr: "Unité de mesure : \"un morceau de\".",
    template: { ru: "Дай мне кусо́к ___.", fr: "Donne-moi un morceau de ___." },
    number: "singular", // un morceau se prend dans une matière, au singulier
  },
  {
    id: "expr-gen-stakan",
    accepts: ["drink"],
    caseId: "genitive",
    kind: "expression",
    tier: "intermediate",
    article: "none",
    ru: "стака́н",
    meaningFr: "Unité de mesure : \"un verre de\".",
    template: { ru: "Я хочу́ стака́н ___.", fr: "Je veux un verre de ___." },
    number: "singular", // un verre se remplit d'une matière, au singulier
  },
  // Possession
  {
    id: "prep-gen-u",
    accepts: ["human"],
    caseId: "genitive",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "у",
    meaningFr: "Possession, \"chez\" : у + génitif.",
    template: { ru: "Я живу́ у ___.", fr: "Je vis chez ___." },
  },
  {
    id: "expr-gen-u-est",
    accepts: ["human"],
    caseId: "genitive",
    kind: "expression",
    tier: "basic",
    article: "demonstrative",
    ru: "у ... есть",
    meaningFr: "Possession : \"chez X il y a Y\" = \"X a Y\" — le possesseur (X) est au génitif après у.",
    template: { ru: "У ___ есть маши́на.", fr: "___ a une voiture." },
    number: "singular", // le trou est le sujet : « ___ ont une voiture » au pluriel
  },
  {
    id: "expr-gen-possession",
    accepts: ["human"],
    caseId: "genitive",
    kind: "expression",
    tier: "intermediate",
    article: "demonstrative",
    ru: "сущ. + сущ.",
    meaningFr: "Possession : \"le X de Y\" — le possesseur se met au génitif juste après le nom possédé.",
    template: { ru: "Э́то маши́на ___.", fr: "C'est la voiture de ___." },
  },
  // Prépositions
  {
    id: "prep-gen-iz",
    accepts: ["place", "area"],
    caseId: "genitive",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "из",
    meaningFr: "Provenance, origine.",
    template: { ru: "Я прие́хал из ___.", fr: "Je suis venu de ___." },
  },
  {
    id: "prep-gen-ot",
    accepts: ["human"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "от",
    meaningFr: "En provenance de (personne, source).",
    template: { ru: "Э́то письмо́ от ___.", fr: "Cette lettre vient de ___." },
  },
  {
    id: "prep-gen-s",
    accepts: ["time"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "с",
    meaningFr: "\"Depuis\", \"à partir de\" (sens temporel — différent de с + instrumental qui signifie \"avec\").",
    template: { ru: "Я не спал с ___.", fr: "Je n'ai pas dormi depuis ___." },
  },
  {
    id: "prep-gen-do",
    accepts: ["place", "area"],
    caseId: "genitive",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "до",
    meaningFr: "\"Jusqu'à\".",
    template: { ru: "Мы е́дем до ___.", fr: "Nous allons jusqu'à ___." },
  },
  {
    id: "prep-gen-posle",
    accepts: ["time", "abstract"],
    caseId: "genitive",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "по́сле",
    meaningFr: "\"Après\".",
    template: { ru: "Я приду́ по́сле ___.", fr: "Je viendrai après ___." },
  },
  {
    id: "prep-gen-vovremya",
    accepts: ["time", "abstract"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "во вре́мя",
    meaningFr: "\"Pendant\".",
    template: { ru: "Я молча́л во вре́мя ___.", fr: "Je me suis tu pendant ___." },
  },
  {
    id: "prep-gen-okolo",
    accepts: ["place", "area"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "о́коло",
    meaningFr: "\"Près de\", \"environ\".",
    template: { ru: "Магази́н о́коло ___.", fr: "Le magasin est près de ___." },
  },
  {
    id: "prep-gen-vokrug",
    accepts: ["place", "area", "object"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "вокру́г",
    meaningFr: "\"Autour de\".",
    template: { ru: "Де́ти бе́гали вокру́г ___.", fr: "Les enfants couraient autour de ___." },
  },
  {
    id: "prep-gen-vdol",
    accepts: ["place", "area"],
    caseId: "genitive",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "вдоль",
    meaningFr: "\"Le long de\".",
    template: { ru: "Мы гуля́ли вдоль ___.", fr: "Nous nous sommes promenés le long de ___." },
  },
  {
    id: "prep-gen-mimo",
    accepts: ["place", "area", "object"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "ми́мо",
    meaningFr: "\"Devant\", \"en passant par\" (mouvement).",
    template: { ru: "Я прошёл ми́мо ___.", fr: "Je suis passé devant ___." },
  },
  {
    id: "prep-gen-naprotiv",
    accepts: ["place", "area"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "напро́тив",
    meaningFr: "\"En face de\".",
    template: { ru: "Кафе́ напро́тив ___.", fr: "Le café est en face de ___." },
  },
  {
    id: "prep-gen-sredi",
    accepts: ["human"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "среди́",
    meaningFr: "\"Parmi\".",
    template: { ru: "Я чу́вствую себя́ одино́ко среди́ ___.", fr: "Je me sens seul parmi ___." },
    number: "plural",
  },
  {
    id: "prep-gen-protiv",
    accepts: ["human", "abstract"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "про́тив",
    meaningFr: "\"Contre\".",
    template: { ru: "Я ничего́ не име́ю про́тив ___.", fr: "Je n'ai rien contre ___." },
  },
  {
    id: "prep-gen-krome",
    accepts: ["human"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "кро́ме",
    meaningFr: "\"Sauf\", \"à part\".",
    template: { ru: "Все пришли́, кро́ме ___.", fr: "Tout le monde est venu, sauf ___." },
  },
  {
    id: "prep-gen-vmesto",
    accepts: ["food", "drink"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "none",
    ru: "вме́сто",
    meaningFr: "\"Au lieu de\".",
    template: { ru: "Возьми́ чай вме́сто ___.", fr: "Prends du thé au lieu de ___." },
  },
  {
    id: "prep-gen-izza",
    accepts: ["human", "abstract"],
    caseId: "genitive",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "из-за",
    meaningFr: "\"À cause de\".",
    template: { ru: "Я опозда́л из-за ___.", fr: "Je suis arrivé en retard à cause de ___." },
  },
  {
    id: "prep-gen-izpod",
    accepts: ["object", "place", "area"],
    caseId: "genitive",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "из-под",
    meaningFr: "\"De dessous\".",
    template: { ru: "Кот вы́лез из-под ___.", fr: "Le chat est sorti de dessous ___." },
  },
  {
    id: "prep-gen-bez",
    caseId: "genitive",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "без",
    meaningFr: "Absence, \"sans\".",
    template: { ru: "Я не могу́ жить без ___.", fr: "Je ne peux pas vivre sans ___." },
  },
  {
    id: "prep-gen-dlya",
    accepts: ["human"],
    caseId: "genitive",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "для",
    meaningFr: "Destination, \"pour\".",
    template: { ru: "Э́то пода́рок для ___.", fr: "C'est un cadeau pour ___." },
  },
  {
    id: "prep-gen-vnutri",
    accepts: ["object", "place"],
    caseId: "genitive",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "внутри́",
    meaningFr: "\"À l'intérieur de\".",
    template: { ru: "Кот сиди́т внутри́ ___.", fr: "Le chat est assis à l'intérieur de ___." },
  },
  {
    id: "prep-gen-radi",
    accepts: ["human", "abstract"],
    caseId: "genitive",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "ра́ди",
    meaningFr: "\"Pour l'amour de\", \"pour le bien de\".",
    template: { ru: "Я сде́лал э́то ра́ди ___.", fr: "J'ai fait ça pour ___." },
  },
  {
    id: "prep-gen-nakanune",
    accepts: ["time"],
    caseId: "genitive",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "накану́не",
    meaningFr: "\"La veille de\".",
    template: { ru: "Я пришёл накану́не ___.", fr: "Je suis venu la veille de ___." },
    number: "singular", // la veille d'UN événement
  },
  {
    id: "prep-gen-vrode",
    accepts: ["object", "animal", "food", "drink", "abstract"],
    caseId: "genitive",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "вро́де",
    meaningFr: "\"Une sorte de\", \"comme\" (familier).",
    template: { ru: "Э́то что-то вро́де ___.", fr: "C'est une sorte de ___." },
    number: "singular", // « une sorte de » appelle un singulier
  },
  // Verbes
  {
    id: "verb-gen-boyatsya",
    accepts: ["human", "animal", "abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "боя́ться",
    meaningFr: "\"Avoir peur de\" se construit au génitif.",
    template: { ru: "Я бою́сь ___.", fr: "J'ai peur de ___." },
  },
  {
    id: "verb-gen-izbegat",
    accepts: ["human", "abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "избега́ть",
    meaningFr: "\"Éviter\" se construit au génitif.",
    template: { ru: "Я избега́ю ___.", fr: "J'évite ___." },
  },
  {
    id: "verb-gen-zhelat",
    accepts: ["abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "жела́ть",
    meaningFr: "\"Souhaiter\" se construit au génitif (surtout dans les vœux).",
    template: { ru: "Жела́ю тебе́ ___.", fr: "Je te souhaite ___." },
  },
  {
    id: "verb-gen-trebovat",
    accepts: ["abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "тре́бовать",
    meaningFr: "\"Exiger\" se construit au génitif.",
    template: { ru: "Я тре́бую ___.", fr: "J'exige ___." },
  },
  {
    id: "verb-gen-kasatsya",
    accepts: ["human", "abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "каса́ться",
    meaningFr: "\"Concerner\" se construit au génitif.",
    template: { ru: "Э́то каса́ется ___.", fr: "Ça concerne ___." },
  },
  {
    id: "verb-gen-dostigat",
    accepts: ["place", "area", "abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "достига́ть",
    meaningFr: "\"Atteindre, parvenir à\" se construit au génitif.",
    template: { ru: "Мы дости́гли ___.", fr: "Nous avons atteint ___." },
  },
  {
    id: "verb-gen-vypit",
    accepts: ["drink"],
    caseId: "genitive",
    kind: "verb",
    tier: "intermediate",
    article: "none",
    ru: "вы́пить",
    meaningFr: "Génitif partitif : boire UNE PARTIE de (contraste avec l'accusatif пить qui boit la chose entière/précise).",
    template: { ru: "Я хочу́ вы́пить ___.", fr: "Je veux boire un peu de ___." },
    number: "singular", // on boit un peu d'une matière, au singulier
  },
  {
    id: "verb-gen-lishitsya",
    accepts: ["object", "abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "лиши́ться",
    meaningFr: "\"Perdre, être privé de\" se construit au génitif.",
    template: { ru: "Он лиши́лся ___.", fr: "Il a perdu ___." },
  },
  {
    id: "verb-gen-stesnyatsya",
    accepts: ["human", "abstract"],
    caseId: "genitive",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "стесня́ться",
    meaningFr: "\"Avoir honte de, être gêné par\" se construit au génitif.",
    template: { ru: "Не стесня́йся ___.", fr: "N'aie pas honte de ___." },
  },
  {
    id: "verb-gen-slushatsya",
    accepts: ["human"],
    caseId: "genitive",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "слу́шаться",
    meaningFr: "\"Obéir à\" se construit au génitif.",
    template: { ru: "Де́ти слу́шаются ___.", fr: "Les enfants obéissent à ___." },
  },
  // Adjectifs / expressions figées
  {
    id: "expr-gen-polnyy",
    accepts: ["drink", "food"],
    caseId: "genitive",
    kind: "expression",
    tier: "intermediate",
    article: "none",
    ru: "по́лный",
    meaningFr: "\"Plein de\" se construit au génitif.",
    template: { ru: "Стака́н по́лный ___.", fr: "Le verre est plein de ___." },
    number: "singular", // plein d'une matière, au singulier
  },
  {
    id: "expr-gen-dostoin",
    accepts: ["abstract"],
    caseId: "genitive",
    kind: "expression",
    tier: "advanced",
    article: "demonstrative",
    ru: "досто́ин",
    meaningFr: "\"Digne de\" se construit au génitif.",
    template: { ru: "Он досто́ин ___.", fr: "Il est digne de ___." },
  },
  {
    id: "expr-gen-zhal",
    accepts: ["human", "abstract"],
    caseId: "genitive",
    kind: "expression",
    tier: "basic",
    article: "demonstrative",
    ru: "жаль",
    meaningFr: "\"Avoir de la peine pour\" se construit au génitif.",
    template: { ru: "Мне жаль ___.", fr: "Je suis désolé pour ___." },
  },

  // ─── Datif ──────────────────────────────────────────────────────
  {
    id: "prep-dat-k",
    accepts: ["place", "area", "human"],
    caseId: "dative",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "к",
    meaningFr: "Direction vers quelqu'un/quelque chose.",
    template: { ru: "Я иду́ к ___.", fr: "Je vais vers ___." },
  },
  {
    id: "prep-dat-po",
    accepts: ["place", "area"],
    caseId: "dative",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "по",
    meaningFr: "\"Le long de\", \"selon\".",
    template: { ru: "Я гуля́ю по ___.", fr: "Je me promène le long de ___." },
  },
  {
    id: "prep-dat-blagodarya",
    accepts: ["human", "abstract"],
    caseId: "dative",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "благодаря́",
    meaningFr: "\"Grâce à\".",
    template: { ru: "Мы победи́ли благодаря́ ___.", fr: "Nous avons gagné grâce à ___." },
  },
  {
    id: "prep-dat-vopreki",
    accepts: ["abstract"],
    caseId: "dative",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "вопреки́",
    meaningFr: "\"Malgré\", \"contrairement à\".",
    template: { ru: "Мы вы́играли вопреки́ ___.", fr: "Nous avons gagné malgré ___." },
  },
  {
    id: "prep-dat-soglasno",
    accepts: ["human", "abstract"],
    caseId: "dative",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "согла́сно",
    meaningFr: "\"Selon\", \"conformément à\" (registre plutôt formel).",
    template: { ru: "Согла́сно ___, э́то пра́вда.", fr: "Selon ___, c'est vrai." },
  },
  {
    id: "verb-dat-pomogat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "помога́ть",
    meaningFr: "\"Aider quelqu'un\" se construit au datif.",
    template: { ru: "Я помога́ю ___.", fr: "J'aide ___." },
  },
  {
    id: "verb-dat-zvonit",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "звони́ть",
    meaningFr: "\"Téléphoner à quelqu'un\" se construit au datif.",
    template: { ru: "Я звоню́ ___.", fr: "J'appelle ___." },
  },
  {
    id: "verb-dat-nravitsya",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "нра́виться",
    meaningFr: "\"Plaire à quelqu'un\" se construit au datif.",
    template: { ru: "Э́та му́зыка нра́вится ___.", fr: "Cette musique plaît à ___." },
  },
  {
    id: "verb-dat-davat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "дава́ть",
    meaningFr: "\"Donner à quelqu'un\" se construit au datif.",
    template: { ru: "Я даю́ пода́рок ___.", fr: "Je donne un cadeau à ___." },
  },
  {
    id: "verb-dat-verit",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "ве́рить",
    meaningFr: "\"Croire quelqu'un\" se construit au datif.",
    template: { ru: "Я ве́рю ___.", fr: "Je crois ___." },
  },
  {
    id: "verb-dat-doveryat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "доверя́ть",
    meaningFr: "\"Faire confiance à\" se construit au datif.",
    template: { ru: "Я доверя́ю ___.", fr: "Je fais confiance à ___." },
  },
  {
    id: "verb-dat-sovetovat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "сове́товать",
    meaningFr: "\"Conseiller à quelqu'un\" se construit au datif.",
    template: { ru: "Я сове́тую ___.", fr: "Je conseille ___." },
  },
  {
    id: "verb-dat-zavidovat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "зави́довать",
    meaningFr: "\"Envier quelqu'un\" se construit au datif.",
    template: { ru: "Я зави́дую ___.", fr: "J'envie ___." },
  },
  {
    id: "verb-dat-otvechat",
    accepts: ["human", "abstract"],
    caseId: "dative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "отвеча́ть",
    meaningFr: "\"Répondre à quelqu'un\" se construit au datif.",
    template: { ru: "Я отвеча́ю ___.", fr: "Je réponds à ___." },
  },
  {
    id: "verb-dat-meshat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "меша́ть",
    meaningFr: "\"Déranger quelqu'un\" se construit au datif.",
    template: { ru: "Не меша́й ___.", fr: "Ne dérange pas ___." },
  },
  {
    id: "verb-dat-razreshat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "разреша́ть",
    meaningFr: "\"Permettre à quelqu'un\" se construit au datif.",
    template: { ru: "Ма́ма разреша́ет ___.", fr: "Maman donne la permission à ___." },
  },
  {
    id: "verb-dat-udivlyatsya",
    accepts: ["human", "abstract"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "удивля́ться",
    meaningFr: "\"Être surpris de\" se construit au datif.",
    template: { ru: "Я удивля́юсь ___.", fr: "Je suis surpris de ___." },
  },
  {
    id: "verb-dat-radovatsya",
    accepts: ["human", "abstract"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "ра́доваться",
    meaningFr: "\"Se réjouir de\" se construit au datif.",
    template: { ru: "Я ра́дуюсь ___.", fr: "Je me réjouis de ___." },
  },
  {
    id: "verb-dat-prinadlezhat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "принадлежа́ть",
    meaningFr: "\"Appartenir à\" se construit au datif.",
    template: { ru: "Э́та иде́я принадлежи́т ___.", fr: "Cette idée appartient à ___." },
  },
  {
    id: "verb-dat-sochuvstvovat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "сочу́вствовать",
    meaningFr: "\"Compatir avec\" se construit au datif.",
    template: { ru: "Я сочу́вствую ___.", fr: "Je compatis avec ___." },
  },
  {
    id: "verb-dat-ugrozhat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "угрожа́ть",
    meaningFr: "\"Menacer\" se construit au datif.",
    template: { ru: "Он угрожа́ет ___.", fr: "Il menace ___." },
  },
  {
    id: "verb-dat-podchinyatsya",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "подчиня́ться",
    meaningFr: "\"Obéir à, se soumettre à\" se construit au datif.",
    template: { ru: "Мы подчиня́емся ___.", fr: "Nous obéissons à ___." },
  },
  {
    id: "verb-dat-soprotivlyatsya",
    accepts: ["human", "abstract"],
    caseId: "dative",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "сопротивля́ться",
    meaningFr: "\"Résister à\" se construit au datif.",
    template: { ru: "Я сопротивля́юсь ___.", fr: "Je résiste à ___." },
  },
  {
    id: "verb-dat-aplodirovat",
    accepts: ["human"],
    caseId: "dative",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "аплоди́ровать",
    meaningFr: "\"Applaudir\" se construit au datif.",
    template: { ru: "Зри́тели аплоди́руют ___.", fr: "Les spectateurs applaudissent ___." },
  },
  {
    id: "verb-dat-sluzhit",
    accepts: ["human", "abstract"],
    caseId: "dative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "служи́ть",
    meaningFr: "\"Servir\" se construit au datif.",
    template: { ru: "Я служу́ ___.", fr: "Je sers ___." },
  },

  // ─── Accusatif ──────────────────────────────────────────────────
  {
    id: "verb-acc-videt",
    accepts: ["human", "animal", "object", "food", "drink", "place", "area"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "ви́деть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я ви́жу ___.", fr: "Je vois ___." },
  },
  {
    id: "verb-acc-lyubit",
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "люби́ть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я люблю́ ___.", fr: "J'aime ___." },
  },
  {
    id: "verb-acc-chitat",
    accepts: ["text"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "чита́ть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я чита́ю ___.", fr: "Je lis ___." },
  },
  {
    id: "verb-acc-znat",
    accepts: ["human", "abstract", "place", "area"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "знать",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я хорошо́ зна́ю ___.", fr: "Je connais bien ___." },
  },
  {
    id: "verb-acc-pokupat",
    accepts: ["object", "text", "food", "drink", "animal"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "покупа́ть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я покупа́ю ___.", fr: "J'achète ___." },
  },
  {
    id: "verb-acc-pisat",
    accepts: ["text"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "писа́ть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я пишу́ ___.", fr: "J'écris ___." },
  },
  {
    id: "verb-acc-ponimat",
    accepts: ["human", "text", "abstract"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "понима́ть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я понима́ю ___.", fr: "Je comprends ___." },
  },
  {
    id: "verb-acc-slushat",
    accepts: ["human", "abstract"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "слу́шать",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я слу́шаю ___.", fr: "J'écoute ___." },
  },
  {
    id: "verb-acc-est",
    accepts: ["food"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "есть",
    meaningFr: "\"Manger\" (à ne pas confondre avec есть \"il y a\", qui n'a pas de complément).",
    template: { ru: "Я ем ___.", fr: "Je mange ___." },
  },
  {
    id: "verb-acc-pit",
    accepts: ["drink"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "пить",
    meaningFr: "Complément d'objet direct (contraste avec вы́пить + génitif pour \"boire un peu de\").",
    template: { ru: "Я пью ___.", fr: "Je bois ___." },
  },
  {
    id: "verb-acc-delat",
    accepts: ["abstract"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "де́лать",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я де́лаю ___.", fr: "Je fais ___." },
  },
  {
    id: "verb-acc-vstrechat",
    accepts: ["human"],
    caseId: "accusative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "встреча́ть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я встреча́ю ___.", fr: "Je rencontre ___." },
  },
  {
    id: "verb-acc-brat",
    accepts: ["object", "text", "food", "drink"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "брать",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я беру́ ___.", fr: "Je prends ___." },
  },
  {
    id: "verb-acc-izuchat",
    accepts: ["abstract", "text"],
    caseId: "accusative",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "изуча́ть",
    meaningFr: "Complément d'objet direct (étudier une matière, une langue).",
    template: { ru: "Я изуча́ю ___.", fr: "J'étudie ___." },
  },
  {
    id: "verb-acc-nenavidet",
    caseId: "accusative",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "ненави́деть",
    meaningFr: "Complément d'objet direct.",
    template: { ru: "Я ненави́жу ___.", fr: "Je déteste ___." },
  },
  {
    id: "prep-acc-v",
    accepts: ["place"],
    caseId: "accusative",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "в",
    meaningFr: "Mouvement vers l'intérieur (\"dans\").",
    template: { ru: "Я иду́ в ___.", fr: "Je vais dans ___." },
  },
  {
    id: "prep-acc-na",
    accepts: ["human", "animal", "object", "place", "area"],
    caseId: "accusative",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "на",
    meaningFr: "Mouvement vers une surface (\"sur\") ou \"regarder qqch\".",
    template: { ru: "Я смотрю́ на ___.", fr: "Je regarde ___." },
  },
  {
    id: "prep-acc-za",
    accepts: ["abstract", "object", "food", "drink"],
    caseId: "accusative",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "за",
    meaningFr: "\"En échange de\", \"merci pour\".",
    template: { ru: "Спаси́бо за ___.", fr: "Merci pour ___." },
  },
  {
    id: "prep-acc-cherez",
    accepts: ["place", "area"],
    caseId: "accusative",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "че́рез",
    meaningFr: "\"À travers\", \"en passant par\".",
    template: { ru: "Мы е́дем че́рез ___.", fr: "Nous passons par ___." },
  },
  {
    id: "prep-acc-pro",
    caseId: "accusative",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "про",
    meaningFr: "\"À propos de\" (familier, équivalent oral de о + prépositionnel).",
    template: { ru: "Расскажи́ мне про ___.", fr: "Raconte-moi à propos de ___." },
  },
  {
    id: "prep-acc-skvoz",
    accepts: ["object", "place", "area"],
    caseId: "accusative",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "сквозь",
    meaningFr: "\"À travers\" (sens physique, plus fort que че́рез).",
    template: { ru: "Я ви́жу свет сквозь ___.", fr: "Je vois la lumière à travers ___." },
  },
  {
    id: "prep-acc-nesmotrya-na",
    accepts: ["abstract"],
    caseId: "accusative",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "несмотря́ на",
    meaningFr: "\"Malgré\".",
    template: { ru: "Несмотря́ на ___, мы пошли́ гуля́ть.", fr: "Malgré ___, nous sommes sortis nous promener." },
  },

  // ─── Instrumental ───────────────────────────────────────────────
  {
    id: "prep-instr-s",
    accepts: ["human"],
    caseId: "instrumental",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "с",
    meaningFr: "Accompagnement, \"avec\".",
    template: { ru: "Я пью чай с ___.", fr: "Je bois du thé avec ___." },
  },
  {
    id: "prep-instr-pod",
    accepts: ["object", "place", "area"],
    caseId: "instrumental",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "под",
    meaningFr: "Lieu statique, \"sous\".",
    template: { ru: "Кот спит под ___.", fr: "Le chat dort sous ___." },
  },
  {
    id: "prep-instr-nad",
    accepts: ["object", "place", "area"],
    caseId: "instrumental",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "над",
    meaningFr: "Lieu statique, \"au-dessus de\".",
    template: { ru: "Ла́мпа виси́т над ___.", fr: "La lampe est suspendue au-dessus de ___." },
  },
  {
    id: "prep-instr-pered",
    accepts: ["object", "place", "area"],
    caseId: "instrumental",
    kind: "preposition",
    tier: "intermediate",
    article: "demonstrative",
    ru: "пе́ред",
    meaningFr: "Lieu statique, \"devant\".",
    template: { ru: "Мы встре́тимся пе́ред ___.", fr: "On se retrouve devant ___." },
  },
  {
    id: "expr-instr-rabotat",
    accepts: ["human"],
    caseId: "instrumental",
    kind: "expression",
    tier: "basic",
    article: "none", // « Il travaille comme juge » — un métier ne prend pas d'article
    ru: "рабо́тать +",
    meaningFr: "Métier, profession exercée.",
    template: { ru: "Он рабо́тает ___.", fr: "Il travaille comme ___." },
    number: "singular", // attribut du sujet « он » : « Он работает судьёй », pas « судьями »
  },
  {
    id: "expr-instr-stat",
    accepts: ["human"],
    caseId: "instrumental",
    kind: "expression",
    tier: "intermediate",
    article: "none", // « Il veut devenir médecin » — idem
    ru: "стать +",
    meaningFr: "Devenir quelque chose.",
    template: { ru: "Он хо́чет стать ___.", fr: "Il veut devenir ___." },
    number: "singular", // attribut du sujet « он »
  },
  {
    id: "verb-instr-yavlyatsya",
    accepts: ["abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "явля́ться",
    meaningFr: "\"Être, constituer\" (registre formel) se construit à l'instrumental.",
    template: { ru: "Э́то явля́ется ___.", fr: "Ceci constitue ___." },
    number: "singular", // attribut du sujet « это »
  },
  {
    id: "verb-instr-kazatsya",
    accepts: ["human", "abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "каза́ться",
    meaningFr: "\"Sembler être\" se construit à l'instrumental.",
    template: { ru: "Он ка́жется ___.", fr: "Il semble être ___." },
    number: "singular", // attribut du sujet « он »
  },
  {
    id: "verb-instr-schitatsya",
    accepts: ["human", "abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "advanced",
    article: "indefinite", // « Il est considéré comme un spécialiste »
    ru: "счита́ться",
    meaningFr: "\"Être considéré comme\" se construit à l'instrumental.",
    template: { ru: "Он счита́ется ___.", fr: "Il est considéré comme ___." },
    number: "singular", // attribut du sujet « он »
  },
  {
    id: "verb-instr-interesovatsya",
    accepts: ["abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "интересова́ться",
    meaningFr: "\"S'intéresser à\" se construit à l'instrumental.",
    template: { ru: "Я интересу́юсь ___.", fr: "Je m'intéresse à ___." },
  },
  {
    id: "verb-instr-gorditsya",
    accepts: ["human", "abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "горди́ться",
    meaningFr: "\"Être fier de\" se construit à l'instrumental.",
    template: { ru: "Я горжу́сь ___.", fr: "Je suis fier de ___." },
  },
  {
    id: "verb-instr-zanimatsya",
    accepts: ["abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "занима́ться",
    meaningFr: "\"Pratiquer, s'occuper de\" se construit à l'instrumental.",
    template: { ru: "Я занима́юсь ___.", fr: "Je pratique ___." },
  },
  {
    id: "verb-instr-uvlekatsya",
    accepts: ["abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "увлека́ться",
    meaningFr: "\"Être passionné par\" se construit à l'instrumental.",
    template: { ru: "Он увлека́ется ___.", fr: "Il est passionné par ___." },
  },
  {
    id: "verb-instr-polzovatsya",
    accepts: ["object", "text"],
    caseId: "instrumental",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "по́льзоваться",
    meaningFr: "\"Utiliser, se servir de\" se construit à l'instrumental.",
    template: { ru: "Я по́льзуюсь ___.", fr: "J'utilise ___." },
  },
  {
    id: "verb-instr-vladet",
    accepts: ["abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "владе́ть",
    meaningFr: "\"Maîtriser, posséder\" (une langue, un bien) se construit à l'instrumental.",
    template: { ru: "Я владе́ю ___.", fr: "Je maîtrise ___." },
  },
  {
    id: "verb-instr-upravlyat",
    accepts: ["human", "abstract", "place"],
    caseId: "instrumental",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "управля́ть",
    meaningFr: "\"Diriger, conduire\" se construit à l'instrumental.",
    template: { ru: "Он управля́ет ___.", fr: "Il dirige ___." },
  },
  {
    id: "verb-instr-voskhishchatsya",
    accepts: ["human", "abstract", "place", "area"],
    caseId: "instrumental",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "восхища́ться",
    meaningFr: "\"Admirer\" se construit à l'instrumental.",
    template: { ru: "Я восхища́юсь ___.", fr: "J'admire ___." },
  },
  {
    id: "verb-instr-riskovat",
    accepts: ["abstract"],
    caseId: "instrumental",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "рискова́ть",
    meaningFr: "\"Risquer\" se construit à l'instrumental.",
    template: { ru: "Не риску́й ___.", fr: "Ne risque pas ___." },
  },
  {
    id: "verb-instr-torgovat",
    accepts: ["object", "food", "drink"],
    caseId: "instrumental",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "торгова́ть",
    meaningFr: "\"Faire le commerce de\" se construit à l'instrumental.",
    template: { ru: "Он торгу́ет ___.", fr: "Il fait le commerce de ___." },
  },
  {
    id: "verb-instr-dorozhit",
    accepts: ["human", "abstract", "object"],
    caseId: "instrumental",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "дорожи́ть",
    meaningFr: "\"Tenir à, accorder de la valeur à\" se construit à l'instrumental.",
    template: { ru: "Я дорожу́ ___.", fr: "Je tiens à ___." },
  },

  // ─── Prépositionnel ─────────────────────────────────────────────
  // Par nature, seules 4 prépositions gouvernent ce cas (в, на, о, при) —
  // sa richesse vient des verbes, pas des prépositions.
  {
    id: "prep-prep-v",
    accepts: ["place"],
    caseId: "prepositional",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "в",
    meaningFr: "Lieu statique (\"dans\").",
    template: { ru: "Я живу́ в ___.", fr: "J'habite dans ___." },
  },
  {
    id: "prep-prep-na",
    accepts: ["place", "abstract"],
    caseId: "prepositional",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "на",
    meaningFr: "Lieu statique (\"sur\", \"à\").",
    template: { ru: "Я рабо́таю на ___.", fr: "Je travaille sur/à ___." },
  },
  {
    id: "prep-prep-o",
    caseId: "prepositional",
    kind: "preposition",
    tier: "basic",
    article: "demonstrative",
    ru: "о",
    meaningFr: "Sujet dont on parle, \"à propos de\".",
    template: { ru: "Я ду́маю о ___.", fr: "Je pense à ___." },
  },
  {
    id: "prep-prep-pri",
    accepts: ["place"],
    caseId: "prepositional",
    kind: "preposition",
    tier: "advanced",
    article: "demonstrative",
    ru: "при",
    meaningFr: "\"Rattaché à\", \"auprès de\".",
    template: { ru: "Библиоте́ка при ___.", fr: "La bibliothèque est rattachée à ___." },
  },
  {
    id: "expr-prep-nakhoditsya",
    accepts: ["place"],
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "находи́ться",
    meaningFr: "\"Se trouver\" (registre soutenu de \"être quelque part\") se construit avec в/на + prépositionnel.",
    template: { ru: "Дом нахо́дится в ___.", fr: "La maison se trouve dans ___." },
  },
  {
    id: "verb-prep-govorit",
    caseId: "prepositional",
    kind: "verb",
    tier: "basic",
    article: "demonstrative",
    ru: "говори́ть о",
    meaningFr: "\"Parler de\" se construit au prépositionnel.",
    template: { ru: "Мы говори́м о ___.", fr: "Nous parlons de ___." },
  },
  {
    id: "verb-prep-sporit",
    accepts: ["abstract"],
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "спо́рить о",
    meaningFr: "\"Discuter, se disputer à propos de\" se construit au prépositionnel.",
    template: { ru: "Мы спо́рим о ___.", fr: "Nous discutons de ___." },
  },
  {
    id: "verb-prep-mechtat",
    accepts: ["abstract", "object", "place", "area"],
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "мечта́ть о",
    meaningFr: "\"Rêver de\" se construit au prépositionnel.",
    template: { ru: "Я мечта́ю о ___.", fr: "Je rêve de ___." },
  },
  {
    id: "verb-prep-slyshat",
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "слы́шать о",
    meaningFr: "\"Entendre parler de\" se construit au prépositionnel.",
    template: { ru: "Я слы́шал о ___.", fr: "J'ai entendu parler de ___." },
  },
  {
    id: "verb-prep-chitat",
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "чита́ть о",
    meaningFr: "\"Lire à propos de\" se construit au prépositionnel.",
    template: { ru: "Я чита́ю о ___.", fr: "Je lis à propos de ___." },
  },
  {
    id: "verb-prep-znat",
    accepts: ["abstract"],
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "знать о",
    meaningFr: "\"Être au courant de\" se construit au prépositionnel.",
    template: { ru: "Я зна́ю о ___.", fr: "Je suis au courant de ___." },
  },
  {
    id: "verb-prep-rasskazyvat",
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "расска́зывать о",
    meaningFr: "\"Raconter à propos de\" se construit au prépositionnel.",
    template: { ru: "Расскажи́ мне о ___.", fr: "Parle-moi de ___." },
  },
  {
    id: "verb-prep-zabotitsya",
    accepts: ["human", "animal"],
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "забо́титься о",
    meaningFr: "\"S'occuper de, prendre soin de\" se construit au prépositionnel.",
    template: { ru: "Я забо́чусь о ___.", fr: "Je prends soin de ___." },
  },
  {
    id: "verb-prep-bespokoitsya",
    accepts: ["human", "abstract"],
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "беспоко́иться о",
    meaningFr: "\"S'inquiéter de\" se construit au prépositionnel.",
    template: { ru: "Я беспоко́юсь о ___.", fr: "Je m'inquiète pour ___." },
  },
  {
    id: "verb-prep-soobshchat",
    accepts: ["abstract"],
    caseId: "prepositional",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "сообща́ть о",
    meaningFr: "\"Informer de, annoncer\" se construit au prépositionnel.",
    template: { ru: "Я сообща́ю о ___.", fr: "J'informe de ___." },
  },
  {
    id: "verb-prep-vspominat",
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "вспомина́ть о",
    meaningFr: "\"Se souvenir de\" se construit au prépositionnel.",
    template: { ru: "Я вспомина́ю о ___.", fr: "Je me souviens de ___." },
  },
  {
    id: "verb-prep-upominat",
    accepts: ["human", "abstract"],
    caseId: "prepositional",
    kind: "verb",
    tier: "advanced",
    article: "demonstrative",
    ru: "упомина́ть о",
    meaningFr: "\"Mentionner\" se construit au prépositionnel.",
    template: { ru: "Я упомина́ю о ___.", fr: "Je mentionne ___." },
  },
  {
    id: "verb-prep-zhalet",
    accepts: ["abstract"],
    caseId: "prepositional",
    kind: "verb",
    tier: "intermediate",
    article: "demonstrative",
    ru: "жале́ть о",
    meaningFr: "\"Regretter\" se construit au prépositionnel.",
    template: { ru: "Я жале́ю о ___.", fr: "Je regrette ___." },
  },
];

/**
 * Toutes les phrases d'un déclencheur : la référence écrite à la main,
 * puis celles de la banque générée.
 *
 * POURQUOI DEUX SOURCES. Il n'y avait qu'UNE phrase par déclencheur, et le
 * mode « Phrase » servait `template.ru` tel quel : le nombre de phrases
 * qu'un apprenant pouvait voir sur une page valait donc le nombre de
 * déclencheurs du cas — cinq au nominatif. Sur cinquante exercices, une
 * phrase revenait seize fois.
 *
 * La référence reste dans triggers.ts, écrite et relue à la main : c'est
 * elle qu'on montre au modèle pour dire ce qu'on attend, c'est sur elle que
 * le garde-fou calibre son contrôle d'identité (voir expectedLexicalMark),
 * et c'est elle qui reste si la banque générée est vide. Les autres vivent
 * dans un fichier généré, comme la curation des noms.
 */
export function templatesFor(trigger: CaseTrigger): { ru: string; fr: string }[] {
  return [trigger.template, ...(TRIGGER_TEMPLATES[trigger.id] ?? [])];
}

export function triggersForCase(caseId: CaseId): CaseTrigger[] {
  return TRIGGERS.filter((t) => t.caseId === caseId);
}

export function getTrigger(id: string): CaseTrigger | undefined {
  return TRIGGERS.find((t) => t.id === id);
}

/**
 * Le nombre qu'un gabarit accepte, avec son défaut explicite.
 *
 * Un seul endroit lit le champ, pour que « absent = both » ne se réinvente
 * pas à chaque appelant — c'est exactement la façon dont l'ancien
 * `plural ?? false` s'était figé en « jamais de pluriel ».
 */
export function triggerNumber(trigger: CaseTrigger): TriggerNumber {
  return trigger.number ?? "both";
}

/** Ce déclencheur peut-il servir le nombre demandé ? */
export function triggerAllows(trigger: CaseTrigger, plural: boolean): boolean {
  const n = triggerNumber(trigger);
  return n === "both" || (plural ? n === "plural" : n === "singular");
}

/**
 * Le nombre RÉELLEMENT servi par ce déclencheur, une fois croisés le choix
 * de l'apprenant et ce que le gabarit supporte.
 *
 * La contrainte du gabarit gagne toujours : « несколько ___ » reste au
 * pluriel même si l'apprenant travaille le singulier, parce que l'autre
 * option est une phrase fausse. C'est aussi ce qui rend le sélecteur sûr
 * — il ne peut pas produire un exercice que la langue refuse.
 */
export function resolveNumber(trigger: CaseTrigger, wanted: boolean): boolean {
  const n = triggerNumber(trigger);
  if (n === "plural") return true;
  if (n === "singular") return false;
  return wanted;
}
