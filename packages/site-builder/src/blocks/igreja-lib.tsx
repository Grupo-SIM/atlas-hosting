import type { ReactNode } from "react";
import { href, Img, newTab, safeUrl } from "./helpers.js";
import { VvWhatsapp } from "./pousada-lib.js";
import type { RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";
import { flag, int, str } from "./zyrion-lib.js";

/**
 * Peças comuns dos blocos do template "Comunidade Viva" (prefixo `cv`, escopo `.sb-cv`): ícones próprios em SVG,
 * leitura das configurações globais do tema (nome, vídeo, podcast, app, contatos, endereço), vídeo em popup, selos de
 * app (só com URL) e as abas sem JS (rádio + `:checked`) que a agenda e a localização compartilham. O visual vem de
 * `renderer/igreja.ts`.
 */
export { flag, Img, int, str, VvWhatsapp };

export const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

/* ───────────────────────── configurações globais (tema) ───────────────────────── */

export type GlobalKey =
  | "address"
  | "appStoreUrl"
  | "churchName"
  | "contactEmail"
  | "leaderName"
  | "phone"
  | "playStoreUrl"
  | "podcastUrl"
  | "showApp"
  | "welcomeVideo"
  | "whatsapp";

/** Configuração global do tema (vazia quando não existe); `fallback` vale só para chave ausente. */
export const th = (ctx: RenderContext, key: GlobalKey, fallback = "") => {
  const all: Record<GlobalKey, string | undefined> = {
    address: ctx.site.theme.address,
    appStoreUrl: ctx.site.theme.appStoreUrl,
    churchName: ctx.site.theme.churchName,
    contactEmail: ctx.site.theme.contactEmail,
    leaderName: ctx.site.theme.leaderName,
    phone: ctx.site.theme.phone,
    playStoreUrl: ctx.site.theme.playStoreUrl,
    podcastUrl: ctx.site.theme.podcastUrl,
    showApp: ctx.site.theme.showApp,
    welcomeVideo: ctx.site.theme.welcomeVideo,
    whatsapp: ctx.site.theme.whatsapp,
  };
  return (all[key] ?? fallback).trim();
};

const norm = (s: string) => s.replace(/^\/+|\/+$/g, "");

/** Segmento da rota atual (`""` = home). */
export const slugOf = (ctx: RenderContext) => norm(ctx.path ?? "");
export const isHome = (ctx: RenderContext) => slugOf(ctx) === "";

export const churchName = (ctx: RenderContext) =>
  th(ctx, "churchName") || ctx.site.name;

/** Link do Google Maps (busca por endereço): "Como chegar" e o endereço do rodapé. */
export const mapsLink = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** `wa.me` com mensagem; `number` (do item) vale mais que o do tema; vazio sem número. */
export function waHref(
  ctx: RenderContext,
  message: string,
  number?: string
): string {
  const digits = (number || th(ctx, "whatsapp")).replace(/\D/g, "");
  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : "";
}

export const mailTo = (ctx: RenderContext) => {
  const v = th(ctx, "contactEmail");
  return v ? `mailto:${v}` : "";
};
export const telTo = (ctx: RenderContext) => {
  const v = th(ctx, "phone").replace(/[^\d+]/g, "");
  return v ? `tel:${v}` : "";
};

/** Texto separado por vírgula ou quebra de linha → lista sem vazios. */
export const splitList = (s: string) =>
  s
    .split(/[,\n]/)
    .map(x => x.trim())
    .filter(Boolean);

/* ───────────────────────── ícones ───────────────────────── */

export const PlayIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M6 3l14 9-14 9z" />
  </svg>
);

export const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

/** Envelope de linha (rodapé). */
export const MailIcon = () => (
  <svg aria-hidden="true" className="cv-foot-ic" viewBox="0 0 24 24">
    <rect height="15" rx="2" width="19" x="2.5" y="4.5" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

/** Cartão de endereço / pino de mapa de linha (rodapé). */
export const PinIcon = () => (
  <svg aria-hidden="true" className="cv-foot-ic" viewBox="0 0 24 24">
    <path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);

/** Podcast genérico (microfone com ondas), no círculo "Escute agora". */
export const PodcastIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 14.5a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5.5a3 3 0 0 0 3 3z" />
    <path
      d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4m-3 0h6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  </svg>
);

/** Fones de ouvido de traço fino (92px), ao lado do "Escute agora". */
export const HeadphonesIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
    <rect height="6" rx="1.5" width="3.5" x="3" y="14" />
    <rect height="6" rx="1.5" width="3.5" x="17.5" y="14" />
  </svg>
);

export const StarIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5z" />
  </svg>
);

/* ───────────────────────── vídeo em popup ───────────────────────── */

/** Miniatura com botão de play e halo pulsante; abre o vídeo em popup (`data-sb-video`, ligado no `nav-runtime`). */
export function VideoThumb({
  image,
  label,
  url,
}: {
  image?: string;
  label: string;
  url: string;
}) {
  if (!url) return null;
  const embed = popupVideoEmbed(url);
  return (
    <a
      aria-label={label}
      className="cv-vid"
      data-sb-video={embed ?? undefined}
      href={safeUrl(url)}
      {...newTab(url)}
    >
      <div className="cv-vid-img">
        <Img src={image} />
      </div>
      <span className="cv-play">
        <PlayIcon />
      </span>
    </a>
  );
}

/* ───────────────────────── selos de app (só com URL) ───────────────────────── */

export function storeUrls(ctx: RenderContext) {
  if (th(ctx, "showApp", "yes") === "no") return { apple: "", google: "" };
  return { apple: th(ctx, "appStoreUrl"), google: th(ctx, "playStoreUrl") };
}

export const hasStores = (ctx: RenderContext) => {
  const s = storeUrls(ctx);
  return Boolean(s.apple || s.google);
};

/** Selos genéricos 133 × 40 (só texto e um glifo; as artes oficiais das lojas ficam por conta do cliente). */
export function Stores({ ctx }: { ctx: RenderContext }) {
  const { apple, google } = storeUrls(ctx);
  if (!apple && !google) return null;
  return (
    <div className="cv-app-s">
      {apple ? (
        <a
          aria-label="Baixar na App Store"
          className="cv-store"
          href={safeUrl(apple)}
          {...newTab(apple)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3-.8s1.8.8 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.8zM14.2 5.8c.6-.8 1.1-1.9.9-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.5 2.8-1.3z" />
          </svg>
          <span>
            <small>Baixar na</small>
            <b>App Store</b>
          </span>
        </a>
      ) : null}
      {google ? (
        <a
          aria-label="Disponível no Google Play"
          className="cv-store"
          href={safeUrl(google)}
          {...newTab(google)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 2.5v19l10-9.5L4 2.5zm11.2 8.4 2.9-1.7c1-.6 1-1.8 0-2.4L6.2 2.2l9 8.7zM6.2 21.8l11.9-7c1-.6 1-1.8 0-2.4l-2.9-1.7-9 8.7z" />
          </svg>
          <span>
            <small>Disponível no</small>
            <b>Google Play</b>
          </span>
        </a>
      ) : null}
    </div>
  );
}

/* ───────────────────────── abas sem JS ───────────────────────── */

/**
 * Abas por rádio + `:checked` (sem JS: o CSS mostra o painel e marca a aba; as setas ← → do teclado trocam de
 * rádio). ARIA: `tablist`/`tab`/`tabpanel`; o `fx-runtime` (`[data-cv-tabs]`) só mantém o `aria-selected`.
 * `cls` = `cv-tab` (agenda) ou `cv-lt` (localização); `max` abas no CSS (10 e 6).
 */
export function Tabs({
  cls,
  id,
  label,
  panels,
  tabs,
}: {
  cls: "cv-lt" | "cv-tab";
  id: string;
  label: string;
  panels: ReactNode[];
  tabs: string[];
}) {
  return (
    <div data-cv-tabs>
      {tabs.map((t, i) => (
        <input
          aria-label={t}
          className={`${cls}-r`}
          defaultChecked={i === 0}
          id={`${id}-r${i}`}
          key={`${id}-r${t}`}
          name={id}
          type="radio"
        />
      ))}
      <div aria-label={label} className={`${cls}-bar`} role="tablist">
        {tabs.map((t, i) => (
          // biome-ignore lint/a11y/useFocusableInteractive: o foco fica no rádio; o rótulo dentro da aba o aciona
          <div
            aria-controls={`${id}-p${i}`}
            aria-selected={i === 0 ? "true" : "false"}
            className={`${cls}-t`}
            id={`${id}-t${i}`}
            key={`${id}-t${t}`}
            role="tab"
          >
            <label htmlFor={`${id}-r${i}`}>{t}</label>
          </div>
        ))}
      </div>
      <div className={`${cls}-panels`}>
        {panels.map((p, i) => (
          <div
            aria-labelledby={`${id}-t${i}`}
            className={`${cls}-p`}
            id={`${id}-p${i}`}
            key={`${id}-p${tabs[i] ?? i}`}
            role="tabpanel"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

export { href };
