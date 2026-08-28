import type { Unit } from "../types";

/**
 * Unité 1 — ce qu'il faut avoir réglé avant toute grammaire : lire, écrire,
 * placer l'accent, entendre ce qui est réellement prononcé.
 */
export const UNIT_ECRITURE: Unit = {
  slug: "ecriture-et-sons",
  title: "Écriture et sons",
  titleRu: "Письмо и звуки",
  subtitle:
    "Lire le cyrillique en deux heures, puis comprendre pourquoi ce qu'on entend ne ressemble pas à ce qui est écrit.",
  color: "#4a63d6",
  lessons: [
    {
      slug: "alphabet-cyrillique",
      title: "L'alphabet cyrillique",
      titleRu: "Кириллица",
      level: "A0",
      minutes: 12,
      summary:
        "Les 33 lettres, rangées en trois familles : celles qu'on sait déjà lire, celles qui trompent, celles qui sont nouvelles.",
      keywords: ["alphabet", "cyrillique", "lettres", "кириллица", "lire", "азбука"],
      seo: {
        title: "L'alphabet russe et sa prononciation : les 33 lettres",
        description:
          "Les 33 lettres du cyrillique, leur nom, leur prononciation et un mot témoin pour " +
          "chacune — dont les six qui ressemblent à des lettres latines et se lisent autrement.",
      },
      sections: [
        {
          kind: "prose",
          body: [
            "L'alphabet russe compte 33 lettres. C'est la seule liste de ce cours qu'il faut apprendre par cœur, et elle se retient en une soirée si on la range correctement : dix lettres se lisent comme en français, une dizaine ressemblent à des lettres latines mais se prononcent autrement, et le reste est franchement nouveau.",
            "Le cyrillique n'est pas un code secret posé sur du français : c'est une écriture alphabétique, presque phonétique, où chaque lettre note un son. Une fois les 33 correspondances acquises, tout mot russe écrit est lisible à voix haute, y compris un mot inconnu — ce qui est loin d'être vrai dans l'autre sens pour un Russe qui découvre « oiseaux ».",
          ],
        },
        {
          kind: "table",
          title: "Les 33 lettres",
          head: ["Lettre", "Nom", "Se prononce", "Exemple"],
          rows: [
            ["А а", "а", "a de patte", "ма́ма — maman"],
            ["Б б", "бэ", "b", "брат — frère"],
            ["В в", "вэ", "v", "вода́ — eau"],
            ["Г г", "гэ", "g de gare", "год — année"],
            ["Д д", "дэ", "d", "дом — maison"],
            ["Е е", "е", "ié", "ме́сто — place"],
            ["Ё ё", "ё", "io, toujours accentué", "ёлка — sapin"],
            ["Ж ж", "жэ", "j de jour", "жена́ — épouse"],
            ["З з", "зэ", "z", "зима́ — hiver"],
            ["И и", "и", "i", "и́мя — prénom"],
            ["Й й", "и краткое", "y de yaourt", "мой — mon"],
            ["К к", "ка", "k", "кни́га — livre"],
            ["Л л", "эль", "l", "луна́ — lune"],
            ["М м", "эм", "m", "мо́ре — mer"],
            ["Н н", "эн", "n", "нос — nez"],
            ["О о", "о", "o de porte", "о́кна — fenêtres"],
            ["П п", "пэ", "p", "план — plan"],
            ["Р р", "эр", "r roulé", "рука́ — main"],
            ["С с", "эс", "s de sac", "сын — fils"],
            ["Т т", "тэ", "t", "там — là-bas"],
            ["У у", "у", "ou", "у́тро — matin"],
            ["Ф ф", "эф", "f", "фильм — film"],
            ["Х х", "ха", "kh, la jota espagnole", "хлеб — pain"],
            ["Ц ц", "цэ", "ts", "центр — centre"],
            ["Ч ч", "че", "tch", "час — heure"],
            ["Ш ш", "ша", "ch de chat, dur", "шко́ла — école"],
            ["Щ щ", "ща", "chch, mouillé", "щи — soupe aux choux"],
            ["Ъ ъ", "твёрдый знак", "aucun son", "объе́кт — objet"],
            ["Ы ы", "ы", "i guttural, sans équivalent", "ты — toi"],
            ["Ь ь", "мя́гкий знак", "aucun son", "соль — sel"],
            ["Э э", "э", "è de mère", "э́то — ceci"],
            ["Ю ю", "ю", "iou", "юг — sud"],
            ["Я я", "я", "ia", "я — je"],
          ],
          note: "L'accent aigu marque la syllabe accentuée. Il n'apparaît jamais dans un texte russe réel : c'est un outil d'apprentissage, comme les points sur les i d'un manuel d'écriture.",
        },
        {
          kind: "prose",
          title: "Trois familles",
          body: [
            "FAMILLE 1, les gratuites : А, К, М, О, Т se lisent exactement comme en français, à la forme près. Ajoutez-y Е, qui vaut « ié ».",
            "FAMILLE 2, les pièges : В se lit v, Н se lit n, Р se lit r, С se lit s, У se lit ou, Х se lit kh. Ce sont elles qui font lire « ресторан » comme un mot inconnu alors qu'il dit « restaurant ». Une leçon entière leur est consacrée juste après.",
            "FAMILLE 3, les nouvelles : Б, Г, Д, Ж, З, И, Й, Л, П, Ф, Ц, Ч, Ш, Щ, Ъ, Ы, Ь, Э, Ю, Я. Elles n'évoquent rien, donc elles ne trompent pas — c'est paradoxalement la famille la plus facile.",
          ],
        },
        {
          kind: "examples",
          title: "Des mots lisibles dès aujourd'hui",
          items: [
            { ru: "рестора́н", fr: "restaurant", note: "р-е-с-т-о-р-а-н" },
            { ru: "теа́тр", fr: "théâtre" },
            { ru: "метро́", fr: "métro" },
            { ru: "па́спорт", fr: "passeport" },
            { ru: "телефо́н", fr: "téléphone" },
            { ru: "шокола́д", fr: "chocolat" },
          ],
        },
        {
          kind: "keypoints",
          items: [
            "33 lettres, une lettre = un son : tout mot écrit est prononçable.",
            "Ъ et Ь ne notent aucun son ; ils modifient la consonne qui précède.",
            "Ё est toujours accentué — et souvent imprimé « е » dans les textes réels.",
            "Commencez par lire des emprunts internationaux : le sens est offert, seul le déchiffrage travaille.",
          ],
        },
      ],
    },
    {
      slug: "faux-amis-de-l-alphabet",
      title: "Les lettres qui trompent",
      titleRu: "Ложные друзья алфавита",
      level: "A0",
      minutes: 7,
      summary:
        "В, Н, Р, С, У, Х ressemblent à des lettres latines et se lisent tout autrement. C'est la seule source d'erreur durable en lecture.",
      keywords: ["faux amis", "lecture", "В", "Н", "Р", "С", "У", "Х", "confusion"],
      seo: {
        title: "Les 6 lettres russes qui trompent : В, Н, Р, С, У, Х",
        description:
          "Elles s'écrivent comme des lettres latines et se prononcent v, n, r, s, ou et kh. " +
          "C'est la seule source d'erreur durable quand on apprend à lire le russe.",
      },
      sections: [
        {
          kind: "prose",
          body: [
            "Un francophone qui apprend le cyrillique n'oublie pas les lettres nouvelles : il n'a rien à désapprendre pour Щ ou Ж. Ce qu'il n'arrive pas à corriger, ce sont les six lettres qui existent aussi en alphabet latin avec une autre valeur. L'œil les reconnaît avant que le cerveau n'ait le temps d'intervenir.",
            "La parade est mécanique : chaque fois qu'une de ces six lettres apparaît, il faut ralentir et l'épeler. Trois semaines de ce régime suffisent à retourner l'automatisme.",
          ],
        },
        {
          kind: "table",
          title: "Les six pièges",
          head: ["Lettre", "L'œil lit", "Il faut lire", "Mot témoin"],
          rows: [
            ["В в", "b", "v", "во́дка — vodka"],
            ["Н н", "h", "n", "но́мер — numéro"],
            ["Р р", "p", "r", "Росси́я — Russie"],
            ["С с", "c", "s", "суп — soupe"],
            ["У у", "y", "ou", "у́лица — rue"],
            ["Х х", "x", "kh", "хорошо́ — bien"],
          ],
        },
        {
          kind: "examples",
          title: "Le test",
          items: [
            { ru: "суп", fr: "soupe", note: "et non « cyn »" },
            { ru: "ресторан", fr: "restaurant", note: "et non « pectopah »" },
            { ru: "новость", fr: "nouvelle, information", note: "et non « hoboctb »" },
            { ru: "вход", fr: "entrée", note: "v-kh-o-d ; le panneau qu'on lit le plus souvent" },
            { ru: "выход", fr: "sortie", note: "l'autre panneau" },
          ],
        },
        {
          kind: "pitfall",
          title: "Le piège de la troisième semaine",
          body: [
            "Au bout de quelques jours, la lecture devient fluide sur les mots connus — et c'est là que les faux amis reviennent, parce qu'on ne déchiffre plus, on reconnaît la silhouette du mot. « Ресторан » lu de loin redevient « pectopah ».",
            "Le remède : lire à voix haute. La bouche, elle, ne triche pas ; elle bute là où l'œil a glissé.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Six lettres seulement posent problème : В Н Р С У Х.",
            "Р est un r roulé, jamais un p.",
            "Х n'est pas un x : c'est le son de « jota », entre k et h.",
            "Lire à voix haute est le seul correcteur fiable des premières semaines.",
          ],
        },
      ],
    },
    {
      slug: "voyelles-dures-et-molles",
      title: "Voyelles dures et molles",
      titleRu: "Твёрдые и мягкие гласные",
      level: "A0",
      minutes: 10,
      summary:
        "Dix voyelles rangées en cinq paires. La deuxième série ne note pas un autre son : elle dit ce que fait la consonne d'avant.",
      keywords: ["voyelles", "mouillure", "palatalisation", "dur", "mou", "я", "ё", "ю", "е", "и"],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe a cinq sons voyelles et dix lettres pour les noter. Ce n'est pas un gaspillage : la seconde série porte une information supplémentaire, et cette information est le cœur de la phonétique russe.",
            "Une consonne russe existe en deux versions : dure (prononcée normalement) et molle, ou mouillée (prononcée avec le dos de la langue relevé vers le palais, comme si un i minuscule s'y glissait). La voyelle qui suit indique laquelle des deux versions il faut employer.",
          ],
        },
        {
          kind: "table",
          title: "Les cinq paires",
          head: ["Dure", "Molle", "Son", "Après consonne", "En début de mot ou après voyelle"],
          rows: [
            ["а", "я", "a", "consonne mouillée + a", "ya"],
            ["о", "ё", "o", "consonne mouillée + o", "yo"],
            ["у", "ю", "ou", "consonne mouillée + ou", "you"],
            ["э", "е", "è", "consonne mouillée + è", "yé"],
            ["ы", "и", "i", "consonne mouillée + i", "i"],
          ],
        },
        {
          kind: "examples",
          title: "La différence s'entend, et elle change le mot",
          items: [
            { ru: "мать", fr: "mère", note: "м dur" },
            { ru: "мять", fr: "froisser", note: "м mouillé — même voyelle a, autre consonne" },
            { ru: "нос", fr: "nez", note: "н dur" },
            { ru: "нёс", fr: "il portait", note: "н mouillé" },
            { ru: "лук", fr: "oignon" },
            { ru: "люк", fr: "trappe" },
          ],
        },
        {
          kind: "prose",
          title: "Le double emploi de я, ё, ю, е",
          body: [
            "Ces quatre lettres notent deux choses selon leur position. Après une consonne, elles la mouillent : « мя » se lit « mia » d'un seul bloc, jamais « mi-a ». En début de mot, après une voyelle ou après ь / ъ, elles valent deux sons, un yod suivi de la voyelle : я = ya, ёж = yoj, юг = youg, ель = yèl'.",
            "И ne mouille pas moins que les autres, mais son partenaire dur ы est un son que le français ignore complètement : un i prononcé la langue tirée en arrière, quelque part entre i et ou. Il ne s'obtient pas par imitation immédiate ; il faut l'écouter beaucoup.",
          ],
        },
        {
          kind: "pitfall",
          title: "Ne pas entendre la mouillure",
          body: [
            "Le français ne distingue pas /n/ de /nʲ/ : pour une oreille française, мать et мять sonnent d'abord identiques. Tant que la distinction n'est pas installée, on écrira les mots comme on croit les entendre, avec une lettre sur deux fausse.",
            "L'exercice qui marche : prononcer « ni » de « panier », puis garder cette position de langue et dire « na », « no », « nou ». C'est exactement ня, нё, ню.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Cinq voyelles, dix lettres : la seconde série décrit la consonne précédente.",
            "я ё ю е après consonne = mouillure ; en début de mot = yod + voyelle.",
            "La mouillure distingue des mots entiers : мать ≠ мять.",
            "ы n'a pas d'équivalent français : à travailler à l'oreille, pas par la description.",
          ],
        },
      ],
    },
    {
      slug: "accent-tonique",
      title: "L'accent tonique",
      titleRu: "Ударение",
      level: "A0",
      minutes: 9,
      summary:
        "Il tombe où il veut, il bouge d'une forme à l'autre, il n'est jamais écrit — et il décide de la prononciation de toutes les autres voyelles du mot.",
      keywords: ["accent", "ударение", "tonique", "prononciation", "замок", "мука"],
      seo: {
        title: "L'accent tonique russe : la clé de toute la prononciation",
        description:
          "Il n'est jamais écrit, il se déplace, et il décide du son de toutes les autres " +
          "voyelles du mot. За́мок et замо́к ne veulent pas dire la même chose.",
      },
      sections: [
        {
          kind: "prose",
          body: [
            "En français, l'accent tombe sur la dernière syllabe du groupe et n'a aucune conséquence : c'est une question de rythme, pas de sens. En russe, il est libre — il peut frapper n'importe quelle syllabe du mot — et il est mobile : il se déplace quand le mot change de forme.",
            "Surtout, il commande toute la prononciation. Une voyelle accentuée est prononcée pleinement ; toutes les autres sont réduites, parfois jusqu'à devenir méconnaissables. Se tromper d'accent ne donne donc pas un mot mal accentué : ça donne un mot où toutes les voyelles sont fausses.",
          ],
        },
        {
          kind: "examples",
          title: "Quand l'accent fait le sens",
          items: [
            { ru: "за́мок", fr: "château", note: "accent sur la 1ʳᵉ syllabe" },
            { ru: "замо́к", fr: "serrure", note: "même orthographe, autre mot" },
            { ru: "мука́", fr: "farine" },
            { ru: "му́ка", fr: "supplice" },
            { ru: "пла́чу", fr: "je pleure" },
            { ru: "плачу́", fr: "je paie" },
          ],
        },
        {
          kind: "prose",
          title: "Un accent qui bouge",
          body: [
            "L'accent peut changer de place entre le singulier et le pluriel, entre le nominatif et les autres cas, entre le masculin et le féminin du passé. Ce n'est pas une irrégularité rare : cela concerne des centaines de mots parmi les plus courants.",
            "Il n'y a pas de règle générale à apprendre. L'accent fait partie du mot, comme le genre : on l'apprend avec lui, et c'est pour cela que tout le vocabulaire de ce site est accentué.",
          ],
        },
        {
          kind: "table",
          title: "Déplacements typiques",
          head: ["Forme 1", "Forme 2", "Ce qui bouge"],
          rows: [
            ["рука́ (main)", "ру́ки (mains)", "singulier → pluriel"],
            ["вода́ (eau)", "во́ду (accusatif)", "nominatif → accusatif"],
            ["по́нял (il a compris)", "поняла́ (elle a compris)", "masculin → féminin au passé"],
            ["дом (maison)", "дома́ (maisons)", "pluriel en -а́ accentué"],
            ["окно́ (fenêtre)", "о́кна (fenêtres)", "l'accent recule au pluriel"],
          ],
        },
        {
          kind: "pitfall",
          title: "Ё est toujours accentué",
          body: [
            "La lettre ё porte l'accent par définition : un mot qui contient ё est accentué sur ce ё. C'est la seule information d'accent que l'orthographe donne gratuitement.",
            "Problème : dans les textes russes courants, ё est presque toujours imprimé « е ». Un mot inconnu écrit « все » peut donc être всё (tout). Les dictionnaires et les manuels, eux, gardent le tréma.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "L'accent est libre, mobile, jamais noté dans un texte réel.",
            "Il conditionne la prononciation de toutes les voyelles du mot.",
            "Il distingue des paires de mots entières : за́мок / замо́к.",
            "On apprend chaque mot avec son accent, comme on l'apprend avec son genre.",
          ],
        },
      ],
    },
    {
      slug: "reduction-des-voyelles",
      title: "La réduction des voyelles",
      titleRu: "Редукция гласных",
      level: "A0",
      minutes: 9,
      summary:
        "Pourquoi « молоко́ » se dit « malako », « сейча́с » se dit « sitchas », et pourquoi c'est en réalité une bonne nouvelle.",
      keywords: ["réduction", "аканье", "иканье", "prononciation", "молоко", "voyelles atones"],
      seo: {
        title: "Prononciation du russe : la réduction des voyelles atones",
        description:
          "Pourquoi молоко́ se prononce « malako » et сейча́с « sitchas ». Les règles de " +
          "l'аканье et de l'иканье, sans exception — et pourquoi c'est une bonne nouvelle.",
      },
      sections: [
        {
          kind: "prose",
          body: [
            "Hors accent, les voyelles russes ne sont pas prononcées telles qu'elles sont écrites : elles se réduisent. C'est la principale raison pour laquelle un débutant qui lit correctement ne comprend toujours rien à l'oral — il attend des sons qui ne sont jamais prononcés.",
            "La réduction obéit à des règles simples et sans exception. Une fois connues, elles se transforment en avantage : on peut prédire la prononciation d'un mot à partir de son orthographe et de son accent, ce qui n'est pas donné à toutes les langues.",
          ],
        },
        {
          kind: "table",
          title: "Ce que devient chaque voyelle hors accent",
          head: ["Écrit", "Position", "Prononcé", "Exemple"],
          rows: [
            ["о", "syllabe juste avant l'accent", "a", "вода́ → vada"],
            ["о", "plus loin de l'accent", "a très bref, presque muet", "молоко́ → mlako"],
            ["а", "hors accent", "a bref", "маши́на → machina"],
            ["е", "hors accent", "i", "сестра́ → sistra"],
            ["я", "hors accent", "i", "язы́к → yizyk"],
            ["и, у, ы", "hors accent", "inchangées, juste plus brèves", "кни́га → kniga"],
          ],
          note: "Les manuels russes appellent ces deux phénomènes а́канье (о prononcé a) et и́канье (е, я prononcés i).",
        },
        {
          kind: "examples",
          title: "Écrit / entendu",
          items: [
            { ru: "молоко́", fr: "lait", note: "ma-la-KO" },
            { ru: "хорошо́", fr: "bien", note: "kha-ra-CHO" },
            { ru: "сейча́с", fr: "maintenant", note: "si-TCHAS, souvent même « chtchas » à l'oral rapide" },
            { ru: "спаси́бо", fr: "merci", note: "spa-SI-ba — le о final s'entend a" },
            { ru: "пожа́луйста", fr: "s'il vous plaît", note: "pa-JAL-sta : trois syllabes à l'oral, quatre à l'écrit" },
            { ru: "де́вушка", fr: "jeune fille", note: "DIÉ-vouch-ka" },
          ],
        },
        {
          kind: "pitfall",
          title: "Écrire ce qu'on entend",
          body: [
            "La réduction crée un problème d'orthographe pour les Russes eux-mêmes : rien ne distingue à l'oreille молодо́й de « маладой ». Un enfant russe apprend à écrire en cherchant une forme du mot où la voyelle douteuse est accentuée (во́ды → вода́ s'écrit avec о).",
            "C'est exactement la stratégie à adopter : quand on hésite sur une voyelle atone, on cherche un mot de la même famille où elle porte l'accent.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "о atone se prononce a — c'est la règle la plus rentable de la phonétique russe.",
            "е et я atones se prononcent i.",
            "и, у, ы ne changent pas de timbre : seulement de durée.",
            "Pour l'orthographe d'une voyelle atone, chercher un mot de la même famille où elle est accentuée.",
          ],
        },
      ],
    },
    {
      slug: "consonnes-sourdes-et-sonores",
      title: "Consonnes sourdes, sonores et assimilations",
      titleRu: "Оглушение и озвончение",
      level: "A1",
      minutes: 8,
      summary:
        "En fin de mot et au contact d'une autre consonne, les consonnes changent de camp. Personne ne prononce « хлеб » comme il l'écrit.",
      keywords: ["assimilation", "dévoisement", "sourde", "sonore", "хлеб", "водка", "prononciation"],
      sections: [
        {
          kind: "prose",
          body: [
            "Six consonnes russes forment des paires sourde / sonore : п-б, ф-в, т-д, с-з, ш-ж, к-г. Deux règles les font basculer d'un camp à l'autre selon leur entourage, et elles s'appliquent sans exception, y compris dans les mots les plus fréquents.",
            "Règle 1, le dévoisement final : en fin de mot, une consonne sonore se prononce sourde. Règle 2, l'assimilation : dans un groupe de consonnes, c'est la dernière qui impose son camp à celles qui précèdent.",
          ],
        },
        {
          kind: "table",
          title: "Les paires",
          head: ["Sonore", "Sourde"],
          rows: [
            ["б", "п"],
            ["в", "ф"],
            ["г", "к"],
            ["д", "т"],
            ["ж", "ш"],
            ["з", "с"],
          ],
          note: "Les autres consonnes (л, м, н, р, й) n'ont pas de partenaire : elles ne déclenchent pas d'assimilation.",
        },
        {
          kind: "examples",
          title: "Ce qui est réellement prononcé",
          items: [
            { ru: "хлеб", fr: "pain", note: "prononcé « khlep » — б final se dévoise" },
            { ru: "друг", fr: "ami", note: "prononcé « drouk »" },
            { ru: "во́дка", fr: "vodka", note: "prononcé « votka » — д devient t devant к" },
            { ru: "сде́лать", fr: "faire", note: "prononcé « zdiélat' » — с devient z devant д" },
            { ru: "что", fr: "que, quoi", note: "prononcé « chto » : irrégularité isolée, mais du mot le plus fréquent de la langue" },
            { ru: "его́", fr: "son, le sien", note: "prononcé « yivo » — le г de -его / -ого se dit v" },
          ],
        },
        {
          kind: "pitfall",
          title: "Le -го qui se dit -во",
          body: [
            "Toutes les terminaisons de génitif en -ого / -его se prononcent -ова / -ева. C'est une règle, pas une exception : красного = « krasnava », сегодня = « sivodnia ».",
            "Elle vaut aussi pour его, кого, чего, ничего. Il n'y a que quelques mots où le г écrit se dit vraiment g dans cette position, tous savants.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "En fin de mot, toute sonore se dévoise : хлеб → khlep.",
            "Dans un groupe, la dernière consonne impose son camp aux précédentes.",
            "что se prononce « chto », его se prononce « yivo ».",
            "Ces règles expliquent la plupart des écarts entre orthographe et prononciation.",
          ],
        },
      ],
    },
    {
      slug: "signe-mou-et-signe-dur",
      title: "Ь et Ъ, les deux signes",
      titleRu: "Мягкий и твёрдый знак",
      level: "A1",
      minutes: 7,
      summary:
        "Deux lettres qui ne se prononcent pas mais qui changent tout : l'une mouille, l'autre sépare. Et Ь porte aussi de la grammaire.",
      keywords: ["ь", "ъ", "signe mou", "signe dur", "мягкий знак", "твёрдый знак"],
      sections: [
        {
          kind: "prose",
          body: [
            "Ь (мя́гкий знак, signe mou) n'a pas de son propre : il indique que la consonne qui le précède est mouillée. En fin de mot, c'est la seule façon de le noter, puisqu'il n'y a pas de voyelle pour le faire.",
            "Ъ (твёрдый знак, signe dur) est beaucoup plus rare. Il se place entre un préfixe terminé par une consonne et une racine commençant par е, ё, ю, я, et il signale qu'il faut prononcer un yod séparé au lieu de mouiller la consonne.",
          ],
        },
        {
          kind: "examples",
          title: "Ь change le mot",
          items: [
            { ru: "брат", fr: "frère" },
            { ru: "брать", fr: "prendre", note: "т mouillé : autre mot, autre nature" },
            { ru: "мел", fr: "craie" },
            { ru: "мель", fr: "haut-fond" },
            { ru: "у́гол", fr: "coin, angle" },
            { ru: "у́голь", fr: "charbon" },
          ],
        },
        {
          kind: "examples",
          title: "Ъ sépare",
          items: [
            { ru: "объясни́ть", fr: "expliquer", note: "об + яснить : « ob-yasnit' », pas « obiasnit' »" },
            { ru: "съесть", fr: "manger (entièrement)", note: "с + есть" },
            { ru: "подъе́зд", fr: "entrée d'immeuble", note: "под + езд" },
            { ru: "объявле́ние", fr: "annonce" },
          ],
        },
        {
          kind: "prose",
          title: "Ь est aussi une marque grammaticale",
          body: [
            "Au-delà de la phonétique, le signe mou final signale plusieurs catégories : tous les infinitifs en -ть, la deuxième personne du singulier des verbes (ты чита́ешь), l'impératif de certains verbes (пиши́), et une partie des noms féminins (ночь, дверь, соль).",
            "Un nom terminé par une consonne + ь est féminin dans la majorité des cas — mais pas toujours : день, слова́рь, дождь sont masculins. Le signe mou ne remplace donc pas l'apprentissage du genre, il le rend seulement probable.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Ь mouille la consonne précédente ; il ne se prononce pas.",
            "Ъ sépare un préfixe d'une racine en е, ё, ю, я — quelques dizaines de mots.",
            "Ь final marque aussi l'infinitif, la 2ᵉ personne, et beaucoup de féminins.",
            "брат / брать : le signe mou peut faire toute la différence entre deux mots.",
          ],
        },
      ],
    },
    {
      slug: "regles-orthographiques",
      title: "Les règles orthographiques",
      titleRu: "Правила правописания",
      level: "A1",
      minutes: 8,
      summary:
        "Sept consonnes interdisent certaines voyelles derrière elles. Cette règle explique la moitié des « irrégularités » de déclinaison et de conjugaison.",
      keywords: [
        "orthographe",
        "règle des sept lettres",
        "ж ш ч щ",
        "г к х",
        "ы и",
        "spelling rule",
      ],
      sections: [
        {
          kind: "prose",
          body: [
            "Le russe interdit certaines suites lettre + voyelle. Ce ne sont pas des exceptions décoratives : ces règles s'appliquent aux terminaisons, donc elles déforment systématiquement les tableaux de déclinaison et de conjugaison. Beaucoup de formes que les débutants prennent pour des irrégularités n'en sont pas — elles sont régulières, puis corrigées par l'orthographe.",
            "Il y a trois règles à connaître. Elles portent toutes sur les mêmes groupes de consonnes : les sifflantes ж, ш, ч, щ (auxquelles on ajoute ц pour certaines), et les gutturales г, к, х.",
          ],
        },
        {
          kind: "table",
          title: "Les trois règles",
          head: ["Après…", "Jamais", "Toujours", "Exemple"],
          rows: [
            ["г, к, х, ж, ш, ч, щ", "ы", "и", "кни́га → кни́ги (et non кни́гы)"],
            ["ж, ш, ч, щ, ц", "я, ю", "а, у", "я слы́шу (et non слы́шю)"],
            [
              "ж, ш, ч, щ, ц (terminaison atone)",
              "о",
              "е",
              "хоро́шее ме́сто (et non хоро́шоe)",
            ],
          ],
          note: "La troisième règle ne joue que sur les terminaisons non accentuées : sous l'accent, о reste (большо́й, отцо́м).",
        },
        {
          kind: "examples",
          title: "Ce que la règle explique",
          items: [
            { ru: "кни́га → кни́ги", fr: "livre → livres", note: "г interdit ы" },
            { ru: "ру́чка → ру́чки", fr: "stylo → stylos", note: "к interdit ы" },
            { ru: "я пишу́", fr: "j'écris", note: "ш interdit ю" },
            { ru: "хоро́ший", fr: "bon", note: "ш interdit ы, d'où -ий et non -ый" },
            { ru: "с това́рищем", fr: "avec le camarade", note: "щ + terminaison atone : е, pas о" },
            { ru: "большо́й", fr: "grand", note: "sous l'accent, о se maintient" },
          ],
        },
        {
          kind: "pitfall",
          title: "« Pourquoi ce mot ne suit pas le tableau ? »",
          body: [
            "Devant une forme qui semble déroger au tableau de déclinaison, le premier réflexe doit être de regarder la consonne finale du radical. Neuf fois sur dix, c'est une des sept lettres, et la forme est parfaitement régulière — c'est le tableau qui est écrit avec les voyelles « par défaut ».",
            "Les modules d'exercices de ce site appliquent la règle automatiquement ; l'onglet « orthographe » du module Adjectif la travaille pour elle-même.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Après г к х ж ш ч щ : и, jamais ы.",
            "Après ж ш ч щ ц : а et у, jamais я ni ю.",
            "Après ж ш ч щ ц en terminaison atone : е, jamais о.",
            "Ces trois règles suppriment l'essentiel des fausses irrégularités.",
          ],
        },
      ],
      practice: [{ href: "/adjectives/spelling", label: "Exercice : orthographe de l'adjectif" }],
    },
    {
      slug: "ecriture-cursive",
      title: "L'écriture cursive",
      titleRu: "Пропись",
      level: "A1",
      minutes: 6,
      summary:
        "Le russe manuscrit ne ressemble pas au russe imprimé. Sans cette leçon, un mot écrit à la main est illisible même quand on connaît le mot.",
      keywords: ["cursive", "manuscrit", "écriture", "пропись", "écrire à la main"],
      sections: [
        {
          kind: "prose",
          body: [
            "Les Russes écrivent en cursive liée, et plusieurs lettres manuscrites n'ont aucun rapport visuel avec leur forme imprimée. Un menu écrit à la craie, une note d'un professeur, une carte postale : tout cela reste illisible tant qu'on n'a pas fait ce petit détour.",
            "Le point le plus déroutant : т manuscrit ressemble à un m latin, д manuscrit ressemble à un g, и ressemble à un u. Une suite de lettres arrondies (ш, и, л, м) devient une file de jambages qu'il faut compter.",
          ],
        },
        {
          kind: "table",
          title: "Les correspondances qui surprennent",
          head: ["Lettre", "À la main, ressemble à", "Attention"],
          rows: [
            ["т", "un m latin", "compter les jambages : trois pour т"],
            ["д", "un g latin", "boucle sous la ligne"],
            ["и", "un u latin", "deux jambages"],
            ["ш", "un w allongé", "trois jambages, souvent souligné"],
            ["л", "un л pointu, proche de « ce »", "commence par un crochet"],
            ["ю", "un o précédé d'une barre", "la barre relie le trait au rond"],
          ],
        },
        {
          kind: "pitfall",
          title: "Les mots en file de jambages",
          body: [
            "Un mot comme « шишки » (pommes de pin) devient à la main une longue vague où il faut compter les traits verticaux pour distinguer ш de и. Les Russes eux-mêmes soulignent parfois le ш ou surlignent le т d'un trait pour lever l'ambiguïté.",
            "Ne cherchez pas à écrire vite : la cursive russe se lit d'abord, s'écrit ensuite. Recopier trois lignes d'un texte connu suffit à installer les formes.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Le manuscrit diffère de l'imprimé pour une dizaine de lettres.",
            "т ≈ m, д ≈ g, и ≈ u : ces trois-là causent le plus d'erreurs.",
            "Savoir lire la cursive est indispensable ; savoir l'écrire est optionnel.",
            "Recopier un texte déjà compris est le meilleur exercice.",
          ],
        },
      ],
    },
    {
      slug: "taper-le-russe",
      title: "Taper le russe et le translittérer",
      titleRu: "Русская клавиатура",
      level: "A1",
      minutes: 6,
      summary:
        "Clavier ЙЦУКЕН, claviers phonétiques, et les systèmes de translittération qu'on croise dans les passeports, les noms de rue et les URL.",
      keywords: ["clavier", "йцукен", "translittération", "taper", "romanisation", "phonétique"],
      sections: [
        {
          kind: "prose",
          body: [
            "Deux dispositions existent. ЙЦУКЕН est le clavier russe standard, celui de tous les ordinateurs en Russie : les lettres n'ont aucun rapport avec les touches latines correspondantes, mais c'est la seule disposition qu'on retrouvera partout. Les claviers dits « phonétiques » placent А sur A, Б sur B, etc. : ils s'apprennent en cinq minutes et n'existent nulle part ailleurs que sur votre machine.",
            "Le choix dépend de l'objectif. Pour écrire régulièrement et un jour utiliser un clavier russe, apprenez ЙЦУКЕН dès le début. Pour taper trois phrases par semaine dans une appli d'apprentissage, le phonétique suffit.",
          ],
        },
        {
          kind: "prose",
          title: "Translittération",
          body: [
            "Il n'existe pas une translittération du russe mais plusieurs, et elles se contredisent. Le même nom de famille Чехов s'écrit Chekhov en anglais, Tchekhov en français, Čehov en tchèque, Chekhov dans un passeport russe moderne (norme ICAO).",
            "Retenez surtout les correspondances françaises, parce que ce sont elles qui vous feront reconnaître un nom russe dans un texte français : ч = tch, ш = ch, щ = chtch, ж = j, х = kh, ы = y, ю = iou, я = ia, е initial = ié.",
          ],
        },
        {
          kind: "table",
          title: "Trois systèmes, un même mot",
          head: ["Russe", "Français", "Anglais", "Passeport (ICAO)"],
          rows: [
            ["Чехов", "Tchekhov", "Chekhov", "Chekhov"],
            ["Шостакович", "Chostakovitch", "Shostakovich", "Shostakovich"],
            ["Хрущёв", "Khrouchtchev", "Khrushchev", "Khrushchev"],
            ["Юрий", "Iouri", "Yuri", "Iurii"],
            ["Ельцин", "Eltsine", "Yeltsin", "Eltsin"],
          ],
        },
        {
          kind: "keypoints",
          items: [
            "ЙЦУКЕН est la disposition réelle ; le clavier phonétique est une commodité locale.",
            "La translittération française n'est pas l'anglaise : ч = tch, pas ch.",
            "Un même nom russe a plusieurs graphies latines légitimes.",
            "Sur téléphone, ajouter le clavier russe prend dix secondes et change tout.",
          ],
        },
      ],
    },
    {
      slug: "ponctuation-russe",
      title: "La ponctuation russe",
      titleRu: "Пунктуация",
      level: "A2",
      minutes: 8,
      summary:
        "La virgule russe n'est pas une respiration : c'est une marque grammaticale obligatoire. Et le tiret remplace le verbe être.",
      keywords: ["ponctuation", "virgule", "tiret", "guillemets", "запятая", "тире"],
      sections: [
        {
          kind: "prose",
          body: [
            "En français, la virgule relève en partie du style. En russe, elle est régie par la grammaire : devant что, который, если, потому что, чтобы et toutes les autres conjonctions de subordination, elle est obligatoire, sans considération de longueur ni de rythme.",
            "Le tiret, lui, occupe une place que le français ne lui donne pas : il remplace le verbe être au présent, qui n'existe pas en russe.",
          ],
        },
        {
          kind: "examples",
          title: "Les emplois à connaître",
          items: [
            {
              ru: "Я ду́маю, что он прав.",
              fr: "Je pense qu'il a raison.",
              note: "virgule obligatoire devant что",
            },
            {
              ru: "Челове́к, кото́рый живёт здесь, — врач.",
              fr: "L'homme qui habite ici est médecin.",
              note: "la relative est encadrée de virgules ; le tiret tient lieu de « est »",
            },
            {
              ru: "Москва́ — столи́ца Росси́и.",
              fr: "Moscou est la capitale de la Russie.",
            },
            {
              ru: "Он сказа́л: «Я приду́ за́втра».",
              fr: "Il a dit : « Je viendrai demain. »",
              note: "guillemets russes « en chevrons », point à l'intérieur",
            },
            {
              ru: "Ты придёшь, е́сли бу́дет вре́мя?",
              fr: "Tu viendras s'il y a le temps ?",
            },
          ],
        },
        {
          kind: "prose",
          title: "Ce que le français fait et que le russe ne fait pas",
          body: [
            "Pas d'espace avant les signes doubles : le russe écrit « Как дела?» sans espace devant le point d'interrogation, contrairement au français.",
            "Les guillemets sont des chevrons « … », et à l'intérieur d'une citation déjà entre chevrons, on utilise les guillemets allemands „ “. La virgule ne se met jamais devant и quand il relie deux termes simples (хлеб и молоко) — mais elle se met dans une énumération d'au moins trois éléments coordonnés par и répété.",
          ],
        },
        {
          kind: "pitfall",
          title: "La virgule oubliée devant что",
          body: [
            "C'est l'erreur d'écrit la plus fréquente chez les francophones, parce que le français écrit « je pense qu'il a raison » sans virgule. En russe, son absence est une faute d'orthographe au même titre qu'une lettre manquante.",
            "Règle de survie : toute subordonnée, quelle qu'elle soit, est détachée par une virgule — à l'ouverture ET à la fermeture si elle est enchâssée.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "Virgule obligatoire devant что, который, если, потому что, чтобы.",
            "Une subordonnée enchâssée est encadrée de deux virgules.",
            "Le tiret remplace le verbe être au présent entre deux noms.",
            "Guillemets en chevrons, pas d'espace avant ? ! : ;",
          ],
        },
      ],
    },
    {
      slug: "intonation-russe",
      title: "L'intonation : les constructions ИК",
      titleRu: "Интонационные конструкции",
      level: "A2",
      minutes: 8,
      summary:
        "En russe, une question sans mot interrogatif ne se distingue d'une affirmation que par la mélodie. C'est la seule marque, et elle est enseignée comme une grammaire.",
      keywords: ["intonation", "ик-1", "ик-2", "ик-3", "question", "мелодика", "prononciation"],
      sections: [
        {
          kind: "prose",
          body: [
            "La linguistique russe décrit sept schémas mélodiques appelés интонацио́нные констру́кции (ИК). Trois suffisent à parler correctement, et le deuxième d'entre eux est indispensable : sans lui, une question oui/non est entendue comme une affirmation.",
            "Le principe : un mot de la phrase porte le centre intonatif, et c'est sur sa syllabe accentuée que la mélodie fait son mouvement. Déplacer ce centre change le sens de la question sans toucher un seul mot.",
          ],
        },
        {
          kind: "table",
          title: "Les trois schémas utiles",
          head: ["Schéma", "Emploi", "Mélodie", "Exemple"],
          rows: [
            ["ИК-1", "affirmation", "descente sur le centre", "Он рабо́тает."],
            ["ИК-2", "question avec mot interrogatif", "descente appuyée sur le mot en к-", "Где он рабо́тает?"],
            ["ИК-3", "question sans mot interrogatif", "montée brusque puis chute", "Он рабо́тает?"],
          ],
        },
        {
          kind: "examples",
          title: "Le centre déplace le sens",
          items: [
            {
              ru: "Он рабо́тает в Москве́?",
              fr: "C'est bien lui qui travaille à Moscou ?",
              note: "montée sur он",
            },
            {
              ru: "Он рабо́тает в Москве́?",
              fr: "Il y travaille (ou il y étudie) ?",
              note: "montée sur работает",
            },
            {
              ru: "Он рабо́тает в Москве́?",
              fr: "C'est à Moscou qu'il travaille ?",
              note: "montée sur Москве",
            },
          ],
        },
        {
          kind: "pitfall",
          title: "La question française n'existe pas",
          body: [
            "Le français dispose de trois façons de poser une question fermée : « est-ce que… », l'inversion, et l'intonation. Le russe n'a que la troisième — la particule ли existe mais appartient à l'écrit soigné.",
            "Un francophone qui garde son intonation habituelle pose donc des questions que personne n'entend comme telles. L'écart de hauteur de ИК-3 est beaucoup plus marqué qu'en français : il faut exagérer avant d'atteindre le naturel.",
          ],
        },
        {
          kind: "keypoints",
          items: [
            "ИК-3 (montée forte) est la seule marque d'une question oui/non.",
            "Le centre intonatif se pose sur le mot interrogé — il porte le sens.",
            "ИК-2 (descente appuyée) accompagne les questions en кто, где, когда…",
            "L'amplitude russe est plus large que la française : exagérer est ici la bonne stratégie.",
          ],
        },
      ],
    },
  ],
};
