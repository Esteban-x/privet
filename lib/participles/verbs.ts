/**
 * Participes et gérondifs russes — le dernier domaine que le test de
 * placement mesure sans que l'app l'entraîne.
 *
 * POURQUOI PAS DE SCHÉMA ICI. Les verbes de mouvement se dessinent (un
 * trajet a une forme), l'aspect aussi (un événement a une forme dans le
 * temps). Un participe, non : c'est une SUBORDONNÉE COMPRIMÉE.
 *
 *   Челове́к, кото́рый чита́ет кни́гу   →   челове́к, чита́ющий кни́гу
 *   Кни́га, кото́рую написа́л Толсто́й   →   кни́га, напи́санная Толсты́м
 *   Когда́ он зако́нчил рабо́ту, он ушёл  →  Зако́нчив рабо́ту, он ушёл
 *
 * Ça ne se regarde pas, ça se manipule. Le module est donc bâti sur la
 * transformation : on montre la proposition dépliée, l'apprenant produit la
 * forme comprimée — et l'inverse pour vérifier qu'il l'a comprise.
 *
 * DONNÉES, PAS RÈGLES. Les formes s'obtiennent par des règles… qui ont
 * toutes leurs exceptions : писа́ть n'a pas de gérondif imperfectif usuel,
 * помо́чь pas de gérondif perfectif moderne, les verbes intransitifs pas de
 * participe passif. Ces trous sont EXPLICITES dans la donnée — les rendre
 * optionnels évite de fabriquer des formes que personne n'emploie.
 */

export interface ShortForms {
  m: string;
  f: string;
  n: string;
  pl: string;
}

export interface ParticipleVerb {
  id: string;
  imperfective: string;
  /** Absent : verbe sans partenaire perfectif usuel dans ce module. */
  perfective?: string;
  translation: string;
  /** Un intransitif n'a pas de participe passif : le champ reste vide. */
  transitive: boolean;

  /** Participe présent actif — imperfectif seulement (celui qui fait). */
  activePresent: string;
  /** Participe passé actif, imperfectif (celui qui faisait). */
  activePastImp: string;
  /** Participe passé actif, perfectif (celui qui a fait). */
  activePastPerf?: string;

  /** Participe passé passif, forme longue (ce qui a été fait). */
  passivePast?: string;
  /** Forme COURTE du participe passif, employée comme attribut. */
  passiveShort?: ShortForms;

  /** Gérondif imperfectif : action simultanée. */
  gerundImp?: string;
  /** Gérondif perfectif : action antérieure. */
  gerundPerf?: string;
}

export const PARTICIPLE_VERBS: ParticipleVerb[] = [
  {
    id: "chitat",
    imperfective: "читать", perfective: "прочитать", translation: "lire",
    transitive: true,
    activePresent: "читающий", activePastImp: "читавший", activePastPerf: "прочитавший",
    passivePast: "прочитанный",
    passiveShort: { m: "прочитан", f: "прочитана", n: "прочитано", pl: "прочитаны" },
    gerundImp: "читая", gerundPerf: "прочитав",
  },
  {
    id: "pisat",
    imperfective: "писать", perfective: "написать", translation: "écrire",
    transitive: true,
    activePresent: "пишущий", activePastImp: "писавший", activePastPerf: "написавший",
    passivePast: "написанный",
    passiveShort: { m: "написан", f: "написана", n: "написано", pl: "написаны" },
    // « пиша » n'est pas usuel : le trou est réel, on ne l'invente pas.
    gerundPerf: "написав",
  },
  {
    id: "stroit",
    imperfective: "строить", perfective: "построить", translation: "construire",
    transitive: true,
    activePresent: "строящий", activePastImp: "строивший", activePastPerf: "построивший",
    passivePast: "построенный",
    passiveShort: { m: "построен", f: "построена", n: "построено", pl: "построены" },
    gerundImp: "строя", gerundPerf: "построив",
  },
  {
    id: "otkryvat",
    imperfective: "открывать", perfective: "открыть", translation: "ouvrir",
    transitive: true,
    activePresent: "открывающий", activePastImp: "открывавший", activePastPerf: "открывший",
    passivePast: "открытый",
    passiveShort: { m: "открыт", f: "открыта", n: "открыто", pl: "открыты" },
    gerundImp: "открывая", gerundPerf: "открыв",
  },
  {
    id: "zakryvat",
    imperfective: "закрывать", perfective: "закрыть", translation: "fermer",
    transitive: true,
    activePresent: "закрывающий", activePastImp: "закрывавший", activePastPerf: "закрывший",
    passivePast: "закрытый",
    passiveShort: { m: "закрыт", f: "закрыта", n: "закрыто", pl: "закрыты" },
    gerundImp: "закрывая", gerundPerf: "закрыв",
  },
  {
    id: "delat",
    imperfective: "делать", perfective: "сделать", translation: "faire",
    transitive: true,
    activePresent: "делающий", activePastImp: "делавший", activePastPerf: "сделавший",
    passivePast: "сделанный",
    passiveShort: { m: "сделан", f: "сделана", n: "сделано", pl: "сделаны" },
    gerundImp: "делая", gerundPerf: "сделав",
  },
  {
    id: "reshat",
    imperfective: "решать", perfective: "решить", translation: "résoudre",
    transitive: true,
    activePresent: "решающий", activePastImp: "решавший", activePastPerf: "решивший",
    passivePast: "решённый",
    passiveShort: { m: "решён", f: "решена", n: "решено", pl: "решены" },
    gerundImp: "решая", gerundPerf: "решив",
  },
  {
    id: "poluchat",
    imperfective: "получать", perfective: "получить", translation: "recevoir",
    transitive: true,
    activePresent: "получающий", activePastImp: "получавший", activePastPerf: "получивший",
    passivePast: "полученный",
    passiveShort: { m: "получен", f: "получена", n: "получено", pl: "получены" },
    gerundImp: "получая", gerundPerf: "получив",
  },
  {
    id: "gotovit",
    imperfective: "готовить", perfective: "приготовить", translation: "préparer",
    transitive: true,
    activePresent: "готовящий", activePastImp: "готовивший", activePastPerf: "приготовивший",
    passivePast: "приготовленный",
    passiveShort: { m: "приготовлен", f: "приготовлена", n: "приготовлено", pl: "приготовлены" },
    gerundImp: "готовя", gerundPerf: "приготовив",
  },
  {
    id: "izuchat",
    imperfective: "изучать", perfective: "изучить", translation: "étudier",
    transitive: true,
    activePresent: "изучающий", activePastImp: "изучавший", activePastPerf: "изучивший",
    passivePast: "изученный",
    passiveShort: { m: "изучен", f: "изучена", n: "изучено", pl: "изучены" },
    gerundImp: "изучая", gerundPerf: "изучив",
  },
  {
    id: "zakanchivat",
    imperfective: "заканчивать", perfective: "закончить", translation: "terminer",
    transitive: true,
    activePresent: "заканчивающий", activePastImp: "заканчивавший", activePastPerf: "закончивший",
    passivePast: "законченный",
    passiveShort: { m: "закончен", f: "закончена", n: "закончено", pl: "закончены" },
    gerundImp: "заканчивая", gerundPerf: "закончив",
  },
  {
    id: "govorit",
    imperfective: "говорить", perfective: "сказать", translation: "parler, dire",
    transitive: true,
    activePresent: "говорящий", activePastImp: "говоривший", activePastPerf: "сказавший",
    passivePast: "сказанный",
    passiveShort: { m: "сказан", f: "сказана", n: "сказано", pl: "сказаны" },
    gerundImp: "говоря", gerundPerf: "сказав",
  },

  // ─── Intransitifs : pas de participe passif, le champ reste vide ──
  {
    id: "rabotat",
    imperfective: "работать", translation: "travailler",
    transitive: false,
    activePresent: "работающий", activePastImp: "работавший",
    gerundImp: "работая",
  },
  {
    id: "zhit",
    imperfective: "жить", translation: "vivre, habiter",
    transitive: false,
    activePresent: "живущий", activePastImp: "живший",
    gerundImp: "живя",
  },
  {
    id: "vozvrashchatsya",
    imperfective: "возвращаться", perfective: "вернуться", translation: "revenir, rentrer",
    transitive: false,
    activePresent: "возвращающийся", activePastImp: "возвращавшийся", activePastPerf: "вернувшийся",
    gerundImp: "возвращаясь", gerundPerf: "вернувшись",
  },
  {
    id: "pomogat",
    imperfective: "помогать", perfective: "помочь", translation: "aider",
    transitive: false,
    activePresent: "помогающий", activePastImp: "помогавший", activePastPerf: "помогший",
    // « помогши » est sorti de l'usage : pas de gérondif perfectif ici.
    gerundImp: "помогая",
  },
  {
    id: "idti",
    imperfective: "идти", perfective: "прийти", translation: "aller, venir",
    transitive: false,
    activePresent: "идущий", activePastImp: "шедший", activePastPerf: "пришедший",
    gerundPerf: "придя",
  },
];

export function getVerb(id: string): ParticipleVerb | undefined {
  return PARTICIPLE_VERBS.find((v) => v.id === id);
}
