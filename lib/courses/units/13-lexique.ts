import type { Unit } from "../types";

/**
 * Unité 13 — le vocabulaire vu comme un système : racines, préfixes,
 * suffixes, et les familles de verbes que le français confond.
 */
export const UNIT_LEXIQUE: Unit = {
  slug: "lexique",
  title: "Lexique et formation des mots",
  titleRu: "Лексика и словообразование",
  subtitle:
    "Deviner un mot inconnu depuis sa racine, et démêler les familles de verbes qui n'ont qu'une traduction en français.",
  color: "#6F4A2E",
  lessons: [
    {
      slug: "racines-et-familles",
      title: "Racines et familles de mots",
      titleRu: "Корни и однокоренные слова",
      level: "B1",
      minutes: 9,
      summary:
        "Le russe fabrique son vocabulaire à partir d'un stock de racines. Reconnaître la racine, c'est deviner des dizaines de mots sans dictionnaire.",
      keywords: ["racine", "корень", "famille", "однокоренные", "vocabulaire", "deviner"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe est une langue à racines transparentes. Là où le français emprunte au latin savant pour former ses dérivés (« œil » et « oculaire » n'ont aucun rapport visible), le russe garde la même racine du mot le plus simple au plus abstrait.",
            "Conséquence pratique : apprendre une racine rentabilise des dizaines de mots. Le vocabulaire russe s'apprend par familles, pas par listes alphabétiques.",
          ],
        },
        {
          kind: "table",
          title: "Une racine, une famille",
          head: ["Racine", "Sens", "Famille"],
          rows: [
            [
              "-уч- / -ук-",
              "apprendre",
              "учи́ть, учи́ться, учи́тель, учени́к, учёба, нау́ка, учёный",
            ],
            [
              "-раб-",
              "travail",
              "рабо́та, рабо́тать, рабо́чий, рабо́тник, зарабо́тать",
            ],
            [
              "-пис-",
              "écrire",
              "писа́ть, писа́тель, письмо́, за́пись, по́дпись, о́пись",
            ],
            [
              "-говор-",
              "parler",
              "говори́ть, разгово́р, догово́р, перегово́ры, погово́рка",
            ],
            [
              "-ход-",
              "aller",
              "ходи́ть, вход, вы́ход, похо́д, прохо́жий, вездехо́д",
            ],
          ],
        },
        {
          kind: "prose",
          title: "Lire un mot inconnu",
          body: [
            "Un mot russe long se découpe : préfixe + racine + suffixe + terminaison. Приго́род = при- (à côté de) + го́род (ville) = banlieue. Подво́дный = под- (sous) + вод- (eau) + -н- (adjectif) = sous-marin.",
            "Ce découpage est l'outil de lecture le plus rentable au niveau intermédiaire. Il ne donne pas toujours le sens exact, mais il donne presque toujours la zone du sens — assez pour continuer à lire sans s'arrêter.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "письмо́, писа́тель, по́дпись", fr: "lettre, écrivain, signature", note: "même racine -пис-" },
            { ru: "вход, вы́ход, перехо́д", fr: "entrée, sortie, passage", note: "même racine -ход-, trois préfixes" },
            { ru: "самолёт", fr: "avion", note: "сам (soi-même) + лёт (vol)" },
            { ru: "холоди́льник", fr: "réfrigérateur", note: "хо́лод (froid) + -ильник (appareil)" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Les familles de mots sont visibles, contrairement au français savant.",
            "Découper : préfixe + racine + suffixe + terminaison.",
            "Apprendre par famille rentabilise chaque racine.",
            "Le découpage donne la zone du sens, souvent suffisante en lecture.",
          ],
        },
      ],
      practice: [{ href: "/vocabulary", label: "Mes listes de vocabulaire" }],
    },
    {
      slug: "prefixes-verbaux",
      title: "Les préfixes verbaux",
      titleRu: "Глагольные приставки",
      level: "B2",
      minutes: 10,
      summary:
        "Une quinzaine de préfixes, chacun avec son idée : commencer, finir, refaire, faire un peu, faire à l'excès, défaire.",
      keywords: ["préfixes", "приставки", "за-", "по-", "пере-", "раз-", "sens"],
      sections: [
        {
          kind: "prose",
          body: [
            "Au-delà de la direction (traitée pour les verbes de mouvement), les préfixes russes portent des valeurs d'ASPECT et de MANIÈRE. Le même préfixe peut d'ailleurs faire les deux : за- indique l'entrée dans une action (запе́ть, se mettre à chanter) ou un détour (зайти́, passer chez).",
          ],
        },
        {
          kind: "table",
          title: "Les valeurs principales",
          head: ["Préfixe", "Valeur", "Exemple", "Sens"],
          rows: [
            ["за-", "début brusque", "запе́ть", "se mettre à chanter"],
            ["по-", "un peu, un moment", "погуля́ть", "se promener un peu"],
            ["по-", "début (mouvement)", "пойти́", "se mettre en route"],
            ["про-", "durée entière", "проговори́ть два часа́", "parler deux heures durant"],
            ["пере-", "refaire", "переписа́ть", "recopier, réécrire"],
            ["пере-", "traverser", "перейти́", "traverser"],
            ["до-", "mener à terme", "дочита́ть", "finir de lire"],
            ["раз- / рас-", "défaire, disperser", "разлюби́ть", "cesser d'aimer"],
            ["с-", "faire d'un coup", "сде́лать", "faire (perfectif)"],
            ["вы-", "extraire, obtenir", "вы́учить", "apprendre à fond"],
            ["у-", "réduire, enlever", "уменьши́ть", "diminuer"],
            ["на-", "quantité, saturation", "наговори́ться", "parler tout son soûl"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он запе́л, и все замолча́ли.", fr: "Il s'est mis à chanter, et tous se sont tus." },
            { ru: "Дава́й погуля́ем немно́го.", fr: "Allons marcher un peu." },
            { ru: "Мне ну́жно переде́лать э́ту рабо́ту.", fr: "Je dois refaire ce travail." },
            { ru: "Дочита́й главу́ до конца́.", fr: "Finis de lire le chapitre." },
            { ru: "Он вы́учил стихотворе́ние наизу́сть.", fr: "Il a appris le poème par cœur." },
          ],
        },
        {
          kind: "pitfall",
          title: "Un préfixe rend le verbe perfectif",
          body: [
            "Presque tout préfixe ajouté à un imperfectif produit un perfectif. Si le verbe garde un sens nouveau (переписа́ть ≠ писа́ть), il se refabrique un imperfectif par le suffixe -ыва- / -ива- : перепи́сывать.",
            "D'où la chaîne typique : писа́ть (impf.) → переписа́ть (perf.) → перепи́сывать (impf.). Trois formes, deux aspects, un sens nouveau.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Les préfixes portent l'aspect ET une nuance de manière.",
            "по- = un peu ; про- = tout du long ; до- = jusqu'au bout.",
            "пере- = refaire ou traverser, selon le verbe.",
            "Préfixe ⇒ perfectif ; -ыва-/-ива- refabrique l'imperfectif.",
          ],
        },
      ],
    },
    {
      slug: "suffixes-de-noms",
      title: "Les suffixes de noms",
      titleRu: "Суффиксы существительных",
      level: "B2",
      minutes: 8,
      summary:
        "-тель, -ник, -ость, -ение : chaque suffixe dit ce qu'est le mot, et souvent son genre par la même occasion.",
      keywords: ["suffixes", "-тель", "-ость", "-ение", "суффиксы", "dérivation"],
      sections: [
        {
          kind: "table",
          title: "Les suffixes productifs",
          head: ["Suffixe", "Ce qu'il forme", "Genre", "Exemples"],
          rows: [
            ["-тель", "agent, instrument", "masculin", "учи́тель, писа́тель, выключа́тель"],
            ["-ник / -щик", "métier, agent", "masculin", "рабо́тник, ученик, часовщи́к"],
            ["-ист", "adepte, profession", "masculin", "журнали́ст, тури́ст"],
            ["-ость", "qualité abstraite", "féminin", "но́вость, ра́дость, ско́рость"],
            ["-ство", "état, collectif", "neutre", "госуда́рство, о́бщество, ка́чество"],
            ["-ение / -ание", "action, processus", "neutre", "образова́ние, реше́ние, чте́ние"],
            ["-ка", "féminin d'un métier, objet", "féminin", "студе́нтка, ру́чка"],
            ["-ция", "action (mots savants)", "féminin", "информа́ция, револю́ция"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Ces suffixes ont deux vertus. Ils donnent le SENS : un mot en -ость est une qualité abstraite, un mot en -ение une action nominalisée. Et ils donnent le GENRE, sans qu'il faille l'apprendre séparément.",
            "Le suffixe -ение mérite une attention particulière : il transforme n'importe quel verbe en nom d'action, et c'est le principal outil du style administratif et scientifique russe. реши́ть → реше́ние, стро́ить → строи́тельство, изуча́ть → изуче́ние.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "У меня́ для тебя́ хоро́шая но́вость.", fr: "J'ai une bonne nouvelle pour toi." },
            { ru: "Приня́тие реше́ния за́няло ме́сяц.", fr: "La prise de décision a pris un mois.", note: "deux noms en -ение / -ие" },
            { ru: "Он преподава́тель, а она́ перево́дчица.", fr: "Il est enseignant et elle est traductrice." },
            { ru: "Ско́рость ве́тра — два́дцать ме́тров в секу́нду.", fr: "La vitesse du vent est de vingt mètres par seconde." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "-тель, -ник, -ист : les agents, tous masculins.",
            "-ость : qualité abstraite, toujours féminin.",
            "-ение / -ание : action nominalisée, toujours neutre.",
            "Le suffixe donne le sens ET le genre.",
          ],
        },
      ],
    },
    {
      slug: "diminutifs",
      title: "Les diminutifs",
      titleRu: "Уменьшительные формы",
      level: "B1",
      minutes: 8,
      summary:
        "Le russe ajoute de l'affection à presque n'importe quel mot. Ce n'est pas une coquetterie : c'est un registre à part entière.",
      keywords: ["diminutif", "уменьшительные", "чуть-чуть", "Маша", "affection", "суффикс"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les diminutifs russes ne disent pas seulement « petit » : ils disent la tendresse, la familiarité, parfois l'ironie. Ils se forment avec une série de suffixes et s'appliquent aux objets, aux prénoms et même aux adjectifs.",
            "Leur usage est beaucoup plus large qu'en français. Une hôtesse qui propose du thé dira volontiers ча́ёк plutôt que чай ; ce n'est pas une petite quantité de thé, c'est une invitation chaleureuse.",
          ],
        },
        {
          kind: "table",
          title: "Les suffixes diminutifs",
          head: ["Suffixe", "Base", "Diminutif", "Nuance"],
          rows: [
            ["-ик / -чик", "дом", "до́мик", "petit, mignon"],
            ["-ок / -ёк", "чай", "ча́ёк", "chaleureux"],
            ["-ка", "ру́ка", "ру́чка", "petit, familier"],
            ["-очка / -ечка", "ма́ма", "ма́мочка", "très affectueux"],
            ["-ушка / -юшка", "ба́ба", "ба́бушка", "affectueux, figé"],
            ["-ище", "дом", "доми́ще", "augmentatif, ironique"],
          ],
          note: "Beaucoup de diminutifs se sont lexicalisés : ру́чка (stylo), ба́бушка (grand-mère), де́вушка (jeune fille) ne sont plus sentis comme des diminutifs.",
        },
        {
          kind: "prose",
          title: "Les prénoms",
          body: [
            "Chaque prénom russe a une forme officielle et un cortège de diminutifs. Алекса́ндр donne Са́ша, Са́шенька, Шу́ра ; Мари́я donne Ма́ша, Ма́шенька, Ма́шка ; Влади́мир donne Воло́дя, Вова.",
            "Ces formes ne sont pas interchangeables : Са́ша est la forme familière normale entre proches et collègues ; Са́шенька est très affectueux ; Са́шка est brusque, entre amis proches ou légèrement rude. Employer le mauvais niveau se remarque immédiatement.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Хо́чешь ча́йку?", fr: "Tu veux un petit thé ?", note: "génitif partitif + diminutif : très hospitalier" },
            { ru: "Подожди́ мину́точку.", fr: "Attends une petite minute." },
            { ru: "Спаси́бо, ма́мочка.", fr: "Merci, maman chérie." },
            { ru: "Э́то мой ста́ренький компью́тер.", fr: "C'est mon petit vieux d'ordinateur.", note: "adjectif au diminutif" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le diminutif dit l'affection plus que la taille.",
            "Beaucoup sont lexicalisés : ру́чка, ба́бушка, де́вушка.",
            "Les prénoms ont plusieurs niveaux : Са́ша, Са́шенька, Са́шка.",
            "En employer avec mesure : trop en faire sonne mièvre.",
          ],
        },
      ],
    },
    {
      slug: "verbes-de-position",
      title: "Les verbes de position",
      titleRu: "Глаголы положения",
      level: "B1",
      minutes: 9,
      summary:
        "Стоя́ть, лежа́ть, висе́ть et leurs transitifs ста́вить, класть, ве́шать : le russe dit toujours comment une chose se tient.",
      keywords: ["стоять", "лежать", "висеть", "класть", "ставить", "position"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le français dit « le livre est sur la table », « les clés sont sur la table », « le tableau est au mur ». Le russe choisit un verbe selon la position de l'objet : debout (стои́т), couché (лежи́т), suspendu (виси́т).",
            "À chaque verbe de position correspond un verbe transitif qui met dans cette position : ста́вить (mettre debout), класть (poser à plat), ве́шать (suspendre).",
          ],
        },
        {
          kind: "table",
          title: "Trois paires",
          head: ["Position (où c'est)", "Action (mettre)", "Perfectif", "Objet typique"],
          rows: [
            ["стоя́ть", "ста́вить", "поста́вить", "verre, bouteille, immeuble"],
            ["лежа́ть", "класть", "положи́ть", "livre, papier, clés"],
            ["висе́ть", "ве́шать", "пове́сить", "tableau, veste, rideau"],
            ["сиде́ть", "сажа́ть", "посади́ть", "personne, oiseau, plante"],
          ],
          note: "класть est imperfectif et положи́ть perfectif : c'est une paire supplétive, sans rapport de forme.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Кни́га лежи́т на столе́.", fr: "Le livre est sur la table.", note: "à plat" },
            { ru: "Стака́н стои́т на столе́.", fr: "Le verre est sur la table.", note: "debout" },
            { ru: "Карти́на виси́т на стене́.", fr: "Le tableau est au mur." },
            { ru: "Положи́ ключи́ на стол.", fr: "Pose les clés sur la table." },
            { ru: "Поста́вь ча́йник на плиту́.", fr: "Mets la bouilloire sur la plaque." },
          ],
        },
        {
          kind: "pitfall",
          title: "Класть ou положи́ть ?",
          body: [
            "Erreur classique, y compris chez les russophones : « ложи́ть » n'existe pas dans la langue standard. L'imperfectif est класть, le perfectif положи́ть. Класть кни́гу, положи́ть кни́гу — jamais « ложи́ть кни́гу ».",
            "Le verbe ложи́ться existe, mais c'est le réfléchi « se coucher » : Я ложу́сь спать в оди́ннадцать.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le russe choisit le verbe selon la position : debout, couché, suspendu.",
            "Position : стоя́ть, лежа́ть, висе́ть (+ prépositionnel).",
            "Mise en position : ста́вить, класть, ве́шать (+ accusatif).",
            "класть / положи́ть : « ложи́ть » n'existe pas.",
          ],
        },
      ],
    },
    {
      slug: "apprendre-savoir-connaitre",
      title: "Apprendre, savoir, connaître",
      titleRu: "Учить, знать, уметь",
      level: "B1",
      minutes: 9,
      summary:
        "Quatre verbes russes pour « apprendre », deux pour « savoir » : le français est ici beaucoup plus pauvre, et cela se paie en erreurs.",
      keywords: ["учить", "учиться", "изучать", "заниматься", "знать", "уметь"],
      sections: [
        {
          kind: "table",
          title: "La famille « apprendre »",
          head: ["Verbe", "Construction", "Sens précis"],
          rows: [
            ["учи́ть", "+ accusatif", "apprendre par cœur, mémoriser"],
            ["учи́ть", "+ datif de personne + accusatif", "enseigner à quelqu'un"],
            ["учи́ться", "+ lieu au prépositionnel", "être élève, faire ses études"],
            ["учи́ться", "+ infinitif", "apprendre à faire"],
            ["изуча́ть", "+ accusatif", "étudier une matière en profondeur"],
            ["занима́ться", "+ instrumental", "s'occuper de, pratiquer, travailler à"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я учу́ но́вые слова́.", fr: "J'apprends de nouveaux mots.", note: "mémorisation" },
            { ru: "Я учу́сь в университе́те.", fr: "J'étudie à l'université.", note: "statut d'étudiant" },
            { ru: "Я учу́сь води́ть маши́ну.", fr: "J'apprends à conduire." },
            { ru: "Я изуча́ю ру́сский язы́к.", fr: "J'étudie le russe.", note: "matière, en profondeur" },
            { ru: "Я занима́юсь ру́сским ка́ждый день.", fr: "Je travaille mon russe tous les jours." },
          ],
        },
        {
          kind: "prose",
          title: "Знать, уме́ть, мочь",
          body: [
            "Знать = connaître une information ou une personne : Я зна́ю его́ а́дрес, Я зна́ю его́. Уме́ть = savoir faire, avoir la compétence : Я уме́ю пла́вать. Мочь = pouvoir dans les circonstances : Я не могу́ прийти́ сего́дня.",
            "Le français « je sais nager » et « je peux nager » se distinguent mal ; le russe, lui, sépare la compétence acquise (уме́ть) de la possibilité du moment (мочь). Dire Я зна́ю пла́вать est une faute que fait tout débutant francophone.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "учи́ть = mémoriser ou enseigner ; учи́ться = être élève ou apprendre à faire.",
            "изуча́ть = étudier une matière ; занима́ться + instrumental = pratiquer.",
            "знать = une information ; уме́ть = une compétence ; мочь = une possibilité.",
            "Jamais « знать + infinitif ».",
          ],
        },
      ],
      practice: [{ href: "/vocabulary", label: "Travailler ce vocabulaire" }],
    },
    {
      slug: "faux-amis",
      title: "Les faux amis franco-russes",
      titleRu: "Ложные друзья переводчика",
      level: "B2",
      minutes: 8,
      summary:
        "Магази́н n'est pas un magazine, актуа́льный n'est pas actuel : la liste des mots qui ressemblent au français et disent autre chose.",
      keywords: ["faux amis", "ложные друзья", "журнал", "актуальный", "аккуратный", "traduction"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe a emprunté massivement au français aux XVIIIᵉ et XIXᵉ siècles, ce qui crée une familiarité trompeuse : des centaines de mots se reconnaissent, et une partie d'entre eux a dérivé.",
          ],
        },
        {
          kind: "table",
          title: "Les pièges les plus fréquents",
          head: ["Mot russe", "Ce qu'il signifie", "Ce qu'il ne signifie pas"],
          rows: [
            ["магази́н", "magasin, boutique", "un magazine (= журна́л)"],
            ["журна́л", "revue, magazine", "un journal (= газе́та)"],
            ["актуа́льный", "d'actualité, pertinent", "actuel au sens de « présent »"],
            ["аккура́тный", "soigné, ordonné", "à l'heure"],
            ["конце́рн", "groupe industriel", "un concert (= конце́рт)"],
            ["дире́ктор", "directeur, chef d'établissement", "un directeur de thèse (= нау́чный руководи́тель)"],
            ["ба́тон", "baguette de pain", "un bâton (= па́лка)"],
            ["интеллиге́нтный", "cultivé, bien élevé", "intelligent (= у́мный)"],
            ["симпати́чный", "mignon, agréable à voir", "sympathique de caractère"],
            ["фами́лия", "nom de famille", "la famille (= семья́)"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я купи́л ба́тон в магази́не.", fr: "J'ai acheté une baguette au magasin." },
            { ru: "Как ва́ша фами́лия?", fr: "Quel est votre nom de famille ?" },
            { ru: "Э́то о́чень актуа́льный вопро́с.", fr: "C'est une question très actuelle, très pertinente." },
            { ru: "Она́ о́чень симпати́чная.", fr: "Elle est très mignonne." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "журна́л = revue, газе́та = journal.",
            "фами́лия = nom de famille, семья́ = famille.",
            "интеллиге́нтный = cultivé et bien élevé, pas « intelligent ».",
            "En cas de familiarité suspecte, vérifier : c'est souvent un faux ami.",
          ],
        },
      ],
    },
    {
      slug: "emprunts-et-internationalismes",
      title: "Emprunts et internationalismes",
      titleRu: "Заимствования",
      level: "B1",
      minutes: 7,
      summary:
        "Des milliers de mots sont déjà connus : il suffit d'apprendre les correspondances de sons entre le latin, le français et le russe.",
      keywords: ["emprunts", "заимствования", "internationalismes", "-ция", "cognats"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe partage avec le français un vaste fonds international, gréco-latin ou anglais. Une fois trois ou quatre correspondances repérées, on lit ces mots à vue.",
          ],
        },
        {
          kind: "table",
          title: "Correspondances régulières",
          head: ["Français", "Russe", "Exemples"],
          rows: [
            ["-tion", "-ция", "révolution → револю́ция, information → информа́ция"],
            ["-té", "-тет / -ость", "université → университе́т, qualité → ка́чество"],
            ["-ique", "-ика / -ический", "musique → му́зыка, classique → класси́ческий"],
            ["-isme", "-изм", "réalisme → реали́зм"],
            ["-eur (agent)", "-ор / -ёр", "docteur → до́ктор, ingénieur → инжене́р"],
            ["h- initial", "г-", "hôpital → го́спиталь, Hitler → Ги́тлер"],
            ["ph", "ф", "philosophie → филосо́фия"],
          ],
        },
        {
          kind: "prose",
          title: "Les emprunts récents",
          body: [
            "La vague contemporaine vient de l'anglais, surtout dans les technologies et les affaires : компью́тер, интерне́т, ме́неджер, ма́ркетинг, дедла́йн, фи́дбек. Ces mots se déclinent normalement, à l'exception de ceux qui finissent par une voyelle inhabituelle.",
            "Beaucoup gardent une orthographe flottante et un statut discuté ; les puristes proposent des équivalents russes qui ne prennent pas toujours. Un apprenant peut les employer sans crainte : ils sont partout.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́то интере́сная информа́ция.", fr: "C'est une information intéressante." },
            { ru: "Он рабо́тает ме́неджером.", fr: "Il travaille comme manager.", note: "instrumental de profession" },
            { ru: "Мне ну́жен но́вый компью́тер.", fr: "J'ai besoin d'un nouvel ordinateur." },
            { ru: "Она́ изуча́ет филосо́фию в университе́те.", fr: "Elle étudie la philosophie à l'université." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "-tion → -ция, -ique → -ика, -isme → -изм.",
            "h français → г russe.",
            "Les emprunts anglais récents se déclinent normalement.",
            "Ce fonds commun représente plusieurs milliers de mots gratuits.",
          ],
        },
      ],
    },
    {
      slug: "mots-composes-et-abreviations",
      title: "Mots composés et abréviations",
      titleRu: "Сложные слова и аббревиатуры",
      level: "B2",
      minutes: 7,
      summary:
        "Зарпла́та, вуз, МГУ : le russe compresse ses expressions en un mot, et l'écrit administratif en abuse.",
      keywords: ["abréviation", "аббревиатура", "вуз", "зарплата", "МГУ", "composés"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe compose de trois façons. Par SOUDURE de deux racines avec une voyelle de liaison : пар + о + воз = парово́з (locomotive à vapeur). Par TRONCATION des mots d'une expression : зарабо́тная пла́та → зарпла́та (salaire). Par SIGLE : Моско́вский госуда́рственный университе́т → МГУ.",
            "La deuxième méthode a explosé au XXᵉ siècle et reste très productive dans la langue administrative et professionnelle.",
          ],
        },
        {
          kind: "table",
          title: "Les abréviations à connaître",
          head: ["Forme", "Développé", "Sens"],
          rows: [
            ["вуз", "вы́сшее уче́бное заведе́ние", "établissement d'enseignement supérieur"],
            ["зарпла́та", "зарабо́тная пла́та", "salaire"],
            ["сберба́нк", "сберега́тельный банк", "caisse d'épargne"],
            ["МГУ", "Моско́вский госуда́рственный университе́т", "université d'État de Moscou"],
            ["РФ", "Росси́йская Федера́ция", "Fédération de Russie"],
            ["и т. д.", "и так да́лее", "etc."],
            ["т. е.", "то есть", "c'est-à-dire"],
            ["см.", "смотри́", "voir"],
          ],
        },
        {
          kind: "prose",
          title: "Se déclinent-elles ?",
          body: [
            "Les abréviations tronquées se déclinent comme des noms ordinaires : в вузе, зарпла́ты. Les sigles se déclinent s'ils se prononcent comme un mot et sont masculins (в МИДе), et restent invariables sinon : в МГУ, в РФ.",
            "Le genre d'un sigle suit en principe celui du mot principal développé : МГУ est masculin parce que университе́т l'est ; ООН est féminin parce qu'организа́ция l'est.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он у́чится в МГУ.", fr: "Il étudie à l'université d'État de Moscou.", note: "sigle non décliné" },
            { ru: "Зарпла́ту пла́тят в конце́ ме́сяца.", fr: "Le salaire est versé à la fin du mois." },
            { ru: "Она́ поступи́ла в вуз в про́шлом году́.", fr: "Elle est entrée dans le supérieur l'an dernier." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Soudure, troncation, sigle : trois procédés.",
            "Les tronqués se déclinent comme des noms.",
            "Les sigles se déclinent seulement s'ils se lisent comme un mot.",
            "Le genre d'un sigle suit celui de son mot principal.",
          ],
        },
      ],
    },
  ],
};
