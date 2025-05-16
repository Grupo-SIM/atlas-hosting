// @ts-check
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    rules: {
      "indent": [
        "error",
        2
      ],
      "semi": [
        "error",
        "always"
      ],
      "quotes": [
        "error",
        "double"
      ],
      "@typescript-eslint/no-unused-vars": "off"
    }
  }),
];

export default eslintConfig;