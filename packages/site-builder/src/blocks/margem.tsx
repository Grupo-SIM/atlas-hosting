import { type CSSProperties, Fragment } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { href, newTab } from "./helpers.js";
import type { BlockDefinition, RenderContext } from "./types.js";

/**
 * Blocos do template Margem (estúdio de marcas: off-white, tipográfico, túnel de projetos em 3D).
 * Todo texto, imagem, link, cor, quantidade e ordem é prop; o visual vem de `renderer/margem.ts`
 * (escopo `.sb-mg`) e o movimento de `renderer/margem-runtime.ts`, que acha cada bloco por `data-mg`.
 * Sem o runtime (editor, miniaturas, sem JS ou sem WebGL) os blocos ficam numa versão estática legível:
 * o túnel vira hero + cases empilhados, o método mostra os quadros lado a lado.
 */
const str = (d = "") => z.string().default(d);
const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);
const num = (min: number, max: number, d: number) =>
  z.coerce.number().min(min).max(max).default(d).catch(d);
const hexColor = (d: string) =>
  z
    .string()
    .regex(/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/)
    .default(d)
    .catch(d);

/** Só imagem http(s), caminho do site ou `data:image/`: o valor vai para `src`/JSON do runtime. */
const imgSrc = (url: string) =>
  /^(https?:\/\/|\/|data:image\/)/i.test(url.trim()) ? url.trim() : "";

const linkProps = (ctx: RenderContext, url: string) => ({
  href: href(ctx, url),
  ...newTab(url),
});

/* ───────────────────────── wordmark ───────────────────────── */

/**
 * Wordmark "margem" desenhado em código: traço único de espessura constante, "g" com cauda em esquadro,
 * segundo "m" mais largo. Proporção altura/largura 0,214 (viewBox 500 × 107).
 */
export function MargemWordmark({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label || undefined}
      className={className}
      fill="none"
      role={label ? "img" : undefined}
      stroke="currentColor"
      strokeLinejoin="miter"
      strokeWidth="10"
      viewBox="8 18 500 107"
    >
      <path d="M15 85V35M15 55a20 20 0 0 1 40 0v30M55 55a20 20 0 0 1 40 0v30" />
      <circle cx="140" cy="60" r="25" />
      <path d="M165 35v50" />
      <path d="M190 85V35M190 60a25 25 0 0 1 25-25" />
      <circle cx="255" cy="60" r="25" />
      <path d="M280 35v73h-45" />
      <path d="M300 60h50a25 25 0 1 0-7.3 17.7" />
      <path d="M375 85V35M375 55a32 20 0 0 1 64 0v30M439 55a32 20 0 0 1 64 0v30" />
    </svg>
  );
}

/** Logo do bloco: imagem enviada pelo usuário ou, sem ela, o wordmark desenhado. */
function Logo({
  className,
  label,
  logo,
}: {
  className?: string;
  label: string;
  logo: string;
}) {
  const src = imgSrc(logo);
  return src ? (
    <img alt={label} className={className} src={src} />
  ) : (
    <MargemWordmark className={className} label={label} />
  );
}

/* ───────────────────────── navegação ───────────────────────── */

const mgNav = defineBlock(
  z.object({
    brandName: str("Margem"),
    links: z.array(z.object({ label: str(), url: str("#") })).default([
      { label: "Projetos", url: "#projetos" },
      { label: "Estúdio", url: "#estudio" },
      { label: "Contato", url: "#contato" },
    ]),
    logo: str(),
    logoUrl: str("/"),
  }),
  {
    fields: [
      {
        key: "brandName",
        kind: "text",
        label: "Nome da marca (leitor de tela)",
      },
      {
        key: "logo",
        kind: "image",
        label: "Logo (vazio = wordmark desenhado)",
      },
      { key: "logoUrl", kind: "url", label: "Link do logo" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link (#âncora ou endereço)" },
        ],
        key: "links",
        kind: "list",
        label: "Pílulas do menu",
      },
    ],
    group: "layout",
    label: "Navegação (Margem)",
    render: (p, ctx) => (
      <div className="mg-nav-wrap" data-mg="nav">
        <nav aria-label="Principal" className="mg-nav">
          <a className="mg-nav-logo" href={href(ctx, p.logoUrl)}>
            <Logo className="mg-mark" label={p.brandName} logo={p.logo} />
          </a>
          <ul className="mg-pills">
            {p.links.map((l, i) => (
              <li key={`${l.label}-${i}`}>
                <a className="mg-pill" {...linkProps(ctx, l.url)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    ),
    type: "mgNav",
  }
);

/* ───────────────────────── hero + túnel ───────────────────────── */

const caseSchema = z.object({
  city: str(),
  client: str("Cliente"),
  discipline: str(),
  image: str(),
  linkLabel: str("Abrir o case →"),
  linkUrl: str("#projetos"),
  summary: str(),
  year: str(),
});

const pad2 = (n: number) => String(n).padStart(2, "0");

const mgTunnel = defineBlock(
  z.object({
    brandName: str("Margem"),
    cases: z.array(caseSchema).default([]),
    endLabel: str("Ver todos os projetos"),
    endTitle: str("Quatro de 41."),
    endUrl: str("#projetos"),
    hint: str("Role para entrar"),
    lines: str("Marcas que ainda fazem sentido\ndaqui a dez anos."),
    logo: str(),
    place: str("Recife · 41 projetos desde 2016"),
    screens: int(4, 20, 11),
    wall: z
      .array(z.object({ image: str(), ratio: num(0.2, 5, 1) }))
      .default([]),
  }),
  {
    fields: [
      {
        key: "lines",
        kind: "textarea",
        label: "Frase do centro (cada linha do campo = uma linha)",
      },
      {
        key: "hint",
        kind: "text",
        label: "Rótulo da esquerda (“Role para entrar”)",
      },
      {
        key: "place",
        kind: "text",
        label: "Rótulo da direita (cidade · números)",
      },
      {
        key: "brandName",
        kind: "text",
        label: "Nome da marca (leitor de tela)",
      },
      {
        key: "logo",
        kind: "image",
        label: "Logo gigante (vazio = wordmark desenhado)",
      },
      {
        key: "screens",
        kind: "number",
        label: "Duração do túnel (alturas de tela de rolagem, 4 a 20)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          {
            key: "ratio",
            kind: "number",
            label: "Proporção (largura ÷ altura; 1,5 = paisagem 3:2)",
          },
        ],
        key: "wall",
        kind: "list",
        label:
          "Fotos das paredes do túnel (cada uma se repete em vários ângulos)",
      },
      {
        itemFields: [
          {
            key: "image",
            kind: "image",
            label: "Foto (paisagem 3:2, 1500 px ou mais)",
          },
          { key: "client", kind: "text", label: "Cliente" },
          { key: "year", kind: "text", label: "Ano" },
          { key: "discipline", kind: "text", label: "Disciplina" },
          { key: "city", kind: "text", label: "Cidade" },
          { key: "summary", kind: "textarea", label: "Resumo (duas linhas)" },
          { key: "linkLabel", kind: "text", label: "Botão — texto" },
          { key: "linkUrl", kind: "url", label: "Botão — link" },
        ],
        key: "cases",
        kind: "list",
        label: "Projetos em destaque (a foto sai da parede e abre o case)",
      },
      { key: "endTitle", kind: "text", label: "Frase do fim do túnel" },
      { key: "endLabel", kind: "text", label: "Botão do fim — texto" },
      { key: "endUrl", kind: "url", label: "Botão do fim — link" },
    ],
    group: "content",
    label: "Hero com túnel de projetos (Margem)",
    render: (p, ctx) => {
      const wall = p.wall
        .map(w => ({ r: w.ratio, s: imgSrc(w.image) }))
        .filter(w => w.s);
      const cases = p.cases.map(c => imgSrc(c.image));
      const total = pad2(p.cases.length);
      return (
        <section
          className="mg-tunnel"
          data-mg="tunnel"
          data-mg-wall={JSON.stringify({ cases, wall })}
          style={{ "--mg-screens": p.screens } as CSSProperties}
        >
          <div className="mg-stage">
            <canvas className="mg-canvas" />
            <div aria-hidden="true" className="mg-collage">
              {wall.slice(0, 9).map((w, i) => (
                <img
                  alt=""
                  key={`${w.s}-${i}`}
                  loading="lazy"
                  src={w.s}
                  style={{ aspectRatio: String(w.r) }}
                />
              ))}
            </div>
            <div className="mg-hero">
              <h1 className="mg-hero-line">
                {p.lines
                  .split("\n")
                  .filter(Boolean)
                  .map((l, i) => (
                    <span key={`${l}-${i}`}>{l}</span>
                  ))}
              </h1>
              <div className="mg-hero-mark">
                <Logo className="mg-mark" label={p.brandName} logo={p.logo} />
              </div>
              <div className="mg-hero-labels">
                <span className="mg-chip">{p.hint}</span>
                <span className="mg-chip">{p.place}</span>
              </div>
            </div>
            <ol className="mg-cases">
              {p.cases.map((c, i) => (
                <li className="mg-case" key={`${c.client}-${i}`}>
                  {cases[i] ? (
                    <img
                      alt=""
                      className="mg-case-img"
                      loading="lazy"
                      src={cases[i]}
                    />
                  ) : (
                    <div className="mg-case-img sb-img-empty" />
                  )}
                  <div className="mg-case-txt">
                    <span className="mg-case-n">
                      {pad2(i + 1)} / {total}
                    </span>
                    <p className="mg-case-meta">
                      {[c.year, c.discipline, c.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <h2 className="mg-case-name">{c.client}</h2>
                    <p className="mg-case-sum">{c.summary}</p>
                    {c.linkLabel ? (
                      <a
                        className="mg-pill mg-pill-dark"
                        {...linkProps(ctx, c.linkUrl)}
                      >
                        {c.linkLabel}
                      </a>
                    ) : (
                      <span hidden />
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mg-end">
              <p className="mg-end-title">{p.endTitle}</p>
              {p.endLabel ? (
                <a
                  className="mg-pill mg-pill-dark"
                  {...linkProps(ctx, p.endUrl)}
                >
                  {p.endLabel}
                </a>
              ) : (
                <span hidden />
              )}
            </div>
            <div aria-hidden="true" className="mg-progress">
              <i />
            </div>
          </div>
        </section>
      );
    },
    type: "mgTunnel",
  }
);

/* ───────────────────────── manifesto com marginália ───────────────────────── */

const PHOTO_TOKEN = /^(.*?)\[(\d+)\](.*)$/;

const mgManifesto = defineBlock(
  z.object({
    dots: z.array(z.object({ color: hexColor("#cfc9bd") })).default([]),
    label: str("Estúdio"),
    notes: z.array(z.object({ at: str(), text: str() })).default([]),
    photos: z
      .array(
        z.object({
          focus: str("50% 50%"),
          image: str(),
          word: str(),
        })
      )
      .default([]),
    text: str(
      "Somos seis pessoas numa casa no Poço da Panela. Desenhamos marcas para quem faz coisas com as [1]: café, [2], livro, cadeira, festa."
    ),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Rótulo" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto ([1], [2]… = foto pequena no lugar da palavra)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          {
            key: "word",
            kind: "text",
            label: "Palavra que a foto substitui (leitor de tela)",
          },
          {
            key: "focus",
            kind: "text",
            label: "Recorte (posição: “50% 50%” = centro, “20% 70%”…)",
          },
        ],
        key: "photos",
        kind: "list",
        label: "Fotos dentro do texto ([1] é a primeira)",
      },
      {
        itemFields: [
          { key: "text", kind: "text", label: "Nota" },
          {
            key: "at",
            kind: "text",
            label:
              "Palavra da linha (a nota fica na altura dela; [1] = foto 1)",
          },
        ],
        key: "notes",
        kind: "list",
        label: "Notas na margem (ligadas ao texto por um fio)",
      },
      {
        itemFields: [{ key: "color", kind: "color", label: "Cor" }],
        key: "dots",
        kind: "list",
        label: "Bolinhas da equipe",
      },
    ],
    group: "content",
    label: "Manifesto com notas na margem (Margem)",
    render: p => {
      let i = 0;
      const words = p.text
        .split(/\s+/)
        .filter(Boolean)
        .map((raw, k) => {
          const m = PHOTO_TOKEN.exec(raw);
          const photo = m ? p.photos[Number(m[2]) - 1] : undefined;
          const src = photo ? imgSrc(photo.image) : "";
          const style = { "--i": i++ } as CSSProperties;
          return (
            <Fragment key={`${raw}-${k}`}>
              {k ? " " : null}
              <span className="mg-w" data-w={raw} style={style}>
                {m && photo ? (
                  <>
                    {m[1]}
                    {src ? (
                      <img
                        alt={photo.word}
                        className="mg-inph"
                        loading="lazy"
                        src={src}
                        style={{
                          objectPosition: photo.focus.replace(/[;{}<>]/g, ""),
                        }}
                      />
                    ) : (
                      photo.word
                    )}
                    {m[3]}
                  </>
                ) : (
                  raw
                )}
              </span>
            </Fragment>
          );
        });
      return (
        <section className="mg-man" data-mg="manifesto">
          <svg aria-hidden="true" className="mg-threads" />
          <div className="mg-man-col">
            <p className="mg-label">{p.label}</p>
            <p className="mg-man-text">{words}</p>
            <ul aria-hidden="true" className="mg-dots">
              {p.dots.map((d, k) => (
                <li
                  key={`${d.color}-${k}`}
                  style={{ "--c": d.color, "--i": k } as CSSProperties}
                />
              ))}
            </ul>
          </div>
          <ul className="mg-margin">
            {p.notes.map((n, k) => (
              <li className="mg-note" data-at={n.at} key={`${n.text}-${k}`}>
                <i aria-hidden="true" />
                {n.text}
              </li>
            ))}
          </ul>
        </section>
      );
    },
    type: "mgManifesto",
  }
);

/* ───────────────────────── método: tira de filme ───────────────────────── */

/** Quadro "grade": a marca (três meias-luas, a de cima menor) sobre a grade de construção. */
function ConstructionMark({
  grid,
  mark,
  paper,
}: {
  grid: string;
  mark: string;
  paper: string;
}) {
  return (
    <svg aria-hidden="true" className="mg-frame-svg" viewBox="0 0 300 400">
      <rect fill={paper} height="400" width="300" />
      <g fill="none" stroke={grid} strokeWidth="0.75">
        <path d="M30 0v400M150 0v400M270 0v400M0 102h300M0 146h300M0 210h300M0 290h300M0 330h300" />
        <circle cx="150" cy="290" r="80" />
        <circle cx="150" cy="210" r="64" />
        <circle cx="150" cy="146" r="44" />
        <path d="M70 290 150 146 230 290M20 290h260" strokeDasharray="3 4" />
      </g>
      <g fill={mark}>
        <path d="M70 290a80 80 0 0 1 160 0Z" />
        <path d="M86 210a64 64 0 0 1 128 0Z" />
        <path d="M106 146a44 44 0 0 1 88 0Z" />
      </g>
    </svg>
  );
}

const mgMethod = defineBlock(
  z.object({
    frames: z
      .array(
        z.object({
          alt: str(),
          caption: str(),
          image: str(),
          kind: z.enum(["photo", "grid"]).default("photo").catch("photo"),
          label: str(),
        })
      )
      .default([]),
    gridColor: hexColor("#a9a49a"),
    markColor: hexColor("#2f4a3a"),
    paperColor: hexColor("#f7f5f0"),
    screens: num(1, 8, 2.6),
    title: str("Como uma marca nasce aqui"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "screens",
        kind: "number",
        label: "Duração (alturas de tela de rolagem, 1 a 8)",
      },
      {
        itemFields: [
          {
            key: "kind",
            kind: "select",
            label: "Quadro",
            options: [
              { label: "Foto", value: "photo" },
              {
                label: "Marca sobre a grade de construção (desenho)",
                value: "grid",
              },
            ],
          },
          { key: "image", kind: "image", label: "Foto (retrato 3:4)" },
          {
            key: "alt",
            kind: "text",
            label: "Descrição da foto (leitor de tela)",
          },
          { key: "label", kind: "text", label: "Etapa na régua (“01 Escuta”)" },
          { key: "caption", kind: "text", label: "Frase da etapa" },
        ],
        key: "frames",
        kind: "list",
        label: "Etapas (quadro da tira + rótulo da régua)",
      },
      {
        key: "markColor",
        kind: "color",
        label: "Cor da marca (quadro desenho)",
      },
      {
        key: "gridColor",
        kind: "color",
        label: "Cor da grade (quadro desenho)",
      },
      { key: "paperColor", kind: "color", label: "Fundo do quadro desenho" },
    ],
    group: "content",
    label: "Método em tira de filme (Margem)",
    render: p => {
      const n = p.frames.length;
      return (
        <section
          className="mg-method"
          data-mg="method"
          style={
            {
              "--mg-screens": p.screens,
              "--n": Math.max(n, 1),
            } as CSSProperties
          }
        >
          <div className="mg-method-stage">
            <h2 className="mg-method-title">{p.title}</h2>
            <div className="mg-strip-view">
              <div className="mg-strip">
                {p.frames.map((f, i) => {
                  const src = imgSrc(f.image);
                  return (
                    <figure
                      className={i === 0 ? "mg-frame is-on" : "mg-frame"}
                      key={`${f.label}-${i}`}
                    >
                      {f.kind === "grid" ? (
                        <ConstructionMark
                          grid={p.gridColor}
                          mark={p.markColor}
                          paper={p.paperColor}
                        />
                      ) : src ? (
                        <img alt={f.alt} loading="lazy" src={src} />
                      ) : (
                        <div className="sb-img-empty" />
                      )}
                    </figure>
                  );
                })}
              </div>
            </div>
            <div className="mg-ruler">
              <div aria-hidden="true" className="mg-ruler-line">
                <i />
              </div>
              <ol>
                {p.frames.map((f, i) => (
                  <li
                    className={i === 0 ? "mg-step is-on" : "mg-step"}
                    key={`${f.label}-${i}`}
                    style={{ "--k": n > 1 ? i / (n - 1) : 0 } as CSSProperties}
                  >
                    <b>{f.label}</b>
                    <span>{f.caption}</span>
                  </li>
                ))}
              </ol>
              {/* Celular: a frase da etapa ativa fica numa linha só, embaixo da régua (cópia visual). */}
              <div aria-hidden="true" className="mg-caps">
                {p.frames.map((f, i) => (
                  <span
                    className={i === 0 ? "is-on" : undefined}
                    key={`${f.label}-${i}`}
                  >
                    {f.caption}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "mgMethod",
  }
);

/* ───────────────────────── índice de projetos ───────────────────────── */

const rowSchema = z.object({
  city: str(),
  client: str("Cliente"),
  discipline: str(),
  filter: str(),
  image: str(),
  url: str(),
  year: str(),
});

/** Até 8 filtros além de "Todos": o CSS (`renderer/margem.ts`) tem uma regra por posição. */
export const MG_MAX_FILTERS = 8;

const indexSchema = z.object({
  allLabel: str("Todos"),
  countText: str("{n} de {total} projetos"),
  filters: z.array(z.object({ label: str(), value: str() })).default([]),
  rows: z.array(rowSchema).default([]),
  title: str("Todos os projetos"),
  total: int(0, 9999, 41),
});

type IndexProps = z.infer<typeof indexSchema>;

/** Hash curto e determinístico (FNV-1a) — dá nome estável ao grupo de radios sem depender de `useId`, que quebra na exportação estática (SSR fora do render tree do React). */
function shortHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function IndexTable({ ctx, p }: { ctx: RenderContext; p: IndexProps }) {
  const name = `mg-f${shortHash(JSON.stringify(p))}`;
  const filters = p.filters.slice(0, MG_MAX_FILTERS);
  const filterOf = (value: string) =>
    filters.findIndex(f => f.value && f.value === value) + 1;
  const count = (k: number) =>
    k === 0
      ? p.rows.length
      : p.rows.filter(r => filterOf(r.filter) === k).length;
  const groups = [p.allLabel, ...filters.map(f => f.label)];
  return (
    <section className="mg-ix" data-mg="index">
      <div className="mg-ix-head">
        <h2 className="mg-ix-title">{p.title}</h2>
        <fieldset className="mg-filters">
          <legend className="mg-sr">Filtrar projetos</legend>
          {groups.map((label, k) => (
            <label className="mg-fpill" key={`${label}-${k}`}>
              <input
                className={`mg-fi-${k}`}
                defaultChecked={k === 0}
                name={name}
                type="radio"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <ul className="mg-rows">
        {p.rows.map((r, i) => {
          const src = imgSrc(r.image);
          const inner = (
            <>
              <span className="mg-r-y">{r.year}</span>
              <span className="mg-r-c">{r.client}</span>
              <span className="mg-r-d">{r.discipline}</span>
              <span className="mg-r-t">{r.city}</span>
              {src ? (
                <img alt="" className="mg-r-thumb" loading="lazy" src={src} />
              ) : (
                <span className="mg-r-thumb" />
              )}
            </>
          );
          return (
            <li
              className={`mg-row f-${filterOf(r.filter)}`}
              key={`${r.client}-${i}`}
            >
              {r.url ? (
                <a
                  className="mg-row-in"
                  data-img={src}
                  {...linkProps(ctx, r.url)}
                >
                  {inner}
                </a>
              ) : (
                // biome-ignore lint/a11y/noNoninteractiveTabindex: a linha recebe foco para mostrar a foto do projeto pelo teclado
                <div className="mg-row-in" data-img={src} tabIndex={0}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="mg-count">
        {groups.map((label, k) => (
          <span className={`mg-cnt c-${k}`} key={`${label}-${k}`}>
            {p.countText
              .replaceAll("{n}", String(count(k)))
              .replaceAll("{total}", String(p.total))}
          </span>
        ))}
      </p>
      <div aria-hidden="true" className="mg-follow">
        <img alt="" />
      </div>
    </section>
  );
}

const mgIndex = defineBlock(indexSchema, {
  fields: [
    { key: "title", kind: "text", label: "Título" },
    { key: "allLabel", kind: "text", label: "Filtro “todos” — texto" },
    {
      itemFields: [
        { key: "label", kind: "text", label: "Texto da pílula" },
        {
          key: "value",
          kind: "text",
          label: "Código (o mesmo do campo Filtro das linhas)",
        },
      ],
      key: "filters",
      kind: "list",
      label: "Filtros (até 8)",
    },
    {
      key: "countText",
      kind: "text",
      label: "Contagem ({n} = projetos visíveis, {total} = total)",
    },
    { key: "total", kind: "number", label: "Total de projetos do estúdio" },
    {
      itemFields: [
        { key: "year", kind: "text", label: "Ano" },
        { key: "client", kind: "text", label: "Cliente" },
        { key: "discipline", kind: "text", label: "Disciplina" },
        { key: "city", kind: "text", label: "Cidade" },
        {
          key: "filter",
          kind: "text",
          label: "Filtro (código de um dos filtros)",
        },
        {
          key: "image",
          kind: "image",
          label: "Foto (segue o cursor; retrato 4:5)",
        },
        { key: "url", kind: "url", label: "Link (opcional)" },
      ],
      key: "rows",
      kind: "list",
      label: "Projetos",
    },
  ],
  group: "content",
  label: "Índice de projetos com foto no cursor (Margem)",
  render: (p, ctx) => <IndexTable ctx={ctx} p={p} />,
  type: "mgIndex",
});

/* ───────────────────────── depoimento com fotos em profundidade ───────────────────────── */

const mgQuote = defineBlock(
  z.object({
    author: str("Lúcia Amaral, Torra Alta"),
    photos: z
      .array(
        z.object({
          depth: num(0, 1, 0.5),
          image: str(),
          size: num(3, 40, 12),
          x: num(-10, 110, 50),
          y: num(-10, 110, 50),
        })
      )
      .default([]),
    quote: str(
      "Eles passaram três semanas só ouvindo. A marca saiu em dez dias e nunca mais mexemos."
    ),
  }),
  {
    fields: [
      { key: "quote", kind: "textarea", label: "Depoimento" },
      { key: "author", kind: "text", label: "Autor" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          {
            key: "x",
            kind: "number",
            label: "Posição horizontal (% da largura)",
          },
          { key: "y", kind: "number", label: "Posição vertical (% da altura)" },
          { key: "size", kind: "number", label: "Largura (% da tela, 3 a 40)" },
          {
            key: "depth",
            kind: "number",
            label: "Profundidade (0 = longe, desfocada; 1 = perto, nítida)",
          },
        ],
        key: "photos",
        kind: "list",
        label: "Fotos flutuando em volta",
      },
    ],
    group: "content",
    label: "Depoimento com fotos em profundidade (Margem)",
    render: p => (
      <section className="mg-quote" data-mg="quote">
        <div aria-hidden="true" className="mg-float">
          {p.photos.map((f, i) => {
            const src = imgSrc(f.image);
            return src ? (
              <img
                alt=""
                data-depth={f.depth}
                key={`${src}-${i}`}
                loading="lazy"
                src={src}
                style={
                  {
                    "--d": f.depth,
                    "--s": f.size,
                    "--x": f.x,
                    "--y": f.y,
                  } as CSSProperties
                }
              />
            ) : (
              <span hidden key={`empty-${i}`} />
            );
          })}
        </div>
        <figure className="mg-quote-in">
          <blockquote>{p.quote}</blockquote>
          <figcaption>{p.author}</figcaption>
        </figure>
      </section>
    ),
    type: "mgQuote",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const mgFooter = defineBlock(
  z.object({
    address: str("Rua da Harmonia, Recife"),
    brandName: str("Margem"),
    ctaLabel: str("Escrever para o estúdio"),
    ctaTitle: str("Tem uma marca para desenhar?"),
    ctaUrl: str("mailto:ola@margem.studio"),
    email: str("ola@margem.studio"),
    logo: str(),
    socials: z.array(z.object({ label: str(), url: str("#") })).default([]),
  }),
  {
    fields: [
      { key: "ctaTitle", kind: "text", label: "Chamada" },
      { key: "ctaLabel", kind: "text", label: "Botão — texto" },
      { key: "ctaUrl", kind: "url", label: "Botão — link (mailto:…)" },
      { key: "email", kind: "text", label: "E-mail" },
      { key: "address", kind: "text", label: "Endereço" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Rede" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "socials",
        kind: "list",
        label: "Redes",
      },
      {
        key: "brandName",
        kind: "text",
        label: "Nome da marca (leitor de tela)",
      },
      {
        key: "logo",
        kind: "image",
        label: "Logo de borda a borda (vazio = wordmark desenhado)",
      },
    ],
    group: "layout",
    label: "Rodapé com wordmark (Margem)",
    render: (p, ctx) => (
      <footer className="mg-foot" data-mg="footer">
        <div className="mg-foot-cols">
          <div className="mg-foot-cta">
            <p>{p.ctaTitle}</p>
            {p.ctaLabel ? (
              <a
                className="mg-pill mg-pill-dark mg-pill-lg"
                {...linkProps(ctx, p.ctaUrl)}
              >
                {p.ctaLabel}
              </a>
            ) : (
              <span hidden />
            )}
          </div>
          <address className="mg-foot-contact">
            {p.email ? (
              <a href={`mailto:${p.email.replace(/[\s"<>]/g, "")}`}>
                {p.email}
              </a>
            ) : (
              <span hidden />
            )}
            <span>{p.address}</span>
          </address>
          <ul className="mg-foot-social">
            {p.socials.map((s, i) => (
              <li key={`${s.label}-${i}`}>
                <a className="mg-uline" {...linkProps(ctx, s.url)}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mg-foot-mark">
          <Logo className="mg-mark" label={p.brandName} logo={p.logo} />
        </div>
      </footer>
    ),
    type: "mgFooter",
  }
);

export const margemBlocks: BlockDefinition[] = [
  mgNav,
  mgTunnel,
  mgManifesto,
  mgMethod,
  mgIndex,
  mgQuote,
  mgFooter,
];
