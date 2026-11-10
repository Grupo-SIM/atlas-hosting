/**
 * Variante `gatilhos` (escopo `.sb-gm`): página de vendas do e-book "Gatilhos Mentais"
 * (ebookgatilhosmentais.centraldomarketing.com — WordPress + Hello Elementor 4.4 + Jeg Elementor Kit, modelo Canvas,
 * página 81, kit 10). Breakpoints do original: tablet ≤ 1024, celular ≤ 767, repetidos sob `.sb-narrow` (no preview
 * estreito do editor tablet e celular valem os dois). Container 1290px.
 *
 * Tokens do tema: `accent` (ciano `#2EDAF1`: destaques, bordas, ícones), `bg` (`#000C14`), `card` (`#01141D`, fundo dos
 * cartões), `glow` (`#00E1FF24`, brilho dos cartões), `line` (`#FFFFFF29`, bordas), `muted` (`#FFFFFF70`, texto dos
 * cartões). Fontes: Orbitron (títulos, `fontHeading`) e Inter 300 (corpo); a oferta usa Montserrat e o rodapé Poppins
 * (`GATILHOS_EXTRA_FONTS`). A oferta, o FAQ e o rodapé são os blocos comuns `ebook*` (`renderer/ebook.ts`).
 *
 * Os efeitos de hover dos cartões (sobe e preenche da esquerda; véu que sobe de baixo) são CSS da variante: pseudo-
 * elementos que crescem de `width:0` / `height:0`, como o "hover-from-left"/"hover-from-arise" do Jeg.
 */
export const isGatilhos = (theme: Record<string, string>) =>
  theme.variant === "gatilhos";

/** Fontes fixas da variante (nunca texto do usuário). */
export const GATILHOS_EXTRA_FONTS = [
  "Orbitron",
  "Inter",
  "Montserrat",
  "Poppins",
];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function gatilhosVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--gm-card": safe(theme.card, "#01141D"),
    "--gm-glow": safe(theme.glow, "#00E1FF24"),
    "--gm-line": safe(theme.line, "#FFFFFF29"),
    "--gm-muted": safe(theme.muted, "#FFFFFF70"),
  };
}

const S = ".sb-gm";

/** Tablet (≤ 1024px). `x` = seletor da raiz (`.sb-gm` ou `.sb-gm.sb-narrow`). */
const tablet = (x: string) => `
${x} .gm-h1{font-size:30px}
${x} .gm-hero{padding:100px 10px 0;min-height:69vh}
${x} .gm-hero::before{background:var(--gm-bg-t) center/contain repeat-x}
${x} .gm-hero::after{background:radial-gradient(at center,transparent 53%,#000 96%)}
${x} .gm-hero-in{padding:0}
${x} .gm-hero-l{flex-basis:42%}
${x} .gm-hero-l{padding-bottom:60px}
${x} .gm-hero .gm-h1{margin:0 10px 0 0}
${x} .gm-acts{margin-top:24px}
${x} .gm-hero .gm-btn{padding:14px 24px;font-size:14px}
${x} .gm-count{margin:0 0 0 20px}
${x} .gm-count-num{font-size:22px}
${x} .gm-count-cap{font-size:13px}
${x} .gm-hero-r{align-self:center;margin-top:0;padding-bottom:60px}
${x} .gm-vlink{font-size:14px}
${x} .gm-hero .gm-p{font-size:14px}
${x} .gm-features{padding:100px 20px 40px}
${x} .gm-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 15px}
${x} .gm-trust{padding:80px 20px 0}
${x} .gm-trust-in{grid-template-columns:1fr;gap:40px}
${x} .gm-trust .gm-h3{text-align:center}
${x} .gm-trust .gm-b{display:inline}
${x} .gm-split{padding:40px 20px 50px}
${x} .gm-split-in{flex-direction:column-reverse;gap:30px}
${x} .gm-split-img,${x} .gm-split-txt{flex:none;width:100%}
${x} .gm-split-txt{padding:0}
${x} .gm-triggers{padding:80px 0}
${x} .gm-trig-in{flex-direction:column;gap:40px}
${x} .gm-trig-l{position:static;flex:none;width:100%;padding:0}
${x} .gm-tcard .gm-tico{width:56px;height:56px;margin-bottom:120px}
${x} .gm-bonus{padding:40px 20px 80px}
${x} .gm-bbox{padding:60px 30px}
${x} .gm-bsub{padding:0 5%}
${x} .gm-bcols{grid-template-columns:1fr;gap:30px;margin-top:40px}
${x} .gm-bcol{padding:0}
${x} .gm-bcol .gm-bimg{margin-top:0!important}
${x} .gm-reviews{padding:40px 10px 80px}
${x} .gm-car{--si-pv:var(--si-t)}
${x} .gm-rtitle{text-align:center}
${x} .gm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .gm-stat:nth-child(odd){border-left:0}
${x} .gm-stat:nth-child(n+3){border-top:1px solid var(--gm-line)}
${x} .gm-sechead{padding:var(--gm-pt-t,60px) 10px var(--gm-pb,0)}
${x} .gm-sechead .gm-lead{max-width:none;padding:0 5%}
${x} .gm-guarantee{padding:60px 20px}
${x} .gm-g-in{flex-direction:column-reverse;gap:30px;text-align:center}
${x} .gm-g-txt,${x} .gm-g-img{flex:none;width:100%}
${x} .gm-g-txt .gm-p{margin-inline:auto}
`;

/** Celular (≤ 767px). */
const mobile = (x: string) => `
${x} .gm-h1{font-size:32px}
${x} .gm-h2{font-size:26px}
${x} .gm-h3{font-size:20px}
${x} .gm-sec{font-size:14px}
${x} .gm-hero{padding:36px 10px 0;min-height:43vh}
${x} .gm-hero-in{flex-direction:column;align-items:stretch}
${x} .gm-hero-l,${x} .gm-hero-r,${x} .gm-acts{display:contents}
${x} .gm-hero-c{flex:none;order:3;min-height:240px}
${x} .gm-hero .gm-h1{order:1;margin:0;text-align:left}
${x} .gm-hero .gm-count{order:2;margin:20px 0 0 20px;text-align:left}
${x} .gm-hero .gm-btn{order:4;align-self:center;margin:20px 0 0;padding:20px 32px;font-size:16px}
${x} .gm-vrow{order:5;justify-content:center;margin:30px 0 20px}
${x} .gm-hero .gm-p{order:6;margin:0 0 50px;text-align:center;font-size:14px}
${x} .gm-count-num{font-size:28px}
${x} .gm-count-cap{font-size:16px}
${x} .gm-vlink{font-size:16px}
${x} .gm-hero::before{background:var(--gm-bg-m) center/contain no-repeat}
${x} .gm-cards{grid-template-columns:1fr;gap:20px}
${x} .gm-card h4{font-size:18px}
${x} .gm-trust-items{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 10px}
${x} .gm-trig-grid{grid-template-columns:1fr}
${x} .gm-tcard .gm-tico{margin-bottom:70px}
${x} .gm-tcard{min-height:0}
${x} .gm-tcard:nth-child(2){order:3}
${x} .gm-tcard:nth-child(3){order:2}
${x} .gm-hero .gm-p{font-size:14px}
${x} .gm-bbox{padding:40px 20px}
${x} .gm-bcard{margin-inline:16px;padding:24px}
${x} .gm-car{--si-pv:var(--si-m);--si-gap:10px!important}
${x} .gm-review{font-size:16px}
${x} .gm-review blockquote{font-size:16px}
${x} .gm-stat-num{font-size:32px}
`;

export const gatilhosCss = `
html:has(${S}){scroll-behavior:smooth}
${S}{font-size:16px;font-weight:300;line-height:1.5}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4{margin:0;color:#fff;font-family:var(--sb-font-heading);font-weight:600;text-transform:capitalize}
${S} p{margin:0}
${S} .gm-sec{position:relative}
${S} .gm-in{position:relative;z-index:1;max-width:1290px;margin:0 auto}
${S} .gm-h1{font-size:54px;line-height:1.3;letter-spacing:1px}
${S} .gm-h2{font-size:40px;line-height:1.3;letter-spacing:1px}
${S} .gm-h3{font-size:24px;line-height:1.2}
${S} .gm-a{color:#fff}
${S} .gm-b{display:inline-block;color:var(--sb-accent)}
${S} .gm-inv .gm-a{color:var(--sb-accent)}
${S} .gm-inv .gm-b{color:#fff}
${S} .gm-p{color:#FFFFFFBA}
${S} .gm-lead{max-width:671px;margin:21px auto 0;color:#FFFFFFB3;text-align:center}

/* botão: pílula transparente com brilho interno; no hover enche de ciano */
${S} .gm-btn{display:inline-block;padding:20px 32px;border:1px solid var(--sb-accent);border-radius:50px;background:transparent;box-shadow:inset 0 0 24px rgba(46,218,241,.49);color:#fff;font-family:var(--sb-font-heading);font-size:16px;font-weight:500;line-height:1;letter-spacing:1px;text-align:center;text-transform:capitalize;transition:background .3s,color .3s}
${S} .gm-btn:hover,${S} .gm-btn:focus{background:var(--sb-accent);color:var(--gm-card)}
${S} .gm-btn.sm{padding:18px 32px;font-size:14px}
${S} .gm-btn.md{padding:18px 32px}

/* hero */
${S} .gm-hero{z-index:1;overflow:hidden;padding:200px 0 0;background:#000}
${S} .gm-hero::before,${S} .gm-hero::after{content:"";position:absolute;inset:0;pointer-events:none}
${S} .gm-hero::before{background:var(--gm-bg) center/contain repeat-x}
${S} .gm-hero::after{background:radial-gradient(at center,transparent 51%,#000 73%)}
${S} .gm-hero-in{position:relative;z-index:1;display:flex;box-sizing:border-box;max-width:1290px;margin:0 auto;padding:0 10px}
${S} .gm-hero-l,${S} .gm-hero-c,${S} .gm-hero-r{box-sizing:border-box;min-width:0}
${S} .gm-hero-l{flex:0 0 42%}
${S} .gm-hero-c{flex:0 0 33%}
${S} .gm-hero-r{flex:0 0 25%;align-self:flex-start;margin-top:121px}
${S} .gm-hero-l{padding:0 0 100px}
${S} .gm-hero .gm-h1{margin:8px 20px 0 0}
${S} .gm-acts{display:flex;align-items:flex-start;margin-top:41px}
${S} .gm-count{margin:-6px 0 0 40px}
${S} .gm-count-num{display:block;font-family:var(--sb-font-heading);font-size:28px;font-weight:600;line-height:1.2;color:#fff}
${S} .gm-count-cap{display:block;color:#FFFFFF70}
${S} .gm-vrow{display:flex;align-items:center;gap:20px;margin-bottom:30px}
${S} .gm-play{display:inline-flex;flex:none;align-items:center;justify-content:center;width:60px;height:60px;border:1px solid var(--sb-accent);border-radius:50%;box-shadow:inset 0 0 24px rgba(46,218,241,.49);color:#fff;transition:background .3s}
${S} .gm-play:hover,${S} .gm-play:focus{background:radial-gradient(at top left,var(--sb-accent),var(--sb-accent))}
${S} .gm-play svg{width:18px;height:18px;margin-left:3px;fill:currentColor}
${S} .gm-vlink{color:#fff;font-family:var(--sb-font-heading);font-size:16px;line-height:1;font-weight:500;letter-spacing:1px;text-transform:uppercase}
${S} .gm-hero .gm-p{font-size:18px}

/* recursos */
${S} .gm-features{padding:140px 0 131px;background:linear-gradient(180deg,#000 14%,transparent 50%)}
${S} .gm-features .gm-in{box-sizing:border-box;padding:0 10px}
${S} .gm-features .gm-h2{margin-top:8px;text-align:center}
${S} .gm-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:74px}
${S} .gm-card{display:flex}
${S} .gm-card-in{position:relative;flex:1;overflow:hidden;padding:40px;border:1px solid var(--gm-line);border-radius:10px;background:radial-gradient(at top right,var(--gm-glow) 0%,var(--gm-card) 50%);text-align:left;transition:translate .4s ease}
${S} .gm-card-in::before{content:"";position:absolute;inset:0 auto 0 0;width:0;background:#00E1FF30;transition:width .4s ease}
${S} .gm-card:hover .gm-card-in{translate:0 -20px}
${S} .gm-card:hover .gm-card-in::before{width:100%}
${S} .gm-card-in>*{position:relative}
${S} .gm-ico{display:inline-flex;padding:16px;border-radius:50%;background:var(--sb-accent);color:var(--gm-card)}
${S} .gm-ico svg{width:32px;height:32px}
${S} .gm-card h4{margin:20px 0 16px;font-size:20px;font-weight:500;line-height:1.2}
${S} .gm-card p{color:var(--gm-muted)}

/* faixa de confiança */
${S} .gm-trust{box-sizing:border-box;padding:0 10px}
${S} .gm-trust-in{max-width:1270px;display:grid;grid-template-columns:20% minmax(0,1fr);align-items:center;gap:20px;padding:84px 0 86px;border-top:1px solid var(--gm-line)}
${S} .gm-trust .gm-b{display:block}
${S} .gm-trust-items{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
${S} .gm-trust-item{text-align:center}
${S} .gm-trust-ico{display:block;width:55px;height:55px;margin:0 auto 18px;color:var(--sb-accent)}
${S} .gm-trust-ico svg{width:100%;height:100%;stroke-width:1.5}
${S} .gm-trust-label{color:#fff;font-family:var(--sb-font-heading);font-size:15px;font-weight:600;line-height:1.3;text-transform:capitalize}

/* imagem + texto */
${S} .gm-split{padding:134px 0 130px}
${S} .gm-split-in{display:flex;box-sizing:border-box;align-items:center;padding:0 10px}
${S} .gm-split-img{flex:0 0 45%;min-width:0}
${S} .gm-split-img img{display:block;width:100%;height:auto;border-radius:10px}
${S} .gm-split-txt{flex:1;box-sizing:border-box;min-width:0;padding-left:80px}
${S} .gm-split-txt .gm-p{max-width:599px;margin:40px 0 34px}

/* gatilhos */
${S} .gm-triggers{padding:80px 0 140px}
${S} .gm-trig-in{display:flex;box-sizing:border-box;align-items:flex-start;gap:30px;padding:0 10px}
${S} .gm-trig-l .gm-h2{margin-top:8px}
${S} .gm-lc .gm-a:last-child{text-transform:none}
${S} .gm-trig-l{position:sticky;top:var(--sb-sticky-top,0px);flex:0 0 min(410px,33%);box-sizing:border-box;height:fit-content;padding-right:0}
${S} .gm-triggers.is-edit .gm-trig-l{position:static}
${S} .gm-trig-l .gm-p{max-width:320px;margin:21px 0 55px}
${S} .gm-trig-grid{display:grid;flex:1;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 20px;min-width:0;margin-right:-10px;padding-bottom:30px}
${S} .gm-tcard{position:relative;display:flex;flex-direction:column;justify-content:flex-start;box-sizing:border-box;min-height:476px;overflow:hidden;margin:10px;padding:80px 30px 20px;border-radius:10px;background:var(--gm-timg,none) center/cover no-repeat,var(--gm-card);transition:padding .4s ease}
${S} .gm-tcard::before,${S} .gm-tcard::after{content:"";position:absolute;inset:0;pointer-events:none}
${S} .gm-tcard::before{background:#0F133329}
${S} .gm-tcard::after{top:auto;height:0;background:#03222CF7;transition:height .4s ease}
${S} .gm-tcard>*{position:relative;z-index:1}
${S} .gm-tcard .gm-tico{display:block;width:65px;height:65px;margin-bottom:190px;color:transparent;transition:color .4s ease}
${S} .gm-tico svg{width:100%;height:100%;stroke-width:1.2}
${S} .gm-tcard h4{font-size:24px;line-height:1.2}
${S} .gm-tcard p{margin-top:10px;color:#fff}
${S} .gm-tcard:hover{padding:40px 30px 20px}
${S} .gm-tcard:hover::after{height:100%}
${S} .gm-tcard:hover .gm-tico{color:var(--sb-accent)}
${S} .gm-more{display:inline-flex;align-items:center;gap:8px;line-height:1;color:var(--sb-accent);font-family:var(--sb-font-heading);font-size:14px;font-weight:500;letter-spacing:1px;text-transform:capitalize}
${S} .gm-more svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
${S} .gm-tcard .gm-more{margin-top:20px;visibility:hidden;opacity:0;transition:opacity .4s ease}
${S} .gm-tcard:hover .gm-more,${S} .gm-tcard .gm-more:focus{visibility:visible;opacity:1}

/* bônus */
${S} .gm-bonus{padding:40px 0 100px}
${S} .gm-bbox{box-sizing:border-box;max-width:1290px;padding:100px 80px;border:1px solid var(--gm-line);border-radius:20px;background:radial-gradient(at center,var(--gm-glow) 0%,var(--gm-card) 70%)}
${S} .gm-bbox .gm-h2{text-align:center}
${S} .gm-bsub{max-width:none;margin:21px 0 0;padding:0 26%;color:#FFFFFFC9;text-align:center}
${S} .gm-bcols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch;margin-top:74px}
${S} .gm-bcol{display:flex;flex-direction:column;padding:0 0 0 20px}
${S} .gm-bcol:nth-child(2) .gm-bimg{margin-top:var(--gm-stairs,163px)}
${S} .gm-bcol:nth-child(3) .gm-bimg{margin-top:var(--gm-stairs3,24px)}
${S} .gm-bimg{display:block;width:100%;aspect-ratio:356/242;object-fit:cover;border-radius:10px}
${S} .gm-bcard{position:relative;z-index:1;display:flex;flex:1;flex-direction:column;margin:-59px 41px 0;padding:30px 50px;border:1px solid var(--gm-line);border-radius:10px;background:var(--gm-card);text-align:center}
${S} .gm-bcard .gm-more{justify-content:center;margin-top:auto}
${S} .gm-bcard h4{font-size:24px;line-height:1.2}
${S} .gm-bcard p{margin:12px 0 20px;color:var(--gm-muted)}
${S} .gm-bcta{margin-top:82px;text-align:center}

/* reviews + números */
${S} .gm-reviews{padding:80px 0 100px}
${S} .gm-rtitle{margin-bottom:40px;text-align:left}
${S} .gm-car{position:relative;--si-pv:var(--si-d)}
${S} .gm-reviews .gm-in{box-sizing:border-box;padding:0 10px}
${S} .gm-car .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .gm-car .si-car-view::-webkit-scrollbar{display:none}
${S} .gm-car .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .gm-car .si-slide{display:flex;flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S}.sb-js .gm-car .si-car-view{overflow:hidden}
${S} .gm-car .si-car-arrow,${S} .gm-car .si-car-dots{display:none}
${S} .gm-review{position:relative;box-sizing:border-box;display:flex;flex:1;flex-direction:column;justify-content:space-between;margin:0;padding:100px 40px 30px;border:1px solid var(--gm-line);border-radius:10px;background:radial-gradient(at top right,var(--gm-glow) 0%,var(--gm-card) 50%)}
${S} .gm-quote{position:absolute;top:36px;left:40px;width:48px;height:48px;fill:var(--sb-accent)}
${S} .gm-review blockquote{margin:0 0 30px;color:var(--gm-muted);font-size:18px;font-style:italic;line-height:1.5}
${S} .gm-review figcaption{display:flex;align-items:center;gap:16px}
${S} .gm-avatar{flex:none;width:60px;height:60px;border-radius:50%;object-fit:cover}
${S} .gm-review figcaption b{color:#fff;font-family:var(--sb-font-heading);font-size:16px;font-weight:500}
${S} .gm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin-top:60px}
${S} .gm-stat{display:flex;align-items:flex-start;justify-content:center;padding:10px 20px;border-left:1px solid var(--gm-line)}
${S} .gm-stat:first-child{border-left:0}
${S} .gm-stat-ico{flex:none;width:50px;height:50px;margin:8px 20px 0 0;color:var(--sb-accent)}
${S} .gm-stat-ico svg{width:100%;height:100%;stroke-width:1.2}
${S} .gm-stat-num{display:block;color:#fff;font-family:var(--sb-font-heading);font-size:38px;font-weight:600;line-height:1.3}
${S} .gm-stat-cap{display:block;color:var(--gm-muted)}

/* título da oferta */
${S} .gm-sechead{padding:var(--gm-pt,100px) 20px var(--gm-pb,50px)}
${S} .gm-sechead .gm-h2{text-align:center}
${S} .gm-sechead .gm-lead{max-width:none;padding:0 27%;color:#FFFFFFC4}

/* garantia */
${S} .gm-guarantee{overflow:hidden;padding:54px 0 42px}
${S} .gm-guarantee::before{content:"";position:absolute;inset:0;background:radial-gradient(at center,var(--sb-accent) 0%,#021420 94%);opacity:.18;pointer-events:none}
${S} .gm-g-in{display:flex;align-items:center}
${S} .gm-g-txt,${S} .gm-g-img{flex:0 0 50%;box-sizing:border-box;min-width:0}
${S} .gm-g-txt{padding:0 40px}
${S} .gm-g-txt .gm-p{max-width:550px;margin:21px 0 45px;color:#fff}
${S} .gm-g-img{text-align:center}
${S} .gm-g-img img{display:inline-block;width:50%;height:auto}

/* ícones de traço */
${S} .gm-ico svg,${S} .gm-tico svg,${S} .gm-trust-ico svg,${S} .gm-stat-ico svg{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}
${S} .gm-ico svg{stroke-width:1.6}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}${mobile(`${S}.sb-narrow`)}
@media (prefers-reduced-motion:reduce){
${S} .gm-card-in,${S} .gm-card-in::before,${S} .gm-tcard,${S} .gm-tcard::after,${S} .gm-tcard .gm-more{transition:none}
}
`;
