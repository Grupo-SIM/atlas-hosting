import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { href, newTab, SocialIcon } from "./helpers.js";
import type { FieldDef, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Peças comuns dos blocos do tema SIM Intermediações (prefixo `si`, escopo `.sb-si`): ícones, botão de vídeo
 * pulsante (popup `data-sb-video`), carrossel (`data-si-car`, ligado em `renderer/fx-runtime.ts`) e leitura
 * das listas digitadas no painel. O visual vem de `renderer/sim.ts`.
 */

export const str = (d = "") => z.string().default(d).catch(d);
export const yesNo = (d: "yes" | "no" = "no") =>
  z.enum(["yes", "no"]).default(d).catch(d);
export const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);

export const bg = (url: string | undefined) =>
  ({ "--si-bg": cssUrl(url) }) as CSSProperties;

/* ───────────────────────── ícones ───────────────────────── */

const ICON_PATHS: Record<string, ReactNode> = {
  "arrow-right": <path d="M5 12h14m-7-7 7 7-7 7" />,
  briefcase: (
    <>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect height="14" rx="2" width="20" x="2" y="6" />
    </>
  ),
  building: (
    <>
      <rect height="20" rx="2" width="16" x="4" y="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </>
  ),
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </>
  ),
  card: (
    <>
      <rect height="14" rx="2" width="20" x="2" y="5" />
      <path d="M2 10h20" />
    </>
  ),
  chart: (
    <>
      <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  code: <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
    </>
  ),
  mail: (
    <>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  monitor: (
    <>
      <rect height="14" rx="2" width="20" x="2" y="3" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  server: (
    <>
      <rect height="8" rx="2" width="20" x="2" y="2" />
      <rect height="8" rx="2" width="20" x="2" y="14" />
      <path d="M6 6h.01M6 18h.01" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  smartphone: (
    <>
      <rect height="20" rx="2" ry="2" width="14" x="5" y="2" />
      <path d="M12 18h.01" />
    </>
  ),
  star: (
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  ),
  "thumbs-up": (
    <>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
};

export const SI_ICON_OPTIONS = Object.keys(ICON_PATHS)
  .sort()
  .map(value => ({ label: value, value }));

export const SI_ICON_NAMES = Object.keys(ICON_PATHS) as [string, ...string[]];

export function SiIcon({ name }: { name: string }) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.star;
  return (
    <svg
      aria-hidden="true"
      fill={name === "star" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths}
    </svg>
  );
}

/** Rede social pelo nome (`youtube`, `instagram`, `x`, `kwai`…) — o Kwai usa o ícone de câmera. */
export function SiSocial({ name }: { name: string }) {
  const key = name.trim().toLowerCase();
  return <SocialIcon label={key === "kwai" ? "video" : key} />;
}

/* ───────────────────────── listas do painel ───────────────────────── */

/** `Texto | endereço` por linha (a barra separa o rótulo do link). */
export function parseLinks(text: string): { label: string; url: string }[] {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const at = line.indexOf("|");
      return at < 0
        ? { label: line, url: "#" }
        : { label: line.slice(0, at).trim(), url: line.slice(at + 1).trim() };
    });
}

export const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

/* ───────────────────────── botões ───────────────────────── */

export function SiButton({
  className = "",
  ctx,
  label,
  url,
}: {
  className?: string;
  ctx: RenderContext;
  label: string;
  url: string;
}) {
  if (!label) return null;
  return (
    <a
      className={`si-btn ${className}`.trim()}
      href={href(ctx, url)}
      {...newTab(url)}
    >
      {label}
    </a>
  );
}

/** Círculo transparente com play e ondas roxas pulsando (`glow-ripple` do ElementsKit); abre o vídeo em popup. */
export function VideoButton({
  label = "Assistir ao vídeo",
  pulse = true,
  url,
}: {
  label?: string;
  pulse?: boolean;
  url: string;
}) {
  if (!url) return null;
  const embed = popupVideoEmbed(url);
  return (
    <a
      aria-label={label}
      className={`si-vbtn ${pulse ? "si-glow" : ""}`}
      data-sb-video={embed ?? undefined}
      href={url}
      {...newTab(url)}
    >
      <i>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6 3l14 9-14 9z" />
        </svg>
      </i>
    </a>
  );
}

/* ───────────────────────── carrossel ───────────────────────── */

export const carFields = (extra: FieldDef[] = []): FieldDef[] => [
  { key: "perView", kind: "number", label: "Itens por tela (computador)" },
  { key: "perViewTablet", kind: "number", label: "Itens por tela (tablet)" },
  { key: "perViewMobile", kind: "number", label: "Itens por tela (celular)" },
  { key: "gap", kind: "number", label: "Espaço entre itens (px)" },
  { key: "delay", kind: "number", label: "Tempo parado entre passes (ms)" },
  { key: "speed", kind: "number", label: "Duração da transição (ms)" },
  ...extra,
];

export const carSchema = (d: {
  delay: number;
  gap: number;
  perView: number;
  perViewMobile: number;
  perViewTablet: number;
  speed: number;
}) => ({
  delay: int(0, 30000, d.delay),
  gap: int(0, 100, d.gap),
  perView: int(1, 8, d.perView),
  perViewMobile: int(1, 8, d.perViewMobile),
  perViewTablet: int(1, 8, d.perViewTablet),
  speed: int(100, 5000, d.speed),
});

export interface CarProps {
  delay: number;
  gap: number;
  perView: number;
  perViewMobile: number;
  perViewTablet: number;
  speed: number;
}

/**
 * Carrossel em laço: no HTML publicado o `fx-runtime` (`[data-si-car]`) liga o autoplay, a pausa no hover,
 * as setas, as bolinhas e o arrastar; sem JS (e no editor) vira uma faixa rolável parada.
 */
export function SiCar({
  advance = "one",
  arrows = "outside",
  className = "",
  dots = false,
  items,
  p,
  pause = true,
}: {
  /** `page` = cada passo avança uma tela inteira (N itens por vez); `one` = um item. */
  advance?: "one" | "page";
  arrows?: "inside" | "none" | "outside";
  className?: string;
  dots?: boolean;
  items: ReactNode[];
  p: CarProps;
  pause?: boolean;
}) {
  return (
    <div
      className={`si-car ${arrows !== "none" ? `arrows-${arrows}` : ""} ${className}`.trim()}
      data-adv={advance === "page" ? "page" : undefined}
      data-delay={p.delay}
      data-dots={dots ? "1" : undefined}
      data-max={Math.max(p.perView, p.perViewTablet, p.perViewMobile)}
      data-pause={pause ? "1" : "0"}
      data-si-car="1"
      data-speed={p.speed}
      style={
        {
          "--si-d": p.perView,
          "--si-gap": `${p.gap}px`,
          "--si-m": p.perViewMobile,
          "--si-t": p.perViewTablet,
        } as CSSProperties
      }
    >
      <div className="si-car-view">
        <div className="si-car-track">
          {items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do slide
            <div className="si-slide" key={i}>
              {item}
            </div>
          ))}
        </div>
      </div>
      {arrows !== "none" ? (
        <>
          <button
            aria-label="Anterior"
            className="si-car-arrow prev"
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Próximo"
            className="si-car-arrow next"
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      ) : null}
      {dots ? <div className="si-car-dots" /> : null}
    </div>
  );
}
