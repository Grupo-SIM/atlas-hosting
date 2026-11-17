import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { href, Img, newTab, safeUrl } from "./helpers.js";
import type { FieldDef, RenderContext } from "./types.js";
import { flag, int, str } from "./zyrion-lib.js";

/**
 * Peças comuns dos blocos do template "Vereda Viva" (prefixo `vv`, escopo `.sb-vv`): ícones próprios em SVG,
 * leitura das configurações globais do tema (reserva, WhatsApp, contatos, mapa) e o modal de fotos, que quartos e
 * experiências compartilham. O visual vem de `renderer/pousada.ts`.
 */
export { flag, int, str };

export const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

/* ───────────────────────── ícones ───────────────────────── */

/** Traço de 24×24, desenhado para o template (nada vem de biblioteca de ícones nem do site de referência). */
const PATHS: Record<string, ReactNode> = {
  "arrow-down": <path d="M12 4v15m-6-6 6 6 6-6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  cup: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3" />
    </>
  ),
  drop: (
    <path d="M12 3c-4 4.5-6.5 8-6.5 11.2a6.5 6.5 0 0 0 13 0C18.5 11 16 7.5 12 3z" />
  ),
  flag: <path d="M5 21V4m0 0h12l-2.5 4L17 12H5" />,
  fullscreen: (
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  ),
  house: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 9.5V20h13V9.5M10 20v-6h4v6" />
    </>
  ),
  image: (
    <>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-8 8" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="m11.2 11.8 9.3-9.3M16 7l3 3M13.5 9.5l2 2" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 10.5 10 5.5 19.5 5 19 14.5 14 19.5 5 19z" />
      <path d="M5 19c3-4.5 6.5-7.5 10.5-9.5" />
    </>
  ),
  mail: (
    <>
      <rect height="15" rx="2" width="19" x="2.5" y="4.5" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  mask: (
    <>
      <path d="M3.5 4.5h10v7a5 5 0 0 1-10 0v-7z" />
      <path d="M6.5 8.5h.01M10.5 8.5h.01M6.5 12.5c1 1.2 3 1.2 4 0" />
      <path d="M13.5 9h7v5.5a4.5 4.5 0 0 1-6.6 4" />
      <path d="M16.5 12.5h.01M19 12.5h.01" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  next: <path d="m9 18 6-6-6-6" />,
  phone: (
    <path d="M21.5 16.9v2.7a1.8 1.8 0 0 1-2 1.8 17.8 17.8 0 0 1-7.7-2.7 17.5 17.5 0 0 1-5.4-5.4A17.8 17.8 0 0 1 3.7 5.5a1.8 1.8 0 0 1 1.8-2h2.7a1.8 1.8 0 0 1 1.8 1.5c.1.9.4 1.8.7 2.6a1.8 1.8 0 0 1-.4 1.9l-1.1 1.1a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.7.6 2.6.7a1.8 1.8 0 0 1 1.5 1.8z" />
  ),
  prev: <path d="m15 18-6-6 6-6" />,
  star: (
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5z" />
  ),
  tent: (
    <>
      <path d="M2.5 20 12 4l9.5 16z" />
      <path d="M12 4v16M9.3 20 12 14.5l2.7 5.5" />
    </>
  ),
};

/** Ícones que o painel oferece na linha do tempo. */
export const VV_ICON_OPTIONS = [
  { label: "Barraca", value: "tent" },
  { label: "Casa", value: "house" },
  { label: "Xícara", value: "cup" },
  { label: "Máscara", value: "mask" },
  { label: "Bandeira", value: "flag" },
  { label: "Folha", value: "leaf" },
  { label: "Gota", value: "drop" },
  { label: "Estrela", value: "star" },
];

export function VvIcon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {PATHS[name] ?? PATHS.star}
    </svg>
  );
}

/** Caminho (preenchido) do logotipo do WhatsApp. */
const WHATSAPP_PATH =
  "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.49-8.41z";

export function VvWhatsapp() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}

/** Ícone de botão: traço branco. */
export const BtnIcon = ({ name }: { name: string }) =>
  name === "whatsapp" ? <VvWhatsapp /> : <VvIcon name={name} />;

/* ───────────────────────── configurações globais (tema) ───────────────────────── */

const DIGITS = /\D/g;

export const waDigits = (ctx: RenderContext) =>
  (ctx.site.theme.whatsapp ?? "").replace(DIGITS, "");

/** Link `wa.me` com mensagem; vazio quando o tema não tem número. */
export function waLink(ctx: RenderContext, message?: string): string {
  const n = waDigits(ctx);
  if (!n) return "";
  const text =
    message ??
    (ctx.site.theme.waMessage ||
      "Olá! Gostaria de mais informações sobre a hospedagem.");
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export const RESERVE_MESSAGE = "Olá! Gostaria de fazer uma reserva.";

/**
 * URL de reserva: a do item (se houver), senão a do tema, senão o WhatsApp com a mensagem de reserva, senão a
 * seção "Venha nos visitar". Nunca devolve `#` vazio nem link morto.
 */
export function bookLink(ctx: RenderContext, override?: string): string {
  const own = (override ?? "").trim();
  if (own) return href(ctx, own);
  const global = (ctx.site.theme.bookUrl ?? "").trim();
  if (global) return href(ctx, global);
  return waLink(ctx, RESERVE_MESSAGE) || anchorHref(ctx, "#visite");
}

const norm = (s: string) => s.replace(/^\/+|\/+$/g, "");

/** Na home a âncora é local; nas outras páginas o link volta para a home. */
export function anchorHref(ctx: RenderContext, url: string): string {
  if (!url.startsWith("#")) return href(ctx, url);
  return norm(ctx.path ?? "") === "" ? url : href(ctx, `/${url}`);
}

/** `mailto:` e `tel:` só existem quando há valor. */
export const mailHref = (ctx: RenderContext) => {
  const v = (ctx.site.theme.contactEmail ?? "").trim();
  return v ? `mailto:${v}` : "";
};
export const telHref = (ctx: RenderContext) => {
  const v = (ctx.site.theme.phone ?? "").replace(/[^\d+]/g, "");
  return v ? `tel:${v}` : "";
};

/** Botão com ícone opcional; `a` de verdade (focável), nova aba quando o destino é externo. */
export function VvButton({
  className,
  href: url,
  icon,
  label,
}: {
  className: string;
  href: string;
  icon?: string;
  label: string;
}) {
  if (!label) return null;
  return (
    <a className={`vv-btn ${className}`} href={safeUrl(url)} {...newTab(url)}>
      {icon ? <BtnIcon name={icon} /> : null}
      {label}
    </a>
  );
}

export const styleVars = (v: Record<string, string | number>) =>
  v as unknown as CSSProperties;

/* ───────────────────────── modal de fotos ───────────────────────── */

export const photoItem = z.object({ image: str() });
export const photoList = z.array(photoItem).default([]).catch([]);

export const PHOTO_FIELDS: FieldDef = {
  itemFields: [{ key: "image", kind: "image", label: "Foto" }],
  key: "photos",
  kind: "list",
  label: "Álbum de fotos (o modal abre por aqui)",
};

export interface GalleryData {
  /** Id único do modal na página (usado pelo `popovertarget`). */
  id: string;
  photos: string[];
  /** URL do botão "Reservar"; `null` esconde o botão (experiências). */
  reserve: { href: string; label: string } | null;
  text: string;
  title: string;
}

export const galleryId = (prefix: string, i: number) => `vv-g-${prefix}-${i}`;

/** Capa + álbum, sem repetir a capa nem fotos vazias. */
export const albumOf = (cover: string, photos: { image: string }[]) => {
  const all = [cover, ...photos.map(p => p.image)].filter(Boolean);
  return [...new Set(all)];
};

/**
 * Modal de fotos (popover nativo: Esc e clique fora fecham, o foco volta ao botão que abriu; sem JS mostra a
 * primeira foto). O `fx-runtime` (`[data-vv-gal]`) liga as setas, as miniaturas em grupos de 4, as teclas ← → e o
 * botão de tela cheia do celular. `isStatic` = pré-visualização aberta no editor (sem popover).
 */
export function Gallery({
  data,
  isStatic,
}: {
  data: GalleryData;
  isStatic?: boolean;
}) {
  const { id, photos, reserve, text, title } = data;
  const body = (
    <div className="vv-g">
      {isStatic ? null : (
        <button
          aria-label="Fechar"
          // biome-ignore lint/a11y/noAutofocus: o foco vai para o X ao abrir o modal (o popover devolve o foco ao botão ao fechar)
          autoFocus
          className="vv-g-x"
          popoverTarget={id}
          popoverTargetAction="hide"
          type="button"
        >
          <VvIcon name="close" />
        </button>
      )}
      <div className="vv-g-media">
        <div className="vv-g-stage">
          {photos.map((src, i) => (
            <img
              alt={`${title} — foto ${i + 1}`}
              className={i === 0 ? "vv-g-slide on" : "vv-g-slide"}
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade da foto
              key={i}
              loading="lazy"
              src={src}
            />
          ))}
        </div>
        {photos.length > 1 ? (
          <>
            <button
              aria-label="Foto anterior"
              className="vv-g-arrow prev"
              type="button"
            >
              <VvIcon name="prev" />
            </button>
            <button
              aria-label="Próxima foto"
              className="vv-g-arrow next"
              type="button"
            >
              <VvIcon name="next" />
            </button>
            <div className="vv-g-thumbs">
              {photos.map((src, i) => (
                <button
                  aria-label={`Ver foto ${i + 1}`}
                  className={i === 0 ? "vv-g-thumb on" : "vv-g-thumb"}
                  data-g={Math.floor(i / 4)}
                  // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade da foto
                  key={i}
                  type="button"
                >
                  <img alt="" loading="lazy" src={src} />
                </button>
              ))}
            </div>
          </>
        ) : null}
        <button
          aria-label="Alternar tela cheia da foto"
          aria-pressed="false"
          className="vv-g-fs"
          type="button"
        >
          <VvIcon name="fullscreen" />
        </button>
      </div>
      <div className="vv-g-info">
        <h3>{title}</h3>
        {text ? <p>{text}</p> : null}
        {reserve ? (
          <a
            className="vv-btn vv-btn-blue"
            href={safeUrl(reserve.href)}
            {...newTab(reserve.href)}
          >
            {reserve.label}
          </a>
        ) : null}
      </div>
    </div>
  );
  if (isStatic)
    return (
      <div className="vv-modal is-static" data-vv-gal>
        {body}
      </div>
    );
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: o botão do cartão aponta para este id (popovertarget)
    <div
      aria-label={title}
      className="vv-modal"
      data-vv-gal
      id={id}
      popover="auto"
      role="dialog"
    >
      {body}
    </div>
  );
}

export { Img };
