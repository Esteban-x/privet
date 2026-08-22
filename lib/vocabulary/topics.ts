// Banque de vocabulaire curée par thème (voir TOPIC_CATALOG dans
// lib/supabase/types.ts), utilisée pour amorcer automatiquement les listes
// perso d'un utilisateur à partir des thèmes choisis à l'inscription — voir
// app/api/vocab/lists/sync-topics/route.ts.
//
// Deux paliers par thème :
// - `basic` : accessible dès A0/A1 (mots-clés essentiels du thème).
// - `advanced` : ajouté à partir de A2 — du vocabulaire réellement utile au
//   quotidien, pas juste "papa/bonjour" que tout débutant connaît déjà.

export interface TopicWordSeed {
  ru: string;
  transliteration: string;
  fr: string;
}

export interface TopicWordBank {
  basic: TopicWordSeed[];
  advanced: TopicWordSeed[];
}

export const TOPIC_VOCAB: Record<string, TopicWordBank> = {
  travel: {
    basic: [
      { ru: "билет", transliteration: "bilet", fr: "billet" },
      { ru: "паспорт", transliteration: "pasport", fr: "passeport" },
      { ru: "аэропорт", transliteration: "aeroport", fr: "aéroport" },
      { ru: "гостиница", transliteration: "gostinitsa", fr: "hôtel" },
      { ru: "чемодан", transliteration: "chemodan", fr: "valise" },
      { ru: "виза", transliteration: "viza", fr: "visa" },
    ],
    advanced: [
      { ru: "пересадка", transliteration: "peresadka", fr: "correspondance (transport)" },
      { ru: "посадочный талон", transliteration: "posadochnyy talon", fr: "carte d'embarquement" },
      { ru: "задержка рейса", transliteration: "zaderzhka reysa", fr: "retard de vol" },
      { ru: "туристическая страховка", transliteration: "turisticheskaya strakhovka", fr: "assurance voyage" },
      { ru: "таможня", transliteration: "tamozhnya", fr: "douane" },
      { ru: "багаж", transliteration: "bagazh", fr: "bagages" },
      { ru: "прибытие", transliteration: "pribytie", fr: "arrivée" },
      { ru: "отправление", transliteration: "otpravlenie", fr: "départ" },
    ],
  },

  food: {
    basic: [
      { ru: "хлеб", transliteration: "khleb", fr: "pain" },
      { ru: "вода", transliteration: "voda", fr: "eau" },
      { ru: "чай", transliteration: "chay", fr: "thé" },
      { ru: "кофе", transliteration: "kofe", fr: "café" },
      { ru: "яблоко", transliteration: "yabloko", fr: "pomme" },
      { ru: "суп", transliteration: "sup", fr: "soupe" },
    ],
    advanced: [
      { ru: "официант", transliteration: "ofitsiant", fr: "serveur" },
      { ru: "счёт", transliteration: "schyot", fr: "l'addition" },
      { ru: "заказать", transliteration: "zakazat'", fr: "commander" },
      { ru: "на вынос", transliteration: "na vynos", fr: "à emporter" },
      { ru: "аллергия", transliteration: "allergiya", fr: "allergie (alimentaire)" },
      { ru: "вегетарианец", transliteration: "vegetarianets", fr: "végétarien" },
      { ru: "сдача", transliteration: "sdacha", fr: "monnaie (rendue)" },
      { ru: "чаевые", transliteration: "chayevyye", fr: "pourboire" },
    ],
  },

  business: {
    basic: [
      { ru: "работа", transliteration: "rabota", fr: "travail" },
      { ru: "офис", transliteration: "ofis", fr: "bureau" },
      { ru: "зарплата", transliteration: "zarplata", fr: "salaire" },
      { ru: "коллега", transliteration: "kollega", fr: "collègue" },
      { ru: "начальник", transliteration: "nachal'nik", fr: "chef, patron" },
    ],
    advanced: [
      { ru: "собеседование", transliteration: "sobesedovanie", fr: "entretien d'embauche" },
      { ru: "резюме", transliteration: "rezyume", fr: "CV" },
      { ru: "переговоры", transliteration: "peregovory", fr: "négociations" },
      { ru: "дедлайн", transliteration: "dedlayn", fr: "date limite, deadline" },
      { ru: "командировка", transliteration: "komandirovka", fr: "voyage d'affaires" },
      { ru: "увольнение", transliteration: "uvol'nenie", fr: "licenciement" },
      { ru: "повышение", transliteration: "povysheniye", fr: "promotion (au travail)" },
      { ru: "контракт", transliteration: "kontrakt", fr: "contrat" },
    ],
  },

  literature: {
    basic: [
      { ru: "книга", transliteration: "kniga", fr: "livre" },
      { ru: "писатель", transliteration: "pisatel'", fr: "écrivain" },
      { ru: "герой", transliteration: "geroy", fr: "héros" },
      { ru: "роман", transliteration: "roman", fr: "roman" },
    ],
    advanced: [
      { ru: "сюжет", transliteration: "syuzhet", fr: "intrigue" },
      { ru: "глава", transliteration: "glava", fr: "chapitre" },
      { ru: "издательство", transliteration: "izdatel'stvo", fr: "maison d'édition" },
      { ru: "поэзия", transliteration: "poeziya", fr: "poésie" },
      { ru: "рифма", transliteration: "rifma", fr: "rime" },
      { ru: "рукопись", transliteration: "rukopis'", fr: "manuscrit" },
      { ru: "отрывок", transliteration: "otryvok", fr: "extrait (de texte)" },
      { ru: "критик", transliteration: "kritik", fr: "critique (personne)" },
    ],
  },

  daily: {
    basic: [
      { ru: "семья", transliteration: "sem'ya", fr: "famille" },
      { ru: "мать", transliteration: "mat'", fr: "mère" },
      { ru: "отец", transliteration: "otets", fr: "père" },
      { ru: "брат", transliteration: "brat", fr: "frère" },
      { ru: "сестра", transliteration: "sestra", fr: "sœur" },
      { ru: "дом", transliteration: "dom", fr: "maison" },
      { ru: "бабушка", transliteration: "babushka", fr: "grand-mère" },
      { ru: "дедушка", transliteration: "dedushka", fr: "grand-père" },
    ],
    advanced: [
      { ru: "невестка", transliteration: "nevestka", fr: "belle-sœur (du frère), belle-fille" },
      { ru: "сводный брат", transliteration: "svodnyy brat", fr: "demi-frère" },
      { ru: "близнецы", transliteration: "bliznetsy", fr: "jumeaux" },
      { ru: "коляска", transliteration: "kolyaska", fr: "poussette" },
      { ru: "бутылочка", transliteration: "butylochka", fr: "biberon" },
      { ru: "свадьба", transliteration: "svad'ba", fr: "mariage (la cérémonie)" },
      { ru: "помолвка", transliteration: "pomolvka", fr: "fiançailles" },
      { ru: "развод", transliteration: "razvod", fr: "divorce" },
    ],
  },

  news: {
    basic: [
      { ru: "новости", transliteration: "novosti", fr: "actualités" },
      { ru: "газета", transliteration: "gazeta", fr: "journal" },
      { ru: "телевизор", transliteration: "televizor", fr: "télévision" },
    ],
    advanced: [
      { ru: "заголовок", transliteration: "zagolovok", fr: "titre (d'article)" },
      { ru: "источник", transliteration: "istochnik", fr: "source" },
      { ru: "журналист", transliteration: "zhurnalist", fr: "journaliste" },
      { ru: "выборы", transliteration: "vybory", fr: "élections" },
      { ru: "правительство", transliteration: "pravitel'stvo", fr: "gouvernement" },
      { ru: "забастовка", transliteration: "zabastovka", fr: "grève" },
      { ru: "расследование", transliteration: "rassledovanie", fr: "enquête" },
    ],
  },

  cinema: {
    basic: [
      { ru: "фильм", transliteration: "fil'm", fr: "film" },
      { ru: "актёр", transliteration: "aktyor", fr: "acteur" },
      { ru: "билет", transliteration: "bilet", fr: "billet (de cinéma)" },
    ],
    advanced: [
      { ru: "режиссёр", transliteration: "rezhissyor", fr: "réalisateur" },
      { ru: "сценарий", transliteration: "stsenariy", fr: "scénario" },
      { ru: "премьера", transliteration: "prem'era", fr: "première (projection)" },
      { ru: "субтитры", transliteration: "subtitry", fr: "sous-titres" },
      { ru: "озвучка", transliteration: "ozvuchka", fr: "doublage" },
      { ru: "спецэффекты", transliteration: "spetseffekty", fr: "effets spéciaux" },
      { ru: "зал", transliteration: "zal", fr: "salle (de cinéma)" },
    ],
  },

  science: {
    basic: [
      { ru: "наука", transliteration: "nauka", fr: "science" },
      { ru: "компьютер", transliteration: "komp'yuter", fr: "ordinateur" },
      { ru: "телефон", transliteration: "telefon", fr: "téléphone" },
    ],
    advanced: [
      { ru: "исследование", transliteration: "issledovanie", fr: "recherche (étude)" },
      { ru: "открытие", transliteration: "otkrytie", fr: "découverte" },
      { ru: "искусственный интеллект", transliteration: "iskusstvennyy intellekt", fr: "intelligence artificielle" },
      { ru: "эксперимент", transliteration: "eksperiment", fr: "expérience (scientifique)" },
      { ru: "программирование", transliteration: "programmirovanie", fr: "programmation" },
      { ru: "изобретение", transliteration: "izobretenie", fr: "invention" },
      { ru: "данные", transliteration: "dannyye", fr: "données" },
    ],
  },

  sport: {
    basic: [
      { ru: "спорт", transliteration: "sport", fr: "sport" },
      { ru: "футбол", transliteration: "futbol", fr: "football" },
      { ru: "команда", transliteration: "komanda", fr: "équipe" },
    ],
    advanced: [
      { ru: "тренировка", transliteration: "trenirovka", fr: "entraînement" },
      { ru: "соревнование", transliteration: "sorevnovanie", fr: "compétition" },
      { ru: "судья", transliteration: "sud'ya", fr: "arbitre" },
      { ru: "чемпионат", transliteration: "chempionat", fr: "championnat" },
      { ru: "ничья", transliteration: "nich'ya", fr: "match nul" },
      { ru: "поражение", transliteration: "porazhenie", fr: "défaite" },
      { ru: "победа", transliteration: "pobeda", fr: "victoire" },
      { ru: "травма", transliteration: "travma", fr: "blessure" },
    ],
  },

  music: {
    basic: [
      { ru: "музыка", transliteration: "muzyka", fr: "musique" },
      { ru: "песня", transliteration: "pesnya", fr: "chanson" },
      { ru: "концерт", transliteration: "kontsert", fr: "concert" },
    ],
    advanced: [
      { ru: "альбом", transliteration: "al'bom", fr: "album" },
      { ru: "аккорд", transliteration: "akkord", fr: "accord (musical)" },
      { ru: "ритм", transliteration: "ritm", fr: "rythme" },
      { ru: "исполнитель", transliteration: "ispolnitel'", fr: "interprète" },
      { ru: "текст песни", transliteration: "tekst pesni", fr: "paroles de chanson" },
      { ru: "гастроли", transliteration: "gastroli", fr: "tournée (de concerts)" },
      { ru: "наушники", transliteration: "naushniki", fr: "écouteurs, casque" },
    ],
  },
};

// Niveaux considérés comme "pas juste débutant total" — au-delà de A0/A1, on
// enrichit la liste avec le vocabulaire avancé plutôt que de s'arrêter aux
// mots que tout le monde connaît déjà.
export function includesAdvanced(level: string): boolean {
  return level !== "A0" && level !== "A1";
}
