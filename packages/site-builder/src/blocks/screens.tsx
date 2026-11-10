import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { int, str } from "./sim-lib.js";
import type { FieldDef } from "./types.js";

/**
 * Fundo e altura mínima **por tela** (computador, tablet ≤ 1024px e celular ≤ 767px) para seções de landing:
 * o bloco desenha o contêiner com `screenStyle(props, "<prefixo>")` e o CSS da variante lê as variáveis
 * `--<prefixo>-bg`, `--<prefixo>-bg-m`, `--<prefixo>-h`, `--<prefixo>-h-t`, `--<prefixo>-h-m` e `--<prefixo>-pos`
 * (ver `renderer/habilidades.ts`). Altura 0 = automática. Imagem do celular vazia = a do computador.
 */

const POSITIONS = [
  "center center",
  "center top",
  "center bottom",
  "left center",
  "right center",
] as const;

const POSITION_OPTIONS = [
  { label: "Centro", value: "center center" },
  { label: "Topo", value: "center top" },
  { label: "Embaixo", value: "center bottom" },
  { label: "Esquerda", value: "left center" },
  { label: "Direita", value: "right center" },
];

export const screenSchema = (d: { h: number; hm: number; ht: number }) => ({
  bg: str(),
  bgMobile: str(),
  bgPosition: z.enum(POSITIONS).default("center center").catch("center center"),
  minHeight: int(0, 3000, d.h),
  minHeightMobile: int(0, 3000, d.hm),
  minHeightTablet: int(0, 3000, d.ht),
});

export interface ScreenProps {
  bg: string;
  bgMobile: string;
  bgPosition: string;
  minHeight: number;
  minHeightMobile: number;
  minHeightTablet: number;
}

export const screenFields = (withBg = true): FieldDef[] => [
  ...(withBg
    ? ([
        { key: "bg", kind: "image", label: "Imagem de fundo" },
        {
          key: "bgMobile",
          kind: "image",
          label: "Imagem de fundo do celular (vazio = a mesma)",
        },
        {
          key: "bgPosition",
          kind: "select",
          label: "Posição do fundo",
          options: POSITION_OPTIONS,
        },
      ] as FieldDef[])
    : []),
  { key: "minHeight", kind: "number", label: "Altura mínima (px, 0 = auto)" },
  {
    key: "minHeightTablet",
    kind: "number",
    label: "Altura mínima no tablet (px, 0 = auto)",
  },
  {
    key: "minHeightMobile",
    kind: "number",
    label: "Altura mínima no celular (px, 0 = auto)",
  },
];

export function screenStyle(
  p: ScreenProps,
  prefix: string,
  extra: Record<string, string> = {}
): CSSProperties {
  return {
    [`--${prefix}-bg`]: cssUrl(p.bg),
    ...(p.bgMobile ? { [`--${prefix}-bg-m`]: cssUrl(p.bgMobile) } : {}),
    [`--${prefix}-h`]: `${p.minHeight}px`,
    [`--${prefix}-h-m`]: `${p.minHeightMobile}px`,
    [`--${prefix}-h-t`]: `${p.minHeightTablet}px`,
    [`--${prefix}-pos`]: p.bgPosition,
    ...extra,
  } as CSSProperties;
}
