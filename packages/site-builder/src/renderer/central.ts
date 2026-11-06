/**
 * Variante "central" (`theme.variant = "central"`): visual escuro com verde neon, medido no
 * centraldomarketing.com (Elementor): cabeçalho e menu em gaveta, hero, marquee de logos, cartões,
 * banners de título, posts, categorias, rodapé e botão do WhatsApp. Tudo fica sob `.sb-ct`, então
 * os sites que usam o estilo padrão (ou outras variantes) não mudam.
 *
 * Breakpoints do original (Elementor): tablet ≤ 1024 e celular ≤ 767. O preview estreito do editor
 * (`.sb-narrow`) não enxerga media query, então cada regra de tela pequena existe duas vezes.
 */
export const isCentral = (theme: Record<string, string>) =>
  theme.variant === "central";

/** Fontes que só a variante usa (texto dos posts e botão "Voltar"). */
export const CENTRAL_EXTRA_FONTS = ["Poppins", "Roboto"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras da variante: cor dos títulos e das linhas/bordas. */
export function centralVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--ct-line": safe(theme.line, "#313131"),
    "--ct-title": safe(theme.title, "#fcfcfc"),
  };
}

/** `url("...")` seguro para usar em `background`; valor suspeito vira `none`. */
export const cssUrl = (url: string | undefined): string =>
  url && !/["\\\n\r;{}<>]/.test(url) && !/^\s*(javascript|vbscript):/i.test(url)
    ? `url("${url}")`
    : "none";

const S = ".sb-ct";

/** Tablet e celular (≤ 1024): menu em gaveta, hambúrguer e ajustes de espaçamento. */
const tablet = (x: string) => `
${x} .sb-header.sb-container{min-height:0;padding:24px 0}
${x} .sb-header .sb-logo{order:1;margin-right:auto}
${x} .sb-header .sb-burger{display:flex;order:3;position:relative;z-index:62;flex-direction:column;justify-content:center;gap:6px;width:30px;height:38px;cursor:pointer}
${x} .sb-header .sb-burger i{display:block;width:100%;height:2px;border-radius:0;background:var(--sb-accent)}
${x} .sb-header>.sb-btn{display:none}
${x} .sb-header .sb-nav{position:fixed;top:0;left:0;bottom:0;z-index:61;order:2;display:flex;flex:none;flex-direction:column;align-items:stretch;gap:0;width:min(350px,100vw);margin:0;padding:96px 0 32px;overflow-y:auto;background:var(--sb-bg);transform:translateX(-100%);visibility:hidden;transition:transform .3s ease,visibility 0s linear .3s}
${x} .sb-header .sb-nav-item>a{padding:10px 16px}
${x} .sb-burger-input:checked~.sb-nav{transform:none;visibility:visible;transition:transform .3s ease}
${x} .sb-burger-input:checked+.sb-burger{position:fixed;top:25px;left:min(290px,calc(100vw - 100px));align-items:center;width:45px;height:38px;border-radius:6px;background:var(--sb-accent)}
${x} .sb-burger-input:checked+.sb-burger i{display:none}
${x} .sb-burger-input:checked+.sb-burger::after{content:"X";font:700 14px/1 var(--sb-font-body);color:#121212}
${x} .sb-burger-backdrop{position:fixed;inset:0;z-index:60;display:block;background:rgba(51,51,51,.5);opacity:0;pointer-events:none;transition:opacity .3s}
${x} .sb-burger-input:checked~.sb-burger-backdrop{opacity:1;pointer-events:auto}
${x} .sb-block[data-block-type=header]:has(.sb-burger-input:checked){z-index:100}
${x} .sb-ct-hero h1{font-size:48px;line-height:57.6px}
${x} .sb-ct-intro{grid-template-columns:1fr;gap:24px;padding:0 0 40px}
${x} .sb-ct-split{padding:48px 0;gap:0 32px}
${x} .sb-ct-split .sb-ct-badge{right:16px;left:auto;bottom:16px;min-width:0}
${x} .v-spotlight{padding-bottom:48px}
${x} .sb-ct-fg.v-icon .sb-ct-fg-grid,${x} .sb-ct-fg.v-product .sb-ct-fg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-ct-foot{grid-template-columns:1fr 1fr;row-gap:40px}
${x} .sb-ct-foot-brand{grid-column:1/-1}
${x} .sb-ct-banner{padding:48px 20px}
${x} .sb-grid:has(>.sb-cat-card){grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-grid-3:has(>.sb-post-card){grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-two-cols.sb-container{grid-template-columns:1fr}
${x} .sb-col-main{padding:0}
${x} .sb-sidebar{position:static;padding-top:0}
${x} .sb-ct-marquee{--ct-show:var(--ct-show-t)}
`;

/** Celular (≤ 767). */
const mobile = (x: string) => `
${x} .sb-ct-hero h1{font-size:40px;line-height:48px;margin-bottom:24px}
${x} .sb-ct-split{grid-template-columns:minmax(0,1fr);gap:32px}
${x} .sb-ct-split.v-feature{grid-template-areas:"text" "media"}
${x} .sb-ct-split.v-spotlight{grid-template-areas:"media" "text"}
${x} .sb-ct-split.v-story{grid-template-areas:"text" "media" "quotes"}
${x} .sb-ct-proof{flex-direction:column;text-align:center}
${x} .sb-ct-intro{text-align:center}
${x} .sb-ct-panel{padding:20px;min-height:0;gap:32px}
${x} .sb-ct-chips{flex-direction:column;gap:12px;align-items:flex-start}
${x} .sb-ct-panel-foot{flex-direction:column-reverse;align-items:flex-start;gap:20px}
${x} .sb-ct-hero-foot{flex-direction:column;align-items:center;text-align:center}
${x} .sb-ct-hero-foot ul{flex-direction:column;gap:8px}
${x} .sb-ct-fg-grid{grid-template-columns:1fr}
${x} .sb-ct-split-text h2,${x} .sb-heading>h2,${x} .sb-ct-banner h2{font-size:30px;line-height:36px}
${x} .sb-ct-banner h1{font-size:34px;line-height:40px}
${x} .sb-ct-banner-card{padding:24px 16px}
${x} .sb-ct-split .sb-ct-badge{position:relative;inset:auto;margin:-48px auto 0;width:min(273px,100%)}
${x} .sb-ct-foot{grid-template-columns:1fr}
${x} .sb-ct-foot>div{text-align:center}
${x} .sb-ct-foot .sb-socials{justify-content:center}
${x} .sb-grid:has(>.sb-cat-card){grid-template-columns:1fr}
${x} .sb-grid-3:has(>.sb-post-card){grid-template-columns:1fr}
${x} .sb-ct-marquee{--ct-show:var(--ct-show-m)}
${x} .sb-cat-header.sb-container{flex-wrap:wrap}
${x} .sb-cat-header h1{font-size:34px;line-height:40px}
${x} .sb-cat-search.sb-container{grid-template-columns:1fr;gap:20px}
${x} .sb-post-header h1{font-size:30px;line-height:36px;padding:20px 12px}
${x} .sb-post-meta .sb-ct-post-title{font-size:28px;line-height:30px}
${x} .sb-block[data-block-type=postList]:has(.sb-related) h2{font-size:30px;line-height:36px}
${x} .sb-post-content .sb-heading>h2{font-size:30px;line-height:36px}
${x} .sb-post-content .sb-heading>h3{font-size:24px;line-height:29px}
${x} .sb-post-nav{flex-direction:column;gap:16px}
${x} .sb-link-card{flex-basis:100%}
${x} .sb-float{padding:0;background:none;box-shadow:none;color:var(--sb-accent)!important;font-size:11px;line-height:12px;max-width:110px;text-align:right}
`;

export const centralCss = `
${S}{--ct-line:#313131;font-family:var(--sb-font-body);font-size:16px;line-height:22.4px}
${S} h1,${S} h2,${S} h3,${S} h4{font-family:var(--sb-font-heading);font-weight:700;line-height:1.2;color:var(--ct-title);letter-spacing:0}
${S} p{margin:0 0 16px}
${S} .sb-container{width:min(1366px,100% - 32px);padding-block:0}
${S} main{padding-top:0!important}
${S} .sb-card{background:transparent;border-radius:25px}
${S} .sb-img-empty{background:#1c1c1c}
${S} .sb-block[data-block-type=header]{position:relative;z-index:10}

/* botões */
${S} .sb-btn{display:inline-block;padding:17px 32px;border:1px solid var(--sb-accent);border-radius:25px;background:var(--sb-accent);color:#121212!important;font-family:var(--sb-font-body);font-size:14px;font-weight:700;line-height:14px;letter-spacing:1px;text-transform:capitalize;text-align:center;transition:all .31s}
${S} .sb-btn:hover{background:transparent;color:var(--sb-accent)!important}
${S} .sb-btn-light{border-color:#fcfcfc;background:#fcfcfc}
${S} .sb-btn-light:hover{color:#fcfcfc!important}
${S} .sb-btn-wide{display:block;width:min(420px,100%);margin:0 auto 16px;padding:20px;border-radius:12px;font-size:16px;line-height:20px}
${S} .sb-link{color:var(--sb-accent)!important;font-family:var(--sb-font-body);font-size:14px;font-weight:700;letter-spacing:1px;text-transform:capitalize}

/* cabeçalho */
${S} .sb-header.sb-container{width:min(1366px,100% - 32px);min-height:132px;padding:32px 58px 32px 0;flex-wrap:nowrap;gap:0;align-items:center}
${S} .sb-logo{gap:12px;flex:none}
${S} .sb-logo img{width:auto;height:44px;border-radius:10px}
${S} .sb-logo strong{font-family:var(--sb-font-heading);font-size:22px;font-weight:600;color:var(--ct-title)}
${S} .sb-nav{margin:0 72px 0 auto;padding:0;gap:0;border:0;border-radius:0;background:none;color:var(--ct-title);font-family:var(--sb-font-body);font-size:16px;line-height:22.4px;text-transform:none}
${S} .sb-nav-item>a{padding:0 15px}
${S} .sb-nav-item>a:hover{color:var(--sb-accent)}
${S} .sb-nav-sub{border-radius:12px;background:var(--sb-bg);border:1px solid var(--ct-line)}
${S} .sb-nav-sub a{font-size:14px;text-transform:none}
${S} .sb-nav-sub a:hover{background:#1c1c1c;color:var(--sb-accent)}

/* títulos de seção */
${S} .sb-heading{padding:80px 0 0}
${S} .sb-heading>h1{font-size:50px;line-height:60px;text-transform:capitalize;margin:0}
${S} .sb-heading>h2{font-size:40px;line-height:48px;margin:40px 0 0;text-wrap:balance}
${S} .sb-heading>.sb-sub{margin:16px 0 0;font-size:16px}
${S} .sb-ct-eyebrow{display:flex;align-items:center;gap:10px;margin:0;color:var(--sb-accent);font-family:var(--sb-font-heading);font-size:15px;font-weight:700;line-height:18px}
${S} .sb-ct-eyebrow svg{flex:none;width:16px;height:16px}
${S} .sb-align-center .sb-ct-eyebrow{justify-content:center}
${S} .sb-heading:has(.sb-ct-eyebrow)>h2{margin-top:40px}

/* hero */
${S} .sb-ct-hero{padding:64px 0 0}
${S} .sb-ct-hero h1{margin:0 0 40px;font-size:76px;line-height:91.2px;text-align:center;text-transform:capitalize}
${S} .sb-ct-hero h1 em{font-style:normal;color:var(--sb-accent)}
${S} .sb-ct-intro{display:grid;grid-template-columns:minmax(0,538fr) minmax(0,808fr);gap:20px;align-items:center;padding:0 44px 56px}
${S} .sb-ct-intro p{margin:0}
${S} .sb-ct-proof{display:flex;align-items:center;gap:20px}
${S} .sb-ct-avatars{display:flex}
${S} .sb-ct-avatars img{width:65px;height:65px;margin-left:-15px;border:3px solid var(--sb-accent);border-radius:50%;object-fit:cover}
${S} .sb-ct-avatars img:first-child{margin-left:0}
${S} .sb-ct-proof strong{display:block;font-family:var(--sb-font-heading);font-size:28px;font-weight:600;line-height:33.6px;color:var(--ct-title)}
${S} .sb-ct-proof span{display:block}
${S} .sb-ct-panel{display:flex;flex-direction:column;justify-content:space-between;gap:48px;min-height:350px;padding:32px;border-radius:25px;background:var(--ct-img) center/cover no-repeat,#1c1c1c}
${S} .sb-ct-chips{display:flex;flex-wrap:wrap;gap:20px;max-width:911px;margin:0;padding:0;list-style:none}
${S} .sb-ct-chips a{display:block;padding:8px 32px;border-radius:25px;background:rgba(18,18,18,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);color:var(--sb-fg);line-height:22px;transition:color .3s}
${S} .sb-ct-chips a:hover{color:var(--sb-accent)}
${S} .sb-ct-panel-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}
${S} .sb-ct-play{position:relative;isolation:isolate;display:flex;flex:none;align-items:center;justify-content:center;width:80px;height:80px;border-radius:50%;background:rgba(0,0,0,.45);color:#fcfcfc;transition:color .3s}
${S} .sb-ct-play:hover{color:var(--sb-accent)}
${S} .sb-ct-play svg{width:34px;height:34px}
/* anel pulsando (no original: dois anéis de 15px, 3s, defasados) */
${S} .sb-ct-play::before,${S} .sb-ct-play::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:50%;color:#fcfcfc;box-shadow:0 0 0 0 currentColor;opacity:.6;animation:sb-ct-ripple 3s .9s infinite}
${S} .sb-ct-play::after{animation-delay:.3s}
@keyframes sb-ct-ripple{70%{box-shadow:0 0 0 15px currentColor;opacity:0}100%{box-shadow:0 0 0 0 currentColor;opacity:0}}
@media (prefers-reduced-motion:reduce){${S} .sb-ct-play::before,${S} .sb-ct-play::after{animation:none;opacity:0}}
${S} .sb-ct-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .sb-ct-hero-foot{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:20px}
${S} .sb-ct-hero-foot .sb-socials{gap:20px}
${S} .sb-ct-hero-foot ul{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:20px;margin:0;padding:0;list-style:none;font-family:var(--sb-font-heading);font-size:18px;font-weight:500;line-height:21.6px}

/* marquee de logos */
${S} .sb-ct-marquee{--ct-show:var(--ct-show-d,5);container-type:inline-size;overflow:hidden;width:min(1366px,100% - 32px);margin:40px auto 0}
${S} .sb-ct-marquee-track{display:flex;width:max-content;animation:var(--ct-anim,sb-ct-marquee) var(--ct-dur,15s) linear infinite}
${S} .sb-ct-logo{display:flex;flex:0 0 calc(100cqw / var(--ct-show));align-items:center;justify-content:center;height:82px;padding:0 24px}
${S} .sb-ct-logo img{width:auto;max-width:100%;max-height:50px;object-fit:contain}
${S} .sb-ct-marquee.is-static{overflow-x:auto}
${S} .sb-ct-marquee.is-static .sb-ct-marquee-track{animation:none}
${S} .sb-ct-marquee.is-static .dup{display:none}
@keyframes sb-ct-marquee{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){${S} .sb-ct-marquee-track{animation:none}}

/* texto + imagem */
${S} .sb-ct-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"text media";gap:0 64px;align-items:center;padding:80px 0 0}
${S} .sb-ct-split.v-spotlight{grid-template-areas:"media text"}
${S} .sb-ct-split.v-story{grid-template-areas:"text quotes" "media quotes";align-items:start}
${S} .sb-ct-split-text{grid-area:text;display:flex;flex-direction:column;align-items:flex-start;min-width:0}
${S} .sb-ct-split-text h2{margin:40px 0 24px;font-size:40px;line-height:48px}
${S} .sb-ct-split-text p{margin:0 0 16px}
${S} .sb-ct-split-text .sb-ct-quote{font-style:italic}
${S} .sb-ct-split-text .sb-btn{margin-top:8px}
${S} .sb-ct-split-media{grid-area:media;position:relative;min-width:0}
${S} .sb-ct-split-media>img,${S} .sb-ct-split-media>.sb-img-empty{width:100%;height:auto;border-radius:25px;object-fit:cover}
${S} .v-feature .sb-ct-split-media>img,${S} .v-feature .sb-ct-split-media>.sb-img-empty{aspect-ratio:683/498}
${S} .v-spotlight .sb-ct-split-media>img,${S} .v-spotlight .sb-ct-split-media>.sb-img-empty{aspect-ratio:651/783}
${S} .v-story .sb-ct-split-media>img,${S} .v-story .sb-ct-split-media>.sb-img-empty{aspect-ratio:619/487}
${S} .sb-ct-badge{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-width:240px;max-width:342px;padding:32px;border:1px solid var(--ct-line);border-radius:25px;background:var(--ct-img,none) center/cover,var(--sb-bg);text-align:center;color:#fcfcfc}
${S} .v-feature .sb-ct-badge{left:-33px;bottom:0}
${S} .v-spotlight .sb-ct-badge{right:-33px;bottom:-96px}
${S} .v-story .sb-ct-badge{right:-24px;bottom:-40px;max-width:280px}
${S} .v-spotlight{padding-bottom:96px}
${S} .v-story .sb-ct-split-text{padding-bottom:32px}
${S} .sb-ct-badge .ic{display:flex;color:var(--sb-accent)}
${S} .sb-ct-badge .ic svg{width:56px;height:56px}
${S} .sb-ct-badge strong{font-family:var(--sb-font-heading);font-size:50px;font-weight:700;line-height:60px;color:var(--ct-title)}
${S} .sb-ct-badge b{font-size:16px;font-weight:400;line-height:22.4px}
${S} .sb-ct-badge .stars{display:flex;gap:4px;color:var(--sb-accent)}
${S} .sb-ct-badge .stars svg{width:18px;height:18px}
${S} .sb-ct-badge span{display:block}
${S} .sb-ct-checks{display:flex;flex-direction:column;width:100%;margin:8px 0 24px;padding:0;list-style:none}
${S} .sb-ct-checks li{display:flex;align-items:center;gap:20px;padding:8px 0;border-bottom:1px solid var(--ct-line)}
${S} .sb-ct-checks .ic{display:flex;flex:none;align-items:center;justify-content:center;width:80px;height:80px;border-radius:50%;background:var(--sb-accent);color:#121212}
${S} .sb-ct-checks .ic svg{width:40px;height:40px}
${S} .sb-ct-checks b{font-family:var(--sb-font-heading);font-size:22px;font-weight:600;line-height:26.4px;color:var(--ct-title)}
${S} .sb-ct-quotes{grid-area:quotes;display:flex;flex-direction:column;gap:20px;min-width:0}
${S} .sb-ct-quote-card{position:relative;padding:32px;border:1px solid var(--ct-line);border-radius:25px}
${S} .sb-ct-quote-card header{display:flex;align-items:center;gap:20px;margin-bottom:24px}
${S} .sb-ct-quote-card img{width:60px;height:60px;border:3px solid var(--sb-accent);border-radius:50%;object-fit:cover}
${S} .sb-ct-quote-card strong{display:block;font-family:var(--sb-font-heading);font-size:22px;font-weight:600;line-height:26.4px;color:var(--ct-title)}
${S} .sb-ct-quote-card small{color:var(--sb-accent);font-size:16px}
${S} .sb-ct-quote-card::after{content:"\\201D";position:absolute;top:20px;right:32px;color:var(--sb-accent);font:700 72px/1 Georgia,serif}
${S} .sb-ct-quote-card p{margin:0}

/* grade de cartões */
${S} .sb-ct-fg{padding-top:48px}
${S} .sb-ct-fg-grid{display:grid;grid-template-columns:repeat(var(--ct-cols,3),minmax(0,1fr));gap:20px}
${S} .sb-ct-fg .item{position:relative;border:1px solid var(--ct-line);border-radius:25px;text-align:center;color:inherit}
${S} .sb-ct-fg h3{margin:0;font-size:28px;font-weight:600;line-height:33.6px}
${S} .sb-ct-fg p{margin:0}
${S} .sb-ct-fg .more{display:inline-block;margin-top:16px;color:var(--sb-accent);font-size:14px;font-weight:700;letter-spacing:1px;text-transform:capitalize}
${S} .sb-ct-fg .ic{display:flex}
${S} .v-simple .item{display:flex;align-items:center;justify-content:center;min-height:171px;padding:0 33px}
${S} .v-icon .item{display:flex;flex-direction:column;align-items:center;min-height:327px;padding:32px 33px 36px;background:var(--ct-img,none) center/cover no-repeat}
${S} .v-icon .item .ic{align-items:center;justify-content:center;width:84px;height:84px;border-radius:50%;background:var(--sb-accent);color:#121212}
${S} .v-icon .item .ic svg{width:40px;height:40px}
${S} .v-icon .item h3{margin:30px 0 10px}
${S} .v-numbered .item{padding:32px 33px 40px}
${S} .v-numbered .col{display:flex;flex-direction:column;gap:20px}
${S} .v-numbered .num{display:flex;align-items:center;gap:20px;font-family:var(--sb-font-heading);font-size:50px;font-weight:700;line-height:60px;color:var(--ct-title)}
${S} .v-numbered .num::before,${S} .v-numbered .num::after{content:"";flex:1;border-top:1px solid var(--ct-line)}
${S} .v-numbered .ic{justify-content:center;color:var(--sb-accent)}
${S} .v-numbered .ic svg{width:48px;height:48px}
${S} .v-numbered .item h3{margin:30px 0 0}
${S} .v-product .item{display:flex;flex-direction:column;justify-content:space-between;min-height:652px;overflow:hidden;text-align:left}
${S} .v-product .item>img,${S} .v-product .item>.sb-img-empty{position:absolute;inset:0;width:100%;height:100%;border-radius:0;object-fit:cover}
${S} .v-product .item>img{filter:brightness(.62)}
${S} .v-product .tag{position:relative;align-self:flex-end;margin:16px;padding:20px 28px;border-radius:25px;background:rgba(0,0,0,.6);color:var(--sb-accent);font-size:16px;text-transform:uppercase;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
${S} .v-product .inner{position:relative;margin:16px;padding:32px;border-radius:25px;background:rgba(0,0,0,.62);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
${S} .v-product .kicker{display:block;margin-bottom:0;color:var(--sb-accent)}
${S} .v-product .inner h3{margin:30px 0 8px;font-size:27px;line-height:32.4px}
${S} .v-product .inner p{margin-bottom:16px;color:#fcfcfc}
${S} .v-product .inner .sb-btn{margin-top:8px}

/* banners de título e de chamada */
${S} .sb-ct-banner{margin-top:32px;padding:64px 32px;border-radius:25px;background:var(--ct-img) center/cover no-repeat,linear-gradient(135deg,#0d3d1c,#082612)}
${S} .sb-ct-banner-card{width:min(911px,100%);margin:0 auto;padding:32px;border-radius:25px;background:rgba(0,0,0,.4);text-align:center}
${S} .sb-ct-banner h1{margin:0;font-size:50px;line-height:60px}
${S} .sb-ct-banner.m-title h1{text-transform:capitalize}
${S} .sb-ct-banner.m-cta{margin-top:80px;padding:32px}
${S} .sb-ct-banner.m-cta .sb-ct-banner-card{width:min(781px,100%);padding:32px;background:rgba(0,0,0,.5)}
${S} .sb-ct-banner h2{margin:40px 0 16px;font-size:40px;line-height:48px}
${S} .sb-ct-banner.m-error{display:flex;min-height:640px;align-items:center;margin-top:0;border-radius:0;background:var(--sb-bg)}
${S} .sb-ct-banner.m-error .sb-ct-banner-card{background:transparent}
${S} .sb-ct-banner .code{margin:0;color:var(--sb-accent);font-family:var(--sb-font-heading);font-size:120px;font-weight:700;line-height:130px}

/* rodapé */
${S} .sb-ct-footer{margin-top:80px;padding-top:40px;background:var(--sb-bg)}
${S} .sb-ct-foot{display:grid;grid-template-columns:minmax(0,446fr) minmax(0,209fr) minmax(0,241fr) minmax(0,310fr);gap:56px;padding:40px 0}
${S} .sb-ct-foot-brand{display:flex;flex-direction:column;align-items:center;gap:20px}
${S} .sb-ct-foot a.sb-logo{display:flex;align-items:center;gap:12px;margin:0}
${S} .sb-ct-foot-brand .sb-logo img{height:64px}
${S} .sb-ct-foot-brand .sb-logo strong{font-size:30px}
${S} .sb-ct-foot h4{margin:0 0 20px;color:var(--sb-accent);font-size:22px;font-weight:600;line-height:26.4px}
${S} .sb-ct-foot a{display:block;margin:0 0 10px;color:#fcfcfc;font-size:16px;line-height:22.4px}
${S} .sb-ct-foot a:hover{color:var(--sb-accent)}
${S} .sb-socials{gap:5px}
${S} .sb-socials a{display:flex;align-items:center;justify-content:center;width:40px;height:40px;margin:0;border-radius:50%;background:var(--sb-accent);color:#121212}
${S} .sb-socials a:hover{color:#121212;opacity:.85}
${S} .sb-socials svg{width:18px;height:18px}
${S} .sb-ct-foot-bottom{padding:20px 0 24px;border-top:1px solid var(--ct-line);text-align:center;font-size:16px}
${S} .sb-float{display:flex;align-items:center;gap:8px;right:20px;bottom:20px;padding:8px 18px 8px 8px;border-radius:40px;background:var(--sb-accent);color:#121212!important;font-size:14px;font-weight:700;line-height:18px;box-shadow:0 4px 8px rgba(0,0,0,.25)}
${S} .sb-float svg{display:block;flex:none;width:40px;height:40px;padding:6px;border-radius:50%;background:#25d366;color:#fff}

/* busca, categoria e cartões de post */
${S} .sb-cat-search.sb-container{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 20px;margin:50px auto 0;padding:0}
${S} .sb-mag-search{gap:0;align-self:start}
${S} .sb-mag-search input{min-height:64px;padding:13px 30px;border:1px solid var(--ct-line);border-radius:15px;background:transparent;color:#fcfcfc;font-family:var(--sb-font-body);font-size:16px}
${S} .sb-mag-search input::placeholder{color:#777}
${S} .sb-mag-search .sb-btn{margin-left:8px;padding:0 24px;border:0;border-radius:12px;background:#2d2d2d;color:#fff!important;font-size:16px;line-height:16px}
${S} .sb-mag-search .sb-btn:hover{background:var(--sb-accent);color:#121212!important}
${S} .sb-mag-cats{gap:8px}
${S} .sb-mag-cats strong{font-family:var(--sb-font-body);font-size:16px;font-weight:400;color:#fcfcfc}
${S} .sb-mag-cats select,${S} .sb-select{height:49px;padding:8px 16px;border:1px solid #666;border-radius:3px;background:#fff;color:#000;font-family:var(--sb-font-body);font-size:16px}
${S} .sb-cat-header.sb-container{padding:50px 0 0}
${S} .sb-cat-header h1{font-size:50px;line-height:60px}
${S} .sb-cat-header .sb-btn{padding:17px 32px;font-family:'Roboto',sans-serif;font-size:20px;font-weight:500;line-height:20px}
${S} .sb-block[data-block-type=postList]>.sb-container{padding:64px 0 0}
${S} .sb-block[data-block-type=postList] .sb-empty{margin:0;text-align:left}
${S} .sb-grid-3:has(>.sb-post-card){gap:30px;margin:0}
${S} .sb-post-card{overflow:hidden}
${S} .sb-post-card h3{margin:0;font-size:22px;font-weight:500;line-height:32px}
${S} .sb-post-card.grid{padding:15px;border:1px solid rgba(0,255,32,.16);transition:border-color .4s ease-in-out,transform .4s ease-in-out}
${S} .sb-post-card.grid:hover{border-color:var(--sb-accent)}
${S} .sb-post-card.grid .sb-post-thumb{margin-bottom:20px}
${S} .sb-post-card.grid .sb-post-thumb img,${S} .sb-post-card.grid .sb-post-thumb .sb-img-empty{width:100%;aspect-ratio:395/237;height:auto;border-radius:20px;object-fit:cover}
${S} .sb-post-card.grid .sb-card-body{padding:0 6px 16px}
${S} .sb-post-card.grid h3{margin-bottom:12px}
${S} .sb-post-card.grid .sb-ct-cat{display:flex;align-items:center;gap:8px;margin:0 0 12px;color:var(--sb-accent)}
${S} .sb-post-card.grid .sb-ct-cat svg{flex:none;width:18px;height:18px}
${S} .sb-post-card.grid .sb-ct-cat a{color:var(--sb-accent)}
${S} .sb-post-card.grid p.ex{margin:0}
${S} .sb-post-card.archive{border:0;background:transparent}
${S} .sb-post-card.archive .sb-post-thumb img,${S} .sb-post-card.archive .sb-post-thumb .sb-img-empty{width:100%;aspect-ratio:435/287;height:auto;border-radius:25px 25px 0 0;object-fit:cover}
${S} .sb-post-card.archive .sb-tag{position:absolute;top:0;right:0;margin:20px;padding:7.2px 14.4px;border-radius:999px;background:var(--sb-accent);color:#121212;font-family:var(--sb-font-body);font-size:12px;font-weight:400;line-height:12px;text-transform:uppercase}
${S} .sb-post-card.archive .sb-card-body{padding:30px 30px 0}
${S} .sb-post-card.archive h3{margin:0 0 25px;color:var(--sb-accent);font-size:21px;font-weight:600;line-height:25.2px}
${S} .sb-post-card.archive h3 a{color:var(--sb-accent)}
${S} .sb-post-card.archive p.ex{margin:0 0 14px;color:#777;font-size:14px;line-height:21px}
${S} .sb-post-card.archive .sb-link{display:inline-block;margin-bottom:20px;font-size:12px;line-height:22.4px;text-transform:uppercase}

/* grade de categorias com foto */
${S} .sb-cat-card{display:flex;flex-direction:column-reverse;gap:0;min-height:0;padding:0;overflow:hidden;border:1px solid var(--ct-line);border-radius:25px;transition:border-color .4s}
${S} .sb-cat-card:hover{border-color:var(--sb-accent)}
${S} .sb-cat-card img,${S} .sb-cat-card .sb-img-empty{width:100%;height:auto;aspect-ratio:1;margin:0;object-fit:cover}
${S} .sb-cat-card .sb-cat-head{justify-content:center;align-items:center;min-height:123px;padding:16px;background:linear-gradient(135deg,rgba(17,228,79,.16),rgba(17,228,79,.03)),#121212;font-family:var(--sb-font-heading);font-size:24px;font-weight:600;line-height:28.8px;color:#fcfcfc;text-align:center}
${S} .sb-cat-card .sb-cat-head svg{display:none}
${S} .sb-cat-card .sb-cat-text{display:none}
${S} .sb-block[data-block-type=categoryGrid]>.sb-container{padding-top:64px}
${S} .sb-grid:has(>.sb-cat-card){grid-template-columns:repeat(4,minmax(0,1fr));margin:0}
${S} .sb-link-cards{gap:20px;margin:0}
${S} .sb-link-card{flex:0 0 calc((100% - 40px)/3);border:1px solid rgba(17,228,79,.4);border-radius:25px;text-align:center}
${S} .sb-link-card img{aspect-ratio:436/251}
${S} .sb-link-card .sb-cat-head{justify-content:center;padding:20px;font-family:var(--sb-font-heading);font-size:24px;font-weight:600;color:#fcfcfc}
${S} .sb-link-card .sb-cat-head b{display:none}
${S} .sb-block[data-block-type=linkCards]>.sb-container{padding-top:64px}
${S} .sb-video{border:3px solid var(--sb-accent);border-radius:8px;background:#000}
${S} .sb-block[data-block-type=videoGrid]>.sb-container{padding-top:40px}
${S} .sb-block[data-block-type=videoGrid] .sb-grid{gap:20px;margin:0;padding:0 32px}
${S} .sb-block[data-block-type=button]>.sb-container{padding:48px 0 0}

/* post */
${S} .sb-post-header.sb-container{margin-top:32px;padding:64px 32px;border-radius:25px;background:var(--ct-img,linear-gradient(135deg,#0d3d1c,#082612)) center/cover no-repeat,linear-gradient(135deg,#0d3d1c,#082612);text-align:center}
${S} .sb-post-header h1{width:min(911px,100%);margin:0 auto;padding:32px;border-radius:25px;background:rgba(0,0,0,.4);font-size:50px;line-height:60px;text-transform:capitalize}
${S} .sb-two-cols.sb-container{width:min(1200px,100% - 32px);grid-template-columns:minmax(0,880px) 300px;gap:20px;margin-top:72px;padding:0}
${S} .sb-col-main{min-width:0;padding:20px;border-radius:30px}
${S} .sb-post-meta{margin:0 0 16px;text-align:center}
${S} .sb-post-meta img{width:100%;height:auto;aspect-ratio:840/530;margin:0 auto 48px;border-radius:20px;object-fit:cover}
${S} .sb-post-meta .sb-tag{margin:0 0 24px;padding:0;background:none;color:#fcfcfc;font-family:var(--sb-font-body);font-size:16px;font-weight:300;line-height:24px;letter-spacing:10px}
${S} .sb-post-meta .sb-ct-post-title{margin:0 0 32px;font-family:'Poppins',sans-serif;font-size:40px;font-weight:600;line-height:40px;text-transform:none}
${S} .sb-post-meta time{display:block;margin-bottom:40px;color:var(--sb-fg);font-family:'Poppins',sans-serif;font-size:16px;font-weight:300}
${S} .sb-post-content .sb-container{width:100%;padding:0}
${S} .sb-post-content .sb-text p,${S} .sb-post-content .sb-list li{margin:0 0 17px;color:#fcfcfc;font-family:'Poppins',sans-serif;font-size:17px;font-weight:300;line-height:30.6px;letter-spacing:.2px}
${S} .sb-post-content .sb-text strong,${S} .sb-post-content .sb-text em{color:inherit}
${S} .sb-post-content .sb-text strong{font-weight:500}
${S} .sb-post-content .sb-inline-link{color:var(--sb-accent);text-decoration:none}
${S} .sb-post-content .sb-list{margin:0 0 17px;padding:0 0 0 40px;list-style:disc}
${S} .sb-post-content .sb-list li{margin:0}
${S} .sb-post-content .sb-list li::before{content:none}
${S} .sb-post-content .sb-heading{padding:0}
${S} .sb-post-content .sb-heading>h2{margin:40px 0 16px;font-size:40px;line-height:48px;letter-spacing:.2px}
${S} .sb-post-content .sb-heading>h3{margin:30px 0 16px;font-size:28px;font-weight:600;line-height:33.6px;letter-spacing:.2px}
${S} .sb-post-content .sb-heading>h4{margin:24px 0 12px;font-size:22px;font-weight:600;line-height:26.4px;letter-spacing:.2px}
${S} .sb-post-content .sb-image{padding:0;margin:10px 0}
${S} .sb-post-content .sb-image img{margin-inline:auto;border-radius:20px}
${S} .sb-sidebar{position:sticky;top:20px;align-self:start;gap:0;padding-top:20px}
${S} .sb-sidebar .sb-filter{flex-wrap:nowrap;gap:0;margin:0 0 20px}
${S} .sb-sidebar .sb-filter input{min-width:0;min-height:56px;padding:13px 20px;border:1px solid var(--ct-line);border-radius:15px;background:transparent;color:#fcfcfc}
${S} .sb-sidebar .sb-filter .sb-btn{margin-left:5px;padding:0 16px;border:0;border-radius:12px;background:#2d2d2d;color:#fff!important}
${S} .sb-sidebar h4{margin:0 0 8px;font-family:var(--sb-font-body);font-size:16px;font-weight:400;line-height:22.4px;color:#fcfcfc}
${S} .sb-sidebar form:has(.sb-select){margin-bottom:40px}
${S} .sb-sidebar img{margin:0;border-radius:20px}
${S} .sb-share.sb-container{width:min(1140px,100% - 32px);flex-direction:column;align-items:flex-start;gap:20px;padding:64px 0 0}
${S} .sb-share>span{font-family:'Poppins',sans-serif;font-size:16px;font-weight:300;line-height:24px;color:#fcfcfc}
${S} .sb-share>div{gap:22px}
${S} .sb-share button{width:23px;height:23px;color:#fcfcfc}
${S} .sb-share button:hover{color:var(--sb-accent)}
${S} .sb-share svg{width:22px;height:22px}
${S} .sb-post-nav.sb-container{width:min(1140px,100% - 32px);margin-top:32px;padding:32px 0 0;border-top:1px solid var(--ct-line);gap:0}
${S} .sb-post-nav>*{flex:0 0 50%;min-width:0}
${S} .sb-post-nav a{gap:15px;color:#fcfcfc}
${S} .sb-post-nav a:hover b{color:var(--sb-accent)}
${S} .sb-post-nav-next{justify-content:flex-end;text-align:right}
${S} .sb-post-nav span{min-width:0;font-family:'Poppins',sans-serif;font-size:16px;line-height:22.4px}
${S} .sb-post-nav small{font-size:16px;font-weight:300}
${S} .sb-post-nav b{overflow:hidden;font-weight:500;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap}
${S} .sb-block[data-block-type=postList]:has(.sb-related)>.sb-container{width:min(1140px,100% - 32px);padding:80px 0 0}
${S} .sb-block[data-block-type=postList]:has(.sb-related) h2{margin:0 0 32px;font-family:'Roboto',sans-serif;font-size:65px;font-weight:600;line-height:78px;text-align:center;text-transform:capitalize;color:#fff}

/* páginas de texto (termos, política) e link na bio */
${S}.sb-prose main .sb-container{width:min(1140px,100% - 32px)}
${S}.sb-prose main .sb-ct-banner.sb-container{width:min(1366px,100% - 32px)}
${S}.sb-prose .sb-heading{padding:0}
${S}.sb-prose .sb-heading h2{margin:32px 0 12px;font-size:28px;line-height:33.6px}
${S}.sb-prose .sb-text.sb-container{padding-block:0}
${S}.sb-prose .sb-text p{margin:0 0 16px}
${S}.sb-prose .sb-text .sb-inline-link{color:var(--sb-accent)}
${S}.sb-prose main>.sb-block:nth-child(2){padding-top:64px}
${S}.sb-bare main{padding:56px 0}
${S}.sb-bare .sb-container{width:min(480px,100% - 32px);padding-block:12px;text-align:center}
${S}.sb-bare .sb-image img{width:120px;margin:0 auto;border-radius:25px}
${S}.sb-bare .sb-heading{padding:0}
${S}.sb-bare .sb-heading>h1{font-size:28px;line-height:33.6px;text-transform:none}
${S}.sb-bare .sb-sub{color:var(--sb-fg)}
${S}.sb-bare .sb-social-row a{color:var(--sb-accent)}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
