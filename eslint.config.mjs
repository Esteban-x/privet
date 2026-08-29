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
]);

export default eslintConfig;
