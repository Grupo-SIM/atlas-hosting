import { describe, expect, test } from "bun:test";
import { checkSiteLive, type LiveCheckDeps } from "./liveCheck";

function deps(overrides: Partial<LiveCheckDeps>): LiveCheckDeps {
  return {
    fetchHead: async () => 200,
    resolve4: async () => ["1.2.3.4"],
    ...overrides,
  };
}

describe("checkSiteLive", () => {
  test("no ar quando o DNS aponta para o servidor e o HTTPS responde", async () => {
    expect(await checkSiteLive("a.com", "1.2.3.4", deps({}))).toBe("live");
  });

  test("redirecionamento também conta como no ar", async () => {
    expect(
      await checkSiteLive(
        "a.com",
        "1.2.3.4",
        deps({ fetchHead: async () => 301 })
      )
    ).toBe("live");
  });

  test("aguarda DNS quando o domínio não resolve", async () => {
    const result = await checkSiteLive(
      "a.com",
      "1.2.3.4",
      deps({
        resolve4: async () => {
          throw new Error("ENOTFOUND");
        },
      })
    );
    expect(result).toBe("no_dns");
  });

  test("aguarda DNS quando resolve para outro servidor, sem consultar o HTTPS", async () => {
    let fetched = false;
    const result = await checkSiteLive(
      "a.com",
      "1.2.3.4",
      deps({
        fetchHead: async () => {
          fetched = true;
          return 200;
        },
        resolve4: async () => ["9.9.9.9"],
      })
    );
    expect(result).toBe("no_dns");
    expect(fetched).toBe(false);
  });

  test("DNS pronto mas HTTPS fora do ar", async () => {
    const result = await checkSiteLive(
      "a.com",
      "1.2.3.4",
      deps({
        fetchHead: async () => {
          throw new Error("certificate");
        },
      })
    );
    expect(result).toBe("no_site");
  });

  test("erro 5xx não conta como no ar", async () => {
    expect(
      await checkSiteLive(
        "a.com",
        "1.2.3.4",
        deps({ fetchHead: async () => 502 })
      )
    ).toBe("no_site");
  });

  test("destino em hostname é resolvido antes da comparação", async () => {
    const result = await checkSiteLive(
      "a.com",
      "vps.example.com",
      deps({
        resolve4: async host =>
          host === "vps.example.com" ? ["5.5.5.5"] : ["5.5.5.5"],
      })
    );
    expect(result).toBe("live");
  });
});
