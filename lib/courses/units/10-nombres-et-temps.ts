import type { Unit } from "../types";

/**
 * Unité 10 — compter, dater, dire l'heure et mesurer la durée. Le point
 * délicat n'est pas le nombre lui-même : c'est le cas qu'il impose au nom.
 */
export const UNIT_NOMBRES: Unit = {
  slug: "nombres-et-temps",
  title: "Nombres, quantité et temps",
  titleRu: "Числительные и время",
  subtitle:
    "Compter et faire accorder, dire l'heure et la date, exprimer l'âge, la durée et la fréquence.",
  color: "#B5762A",
  lessons: [
    {
      slug: "nombres-cardinaux",
      title: "Les nombres cardinaux",
      titleRu: "Количественные числительные",
      level: "A1",
      minutes: 8,
      summary:
        "De un à un milliard : la liste, ses trois irrégularités, et le seul nombre qui s'accorde en genre.",
      keywords: ["nombres", "числительные", "один", "два", "сорок", "compter"],
      sections: [
        {
          kind: "table",
          title: "Les nombres de base",
          head: ["Chiffre", "Russe", "Chiffre", "Russe"],
          rows: [
            ["1", "оди́н / одна́ / одно́", "20", "два́дцать"],
            ["2", "два / две", "30", "три́дцать"],
            ["3", "три", "40", "со́рок"],
            ["4", "четы́ре", "50", "пятьдеся́т"],
            ["5", "пять", "60", "шестьдеся́т"],
            ["6", "шесть", "70", "се́мьдесят"],
            ["7", "семь", "80", "во́семьдесят"],
            ["8", "во́семь", "90", "девяно́сто"],
            ["9", "де́вять", "100", "сто"],
            ["10", "де́сять", "200", "две́сти"],
            ["11", "оди́ннадцать", "500", "пятьсо́т"],
            ["12", "двена́дцать", "1000", "ты́сяча"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Les nombres de 11 à 19 se lisent comme « un sur dix » soudé : оди́ннадцать = оди́н + на + де́сять. L'accent y tombe toujours sur la syllabe du chiffre, jamais sur -надцать.",
            "Trois nombres refusent le modèle : со́рок (40), девяно́сто (90) et сто (100) n'ont que deux formes en tout — la forme de base et une forme oblique unique (сорока́, девяно́ста, ста), employée à tous les cas obliques.",
          ],
        },
        {
          kind: "prose",
          title: "Оди́н et два s'accordent",
          body: [
            "Оди́н est le seul nombre à s'accorder complètement : оди́н дом, одна́ кни́га, одно́ окно́, одни́ очки́. Il se décline aussi comme un adjectif.",
            "Два a deux formes : два pour le masculin et le neutre, две pour le féminin. два до́ма, две кни́ги. Tous les autres nombres sont invariables en genre.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Мне ну́жен оди́н биле́т.", fr: "Il me faut un billet." },
            { ru: "У меня́ две сестры́.", fr: "J'ai deux sœurs." },
            { ru: "В гру́ппе два́дцать пять студе́нтов.", fr: "Il y a vingt-cinq étudiants dans le groupe." },
            { ru: "Э́то сто́ит ты́сячу рубле́й.", fr: "Ça coûte mille roubles.", note: "ты́сяча se décline comme un nom féminin" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "11 à 19 : chiffre + -надцать, accent sur le chiffre.",
            "оди́н s'accorde en genre, en nombre et en cas.",
            "два / две : seule opposition de genre parmi les autres nombres.",
            "со́рок, девяно́сто, сто : une seule forme oblique.",
          ],
        },
      ],
      practice: [{ href: "/numbers", label: "Les nombres en exercices" }],
    },
    {
      slug: "accord-apres-les-nombres",
      title: "Le nom après un nombre",
      titleRu: "Согласование после числительных",
      level: "A2",
      minutes: 10,
      summary:
        "La règle la plus déroutante du russe : après 2, 3, 4, le nom se met au génitif SINGULIER, et après 5, au génitif pluriel.",
      keywords: ["accord", "génitif", "два часа", "пять часов", "числительные", "règle"],
      sections: [
        {
          kind: "prose",
          body: [
            "Compter en russe demande de choisir le cas du nom compté, et ce cas dépend du dernier chiffre du nombre. Trois zones, et une exception qui couvre les adolescents 11 à 14.",
            "La règle vient d'un ancien duel : deux, trois et quatre objets ne formaient pas un pluriel mais un couple. La forme héritée est aujourd'hui identique au génitif singulier, d'où l'impression d'illogisme.",
          ],
        },
        {
          kind: "table",
          title: "Les trois zones",
          head: ["Dernier chiffre", "Cas du nom", "Exemple"],
          rows: [
            ["1 (sauf 11)", "nominatif singulier", "два́дцать оди́н год"],
            ["2, 3, 4 (sauf 12-14)", "génitif singulier", "два́дцать два го́да"],
            ["5-20, 0", "génitif pluriel", "два́дцать пять лет"],
            ["11, 12, 13, 14", "génitif pluriel", "оди́ннадцать лет"],
          ],
          note: "Год fait ans au génitif pluriel : лет, emprunté à ле́то. Un an = год, deux ans = го́да, cinq ans = лет.",
        },
        {
          kind: "prose",
          title: "L'adjectif suit-il ?",
          body: [
            "Quand le nom est au génitif singulier (après 2, 3, 4), l'adjectif qui l'accompagne se met au génitif PLURIEL : два больши́х до́ма, три но́вые кни́ги. Au féminin, le nominatif pluriel est également admis : три но́вых кни́ги et три но́вые кни́ги coexistent.",
            "C'est une des rares zones où la norme russe elle-même hésite ; les deux formes s'entendent.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "У меня́ оди́н брат.", fr: "J'ai un frère." },
            { ru: "У меня́ два бра́та.", fr: "J'ai deux frères.", note: "génitif singulier" },
            { ru: "У меня́ пять бра́тьев.", fr: "J'ai cinq frères.", note: "génitif pluriel" },
            { ru: "Прошло́ два́дцать оди́н год.", fr: "Vingt et un ans ont passé.", note: "se termine par 1 : nominatif singulier" },
            { ru: "Э́то сто́ит три́ста рубле́й.", fr: "Cela coûte trois cents roubles." },
          ],
        },
        {
          kind: "pitfall",
          title: "L'accord du verbe",
          body: [
            "Avec un sujet numérique, le verbe se met au singulier neutre au passé quand on constate une quantité : Пришло́ пять челове́к. Au pluriel quand les personnes agissent individuellement : Пять челове́к пришли́ ра́но.",
            "Avec оди́н, le verbe est toujours au singulier accordé : Пришёл оди́н челове́к.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "1 → nominatif singulier ; 2-4 → génitif singulier ; 5+ → génitif pluriel.",
            "11 à 14 suivent la règle de 5, malgré leur dernier chiffre.",
            "C'est le DERNIER chiffre qui commande : 21 год, 22 го́да, 25 лет.",
            "год / го́да / лет : la série la plus employée.",
          ],
        },
      ],
      practice: [{ href: "/numbers/agreement", label: "Exercice : l'accord après un nombre" }],
    },
    {
      slug: "declinaison-des-nombres",
      title: "Décliner les nombres",
      titleRu: "Склонение числительных",
      level: "B2",
      minutes: 9,
      summary:
        "Dès qu'une préposition ou un verbe impose un cas, le nombre se décline aussi — et le nom compté s'aligne sur lui.",
      keywords: ["déclinaison", "двумя", "пяти", "числительные", "склонение", "obliques"],
      sections: [
        {
          kind: "prose",
          body: [
            "Au nominatif et à l'accusatif, le nombre commande le cas du nom (la règle précédente). Dans TOUS les autres cas, la hiérarchie s'inverse : le nombre et le nom prennent tous deux le cas exigé par la phrase, et le nom se met au pluriel.",
            "с двумя́ друзья́ми (avec deux amis), о пяти́ студе́нтах (à propos de cinq étudiants), к трём часа́м (vers trois heures).",
          ],
        },
        {
          kind: "table",
          title: "Les formes obliques les plus utiles",
          head: ["Nombre", "Génitif", "Datif", "Instrumental", "Prépositionnel"],
          rows: [
            ["два", "двух", "двум", "двумя́", "о двух"],
            ["три", "трёх", "трём", "тремя́", "о трёх"],
            ["четы́ре", "четырёх", "четырём", "четырьмя́", "о четырёх"],
            ["пять", "пяти́", "пяти́", "пятью́", "о пяти́"],
            ["со́рок", "сорока́", "сорока́", "сорока́", "о сорока́"],
            ["сто", "ста", "ста", "ста", "о ста"],
          ],
          note: "Les nombres en -ь (пять à два́дцать, три́дцать) se déclinent comme le nom ночь.",
        },
        {
          kind: "prose",
          title: "Les nombres composés",
          body: [
            "Dans un nombre composé, TOUS les éléments se déclinent : с двумя́ ты́сячами тремяста́ми пятью́десятью рубля́ми. C'est correct, et parfaitement imprononçable.",
            "Aussi les Russes eux-mêmes contournent-ils : à l'oral, on reformule pour éviter le cas oblique, et à l'écrit administratif, on écrit le nombre en chiffres. Un apprenant peut faire de même sans complexe.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он пришёл с двумя́ друзья́ми.", fr: "Il est venu avec deux amis." },
            { ru: "Мы говори́ли о пяти́ вариа́нтах.", fr: "Nous avons parlé de cinq options." },
            { ru: "Э́то в двух шага́х отсю́да.", fr: "C'est à deux pas d'ici." },
            { ru: "Он верну́лся к трём часа́м.", fr: "Il est rentré vers trois heures." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Nominatif / accusatif : le nombre commande le cas du nom.",
            "Autres cas : nombre et nom prennent le cas de la phrase, nom au pluriel.",
            "Les nombres en -ь se déclinent comme ночь.",
            "Dans un composé, chaque élément se décline — d'où les contournements.",
          ],
        },
      ],
      practice: [{ href: "/numbers/agreement", label: "Exercice : l'accord après un nombre" }],
    },
    {
      slug: "nombres-ordinaux",
      title: "Les nombres ordinaux",
      titleRu: "Порядковые числительные",
      level: "A2",
      minutes: 7,
      summary:
        "Premier, deuxième, troisième : ce sont des adjectifs ordinaires, sauf тре́тий qui a sa propre déclinaison.",
      keywords: ["ordinal", "порядковые", "первый", "третий", "adjectif", "étage"],
      sections: [
        {
          kind: "table",
          title: "Les ordinaux",
          head: ["Rang", "Russe", "Rang", "Russe"],
          rows: [
            ["1ᵉʳ", "пе́рвый", "8ᵉ", "восьмо́й"],
            ["2ᵉ", "второ́й", "9ᵉ", "девя́тый"],
            ["3ᵉ", "тре́тий", "10ᵉ", "деся́тый"],
            ["4ᵉ", "четвёртый", "20ᵉ", "двадца́тый"],
            ["5ᵉ", "пя́тый", "40ᵉ", "сороково́й"],
            ["6ᵉ", "шесто́й", "100ᵉ", "со́тый"],
            ["7ᵉ", "седьмо́й", "1000ᵉ", "ты́сячный"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Les ordinaux sont des adjectifs à part entière : ils s'accordent en genre, en nombre et en cas. пе́рвый эта́ж, пе́рвая страни́ца, на пе́рвом этаже́.",
            "Dans un nombre composé, seul le DERNIER élément prend la forme ordinale : два́дцать пе́рвый (vingt et unième), ты́сяча девятьсо́т во́семьдесят пя́тый год.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я живу́ на тре́тьем этаже́.", fr: "J'habite au troisième étage.", note: "тре́тий a une déclinaison spéciale : тре́тьего, тре́тьему" },
            { ru: "Э́то во второ́м то́ме.", fr: "C'est dans le deuxième volume." },
            { ru: "Он за́нял пе́рвое ме́сто.", fr: "Il a pris la première place." },
            { ru: "Откро́йте кни́гу на двадца́той страни́це.", fr: "Ouvrez le livre à la page vingt." },
          ],
        },
        {
          kind: "pitfall",
          title: "L'étage russe",
          body: [
            "Le russe compte les étages à l'américaine : пе́рвый эта́ж est le rez-de-chaussée français, второ́й эта́ж le premier étage. Une adresse mal comprise fait sonner à la mauvaise porte.",
            "De même, les siècles se comptent avec un décalage apparent : XIX век (девятна́дцатый век) correspond aux années 1800.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Les ordinaux sont des adjectifs et s'accordent entièrement.",
            "Seul le dernier élément d'un composé devient ordinal.",
            "тре́тий suit une déclinaison à part (тре́тья, тре́тье, тре́тьего).",
            "пе́рвый эта́ж = rez-de-chaussée.",
          ],
        },
      ],
      practice: [{ href: "/numbers/date", label: "Exercice : les dates" }],
    },
    {
      slug: "dire-l-heure",
      title: "Dire l'heure",
      titleRu: "Который час",
      level: "A2",
      minutes: 9,
      summary:
        "Le russe compte l'heure en cours, pas l'heure écoulée : « la moitié de la cinquième » veut dire quatre heures et demie.",
      keywords: ["heure", "который час", "половина", "без", "время", "часы"],
      sections: [
        {
          kind: "prose",
          body: [
            "Pour les heures pleines, c'est simple : час (une heure), два часа́, пять часо́в — la règle d'accord des nombres s'applique. Pour situer, on emploie в + accusatif : в два часа́.",
            "Au-delà, le russe familier a une logique propre : il compte à l'intérieur de l'heure EN COURS. полови́на пя́того se traduit « quatre heures et demie » — littéralement « la moitié de la cinquième heure ».",
          ],
        },
        {
          kind: "table",
          title: "Les formes courantes",
          head: ["Heure", "Russe familier", "Littéralement"],
          rows: [
            ["3 h 00", "три часа́", "trois heures"],
            ["3 h 15", "че́тверть четвёртого", "un quart de la quatrième"],
            ["3 h 30", "полови́на четвёртого", "la moitié de la quatrième"],
            ["3 h 40", "без двадцати́ четы́ре", "quatre moins vingt"],
            ["3 h 45", "без че́тверти четы́ре", "quatre moins le quart"],
            ["15 h 20", "два́дцать мину́т четвёртого", "vingt minutes de la quatrième"],
          ],
          note: "À partir de la demie, on bascule sur без + génitif : le compte se fait par soustraction de l'heure suivante.",
        },
        {
          kind: "prose",
          title: "L'heure officielle",
          body: [
            "Dans les horaires, les gares et l'administration, on emploie le système à 24 heures, dit chiffre par chiffre : пятна́дцать три́дцать (15 h 30). Aucun calcul, aucune ambiguïté.",
            "C'est la forme à utiliser dès qu'il s'agit d'un rendez-vous précis. Le système familier reste réservé à la conversation.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Кото́рый час?", fr: "Quelle heure est-il ?" },
            { ru: "Ско́лько вре́мени?", fr: "Quelle heure est-il ?", note: "plus familier, tout aussi courant" },
            { ru: "Сейча́с полови́на восьмо́го.", fr: "Il est sept heures et demie." },
            { ru: "Дава́й встре́тимся в полови́не восьмо́го.", fr: "Retrouvons-nous à sept heures et demie.", note: "в + prépositionnel avec полови́на" },
            { ru: "По́езд отправля́ется в 18:45.", fr: "Le train part à 18 h 45." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "час, два часа́, пять часо́в : la règle d'accord vaut aussi ici.",
            "Avant la demie : minutes + ordinal de l'heure EN COURS.",
            "Après la demie : без + minutes + heure suivante.",
            "Horaires officiels : système à 24 heures, lu chiffre par chiffre.",
          ],
        },
      ],
      practice: [{ href: "/numbers/time", label: "Exercice : dire l'heure" }],
    },
    {
      slug: "dates-et-jours",
      title: "Les dates et les jours",
      titleRu: "Дата и дни недели",
      level: "A2",
      minutes: 9,
      summary:
        "Nommer une date et situer un événement demandent deux cas différents : nominatif pour dire, génitif pour situer.",
      keywords: ["date", "число", "месяц", "дни недели", "год", "janvier"],
      sections: [
        {
          kind: "table",
          title: "Les jours et les mois",
          head: ["Jour", "Russe", "Mois", "Russe"],
          rows: [
            ["lundi", "понеде́льник", "janvier", "янва́рь"],
            ["mardi", "вто́рник", "février", "февра́ль"],
            ["mercredi", "среда́", "mars", "март"],
            ["jeudi", "четве́рг", "avril", "апре́ль"],
            ["vendredi", "пя́тница", "mai", "май"],
            ["samedi", "суббо́та", "juin", "ию́нь"],
            ["dimanche", "воскресе́нье", "juillet", "ию́ль"],
          ],
          note: "Jours et mois s'écrivent sans majuscule. Les autres mois : а́вгуст, сентя́брь, октя́брь, ноя́брь, дека́брь.",
        },
        {
          kind: "prose",
          title: "Dire la date, situer la date",
          body: [
            "Pour ANNONCER la date, on emploie l'ordinal au nominatif neutre (sous-entendu число́, « le nombre ») suivi du mois au génitif : Сего́дня пе́рвое ма́я.",
            "Pour SITUER un événement, le même ordinal passe au génitif : Он прие́дет пе́рвого ма́я. Aucune préposition — le génitif seul répond à la question когда́.",
          ],
        },
        {
          kind: "table",
          title: "Situer dans le temps",
          head: ["Durée", "Construction", "Exemple"],
          rows: [
            ["un jour de la semaine", "в + accusatif", "в понеде́льник"],
            ["une date", "génitif seul", "пя́того ма́я"],
            ["un mois", "в + prépositionnel", "в ма́е"],
            ["une année", "в + prépositionnel + году́", "в 2026 году́"],
            ["une saison", "instrumental seul", "ле́том, зимо́й"],
            ["un siècle", "в + prépositionnel + ве́ке", "в двадца́том ве́ке"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Како́е сего́дня число́?", fr: "Quelle est la date aujourd'hui ?" },
            { ru: "Сего́дня двадца́тое ма́рта.", fr: "Aujourd'hui, nous sommes le 20 mars." },
            { ru: "Он роди́лся двадца́того ма́рта.", fr: "Il est né le 20 mars." },
            { ru: "В сле́дующем году́ мы пое́дем в Росси́ю.", fr: "L'an prochain, nous irons en Russie." },
            { ru: "Ле́том здесь о́чень жа́рко.", fr: "En été, il fait très chaud ici." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Jours et mois : minuscule.",
            "Annoncer : ordinal neutre nominatif + mois au génitif.",
            "Situer : ordinal au génitif, sans préposition.",
            "Saisons à l'instrumental : ле́том, о́сенью, зимо́й, весно́й.",
          ],
        },
      ],
      practice: [{ href: "/numbers/date", label: "Exercice : les dates" }],
    },
    {
      slug: "age-et-duree",
      title: "L'âge et la durée",
      titleRu: "Возраст и продолжительность",
      level: "A2",
      minutes: 9,
      summary:
        "L'âge passe par le datif, et la durée se dit de quatre façons : combien de temps, en combien de temps, dans combien de temps, pour combien de temps.",
      keywords: ["âge", "лет", "durée", "за", "через", "на", "сколько времени"],
      sections: [
        {
          kind: "prose",
          body: [
            "L'âge se dit avec la personne au datif : Мне два́дцать лет — littéralement « à moi, vingt ans ». Le verbe être disparaît au présent et revient au passé : Мне бы́ло два́дцать лет.",
            "год suit la règle des nombres : оди́н год, два го́да, пять лет. С днём рожде́ния ! (bon anniversaire) est du même registre : « avec le jour de naissance ».",
          ],
        },
        {
          kind: "table",
          title: "Quatre questions de durée",
          head: ["Question", "Construction", "Exemple", "Sens"],
          rows: [
            ["Combien de temps ?", "accusatif seul", "Я чита́л два часа́.", "durée occupée"],
            ["En combien de temps ?", "за + accusatif", "Я прочита́л за два часа́.", "délai jusqu'au résultat"],
            ["Dans combien de temps ?", "че́рез + accusatif", "Он придёт че́рез час.", "à partir de maintenant"],
            ["Pour combien de temps ?", "на + accusatif", "Он прие́хал на неде́лю.", "durée prévue du séjour"],
          ],
          note: "за va avec un perfectif, la durée simple avec un imperfectif : c'est l'aspect qui suit, pas l'inverse.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Ско́лько тебе́ лет?", fr: "Quel âge as-tu ?" },
            { ru: "Ей три́дцать оди́н год.", fr: "Elle a trente et un ans." },
            { ru: "Я жил там три го́да.", fr: "J'y ai vécu trois ans." },
            { ru: "Он сде́лал э́то за пять мину́т.", fr: "Il l'a fait en cinq minutes." },
            { ru: "Мы уезжа́ем на два дня.", fr: "Nous partons pour deux jours." },
            { ru: "Позвони́ мне че́рез час.", fr: "Appelle-moi dans une heure." },
          ],
        },
        {
          kind: "pitfall",
          title: "На неде́лю ou неде́лю ?",
          body: [
            "Он был здесь неде́лю = il est resté une semaine (durée effective). Он прие́хал на неде́лю = il est venu pour une semaine (durée prévue du séjour à venir).",
            "На s'emploie avec les verbes qui marquent un déplacement ou un prêt, où la durée concerne l'état résultant : Я взял кни́гу на неде́лю (j'ai emprunté le livre pour une semaine).",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Âge : datif + nombre + год / го́да / лет.",
            "Durée occupée : accusatif seul, avec un imperfectif.",
            "за + accusatif : le temps qu'il a fallu pour aboutir.",
            "че́рез = dans (à venir) ; на = pour (durée prévue).",
          ],
        },
      ],
      practice: [
        { href: "/numbers/age", label: "Exercice : l'âge" },
        { href: "/numbers/duration", label: "Exercice : durée et délai" },
      ],
    },
    {
      slug: "numeraux-collectifs-et-fractions",
      title: "Collectifs, fractions et approximations",
      titleRu: "Собирательные числительные и дроби",
      level: "B2",
      minutes: 8,
      summary:
        "Дво́е, о́ба, полтора́, полови́на : les autres façons de compter, dont une réservée aux groupes de personnes.",
      keywords: ["двое", "оба", "половина", "полтора", "собирательные", "fraction"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les numéraux collectifs дво́е, тро́е, че́тверо, пя́теро comptent des groupes de personnes, surtout des hommes ou des groupes mixtes, et des mots qui n'ont pas de singulier. Ils sont suivis du génitif pluriel : дво́е дете́й, тро́е студе́нтов, че́тверо су́ток.",
            "Ils ne s'emploient jamais pour des femmes seules (on dit две же́нщины) ni pour des objets ordinaires (deux tables reste два стола́).",
          ],
        },
        {
          kind: "table",
          title: "Les autres façons de compter",
          head: ["Forme", "Sens", "Construction", "Exemple"],
          rows: [
            ["о́ба / о́бе", "les deux", "+ génitif singulier", "о́ба бра́та, о́бе сестры́"],
            ["полови́на", "la moitié", "+ génitif", "полови́на гру́ппы"],
            ["треть, че́тверть", "un tiers, un quart", "+ génitif", "треть населе́ния"],
            ["полтора́ / полторы́", "un et demi", "+ génitif singulier", "полтора́ часа́, полторы́ неде́ли"],
            ["полтора́ста", "cent cinquante", "+ génitif pluriel", "полтора́ста лет"],
          ],
        },
        {
          kind: "prose",
          title: "Compter à peu près",
          body: [
            "Pour dire « environ », le russe dispose de trois moyens. О́коло + génitif : о́коло двадцати́ челове́к. При́мерно ou приблизи́тельно devant le nombre : при́мерно два́дцать челове́к. Ou, plus élégant, l'INVERSION du nombre et du nom : челове́к два́дцать — « une vingtaine de personnes ».",
            "Cette inversion est très courante à l'oral et parfaitement idiomatique : мину́т пять (cinq minutes environ), рубле́й три́ста.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "У них тро́е дете́й.", fr: "Ils ont trois enfants." },
            { ru: "О́ба студе́нта сда́ли экза́мен.", fr: "Les deux étudiants ont réussi l'examen." },
            { ru: "Я жду уже́ полтора́ часа́.", fr: "J'attends depuis une heure et demie." },
            { ru: "Там бы́ло челове́к со́рок.", fr: "Il y avait une quarantaine de personnes.", note: "inversion : approximation" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "дво́е, тро́е + génitif pluriel : groupes de personnes, pluriels sans singulier.",
            "о́ба (m./n.) et о́бе (f.) : « les deux ».",
            "полтора́ / полторы́ + génitif singulier.",
            "Inverser nombre et nom = « environ » : мину́т пять.",
          ],
        },
      ],
      practice: [{ href: "/numbers", label: "Les nombres en exercices" }],
    },
    {
      slug: "expressions-de-quantite",
      title: "Beaucoup, peu, combien",
      titleRu: "Слова количества",
      level: "A2",
      minutes: 7,
      summary:
        "Мно́го, ма́ло, не́сколько, ско́лько : tous suivis du génitif, et tous porteurs d'un accord de verbe particulier.",
      keywords: ["много", "мало", "несколько", "сколько", "quantité", "génitif"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les mots de quantité fonctionnent comme des nombres : ils imposent le génitif au nom qui suit. Le choix entre génitif singulier et pluriel dépend du nom : dénombrable au pluriel (мно́го книг), indénombrable au singulier (мно́го воды́).",
          ],
        },
        {
          kind: "table",
          title: "Les principaux",
          head: ["Mot", "Sens", "Exemple"],
          rows: [
            ["мно́го", "beaucoup", "мно́го рабо́ты"],
            ["ма́ло", "peu", "ма́ло вре́мени"],
            ["немно́го", "un peu", "немно́го са́хара"],
            ["не́сколько", "quelques", "не́сколько дней"],
            ["ско́лько", "combien", "Ско́лько э́то сто́ит?"],
            ["сто́лько", "tant, autant", "сто́лько люде́й!"],
            ["большинство́", "la plupart", "большинство́ студе́нтов"],
            ["па́ра", "une paire, deux-trois", "па́ра мину́т"],
          ],
        },
        {
          kind: "prose",
          title: "L'accord du verbe",
          body: [
            "Avec мно́го, ма́ло, не́сколько, le verbe passé se met au singulier neutre : Пришло́ мно́го люде́й. C'est la forme neutre par défaut, celle des constructions impersonnelles.",
            "Avec большинство́ et une majorité de personnes agissantes, le pluriel est fréquent : Большинство́ студе́нтов сда́ли экза́мен. La norme accepte les deux ; le pluriel humanise.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "У меня́ мно́го рабо́ты.", fr: "J'ai beaucoup de travail." },
            { ru: "Оста́лось ма́ло вре́мени.", fr: "Il reste peu de temps." },
            { ru: "Я был там не́сколько раз.", fr: "J'y suis allé plusieurs fois." },
            { ru: "Ско́лько сто́ит биле́т?", fr: "Combien coûte le billet ?" },
            { ru: "Да́йте, пожа́луйста, немно́го воды́.", fr: "Donnez-moi un peu d'eau, s'il vous plaît." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Tous ces mots imposent le génitif.",
            "Dénombrable → génitif pluriel ; indénombrable → génitif singulier.",
            "Verbe au singulier neutre au passé : Пришло́ мно́го люде́й.",
            "мно́го + génitif, mais о́чень devant un adjectif ou un adverbe.",
          ],
        },
      ],
      practice: [{ href: "/cases/genitive", label: "Exercice : le génitif" }],
    },
  ],
};
