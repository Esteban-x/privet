import type { Unit } from "../types";

/**
 * Unité 8 — les verbes de mouvement : deux séries, une douzaine de préfixes,
 * et un système de régime qui décide du cas après chacun.
 */
export const UNIT_MOUVEMENT: Unit = {
  slug: "verbes-de-mouvement",
  title: "Les verbes de mouvement",
  titleRu: "Глаголы движения",
  subtitle:
    "Aller, venir, revenir : deux séries de base, les préfixes de direction, et les sens figurés.",
  color: "#2456A6",
  lessons: [
    {
      slug: "deux-series",
      title: "Les deux séries",
      titleRu: "Однонаправленные и разнонаправленные",
      level: "A2",
      minutes: 10,
      summary:
        "Идти́ ou ходи́ть ? Un aller unique et orienté, ou un déplacement habituel, répété, ou aller-retour.",
      keywords: ["идти", "ходить", "unidirectionnel", "multidirectionnel", "движение", "aller"],
      sections: [
        {
          kind: "prose",
          body: [
            "Là où le français a un verbe « aller », le russe en a deux, et le choix n'est pas stylistique. La première série (идти́, е́хать) décrit un déplacement UNIQUE, en cours, orienté vers un but. La seconde (ходи́ть, е́здить) décrit un déplacement HABITUEL, répété, sans direction unique, ou un aller-retour accompli.",
            "Les deux séries sont imperfectives : ce n'est pas une paire aspectuelle, mais une opposition de direction qui se superpose à l'aspect.",
          ],
        },
        {
          kind: "table",
          title: "Les huit couples de base",
          head: ["Unidirectionnel", "Multidirectionnel", "Sens"],
          rows: [
            ["идти́", "ходи́ть", "aller à pied"],
            ["е́хать", "е́здить", "aller en véhicule"],
            ["бежа́ть", "бе́гать", "courir"],
            ["лете́ть", "лета́ть", "voler"],
            ["плыть", "пла́вать", "nager, naviguer"],
            ["нести́", "носи́ть", "porter (en tenant)"],
            ["вести́", "води́ть", "mener, conduire quelqu'un"],
            ["везти́", "вози́ть", "transporter (par véhicule)"],
          ],
        },
        {
          kind: "examples",
          title: "La même phrase, deux séries",
          items: [
            {
              ru: "Сейча́с я иду́ в шко́лу.",
              fr: "Là, je vais à l'école.",
              note: "en ce moment, un trajet, une direction",
            },
            {
              ru: "Я хожу́ в шко́лу ка́ждый день.",
              fr: "Je vais à l'école tous les jours.",
              note: "habitude : aller ET retour, répétés",
            },
            {
              ru: "Вчера́ я ходи́л в кино́.",
              fr: "Hier, je suis allé au cinéma.",
              note: "j'y suis allé et je suis rentré",
            },
            {
              ru: "Он лю́бит пла́вать.",
              fr: "Il aime nager.",
              note: "activité en général : multidirectionnel",
            },
            {
              ru: "Ры́ба плывёт к бе́регу.",
              fr: "Le poisson nage vers la rive.",
              note: "direction précise : unidirectionnel",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "Ходи́л au passé = aller-retour",
          body: [
            "Я ходи́л в магази́н ne signifie pas « je marchais vers le magasin » mais « je suis allé au magasin (et je suis revenu) ». Le multidirectionnel au passé raconte une sortie complète, résultat annulé.",
            "C'est l'équivalent exact de Я был в магази́не. Le francophone, lui, choisit spontanément l'unidirectionnel et dit « Я шёл в магази́н », ce qui décrit le trajet en cours et laisse la phrase en suspens.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Unidirectionnel : un trajet, en cours, orienté.",
            "Multidirectionnel : habitude, répétition, aller-retour, capacité.",
            "Les deux sont imperfectifs.",
            "ходи́л / е́здил au passé = « je suis allé et revenu ».",
          ],
        },
      ],
      practice: [{ href: "/motion/mode", label: "Exercice : choisir la série" }],
    },
    {
      slug: "a-pied-en-vehicule",
      title: "À pied ou en véhicule",
      titleRu: "Идти или ехать",
      level: "A2",
      minutes: 9,
      summary:
        "Le russe marque le moyen dans le verbe lui-même. Et la frontière ne passe pas exactement là où on l'attend.",
      keywords: ["идти", "ехать", "à pied", "véhicule", "транспорт", "движение"],
      sections: [
        {
          kind: "prose",
          body: [
            "Идти́ / ходи́ть s'emploient pour un déplacement à pied ; е́хать / е́здить pour un déplacement en véhicule. Le choix est obligatoire : il n'existe pas de verbe neutre.",
            "La règle a des zones grises utiles à connaître. À l'intérieur d'une ville, on emploie souvent идти́ même si l'on prend le métro, parce que ce qui compte est le déplacement local. En revanche, changer de ville impose е́хать, quel que soit le moyen.",
          ],
        },
        {
          kind: "table",
          title: "Ce qui décide",
          head: ["Situation", "Verbe", "Exemple"],
          rows: [
            ["Se déplacer à pied", "идти́ / ходи́ть", "Я иду́ домо́й."],
            ["Prendre un transport", "е́хать / е́здить", "Я е́ду на рабо́ту на метро́."],
            ["Voyager, changer de ville", "е́хать / е́здить", "Ле́том мы е́дем в Ита́лию."],
            ["Un véhicule qui se déplace", "идти́ ou е́хать", "Авто́бус идёт. / Маши́на е́дет."],
            ["Un avion, un oiseau", "лете́ть / лета́ть", "Мы лети́м в Москву́."],
          ],
          note: "Pour les transports en commun qui suivent une ligne, идти́ est le verbe habituel : По́езд идёт в Москву́.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Куда́ ты идёшь?", fr: "Où vas-tu ?", note: "à pied, tout de suite" },
            { ru: "Куда́ ты е́дешь?", fr: "Où pars-tu ?", note: "en voyage" },
            { ru: "Э́тот авто́бус идёт до це́нтра?", fr: "Ce bus va-t-il jusqu'au centre ?" },
            { ru: "Мы е́здили в Петербу́рг на по́езде.", fr: "Nous sommes allés à Saint-Pétersbourg en train." },
          ],
        },
        {
          kind: "pitfall",
          title: "Идти́ ne parle pas que de pieds",
          body: [
            "Идёт sert à quantité de sujets qui ne marchent pas : дождь идёт (il pleut), снег идёт (il neige), фильм идёт (le film passe), вре́мя идёт (le temps passe), часы́ иду́т (la pendule marche), уро́к идёт (le cours a lieu). Et pour un vêtement : Тебе́ идёт э́то пла́тье (cette robe te va). C'est l'un des verbes les plus productifs de la langue.",
            "Le piège symétrique est celui qu'un francophone tend tout seul : « Я иду́ в Москву́ » se comprend, mais décrit quelqu'un qui s'y rend à pied. Dès qu'on change de ville, c'est е́хать — Я е́ду в Москву́ — même si le trajet commence par dix minutes de marche jusqu'à la gare.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "идти́ = à pied, е́хать = en véhicule : le verbe porte le moyen.",
            "Changer de ville : е́хать, toujours.",
            "Les transports en ligne « vont » avec идти́ : по́езд идёт.",
            "на + prépositionnel pour préciser le moyen : на метро́, на маши́не.",
          ],
        },
      ],
      practice: [{ href: "/motion/direction", label: "Exercice : à pied ou en véhicule" }],
    },
    {
      slug: "prefixes-de-direction",
      title: "Les préfixes de direction",
      titleRu: "Приставки движения",
      level: "B1",
      minutes: 12,
      summary:
        "Une douzaine de préfixes qui transforment « aller » en arriver, partir, entrer, sortir, traverser, contourner, passer et faire un saut.",
      keywords: ["préfixes", "прийти", "уйти", "выйти", "войти", "приставки", "direction"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe ne dispose pas d'un verbe « arriver », « partir » ou « entrer » : il prend un verbe de mouvement et lui ajoute un préfixe. Une douzaine de préfixes suffisent, et ils s'appliquent identiquement aux huit couples de base.",
            "Chaque préfixe appelle une préposition et un cas précis : c'est un ensemble à apprendre d'un bloc, préfixe + préposition + cas.",
          ],
        },
        {
          kind: "table",
          title: "Les préfixes et leur régime",
          head: ["Préfixe", "Sens", "Préposition", "Exemple"],
          rows: [
            ["при-", "arriver", "в / на + acc., к + dat.", "Он пришёл домо́й."],
            ["у-", "partir, s'en aller", "из / с + gén., от + gén.", "Он ушёл с рабо́ты."],
            ["в- / во-", "entrer", "в + acc.", "Он вошёл в ко́мнату."],
            ["вы-", "sortir", "из + gén.", "Он вы́шел из до́ма."],
            ["под-", "s'approcher", "к + dat.", "Он подошёл к окну́."],
            ["от-", "s'écarter", "от + gén.", "Он отошёл от окна́."],
            ["до-", "atteindre", "до + gén.", "Мы дошли́ до пло́щади."],
            ["за-", "passer prendre, faire un détour", "в / на + acc., за + instr.", "Я зайду́ за тобо́й."],
            ["пере-", "traverser", "че́рез + acc. ou acc. seul", "Он перешёл у́лицу."],
            ["про-", "passer devant, parcourir", "ми́мо + gén.", "Мы прошли́ ми́мо теа́тра."],
            ["об- / обо-", "contourner, faire le tour", "acc.", "Он обошёл дом."],
            ["по-", "se mettre en route", "в / на + acc.", "Он пошёл домо́й."],
          ],
        },
        {
          kind: "prose",
          title: "Les couples opposés",
          body: [
            "Les préfixes fonctionnent par paires contraires, ce qui divise l'effort de mémorisation par deux : при- / у- (arriver / partir), в- / вы- (entrer / sortir), под- / от- (s'approcher / s'éloigner), при- / от- pour les objets qu'on apporte et qu'on remporte.",
            "Une remarque de forme : идти́ devient -йти́ après préfixe (прийти́, уйти́, войти́, вы́йти). Е́хать, lui, ne change pas — прие́хать, уе́хать, дое́хать — sauf après un préfixe terminé par une CONSONNE, où le ъ de séparation devient obligatoire : въе́хать, съе́хать, отъе́хать, подъе́хать. C'est la même règle que dans объясни́ть, vue à l'unité 1.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он пришёл на рабо́ту в де́вять.", fr: "Il est arrivé au travail à neuf heures." },
            { ru: "Она́ уе́хала в Москву́ на неде́лю.", fr: "Elle est partie à Moscou pour une semaine." },
            { ru: "Войди́те!", fr: "Entrez !" },
            { ru: "Вы́йдите отсю́да.", fr: "Sortez d'ici." },
            { ru: "Я зайду́ к тебе́ ве́чером.", fr: "Je passerai chez toi ce soir.", note: "за- : une visite brève, en chemin" },
            { ru: "Мы дое́хали до вокза́ла за два́дцать мину́т.", fr: "Nous avons atteint la gare en vingt minutes." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Une douzaine de préfixes couvrent toutes les directions.",
            "Chaque préfixe appelle sa préposition et son cas.",
            "Ils vont par paires opposées : при-/у-, в-/вы-, под-/от-.",
            "идти́ → -йти́, е́хать → -ъе́хать après préfixe.",
          ],
        },
      ],
      practice: [{ href: "/motion/prefix", label: "Exercice : les préfixes" }],
    },
    {
      slug: "aspect-des-verbes-prefixes",
      title: "L'aspect des verbes préfixés",
      titleRu: "Вид приставочных глаголов",
      level: "B1",
      minutes: 9,
      summary:
        "Une règle mécanique : préfixe + unidirectionnel = perfectif ; préfixe + multidirectionnel = imperfectif. La paire est là, toute faite.",
      keywords: ["aspect", "préfixé", "приходить", "прийти", "уезжать", "уехать"],
      sections: [
        {
          kind: "prose",
          body: [
            "Quand on préfixe un verbe de mouvement, l'opposition unidirectionnel / multidirectionnel disparaît et cède la place à l'opposition d'aspect. Le résultat est parfaitement régulier.",
            "Préfixe + série unidirectionnelle donne un PERFECTIF (прийти́, уе́хать, войти́). Préfixe + série multidirectionnelle donne l'IMPERFECTIF correspondant (приходи́ть, уезжа́ть, входи́ть).",
          ],
        },
        {
          kind: "table",
          title: "Les paires ainsi obtenues",
          head: ["Imperfectif", "Perfectif", "Sens"],
          rows: [
            ["приходи́ть", "прийти́", "arriver (à pied)"],
            ["приезжа́ть", "прие́хать", "arriver (en véhicule)"],
            ["уходи́ть", "уйти́", "partir (à pied)"],
            ["уезжа́ть", "уе́хать", "partir (en véhicule)"],
            ["входи́ть", "войти́", "entrer"],
            ["выходи́ть", "вы́йти", "sortir"],
            ["приноси́ть", "принести́", "apporter"],
            ["привози́ть", "привезти́", "amener (en véhicule)"],
          ],
          note: "е́здить devient -езжа́ть sous préfixe : уезжа́ть, приезжа́ть, въезжа́ть.",
        },
        {
          kind: "examples",
          title: "L'opposition en situation",
          items: [
            {
              ru: "Он приходи́л вчера́.",
              fr: "Il est passé hier.",
              note: "imperfectif : venu et reparti",
            },
            {
              ru: "Он пришёл вчера́.",
              fr: "Il est arrivé hier.",
              note: "perfectif : il est là, ou son arrivée est le fait marquant",
            },
            {
              ru: "Он ка́ждый день прихо́дит в во́семь.",
              fr: "Il arrive chaque jour à huit heures.",
              note: "répétition : imperfectif obligatoire",
            },
            {
              ru: "Когда́ он придёт, скажи́ мне.",
              fr: "Quand il arrivera, dis-le-moi.",
              note: "futur perfectif",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "По- ne donne pas une paire",
          body: [
            "Пойти́ et пое́хать sont perfectifs et signifient « se mettre en route ». Ils n'ont pas d'imperfectif correspondant : leur partenaire est идти́ / е́хать eux-mêmes.",
            "Я пошёл ne dit pas « je suis allé et revenu » mais « je suis parti » — d'où son emploi comme formule de départ : Ну, я пошёл (bon, j'y vais).",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Préfixe + unidirectionnel = perfectif.",
            "Préfixe + multidirectionnel = imperfectif.",
            "е́здить → -езжа́ть sous préfixe.",
            "пойти́ / пое́хать : « se mettre en route », sans imperfectif propre.",
          ],
        },
      ],
    },
    {
      slug: "porter-mener-transporter",
      title: "Porter, mener, transporter",
      titleRu: "Нести, вести, везти",
      level: "B1",
      minutes: 9,
      summary:
        "Trois couples qui distinguent ce que le français confond : porter dans ses bras, mener par la main, transporter en véhicule.",
      keywords: ["нести", "носить", "вести", "везти", "porter", "transporter"],
      sections: [
        {
          kind: "table",
          title: "Trois couples, trois moyens",
          head: ["Unidirectionnel", "Multidirectionnel", "Ce qu'on déplace", "Comment"],
          rows: [
            ["нести́", "носи́ть", "un objet", "dans les mains, sur soi"],
            ["вести́", "води́ть", "une personne, un véhicule", "en le guidant"],
            ["везти́", "вози́ть", "objet ou personne", "par un véhicule"],
          ],
        },
        {
          kind: "prose",
          body: [
            "Le français dit « emmener les enfants à l'école » sans préciser le moyen. Le russe oblige à choisir : вести́ дете́й en marchant à côté d'eux, везти́ дете́й si l'on prend la voiture.",
            "Ces trois couples reçoivent les mêmes préfixes que идти́ et е́хать, avec les mêmes valeurs : принести́ (apporter), унести́ (emporter), привезти́ (amener en véhicule), отвезти́ (conduire à), перевезти́ (déménager).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Он несёт тяжёлую су́мку.", fr: "Il porte un sac lourd." },
            { ru: "Она́ ведёт дете́й в шко́лу.", fr: "Elle emmène les enfants à l'école.", note: "à pied, en les guidant" },
            { ru: "Он везёт дете́й в шко́лу.", fr: "Il conduit les enfants à l'école.", note: "en voiture" },
            { ru: "Принеси́те, пожа́луйста, счёт.", fr: "Apportez l'addition, s'il vous plaît." },
            { ru: "Он во́дит маши́ну уже́ де́сять лет.", fr: "Il conduit depuis dix ans.", note: "capacité : multidirectionnel" },
          ],
        },
        {
          kind: "pitfall",
          title: "Води́ть маши́ну ou е́хать на маши́не ?",
          body: [
            "Води́ть маши́ну signifie savoir conduire, être conducteur : Я вожу́ маши́ну = j'ai le permis et je conduis. Е́хать на маши́не signifie se déplacer en voiture, comme conducteur ou passager.",
            "« Je vais au travail en voiture » se dit donc Я е́ду на рабо́ту на маши́не, et non « Я вожу́ на рабо́ту ».",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "нести́ = dans les mains, вести́ = en guidant, везти́ = par véhicule.",
            "Le russe choisit obligatoirement le moyen.",
            "Mêmes préfixes que идти́ : принести́, привезти́, отвезти́.",
            "води́ть маши́ну = savoir conduire, pas « aller en voiture ».",
          ],
        },
      ],
    },
    {
      slug: "regime-des-verbes-de-mouvement",
      title: "Le régime : où l'on va, d'où l'on vient",
      titleRu: "Управление глаголов движения",
      level: "B1",
      minutes: 9,
      summary:
        "В s'oppose à из, на s'oppose à с, к s'oppose à от : les paires de prépositions doivent se répondre exactement.",
      keywords: ["régime", "из", "с", "к", "от", "куда", "откуда", "prépositions"],
      sections: [
        {
          kind: "prose",
          body: [
            "Chaque préposition de destination a son symétrique d'origine, et l'appariement est strict : ce qui s'atteint avec в se quitte avec из, ce qui s'atteint avec на se quitte avec с, ce qui s'atteint avec к se quitte avec от.",
            "L'erreur la plus fréquente consiste à mélanger les paires : on est allé на по́чту, donc on revient с по́чты — jamais из по́чты.",
          ],
        },
        {
          kind: "table",
          title: "Les trois paires",
          head: ["Où (position)", "Vers où (direction)", "D'où (origine)", "Exemple"],
          rows: [
            ["в + prép.", "в + acc.", "из + gén.", "в шко́ле / в шко́лу / из шко́лы"],
            ["на + prép.", "на + acc.", "с + gén.", "на рабо́те / на рабо́ту / с рабо́ты"],
            ["у + gén.", "к + dat.", "от + gén.", "у врача́ / к врачу́ / от врача́"],
          ],
          note: "к / у / от s'emploient avec les PERSONNES ; в / на avec les lieux.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Я иду́ к врачу́.", fr: "Je vais chez le médecin." },
            { ru: "Я был у врача́.", fr: "J'étais chez le médecin." },
            { ru: "Я иду́ от врача́.", fr: "Je reviens de chez le médecin." },
            { ru: "Она́ верну́лась с рабо́ты по́здно.", fr: "Elle est rentrée tard du travail." },
            { ru: "Они́ прие́хали из Фра́нции.", fr: "Ils sont arrivés de France." },
          ],
        },
        {
          kind: "prose",
          title: "Домо́й, до́ма, из до́ма",
          body: [
            "« La maison » a des formes spéciales : до́ма (à la maison, position), домо́й (vers la maison, direction), из до́ма ou и́з дому (de la maison). Домо́й est un adverbe : il ne prend jamais de préposition.",
            "Le même modèle vaut pour quelques adverbes de lieu : здесь / сюда́ / отсю́да (ici, vers ici, d'ici), там / туда́ / отту́да (là-bas, vers là-bas, de là-bas).",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "в ↔ из, на ↔ с, к ↔ от : les paires ne se mélangent pas.",
            "к / у / от pour les personnes, в / на pour les lieux.",
            "домо́й (direction) ne prend jamais de préposition.",
            "здесь / сюда́ / отсю́да : trois formes pour trois questions.",
          ],
        },
      ],
      practice: [{ href: "/motion/government", label: "Exercice : le régime des verbes" }],
    },
    {
      slug: "mouvement-au-figure",
      title: "Le mouvement au figuré",
      titleRu: "Переносные значения",
      level: "B2",
      minutes: 8,
      summary:
        "Идти́ ne parle pas que de marche : la pluie, le temps, les montres, les films et les vêtements « vont » eux aussi.",
      keywords: ["figuré", "идёт дождь", "время идёт", "речь идёт", "выражения", "sens"],
      sections: [
        {
          kind: "prose",
          body: [
            "Идти́ est l'un des verbes les plus polysémiques du russe. Ses emplois figurés sont d'un usage quotidien et ne s'analysent pas : ils s'apprennent comme des expressions.",
          ],
        },
        {
          kind: "table",
          title: "Les emplois à connaître",
          head: ["Expression", "Sens", "Exemple"],
          rows: [
            ["идёт дождь / снег", "il pleut / il neige", "На у́лице идёт дождь."],
            ["вре́мя идёт", "le temps passe", "Вре́мя идёт бы́стро."],
            ["часы́ иду́т", "la montre marche", "Мои́ часы́ иду́т то́чно."],
            ["фильм идёт", "le film passe (au cinéma)", "Э́тот фильм идёт в «Октя́бре»."],
            ["речь идёт о…", "il s'agit de…", "Речь идёт о де́ньгах."],
            ["тебе́ идёт", "ça te va bien", "Э́то пла́тье тебе́ идёт."],
            ["дела́ иду́т", "les affaires marchent", "Как иду́т дела́?"],
          ],
        },
        {
          kind: "prose",
          title: "Les autres verbes au figuré",
          body: [
            "Вести́ donne вести́ себя́ (se comporter), вести́ уро́к (donner un cours), вести́ перегово́ры (mener des négociations). Носи́ть donne носи́ть оде́жду (porter des vêtements), носи́ть и́мя (porter un nom).",
            "Приходи́ть forme прийти́ к вы́воду (arriver à une conclusion) et прийти́ в себя́ (reprendre ses esprits). Ces expressions figées sont beaucoup plus fréquentes à l'écrit que les emplois littéraux du même verbe.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Речь идёт о ва́жном вопро́се.", fr: "Il s'agit d'une question importante." },
            { ru: "Вре́мя идёт, а он всё не звони́т.", fr: "Le temps passe, et il n'appelle toujours pas." },
            { ru: "Он пло́хо себя́ ведёт.", fr: "Il se comporte mal." },
            { ru: "Она́ но́сит очки́.", fr: "Elle porte des lunettes.", note: "habitude : multidirectionnel" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "идёт дождь, вре́мя идёт, часы́ иду́т : le verbe de marche s'emploie partout.",
            "речь идёт о + prépositionnel = « il s'agit de ».",
            "вести́ себя́ = se comporter ; носи́ть = porter (vêtements, nom).",
            "Ces emplois figés sont plus fréquents que le sens littéral.",
          ],
        },
      ],
    },
  ],
};
