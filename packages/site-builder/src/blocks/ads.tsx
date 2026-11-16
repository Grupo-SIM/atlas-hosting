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

/** Espaços publicitários do site: 1 = faixas do topo, 2/3/4 = anúncios empilhados na coluna lateral. */
export const AD_KEYS = ["banner", "side", "side2", "side3"] as const;
export type AdKey = (typeof AD_KEYS)[number];
/**
 * Quantos anúncios a coluna lateral mostra. No portal é uma escolha do site inteiro (`theme.adsSide`),
 * para valer igual em todas as páginas; nos outros temas, a do bloco.
 */
export const sideAdCount = (
  theme: Record<string, string>,
  own: string | number
): 1 | 2 | 3 => {
  const raw = theme.variant === "portal" ? (theme.adsSide ?? "1") : String(own);
  return raw === "3" ? 3 : raw === "2" ? 2 : 1;
};

export const SIDE_COUNT_OPTIONS = [
  { label: "1 anúncio na lateral direita", value: "1" },
  { label: "2 anúncios na lateral direita", value: "2" },
  { label: "3 anúncios na lateral direita", value: "3" },
];

export type AdSize = "banner" | "side" | "square";

/** Tamanho ideal de uma mídia de anúncio e de onde vem. As proporções espelham o CSS (`renderer/styles.ts` e variantes). */
export interface AdSpec {
  h: number;
  /** Frase curta sobre o que faz o tamanho mudar (quantidade de anúncios na coluna, tema). */
  note?: string;
  size: AdSize;
  w: number;
}

/**
 * Tamanho ideal da imagem de um espaço de anúncio, em pixels. A faixa larga é 970×150 (Holofote e Zyrion usam
 * 728×90); o quadrado é 300×250; a coluna lateral **muda com a quantidade de anúncios**: 1 = 300×600, 2 = 300×300 e
 * 3 = 300×250 (cada um dos anúncios da coluna ganha menos altura).
 */
export function adSpec(
  size: AdSize,
  theme: Record<string, string>,
  sideCount: 1 | 2 | 3 = 1
): AdSpec {
  if (size === "banner") {
    const compact = theme.variant === "holofote" || theme.variant === "zyrion";
    return compact ? { h: 90, size, w: 728 } : { h: 150, size, w: 970 };
  }
  if (size === "square") return { h: 250, size, w: 300 };
  const h = sideCount === 1 ? 600 : sideCount === 2 ? 300 : 250;
  return {
    h,
    note:
      sideCount === 1
        ? "Com 1 anúncio na coluna lateral, ele é alto (300 × 600)."
        : `Com ${sideCount} anúncios na coluna lateral, cada um fica menor (300 × ${h}). Se você mudar a quantidade, o tamanho ideal muda.`,
    size,
    w: 300,
  };
}

/** Formato do anúncio: o do topo é a faixa larga; os três da lateral direita são da coluna. */
export const adSizeOfKey = (key: AdKey): AdSize =>
  key === "banner" ? "banner" : "side";

/**
 * Nome de cada anúncio do site para quem edita. São dois grupos que **não têm relação**: o do topo (faixa larga) e os
 * da lateral direita (1º, 2º e 3º, que dividem a coluna). Os números 1 a 4 do código (`AD_KEYS`) não aparecem para a
 * pessoa: a numeração corrida fazia parecer que o "1" e o "2" eram vizinhos.
 */
export const AD_NAMES: Record<AdKey, string> = {
  banner: "Topo (faixa larga)",
  side: "Lateral direita · 1º anúncio",
  side2: "Lateral direita · 2º anúncio",
  side3: "Lateral direita · 3º anúncio",
};

/** Título do bloco de campos de cada anúncio no painel do tema. */
export const AD_TITLES: Record<AdKey, string> = {
  banner: "Anúncio do topo (faixa larga) — todas as páginas",
  side: "Lateral direita, 1º anúncio — todas as páginas",
  side2: "Lateral direita, 2º anúncio — todas as páginas",
  side3: "Lateral direita, 3º anúncio — todas as páginas",
};

/** Anúncios do site inteiro (`theme.adsConfig`, JSON): valem para todo espaço que não tem mídia própria. */
export function globalAds(
  theme: Record<string, string>
): Record<AdKey, AdConfig> {
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
    side2: adConfigSchema.parse(obj.side2),
    side3: adConfigSchema.parse(obj.side3),
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
  slot,
}: {
  ctx: RenderContext;
  items: { src: string }[];
  label: string;
  link: string;
  seconds: number;
  size: "banner" | "side" | "square";
  /** Anúncio do site (vazio: faixa = topo, lateral/quadrado = 1º da lateral direita). */
  slot?: AdKey;
}) {
  const key: AdKey = slot ?? (size === "banner" ? "banner" : "side");
  if (!adsEnabled(ctx)) {
    // No editor, explica por que o espaço está vazio; no site publicado, não ocupa lugar.
    return ctx.mode === "edit" ? (
      <div className={`sb-ad sb-ad-${size}`} data-ad-key={key}>
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
  // No portal de notícias só vale o espaço numerado: a mesma mídia em todas as páginas.
  const numbered = ctx.site.theme.variant === "portal";
  const own = numbered ? [] : items.filter(i => SAFE_SRC.test(i.src));
  const shared = globalAds(ctx.site.theme)[key];
  const useOwn = own.length > 0;
  const media = (useOwn ? own : shared.items).filter(i => SAFE_SRC.test(i.src));
  const linkUrl = useOwn ? link : shared.link;
  const secs = useOwn ? seconds : shared.seconds;
  if (media.length === 0 && ctx.mode !== "edit") return null;

  const inner =
    media.length === 0 ? (
      <div className="sb-ad-ph">
        {AD_NAMES[key]} — envie a mídia em Tema → Anúncios (vale para todos os
        anúncios deste tipo no site)
      </div>
    ) : (
      media.map((item, i) =>
        isVideoUrl(item.src) ? (
          <video
            autoPlay={!ctx.thumbnail}
            className={i === 0 ? "sb-ad-item on" : "sb-ad-item"}
            key={item.src}
            loop={media.length === 1}
            muted
            playsInline
            preload={ctx.thumbnail ? "none" : "metadata"}
            src={ctx.thumbnail ? undefined : item.src}
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
      data-ad-key={key}
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
    slot: z.enum(["auto", "1", "2", "3", "4"]).default("auto").catch("auto"),
  }),
  {
    fields: [
      { key: "size", kind: "select", label: "Formato", options: SIZE_OPTIONS },
      {
        key: "slot",
        kind: "select",
        label:
          "Qual anúncio do site este espaço mostra (mesma mídia em todas as páginas)",
        options: [
          {
            label: "Automático (faixa = topo, lateral = 1º da lateral direita)",
            value: "auto",
          },
          { label: AD_NAMES.banner, value: "1" },
          { label: AD_NAMES.side, value: "2" },
          { label: AD_NAMES.side2, value: "3" },
          { label: AD_NAMES.side3, value: "4" },
        ],
      },
      {
        itemFields: adItemFields,
        key: "items",
        kind: "list",
        label:
          "Mídia só deste espaço (vazio = usa o anúncio do site escolhido acima; no portal de notícias esta lista é ignorada)",
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
          slot={p.slot === "auto" ? undefined : AD_KEYS[Number(p.slot) - 1]}
        />
      </div>
    ),
    type: "adSlot",
  }
);

export const adBlocks = [adSlot];
