import { describe, expect, test } from "bun:test";
import { linkProblem, mediaUrlProblem, normalizeLink } from "./link-rules.js";

describe("normalizeLink", () => {
  test("acrescenta https:// a endereço sem protocolo", () => {
    expect(normalizeLink("www.google.com")).toBe("https://www.google.com");
    expect(normalizeLink(" instagram.com/atlas ")).toBe(
      "https://instagram.com/atlas"
    );
    expect(normalizeLink("loja.com.br/oferta")).toBe(
      "https://loja.com.br/oferta"
    );
  });
  test("não mexe em link já completo, interno ou âncora", () => {
    for (const v of [
      "https://a.com",
      "http://a.com",
      "/sobre",
      "#topo",
      "mailto:a@b.com",
      "tel:+5583",
      "sobre.html",
      "",
    ])
      expect(normalizeLink(v)).toBe(v);
  });
});

describe("linkProblem", () => {
  test("aceita o que funciona", () => {
    for (const v of [
      "",
      "https://atlas.com.br/x?y=1",
      "/contato",
      "#faq",
      "mailto:a@b.com",
      "tel:+5583999999999",
      "https://wa.me/5583",
      "www.site.com",
    ])
      expect(linkProblem(v)).toBe(null);
  });
  test("recusa esquema perigoso, espaços e endereço quebrado", () => {
    expect(linkProblem("javascript:alert(1)")).toContain("não é permitido");
    expect(linkProblem(" data:text/html,x")).toContain("não é permitido");
    expect(linkProblem("https://meu site.com")).toContain("espaços");
    expect(linkProblem("https://semdominio")).toContain("incompleto");
    expect(linkProblem("meusite")).toContain("https://");
    expect(linkProblem("ftp://x.com")).toContain("https://");
  });
});

describe("mediaUrlProblem", () => {
  test("aceita http(s) e caminho do próprio site", () => {
    for (const v of [
      "",
      "https://cdn.x.com/a.webp",
      "http://a.com/v.mp4",
      "/img/a.png",
      "https://youtu.be/abc",
    ])
      expect(mediaUrlProblem(v)).toBe(null);
  });
  test("recusa arquivo do computador, blob, data e sem protocolo", () => {
    expect(mediaUrlProblem("C:\\Users\\a\\logo.png")).toContain("computador");
    expect(mediaUrlProblem("file:///Users/a/logo.png")).toContain("computador");
    expect(mediaUrlProblem("blob:https://x/abc")).toContain("temporário");
    expect(mediaUrlProblem("data:text/html,<script>1</script>")).toContain(
      "não é permitido"
    );
    expect(mediaUrlProblem("data:image/png;base64,AAA")).toBe(null);
    expect(mediaUrlProblem("logo.png")).toContain("https://");
    expect(mediaUrlProblem("https://a b.com/x.png")).toContain("espaços");
  });
});
