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

/**
 * Player de vídeo de fundo (como o "vídeo de fundo" do Elementor): mudo, em laço, sem controles e sem cookies.
 * `loop=1` só funciona no YouTube com `playlist=<mesmo id>`.
 */
export function backgroundVideoEmbed(input: string): string | null {
  const id = parseYouTubeVideoId(input);
  return id
    ? `${PLAYER}/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&rel=0`
    : null;
}

/** Mídia de um campo de imagem: arquivo de vídeo, ou link de rede social/YouTube/Vimeo que vira player. */
export type MediaSource =
  | { kind: "file"; src: string }
  | { kind: "embed"; ratio: string; src: string; title: string };

const VIDEO_FILE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
export const isVideoFile = (url: string) => VIDEO_FILE.test(url.trim());

const hostOf = (u: URL) =>
  u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, "");

/**
 * Reconhece o que não é imagem num campo de imagem: vídeo enviado (`.mp4`…), YouTube, Vimeo, Instagram
 * (post, reel, tv), TikTok, Facebook (vídeo, reel, `fb.watch`) e X/Twitter. Imagem comum devolve `null`.
 */
export function parseMediaSource(input: string): MediaSource | null {
  const value = input.trim();
  if (!value) return null;
  if (isVideoFile(value)) return { kind: "file", src: value };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  const h = hostOf(url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (h === "instagram.com" || h === "instagr.am") {
    // /p/ID, /reel/ID, /tv/ID e /usuario/p/ID
    const at = parts.findIndex(s => ["p", "reel", "reels", "tv"].includes(s));
    const id = at >= 0 ? parts[at + 1] : undefined;
    if (!id) return null;
    const kind = parts[at] === "reels" ? "reel" : parts[at];
    return {
      kind: "embed",
      ratio: kind === "p" ? "4/5" : "9/16",
      src: `https://www.instagram.com/${kind}/${encodeURIComponent(id)}/embed/`,
      title: "Instagram",
    };
  }
  if (h === "tiktok.com") {
    const at = parts.indexOf("video");
    const id = at >= 0 ? parts[at + 1] : undefined;
    if (!(id && /^\d+$/.test(id))) return null;
    return {
      kind: "embed",
      ratio: "9/16",
      src: `https://www.tiktok.com/embed/v2/${id}`,
      title: "TikTok",
    };
  }
  if (h === "facebook.com" || h === "fb.watch" || h === "fb.com") {
    const isVideo =
      h === "fb.watch" ||
      url.searchParams.has("v") ||
      parts.some(s => ["videos", "reel", "watch", "share"].includes(s));
    if (!isVideo) return null;
    return {
      kind: "embed",
      ratio: "16/9",
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(value)}&show_text=false`,
      title: "Facebook",
    };
  }
  if (h === "x.com" || h === "twitter.com") {
    const at = parts.indexOf("status");
    const id = at >= 0 ? parts[at + 1] : undefined;
    if (!(id && /^\d+$/.test(id))) return null;
    return {
      kind: "embed",
      ratio: "4/5",
      src: `https://platform.twitter.com/embed/Tweet.html?id=${id}`,
      title: "X",
    };
  }
  const player = inlineVideoEmbed(value);
  if (player)
    return {
      kind: "embed",
      ratio: url.pathname.startsWith("/shorts/") ? "9/16" : "16/9",
      src: player,
      title: player.includes("vimeo") ? "Vimeo" : "YouTube",
    };
  return null;
}
