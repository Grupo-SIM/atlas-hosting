"use client";

import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { listBlockDefinitions } from "../blocks/registry.js";
import type { BlockGroup } from "../blocks/types.js";
import { Icon } from "./icons.js";

/** Ordem e nome dos grupos na biblioteca: o que é mais visual vem primeiro. */
const GROUPS: { id: BlockGroup; label: string }[] = [
  { id: "shapes", label: "Formas" },
  { id: "graphics", label: "Elementos gráficos" },
  { id: "charts", label: "Gráficos e tabelas" },
  { id: "frames", label: "Molduras e mockups" },
  { id: "media", label: "Mídia" },
  { id: "content", label: "Conteúdo" },
  { id: "blog", label: "Blog" },
  { id: "layout", label: "Estrutura" },
];

const CLIP: Record<string, string> = {
  shapeArrow: "polygon(0 35%,60% 35%,60% 10%,100% 50%,60% 90%,60% 65%,0 65%)",
  shapeCross:
    "polygon(35% 0,65% 0,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0 65%,0 35%,35% 35%)",
  shapeDiamond: "polygon(50% 0,100% 50%,50% 100%,0 50%)",
  shapeHexagon: "polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)",
  shapePentagon: "polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)",
  shapeStar:
    "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
  shapeTriangle: "polygon(50% 0,100% 100%,0 100%)",
};

const C = "#6a5ad8";
const svg = (children: ReactNode) => (
  <svg aria-hidden="true" height="44" viewBox="0 0 60 44" width="60">
    {children}
  </svg>
);

/** Miniatura de cada elemento (desenho simples, sem renderizar o bloco de verdade). */
function Thumb({ type }: { type: string }) {
  const box = (style: CSSProperties) => (
    <div style={{ background: C, ...style }} />
  );
  if (CLIP[type]) return box({ clipPath: CLIP[type], height: 34, width: 34 });
  switch (type) {
    case "shapeLine":
      return box({ borderRadius: 4, height: 4, width: 48 });
    case "shapeRect":
      return box({ borderRadius: 4, height: 26, width: 46 });
    case "shapeSquare":
      return box({ borderRadius: 4, height: 32, width: 32 });
    case "shapeCircle":
      return box({ borderRadius: "50%", height: 34, width: 34 });
    case "badge":
      return <span className="sbl-badge">Novo</span>;
    case "divider":
      return svg(
        <path d="M2 22h56" stroke={C} strokeDasharray="5 4" strokeWidth="3" />
      );
    case "progress":
      return svg(
        <>
          <rect fill="#e2e8f0" height="8" rx="4" width="52" x="4" y="18" />
          <rect fill="#22c55e" height="8" rx="4" width="34" x="4" y="18" />
        </>
      );
    case "iconBlock":
      return svg(
        <path
          d="M30 6l5.4 11 12 1.7-8.7 8.5 2 12-10.7-5.7-10.7 5.7 2-12-8.7-8.5 12-1.7z"
          fill="none"
          stroke={C}
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      );
    case "marquee":
      return svg(
        <>
          <rect fill="#0f172a" height="18" rx="3" width="56" x="2" y="13" />
          <text fill="#fff" fontSize="9" fontWeight="700" x="6" y="26">
            PROMO • FRETE •
          </text>
        </>
      );
    case "barChart":
      return svg(
        <>
          <rect fill={C} height="14" rx="2" width="9" x="8" y="26" />
          <rect fill="#22c55e" height="26" rx="2" width="9" x="21" y="14" />
          <rect fill="#f59e0b" height="19" rx="2" width="9" x="34" y="21" />
          <rect fill="#ef4444" height="34" rx="2" width="9" x="47" y="6" />
        </>
      );
    case "donutChart":
      return (
        <div
          style={{
            background: `conic-gradient(${C} 0 45%, #22c55e 45% 75%, #f59e0b 75%)`,
            borderRadius: "50%",
            height: 38,
            mask: "radial-gradient(circle,transparent 9px,#000 10px)",
            WebkitMask: "radial-gradient(circle,transparent 9px,#000 10px)",
            width: 38,
          }}
        />
      );
    case "lineChart":
      return svg(
        <>
          <path d="M4 38V8" stroke="#cbd5e1" />
          <path d="M4 38h52" stroke="#cbd5e1" />
          <polyline
            fill="none"
            points="6,32 20,20 32,26 46,10 56,14"
            stroke={C}
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </>
      );
    case "table":
      return svg(
        <>
          <rect
            fill="none"
            height="30"
            rx="3"
            stroke="#94a3b8"
            width="52"
            x="4"
            y="7"
          />
          <rect fill="#e2e8f0" height="9" width="52" x="4" y="7" />
          <path d="M4 26h52M22 7v30M40 7v30" stroke="#94a3b8" />
        </>
      );
    case "mockup":
      return svg(
        <>
          <rect
            fill="#fff"
            height="40"
            rx="6"
            stroke="#111"
            strokeWidth="2.5"
            width="22"
            x="19"
            y="2"
          />
          <rect
            fill={C}
            height="30"
            opacity=".35"
            rx="2"
            width="16"
            x="22"
            y="7"
          />
        </>
      );
    case "mediaFrame":
      return (
        <div className="sbl-polaroid">
          <i />
        </div>
      );
    default:
      return <Icon name="layout-template" size={22} />;
  }
}

const plain = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Biblioteca de elementos (como a do Canva): busca, categorias e uma grade de miniaturas. Um clique coloca o
 * elemento na página, depois do bloco selecionado.
 */
export function ElementsPanel({ onAdd }: { onAdd: (type: string) => void }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<BlockGroup | "all">("all");
  const defs = useMemo(() => listBlockDefinitions(), []);
  const q = plain(query.trim());

  const sections = GROUPS.map(g => ({
    ...g,
    items: defs.filter(
      d => d.group === g.id && (!q || plain(d.label).includes(q))
    ),
  })).filter(s => s.items.length > 0 && (group === "all" || group === s.id));

  return (
    <div className="sbe-scroll">
      <div className="sbe-pad sbl">
        <label className="sbl-search">
          <Icon name="search" size={14} />
          <input
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar elementos (ex.: gráfico, estrela)"
            type="text"
            value={query}
          />
        </label>
        <div className="sbl-chips">
          {[{ id: "all" as const, label: "Tudo" }, ...GROUPS.slice(0, 5)].map(
            g => (
              <button
                className={group === g.id ? "on" : ""}
                key={g.id}
                onClick={() => setGroup(g.id)}
                type="button"
              >
                {g.label}
              </button>
            )
          )}
        </div>
        {sections.map(s => (
          <section key={s.id}>
            <h4 className="sbe-h">{s.label}</h4>
            <div className="sbl-grid">
              {s.items.map(d => (
                <button
                  key={d.type}
                  onClick={() => onAdd(d.type)}
                  title={`Adicionar: ${d.label}`}
                  type="button"
                >
                  <span className="sbl-thumb">
                    <Thumb type={d.type} />
                  </span>
                  <span className="sbl-name">{d.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {sections.length === 0 ? (
          <p className="sbe-hint">Nenhum elemento com esse nome.</p>
        ) : null}
      </div>
    </div>
  );
}
