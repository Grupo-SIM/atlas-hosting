/**
 * Variante `habilidades` (escopo `.sb-hc`): página de vendas do e-book "Habilidades de Comunicação"
 * (lp.centraldomarketing.com — WordPress + Hello Elementor 4.3, modelo Canvas; post 29388, kit 52953). Breakpoints do
 * original: laptop ≤ 1366 (faixa 1025–1366 abaixo, como a da variante `outrolado`), tablet ≤ 1024 e celular ≤ 767; no
 * preview estreito do editor as regras de tablet e celular valem também via `.sb-narrow`.
 *
 * Tokens do tema: `accent` (magenta `#DE41FF`), `bg` (`#0B0B0B`), `fg`, `muted` (`#C5C5C5`), `violet`/`pink`
 * (degradê do botão do hero), `panel` (cartão de benefício), `line` (borda dos cartões de capítulo) e `gold` (estrela
 * dos bônus no hover). O cartão de oferta, o FAQ e o rodapé são os blocos comuns `ebook*` (`renderer/ebook.ts`).
 */
export const isHabilidades = (theme: Record<string, string>) =>
  theme.variant === "habilidades";

/** Fontes fixas da variante (nunca texto do usuário). Electrolize só existe no peso 400. */
export const HABILIDADES_EXTRA_FONTS = ["Electrolize", "Montserrat", "Roboto"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function habilidadesVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--hc-gold": safe(theme.gold, "#FFB700"),
    "--hc-line": safe(theme.line, "#FFFFFF1A"),
    "--hc-panel": safe(theme.panel, "#141414"),
    "--hc-pink": safe(theme.pink, "#D457F8"),
    "--hc-violet": safe(theme.violet, "#6F09F7"),
  };
}

const S = ".sb-hc";

/** Laptop: 1025–1366px. */
const laptop = `
${S} .hc-hero-text{width:500px}
${S} .hc-ben-row.r0{width:75%}
${S} .hc-chap-grid{width:883px}
${S} .hc-bonus-row{flex-direction:column}
${S} .hc-bonus-list li{flex-direction:column;align-items:center;text-align:center}
${S} .hc-bonus-t{font-size:24px;text-align:center}
${S} .hc-support-h{font-size:30px}
${S} .hc-support-t{margin-top:-20px;font-size:22px}
`;

const tablet = (x: string) => `
${x} .hc-sec{background-image:var(--hc-bg,none);min-height:var(--hc-h-t,var(--hc-h,0px))}
${x} .hc-bar-l img{width:45%}
${x} .hc-buy{margin-right:-100px}
${x} .hc-hero-row{width:100%;min-height:353px}
${x} .hc-hero-text{width:61%;margin:0;padding:0 20px}
${x} .hc-hero-title{font-size:39px;line-height:1.1}
${x} .hc-hero-sub{margin-top:0;font-size:20px}
${x} .hc-ben-in{margin-top:50px}
${x} .hc-ben-h{font-size:31px;line-height:1}
${x} .hc-ben-sub{font-size:16px}
${x} .hc-ben-rows{gap:20px}
${x} .hc-ben-row,${x} .hc-ben-row.r0,${x} .hc-ben-row.r1{display:flex;flex-direction:column;gap:20px;width:90%;margin:0 auto}
${x} .hc-ben-card{flex-direction:column;min-height:0;padding:20px 15px;gap:10px}
${x} .hc-ben-t{margin:0;padding:0}
${x} .hc-chap-grid{width:100%;padding:0 20px}
${x} .hc-chap-l{font-size:var(--hc-label-t,12px);letter-spacing:4px}
${x} .hc-bonus-row{flex-direction:column;align-items:stretch}
${x} .hc-bonus-l{justify-content:flex-start}
${x} .hc-bonus-h{font-size:49px;text-align:left}
${x} .hc-bonus-t{font-size:18px}
${x} .hc-support-t{margin-top:-20px}
${x} .hc-bonus-list li{flex-direction:column;align-items:center;text-align:center}
`;

const mobile = (x: string) => `
${x} .hc-sec{background-image:var(--hc-bg-m,var(--hc-bg,none));min-height:var(--hc-h-m,var(--hc-h-t,var(--hc-h,0px)))}
${x} .hc-hero{max-width:500px;margin-inline:auto}
${x} .hc-bar{flex-direction:column;justify-content:center;min-height:164px}
${x} .hc-bar-l{flex:none;width:100%}
${x} .hc-bar-r{display:none}
${x} .hc-hero-row{margin-top:-85px;min-height:469px}
${x} .hc-hero-text{width:100%;padding:0 20px}
${x} .hc-hero-title{font-size:32px;line-height:1.3}
${x} .hc-pill{padding:20px 50px;font-size:17px}
${x} .hc-ben{padding-bottom:76px}
${x} .hc-ben-in{width:90%;padding-inline:0}
${x} .hc-ben-h{margin:18px 0;font-size:23px}
${x} .hc-ben-sub{margin-top:26px;font-size:20px}
${x} .hc-chap-grid{grid-template-columns:minmax(0,500px);justify-content:center;padding:40px 20px;gap:5px}
${x} .hc-chap-card{width:100%}
${x} .hc-chap-t,${x} .hc-chap-d,${x} .hc-chap-l{max-width:300px;margin-inline:auto;width:100%}
${x} .hc-chap-t{letter-spacing:.9px;line-height:1.6}
${x} .hc-chap-l{font-size:13px}
${x} .hc-bonus-h{font-size:39px;text-align:center}
${x} .hc-bonus-t{font-size:22px;line-height:1.6}
${x} .hc-support-h{font-size:26px}
${x} .hc-support-t{margin-top:-10px;font-size:18px}
`;

export const habilidadesCss = `
${S}{font-family:var(--sb-font-body);font-size:16px;line-height:1.5;color:var(--sb-fg);background:var(--sb-bg)}
${S} main{padding-top:0!important}
${S} p,${S} h1,${S} h2,${S} h3,${S} ul{margin:0;padding:0}
${S} img{max-width:100%}
${S} .hc-sec{position:relative;box-sizing:border-box;min-height:var(--hc-h,0px);background-color:var(--sb-bg);background-image:var(--hc-bg,none);background-position:var(--hc-pos,center center);background-repeat:no-repeat;background-size:cover}
${S} .hc-h{font-family:var(--sb-font-heading);font-weight:400;color:var(--sb-fg)}
${S} .hc-hl{color:var(--sb-accent)}

/* hero */
${S} .hc-hero{display:flex;flex-direction:column;padding:10px}
${S} .hc-bar{display:flex;align-items:center;min-height:60px;padding:10px}
${S} .hc-bar-l{flex:0 0 49.476%;padding:10px;text-align:center}
${S} .hc-bar-l img{width:36%;height:auto;margin-inline:auto}
${S} .hc-bar-r{display:flex;flex:1;align-items:center;justify-content:center;padding:10px}
${S} .hc-buy{display:inline-block;margin-right:-250px;padding:12px 24px;border:1px solid var(--sb-accent);border-radius:3px;color:#fff;font-family:'Roboto',sans-serif;font-size:15px;font-weight:400;line-height:15px}
${S} .hc-hero-row{display:flex;align-items:center;width:63%;min-height:565px;margin-top:20px}
${S} .hc-hero-text{width:61.3%;margin:50px 0 0 calc(28.5% + 10px);padding:0 10px;text-align:left}
${S} .hc-hero-title{margin:0;font-size:47px;font-weight:900;line-height:60px;text-align:left}
${S} .hc-hero-sub{margin-top:5px;font-family:var(--sb-font-heading);font-size:26px;font-weight:300;line-height:35px;color:var(--sb-muted,#C5C5C5)}
${S} .hc-pill{display:inline-block;margin:14px 0 0 10px;padding:20px 50px;border:2px solid #fff;border-radius:59px;background:linear-gradient(31deg,var(--hc-violet) 0%,var(--hc-pink) 100%);box-shadow:0 0 18px 0 var(--hc-pink);color:#fff;font-family:var(--sb-font-heading);font-size:19px;font-weight:700;line-height:1;text-shadow:0 0 10px rgba(0,0,0,.3)}

/* "Imagine…" + benefícios */
${S} .hc-ben{display:flex;flex-direction:column;align-items:center}
${S} .hc-ben-in{width:100%;max-width:1339px;margin:80px auto 0;padding:20px 10px 0}
${S} .hc-ben-h{font-size:38px;line-height:42px;text-align:center}
${S} .hc-ben-sub{margin-top:38px;font-family:var(--sb-font-heading);font-size:20px;font-weight:300;line-height:22px;text-align:center;color:var(--sb-muted,#C5C5C5)}
${S} .hc-ben-rows{display:flex;flex-direction:column;gap:35px;width:100%;margin-top:52px}
${S} .hc-ben-row{display:grid;gap:30px}
${S} .hc-ben-row.r0{grid-template-columns:repeat(3,minmax(0,1fr));width:94.3%;margin-left:3.4%}
${S} .hc-ben-row.r1{grid-template-columns:1.52fr 1fr 1fr;width:82.5%;margin-left:8.75%}
${S} .hc-ben-card{display:flex;align-items:center;min-height:112px;padding:10px 15px 10px 13px;background:var(--hc-panel)}
${S} .hc-ben-row.r1 .hc-ben-card{min-height:140px}
${S} .hc-ben-ic{flex:none;width:56px;margin-right:56px;color:var(--sb-accent)}
${S} .hc-ben-ic svg{display:block;width:100%;height:56px;fill:currentColor}
${S} .hc-ben-t{flex:1;margin:0;font-size:17px;line-height:1.5;text-align:center;color:#E0E0E0}

/* capítulos */
${S} .hc-chap{display:flex;flex-direction:column;justify-content:center}
${S} .hc-chap::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,var(--sb-bg) 3%,transparent 15%)}
${S} .hc-chap-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px 22px;width:62.3%;margin:0 auto}
${S} .hc-chap-card{display:flex;flex-direction:column;box-sizing:border-box;width:100%;padding:12px 15px 12px;border:3px solid var(--hc-line)}
${S} .hc-chap-card img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover}
${S} .hc-chap-t{margin-top:16px;font-size:22px;font-weight:600;line-height:1.5;text-align:left}
${S} .hc-chap-n{font-size:25px}
${S} .hc-chap-d{margin-top:6px;font-family:Verdana,sans-serif;font-size:16px;line-height:22px;color:#D6D6D6}
${S} .hc-chap-l{margin-top:32px;padding-bottom:36px;font-size:14px;line-height:10px;letter-spacing:5.6px;color:var(--sb-accent)}

/* bônus + oferta + suporte */
${S} .hc-bonus{display:flex;flex-direction:column;align-items:center;padding:90px 10px 0}
${S} .hc-bonus::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,var(--sb-bg) 0%,transparent 92%)}
${S} .hc-bonus>*{position:relative;z-index:1}
${S} .hc-bonus-row{display:flex;justify-content:space-around;width:100%;max-width:1280px;padding:0 10px}
${S} .hc-bonus-l{display:flex;flex:1;align-items:center;justify-content:center;padding-top:26px}
${S} .hc-bonus-h{margin:0;font-size:70px;line-height:60px;text-align:center}
${S} .hc-bonus-list{display:flex;flex:1;flex-direction:column;gap:20px;margin:0;list-style:none}
${S} .hc-bonus-list li{display:flex;gap:20px;align-items:flex-start;padding-bottom:20px}
${S} .hc-star{flex:none;width:50px;height:56px;fill:var(--sb-accent);transition:fill .3s}
${S} .hc-star:hover{fill:var(--hc-gold)}
${S} .hc-bonus-t{font-family:Tahoma,Verdana,sans-serif;font-size:28px;line-height:38px;text-align:left;color:#fff}
${S} .hc-bonus-slot{display:flex;justify-content:center;width:100%;max-width:1240px;margin-top:50px}
${S} .hc-bonus-slot>.sb-block{width:100%}
${S} .hc-support{display:flex;flex-direction:column;align-items:center;padding:50px 0 70px;text-align:center}
${S} .hc-support-h{margin-bottom:14px;font-size:40px;line-height:60px;color:#DDD}
${S} .hc-support-t{margin-top:-10px;font-family:Tahoma,Verdana,sans-serif;font-size:30px;line-height:45px;color:#DDD}

@media (min-width:1025px) and (max-width:1366px){${laptop}}
@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
@media (prefers-reduced-motion:reduce){${S} .hc-star{transition:none}}
`;
