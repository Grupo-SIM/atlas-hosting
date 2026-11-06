import { type ChildProcess, execFile, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const USERS_DIR = process.env.WORKER_USERS_DIR ?? "/state/claude/users";
const BRIDGE = fileURLToPath(new URL("./mcp-bridge.ts", import.meta.url));

/** Credenciais de API vencem o login por assinatura (e cobram por token): nenhuma pode chegar ao CLI. */
const API_ENV = [
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_AUTH_TOKEN",
  "ANTHROPIC_BASE_URL",
  "CLAUDE_CODE_USE_BEDROCK",
  "CLAUDE_CODE_USE_VERTEX",
  "CLAUDE_CODE_OAUTH_TOKEN",
];
export function scrubApiEnv(): string[] {
  const removed = API_ENV.filter(k => process.env[k] !== undefined);
  for (const k of API_ENV) delete process.env[k];
  return removed;
}

const USER_ID = /^[A-Za-z0-9_-]{1,64}$/;
export function configDirFor(userId: string): string {
  if (!USER_ID.test(userId)) throw new Error("userId inválido");
  return join(USERS_DIR, userId);
}

const cliEnv = (userId: string) => ({
  ...process.env,
  CLAUDE_CONFIG_DIR: configDirFor(userId),
});

// ---------- fila por usuário (dois turnos do mesmo usuário não disputam o mesmo diretório) ----------
const queues = new Map<string, Promise<unknown>>();
export function perUser<T>(userId: string, task: () => Promise<T>): Promise<T> {
  const run = (queues.get(userId) ?? Promise.resolve()).then(task, task);
  queues.set(
    userId,
    run.catch(() => undefined)
  );
  return run;
}

// ---------- status ----------
export interface AuthStatus {
  connected: boolean;
  email?: string;
  plan?: string;
}

export async function authStatus(userId: string): Promise<AuthStatus> {
  try {
    const { stdout } = await execFileAsync(
      "claude",
      ["auth", "status", "--json"],
      {
        env: cliEnv(userId),
        timeout: 20_000,
      }
    );
    const raw = JSON.parse(stdout) as {
      authMethod?: string;
      email?: string;
      loggedIn?: boolean;
      subscriptionType?: string;
    };
    // Só `claude.ai` é assinatura; api_key/oauth_token não contam.
    if (raw.loggedIn !== true || raw.authMethod !== "claude.ai")
      return { connected: false };
    return { connected: true, email: raw.email, plan: raw.subscriptionType };
  } catch {
    // Sem login o CLI sai com código != 0: é o estado "desconectado", não um erro do worker.
    return { connected: false };
  }
}

// ---------- login ----------
interface PendingLogin {
  process: ChildProcess;
  startedAt: number;
  userId: string;
}
const logins = new Map<string, PendingLogin>();
const LOGIN_TTL_MS = 10 * 60_000;

function killLogin(id: string) {
  const login = logins.get(id);
  if (!login) return;
  logins.delete(id);
  if (login.process.exitCode === null) login.process.kill("SIGTERM");
}
setInterval(() => {
  for (const [id, l] of logins)
    if (Date.now() - l.startedAt > LOGIN_TTL_MS) killLogin(id);
}, 30_000).unref();

export async function startLogin(
  userId: string
): Promise<{ loginId: string; url: string }> {
  for (const [id, l] of logins) if (l.userId === userId) killLogin(id);
  const dir = configDirFor(userId);
  await mkdir(dir, { mode: 0o700, recursive: true });
  const proc = spawn("claude", ["auth", "login"], { env: cliEnv(userId) });
  proc.stderr.resume();
  const loginId = randomUUID();
  logins.set(loginId, { process: proc, startedAt: Date.now(), userId });

  return new Promise((resolve, reject) => {
    let buffer = "";
    let settled = false;
    const finish = (error?: Error, url?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) {
        killLogin(loginId);
        reject(error);
      } else {
        resolve({ loginId, url: url as string });
      }
    };
    const timer = setTimeout(
      () => finish(new Error("O Claude não devolveu o link de login a tempo.")),
      20_000
    );
    proc.stdout.on("data", (chunk: Buffer) => {
      buffer = (buffer + chunk.toString()).slice(-16_384);
      const match = /https:\/\/\S+oauth\/authorize\S*/.exec(buffer);
      if (match) finish(undefined, match[0]);
    });
    proc.on("error", () =>
      finish(new Error("Não foi possível iniciar o Claude."))
    );
    proc.on("exit", () =>
      finish(new Error("O login terminou antes de gerar o link."))
    );
  });
}

export async function finishLogin(
  userId: string,
  loginId: string,
  code: string
): Promise<AuthStatus> {
  const login = logins.get(loginId);
  if (!login || login.userId !== userId)
    throw new Error("Login expirado. Comece de novo.");
  const exited =
    login.process.exitCode !== null
      ? Promise.resolve()
      : new Promise<void>(resolve =>
          login.process.once("exit", () => resolve())
        );
  login.process.stdin?.write(`${code.trim()}\n`);
  login.process.stdin?.end();
  await Promise.race([exited, new Promise(r => setTimeout(r, 30_000))]);
  logins.delete(loginId);
  // O código de saída não prova nada: o estado real vem do `auth status`.
  return authStatus(userId);
}

export async function disconnect(userId: string): Promise<void> {
  for (const [id, l] of logins) if (l.userId === userId) killLogin(id);
  await rm(configDirFor(userId), { force: true, recursive: true });
}

// ---------- chat ----------
export interface ChatTool {
  description: string;
  inputSchema: unknown;
  name: string;
}

export interface ChatInput {
  callbackToken: string;
  callbackUrl: string;
  model: string;
  prompt: string;
  systemPrompt: string;
  tools: ChatTool[];
  userId: string;
}

export type ChatEvent =
  | { text: string; type: "delta" }
  | { name: string; type: "tool" }
  | { type: "done" }
  | { message: string; type: "error" };

const TURN_TIMEOUT_MS = 10 * 60_000;
const MODELS = new Set(["sonnet", "opus", "haiku"]);

// Eventos do `stream-json` do CLI: formato externo, lido só nos campos que usamos.
// biome-ignore lint/suspicious/noExplicitAny: JSON de terceiros
type Json = Record<string, any>;

/** Um turno: `claude -p` efêmero. Suas únicas ferramentas são as do Atlas, via a ponte MCP. */
export async function* chat(
  input: ChatInput,
  signal: AbortSignal
): AsyncGenerator<ChatEvent> {
  const dir = await mkdtemp(join(tmpdir(), "atlas-turn-"));
  let proc: ChildProcess | undefined;
  try {
    const bridgeConfig = join(dir, "bridge.json");
    const mcpConfig = join(dir, "mcp.json");
    const systemFile = join(dir, "system.md");
    await writeFile(
      bridgeConfig,
      JSON.stringify({
        callbackToken: input.callbackToken,
        callbackUrl: input.callbackUrl,
        tools: input.tools,
      })
    );
    await writeFile(
      mcpConfig,
      JSON.stringify({
        mcpServers: {
          atlas: { args: [BRIDGE, bridgeConfig], command: process.execPath },
        },
      })
    );
    await writeFile(systemFile, input.systemPrompt);

    const child = spawn(
      "claude",
      [
        "-p",
        "--output-format",
        "stream-json",
        "--verbose",
        "--include-partial-messages",
        "--model",
        MODELS.has(input.model) ? input.model : "sonnet",
        // Sem nenhuma ferramenta nativa (Bash, Read, Edit…): só as do Atlas, via MCP.
        "--tools",
        "",
        "--strict-mcp-config",
        "--mcp-config",
        mcpConfig,
        "--permission-mode",
        "bypassPermissions",
        "--append-system-prompt-file",
        systemFile,
      ],
      { cwd: dir, env: { ...cliEnv(input.userId), MCP_TOOL_TIMEOUT: "120000" } }
    );
    proc = child;
    const stop = () => child.exitCode === null && child.kill("SIGTERM");
    signal.addEventListener("abort", stop);
    const timer = setTimeout(stop, TURN_TIMEOUT_MS);

    let stderr = "";
    child.stderr.on("data", (c: Buffer) => {
      stderr = (stderr + c.toString()).slice(-4000);
    });
    const exited = new Promise<number | null>(resolve =>
      child.once("exit", code => resolve(code))
    );
    child.stdin.write(input.prompt);
    child.stdin.end();

    const streamed = new Set<string>();
    let messageId: string | undefined;
    let finished = false;
    let apiError: string | undefined;

    for await (const line of createInterface({ input: child.stdout })) {
      let ev: Json;
      try {
        ev = JSON.parse(line);
      } catch {
        continue;
      }
      if (ev.parent_tool_use_id) continue;

      if (ev.type === "stream_event") {
        const p = ev.event as Json | undefined;
        if (p?.type === "message_start") {
          messageId =
            p.message?.model === "<synthetic>" ? undefined : p.message?.id;
        } else if (
          p?.type === "content_block_delta" &&
          p.delta?.type === "text_delta" &&
          typeof p.delta.text === "string" &&
          messageId
        ) {
          streamed.add(messageId);
          yield { text: p.delta.text, type: "delta" };
        }
      } else if (ev.type === "assistant") {
        if (
          ev.is_api_error_message === true ||
          ev.message?.model === "<synthetic>"
        )
          continue;
        const blocks: Json[] = ev.message?.content ?? [];
        if (!(ev.message?.id && streamed.has(ev.message.id))) {
          const t = blocks.find(b => b.type === "text")?.text;
          if (t) yield { text: t, type: "delta" };
        }
        for (const b of blocks) {
          if (b.type === "tool_use")
            yield { name: String(b.name), type: "tool" };
        }
      } else if (ev.type === "result") {
        finished = true;
        if (ev.is_error === true) apiError = describeApiError(ev);
      }
    }
    const code = await exited;
    clearTimeout(timer);
    signal.removeEventListener("abort", stop);

    if (signal.aborted) return;
    if (apiError) {
      yield { message: apiError, type: "error" };
    } else if (finished) {
      yield { type: "done" };
    } else {
      const detail = redact(stderr).slice(-300);
      yield {
        message:
          `O Claude encerrou sem resposta (código ${code}). ${detail}`.trim(),
        type: "error",
      };
    }
  } finally {
    if (proc && proc.exitCode === null) proc.kill("SIGKILL");
    await rm(dir, { force: true, recursive: true }).catch(() => undefined);
  }
}

function describeApiError(ev: Json): string {
  const status = ev.api_error_status;
  if (status === 401)
    return "A conexão com o Claude expirou. Reconecte sua conta.";
  if (status === 429) {
    return "Limite de uso da sua assinatura Claude atingido. Tente de novo mais tarde.";
  }
  return `O Claude recusou o pedido${typeof status === "number" ? ` (erro ${status})` : ""}.`;
}

const redact = (s: string) => s.replace(/sk-ant-[A-Za-z0-9_-]+/g, "[removido]");
