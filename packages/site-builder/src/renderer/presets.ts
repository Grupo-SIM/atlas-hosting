/**
 * Variante `presets` (escopo `.sb-p7`): página de vendas "757 Presets" (757presets.centraldomarketing.com — WordPress +
 * Elementor + ElementsKit, modelo Canvas, post 3316). Medidas conferidas no site renderizado (Chromium, 1440/1024/390):
 * contêineres do Elementor com `padding: 10px` e `gap: 20px`, títulos `h2` do tema Twenty Twenty-Two
 * (`clamp(2.75rem, 6vw, 3.25rem)`), Montserrat/Roboto. Breakpoints 1024/767 repetidos sob `.sb-narrow` (no preview
 * estreito do editor o tablet e o celular valem os dois).
 *
 * Tokens do tema: `accent` (roxo `#6818B8`, fim do degradê dos botões), `bg` (`#080808`), `pink` (`#F83696`, destaque nos
 * títulos e no preço), `deep` (`#481888`, início do degradê), `glow` (`#280848`, sombra dos botões), `line` (`#5818A8`,
 * borda dos cartões), `panel` (fundo dos cartões, roxo 12%), `toggle` (`#8C3EDA`, perguntas do FAQ) e `blue` (`#2575FC`,
 * botão "Conferir").
 */
export const isPresets = (theme: Record<string, string>) =>
  theme.variant === "presets";

/** Fontes fixas da variante (nunca texto do usuário). */
export const PRESETS_EXTRA_FONTS = ["Montserrat", "Roboto", "Source Serif 4"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function presetsVars(theme: Record<string, string>) {
  return {
    "--p7-blue": safe(theme.blue, "#2575FC"),
    "--p7-deep": safe(theme.deep, "#481888"),
    "--p7-glow": safe(theme.glow, "#280848"),
    "--p7-line": safe(theme.line, "#5818A8"),
    "--p7-panel": safe(theme.panel, "#5818A81F"),
    "--p7-pink": safe(theme.pink, "#F83696"),
    "--p7-toggle": safe(theme.toggle, "#8C3EDA"),
  } as Record<string, string>;
}

const S = ".sb-p7";

/** Tablet (≤ 1024px). `x` = seletor da raiz (`.sb-p7` ou `.sb-p7.sb-narrow`). */
const tablet = (x: string) => `
${x} .p7-h{font-size:40px}
${x} .p7-sec{background-image:none}
${x} .p7-hero{min-height:var(--p7-h-t,var(--p7-h,0px))}
${x} .p7-hero-h{font-size:25px}
${x} .p7-hero-r .p7-c.w72{width:100%}
${x} .p7-hero-r .p7-c.w57{width:100%;margin:0 81px 81px;padding:0}
${x} .p7-btn.hero{margin-left:15px;padding:12px 2px;border-radius:7px;font-size:17px}
${x} .p7-cmp-sec .p7-c.w53{width:84%}
${x} .p7-cmp-sec .p7-t.lead{font-size:18px}
${x} .p7-c.w47{width:72%}
${x} .p7-about-row{width:98%}
${x} .p7-about-img{width:317px}
${x} .p7-about-txt{margin:18px 0}
${x} .p7-c.w45{width:74%}
${x} .p7-sec-txt{margin:18px 0}
${x} .p7-sc-row{width:100%}
${x} .p7-sc-t{margin:17px 0;font-size:17px}
${x} .p7-sc-d{margin:18px 0}
${x} .p7-how{width:100%;padding:0}
${x} .p7-how-t{margin:35px}
${x} .p7-how-img img{width:62%}
${x} .p7-proof-h{width:79%}
${x} .p7-proof-row,${x} .p7-ig-row,${x} .p7-ig-head{width:625px;max-width:100%}
${x} .p7-goals{width:100%;flex-direction:column}
${x} .p7-packs{width:96%}
${x} .p7-packs .p7-car-wrap{margin:40px}
${x} .p7-note-in{margin:35px}
${x} .p7-access{padding:0}
${x} .p7-access-in{padding:0}
${x} .p7-access-h{margin:0;padding:0;font-size:59px}
${x} .p7-cd.xl .p7-cd-n{font-size:45px}
${x} .p7-cd-box{width:72%}
${x} .p7-price-row{width:100%}
${x} .p7-offer{width:52%}
${x} .p7-offer-from{line-height:1em}
${x} .p7-title-xl{font-size:40px}
${x} .p7-btn.buy{margin:0;padding:19px 55px;font-size:16px}
${x} .p7-faq-wrap{padding-top:50px}
${x} .p7-faq-spacer{padding:0;height:50px}
`;

/** Celular (≤ 767px). */
const mobile = (x: string) => `
${x} .p7-h{font-size:25px}
${x} .p7-hero{min-height:var(--p7-h-m,var(--p7-h-t,var(--p7-h,0px)));background-image:var(--p7-bg-m,var(--p7-bg,none));background-position:center right}
${x} .p7-hero::before{opacity:1}
${x} .p7-hero-l{display:none}
${x} .p7-hero-r{width:100%;padding:0}
${x} .p7-hero-r .p7-c.w72{padding:20px 0 0;margin:50px 32px 250px;width:auto}
${x} .p7-hero-r .p7-c.w57{margin:0;padding:50px 0 37px}
${x} .p7-btn.hero{margin:0 0 -25px;padding:19px;font-size:18px}
${x} .p7-btn.cta{padding:19px;font-size:18px}
${x} .p7-cmp-sec .p7-c.w53,${x} .p7-cmp-sec .p7-c.w69{width:100%}
${x} .p7-cmp-sec .p7-t.lead{margin:-19px 0 39px;font-size:16px}
${x} .p7-cmp-row{flex-direction:column;align-items:stretch;width:100%}
${x} .p7-cmp-row>.p7-c{flex:0 0 auto;width:auto}
${x} .p7-c.w47,${x} .p7-c.w45,${x} .p7-c.w78{width:100%}
${x} .p7-c.sp{padding-top:40px}
${x} .p7-faq-wrap{width:100%;max-width:none}
${x} .p7-access{padding:0}
${x} .p7-about-row{flex-direction:column;width:100%}
${x} .p7-about-img{width:100%}
${x} .p7-about-txt{margin:35px 35px 17px;font-size:17px}
${x} .p7-sec-h{margin:19px 19px 0;font-size:28px}
${x} .p7-sec-txt{margin:17px 17px 17px 0;font-size:17px}
${x} .p7-sc-row{flex-direction:column;align-items:center;width:100%}
${x} .p7-sc-card{width:100%}
${x} .p7-sc-t{margin:20px 0 -1px;font-size:20px}
${x} .p7-sc-d{margin:17px 35px;font-size:17px}
${x} .p7-how-h{margin:0 0 -19px;font-size:30px}
${x} .p7-how-t{margin:35px;font-size:17px}
${x} .p7-how-img img{width:89%}
${x} .p7-proof-row,${x} .p7-ig-row,${x} .p7-ig-head{width:100%}
${x} .p7-proof-row{flex-direction:column;align-items:center}
${x} .p7-proof-row>.p7-c{width:100%}
${x} .p7-ig-row{flex-direction:column;align-items:center}
${x} .p7-ig-row>.p7-c{width:100%}
${x} .p7-ig-h{font-size:25px}
${x} .p7-goals-h{font-size:25px}
${x} .p7-goals{width:100%}
${x} .p7-goals-grp{flex-direction:column;width:100%}
${x} .p7-note-in{margin:35px;font-size:17px}
${x} .p7-access-h{font-size:42px}
${x} .p7-cd-box{width:100%}
${x} .p7-cd.xl .p7-cd-item{margin-inline:0}
${x} .p7-price-row{flex-direction:column-reverse;align-items:center;width:100%}
${x} .p7-offer,${x} .p7-card{width:100%}
${x} .p7-offer-title{font-size:30px}
${x} .p7-offer-from{line-height:1em}
${x} .p7-promo-h{font-size:25px}
${x} .p7-cd.sm{margin-top:-20px}
${x} .p7-faq-h{font-size:25px}
${x} .p7-faq-a{font-size:15px}
${x} .p7-foot-link{margin:27px;font-size:14px}
`;

const carousel = `
${S} .p7-car{position:relative;--si-pv:var(--si-d)}
${S} .p7-car .si-car{position:relative;padding:0 0 30px;--si-pv:var(--si-d)}
${S} .p7-car .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .p7-car .si-car-view::-webkit-scrollbar{display:none}
${S} .p7-car .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .p7-car .si-slide{flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S} .p7-car .si-slide img{display:block;width:100%;height:auto;margin-bottom:8px}
${S} .sb-js .p7-car .si-car-view{overflow:hidden}
${S} .p7-car .si-car-arrow,${S} .p7-car .si-car-dots{display:none}
${S} .sb-js .p7-car .si-car:not(.is-static) .si-car-arrow{position:absolute;top:calc(50% - 21px);z-index:2;display:flex;align-items:center;justify-content:center;width:42px;height:42px;padding:0;border:0;background:none;color:var(--sb-accent);cursor:pointer}
${S} .p7-car .si-car-arrow svg{width:42px;height:42px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
${S} .p7-car .si-car-arrow.prev{left:10px}
${S} .p7-car .si-car-arrow.next{right:10px}
${S} .sb-js .p7-car .si-car:not(.is-static) .si-car-dots{position:absolute;right:0;bottom:0;left:0;display:flex;justify-content:center;gap:8px;height:29px;align-items:center}
${S} .p7-car .si-car-dots button{width:6px;height:6px;padding:0;border:0;border-radius:50%;background:#000;opacity:.2;cursor:pointer}
${S} .p7-car .si-car-dots button.on{opacity:1}
`;

export const presetsCss = `
${S}{font-family:'Montserrat',sans-serif;font-size:18px;line-height:1.6;color:#fff;background:var(--sb-bg)}
${S} main{padding-top:0!important;background:var(--sb-bg)}
${S} p,${S} h1,${S} h2,${S} h3,${S} ul,${S} figure{margin:0;padding:0}
${S} img{max-width:100%;height:auto}
${S} a{color:inherit;text-decoration:none}
${S} .p7-sec{display:flex;flex-direction:column;align-items:center;gap:20px;box-sizing:border-box;width:100%;padding-top:20px;background:var(--sb-bg)}
${S} .p7-c{display:flex;flex-direction:column;gap:20px;box-sizing:border-box;min-width:0;padding:10px}
${S} .p7-row{display:flex;flex-direction:row;justify-content:center;gap:20px;box-sizing:border-box;width:100%;padding:0 10px}
${S} .p7-c.w47{width:47%}${S} .p7-c.w45{width:44.937%}${S} .p7-c.w53{width:53%}${S} .p7-c.w69{width:69%}${S} .p7-c.w78{width:78%}${S} .p7-c.w60{width:60%}
${S} .p7-c.sp{padding-top:80px}
${S} .p7-h{margin:0;font-family:'Montserrat',sans-serif;font-size:clamp(2.75rem,6vw,3.25rem);font-weight:700;line-height:1;color:#fff;text-align:center}
${S} .p7-t{margin:1em 0;font-family:'Montserrat',sans-serif;font-size:18px;font-weight:400;line-height:1.6;color:#fff;text-align:center}
${S} .p7-pk{color:var(--p7-pink)}
${S} .p7-red{color:#F60000}
${S} .p7-img{text-align:center}
${S} .p7-img img{display:inline-block;max-width:100%;vertical-align:middle}

/* brilho azul atrás de algumas seções (classe s01 do original) */
${S} .p7-glow{position:relative;isolation:isolate}
${S} .p7-glow::before{content:"";position:absolute;top:-10%;left:0;z-index:-2;width:100%;height:120%;background-image:radial-gradient(closest-side,#014d6e,transparent);pointer-events:none}

/* botões */
${S} .p7-btn-row{display:flex;justify-content:center}
${S} .p7-btn{display:inline-block;box-sizing:border-box;max-width:100%;padding:25px 80px;border-radius:13px;background:linear-gradient(199deg,var(--p7-deep) 0%,var(--sb-accent) 100%);box-shadow:6px 5px 7px 3px var(--p7-glow);color:#fff;font-family:'Montserrat',sans-serif;font-size:20px;font-weight:800;line-height:20px;text-align:center}
${S} .p7-btn.flat{background:none}
${S} .p7-btn.rb{font-family:'Roboto',sans-serif}
${S} .p7-btn.buy{font-size:16px;line-height:16px}

/* hero */
${S} .p7-hero{position:relative;display:flex;flex-direction:row;box-sizing:border-box;width:100%;min-height:var(--p7-h,0px);margin-bottom:-4px;padding:10px;background-color:var(--sb-bg);background-image:var(--p7-bg,none);background-position:var(--p7-pos,center center);background-repeat:no-repeat;background-size:cover}
${S} .p7-hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,#0000 64%,var(--sb-bg) 94%);opacity:.5}
${S} .p7-hero>*{position:relative}
${S} .p7-hero-l{width:50%;padding:10px}
${S} .p7-hero-r{display:flex;flex-direction:column;align-items:center;gap:20px;box-sizing:border-box;width:50%;padding:10px}
${S} .p7-hero-r .p7-c.w72{width:72%;padding-top:70px}
${S} .p7-hero-r .p7-c.w57{width:57%}
${S} .p7-hero-h{font-size:42px}

/* comparador antes/depois */
${S} .p7-cmp-sec{padding-top:29px}
${S} .p7-cmp-row{justify-content:center;width:100%;max-width:1160px;margin:0 auto;padding:10px}
${S} .p7-cmp-row>.p7-c{flex:1 1 0;width:auto}
${S} .p7-t.lead{font-size:25px;line-height:1.6}
${S} .p7-cmp{position:relative;overflow:hidden;box-sizing:content-box;border-radius:25px;cursor:ew-resize;touch-action:pan-y;user-select:none;-webkit-user-select:none;--p7-pos:50%}
${S} .p7-cmp>img{display:block;width:100%;height:auto;max-width:100%;-webkit-user-drag:none}
${S} .p7-cmp .p7-cmp-a{position:absolute;top:0;left:0;clip-path:inset(0 0 0 var(--p7-pos))}
${S} .p7-cmp-lab{position:absolute;top:0;width:100%;height:100%;opacity:0;pointer-events:none;transition:opacity .5s}
${S} .p7-cmp:hover .p7-cmp-lab{opacity:1}
${S} .p7-cmp.is-drag .p7-cmp-lab{opacity:0}
${S} .p7-cmp-lab::before{content:attr(data-t);position:absolute;top:50%;margin-top:-19px;padding:0 20px;border-radius:2px;background:rgba(255,255,255,.2);color:#fff;font-family:sans-serif;font-size:13px;letter-spacing:.1em;line-height:38px;text-transform:uppercase}
${S} .p7-cmp-lab.b::before{left:10px}
${S} .p7-cmp-lab.a::before{right:10px}
${S} .p7-cmp-h{position:absolute;top:50%;left:var(--p7-pos);z-index:40;box-sizing:content-box;width:40px;height:40px;margin:-22px 0 0 -22px;border:3px solid transparent;border-radius:1000px;background:#fff;transition:color .3s,background-color .3s}
${S} .p7-cmp-h::before,${S} .p7-cmp-h::after{content:" ";position:absolute;left:50%;z-index:30;display:block;width:3px;height:9999px;margin-left:-1.5px;background:#fff}
${S} .p7-cmp-h::before{bottom:50%;margin-bottom:22px}
${S} .p7-cmp-h::after{top:50%;margin-top:22px}
${S} .p7-cmp-h i{position:absolute;top:50%;width:0;height:0;margin-top:-6px;border:6px solid transparent}
${S} .p7-cmp-h i.l{left:50%;margin-left:-15px;border-right-color:#000}
${S} .p7-cmp-h i.r{right:50%;margin-right:-15px;border-left-color:#000}
${S} .p7-cmp-h:focus-visible{outline:2px solid var(--sb-accent);outline-offset:2px}

/* o que é + segredos + como funciona */
${S} .p7-about-row{display:flex;flex-direction:row;gap:20px;width:78%;padding:10px;box-sizing:border-box}
${S} .p7-about-img{flex:0 0 35.942%;box-sizing:border-box;padding:10px}
${S} .p7-about-txt{align-self:center;flex:1;min-width:0;margin:86px;font-size:18px}
${S} .p7-sec-txt{margin:18px 86px}
${S} .p7-sc-row{display:flex;flex-direction:row;justify-content:center;gap:20px;box-sizing:border-box;width:78%;padding:10px}
${S} .p7-sc-card{display:flex;flex-direction:column;gap:20px;box-sizing:border-box;flex:0 0 32%;width:32%;min-width:0;padding:10px}
${S} .p7-sc-t{margin:-13px 0;font-size:27px;font-weight:400;line-height:1.6;text-align:center}
${S} .p7-sc-t b,${S} .p7-sc-t strong{font-weight:700}
${S} .p7-sc-d{margin:1em 0}
${S} .p7-how{display:flex;flex-direction:column;gap:20px;box-sizing:border-box;width:47%;padding:10px}
${S} .p7-how-top{display:flex;flex-direction:column;gap:20px;padding:80px 10px 10px}
${S} .p7-how-img img{width:69%}
${S} .p7-how-t{margin:1em 0}

/* depoimentos + instagram */
${S} .p7-proof-rows{display:contents}
${S} .p7-proof-row{display:flex;flex-direction:row;justify-content:center;align-items:center;gap:20px;box-sizing:border-box;width:60%;padding:10px}
${S} .p7-proof-row>.p7-c{flex:1 1 0;width:auto;min-width:0}
${S} .p7-ig-head{box-sizing:border-box;width:60%;padding:10px}
${S} .p7-ig-h{font-size:30px}
${S} .p7-ig-row{display:flex;flex-direction:row;justify-content:center;gap:20px;box-sizing:border-box;width:60%;padding:10px}
${S} .p7-ig-row>.p7-c{flex:1 1 0;width:auto;min-width:0;padding:0}
${S} .p7-ig{display:flex;flex-direction:column;height:100%;transition:all .4s ease}
${S} .p7-ig-img{overflow:hidden}
${S} .p7-ig-img img{display:block;width:100%;transition:all .4s ease}
${S} .p7-ig:hover .p7-ig-img img{transform:scale(1.1)}
${S} .p7-ig-body{padding:55px 0}
${S} .p7-ig-in{padding:0 40px;border-left:3px solid var(--p7-blue)}
${S} .p7-ig-name{margin:0 0 20px;font-family:'Source Serif 4','Source Serif Pro',Georgia,serif;font-size:18px;font-weight:700;line-height:1.15;color:#fff;text-align:center}
${S} .p7-ig-foot{padding:0 40px;line-height:1;text-align:center}
${S} .p7-ig-btn{display:inline-flex;align-items:center;padding:15px 30px;border-radius:5px;background:var(--p7-blue);color:#F9F9F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1;transition:all .4s ease}
${S} .p7-ig-btn:hover{background:#0350d2}

/* para quem + pacotes */
${S} .p7-goals{display:flex;flex-direction:row;box-sizing:border-box;width:81%;padding:10px;gap:20px}
${S} .p7-goals-grp{display:flex;flex:1;flex-direction:row;gap:20px;box-sizing:border-box;padding:10px;min-width:0}
${S} .p7-goal{display:flex;flex:1;flex-direction:column;gap:20px;box-sizing:border-box;min-width:0;padding:10px;border:1px solid var(--p7-line);border-radius:21px;background:var(--p7-panel)}
${S} .p7-goal-ic{display:flex;justify-content:center;padding:10px;height:98px;box-sizing:border-box}
${S} .p7-goal-ic svg{width:auto;height:70px;fill:none;stroke:#fff;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
${S} .p7-goal-ic svg.solid{fill:#fff;stroke:none}
${S} .p7-goal.tight{padding-top:0}
${S} .p7-goal.tight .p7-goal-ic{height:88px;padding-bottom:0}
${S} .p7-goal.tight .p7-goal-body{margin:0 10px}
${S} .p7-goal-body{display:flex;flex-direction:column;gap:20px;padding:15px 15px 51px}
${S} .p7-goal-t{margin:0;font-size:21px;font-weight:800;line-height:1;text-align:center}
${S} .p7-goal-d{margin:0;font-size:19px;font-weight:400;line-height:1;text-align:center}
${S} .p7-packs{width:78%;padding-top:104px}
${S} .p7-car-wrap{width:100%}
${S} .p7-sec.p7-flush{padding-top:0;gap:0}
${S} .p7-note{display:block;box-sizing:border-box;width:100%;padding:10px}
${S} .p7-note-in{width:100%;max-width:1140px;margin:100px auto 50px;padding:0 100px;box-sizing:border-box;font-size:30px;line-height:1.6;color:#fff}
${S} .p7-note-in p{margin:1em 0;text-align:center}
${S} .p7-note-in ul{margin:1em 0;padding-left:40px}
${S} .p7-note-in li{text-align:left}

/* oferta */
${S} .p7-access{display:flex;flex-direction:row;box-sizing:border-box;width:100%;padding:56px 0 0;background:var(--sb-bg)}
${S} .p7-access-in{display:flex;flex-direction:column;justify-content:center;gap:20px;box-sizing:border-box;width:100%;padding:0 0 0 58px}
${S} .p7-access-h{margin:0;padding-top:45px;font-family:Arial,Helvetica,sans-serif;font-size:125px;font-weight:600;line-height:1;text-align:center;color:transparent;-webkit-text-stroke:2px #280858;text-shadow:-2px 14px 74px #280858}
${S} .p7-access-sub{margin:0;font-size:23px;font-weight:700;line-height:1;text-align:center}
${S} .p7-cd-box{display:flex;justify-content:center;align-self:center;width:60%;margin-top:-29px;padding:10px;box-sizing:border-box}
${S} .p7-cd{display:flex;justify-content:center;width:100%}
${S} .p7-cd-item{display:inline-block;padding:20px 5px;margin-inline:13px}
${S} .p7-cd-item:first-child{margin-left:0}
${S} .p7-cd-item:last-child{margin-right:0}
${S} .p7-cd-n{font-size:88px;font-weight:700;line-height:1;color:#fff}
${S} .p7-cd-l{font-size:25px;font-weight:400;line-height:1;color:#fff}
${S} .p7-cd.sm .p7-cd-item{margin-inline:0}
${S} .p7-cd.sm .p7-cd-n{font-size:40px}
${S} .p7-cd.sm .p7-cd-l{font-size:19px}
${S} .p7-price{display:flex;flex-direction:row;justify-content:center;box-sizing:border-box;width:100%;padding:71px 0 0;background:var(--sb-bg)}
${S} .p7-price-row{display:flex;flex-direction:row-reverse;justify-content:center;align-items:center;gap:20px;box-sizing:border-box;width:75%;padding:10px}
${S} .p7-card{display:flex;flex-direction:column;gap:20px;box-sizing:border-box;width:40%;padding:10px;border:1px solid var(--p7-line);border-radius:21px;background:var(--p7-panel)}
${S} .p7-card-top{padding:40px 10px 10px}
${S} .p7-offer-title{margin:0;font-size:clamp(2.75rem,6vw,3.25rem);font-weight:700;line-height:1;text-align:center}
${S} .p7-offer-mid{display:flex;flex-direction:column;gap:20px;padding:0 15px}
${S} .p7-offer-from{margin:25px 0;font-family:'Roboto',sans-serif;font-size:25px;font-weight:400;line-height:.1em;text-align:center;color:#fff}
${S} .p7-offer-from del{text-decoration:line-through}
${S} .p7-offer-price{margin:0;font-family:'Roboto',sans-serif;font-size:clamp(3.25rem,8vw,6.25rem);font-weight:600;line-height:1;text-align:center;color:var(--p7-pink)}
${S} .p7-checks{display:flex;flex-direction:column;align-items:center;margin:0;padding:20px 0;list-style:none}
${S} .p7-checks li{display:flex;align-items:center;font-family:'Roboto',sans-serif;font-size:18px;line-height:1.6;color:#fff}
${S} .p7-checks svg{flex:none;width:14px;height:14px;margin-right:5px;fill:#6EC1E4}
${S} .p7-offer-note{margin:0;font-size:19px;font-weight:400;line-height:1;text-align:center}
${S} .p7-card-btn{padding:30px 0 50px;order:99999;text-align:center}
${S} .p7-offer{display:flex;flex-direction:column;align-items:stretch;gap:20px;box-sizing:border-box;width:50.249%;padding:10px}
${S} .p7-promo{padding:10px}
${S} .p7-promo-h{font-size:clamp(2.75rem,6vw,3.25rem)}
${S} .p7-cb-wrap{align-self:center;box-sizing:border-box;width:74%;padding:10px}
${S} .p7-cb{display:flex;flex-direction:column;justify-content:center;gap:20px;box-sizing:border-box;min-height:75px;padding:10px;border:1px solid var(--p7-line);border-radius:21px;background:var(--p7-panel)}
${S} .p7-cb-t{margin:0;padding:22px 22px 3px;font-size:21px;font-weight:800;line-height:1;text-align:center}
${S} .p7-cb-d{margin:0;padding:2px 21px 21px;font-size:16px;font-weight:500;line-height:1;text-align:center}

/* perguntas frequentes */
${S} .p7-faq{display:flex;flex-direction:column;box-sizing:border-box;width:100%;padding:10px;background:var(--sb-bg)}
${S} .p7-faq-wrap{display:flex;flex-direction:column;align-items:stretch;align-self:center;gap:20px;box-sizing:border-box;width:82%;max-width:934.8px;margin-top:100px;padding:10px}
${S} .p7-faq-h{font-size:clamp(2.75rem,6vw,3.25rem)}
${S} .p7-faq-item{border-bottom:1px solid #D4D4D4}
${S} .p7-faq-item summary{display:flex;align-items:center;gap:0;padding:15px;color:var(--p7-toggle);font-family:'Montserrat',sans-serif;font-size:18px;font-weight:600;line-height:19px;cursor:pointer;list-style:none}
${S} .p7-faq-item summary::-webkit-details-marker{display:none}
${S} .p7-faq-item[open] summary{color:#fff}
${S} .p7-faq-ic{flex:none;display:inline-block;width:18px;height:18px;position:relative}
${S} .p7-faq-ic::before{content:"";position:absolute;top:3.5px;left:0;border:5.5px solid transparent;border-left:7px solid currentColor;border-right:0}
${S} .p7-faq-item[open] .p7-faq-ic::before{top:5.5px;left:-2px;border:5.5px solid transparent;border-bottom:7px solid currentColor;border-top:0}
${S} .p7-faq-a{padding:15px;color:#DADADA;font-family:Tahoma,'Segoe UI',sans-serif;font-size:16px;font-weight:200;line-height:1.6}
${S} .p7-faq-a p{margin:0}
${S} .p7-faq-spacer{box-sizing:border-box;width:100%;height:198px;padding-top:56px;background:var(--sb-bg)}

/* rodapé */
${S} .p7-foot{display:flex;flex-direction:column;justify-content:center;gap:20px;box-sizing:border-box;width:100%;min-height:108px;padding:10px;background:var(--sb-bg);color:#fff}
${S} .p7-foot-h{margin:0;padding-top:39px;font-family:'Montserrat',sans-serif;font-size:16px;font-weight:400;line-height:1;text-align:center}
${S} .p7-foot-in{display:flex;flex-direction:column;gap:20px;box-sizing:border-box;padding:10px}
${S} .p7-foot-note{max-width:1140px;margin:16px auto;font-size:16px;line-height:1.6;text-align:center}
${S} .p7-foot-link{max-width:1140px;margin:18px auto;font-family:'Roboto',sans-serif;font-weight:700;text-align:center;color:#F2F0F0}
${S} .p7-foot-link a{color:#fff}

/* página interna (política) */
${S} .p7-page{display:flex;flex-direction:column;align-items:center;gap:20px;box-sizing:border-box;width:100%;min-height:70vh;padding:100px 20px;background:var(--sb-bg)}
${S} .p7-page-in{width:100%;max-width:1140px}
${S} .p7-page h1{margin:0 0 20px;font-size:clamp(2.25rem,4vw,2.75rem);font-weight:700;line-height:1.2}
${S} .p7-page p{margin:0 0 20px;font-size:18px;line-height:1.6}
${S} .p7-page .p7-btn{margin-top:20px}

${carousel}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:1024px){${S} .p7-car .si-car{--si-pv:var(--si-t)}}
@media (max-width:767px){${mobile(S)}${S} .p7-car .si-car{--si-pv:var(--si-m)}}
${tablet(`${S}.sb-narrow`)}
${S}.sb-narrow .p7-car .si-car{--si-pv:var(--si-t)}
${mobile(`${S}.sb-narrow`)}
${S}.sb-narrow .p7-car .si-car{--si-pv:var(--si-m)}
@media (prefers-reduced-motion:reduce){${S} .p7-cmp-lab,${S} .p7-ig,${S} .p7-ig-img img{transition:none}}
`;
