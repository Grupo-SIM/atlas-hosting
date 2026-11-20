import { describe, expect, test } from "bun:test";
import { isSameOrigin } from "./editor-route";

const h = (init: Record<string, string>) => new Headers(init);

describe("isSameOrigin", () => {
  test("mesmo site", () => {
    expect(
      isSameOrigin(
        h({
          host: "atlashosting.com.br",
          origin: "https://atlashosting.com.br",
        })
      )
    ).toBe(true);
    expect(
      isSameOrigin(
        h({ host: "localhost:3000", origin: "http://localhost:3000" })
      )
    ).toBe(true);
  });
  test("atrás do proxy vale o host repassado", () => {
    expect(
      isSameOrigin(
        h({
          host: "frontend:3000",
          origin: "https://atlashosting.com.br",
          "x-forwarded-host": "atlashosting.com.br",
        })
      )
    ).toBe(true);
  });
  test("outro site, sem origem ou origem inválida", () => {
    expect(
      isSameOrigin(
        h({ host: "atlashosting.com.br", origin: "https://malicioso.com" })
      )
    ).toBe(false);
    expect(isSameOrigin(h({ host: "atlashosting.com.br" }))).toBe(false);
    expect(
      isSameOrigin(h({ host: "atlashosting.com.br", origin: "null" }))
    ).toBe(false);
  });
});
