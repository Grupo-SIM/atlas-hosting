import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, newTab } from "./helpers.js";
import type { BlockDefinition, RenderContext } from "./types.js";

/**
 * Blocos do tema SEOPACK (landing escura roxa de pacote de ferramentas). Todo texto, imagem, link e item é prop
 * editável; o visual vem de `renderer/seopack.ts` (escopo `.sb-sp`). Os caminhos de `Block.fx` dependem da ordem
 * dos filhos descrita no comentário de cada bloco.
 */
const str = (d = "") => z.string().default(d);
const num = (min: number, max: number, d: number) =>
  z.coerce.number().min(min).max(max).default(d).catch(d);

const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

/** `**negrito**` e `__sublinhado__` em textos de parágrafo. */
function rich(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    const key = `${i}-${part.slice(0, 8)}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
      return <u key={key}>{part.slice(2, -2)}</u>;
    }
    return part;
  });
}

const paragraphs = (text: string) =>
  lines(text).map((l, i) => <p key={`${i}-${l.slice(0, 12)}`}>{rich(l)}</p>);

const ARROW = (
  <svg aria-hidden="true" viewBox="0 0 512 512">
    <path d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm-28.9 143.6 75.5 72.4H120c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h182.6l-75.5 72.4c-9.7 9.3-9.9 24.8-.4 34.3l11 10.9c9.4 9.4 24.6 9.4 33.9 0L404.3 273c9.4-9.4 9.4-24.6 0-33.9L271.6 106.3c-9.4-9.4-24.6-9.4-33.9 0l-11 10.9c-9.5 9.6-9.3 25.1.4 34.4z" />
  </svg>
);

const CHECK = (
  <svg aria-hidden="true" viewBox="0 0 512 512">
    <path d="M504 256c0 136.97-111.03 248-248 248S8 392.97 8 256 119.03 8 256 8s248 111.03 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z" />
  </svg>
);

const Ic = ({ big, dark }: { big?: boolean; dark?: boolean }) => (
  <span className={`sp-ic${big ? "big" : ""}${dark ? "dark" : ""}`}>
    {ARROW}
  </span>
);

function Btn({
  className,
  ctx,
  label,
  url,
}: {
  className: string;
  ctx: RenderContext;
  label: string;
  url: string;
}) {
  if (!label) return null;
  return (
    <a className={className} href={href(ctx, url)} {...newTab(url)}>
      {label}
    </a>
  );
}

/** Contador animado (`data-sb-count` do `fx-runtime`) com símbolo antes/depois. */
function Counter({
  caption,
  prefix,
  suffix,
  value,
}: {
  caption: string;
  prefix: string;
  suffix: string;
  value: string;
}) {
  const n = Number(value.replace(/\D/g, "")) || 0;
  return (
    <div className="sp-num">
      <span className="sp-num-n">
        {prefix ? <i>{prefix}</i> : null}
        <span data-sb-count={n}>{value}</span>
        {suffix ? <i>{suffix}</i> : null}
      </span>
      {caption ? <span className="sp-num-t">{caption}</span> : null}
    </div>
  );
}

const statSchema = z.object({
  caption: str(),
  prefix: str(),
  suffix: str(),
  value: str("0"),
});

const statFields = [
  { key: "prefix", kind: "text", label: "Símbolo antes (ex.: $ ou +)" },
  { key: "value", kind: "text", label: "Número" },
  { key: "suffix", kind: "text", label: "Símbolo depois (ex.: x ou %)" },
  { key: "caption", kind: "text", label: "Legenda" },
] as const;

const gridBg = (extra?: Record<string, string>) =>
  extra as unknown as CSSProperties | undefined;

/* ───────────────────────── cabeçalho ───────────────────────── */

const spHeader = defineBlock(
  z.object({
    buttonLabel: str("Cadastrar"),
    buttonUrl: str("#"),
    items: z.array(z.object({ label: str(), url: str("#") })).default([]),
    logo: str(),
    logoUrl: str("/"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link (ex.: #planos)" },
        ],
        key: "items",
        kind: "list",
        label: "Itens do menu",
      },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
    ],
    group: "layout",
    label: "Cabeçalho SEOPACK",
    render: (p, ctx) => {
      const menu = (cls: string) => (
        <ul className={cls}>
          {p.items.map((it, i) => (
            <li key={`${it.label}-${i}`}>
              <a href={href(ctx, it.url)} {...newTab(it.url)}>
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      );
      return (
        <header className="sp-head">
          <input
            aria-hidden="true"
            className="sp-burger-input"
            id="sb-burger"
            tabIndex={-1}
            type="checkbox"
          />
          <div className="sp-wrap sp-head-in">
            <a className="sp-logo" href={href(ctx, p.logoUrl)}>
              <Img alt="Logo" src={p.logo} />
            </a>
            <nav aria-label="Menu principal" className="sp-nav">
              {menu("sp-menu")}
            </nav>
            <label
              aria-label="Abrir menu"
              className="sp-burger"
              htmlFor="sb-burger"
            >
              <span>Menu</span>
              <svg aria-hidden="true" className="m" viewBox="0 0 448 512">
                <path d="M432 416H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-128H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-128H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-128H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z" />
              </svg>
              <svg aria-hidden="true" className="x" viewBox="0 0 24 24">
                <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
              </svg>
            </label>
            <div className="sp-head-btn">
              <Btn
                className="sp-btn solid"
                ctx={ctx}
                label={p.buttonLabel}
                url={p.buttonUrl}
              />
            </div>
          </div>
          {menu("sp-head-menu")}
        </header>
      );
    },
    type: "spHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

/** Filhos de `.sp-hero` (caminho `1.N`): 1 selo, 2 título, 3 texto. A foto fica em `.sp-hero-wrap`. */
const spHero = defineBlock(
  z.object({
    image: str(),
    pill: str("Ganhe tempo e dinheiro"),
    text: str(),
    titleStart: str("As melhores ferramentas em um só"),
    titleWord: str("Lugar."),
  }),
  {
    fields: [
      { key: "pill", kind: "text", label: "Selo (texto acima do título)" },
      { key: "titleStart", kind: "text", label: "Título — começo" },
      { key: "titleWord", kind: "text", label: "Título — palavra em destaque" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "image", kind: "image", label: "Imagem sobreposta" },
    ],
    group: "content",
    label: "Hero SEOPACK",
    render: p => (
      <>
        <section className="sp-hero">
          {p.pill ? <span className="sp-pill hero">{p.pill}</span> : null}
          <h1 className="sp-hero-title">
            {p.titleStart} {p.titleWord ? <b>{p.titleWord}</b> : null}
          </h1>
          <p className="sp-hero-text">{p.text}</p>
        </section>
        {p.image ? (
          <div className="sp-hero-wrap">
            <Img alt="" className="sp-hero-img" src={p.image} />
          </div>
        ) : null}
      </>
    ),
    type: "spHero",
  }
);

/* ───────────────────────── sobre ───────────────────────── */

const spAbout = defineBlock(
  z.object({
    buttonLabel: str("Acessar"),
    buttonUrl: str("#"),
    cards: z
      .array(
        z.object({
          ...statSchema.shape,
          title: str(),
        })
      )
      .default([]),
    image: str(),
    pill: str("Sobre"),
    text: str(),
    title: str("Título"),
  }),
  {
    fields: [
      { key: "pill", kind: "text", label: "Selo" },
      { key: "title", kind: "textarea", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (um parágrafo por linha; **negrito**, __sublinhado__)",
      },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link" },
      { key: "image", kind: "image", label: "Imagem do cartão grande" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título do cartão" },
          ...statFields,
        ],
        key: "cards",
        kind: "list",
        label: "Cartões com número",
      },
    ],
    group: "content",
    label: "Sobre SEOPACK (texto, imagem e números)",
    render: (p, ctx) => (
      <section className="sp-about">
        <div className="sp-split">
          <div className="sp-side">
            {p.pill ? <span className="sp-pill">{p.pill}</span> : null}
            <h2>{p.title}</h2>
            <div className="sp-about-text">{paragraphs(p.text)}</div>
            <Btn
              className="sp-btn"
              ctx={ctx}
              label={p.buttonLabel}
              url={p.buttonUrl}
            />
          </div>
          <div className="sp-main">
            <div
              className="sp-about-img"
              style={gridBg({ "--sp-img": cssUrl(p.image) })}
            />
            <div className="sp-about-cards">
              {p.cards.map((c, i) => (
                <div
                  className={`sp-about-card sp-grid-bg${i % 2 === 1 ? "top" : ""}`}
                  key={`${c.title}-${i}`}
                >
                  <Ic dark={i % 2 === 1} />
                  <h3>{c.title}</h3>
                  <div className="sp-about-stat">
                    <div className="sp-stat-card">
                      <Counter
                        caption={c.caption}
                        prefix={c.prefix}
                        suffix={c.suffix}
                        value={c.value}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    type: "spAbout",
  }
);

/* ───────────────────────── ferramentas ───────────────────────── */

const spTools = defineBlock(
  z.object({
    groupTitle: str(),
    items: z
      .array(z.object({ image: str(), name: str(), text: str() }))
      .default([]),
    title: str("Ferramentas disponíveis"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "groupTitle", kind: "text", label: "Título do grupo" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Logo da ferramenta" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "text", kind: "textarea", label: "Descrição" },
        ],
        key: "items",
        kind: "list",
        label: "Ferramentas (5 por linha)",
      },
    ],
    group: "content",
    label: "Grade de ferramentas (SEOPACK)",
    render: p => (
      <section className="sp-tools">
        <div className="sp-wrap">
          <h2>{p.title}</h2>
          {p.groupTitle ? (
            <h4 className="sp-tools-group">{p.groupTitle}</h4>
          ) : null}
          <div className="sp-tools-grid">
            {p.items.map((it, i) => (
              <div className="sp-tool" key={`${it.name}-${i}`}>
                <Img alt={it.name} src={it.image} />
                <h4>{it.name}</h4>
                <p>{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "spTools",
  }
);

/* ───────────────────────── confiança ───────────────────────── */

const spTrust = defineBlock(
  z.object({
    items: z.array(z.object({ text: str(), title: str() })).default([]),
    pill: str(),
    title: str("Título"),
  }),
  {
    fields: [
      { key: "pill", kind: "text", label: "Selo" },
      { key: "title", kind: "textarea", label: "Título" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "Confiança SEOPACK (3 cartões)",
    render: p => (
      <section className="sp-trust">
        <div className="sp-wrap sp-trust-outer">
          <div className="sp-trust-in sp-grid-bg">
            <div className="sp-trust-head">
              {p.pill ? <span className="sp-pill mid">{p.pill}</span> : null}
              <h2>{p.title}</h2>
            </div>
            <div className="sp-trust-grid">
              {p.items.map((it, i) => (
                <div className="sp-trust-outer-card" key={`${it.title}-${i}`}>
                  <div className="sp-trust-card">
                    <Ic big />
                    <h3>{it.title}</h3>
                    <p>{it.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    type: "spTrust",
  }
);

/* ───────────────────────── custo x benefício ───────────────────────── */

const spBenefit = defineBlock(
  z.object({
    cards: z
      .array(
        z.object({
          buttonLabel: str("Acessar"),
          buttonUrl: str("#"),
          stats: z.array(statSchema).default([]),
          tags: str(),
          text: str(),
          title: str(),
        })
      )
      .default([]),
    pill: str(),
    text: str(),
    title: str("Título"),
  }),
  {
    fields: [
      { key: "pill", kind: "text", label: "Selo" },
      { key: "title", kind: "textarea", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (um parágrafo por linha)",
      },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título do cartão" },
          { key: "tags", kind: "textarea", label: "Etiquetas (uma por linha)" },
          { key: "text", kind: "textarea", label: "Texto" },
          {
            itemFields: [...statFields],
            key: "stats",
            kind: "list",
            label: "Números",
          },
          { key: "buttonLabel", kind: "text", label: "Botão — texto" },
          { key: "buttonUrl", kind: "url", label: "Botão — link" },
        ],
        key: "cards",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "Custo x benefício SEOPACK",
    render: (p, ctx) => (
      <section className="sp-ben">
        <div className="sp-wrap">
          <hr className="sp-ben-divider" />
          <div className="sp-split">
            <div className="sp-side">
              {p.pill ? <span className="sp-pill">{p.pill}</span> : null}
              <h2>{p.title}</h2>
              <div className="sp-ben-text">{paragraphs(p.text)}</div>
            </div>
            <div className="sp-main">
              <div className="sp-ben-cols">
                {p.cards.map((c, i) => (
                  <div className="sp-ben-card" key={`${c.title}-${i}`}>
                    <div className="sp-ben-in sp-grid-bg">
                      <Ic />
                      <h3>{c.title}</h3>
                      <div className="sp-ben-tags">
                        {lines(c.tags).map((t, k) => (
                          <span className="sp-tag" key={`${t}-${k}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <hr className="sp-ben-line" />
                      <p className="sp-ben-text">{c.text}</p>
                      <div className="sp-ben-stats">
                        {c.stats.map((s, k) => (
                          <div
                            className="sp-stat-card o"
                            key={`${s.caption}-${k}`}
                          >
                            <div className="sp-stat-card">
                              <Counter
                                caption={s.caption}
                                prefix={s.prefix}
                                suffix={s.suffix}
                                value={s.value}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Btn
                        className="sp-btn sp-ben-btn"
                        ctx={ctx}
                        label={c.buttonLabel}
                        url={c.buttonUrl}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "spBenefit",
  }
);

/* ───────────────────────── planos ───────────────────────── */

const spPlans = defineBlock(
  z.object({
    pill: str(),
    plans: z
      .array(
        z.object({
          buttonLabel: str("Assinar"),
          buttonUrl: str("#"),
          currency: str("R$"),
          days: str(),
          description: str(),
          featured: z.enum(["no", "yes"]).default("no").catch("no"),
          features: str(),
          label: str(),
          name: str(),
          period: str(),
          price: str(),
        })
      )
      .default([]),
    text: str(),
    title: str("Nossos planos"),
  }),
  {
    fields: [
      { key: "pill", kind: "text", label: "Selo" },
      { key: "title", kind: "textarea", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (um parágrafo por linha)",
      },
      {
        itemFields: [
          {
            key: "label",
            kind: "text",
            label: "Título do cartão (ex.: 1 MÊS)",
          },
          {
            key: "days",
            kind: "text",
            label: "Etiqueta (ex.: 31 dias de acesso)",
          },
          { key: "name", kind: "text", label: "Nome do pacote" },
          { key: "description", kind: "textarea", label: "Descrição" },
          { key: "currency", kind: "text", label: "Moeda" },
          { key: "price", kind: "text", label: "Preço (ex.: 40,00)" },
          { key: "period", kind: "text", label: "Período (ex.: / 1 mês)" },
          {
            key: "features",
            kind: "textarea",
            label: "Itens da lista (um por linha)",
          },
          { key: "buttonLabel", kind: "text", label: "Botão — texto" },
          { key: "buttonUrl", kind: "url", label: "Botão — link (checkout)" },
          {
            key: "featured",
            kind: "select",
            label: "Destaque (mais vendido)",
            options: [
              { label: "Não", value: "no" },
              { label: "Sim", value: "yes" },
            ],
          },
        ],
        key: "plans",
        kind: "list",
        label: "Planos",
      },
    ],
    group: "content",
    label: "Planos SEOPACK",
    render: (p, ctx) => (
      <section className="sp-plans">
        <div className="sp-wrap">
          <div className="sp-split">
            <div className="sp-side">
              {p.pill ? <span className="sp-pill">{p.pill}</span> : null}
              <h2>{p.title}</h2>
              <div className="sp-text-pr">{paragraphs(p.text)}</div>
            </div>
            <div className="sp-main">
              <div className="sp-price-grid">
                {p.plans.map((plan, i) => (
                  <div
                    className={`sp-plan${plan.featured === "yes" ? "pop" : ""}`}
                    key={`${plan.label}-${i}`}
                  >
                    <h3 className="sp-plan-label">{plan.label}</h3>
                    <div className="sp-plan-in sp-grid-bg">
                      <div className="sp-plan-head">
                        <Ic />
                        <span
                          className={`sp-tag${plan.featured === "yes" ? "alt" : ""}`}
                        >
                          {plan.days}
                        </span>
                      </div>
                      <h3 className="sp-plan-name">{plan.name}</h3>
                      <p className="sp-plan-desc">{plan.description}</p>
                      <div className="sp-price-row">
                        <span className="sp-price-cur">{plan.currency}</span>
                        <span className="sp-price-val">{plan.price}</span>
                        <span className="sp-price-per">{plan.period}</span>
                      </div>
                      <ul className="sp-plan-list">
                        {lines(plan.features).map((f, k) => (
                          <li key={`${f}-${k}`}>
                            {CHECK}
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Btn
                        className="sp-btn solid"
                        ctx={ctx}
                        label={plan.buttonLabel}
                        url={plan.buttonUrl}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "spPlans",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const spTestimonials = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), name: str(), quote: str(), role: str() }))
      .default([]),
    pill: str(),
    seconds: num(2, 30, 6),
    text: str(),
    title: str("Depoimentos"),
  }),
  {
    fields: [
      { key: "pill", kind: "text", label: "Selo" },
      { key: "title", kind: "textarea", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (um parágrafo por linha)",
      },
      {
        itemFields: [
          { key: "quote", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Profissão" },
        ],
        key: "items",
        kind: "list",
        label:
          "Depoimentos (a primeira metade vai à esquerda, o resto à direita)",
      },
      { key: "seconds", kind: "number", label: "Segundos entre os slides" },
    ],
    group: "content",
    label: "Depoimentos SEOPACK (dois carrosséis)",
    render: p => {
      const half = Math.ceil(p.items.length / 2);
      const cols = [p.items.slice(0, half), p.items.slice(half)].filter(
        c => c.length > 0
      );
      return (
        <section className="sp-testi">
          <div className="sp-wrap">
            <div className="sp-split">
              <div className="sp-side">
                {p.pill ? <span className="sp-pill">{p.pill}</span> : null}
                <h2>{p.title}</h2>
                <div className="sp-testi-text">{paragraphs(p.text)}</div>
              </div>
              <div className="sp-main">
                <div className="sp-testi-card">
                  <div className="sp-testi-wrap sp-grid-bg">
                    <div className="sp-testi-cols">
                      {cols.map((col, c) => (
                        <div
                          className={`sp-testi-col sp-grid-bg${c === 1 ? "b" : ""}`}
                          key={`col-${c}`}
                        >
                          <div
                            className="sb-cslider sg-car sp-car"
                            data-sec={p.seconds}
                          >
                            <div className="sb-cslider-track">
                              {col.map((t, i) => (
                                <figure className="sp-t" key={`${t.name}-${i}`}>
                                  <blockquote>{t.quote}</blockquote>
                                  <figcaption>
                                    <Img alt={t.name} src={t.image} />
                                    <cite>
                                      <strong>{t.name}</strong>
                                      <span>{t.role}</span>
                                    </cite>
                                  </figcaption>
                                </figure>
                              ))}
                            </div>
                            <div className="sg-dots sp-dots">
                              {col.map((t, i) => (
                                <button
                                  aria-label={`Depoimento ${i + 1}`}
                                  className={i === 0 ? "on" : undefined}
                                  key={`${t.name}-${i}`}
                                  type="button"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "spTestimonials",
  }
);

/* ───────────────────────── FAQ e rodapé ───────────────────────── */

const spFaq = defineBlock(
  z.object({
    items: z.array(z.object({ answer: str(), question: str() })).default([]),
    pill: str(),
    text: str(),
    title: str("Perguntas frequentes"),
  }),
  {
    fields: [
      { key: "pill", kind: "text", label: "Selo" },
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
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
    label: "Perguntas frequentes SEOPACK",
    render: (p, ctx) => {
      const group = `sp-faq-${ctx.path?.length ?? 0}`;
      return (
        <section className="sp-faq">
          <div className="sp-wrap">
            <div className="sp-split">
              <div className="sp-side">
                {p.pill ? <span className="sp-pill">{p.pill}</span> : null}
                <h2>{p.title}</h2>
                <div className="sp-text-pr">
                  <p>{p.text}</p>
                </div>
              </div>
              <div className="sp-main sp-faq-list">
                {p.items.map((it, i) => (
                  <details
                    key={`${it.question}-${i}`}
                    name={group}
                    open={i === 0}
                  >
                    <summary className="sp-faq-q">{it.question}</summary>
                    <div className="sp-faq-a">{it.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "spFaq",
  }
);

const spFooter = defineBlock(z.object({ text: str() }), {
  fields: [{ key: "text", kind: "text", label: "Texto do rodapé" }],
  group: "layout",
  label: "Rodapé SEOPACK",
  render: p => (
    <footer className="sp-foot">
      <p>{p.text}</p>
    </footer>
  ),
  type: "spFooter",
});

export const seopackBlocks: BlockDefinition[] = [
  spHeader,
  spHero,
  spAbout,
  spTools,
  spTrust,
  spBenefit,
  spPlans,
  spTestimonials,
  spFaq,
  spFooter,
];
