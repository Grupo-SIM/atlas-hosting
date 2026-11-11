import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { href, newTab, safeUrl } from "./helpers.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";

/**
 * Blocos do template "Universo" (hub de links em cartas): `uvStage` (home inteira — carregamento, leque de cartas,
 * carrossel de opções com cronômetro e verso, camada de contagem) e `uvPanel` (página interna com lista de links).
 * Visual em `renderer/universo.ts` (escopo `.sb-uv`), movimento em `renderer/universo-runtime.ts`, que acha cada bloco
 * por `data-uv`. Toda a arte é SVG/CSS própria ("portal / órbita"); só a mecânica e as medidas vêm da referência.
 *
 * O `uvStage` renderiza todos os estados no HTML. Sem JS ou com movimento reduzido fica a lista estática; no editor a
 * prop "Estado no editor" escolhe uma tela parada. Links que passam pela contagem levam `data-uv-go` e um `href`
 * absoluto vindo das props — a contagem nunca lê destino da URL (a referência tinha um `/redirect?to=` aberto).
 */
const str = (d = "") => z.string().default(d).catch(d);
const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);
const yesNo = (d: "yes" | "no") => z.enum(["yes", "no"]).default(d).catch(d);

const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];
const NO_YES = [
  { label: "Não", value: "no" },
  { label: "Sim", value: "yes" },
];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
/** Numeral da posição: I a X; depois, número arábico. */
export const uvNumeral = (i: number) => ROMAN[i] ?? String(i + 1);

const EXTERNAL = /^https?:\/\//i;
const imgSrc = (url: string) =>
  /^(https?:\/\/|\/|data:image\/)/i.test(url.trim()) ? url.trim() : "";
const videoSrc = (url: string) =>
  /^(https?:\/\/|\/)[^\s"'<>]+$/i.test(url.trim()) ? url.trim() : "";

/** Atributos de um link: externo com contagem ganha `data-uv-go` (mesma aba); sem contagem abre em nova aba. */
function linkAttrs(
  ctx: RenderContext,
  url: string,
  countdown: boolean,
  title: string
): Record<string, string | undefined> {
  const u = url.trim();
  if (EXTERNAL.test(u) && countdown)
    return { "data-uv-go": "", "data-uv-title": title, href: safeUrl(u) };
  return { href: href(ctx, u), ...newTab(u) };
}

/* ───────────────────────── arte (própria) ───────────────────────── */

const Chevron = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2.4"
    viewBox="0 0 24 24"
  >
    <path d="M5 8.5l7 7 7-7" />
  </svg>
);

const BackArrow = () => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <path d="M14.5 6 9 12l5.5 6" />
  </svg>
);

/** Órbitas elípticas finas com estrelas, atrás do texto da coluna. */
const Orbits = () => (
  <svg
    aria-hidden="true"
    className="uv-orbits"
    fill="none"
    preserveAspectRatio="xMidYMin slice"
    stroke="currentColor"
    viewBox="0 0 400 800"
  >
    <ellipse
      cx="200"
      cy="300"
      rx="250"
      ry="70"
      strokeWidth="1"
      transform="rotate(-16 200 300)"
      vectorEffect="non-scaling-stroke"
    />
    <ellipse
      cx="200"
      cy="430"
      rx="232"
      ry="54"
      strokeWidth="1"
      transform="rotate(11 200 430)"
      vectorEffect="non-scaling-stroke"
    />
    <ellipse
      cx="200"
      cy="205"
      rx="150"
      ry="34"
      strokeWidth=".8"
      transform="rotate(-5 200 205)"
      vectorEffect="non-scaling-stroke"
    />
    <circle className="uv-star" cx="72" cy="356" r="2.2" stroke="none" />
    <circle className="uv-star" cx="331" cy="246" r="1.6" stroke="none" />
    <circle className="uv-star" cx="118" cy="466" r="1.8" stroke="none" />
    <circle className="uv-star" cx="301" cy="395" r="2.4" stroke="none" />
    <circle className="uv-star" cx="262" cy="176" r="1.5" stroke="none" />
  </svg>
);

/** Moldura com cantos em arco (côncavos) da carta do leque, no viewBox 200 × 300. */
const cardFrame = (i: number) =>
  `M${4 + i + 10} ${4 + i}H${196 - i - 10}A10 10 0 0 0 ${196 - i} ${4 + i + 10}V${296 - i - 10}A10 10 0 0 0 ${196 - i - 10} ${296 - i}H${4 + i + 10}A10 10 0 0 0 ${4 + i} ${296 - i - 10}V${4 + i + 10}A10 10 0 0 0 ${4 + i + 10} ${4 + i}Z`;

/** Verso da carta do leque: planeta com anel inclinado, constelações e o numeral num círculo. */
const CardBack = () => (
  <svg
    aria-hidden="true"
    className="uv-card-art"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 200 300"
  >
    <path d={cardFrame(0)} strokeWidth="1.6" />
    <path d={cardFrame(6)} opacity=".5" strokeWidth=".8" />
    <circle cx="100" cy="34" opacity=".4" r="21" strokeWidth=".8" />
    <circle className="p" cx="100" cy="34" r="16" strokeWidth="1.4" />
    <polyline
      opacity=".7"
      points="42,92 60,74 84,84 74,108 52,114"
      strokeWidth=".8"
    />
    <polyline
      opacity=".7"
      points="130,236 148,222 167,231 158,252"
      strokeWidth=".8"
    />
    {[
      [42, 92],
      [60, 74],
      [84, 84],
      [74, 108],
      [52, 114],
      [130, 236],
      [148, 222],
      [167, 231],
      [158, 252],
    ].map(([x, y]) => (
      <circle
        className="f"
        cx={x}
        cy={y}
        key={`${x}-${y}`}
        r="1.8"
        stroke="none"
      />
    ))}
    <g transform="rotate(-18 100 170)">
      <ellipse
        cx="100"
        cy="170"
        opacity=".45"
        rx="58"
        ry="13"
        strokeWidth="1.2"
      />
      <circle className="p" cx="100" cy="170" r="30" strokeWidth="1.4" />
      <path d="M76 178a26 26 0 0 0 48 0" opacity=".45" strokeWidth=".8" />
      <path d="M42 170a58 13 0 0 0 116 0" strokeWidth="1.6" />
    </g>
    <circle className="f" cx="152" cy="128" r="3.5" stroke="none" />
    <path d="M68 270a44 11 0 0 1 64 0" opacity=".6" strokeWidth=".8" />
    <circle className="f" cx="100" cy="259" r="1.6" stroke="none" />
  </svg>
);

/** Face de baixo (aparece ao virar): anéis concêntricos com núcleo. */
const CardFace = () => (
  <svg
    aria-hidden="true"
    className="uv-card-art"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 200 300"
  >
    <path d={cardFrame(0)} strokeWidth="1.6" />
    <path d={cardFrame(6)} opacity=".5" strokeWidth=".8" />
    <circle cx="100" cy="150" opacity=".35" r="70" strokeDasharray="2 6" />
    <circle cx="100" cy="150" opacity=".6" r="48" />
    <circle cx="100" cy="150" r="26" strokeWidth="1.6" />
    <circle className="f" cx="100" cy="150" r="7" stroke="none" />
  </svg>
);

/** Arcos finos acima do título da opção. */
const Arcs = () => (
  <svg
    aria-hidden="true"
    className="uv-arcs"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 120 28"
  >
    <path d="M6 25a56 17 0 0 1 108 0" strokeWidth="1" />
    <path d="M24 27a38 10 0 0 1 72 0" strokeWidth=".8" />
    <circle className="f" cx="60" cy="8" r="1.8" stroke="none" />
  </svg>
);

/** Ícone das páginas internas: círculo com anel orbital e avatar genérico (ou a foto). */
function OrbitIcon({ photo }: { photo: string }) {
  const src = imgSrc(photo);
  return (
    <span className="uv-icon">
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 60 60"
      >
        <circle cx="30" cy="30" r="18" strokeWidth="1.6" />
        <circle className="d" cx="30" cy="30" r="14" strokeWidth="1" />
        {src ? null : (
          <>
            <circle cx="30" cy="26" r="4.6" strokeWidth="1.5" />
            <path
              d="M22.6 38.6a7.4 6.6 0 0 1 14.8 0"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </>
        )}
        <ellipse
          className="d"
          cx="30"
          cy="30"
          rx="28"
          ry="7.5"
          strokeWidth="1"
          transform="rotate(-24 30 30)"
        />
        <circle cx="54.4" cy="19" fill="currentColor" r="2" stroke="none" />
      </svg>
      {src ? <img alt="" src={src} /> : null}
    </span>
  );
}

const IconRow = ({ photo }: { photo: string }) => (
  <div aria-hidden="true" className="uv-iconrow">
    <span className="uv-side l">
      <i />
      <b />
    </span>
    <OrbitIcon photo={photo} />
    <span className="uv-side r">
      <b />
      <i />
    </span>
  </div>
);

/** Portal de anéis concêntricos do carregamento (no lugar do vídeo da referência). */
const Portal = () => (
  <svg
    aria-hidden="true"
    className="uv-portal"
    fill="none"
    stroke="currentColor"
    viewBox="-200 -200 400 400"
  >
    <circle opacity=".22" r="176" strokeWidth="1" />
    <circle
      className="uv-spin s3"
      opacity=".55"
      r="148"
      strokeDasharray="2 9"
      strokeWidth="1.2"
    />
    <ellipse
      className="uv-flow"
      opacity=".45"
      rx="188"
      ry="44"
      strokeDasharray="70 50"
      strokeWidth="1"
      transform="rotate(-18)"
    />
    <circle
      className="uv-spin s2"
      opacity=".85"
      r="114"
      strokeDasharray="60 18 6 18"
      strokeWidth="2"
    />
    <circle
      className="uv-spin"
      opacity=".5"
      r="88"
      strokeDasharray="1 5"
      strokeWidth="3"
    />
    <circle
      className="uv-spin s4"
      r="64"
      strokeDasharray="4 10"
      strokeWidth="1.6"
    />
    <circle opacity=".5" r="44" strokeWidth="1" />
    <circle className="uv-core" r="26" stroke="none" />
  </svg>
);

/* ───────────────────────── contagem (camada) ───────────────────────── */

const cdShape = {
  cdGo: str("REDIRECIONANDO…"),
  cdLead: str("VOCÊ SERÁ\nREDIRECIONADO EM:"),
  cdNote: str("DAQUI PRA FRENTE, CADA CLIQUE ABRE UMA NOVA POSSIBILIDADE."),
  cdReady: str("TUDO PRONTO…"),
  countdownSeconds: int(0, 30, 5),
};

const cdFields: FieldDef[] = [
  {
    key: "countdownSeconds",
    kind: "number",
    label: "Contagem antes de sair do site (segundos; 0 = vai direto)",
  },
  { key: "cdReady", kind: "text", label: "Contagem: título do painel" },
  {
    key: "cdLead",
    kind: "textarea",
    label: "Contagem: frase acima dos números",
  },
  { key: "cdGo", kind: "text", label: "Contagem: texto no zero" },
  { key: "cdNote", kind: "textarea", label: "Contagem: nota do pé do painel" },
];

interface CdProps {
  cdGo: string;
  cdLead: string;
  cdNote: string;
  cdReady: string;
  countdownSeconds: number;
}

/** Números da contagem parada no editor (`n+2`, `n+1`, `n`, só entre 1 e 5). */
const sampleNums = (total: number) => {
  const n = Math.max(1, Math.min(5, total) - 2);
  return [n + 2, n + 1, n].filter(k => k >= 1 && k <= Math.min(5, total));
};

function Countdown({
  open,
  p,
  photo,
  title,
}: {
  open: boolean;
  p: CdProps;
  photo: string;
  title: string;
}) {
  const nums = open ? sampleNums(p.countdownSeconds) : [];
  return (
    <div
      aria-label="Redirecionamento"
      aria-modal="true"
      className="uv-cd"
      data-go={p.cdGo}
      hidden={!open}
      role="dialog"
    >
      <div aria-hidden="true" className="uv-vig" />
      <div aria-hidden="true" className="uv-frame" />
      <div className="uv-pg-col">
        <div className="uv-pg-main">
          <div className="uv-banner">
            <i />
            <span className="uv-cd-title">{title}</span>
            <i />
          </div>
          <IconRow photo={photo} />
          <div className="uv-panel-wrap">
            <div className="uv-panel">
              <p className="uv-ready">{p.cdReady}</p>
              <div className="uv-mid">
                <p className="uv-lead">{p.cdLead}</p>
                <div aria-live="polite" className="uv-count">
                  {nums.map((k, i) => (
                    <span
                      className={`uv-num ${i === nums.length - 1 ? "cur" : "old"}`}
                      key={k}
                    >
                      {`${k}…`}
                    </span>
                  ))}
                </div>
              </div>
              <p className="uv-note">{p.cdNote}</p>
            </div>
            <button
              aria-label="Cancelar e voltar"
              className="uv-back uv-cd-back"
              type="button"
            >
              <BackArrow />
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="uv-foot" />
      </div>
    </div>
  );
}

/* ───────────────────────── palavras com desfoque ───────────────────────── */

/** Palavras com `--d` = atraso da entrada (as linhas começam onde a anterior terminou de entrar). */
function Words({
  start,
  step,
  text,
}: {
  start: number;
  step: number;
  text: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  const out: ReactNode[] = [];
  words.forEach((w, i) => {
    if (i > 0) out.push(" ");
    out.push(
      <span
        className="uv-w"
        key={`${w}-${i}`}
        style={{ "--d": `${start + i * step}ms` } as CSSProperties}
      >
        {w}
      </span>
    );
  });
  return <>{out}</>;
}

/* ───────────────────────── uvStage ───────────────────────── */

const choiceSchema = z.object({
  countdown: yesNo("yes"),
  label: str(),
  url: str(),
});

const optionSchema = z.object({
  choices: z.array(choiceSchema).default([]).catch([]),
  countdown: yesNo("yes"),
  description: str(),
  kind: z
    .enum(["confirm", "choices", "links"])
    .default("confirm")
    .catch("confirm"),
  title: str(),
  url: str(),
});

type Option = z.infer<typeof optionSchema>;

const DEFAULT_OPTIONS: Option[] = [
  {
    choices: [],
    countdown: "yes",
    description: "DESCREVA A OPÇÃO\nEM DUAS LINHAS.",
    kind: "confirm",
    title: "OPÇÃO",
    url: "https://exemplo.com/",
  },
];

const EDITOR_STATES = [
  { label: "Cartas (leque)", value: "fan" },
  { label: "Carregamento", value: "loader" },
  { label: "Carrossel na opção N", value: "carousel" },
  { label: "Verso da opção N", value: "back" },
  { label: "Contagem", value: "countdown" },
];

const uvStage = defineBlock(
  z.object({
    backLabel: str("VOLTAR"),
    confirmQuestion: str("TEM CERTEZA QUE QUER CONTINUAR?"),
    continueLabel: str("CONTINUAR"),
    cta: str("ESCOLHA SUA CARTA"),
    ...cdShape,
    editorOption: int(1, 30, 1),
    editorState: z
      .enum(["fan", "loader", "carousel", "back", "countdown"])
      .default("fan")
      .catch("fan"),
    heading: str("Escolha uma Opção"),
    label: str("ESCOLHA"),
    lines: str(
      "AQUI CADA CLIQUE ABRE UM\nLADO DIFERENTE DO NOVO\nMUNDO QUE VOCÊ VAI\nCONHECER."
    ),
    loaderOnce: yesNo("no"),
    loaderSubAccent: str("OBSESSÕES."),
    loaderSubLead: str("PODE CAUSAR NOVAS "),
    loaderTitle: str("CARREGANDO\nMEU UNIVERSO"),
    loaderVideo: str(),
    noLabel: str("NÃO"),
    options: z
      .array(optionSchema)
      .default(DEFAULT_OPTIONS)
      .catch(DEFAULT_OPTIONS),
    timerSeconds: int(0, 600, 30),
    title: str("VOCÊ ENTROU NO\nLUGAR CERTO."),
    yesLabel: str("SIM"),
  }),
  {
    fields: [
      {
        key: "editorState",
        kind: "select",
        label: "Estado no editor (só muda o que aparece aqui)",
        options: EDITOR_STATES,
      },
      {
        key: "editorOption",
        kind: "number",
        label: "Opção mostrada no editor (carrossel/verso)",
      },
      {
        key: "loaderTitle",
        kind: "textarea",
        label: "Carregamento: título (uma linha por linha)",
      },
      {
        key: "loaderSubLead",
        kind: "text",
        label: "Carregamento: subtítulo (parte em vermelho)",
      },
      {
        key: "loaderSubAccent",
        kind: "text",
        label: "Carregamento: subtítulo (parte clara)",
      },
      {
        key: "loaderVideo",
        kind: "url",
        label:
          "Carregamento: vídeo .mp4 (opcional; vazio = animação do portal)",
      },
      {
        key: "loaderOnce",
        kind: "select",
        label: "Carregamento só na primeira visita da sessão",
        options: NO_YES,
      },
      { key: "label", kind: "text", label: "Rótulo do topo da coluna" },
      {
        key: "title",
        kind: "textarea",
        label: "Título do leque (uma linha por linha)",
      },
      {
        key: "lines",
        kind: "textarea",
        label: "Texto que entra palavra por palavra (uma linha por linha)",
      },
      { key: "cta", kind: "text", label: "Chamada acima da seta" },
      { key: "heading", kind: "text", label: "Título do carrossel" },
      {
        key: "timerSeconds",
        kind: "number",
        label: "Cronômetro do carrossel (segundos; 0 = sem cronômetro)",
      },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título (fita)" },
          { key: "description", kind: "textarea", label: "Descrição (frente)" },
          {
            key: "kind",
            kind: "select",
            label: "Verso",
            options: [
              {
                label: "Confirmar (Sim/Não) e sair para o link",
                value: "confirm",
              },
              { label: "Lista de escolhas no verso", value: "choices" },
              { label: "Botões direto na frente (sem verso)", value: "links" },
            ],
          },
          {
            key: "url",
            kind: "url",
            label: 'Link do "Sim"',
            showWhen: { equals: "confirm", key: "kind" },
          },
          {
            key: "countdown",
            kind: "select",
            label: "Passar pela contagem (link externo)",
            options: YES_NO,
            showWhen: { equals: "confirm", key: "kind" },
          },
          {
            itemFields: [
              { key: "label", kind: "text", label: "Rótulo" },
              {
                key: "url",
                kind: "url",
                label: "Link (página do site ou endereço)",
              },
              {
                key: "countdown",
                kind: "select",
                label: "Passar pela contagem (link externo)",
                options: YES_NO,
              },
            ],
            key: "choices",
            kind: "list",
            label: "Escolhas (verso ou frente)",
          },
        ],
        key: "options",
        kind: "list",
        label: "Opções do carrossel (a ordem dá o numeral I, II, III…)",
      },
      { key: "continueLabel", kind: "text", label: "Botão da frente (virar)" },
      {
        key: "confirmQuestion",
        kind: "text",
        label: "Pergunta do verso de confirmar",
      },
      { key: "yesLabel", kind: "text", label: "Botão Sim" },
      { key: "noLabel", kind: "text", label: "Botão Não" },
      { key: "backLabel", kind: "text", label: "Voltar (verso com escolhas)" },
      ...cdFields,
    ],
    group: "layout",
    label: "Hub de cartas (Universo)",
    render: (p, ctx) => {
      const edit = ctx.mode === "edit";
      const state = edit
        ? p.editorState === "back" || p.editorState === "countdown"
          ? p.editorState === "back"
            ? "carousel"
            : "fan"
          : p.editorState
        : undefined;
      const options = p.options;
      const pick =
        Math.min(Math.max(p.editorOption, 1), Math.max(options.length, 1)) - 1;
      const active =
        edit && (p.editorState === "carousel" || p.editorState === "back")
          ? pick
          : 0;
      const backOf = edit && p.editorState === "back" ? pick : -1;
      const video = videoSrc(p.loaderVideo);

      // atrasos das palavras: cada linha começa quando a anterior terminou de lançar as suas (120 ms por palavra)
      const lines = p.lines.split("\n").filter(l => l.trim());
      const starts: number[] = [];
      let t = 0;
      for (const l of lines) {
        starts.push(t);
        t += l.split(/\s+/).filter(Boolean).length * 120;
      }
      const ctaStart =
        (starts.at(-1) ?? 0) +
        (lines.at(-1)?.split(/\s+/).filter(Boolean).length ?? 0) * 120 +
        720;

      const actions = (o: Option, title: string, row?: boolean) => (
        <div className={row ? "uv-acts row" : "uv-acts"}>
          {o.choices.map((c, j) => (
            <a
              className="uv-btn"
              key={`${c.label}-${j}`}
              {...linkAttrs(
                ctx,
                c.url,
                c.countdown === "yes",
                c.label || title
              )}
            >
              {c.label}
            </a>
          ))}
        </div>
      );

      return (
        <section
          className={["uv-stage", edit ? "uv-live uv-still" : ""]
            .filter(Boolean)
            .join(" ")}
          data-count={p.countdownSeconds}
          data-once={p.loaderOnce === "yes" ? "1" : "0"}
          data-state={state}
          data-timer={p.timerSeconds}
          data-uv="stage"
        >
          <div aria-hidden="true" className="uv-grain" />

          <div
            aria-hidden={edit && state === "loader" ? undefined : true}
            className="uv-loader"
          >
            <div className="uv-loader-art">
              {video ? (
                <video
                  autoPlay={!edit}
                  className="uv-loader-video"
                  loop
                  muted
                  playsInline
                  preload={edit ? "metadata" : "auto"}
                  src={video}
                />
              ) : (
                <Portal />
              )}
            </div>
            <div className="uv-loader-fade" />
            <div className="uv-loader-txt">
              <div className="uv-loader-in">
                <p className="uv-loader-title">{p.loaderTitle}</p>
                <p className="uv-loader-sub">
                  {p.loaderSubLead}
                  <b>{p.loaderSubAccent}</b>
                </p>
              </div>
            </div>
          </div>

          <div className="uv-fan">
            <div className="uv-col">
              <div aria-hidden="true" className="uv-col-bg">
                <Orbits />
              </div>
              <div className="uv-label">
                <i />
                <span>{p.label}</span>
                <i />
              </div>
              <div className="uv-copy">
                <div className="uv-copy-main">
                  <div aria-hidden="true" className="uv-halo" />
                  <h1 className="uv-title">{p.title}</h1>
                  <p className="uv-lines">
                    {lines.map((l, i) => (
                      <span className="uv-line" key={`${l}-${i}`}>
                        <Words start={starts[i] ?? 0} step={120} text={l} />
                      </span>
                    ))}
                  </p>
                </div>
                <div className="uv-cta">
                  <p className="uv-choose">
                    <Words start={ctaStart} step={100} text={p.cta} />
                  </p>
                  <Chevron className="uv-chev" />
                </div>
              </div>
              <div className={edit ? "uv-cards is-in" : "uv-cards"}>
                {(["l", "c", "r"] as const).map((pos, i) => (
                  <button
                    aria-label={`Carta ${uvNumeral(i)}`}
                    className="uv-card"
                    data-pos={pos}
                    key={pos}
                    type="button"
                  >
                    <span className="uv-card-in">
                      <span className="uv-card-a">
                        <CardBack />
                        <b className="uv-card-num">{uvNumeral(i)}</b>
                      </span>
                      <span className="uv-card-b">
                        <CardFace />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section aria-label={p.heading} className="uv-car" tabIndex={-1}>
            <div aria-hidden="true" className="uv-vig" />
            <div className="uv-car-stage">
              <div className="uv-timer">
                <div className="uv-timer-pill">
                  <span aria-live="off" className="uv-timer-t">
                    {`${String(Math.floor(p.timerSeconds / 60)).padStart(2, "0")}:${String(p.timerSeconds % 60).padStart(2, "0")}`}
                  </span>
                </div>
                <div aria-hidden="true" className="uv-timer-bar">
                  <i />
                </div>
              </div>
              <h2 className="uv-heading">{p.heading}</h2>
              <div className="uv-view">
                <div
                  className="uv-track"
                  style={
                    active
                      ? { transform: `translateX(${-active * 100}%)` }
                      : undefined
                  }
                >
                  {options.map((o, i) => {
                    const num = uvNumeral(i);
                    const hasBack = o.kind !== "links";
                    const goYes = linkAttrs(
                      ctx,
                      o.url,
                      o.countdown === "yes",
                      o.title
                    );
                    return (
                      <div className="uv-slide" key={`${o.title}-${i}`}>
                        <article
                          aria-label={`${num}. ${o.title}`}
                          className={i === backOf ? "uv-opt is-back" : "uv-opt"}
                        >
                          <div className="uv-face uv-front">
                            <Corners />
                            <span aria-hidden="true" className="uv-badge">
                              <span>{num}</span>
                            </span>
                            <div className="uv-opt-in">
                              <Arcs />
                              <div className="uv-ribbon">
                                <span>{o.title}</span>
                              </div>
                              <p className="uv-body">{o.description}</p>
                              {hasBack ? (
                                <div className="uv-acts">
                                  <button
                                    className="uv-btn"
                                    data-uv-flip=""
                                    type="button"
                                  >
                                    {p.continueLabel}
                                  </button>
                                </div>
                              ) : (
                                actions(o, o.title)
                              )}
                            </div>
                          </div>
                          {hasBack ? (
                            <div className="uv-face uv-verso">
                              <Corners />
                              <span aria-hidden="true" className="uv-badge">
                                <span>{num}</span>
                              </span>
                              <div className="uv-opt-in">
                                <Arcs />
                                <div className="uv-ribbon">
                                  <span>{o.title}</span>
                                </div>
                                {o.kind === "confirm" ? (
                                  <>
                                    <p className="uv-q">{p.confirmQuestion}</p>
                                    <div className="uv-acts row">
                                      <a className="uv-btn" {...goYes}>
                                        {p.yesLabel}
                                      </a>
                                      <button
                                        className="uv-btn"
                                        data-uv-unflip=""
                                        type="button"
                                      >
                                        {p.noLabel}
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {actions(o, o.title)}
                                    <button
                                      className="uv-link-back"
                                      data-uv-unflip=""
                                      type="button"
                                    >
                                      {p.backLabel}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="uv-dots">
                {options.map((o, i) => (
                  <button
                    aria-current={i === active ? "true" : undefined}
                    aria-label={`Ir para a opção ${i + 1}`}
                    className={i === active ? "uv-dot on" : "uv-dot"}
                    key={`${o.title}-${i}`}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </section>

          <Countdown
            open={edit && p.editorState === "countdown"}
            p={p}
            photo=""
            title={options[0]?.title ?? ""}
          />
        </section>
      );
    },
    type: "uvStage",
  }
);

const Corners = () => (
  <>
    <i aria-hidden="true" className="uv-corner tl" />
    <i aria-hidden="true" className="uv-corner tr" />
    <i aria-hidden="true" className="uv-corner bl" />
    <i aria-hidden="true" className="uv-corner br" />
  </>
);

/* ───────────────────────── uvPanel ───────────────────────── */

const itemSchema = z.object({
  countdown: yesNo("yes"),
  name: str(),
  niche: str(),
  soon: yesNo("no"),
  url: str(),
});

const uvPanel = defineBlock(
  z.object({
    backLabel: str("Voltar ao início"),
    backUrl: str("/"),
    banner: str("LINKS"),
    cnpj: str(),
    credit: str("FEITO POR SIM INT"),
    ...cdShape,
    editorState: z.enum(["panel", "countdown"]).default("panel").catch("panel"),
    items: z.array(itemSchema).default([]).catch([]),
    note: str("DAQUI PRA FRENTE, CADA CLIQUE ABRE UMA NOVA POSSIBILIDADE."),
    photo: str(),
    phrase: str(),
    scrollHeight: int(0, 2000, 0),
    title: str(),
  }),
  {
    fields: [
      {
        key: "editorState",
        kind: "select",
        label: "Estado no editor (só muda o que aparece aqui)",
        options: [
          { label: "Painel", value: "panel" },
          { label: "Contagem", value: "countdown" },
        ],
      },
      { key: "banner", kind: "text", label: "Faixa do topo" },
      {
        key: "photo",
        kind: "image",
        label: "Foto no ícone (vazio = avatar desenhado)",
      },
      { key: "title", kind: "text", label: "Título do painel (opcional)" },
      { key: "phrase", kind: "textarea", label: "Frase do painel (opcional)" },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome" },
          { key: "niche", kind: "text", label: "Nicho (opcional)" },
          {
            key: "url",
            kind: "url",
            label: "Link (página do site ou endereço)",
          },
          {
            key: "countdown",
            kind: "select",
            label: "Passar pela contagem (link externo)",
            options: YES_NO,
          },
          {
            key: "soon",
            kind: "select",
            label: "Em breve (sem clique, com selo)",
            options: NO_YES,
          },
        ],
        key: "items",
        kind: "list",
        label: "Itens",
      },
      {
        key: "scrollHeight",
        kind: "number",
        label: "Altura da lista rolável em px (0 = lista inteira)",
      },
      { key: "note", kind: "textarea", label: "Nota do pé do painel" },
      { key: "backUrl", kind: "url", label: "Destino do botão voltar" },
      {
        key: "backLabel",
        kind: "text",
        label: "Botão voltar (leitor de tela)",
      },
      { key: "credit", kind: "text", label: "Crédito do rodapé" },
      { key: "cnpj", kind: "text", label: "CNPJ / linha menor do rodapé" },
      ...cdFields,
    ],
    group: "layout",
    label: "Página de links (Universo)",
    render: (p, ctx) => {
      const edit = ctx.mode === "edit";
      const scroll = p.scrollHeight > 0;
      const list = (
        <ul className="uv-items">
          {p.items.map((it, i) => {
            const body = (
              <>
                <span className="uv-nm">{it.name}</span>
                {it.niche ? <span className="uv-sub">{it.niche}</span> : null}
              </>
            );
            return (
              <li key={`${it.name}-${i}`}>
                {it.soon === "yes" ? (
                  <span aria-disabled="true" className="uv-item is-soon">
                    {body}
                    <span className="uv-soon">EM BREVE</span>
                  </span>
                ) : (
                  <a
                    className="uv-item"
                    {...linkAttrs(
                      ctx,
                      it.url,
                      it.countdown === "yes",
                      p.banner
                    )}
                  >
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      );
      const kind = scroll
        ? "is-list is-scroll"
        : p.phrase
          ? "is-phrase"
          : p.title
            ? "is-list"
            : "";
      return (
        <section
          className={edit ? "uv-page uv-still" : "uv-page"}
          data-count={p.countdownSeconds}
          data-uv="panel"
        >
          <div aria-hidden="true" className="uv-vig" />
          <div aria-hidden="true" className="uv-frame" />
          <div aria-hidden="true" className="uv-grain" />
          <div className="uv-pg-col">
            <div className="uv-pg-main">
              <div className="uv-banner">
                <i />
                <h1 className="uv-banner-t" style={{ display: "contents" }}>
                  <span>{p.banner}</span>
                </h1>
                <i />
              </div>
              <IconRow photo={p.photo} />
              <div className="uv-panel-wrap">
                <div className={`uv-panel ${kind}`.trim()}>
                  {p.title ? <p className="uv-pn-title">{p.title}</p> : null}
                  {p.phrase ? <p className="uv-pn-phrase">{p.phrase}</p> : null}
                  {scroll ? (
                    <div
                      className="uv-scroll"
                      style={
                        { "--uv-h": `${p.scrollHeight}px` } as CSSProperties
                      }
                    >
                      {list}
                    </div>
                  ) : (
                    list
                  )}
                  {p.note ? <p className="uv-note">{p.note}</p> : null}
                </div>
                <a
                  aria-label={p.backLabel}
                  className="uv-back"
                  href={href(ctx, p.backUrl || "/")}
                >
                  <BackArrow />
                </a>
              </div>
            </div>
            <footer className="uv-foot">
              {p.credit ? <span className="uv-by">{p.credit}</span> : null}
              {p.cnpj ? <span className="uv-code">{p.cnpj}</span> : null}
            </footer>
          </div>
          <Countdown
            open={edit && p.editorState === "countdown"}
            p={p}
            photo={p.photo}
            title={p.banner}
          />
        </section>
      );
    },
    type: "uvPanel",
  }
);

export const universoBlocks: BlockDefinition[] = [uvStage, uvPanel];
