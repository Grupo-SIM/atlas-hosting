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
const MAX_IMAGES = 4;
/** ~5 MB de arquivo em base64. */
const MAX_IMAGE_BASE64 = 7_000_000;
const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

interface ChatImage {
  data: string;
  mediaType: string;
  url?: string;
}

function parseImages(raw: unknown): ChatImage[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > MAX_IMAGES) return null;
  const out: ChatImage[] = [];
  for (const item of raw) {
    const img = item as Partial<ChatImage>;
    if (
      typeof img.data !== "string" ||
      img.data.length > MAX_IMAGE_BASE64 ||
      !/^[A-Za-z0-9+/=]+$/.test(img.data) ||
      typeof img.mediaType !== "string" ||
      !IMAGE_TYPES.has(img.mediaType)
    ) {
      return null;
    }
    out.push({
      data: img.data,
      mediaType: img.mediaType,
      url:
        typeof img.url === "string" && img.url.length < 500
          ? img.url
          : undefined,
    });
  }
  return out;
}

/** Diz à IA onde cada imagem anexada foi guardada, para ela poder usá-la nos campos de imagem. */
function imageNote(images: ChatImage[]): string {
  if (images.length === 0) return "";
  const urls = images
    .map((img, i) => (img.url ? `Imagem ${i + 1}: ${img.url}` : ""))
    .filter(Boolean);
  const count = `${images.length} imagem(ns)`;
  const note = urls.length
    ? `O usuário anexou ${count}. As URLs abaixo já estão no site e podem ser usadas em campos de imagem (src, backgroundImage, logo…):\n${urls.join("\n")}`
    : `O usuário anexou ${count} só para você ver; elas não têm URL no site.`;
  return `\n\n[${note}]`;
}

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
    images?: unknown;
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
  const images = parseImages(body.images);
  if (!(messages && images && site.success)) {
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
            images: images.map(({ data, mediaType }) => ({ data, mediaType })),
            model: "sonnet",
            prompt: buildPrompt(messages) + imageNote(images),
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
