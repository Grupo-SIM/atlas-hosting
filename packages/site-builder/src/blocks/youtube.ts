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
