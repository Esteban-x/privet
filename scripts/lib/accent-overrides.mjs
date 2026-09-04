/**
 * Les homographes et les formes absentes du dictionnaire, tranchés à la main.
 *
 * PARTAGÉ, et pas recopié : deux scripts posent des accents — celui qui
 * traite un fichier de banque (scripts/accent.mjs) et celui qui écrit les
 * phrases des déclencheurs (scripts/curate-templates.mjs). Deux tables
 * auraient divergé, et l'une des deux aurait accentué « по́сле » quand
 * l'autre refusait la phrase entière faute de savoir.
 */
/**
 * Les mots que le dictionnaire ne peut pas trancher, tranchés à la main.
 *
 * Deux familles : les HOMOGRAPHES, dont seule la phrase décide (« до́ма » à
 * la maison / « дома́ » des maisons), et les FORMES ABSENTES du dictionnaire
 * — participes, gérondifs, et les distracteurs volontairement inexistants
 * que certains QCM proposent.
 *
 * Chaque entrée a été décidée en lisant l'item qui l'emploie. Une entrée
 * ajoutée sans ce travail vaut moins que pas d'entrée du tout.
 */
export const ACCENT_OVERRIDES = {
  // Homographes
  "вода": "вода́",
  "дела": "дела́",
  "дома": "до́ма",
  "сестры": "сестры́",
  "еду": "е́ду",
  "большая": "больша́я",
  "воды": "воды́",
  "уже": "уже́",
  "другом": "дру́гом",
  "помочь": "помо́чь",
  "потом": "пото́м",
  "дабы": "да́бы",
  "часа": "часа́",
  "после": "по́сле",
  "мало": "ма́ло",
  "пошли": "пошли́",
  "почту": "по́чту",
  "берегу": "бе́регу",
  "начался": "начался́",
  "окна": "окна́",
  "двери": "две́ри",
  "парка": "па́рка",
  "парку": "па́рку",
  "дороги": "доро́ги",
  "поезда": "по́езда",
  "стоит": "стои́т",
  "году": "году́",
  "письма": "пи́сьма",
  "матери": "ма́тери",
  "пили": "пи́ли",
  // Absents du dictionnaire
  "буду": "бу́ду",
  "французски": "францу́зски",
  "Анна": "А́нна",
  "нашем": "на́шем",
  "просыпаю": "просыпа́ю",
  "проснуть": "просну́ть",
  "читающий": "чита́ющий",
  "читая": "чита́я",
  "написавший": "написа́вший",
  "написанная": "напи́санная",
  "написав": "написа́в",
  "возвращаясь": "возвраща́ясь",
  "построен": "постро́ен",
  "преподанный": "пре́поданный",
  "заканчивая": "зака́нчивая",
  "закончив": "зако́нчив",
  "помогающий": "помога́ющий",
  "помогавший": "помога́вший",
  "помогая": "помога́я",
  "помогаемый": "помога́емый",
  "него": "него́",
  "баклуши": "баклу́ши",
  "кого": "кого́",
  "решены": "решены́",
  "придя": "придя́",
  "готовя": "гото́вя",
  "достоин": "досто́ин",
  "иканье": "и́канье",
  "пришедши": "прише́дши",
  "выключен": "вы́ключен",
  "войдя": "войдя́",
  "ожидая": "ожида́я",
  "слушая": "слу́шая",
  "сделаны": "сде́ланы",
  "открыв": "откры́в",
  "приехав": "прие́хав",
};
