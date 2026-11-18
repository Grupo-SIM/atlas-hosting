import { z } from "zod";
import { barSizes, linePoints, parseTable, slices } from "./chart-math.js";
import { defineBlock } from "./define.js";

const str = (d = "") => z.string().default(d).catch(d);
const PALETTE = [
  "#6a5ad8",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];
const item = z.object({
  color: str(""),
  label: str("Item"),
  value: z.coerce.number().default(0).catch(0),
});
const items = (defaults: { label: string; value: number }[]) =>
  z
    .array(item)
    .default(defaults.map(d => ({ ...d, color: "" })))
    .catch(defaults.map(d => ({ ...d, color: "" })));
/** Chave estável de cada item: o nome, mais um número quando o nome se repete. */
const keyed = <T extends { label: string }>(list: T[]) => {
  const seen = new Map<string, number>();
  return list.map(it => {
    const n = (seen.get(it.label) ?? 0) + 1;
    seen.set(it.label, n);
    return { it, key: `${it.label}#${n}` };
  });
};
const colorOf = (c: string, i: number) =>
  c || PALETTE[i % PALETTE.length] || "#6a5ad8";

const DATA_FIELD = (label: string) => ({
  itemFields: [
    { key: "label", kind: "text" as const, label: "Nome" },
    { key: "value", kind: "number" as const, label: "Valor" },
    { key: "color", kind: "color" as const, label: "Cor (vazio = automática)" },
  ],
  key: "items",
  kind: "list" as const,
  label,
});
const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];
const SAMPLE = [
  { label: "Jan", value: 40 },
  { label: "Fev", value: 65 },
  { label: "Mar", value: 50 },
  { label: "Abr", value: 85 },
];

const fmt = (n: number) =>
  Number.isInteger(n)
    ? String(n)
    : n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/** Gráfico de barras (vertical ou horizontal). */
const barChart = defineBlock(
  z.object({
    direction: z
      .enum(["vertical", "horizontal"])
      .default("vertical")
      .catch("vertical"),
    height: z.coerce.number().min(120).max(600).default(240).catch(240),
    items: items(SAMPLE),
    showValues: z.enum(["yes", "no"]).default("yes").catch("yes"),
    title: str("Resultados"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      DATA_FIELD("Barras"),
      {
        key: "direction",
        kind: "select",
        label: "Direção",
        options: [
          { label: "Em pé", value: "vertical" },
          { label: "Deitadas", value: "horizontal" },
        ],
      },
      { key: "height", kind: "number", label: "Altura em px (120–600; em pé)" },
      {
        key: "showValues",
        kind: "select",
        label: "Mostrar os números",
        options: YES_NO,
      },
    ],
    group: "charts",
    label: "Gráfico de barras",
    render: p => {
      const sizes = barSizes(p.items.map(i => i.value));
      return (
        <div className="sb-container sb-chart">
          {p.title ? <h3>{p.title}</h3> : null}
          <div
            className={`sb-bars sb-bars-${p.direction}`}
            style={
              p.direction === "vertical" ? { height: p.height } : undefined
            }
          >
            {keyed(p.items).map(({ it, key }, i) => (
              <div className="sb-bar" key={key}>
                <div className="sb-bar-track">
                  <i
                    style={{
                      background: colorOf(it.color, i),
                      [p.direction === "vertical" ? "height" : "width"]:
                        `${sizes[i]}%`,
                    }}
                  >
                    {p.showValues === "yes" ? <b>{fmt(it.value)}</b> : null}
                  </i>
                </div>
                <span>{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
    type: "barChart",
  }
);

/** Pizza ou rosca, com legenda. */
const donutChart = defineBlock(
  z.object({
    hole: z.enum(["donut", "pie"]).default("donut").catch("donut"),
    items: items([
      { label: "Orgânico", value: 45 },
      { label: "Anúncios", value: 30 },
      { label: "Indicação", value: 25 },
    ]),
    legend: z.enum(["yes", "no"]).default("yes").catch("yes"),
    size: z.coerce.number().min(120).max(480).default(240).catch(240),
    title: str("Origem das visitas"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      DATA_FIELD("Fatias"),
      {
        key: "hole",
        kind: "select",
        label: "Formato",
        options: [
          { label: "Rosca", value: "donut" },
          { label: "Pizza", value: "pie" },
        ],
      },
      { key: "size", kind: "number", label: "Tamanho em px (120–480)" },
      {
        key: "legend",
        kind: "select",
        label: "Mostrar a legenda",
        options: YES_NO,
      },
    ],
    group: "charts",
    label: "Gráfico de pizza",
    render: p => {
      const parts = slices(p.items.map(i => i.value));
      const r = p.hole === "pie" ? 10.5 : 15.9155;
      const sw = p.hole === "pie" ? 21 : 6;
      const c = 2 * Math.PI * r;
      return (
        <div className="sb-container sb-chart sb-donut">
          {p.title ? <h3>{p.title}</h3> : null}
          <svg
            aria-hidden="true"
            height={p.size}
            style={{ transform: "rotate(-90deg)" }}
            viewBox="0 0 42 42"
            width={p.size}
          >
            {keyed(p.items).map(({ it, key }, i) => {
              const s = parts[i];
              if (!s || s.pct <= 0) return null;
              return (
                <circle
                  cx="21"
                  cy="21"
                  fill="none"
                  key={key}
                  r={r}
                  stroke={colorOf(it.color, i)}
                  strokeDasharray={`${(s.pct * c) / 100} ${c}`}
                  strokeDashoffset={-(s.from * c) / 100}
                  strokeWidth={sw}
                />
              );
            })}
          </svg>
          {p.legend === "yes" ? (
            <ul className="sb-legend">
              {keyed(p.items).map(({ it, key }, i) => (
                <li key={key}>
                  <i style={{ background: colorOf(it.color, i) }} />
                  <span>{it.label}</span>
                  <b>{`${fmt(Math.round((parts[i]?.pct ?? 0) * 10) / 10)}%`}</b>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    },
    type: "donutChart",
  }
);

/** Gráfico de linha. */
const lineChart = defineBlock(
  z.object({
    area: z.enum(["yes", "no"]).default("yes").catch("yes"),
    color: str("#6a5ad8"),
    items: items(SAMPLE),
    showValues: z.enum(["yes", "no"]).default("yes").catch("yes"),
    title: str("Evolução"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      DATA_FIELD("Pontos"),
      { key: "color", kind: "color", label: "Cor da linha" },
      {
        key: "area",
        kind: "select",
        label: "Pintar embaixo da linha",
        options: YES_NO,
      },
      {
        key: "showValues",
        kind: "select",
        label: "Mostrar os números",
        options: YES_NO,
      },
    ],
    group: "charts",
    label: "Gráfico de linha",
    render: p => {
      const W = 300;
      const H = 140;
      const pts = linePoints(
        p.items.map(i => i.value),
        W,
        H,
        14
      );
      const path = pts
        .map(q => `${q.x.toFixed(1)},${q.y.toFixed(1)}`)
        .join(" ");
      const first = pts[0];
      const last = pts[pts.length - 1];
      return (
        <div className="sb-container sb-chart sb-line">
          {p.title ? <h3>{p.title}</h3> : null}
          <svg
            aria-hidden="true"
            preserveAspectRatio="none"
            viewBox={`0 0 ${W} ${H}`}
          >
            {p.area === "yes" && first && last ? (
              <polygon
                fill={p.color}
                opacity=".15"
                points={`${first.x},${H - 14} ${path} ${last.x},${H - 14}`}
              />
            ) : null}
            <polyline
              fill="none"
              points={path}
              stroke={p.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="sb-line-labels">
            {keyed(p.items).map(({ it, key }) => (
              <span key={key}>
                {it.label}
                {p.showValues === "yes" ? <b>{fmt(it.value)}</b> : null}
              </span>
            ))}
          </div>
        </div>
      );
    },
    type: "lineChart",
  }
);

/** Tabela (planilha): cole direto do Excel ou do Google Planilhas. */
const table = defineBlock(
  z.object({
    align: z.enum(["left", "center"]).default("left").catch("left"),
    bordered: z.enum(["yes", "no"]).default("yes").catch("yes"),
    caption: str(""),
    data: str(
      "Produto\tPreço\tEstoque\nCamiseta\tR$ 59\t120\nBoné\tR$ 39\t80\nCaneca\tR$ 29\t200"
    ),
    header: z.enum(["yes", "no"]).default("yes").catch("yes"),
    striped: z.enum(["yes", "no"]).default("yes").catch("yes"),
  }),
  {
    fields: [
      {
        key: "data",
        kind: "textarea",
        label:
          "Dados (uma linha por linha da tabela; cole da planilha, ou separe as colunas com | ou ;)",
      },
      {
        key: "header",
        kind: "select",
        label: "Primeira linha é o cabeçalho",
        options: YES_NO,
      },
      {
        key: "striped",
        kind: "select",
        label: "Linhas alternadas",
        options: YES_NO,
      },
      {
        key: "bordered",
        kind: "select",
        label: "Linhas de divisão",
        options: YES_NO,
      },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento do texto",
        options: [
          { label: "Esquerda", value: "left" },
          { label: "Centro", value: "center" },
        ],
      },
      { key: "caption", kind: "text", label: "Legenda (opcional)" },
    ],
    group: "charts",
    label: "Tabela",
    render: p => {
      const rows = parseTable(p.data);
      const head = p.header === "yes" ? rows[0] : undefined;
      const body = head ? rows.slice(1) : rows;
      return (
        <div className="sb-container sb-table-wrap">
          <table
            className={[
              "sb-table",
              p.striped === "yes" ? "striped" : "",
              p.bordered === "yes" ? "bordered" : "",
              p.align === "center" ? "center" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {p.caption ? <caption>{p.caption}</caption> : null}
            {head ? (
              <thead>
                <tr>
                  {head.map((c, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: células de planilha não têm id
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {body.map((r, ri) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: linhas de planilha não têm id
                <tr key={ri}>
                  {r.map((c, ci) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: células de planilha não têm id
                    <td key={ci}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    type: "table",
  }
);

export const chartBlocks = [barChart, donutChart, lineChart, table];
