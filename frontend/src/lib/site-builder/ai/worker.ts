/**
 * Cliente do `claude-worker` (services/claude-worker): o serviço que guarda o login Claude de cada
 * usuário (assinatura dele, nunca chave de API do Atlas) e roda o Claude Code por turno.
 *
 * Variáveis de ambiente:
 * - CLAUDE_WORKER_URL: ex. `http://claude-worker:3000`. Sem ela a aba IA mostra "indisponível".
 * - CLAUDE_WORKER_TOKEN: segredo compartilhado com o worker (cabeçalho `x-worker-token`).
 * - ATLAS_AI_CALLBACK_URL: como o WORKER enxerga este app (padrão `http://frontend:3000`).
 */

export interface AiAccountStatus {
  connected: boolean;
  email?: string;
  plan?: string;
}

export interface WorkerChatInput {
  callbackToken: string;
  callbackUrl: string;
  model: string;
  prompt: string;
  systemPrompt: string;
  tools: { description: string; inputSchema: unknown; name: string }[];
  userId: string;
}

export type WorkerEvent =
  | { text: string; type: "delta" }
  | { name: string; type: "tool" }
  | { type: "done" }
  | { message: string; type: "error" };

export const isWorkerConfigured = () =>
  Boolean(
    process.env.CLAUDE_WORKER_URL?.trim() &&
      process.env.CLAUDE_WORKER_TOKEN?.trim()
  );

export const callbackBaseUrl = () =>
  (process.env.ATLAS_AI_CALLBACK_URL?.trim() || "http://frontend:3000").replace(
    /\/+$/,
    ""
  );

function request(path: string, init: RequestInit = {}, timeoutMs = 30_000) {
  const base = process.env.CLAUDE_WORKER_URL?.trim().replace(/\/+$/, "");
  const token = process.env.CLAUDE_WORKER_TOKEN?.trim();
  if (!(base && token))
    throw new Error("A Atlas IA não está configurada neste servidor.");
  return fetch(`${base}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "x-worker-token": token,
      ...init.headers,
    },
    signal: init.signal ?? AbortSignal.timeout(timeoutMs),
  });
}

async function json<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok)
    throw new Error(body.error || `Falha ${res.status} no servidor da IA.`);
  return body;
}

const enc = encodeURIComponent;

export const workerStatus = async (userId: string) =>
  json<AiAccountStatus>(await request(`/accounts/${enc(userId)}/status`));

export const workerStartLogin = async (userId: string) =>
  json<{ loginId: string; url: string }>(
    await request(
      `/accounts/${enc(userId)}/auth/start`,
      { method: "POST" },
      40_000
    )
  );

export const workerFinishLogin = async (
  userId: string,
  loginId: string,
  code: string
) =>
  json<AiAccountStatus>(
    await request(
      `/accounts/${enc(userId)}/auth/finish`,
      { body: JSON.stringify({ code, loginId }), method: "POST" },
      60_000
    )
  );

export const workerDisconnect = async (userId: string) =>
  json<{ ok: true }>(
    await request(`/accounts/${enc(userId)}`, { method: "DELETE" })
  );

/** Abre o turno de chat e devolve os eventos (NDJSON) conforme chegam. */
export async function* workerChat(
  input: WorkerChatInput,
  signal: AbortSignal
): AsyncGenerator<WorkerEvent> {
  const res = await request(
    "/chat",
    { body: JSON.stringify(input), method: "POST", signal },
    11 * 60_000
  );
  if (!(res.ok && res.body))
    throw new Error(`Falha ${res.status} no servidor da IA.`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    let at = buffer.indexOf("\n");
    while (at >= 0) {
      const line = buffer.slice(0, at).trim();
      buffer = buffer.slice(at + 1);
      if (line) {
        try {
          yield JSON.parse(line) as WorkerEvent;
        } catch {
          // linha quebrada: ignora
        }
      }
      at = buffer.indexOf("\n");
    }
  }
}
