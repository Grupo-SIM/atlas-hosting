// Servidor MCP mínimo (stdio, JSON por linha) lançado pelo `claude -p --mcp-config`.
// Não roda no processo do worker. Lê as ferramentas e o callback de um arquivo cujo caminho
// vem em argv[2]; cada `tools/call` vira um POST no callback (o Atlas executa e responde).
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";

interface Config {
  callbackToken: string;
  callbackUrl: string;
  tools: { description: string; inputSchema: unknown; name: string }[];
}

const configPath = process.argv[2];
if (!configPath) {
  console.error("mcp-bridge: caminho da config ausente");
  process.exit(1);
}
const config = JSON.parse(readFileSync(configPath, "utf-8")) as Config;

const send = (message: unknown) =>
  process.stdout.write(`${JSON.stringify(message)}\n`);
const reply = (id: unknown, result: unknown) =>
  send({ id, jsonrpc: "2.0", result });
const fail = (id: unknown, code: number, message: string) =>
  send({ error: { code, message }, id, jsonrpc: "2.0" });

async function callTool(name: string, input: unknown) {
  try {
    const res = await fetch(config.callbackUrl, {
      body: JSON.stringify({ input, name }),
      headers: {
        authorization: `Bearer ${config.callbackToken}`,
        "content-type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(110_000),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      result?: unknown;
    };
    if (!res.ok || body.error) {
      return {
        content: [{ text: body.error ?? `Falha ${res.status}`, type: "text" }],
        isError: true,
      };
    }
    const text =
      typeof body.result === "string"
        ? body.result
        : JSON.stringify(body.result);
    return { content: [{ text, type: "text" }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ text: `Falha ao executar: ${message}`, type: "text" }],
      isError: true,
    };
  }
}

const lines = createInterface({ input: process.stdin });
lines.on("line", async line => {
  if (!line.trim()) return;
  let msg: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }
  // Notificações (sem id) não têm resposta.
  if (msg.id === undefined) return;

  switch (msg.method) {
    case "initialize":
      reply(msg.id, {
        capabilities: { tools: {} },
        protocolVersion:
          (msg.params?.protocolVersion as string) ?? "2024-11-05",
        serverInfo: { name: "atlas", version: "1.0.0" },
      });
      break;
    case "ping":
      reply(msg.id, {});
      break;
    case "tools/list":
      reply(msg.id, { tools: config.tools });
      break;
    case "tools/call": {
      const name = String(msg.params?.name ?? "");
      if (!config.tools.some(t => t.name === name)) {
        fail(msg.id, -32602, `Ferramenta desconhecida: ${name}`);
        break;
      }
      reply(msg.id, await callTool(name, msg.params?.arguments ?? {}));
      break;
    }
    default:
      fail(msg.id, -32601, `Método não suportado: ${msg.method}`);
  }
});
lines.on("close", () => process.exit(0));
