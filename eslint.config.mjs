import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  // ========================
  // Next.js core rules
  // ========================
  ...nextVitals,
  ...nextTs,

  // ========================
  // Ignore files / folders
  // ========================
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"]),

  // ========================
  // Global TS / TSX rules
  // ========================
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      /**
       * 🔥 AUTO REMOVE UNUSED IMPORTS
       */
      "unused-imports/no-unused-imports": "error",

      /**
       * ⚠️ UNUSED VARS (allow _var)
       */
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      /**
       * ✨ Quality-of-life
       */
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",

      /**
       * 🧘 Let Prettier handle formatting
       */
      "prettier/prettier": "off",
    },
  },

  // ========================
  // Relax rules for vendor / SDK / generated-like code
  // ========================
  {
    files: [
      "components/ui/**",
      "lib/payment/**",
      "lib/orpc/**",
      "scripts/**",
      "lib/polyfills.ts",
      "lib/superjson.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
]);

export default eslintConfig;
