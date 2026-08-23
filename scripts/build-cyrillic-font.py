# -*- coding: utf-8 -*-
"""
Construit public/fonts/privet-cyrillic.woff2 — `python scripts/build-cyrillic-font.py`.

POURQUOI CE FICHIER EXISTE

L'accent tonique russe s'écrit avec U+0301, une marque COMBINANTE : elle n'a
pas de largeur propre, et c'est la police qui la place au-dessus de la voyelle
au moyen d'une ancre GPOS (fonction « mark », MarkToBase).

Inter contient bien ces ancres pour le cyrillique. Mais sa table GPOS
n'enregistre les fonctions `mark` et `mkmk` que sous les scripts `DFLT` et
`latn` : sous `cyrl`, il n'y a que `kern`. Or un moteur de rendu sélectionne
le script d'après le texte — pour du russe, c'est `cyrl`. Il n'y trouve aucune
fonction `mark`, n'applique donc aucun positionnement, et la marque se pose à
la position courante du crayon : elle atterrit sur la lettre SUIVANTE. D'où
« челове́к » affiché avec l'accent sur le к.

Ce script corrige la police à la source :

1. il enregistre `mark` et `mkmk` sous le script `cyrl`, ce qui suffit à
   activer les ancres qu'Inter possédait déjà ;
2. il ajoute les deux ancres réellement absentes, sur « я » et « Ю » — « Я »
   et « ю » les ont, visiblement un oubli. « я » accentué apparaît 177 fois
   dans la seule banque de noms ;
3. il vérifie le résultat en composant de vrais mots avec HarfBuzz et en
   contrôlant que l'accent tombe sur la bonne lettre.

Servir nous-mêmes le fichier a un second mérite : Google revendique U+0301
dans deux sous-ensembles d'Inter (`cyrillic` et `vietnamese`, ce dernier
déclaré en dernier), si bien que lettres et marque provenaient de fichiers
différents — une seconde raison, indépendante, pour qu'aucune ancre ne
s'applique.

Dépendances : pip install fonttools brotli uharfbuzz
"""
import io
import os
import sys
import urllib.request
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import otTables as ot

# Sous-ensemble cyrillique d'Inter tel que Google le sert. Téléchargé dans
# scripts/.cache (ignoré par git), comme les sources de build-nouns.mjs : le
# dépôt ne contient que le résultat, pas la matière première.
SRC_URL = (
    "https://fonts.gstatic.com/s/inter/v20/"
    "UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2"
)
SRC = "scripts/.cache/inter-cyrillic.woff2"
OUT = "public/fonts/privet-cyrillic.woff2"

VOWELS = "аеёиоуыэюяАЕЁИОУЫЭЮЯ"


def ensure_source():
    if os.path.exists(SRC):
        return
    os.makedirs(os.path.dirname(SRC), exist_ok=True)
    print(f"téléchargement de {SRC_URL}")
    req = urllib.request.Request(SRC_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r, open(SRC, "wb") as f:
        f.write(r.read())


def anchored_bases(font, mark_glyph):
    """Toutes les bases sur lesquelles la marque est ancrée."""
    found = set()

    def walk(sub, lookup_type):
        if lookup_type == 9:
            return walk(sub.ExtSubTable, sub.ExtensionLookupType)
        if lookup_type == 4 and getattr(sub, "MarkCoverage", None):
            if mark_glyph in sub.MarkCoverage.glyphs:
                found.update(sub.BaseCoverage.glyphs)

    for lookup in font["GPOS"].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            walk(sub, lookup.LookupType)
    return found

# Voyelle de référence pour chaque ajout : même hauteur d'accent, largeur
# comparable. L'ancre X est ensuite mise à l'échelle de la largeur réelle.
TO_ADD = {0x44F: 0x430, 0x42E: 0x42F}  # я <- а,  Ю <- Я


def find_mark_to_base(font, mark_glyph):
    """Le sous-table MarkToBase qui porte l'accent aigu, extensions comprises."""

    def walk(sub, lookup_type):
        if lookup_type == 9:  # Extension : le vrai sous-table est à l'intérieur
            return walk(sub.ExtSubTable, sub.ExtensionLookupType)
        if lookup_type == 4 and getattr(sub, "MarkCoverage", None):
            if mark_glyph in sub.MarkCoverage.glyphs:
                return sub
        return None

    for lookup in font["GPOS"].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            found = walk(sub, lookup.LookupType)
            if found is not None:
                return found
    return None


def enable_features_for_script(font, script_tag, feature_tags):
    """
    Rend `feature_tags` actives sous `script_tag`.

    C'est LE correctif : les ancres existent déjà, elles ne sont simplement
    jamais consultées parce que la fonction n'est pas déclarée pour ce script.
    """
    gpos = font["GPOS"].table
    wanted = {
        i
        for i, fr in enumerate(gpos.FeatureList.FeatureRecord)
        if fr.FeatureTag in feature_tags
    }
    added = []
    for record in gpos.ScriptList.ScriptRecord:
        if record.ScriptTag != script_tag:
            continue
        for langsys in [record.Script.DefaultLangSys] + [
            lr.LangSys for lr in record.Script.LangSysRecord
        ]:
            if langsys is None:
                continue
            present = set(langsys.FeatureIndex)
            missing = sorted(wanted - present)
            if not missing:
                continue
            # L'ordre croissant des index est exigé par la spécification.
            langsys.FeatureIndex = sorted(present | set(missing))
            langsys.FeatureCount = len(langsys.FeatureIndex)
            added += [gpos.FeatureList.FeatureRecord[i].FeatureTag for i in missing]
    return added


# Mots dont l'accent est connu : le contrôle décisif n'est pas « la table
# contient-elle une ancre » mais « un moteur de rendu pose-t-il réellement
# l'accent sur la bonne lettre ». On fait donc composer ces mots pour de vrai.
SHAPING_CASES = {
    "челове́к": 0x0435,
    "кни́га": 0x0438,
    "земля́": 0x044F,
    "мужчи́на": 0x0438,
    "рабо́та": 0x043E,
    "учи́тель": 0x0438,
    "я́блоко": 0x044F,
    "ю́г": 0x044E,
    "хорошо́": 0x043E,
    "де́вушка": 0x0435,
}


def verify_shaping(path):
    """Compose de vrais mots et vérifie où l'accent atterrit."""
    try:
        import uharfbuzz as hb
    except ImportError:
        print("  (uharfbuzz absent : contrôle de composition sauté)")
        return

    font_file = TTFont(path)
    font_file.flavor = None  # HarfBuzz ne décompresse pas le woff2
    raw = io.BytesIO()
    font_file.save(raw)
    face = hb.Face(raw.getvalue())
    shaper = hb.Font(face)
    cmap = font_file.getBestCmap()

    wrong = []
    for word, expected_code in SHAPING_CASES.items():
        buf = hb.Buffer()
        buf.add_str(word)
        buf.guess_segment_properties()
        hb.shape(shaper, buf)

        pen, glyphs = 0, []
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            glyphs.append((shaper.glyph_to_string(info.codepoint), pen + pos.x_offset, pos.x_advance))
            pen += pos.x_advance

        accent = next((g for g in glyphs if "acute" in g[0]), None)
        if accent is None:
            wrong.append(f"{word} : aucun accent composé")
            continue
        # Sur quelle lettre le centre de l'accent se trouve-t-il ?
        landed = next(
            (name for name, x, adv in glyphs if adv and x <= accent[1] < x + adv), None
        )
        expected = cmap.get(expected_code)
        if landed != expected:
            wrong.append(f"{word} : accent posé sur {landed}, attendu {expected}")

    if wrong:
        sys.exit("composition incorrecte :\n  " + "\n  ".join(wrong))
    print(f"  composition vérifiée : {len(SHAPING_CASES)} mots, accent sur la bonne voyelle")


def main():
    ensure_source()
    font = TTFont(SRC)
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    glyph_order = font.getGlyphOrder()
    gid = {name: i for i, name in enumerate(glyph_order)}

    enabled = enable_features_for_script(font, "cyrl", {"mark", "mkmk"})
    for tag in enabled:
        print(f"  fonction « {tag} » activée pour le script cyrl")

    mark = cmap[0x0301]
    sub = find_mark_to_base(font, mark)
    if sub is None:
        sys.exit("aucun sous-table MarkToBase ne couvre U+0301")

    pairs = list(zip(sub.BaseCoverage.glyphs, sub.BaseArray.BaseRecord))
    by_name = dict(pairs)
    added = []

    for code, ref_code in TO_ADD.items():
        name = cmap.get(code)
        ref = cmap.get(ref_code)
        if name is None or ref is None:
            continue
        if name in by_name:
            continue  # déjà ancrée : une version ultérieure d'Inter a corrigé le trou
        ref_record = by_name[ref]
        ref_anchor = ref_record.BaseAnchor[0]
        ref_width = hmtx[ref][0]
        width = hmtx[name][0]

        anchor = ot.Anchor()
        anchor.Format = 1
        # Même position relative dans la largeur du glyphe, même hauteur.
        anchor.XCoordinate = int(round(ref_anchor.XCoordinate * width / ref_width))
        anchor.YCoordinate = ref_anchor.YCoordinate

        record = ot.BaseRecord()
        record.BaseAnchor = [anchor]
        pairs.append((name, record))
        added.append((name, anchor.XCoordinate, anchor.YCoordinate))

    # La couverture doit rester triée par identifiant de glyphe, et BaseArray
    # lui être parallèle : les deux sont réécrits ensemble.
    pairs.sort(key=lambda p: gid[p[0]])
    sub.BaseCoverage.glyphs = [name for name, _ in pairs]
    sub.BaseArray.BaseRecord = [record for _, record in pairs]
    sub.BaseCount = len(pairs)

    # Nom de famille distinct : la police n'est plus celle de Google, et la
    # pile CSS doit pouvoir la désigner séparément.
    for record in font["name"].names:
        if record.nameID in (1, 3, 4, 6):
            value = record.toUnicode().replace("Inter", "Privet Cyrillic")
            record.string = value

    font.flavor = "woff2"
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    font.save(OUT)

    # Contrôle : le fichier RÉELLEMENT écrit ancre-t-il les vingt voyelles ?
    # C'est la seule chose qui compte pour l'affichage, et elle est vérifiée
    # sur le produit fini plutôt que supposée d'après le code ci-dessus.
    check = TTFont(OUT)
    check_cmap = check.getBestCmap()
    ok = anchored_bases(check, check_cmap[0x0301])
    missing = [v for v in VOWELS if check_cmap.get(ord(v)) not in ok]
    if missing:
        sys.exit(f"voyelles sans ancrage dans le fichier produit : {' '.join(missing)}")

    verify_shaping(OUT)

    for name, x, y in added:
        print(f"  ancre ajoutée : {name} (x={x}, y={y})")
    print(f"✓ {OUT} écrit — {len(pairs)} bases ancrées, 20 voyelles russes sur 20")


if __name__ == "__main__":
    main()
