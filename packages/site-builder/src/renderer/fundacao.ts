import { BLOB_MASK, blobUri } from "../blocks/fundacao-shapes.js";
import { coverflowCss } from "./coverflow.js";

/**
 * Variante "fundacao" (`theme.variant = "fundacao"`, escopo `.sb-sv`): fundação / ONG em branco e verde — barra verde no
 * topo e barra branca com sublinhado no item ativo (fixa depois de 200px de rolagem), hero com fotos em fade, áreas de
 * atuação em cartões sobre o hero, "quem somos" com fotos em círculo, faixa "Seja um colaborador" sobre a seção de cima,
 * carrossel coverflow de notícias, projetos com vídeo e fotos redondas flutuando, rodapé verde, página de doação com
 * PIX, equipe, abas de atuação, notícias, galeria e contato com mapa.
 *
 * Layout e medidas tirados do CSS e das capturas (1440, 1024 e 390) de uma fundação real feita em WordPress + Elementor
 * sobre um tema comercial. **Nada do tema, do conteúdo, das fotos ou da marca foi copiado**: as formas orgânicas são SVG
 * próprio (`blocks/fundacao-shapes.ts`) e as partículas são CSS puro. Breakpoints 1024/767 repetidos sob `.sb-narrow`
 * (quadro estreito do editor = visual de celular).
 *
 * Tokens: `accent` = verde `#007E08`; `fg` = tinta dos títulos; `muted` = texto; extras `greenDark`, `greenBright`,
 * `greenBg`, `greenFooter`, `cyan`, `soft` (faixa das internas), `crumb`.
 */
export const isFundacao = (theme: Record<string, string>) =>
  theme.variant === "fundacao";

/** Fontes fixas da variante (nunca texto do usuário): títulos, texto e o título do hero. */
export const FUNDACAO_EXTRA_FONTS = [
  "Red Hat Display",
  "Red Hat Text",
  "Montserrat",
];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function fundacaoVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--sv-crumb": safe(theme.crumb, "#7B8CFF"),
    "--sv-cyan": safe(theme.cyan, "#7EE3F0"),
    "--sv-green": safe(theme.accent, "#007E08"),
    "--sv-green-bg": safe(theme.greenBg, "#01902B"),
    "--sv-green-bright": safe(theme.greenBright, "#04CC40"),
    "--sv-green-dark": safe(theme.greenDark, "#106504"),
    "--sv-green-footer": safe(theme.greenFooter, "#0D8F06"),
    "--sv-ink": safe(theme.fg, "#1A1B1E"),
    "--sv-page": safe(theme.bg, "#FFFFFF"),
    "--sv-soft": safe(theme.soft, "#EEF4FF"),
    "--sv-text": safe(theme.muted, "#606060"),
  };
}

const S = ".sb-sv";
const N = `${S}.sb-narrow`;

const HD = "'Red Hat Display',sans-serif";
const HT = "'Red Hat Text',sans-serif";
const MS = "'Montserrat',sans-serif";

/** Regras de uma faixa `max-width`, repetidas sob `.sb-narrow` (a media query não enxerga o quadro do editor). */
const upTo = (max: number, rules: (x: string) => string) =>
  `@media (max-width:${max}px){${rules(S)}}\n${rules(N)}`;

/** Quadro estreito do editor vale como celular: tablet e celular juntos. */
const narrowOnly = (rules: (x: string) => string) => rules(N);

const blobPink = blobUri(0, "#FDE2E2");
const blobBlue = blobUri(1, "#E3EEFF");
const blobSoft = blobUri(3, "#EAF2FF");
const blobDeep = blobUri(2, "#006B00");
const blobFoot = blobUri(1, "#006400");
const blobTag = blobUri(0, "#007E08");

/** Pontinhos de uma camada de partículas (6 por pseudo-elemento, 12 no total, cores suaves). */
const dots = (cols: string[], pos: [number, number][]) =>
  pos
    .map(
      ([x, y], i) =>
        `radial-gradient(circle 5px at ${x}% ${y}%,${cols[i % cols.length]} 0 98%,transparent 100%)`
    )
    .join(",");

/* ───────── faixas de tela ───────── */

const w1024 = (x: string) => `
${x} .sv-top{padding:0 24px}
${x} .sv-bar{height:100px;padding:0 24px}
${x} .sv-barw{height:100px}
${x} .sv-nav{display:none}
${x} .sv-burger-btn{display:flex}
${x} .sv-logo img{width:150px;height:74px}
${x} .sv-hero{min-height:720px}
${x} .sv-areas-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sv-about-in{grid-template-columns:minmax(0,1fr);gap:40px}
${x} .sv-about-txt{text-align:center;align-items:center}
${x} .sv-band-card h2{font-size:40px}
${x} .sv-proj-in h2{font-size:40px}
${x} .sv-float.is-far{display:none}
${x} .sv-foot-in{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sv-member{flex-basis:calc((100% - 28px)/2)}
${x} .sv-news-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sv-albums{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sv-donate-in{grid-template-columns:minmax(0,1fr)}
${x} .sv-contact-in{grid-template-columns:minmax(0,1fr)}
${x} .sv-how-head{grid-template-columns:minmax(0,1fr)}
${x} .sv-ph h1{font-size:40px}
`;

const w767 = (x: string) => `
${x} .sv-top{display:none}
${x} .sv-bar{height:80px;padding:0 16px}
${x} .sv-barw{height:80px}
${x} .sv-bar .sv-hdonate{display:none}
${x} .sv-logo img{width:120px;height:58px}
${x} .sv-head.is-stuck .sv-bar{height:64px}
${x} .sv-hero{min-height:80svh}
${x} .sv-hero-in{padding-bottom:110px}
${x} .sv-hero-btns{flex-direction:column;align-items:center}
${x} .sv-areas-grid{grid-template-columns:minmax(0,1fr)}
${x} .sv-about{padding:56px 20px max(40px,calc(var(--sv-pb,60px) - 90px))}
${x} .sv-about-txt h2{font-size:30px}
${x} .sv-about-txt .sv-lead{font-size:18px;line-height:30px}
${x} .sv-circ-tag{font-size:19px;padding:14px 22px}
${x} .sv-band-card{margin-top:-90px;padding:40px 24px}
${x} .sv-band-card h2{font-size:32px}
${x} .sv-news-head h2{font-size:28px}
${x} .sv-proj{padding:150px 20px 60px}
${x} .sv-proj-in h2{font-size:34px}
${x} .sv-proj-in .sv-conheca{font-size:28px}
${x} .sv-float{display:none}
${x} .sv-float.is-keep{display:block;top:20px;width:84px;height:84px}
${x} .sv-foot-in{grid-template-columns:minmax(0,1fr);gap:32px}
${x} .sv-member{flex-basis:100%}
${x} .sv-news-grid{grid-template-columns:minmax(0,1fr)}
${x} .sv-albums{grid-template-columns:minmax(0,1fr)}
${x} .sv-ph{height:auto;padding:70px 20px 56px}
${x} .sv-ph h1{font-size:32px}
${x} .sv-tablist{flex-wrap:wrap}
${x} .sv-how-body{grid-template-columns:minmax(0,1fr)}
${x} .sv-form-row{grid-template-columns:minmax(0,1fr)}
${x} .sv-donate-in h2{font-size:32px}
${x} .sv-donate-cta h2{font-size:28px}
${x} .sv-pix-in{grid-template-columns:minmax(0,1fr)}
${x} .sv-cf .si-slide{--cf-w:78%}
`;

export const fundacaoCss = `
${S}{background:var(--sv-page);color:var(--sv-text);font-family:${HT};font-size:16px;line-height:1.6}
${S} *,${S} *::before,${S} *::after{box-sizing:border-box}
${S} h1,${S} h2,${S} h3,${S} h4{margin:0;font-family:${HD};color:var(--sv-ink);line-height:1.2}
${S} p{margin:0}
${S} ul{margin:0;padding:0;list-style:none}
${S} a{color:inherit;text-decoration:none}
${S} img{max-width:100%}
${S} .sv-sr{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} main{padding:0!important}
${S} :focus-visible{outline:3px solid var(--sv-green-bright);outline-offset:2px}

/* botões: pílula */
${S} .sv-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:16px 30px;border:2px solid transparent;border-radius:50px;font:700 16px/1.2 ${HD};letter-spacing:.2px;text-transform:uppercase;cursor:pointer;transition:transform .3s,box-shadow .3s,background .3s,color .3s}
${S} .sv-btn svg{width:18px;height:18px}
${S} .sv-btn:hover{transform:translateY(-3px)}
${S} .sv-btn-green{background:var(--sv-green);color:#fff;box-shadow:0 10px 25px #007E0840}
${S} .sv-btn-green:hover{box-shadow:0 16px 32px #007E0859}
${S} .sv-btn-white{background:#fff;color:var(--sv-green);box-shadow:0 10px 25px #00000026}
${S} .sv-btn-white:hover{box-shadow:0 16px 32px #00000038}
${S} .sv-btn-ghost{border-color:#fff;color:#fff;background:transparent}
${S} .sv-btn-ghost:hover{background:#ffffff26}

/* rótulo com ponto ("• QUEM SOMOS") */
${S} .sv-eyebrow{display:flex;align-items:center;gap:8px;font:700 13px/1 ${HD};letter-spacing:.6px;text-transform:uppercase;color:var(--sv-green-bright)}
${S} .sv-eyebrow::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}
${S} .sv-eyebrow.is-center{justify-content:center}
${S} .sv-eyebrow.is-center::after{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}

/* partículas: 12 pontos em CSS puro, flutuando devagar (paradas com movimento reduzido) */
${S} .sv-parts{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
${S} .sv-parts::before,${S} .sv-parts::after{content:"";position:absolute;inset:0}
${S} .sv-parts::before{background-image:${dots(
  ["#FFB3B3", "#B9D2FF", "#BFEFC4"],
  [
    [8, 22],
    [22, 70],
    [40, 12],
    [58, 82],
    [76, 28],
    [92, 64],
  ]
)};animation:sv-drift 14s ease-in-out infinite}
${S} .sv-parts::after{background-image:${dots(
  ["#B9D2FF", "#FFD9A8", "#FFB3B3"],
  [
    [14, 48],
    [31, 90],
    [49, 40],
    [66, 8],
    [84, 86],
    [96, 18],
  ]
)};animation:sv-drift 19s ease-in-out -6s infinite reverse}
${S} .sv-parts.on-dark::before{background-image:${dots(
  ["#ffffff59", "#ffffff33", "#ffffff4d"],
  [
    [8, 22],
    [22, 70],
    [40, 12],
    [58, 82],
    [76, 28],
    [92, 64],
  ]
)}}
${S} .sv-parts.on-dark::after{background-image:${dots(
  ["#ffffff33", "#ffffff59", "#ffffff40"],
  [
    [14, 48],
    [31, 90],
    [49, 40],
    [66, 8],
    [84, 86],
    [96, 18],
  ]
)}}
@keyframes sv-drift{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(16px,-22px,0)}}

/* ───── cabeçalho ───── */
${S} .sv-head{position:relative;z-index:60;font-family:${HD}}
${S} .sv-burger-input,${S} .sv-search-input{position:absolute;opacity:0;pointer-events:none}
${S} .sv-top{display:flex;align-items:center;justify-content:space-between;gap:16px;height:46px;padding:0 50px;background:var(--sv-green-dark);color:#fff;font:500 14px/1 ${HD}}
${S} .sv-top a{color:#fff}
${S} .sv-top-l,${S} .sv-top-r{display:flex;align-items:center;gap:0}
${S} .sv-top-l>a{padding:0 14px;border-right:1px solid #FFFFFF59;line-height:14px}
${S} .sv-top-l>a:first-child{padding-left:0}
${S} .sv-top-l>a:hover,${S} .sv-top-r a:hover{text-decoration:underline}
${S} .sv-socs{display:flex;align-items:center;gap:8px;margin-left:14px}
${S} .sv-soc{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--c,#5A6B5A);color:#fff;transition:transform .3s}
${S} .sv-soc:hover{transform:translateY(-3px)}
${S} .sv-soc svg{width:13px;height:13px}
${S} .sv-info{display:flex;align-items:center;gap:8px;padding:0 14px;line-height:14px}
${S} .sv-info+.sv-info{border-left:1px solid #FFFFFF59;padding-right:0}
${S} .sv-info svg{width:16px;height:16px;flex:none}
${S} .sv-barw{height:141px}
${S} .sv-bar{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:24px;height:141px;padding:0 50px;background:#fff;transition:height .3s,box-shadow .3s}
${S} .sv-logo{display:flex;align-items:center;flex:none}
${S} .sv-logo img{display:block;width:186px;height:92px;object-fit:contain;transition:width .3s,height .3s}
${S} .sv-nav{flex:1}
${S} .sv-menu{display:flex;justify-content:center;gap:40px}
${S} .sv-menu a{white-space:nowrap}
@media (max-width:1320px){${S} .sv-menu{gap:26px}${S} .sv-menu a{font-size:16px}${S} .sv-bar,${S} .sv-top{padding-left:32px;padding-right:32px}${S} .sv-bar{gap:16px}}
${S} .sv-menu a{position:relative;display:flex;align-items:center;height:141px;font:700 17px/1 ${HD};letter-spacing:.2px;text-transform:uppercase;color:var(--sv-ink);transition:color .3s,height .3s}
${S} .sv-menu a::after{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:var(--sv-green-bright);transform:scaleX(0);transition:transform .3s}
${S} .sv-menu a:hover{color:var(--sv-green)}
${S} .sv-menu a:hover::after,${S} .sv-menu a[aria-current=page]::after{transform:scaleX(1)}
${S} .sv-bar-r{display:flex;align-items:center;gap:16px;flex:none}
${S} .sv-sbtn{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#EEF3FF;color:var(--sv-ink);cursor:pointer;transition:background .3s,color .3s}
${S} .sv-sbtn:hover{background:var(--sv-green);color:#fff}
${S} .sv-sbtn svg,${S} .sv-burger-btn svg{width:22px;height:22px}
${S} .sv-burger-btn{display:none;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#EEF3FF;color:var(--sv-ink);cursor:pointer}
${S} .sv-sform{position:absolute;left:0;right:0;top:100%;z-index:3;display:none;gap:12px;padding:16px 50px;background:#fff;box-shadow:0 14px 28px #00000026}
${S} .sv-search-input:checked~.sv-barw .sv-sform{display:flex}
${S} .sv-sform input{flex:1;min-width:0;height:52px;padding:0 22px;border:1px solid #D8DEEA;border-radius:50px;font:400 16px ${HT};color:var(--sv-ink)}
${S} .sv-sform .sv-btn{padding:0 28px;height:52px}
${S} .sv-head.is-stuck .sv-bar{position:fixed;top:var(--sb-sticky-top,0px);left:0;right:0;height:80px;box-shadow:0 8px 26px #00000026;animation:sv-drop .35s ease}
${S} .sv-head.is-stuck .sv-menu a{height:80px}
${S} .sv-head.is-stuck .sv-logo img{width:118px;height:58px}
@keyframes sv-drop{from{transform:translateY(-100%)}to{transform:none}}
${S} .sv-drawer{position:fixed;inset:0;z-index:200;visibility:hidden;transition:visibility 0s linear .35s}
${S} .sv-burger-input:checked~.sv-drawer{visibility:visible;transition-delay:0s}
${S} .sv-drawer-bg{position:absolute;inset:0;background:#000000A6;opacity:0;transition:opacity .35s}
${S} .sv-burger-input:checked~.sv-drawer .sv-drawer-bg{opacity:1}
${S} .sv-drawer-in{position:absolute;top:0;right:0;bottom:0;display:flex;flex-direction:column;gap:22px;width:min(86%,360px);padding:28px 28px 36px;overflow-y:auto;background:#fff;transform:translateX(100%);transition:transform .35s ease}
${S} .sv-burger-input:checked~.sv-drawer .sv-drawer-in{transform:none}
${S} .sv-drawer-x{align-self:flex-end;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#EEF3FF;color:var(--sv-ink);cursor:pointer}
${S} .sv-drawer-x svg{width:20px;height:20px}
${S} .sv-drawer-logo img{display:block;width:150px;height:74px;object-fit:contain}
${S} .sv-drawer-menu a{display:block;padding:13px 0;border-bottom:1px solid #E6EBF2;font:700 17px/1.2 ${HD};text-transform:uppercase;color:var(--sv-ink)}
${S} .sv-drawer-menu a[aria-current=page]{color:var(--sv-green)}
${S} .sv-drawer .sv-socs{margin-left:0}

/* ───── hero ───── */
${S} .sv-hero{position:relative;display:flex;align-items:flex-end;justify-content:center;min-height:900px;overflow:hidden;background:#14320f;color:#fff}
${S} .sv-hero .si-car,${S} .sv-hero .si-car-view,${S} .sv-hero .si-car-track,${S} .sv-hero .si-slide{height:100%}
${S} .sv-hero .si-car{position:absolute;inset:0}
${S} .sv-hero-img{display:block;width:100%;height:100%;object-fit:cover}
${S} .sv-hero::after{content:"";position:absolute;inset:0;background:var(--sv-veil,#00000059);pointer-events:none}
${S} .sv-hero-in{position:relative;z-index:2;width:100%;max-width:923px;padding:0 24px 150px;text-align:center}
${S} .sv-hero h1{font:800 clamp(28px,7vw,45px)/1.05 ${MS};color:#fff;text-shadow:0 2px 14px #00000066}
${S} .sv-hero h1 span{display:block}
${S} .sv-hero-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:32px}

/* ───── áreas de atuação ───── */
${S} .sv-areas{position:relative;z-index:3;padding:80px 24px 110px}
${S} .sv-areas.is-over{padding-top:0}
${S} .sv-areas.is-over .sv-areas-grid{margin-top:-40px}
${S} .sv-areas-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;max-width:1280px;margin:0 auto}
${S} .sv-area{position:relative;overflow:hidden;padding:30px;border-radius:12px;background:#fff;box-shadow:0 20px 40px #0000000F;transition:transform .3s}
${S} .sv-area:hover{transform:translateY(-15px)}
${S} .sv-area::before{content:"";position:absolute;right:-34px;top:-34px;width:170px;height:170px;background:url("${blobPink}") center/contain no-repeat;pointer-events:none}
${S} .sv-area.is-blue::before{background-image:url("${blobBlue}")}
${S} .sv-area>*{position:relative}
${S} .sv-ico{display:flex;align-items:center;justify-content:center;width:60px;height:60px;margin-bottom:22px;border-radius:50%;background:var(--sv-green);color:#fff}
${S} .sv-ico svg{width:28px;height:28px}
${S} .sv-area h3{margin-bottom:12px;font-size:20px;font-weight:700}
${S} .sv-area p{font-size:15px;line-height:30px}

/* ───── quem somos ───── */
${S} .sv-about{position:relative;padding:80px 24px var(--sv-pb,60px);overflow:hidden}
${S} .sv-about::before{content:"";position:absolute;right:-120px;top:20px;width:620px;height:620px;background:url("${blobSoft}") center/contain no-repeat;pointer-events:none}
${S} .sv-about-in{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,555px) minmax(0,1fr);gap:64px;align-items:center;max-width:1280px;margin:0 auto}
${S} .sv-circ{position:relative;width:100%;max-width:540px;aspect-ratio:1;margin:0 auto}
${S} .sv-circ .si-car{position:relative;width:100%;height:100%;overflow:hidden;border-radius:50%;background:#dfe9dc}
${S} .sv-circ .si-car-view,${S} .sv-circ .si-car-track,${S} .sv-circ .si-slide{height:100%}
${S} .sv-circ .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .sv-circ .si-car-view::-webkit-scrollbar{display:none}
${S}.sb-js .sv-circ .si-car-view{overflow:hidden}
${S} .sv-circ-img{display:block;width:100%;height:100%;object-fit:cover}
${S} .sv-circ .si-car-track{display:flex}
${S} .sv-circ .si-slide{flex:0 0 100%;min-width:0;scroll-snap-align:start}
${S} .sv-circ-tag{position:absolute;left:-10px;bottom:34px;z-index:3;padding:24px 56px 24px 52px;background:url("${blobTag}") center/100% 100% no-repeat;color:#fff;font:900 26px/1 ${HD};letter-spacing:.4px;text-transform:uppercase;filter:drop-shadow(0 10px 18px #00000033)}
${S} .sv-about-txt{display:flex;flex-direction:column;gap:16px}
${S} .sv-about-txt h2{font-size:36px;font-weight:900;line-height:1.15}
${S} .sv-about-txt .sv-lead{font:400 22px/36px ${HT};color:var(--sv-ink)}
${S} .sv-about-txt .sv-more{font-size:17px;line-height:30px}
${S} .sv-link{display:inline-flex;align-items:center;gap:8px;margin-top:6px;font:700 16px/1 ${HD};color:var(--sv-green);transition:gap .3s}
${S} .sv-link svg{width:18px;height:18px}
${S} .sv-link:hover{gap:14px}

/* setas e bolinhas do carrossel (comuns) */
${S} .si-car{position:relative}
${S} .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .si-car-view::-webkit-scrollbar{display:none}
${S} .si-car-track{display:flex}
${S} .si-slide{flex:0 0 100%;min-width:0;scroll-snap-align:start}
${S} .si-car-arrow,${S} .si-car-dots{display:none}
${S}.sb-js .si-car:not(.is-static) .si-car-arrow{position:absolute;top:calc(50% - 22px);z-index:4;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:#ffffff26;color:#fff;cursor:pointer;transition:background .3s}
${S} .si-car-arrow:hover{background:#ffffff59}
${S} .si-car-arrow svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
${S} .si-car.arrows-inside .si-car-arrow.prev{left:14px}
${S} .si-car.arrows-inside .si-car-arrow.next{right:14px}
${S}.sb-js .si-car:not(.is-static) .si-car-dots{position:absolute;left:0;right:0;bottom:22px;z-index:4;display:flex;justify-content:center;gap:8px}
${S} .si-car-dots button{width:10px;height:10px;padding:0;border:0;border-radius:50%;background:#ffffff80;cursor:pointer;transition:transform .3s,background .3s}
${S} .si-car-dots button.on{background:#fff;transform:scale(1.25)}
${S} .sv-cf .si-car-dots{bottom:-36px}

/* ───── faixa verde: colaborador + notícias ───── */
${S} .sv-green{position:relative;overflow:hidden;background:var(--sv-green-bg);color:#fff}
${S} .sv-green::before{content:"";position:absolute;left:-160px;top:-120px;width:560px;height:560px;background:url("${blobDeep}") center/contain no-repeat;opacity:.55;pointer-events:none}
${S} .sv-green::after{content:"";position:absolute;right:-180px;bottom:-200px;width:620px;height:620px;background:url("${blobDeep}") center/contain no-repeat;opacity:.45;pointer-events:none}
${S} .sv-band{display:flow-root;overflow:visible;padding:0 24px 56px}
${S} .sv-band-card{position:relative;z-index:2;max-width:1150px;margin:-180px auto 0;padding:64px 32px;border-radius:15px;background:#33A655;text-align:center;box-shadow:0 24px 50px #00000026;overflow:hidden}
${S} .sv-band-card::before{content:"";position:absolute;left:-20%;right:-20%;bottom:-46px;height:130px;background:radial-gradient(ellipse at 50% 100%,#ffffff2e 0 60%,transparent 61%),radial-gradient(ellipse at 18% 100%,#ffffff1f 0 55%,transparent 56%),radial-gradient(ellipse at 84% 100%,#ffffff1f 0 55%,transparent 56%);pointer-events:none}
${S} .sv-band-card>*{position:relative}
${S} .sv-band-card h2{margin-bottom:28px;font-size:48px;font-weight:900;color:#fff;text-transform:uppercase}
${S} .sv-news-band{padding:64px 24px 96px}
${S} .sv-news-band>*{position:relative;z-index:1}
${S} .sv-news-head{max-width:1120px;margin:0 auto 40px;text-align:center}
${S} .sv-news-head .sv-eyebrow{justify-content:center;color:#9CF2B2}
${S} .sv-news-head h2{margin-top:12px;font-size:36px;font-weight:900;color:#fff;text-transform:uppercase}
${S} .sv-cf{max-width:1120px;margin:0 auto}
${S} .sv-cf .si-car-view{height:280px}
${S} .sv-cf .si-car-track{height:100%}
${S} .sv-cf .si-slide{--cf-w:36%;height:100%}
${S} .sv-cf-card{position:relative;display:block;height:100%;overflow:hidden;border-radius:14px;background:#fff;color:var(--sv-ink);box-shadow:0 16px 36px #00000040}
${S} .sv-cf-card img{display:block;width:100%;height:58%;object-fit:cover}
${S} .sv-cf-card div{padding:14px 18px}
${S} .sv-cf-card time{display:block;font:500 12px/1 ${HD};letter-spacing:.4px;text-transform:uppercase;color:var(--sv-green)}
${S} .sv-cf-card h3{margin-top:6px;font-size:15px;font-weight:700;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
${S} .sv-cf-card.is-social{display:flex;align-items:center;justify-content:center;gap:14px;height:100%;font:700 20px ${HD}}
${S} .sv-cf-card.is-social i{display:flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:50%;background:var(--c,#5A6B5A);color:#fff;font-style:normal}
${S} .sv-cf-card.is-social svg{width:26px;height:26px}
${S} .sv-cf-more{display:flex;justify-content:center;margin-top:72px}

/* ───── projetos ───── */
${S} .sv-proj{position:relative;overflow:hidden;padding:190px 24px 90px;background:#fff;text-align:center}
${S} .sv-map{position:absolute;inset:0;background-image:radial-gradient(circle 2px at 50% 50%,#D3DEEC 0 98%,transparent 100%);background-size:16px 16px;-webkit-mask-image:radial-gradient(ellipse 60% 48% at 50% 54%,#000 0 70%,transparent 100%);mask-image:radial-gradient(ellipse 60% 48% at 50% 54%,#000 0 70%,transparent 100%);pointer-events:none}
${S} .sv-float{position:absolute;z-index:1;width:var(--sz,150px);height:var(--sz,150px);left:var(--x);top:var(--y);margin:0;border-radius:50%;overflow:hidden;box-shadow:0 14px 34px #0000002E}
${S} .sv-float img{display:block;width:100%;height:100%;object-fit:cover}
@media (prefers-reduced-motion:no-preference){${S}.sb-js .sv-float{animation:sv-float 7s ease-in-out infinite;animation-delay:var(--d,0s)}}
@keyframes sv-float{0%,100%{transform:translateY(-8px)}50%{transform:translateY(8px)}}
${S} .sv-proj-in{position:relative;z-index:2;max-width:760px;margin:0 auto}
${S} .sv-proj-in h2{font-size:48px;font-weight:900;line-height:1.5;color:var(--sv-green);text-transform:uppercase}
${S} .sv-proj-in .sv-sub{margin-top:8px;font:400 22px/1.5 ${HD};color:var(--sv-text)}
${S} .sv-play{position:relative;display:flex;align-items:center;justify-content:center;width:60px;height:60px;margin:40px auto 28px;border-radius:50%;background:var(--sv-green);color:#fff;box-shadow:0 10px 25px #007E0859}
${S} .sv-play svg{position:relative;width:24px;height:24px;margin-left:3px;fill:currentColor;stroke:none}
${S} .sv-play::before,${S} .sv-play::after{content:"";position:absolute;inset:-12px;border:1.5px solid var(--sv-green);border-radius:50%;opacity:.35}
${S} .sv-play::after{inset:-24px;opacity:.2}
@media (prefers-reduced-motion:no-preference){${S}.sb-js .sv-play::before{animation:sv-ring 2.4s ease-out infinite}${S}.sb-js .sv-play::after{animation:sv-ring 2.4s ease-out .8s infinite}}
@keyframes sv-ring{0%{transform:scale(.7);opacity:.55}100%{transform:scale(1.15);opacity:0}}
${S} .sv-conheca{display:inline-block;font:900 36px/1.2 ${HD};color:var(--sv-green);text-transform:uppercase;transition:transform .3s}
${S} a.sv-conheca:hover{transform:translateY(-3px)}

/* ───── rodapé ───── */
${S} .sv-foot{position:relative;overflow:hidden;background:var(--sv-green-footer);color:#fff;font-family:${HT}}
${S} .sv-foot::before{content:"";position:absolute;left:-140px;bottom:-160px;width:560px;height:560px;background:url("${blobFoot}") center/contain no-repeat;opacity:.6;pointer-events:none}
${S} .sv-foot::after{content:"";position:absolute;right:-160px;top:-180px;width:540px;height:540px;background:url("${blobFoot}") center/contain no-repeat;opacity:.45;pointer-events:none}
${S} .sv-foot-in{position:relative;z-index:1;display:grid;grid-template-columns:1.3fr 1.2fr .8fr .9fr;gap:48px;max-width:1140px;margin:0 auto;padding:96px 24px 56px}
${S} .sv-foot h4{margin-bottom:22px;font-size:20px;font-weight:700;color:#fff}
${S} .sv-foot-logo img{display:block;width:180px;height:auto;margin-bottom:22px}
${S} .sv-foot-about{font-size:16px;line-height:30px}
${S} .sv-foot dl{margin:0;display:grid;gap:14px}
${S} .sv-foot dt{font:700 15px/1.2 ${HD};color:var(--sv-cyan)}
${S} .sv-foot dd{margin:2px 0 0;font-size:16px;line-height:1.5}
${S} .sv-foot dd a:hover{text-decoration:underline}
${S} .sv-foot-menu{display:grid;gap:18px}
${S} .sv-foot-menu a{font:500 16px/1.2 ${HD};text-transform:uppercase;transition:color .3s,transform .3s}
${S} .sv-foot-menu a:hover{color:var(--sv-cyan);transform:translateX(4px)}
${S} .sv-foot .sv-socs{margin-left:0;flex-wrap:wrap;gap:12px}
${S} .sv-foot .sv-soc{width:34px;height:34px}
${S} .sv-foot .sv-soc svg{width:16px;height:16px}
${S} .sv-copy{position:relative;z-index:1;max-width:1140px;margin:0 auto;padding:24px;border-top:1px solid #FFFFFF1A;text-align:center;font-size:15px}

/* ───── faixa de título das internas ───── */
${S} .sv-ph{position:relative;display:flex;align-items:center;justify-content:center;height:330px;overflow:hidden;background:var(--sv-soft);text-align:center}
${S} .sv-ph .sv-map{-webkit-mask-image:radial-gradient(ellipse 70% 90% at 50% 50%,#000 0 60%,transparent 100%);mask-image:radial-gradient(ellipse 70% 90% at 50% 50%,#000 0 60%,transparent 100%);opacity:.9}
${S} .sv-ph::before,${S} .sv-ph::after{content:"";position:absolute;width:420px;height:10px;border-radius:10px;background:linear-gradient(90deg,#7B8CFF00,#7B8CFF59);transform:rotate(-35deg);pointer-events:none}
${S} .sv-ph::before{left:6%;top:30%}
${S} .sv-ph::after{right:8%;bottom:26%;transform:rotate(-35deg) scaleX(-1)}
${S} .sv-ph-in{position:relative;z-index:1;padding:0 24px}
${S} .sv-ph h1{font-size:48px;font-weight:900}
${S} .sv-crumb{display:flex;justify-content:center;align-items:center;gap:10px;margin-top:14px;font:500 16px/1 ${HD};color:var(--sv-ink)}
${S} .sv-crumb a{color:var(--sv-crumb)}
${S} .sv-crumb a:hover{text-decoration:underline}

/* ───── equipe ───── */
${S} .sv-sec{padding:90px 24px}
${S} .sv-sec-head{max-width:760px;margin:0 auto 48px;text-align:center}
${S} .sv-sec-head .sv-eyebrow{justify-content:center}
${S} .sv-sec-head h2{margin-top:12px;font-size:36px;font-weight:900;text-transform:uppercase}
${S} .sv-sec-head p{margin-top:12px;font-size:18px}
${S} .sv-team-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:28px;max-width:1280px;margin:0 auto}
${S} .sv-member{flex:0 0 calc((100% - 84px)/4);min-width:0;text-align:center;transition:transform .3s}
${S} .sv-member:hover{transform:translateY(-8px)}
${S} .sv-member img{display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px;box-shadow:0 14px 30px #0000001F}
${S} .sv-member h3{margin-top:18px;font-size:20px;font-weight:700}
${S} .sv-member p{margin-top:4px;font-size:15px;color:var(--sv-text)}

/* ───── como atuamos ───── */
${S} .sv-how{padding:90px 24px}
${S} .sv-how-head{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:48px;align-items:center;max-width:1180px;margin:0 auto 64px}
${S} .sv-how-head h2{margin:12px 0 16px;font-size:36px;font-weight:900}
${S} .sv-how-head p{font-size:18px;line-height:32px}
${S} .sv-how-video{text-align:center}
${S} .sv-how-video .sv-play{margin:0 auto 34px}
${S} .sv-tabs{max-width:1180px;margin:0 auto}
${S} .sv-tab-radio{position:absolute;opacity:0;pointer-events:none}
${S} .sv-tablist{display:flex;gap:10px;margin-bottom:32px;padding-bottom:0;border-bottom:2px solid #E3E9F2}
${S} .sv-tab{position:relative;padding:14px 26px;margin-bottom:-2px;border-bottom:4px solid transparent;font:700 17px/1 ${HD};color:var(--sv-text);cursor:pointer;transition:color .3s,border-color .3s}
${S} .sv-tab:hover{color:var(--sv-green)}
${S} .sv-tabpanel{display:none}
${S} .sv-tab-radio:nth-of-type(1):checked~.sv-tablist .sv-tab:nth-child(1),${S} .sv-tab-radio:nth-of-type(2):checked~.sv-tablist .sv-tab:nth-child(2),${S} .sv-tab-radio:nth-of-type(3):checked~.sv-tablist .sv-tab:nth-child(3),${S} .sv-tab-radio:nth-of-type(4):checked~.sv-tablist .sv-tab:nth-child(4),${S} .sv-tab-radio:nth-of-type(5):checked~.sv-tablist .sv-tab:nth-child(5),${S} .sv-tab-radio:nth-of-type(6):checked~.sv-tablist .sv-tab:nth-child(6){color:var(--sv-green);border-bottom-color:var(--sv-green-bright)}
${S} .sv-tab-radio:nth-of-type(1):checked~.sv-tabpanels .sv-tabpanel:nth-child(1),${S} .sv-tab-radio:nth-of-type(2):checked~.sv-tabpanels .sv-tabpanel:nth-child(2),${S} .sv-tab-radio:nth-of-type(3):checked~.sv-tabpanels .sv-tabpanel:nth-child(3),${S} .sv-tab-radio:nth-of-type(4):checked~.sv-tabpanels .sv-tabpanel:nth-child(4),${S} .sv-tab-radio:nth-of-type(5):checked~.sv-tabpanels .sv-tabpanel:nth-child(5),${S} .sv-tab-radio:nth-of-type(6):checked~.sv-tabpanels .sv-tabpanel:nth-child(6){display:grid}
${S} .sv-tab-radio:focus-visible~.sv-tablist .sv-tab{outline:none}
${S} .sv-tab-radio:nth-of-type(1):focus-visible~.sv-tablist .sv-tab:nth-child(1),${S} .sv-tab-radio:nth-of-type(2):focus-visible~.sv-tablist .sv-tab:nth-child(2),${S} .sv-tab-radio:nth-of-type(3):focus-visible~.sv-tablist .sv-tab:nth-child(3),${S} .sv-tab-radio:nth-of-type(4):focus-visible~.sv-tablist .sv-tab:nth-child(4),${S} .sv-tab-radio:nth-of-type(5):focus-visible~.sv-tablist .sv-tab:nth-child(5),${S} .sv-tab-radio:nth-of-type(6):focus-visible~.sv-tablist .sv-tab:nth-child(6){outline:3px solid var(--sv-green-bright);outline-offset:2px;border-radius:6px}
${S} .sv-how-body{grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:40px;align-items:center}
${S} .sv-how-body h3{margin-bottom:14px;font-size:28px;font-weight:900}
${S} .sv-how-body p+p{margin-top:14px}
${S} .sv-how-body p{font-size:17px;line-height:30px}
${S} .sv-how-body img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;box-shadow:0 14px 30px #0000001F}
${S} .sv-sched{max-width:1180px;margin:72px auto 0}
${S} .sv-sched h3{margin-bottom:20px;font-size:28px;font-weight:900;text-align:center}
${S} .sv-table-wrap{overflow-x:auto;border-radius:12px;box-shadow:0 14px 30px #0000001A}
${S} .sv-table{width:100%;min-width:520px;border-collapse:collapse;background:#fff}
${S} .sv-table th{padding:16px 20px;background:var(--sv-green);color:#fff;font:700 15px ${HD};text-align:left;text-transform:uppercase}
${S} .sv-table td{padding:16px 20px;border-bottom:1px solid #E6ECF4;font-size:16px;color:var(--sv-ink)}
${S} .sv-table tr:nth-child(even) td{background:#F6FAF6}
${S} .sv-doubts{max-width:760px;margin:72px auto 0;padding:40px 32px;border-radius:16px;background:var(--sv-soft);text-align:center}
${S} .sv-doubts h3{font-size:28px;font-weight:900}
${S} .sv-doubts p{margin:10px 0 24px;font-size:17px}

/* ───── doação e PIX ───── */
${S} .sv-donate{padding:90px 24px 70px}
${S} .sv-donate-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr);gap:64px;align-items:center;max-width:1180px;margin:0 auto}
${S} .sv-donate-in h2{margin-bottom:20px;font-size:40px;font-weight:900}
${S} .sv-donate-in p{font-size:18px;line-height:32px}
${S} .sv-donate-in p+p{margin-top:16px}
${S} .sv-donate-in strong{color:var(--sv-ink)}
${S} .sv-blobph{position:relative;aspect-ratio:1;max-width:480px;margin:0 auto}
${S} .sv-blobph::before{content:"";position:absolute;inset:-4%;background:var(--sv-green);-webkit-mask:url("${BLOB_MASK}") center/100% 100% no-repeat;mask:url("${BLOB_MASK}") center/100% 100% no-repeat;transform:translate(10px,10px) rotate(8deg);opacity:.9}
${S} .sv-blobph img{position:relative;display:block;width:100%;height:100%;object-fit:cover;-webkit-mask:url("${BLOB_MASK}") center/100% 100% no-repeat;mask:url("${BLOB_MASK}") center/100% 100% no-repeat}
${S} .sv-donate-cta{max-width:720px;margin:64px auto 0;text-align:center}
${S} .sv-donate-cta h2{margin-bottom:14px;font-size:34px;font-weight:900}
${S} .sv-donate-cta p{margin-bottom:28px;font-size:18px}
${S} .sv-pix{max-width:880px;margin:0 auto;padding:48px 40px;border-radius:20px;background:#fff;box-shadow:0 24px 60px #0000002E}
${S} .sv-pix.is-inline{margin:0 auto 90px;border:1px solid #E3EAF3;box-shadow:0 18px 44px #0000001A}
${S} .sv-pix h2{margin-bottom:24px;font-size:32px;font-weight:900;text-align:center}
${S} .sv-pix-in{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:36px;align-items:center}
${S} .sv-qr{position:relative;border:1px solid #E3EAF3;border-radius:14px;padding:14px;background:#fff}
${S} .sv-qr img{display:block;width:100%;height:auto}
${S} .sv-pix dl{margin:0;display:grid;gap:16px}
${S} .sv-pix dt{font:700 13px/1 ${HD};letter-spacing:.5px;text-transform:uppercase;color:var(--sv-green)}
${S} .sv-pix dd{margin:5px 0 0;font-size:18px;color:var(--sv-ink);word-break:break-all;-webkit-user-select:all;user-select:all}
${S} .sv-pix-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
${S} .sv-copy-btn{font-size:14px;padding:13px 22px}
${S} .sv-copy-btn.is-done{background:#0A6B14}
${S} .sv-payload{margin-top:22px;padding:14px 16px;border-radius:10px;background:#F2F7F2;font:400 13px/1.5 ui-monospace,Menlo,Consolas,monospace;color:var(--sv-ink);word-break:break-all;-webkit-user-select:all;user-select:all}
${S} .sv-pix-warn{margin:0 0 22px;padding:12px 16px;border-radius:10px;background:#FFF4D6;color:#7A5200;font:700 14px/1.4 ${HD}}
${S} .sv-pix-pop{width:min(94vw,880px);max-height:92vh;overflow-y:auto;padding:0;border:0;background:transparent}
${S} .sv-pix-pop::backdrop{background:#000000A6}
${S} .sv-pix-pop .sv-pix{position:relative}
${S} .sv-pix-x{position:absolute;right:14px;top:14px;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:0;border-radius:50%;background:#EEF3FF;color:var(--sv-ink);cursor:pointer}
${S} .sv-pix-x svg{width:18px;height:18px}

/* ───── notícias ───── */
${S} .sv-news-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;max-width:1280px;margin:0 auto}
${S} .sv-ncard{display:flex;flex-direction:column;overflow:hidden;border-radius:14px;background:#fff;box-shadow:0 14px 34px #0000001A;transition:transform .3s,box-shadow .3s}
${S} .sv-ncard:hover{transform:translateY(-6px);box-shadow:0 22px 44px #00000026}
${S} .sv-ncard img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
${S} .sv-ncard-in{display:flex;flex-direction:column;gap:8px;padding:22px 24px 26px}
${S} .sv-ncard time{font:700 12px/1 ${HD};letter-spacing:.5px;text-transform:uppercase;color:var(--sv-green)}
${S} .sv-ncard h3{font-size:20px;font-weight:700}
${S} .sv-ncard p{font-size:15px;line-height:26px}
${S} .sv-empty{max-width:640px;margin:0 auto;padding:40px;text-align:center;font-size:18px}
${S} .sv-follow{max-width:760px;margin:72px auto 0;text-align:center}
${S} .sv-follow h3{margin-bottom:18px;font-size:24px;font-weight:900}
${S} .sv-follow .sv-socs{justify-content:center;margin-left:0}
${S} .sv-follow .sv-soc{width:42px;height:42px}
${S} .sv-follow .sv-soc svg{width:20px;height:20px}
${S} .sv-post{max-width:820px;margin:0 auto;padding:70px 24px 40px}
${S} .sv-post-cover{display:block;width:100%;aspect-ratio:16/9;margin-bottom:24px;object-fit:cover;border-radius:16px}
${S} .sv-post-meta{display:flex;gap:14px;margin-bottom:22px;font:700 13px/1 ${HD};letter-spacing:.5px;text-transform:uppercase;color:var(--sv-green)}
${S} .sv-post-body p,${S} .sv-post-body .sb-text{margin-bottom:18px;font-size:18px;line-height:32px}
${S} .sv-post-cta{margin-top:40px;padding:34px;border-radius:16px;background:var(--sv-soft);text-align:center}
${S} .sv-post-cta h3{margin-bottom:12px;font-size:24px;font-weight:900}

/* ───── galeria ───── */
${S} .sv-albums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;max-width:1280px;margin:0 auto}
${S} .sv-album{display:block;overflow:hidden;border-radius:14px;background:#fff;box-shadow:0 14px 34px #0000001A;transition:transform .3s}
${S} a.sv-album{cursor:pointer}
${S} a.sv-album:hover{transform:translateY(-6px)}
${S} .sv-album img{display:block;width:100%;aspect-ratio:1;object-fit:cover}
${S} .sv-album h3{padding:18px 20px;font-size:18px;font-weight:700}
${S} .sv-album span{display:block;padding:0 20px 18px;margin-top:-8px;font-size:14px;color:var(--sv-green);font-weight:700}

/* ───── contato e mapa ───── */
${S} .sv-contact{padding:90px 24px 40px}
${S} .sv-contact-in{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:56px;max-width:1180px;margin:0 auto}
${S} .sv-contact h2{margin-bottom:16px;font-size:34px;font-weight:900}
${S} .sv-contact-info p{margin-bottom:26px;font-size:18px;line-height:32px}
${S} .sv-contact-list{display:grid;gap:20px}
${S} .sv-contact-list li{display:flex;gap:16px;align-items:flex-start}
${S} .sv-contact-list i{display:flex;align-items:center;justify-content:center;flex:none;width:48px;height:48px;border-radius:50%;background:var(--sv-green);color:#fff}
${S} .sv-contact-list svg{width:22px;height:22px}
${S} .sv-contact-list b{display:block;font:700 16px/1.2 ${HD};color:var(--sv-ink)}
${S} .sv-contact-list span,${S} .sv-contact-list a{font-size:16px}
${S} .sv-contact-list a:hover{color:var(--sv-green);text-decoration:underline}
${S} .sv-form{padding:36px;border-radius:16px;background:#fff;box-shadow:0 18px 44px #0000001A}
${S} .sv-form-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
${S} .sv-form input,${S} .sv-form textarea{width:100%;margin-bottom:16px;padding:15px 18px;border:1px solid #D8DEEA;border-radius:10px;background:#fff;font:400 16px ${HT};color:var(--sv-ink);transition:border-color .3s,box-shadow .3s}
${S} .sv-form input:focus,${S} .sv-form textarea:focus{border-color:var(--sv-green);outline:none;box-shadow:0 0 0 3px #007E0826}
${S} .sv-form textarea{min-height:140px;resize:vertical}
${S} .sv-form .sv-btn{border:0}
${S} .sv-form-note{margin-top:14px;font-size:14px}
${S} .sv-form-note a{color:var(--sv-green);text-decoration:underline}
${S} .sv-map-sec{padding:40px 24px 90px}
${S} .sv-map-sec h2{margin-bottom:24px;font-size:34px;font-weight:900;text-align:center}
${S} .sv-map-frame{max-width:1180px;margin:0 auto;overflow:hidden;border-radius:16px;box-shadow:0 18px 44px #0000001A;background:#E6ECF4}
${S} .sv-map-frame iframe{display:block;width:100%;height:420px;border:0}
${S} .sv-notice{max-width:1180px;margin:0 auto 16px;padding:12px 16px;border-radius:10px;background:#FFF4D6;color:#7A5200;font:700 14px/1.4 ${HD}}

/* ───── 404 ───── */
${S} .sv-nf{padding:120px 24px;text-align:center}
${S} .sv-nf-code{font:900 clamp(96px,18vw,200px)/1 ${HD};color:var(--sv-green-bright);opacity:.35}
${S} .sv-nf h1{margin:-10px 0 14px;font-size:40px;font-weight:900}
${S} .sv-nf p{margin-bottom:28px;font-size:18px}

${coverflowCss}
${upTo(1024, w1024)}
${upTo(767, w767)}
${narrowOnly(x => `${x} .sv-cf .si-slide{--cf-w:78%}`)}
@media (prefers-reduced-motion:reduce){
${S} .sv-parts::before,${S} .sv-parts::after,${S} .sv-float,${S} .sv-play::before,${S} .sv-play::after,${S} .sv-head.is-stuck .sv-bar{animation:none!important}
${S} .sv-btn,${S} .sv-area,${S} .sv-member,${S} .sv-ncard,${S} .sv-soc,${S} .sv-drawer-in,${S} .sv-drawer-bg{transition:none}
}
`;
