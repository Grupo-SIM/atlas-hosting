/**
 * Variante `corte` (escopo `.sb-ac`): página de vendas do curso "Academia do Corte"
 * (academiadocorte.centraldomarketing.com — WordPress + Hello Elementor 4.4 + Rometheme Kit, modelo Canvas, página 102,
 * kit 9). Breakpoints do original: tablet ≤ 1024, celular ≤ 767, repetidos sob `.sb-narrow` (no preview estreito do
 * editor tablet e celular valem os dois). Container 1300px.
 *
 * Tokens do tema: `accent` (verde vivo `#158B50`: sobretítulos, links, checks), `bg` (`#0A0A0A`), `fg` (`#C2C2C2`, texto),
 * `moss` (`#033F21`: bordas e hover), `forest` (`#002715`: fim dos véus e divisórias), `teal` (`#00CEA6`: ícones dos
 * contadores e setas). Fontes: Poppins (títulos, botões) e Roboto (corpo); a oferta usa Montserrat (`CORTE_EXTRA_FONTS`).
 * A oferta, o FAQ e o rodapé são os blocos comuns `ebook*` (`renderer/ebook.ts`).
 *
 * **Véu verde** comum (`div.ac-veil`, vars `--ac-veil-a/c/o` do bloco): `linear-gradient(240deg, transparent 20%, <cor>)`.
 */
export const isCorte = (theme: Record<string, string>) =>
  theme.variant === "corte";

/** Fontes fixas da variante (nunca texto do usuário). */
export const CORTE_EXTRA_FONTS = ["Poppins", "Roboto", "Montserrat"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function corteVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--ac-forest": safe(theme.forest, "#002715"),
    "--ac-moss": safe(theme.moss, "#033F21"),
    "--ac-teal": safe(theme.teal, "#00CEA6"),
  };
}

const S = ".sb-ac";

/** Tablet (≤ 1024px). `x` = seletor da raiz (`.sb-ac` ou `.sb-ac.sb-narrow`). */
const tablet = (x: string) => `
${x} .ac-h1{font-size:60px}
${x} .ac-h2{font-size:46px}
${x} .ac-h2-md{font-size:42px}
${x} .ac-h3,${x} .ac-eyebrow-lg{font-size:32px}
${x} .ac-h5{font-size:16px}
${x} .ac-hero-sub{font-size:30px}
${x} .ac-hero-in{padding:120px 20px 60px}
${x} .ac-hero .ac-h1{width:90%}
${x} .ac-hero-sub{width:85%}
${x} .ac-hero-p{width:70%}
${x} .ac-feat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .ac-about{padding:4em 0}
${x} .ac-about-in{grid-template-columns:1fr;gap:80px}
${x} .ac-about-img{width:100%;height:460px}
${x} .ac-about-rect{bottom:-4em}
${x} .ac-video{min-height:0}
${x} .ac-curriculum,${x} .ac-reviews,${x} .ac-instructor{padding:4em 20px}
${x} .ac-head-t{width:85%}
${x} .ac-cur-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none;grid-auto-flow:row}
${x} .ac-ins-head{grid-template-columns:1fr;gap:20px}
${x} .ac-mosaic{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none;grid-auto-rows:300px}
${x} .ac-tile.big{grid-column:1/3;grid-row:auto}
${x} .ac-car{--si-pv:var(--si-t)}
${x} .ac-rev-in{padding:0}
${x} .ac-car .si-car-arrow{display:none!important}
${x} .ac-g-row{gap:30px;margin:70px auto}
${x} .ac-g-p{width:90%}
`;

/** Celular (≤ 767px). */
const mobile = (x: string) => `
${x} .ac-h1{font-size:50px}
${x} .ac-h2{font-size:40px}
${x} .ac-h2-md{font-size:36px}
${x} .ac-h3,${x} .ac-eyebrow-lg{font-size:28px}
${x} .ac-hero-sub{font-size:24px}
${x} .ac-hero .ac-h1,${x} .ac-hero-sub,${x} .ac-hero-p{width:100%}
${x} .ac-hero-in{padding:100px 16px 50px}
${x} .ac-feat-grid{grid-template-columns:1fr}
${x} .ac-about-img{height:340px}
${x} .ac-about-in{padding:0 16px}
${x} .ac-cols{columns:1}
${x} .ac-counters{grid-template-columns:1fr}
${x} .ac-banner-in{padding:60px 16px}
${x} .ac-bt{width:100%}
${x} .ac-head-t{width:100%}
${x} .ac-cur-grid{grid-template-columns:1fr}
${x} .ac-mosaic{grid-template-columns:1fr}
${x} .ac-tile.big{grid-column:auto}
${x} .ac-car{--si-pv:var(--si-m);--si-gap:10px!important}
${x} .ac-review blockquote{font-size:18px}
${x} .ac-g-row{flex-direction:column;margin:50px auto}
${x} .ac-g-offer,${x} .ac-callout{flex:0 0 auto;width:100%}
${x} .ac-callout p{font-size:24px;line-height:1.25}
${x} .ac-g-p{width:100%}
`;

export const corteCss = `
html:has(${S}){scroll-behavior:smooth}
${S}{font-family:'Roboto',sans-serif;font-size:16px;font-weight:400;line-height:1.3;color:var(--sb-fg)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5,${S} p,${S} figure,${S} blockquote{margin:0}
${S} .ac-sec{position:relative;box-sizing:border-box}
${S} .ac-h1,${S} .ac-h2,${S} .ac-h3,${S} .ac-h4{color:#fff;font-family:'Poppins',sans-serif;font-weight:700;text-transform:uppercase}
${S} .ac-h1{font-size:68px;line-height:1;letter-spacing:-1.3px}
${S} .ac-h2{font-size:58px;line-height:1;letter-spacing:-1px}
${S} .ac-h2-md{font-size:50px}
${S} .ac-h3{font-size:36px;line-height:1;letter-spacing:-1px}
${S} .ac-h4{font-size:20px;font-weight:600;line-height:1;letter-spacing:-.8px}
${S} .ac-h5{color:#fff;font-family:'Poppins',sans-serif;font-size:17px;font-weight:500;line-height:1.1}
${S} .ac-small{font-family:'Poppins',sans-serif;font-size:13px;line-height:1.2}
${S} .ac-eyebrow{color:var(--sb-accent);font-family:'Poppins',sans-serif;font-size:17px;font-weight:500;line-height:1.1}
${S} .ac-eyebrow-lg{display:block;margin-bottom:30px;font-size:33px;font-weight:600;text-align:center}
${S} .ac-hr{height:0;margin:40px 0;border:0;border-top:1px solid var(--ac-forest)}

/* botão */
${S} .ac-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:18px 32px;border:1px solid #fff;border-radius:0;background:transparent;color:#fff;font-family:'Poppins',sans-serif;font-size:16px;font-weight:500;line-height:1;text-transform:uppercase;transition:background .3s,color .3s,border-color .3s}
${S} .ac-btn:hover,${S} .ac-btn:focus{background:#fff;color:#0A0A0A}
${S} .ac-btn svg{flex:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
${S} .ac-btn.solid{background:#fff;color:#000}
${S} .ac-btn.solid:hover,${S} .ac-btn.solid:focus{border-color:#fff;background:var(--ac-forest);color:#fff}

/* véu verde e marca d'água */
${S} .ac-veil{position:absolute;inset:0;z-index:1;background:linear-gradient(var(--ac-veil-a,240deg),transparent 20%,var(--ac-veil-c,#002715) 100%);opacity:var(--ac-veil-o,1);pointer-events:none}
${S} .ac-mark{position:absolute;inset:0;background:var(--ac-mark) center/contain no-repeat;opacity:var(--ac-mark-o,.04);pointer-events:none}

/* hero */
${S} .ac-hero{display:flex;overflow:hidden;min-height:var(--ac-h,110vh);background:#0A0A0A}
${S} .ac-hero .sb-bgvideo{z-index:0}
${S} .ac-hero-in{position:relative;z-index:2;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:1300px;margin:auto;padding:140px 20px 80px;text-align:center}
${S} .ac-logo{display:block;width:var(--ac-logo-w,90px);max-width:100%;height:auto}
${S} .ac-hero .ac-h1{width:77%}
${S} .ac-hero-sub{width:70%;color:#fff;font-family:'Poppins',sans-serif;font-size:35px;font-weight:500;line-height:1.1;letter-spacing:-1.3px;text-transform:uppercase}
${S} .ac-hero-p{width:50%;color:#fff}
${S} .ac-hero .ac-btn{margin-top:10px}

/* diferenciais */
${S} .ac-features{padding:0 0 3em}
${S} .ac-feat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;max-width:1300px;margin:0 auto}
${S} .ac-feat{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:15px;padding:40px 30px;background:rgba(255,255,255,.025);text-align:center}
${S} .ac-ring{display:inline-flex;padding:10px;border:2px solid var(--ac-moss);border-radius:50%;transition:background .3s}
${S} .ac-feat:hover .ac-ring{background:var(--ac-moss)}
${S} .ac-feat-img{display:block;width:60px;height:60px;min-height:0;object-fit:contain;background:none}

/* curso rápido */
${S} .ac-about{padding:6em 0}
${S} .ac-about-in{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start;gap:50px;max-width:1300px;margin:0 auto;padding:0 20px}
${S} .ac-about-media{position:relative;display:flex;justify-content:flex-end}
${S} .ac-about-img{position:relative;z-index:1;display:block;width:90%;height:580px;min-height:0;object-fit:cover;filter:saturate(0%)}
${S} .ac-about-rect{position:absolute;bottom:-6em;left:0;width:220px;height:200px;background:rgba(21,139,80,.2)}
${S} .ac-cols{margin:30px 0 40px;columns:2;column-gap:30px}
${S} .ac-cols p{margin-bottom:1em;break-inside:avoid}
${S} .ac-cols strong{color:#fff}
${S} .ac-about .ac-h5{margin-bottom:20px;text-align:center}
${S} .ac-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:20px}
${S} .ac-counters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px}
${S} .ac-counter{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
${S} .ac-counter-ico{display:block;width:60px;height:60px;color:var(--ac-teal)}
${S} .ac-counter-ico svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
${S} .ac-counter-num{color:#E6E6E6;font-family:'Roboto',sans-serif;font-size:44px;font-weight:500;line-height:1.1}

/* vídeo */
${S} .ac-video{min-height:70vh;padding:0 20px 6em}
${S} .ac-vcover{position:relative;display:block;max-width:1300px;margin:0 auto;aspect-ratio:16/9;overflow:hidden;background:#000}
${S} .ac-vcover-img{position:absolute;inset:0;width:100%;height:100%;min-height:0;object-fit:cover;background:none}
${S} .ac-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transition:transform .3s}
${S} .ac-play svg{width:90px;height:90px;fill:#fff;fill-rule:evenodd;opacity:.95}
${S} .ac-vcover:hover .ac-play{transform:scale(1.1)}

/* faixa com foto */
${S} .ac-banner{display:flex;align-items:center;overflow:hidden;min-height:var(--ac-h,40vh);background:var(--ac-bg,none) center/cover no-repeat,#0A0A0A}
${S} .ac-banner-in{position:relative;z-index:2;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;gap:30px;width:100%;max-width:1300px;margin:0 auto;padding:80px 20px}
${S} .ac-bt{width:var(--ac-tw,50%)}
${S} .ac-banner.is-center .ac-banner-in{align-items:center;text-align:center}
${S} .ac-banner.is-center .ac-bt{width:auto}

/* conteúdo do curso */
${S} .ac-curriculum,${S} .ac-reviews{padding:6em 20px;background:rgba(0,0,0,.78);overflow:hidden}
${S} .ac-cur-in,${S} .ac-rev-in{position:relative;z-index:1;max-width:1300px;margin:0 auto}
${S} .ac-head{display:flex;flex-direction:column;align-items:center;gap:20px;margin-bottom:60px;text-align:center}
${S} .ac-head.left{align-items:flex-start;text-align:left}
${S} .ac-head-t{width:70%}
${S} .ac-reviews .ac-head-t{width:50%}
${S} .ac-head-p strong{color:#fff}
${S} .ac-cur-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(var(--ac-rows,4),auto);grid-auto-flow:column;gap:0 40px}
${S} .ac-cur-item{display:flex;align-items:center;gap:16px;padding:20px 0;border-bottom:1px solid var(--ac-forest)}
${S} .ac-cur-item .ac-h4{flex:1;text-align:right}
${S} .ac-cur-item svg{flex:none;width:48px;height:48px;fill:none;stroke:var(--sb-accent);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
${S} .ac-more{margin-top:20px;color:#fff;font-size:30px;text-align:center}

/* instrutor + mosaico */
${S} .ac-instructor{padding:6em 20px}
${S} .ac-ins-in{max-width:1300px;margin:0 auto}
${S} .ac-ins-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:50px}
${S} .ac-ins-p{color:#C2C2C2}
${S} .ac-instructor .ac-hr{margin:40px 0}
${S} .ac-mosaic{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(2,312px);gap:2px}
${S} .ac-tile{position:relative;overflow:hidden;background:#0A0A0A}
${S} .ac-tile.big{grid-column:1/3;grid-row:1/3}
${S} .ac-tile-img{position:absolute;inset:0;width:100%;height:100%;min-height:0;object-fit:cover;filter:grayscale(1);background:none}
${S} .ac-tile .ac-veil{opacity:0;transition:opacity .4s}
${S} .ac-tile:hover .ac-veil,${S} .ac-tile:focus-within .ac-veil{opacity:var(--ac-veil-o,1)}
${S} .ac-cap{position:absolute;bottom:2em;left:0;z-index:2;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;gap:10px;max-width:100%;padding:2em;background:linear-gradient(rgba(0,39,21,.15),rgba(0,39,21,.15)),#0A0A0A}
${S} .ac-cap a{color:inherit}
${S} .ac-cap-link{color:var(--sb-accent)!important;font-family:'Poppins',sans-serif;font-size:13px;line-height:1.2;text-transform:uppercase}

/* reviews */
${S} .ac-rev-in{padding:0 56px;box-sizing:border-box}
${S} .ac-car{position:relative;--si-pv:var(--si-d)}
${S} .ac-car .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .ac-car .si-car-view::-webkit-scrollbar{display:none}
${S} .ac-car .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .ac-car .si-slide{display:flex;flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S}.sb-js .ac-car .si-car-view{overflow:hidden}
${S} .ac-car .si-car-arrow,${S} .ac-car .si-car-dots{display:none}
${S}.sb-js .ac-car:not(.is-static) .si-car-arrow{position:absolute;top:calc(50% - 20px);z-index:2;display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:0;background:none;color:var(--sb-fg);cursor:pointer;transition:color .3s}
${S}.sb-js .ac-car .si-car-arrow:hover{color:var(--ac-teal)}
${S} .ac-car .si-car-arrow.prev{left:-52px}
${S} .ac-car .si-car-arrow.next{right:-52px}
${S} .ac-car .si-car-arrow svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
${S}.sb-js .ac-car:not(.is-static) .si-car-dots{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:24px}
${S} .ac-car .si-car-dots button{width:5px;height:5px;padding:0;border:0;border-radius:50%;background:#C2C2C2;cursor:pointer}
${S} .ac-car .si-car-dots button.on{background:var(--sb-accent)}
${S} .ac-review{box-sizing:border-box;display:flex;flex:1;flex-direction:column;justify-content:space-between;gap:30px;padding:15px;background:#000704A6}
${S} .ac-review blockquote{color:#fff;font-family:'Poppins',sans-serif;font-size:22px;font-style:italic;font-weight:500;line-height:1.3;letter-spacing:-.8px}
${S} .ac-review figcaption{display:flex;align-items:center;gap:15px}
${S} .ac-avatar{flex:none;width:64px;height:64px;min-height:0;border-radius:50%;object-fit:cover}
${S} .ac-review figcaption b{display:block;color:#fff;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700}
${S} .ac-review figcaption em{display:block;color:var(--sb-accent);font-family:'Poppins',sans-serif;font-size:13px;font-style:normal}

/* garantia + oferta */
${S} .ac-guarantee{overflow:hidden;padding:65px 20px 20px;background:var(--ac-bg,none) center/cover no-repeat,#0A0A0A}
${S} .ac-g-head{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center}
${S} .ac-g-p{width:75%;color:#fff}
${S} .ac-g-p strong{font-weight:700}
${S} .ac-g-row{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:40px;max-width:1300px;margin:100px auto}
${S} .ac-g-offer{flex:0 0 auto;width:min(100%,480px)}
${S} .ac-g-offer .eb-offer{width:100%}
${S} .ac-g-offer .eb-card{width:100%;min-width:0}
${S} .ac-callout{box-sizing:border-box;flex:0 0 min(100%,480px);padding:60px 40px;border:solid rgba(255,255,255,.75);border-width:3px 0;border-radius:20px;text-align:center}
${S} .ac-callout p{color:#fff;font-family:'Montserrat',sans-serif;font-size:30px;font-weight:700;line-height:37px}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}${mobile(`${S}.sb-narrow`)}
@media (prefers-reduced-motion:reduce){
${S} .ac-btn,${S} .ac-ring,${S} .ac-tile .ac-veil,${S} .ac-play{transition:none}
}
`;
