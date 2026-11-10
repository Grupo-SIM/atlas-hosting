/**
 * Variante `outrolado` (escopo `.sb-ol`): página de vendas do e-book "O Outro Lado da Internet"
 * (lp.centraldomarketing.com — WordPress + Hello Elementor, modelo Canvas). Breakpoints do original: tablet ≤ 1024,
 * celular ≤ 767; no preview estreito do editor as mesmas regras valem via `.sb-narrow`.
 *
 * O original tem um breakpoint extra de **laptop (≤ 1366px)** que o builder não tem: ele vira a faixa
 * `@media (max-width:1366px) and (min-width:1025px)` abaixo, só nesta variante.
 */
export const isOutroLado = (theme: Record<string, string>) =>
  theme.variant === "outrolado";

/** Fontes fixas da variante (nunca texto do usuário). Cherry Cream Soda só existe no peso 400. */
export const OUTROLADO_EXTRA_FONTS = [
  "Cherry Cream Soda",
  "Anybody",
  "Montserrat",
  "Roboto",
];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: fim do degradê do botão de compra e verde da borda do cartão de oferta. */
export function outroladoVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--ol-deep": safe(theme.dark, "#023131"),
    "--ol-line": safe(theme.line, "#009D49"),
  };
}

const S = ".sb-ol";

/** Laptop: 1025–1366px. */
const laptop = `
${S} .ol-hero{background-position:center top}
${S} .ol-hero-text{width:50%}
${S} .ol-danger-col{min-height:726px}
${S} .ol-cur-title{font-size:57px;line-height:52px}
${S} .ol-video{min-height:0}
${S} .ol-video .ol-in{min-height:0}
${S} .ol-offer{min-height:100vh}
${S} .ol-offer-left{flex-basis:41%}
${S} .ol-offer-right{flex-basis:51%}
${S} .ol-seal{width:223px}
${S} .ol-card{min-height:456px;margin:150px 0 0 13px}
${S} .ol-card-title{font-size:33px;line-height:33px;margin-top:20px}
${S} .ol-cash{font-size:21px}
${S} .ol-price{font-size:62px}
${S} .ol-faq-h{font-size:30px}
${S} .ol-faq-top{height:20px}
`;

const tablet = (x: string) => `
${x} .ol-hero .ol-in{flex-direction:column;justify-content:flex-end;align-items:center;min-height:970px}
${x} .ol-hero-text{width:730px;max-width:100%;min-height:0;margin-left:0;padding-inline:20px}
${x} .ol-hero-title{font-size:61px;line-height:1.2}
${x} .ol-danger .ol-in{flex-direction:column;justify-content:flex-end;align-items:flex-end;min-height:1415px}
${x} .ol-danger-col{width:741px;max-width:100%;min-height:0;margin-left:0;padding:0 20px 60px}
${x} .ol-cur-row{flex-direction:column;padding-inline:20px}
${x} .ol-cur-title,${x} .ol-cur-text{flex:none;width:100%;margin-left:0}
${x} .ol-cur-title{margin-top:0;font-size:50px;line-height:1.2;text-align:center}
${x} .ol-cur-text{padding:20px 0}
${x} .ol-car{padding-inline:30px}
${x} .ol-car .si-car-arrow svg{width:29px;height:29px}
${x} .ol-video .ol-in{min-height:403px;padding-block:0}
${x} .ol-vframe{padding-inline:30px}
${x} .ol-offer-in{flex-wrap:wrap}
${x} .ol-offer-left{flex-basis:49%}
${x} .ol-offer-right{flex-basis:48%}
${x} .ol-offer-left h2{font-size:28px;line-height:1.1}
${x} .ol-seal{margin:4px 60px 60px}
${x} .ol-card{width:100%;min-height:223px;margin:100px 0 0 -40px}
${x} .ol-card-title{margin-top:20px}
${x} .ol-price{font-size:71px}
${x} .ol-faq{min-height:500px}
${x} .ol-faq-h{font-size:30px}
${x} .ol-faq-top{height:1px}
${x} .ol-faq-gap{height:10px}
`;

const mobile = (x: string) => `
${x} .ol-hero .ol-in{min-height:633px}
${x} .ol-hero-title{font-size:39px;line-height:1.4}
${x} .ol-danger .ol-in{min-height:1050px}
${x} .ol-danger-title{font-size:30px;line-height:1.5}
${x} .ol-danger-col{width:100%}
${x} .ol-icons{display:grid;grid-template-columns:repeat(2,40%);justify-content:center;gap:20px 0}
${x} .ol-icon svg{width:40px;height:40px}
${x} .ol-danger-col p,${x} .ol-danger-col .ol-list{text-align:center}
${x} .ol-cur{min-height:0}
${x} .ol-cur-row{margin-top:50px}
${x} .ol-cur-title{font-size:33px;line-height:.9}
${x} .ol-cur-text p{text-align:center}
${x} .ol-car .si-car-arrow svg{width:16px;height:16px}
${x} .ol-video{min-height:0}
${x} .ol-video .ol-in{min-height:0}
${x} .ol-offer{min-height:0}
${x} .ol-offer-in{flex-direction:column;max-width:500px}
${x} .ol-offer-left,${x} .ol-offer-right{flex:none;width:100%}
${x} .ol-offer-left h2{font-size:30px}
${x} .ol-offer-left p{margin-top:0}
${x} .ol-card{min-height:253px;margin:0}
${x} .ol-card-title{font-size:2.1em;line-height:1.1}
${x} .ol-cash{font-size:21px}
${x} .ol-price{font-size:68px}
${x} .ol-buy{font-size:17px}
${x} .ol-faq{min-height:515px}
${x} .ol-faq-h{font-size:25px}
${x} .ol-faq-top{height:25px}
${x} .ol-faq-gap{height:16px}
${x} .ol-faq-item summary{padding:12px 15px}
${x} .ol-faq-a{padding:7px 15px}
${x} .ol-faq-ic{width:19px;height:19px}
${x} .ol-foot{min-height:128px}
${x} .ol-foot p{font-size:14px}
`;

export const outroladoCss = `
${S}{font-family:var(--sb-font-body);font-size:16px;line-height:1.5;color:var(--sb-fg);background:var(--sb-bg)}
${S} main{padding-top:0!important}
${S} p,${S} h1,${S} h2,${S} h3{margin:0}
${S} img{max-width:100%}
${S} .ol-sec{position:relative;display:flex;align-items:center;justify-content:center;min-height:var(--ol-h,0px);background-color:var(--sb-bg);background-image:var(--ol-bg,none);background-position:var(--ol-pos,center center);background-repeat:no-repeat;background-size:cover}
${S} .ol-in{position:relative;width:100%;max-width:1600px;margin-inline:auto}
${S} .ol-h{font-family:var(--sb-font-heading);font-weight:400;letter-spacing:1.5px;text-align:center;color:var(--sb-fg)}
${S} .ol-hl{color:var(--sb-accent);white-space:nowrap}
${S} .ol-sec strong{color:var(--sb-accent);font-weight:700}

/* botões de rolagem: letra "dupla" pela sombra de texto; hover grow do Elementor */
${S} .ol-scroll{display:inline-block;padding:25px 20px;border:0;background:var(--sb-accent);color:#fff;font-family:var(--sb-font-accent);font-size:15px;font-weight:900;line-height:1;letter-spacing:5px;word-spacing:10px;text-transform:uppercase;text-shadow:0 5px 0 rgba(0,0,0,.3);transition:transform .3s}
${S} .ol-scroll:hover,${S} .ol-scroll:focus{transform:scale(1.1)}
${S} .ol-scroll.glow{box-shadow:0 21px 27px -14px var(--sb-accent)}

/* hero */
${S} .ol-hero .ol-in{display:flex;align-items:center;position:static}
${S} .ol-badge{position:absolute;top:19px;left:0;right:0;z-index:2;width:max-content;margin-inline:auto;padding:14px 10px 10px;background:#fff;color:#000;font-family:var(--sb-font-accent);font-size:15px;font-weight:400;line-height:1;letter-spacing:3px;text-transform:uppercase;box-shadow:0 25px 27px -14px #fff;transition:transform .3s}
${S} .ol-badge:hover,${S} .ol-badge:focus{transform:scale(1.1)}
${S} .ol-hero-text{display:flex;flex-direction:column;align-items:center;justify-content:center;width:62%;min-height:684px;margin-left:75px;text-align:center}
${S} .ol-hero-title{font-size:80px;line-height:75px;letter-spacing:1px;text-shadow:0 0 10px rgba(0,0,0,.3)}
${S} .ol-hero-sub{margin:12px 0 28px;font-family:var(--sb-font-accent);font-size:16px;line-height:24px;color:var(--sb-fg)}

/* mundo perigoso */
${S} .ol-danger{margin-top:-35px}
${S} .ol-danger .ol-in{display:flex;align-items:center}
${S} .ol-danger-col{display:flex;flex-direction:column;justify-content:center;width:50%;min-height:905px;margin-left:95px}
${S} .ol-danger-title{font-size:50px;line-height:70px;margin-bottom:24px}
${S} .ol-icons{display:flex;margin-bottom:24px}
${S} .ol-icon{flex:1;display:flex;justify-content:center;color:#fff}
${S} .ol-icon svg{width:50px;height:50px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
${S} .ol-danger-col p{margin-bottom:20px;text-align:left}
${S} .ol-list{display:flex;flex-direction:column;gap:20px;text-align:left}
${S} .ol-danger-act{margin-top:20px;text-align:center}

/* curiosidade */
${S} .ol-cur{flex-direction:column;align-items:stretch;justify-content:flex-start;min-height:var(--ol-h,0px)}
${S} .ol-cur-row{display:flex;align-items:center;width:100%;max-width:1600px;min-height:250px;margin-inline:auto}
${S} .ol-cur-title{flex:0 0 40%;margin:-9px 0 0 100px;font-size:65px;line-height:70px;text-align:left}
${S} .ol-cur-text{flex:1 1 0;min-width:0;padding:0 80px 0 20px}
${S} .ol-cur-text p{margin-bottom:14px}
${S} .ol-car{width:100%;max-width:1280px;margin:40px auto 0}
${S} .ol-car .si-car{position:relative}
${S} .ol-car .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .ol-car .si-car-view::-webkit-scrollbar{display:none}
${S} .ol-car .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .ol-car .si-slide{flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S} .ol-car .si-slide img{display:block;width:100%;aspect-ratio:9/16;object-fit:cover}
${S} .sb-js .ol-car .si-car-view{overflow:hidden}
${S} .ol-car .si-car{--si-pv:var(--si-d)}
${S} .ol-car .si-car-arrow,${S} .ol-car .si-car-dots{display:none}
${S} .sb-js .ol-car .si-car:not(.is-static) .si-car-arrow{position:absolute;top:calc(50% - 15px);z-index:2;display:flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;background:none;color:#fff;cursor:pointer}
${S} .ol-car .si-car-arrow svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
${S} .ol-car .si-car-arrow.prev{left:10px}
${S} .ol-car .si-car-arrow.next{right:10px}

/* vídeo com capa */
${S} .ol-video .ol-in{display:flex;align-items:center;justify-content:center;max-width:1280px;min-height:859px}
${S} .ol-vframe{position:relative;width:100%;aspect-ratio:16/9;background:#000}
${S} .ol-vposter{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background-color:#000;background-image:var(--ol-poster,none);background-position:center;background-size:cover}
${S} .ol-vframe iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
${S} .ol-play{display:flex;align-items:center;justify-content:center;width:72px;height:72px;border:3px solid #fff;border-radius:50%;color:#fff;transition:transform .3s}
${S} .ol-vposter:hover .ol-play{transform:scale(1.1)}
${S} .ol-play svg{width:26px;height:26px;margin-left:4px;fill:currentColor}

/* oferta */
${S} .ol-offer::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 77%,#000 90%)}
${S} .ol-offer-in{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:100%;max-width:1600px}
${S} .ol-offer-left{display:flex;flex:0 0 46.475%;flex-direction:column;align-items:center;text-align:center}
${S} .ol-offer-left h2{font-size:30px;font-weight:700;line-height:1.2;color:var(--sb-fg)}
${S} .ol-offer-left p{margin-top:10px;font-size:20px;color:var(--sb-fg)}
${S} .ol-seal{width:300px;max-width:100%;margin:50px 0 0}
${S} .ol-offer-right{display:flex;flex:0 0 54%;justify-content:center}
${S} .ol-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;width:69%;min-height:633px;margin:180px 0 0 45px;padding:0 20px 20px;border-style:solid;border-width:3px 0;border-color:var(--ol-line);border-radius:20px;background:var(--ol-card,#fff);box-shadow:inset 0 0 19px -1px var(--ol-line);color:#000;font-family:'Montserrat',sans-serif;text-align:center}
${S} .ol-card-title{margin:30px 0 0;font-size:2.5em;font-weight:800;line-height:1;letter-spacing:-.9px;color:#000}
${S} .ol-cash{margin:10px 0 0;font-size:25px;font-weight:700;line-height:1.3;color:#000}
${S} .ol-cash span{background:var(--sb-accent);box-decoration-break:clone;-webkit-box-decoration-break:clone}
${S} .ol-from{margin:22px 0 0;font-size:30px;font-weight:700;line-height:1.3;color:#000}
${S} .ol-price{margin:6px 0 0;font-size:90px;font-weight:700;line-height:1;color:#000}
${S} .ol-buy{display:inline-block;margin-top:24px;padding:20px 50px;border-radius:3px;background:linear-gradient(180deg,var(--sb-accent) 0%,var(--ol-deep) 100%);color:#fff;font-family:'Montserrat',sans-serif;font-size:19px;font-weight:700;line-height:1;text-shadow:0 0 10px rgba(0,0,0,.3)}
${S} .ol-stamps{width:55%;margin-top:20px;filter:brightness(200%) contrast(18%) saturate(134%) hue-rotate(103deg)}
${S} .ol-card :empty:not(img):not(a):not(br){display:none}

/* FAQ */
${S} .ol-faq{flex-direction:column;align-items:stretch;justify-content:flex-start;min-height:580px;margin-top:-50px;background:var(--sb-bg)}
${S} .ol-faq-in{width:100%;max-width:1280px;margin-inline:auto;padding-inline:30px}
${S} .ol-faq-top{height:50px}
${S} .ol-faq-gap{height:50px}
${S} .ol-faq-h{font-family:var(--sb-font-body);font-size:35px;font-weight:600;line-height:1;letter-spacing:0;text-transform:uppercase;color:var(--sb-accent)}
${S} .ol-faq-item{border:1px solid #D5D8DC}
${S} .ol-faq-item+.ol-faq-item{margin-top:-1px}
${S} .ol-faq-item summary{display:flex;align-items:center;gap:10px;padding:15px 20px;cursor:pointer;list-style:none;color:#fff;font-size:16px;font-weight:700;line-height:1.5}
${S} .ol-faq-item summary::-webkit-details-marker{display:none}
${S} .ol-faq-item[open] summary{color:var(--sb-accent)}
${S} .ol-faq-ic{flex:none;width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
${S} .ol-faq-item[open] .ol-faq-ic .v{display:none}
${S} .ol-faq-a{padding:15px 20px;border-top:1px solid #D5D8DC;color:#fff;font-size:16px}

/* rodapé */
${S} .ol-foot{display:flex;align-items:center;justify-content:center;min-height:115px;background:#000}
${S} .ol-foot-in{width:100%;max-width:1200px;margin:30px auto;text-align:center}
${S} .ol-foot p{font-size:15px;color:#fff}

@media (min-width:1025px) and (max-width:1366px){${laptop}}
@media (max-width:1024px){
${S} .ol-sec{background-image:var(--ol-bg-t,var(--ol-bg,none));min-height:var(--ol-h-t,var(--ol-h,0px))}
${tablet(S)}}
@media (max-width:1023px){${S} .ol-car .si-car{--si-pv:var(--si-t)}}
@media (max-width:767px){
${S} .ol-sec{background-image:var(--ol-bg-m,var(--ol-bg-t,var(--ol-bg,none)));min-height:var(--ol-h-m,var(--ol-h-t,var(--ol-h,0px)))}
${S} .ol-car .si-car{--si-pv:var(--si-m)}
${mobile(S)}}
@media (prefers-reduced-motion:reduce){${S} .ol-scroll,${S} .ol-badge,${S} .ol-play{transition:none}}
${S}.sb-narrow .ol-sec{background-image:var(--ol-bg-t,var(--ol-bg,none));min-height:var(--ol-h-t,var(--ol-h,0px))}
${S}.sb-narrow .ol-car .si-car{--si-pv:var(--si-t)}
${tablet(`${S}.sb-narrow`)}
${S}.sb-narrow .ol-sec{background-image:var(--ol-bg-m,var(--ol-bg-t,var(--ol-bg,none)));min-height:var(--ol-h-m,var(--ol-h-t,var(--ol-h,0px)))}
${S}.sb-narrow .ol-car .si-car{--si-pv:var(--si-m)}
${mobile(`${S}.sb-narrow`)}
`;
