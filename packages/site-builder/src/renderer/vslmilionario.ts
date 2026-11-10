/**
 * Variante `vslmilionario` (escopo `.sb-vm`): página de vendas do e-book "VSL Milionário"
 * (ebookvslmilionario.centraldomarketing.com — WordPress + Hello Elementor 4.4, modelo Canvas, página 109, kit 10).
 * Medidas conferidas no site renderizado (Chromium, 1440/820/390; altura total em 1440 = 7685 px): `em` = 16px no
 * computador e 15px até 1024 (o tema encolhe a raiz). Breakpoints do original: tablet ≤ 1024, celular ≤ 767, repetidos
 * sob `.sb-narrow` (no preview estreito do editor tablet e celular valem os dois).
 *
 * Tokens do tema: `accent` (magenta `#FD0988`: sobretítulos, ícones, preço, início do degradê do botão), `bg`
 * (`#191C26`), `card` (`#252831`, cartões sólidos), `violet` (`#7237BD`, fim do degradê e hover do botão), `glass`
 * (`#FFFFFF2B`, bordas e topo dos cartões de vidro), `night`/`night2` (`#070B20`/`#16163C`, degradês das seções).
 * Fontes: Poppins (títulos) e Inter (corpo) — `VSLMILIONARIO_EXTRA_FONTS`. O cartão de oferta, o FAQ e o rodapé são os
 * blocos comuns `ebook*` (`renderer/ebook.ts`).
 */
export const isVslMilionario = (theme: Record<string, string>) =>
  theme.variant === "vslmilionario";

/** Fontes fixas da variante (nunca texto do usuário). */
export const VSLMILIONARIO_EXTRA_FONTS = ["Poppins", "Inter"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function vslmilionarioVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--vm-glass": safe(theme.glass, "#FFFFFF2B"),
    "--vm-night": safe(theme.night, "#070B20"),
    "--vm-night2": safe(theme.night2, "#16163C"),
    "--vm-violet": safe(theme.violet, "#7237BD"),
  };
}

const S = ".sb-vm";

/** Tablet (≤ 1024px). `x` = seletor da raiz (`.sb-vm` ou `.sb-vm.sb-narrow`). */
const tablet = (x: string) => `
${x} .vm-sec{font-size:15px}
${x} .vm-h1{font-size:48px}
${x} .vm-h2{font-size:36px}
${x} .vm-eyebrow{font-size:17px}
${x} .vm-body,${x} .vm-p{font-size:15px}
${x} .vm-small{font-size:13px}
${x} .vm-hero{padding:135px 0 7em;background-image:var(--vm-bg-t);background-position:var(--vm-pos-t)}
${x} .vm-hero-copy{width:60%;padding:0 2em}
${x} .vm-hero-sub{font-size:25px}
${x} .vm-hl{margin-top:-6em}
${x} .vm-hl-card{padding:1em}
${x} .vm-method{padding:1em 0 3em}
${x} .vm-method-in{flex-direction:column;align-items:stretch}
${x} .vm-method-text{flex:none;width:100%;padding:3em}
${x} .vm-method-media{flex:none;width:100%;height:425px}
${x} .vm-method-img{left:auto;right:0;width:75vw;height:425px}
${x} .vm-vframe{top:9px;left:2em;width:calc(100% - 285px);transform:none}
${x} .vm-features{padding:0 0 3em}
${x} .vm-fcard{padding:2em 1em}
${x} .vm-stats{padding:3em 0 7em}
${x} .vm-stats-in{flex-direction:column}
${x} .vm-stats-text{width:100%}
${x} .vm-benefits{padding:1em 0 3em}
${x} .vm-ben-grid{padding-inline:20px}
${x} .vm-solid .vm-icon{width:42px;height:42px}
${x} .vm-bonus{padding:2em 0 3em}
${x} .vm-bonus-text{padding:1.5em}
${x} .vm-guarantee{padding:5em 0 10em}
${x} .vm-tcar{--si-gap:28px!important}
${x} .vm-quote{font-size:16px}
${x} .vm-testi .vm-head{padding:0 2em}
`;

/** Celular (≤ 767px). */
const mobile = (x: string) => `
${x} .vm-sec{font-size:14.6px}
${x} .vm-h1{font-size:38px}
${x} .vm-h2{font-size:28px}
${x} .vm-eyebrow{font-size:16px}
${x} .vm-body,${x} .vm-p{font-size:14px}
${x} .vm-small{font-size:12px}
${x} .vm-hero{align-items:stretch;background-image:var(--vm-bg-m);background-position:var(--vm-pos-m);padding:3em 0 7em}
${x} .vm-hero-in{display:flex;flex-direction:column;flex:1}
${x} .vm-hero-copy{display:flex;flex:1;flex-direction:column;width:100%;padding:0 1em}
${x} .vm-hero-copy .vm-h1{margin-bottom:auto}
${x} .vm-hero-sub{font-size:21px}
${x} .vm-hl-grid{grid-template-columns:1fr}
${x} .vm-method{padding:0}
${x} .vm-method-text{padding:2em}
${x} .vm-method-media{height:275px}
${x} .vm-method-img{width:75vw;height:275px}
${x} .vm-vframe{top:18px;left:21px;width:calc(100% - 70px);border-width:min(var(--vm-frame,12px),7px)}
${x} .vm-grid3{grid-template-columns:1fr}
${x} .vm-3d{width:20%;height:auto}
${x} .vm-stats{padding:1em 0 7em}
${x} .vm-strip{grid-template-columns:1fr 1fr;padding:1em}
${x} .vm-counter{padding:1em 0}
${x} .vm-counter:nth-child(odd){border-left:0}
${x} .vm-counter:nth-child(n+3){border-top:1px solid var(--vm-glass)}
${x} .vm-benefits{padding:0 0 1em}
${x} .vm-ben-grid{grid-template-columns:1fr}
${x} .vm-bonus{padding:0 0 2em}
${x} .vm-bonus-in{flex-direction:column;align-items:stretch}
${x} .vm-bonus-text{width:100%;padding:2em}
${x} .vm-bonus-list{width:100%;padding:0 10px}
${x} .vm-bcard{flex-direction:column;align-items:flex-start;gap:14px}
${x} .vm-bcard .vm-3d{width:17%;height:auto;max-height:70px}
${x} .vm-guarantee{padding:3em 0 9em}
${x} .vm-tcar{--si-gap:10px!important}
${x} .vm-quote{font-size:14px}
`;

export const vslmilionarioCss = `
html:has(${S}){scroll-behavior:smooth}
${S}{font-size:16px;line-height:1.5}
${S} h1,${S} h2,${S} h4,${S} h6{margin:0;color:#fff;font-family:var(--sb-font-heading)}
${S} main{padding-top:0!important}
${S} p{margin:0}
${S} .vm-sec{position:relative;font-size:16px}
${S} .vm-in{position:relative;z-index:1;display:flow-root;max-width:1280px;margin:0 auto}
${S} .vm-layer{position:absolute;inset:0;z-index:0;background:var(--vm-ov) var(--vm-ov-p) / var(--vm-ov-s) no-repeat;opacity:var(--vm-ov-o);pointer-events:none}

/* tipografia */
${S} .vm-h1{font-size:72px;font-weight:600;line-height:1;letter-spacing:-2px}
${S} .vm-h2{font-size:48px;font-weight:600;line-height:1.1;letter-spacing:-2px}
${S} .vm-h4{font-size:24px;font-weight:300;line-height:1.3}
${S} .vm-eyebrow{font-size:18px;font-weight:500;line-height:1.5;letter-spacing:2px;text-transform:uppercase;color:var(--sb-accent)}
${S} .vm-body{font-size:16px;line-height:1.5}
${S} .vm-p{margin-bottom:14.4px;font-size:16px;line-height:1.5}
${S} .vm-p:last-of-type{margin-bottom:0}
${S} .vm-features .vm-fcard .vm-body,${S} .vm-stats-text .vm-body,${S} .vm-guarantee .vm-body,${S} .vm-bonus-text .vm-body{margin-bottom:14.4px}
${S} .vm-small{font-size:14px;line-height:1.6}
${S} .vm-head{display:flex;flex-direction:column;align-items:center;gap:20px;max-width:720px;margin:10px auto 0;padding:2em;text-align:center}
${S} .vm-head.left{align-items:flex-start;margin:0;padding:0;text-align:left}

/* botão */
${S} .vm-btn{display:inline-block;padding:20px 40px;border-radius:30px;background:linear-gradient(135deg,var(--sb-accent) 0%,var(--vm-violet) 100%);color:#fff;font-family:var(--sb-font-body);font-size:18px;font-weight:500;line-height:1;text-align:center;transition:background .3s}
${S} .vm-btn:hover,${S} .vm-btn:focus{background:var(--vm-violet)}
${S} .vm-btn.sm{padding:12px 24px;font-size:15px;line-height:15px}

/* cartão de vidro */
${S} .vm-glass{margin:10px;padding:2em;border:1px solid var(--vm-glass);border-radius:10px;background:linear-gradient(180deg,var(--vm-glass) 0%,transparent 100%)}
${S} .vm-glass.soft{background:linear-gradient(180deg,var(--vm-glass) 0%,transparent 60%);box-shadow:inset 0 0 60px -30px rgba(255,255,255,.17)}
${S} .vm-icon{flex:none;width:50px;height:50px;color:#fff}
${S} .vm-3d{display:block;width:auto;height:70px;object-fit:contain}

/* hero */
${S} .vm-hero{z-index:0;display:flex;align-items:flex-start;min-height:100vh;padding:10em 0;background:var(--vm-bg) var(--vm-pos) / cover no-repeat}
${S} .vm-veil{position:absolute;inset:0;z-index:0;background:linear-gradient(90deg,#070B20CC 40%,transparent 100%);pointer-events:none}
${S} .vm-hero-in{width:100%;max-width:1350px;padding:0 10px}
${S} .vm-hero-copy{width:calc(50% - 10px)}
${S} .vm-hero-sub{margin:30px 22px 0 10px;font-size:30px;font-weight:700;line-height:1.3}
${S} .vm-hero .vm-btn{margin:20px 0 0 10px}

/* destaques */
${S} .vm-hl{z-index:2;margin-top:-7em}
${S} .vm-hl-grid{display:grid;grid-template-columns:repeat(3,1fr)}
${S} .vm-hl-card{display:flex;flex-direction:column;align-items:center;gap:15px;text-align:center}
${S} .vm-hl-card .vm-h4{margin:0}

/* método */
${S} .vm-method{padding:7em 0 3em}
${S} .vm-method-in{display:flex;align-items:center}
${S} .vm-method-text{flex:0 0 65%;box-sizing:border-box;padding:3em calc(3em + min(166px,13vw)) 3em 3em}
${S} .vm-method-text .vm-head{margin:0 0 20px}
${S} .vm-method-text .vm-btn{margin-top:20px}
${S} .vm-method-media{position:relative;flex:0 0 35%;height:600px}
${S} .vm-method-img{position:absolute;top:0;left:0;width:40vw;max-width:none;height:600px;border-radius:10px;object-fit:cover}
${S} .vm-vframe{position:absolute;z-index:2;top:50%;left:-148px;box-sizing:border-box;width:calc(100% + 136px);aspect-ratio:var(--vm-ratio,4/3);border:var(--vm-frame,12px) solid var(--vm-glass);border-radius:10px;background:#000;overflow:hidden;transform:translateY(-50%)}
${S} .vm-vposter{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--vm-poster) center / cover no-repeat}
${S} .vm-vframe iframe{display:block;width:100%;height:100%;border:0}
${S} .vm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .vm-play{width:80px;height:80px;fill:#fff;stroke:#fff;stroke-width:2.5;transition:transform .3s}
${S} .vm-play circle{fill:none}
${S} .vm-vposter:hover .vm-play{transform:scale(1.1)}

/* segredos revelados */
${S} .vm-features{padding:4em 0 7em}
${S} .vm-grid3{display:grid;grid-template-columns:repeat(3,1fr)}
${S} .vm-fcard{display:flex;flex-direction:column;align-items:center;gap:20px;padding-inline:35px;text-align:center}
${S} .vm-fcard .vm-h4{margin:0}

/* +10 mil e números */
${S} .vm-stats{padding:7em 0 10em;background:radial-gradient(at bottom center,var(--vm-night2) 0%,var(--vm-night) 100%)}
${S} .vm-stats-in{display:flex}
${S} .vm-stats-text{display:flex;flex:0 0 50%;flex-direction:column;gap:20px;padding:2em}
${S} .vm-stats-side{flex:1}
${S} .vm-strip-wrap{position:relative;z-index:2}
${S} .vm-strip{display:grid;grid-template-columns:repeat(4,1fr);width:min(1240px,100% - 40px);margin:-86px auto 10px;padding:2em 2em calc(2em + 16px)}
${S} .vm-counter{display:flex;flex-direction:column;align-items:center;border-left:1px solid var(--vm-glass);text-align:center}
${S} .vm-counter:first-child{border-left:0}
${S} .vm-num{font-family:var(--sb-font-heading);font-size:48px;font-weight:600;line-height:1.1;letter-spacing:-2px;color:#fff}
${S} .vm-label{font-size:13px;font-weight:500;line-height:32.5px;letter-spacing:1px;text-transform:uppercase;color:#fff}

/* alta conversão */
${S} .vm-benefits{padding:5em 0 0}
${S} .vm-ben-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px 20px;max-width:1280px;margin:0 auto;padding:10px 20px 16px}
${S} .vm-solid{display:flex;align-items:flex-start;gap:21px;padding:2em;border-radius:10px;background:var(--sb-card)}
${S} .vm-solid .vm-icon{width:49px;height:49px;color:var(--sb-accent)}
${S} .vm-solid-txt{flex:1}
${S} .vm-h4{margin:8px 0 7px}
${S} .vm-solid .vm-h4{margin-top:0}

/* bônus */
${S} .vm-bonus{padding:6em 0 7em}
${S} .vm-bonus-in{display:flex;align-items:center}
${S} .vm-bonus-text{display:flex;flex:0 0 50%;flex-direction:column;align-items:flex-start;gap:20px;padding:3em}
${S} .vm-bonus-list{flex:1;min-width:0;padding-left:18px}
${S} .vm-bcard{display:flex;align-items:flex-start;gap:14px;margin:0 0 20px;padding:1em}
${S} .vm-bcard .vm-3d{flex:none;width:83px;height:70px;object-position:left top}


/* garantia */
${S} .vm-guarantee{padding:7em 0 10em;background:linear-gradient(135deg,var(--vm-night) 0%,var(--vm-night2) 100%)}
${S} .vm-guar-in{max-width:720px}
${S} .vm-gbox{display:flex;flex-direction:column;align-items:center;gap:20px;padding:2em;text-align:center}
${S} .vm-gbox .vm-head{margin:0;padding:0}

/* depoimentos */
${S} .vm-testi{padding-bottom:3em}
${S} .vm-tcar{--si-pv:var(--si-d);position:relative;max-width:1260px;margin:0 auto;padding:0 20px}
${S} .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .si-car-view::-webkit-scrollbar{display:none}
${S} .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .si-slide{display:flex;flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S}.sb-js .si-car-view{overflow:hidden}
${S} .si-car-arrow,${S} .si-car-dots{display:none}
${S}.sb-js .vm-tcar:not(.is-static) .si-car-arrow{position:absolute;top:50%;z-index:2;display:flex;align-items:center;justify-content:center;width:42px;height:42px;margin-top:-21px;padding:0;border:0;background:none;color:var(--vm-glass);cursor:pointer;transition:color .3s}
${S}.sb-js .vm-tcar .si-car-arrow:hover{color:#fff}
${S} .vm-tcar .si-car-arrow.prev{left:-11px}
${S} .vm-tcar .si-car-arrow.next{right:-11px}
${S} .vm-tcar .si-car-arrow svg{width:42px;height:42px;fill:none;stroke:currentColor;stroke-width:1;stroke-linecap:round;stroke-linejoin:round}
${S} .vm-tslide{display:flex;flex-direction:column;justify-content:space-between;gap:25px;width:100%;margin:0;padding:2em;border:1px solid var(--vm-glass);border-radius:10px}
${S} .vm-quote{margin:0;font-family:var(--sb-font-heading);font-size:18px;font-style:italic;font-weight:500;line-height:1.4;text-align:center}
${S} .vm-who{display:flex;align-items:center;justify-content:center;gap:14px;min-height:56px}
${S} .vm-avatar{flex:none;width:50px;height:50px;border-radius:50%;object-fit:cover}
${S} .vm-who>span{display:flex;flex-direction:column;font-size:13px;line-height:1.5}
${S} .vm-name{font-weight:500;letter-spacing:1px;text-transform:uppercase;color:var(--sb-accent)}
${S} .vm-role{color:#fff}

@media (max-width:1024px){${tablet(S)}${S} .vm-tcar{--si-pv:var(--si-t)}}
@media (max-width:767px){${mobile(S)}${S} .vm-tcar{--si-pv:var(--si-m)}}
@media (prefers-reduced-motion:reduce){html:has(${S}){scroll-behavior:auto}${S} .vm-btn,${S} .vm-play{transition:none}}
${tablet(`${S}.sb-narrow`)}
${S}.sb-narrow .vm-tcar{--si-pv:var(--si-t)}
${mobile(`${S}.sb-narrow`)}
${S}.sb-narrow .vm-tcar{--si-pv:var(--si-m)}
`;
