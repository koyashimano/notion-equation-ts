import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";

export default [
  {
    files: ["**/*.ts"],
    ignores: ["/dist/*", "eslint.config.mjs"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "import/order": [
        "error",
        {
          groups: [["builtin", "external", "internal"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
      "no-console": "off",
      "sort-imports": [
        "error",
        { ignoreDeclarationSort: true, ignoreMemberSort: false },
      ],
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: eslintPluginImport,
    },
  },
];
