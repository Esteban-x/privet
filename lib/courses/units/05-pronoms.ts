import type { Unit } from "../types";

/**
 * Unité 5 — les pronoms et déterminants, y compris les trois systèmes que le
 * français ne distingue pas : свой, -то/-нибудь, et la double négation.
 */
export const UNIT_PRONOMS: Unit = {
  slug: "pronoms",
  title: "Pronoms et déterminants",
  titleRu: "Местоимения",
  subtitle:
    "Décliner les pronoms, choisir entre свой et его́, entre -то et -нибудь, et manier les négatifs.",
  color: "#2456A6",
  lessons: [
    {
      slug: "pronoms-personnels-declines",
      title: "Les pronoms personnels déclinés",
      titleRu: "Склонение личных местоимений",
      level: "A2",
      minutes: 9,
      summary:
        "Sept pronoms, six cas, et une lettre н qui apparaît dès qu'une préposition les précède.",
      keywords: ["pronoms", "меня", "мне", "него", "склонение", "личные местоимения"],
      sections: [
        {
          kind: "table",
          title: "Le tableau complet",
          head: ["Nom.", "Gén.", "Dat.", "Acc.", "Instr.", "Prép."],
          rows: [
            ["я", "меня́", "мне", "меня́", "мной", "обо мне"],
            ["ты", "тебя́", "тебе́", "тебя́", "тобо́й", "о тебе́"],
            ["он / оно́", "его́", "ему́", "его́", "им", "о нём"],
            ["она́", "её", "ей", "её", "ей", "о ней"],
            ["мы", "нас", "нам", "нас", "на́ми", "о нас"],
            ["вы", "вас", "вам", "вас", "ва́ми", "о вас"],
            ["они́", "их", "им", "их", "и́ми", "о них"],
          ],
        },
        {
          kind: "prose",
          title: "Le н d'appui",
          body: [
            "Les formes de la troisième personne (его́, ему́, им, её, ей, их, и́ми) prennent un н- initial après une préposition : у него́, к нему́, с ним, о ней, для них, ме́жду ни́ми.",
            "Sans préposition, pas de н : Я ви́жу его́, Я дал ему́ кни́гу. Cette alternance vient d'anciennes prépositions terminées par -н qui ont fini par céder leur consonne au pronom ; elle est aujourd'hui purement mécanique.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он мне не звони́л.", fr: "Il ne m'a pas appelé.", note: "datif, sans préposition" },
            { ru: "Я иду́ к нему́.", fr: "Je vais chez lui.", note: "к + datif : н d'appui" },
            { ru: "Мы говори́ли о них вчера́.", fr: "Nous avons parlé d'eux hier." },
            { ru: "У неё нет вре́мени.", fr: "Elle n'a pas le temps." },
            { ru: "Э́то для тебя́.", fr: "C'est pour toi." },
          ],
        },
        {
          kind: "pitfall",
          title: "Его́ pronom et его́ possessif",
          body: [
            "Его́ signifie « le / lui » (accusatif ou génitif du pronom) et « son / sa / ses » (possessif invariable). Ce sont deux mots identiques, distingués seulement par la place : Я ви́жу его́ (je le vois) contre Э́то его́ дом (c'est sa maison).",
            "Le н d'appui, lui, ne concerne QUE le pronom : у него́ (chez lui) mais у его́ бра́та (chez son frère) — puisqu'ici его́ est possessif et que la préposition porte sur бра́та.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Six formes par pronom, à apprendre comme un tout.",
            "н- après préposition : у него́, к ней, с ни́ми.",
            "Pas de н- sans préposition : его́ зову́т, ему́ ну́жно.",
            "у его́ бра́та : pas de н, car его́ y est possessif.",
          ],
        },
      ],
    },
    {
      slug: "pronom-reflechi-sebya",
      title: "Le pronom réfléchi себя́",
      titleRu: "Возвратное местоимение себя",
      level: "B1",
      minutes: 7,
      summary:
        "Une seule forme pour toutes les personnes, sans nominatif : elle renvoie toujours au sujet de la proposition.",
      keywords: ["себя", "réfléchi", "возвратное", "собой", "себе"],
      sections: [
        {
          kind: "prose",
          body: [
            "Себя́ ne varie pas selon la personne : я говорю́ о себе́, ты говори́шь о себе́, они́ говоря́т о себе́. Un seul mot remplace « moi-même, toi-même, lui-même, nous-mêmes ».",
            "Il n'a pas de nominatif, pour une raison logique : il renvoie au sujet, il ne peut donc pas l'être lui-même.",
          ],
        },
        {
          kind: "table",
          title: "Ses formes",
          head: ["Cas", "Forme", "Exemple"],
          rows: [
            ["Génitif", "себя́", "Он не ждал э́того от себя́."],
            ["Datif", "себе́", "Купи́ себе́ что́-нибудь."],
            ["Accusatif", "себя́", "Она́ уви́дела себя́ в зе́ркале."],
            ["Instrumental", "собо́й", "Возьми́ де́ньги с собо́й."],
            ["Prépositionnel", "о себе́", "Расскажи́те о себе́."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Расскажи́те немно́го о себе́.", fr: "Parlez-moi un peu de vous.", note: "formule d'entretien" },
            { ru: "Он купи́л себе́ но́вый телефо́н.", fr: "Il s'est acheté un nouveau téléphone." },
            { ru: "Я взял с собо́й зонт.", fr: "J'ai pris un parapluie avec moi." },
            { ru: "Чу́вствуй себя́ как до́ма.", fr: "Fais comme chez toi." },
          ],
        },
        {
          kind: "pitfall",
          title: "Себя́ ou -ся ?",
          body: [
            "Le suffixe -ся des verbes réfléchis vient de себя́, mais les deux ne sont plus interchangeables. Мы́ться (se laver) est un verbe complet ; мыть себя́ n'est employé que pour insister sur l'objet, et sonne étrange dans la plupart des contextes.",
            "Règle pratique : quand il existe un verbe en -ся pour l'action, on l'emploie. Себя́ sert quand on veut souligner (Он ду́мает то́лько о себе́) ou après une préposition, où -ся ne peut pas aller.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Une forme unique pour toutes les personnes.",
            "Pas de nominatif : il ne peut pas être sujet.",
            "Il renvoie au sujet de SA proposition.",
            "Les verbes en -ся lui sont préférés quand ils existent.",
          ],
        },
      ],
    },
    {
      slug: "svoy",
      title: "Свой, le possessif du sujet",
      titleRu: "Притяжательное местоимение свой",
      level: "B1",
      minutes: 9,
      summary:
        "« Il aime sa femme » : свою́ ou его́ ? Le russe distingue ce que le français laisse au contexte — et le choix change de qui l'on parle.",
      keywords: ["свой", "possessif", "réfléchi", "своя", "ambiguïté"],
      sections: [
        {
          kind: "prose",
          body: [
            "Свой signifie « son propre », et renvoie toujours au SUJET de la proposition. Il s'accorde comme мой avec l'objet possédé : свой дом, своя́ кни́га, своё окно́, свои́ друзья́.",
            "Sa présence est obligatoire dès que le possesseur est le sujet à la troisième personne. Employer его́ à sa place ne produit pas une phrase maladroite : cela désigne quelqu'un d'autre.",
          ],
        },
        {
          kind: "examples",
          title: "La différence en une paire",
          items: [
            {
              ru: "Он лю́бит свою́ жену́.",
              fr: "Il aime sa femme (la sienne).",
              note: "свою́ renvoie au sujet он",
            },
            {
              ru: "Он лю́бит его́ жену́.",
              fr: "Il aime la femme d'un autre.",
              note: "его́ renvoie à un tiers déjà mentionné",
            },
            {
              ru: "Она́ взяла́ свою́ су́мку.",
              fr: "Elle a pris son sac (à elle).",
            },
            {
              ru: "Она́ взяла́ её су́мку.",
              fr: "Elle a pris le sac d'une autre.",
            },
          ],
        },
        {
          kind: "prose",
          title: "Aux deux premières personnes",
          body: [
            "Avec я, ты, мы, вы, свой est facultatif : Я взял свою́ кни́гу et Я взял мою́ кни́гу sont tous deux corrects, свой étant un peu plus naturel. Aucune ambiguïté n'est possible, puisque мой ne peut désigner que moi.",
            "À la troisième personne, en revanche, свой n'est jamais facultatif. C'est là que le francophone se trompe, parce que sa langue ne lui donne aucun signal.",
          ],
        },
        {
          kind: "pitfall",
          title: "Свой ne peut pas être sujet",
          body: [
            "Comme себя́, свой renvoie au sujet : il ne peut donc pas en faire partie. « Sa sœur travaille ici » ne se dit pas « Своя́ сестра́ рабо́тает здесь » mais Его́ сестра́ рабо́тает здесь.",
            "La règle se vérifie en cherchant le verbe : si le mot possédé est le sujet de ce verbe, свой est exclu.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "свой renvoie au sujet de la proposition, et s'accorde avec l'objet possédé.",
            "3ᵉ personne : свой obligatoire, его́ désigne un autre.",
            "1ʳᵉ et 2ᵉ personnes : свой et мой sont équivalents.",
            "свой ne peut jamais faire partie du sujet.",
          ],
        },
      ],
    },
    {
      slug: "demonstratifs",
      title: "Les démonstratifs э́тот et тот",
      titleRu: "Указательные местоимения",
      level: "A2",
      minutes: 7,
      summary:
        "Ce qui est ici et ce qui est là-bas, avec la distinction que le français a perdue entre « celui-ci » et « celui-là ».",
      keywords: ["этот", "тот", "démonstratif", "указательные", "celui-ci", "такой"],
      sections: [
        {
          kind: "table",
          title: "Les formes du nominatif",
          head: ["", "Masculin", "Féminin", "Neutre", "Pluriel"],
          rows: [
            ["proche (ce…-ci)", "э́тот", "э́та", "э́то", "э́ти"],
            ["éloigné (ce…-là)", "тот", "та", "то", "те"],
            ["qualité (un tel)", "тако́й", "така́я", "тако́е", "таки́е"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Э́тот désigne ce qui est proche dans l'espace, le temps ou le discours ; тот, ce qui est éloigné ou déjà écarté. Le contraste est vivant, contrairement au français où « celui-là » a largement absorbé « celui-ci ».",
            "Тот sert aussi à annoncer une relative : Тот, кто зна́ет, молчи́т (celui qui sait se tait). Et il forme l'expression не тот : Э́то не тот авто́бус — ce n'est pas le bon bus.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Э́тот дом ста́рый, а тот но́вый.", fr: "Cette maison-ci est vieille, celle-là est neuve." },
            { ru: "В то вре́мя я жил в Москве́.", fr: "À cette époque-là, j'habitais Moscou." },
            { ru: "Я не ожида́л тако́го отве́та.", fr: "Je ne m'attendais pas à une telle réponse." },
            { ru: "Э́то то, что мне ну́жно.", fr: "C'est exactement ce qu'il me faut." },
          ],
        },
        {
          kind: "pitfall",
          title: "Э́то invariable contre э́то variable",
          body: [
            "Э́то est à la fois le présentatif invariable (« c'est ») et la forme neutre du démonstratif (« ce… -ci »). Э́то кни́га = c'est un livre ; э́то окно́ = cette fenêtre (ou : c'est une fenêtre, selon le contexte).",
            "Le test : si le mot suivant est au nominatif et qu'on peut mettre un verbe être devant, э́то est présentatif. S'il forme un groupe avec le nom (et qu'il se décline avec lui : в э́том до́ме), c'est le démonstratif.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "э́тот = proche, тот = éloigné ou déjà mentionné.",
            "тако́й porte sur la qualité : « un tel, pareil ».",
            "тот, кто… introduit une relative.",
            "не тот = « pas le bon ».",
          ],
        },
      ],
    },
    {
      slug: "interrogatifs-declines",
      title: "Les interrogatifs déclinés",
      titleRu: "Вопросительные местоимения",
      level: "A2",
      minutes: 7,
      summary:
        "Кто, что, како́й, чей se déclinent comme le reste — et c'est leur forme déclinée qui donne la terminaison cherchée.",
      keywords: ["кто", "что", "какой", "чей", "interrogatif", "кого", "кому"],
      sections: [
        {
          kind: "table",
          title: "Кто et что",
          head: ["Cas", "кто (qui)", "что (quoi)"],
          rows: [
            ["Nominatif", "кто", "что"],
            ["Génitif", "кого́", "чего́"],
            ["Datif", "кому́", "чему́"],
            ["Accusatif", "кого́", "что"],
            ["Instrumental", "кем", "чем"],
            ["Prépositionnel", "о ком", "о чём"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Ces formes sont plus qu'une curiosité : ce sont les questions de chaque cas. Savoir que le datif répond à кому́, c'est disposer d'un test immédiat pour trancher le cas d'un mot dans une phrase.",
            "Чей (à qui) s'accorde comme un adjectif avec l'objet possédé : чей дом? чья кни́га? чьё окно́? чьи де́ти? Il se décline ensuite : с чьей по́мощью (avec l'aide de qui).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Кого́ вы жда́ли?", fr: "Qui attendiez-vous ?", note: "жда́ть + accusatif animé = кого́" },
            { ru: "Кому́ ты звони́шь?", fr: "À qui téléphones-tu ?" },
            { ru: "С кем ты идёшь?", fr: "Avec qui y vas-tu ?" },
            { ru: "О чём вы говори́те?", fr: "De quoi parlez-vous ?" },
            { ru: "Чья э́то маши́на?", fr: "À qui est cette voiture ?" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "кто se décline comme un animé, что comme un inanimé.",
            "Les formes déclinées de кто/что sont les questions des six cas.",
            "чей s'accorde avec l'objet possédé, puis se décline.",
            "како́й interroge la qualité, кото́рый (dans une question) le rang.",
          ],
        },
      ],
    },
    {
      slug: "relatif-kotoryy",
      title: "Le relatif кото́рый",
      titleRu: "Относительное местоимение который",
      level: "B1",
      minutes: 9,
      summary:
        "Le pronom relatif prend son genre de l'antécédent et son cas de sa propre proposition. Deux sources, jamais la même.",
      keywords: ["который", "relatif", "qui", "que", "subordonnée", "относительное"],
      sections: [
        {
          kind: "prose",
          body: [
            "Кото́рый traduit « qui », « que », « dont », « auquel ». Il se décline comme un adjectif, et sa forme se décide en deux temps : le GENRE et le NOMBRE viennent du mot qu'il remplace ; le CAS vient de sa fonction dans la subordonnée.",
            "C'est la seule vraie difficulté, et elle disparaît dès qu'on prend l'habitude de reconstruire la subordonnée comme une phrase indépendante.",
          ],
        },
        {
          kind: "examples",
          title: "Le même antécédent, quatre cas",
          items: [
            {
              ru: "Челове́к, кото́рый живёт здесь, — врач.",
              fr: "L'homme qui habite ici est médecin.",
              note: "sujet de la subordonnée → nominatif",
            },
            {
              ru: "Челове́к, кото́рого я ви́дел, — врач.",
              fr: "L'homme que j'ai vu est médecin.",
              note: "objet direct animé → accusatif = génitif",
            },
            {
              ru: "Челове́к, кото́рому я звони́л, — врач.",
              fr: "L'homme à qui j'ai téléphoné est médecin.",
              note: "звони́ть + datif",
            },
            {
              ru: "Челове́к, о кото́ром мы говори́ли, — врач.",
              fr: "L'homme dont nous avons parlé est médecin.",
              note: "о + prépositionnel",
            },
          ],
        },
        {
          kind: "prose",
          title: "« Dont » n'existe pas",
          body: [
            "Le français « dont » recouvre plusieurs relations que le russe distingue : possession (кни́га, а́втор кото́рой изве́стен — le livre dont l'auteur est connu), objet d'un verbe (о кото́ром, кото́рого), origine (из кото́рого).",
            "On ne traduit donc jamais « dont » directement : on cherche quelle relation il exprime, puis on met кото́рый au cas correspondant. Notez que le génitif possessif se place APRÈS le nom : дом, окна́ кото́рого вы́ходят в сад.",
          ],
        },
        {
          kind: "pitfall",
          title: "La virgule n'est pas optionnelle",
          body: [
            "Toute subordonnée relative est détachée par une virgule, et par DEUX si elle est enchâssée au milieu de la phrase. Челове́к, кото́рый живёт здесь, — врач porte deux virgules et un tiret.",
            "C'est une règle de grammaire, pas de style : l'omettre est une faute au même titre qu'une terminaison fausse.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Genre et nombre : de l'antécédent. Cas : de la subordonnée.",
            "Reconstruire la subordonnée en phrase simple pour trouver le cas.",
            "« dont » se traduit selon la relation, jamais mot à mot.",
            "Virgules obligatoires autour de la relative.",
          ],
        },
      ],
      practice: [{ href: "/participles/subject", label: "Exercice : participes et relatives" }],
    },
    {
      slug: "indefinis-to-nibud",
      title: "Les indéfinis : -то, -нибудь, кое-",
      titleRu: "Неопределённые местоимения",
      level: "B1",
      minutes: 9,
      summary:
        "Quelqu'un de précis mais inconnu, ou n'importe qui : le russe le marque par un suffixe, là où le français emploie le même mot.",
      keywords: ["кто-то", "кто-нибудь", "что-то", "indéfini", "неопределённые", "кое-кто"],
      sections: [
        {
          kind: "prose",
          body: [
            "Un même mot français, « quelqu'un », recouvre deux idées : une personne réelle mais non identifiée (« quelqu'un a appelé »), et une personne quelconque (« si quelqu'un appelle »). Le russe les distingue par un suffixe.",
            "-ТО : la personne ou la chose existe, mais on ne sait pas laquelle. -НИБУДЬ : n'importe laquelle, l'existence n'est pas garantie. КОЕ- : je sais laquelle mais je ne le dis pas.",
          ],
        },
        {
          kind: "table",
          title: "Les trois séries",
          head: ["-то (existe, inconnu)", "-нибудь (n'importe lequel)", "кое- (connu, tu)"],
          rows: [
            ["кто́-то", "кто́-нибудь", "ко́е-кто"],
            ["что́-то", "что́-нибудь", "ко́е-что"],
            ["где́-то", "где́-нибудь", "ко́е-где"],
            ["когда́-то", "когда́-нибудь", "—"],
            ["како́й-то", "како́й-нибудь", "ко́е-како́й"],
          ],
          note: "Seule la base se décline : кого́-то, кому́-нибудь, о ко́м-то.",
        },
        {
          kind: "examples",
          title: "Le suffixe change la situation",
          items: [
            {
              ru: "Кто́-то звони́л, пока́ тебя́ не́ было.",
              fr: "Quelqu'un a appelé pendant ton absence.",
              note: "l'appel a eu lieu : -то",
            },
            {
              ru: "Е́сли кто́-нибудь позвони́т, скажи́, что я за́нят.",
              fr: "Si quelqu'un appelle, dis que je suis occupé.",
              note: "hypothèse : -нибудь",
            },
            {
              ru: "Он что́-то сказа́л, но я не расслы́шал.",
              fr: "Il a dit quelque chose, mais je n'ai pas entendu.",
            },
            {
              ru: "Расскажи́ мне что́-нибудь интере́сное.",
              fr: "Raconte-moi quelque chose d'intéressant.",
              note: "n'importe quoi d'intéressant",
            },
            {
              ru: "Ты был когда́-нибудь в Росси́и?",
              fr: "Es-tu déjà allé en Russie ?",
              note: "question ouverte : -нибудь",
            },
          ],
        },
        {
          kind: "prose",
          title: "La règle des trois contextes",
          body: [
            "-НИБУДЬ s'impose dans trois environnements : les questions, les conditions (е́сли), et le futur ou l'impératif. Partout ailleurs, quand l'événement a réellement eu lieu, c'est -то.",
            "Ce test résout la quasi-totalité des hésitations : passé et affirmation → -то ; question, condition, futur, ordre → -нибудь.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "-то : ça existe, on ne sait pas quoi.",
            "-нибудь : n'importe lequel, ou pas encore réalisé.",
            "кое- : je sais, je ne dis pas.",
            "Question / condition / futur / impératif ⇒ -нибудь.",
          ],
        },
      ],
    },
    {
      slug: "negatifs",
      title: "Les pronoms négatifs",
      titleRu: "Отрицательные местоимения",
      level: "B2",
      minutes: 9,
      summary:
        "Никто́ appelle не sur le verbe ; не́кого appelle un infinitif. Deux séries qui se ressemblent et ne se construisent pas du tout pareil.",
      keywords: ["никто", "ничто", "некого", "нечего", "négatif", "double négation"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe a deux séries négatives, distinguées par l'accent et par la construction. La série НИ- (никто́, ничто́, никогда́, нигде́, никако́й) accompagne obligatoirement un verbe nié par не : c'est la double négation, qui est ici la norme.",
            "La série НЕ- accentuée (не́кого, не́чего, не́где, не́когда) construit tout autrement : sans не sur le verbe, avec un infinitif, et la personne au datif. Elle dit l'impossibilité par absence.",
          ],
        },
        {
          kind: "table",
          title: "Les deux séries face à face",
          head: ["ни- (avec не)", "не- (avec infinitif)", "Sens"],
          rows: [
            ["Никто́ не пришёл.", "Не́кому помо́чь.", "Personne n'est venu / Il n'y a personne pour aider."],
            ["Я ничего́ не зна́ю.", "Мне не́чего сказа́ть.", "Je ne sais rien / Je n'ai rien à dire."],
            ["Он нигде́ не рабо́тает.", "Ему́ не́где жить.", "Il ne travaille nulle part / Il n'a nulle part où vivre."],
            ["Она́ никогда́ не опа́здывает.", "Мне не́когда.", "Elle n'est jamais en retard / Je n'ai pas le temps."],
          ],
        },
        {
          kind: "prose",
          title: "Quand une préposition s'en mêle",
          body: [
            "Les pronoms négatifs se coupent en deux autour de la préposition : ни с кем (avec personne), ни о чём (de rien), не́ с кем (avec personne, il n'y a personne avec qui), не́ о чем (rien dont).",
            "L'écriture en trois mots surprend, mais elle est obligatoire : Я ни с кем не говори́л, Мне не́ с кем поговори́ть.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я никогда́ никому́ ничего́ не говорю́.", fr: "Je ne dis jamais rien à personne.", note: "quatre négations, toutes obligatoires" },
            { ru: "Мне не́чего де́лать.", fr: "Je n'ai rien à faire." },
            { ru: "Мне не́чего надева́ть.", fr: "Je n'ai rien à me mettre." },
            { ru: "Она́ ни с кем не разгова́ривает.", fr: "Elle ne parle avec personne." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "ни- + не sur le verbe : la double négation est obligatoire.",
            "не- accentué + infinitif + datif : l'impossibilité par absence.",
            "Les prépositions s'insèrent au milieu : ни с кем, не́ с кем.",
            "L'accent distingue les deux séries à l'oral : никто́ / не́кого.",
          ],
        },
      ],
    },
    {
      slug: "ves-sam-drug-druga",
      title: "Весь, сам, са́мый, друг дру́га",
      titleRu: "Весь, сам, самый, друг друга",
      level: "B2",
      minutes: 8,
      summary:
        "Quatre mots courants et facilement confondus : « tout », « soi-même », « le plus » et « l'un l'autre ».",
      keywords: ["весь", "все", "всё", "сам", "самый", "друг друга", "tout"],
      sections: [
        {
          kind: "table",
          title: "Весь : tout, entier",
          head: ["Forme", "Emploi", "Exemple"],
          rows: [
            ["весь", "masculin", "весь день (toute la journée)"],
            ["вся", "féminin", "вся семья́ (toute la famille)"],
            ["всё", "neutre / « tout »", "Всё хорошо́. (tout va bien)"],
            ["все", "pluriel / « tous »", "Все зна́ют. (tout le monde sait)"],
          ],
          note: "Все = les gens, всё = les choses. Все пришли́ (tout le monde est venu) ≠ Всё пришло́ (tout est arrivé).",
        },
        {
          kind: "prose",
          title: "Сам et са́мый",
          body: [
            "Сам signifie « en personne, moi-même » et insiste sur l'agent : Я сам э́то сде́лал (je l'ai fait moi-même). Il s'accorde : сам, сама́, само́, са́ми.",
            "Са́мый, lui, forme le superlatif (са́мый большо́й) ou souligne l'identité exacte : в са́мом це́нтре (en plein centre), тот же са́мый (exactement le même). Les deux mots se ressemblent et ne se remplacent jamais.",
          ],
        },
        {
          kind: "prose",
          title: "Друг дру́га",
          body: [
            "« L'un l'autre » se dit друг дру́га, où seul le second élément se décline : Они́ лю́бят друг дру́га (ils s'aiment l'un l'autre), Мы помога́ем друг дру́гу (nous nous aidons mutuellement).",
            "Avec une préposition, elle se glisse entre les deux : друг с дру́гом (l'un avec l'autre), друг о дру́ге (l'un de l'autre). Rien à voir avec друг « ami », malgré l'homonymie.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Все говоря́т об э́том.", fr: "Tout le monde en parle." },
            { ru: "Э́то всё, что я зна́ю.", fr: "C'est tout ce que je sais." },
            { ru: "Она́ сама́ пригото́вила у́жин.", fr: "Elle a préparé le dîner elle-même." },
            { ru: "Мы ча́сто ви́дим друг дру́га.", fr: "Nous nous voyons souvent." },
            { ru: "Они́ говоря́т друг с дру́гом по-ру́сски.", fr: "Ils se parlent en russe." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "все = les gens (pluriel), всё = les choses (neutre).",
            "сам insiste sur l'agent ; са́мый forme le superlatif.",
            "друг дру́га : seul le deuxième mot se décline.",
            "La préposition s'insère au milieu : друг с дру́гом.",
          ],
        },
      ],
    },
  ],
};
