import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "build/**",
      ".next/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "test*.js",
      "test*.ts"
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/ban-ts-comment": "off",
      "no-undef": "off",
    },
  }
);
