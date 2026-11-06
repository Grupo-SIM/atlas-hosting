import { z } from "zod";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  href,
  Img,
  postPath,
  visiblePosts,
} from "./helpers.js";
import type { RenderContext } from "./types.js";

const str = (d = "") => z.string().default(d);

type PostLike = ReturnType<typeof visiblePosts>[number];

const columnSchema = z.object({ categorySlug: str(), title: str() });
const COLUMN_FIELDS = [
  { key: "title", kind: "text", label: "Título da coluna" },
  { key: "categorySlug", kind: "text", label: "Categoria (endereço)" },
] as const;

const cycle = (list: PostLike[], start: number, count: number) =>
  Array.from({ length: Math.min(count, list.length) }, (_, i) => {
    return list[(start + i) % list.length] as PostLike;
  });

/** Posts da categoria primeiro, completando com os demais para a coluna nunca ficar curta. */
const pool = (ctx: RenderContext, slug: string) => {
  const all = visiblePosts(ctx.site, ctx.mode);
  const cat = ctx.site.categories.find(c => c.slug === slug);
  const mine = cat ? all.filter(p => p.categoryId === cat.id) : [];
  return {
    cat,
    list: [...mine, ...all.filter(p => !mine.includes(p))],
  };
};

const HubCard = ({
  ctx,
  post,
  sub,
}: {
  ctx: RenderContext;
  post: PostLike;
  sub?: boolean;
}) => (
  <article className="sb-hub-card">
    <a className="sb-hub-card-img" href={href(ctx, postPath(post))}>
      <Img alt="" src={post.coverImage} />
    </a>
    <h3>
      <a href={href(ctx, postPath(post))}>{post.title}</a>
    </h3>
    {sub ? <p className="sb-hub-sub">{post.excerpt}</p> : null}
  </article>
);

const hubFront = defineBlock(z.object({}), {
  fields: [],
  group: "blog",
  label: "Vitrine do portal (3 colunas)",
  render: (_p, ctx) => {
    const all = visiblePosts(ctx.site, ctx.mode);
    const lead = all[0];
    if (!lead) return null;
    return (
      <section className="sb-container sb-hub-top">
        <div className="sb-hub-main">
          <div className="sb-hub-lead">
            <a href={href(ctx, postPath(lead))}>
              <Img alt="" src={lead.coverImage} />
              <strong>{lead.title}</strong>
            </a>
            <ul>
              {cycle(all, 1, 3).map(post => (
                <li key={post.id}>
                  <a href={href(ctx, postPath(post))}>{post.title}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="sb-hub-grid">
            {cycle(all, 4, 6).map(post => (
              <HubCard ctx={ctx} key={post.id} post={post} sub />
            ))}
          </div>
        </div>
        <div className="sb-hub-col sb-hub-col-b">
          {cycle(all, 2, 4).map(post => (
            <HubCard ctx={ctx} key={post.id} post={post} />
          ))}
        </div>
        <div className="sb-hub-col sb-hub-col-c">
          {cycle(all, 6, 4).map(post => (
            <HubCard ctx={ctx} key={post.id} post={post} />
          ))}
        </div>
      </section>
    );
  },
  type: "hubFront",
});

const hubSections = defineBlock(
  z.object({
    columns: z.array(columnSchema).default([]),
    rolouTitle: str("Rolou no fim de semana: você viu?"),
    rolouUrl: str("/editorias/"),
  }),
  {
    fields: [
      {
        key: "rolouTitle",
        kind: "text",
        label: "Título da faixa de destaques",
      },
      { key: "rolouUrl", kind: "url", label: "Botão “Mais notícias” — link" },
      {
        itemFields: [...COLUMN_FIELDS],
        key: "columns",
        kind: "list",
        label: "Colunas por editoria",
      },
    ],
    group: "blog",
    label: "Seções por editoria (3 colunas)",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode);
      if (all.length === 0) return null;
      return (
        <section className="sb-container sb-hub-sections">
          <div className="sb-hub-title sb-hub-title-grey">
            <h2>{p.rolouTitle}</h2>
            <a className="sb-hub-pill" href={href(ctx, p.rolouUrl)}>
              Mais notícias
            </a>
          </div>
          <div className="sb-hub-rolou">
            {cycle(all, 3, 4).map(post => (
              <a
                className="sb-hub-rolou-card"
                href={href(ctx, postPath(post))}
                key={post.id}
              >
                <Img alt="" src={post.coverImage} />
                <span>{post.title}</span>
              </a>
            ))}
          </div>
          <div className="sb-hub-cols">
            {p.columns.map((col, i) => {
              const { cat, list } = pool(ctx, col.categorySlug);
              const [feat, ...rest] = list;
              if (!feat) return null;
              return (
                <div
                  className={`sb-hub-editoria sb-hub-e${i % 3}`}
                  key={col.title}
                >
                  <h2 className="sb-hub-title">{col.title}</h2>
                  <a
                    className="sb-hub-feature"
                    href={href(ctx, postPath(feat))}
                  >
                    <Img alt="" src={feat.coverImage} />
                    <strong>{feat.title}</strong>
                  </a>
                  {rest.slice(0, 4).map(post => (
                    <a
                      className="sb-hub-item"
                      href={href(ctx, postPath(post))}
                      key={post.id}
                    >
                      <Img alt="" src={post.coverImage} />
                      <span>{post.title}</span>
                    </a>
                  ))}
                  <a
                    className="sb-hub-more"
                    href={href(ctx, cat ? categoryPath(cat) : "/editorias/")}
                  >
                    Mais {col.title}
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      );
    },
    type: "hubSections",
  }
);

const hubWidgets = defineBlock(
  z.object({
    agendaGames: z
      .array(
        z.object({
          league: str(),
          live: z.enum(["yes", "no"]).default("no"),
          match: str(),
        })
      )
      .default([
        { league: "Campeonato Série B", live: "yes", match: "FOR 0 × 0 ACG" },
        { league: "Premier League", live: "no", match: "NEW 0 × 0 EVE" },
      ]),
    agendaHeadline: str("Jogos de hoje"),
    agendaTitle: str("Agenda"),
    ecoChange: str("▼ −0,75%"),
    ecoHeadline: str("Índice da bolsa"),
    ecoNote: str("Valores de exemplo — edite no bloco."),
    ecoRows: z.array(z.object({ label: str(), value: str() })).default([
      { label: "Dólar comercial", value: "R$ 5,444" },
      { label: "Euro comercial", value: "R$ 6,080" },
    ]),
    ecoSub: str("167.922 pts (−1262,80)"),
    ecoTitle: str("Economia"),
    horoDates: str("21/03 a 19/04"),
    horoLink: str("Leia a previsão completa ›"),
    horoSign: str("Áries"),
    horoText: str(
      "O céu aponta que o momento pode pedir foco nas prioridades e atenção na área dos prazeres."
    ),
    horoTitle: str("Horóscopo"),
    liveLabel: str("Tempo real"),
  }),
  {
    fields: [
      { key: "ecoTitle", kind: "text", label: "Economia — título da coluna" },
      { key: "ecoHeadline", kind: "text", label: "Economia — destaque" },
      { key: "ecoSub", kind: "text", label: "Economia — detalhe" },
      { key: "ecoChange", kind: "text", label: "Economia — variação" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Nome" },
          { key: "value", kind: "text", label: "Valor" },
        ],
        key: "ecoRows",
        kind: "list",
        label: "Economia — cotações",
      },
      { key: "ecoNote", kind: "text", label: "Economia — nota" },
      { key: "agendaTitle", kind: "text", label: "Agenda — título da coluna" },
      { key: "agendaHeadline", kind: "text", label: "Agenda — destaque" },
      {
        itemFields: [
          { key: "league", kind: "text", label: "Campeonato" },
          { key: "match", kind: "text", label: "Jogo (ex.: FOR 0 × 0 ACG)" },
          {
            key: "live",
            kind: "select",
            label: 'Mostrar "Tempo real"',
            options: [
              { label: "Sim", value: "yes" },
              { label: "Não", value: "no" },
            ],
          },
        ],
        key: "agendaGames",
        kind: "list",
        label: "Agenda — jogos",
      },
      {
        key: "liveLabel",
        kind: "text",
        label: "Agenda — selo de jogo ao vivo",
      },
      { key: "horoTitle", kind: "text", label: "Horóscopo — título da coluna" },
      { key: "horoSign", kind: "text", label: "Horóscopo — signo" },
      { key: "horoDates", kind: "text", label: "Horóscopo — datas" },
      { key: "horoText", kind: "textarea", label: "Horóscopo — texto" },
      { key: "horoLink", kind: "text", label: "Horóscopo — link" },
    ],
    group: "blog",
    label: "Economia, agenda e horóscopo",
    render: p => (
      <section className="sb-container sb-hub-cols sb-hub-widgets">
        <div className="sb-hub-editoria sb-hub-e0">
          <h2 className="sb-hub-title">{p.ecoTitle}</h2>
          <div className="sb-hub-panel">
            <b>{p.ecoHeadline}</b>
            <small>{p.ecoSub}</small>
            <p className="sb-hub-down">{p.ecoChange}</p>
            <dl>
              {p.ecoRows.flatMap((r, i) => [
                // biome-ignore lint/suspicious/noArrayIndexKey: os itens são editáveis e podem repetir
                <dt key={`t${i}`}>{r.label}</dt>,
                // biome-ignore lint/suspicious/noArrayIndexKey: os itens são editáveis e podem repetir
                <dd key={`d${i}`}>{r.value}</dd>,
              ])}
            </dl>
            <small>{p.ecoNote}</small>
          </div>
        </div>
        <div className="sb-hub-editoria sb-hub-e1">
          <h2 className="sb-hub-title">{p.agendaTitle}</h2>
          <div className="sb-hub-panel">
            <b>{p.agendaHeadline}</b>
            {p.agendaGames.map((g, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: os itens são editáveis e podem repetir
              <div key={i}>
                <small>{g.league}</small>
                <p className="sb-hub-score">{g.match}</p>
                {g.live === "yes" ? (
                  <span className="sb-hub-live">{p.liveLabel}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="sb-hub-editoria sb-hub-e2">
          <h2 className="sb-hub-title">{p.horoTitle}</h2>
          <div className="sb-hub-panel">
            <b>{p.horoSign}</b>
            <small>{p.horoDates}</small>
            <p>{p.horoText}</p>
            <span>{p.horoLink}</span>
          </div>
        </div>
      </section>
    ),
    type: "hubWidgets",
  }
);

const hubVideos = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          duration: str("1 min"),
          image: str(),
          title: str(),
          url: str("#"),
        })
      )
      .default([]),
    title: str("Vídeos em alta"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "title", kind: "text", label: "Título" },
          { key: "duration", kind: "text", label: "Duração" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Vídeos (o primeiro vira o destaque)",
      },
    ],
    group: "media",
    label: "Vídeos em alta (destaque + lista)",
    render: (p, ctx) => {
      const [main, ...rest] = p.items;
      if (!main) return null;
      return (
        <section className="sb-container sb-hub-videos">
          <div className="sb-hub-title sb-hub-title-grey">
            <h2>{p.title}</h2>
          </div>
          <div className="sb-hub-player">
            <a className="sb-hub-stage" href={href(ctx, main.url)}>
              <Img alt="" src={main.image} />
              <span aria-hidden="true" className="sb-hub-play" />
              <strong>{main.title}</strong>
            </a>
            <div className="sb-hub-playlist">
              {rest.slice(0, 5).map(v => (
                <a href={href(ctx, v.url)} key={v.title + v.url}>
                  <span className="sb-hub-thumb">
                    <Img alt="" src={v.image} />
                    <em>{v.duration}</em>
                  </span>
                  <b>{v.title}</b>
                </a>
              ))}
            </div>
          </div>
        </section>
      );
    },
    type: "hubVideos",
  }
);

const hubTop = defineBlock(
  z.object({
    columns: z.array(columnSchema).default([]),
    title: str("Top Portal"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [...COLUMN_FIELDS],
        key: "columns",
        kind: "list",
        label: "Colunas do ranking",
      },
    ],
    group: "blog",
    label: "Ranking Top 5 por editoria",
    render: (p, ctx) => {
      if (visiblePosts(ctx.site, ctx.mode).length === 0) return null;
      return (
        <section className="sb-container sb-hub-top5">
          <h2 className="sb-hub-title sb-hub-title-blue">{p.title}</h2>
          <div className="sb-hub-cols">
            {p.columns.map((col, i) => (
              <div className={`sb-hub-e${i % 3}`} key={col.title}>
                <h4>{col.title}</h4>
                <ol>
                  {cycle(pool(ctx, col.categorySlug).list, 0, 5).map(post => (
                    <li key={post.id}>
                      <a href={href(ctx, postPath(post))}>{post.title}</a>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      );
    },
    type: "hubTop",
  }
);

/** Posts da categoria da página; sem categoria (ou categoria vazia) cai em todas. */
const categoryPosts = (ctx: RenderContext) => {
  const all = visiblePosts(ctx.site, ctx.mode);
  const cat = ctx.current.category;
  const mine = cat ? all.filter(p => p.categoryId === cat.id) : [];
  return { cat, list: mine.length > 0 ? mine : all };
};

const catSlider = defineBlock(
  z.object({ categorySlug: str(), limit: z.coerce.number().default(6) }),
  {
    fields: [
      {
        key: "categorySlug",
        kind: "text",
        label: "Categoria (vazio = a da página)",
      },
      { key: "limit", kind: "number", label: "Quantidade de destaques" },
    ],
    group: "blog",
    label: "Destaques da categoria (carrossel)",
    render: (p, ctx) => {
      const { list } = p.categorySlug
        ? pool(ctx, p.categorySlug)
        : categoryPosts(ctx);
      const base = list.slice(0, Math.max(1, p.limit));
      if (base.length === 0) return null;
      // Poucas notícias: repete a lista para os cards sempre encherem a largura.
      const items = Array.from(
        { length: Math.max(base.length, 8) },
        (_, i) => base[i % base.length] as PostLike
      );
      return (
        <section className="sb-cslider">
          <div className="sb-cslider-track">
            {items.map((post, i) => {
              const cat = categoryOf(ctx.site, post);
              return (
                <a
                  className="sb-cslider-card"
                  href={href(ctx, postPath(post))}
                  key={`${post.id}-${i}`}
                >
                  <Img alt="" src={post.coverImage} />
                  <span className="sb-cslider-text">
                    {cat ? <em>{cat.name}</em> : null}
                    <strong>{post.title}</strong>
                  </span>
                </a>
              );
            })}
          </div>
          <div className="sb-cslider-nav">
            <button aria-label="Anterior" type="button">
              ‹
            </button>
            <button aria-label="Próximo" type="button">
              ›
            </button>
          </div>
        </section>
      );
    },
    type: "catSlider",
  }
);

const catChips = defineBlock(
  z.object({
    images: z
      .array(z.object({ categorySlug: str(), image: str() }))
      .default([]),
    title: str("Veja também"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "categorySlug", kind: "text", label: "Categoria (endereço)" },
          { key: "image", kind: "image", label: "Imagem do atalho" },
        ],
        key: "images",
        kind: "list",
        label: "Imagem por categoria (sem imagem = cor sólida)",
      },
    ],
    group: "blog",
    label: "Atalhos de categorias (chips)",
    render: (p, ctx) => {
      const cats = ctx.site.categories;
      if (cats.length === 0) return null;
      return (
        <section className="sb-container sb-chips">
          <h2>{p.title}</h2>
          <div className="sb-chips-row">
            {cats.map((c, i) => {
              const image = p.images.find(
                x => x.categorySlug === c.slug
              )?.image;
              return (
                <a
                  className={`sb-chip sb-chip-${i % 6}${image ? "has-img" : ""}`}
                  href={href(ctx, categoryPath(c))}
                  key={c.id}
                >
                  {image ? <Img alt="" src={image} /> : null}
                  <span>{c.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      );
    },
    type: "catChips",
  }
);

const skinBar = defineBlock(
  z.object({
    name: str(),
    skin: z.enum(["ge", "gshow", "receitas", "gnt", "redeglobo"]).default("ge"),
  }),
  {
    fields: [
      {
        key: "name",
        kind: "text",
        label: "Nome da seção no cabeçalho (vazio = padrão do estilo)",
      },
      {
        key: "skin",
        kind: "select",
        label: "Estilo da página (marca, cabeçalho e cores)",
        options: [
          { label: "Esporte (verde)", value: "ge" },
          { label: "Entretenimento (laranja)", value: "gshow" },
          { label: "Receitas (amarelo)", value: "receitas" },
          { label: "Lifestyle (roxo)", value: "gnt" },
          { label: "TV (azul)", value: "redeglobo" },
        ],
      },
    ],
    group: "blog",
    label: "Estilo de seção (troca marca e cores da página)",
    render: p => {
      // O nome vira variável CSS (o cabeçalho o lê por `content: var(--skin-name)`).
      const name = p.name.replace(/[<>\\"]/g, "").trim();
      return (
        <>
          <span className="sb-skin" data-skin={p.skin} />
          {name ? (
            <style>{`.sb.sb-pt:has(.sb-skin[data-skin="${p.skin}"]){--skin-name:${JSON.stringify(name)}}`}</style>
          ) : null}
        </>
      );
    },
    type: "skinBar",
  }
);

const mosaic = defineBlock(z.object({ categorySlug: str() }), {
  fields: [
    { key: "categorySlug", kind: "text", label: "Categoria (vazio = todas)" },
  ],
  group: "blog",
  label: "Vitrine 1+2 (texto sobre a foto)",
  render: (p, ctx) => {
    const list = pool(ctx, p.categorySlug).list.slice(0, 3);
    if (list.length === 0) return null;
    return (
      <section className="sb-container sb-mosaic">
        {list.map((post, i) => (
          <a href={href(ctx, postPath(post))} key={post.id}>
            <Img alt="" src={post.coverImage} />
            <span>
              <em>{categoryOf(ctx.site, post)?.name ?? ""}</em>
              <strong>{post.title}</strong>
              {i === 0 ? <small>{post.excerpt}</small> : null}
            </span>
          </a>
        ))}
      </section>
    );
  },
  type: "mosaic",
});

const roundChips = defineBlock(
  z.object({ title: str("Navegue por categoria") }),
  {
    fields: [{ key: "title", kind: "text", label: "Título" }],
    group: "blog",
    label: "Categorias em círculos",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode);
      const rounds = ctx.site.categories
        .map(c => ({ c, post: all.find(x => x.categoryId === c.id) }))
        .filter(x => x.post);
      if (rounds.length === 0) return null;
      return (
        <section className="sb-container sb-rounds">
          <h2>{p.title}</h2>
          <div className="sb-rounds-row">
            {rounds.map(({ c, post }) => (
              <a
                className="sb-round"
                href={href(ctx, categoryPath(c))}
                key={c.id}
              >
                <Img alt="" src={post?.coverImage ?? ""} />
                {c.name}
              </a>
            ))}
          </div>
        </section>
      );
    },
    type: "roundChips",
  }
);

const DEFAULT_SCORES = [
  ["15:00", "AZU", "VER", "Liga Nacional"],
  ["16:30", "LEO", "FAL", "Liga Nacional"],
  ["17:00", "TIG", "URS", "Copa do Estado"],
  ["19:30", "ESC", "NAU", "Liga Nacional"],
  ["20:00", "COM", "ATL", "Copa do Estado"],
  ["21:30", "RAI", "SOL", "Liga Nacional"],
].map(([time, home, away, league]) => ({
  away: away as string,
  home: home as string,
  league: league as string,
  time: time as string,
}));

const scoreStrip = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          away: str(),
          home: str(),
          league: str(),
          time: str(),
        })
      )
      .default(DEFAULT_SCORES),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "time", kind: "text", label: "Horário" },
          { key: "home", kind: "text", label: "Time da casa" },
          { key: "away", kind: "text", label: "Time visitante" },
          { key: "league", kind: "text", label: "Campeonato" },
        ],
        key: "items",
        kind: "list",
        label: "Jogos",
      },
    ],
    group: "blog",
    label: "Faixa de jogos",
    render: p =>
      p.items.length === 0 ? null : (
        <section className="sb-container sb-scores">
          {p.items.map((g, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: os itens são editáveis e podem repetir
            <div className="sb-score" key={i}>
              <small>{g.time}</small>
              <b>{g.home}</b>
              <b>{g.away}</b>
              <small>{g.league}</small>
            </div>
          ))}
        </section>
      ),
    type: "scoreStrip",
  }
);

const tvHero = defineBlock(z.object({ categorySlug: str() }), {
  fields: [
    { key: "categorySlug", kind: "text", label: "Categoria (vazio = todas)" },
  ],
  group: "blog",
  label: "Banner de TV (destaque + abas)",
  render: (p, ctx) => {
    const list = pool(ctx, p.categorySlug).list;
    const lead = list[0];
    if (!lead) return null;
    return (
      <section
        className="sb-tvhero"
        style={{ backgroundImage: `url(${lead.coverImage})` }}
      >
        <div className="sb-container">
          <strong>{lead.title}</strong>
          <nav>
            {cycle(list, 1, 4).map(post => (
              <a href={href(ctx, postPath(post))} key={post.id}>
                {post.title.length > 38
                  ? `${post.title.slice(0, 36)}…`
                  : post.title}
              </a>
            ))}
          </nav>
        </div>
      </section>
    );
  },
  type: "tvHero",
});

export const portalHubBlocks = [
  hubFront,
  hubSections,
  hubWidgets,
  hubVideos,
  hubTop,
  catSlider,
  catChips,
  skinBar,
  mosaic,
  roundChips,
  scoreStrip,
  tvHero,
];
