/**
 * Une balise de données structurées.
 *
 * `dangerouslySetInnerHTML` est ici le chemin normal, pas un contournement :
 * React échapperait `<`, `>` et `&` dans un nœud texte, ce qui produirait un
 * JSON invalide qu'aucun moteur ne lirait. Le contenu n'est jamais de la
 * saisie utilisateur — il est construit dans lib/seo/structured-data.ts à
 * partir de constantes du dépôt.
 *
 * `JSON.stringify` échappe déjà les guillemets ; reste `</script>`, qu'un
 * texte pourrait contenir et qui fermerait la balise en plein milieu. D'où le
 * remplacement du chevron ouvrant, invisible pour un analyseur JSON.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
