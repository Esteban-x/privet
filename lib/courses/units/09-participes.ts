import type { Unit } from "../types";

/**
 * Unité 9 — participes et gérondifs : comment le russe écrit comprime en un
 * mot ce que la langue parlée dit en une subordonnée.
 */
export const UNIT_PARTICIPES: Unit = {
  slug: "participes",
  title: "Participes et gérondifs",
  titleRu: "Причастия и деепричастия",
  subtitle:
    "Quatre participes, deux gérondifs : les formes qui condensent une proposition entière en un seul mot.",
  color: "#8B2FA0",
  lessons: [
    {
      slug: "participes-vue-d-ensemble",
      title: "Participes : vue d'ensemble",
      titleRu: "Причастие: общая картина",
      level: "B1",
      minutes: 9,
      summary:
        "Un verbe qui se comporte comme un adjectif : quatre formes, réparties selon la voix et le temps.",
      keywords: ["participe", "причастие", "actif", "passif", "adjectif verbal"],
      sections: [
        {
          kind: "prose",
          body: [
            "Un participe est un verbe habillé en adjectif : il garde le sens et le régime du verbe (son aspect, son objet, ses compléments) mais s'accorde en genre, en nombre et en cas avec le nom qu'il qualifie.",
            "Il sert à remplacer une subordonnée relative : челове́к, кото́рый чита́ет кни́гу devient челове́к, чита́ющий кни́гу. Le sens ne change pas ; le registre, si : le participe appartient à l'écrit.",
          ],
        },
        {
          kind: "table",
          title: "Les quatre participes",
          head: ["Participe", "Suffixe", "Exemple", "Équivaut à"],
          rows: [
            ["Actif présent", "-щий", "чита́ющий", "кото́рый чита́ет"],
            ["Actif passé", "-вший", "чита́вший", "кото́рый чита́л"],
            ["Passif présent", "-мый", "чита́емый", "кото́рый чита́ется"],
            ["Passif passé", "-нный / -тый", "прочи́танный", "кото́рый был прочи́тан"],
          ],
        },
        {
          kind: "prose",
          title: "Quel verbe donne quel participe",
          body: [
            "Tous les verbes ne forment pas les quatre. Le participe présent (actif ou passif) suppose un verbe IMPERFECTIF, puisqu'il décrit une action en cours. Le participe passif suppose un verbe TRANSITIF, puisqu'il faut un objet à transformer en sujet.",
            "Un verbe perfectif intransitif comme прийти́ n'a donc qu'un seul participe : прише́дший, actif passé.",
          ],
        },
        {
          kind: "examples",
          items: [
            {
              ru: "Студе́нт, чита́ющий газе́ту, — мой брат.",
              fr: "L'étudiant qui lit le journal est mon frère.",
            },
            {
              ru: "Дом, постро́енный в про́шлом ве́ке, стои́т до сих пор.",
              fr: "La maison construite au siècle dernier tient toujours.",
            },
            {
              ru: "Я люблю́ фи́льмы, снима́емые в Евро́пе.",
              fr: "J'aime les films tournés en Europe.",
              note: "passif présent : rare, très écrit",
            },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le participe est un verbe qui s'accorde comme un adjectif.",
            "Il remplace une relative en кото́рый.",
            "Présent ⇒ verbe imperfectif ; passif ⇒ verbe transitif.",
            "Registre écrit : à l'oral, on préfère кото́рый.",
          ],
        },
      ],
      practice: [{ href: "/participles", label: "Le module Participes" }],
    },
    {
      slug: "participe-actif-present",
      title: "Le participe actif présent",
      titleRu: "Действительное причастие настоящего времени",
      level: "B1",
      minutes: 8,
      summary:
        "Чита́ющий : « celui qui est en train de lire ». Il se fabrique sur la troisième personne du pluriel, sans exception.",
      keywords: ["participe actif", "-щий", "читающий", "présent", "настоящее"],
      sections: [
        {
          kind: "prose",
          body: [
            "Formation en trois gestes : prendre la 3ᵉ personne du pluriel du présent, retirer le -т final, ajouter -щий. чита́ют → чита́ю- → чита́ющий. говоря́т → говоря́- → говоря́щий.",
            "Il se décline ensuite comme un adjectif mou : чита́ющий, чита́ющая, чита́ющее, чита́ющие, чита́ющего…",
          ],
        },
        {
          kind: "table",
          title: "Formation",
          head: ["Verbe", "они́", "Participe", "Sens"],
          rows: [
            ["чита́ть", "чита́ют", "чита́ющий", "qui lit"],
            ["говори́ть", "говоря́т", "говоря́щий", "qui parle"],
            ["жить", "живу́т", "живу́щий", "qui vit"],
            ["идти́", "иду́т", "иду́щий", "qui va"],
            ["учи́ться", "у́чатся", "уча́щийся", "qui étudie"],
          ],
          note: "Le -ся d'un verbe réfléchi reste, toujours sous la forme -ся, même après voyelle : уча́щийся.",
        },
        {
          kind: "examples",
          items: [
            {
              ru: "Де́вушка, сидя́щая у окна́, — моя́ сестра́.",
              fr: "La jeune fille assise près de la fenêtre est ma sœur.",
            },
            {
              ru: "Лю́ди, живу́щие в э́том до́ме, давно́ друг дру́га зна́ют.",
              fr: "Les gens qui habitent cet immeuble se connaissent depuis longtemps.",
            },
            {
              ru: "Мы и́щем челове́ка, говоря́щего по-кита́йски.",
              fr: "Nous cherchons quelqu'un qui parle chinois.",
              note: "le participe se décline : accusatif animé",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "Les participes devenus adjectifs",
          body: [
            "Certains participes se sont figés en adjectifs ordinaires et ont perdu leur valeur verbale : блестя́щий (brillant), сле́дующий (suivant), подходя́щий (approprié), выдаю́щийся (éminent).",
            "On les emploie sans y penser, y compris à l'oral, où les vrais participes seraient déplacés : сле́дующая остано́вка (le prochain arrêt) n'a plus rien d'une subordonnée.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "3ᵉ personne du pluriel, moins -т, plus -щий.",
            "Seulement à partir d'un verbe imperfectif.",
            "Il se décline comme un adjectif mou.",
            "Plusieurs se sont figés en adjectifs : сле́дующий, блестя́щий.",
          ],
        },
      ],
      practice: [{ href: "/participles/active", label: "Exercice : participes actifs" }],
    },
    {
      slug: "participe-actif-passe",
      title: "Le participe actif passé",
      titleRu: "Действительное причастие прошедшего времени",
      level: "B1",
      minutes: 8,
      summary:
        "Чита́вший, прочита́вший : « celui qui lisait », « celui qui a lu ». Le seul participe que tous les verbes peuvent former.",
      keywords: ["participe passé", "-вший", "прочитавший", "actif", "прошедшее"],
      sections: [
        {
          kind: "prose",
          body: [
            "Formation : on prend le passé masculin, on retire le -л, on ajoute -вший. чита́л → чита́вший, прочита́л → прочита́вший, писа́л → писа́вший.",
            "Quand le passé masculin n'a pas de -л (мог, нёс, вёл), on ajoute -ший directement au radical : мо́гший, нёсший, ве́дший.",
          ],
        },
        {
          kind: "table",
          title: "Formation et aspect",
          head: ["Verbe", "Passé", "Participe", "Sens"],
          rows: [
            ["чита́ть (impf.)", "чита́л", "чита́вший", "qui lisait"],
            ["прочита́ть (perf.)", "прочита́л", "прочита́вший", "qui a lu"],
            ["прийти́ (perf.)", "пришёл", "прише́дший", "qui est arrivé"],
            ["верну́ться (perf.)", "верну́лся", "верну́вшийся", "qui est revenu"],
            ["нести́ (impf.)", "нёс", "нёсший", "qui portait"],
          ],
        },
        {
          kind: "examples",
          items: [
            {
              ru: "Студе́нт, прочита́вший э́ту кни́гу, отве́тит легко́.",
              fr: "L'étudiant qui a lu ce livre répondra sans peine.",
            },
            {
              ru: "Челове́к, верну́вшийся из Росси́и, рассказа́л нам всё.",
              fr: "L'homme revenu de Russie nous a tout raconté.",
            },
            {
              ru: "Пассажи́ры, опозда́вшие на по́езд, жда́ли сле́дующего.",
              fr: "Les passagers qui avaient raté le train attendaient le suivant.",
            },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Passé masculin sans -л, plus -вший (ou -ший).",
            "Se forme sur les deux aspects, contrairement au participe présent.",
            "Les verbes en -ся gardent -ся : верну́вшийся.",
            "C'est le participe le plus productif du russe.",
          ],
        },
      ],
    },
    {
      slug: "participe-passif",
      title: "Les participes passifs",
      titleRu: "Страдательные причастия",
      level: "B2",
      minutes: 10,
      summary:
        "Прочи́танный, откры́тый, постро́енный : ce que l'on a fait à quelque chose. Trois suffixes, et une répartition à connaître.",
      keywords: ["passif", "страдательное", "-нный", "-тый", "-емый", "построенный"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le participe passif transforme l'objet du verbe en sujet : Я прочита́л кни́гу → кни́га, прочи́танная мной. Il ne se forme que sur des verbes transitifs.",
            "Le passif PRÉSENT (-емый, -имый) vient de la 1ʳᵉ personne du pluriel : чита́ем → чита́емый, люби́м → люби́мый. Il est peu productif et confiné à l'écrit soutenu — sauf quelques formes lexicalisées comme люби́мый (préféré) ou необходи́мый (indispensable).",
          ],
        },
        {
          kind: "table",
          title: "Le passif passé : trois suffixes",
          head: ["Suffixe", "Quand", "Exemple", "Sens"],
          rows: [
            ["-нный", "infinitif en -ать / -ять", "прочита́ть → прочи́танный", "lu"],
            ["-енный", "infinitif en -ить / -ти", "постро́ить → постро́енный", "construit"],
            ["-тый", "verbes courts, -ыть, -нуть, -ереть", "откры́ть → откры́тый", "ouvert"],
          ],
          note: "Les alternances de consonnes du présent reviennent devant -енный : купи́ть → ку́пленный, встре́тить → встре́ченный.",
        },
        {
          kind: "examples",
          items: [
            {
              ru: "Э́то кни́га, напи́санная в про́шлом ве́ке.",
              fr: "C'est un livre écrit au siècle dernier.",
            },
            {
              ru: "Мы вошли́ че́рез откры́тую дверь.",
              fr: "Nous sommes entrés par la porte ouverte.",
            },
            {
              ru: "Э́то мой люби́мый фильм.",
              fr: "C'est mon film préféré.",
              note: "participe passif présent lexicalisé",
            },
            {
              ru: "Все приглашённые уже́ пришли́.",
              fr: "Tous les invités sont déjà arrivés.",
              note: "participe substantivé",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "Un н ou deux ?",
          body: [
            "La forme longue du participe passif s'écrit avec DEUX н : прочи́танный, постро́енный. Sa forme courte n'en garde qu'UN : прочи́тан, постро́ен.",
            "C'est l'une des règles d'orthographe les plus discutées à l'école russe, et l'une des rares que les natifs eux-mêmes manquent régulièrement.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Verbes transitifs uniquement.",
            "-нный (verbes en -ать), -енный (verbes en -ить), -тый (verbes courts).",
            "Le passif présent en -емый est rare et livresque.",
            "Forme longue : -нн- ; forme courte : -н-.",
          ],
        },
      ],
      practice: [{ href: "/participles/passive", label: "Exercice : participes passifs" }],
    },
    {
      slug: "formes-courtes-du-participe",
      title: "Les formes courtes du participe passif",
      titleRu: "Краткие страдательные причастия",
      level: "B2",
      minutes: 8,
      summary:
        "Магази́н закры́т : la façon la plus courante de dire le passif en russe, et l'une des plus utiles au quotidien.",
      keywords: ["forme courte", "закрыт", "открыт", "passif", "построен", "объявление"],
      sections: [
        {
          kind: "prose",
          body: [
            "La forme courte du participe passif ne se décline pas : elle s'accorde seulement en genre et en nombre, et sert d'attribut. C'est elle qui exprime le passif au quotidien : Магази́н закры́т, Дверь откры́та, Все биле́ты про́даны.",
            "Le temps se marque avec быть : Магази́н был закры́т (était fermé), бу́дет закры́т (sera fermé). Au présent, comme toujours, le verbe être disparaît.",
          ],
        },
        {
          kind: "table",
          title: "Accord",
          head: ["Genre", "Forme", "Exemple"],
          rows: [
            ["masculin", "-н / -т", "Магази́н закры́т."],
            ["féminin", "-на / -та", "Дверь закры́та."],
            ["neutre", "-но / -то", "Окно́ закры́то."],
            ["pluriel", "-ны / -ты", "Магази́ны закры́ты."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Музе́й закры́т по понеде́льникам.", fr: "Le musée est fermé le lundi." },
            { ru: "Э́тот дом был постро́ен в 1900 году́.", fr: "Cette maison a été construite en 1900." },
            { ru: "Все биле́ты про́даны.", fr: "Tous les billets sont vendus." },
            { ru: "Рабо́та бу́дет сде́лана в срок.", fr: "Le travail sera fait dans les délais." },
            { ru: "Здесь ку́рят? — Нет, здесь кури́ть запрещено́.", fr: "On fume ici ? — Non, il est interdit de fumer.", note: "запрещено́ : forme courte neutre, impersonnelle" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Forme courte = attribut, accord en genre et nombre seulement.",
            "C'est le passif de la vie courante : закры́т, откры́т, про́дан.",
            "быть porte le temps : был закры́т, бу́дет закры́т.",
            "Un seul н : напи́сан, постро́ен, сде́лан.",
          ],
        },
      ],
      practice: [{ href: "/participles/short", label: "Exercice : formes courtes" }],
    },
    {
      slug: "gerondif",
      title: "Le gérondif",
      titleRu: "Деепричастие",
      level: "B2",
      minutes: 10,
      summary:
        "Чита́я, прочита́в : une action secondaire, greffée sur le verbe principal, avec une règle de sujet stricte.",
      keywords: ["gérondif", "деепричастие", "читая", "прочитав", "action secondaire"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le gérondif exprime une action accompagnée : simultanée si l'aspect est imperfectif, antérieure s'il est perfectif. Il est invariable — ni genre, ni nombre, ni cas.",
            "IMPERFECTIF : sur la 3ᵉ personne du pluriel, terminaison -я (ou -а après ж, ш, ч, щ). чита́ют → чита́я, говоря́т → говоря́, слы́шат → слы́ша. PERFECTIF : sur le passé, terminaison -в. прочита́л → прочита́в, сказа́л → сказа́в.",
          ],
        },
        {
          kind: "table",
          title: "Les deux gérondifs",
          head: ["Aspect", "Formation", "Exemple", "Rapport au verbe principal"],
          rows: [
            ["Imperfectif", "3ᵉ pl. + -я / -а", "чита́я", "en même temps"],
            ["Perfectif", "passé + -в", "прочита́в", "avant"],
            ["Réfléchi impf.", "3ᵉ pl. + -ясь", "улыба́ясь", "en même temps"],
            ["Réfléchi perf.", "passé + -вшись", "верну́вшись", "avant"],
          ],
          note: "быть fait бу́дучи, forme irrégulière et savante.",
        },
        {
          kind: "examples",
          items: [
            {
              ru: "Чита́я кни́гу, он де́лал заме́тки.",
              fr: "En lisant le livre, il prenait des notes.",
              note: "les deux actions se déroulent ensemble",
            },
            {
              ru: "Прочита́в кни́гу, он верну́л её в библиоте́ку.",
              fr: "Après avoir lu le livre, il l'a rendu à la bibliothèque.",
              note: "lecture terminée d'abord",
            },
            {
              ru: "Не зна́я а́дреса, я не смог его́ найти́.",
              fr: "Ne connaissant pas l'adresse, je n'ai pas pu le trouver.",
              note: "le gérondif exprime la cause",
            },
            {
              ru: "Он вы́шел, не сказа́в ни сло́ва.",
              fr: "Il est sorti sans dire un mot.",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "Le sujet doit être le même",
          body: [
            "Le sujet du gérondif est obligatoirement celui du verbe principal. « En lisant le livre, le téléphone a sonné » est une faute en russe comme en français soigné : ce n'est pas le téléphone qui lisait.",
            "Cette contrainte oblige souvent à renoncer au gérondif et à écrire une subordonnée : Когда́ я чита́л кни́гу, зазвони́л телефо́н. Les Russes s'en amusent : la phrase fautive est un classique de l'humour scolaire.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Invariable ; il ne s'accorde avec rien.",
            "Imperfectif -я : simultané. Perfectif -в : antérieur.",
            "Il exprime aussi la cause, la condition, la manière.",
            "Son sujet est celui du verbe principal — sans exception.",
          ],
        },
      ],
      practice: [{ href: "/participles/gerund", label: "Exercice : les gérondifs" }],
    },
    {
      slug: "participes-registre",
      title: "Quand employer ces formes",
      titleRu: "Причастия и стиль",
      level: "C1",
      minutes: 9,
      summary:
        "Les participes sont de l'écrit. Savoir les lire est indispensable ; savoir quand ne pas les employer l'est tout autant.",
      keywords: ["registre", "стиль", "который", "écrit", "oral", "transformation"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les participes et les gérondifs saturent la presse, l'administration, le droit et la littérature. Ils sont presque absents de la conversation, où le russe préfère кото́рый et deux propositions coordonnées.",
            "Un apprenant qui les emploie à l'oral se fait comprendre, mais sonne comme un communiqué. L'objectif réaliste est donc asymétrique : les reconnaître instantanément en lecture, les produire seulement à l'écrit.",
          ],
        },
        {
          kind: "table",
          title: "Le même contenu, deux registres",
          head: ["Écrit (participe)", "Oral (subordonnée)"],
          rows: [
            ["Челове́к, чита́ющий газе́ту…", "Челове́к, кото́рый чита́ет газе́ту…"],
            ["Дом, постро́енный в 1900 году́…", "Дом, кото́рый постро́или в 1900 году́…"],
            ["Прочита́в письмо́, он замолча́л.", "Он прочита́л письмо́ и замолча́л."],
            ["Не зна́я а́дреса, я не пришёл.", "Я не знал а́дреса, поэ́тому не пришёл."],
          ],
        },
        {
          kind: "prose",
          title: "La méthode de transformation",
          body: [
            "Pour transformer un participe en relative : trouver le nom qualifié, le reprendre par кото́рый au cas voulu, et conjuguer le verbe au temps que le participe indiquait. Le participe présent donne un présent, le passé un passé.",
            "Dans l'autre sens, la relative ne devient un participe que si кото́рый y est SUJET (pour un participe actif) ou OBJET (pour un participe passif). Une relative où кото́рый est au datif ou après une préposition ne se comprime pas : кни́га, о кото́рой мы говори́ли ne peut pas devenir un participe.",
          ],
        },
        {
          kind: "examples",
          title: "Là où on les rencontre vraiment",
          items: [
            { ru: "Пассажи́ры, ожида́ющие ре́йса, прохо́дят к вы́ходу но́мер пять.", fr: "Les passagers en attente de leur vol sont priés de gagner la porte cinq.", note: "annonce d'aéroport : participe actif présent" },
            { ru: "Зако́н, при́нятый в про́шлом году́, вступа́ет в си́лу.", fr: "La loi adoptée l'an dernier entre en vigueur.", note: "presse : participe passif passé" },
            { ru: "Не зна́я, что отве́тить, он промолча́л.", fr: "Ne sachant que répondre, il garda le silence.", note: "récit écrit : gérondif" },
            { ru: "Он не знал, что отве́тить, и промолча́л.", fr: "Il ne savait pas quoi répondre, alors il s'est tu.", note: "la même phrase, telle qu'elle se dit" },
            { ru: "А тот, кото́рый вчера́ звони́л, опя́ть звони́л.", fr: "Et celui qui a appelé hier a rappelé.", note: "conversation : кото́рый, jamais un participe" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Participes et gérondifs = registre écrit.",
            "À l'oral : кото́рый, ou deux propositions avec и.",
            "Reconnaître d'abord, produire ensuite.",
            "Seules les relatives où кото́рый est sujet ou objet se compriment.",
          ],
        },
      ],
      practice: [{ href: "/participles/subject", label: "Exercice : transformer une relative" }],
    },
  ],
};
