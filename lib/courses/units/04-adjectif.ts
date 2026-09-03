import type { Unit } from "../types";

/**
 * Unité 4 — l'adjectif : accord, déclinaison complète, formes courtes et
 * degrés de comparaison.
 */
export const UNIT_ADJECTIF: Unit = {
  slug: "adjectif",
  title: "L'adjectif",
  titleRu: "Имя прилагательное",
  subtitle:
    "Accorder en genre, en nombre et en cas ; puis les formes courtes, le comparatif et le superlatif.",
  color: "#B5762A",
  lessons: [
    {
      slug: "accord-de-l-adjectif",
      title: "L'accord de l'adjectif",
      titleRu: "Согласование прилагательного",
      level: "A1",
      minutes: 10,
      summary:
        "Un adjectif russe porte trois informations à la fois : le genre, le nombre et le cas du nom qu'il qualifie.",
      keywords: ["adjectif", "accord", "прилагательное", "новый", "genre", "terminaisons"],
      sections: [
        {
          kind: "prose",
          body: [
            "L'adjectif français s'accorde en genre et en nombre. L'adjectif russe fait la même chose, plus le cas : il recopie sur lui toute l'identité grammaticale du nom. Une terminaison d'adjectif dit donc à elle seule ce qu'est le nom qui suit, avant même qu'on l'ait lu.",
            "C'est ce qui rend l'ordre des mots si libre : dans но́вую кни́гу, la terminaison -ую annonce un féminin accusatif singulier, où que le nom se trouve.",
          ],
        },
        {
          kind: "table",
          title: "Nominatif : le modèle но́вый (neuf)",
          head: ["Genre", "Forme", "Exemple"],
          rows: [
            ["Masculin", "но́вый", "но́вый дом"],
            ["Féminin", "но́вая", "но́вая кни́га"],
            ["Neutre", "но́вое", "но́вое окно́"],
            ["Pluriel", "но́вые", "но́вые дома́"],
          ],
          note: "Le pluriel est unique : il ne distingue pas les genres, contrairement au français.",
        },
        {
          kind: "prose",
          title: "Où se place l'adjectif",
          body: [
            "Devant le nom, presque toujours : кра́сная маши́на. C'est la position neutre, et elle ne dépend ni de la longueur ni du sens de l'adjectif — le débat français entre « une grande maison » et « une maison grande » n'existe pas.",
            "Après le nom, l'adjectif devient attribut ou prend une valeur détachée, souvent poétique ou administrative : Маши́на кра́сная (la voiture est rouge, attribut, sans verbe être).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "У меня́ но́вая маши́на.", fr: "J'ai une voiture neuve." },
            { ru: "Э́то интере́сная кни́га.", fr: "C'est un livre intéressant." },
            { ru: "Он живёт в большо́м го́роде.", fr: "Il habite dans une grande ville.", note: "prépositionnel masculin : -ом" },
            { ru: "Я купи́л краси́вые цветы́.", fr: "J'ai acheté de belles fleurs." },
            { ru: "Пого́да сего́дня хоро́шая.", fr: "Le temps est beau aujourd'hui.", note: "attribut, après le nom" },
          ],
        },
        {
          kind: "pitfall",
          title: "Врач est masculin, même quand c'est une femme",
          body: [
            "Toute une série de noms de métier n'existe qu'au masculin : врач, инжене́р, дире́ктор, президе́нт, а́втор, секрета́рь, специали́ст. L'adjectif qui les qualifie se met donc au masculin quel que soit le sexe de la personne : Она́ хоро́ший врач. « Хоро́шая врач » s'entend, mais reste hors norme.",
            "Le VERBE, lui, a le droit de suivre la personne réelle : Врач сказа́ла, что на́до отдохну́ть est correct et courant. C'est la seule entorse admise — l'adjectif reste masculin, le passé peut passer au féminin. Les formes en -ха ou -ша (врачи́ха, секрета́рша) existent, mais elles sont familières et souvent dépréciatives : à comprendre, pas à employer.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "L'adjectif s'accorde en genre, en nombre ET en cas.",
            "Un seul pluriel pour les trois genres.",
            "Position neutre : devant le nom.",
            "La terminaison de l'adjectif suffit souvent à identifier le nom.",
          ],
        },
      ],
      practice: [{ href: "/adjectives/nominative", label: "Exercice : accord au nominatif" }],
    },
    {
      slug: "adjectifs-durs-mous-mixtes",
      title: "Adjectifs durs, mous et mixtes",
      titleRu: "Твёрдые и мягкие прилагательные",
      level: "A2",
      minutes: 9,
      summary:
        "Trois séries de terminaisons : но́вый, си́ний, et celles que la règle des sept lettres oblige à panacher.",
      keywords: ["dur", "mou", "синий", "хороший", "большой", "orthographe", "adjectif"],
      sections: [
        {
          kind: "prose",
          body: [
            "Tous les adjectifs se déclinent pareil, à ceci près que la voyelle de leur terminaison suit la dureté du radical. Trois séries suffisent à tout couvrir.",
            "La troisième n'est pas une vraie série : c'est la règle orthographique des sept lettres qui vient corriger la première. Un adjectif en -г, -к, -х, -ж, -ш, -ч, -щ ne peut pas prendre -ый (ы interdit) et prend donc -ий, sans changer de nature.",
          ],
        },
        {
          kind: "table",
          title: "Les trois séries au nominatif",
          head: ["Série", "Masculin", "Féminin", "Neutre", "Pluriel"],
          rows: [
            ["Dure : но́вый", "но́вый", "но́вая", "но́вое", "но́вые"],
            ["Molle : си́ний", "си́ний", "си́няя", "си́нее", "си́ние"],
            ["Mixte : ру́сский", "ру́сский", "ру́сская", "ру́сское", "ру́сские"],
            ["Mixte : хоро́ший", "хоро́ший", "хоро́шая", "хоро́шее", "хоро́шие"],
            ["Accent final : большо́й", "большо́й", "больша́я", "большо́е", "больши́е"],
          ],
        },
        {
          kind: "prose",
          title: "Les adjectifs mous sont peu nombreux",
          body: [
            "La série molle complète ne compte qu'une trentaine d'adjectifs, presque tous liés au temps, au lieu ou à quelques couleurs : си́ний (bleu foncé), после́дний (dernier), сле́дующий (suivant), сего́дняшний (d'aujourd'hui), вече́рний (du soir), дома́шний (domestique), ли́шний (superflu).",
            "Tout le reste est dur ou mixte. Autrement dit : apprendre си́ний, c'est apprendre toute la série.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́то си́нее мо́ре.", fr: "C'est une mer bleue.", note: "neutre mou : -ее" },
            { ru: "Ру́сский язы́к тру́дный, но краси́вый.", fr: "Le russe est difficile, mais beau." },
            { ru: "У неё хоро́шее настрое́ние.", fr: "Elle est de bonne humeur.", note: "-ее : ш impose е en terminaison atone" },
            { ru: "Мы живём в большо́м до́ме.", fr: "Nous habitons dans une grande maison." },
            { ru: "Э́то после́дний авто́бус.", fr: "C'est le dernier bus." },
          ],
        },
        {
          kind: "pitfall",
          title: "хоро́шее mais большо́е",
          body: [
            "Les deux adjectifs finissent par ш, et pourtant l'un prend е et l'autre о. La différence est l'accent : la règle « pas de о après une sifflante » ne vaut que si la terminaison est ATONE. Dans большо́е, la terminaison est accentuée, donc о se maintient.",
            "Le test est simple : si vous entendez la terminaison distinctement (elle porte l'accent), écrivez о ; sinon, écrivez е.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Série dure но́вый, série molle си́ний, mixtes imposés par les sept lettres.",
            "La série molle est fermée : une trentaine d'adjectifs.",
            "Terminaison atone après ж ш ч щ ц : е. Terminaison accentuée : о.",
            "Un adjectif mixte reste un adjectif dur corrigé par l'orthographe.",
          ],
        },
      ],
      practice: [{ href: "/adjectives/spelling", label: "Exercice : orthographe de l'adjectif" }],
    },
    {
      slug: "adjectifs-aux-cas",
      title: "L'adjectif dans les six cas",
      titleRu: "Склонение прилагательных",
      level: "B1",
      minutes: 12,
      summary:
        "Le tableau complet — et l'astuce des questions : la terminaison de l'adjectif rime avec la question du cas.",
      keywords: ["déclinaison", "adjectif", "какой", "cas", "obliques", "tableau"],
      sections: [
        {
          kind: "table",
          title: "Singulier : но́вый",
          head: ["Cas", "Masculin", "Féminin", "Neutre"],
          rows: [
            ["Nominatif", "но́вый", "но́вая", "но́вое"],
            ["Génitif", "но́вого", "но́вой", "но́вого"],
            ["Datif", "но́вому", "но́вой", "но́вому"],
            ["Accusatif", "= nom. ou gén.", "но́вую", "но́вое"],
            ["Instrumental", "но́вым", "но́вой", "но́вым"],
            ["Prépositionnel", "но́вом", "но́вой", "но́вом"],
          ],
          note: "Le féminin a une seule forme, но́вой, pour quatre cas : génitif, datif, instrumental, prépositionnel.",
        },
        {
          kind: "table",
          title: "Pluriel : un seul jeu pour les trois genres",
          head: ["Cas", "Forme", "Exemple"],
          rows: [
            ["Nominatif", "но́вые", "но́вые дома́"],
            ["Génitif", "но́вых", "мно́го но́вых домо́в"],
            ["Datif", "но́вым", "к но́вым друзья́м"],
            ["Accusatif", "= nom. ou gén.", "я ви́жу но́вые дома́ / но́вых друзе́й"],
            ["Instrumental", "но́выми", "с но́выми друзья́ми"],
            ["Prépositionnel", "но́вых", "о но́вых дома́х"],
          ],
        },
        {
          kind: "prose",
          title: "L'astuce des questions",
          body: [
            "La terminaison de l'adjectif rime avec celle du mot interrogatif како́й décliné : како́го → но́вого, како́му → но́вому, каки́м → но́вым, о како́м → о но́вом. Il suffit donc de savoir poser la question au bon cas pour retrouver la terminaison.",
            "Deux formes se lisent autrement qu'elles ne s'écrivent : -ого et -его se prononcent -ова et -ева. Но́вого se dit « novava ».",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я не зна́ю э́того но́вого студе́нта.", fr: "Je ne connais pas ce nouvel étudiant.", note: "génitif = accusatif animé" },
            { ru: "Она́ помога́ет мла́дшей сестре́.", fr: "Elle aide sa sœur cadette.", note: "datif féminin : -ей" },
            { ru: "Он говори́т с интере́сным челове́ком.", fr: "Il parle avec un homme intéressant.", note: "instrumental masculin : -ым" },
            { ru: "Мы живём в ста́ром до́ме.", fr: "Nous habitons dans une vieille maison." },
            { ru: "У меня́ нет свобо́дного вре́мени.", fr: "Je n'ai pas de temps libre." },
          ],
        },
        {
          kind: "pitfall",
          title: "L'accusatif masculin dépend de ce qu'on regarde",
          body: [
            "« = nom. ou gén. » dans le tableau n'est pas une commodité de mise en page : c'est la règle d'animation, et elle commande DEUX mots à la fois. Я ви́жу но́вый дом (inanimé : forme du nominatif) contre Я ви́жу но́вого студе́нта (animé : forme du génitif). L'adjectif ne décide de rien, il suit son nom.",
            "Au pluriel, la règle s'étend aux trois genres : Я ви́жу но́вые дома́, mais Я ви́жу но́вых студе́нток — féminin compris, alors qu'au singulier le féminin y échappait (Я ви́жу но́вую студе́нтку). C'est le seul endroit de la déclinaison où l'animation touche le féminin, et il se rate systématiquement.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le féminin singulier n'a qu'une forme oblique : но́вой.",
            "Le pluriel ne distingue pas les genres.",
            "L'adjectif rime avec како́й décliné : како́му → но́вому.",
            "-ого / -его se prononcent -ova / -eva.",
          ],
        },
      ],
      practice: [{ href: "/adjectives/oblique", label: "Exercice : cas obliques de l'adjectif" }],
    },
    {
      slug: "formes-courtes",
      title: "Les formes courtes",
      titleRu: "Краткие прилагательные",
      level: "B1",
      minutes: 9,
      summary:
        "Une seconde forme, sans terminaison de cas, réservée à l'attribut — et qui dit souvent un état passager plutôt qu'une qualité.",
      keywords: ["forme courte", "краткая форма", "рад", "должен", "занят", "attribut"],
      sections: [
        {
          kind: "prose",
          body: [
            "À côté de la forme longue (но́вый), beaucoup d'adjectifs ont une forme courte : нов, нова́, но́во, но́вы. Elle ne se décline pas — elle ne connaît que le genre et le nombre — et ne s'emploie qu'en attribut, jamais devant un nom.",
            "La différence de sens est réelle : la forme longue attribue une qualité permanente, la forme courte un état momentané ou relatif à une situation. Он больно́й = c'est un malade (chronique) ; Он бо́лен = il est malade en ce moment.",
          ],
        },
        {
          kind: "table",
          title: "Formation",
          head: ["Long", "Masculin", "Féminin", "Neutre", "Pluriel"],
          rows: [
            ["но́вый", "нов", "нова́", "но́во", "но́вы"],
            ["за́нятый", "за́нят", "занята́", "за́нято", "за́няты"],
            ["свобо́дный", "свобо́ден", "свобо́дна", "свобо́дно", "свобо́дны"],
            ["больно́й", "бо́лен", "больна́", "больно́", "больны́"],
            ["до́лжный", "до́лжен", "должна́", "должно́", "должны́"],
          ],
          note: "Le masculin insère souvent une voyelle d'appui (свобо́ден) pour éviter un groupe imprononçable.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Я за́нят сего́дня.", fr: "Je suis occupé aujourd'hui.", note: "état du jour" },
            { ru: "Она́ занята́ ве́чером.", fr: "Elle est occupée ce soir." },
            { ru: "Я о́чень рад вас ви́деть.", fr: "Je suis très heureux de vous voir.", note: "рад n'a QUE la forme courte" },
            { ru: "Ты до́лжен позвони́ть ему́.", fr: "Tu dois lui téléphoner.", note: "до́лжен + infinitif : l'obligation" },
            { ru: "Э́то пла́тье тебе́ велико́.", fr: "Cette robe est trop grande pour toi.", note: "la forme courte dit le rapport à quelqu'un" },
          ],
        },
        {
          kind: "prose",
          title: "Celles qu'on ne peut pas éviter",
          body: [
            "Certaines formes courtes sont d'un usage quotidien et n'ont pas d'équivalent long dans le même sens : рад (content), до́лжен (devoir), ну́жен (nécessaire), гото́в (prêt), уве́рен (sûr), согла́сен (d'accord), знако́м (familier avec).",
            "Ну́жен s'accorde avec la chose nécessaire, pas avec la personne : Мне ну́жен слова́рь, Мне нужна́ по́мощь, Мне ну́жно вре́мя, Мне нужны́ де́ньги.",
          ],
        },
        {
          kind: "pitfall",
          title: "Ne pas former une forme courte au hasard",
          body: [
            "Tous les adjectifs n'en ont pas. Les adjectifs de relation (деревя́нный, ру́сский, городско́й) n'en ont jamais, parce qu'ils n'expriment pas une qualité graduable.",
            "En cas de doute, la forme longue en attribut reste correcte dans presque tous les contextes : Дом большо́й passe partout, là où « Дом вели́к » dit autre chose (la maison est trop grande).",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Forme courte = attribut seulement, jamais devant le nom.",
            "Elle ne varie qu'en genre et en nombre.",
            "Elle dit l'état passager ou relatif : Он бо́лен ≠ Он больно́й.",
            "рад, до́лжен, ну́жен, гото́в, уве́рен : seulement en forme courte.",
          ],
        },
      ],
    },
    {
      slug: "comparatif",
      title: "Le comparatif",
      titleRu: "Сравнительная степень",
      level: "B1",
      minutes: 11,
      summary:
        "Une forme unique en -ее, invariable, et deux façons de dire « que » : чем, ou le génitif seul.",
      keywords: ["comparatif", "сравнительная", "чем", "лучше", "больше", "plus que"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le comparatif simple se forme en remplaçant la terminaison par -ее : краси́вый → краси́вее, интере́сный → интере́снее, бы́стрый → быстре́е. Cette forme est invariable : elle ne s'accorde ni en genre, ni en nombre, ni en cas.",
            "Elle s'emploie en attribut : Э́та кни́га интере́снее. Pour qualifier un nom directement (« un livre plus intéressant »), il faut la forme composée avec бо́лее : бо́лее интере́сная кни́га.",
          ],
        },
        {
          kind: "table",
          title: "Les irréguliers, tous fréquents",
          head: ["Adjectif", "Comparatif", "Sens"],
          rows: [
            ["хоро́ший", "лу́чше", "meilleur, mieux"],
            ["плохо́й", "ху́же", "pire"],
            ["большо́й", "бо́льше", "plus grand, plus"],
            ["ма́ленький", "ме́ньше", "plus petit, moins"],
            ["ста́рый", "ста́рше", "plus âgé"],
            ["молодо́й", "моло́же", "plus jeune"],
            ["дорого́й", "доро́же", "plus cher"],
            ["дешёвый", "деше́вле", "moins cher"],
            ["высо́кий", "вы́ше", "plus haut"],
            ["ни́зкий", "ни́же", "plus bas"],
          ],
        },
        {
          kind: "prose",
          title: "Deux façons de dire « que »",
          body: [
            "Avec чем, suivi du même cas que le premier terme : Москва́ бо́льше, чем Пари́ж. La virgule devant чем est obligatoire.",
            "Ou sans чем, en mettant le second terme au génitif : Москва́ бо́льше Пари́жа. Plus court, très courant, mais impossible si le premier terme n'est pas au nominatif ou à l'accusatif.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Сего́дня холодне́е, чем вчера́.", fr: "Il fait plus froid qu'hier." },
            { ru: "Он ста́рше меня́ на два го́да.", fr: "Il est plus âgé que moi de deux ans.", note: "génitif + на pour l'écart" },
            { ru: "Э́то намно́го лу́чше.", fr: "C'est bien mieux.", note: "намно́го / гора́здо renforcent" },
            { ru: "Чем бо́льше, тем лу́чше.", fr: "Plus il y en a, mieux c'est." },
            { ru: "Он говори́т по-ру́сски лу́чше меня́.", fr: "Il parle russe mieux que moi." },
          ],
        },
        {
          kind: "pitfall",
          title: "Ста́рше n'est pas старе́е",
          body: [
            "Plusieurs adjectifs ont deux comparatifs, un par sens, et le français n'en a qu'un. Ста́рше parle de l'âge d'une personne (Он ста́рше меня́), старе́е de l'ancienneté d'une chose (Э́тот дом старе́е). De même моло́же (plus jeune, pour quelqu'un) contre нове́е (plus récent, pour quelque chose). Se tromper ne rend pas la phrase obscure : elle devient simplement bizarre.",
            "Autre chausse-trappe : бо́льше et ме́ньше servent à la fois d'adjectif (plus grand, plus petit) et d'adverbe de quantité (plus, moins). Я хочу́ бо́льше veut dire « j'en veux davantage », pas « je le veux plus grand ». Pour la taille, on précise : Я хочу́ дом побо́льше.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Comparatif simple en -ее : invariable, attribut seulement.",
            "бо́лее + adjectif long pour qualifier un nom.",
            "« que » = чем (avec virgule) ou génitif seul.",
            "лу́чше, ху́же, бо́льше, ме́ньше, ста́рше : à connaître par cœur.",
          ],
        },
      ],
    },
    {
      slug: "superlatif",
      title: "Le superlatif",
      titleRu: "Превосходная степень",
      level: "B1",
      minutes: 8,
      summary:
        "Са́мый + adjectif couvre 90 % des besoins ; les formes en -ейший appartiennent à l'écrit soutenu.",
      keywords: ["superlatif", "самый", "превосходная", "лучший", "наиболее"],
      sections: [
        {
          kind: "prose",
          body: [
            "La forme courante est analytique : са́мый + adjectif, les deux s'accordant avec le nom. са́мый большо́й дом, са́мая интере́сная кни́га, в са́мом большо́м го́роде.",
            "C'est la construction à privilégier : elle marche avec tous les adjectifs, à tous les cas, et ne demande aucune mémorisation.",
          ],
        },
        {
          kind: "table",
          title: "Les autres formations",
          head: ["Forme", "Registre", "Exemple"],
          rows: [
            ["са́мый + adjectif", "courant, universel", "са́мый интере́сный фильм"],
            ["-ейший / -айший", "écrit, soutenu", "интере́снейший, велича́йший"],
            ["наибо́лее + adjectif", "administratif, scientifique", "наибо́лее ва́жный вопро́с"],
            ["comparatif + всех / всего́", "oral, très courant", "Он бе́гает быстре́е всех."],
          ],
          note: "всех pour comparer à des personnes, всего́ pour comparer à des choses ou des situations.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́то са́мый большо́й го́род в стране́.", fr: "C'est la plus grande ville du pays." },
            { ru: "Она́ моя́ лу́чшая подру́га.", fr: "C'est ma meilleure amie.", note: "лу́чший : superlatif irrégulier de хоро́ший" },
            { ru: "Он рабо́тает бо́льше всех.", fr: "C'est lui qui travaille le plus." },
            { ru: "Бо́льше всего́ я люблю́ чита́ть.", fr: "Ce que j'aime le plus, c'est lire." },
          ],
        },
        {
          kind: "pitfall",
          title: "Са́мый est un adjectif, pas un article",
          body: [
            "« Le plus » français est invariable ; са́мый ne l'est pas. C'est un adjectif, qui s'accorde en genre, en nombre ET en cas avec celui qu'il renforce, si bien que les deux mots bougent ensemble à chaque phrase : в са́мый большо́й го́род à l'accusatif, в са́мом большо́м го́роде au prépositionnel, о са́мых интере́сных кни́гах au pluriel.",
            "Et il ne se pose pas sur un comparatif. Лу́чший et ху́дший sont déjà des superlatifs : la norme demande лу́чший друг, pas « са́мый лу́чший друг » — tournure très entendue à l'oral, et corrigée dans tout écrit soigné.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "са́мый + adjectif : la forme à utiliser par défaut, elle s'accorde deux fois.",
            "лу́чший et ху́дший sont des superlatifs à part entière.",
            "comparatif + всех / всего́ : très fréquent à l'oral.",
            "-ейший appartient à l'écrit et sonne emphatique à l'oral.",
          ],
        },
      ],
    },
    {
      slug: "adjectifs-possessifs-et-relationnels",
      title: "Adjectifs possessifs et de relation",
      titleRu: "Притяжательные и относительные прилагательные",
      level: "B2",
      minutes: 7,
      summary:
        "Ма́мин, ли́сий, деревя́нный : deux familles d'adjectifs qui ne se comparent pas et ne se raccourcissent pas.",
      keywords: ["possessif", "мамин", "относительные", "relation", "лисий", "деревянный"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les adjectifs POSSESSIFS se forment sur un nom de personne ou d'animal familier : ма́ма → ма́мин, па́па → па́пин, сестра́ → сестри́н, ба́бушка → ба́бушкин. Ils appartiennent à la langue familière et affective ; l'équivalent neutre est le génitif : кни́га ма́мы.",
            "Une seconde série, en -ий, vient des animaux : лиса́ → ли́сий (de renard), медве́дь → медве́жий, соба́ка → соба́чий. Elle a une déclinaison particulière, avec un ь partout : ли́сья шу́ба, ли́сьего хвоста́.",
          ],
        },
        {
          kind: "prose",
          title: "Les adjectifs de relation",
          body: [
            "Ils disent de quoi une chose est faite ou à quoi elle se rapporte : деревя́нный (en bois), городско́й (de la ville), шко́льный (scolaire), у́тренний (du matin), ру́сский (russe).",
            "Ils n'ont ni comparatif ni forme courte, parce qu'ils ne se graduent pas : une table ne peut pas être « plus en bois » qu'une autre. Quand l'un d'eux prend un sens figuré, il redevient graduable : желе́зный хара́ктер (un caractère de fer) admet желе́знее.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́то ма́мина су́мка.", fr: "C'est le sac de maman.", note: "familier, affectueux" },
            { ru: "Э́то су́мка ма́мы.", fr: "C'est le sac de ma mère.", note: "génitif, neutre" },
            { ru: "Мы купи́ли деревя́нный стол.", fr: "Nous avons acheté une table en bois." },
            { ru: "У него́ желе́зный хара́ктер.", fr: "Il a un caractère de fer.", note: "sens figuré" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "ма́мин, па́пин : possessifs familiers, formés sur des noms de personnes.",
            "Le génitif (кни́га ма́мы) est l'équivalent neutre.",
            "Les adjectifs de relation n'ont ni comparatif ni forme courte.",
            "Un sens figuré rend un adjectif de relation graduable.",
          ],
        },
      ],
    },
    {
      slug: "adjectifs-substantives",
      title: "Les adjectifs devenus noms",
      titleRu: "Субстантивированные прилагательные",
      level: "B2",
      minutes: 6,
      summary:
        "Столо́вая, моро́женое, больно́й : des adjectifs employés comme noms, qui continuent de se décliner comme des adjectifs.",
      keywords: ["substantivé", "столовая", "мороженое", "больной", "русский", "nom"],
      sections: [
        {
          kind: "prose",
          body: [
            "Un adjectif peut se figer en nom, le nom qu'il qualifiait ayant disparu par ellipse. Столо́вая (комната) est devenu « la salle à manger », моро́женое (молоко́) est devenu « la glace », больно́й (челове́к) est devenu « le malade ».",
            "Ces mots restent des adjectifs pour la déclinaison : в столо́вой, без моро́женого, с больны́м. C'est ce qui trompe : leur terminaison ne ressemble à aucun nom.",
          ],
        },
        {
          kind: "table",
          title: "Les plus courants",
          head: ["Mot", "Sens", "Origine"],
          rows: [
            ["столо́вая", "salle à manger, cantine", "комната столо́вая"],
            ["ва́нная", "salle de bains", "комната ва́нная"],
            ["моро́женое", "glace", "молоко́ моро́женое"],
            ["живо́тное", "animal", "существо́ живо́тное"],
            ["больно́й / больна́я", "le malade / la malade", "челове́к больно́й"],
            ["ру́сский / ру́сская", "un Russe / une Russe", "челове́к ру́сский"],
            ["учёный", "savant, scientifique", "челове́к учёный"],
            ["бу́дущее", "l'avenir", "вре́мя бу́дущее"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Мы обе́даем в столо́вой.", fr: "Nous déjeunons à la cantine.", note: "prépositionnel d'adjectif féminin" },
            { ru: "Он ру́сский, а она́ францу́женка.", fr: "Il est russe, et elle est française.", note: "ру́сский se décline en adjectif, францу́женка en nom" },
            { ru: "Де́ти лю́бят моро́женое.", fr: "Les enfants aiment la glace." },
            { ru: "Врач осмотре́л больно́го.", fr: "Le médecin a examiné le malade.", note: "animé : accusatif = génitif" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Ce sont des noms par le sens, des adjectifs par la forme.",
            "Ils se déclinent avec les terminaisons d'adjectif.",
            "ру́сский se décline en adjectif, contrairement aux autres nationalités.",
            "L'ellipse d'origine explique leur genre : столо́вая est féminin comme ко́мната.",
          ],
        },
      ],
    },
  ],
};
