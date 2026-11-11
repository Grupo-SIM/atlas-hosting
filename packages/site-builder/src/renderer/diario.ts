/**
 * Variante "diario" (`theme.variant = "diario"`, escopo `.sb-dd`): blog pessoal de estilo de vida, branco e roxo, com
 * layout inspirado num tema de blog (faixa da autora com o nome gigante ao fundo, menu com mega-menu de categorias,
 * destaques em mosaico, grade masonry com primeira letra destacada, faixa de fotos, post com barra lateral, rodapé
 * escuro). Medidas do CSS computado da demo em 2026-11-11; **código, marca, textos e imagens são próprios**.
 *
 * Tokens do tema: `accent` (roxo `#5608E0`), `fg` (texto `#646566`), `bg` (`#ffffff`); extras opcionais: `title`
 * (`#060429`), `hover` (`#4700C4`), `page` (`#EEEEEE`, fundo da grade), `strip` (`#F1F1F1`), `dark` (`#212326`),
 * `foot` (`#0F1012`). Fontes fixas da variante: Poppins (corpo), Playfair Display 900 (logo e nome da faixa) e Lora
 * (corpo do post).
 *
 * Breakpoints do Bootstrap 4 (576/768/992/1200), com a regra de cada faixa repetida sob `.sb-narrow` (a media query
 * não enxerga o quadro do editor). No quadro estreito valem todas as regras de tela pequena (visual de celular).
 */
export const isDiario = (theme: Record<string, string>) =>
  theme.variant === "diario";

/** Fontes fixas da variante (nunca texto do usuário). */
export const DIARIO_EXTRA_FONTS = ["Poppins", "Playfair Display", "Lora"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function diarioVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--dd-accent": safe(theme.accent, "#5608E0"),
    "--dd-dark": safe(theme.dark, "#212326"),
    "--dd-foot": safe(theme.foot, "#0F1012"),
    "--dd-hover": safe(theme.hover, "#4700C4"),
    "--dd-page": safe(theme.page, "#EEEEEE"),
    "--dd-strip": safe(theme.strip, "#F1F1F1"),
    "--dd-text": safe(theme.fg, "#646566"),
    "--dd-title": safe(theme.title, "#060429"),
  };
}

/** Ondas finas (SVG próprio) para a faixa da autora (claras) e o rodapé (escuras). */
const waves = (stroke: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="30" viewBox="0 0 160 30"><path d="M0 15Q20 0 40 15T80 15T120 15T160 15" fill="none" stroke="${stroke}" stroke-width="1.2"/></svg>`
  )}")`;

const S = ".sb-dd";
const N = `${S}.sb-narrow`;

/** Altura fixa da faixa da autora por formato (o bloco gruda com `top` negativo igual a ela, deixando só a barra do menu). */
const strip = (x: string, home: number, compact: number) => `
${x}>.sb-block[data-block-type=ddHeader]:has(.dd-home){top:calc(var(--sb-sticky-top,0px) - ${home}px)}
${x}>.sb-block[data-block-type=ddHeader]:has(.dd-compact){top:calc(var(--sb-sticky-top,0px) - ${compact}px)}
${x} .dd-home .dd-strip{height:${home}px}
${x} .dd-compact .dd-strip{height:${compact}px}
`;

/** ≤ 1199 (lg): 3 colunas, mosaico 1 + 3. */
const lg = (x: string) => `
${x} .dd-mgrid{column-count:3}
${x} .dd-mosaic{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .dd-mosaic>.dd-ov{grid-column:1/-1;height:420px}
${x} .dd-mright{display:contents}
${x} .dd-mright>.dd-ov{height:260px}
${x} .dd-mright>.dd-ov:nth-child(3){grid-column:auto}
${x} .dd-mright .dd-otitle{font-size:20px;line-height:28px}
${x} .dd-cols-in{grid-template-columns:minmax(0,1fr) 300px;gap:30px}
${x} .dd-in,${x} .sb-container,${x} .dd-cols-in{width:min(960px,100% - 30px)}
${x} .dd-foot-in{grid-template-columns:1fr 280px 1fr}
${x} .dd-menu a{padding:0 11px;font-size:14px}
`;

/** ≤ 991 (md): hambúrguer, menu lateral, 2 colunas. */
const md = (x: string) => `
${x} .dd-mgrid{column-count:2}
${x} .dd-menu,${x} .dd-bar-r .dd-btn,${x} .dd-home .dd-lupa{display:none}
${x} .dd-burger-btn{display:flex}
${x} .dd-bar-in{justify-content:space-between;padding:0 15px}
${x} .dd-home .dd-bar-in,${x} .dd-compact .dd-bar-in{flex-direction:row-reverse}
${x} .dd-logo{order:0}
${x} .dd-wordmark{font-size:34px}
${x} .dd-veil-menu,${x} .dd-drawer{display:block}
${x} .dd-bar{height:60px}
${x} .dd-bar-in{height:60px}
${x} .dd-lupa{display:flex}
${x} .dd-compact .dd-bar-r{display:flex}
${x} .dd-strip-in>.dd-soc,${x} .dd-strip-r{display:none}
${x} .dd-strip-in{justify-content:center}
${x} .dd-strip,${x} .dd-compact .dd-strip{padding:15px}
${x} .dd-photo,${x} .dd-compact .dd-photo{width:90px;height:90px;box-shadow:0 0 0 5px #fff}
${x} .dd-bgname{font-size:64px;top:62px}
${x} .dd-compact .dd-strip-compact{justify-content:center;text-align:left}
${x} .dd-compact .dd-soc{display:none}
${x} .dd-cols-in{grid-template-columns:minmax(0,1fr);width:min(720px,100% - 30px)}
${x} .dd-cols-b{margin-top:40px}
${x} .dd-in,${x} .sb-container{width:min(720px,100% - 30px)}
${x} .dd-foot-in{grid-template-columns:minmax(0,1fr);justify-items:center;gap:26px;text-align:center}
${x} .dd-foot-links{justify-content:center}
${x} .dd-pimg{height:340px}
`;

/** ≤ 767 (sm): mosaico empilhado, uma coluna. */
const sm = (x: string) => `
${x} .dd-mosaic{grid-template-columns:minmax(0,1fr)}
${x} .dd-mosaic>.dd-ov,${x} .dd-mright>.dd-ov{height:300px}
${x} .dd-mosaic>.dd-ov .dd-otitle,${x} .dd-mright .dd-otitle{font-size:26px;line-height:34px}
${x} .dd-mgrid,${x} .dd-two .dd-mgrid{column-count:1}
${x} .dd-pimg{height:260px}
${x} .dd-phead h1,${x} .dd-about h1{font-size:26px;line-height:34px}
${x} .dd-pfoot{flex-direction:column;align-items:flex-start}
${x} .dd-compact .dd-strip-text{max-width:60vw}
${x} .dd-hello{font-size:30px}
${x} .dd-sub-hello{font-size:16px}
${x} .dd-nf-code{font-size:110px}
${x} .sb-post-nav{grid-template-columns:minmax(0,1fr);gap:40px}
${x} .sb-post-nav .sb-post-nav-next{text-align:left;justify-content:flex-start}
`;

/** ≤ 575 (xs). */
const xs = (x: string) => `
${x} .dd-in,${x} .sb-container,${x} .dd-cols-in{width:calc(100% - 30px)}
${x} .dd-mosaic>.dd-ov,${x} .dd-mright>.dd-ov{height:260px}
${x} .dd-ov-body{padding:20px}
${x} .dd-bgname{font-size:46px;top:76px}
${x} .dd-pimg{height:200px}
${x} .dd-foot-logo .dd-wordmark{font-size:44px}
`;

export const diarioCss = `
${S}{background:#fff;color:var(--dd-text);font-family:'Poppins',sans-serif;font-size:16px;line-height:24px}
${S} main{padding:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5{font-family:'Poppins',sans-serif;font-weight:700;line-height:1.2;color:var(--dd-title);margin:0}
${S} p{margin:0 0 1em}
${S} button{font-family:inherit}
${S} ul{margin:0;padding:0;list-style:none}
${S} .sb-container{width:min(1140px,100% - 30px);padding-block:0}
${S} .dd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .dd-in{width:min(1140px,100% - 30px);margin:0 auto}
${S} .dd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 30px;border:0;border-radius:0;background:var(--dd-accent);color:#fff;font-size:12px;font-weight:600;letter-spacing:1.5px;line-height:1.5;text-transform:uppercase;cursor:pointer;transition:background-color .3s}
${S} .dd-btn:hover{background:var(--dd-hover)}
${S} .dd-btn svg{width:14px;height:14px}
${S} .dd-btn-dark{padding:14px 30px;background:var(--dd-dark)}
${S} .dd-btn-dark:hover{background:#000}
${S} .dd-btn-full{width:100%}

/* ── cabeçalho: faixa da autora + barra do menu ── */
${S}>.sb-block[data-block-type=ddHeader]{position:sticky;z-index:1040}
${S} .dd-header{position:relative;background:#fff}
${S} .dd-burger-input,${S} .dd-search-input{position:absolute;width:0;height:0;opacity:0;pointer-events:none}
${S} .dd-strip{position:relative;overflow:hidden;padding:40px 30px;background:var(--dd-strip) ${waves("#e2e2e2")}}
${S} .dd-bgname{position:absolute;top:102px;left:0;right:0;z-index:0;color:#999;font-family:'Playfair Display',serif;font-size:120px;font-weight:900;line-height:1;text-align:center;white-space:nowrap;opacity:.2;pointer-events:none;user-select:none}
${S} .dd-strip-in{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;width:min(1140px,100%);margin:0 auto}
${S} .dd-photo{display:block;flex:none;width:160px;height:160px;overflow:hidden;border-radius:50%;box-shadow:0 0 0 8px #fff;background:#ddd}
${S} .dd-photo img,${S} .dd-photo .sb-img-empty{width:100%;height:100%;min-height:0;object-fit:cover}
${S} .dd-soc{display:flex;align-items:center;gap:10px}
${S} .dd-soc a{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:1px solid var(--dd-accent);color:var(--dd-accent);opacity:.7;transition:opacity .2s}
${S} .dd-soc a:hover{opacity:1}
${S} .dd-soc svg{width:16px;height:16px}
${S} .dd-strip-r{display:flex;align-items:center;gap:30px}
${S} .dd-searchlink{display:inline-flex;align-items:center;gap:8px;color:#888;font-size:15px;cursor:pointer}
${S} .dd-searchlink svg{width:16px;height:16px}
${S} .dd-searchlink:hover{color:var(--dd-title)}
${S} .dd-strip-compact{justify-content:flex-start;gap:30px}
${S} .dd-compact .dd-strip{padding:34px 30px}
${S} .dd-compact .dd-photo{width:100px;height:100px;box-shadow:0 0 0 6px #fff}
${S} .dd-strip-text{min-width:0}
${S} .dd-hello{margin:0;color:var(--dd-title);font-family:'Playfair Display',serif;font-size:44px;font-weight:900;line-height:1.1}
${S} .dd-sub-hello{margin:4px 0 10px;color:var(--dd-text);font-size:28px;line-height:1.2}
${S} .dd-soc-text{gap:18px}
${S} .dd-soc-text a{width:auto;height:auto;border:0;color:var(--dd-title);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;opacity:.7}
${S} .dd-bar{position:relative;height:68px;border-bottom:1px solid #e4e4e4;background:#fff}
${S} .dd-bar-in{position:relative;display:flex;align-items:center;justify-content:center;width:min(1140px,100%);height:68px;margin:0 auto}
${S} .dd-logo{display:flex;align-items:center;flex:none;margin:0 30px}
${S} .dd-logo img{width:auto;height:48px}
${S} .dd-wordmark{color:var(--dd-title);font-family:'Playfair Display',serif;font-size:38px;font-weight:900;line-height:1;letter-spacing:-.5px;white-space:nowrap}
${S} .dd-menu{display:flex;align-items:center;height:100%}
${S} .dd-menu>ul{display:flex;align-items:stretch;height:100%}
${S} .dd-menu-l{flex:1;justify-content:flex-end}
${S} .dd-menu-r{flex:1;justify-content:flex-start}
${S} .dd-menu>ul>li{display:flex;align-items:center}
${S} .dd-menu a{display:flex;align-items:center;gap:5px;height:100%;padding:0 15px;color:#000;font-size:15px;font-weight:500;text-transform:uppercase;white-space:nowrap;transition:color .2s}
${S} .dd-menu a:hover,${S} .dd-menu a[aria-current=page]{color:var(--dd-accent)}
${S} .dd-chev{width:11px;height:11px;flex:none}
${S} .dd-compact .dd-bar-in{justify-content:flex-start}
${S} .dd-compact .dd-logo{margin:0 20px 0 15px}
${S} .dd-compact .dd-wordmark{font-size:30px}
${S} .dd-compact .dd-menu{flex:1}
${S} .dd-bar-r{display:flex;align-items:center;gap:22px;margin-left:auto;padding-right:15px}
${S} .dd-bar-r .dd-btn{padding:12px 24px}
${S} .dd-lupa{display:flex;align-items:center;justify-content:center;padding:0 15px;color:#000;cursor:pointer;transition:color .2s}
${S} .dd-lupa:hover{color:var(--dd-accent)}
${S} .dd-lupa svg{width:18px;height:18px}
${S} .dd-burger-btn{display:none;align-items:center;justify-content:center;color:#000;cursor:pointer}
${S} .dd-burger-btn svg{width:28px;height:28px}

/* submenu comum e mega-menu de categorias (CSS puro: hover e foco) */
${S} .dd-has{position:relative}
${S} .dd-hasmega{position:static}
${S} .dd-sub{position:absolute;top:100%;left:0;z-index:5;display:none;width:250px;padding:10px 15px;background:#fff;box-shadow:0 0 40px rgba(0,16,147,.15)}
${S} .dd-has:hover>.dd-sub,${S} .dd-has:focus-within>.dd-sub{display:block}
${S} .dd-sub li{display:block}
${S} .dd-sub a{height:auto;padding:8px 0;color:#A5A5A5;font-size:15px;font-weight:400;text-transform:capitalize}
${S} .dd-sub a:hover{color:var(--dd-accent)}
${S} .dd-mega{position:absolute;top:100%;left:0;right:0;z-index:5;display:none;grid-template-columns:230px minmax(0,1fr);min-height:300px;border-top:2px solid var(--dd-title);background:#fff;box-shadow:0 0 40px rgba(0,16,147,.15)}
${S} .dd-hasmega:hover>.dd-mega,${S} .dd-hasmega:focus-within>.dd-mega,${S} .dd-mega.is-preview{display:grid}
${S} .dd-tabs{background:var(--dd-strip)}
${S} .dd-tab>a{display:block;height:auto;padding:14px 20px;color:var(--dd-title);font-size:15px;font-weight:500;text-transform:none}
${S} .dd-tab:hover>a,${S} .dd-tab:focus-within>a{background:#fff;color:var(--dd-accent)}
${S} .dd-mega:not(:has(.dd-tab:hover,.dd-tab:focus-within)) .dd-tab:first-child>a{background:#fff}
${S} .dd-tabpanel{position:absolute;top:0;right:0;bottom:0;left:230px;display:none;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;padding:22px 20px}
${S} .dd-tab:hover>.dd-tabpanel,${S} .dd-tab:focus-within>.dd-tabpanel{display:grid}
${S} .dd-mega:not(:has(.dd-tab:hover,.dd-tab:focus-within)) .dd-tab:first-child>.dd-tabpanel{display:grid}
${S} .dd-mpost{display:block;height:auto;padding:0;color:var(--dd-title);font-size:15px;font-weight:600;line-height:22px;text-transform:none;white-space:normal}
${S} .dd-mpost:hover{color:var(--dd-accent)}
${S} .dd-mpost img,${S} .dd-mpost .sb-img-empty{width:100%;height:auto;aspect-ratio:224/189;min-height:0;margin-bottom:10px;object-fit:cover}
${S} .dd-mpost span{display:block}

/* busca de largura total sobre a barra */
${S} .dd-searchbox{position:absolute;inset:0;z-index:3;display:flex;align-items:center;background:#fff;transform:translateY(-100%);visibility:hidden;transition:transform .3s ease,visibility 0s .3s}
${S} .dd-search-input:checked~.dd-bar .dd-searchbox{transform:none;visibility:visible;transition-delay:0s}
${S} .dd-searchbox form{flex:1}
${S} .dd-searchbox input{width:100%;height:68px;padding:0 30px;border:0;background:transparent;color:var(--dd-title);font:inherit;font-size:26px;outline:0}
${S} .dd-searchbox input::placeholder{color:#b5b5b5;opacity:1}
${S} .dd-searchx{display:flex;align-items:center;justify-content:center;width:68px;height:68px;color:#000;font-size:36px;line-height:1;cursor:pointer}

/* menu lateral (<992px) */
${S} .dd-veil-menu{position:fixed;inset:0;z-index:1050;display:none;background:rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:opacity .2s,visibility 0s .2s}
${S} .dd-drawer{position:fixed;top:0;right:0;bottom:0;z-index:1060;display:none;width:82%;max-width:380px;padding:20px;overflow-y:auto;background:#fff;transform:translateX(100%);visibility:hidden;transition:transform .3s ease-in-out,visibility 0s .3s}
${S} .dd-burger-input:checked~.dd-veil-menu{opacity:1;visibility:visible;transition-delay:0s}
${S} .dd-burger-input:checked~.dd-drawer{transform:none;visibility:visible;transition-delay:0s}
html:has(.dd-burger-input:checked){overflow:hidden}
${S} .dd-drawer-logo{display:flex;justify-content:center;margin-bottom:14px;padding-bottom:16px;border-bottom:1px solid #e4e4e4}
${S} .dd-drawer ul{display:block}
${S} .dd-drawer li{border-bottom:1px solid #eee}
${S} .dd-drawer a,${S} .dd-drawer summary{display:flex;align-items:center;justify-content:space-between;padding:12px 0;color:#000;font-size:15px;font-weight:500;text-transform:uppercase;cursor:pointer;list-style:none}
${S} .dd-drawer summary::-webkit-details-marker{display:none}
${S} .dd-drawer details[open] .dd-chev{transform:rotate(180deg)}
${S} .dd-drawer details ul{padding:0 0 8px 14px}
${S} .dd-drawer details li{border:0}
${S} .dd-drawer details a{padding:8px 0;color:#7d7d7d;font-weight:400;text-transform:none}
${S} .dd-drawer-search input{width:100%;height:44px;margin:16px 0;padding:0 14px;border:1px solid #ddd;font:inherit;font-size:15px;outline:0}
${S} .dd-drawer .dd-soc{margin-bottom:16px}
${S} .dd-drawer .dd-btn{width:100%}

/* ── destaques em mosaico ── */
${S} .dd-mosaic{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:4px;padding-top:4px}
${S} .dd-mosaic>.dd-ov{height:488px}
${S} .dd-mright{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:4px}
${S} .dd-mright>.dd-ov:nth-child(3){grid-column:1/-1}
${S} .dd-mosaic>.dd-ov .dd-otitle{font-size:36px;line-height:46px;font-weight:700}

/* cartão sobre foto */
${S} .dd-ov{position:relative;display:block;overflow:hidden;min-height:0;background:#222}
${S} .dd-ov>img,${S} .dd-ov>.sb-img-empty{position:absolute;inset:0;width:100%;height:100%;min-height:0;object-fit:cover;transition:transform .5s ease}
${S} .dd-ov:hover>img{transform:scale(1.2) rotate(-5deg)}
${S} .dd-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5) 0,rgba(0,0,0,0) 50%,rgba(0,0,0,.59) 100%);pointer-events:none}
${S} .dd-ov-body{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:30px}
${S} .dd-label{display:inline-block;margin-bottom:10px;padding:2px 10px 3px;background:#fff;color:#000;font-size:12px;font-weight:700;line-height:1.5;text-transform:uppercase}
${S} .dd-otitle{margin:0;color:#fff;font-size:24px;font-weight:600;line-height:32px}
${S} .dd-otitle a{color:#fff}
${S} .dd-ov-link::after{content:"";position:absolute;inset:0}
${S} .dd-ov-link span{transition:box-shadow .3s}
${S} .dd-ov:hover .dd-ov-link span{box-shadow:inset 0 -2px 0 #fff}
${S} .dd-ometa{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0 0;color:#fff;font-size:13px;font-weight:500;text-transform:uppercase}
${S} .dd-ometa i{font-style:normal;opacity:.7}
${S} .dd-ov-center .dd-veil{background:radial-gradient(ellipse at center,rgba(0,0,0,.6) 0,transparent 100%)}
${S} .dd-ov-center .dd-ov-body{align-items:center;justify-content:center;text-align:center}

/* ── grade masonry ── */
${S} .dd-masonry{padding:80px 15px 50px;background:var(--dd-page)}
${S} .dd-masonry.dd-two{padding:0;background:none}
${S} .dd-mgrid{column-count:4;column-gap:30px}
${S} .dd-two .dd-mgrid{column-count:2}
${S} .dd-masonry .dd-card{break-inside:avoid;margin:0 0 30px}
${S}.sb-js [data-sg-hide]{display:none}
${S} .dd-masonry .dd-ov.dd-card{height:366px}
${S} .dd-light{padding:25px;background:#fff}
${S} .dd-cimg{display:block;overflow:hidden;margin-bottom:18px}
${S} .dd-cimg img,${S} .dd-cimg .sb-img-empty{width:100%;height:auto;min-height:0;aspect-ratio:4/3;object-fit:cover;transition:transform .5s ease}
${S} .dd-card:nth-child(4n+1) .dd-cimg img{aspect-ratio:3/4}
${S} .dd-card:nth-child(4n+3) .dd-cimg img{aspect-ratio:16/10}
${S} .dd-cimg:hover img{transform:scale(1.2) rotate(-5deg)}
${S} .dd-cline{margin:0 0 8px;color:#333;font-size:15px;font-style:italic;font-weight:500;line-height:22px}
${S} .dd-cat{color:var(--dd-accent)}
${S} .dd-ctitle{margin:0 0 15px;color:var(--dd-title);font-size:24px;font-weight:600;line-height:32px}
${S} .dd-ctitle a{color:inherit;transition:color .2s}
${S} .dd-ctitle a:hover{color:var(--dd-accent)}
${S} .dd-fl::first-letter{float:left;margin:0 10px 0 0;padding:0 10px;background:var(--dd-accent);color:#fff}
${S} .dd-cfoot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:6px;color:#333;font-size:14px;font-weight:500}
${S} .dd-read{color:#333}
${S} .dd-share{position:relative}
${S} .dd-share-label{display:inline-block;padding:0;border:0;background:none;font-size:inherit;font-weight:inherit;color:#333;cursor:pointer;transition:color .2s}
${S} .dd-cfoot .dd-share:hover .dd-share-label,${S} .dd-cfoot .dd-share:focus-within .dd-share-label{color:var(--dd-accent)}
${S} .dd-balloon{position:absolute;right:-8px;bottom:calc(100% + 10px);z-index:4;display:none;gap:4px;padding:8px 10px;background:var(--dd-dark);box-shadow:0 4px 12px rgba(0,0,0,.25)}
${S} .dd-balloon::after{content:"";position:absolute;top:100%;right:22px;border:6px solid transparent;border-top-color:var(--dd-dark)}
${S} .dd-cfoot .dd-share:hover .dd-balloon,${S} .dd-cfoot .dd-share:focus-within .dd-balloon{display:flex}
${S} .dd-balloon a{display:flex;align-items:center;justify-content:center;width:30px;height:30px;color:#fff;opacity:.8;transition:opacity .2s}
${S} .dd-balloon a:hover{opacity:1}
${S} .dd-balloon svg{width:16px;height:16px}
${S} .dd-morerow{position:relative;display:flex;justify-content:center;margin-top:20px}
${S} .dd-morerow::before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:#d4d4d4}
${S} .dd-morerow .dd-btn{position:relative;padding:12px 30px;font-weight:500;letter-spacing:1px}
${S} .dd-two .dd-morerow .dd-btn{margin-top:0}
${S} .sg-more{display:none}
${S}.sb-js .sg-more{display:inline-flex}
${S} .sg-more[hidden]{display:none!important}

/* ── faixa de fotos ── */
${S} .dd-photos{position:relative;z-index:1;margin-bottom:-50px;padding:10px 0;overflow:hidden;background:#fff}
${S} .dd-ptrack{display:flex;gap:10px;width:max-content;animation:dd-run var(--dd-sec,28s) linear infinite}
${S} .dd-photos:hover .dd-ptrack{animation-play-state:paused}
${S} .dd-photos.is-edit{overflow-x:auto}
${S} .dd-photos.is-edit .dd-ptrack{animation:none}
${S} .dd-pitem{display:block;flex:none;width:194px;height:210px;overflow:hidden}
${S} .dd-pitem img,${S} .dd-pitem .sb-img-empty{width:100%;height:100%;min-height:0;object-fit:cover;transition:transform .5s ease}
${S} .dd-pitem:hover img{transform:scale(1.2) rotate(-5deg)}
@keyframes dd-run{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 5px))}}

/* ── rodapé ── */
${S} .dd-foot{position:relative;padding-top:70px;background:var(--dd-foot) ${waves("#1b1c1f")};color:#fff}
${S} .dd-foot-in{display:grid;grid-template-columns:1fr 360px 1fr;align-items:center;gap:30px;width:min(1140px,100% - 30px);margin:0 auto;padding-bottom:50px}
${S} .dd-foot-links{display:flex;flex-wrap:wrap;gap:8px 28px}
${S} .dd-foot-links a{color:rgba(255,255,255,.5);font-size:15px;transition:color .2s}
${S} .dd-foot-links a:hover{color:#fff}
${S} .dd-foot-logo{display:flex;justify-content:center}
${S} .dd-foot-logo .dd-wordmark{color:#fff;font-size:54px}
${S} .dd-foot-logo img{width:100%;max-width:360px;height:auto}
${S} .dd-foot .dd-soc{justify-content:flex-end}
${S} .dd-foot .dd-soc a{width:40px;height:40px;border:0;border-radius:50%;background:#1E1F1F;color:#fff;opacity:1;transition:background-color .2s}
${S} .dd-foot .dd-soc a:hover{background:var(--dd-accent)}
${S} .dd-foot-copy{padding:24px 15px;border-top:1px solid rgba(255,255,255,.08);text-align:center}
${S} .dd-foot-copy p{margin:0;color:#6B6B6B;font-family:'Lora',serif;font-size:15px;font-style:italic}

/* modal de assinatura (popover nativo: Esc e clique fora fecham) */
${S} .dd-modal{width:min(480px,100% - 30px);padding:0;border:0;background:transparent;color:var(--dd-text)}
${S} .dd-modal::backdrop{background:rgba(0,0,0,.6)}
${S} .dd-modal.is-static{display:block;position:relative;margin:20px auto}
${S} .dd-modal-box{position:relative;padding:44px 40px 36px;background:#fff;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.3)}
${S} .dd-modal-x{position:absolute;top:8px;right:12px;padding:0 6px;border:0;background:none;color:#000;font-size:30px;line-height:1.2;opacity:.5;cursor:pointer}
${S} .dd-modal-x:hover{opacity:1}
${S} .dd-modal-title{margin:0 0 8px;font-family:'Playfair Display',serif;font-size:32px;font-weight:900}
${S} .dd-modal-box>p{margin:0 0 22px}
${S} .dd-modal form,${S} .dd-contact form{display:flex;flex-direction:column;gap:14px}
${S} .dd-modal input,${S} .dd-contact input,${S} .dd-contact textarea,${S} .dd-nf-search input{width:100%;padding:13px 16px;border:1px solid #ddd;background:#fff;color:var(--dd-title);font:inherit;font-size:15px;outline:0;transition:border-color .2s}
${S} .dd-modal input:focus,${S} .dd-contact input:focus,${S} .dd-contact textarea:focus,${S} .dd-nf-search input:focus{border-color:var(--dd-accent)}
${S} .dd-modal-note,${S} .dd-note{display:block;padding:10px 15px;background:#f5f0ff;color:var(--dd-accent);font-size:13px}
${S} .dd-ok{display:none;margin:0;padding:12px;background:#f1ebff;color:var(--dd-accent);font-weight:500}
${S} form[data-done] .dd-ok{display:block}
${S} form[data-done] input,${S} form[data-done] textarea,${S} form[data-done] button[type=submit]{display:none}

/* ── páginas internas ── */
${S} .dd-cols{background:#fff}
${S} .dd-cols-in{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:40px;width:min(1140px,100% - 30px);margin:0 auto;padding:50px 0 80px}
${S} .dd-cols-a,${S} .dd-cols-b{min-width:0}
${S} .dd-stack{display:flex;flex-direction:column;gap:var(--dd-gap,0)}
${S} .dd-listhead{margin-bottom:35px}
${S} .dd-listhead-label{display:block;color:#999;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase}
${S} .dd-listhead h1{margin:4px 0 6px;font-size:34px;font-weight:700;letter-spacing:3px;line-height:1.2;text-transform:uppercase;word-break:break-word}
${S} .dd-listhead-count{color:var(--dd-accent);font-size:15px;font-weight:600}
${S} .dd-listhead hr{margin:18px 0 0;border:0;border-top:1px solid #e4e4e4}
${S} .dd-two .dd-light{box-shadow:0 0 0 1px #eee}
${S} .dd-cols .dd-masonry{padding:0}

/* post */
${S} .dd-phead{margin-bottom:30px}
${S} .dd-pline{margin:0 0 14px;color:#333;font-size:15px;font-style:italic;font-weight:500}
${S} .dd-pline a,${S} .dd-pline b{color:var(--dd-accent);font-weight:500}
${S} .dd-phead h1,${S} .dd-about h1{margin:0 0 26px;font-size:30px;font-weight:700;line-height:40px}
${S} .dd-pimg{width:100%;height:420px;min-height:0;object-fit:cover}
${S} .dd-body{color:#444;font-family:'Lora',serif;font-size:17px;line-height:1.85}
${S} .dd-body p{margin:0 0 1.3em}
${S} .dd-body h2{margin:1.6em 0 .6em;font-family:'Poppins',sans-serif;font-size:24px;font-weight:600;line-height:1.3}
${S} .dd-body a{color:var(--dd-accent);text-decoration:underline}
${S} .dd-body ul{margin:0 0 1.4em;padding:0 0 0 1.2em;list-style:none}
${S} .dd-body li{position:relative;margin-bottom:.5em;padding-left:.4em}
${S} .dd-body li::before{content:"";position:absolute;top:.8em;left:-1em;width:7px;height:7px;border-radius:50%;background:var(--dd-accent)}
${S} .dd-body blockquote{margin:2em 0;padding:34px 38px;background:var(--dd-accent);color:#fff}
${S} .dd-body blockquote p{margin:0;color:#fff;font-size:22px;line-height:1.5}
${S} .dd-body blockquote a{color:#fff}
${S} .dd-body cite{display:block;margin-top:14px;color:#fff;font-size:15px;font-style:normal;text-align:right}
${S} .dd-pfoot{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:40px 0;padding:22px 0;border-top:1px solid #e4e4e4;border-bottom:1px solid #e4e4e4}
${S} .dd-tags{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-size:14px}
${S} .dd-tags span{color:var(--dd-title);font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
${S} .dd-tags a{color:#888;transition:color .2s}
${S} .dd-tags a:hover{color:var(--dd-accent)}
${S} .dd-nets{display:flex;gap:8px}
${S} .dd-net{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:#fff;transition:opacity .2s}
${S} .dd-net:hover{opacity:.85}
${S} .dd-net svg{width:16px;height:16px}
${S} .dd-net-facebook{background:#3b5998}
${S} .dd-net-linkedin{background:#0a66c2}
${S} .dd-net-twitter{background:#111}
${S} .dd-net-whatsapp{background:#25a244}
${S} .dd-authorbox{margin:0 0 40px;padding:34px 30px;background:var(--dd-strip);text-align:center}
${S} .dd-authorbox img,${S} .dd-authorbox .sb-img-empty{width:110px;height:110px;min-height:0;margin:0 auto 16px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 6px #fff}
${S} .dd-authorbox h3{margin:0 0 10px;font-size:20px}
${S} .dd-authorbox p{margin:0 0 14px}
${S} .dd-authorbox .dd-soc{justify-content:center}
${S} .sb-post-nav{width:100%;padding:0;margin:0 0 20px}

/* barra lateral */
${S} .dd-side{display:flex;flex-direction:column;gap:40px}
${S} .dd-wtitle{margin:0 0 20px;padding:11px 15px;background:var(--dd-dark);color:#fff;font-size:12px;font-weight:600;letter-spacing:1px;text-align:center;text-transform:uppercase}
${S} .dd-wabout{text-align:center}
${S} .dd-wabout img,${S} .dd-wabout .sb-img-empty{width:130px;height:130px;min-height:0;margin:0 auto 14px;border-radius:50%;object-fit:cover}
${S} .dd-wabout h3{margin:0 0 8px;font-size:18px}
${S} .dd-wabout p{margin:0 0 14px;font-size:15px}
${S} .dd-wabout .dd-soc{justify-content:center}
${S} .dd-wabout .dd-soc a{border-radius:50%}
${S} .dd-wpop article{display:grid;grid-template-columns:84px minmax(0,1fr);gap:14px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #eee}
${S} .dd-wpop article:last-child{margin-bottom:0;padding-bottom:0;border:0}
${S} .dd-wpop-img{display:block;overflow:hidden}
${S} .dd-wpop-img img,${S} .dd-wpop-img .sb-img-empty{width:84px;height:84px;min-height:0;object-fit:cover}
${S} .dd-wpop .dd-cline{margin:0 0 4px;font-size:12px;line-height:18px}
${S} .dd-wpop h3{margin:0;font-size:14px;font-weight:600;line-height:20px}
${S} .dd-wpop h3 a{color:var(--dd-title);transition:color .2s}
${S} .dd-wpop h3 a:hover{color:var(--dd-accent)}
${S} .dd-wcats li{border-bottom:1px solid #eee}
${S} .dd-wcats a{display:flex;align-items:center;justify-content:space-between;padding:11px 0;color:var(--dd-title);font-size:15px;font-weight:500;transition:color .2s}
${S} .dd-wcats a:hover{color:var(--dd-accent)}
${S} .dd-wcats b{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#eee;color:#333;font-size:12px;font-weight:600}
${S} .dd-wvlog{display:flex;flex-direction:column;gap:14px}
${S} .dd-vid{position:relative;display:block;overflow:hidden;background:#000}
${S} .dd-vid img,${S} .dd-vid .sb-img-empty{width:100%;height:auto;min-height:0;aspect-ratio:16/9;object-fit:cover;opacity:.85}
${S} .dd-play{position:absolute;top:50%;left:50%;display:flex;align-items:center;justify-content:center;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:var(--dd-accent);color:#fff}
${S} .dd-play svg{width:24px;height:24px}
${S} .dd-vid span{position:absolute;right:0;bottom:0;left:0;padding:24px 12px 10px;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;font-size:13px;font-weight:500}

/* sobre, contato, 404 */
${S} .dd-about .dd-pimg{margin-bottom:30px}
${S} .dd-contact{max-width:680px}
${S} .dd-contact>p{margin-bottom:22px}
${S} .dd-cfall{margin-top:18px;font-size:14px}
${S} .dd-cfall a{color:var(--dd-accent);text-decoration:underline}
${S} .dd-nf{display:flex;flex-direction:column;align-items:center;width:min(640px,100% - 30px);margin:90px auto;text-align:center}
${S} .dd-nf-code{color:var(--dd-accent);font-family:'Playfair Display',serif;font-size:170px;font-weight:900;line-height:1}
${S} .dd-nf h1{margin:10px 0 12px;font-size:34px}
${S} .dd-nf-search{position:relative;width:100%;margin:10px 0 26px}
${S} .dd-nf-search button{position:absolute;top:0;right:0;display:flex;align-items:center;justify-content:center;width:50px;height:100%;padding:0;border:0;background:none;color:#555;cursor:pointer}
${S} .dd-nf-search svg{width:18px;height:18px}

@media (prefers-reduced-motion:reduce){
${S} *,${S} *::before,${S} *::after{transition:none!important;scroll-behavior:auto!important}
${S} .dd-ptrack{animation:none!important}
${S} .dd-photos{overflow-x:auto}
}
${strip(S, 241, 168)}
@media (max-width:1199px){${lg(S)}}
@media (max-width:991px){${md(S)}${strip(S, 150, 120)}}
@media (max-width:767px){${sm(S)}}
@media (max-width:575px){${xs(S)}}
${lg(N)}${md(N)}${strip(N, 150, 120)}${sm(N)}${xs(N)}
`;
