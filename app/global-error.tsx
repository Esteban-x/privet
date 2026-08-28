"use client";

import { useEffect } from "react";

/**
 * Le dernier filet.
 *
 * CE QU'IL RATTRAPE, ET LUI SEUL. `app/error.tsx` vit À L'INTÉRIEUR du
 * layout racine : si c'est ce layout qui échoue — la lecture de session, la
 * requête du plan, le script de thème — il n'a jamais l'occasion d'être
 * rendu. Ce fichier-ci remplace tout le document, y compris `<html>` et
 * `<body>`, et c'est la seule raison pour laquelle il les déclare lui-même.
 *
 * IL NE PEUT S'APPUYER SUR RIEN. Le layout racine n'a pas tourné : pas de
 * globals.css, donc aucune classe utilitaire, aucune variable de thème,
 * aucune police chargée. Tout est donc écrit en styles en ligne, avec des
 * valeurs littérales et une pile de polices système. Toute tentative de
 * réutiliser un composant de l'app le ferait échouer une seconde fois, à
 * l'endroit exact où plus rien ne peut le rattraper.
 *
 * D'OÙ SA SOBRIÉTÉ, qui est un choix et non un oubli : une page qui
 * s'affiche quand tout le reste est cassé n'a pas à être belle, elle a à
 * fonctionner. Le seul luxe est la barre du drapeau en haut — trois couleurs
 * en dégradé, assez pour qu'on reconnaisse chez qui on se trouve.
 *
 * `prefers-color-scheme` est géré à la main, en dupliquant les couleurs dans
 * une balise <style> : sans les variables de globals.css, c'est le seul
 * moyen de ne pas afficher du texte noir sur fond noir à la moitié des gens.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur fatale (layout racine) :", error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        <style>{`
          .ge-root {
            --ge-bg: #fafafc;
            --ge-surface: #ffffff;
            --ge-line: #e4e6ee;
            --ge-ink: #14161f;
            --ge-muted: #5f6579;
            --ge-accent: #1e50c8;
          }
          @media (prefers-color-scheme: dark) {
            .ge-root {
              --ge-bg: #0a0a0a;
              --ge-surface: #131313;
              --ge-line: #292929;
              --ge-ink: #f2f2f2;
              --ge-muted: #9a9a9c;
              --ge-accent: #2f6fe0;
            }
          }
          .ge-btn:focus-visible, .ge-link:focus-visible {
            outline: 2px solid var(--ge-accent);
            outline-offset: 3px;
          }
        `}</style>

        <div
          className="ge-root"
          style={{
            minHeight: "100vh",
            background: "var(--ge-bg)",
            color: "var(--ge-ink)",
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            lineHeight: 1.6,
          }}
        >
          {/* Les trois couleurs du drapeau : le seul élément de marque qui
              survit sans feuille de style ni police. */}
          <div
            aria-hidden
            style={{
              height: 6,
              background: "linear-gradient(90deg, #f7f7f7 0%, #1c4fc4 50%, #d52b1e 100%)",
            }}
          />

          <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 24px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ge-muted)",
              }}
            >
              Privetik
            </p>

            <h1
              style={{
                margin: "16px 0 0",
                fontSize: 30,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              L&apos;application n&apos;a pas pu démarrer
            </h1>

            <p style={{ margin: "16px 0 0", color: "var(--ge-muted)" }}>
              Une panne nous empêche d&apos;afficher la page. Elle est de notre côté, et elle est
              généralement brève : recharger suffit le plus souvent.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
              <button
                className="ge-btn"
                onClick={reset}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "12px 22px",
                  background: "var(--ge-accent)",
                  color: "#fff",
                  font: "inherit",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Recharger
              </button>
              {/* UN <a> ET NON UN <Link>, volontairement. `next/link` fait une
                  navigation côté client : il réutiliserait l'arbre React qui
                  vient précisément de s'effondrer, et rejouerait la même
                  panne. Seul un vrai rechargement repart d'une page propre —
                  c'est tout l'intérêt d'être ici. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                className="ge-link"
                href="/"
                style={{
                  borderRadius: 10,
                  padding: "12px 22px",
                  border: "1px solid var(--ge-line)",
                  color: "var(--ge-ink)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Retour à l&apos;accueil
              </a>
            </div>

            {error.digest && (
              <div
                style={{
                  marginTop: 36,
                  padding: "16px 18px",
                  background: "var(--ge-surface)",
                  border: "1px solid var(--ge-line)",
                  borderRadius: 14,
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "var(--ge-muted)" }}>
                  Si la panne persiste, écrivez-nous en citant ce code :
                </p>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                    fontSize: 13,
                    userSelect: "all",
                  }}
                >
                  {error.digest}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
