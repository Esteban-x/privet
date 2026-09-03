import type { Unit } from "../types";

/**
 * Unité 14 — ce qui reste quand la grammaire est acquise : à qui l'on parle,
 * comment on le dit, et les petits mots qui portent tout le ton.
 */
export const UNIT_REGISTRES: Unit = {
  slug: "registres",
  title: "Registres et langue vivante",
  titleRu: "Стиль и живая речь",
  subtitle:
    "Tutoyer ou vouvoyer, nommer les gens correctement, doser les particules, et reconnaître les quatre grands styles de l'écrit.",
  color: "#c17d1e",
  lessons: [
    {
      slug: "tu-et-vous",
      title: "Ты et вы",
      titleRu: "Ты и вы",
      level: "A2",
      minutes: 8,
      summary:
        "La frontière est plus nette qu'en français, et le passage au tutoiement se négocie explicitement.",
      keywords: ["ты", "вы", "tutoiement", "politesse", "обращение", "registre"],
      sections: [
        {
          kind: "prose",
          body: [
            "Вы s'emploie avec tout adulte que l'on ne connaît pas, avec un supérieur, avec une personne nettement plus âgée, et dans tout cadre professionnel tant qu'on n'a pas convenu du contraire. Ты s'emploie avec la famille, les amis, les enfants, et entre camarades du même âge dans un cadre informel.",
            "Là où le français hésite (« on se tutoie ? » se pose parfois, souvent jamais), le russe tranche par une phrase rituelle : Дава́й на ты? La proposition vient normalement de la personne la plus âgée ou la plus haut placée.",
          ],
        },
        {
          kind: "table",
          title: "Qui, avec qui",
          head: ["Interlocuteur", "Forme", "Remarque"],
          rows: [
            ["inconnu adulte", "вы", "sans exception"],
            ["collègue rencontré ce jour", "вы", "jusqu'à proposition contraire"],
            ["ami, membre de la famille", "ты", ""],
            ["enfant", "ты", "même inconnu"],
            ["personne âgée", "вы", "même si elle vous tutoie"],
            ["serveur, vendeur", "вы", "le tutoiement serait grossier"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Дава́йте перейдём на ты.", fr: "Et si on se tutoyait ?", note: "proposition polie" },
            { ru: "Извини́те, я к вам обраща́юсь.", fr: "Excusez-moi, je m'adresse à vous." },
            { ru: "Как ты счита́ешь?", fr: "Qu'en penses-tu ?" },
            { ru: "Вы не подска́жете, где метро́?", fr: "Vous pourriez me dire où est le métro ?", note: "formule d'abord poli standard" },
          ],
        },
        {
          kind: "pitfall",
          title: "Le vouvoiement se lit aussi au pluriel",
          body: [
            "Avec вы, le verbe et le passé se mettent au pluriel, même pour une seule personne : Вы говори́ли, Вы бы́ли пра́вы. En revanche, l'adjectif attribut reste au singulier dans la langue soignée : Вы прав (à un homme), Вы права́ (à une femme).",
            "Dans une lettre, Вы prend une majuscule quand on s'adresse à une seule personne, marque de respect toujours vivante dans la correspondance.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "вы par défaut avec un adulte inconnu, sans exception.",
            "Le passage au ты se propose : Дава́й на ты.",
            "Verbe au pluriel avec вы, même pour une personne.",
            "Вы majuscule dans une lettre à une seule personne.",
          ],
        },
      ],
    },
    {
      slug: "prenoms-et-patronymes",
      title: "Prénoms, patronymes, diminutifs",
      titleRu: "Имя, отчество, фамилия",
      level: "A2",
      minutes: 9,
      summary:
        "Ива́н Петро́вич, Ва́ня, Ива́н Серге́евич Петро́в : savoir nommer quelqu'un est la première marque de politesse russe.",
      keywords: ["patronyme", "отчество", "имя", "Иван", "диминутив", "nommer"],
      sections: [
        {
          kind: "prose",
          body: [
            "Un Russe porte trois noms : le prénom (и́мя), le patronyme (о́тчество, formé sur le prénom du père) et le nom de famille (фами́лия). L'ordre officiel est prénom, patronyme, nom : Ива́н Серге́евич Петро́в.",
            "Le patronyme se forme avec -ович / -евич pour un homme, -овна / -евна pour une femme : le fils de Серге́й est Серге́евич, sa fille Серге́евна.",
          ],
        },
        {
          kind: "table",
          title: "Comment s'adresser à quelqu'un",
          head: ["Forme", "Emploi", "Exemple"],
          rows: [
            ["prénom + patronyme", "respectueux : professeur, supérieur, aîné", "Ива́н Серге́евич"],
            ["prénom complet", "neutre, cadre professionnel jeune", "Ива́н"],
            ["diminutif courant", "amical, familier", "Ва́ня"],
            ["diminutif affectueux", "proches, enfants", "Ва́нечка"],
            ["diminutif brusque", "entre amis proches, un peu rude", "Ва́нька"],
            ["nom de famille seul", "école, armée, administration", "Петро́в!"],
          ],
        },
        {
          kind: "prose",
          title: "Les prénoms et leurs diminutifs",
          body: [
            "Le lien entre prénom officiel et diminutif n'est pas toujours devinable : Алекса́ндр → Са́ша, Евге́ний → Же́ня, Дми́трий → Ди́ма, Ната́лья → Ната́ша, Екатери́на → Ка́тя, Мари́я → Ма́ша, Влади́мир → Воло́дя.",
            "Certains diminutifs valent pour les deux genres : Са́ша peut être Алекса́ндр ou Алекса́ндра, Же́ня Евге́ний ou Евге́ния. Le contexte et l'accord des verbes lèvent l'ambiguïté.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Здра́вствуйте, Мари́я Ива́новна!", fr: "Bonjour, Maria Ivanovna !", note: "à une enseignante" },
            { ru: "Ва́ня, ты идёшь?", fr: "Vania, tu viens ?" },
            { ru: "Как вас зову́т? — Меня́ зову́т Ната́лья, мо́жно Ната́ша.", fr: "Comment vous appelez-vous ? — Natalia, ou Natacha." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Prénom + patronyme = la marque de respect standard.",
            "Patronyme : -ович / -овна, formé sur le prénom du père.",
            "Les diminutifs ont des niveaux : Ва́ня, Ва́нечка, Ва́нька.",
            "Le lien prénom / diminutif s'apprend : Алекса́ндр → Са́ша.",
          ],
        },
      ],
    },
    {
      slug: "formules-de-politesse",
      title: "Les formules de politesse",
      titleRu: "Формулы вежливости",
      level: "B1",
      minutes: 8,
      summary:
        "Demander, remercier, s'excuser, refuser : les tournures attendues, et celles qui sonnent brusques sans qu'on le veuille.",
      keywords: ["politesse", "пожалуйста", "извините", "будьте добры", "просьба"],
      sections: [
        {
          kind: "prose",
          body: [
            "La politesse russe passe moins par des formules longues que par la forme du verbe. Une demande directe à l'impératif perfectif peut sembler sèche ; la même demande au conditionnel ou à la forme négative interrogative devient courtoise.",
            "Не могли́ бы вы… ? (ne pourriez-vous pas…) est la formule passe-partout, l'équivalent de « auriez-vous l'amabilité de ».",
          ],
        },
        {
          kind: "table",
          title: "Du plus direct au plus poli",
          head: ["Formule", "Niveau", "Exemple"],
          rows: [
            ["impératif seul", "direct, sec", "Откро́йте окно́."],
            ["impératif + пожа́луйста", "neutre", "Откро́йте, пожа́луйста, окно́."],
            ["Вы не могли́ бы…", "poli", "Вы не могли́ бы откры́ть окно́?"],
            ["Бу́дьте добры́ / любе́зны", "très poli", "Бу́дьте добры́, откро́йте окно́."],
            ["Мо́жно…?", "demande de permission", "Мо́жно откры́ть окно́?"],
          ],
        },
        {
          kind: "examples",
          title: "Remercier, s'excuser, répondre",
          items: [
            { ru: "Большо́е спаси́бо!", fr: "Merci beaucoup !" },
            { ru: "Не́ за что.", fr: "Il n'y a pas de quoi." },
            { ru: "Извини́те, пожа́луйста.", fr: "Excusez-moi." },
            { ru: "Ничего́ стра́шного.", fr: "Ce n'est rien.", note: "réponse standard à une excuse" },
            { ru: "К сожале́нию, я не смогу́.", fr: "Malheureusement, je ne pourrai pas.", note: "refus adouci" },
          ],
        },
        {
          kind: "pitfall",
          title: "Пожа́луйста a deux sens",
          body: [
            "Пожа́луйста signifie « s'il vous plaît » dans une demande, et « je vous en prie » en réponse à un merci. Un même mot pour les deux moments de l'échange, ce qui déroute au début.",
            "Il ne s'emploie pas pour accepter une offre : à Хоти́те ча́ю? on répond Да, спаси́бо, jamais пожа́луйста.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "La politesse passe par la forme du verbe plus que par les formules.",
            "Не могли́ бы вы… ? convient partout.",
            "пожа́луйста = « s'il vous plaît » et « je vous en prie ».",
            "Refuser : к сожале́нию + explication, jamais un нет sec.",
          ],
        },
      ],
    },
    {
      slug: "particules-modales",
      title: "Les particules modales",
      titleRu: "Модальные частицы",
      level: "C1",
      minutes: 10,
      summary:
        "Же, ведь, ли, -то, ра́зве, неуже́ли : de petits mots intraduisibles qui portent l'essentiel du ton d'une phrase russe.",
      keywords: ["particules", "же", "ведь", "разве", "неужели", "частицы", "ton"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les particules ne changent pas le contenu de la phrase : elles changent le rapport du locuteur à ce qu'il dit. Le français fait la même chose avec l'intonation, « donc », « quand même », « eh bien ». Le russe le fait avec des mots courts, souvent inaccentués, placés en deuxième position.",
            "Leur maîtrise est le dernier palier avant de sonner naturel : une phrase sans particules est correcte et plate ; une phrase avec la bonne particule est vivante.",
          ],
        },
        {
          kind: "table",
          title: "Les particules essentielles",
          head: ["Particule", "Effet", "Exemple", "Traduction approchée"],
          rows: [
            ["же", "insistance, évidence", "Я же говори́л!", "Je te l'avais bien dit !"],
            ["ведь", "rappel d'un fait partagé", "Ты ведь зна́ешь его́.", "Tu le connais, quand même."],
            ["-то", "légère mise en relief", "Я-то зна́ю.", "Moi, je sais bien."],
            ["ли", "question indirecte ou doute", "Не зна́ю, придёт ли он.", "s'il viendra"],
            ["ра́зве", "surprise, doute", "Ра́зве он уе́хал?", "Il est parti, vraiment ?"],
            ["неуже́ли", "incrédulité forte", "Неуже́ли ты не по́нял?", "Tu n'as tout de même pas compris ?"],
            ["-ка", "adoucit un impératif", "Дай-ка посмотрю́.", "Voyons voir."],
            ["уж", "renforce, résigné", "Ну уж нет.", "Ah non, alors."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Где же он?", fr: "Mais où est-il donc ?" },
            { ru: "Ты ведь обеща́л.", fr: "Tu avais promis, tout de même." },
            { ru: "Ра́зве э́то тру́дно?", fr: "C'est difficile, vraiment ?" },
            { ru: "Пойдём-ка домо́й.", fr: "Allez, rentrons." },
          ],
        },
        {
          kind: "pitfall",
          title: "Ne pas en abuser",
          body: [
            "Les particules s'apprennent d'abord en compréhension. Placées au hasard, elles produisent un effet étrange : же mal posé sonne agressif, ведь mal posé fait reproche.",
            "Conseil pratique : en adopter deux ou trois qu'on a réellement entendues en contexte, et laisser les autres pour la lecture.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Elles portent le ton, pas le contenu.",
            "Position : souvent en deuxième place, après le mot souligné.",
            "же (évidence), ведь (fait partagé), ра́зве / неуже́ли (surprise).",
            "Comprendre d'abord, produire ensuite — et avec parcimonie.",
          ],
        },
      ],
    },
    {
      slug: "oralite",
      title: "La langue parlée",
      titleRu: "Разговорная речь",
      level: "C1",
      minutes: 9,
      summary:
        "Ну, вот, коро́че, дава́й : les mots d'appui de la conversation, les ellipses, et ce que l'oral fait de la grammaire.",
      keywords: ["oral", "разговорная", "ну", "короче", "давай", "ellipse"],
      sections: [
        {
          kind: "table",
          title: "Les mots d'appui",
          head: ["Mot", "Rôle", "Équivalent français"],
          rows: [
            ["ну", "amorce, hésitation", "eh bien, alors"],
            ["вот", "désignation, conclusion", "voilà"],
            ["коро́че", "résumé", "bref"],
            ["в о́бщем", "récapitulation", "en gros"],
            ["зна́чит", "enchaînement", "donc"],
            ["как бы", "atténuation (tic de langage)", "genre, un peu"],
            ["дава́й / дава́йте", "proposition, prise de congé", "allez"],
            ["ла́дно", "acceptation", "d'accord, bon"],
          ],
        },
        {
          kind: "prose",
          title: "Ce que l'oral abrège",
          body: [
            "La conversation russe supprime volontiers le pronom sujet dans les formules (Не зна́ю, Понима́ю), le verbe de mouvement après une intention claire (Я домо́й — je rentre), et parfois le verbe être au passé quand le contexte est net.",
            "Certaines prononciations se figent aussi : здра́вствуйте devient « zdrasstie » en débit rapide, сейча́с devient « chtchas », что devient « tcho » dans un registre relâché. Les reconnaître à l'écoute vaut mieux que les imiter.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Ну ла́дно, дава́й.", fr: "Bon d'accord, allez.", note: "prise de congé très courante" },
            { ru: "Коро́че, я не пошёл.", fr: "Bref, je n'y suis pas allé." },
            { ru: "Ты домо́й? — Ага́.", fr: "Tu rentres ? — Ouais.", note: "phrase sans verbe, réponse familière" },
            { ru: "Всё, пока́!", fr: "Voilà, salut !" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "ну, вот, коро́че, зна́чит : les béquilles du discours oral.",
            "L'oral supprime le pronom et parfois le verbe de mouvement.",
            "Les contractions de prononciation s'écoutent plus qu'elles ne s'imitent.",
            "дава́й sert aussi bien à proposer qu'à raccrocher.",
          ],
        },
      ],
    },
    {
      slug: "ecrit-vs-parle",
      title: "Écrit et parlé : deux grammaires",
      titleRu: "Устная и письменная речь",
      level: "C1",
      minutes: 9,
      summary:
        "Le même contenu ne se dit pas avec les mêmes structures : les participes et les noms d'action appartiennent à l'écrit, les subordonnées et les verbes à l'oral.",
      keywords: ["écrit", "oral", "стиль", "participes", "nominalisation", "registre"],
      sections: [
        {
          kind: "table",
          title: "Le même contenu, deux versions",
          head: ["Écrit", "Oral"],
          rows: [
            ["По́сле оконча́ния рабо́ты…", "Когда́ он ко́нчил рабо́тать…"],
            ["Реше́ние бы́ло при́нято.", "Реши́ли."],
            ["Лю́ди, живу́щие здесь…", "Те, кто здесь живёт…"],
            ["В связи́ с боле́знью…", "Потому́ что он заболе́л…"],
            ["Прочита́в письмо́, он ушёл.", "Он прочита́л письмо́ и ушёл."],
          ],
        },
        {
          kind: "prose",
          body: [
            "L'écrit russe NOMINALISE : il transforme les verbes en noms d'action (-ение, -ание) et compresse les propositions en participes et gérondifs. L'oral VERBALISE : il déplie tout en propositions coordonnées ou subordonnées.",
            "Un apprenant qui parle comme un texte administratif se fait comprendre, mais paraît guindé ; un apprenant qui écrit comme il parle paraît négligé. La compétence de niveau avancé consiste à savoir passer d'un registre à l'autre volontairement.",
          ],
        },
        {
          kind: "examples",
          title: "Un même message, deux registres",
          items: [
            { ru: "В связи́ с отсу́тствием свобо́дных мест поса́дка не произво́дится.", fr: "En raison de l'absence de places disponibles, l'embarquement n'a pas lieu.", note: "écrit : deux noms d'action, pas une seule proposition" },
            { ru: "Мест нет, поэ́тому никого́ не сажа́ют.", fr: "Il n'y a plus de places, donc on ne fait monter personne.", note: "le même contenu, en verbes" },
            { ru: "По́сле получе́ния письма́ он измени́л реше́ние.", fr: "Après réception de la lettre, il a modifié sa décision.", note: "получе́ние : le nom d'action, marque de l'écrit" },
            { ru: "Когда́ он получи́л письмо́, он переду́мал.", fr: "Quand il a reçu la lettre, il a changé d'avis.", note: "subordonnée et verbe : l'oral" },
            { ru: "Прошу́ вас сообщи́ть о ва́шем реше́нии.", fr: "Je vous prie de me faire part de votre décision.", note: "formule administrative figée" },
            { ru: "Скажи́, что ты реши́л.", fr: "Dis-moi ce que tu as décidé.", note: "la même demande, entre amis" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "L'écrit nominalise, l'oral verbalise.",
            "Participes et gérondifs : écrit. кото́рый et и : oral.",
            "Les noms d'action en -ение sont la marque du style formel.",
            "Savoir passer de l'un à l'autre est une compétence en soi.",
          ],
        },
      ],
    },
    {
      slug: "style-administratif",
      title: "Le style administratif",
      titleRu: "Официально-деловой стиль",
      level: "C1",
      minutes: 8,
      summary:
        "Formulaires, contrats, courriers officiels : un style codé qu'il faut savoir lire, et imiter le jour où l'on demande un visa.",
      keywords: ["administratif", "официальный", "заявление", "документ", "уважаемый"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe administratif se reconnaît à quatre traits : la nominalisation systématique, les locutions prépositionnelles longues (в свя́зи с, в соотве́тствии с, на основа́нии), le passif, et l'absence totale de sujet personnel.",
            "Il n'est pas là pour être élégant mais pour être opposable. Le lire, c'est apprendre à repérer l'information dans une phrase de quarante mots.",
          ],
        },
        {
          kind: "table",
          title: "Les tournures typiques",
          head: ["Formule", "Sens"],
          rows: [
            ["в свя́зи с + instrumental", "en raison de"],
            ["в соотве́тствии с + instrumental", "conformément à"],
            ["на основа́нии + génitif", "sur la base de"],
            ["в тече́ние + génitif", "dans un délai de"],
            ["Прошу́ + infinitif", "Je demande à ce que… (formule de requête)"],
            ["Уважа́емый / Уважа́емая…", "Monsieur / Madame (en-tête de lettre)"],
            ["С уваже́нием,", "Cordialement, (formule finale)"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Прошу́ предоста́вить мне о́тпуск с 1 по 15 ию́ля.", fr: "Je demande à bénéficier d'un congé du 1ᵉʳ au 15 juillet." },
            { ru: "Уважа́емый Ива́н Серге́евич!", fr: "Monsieur (Ivan Sergueïevitch),", note: "en russe, l'en-tête se termine par un point d'exclamation" },
            { ru: "Докуме́нты бы́ли по́даны в срок.", fr: "Les documents ont été déposés dans les délais." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Nominalisation, passif, locutions prépositionnelles longues.",
            "Прошу́ + infinitif : la formule de toute demande écrite.",
            "Уважа́емый + prénom et patronyme, avec point d'exclamation.",
            "С уваже́нием pour clore une lettre.",
          ],
        },
      ],
    },
    {
      slug: "style-scientifique-et-presse",
      title: "Presse et style scientifique",
      titleRu: "Научный и публицистический стиль",
      level: "C1",
      minutes: 8,
      summary:
        "Deux styles écrits que l'on rencontre en lecture courante, avec leurs marqueurs propres et leurs verbes de citation.",
      keywords: ["presse", "научный", "публицистический", "статья", "по данным", "style"],
      sections: [
        {
          kind: "table",
          title: "Les marqueurs de la presse",
          head: ["Formule", "Sens"],
          rows: [
            ["по да́нным + génitif", "selon les données de"],
            ["как сообща́ет + nominatif", "comme le rapporte"],
            ["по слова́м + génitif", "selon les propos de"],
            ["в ча́стности", "en particulier"],
            ["одна́ко", "cependant (écrit)"],
            ["тем не ме́нее", "néanmoins"],
            ["в результа́те + génitif", "à la suite de"],
          ],
        },
        {
          kind: "table",
          title: "Les marqueurs du scientifique",
          head: ["Formule", "Sens"],
          rows: [
            ["сле́дует отме́тить, что", "il convient de noter que"],
            ["таки́м о́бразом", "ainsi, par conséquent"],
            ["рассмо́трим", "considérons"],
            ["как изве́стно", "comme on le sait"],
            ["с одно́й стороны́… с друго́й стороны́", "d'une part… d'autre part"],
            ["де́лать вы́вод", "conclure"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Ces deux styles emploient la première personne du PLURIEL même pour un auteur unique (рассмо́трим, мы ви́дим), un usage que le français partage partiellement.",
            "La presse russe emploie aussi beaucoup les participes et les nominalisations, ce qui la rend dense mais très régulière : une fois les vingt formules ci-dessus acquises, un article devient lisible.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "По да́нным иссле́дования, число́ вы́росло на 15%.", fr: "Selon l'étude, le nombre a augmenté de 15 %." },
            { ru: "Сле́дует отме́тить, что э́ти да́нные непо́лные.", fr: "Il convient de noter que ces données sont incomplètes." },
            { ru: "Таки́м о́бразом, мы прихо́дим к вы́воду…", fr: "Ainsi, nous parvenons à la conclusion…" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "по да́нным, по слова́м, как сообща́ет : citer une source.",
            "сле́дует отме́тить, таки́м о́бразом : articuler un raisonnement.",
            "Première personne du pluriel pour un auteur unique.",
            "Vingt formules suffisent à débloquer la lecture de la presse.",
          ],
        },
      ],
      practice: [{ href: "/reading", label: "S'entraîner sur des textes" }],
    },
    {
      slug: "expressions-figees",
      title: "Les expressions figées",
      titleRu: "Устойчивые выражения",
      level: "C2",
      minutes: 8,
      summary:
        "Ce qui ne se traduit pas mot à mot : comment fonctionnent les locutions russes, et comment les apprendre sans se tromper de registre.",
      keywords: ["expressions", "фразеологизм", "idiomes", "locutions", "figé", "traduction"],
      sections: [
        {
          kind: "prose",
          body: [
            "Une expression figée se reconnaît à ceci : son sens ne se déduit pas de ses mots, et l'on ne peut y remplacer aucun élément. Le russe en est riche, et elles se répartissent en couches de registre très différentes — certaines relèvent du proverbe, d'autres de l'argot, d'autres encore de la langue écrite ancienne.",
            "Deux erreurs symétriques guettent l'apprenant. Traduire une expression française mot à mot produit une phrase incompréhensible. Et employer une expression russe rare ou datée, apprise dans un manuel, produit un effet théâtral que le locuteur ne voulait pas.",
          ],
        },
        {
          kind: "table",
          title: "Quelques types",
          head: ["Type", "Caractéristique", "Exemple de forme"],
          rows: [
            ["Verbe + nom figés", "le nom ne varie pas", "приня́ть реше́ние (prendre une décision)"],
            ["Comparaison figée", "как + nom", "как две ка́пли воды́ (comme deux gouttes d'eau)"],
            ["Formule de conversation", "invariable, situationnelle", "не́ за что (il n'y a pas de quoi)"],
            ["Proverbe", "phrase complète, souvent rimée", "structure binaire, rythme marqué"],
          ],
        },
        {
          kind: "prose",
          title: "Comment les apprendre",
          body: [
            "La bonne méthode est celle du contexte : noter l'expression AVEC la situation dans laquelle on l'a réellement entendue ou lue, et non dans une liste thématique. Une locution notée hors contexte est une locution qu'on emploiera de travers.",
            "Il est aussi utile de repérer les COLLOCATIONS ordinaires, moins spectaculaires que les idiomes mais bien plus fréquentes : приня́ть реше́ние (prendre une décision), оказа́ть по́мощь (apporter de l'aide), име́ть значе́ние (avoir de l'importance). Ce sont elles qui font qu'un texte sonne russe.",
          ],
        },
        {
          kind: "examples",
          title: "Des collocations à connaître",
          items: [
            { ru: "приня́ть реше́ние", fr: "prendre une décision", note: "et non « сде́лать реше́ние »" },
            { ru: "оказа́ть по́мощь", fr: "apporter de l'aide", note: "registre formel" },
            { ru: "име́ть значе́ние", fr: "avoir de l'importance" },
            { ru: "обрати́ть внима́ние на", fr: "prêter attention à" },
            { ru: "име́ть в виду́", fr: "vouloir dire, avoir en vue" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Une expression figée ne se démonte pas : aucun mot n'y est remplaçable.",
            "Les noter en contexte, jamais en liste hors situation.",
            "Les collocations ordinaires comptent plus que les idiomes pittoresques.",
            "Attention au registre : une expression datée détonne immédiatement.",
          ],
        },
      ],
      practice: [{ href: "/reading", label: "Les rencontrer en lecture" }],
    },
  ],
};
