const eslintJs = require("@eslint/js");
const { configs: eslintConfigs } = eslintJs;
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");

// Common configuration shared between source and test files
const commonNodeGlobals = {
  console: "readonly",
  process: "readonly",
  Buffer: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  module: "readonly",
  require: "readonly",
  exports: "readonly",
  global: "readonly",
};

const commonLanguageOptions = {
  parser: tsparser,
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
};

const commonPlugins = {
  "@typescript-eslint": tseslint,
};

const commonRules = {
  quotes: ["error", "double", { avoidEscape: true }],
  semi: ["error", "always"],
  "no-unused-vars": "off", // Disable base rule in favor of TypeScript-specific rule
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/prefer-nullish-coalescing": "error",
  "@typescript-eslint/prefer-optional-chain": "error",
  "@typescript-eslint/no-unnecessary-condition": "warn",
};

module.exports = [
  // Base ESLint recommended rules
  eslintConfigs.recommended,

  // TypeScript configuration for tools
  {
    files: ["tools/**/*.ts"],
    languageOptions: {
      ...commonLanguageOptions,
      parserOptions: {
        ...commonLanguageOptions.parserOptions,
        project: "./tsconfig.tools.json",
      },
      globals: commonNodeGlobals,
    },
    plugins: commonPlugins,
    rules: {
      ...commonRules,
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
  },

  // TypeScript configuration for main source files
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ...commonLanguageOptions,
      parserOptions: {
        ...commonLanguageOptions.parserOptions,
        project: "./tsconfig.json",
      },
      globals: commonNodeGlobals,
    },
    plugins: commonPlugins,
    rules: {
      ...commonRules,
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
  },

  // TypeScript configuration for test files
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      ...commonLanguageOptions,
      parserOptions: {
        ...commonLanguageOptions.parserOptions,
        project: "./tsconfig.test.json",
      },
      globals: {
        ...commonNodeGlobals,
        // Jest globals
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    plugins: commonPlugins,
    rules: {
      ...commonRules,
      "@typescript-eslint/explicit-function-return-type": "off", // Less strict for tests
    },
  },
];
