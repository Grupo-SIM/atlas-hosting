import { afterEach, describe, expect, test } from "bun:test";
import { postEditorJson, readEditorResponse } from "./editor-client";
import { SESSION_EXPIRED_MESSAGE } from "./editor-route";

const realFetch = globalThis.fetch;
const errorOf = (o: unknown) => (o as { error?: string }).error;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("readEditorResponse", () => {
  test("resposta da rota passa como veio", async () => {
    const res = Response.json({ error: "Site não encontrado.", ok: false });
    expect(await readEditorResponse(res)).toEqual({
      error: "Site não encontrado.",
      ok: false,
    });
  });

  test("401 sem corpo: sessão expirada", async () => {
    const res = new Response("x", { status: 401 });
    expect(await readEditorResponse(res)).toEqual({
      error: SESSION_EXPIRED_MESSAGE,
      ok: false,
    });
  });

  test("erro do servidor sem JSON: mensagem com o código, sem quebrar", async () => {
    const res = new Response("<html>502</html>", { status: 502 });
    const out = await readEditorResponse(res);
    expect(out.ok).toBe(false);
    expect(errorOf(out)).toContain("502");
  });

  test("413: arquivo grande", async () => {
    const out = await readEditorResponse(new Response("", { status: 413 }));
    expect(errorOf(out)).toContain("grande demais");
  });
});

describe("postEditorJson", () => {
  test("sem conexão vira falha com mensagem, não exceção", async () => {
    globalThis.fetch = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const out = await postEditorJson("/api/x", {});
    expect(out.ok).toBe(false);
    expect(errorOf(out)).toContain("Sem conexão");
  });
});
