import type { ReactNode } from "react";
import { z } from "zod";
import { href, newTab, SocialIcon } from "./helpers.js";
import type { FieldDef, RenderContext } from "./types.js";

/**
 * Peças compartilhadas dos blocos `sa*` (variante `saut`, escopo `.sb-sa`): schemas curtos, ícones SVG próprios,
 * pílula de rótulo, contador `data-sb-count` com separadores pt-BR e o botão "Fale com a SAUT".
 */
export const str = (d = "") => z.string().default(d);
export const yesNo = (d: "no" | "yes") =>
  z.enum(["yes", "no"]).default(d).catch(d);
export const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

export const cls = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

export const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

export const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

/** Linhas do texto separadas por `<br>` (título/pílula em duas linhas). */
export function Lines({ text }: { text: string }) {
  const parts = lines(text);
  return (
    <>
      {parts.map((l, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: partes fixas do texto
        <span key={i}>
          {l}
          {i < parts.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

/* ───────────────────────── ícones ───────────────────────── */

const ICONS: Record<string, string> = {
  blocks: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM17 13v8M13 17h8",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9z",
  chart: "M3 3v18h18M7 15l4-4 3 3 5-6",
  check: "M20 6 9 17l-5-5",
  folder:
    "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  rocket:
    "M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M12 15l-3-3a22 22 0 0 1 2-4 12 12 0 0 1 11-6c0 3-1 8-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1 5 0 5 0M12 15v5s3-.6 4-2c1-1.6 0-5 0-5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star: "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
  target:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
};

export const ICON_OPTIONS = [
  { label: "Lupa", value: "search" },
  { label: "Mapa", value: "map" },
  { label: "Blocos", value: "blocks" },
  { label: "Foguete", value: "rocket" },
  { label: "Gráfico", value: "chart" },
  { label: "Alvo", value: "target" },
  { label: "Pessoas", value: "users" },
  { label: "Raio", value: "bolt" },
  { label: "Escudo", value: "shield" },
  { label: "Estrela", value: "star" },
  { label: "Check", value: "check" },
];

export function Icon({ name }: { name: string }) {
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
      <path d={ICONS[name] ?? ICONS.star} />
    </svg>
  );
}

const WHATSAPP =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z";

export function WhatsappIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d={WHATSAPP} />
    </svg>
  );
}

/** Ícone de rede/contato pelo nome do item do rodapé (WhatsApp, E-mail, Instagram…). */
export function SocialGlyph({ label }: { label: string }) {
  const key = label.trim().toLowerCase();
  if (key.includes("whatsapp")) return <WhatsappIcon />;
  if (key.includes("mail"))
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
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" />
      </svg>
    );
  return <SocialIcon label={label} />;
}

/* ───────────────────────── peças ───────────────────────── */

export function Pill({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "glass" | "white" | "outline" | "soft";
}) {
  if (!children) return null;
  return <span className={cls("sa-pill", tone)}>{children}</span>;
}

/** "1220" → "1.220"; "96,8" → "96,8"; separador de milhar e decimal em pt-BR. */
export function countParts(value: string): {
  dec: number;
  n: string;
  text: string;
} {
  const raw = value.trim().replace(",", ".");
  const num = Number(raw);
  if (!raw || Number.isNaN(num)) return { dec: 0, n: "0", text: value };
  const [int = "0", frac = ""] = raw.replace(/^[+-]/, "").split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return {
    dec: frac.length,
    n: raw,
    text: frac ? `${grouped},${frac}` : grouped,
  };
}

/** Número que conta de 0 ao valor ao entrar na tela (`data-sb-count` do `fx-runtime`); o HTML já traz o valor final. */
export function Count({
  className,
  prefix = "",
  suffix = "",
  value,
}: {
  className?: string;
  prefix?: string;
  suffix?: string;
  value: string;
}) {
  const c = countParts(value);
  return (
    <span className={className}>
      {prefix ? <i className="sa-pfx">{prefix}</i> : null}
      <span
        data-decimals={c.dec || undefined}
        data-dsep=","
        data-ms="1500"
        data-sb-count={c.n}
        data-sep="."
      >
        {c.text}
      </span>
      {suffix ? <i className="sa-sfx">{suffix}</i> : null}
    </span>
  );
}

/** Botão "Fale com a SAUT": se o link do botão estiver vazio vale o WhatsApp global do tema (`whatsappUrl`). */
export const contactUrl = (ctx: RenderContext, url: string) =>
  url.trim() || ctx.site.theme.whatsappUrl || "/";

export function Btn({
  children,
  ctx,
  icon,
  tone = "dark",
  url,
}: {
  children: ReactNode;
  ctx: RenderContext;
  icon?: boolean;
  tone?: "dark" | "ghost" | "lime" | "white";
  url: string;
}) {
  if (!children) return null;
  const target = contactUrl(ctx, url);
  return (
    <a
      className={cls("sa-btn", tone)}
      href={href(ctx, target)}
      {...newTab(target)}
    >
      {icon ? <WhatsappIcon /> : null}
      {children}
    </a>
  );
}

/** Ícone check num quadrado (lima nos itens de lista, azul nos selos do CTA). */
export function CheckBox() {
  return (
    <i aria-hidden="true" className="sa-check">
      <Icon name="check" />
    </i>
  );
}

/** Avatar: foto circular, ou o círculo com a inicial quando não há foto. */
export function Avatar({ name, src }: { name: string; src: string }) {
  return src ? (
    <img
      alt={name}
      className="sa-av"
      height="40"
      loading="lazy"
      src={src}
      width="40"
    />
  ) : (
    <span aria-hidden="true" className="sa-av ini">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/* ───────────────────────── campos ───────────────────────── */

export const linkItem = z.object({ label: str(), url: str() });
export const linkFields: FieldDef[] = [
  { key: "label", kind: "text", label: "Texto" },
  { key: "url", kind: "url", label: "Link" },
];

export const checkItem = z.object({ text: str(), title: str() });
export const checkFields: FieldDef[] = [
  { key: "title", kind: "text", label: "Título" },
  { key: "text", kind: "textarea", label: "Texto" },
];

export const avatarItem = z.object({ name: str(), src: str() });
export const avatarFields: FieldDef[] = [
  { key: "src", kind: "image", label: "Foto (vazio = círculo com a inicial)" },
  { key: "name", kind: "text", label: "Nome" },
];

export const headFields = (extra: FieldDef[] = []): FieldDef[] => [
  { key: "eyebrow", kind: "text", label: "Rótulo (pílula)" },
  { key: "title", kind: "text", label: "Título" },
  { key: "text", kind: "textarea", label: "Texto" },
  ...extra,
];

export const dotsField: FieldDef = {
  key: "dots",
  kind: "select",
  label: "Padrão de pontos no fundo",
  options: YES_NO,
};

export const button = (key: string, label: string): FieldDef[] => [
  { key: `${key}Label`, kind: "text", label: `Texto do ${label}` },
  {
    key: `${key}Url`,
    kind: "url",
    label: `Link do ${label} (vazio = WhatsApp do site)`,
  },
];
