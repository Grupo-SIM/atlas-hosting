/**
 * Variante `consultoria` (escopo `.sb-cf`): página de vendas "Consultoria Financeira"
 * (consultoriafinanceira.centraldomarketing.com — WordPress + Hello Elementor 4.4 + ElementsKit + Jeg Kit, página 85, kit 12).
 * Breakpoints do original: tablet ≤ 1024, celular ≤ 767, repetidos sob `.sb-narrow` (no preview estreito do editor tablet e
 * celular valem os dois). Container 1300px. Medidas (1440px) conferidas no Chromium contra o site original.
 *
 * Tokens do tema: `accent` (ciano `#0EE6FF`: "%", ícones, links), `bg` (`#040404`), `fg` (`#B0B0B0`, texto), `card`
 * (`#12151A`), `night` (`#101620`, fim do degradê dos cartões), `glow` (`#4CC9F03B`, começo do degradê), `line` (`#0EE6FF36`,
 * borda ciano), `hair` (`#FFFFFF17`, borda branca), `petrol` (`#05282C`, coluna de ícone dos tópicos).
 * Fontes: Titillium Web (títulos), Noto Serif Display **itálico 300** (trechos em `*itálico*`), Roboto (corpo) e Montserrat
 * (oferta) — `CONSULTORIA_EXTRA_FONTS`. **Titillium Web 500** (peso dos títulos no Elementor) não existe no Google Fonts (só 200, 300, 400, 600, 700, 900):
 * o original pede 500 e o navegador cai no 300 — os títulos aqui usam 300 explicitamente, o mesmo desenho; o itálico da Noto vem de `FONT_ITALIC` em `renderer/fonts.ts`.
 * A oferta, o FAQ e o rodapé são os blocos comuns `ebook*` (`renderer/ebook.ts`).
 *
 * **Degradê-assinatura** (`--cf-sig`): `radial-gradient(at top right, glow 0%, night 59%)`; a textura "wireframe" (`68.png`) entra
 * por `::before` com `--cf-tex` (imagem do bloco) e `--cf-tex-o` (opacidade) nos elementos `.cf-tex`.
 */
export const isConsultoria = (theme: Record<string, string>) =>
  theme.variant === "consultoria";

/** Fontes fixas da variante (nunca texto do usuário). */
export const CONSULTORIA_EXTRA_FONTS = [
  "Titillium Web",
  "Noto Serif Display",
  "Roboto",
  "Montserrat",
];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function consultoriaVars(
  theme: Record<string, string>
): Record<string, string> {
  const glow = safe(theme.glow, "#4CC9F03B");
  const night = safe(theme.night, "#101620");
  return {
    "--cf-card": safe(theme.card, "#12151A"),
    "--cf-glow": glow,
    "--cf-hair": safe(theme.hair, "#FFFFFF17"),
    "--cf-line": safe(theme.line, "#0EE6FF36"),
    "--cf-night": night,
    "--cf-petrol": safe(theme.petrol, "#05282C"),
    "--cf-sig": `radial-gradient(at top right, ${glow} 0%, ${night} 59%)`,
  };
}

const S = ".sb-cf";

/** Tablet (≤ 1024px). `x` = seletor da raiz (`.sb-cf` ou `.sb-cf.sb-narrow`). */
const tablet = (x: string) => `
${x} .cf-in{padding-inline:30px}
${x} .cf-h2{font-size:3em}
${x} .cf-h2 .cf-it{line-height:1.1}
${x} .cf-h3{font-size:1.7em}
${x} .cf-h4{font-size:1.3em}
${x} .cf-hero{padding:100px 0 120px}
${x} .cf-hero-p{margin-right:0;padding-right:170px}
${x} .cf-hero-h .cf-t,${x} .cf-hero-h .cf-it{font-size:4.3em}
${x} .cf-hero-h .cf-t{line-height:1}
${x} .cf-hero-h .cf-it{line-height:1}
${x} .cf-pill{font-size:4.3em}
${x} .cf-play{width:70px;height:70px;margin-right:-125px}
${x} .cf-play svg{width:16px;height:16px}
${x} .cf-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .cf-n{font-size:6.5em;line-height:.8em}
${x} .cf-pc{font-size:4.1em}
${x} .cf-about{flex-direction:column}
${x} .cf-ab-photo{flex:none;padding-top:30px;text-align:center}
${x} .cf-ab-photo-in{margin-right:0}
${x} .cf-ab-photo img{width:45%;max-width:100%;height:auto}
${x} .cf-ab-text{padding:120px 30px;text-align:center}
${x} .cf-ab-act{justify-content:center}
${x} .cf-ab-box{text-align:left}
${x} .cf-svc,${x} .cf-ws,${x} .cf-bn-top,${x} .cf-ts,${x} .cf-tp{padding-inline:0}
${x} .cf-svc{padding-block:130px}
${x} .cf-svc-p,${x} .cf-tp-p{padding-inline:100px}
${x} .cf-svc-card{padding:30px}
${x} .cf-svc-ic i{width:30px;height:30px}
${x} .cf-ws-img{width:79%}
${x} .cf-split{flex-direction:column;align-items:center;text-align:center}
${x} .cf-split-r{padding-left:0;align-items:center}
${x} .cf-bn-top{padding-top:120px}
${x} .cf-bn-img{height:280px}
${x} .cf-more .cf-h2{padding-bottom:40px}
${x} .cf-tp-col{padding-left:0;padding-right:0}
${x} .cf-tp-card{flex-direction:column}
${x} .eb-offer .eb-card{width:55%}
${x} .cf-tp-card{gap:0}
${x} .cf-tp-ic{flex:none;width:auto;border-radius:20px 20px 0 0}
${x} .cf-tp-body{text-align:center;align-items:center}
${x} .cf-ts-card,${x} .cf-ts-card.hl{flex:1 1 0;padding:50px 30px}
${x} .eb-faq{padding:120px 30px;min-height:0}
${x} .eb-faq-h{font-size:3em}
${x} .eb-faq-h em{font-size:1em;line-height:1.1em}
`;

const mobile = (x: string) => `
${x} .cf-in{padding-inline:20px}
${x} .cf-h2{font-size:2.1em}
${x} .cf-h3{font-size:1.5em}
${x} .cf-h4{font-size:1.2em}
${x} .cf-hero{padding:150px 0 120px}
${x} .cf-hero-p,${x} .cf-pill{display:none}
${x} .cf-hero-in{align-items:center;text-align:center}
${x} .cf-hero-h .cf-t,${x} .cf-hero-h .cf-it{font-size:2.7em}
${x} .cf-hl-1{flex-direction:column;gap:0}
${x} .cf-hl-2{display:grid;grid-template-columns:auto auto;justify-content:center;column-gap:10px}
${x} .cf-hl-2 .cf-it{margin-left:0}
${x} .cf-play{grid-column:1/3;justify-self:center;margin:24px 0 0}
${x} .cf-stats{padding-bottom:50px}
${x} .cf-stats-grid{grid-template-columns:1fr}
${x} .cf-n{font-size:5.4em}
${x} .cf-pc{font-size:3.4em}
${x} .cf-ab-photo img{width:75%}
${x} .cf-ab-text{padding:70px 20px 120px}
${x} .cf-ab-act{flex-direction:column;align-items:center;gap:20px}
${x} .cf-ab-box{flex-direction:column;align-items:center;gap:40px;text-align:center}
${x} .cf-ab-item{flex-direction:column;align-items:center}
${x} .eb-offer .eb-card{width:100%}
${x} .cf-svc{padding-block:120px}
${x} .cf-svc-p,${x} .cf-tp-p{padding-inline:0}
${x} .cf-svc-grid{grid-template-columns:1fr;row-gap:20px}
${x} .cf-svc-card{align-items:center;text-align:center}
${x} .cf-svc-p2{padding-right:0}
${x} .cf-svc-ic i{width:30px;height:30px}
${x} .cf-ws-row{flex-direction:column;gap:30px}
${x} .cf-ws-col{border-right:0!important}
${x} .cf-ws-img{width:46%}
${x} .cf-bn-top{padding-top:50px}
${x} .cf-bn-grid{grid-template-columns:1fr}
${x} .cf-bn-foot{flex-direction:column;align-items:flex-start;gap:10px}
${x} .cf-tp{padding-block:70px}
${x} .cf-tp-cols{flex-direction:column}
${x} .cf-tp-col{border-right:0!important;padding:30px 0}
${x} .cf-tp-ic i{width:32px;height:32px}
${x} .cf-ts{padding-block:70px}
${x} .cf-ts-row{flex-direction:column;align-items:stretch;gap:30px}
${x} .cf-ts-card,${x} .cf-ts-card.hl{flex:none;padding:50px 30px}
${x} .eb-faq{padding:120px 20px 70px}
${x} .eb-faq-h{font-size:2.1em}
`;

export const consultoriaCss = `
html:has(${S}){scroll-behavior:smooth}
${S}{font-family:'Roboto',sans-serif;font-size:16px;font-weight:400;line-height:1.5;color:var(--sb-fg)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} p,${S} figure{margin:0}
${S} .cf-sec{position:relative}
${S} .cf-in{box-sizing:border-box;width:100%;max-width:1340px;margin:0 auto;padding-inline:20px}
${S} .cf-p{margin:0 0 14.4px;color:var(--sb-fg)}
${S} .cf-p u{text-decoration:underline}
${S} .cf-p strong{font-weight:700}

/* títulos: Titillium reta + Noto Serif itálica fina */
${S} .cf-h{margin:0;color:#fff;font-family:'Titillium Web',sans-serif;text-transform:uppercase}
${S} .cf-it{font-family:'Noto Serif Display',serif;font-style:italic;font-weight:300}
${S} .cf-h2{font-weight:300;font-size:4em;line-height:1}
${S} .cf-h2{margin-top:-7px}
${S} .cf-h2 .cf-it{font-size:1em;line-height:1.016}
${S} .cf-h2 .cf-l+.cf-l{margin-top:13px}
${S} .cf-l{display:block}
${S} .cf-h3{margin:0;color:#fff;font-family:'Titillium Web',sans-serif;font-size:2em;font-weight:300;line-height:1}
${S} .cf-h4{margin:-4px 0;color:#fff;font-family:'Titillium Web',sans-serif;font-size:1.5em;font-weight:300;line-height:1;text-transform:uppercase}
${S} .cf-h6{margin:0;color:#fff;font-family:'Titillium Web',sans-serif;font-size:1.2em;font-weight:200;line-height:1;text-transform:uppercase}
${S} .cf-center{text-align:center}
${S} .cf-center .cf-it{margin-inline:8px}

/* botão padrão (pílula) e variante link */
${S} .cf-btn{display:inline-flex;align-items:center;gap:5px;box-sizing:border-box;padding:15px 40px;border-radius:50px;background:#00BDF82E;color:#fff;font-family:'Roboto',sans-serif;font-size:15px;font-weight:400;line-height:30px;text-decoration:none;transition:transform .3s ease-out}
${S} .cf-btn:hover,${S} .cf-btn:focus{transform:scale(1.1)}
${S} .cf-btn svg{flex:none;width:15px;height:15px}
${S} .cf-btn svg circle{fill:currentColor}
${S} .cf-btn svg path{fill:none;stroke:var(--cf-card);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
${S} .cf-btn.link{padding:0;background:none;color:var(--sb-accent)}
${S} .cf-btn.link{line-height:24px}

/* ícones */
${S} .cf-ic{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
${S} .cf-ic.fill{fill:currentColor;stroke:none}

/* textura (wireframe) por cima do fundo do cartão */
${S} .cf-tex{position:relative;isolation:isolate}
${S} .cf-tex::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:var(--cf-tex,none) var(--cf-tex-pos,center)/cover no-repeat;opacity:var(--cf-tex-o,.2);pointer-events:none}

/* hero */
${S} .cf-hero{overflow:hidden;padding:120px 0;background:radial-gradient(at top right,var(--cf-glow) 0%,var(--sb-bg) 100%)}
${S} .cf-hero::before{content:"";position:absolute;inset:0;background:var(--cf-wave,none) -709px -158px/300% auto no-repeat;opacity:.1;pointer-events:none}
${S} .cf-hero-in{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:20px}
${S} .cf-hero-p{margin:0 clamp(0px,calc(100% - 420px),800px) 14.4px 0;color:var(--sb-fg);text-align:left}
${S} .cf-hero-h{display:flex;flex-direction:column;gap:20px;margin:0;font-size:16px;font-weight:400}
${S} .cf-hl{display:flex;align-items:center;gap:20px}
${S} .cf-hl-2{justify-content:flex-start}
${S} .cf-hero-h .cf-t{margin-top:-6px;color:#fff;font-family:'Titillium Web',sans-serif;font-size:8em;font-weight:300;line-height:128px;text-transform:uppercase}
${S} .cf-hero-h .cf-it{margin-top:-7px;color:#fff;font-size:8em;line-height:150px;text-transform:uppercase}
${S} .cf-hl-2 .cf-it{margin-left:10px}
${S} .cf-pill{flex:0 0 10%;height:.656em;margin:0 -12px 0 20px;border-radius:300px;background:var(--cf-pill,none) center/cover no-repeat;font-size:8em}
${S} .cf-play{flex:none;display:inline-flex;align-items:center;justify-content:center;width:100px;height:100px;margin:0 -63px 0 auto;border-radius:50%;background:#4CC9F02E;color:#fff;text-decoration:none;animation:cf-ripple 2s ease-out infinite}
${S} .cf-play svg{width:28px;height:28px;margin-left:3px;fill:currentColor}
@keyframes cf-ripple{0%{box-shadow:0 0 0 0 #4CC9F03B,0 0 0 15px #4CC9F03B}100%{box-shadow:0 0 0 15px #4CC9F03B,0 0 0 30px #4CC9F000}}
${S} .cf-static .cf-play{animation:none}

/* números */
${S} .cf-stats{padding:0 0 160px}
${S} .cf-stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${S} .cf-stat{box-sizing:border-box;display:flex;flex-direction:column;gap:20px;min-width:0;padding:30px;border:solid var(--cf-hair);border-width:1px 1px 0 0;border-radius:20px;background:var(--cf-card)}
${S} .cf-stat.hl{--cf-tex-o:.31;border:1px solid var(--cf-line);background:var(--cf-sig)}
${S} .cf-stat .cf-h6{text-align:center}
${S} .cf-num{display:flex;align-items:flex-end;justify-content:center;gap:20px;margin-top:40px}
${S} .cf-n{color:#fff;font-family:'Noto Serif Display',serif;font-size:8em;font-style:italic;font-weight:300;line-height:120px}
${S} .cf-pc{color:var(--sb-accent);font-family:'Noto Serif Display',serif;font-size:5.1em;font-style:italic;font-weight:300;line-height:1;text-transform:uppercase}

/* você merece... */
${S} .cf-about{display:flex;border:solid var(--cf-line);border-width:1px 0;background:var(--cf-card)}
${S} .cf-ab-photo{position:relative;z-index:2;box-sizing:border-box;display:flex;flex:0 0 50%;flex-direction:column;justify-content:flex-end;background:linear-gradient(137deg,#0A0734 0%,#003F9E 100%)}
${S} .cf-ab-photo-in{margin-right:-269px;line-height:0;text-align:center}
${S} .cf-ab-photo img{display:inline-block;max-width:100%;height:auto}
${S} .cf-ab-text{box-sizing:border-box;flex:1 1 0;min-width:0;padding:120px 100px 120px 70px}
${S} .cf-ab-text>*+*{margin-top:20px}
${S} .cf-ab-text .cf-h2{margin-top:-11px}
${S} .cf-ab-act{display:flex;align-items:center;gap:20px}
${S} .cf-author{display:flex;align-items:center;gap:20px}
${S} .cf-author img{display:block;width:57px;height:57px;border-radius:100px;object-fit:cover}
${S} .cf-author b{display:block;color:#fff;font-family:'Titillium Web',sans-serif;font-size:1.2em;font-weight:300;line-height:1.1;text-transform:uppercase}
${S} .cf-author span{display:block;color:var(--sb-fg)}
${S} .cf-ab-hr{width:100%;height:0;margin-top:45px!important;border:0;border-top:1px solid var(--cf-hair)}
${S} .cf-ab-box{--cf-tex-o:.23;--cf-tex-pos:-154px 17px;box-sizing:border-box;display:flex;gap:20px;margin-top:56px!important;padding:30px;border:1px solid var(--cf-line);border-radius:20px;background:var(--cf-sig)}
${S} .cf-ab-item{display:flex;flex:1 1 0;align-items:center;gap:13px;min-width:0}
${S} .cf-ab-ic{flex:none;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:#4CC9F02E;color:#fff}
${S} .cf-ab-ic svg{width:23px;height:23px}
${S} .cf-ab-item .cf-h6{margin:8px 0 9px;line-height:1.2;text-transform:none}

/* estratégias */
${S} .cf-svc{padding:130px 0}
${S} .cf-svc-p,${S} .cf-tp-p{box-sizing:border-box;padding-inline:400px;text-align:center}
${S} .cf-svc .cf-in>*+*{margin-top:20px}
${S} .cf-svc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:50px 40px;margin-top:50px!important}
${S} .cf-svc-card{--cf-tex-o:.15;--cf-tex-pos:-92px 74px;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;gap:20px;padding:50px;border:1px solid var(--cf-line);border-radius:20px;background:var(--cf-sig)}
${S} .cf-svc-card>*{margin:0}
${S} .cf-svc-ic{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:84px;height:84px;border:1px solid #4CC9F09C;border-radius:50%;background:#4CC9F02E;color:#fff}
${S} .cf-svc-ic svg{width:41px;height:41px}
${S} .cf-svc-card .cf-h3{padding:20px 0 15px}
${S} .cf-svc-card .cf-svc-p2{margin:0 0 14.4px;padding-right:40px;color:var(--sb-fg)}

/* faixa de palavras */
${S} .cf-ws{padding:50px 0;border-top:1px solid var(--cf-line);background:var(--sb-bg)}
${S} .cf-ws::before{content:"";position:absolute;inset:0;background:var(--cf-sig);opacity:.92;pointer-events:none}
${S} .cf-ws-row{position:relative;display:flex}
${S} .cf-ws-col{display:flex;flex:1 1 0;align-items:center;justify-content:center;min-width:0;border-right:1px solid var(--cf-hair)}
${S} .cf-ws-col:last-child{border-right:0}
${S} .cf-ws-img{display:block;width:60%;height:auto;opacity:.25;transition:opacity 1s,transform .3s ease-out}
${S} .cf-ws-col:hover .cf-ws-img,${S} .cf-ws-img:hover{opacity:1;transform:scale(1.1)}

/* bônus */
${S} .cf-bn-top{position:relative;z-index:2;padding-top:120px;border-top:1px solid var(--cf-line)}
${S} .cf-split{display:flex;align-items:flex-start;gap:20px}
${S} .cf-split-l{flex:0 0 58.7%;min-width:0;margin-top:-11px}
${S} .cf-split-r{box-sizing:border-box;display:flex;flex:1 1 0;flex-direction:column;align-items:flex-start;gap:20px;min-width:0;padding-left:100px}
${S} .cf-split-r .cf-p{margin:0;padding-right:40px}
${S} .cf-bn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:50px}
${S} .cf-bn-card{box-sizing:border-box;min-width:0;padding:20px 20px 40px;border:1px solid var(--cf-hair);border-radius:20px;background:var(--cf-card)}
${S} .cf-bn-img{position:relative;box-sizing:border-box;height:470px;border-radius:20px;background:var(--cf-bn-img,none) center/cover no-repeat}
${S} .cf-bn-tag{position:absolute;left:30px;bottom:50px;display:inline-flex;align-items:center;gap:6px;padding:3px 15px;border-radius:50px;background:var(--cf-card);color:#fff;font-family:'Titillium Web',sans-serif;font-size:1em;font-weight:200;line-height:24px}
${S} .cf-bn-tag svg{width:20px;height:20px;color:var(--sb-accent)}
${S} .cf-bn-foot{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:16px;padding:20px 20px 0}
${S} .cf-bn-foot .cf-h3{margin-top:-4px;line-height:1}
${S} .cf-more{position:relative;z-index:1;margin-top:calc(var(--cf-ov,270px)*-1);padding:calc(var(--cf-ov,270px) + 30px) 0 80px;border:solid var(--cf-line);border-width:1px 0}
${S} .cf-more::before{content:"";position:absolute;inset:0;background:var(--cf-more-img,none) center/cover no-repeat;opacity:var(--cf-more-o,.47);pointer-events:none}
${S} .cf-more .cf-in{position:relative}
${S} .cf-more .cf-h2{margin-top:0;padding-bottom:70px}

/* simples, direto, eficaz */
${S} .cf-tp{padding:120px 0;background:var(--sb-bg)}
${S} .cf-tp .cf-in>*+*{margin-top:20px}
${S} .cf-tp .cf-h2{text-align:center}
${S} .cf-tp-cols{display:flex;margin-top:40px!important}
${S} .cf-tp-col{box-sizing:border-box;display:flex;flex:1 1 0;flex-direction:column;gap:50px;min-width:0;padding:50px 0}
${S} .cf-tp-col.l{padding-right:70px;border-right:1px solid var(--cf-line)}
${S} .cf-tp-col.r{padding-left:70px}
${S} .cf-tp-card{position:relative;isolation:isolate;display:flex;gap:20px;overflow:hidden;border:1px solid var(--cf-line);border-radius:20px;background:var(--cf-card)}
${S} .cf-tp-card::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,var(--cf-glow) 0%,var(--cf-night) 59%);opacity:.5}
${S} .cf-tp-ic{box-sizing:border-box;display:flex;flex:0 0 29%;align-items:center;justify-content:center;padding:20px;border-radius:20px 0 0 20px;background:var(--cf-petrol)}
${S} .cf-tp-ic i{display:inline-flex;align-items:center;justify-content:center;width:88px;height:88px;border-radius:50%;background:var(--cf-card);color:#fff}
${S} .cf-tp-ic svg{width:44px;height:44px}
${S} .cf-tp-body{box-sizing:border-box;display:flex;flex:1 1 0;flex-direction:column;align-items:flex-start;gap:20px;min-width:0;padding:35px 20px}
${S} .cf-tp-body .cf-p{margin:0 0 2.4px}

/* depoimentos */
${S} .cf-ts{padding:120px 0;border:solid var(--cf-line);border-width:1px 0;background:var(--cf-card)}
${S} .cf-ts-row{display:flex;align-items:flex-start;gap:20px;margin-top:70px}
${S} .cf-ts-card{box-sizing:border-box;display:flex;flex:1 1 0;flex-direction:column;align-items:center;min-width:0;padding:50px;border-radius:20px;background:var(--sb-bg);text-align:center}
${S} .cf-ts-card.hl{--cf-tex-o:.14;--cf-tex-pos:-403px 132px;flex:0 0 40%;padding:50px 80px;border:1px solid var(--cf-line);background:var(--cf-sig)}
${S} .cf-ts-card>*{margin:0}
${S} .cf-ts-card .cf-quote{width:40px;height:40px;margin-top:30px;color:var(--sb-accent)}
${S} .cf-ts-card blockquote{margin-top:27px}
${S} .cf-ts-card .cf-stars{display:flex;gap:5px;margin-top:37px;color:#FEC42D}
${S} .cf-stars svg{width:16px;height:16px}
${S} .cf-ts-card img{display:block;width:70px;height:70px;margin-top:15px;border-radius:50%;object-fit:cover}
${S} .cf-ts-card .cf-ts-name{margin-top:25px;margin-bottom:3px;color:#fff;font-family:'Titillium Web',sans-serif;font-size:1.2em;font-weight:200;line-height:1.1}

/* ebook*: ajustes da variante (oferta, FAQ em caixas e rodapé) */
${S} .eb-offer{box-sizing:border-box;max-width:1220px;margin-inline:auto}
${S} .eb-offer .eb-card{width:36%}
${S} .eb-offer .eb-card{padding:20px 10px 45px}
${S} .eb-offer .eb-cash{padding-top:5px}
${S} .eb-offer .eb-from{margin:-10px 0 4px;line-height:44px}
${S} .eb-offer .eb-price{margin-bottom:-8px}
${S} .eb-offer .eb-buy{padding-block:22px}
${S} .eb-offer .eb-stamps{margin-top:8px}
${S} .eb-faq{padding:120px 16px;min-height:0}
${S} .eb-faq-h{font-family:'Titillium Web',sans-serif;font-size:4em;font-weight:300;line-height:1;text-transform:uppercase}
${S} .eb-faq-h span+span{margin-top:10px}
${S} .eb-faq-h em{font-family:'Noto Serif Display',serif;font-size:1em;font-style:italic;font-weight:300;line-height:1.016}
${S} .eb-foot{padding:0}
${S} .eb-foot-in p{font-weight:300;text-transform:uppercase}

@media (max-width:1024px){${tablet(S)}}
@media (min-width:768px) and (max-width:1024px){${S} .cf-ts-card.cf-hide-t{display:none}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}${mobile(`${S}.sb-narrow`)}
@media (prefers-reduced-motion:reduce){
${S} .cf-play{animation:none}
${S} .cf-btn,${S} .cf-ws-img{transition:none}
}
`;
