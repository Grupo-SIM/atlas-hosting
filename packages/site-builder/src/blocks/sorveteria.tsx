import type { CSSProperties } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { href, Img, newTab, SocialIcon, safeUrl } from "./helpers.js";
import { SiCar } from "./sim-lib.js";
import {
  anchorHref,
  FrIcon,
  FrInstagram,
  FrWhatsapp,
  flag,
  getUnits,
  hoursSpec,
  hoursText,
  int,
  isCurrent,
  isWhatsappUrl,
  storeTimezone,
  str,
  UNIT_FIELDS,
  unitSchema,
  unitsJsonLd,
  waUnitLink,
} from "./sorveteria-lib.js";
import type { BlockDefinition } from "./types.js";

/**
 * Blocos do template "Frescor — Sorveteria, Açaí e Pizza" (`fr*`): cabeçalho com logo grande e menu em tela cheia no
 * celular, hero em slides, cartões de pedido por unidade, "Fale com a gente" com seletor de unidade, rodapé com status
 * de horário e as seções de "Nossa História". As unidades (nome, endereço, telefone, horário) são cadastradas **uma
 * vez**, na lista "Unidades" do rodapé (`frFooter`), e lidas por cartões, seletor, rodapé e dados estruturados. O fuso
 * dos horários e a mensagem do WhatsApp ficam em `site.theme` (`timezone`, `waMessage`).
 */

const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

const hex = (v: string, fallback: string) =>
  /^#[0-9a-f]{3,8}$/i.test(v.trim()) ? v.trim() : fallback;

/** Onda do hero: faixa ciano, faixa amarela (12px de traço, mesma curva) e a área de baixo preenchida. */
function Wave({ fill }: { fill: string }) {
  const first = "M0,40 C320,100 420,0 720,40 C1020,80 1120,-20 1440,40";
  const second = "M0,52 C320,112 420,12 720,52 C1020,92 1120,-8 1440,52";
  return (
    <div
      aria-hidden="true"
      className="fr-wave"
      style={fill ? ({ "--fr-wave-fill": fill } as CSSProperties) : undefined}
    >
      <svg preserveAspectRatio="none" viewBox="0 0 1440 120">
        <path
          d={`${second} L1440,120 L0,120 Z`}
          fill={fill ? "var(--fr-wave-fill)" : "var(--fr-blue)"}
        />
        <path
          d={first}
          fill="none"
          stroke="var(--fr-cyan)"
          strokeWidth="12"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={second}
          fill="none"
          stroke="var(--fr-yellow)"
          strokeWidth="12"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Onda curta do pé da faixa de título e da 404: linha amarela sobre a cor da página. */
function SoftWave() {
  return (
    <div aria-hidden="true" className="fr-hh-wave">
      <svg preserveAspectRatio="none" viewBox="0 0 1440 80">
        <path
          d="M0,30 C320,70 420,0 720,30 C1020,60 1120,-10 1440,30 L1440,80 L0,80 Z"
          fill="var(--fr-page)"
        />
        <path
          d="M0,30 C320,70 420,0 720,30 C1020,60 1120,-10 1440,30"
          fill="none"
          stroke="var(--fr-yellow)"
          strokeWidth="6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/* ───────────────────────── cabeçalho ───────────────────────── */

const frHeader = defineBlock(
  z.object({
    highlight: str("Cardápio"),
    logo: str(),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo (160px; desce sobre o hero)" },
      {
        key: "highlight",
        kind: "text",
        label: "Item do menu em amarelo (o nome do link)",
      },
    ],
    group: "layout",
    label: "Cabeçalho (Frescor)",
    render: (p, ctx) => {
      const items = ctx.site.menu.filter(m => !m.dynamic);
      const pill = (m: { href: string; label: string }) => (
        <li key={m.href + m.label}>
          <a
            aria-current={isCurrent(ctx, m.href) ? "page" : undefined}
            className={
              m.label === p.highlight && p.highlight
                ? "fr-pill is-cta"
                : "fr-pill"
            }
            href={anchorHref(ctx, m.href)}
          >
            {m.label}
          </a>
        </li>
      );
      return (
        <div className="fr-head">
          {/* biome-ignore lint/correctness/useUniqueElementIds: o botão e o fundo do menu usam label for=id; há um menu por página */}
          <input
            aria-label="Abrir menu"
            className="fr-burger-input"
            id="sb-burger"
            type="checkbox"
          />
          <header className="fr-bar">
            <div className="fr-bar-in">
              <a
                aria-label={ctx.site.name}
                className="fr-logo"
                href={href(ctx, "/")}
              >
                {p.logo ? <Img alt="" src={p.logo} /> : null}
              </a>
              <nav aria-label="Menu principal" className="fr-nav">
                <ul>{items.map(pill)}</ul>
              </nav>
              <label
                aria-label="Abrir menu"
                className="fr-burger-btn"
                htmlFor="sb-burger"
              >
                <FrIcon name="menu" />
              </label>
            </div>
          </header>
          <aside aria-label="Menu" className="fr-full">
            <label
              aria-label="Fechar menu"
              className="fr-full-bg"
              htmlFor="sb-burger"
            />
            <label
              aria-label="Fechar menu"
              className="fr-full-x"
              htmlFor="sb-burger"
            >
              <FrIcon name="close" />
            </label>
            <div className="fr-full-in">
              <a
                aria-label={ctx.site.name}
                className="fr-full-logo"
                href={href(ctx, "/")}
              >
                {p.logo ? <Img alt="" src={p.logo} /> : null}
              </a>
              <ul>{items.map(pill)}</ul>
            </div>
          </aside>
        </div>
      );
    },
    type: "frHeader",
  }
);

/* ───────────────────────── hero em slides ───────────────────────── */

const slideItem = z.object({
  alt: str(),
  btnBg: str("#0012FF"),
  btnFg: str("#FFFFFF"),
  c1: str("#FFE100"),
  c2: str("#FFB800"),
  c3: str("#FF9500"),
  ctaLabel: str("Pedir agora"),
  ctaUrl: str("#cardapio"),
  image: str(),
  line1: str(),
  line2: str(),
  smoke: flag("no"),
  word: str(),
});

/** Fade de 800 ms; o autoplay não para ao interagir (`pause={false}`). */
const carDefaults = {
  gap: 0,
  perView: 1,
  perViewMobile: 1,
  perViewTablet: 1,
  speed: 800,
};

const frHero = defineBlock(
  z.object({
    seconds: int(2, 30, 5),
    slides: z.array(slideItem).default([]).catch([]),
    title: str(),
    waveFill: str(),
  }),
  {
    fields: [
      {
        itemFields: [
          {
            key: "word",
            kind: "text",
            label: "Palavra gigante (AÇAÍ, SORVETE…)",
          },
          { key: "line1", kind: "text", label: "Subtítulo, linha 1" },
          { key: "line2", kind: "text", label: "Subtítulo, linha 2" },
          { key: "image", kind: "image", label: "Foto do produto" },
          { key: "alt", kind: "text", label: "Descrição da foto" },
          { key: "ctaLabel", kind: "text", label: "Texto do botão" },
          { key: "ctaUrl", kind: "url", label: "Destino do botão" },
          { key: "c1", kind: "color", label: "Degradê: início (topo)" },
          { key: "c2", kind: "color", label: "Degradê: meio" },
          { key: "c3", kind: "color", label: "Degradê: fim (base)" },
          { key: "btnBg", kind: "color", label: "Cor do botão" },
          { key: "btnFg", kind: "color", label: "Cor do texto do botão" },
          {
            key: "smoke",
            kind: "select",
            label: "Fumaça saindo do produto",
            options: YES_NO,
          },
        ],
        key: "slides",
        kind: "list",
        label: "Slides",
      },
      { key: "seconds", kind: "number", label: "Segundos entre os slides" },
      {
        key: "title",
        kind: "text",
        label: "Título da página (h1, fica oculto; vazio = nome do site)",
      },
      {
        key: "waveFill",
        kind: "color",
        label:
          "Cor da onda do pé (vazio = azul da marca; use a cor da seção de baixo para uma onda contínua)",
      },
    ],
    group: "content",
    label: "Hero em slides (Frescor)",
    render: (p, ctx) => (
      <section className={ctx.mode === "edit" ? "fr-hero is-edit" : "fr-hero"}>
        <h1 className="fr-sr">{p.title || ctx.site.name}</h1>
        <SiCar
          arrows="inside"
          dots
          items={p.slides.map((s, i) => (
            <div
              className="fr-slide"
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do slide
              key={i}
              style={
                {
                  "--fr-cta-bg": hex(s.btnBg, "#0012FF"),
                  "--fr-cta-fg": hex(s.btnFg, "#FFFFFF"),
                  "--fr-grad": `linear-gradient(160deg, ${hex(s.c1, "#FFE100")} 0%, ${hex(s.c2, "#FFB800")} 50%, ${hex(s.c3, "#FF9500")} 100%)`,
                } as CSSProperties
              }
            >
              <div className="fr-slide-in">
                <div className="fr-slide-txt">
                  <h2 className="fr-word">{s.word}</h2>
                  <p className="fr-sub">
                    {s.line1}
                    {s.line2 ? (
                      <>
                        <br />
                        {s.line2}
                      </>
                    ) : null}
                  </p>
                  {s.ctaLabel ? (
                    <a
                      className="fr-cta"
                      href={anchorHref(ctx, s.ctaUrl || "#cardapio")}
                      {...newTab(s.ctaUrl)}
                    >
                      {s.ctaLabel}
                    </a>
                  ) : null}
                </div>
                <div className="fr-prod">
                  <Img alt={s.alt} className="fr-prod-img" src={s.image} />
                  {s.smoke === "yes" ? (
                    <div aria-hidden="true" className="fr-smoke">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          p={{ ...carDefaults, delay: p.seconds * 1000 }}
          pause={false}
          transition="fade"
        />
        <Wave fill={hex(p.waveFill, "")} />
      </section>
    ),
    type: "frHero",
  }
);

/* ───────────────────────── cartões de pedido ───────────────────────── */

const orderButton = z.object({
  label: str(),
  /** `yes` = abre o WhatsApp da unidade ligada ao cartão (o número vem de "Unidades", no rodapé). */
  own: flag("no"),
  url: str(),
});

const cardItem = z.object({
  buttons: z.array(orderButton).default([]).catch([]),
  color: z.enum(["blue", "cyan", "yellow"]).default("blue").catch("blue"),
  image: str(),
  title: str(),
  type: z.enum(["unit", "club", "instagram"]).default("unit").catch("unit"),
  /** Nº da unidade (1 = a primeira da lista "Unidades"); 0 = nenhuma. */
  unit: int(0, 30, 0),
});

const frOrderCards = defineBlock(
  z.object({
    cards: z.array(cardItem).default([]).catch([]),
    subtitle: str("Escolha sua unidade e faça seu pedido"),
    title: str("Nosso Cardápio"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          {
            key: "type",
            kind: "select",
            label: "Tipo do cartão",
            options: [
              { label: "Unidade (loja)", value: "unit" },
              { label: "Clube de vantagens", value: "club" },
              { label: "Instagram", value: "instagram" },
            ],
          },
          {
            key: "color",
            kind: "select",
            label: "Cor (só unidade)",
            options: [
              { label: "Azul", value: "blue" },
              { label: "Ciano", value: "cyan" },
              { label: "Amarelo", value: "yellow" },
            ],
            showWhen: { equals: "unit", key: "type" },
          },
          {
            key: "unit",
            kind: "number",
            label:
              "Nº da unidade em “Unidades” (rodapé): 1, 2, 3… (0 = nenhuma)",
            showWhen: { equals: "unit", key: "type" },
          },
          {
            key: "title",
            kind: "text",
            label: "Título (vazio = nome da unidade)",
          },
          {
            key: "image",
            kind: "image",
            label: "Imagem (fachada, mascote ou ícone)",
          },
          {
            itemFields: [
              { key: "label", kind: "text", label: "Texto do botão" },
              {
                key: "url",
                kind: "url",
                label:
                  "Link (vazio = o botão não aparece; links do WhatsApp ficam verdes)",
              },
              {
                key: "own",
                kind: "select",
                label: "Abrir o WhatsApp da unidade deste cartão",
                options: YES_NO,
              },
            ],
            key: "buttons",
            kind: "list",
            label: "Botões de pedido",
          },
        ],
        key: "cards",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "Cartões de pedido (Frescor)",
    render: (p, ctx) => {
      const units = getUnits(ctx);
      return (
        <section className="fr-order">
          <div className="fr-order-in">
            <h2 className="fr-h2">{p.title}</h2>
            <p className="fr-lead">{p.subtitle}</p>
            <div className="fr-grid">
              {p.cards.map((c, i) => {
                const unit = c.unit > 0 ? units[c.unit - 1] : undefined;
                const kind =
                  c.type === "club"
                    ? "club"
                    : c.type === "instagram"
                      ? "insta"
                      : c.color;
                const buttons = c.buttons
                  .map(b => {
                    const url =
                      b.own === "yes" && unit
                        ? waUnitLink(ctx, unit)
                        : b.url.trim();
                    return { label: b.label, url };
                  })
                  .filter(b => b.label && b.url);
                return (
                  <article
                    className={`fr-card fr-c-${kind}`}
                    // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do cartão
                    key={i}
                  >
                    <div className="fr-card-in">
                      <div className="fr-card-img">
                        {c.image ? (
                          <Img alt="" src={c.image} />
                        ) : c.type === "instagram" ? (
                          <FrInstagram className="fr-ig-ico" />
                        ) : null}
                      </div>
                      <div className="fr-card-txt">
                        <h3 className="fr-card-title">
                          {c.title || unit?.name || ""}
                        </h3>
                        <div className="fr-card-btns">
                          {buttons.map(b => {
                            const wa = isWhatsappUrl(b.url);
                            return (
                              <a
                                className={`fr-btn ${wa ? "fr-btn-wa" : "fr-btn-white"}`}
                                href={safeUrl(
                                  b.url.startsWith("/")
                                    ? href(ctx, b.url)
                                    : anchorHref(ctx, b.url)
                                )}
                                key={b.label + b.url}
                                {...newTab(b.url)}
                              >
                                {wa ? <FrWhatsapp /> : null}
                                {b.label}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
    type: "frOrderCards",
  }
);

/* ───────────────────────── fale com a gente ───────────────────────── */

const frContact = defineBlock(
  z.object({
    buttonLabel: str("WhatsApp {unidade}"),
    instagramLabel: str("Instagram!"),
    instagramUrl: str("https://instagram.com/"),
    lastText: str("Para falar com a gente é mais rápido pelo nosso"),
    pickLabel: str("Qual unidade deseja falar?"),
    placeholder: str("Selecione a unidade"),
    text: str("Peça direto pelo WhatsApp e receba em casa"),
    title: str("Fale com a gente!"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "text", label: "Texto" },
      { key: "pickLabel", kind: "text", label: "Pergunta do seletor" },
      { key: "placeholder", kind: "text", label: "Primeira opção do seletor" },
      {
        key: "buttonLabel",
        kind: "text",
        label: "Texto do botão ({unidade} = nome da unidade)",
      },
      {
        key: "lastText",
        kind: "text",
        label: "Frase final (vazia = sem a linha do Instagram)",
      },
      { key: "instagramLabel", kind: "text", label: "Texto do link" },
      {
        key: "instagramUrl",
        kind: "url",
        label: "Link do direct do Instagram (https://ig.me/m/usuario)",
      },
    ],
    group: "content",
    label: "Fale com a gente (Frescor)",
    render: (p, ctx) => {
      const edit = ctx.mode === "edit";
      const units = getUnits(ctx)
        .map(u => ({ link: waUnitLink(ctx, u), name: u.name }))
        .filter(u => u.link);
      return (
        <section
          className={edit ? "fr-contact is-edit" : "fr-contact"}
          data-fr-contact="1"
        >
          <div className="fr-contact-in">
            <FrWhatsapp className="fr-contact-ico" />
            <h2 className="fr-contact-title">{p.title}</h2>
            <p className="fr-contact-text">{p.text}</p>
            <div className="fr-pick">
              <div className="fr-select-wrap fr-pick">
                {/* biome-ignore lint/correctness/useUniqueElementIds: um seletor por página */}
                <label htmlFor="fr-unit">{p.pickLabel}</label>
                <select className="fr-select" defaultValue="" id="fr-unit">
                  <option value="">{p.placeholder}</option>
                  {units.map((u, i) => (
                    <option key={u.name} value={String(i)}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fr-pick-btns">
                {units.map((u, i) => (
                  <a
                    className="fr-wa"
                    data-fr-unit={String(i)}
                    href={u.link}
                    key={u.name}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <FrWhatsapp />
                    {p.buttonLabel.replaceAll("{unidade}", u.name)}
                  </a>
                ))}
              </div>
            </div>
            {p.lastText && p.instagramUrl ? (
              <p className="fr-contact-last">
                {p.lastText}{" "}
                <a href={safeUrl(p.instagramUrl)} {...newTab(p.instagramUrl)}>
                  {p.instagramLabel}
                  <FrInstagram />
                </a>
              </p>
            ) : null}
          </div>
        </section>
      );
    },
    type: "frContact",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const linkItem = z.object({ label: str(), url: str() });
const LINK_FIELDS = [
  { key: "label", kind: "text", label: "Texto" },
  { key: "url", kind: "url", label: "Link (vazio = o item não aparece)" },
] as const;

const frFooter = defineBlock(
  z.object({
    brand: str("Frescor Sorvetes & Açaí"),
    closedLabel: str("Fechado agora"),
    credit: str(),
    creditUrl: str(),
    legal: z.array(linkItem).default([]).catch([]),
    openLabel: str("Aberto agora"),
    orderLinks: z.array(linkItem).default([]).catch([]),
    orderTitle: str("Faça seu pedido"),
    rights: str("Todos os direitos reservados."),
    socials: z.array(linkItem).default([]).catch([]),
    soonLabel: str("Abre em {n} min"),
    units: z.array(unitSchema).default([]).catch([]),
  }),
  {
    fields: [
      {
        itemFields: [...UNIT_FIELDS],
        key: "units",
        kind: "list",
        label:
          "Unidades (valem para os cartões, o seletor, o rodapé e o Google)",
      },
      { key: "orderTitle", kind: "text", label: "Título da coluna de pedido" },
      {
        itemFields: [...LINK_FIELDS],
        key: "orderLinks",
        kind: "list",
        label: "Links de pedido",
      },
      {
        itemFields: [
          {
            key: "label",
            kind: "text",
            label: "Rede (Instagram, Facebook, YouTube…)",
          },
          { key: "url", kind: "url", label: "Link (sem link, o ícone some)" },
        ],
        key: "socials",
        kind: "list",
        label: "Redes sociais",
      },
      { key: "openLabel", kind: "text", label: "Texto: aberto" },
      {
        key: "soonLabel",
        kind: "text",
        label: "Texto: abre em breve ({n} = minutos)",
      },
      { key: "closedLabel", kind: "text", label: "Texto: fechado" },
      { key: "brand", kind: "text", label: "Nome no copyright" },
      { key: "rights", kind: "text", label: "Frase do copyright" },
      {
        itemFields: [...LINK_FIELDS],
        key: "legal",
        kind: "list",
        label: "Links legais",
      },
      {
        key: "credit",
        kind: "text",
        label: "Crédito do desenvolvedor (vazio = não aparece)",
      },
      { key: "creditUrl", kind: "url", label: "Link do crédito" },
    ],
    group: "layout",
    label: "Rodapé (Frescor)",
    render: (p, ctx) => {
      const tz = storeTimezone(ctx);
      const units = getUnits(ctx);
      const ld = unitsJsonLd(ctx, units);
      const orders = p.orderLinks.filter(l => l.label && l.url.trim());
      const socials = p.socials.filter(s => s.url.trim());
      const legal = p.legal.filter(l => l.label && l.url.trim());
      return (
        <footer className="fr-foot">
          <div className="fr-foot-grid">
            {units.map(u => (
              <div className="fr-foot-col" key={u.name}>
                <h3>
                  <FrIcon name="pin" />
                  {u.name}
                </h3>
                <p className="fr-foot-addr">
                  {[u.address, u.neighborhood, u.city]
                    .filter(Boolean)
                    .map((line, i) => (
                      <span key={line}>
                        {i > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                </p>
                <div className="fr-foot-line" />
                <p
                  className="fr-status"
                  data-closed={p.closedLabel}
                  data-fr-hours={JSON.stringify(hoursSpec(u, tz))}
                  data-open={p.openLabel}
                  data-soon={p.soonLabel}
                />
                <p className="fr-foot-hours">{hoursText(u)}</p>
              </div>
            ))}
            <div className="fr-foot-col">
              <h3>{p.orderTitle}</h3>
              <div className="fr-foot-links">
                {orders.map(l => (
                  <a
                    href={safeUrl(
                      l.url.startsWith("/")
                        ? href(ctx, l.url)
                        : anchorHref(ctx, l.url)
                    )}
                    key={l.label + l.url}
                    {...newTab(l.url)}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              {socials.length ? (
                <div className="fr-socials">
                  {socials.map(s => (
                    <a
                      aria-label={s.label}
                      href={safeUrl(s.url)}
                      key={s.label + s.url}
                      {...newTab(s.url)}
                    >
                      <SocialIcon label={s.label} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="fr-copy">
            <span>
              © <span data-fr-year>{new Date().getFullYear()}</span> {p.brand}.{" "}
              {p.rights}
              {legal.map(l => (
                <span key={l.label + l.url}>
                  {" · "}
                  <a href={href(ctx, l.url)} {...newTab(l.url)}>
                    {l.label}
                  </a>
                </span>
              ))}
            </span>
            {p.credit ? (
              <span>
                {p.creditUrl.trim() ? (
                  <a href={safeUrl(p.creditUrl)} {...newTab(p.creditUrl)}>
                    {p.credit}
                  </a>
                ) : (
                  p.credit
                )}
              </span>
            ) : null}
          </div>
          {ld.length ? (
            <script
              // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD gerado das props; `<` escapado
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(ld).replaceAll("<", "\\u003c"),
              }}
              type="application/ld+json"
            />
          ) : null}
        </footer>
      );
    },
    type: "frFooter",
  }
);

/* ───────────────────────── Nossa História ───────────────────────── */

const frHistoryHero = defineBlock(
  z.object({
    subtitle: str("De uma receita caseira a uma referência de sabor"),
    title: str("Nossa História"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da página (h1)" },
      { key: "subtitle", kind: "text", label: "Subtítulo (vazio = sem)" },
    ],
    group: "content",
    label: "Faixa do título (Frescor)",
    render: p => (
      <section className="fr-hh">
        <h1 className="fr-hh-title">{p.title}</h1>
        {p.subtitle ? <p className="fr-hh-sub">{p.subtitle}</p> : null}
        <SoftWave />
      </section>
    ),
    type: "frHistoryHero",
  }
);

const frStory = defineBlock(
  z.object({
    photos: z
      .array(z.object({ alt: str(), image: str() }))
      .default([])
      .catch([]),
    text: str(),
    title: str("Quem somos"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (uma linha em branco separa os parágrafos)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          { key: "alt", kind: "text", label: "Descrição da foto" },
        ],
        key: "photos",
        kind: "list",
        label: "Fotos (a 1ª é larga)",
      },
    ],
    group: "content",
    label: "Texto e fotos (Frescor)",
    render: p => (
      <section className="fr-story">
        <div className="fr-story-in">
          <div className="fr-story-txt">
            <h2 className="fr-story-title">{p.title}</h2>
            {p.text
              .split(/\n\s*\n/)
              .map(t => t.trim())
              .filter(Boolean)
              .map(t => (
                <p key={t}>{t}</p>
              ))}
          </div>
          <div className="fr-gal">
            {p.photos.map((ph, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade da foto
              <figure key={i}>
                <Img alt={ph.alt} src={ph.image} />
              </figure>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "frStory",
  }
);

const frTimeline = defineBlock(
  z.object({
    items: z
      .array(z.object({ text: str(), title: str(), year: str() }))
      .default([])
      .catch([]),
    title: str("Anos refrescando a cidade"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "year", kind: "text", label: "Ano" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Linha do tempo",
      },
    ],
    group: "content",
    label: "Linha do tempo (Frescor)",
    render: p => (
      <section className="fr-tl">
        <h2 className="fr-tl-title">{p.title}</h2>
        <div className="fr-tl-grid">
          {p.items.map((it, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do item
            <div className="fr-tl-item" key={i}>
              <div className="fr-tl-year">{it.year}</div>
              <div className="fr-tl-card">
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "frTimeline",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const frNotFound = defineBlock(
  z.object({
    backLabel: str("Voltar ao início"),
    text: str("A página que você procura não existe ou mudou de endereço."),
    title: str("Ops! Essa página derreteu."),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "backLabel", kind: "text", label: "Texto do botão" },
    ],
    group: "content",
    label: "Página 404 (Frescor)",
    render: (p, ctx) => (
      <section className="fr-nf">
        <div className="fr-nf-in">
          <h1 className="fr-nf-title">{p.title}</h1>
          <p className="fr-nf-text">{p.text}</p>
          <a className="fr-btn fr-btn-yellow" href={href(ctx, "/")}>
            {p.backLabel}
          </a>
        </div>
        <SoftWave />
      </section>
    ),
    type: "frNotFound",
  }
);

export const sorveteriaBlocks: BlockDefinition[] = [
  frHeader,
  frHero,
  frOrderCards,
  frContact,
  frFooter,
  frHistoryHero,
  frStory,
  frTimeline,
  frNotFound,
];
