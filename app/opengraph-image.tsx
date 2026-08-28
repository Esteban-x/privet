import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { TOTAL_LESSONS } from "@/lib/courses/catalog";
import { NOUNS } from "@/lib/grammar/nouns-data";

/**
 * L'aperçu affiché quand un lien vers Privetik est collé quelque part.
 *
 * GÉNÉRÉE, PAS DESSINÉE. Une image exportée d'un outil graphique se périme
 * dès que le contenu bouge — elle annoncerait « 120 leçons » six mois après
 * qu'il y en a 130. Ici les deux chiffres viennent du catalogue et de la
 * banque de noms, comme sur la page d'accueil : ils ne peuvent pas mentir.
 *
 * ELLE MONTRE LA MATIÈRE, pas un slogan. Une déclinaison complète tient sur
 * la moitié droite : c'est la seule chose qui distingue Privetik d'une
 * application de vocabulaire, et c'est ce qu'il faut voir avant de cliquer.
 *
 * TOUT EST EN DUR ICI, sans variable CSS : `ImageResponse` rend le SVG dans
 * un moteur isolé qui ne connaît ni globals.css ni les tokens de thème. Les
 * couleurs sont donc recopiées, et il faut penser à les suivre — d'où le
 * nombre réduit : deux bleus, un rouge, deux gris.
 */

export const alt =
  "Privetik — apprendre le russe : les cas, l'aspect et les verbes de mouvement, corrigés par un moteur de règles";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#f2f2f2";
const MUTED = "#9a9a9c";
const GROUND = "#0a0a0a";
const CARD = "#131313";
const LINE = "#292929";
const BLUE = "#2f6fe0";
const RED = "#d52b1e";

/**
 * « книга » décliné aux six cas — la démonstration qui ouvre l'accueil.
 *
 * SANS ACCENT TONIQUE ICI, contrairement au reste de l'app. U+0301 est une
 * marque COMBINANTE : c'est la police qui la place au-dessus de la voyelle,
 * par une ancre GPOS. Satori ne compose pas les marques — il pose le signe
 * à la suite, et « кни́га » s'affiche avec l'accent collé après le и. Mieux
 * vaut pas d'accent qu'un accent faux sur l'image que tout le monde voit.
 */
const ROWS = [
  ["Nominatif", "книга"],
  ["Génitif", "книги"],
  ["Datif", "книге"],
  ["Accusatif", "книгу"],
  ["Instrumental", "книгой"],
  ["Prépositionnel", "книге"],
];

/**
 * Les polices, lues sur le disque au moment du rendu.
 *
 * SATORI N'A AUCUNE POLICE SYSTÈME : il refuse de composer quoi que ce soit
 * sans qu'on lui en fournisse au moins une, et il ne lit pas le WOFF2 —
 * donc ni Inter (chargée par <link> côté navigateur) ni
 * privetik-cyrillic.woff2 ne peuvent servir ici. Ces deux TTF sont produits
 * par `python scripts/build-og-font.py`, réduits aux seuls caractères de
 * l'image : 30 Ko à eux deux.
 *
 * DEUX FICHIERS, un latin et un cyrillique : satori parcourt la liste et va
 * chercher dans le suivant chaque glyphe absent du premier.
 */
async function loadFonts() {
  const dir = join(process.cwd(), "app");
  const [latin, cyrillic] = await Promise.all([
    readFile(join(dir, "og-font-latin.ttf")),
    readFile(join(dir, "og-font-cyrillic.ttf")),
  ]);
  return [
    { name: "Privetik", data: latin, style: "normal" as const, weight: 700 as const },
    { name: "PrivetikCyr", data: cyrillic, style: "normal" as const, weight: 700 as const },
  ];
}

export default async function Image() {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: GROUND,
          color: INK,
          fontFamily: "Privetik, PrivetikCyr",
          position: "relative",
        }}
      >
        {/* La bande du drapeau, en haut : c'est elle qu'on reconnaît en
            vignette de 200 px de large, avant même de lire le titre. */}
        <div
          style={{
            display: "flex",
            height: 10,
            background: `linear-gradient(90deg, #f7f7f7 0%, ${BLUE} 50%, ${RED} 100%)`,
          }}
        />

        <div style={{ display: "flex", flex: 1, padding: "56px 64px", gap: 56 }}>
          {/* Gauche : la marque et la promesse */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1.15 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, #f7f7f7 0%, ${BLUE} 46%, ${RED} 100%)`,
                  fontSize: 34,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                П
              </div>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
                Privetik
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 38,
                fontSize: 60,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
              }}
            >
              Le russe pour de vrai, cas après cas.
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 26,
                lineHeight: 1.4,
                color: MUTED,
              }}
            >
              Les six cas, l&apos;aspect et les verbes de mouvement — corrigés par un moteur de
              règles, pas devinés.
            </div>

            <div style={{ display: "flex", flex: 1 }} />

            {/* UN SEUL NŒUD DE TEXTE, séparé par des points médians. En trois
                <div> avec un `gap`, satori collait le deuxième au troisième :
                son implémentation de `gap` sur une rangée flex est partielle.
                Le séparateur écrit ne peut pas, lui, être ignoré. */}
            <div style={{ display: "flex", fontSize: 22, color: MUTED }}>
              {`${TOTAL_LESSONS} leçons · ${NOUNS.length} noms vérifiés · 8 modules`}
            </div>
          </div>

          {/* Droite : une déclinaison entière. La preuve tient en six lignes. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              background: CARD,
              border: `1px solid ${LINE}`,
              borderRadius: 20,
              padding: "30px 30px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 17,
                letterSpacing: 1.4,
                color: BLUE,
                fontWeight: 700,
              }}
            >
              КНИГА · LIVRE
            </div>

            {ROWS.map(([label, form]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginTop: 18,
                }}
              >
                <div style={{ display: "flex", fontSize: 20, color: MUTED }}>{label}</div>
                <div style={{ display: "flex", fontSize: 27, fontWeight: 700 }}>{form}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
