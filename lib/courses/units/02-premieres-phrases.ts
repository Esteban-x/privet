import type { Unit } from "../types";

/**
 * Unité 2 — de quoi former des phrases complètes avant d'avoir vu un seul
 * tableau de déclinaison. Tout ici tient au nominatif.
 */
export const UNIT_PREMIERES_PHRASES: Unit = {
  slug: "premieres-phrases",
  title: "Premiers mots, premières phrases",
  titleRu: "Первые фразы",
  subtitle:
    "Genre, pluriel, pronoms, questions, négation : de quoi parler dès la première semaine, sans déclinaison.",
  color: "#1C6E5C",
  lessons: [
    {
      slug: "genre-des-noms",
      title: "Le genre des noms",
      titleRu: "Род существительных",
      level: "A0",
      minutes: 9,
      summary:
        "Trois genres, et une règle qui les donne à 95 % : il suffit de regarder la dernière lettre du mot.",
      keywords: ["genre", "masculin", "féminin", "neutre", "род", "existentiel"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe a trois genres : masculin, féminin et neutre. Contrairement au français, où le genre s'apprend mot par mot avec l'article, il se lit ici directement sur la finale du nom au nominatif singulier.",
            "C'est une bonne affaire : une règle de trois lignes remplace des années d'apprentissage par imprégnation. Les exceptions existent, mais elles se comptent et s'apprennent en une leçon.",
          ],
        },
        {
          kind: "table",
          title: "La règle de la finale",
          head: ["Finale", "Genre", "Exemples"],
          rows: [
            ["consonne", "masculin", "стол (table), дом (maison), брат (frère)"],
            ["-а / -я", "féminin", "кни́га (livre), неде́ля (semaine), ма́ма"],
            ["-о / -е", "neutre", "окно́ (fenêtre), мо́ре (mer), сло́во (mot)"],
            ["-ь", "masculin ou féminin", "слова́рь (m., dictionnaire), ночь (f., nuit)"],
          ],
          note: "Le -ь est la seule vraie zone d'incertitude : le genre s'apprend alors avec le mot.",
        },
        {
          kind: "prose",
          title: "Les exceptions qui comptent",
          body: [
            "Le sens l'emporte sur la forme pour les personnes : па́па (papa), дя́дя (oncle), мужчи́на (homme) se terminent par -а mais sont masculins, parce qu'ils désignent des hommes. Ils se déclinent comme des féminins et s'accordent au masculin — ce qui donne « мой па́па », avec un possessif masculin sur un mot en -а.",
            "Quelques neutres en -мя forment un petit groupe à part : и́мя (prénom), вре́мя (temps), зна́мя (drapeau). Enfin, les emprunts indéclinables en -о ou -и sont neutres : метро́, кино́, ко́фе — ce dernier étant traditionnellement masculin, neutre dans l'usage courant.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́то мой брат.", fr: "C'est mon frère.", note: "брат : consonne finale, masculin" },
            { ru: "Э́то моя́ кни́га.", fr: "C'est mon livre.", note: "кни́га : -а, féminin" },
            { ru: "Э́то моё окно́.", fr: "C'est ma fenêtre.", note: "окно́ : -о, neutre" },
            { ru: "Мой па́па — врач.", fr: "Mon père est médecin.", note: "-а mais masculin : le sens décide" },
            { ru: "Кака́я дли́нная ночь!", fr: "Quelle longue nuit !", note: "ночь : -ь féminin, à retenir avec le mot" },
          ],
        },
        {
          kind: "pitfall",
          title: "Le genre russe n'est pas le genre français",
          body: [
            "Un francophone traduit spontanément le genre de sa langue : « la table » devient féminin, alors que стол est masculin ; « le livre » devient masculin, alors que кни́га est féminin.",
            "Il faut donc désapprendre l'intuition française et lire la finale russe. C'est mécanique, et c'est justement pour cela que ça marche.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Consonne = masculin, -а/-я = féminin, -о/-е = neutre.",
            "-ь : masculin ou féminin, à apprendre avec le mot.",
            "Les noms d'hommes en -а (па́па, дя́дя) sont masculins.",
            "Ne jamais transposer le genre du français.",
          ],
        },
      ],
      practice: [{ href: "/cases/nominative", label: "Exercice : le nominatif" }],
    },
    {
      slug: "pluriel-des-noms",
      title: "Le pluriel des noms",
      titleRu: "Множественное число",
      level: "A0",
      minutes: 9,
      summary:
        "Deux terminaisons couvrent presque tout : -ы/-и pour les masculins et féminins, -а/-я pour les neutres.",
      keywords: ["pluriel", "множественное число", "-ы", "-и", "-а", "noms"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le pluriel du nominatif se forme en remplaçant la finale du singulier. Le russe n'ajoute pas un -s muet : la terminaison change et s'entend, ce qui rend le nombre audible dans toutes les situations.",
            "Attention dès le départ à l'accent : il se déplace fréquemment au pluriel, parfois sans que la terminaison ne change de forme.",
          ],
        },
        {
          kind: "table",
          title: "Formation",
          head: ["Singulier", "Pluriel", "Exemple"],
          rows: [
            ["consonne", "+ ы", "стол → столы́"],
            ["-а", "→ ы", "кни́га → кни́ги (règle des 7 lettres : г impose и)"],
            ["-я, -ь", "→ и", "неде́ля → неде́ли ; слова́рь → словари́"],
            ["-о", "→ а", "окно́ → о́кна"],
            ["-е", "→ я", "мо́ре → моря́"],
          ],
        },
        {
          kind: "prose",
          title: "Les pluriels irréguliers fréquents",
          body: [
            "Un groupe de masculins prend un -а́ accentué au lieu de -ы : дом → дома́ (maisons), го́род → города́ (villes), учи́тель → учителя́ (enseignants), по́езд → поезда́ (trains). Ils sont nombreux et courants ; on les apprend un par un.",
            "D'autres sont franchement irréguliers : брат → бра́тья, друг → друзья́, сын → сыновья́, стул → сту́лья, челове́к → лю́ди, ребёнок → де́ти. Enfin, certains mots n'existent qu'au pluriel : де́ньги (argent), часы́ (montre), очки́ (lunettes).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Здесь два стола́ и три сту́ла.", fr: "Il y a ici deux tables et trois chaises." },
            { ru: "В го́роде мно́го краси́вых домо́в.", fr: "Il y a beaucoup de belles maisons dans la ville." },
            { ru: "Мои́ друзья́ живу́т в Москве́.", fr: "Mes amis habitent à Moscou.", note: "друг → друзья́" },
            { ru: "Где мои́ очки́?", fr: "Où sont mes lunettes ?", note: "toujours pluriel" },
            { ru: "У них тро́е дете́й.", fr: "Ils ont trois enfants.", note: "ребёнок → де́ти" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Masculins et féminins : -ы, ou -и après une des sept lettres (г к х ж ш ч щ) et après -ь/-я.",
            "Neutres : -о → -а, -е → -я.",
            "Une série de masculins fait son pluriel en -а́ accentué : дома́, города́.",
            "L'accent se déplace très souvent au pluriel : il fait partie de la forme.",
          ],
        },
      ],
    },
    {
      slug: "pronoms-personnels",
      title: "Les pronoms personnels",
      titleRu: "Личные местоимения",
      level: "A0",
      minutes: 7,
      summary:
        "Six formes au nominatif, dont un « vous » qui sert de politesse et de pluriel, exactement comme en français.",
      keywords: ["pronoms", "я", "ты", "вы", "личные местоимения", "personnels"],
      sections: [
        {
          kind: "table",
          title: "Au nominatif",
          head: ["Russe", "Français", "Remarque"],
          rows: [
            ["я", "je", "jamais de majuscule sauf en début de phrase"],
            ["ты", "tu", "un seul interlocuteur, familier"],
            ["он / она́ / оно́", "il / elle / il (neutre)", "renvoie au genre du nom, pas au sexe"],
            ["мы", "nous", ""],
            ["вы", "vous", "pluriel ou politesse — Вы avec majuscule dans une lettre"],
            ["они́", "ils / elles", "une seule forme pour les deux genres"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Deux différences avec le français sautent aux yeux. D'abord, они́ ne distingue pas le masculin du féminin : un groupe mixte, un groupe d'hommes ou un groupe de femmes, c'est le même mot. Ensuite, он et она́ ne désignent pas seulement des personnes : ils remplacent n'importe quel nom du genre correspondant.",
            "Un stylo (ру́чка, féminin) sera donc она́, et une table (стол, masculin) sera он. Dire « il » d'un objet n'a rien de poétique en russe : c'est la grammaire ordinaire.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Где ру́чка? — Она́ на столе́.", fr: "Où est le stylo ? — Il est sur la table.", note: "ру́чка est féminin, donc она́" },
            { ru: "Ты студе́нт?", fr: "Tu es étudiant ?" },
            { ru: "Вы говори́те по-ру́сски?", fr: "Vous parlez russe ?", note: "politesse ou pluriel : le contexte tranche" },
            { ru: "Они́ живу́т здесь.", fr: "Ils habitent ici." },
          ],
        },
        {
          kind: "pitfall",
          title: "Le pronom sujet ne s'omet pas… sauf quand il s'omet",
          body: [
            "Contrairement à l'italien ou à l'espagnol, le russe exprime normalement le pronom sujet, parce que le passé ne distingue pas les personnes (я чита́л et ты чита́л se ressemblent trop).",
            "À l'oral rapide, il tombe pourtant dans les formules toutes faites : « Не зна́ю » (je ne sais pas), « Понима́ю » (je comprends). C'est une ellipse de conversation, pas une règle à généraliser à l'écrit.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "они́ vaut pour « ils » et « elles ».",
            "он / она́ remplacent aussi les objets, selon le genre du nom.",
            "вы = pluriel ET politesse ; Вы capitalisé dans la correspondance.",
            "Le pronom sujet s'exprime, sauf dans quelques formules orales.",
          ],
        },
      ],
    },
    {
      slug: "phrase-sans-verbe-etre",
      title: "La phrase sans verbe « être »",
      titleRu: "Предложение без глагола быть",
      level: "A0",
      minutes: 8,
      summary:
        "Быть n'existe pas au présent. La phrase la plus simple du russe est donc une phrase sans verbe — et c'est le tiret qui le remplace à l'écrit.",
      keywords: ["être", "быть", "это", "tiret", "présent", "copule"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le verbe быть (être) a disparu du présent russe. On ne dit pas « je suis étudiant » mais « je étudiant » : я студе́нт. Ce n'est ni un raccourci ni un registre familier, c'est la forme normale et obligatoire.",
            "Le verbe réapparaît au passé (был, была́, бы́ло, бы́ли) et au futur (бу́ду, бу́дешь…). Le présent est le seul temps où il manque — et la forme есть qui subsiste sert à dire l'existence, pas l'identité.",
          ],
        },
        {
          kind: "examples",
          title: "Présent, passé, futur",
          items: [
            { ru: "Я студе́нт.", fr: "Je suis étudiant.", note: "aucun verbe" },
            { ru: "Я был студе́нтом.", fr: "J'étais étudiant.", note: "быть revient au passé, et le nom passe à l'instrumental" },
            { ru: "Я бу́ду студе́нтом.", fr: "Je serai étudiant." },
            { ru: "Она́ до́ма.", fr: "Elle est à la maison." },
            { ru: "Э́то мой дом.", fr: "C'est ma maison.", note: "э́то présente, il ne s'accorde pas" },
          ],
        },
        {
          kind: "prose",
          title: "Э́то, le présentatif",
          body: [
            "Э́то sert à présenter ou à identifier : « c'est… ». Il est invariable dans cet emploi, quel que soit le genre et le nombre de ce qui suit : Э́то кни́га, Э́то мои́ друзья́.",
            "Ne pas le confondre avec l'adjectif démonstratif э́тот / э́та / э́то / э́ти (« ce, cette, ces »), qui s'accorde, lui : э́тот дом (cette maison-ci), э́та кни́га. La différence : « Э́то дом » = c'est une maison ; « Э́тот дом » = cette maison.",
          ],
        },
        {
          kind: "prose",
          title: "Le tiret",
          body: [
            "À l'écrit, quand les deux termes sont des noms, un tiret marque la place du verbe absent : Москва́ — столи́ца Росси́и. Il ne se met pas si le sujet est un pronom (Я студе́нт, sans tiret) ni devant un adjectif (Дом большо́й).",
            "À l'oral, ce tiret correspond à une petite pause — utile pour ne pas coller les deux noms.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Pas de « être » au présent : я студе́нт.",
            "Il revient au passé (был) et au futur (бу́ду), avec l'attribut à l'instrumental.",
            "Э́то « c'est » est invariable ; э́тот « ce » s'accorde.",
            "Tiret entre deux noms à l'écrit, jamais après un pronom.",
          ],
        },
      ],
    },
    {
      slug: "poser-une-question",
      title: "Poser une question",
      titleRu: "Вопрос",
      level: "A0",
      minutes: 8,
      summary:
        "Aucun « est-ce que », aucune inversion : les mots interrogatifs, ou la seule intonation.",
      keywords: ["question", "кто", "что", "где", "как", "почему", "interrogation"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe pose une question fermée sans rien changer à la phrase : même ordre des mots, même forme du verbe. Seule l'intonation monte fortement sur le mot interrogé (voir la leçon sur les constructions ИК).",
            "Pour une question ouverte, on place le mot interrogatif en tête. Presque tous commencent par к-, ce qui les rend faciles à reconnaître à l'oral.",
          ],
        },
        {
          kind: "table",
          title: "Les mots interrogatifs de base",
          head: ["Mot", "Sens", "Exemple"],
          rows: [
            ["кто", "qui", "Кто э́то?"],
            ["что", "quoi, que", "Что э́то?"],
            ["где", "où (position)", "Где ты?"],
            ["куда́", "où (direction)", "Куда́ ты идёшь?"],
            ["отку́да", "d'où", "Отку́да вы?"],
            ["когда́", "quand", "Когда́ он придёт?"],
            ["как", "comment", "Как дела́?"],
            ["почему́", "pourquoi", "Почему́ не рабо́тает?"],
            ["заче́м", "pour quoi faire", "Заче́м тебе́ э́то?"],
            ["ско́лько", "combien", "Ско́лько э́то сто́ит?"],
            ["како́й", "quel (qualité)", "Кака́я сего́дня пого́да?"],
            ["чей", "à qui", "Чей э́то дом?"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Ты рабо́таешь здесь?", fr: "Tu travailles ici ?", note: "phrase identique à l'affirmation, intonation montante" },
            { ru: "Где ты рабо́таешь?", fr: "Où travailles-tu ?" },
            { ru: "Кто там?", fr: "Qui est là ?" },
            { ru: "Как тебя́ зову́т?", fr: "Comment t'appelles-tu ?", note: "littéralement « comment t'appelle-t-on »" },
            { ru: "Ско́лько тебе́ лет?", fr: "Quel âge as-tu ?" },
          ],
        },
        {
          kind: "pitfall",
          title: "Où : где ou куда́ ?",
          body: [
            "Le français utilise « où » pour la position et pour la direction : « où es-tu ? », « où vas-tu ? ». Le russe sépare strictement les deux — где pour l'endroit, куда́ pour le mouvement vers, отку́да pour le mouvement depuis.",
            "L'erreur « Где ты идёшь? » se corrige en apprenant куда́ dès le premier jour, avec la question à laquelle il répond.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Pas d'« est-ce que » ni d'inversion : l'intonation suffit.",
            "Le mot interrogatif ouvre la phrase.",
            "где (où l'on est) ≠ куда́ (où l'on va) ≠ отку́да (d'où l'on vient).",
            "почему́ demande la cause, заче́м le but.",
          ],
        },
      ],
    },
    {
      slug: "la-negation",
      title: "La négation",
      titleRu: "Отрицание",
      level: "A0",
      minutes: 7,
      summary:
        "Un seul mot, не, placé juste devant ce qui est nié — et un нет qui sert à la fois de « non » et de « il n'y a pas ».",
      keywords: ["négation", "не", "нет", "ни", "отрицание"],
      sections: [
        {
          kind: "prose",
          body: [
            "La négation russe est une particule unique, не, posée immédiatement devant le mot nié. Pas de deuxième élément à la française (« ne… pas ») : il n'y a rien à encadrer.",
            "Comme не se place devant le mot nié et non devant le verbe par convention, déplacer не change le sens de la phrase — c'est un outil de précision, pas une simple négation globale.",
          ],
        },
        {
          kind: "examples",
          title: "Le placement change le sens",
          items: [
            { ru: "Я не рабо́таю сего́дня.", fr: "Je ne travaille pas aujourd'hui." },
            { ru: "Не я рабо́таю сего́дня.", fr: "Ce n'est pas moi qui travaille aujourd'hui." },
            { ru: "Я рабо́таю не сего́дня.", fr: "Ce n'est pas aujourd'hui que je travaille." },
            { ru: "Он не врач, а инжене́р.", fr: "Il n'est pas médecin, mais ingénieur.", note: "opposition avec а" },
          ],
        },
        {
          kind: "prose",
          title: "Нет, deux emplois",
          body: [
            "Нет répond « non » à une question. Mais c'est aussi le mot de l'absence : « il n'y a pas », suivi du génitif. До́ма нет ма́мы : maman n'est pas à la maison.",
            "Cette construction est traitée en détail dans l'unité de syntaxe, avec le génitif de négation ; retenez pour l'instant que « il n'y a pas de X » se dit нет + X au génitif, et que le sujet grammatical disparaît.",
          ],
        },
        {
          kind: "prose",
          title: "La double négation est obligatoire",
          body: [
            "Là où le français a longtemps hésité, le russe est catégorique : un mot négatif appelle не sur le verbe. Я ничего́ не зна́ю (littéralement « je rien ne sais »), Он никогда́ не опа́здывает, Никто́ не пришёл.",
            "Omettre не devant le verbe est une faute, jamais une élégance. Trois, quatre mots négatifs dans la même phrase sont parfaitement corrects : Он никогда́ никому́ ничего́ не говори́т.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Un seul mot : не, placé devant ce qui est nié.",
            "Déplacer не déplace le sens de la négation.",
            "нет = « non » et « il n'y a pas » (+ génitif).",
            "Mot négatif ⇒ не obligatoire sur le verbe : никто́ не зна́ет.",
          ],
        },
      ],
    },
    {
      slug: "possessifs",
      title: "Les possessifs",
      titleRu: "Притяжательные местоимения",
      level: "A1",
      minutes: 8,
      summary:
        "мой, твой, наш, ваш s'accordent avec l'objet possédé ; его́, её, их ne s'accordent jamais.",
      keywords: ["possessif", "мой", "наш", "его", "её", "их", "притяжательные"],
      sections: [
        {
          kind: "table",
          title: "Les formes du nominatif",
          head: ["Possesseur", "Masculin", "Féminin", "Neutre", "Pluriel"],
          rows: [
            ["я", "мой", "моя́", "моё", "мои́"],
            ["ты", "твой", "твоя́", "твоё", "твои́"],
            ["он / оно́", "его́", "его́", "его́", "его́"],
            ["она́", "её", "её", "её", "её"],
            ["мы", "наш", "на́ша", "на́ше", "на́ши"],
            ["вы", "ваш", "ва́ша", "ва́ше", "ва́ши"],
            ["они́", "их", "их", "их", "их"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Le possessif russe s'accorde avec ce qui est possédé, comme en français : мой дом (ma maison, mot masculin), моя́ кни́га, моё окно́, мои́ друзья́.",
            "Trois formes échappent totalement à l'accord : его́ (à lui), её (à elle) et их (à eux). Ce sont des génitifs figés du pronom personnel, donc invariables : его́ кни́га, его́ дом, его́ друзья́ — jamais « его́я » ni quoi que ce soit d'approchant.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́то мой брат и моя́ сестра́.", fr: "Voici mon frère et ma sœur." },
            { ru: "Как ва́ше и́мя?", fr: "Quel est votre nom ?", note: "и́мя est neutre : ва́ше" },
            { ru: "Её муж — журнали́ст.", fr: "Son mari (à elle) est journaliste." },
            { ru: "Их дом о́чень большо́й.", fr: "Leur maison est très grande." },
          ],
        },
        {
          kind: "pitfall",
          title: "Son frère à lui, ou le sien ?",
          body: [
            "Le russe possède en plus un possessif réfléchi, свой, qui renvoie au sujet de la phrase. Он лю́бит свою́ жену́ = il aime sa (propre) femme ; Он лю́бит его́ жену́ = il aime la femme d'un autre.",
            "Le français ne fait pas cette différence et le contexte s'en charge ; en russe, choisir его́ au lieu de свой change réellement la personne dont on parle. Une leçon entière lui est consacrée dans l'unité des pronoms.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "мой, твой, наш, ваш s'accordent avec l'objet possédé.",
            "его́, её, их sont invariables.",
            "Le possessif s'omet souvent avec la famille et le corps quand le contexte est clair.",
            "свой (le sien propre) existe et n'est pas optionnel : voir sa leçon.",
          ],
        },
      ],
    },
    {
      slug: "avoir-u-menya-est",
      title: "Dire qu'on a quelque chose",
      titleRu: "У меня есть",
      level: "A1",
      minutes: 8,
      summary:
        "Le russe n'a pas de verbe « avoir » usuel : il dit « chez moi il y a », avec le possesseur au génitif.",
      keywords: ["avoir", "у меня есть", "possession", "génitif", "иметь"],
      sections: [
        {
          kind: "prose",
          body: [
            "Là où le français dit « j'ai un frère », le russe dit littéralement « chez moi il y a un frère » : У меня́ есть брат. Le possesseur est introduit par у + génitif, et l'objet possédé est le vrai sujet grammatical, au nominatif.",
            "Le verbe име́ть (avoir) existe, mais il est réservé à des emplois abstraits et administratifs : име́ть пра́во (avoir le droit), име́ть в виду́ (avoir en vue). L'employer pour des objets sonne comme une traduction mot à mot.",
          ],
        },
        {
          kind: "table",
          title: "Le possesseur au génitif",
          head: ["Pronom", "Forme après у", "Exemple"],
          rows: [
            ["я", "у меня́", "У меня́ есть маши́на."],
            ["ты", "у тебя́", "У тебя́ есть вре́мя?"],
            ["он / оно́", "у него́", "У него́ есть соба́ка."],
            ["она́", "у неё", "У неё есть вопро́с."],
            ["мы", "у нас", "У нас есть план."],
            ["вы", "у вас", "У вас есть де́ти?"],
            ["они́", "у них", "У них есть кварти́ра."],
          ],
          note: "Le н- de него́, неё, них apparaît uniquement après une préposition.",
        },
        {
          kind: "prose",
          title: "Есть ou pas есть ?",
          body: [
            "Есть signifie « il y a » et affirme l'existence. On le garde quand la question porte sur le fait même de posséder : У вас есть маши́на? — Да, есть.",
            "On le supprime quand l'existence est déjà admise et que l'information porte sur la qualité ou la quantité : У меня́ но́вая маши́на (j'ai une voiture neuve — on savait qu'il y avait une voiture, on parle de sa nouveauté). C'est une nuance de rhème, pas une variante libre.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "У меня́ есть вопро́с.", fr: "J'ai une question." },
            { ru: "У меня́ нет вопро́сов.", fr: "Je n'ai pas de questions.", note: "négation : нет + génitif" },
            { ru: "У неё краси́вые глаза́.", fr: "Elle a de beaux yeux.", note: "pas de есть : on décrit, on n'affirme pas l'existence" },
            { ru: "У кого́ есть ру́чка?", fr: "Qui a un stylo ?" },
            { ru: "У нас бу́дет вре́мя за́втра.", fr: "Nous aurons du temps demain.", note: "futur : бу́дет" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "« Avoir » se dit у + génitif + есть + nominatif.",
            "La négation : у + génitif + нет + génitif.",
            "есть tombe quand on décrit plutôt qu'on n'affirme l'existence.",
            "име́ть existe mais reste abstrait et formel.",
          ],
        },
      ],
      practice: [{ href: "/cases/genitive", label: "Exercice : le génitif" }],
    },
    {
      slug: "saluer-et-se-presenter",
      title: "Saluer et se présenter",
      titleRu: "Приветствие и знакомство",
      level: "A0",
      minutes: 8,
      summary:
        "Les formules qui servent tous les jours, et la règle sociale qui décide entre ты et вы dès la première seconde.",
      keywords: ["salutation", "здравствуйте", "привет", "politesse", "знакомство", "présenter"],
      sections: [
        {
          kind: "table",
          title: "Les formules de base",
          head: ["Russe", "Français", "Registre"],
          rows: [
            ["Здра́вствуйте!", "Bonjour (à vous)", "neutre, toujours sûr"],
            ["Здра́вствуй!", "Bonjour (à toi)", "familier"],
            ["Приве́т!", "Salut !", "amical uniquement"],
            ["До́брое у́тро / день / ве́чер", "Bonjour (matin/journée/soir)", "neutre"],
            ["До свида́ния!", "Au revoir", "neutre"],
            ["Пока́!", "Salut ! (en partant)", "familier"],
            ["Спаси́бо / Пожа́луйста", "Merci / Je vous en prie", "neutre"],
            ["Извини́те / Прости́те", "Excusez-moi", "neutre"],
          ],
        },
        {
          kind: "examples",
          title: "Se présenter",
          items: [
            { ru: "Меня́ зову́т Анто́н.", fr: "Je m'appelle Anton.", note: "littéralement « on m'appelle Anton »" },
            { ru: "Как вас зову́т?", fr: "Comment vous appelez-vous ?" },
            { ru: "О́чень прия́тно.", fr: "Enchanté.", note: "réponse standard à une présentation" },
            { ru: "Я из Фра́нции.", fr: "Je viens de France." },
            { ru: "Я говорю́ по-ру́сски немно́го.", fr: "Je parle un peu russe.", note: "по-ру́сски, adverbe : jamais « на ру́сском » ici" },
          ],
        },
        {
          kind: "prose",
          title: "Ты ou вы ?",
          body: [
            "La règle est plus stricte qu'en français : вы avec tout adulte inconnu, tout supérieur, tout commerçant, toute personne nettement plus âgée. Ты avec les proches, les enfants, les camarades d'études, et entre jeunes du même âge dans un cadre informel.",
            "Le passage au ты se négocie explicitement : « Дава́й на ты? ». Tant que personne ne l'a proposé, on reste au вы — et l'erreur inverse (tutoyer trop tôt) est nettement plus mal reçue que la sur-politesse.",
          ],
        },
        {
          kind: "pitfall",
          title: "Как дела́ n'est pas « comment ça va »",
          body: [
            "En français, « ça va ? » est une formule de salutation qui n'attend pas de réponse. En russe, Как дела́? est une vraie question, posée à des gens qu'on connaît, et qui appelle une réponse : Хорошо́, спаси́бо. А у тебя́?",
            "On ne la lance pas à un inconnu ni à un vendeur : Здра́вствуйте suffit.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Здра́вствуйте est la salutation neutre universelle.",
            "Приве́т et пока́ sont réservés aux proches.",
            "вы par défaut avec un inconnu adulte, sans exception.",
            "Как дела́? attend une réponse et suppose qu'on se connaît.",
          ],
        },
      ],
    },
  ],
};
