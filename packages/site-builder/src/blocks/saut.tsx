import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, newTab } from "./helpers.js";
import {
  Avatar,
  avatarFields,
  avatarItem,
  Btn,
  button,
  CheckBox,
  Count,
  checkFields,
  checkItem,
  cls,
  dotsField,
  headFields,
  ICON_OPTIONS,
  Icon,
  Lines,
  linkFields,
  linkItem,
  Pill,
  paragraphs,
  SocialGlyph,
  str,
  YES_NO,
  yesNo,
} from "./saut-lib.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";

/**
 * Blocos da variante `saut` (template "SAUT — Agência de Marketing e Tecnologia"; CSS em `renderer/saut.ts`, escopo `.sb-sa`).
 * Todo texto, imagem, link e item é prop com campo no editor. Os contadores usam `data-sb-count` (ligado pelo
 * `fx-runtime`; sem JS e no editor a página já traz o valor final), a gaveta do menu é um checkbox (`#sb-burger`)
 * e o padrão de pontos é CSS (`radial-gradient`), sem imagem.
 */

/** Quadrados do cartão "Pontuação de leads": 4 linhas × 15 colunas, 3 tons fixos e pseudoaleatórios. */
const SQUARES = "012210201120212101202102101221020112102110212012102101220112";

function CheckList({ items }: { items: { text: string; title: string }[] }) {
  return (
    <ul className="sa-checks">
      {items.map((it, i) => (
        <li key={it.title + i}>
          <h3>
            <CheckBox />
            {it.title}
          </h3>
          <p>{it.text}</p>
        </li>
      ))}
    </ul>
  );
}

const Head = ({
  center,
  p,
  tone,
}: {
  center?: boolean;
  p: { eyebrow: string; text: string; title: string };
  tone?: "soft" | "white";
}) => (
  <div className={cls("sa-head-t", center && "center")}>
    <Pill tone={tone}>{p.eyebrow}</Pill>
    <h2>{p.title}</h2>
    {p.text ? <p>{p.text}</p> : null}
  </div>
);

/* ───────────────────────── cabeçalho ───────────────────────── */

const saHeader = defineBlock(
  z.object({
    ctaLabel: str("Fale com a SAUT"),
    ctaUrl: str(),
    links: z.array(linkItem).default([]),
    logo: str(),
    logoAlt: str("SAUT Marketing"),
    logoUrl: str("/"),
    sticky: yesNo("no"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logotipo" },
      { key: "logoAlt", kind: "text", label: "Texto alternativo do logotipo" },
      { key: "logoUrl", kind: "url", label: "Link do logotipo" },
      {
        itemFields: linkFields,
        key: "links",
        kind: "list",
        label: "Links do menu",
      },
      ...button("cta", "botão"),
      {
        key: "sticky",
        kind: "select",
        label: "Fixar no topo ao rolar",
        options: YES_NO,
      },
    ],
    group: "layout",
    label: "Cabeçalho (SAUT)",
    render: (p, ctx) => {
      const menu = (c: string) => (
        <ul className={c}>
          {p.links.map((l, i) => (
            <li key={l.label + i}>
              <a href={href(ctx, l.url)} {...newTab(l.url)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      );
      return (
        <header className={cls("sa-head", p.sticky === "yes" && "is-sticky")}>
          <input
            aria-hidden="true"
            className="sa-burger-input"
            id="sb-burger"
            tabIndex={-1}
            type="checkbox"
          />
          <div className="sa-head-box">
            <a className="sa-logo" href={href(ctx, p.logoUrl)}>
              <Img alt={p.logoAlt} src={p.logo} />
            </a>
            <nav aria-label="Menu principal" className="sa-nav">
              {menu("sa-menu")}
            </nav>
            <Btn ctx={ctx} url={p.ctaUrl}>
              {p.ctaLabel}
            </Btn>
            <label
              aria-label="Abrir menu"
              className="sa-burger"
              htmlFor="sb-burger"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </label>
          </div>
          <label className="sa-veil" htmlFor="sb-burger">
            <span className="sa-sr">Fechar menu</span>
          </label>
          <aside aria-label="Menu" className="sa-drawer">
            <label
              aria-label="Fechar menu"
              className="sa-drawer-x"
              htmlFor="sb-burger"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </label>
            <a className="sa-drawer-logo" href={href(ctx, p.logoUrl)}>
              <Img alt={p.logoAlt} src={p.logo} />
            </a>
            {menu("sa-drawer-menu")}
            <Btn ctx={ctx} url={p.ctaUrl}>
              {p.ctaLabel}
            </Btn>
          </aside>
        </header>
      );
    },
    type: "saHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

/** Filhos de `.sa-hero-in` (caminho `1.1.N`): 1 texto, 2 os três cartões (`1.1.2`, cada cartão `1.1.2.N`). */
const saHero = defineBlock(
  z.object({
    background: str(),
    leadsDelta: str("+97,5%"),
    leadsLabel: str("Pontuação de leads"),
    leadsValue: str("1220"),
    leadsWave: yesNo("yes"),
    photo: str(),
    photoAlt: str(),
    pill: str(
      "✨ Marketing, tecnologia e estratégia\npara empresas que querem crescer"
    ),
    primaryLabel: str("Fale com a SAUT"),
    primaryUrl: str(),
    satAvatars: z.array(avatarItem).default([]),
    satLabel: str("Satisfação dos Clientes"),
    satValue: str("95"),
    secondaryLabel: str("Ver serviços"),
    secondaryUrl: str("#servicos"),
    tagLabel: str("Campanhas de sucesso"),
    tagValue: str("230"),
    text: str(),
    title: str(
      "Transformamos visibilidade em oportunidades, clientes e crescimento"
    ),
  }),
  {
    fields: [
      { key: "background", kind: "image", label: "Imagem de fundo (céu)" },
      { key: "pill", kind: "textarea", label: "Pílula (uma linha por quebra)" },
      { key: "title", kind: "text", label: "Título (h1)" },
      { key: "text", kind: "textarea", label: "Parágrafo" },
      ...button("primary", "botão principal"),
      ...button("secondary", "botão secundário"),
      { key: "photo", kind: "image", label: "Cartão 1 — foto" },
      { key: "photoAlt", kind: "text", label: "Cartão 1 — texto alternativo" },
      {
        key: "tagValue",
        kind: "text",
        label: "Cartão 1 — número da etiqueta (conta ao aparecer)",
      },
      { key: "tagLabel", kind: "text", label: "Cartão 1 — texto da etiqueta" },
      { key: "leadsLabel", kind: "text", label: "Cartão 2 — rótulo" },
      { key: "leadsDelta", kind: "text", label: "Cartão 2 — variação" },
      {
        key: "leadsValue",
        kind: "text",
        label: "Cartão 2 — número (conta ao aparecer)",
      },
      {
        key: "leadsWave",
        kind: "select",
        label: "Cartão 2 — quadrados acendem em onda",
        options: YES_NO,
      },
      {
        itemFields: avatarFields,
        key: "satAvatars",
        kind: "list",
        label: "Cartão 3 — avatares",
      },
      {
        key: "satValue",
        kind: "text",
        label: "Cartão 3 — número % (conta ao aparecer)",
      },
      { key: "satLabel", kind: "text", label: "Cartão 3 — texto" },
    ],
    group: "content",
    label: "Hero com cartões de métricas (SAUT)",
    render: (p, ctx) => (
      <section
        className="sa-hero sa-box"
        style={{ backgroundImage: cssUrl(p.background) }}
      >
        <div className="sa-hero-in sa-in">
          <div className="sa-hero-text">
            <Pill tone="glass">
              <span className="sa-pill-lines">
                <Lines text={p.pill} />
              </span>
            </Pill>
            <h1>{p.title}</h1>
            <p>{p.text}</p>
            <div className="sa-hero-btns">
              <Btn ctx={ctx} tone="lime" url={p.primaryUrl}>
                {p.primaryLabel}
              </Btn>
              {p.secondaryLabel ? (
                <a className="sa-btn ghost" href={href(ctx, p.secondaryUrl)}>
                  {p.secondaryLabel}
                </a>
              ) : null}
            </div>
          </div>
          <div className="sa-cards">
            <div className="sa-card sa-c-photo">
              <Img alt={p.photoAlt} src={p.photo} />
              <i className="sa-badge bolt">
                <Icon name="bolt" />
              </i>
              <div className="sa-tag">
                <Count suffix="+" value={p.tagValue} />
                <u aria-hidden="true" />
                <span>{p.tagLabel}</span>
              </div>
            </div>
            <div className="sa-card sa-c-leads">
              <div className="sa-leads-top">
                <span className="sa-pill white">{p.leadsLabel}</span>
                <b>{p.leadsDelta}</b>
              </div>
              <Count className="sa-leads-n" value={p.leadsValue} />
              <div
                aria-hidden="true"
                className={cls("sa-squares", p.leadsWave === "yes" && "wave")}
              >
                {SQUARES.split("").map((t, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: grade fixa
                  <i
                    className={`t${t}`}
                    key={i}
                    style={{ "--i": i } as CSSProperties}
                  />
                ))}
              </div>
            </div>
            <div className="sa-card sa-c-sat">
              <div className="sa-avs">
                {p.satAvatars.map((a, i) => (
                  <Avatar
                    key={a.name + i}
                    name={a.name || "Cliente"}
                    src={a.src}
                  />
                ))}
              </div>
              <Count className="sa-sat-n" suffix="%" value={p.satValue} />
              <span className="sa-sat-l">{p.satLabel}</span>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "saHero",
  }
);

/* ───────────────────────── marcas ───────────────────────── */

const saLogos = defineBlock(
  z.object({
    grayscale: yesNo("no"),
    items: z.array(z.object({ alt: str(), src: str() })).default([]),
    title: str(
      "Marcas que confiam na SAUT para comunicar, posicionar e crescer"
    ),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "src", kind: "image", label: "Logo" },
          { key: "alt", kind: "text", label: "Nome da marca" },
        ],
        key: "items",
        kind: "list",
        label: "Logos",
      },
      {
        key: "grayscale",
        kind: "select",
        label: "Logos em cinza até passar o mouse",
        options: YES_NO,
      },
    ],
    group: "content",
    label: "Faixa de marcas (SAUT)",
    render: p => (
      <section className={cls("sa-logos", p.grayscale === "yes" && "gray")}>
        <div className="sa-in">
          <h2>{p.title}</h2>
          <div className="sa-logo-grid">
            {p.items.map((it, i) => (
              <div className="sa-logo-cell" key={it.alt + i}>
                <Img alt={it.alt} src={it.src} />
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "saLogos",
  }
);

/* ───────────────────────── sobre ───────────────────────── */

/** Filhos de `.sa-about-in` (`1.1.N`): 1 coluna da foto, 2 coluna do texto. */
const saAbout = defineBlock(
  z.object({
    dots: yesNo("yes"),
    eyebrow: str("Sobre a SAUT"),
    floatLabel: str("Crescimento mensal"),
    floatTop: str("+25,5%"),
    floatValue: str("68"),
    items: z.array(checkItem).default([]),
    photo: str(),
    photoAlt: str(),
    text: str(),
    title: str(
      "Construímos estratégias de marketing conectadas aos objetivos reais de cada negócio"
    ),
  }),
  {
    fields: [
      { key: "photo", kind: "image", label: "Foto" },
      { key: "photoAlt", kind: "text", label: "Texto alternativo da foto" },
      { key: "floatTop", kind: "text", label: "Cartão — variação (topo)" },
      {
        key: "floatValue",
        kind: "text",
        label: "Cartão — número % (conta ao aparecer)",
      },
      { key: "floatLabel", kind: "text", label: "Cartão — legenda" },
      { key: "eyebrow", kind: "text", label: "Rótulo (pílula)" },
      { key: "title", kind: "text", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (linha em branco separa os parágrafos)",
      },
      {
        itemFields: checkFields,
        key: "items",
        kind: "list",
        label: "Itens com check",
      },
      dotsField,
    ],
    group: "content",
    label: "Sobre com foto e cartão de crescimento (SAUT)",
    render: p => (
      <section className={cls("sa-about", p.dots === "yes" && "sa-dots")}>
        <div className="sa-about-in sa-in">
          <div className="sa-about-l">
            <div className="sa-about-photo">
              <Img alt={p.photoAlt} src={p.photo} />
            </div>
            <div className="sa-float">
              <span className="sa-float-top">{p.floatTop}</span>
              <Count className="sa-float-n" suffix="%" value={p.floatValue} />
              <span className="sa-float-l">{p.floatLabel}</span>
            </div>
          </div>
          <div className="sa-about-r">
            <Pill>{p.eyebrow}</Pill>
            <h2>{p.title}</h2>
            {paragraphs(p.text).map((t, i) => (
              <p key={t.slice(0, 20) + i}>{t}</p>
            ))}
            <CheckList items={p.items} />
          </div>
        </div>
      </section>
    ),
    type: "saAbout",
  }
);

/* ───────────────────────── serviços ───────────────────────── */

const saServices = defineBlock(
  z.object({
    eyebrow: str("Nossos serviços"),
    items: z
      .array(
        z.object({
          image: str(),
          number: str(),
          text: str(),
          title: str(),
        })
      )
      .default([]),
    text: str(),
    title: str(
      "Uma estrutura completa para construir marcas, gerar demanda e acelerar negócios."
    ),
  }),
  {
    fields: [
      ...headFields([
        {
          itemFields: [
            { key: "number", kind: "text", label: "Selo (vazio = 01, 02…)" },
            { key: "title", kind: "text", label: "Título" },
            { key: "text", kind: "textarea", label: "Texto" },
            { key: "image", kind: "image", label: "Imagem" },
          ],
          key: "items",
          kind: "list",
          label: "Serviços",
        },
      ]),
    ],
    group: "content",
    label: "Serviços em fundo escuro (SAUT)",
    render: p => (
      <section className="sa-services sa-box">
        <div className="sa-in">
          <div className="sa-svc-head">
            <div>
              <Pill>{p.eyebrow}</Pill>
              <h2>{p.title}</h2>
            </div>
            <p>{p.text}</p>
          </div>
          <ol className="sa-svc-list">
            {p.items.map((it, i) => (
              <li className="sa-svc" key={it.title + i}>
                <div className="sa-svc-l">
                  <Pill tone="glass">
                    {it.number || String(i + 1).padStart(2, "0")}
                  </Pill>
                  <h3>{it.title}</h3>
                </div>
                <div className="sa-svc-img">
                  <Img alt={it.title} src={it.image} />
                </div>
                <p className="sa-svc-p">{it.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    ),
    type: "saServices",
  }
);

/* ───────────────────────── como funciona ───────────────────────── */

/** Filhos de `.sa-in` (`1.1.N`): 1 cabeçalho, 2 grade dos passos (`1.1.2`), 3 quadro "Tecnologia potencializada". */
const saProcess = defineBlock(
  z.object({
    dots: yesNo("yes"),
    eyebrow: str("Como funciona"),
    noteBadge: str("Tecnologia potencializada por pessoas"),
    noteText: str(),
    noteTitle: str("Estratégia humana. Execução inteligente."),
    steps: z
      .array(z.object({ icon: str("search"), text: str(), title: str() }))
      .default([]),
    text: str(),
    title: str("Da compreensão do negócio à execução e otimização contínua"),
  }),
  {
    fields: [
      ...headFields([
        {
          itemFields: [
            {
              key: "icon",
              kind: "select",
              label: "Ícone",
              options: ICON_OPTIONS,
            },
            { key: "title", kind: "text", label: "Título" },
            { key: "text", kind: "textarea", label: "Texto" },
          ],
          key: "steps",
          kind: "list",
          label: "Passos",
        },
        { key: "noteBadge", kind: "text", label: "Quadro — selo azul" },
        { key: "noteTitle", kind: "text", label: "Quadro — título" },
        {
          key: "noteText",
          kind: "textarea",
          label: "Quadro — texto (linha em branco separa os parágrafos)",
        },
        dotsField,
      ]),
    ],
    group: "content",
    label: "Como funciona em passos (SAUT)",
    render: p => (
      <section className={cls("sa-process", p.dots === "yes" && "sa-dots")}>
        <div className="sa-in">
          <Head center p={p} />
          <ol className="sa-steps">
            {p.steps.map((s, i) => (
              <li className="sa-step" key={s.title + i}>
                <i className="sa-step-ic">
                  <Icon name={s.icon} />
                </i>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="sa-note">
            <span className="sa-note-badge">{p.noteBadge}</span>
            <h3>{p.noteTitle}</h3>
            {paragraphs(p.noteText).map((t, i) => (
              <p key={t.slice(0, 20) + i}>{t}</p>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "saProcess",
  }
);

/* ───────────────────────── por que escolher ───────────────────────── */

const saWhy = defineBlock(
  z.object({
    avatars: z.array(avatarItem).default([]),
    card1Pill: str("Automação aplicada ao negócio"),
    card1Text: str(),
    card2Label: str("Compatibilidade com o público"),
    card2Text: str(),
    card2Value: str("96,8"),
    card3Badge: str("Experiência"),
    card3Value: str("12"),
    dots: yesNo("yes"),
    eyebrow: str("Por que escolher a SAUT"),
    items: z.array(checkItem).default([]),
    photo: str(),
    photoAlt: str(),
    text: str(),
    title: str("Porque marketing precisa fazer sentido para o negócio"),
  }),
  {
    fields: [
      ...headFields([
        {
          itemFields: checkFields,
          key: "items",
          kind: "list",
          label: "Itens com check",
        },
        { key: "card1Pill", kind: "text", label: "Cartão 1 — pílula" },
        { key: "card1Text", kind: "textarea", label: "Cartão 1 — texto" },
        {
          key: "card2Value",
          kind: "text",
          label: "Cartão 2 — número % (conta ao aparecer)",
        },
        {
          itemFields: avatarFields,
          key: "avatars",
          kind: "list",
          label: "Cartão 2 — avatares",
        },
        { key: "card2Label", kind: "text", label: "Cartão 2 — título" },
        { key: "card2Text", kind: "textarea", label: "Cartão 2 — texto" },
        { key: "photo", kind: "image", label: "Cartão 3 — foto" },
        {
          key: "photoAlt",
          kind: "text",
          label: "Cartão 3 — texto alternativo",
        },
        {
          key: "card3Value",
          kind: "text",
          label: "Cartão 3 — número da etiqueta (conta ao aparecer)",
        },
        {
          key: "card3Badge",
          kind: "text",
          label: "Cartão 3 — texto da etiqueta",
        },
        dotsField,
      ]),
    ],
    group: "content",
    label: "Por que escolher, com 3 cartões (SAUT)",
    render: p => (
      <section className={cls("sa-why sa-box", p.dots === "yes" && "sa-dots")}>
        <div className="sa-in">
          <div className="sa-why-top">
            <div className="sa-why-l">
              <Pill tone="white">{p.eyebrow}</Pill>
              <h2>{p.title}</h2>
              {paragraphs(p.text).map((t, i) => (
                <p key={t.slice(0, 20) + i}>{t}</p>
              ))}
            </div>
            <CheckList items={p.items} />
          </div>
          <div className="sa-why-cards">
            <article
              className={cls("sa-wc", "sa-wc-1", p.dots === "yes" && "sa-dots")}
            >
              <span className="sa-pill outline">{p.card1Pill}</span>
              <p>{p.card1Text}</p>
            </article>
            <article className="sa-wc sa-wc-2">
              <div className="sa-wc-in">
                <div className="sa-wc-top">
                  <Count className="sa-wc-n" suffix="%" value={p.card2Value} />
                  <div className="sa-avs">
                    {p.avatars.map((a, i) => (
                      <Avatar
                        key={a.name + i}
                        name={a.name || "Cliente"}
                        src={a.src}
                      />
                    ))}
                  </div>
                </div>
                <hr />
                <h3>{p.card2Label}</h3>
                <p>{p.card2Text}</p>
              </div>
            </article>
            <article className="sa-wc sa-wc-3">
              <Img alt={p.photoAlt} src={p.photo} />
              <i className="sa-badge shield">
                <Icon name="shield" />
              </i>
              <div className="sa-tag">
                <Count suffix="+" value={p.card3Value} />
                <u aria-hidden="true" />
                <span>{p.card3Badge}</span>
              </div>
            </article>
          </div>
        </div>
      </section>
    ),
    type: "saWhy",
  }
);

/* ───────────────────────── resultados ───────────────────────── */

const saCases = defineBlock(
  z.object({
    cases: z
      .array(
        z.object({
          image: str(),
          pill: str(),
          stats: z
            .array(
              z.object({
                label: str(),
                tone: z
                  .enum(["green", "orange", "blue"])
                  .default("blue")
                  .catch("blue"),
                value: str(),
              })
            )
            .default([]),
          text: str(),
          title: str(),
        })
      )
      .default([]),
    dots: yesNo("yes"),
    eyebrow: str("Resultados que ajudam a contar nossa história"),
    text: str(),
    title: str(
      "Estratégia só importa quando consegue sair do planejamento e gerar movimento"
    ),
  }),
  {
    fields: [
      ...headFields([
        {
          itemFields: [
            { key: "pill", kind: "text", label: "Pílula" },
            { key: "title", kind: "text", label: "Título" },
            { key: "text", kind: "textarea", label: "Texto" },
            {
              itemFields: [
                {
                  key: "value",
                  kind: "text",
                  label: "Destaque (ex.: +11,9 mi)",
                },
                {
                  key: "tone",
                  kind: "select",
                  label: "Cor do destaque",
                  options: [
                    { label: "Verde", value: "green" },
                    { label: "Laranja", value: "orange" },
                    { label: "Azul", value: "blue" },
                  ],
                },
                { key: "label", kind: "text", label: "Legenda" },
              ],
              key: "stats",
              kind: "list",
              label: "Números do case",
            },
            { key: "image", kind: "image", label: "Imagem" },
          ],
          key: "cases",
          kind: "list",
          label: "Cases",
        },
        dotsField,
      ]),
    ],
    group: "content",
    label: "Resultados com 2 cases (SAUT)",
    render: p => (
      <section className={cls("sa-cases", p.dots === "yes" && "sa-dots")}>
        <div className="sa-in">
          <Head center p={p} />
          <div className="sa-case-grid">
            {p.cases.map((c, i) => (
              <article className="sa-case" key={c.title + i}>
                <div className="sa-case-top">
                  <span className="sa-pill soft">
                    <Icon name="folder" />
                    {c.pill}
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <ul className="sa-stats">
                    {c.stats.map((s, k) => (
                      <li key={s.value + k}>
                        <strong className={s.tone}>{s.value}</strong>
                        <span>{s.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="sa-case-img">
                  <Img alt={c.title} src={c.image} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "saCases",
  }
);

/* ───────────────────────── impacto ───────────────────────── */

const saImpact = defineBlock(
  z.object({
    dots: yesNo("yes"),
    eyebrow: str("Nosso impacto"),
    items: z
      .array(
        z.object({
          count: str(),
          prefix: str(),
          suffix: str(),
          text: str(),
          title: str(),
        })
      )
      .default([]),
    photo: str(),
    photoAlt: str(),
    text: str(),
    title: str(
      "Marketing construído para acompanhar empresas que querem avançar"
    ),
  }),
  {
    fields: [
      ...headFields([
        {
          itemFields: [
            { key: "count", kind: "text", label: "Número (conta ao aparecer)" },
            { key: "prefix", kind: "text", label: "Antes do número (ex.: +)" },
            {
              key: "suffix",
              kind: "text",
              label: "Depois do número (ex.: + ou mi+)",
            },
            { key: "title", kind: "text", label: "Título" },
            { key: "text", kind: "textarea", label: "Texto" },
          ],
          key: "items",
          kind: "list",
          label: "Números",
        },
        { key: "photo", kind: "image", label: "Foto" },
        { key: "photoAlt", kind: "text", label: "Texto alternativo da foto" },
        dotsField,
      ]),
    ],
    group: "content",
    label: "Impacto com contadores (SAUT)",
    render: p => (
      <section className={cls("sa-impact", p.dots === "yes" && "sa-dots")}>
        <div className="sa-in">
          <div className="sa-imp-top">
            <div>
              <Pill>{p.eyebrow}</Pill>
              <h2>{p.title}</h2>
            </div>
            <p>{p.text}</p>
          </div>
          <div className="sa-imp-body">
            <div className="sa-imp-grid">
              {p.items.map((it, i) => (
                <div className="sa-imp-n" key={it.title + i}>
                  <Count
                    className="sa-n"
                    prefix={it.prefix}
                    suffix={it.suffix}
                    value={it.count}
                  />
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              ))}
            </div>
            <div className="sa-imp-photo">
              <Img alt={p.photoAlt} src={p.photo} />
            </div>
          </div>
        </div>
      </section>
    ),
    type: "saImpact",
  }
);

/* ───────────────────────── CTA ───────────────────────── */

const saCta = defineBlock(
  z.object({
    badges: z.array(z.object({ label: str() })).default([]),
    buttonLabel: str("Fale com a SAUT"),
    buttonUrl: str(),
    eyebrow: str("Sua empresa está pronta para o próximo nível?"),
    photo: str(),
    photoAlt: str(),
    text: str(),
    title: str(
      "Construa uma estratégia capaz de transformar atenção em crescimento"
    ),
  }),
  {
    fields: [
      { key: "photo", kind: "image", label: "Foto" },
      { key: "photoAlt", kind: "text", label: "Texto alternativo da foto" },
      ...headFields([
        {
          itemFields: [{ key: "label", kind: "text", label: "Texto" }],
          key: "badges",
          kind: "list",
          label: "Selos com check",
        },
        ...button("button", "botão"),
      ]),
    ],
    group: "content",
    label: "Chamada final com foto (SAUT)",
    render: (p, ctx) => (
      <section className="sa-cta">
        <div className="sa-cta-in sa-in">
          <div className="sa-cta-photo">
            <Img alt={p.photoAlt} src={p.photo} />
          </div>
          <div className="sa-cta-r">
            <Pill>{p.eyebrow}</Pill>
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <ul className="sa-badges">
              {p.badges.map((b, i) => (
                <li key={b.label + i}>
                  <CheckBox />
                  {b.label}
                </li>
              ))}
            </ul>
            <Btn ctx={ctx} icon url={p.buttonUrl}>
              {p.buttonLabel}
            </Btn>
          </div>
        </div>
      </section>
    ),
    type: "saCta",
  }
);

/* ───────────────────────── faixa verde e rodapé ───────────────────────── */

const colItem = z.object({ label: str(), text: str(), url: str() });
const colFields: FieldDef[] = [
  { key: "label", kind: "text", label: "Texto" },
  { key: "text", kind: "textarea", label: "Descrição (opcional)" },
  { key: "url", kind: "url", label: "Link (vazio = só texto)" },
];

/** Item do rodapé sem link próprio: WhatsApp, e-mail e Instagram vêm das props globais do site (`theme`). */
function itemUrl(ctx: RenderContext, label: string, url: string): string {
  if (url.trim()) return url;
  const k = label.toLowerCase();
  if (k.includes("whatsapp")) return ctx.site.theme.whatsappUrl ?? "";
  if (k.includes("mail")) {
    const email = ctx.site.theme.contactEmail;
    return email ? `mailto:${email}` : "";
  }
  if (k.includes("instagram")) return ctx.site.theme.instagramUrl ?? "";
  return "";
}

function FootItem({
  ctx,
  it,
}: {
  ctx: RenderContext;
  it: { label: string; text: string; url: string };
}) {
  const u = itemUrl(ctx, it.label, it.url);
  return (
    <li>
      {u ? (
        <a href={href(ctx, u)} {...newTab(u)}>
          {it.label}
        </a>
      ) : (
        <span>{it.label}</span>
      )}
      {it.text ? <p>{it.text}</p> : null}
    </li>
  );
}

const saFooter = defineBlock(
  z.object({
    about: str(),
    bandButtonLabel: str("Fale com a SAUT"),
    bandButtonUrl: str(),
    bandDots: yesNo("yes"),
    bandTitle: str("Vamos construir o próximo movimento?"),
    companyItems: z.array(colItem).default([]),
    companyTitle: str("Empresa"),
    contactItems: z.array(colItem).default([]),
    contactTitle: str("Fale com a SAUT"),
    copyright: str("© {ano} SAUT Marketing. Todos os direitos reservados."),
    legal: z.array(linkItem).default([]),
    logo: str(),
    logoAlt: str("SAUT Marketing"),
    productItems: z.array(colItem).default([]),
    productsTitle: str("Produtos & Tecnologia"),
    serviceItems: z.array(colItem).default([]),
    servicesTitle: str("Serviços"),
    socials: z.array(linkItem).default([]),
  }),
  {
    fields: [
      { key: "bandTitle", kind: "text", label: "Faixa verde — título" },
      ...button("bandButton", "botão da faixa"),
      {
        key: "bandDots",
        kind: "select",
        label: "Faixa verde — padrão de pontos",
        options: YES_NO,
      },
      { key: "logo", kind: "image", label: "Logotipo (versão branca)" },
      { key: "logoAlt", kind: "text", label: "Texto alternativo do logotipo" },
      { key: "about", kind: "textarea", label: "Texto da marca" },
      {
        itemFields: linkFields,
        key: "socials",
        kind: "list",
        label: "Redes (vazio = usa o Instagram/WhatsApp do site)",
      },
      { key: "companyTitle", kind: "text", label: "Coluna Empresa — título" },
      {
        itemFields: colFields,
        key: "companyItems",
        kind: "list",
        label: "Coluna Empresa — itens",
      },
      { key: "servicesTitle", kind: "text", label: "Coluna Serviços — título" },
      {
        itemFields: colFields,
        key: "serviceItems",
        kind: "list",
        label: "Coluna Serviços — itens",
      },
      { key: "productsTitle", kind: "text", label: "Produtos — título" },
      {
        itemFields: colFields,
        key: "productItems",
        kind: "list",
        label: "Produtos — itens",
      },
      {
        key: "contactTitle",
        kind: "text",
        label: "Coluna de contato — título",
      },
      {
        itemFields: colFields,
        key: "contactItems",
        kind: "list",
        label: "Coluna de contato — itens",
      },
      {
        key: "copyright",
        kind: "text",
        label: "Direitos autorais ({ano} vira o ano atual)",
      },
      {
        itemFields: linkFields,
        key: "legal",
        kind: "list",
        label: "Links legais",
      },
    ],
    group: "layout",
    label: "Faixa verde e rodapé (SAUT)",
    render: (p, ctx) => {
      const [before = "", after = ""] = p.copyright.split("{ano}");
      return (
        <div className="sa-foot">
          <section
            className={cls("sa-band sa-box", p.bandDots === "yes" && "sa-dots")}
          >
            <div className="sa-band-in">
              <h2>{p.bandTitle}</h2>
              <Btn ctx={ctx} url={p.bandButtonUrl}>
                {p.bandButtonLabel}
              </Btn>
            </div>
          </section>
          <footer className="sa-footer sa-box">
            <div className="sa-in">
              <div className="sa-fgrid">
                <div className="sa-fcol sa-fbrand">
                  <Img alt={p.logoAlt} src={p.logo} />
                  <p>{p.about}</p>
                  <div className="sa-socials">
                    {p.socials.map((s, i) => {
                      const u = itemUrl(ctx, s.label, s.url);
                      return u ? (
                        <a
                          aria-label={s.label}
                          href={href(ctx, u)}
                          key={s.label + i}
                          {...newTab(u)}
                        >
                          <SocialGlyph label={s.label} />
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="sa-fcol">
                  <h3>{p.companyTitle}</h3>
                  <ul>
                    {p.companyItems.map((it, i) => (
                      <FootItem ctx={ctx} it={it} key={it.label + i} />
                    ))}
                  </ul>
                </div>
                <div className="sa-fcol">
                  <h3>{p.servicesTitle}</h3>
                  <ul>
                    {p.serviceItems.map((it, i) => (
                      <FootItem ctx={ctx} it={it} key={it.label + i} />
                    ))}
                  </ul>
                  <h3 className="sa-fsub">{p.productsTitle}</h3>
                  <ul className="sa-fprod">
                    {p.productItems.map((it, i) => (
                      <FootItem ctx={ctx} it={it} key={it.label + i} />
                    ))}
                  </ul>
                </div>
                <div className="sa-fcol">
                  <h3>{p.contactTitle}</h3>
                  <ul>
                    {p.contactItems.map((it, i) => (
                      <FootItem ctx={ctx} it={it} key={it.label + i} />
                    ))}
                  </ul>
                </div>
              </div>
              <div className="sa-fbottom">
                <p>
                  {before}
                  <span data-sa-year="">{new Date().getFullYear()}</span>
                  {after}
                </p>
                <ul>
                  {p.legal.map((l, i) => (
                    <li key={l.label + i}>
                      <a href={href(ctx, l.url)}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </footer>
        </div>
      );
    },
    type: "saFooter",
  }
);

/* ───────────────────────── páginas legais e 404 ───────────────────────── */

const saLegal = defineBlock(
  z.object({
    sections: z.array(z.object({ body: str(), title: str() })).default([]),
    text: str(),
    title: str("Política de Privacidade"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Introdução" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título da seção" },
          {
            key: "body",
            kind: "textarea",
            label:
              "Texto (linha em branco separa parágrafos; linhas com “- ” viram lista)",
          },
        ],
        key: "sections",
        kind: "list",
        label: "Seções",
      },
    ],
    group: "content",
    label: "Página legal (SAUT)",
    render: p => (
      <section className="sa-legal">
        <div className="sa-in">
          <h1>{p.title}</h1>
          {p.text ? <p className="sa-legal-intro">{p.text}</p> : null}
          {p.sections.map((s, i) => (
            <div className="sa-legal-sec" key={s.title + i}>
              <h2>{s.title}</h2>
              {paragraphs(s.body).map((b, k) => {
                const rows = b.split("\n").map(l => l.trim());
                return rows.every(l => l.startsWith("- ")) ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
                  <ul key={k}>
                    {rows.map(l => (
                      <li key={l}>{l.slice(2)}</li>
                    ))}
                  </ul>
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
                  <p key={k}>{b}</p>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    ),
    type: "saLegal",
  }
);

const saNotFound = defineBlock(
  z.object({
    background: str(),
    buttonLabel: str("Voltar ao início"),
    buttonUrl: str("/"),
    text: str("O endereço acessado não existe ou foi removido."),
    title: str("Página não encontrada"),
  }),
  {
    fields: [
      { key: "background", kind: "image", label: "Imagem de fundo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
    ],
    group: "content",
    label: "Página não encontrada (SAUT)",
    render: (p, ctx) => (
      <section
        className="sa-nf sa-box"
        style={{ backgroundImage: cssUrl(p.background) }}
      >
        <div className="sa-in">
          <h1>{p.title}</h1>
          <p>{p.text}</p>
          <a className="sa-btn lime" href={href(ctx, p.buttonUrl)}>
            {p.buttonLabel}
          </a>
        </div>
      </section>
    ),
    type: "saNotFound",
  }
);

export const sautBlocks: BlockDefinition[] = [
  saHeader,
  saHero,
  saLogos,
  saAbout,
  saServices,
  saProcess,
  saWhy,
  saCases,
  saImpact,
  saCta,
  saFooter,
  saLegal,
  saNotFound,
];
