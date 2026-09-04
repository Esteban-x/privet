// Généré par scripts/curate-templates.mjs — ne pas éditer à la main.
//
// Les phrases SUPPLÉMENTAIRES de chaque déclencheur. La première phrase,
// celle qui sert de référence de style, reste écrite à la main dans
// triggers.ts : elle a été relue une par une et c'est elle qu'on montre au
// modèle pour lui dire ce qu'on attend.
//
// Pourquoi ici et pas à l'exécution : une phrase écrite à la construction
// est validée par le garde-fou, relue, puis figée. Une phrase écrite à
// l'exécution ne peut être que l'un ou l'autre, et coûte un appel réseau par
// exercice. Voir l'en-tête du script.
//
// 136 déclencheurs, 654 phrases supplémentaires.

export const TRIGGER_TEMPLATES: Record<string, { ru: string; fr: string }[]> = {
  // э́то — Э́то ___.
  "expr-nom-eto": [
    { ru: "Смотри́, э́то ___.", fr: "Regarde, c'est ___." },
    { ru: "Я ду́маю, э́то ___.", fr: "Je pense que c'est ___." },
    { ru: "Нет, э́то ___.", fr: "Non, c'est ___." },
    { ru: "Мо́жет быть, э́то ___.", fr: "C'est peut-être ___." },
  ],
  // вот — Вот ___.
  "expr-nom-vot": [
    { ru: "А вот и ___!", fr: "Et voici ___ !" },
    { ru: "Смотри́, вот ___.", fr: "Regarde, voici ___." },
    { ru: "Вот ___, наконе́ц!", fr: "Voici enfin ___ !" },
  ],
  // есть — Здесь есть ___.
  "expr-nom-est": [
    { ru: "Там есть ___.", fr: "Il y a ___ là-bas." },
    { ru: "Здесь есть ___?", fr: "Est-ce qu'il y a ___ ici ?" },
    { ru: "Сего́дня есть ___.", fr: "Il y a ___ aujourd'hui." },
    { ru: "У нас есть ___.", fr: "Nous avons ___." },
    { ru: "У меня́ есть ___.", fr: "J'ai ___." },
  ],
  // зову́т — Меня́ зову́т ___.
  "expr-nom-zovut": [
    { ru: "Здра́вствуйте, меня́ зову́т ___.", fr: "Bonjour, je m'appelle ___." },
    { ru: "Приве́т, меня́ зову́т ___, а тебя́?", fr: "Salut, je m'appelle ___, et toi ?" },
    { ru: "Меня́ зову́т ___, я живу́ в Москве́.", fr: "Je m'appelle ___, j'habite à Moscou." },
    { ru: "Меня́ зову́т ___, прия́тно познако́миться!", fr: "Je m'appelle ___, ravi de te rencontrer !" },
    { ru: "Извини́те, меня́ зову́т ___.", fr: "Excusez-moi, je m'appelle ___." },
  ],
  // мн. число́ — Здесь то́лько ___.
  "expr-nom-pluriel": [
    { ru: "В саду́ расту́т то́лько ___.", fr: "Dans le jardin il n'y a que des ___." },
    { ru: "В коридо́ре стоя́т то́лько ___.", fr: "Dans le couloir il n'y a que des ___." },
    { ru: "В го́роде живу́т то́лько ___.", fr: "Dans la ville il n'y a que des ___." },
    { ru: "В больни́це рабо́тают то́лько ___.", fr: "À l'hôpital il n'y a que des ___." },
    { ru: "На у́лице стоя́т то́лько ___.", fr: "Dans la rue il n'y a que des ___." },
  ],
  // нет — У меня́ нет ___.
  "expr-gen-net": [
    { ru: "У неё нет ___.", fr: "Elle n'a pas de ___." },
    { ru: "У нас нет ___.", fr: "Nous n'avons pas de ___." },
    { ru: "У тебя́ нет ___?", fr: "Tu n'as pas de ___ ?" },
    { ru: "У него́ нет ___.", fr: "Il n'a pas de ___." },
    { ru: "У вас нет ___?", fr: "Vous n'avez pas de ___ ?" },
  ],
  // мно́го — У меня́ мно́го ___.
  "expr-gen-mnogo": [
    { ru: "У неё мно́го ___.", fr: "Elle a beaucoup de ___." },
    { ru: "Здесь мно́го ___.", fr: "Ici, il y a beaucoup de ___." },
    { ru: "У нас мно́го ___.", fr: "Nous avons beaucoup de ___." },
    { ru: "В дере́вне мно́го ___.", fr: "Au village, il y a beaucoup de ___." },
  ],
  // ма́ло — У меня́ ма́ло ___.
  "expr-gen-malo": [
    { ru: "У них ма́ло ___.", fr: "Ils ont peu de ___." },
    { ru: "У неё ма́ло ___.", fr: "Elle a peu de ___." },
    { ru: "У тебя́ ма́ло ___.", fr: "Tu as peu de ___." },
    { ru: "На э́той по́лке ма́ло ___.", fr: "Sur cette étagère, il y a peu de ___." },
  ],
  // не́сколько — У меня́ есть не́сколько ___.
  "expr-gen-neskolko": [
    { ru: "У неё есть не́сколько ___.", fr: "Elle a plusieurs ___." },
    { ru: "У нас есть не́сколько ___.", fr: "Nous avons plusieurs ___." },
    { ru: "У тебя́ есть не́сколько ___.", fr: "Tu as plusieurs ___." },
    { ru: "У него́ есть не́сколько ___.", fr: "Il a plusieurs ___." },
    { ru: "У них есть не́сколько ___.", fr: "Ils ont plusieurs ___." },
  ],
  // ско́лько — Ско́лько ___ у тебя́?
  "expr-gen-skolko": [
    { ru: "Ско́лько ___ у них во дворе́?", fr: "Combien de ___ ont-ils dans la cour ?" },
    { ru: "Ско́лько ___ у нас в го́роде?", fr: "Combien de ___ avons-nous dans la ville ?" },
    { ru: "Ско́лько ___ у вас есть?", fr: "Combien de ___ avez-vous ?" },
    { ru: "Ско́лько ___ у него́ бы́ло вчера́?", fr: "Combien de ___ avait-il hier ?" },
    { ru: "Ско́лько ___ у тебя́ бы́ло в де́тстве?", fr: "Combien de ___ avais-tu dans ton enfance ?" },
  ],
  // кусо́к — Дай мне кусо́к ___.
  "expr-gen-kusok": [
    { ru: "Она́ отреза́ла мне кусо́к ___.", fr: "Elle m'a coupé un morceau de ___." },
    { ru: "Мы съе́ли кусо́к ___.", fr: "Nous avons mangé un morceau de ___." },
    { ru: "Соба́ка нашла́ кусо́к ___.", fr: "Le chien a trouvé un morceau de ___." },
    { ru: "Он положи́л в су́мку кусо́к ___.", fr: "Il a mis dans son sac un morceau de ___." },
    { ru: "Купи́ мне кусо́к ___.", fr: "Achète-moi un morceau de ___." },
  ],
  // стака́н — Я хочу́ стака́н ___.
  "expr-gen-stakan": [
    { ru: "Дай мне, пожа́луйста, стака́н ___.", fr: "Donne-moi un verre de ___, s'il te plaît." },
    { ru: "Он попроси́л стака́н ___.", fr: "Il a demandé un verre de ___." },
    { ru: "Она́ пьёт стака́н ___ у́тром.", fr: "Elle boit un verre de ___ le matin." },
    { ru: "Ты мо́жешь принести́ стака́н ___?", fr: "Peux-tu apporter un verre de ___ ?" },
    { ru: "Мы заказа́ли стака́н ___ в кафе́.", fr: "Nous avons commandé un verre de ___ au café." },
  ],
  // у — Я живу́ у ___.
  "prep-gen-u": [
    { ru: "Ты остаёшься у ___?", fr: "Tu restes chez ___ ?" },
    { ru: "Он рабо́тает у ___.", fr: "Il travaille chez ___." },
    { ru: "Де́ти игра́ют у ___.", fr: "Les enfants jouent chez ___." },
    { ru: "Вы отдыха́ете у ___?", fr: "Vous vous reposez chez ___ ?" },
    { ru: "Я за́втракаю у ___.", fr: "Je prends mon petit-déjeuner chez ___." },
  ],
  // у ... есть — У ___ есть маши́на.
  "expr-gen-u-est": [
    { ru: "У ___ есть большо́й дом.", fr: "___ a une grande maison." },
    { ru: "У ___ есть но́вый телефо́н.", fr: "___ a un nouveau téléphone." },
    { ru: "У ___ есть соба́ка.", fr: "___ a un chien." },
    { ru: "У ___ есть интере́сная рабо́та.", fr: "___ a un travail intéressant." },
    { ru: "У ___ есть краси́вый сад.", fr: "___ a un beau jardin." },
  ],
  // сущ. + сущ. — Э́то маши́на ___.
  "expr-gen-possession": [
    { ru: "Э́то дом ___.", fr: "C'est la maison de ___." },
    { ru: "Э́то соба́ка ___.", fr: "C'est le chien de ___." },
    { ru: "Э́то кни́га ___.", fr: "C'est le livre de ___." },
    { ru: "Э́то иде́я ___.", fr: "C'est l'idée de ___." },
    { ru: "Э́то ко́мната ___.", fr: "C'est la chambre de ___." },
  ],
  // из — Я прие́хал из ___.
  "prep-gen-iz": [
    { ru: "Она́ вы́шла из ___.", fr: "Elle est sortie de ___." },
    { ru: "Мы прилете́ли из ___.", fr: "Nous sommes arrivés en avion de ___." },
    { ru: "Он позвони́л мне из ___.", fr: "Il m'a appelé de ___." },
    { ru: "Ты верну́лся из ___?", fr: "Tu es revenu de ___ ?" },
    { ru: "Они́ прие́хали из ___.", fr: "Ils sont venus de ___." },
  ],
  // от — Э́то письмо́ от ___.
  "prep-gen-ot": [
    { ru: "Он получи́л пода́рок от ___.", fr: "Il a reçu un cadeau de la part de ___." },
    { ru: "Мы ждём отве́т от ___.", fr: "Nous attendons une réponse de ___." },
    { ru: "Я узна́л но́вость от ___.", fr: "J'ai appris la nouvelle de la part de ___." },
    { ru: "Э́то пода́рок от ___.", fr: "C'est un cadeau de ___." },
    { ru: "У меня́ есть сообще́ние от ___.", fr: "J'ai un message de ___." },
  ],
  // с — Я не спал с ___.
  "prep-gen-s": [
    { ru: "Мы не ви́делись с ___.", fr: "On ne s'est pas vus depuis ___." },
    { ru: "Она́ не звони́ла мне с ___.", fr: "Elle ne m'a pas appelé depuis ___." },
    { ru: "Он ничего́ не ел с ___.", fr: "Il n'a rien mangé depuis ___." },
    { ru: "Я не был до́ма с ___.", fr: "Je ne suis pas rentré à la maison depuis ___." },
    { ru: "Мы не разгова́ривали с ___.", fr: "Nous n'avons pas parlé depuis ___." },
  ],
  // до — Мы е́дем до ___.
  "prep-gen-do": [
    { ru: "Мы идём до ___.", fr: "Nous marchons jusqu'à ___." },
    { ru: "Она́ е́дет до ___.", fr: "Elle va jusqu'à ___." },
    { ru: "Ты дойдёшь до ___?", fr: "Tu arriveras jusqu'à ___ ?" },
    { ru: "Он бежи́т до ___.", fr: "Il court jusqu'à ___." },
    { ru: "Вы дое́дете до ___.", fr: "Vous irez jusqu'à ___." },
  ],
  // по́сле — Я приду́ по́сле ___.
  "prep-gen-posle": [
    { ru: "Мы поговори́м по́сле ___.", fr: "Nous parlerons après ___." },
    { ru: "Он позвони́т по́сле ___.", fr: "Il appellera après ___." },
    { ru: "Она́ отдохнёт по́сле ___.", fr: "Elle se reposera après ___." },
    { ru: "Де́ти игра́ют по́сле ___.", fr: "Les enfants jouent après ___." },
    { ru: "Мы пое́дем домо́й по́сле ___.", fr: "Nous rentrerons à la maison après ___." },
  ],
  // во вре́мя — Я молча́л во вре́мя ___.
  "prep-gen-vovremya": [
    { ru: "Она́ усну́ла во вре́мя ___.", fr: "Elle s'est endormie pendant ___." },
    { ru: "Он позвони́л мне во вре́мя ___.", fr: "Il m'a appelé pendant ___." },
    { ru: "Мы познако́мились во вре́мя ___.", fr: "Nous nous sommes rencontrés pendant ___." },
    { ru: "Свет пога́с во вре́мя ___.", fr: "La lumière s'est éteinte pendant ___." },
    { ru: "Она́ пла́кала во вре́мя ___.", fr: "Elle a pleuré pendant ___." },
  ],
  // о́коло — Магази́н о́коло ___.
  "prep-gen-okolo": [
    { ru: "Мы живём о́коло ___.", fr: "Nous habitons près de ___." },
    { ru: "Она́ гуля́ет о́коло ___.", fr: "Elle se promène près de ___." },
    { ru: "Он рабо́тает о́коло ___.", fr: "Il travaille près de ___." },
    { ru: "Де́ти игра́ют о́коло ___.", fr: "Les enfants jouent près de ___." },
    { ru: "Кафе́ нахо́дится о́коло ___.", fr: "Le café se trouve près de ___." },
  ],
  // вокру́г — Де́ти бе́гали вокру́г ___.
  "prep-gen-vokrug": [
    { ru: "Тури́сты ходи́ли вокру́г ___.", fr: "Les touristes marchaient autour de ___." },
    { ru: "Соба́ка бе́гает вокру́г ___.", fr: "Le chien court autour de ___." },
    { ru: "Пти́цы лета́ли вокру́г ___.", fr: "Les oiseaux volaient autour de ___." },
    { ru: "Она́ шла вокру́г ___.", fr: "Elle marchait autour de ___." },
  ],
  // вдоль — Мы гуля́ли вдоль ___.
  "prep-gen-vdol": [
    { ru: "Де́ти игра́ли вдоль ___.", fr: "Les enfants jouaient le long de ___." },
    { ru: "Тури́сты шли вдоль ___.", fr: "Les touristes marchaient le long de ___." },
    { ru: "Мы сиде́ли вдоль ___.", fr: "Nous étions assis le long de ___." },
  ],
  // ми́мо — Я прошёл ми́мо ___.
  "prep-gen-mimo": [
    { ru: "Мы прошли́ ми́мо ___.", fr: "Nous sommes passés devant ___." },
    { ru: "Она́ прошла́ ми́мо ___.", fr: "Elle est passée devant ___." },
    { ru: "Ты прошёл ми́мо ___?", fr: "Tu es passé devant ___ ?" },
    { ru: "Они́ прошли́ ми́мо ___ у́тром.", fr: "Ils sont passés devant ___ le matin." },
    { ru: "Вы прошли́ ми́мо ___ вчера́.", fr: "Vous êtes passés devant ___ hier." },
  ],
  // напро́тив — Кафе́ напро́тив ___.
  "prep-gen-naprotiv": [
    { ru: "Апте́ка напро́тив ___.", fr: "La pharmacie est en face de ___." },
    { ru: "Библиоте́ка напро́тив ___.", fr: "La bibliothèque est en face de ___." },
    { ru: "Це́рковь напро́тив ___.", fr: "L'église est en face de ___." },
  ],
  // среди́ — Я чу́вствую себя́ одино́ко среди́ ___.
  "prep-gen-sredi": [
    { ru: "Он стои́т среди́ ___.", fr: "Il se tient parmi ___." },
    { ru: "Она́ сиди́т среди́ ___.", fr: "Elle est assise parmi ___." },
    { ru: "Ты оста́лся среди́ ___.", fr: "Tu es resté parmi ___." },
    { ru: "Он потеря́лся среди́ ___.", fr: "Il s'est perdu parmi ___." },
  ],
  // про́тив — Я ничего́ не име́ю про́тив ___.
  "prep-gen-protiv": [
    { ru: "Мы ничего́ не име́ем про́тив ___.", fr: "Nous n'avons rien contre ___." },
    { ru: "Она́ ничего́ не име́ет про́тив ___.", fr: "Elle n'a rien contre ___." },
    { ru: "Он никогда́ не был про́тив ___.", fr: "Il n'a jamais été contre ___." },
    { ru: "Я всегда́ был про́тив ___.", fr: "J'ai toujours été contre ___." },
    { ru: "Никто́ не был про́тив ___.", fr: "Personne n'était contre ___." },
  ],
  // кро́ме — Все пришли́, кро́ме ___.
  "prep-gen-krome": [
    { ru: "Все ушли́ домо́й, кро́ме ___.", fr: "Tout le monde est rentré, sauf ___." },
    { ru: "Все получи́ли пода́рки, кро́ме ___.", fr: "Tout le monde a reçu des cadeaux, sauf ___." },
    { ru: "Все спят, кро́ме ___.", fr: "Tout le monde dort, sauf ___." },
    { ru: "Все зна́ют отве́т, кро́ме ___.", fr: "Tout le monde connaît la réponse, sauf ___." },
    { ru: "Все опозда́ли, кро́ме ___.", fr: "Tout le monde est arrivé en retard, sauf ___." },
  ],
  // вме́сто — Возьми́ чай вме́сто ___.
  "prep-gen-vmesto": [
    { ru: "Она́ купи́ла хлеб вме́сто ___.", fr: "Elle a acheté du pain au lieu de ___." },
    { ru: "Он гото́вит ры́бу вме́сто ___.", fr: "Il prépare du poisson au lieu de ___." },
    { ru: "Мы заказа́ли сала́т вме́сто ___.", fr: "Nous avons commandé une salade au lieu de ___." },
    { ru: "Дай мне я́блоко вме́сто ___.", fr: "Donne-moi une pomme au lieu de ___." },
    { ru: "Я пью чай вме́сто ___.", fr: "Je bois du thé au lieu de ___." },
  ],
  // из-за — Я опозда́л из-за ___.
  "prep-gen-izza": [
    { ru: "Она́ уста́ла из-за ___.", fr: "Elle est fatiguée à cause de ___." },
    { ru: "Он не пришёл из-за ___.", fr: "Il n'est pas venu à cause de ___." },
    { ru: "Я не позвони́л из-за ___.", fr: "Je n'ai pas appelé à cause de ___." },
    { ru: "Мы поссо́рились из-за ___.", fr: "Nous nous sommes disputés à cause de ___." },
    { ru: "Она́ пла́кала из-за ___.", fr: "Elle a pleuré à cause de ___." },
  ],
  // из-под — Кот вы́лез из-под ___.
  "prep-gen-izpod": [
    { ru: "Мяч вы́катился из-под ___.", fr: "Le ballon a roulé de dessous ___." },
    { ru: "Соба́ка вы́бежала из-под ___.", fr: "Le chien a couru de dessous ___." },
    { ru: "Мышь вы́скочила из-под ___.", fr: "La souris a bondi de dessous ___." },
    { ru: "Он вы́тащил ключ из-под ___.", fr: "Il a retiré la clé de dessous ___." },
    { ru: "Вода́ вы́текла из-под ___.", fr: "L'eau s'est écoulée de dessous ___." },
  ],
  // без — Я не могу́ жить без ___.
  "prep-gen-bez": [
    { ru: "Он не мо́жет жить без ___.", fr: "Il ne peut pas vivre sans ___." },
    { ru: "Мы не мо́жем жить без ___.", fr: "Nous ne pouvons pas vivre sans ___." },
    { ru: "Ты не мо́жешь жить без ___?", fr: "Tu ne peux pas vivre sans ___ ?" },
    { ru: "Она́ не мо́жет жить без ___.", fr: "Elle ne peut pas vivre sans ___." },
    { ru: "Они́ не мо́гут жить без ___.", fr: "Ils ne peuvent pas vivre sans ___." },
  ],
  // для — Э́то пода́рок для ___.
  "prep-gen-dlya": [
    { ru: "Я купи́л цветы́ для ___.", fr: "J'ai acheté des fleurs pour ___." },
    { ru: "Она́ пригото́вила у́жин для ___.", fr: "Elle a préparé le dîner pour ___." },
    { ru: "Мы нашли́ кварти́ру для ___.", fr: "Nous avons trouvé un appartement pour ___." },
    { ru: "Он написа́л письмо́ для ___.", fr: "Il a écrit une lettre pour ___." },
    { ru: "Ты вы́брал кни́гу для ___.", fr: "Tu as choisi un livre pour ___." },
  ],
  // внутри́ — Кот сиди́т внутри́ ___.
  "prep-gen-vnutri": [
    { ru: "Де́ти игра́ют внутри́ ___.", fr: "Les enfants jouent à l'intérieur de ___." },
    { ru: "Соба́ка спит внутри́ ___.", fr: "Le chien dort à l'intérieur de ___." },
    { ru: "Де́ньги лежа́т внутри́ ___.", fr: "L'argent est à l'intérieur de ___." },
    { ru: "Пти́ца живёт внутри́ ___.", fr: "L'oiseau vit à l'intérieur de ___." },
    { ru: "Он пря́чется внутри́ ___.", fr: "Il se cache à l'intérieur de ___." },
  ],
  // ра́ди — Я сде́лал э́то ра́ди ___.
  "prep-gen-radi": [
    { ru: "Мы рабо́таем ра́ди ___.", fr: "Nous travaillons pour ___." },
    { ru: "Он живёт ра́ди ___.", fr: "Il vit pour ___." },
    { ru: "Ты риску́ешь ра́ди ___.", fr: "Tu prends des risques pour ___." },
    { ru: "Мы прие́хали ра́ди ___.", fr: "Nous sommes venus pour ___." },
    { ru: "Она́ всё бро́сила ра́ди ___.", fr: "Elle a tout abandonné pour ___." },
  ],
  // накану́не — Я пришёл накану́не ___.
  "prep-gen-nakanune": [
    { ru: "Она́ позвони́ла накану́не ___.", fr: "Elle a appelé la veille de ___." },
    { ru: "Мы встре́тились накану́не ___.", fr: "Nous nous sommes rencontrés la veille de ___." },
    { ru: "Он уе́хал накану́не ___.", fr: "Il est parti la veille de ___." },
    { ru: "Врач осмотре́л его́ накану́не ___.", fr: "Le médecin l'a examiné la veille de ___." },
    { ru: "Она́ заболе́ла накану́не ___.", fr: "Elle est tombée malade la veille de ___." },
  ],
  // вро́де — Э́то что-то вро́де ___.
  "prep-gen-vrode": [
    { ru: "Мы нашли́ не́что вро́де ___.", fr: "Nous avons trouvé une sorte de ___." },
    { ru: "Она́ купи́ла не́что вро́де ___.", fr: "Elle a acheté une sorte de ___." },
    { ru: "Он купи́л не́что вро́де ___.", fr: "Il a acheté une sorte de ___." },
    { ru: "Ты ви́дишь не́что вро́де ___?", fr: "Tu vois une sorte de ___ ?" },
    { ru: "Я взял не́что вро́де ___.", fr: "J'ai pris une sorte de ___." },
  ],
  // боя́ться — Я бою́сь ___.
  "verb-gen-boyatsya": [
    { ru: "Она́ бои́тся ___.", fr: "Elle a peur de ___." },
    { ru: "Мы бои́мся ___.", fr: "Nous avons peur de ___." },
    { ru: "Ты бои́шься ___?", fr: "Tu as peur de ___ ?" },
    { ru: "Вы бои́тесь ___?", fr: "Vous avez peur de ___ ?" },
    { ru: "Он всегда́ боя́лся ___.", fr: "Il a toujours eu peur de ___." },
  ],
  // избега́ть — Я избега́ю ___.
  "verb-gen-izbegat": [
    { ru: "Он всегда́ избега́ет ___.", fr: "Il évite toujours ___." },
    { ru: "Она́ избега́ет ___ ка́ждый день.", fr: "Elle évite ___ chaque jour." },
    { ru: "Вы избега́ете ___ по́сле обе́да?", fr: "Vous évitez ___ après le déjeuner ?" },
    { ru: "Я всегда́ избега́л ___ ра́ньше.", fr: "J'évitais toujours ___ avant." },
  ],
  // жела́ть — Жела́ю тебе́ ___.
  "verb-gen-zhelat": [
    { ru: "Жела́ю вам ___.", fr: "Je vous souhaite ___." },
    { ru: "Жела́ю сестре́ ___.", fr: "Je souhaite ___ à ma sœur." },
    { ru: "Жела́ю друзья́м ___.", fr: "Je souhaite ___ à mes amis." },
    { ru: "Жела́ю ва́шей ма́ме ___.", fr: "Je souhaite ___ à votre maman." },
    { ru: "Жела́ю колле́гам ___.", fr: "Je souhaite ___ à mes collègues." },
  ],
  // тре́бовать — Я тре́бую ___.
  "verb-gen-trebovat": [
    { ru: "Она́ тре́бует ___.", fr: "Elle exige ___." },
    { ru: "Дире́ктор тре́бует ___.", fr: "Le directeur exige ___." },
    { ru: "Мы тре́буем ___.", fr: "Nous exigeons ___." },
    { ru: "Клие́нт тре́бует ___.", fr: "Le client exige ___." },
    { ru: "Судья́ тре́бует ___.", fr: "Le juge exige ___." },
  ],
  // каса́ться — Э́то каса́ется ___.
  "verb-gen-kasatsya": [
    { ru: "Э́то напряму́ю каса́ется ___.", fr: "Ça concerne directement ___." },
    { ru: "Изве́стие каса́ется ___.", fr: "La nouvelle concerne ___." },
    { ru: "Письмо́ каса́ется ___.", fr: "La lettre concerne ___." },
    { ru: "Э́то не каса́ется ___.", fr: "Ça ne concerne pas ___." },
    { ru: "Э́тот прика́з каса́ется ___.", fr: "Cet ordre concerne ___." },
  ],
  // достига́ть — Мы дости́гли ___.
  "verb-gen-dostigat": [
    { ru: "Он наконе́ц дости́г ___.", fr: "Il a enfin atteint ___." },
    { ru: "Спортсме́ны дости́гли ___.", fr: "Les sportifs ont atteint ___." },
    { ru: "Компа́ния дости́гла ___.", fr: "L'entreprise a atteint ___." },
    { ru: "Ты уже́ дости́г ___?", fr: "Tu as déjà atteint ___ ?" },
    { ru: "Мы бы́стро дости́гнем ___.", fr: "Nous allons vite atteindre ___." },
  ],
  // вы́пить — Я хочу́ вы́пить ___.
  "verb-gen-vypit": [
    { ru: "Он хо́чет вы́пить ___.", fr: "Il veut boire un peu de ___." },
    { ru: "Ты хо́чешь вы́пить ___?", fr: "Tu veux boire un peu de ___ ?" },
    { ru: "Мы хоти́м вы́пить ___.", fr: "Nous voulons boire un peu de ___." },
    { ru: "Она́ хо́чет вы́пить ___.", fr: "Elle veut boire un peu de ___." },
    { ru: "Вы хоти́те вы́пить ___?", fr: "Vous voulez boire un peu de ___ ?" },
  ],
  // лиши́ться — Он лиши́лся ___.
  "verb-gen-lishitsya": [
    { ru: "Она́ лиши́лась ___ по́сле ава́рии.", fr: "Elle a perdu ___ après l'accident." },
    { ru: "Мы лиши́лись ___ в э́том году́.", fr: "Nous avons perdu ___ cette année." },
    { ru: "Ты лиши́лся ___ навсегда́.", fr: "Tu as perdu ___ pour toujours." },
    { ru: "Я лиши́лся ___ на про́шлой неде́ле.", fr: "J'ai perdu ___ la semaine dernière." },
    { ru: "Вы лиши́лись ___ сли́шком ра́но.", fr: "Vous avez perdu ___ trop tôt." },
  ],
  // стесня́ться — Не стесня́йся ___.
  "verb-gen-stesnyatsya": [
    { ru: "Она́ стесня́ется ___.", fr: "Elle a honte de ___." },
    { ru: "Я стесня́юсь ___.", fr: "J'ai honte de ___." },
    { ru: "Ты не до́лжен стесня́ться ___.", fr: "Tu ne dois pas avoir honte de ___." },
    { ru: "Он всегда́ стесня́ется ___.", fr: "Il a toujours honte de ___." },
    { ru: "Почему́ ты стесня́ешься ___?", fr: "Pourquoi as-tu honte de ___ ?" },
  ],
  // слу́шаться — Де́ти слу́шаются ___.
  "verb-gen-slushatsya": [
    { ru: "Ученики́ слу́шаются ___.", fr: "Les élèves obéissent à ___." },
    { ru: "Соба́ка слу́шается ___.", fr: "Le chien obéit à ___." },
    { ru: "Солда́ты слу́шаются ___.", fr: "Les soldats obéissent à ___." },
    { ru: "Вну́ки слу́шаются ___.", fr: "Les petits-enfants obéissent à ___." },
    { ru: "Пацие́нты слу́шаются ___.", fr: "Les patients obéissent à ___." },
  ],
  // по́лный — Стака́н по́лный ___.
  "expr-gen-polnyy": [
    { ru: "Ведро́ по́лное ___.", fr: "Le seau est plein de ___." },
    { ru: "Бока́л по́лный ___.", fr: "Le verre à pied est plein de ___." },
    { ru: "Кувши́н по́лный ___.", fr: "La cruche est pleine de ___." },
    { ru: "Мешо́к по́лный ___.", fr: "Le sac est plein de ___." },
  ],
  // досто́ин — Он досто́ин ___.
  "expr-gen-dostoin": [
    { ru: "Она́ досто́йна ___.", fr: "Elle est digne de ___." },
    { ru: "Мы досто́йны ___.", fr: "Nous sommes dignes de ___." },
    { ru: "Ты досто́ин ___.", fr: "Tu es digne de ___." },
    { ru: "Вы досто́йны ___.", fr: "Vous êtes digne de ___." },
    { ru: "Э́тот актёр досто́ин ___.", fr: "Cet acteur est digne de ___." },
  ],
  // жаль — Мне жаль ___.
  "expr-gen-zhal": [
    { ru: "Нам всем жаль ___.", fr: "Nous sommes tous désolés pour ___." },
    { ru: "Ему́ о́чень жаль ___.", fr: "Il est très désolé pour ___." },
    { ru: "Ей всегда́ жаль ___.", fr: "Elle a toujours de la peine pour ___." },
    { ru: "Тебе́ не жаль ___?", fr: "Tu n'es pas désolé pour ___ ?" },
    { ru: "Вам пра́вда жаль ___?", fr: "Vous êtes vraiment désolé pour ___ ?" },
  ],
  // к — Я иду́ к ___.
  "prep-dat-k": [
    { ru: "Мы идём к ___.", fr: "Nous allons vers ___." },
    { ru: "Она́ идёт к ___.", fr: "Elle va vers ___." },
    { ru: "Ты идёшь к ___?", fr: "Tu vas vers ___ ?" },
    { ru: "Ве́чером я иду́ к ___.", fr: "Le soir je vais vers ___." },
    { ru: "Он бежи́т к ___.", fr: "Il court vers ___." },
  ],
  // по — Я гуля́ю по ___.
  "prep-dat-po": [
    { ru: "Мы гуля́ем по ___ ве́чером.", fr: "Nous nous promenons le long de ___ le soir." },
    { ru: "Ты гуля́ешь по ___ ка́ждый день.", fr: "Tu te promènes le long de ___ tous les jours." },
    { ru: "Она́ гуля́ет по ___ у́тром.", fr: "Elle se promène le long de ___ le matin." },
    { ru: "Де́ти гуля́ют по ___ по́сле шко́лы.", fr: "Les enfants se promènent le long de ___ après l'école." },
    { ru: "Вы гуля́ете по ___ в суббо́ту?", fr: "Vous vous promenez le long de ___ le samedi ?" },
  ],
  // благодаря́ — Мы победи́ли благодаря́ ___.
  "prep-dat-blagodarya": [
    { ru: "Она́ вы́здоровела благодаря́ ___.", fr: "Elle a guéri grâce à ___." },
    { ru: "Он стал си́льным благодаря́ ___.", fr: "Il est devenu fort grâce à ___." },
    { ru: "Го́род спасли́ благодаря́ ___.", fr: "La ville a été sauvée grâce à ___." },
    { ru: "Мы по́няли текст благодаря́ ___.", fr: "Nous avons compris le texte grâce à ___." },
    { ru: "Она́ сдала́ экза́мен благодаря́ ___.", fr: "Elle a réussi l'examen grâce à ___." },
  ],
  // вопреки́ — Мы вы́играли вопреки́ ___.
  "prep-dat-vopreki": [
    { ru: "Он пое́хал вопреки́ ___.", fr: "Il est parti malgré ___." },
    { ru: "Она́ вы́шла на рабо́ту вопреки́ ___.", fr: "Elle est retournée au travail malgré ___." },
    { ru: "Кома́нда победи́ла вопреки́ ___.", fr: "L'équipe a gagné malgré ___." },
    { ru: "Он при́нял реше́ние вопреки́ ___.", fr: "Il a pris une décision malgré ___." },
    { ru: "Мы продо́лжили вопреки́ ___.", fr: "Nous avons continué malgré ___." },
  ],
  // согла́сно — Согла́сно ___, э́то пра́вда.
  "prep-dat-soglasno": [
    { ru: "Согла́сно ___, пого́да изме́нится за́втра.", fr: "Selon ___, le temps va changer demain." },
    { ru: "Согла́сно ___, де́ньги уже́ отпра́влены.", fr: "Selon ___, l'argent a déjà été envoyé." },
    { ru: "Согла́сно ___, ну́жно подожда́ть неде́лю.", fr: "Selon ___, il faut attendre une semaine." },
    { ru: "Согла́сно ___, компа́ния закро́ется в ма́е.", fr: "Selon ___, l'entreprise va fermer en mai." },
    { ru: "Согла́сно ___, маши́на стои́т сли́шком до́рого.", fr: "Selon ___, la voiture coûte trop cher." },
  ],
  // помога́ть — Я помога́ю ___.
  "verb-dat-pomogat": [
    { ru: "Ты всегда́ помога́ешь ___.", fr: "Tu aides toujours ___." },
    { ru: "Мы помога́ем ___ ка́ждый день.", fr: "Nous aidons ___ tous les jours." },
    { ru: "Он помога́ет ___ до́ма.", fr: "Il aide ___ à la maison." },
    { ru: "Она́ помога́ет ___ на рабо́те.", fr: "Elle aide ___ au travail." },
    { ru: "Вы помога́ете ___ сего́дня?", fr: "Vous aidez ___ aujourd'hui ?" },
  ],
  // звони́ть — Я звоню́ ___.
  "verb-dat-zvonit": [
    { ru: "Он звони́т ___ ка́ждый ве́чер.", fr: "Il téléphone à ___ tous les soirs." },
    { ru: "Мы звони́м ___ у́тром.", fr: "Nous téléphonons à ___ le matin." },
    { ru: "Ты звони́шь ___ из о́фиса?", fr: "Tu téléphones à ___ depuis le bureau ?" },
    { ru: "Она́ звони́т ___ пе́ред встре́чей.", fr: "Elle téléphone à ___ avant la réunion." },
    { ru: "Вы звони́те ___ по суббо́там?", fr: "Vous téléphonez à ___ le samedi ?" },
  ],
  // нра́виться — Э́та му́зыка нра́вится ___.
  "verb-dat-nravitsya": [
    { ru: "Э́тот фильм нра́вится ___.", fr: "Ce film plaît à ___." },
    { ru: "Ру́сский язы́к нра́вится ___.", fr: "La langue russe plaît à ___." },
    { ru: "Э́то пла́тье нра́вится ___.", fr: "Cette robe plaît à ___." },
    { ru: "Мой пода́рок нра́вится ___.", fr: "Mon cadeau plaît à ___." },
    { ru: "Э́та карти́на нра́вится ___.", fr: "Ce tableau plaît à ___." },
  ],
  // дава́ть — Я даю́ пода́рок ___.
  "verb-dat-davat": [
    { ru: "Она́ даёт письмо́ ___.", fr: "Elle donne une lettre à ___." },
    { ru: "Мы даём кни́гу ___.", fr: "Nous donnons un livre à ___." },
    { ru: "Ты даёшь де́ньги ___.", fr: "Tu donnes de l'argent à ___." },
    { ru: "Он даёт сове́т ___.", fr: "Il donne un conseil à ___." },
    { ru: "Вы даёте ключ ___.", fr: "Vous donnez une clé à ___." },
  ],
  // ве́рить — Я ве́рю ___.
  "verb-dat-verit": [
    { ru: "Ты ве́ришь ___?", fr: "Tu crois ___ ?" },
    { ru: "Мы ве́рим ___.", fr: "Nous croyons ___." },
    { ru: "Она́ ве́рит ___.", fr: "Elle croit ___." },
    { ru: "Он всегда́ ве́рит ___.", fr: "Il croit toujours ___." },
    { ru: "Они́ не ве́рят ___.", fr: "Ils ne croient pas ___." },
  ],
  // доверя́ть — Я доверя́ю ___.
  "verb-dat-doveryat": [
    { ru: "Мы доверя́ем ___.", fr: "Nous faisons confiance à ___." },
    { ru: "Ты доверя́ешь ___?", fr: "Tu fais confiance à ___ ?" },
    { ru: "Она́ доверя́ет ___.", fr: "Elle fait confiance à ___." },
    { ru: "Он всегда́ доверя́ет ___.", fr: "Il fait toujours confiance à ___." },
    { ru: "Вы доверя́ете ___?", fr: "Vous faites confiance à ___ ?" },
  ],
  // сове́товать — Я сове́тую ___.
  "verb-dat-sovetovat": [
    { ru: "Мы сове́туем ___.", fr: "Nous conseillons ___." },
    { ru: "Он сове́тует ___.", fr: "Il conseille ___." },
    { ru: "Ты сове́туешь ___?", fr: "Tu conseilles ___ ?" },
    { ru: "Она́ всегда́ сове́тует ___.", fr: "Elle conseille toujours ___." },
    { ru: "Вы сове́туете ___?", fr: "Vous conseillez ___ ?" },
  ],
  // зави́довать — Я зави́дую ___.
  "verb-dat-zavidovat": [
    { ru: "Мы зави́дуем ___.", fr: "Nous envions ___." },
    { ru: "Ты зави́дуешь ___?", fr: "Tu envies ___ ?" },
    { ru: "Она́ зави́дует ___.", fr: "Elle envie ___." },
    { ru: "Они́ зави́дуют ___.", fr: "Ils envient ___." },
    { ru: "Он всегда́ зави́дует ___.", fr: "Il envie toujours ___." },
  ],
  // отвеча́ть — Я отвеча́ю ___.
  "verb-dat-otvechat": [
    { ru: "Он всегда́ отвеча́ет ___.", fr: "Il répond toujours à ___." },
    { ru: "Ты не отвеча́ешь ___?", fr: "Tu ne réponds pas à ___ ?" },
    { ru: "Мы отвеча́ем ___ по телефо́ну.", fr: "Nous répondons à ___ par téléphone." },
    { ru: "Она́ отвеча́ет ___ ка́ждый день.", fr: "Elle répond à ___ chaque jour." },
    { ru: "Вы отвеча́ете ___ письмо́м.", fr: "Vous répondez à ___ par lettre." },
  ],
  // меша́ть — Не меша́й ___.
  "verb-dat-meshat": [
    { ru: "Она́ меша́ет ___.", fr: "Elle dérange ___." },
    { ru: "Ты меша́ешь ___.", fr: "Tu déranges ___." },
    { ru: "Мы меша́ем ___.", fr: "Nous dérangeons ___." },
    { ru: "Вы меша́ете ___?", fr: "Vous dérangez ___ ?" },
    { ru: "Шум меша́ет ___.", fr: "Le bruit dérange ___." },
  ],
  // разреша́ть — Ма́ма разреша́ет ___.
  "verb-dat-razreshat": [
    { ru: "Почему́ ты разреша́ешь ___?", fr: "Pourquoi donnes-tu la permission à ___ ?" },
    { ru: "Я всегда́ разреша́ю ___.", fr: "Je donne toujours la permission à ___." },
    { ru: "Мы разреша́ем ___.", fr: "Nous donnons la permission à ___." },
    { ru: "Она́ ре́дко разреша́ет ___.", fr: "Elle donne rarement la permission à ___." },
    { ru: "Роди́тели не разреша́ют ___.", fr: "Les parents ne donnent pas la permission à ___." },
  ],
  // удивля́ться — Я удивля́юсь ___.
  "verb-dat-udivlyatsya": [
    { ru: "Мы удивля́емся ___.", fr: "Nous sommes surpris de ___." },
    { ru: "Ты удивля́ешься ___?", fr: "Tu es surpris de ___ ?" },
    { ru: "Она́ удивля́ется ___ ка́ждый раз.", fr: "Elle est surprise de ___ chaque fois." },
    { ru: "Вы удивля́етесь ___?", fr: "Vous êtes surpris de ___ ?" },
    { ru: "Он всегда́ удивля́ется ___.", fr: "Il est toujours surpris de ___." },
  ],
  // ра́доваться — Я ра́дуюсь ___.
  "verb-dat-radovatsya": [
    { ru: "Мы ра́дуемся ___.", fr: "Nous nous réjouissons de ___." },
    { ru: "Ты ра́дуешься ___?", fr: "Tu te réjouis de ___ ?" },
    { ru: "Она́ ра́дуется ___.", fr: "Elle se réjouit de ___." },
    { ru: "Они́ ра́дуются ___.", fr: "Ils se réjouissent de ___." },
    { ru: "Он всегда́ ра́дуется ___.", fr: "Il se réjouit toujours de ___." },
  ],
  // принадлежа́ть — Э́та иде́я принадлежи́т ___.
  "verb-dat-prinadlezhat": [
    { ru: "Дом принадлежи́т ___.", fr: "La maison appartient à ___." },
    { ru: "Земля́ принадлежи́т ___.", fr: "Le terrain appartient à ___." },
    { ru: "Маши́на принадлежи́т ___.", fr: "La voiture appartient à ___." },
    { ru: "Соба́ка принадлежи́т ___.", fr: "Le chien appartient à ___." },
    { ru: "Кварти́ра принадлежи́т ___.", fr: "L'appartement appartient à ___." },
  ],
  // сочу́вствовать — Я сочу́вствую ___.
  "verb-dat-sochuvstvovat": [
    { ru: "Мы сочу́вствуем ___.", fr: "Nous compatissons avec ___." },
    { ru: "Ты сочу́вствуешь ___?", fr: "Tu compatis avec ___ ?" },
    { ru: "Она́ сочу́вствует ___.", fr: "Elle compatit avec ___." },
    { ru: "Он всегда́ сочу́вствует ___.", fr: "Il compatit toujours avec ___." },
  ],
  // угрожа́ть — Он угрожа́ет ___.
  "verb-dat-ugrozhat": [
    { ru: "Она́ угрожа́ет ___ ка́ждый день.", fr: "Elle menace ___ tous les jours." },
    { ru: "Ты угрожа́ешь ___?", fr: "Tu menaces ___ ?" },
    { ru: "Мы угрожа́ем ___.", fr: "Nous menaçons ___." },
    { ru: "Он угрожа́л ___ вчера́.", fr: "Il a menacé ___ hier." },
  ],
  // подчиня́ться — Мы подчиня́емся ___.
  "verb-dat-podchinyatsya": [
    { ru: "Солда́ты подчиня́ются ___.", fr: "Les soldats obéissent à ___." },
    { ru: "Де́ти всегда́ подчиня́ются ___.", fr: "Les enfants obéissent toujours à ___." },
    { ru: "Здесь все подчиня́ются ___.", fr: "Ici tout le monde obéit à ___." },
    { ru: "Ты до́лжен подчиня́ться ___.", fr: "Tu dois obéir à ___." },
    { ru: "Рабо́чие подчиня́ются ___.", fr: "Les ouvriers obéissent à ___." },
  ],
  // сопротивля́ться — Я сопротивля́юсь ___.
  "verb-dat-soprotivlyatsya": [
    { ru: "Он сопротивля́ется ___.", fr: "Il résiste à ___." },
    { ru: "Мы сопротивля́емся ___.", fr: "Nous résistons à ___." },
    { ru: "Ты сопротивля́ешься ___?", fr: "Tu résistes à ___ ?" },
    { ru: "Она́ до́лго сопротивля́лась ___.", fr: "Elle a longtemps résisté à ___." },
    { ru: "Они́ не сопротивля́ются ___.", fr: "Ils ne résistent pas à ___." },
  ],
  // аплоди́ровать — Зри́тели аплоди́руют ___.
  "verb-dat-aplodirovat": [
    { ru: "Пу́блика до́лго аплоди́рует ___.", fr: "Le public applaudit longtemps ___." },
    { ru: "Мы аплоди́руем ___.", fr: "Nous applaudissons ___." },
    { ru: "Все аплоди́руют ___ по́сле конце́рта.", fr: "Tout le monde applaudit ___ après le concert." },
    { ru: "Он аплоди́рует ___ ка́ждый ве́чер.", fr: "Il applaudit ___ chaque soir." },
    { ru: "Зал аплоди́рует ___ сто́я.", fr: "La salle applaudit ___ debout." },
  ],
  // служи́ть — Я служу́ ___.
  "verb-dat-sluzhit": [
    { ru: "Он слу́жит ___.", fr: "Il sert ___." },
    { ru: "Мы слу́жим ___.", fr: "Nous servons ___." },
    { ru: "Она́ слу́жит ___.", fr: "Elle sert ___." },
    { ru: "Ты слу́жишь ___?", fr: "Tu sers ___ ?" },
    { ru: "Они́ слу́жат ___.", fr: "Ils servent ___." },
  ],
  // ви́деть — Я ви́жу ___.
  "verb-acc-videt": [
    { ru: "Ты ви́дишь ___?", fr: "Tu vois ___ ?" },
    { ru: "Мы ви́дим ___ там.", fr: "Nous voyons ___ là-bas." },
    { ru: "Она́ ви́дит ___ у́тром.", fr: "Elle voit ___ le matin." },
    { ru: "Вы ви́дите ___ сейча́с?", fr: "Vous voyez ___ maintenant ?" },
    { ru: "Он ви́дит ___ ка́ждый день.", fr: "Il voit ___ chaque jour." },
  ],
  // люби́ть — Я люблю́ ___.
  "verb-acc-lyubit": [
    { ru: "Ты лю́бишь ___?", fr: "Tu aimes ___ ?" },
    { ru: "Она́ лю́бит ___.", fr: "Elle aime ___." },
    { ru: "Я всегда́ люби́л ___.", fr: "J'ai toujours aimé ___." },
  ],
  // чита́ть — Я чита́ю ___.
  "verb-acc-chitat": [
    { ru: "Мы чита́ем ___ ве́чером.", fr: "Nous lisons ___ le soir." },
    { ru: "Ты чита́ешь ___ ка́ждый день?", fr: "Tu lis ___ tous les jours ?" },
    { ru: "Де́ти чита́ют ___ пе́ред сном.", fr: "Les enfants lisent ___ avant de dormir." },
    { ru: "Я чита́ю ___ в авто́бусе.", fr: "Je lis ___ dans le bus." },
    { ru: "Студе́нты чита́ют ___ на уро́ке.", fr: "Les étudiants lisent ___ en cours." },
  ],
  // знать — Я хорошо́ зна́ю ___.
  "verb-acc-znat": [
    { ru: "Мы давно́ зна́ем ___.", fr: "Nous connaissons ___ depuis longtemps." },
    { ru: "Ты пра́вда не зна́ешь ___?", fr: "Tu ne connais vraiment pas ___ ?" },
    { ru: "Она́ немно́го зна́ет ___.", fr: "Elle connaît un peu ___." },
    { ru: "Я ли́чно зна́ю ___.", fr: "Je connais personnellement ___." },
    { ru: "Журнали́сты уже́ зна́ют ___.", fr: "Les journalistes connaissent déjà ___." },
  ],
  // покупа́ть — Я покупа́ю ___.
  "verb-acc-pokupat": [
    { ru: "Мы покупа́ем ___ в магази́не.", fr: "Nous achetons ___ au magasin." },
    { ru: "Ты покупа́ешь ___ на ры́нке?", fr: "Tu achètes ___ au marché ?" },
    { ru: "Вы покупа́ете ___ ка́ждый день?", fr: "Vous achetez ___ tous les jours ?" },
    { ru: "Де́ти покупа́ют ___ у́тром.", fr: "Les enfants achètent ___ le matin." },
    { ru: "Я покупа́ю ___ на пра́здник.", fr: "J'achète ___ pour la fête." },
  ],
  // писа́ть — Я пишу́ ___.
  "verb-acc-pisat": [
    { ru: "Ты пи́шешь ___ ка́ждый день?", fr: "Tu écris ___ chaque jour ?" },
    { ru: "Она́ пи́шет ___ ве́чером.", fr: "Elle écrit ___ le soir." },
    { ru: "Мы пи́шем ___ для уро́ка.", fr: "Nous écrivons ___ pour le cours." },
    { ru: "Он пи́шет ___ у́тром.", fr: "Il écrit ___ le matin." },
    { ru: "Они́ пи́шут ___ на рабо́те.", fr: "Ils écrivent ___ au travail." },
  ],
  // понима́ть — Я понима́ю ___.
  "verb-acc-ponimat": [
    { ru: "Мы понима́ем ___.", fr: "Nous comprenons ___." },
    { ru: "Ты понима́ешь ___?", fr: "Tu comprends ___ ?" },
    { ru: "Он не понима́ет ___.", fr: "Il ne comprend pas ___." },
    { ru: "Она́ хорошо́ понима́ет ___.", fr: "Elle comprend bien ___." },
    { ru: "Я наконе́ц понима́ю ___.", fr: "Je comprends enfin ___." },
  ],
  // слу́шать — Я слу́шаю ___.
  "verb-acc-slushat": [
    { ru: "Ты слу́шаешь ___ ка́ждый ве́чер?", fr: "Tu écoutes ___ chaque soir ?" },
    { ru: "Мы слу́шаем ___ по ра́дио.", fr: "Nous écoutons ___ à la radio." },
    { ru: "Она́ слу́шает ___ внима́тельно.", fr: "Elle écoute ___ attentivement." },
    { ru: "Вы слу́шаете ___ сейча́с?", fr: "Vous écoutez ___ maintenant ?" },
    { ru: "Он слу́шал ___ вчера́ но́чью.", fr: "Il écoutait ___ hier soir." },
  ],
  // есть — Я ем ___.
  "verb-acc-est": [
    { ru: "Она́ ест ___ ка́ждый день.", fr: "Elle mange ___ tous les jours." },
    { ru: "Мы еди́м ___ у́тром.", fr: "Nous mangeons ___ le matin." },
    { ru: "Де́ти едя́т ___ ве́чером.", fr: "Les enfants mangent ___ le soir." },
    { ru: "Вы еди́те ___ до́ма?", fr: "Vous mangez ___ à la maison ?" },
    { ru: "Кот ест ___ на ку́хне.", fr: "Le chat mange ___ dans la cuisine." },
  ],
  // пить — Я пью ___.
  "verb-acc-pit": [
    { ru: "Мы пьём ___ ка́ждый день.", fr: "Nous buvons ___ tous les jours." },
    { ru: "Она́ пьёт ___ на за́втрак.", fr: "Elle boit ___ au petit-déjeuner." },
    { ru: "Де́ти пьют ___ ве́чером.", fr: "Les enfants boivent ___ le soir." },
    { ru: "Вы пьёте ___ на рабо́те?", fr: "Vous buvez ___ au travail ?" },
    { ru: "Я пью ___ до́ма.", fr: "Je bois ___ à la maison." },
  ],
  // де́лать — Я де́лаю ___.
  "verb-acc-delat": [
    { ru: "Ты де́лаешь ___ по утра́м?", fr: "Tu fais ___ le matin ?" },
    { ru: "Она́ де́лает ___ на ку́хне.", fr: "Elle fait ___ dans la cuisine." },
    { ru: "Мы де́лаем ___ вме́сте.", fr: "Nous faisons ___ ensemble." },
    { ru: "Он де́лает ___ для друзе́й.", fr: "Il fait ___ pour ses amis." },
    { ru: "Вы де́лаете ___ ка́ждый день?", fr: "Vous faites ___ tous les jours ?" },
  ],
  // встреча́ть — Я встреча́ю ___.
  "verb-acc-vstrechat": [
    { ru: "Мы встреча́ем ___ на вокза́ле.", fr: "Nous rencontrons ___ à la gare." },
    { ru: "Вы встреча́ете ___ здесь ча́сто?", fr: "Vous rencontrez ___ ici souvent ?" },
    { ru: "Я встреча́ю ___ по́сле рабо́ты.", fr: "Je rencontre ___ après le travail." },
    { ru: "Мы встреча́ем ___ в аэропо́рту.", fr: "Nous rencontrons ___ à l'aéroport." },
  ],
  // брать — Я беру́ ___.
  "verb-acc-brat": [
    { ru: "Ты берёшь ___ со стола́?", fr: "Tu prends ___ sur la table ?" },
    { ru: "Мы берём ___ на ку́хне.", fr: "Nous prenons ___ dans la cuisine." },
    { ru: "Он берёт ___ у дру́га.", fr: "Il prend ___ chez un ami." },
    { ru: "Она́ берёт ___ ка́ждое у́тро.", fr: "Elle prend ___ chaque matin." },
    { ru: "Я беру́ ___ в доро́гу.", fr: "Je prends ___ pour la route." },
  ],
  // изуча́ть — Я изуча́ю ___.
  "verb-acc-izuchat": [
    { ru: "Он изуча́ет ___.", fr: "Il étudie ___." },
    { ru: "Мы изуча́ем ___.", fr: "Nous étudions ___." },
    { ru: "Ты изуча́ешь ___?", fr: "Tu étudies ___ ?" },
    { ru: "Она́ изуча́ет ___ ве́чером.", fr: "Elle étudie ___ le soir." },
    { ru: "Студе́нты изуча́ют ___.", fr: "Les étudiants étudient ___." },
  ],
  // ненави́деть — Я ненави́жу ___.
  "verb-acc-nenavidet": [
    { ru: "Он ненави́дит ___.", fr: "Il déteste ___." },
    { ru: "Ты ненави́дишь ___?", fr: "Tu détestes ___ ?" },
    { ru: "Мы ненави́дим ___.", fr: "Nous détestons ___." },
    { ru: "Она́ ненави́дела ___.", fr: "Elle détestait ___." },
    { ru: "Вы ненави́дите ___?", fr: "Vous détestez ___ ?" },
  ],
  // в — Я иду́ в ___.
  "prep-acc-v": [
    { ru: "Мы идём в ___.", fr: "Nous allons dans ___." },
    { ru: "Ты идёшь в ___?", fr: "Tu vas dans ___ ?" },
    { ru: "Она́ идёт в ___ у́тром.", fr: "Elle va dans ___ le matin." },
    { ru: "Де́ти бегу́т в ___.", fr: "Les enfants courent dans ___." },
    { ru: "Вы идёте в ___ ве́чером?", fr: "Vous allez dans ___ le soir ?" },
  ],
  // на — Я смотрю́ на ___.
  "prep-acc-na": [
    { ru: "Мы смо́трим на ___.", fr: "Nous regardons ___." },
    { ru: "Он смо́трит на ___.", fr: "Il regarde ___." },
    { ru: "Она́ смо́трит на ___ ка́ждый день.", fr: "Elle regarde ___ tous les jours." },
    { ru: "Ты смо́тришь на ___ у́тром.", fr: "Tu regardes ___ le matin." },
    { ru: "Я смотре́л на ___ вчера́ ве́чером.", fr: "Je regardais ___ hier soir." },
  ],
  // за — Спаси́бо за ___.
  "prep-acc-za": [
    { ru: "Она́ сказа́ла спаси́бо за ___.", fr: "Elle a dit merci pour ___." },
    { ru: "Мы говори́м спаси́бо за ___.", fr: "Nous disons merci pour ___." },
    { ru: "Спаси́бо тебе́ за ___.", fr: "Merci à toi pour ___." },
    { ru: "Спаси́бо вам за ___.", fr: "Merci à vous pour ___." },
    { ru: "Де́ти сказа́ли спаси́бо за ___.", fr: "Les enfants ont dit merci pour ___." },
  ],
  // че́рез — Мы е́дем че́рез ___.
  "prep-acc-cherez": [
    { ru: "Он идёт че́рез ___.", fr: "Il traverse ___." },
    { ru: "Ты бежи́шь че́рез ___.", fr: "Tu cours à travers ___." },
    { ru: "Она́ е́дет че́рез ___.", fr: "Elle passe par ___." },
    { ru: "Мы идём че́рез ___.", fr: "Nous marchons à travers ___." },
    { ru: "Я иду́ че́рез ___.", fr: "Je passe par ___." },
  ],
  // про — Расскажи́ мне про ___.
  "prep-acc-pro": [
    { ru: "Он ча́сто пи́шет про ___.", fr: "Il écrit souvent à propos de ___." },
    { ru: "Мы говори́ли вчера́ про ___.", fr: "Nous avons parlé hier à propos de ___." },
    { ru: "Она́ спроси́ла меня́ про ___.", fr: "Elle m'a demandé à propos de ___." },
  ],
  // сквозь — Я ви́жу свет сквозь ___.
  "prep-acc-skvoz": [
    { ru: "Мы слы́шим му́зыку сквозь ___.", fr: "Nous entendons la musique à travers ___." },
    { ru: "Ко́шка смо́трит сквозь ___.", fr: "Le chat regarde à travers ___." },
    { ru: "Он прошёл сквозь ___.", fr: "Il est passé à travers ___." },
    { ru: "Ве́тер ду́ет сквозь ___.", fr: "Le vent souffle à travers ___." },
    { ru: "Она́ услы́шала го́лос сквозь ___.", fr: "Elle a entendu une voix à travers ___." },
  ],
  // несмотря́ на — Несмотря́ на ___, мы пошли́ гуля́ть.
  "prep-acc-nesmotrya-na": [
    { ru: "Несмотря́ на ___, они́ пое́хали на юг.", fr: "Malgré ___, ils sont partis dans le sud." },
    { ru: "Несмотря́ на ___, де́ти игра́ли на у́лице.", fr: "Malgré ___, les enfants jouaient dans la rue." },
    { ru: "Несмотря́ на ___, она́ пришла́ на рабо́ту.", fr: "Malgré ___, elle est venue au travail." },
    { ru: "Несмотря́ на ___, мы зако́нчили прое́кт.", fr: "Malgré ___, nous avons terminé le projet." },
    { ru: "Несмотря́ на ___, он продолжа́л бежа́ть.", fr: "Malgré ___, il continuait à courir." },
  ],
  // с — Я пью чай с ___.
  "prep-instr-s": [
    { ru: "Она́ разгова́ривает с ___.", fr: "Elle parle avec ___." },
    { ru: "Мы гуля́ем с ___.", fr: "Nous nous promenons avec ___." },
    { ru: "Он живёт с ___.", fr: "Il habite avec ___." },
    { ru: "Ты идёшь в кино́ с ___?", fr: "Tu vas au cinéma avec ___ ?" },
    { ru: "Де́ти игра́ют с ___.", fr: "Les enfants jouent avec ___." },
  ],
  // под — Кот спит под ___.
  "prep-instr-pod": [
    { ru: "Соба́ка сиди́т под ___.", fr: "Le chien est assis sous ___." },
    { ru: "Мяч лежи́т под ___.", fr: "Le ballon est posé sous ___." },
    { ru: "Де́ти игра́ют под ___.", fr: "Les enfants jouent sous ___." },
    { ru: "Он сиде́л под ___.", fr: "Il était assis sous ___." },
    { ru: "Тури́сты отдыха́ют под ___.", fr: "Les touristes se reposent sous ___." },
  ],
  // над — Ла́мпа виси́т над ___.
  "prep-instr-nad": [
    { ru: "Самолёт лети́т над ___.", fr: "L'avion vole au-dessus de ___." },
    { ru: "Пти́ца лета́ет над ___.", fr: "L'oiseau vole au-dessus de ___." },
    { ru: "Со́лнце све́тит над ___.", fr: "Le soleil brille au-dessus de ___." },
    { ru: "Дым поднима́ется над ___.", fr: "La fumée monte au-dessus de ___." },
  ],
  // пе́ред — Мы встре́тимся пе́ред ___.
  "prep-instr-pered": [
    { ru: "Она́ стои́т пе́ред ___.", fr: "Elle se tient devant ___." },
    { ru: "Такси́ останови́лось пе́ред ___.", fr: "Le taxi s'est arrêté devant ___." },
    { ru: "Де́ти игра́ют пе́ред ___.", fr: "Les enfants jouent devant ___." },
    { ru: "Тури́сты фотографи́руются пе́ред ___.", fr: "Les touristes se prennent en photo devant ___." },
    { ru: "Авто́бус остана́вливается пе́ред ___.", fr: "Le bus s'arrête devant ___." },
  ],
  // рабо́тать + — Он рабо́тает ___.
  "expr-instr-rabotat": [
    { ru: "Она́ рабо́тает ___.", fr: "Elle travaille comme ___." },
    { ru: "Я рабо́таю ___.", fr: "Je travaille comme ___." },
    { ru: "Мой брат рабо́тает ___.", fr: "Mon frère travaille comme ___." },
    { ru: "Ты хо́чешь рабо́тать ___?", fr: "Tu veux travailler comme ___ ?" },
    { ru: "Ра́ньше она́ рабо́тала ___.", fr: "Avant elle travaillait comme ___." },
  ],
  // стать + — Он хо́чет стать ___.
  "expr-instr-stat": [
    { ru: "Она́ мечта́ет стать ___.", fr: "Elle rêve de devenir ___." },
    { ru: "Я хочу́ стать ___.", fr: "Je veux devenir ___." },
    { ru: "Ты мо́жешь стать ___.", fr: "Tu peux devenir ___." },
    { ru: "Она́ мечта́ла стать ___ с де́тства.", fr: "Elle rêvait de devenir ___ depuis l'enfance." },
    { ru: "Ско́ро она́ ста́нет ___.", fr: "Bientôt elle va devenir ___." },
  ],
  // явля́ться — Э́то явля́ется ___.
  "verb-instr-yavlyatsya": [
    { ru: "Он явля́ется ___ для наше́й компа́нии.", fr: "Il constitue ___ pour notre entreprise." },
    { ru: "Э́то письмо́ явля́ется ___.", fr: "Cette lettre constitue ___." },
    { ru: "Его́ молча́ние явля́ется ___.", fr: "Son silence constitue ___." },
    { ru: "Встре́ча явля́ется ___ для нас.", fr: "La rencontre constitue ___ pour nous." },
    { ru: "Э́тот текст явля́ется ___ для суда́.", fr: "Ce texte constitue ___ pour le tribunal." },
  ],
  // каза́ться — Он ка́жется ___.
  "verb-instr-kazatsya": [
    { ru: "Она́ ка́жется ___.", fr: "Elle semble être ___." },
    { ru: "Ты ка́жешься ___.", fr: "Tu sembles être ___." },
    { ru: "Вы ка́жетесь ___.", fr: "Vous semblez être ___." },
    { ru: "Он мне ка́жется ___.", fr: "Il me semble être ___." },
    { ru: "У́тром он каза́лся ___.", fr: "Le matin, il semblait être ___." },
  ],
  // счита́ться — Он счита́ется ___.
  "verb-instr-schitatsya": [
    { ru: "Она́ счита́ется ___.", fr: "Elle est considérée comme ___." },
    { ru: "Э́тот го́род счита́ется ___.", fr: "Cette ville est considérée comme ___." },
    { ru: "Ра́ньше он счита́лся ___.", fr: "Avant, il était considéré comme ___." },
    { ru: "Моя́ сосе́дка счита́ется ___.", fr: "Ma voisine est considérée comme ___." },
    { ru: "Он всегда́ счита́лся ___.", fr: "Il a toujours été considéré comme ___." },
  ],
  // интересова́ться — Я интересу́юсь ___.
  "verb-instr-interesovatsya": [
    { ru: "Ты интересу́ешься ___?", fr: "Tu t'intéresses à ___ ?" },
    { ru: "Она́ интересу́ется ___.", fr: "Elle s'intéresse à ___." },
    { ru: "Мы интересу́емся ___.", fr: "Nous nous intéressons à ___." },
    { ru: "Он давно́ интересу́ется ___.", fr: "Il s'intéresse à ___ depuis longtemps." },
    { ru: "Вы интересу́етесь ___?", fr: "Vous vous intéressez à ___ ?" },
  ],
  // горди́ться — Я горжу́сь ___.
  "verb-instr-gorditsya": [
    { ru: "Ты горди́шься ___?", fr: "Tu es fier de ___ ?" },
    { ru: "Она́ горди́тся ___.", fr: "Elle est fière de ___." },
    { ru: "Мы горди́мся ___.", fr: "Nous sommes fiers de ___." },
    { ru: "Он всегда́ горди́тся ___.", fr: "Il est toujours fier de ___." },
    { ru: "Вы горди́тесь ___?", fr: "Vous êtes fiers de ___ ?" },
  ],
  // занима́ться — Я занима́юсь ___.
  "verb-instr-zanimatsya": [
    { ru: "Мы занима́емся ___ по вечера́м.", fr: "Nous pratiquons ___ le soir." },
    { ru: "Ты занима́ешься ___ ка́ждый день?", fr: "Tu pratiques ___ tous les jours ?" },
    { ru: "Она́ занима́ется ___ в университе́те.", fr: "Elle pratique ___ à l'université." },
    { ru: "Он занима́ется ___ уже́ год.", fr: "Il pratique ___ depuis un an déjà." },
    { ru: "Вы занима́етесь ___ профессиона́льно?", fr: "Vous pratiquez ___ professionnellement ?" },
  ],
  // увлека́ться — Он увлека́ется ___.
  "verb-instr-uvlekatsya": [
    { ru: "Моя́ сестра́ увлека́ется ___.", fr: "Ma sœur est passionnée par ___." },
    { ru: "Мы увлека́емся ___.", fr: "Nous sommes passionnés par ___." },
    { ru: "Ты увлека́ешься ___?", fr: "Tu es passionné par ___ ?" },
    { ru: "Де́ти увлека́ются ___.", fr: "Les enfants sont passionnés par ___." },
    { ru: "Мой друг увлека́ется ___.", fr: "Mon ami est passionné par ___." },
  ],
  // по́льзоваться — Я по́льзуюсь ___.
  "verb-instr-polzovatsya": [
    { ru: "Он ка́ждый день по́льзуется ___.", fr: "Il utilise ___ tous les jours." },
    { ru: "Мы ре́дко по́льзуемся ___.", fr: "Nous utilisons rarement ___." },
    { ru: "Ты уме́ешь по́льзоваться ___?", fr: "Tu sais utiliser ___ ?" },
    { ru: "Она́ всегда́ по́льзуется ___.", fr: "Elle utilise toujours ___." },
    { ru: "Вы по́льзуетесь ___ на рабо́те?", fr: "Vous utilisez ___ au travail ?" },
  ],
  // владе́ть — Я владе́ю ___.
  "verb-instr-vladet": [
    { ru: "Он владе́ет ___.", fr: "Il maîtrise ___." },
    { ru: "Мы владе́ем ___.", fr: "Nous maîtrisons ___." },
    { ru: "Вы владе́ете ___?", fr: "Maîtrisez-vous ___ ?" },
    { ru: "Ты хорошо́ владе́ешь ___?", fr: "Tu maîtrises bien ___ ?" },
  ],
  // управля́ть — Он управля́ет ___.
  "verb-instr-upravlyat": [
    { ru: "Мой брат управля́ет ___.", fr: "Mon frère dirige ___." },
    { ru: "Она́ хорошо́ управля́ет ___.", fr: "Elle dirige bien ___." },
    { ru: "Кто управля́ет ___ сейча́с?", fr: "Qui dirige ___ maintenant ?" },
    { ru: "Дире́ктор управля́ет ___ уже́ год.", fr: "Le directeur dirige ___ depuis un an." },
    { ru: "Мы вме́сте управля́ем ___.", fr: "Nous dirigeons ___ ensemble." },
  ],
  // восхища́ться — Я восхища́юсь ___.
  "verb-instr-voskhishchatsya": [
    { ru: "Мы восхища́емся ___.", fr: "Nous admirons ___." },
    { ru: "Ты восхища́ешься ___?", fr: "Tu admires ___ ?" },
    { ru: "Она́ всегда́ восхища́ется ___.", fr: "Elle admire toujours ___." },
    { ru: "Тури́сты восхища́ются ___.", fr: "Les touristes admirent ___." },
    { ru: "Он ти́хо восхища́ется ___.", fr: "Il admire ___ en silence." },
  ],
  // рискова́ть — Не риску́й ___.
  "verb-instr-riskovat": [
    { ru: "Он не хо́чет рискова́ть ___.", fr: "Il ne veut pas risquer ___." },
    { ru: "Врач сказа́л не рискова́ть ___.", fr: "Le médecin a dit de ne pas risquer ___." },
    { ru: "Она́ рискну́ла ___ ра́ди него́.", fr: "Elle a risqué ___ pour lui." },
    { ru: "Ты сно́ва риску́ешь ___?", fr: "Tu risques encore ___ ?" },
    { ru: "Никто́ не хо́чет рискова́ть ___.", fr: "Personne ne veut risquer ___." },
  ],
  // торгова́ть — Он торгу́ет ___.
  "verb-instr-torgovat": [
    { ru: "Э́тот магази́н торгу́ет ___.", fr: "Ce magasin fait le commerce de ___." },
    { ru: "Мой брат торгу́ет ___.", fr: "Mon frère fait le commerce de ___." },
    { ru: "Мы торгу́ем ___ на ры́нке.", fr: "Nous faisons le commerce de ___ au marché." },
    { ru: "Она́ торгу́ет ___ в э́том го́роде.", fr: "Elle fait le commerce de ___ dans cette ville." },
    { ru: "Компа́ния давно́ торгу́ет ___.", fr: "L'entreprise fait le commerce de ___ depuis longtemps." },
  ],
  // дорожи́ть — Я дорожу́ ___.
  "verb-instr-dorozhit": [
    { ru: "Он дорожи́т ___.", fr: "Il tient à ___." },
    { ru: "Она́ дорожи́т ___.", fr: "Elle tient à ___." },
    { ru: "Мы дорожи́м ___.", fr: "Nous tenons à ___." },
    { ru: "Ты дорожи́шь ___?", fr: "Tu tiens à ___ ?" },
    { ru: "Вы дорожи́те ___?", fr: "Vous tenez à ___ ?" },
  ],
  // в — Я живу́ в ___.
  "prep-prep-v": [
    { ru: "Мы живём в ___.", fr: "Nous habitons dans ___." },
    { ru: "Она́ живёт в ___.", fr: "Elle habite dans ___." },
    { ru: "Ты живёшь в ___?", fr: "Tu habites dans ___ ?" },
    { ru: "Они́ живу́т в ___.", fr: "Ils habitent dans ___." },
    { ru: "Мой брат живёт в ___.", fr: "Mon frère habite dans ___." },
  ],
  // на — Я рабо́таю на ___.
  "prep-prep-na": [
    { ru: "Он рабо́тает на ___.", fr: "Il travaille sur ___." },
    { ru: "Мы рабо́таем на ___.", fr: "Nous travaillons sur ___." },
    { ru: "Она́ рабо́тает на ___.", fr: "Elle travaille sur ___." },
    { ru: "Ты рабо́таешь на ___?", fr: "Tu travailles sur ___ ?" },
    { ru: "Вы рабо́таете на ___?", fr: "Vous travaillez sur ___ ?" },
  ],
  // о — Я ду́маю о ___.
  "prep-prep-o": [
    { ru: "Мы ду́маем о ___.", fr: "Nous pensons à ___." },
    { ru: "Она́ ду́мает о ___.", fr: "Elle pense à ___." },
    { ru: "Ты ду́маешь о ___?", fr: "Tu penses à ___ ?" },
    { ru: "Он ча́сто ду́мает о ___.", fr: "Il pense souvent à ___." },
    { ru: "Вы ду́маете о ___?", fr: "Vous pensez à ___ ?" },
  ],
  // при — Библиоте́ка при ___.
  "prep-prep-pri": [
    { ru: "Столо́вая при ___.", fr: "La cantine est rattachée à ___." },
    { ru: "Магази́н нахо́дится при ___.", fr: "Le magasin se trouve rattaché à ___." },
    { ru: "Парко́вка есть при ___.", fr: "Il y a un parking rattaché à ___." },
    { ru: "Ку́рсы ру́сского языка́ при ___.", fr: "Les cours de russe sont rattachés à ___." },
  ],
  // находи́ться — Дом нахо́дится в ___.
  "expr-prep-nakhoditsya": [
    { ru: "Магази́н нахо́дится в ___.", fr: "Le magasin se trouve dans ___." },
    { ru: "Шко́ла нахо́дится в ___.", fr: "L'école se trouve dans ___." },
    { ru: "Библиоте́ка нахо́дится в ___.", fr: "La bibliothèque se trouve dans ___." },
    { ru: "Рестора́н нахо́дится в ___.", fr: "Le restaurant se trouve dans ___." },
    { ru: "Музе́й нахо́дится в ___.", fr: "Le musée se trouve dans ___." },
  ],
  // говори́ть о — Мы говори́м о ___.
  "verb-prep-govorit": [
    { ru: "Она́ говори́т о ___.", fr: "Elle parle de ___." },
    { ru: "Ты ча́сто говори́шь о ___?", fr: "Tu parles souvent de ___ ?" },
    { ru: "Я вчера́ говори́л о ___.", fr: "Hier j'ai parlé de ___." },
    { ru: "Вы говори́те о ___?", fr: "Vous parlez de ___ ?" },
    { ru: "Он всегда́ говори́т о ___.", fr: "Il parle toujours de ___." },
  ],
  // спо́рить о — Мы спо́рим о ___.
  "verb-prep-sporit": [
    { ru: "Мы ча́сто спо́рим о ___.", fr: "Nous discutons souvent de ___." },
    { ru: "Они́ спо́рят о ___ ка́ждый день.", fr: "Ils se disputent à propos de ___ chaque jour." },
    { ru: "Ты всегда́ спо́ришь о ___.", fr: "Tu discutes toujours de ___." },
    { ru: "Вчера́ мы спо́рили о ___.", fr: "Hier nous avons discuté de ___." },
    { ru: "Она́ спо́рит о ___ с друзья́ми.", fr: "Elle discute de ___ avec ses amis." },
  ],
  // мечта́ть о — Я мечта́ю о ___.
  "verb-prep-mechtat": [
    { ru: "Мы мечта́ем о ___.", fr: "Nous rêvons de ___." },
    { ru: "Ты мечта́ешь о ___.", fr: "Tu rêves de ___." },
    { ru: "Она́ мечта́ет о ___.", fr: "Elle rêve de ___." },
    { ru: "Он ча́сто мечта́ет о ___.", fr: "Il rêve souvent de ___." },
    { ru: "Вы мечта́ете о ___?", fr: "Vous rêvez de ___ ?" },
  ],
  // слы́шать о — Я слы́шал о ___.
  "verb-prep-slyshat": [
    { ru: "Мы слы́шали о ___.", fr: "Nous avons entendu parler de ___." },
    { ru: "Ты слы́шал о ___?", fr: "As-tu entendu parler de ___ ?" },
    { ru: "Она́ слы́шала о ___ вчера́.", fr: "Elle a entendu parler de ___ hier." },
    { ru: "Вы слы́шали о ___?", fr: "Avez-vous entendu parler de ___ ?" },
    { ru: "Я никогда́ не слы́шал о ___.", fr: "Je n'ai jamais entendu parler de ___." },
  ],
  // чита́ть о — Я чита́ю о ___.
  "verb-prep-chitat": [
    { ru: "Ты ча́сто чита́ешь о ___?", fr: "Tu lis souvent à propos de ___ ?" },
    { ru: "Вы чита́ли о ___ вчера́?", fr: "Avez-vous lu à propos de ___ hier ?" },
    { ru: "Он никогда́ не чита́ет о ___.", fr: "Il ne lit jamais à propos de ___." },
    { ru: "Я бу́ду чита́ть о ___ за́втра.", fr: "Je lirai à propos de ___ demain." },
  ],
  // знать о — Я зна́ю о ___.
  "verb-prep-znat": [
    { ru: "Мы зна́ем о ___.", fr: "Nous sommes au courant de ___." },
    { ru: "Ты зна́ешь о ___?", fr: "Tu es au courant de ___ ?" },
    { ru: "Она́ зна́ет о ___.", fr: "Elle est au courant de ___." },
    { ru: "Вы зна́ете о ___?", fr: "Vous êtes au courant de ___ ?" },
    { ru: "Он не зна́ет о ___.", fr: "Il n'est pas au courant de ___." },
  ],
  // расска́зывать о — Расскажи́ мне о ___.
  "verb-prep-rasskazyvat": [
    { ru: "Она́ расска́зывает о ___.", fr: "Elle parle de ___." },
    { ru: "Он мне расска́зывал о ___ вчера́.", fr: "Il m'a parlé de ___ hier." },
    { ru: "Расскажи́те нам о ___, пожа́луйста.", fr: "Parlez-nous de ___, s'il vous plaît." },
    { ru: "Я хочу́ рассказа́ть тебе́ о ___.", fr: "Je veux te parler de ___." },
    { ru: "Мы ча́сто расска́зываем о ___.", fr: "Nous parlons souvent de ___." },
  ],
  // забо́титься о — Я забо́чусь о ___.
  "verb-prep-zabotitsya": [
    { ru: "Она́ всегда́ забо́тится о ___.", fr: "Elle prend toujours soin de ___." },
    { ru: "Мы забо́тимся о ___ ка́ждый день.", fr: "Nous prenons soin de ___ chaque jour." },
    { ru: "Ты забо́тишься о ___?", fr: "Tu prends soin de ___ ?" },
    { ru: "Он никогда́ не забо́тится о ___.", fr: "Il ne prend jamais soin de ___." },
    { ru: "Вы забо́титесь о ___?", fr: "Vous prenez soin de ___ ?" },
  ],
  // беспоко́иться о — Я беспоко́юсь о ___.
  "verb-prep-bespokoitsya": [
    { ru: "Она́ беспоко́ится о ___.", fr: "Elle s'inquiète pour ___." },
    { ru: "Мы беспоко́имся о ___.", fr: "Nous nous inquiétons pour ___." },
    { ru: "Он беспоко́ился о ___.", fr: "Il s'inquiétait pour ___." },
    { ru: "Ты беспоко́ишься о ___?", fr: "Tu t'inquiètes pour ___ ?" },
    { ru: "Вы беспоко́итесь о ___?", fr: "Vous vous inquiétez pour ___ ?" },
  ],
  // сообща́ть о — Я сообща́ю о ___.
  "verb-prep-soobshchat": [
    { ru: "Мы сообща́ем о ___.", fr: "Nous informons de ___." },
    { ru: "Он сообща́ет о ___.", fr: "Il informe de ___." },
    { ru: "Она́ сообща́ет о ___.", fr: "Elle informe de ___." },
    { ru: "Вы сообща́ете о ___?", fr: "Vous informez de ___ ?" },
    { ru: "Ты сообща́ешь о ___?", fr: "Tu informes de ___ ?" },
  ],
  // вспомина́ть о — Я вспомина́ю о ___.
  "verb-prep-vspominat": [
    { ru: "Мы вспомина́ем о ___.", fr: "Nous nous souvenons de ___." },
    { ru: "Ты вспомина́ешь о ___?", fr: "Tu te souviens de ___ ?" },
    { ru: "Он ча́сто вспомина́ет о ___.", fr: "Il se souvient souvent de ___." },
    { ru: "Они́ иногда́ вспомина́ют о ___.", fr: "Ils se souviennent parfois de ___." },
    { ru: "Я не вспомина́ю о ___.", fr: "Je ne me souviens pas de ___." },
  ],
  // упомина́ть о — Я упомина́ю о ___.
  "verb-prep-upominat": [
    { ru: "Она́ упомина́ет о ___ ка́ждый день.", fr: "Elle mentionne ___ tous les jours." },
    { ru: "Ты упомина́ешь о ___ сли́шком ча́сто.", fr: "Tu mentionnes ___ trop souvent." },
    { ru: "Они́ никогда́ не упомина́ют о ___.", fr: "Ils ne mentionnent jamais ___." },
  ],
  // жале́ть о — Я жале́ю о ___.
  "verb-prep-zhalet": [
    { ru: "Она́ жале́ет о ___.", fr: "Elle regrette ___." },
    { ru: "Мы жале́ем о ___.", fr: "Nous regrettons ___." },
    { ru: "Ты жале́ешь о ___?", fr: "Tu regrettes ___ ?" },
    { ru: "Они́ жале́ли о ___ вчера́.", fr: "Ils regrettaient ___ hier." },
    { ru: "Я никогда́ не жале́ю о ___.", fr: "Je ne regrette jamais ___." },
  ],
};
