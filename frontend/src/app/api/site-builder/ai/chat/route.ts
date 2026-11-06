import { randomUUID } from "node:crypto";
import {
  AI_TOOLS,
  type AiContext,
  buildAiSystemPrompt,
  siteSchema,
} from "@repo/site-builder";
import { getBuilderUser } from "@/lib/site-builder/access";
import { turns } from "@/lib/site-builder/ai/turns";
import {
  callbackBaseUrl,
  isWorkerConfigured,
  workerChat,
} from "@/lib/site-builder/ai/worker";

export const dynamic = "force-dynamic";
export const maxDuration = 600;

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 6000;

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

/** Histórico como texto: o `claude -p` recebe um turno só, então a conversa vai no prompt. */
function buildPrompt(messages: ChatMessage[]): string {
  const recent = messages.slice(-MAX_MESSAGES).map(m => ({
    role: m.role,
    text: m.text.slice(0, MAX_MESSAGE_CHARS),
  }));
  const last = recent.pop();
  const history = recent
    .map(m => `${m.role === "user" ? "Usuário" : "Atlas IA"}: ${m.text}`)
    .join("\n\n");
  return history
    ? `Conversa até agora:\n\n${history}\n\n---\nNova mensagem do usuário:\n${last?.text ?? ""}`
    : (last?.text ?? "");
}

function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: ChatMessage[] = [];
  for (const m of raw) {
    const item = m as Partial<ChatMessage>;
    if (
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.text !== "string"
    ) {
      return null;
    }
    out.push({ role: item.role, text: item.text });
  }
  return out.at(-1)?.role === "user" && out.at(-1)?.text.trim() ? out : null;
}

/** Nome sem o prefixo `mcp__atlas__` que o Claude Code põe nas ferramentas MCP. */
const toolName = (name: string) => name.replace(/^mcp__atlas__/, "");

const READ_TOOLS = new Set([
  "ver_site",
  "ver_blocos",
  "ver_bloco",
  "tipos_de_bloco",
]);

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof getBuilderUser>>;
  try {
    user = await getBuilderUser();
  } catch {
    return Response.json({ error: "Sessão expirada." }, { status: 401 });
  }
  if (!user) return Response.json({ error: "Sem permissão." }, { status: 403 });
  if (!isWorkerConfigured()) {
    return Response.json(
      { error: "A Atlas IA não está configurada neste servidor." },
      { status: 503 }
    );
  }

  let body: {
    context?: Partial<AiContext>;
    messages?: unknown;
    site?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const messages = parseMessages(body.messages);
  const site = siteSchema.safeParse(body.site);
  if (!(messages && site.success)) {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const turnId = randomUUID();
  const token = randomUUID() + randomUUID();
  const encoder = new TextEncoder();
  const context = body.context ?? {};

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // navegador já foi embora
        }
      };
      turns.set(turnId, {
        chain: Promise.resolve(),
        emit: send,
        site: site.data,
        token,
        userId: user.id,
      });
      try {
        for await (const event of workerChat(
          {
            callbackToken: token,
            callbackUrl: `${callbackBaseUrl()}/api/site-builder/ai/tool/${turnId}`,
            model: "sonnet",
            prompt: buildPrompt(messages),
            systemPrompt: buildAiSystemPrompt({
              currentRoot: context.currentRoot,
              currentTitle: context.currentTitle,
              selected: context.selected,
              siteName: site.data.name,
            }),
            tools: AI_TOOLS.map(t => ({
              description: t.description,
              inputSchema: t.inputSchema,
              name: t.name,
            })),
            userId: user.id,
          },
          request.signal
        )) {
          if (event.type === "tool") {
            const name = toolName(event.name);
            send({ reading: READ_TOOLS.has(name), type: "tool" });
          } else {
            send(event);
          }
        }
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("[Atlas IA] falha no chat", error);
          send({
            message:
              "Não consegui falar com a Atlas IA agora. Tente de novo em instantes.",
            type: "error",
          });
        }
      } finally {
        // Espera ferramentas ainda em andamento terminarem de avisar o navegador.
        await turns.get(turnId)?.chain.catch(() => undefined);
        turns.delete(turnId);
        try {
          controller.close();
        } catch {
          // já fechado
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/x-ndjson",
    },
  });
}
