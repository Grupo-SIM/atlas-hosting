import type { ReactNode } from "react";
import { z } from "zod";
import { href, SocialIcon } from "./helpers.js";
import type { RenderContext } from "./types.js";

/**
 * Peças comuns dos blocos do template "Semente Viva — Fundação / ONG" (prefixo `sv`, escopo `.sb-sv`): leitura das
 * props de `z` com padrão, ícones próprios em SVG, ícones das redes, leitura dos dados da fundação em `site.theme`
 * (nome, CNPJ, endereço, contatos, horário e dados do PIX) e o **payload BR Code do PIX** (EMV + CRC16-CCITT), puro e
 * testável. O visual vem de `renderer/fundacao.ts`.
 */

export const str = (d = "") => z.string().default(d).catch(d);
export const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);
export const flag = (d: "yes" | "no" = "no") =>
  z.enum(["yes", "no"]).default(d).catch(d);

export const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

export const hex = (v: string, fallback: string) =>
  /^#[0-9a-f]{3,8}$/i.test(v.trim()) ? v.trim() : fallback;

/* ───────────────────────── ícones ───────────────────────── */

const PATHS: Record<string, ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.500 3.800 2.800-1.400 4.400H9.600l-1.400-4.400z" />
      <path d="M12 3v4.500m3.800 2.800L20 9m-5.600 5.700 2.600 3.600m-7.400-3.600L7 18.300M8.200 10.300 4 9" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.500A2.500 2.500 0 0 1 6.500 2H20v17H6.500A2.500 2.500 0 0 0 4 21.500z" />
      <path d="M4 21.500A2.500 2.500 0 0 1 6.500 19H20" />
    </>
  ),
  cap: (
    <>
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11.500V16c0 1.500 2.700 3 6 3s6-1.500 6-3v-4.500M22 9v6" />
    </>
  ),
  check: <path d="m20 6-11 11-5-5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  copy: (
    <>
      <rect height="13" rx="2" width="13" x="9" y="9" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  heart: (
    <path d="M20.800 5.600a5.200 5.200 0 0 0-7.400 0L12 7l-1.400-1.400a5.200 5.200 0 0 0-7.400 7.400L12 21.800l8.800-8.800a5.200 5.200 0 0 0 0-7.400z" />
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 10 10 5 20 5c0 10-5 15-14 15" />
      <path d="M5 19c3-5 6-8 11-10" />
    </>
  ),
  mail: (
    <>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-9.200 5.800a1.900 1.900 0 0 1-2.100 0L2 7" />
    </>
  ),
  next: <path d="m9 18 6-6-6-6" />,
  phone: (
    <path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.4c.9.300 1.800.6 2.800.7A2 2 0 0 1 22 16.900z" />
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.200-7-11.500a7 7 0 0 1 14 0C19 14.800 12 21 12 21z" />
      <circle cx="12" cy="9.500" r="2.500" />
    </>
  ),
  play: <path d="m7 4 13 8-13 8z" />,
  prev: <path d="m15 18-6-6 6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.500-3.500" />
    </>
  ),
  star: (
    <path d="m12 2.500 2.900 5.900 6.500.9-4.700 4.600 1.100 6.500-5.800-3-5.800 3 1.100-6.500L2.600 9.300l6.500-.9z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.900 4.900l1.400 1.400m11.400 11.400 1.400 1.400M2 12h2m16 0h2M4.900 19.100l1.400-1.400m11.400-11.400 1.400-1.400" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  up: <path d="m6 15 6-6 6 6" />,
  users: (
    <>
      <circle cx="9" cy="7.500" r="3.500" />
      <path d="M2.500 21v-1A5.500 5.500 0 0 1 8 14.500h2a5.500 5.500 0 0 1 5.500 5.500v1" />
      <circle cx="17.500" cy="8.500" r="2.500" />
      <path d="M17 14.500h.7a4 4 0 0 1 4 4V20" />
    </>
  ),
};

/** Ícones que o painel oferece nas áreas de atuação. */
export const SV_ICON_OPTIONS = [
  "ball",
  "cap",
  "book",
  "users",
  "heart",
  "leaf",
  "sun",
  "home",
  "star",
  "target",
].map(value => ({
  label:
    {
      ball: "Esporte (bola)",
      book: "Livro",
      cap: "Formatura (capelo)",
      heart: "Coração",
      home: "Casa",
      leaf: "Folha",
      star: "Estrela",
      sun: "Sol",
      target: "Alvo",
      users: "Pessoas",
    }[value] ?? value,
  value,
}));

export function SvIcon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {PATHS[name] ?? PATHS.heart}
    </svg>
  );
}

const WHATSAPP_PATH =
  "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.49-8.41z";

/** Cor de fundo do círculo de cada rede (barra do topo, rodapé). */
const SOCIAL_BG: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#D6249F",
  tiktok: "#111111",
  whatsapp: "#25D366",
  x: "#111111",
  youtube: "#E62117",
};

export const socialKey = (label: string) => label.trim().toLowerCase();

export const socialBg = (label: string) =>
  SOCIAL_BG[socialKey(label)] ?? "#5A6B5A";

export function SvSocial({ label }: { label: string }) {
  if (socialKey(label) === "whatsapp")
    return (
      <svg
        aria-hidden="true"
        fill="currentColor"
        height="16"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d={WHATSAPP_PATH} />
      </svg>
    );
  return <SocialIcon label={label} />;
}

/* ───────────────────────── dados da fundação (site.theme) ───────────────────────── */

export interface Org {
  address: string;
  cnpj: string;
  email: string;
  hours: string;
  name: string;
  phone: string;
  pixCity: string;
  pixId: string;
  pixKey: string;
  pixKeyType: string;
  pixQr: string;
  pixReceiver: string;
  whatsapp: string;
}

const digits = (s: string) => s.replace(/\D/g, "");

/** Dados da fundação, todos de `site.theme` (um lugar só para editar: "Página inteira"). */
export function org(ctx: RenderContext): Org {
  const theme = ctx.site.theme;
  return {
    address: theme.address ?? "",
    cnpj: theme.cnpj ?? "",
    email: theme.contactEmail ?? "",
    hours: theme.hours ?? "",
    name: ctx.site.name,
    phone: theme.phone ?? "",
    pixCity: theme.pixCity ?? "",
    pixId: theme.pixId ?? "",
    pixKey: theme.pixKey ?? "",
    pixKeyType: theme.pixKeyType ?? "email",
    pixQr: theme.pixQr ?? "",
    pixReceiver: theme.pixReceiver ?? "",
    whatsapp: digits(theme.whatsapp ?? ""),
  };
}

/** `tel:` com o número limpo (mantém o `+` inicial); vazio sem dígitos. */
export function telHref(phone: string): string {
  const d = digits(phone);
  return d ? `tel:${phone.trim().startsWith("+") ? "+" : ""}${d}` : "";
}

/** `https://wa.me/<número>` (só números, com DDI e DDD); vazio sem número. */
export const waHref = (whatsapp: string): string =>
  digits(whatsapp) ? `https://wa.me/${digits(whatsapp)}` : "";

/* ───────────────────────── links ───────────────────────── */

const norm = (s: string) => s.replace(/^\/+|\/+$/g, "");

/** O item do menu é a página atual? Âncoras nunca são a página atual. */
export const isCurrent = (ctx: RenderContext, url: string) =>
  !url.includes("#") && norm(url) === norm(ctx.path ?? "");

/** Âncora na home: local quando já estamos nela, senão volta para a home. */
export function anchorHref(ctx: RenderContext, url: string): string {
  if (!url) return href(ctx, "/");
  if (!url.startsWith("#")) return href(ctx, url);
  return norm(ctx.path ?? "") === "" ? url : href(ctx, `/${url}`);
}

/** Texto livre → parágrafos (linhas em branco separam). */
export const paragraphs = (text: string): string[] =>
  text
    .split(/\n{2,}|\n/)
    .map(p => p.trim())
    .filter(Boolean);

/** Foto com `alt`, preguiçosa (menos a primeira dobra). Sem endereço, um quadro vazio que o editor mostra. */
export function Pic({
  alt = "",
  className,
  eager,
  src,
}: {
  alt?: string;
  className?: string;
  eager?: boolean;
  src: string | null | undefined;
}) {
  if (!src) return <div className={`sb-img-empty ${className ?? ""}`.trim()} />;
  return (
    // biome-ignore lint/performance/noImgElement: site estático, sem next/image
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading={eager ? undefined : "lazy"}
      src={src}
    />
  );
}

/* ───────────────────────── PIX (BR Code) ───────────────────────── */

/**
 * CRC16-CCITT (polinômio 0x1021, início 0xFFFF), como o BR Code do Banco Central exige: calculado sobre todo o
 * texto **incluindo** o `6304` do campo do CRC; o resultado vai em 4 caracteres hexadecimais maiúsculos.
 */
export function crc16(text: string): string {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Texto do BR Code: sem acentos, só ASCII imprimível, cortado em `max` caracteres. */
export function pixText(value: string, max: number): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trimEnd();
}

/** Chave no formato que o PIX espera: CNPJ/CPF só dígitos, telefone com +55, e-mail em minúsculas. */
export function pixKeyValue(type: string, key: string): string {
  const k = key.trim();
  if (type === "cnpj" || type === "cpf") return digits(k);
  if (type === "phone") {
    const d = digits(k);
    return d
      ? k.startsWith("+")
        ? `+${d}`
        : `+55${d.replace(/^55/, "")}`
      : "";
  }
  if (type === "email") return k.toLowerCase();
  return k;
}

const tlv = (id: string, value: string) =>
  `${id}${String(value.length).padStart(2, "0")}${value}`;

export interface PixInput {
  /** Cidade do recebedor (até 15 caracteres). */
  city: string;
  /** Chave PIX já no formato final (veja `pixKeyValue`). */
  key: string;
  /** Nome do recebedor (até 25 caracteres). */
  name: string;
  /** Identificador da transferência (até 25 letras e números); vazio = `***`. */
  txid?: string;
}

/**
 * Payload "PIX copia e cola" (BR Code estático, sem valor): formato, conta `br.gov.bcb.pix` + chave, categoria `0000`,
 * moeda `986` (BRL), país `BR`, nome (≤ 25), cidade (≤ 15), identificador e CRC16. Vazio sem chave.
 */
export function pixPayload(input: PixInput): string {
  const key = pixText(input.key, 77);
  if (!key) return "";
  const txid = (input.txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25);
  const body =
    tlv("00", "01") +
    tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", key)) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("58", "BR") +
    tlv("59", pixText(input.name, 25) || "NA") +
    tlv("60", pixText(input.city, 15) || "BRASIL") +
    tlv("62", tlv("05", txid || "***")) +
    "6304";
  return body + crc16(body);
}

/** Chave de exemplo (ou vazia): o editor avisa para trocar antes de publicar. */
export const isSamplePix = (key: string) => !key.trim() || /exemplo/i.test(key);

export const PIX_KEY_TYPES = [
  { label: "CNPJ", value: "cnpj" },
  { label: "E-mail", value: "email" },
  { label: "Telefone", value: "phone" },
  { label: "Chave aleatória", value: "random" },
];

export const pixTypeLabel = (type: string) =>
  PIX_KEY_TYPES.find(o => o.value === type)?.label ?? "Chave";
