import type { CSSProperties } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";

/**
 * Botão "voltar ao topo" (genérico, qualquer template). Fixo no canto, aparece depois de `threshold` px de
 * rolagem (entra subindo de `bottom:-60px`) e rola até o topo ao clicar. O JS vive em `renderer/fx-runtime.ts`
 * (`[data-sb-top]`); no editor o botão fica visível e parado no fluxo da página.
 */
const HEX6 = /^#[0-9a-fA-F]{6}$/;
const hex = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .catch(fallback)
    .transform(v => (HEX6.test(v) ? v : fallback));
const int = (min: number, max: number, fallback: number) =>
  z.coerce.number().int().min(min).max(max).default(fallback).catch(fallback);

const scrollTop = defineBlock(
  z.object({
    bottom: int(0, 400, 60),
    color: hex("#137bc0"),
    hoverColor: hex("#e8b006"),
    iconColor: hex("#ffffff"),
    label: z.string().default("Voltar ao topo").catch("Voltar ao topo"),
    radius: int(0, 25, 5),
    side: z.enum(["right", "left"]).default("right").catch("right"),
    sideGap: int(0, 200, 15),
    size: int(30, 90, 50),
    threshold: int(0, 5000, 200),
  }),
  {
    fields: [
      { key: "color", kind: "color", label: "Cor do botão" },
      { key: "hoverColor", kind: "color", label: "Cor ao passar o mouse" },
      { key: "iconColor", kind: "color", label: "Cor da seta" },
      {
        key: "side",
        kind: "select",
        label: "Lado da tela",
        options: [
          { label: "Direita", value: "right" },
          { label: "Esquerda", value: "left" },
        ],
      },
      { key: "sideGap", kind: "number", label: "Distância da lateral (px)" },
      { key: "bottom", kind: "number", label: "Distância do fundo (px)" },
      { key: "size", kind: "number", label: "Tamanho (px)" },
      { key: "radius", kind: "number", label: "Arredondamento (px)" },
      {
        key: "threshold",
        kind: "number",
        label: "Aparece depois de rolar (px)",
      },
      { key: "label", kind: "text", label: "Nome do botão (acessibilidade)" },
    ],
    group: "layout",
    label: "Botão voltar ao topo",
    render: (p, ctx) => (
      <button
        aria-label={p.label}
        className={`sb-top${ctx.mode === "edit" ? "is-edit on" : ""}`}
        data-at={p.threshold}
        data-sb-top="1"
        style={
          {
            "--top-b": `${p.bottom}px`,
            "--top-bg": p.color,
            "--top-fg": p.iconColor,
            "--top-hover": p.hoverColor,
            "--top-r": `${p.radius}px`,
            "--top-s": `${p.size}px`,
            [p.side]: `${p.sideGap}px`,
          } as CSSProperties
        }
        title={p.label}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 448 512">
          <path d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z" />
        </svg>
      </button>
    ),
    type: "scrollTop",
  }
);

export const scrollTopBlocks = [scrollTop];
