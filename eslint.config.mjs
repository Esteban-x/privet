import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Artefacts locaux de `supabase start` : du code minifié, non versionné
    // (.gitignore), et qui produisait à lui seul 183 erreurs — assez pour
    // rendre `npm run lint` inexploitable et faire ignorer les vraies.
    "supabase/.temp/**",
  ]),
  {
    /**
     * LE SOULIGNÉ DE TÊTE VEUT DIRE « INUTILISÉ À DESSEIN ».
     *
     * La convention était déjà suivie dans le code — `_previous`,
     * `_formData` de app/account/actions.ts, dont la signature est imposée
     * par `useActionState` et non par nous — mais la règle ne la
     * connaissait pas, et les signalait quand même. Deux avertissements
     * permanents qu'on apprend à ignorer, ce qui est exactement ce qui
     * fait rater le troisième.
     */
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
