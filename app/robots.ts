import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

/**
 * Ce que les moteurs ont le droit d'explorer.
 *
 * CE FICHIER NE PROTÈGE RIEN. `Disallow` est une demande, pas une serrure —
 * la vraie protection est dans proxy.ts, qui exige une session. Ce qu'on
 * règle ici, c'est la DÉPENSE : un robot dispose d'un budget d'exploration
 * fini par site, et le gaspiller sur des adresses qui répondent toutes une
 * redirection vers /login retarde d'autant la découverte des pages qui, elles,
 * ont quelque chose à indexer.
 *
 * POURQUOI /login ET /signup NE SONT PLUS EXCLUS, ET C'EST VOULU. Ils l'ont
 * été, pour la meilleure des raisons — aucune recherche ne les vise, et
 * proxy.ts y renvoie avec un `?next=` qui engendre autant d'adresses
 * distinctes qu'il existe de pages protégées. Mais interdire ici ne
 * désindexe pas : ça empêche de LIRE la page. Or ces deux-là sont liées
 * depuis la barre de navigation de toutes les pages publiques. Un moteur les
 * découvre donc forcément, ne peut pas les ouvrir, et les publie en résultat
 * nu — une URL sans titre ni description, la ligne « aucune information
 * disponible » que personne ne veut voir sous son nom de domaine. Et comme
 * il n'a pas le droit de les lire, il ne verra jamais la balise qui lui
 * demande de les retirer.
 *
 * Les deux directives s'excluent : `Disallow` interdit la lecture, `noindex`
 * exige d'être lu. Pour une page liée depuis la navigation, c'est `noindex`
 * qui gagne — voir app/login/page.tsx et app/signup/page.tsx, qui le
 * déclarent maintenant. Le coût est de deux explorations ; le gain est un
 * retrait définitif au lieu d'un résultat nu et indélogeable.
 *
 * Les `?next=` ne sont pas un problème pour autant : un robot ne les
 * fabrique pas tout seul, il ne les rencontre qu'en suivant une redirection
 * depuis une page protégée — et celles-là restent interdites ci-dessous,
 * donc il ne les ouvre jamais. Les rares qu'il verrait porteraient de toute
 * façon le même `noindex`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          // Les espaces personnels : rien d'indexable, et ils répondent de
          // toute façon une redirection à un visiteur.
          "/account",
          "/dashboard",
          "/onboarding",
          "/level-test",
          "/reset-password",
          // LA BARRE FINALE, comme pour /alphabet plus bas : les deux
          // accueils sont publics et portent une démonstration à indexer —
          // un texte russe glosé mot à mot, une carte de révision — mais
          // leur descendance reste des espaces personnels en redirection.
          "/vocabulary/",
          "/reading/",
          // Les modules d'entraînement. Tous protégés, donc tous en
          // redirection pour un robot — et sans contenu à indexer de toute
          // façon : un exercice est un formulaire, pas un texte.
          //
          // /exercices N'EN FAIT PLUS PARTIE : le catalogue est public
          // (voir proxy.ts) et c'est du vrai texte — huit modules décrits,
          // leurs niveaux, les compétences de chacun. C'est aussi la page
          // qui distribue les liens internes vers /cases, /alphabet et les
          // leçons correspondantes.
          "/adjectives",
          "/aspect",
          "/motion",
          "/participles",
          // L'INDEX EST PUBLIC, LES SOUS-PAGES NON. `/alphabet` se lit sans
          // compte et doit être indexé ; `/alphabet/lecture` est un exercice.
          // D'où la barre finale : elle interdit la descendance sans toucher
          // à la page elle-même.
          "/alphabet/",
          "/conjugation/",
          "/numbers/",
          // /login et /signup ne sont plus ici : ils portent un `noindex`,
          // qui ne fonctionne que si le robot a le droit de les lire.
          // /auth reste interdit — ce sont des routes de rappel qui portent
          // des jetons dans l'URL, et elles n'affichent rien à indexer.
          "/auth",
        ],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
