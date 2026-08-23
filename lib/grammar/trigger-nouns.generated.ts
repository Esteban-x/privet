// Généré par scripts/curate-trigger-nouns.mjs — ne pas éditer à la main.
//
// Pour chaque déclencheur, les noms de la banque qui donnent une phrase
// qu'un russophone dirait vraiment. Écrit une fois, relu, puis figé : c'est
// de la donnée, pas un appel réseau. Voir l'en-tête du script pour le
// raisonnement, et check:grammar pour ce qui est vérifié dessus.
//
// 21 déclencheurs, 740 couples au total.

export const TRIGGER_NOUNS: Record<string, string[]> = {
  // Donne-moi un morceau de ___.
  "expr-gen-kusok": ["khleb", "myaso", "syr", "tort", "pirog", "shokolad", "maslo", "sakhar", "ryba", "yabloko", "bumaga", "kamen", "zemlya", "derevo", "kozha", "kost"],
  // Je veux un verre de ___.
  "expr-gen-stakan": ["voda", "chay", "sok", "vino", "pivo", "napitok"],
  // Je vis chez ___.
  "prep-gen-u": ["mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "semya", "drug", "podruga", "sosed", "sosedka", "devushka", "zhenshchina", "muzhchina", "paren", "khozyain", "starik", "zhenikh", "nevesta", "kuzen", "tovarishch", "priyatel"],
  // ___ a une voiture.
  "expr-gen-u-est": ["chelovek", "mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "semya", "drug", "podruga", "sosed", "sosedka", "rebyonok", "malchik", "devochka", "devushka", "zhenshchina", "muzhchina", "paren", "gost", "khozyain", "starik", "malysh", "zhenikh", "nevesta", "kuzen", "dama", "gospodin", "tovarishch", "priyatel", "geniy", "vrach", "medsestra", "patsient", "uchitel", "student", "direktor", "nachalnik", "sekretar", "menedzher", "spetsialist", "ekspert", "klient", "advokat", "sudya", "svidetel", "prokuror", "soldat", "ofitser", "komandir", "kapitan", "voditel", "pilot", "pisatel", "avtor", "khudozhnik", "aktrisa", "operator", "rezhissyor", "chempion", "igrok", "trener", "okhotnik", "okhrannik", "pomoshchnik", "vladelets", "predsedatel", "prezident", "ministr", "gubernator", "senator", "korol", "koroleva", "prints", "printsessa", "geroy", "svyashchennik", "vor", "prestupnik", "vrag", "shpion", "kompaniya", "firma"],
  // C'est la voiture de ___.
  "expr-gen-possession": ["chelovek", "mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "semya", "drug", "podruga", "sosed", "sosedka", "devushka", "zhenshchina", "muzhchina", "paren", "gost", "khozyain", "starik", "zhenikh", "nevesta", "kuzen", "dama", "gospodin", "tovarishch", "priyatel", "vrach", "medsestra", "patsient", "uchitel", "student", "direktor", "nachalnik", "sekretar", "menedzher", "spetsialist", "ekspert", "klient", "advokat", "sudya", "svidetel", "prokuror", "soldat", "ofitser", "komandir", "kapitan", "voditel", "pilot", "pisatel", "avtor", "khudozhnik", "aktrisa", "operator", "rezhissyor", "chempion", "igrok", "trener", "okhotnik", "okhrannik", "pomoshchnik", "vladelets", "predsedatel", "prezident", "ministr", "gubernator", "senator", "korol", "koroleva", "prints", "printsessa", "svyashchennik", "vor", "prestupnik", "vrag", "shpion"],
  // Cette lettre vient de ___.
  "prep-gen-ot": ["chelovek", "mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "semya", "drug", "podruga", "sosed", "sosedka", "rebyonok", "malchik", "devochka", "devushka", "zhenshchina", "muzhchina", "paren", "gost", "khozyain", "starik", "zhenikh", "nevesta", "kuzen", "dama", "gospodin", "tovarishch", "priyatel", "vrach", "medsestra", "patsient", "uchitel", "student", "direktor", "nachalnik", "sekretar", "menedzher", "spetsialist", "ekspert", "klient", "advokat", "sudya", "svidetel", "prokuror", "soldat", "ofitser", "komandir", "kapitan", "voditel", "pilot", "pisatel", "avtor", "khudozhnik", "aktrisa", "operator", "rezhissyor", "chempion", "igrok", "trener", "okhotnik", "okhrannik", "pomoshchnik", "vladelets", "predsedatel", "prezident", "ministr", "gubernator", "senator", "korol", "koroleva", "prints", "printsessa", "geroy", "svyashchennik", "vrag", "shpion", "vor", "prestupnik", "kompaniya", "firma", "shkola", "universitet", "sud", "politsiya", "bolnitsa", "pravitelstvo"],
  // Je n'ai pas dormi depuis ___.
  "prep-gen-s": ["utro", "vecher", "leto", "zima", "vesna", "osen", "ponedelnik", "vtornik", "chetverg", "voskresene", "svadba", "ekzamen"],
  // Nous nous sommes promenés le long de ___.
  "prep-gen-vdol": ["reka", "ozero", "more", "okean", "ulitsa", "doroga", "stena", "les", "pole", "sad", "park", "zdanie", "dom"],
  // Tout le monde est venu, sauf ___.
  "prep-gen-krome": ["chelovek", "mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "drug", "podruga", "sosed", "sosedka", "rebyonok", "malchik", "devochka", "devushka", "zhenshchina", "muzhchina", "paren", "gost", "starik", "malysh", "zhenikh", "nevesta", "kuzen", "dama", "tovarishch", "priyatel", "vrach", "medsestra", "patsient", "uchitel", "student", "direktor", "nachalnik", "sekretar", "menedzher", "spetsialist", "ekspert", "klient", "advokat", "sudya", "svidetel", "prokuror", "soldat", "ofitser", "komandir", "kapitan", "voditel", "pilot", "pisatel", "avtor", "khudozhnik", "aktrisa", "operator", "rezhissyor", "chempion", "igrok", "trener", "okhotnik", "okhrannik", "pomoshchnik", "vladelets", "predsedatel", "prezident", "ministr", "gubernator", "senator", "korol", "koroleva", "prints", "printsessa", "geroy", "svyashchennik", "kot", "koshka", "sobaka"],
  // Prends du thé au lieu de ___.
  "prep-gen-vmesto": ["voda", "sok", "vino", "pivo", "napitok", "lekarstvo"],
  // Le chat est sorti de dessous ___.
  "prep-gen-izpod": ["stol", "stul", "kreslo", "divan", "krovat", "postel", "mashina", "avtomobil", "gruzovik", "yashchik", "most", "derevo", "dver", "pol", "zemlya", "kamen"],
  // Je te souhaite ___.
  "verb-gen-zhelat": ["zdorove", "schaste", "uspekh", "lyubov", "radost", "pobeda"],
  // Je veux boire un peu de ___.
  "verb-gen-vypit": ["voda", "chay", "sok", "vino", "pivo", "napitok", "lekarstvo"],
  // Les enfants obéissent à ___.
  "verb-gen-slushatsya": ["mama", "papa", "otets", "mat", "babushka", "dedushka", "tyotya", "brat", "sestra", "uchitel", "trener", "vrach", "medsestra", "direktor"],
  // Le verre est plein de ___.
  "expr-gen-polnyy": ["voda", "chay", "sok", "vino", "pivo", "napitok", "sol", "sakhar", "ris"],
  // J'appelle ___.
  "verb-dat-zvonit": ["chelovek", "mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "semya", "drug", "podruga", "sosed", "sosedka", "rebyonok", "malchik", "devochka", "devushka", "zhenshchina", "muzhchina", "paren", "khozyain", "zhenikh", "nevesta", "kuzen", "tovarishch", "priyatel", "vrach", "medsestra", "patsient", "uchitel", "student", "direktor", "nachalnik", "sekretar", "menedzher", "spetsialist", "ekspert", "klient", "advokat", "voditel", "operator", "trener", "okhrannik", "pomoshchnik", "vladelets", "svyashchennik"],
  // Cette musique plaît à ___.
  "verb-dat-nravitsya": ["chelovek", "mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "semya", "drug", "podruga", "sosed", "sosedka", "rebyonok", "malchik", "devochka", "devushka", "zhenshchina", "muzhchina", "paren", "gost", "khozyain", "starik", "malysh", "zhenikh", "nevesta", "kuzen", "dama", "gospodin", "tovarishch", "priyatel", "geniy", "vrach", "medsestra", "patsient", "uchitel", "student", "direktor", "nachalnik", "sekretar", "menedzher", "spetsialist", "ekspert", "klient", "advokat", "sudya", "svidetel", "prokuror", "soldat", "ofitser", "komandir", "kapitan", "voditel", "pilot", "pisatel", "avtor", "khudozhnik", "aktrisa", "operator", "rezhissyor", "chempion", "igrok", "trener", "okhotnik", "okhrannik", "pomoshchnik", "vladelets", "predsedatel", "prezident", "ministr", "gubernator", "senator", "korol", "koroleva", "prints", "printsessa", "geroy", "svyashchennik", "vor", "prestupnik", "vrag", "shpion", "kot", "koshka", "sobaka", "narod", "komanda"],
  // Je donne un cadeau à ___.
  "verb-dat-davat": ["chelovek", "mama", "papa", "otets", "mat", "doch", "brat", "sestra", "babushka", "dedushka", "tyotya", "zhena", "muzh", "semya", "drug", "podruga", "sosed", "sosedka", "rebyonok", "malchik", "devochka", "devushka", "zhenshchina", "muzhchina", "paren", "gost", "khozyain", "starik", "malysh", "zhenikh", "nevesta", "kuzen", "dama", "gospodin", "tovarishch", "priyatel", "vrach", "medsestra", "patsient", "uchitel", "student", "direktor", "nachalnik", "sekretar", "menedzher", "klient", "soldat", "ofitser", "voditel", "pisatel", "avtor", "khudozhnik", "aktrisa", "rezhissyor", "chempion", "trener", "okhrannik", "pomoshchnik", "vladelets", "predsedatel", "prezident", "ministr", "gubernator", "senator", "korol", "koroleva", "prints", "printsessa", "geroy", "svyashchennik", "kot", "koshka", "sobaka"],
  // Je mange ___.
  "verb-acc-est": ["sup", "myaso", "syr", "yaytso", "ryba", "yabloko", "khleb", "sakhar", "maslo", "ris", "salat", "tort", "pirog", "pechene", "shokolad", "desert", "zavtrak", "obed", "uzhin", "ptitsa", "krolik"],
  // Le chat dort sous ___.
  "prep-instr-pod": ["stol", "stul", "kreslo", "divan", "krovat", "kholodilnik", "lampa", "okno", "dver", "derevo", "most", "krysha", "dom", "dozhd"],
  // J'habite dans ___.
  "prep-prep-v": ["dom", "kvartira", "komnata", "gorod", "strana", "rayon", "tsentr", "zdanie", "gostinitsa", "les", "podval"],
};
