/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

module.exports = {
  root: true,
  // eslint-disable-next-line object-curly-spacing
  env: { es6: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./tsconfig.dev.json"],
    sourceType: "module",
    ecmaVersion: 2022,
  },
  ignorePatterns: ["lib/**/*", "generated/**/*", ".eslintrc.cjs"],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // Estilo básico
    // eslint-disable-next-line quote-props
    "valid-jsdoc": "off",
    // eslint-disable-next-line quote-props
    quotes: ["error", "double"],
    // eslint-disable-next-line quote-props
    indent: ["error", 2],

    // 🔧 Corrige tus errores reportados
    "object-curly-spacing": ["error", "never"],

    // Mantiene 80 chars pero ignora URLs, strings y templates (evita falsos positivos)
    "max-len": [
      "error",
      {
        code: 80,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreComments: true,
      },
    ],

    // Evita los errores de JSDoc obligatoria del preset "google"
    "require-jsdoc": "off",

    // Typescript lint
    "@typescript-eslint/no-explicit-any": "warn",

    // Evita falsos positivos con paths TS resueltos por tsconfig (ya lo tienes)
    "import/no-unresolved": 0,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: path.join(__dirname, "tsconfig.json"),
      },
    },
  },
};
