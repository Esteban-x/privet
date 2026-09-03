import type { Unit } from "../types";

/**
 * Unité 12 — la phrase : ordre des mots, constructions sans sujet, négation,
 * passif, comparaison et subordination.
 */
export const UNIT_SYNTAXE: Unit = {
  slug: "syntaxe",
  title: "La phrase",
  titleRu: "Синтаксис",
  subtitle:
    "Ordre des mots, phrases sans sujet, négation, passif, comparaison et propositions subordonnées.",
  color: "#4a63d6",
  lessons: [
    {
      slug: "ordre-des-mots",
      title: "L'ordre des mots",
      titleRu: "Порядок слов",
      level: "B1",
      minutes: 10,
      summary:
        "Il est libre, mais pas arbitraire : ce qui est connu se met devant, ce qui est nouveau se met à la fin.",
      keywords: ["ordre des mots", "порядок слов", "thème", "rhème", "emphase", "информация"],
      sections: [
        {
          kind: "prose",
          body: [
            "Comme les terminaisons portent la fonction, la position des mots est libre de servir à autre chose : elle porte l'INFORMATION. Le principe est constant — le connu d'abord, le nouveau ensuite.",
            "Ce que les linguistes appellent le thème (ce dont on parle) ouvre la phrase ; le rhème (ce qu'on en dit de neuf) la ferme. La dernière place est donc la place forte.",
          ],
        },
        {
          kind: "examples",
          title: "Une phrase, quatre messages",
          items: [
            {
              ru: "Ма́ша купи́ла кни́гу вчера́.",
              fr: "Macha a acheté un livre hier.",
              note: "neutre : information nouvelle = « hier »",
            },
            {
              ru: "Вчера́ Ма́ша купи́ла кни́гу.",
              fr: "Hier, Macha a acheté un livre.",
              note: "on parlait d'hier ; la nouveauté est l'achat",
            },
            {
              ru: "Кни́гу купи́ла Ма́ша.",
              fr: "C'est Macha qui a acheté le livre.",
              note: "on parlait du livre ; la nouveauté est l'acheteuse",
            },
            {
              ru: "Кни́гу Ма́ша купи́ла вчера́.",
              fr: "Le livre, Macha l'a acheté hier.",
              note: "thème antéposé, comme la dislocation française",
            },
          ],
        },
        {
          kind: "prose",
          title: "Ce que le français fait autrement",
          body: [
            "Le français, qui ne peut pas déplacer ses mots sans changer les fonctions, met en relief avec « c'est… qui », « quant à », ou l'intonation. Le russe déplace, tout simplement.",
            "Corollaire : traduire l'ordre des mots français en russe donne des phrases correctes mais mal orientées, qui insistent sur le mauvais élément. Il faut se demander à chaque phrase : qu'est-ce qui est neuf ici ?",
          ],
        },
        {
          kind: "table",
          title: "Quelques positions fixes",
          head: ["Élément", "Position", "Exemple"],
          rows: [
            ["Adjectif épithète", "avant le nom", "но́вая кни́га"],
            ["не", "juste avant le mot nié", "не сего́дня"],
            ["Particule ли", "après le mot interrogé", "Зна́ешь ли ты?"],
            ["же, ведь, бы", "en deuxième position (clitiques)", "Я бы пошёл."],
            ["Adverbe de manière", "souvent avant le verbe", "Он бы́стро отве́тил."],
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le connu d'abord, le nouveau à la fin.",
            "La dernière place est la place accentuée.",
            "L'adjectif reste avant son nom, не avant le mot nié.",
            "Ne pas décalquer l'ordre français : réorienter selon l'information.",
          ],
        },
      ],
    },
    {
      slug: "phrases-impersonnelles",
      title: "Les phrases sans sujet",
      titleRu: "Безличные предложения",
      level: "B1",
      minutes: 9,
      summary:
        "Тут хо́лодно, Меня́ тошни́т, Говоря́т, что… : le russe se passe volontiers de sujet, là où le français invente « il » ou « on ».",
      keywords: ["impersonnel", "безличные", "холодно", "говорят", "sans sujet"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le français a besoin d'un sujet grammatical, quitte à l'inventer : « il pleut », « on dit ». Le russe peut construire une phrase complète sans aucun sujet, et le fait très souvent.",
            "Trois types dominent : l'ADVERBE prédicatif (Хо́лодно), la 3ᵉ personne du PLURIEL sans pronom (Говоря́т…), et le verbe impersonnel au NEUTRE (Мне не спи́тся).",
          ],
        },
        {
          kind: "table",
          title: "Les trois constructions",
          head: ["Type", "Forme", "Exemple", "Français"],
          rows: [
            ["Adverbe prédicatif", "mot en -о", "Здесь хо́лодно.", "Il fait froid ici."],
            ["Adverbe + datif", "datif + mot en -о", "Мне гру́стно.", "Je suis triste."],
            ["3ᵉ pers. plur.", "verbe sans pronom", "Говоря́т, он уе́хал.", "On dit qu'il est parti."],
            ["Verbe au neutre", "verbe en -ся ou -ло", "Мне не спи́тся.", "Je n'arrive pas à dormir."],
            ["Génitif d'absence", "нет + génitif", "Вре́мени нет.", "Il n'y a pas de temps."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Сего́дня о́чень жа́рко.", fr: "Il fait très chaud aujourd'hui." },
            { ru: "Мне ску́чно.", fr: "Je m'ennuie." },
            { ru: "В Росси́и мно́го чита́ют.", fr: "On lit beaucoup en Russie.", note: "3ᵉ personne du pluriel = « on »" },
            { ru: "Здесь не ку́рят.", fr: "Ici, on ne fume pas." },
            { ru: "Меня́ зно́бит.", fr: "J'ai des frissons.", note: "l'accusatif pour les sensations physiques" },
          ],
        },
        {
          kind: "prose",
          title: "Le passé et le futur des impersonnelles",
          body: [
            "Ces phrases se conjuguent malgré l'absence de sujet, avec бы́ло et бу́дет au neutre : Мне бы́ло хо́лодно, Мне бу́дет ску́чно, Здесь бы́ло краси́во.",
            "L'ordre habituel place le datif en tête, puisqu'il est le thème : Мне хо́лодно plutôt que Хо́лодно мне, qui insisterait sur « à moi ».",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Une phrase russe n'a pas besoin de sujet grammatical.",
            "Adverbe en -о + datif : la sensation et l'état.",
            "3ᵉ personne du pluriel sans pronom = « on ».",
            "Passé et futur : бы́ло / бу́дет au neutre.",
          ],
        },
      ],
    },
    {
      slug: "datif-sujet",
      title: "Le datif de la personne concernée",
      titleRu: "Дательный субъекта",
      level: "B1",
      minutes: 8,
      summary:
        "Мне нра́вится, мне на́до, мне ка́жется : quand le russe met au datif celui que le français met en sujet.",
      keywords: ["datif", "нравится", "кажется", "хочется", "удалось", "sujet logique"],
      sections: [
        {
          kind: "prose",
          body: [
            "Une famille entière de constructions place la personne au datif : elle subit l'état, elle en est le siège, mais elle n'agit pas. Grammaticalement, elle n'est pas sujet — d'où le nom de « sujet logique ».",
            "Cette conception a une conséquence de sens : ce qui arrive à la personne lui arrive de l'extérieur. Мне не спи́тся ne dit pas « je ne dors pas » mais « ça ne dort pas en moi » : je n'y suis pour rien.",
          ],
        },
        {
          kind: "table",
          title: "Les constructions en datif",
          head: ["Construction", "Exemple", "Français"],
          rows: [
            ["нра́виться", "Мне нра́вится Москва́.", "J'aime Moscou."],
            ["каза́ться", "Мне ка́жется, что…", "Il me semble que…"],
            ["хоте́ться", "Мне хо́чется спать.", "J'ai envie de dormir."],
            ["удава́ться / уда́ться", "Мне удало́сь найти́.", "J'ai réussi à trouver."],
            ["на́до / ну́жно", "Мне на́до идти́.", "Je dois y aller."],
            ["adverbe d'état", "Ему́ пло́хо.", "Il ne va pas bien."],
            ["âge", "Ей два́дцать лет.", "Elle a vingt ans."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Мне нра́вятся ру́сские фи́льмы.", fr: "J'aime les films russes.", note: "le verbe s'accorde avec фи́льмы" },
            { ru: "Ему́ удало́сь сдать экза́мен.", fr: "Il a réussi à passer l'examen." },
            { ru: "Нам ну́жно поговори́ть.", fr: "Nous devons parler." },
            { ru: "Тебе́ не ка́жется, что уже́ по́здно?", fr: "Tu ne trouves pas qu'il est tard ?" },
          ],
        },
        {
          kind: "pitfall",
          title: "Accorder le verbe avec le bon mot",
          body: [
            "Dans Мне нра́вится э́та кни́га, le sujet est кни́га : le verbe s'accorde avec elle, pas avec « moi ». Au pluriel, il devient нра́вятся : Мне нра́вятся э́ти кни́ги.",
            "L'erreur classique du francophone est de figer нра́вится au singulier, comme s'il s'agissait d'une forme impersonnelle. Elle ne l'est pas : c'est un verbe ordinaire avec un sujet inhabituel.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le datif désigne celui qui éprouve, pas celui qui agit.",
            "нра́виться s'accorde avec la chose aimée.",
            "хоте́ться, каза́ться, удава́ться suivent le même schéma.",
            "L'état extérieur explique le sens : ça m'arrive, je ne le fais pas.",
          ],
        },
      ],
    },
    {
      slug: "negation-et-genitif",
      title: "Négation et génitif",
      titleRu: "Отрицание и родительный падеж",
      level: "B2",
      minutes: 9,
      summary:
        "Nier fait souvent basculer l'objet à l'accusatif vers le génitif — et le sujet aussi, dans les phrases d'absence.",
      keywords: ["négation", "génitif", "нет", "не было", "ни", "объект"],
      sections: [
        {
          kind: "prose",
          body: [
            "Deux règles distinctes se cachent derrière « négation + génitif ». La première concerne l'OBJET d'un verbe nié : Я чита́ю кни́гу → Я не чита́ю книг. La seconde concerne le SUJET d'une phrase d'existence : Есть вре́мя → Нет вре́мени.",
            "La seconde est obligatoire, la première dépend du degré de détermination de l'objet.",
          ],
        },
        {
          kind: "table",
          title: "Objet : génitif ou accusatif ?",
          head: ["Facteur", "Génitif", "Accusatif"],
          rows: [
            ["Détermination", "objet indéfini, générique", "objet précis, connu"],
            ["Exemple", "Я не ви́жу разни́цы.", "Я не ви́дел э́тот фильм."],
            ["Abstrait / concret", "abstrait : не име́ет значе́ния", "concret : не купи́л маши́ну"],
            ["Portée", "la négation nie l'existence", "la négation nie l'action"],
          ],
        },
        {
          kind: "prose",
          title: "L'absence : нет, не́ было, не бу́дет",
          body: [
            "Pour dire qu'une chose n'est pas là, le russe emploie нет au présent, не́ было au passé et не бу́дет au futur, toujours suivis du GÉNITIF, et toujours au neutre singulier — même si ce qui manque est au pluriel.",
            "Его́ нет до́ма (il n'est pas à la maison), Вчера́ его́ не́ было (hier il n'était pas là), За́втра его́ не бу́дет (demain il ne sera pas là). Noter не́ было, accentué sur не.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "У меня́ нет вре́мени.", fr: "Je n'ai pas le temps." },
            { ru: "В го́роде не́ было воды́ три дня.", fr: "La ville a été privée d'eau pendant trois jours." },
            { ru: "На у́лице никого́ не́ было.", fr: "Il n'y avait personne dehors." },
            { ru: "Я не ви́дел э́того фи́льма.", fr: "Je n'ai pas vu ce film.", note: "génitif : le film n'entre pas dans mon expérience" },
            { ru: "Ни оди́н челове́к не отве́тил.", fr: "Pas une personne n'a répondu." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Absence : нет / не́ было / не бу́дет + génitif, toujours au neutre.",
            "Objet nié : génitif si indéfini, accusatif si déterminé.",
            "ни… ни… renforce la négation, avec не sur le verbe.",
            "не́ было porte l'accent sur не.",
          ],
        },
      ],
      practice: [{ href: "/cases/genitive", label: "Exercice : le génitif" }],
    },
    {
      slug: "il-y-a-et-l-existence",
      title: "Il y a, il n'y a pas",
      titleRu: "Есть и нет",
      level: "A2",
      minutes: 9,
      summary:
        "Есть affirme l'existence, нет la nie, et l'ordre des mots dit s'il s'agit d'exister ou de se trouver quelque part.",
      keywords: ["есть", "нет", "il y a", "существование", "находится", "существует"],
      sections: [
        {
          kind: "prose",
          body: [
            "« Il y a » se rend par есть quand on affirme l'existence : В го́роде есть музе́й. Le lieu vient en tête (c'est le thème), et ce qui existe vient à la fin (c'est le rhème).",
            "Si l'existence est acquise et qu'on parle de la localisation, есть disparaît et l'ordre change : Музе́й в це́нтре го́рода (le musée est au centre). Le nouveau, cette fois, c'est le lieu.",
          ],
        },
        {
          kind: "table",
          title: "Trois questions, trois formes",
          head: ["Question", "Réponse type", "Ce qui est neuf"],
          rows: [
            ["Что здесь есть?", "Здесь есть апте́ка.", "ce qui existe"],
            ["Где апте́ка?", "Апте́ка на углу́.", "le lieu"],
            ["Апте́ка откры́та?", "Апте́ка закры́та.", "l'état"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "В на́шем го́роде есть университе́т.", fr: "Il y a une université dans notre ville." },
            { ru: "Университе́т нахо́дится в це́нтре.", fr: "L'université se trouve au centre.", note: "находи́ться : le verbe de localisation" },
            { ru: "Здесь нет апте́ки.", fr: "Il n'y a pas de pharmacie ici." },
            { ru: "У вас есть свобо́дные номера́?", fr: "Avez-vous des chambres libres ?" },
          ],
        },
        {
          kind: "pitfall",
          title: "Sous la négation, le sujet disparaît",
          body: [
            "Здесь есть апте́ка devient Здесь нет апте́ки, jamais « Здесь нет апте́ка ». Ce qui n'existe pas passe au génitif et cesse d'être sujet : la phrase n'a plus de sujet du tout, нет est invariable, et il n'y a plus rien avec quoi accorder quoi que ce soit.",
            "Au passé et au futur, le verbe reste donc impersonnel, au neutre singulier, quel que soit le genre du nom : Здесь не́ было апте́ки, Здесь не бу́дет апте́ки — jamais « не была́ », même pour un féminin. C'est l'erreur la plus tenace du francophone, parce que le français garde son sujet d'un bout à l'autre : « la pharmacie n'était pas là ».",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "есть affirme l'existence ; il tombe quand on décrit ou localise.",
            "нет + génitif nie l'existence.",
            "Le lieu ouvre la phrase quand ce qui existe est nouveau.",
            "находи́ться sert à localiser ce dont l'existence est acquise.",
          ],
        },
      ],
    },
    {
      slug: "voix-passive",
      title: "La voix passive",
      titleRu: "Страдательный залог",
      level: "B2",
      minutes: 9,
      summary:
        "Deux passifs qui ne se remplacent pas : le verbe en -ся pour le processus, le participe court pour le résultat.",
      keywords: ["passif", "страдательный", "-ся", "построен", "агент", "инструменталь"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe forme le passif de deux manières, et la répartition suit l'aspect. IMPERFECTIF : verbe + -ся, pour un processus en cours ou répété (Дом стро́ится — la maison est en construction). PERFECTIF : participe passif court, pour un résultat (Дом постро́ен — la maison est construite).",
            "L'agent, quand on le mentionne, se met à l'INSTRUMENTAL : Дом постро́ен изве́стным архите́ктором. Cette construction appartient à l'écrit ; à l'oral, on préfère une phrase active.",
          ],
        },
        {
          kind: "table",
          title: "Actif, passif, impersonnel",
          head: ["Construction", "Exemple", "Registre"],
          rows: [
            ["Actif", "Рабо́чие стро́ят дом.", "neutre"],
            ["Passif imperfectif (-ся)", "Дом стро́ится рабо́чими.", "écrit"],
            ["Passif perfectif (participe)", "Дом постро́ен.", "courant"],
            ["3ᵉ pers. plur. impersonnelle", "Дом стро́ят.", "oral, très fréquent"],
          ],
          note: "La quatrième ligne est la vraie solution de la langue parlée : on ne dit pas qui fait, et personne ne s'en formalise.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́тот вопро́с реша́ется в Москве́.", fr: "Cette question se règle à Moscou." },
            { ru: "Пробле́ма решена́.", fr: "Le problème est résolu." },
            { ru: "Кни́га напи́сана изве́стным писа́телем.", fr: "Le livre est écrit par un auteur connu." },
            { ru: "Здесь стро́ят но́вую шко́лу.", fr: "On construit une nouvelle école ici.", note: "solution orale : 3ᵉ personne du pluriel" },
          ],
        },
        {
          kind: "pitfall",
          title: "Le passif français se traduit rarement par un passif",
          body: [
            "« Ce livre a été traduit en dix langues » se dira le plus souvent Э́ту кни́гу перевели́ на де́сять языко́в — un actif impersonnel. Le passif à agent explicite est réservé aux textes formels.",
            "Réflexe utile : avant de chercher un passif russe, se demander si l'agent compte. S'il ne compte pas, la 3ᵉ personne du pluriel suffit et sonne naturel.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Imperfectif : verbe + -ся. Perfectif : participe passif court.",
            "Agent à l'instrumental, et seulement à l'écrit.",
            "La 3ᵉ personne du pluriel remplace le passif à l'oral.",
            "Le participe court exprime l'état résultant : Магази́н закры́т.",
          ],
        },
      ],
      practice: [{ href: "/participles/short", label: "Exercice : formes courtes du participe" }],
    },
    {
      slug: "comparaison",
      title: "Comparer",
      titleRu: "Сравнение",
      level: "B1",
      minutes: 9,
      summary:
        "Plus que, aussi que, le même que : les constructions de comparaison, avec ou sans чем.",
      keywords: ["comparaison", "чем", "как", "такой же", "сравнение", "чем тем"],
      sections: [
        {
          kind: "table",
          title: "Les constructions",
          head: ["Sens", "Construction", "Exemple"],
          rows: [
            ["plus… que", "comparatif + чем", "Он ста́рше, чем я."],
            ["plus… que", "comparatif + génitif", "Он ста́рше меня́."],
            ["aussi… que", "тако́й же… как", "Он тако́й же высо́кий, как ты."],
            ["autant que", "сто́лько же… ско́лько", "У меня́ сто́лько же книг, ско́лько у тебя́."],
            ["le même que", "тот же са́мый… что и", "Э́то тот же са́мый фильм, что и вчера́."],
            ["plus… plus…", "чем… тем…", "Чем ра́ньше, тем лу́чше."],
            ["de … (écart)", "на + accusatif", "Он ста́рше на два го́да."],
          ],
        },
        {
          kind: "prose",
          body: [
            "Deux formules concurrentes disent « que » : чем avec une virgule, ou le génitif seul. Le génitif est plus court et très fréquent, mais il ne fonctionne que si le premier terme est au nominatif ou à l'accusatif.",
            "Pour comparer deux actions ou deux propositions, чем est obligatoire : Лу́чше по́здно, чем никогда́.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́та кни́га интере́снее, чем та.", fr: "Ce livre est plus intéressant que celui-là." },
            { ru: "Сего́дня тепле́е, чем вчера́.", fr: "Il fait plus chaud aujourd'hui qu'hier." },
            { ru: "Он рабо́тает так же мно́го, как и ра́ньше.", fr: "Il travaille autant qu'avant." },
            { ru: "Чем бо́льше я чита́ю, тем лу́чше понима́ю.", fr: "Plus je lis, mieux je comprends." },
          ],
        },
        {
          kind: "pitfall",
          title: "Бо́лее хоро́ший n'existe pas",
          body: [
            "Le français fabrique tous ses comparatifs avec « plus ». Le russe a une forme synthétique pour l'essentiel de la langue courante — интере́снее, бо́льше, лу́чше, ста́рше — et c'est elle qui s'emploie en parlant. Бо́лее existe, mais il appartient à l'écrit et se place devant un adjectif épithète (бо́лее сло́жный вопро́с) ; il ne se pose jamais sur un mot qui est déjà un comparatif, et « бо́лее лу́чший » est en russe une faute proverbiale.",
            "Deuxième piège : les comparatifs les plus fréquents ne ressemblent pas à leur adjectif. хоро́ший → лу́чше, плохо́й → ху́же, большо́й → бо́льше, ма́ленький → ме́ньше. Ce sont ceux qui servent tous les jours, donc ceux qu'il faut connaître avant la règle qui les explique.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "чем + virgule, ou génitif seul pour dire « que ».",
            "тако́й же… как pour l'égalité de qualité.",
            "чем… тем… pour la progression parallèle.",
            "на + accusatif pour chiffrer l'écart.",
          ],
        },
      ],
    },
    {
      slug: "subordonnees-completives",
      title: "Что et что́бы",
      titleRu: "Придаточные с что и чтобы",
      level: "B1",
      minutes: 9,
      summary:
        "Что rapporte un fait, что́бы exprime une volonté ou un but — et impose le passé ou l'infinitif.",
      keywords: ["что", "чтобы", "subordonnée", "volonté", "but", "придаточное"],
      sections: [
        {
          kind: "prose",
          body: [
            "Что introduit un fait, avec un verbe à un temps normal : Я зна́ю, что он до́ма. Что́бы introduit une volonté, un but ou une nécessité, et impose une forme figée.",
            "Après что́бы, deux cas. Si les sujets DIFFÈRENT, le verbe se met au passé, sans valeur temporelle : Я хочу́, что́бы ты пришёл. Si le sujet est le MÊME, on emploie l'infinitif : Я пришёл, что́бы поговори́ть.",
          ],
        },
        {
          kind: "table",
          title: "Le choix",
          head: ["Sens", "Conjonction", "Verbe", "Exemple"],
          rows: [
            ["fait constaté", "что", "temps normal", "Я ду́маю, что он прав."],
            ["volonté, sujets différents", "что́бы", "passé", "Я хочу́, что́бы он пришёл."],
            ["but, même sujet", "что́бы", "infinitif", "Я звоню́, что́бы узна́ть."],
            ["crainte", "что́бы не", "passé", "Бою́сь, что́бы он не опозда́л."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он сказа́л, что придёт за́втра.", fr: "Il a dit qu'il viendrait demain." },
            { ru: "Я хочу́, что́бы ты меня́ по́нял.", fr: "Je veux que tu me comprennes." },
            { ru: "Он рабо́тает, что́бы содержа́ть семью́.", fr: "Il travaille pour faire vivre sa famille." },
            { ru: "Ва́жно, что́бы все зна́ли об э́том.", fr: "Il est important que tout le monde le sache." },
          ],
        },
        {
          kind: "pitfall",
          title: "La virgule, encore",
          body: [
            "Что et что́бы sont toujours précédés d'une virgule, y compris dans les phrases très courtes : Я ду́маю, что да. L'absence de virgule est une faute d'orthographe.",
            "Attention à ne pas confondre la conjonction что (que) avec le pronom что (quoi) : Я зна́ю, что он сказа́л (je sais ce qu'il a dit) contre Я зна́ю, что он ушёл (je sais qu'il est parti). À l'oral, l'accent tonique distingue les deux.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "что : le fait, avec un temps normal.",
            "что́бы : la volonté ou le but.",
            "Sujets différents ⇒ passé ; même sujet ⇒ infinitif.",
            "Virgule obligatoire devant les deux.",
          ],
        },
      ],
    },
    {
      slug: "subordonnees-circonstancielles",
      title: "Cause, condition, temps, concession",
      titleRu: "Обстоятельственные придаточные",
      level: "B1",
      minutes: 9,
      summary:
        "Потому́ что, е́сли, когда́, хотя́ : les conjonctions qui relient deux propositions, et les pièges de temps qui vont avec.",
      keywords: ["потому что", "если", "когда", "хотя", "пока", "conjonctions"],
      sections: [
        {
          kind: "table",
          title: "Les conjonctions principales",
          head: ["Conjonction", "Sens", "Exemple"],
          rows: [
            ["потому́ что", "parce que", "Я не пришёл, потому́ что был за́нят."],
            ["так как", "comme, puisque", "Так как шёл дождь, мы оста́лись."],
            ["поэ́тому", "c'est pourquoi", "Шёл дождь, поэ́тому мы оста́лись."],
            ["е́сли", "si", "Е́сли бу́дет вре́мя, я приду́."],
            ["когда́", "quand", "Когда́ он придёт, скажи́ мне."],
            ["пока́", "pendant que, tant que", "Пока́ она́ говори́ла, я молча́л."],
            ["пока́ не", "jusqu'à ce que", "Жди, пока́ он не придёт."],
            ["по́сле того́ как", "après que", "По́сле того́ как он ушёл…"],
            ["хотя́", "bien que", "Хотя́ бы́ло по́здно, он рабо́тал."],
            ["что́бы", "pour que", "Говори́ гро́мче, что́бы все слы́шали."],
          ],
        },
        {
          kind: "prose",
          title: "Deux pièges de temps",
          body: [
            "PREMIER PIÈGE : après е́сли et когда́, le russe emploie le FUTUR quand le français emploie le présent. Е́сли ты придёшь, я бу́ду рад.",
            "SECOND PIÈGE : пока́ не n'est pas une négation. Жди, пока́ он не придёт signifie « attends jusqu'à ce qu'il arrive », pas « tant qu'il n'arrive pas ». Le не fait partie de la locution.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я оста́лся до́ма, потому́ что бы́ло хо́лодно.", fr: "Je suis resté à la maison parce qu'il faisait froid." },
            { ru: "Е́сли ты уста́л, отдохни́.", fr: "Si tu es fatigué, repose-toi." },
            { ru: "Когда́ я бу́ду в Москве́, я тебе́ позвоню́.", fr: "Quand je serai à Moscou, je t'appellerai." },
            { ru: "Хотя́ он и не хоте́л, ему́ пришло́сь согласи́ться.", fr: "Bien qu'il ne voulût pas, il a dû accepter." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "потому́ что répond à « pourquoi » ; поэ́тому annonce la conséquence.",
            "Après е́сли et когда́ : futur, pas présent.",
            "пока́ не = « jusqu'à ce que » : le не n'est pas une négation.",
            "Toutes ces conjonctions demandent une virgule.",
          ],
        },
      ],
    },
    {
      slug: "discours-indirect",
      title: "Le discours indirect",
      titleRu: "Косвенная речь",
      level: "B2",
      minutes: 8,
      summary:
        "Aucune concordance des temps : le russe garde le temps de la phrase d'origine, ce qui change tout par rapport au français.",
      keywords: ["discours indirect", "косвенная речь", "concordance", "ли", "rapporter"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe ignore la concordance des temps. Ce que la personne a dit au présent reste au présent dans le discours rapporté : Он сказа́л, что он рабо́тает — « il a dit qu'il travaillait ». Le temps russe conserve le point de vue du locuteur d'origine.",
            "Pour un francophone, l'effet est déroutant : la traduction littérale donne « il a dit qu'il travaille », qui est fautif en français mais exact en russe. Il faut changer de repère, pas de temps.",
          ],
        },
        {
          kind: "table",
          title: "Ce qui change, ce qui ne change pas",
          head: ["Discours direct", "Discours indirect", "Français"],
          rows: [
            ["« Я рабо́таю »", "Он сказа́л, что рабо́тает.", "Il a dit qu'il travaillait."],
            ["« Я рабо́тал »", "Он сказа́л, что рабо́тал.", "Il a dit qu'il avait travaillé."],
            ["« Я бу́ду рабо́тать »", "Он сказа́л, что бу́дет рабо́тать.", "Il a dit qu'il travaillerait."],
            ["« Ты придёшь? »", "Он спроси́л, приду́ ли я.", "Il a demandé si je viendrais."],
            ["« Приди́! »", "Он сказа́л, что́бы я пришёл.", "Il m'a dit de venir."],
          ],
        },
        {
          kind: "prose",
          title: "Rapporter une question",
          body: [
            "Une question fermée se rapporte avec la particule ли, placée après le mot sur lequel portait la question : Он спроси́л, зна́ю ли я э́то. Une question ouverte garde son mot interrogatif : Он спроси́л, где я живу́.",
            "Un ordre se rapporte avec что́бы + passé : Он попроси́л, что́бы мы подожда́ли.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Она́ сказа́ла, что не мо́жет прийти́.", fr: "Elle a dit qu'elle ne pouvait pas venir." },
            { ru: "Я спроси́л, есть ли у него́ вре́мя.", fr: "J'ai demandé s'il avait le temps." },
            { ru: "Он не сказа́л, когда́ вернётся.", fr: "Il n'a pas dit quand il reviendrait." },
            { ru: "Врач посове́товал, что́бы я бо́льше отдыха́л.", fr: "Le médecin m'a conseillé de me reposer davantage." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Pas de concordance des temps : le temps d'origine se conserve.",
            "Question fermée rapportée : ли après le mot interrogé.",
            "Question ouverte : le mot interrogatif reste.",
            "Ordre rapporté : что́бы + passé.",
          ],
        },
      ],
    },
  ],
};
