import type { Unit } from "../types";

/**
 * Unité 6 — la mécanique du verbe : conjuguer au présent, au passé, au
 * futur, à l'impératif et au conditionnel. L'aspect, lui, a son unité.
 */
export const UNIT_VERBE: Unit = {
  slug: "verbe-formes",
  title: "Le verbe : les formes",
  titleRu: "Глагол: формы",
  subtitle:
    "Deux conjugaisons au présent, un passé qui s'accorde en genre, deux futurs, l'impératif et le conditionnel.",
  color: "#6F4A2E",
  lessons: [
    {
      slug: "infinitif-et-radical",
      title: "L'infinitif et le radical",
      titleRu: "Инфинитив и основа",
      level: "A1",
      minutes: 9,
      summary:
        "L'infinitif russe ne dit pas comment le verbe se conjugue. Ce sont les deux radicaux, celui du présent et celui du passé, qui commandent tout.",
      keywords: ["infinitif", "radical", "основа", "-ть", "conjugaison", "verbe"],
      sections: [
        {
          kind: "prose",
          body: [
            "Presque tous les infinitifs russes finissent en -ть : чита́ть, говори́ть, писа́ть. Quelques-uns en -ти (идти́, нести́) ou en -чь (мочь, помо́чь). C'est la forme du dictionnaire, mais elle ne suffit pas à conjuguer.",
            "Un verbe russe a en réalité DEUX radicaux : celui du présent (пиш- pour писа́ть) et celui du passé et de l'infinitif (писа-). Connaître l'infinitif et la première personne du singulier suffit à reconstruire tout le reste — c'est pourquoi les dictionnaires donnent toujours я … et ты … .",
          ],
        },
        {
          kind: "table",
          title: "Ce qu'il faut retenir d'un verbe",
          head: ["Infinitif", "1ʳᵉ pers. sing.", "2ᵉ pers. sing.", "Ce que ça révèle"],
          rows: [
            ["чита́ть", "чита́ю", "чита́ешь", "1ʳᵉ conjugaison régulière"],
            ["писа́ть", "пишу́", "пи́шешь", "1ʳᵉ conjugaison, radical modifié"],
            ["говори́ть", "говорю́", "говори́шь", "2ᵉ conjugaison"],
            ["жить", "живу́", "живёшь", "radical élargi en -в-"],
            ["мочь", "могу́", "мо́жешь", "alternance г / ж"],
          ],
        },
        {
          kind: "examples",
          title: "Les deux radicaux en phrase",
          items: [
            { ru: "Я пишу́ письмо́, а он чита́ет газе́ту.", fr: "J'écris une lettre, et lui lit le journal.", note: "пиш- et чита́- : deux radicaux de présent pour deux infinitifs en -ать" },
            { ru: "Вчера́ я писа́л весь ве́чер.", fr: "Hier, j'ai écrit toute la soirée.", note: "au passé, писа́ть retrouve son radical d'infinitif" },
            { ru: "Она́ живёт в Москве́ уже́ пять лет.", fr: "Elle habite à Moscou depuis cinq ans.", note: "жить → жив-, radical élargi qu'aucune lettre de l'infinitif n'annonce" },
            { ru: "Я не могу́ сего́дня, но за́втра смогу́.", fr: "Je ne peux pas aujourd'hui, mais demain je pourrai.", note: "мочь : могу́ / мо́жешь, alternance г / ж" },
            { ru: "Мы говори́м по-ру́сски ка́ждый день.", fr: "Nous parlons russe tous les jours.", note: "говори́ть : deuxième conjugaison, radical stable" },
          ],
        },
        {
          kind: "pitfall",
          title: "L'infinitif ne prédit pas la conjugaison",
          body: [
            "Писа́ть et чита́ть se terminent tous deux par -ать, et ne se conjuguent pas pareil : чита́ю mais пишу́. Смотре́ть et хоте́ть se terminent en -еть, et l'un est régulier de 2ᵉ conjugaison, l'autre irrégulier.",
            "Il faut donc apprendre chaque verbe avec ses deux premières formes conjuguées, jamais avec le seul infinitif. C'est trois secondes de plus par verbe, et cela évite de reconstruire une conjugaison entière sur une hypothèse fausse.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Infinitifs en -ть, plus quelques -ти et -чь.",
            "Deux radicaux : présent d'un côté, passé et infinitif de l'autre.",
            "Apprendre chaque verbe avec я … et ты … .",
            "La finale de l'infinitif ne détermine pas la conjugaison.",
          ],
        },
      ],
      practice: [{ href: "/conjugation", label: "Les verbes en exercices" }],
    },
    {
      slug: "present-premiere-conjugaison",
      title: "Le présent : première conjugaison",
      titleRu: "Первое спряжение",
      level: "A1",
      minutes: 10,
      summary:
        "La conjugaison en -е- : чита́ю, чита́ешь, чита́ет. Elle couvre la majorité des verbes russes.",
      keywords: ["présent", "première conjugaison", "спряжение", "читать", "-ешь"],
      sections: [
        {
          kind: "table",
          title: "чита́ть — lire",
          head: ["Personne", "Forme", "Terminaison"],
          rows: [
            ["я", "чита́ю", "-ю"],
            ["ты", "чита́ешь", "-ешь"],
            ["он / она́", "чита́ет", "-ет"],
            ["мы", "чита́ем", "-ем"],
            ["вы", "чита́ете", "-ете"],
            ["они́", "чита́ют", "-ют"],
          ],
        },
        {
          kind: "prose",
          body: [
            "La marque de cette conjugaison est le -е- des terminaisons. Quand l'accent tombe sur la terminaison, ce -е- devient -ё- : живёшь, идёт, поймёте.",
            "Après une consonne, les terminaisons -ю et -ют s'écrivent -у et -ут : иду́, иду́т ; пишу́, пи́шут. C'est encore la règle orthographique, pas une conjugaison différente.",
          ],
        },
        {
          kind: "table",
          title: "Trois autres modèles fréquents",
          head: ["Verbe", "я", "ты", "они́"],
          rows: [
            ["жить (vivre)", "живу́", "живёшь", "живу́т"],
            ["идти́ (aller)", "иду́", "идёшь", "иду́т"],
            ["писа́ть (écrire)", "пишу́", "пи́шешь", "пи́шут"],
            ["рабо́тать (travailler)", "рабо́таю", "рабо́таешь", "рабо́тают"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я чита́ю кни́гу ка́ждый ве́чер.", fr: "Je lis un livre chaque soir." },
            { ru: "Где ты живёшь?", fr: "Où habites-tu ?" },
            { ru: "Они́ рабо́тают в ба́нке.", fr: "Ils travaillent dans une banque." },
            { ru: "Что ты пи́шешь?", fr: "Qu'est-ce que tu écris ?" },
          ],
        },
        {
          kind: "pitfall",
          title: "Le ё que personne n'imprime",
          body: [
            "La règle « -е- devient -ё- sous l'accent » est simple ; le problème est qu'on ne la voit jamais appliquée. Les textes russes — presse, romans, sous-titres, panneaux — écrivent е là où il faut lire ё : живёшь est imprimé живешь, идёт est imprimé идет, поёт est imprimé поет. Le tréma ne survit que dans les manuels, les dictionnaires et les livres pour enfants.",
            "Conséquence : la terminaison écrite -ешь ne dit pas où tombe l'accent. Qui lit « живешь » à la lettre accentue la première syllabe et produit un mot que personne ne reconnaît. Le réflexe à prendre : dans cette conjugaison, dès que l'accent est sur la terminaison, elle se lit -ёшь, -ёт, -ём, -ёте, quoi qu'en dise la page.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Voyelle caractéristique : -е-, qui devient -ё- sous l'accent.",
            "-ю/-ют après voyelle, -у/-ут après consonne.",
            "Le présent russe traduit aussi bien « je lis » que « je suis en train de lire ».",
            "Seuls les verbes imperfectifs ont un présent.",
          ],
        },
      ],
      practice: [{ href: "/conjugation/present1", label: "Exercice : la première conjugaison" }],
    },
    {
      slug: "present-deuxieme-conjugaison",
      title: "Le présent : deuxième conjugaison",
      titleRu: "Второе спряжение",
      level: "A1",
      minutes: 9,
      summary:
        "La conjugaison en -и- : говорю́, говори́шь, говоря́т. Moins nombreuse, mais pleine de verbes indispensables.",
      keywords: ["deuxième conjugaison", "говорить", "-ишь", "présent", "спряжение"],
      sections: [
        {
          kind: "table",
          title: "говори́ть — parler",
          head: ["Personne", "Forme", "Terminaison"],
          rows: [
            ["я", "говорю́", "-ю"],
            ["ты", "говори́шь", "-ишь"],
            ["он / она́", "говори́т", "-ит"],
            ["мы", "говори́м", "-им"],
            ["вы", "говори́те", "-ите"],
            ["они́", "говоря́т", "-ят"],
          ],
        },
        {
          kind: "prose",
          body: [
            "La marque est le -и- des terminaisons, et surtout la troisième personne du pluriel en -ят / -ат, qui distingue immédiatement les deux conjugaisons : чита́ют contre говоря́т.",
            "Cette conjugaison rassemble la plupart des verbes en -ить, plus une série de verbes en -еть et -ать qui s'y rattachent malgré leur infinitif : смотре́ть, ви́деть, слы́шать, лежа́ть, стоя́ть, боя́ться.",
          ],
        },
        {
          kind: "table",
          title: "Verbes très courants",
          head: ["Verbe", "я", "ты", "они́"],
          rows: [
            ["говори́ть (parler)", "говорю́", "говори́шь", "говоря́т"],
            ["смотре́ть (regarder)", "смотрю́", "смо́тришь", "смо́трят"],
            ["ви́деть (voir)", "ви́жу", "ви́дишь", "ви́дят"],
            ["люби́ть (aimer)", "люблю́", "лю́бишь", "лю́бят"],
            ["учи́ть (apprendre)", "учу́", "у́чишь", "у́чат"],
            ["слы́шать (entendre)", "слы́шу", "слы́шишь", "слы́шат"],
          ],
          note: "Après ж, ш, ч, щ : -ат au lieu de -ят, et -у au lieu de -ю (слы́шу, слы́шат).",
        },
        {
          kind: "examples",
          items: [
            { ru: "Вы говори́те по-ру́сски?", fr: "Parlez-vous russe ?" },
            { ru: "Я не ви́жу разни́цы.", fr: "Je ne vois pas la différence." },
            { ru: "Она́ лю́бит класси́ческую му́зыку.", fr: "Elle aime la musique classique." },
            { ru: "Мы смо́трим фильм.", fr: "Nous regardons un film." },
          ],
        },
        {
          kind: "pitfall",
          title: "Le л qui ne sort qu'à la première personne",
          body: [
            "Люби́ть fait люблю́, mais лю́бишь, лю́бит, лю́бим, лю́бите, лю́бят. Ce -л- surgit à la seule première personne du singulier, et seulement pour les radicaux terminés par б, п, в, ф ou м : купи́ть → куплю́, спать → сплю, гото́вить → гото́влю, корми́ть → кормлю́.",
            "L'erreur consiste à le généraliser — « они́ люблят » n'existe pas — et elle s'explique : le dictionnaire donne la première personne comme forme de référence, si bien qu'on la prend pour le modèle de toutes les autres. C'est ici la seule forme irrégulière du tableau.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Voyelle caractéristique : -и-, et -ят / -ат à la 3ᵉ personne du pluriel.",
            "La plupart des verbes en -ить, plus смотре́ть, ви́деть, слы́шать, стоя́ть.",
            "L'accent recule souvent après la 1ʳᵉ personne : смотрю́ mais смо́тришь.",
            "La 3ᵉ personne du pluriel est le test le plus rapide entre les deux conjugaisons.",
          ],
        },
      ],
      practice: [{ href: "/conjugation/present2", label: "Exercice : la deuxième conjugaison" }],
    },
    {
      slug: "alternances-consonantiques",
      title: "Les alternances de consonnes",
      titleRu: "Чередование согласных",
      level: "B1",
      minutes: 9,
      summary:
        "Писа́ть → пишу́, люби́ть → люблю́ : une consonne change dans le radical du présent, selon un jeu de correspondances fixe.",
      keywords: ["alternance", "чередование", "пишу", "люблю", "consonne", "мутация"],
      sections: [
        {
          kind: "prose",
          body: [
            "Certaines consonnes finales de radical se transforment devant les terminaisons du présent. Ce n'est pas aléatoire : chaque consonne a son partenaire attitré, et la liste tient en huit lignes.",
            "La différence essentielle : en 1ʳᵉ conjugaison, l'alternance touche TOUTES les personnes (пишу́, пи́шешь, пи́шут) ; en 2ᵉ conjugaison, elle ne touche QUE la première personne du singulier (люблю́ mais лю́бишь).",
          ],
        },
        {
          kind: "table",
          title: "Les correspondances",
          head: ["Devient", "Exemple", "Conjugaison"],
          rows: [
            ["с → ш", "писа́ть → пишу́", "1ʳᵉ, partout"],
            ["з → ж", "сказа́ть → скажу́", "1ʳᵉ, partout"],
            ["к → ч", "пла́кать → пла́чу", "1ʳᵉ, partout"],
            ["г → ж", "мочь → могу́ / мо́жешь", "1ʳᵉ"],
            ["т → ч", "плати́ть → плачу́", "2ᵉ, 1ʳᵉ pers. seulement"],
            ["д → ж", "ходи́ть → хожу́", "2ᵉ, 1ʳᵉ pers. seulement"],
            ["с → ш", "проси́ть → прошу́", "2ᵉ, 1ʳᵉ pers. seulement"],
            ["б → бл, п → пл, в → вл, м → мл", "люби́ть → люблю́, купи́ть → куплю́", "2ᵉ, 1ʳᵉ pers. seulement"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я хожу́ в бассе́йн два ра́за в неде́лю.", fr: "Je vais à la piscine deux fois par semaine.", note: "ходи́ть → хожу́, mais ты хо́дишь" },
            { ru: "Я прошу́ вас подожда́ть.", fr: "Je vous demande d'attendre." },
            { ru: "Я куплю́ хлеб по доро́ге.", fr: "J'achèterai du pain en chemin." },
            { ru: "Я пишу́ письмо́ дру́гу.", fr: "J'écris une lettre à un ami." },
          ],
        },
        {
          kind: "pitfall",
          title: "Пла́чу et плачу́",
          body: [
            "Пла́кать (pleurer) donne я пла́чу, et плати́ть (payer) donne я плачу́. Les deux formes s'écrivent identiquement et ne se distinguent que par l'accent.",
            "C'est l'exemple le plus cité de l'importance de l'accent russe — et l'un des rares cas où le contexte ne lève pas toujours l'ambiguïté à l'écrit.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "L'alternance est fixe : chaque consonne a son partenaire.",
            "1ʳᵉ conjugaison : elle touche toutes les personnes.",
            "2ᵉ conjugaison : elle ne touche que la 1ʳᵉ personne du singulier.",
            "Les labiales (б п в м) insèrent un л : люблю́, куплю́, ста́влю.",
          ],
        },
      ],
      practice: [{ href: "/conjugation/mutation", label: "Exercice : les alternances" }],
    },
    {
      slug: "verbes-irreguliers",
      title: "Les verbes irréguliers",
      titleRu: "Неправильные глаголы",
      level: "A2",
      minutes: 8,
      summary:
        "Ils sont une poignée — et ce sont exactement ceux dont on se sert tous les jours : хоте́ть, есть, дать, быть, идти́.",
      keywords: ["irrégulier", "хотеть", "есть", "дать", "быть", "бежать"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe a très peu de verbes vraiment irréguliers : moins d'une dizaine. Le revers, c'est qu'ils sont parmi les plus employés de la langue, et qu'ils mélangent souvent les deux conjugaisons dans le même paradigme.",
          ],
        },
        {
          kind: "table",
          title: "Les paradigmes à apprendre par cœur",
          head: ["Verbe", "я", "ты", "он", "мы", "вы", "они́"],
          rows: [
            ["хоте́ть (vouloir)", "хочу́", "хо́чешь", "хо́чет", "хоти́м", "хоти́те", "хотя́т"],
            ["есть (manger)", "ем", "ешь", "ест", "еди́м", "еди́те", "едя́т"],
            ["дать (donner)", "дам", "дашь", "даст", "дади́м", "дади́те", "даду́т"],
            ["бежа́ть (courir)", "бегу́", "бежи́шь", "бежи́т", "бежи́м", "бежи́те", "бегу́т"],
            ["идти́ (aller)", "иду́", "идёшь", "идёт", "идём", "идёте", "иду́т"],
          ],
          note: "хоте́ть et бежа́ть sont dits « mixtes » : singulier de 1ʳᵉ conjugaison, pluriel de 2ᵉ (ou l'inverse).",
        },
        {
          kind: "prose",
          title: "Быть, le cas à part",
          body: [
            "Быть n'a pas de présent, sauf la forme figée есть employée pour l'existence. Son futur, бу́ду / бу́дешь / бу́дет / бу́дем / бу́дете / бу́дут, sert aussi à former le futur de tous les verbes imperfectifs.",
            "Son passé est régulier : был, была́, бы́ло, бы́ли — avec un accent qui se déplace au féminin, comme dans beaucoup de verbes courts.",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я хочу́ есть.", fr: "J'ai faim.", note: "littéralement « je veux manger »" },
            { ru: "Что вы хоти́те?", fr: "Que voulez-vous ?" },
            { ru: "Да́йте мне, пожа́луйста, во́ду.", fr: "Donnez-moi de l'eau, s'il vous plaît." },
            { ru: "За́втра я бу́ду до́ма.", fr: "Demain je serai à la maison." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Moins de dix verbes vraiment irréguliers, tous ultra-fréquents.",
            "хоте́ть et бежа́ть mélangent les deux conjugaisons.",
            "есть (manger) et есть (il y a) sont deux mots différents.",
            "бу́ду sert de futur à быть et à tous les imperfectifs.",
          ],
        },
      ],
      practice: [{ href: "/conjugation", label: "Les verbes en exercices" }],
    },
    {
      slug: "verbes-reflechis",
      title: "Les verbes réfléchis en -ся",
      titleRu: "Возвратные глаголы",
      level: "A2",
      minutes: 9,
      summary:
        "Un suffixe collé après la terminaison, et cinq valeurs distinctes — dont le passif, que le français ne voit pas venir.",
      keywords: ["réfléchi", "-ся", "-сь", "возвратные", "учиться", "passif"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le suffixe -ся se place APRÈS la terminaison de personne : я учу́сь, ты у́чишься, он у́чится. Il s'écrit -сь après une voyelle et -ся après une consonne : учу́сь, но у́чится.",
            "Attention : un verbe en -ся ne peut jamais avoir d'objet direct à l'accusatif. C'est la conséquence directe de son origine (« soi-même » incorporé au verbe), et c'est le test le plus fiable pour savoir si нача́ть ou нача́ться convient.",
          ],
        },
        {
          kind: "table",
          title: "Cinq valeurs, un seul suffixe",
          head: ["Valeur", "Exemple", "Traduction"],
          rows: [
            ["Réfléchie", "Он мо́ется.", "Il se lave."],
            ["Réciproque", "Они́ встреча́ются.", "Ils se rencontrent."],
            ["Passive", "Дом стро́ится.", "La maison est en construction."],
            ["Intransitive", "Дверь открыва́ется.", "La porte s'ouvre."],
            ["Lexicalisée", "Он смеётся. / Я боя́лся.", "Il rit. / J'avais peur."],
          ],
          note: "La dernière catégorie n'a plus rien de réfléchi : смея́ться, боя́ться, наде́яться, стара́ться n'existent qu'en -ся.",
        },
        {
          kind: "examples",
          title: "La paire transitive / intransitive",
          items: [
            { ru: "Я начина́ю уро́к.", fr: "Je commence le cours.", note: "objet direct : sans -ся" },
            { ru: "Уро́к начина́ется.", fr: "Le cours commence.", note: "pas d'objet : avec -ся" },
            { ru: "Он откры́л дверь.", fr: "Il a ouvert la porte." },
            { ru: "Дверь откры́лась.", fr: "La porte s'est ouverte." },
            { ru: "Я учу́ ру́сский язы́к.", fr: "J'apprends le russe.", note: "учи́ть + accusatif" },
            { ru: "Я учу́сь в университе́те.", fr: "J'étudie à l'université.", note: "учи́ться : pas d'objet, on dit où" },
          ],
        },
        {
          kind: "pitfall",
          title: "Учи́ть, учи́ться, изуча́ть",
          body: [
            "Учи́ть + accusatif = apprendre par cœur, ou enseigner à quelqu'un. Учи́ться = être élève quelque part, ou apprendre à faire (+ infinitif). Изуча́ть + accusatif = étudier une matière de façon approfondie.",
            "« J'apprends le russe » se dit donc Я учу́ ру́сский (je le travaille) ou Я изуча́ю ру́сский (je l'étudie), mais jamais « Я учу́сь ру́сский » — учи́ться ne prend pas d'objet direct.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "-ся après consonne, -сь après voyelle, toujours en dernier.",
            "Un verbe en -ся n'a jamais d'objet direct.",
            "Cinq valeurs : réfléchie, réciproque, passive, intransitive, lexicalisée.",
            "Beaucoup de paires : начина́ть / начина́ться, открыва́ть / открыва́ться.",
          ],
        },
      ],
    },
    {
      slug: "passe",
      title: "Le passé",
      titleRu: "Прошедшее время",
      level: "A1",
      minutes: 9,
      summary:
        "Le temps le plus simple du russe : il ne connaît pas les personnes, seulement le genre et le nombre.",
      keywords: ["passé", "прошедшее", "-л", "была", "genre", "шёл"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le passé russe ne se conjugue pas selon la personne. Il s'accorde comme un adjectif : masculin, féminin, neutre, pluriel. Я чита́л et ты чита́л sont identiques si les deux sont des hommes ; c'est le pronom qui distingue la personne.",
            "Formation : on retire -ть de l'infinitif et on ajoute -л, -ла, -ло, -ли. чита́ть → чита́л, чита́ла, чита́ло, чита́ли.",
          ],
        },
        {
          kind: "table",
          title: "Accord du passé",
          head: ["Sujet", "Forme", "Exemple"],
          rows: [
            ["masculin", "-л", "Он рабо́тал."],
            ["féminin", "-ла", "Она́ рабо́тала."],
            ["neutre", "-ло", "Всё рабо́тало."],
            ["pluriel", "-ли", "Они́ рабо́тали."],
            ["вы (politesse)", "-ли", "Вы рабо́тали."],
          ],
          note: "Même pour une seule personne vouvoyée, le passé se met au pluriel : Вы чита́ли.",
        },
        {
          kind: "table",
          title: "Les passés irréguliers fréquents",
          head: ["Infinitif", "Masculin", "Féminin", "Pluriel"],
          rows: [
            ["идти́ (aller)", "шёл", "шла", "шли"],
            ["мочь (pouvoir)", "мог", "могла́", "могли́"],
            ["нести́ (porter)", "нёс", "несла́", "несли́"],
            ["есть (manger)", "ел", "е́ла", "е́ли"],
            ["умере́ть (mourir)", "у́мер", "умерла́", "у́мерли"],
          ],
          note: "Les verbes dont le radical finit par une consonne perdent le -л au masculin : мог, нёс, вёз.",
        },
        {
          kind: "examples",
          items: [
            { ru: "Вчера́ я был в теа́тре.", fr: "Hier, j'étais au théâtre.", note: "un homme" },
            { ru: "Вчера́ я была́ в теа́тре.", fr: "Hier, j'étais au théâtre.", note: "une femme — l'accent se déplace" },
            { ru: "Мы до́лго говори́ли.", fr: "Nous avons longtemps parlé." },
            { ru: "Она́ не поняла́ вопро́с.", fr: "Elle n'a pas compris la question." },
          ],
        },
        {
          kind: "pitfall",
          title: "L'accent du féminin",
          body: [
            "Dans beaucoup de verbes courts, le féminin déplace l'accent sur la terminaison : был / была́, взял / взяла́, по́нял / поняла́, на́чал / начала́, жил / жила́.",
            "C'est l'un des rares endroits où un accent mal placé s'entend immédiatement comme une faute. Le neutre et le pluriel, eux, gardent l'accent du masculin : бы́ло, бы́ли.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le passé s'accorde en genre et en nombre, pas en personne.",
            "-л, -ла, -ло, -ли, à partir de l'infinitif sans -ть.",
            "Вы entraîne toujours le pluriel, même pour une personne.",
            "Le féminin déplace souvent l'accent : была́, поняла́.",
          ],
        },
      ],
      practice: [
        { href: "/conjugation/past", label: "Exercice : former le passé" },
        { href: "/aspect/past", label: "Exercice : l'aspect au passé" },
      ],
    },
    {
      slug: "futur",
      title: "Le futur",
      titleRu: "Будущее время",
      level: "A2",
      minutes: 8,
      summary:
        "Deux futurs : composé pour l'imperfectif (бу́ду чита́ть), simple pour le perfectif (прочита́ю). Le choix est celui de l'aspect.",
      keywords: ["futur", "будущее", "буду", "перфектив", "прочитаю"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe forme son futur de deux façons, selon l'aspect du verbe. Un verbe imperfectif prend un auxiliaire : бу́ду + infinitif. Un verbe perfectif n'en prend aucun : ses formes de présent ONT une valeur de futur.",
            "Autrement dit, прочита́ю ressemble à un présent et signifie « je lirai (jusqu'au bout) ». Un perfectif ne peut jamais désigner le présent — c'est ce qui libère ses formes pour le futur.",
          ],
        },
        {
          kind: "table",
          title: "Les deux futurs",
          head: ["Aspect", "Formation", "Exemple", "Sens"],
          rows: [
            ["Imperfectif", "бу́ду + infinitif", "Я бу́ду чита́ть.", "je vais lire, je lirai (activité)"],
            ["Perfectif", "formes de présent", "Я прочита́ю.", "je lirai (et je finirai)"],
          ],
        },
        {
          kind: "table",
          title: "бу́ду, l'auxiliaire",
          head: ["Personne", "Forme"],
          rows: [
            ["я", "бу́ду"],
            ["ты", "бу́дешь"],
            ["он / она́", "бу́дет"],
            ["мы", "бу́дем"],
            ["вы", "бу́дете"],
            ["они́", "бу́дут"],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "За́втра я бу́ду рабо́тать весь день.", fr: "Demain, je travaillerai toute la journée.", note: "activité, durée : imperfectif" },
            { ru: "Я сде́лаю э́то за час.", fr: "Je le ferai en une heure.", note: "résultat, délai : perfectif" },
            { ru: "Мы бу́дем ждать вас у вхо́да.", fr: "Nous vous attendrons à l'entrée." },
            { ru: "Он позвони́т тебе́ ве́чером.", fr: "Il t'appellera ce soir." },
          ],
        },
        {
          kind: "pitfall",
          title: "Бу́ду + perfectif est impossible",
          body: [
            "On ne dit jamais « бу́ду прочита́ть ». L'auxiliaire бу́ду ne se combine qu'avec un infinitif imperfectif — la combinaison avec un perfectif n'a aucun sens, puisque celui-ci porte déjà le futur.",
            "L'erreur vient du français, qui a un seul futur et le construit avec un auxiliaire dans « je vais faire ». En russe, choisir le futur, c'est d'abord choisir l'aspect.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Imperfectif : бу́ду + infinitif imperfectif.",
            "Perfectif : les formes de présent valent futur.",
            "Un perfectif n'a jamais de sens présent.",
            "бу́ду ne se combine jamais avec un infinitif perfectif.",
          ],
        },
      ],
      practice: [{ href: "/aspect/future", label: "Exercice : l'aspect au futur" }],
    },
    {
      slug: "imperatif",
      title: "L'impératif",
      titleRu: "Повелительное наклонение",
      level: "A2",
      minutes: 9,
      summary:
        "Deux formes, tutoiement et vouvoiement, dérivées de la troisième personne du pluriel — et un aspect qui change la politesse.",
      keywords: ["impératif", "повелительное", "читай", "скажите", "давайте", "ordre"],
      sections: [
        {
          kind: "prose",
          body: [
            "L'impératif se construit sur le radical de la 3ᵉ personne du pluriel. On retire la terminaison, et on regarde ce qui reste : si le radical finit par une voyelle, on ajoute -й ; s'il finit par une consonne, on ajoute -и (accentué) ou -ь.",
            "La forme de politesse ou de pluriel ajoute simplement -те : чита́й → чита́йте, скажи́ → скажи́те.",
          ],
        },
        {
          kind: "table",
          title: "Formation",
          head: ["Verbe", "они́", "Radical", "Impératif ты", "Impératif вы"],
          rows: [
            ["чита́ть", "чита́ют", "чита́-", "чита́й", "чита́йте"],
            ["сказа́ть", "ска́жут", "скаж-", "скажи́", "скажи́те"],
            ["говори́ть", "говоря́т", "говор-", "говори́", "говори́те"],
            ["быть", "—", "буд-", "будь", "бу́дьте"],
            ["дать", "даду́т", "дад-", "дай", "да́йте"],
          ],
        },
        {
          kind: "prose",
          title: "L'aspect change le ton",
          body: [
            "Un impératif perfectif demande un acte précis : Закро́й окно́ (ferme la fenêtre). Un impératif imperfectif invite, encourage, ou insiste : Закрыва́й! sonne comme « allez, ferme ».",
            "À la forme négative, le rapport s'inverse et devient une règle stricte : l'interdiction se dit à l'imperfectif (Не закрыва́й окно́ = ne ferme pas la fenêtre), tandis que le perfectif nié devient un avertissement (Не закро́й окно́! = attention à ne pas fermer la fenêtre par mégarde).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Скажи́те, пожа́луйста, где метро́?", fr: "Dites-moi, s'il vous plaît, où est le métro ?" },
            { ru: "Не волну́йтесь.", fr: "Ne vous inquiétez pas.", note: "interdiction : imperfectif" },
            { ru: "Дава́й пойдём в кино́.", fr: "Allons au cinéma.", note: "дава́й + futur perfectif : proposition" },
            { ru: "Дава́йте начнём.", fr: "Commençons." },
            { ru: "Пусть он придёт за́втра.", fr: "Qu'il vienne demain.", note: "пусть pour la 3ᵉ personne" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Radical de они́ + -й / -и / -ь, puis -те pour вы.",
            "Impératif perfectif : un acte précis. Imperfectif : une invitation ou une insistance.",
            "Interdiction : toujours imperfectif (Не де́лай э́того).",
            "дава́й / дава́йте pour « allons », пусть pour la 3ᵉ personne.",
          ],
        },
      ],
      practice: [
        { href: "/conjugation/imperative", label: "Exercice : former l'impératif" },
        { href: "/aspect/imperative", label: "Exercice : l'aspect à l'impératif" },
      ],
    },
    {
      slug: "conditionnel",
      title: "Le conditionnel avec бы",
      titleRu: "Сослагательное наклонение",
      level: "B1",
      minutes: 8,
      summary:
        "Une particule, бы, posée à côté d'un verbe au passé : c'est tout le conditionnel russe, pour le présent comme pour le passé.",
      keywords: ["conditionnel", "бы", "сослагательное", "если бы", "hypothèse"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe n'a pas de temps conditionnel. Il ajoute la particule бы à une forme de passé, et cela suffit : Я хоте́л бы (je voudrais), Я пошёл бы (j'irais ou je serais allé).",
            "Le russe ne distingue pas le conditionnel présent du conditionnel passé : la même forme dit « j'irais » et « je serais allé ». C'est le contexte qui tranche, et le russe s'en accommode sans ambiguïté ressentie.",
          ],
        },
        {
          kind: "prose",
          title: "La phrase hypothétique",
          body: [
            "Dans une hypothèse irréelle, бы apparaît DANS LES DEUX propositions : Е́сли бы у меня́ бы́ло вре́мя, я бы пришёл (si j'avais le temps, je viendrais / si j'avais eu le temps, je serais venu).",
            "Attention à ne pas confondre avec l'hypothèse réelle, qui n'a pas de бы et se met au futur : Е́сли у меня́ бу́дет вре́мя, я приду́ (si j'ai le temps, je viendrai).",
          ],
        },
        {
          kind: "table",
          title: "Réel contre irréel",
          head: ["Type", "Construction", "Exemple"],
          rows: [
            ["Réel (ça peut arriver)", "е́сли + futur, futur", "Е́сли бу́дет вре́мя, я приду́."],
            ["Irréel (ça n'arrivera pas)", "е́сли бы + passé, бы + passé", "Е́сли бы бы́ло вре́мя, я бы пришёл."],
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Я хоте́л бы заказа́ть сто́лик.", fr: "Je voudrais réserver une table.", note: "politesse : le conditionnel adoucit" },
            { ru: "Не могли́ бы вы помо́чь?", fr: "Pourriez-vous m'aider ?" },
            { ru: "На твоём ме́сте я бы согласи́лся.", fr: "À ta place, j'accepterais." },
            { ru: "Я хочу́, что́бы ты пришёл.", fr: "Je veux que tu viennes.", note: "что́бы = что + бы, suivi du passé" },
          ],
        },
        {
          kind: "pitfall",
          title: "Что́бы est suivi du passé",
          body: [
            "Après что́бы, le verbe se met au passé, quel que soit le temps de la phrase : Я хочу́, что́бы ты пришёл. Ce « passé » n'a aucune valeur temporelle — c'est la forme qu'impose бы, caché dans что́бы.",
            "Si les deux propositions ont le même sujet, что́бы est suivi de l'infinitif : Я пришёл, что́бы поговори́ть с тобо́й.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "бы + passé, pour le conditionnel présent comme passé.",
            "бы est mobile : Я бы пошёл, Пошёл бы я…",
            "Hypothèse irréelle : бы dans les deux propositions.",
            "что́бы + passé (sujets différents) ou + infinitif (même sujet).",
          ],
        },
      ],
    },
    {
      slug: "constructions-impersonnelles-modales",
      title: "Pouvoir, devoir, falloir",
      titleRu: "Модальные конструкции",
      level: "B1",
      minutes: 9,
      summary:
        "Мо́жно, на́до, ну́жно, нельзя́ : la modalité russe passe souvent par un mot invariable et un datif, sans aucun verbe conjugué.",
      keywords: ["можно", "надо", "нужно", "нельзя", "должен", "modal", "impersonnel"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le français conjugue « pouvoir » et « devoir ». Le russe emploie le plus souvent un mot invariable, suivi d'un infinitif, avec la personne concernée au datif. Мне на́до рабо́тать : il n'y a ni sujet ni verbe conjugué, seulement на́до.",
            "Le temps se marque en ajoutant бы́ло (passé) ou бу́дет (futur) : Мне на́до бы́ло рабо́тать, Мне на́до бу́дет рабо́тать.",
          ],
        },
        {
          kind: "table",
          title: "Les mots de la modalité",
          head: ["Mot", "Sens", "Construction", "Exemple"],
          rows: [
            ["мо́жно", "on peut, c'est permis", "datif + infinitif", "Мо́жно войти́?"],
            ["нельзя́", "on ne peut pas, interdit", "datif + infinitif", "Здесь нельзя́ кури́ть."],
            ["на́до / ну́жно", "il faut", "datif + infinitif", "Мне на́до идти́."],
            ["ну́жен", "il faut (un objet)", "datif + nominatif accordé", "Мне нужна́ по́мощь."],
            ["до́лжен", "devoir (obligation personnelle)", "sujet nominatif + infinitif", "Ты до́лжен позвони́ть."],
            ["мочь", "pouvoir (capacité)", "verbe conjugué + infinitif", "Я не могу́ прийти́."],
          ],
        },
        {
          kind: "prose",
          title: "Мочь ou мо́жно ?",
          body: [
            "Мочь exprime la capacité physique ou la possibilité concrète pour quelqu'un : Я не могу́ подня́ть э́то (je n'arrive pas à soulever ça). Мо́жно exprime la permission ou la possibilité en général : Здесь мо́жно кури́ть (ici, on a le droit de fumer).",
            "De même, нельзя́ dit à la fois l'interdiction (avec un imperfectif : Нельзя́ кури́ть = c'est interdit) et l'impossibilité (avec un perfectif : Нельзя́ откры́ть э́ту дверь = impossible d'ouvrir cette porte).",
          ],
        },
        {
          kind: "examples",
          items: [
            { ru: "Мне ну́жно купи́ть биле́ты.", fr: "Je dois acheter des billets." },
            { ru: "Мо́жно вопро́с?", fr: "Puis-je poser une question ?" },
            { ru: "Здесь нельзя́ паркова́ться.", fr: "Il est interdit de se garer ici." },
            { ru: "Ей на́до бы́ло уйти́ ра́ньше.", fr: "Elle a dû partir plus tôt." },
            { ru: "Ты не до́лжен так говори́ть.", fr: "Tu ne devrais pas parler ainsi." },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "мо́жно, нельзя́, на́до, ну́жно : invariables, avec datif + infinitif.",
            "Temps marqué par бы́ло / бу́дет.",
            "ну́жен s'accorde avec la chose nécessaire, pas avec la personne.",
            "до́лжен a un sujet au nominatif et s'accorde comme un adjectif court.",
          ],
        },
      ],
    },
  ],
};
