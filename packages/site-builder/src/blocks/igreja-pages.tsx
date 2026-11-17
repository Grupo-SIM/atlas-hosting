import type { CSSProperties } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { frameProps } from "./frame.js";
import { newTab, safeUrl } from "./helpers.js";
import {
  flag,
  href,
  Img,
  int,
  mapsLink,
  PlayIcon,
  str,
  Tabs,
  th,
  VvWhatsapp,
  waHref,
  YES_NO,
} from "./igreja-lib.js";
import type { BlockDefinition, RenderContext } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos das páginas internas do template "Comunidade Viva" (`cv*`): faixa de título (`cvPageHero`), "Nossa história"
 * (`cvStory`), agenda em abas (`cvAgenda`), células por bairro (`cvCells`), localização com mapa e sedes
 * (`cvLocations`) e a 404 (`cvNotFound`). Textos, listas e imagens são props com campo no painel.
 */

const splitEvents = (s: string) =>
  s
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);

/* ───────────────────────── faixa de título ───────────────────────── */

const cvPageHero = defineBlock(
  z.object({
    height: int(120, 600, 350),
    image: str(),
    layout: z.enum(["left", "center"]).default("left").catch("left"),
    title: str("Nossa história"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da página (h1)" },
      { key: "image", kind: "image", label: "Foto (vazio = só o título)" },
      {
        key: "layout",
        kind: "select",
        label: "Disposição",
        options: [
          { label: "Título à esquerda, foto à direita", value: "left" },
          {
            label: "Título centralizado sobre a foto clareada",
            value: "center",
          },
        ],
      },
      { key: "height", kind: "number", label: "Altura no computador (px)" },
    ],
    group: "content",
    label: "Faixa do título (Comunidade Viva)",
    render: p => (
      <section
        className={p.layout === "center" ? "cv-ph is-center" : "cv-ph"}
        style={{ "--ph": `${p.height}px` } as CSSProperties}
      >
        {p.image ? (
          <div aria-hidden="true" className="cv-ph-img">
            <Img src={p.image} />
          </div>
        ) : null}
        <div className="cv-ph-in">
          <h1>{p.title}</h1>
        </div>
      </section>
    ),
    type: "cvPageHero",
  }
);

/* ───────────────────────── nossa história ───────────────────────── */

const cvStory = defineBlock(
  z.object({
    lead: str("Cada história começa com um primeiro passo."),
    paragraphs: z
      .array(z.object({ text: str() }))
      .default([])
      .catch([]),
    signature: str(),
    videoLabel: str("Assistir à nossa história"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "lead", kind: "text", label: "Frase de abertura (centralizada)" },
      {
        itemFields: [{ key: "text", kind: "textarea", label: "Parágrafo" }],
        key: "paragraphs",
        kind: "list",
        label: "Parágrafos",
      },
      {
        key: "signature",
        kind: "text",
        label: "Assinatura (vazio = nome da liderança do tema)",
      },
      { key: "videoLabel", kind: "text", label: "Texto do botão de vídeo" },
      {
        key: "videoUrl",
        kind: "url",
        label: "Vídeo da história (YouTube; vazio = sem botão)",
      },
    ],
    group: "content",
    label: "Nossa história (Comunidade Viva)",
    render: (p, ctx) => {
      const embed = p.videoUrl ? popupVideoEmbed(p.videoUrl) : null;
      const signature = p.signature || th(ctx, "leaderName");
      return (
        <section className="cv-story">
          <h2 className="cv-story-lead">{p.lead}</h2>
          {p.paragraphs.map((x, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do parágrafo
            <p key={i}>{x.text}</p>
          ))}
          {signature ? <p className="cv-sign">{signature}</p> : null}
          {p.videoUrl && p.videoLabel ? (
            <div className="cv-btn-w">
              <a
                className="cv-btn"
                data-sb-video={embed ?? undefined}
                href={safeUrl(p.videoUrl)}
                {...newTab(p.videoUrl)}
              >
                <PlayIcon />
                {p.videoLabel}
              </a>
            </div>
          ) : null}
        </section>
      );
    },
    type: "cvStory",
  }
);

/* ───────────────────────── agenda ───────────────────────── */

const DAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const cvAgenda = defineBlock(
  z.object({
    days: z
      .array(
        z.object({
          day: str(),
          entries: z
            .array(z.object({ date: str(), events: str() }))
            .default([])
            .catch([]),
        })
      )
      .default(DAYS.map(day => ({ day, entries: [] })))
      .catch([]),
    emptyText: str("Sem programação"),
    label: str("Dias da semana"),
  }),
  {
    fields: [
      {
        key: "label",
        kind: "text",
        label: "Descrição das abas (acessibilidade)",
      },
      { key: "emptyText", kind: "text", label: "Texto do dia sem eventos" },
      {
        itemFields: [
          { key: "day", kind: "text", label: "Nome da aba (dia)" },
          {
            itemFields: [
              {
                key: "date",
                kind: "text",
                label: "Data (ex.: Domingo, 3 de novembro)",
              },
              {
                key: "events",
                kind: "textarea",
                label:
                  "Eventos (um por linha, ex.: Culto de celebração – 10h (Sede))",
              },
            ],
            key: "entries",
            kind: "list",
            label: "Datas e eventos do dia",
          },
        ],
        key: "days",
        kind: "list",
        label: "Dias (até 10 abas)",
      },
    ],
    group: "content",
    label: "Agenda em abas (Comunidade Viva)",
    render: p => {
      const days = p.days.slice(0, 10);
      return (
        <section className="cv-ag">
          {/* biome-ignore lint/correctness/useUniqueElementIds: há uma agenda por página; o rádio e a aba se ligam por id */}
          <Tabs
            cls="cv-tab"
            id="cv-ag"
            label={p.label}
            panels={days.map(d => (
              <div key={d.day}>
                {d.entries.filter(e => e.date || e.events).length ? (
                  d.entries.map(e => (
                    <div className="cv-day" key={e.date + e.events}>
                      {e.date ? <h3>{e.date}</h3> : null}
                      <ul>
                        {splitEvents(e.events).map(ev => (
                          <li key={ev}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="cv-day-none">{p.emptyText}</p>
                )}
              </div>
            ))}
            tabs={days.map(d => d.day)}
          />
        </section>
      );
    },
    type: "cvAgenda",
  }
);

/* ───────────────────────── células ───────────────────────── */

const CELL_ITEM = z.object({
  address: str(),
  leader: str(),
  name: str(),
  schedule: str(),
  whatsapp: str(),
});

type Cell = z.infer<typeof CELL_ITEM>;

function CellInfo({
  cell,
  closeId,
  ctx,
  labels,
}: {
  cell: Cell;
  closeId?: string;
  ctx: RenderContext;
  labels: {
    close: string;
    leader: string;
    place: string;
    wa: string;
    when: string;
  };
}) {
  const wa = waHref(
    ctx,
    `Olá! Quero participar da célula do bairro ${cell.name}.`,
    cell.whatsapp
  );
  return (
    <>
      {closeId ? (
        <button
          aria-label={labels.close}
          className="cv-pop-x"
          popoverTarget={closeId}
          popoverTargetAction="hide"
          type="button"
        >
          ×
        </button>
      ) : null}
      <h3>{cell.name}</h3>
      <dl>
        {cell.leader ? (
          <>
            <dt>{labels.leader}</dt>
            <dd>{cell.leader}</dd>
          </>
        ) : null}
        {cell.schedule ? (
          <>
            <dt>{labels.when}</dt>
            <dd>{cell.schedule}</dd>
          </>
        ) : null}
        {cell.address ? (
          <>
            <dt>{labels.place}</dt>
            <dd>{cell.address}</dd>
          </>
        ) : null}
      </dl>
      {wa ? (
        <a
          className="cv-wa"
          href={wa}
          rel="noopener noreferrer"
          target="_blank"
        >
          <VvWhatsapp />
          {labels.wa}
        </a>
      ) : null}
    </>
  );
}

const cvCells = defineBlock(
  z.object({
    closeLabel: str("Fechar"),
    items: z.array(CELL_ITEM).default([]).catch([]),
    leaderLabel: str("Líder"),
    line1: str("Você sabe o que é uma célula?"),
    line2: str(
      "Célula é um encontro semanal nas casas para estudar a Bíblia, conversar, comer junto e fortalecer amizades."
    ),
    line3: str(
      "Que tal experimentar um novo círculo de amigos para crescer na fé?"
    ),
    placeLabel: str("Endereço aproximado"),
    question: str("Onde você prefere participar?"),
    showFirst: flag("no"),
    waLabel: str("Falar pelo WhatsApp"),
    whenLabel: str("Dia e horário"),
  }),
  {
    fields: [
      { key: "line1", kind: "text", label: "Pergunta de abertura" },
      { key: "line2", kind: "textarea", label: "Explicação" },
      { key: "line3", kind: "textarea", label: "Convite" },
      { key: "question", kind: "text", label: "Título da lista de bairros" },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Bairro" },
          { key: "leader", kind: "text", label: "Líder" },
          { key: "schedule", kind: "text", label: "Dia e horário" },
          { key: "address", kind: "text", label: "Endereço aproximado" },
          {
            key: "whatsapp",
            kind: "text",
            label: "WhatsApp do líder (só números; vazio = o do tema)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Bairros (cada um abre um detalhe)",
      },
      { key: "leaderLabel", kind: "text", label: "Rótulo: líder" },
      { key: "whenLabel", kind: "text", label: "Rótulo: dia e horário" },
      { key: "placeLabel", kind: "text", label: "Rótulo: endereço" },
      { key: "waLabel", kind: "text", label: "Texto do botão de WhatsApp" },
      { key: "closeLabel", kind: "text", label: "Descrição do botão fechar" },
      {
        key: "showFirst",
        kind: "select",
        label: "Mostrar o detalhe do 1º bairro aberto no editor",
        options: YES_NO,
      },
    ],
    group: "content",
    label: "Células por bairro (Comunidade Viva)",
    render: (p, ctx) => {
      const labels = {
        close: p.closeLabel,
        leader: p.leaderLabel,
        place: p.placeLabel,
        wa: p.waLabel,
        when: p.whenLabel,
      };
      const first = p.items[0];
      return (
        <section className="cv-cells">
          <h2>{p.line1}</h2>
          <p>{p.line2}</p>
          <p>{p.line3}</p>
          <h2 className="cv-cells-q">{p.question}</h2>
          <div className="cv-hoods">
            {p.items.map((c, i) => (
              <button
                className="cv-hood"
                // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do bairro
                key={i}
                popoverTarget={`cv-cell-${i}`}
                type="button"
              >
                {c.name}
              </button>
            ))}
          </div>
          {p.items.map((c, i) => (
            <div
              aria-label={c.name}
              className="cv-pop"
              id={`cv-cell-${i}`}
              // biome-ignore lint/suspicious/noArrayIndexKey: a ordem é a identidade do bairro
              key={i}
              popover="auto"
              role="dialog"
            >
              <CellInfo
                cell={c}
                closeId={`cv-cell-${i}`}
                ctx={ctx}
                labels={labels}
              />
            </div>
          ))}
          {ctx.mode === "edit" && p.showFirst === "yes" && first ? (
            <div className="cv-pop is-static">
              <CellInfo cell={first} ctx={ctx} labels={labels} />
            </div>
          ) : null}
        </section>
      );
    },
    type: "cvCells",
  }
);

/* ───────────────────────── localização ───────────────────────── */

const SITE_ITEM = z.object({
  address: str(),
  group: str("Capital"),
  hours: str(),
  name: str(),
  phone: str(),
  whatsapp: str(),
});

type Site = z.infer<typeof SITE_ITEM>;

const cvLocations = defineBlock(
  z.object({
    directionsLabel: str("Como chegar"),
    hoursLabel: str("Cultos"),
    image: str(),
    imageAlt: str("Fachada da igreja"),
    items: z.array(SITE_ITEM).default([]).catch([]),
    mapTitle: str("Mapa da sede da igreja"),
    title: str("Estamos esperando a sua visita!"),
    waLabel: str("Falar pelo WhatsApp"),
    waMessage: str("Olá! Gostaria de visitar a igreja."),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (h1)" },
      {
        key: "image",
        kind: "image",
        label: "Foto ao lado do título (fachada)",
      },
      { key: "imageAlt", kind: "text", label: "Descrição da foto" },
      {
        key: "mapTitle",
        kind: "text",
        label:
          "Descrição do mapa (acessibilidade; o endereço é o da sede, no tema)",
      },
      {
        itemFields: [
          {
            key: "group",
            kind: "text",
            label: "Aba (ex.: Capital, Municípios; mesmo nome = mesma aba)",
          },
          { key: "name", kind: "text", label: "Nome da sede ou congregação" },
          { key: "address", kind: "text", label: "Endereço" },
          {
            key: "hours",
            kind: "textarea",
            label: "Horários dos cultos (um por linha)",
          },
          { key: "phone", kind: "text", label: "Telefone (opcional)" },
          {
            key: "whatsapp",
            kind: "text",
            label: "WhatsApp da sede (só números; vazio = o do tema)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Sedes e congregações",
      },
      { key: "hoursLabel", kind: "text", label: "Rótulo dos horários" },
      { key: "directionsLabel", kind: "text", label: "Texto do botão de rota" },
      { key: "waLabel", kind: "text", label: "Texto do botão de WhatsApp" },
      { key: "waMessage", kind: "text", label: "Mensagem do WhatsApp" },
    ],
    group: "content",
    label: "Localização (Comunidade Viva)",
    render: (p, ctx) => {
      const address = th(ctx, "address") || p.items[0]?.address || "";
      const map = address
        ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
        : "";
      const groups: string[] = [];
      for (const s of p.items) {
        const g = s.group || "Sedes";
        if (!groups.includes(g)) groups.push(g);
      }
      const card = (s: Site) => {
        const wa = waHref(ctx, p.waMessage, s.whatsapp);
        const hours = splitEvents(s.hours);
        return (
          <article className="cv-site" key={s.name + s.address}>
            <h3>{s.name}</h3>
            <address>{s.address}</address>
            {hours.length ? (
              <>
                <h4>{p.hoursLabel}</h4>
                <ul>
                  {hours.map(h => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <div className="cv-site-btns">
              {s.address ? (
                <a
                  className="cv-btn"
                  href={mapsLink(s.address)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {p.directionsLabel}
                </a>
              ) : null}
              {wa ? (
                <a
                  className="cv-wa"
                  href={wa}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <VvWhatsapp />
                  {p.waLabel}
                </a>
              ) : null}
            </div>
          </article>
        );
      };
      const ld = p.items.map(s => {
        const o: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": "Church",
          address: { "@type": "PostalAddress", streetAddress: s.address },
          hasMap: mapsLink(s.address),
          name: s.name,
        };
        if (s.phone) o.telephone = s.phone;
        return JSON.stringify(o).replaceAll("<", "\\u003c");
      });
      return (
        <section className="cv-locs">
          {map ? (
            <iframe
              allowFullScreen
              className="cv-map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={p.mapTitle}
              {...frameProps(ctx, map)}
            />
          ) : null}
          <div className="cv-loc">
            <div className="cv-loc-top">
              <h1>{p.title}</h1>
              {p.image ? <Img alt={p.imageAlt} src={p.image} /> : null}
            </div>
            {groups.length ? (
              // biome-ignore lint/correctness/useUniqueElementIds: há uma lista de sedes por página; o rádio e a aba se ligam por id
              <Tabs
                cls="cv-lt"
                id="cv-lt"
                label={p.title}
                panels={groups.map(g => (
                  <div className="cv-sites" key={g}>
                    {p.items.filter(s => (s.group || "Sedes") === g).map(card)}
                  </div>
                ))}
                tabs={groups}
              />
            ) : null}
          </div>
          {ld.map(json => (
            <script
              // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD gerado das props; `<` escapado
              dangerouslySetInnerHTML={{ __html: json }}
              key={json}
              type="application/ld+json"
            />
          ))}
        </section>
      );
    },
    type: "cvLocations",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const cvNotFound = defineBlock(
  z.object({
    backLabel: str("Voltar ao início"),
    image: str(),
    text: str("A página que você procura não existe ou mudou de endereço."),
    title: str("Página não encontrada"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "image", kind: "image", label: "Foto" },
      { key: "backLabel", kind: "text", label: "Texto do botão" },
    ],
    group: "content",
    label: "Página não encontrada (Comunidade Viva)",
    render: (p, ctx) => (
      <section className="cv-nf">
        {p.image ? <Img alt="" src={p.image} /> : null}
        <h1>{p.title}</h1>
        <p>{p.text}</p>
        <a className="cv-btn" href={href(ctx, "/")}>
          {p.backLabel}
        </a>
      </section>
    ),
    type: "cvNotFound",
  }
);

export const igrejaPageBlocks: BlockDefinition[] = [
  cvPageHero,
  cvStory,
  cvAgenda,
  cvCells,
  cvLocations,
  cvNotFound,
];
