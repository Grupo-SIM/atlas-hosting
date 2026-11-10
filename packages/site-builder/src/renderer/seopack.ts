/**
 * Variante "seopack" (`theme.variant = "seopack"`): landing escura em roxo, medida no seopack.simintermediacoes.com
 * (Elementor + The Plus Addons + Header Footer Elementor). Tudo fica sob `.sb-sp`, então as outras variantes não mudam.
 *
 * Breakpoints do original: tablet ≤ 1024 e celular ≤ 767. O preview estreito do editor (`.sb-narrow`) não enxerga
 * media query, então cada regra de tela pequena existe duas vezes. Os tamanhos em `em` partem de 16px, como no original.
 */
import { cssUrl } from "./central.js";

export const isSeopack = (theme: Record<string, string>) =>
  theme.variant === "seopack";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras da paleta do kit: roxo escuro, quase preto, painel, borda e lilás claro. */
export function seopackVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--sp-dark": safe(theme.dark, "#080111"),
    "--sp-deep": safe(theme.deep, "#311557"),
    "--sp-edge": safe(theme.edge, "#2f006b"),
    "--sp-grid": cssUrl(theme.grid),
    "--sp-line": safe(theme.line, "#231a2d"),
    "--sp-panel": safe(theme.panel, "#120424"),
    "--sp-soft": safe(theme.soft, "#e9d8fe"),
  };
}

const S = ".sb-sp";

/** Telas ≤ 1024 (tablet). */
const tablet = (x: string) => `
${x} h2{font-size:2em}
${x} .sp-pill{font-size:1.1em}
${x}>.sb-block[data-block-type=spHeader]{margin-bottom:-100px}
${x} .sp-head{padding:20px 30px}
${x} .sp-logo{width:25.065%}
${x} .sp-logo img{width:75%}
${x} .sp-nav{display:none}
${x} .sp-burger{display:flex}
${x} .sp-head-menu{display:block}
${x} .sp-hero{padding:200px 30px 190px}
${x} .sp-hero-title{font-size:1.9em}
${x} .sp-hero-text{padding:0 100px}
${x} .sp-hero-img{margin-top:-148px}
${x} .sp-about{padding:100px 30px 120px}
${x} .sp-about-card{padding:20px}
${x} .sp-num-n{font-size:2em}
${x} .sp-about-stat{padding:20px 20px 20px}
${x} .sp-tools{padding:70px 30px 50px}
${x} .sp-tools-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .sp-trust{padding:0 30px 60px}
${x} .sp-trust-in{padding:120px 10px}
${x} .sp-trust h2{padding:0 90px}
${x} .sp-trust-outer{padding:8px}
${x} .sp-trust-card{padding:0 10px 20px;text-align:center}
${x} .sp-trust-card h3,${x} .sp-trust-card p{padding:0}
${x} .sp-ic.big{font-size:32px}
${x} .sp-ben{padding:60px 30px 120px}
${x} .sp-ben-card{padding:12px}
${x} .sp-ben-in{padding:15px}
${x} .sp-ben-tags{flex-direction:column;align-items:center}
${x} .sp-ben-in h3{font-size:1.1em;padding:0}
${x} .sp-ben-in>p,${x} .sp-ben-in .sp-ben-text{padding:0;text-align:center}
${x} .sp-ben-stats{flex-direction:column}
${x} .sp-stat-card{padding:10px}
${x} .sp-plans{padding:120px 30px}
${x} .sp-text-pr{padding-right:50px}
${x} .sp-price-grid{flex-direction:column;align-items:center}
${x} .sp-plan{width:55%;padding:20px 5px}
${x} .sp-plan-in{padding:20px 10px}
${x} .sp-plan-head{flex-direction:column}
${x} .sp-plan-name,${x} .sp-plan-desc{text-align:center}
${x} .sp-price-row{justify-content:center;margin-left:50px}
${x} .sp-price-cur{font-size:2.3em}
${x} .sp-price-val{font-size:3em;line-height:1em}
${x} .sp-testi{padding:120px 30px}
${x} .sp-testi-cols{flex-direction:column}
${x} .sp-testi-col{width:100%}
${x} .sp-testi-wrap{padding:80px 20px}
${x} .sp-testi-text{padding:0}
${x} .sp-faq{padding:120px 30px}
${x} .sp-faq-q{font-size:1em;line-height:23px}
${x} .sp-foot{padding:20px}
`;

/** Telas ≤ 767 (celular). */
const mobile = (x: string) => `
${x} h2{font-size:1.8em}
${x} .sp-split{flex-direction:column}
${x} .sp-split>.sp-side{width:100%}
${x} .sp-head{padding:20px}
${x} .sp-logo{width:50%}
${x} .sp-logo img{width:75%}
${x} .sp-hero{padding:176px 20px 147px}
${x} .sp-hero-title{font-size:1.5em}
${x} .sp-hero-text{padding:0}
${x} .sp-hero-wrap{padding:0 20px 60px}
${x} .sp-hero-img{margin-top:-100px;width:100%}
${x} .sp-about{padding:50px 20px}
${x} .sp-about .sp-side{text-align:center}
${x} .sp-about .sp-pill{align-self:center}
${x} .sp-about-text{margin:0;padding:0}
${x} .sp-about-cards{flex-direction:column}
${x} .sp-tools{padding:50px 20px 50px}
${x} .sp-tools h2{padding:0}
${x} .sp-tools-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sp-trust{padding:30px 20px}
${x} .sp-trust-outer{padding:10px}
${x} .sp-trust-in{padding:120px 30px}
${x} .sp-trust h2{padding:0}
${x} .sp-trust-head .sp-pill{max-width:264px}
${x} .sp-trust-grid{flex-direction:column}
${x} .sp-trust-outer-card{margin-bottom:60px}
${x} .sp-trust-card h3{padding:0 20px}
${x} .sp-trust-card p{padding:0 10px}
${x} .sp-ben{padding:30px 20px 60px}
${x} .sp-ben-divider{margin-bottom:30px}
${x} .sp-ben .sp-side{text-align:center}
${x} .sp-ben .sp-side .sp-pill{align-self:center}
${x} .sp-ben-cols{flex-direction:column}
${x} .sp-plans{padding:60px 20px 50px}
${x} .sp-plans .sp-side{text-align:center}
${x} .sp-plans .sp-side .sp-pill{align-self:center}
${x} .sp-plan{width:100%}
${x} .sp-price-row{margin-left:0}
${x} .sp-testi{padding:50px 20px}
${x} .sp-testi .sp-side{text-align:center}
${x} .sp-testi .sp-side .sp-pill{align-self:center}
${x} .sp-testi-card{padding:10px}
${x} .sp-testi-wrap{padding:20px 10px}
${x} .sp-testi-col{padding:20px}
${x} .sp-faq{padding:50px 20px 100px}
${x} .sp-faq .sp-side{text-align:center}
${x} .sp-faq .sp-side .sp-pill{align-self:center}
${x} .sp-faq-q{padding-right:14px}
`;

export const seopackCss = `
${S}{font-size:16px;line-height:1.5;font-family:var(--sb-font-body)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} p,${S} ul{margin:0}
${S} h1,${S} h2,${S} h3,${S} h4{color:#fff;font-family:var(--sb-font-heading);line-height:1.2}
${S} h2{font-size:3.5em;font-weight:500;line-height:1}
${S} h3{font-size:1.5em;font-weight:200;line-height:30px}
${S} p{color:var(--sb-muted)}
${S} a{color:#fff;transition:color .3s}
${S} .sp-wrap{width:100%;max-width:1300px;margin:0 auto}
${S} .sp-split{display:flex;gap:20px;align-items:flex-start}
${S} .sp-split>.sp-side{display:flex;flex-direction:column;gap:20px;width:29.659%;flex:none}
${S} .sp-split>.sp-main{flex:1;min-width:0}
${S} .sp-grid-bg{position:relative}
${S} .sp-grid-bg::before{content:"";position:absolute;inset:0;background:var(--sp-grid,none) center/cover;opacity:var(--sp-ov,.34);pointer-events:none;border-radius:inherit}
${S} .sp-grid-bg>*{position:relative}

${S} .sp-pill{display:inline-block;align-self:flex-start;padding:10px 40px;border:solid #ffffff3b;border-width:1px 0 0 1px;border-radius:50px;background-image:linear-gradient(221deg,var(--sp-deep) 0%,var(--sp-dark) 100%);color:#fff;font-family:var(--sb-font-heading);font-size:1.2em;font-weight:200;line-height:1.5;text-align:center}
${S} .sp-pill.hero{align-self:center;font-size:1.5em;line-height:30px}
${S} .sp-pill.mid{align-self:center}
${S} .sp-tag{display:inline-block;padding:9px 12px;border:1px solid #241c2e;border-radius:30px;background:var(--sb-bg);color:#fff;font-family:var(--sb-font-heading);font-size:1.2em;font-weight:200;line-height:1.5}
${S} .sp-tag.alt{background:#31155759;border-color:var(--sp-line)}
${S} .sp-btn{display:inline-block;padding:15px 30px;border:1px solid var(--sp-deep);border-radius:30px;background:var(--sp-deep);color:#fff;font-weight:400;line-height:1.5;transition:all .3s}
${S} .sp-btn:hover{border-color:#313131;background:#090014e3;color:var(--sb-accent)}
${S} .sp-btn.solid{padding:20px 40px;font-size:15px;line-height:1;transition:all .3s}
${S} .sp-btn.solid:hover{border-color:var(--sp-deep);background:transparent;color:#fff}

${S} .sp-ic{display:inline-flex;align-items:center;justify-content:center;flex:none;box-sizing:content-box;width:1em;height:1em;padding:.5em;border-radius:50%;background:var(--sp-deep);color:#fff;font-size:23px}
${S} .sp-ic.dark{background:var(--sb-bg)}
${S} .sp-ic.big{background:var(--sb-accent);color:var(--sb-bg);font-size:37px;border-radius:50px}
${S} .sp-ic svg{display:block;width:1em;height:1em;fill:currentColor}

${S}>.sb-block[data-block-type=spHeader]{position:relative;z-index:2;margin-bottom:-100px}
${S} .sp-head{position:relative;display:flex;align-items:center;padding:19px 0;border-bottom:1px solid var(--sp-line);background:#09001478}
${S} .sp-head-in{display:flex;align-items:center;width:100%}
${S} .sp-logo{display:block;width:25.065%;flex:none}
${S} .sp-logo img{display:block;width:156px;max-width:100%;height:auto}
${S} .sp-nav{display:flex;flex:1;justify-content:center;padding-right:92px}
${S} .sp-menu{display:flex;margin:0;padding:0;list-style:none}
${S} .sp-menu a{display:block;padding:15px 67px;line-height:1;color:#fff;font-family:var(--sb-font-heading);font-weight:200;line-height:1}
${S} .sp-menu a:hover,${S} .sp-menu a:focus{color:var(--sb-accent)}
${S} .sp-head-btn{margin-left:auto;flex:none}
${S} .sp-head-btn .sp-btn{padding:21px 40px}
${S} .sp-burger-input{position:absolute;opacity:0;pointer-events:none}
${S} .sp-burger{display:none;align-items:center;gap:8px;margin-left:auto;margin-right:15px;color:var(--sb-accent);font-size:1em;cursor:pointer}
${S} .sp-burger svg{width:1.2em;height:1.2em;fill:currentColor}
${S} .sp-burger .x{display:none}
${S} .sp-burger-input:checked~.sp-head-in .sp-burger .m{display:none}
${S} .sp-burger-input:checked~.sp-head-in .sp-burger .x{display:block}
${S} .sp-head-menu{display:none;position:absolute;top:100%;left:0;right:0;z-index:3;margin:0;padding:0;list-style:none;background:var(--sp-deep);visibility:hidden;opacity:0;transform:scaleY(.9);transform-origin:top;transition:opacity .25s,transform .25s,visibility 0s .25s}
${S} .sp-burger-input:checked~.sp-head-menu{visibility:visible;opacity:1;transform:none;transition:opacity .25s,transform .25s,visibility 0s}
${S} .sp-head-menu a{display:block;padding:15px 20px;border-bottom:1px solid #c4c4c4;color:#fff;font-family:var(--sb-font-heading);font-weight:200}
${S} .sp-head-menu a:hover{background:var(--sb-accent);color:#fff}

${S} .sp-hero{position:relative;display:flex;flex-direction:column;align-items:center;gap:29px;padding:198px 0 316px;background:var(--sb-bg);text-align:center;overflow:hidden}
${S} .sp-hero::before{content:"";position:absolute;inset:0;background:var(--sp-grid,none) center/cover;opacity:.7;pointer-events:none}
${S} .sp-hero>*{position:relative}
${S} .sp-hero-title{max-width:1300px;color:var(--sp-soft);font-size:6.25em;font-weight:500;line-height:1.2;margin-bottom:6px}
${S} .sp-hero-title b{display:inline-block;padding:0 .2em;border-radius:6px;background:var(--sp-deep);color:#fff;font-family:var(--sb-font-body);font-weight:700;overflow:hidden;white-space:nowrap;vertical-align:bottom}
${S} .sp-hero-title b{animation:sp-type 1.2s steps(7,end) .6s both}
@keyframes sp-type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
${S} .sp-hero-text{max-width:600px;margin-inline:auto;padding:0;font-size:1em}
${S} .sp-hero-wrap{display:flex;flex-direction:column;align-items:center;padding:0 0 60px}
${S} .sp-hero-img{display:block;width:79%;max-width:1027px;height:auto;margin-top:-247px;border-radius:20px;position:relative}

${S} .sp-about{padding:130px 0 143px}
${S} .sp-about .sp-split{max-width:1300px;margin:0 auto}
${S} .sp-about .sp-side{width:34.252%}
${S} .sp-about h2{text-align:left}
${S} .sp-about-text{display:flex;flex-direction:column;gap:20px;margin:43px 0 12px;padding-right:70px}
${S} .sp-about-text strong{color:inherit}
${S} .sp-about-img{min-height:290px;border-radius:30px;background:var(--sp-img,none) center/cover no-repeat}
${S} .sp-about-cards{display:flex;gap:20px;margin-top:20px}
${S} .sp-about-card{flex:1;min-width:0;padding:30px;border:1px solid var(--sp-line);border-radius:30px}
${S} .sp-about-card.top{--sp-ov:.34;padding:30px;border:solid var(--sp-edge);border-width:2px 0 0;border-radius:30px 30px 0 0;background-image:linear-gradient(180deg,#8932f81c 0%,var(--sb-bg) 100%)}
${S} .sp-about-card h3{margin:20px 0 14px;padding-right:60px}
${S} .sp-about-stat{padding:10px;border:1px solid var(--sp-line);border-radius:20px}
${S} .sp-stat-card{padding:20px;border:1px solid var(--sp-line);border-radius:20px;transition:box-shadow .3s}
${S} .sp-stat-card:hover{box-shadow:0 -27px 59px -7px rgba(137,50,248,.33)}
${S} .sp-num{display:flex;flex-direction:column;gap:2px}
${S} .sp-num-n{display:block;color:#fff;font-family:var(--sb-font-heading);font-size:3.5em;font-weight:500;line-height:1.5}
${S} .sp-num-n i{color:var(--sp-deep);font-style:normal}
${S} .sp-num-t{color:#fff;font-family:var(--sb-font-heading);font-size:1em;transition:color .3s}
${S} .sp-stat-card:hover .sp-num-t{color:var(--sb-accent)}

${S} .sp-tools{padding:120px 0 94px;border:solid var(--sp-line);border-width:1px 0}
${S} .sp-tools h2{padding-bottom:80px;font-family:var(--sb-font-body);font-weight:400;text-align:center}
${S} .sp-tools-group{margin:0 20px 27px;font-size:20px;font-weight:500;line-height:1}
${S} .sp-tools-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:57px 20px;padding:0 20px}
${S} .sp-tool{display:flex;flex-direction:column;align-items:center;gap:20px;padding:10px 10px 21px;border:3px groove #31313159;border-radius:15px;text-align:center;transition:box-shadow .3s}
${S} .sp-tool:hover{box-shadow:inset 0 0 7px 0 rgba(255,255,255,.98)}
${S} .sp-tool img{display:block;width:100%;height:auto;max-height:110px;object-fit:contain}
${S} .sp-tool h4{font-family:var(--sb-font-heading);font-size:20px;font-weight:800;line-height:1}
${S} .sp-tool p{width:108.095%;max-width:108.095%;font-size:13px;line-height:1.5}

${S} .sp-trust{padding:0 0 84px}
${S} .sp-trust-outer{padding:20px;border:1px solid #241c2e;border-radius:20px;box-shadow:7px 0 10px rgba(0,0,0,.5)}
${S} .sp-trust-in{--sp-ov:.32;display:flex;flex-direction:column;align-items:center;gap:20px;padding:120px 50px;border:1px solid #241c2e;border-radius:20px;background-color:#090014e3}
${S} .sp-trust-head{display:flex;flex-direction:column;align-items:center;gap:20px}
${S} .sp-trust h2{padding:0 100px;font-size:3.4em;text-align:center}
${S} .sp-trust-grid{display:flex;gap:20px;width:100%;margin-top:60px}
${S} .sp-trust-outer-card{flex:1;min-width:0;padding:10px;border:1px solid var(--sp-line);border-radius:20px}
${S} .sp-trust-card h3{margin:9px 0 20px}
${S} .sp-trust-card{height:100%;padding:0 30px 20px;border:1px solid var(--sp-line);border-radius:20px;transition:box-shadow .3s}
${S} .sp-trust-card:hover{box-shadow:0 -27px 59px -7px rgba(137,50,248,.33)}
${S} .sp-trust-card .sp-ic{margin:-43px 0 14px}
${S} .sp-trust-card h3{margin-bottom:10px;padding-right:30px}
${S} .sp-trust-card p{padding-right:30px}

${S} .sp-ben{padding:60px 0 127px}
${S} .sp-ben-divider{height:0;margin:0 0 150px;border:0;border-top:1px solid #241c2e}
${S} .sp-ben-text{display:flex;flex-direction:column;gap:20px;padding-right:70px}
${S} .sp-ben-cols{display:flex;gap:20px;margin-top:40px}
${S} .sp-ben-card{flex:1;min-width:0;padding:30px;border:1px solid var(--sp-edge);border-radius:30px}
${S} .sp-ben-in{--sp-ov:.34;display:flex;flex-direction:column;gap:20px;padding:30px;border:solid var(--sp-edge);border-width:2px 0 0;border-radius:30px 30px 0 0;background-image:linear-gradient(180deg,#8932f81c 0%,var(--sb-bg) 100%)}
${S} .sp-ben-in h3{margin-bottom:-5px;padding-right:60px}
${S} .sp-ben-tags{display:flex;flex-wrap:nowrap;gap:10px}
${S} .sp-ben-tags>.sp-tag{flex:0 1 auto;min-width:0;padding:6px 12px;line-height:1}
${S} .sp-ben-line{height:0;margin:18px 0;border:0;border-top:1px solid #241c2e}
${S} .sp-ben-stats{display:flex;gap:20px}
${S} .sp-stat-card.o{flex:1;min-width:0;padding:10px}
${S} .sp-ben-btn{align-self:flex-start}
${S} .sp-ben-in .sp-ben-text{margin-bottom:19px}
${S} .sp-ben-in .sp-ben-btn{margin-top:18px}

${S} .sp-plans{padding:120px 0 114px}
${S} .sp-price-grid{display:flex;gap:20px;margin-top:54px}
${S} .sp-text-pr{display:flex;flex-direction:column;gap:20px;padding-right:70px}
${S} .sp-plans .sp-text-pr{gap:14px}
${S} .sp-plan{flex:1;min-width:0;margin:30px 0;padding:30px;border:1px solid var(--sp-line);border-radius:30px;transition:box-shadow .3s}
${S} .sp-plan.pop{--sp-ov:.4;margin:0}
${S} .sp-plan.pop .sp-plan-label{margin-bottom:34px}
${S} .sp-plan:hover{box-shadow:0 -27px 59px -7px rgba(137,50,248,.33)}
${S} .sp-plan-label{margin-bottom:25px;text-align:center;font-size:1.5em;font-weight:200}
${S} .sp-plan-in{--sp-ov:.34;display:flex;flex-direction:column;gap:16px;padding:30px 20px;border:solid var(--sp-edge);border-width:2px 0 0;border-radius:30px 30px 0 0;background-image:linear-gradient(180deg,#8932f81c 0%,var(--sb-bg) 100%)}
${S} .sp-plan-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
${S} .sp-plan-name{font-size:1.5em;font-weight:200}
${S} .sp-plan-desc{font-size:1em}
${S} .sp-price-row{display:flex;align-items:flex-end;gap:0;margin-top:19px}
${S} .sp-price-cur{margin:0 10px 10px 0;color:var(--sb-accent);font-family:var(--sb-font-heading);font-size:2.8em;font-weight:300;line-height:1}
${S} .sp-price-val{color:#fff;font-family:var(--sb-font-heading);font-size:4.1em;font-weight:500;line-height:66px}
${S} .sp-price-per{color:var(--sb-muted);margin:0 0 14px 10px;font-size:1em}
${S} .sp-plan-list{display:flex;flex-direction:column;margin:8px 0 20px;padding:0;list-style:none}
${S} .sp-plan-list li{display:flex;align-items:center;gap:8px;padding:15px 0;color:var(--sb-muted)}
${S} .sp-plan-list li:not(:last-child){border-bottom:1px solid var(--sp-line)}
${S} .sp-plan-list li svg{flex:none;width:14px;height:14px;fill:var(--sb-accent)}
${S} .sp-plan .sp-btn{display:block;text-align:center}

${S} .sp-testi{padding:120px 0;border:solid var(--sp-line);border-width:1px 0;background:var(--sp-panel)}
${S} .sp-testi-text{display:flex;flex-direction:column;gap:20px;padding-right:70px}
${S} .sp-testi-card{margin-top:30px;padding:20px;border:1px solid #241c2e;border-radius:20px;box-shadow:7px 0 10px rgba(0,0,0,.5)}
${S} .sp-testi-wrap{--sp-ov:.32;padding:120px 50px 100px;border:1px solid #241c2e;border-radius:20px}
${S} .sp-testi-cols{display:flex}
${S} .sp-testi-col{display:flex;flex-direction:column;flex:1;min-height:404px;min-width:0;padding:50px 80px 30px;border:1px solid var(--sp-line);border-radius:30px;margin-right:10px}
${S} .sp-testi-col.b{--sp-ov:.34;margin:0 0 0 10px;border:solid var(--sp-edge);border-width:2px 0 0;border-radius:30px 30px 0 0}
${S} .sp-car .sb-cslider-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .sp-car .sb-cslider-track::-webkit-scrollbar{display:none}
${S} .sp-t{flex:0 0 100%;display:flex;flex-direction:column;justify-content:space-between;gap:20px;margin:0;scroll-snap-align:start}
${S} .sp-testi-col .sp-car{display:flex;flex:1;flex-direction:column}
${S} .sp-testi-col .sb-cslider-track{flex:1}
${S} .sp-t{text-align:center}
${S} .sp-t blockquote{margin:0;color:var(--sb-muted);font-size:14px;line-height:26px}
${S} .sp-t figcaption{display:flex;align-items:center;justify-content:center;gap:15px}
${S} .sp-t img{width:75px;height:90px;border-radius:4px;object-fit:cover}
${S} .sp-t cite{display:flex;flex-direction:column;color:var(--sb-muted);font-size:13px;font-style:normal;line-height:1.5}
${S} .sp-t cite strong{font-size:16px;line-height:22px}
${S} .sp-t cite strong{font-weight:700}
${S} .sp-dots{display:flex;justify-content:center;gap:10px;padding:20px 0 0}
${S} .sp-dots button{width:8px;height:8px;padding:0;border:1px solid #fff;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 8px #fff;cursor:pointer;transition:background .3s}
${S} .sp-dots button.on{background:transparent}

${S} .sp-faq{padding:120px 0 106px}
${S} .sp-faq-list{margin-top:19px}
${S} .sp-faq details{margin-bottom:15px}
${S} .sp-faq-q{position:relative;display:block;padding:30px 40px 25px 29px;border-bottom:1px solid var(--sp-edge);color:#fff;font-family:var(--sb-font-heading);font-size:1em;font-weight:200;line-height:23px;cursor:pointer;list-style:none}
${S} .sp-faq-q::-webkit-details-marker{display:none}
${S} .sp-faq-q::after{content:"";position:absolute;top:calc(50% - 6px);right:6px;width:9px;height:9px;border-right:2px solid var(--sb-accent);border-bottom:2px solid var(--sb-accent);transform:rotate(45deg);transition:transform .3s}
${S} .sp-faq details[open] .sp-faq-q::after{top:calc(50% - 1px);transform:rotate(225deg)}
${S} .sp-faq-a{padding:15px 0 29px 20px;color:var(--sb-muted);line-height:1.5}

${S} .sp-foot{position:relative;padding:27px 20px;border-top:1px solid var(--sp-edge);background:radial-gradient(at top center,var(--sb-accent) 0%,var(--sb-bg) 100%);text-align:center}
${S} .sp-foot::before{content:"";position:absolute;inset:0;background:var(--sb-bg);opacity:.46}
${S} .sp-foot p{position:relative}

/* recuo lateral: o contêiner de 1300px centraliza, mas abaixo disso o conteúdo encostava nas bordas */
@media (min-width:1025px){
${S}:not(.sb-narrow) .sp-head{padding-left:0;padding-right:0}
${S}:not(.sb-narrow) .sp-head>.sp-wrap{max-width:none}
${S}:not(.sb-narrow) .sp-head .sp-head-in{padding:0 27px 0 73px}
}
${S} .sp-hero,${S} .sp-about,${S} .sp-tools,${S} .sp-trust,${S} .sp-ben,${S} .sp-plans,${S} .sp-testi,${S} .sp-faq{padding-left:30px;padding-right:30px}
${S} .sp-about .sp-btn{align-self:flex-start;margin-top:50px}
${S} .sp-testi-text strong,${S} .sp-ben-text strong,${S} .sp-faq strong{font-weight:700}
/* custo x benefício, planos, depoimentos e FAQ (desktop): selo à esquerda, título e texto à direita e o conteúdo abaixo, como no original */
@media (min-width:1025px){
${S}:not(.sb-narrow) :is(.sp-ben,.sp-plans,.sp-testi,.sp-faq) .sp-split{display:grid;grid-template-columns:29.659% minmax(0,1fr);gap:35px 20px;align-items:start}
${S}:not(.sb-narrow) :is(.sp-ben,.sp-plans,.sp-testi,.sp-faq) .sp-split>.sp-side{display:contents}
${S}:not(.sb-narrow) :is(.sp-ben,.sp-plans,.sp-testi,.sp-faq) .sp-split>.sp-side>.sp-pill{grid-column:1;grid-row:1;justify-self:start}
${S}:not(.sb-narrow) :is(.sp-ben,.sp-plans,.sp-testi,.sp-faq) .sp-split>.sp-side>h2{grid-column:2;grid-row:1}
${S}:not(.sb-narrow) :is(.sp-ben,.sp-plans,.sp-testi,.sp-faq) .sp-split>.sp-side>div{grid-column:2;grid-row:2}
${S}:not(.sb-narrow) :is(.sp-ben,.sp-plans,.sp-testi) .sp-split>.sp-main{grid-column:1/-1;grid-row:3}
${S}:not(.sb-narrow) .sp-faq .sp-split>.sp-main{grid-column:2;grid-row:3}
}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
@media (prefers-reduced-motion:reduce){${S} .sp-hero-title b{animation:none}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
