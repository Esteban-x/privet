import type { Unit } from "../types";

/**
 * Unité 7 — l'aspect verbal, catégorie absente du français et présente dans
 * chaque phrase russe. Le module /aspect en fait les exercices ; ici, la
 * théorie complète, temps par temps.
 */
export const UNIT_ASPECT: Unit = {
  slug: "aspect",
  title: "L'aspect verbal",
  titleRu: "Вид глагола",
  subtitle:
    "Imperfectif et perfectif : ce que la paire dit du déroulement, et comment choisir à chaque temps.",
  color: "#1C6E5C",
  lessons: [
    {
      slug: "aspect-le-principe",
      title: "Le principe de l'aspect",
      titleRu: "Что такое вид",
      level: "A2",
      minutes: 10,
      summary:
        "L'aspect ne dit pas quand l'action a lieu, mais quelle forme elle prend dans le temps : un déroulement, ou un fait accompli.",
      keywords: ["aspect", "вид", "imperfectif", "perfectif", "принцип", "несовершенный"],
      sections: [
        {
          kind: "prose",
          body: [
            "Chaque verbe russe appartient à l'un des deux aspects, et la plupart existent en paire : deux verbes de même sens qui ne diffèrent que par leur regard sur l'action. Ce n'est pas un temps supplémentaire — c'est une dimension parallèle au temps.",
            "L'IMPERFECTIF regarde l'action de l'intérieur : son déroulement, sa répétition, son existence en tant qu'activité. Le PERFECTIF la regarde de l'extérieur, comme un bloc entier, avec son terme atteint.",
          ],
        },
        {
          kind: "table",
          title: "Ce que chaque aspect peut dire",
          head: ["Imperfectif", "Perfectif"],
          rows: [
            ["le déroulement : il lisait", "le résultat : il a lu (jusqu'au bout)"],
            ["la répétition : il lisait tous les soirs", "l'événement unique : il a lu ce soir-là"],
            ["le fait brut : tu as lu ce livre ?", "le changement : il a compris"],
            ["présent, passé, futur composé", "passé et futur seulement"],
          ],
          note: "Un perfectif n'a jamais de présent : une action vue comme achevée ne peut pas être en train de se dérouler.",
        },
        {
          kind: "examples",
          title: "La même phrase, deux aspects",
          items: [
            {
              ru: "Вчера́ я чита́л кни́гу.",
              fr: "Hier, je lisais un livre.",
              note: "activité : on ne sait pas si elle est finie",
            },
            {
              ru: "Вчера́ я прочита́л кни́гу.",
              fr: "Hier, j'ai lu le livre en entier.",
              note: "résultat atteint",
            },
            {
              ru: "Он реша́л зада́чу два часа́.",
              fr: "Il a planché deux heures sur le problème.",
              note: "durée, sans résultat garanti",
            },
            {
              ru: "Он реши́л зада́чу за два часа́.",
              fr: "Il a résolu le problème en deux heures.",
              note: "за + durée : le résultat est là",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "Ce n'est pas imparfait / passé composé",
          body: [
            "La tentation est de traduire imperfectif par imparfait et perfectif par passé composé. Cela fonctionne une fois sur deux, ce qui est pire qu'une règle fausse : on croit avoir compris.",
            "« J'ai lu ce livre trois fois » se dit à l'imperfectif (Я чита́л э́ту кни́гу три ра́за) alors que le français emploie le passé composé. Le critère n'est pas le temps français mais la question : le résultat unique compte-t-il, ou l'activité ?",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Deux verbes par sens : c'est la paire aspectuelle.",
            "Imperfectif = déroulement, répétition, fait brut.",
            "Perfectif = fait accompli, résultat, événement unique.",
            "Le perfectif n'a pas de présent.",
            "Ne pas calquer sur imparfait / passé composé.",
          ],
        },
      ],
      practice: [{ href: "/aspect", label: "Le module Aspect" }],
    },
    {
      slug: "formation-des-paires",
      title: "Comment se forment les paires",
      titleRu: "Образование видовых пар",
      level: "B1",
      minutes: 10,
      summary:
        "Trois procédés : un préfixe, un suffixe, ou deux mots sans rapport. Savoir lequel est en jeu aide à deviner l'aspect d'un verbe inconnu.",
      keywords: ["paire", "préfixe", "suffixe", "видовая пара", "сказать", "решать"],
      sections: [
        {
          kind: "table",
          title: "Les trois procédés",
          head: ["Procédé", "Imperfectif", "Perfectif", "Remarque"],
          rows: [
            ["Préfixe", "чита́ть", "прочита́ть", "le préfixe « ferme » l'action"],
            ["Préfixe", "де́лать", "сде́лать", "с- est le plus fréquent"],
            ["Préfixe", "писа́ть", "написа́ть", ""],
            ["Suffixe", "реша́ть", "реши́ть", "l'imperfectif est le plus long"],
            ["Suffixe", "отвеча́ть", "отве́тить", ""],
            ["Suffixe", "дава́ть", "дать", ""],
            ["Supplétion", "говори́ть", "сказа́ть", "deux racines différentes"],
            ["Supplétion", "брать", "взять", ""],
            ["Supplétion", "класть", "положи́ть", ""],
          ],
        },
        {
          kind: "prose",
          title: "Le sens de lecture",
          body: [
            "Avec un préfixe, c'est l'imperfectif qui est premier : чита́ть existe, on lui ajoute про- pour obtenir le perfectif. Avec un suffixe, c'est l'inverse : реши́ть est premier, et l'imperfectif реша́ть en est dérivé par allongement.",
            "Cette différence a une conséquence pratique : un verbe long en -ывать / -ивать / -ать est presque toujours imperfectif, et un verbe court préfixé est presque toujours perfectif. Deux indices qui permettent de deviner sans dictionnaire.",
          ],
        },
        {
          kind: "prose",
          title: "Quand le préfixe change le sens",
          body: [
            "Tout préfixe ne donne pas une paire. Писа́ть → написа́ть est une vraie paire (même sens). Mais писа́ть → переписа́ть (recopier), подписа́ть (signer), записа́ть (noter) sont des verbes NOUVEAUX, perfectifs, qui se refabriquent chacun un imperfectif : перепи́сывать, подпи́сывать, запи́сывать.",
            "C'est ainsi que le russe multiplie son vocabulaire : une racine, une douzaine de préfixes, et chaque combinaison reçoit sa propre paire.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я до́лго писа́л письмо́.", fr: "J'ai mis longtemps à écrire la lettre." },
            { ru: "Я написа́л письмо́.", fr: "J'ai écrit la lettre (elle est prête)." },
            { ru: "Я записа́л его́ но́мер.", fr: "J'ai noté son numéro.", note: "запис- : autre verbe, autre paire" },
            { ru: "Она́ ка́ждый день запи́сывает расхо́ды.", fr: "Elle note ses dépenses chaque jour.", note: "imperfectif de записа́ть" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Préfixe : imperfectif de base + préfixe = perfectif.",
            "Suffixe : perfectif de base, imperfectif allongé.",
            "Supplétion : deux racines, à apprendre ensemble.",
            "Un verbe en -ывать / -ивать est presque toujours imperfectif.",
          ],
        },
      ],
      practice: [{ href: "/aspect/pairs", label: "Exercice : reconnaître les paires" }],
    },
    {
      slug: "aspect-au-passe",
      title: "L'aspect au passé",
      titleRu: "Вид в прошедшем времени",
      level: "B1",
      minutes: 10,
      summary:
        "C'est au passé que le choix se pose le plus souvent, et qu'il change le plus le sens : activité, répétition, ou résultat encore valable.",
      keywords: ["passé", "aspect", "прошедшее", "résultat", "répétition", "durée"],
      sections: [
        {
          kind: "table",
          title: "Quatre valeurs au passé",
          head: ["Valeur", "Aspect", "Exemple"],
          rows: [
            ["Action en cours à un moment", "imperfectif", "Когда́ он вошёл, я чита́л."],
            ["Action répétée", "imperfectif", "Ка́ждый ве́чер я чита́л."],
            ["Fait brut, sans intérêt pour le résultat", "imperfectif", "Ты чита́л э́ту кни́гу?"],
            ["Résultat obtenu", "perfectif", "Я прочита́л э́ту кни́гу."],
          ],
        },
        {
          kind: "prose",
          title: "Le résultat encore valable",
          body: [
            "Le perfectif au passé implique souvent que l'état résultant tient toujours : Он верну́лся (il est revenu, et il est là), Она́ вы́шла (elle est sortie, elle n'est pas là).",
            "L'imperfectif du même verbe annule cette conséquence : Он возвраща́лся ne dit rien de sa présence actuelle, et Она́ выходи́ла signifie qu'elle est sortie puis revenue. C'est ce qu'on appelle le « résultat annulé », très courant avec les verbes de mouvement.",
          ],
        },
        {
          kind: "examples",
          title: "Le résultat annulé",
          items: [
            {
              ru: "Ко мне приходи́л друг.",
              fr: "Un ami est passé chez moi.",
              note: "il est venu ET reparti",
            },
            {
              ru: "Ко мне пришёл друг.",
              fr: "Un ami est arrivé chez moi.",
              note: "il est toujours là",
            },
            {
              ru: "Я брал э́ту кни́гу в библиоте́ке.",
              fr: "J'avais emprunté ce livre à la bibliothèque.",
              note: "et je l'ai rendu",
            },
            {
              ru: "Я взял э́ту кни́гу в библиоте́ке.",
              fr: "J'ai emprunté ce livre à la bibliothèque.",
              note: "je l'ai encore",
            },
          ],
        },
        {
          kind: "prose",
          title: "Les indices de temps",
          body: [
            "Certains compléments imposent presque toujours un aspect. IMPERFECTIF : ка́ждый день, обы́чно, ча́сто, всегда́, до́лго, весь ве́чер, иногда́. PERFECTIF : вдруг, наконе́ц, сра́зу, уже́, за два часа́, вчера́ ве́чером (avec un événement précis).",
            "Attention à la paire до́лго / за + durée : до́лго (longtemps) accompagne l'imperfectif et décrit un temps passé à faire ; за два часа́ (en deux heures) accompagne le perfectif et mesure le temps qu'il a fallu pour aboutir.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Imperfectif : en cours, répété, ou simple constat d'expérience.",
            "Perfectif : résultat, événement unique, changement d'état.",
            "Le perfectif implique souvent que le résultat tient encore.",
            "до́лго + imperfectif ; за + durée + perfectif.",
          ],
        },
      ],
      practice: [{ href: "/aspect/past", label: "Exercice : l'aspect au passé" }],
    },
    {
      slug: "aspect-au-futur",
      title: "L'aspect au futur",
      titleRu: "Вид в будущем времени",
      level: "B1",
      minutes: 8,
      summary:
        "Au futur, l'aspect ne se contente pas de nuancer : il change la forme même du verbe, composée ou simple.",
      keywords: ["futur", "aspect", "буду", "будущее", "perfectif", "planification"],
      sections: [
        {
          kind: "prose",
          body: [
            "Comme au passé, l'imperfectif décrit une activité ou une habitude à venir, et le perfectif un résultat attendu. Mais ici la différence est aussi morphologique : бу́ду чита́ть contre прочита́ю.",
            "Un enchaînement d'actions successives se met au perfectif, chacune servant de point de départ à la suivante : Я приду́, пригото́влю у́жин и позвоню́ тебе́.",
          ],
        },
        {
          kind: "examples",
          items: [
            {
              ru: "За́втра я бу́ду рабо́тать до́ма.",
              fr: "Demain, je travaillerai à la maison.",
              note: "l'activité occupe la journée",
            },
            {
              ru: "За́втра я сде́лаю э́ту рабо́ту.",
              fr: "Demain, je finirai ce travail.",
              note: "le résultat est visé",
            },
            {
              ru: "Ка́ждое у́тро я бу́ду бе́гать.",
              fr: "Chaque matin, je courrai.",
              note: "répétition : imperfectif obligatoire",
            },
            {
              ru: "Когда́ он придёт, мы поговори́м.",
              fr: "Quand il arrivera, nous parlerons.",
              note: "après когда́, le russe met le futur — jamais le présent",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "Après « quand » et « si », le futur",
          body: [
            "Le français emploie le présent après « si » (« si tu viens, je serai content ») et parfois après « quand ». Le russe met le FUTUR dans les deux propositions : Е́сли ты придёшь, я бу́ду рад ; Когда́ он придёт, я скажу́ ему́.",
            "C'est l'une des fautes les plus tenaces chez les francophones, parce qu'elle ne s'entend pas comme une faute : la phrase reste compréhensible, simplement fausse.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Imperfectif : бу́ду + infinitif, pour l'activité ou l'habitude.",
            "Perfectif : formes simples, pour le résultat.",
            "Actions successives : perfectif en chaîne.",
            "Après е́сли et когда́ : futur, jamais présent.",
          ],
        },
      ],
      practice: [{ href: "/aspect/future", label: "Exercice : l'aspect au futur" }],
    },
    {
      slug: "aspect-a-l-infinitif",
      title: "L'aspect à l'infinitif",
      titleRu: "Вид в инфинитиве",
      level: "B1",
      minutes: 8,
      summary:
        "Certains verbes n'acceptent qu'un seul aspect derrière eux : начина́ть, продолжа́ть et конча́ть imposent l'imperfectif, sans exception.",
      keywords: ["infinitif", "начать", "продолжать", "кончить", "aspect", "phase"],
      sections: [
        {
          kind: "prose",
          body: [
            "Après un verbe de phase — начина́ть / нача́ть (commencer), продолжа́ть (continuer), конча́ть / ко́нчить (finir), переста́ть (cesser) —, l'infinitif est OBLIGATOIREMENT imperfectif.",
            "La raison est logique : on ne peut commencer que ce qui dure. « Commencer à avoir lu » n'a pas de sens, en russe comme en français, sauf que le russe le rend impossible grammaticalement.",
          ],
        },
        {
          kind: "table",
          title: "Ce que chaque verbe impose",
          head: ["Verbe", "Infinitif exigé", "Exemple"],
          rows: [
            ["нача́ть, начина́ть", "imperfectif", "Он на́чал чита́ть."],
            ["продолжа́ть", "imperfectif", "Он продолжа́л чита́ть."],
            ["ко́нчить, переста́ть", "imperfectif", "Он переста́л чита́ть."],
            ["хоте́ть, реши́ть", "les deux, selon le sens", "Я хочу́ прочита́ть / чита́ть."],
            ["успе́ть (avoir le temps de)", "perfectif", "Я успе́л прочита́ть."],
            ["забы́ть, суме́ть", "perfectif", "Я забы́л позвони́ть."],
          ],
        },
        {
          kind: "prose",
          title: "Le choix libre : ce qu'il exprime",
          body: [
            "Quand les deux aspects sont possibles, l'imperfectif présente l'action comme une occupation, le perfectif comme une tâche à accomplir. На́до чита́ть бо́льше (il faut lire davantage, activité) contre На́до прочита́ть э́ту статью́ (il faut lire cet article, tâche).",
            "Après не на́до et не ну́жно, l'imperfectif domine largement : Не на́до звони́ть ему́ (inutile de l'appeler).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он на́чал изуча́ть ру́сский год наза́д.", fr: "Il a commencé à apprendre le russe il y a un an." },
            { ru: "Переста́нь шуме́ть!", fr: "Arrête de faire du bruit !" },
            { ru: "Я успе́л купи́ть биле́ты.", fr: "J'ai eu le temps d'acheter les billets." },
            { ru: "Я забы́л вы́ключить свет.", fr: "J'ai oublié d'éteindre la lumière." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Verbes de phase (нача́ть, продолжа́ть, переста́ть) : imperfectif obligatoire.",
            "успе́ть, забы́ть, суме́ть : perfectif.",
            "Choix libre ailleurs : activité (imperfectif) ou tâche (perfectif).",
            "не на́до, не ну́жно appellent l'imperfectif.",
          ],
        },
      ],
    },
    {
      slug: "aspect-a-l-imperatif",
      title: "L'aspect à l'impératif",
      titleRu: "Вид в повелительном наклонении",
      level: "B1",
      minutes: 8,
      summary:
        "À l'affirmatif, le perfectif demande, l'imperfectif invite. À la négative, la règle s'inverse et devient obligatoire.",
      keywords: ["impératif", "aspect", "запрет", "invitation", "ordre", "négation"],
      sections: [
        {
          kind: "table",
          title: "Les quatre combinaisons",
          head: ["Forme", "Aspect", "Effet", "Exemple"],
          rows: [
            ["Affirmative", "perfectif", "demande d'un acte précis", "Закро́й дверь."],
            ["Affirmative", "imperfectif", "invitation, encouragement, politesse", "Проходи́те, сади́тесь."],
            ["Négative", "imperfectif", "interdiction", "Не закрыва́й дверь."],
            ["Négative", "perfectif", "avertissement (« attention à ne pas »)", "Не упади́!"],
          ],
        },
        {
          kind: "prose",
          body: [
            "La combinaison la plus contre-intuitive pour un francophone est la troisième : une interdiction se dit toujours à l'imperfectif. Не де́лай э́того, Не говори́ так, Не забыва́й меня́.",
            "Le perfectif nié n'est pas une interdiction mais une mise en garde contre un accident : Не упади́ (ne tombe pas), Не опозда́й (ne sois pas en retard), Не забу́дь па́спорт (n'oublie pas ton passeport). L'action y est involontaire.",
          ],
        },
        {
          kind: "examples",
          title: "L'hospitalité russe est imperfective",
          items: [
            {
              ru: "Сади́тесь, пожа́луйста.",
              fr: "Asseyez-vous, je vous en prie.",
              note: "imperfectif : accueillant",
            },
            {
              ru: "Ся́дьте.",
              fr: "Asseyez-vous.",
              note: "perfectif : sec, presque un ordre médical",
            },
            {
              ru: "Бери́те ещё!",
              fr: "Reprenez-en !",
              note: "à table, l'imperfectif insiste chaleureusement",
            },
            {
              ru: "Возьми́те э́то.",
              fr: "Prenez ceci.",
              note: "perfectif : un acte précis, ponctuel",
            },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Affirmatif perfectif : demande d'un acte unique.",
            "Affirmatif imperfectif : invitation, souvent plus chaleureuse.",
            "Interdiction : imperfectif, toujours.",
            "Perfectif nié = mise en garde contre l'involontaire.",
          ],
        },
      ],
      practice: [{ href: "/aspect/imperative", label: "Exercice : l'aspect à l'impératif" }],
    },
    {
      slug: "aspect-et-negation",
      title: "L'aspect sous la négation",
      titleRu: "Вид при отрицании",
      level: "B2",
      minutes: 7,
      summary:
        "« Je n'ai pas lu » : imperfectif si je ne l'ai pas fait, perfectif si je n'y suis pas arrivé.",
      keywords: ["négation", "aspect", "не читал", "не прочитал", "échec"],
      sections: [
        {
          kind: "prose",
          body: [
            "Nier un imperfectif, c'est dire que l'action n'a pas eu lieu du tout : Я не чита́л э́ту кни́гу (je ne l'ai pas lue, je ne m'y suis pas mis).",
            "Nier un perfectif, c'est dire que l'action a été entreprise mais n'a pas abouti, ou qu'un résultat attendu n'est pas venu : Я не прочита́л э́ту кни́гу (je ne l'ai pas finie).",
          ],
        },
        {
          kind: "examples",
          items: [
            {
              ru: "Он не звони́л.",
              fr: "Il n'a pas appelé.",
              note: "aucun appel n'a eu lieu",
            },
            {
              ru: "Он не позвони́л.",
              fr: "Il n'a pas appelé (alors qu'il devait).",
              note: "un appel était attendu",
            },
            {
              ru: "Я не сдал экза́мен.",
              fr: "Je n'ai pas eu l'examen.",
              note: "je l'ai passé et échoué",
            },
            {
              ru: "Я не сдава́л экза́мен.",
              fr: "Je n'ai pas passé l'examen.",
              note: "je ne m'y suis pas présenté",
            },
          ],
        },
        {
          kind: "prose",
          title: "Le cas de l'objet",
          body: [
            "La négation entraîne souvent le passage de l'objet direct au génitif, et l'aspect y participe : avec un imperfectif nié, le génitif est plus naturel (Я не чита́л книг), avec un perfectif nié et un objet précis, l'accusatif se maintient (Я не прочита́л э́ту кни́гу).",
            "Les deux phénomènes vont dans le même sens : plus l'objet est concret et identifié, plus l'accusatif résiste.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Imperfectif nié : l'action n'a pas eu lieu.",
            "Perfectif nié : elle n'a pas abouti, ou elle manque à l'appel.",
            "сдава́ть / сдать экза́мен : passer / réussir un examen.",
            "La négation pousse l'objet vers le génitif, surtout à l'imperfectif.",
          ],
        },
      ],
    },
    {
      slug: "verbes-sans-paire",
      title: "Verbes sans paire et cas limites",
      titleRu: "Одновидовые и двувидовые глаголы",
      level: "B2",
      minutes: 8,
      summary:
        "Certains verbes n'ont qu'un aspect, d'autres les ont tous les deux dans la même forme. Plus les semelfactifs, qui comptent les coups.",
      keywords: ["одновидовые", "двувидовые", "semelfactif", "крикнуть", "жить", "использовать"],
      sections: [
        {
          kind: "table",
          title: "Trois catégories à part",
          head: ["Catégorie", "Exemples", "Explication"],
          rows: [
            [
              "Imperfectifs seuls",
              "жить, знать, име́ть, зави́сеть, сто́ить, находи́ться",
              "des états, qui n'ont pas de terme",
            ],
            [
              "Perfectifs seuls",
              "очну́ться, хлы́нуть, ри́нуться",
              "des événements ponctuels par nature",
            ],
            [
              "Bi-aspectuels",
              "испо́льзовать, жени́ться, веле́ть, ра́нить, обеща́ть",
              "une seule forme pour les deux aspects",
            ],
          ],
          note: "Pour un bi-aspectuel, seul le contexte tranche : Он испо́льзовал… peut être « il utilisait » ou « il a utilisé ».",
        },
        {
          kind: "prose",
          title: "Les semelfactifs en -ну-",
          body: [
            "Le suffixe -ну- transforme une activité continue en un coup unique : крича́ть (crier) → кри́кнуть (pousser un cri), пры́гать (sauter) → пры́гнуть (faire un saut), стуча́ть (frapper) → сту́кнуть (donner un coup).",
            "Ce ne sont pas exactement des paires aspectuelles : кри́кнуть ne signifie pas « avoir fini de crier » mais « crier une fois ». Le russe compte les occurrences là où le français ajouterait « un coup de ».",
          ],
        },
        {
          kind: "prose",
          title: "Les itératifs en -ыва- / -ива-",
          body: [
            "Quelques verbes ont une forme d'habitude passée, aujourd'hui rare et un peu littéraire : зна́ть → зна́вать, ходи́ть → ха́живать, говори́ть → гова́ривать. Elles s'emploient presque toujours au passé négatif ou dans des tournures figées : Он не́ был там, не ха́живал.",
            "On les rencontre en lecture, on ne les produit pas — sauf pour faire un effet de style volontairement ancien.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он живёт в Москве́ уже́ де́сять лет.", fr: "Il habite Moscou depuis dix ans.", note: "жить n'a pas de perfectif" },
            { ru: "Она́ кри́кнула и убежа́ла.", fr: "Elle a poussé un cri et s'est enfuie." },
            { ru: "Мы испо́льзуем э́тот ме́тод.", fr: "Nous utilisons cette méthode.", note: "bi-aspectuel : ici, présent" },
            { ru: "Он пообеща́л прийти́.", fr: "Il a promis de venir.", note: "по- rend обеща́ть nettement perfectif" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Les verbes d'état n'ont pas de perfectif : жить, знать, сто́ить.",
            "Les bi-aspectuels se lisent dans le contexte : испо́льзовать, жени́ться.",
            "-ну- fait le coup unique : кри́кнуть, пры́гнуть.",
            "Les itératifs en -ыва- appartiennent à la lecture, pas à la production.",
          ],
        },
      ],
    },
  ],
};
