// https://www.npmjs.com/package/eslint-plugin-prettier
// https://eslint.org/docs/latest/use/getting-started

import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      globals: {
        // Define Node.js global variables (like 'process')
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
      },
      ecmaVersion: 2021,
      sourceType: "module",
    },
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "crlf", // Enforce Unix-style line endings (\n)
        },
      ],
    },
  },
  prettierConfig, // Use Prettier's config to disable conflicting ESLint rules
];
