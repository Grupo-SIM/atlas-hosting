import { Fragment, type ReactNode } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { href, newTab } from "./helpers.js";
import { screenFields, screenSchema, screenStyle } from "./screens.js";
import { carFields, carSchema, SiCar, str } from "./sim-lib.js";
import type { BlockDefinition, FieldDef } from "./types.js";

/**
 * Blocos da página de vendas "757 Presets" (prefixo `p7`, escopo `.sb-p7`, CSS em `renderer/presets.ts`). Todo texto,
 * imagem e link é prop. Textos aceitam marcação leve (`rich`): `[[rosa]]`, `{{vermelho}}`, `**negrito**`, `__sublinhado__`,
 * `~~riscado~~` e `*itálico*`. Fundo e altura do hero têm valores por tela (`blocks/screens.tsx`, variáveis `--p7-*`).
 *
 * Ordem dos filhos (da qual dependem os caminhos de `Block.fx`; `1` é sempre a seção):
 * - `p7Hero`: `1.1` coluna vazia; `1.2` coluna do texto com `1.2.1` (`.1` título) e `1.2.2` (`.1` botão).
 * - `p7Compare`: `1.1` título (`.1`), `1.2` frase (`.1`), depois uma linha `1.R` por 3 comparadores (`1.R.C.1` = comparador),
 *   e por último o contêiner do botão (`.1` = botão).
 * - `p7About`: `1.1` título (`.1`); `1.2` linha com `1.2.1` imagem (`.1`) e `1.2.2` texto.
 * - `p7Secrets`: `1.1` título (`.1`) e texto (`.2`); linhas `1.R` de 3 cartões `1.R.C` = `.1` imagem, `.2` título, `.3` texto.
 * - `p7How`: `1.1` título (`.1`) e texto (`.2`); `1.2` imagem; `1.3` botão (`.1`).
 * - `p7Proof`: `1.1` título (`.1`); `1.2`/`1.3` linhas de 3 prints (`1.R.C.1` = imagem); `1.4` título do Instagram; `1.5` perfis.
 * - `p7Goals`: `1.1` título (`.1`); `1.2` grade com `1.2.G.C` cartões (`.1` ícone, `.2` corpo com `.2.1` título e `.2.2` texto).
 * - `p7Packs`: `1.1` título; `1.2` carrossel; `1.3` botão (`.1`).
 * - `p7Access`: `1.1` coluna com `.1` título, `.2` frase, `.3` contador, `.4` botão (`.1`).
 * - `p7Price`: `1.1` linha com `1.1.1` cartão (`.1` título, `.2` miolo com `.1` preço, `.2` lista e `.3` frase, `.3` botão) e
 *   `1.1.2` coluna da promoção (`.1` título, `.2` contador, `.3` cashback).
 * - `p7Faq`: `1.1` caixa com `.1` título e `.2` lista.
 */

/* ───────────────────────── peças comuns ───────────────────────── */

const TOKENS = /(\[\[.+?\]\]|\{\{.+?\}\}|\*\*.+?\*\*|__.+?__|~~.+?~~|\*.+?\*)/g;

/** Marcação leve → elementos. Texto sem marcação passa direto. */
export function rich(text: string): ReactNode {
  return text.split(TOKENS).map((part, i) => {
    const key = `${i}-${part.slice(0, 8)}`;
    if (part.startsWith("[[") && part.endsWith("]]"))
      return (
        <span className="p7-pk" key={key}>
          {part.slice(2, -2)}
        </span>
      );
    if (part.startsWith("{{") && part.endsWith("}}"))
      return (
        <span className="p7-red" key={key}>
          {part.slice(2, -2)}
        </span>
      );
    if (part.startsWith("**") && part.endsWith("**"))
      return <b key={key}>{rich(part.slice(2, -2))}</b>;
    if (part.startsWith("__") && part.endsWith("__"))
      return <u key={key}>{rich(part.slice(2, -2))}</u>;
    if (part.startsWith("~~") && part.endsWith("~~"))
      return <del key={key}>{part.slice(2, -2)}</del>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={key}>{rich(part.slice(1, -1))}</em>;
    return <Fragment key={key}>{part}</Fragment>;
  });
}

const lineList = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

const chunk3 = <T,>(items: T[]): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
  return rows;
};

const imgItems = z
  .array(z.object({ alt: str(), url: str() }))
  .default([])
  .catch([]);

function Btn({
  className = "",
  ctx,
  label,
  style = "gradient",
  url,
}: {
  className?: string;
  ctx: Parameters<typeof href>[0];
  label: string;
  style?: "flat" | "gradient";
  url: string;
}) {
  if (!label) return null;
  return (
    <div className="p7-btn-row">
      <a
        className={`p7-btn ${style === "flat" ? "flat" : ""} ${className}`.trim()}
        href={href(ctx, url)}
        {...newTab(url)}
      >
        {label}
      </a>
    </div>
  );
}

const btnStyle = z
  .enum(["gradient", "flat"])
  .default("gradient")
  .catch("gradient");
const btnFields = (prefix = "button", withStyle = false): FieldDef[] => [
  { key: `${prefix}Label`, kind: "text", label: "Texto do botão" },
  { key: `${prefix}Url`, kind: "url", label: "Link do botão" },
  ...(withStyle
    ? ([
        {
          key: `${prefix}Style`,
          kind: "select",
          label: "Fundo do botão",
          options: [
            { label: "Degradê roxo", value: "gradient" },
            { label: "Sem fundo", value: "flat" },
          ],
        },
      ] as FieldDef[])
    : []),
];

/* ───────────────────────── hero ───────────────────────── */

const p7Hero = defineBlock(
  z.object({
    ...screenSchema({ h: 894, hm: 640, ht: 471 }),
    buttonLabel: str("QUERO FOTOS PROFISSIONAIS"),
    buttonUrl: str("#pt1"),
    title: str("Fotos [[cinematográficas]] com apenas 1 clique!"),
  }),
  {
    fields: [
      ...screenFields(),
      { key: "title", kind: "text", label: "Título ([[trecho]] = rosa)" },
      ...btnFields(),
    ],
    group: "content",
    label: "Hero (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-hero" style={screenStyle(p, "p7")}>
        <div className="p7-hero-l" />
        <div className="p7-hero-r">
          <div className="p7-c w72">
            <h2 className="p7-h p7-hero-h">{rich(p.title)}</h2>
          </div>
          <div className="p7-c w57">
            <Btn
              className="hero"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
        </div>
      </section>
    ),
    type: "p7Hero",
  }
);

/* ───────────────────────── comparador antes/depois ───────────────────────── */

const compareItems = z
  .array(z.object({ after: str(), alt: str(), before: str() }))
  .default([])
  .catch([]);

const p7Compare = defineBlock(
  z.object({
    buttonLabel: str("QUERO FOTOS PROFISSIONAIS"),
    buttonUrl: str("#pt1"),
    items: compareItems,
    labelAfter: str("Depois"),
    labelBefore: str("Antes"),
    text: str("Transforme fotos normais em fotos de cinema, veja a diferença:"),
    title: str("Leve suas fotos para o próximo nível"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Frase" },
      { key: "labelBefore", kind: "text", label: "Rótulo da foto de antes" },
      { key: "labelAfter", kind: "text", label: "Rótulo da foto de depois" },
      {
        itemFields: [
          { key: "before", kind: "image", label: "Foto de antes" },
          { key: "after", kind: "image", label: "Foto de depois" },
          { key: "alt", kind: "text", label: "Descrição" },
        ],
        key: "items",
        kind: "list",
        label: "Comparações (3 por linha)",
      },
      ...btnFields(),
    ],
    group: "content",
    label: "Antes e depois (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-sec p7-cmp-sec">
        <div className="p7-c w53">
          <h2 className="p7-h">{rich(p.title)}</h2>
        </div>
        <div className="p7-c w69">
          <p className="p7-t lead">{rich(p.text)}</p>
        </div>
        {chunk3(p.items).map((row, r) => (
          <div
            className={["p7-row", "p7-cmp-row", r === 0 ? "p7-glow" : ""]
              .filter(Boolean)
              .join(" ")}
            key={r}
          >
            {row.map((it, c) => (
              <div className="p7-c" key={c}>
                <div className="p7-cmp" data-p7-cmp="1">
                  <img alt={it.alt} loading="lazy" src={it.before} />
                  <img
                    alt={it.alt}
                    className="p7-cmp-a"
                    loading="lazy"
                    src={it.after}
                  />
                  <span
                    aria-hidden="true"
                    className="p7-cmp-lab b"
                    data-t={p.labelBefore}
                  />
                  <span
                    aria-hidden="true"
                    className="p7-cmp-lab a"
                    data-t={p.labelAfter}
                  />
                  <div
                    aria-label="Comparar antes e depois"
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={50}
                    className="p7-cmp-h"
                    role="slider"
                    tabIndex={0}
                  >
                    <i className="l" />
                    <i className="r" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="p7-c">
          <Btn
            className="cta"
            ctx={ctx}
            label={p.buttonLabel}
            url={p.buttonUrl}
          />
        </div>
      </section>
    ),
    type: "p7Compare",
  }
);

/* ───────────────────────── o que é ───────────────────────── */

const p7About = defineBlock(
  z.object({
    image: str(),
    imageAlt: str(),
    text: str(
      "É um pacote no Lightroom recheado de filtros de cinema prontos para editar as suas fotos, sejam elas na praia, na cidade, dentro de casa ou em áreas externas, só que o mais incrível é que tudo isso acontece com apenas 1 clique. "
    ),
    title: str("O que é o 757 Presets?"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "image", kind: "image", label: "Imagem" },
      { key: "imageAlt", kind: "text", label: "Descrição da imagem" },
      { key: "text", kind: "textarea", label: "Texto" },
    ],
    group: "content",
    label: "O que é (757 Presets)",
    render: p => (
      <section className="p7-sec">
        <div className="p7-c w47 sp">
          <h2 className="p7-h">{rich(p.title)}</h2>
        </div>
        <div className="p7-about-row">
          <div className="p7-about-img p7-img p7-glow">
            {p.image ? (
              <img alt={p.imageAlt} loading="lazy" src={p.image} />
            ) : null}
          </div>
          <p className="p7-t p7-about-txt">{rich(p.text)}</p>
        </div>
      </section>
    ),
    type: "p7About",
  }
);

/* ───────────────────────── segredos ───────────────────────── */

const p7Secrets = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), text: str(), title: str() }))
      .default([])
      .catch([]),
    text: str(),
    title: str("Os segredos que ninguém te conta"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Segredos (3 por linha)",
      },
    ],
    group: "content",
    label: "Segredos do e-book (757 Presets)",
    render: p => (
      <section className="p7-sec">
        <div className="p7-c w45 sp">
          <h2 className="p7-h p7-sec-h">{rich(p.title)}</h2>
          {p.text ? <p className="p7-t p7-sec-txt">{rich(p.text)}</p> : null}
        </div>
        {chunk3(p.items).map((row, r) => (
          <div className="p7-sc-row" key={r}>
            {row.map((it, c) => (
              <div className="p7-sc-card" key={c}>
                <div className="p7-img">
                  {it.image ? (
                    <img alt={it.title} loading="lazy" src={it.image} />
                  ) : null}
                </div>
                <p className="p7-t p7-sc-t">
                  <b>{it.title}</b>
                </p>
                <p className="p7-t p7-sc-d">{rich(it.text)}</p>
              </div>
            ))}
          </div>
        ))}
      </section>
    ),
    type: "p7Secrets",
  }
);

/* ───────────────────────── como funciona ───────────────────────── */

const p7How = defineBlock(
  z.object({
    buttonLabel: str("QUERO FOTOS PROFISSIONAIS"),
    buttonUrl: str("#pt1"),
    image: str(),
    imageAlt: str(),
    text: str(),
    title: str("Como funciona:"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "image", kind: "image", label: "Imagem" },
      { key: "imageAlt", kind: "text", label: "Descrição da imagem" },
      ...btnFields(),
    ],
    group: "content",
    label: "Como funciona (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-sec">
        <div className="p7-how p7-glow">
          <div className="p7-how-top">
            <h2 className="p7-h p7-how-h">{rich(p.title)}</h2>
            <p className="p7-t p7-how-t">{rich(p.text)}</p>
          </div>
          <div className="p7-img p7-how-img">
            {p.image ? (
              <img alt={p.imageAlt} loading="lazy" src={p.image} />
            ) : null}
          </div>
          <div className="p7-c">
            <Btn
              className="cta"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
        </div>
      </section>
    ),
    type: "p7How",
  }
);

/* ───────────────────────── depoimentos + Instagram ───────────────────────── */

const p7Proof = defineBlock(
  z.object({
    igTitle: str("Instagram de clientes:"),
    images: imgItems,
    profiles: z
      .array(
        z.object({
          image: str(),
          label: str("Conferir"),
          name: str(),
          url: str(),
        })
      )
      .default([])
      .catch([]),
    title: str("O que dizem sobre os Packs?"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "url", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Descrição" },
        ],
        key: "images",
        kind: "list",
        label: "Depoimentos (3 por linha)",
      },
      { key: "igTitle", kind: "text", label: "Título dos perfis" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome do perfil" },
          { key: "label", kind: "text", label: "Texto do botão" },
          { key: "url", kind: "url", label: "Link do perfil" },
        ],
        key: "profiles",
        kind: "list",
        label: "Perfis",
      },
    ],
    group: "content",
    label: "Depoimentos e Instagram (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-sec">
        <div className="p7-c w47 sp p7-proof-h">
          <h2 className="p7-h">{rich(p.title)}</h2>
        </div>
        <div className="p7-proof-rows">
          {chunk3(p.images).map((row, r) => (
            <div className="p7-proof-row" key={r}>
              {row.map((it, c) => (
                <div className="p7-c p7-img" key={c}>
                  <img alt={it.alt} loading="lazy" src={it.url} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="p7-ig-head">
          <h2 className="p7-h p7-ig-h">{rich(p.igTitle)}</h2>
        </div>
        <div className="p7-ig-row">
          {p.profiles.map((pr, i) => (
            <div className="p7-c" key={i}>
              <div className="p7-ig">
                <div className="p7-ig-img">
                  {pr.image ? (
                    <img alt={pr.name} loading="lazy" src={pr.image} />
                  ) : null}
                </div>
                <div className="p7-ig-body">
                  <div className="p7-ig-in">
                    <h3 className="p7-ig-name">{pr.name}</h3>
                  </div>
                  <div className="p7-ig-foot">
                    <a
                      className="p7-ig-btn"
                      href={href(ctx, pr.url)}
                      {...newTab(pr.url)}
                    >
                      {pr.label}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "p7Proof",
  }
);

/* ───────────────────────── para quem + pacotes ───────────────────────── */

const GOAL_ICONS: Record<string, ReactNode> = {
  lock: (
    <svg aria-hidden="true" viewBox="3.5 1 17 22">
      <rect height="10" rx="1.6" width="14" x="5" y="11" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="15.8" r="1.4" />
      <path d="M12 17.2v1.6" />
    </svg>
  ),
  phone: (
    <svg aria-hidden="true" viewBox="5 1 14 22">
      <rect height="20" rx="1.8" width="11" x="6.5" y="2" />
      <path d="M6.5 5.5h11M6.5 18.5h11" />
      <circle cx="12" cy="20.2" r=".3" />
    </svg>
  ),
  photo: (
    <svg aria-hidden="true" className="solid" viewBox="1.5 1.5 21 21">
      <path
        d="M9 2h12.2a.8.8 0 0 1 .8.8V15a.8.8 0 0 1-.8.8H9a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 9 2zm2 2v2h2V4zm4 0v2h2V4zm4 0v2h2V4zm-8 4v2h2V8zm4 0v2h2V8zm4 0v2h2V8zm-8 4v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2z"
        fillRule="evenodd"
      />
      <path
        d="M2.8 9.5h12.4a.8.8 0 0 1 .8.8v11a.8.8 0 0 1-.8.8H2.8a.8.8 0 0 1-.8-.8v-11a.8.8 0 0 1 .8-.8zM4 19.2l3.4-4.6 2.5 3.2 1.6-1.9 2.5 3.3zM7 12.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"
        fillRule="evenodd"
      />
    </svg>
  ),
  user: (
    <svg aria-hidden="true" viewBox="1.5 3 21 19">
      <path d="M8.2 8a3.8 3.8 0 0 1 7.6 0v1.4a3.8 3.8 0 0 1-7.6 0z" />
      <path d="M8.5 13.4 4.8 15c-1.2.6-1.9 1.6-1.9 3v3.2h18.2V18c0-1.4-.7-2.4-1.9-3l-3.7-1.6" />
      <path d="m9.5 14.8 2.5 3.4 2.5-3.4" />
    </svg>
  ),
};

const p7Goals = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          icon: z
            .enum(["user", "phone", "photo", "lock"])
            .default("user")
            .catch("user"),
          text: str(),
          tight: z.enum(["no", "yes"]).default("no").catch("no"),
          title: str(),
        })
      )
      .default([])
      .catch([]),
    title: str("Nossos Presets foram [[criados pra você]] que:"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título ([[trecho]] = rosa)" },
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: [
              { label: "Pessoa", value: "user" },
              { label: "Celular", value: "phone" },
              { label: "Fotos e vídeo", value: "photo" },
              { label: "Cadeado", value: "lock" },
            ],
          },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          {
            key: "tight",
            kind: "select",
            label: "Texto mais estreito e mais alto",
            options: [
              { label: "Não", value: "no" },
              { label: "Sim", value: "yes" },
            ],
          },
        ],
        key: "items",
        kind: "list",
        label: "Objetivos (2 por grupo)",
      },
    ],
    group: "content",
    label: "Criados pra você (757 Presets)",
    render: p => {
      const groups: (typeof p.items)[] = [];
      for (let i = 0; i < p.items.length; i += 2)
        groups.push(p.items.slice(i, i + 2));
      return (
        <section className="p7-sec">
          <div className="p7-c w78 sp">
            <h2 className="p7-h p7-goals-h">{rich(p.title)}</h2>
          </div>
          <div className="p7-goals">
            {groups.map((g, gi) => (
              <div className="p7-goals-grp" key={gi}>
                {g.map((it, i) => (
                  <div
                    className={["p7-goal", it.tight === "yes" ? "tight" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    key={i}
                  >
                    <div className="p7-goal-ic">{GOAL_ICONS[it.icon]}</div>
                    <div className="p7-goal-body">
                      <h2 className="p7-goal-t">{it.title}</h2>
                      <h2 className="p7-goal-d">{rich(it.text)}</h2>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    },
    type: "p7Goals",
  }
);

const p7Packs = defineBlock(
  z.object({
    ...carSchema({
      delay: 5000,
      gap: 12,
      perView: 3,
      perViewMobile: 1,
      perViewTablet: 2,
      speed: 500,
    }),
    buttonLabel: str("QUERO FOTOS PROFISSIONAIS"),
    buttonUrl: str("#pt1"),
    images: imgItems,
    title: str(
      "Ao todo são mais de 100 opções para você transformar fotos normais em fotos de cinema!"
    ),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "url", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Descrição" },
        ],
        key: "images",
        kind: "list",
        label: "Imagens do carrossel",
      },
      ...carFields(),
      ...btnFields(),
    ],
    group: "content",
    label: "Carrossel de packs (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-sec">
        <div className="p7-c p7-packs">
          <h2 className="p7-h">{rich(p.title)}</h2>
          <div className="p7-car-wrap p7-car">
            <SiCar
              arrows="inside"
              dots
              items={p.images.map(it => (
                <img alt={it.alt} loading="lazy" src={it.url} />
              ))}
              p={p}
            />
          </div>
          <div className="p7-c">
            <Btn
              className="cta rb"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
        </div>
      </section>
    ),
    type: "p7Packs",
  }
);

const p7Note = defineBlock(
  z.object({
    items: str("Cinemático;\nTokyo;\nAutomotive."),
    text: str(
      "Se você adquirir o Pack Cinemático virá incluso o pack Tokyo, Automotive e o livro digital, somando **3 bônus exclusivos.**"
    ),
    title: str("__**Oferecemos 3 Packs:**__"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "items", kind: "textarea", label: "Lista (um item por linha)" },
      { key: "text", kind: "textarea", label: "Texto final" },
    ],
    group: "content",
    label: "Lista de packs (757 Presets)",
    render: p => (
      <section className="p7-sec p7-flush">
        <div className="p7-note">
          <div className="p7-note-in">
            <p>{rich(p.title)}</p>
            <ul>
              {lineList(p.items).map(l => (
                <li key={l}>{rich(l)}</li>
              ))}
            </ul>
            <p>{rich(p.text)}</p>
          </div>
        </div>
      </section>
    ),
    type: "p7Note",
  }
);

/* ───────────────────────── contador ───────────────────────── */

/** `endsAt` (ISO) → segundos desde 1970 (o `fx-runtime` conta até lá); data inválida = sem contagem. */
const epoch = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? undefined : Math.floor(t / 1000);
};

function Countdown({
  className = "",
  endsAt,
  labels,
}: {
  className?: string;
  endsAt: string;
  labels: [string, string, string];
}) {
  const units = ["h", "m", "s"] as const;
  return (
    <div className={`p7-cd ${className}`.trim()} data-p7-cd={epoch(endsAt)}>
      {units.map((u, i) => (
        <div className="p7-cd-item" key={u}>
          <span className="p7-cd-n" data-u={u}>
            00
          </span>{" "}
          <span className="p7-cd-l">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

const p7Access = defineBlock(
  z.object({
    buttonLabel: str("QUERO GARANTIR MEU PACK"),
    buttonUrl: str("#pt1"),
    endsAt: str("2026-12-10T10:20:00Z"),
    sub: str("Promoção acaba em:"),
    title: str("Garanta Seu Acesso!"),
    units: str("H, Min, Seg"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (contorno roxo)" },
      { key: "sub", kind: "text", label: "Frase acima do contador" },
      {
        key: "units",
        kind: "text",
        label:
          "Nomes do contador (horas, minutos, segundos, separados por vírgula)",
      },
      {
        key: "endsAt",
        kind: "text",
        label: "Fim da promoção (AAAA-MM-DDTHH:MM:SSZ, UTC)",
      },
      ...btnFields(),
    ],
    group: "content",
    label: "Garanta seu acesso (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-access">
        <div className="p7-access-in">
          <h2 className="p7-access-h">{p.title}</h2>
          <h2 className="p7-access-sub">{p.sub}</h2>
          <div className="p7-cd-box">
            <Countdown
              className="xl"
              endsAt={p.endsAt}
              labels={unitLabels(p.units)}
            />
          </div>
          <Btn
            className="cta rb"
            ctx={ctx}
            label={p.buttonLabel}
            style="flat"
            url={p.buttonUrl}
          />
        </div>
      </section>
    ),
    type: "p7Access",
  }
);

/* ───────────────────────── cartão de preço ───────────────────────── */

const CHECK = (
  <svg aria-hidden="true" viewBox="0 0 512 512">
    <path d="M173.9 439.4 7.5 273c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2L210.1 439.4c-10 10-26.2 10-36.2 0z" />
  </svg>
);

/** "H, Min, Seg" → as três legendas do contador (o que faltar usa o padrão). */
const unitLabels = (raw: string): [string, string, string] => {
  const [h, m, sec] = raw.split(",").map(x => x.trim());
  return [h || "H", m || "Min", sec || "Seg"];
};

const p7Price = defineBlock(
  z.object({
    buyLabel: str("ADQUIRIR AGORA"),
    buyStyle: btnStyle.catch("flat").default("flat"),
    buyUrl: str(),
    cashbackText: str("Instantaneamente após a compra."),
    cashbackTitle: str("100% DE CASHBACK!"),
    endsAt: str("2026-12-10T10:20:00Z"),
    features: str(
      "Passo a passo em video;\nLivro digital incluso;\nSuporte humanizado;\n+2 packs inclusos."
    ),
    from: str("R$99,00"),
    note: str(
      "Se você busca diferenciar-se e aumentar a qualidade visual das suas fotos, está no lugar certo."
    ),
    price: str("R$69,99"),
    priceLabelAfter: str("por apenas"),
    priceLabelBefore: str("de"),
    promoTitle: str("Promoção por tempo {{limitado!}}"),
    title: str("ACESSO VITALÍCIO"),
    units: str("H, Min, Seg"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título do cartão" },
      { key: "priceLabelBefore", kind: "text", label: "Antes do preço antigo" },
      { key: "from", kind: "text", label: "Preço antigo (riscado)" },
      { key: "priceLabelAfter", kind: "text", label: "Depois do preço antigo" },
      { key: "price", kind: "text", label: "Preço" },
      { key: "features", kind: "textarea", label: "Vantagens (uma por linha)" },
      { key: "note", kind: "textarea", label: "Frase do cartão" },
      { key: "buyLabel", kind: "text", label: "Texto do botão de compra" },
      {
        key: "units",
        kind: "text",
        label:
          "Nomes do contador (horas, minutos, segundos, separados por vírgula)",
      },
      { key: "buyUrl", kind: "url", label: "Link do botão de compra" },
      {
        key: "buyStyle",
        kind: "select",
        label: "Fundo do botão de compra",
        options: [
          { label: "Sem fundo", value: "flat" },
          { label: "Degradê roxo", value: "gradient" },
        ],
      },
      {
        key: "promoTitle",
        kind: "text",
        label: "Título da promoção ({{trecho}} = vermelho)",
      },
      {
        key: "endsAt",
        kind: "text",
        label: "Fim da promoção (AAAA-MM-DDTHH:MM:SSZ, UTC)",
      },
      { key: "cashbackTitle", kind: "text", label: "Título do cashback" },
      { key: "cashbackText", kind: "text", label: "Texto do cashback" },
    ],
    group: "content",
    label: "Oferta e preço (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-price">
        <div className="p7-price-row">
          <div className="p7-card">
            <div className="p7-card-top">
              <h2 className="p7-offer-title">{rich(p.title)}</h2>
            </div>
            <div className="p7-offer-mid">
              <div>
                <p className="p7-offer-from">
                  <span>
                    {p.priceLabelBefore} <del>{p.from}</del> {p.priceLabelAfter}
                  </span>
                </p>
                <h1 className="p7-offer-price">{p.price}</h1>
              </div>
              <ul className="p7-checks">
                {lineList(p.features).map(l => (
                  <li key={l}>
                    {CHECK}
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
              <h2 className="p7-offer-note">{rich(p.note)}</h2>
            </div>
            <div className="p7-card-btn">
              <Btn
                className="buy"
                ctx={ctx}
                label={p.buyLabel}
                style={p.buyStyle}
                url={p.buyUrl}
              />
            </div>
          </div>
          <div className="p7-offer">
            <div className="p7-promo">
              <h2 className="p7-h p7-promo-h">{rich(p.promoTitle)}</h2>
            </div>
            <Countdown
              className="sm"
              endsAt={p.endsAt}
              labels={unitLabels(p.units)}
            />
            <div className="p7-cb-wrap">
              <div className="p7-cb">
                <h2 className="p7-cb-t">{p.cashbackTitle}</h2>
                <h2 className="p7-cb-d">{p.cashbackText}</h2>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "p7Price",
  }
);

/* ───────────────────────── perguntas frequentes ───────────────────────── */

const p7Faq = defineBlock(
  z.object({
    items: z
      .array(z.object({ answer: str(), question: str() }))
      .default([])
      .catch([]),
    title: str("Perguntas frequentes"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "question", kind: "text", label: "Pergunta" },
          { key: "answer", kind: "textarea", label: "Resposta" },
        ],
        key: "items",
        kind: "list",
        label: "Perguntas",
      },
    ],
    group: "content",
    label: "Perguntas frequentes (757 Presets)",
    render: p => (
      <section className="p7-faq">
        <div className="p7-faq-wrap">
          <h2 className="p7-h p7-faq-h">{rich(p.title)}</h2>
          <div className="p7-faq-list">
            {p.items.map((it, i) => (
              <details className="p7-faq-item" key={i}>
                <summary>
                  <span aria-hidden="true" className="p7-faq-ic" />
                  <span>{it.question}</span>
                </summary>
                <div className="p7-faq-a">
                  <p>{rich(it.answer)}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
        <div className="p7-faq-spacer" />
      </section>
    ),
    type: "p7Faq",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const p7Footer = defineBlock(
  z.object({
    linkLabel: str("Política de devolução"),
    linkUrl: str("/politica-de-devolucao/"),
    note: str(
      "**PIRATARIA É CRIME!** A venda dos produtos *757 Presets Brasil* só pode ser realizada através deste site, registrado em nome de SIM INTERMEDIACOES LTDA, CNPJ: 38.486.051/0001-48 . Qualquer outro site onde você encontre este programa é uma FALSIFICAÇÃO, recuse conteúdos ilegais ou pirateados. Não nos responsabilizamos por compras realizadas em outros sites."
    ),
    title: str("SIM Intermediações © - Todos os direitos reservados."),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Linha de copyright" },
      { key: "note", kind: "textarea", label: "Aviso" },
      { key: "linkLabel", kind: "text", label: "Texto do link" },
      { key: "linkUrl", kind: "url", label: "Link" },
    ],
    group: "layout",
    label: "Rodapé (757 Presets)",
    render: (p, ctx) => (
      <footer className="p7-foot">
        <h2 className="p7-foot-h">{p.title}</h2>
        <div className="p7-foot-in">
          <p className="p7-foot-note">{rich(p.note)}</p>
          {p.linkLabel ? (
            <p className="p7-foot-link">
              <a href={href(ctx, p.linkUrl)}>{p.linkLabel}</a>
            </p>
          ) : null}
        </div>
      </footer>
    ),
    type: "p7Footer",
  }
);

/* ───────────────────────── página interna ───────────────────────── */

const p7Page = defineBlock(
  z.object({
    backLabel: str("VOLTAR PARA PÁGINA PRINCIPAL"),
    backUrl: str("/"),
    contact: str(),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (um parágrafo por linha)",
      },
      {
        key: "contact",
        kind: "textarea",
        label: "Contato (uma linha por item)",
      },
      ...btnFields("back"),
    ],
    group: "content",
    label: "Página interna (757 Presets)",
    render: (p, ctx) => (
      <section className="p7-page">
        <div className="p7-page-in">
          <h1>{p.title}</h1>
          {lineList(p.text).map(l => (
            <p key={l}>{rich(l)}</p>
          ))}
          {lineList(p.contact).map(l => (
            <p key={l}>{rich(l)}</p>
          ))}
          <Btn ctx={ctx} label={p.backLabel} url={p.backUrl} />
        </div>
      </section>
    ),
    type: "p7Page",
  }
);

export const presetsBlocks: BlockDefinition[] = [
  p7Hero,
  p7Compare,
  p7About,
  p7Secrets,
  p7How,
  p7Proof,
  p7Goals,
  p7Packs,
  p7Note,
  p7Access,
  p7Price,
  p7Faq,
  p7Footer,
  p7Page,
];
