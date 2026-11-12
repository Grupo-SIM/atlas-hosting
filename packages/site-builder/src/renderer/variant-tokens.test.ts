import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { VARIANT_TOKENS } from "./variant-tokens.js";

const FILE: Record<string, string> = {
  corte: "corte",
  gatilhos: "gatilhos",
  journal: "journal",
  portal: "portal",
  raiz: "raiz",
  vslmilionario: "vslmilionario",
};

const blocks = readdirSync(new URL("../blocks/", import.meta.url))
  .filter(f => f.endsWith(".tsx"))
  .map(f => readFileSync(new URL(`../blocks/${f}`, import.meta.url), "utf8"))
  .join("\n");

describe("VARIANT_TOKENS", () => {
  for (const [variant, tokens] of Object.entries(VARIANT_TOKENS)) {
    test(`${variant}: o CSS da variante lê cada cor listada`, () => {
      const src = readFileSync(
        new URL(`./${FILE[variant] ?? variant}.ts`, import.meta.url),
        "utf8"
      );
      for (const tok of tokens) {
        expect(src + blocks).toContain(`theme.${tok.key}`);
      }
    });
  }
});
