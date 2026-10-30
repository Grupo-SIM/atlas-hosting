import { isYouTubeChannelId } from "@repo/site-builder";

const HANDLE = /^[\w.-]{3,30}$/;
const LEGACY_NAME = /^[\w.-]{1,100}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);
const FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=";
const TIMEOUT_MS = 8000;

export type ChannelTarget =
  | { id: string; kind: "id" }
  | { kind: "page"; path: string }
  | { error: string; kind: "error" };

const VIDEO_PATHS = new Set(["watch", "shorts", "live", "embed", "playlist"]);

/** Entende o que a pessoa colou: ID `UC…`, `@usuario` ou um link de canal do YouTube. */
export function parseChannelInput(raw: string): ChannelTarget {
  const value = raw.trim();
  if (isYouTubeChannelId(value)) return { id: value, kind: "id" };
  if (/^@/.test(value) && HANDLE.test(value.slice(1)))
    return { kind: "page", path: `/${value}` };

  let url: URL | null = null;
  try {
    if (/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}\//i.test(value))
      url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    url = null;
  }
  if (!url) {
    return HANDLE.test(value)
      ? { kind: "page", path: `/@${value}` }
      : {
          error: "Cole o link do canal, o @usuario ou o ID (UC…).",
          kind: "error",
        };
  }
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase()))
    return {
      error: "O link precisa ser de um canal do YouTube.",
      kind: "error",
    };

  const [first, second] = url.pathname.split("/").filter(Boolean);
  if (first === "channel" && second && isYouTubeChannelId(second))
    return { id: second, kind: "id" };
  if (first?.startsWith("@") && HANDLE.test(first.slice(1)))
    return { kind: "page", path: `/${first}` };
  if ((first === "c" || first === "user") && second && LEGACY_NAME.test(second))
    return { kind: "page", path: `/${first}/${second}` };
  if (first && VIDEO_PATHS.has(first))
    return {
      error:
        "Esse é o link de um vídeo. Cole o link do canal (youtube.com/@nome).",
      kind: "error",
    };
  return { error: "Não reconheci esse link de canal.", kind: "error" };
}

const decodeEntities = (s: string) =>
  s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");

async function youtubeGet(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      "accept-language": "pt-BR,pt;q=0.9",
      cookie: "SOCS=CAI",
      "user-agent": "Mozilla/5.0 (compatible; AtlasSiteBuilder/1.0)",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const host = new URL(res.url).hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) throw new Error("redirect fora do YouTube");
  return res;
}

const NOT_FOUND = "Não achei esse canal. Confira o link e tente de novo.";
const UNAVAILABLE =
  "Não consegui falar com o YouTube agora. Tente de novo ou cole o ID do canal (UC…).";

/** Confere o canal e devolve ID e nome. Lança `Error` com mensagem em português para mostrar na tela. */
export async function resolveYoutubeChannel(
  raw: string
): Promise<{ id: string; name: string }> {
  const target = parseChannelInput(raw);
  if (target.kind === "error") throw new Error(target.error);

  try {
    let id: string;
    if (target.kind === "id") {
      id = target.id;
    } else {
      const page = await youtubeGet(`https://www.youtube.com${target.path}`);
      if (!page.ok) throw new Error(NOT_FOUND);
      const html = await page.text();
      const found =
        /"externalId":"(UC[\w-]{22})"/.exec(html)?.[1] ??
        /itemprop="(?:channelId|identifier)"\s+content="(UC[\w-]{22})"/.exec(
          html
        )?.[1] ??
        /youtube\.com\/channel\/(UC[\w-]{22})/.exec(html)?.[1];
      if (!found) throw new Error(NOT_FOUND);
      id = found;
    }

    const feed = await youtubeGet(`${FEED}${id}`);
    if (feed.status === 404 || feed.status === 400) throw new Error(NOT_FOUND);
    if (!feed.ok) throw new Error(UNAVAILABLE);
    const title = /<title>([^<]*)<\/title>/.exec(await feed.text())?.[1];
    return { id, name: title ? decodeEntities(title).trim() : "" };
  } catch (error) {
    if (
      error instanceof Error &&
      [NOT_FOUND, UNAVAILABLE].includes(error.message)
    )
      throw error;
    console.error("Erro ao buscar canal do YouTube:", error);
    throw new Error(UNAVAILABLE);
  }
}
