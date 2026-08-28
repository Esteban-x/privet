# -*- coding: utf-8 -*-
"""
Construit app/og-font.ttf — `python scripts/build-og-font.py`.

POURQUOI UNE POLICE DE PLUS.

L'image d'aperçu (app/opengraph-image.tsx) est composée par satori, qui ne
sait pas lire le WOFF2 et refuse de rendre quoi que ce soit sans au moins
une police fournie explicitement — il n'a aucune police système à sa
disposition. Les deux fichiers du site ne conviennent donc pas : Inter vient
de Google par un <link> au moment du rendu du navigateur, et
privetik-cyrillic.woff2 est à la fois compressé en WOFF2 et limité au
cyrillique.

Il faut un TTF unique couvrant le latin ET le cyrillique de l'image.

CE QUE FAIT LE SCRIPT. Il prend les deux sous-ensembles d'Inter servis par
Google — latin et cyrillique — les fusionne, puis ne garde que les
caractères réellement présents dans l'image. Le résultat tient en quelques
kilo-octets au lieu de plusieurs centaines : l'image est régénérée à chaque
build, autant ne pas lui faire charger un alphabet entier pour trente mots.

MÊME DISCIPLINE QUE build-cyrillic-font.py : les sources sont téléchargées
dans scripts/.cache (ignoré par git), et seul le résultat est versionné. Le
build de l'application n'a donc jamais besoin du réseau.
"""

import os
import urllib.request

from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.varLib import instancer

# Les deux sous-ensembles d'Inter 700, tels que Google les sert aujourd'hui.
# Le cyrillique est LE MÊME fichier que celui de build-cyrillic-font.py : on
# n'a pas besoin ici de ses ancres corrigées (satori ne compose pas les
# marques combinantes), seulement de ses glyphes.
SOURCES = {
    "scripts/.cache/inter-og-latin.woff2":
        "https://fonts.gstatic.com/s/inter/v20/"
        "UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2",
    "scripts/.cache/inter-og-cyrillic.woff2":
        "https://fonts.gstatic.com/s/inter/v20/"
        "UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
}

# DEUX FICHIERS, PAS UN. La fusion des deux sous-ensembles échoue : Inter est
# servie en police VARIABLE, et fontTools refuse de fusionner deux tables de
# variations. Inutile d'insister — satori accepte une LISTE de polices et
# cherche chaque glyphe manquant dans la suivante. Deux fichiers rendent donc
# le même service, sans manipulation fragile.
OUT_LATIN = "app/og-font-latin.ttf"
OUT_CYRILLIC = "app/og-font-cyrillic.ttf"

# Exactement ce que l'image affiche. Écrit à la main plutôt que déduit du
# .tsx : une extraction automatique donnerait aussi les noms de propriétés
# CSS et les couleurs, et raterait le premier caractère ajouté demain sans
# prévenir. Une chaîne qu'on relit vaut mieux qu'un analyseur approximatif.
LATIN = (
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "0123456789"
    "àâäçéèêëîïôöùûüÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ"
    " .,;:!?'’\"«»()[]—–-·/&%+"
)

# Le cyrillique de l'image, DÉRIVÉ DES MOTS EUX-MÊMES et non retapé lettre à
# lettre. La première version l'était, et il y manquait « е » et « у » — deux
# formes de la démonstration s'affichaient donc dans la police latine, en
# glyphes de repli plus maigres, au milieu d'un mot gras. Une liste de
# caractères écrite à la main est une liste qu'on croit complète.
#
# PAS D'ACCENT TONIQUE (U+0301) : satori ne compose pas les marques
# combinantes et le poserait à côté de la voyelle au lieu d'au-dessus.
# L'image s'en passe — l'embarquer ici ne ferait qu'inviter à le réessayer.
CYRILLIC_WORDS = [
    "книга", "книги", "книге", "книгу", "книгой",  # les six cas
    "КНИГА",                                        # le titre de la carte
    "П",                                            # la lettre du logo
]
CYRILLIC = "".join(sorted({c for w in CYRILLIC_WORDS for c in w}))


def ensure(path: str, url: str) -> None:
    if os.path.exists(path):
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    print(f"téléchargement de {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r, open(path, "wb") as f:
        f.write(r.read())


def build(src_woff2: str, text: str, out: str) -> None:
    """WOFF2 variable -> TTF statique, réduit aux caractères demandés."""
    font = TTFont(src_woff2)
    font.flavor = None

    # Inter est variable : on la fige à 700 (le seul poids de l'image) avant
    # de sous-ensembler. Sans ça le fichier emporte tout l'axe de graisse,
    # et satori n'en tirerait de toute façon qu'une instance par défaut.
    if "fvar" in font:
        font = instancer.instantiateVariableFont(font, {"wght": 700}, inplace=True)

    options = Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.recalc_bounds = True

    subsetter = Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)

    os.makedirs(os.path.dirname(out), exist_ok=True)
    font.flavor = None
    font.save(out)

    covered = font.getBestCmap()
    missing = sorted({c for c in text if ord(c) not in covered})
    return covered, missing, os.path.getsize(out)


def main() -> None:
    for path, url in SOURCES.items():
        ensure(path, url)

    latin_src = "scripts/.cache/inter-og-latin.woff2"
    cyrillic_src = "scripts/.cache/inter-og-cyrillic.woff2"

    latin_cov, latin_missing, latin_size = build(latin_src, LATIN, OUT_LATIN)
    cyr_cov, cyr_missing, cyr_size = build(cyrillic_src, CYRILLIC, OUT_CYRILLIC)

    if latin_missing:
        raise SystemExit(f"latin absent du résultat : {latin_missing!r}")
    if cyr_missing:
        raise SystemExit(f"cyrillique absent du résultat : {cyr_missing!r}")

    print(f"{OUT_LATIN} — {len(latin_cov)} points de code, {latin_size / 1024:.1f} Ko")
    print(f"{OUT_CYRILLIC} — {len(cyr_cov)} points de code, {cyr_size / 1024:.1f} Ko")


if __name__ == "__main__":
    main()
