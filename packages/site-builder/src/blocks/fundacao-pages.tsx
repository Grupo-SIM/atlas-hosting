import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { frameProps } from "./frame.js";
import {
  anchorHref,
  int,
  isSamplePix,
  org,
  Pic,
  paragraphs,
  pixKeyValue,
  pixPayload,
  pixTypeLabel,
  SvIcon,
  SvSocial,
  socialBg,
  str,
  telHref,
  waHref,
  YES_NO,
} from "./fundacao-lib.js";
import {
  categoryOf,
  formatDate,
  href,
  newTab,
  postPath,
  visiblePosts,
} from "./helpers.js";
import type { BlockDefinition, FieldDef } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos das páginas internas do template "Semente Viva" (`sv*`): faixa de título (`svPageHero`), equipe, "como
 * atuamos" com abas, doação e PIX, notícias, galeria, contato, mapa, corpo do post e 404. Os dados da fundação e o PIX
 * vêm de `site.theme` (`org()`); o formulário de contato não tem backend (URL configurável, com `mailto:` de apoio).
 */

const linkItem = z.object({ label: str(), url: str() });
const SOCIAL_FIELDS: FieldDef[] = [
  {
    key: "label",
    kind: "text",
    label: "Rede (Instagram, Facebook, YouTube, WhatsApp, TikTok, X)",
  },
  { key: "url", kind: "url", label: "Link do perfil (vazio = não aparece)" },
];

/* ───────────────────────── faixa de título ───────────────────────── */

const svPageHero = defineBlock(
  z.object({
    crumb: str(),
    homeLabel: str("Início"),
    parentLabel: str(),
    parentUrl: str(),
    title: str(),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título (vazio = título do post ou da categoria aberta)",
      },
      {
        key: "crumb",
        kind: "text",
        label: "Trilha — página atual (vazio = o título)",
      },
      { key: "homeLabel", kind: "text", label: "Trilha — nome do início" },
      {
        key: "parentLabel",
        kind: "text",
        label: "Trilha — página intermediária (opcional)",
      },
      {
        key: "parentUrl",
        kind: "url",
        label: "Trilha — link da intermediária",
      },
    ],
    group: "content",
    label: "Faixa de título (Semente Viva)",
    render: (p, ctx) => {
      const title =
        p.title ||
        ctx.current.post?.title ||
        ctx.current.category?.name ||
        "Título da página";
      return (
        <section className="sv-ph">
          <div aria-hidden="true" className="sv-map" />
          <div className="sv-ph-in">
            <h1>{title}</h1>
            <nav aria-label="Você está em" className="sv-crumb">
              <a href={href(ctx, "/")}>{p.homeLabel}</a>
              <span aria-hidden="true">›</span>
              {p.parentLabel && p.parentUrl ? (
                <>
                  <a href={href(ctx, p.parentUrl)}>{p.parentLabel}</a>
                  <span aria-hidden="true">›</span>
                </>
              ) : null}
              <span aria-current="page">{p.crumb || title}</span>
            </nav>
          </div>
        </section>
      );
    },
    type: "svPageHero",
  }
);

/* ───────────────────────── equipe ───────────────────────── */

const member = z.object({ image: str(), name: str(), role: str() });

const svTeam = defineBlock(
  z.object({
    eyebrow: str("Equipe"),
    members: z.array(member).default([]).catch([]),
    subtitle: str("Conheça quem faz a diferença todos os dias"),
    title: str("Nossos profissionais"),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Rótulo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto (quadrada)" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
        ],
        key: "members",
        kind: "list",
        label: "Equipe",
      },
    ],
    group: "content",
    label: "Equipe (Semente Viva)",
    render: p => (
      <section className="sv-sec">
        <div className="sv-sec-head">
          {p.eyebrow ? <p className="sv-eyebrow">{p.eyebrow}</p> : null}
          <h2>{p.title}</h2>
          {p.subtitle ? <p>{p.subtitle}</p> : null}
        </div>
        <ul className="sv-team-grid">
          {p.members.map(m => (
            <li className="sv-member" key={m.name + m.role}>
              <Pic alt={m.name} src={m.image} />
              <h3>{m.name}</h3>
              <p>{m.role}</p>
            </li>
          ))}
        </ul>
      </section>
    ),
    type: "svTeam",
  }
);

/* ───────────────────────── como atuamos ───────────────────────── */

const tab = z.object({
  alt: str(),
  image: str(),
  label: str(),
  text: str(),
  title: str(),
});
const row = z.object({ activity: str(), day: str(), time: str() });

/** Filhos (para `Block.fx`): 1 = seção → 1.1 = cabeçalho, 1.2 = abas, 1.3 = tabela, 1.4 = "Dúvidas?". */
const svHowWeWork = defineBlock(
  z.object({
    activityHead: str("Atividade"),
    dayHead: str("Dia"),
    doubtsLabel: str("Fale com a gente"),
    doubtsText: str(
      "Tire suas dúvidas sobre horários, matrículas e como participar das atividades."
    ),
    doubtsTitle: str("Dúvidas?"),
    doubtsUrl: str(),
    eyebrow: str("Atuação"),
    playLabel: str("Assistir ao vídeo sobre a atuação"),
    rows: z.array(row).default([]).catch([]),
    scheduleTitle: str("Organização geral das atividades"),
    tabs: z.array(tab).default([]).catch([]),
    tabsLabel: str("Áreas de atuação"),
    text: str(),
    timeHead: str("Horário"),
    title: str("Como atuamos"),
    videoLabel: str("Conheça"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Rótulo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto de abertura" },
      {
        key: "videoUrl",
        kind: "url",
        label: "Vídeo (YouTube ou Vimeo; vazio = sem vídeo)",
      },
      { key: "videoLabel", kind: "text", label: "Vídeo — texto sob o play" },
      {
        key: "playLabel",
        kind: "text",
        label: "Vídeo — nome do botão (leitor de tela)",
      },
      {
        key: "tabsLabel",
        kind: "text",
        label: "Abas — nome do grupo (leitor de tela)",
      },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Nome da aba" },
          { key: "title", kind: "text", label: "Título" },
          {
            key: "text",
            kind: "textarea",
            label: "Texto (um parágrafo por linha)",
          },
          { key: "image", kind: "image", label: "Foto" },
          { key: "alt", kind: "text", label: "Descrição da foto" },
        ],
        key: "tabs",
        kind: "list",
        label: "Abas por área",
      },
      { key: "scheduleTitle", kind: "text", label: "Tabela — título" },
      { key: "dayHead", kind: "text", label: "Tabela — cabeçalho da coluna 1" },
      {
        key: "timeHead",
        kind: "text",
        label: "Tabela — cabeçalho da coluna 2",
      },
      {
        key: "activityHead",
        kind: "text",
        label: "Tabela — cabeçalho da coluna 3",
      },
      {
        itemFields: [
          { key: "day", kind: "text", label: "Dia" },
          { key: "time", kind: "text", label: "Horário" },
          { key: "activity", kind: "text", label: "Atividade" },
        ],
        key: "rows",
        kind: "list",
        label: "Linhas da tabela",
      },
      { key: "doubtsTitle", kind: "text", label: "Dúvidas — título" },
      { key: "doubtsText", kind: "textarea", label: "Dúvidas — texto" },
      { key: "doubtsLabel", kind: "text", label: "Dúvidas — botão" },
      {
        key: "doubtsUrl",
        kind: "url",
        label:
          "Dúvidas — link (vazio = WhatsApp do tema; sem WhatsApp o botão some)",
      },
    ],
    group: "content",
    label: "Como atuamos — abas por área (Semente Viva)",
    render: (p, ctx) => {
      const o = org(ctx);
      const embed = p.videoUrl ? popupVideoEmbed(p.videoUrl) : null;
      const doubts = p.doubtsUrl || waHref(o.whatsapp);
      return (
        <section className="sv-how">
          <div className="sv-how-head">
            <div>
              {p.eyebrow ? <p className="sv-eyebrow">{p.eyebrow}</p> : null}
              <h2>{p.title}</h2>
              {p.text ? <p>{p.text}</p> : null}
            </div>
            {p.videoUrl ? (
              <div className="sv-how-video">
                <a
                  aria-label={p.playLabel}
                  className="sv-play"
                  data-sb-video={embed ?? undefined}
                  href={href(ctx, p.videoUrl)}
                  {...newTab(p.videoUrl)}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m7 4 13 8-13 8z" />
                  </svg>
                </a>
                {p.videoLabel ? (
                  <span className="sv-conheca">{p.videoLabel}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="sv-tabs" data-sv-tabs="1">
            {p.tabs.map((t, i) => (
              <input
                aria-label={t.label}
                className="sv-tab-radio"
                defaultChecked={i === 0}
                id={`svt-${i}`}
                key={`r-${t.label}`}
                name="svt"
                type="radio"
              />
            ))}
            <div aria-label={p.tabsLabel} className="sv-tablist" role="tablist">
              {p.tabs.map((t, i) => (
                // biome-ignore lint/a11y/useFocusableInteractive: o foco fica no radio nativo (irmão anterior), que também troca de aba com as setas
                <label
                  aria-controls={`svt-panel-${i}`}
                  aria-selected={i === 0}
                  className="sv-tab"
                  htmlFor={`svt-${i}`}
                  id={`svt-tab-${i}`}
                  key={`t-${t.label}`}
                  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: o label é o rótulo visual do radio nativo, que faz o papel de aba
                  role="tab"
                >
                  {t.label}
                </label>
              ))}
            </div>
            <div className="sv-tabpanels">
              {p.tabs.map((t, i) => (
                <div
                  aria-labelledby={`svt-tab-${i}`}
                  className="sv-tabpanel sv-how-body"
                  id={`svt-panel-${i}`}
                  key={`p-${t.label}`}
                  role="tabpanel"
                >
                  <div>
                    <h3>{t.title}</h3>
                    {paragraphs(t.text).map(line => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <Pic alt={t.alt} src={t.image} />
                </div>
              ))}
            </div>
          </div>
          {p.rows.length ? (
            <div className="sv-sched">
              <h3>{p.scheduleTitle}</h3>
              <div className="sv-table-wrap">
                <table className="sv-table">
                  <thead>
                    <tr>
                      <th scope="col">{p.dayHead}</th>
                      <th scope="col">{p.timeHead}</th>
                      <th scope="col">{p.activityHead}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.rows.map(r => (
                      <tr key={r.day + r.time + r.activity}>
                        <td>{r.day}</td>
                        <td>{r.time}</td>
                        <td>{r.activity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          {p.doubtsTitle ? (
            <div className="sv-doubts">
              <h3>{p.doubtsTitle}</h3>
              <p>{p.doubtsText}</p>
              {doubts && p.doubtsLabel ? (
                <a
                  className="sv-btn sv-btn-green"
                  href={href(ctx, doubts)}
                  {...newTab(doubts)}
                >
                  {p.doubtsLabel}
                </a>
              ) : null}
            </div>
          ) : null}
        </section>
      );
    },
    type: "svHowWeWork",
  }
);

/* ───────────────────────── doação ───────────────────────── */

/** Id do popup do PIX: o botão "Quero doar" do `svDonate` aponta para ele (`popovertarget`). */
const PIX_POPUP_ID = "sv-pix-pop";

/** Filhos (para `Block.fx`): 1 = seção → 1.1 = texto + foto, 1.2 = chamada final. */
const svDonate = defineBlock(
  z.object({
    alt: str(),
    buttonLabel: str("Quero doar"),
    closing: str("Obrigado por plantar esta semente conosco."),
    ctaText: str(
      "Toda contribuição, grande ou pequena, vira esporte, estudo e cuidado para quem mais precisa."
    ),
    ctaTitle: str("Sua doação faz a diferença"),
    highlight: str(
      "Com R$ 1 por dia você ajuda a manter uma criança no esporte."
    ),
    image: str(),
    text: str(
      "Nosso trabalho existe graças a pessoas que acreditam em um futuro melhor para a comunidade. Cada doação ajuda a manter os treinos, as aulas e os encontros com os idosos.\n\nVocê pode contribuir pelo PIX, quando e quanto quiser. Todo o valor é usado nos projetos da fundação."
    ),
    title: str("Como ajudar?"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (um parágrafo por linha em branco)",
      },
      { key: "highlight", kind: "text", label: "Frase em destaque (negrito)" },
      { key: "image", kind: "image", label: "Foto (recortada em blob verde)" },
      { key: "alt", kind: "text", label: "Descrição da foto" },
      { key: "ctaTitle", kind: "text", label: "Chamada — título" },
      { key: "ctaText", kind: "textarea", label: "Chamada — frase" },
      { key: "buttonLabel", kind: "text", label: "Botão (abre o PIX)" },
      { key: "closing", kind: "text", label: "Frase de fechamento" },
    ],
    group: "content",
    label: "Como ajudar — doação (Semente Viva)",
    render: p => (
      <section className="sv-donate">
        <div className="sv-donate-in">
          <div>
            <h2>{p.title}</h2>
            {paragraphs(p.text).map(t => (
              <p key={t}>{t}</p>
            ))}
            {p.highlight ? (
              <p>
                <strong>{p.highlight}</strong>
              </p>
            ) : null}
          </div>
          <div className="sv-blobph">
            <Pic alt={p.alt} src={p.image} />
          </div>
        </div>
        <div className="sv-donate-cta">
          <h2>{p.ctaTitle}</h2>
          <p>{p.ctaText}</p>
          {p.buttonLabel ? (
            <button
              className="sv-btn sv-btn-green"
              popoverTarget={PIX_POPUP_ID}
              type="button"
            >
              {p.buttonLabel}
            </button>
          ) : null}
          {p.closing ? <p style={{ margin: "26px 0 0" }}>{p.closing}</p> : null}
        </div>
      </section>
    ),
    type: "svDonate",
  }
);

const svPix = defineBlock(
  z.object({
    closeLabel: str("Fechar"),
    copiedLabel: str("Copiada!"),
    copyLabel: str("Copiar chave"),
    idLabel: str("Código da transferência"),
    keyLabel: str("Chave PIX"),
    layout: z.enum(["popup", "inline"]).default("inline").catch("inline"),
    payloadCopiedLabel: str("Copiado!"),
    payloadCopyLabel: str("Copiar código"),
    payloadLabel: str("PIX copia e cola"),
    qrAlt: str("QR code para doar por PIX"),
    receiverLabel: str("Recebedor"),
    showInEditor: z.enum(["yes", "no"]).default("no").catch("no"),
    showPayload: z.enum(["yes", "no"]).default("yes").catch("yes"),
    title: str("Nosso PIX"),
    typeLabel: str("Tipo da chave"),
  }),
  {
    fields: [
      {
        key: "layout",
        kind: "select",
        label: "Como aparece",
        options: [
          { label: "Solto na página", value: "inline" },
          { label: "Em popup (abre com o botão “Quero doar”)", value: "popup" },
        ],
      },
      {
        key: "showInEditor",
        kind: "select",
        label: "Mostrar o popup aberto no editor",
        options: YES_NO,
      },
      { key: "title", kind: "text", label: "Título" },
      { key: "keyLabel", kind: "text", label: "Rótulo da chave" },
      { key: "typeLabel", kind: "text", label: "Rótulo do tipo da chave" },
      { key: "receiverLabel", kind: "text", label: "Rótulo do recebedor" },
      {
        key: "idLabel",
        kind: "text",
        label: "Rótulo do código da transferência",
      },
      { key: "copyLabel", kind: "text", label: "Botão copiar chave" },
      { key: "copiedLabel", kind: "text", label: "Aviso depois de copiar" },
      {
        key: "showPayload",
        kind: "select",
        label:
          "Mostrar o “PIX copia e cola” (gerado da chave, do nome e da cidade)",
        options: YES_NO,
      },
      { key: "payloadLabel", kind: "text", label: "Rótulo do copia e cola" },
      { key: "payloadCopyLabel", kind: "text", label: "Botão copiar código" },
      {
        key: "payloadCopiedLabel",
        kind: "text",
        label: "Aviso depois de copiar o código",
      },
      { key: "qrAlt", kind: "text", label: "Descrição do QR code" },
      { key: "closeLabel", kind: "text", label: "Botão fechar (nome)" },
    ],
    group: "content",
    label: "PIX — chave, QR code e copiar (Semente Viva)",
    render: (p, ctx) => {
      const o = org(ctx);
      const edit = ctx.mode === "edit";
      const sample = isSamplePix(o.pixKey);
      const keyValue = pixKeyValue(o.pixKeyType, o.pixKey);
      const payload =
        p.showPayload === "yes"
          ? pixPayload({
              city: o.pixCity,
              key: keyValue,
              name: o.pixReceiver || o.name,
              txid: o.pixId,
            })
          : "";
      const popup = p.layout === "popup";
      const asCard = !popup || (edit && p.showInEditor === "yes");
      const card = (
        <div className={asCard && !popup ? "sv-pix is-inline" : "sv-pix"}>
          {popup && !edit ? (
            <button
              aria-label={p.closeLabel}
              className="sv-pix-x"
              popoverTarget={PIX_POPUP_ID}
              popoverTargetAction="hide"
              type="button"
            >
              <SvIcon name="close" />
            </button>
          ) : null}
          <h2>{p.title}</h2>
          {edit && sample ? (
            <p className="sv-pix-warn">
              Atenção: esta é a chave PIX de exemplo. Troque a chave, o
              recebedor, a cidade e o QR code em “Página inteira” antes de
              publicar.
            </p>
          ) : null}
          <div className="sv-pix-in">
            {o.pixQr ? (
              <div className="sv-qr">
                <Pic alt={p.qrAlt} src={o.pixQr} />
              </div>
            ) : null}
            <div>
              <dl>
                <div>
                  <dt>{p.keyLabel}</dt>
                  <dd>{o.pixKey || "—"}</dd>
                </div>
                <div>
                  <dt>{p.typeLabel}</dt>
                  <dd>{pixTypeLabel(o.pixKeyType)}</dd>
                </div>
                {o.pixReceiver ? (
                  <div>
                    <dt>{p.receiverLabel}</dt>
                    <dd>{o.pixReceiver}</dd>
                  </div>
                ) : null}
                {o.pixId ? (
                  <div>
                    <dt>{p.idLabel}</dt>
                    <dd>{o.pixId}</dd>
                  </div>
                ) : null}
              </dl>
              {o.pixKey ? (
                <div className="sv-pix-actions">
                  <button
                    className="sv-btn sv-btn-green sv-copy-btn"
                    data-done={p.copiedLabel}
                    data-sv-copy={o.pixKey}
                    type="button"
                  >
                    {p.copyLabel}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {payload ? (
            <>
              <p
                className="sv-pix-label"
                style={{ fontWeight: 700, margin: "26px 0 0" }}
              >
                {p.payloadLabel}
              </p>
              <p className="sv-payload">{payload}</p>
              <div className="sv-pix-actions">
                <button
                  className="sv-btn sv-btn-green sv-copy-btn"
                  data-done={p.payloadCopiedLabel}
                  data-sv-copy={payload}
                  type="button"
                >
                  {p.payloadCopyLabel}
                </button>
              </div>
            </>
          ) : null}
        </div>
      );
      if (!popup || (edit && p.showInEditor === "yes"))
        return (
          <section className="sv-donate" style={{ padding: "0 24px" }}>
            {card}
          </section>
        );
      return (
        <div className="sv-pix-pop" id={PIX_POPUP_ID} popover="auto">
          {card}
        </div>
      );
    },
    type: "svPix",
  }
);

/* ───────────────────────── notícias ───────────────────────── */

const svNews = defineBlock(
  z.object({
    category: str(),
    emptyText: str("Nenhuma notícia encontrada."),
    eyebrow: str("Notícias da fundação"),
    followTitle: str("Acompanhe também nas redes"),
    limit: int(1, 60, 12),
    readLabel: str("Ler notícia"),
    socials: z.array(linkItem).default([]).catch([]),
    title: str("Acompanhe nossas ações"),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Rótulo (vazio = sem cabeçalho)" },
      { key: "title", kind: "text", label: "Título" },
      {
        key: "category",
        kind: "text",
        label:
          "Só desta categoria (endereço da categoria; vazio = todas ou a da página)",
      },
      { key: "limit", kind: "number", label: "Quantas notícias (até 60)" },
      { key: "readLabel", kind: "text", label: "Texto do link do cartão" },
      { key: "emptyText", kind: "text", label: "Texto quando não há notícias" },
      {
        key: "followTitle",
        kind: "text",
        label: "Redes — título (vazio = sem redes)",
      },
      {
        itemFields: SOCIAL_FIELDS,
        key: "socials",
        kind: "list",
        label: "Redes",
      },
    ],
    group: "blog",
    label: "Notícias — grade (Semente Viva)",
    render: (p, ctx) => {
      const slug = p.category || ctx.current.category?.slug || "";
      const q = (ctx.query.q ?? "").trim().toLowerCase();
      const all = visiblePosts(ctx.site, ctx.mode).filter(post => {
        if (!slug) return true;
        return categoryOf(ctx.site, post)?.slug === slug;
      });
      const posts = all
        .filter(post =>
          q ? `${post.title} ${post.excerpt}`.toLowerCase().includes(q) : true
        )
        .slice(0, p.limit);
      const socials = p.socials.filter(s => s.label.trim() && s.url.trim());
      return (
        <section className="sv-sec">
          {p.title ? (
            <div className="sv-sec-head">
              {p.eyebrow ? <p className="sv-eyebrow">{p.eyebrow}</p> : null}
              <h2>{p.title}</h2>
            </div>
          ) : null}
          {posts.length ? (
            <div className="sv-news-grid">
              {posts.map(post => (
                <a
                  className="sb-post-card sv-ncard"
                  data-category={categoryOf(ctx.site, post)?.slug ?? ""}
                  data-search={`${post.title} ${post.excerpt}`}
                  href={href(ctx, postPath(post))}
                  key={post.id}
                >
                  <Pic alt={post.title} src={post.coverImage} />
                  <div className="sv-ncard-in">
                    <time>{formatDate(post.publishedAt)}</time>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    {p.readLabel ? (
                      <span className="sv-link">
                        {p.readLabel}
                        <SvIcon name="arrow" />
                      </span>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="sv-empty">{p.emptyText}</p>
          )}
          {p.followTitle && socials.length ? (
            <div className="sv-follow">
              <h3>{p.followTitle}</h3>
              <div className="sv-socs">
                {socials.map(s => (
                  <a
                    aria-label={s.label}
                    className="sv-soc"
                    href={href(ctx, s.url)}
                    key={s.label + s.url}
                    style={{ "--c": socialBg(s.label) } as CSSProperties}
                    {...newTab(s.url)}
                  >
                    <SvSocial label={s.label} />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      );
    },
    type: "svNews",
  }
);

/** Corpo do post (`postLayout`): meta, capa, texto e a chamada "Doe agora" no fim. */
const svPostBody = defineBlock(
  z.object({
    ctaLabel: str("Doe agora"),
    ctaText: str(
      "Sua doação mantém os projetos da fundação funcionando o ano todo."
    ),
    ctaTitle: str("Apoie nosso trabalho"),
    ctaUrl: str("/doacao/"),
  }),
  {
    fields: [
      {
        key: "ctaTitle",
        kind: "text",
        label: "Chamada final — título (vazio = sem chamada)",
      },
      { key: "ctaText", kind: "textarea", label: "Chamada final — texto" },
      { key: "ctaLabel", kind: "text", label: "Chamada final — botão" },
      { key: "ctaUrl", kind: "url", label: "Chamada final — link" },
    ],
    group: "blog",
    label: "Corpo do post (Semente Viva)",
    render: (p, ctx) => {
      const post = ctx.current.post;
      const cat = post ? categoryOf(ctx.site, post) : undefined;
      return (
        <article className="sv-post">
          {post ? (
            <>
              <div className="sv-post-meta">
                <time>{formatDate(post.publishedAt)}</time>
                {cat ? <span>{cat.name}</span> : null}
              </div>
              {post.coverImage ? (
                <Pic
                  alt={post.title}
                  className="sv-post-cover"
                  src={post.coverImage}
                />
              ) : null}
              <div className="sv-post-body">
                {ctx.renderBlocks(post.blocks)}
              </div>
            </>
          ) : null}
          {p.ctaTitle ? (
            <div className="sv-post-cta">
              <h3>{p.ctaTitle}</h3>
              <p style={{ marginBottom: 20 }}>{p.ctaText}</p>
              {p.ctaLabel ? (
                <a
                  className="sv-btn sv-btn-green"
                  href={anchorHref(ctx, p.ctaUrl || "/doacao/")}
                >
                  {p.ctaLabel}
                </a>
              ) : null}
            </div>
          ) : null}
        </article>
      );
    },
    type: "svPostBody",
  }
);

/* ───────────────────────── galeria ───────────────────────── */

const album = z.object({
  alt: str(),
  image: str(),
  linkLabel: str("Ver álbum"),
  title: str(),
  url: str(),
});

const svAlbums = defineBlock(
  z.object({
    eyebrow: str("Galeria"),
    items: z.array(album).default([]).catch([]),
    subtitle: str("Momentos que registram o trabalho da fundação"),
    title: str("Nossos álbuns"),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Rótulo" },
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Capa (quadrada)" },
          {
            key: "alt",
            kind: "text",
            label: "Descrição da capa (vazio = o título)",
          },
          { key: "title", kind: "text", label: "Título do álbum" },
          {
            key: "url",
            kind: "url",
            label: "Link do álbum (Drive, Flickr…; vazio = cartão sem link)",
          },
          { key: "linkLabel", kind: "text", label: "Texto do link" },
        ],
        key: "items",
        kind: "list",
        label: "Álbuns",
      },
    ],
    group: "media",
    label: "Galeria de álbuns (Semente Viva)",
    render: (p, ctx) => (
      <section className="sv-sec">
        <div className="sv-sec-head">
          {p.eyebrow ? <p className="sv-eyebrow">{p.eyebrow}</p> : null}
          <h2>{p.title}</h2>
          {p.subtitle ? <p>{p.subtitle}</p> : null}
        </div>
        <div className="sv-albums">
          {p.items.map(a => {
            const inner = (
              <>
                <Pic alt={a.alt || a.title} src={a.image} />
                <h3>{a.title}</h3>
                {a.url && a.linkLabel ? <span>{a.linkLabel}</span> : null}
              </>
            );
            return a.url ? (
              <a
                className="sv-album"
                href={href(ctx, a.url)}
                key={a.title + a.image}
                {...newTab(a.url)}
              >
                {inner}
              </a>
            ) : (
              <div className="sv-album" key={a.title + a.image}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    ),
    type: "svAlbums",
  }
);

/* ───────────────────────── contato e mapa ───────────────────────── */

/** Filhos (para `Block.fx`): 1 = seção → 1.1 = grade (1.1.1 = detalhes, 1.1.2 = formulário). */
const svContact = defineBlock(
  z.object({
    actionUrl: str(),
    addressLabel: str("Endereço"),
    buttonLabel: str("Enviar"),
    emailLabel: str("E-mail"),
    emailPlaceholder: str("Seu e-mail"),
    fallback: str("Se preferir, escreva para"),
    formTitle: str("Entre em contato"),
    hoursLabel: str("Horário"),
    infoText: str(
      "Fale com a gente para conhecer os projetos, visitar a fundação, ser voluntário ou doar. Respondemos em até dois dias úteis."
    ),
    infoTitle: str("Detalhes para contato"),
    messagePlaceholder: str("Sua mensagem"),
    namePlaceholder: str("Seu nome"),
    phoneLabel: str("Telefone"),
    phonePlaceholder: str("Telefone"),
  }),
  {
    fields: [
      { key: "infoTitle", kind: "text", label: "Detalhes — título" },
      { key: "infoText", kind: "textarea", label: "Detalhes — texto" },
      { key: "addressLabel", kind: "text", label: "Rótulo do endereço" },
      { key: "emailLabel", kind: "text", label: "Rótulo do e-mail" },
      { key: "phoneLabel", kind: "text", label: "Rótulo do telefone" },
      { key: "hoursLabel", kind: "text", label: "Rótulo do horário" },
      { key: "formTitle", kind: "text", label: "Formulário — título" },
      {
        key: "namePlaceholder",
        kind: "text",
        label: "Campo nome — texto de exemplo",
      },
      {
        key: "emailPlaceholder",
        kind: "text",
        label: "Campo e-mail — texto de exemplo",
      },
      {
        key: "phonePlaceholder",
        kind: "text",
        label: "Campo telefone — texto de exemplo",
      },
      {
        key: "messagePlaceholder",
        kind: "text",
        label: "Campo mensagem — texto de exemplo",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      {
        key: "actionUrl",
        kind: "url",
        label:
          "URL que recebe o formulário (Formspree e afins; vazio = abre o programa de e-mail do visitante). O site não tem backend.",
      },
      { key: "fallback", kind: "text", label: "Aviso abaixo do botão" },
    ],
    group: "content",
    label: "Contato — detalhes e formulário (Semente Viva)",
    render: (p, ctx) => {
      const o = org(ctx);
      const tel = telHref(o.phone);
      const action = p.actionUrl
        ? href(ctx, p.actionUrl)
        : o.email
          ? `mailto:${o.email}`
          : undefined;
      const rows: { icon: string; label: string; node: ReactNode }[] = [
        o.address && {
          icon: "pin",
          label: p.addressLabel,
          node: <span>{o.address}</span>,
        },
        o.email && {
          icon: "mail",
          label: p.emailLabel,
          node: <a href={`mailto:${o.email}`}>{o.email}</a>,
        },
        o.phone && {
          icon: "phone",
          label: p.phoneLabel,
          node: tel ? <a href={tel}>{o.phone}</a> : <span>{o.phone}</span>,
        },
        o.hours && {
          icon: "clock",
          label: p.hoursLabel,
          node: <span>{o.hours}</span>,
        },
      ].filter(Boolean) as { icon: string; label: string; node: ReactNode }[];
      return (
        <section className="sv-contact">
          <div className="sv-contact-in">
            <div className="sv-contact-info">
              <h2>{p.infoTitle}</h2>
              <p>{p.infoText}</p>
              <ul className="sv-contact-list">
                {rows.map(r => (
                  <li key={r.label}>
                    <i>
                      <SvIcon name={r.icon} />
                    </i>
                    <div>
                      <b>{r.label}</b>
                      {r.node}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sv-form">
              <h2>{p.formTitle}</h2>
              <form
                action={action}
                encType={p.actionUrl ? undefined : "text/plain"}
                method="post"
              >
                <div className="sv-form-row">
                  <input
                    aria-label={p.namePlaceholder}
                    name="nome"
                    placeholder={p.namePlaceholder}
                    required
                    type="text"
                  />
                  <input
                    aria-label={p.emailPlaceholder}
                    name="email"
                    placeholder={p.emailPlaceholder}
                    required
                    type="email"
                  />
                </div>
                <input
                  aria-label={p.phonePlaceholder}
                  name="telefone"
                  placeholder={p.phonePlaceholder}
                  type="tel"
                />
                <textarea
                  aria-label={p.messagePlaceholder}
                  name="mensagem"
                  placeholder={p.messagePlaceholder}
                  required
                  rows={6}
                />
                <button className="sv-btn sv-btn-green" type="submit">
                  {p.buttonLabel}
                </button>
              </form>
              {!p.actionUrl && ctx.mode === "edit" ? (
                <p className="sv-form-note">
                  O site não tem servidor: sem a URL de envio, o formulário abre
                  o programa de e-mail do visitante. Informe a URL (Formspree
                  etc.) no painel do bloco.
                </p>
              ) : null}
              {o.email ? (
                <p className="sv-form-note">
                  {p.fallback} <a href={`mailto:${o.email}`}>{o.email}</a>
                </p>
              ) : null}
            </div>
          </div>
        </section>
      );
    },
    type: "svContact",
  }
);

const svMap = defineBlock(
  z.object({
    address: str(),
    height: int(200, 800, 420),
    mapTitle: str("Mapa com a localização da fundação"),
    title: str("Localização"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (vazio = sem título)" },
      {
        key: "address",
        kind: "text",
        label:
          "Endereço do mapa (vazio = o endereço da fundação, em “Página inteira”)",
      },
      { key: "height", kind: "number", label: "Altura (px)" },
      {
        key: "mapTitle",
        kind: "text",
        label: "Descrição do mapa (leitor de tela)",
      },
    ],
    group: "media",
    label: "Mapa — localização (Semente Viva)",
    render: (p, ctx) => {
      const addr = p.address || org(ctx).address;
      if (!addr)
        return ctx.mode === "edit" ? (
          <section className="sv-map-sec">
            <p className="sv-notice">
              Mapa sem endereço: informe o endereço da fundação em “Página
              inteira”.
            </p>
          </section>
        ) : null;
      const src = `https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed`;
      return (
        <section className="sv-map-sec">
          {p.title ? <h2>{p.title}</h2> : null}
          <div className="sv-map-frame">
            <iframe
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={p.mapTitle}
              {...frameProps(ctx, src, { height: p.height })}
            />
          </div>
        </section>
      );
    },
    type: "svMap",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const svNotFound = defineBlock(
  z.object({
    backLabel: str("Voltar ao início"),
    backUrl: str("/"),
    code: str("404"),
    text: str("A página que você procura não existe ou mudou de endereço."),
    title: str("Página não encontrada"),
  }),
  {
    fields: [
      { key: "code", kind: "text", label: "Número grande" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        key: "backLabel",
        kind: "text",
        label: "Botão — texto (vazio = sem botão)",
      },
      { key: "backUrl", kind: "url", label: "Botão — link" },
    ],
    group: "content",
    label: "Página não encontrada (Semente Viva)",
    render: (p, ctx) => (
      <section className="sv-nf">
        <div aria-hidden="true" className="sv-nf-code">
          {p.code}
        </div>
        <h2>{p.title}</h2>
        <p>{p.text}</p>
        {p.backLabel ? (
          <a className="sv-btn sv-btn-green" href={href(ctx, p.backUrl || "/")}>
            {p.backLabel}
          </a>
        ) : null}
      </section>
    ),
    type: "svNotFound",
  }
);

export const fundacaoPageBlocks: BlockDefinition[] = [
  svPageHero,
  svTeam,
  svHowWeWork,
  svDonate,
  svPix,
  svNews,
  svPostBody,
  svAlbums,
  svContact,
  svMap,
  svNotFound,
];
