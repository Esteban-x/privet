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
    imperfective: "чита́ть", perfective: "прочита́ть", translation: "lire",
    transitive: true,
    activePresent: "чита́ющий", activePastImp: "чита́вший", activePastPerf: "прочита́вший",
    passivePast: "прочи́танный",
    passiveShort: { m: "прочи́тан", f: "прочи́тана", n: "прочи́тано", pl: "прочи́таны" },
    gerundImp: "чита́я", gerundPerf: "прочита́в",
  },
  {
    id: "pisat",
    imperfective: "писа́ть", perfective: "написа́ть", translation: "écrire",
    transitive: true,
    activePresent: "пи́шущий", activePastImp: "писа́вший", activePastPerf: "написа́вший",
    passivePast: "напи́санный",
    passiveShort: { m: "напи́сан", f: "напи́сана", n: "напи́сано", pl: "напи́саны" },
    // « пиша » n'est pas usuel : le trou est réel, on ne l'invente pas.
    gerundPerf: "написа́в",
  },
  {
    id: "stroit",
    imperfective: "стро́ить", perfective: "постро́ить", translation: "construire",
    transitive: true,
    activePresent: "стро́ящий", activePastImp: "стро́ивший", activePastPerf: "постро́ивший",
    passivePast: "постро́енный",
    passiveShort: { m: "постро́ен", f: "постро́ена", n: "постро́ено", pl: "постро́ены" },
    gerundImp: "стро́я", gerundPerf: "постро́ив",
  },
  {
    id: "otkryvat",
    imperfective: "открыва́ть", perfective: "откры́ть", translation: "ouvrir",
    transitive: true,
    activePresent: "открыва́ющий", activePastImp: "открыва́вший", activePastPerf: "откры́вший",
    passivePast: "откры́тый",
    passiveShort: { m: "откры́т", f: "откры́та", n: "откры́то", pl: "откры́ты" },
    gerundImp: "открыва́я", gerundPerf: "откры́в",
  },
  {
    id: "zakryvat",
    imperfective: "закрыва́ть", perfective: "закры́ть", translation: "fermer",
    transitive: true,
    activePresent: "закрыва́ющий", activePastImp: "закрыва́вший", activePastPerf: "закры́вший",
    passivePast: "закры́тый",
    passiveShort: { m: "закры́т", f: "закры́та", n: "закры́то", pl: "закры́ты" },
    gerundImp: "закрыва́я", gerundPerf: "закры́в",
  },
  {
    id: "delat",
    imperfective: "де́лать", perfective: "сде́лать", translation: "faire",
    transitive: true,
    activePresent: "де́лающий", activePastImp: "де́лавший", activePastPerf: "сде́лавший",
    passivePast: "сде́ланный",
    passiveShort: { m: "сде́лан", f: "сде́лана", n: "сде́лано", pl: "сде́ланы" },
    gerundImp: "де́лая", gerundPerf: "сде́лав",
  },
  {
    id: "reshat",
    imperfective: "реша́ть", perfective: "реши́ть", translation: "résoudre",
    transitive: true,
    activePresent: "реша́ющий", activePastImp: "реша́вший", activePastPerf: "реши́вший",
    passivePast: "решённый",
    passiveShort: { m: "решён", f: "решена́", n: "решено́", pl: "решены́" },
    gerundImp: "реша́я", gerundPerf: "реши́в",
  },
  {
    id: "poluchat",
    imperfective: "получа́ть", perfective: "получи́ть", translation: "recevoir",
    transitive: true,
    activePresent: "получа́ющий", activePastImp: "получа́вший", activePastPerf: "получи́вший",
    passivePast: "полу́ченный",
    passiveShort: { m: "полу́чен", f: "полу́чена", n: "полу́чено", pl: "полу́чены" },
    gerundImp: "получа́я", gerundPerf: "получи́в",
  },
  {
    id: "gotovit",
    imperfective: "гото́вить", perfective: "пригото́вить", translation: "préparer",
    transitive: true,
    activePresent: "гото́вящий", activePastImp: "гото́вивший", activePastPerf: "пригото́вивший",
    passivePast: "пригото́вленный",
    passiveShort: { m: "пригото́влен", f: "пригото́влена", n: "пригото́влено", pl: "пригото́влены" },
    gerundImp: "гото́вя", gerundPerf: "пригото́вив",
  },
  {
    id: "izuchat",
    imperfective: "изуча́ть", perfective: "изучи́ть", translation: "étudier",
    transitive: true,
    activePresent: "изуча́ющий", activePastImp: "изуча́вший", activePastPerf: "изучи́вший",
    passivePast: "изу́ченный",
    passiveShort: { m: "изу́чен", f: "изу́чена", n: "изу́чено", pl: "изу́чены" },
    gerundImp: "изуча́я", gerundPerf: "изучи́в",
  },
  {
    id: "zakanchivat",
    imperfective: "зака́нчивать", perfective: "зако́нчить", translation: "terminer",
    transitive: true,
    activePresent: "зака́нчивающий", activePastImp: "зака́нчивавший", activePastPerf: "зако́нчивший",
    passivePast: "зако́нченный",
    passiveShort: { m: "зако́нчен", f: "зако́нчена", n: "зако́нчено", pl: "зако́нчены" },
    gerundImp: "зака́нчивая", gerundPerf: "зако́нчив",
  },
  {
    id: "govorit",
    imperfective: "говори́ть", perfective: "сказа́ть", translation: "parler, dire",
    transitive: true,
    activePresent: "говоря́щий", activePastImp: "говори́вший", activePastPerf: "сказа́вший",
    passivePast: "ска́занный",
    passiveShort: { m: "ска́зан", f: "ска́зана", n: "ска́зано", pl: "ска́заны" },
    gerundImp: "говоря́", gerundPerf: "сказа́в",
  },

  // ─── Intransitifs : pas de participe passif, le champ reste vide ──
  {
    id: "rabotat",
    imperfective: "рабо́тать", translation: "travailler",
    transitive: false,
    activePresent: "рабо́тающий", activePastImp: "рабо́тавший",
    gerundImp: "рабо́тая",
  },
  {
    id: "zhit",
    imperfective: "жить", translation: "vivre, habiter",
    transitive: false,
    activePresent: "живу́щий", activePastImp: "жи́вший",
    gerundImp: "живя́",
  },
  {
    id: "vozvrashchatsya",
    imperfective: "возвраща́ться", perfective: "верну́ться", translation: "revenir, rentrer",
    transitive: false,
    activePresent: "возвраща́ющийся", activePastImp: "возвраща́вшийся", activePastPerf: "верну́вшийся",
    gerundImp: "возвраща́ясь", gerundPerf: "верну́вшись",
  },
  {
    id: "pomogat",
    imperfective: "помога́ть", perfective: "помо́чь", translation: "aider",
    transitive: false,
    activePresent: "помога́ющий", activePastImp: "помога́вший", activePastPerf: "помо́гший",
    // « помогши » est sorti de l'usage : pas de gérondif perfectif ici.
    gerundImp: "помога́я",
  },
  {
    id: "idti",
    imperfective: "идти́", perfective: "прийти́", translation: "aller, venir",
    transitive: false,
    activePresent: "иду́щий", activePastImp: "ше́дший", activePastPerf: "прише́дший",
    gerundPerf: "придя́",
  },
];

export function getVerb(id: string): ParticipleVerb | undefined {
  return PARTICIPLE_VERBS.find((v) => v.id === id);
}
