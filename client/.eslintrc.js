module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  // Specifies the ESLint parser
  parser: "@typescript-eslint/parser",
  extends: [
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:@typescript-eslint/recommended",
    // "airbnb",
    // "airbnb/hooks",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/ban-ts-comment": [
      2,
      { "ts-expect-error": false, "ts-check": false },
    ],
    "@typescript-eslint/indent": [2, 2],
    indent: "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-undef": ["error", { typeof: true }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        caughtErrors: "all",
        varsIgnorePattern: "^ignore$",
        argsIgnorePattern: "^ignore$",
      },
    ],
  },
};
