import { z } from "zod";
import { defineBlock } from "./define.js";
import { href } from "./helpers.js";
import type { FieldDef, RenderContext } from "./types.js";

const str = (d = "") => z.string().default(d);

/** Anúncios só aparecem quando o botão "Anúncios" do editor (`theme.ads`) está ligado. */
export const adsEnabled = (ctx: RenderContext) => ctx.site.theme.ads === "on";

const VIDEO_URL = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
export const isVideoUrl = (url: string) => VIDEO_URL.test(url);

export const adItemSchema = z.object({ src: str() });
export const adItemsSchema = z.array(adItemSchema).default([]);

export const adItemFields: FieldDef[] = [
  { key: "src", kind: "media", label: "Imagem ou vídeo" },
];

export interface AdConfig {
  items: { src: string }[];
  link: string;
  seconds: number;
}

const adConfigSchema = z
  .object({
    items: adItemsSchema,
    link: str(),
    seconds: z.coerce.number().min(2).max(60).default(6).catch(6),
  })
  .catch({ items: [], link: "", seconds: 6 });

/** Anúncios do site inteiro (`theme.adsConfig`, JSON): valem para todo espaço que não tem mídia própria. */
export function globalAds(theme: Record<string, string>): {
  banner: AdConfig;
  side: AdConfig;
} {
  let raw: unknown = {};
  try {
    raw = JSON.parse(theme.adsConfig || "{}");
  } catch {
    raw = {};
  }
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    banner: adConfigSchema.parse(obj.banner),
    side: adConfigSchema.parse(obj.side),
  };
}

/** A página já tem um bloco de anúncio (em qualquer nível)? */
export function hasAdSlot(
  blocks: { children?: unknown[]; type: string }[]
): boolean {
  return blocks.some(
    b =>
      b.type === "adSlot" ||
      hasAdSlot((b.children ?? []) as { children?: unknown[]; type: string }[])
  );
}

const SAFE_SRC = /^(https?:\/\/|\/)/i;

/**
 * Caixa de anúncio: imagens e vídeos que passam sozinhos, sem nenhum botão. A rotação é feita pelo
 * script dos efeitos (`fx-runtime.ts`); sem JS fica parado no primeiro item.
 * Sem itens: some no site; no editor mostra um espaço reservado.
 */
export function AdBox({
  ctx,
  items,
  label,
  link,
  seconds,
  size,
}: {
  ctx: RenderContext;
  items: { src: string }[];
  label: string;
  link: string;
  seconds: number;
  size: "banner" | "side" | "square";
}) {
  if (!adsEnabled(ctx)) {
    // No editor, explica por que o espaço está vazio; no site publicado, não ocupa lugar.
    return ctx.mode === "edit" ? (
      <div className={`sb-ad sb-ad-${size}`}>
        <div className="sb-ad-box">
          <div className="sb-ad-ph">
            Anúncios desligados — ligue o botão "Anúncios" no topo do editor
            para mostrar este espaço
          </div>
        </div>
      </div>
    ) : null;
  }
  // Sem mídia própria, usa a do site inteiro (faixa larga = banner; lateral e quadrado = coluna).
  const own = items.filter(i => SAFE_SRC.test(i.src));
  const shared = globalAds(ctx.site.theme)[
    size === "banner" ? "banner" : "side"
  ];
  const useOwn = own.length > 0;
  const media = (useOwn ? own : shared.items).filter(i => SAFE_SRC.test(i.src));
  const linkUrl = useOwn ? link : shared.link;
  const secs = useOwn ? seconds : shared.seconds;
  if (media.length === 0 && ctx.mode !== "edit") return null;

  const inner =
    media.length === 0 ? (
      <div className="sb-ad-ph">
        Espaço publicitário {size === "banner" ? 1 : 2} — envie a mídia em Tema
        → Anúncios (vale para todos os espaços {size === "banner" ? "1" : "2"})
      </div>
    ) : (
      media.map((item, i) =>
        isVideoUrl(item.src) ? (
          <video
            autoPlay
            className={i === 0 ? "sb-ad-item on" : "sb-ad-item"}
            key={item.src}
            loop={media.length === 1}
            muted
            playsInline
            preload="metadata"
            src={item.src}
          />
        ) : (
          <img
            alt=""
            className={i === 0 ? "sb-ad-item on" : "sb-ad-item"}
            key={item.src}
            loading="lazy"
            src={item.src}
          />
        )
      )
    );

  const box = <div className="sb-ad-box">{inner}</div>;
  return (
    <div
      className={`sb-ad sb-ad-${size}`}
      data-ads=""
      data-sec={Math.max(2, secs)}
    >
      {label ? <span className="sb-ad-label">{label}</span> : null}
      {linkUrl ? (
        <a
          href={href(ctx, linkUrl)}
          rel="noopener sponsored"
          target={/^https?:/i.test(linkUrl) ? "_blank" : undefined}
        >
          {box}
        </a>
      ) : (
        box
      )}
    </div>
  );
}

const SIZE_OPTIONS = [
  { label: "Faixa larga (banner)", value: "banner" },
  { label: "Coluna alta (lateral)", value: "side" },
  { label: "Quadrado", value: "square" },
];

const adSlot = defineBlock(
  z.object({
    items: adItemsSchema,
    label: str("Publicidade"),
    link: str(),
    seconds: z.coerce.number().min(2).max(60).default(6).catch(6),
    size: z
      .enum(["banner", "side", "square"])
      .default("banner")
      .catch("banner"),
  }),
  {
    fields: [
      { key: "size", kind: "select", label: "Formato", options: SIZE_OPTIONS },
      {
        itemFields: adItemFields,
        key: "items",
        kind: "list",
        label:
          "Mídia só deste espaço (vazio = usa o Espaço publicitário 1 se for faixa, ou o 2 se for lateral/quadrado; igual em todo o site)",
      },
      {
        key: "seconds",
        kind: "number",
        label: "Segundos por imagem (vídeo passa até o fim)",
      },
      { key: "link", kind: "url", label: "Link ao clicar no anúncio" },
      { key: "label", kind: "text", label: "Rótulo (vazio = sem rótulo)" },
    ],
    group: "media",
    label: "Anúncio (imagem/vídeo)",
    render: (p, ctx) => (
      <div className="sb-container sb-ad-wrap">
        <AdBox
          ctx={ctx}
          items={p.items}
          label={p.label}
          link={p.link}
          seconds={p.seconds}
          size={p.size}
        />
      </div>
    ),
    type: "adSlot",
  }
);

export const adBlocks = [adSlot];
