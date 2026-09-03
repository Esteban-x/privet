/**
 * Les guides.
 *
 * POURQUOI ILS EXISTENT, ET POURQUOI ILS NE SONT PAS UN BLOG. Le cours
 * répond à « comment décliner un nom au génitif ». Il ne répond pas à
 * « combien de temps ça va me prendre », ni à « est-ce que c'est trop dur
 * pour moi », ni à « quel livre acheter » — les questions qu'on se pose AVANT
 * d'ouvrir une leçon, et qui amènent un tout autre trafic. Ces pages-là ne
 * peuvent pas être des leçons : elles ne s'adressent pas à quelqu'un qui
 * apprend, mais à quelqu'un qui hésite.
 *
 * Un blog aurait fait la même chose en pire : en publiant sur les mêmes
 * sujets que les 130 leçons, il se serait fait concurrence à lui-même, et il
 * aurait fallu l'alimenter indéfiniment pour ne pas avoir l'air abandonné.
 * Des pages qui répondent à des questions durables ne vieillissent pas.
 *
 * UN GUIDE = UNE QUESTION QUE LE COURS NE PEUT PAS PRENDRE. C'est le seul
 * critère d'entrée, et il est restrictif exprès. « La prononciation du
 * russe » a sa place ici parce qu'elle demande de rassembler ce que six
 * leçons distinctes traitent séparément, du point de vue de quelqu'un qui
 * n'a encore ouvert aucune des six. « Le génitif de négation » n'aurait pas
 * sa place : c'est une leçon, et en faire aussi un guide reviendrait à mettre
 * deux de nos propres pages en concurrence sur la même requête.
 *
 * ILS NE SONT PAS DANS LA NAVIGATION. Ni barre, ni bandeau : ils ne font pas
 * partie du produit, ils y mènent. Le seul lien interne est en pied de page
 * d'accueil — assez pour qu'un robot les découvre et les rattache au site,
 * trop discret pour encombrer un apprenant qui, lui, cherche à travailler.
 *
 * ILS SE POINTENT LES UNS LES AUTRES, dans les deux sens. `related` n'est
 * pas décoratif : un guide ajouté sans qu'aucun ancien ne le cite reste une
 * feuille morte du site, atteignable par le plan mais par rien d'autre.
 * Quand vous en ajoutez un, ajoutez-le AUSSI dans le `related` d'au moins un
 * guide existant.
 *
 * ILS RENVOIENT TOUS DANS L'APP, et uniquement vers des pages PUBLIQUES
 * (cours, cas, alphabet, conjugaison, nombres, tarifs). Un lien vers
 * /exercices enverrait le lecteur — et le robot — sur une redirection de
 * connexion.
 */

export interface GuideSection {
  /** Devient un <h2> et une ancre. */
  title: string;
  /** Paragraphes. Le balisage riche passe par `links`. */
  paragraphs: string[];
  /** Liste à puces optionnelle, sous les paragraphes. */
  bullets?: { lead: string; body: string }[];
}

export interface Guide {
  slug: string;
  /** Le <h1>. Formulé comme la question, parce que c'est comme ça qu'on tape. */
  h1: string;
  /** Le <title>. 70 signes maximum, marque comprise. */
  title: string;
  /** 160 signes maximum. */
  description: string;
  /** La phrase d'ouverture, en gros sous le titre. */
  lede: string;
  /** La réponse en une phrase, encadrée : c'est ce que Google extrait. */
  answer: string;
  sections: GuideSection[];
  /** Les portes vers l'app, en bas de page. Uniquement des pages publiques. */
  next: { href: string; label: string; detail: string }[];
  /** Les autres guides à proposer — le maillage entre eux compte aussi. */
  related: string[];
}

export const GUIDES: Guide[] = [
  // ────────────────────────────────────────────────────────────────
  {
    slug: "combien-de-temps-pour-apprendre-le-russe",
    h1: "Combien de temps faut-il pour apprendre le russe ?",
    title: "Combien de temps pour apprendre le russe ? Les chiffres",
    description:
      "1 100 heures pour un niveau professionnel selon le FSI. Ce que ça donne par niveau, " +
      "ce qui prend vraiment du temps, et ce qui va plus vite qu'on ne croit.",
    lede:
      "La question a une réponse chiffrée, et une réponse honnête. Les deux méritent d'être dites.",
    answer:
      "Comptez 1 100 heures pour atteindre un niveau professionnel (B2-C1), soit environ trois ans " +
      "à une heure par jour. Mais les premiers échanges simples arrivent bien avant : deux à quatre " +
      "mois suffisent pour se présenter et poser des questions de base.",
    sections: [
      {
        title: "D'où vient le chiffre de 1 100 heures",
        paragraphs: [
          "C'est l'estimation du Foreign Service Institute, l'organisme qui forme les diplomates américains. Il classe les langues en quatre catégories selon le temps qu'il faut à un anglophone pour atteindre un niveau professionnel. Le russe est en catégorie IV — avec le polonais, le tchèque et le grec — à 1 100 heures d'étude active.",
          "Pour un francophone, l'ordre de grandeur tient. Le français ne partage pas plus de racines avec le russe que l'anglais, et les deux difficultés majeures — la déclinaison et l'aspect verbal — sont absentes des deux langues.",
          "Ces heures sont des heures d'étude réelle, pas de temps passé sur une application en écoutant autre chose. C'est la distinction qui explique la plupart des déceptions.",
        ],
      },
      {
        title: "Ce que ça donne, niveau par niveau",
        paragraphs: [
          "Le chiffre global décourage parce qu'il mesure une arrivée lointaine. Découpé, il devient utilisable :",
        ],
        bullets: [
          {
            lead: "A1 — 2 à 4 mois",
            body: "Se présenter, saluer, demander son chemin, lire le cyrillique sans hésiter. À une heure par jour, c'est atteignable avant l'été si vous commencez au printemps.",
          },
          {
            lead: "A2 — 6 à 12 mois",
            body: "Tenir une conversation simple, raconter sa journée au passé. C'est ici que les six cas commencent à devenir des réflexes plutôt que des tableaux.",
          },
          {
            lead: "B1 — 1 à 2 ans",
            body: "Lire un article court, suivre une conversation entre natifs si elle vous est adressée. L'aspect verbal se choisit sans y penser la plupart du temps.",
          },
          {
            lead: "B2 et au-delà — 3 ans et plus",
            body: "Travailler ou étudier en russe. C'est le niveau que vise le chiffre de 1 100 heures.",
          },
        ],
      },
      {
        title: "Ce qui prend vraiment du temps",
        paragraphs: [
          "Trois choses, et aucune n'est le vocabulaire.",
          "Les six cas, d'abord. Non pas les apprendre — les tableaux tiennent sur une page — mais les produire sans réfléchir. Comptez six à douze mois entre le moment où vous comprenez ce qu'est le génitif et celui où vous le sortez sans compter sur vos doigts. C'est ce décalage, et lui seul, qui fait abandonner.",
          "L'aspect verbal ensuite. Chaque verbe russe existe en deux versions selon que l'action est achevée ou non, et le français ne fournit aucun repère : « j'ai lu » se dit de deux façons différentes selon qu'on a fini le livre. Il n'y a pas de règle courte, seulement une habitude à construire.",
          "Les verbes de mouvement enfin. « Aller » se traduit par quatre verbes différents selon qu'on marche ou qu'on roule, et selon que le trajet est unique ou habituel. Puis chacun se combine à une quinzaine de préfixes.",
        ],
      },
      {
        title: "Ce qui va plus vite qu'on ne croit",
        paragraphs: [
          "L'alphabet cyrillique s'apprend en une soirée, et se lit couramment en une semaine. C'est l'obstacle qui fait le plus peur et qui coûte le moins cher — sauf pour six lettres qui ressemblent à des lettres latines et se lisent autrement.",
          "La prononciation est régulière : ce qui est écrit se lit, à deux ou trois règles de réduction près. Rien à voir avec l'anglais.",
          "Et la conjugaison est d'une simplicité désarmante : trois temps, deux modèles, pas de subjonctif à mémoriser. Un francophone qui a survécu au passé simple trouvera ça reposant.",
        ],
      },
      {
        title: "Le seul facteur qui change tout",
        paragraphs: [
          "La régularité, très loin devant la méthode. Vingt minutes chaque jour battent trois heures le dimanche, et l'écart n'est pas marginal : la mémoire consolide pendant les intervalles, pas pendant l'effort. C'est exactement ce que la répétition espacée exploite.",
          "Concrètement, un apprenant à vingt minutes quotidiennes atteint A2 en un an. Le même volume horaire concentré en une séance hebdomadaire n'y arrive pas — il repart de plus loin à chaque fois.",
        ],
      },
    ],
    next: [
      {
        href: "/alphabet",
        label: "Commencer par l'alphabet",
        detail: "Les 33 lettres, et les six qui trompent les francophones",
      },
      {
        href: "/cases",
        label: "Voir les 6 cas",
        detail: "Ce que chacun exprime, et quand il se déclenche",
      },
      {
        href: "/cours",
        label: "Le cours complet",
        detail: "130 leçons, dans l'ordre où elles s'apprennent",
      },
    ],
    related: [
      "le-russe-est-il-difficile",
      "apprendre-le-russe-seul-par-ou-commencer",
      "certificat-de-russe-torfl",
    ],
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: "le-russe-est-il-difficile",
    h1: "Le russe est-il difficile pour un francophone ?",
    title: "Le russe est-il difficile ? La réponse honnête",
    description:
      "Oui, mais pas pour les raisons qu'on croit. L'alphabet s'apprend en une soirée ; " +
      "ce sont les six cas et l'aspect verbal qui demandent du temps.",
    lede:
      "Oui. Mais la difficulté n'est pas là où on la place, et ça change complètement la façon de s'y prendre.",
    answer:
      "Le russe est classé parmi les langues difficiles pour un francophone, mais l'alphabet et la " +
      "prononciation — ce qui effraie le plus — sont les parties les plus faciles. La vraie " +
      "difficulté tient en trois points : les six cas, l'aspect verbal et les verbes de mouvement.",
    sections: [
      {
        title: "Ce qui fait peur et ne devrait pas",
        paragraphs: [
          "L'alphabet. Trente-trois lettres, dont une douzaine se lisent déjà comme en français, et une dizaine se retiennent en dix minutes. Une soirée suffit à les tracer toutes, une semaine à lire sans buter. Le seul piège réel tient en six lettres — В, Н, Р, С, У, Х — qui ressemblent à des lettres latines et se prononcent autrement.",
          "La prononciation. Le russe s'écrit à peu près comme il se dit, à deux règles près : les voyelles non accentuées se réduisent, et les consonnes sonores s'assourdissent en fin de mot. Aucun système de correspondances arbitraires à mémoriser.",
          "La conjugaison. Trois temps — passé, présent, futur — et deux modèles de terminaisons. Le passé s'accorde en genre comme un adjectif et ne se conjugue pas en personne. C'est plus simple que le français.",
        ],
      },
      {
        title: "La vraie difficulté : les six cas",
        paragraphs: [
          "En russe, un nom change de forme selon sa fonction dans la phrase. « Livre » se dit книга, книги, книге, книгу ou книгой selon qu'il est sujet, complément de nom, destinataire, objet direct ou moyen. Multipliez par trois genres, par le singulier et le pluriel : voilà le tableau.",
          "Comprendre le principe prend une heure. L'appliquer sans réfléchir prend des mois. Et l'écart entre les deux est précisément ce qui décourage : on sait ce qu'il faut faire, on n'arrive pas à le faire assez vite pour parler.",
          "Ce qui aide vraiment, ce n'est pas de réviser les tableaux — c'est de reconnaître les déclencheurs. Une préposition, un verbe, une quantité : chacun appelle un cas précis, toujours le même. Apprendre « без appelle le génitif » est infiniment plus rentable que réciter six colonnes de terminaisons.",
        ],
      },
      {
        title: "La deuxième : l'aspect verbal",
        paragraphs: [
          "Chaque verbe russe existe en deux exemplaires. читать et прочитать veulent tous les deux dire « lire », mais le second dit qu'on a fini. Ce n'est pas une nuance de style : choisir le mauvais rend la phrase fausse.",
          "Le français ne donne aucun appui. « J'ai lu un livre hier soir » se traduit de deux façons selon qu'on a terminé le livre ou seulement passé la soirée dessus — et rien dans la phrase française ne tranche.",
          "Il n'existe pas de règle courte. Il existe des habitudes : le perfectif ne s'emploie jamais au présent, la négation appelle presque toujours l'imperfectif, un résultat visible appelle le perfectif. Le reste s'attrape par l'exposition.",
        ],
      },
      {
        title: "La troisième : les verbes de mouvement",
        paragraphs: [
          "« Aller » se dit идти, ходить, ехать ou ездить. Les deux premiers pour un déplacement à pied, les deux suivants en véhicule. Et dans chaque paire, l'un désigne un trajet en cours, l'autre une habitude ou un aller-retour.",
          "« Я иду в школу » : je suis en train d'y aller, là, maintenant. « Я хожу в школу » : j'y vais régulièrement, j'y suis scolarisé. Même phrase française, deux verbes russes.",
          "Puis chacun se préfixe — при-, у-, вы-, за-, пере- — et chaque préfixe modifie la direction. C'est ce qui donne aux verbes de mouvement leur réputation.",
        ],
      },
      {
        title: "Ce qu'un francophone a en poche sans le savoir",
        paragraphs: [
          "Le genre grammatical, d'abord. Un anglophone doit apprendre que les noms ont un genre ; vous le savez déjà, et l'accord de l'adjectif vous est naturel.",
          "L'idée qu'un mot change de forme selon sa fonction, ensuite. Vous la connaissez par les pronoms : « je / me / moi » sont trois formes du même mot selon sa place. Le russe applique ce principe à tous les noms — c'est un élargissement, pas une nouveauté.",
          "Et l'absence d'articles. Ni le, ni la, ni un, ni des : le russe s'en passe complètement. C'est une charge en moins, rarement mentionnée.",
        ],
      },
    ],
    next: [
      {
        href: "/cases",
        label: "Attaquer les 6 cas",
        detail: "Un cas à la fois, avec ses déclencheurs et ses exercices",
      },
      {
        href: "/cours/aspect-le-principe",
        label: "Comprendre l'aspect",
        detail: "La leçon qui pose le principe, sans tableau à mémoriser",
      },
      {
        href: "/cours/deux-series",
        label: "Les verbes de mouvement",
        detail: "Pourquoi « aller » se dit de quatre façons",
      },
    ],
    related: [
      "combien-de-temps-pour-apprendre-le-russe",
      "erreurs-frequentes-francophones-russe",
      "prononciation-du-russe",
    ],
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: "apprendre-le-russe-seul-par-ou-commencer",
    h1: "Apprendre le russe seul : par où commencer ?",
    title: "Apprendre le russe seul : par où commencer",
    description:
      "L'ordre qui fonctionne sans professeur : l'alphabet, puis les phrases sans verbe, puis " +
      "les cas un par un. Et les pièges du démarrage en autonomie.",
    lede:
      "Apprendre seul est possible. Ce qui fait échouer, ce n'est presque jamais la difficulté de la langue — c'est l'ordre dans lequel on l'aborde.",
    answer:
      "Commencez par l'alphabet (une semaine), puis par les phrases sans verbe être, qui permettent " +
      "de parler avant toute déclinaison. N'attaquez les six cas qu'ensuite, un par un, en " +
      "commençant par le prépositionnel et l'accusatif — pas par le génitif.",
    sections: [
      {
        title: "Semaine 1 : lire, avant tout le reste",
        paragraphs: [
          "Tant que déchiffrer demande un effort, tout le reste coûte double. Chaque mot de vocabulaire, chaque terminaison, chaque exemple devient une épreuve de lecture avant d'être une leçon de grammaire.",
          "L'alphabet se travaille donc en premier et en bloc, jusqu'à lire sans traduire lettre à lettre. Une soirée pour le tracer, une semaine pour le lire couramment. Insistez sur les six faux amis — В, Н, Р, С, У, Х — qui sont la cause de presque toutes les erreurs de lecture des premiers mois.",
        ],
      },
      {
        title: "Semaines 2 à 4 : parler sans grammaire",
        paragraphs: [
          "Le russe a un cadeau pour les débutants : il n'utilise pas le verbe « être » au présent. « Je suis étudiant » se dit « Я студент » — deux mots, aucune conjugaison, aucune déclinaison.",
          "Cela veut dire qu'on peut construire de vraies phrases dès la deuxième semaine : se présenter, dire ce qu'on est, poser une question, nier. Ce sont trois ou quatre leçons, et elles donnent le sentiment de progresser avant que la grammaire ne devienne exigeante — ce qui est exactement ce dont on a besoin quand on apprend seul, sans personne pour maintenir le rythme.",
          "Ajoutez le genre des noms et le pluriel à ce moment-là : ils préparent tout le reste et ne coûtent presque rien.",
        ],
      },
      {
        title: "Mois 2 à 6 : les cas, dans le bon ordre",
        paragraphs: [
          "C'est ici que se joue l'abandon ou la réussite, et l'ordre compte énormément. La plupart des manuels suivent l'ordre traditionnel russe — nominatif, génitif, datif, accusatif, instrumental, prépositionnel — qui est un ordre de grammairien, pas d'apprenant.",
          "L'ordre utile est différent :",
        ],
        bullets: [
          {
            lead: "Le prépositionnel en premier",
            body: "Il ne sert qu'après quelques prépositions (в, на, о), il est le plus régulier des six, et il permet de dire où l'on est. Un cas facile qui rapporte immédiatement.",
          },
          {
            lead: "L'accusatif ensuite",
            body: "C'est le complément d'objet direct : il apparaît dans neuf phrases sur dix. Attention au piège animé/inanimé, qui n'existe pas en français.",
          },
          {
            lead: "Le génitif en troisième",
            body: "Le plus employé et le plus polyvalent — possession, absence, quantité — mais aussi celui qui a le plus d'emplois à retenir. Le prendre trop tôt décourage.",
          },
          {
            lead: "Datif et instrumental pour finir",
            body: "Moins fréquents, plus réguliers. Ils s'ajoutent sans douleur une fois les trois premiers en place.",
          },
        ],
      },
      {
        title: "En parallèle, tous les jours : le vocabulaire",
        paragraphs: [
          "Vingt minutes de grammaire sans vocabulaire ne mènent nulle part : on sait décliner des mots qu'on ne connaît pas. Faites tourner les deux en parallèle dès la première semaine.",
          "La répétition espacée est ce qui fonctionne, et ce n'est pas une préférence de méthode : un mot revu la veille de l'oubli se retient bien mieux qu'un mot révisé dix fois d'affilée. Quinze à vingt mots par jour est un rythme tenable sur un an.",
          "Choisissez des mots que vous emploierez. Les listes thématiques de 500 mots découragent ; trente mots utilisés chaque jour valent mieux.",
        ],
      },
      {
        title: "Les trois pièges de l'apprentissage en autonomie",
        paragraphs: [
          "Tout lire avant de rien pratiquer. On comprend une règle en la lisant, on l'acquiert en la ratant. Alternez dès le premier jour.",
          "Réviser les tableaux plutôt que les déclencheurs. Savoir réciter les terminaisons du génitif ne sert à rien si l'on ne repère pas qu'après без il en faut un. Ce sont les déclencheurs qui font parler.",
          "Sauter l'accent tonique. Il n'est jamais écrit en russe courant, il n'est pas prévisible, et il change la prononciation de toutes les voyelles du mot. Apprendre un mot sans son accent, c'est l'apprendre à moitié.",
        ],
      },
    ],
    next: [
      {
        href: "/alphabet",
        label: "Étape 1 : l'alphabet",
        detail: "Les 33 lettres et les six faux amis",
      },
      {
        href: "/cours/phrase-sans-verbe-etre",
        label: "Étape 2 : parler sans grammaire",
        detail: "Les phrases qui fonctionnent sans conjugaison",
      },
      {
        href: "/cases/prepositional",
        label: "Étape 3 : le prépositionnel",
        detail: "Le cas le plus régulier, et le plus rentable pour commencer",
      },
    ],
    related: [
      "le-russe-est-il-difficile",
      "combien-de-temps-pour-apprendre-le-russe",
      "apprendre-le-russe-gratuitement",
    ],
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: "erreurs-frequentes-francophones-russe",
    h1: "Les 6 erreurs que font tous les francophones en russe",
    title: "Les 6 erreurs les plus fréquentes des francophones en russe",
    description:
      "Accusatif animé, négation au génitif, aspect au passé, verbes de mouvement, accent " +
      "tonique : les fautes que le français induit, et comment les corriger.",
    lede:
      "Ces erreurs n'ont rien d'aléatoire. Elles viennent toutes du même endroit : le français applique une logique qui, en russe, n'a pas cours.",
    answer:
      "Les six fautes récurrentes tiennent à des points où le français n'a pas d'équivalent : " +
      "l'accusatif des animés, la négation qui appelle le génitif, le choix de l'aspect au passé, " +
      "les quatre verbes de mouvement, l'accent tonique et les faux amis de l'alphabet.",
    sections: [
      {
        title: "1. Traiter l'accusatif comme un complément d'objet français",
        paragraphs: [
          "En russe, l'accusatif d'un nom masculin change selon que ce nom désigne un être vivant ou non. « Je vois la table » garde стол inchangé ; « je vois le frère » transforme брат en брата — c'est-à-dire une forme identique au génitif.",
          "Le français ne fait aucune distinction de ce type, donc rien ne signale l'erreur à l'oreille. C'est la faute la plus répandue des six premiers mois, et elle survit longtemps parce qu'elle ne gêne pas la compréhension.",
          "Le réflexe à construire : avant de mettre un masculin à l'accusatif, se demander si la chose respire.",
        ],
      },
      {
        title: "2. Nier sans passer au génitif",
        paragraphs: [
          "Dire qu'une chose n'existe pas met cette chose au génitif. « Il n'y a pas de temps » se dit нет времени, jamais нет время. Le français dit « pas de » et s'arrête là ; le russe change la forme du mot.",
          "La construction нет + génitif s'étend à la possession négative : « je n'ai pas de voiture » se dit littéralement « chez moi il n'y a pas de voiture » — у меня нет машины, avec машина passée au génitif.",
          "C'est mécanique, sans exception, et c'est l'un des rares points où une règle courte suffit.",
        ],
      },
      {
        title: "3. Choisir l'aspect d'après le temps français",
        paragraphs: [
          "Le réflexe naturel est de traduire l'imparfait par l'imperfectif et le passé composé par le perfectif. Ça marche assez souvent pour installer l'habitude, et ça échoue exactement là où ça compte.",
          "« Hier soir j'ai lu un livre » se dit читал si l'on a passé la soirée à lire, прочитал si l'on a terminé le livre. Le passé composé français ne tranche pas ; le russe l'exige.",
          "La bonne question n'est pas « quel temps français ? » mais « l'action a-t-elle abouti à un résultat ? ». Et le perfectif ne s'emploie jamais au présent, ce qui élimine d'office la moitié des hésitations.",
        ],
      },
      {
        title: "4. Traduire « aller » par un seul verbe",
        paragraphs: [
          "Quatre verbes se partagent ce que le français dit avec un seul : идти et ходить à pied, ехать et ездить en véhicule. Dans chaque paire, le premier décrit un trajet en cours, le second une habitude ou un aller-retour.",
          "« Я иду в школу » veut dire que vous êtes dans la rue, en route. « Я хожу в школу » veut dire que vous y êtes scolarisé. Un francophone qui ne connaît qu'идти dira sans arrêt qu'il est en train de marcher vers son école.",
          "Le raccourci qui fonctionne au début : trajet unique et en cours, идти ou ехать ; habitude ou aller-retour, ходить ou ездить.",
        ],
      },
      {
        title: "5. Ignorer l'accent tonique",
        paragraphs: [
          "Le russe n'écrit jamais son accent tonique, sauf dans les manuels. Il n'est pas prévisible, il se déplace parfois d'une forme à l'autre du même mot, et il commande la prononciation de toutes les voyelles : une voyelle non accentuée se réduit, un о non accenté se prononce à peu près « a ».",
          "Apprendre молоко sans savoir que l'accent tombe sur le dernier о, c'est apprendre à dire « mo-lo-ko » là où un Russe entend « ma-la-KO ». Le mot devient méconnaissable.",
          "L'accent fait partie du mot au même titre que ses lettres. Il s'apprend avec lui, pas après.",
        ],
      },
      {
        title: "6. Lire В, Н, Р, С, У et Х comme des lettres latines",
        paragraphs: [
          "Six lettres cyrilliques ont la forme d'une lettre latine et un tout autre son. В se lit « v », Н se lit « n », Р se lit « r », С se lit « s », У se lit « ou », Х se lit comme la jota espagnole.",
          "Le mot ресторан se lit « restoran » et non « pektopah » — mais l'œil, lui, voit d'abord des lettres latines, et l'erreur persiste des semaines si on ne la traite pas frontalement dès le départ.",
          "C'est la seule difficulté réelle de l'alphabet, et elle se règle en une heure d'attention consciente.",
        ],
      },
    ],
    next: [
      {
        href: "/cases/accusative",
        label: "L'accusatif et l'animation",
        detail: "Le piège n° 1, avec ses exercices",
      },
      {
        href: "/cases/genitive",
        label: "Le génitif de négation",
        detail: "нет + génitif, et les autres emplois",
      },
      {
        href: "/alphabet",
        label: "Les six faux amis",
        detail: "В, Н, Р, С, У, Х — et le reste de l'alphabet",
      },
    ],
    related: [
      "le-russe-est-il-difficile",
      "apprendre-le-russe-seul-par-ou-commencer",
      "prononciation-du-russe",
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    slug: "prononciation-du-russe",
    h1: "Comment prononcer le russe quand on est francophone ?",
    title: "Prononciation du russe : l'alphabet et 5 règles clés",
    description:
      "Le russe se lit presque comme il s'écrit, à cinq règles près : l'accent tonique, la " +
      "réduction des voyelles atones, l'assimilation des consonnes et la mouillure.",
    lede:
      "Une lettre, un son : le cyrillique tient sa promesse mieux que l'orthographe française. " +
      "Ce sont les cinq règles qui déforment ensuite ce qu'on a lu qui font l'accent étranger.",
    answer:
      "Le russe s'écrit de façon presque phonétique : les 33 lettres acquises, tout mot écrit est " +
      "prononçable, y compris un mot inconnu. Cinq règles déforment ensuite le résultat — l'accent " +
      "tonique, jamais marqué et mobile ; la réduction des voyelles hors accent ; l'assimilation " +
      "des consonnes entre elles ; le dévoisement en fin de mot ; et la mouillure, que l'oreille " +
      "française n'entend pas d'emblée.",
    sections: [
      {
        title: "Les 33 lettres, et les six qui trompent",
        paragraphs: [
          "L'alphabet russe compte 33 lettres, et se retient en une soirée si on le range en trois familles plutôt qu'en une liste. Dix lettres se lisent comme en français à la forme près — А, К, М, О, Т et quelques autres. Une vingtaine n'évoquent rien du tout : Б, Г, Д, Ж, З, И, Л, П, Ф, Ц, Ч, Ш, Щ, Ы, Э, Ю, Я. Celles-là ne trompent personne, précisément parce qu'elles ne ressemblent à rien de connu.",
          "Le vrai problème tient en six lettres, celles qui ont l'air latines et se lisent autrement. Ce sont elles qui font déchiffrer « ресторан » comme un mot étranger alors qu'il dit « restaurant », et elles reviennent au moment exact où l'on cesse d'épeler pour reconnaître la silhouette des mots — vers la troisième semaine.",
        ],
        bullets: [
          { lead: "В в se lit v", body: "вода́, « eau ». Jamais b." },
          { lead: "Н н se lit n", body: "но́мер, « numéro ». Jamais h." },
          { lead: "Р р se lit r roulé", body: "Росси́я, « Russie ». Jamais p." },
          { lead: "С с se lit s", body: "суп, « soupe ». Jamais k." },
          { lead: "У у se lit ou", body: "у́тро, « matin ». Ni u, ni y." },
          { lead: "Х х se lit kh", body: "хорошо́, « bien ». Le son de la jota espagnole, pas celui de ks." },
        ],
      },
      {
        title: "L'accent tonique commande tout le reste",
        paragraphs: [
          "Un mot russe a une syllabe accentuée, et une seule. Elle est plus longue, plus forte, plus nette — et elle n'est écrite nulle part. Les accents aigus que vous voyez sur ce site, comme dans les manuels, sont un outil pédagogique : ils disparaissent de tout texte russe réel, journal, roman ou panneau de gare.",
          "Le français, qui accentue mécaniquement la dernière syllabe du groupe, n'a aucun réflexe à recycler ici. Et l'enjeu n'est pas cosmétique : l'accent distingue des mots entiers. За́мок, c'est le château ; замо́к, c'est le cadenas. Му́ка, c'est le supplice ; мука́, c'est la farine. Пла́чу veut dire « je paie » ; плачу́ veut dire « je pleure ».",
          "Pire, l'accent se déplace à l'intérieur d'un même mot quand il se décline : рука́ au nominatif, ру́ку à l'accusatif. Il n'existe pas de règle générale pour le prévoir. La seule méthode qui fonctionne est d'apprendre chaque mot avec son accent dès la première rencontre, comme on apprend le genre d'un nom allemand — jamais de le rajouter plus tard.",
        ],
      },
      {
        title: "Hors accent, les voyelles changent de son",
        paragraphs: [
          "C'est la règle qui surprend le plus, et celle qui rend le russe parlé méconnaissable à qui ne l'a appris que par écrit. Une voyelle non accentuée se réduit : elle perd son timbre et glisse vers un son plus neutre.",
          "О atone devient a — c'est l'аканье. Молоко́ s'écrit avec trois о et se prononce à peu près « malakó ». Хорошо́ donne « kharachó ». Un francophone qui prononce les trois о distinctement reste compris, mais s'entend à dix mètres.",
          "Е et я atones glissent vers i. Сестра́ se dit « sistrá », пятна́дцать se dit « pitnátsat' ». Là encore, la lettre écrite ment sur le son, et c'est normal : l'orthographe russe conserve la racine du mot plutôt que sa prononciation du moment — exactement comme le français écrit « eau » ce qu'il prononce o.",
        ],
      },
      {
        title: "Les consonnes se contaminent entre elles",
        paragraphs: [
          "Deux phénomènes, tous deux automatiques, tous deux invisibles à l'écrit. D'abord le dévoisement final : une consonne sonore en fin de mot se prononce sourde. Хлеб, « le pain », se dit « khlep ». Друг, « l'ami », se dit « drouk ». Муж, « le mari », se dit « mouch ».",
          "Ensuite l'assimilation régressive : dans un groupe, c'est la dernière consonne qui impose sa nature à celle qui précède. Во́дка se prononce « vótka », parce que le к sourd dévoise le д. Всё se prononce « fsio », parce que le с sourd dévoise le в. Dans l'autre sens, сде́лать se prononce « zdiélat' » : le д sonore sonorise le с.",
          "Aucune de ces deux règles ne demande d'effort une fois qu'on sait qu'elles existent — elles vont dans le sens de ce que la bouche fait spontanément. Ce qui coûte, c'est de continuer à écrire ce qu'on ne prononce pas : la faute la plus fréquente des débutants est d'écrire « вотка ».",
        ],
      },
      {
        title: "La mouillure : la difficulté qu'on n'entend pas",
        paragraphs: [
          "Presque toutes les consonnes russes existent en deux versions, dure et molle. La molle se prononce avec le dos de la langue relevé vers le palais, comme si un i minuscule se glissait après la consonne — mais un i qui ne forme pas de syllabe et ne s'entend pas comme une voyelle distincte.",
          "Ce qui rend la chose délicate pour un francophone n'est pas de la produire : c'est de l'entendre. Мать (la mère) et мат (le juron) ne diffèrent que par la mouillure du т final. Брат (le frère) et брать (prendre) de même. Une oreille non entraînée reçoit le même mot deux fois, et l'apprenant conclut logiquement que la distinction est décorative. Elle ne l'est pas : elle sépare des mots courants, et elle porte une partie de la grammaire.",
          "La mouillure est signalée par ce qui suit la consonne, jamais par la consonne elle-même : les voyelles я, ё, ю, е, и la déclenchent, ainsi que le signe mou ь. Les voyelles а, о, у, э, ы laissent la consonne dure. C'est tout le sens des cinq paires de voyelles russes : elles ne notent pas cinq sons de plus, elles notent l'état de la consonne d'avant.",
        ],
      },
      {
        title: "Les quatre sons qui n'existent pas en français",
        paragraphs: [
          "Le reste s'obtient par transfert depuis le français. Ces quatre-là demandent un vrai apprentissage, et il vaut mieux les travailler tôt : une prononciation approximative installée pendant six mois se corrige beaucoup plus difficilement qu'elle ne s'apprend.",
        ],
        bullets: [
          {
            lead: "Ы",
            body: "Un i prononcé très en arrière, la langue reculée, quelque part entre le i et le ou. C'est le son le plus étranger de la langue — et il porte des terminaisons entières, donc on ne peut pas le contourner : ты, вы, мы, сын.",
          },
          {
            lead: "Х",
            body: "Un raclement sourd, celui de la jota espagnole ou du ch allemand de « Bach ». Ni un k, ni un h aspiré : хлеб, хорошо́.",
          },
          {
            lead: "Щ",
            body: "Un ch long et mouillé, à ne pas confondre avec ш, qui est dur et bref : щи, ещё, това́рищ.",
          },
          {
            lead: "Р",
            body: "Le r roulé de la pointe de la langue, pas le r grasseyé du français. Un r français reste compris partout, mais c'est la marque d'accent la plus immédiatement audible.",
          },
        ],
      },
      {
        title: "Dans quel ordre travailler tout ça",
        paragraphs: [
          "Ne cherchez pas à tout tenir dès la première semaine. L'ordre qui fonctionne suit la rentabilité : déchiffrer d'abord, accentuer ensuite, affiner en dernier.",
          "Semaine 1 : les 33 lettres et les six pièges, jusqu'à lire une enseigne sans hésiter. Semaine 2 : l'accent tonique, appris avec chaque mot nouveau — c'est l'habitude la plus rentable de tout l'apprentissage. Semaine 3 : la réduction des voyelles, qui rend le russe parlé soudainement compréhensible. Ensuite, en continu : la mouillure et les assimilations, qui s'installent par l'écoute bien plus que par la règle.",
          "Et à chaque étape, lisez à voix haute. La prononciation russe est régulière au point que dix minutes de lecture orale par jour corrigent plus de choses qu'un chapitre de phonétique.",
        ],
      },
    ],
    next: [
      {
        href: "/cours/alphabet-cyrillique",
        label: "Les 33 lettres",
        detail: "Le tableau complet : nom, son et mot témoin",
      },
      {
        href: "/cours/accent-tonique",
        label: "L'accent tonique",
        detail: "Pourquoi за́мок et замо́к ne sont pas le même mot",
      },
      {
        href: "/alphabet",
        label: "S'entraîner à lire",
        detail: "Les six faux amis, en exercices",
      },
    ],
    related: [
      "le-russe-est-il-difficile",
      "apprendre-le-russe-seul-par-ou-commencer",
      "erreurs-frequentes-francophones-russe",
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    slug: "apprendre-le-russe-gratuitement",
    h1: "Peut-on vraiment apprendre le russe gratuitement ?",
    title: "Apprendre le russe gratuitement : ce qui suffit vraiment",
    description:
      "L'alphabet, la grammaire, la lecture et le vocabulaire s'apprennent sans payer. Ce qu'on " +
      "ne trouve pas gratuitement : la correction de ce qu'on produit.",
    lede:
      "La réponse est oui pour presque tout, et la vraie question n'est pas le prix : " +
      "c'est de savoir ce que le gratuit ne remplace pas.",
    answer:
      "Oui, pour l'essentiel. L'alphabet, la grammaire, la lecture et le vocabulaire s'apprennent " +
      "intégralement sans payer — les 130 leçons de ce site, ses tableaux de déclinaison et son " +
      "alphabet sont ouverts sans compte. Ce que le gratuit ne donne presque jamais, c'est quelqu'un " +
      "ou quelque chose qui corrige ce que vous produisez, tous les jours, sans se lasser.",
    sections: [
      {
        title: "Ce qui est gratuit et réellement suffisant",
        paragraphs: [
          "Une bonne partie de l'apprentissage du russe consiste à recevoir de l'information : quelles sont les 33 lettres, à quoi sert le génitif, comment se forme un perfectif. Cette matière-là est de l'écrit, elle ne se périme pas, et elle est disponible en français en accès libre à un niveau de qualité qui n'a rien à envier aux manuels payants.",
          "Concrètement, vous pouvez couvrir sans dépenser un euro : l'alphabet et la lecture, les six cas et leurs tableaux, l'aspect verbal, les verbes de mouvement, la conjugaison, les 2 000 premiers mots de vocabulaire, et de la lecture graduée. C'est de quoi tenir jusqu'à un solide A2 — soit un an de travail régulier pour la plupart des gens.",
          "Il faut y ajouter deux ressources gratuites qu'on oublie souvent : l'écoute — les chaînes russes, les podcasts pour apprenants, les journaux télévisés lents — et le contact humain, via les applications d'échange linguistique où un russophone qui apprend le français vous corrige contre réciprocité.",
        ],
      },
      {
        title: "Ce que le gratuit ne remplace pas",
        paragraphs: [
          "La ligne de partage n'est pas entre « bon contenu » et « mauvais contenu ». Elle est entre ce qui se lit et ce qui se corrige.",
          "Lire une règle coûte zéro à distribuer : une leçon écrite une fois sert un million de lecteurs. Corriger une phrase que vous venez d'écrire coûte à chaque fois — du temps humain, ou du calcul. C'est pour cette raison que la partie explicative du russe est massivement gratuite, et que la partie correction ne l'est presque jamais au-delà de quelques essais par jour.",
          "Or la correction est exactement ce dont le russe a le plus besoin. Une langue à six cas et à double aspect ne s'apprend pas en reconnaissant des formes justes : elle s'apprend en produisant des formes fausses et en apprenant pourquoi. Sans retour, on installe des erreurs durables — l'accusatif traité comme un complément d'objet français, l'aspect choisi d'après le temps de la traduction — qui coûtent ensuite des mois à défaire.",
        ],
      },
      {
        title: "Le vrai coût du gratuit : la dispersion",
        paragraphs: [
          "Le piège le plus sérieux des ressources gratuites n'est pas leur qualité, c'est leur nombre. Quand tout est disponible, on collectionne : une chaîne pour l'alphabet, un site pour les cas, une application pour le vocabulaire, un PDF pour la conjugaison. Chacun bon, tous incompatibles.",
          "Le résultat est prévisible : on recommence trois fois l'alphabet, on ne dépasse jamais le prépositionnel, et on abandonne au bout de deux mois en concluant que le russe est trop dur. Ce n'était pas le russe, c'était l'absence d'ordre.",
          "Un cours payant ne vous apprend pas mieux ; il vous impose une progression, ce qui est un service réel. La bonne façon d'utiliser le gratuit est donc de reproduire cette contrainte volontairement : une source principale qui donne l'ordre, et les autres en appoint, jamais l'inverse.",
        ],
      },
      {
        title: "Un parcours gratuit qui tient six mois",
        paragraphs: [
          "Voici un plan qui ne demande aucune dépense, et qui a le mérite de dire quoi faire chaque jour plutôt que quoi consulter.",
        ],
        bullets: [
          {
            lead: "Semaine 1 — lire",
            body: "Les 33 lettres, puis les six faux amis. Objectif : déchiffrer une enseigne, pas comprendre. Quinze minutes par jour suffisent.",
          },
          {
            lead: "Semaines 2 à 4 — parler sans grammaire",
            body: "Se présenter, poser une question, dire ce qu'on aime. Le russe fonctionne sans verbe être au présent : on produit des phrases entières dès le troisième jour.",
          },
          {
            lead: "Mois 2 à 6 — les cas, dans l'ordre",
            body: "Prépositionnel, puis accusatif, puis génitif, puis datif, puis instrumental. Un cas par mois, avec ses exercices, avant de passer au suivant. C'est le seul point du plan qui ne se négocie pas.",
          },
          {
            lead: "Tous les jours, en parallèle — le vocabulaire",
            body: "Vingt minutes de répétition espacée. C'est la seule chose qui doit se faire absolument tous les jours, week-end compris : la mémoire lexicale s'entretient, elle ne se rattrape pas.",
          },
          {
            lead: "Une fois par semaine — l'écoute",
            body: "Vingt minutes de russe parlé, même incompris. L'oreille se règle sur la réduction des voyelles bien avant que la tête ne comprenne les mots.",
          },
        ],
      },
      {
        title: "Ce qui est ouvert ici, et sans compte",
        paragraphs: [
          "Pour être clair sur ce que ce site fait et ne fait pas, puisque c'est la question que pose vraiment « apprendre le russe gratuitement ».",
          "Ouvert à tous, sans inscription : les 130 leçons du cours complet, de l'alphabet aux registres littéraires ; les tableaux des six cas ; l'alphabet, la conjugaison et les nombres. C'est la totalité de la matière — rien n'est réservé.",
          "Avec un compte gratuit, s'ajoutent le test de niveau, les listes de vocabulaire personnelles et la répétition espacée, plus un quota quotidien d'exercices corrigés qui se recharge chaque nuit. Ce quota est la seule limite, et il tient largement pour des séances de début. L'abonnement ne débloque pas de contenu caché : il enlève le compteur, pour ceux qui s'entraînent tous les jours.",
        ],
      },
    ],
    next: [
      {
        href: "/cours",
        label: "Les 130 leçons",
        detail: "Le programme complet, en accès libre",
      },
      {
        href: "/cases",
        label: "Les six cas",
        detail: "Tableaux et emplois, cas par cas",
      },
      {
        href: "/alphabet",
        label: "L'alphabet",
        detail: "Par où tout le monde commence",
      },
    ],
    related: [
      "apprendre-le-russe-seul-par-ou-commencer",
      "livre-pour-apprendre-le-russe",
      "application-pour-apprendre-le-russe",
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    slug: "livre-pour-apprendre-le-russe",
    h1: "Quel livre pour apprendre le russe ?",
    title: "Quel livre pour apprendre le russe ? Le tri par usage",
    description:
      "Méthode, grammaire, cahier d'exercices, lecture graduée : quatre objets différents. " +
      "Lequel acheter en premier, et ce que valent vraiment les PDF gratuits.",
    lede:
      "La question se pose mal. Il n'y a pas un bon livre de russe : il y a quatre objets qui " +
      "ne servent pas à la même chose, et qu'on achète rarement dans le bon ordre.",
    answer:
      "Pour débuter seul, une seule méthode audio suffit — Assimil est la référence francophone " +
      "du genre. La grammaire de référence, elle, se consulte et ne se lit pas : elle n'a d'utilité " +
      "qu'à partir du moment où vous vous posez des questions précises. L'erreur classique est " +
      "d'acheter trois livres au premier mois et de n'en finir aucun.",
    sections: [
      {
        title: "Quatre objets, souvent confondus",
        paragraphs: [
          "Sous le mot « livre de russe » se cachent quatre produits différents, avec quatre usages, quatre rythmes de lecture et quatre durées de vie. Les confondre est la première cause de découragement : on ouvre une grammaire de référence en semaine 1, on ne comprend rien, et on en conclut que le russe est hors de portée.",
        ],
        bullets: [
          {
            lead: "La méthode",
            body: "Une progression en leçons courtes, avec de l'audio. Elle donne l'ordre et le rythme. C'est le seul livre qu'on lit du début à la fin, et le seul indispensable au départ.",
          },
          {
            lead: "La grammaire de référence",
            body: "Un ouvrage qu'on consulte par l'index quand une forme résiste. Le lire linéairement n'a aucun sens — c'est un dictionnaire de règles, pas un cours.",
          },
          {
            lead: "Le cahier d'exercices",
            body: "Des séries d'applications avec corrigé. Utile pour ancrer une règle déjà comprise ; inutile pour la découvrir.",
          },
          {
            lead: "La lecture graduée",
            body: "Des textes calibrés par niveau, souvent avec lexique en regard. C'est ce qui fait passer du russe appris au russe lu, et c'est presque toujours acheté trop tard.",
          },
        ],
      },
      {
        title: "La méthode : celle qu'on ouvre tous les jours",
        paragraphs: [
          "Pour un francophone qui démarre seul, la méthode Assimil « Le Russe » reste la référence : progression lente, audio intégral, une leçon courte par jour. Son défaut est connu — elle explique peu la grammaire et fait beaucoup confiance à l'imprégnation — et c'est précisément pour cela qu'elle se complète bien avec un cours en ligne qui, lui, énonce les règles.",
          "Les méthodes universitaires, dont le « Manuel de russe » publié par L'Asiathèque, jouent l'inverse : grammaire explicite, exercices nombreux, exigence réelle. Elles sont excellentes si vous avez de la constance et du temps, moins adaptées si vous comptez travailler vingt minutes dans le métro.",
          "Les collections grand public — « Le Russe pour les Nuls » et équivalents — sont honnêtes pour prendre la température et découvrir l'alphabet, mais aucune ne vous mène à un vrai A2. Le critère qui compte, dans tous les cas : y a-t-il un audio complet, enregistré par des natifs, et l'accent tonique est-il marqué dans les textes ? Un manuel de russe qui ne marque pas l'accent vous laisse installer des erreurs à chaque mot appris.",
        ],
      },
      {
        title: "La grammaire de référence : à consulter, pas à lire",
        paragraphs: [
          "Achetez-la au troisième mois, pas au premier. Avant, vous n'avez pas encore les questions auxquelles elle répond ; après, elle devient l'outil le plus rentable de votre bibliothèque, parce que c'est elle qui tranche les cas particuliers que les méthodes évitent : les noms irréguliers, les voyelles mobiles, la rection des verbes, les pluriels en -а accentué.",
          "Ce que vous devez vérifier avant d'acheter : un index alphabétique fourni — c'est par là que vous entrerez à chaque fois —, des tableaux de déclinaison complets, et l'accent marqué partout. Une grammaire sans index se referme après trois usages.",
        ],
      },
      {
        title: "Les PDF gratuits : ce qu'on y trouve vraiment",
        paragraphs: [
          "« Apprendre le russe PDF » est l'une des recherches les plus fréquentes sur le sujet, et elle mérite une réponse franche. Ce qu'on trouve se répartit en trois catégories très inégales.",
          "Les bonnes : les tableaux. Déclinaisons, conjugaisons, alphabet, listes des 1 000 mots les plus fréquents. Ce sont des documents de référence, sans progression, et le format PDF leur convient parfaitement — on les imprime et on les punaise.",
          "Les médiocres : les « cours complets en PDF » de 200 pages, généralement des scans de manuels anciens ou des compilations sans auteur. Le contenu grammatical du russe ne vieillit pas, mais la pédagogie, le vocabulaire et les exemples, si — et un manuel qui apprend à demander un télégramme n'est pas neutre pour la motivation.",
          "Les inutilisables : les PDF sans audio pour l'alphabet et la prononciation. Apprendre à prononcer le russe sur un document muet ne fonctionne pas, quel que soit le sérieux des transcriptions. Pour ce poste précis, une page web avec du son bat n'importe quel PDF.",
        ],
      },
      {
        title: "Ce qu'aucun livre ne peut faire",
        paragraphs: [
          "Un livre ne corrige pas. Il vous donne un corrigé, ce qui n'est pas la même chose : vous voyez la bonne réponse, mais personne ne vous dit pourquoi la vôtre était fausse, ni ne détecte que vous refaites la même erreur pour la sixième fois.",
          "C'est un vrai handicap en russe, plus que dans d'autres langues. Les erreurs des francophones sont systématiques et peu nombreuses — six ou sept mécanismes reviennent en boucle —, mais elles sont invisibles depuis l'intérieur. Un corrigé imprimé les laisse passer ; un exercice qui vous fait produire la forme, puis explique l'écart, les élimine.",
          "La combinaison qui fonctionne, donc : un livre pour l'ordre et l'audio, un cours en ligne pour l'explication, et des exercices corrigés pour la production. Chacun fait ce que les deux autres font mal.",
        ],
      },
    ],
    next: [
      {
        href: "/cours",
        label: "Le cours complet",
        detail: "130 leçons, l'équivalent écrit d'un manuel entier",
      },
      {
        href: "/cases",
        label: "Les tableaux de déclinaison",
        detail: "Les six cas, sans le PDF",
      },
      {
        href: "/guides/apprendre-le-russe-gratuitement",
        label: "Faut-il payer ?",
        detail: "Ce qui est gratuit, ce qui ne l'est jamais",
      },
    ],
    related: [
      "apprendre-le-russe-gratuitement",
      "application-pour-apprendre-le-russe",
      "apprendre-le-russe-seul-par-ou-commencer",
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    slug: "application-pour-apprendre-le-russe",
    h1: "Quelle application pour apprendre le russe ?",
    title: "Application pour apprendre le russe : Duolingo & co",
    description:
      "Ce qu'une application fait très bien — la régularité, le vocabulaire — et ce qu'aucune " +
      "ne fait : les six cas, l'aspect, et corriger vos propres formes.",
    lede:
      "Une application résout un problème réel, et un seul : revenir tous les jours. " +
      "Tout le reste dépend de ce qu'elle vous fait faire pendant ces dix minutes.",
    answer:
      "Une application est excellente pour deux choses : installer une habitude quotidienne et " +
      "fixer du vocabulaire par répétition espacée. Aucune ne fait acquérir les six cas ni l'aspect " +
      "verbal, parce que ces deux points demandent de produire une forme et de se la faire corriger, " +
      "pas de choisir entre quatre propositions. Le montage qui marche : une application pour le " +
      "rythme, une source qui explique, et des exercices qui corrigent.",
    sections: [
      {
        title: "Ce qu'une application fait mieux qu'un livre",
        paragraphs: [
          "Trois choses, et elles ne sont pas négligeables. D'abord la régularité : la notification quotidienne, la série à ne pas casser, la séance qui tient dans un trajet. Le principal facteur de réussite en langue n'est ni le talent ni la méthode, c'est le nombre de jours consécutifs — et sur ce point une application bat n'importe quel manuel posé sur une étagère.",
          "Ensuite la répétition espacée. Réviser un mot juste avant de l'oublier est un calcul, et c'est le genre de calcul qu'un logiciel fait parfaitement et qu'un humain fait mal. Pour la mémorisation du lexique, c'est l'outil le plus efficace qui existe, toutes méthodes confondues.",
          "Enfin l'audio à la demande : entendre un mot prononcé au moment où on l'apprend, le réentendre trois semaines plus tard. En russe, où l'accent tonique n'est pas écrit, ce détail vaut cher.",
        ],
      },
      {
        title: "Ce qu'elle ne fait pas, et pourquoi",
        paragraphs: [
          "Le format des applications grand public — choisir parmi quatre propositions, remettre des mots dans l'ordre, associer une image à un mot — a une limite structurelle : il teste la reconnaissance, pas la production. Or le russe se joue entièrement sur la production.",
          "Reconnaître que « в шко́ле » est correct ne vous apprend rien. Devoir écrire vous-même la forme de шко́ла après в, choisir entre le prépositionnel et l'accusatif selon qu'il y a mouvement ou non, et vous tromper : voilà ce qui installe le cas. Une application qui vous propose la bonne réponse parmi quatre vous laisse arriver au bout du parcours sans savoir décliner.",
          "Même chose pour l'aspect. Choisir entre писа́ть et написа́ть ne dépend pas du temps de la phrase française, mais de ce que le locuteur veut dire — processus ou résultat. C'est une décision de sens, qui demande une explication et un retour argumenté, pas un exercice à trous.",
        ],
      },
      {
        title: "Duolingo en russe : ce qu'il faut vérifier d'abord",
        paragraphs: [
          "C'est l'application la plus citée, et la question mérite une précision que peu de comparatifs donnent : le cours de russe de Duolingo est proposé depuis l'anglais, et l'offre disponible depuis le français est nettement plus restreinte. Vérifiez donc, avant de vous engager, depuis quelle langue le parcours russe s'ouvre sur votre compte — passer par l'anglais ajoute une couche de traduction qui fatigue, et fausse une partie des exercices de version.",
          "Sur le fond, le cours russe de Duolingo fait bien ce que Duolingo fait bien : l'alphabet au tout début, du vocabulaire courant, un rythme quotidien tenable. Il fait mal ce que Duolingo fait mal partout : il n'explique presque rien, et il vous laisse déduire seul les régularités d'un système à six cas — ce qui, en russe, ne fonctionne pas pour la plupart des gens.",
          "Le verdict raisonnable : très bien comme métronome et comme entrée en matière, insuffisant comme cours principal. Beaucoup d'apprenants font des mois de séries quotidiennes et découvrent ensuite qu'ils ne savent pas décliner un nom au génitif pluriel. Ce n'est pas un échec de leur part.",
        ],
      },
      {
        title: "Les cartes espacées : le complément le plus rentable",
        paragraphs: [
          "Anki et les systèmes du même genre ne sont pas des cours : ce sont des machines à ne pas oublier. Pour le vocabulaire russe, dont la difficulté est la masse plus que la complexité, c'est l'investissement au meilleur rendement — quinze à vingt minutes par jour couvrent l'entretien de plusieurs milliers de mots.",
          "Deux règles font toute la différence. Fabriquez vos cartes vous-même à partir de ce que vous lisez, plutôt que de télécharger un paquet de 5 000 mots : une carte issue d'une phrase rencontrée se retient, une carte anonyme non. Et mettez l'accent tonique sur chaque carte, sans exception — une carte sans accent installe une erreur de prononciation à chaque révision.",
        ],
      },
      {
        title: "Comment combiner sans y passer deux heures",
        paragraphs: [
          "Aucune de ces briques ne se suffit, et empiler cinq applications ne fait qu'ajouter de la dispersion. Une répartition simple, en trente minutes par jour :",
        ],
        bullets: [
          {
            lead: "10 minutes — vocabulaire en répétition espacée",
            body: "Tous les jours, week-end compris. C'est la seule partie non négociable : la mémoire lexicale s'entretient, elle ne se rattrape pas.",
          },
          {
            lead: "10 minutes — une leçon écrite",
            body: "La règle du jour, expliquée. C'est ce que les applications ne font pas, et c'est ce qui fait la différence entre reconnaître et savoir.",
          },
          {
            lead: "10 minutes — des exercices qui corrigent",
            body: "Produire la forme, se tromper, comprendre l'écart. Sur les cas et l'aspect, c'est le seul format qui fasse progresser.",
          },
        ],
      },
    ],
    next: [
      {
        href: "/cases",
        label: "Les six cas",
        detail: "Ce qu'aucune application n'enseigne vraiment",
      },
      {
        href: "/cours",
        label: "Le cours écrit",
        detail: "La règle énoncée, pas devinée",
      },
      {
        href: "/premium",
        label: "Comment marche ce site",
        detail: "Ce qui est gratuit, et où est la limite",
      },
    ],
    related: [
      "apprendre-le-russe-gratuitement",
      "livre-pour-apprendre-le-russe",
      "erreurs-frequentes-francophones-russe",
    ],
  },
  // ────────────────────────────────────────────────────────────────
  {
    slug: "certificat-de-russe-torfl",
    h1: "Existe-t-il un certificat officiel de russe ?",
    title: "Certificat de russe : le TORFL (ТРКИ), niveau par niveau",
    description:
      "Le ТРКИ / TORFL est la certification officielle de russe langue étrangère. Ses six " +
      "niveaux, les cinq épreuves, et le palier qui sert réellement à quelque chose.",
    lede:
      "Il en existe un, reconnu, calé sur le CECRL. Reste à savoir lequel de ses six niveaux " +
      "correspond à ce que vous voulez en faire — la plupart des candidats visent trop haut.",
    answer:
      "Oui : le ТРКИ (« test de russe langue étrangère »), connu à l'international sous le nom de " +
      "TORFL, délivré par les universités russes habilitées. Il compte six niveaux alignés sur le " +
      "CECRL, de ТЭУ (A1) à ТРКИ-4 (C2). Le palier utile dans la plupart des situations est ТРКИ-1 " +
      "(B1) : c'est celui qu'on demande pour intégrer un cursus universitaire russophone.",
    sections: [
      {
        title: "Les six niveaux, et ce qu'ils valent",
        paragraphs: [
          "Le système est parallèle au CECRL, avec ses propres noms. Retenir la correspondance suffit pour se situer.",
        ],
        bullets: [
          {
            lead: "ТЭУ — niveau élémentaire (A1)",
            body: "Se présenter, poser des questions simples, lire une enseigne. Environ 780 mots. Valeur pratique quasi nulle sur un dossier ; utile comme échéance pour se donner une date.",
          },
          {
            lead: "ТБУ — niveau de base (A2)",
            body: "Environ 1 300 mots, les situations quotidiennes. C'est souvent le niveau demandé pour des démarches administratives élémentaires.",
          },
          {
            lead: "ТРКИ-1 (B1)",
            body: "Le palier qui compte. Environ 2 300 mots, autonomie dans la vie courante et l'étude. C'est le niveau exigé pour entrer dans une université russophone — et celui qui atteste d'une compétence réelle aux yeux d'un employeur.",
          },
          {
            lead: "ТРКИ-2 (B2)",
            body: "Travailler en russe dans un domaine non philologique. Environ 10 000 mots. C'est un vrai saut par rapport au précédent, et il se compte en années.",
          },
          {
            lead: "ТРКИ-3 (C1) et ТРКИ-4 (C2)",
            body: "Niveaux professionnels et quasi natifs, requis pour enseigner ou traduire. ТРКИ-4 correspond à la maîtrise d'un locuteur cultivé natif.",
          },
        ],
      },
      {
        title: "Ce que contient l'épreuve",
        paragraphs: [
          "Le test se décompose en cinq sous-épreuves, et c'est cette structure qui explique la plupart des échecs : il faut atteindre le seuil dans chacune, pas en moyenne. Un candidat brillant à l'écrit mais muet à l'oral ne passe pas.",
          "Les cinq modules sont : lexique et grammaire, lecture, compréhension orale, expression écrite, expression orale. Les deux premiers se préparent avec des tableaux et des exercices ; les trois autres demandent de la pratique, et se préparent mal seul.",
          "Le module qui fait chuter le plus de francophones est le lexique-grammaire, et à l'intérieur, la déclinaison — génitif pluriel, verbes de mouvement, rection des prépositions. Ce sont exactement les points qu'on peut contourner à l'oral en reformulant, et qu'un QCM ne laisse pas contourner.",
        ],
      },
      {
        title: "Faut-il passer une certification ?",
        paragraphs: [
          "Pour une démarche administrative ou une candidature universitaire, la question ne se pose pas : c'est le document demandé, et il n'y a pas d'équivalent.",
          "Pour un apprenant qui travaille seul par intérêt, la réponse est plus nuancée. Le certificat en lui-même ne vous servira sans doute jamais. Mais l'échéance, si : s'inscrire à une session dans huit mois change complètement la façon dont on travaille, parce que cela transforme un projet sans fin en un objectif daté avec un programme connu. C'est le principal bénéfice, et il est réel.",
          "Une alternative honnête, si vous ne visez rien d'administratif : utilisez le référentiel sans passer l'examen. Situez-vous par un test de niveau, prenez la liste des compétences du palier suivant, et traitez-la comme un programme. Vous obtenez la structure sans les frais ni la logistique.",
        ],
      },
      {
        title: "Préparer les points qui font échouer",
        paragraphs: [
          "Quel que soit le niveau visé, la préparation efficace ne consiste pas à réviser « le russe » mais à traiter les quatre foyers d'erreurs que l'épreuve cible systématiquement.",
        ],
        bullets: [
          {
            lead: "Le génitif pluriel",
            body: "Trois terminaisons selon le genre et la finale, plus une série de formes sans terminaison du tout. C'est la question de grammaire la plus rentable à travailler.",
          },
          {
            lead: "L'aspect verbal",
            body: "Perfectif ou imperfectif, en contexte, et pas d'après le temps du français. Chaque session en teste plusieurs occurrences.",
          },
          {
            lead: "Les verbes de mouvement",
            body: "Идти́ / ходи́ть, plus les préverbes. Un système à part entière, que le français rend par un seul verbe.",
          },
          {
            lead: "La rection des verbes et des prépositions",
            body: "Quel cas après quel mot. Cela ne se déduit pas : cela s'apprend par listes, et c'est du travail de mémoire pur.",
          },
        ],
      },
    ],
    next: [
      {
        href: "/cases",
        label: "Les six cas",
        detail: "Le module qui décide de l'épreuve de grammaire",
      },
      {
        href: "/cours/genitif",
        label: "Le génitif",
        detail: "Ses emplois, et le pluriel le plus testé — et le plus raté",
      },
      {
        href: "/cours",
        label: "Le programme complet",
        detail: "127 leçons, du A0 aux registres littéraires",
      },
    ],
    related: [
      "combien-de-temps-pour-apprendre-le-russe",
      "le-russe-est-il-difficile",
      "apprendre-le-russe-seul-par-ou-commencer",
    ],
  },
];

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
