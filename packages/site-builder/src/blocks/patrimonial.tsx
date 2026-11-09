import type { ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos do tema Controle Patrimonial. Todo texto, imagem, link e item é prop editável; o visual vem de
 * `renderer/patrimonial.ts` (escopo `.sb-cp`). Contador e carrossel são ligados por `renderer/fx-runtime.ts`;
 * sem JS (e no editor) mostram o valor final e os primeiros cartões.
 */
const str = (d = "") => z.string().default(d);

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

/** Ícones sólidos do original (Font Awesome, via Elementor); `happy` e `compass` são de traço fino. */
const ICONS: Record<string, { d: string; line?: boolean; viewBox: string }> = {
  car: {
    d: "M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z",
    viewBox: "0 0 512 512",
  },
  clipboard: {
    d: "M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm144 418c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V118c0-3.3 2.7-6 6-6h42v36c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12v-36h42c3.3 0 6 2.7 6 6z",
    viewBox: "0 0 384 512",
  },
  compass: {
    d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z",
    line: true,
    viewBox: "0 0 24 24",
  },
  happy: {
    d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
    line: true,
    viewBox: "0 0 24 24",
  },
  money: {
    d: "M320 144c-53.02 0-96 50.14-96 112 0 61.85 42.98 112 96 112 53 0 96-50.13 96-112 0-61.86-42.98-112-96-112zm40 168c0 4.42-3.58 8-8 8h-64c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h16v-55.44l-.47.31a7.992 7.992 0 0 1-11.09-2.22l-8.88-13.31a7.992 7.992 0 0 1 2.22-11.09l15.33-10.22a23.99 23.99 0 0 1 13.31-4.03H328c4.42 0 8 3.58 8 8v88h16c4.42 0 8 3.58 8 8v16zM608 64H32C14.33 64 0 78.33 0 96v320c0 17.67 14.33 32 32 32h576c17.67 0 32-14.33 32-32V96c0-17.67-14.33-32-32-32zm-16 272c-35.35 0-64 28.65-64 64H112c0-35.35-28.65-64-64-64V176c35.35 0 64-28.65 64-64h416c0 35.35 28.65 64 64 64v160z",
    viewBox: "0 0 640 512",
  },
  star: {
    d: "M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z",
    viewBox: "0 0 576 512",
  },
  users: {
    d: "M610.5 341.3c2.6-14.1 2.6-28.5 0-42.6l25.8-14.9c3-1.7 4.3-5.2 3.3-8.5-6.7-21.6-18.2-41.2-33.2-57.4-2.3-2.5-6-3.1-9-1.4l-25.8 14.9c-10.9-9.3-23.4-16.5-36.9-21.3v-29.8c0-3.4-2.4-6.4-5.7-7.1-22.3-5-45-4.8-66.2 0-3.3.7-5.7 3.7-5.7 7.1v29.8c-13.5 4.8-26 12-36.9 21.3l-25.8-14.9c-2.9-1.7-6.7-1.1-9 1.4-15 16.2-26.5 35.8-33.2 57.4-1 3.3.4 6.8 3.3 8.5l25.8 14.9c-2.6 14.1-2.6 28.5 0 42.6l-25.8 14.9c-3 1.7-4.3 5.2-3.3 8.5 6.7 21.6 18.2 41.1 33.2 57.4 2.3 2.5 6 3.1 9 1.4l25.8-14.9c10.9 9.3 23.4 16.5 36.9 21.3v29.8c0 3.4 2.4 6.4 5.7 7.1 22.3 5 45 4.8 66.2 0 3.3-.7 5.7-3.7 5.7-7.1v-29.8c13.5-4.8 26-12 36.9-21.3l25.8 14.9c2.9 1.7 6.7 1.1 9-1.4 15-16.2 26.5-35.8 33.2-57.4 1-3.3-.4-6.8-3.3-8.5l-25.8-14.9zM496 368.5c-26.8 0-48.5-21.8-48.5-48.5s21.8-48.5 48.5-48.5 48.5 21.8 48.5 48.5-21.7 48.5-48.5 48.5zM96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm224 32c1.9 0 3.7-.5 5.6-.6 8.3-21.7 20.5-42.1 36.3-59.2 7.4-8 17.9-12.6 28.9-12.6 6.9 0 13.7 1.8 19.6 5.3l7.9 4.6c.8-.5 1.6-.9 2.4-1.4 7-14.6 11.2-30.8 11.2-48 0-61.9-50.1-112-112-112S208 82.1 208 144c0 61.9 50.1 112 112 112zm105.2 194.5c-2.3-1.2-4.6-2.6-6.8-3.9-8.2 4.8-15.3 9.8-27.5 9.8-10.9 0-21.4-4.6-28.9-12.6-18.3-19.8-32.3-43.9-40.2-69.6-10.7-34.5 24.9-49.7 25.8-50.3-.1-2.6-.1-5.2 0-7.8l-7.9-4.6c-3.8-2.2-7-5-9.8-8.1-3.3.2-6.5.6-9.8.6-24.6 0-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h255.4c-3.7-6-6.2-12.8-6.2-20.3v-9.2zM173.1 274.6C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z",
    viewBox: "0 0 640 512",
  },
};

const CHECK =
  "M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z";

const ICON_OPTIONS = [
  { label: "Prancheta", value: "clipboard" },
  { label: "Rosto feliz", value: "happy" },
  { label: "Bússola", value: "compass" },
  { label: "Estrela", value: "star" },
  { label: "Carro", value: "car" },
  { label: "Dinheiro", value: "money" },
  { label: "Pessoas e engrenagem", value: "users" },
];

function Icon({ name }: { name: string }) {
  const icon = ICONS[name] ?? ICONS.star;
  if (!icon) return null;
  return (
    <svg
      aria-hidden="true"
      className={icon.line ? "line" : undefined}
      viewBox={icon.viewBox}
    >
      <path d={icon.d} />
    </svg>
  );
}

function CheckList({ className, text }: { className?: string; text: string }) {
  return (
    <ul className={["cp-check", className].filter(Boolean).join(" ")}>
      {lines(text).map((l, i) => (
        <li key={l + i}>
          <svg aria-hidden="true" viewBox="0 0 512 512">
            <path d={CHECK} />
          </svg>
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

function Btn({
  children,
  ctx,
  tone,
  url,
}: {
  children: ReactNode;
  ctx: RenderContext;
  tone?: "light" | "outline";
  url: string;
}) {
  if (!children) return null;
  return (
    <a
      className={["cp-btn", tone].filter(Boolean).join(" ")}
      href={href(ctx, url)}
    >
      {children}
    </a>
  );
}

const button = (key: string, label: string): FieldDef[] => [
  { key: `${key}Label`, kind: "text", label: `Texto do ${label}` },
  { key: `${key}Url`, kind: "url", label: `Link do ${label}` },
];

const eyebrowField: FieldDef = {
  key: "eyebrow",
  kind: "text",
  label: "Texto acima do título",
};
const titleField: FieldDef = { key: "title", kind: "text", label: "Título" };
const textField: FieldDef = { key: "text", kind: "textarea", label: "Texto" };

/* ───────────────────────── cabeçalho ───────────────────────── */

const cpHeader = defineBlock(
  z.object({
    buttonLabel: str("Login"),
    buttonUrl: str("#"),
    logo: str(),
    logoAlt: str(),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoAlt", kind: "text", label: "Nome da logo (acessibilidade)" },
      ...button("button", "botão"),
    ],
    group: "layout",
    label: "Cabeçalho (Controle Patrimonial)",
    render: (p, ctx) => (
      <header className="cp-head">
        <div className="cp-wrap cp-head-in">
          <a className="cp-head-logo" href={href(ctx, "/")}>
            <Img alt={p.logoAlt} src={p.logo} />
          </a>
          <div className="cp-head-action">
            <Btn ctx={ctx} url={p.buttonUrl}>
              {p.buttonLabel}
            </Btn>
          </div>
        </div>
      </header>
    ),
    type: "cpHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

const cpHero = defineBlock(
  z.object({
    badgeText: str(),
    badgeTitle: str(),
    button2Label: str(),
    button2Url: str("#"),
    buttonLabel: str("Saiba mais"),
    buttonUrl: str("#"),
    eyebrow: str(),
    image: str(),
    note: str(),
    text: str(),
    title: str("Título principal"),
  }),
  {
    fields: [
      eyebrowField,
      titleField,
      textField,
      { key: "note", kind: "text", label: "Frase sublinhada" },
      ...button("button", "botão principal"),
      ...button("button2", "segundo botão"),
      { key: "image", kind: "image", label: "Imagem" },
      { key: "badgeTitle", kind: "text", label: "Selo: título" },
      { key: "badgeText", kind: "textarea", label: "Selo: texto" },
    ],
    group: "content",
    label: "Hero (Controle Patrimonial)",
    render: (p, ctx) => (
      <section className="cp-wrap cp-hero">
        <div className="cp-hero-text">
          {p.eyebrow ? <h2 className="cp-eyebrow">{p.eyebrow}</h2> : null}
          <h1 className="cp-hero-title">{p.title}</h1>
          <div className="cp-hero-lead">
            {paragraphs(p.text).map(t => (
              <p key={t}>{t}</p>
            ))}
            {p.note ? <p className="note">{p.note}</p> : null}
          </div>
          <div className="cp-hero-btns">
            <div>
              <Btn ctx={ctx} url={p.buttonUrl}>
                {p.buttonLabel}
              </Btn>
            </div>
            <div>
              <Btn ctx={ctx} tone="outline" url={p.button2Url}>
                {p.button2Label}
              </Btn>
            </div>
          </div>
        </div>
        <div className="cp-hero-media">
          <div className="cp-hero-img">
            <Img src={p.image} />
          </div>
          {p.badgeTitle || p.badgeText ? (
            <div className="cp-hero-badge">
              <h3>{p.badgeTitle}</h3>
              <p>{p.badgeText}</p>
            </div>
          ) : null}
        </div>
      </section>
    ),
    type: "cpHero",
  }
);

/* ───────────────────────── números ───────────────────────── */

const cpStats = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          icon: str("star"),
          label: str(),
          suffix: str(),
          value: z.coerce.number().int().min(0).default(0).catch(0),
        })
      )
      .default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          {
            key: "icon",
            kind: "select",
            label: "Ícone",
            options: ICON_OPTIONS,
          },
          { key: "value", kind: "number", label: "Número final" },
          { key: "suffix", kind: "text", label: "Sufixo (+, %)" },
          { key: "label", kind: "text", label: "Legenda" },
        ],
        key: "items",
        kind: "list",
        label: "Números",
      },
    ],
    group: "content",
    label: "Números com contador (Controle Patrimonial)",
    render: p => (
      <section className="cp-wrap cp-stats">
        <div className="cp-stats-box">
          {p.items.map((it, i) => (
            <div className="cp-stat" key={it.label + i}>
              <div className="cp-stat-top">
                <span className="cp-stat-icon">
                  <Icon name={it.icon} />
                </span>
                <span className="cp-stat-num">
                  <span data-ms="2000" data-sb-count={it.value}>
                    {it.value}
                  </span>
                  {it.suffix}
                </span>
              </div>
              <div className="cp-stat-label">{it.label}</div>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "cpStats",
  }
);

/* ───────────────────────── carrossel ───────────────────────── */

const cpSlider = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str("#"),
    delay: z.coerce
      .number()
      .int()
      .min(1000)
      .max(20000)
      .default(3000)
      .catch(3000),
    eyebrow: str(),
    items: z
      .array(
        z.object({
          image: str(),
          subtitle: str(),
          text: str(),
          title: str(),
          url: str(),
        })
      )
      .default([]),
    title: str("Título"),
  }),
  {
    fields: [
      eyebrowField,
      titleField,
      ...button("button", "botão"),
      {
        key: "delay",
        kind: "number",
        label: "Tempo em cada cartão (milissegundos)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "title", kind: "text", label: "Título" },
          { key: "subtitle", kind: "text", label: "Subtítulo" },
          { key: "text", kind: "text", label: "Descrição" },
          { key: "url", kind: "url", label: "Link do título (opcional)" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "media",
    label: "Carrossel de cartões (Controle Patrimonial)",
    render: (p, ctx) => (
      <section className="cp-slider">
        <div className="cp-wrap cp-slider-head">
          {p.eyebrow ? <h2 className="cp-eyebrow">{p.eyebrow}</h2> : null}
          <h3 className="cp-slider-title">{p.title}</h3>
          <div className="cp-slider-action">
            <Btn ctx={ctx} url={p.buttonUrl}>
              {p.buttonLabel}
            </Btn>
          </div>
        </div>
        <div
          className="cp-slider-box"
          data-delay={p.delay}
          data-sb-slider="1"
          data-speed="1000"
        >
          <div className="cp-slider-view">
            <div className="cp-slider-track">
              {p.items.map((it, i) => (
                <div className="cp-slide" key={it.title + i}>
                  <div className="cp-card">
                    <Img src={it.image} />
                    <div className="cp-card-body">
                      <div className="cp-card-head">
                        <h6>
                          {it.url ? (
                            <a href={href(ctx, it.url)}>{it.title}</a>
                          ) : (
                            it.title
                          )}
                        </h6>
                        <span className="cp-card-sub">{it.subtitle}</span>
                      </div>
                      <p>{it.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="cp-dots">
            {p.items.map((it, i) => (
              <button
                aria-label={`Ir para o cartão ${i + 1}`}
                className={i === 0 ? "cp-dot on" : "cp-dot"}
                key={it.title + i}
                type="button"
              />
            ))}
          </div>
        </div>
      </section>
    ),
    type: "cpSlider",
  }
);

/* ───────────────────────── duas imagens + lista ───────────────────────── */

const cpAbout = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str("#"),
    eyebrow: str(),
    image: str(),
    image2: str(),
    listA: str(),
    listB: str(),
    subtitle: str(),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem principal" },
      { key: "image2", kind: "image", label: "Imagem sobreposta" },
      eyebrowField,
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Título grande" },
      textField,
      { key: "listA", kind: "textarea", label: "Lista 1 (um item por linha)" },
      { key: "listB", kind: "textarea", label: "Lista 2 (um item por linha)" },
      ...button("button", "botão"),
    ],
    group: "content",
    label: "Imagens e lista (Controle Patrimonial)",
    render: (p, ctx) => (
      <section className="cp-wrap cp-about">
        <div className="cp-about-media">
          <div className="cp-about-main">
            <Img src={p.image} />
          </div>
          <div className="cp-about-side">
            <Img src={p.image2} />
          </div>
        </div>
        <div className="cp-about-text">
          {p.title ? <h2 className="cp-eyebrow">{p.title}</h2> : null}
          <h3 className="cp-h3">{p.subtitle}</h3>
          <p>{p.text}</p>
          <CheckList className="cp-about-list" text={p.listA} />
          <CheckList className="cp-about-list" text={p.listB} />
          <div className="cp-about-action">
            <Btn ctx={ctx} url={p.buttonUrl}>
              {p.buttonLabel}
            </Btn>
          </div>
        </div>
      </section>
    ),
    type: "cpAbout",
  }
);

/* ───────────────────────── faixa escura + foto ───────────────────────── */

const cpSplit = defineBlock(
  z.object({
    eyebrow: str(),
    image: str(),
    items: z
      .array(z.object({ icon: str("star"), text: str(), title: str() }))
      .default([]),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      eyebrowField,
      titleField,
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
      { key: "image", kind: "image", label: "Foto da direita" },
    ],
    group: "content",
    label: "Faixa escura com foto (Controle Patrimonial)",
    render: p => (
      <section className="cp-split">
        <div className="cp-split-text">
          {p.eyebrow ? <h2 className="cp-eyebrow">{p.eyebrow}</h2> : null}
          <h3 className="cp-split-title">{p.title}</h3>
          <p className="cp-split-lead">{p.text}</p>
          {p.items.map((it, i) => (
            <div className="cp-ibox" key={it.title + i}>
              <span className="cp-ibox-icon">
                <Icon name={it.icon} />
              </span>
              <div>
                <h4 className="cp-h4">{it.title}</h4>
                <p>{it.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div
          className="cp-split-img"
          style={{ backgroundImage: cssUrl(p.image) }}
        />
      </section>
    ),
    type: "cpSplit",
  }
);

/* ───────────────────────── cartões com foto ───────────────────────── */

const cpSteps = defineBlock(
  z.object({
    eyebrow: str(),
    items: z
      .array(
        z.object({
          buttonLabel: str(),
          buttonUrl: str("#"),
          image: str(),
          text: str(),
          title: str(),
        })
      )
      .default([]),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      eyebrowField,
      titleField,
      textField,
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto de fundo" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "buttonLabel", kind: "text", label: "Texto do botão" },
          { key: "buttonUrl", kind: "url", label: "Link do botão" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "Cartões sobre foto (Controle Patrimonial)",
    render: (p, ctx) => (
      <section className="cp-wrap cp-steps cp-center">
        {p.eyebrow ? (
          <h2 className="cp-eyebrow cp-section-eyebrow">{p.eyebrow}</h2>
        ) : null}
        <h3 className="cp-h3">{p.title}</h3>
        <p className="cp-center-text">{p.text}</p>
        <div className="cp-steps-grid">
          {p.items.map((it, i) => (
            <article
              className="cp-step"
              key={it.title + i}
              style={{ backgroundImage: cssUrl(it.image), textAlign: "start" }}
            >
              <div className="cp-step-in">
                <div className="cp-step-text">
                  <h4 className="cp-h4">{it.title}</h4>
                  <p>{it.text}</p>
                </div>
                <div className="cp-step-action">
                  <Btn ctx={ctx} url={it.buttonUrl}>
                    {it.buttonLabel}
                  </Btn>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    ),
    type: "cpSteps",
  }
);

/* ───────────────────────── vídeo ───────────────────────── */

const cpVideo = defineBlock(z.object({ title: str(), videoUrl: str() }), {
  fields: [
    titleField,
    { key: "videoUrl", kind: "url", label: "Vídeo (YouTube ou Vimeo)" },
  ],
  group: "media",
  label: "Vídeo incorporado (Controle Patrimonial)",
  render: p => {
    const embed = popupVideoEmbed(p.videoUrl);
    const src = embed?.startsWith("https://player.vimeo.com")
      ? `${embed}${embed.includes("?") ? "&" : "?"}autopause=0&title=0&portrait=0&byline=0`
      : embed;
    return (
      <section className="cp-wrap cp-video">
        {p.title ? <h2 className="cp-video-title">{p.title}</h2> : null}
        <div className="cp-video-frame">
          {src ? (
            <iframe
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              src={src}
              title={p.title || "Vídeo"}
            />
          ) : null}
        </div>
        <div className="cp-video-space" />
      </section>
    );
  },
  type: "cpVideo",
});

/* ───────────────────────── depoimentos ───────────────────────── */

const cpTestimonials = defineBlock(
  z.object({
    eyebrow: str(),
    items: z
      .array(
        z.object({
          image: str(),
          name: str(),
          role: str(),
          text: str(),
          tone: z
            .enum(["dark", "light", "accent"])
            .default("light")
            .catch("light"),
        })
      )
      .default([]),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      eyebrowField,
      titleField,
      textField,
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
          {
            key: "tone",
            kind: "select",
            label: "Cor do cartão",
            options: [
              { label: "Escuro", value: "dark" },
              { label: "Claro", value: "light" },
              { label: "Destaque", value: "accent" },
            ],
          },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
    ],
    group: "content",
    label: "Depoimentos (Controle Patrimonial)",
    render: p => (
      <section className="cp-wrap cp-depo cp-center">
        {p.eyebrow ? (
          <h2 className="cp-eyebrow cp-section-eyebrow">{p.eyebrow}</h2>
        ) : null}
        <h3 className="cp-h3">{p.title}</h3>
        <p className="cp-center-text">{p.text}</p>
        <div className="cp-depo-grid">
          {p.items.map((it, i) => (
            <figure
              className={`cp-depo-card ${it.tone}`}
              key={it.name + i}
              style={{ margin: 0 }}
            >
              <blockquote style={{ margin: 0 }}>{it.text}</blockquote>
              <Img src={it.image} />
              <figcaption>
                <span className="cp-depo-name">{it.name}</span>
                <span className="cp-depo-role">{it.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    ),
    type: "cpTestimonials",
  }
);

/* ───────────────────────── oferta ───────────────────────── */

const cpOffer = defineBlock(
  z.object({
    buttonLabel: str("Contratar"),
    buttonUrl: str("#"),
    list: str(),
    period: str(),
    price: str(),
    sideText: str(),
    sideTitle: str(),
    subtitle: str(),
    tag: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "tag", kind: "text", label: "Etiqueta" },
      titleField,
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      { key: "price", kind: "text", label: "Preço" },
      { key: "period", kind: "text", label: "Período" },
      { key: "list", kind: "textarea", label: "Benefícios (um por linha)" },
      ...button("button", "botão"),
      { key: "sideTitle", kind: "text", label: "Título ao lado" },
      { key: "sideText", kind: "textarea", label: "Texto ao lado" },
    ],
    group: "content",
    label: "Oferta com preço (Controle Patrimonial)",
    render: (p, ctx) => (
      <section className="cp-wrap cp-offer">
        <div className="cp-offer-box">
          <div className="cp-offer-left">
            <div className="cp-offer-card">
              {p.tag ? <span className="cp-offer-tag">{p.tag}</span> : null}
              <h1 className="cp-offer-title">{p.title}</h1>
              <h2 className="cp-offer-sub">{p.subtitle}</h2>
              <h2 className="cp-offer-price">{p.price}</h2>
              <h2 className="cp-offer-period">{p.period}</h2>
              <CheckList text={p.list} />
              <Btn ctx={ctx} tone="light" url={p.buttonUrl}>
                {p.buttonLabel}
              </Btn>
            </div>
          </div>
          <div className="cp-offer-right">
            <h3 className="cp-h3">{p.sideTitle}</h3>
            <p>{p.sideText}</p>
          </div>
        </div>
      </section>
    ),
    type: "cpOffer",
  }
);

/* ───────────────────────── FAQ ───────────────────────── */

const cpFaq = defineBlock(
  z.object({
    background: str(),
    eyebrow: str(),
    items: z.array(z.object({ answer: str(), question: str() })).default([]),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "background", kind: "image", label: "Imagem de fundo" },
      eyebrowField,
      titleField,
      textField,
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
    label: "Perguntas frequentes (Controle Patrimonial)",
    render: p => (
      <section
        className="cp-faq"
        style={{ backgroundImage: cssUrl(p.background) }}
      >
        <div className="cp-wrap cp-faq-in">
          <div className="cp-faq-text">
            {p.eyebrow ? <h2 className="cp-eyebrow">{p.eyebrow}</h2> : null}
            <h3 className="cp-h3">{p.title}</h3>
            <p>{p.text}</p>
          </div>
          <div className="cp-faq-list">
            {p.items.map((it, i) => (
              <details
                className="cp-faq-item"
                key={it.question + i}
                name="sb-cp-faq"
                open={i === 0}
              >
                <summary>
                  <h5>{it.question}</h5>
                  <svg
                    aria-hidden="true"
                    className="cp-faq-chev"
                    viewBox="0 0 24 24"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="cp-faq-a">
                  <p>{it.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "cpFaq",
  }
);

/* ───────────────────────── rodapé e 404 ───────────────────────── */

const cpFooter = defineBlock(z.object({ copyright: str() }), {
  fields: [{ key: "copyright", kind: "text", label: "Texto do rodapé" }],
  group: "layout",
  label: "Rodapé (Controle Patrimonial)",
  render: p => (
    <footer className="cp-foot">
      <div className="cp-wrap">
        <hr />
        <p>{p.copyright}</p>
      </div>
    </footer>
  ),
  type: "cpFooter",
});

const cpNotFound = defineBlock(
  z.object({
    buttonLabel: str("Voltar para o início"),
    buttonUrl: str("/"),
    text: str(),
    title: str("Página não encontrada"),
  }),
  {
    fields: [titleField, textField, ...button("button", "botão")],
    group: "content",
    label: "Página 404 (Controle Patrimonial)",
    render: (p, ctx) => (
      <section className="cp-wrap cp-404">
        <h1 className="cp-h3">{p.title}</h1>
        <p>{p.text}</p>
        <Btn ctx={ctx} url={p.buttonUrl}>
          {p.buttonLabel}
        </Btn>
      </section>
    ),
    type: "cpNotFound",
  }
);

export const patrimonialBlocks: BlockDefinition[] = [
  cpHeader,
  cpHero,
  cpStats,
  cpSlider,
  cpAbout,
  cpSplit,
  cpSteps,
  cpVideo,
  cpTestimonials,
  cpOffer,
  cpFaq,
  cpFooter,
  cpNotFound,
];
