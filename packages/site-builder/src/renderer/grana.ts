/**
 * Variante `grana` (escopo `.sb-gh`): página de vendas "Grana na Hora" (grananahora.centraldomarketing.com — WordPress +
 * Hello Elementor + Elementor Pro, página 162, kit 9, modelo Canvas). Medidas tiradas do site renderizado (Playwright,
 * 1440/1024/820/390). Breakpoints do original: tablet ≤ 1024, celular ≤ 767, repetidos sob `.sb-narrow`. Container 1350px.
 *
 * Tokens do tema: `accent` (roxo `#993DE1`: sobretítulos, palavra girando, bolinha ativa, início do degradê do botão),
 * `bg` (`#0C0F18`), `fg` (`#AAA8B1`, texto), `card` (`#10131E`, fundo de cartão/coluna), mais `blue` (`#3D49E1`, fim do
 * degradê do botão), `title` (`#F3F4F6`), `line` (`#2A2E36`), `icon` (`#694BFF`, hover `#B12CFF`), `check` (`#B557FF`) e
 * `answer` (`#CCCCCC`, resposta do FAQ). Fontes: Plus Jakarta Sans (títulos) e DM Sans (corpo, botões) — `GRANA_EXTRA_FONTS`.
 * Rodapé é o bloco comum `ebookFooter`.
 *
 * Efeitos genéricos usados aqui (CSS base em `styles.ts`, runtime em `fx-runtime.ts`): palavra girando
 * (`.sb-rot`, `[data-sb-rotate]`), carrossel em fade (`SiCar transition="fade"`) e parallax só no desktop
 * (`Fx.parallaxScreens`). Específico da variante: troca de imagem no hover com crossfade (`.gh-tile`) e texto vazado
 * (`.gh-num`, `-webkit-text-stroke`).
 */
export const isGrana = (theme: Record<string, string>) =>
  theme.variant === "grana";

/** Fontes fixas da variante (nunca texto do usuário). */
export const GRANA_EXTRA_FONTS = ["Plus Jakarta Sans", "DM Sans"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function granaVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--gh-answer": safe(theme.answer, "#CCCCCC"),
    "--gh-blue": safe(theme.blue, "#3D49E1"),
    "--gh-check": safe(theme.check, "#B557FF"),
    "--gh-icon": safe(theme.icon, "#694BFF"),
    "--gh-line": safe(theme.line, "#2A2E36"),
    "--gh-title": safe(theme.title, "#F3F4F6"),
  };
}

const S = ".sb-gh";

const tablet = (x: string) => `
${x} .gh-h1{font-size:2.5em;line-height:1}
${x} .gh-h2{font-size:2.3em;line-height:1}
${x} .gh-hero{grid-template-columns:minmax(0,1fr);gap:20px}
${x} .gh-hero-copy{align-items:center;text-align:center}
${x} .gh-hero-title{font-size:3em;text-align:center}
${x} .gh-hero-p{width:100%}
${x} .gh-feat-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:40px 20px}
${x} .gh-map{grid-template-columns:minmax(0,1fr);gap:40px}
${x} .gh-ban{grid-template-columns:minmax(0,1fr)}
${x} .gh-ban-1{min-height:0}
${x} .gh-ban-box{width:100%;align-items:center;text-align:center}
${x} .gh-ban-3{align-items:center;text-align:center}
${x} .gh-step{gap:40px}
${x} .gh-step-card{min-height:550px}
${x} .gh-step-copy{padding:0}
${x} .gh-num{font-size:3em}
${x} .gh-bonus{grid-template-columns:minmax(0,1fr)}
${x} .gh-bonus-img{min-height:0;padding:80px 0}
${x} .gh-bonus-panel{padding:80px}
${x} .gh-offer-head{width:100%}
${x} .gh-offer-card{width:350px;max-width:100%;padding:40px 20px}
${x} .gh-offer-title{font-size:35px}
${x} .gh-offer-kicker{padding:0}
${x} .gh-offer-price{font-size:50px}
${x} .gh-test-car{width:100%}
${x} .gh-faq-head,${x} .gh-faq-list{width:100%}
`;

const mobile = (x: string) => `
${x} .gh-h1{font-size:2.3em}
${x} .gh-h2{font-size:2em;line-height:1}
${x} .gh-hero{min-height:10vh}
${x} .gh-hero-copy{padding:80px 20px 0}
${x} .gh-hero-title{font-size:2.5em}
${x} .gh-mosaic{display:none}
${x} .gh-feat-grid{grid-template-columns:minmax(0,1fr);gap:40px}
${x} .gh-map-slider{height:350px}
${x} .gh-map-copy .gh-h2{font-size:29px}
${x} .gh-ban-box{padding:80px 20px}
${x} .gh-ban-2{height:350px}
${x} .gh-ban-3{padding:80px 20px}
${x} .gh-step-card{min-height:350px}
${x} .gh-step{grid-template-columns:minmax(0,1fr)}
${x} .gh-step-copy{align-items:center;padding:0;text-align:center}
${x} .gh-num{font-size:2.5em}
${x} .gh-bonus-panel{padding:80px 20px}
${x} .gh-bonus-list{gap:60px}
${x} .gh-bonus-item{flex-direction:column;text-align:center}
${x} .gh-bthumb{flex:none;width:100%}
${x} .gh-bonus-txt{flex:none}
${x} .gh-bonus-side{flex:none;display:flex;flex-direction:column;align-items:center;text-align:center}
${x} .gh-offer-head .gh-h2{line-height:1.2}
${x} .gh-offer-lead{padding:0}
${x} .gh-offer-card{width:100%}
${x} .gh-offer-price{font-size:70px}
${x} .gh-test-car .si-car{padding:0 0 40px}
${x} .gh-test-car .si-car-arrow{display:none!important}
${x} .gh-acc-t{font-size:17px}
${x} .gh-acc-a{padding-bottom:0}
`;

export const granaCss = `
html:has(${S}){scroll-behavior:smooth}
${S}{font-family:'DM Sans',sans-serif;font-size:16px;font-weight:500;line-height:1.5;color:var(--sb-fg);background:var(--sb-bg)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5,${S} h6,${S} p,${S} figure,${S} ul{margin:0}
${S} .gh-h{color:var(--gh-title);font-family:'Plus Jakarta Sans',sans-serif;font-weight:700}
${S} .gh-h1{font-size:3em;line-height:1.1}
${S} .gh-h2{font-size:2.5em;line-height:1.1}
${S} .gh-h4{font-size:1.5em;line-height:1.2}
${S} .gh-eyebrow{color:var(--sb-accent);font-size:1em;font-weight:500;letter-spacing:1px;line-height:1.2;text-transform:uppercase}
${S} .gh-btn{position:relative;z-index:0;display:inline-block;box-sizing:border-box;overflow:hidden;padding:20px 40px;border-radius:10px;background:linear-gradient(90deg,var(--sb-accent) 0%,var(--gh-blue) 100%);color:#fff;font-family:'DM Sans',sans-serif;font-size:.9em;font-weight:700;letter-spacing:1px;line-height:1;text-align:center;text-decoration:none;text-transform:capitalize;transition:scale .3s}
${S} .gh-btn::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,var(--gh-blue) 0%,var(--sb-accent) 100%);opacity:0;transition:opacity .3s}
${S} .gh-btn:hover,${S} .gh-btn:focus-visible{scale:.9}
${S} .gh-btn:hover::before,${S} .gh-btn:focus-visible::before{opacity:1}
${S} .gh-btn.sm{padding:5px 10px;border-radius:10px;font-size:.7em}
${S} .gh-btn.lg{padding:20px;font-size:1.2em}
@media (prefers-reduced-motion:reduce){${S} .gh-btn,${S} .gh-btn::before{transition:none}}

/* acordeão (toggle do "O mapa" e FAQ): chevron à esquerda, vira para cima aberto */
${S} .gh-acc-item+.gh-acc-item{padding-top:21px}
${S} .gh-acc-item>summary{display:flex;align-items:flex-start;gap:24px;padding-bottom:20px;border-bottom:1px solid var(--gh-line);cursor:pointer;list-style:none}
${S} .gh-acc-item>summary::-webkit-details-marker{display:none}
${S} .gh-acc-ic{flex:none;width:20px;height:26px;fill:none;stroke:var(--gh-acc-ic,#fff);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;transition:transform .3s}
${S} .gh-acc-t{color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:1.35em;font-weight:700;line-height:1.2;transition:color .3s}
${S} .gh-acc-item[open]>summary .gh-acc-ic{stroke:var(--sb-accent);transform:rotate(-90deg)}
${S} .gh-acc-item[open]>summary .gh-acc-t{color:var(--sb-accent)}
${S} .gh-acc-a{padding:15px 0 0 44px;color:var(--gh-acc-a,var(--sb-fg))}
${S} .gh-faq .gh-acc-ic{--gh-acc-ic:var(--sb-accent)}
${S} .gh-faq .gh-acc-a{--gh-acc-a:var(--gh-answer);padding-bottom:20px}
@media (prefers-reduced-motion:reduce){${S} .gh-acc-ic,${S} .gh-acc-t{transition:none}}

/* hero */
${S} .gh-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,54fr) minmax(0,46fr);min-height:70vh;background:var(--sb-bg) var(--gh-bg,none) center/cover no-repeat}
${S} .gh-hero::before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,var(--sb-card) 0%,transparent 10%),linear-gradient(180deg,transparent 70%,var(--sb-bg) 100%);pointer-events:none}
${S} .gh-hero-copy{position:relative;z-index:2;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:20px;padding:120px}
${S} .gh-hero-title{box-sizing:border-box;padding:8px 0 16px;color:#fff;font-size:7em;line-height:1;text-align:left}
${S} .gh-hero-title .sb-rot{color:var(--gh-word,var(--sb-accent))}
${S} .gh-hero-p{width:80%;color:#fff;font-size:1.3em;letter-spacing:-.7px;line-height:1.5}
${S} .gh-mosaic{position:relative;z-index:1;display:flex;gap:40px;min-width:0}
${S} .gh-mcol{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:40px;transform:rotateZ(-10deg)}
${S} .gh-tile{position:relative;flex:none;height:250px;overflow:hidden;border-radius:20px;box-shadow:0 0 30px #000;background:var(--sb-card)}
${S} .gh-tile img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
${S} .gh-tile .alt{opacity:0;transition:opacity .3s ease}
${S} .gh-tile:hover .alt{opacity:1}
@media (prefers-reduced-motion:reduce){${S} .gh-tile .alt{transition:none}}

/* destaques + "O mapa" */
${S} .gh-feat{position:relative;padding:120px 20px;background:var(--sb-bg) var(--gh-bg,none) center/cover no-repeat}
${S} .gh-feat::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,var(--sb-bg) 0%,transparent 30%);pointer-events:none}
${S} .gh-feat-in{position:relative;display:flex;flex-direction:column;gap:80px;max-width:1350px;margin:0 auto}
${S} .gh-feat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${S} .gh-feat-item{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
${S} .gh-feat-ic{display:flex;align-items:flex-start;justify-content:center;height:90px;color:var(--gh-icon);transition:color .3s}
${S} .gh-feat-ic svg{display:block;width:65px;height:65px}
${S} .gh-feat-item:hover .gh-feat-ic{color:var(--gh-icon-h,#B12CFF)}
${S} .gh-feat-item p{max-width:100%}
${S} .gh-map{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:60px}
${S} .gh-map-slider{position:relative;height:650px;overflow:hidden;border-radius:20px;box-shadow:0 0 30px rgba(0,0,0,.3)}
${S} .gh-map-slider .si-car,${S} .gh-map-slider .si-car-view,${S} .gh-map-slider .si-car-track,${S} .gh-map-slider .si-slide{height:100%}
${S} .gh-map-slider .si-slide img{display:block;width:100%;height:100%;object-fit:cover}
${S} .gh-map-copy{display:flex;flex-direction:column;gap:30px}
${S} .gh-map-head{display:flex;flex-direction:column;gap:20px}
${S} .gh-map-copy .gh-btn{align-self:flex-start}

/* setas e bolinhas dos carrosséis (SiCar) */
${S} .gh-car .si-car{position:relative}
${S} .gh-car .si-car-arrow,${S} .gh-car .si-car-dots{display:none}
${S}.sb-js .gh-car .si-car:not(.is-static) .si-car-arrow{position:absolute;top:calc(50% - 10px);z-index:2;display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;background:none;color:#fff;cursor:pointer}
${S} .gh-car .si-car-arrow svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
${S} .gh-car .si-car-arrow.prev{left:10px}
${S} .gh-car .si-car-arrow.next{right:10px}
${S}.sb-js .gh-car .si-car:not(.is-static) .si-car-dots{position:absolute;left:0;right:0;bottom:10px;z-index:2;display:flex;justify-content:center;gap:12px}
${S} .gh-car .si-car-dots button{width:5px;height:5px;padding:0;border:0;border-radius:50%;background:#fff;cursor:pointer}
${S} .gh-car .si-car-dots button.on{background:var(--sb-accent)}

/* "Vire o Jogo" */
${S} .gh-ban{display:grid;grid-template-columns:25% 50% 25%}
${S} .gh-ban-1{display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;min-height:650px;background:var(--sb-accent) var(--gh-img,none) center/cover no-repeat}
${S} .gh-ban-box{box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;gap:20px;width:80%;padding:60px;background:var(--sb-card)}
${S} .gh-ban-2{height:650px;background:var(--sb-card)}
${S} .gh-ban-2 img{display:block;width:100%;height:100%;object-fit:cover}
${S} .gh-ban-3{box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:20px;padding:80px;background:var(--sb-card)}

/* "01 / 02" */
${S} .gh-steps{position:relative;padding:120px 20px;background:var(--sb-bg) var(--gh-bg,none) top center/cover no-repeat}
${S} .gh-steps-in{display:flex;flex-direction:column;gap:60px;max-width:1350px;margin:0 auto}
${S} .gh-step{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center}
${S} .gh-step-copy{box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:20px;padding:80px}
${S} .gh-num{color:transparent;font-family:'Plus Jakarta Sans',sans-serif;font-size:7em;font-weight:700;line-height:1;-webkit-text-stroke:1px var(--sb-accent)}
${S} .gh-step-card{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:750px;overflow:hidden;border-radius:20px;background:var(--sb-card) var(--gh-img,none) center/cover no-repeat;box-shadow:0 0 30px rgba(0,0,0,.3)}
${S} .gh-step-card::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 75%,var(--sb-bg) 100%);pointer-events:none}
${S} .gh-step-card>*{position:relative}
${S} .gh-step-cap{box-sizing:border-box;padding:40px;text-align:center}

/* bônus */
${S} .gh-bonus{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
${S} .gh-bonus-img{display:flex;align-items:center;justify-content:center;background:var(--sb-accent)}
${S} .gh-bonus-img img{display:block;width:70%;height:auto;border-radius:20px}
${S} .gh-bonus-panel{box-sizing:border-box;display:flex;flex-direction:column;gap:60px;padding:120px 80px;background:var(--sb-card)}
${S} .gh-bonus-head{display:flex;flex-direction:column;gap:20px}
${S} .gh-bonus-list{display:flex;flex-direction:column;gap:40px}
${S} .gh-bonus-item{display:flex;align-items:center;gap:20px}
${S} .gh-bthumb{flex:0 0 14%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:10px;background:linear-gradient(135deg,var(--sb-accent) 0%,var(--gh-blue) 100%);box-shadow:0 0 30px rgba(0,0,0,.3);color:#fff}
${S} .gh-bthumb img{display:block;width:100%;height:100%;object-fit:cover}
${S} .gh-bthumb svg{width:40%;height:40%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
${S} .gh-bonus-txt{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:20px}
${S} .gh-bonus-txt h4{font-size:1.5em;line-height:1.2}
${S} .gh-bonus-side{flex:0 0 23%;display:flex;flex-direction:column;align-items:flex-end;gap:20px;text-align:right}

/* oferta */
${S} .gh-offer{position:relative;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:60px;padding:120px 20px;background:var(--sb-bg) var(--gh-bg,none) center/cover no-repeat;text-align:center}
${S} .gh-offer-head{display:flex;flex-direction:column;align-items:center;gap:20px;width:min(50%,675px)}
${S} .gh-offer-lead{padding:0 80px}
${S} .gh-offer-card{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:20px;width:min(30%,405px);padding:80px 0;border-radius:20px;background:var(--sb-card);box-shadow:0 0 30px rgba(0,0,0,.3)}
${S} .gh-offer-title{font-size:40px;line-height:1.2}
${S} .gh-offer-kicker{padding:0 60px;color:var(--sb-accent);font-size:22px;line-height:1.2;text-transform:uppercase}
${S} .gh-offer-price{color:var(--gh-title);font-family:'Plus Jakarta Sans',sans-serif;font-size:80px;font-weight:700;line-height:1.2}
${S} .gh-offer-disc{color:var(--gh-title);font-size:18px}
${S} .gh-offer-list{display:flex;flex-direction:column;align-items:center;gap:14px;margin:20px 0;padding:0;list-style:none}
${S} .gh-offer-list li{display:flex;align-items:center;gap:10px;color:#fff;font-size:16px;line-height:1.5}
${S} .gh-offer-list svg{flex:none;width:14px;height:14px;fill:none;stroke:var(--gh-check);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* depoimentos */
${S} .gh-test{position:relative;background:var(--sb-bg) var(--gh-bg,none) center/cover no-repeat}
${S} .gh-test::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,var(--sb-bg) 5%,transparent 50%);pointer-events:none}
${S} .gh-test-in{position:relative;box-sizing:border-box;padding:120px 20px}
${S} .gh-test-in::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,var(--sb-bg) 95%);pointer-events:none}
${S} .gh-test-car{position:relative;width:min(70%,945px);margin:0 auto}
${S} .gh-test-car .si-car{padding:0 67px 40px}
${S} .gh-test-car .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .gh-test-car .si-car-view::-webkit-scrollbar{display:none}
${S} .gh-test-car .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .gh-test-car .si-slide{flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S}.sb-js .gh-test-car .si-car-view{overflow:hidden}
${S} .gh-test-car .si-car{--si-pv:1}
${S}.sb-js .gh-test-car .si-car:not(.is-static) .si-car-arrow{top:calc(50% - 30px)}
${S}.sb-js .gh-test-car .si-car:not(.is-static) .si-car-dots{bottom:0}
${S} .gh-tq{box-sizing:border-box;padding:0 28px;display:flex;flex-direction:column;align-items:center;gap:30px;text-align:center}
${S} .gh-tq-text{color:#fff;font-size:1.3em;letter-spacing:-.7px;line-height:1.5}
${S} .gh-tq-who{display:flex;align-items:center;justify-content:center;gap:30px;text-align:left}
${S} .gh-tq-photo{flex:none;width:70px;height:70px;border-radius:50%;object-fit:cover}
${S} .gh-tq-name{font-size:1.4em;line-height:1.2}
${S} .gh-tq-role{color:var(--gh-role,#fff);font-size:16px;line-height:1.3}

/* FAQ */
${S} .gh-faq{padding-bottom:50px;background:var(--sb-bg) var(--gh-bg,none) center/cover no-repeat}
${S} .gh-faq-in{position:relative;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:60px;padding:120px 20px 60px}
${S} .gh-faq-in::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,var(--sb-bg) 0%,transparent 10%);pointer-events:none}
${S} .gh-faq-in>*{position:relative}
${S} .gh-faq-head{display:flex;flex-direction:column;align-items:center;gap:20px;width:min(55%,742px);text-align:center}
${S} .gh-faq-list{width:min(70%,945px)}
@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}${mobile(`${S}.sb-narrow`)}
`;
