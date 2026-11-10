import { describe, expect, test } from "bun:test";
import { fontStylesheet, themeFont, usesFont } from "./fonts.js";

describe("usesFont", () => {
  test("aceita a família com ou sem aspas", () => {
    expect(usesFont("'Raleway', sans-serif", "Raleway")).toBe(true);
    expect(usesFont("Raleway", "Raleway")).toBe(true);
    expect(usesFont("Open Sans", "Open Sans")).toBe(true);
    expect(usesFont("Raleway, sans-serif", "Raleway")).toBe(true);
  });

  test("não confunde famílias de nome parecido", () => {
    expect(usesFont("'Roboto Slab', serif", "Roboto")).toBe(false);
    expect(usesFont("Roboto Slab", "Roboto")).toBe(false);
    expect(usesFont("Flora", "Lora")).toBe(false);
    expect(usesFont(undefined, "Roboto")).toBe(false);
  });
});

describe("fontStylesheet", () => {
  test("site criado com fontes sem aspas ainda baixa as fontes", () => {
    const url = fontStylesheet({
      theme: { fontBody: "Roboto", fontHeading: "Raleway" },
    });
    expect(url).toContain("family=Roboto");
    expect(url).toContain("family=Raleway");
  });

  test("forma com aspas continua igual", () => {
    const url = fontStylesheet({
      theme: {
        fontBody: "'Open Sans', sans-serif",
        fontHeading: "'Montserrat', sans-serif",
      },
    });
    expect(url).toContain("family=Open+Sans");
    expect(url).toContain("family=Montserrat");
  });

  test("themeFont reconhece as duas formas", () => {
    expect(themeFont({ fontBody: "Raleway" })).toBe("Raleway");
    expect(themeFont({ fontBody: "'Raleway', sans-serif" })).toBe("Raleway");
  });
});
