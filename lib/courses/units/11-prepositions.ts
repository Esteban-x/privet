import type { Unit } from "../types";

/**
 * Unité 11 — les prépositions et le cas qu'elles imposent, plus le régime
 * des verbes : tout ce qui décide d'une terminaison sans que la fonction du
 * mot y soit pour quelque chose.
 */
export const UNIT_PREPOSITIONS: Unit = {
  slug: "prepositions",
  title: "Les prépositions",
  titleRu: "Предлоги",
  subtitle:
    "Quelle préposition, quel cas, et pourquoi : le lieu, le temps, la cause, et le régime des verbes.",
  color: "#1C6E5C",
  lessons: [
    {
      slug: "prepositions-par-cas",
      title: "Les prépositions, cas par cas",
      titleRu: "Предлоги и падежи",
      level: "A2",
      minutes: 9,
      summary:
        "Chaque préposition régit un cas — parfois deux, et la différence est alors toujours porteuse de sens.",
      keywords: ["prépositions", "предлоги", "cas", "régime", "tableau"],
      sections: [
        {
          kind: "prose",
          body: [
            "Une préposition russe ne se retient jamais seule : elle se retient avec son cas, comme un verbe français se retient avec sa préposition. « из » n'existe pas dans l'abstrait ; ce qui existe, c'est « из + génitif ».",
            "Quatre prépositions en régissent deux, et le choix change alors le sens : в et на opposent la direction à la position, за et под opposent le mouvement au lieu, с oppose l'accompagnement à l'origine.",
          ],
        },
        {
          kind: "table",
          title: "Les principales, par cas",
          head: ["Cas", "Prépositions", "Idée commune"],
          rows: [
            [
              "Génitif",
              "из, с, от, до, для, без, о́коло, по́сле, кро́ме, про́тив, у, ми́мо, вокру́г",
              "l'éloignement, l'absence, l'origine",
            ],
            ["Datif", "к, по", "la direction vers quelqu'un, la surface parcourue"],
            [
              "Accusatif",
              "в, на, за, под, че́рез, про, сквозь",
              "le mouvement, la traversée, la cible",
            ],
            [
              "Instrumental",
              "с, над, под, пе́ред, за, ме́жду, ря́дом с",
              "l'accompagnement, la position relative",
            ],
            ["Prépositionnel", "в, на, о, при", "le lieu où l'on est, le sujet dont on parle"],
          ],
        },
        {
          kind: "prose",
          title: "Les formes allongées",
          body: [
            "Certaines prépositions s'allongent devant un groupe de consonnes difficile : в → во (во Фра́нции), с → со (со мной), к → ко (ко мне), о → об / обо (об э́том, обо мне), из → изо (изо все́х сил).",
            "Ce n'est pas facultatif, et cela ne s'entend pas toujours à l'oral rapide ; il faut y penser en écrivant.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Une préposition s'apprend avec son cas, toujours.",
            "в, на, за, под, с en régissent deux, avec une différence de sens.",
            "Génitif : l'éloignement et l'absence. Instrumental : la position et l'accompagnement.",
            "во, со, ко, об : allongements obligatoires devant certains groupes.",
          ],
        },
      ],
      practice: [{ href: "/cases", label: "Les six cas en exercices" }],
    },
    {
      slug: "v-ou-na",
      title: "В ou на : le choix du lieu",
      titleRu: "В или на",
      level: "A2",
      minutes: 9,
      summary:
        "« Dans » et « sur » ne suffisent pas à prédire : le russe emploie на avec les activités, les surfaces et une liste de lieux à apprendre.",
      keywords: ["в", "на", "lieu", "работа", "почта", "Украина", "liste"],
      sections: [
        {
          kind: "prose",
          body: [
            "L'opposition de départ est spatiale : в pour ce qui contient, на pour ce qui porte. в я́щике (dans le tiroir), на столе́ (sur la table).",
            "Elle s'étend ensuite à des emplois où la logique physique n'aide plus : на s'impose pour les ACTIVITÉS et les ÉVÉNEMENTS (на уро́ке, на рабо́те, на конце́рте), pour les ESPACES OUVERTS (на у́лице, на пло́щади), et pour une série de lieux qui s'apprend par cœur.",
          ],
        },
        {
          kind: "table",
          title: "La liste des на",
          head: ["Lieu", "Français", "Lieu", "Français"],
          rows: [
            ["на рабо́те", "au travail", "на вокза́ле", "à la gare"],
            ["на уро́ке", "en cours", "на ста́нции", "à la station"],
            ["на заво́де", "à l'usine", "на по́чте", "à la poste"],
            ["на факульте́те", "à la faculté", "на ры́нке", "au marché"],
            ["на конце́рте", "au concert", "на ку́хне", "à la cuisine"],
            ["на у́лице", "dans la rue", "на се́вере", "au nord"],
          ],
          note: "Tout ce qui n'est pas dans cette famille prend в : в шко́ле, в университе́те, в теа́тре, в магази́не, в го́роде.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Он сейча́с на рабо́те.", fr: "Il est au travail en ce moment." },
            { ru: "Она́ у́чится в университе́те.", fr: "Elle étudie à l'université." },
            { ru: "Дава́й встре́тимся на вокза́ле.", fr: "Retrouvons-nous à la gare." },
            { ru: "Мы бы́ли на интере́сной ле́кции.", fr: "Nous étions à une conférence intéressante." },
            { ru: "Де́ти игра́ют на у́лице.", fr: "Les enfants jouent dehors." },
          ],
        },
        {
          kind: "pitfall",
          title: "L'origine doit répondre au lieu",
          body: [
            "La préposition de départ dépend de celle d'arrivée : ce qui se rejoint avec в se quitte avec из, ce qui se rejoint avec на se quitte avec с. Он на по́чте → Он идёт с по́чты, jamais из по́чты.",
            "L'erreur est fréquente et immédiatement audible. Le réflexe à installer : mémoriser le trio complet (в шко́ле / в шко́лу / из шко́лы) plutôt que la préposition isolée.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "в : espaces clos, villes, pays, institutions.",
            "на : activités, événements, surfaces ouvertes, plus une liste fermée.",
            "в ↔ из, на ↔ с : les paires ne se croisent pas.",
            "Apprendre le trio position / direction / origine d'un coup.",
          ],
        },
      ],
    },
    {
      slug: "mouvement-et-position",
      title: "Mouvement et position",
      titleRu: "Движение и местонахождение",
      level: "A2",
      minutes: 8,
      summary:
        "Une même préposition, deux cas : с accusatif on y va, avec le prépositionnel on y est. Le russe ne confond jamais les deux.",
      keywords: ["где", "куда", "accusatif", "prépositionnel", "direction", "position"],
      sections: [
        {
          kind: "table",
          title: "Le système en trois colonnes",
          head: ["Question", "Sens", "Construction", "Exemple"],
          rows: [
            ["где?", "où l'on est", "в / на + prépositionnel", "Я в шко́ле."],
            ["куда́?", "où l'on va", "в / на + accusatif", "Я иду́ в шко́лу."],
            ["отку́да?", "d'où l'on vient", "из / с + génitif", "Я иду́ из шко́лы."],
          ],
        },
        {
          kind: "prose",
          body: [
            "Ce triplet vaut pour tous les verbes, pas seulement ceux de mouvement. Класть (poser) demande la direction : Он кладёт кни́гу на стол. Лежа́ть (être posé) demande la position : Кни́га лежи́т на столе́.",
            "C'est pour la même raison que за et под régissent l'accusatif avec un mouvement (Он поста́вил су́мку под стол) et l'instrumental avec une position (Су́мка стои́т под столо́м).",
          ],
        },
        {
          kind: "examples",
          title: "Les paires de verbes",
          items: [
            { ru: "Положи́ кни́гу на стол.", fr: "Pose le livre sur la table.", note: "direction : accusatif" },
            { ru: "Кни́га лежи́т на столе́.", fr: "Le livre est sur la table.", note: "position : prépositionnel" },
            { ru: "Пове́сь ку́ртку в шкаф.", fr: "Suspends la veste dans l'armoire." },
            { ru: "Ку́ртка виси́т в шкафу́.", fr: "La veste est suspendue dans l'armoire.", note: "в шкафу́ : prépositionnel en -у́, forme spéciale" },
          ],
        },
        {
          kind: "prose",
          title: "Le prépositionnel en -у́",
          body: [
            "Une trentaine de noms masculins ont un prépositionnel spécial en -у́ accentué après в et на : в лесу́, в саду́, на полу́, в шкафу́, на берегу́, в углу́, в аэропорту́, на мосту́.",
            "Ce n'est pas une faute d'accent : c'est un cas hérité, le « locatif », qui n'a survécu que sur ces mots et seulement avec в et на. Avec о, ils reprennent la forme normale : о ле́се.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "где → prépositionnel, куда́ → accusatif, отку́да → génitif.",
            "Le triplet vaut aussi pour класть / лежа́ть, ста́вить / стоя́ть.",
            "за et под : accusatif en mouvement, instrumental en position.",
            "Une trentaine de masculins ont un locatif en -у́ : в лесу́, на полу́.",
          ],
        },
      ],
    },
    {
      slug: "k-u-ot",
      title: "К, у, от : les personnes",
      titleRu: "К, у, от",
      level: "A2",
      minutes: 7,
      summary:
        "On ne va pas « dans » quelqu'un : avec les personnes, le russe emploie un triplet à part.",
      keywords: ["к", "у", "от", "chez", "personnes", "врач"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le français dit « chez le médecin » dans les trois cas : y aller, y être, en revenir. Le russe emploie trois prépositions différentes, et jamais в ni на, qui sont réservés aux lieux.",
            "к + datif pour aller vers, у + génitif pour être chez, от + génitif pour revenir de chez.",
          ],
        },
        {
          kind: "table",
          title: "Le triplet des personnes",
          head: ["Question", "Préposition", "Cas", "Exemple"],
          rows: [
            ["куда́?", "к", "datif", "Я иду́ к врачу́."],
            ["где?", "у", "génitif", "Я у врача́."],
            ["отку́да?", "от", "génitif", "Я иду́ от врача́."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Приходи́ ко мне в го́сти.", fr: "Viens me rendre visite.", note: "ко мне : allongement obligatoire" },
            { ru: "Вчера́ я был у роди́телей.", fr: "Hier, j'étais chez mes parents." },
            { ru: "Я получи́л письмо́ от бра́та.", fr: "J'ai reçu une lettre de mon frère." },
            { ru: "Он подошёл к окну́.", fr: "Il s'est approché de la fenêtre.", note: "к vaut aussi pour un objet dont on s'approche" },
          ],
        },
        {
          kind: "prose",
          title: "У, la préposition à tout faire",
          body: [
            "У + génitif sert bien au-delà du lieu : c'est la construction de la possession (У меня́ есть), celle de l'état d'une personne (У меня́ боли́т голова́), et celle de la localisation près de quelque chose (у окна́, у вхо́да).",
            "Ces emplois ont une idée commune : ce qui se trouve dans la sphère de quelqu'un ou de quelque chose. C'est l'une des prépositions les plus fréquentes de la langue.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Personnes : к (vers), у (chez), от (de chez).",
            "в et на ne s'emploient jamais avec une personne.",
            "к + datif sert aussi à s'approcher d'un objet.",
            "у + génitif : possession, état, proximité.",
          ],
        },
      ],
      practice: [{ href: "/cases/dative", label: "Exercice : le datif" }],
    },
    {
      slug: "position-relative",
      title: "Situer dans l'espace",
      titleRu: "Расположение в пространстве",
      level: "B1",
      minutes: 8,
      summary:
        "Au-dessus, en dessous, devant, derrière, entre, à côté : la famille de l'instrumental, plus quelques génitifs.",
      keywords: ["над", "под", "перед", "за", "между", "рядом с", "напротив", "espace"],
      sections: [
        {
          kind: "table",
          title: "Les prépositions de position",
          head: ["Préposition", "Cas", "Sens", "Exemple"],
          rows: [
            ["над", "instrumental", "au-dessus de", "над столо́м"],
            ["под", "instrumental", "sous", "под столо́м"],
            ["пе́ред", "instrumental", "devant", "пе́ред до́мом"],
            ["за", "instrumental", "derrière", "за до́мом"],
            ["ме́жду", "instrumental", "entre", "ме́жду на́ми"],
            ["ря́дом с", "instrumental", "à côté de", "ря́дом с шко́лой"],
            ["о́коло / у", "génitif", "près de", "о́коло до́ма"],
            ["напро́тив", "génitif", "en face de", "напро́тив вокза́ла"],
            ["вокру́г", "génitif", "autour de", "вокру́г го́рода"],
            ["ми́мо", "génitif", "devant, en passant", "ми́мо теа́тра"],
          ],
        },
        {
          kind: "prose",
          body: [
            "La famille de l'instrumental décrit une position stable, celle du génitif une relation de proximité ou de trajectoire. Les deux groupes ne se mélangent pas.",
            "Rappel : над, под, пе́ред et за passent à l'accusatif dès qu'il y a mouvement vers cette position — Он сел за стол (il s'est mis à table) contre Он сиди́т за столо́м (il est assis à table).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Ко́шка спит под крова́тью.", fr: "Le chat dort sous le lit." },
            { ru: "Магази́н нахо́дится напро́тив апте́ки.", fr: "Le magasin se trouve en face de la pharmacie." },
            { ru: "Мы живём ря́дом с па́рком.", fr: "Nous habitons à côté du parc." },
            { ru: "Он прошёл ми́мо и не поздоро́вался.", fr: "Il est passé devant sans dire bonjour." },
            { ru: "Ме́жду на́ми говоря́…", fr: "Entre nous soit dit…" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "над, под, пе́ред, за, ме́жду, ря́дом с : instrumental.",
            "о́коло, напро́тив, вокру́г, ми́мо : génitif.",
            "Mouvement vers la position : под et за passent à l'accusatif.",
            "нахо́диться (se trouver) est le verbe standard pour situer.",
          ],
        },
      ],
    },
    {
      slug: "prepositions-de-temps",
      title: "Les prépositions de temps",
      titleRu: "Предлоги времени",
      level: "B1",
      minutes: 9,
      summary:
        "В, на, че́рез, за, до, по́сле, с… до : chaque unité de temps a sa préposition, et changer de cas change la durée.",
      keywords: ["temps", "через", "за", "до", "после", "в течение", "prépositions"],
      sections: [
        {
          kind: "table",
          title: "Situer un moment",
          head: ["Construction", "Sens", "Exemple"],
          rows: [
            ["в + accusatif", "jour, heure", "в понеде́льник, в два часа́"],
            ["в + prépositionnel", "mois, année, siècle", "в ма́е, в 2026 году́"],
            ["на + prépositionnel", "semaine", "на э́той неде́ле"],
            ["génitif seul", "date", "пя́того ма́я"],
            ["instrumental seul", "saison, moment du jour", "ле́том, ве́чером"],
          ],
        },
        {
          kind: "table",
          title: "Situer par rapport à un point",
          head: ["Préposition", "Cas", "Sens", "Exemple"],
          rows: [
            ["до", "génitif", "avant, jusqu'à", "до обе́да"],
            ["по́сле", "génitif", "après", "по́сле уро́ка"],
            ["во вре́мя", "génitif", "pendant", "во вре́мя войны́"],
            ["в тече́ние", "génitif", "au cours de", "в тече́ние го́да"],
            ["с… до", "génitif", "de… à", "с девяти́ до пяти́"],
            ["че́рез", "accusatif", "dans (à venir)", "че́рез неде́лю"],
            ["наза́д", "accusatif (postposé)", "il y a", "неде́лю наза́д"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Магази́н рабо́тает с девяти́ до девяти́.", fr: "Le magasin est ouvert de neuf heures à vingt-et-une heures." },
            { ru: "Я верну́сь че́рез два дня.", fr: "Je reviendrai dans deux jours." },
            { ru: "Он уе́хал два го́да наза́д.", fr: "Il est parti il y a deux ans." },
            { ru: "По́сле рабо́ты мы пошли́ в кафе́.", fr: "Après le travail, nous sommes allés au café." },
            { ru: "В тече́ние ме́сяца ничего́ не измени́лось.", fr: "En un mois, rien n'a changé." },
          ],
        },
        {
          kind: "pitfall",
          title: "Че́рез, за, в тече́ние",
          body: [
            "Trois façons de parler d'un intervalle, trois sens distincts. Че́рез час = dans une heure (le point de départ est maintenant). За час = en une heure (le temps qu'il a fallu pour aboutir). В тече́ние ча́са = au cours de l'heure, tout du long.",
            "Le test : chérez situe un moment futur, за mesure une performance, в тече́ние couvre une période entière.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "в + accusatif pour l'heure et le jour, в + prépositionnel pour le mois et l'année.",
            "Saison et moment du jour : instrumental seul.",
            "че́рез (dans), наза́д (il y a) : accusatif.",
            "до / по́сле / во вре́мя / в тече́ние : génitif.",
          ],
        },
      ],
    },
    {
      slug: "prepositions-derivees",
      title: "Les prépositions dérivées",
      titleRu: "Производные предлоги",
      level: "B2",
      minutes: 8,
      summary:
        "Благодаря́, из-за, несмотря́ на : les prépositions de la cause, de la concession et du but, presque toutes issues d'autres mots.",
      keywords: ["благодаря", "из-за", "несмотря на", "ради", "вопреки", "cause"],
      sections: [
        {
          kind: "table",
          title: "Cause, but, concession",
          head: ["Préposition", "Cas", "Sens", "Nuance"],
          rows: [
            ["из-за", "génitif", "à cause de", "conséquence négative"],
            ["благодаря́", "datif", "grâce à", "conséquence positive"],
            ["по причи́не", "génitif", "pour cause de", "administratif"],
            ["ра́ди", "génitif", "pour, en vue de", "sacrifice, intention"],
            ["для", "génitif", "pour, destiné à", "destinataire"],
            ["вопреки́", "datif", "en dépit de", "livresque"],
            ["несмотря́ на", "accusatif", "malgré", "courant"],
            ["по", "datif", "selon, par", "по пла́ну, по по́чте"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Из-за et благодаря́ ne sont pas interchangeables : le premier annonce une conséquence fâcheuse (из-за дождя́ — à cause de la pluie), le second une conséquence heureuse (благодаря́ тебе́ — grâce à toi). Employer благодаря́ pour un malheur produit une ironie que le locuteur ne voulait pas toujours.",
            "Благодаря́ vient du gérondif de благодари́ть (remercier) : « en remerciant ». Le sens positif s'explique de lui-même, et l'étymologie aide à retenir le datif, qui est le cas du destinataire du remerciement.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Из-за дождя́ мы оста́лись до́ма.", fr: "À cause de la pluie, nous sommes restés à la maison." },
            { ru: "Благодаря́ ва́шей по́мощи всё получи́лось.", fr: "Grâce à votre aide, tout a marché." },
            { ru: "Несмотря́ на уста́лость, он продолжа́л рабо́тать.", fr: "Malgré la fatigue, il a continué à travailler." },
            { ru: "Он сде́лал э́то ра́ди семьи́.", fr: "Il l'a fait pour sa famille." },
            { ru: "Э́то пода́рок для тебя́.", fr: "C'est un cadeau pour toi." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "из-за + génitif : cause négative. благодаря́ + datif : cause positive.",
            "несмотря́ на + accusatif : la concession courante.",
            "ра́ди (en vue de) et для (destiné à) ne se confondent pas.",
            "по + datif couvre « selon », « par », « le long de ».",
          ],
        },
      ],
    },
    {
      slug: "regime-des-verbes",
      title: "Le régime des verbes",
      titleRu: "Управление глаголов",
      level: "B2",
      minutes: 9,
      summary:
        "Помога́ть demande le datif, занима́ться l'instrumental, боя́ться le génitif : la liste des verbes dont le complément n'est pas à l'accusatif.",
      keywords: ["régime", "управление", "помогать", "заниматься", "бояться", "verbes"],
      sections: [
        {
          kind: "prose",
          body: [
            "En français, un verbe se retient avec sa préposition (« penser À », « se souvenir DE »). En russe, il se retient avec son cas — et parfois avec une préposition en plus. Ce n'est pas déductible du sens : c'est une propriété du verbe.",
          ],
        },
        {
          kind: "table",
          title: "Les régimes les plus fréquents",
          head: ["Verbe", "Cas exigé", "Exemple"],
          rows: [
            ["помога́ть (aider)", "datif", "помога́ть дру́гу"],
            ["звони́ть (téléphoner)", "datif", "звони́ть ма́ме"],
            ["ме́шать (déranger)", "datif", "не меша́й мне"],
            ["ве́рить (croire)", "datif", "ве́рить друзья́м"],
            ["занима́ться (pratiquer)", "instrumental", "занима́ться спо́ртом"],
            ["интересова́ться (s'intéresser)", "instrumental", "интересова́ться иску́сством"],
            ["по́льзоваться (utiliser)", "instrumental", "по́льзоваться словарём"],
            ["станови́ться / стать (devenir)", "instrumental", "стать врачо́м"],
            ["боя́ться (craindre)", "génitif", "боя́ться темноты́"],
            ["жела́ть (souhaiter)", "génitif", "жела́ю уда́чи"],
            ["достига́ть (atteindre)", "génitif", "дости́гнуть це́ли"],
          ],
        },
        {
          kind: "table",
          title: "Avec préposition",
          head: ["Verbe", "Construction", "Exemple"],
          rows: [
            ["ду́мать (penser)", "о + prépositionnel", "ду́мать о рабо́те"],
            ["говори́ть (parler)", "о + prépositionnel", "говори́ть о поли́тике"],
            ["забы́ть (oublier)", "о + prép. ou accusatif", "забы́ть о встре́че"],
            ["смотре́ть (regarder)", "на + accusatif", "смотре́ть на меня́"],
            ["наде́яться (espérer)", "на + accusatif", "наде́яться на успе́х"],
            ["жени́ться (se marier, homme)", "на + prépositionnel", "жени́ться на Ма́ше"],
            ["выходи́ть за́муж (se marier, femme)", "за + accusatif", "вы́йти за́муж за Ива́на"],
            ["зави́сеть (dépendre)", "от + génitif", "зави́сеть от пого́ды"],
            ["отвеча́ть (répondre)", "на + accusatif", "отве́тить на вопро́с"],
          ],
        },
        {
          kind: "pitfall",
          title: "Les verbes que le français trahit",
          body: [
            "Помога́ть, звони́ть, ме́шать, отвеча́ть sont transitifs directs en français et ne le sont pas en russe. « Je l'aide » ne devient jamais « Я его́ помога́ю » mais Я ему́ помога́ю.",
            "Inversement, слу́шать (écouter) et жда́ть (attendre) sont directs en russe : Я слу́шаю му́зыку, Я жду авто́бус. Là encore, seule l'habitude corrige — d'où l'intérêt d'apprendre chaque verbe dans une phrase complète, pas isolé.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le cas du complément est une propriété du verbe, à apprendre avec lui.",
            "Datif : помога́ть, звони́ть, ме́шать, ве́рить.",
            "Instrumental : занима́ться, интересова́ться, по́льзоваться, стать.",
            "Génitif : боя́ться, жела́ть, достига́ть.",
            "Apprendre les verbes en phrase, jamais en liste sèche.",
          ],
        },
      ],
      practice: [{ href: "/motion/government", label: "Exercice : le régime des verbes" }],
    },
  ],
};
