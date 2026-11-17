/**
 * Variante "pousada" (`theme.variant = "pousada"`, escopo `.sb-vv`): landing de uma página de pousada e camping no
 * Cerrado, verde e azul, com menu fixo e gaveta, hero em carrossel, linha do tempo, quartos com modal de fotos,
 * experiências, missão/visão/valores, mapa e rodapé. Layout e medidas tirados do CSS renderizado de uma pousada real
 * (Next.js + styled-components, `:root { font-size: 10px }`, então 1rem = 10px lá e tudo aqui é px); **marca,
 * textos, fotos e contatos são próprios**. Breakpoints do original repetidos sob `.sb-narrow` (quadro estreito do
 * editor = visual de celular).
 *
 * Tokens do tema: `accent` = azul `#2A8ECC`; extras `blueDark`, `blue900`, `blueGlow`, `green`, `green900`,
 * `greenLight`, `cardBlue`, `cardGreen`, `expGreen`, `dark`, `sky`. Configurações globais (lidas pelos blocos, não
 * pelo CSS, exceto `darkMode`): `bookUrl`, `whatsapp`, `waMessage`, `contactEmail`, `phone`, `mapAddress`.
 *
 * Modo escuro: com `theme.darkMode !== "no"` o CSS ganha o bloco `@media (prefers-color-scheme: dark)`.
 */
export const isPousada = (theme: Record<string, string>) =>
  theme.variant === "pousada";

/** Fontes fixas da variante (nunca texto do usuário). */
export const POUSADA_EXTRA_FONTS = ["Josefin Sans", "Fira Sans"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/**
 * Cores cruas do tema. Ficam em `style` inline; os papéis que mudam no modo escuro (`--vv-page`, `--vv-ink`,
 * `--vv-sky`) são definidos no CSS, porque um `style` inline venceria a `@media`.
 */
export function pousadaVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--vv-bg-light": safe(theme.bg, "#FFFFFF"),
    "--vv-blue": safe(theme.accent, "#2A8ECC"),
    "--vv-blue-900": safe(theme.blue900, "#184E70"),
    "--vv-blue-dark": safe(theme.blueDark, "#2974A3"),
    "--vv-blue-glow": safe(theme.blueGlow, "#35B0FC"),
    "--vv-card-blue": safe(theme.cardBlue, "#143346"),
    "--vv-card-green": safe(theme.cardGreen, "#1B330C"),
    "--vv-dark": safe(theme.dark, "#1C2428"),
    "--vv-exp-green": safe(theme.expGreen, "#254611"),
    "--vv-green": safe(theme.green, "#5E943E"),
    "--vv-green-900": safe(theme.green900, "#47702F"),
    "--vv-green-light": safe(theme.greenLight, "#90F157"),
    "--vv-ink-light": safe(theme.fg, "#111111"),
    "--vv-sky-light": safe(theme.sky, "#CCE6F5"),
  };
}

const S = ".sb-vv";
const N = `${S}.sb-narrow`;

/** Regras de uma faixa `max-width`, repetidas sob `.sb-narrow` (a media query não enxerga o quadro do editor). */
const upTo = (max: number, rules: (x: string) => string) =>
  `@media (max-width:${max}px){${rules(S)}}\n${rules(N)}`;

/* ───────── modo escuro (opcional) ───────── */

const dark = (x: string) => `
${x}{--vv-page:var(--vv-dark);--vv-ink:#fff;--vv-sky:#448AB9}
${x} .vv-nav{border-bottom:2px solid var(--vv-green)}
${x} .vv-tl-item.is-left .vv-tl-meta b{color:var(--vv-blue-glow)}
${x} .vv-tl-item.is-right .vv-tl-meta b{color:var(--vv-green-light)}
${x} .vv-room:nth-child(odd){border-color:var(--vv-blue-dark)}
${x} .vv-room:nth-child(even){border-color:var(--vv-green)}
${x} .vv-modal{background:linear-gradient(45deg,var(--vv-dark) 30%,var(--vv-blue-900) 60%,var(--vv-green-900) 100%)}
`;

/* ───────── faixas de tela ───────── */

/** ≤ 1280: sem as ilustrações laterais. */
const w1280 = (x: string) => `
${x} .vv-values{padding:80px 30px}
${x} .vv-values-art{display:none}
`;

/** ≤ 1100 / ≤ 930: o menu encolhe antes de virar gaveta. */
const w1100 = (x: string) => `${x} .vv-menu a{font-size:17px}`;
const w930 = (x: string) => `${x} .vv-menu a{font-size:15px}`;

/** ≤ 892: o menu vira o botão quadrado verde + gaveta pela direita. */
const w892 = (x: string) => `
${x} .vv-nav{height:80px}
${x} .vv-menu{display:none}
${x} .vv-burger-btn{display:flex}
${x} .vv-veil,${x} .vv-drawer{display:block}
${x}>.sb-block[id],${x} .sb-block[id]{scroll-margin-top:80px}
`;

/** ≤ 840: logo do hero a 70%, fotos da visita em grade, rodapé em duas colunas. */
const w840 = (x: string) => `
${x} .vv-hero-logo{width:70%}
${x} .vv-vphotos{display:grid;grid-template-columns:repeat(2,minmax(0,200px));gap:12px;width:100%;max-width:412px;height:auto;justify-content:center}
${x} .vv-vphoto,${x} .vv-vphoto:nth-child(n){width:auto;align-self:auto}
${x} .vv-vphoto:nth-child(3){grid-column:1/-1;width:100%}
${x} .vv-foot-in{grid-template-columns:1fr 1fr;row-gap:44px}
${x} .vv-foot-logo{grid-column:1/-1;grid-row:1}
`;

/** Cartão horizontal dos quartos: só na faixa 600–800 (no quadro estreito do editor, não). */
const roomsWide = `
@media (min-width:600px) and (max-width:800px){
${S} .vv-room{width:100%;height:260px;flex-direction:row}
${S} .vv-room-img{width:55%;height:100%;border-radius:12px 0 0 12px}
${S} .vv-room-body{width:45%;flex:none}
}
`;

/** ≤ 768: modal do celular (foto cheia, texto sobre a foto, miniaturas em coluna). */
const w768 = (x: string) => `
${x} .vv-modal{width:calc(100vw - 24px);max-width:none;margin:12px auto;background:transparent;border-radius:0;overflow:visible}
${x} .vv-g{display:block;padding:0}
${x} .vv-g-media{width:100%;height:75dvh}
${x} .vv-g-info{position:absolute;left:0;right:0;bottom:0;z-index:2;width:auto;align-items:flex-start;gap:8px;padding:56px 16px 16px 76px;border-radius:0 0 12px 12px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.65));text-shadow:0 0 3px #000,0 0 3px #000,0 0 6px #000}
${x} .vv-g-info h3{font-size:24px}
${x} .vv-g-info p{font-size:18px}
${x} .vv-g-thumbs{top:50%;bottom:auto;left:8px;right:auto;z-index:2;flex-direction:column;transform:translateY(-50%)}
${x} .vv-g-x{top:8px;right:8px;z-index:3;color:#fff;background:rgba(0,0,0,.35)}
${x} .vv-modal[data-vv-ready] .vv-g-fs{display:flex}
${x} .vv-g-arrow{display:none!important}
`;

/** ≤ 700: linha do tempo simples e botões empilhados. */
const w700 = (x: string) => `
${x} .vv-story-title{text-shadow:-30px -4px 12px rgba(0,0,0,.25)}
${x} .vv-story-title span+span{margin-left:20px}
${x} .vv-story-btns{flex-direction:column;align-items:stretch;width:80%;margin-top:50px}
${x} .vv-tl::before{left:24px}
${x} .vv-tl-item{grid-template-columns:48px minmax(0,1fr);column-gap:16px;align-items:start}
${x} .vv-tl-year{justify-content:flex-start}
${x} .vv-tl-dot{grid-column:1;grid-row:2/span 2;width:48px;height:48px}
${x} .vv-tl-dot svg{width:24px;height:24px}
${x} .vv-tl-item:is(.is-left,.is-right) .vv-tl-meta{grid-column:2;grid-row:2;align-self:center;text-align:left}
${x} .vv-tl-item:is(.is-left,.is-right) .vv-tl-card{grid-column:2;grid-row:3;justify-self:stretch;max-width:none;top:0!important;padding:20px 16px}
${x} .vv-tl-card h3{font-size:20px}
${x} .vv-tl-card p{font-size:16px}
`;

/** ≤ 600: cartões de experiência empilhados. */
const w600 = (x: string) => `
${x} .vv-xc{flex-direction:column;width:100%;max-width:386px;height:540px}
${x} .vv-xc-img{width:100%;height:250px;flex:none}
${x} .vv-xc-body{width:100%;flex:1;padding:20px}
${x} .vv-xc-solid{width:100%;max-width:386px}
`;

/** ≤ 425: sem fotos em escada (só o título), rodapé empilhado. */
const w425 = (x: string) => `
${x} .vv-exp{padding:65px 20px}
${x} .vv-visit{padding:100px 30px}
${x} .vv-vphotos{display:none}
${x} .vv-vtitle{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto;flex:1 1 100%;font-size:30px;font-weight:700;text-align:center;color:#fff;text-shadow:0 0 20px #000}
${x} .vv-foot-in{grid-template-columns:1fr;row-gap:60px}
${x} .vv-foot-logo{grid-column:1}
`;

/** ≤ 375. */
const w375 = (x: string) => `
${x} .vv-rooms-in{padding:0 24px 36px}
${x} .vv-story-btns{width:95%}
`;

export const pousadaCss = (theme: Record<string, string>) => `
${S}{--vv-nav:linear-gradient(90deg,#071E2D 0%,#1B2615 100%);--vv-page:var(--vv-bg-light);--vv-ink:var(--vv-ink-light);--vv-sky:var(--vv-sky-light);background:var(--vv-page);color:var(--vv-ink);font-family:'Fira Sans',sans-serif;font-size:16px;line-height:1.4}
${S} main{padding:0!important}
${S} h1,${S} h2,${S} h3{margin:0;font-family:'Josefin Sans',sans-serif;font-weight:600;line-height:1.15;color:inherit}
${S} p{margin:0}
${S} ul,${S} ol{margin:0;padding:0;list-style:none}
${S} button{font-family:inherit}
${S} .vv-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .sb-block[id]{scroll-margin-top:90px}
${S} .sb-container{width:min(860px,100% - 32px);padding-block:20px}
${S} .sb-container h2{font-size:28px;margin:28px 0 10px}
${S} .sb-container p{margin:0 0 14px}

/* botões */
${S} .vv-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:8px 40px;border:2px solid transparent;border-radius:8px;color:#fff;font:500 20px/1.3 'Fira Sans',sans-serif;text-align:center;cursor:pointer;transition:background-color .3s,border-color .3s}
${S} .vv-btn svg{width:24px;height:24px;flex:none;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
${S} .vv-btn svg[fill=currentColor]{fill:#fff;stroke:none}
${S} .vv-btn-blue{background:var(--vv-blue);border-color:#2D95D6}
${S} .vv-btn-blue:hover{background:var(--vv-blue-dark)}
${S} .vv-btn-green{background:var(--vv-green);border-color:var(--vv-green)}
${S} .vv-btn-green:hover{background:var(--vv-green-900)}
${S} .vv-btn-o-blue{background:transparent;border-color:#2D95D6}
${S} .vv-btn-o-blue:hover{background:var(--vv-blue)}
${S} .vv-btn-o-green{background:transparent;border-color:var(--vv-green)}
${S} .vv-btn-o-green:hover{background:var(--vv-green)}
${S} .vv-btn:focus-visible,${S} .vv-menu a:focus-visible,${S} .vv-xc-btn:focus-visible,${S} .vv-down:focus-visible,${S} .vv-g button:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 5px var(--vv-blue-900)}

/* menu fixo (o bloco gruda no topo e sobrepõe o hero) */
${S}>.sb-block[data-block-type=vvNav]{position:sticky;top:var(--sb-sticky-top,0px);z-index:10;height:0}
${S} .vv-nav{position:relative;display:flex;align-items:center;justify-content:space-between;height:90px;padding-left:4vw;background:var(--vv-nav);backdrop-filter:blur(10px)}
${S} .vv-nav-logo{display:block;width:50px;flex:none}
${S} .vv-nav-logo img{width:100%;height:auto}
${S} .vv-menu{display:flex;height:100%}
${S} .vv-menu li{display:flex}
${S} .vv-menu a{display:flex;align-items:center;height:100%;padding:0 40px;color:#fff;font:500 20px 'Fira Sans',sans-serif;transition:background-color .3s}
${S} .vv-menu a:hover,${S} .vv-menu a:focus-visible{background:var(--vv-green-900)}
${S} .vv-menu li:last-child a:hover,${S} .vv-menu li:last-child a:focus-visible{background:var(--vv-blue)}
${S} .vv-burger-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${S} .vv-burger-btn{display:none;align-items:center;justify-content:center;width:80px;height:80px;background:var(--vv-green);color:#fff;cursor:pointer}
${S} .vv-burger-btn svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
${S} .vv-veil,${S} .vv-drawer{display:none}
${S} .vv-veil{position:fixed;inset:0;z-index:11;background:rgba(0,0,0,.55);opacity:0;visibility:hidden;transition:opacity .25s,visibility 0s .25s}
${S} .vv-drawer{position:fixed;top:0;right:0;bottom:0;z-index:12;width:60%;max-width:380px;padding:96px 28px 24px;overflow-y:auto;background:var(--vv-nav);transform:translateX(100%);visibility:hidden;transition:transform .25s ease,visibility 0s .25s}
${S} .vv-drawer-x{position:absolute;top:0;right:0;display:flex;align-items:center;justify-content:center;width:80px;height:80px;background:var(--vv-green);color:#fff;cursor:pointer}
${S} .vv-drawer-x svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
${S} .vv-drawer ul{display:flex;flex-direction:column;align-items:flex-end;gap:clamp(8px,2vh,24px)}
${S} .vv-drawer li a:not(.vv-btn){display:block;padding:clamp(14px,3vh,30px) 0;color:#fff;font:500 20px 'Fira Sans',sans-serif}
${S} .vv-drawer li a:not(.vv-btn):hover{color:var(--vv-green-light)}
${S} .vv-drawer .vv-btn{margin-top:12px}
${S} #sb-burger:checked~.vv-veil{opacity:1;visibility:visible;transition:opacity .25s}
${S} #sb-burger:checked~.vv-drawer{transform:none;visibility:visible;transition:transform .25s ease}
${S} #sb-burger:focus-visible~.vv-nav .vv-burger-btn{outline:3px solid #fff;outline-offset:-6px}

/* hero em carrossel */
${S} .vv-hero{position:relative;height:100vh;height:100svh;min-height:520px;overflow:hidden;background:var(--vv-nav);color:#fff}
${S} .vv-hero .si-car,${S} .vv-hero .si-car-view,${S} .vv-hero .si-car-track,${S} .vv-hero .si-slide{height:100%}
${S} .vv-hero .si-car{position:relative}
${S} .vv-hero .si-slide img{display:block;width:100%;height:100%;object-fit:cover;filter:brightness(.65)}
${S} .vv-hero::after{content:"";position:absolute;inset:0;z-index:1;box-shadow:inset 0 4px 80px 500px rgba(0,0,0,.4);pointer-events:none}
${S} .vv-hero .si-car-arrow,${S} .vv-hero .si-car-dots{display:none}
${S}.sb-js .vv-hero .si-car:not(.is-static) .si-car-arrow{position:absolute;top:0;bottom:0;z-index:3;display:flex;align-items:center;justify-content:center;width:15%;padding:0;border:0;background:none;color:#fff;opacity:.5;cursor:pointer;transition:opacity .15s}
${S}.sb-js .vv-hero .si-car-arrow:hover,${S}.sb-js .vv-hero .si-car-arrow:focus-visible{opacity:.95}
${S} .vv-hero .si-car-arrow.prev{left:0}
${S} .vv-hero .si-car-arrow.next{right:0}
${S} .vv-hero .si-car-arrow svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
${S} .vv-hero-in{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:90px 20px 20px;pointer-events:none;text-align:center}
${S} .vv-hero-logo{width:min(370px,100%)}
${S} .vv-hero-logo img{width:100%;height:auto}
${S} .vv-hero-h1{font-size:clamp(28px,4vw,32px);font-weight:700;line-height:1.3;color:#fff}
${S} .vv-down{display:flex;width:56px;height:56px;align-items:center;justify-content:center;color:#fff;pointer-events:auto}
${S} .vv-down svg{width:36px;height:36px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
@media (prefers-reduced-motion:no-preference){${S} .vv-down svg{animation:vv-bob 1.6s ease-in-out infinite}}
@keyframes vv-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
${S} .vv-hero-fade{position:absolute;left:0;right:0;bottom:0;z-index:2;height:15vh;background:linear-gradient(180deg,transparent 0%,var(--vv-green-900) 80%);pointer-events:none}

/* A nossa pousada + linha do tempo */
${S} .vv-story{min-height:80vh;padding:150px 20px 80px;background:linear-gradient(180deg,var(--vv-green-900) 0%,var(--vv-page) 30%)}
${S} .vv-story-in{display:flex;flex-direction:column;align-items:center;width:min(700px,100%);margin:0 auto}
${S} .vv-story-title{font-size:clamp(48px,5vw,64px);font-weight:600;line-height:1.1;color:#fff;-webkit-text-stroke:1px #000;paint-order:stroke fill;text-shadow:-100px -4px 12px rgba(0,0,0,.25)}
${S} .vv-story-title span{display:block}
${S} .vv-story-title span+span{margin-left:65px}
${S} .vv-story-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:100px}
${S} .vv-tl{position:relative;width:100%;margin-top:50px}
${S} .vv-tl::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:#BDBDBD}
${S} .vv-tl-item{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 60px minmax(0,1fr);column-gap:20px;align-items:center;margin-bottom:40px;--yc:var(--vv-blue)}
${S} .vv-tl-item.g1{--yc:var(--vv-green)}
${S} .vv-tl-year{grid-column:1/-1;display:flex;justify-content:center}
${S} .vv-tl-year:not(:empty){margin-bottom:20px}
${S} .vv-tl-year span{position:relative;padding:4px 18px;border:2px solid var(--yc);border-radius:6px;background:var(--vv-page);font:700 20px/1.3 'Fira Sans',sans-serif;color:var(--vv-ink)}
${S} .vv-tl-dot{grid-column:2;grid-row:2;display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;color:#fff}
${S} .vv-tl-dot svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
${S} .vv-tl-item.is-left .vv-tl-dot{background:var(--vv-blue)}
${S} .vv-tl-item.is-right .vv-tl-dot{background:var(--vv-green-900)}
${S} .vv-tl-meta{grid-row:2;display:flex;flex-direction:column;gap:2px}
${S} .vv-tl-meta b{font-size:16px;font-weight:700}
${S} .vv-tl-meta span{font-size:14px}
${S} .vv-tl-item.is-left .vv-tl-meta{grid-column:3;text-align:left}
${S} .vv-tl-item.is-left .vv-tl-meta b{color:var(--vv-blue-900)}
${S} .vv-tl-item.is-right .vv-tl-meta{grid-column:1;text-align:right}
${S} .vv-tl-item.is-right .vv-tl-meta b{color:var(--vv-green-900)}
${S} .vv-tl-card{position:relative;grid-row:2;width:100%;max-width:380px;padding:40px 16px;border:2px solid var(--vv-blue);border-radius:10px;background:var(--vv-page);text-align:center}
${S} .vv-tl-item.is-left .vv-tl-card{grid-column:1;justify-self:end}
${S} .vv-tl-item.is-right .vv-tl-card{grid-column:3;justify-self:start;border-color:var(--vv-green)}
${S} .vv-tl-item.is-left.is-first .vv-tl-card{top:-55px}
${S} .vv-tl-card h3{margin-bottom:16px;font-size:30px;font-weight:600}
${S} .vv-tl-card p{font-size:14px;line-height:1.5;text-align:left}

/* acomodações */
${S} .vv-rooms{background:var(--vv-page)}
${S} .vv-rooms-in{width:min(1200px,100%);margin:0 auto;padding:0 50px 36px}
${S} .vv-sec-title{margin:calc(90px + 5vh) 0 5vh;font-size:clamp(34px,8vw,48px);text-align:center}
${S} .vv-room-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:60px}
${S} .vv-room{display:flex;flex-direction:column;width:min(300px,100%);height:400px;overflow:hidden;border:1px solid #000;border-radius:12px;background:var(--vv-card-blue);color:#fff;transition:box-shadow .3s}
${S} .vv-room:nth-child(even){background:var(--vv-card-green)}
${S} .vv-room:nth-child(odd):hover{box-shadow:0 0 20px 2px var(--vv-blue-glow)}
${S} .vv-room:nth-child(even):hover{box-shadow:0 0 20px 2px var(--vv-green)}
${S} .vv-room-img{width:100%;height:195px;flex:none;object-fit:cover;border-radius:12px 12px 0 0}
${S} .vv-room-body{display:flex;flex:1;flex-direction:column;justify-content:space-between;gap:10px;padding:20px 12px;text-align:center}
${S} .vv-room-body h3{font-size:20px;font-weight:600;color:#fff}
${S} .vv-room-body p{font-size:14px;line-height:1.35;color:#CECECE}
${S} .vv-room-actions{display:flex;justify-content:center;gap:10px}
${S} .vv-room-actions .vv-btn{padding:8px 20px;font-size:15px}

/* experiências */
${S} .vv-exp{padding:65px;background:linear-gradient(180deg,var(--vv-page) 0%,var(--vv-sky) 100%)}
${S} .vv-exp-in{display:flex;flex-direction:column;align-items:center}
${S} .vv-exp .vv-sec-title{margin:0 0 60px}
${S} .vv-exp-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;width:min(1200px,100%)}
${S} .vv-xc{display:flex;width:min(540px,100%);height:300px;overflow:hidden;border-radius:12px;color:#fff}
${S} .vv-xc-0{background:var(--vv-exp-green);--xb:var(--vv-green)}
${S} .vv-xc-1{background:var(--vv-card-blue);--xb:var(--vv-blue)}
${S} .vv-xc-2{background:#fff;color:#000;--xb:var(--vv-blue)}
${S} .vv-xc-img{width:50%;height:100%;flex:none;object-fit:cover}
${S} .vv-xc-body{display:flex;width:50%;flex-direction:column;justify-content:center;gap:12px;padding:0 20px}
${S} .vv-xc-body h3{font-size:20px;font-weight:600;color:inherit}
${S} .vv-xc-body p{font-size:16px;font-weight:400;line-height:1.4}
${S} .vv-xc-actions{display:flex;flex-wrap:wrap;gap:8px}
${S} .vv-xc-btn{display:inline-flex;align-items:center;gap:6px;width:fit-content;padding:6px;border:0;border-radius:6px;background:var(--xb);color:#fff;font:400 16px/1.3 'Fira Sans',sans-serif;cursor:pointer;transition:filter .3s}
${S} .vv-xc-btn:hover{filter:brightness(.9)}
${S} .vv-xc-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
${S} .vv-xc-extra{background:var(--vv-green)}
${S} .vv-xc-solid{position:relative;flex-direction:column;justify-content:center;gap:12px;width:min(386px,100%);padding:0 60px;background:#fff;color:#000}
${S} .vv-xc-solid::before,${S} .vv-xc-solid::after{content:"";position:absolute;width:3px;height:300px;background:linear-gradient(180deg,var(--vv-green),var(--vv-blue));transform:rotate(-15deg)}
${S} .vv-xc-solid::before{left:18px;bottom:-110px}
${S} .vv-xc-solid::after{right:18px;top:-110px}
${S} .vv-xc-solid h3{font-size:20px;font-weight:700;color:#000}
${S} .vv-xc-solid p{font-size:16px;text-align:left}

/* missão, visão e valores */
${S} .vv-values{display:flex;align-items:flex-start;justify-content:center;gap:100px;padding:80px 0;background:linear-gradient(180deg,var(--vv-sky) 0%,#4DA5DD 100%)}
${S} .vv-values-art{position:sticky;top:20%;flex:none;width:240px}
${S} .vv-values-art.is-right{margin-top:160px}
${S} .vv-art{display:block;width:100%;height:auto}
${S} .vv-values-col{width:min(578px,100%)}
${S} .vv-vcard{padding:40px;border-radius:12px;background:linear-gradient(120deg,#254611 0%,#143346 100%);color:#fff}
${S} .vv-vcard h2{margin-bottom:16px;font-size:clamp(30px,10vw,48px);font-weight:700;color:#fff}
${S} .vv-vcard p{font-size:clamp(20px,4vw,32px);line-height:1.25;font-family:'Josefin Sans',sans-serif}
${S} .vv-vcard.a0{text-align:left}
${S} .vv-vcard.a1{text-align:right}
${S} .vv-vcard.a2{text-align:center}
${S} .vv-hr1,${S} .vv-hr0{height:3px;margin:58px 0;border:0}
${S} .vv-hr1{background:var(--vv-green-light)}
${S} .vv-hr0{background:#17618F}

/* venha nos visitar */
${S} .vv-visit{padding:100px;background:linear-gradient(180deg,#4DA5DD 0%,#226FA0 100%)}
${S} .vv-visit-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:60px}
${S} .vv-vtitle{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .vv-vphotos{display:flex;align-items:stretch;gap:12px;height:575px}
${S} .vv-vphoto{position:relative;display:flex;align-items:center;justify-content:center;width:200px;height:300px;overflow:hidden;border-radius:12px;align-self:flex-start}
${S} .vv-vphoto:nth-child(2){align-self:center}
${S} .vv-vphoto:nth-child(3){align-self:flex-end}
${S} .vv-vphoto img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${S} .vv-vphoto span{position:relative;font:700 48px/1 'Josefin Sans',sans-serif;color:#fff;text-shadow:0 0 20px #000}
${S} .vv-map{display:block;width:600px;max-width:100%;height:450px;border:0;border-radius:30px;background:#cfe3f1}

/* rodapé */
${S} .vv-foot{display:flex;flex-direction:column;justify-content:center;gap:44px;min-height:50vh;padding:34px;background:linear-gradient(180deg,#226FA0 0%,#000 100%);color:#fff;text-align:center;font-family:'Josefin Sans',sans-serif}
${S} .vv-foot-in{display:grid;align-items:center;grid-template-columns:1fr auto 1fr;gap:40px;width:min(1200px,100%);margin:0 auto}
${S} .vv-foot-col{display:flex;flex-direction:column;align-items:center;gap:24px}
${S} .vv-foot-col h2{font-size:clamp(12px,4vw,16px);font-weight:700;letter-spacing:.04em;color:#fff}
${S} .vv-foot-icons{display:flex;justify-content:center;gap:20px}
${S} .vv-foot-icons a{display:flex;color:#fff;transition:opacity .3s}
${S} .vv-foot-icons a:hover{opacity:.75}
${S} .vv-foot-icons svg{width:30px;height:30px}
${S} .vv-foot-icons svg[viewBox]:not([fill]){fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
${S} .vv-foot-logo{width:200px;margin:0 auto}
${S} .vv-foot-logo img{width:100%;height:auto}
${S} .vv-copy{font-size:14px;opacity:.9}
${S} .vv-copy a{text-decoration:underline}

/* botão flutuante do WhatsApp */
${S} .vv-float{position:fixed;right:30px;bottom:30px;z-index:9;display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:var(--vv-green);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.35);transition:background-color .3s}
${S} .vv-float:hover{background:var(--vv-green-900)}
${S} .vv-float:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 6px var(--vv-blue-900)}
${S} .vv-float svg{width:32px;height:32px}
${S} .vv-float.is-edit{position:sticky;margin:0 30px 30px auto}

/* modal de fotos (popover nativo) */
${S} .vv-modal{width:min(800px,calc(100vw - 24px));max-height:calc(100dvh - 24px);padding:0;border:0;border-radius:20px;background:var(--vv-dark);color:#fff;overflow:auto}
${S} .vv-modal::backdrop{background:rgba(0,0,0,.6)}
${S} .vv-modal.is-static{position:static;display:block;margin:24px auto}
${S} .vv-g{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 274px;align-items:center;gap:20px;padding:20px}
${S} .vv-g-media{position:relative;width:450px;max-width:100%;height:min(600px,calc(100dvh - 80px))}
${S} .vv-g-stage{position:relative;width:100%;height:100%;overflow:hidden;border-radius:12px;background:#000}
${S} .vv-g-slide{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;visibility:hidden;transition:opacity .5s ease,visibility 0s linear .5s}
${S} .vv-g-slide.on{opacity:1;visibility:visible;transition:opacity .5s ease}
${S} .is-contain .vv-g-slide{object-fit:contain}
${S} .vv-g-thumbs{position:absolute;left:0;right:0;bottom:12px;z-index:2;display:flex;justify-content:center;gap:8px}
${S} .vv-g-thumb{width:46px;height:56px;padding:0;overflow:hidden;border:0;border-radius:8px;background:#000;cursor:pointer;filter:brightness(.5);transition:filter .3s}
${S} .vv-g-thumb.on,${S} .vv-g-thumb:hover{filter:none}
${S} .vv-g-thumb.off{display:none}
${S} .vv-g-thumb img{width:100%;height:100%;object-fit:cover}
${S} .vv-g-arrow{position:absolute;top:50%;z-index:2;display:flex;align-items:center;justify-content:center;width:40px;height:40px;margin-top:-20px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.35);color:#fff;cursor:pointer;opacity:.7;transition:opacity .2s}
${S} .vv-g-arrow:hover{opacity:1}
${S} .vv-g-arrow.prev{left:8px}
${S} .vv-g-arrow.next{right:8px}
${S} .vv-g-arrow svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
${S} .vv-modal:not([data-vv-ready]) .vv-g-arrow,${S} .vv-modal:not([data-vv-ready]) .vv-g-thumbs{display:none}
${S} .vv-g-fs{position:absolute;top:8px;left:8px;z-index:3;display:none;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:0;border-radius:8px;background:rgba(0,0,0,.35);color:#fff;cursor:pointer}
${S} .vv-g-fs svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
${S} .vv-g-x{position:absolute;top:16px;right:20px;z-index:4;display:flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:50%;background:none;color:#fff;cursor:pointer}
${S} .vv-g-x svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
${S} .vv-g-info{display:flex;flex-direction:column;justify-content:center;gap:28px;width:274px}
${S} .vv-g-info h3{font-size:36px;font-weight:600;color:#fff}
${S} .vv-g-info p{font-size:16px;line-height:1.45}
${S} .vv-g-info .vv-btn{align-self:flex-start}

/* páginas internas */
${S} .vv-ptitle{padding:150px 20px 56px;background:var(--vv-nav);color:#fff;text-align:center}
${S} .vv-ptitle h1{font-size:clamp(34px,6vw,52px);color:#fff}
${S} .vv-nf{position:relative;display:flex;align-items:center;justify-content:center;min-height:70vh;padding:150px 20px 80px;overflow:hidden;background:var(--vv-nav);color:#fff;text-align:center}
${S} .vv-nf-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.5)}
${S} .vv-nf-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:24px;max-width:560px}
${S} .vv-nf-in h1{font-size:clamp(34px,6vw,52px);color:#fff}
${S} .vv-nf-in p{font-size:18px}

${upTo(1280, w1280)}
${upTo(1100, w1100)}
${upTo(930, w930)}
${upTo(892, w892)}
${upTo(840, w840)}
${roomsWide}
${upTo(768, w768)}
${upTo(700, w700)}
${upTo(600, w600)}
${upTo(425, w425)}
@media (max-width:375px){${w375(S)}}
${w375(N)}
${theme.darkMode === "no" ? "" : `@media (prefers-color-scheme:dark){${dark(S)}}`}
`;
