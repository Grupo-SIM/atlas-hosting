/** Um canal já conferido no YouTube: o ID `UC…` é o que o player usa, o nome é só para mostrar. */
export interface YouTubeChannel {
  id: string;
  /** O que a pessoa digitou (link, @usuario ou ID). */
  input: string;
  name: string;
}

const CHANNEL_ID = /^UC[\w-]{22}$/;
const VIDEO_ID = /^[\w-]{11}$/;
const VIDEO_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export const isYouTubeChannelId = (value: string): boolean =>
  CHANNEL_ID.test(value);

/** Aceita o ID (11 caracteres) ou qualquer link de vídeo: watch, youtu.be, shorts, embed, live. */
export function parseYouTubeVideoId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID.test(value)) return value;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be" || host === "www.youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (VIDEO_HOSTS.has(host)) {
    const [kind, second] = url.pathname.split("/").filter(Boolean);
    id =
      kind === "watch"
        ? url.searchParams.get("v")
        : kind && ["embed", "live", "shorts", "v"].includes(kind)
          ? (second ?? null)
          : null;
  }
  return id && VIDEO_ID.test(id) ? id : null;
}

const PLAYER = "https://www.youtube-nocookie.com/embed";

/**
 * Último vídeo do canal sem chave de API: a playlist de uploads (`UU…`) lista o mais novo primeiro,
 * então o player abre sempre no último vídeo publicado — mesmo no site estático.
 */
export const latestVideoEmbed = (channelId: string): string | null =>
  isYouTubeChannelId(channelId)
    ? `${PLAYER}/videoseries?list=UU${channelId.slice(2)}`
    : null;

export const videoEmbed = (input: string): string | null => {
  const id = parseYouTubeVideoId(input);
  return id ? `${PLAYER}/${id}` : null;
};

const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const VIMEO_PLAYER = "https://player.vimeo.com/video";

/** Link do Vimeo (`vimeo.com/ID`, `vimeo.com/ID/HASH`, `player.vimeo.com/video/ID?h=…`) → player. */
export function vimeoEmbed(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (!VIMEO_HOSTS.has(url.hostname.toLowerCase())) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const at = parts.findIndex(s => /^\d{6,12}$/.test(s));
  if (at < 0) return null;
  const hash = url.searchParams.get("h") ?? parts[at + 1] ?? "";
  return `${VIMEO_PLAYER}/${parts[at]}${/^[0-9a-f]{6,20}$/.test(hash) ? `?h=${hash}` : ""}`;
}

/** Player para abrir num popup: YouTube (sem cookies) ou Vimeo; qualquer outro link fica só como link. */
export const popupVideoEmbed = (input: string): string | null =>
  input.trim() ? (videoEmbed(input) ?? vimeoEmbed(input)) : null;

/**
 * Player para incorporar na página (`iframe`): como `popupVideoEmbed`, mas o Vimeo sai sem título, autor nem
 * pausa automática (`autopause=0&title=0&portrait=0&byline=0`), como o widget de vídeo do Elementor.
 */
export function inlineVideoEmbed(input: string): string | null {
  const embed = popupVideoEmbed(input);
  if (!embed?.startsWith("https://player.vimeo.com")) return embed;
  return `${embed}${embed.includes("?") ? "&" : "?"}autopause=0&title=0&portrait=0&byline=0`;
}
