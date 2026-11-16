import { expect, test } from "bun:test";
import { parseSiteFilter } from "./SiteFilter";

test("o valor da URL vira o filtro; o que não existe vira todos", () => {
  expect(parseSiteFilter("no-ar")).toBe("no-ar");
  expect(parseSiteFilter("nao-publicado")).toBe("nao-publicado");
  expect(parseSiteFilter("todos")).toBe("todos");
  expect(parseSiteFilter(undefined)).toBe("todos");
  expect(parseSiteFilter("<script>")).toBe("todos");
});
