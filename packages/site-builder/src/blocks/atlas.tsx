import type { ReactNode } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { href } from "./helpers.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";

/**
 * Blocos do tema Atlas Hosting (cópia de atlashosting.com.br). Todo texto, imagem, link e item é prop
 * editável; o visual vem de `renderer/atlas.ts` (escopo `.sb-at`). O contador usa `data-sb-count` e o mapa
 * usa `data-sb-lottie` (ambos ligados por `renderer/fx-runtime.ts`); o menu, o seletor de backup e o
 * menu do celular funcionam só com CSS. Sem JS (e no editor) a página já aparece completa.
 */
const str = (d = "") => z.string().default(d);
const yesNo = (d: "no" | "yes") => z.enum(["yes", "no"]).default(d).catch(d);
const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

const cls = (...names: (string | false)[]) => names.filter(Boolean).join(" ");

const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

/** `Texto *destaque* texto`: o trecho entre asteriscos ganha a cor de destaque. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: partes fixas do texto
          <em key={i}>{p}</em>
        ) : (
          p
        )
      )}
    </>
  );
}

const ICONS: Record<string, string> = {
  check: "M20 6 9 17l-5-5",
  chip: "M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM9 9h6v6H9z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  globe:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  headset:
    "M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H5a1 1 0 0 1-1-1v-4zM20 14h-3v5h2a1 1 0 0 0 1-1v-4z",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  rocket:
    "M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M12 15l-3-3a22 22 0 0 1 2-4 12 12 0 0 1 11-6c0 3-1 8-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1 5 0 5 0M12 15v5s3-.6 4-2c1-1.6 0-5 0-5",
  server: "M3 4h18v6H3zM3 14h18v6H3zM7 7h.01M7 17h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star: "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
  wallet: "M20 7H5a2 2 0 0 1 0-4h13v4zM3 5v14a2 2 0 0 0 2 2h15V7M16 14h.01",
  zap: "M13 2 3 14h9l-1 8 10-12h-9z",
};

const ICON_OPTIONS = [
  { label: "Carteira", value: "wallet" },
  { label: "Foguete", value: "rocket" },
  { label: "Mensagem", value: "message" },
  { label: "Globo", value: "globe" },
  { label: "Chip", value: "chip" },
  { label: "Servidor", value: "server" },
  { label: "Escudo", value: "shield" },
  { label: "Raio", value: "zap" },
  { label: "Fone de suporte", value: "headset" },
  { label: "Relógio", value: "clock" },
  { label: "Estrela", value: "star" },
];

function Icon({ className, name }: { className?: string; name: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
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

const titleField: FieldDef = { key: "title", kind: "text", label: "Título" };
const textField: FieldDef = { key: "text", kind: "textarea", label: "Texto" };
const button = (key: string, label: string): FieldDef[] => [
  { key: `${key}Label`, kind: "text", label: `Texto do ${label}` },
  { key: `${key}Url`, kind: "url", label: `Link do ${label}` },
];

function Btn({
  children,
  ctx,
  tone,
  url,
}: {
  children: ReactNode;
  ctx: RenderContext;
  tone?: "ghost" | "outline";
  url: string;
}) {
  if (!children) return null;
  return (
    <a
      className={["at-btn", tone].filter(Boolean).join(" ")}
      href={href(ctx, url)}
    >
      {children}
    </a>
  );
}

const linkItem = z.object({ label: str(), url: str() });
const linkFields: FieldDef[] = [
  { key: "label", kind: "text", label: "Texto" },
  { key: "url", kind: "url", label: "Link" },
];

/* ───────────────────────── cabeçalho ───────────────────────── */

const atHeader = defineBlock(
  z.object({
    links: z.array(linkItem).default([]),
    loginLabel: str("Login"),
    loginUrl: str(),
    logo: str(),
    logoAlt: str("Atlas Hosting"),
    menuLabel: str("VPS"),
    menuUrl: str("/vps"),
    signupLabel: str("Cadastre-se"),
    signupUrl: str(),
    submenu: z.array(linkItem).default([]),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logotipo" },
      { key: "logoAlt", kind: "text", label: "Texto alternativo do logotipo" },
      { key: "menuLabel", kind: "text", label: "Menu com submenu — texto" },
      { key: "menuUrl", kind: "url", label: "Menu com submenu — link" },
      {
        itemFields: linkFields,
        key: "submenu",
        kind: "list",
        label: "Itens do submenu",
      },
      {
        itemFields: linkFields,
        key: "links",
        kind: "list",
        label: "Links do menu",
      },
      ...button("login", "botão Login"),
      ...button("signup", "botão Cadastre-se"),
    ],
    group: "layout",
    label: "Cabeçalho (Atlas Hosting)",
    render: (p, ctx) => (
      <header className="at-head">
        <input className="at-burger-input" id="at-burger" type="checkbox" />
        <nav className="at-nav">
          <a className="at-logo" href={href(ctx, "/")}>
            {p.logo ? <img alt={p.logoAlt} src={p.logo} /> : p.logoAlt}
          </a>
          <div className="at-links">
            <div className="at-drop">
              <a href={href(ctx, p.menuUrl)}>
                {p.menuLabel}
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </a>
              <div className="at-drop-menu">
                {p.submenu.map((s, i) => (
                  <a href={href(ctx, s.url)} key={s.label + i}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            {p.links.map((l, i) => (
              <a href={href(ctx, l.url)} key={l.label + i}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="at-actions">
            <a className="at-login" href={href(ctx, p.loginUrl)}>
              {p.loginLabel}
            </a>
            <a className="at-btn at-btn-sm" href={href(ctx, p.signupUrl)}>
              {p.signupLabel}
            </a>
          </div>
          <label aria-label="Menu" className="at-burger" htmlFor="at-burger">
            <span />
            <span />
            <span />
          </label>
        </nav>
        <div className="at-drawer">
          <p>{p.menuLabel}</p>
          {p.submenu.map((s, i) => (
            <a href={href(ctx, s.url)} key={s.label + i}>
              {s.label}
            </a>
          ))}
          <p>Atlas</p>
          {p.links.map((l, i) => (
            <a href={href(ctx, l.url)} key={l.label + i}>
              {l.label}
            </a>
          ))}
          <a className="at-btn" href={href(ctx, p.signupUrl)}>
            {p.signupLabel}
          </a>
          <a className="at-btn outline" href={href(ctx, p.loginUrl)}>
            {p.loginLabel}
          </a>
        </div>
      </header>
    ),
    type: "atHeader",
  }
);

/* ───────────────────────── home ───────────────────────── */

const atHero = defineBlock(
  z.object({
    background: str(),
    buttonLabel: str("Ganhar agora"),
    buttonUrl: str(),
    note: str(),
    placeholder: str("Encontre um domínio"),
    poster: str(),
    searchAction: str(),
    searchLabel: str("Buscar"),
    text: str(),
    title: str(),
    video: str(),
  }),
  {
    fields: [
      { key: "placeholder", kind: "text", label: "Texto do campo de busca" },
      { key: "searchLabel", kind: "text", label: "Texto do botão de busca" },
      {
        key: "searchAction",
        kind: "url",
        label: "Endereço da busca de domínio (recebe ?q=)",
      },
      { key: "background", kind: "image", label: "Fundo decorativo" },
      { key: "video", kind: "media", label: "Vídeo (mp4)" },
      { key: "poster", kind: "image", label: "Imagem do vídeo" },
      titleField,
      textField,
      ...button("button", "botão"),
      { key: "note", kind: "text", label: "Selo de garantia" },
    ],
    group: "content",
    label: "Topo com busca e vídeo (Atlas Hosting)",
    render: (p, ctx) => (
      <section className="at-hero">
        {p.background ? (
          <img alt="" className="at-hero-bg" src={p.background} />
        ) : null}
        <div className="at-hero-in">
          <form action={p.searchAction} className="at-search" method="get">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
            </svg>
            <input name="q" placeholder={p.placeholder} type="text" />
            <button type="submit">{p.searchLabel}</button>
          </form>
          <div className="at-video">
            {p.video ? (
              // biome-ignore lint/a11y/useMediaCaption: vídeo decorativo, sem áudio
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={p.poster || undefined}
                preload="metadata"
                src={p.video}
              />
            ) : p.poster ? (
              <img alt="" src={p.poster} />
            ) : null}
            <div className="at-video-shade" />
            <div className="at-video-copy">
              <h1>{p.title}</h1>
              <p>{p.text}</p>
              <div className="at-video-actions">
                <Btn ctx={ctx} tone="ghost" url={p.buttonUrl}>
                  {p.buttonLabel}
                </Btn>
                {p.note ? (
                  <span className="at-note">
                    <Icon name="shield" />
                    {p.note}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "atHero",
  }
);

const atStats = defineBlock(
  z.object({
    eyebrow: str(),
    items: z
      .array(
        z.object({
          label: str(),
          suffix: str(),
          value: z.coerce.number().min(0).default(0).catch(0),
        })
      )
      .default([]),
    mapUrl: str(),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Selo acima do título" },
      {
        key: "title",
        kind: "textarea",
        label: "Título (uma linha por quebra)",
      },
      textField,
      {
        key: "mapUrl",
        kind: "text",
        label: "Endereço do JSON do mapa animado (Lottie)",
      },
      {
        itemFields: [
          { key: "value", kind: "number", label: "Número final" },
          { key: "suffix", kind: "text", label: "Sufixo (K+, +)" },
          { key: "label", kind: "text", label: "Legenda" },
        ],
        key: "items",
        kind: "list",
        label: "Números",
      },
    ],
    group: "content",
    label: "Resultados com contador e mapa (Atlas Hosting)",
    render: p => (
      <section className="at-stats">
        {p.mapUrl ? <div className="at-map" data-sb-lottie={p.mapUrl} /> : null}
        <div className="at-wrap">
          <div className="at-head-text">
            {p.eyebrow ? <span className="at-pill">{p.eyebrow}</span> : null}
            <h2>
              {lines(p.title).map((l, i, a) => (
                <span key={l + i}>
                  {l}
                  {i < a.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            <p>{p.text}</p>
          </div>
          <div className="at-stat-grid">
            {p.items.map((it, i) => (
              <div className="at-stat" key={it.label + i}>
                <strong>
                  <span data-ms="2000" data-sb-count={it.value}>
                    {it.value}
                  </span>
                  {it.suffix}
                </strong>
                <span>{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "atStats",
  }
);

/* ───────────────────────── planos ───────────────────────── */

const planItem = z.object({
  backupPrice: str(),
  backupUrl: str(),
  cents: str(),
  oldPrice: str(),
  popular: yesNo("no"),
  price: str(),
  specs: str(),
  title: str(),
  url: str(),
});

const atPlans = defineBlock(
  z.object({
    backupLabel: str("Backup automático"),
    backupToggle: yesNo("yes"),
    buttonLabel: str("Começar agora →"),
    currency: str("R$"),
    footerLabel: str(),
    footerText: str(),
    footerUrl: str(),
    guarantees: str(),
    items: z.array(planItem).default([]),
    period: str("24 meses"),
    popularLabel: str("Mais vendido"),
    rowLabels: str(),
    showHeading: yesNo("yes"),
    subtitle: str(),
    title: str(),
  }),
  {
    fields: [
      {
        key: "showHeading",
        kind: "select",
        label: "Mostrar título da seção",
        options: YES_NO,
      },
      titleField,
      { key: "subtitle", kind: "textarea", label: "Subtítulo" },
      {
        key: "backupToggle",
        kind: "select",
        label: "Chave de backup automático",
        options: YES_NO,
      },
      { key: "backupLabel", kind: "text", label: "Texto da chave de backup" },
      { key: "currency", kind: "text", label: "Símbolo da moeda" },
      { key: "period", kind: "text", label: "Texto do período" },
      { key: "popularLabel", kind: "text", label: "Selo do plano destaque" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão dos planos" },
      {
        key: "rowLabels",
        kind: "textarea",
        label: "Nome de cada linha de especificação (uma por linha)",
      },
      {
        key: "guarantees",
        kind: "textarea",
        label: "Vantagens no rodapé do cartão (uma por linha)",
      },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Nome do plano" },
          {
            key: "popular",
            kind: "select",
            label: "Destaque",
            options: YES_NO,
          },
          { key: "oldPrice", kind: "text", label: "Preço antigo (riscado)" },
          { key: "price", kind: "text", label: "Preço (ex.: 51)" },
          { key: "cents", kind: "text", label: "Centavos (ex.: 57)" },
          {
            key: "backupPrice",
            kind: "text",
            label: "Preço com backup (ex.: 70,91)",
          },
          {
            key: "specs",
            kind: "textarea",
            label: "Especificações (uma por linha)",
          },
          { key: "url", kind: "url", label: "Link do botão" },
          { key: "backupUrl", kind: "url", label: "Link do botão com backup" },
        ],
        key: "items",
        kind: "list",
        label: "Planos",
      },
      { key: "footerText", kind: "text", label: "Rodapé — texto" },
      { key: "footerLabel", kind: "text", label: "Rodapé — texto do link" },
      { key: "footerUrl", kind: "url", label: "Rodapé — link" },
    ],
    group: "content",
    label: "Planos em cartões (Atlas Hosting)",
    render: (p, ctx) => {
      const rows = lines(p.rowLabels);
      const perks = lines(p.guarantees);
      return (
        <section className="at-plans" id="planos">
          <div className="at-wrap at-wrap-wide">
            {p.showHeading === "yes" ? (
              <div className="at-head-text">
                <h2>{p.title}</h2>
                <p>{p.subtitle}</p>
              </div>
            ) : null}
            <input
              className="at-bk-input"
              id={`at-bk-${ctx.path ?? "home"}`}
              type="checkbox"
            />
            {p.backupToggle === "yes" ? (
              <label className="at-bk" htmlFor={`at-bk-${ctx.path ?? "home"}`}>
                <span className="at-switch" />
                <span>
                  <b>{p.backupLabel}</b>
                  <small className="at-on">Ativado</small>
                  <small className="at-off">Desativado</small>
                </span>
              </label>
            ) : null}
            <div className="at-plan-row">
              <div className="at-spec-col">
                <div className="at-spec-head">
                  <b>Especificações</b>
                  {p.backupToggle === "yes" ? (
                    <label
                      className="at-bk-desk"
                      htmlFor={`at-bk-${ctx.path ?? "home"}`}
                    >
                      <span className="at-bk-desk-title">{p.backupLabel}</span>
                      <span className="at-bk-desk-row">
                        <span className="at-switch" />
                        <small className="at-on">Ativado</small>
                        <small className="at-off">Desativado</small>
                      </span>
                    </label>
                  ) : null}
                </div>
                {rows.map((r, i) => (
                  <div className="at-spec-row" key={r + i}>
                    {r}
                  </div>
                ))}
              </div>
              <div className="at-plan-list">
                {p.items.map((it, i) => {
                  const specs = lines(it.specs);
                  return (
                    <article
                      className={cls("at-plan", it.popular === "yes" && "pop")}
                      key={it.title + i}
                    >
                      <div className="at-plan-top">
                        {it.popular === "yes" ? (
                          <span className="at-tag">{p.popularLabel}</span>
                        ) : null}
                        <h3>{it.title}</h3>
                        {it.oldPrice ? (
                          <s>
                            {p.currency} {it.oldPrice}
                          </s>
                        ) : null}
                        <div className="at-price">
                          <span className="at-price-cur">{p.currency}</span>
                          <span className="at-price-main">{it.price},</span>
                          <span className="at-price-cents">{it.cents}</span>
                          <span className="at-price-per">/mês</span>
                        </div>
                        {it.backupPrice ? (
                          <div className="at-price at-price-bk">
                            <span className="at-price-cur">{p.currency}</span>
                            <span className="at-price-main">
                              {it.backupPrice.split(",")[0]},
                            </span>
                            <span className="at-price-cents">
                              {it.backupPrice.split(",")[1]}
                            </span>
                            <span className="at-price-per">/mês</span>
                          </div>
                        ) : null}
                        <p className="at-period">{p.period}</p>
                        <a
                          className={cls(
                            "at-btn at-plan-btn",
                            it.popular !== "yes" && "outline"
                          )}
                          href={href(ctx, it.url)}
                        >
                          {p.buttonLabel}
                        </a>
                        {it.backupUrl ? (
                          <a
                            className={cls(
                              "at-btn at-plan-btn at-plan-btn-bk",
                              it.popular !== "yes" && "outline"
                            )}
                            href={href(ctx, it.backupUrl)}
                          >
                            {p.buttonLabel}
                          </a>
                        ) : null}
                      </div>
                      <div className="at-plan-specs">
                        {specs.map((s, j) => (
                          <div className="at-spec" key={s + j}>
                            <small>{rows[j]}</small>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                      {perks.length ? (
                        <ul className="at-perks">
                          {perks.map((l, j) => (
                            <li key={l + j}>
                              <Icon name="check" />
                              {l}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
            {p.footerText || p.footerLabel ? (
              <p className="at-plans-foot">
                {p.footerText}{" "}
                <a href={href(ctx, p.footerUrl)}>{p.footerLabel}</a>.
              </p>
            ) : null}
          </div>
        </section>
      );
    },
    type: "atPlans",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const atTestimonials = defineBlock(
  z.object({
    eyebrow: str("● DEPOIMENTOS"),
    items: z
      .array(
        z.object({
          image: str(),
          name: str(),
          role: str(),
          text: str(),
        })
      )
      .default([]),
    title: str("Feedback & Avaliações"),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Selo acima do título" },
      titleField,
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
          { key: "text", kind: "textarea", label: "Depoimento" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
    ],
    group: "content",
    label: "Depoimentos (Atlas Hosting)",
    render: p => (
      <section className="at-depo" id="testimonials">
        <div className="at-depo-box">
          <div className="at-head-text">
            <span className="at-pill">{p.eyebrow}</span>
            <h2>{p.title}</h2>
            <div className="at-stars">
              {[0, 1, 2, 3, 4].map(n => (
                <Icon key={n} name="star" />
              ))}
            </div>
          </div>
          <div className="at-depo-grid">
            {p.items.map((it, i) => (
              <figure className="at-depo-card" key={it.name + i}>
                <blockquote>{it.text}</blockquote>
                <figcaption>
                  {it.image ? (
                    <img alt={it.name} loading="lazy" src={it.image} />
                  ) : null}
                  <span>
                    <b>{it.name}</b>
                    <small>{it.role}</small>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "atTestimonials",
  }
);

/* ───────────────────────── chat ───────────────────────── */

const atChat = defineBlock(
  z.object({
    badge: str("● SUPORTE ONLINE AGORA"),
    botGreeting: str(),
    botName: str("Atlas IA"),
    botSubtitle: str("Suporte 24/7"),
    buttonLabel: str(),
    buttonUrl: str(),
    highlight: str(),
    perks: str(),
    placeholder: str("Digite sua pergunta..."),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "badge", kind: "text", label: "Selo" },
      titleField,
      {
        key: "highlight",
        kind: "text",
        label: "Segunda linha do título (destaque)",
      },
      textField,
      { key: "perks", kind: "textarea", label: "Vantagens (uma por linha)" },
      { key: "botName", kind: "text", label: "Nome do assistente" },
      { key: "botSubtitle", kind: "text", label: "Subtítulo do assistente" },
      {
        key: "botGreeting",
        kind: "textarea",
        label: "Mensagens do assistente (uma por linha)",
      },
      { key: "placeholder", kind: "text", label: "Texto do campo de mensagem" },
      ...button("button", "botão (abre o chat real)"),
    ],
    group: "content",
    label: "Suporte com chat (Atlas Hosting)",
    render: (p, ctx) => (
      <section className="at-chat">
        <div className="at-wrap at-chat-in">
          <div className="at-chat-copy">
            <span className="at-pill">{p.badge}</span>
            <h2>
              {p.title}
              <br />
              <em>{p.highlight}</em>
            </h2>
            <p>{p.text}</p>
            <ul>
              {lines(p.perks).map((l, i) => (
                <li key={l + i}>{l}</li>
              ))}
            </ul>
          </div>
          <div className="at-chat-win">
            <div className="at-chat-top">
              <b>{p.botName}</b>
              <small>{p.botSubtitle}</small>
            </div>
            <div className="at-chat-msgs">
              {lines(p.botGreeting).map((l, i) => (
                <div className="at-bubble" key={l + i}>
                  {l}
                </div>
              ))}
            </div>
            <a className="at-chat-input" href={href(ctx, p.buttonUrl)}>
              <span>{p.placeholder}</span>
              <i>
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
                </svg>
              </i>
            </a>
            {p.buttonLabel ? (
              <a className="at-chat-cta" href={href(ctx, p.buttonUrl)}>
                {p.buttonLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    ),
    type: "atChat",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const atFooter = defineBlock(
  z.object({
    blogs: z.array(linkItem).default([]),
    blogsTitle: str("Blogs Recomendados"),
    copyright: str(),
    legal: z.array(linkItem).default([]),
    logo: str(),
    logoAlt: str("Atlas Hosting"),
    menu: z.array(linkItem).default([]),
    menuTitle: str("Menu"),
    socials: z.array(linkItem).default([]),
    tagline: str(),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logotipo" },
      { key: "tagline", kind: "textarea", label: "Frase abaixo do logotipo" },
      {
        itemFields: linkFields,
        key: "socials",
        kind: "list",
        label: "Redes sociais (texto = sigla exibida)",
      },
      { key: "menuTitle", kind: "text", label: "Título da coluna do menu" },
      {
        itemFields: linkFields,
        key: "menu",
        kind: "list",
        label: "Links do menu",
      },
      { key: "blogsTitle", kind: "text", label: "Título da coluna de blogs" },
      {
        itemFields: linkFields,
        key: "blogs",
        kind: "list",
        label: "Links dos blogs",
      },
      {
        itemFields: linkFields,
        key: "legal",
        kind: "list",
        label: "Links legais",
      },
      { key: "copyright", kind: "text", label: "Direitos autorais" },
    ],
    group: "layout",
    label: "Rodapé (Atlas Hosting)",
    render: (p, ctx) => (
      <footer className="at-foot">
        <div className="at-foot-grid">
          <div className="at-foot-brand">
            <a href={href(ctx, "/")}>
              {p.logo ? <img alt={p.logoAlt} src={p.logo} /> : p.logoAlt}
            </a>
            <p>
              {lines(p.tagline).map((l, i, a) => (
                <span key={l + i}>
                  {l}
                  {i < a.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <div className="at-socials">
              {p.socials.map((s, i) => (
                <a
                  href={href(ctx, s.url)}
                  key={s.label + i}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={s.label}
                >
                  {s.label.slice(0, 2)}
                </a>
              ))}
            </div>
          </div>
          <div className="at-foot-col">
            <h4>{p.menuTitle}</h4>
            <ul>
              {p.menu.map((l, i) => (
                <li key={l.label + i}>
                  <Icon name="check" />
                  <a href={href(ctx, l.url)}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="at-foot-col">
            <h4>{p.blogsTitle}</h4>
            <ul>
              {p.blogs.map((l, i) => (
                <li key={l.label + i}>
                  <Icon name="check" />
                  <a
                    href={href(ctx, l.url)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="at-foot-bar">
          <p>{p.copyright}</p>
          <span>
            {p.legal.map((l, i) => (
              <a href={href(ctx, l.url)} key={l.label + i}>
                {l.label}
              </a>
            ))}
          </span>
        </div>
      </footer>
    ),
    type: "atFooter",
  }
);

/* ───────────────────────── páginas de produto ───────────────────────── */

const atPageHero = defineBlock(
  z.object({
    backLabel: str("Voltar para o site"),
    backUrl: str("/#planos"),
    badge: str(),
    bullets: str(),
    rating: str(),
    ratingLabel: str("Nossos clientes dizem"),
    ratingWord: str("Excelente"),
    titleEnd: str(),
    titleHighlight: str(),
    titleStart: str(),
  }),
  {
    fields: [
      ...button("back", "link de voltar"),
      { key: "badge", kind: "text", label: "Selo" },
      { key: "titleStart", kind: "text", label: "Título — início" },
      { key: "titleHighlight", kind: "text", label: "Título — destaque" },
      { key: "titleEnd", kind: "text", label: "Título — fim" },
      { key: "bullets", kind: "textarea", label: "Vantagens (uma por linha)" },
      { key: "ratingLabel", kind: "text", label: "Avaliação — introdução" },
      { key: "ratingWord", kind: "text", label: "Avaliação — palavra" },
      { key: "rating", kind: "text", label: "Avaliação — detalhe" },
    ],
    group: "content",
    label: "Topo de página de produto (Atlas Hosting)",
    render: (p, ctx) => (
      <section className="at-phero">
        <div className="at-phero-in">
          <a className="at-back" href={href(ctx, p.backUrl)}>
            ← {p.backLabel}
          </a>
          <span className="at-pill at-pill-dot">{p.badge}</span>
          <h1>
            {p.titleStart} <em>{p.titleHighlight}</em> {p.titleEnd}
          </h1>
          <ul className="at-bullets">
            {lines(p.bullets).map((l, i) => (
              <li key={l + i}>
                <Icon name="check" />
                {l}
              </li>
            ))}
          </ul>
          <div className="at-rating">
            <b>{p.ratingLabel}</b>
            <b>{p.ratingWord}</b>
            <span className="at-stars">
              {[0, 1, 2, 3, 4].map(n => (
                <Icon key={n} name="star" />
              ))}
            </span>
            <small>{p.rating}</small>
          </div>
        </div>
      </section>
    ),
    type: "atPageHero",
  }
);

const atBenefits = defineBlock(
  z.object({
    items: z
      .array(z.object({ icon: str("star"), text: str(), title: str() }))
      .default([]),
    mapUrl: str(),
    regionHighlight: str(),
    regionStart: str(),
    regionText: str(),
    text: str(),
    titleHighlight: str(),
    titleStart: str(),
  }),
  {
    fields: [
      { key: "titleStart", kind: "text", label: "Título — início" },
      { key: "titleHighlight", kind: "text", label: "Título — destaque" },
      textField,
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
        key: "items",
        kind: "list",
        label: "Vantagens",
      },
      {
        key: "regionStart",
        kind: "textarea",
        label: "Regiões — título (uma linha por quebra)",
      },
      { key: "regionHighlight", kind: "text", label: "Regiões — destaque" },
      { key: "regionText", kind: "textarea", label: "Regiões — texto" },
      {
        key: "mapUrl",
        kind: "text",
        label: "Endereço do JSON do mapa animado (Lottie)",
      },
    ],
    group: "content",
    label: "Vantagens e regiões (Atlas Hosting)",
    render: p => (
      <section className="at-benefits">
        <div className="at-wrap">
          <div className="at-head-text">
            <h2>
              {p.titleStart} <em>{p.titleHighlight}</em>.
            </h2>
            <p>{p.text}</p>
          </div>
          <div className="at-benefit-grid">
            {p.items.map((it, i) => (
              <div className="at-benefit" key={it.title + i}>
                <span className="at-benefit-ico">
                  <Icon name={it.icon} />
                </span>
                <div>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="at-head-text at-region">
            <h3>
              {lines(p.regionStart).map((l, i) => (
                <span key={l + i}>
                  {l}
                  <br />
                </span>
              ))}
              <em>{p.regionHighlight}</em>.
            </h3>
            <p>{p.regionText}</p>
          </div>
          {p.mapUrl ? (
            <div className="at-map at-map-solo" data-sb-lottie={p.mapUrl} />
          ) : null}
        </div>
      </section>
    ),
    type: "atBenefits",
  }
);

/* ───────────────────────── legal e 404 ───────────────────────── */

const atLegal = defineBlock(
  z.object({
    description: str(),
    sections: z.array(z.object({ body: str(), title: str() })).default([]),
    title: str(),
    updated: str(),
  }),
  {
    fields: [
      titleField,
      { key: "description", kind: "textarea", label: "Descrição" },
      { key: "updated", kind: "text", label: "Última atualização" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título da seção" },
          {
            key: "body",
            kind: "textarea",
            label:
              "Texto (parágrafos separados por linha em branco; itens começam com “- ”)",
          },
        ],
        key: "sections",
        kind: "list",
        label: "Seções",
      },
    ],
    group: "content",
    label: "Página legal (Atlas Hosting)",
    render: p => (
      <section className="at-legal">
        <div className="at-legal-in">
          <h1>{p.title}</h1>
          <p className="at-legal-desc">{p.description}</p>
          {p.updated ? <small>{p.updated}</small> : null}
          {p.sections.map((s, i) => (
            <div className="at-legal-sec" key={s.title + i}>
              <h2>{s.title}</h2>
              {paragraphs(s.body).map((para, j) =>
                para.startsWith("- ") ? (
                  <ul key={para + j}>
                    {lines(para).map((l, k) => (
                      <li key={l + k}>{l.replace(/^-\s*/, "")}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={para + j}>{para}</p>
                )
              )}
            </div>
          ))}
        </div>
      </section>
    ),
    type: "atLegal",
  }
);

const atNotFound = defineBlock(
  z.object({
    buttonLabel: str("Voltar para o início"),
    buttonUrl: str("/"),
    text: str(),
    title: str("Página não encontrada"),
  }),
  {
    fields: [titleField, textField, ...button("button", "botão")],
    group: "content",
    label: "Página 404 (Atlas Hosting)",
    render: (p, ctx) => (
      <section className="at-404">
        <h1>{p.title}</h1>
        <p>{p.text}</p>
        <Btn ctx={ctx} url={p.buttonUrl}>
          {p.buttonLabel}
        </Btn>
      </section>
    ),
    type: "atNotFound",
  }
);

export const atlasBlocks: BlockDefinition[] = [
  atHeader,
  atHero,
  atStats,
  atPlans,
  atTestimonials,
  atChat,
  atFooter,
  atPageHero,
  atBenefits,
  atLegal,
  atNotFound,
];
