import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import type { FieldDef } from "./types.js";
import { backgroundVideoEmbed } from "./youtube.js";

/**
 * Peças comuns de seção estilo Elementor, usadas pelos templates migrados de WordPress: divisor de forma na base
 * (`ShapeDivider`, CSS `.sb-shape` em `renderer/styles.ts`) e vídeo de fundo (`BackgroundVideo`, `.sb-bgvideo`).
 */
const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);
const HEX = /^#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/;

export const SHAPE_OPTIONS = [
  { label: "Nenhum", value: "none" },
  { label: "Zigue-zague", value: "zigzag" },
  { label: "Curva negativa", value: "curve-negative" },
];

export const shapeSchema = (d: {
  heightDesktop: number;
  heightMobile: number;
  heightTablet: number;
  shape: "curve-negative" | "none" | "zigzag";
  widthMobile?: number;
  widthTablet?: number;
}) => ({
  shape: z
    .enum(["none", "zigzag", "curve-negative"])
    .default(d.shape)
    .catch(d.shape),
  shapeColor: z
    .string()
    .default("#0A0711")
    .catch("#0A0711")
    .transform(v => (HEX.test(v) ? v : "#0A0711")),
  shapeHeight: int(0, 800, d.heightDesktop),
  shapeHeightMobile: int(0, 800, d.heightMobile),
  shapeHeightTablet: int(0, 800, d.heightTablet),
  shapeWidthMobile: int(100, 400, d.widthMobile ?? 100),
  shapeWidthTablet: int(100, 400, d.widthTablet ?? 100),
});

export const shapeFields: FieldDef[] = [
  {
    key: "shape",
    kind: "select",
    label: "Divisor de forma na base",
    options: SHAPE_OPTIONS,
  },
  { key: "shapeColor", kind: "color", label: "Cor do divisor" },
  { key: "shapeHeight", kind: "number", label: "Altura do divisor (px)" },
  {
    key: "shapeHeightTablet",
    kind: "number",
    label: "Altura do divisor — tablet (px)",
  },
  {
    key: "shapeHeightMobile",
    kind: "number",
    label: "Altura do divisor — celular (px)",
  },
  {
    key: "shapeWidthTablet",
    kind: "number",
    label: "Largura do divisor — tablet (%)",
  },
  {
    key: "shapeWidthMobile",
    kind: "number",
    label: "Largura do divisor — celular (%)",
  },
];

/** Dentes do zigue-zague do Elementor (viewBox 1800×6, dente de 10,8 de largura). */
const ZIGZAG = (() => {
  let d = "M0 0V5.4";
  for (let x = 0; x < 1800; x += 10.8)
    d += `L${(x + 5.4).toFixed(1)} 0.4L${(x + 10.8).toFixed(1)} 5.4`;
  return `${d}V0z`;
})();

// Desenhados "pendurados" no topo; o CSS gira 180° para o preenchimento ficar na base da seção.
const CURVE_NEGATIVE =
  "M0,0C0,18,211.6,97,500,97C788.4,97,1000,18,1000,0V100H0z";

export interface ShapeProps {
  shape: "curve-negative" | "none" | "zigzag";
  shapeColor: string;
  shapeHeight: number;
  shapeHeightMobile: number;
  shapeHeightTablet: number;
  shapeWidthMobile: number;
  shapeWidthTablet: number;
}

export function ShapeDivider({ p }: { p: ShapeProps }) {
  if (p.shape === "none" || p.shapeHeight <= 0) return null;
  const zig = p.shape === "zigzag";
  return (
    <div
      aria-hidden="true"
      className="sb-shape"
      style={
        {
          "--sh-d": `${p.shapeHeight}px`,
          "--sh-m": `${p.shapeHeightMobile}px`,
          "--sh-t": `${p.shapeHeightTablet}px`,
          "--shc": p.shapeColor,
          "--sw-m": `${p.shapeWidthMobile}%`,
          "--sw-t": `${p.shapeWidthTablet}%`,
        } as CSSProperties
      }
    >
      <svg
        preserveAspectRatio="none"
        viewBox={zig ? "0 0 1800 6" : "0 0 1000 100"}
      >
        <path d={zig ? ZIGZAG : CURVE_NEGATIVE} />
      </svg>
    </div>
  );
}

/** Vídeo do YouTube de fundo; no editor (`edit`) ou sem link válido só o pôster. */
export function BackgroundVideo({
  edit,
  poster,
  url,
}: {
  edit: boolean;
  poster: string;
  url: string;
}) {
  const embed = edit ? null : backgroundVideoEmbed(url);
  return (
    <div
      aria-hidden="true"
      className="sb-bgvideo"
      style={{ "--bgv-poster": cssUrl(poster) } as CSSProperties}
    >
      {embed ? (
        <iframe
          allow="autoplay; encrypted-media"
          loading="lazy"
          src={embed}
          tabIndex={-1}
          title="Vídeo de fundo"
        />
      ) : null}
    </div>
  );
}
