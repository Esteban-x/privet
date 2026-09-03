import type { Unit } from "../types";

/**
 * Unité 3 — la déclinaison, cas par cas puis pluriel par pluriel. C'est
 * l'unité la plus longue du programme, et celle qui débloque tout le reste :
 * sans elle, aucune phrase russe ne se construit.
 */
export const UNIT_CAS: Unit = {
  slug: "les-six-cas",
  title: "Le nom et ses six cas",
  titleRu: "Шесть падежей",
  subtitle:
    "Ce que devient un nom selon sa fonction : les six cas, chacun donné en entier — singulier et pluriel — irréguliers compris.",
  color: "#8B2FA0",
  lessons: [
    {
      slug: "a-quoi-servent-les-cas",
      title: "À quoi servent les cas",
      titleRu: "Зачем нужны падежи",
      level: "A1",
      minutes: 10,
      summary:
        "Le russe marque la fonction du mot sur le mot lui-même. C'est ce qui libère l'ordre des mots — et ce qui oblige à décliner.",
      keywords: ["cas", "déclinaison", "падеж", "fonction", "ordre des mots"],
      sections: [
        {
          kind: "prose",
          body: [
            "En français, la fonction d'un mot se lit à sa place dans la phrase : « le chat voit le chien » et « le chien voit le chat » emploient les mêmes mots et disent le contraire. La position fait tout le travail.",
            "Le russe procède autrement : il marque la fonction sur le mot, par une terminaison. Ко́шка ви́дит соба́ку et Соба́ку ви́дит ко́шка signifient exactement la même chose, parce que -у sur соба́ку dit « objet » où qu'elle se trouve dans la phrase.",
          ],
        },
        {
          kind: "table",
          title: "Les six cas et leur question",
          head: ["Cas", "Nom russe", "Question", "Rôle principal"],
          rows: [
            ["Nominatif", "имени́тельный", "кто? что?", "sujet, attribut"],
            ["Génitif", "роди́тельный", "кого́? чего́?", "possession, absence, quantité"],
            ["Datif", "да́тельный", "кому́? чему́?", "destinataire, âge, sensation"],
            ["Accusatif", "вини́тельный", "кого́? что?", "objet direct, direction"],
            ["Instrumental", "твори́тельный", "кем? чем?", "moyen, accompagnement, attribut"],
            ["Prépositionnel", "предло́жный", "о ком? о чём? где?", "lieu, sujet de discours"],
          ],
          note: "Les Russes récitent l'ordre И-Р-Д-В-Т-П ; les manuels étrangers commencent souvent par le nominatif, le prépositionnel et l'accusatif, qui sont les plus rentables.",
        },
        {
          kind: "prose",
          title: "Qui décide du cas",
          body: [
            "Trois forces imposent un cas, et une seule à la fois. La FONCTION dans la phrase : sujet au nominatif, objet direct à l'accusatif. La PRÉPOSITION : chacune régit un ou deux cas, sans exception ni liberté. Le VERBE : certains verbes exigent un cas particulier pour leur complément (помога́ть + datif, занима́ться + instrumental).",
            "Poser la question du cas est donc un réflexe en trois temps : y a-t-il une préposition ? sinon, le verbe impose-t-il un cas ? sinon, quelle est la fonction du mot ? La leçon « Choisir le bon cas » de cette unité en fait une méthode.",
          ],
        },
        {
          kind: "examples",
          title: "Le même mot, six fois",
          items: [
            { ru: "Э́то брат.", fr: "C'est le frère.", note: "nominatif" },
            { ru: "У меня́ нет бра́та.", fr: "Je n'ai pas de frère.", note: "génitif" },
            { ru: "Я пишу́ бра́ту.", fr: "J'écris à mon frère.", note: "datif" },
            { ru: "Я ви́жу бра́та.", fr: "Je vois mon frère.", note: "accusatif (animé = génitif)" },
            { ru: "Я говорю́ с бра́том.", fr: "Je parle avec mon frère.", note: "instrumental" },
            { ru: "Я ду́маю о бра́те.", fr: "Je pense à mon frère.", note: "prépositionnel" },
          ],
        },
        {
          kind: "pitfall",
          title: "Ce n'est pas « une difficulté en plus »",
          body: [
            "La déclinaison paraît être un obstacle ajouté à la langue. C'est en réalité un échange : le russe demande des terminaisons et rend en échange la liberté de l'ordre des mots, l'absence d'articles, et l'absence de verbe « être » au présent.",
            "Six cas × trois genres × deux nombres semblent faire trente-six tableaux. En pratique, beaucoup de cases se répètent, et une dizaine de terminaisons couvrent l'essentiel de la langue parlée.",
            "Chaque leçon de cette unité prend d'ailleurs un cas et le donne en entier : ses terminaisons du singulier, puis celles du pluriel. Le pluriel d'un cas n'est pas un autre chapitre — c'est la seconde moitié du même.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "La terminaison porte la fonction ; l'ordre des mots porte l'emphase.",
            "Six cas, chacun avec sa question — apprendre la question, pas la liste.",
            "Le cas est imposé par une préposition, un verbe, ou la fonction.",
            "Aucun de ces trois déclencheurs ne laisse le choix.",
          ],
        },
      ],
      practice: [{ href: "/cases", label: "Les six cas en exercices" }],
    },
    {
      slug: "nominatif",
      title: "Le nominatif",
      titleRu: "Именительный падеж",
      level: "A0",
      minutes: 15,
      summary:
        "Le cas du sujet, et la forme sous laquelle un mot est donné dans le dictionnaire — puis son pluriel : deux terminaisons, les masculins en -а́ accentué, et les irréguliers.",
      keywords: [
        "nominatif",
        "именительный",
        "sujet",
        "dictionnaire",
        "attribut",
        "nominatif pluriel",
        "дома",
        "друзья",
        "люди",
      ],
      sections: [
        {
          kind: "prose",
          body: [
            "Le nominatif répond aux questions кто? (qui ?) et что? (quoi ?). C'est le cas du sujet du verbe, et la forme sous laquelle tout nom est listé dans un dictionnaire — donc celle qu'on apprend en apprenant le mot.",
            "Il sert aussi d'attribut dans les phrases sans verbe être : Мой брат — врач. Les deux termes y sont au nominatif, puisqu'aucun verbe ne vient imposer autre chose.",
          ],
        },
        {
          kind: "table",
          title: "Terminaisons du nominatif singulier",
          head: ["Genre", "Terminaison", "Exemples"],
          rows: [
            ["Masculin", "consonne, -й, -ь", "стол, музе́й, слова́рь"],
            ["Féminin", "-а, -я, -ь", "кни́га, неде́ля, ночь"],
            ["Neutre", "-о, -е, -мя", "окно́, мо́ре, вре́мя"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Мой друг живёт в Москве́.", fr: "Mon ami habite à Moscou.", note: "друг : sujet" },
            { ru: "Э́то но́вая кни́га.", fr: "C'est un livre neuf.", note: "attribut au nominatif" },
            { ru: "Пого́да сего́дня хоро́шая.", fr: "Le temps est beau aujourd'hui." },
            { ru: "У меня́ есть вопро́с.", fr: "J'ai une question.", note: "вопро́с est le vrai sujet de la construction" },
          ],
        },
        {
          kind: "pitfall",
          title: "Le sujet n'est pas toujours là où le français le met",
          body: [
            "Dans У меня́ есть маши́на, le sujet grammatical est маши́на (au nominatif), pas « je ». Dans Мне нра́вится э́та кни́га (« j'aime ce livre »), le sujet est кни́га, et « moi » est au datif.",
            "Repérer le nominatif d'une phrase russe, c'est repérer ce dont on dit quelque chose — pas traduire le sujet français.",
          ],
        },
        {
          kind: "table",
          title: "Au pluriel : les formes régulières",
          head: ["Genre", "Terminaison", "Exemples"],
          rows: [
            ["Masculin dur", "-ы", "стол → столы́, студе́нт → студе́нты"],
            ["Masculin en -й / -ь", "-и", "музе́й → музе́и, слова́рь → словари́"],
            ["Féminin en -а", "-ы", "ко́мната → ко́мнаты"],
            ["Féminin en -я / -ь", "-и", "неде́ля → неде́ли, ночь → но́чи"],
            ["Neutre en -о", "-а", "окно́ → о́кна"],
            ["Neutre en -е", "-я", "мо́ре → моря́"],
          ],
          note: "Après г, к, х, ж, ш, ч, щ, la terminaison -ы devient -и : кни́га → кни́ги.",
        },
        {
          kind: "prose",
          title: "Les masculins en -а́",
          body: [
            "Une centaine de masculins courants forment leur pluriel en -а́ / -я́ accentué au lieu de -ы : дом → дома́, го́род → города́, ве́чер → вечера́, по́езд → поезда́, глаз → глаза́, а́дрес → адреса́, учи́тель → учителя́, до́ктор → доктора́, па́спорт → паспорта́.",
            "Il n'y a pas de règle : c'est une liste, mais une liste utile, car ces mots sont parmi les plus employés. Quelques mots ont même deux pluriels de sens différents : учи́тели (les maîtres à penser) / учителя́ (les enseignants).",
          ],
        },
        {
          kind: "table",
          title: "Les pluriels irréguliers à connaître",
          head: ["Singulier", "Pluriel", "Sens"],
          rows: [
            ["брат", "бра́тья", "frères"],
            ["друг", "друзья́", "amis"],
            ["сын", "сыновья́", "fils"],
            ["стул", "сту́лья", "chaises"],
            ["де́рево", "дере́вья", "arbres"],
            ["челове́к", "лю́ди", "gens"],
            ["ребёнок", "де́ти", "enfants"],
            ["мать", "ма́тери", "mères"],
            ["дочь", "до́чери", "filles"],
            ["и́мя", "имена́", "prénoms"],
          ],
        },
        {
          kind: "examples",
          title: "Le pluriel en phrase",
          items: [
            { ru: "В го́роде но́вые дома́.", fr: "Il y a de nouvelles maisons dans la ville." },
            { ru: "Мои́ бра́тья живу́т в Ки́еве.", fr: "Mes frères habitent à Kiev." },
            { ru: "Э́ти лю́ди ждут авто́бус.", fr: "Ces gens attendent le bus." },
            { ru: "У них дво́е дете́й.", fr: "Ils ont deux enfants." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Questions : кто? что?",
            "Cas du sujet et de l'attribut sans verbe.",
            "Forme de dictionnaire : c'est elle qu'on mémorise.",
            "Le nominatif russe ne coïncide pas toujours avec le sujet français.",
            "Pluriel : -ы / -и pour les masculins et les féminins, -а / -я pour les neutres.",
            "Une série fréquente de masculins fait -а́ accentué : дома́, города́.",
            "бра́тья, друзья́, сту́лья, дере́вья en -ья ; лю́ди et де́ти remplacent leur singulier.",
          ],
        },
      ],
      practice: [{ href: "/cases/nominative", label: "Exercice : le nominatif" }],
    },
    {
      slug: "prepositionnel",
      title: "Le prépositionnel",
      titleRu: "Предложный падеж",
      level: "A1",
      minutes: 12,
      summary:
        "Le cas du lieu où l'on est et du sujet dont on parle. Le plus simple des cas obliques : presque tout finit en -е au singulier, et tout finit en -ах au pluriel.",
      keywords: ["prépositionnel", "предложный", "в", "на", "о", "lieu", "где", "-ах"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le prépositionnel ne s'emploie jamais seul : il exige toujours une préposition, d'où son nom. Trois usages principaux : le lieu où l'on se trouve (в, на), le sujet d'une pensée ou d'un discours (о), et le moyen de transport (на).",
            "C'est le premier cas oblique enseigné, parce que ses terminaisons sont d'une régularité rare : -е pour l'écrasante majorité des noms, tous genres confondus.",
          ],
        },
        {
          kind: "table",
          title: "Terminaisons",
          head: ["Nominatif", "Prépositionnel", "Règle"],
          rows: [
            ["стол", "в столе́", "consonne + е"],
            ["кни́га", "в кни́ге", "-а → -е"],
            ["окно́", "в окне́", "-о → -е"],
            ["мо́ре", "в мо́ре", "-е → -е"],
            ["Росси́я", "в Росси́и", "-ия → -ии"],
            ["зда́ние", "в зда́нии", "-ие → -ии"],
            ["ночь", "о но́чи", "féminin en -ь → -и"],
          ],
        },
        {
          kind: "prose",
          title: "В ou на ?",
          body: [
            "В signifie « dans », на signifie « sur ». Mais la répartition ne suit pas toujours la logique française : на s'emploie avec les surfaces ouvertes et les activités (на рабо́те, на уро́ке, на конце́рте, на по́чте, на у́лице, на вокза́ле), в avec les espaces clos et les entités géographiques (в до́ме, в шко́ле, в Росси́и, в го́роде).",
            "Il y a une liste à apprendre, courte mais impérative : на заво́де (à l'usine), на факульте́те, на ры́нке, на ста́нции, на се́вере / ю́ге / восто́ке / за́паде. Et une paire piège : в Украи́не / на Украи́не, dont l'usage a une histoire politique — la forme в est aujourd'hui la norme.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я живу́ в Москве́.", fr: "J'habite à Moscou." },
            { ru: "Он на рабо́те.", fr: "Il est au travail." },
            { ru: "Мы говори́ли о фи́льме.", fr: "Nous avons parlé du film." },
            { ru: "Она́ е́дет на маши́не.", fr: "Elle voyage en voiture.", note: "на + prépositionnel pour le moyen de transport" },
            { ru: "Кни́га на столе́.", fr: "Le livre est sur la table." },
            { ru: "В ма́е бу́дет тепло́.", fr: "Il fera chaud en mai.", note: "в + mois au prépositionnel" },
          ],
        },
        {
          kind: "pitfall",
          title: "О devient об, puis обо",
          body: [
            "La préposition о (« au sujet de ») devient об devant une voyelle : об э́том, об А́нне. Et обо dans quelques groupes figés : обо мне́, обо всём.",
            "C'est une commodité de prononciation, comparable au « l'ami » français — mais ici, il faut y penser en écrivant.",
          ],
        },
        {
          kind: "table",
          title: "Au pluriel",
          head: ["Radical", "Terminaison", "Exemple"],
          rows: [
            ["dur", "-ах", "в города́х — dans les villes"],
            ["mou", "-ях", "о друзья́х — au sujet des amis"],
          ],
          note: "Une seule terminaison pour les trois genres : au pluriel, le prépositionnel, le datif et l'instrumental cessent de distinguer masculin, féminin et neutre. Seule la mouillure du radical joue encore.",
        },
        {
          kind: "examples",
          title: "Le pluriel en phrase",
          items: [
            { ru: "В э́тих города́х краси́вые па́рки.", fr: "Dans ces villes, les parcs sont beaux." },
            { ru: "Мы говори́ли о фи́льмах.", fr: "Nous avons parlé des films." },
            { ru: "Она́ ду́мает о де́тях.", fr: "Elle pense aux enfants.", note: "де́тях : pluriel irrégulier de ребёнок" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Toujours après une préposition : в, на, о, при.",
            "Terminaison -е dans la grande majorité des cas.",
            "-ия / -ие / -ий font -ии ; les féminins en -ь font -и.",
            "в pour le clos, на pour les surfaces et les activités — avec une liste à apprendre.",
            "Pluriel : -ах / -ях, sans distinction de genre.",
          ],
        },
      ],
      practice: [{ href: "/cases/prepositional", label: "Exercice : le prépositionnel" }],
    },
    {
      slug: "accusatif",
      title: "L'accusatif",
      titleRu: "Винительный падеж",
      level: "A1",
      minutes: 13,
      summary:
        "Le cas de l'objet direct et de la direction. Sa vraie difficulté n'est pas sa forme : c'est la règle animé / inanimé, qui décide aussi de tout son pluriel.",
      keywords: [
        "accusatif",
        "винительный",
        "objet direct",
        "animé",
        "куда",
        "direction",
        "accusatif pluriel",
      ],
      sections: [
        {
          kind: "prose",
          body: [
            "L'accusatif marque ce que le verbe atteint directement : Я чита́ю кни́гу. Il marque aussi la direction, après в et на : Я иду́ в шко́лу — à comparer avec Я в шко́ле (prépositionnel : j'y suis déjà).",
            "Cette opposition direction / position est l'un des rouages les plus rentables du russe : la même préposition в change de sens selon le cas qui la suit.",
          ],
        },
        {
          kind: "table",
          title: "Terminaisons du singulier",
          head: ["Genre", "Forme", "Exemple"],
          rows: [
            ["Masculin inanimé", "= nominatif", "Я ви́жу стол."],
            ["Masculin animé", "= génitif", "Я ви́жу бра́та."],
            ["Féminin en -а", "-у", "Я ви́жу кни́гу."],
            ["Féminin en -я", "-ю", "Я ви́жу неде́лю."],
            ["Féminin en -ь", "= nominatif", "Я ви́жу дверь."],
            ["Neutre", "= nominatif", "Я ви́жу окно́."],
          ],
        },
        {
          kind: "prose",
          title: "Animé ou inanimé",
          body: [
            "Le russe classe les noms en animés (personnes et animaux) et inanimés (tout le reste). Les masculins animés prennent la forme du génitif à l'accusatif : Я жду бра́та, Я ви́жу студе́нта, Я люблю́ соба́к.",
            "Cette catégorie est grammaticale, pas biologique : мертве́ц (le mort) est animé, наро́д (le peuple) est inanimé. Les féminins singuliers ne sont pas concernés — leur accusatif en -у ne dépend pas de l'animation — mais le pluriel de tous les genres, si.",
          ],
        },
        {
          kind: "examples",
          title: "Direction contre position",
          items: [
            { ru: "Я иду́ в шко́лу.", fr: "Je vais à l'école.", note: "в + accusatif : mouvement" },
            { ru: "Я в шко́ле.", fr: "Je suis à l'école.", note: "в + prépositionnel : position" },
            { ru: "Он положи́л кни́гу на стол.", fr: "Il a posé le livre sur la table." },
            { ru: "Кни́га лежи́т на столе́.", fr: "Le livre est posé sur la table." },
            { ru: "Мы ждём Ива́на.", fr: "Nous attendons Ivan.", note: "animé : forme du génitif" },
            { ru: "Ка́ждый день я чита́ю газе́ту.", fr: "Chaque jour, je lis le journal.", note: "durée répétée : accusatif sans préposition" },
          ],
        },
        {
          kind: "table",
          title: "Au pluriel",
          head: ["Nominatif pluriel", "Accusatif pluriel", "Règle"],
          rows: [
            ["столы́ (inanimé)", "столы́", "= nominatif pluriel"],
            ["кни́ги (inanimé)", "кни́ги", "= nominatif pluriel"],
            ["бра́тья (animé)", "бра́тьев", "= génitif pluriel"],
            ["сёстры (animé)", "сестёр", "= génitif pluriel"],
          ],
          note: "L'accusatif pluriel n'a aucune forme à lui : il emprunte au nominatif ou au génitif selon l'animation. Et cette fois les féminins et les neutres sont concernés eux aussi, alors qu'au singulier la règle ne touchait que les masculins.",
        },
        {
          kind: "examples",
          title: "Le pluriel en phrase",
          items: [
            { ru: "Я чита́ю кни́ги.", fr: "Je lis des livres.", note: "inanimé : forme du nominatif" },
            { ru: "Я жду друзе́й.", fr: "J'attends mes amis.", note: "animé : forme du génitif" },
            { ru: "Она́ лю́бит соба́к.", fr: "Elle aime les chiens.", note: "animé, féminin : la règle vaut aussi" },
          ],
        },
        {
          kind: "pitfall",
          title: "Les verbes qui ne prennent pas l'accusatif",
          body: [
            "Le français a des verbes transitifs directs là où le russe demande un autre cas : помога́ть (aider) veut le datif, звони́ть (téléphoner) le datif, занима́ться (pratiquer) l'instrumental, боя́ться (craindre) le génitif.",
            "L'inverse existe aussi : слу́шать (écouter) et жда́ть (attendre) sont directs en russe. On apprend donc le cas AVEC le verbe, comme on apprend la préposition d'un verbe français.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Objet direct et direction (в / на + accusatif).",
            "Féminin -а → -у, -я → -ю ; neutre et masculin inanimé inchangés.",
            "Masculin animé : forme identique au génitif.",
            "Pluriel : inanimé = nominatif, animé = génitif — pour les trois genres.",
            "в + accusatif = j'y vais ; в + prépositionnel = j'y suis.",
          ],
        },
      ],
      practice: [{ href: "/cases/accusative", label: "Exercice : l'accusatif" }],
    },
    {
      slug: "genitif",
      title: "Le génitif",
      titleRu: "Родительный падеж",
      level: "A1",
      minutes: 24,
      summary:
        "Le cas le plus employé du russe : possession, absence, quantité, prépositions. Et, au pluriel, la forme la plus redoutée de la langue — régie par une règle en balance.",
      keywords: [
        "génitif",
        "родительный",
        "possession",
        "нет",
        "много",
        "из",
        "от",
        "génitif pluriel",
        "-ов",
        "-ей",
        "книг",
      ],
      sections: [
        {
          kind: "prose",
          body: [
            "Le génitif est le cas le plus fréquent après le nominatif, parce qu'il couvre des emplois que le français répartit entre « de », « à » et rien du tout. Son idée centrale : rattacher un nom à un autre, ou signaler qu'une quantité, un manque ou une origine est en jeu.",
            "Il n'a pas d'équivalent unique en français, ce qui rend inutile toute traduction mécanique. On l'apprend par ses déclencheurs, qui sont peu nombreux et parfaitement identifiables.",
          ],
        },
        {
          kind: "table",
          title: "Terminaisons du singulier",
          head: ["Nominatif", "Génitif", "Règle"],
          rows: [
            ["стол", "стола́", "masculin dur + а"],
            ["музе́й", "музе́я", "-й → -я"],
            ["слова́рь", "словаря́", "-ь → -я"],
            ["окно́", "окна́", "neutre -о → -а"],
            ["мо́ре", "мо́ря", "neutre -е → -я"],
            ["кни́га", "кни́ги", "-а → -ы, ici -и (règle des 7 lettres)"],
            ["неде́ля", "неде́ли", "-я → -и"],
            ["ночь", "но́чи", "féminin -ь → -и"],
          ],
        },
        {
          kind: "prose",
          title: "Ses six déclencheurs",
          body: [
            "1. LA POSSESSION et le rattachement : кни́га бра́та (le livre du frère), центр го́рода. 2. L'ABSENCE : нет вре́мени, У меня́ нет де́нег. 3. LA QUANTITÉ : мно́го рабо́ты, ма́ло вре́мени, буты́лка воды́, ки́ло я́блок. 4. LES NOMBRES à partir de 5 : пять книг, avec les cas particuliers de 1 et de 2-4 vus dans l'unité des nombres.",
            "5. LES PRÉPOSITIONS : из, с, от, до, для, без, о́коло, по́сле, во вре́мя, кро́ме, про́тив, у. 6. CERTAINS VERBES : боя́ться (craindre), жела́ть (souhaiter), достига́ть (atteindre), и жда́ть quand l'objet est indéterminé.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́то маши́на отца́.", fr: "C'est la voiture de mon père." },
            { ru: "У меня́ нет вре́мени.", fr: "Je n'ai pas le temps." },
            { ru: "Он вы́пил ча́шку ко́фе.", fr: "Il a bu une tasse de café." },
            { ru: "Мы прие́хали из Пари́жа.", fr: "Nous sommes arrivés de Paris." },
            { ru: "По́сле рабо́ты я иду́ домо́й.", fr: "Après le travail, je rentre." },
            { ru: "Здесь мно́го наро́ду.", fr: "Il y a beaucoup de monde ici." },
          ],
        },
        {
          kind: "pitfall",
          title: "Le génitif de négation",
          body: [
            "Quand un verbe est nié, son objet direct passe souvent de l'accusatif au génitif : Я чита́ю кни́гу → Я не чита́ю кни́ги. C'est particulièrement systématique avec les objets indéterminés ou abstraits.",
            "Avec un objet précis et connu, l'accusatif se maintient : Я не чита́л э́ту кни́гу. La nuance est réelle : le génitif nie l'existence même de l'objet dans la situation, l'accusatif nie seulement l'action.",
          ],
        },
        {
          kind: "prose",
          title: "Au pluriel : la règle en balance",
          body: [
            "Le génitif pluriel a une réputation de cauchemar. Elle est imméritée : il obéit à une logique en balance. Les noms dont le nominatif singulier se termine par une consonne (donc « nus ») prennent une terminaison lourde, -ов ou -ей ; ceux dont le nominatif se termine par une voyelle (-а, -о) la perdent entièrement et finissent par… rien.",
            "Cette terminaison « zéro » est ce qui déroute : кни́га donne книг, окно́ donne о́кон. Le mot semble amputé, alors qu'il est exactement à la forme attendue.",
          ],
        },
        {
          kind: "table",
          title: "Les terminaisons du pluriel",
          head: ["Nominatif singulier", "Génitif pluriel", "Exemple"],
          rows: [
            ["masculin en consonne dure", "-ов", "стол → столо́в"],
            ["masculin en -й", "-ев", "музе́й → музе́ев"],
            ["masculin en -ь", "-ей", "слова́рь → словаре́й"],
            ["masculin en ж, ш, ч, щ", "-ей", "врач → враче́й"],
            ["féminin en -а", "∅ (rien)", "кни́га → книг"],
            ["féminin en -я", "-ь", "неде́ля → неде́ль"],
            ["féminin en -ия", "-ий", "ста́нция → ста́нций"],
            ["féminin en -ь", "-ей", "ночь → ноче́й"],
            ["neutre en -о", "∅ (rien)", "ме́сто → мест"],
            ["neutre en -е", "-ей", "мо́ре → море́й"],
            ["neutre en -ие", "-ий", "зда́ние → зда́ний"],
          ],
        },
        {
          kind: "prose",
          title: "La voyelle d'appui",
          body: [
            "Quand la terminaison zéro laisserait deux consonnes impossibles à prononcer en fin de mot, le russe insère une voyelle : о ou е. окно́ → о́кон, де́вушка → де́вушек, сестра́ → сестёр, де́ньги → де́нег, ру́чка → ру́чек.",
            "Le choix entre о et е suit la mouillure : е après une consonne molle ou une sifflante, о sinon. C'est mécanique, mais mieux vaut vérifier les mots fréquents une fois pour toutes.",
          ],
        },
        {
          kind: "examples",
          title: "Là où le génitif pluriel apparaît",
          items: [
            { ru: "У меня́ мно́го книг.", fr: "J'ai beaucoup de livres.", note: "après мно́го" },
            { ru: "В го́роде пять теа́тров.", fr: "Il y a cinq théâtres dans la ville.", note: "après un nombre ≥ 5" },
            { ru: "Здесь нет свобо́дных мест.", fr: "Il n'y a pas de places libres ici." },
            { ru: "Он прие́хал из Соединённых Шта́тов.", fr: "Il est arrivé des États-Unis." },
            { ru: "Не́сколько дней спустя́…", fr: "Quelques jours plus tard…" },
          ],
        },
        {
          kind: "pitfall",
          title: "Les formes qu'on croit fausses",
          body: [
            "Quelques génitifs pluriels ressemblent au nominatif singulier et donnent l'impression d'une erreur : раз → пять раз, солда́т → мно́го солда́т, челове́к → пять челове́к (mais мно́го люде́й), год → пять лет (emprunté à ле́то).",
            "Ce sont des formes attestées et obligatoires, pas des raccourcis. пять лет est la seule façon de dire « cinq ans ».",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Masculin et neutre : -а / -я. Féminin : -ы / -и.",
            "Possession, absence, quantité, nombres ≥ 5, une famille de prépositions.",
            "нет + génitif est LA construction d'absence.",
            "Sous négation, l'objet direct glisse souvent à l'accusatif → génitif.",
            "Pluriel — nominatif nu (consonne) ⇒ terminaison lourde : -ов, -ев, -ей.",
            "Pluriel — nominatif en voyelle ⇒ terminaison zéro : книг, мест. -ия / -ие ⇒ -ий.",
            "Voyelle d'appui о/е quand la fin devient imprononçable : о́кон, сестёр.",
            "пять лет, пять раз, пять челове́к : formes figées à mémoriser.",
          ],
        },
      ],
      practice: [{ href: "/cases/genitive", label: "Exercice : le génitif" }],
    },
    {
      slug: "datif",
      title: "Le datif",
      titleRu: "Дательный падеж",
      level: "A2",
      minutes: 12,
      summary:
        "Le cas du destinataire — et celui de la personne qui ressent : c'est lui qui porte l'âge, le froid, l'envie et le besoin. Au pluriel, une seule terminaison : -ам.",
      keywords: [
        "datif",
        "дательный",
        "destinataire",
        "мне",
        "нравится",
        "надо",
        "к",
        "по",
        "-ам",
      ],
      sections: [
        {
          kind: "prose",
          body: [
            "Le datif marque à qui l'on donne, dit, écrit, téléphone : Я пишу́ бра́ту. Jusque-là, il recouvre le complément d'attribution du français.",
            "Mais il porte aussi tout un pan de la langue que le français exprime par un sujet : « j'ai froid », « il faut que je », « ça me plaît » se disent en russe avec la personne au datif et aucun sujet grammatical. C'est la construction impersonnelle, extrêmement fréquente.",
          ],
        },
        {
          kind: "table",
          title: "Terminaisons du singulier",
          head: ["Nominatif", "Datif", "Règle"],
          rows: [
            ["брат", "бра́ту", "masculin + у"],
            ["музе́й", "музе́ю", "-й → -ю"],
            ["окно́", "окну́", "neutre -о → -у"],
            ["мо́ре", "мо́рю", "neutre -е → -ю"],
            ["кни́га", "кни́ге", "-а → -е"],
            ["неде́ля", "неде́ле", "-я → -е"],
            ["Росси́я", "Росси́и", "-ия → -ии"],
            ["ночь", "но́чи", "féminin -ь → -и"],
          ],
        },
        {
          kind: "examples",
          title: "Destinataire",
          items: [
            { ru: "Я звоню́ ма́ме ка́ждый день.", fr: "J'appelle ma mère tous les jours.", note: "звони́ть exige le datif" },
            { ru: "Он помога́ет дру́гу.", fr: "Il aide son ami.", note: "помога́ть aussi" },
            { ru: "Мы идём к врачу́.", fr: "Nous allons chez le médecin.", note: "к + datif : vers une personne" },
            { ru: "Скажи́те мне, пожа́луйста…", fr: "Dites-moi, s'il vous plaît…" },
          ],
        },
        {
          kind: "examples",
          title: "La personne qui ressent",
          items: [
            { ru: "Мне хо́лодно.", fr: "J'ai froid.", note: "aucun sujet : « à moi, froidement »" },
            { ru: "Мне два́дцать лет.", fr: "J'ai vingt ans." },
            { ru: "Мне нра́вится э́та пе́сня.", fr: "J'aime cette chanson.", note: "le sujet est пе́сня" },
            { ru: "Ему́ на́до рабо́тать.", fr: "Il doit travailler." },
            { ru: "Тебе́ ну́жен но́вый телефо́н.", fr: "Il te faut un nouveau téléphone.", note: "ну́жен s'accorde avec l'objet nécessaire" },
          ],
        },
        {
          kind: "pitfall",
          title: "Нра́виться n'est pas « aimer »",
          body: [
            "Мне нра́вится кни́га se traduit « j'aime ce livre » mais se construit comme « le livre me plaît » : кни́га est sujet, мне est datif, et le verbe s'accorde avec le livre — d'où Мне нра́вятся кни́ги au pluriel.",
            "Люби́ть, lui, fonctionne comme le français (я люблю́ + accusatif), mais il est plus fort : on l'emploie pour les personnes aimées et les goûts durables, pas pour dire qu'un film était sympa.",
          ],
        },
        {
          kind: "table",
          title: "Au pluriel",
          head: ["Radical", "Terminaison", "Exemple"],
          rows: [
            ["dur", "-ам", "Я пишу́ студе́нтам. — J'écris aux étudiants."],
            ["mou", "-ям", "Я пишу́ друзья́м. — J'écris à mes amis."],
          ],
          note: "Comme au prépositionnel et à l'instrumental, la terminaison est la même pour les trois genres.",
        },
        {
          kind: "examples",
          title: "Le pluriel en phrase",
          items: [
            { ru: "Он помога́ет роди́телям.", fr: "Il aide ses parents." },
            { ru: "Де́тям на́до спать.", fr: "Les enfants doivent dormir.", note: "construction impersonnelle au pluriel" },
            { ru: "Мне нра́вятся э́ти пе́сни.", fr: "J'aime ces chansons.", note: "le verbe s'accorde avec пе́сни, pas avec мне" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Masculin / neutre : -у / -ю. Féminin : -е (ou -и pour -ия et -ь).",
            "Pluriel : -ам / -ям, sans distinction de genre.",
            "Destinataire : дать, сказа́ть, писа́ть, звони́ть, помога́ть.",
            "к + datif = vers quelqu'un ; по + datif = sur, par, selon.",
            "Toutes les constructions de sensation et d'obligation passent par le datif.",
          ],
        },
      ],
      practice: [{ href: "/cases/dative", label: "Exercice : le datif" }],
    },
    {
      slug: "instrumental",
      title: "L'instrumental",
      titleRu: "Творительный падеж",
      level: "A2",
      minutes: 12,
      summary:
        "Le cas du moyen (« avec quoi »), de l'accompagnement (« avec qui ») et de l'attribut variable (« il est devenu médecin »). Au pluriel : -ами.",
      keywords: [
        "instrumental",
        "творительный",
        "с",
        "moyen",
        "profession",
        "стать",
        "-ами",
        "людьми",
      ],
      sections: [
        {
          kind: "prose",
          body: [
            "L'instrumental répond à кем? чем? — par qui, par quoi. Sans préposition, il exprime le moyen : Я пишу́ ру́чкой (j'écris avec un stylo). Avec с, il exprime l'accompagnement : Я иду́ с дру́гом.",
            "La distinction est nette et le français la brouille, puisqu'il emploie « avec » dans les deux cas. En russe, « je coupe avec un couteau » n'a pas de с : ножо́м suffit, et ajouter с voudrait dire que le couteau vous accompagne.",
          ],
        },
        {
          kind: "table",
          title: "Terminaisons du singulier",
          head: ["Nominatif", "Instrumental", "Règle"],
          rows: [
            ["стол", "столо́м", "masculin + ом"],
            ["музе́й", "музе́ем", "-й → -ем"],
            ["слова́рь", "словарём", "-ь → -ем / -ём"],
            ["окно́", "окно́м", "neutre -о → -ом"],
            ["мо́ре", "мо́рем", "neutre -е → -ем"],
            ["кни́га", "кни́гой", "-а → -ой"],
            ["неде́ля", "неде́лей", "-я → -ей"],
            ["ночь", "но́чью", "féminin -ь → -ью"],
          ],
          note: "Après ж, ш, ч, щ, ц en terminaison atone : -ем et -ей (с това́рищем, с у́лицей).",
        },
        {
          kind: "examples",
          items: [
            { ru: "Я ем суп ло́жкой.", fr: "Je mange la soupe avec une cuillère.", note: "moyen : pas de с" },
            { ru: "Я говорю́ с дру́гом.", fr: "Je parle avec un ami.", note: "accompagnement : с obligatoire" },
            { ru: "Он стал врачо́м.", fr: "Il est devenu médecin.", note: "стать exige l'instrumental" },
            { ru: "Она́ рабо́тает учи́телем.", fr: "Elle travaille comme enseignante." },
            { ru: "Мы занима́емся спо́ртом.", fr: "Nous faisons du sport.", note: "занима́ться + instrumental" },
            { ru: "Ве́чером я до́ма.", fr: "Le soir, je suis à la maison.", note: "moment de la journée : instrumental seul" },
          ],
        },
        {
          kind: "prose",
          title: "L'attribut variable",
          body: [
            "Après быть au passé ou au futur, стать, рабо́тать, каза́ться, счита́ться, l'attribut se met à l'instrumental : Он был студе́нтом, Она́ бу́дет врачо́м, Э́то ка́жется стра́нным.",
            "Le nominatif y est possible mais dit autre chose : Он был студе́нт (rare, littéraire) présente l'état comme une identité permanente, l'instrumental comme un état qui a duré un temps. Au présent sans copule, seul le nominatif est possible : Он студе́нт.",
          ],
        },
        {
          kind: "table",
          title: "Au pluriel",
          head: ["Radical", "Terminaison", "Exemple"],
          rows: [
            ["dur", "-ами", "со студе́нтами — avec les étudiants"],
            ["mou", "-ями", "с друзья́ми — avec des amis"],
          ],
          note: "Trois irréguliers fréquents gardent un -ьми ancien : людьми́, детьми́, дочерьми́.",
        },
        {
          kind: "examples",
          title: "Le pluriel en phrase",
          items: [
            { ru: "Она́ интересу́ется языка́ми.", fr: "Elle s'intéresse aux langues." },
            { ru: "Мы е́здили с детьми́ на мо́ре.", fr: "Nous sommes allés à la mer avec les enfants.", note: "детьми́ : irrégulier" },
            { ru: "Они́ ста́ли врача́ми.", fr: "Ils sont devenus médecins.", note: "attribut de стать, au pluriel" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Masculin / neutre : -ом / -ем. Féminin : -ой / -ей, et -ью pour les -ь.",
            "Pluriel : -ами / -ями, sans distinction de genre — sauf людьми́, детьми́, дочерьми́.",
            "Sans с : le moyen. Avec с : l'accompagnement.",
            "Attribut de быть au passé/futur, стать, рабо́тать : instrumental.",
            "Prépositions с, над, под, пе́ред, ме́жду, за (position).",
          ],
        },
      ],
      practice: [{ href: "/cases/instrumental", label: "Exercice : l'instrumental" }],
    },
    {
      slug: "noms-irreguliers",
      title: "Les noms irréguliers",
      titleRu: "Особые склонения",
      level: "B1",
      minutes: 10,
      summary:
        "Quatre familles à part : мать et дочь, les neutres en -мя, les mots en -ия/-ие, et les noms qui n'existent qu'au pluriel.",
      keywords: ["irréguliers", "мать", "время", "имя", "склонение", "exceptions"],
      sections: [
        {
          kind: "prose",
          body: [
            "La déclinaison russe est régulière à l'exception de quatre petits groupes. Ils sont peu nombreux, mais très employés : les ignorer, c'est buter sur des mots comme « mère », « temps » ou « nom » à chaque phrase.",
          ],
        },
        {
          kind: "table",
          title: "Мать et дочь : un -ер- surgit",
          head: ["Cas", "мать", "дочь"],
          rows: [
            ["Nominatif", "мать", "дочь"],
            ["Génitif", "ма́тери", "до́чери"],
            ["Datif", "ма́тери", "до́чери"],
            ["Accusatif", "мать", "дочь"],
            ["Instrumental", "ма́терью", "до́черью"],
            ["Prépositionnel", "о ма́тери", "о до́чери"],
          ],
        },
        {
          kind: "table",
          title: "Les neutres en -мя : un -ен- surgit",
          head: ["Cas", "и́мя (prénom)", "вре́мя (temps)"],
          rows: [
            ["Nominatif", "и́мя", "вре́мя"],
            ["Génitif", "и́мени", "вре́мени"],
            ["Datif", "и́мени", "вре́мени"],
            ["Accusatif", "и́мя", "вре́мя"],
            ["Instrumental", "и́менем", "вре́менем"],
            ["Prépositionnel", "об и́мени", "о вре́мени"],
          ],
          note: "Dix mots suivent ce modèle ; и́мя, вре́мя et зна́мя sont les seuls vraiment courants.",
        },
        {
          kind: "prose",
          title: "Les mots en -ия, -ие, -ий",
          body: [
            "Ils ne sont pas irréguliers à proprement parler, mais ils ont une particularité constante : leur prépositionnel finit en -ии et non en -е. в Росси́и, в зда́нии, о Дми́трии.",
            "Le datif féminin en -ия fait également -ии : Я пишу́ Мари́и. C'est l'écart le plus fréquent avec le tableau standard.",
          ],
        },
        {
          kind: "prose",
          title: "Les pluriels seuls et les singuliers seuls",
          body: [
            "Certains noms n'ont pas de singulier : де́ньги (argent), часы́ (montre), очки́ (lunettes), брю́ки (pantalon), но́жницы (ciseaux), кани́кулы (vacances scolaires). Ils se déclinent normalement, mais toujours au pluriel — et le verbe s'accorde au pluriel : Где мои́ очки́?",
            "À l'inverse, les noms de matière et d'abstraction n'ont pas de pluriel : молоко́, вода́ (sauf sens spécial), любо́вь, сча́стье, информа́ция. « Des informations » se dit информа́ция, au singulier.",
          ],
        },
        {
          kind: "examples",
          title: "Les irréguliers en phrase",
          items: [
            { ru: "Я говори́л с ма́терью вчера́.", fr: "J'ai parlé avec ma mère hier.", note: "instrumental de мать : ма́терью" },
            { ru: "У меня́ нет вре́мени.", fr: "Je n'ai pas le temps.", note: "génitif de вре́мя : вре́мени" },
            { ru: "Он верну́лся к до́чери.", fr: "Il est retourné auprès de sa fille.", note: "datif de дочь : до́чери" },
            { ru: "Как ва́ше и́мя и о́тчество?", fr: "Quels sont votre prénom et votre patronyme ?" },
            { ru: "Где мои́ очки́? Они́ на столе́.", fr: "Où sont mes lunettes ? Elles sont sur la table.", note: "очки́ n'a pas de singulier : verbe et pronom restent au pluriel" },
            { ru: "У меня́ ма́ло де́нег.", fr: "J'ai peu d'argent.", note: "génitif pluriel de де́ньги : де́нег" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "мать / дочь insèrent -ер- à tous les cas obliques.",
            "и́мя / вре́мя insèrent -ен-.",
            "-ия, -ие, -ий font leur prépositionnel en -ии.",
            "де́ньги, часы́, очки́ n'existent qu'au pluriel ; информа́ция n'existe qu'au singulier.",
          ],
        },
      ],
    },
    {
      slug: "voyelles-mobiles",
      title: "Les voyelles mobiles",
      titleRu: "Беглые гласные",
      level: "B1",
      minutes: 7,
      summary:
        "Une voyelle qui disparaît dès que le mot se décline : день → дня. Ce n'est pas une exception, c'est un mécanisme.",
      keywords: ["voyelle mobile", "беглые гласные", "день", "отец", "génitif", "radical"],
      sections: [
        {
          kind: "prose",
          body: [
            "Beaucoup de noms masculins perdent leur dernière voyelle dès qu'on leur ajoute une terminaison : день → дня, оте́ц → отца́, пода́рок → пода́рка, у́гол → угла́. Le phénomène s'appelle « voyelle fugitive » et remonte à l'histoire de la langue.",
            "Il ne touche que о et е, jamais и ni у, et il ne se produit qu'entre deux consonnes en fin de radical. Une fois repéré sur le génitif singulier, il vaut pour toute la déclinaison.",
          ],
        },
        {
          kind: "table",
          title: "Le mécanisme",
          head: ["Nominatif", "Génitif", "Ce qui tombe"],
          rows: [
            ["день", "дня", "е"],
            ["оте́ц", "отца́", "е"],
            ["ры́нок", "ры́нка", "о"],
            ["пода́рок", "пода́рка", "о"],
            ["у́гол", "угла́", "о"],
            ["коне́ц", "конца́", "е"],
            ["америка́нец", "америка́нца", "е, comme tous les noms en -ец"],
          ],
        },
        {
          kind: "prose",
          title: "Le mouvement inverse",
          body: [
            "Au génitif pluriel des féminins et des neutres, la voyelle fait le chemin contraire : elle apparaît là où il n'y en avait pas, pour éviter un groupe imprononçable. ру́чка → ру́чек, де́вушка → де́вушек, окно́ → о́кон, письмо́ → пи́сем.",
            "Une même langue, une même contrainte : le russe n'aime pas terminer un mot sur deux ou trois consonnes qui ne s'enchaînent pas.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Сего́дня хоро́ший день.", fr: "Aujourd'hui est une belle journée." },
            { ru: "У меня́ нет вре́мени сего́дня, до за́втрашнего дня.", fr: "Je n'ai pas le temps aujourd'hui, à demain.", note: "дня, sans е" },
            { ru: "Э́то пода́рок для отца́.", fr: "C'est un cadeau pour mon père." },
            { ru: "У меня́ мно́го ру́чек.", fr: "J'ai beaucoup de stylos.", note: "ру́чка → ру́чек : voyelle insérée" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Seuls о et е sont mobiles.",
            "Ils tombent dès la première terminaison ajoutée : день → дня.",
            "Ils apparaissent au génitif pluriel des mots en -ка, -ко : ру́чек, о́кон.",
            "Le génitif singulier révèle le comportement du mot : c'est la forme à vérifier.",
          ],
        },
      ],
    },
    {
      slug: "noms-indeclinables",
      title: "Les noms indéclinables",
      titleRu: "Несклоняемые существительные",
      level: "A2",
      minutes: 6,
      summary:
        "Ко́фе, метро́, такси́, пальто́ : des mots qui ne changent jamais de forme, et dont le genre se décide autrement.",
      keywords: ["indéclinable", "несклоняемые", "кофе", "метро", "emprunts", "noms propres"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les emprunts terminés par une voyelle inhabituelle pour le russe ne se déclinent pas du tout : метро́, такси́, ко́фе, пальто́, кино́, ра́дио, меню́, шоссе́, кафе́, интервью́. Ils gardent la même forme aux six cas et aux deux nombres.",
            "Leur genre se décide par leur sens ou par défaut : la plupart sont neutres (метро́, кино́, пальто́), les noms d'animaux sont masculins (кенгуру́), et les noms de personnes suivent la personne (ма́дам est féminin).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я е́ду на метро́.", fr: "Je prends le métro.", note: "aucune terminaison ajoutée" },
            { ru: "В метро́ мно́го люде́й.", fr: "Il y a beaucoup de monde dans le métro." },
            { ru: "Он купи́л но́вое пальто́.", fr: "Il a acheté un nouveau manteau.", note: "l'adjectif, lui, se décline et porte le genre" },
            { ru: "Мы пи́ли ко́фе без са́хара.", fr: "Nous avons bu du café sans sucre." },
          ],
        },
        {
          kind: "prose",
          title: "Les noms propres étrangers",
          body: [
            "Les noms de famille étrangers en -о, -и, -е, -у ne se déclinent pas : фильм Таранти́но, о Дюма́, у Го́голя (déclinable, car russe). Les prénoms féminins terminés par une consonne ne se déclinent pas non plus : с Ка́рмен, о Жакли́н.",
            "En revanche, un nom de famille masculin terminé par une consonne se décline, même étranger : у Смирно́ва comme у Шми́дта. Une femme portant ce même nom garde la forme non déclinée : у Шмидт.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Forme unique aux six cas : метро́, ко́фе, такси́, пальто́.",
            "Genre neutre par défaut, sauf sens contraire.",
            "L'adjectif qui les accompagne, lui, se décline : но́вое пальто́.",
            "Noms de famille étrangers : déclinés au masculin, invariables au féminin.",
          ],
        },
      ],
    },
    {
      slug: "choisir-le-bon-cas",
      title: "Choisir le bon cas",
      titleRu: "Как выбрать падеж",
      level: "B1",
      minutes: 11,
      summary:
        "La méthode en trois questions qui remplace l'hésitation : préposition, verbe, fonction — dans cet ordre.",
      keywords: ["méthode", "choisir", "cas", "récapitulatif", "падеж", "révision"],
      sections: [
        {
          kind: "prose",
          body: [
            "Un débutant hésite parce qu'il cherche « le cas du mot ». Or un mot n'a pas de cas en soi : il en reçoit un, de quelque chose d'autre dans la phrase. Trouver ce déclencheur, c'est trouver le cas.",
            "Trois questions, posées dans cet ordre, tranchent la quasi-totalité des situations.",
          ],
        },
        {
          kind: "table",
          title: "La méthode",
          head: ["Question", "Si oui", "Exemple"],
          rows: [
            [
              "1. Y a-t-il une préposition ?",
              "elle impose le cas — apprendre la préposition avec son cas",
              "из + génitif → из до́ма",
            ],
            [
              "2. Le verbe impose-t-il un cas ?",
              "le régime du verbe l'emporte",
              "помога́ть + datif → помога́ть дру́гу",
            ],
            [
              "3. Quelle est la fonction ?",
              "sujet → nominatif, objet direct → accusatif",
              "Я чита́ю кни́гу",
            ],
          ],
        },
        {
          kind: "table",
          title: "Mémo des prépositions les plus fréquentes",
          head: ["Cas", "Prépositions"],
          rows: [
            ["Génitif", "из, с (depuis), от, до, для, без, о́коло, по́сле, кро́ме, у"],
            ["Datif", "к, по"],
            ["Accusatif", "в / на (direction), че́рез, за (en échange de), про"],
            ["Instrumental", "с (avec), над, под, пе́ред, за (derrière), ме́жду"],
            ["Prépositionnel", "в / на (lieu), о, при"],
          ],
          note: "в, на et за figurent deux fois : elles changent de cas selon qu'il y a mouvement ou position.",
        },
        {
          kind: "table",
          title: "Un nom, six cas, deux nombres",
          head: ["Cas", "Singulier", "Pluriel"],
          rows: [
            ["Nominatif", "студе́нт", "студе́нты"],
            ["Génitif", "студе́нта", "студе́нтов"],
            ["Datif", "студе́нту", "студе́нтам"],
            ["Accusatif", "студе́нта", "студе́нтов"],
            ["Instrumental", "студе́нтом", "студе́нтами"],
            ["Prépositionnel", "о студе́нте", "о студе́нтах"],
          ],
          note: "Animé : l'accusatif copie le génitif, au singulier comme au pluriel. Et au pluriel, datif, instrumental et prépositionnel n'ont plus qu'une forme pour les trois genres — -ам, -ами, -ах.",
        },
        {
          kind: "examples",
          title: "La méthode en action",
          items: [
            {
              ru: "Я иду́ к врачу́.",
              fr: "Je vais chez le médecin.",
              note: "préposition к → datif, question 1 suffit",
            },
            {
              ru: "Я жду авто́бус.",
              fr: "J'attends le bus.",
              note: "pas de préposition ; жда́ть prend l'accusatif pour un objet déterminé",
            },
            {
              ru: "Мы говори́ли о поли́тике.",
              fr: "Nous avons parlé de politique.",
              note: "о → prépositionnel",
            },
            {
              ru: "Он занима́ется му́зыкой.",
              fr: "Il fait de la musique.",
              note: "занима́ться → instrumental, régime du verbe",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "Deux réflexes français à désamorcer",
          body: [
            "« De » ne se traduit pas par un cas unique : de Paris = из Пари́жа (génitif), parler de = о + prépositionnel, une tasse de = ча́шка + génitif. C'est le sens, pas le mot français, qui décide.",
            "« À » non plus : à Moscou (position) = в Москве́, à Moscou (direction) = в Москву́, à mon frère = бра́ту, à midi = в по́лдень. Traduire préposition par préposition mène à l'erreur une fois sur deux.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Préposition d'abord, régime du verbe ensuite, fonction en dernier.",
            "Une préposition s'apprend toujours avec son cas.",
            "в / на / за changent de cas selon mouvement ou position.",
            "Ne jamais traduire « de » ou « à » directement : chercher le sens.",
          ],
        },
      ],
      practice: [{ href: "/cases", label: "Les six cas en exercices" }],
    },
  ],
};
