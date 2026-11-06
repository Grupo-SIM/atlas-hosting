import { timingSafeEqual } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  authStatus,
  type ChatInput,
  chat,
  disconnect,
  finishLogin,
  perUser,
  scrubApiEnv,
  startLogin,
} from "./claude.ts";

const log = (msg: string) => console.log(`[claude-worker] ${msg}`);

for (const key of scrubApiEnv()) {
  log(
    `AVISO: ${key} estava no ambiente e foi REMOVIDA. Este serviço só usa assinatura.`
  );
}

const TOKEN = process.env.CLAUDE_WORKER_TOKEN?.trim();
if (!TOKEN) {
  console.error(
    "[claude-worker] CLAUDE_WORKER_TOKEN ausente: recusando subir sem autenticação."
  );
  process.exit(1);
}

// Cabe o texto e até 4 imagens de 5 MB em base64.
const MAX_BODY = 40 * 1024 * 1024;

async function readJson(
  req: IncomingMessage
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new Error("Corpo grande demais");
    chunks.push(chunk as Buffer);
  }
  return chunks.length
    ? JSON.parse(Buffer.concat(chunks).toString("utf-8"))
    : {};
}

const json = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

function authorized(req: IncomingMessage): boolean {
  const given = Buffer.from(String(req.headers["x-worker-token"] ?? ""));
  const want = Buffer.from(TOKEN as string);
  return given.length === want.length && timingSafeEqual(given, want);
}

const server = createServer(async (req, res) => {
  try {
    if (!authorized(req)) return json(res, 401, { error: "unauthorized" });
    const path = new URL(req.url ?? "/", "http://worker").pathname;

    if (req.method === "GET" && path === "/health")
      return json(res, 200, { ok: true });

    const account =
      /^\/accounts\/([^/]+)(\/auth\/start|\/auth\/finish|\/status)?$/.exec(
        path
      );
    if (account) {
      const userId = decodeURIComponent(account[1] as string);
      const action = account[2];
      if (req.method === "GET" && action === "/status") {
        return json(res, 200, await authStatus(userId));
      }
      if (req.method === "POST" && action === "/auth/start") {
        return json(res, 200, await startLogin(userId));
      }
      if (req.method === "POST" && action === "/auth/finish") {
        const body = await readJson(req);
        return json(
          res,
          200,
          await finishLogin(
            userId,
            String(body.loginId ?? ""),
            String(body.code ?? "")
          )
        );
      }
      if (req.method === "DELETE" && !action) {
        await disconnect(userId);
        return json(res, 200, { ok: true });
      }
    }

    if (req.method === "POST" && path === "/chat") {
      const body = (await readJson(req)) as unknown as ChatInput;
      const controller = new AbortController();
      res.on("close", () => controller.abort());
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "application/x-ndjson",
      });
      await perUser(body.userId, async () => {
        for await (const event of chat(body, controller.signal)) {
          if (res.writableEnded) break;
          res.write(`${JSON.stringify(event)}\n`);
        }
      });
      return void res.end();
    }

    json(res, 404, { error: "not_found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro";
    log(`erro: ${message}`);
    if (res.headersSent) {
      res.write(`${JSON.stringify({ message, type: "error" })}\n`);
      res.end();
    } else {
      json(res, 500, { error: message });
    }
  }
});

server.requestTimeout = 0;
server.listen(3000, "0.0.0.0", () => log("ouvindo na porta 3000"));
