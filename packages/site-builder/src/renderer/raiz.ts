import { seguidoresCss } from "./seguidores.js";

/**
 * Variante "raiz" (`theme.variant = "raiz"`): blog de marketing claro com roxo `#6617FF`, medido no marketingraiz.com
 * (WordPress + Elementor + The Post Grid). Tudo fica sob `.sb-mr`.
 *
 * As páginas internas (banner de título, busca, cartões, post, links) são as do grupo Seguidores em Alta: o CSS dessa
 * variante é reaproveitado trocando o escopo `.sb-sg` por `.sb-mr` e as diferenças vêm depois. Breakpoints do
 * original: tablet ≤ 1024 e celular ≤ 767; o preview estreito do editor (`.sb-narrow`) não enxerga media query,
 * então cada regra de tela pequena existe duas vezes. Inventário: `plans/marketingraiz-inventario.md`.
 */
export const isRaiz = (theme: Record<string, string>) =>
  theme.variant === "raiz";

/** Fontes que a variante usa fora do tema (fixas, nunca texto do usuário). */
export const RAIZ_EXTRA_FONTS = [
  "Nunito",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Work Sans",
  "Inter",
] as const;

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens: roxo de destaque, fundo claro, azul da linha de título, resumo e amarelo/verde do funil. */
export function raizVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--mr-active": safe(theme.active, "#6617ff"),
    "--mr-blue": safe(theme.blue, "#2962ff"),
    "--mr-gold": safe(theme.gold, "#fab837"),
    "--mr-green": safe(theme.green, "#88ca58"),
    "--mr-soft": safe(theme.soft, "#f8f8f8"),
    // Variáveis que o CSS reaproveitado do Seguidores em Alta lê.
    "--sg-active": safe(theme.active, "#6617ff"),
    "--sg-blue": safe(theme.blue, "#2962ff"),
    "--sg-lime": safe(theme.lime, "#6617ff"),
    "--sg-soft": safe(theme.soft, "#f8f8f8"),
    "--sg-sum": safe(theme.summary, "#2c495f"),
    "--sg-title": safe(theme.title, "#1c244b"),
    "--sg-violet": safe(theme.violet, "#6617ff"),
  };
}

const S = ".sb-mr";

const tablet = (x: string) => `
${x} .mr-head-in{padding:20px}
${x} .mr-burger{display:flex}
${x} .mr-nav{display:none;position:absolute;top:100%;left:0;right:0;justify-self:stretch;z-index:30;flex-direction:column;gap:0;background:var(--mr-soft)}
${x} .mr-nav a{display:block;padding:12px 0;text-align:center}
${x} .mr-nav a:hover,${x} .mr-nav a:focus,${x} .mr-nav a[aria-current=page]{background:var(--mr-active);color:#fff}
${x} .mr-head>.sb-burger-input:checked~.mr-head-in .mr-nav{display:flex}
${x} .mr-hero{background-position:-167px 0}
${x} .mr-hero-in{padding:150px 20px 100px}
${x} .mr-hero-copy{width:55%}
${x} .mr-hero-sub{max-width:490px}
${x} .mr-hero-side{width:45%}
${x} .mr-hl-in{padding:0 20px}
${x} .mr-rev .sg-t{flex-basis:100%}
${x} .mr-show{padding:100px 0}
${x} .mr-list{padding:40px 24px 0}
${x} .mr-grid.c3,${x} .mr-grid.c4{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .mr-foot-row{flex-direction:column;align-items:center;text-align:center}
${x} .mr-foot-row>*{width:100%}
${x} .mr-foot-social{justify-content:center}
${x} .mr-foot-bar{padding-left:20px;padding-right:20px}
${x} .mr-vsl h1{font-size:25px}
${x} .mr-flow .mr-step p,${x} .mr-flow .mr-step li{font-size:17px}
${x} .sg-banner-title h1{font-size:55px}
${x} .sg-post{margin-top:40px}
`;

const mobile = (x: string) => `
${x} .mr-head-in{grid-auto-flow:column;justify-content:space-between}
${x} .mr-logo{justify-self:start}
${x} .mr-hero{background:#fff var(--mr-img) no-repeat -229px -90px/977px auto}
${x} .mr-hero-in{padding:290px 20px 0}
${x} .mr-hero-copy{width:100%}
${x} .mr-hero h1{font-weight:800}
${x} .mr-hero-sub,${x} .mr-hero-side{display:none}
${x} .mr-hl-in{flex-direction:column}
${x} .mr-hl-in>*{width:100%}
${x} .mr-hl-right{margin-top:20px}
${x} .mr-show{padding:0;background:transparent}
${x} .mr-slide{aspect-ratio:auto;height:380px}
${x} .mr-list{min-height:145vh;padding:80px 24px 97px}
${x} .mr-grid.c2,${x} .mr-grid.c3,${x} .mr-grid.c4{grid-template-columns:minmax(0,1fr)}
${x} .mr-list-bar{flex-direction:column;align-items:stretch}
${x} .mr-foot{padding:60px 20px 40px}
${x} .mr-foot-social a{padding:10px}
${x} .mr-foot-social svg{width:14px;height:14px}
${x} .mr-vsl h1{font-size:18px}
${x} .mr-flow .mr-step p,${x} .mr-flow .mr-step li{font-size:16px}
${x} .mr-quiz-q{font-size:17px}
${x} .mr-btn{padding:16px 30px}
${x} .sg-banner-title h1{font-size:45px}
${x} .sg-post-title{font-size:23px}
${x} .mr-cats{grid-template-columns:minmax(0,1fr)}
`;

export const raizCss = `
${seguidoresCss.replaceAll(".sb-sg", S)}

${S}{font-family:var(--sb-font-body);background:#fff}
${S} .sb-burger-input{position:absolute;width:0;height:0;opacity:0;pointer-events:none}
${S} .sg-banner{margin-top:20px}
${S} .sg-post{margin-top:40px}
${S} .sg-post-title,${S} .sg-post-content h1,${S} .sg-post-content h2,${S} .sg-post-content h3,${S} .sg-post-content h4{color:#1c244b}
${S} .sg-post-content h2,${S} .sg-post-content h3,${S} .sg-post-content h4{margin:1.5em 0 calc(.5em + 10px)}
${S} .sg-post-content p{margin:1.5em 0}
${S} .sg-post-content{font-size:16px}
${S} .sg-sc-title{font-family:'Nunito',sans-serif}
${S} .sg-search h2{font-family:'Roboto',sans-serif}
${S} .sg-search-box button,${S} .sg-btn{background:var(--mr-active)}
${S} .sg-search-box button:hover,${S} .sg-btn:hover{background:#000}
${S} .sg-ccard-name{color:#1c244b}

${S} .mr-head{position:relative;z-index:20;background:var(--mr-soft)}
${S} .mr-head-in{display:grid;grid-template-columns:auto 1fr;width:100%;max-width:1240px;margin:0 auto;padding:20px;box-sizing:border-box}
${S} .mr-logo{align-self:center;max-width:222px}
${S} .mr-logo img{display:block;width:auto;max-width:100%;height:auto}
${S} .mr-nav{display:flex;flex-wrap:wrap;align-self:end;justify-self:end;font-family:'Roboto',sans-serif;font-size:15px;font-weight:600;line-height:1.5}
${S} .mr-nav a{padding:8px 14px;color:#000;transition:color .3s}
${S} .mr-nav a:hover,${S} .mr-nav a:focus,${S} .mr-nav a[aria-current=page]{color:var(--mr-active)}
${S} .mr-burger{display:none;align-self:center;justify-self:end;flex-direction:column;justify-content:center;gap:5px;width:28px;height:28px;border:0;cursor:pointer}
${S} .mr-burger i{display:block;height:3px;border-radius:2px;background:#000}

${S} .mr-hero{position:relative;background:#000 var(--mr-img) no-repeat 0 0/cover}
${S} .mr-hero::before{content:"";position:absolute;inset:0;background:linear-gradient(360deg,#000000fa 27%,#fff0 31%);opacity:.42}
${S} .mr-hero-in{position:relative;display:flex;align-items:flex-end;max-width:1200px;margin:0 auto;padding:150px 0 100px}
${S} .mr-hero-copy{width:66%}
${S} .mr-hero h1{margin:0 0 20px;font-family:'Roboto',sans-serif;font-size:42px;font-weight:600;line-height:1.2;color:#fff}
${S} .mr-hero-sub{font-family:'Nunito',sans-serif;font-size:25px;font-weight:600;line-height:1.3;color:#fff}
${S} .mr-hero-side{display:flex;flex-direction:column;gap:16px;width:33%}
${S} .mr-hc{position:relative;display:block;height:240px;overflow:hidden;border-radius:5px;background:#111}
${S} .mr-hc img,${S} .mr-hc .sb-img-empty{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
${S} .mr-hc:hover img{transform:scale(1.06)}
${S} .mr-hc::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,#000000ed 100%)}
${S} .mr-hc-body{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;gap:8px;padding:15px;color:#fff}
${S} .mr-hc-title{margin:0;font-family:'Nunito',sans-serif;font-size:18px;font-weight:700;line-height:1.2;color:#fff;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
${S} .mr-hc-sum{margin:0;font-family:'Nunito',sans-serif;font-size:14px;line-height:1.4;color:#fff}

${S} .mr-hl{padding:30px 0 50px}
${S} .mr-hl-in{display:flex;max-width:1200px;margin:0 auto}
${S} .mr-hl-left{width:66%;padding:0 15px}
${S} .mr-hl-right{width:33%;padding:0 15px}
${S} .mr-st{display:flex;align-items:center;gap:14px;margin:0 0 18px;font-family:'Roboto',sans-serif;font-size:22px;font-weight:700;line-height:1.2;color:#000}
${S} .mr-st::after{content:"";flex:1;height:2px;background:var(--mr-blue)}
${S} .mr-block{margin-bottom:20px}
${S} .mr-side-banner{display:block;margin-top:57px}
${S} .mr-side-banner img{display:block;width:100%}
${S} .mr-socials{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding-bottom:30px;margin-top:10px}
${S} .mr-socials a{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border-radius:5px;color:#fff;font-weight:600;transition:opacity .3s}
${S} .mr-socials a:hover{opacity:.85}

${S} .mr-grid{display:grid;gap:16px}
${S} .mr-grid.c1{grid-template-columns:minmax(0,1fr)}
${S} .mr-grid.c2{grid-template-columns:repeat(2,minmax(0,1fr))}
${S} .mr-grid.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
${S} .mr-grid.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
${S} .mr-card{display:flex;flex-direction:column;min-width:0;margin-bottom:34px;font-family:'Nunito',sans-serif}
${S} .mr-card .mr-thumb{display:block;margin-bottom:10px;overflow:hidden;border-radius:10px}
${S} .mr-card .mr-thumb img,${S} .mr-card .mr-thumb .sb-img-empty{display:block;width:100%;height:var(--mr-h,200px);border-radius:10px;object-fit:cover;transition:transform .5s ease}
${S} .mr-card:hover .mr-thumb img{transform:scale(1.04)}
${S} .mr-ctitle{margin:0 0 8px;font-size:18px;font-weight:700;line-height:120%;color:#000}
${S} .mr-ctitle a{color:inherit;transition:color .3s}
${S} .mr-ctitle a:hover{color:var(--mr-active)}
${S} .mr-csum{margin:0;font-size:16px;font-weight:500;line-height:1.5;color:var(--sg-sum)}
${S} .mr-l-side .mr-thumb img,${S} .mr-l-side .mr-thumb .sb-img-empty{height:260px}
${S} .mr-l-side .mr-ctitle{font-size:22px;font-weight:600;line-height:30px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}

${S} .mr-pager{display:none;justify-content:center;margin:10px 0 0}
${S}.sb-js .mr-pager,${S} .mr-pager.edit{display:flex}
${S} .mr-pager button{margin-left:-1px;padding:10px 16px;border:1px solid #d5d5d5;background:#fff;color:#333;font:inherit;font-size:15px;cursor:pointer;transition:background-color .3s,color .3s,border-color .3s}
${S} .mr-pager button:first-child{margin-left:0;border-radius:16px 0 0 16px}
${S} .mr-pager button:last-child{border-radius:0 16px 16px 0}
${S} .mr-pager button:only-child{border-radius:16px}
${S} .mr-pager button:hover,${S} .mr-pager button.on{border-color:var(--mr-active);background:var(--mr-active);color:#fff}
${S}.sb-js [data-mr-hide]{display:none}

${S} .mr-show{padding:50px 0;background:var(--mr-soft)}
${S} .mr-show-in{max-width:1250px;margin:0 auto;padding:0 20px;box-sizing:border-box}
${S} .mr-media{position:relative}
${S} .mr-media-view{overflow:hidden;border-radius:5px}
${S} .mr-media-track{display:flex;transition:transform .5s ease}
${S} .mr-slide{display:block;flex:0 0 100%;aspect-ratio:16/7;background:#111}
${S} .mr-slide img,${S} .mr-slide .sb-img-empty{display:block;width:100%;height:100%;object-fit:cover}
${S} .mr-thumbs{display:flex;gap:10px;margin-top:10px}
${S} .mr-thumb-btn{flex:1;min-width:0;padding:0;border:0;aspect-ratio:21/9;overflow:hidden;border-radius:3px;background:#111;opacity:.5;cursor:pointer;transition:opacity .3s}
${S} .mr-thumb-btn.on,${S} .mr-thumb-btn:hover{opacity:1}
${S} .mr-thumb-btn img,${S} .mr-thumb-btn .sb-img-empty{display:block;width:100%;height:100%;object-fit:cover}
${S} .mr-arrows button{position:absolute;top:calc(50% - 40px);display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:0;border-radius:50%;background:#0008;color:#fff;font-size:26px;line-height:1;cursor:pointer;transition:background-color .3s}
${S} .mr-arrows button:hover{background:var(--mr-active)}
${S} .mr-arrows button:first-child{left:12px}
${S} .mr-arrows button:last-child{right:12px}
${S} .mr-rev{margin-top:50px}
${S} .mr-rev .sg-car{margin-top:0}
${S} .mr-rev .sg-car .sb-cslider-track{gap:10px}
${S} .mr-rev .sg-t{flex-basis:calc((100% - 10px)/2);border:1px solid #e4e4e4;box-shadow:0 2px 10px #0000000d}
${S} .mr-rev .sg-t-head{border-bottom-color:#e4e4e4}
${S} .mr-rev .sg-car .sb-cslider-nav button{color:var(--mr-active)}
${S} .mr-rev .sg-dots button{background:var(--mr-active);opacity:.3}
${S} .mr-rev .sg-dots button.on{background:var(--mr-active);opacity:1}

${S} .mr-list{max-width:1216px;min-height:100vh;margin:0 auto;padding:90px 24px 0;box-sizing:border-box}
${S} .mr-list-bar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:40px}
${S} .mr-list-bar form{display:contents}
${S} .mr-list .sg-search-box{margin-top:15px}
${S} .mr-list .mr-card{margin-bottom:50px}

${S} .mr-foot{padding:100px 20px 50px;background:#000;font-family:'Montserrat',sans-serif}
${S} .mr-foot-in{display:flex;flex-direction:column;gap:50px;max-width:1200px;margin:0 auto}
${S} .mr-foot-row{display:flex;align-items:flex-start;min-height:160px}
${S} .mr-foot-row>*{width:20%}
${S} .mr-foot-row img{display:block;max-width:100%;height:auto}
${S} .mr-foot h2{margin:0 0 14px;font-size:20px;font-weight:600;line-height:20px;color:#f7f9ff}
${S} .mr-foot ul{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
${S} .mr-foot a{color:#fff;font-size:14px;transition:color .3s}
${S} .mr-foot ul a:hover{color:var(--mr-active)}
${S} .mr-foot-social{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:24px}
${S} .mr-foot-social a{display:inline-flex;padding:12px;border-radius:50%;background:var(--mr-active);color:#fff}
${S} .mr-foot-social a:hover{opacity:.85}
${S} .mr-foot-social svg{width:16px;height:16px}
${S} .mr-foot-bar{padding-top:30px;border-top:1px solid #eaecf0;font-size:14px;font-weight:400;line-height:24px;color:#fff;text-align:center}

${S} .mr-cats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;max-width:1200px;margin:0 auto;padding:20px 20px 80px}
${S} .mr-cat{position:relative;display:block;overflow:hidden;border-radius:10px;background:#000}
${S} .mr-cat img,${S} .mr-cat .sb-img-empty{display:block;width:100%;height:260px;object-fit:cover;opacity:1;transition:opacity .5s}
${S} .mr-cat:hover img{opacity:.7}
${S} .mr-cat span{position:absolute;left:0;right:0;bottom:0;padding:16px;font-family:'Nunito',sans-serif;font-size:24px;font-weight:700;color:#fff;text-align:center;background:linear-gradient(180deg,transparent,#000000b0)}

${S} .mr-nf{max-width:1000px;margin:0 auto;padding:60px 20px 80px;text-align:center}
${S} .mr-nf img{display:block;max-width:320px;width:100%;height:auto;margin:0 auto 24px}
${S} .mr-nf h1{margin:0 0 30px;font-family:'Roboto',sans-serif;font-size:32px;font-weight:700;color:#1c244b}
${S} .mr-nf h2{margin:30px 0 12px;font-family:'Roboto',sans-serif;font-size:22px;font-weight:700;color:#1c244b}
${S} .mr-nf ul{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
${S} .mr-nf li a{color:var(--mr-active)}
${S} .mr-nf-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
${S} .mr-nf-btns a{padding:14px 28px;border-radius:5px;background:var(--mr-active);color:#fff;font-weight:700;transition:background-color .3s}
${S} .mr-nf-btns a:hover{background:#000}

${S} .mr-fun{display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:60px 20px;box-sizing:border-box;background:#000 var(--mr-img) center/cover no-repeat;color:#fff;text-align:center;font-family:'Montserrat',sans-serif}
${S} .mr-fun-in{width:100%;max-width:900px;margin:auto}
${S} .mr-btn{display:inline-block;padding:18px 60px;border:0;border-radius:5px;background:var(--mr-gold);color:#000!important;font-family:'Work Sans',sans-serif;font-size:20px;font-weight:400;line-height:1.2;cursor:pointer;transition:filter .3s}
${S} .mr-btn:hover{background:var(--mr-gold);filter:brightness(1.05)}
${S} .mr-btn.strong{padding:15px 50px;font-weight:600}
${S} .mr-btn.video{font-family:'Montserrat',sans-serif;font-weight:700}
${S} .mr-vsl h1{margin:0 0 14px;font-family:'Montserrat',sans-serif;font-size:45px;font-weight:700;line-height:1.2;color:#fff}
${S} .mr-vsl p{margin:0 0 24px;font-size:18px;color:#fff}
${S} .mr-video{position:relative;width:100%;max-width:800px;margin:0 auto 30px;aspect-ratio:16/9;background:#000}
${S} .mr-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
${S} .mr-vsl-btn{display:block}
${S}.sb-js .mr-vsl-btn{visibility:hidden;opacity:0}
${S}.sb-js .mr-vsl-btn.on{visibility:visible;opacity:1;transition:opacity 2s ease}
${S} .mr-vsl-btn.on .mr-btn{animation:mr-pulse .7s infinite alternate}
@keyframes mr-pulse{0%{transform:scale(1)}100%{transform:scale(1.07)}}
${S} .mr-step{margin:0 auto 40px;max-width:760px}
${S} .mr-step h2{margin:0 0 16px;font-family:'Roboto',sans-serif;font-size:25px;font-weight:600;color:#6ec1e4}
${S} .mr-step p{margin:0 0 18px;font-size:18px;font-weight:600;line-height:1.1}
${S} .mr-step ul{margin:0 0 24px;padding:0;list-style:none;text-align:left}
${S} .mr-step li{margin:0 0 10px;font-size:18px;font-weight:600;line-height:1.3}
${S} .mr-step li::before{content:"✓ ";color:var(--mr-green)}
${S}.sb-js .mr-flow .mr-step{display:none;opacity:0;transition:opacity .6s ease}
${S}.sb-js .mr-flow .mr-step.show{display:block}
${S}.sb-js .mr-flow .mr-step.vis{opacity:1}
${S} .mr-quiz-q{margin:0 0 28px;font-family:'Trebuchet MS','Lucida Grande',sans-serif;font-size:24px;font-weight:300;letter-spacing:.5px;line-height:1.3;color:#fff}
${S} .mr-final-title{margin:0 0 20px;font-size:24px;font-weight:600}
${S} .mr-answers{display:flex;flex-direction:column;align-items:center;gap:12px}
${S} .mr-answers .mr-btn{width:100%;max-width:520px;padding:16px 24px}
${S} .mr-load{margin:0 0 20px;font-size:20px;font-weight:600}
${S} .mr-bar{width:90%;height:15px;margin:0 auto;overflow:hidden;border-radius:50px;background:#e9ecef}
${S} .mr-bar-fill{height:100%;width:5%;border-radius:20px;background-color:var(--mr-green);background-image:linear-gradient(45deg,#ffffff26 25%,transparent 25%,transparent 50%,#ffffff26 50%,#ffffff26 75%,transparent 75%);background-size:1rem 1rem;animation:mr-stripes 1s linear infinite;color:#fff;font-size:11px;line-height:15px;text-align:center}
${S} .mr-bar.done .mr-bar-fill{background-image:none;animation:none}
@keyframes mr-stripes{from{background-position:1rem 0}to{background-position:0 0}}
${S} .mr-done{display:none;margin-top:16px;font-size:20px;font-weight:700}
${S} .mr-bar.done~.mr-done{display:block}
${S} .mr-capture h1{margin:0 0 24px;font-family:'Montserrat',sans-serif;font-size:24px;font-weight:700;line-height:1.3;color:#fff}
${S} .mr-capture form{display:flex;flex-direction:column;gap:14px;max-width:480px;margin:0 auto}
${S} .mr-capture input{padding:16px;border:0;border-radius:5px;font:inherit;font-size:16px}
${S} .mr-capture .mr-btn{width:100%}
${S} .mr-notice{margin-top:12px;font-size:13px;color:#ffd78a}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
