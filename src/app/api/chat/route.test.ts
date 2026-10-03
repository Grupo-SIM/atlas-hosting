import { afterEach, describe, expect, test } from "bun:test";
import { POST } from "./route";

const originalFetch = globalThis.fetch;
const originalUrl = process.env.N8N_URL;
const originalPublicUrl = process.env.NEXT_PUBLIC_N8N_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.N8N_URL;
  else process.env.N8N_URL = originalUrl;
  if (originalPublicUrl === undefined) delete process.env.NEXT_PUBLIC_N8N_URL;
  else process.env.NEXT_PUBLIC_N8N_URL = originalPublicUrl;
});

const payload = { action: "sendMessage", sessionId: "session", chatInput: "Olá" };
const request = () => new Request("http://localhost/api/chat", {
  method: "POST", body: JSON.stringify(payload),
});

function mockUpstream(response: Response) {
  globalThis.fetch = (async () => response) as typeof fetch;
}

describe("Atlas IA proxy", () => {
  test("reads runtime configuration and forwards chat payload", async () => {
    process.env.N8N_URL = "https://n8n.example.com/";
    process.env.NEXT_PUBLIC_N8N_URL = "https://old.example.com";
    globalThis.fetch = (async (url, options) => {
      expect(String(url)).toBe("https://n8n.example.com/webhook/6229f9db-8b7f-40ad-8a71-503727e71c34/chat");
      expect(options?.method).toBe("POST");
      expect(JSON.parse(options?.body as string)).toEqual(payload);
      return Response.json({ output: "Olá!" });
    }) as typeof fetch;
    expect(await (await POST(request())).json()).toEqual({ output: "Olá!" });
  });

  test("supports existing environment variable", async () => {
    delete process.env.N8N_URL;
    process.env.NEXT_PUBLIC_N8N_URL = "https://n8n.example.com";
    mockUpstream(Response.json([]));
    const history = new Request("http://localhost/api/chat", {
      method: "POST", body: JSON.stringify({ action: "loadPreviousSession", sessionId: "session" }),
    });
    expect(await (await POST(history)).json()).toEqual([]);
  });

  test("missing configuration never requests a relative site URL", async () => {
    delete process.env.N8N_URL;
    delete process.env.NEXT_PUBLIC_N8N_URL;
    globalThis.fetch = (async () => { throw new Error("Unexpected fetch"); }) as typeof fetch;
    expect((await POST(request())).status).toBe(503);
  });

  test("replaces upstream 404 HTML with a readable message", async () => {
    process.env.N8N_URL = "https://n8n.example.com";
    mockUpstream(new Response("<!DOCTYPE html><html>404</html>", { status: 404 }));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect((await response.json()).output).toContain("indisponível");
  });

  test("rejects HTML even with success status", async () => {
    process.env.N8N_URL = "https://n8n.example.com";
    mockUpstream(new Response("<!DOCTYPE html><html>Login</html>"));
    expect((await POST(request())).status).toBe(502);
  });

  test("handles upstream network failures", async () => {
    process.env.N8N_URL = "https://n8n.example.com";
    globalThis.fetch = (async () => { throw new Error("Offline"); }) as typeof fetch;
    expect((await POST(request())).status).toBe(502);
  });
});
