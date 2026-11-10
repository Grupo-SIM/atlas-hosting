/**
 * Variante `motorista` (escopo `.sb-cm`): medidas do motorista.simintermediacoes.com (Elementor + Astra +
 * Themesflat Addons). Breakpoints do original: tablet ≤ 1024, celular ≤ 767; no preview estreito do editor as
 * mesmas regras valem via `.sb-narrow`. Carrossel e depoimentos usam container query (`@container`), então o
 * canvas do editor mostra 4/2/1 e 3/2/1 por tela conforme a largura do quadro.
 */
export const isMotorista = (theme: Record<string, string>) =>
  theme.variant === "motorista";

/** Fontes fixas da variante: Lato (subtítulo e itens da tabela de preços) não está no tema. */
export const MOTORISTA_EXTRA_FONTS = ["Lato"] as const;

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: amarelo, escuro, painel cinza, cinza claro e cor dos subtítulos. `accent` é o azul. */
export function motoristaVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--cm-dark": safe(theme.dark, "#242424"),
    "--cm-panel": safe(theme.panel, "#EFEFEF"),
    "--cm-soft": safe(theme.soft, "#F5F5F5"),
    "--cm-title": safe(theme.title, "#363636"),
    "--cm-white": safe(theme.card, "#FFFFFF"),
    "--cm-yellow": safe(theme.yellow, "#E8B006"),
  };
}

const S = ".sb-cm";

const tablet = (x: string) => `
${x} .cm-wrap{padding-inline:1em}
${x} .cm-head-bar{padding:15px 0}
${x} .cm-nav-bar{padding:15px 0}
${x} .cm-hero{padding:150px 0}
${x} .cm-cta-text{margin-left:0}
${x} .cm-cta-act{justify-content:center;padding:0;text-align:center}
${x} .cm-cta-act .cm-btn{padding:15px 20px}
${x} .cm-carousel{padding:100px 0}
${x} .cm-dots{margin-top:55px}
${x} .cm-title-h{margin-left:0}
${x} .cm-title-sub{width:90%}
${x} .cm-title{padding-top:min(var(--cm-top,101px),50px)}
${x} .cm-lines{width:75%;margin-inline:auto}
${x} .cm-lines h2{font-size:36px;line-height:1em}
${x} .cm-ring{background-position:0 0;padding-bottom:20px}
${x} .cm-ring-col{gap:20px}
${x} .cm-chip{margin:0!important}
${x} .cm-ring-col.right>.cm-chip:nth-child(2){margin-left:-40px!important}
${x} .cm-ring-mid{margin:0 -82px 0 -23px}
${x} .cm-pillar-in{padding:0}
${x} .cm-pillar p{margin:0}
${x} .cm-plat{padding:20px 0 20px}
${x} .cm-plat-body{padding:0 1em}
${x} .cm-feat{margin:0}
${x} .cm-feat-icon{margin-right:10px}
${x} .cm-feats{row-gap:20px}
${x} .cm-plat-cta{margin:20px 0 0}
${x} .cm-video{padding:50px 0 30px}
${x} .cm-video-title{margin-top:15px}
${x} .cm-tri{padding:20px 0 30px}
${x} .cm-testi{padding-bottom:30px}
${x} .cm-testi-track{gap:10px}
${x} .cm-faq{padding:70px 0 30px}
`;

const mobile = (x: string) => `
${x} .cm-hero{padding:70px 0}
${x} .cm-hero h3{font-size:22px;line-height:1.2em}
${x} .cm-hero h1{font-size:33px;line-height:1em;margin-top:8px}
${x} .cm-hero-text{margin-top:12px;line-height:1.2em}
${x} .cm-hero-btn{margin:30px 0}
${x} .cm-cta{padding-bottom:30px}
${x} .cm-cta-icon{flex:0 0 25%}
${x} .cm-cta-text{flex:0 0 75%}
${x} .cm-cta-act{display:none}
${x} .cm-carousel{margin-top:-100px;padding:140px 0 0}
${x} .cm-dots{display:none}
${x} .cm-title-sub{width:100%}
${x} .cm-title.big .cm-title-h{font-size:40px;line-height:1em}
${x} .cm-lines{width:100%}
${x} .cm-lines h2{font-size:37px}
${x} .cm-ring{padding-bottom:50px}
${x} .cm-ring-in{flex-direction:column;align-items:center;text-align:center}
${x} .cm-ring-col,${x} .cm-ring-col.left,${x} .cm-ring-col.right{align-items:center;gap:20px;width:100%}
${x} .cm-ring-col.right>.cm-chip:nth-child(2){margin-left:0!important}
${x} .cm-chip{flex-direction:row!important;justify-content:center}
${x} .cm-ring-col.right .cm-chip{flex-direction:row-reverse!important}
${x} .cm-ring-mid{margin:0}
${x} .cm-pillars{grid-template-columns:1fr}
${x} .cm-pillar{padding-inline:20px}
${x} .cm-plat-in{flex-direction:column}
${x} .cm-plat-img,${x} .cm-plat-body{flex:none;width:100%}
${x} .cm-feats{grid-template-columns:1fr}
${x} .cm-feat{flex-direction:column}
${x} .cm-feat-icon{margin:0 0 10px;width:auto;max-width:90px}
${x} .cm-plat-cta{text-align:center}
${x} .cm-orn{grid-template-columns:40% 20% 40%}
${x} .cm-hide-m{display:none!important}
${x} .cm-price-in{padding:60px 20px}
${x} .cm-price-cols{flex-direction:column}
${x} .cm-plan-head{padding:35px 0 0}
${x} .cm-plan-price{padding:25px 0}
${x} .cm-plan-list{padding:35px 0 0}
${x} .cm-plan-foot{padding:35px 0}
${x} .cm-faq{padding:0 0 100px}
${x} .cm-foot{padding:0}
${x} .cm-foot-in{flex-wrap:wrap}
${x} .cm-foot-line{flex:0 0 100%;margin:5px 0;padding-block:10px}
${x} .cm-foot-text{flex:0 0 100%}
`;

export const motoristaCss = `
${S}{font-size:14px;line-height:28px;color:var(--sb-fg);background:var(--sb-bg)}
${S} p{margin:0}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5,${S} h6{margin:0;color:var(--sb-fg);font-family:var(--sb-font-heading)}
${S} main{padding-top:0!important}
${S} img{display:block;max-width:100%;height:auto}
${S} .cm-wrap{width:100%;max-width:1200px;margin-inline:auto}
${S} .cm-btn{display:inline-block;padding:14px 54px;border:1px solid #DEDEDE;border-radius:0;background:var(--cm-white);color:var(--cm-title);font-family:var(--sb-font-heading);font-size:16px;font-weight:700;line-height:1.5;text-align:center;cursor:pointer;transition:background-color .3s,color .3s,border-color .3s}
${S} .cm-btn:hover,${S} .cm-btn:focus{border-color:var(--sb-accent);background:var(--sb-accent);color:#fff}
${S} .cm-hide-m{display:block}

${S} .cm-head-bar{padding:32px 0 29px;background:var(--cm-white)}
${S} .cm-logo{display:block;width:100%;max-width:200px;margin-inline:auto}
${S} .cm-nav-bar{position:relative;padding:18px 0 16px;background-position:center;background-size:cover}
${S} .cm-nav-bar::before{content:"";position:absolute;inset:0;background:var(--cm-ov,#137BC0);opacity:var(--cm-ov-o,.9)}
${S} .cm-nav-in{position:relative;display:flex;flex-wrap:wrap;justify-content:center;gap:10px 20px}

${S} .cm-hero{position:relative;padding:230px 0 231px;background-color:#000;background-position:left top;background-repeat:no-repeat}
${S} .cm-hero::before{content:"";position:absolute;inset:0;background:var(--cm-ov,#000);opacity:var(--cm-ov-o,.5)}
${S} .cm-hero-in{position:relative;text-align:center}
${S} .cm-hero h3{color:var(--cm-yellow);font-size:30px;font-weight:500;line-height:24px;text-transform:uppercase}
${S} .cm-hero h1{color:#fff;font-size:70px;font-weight:600;line-height:1.2em;text-transform:uppercase}
${S} .cm-hero-text{max-width:800px;margin:-12px auto 0;color:#FFFFFFE3;font-size:19px;line-height:28px}
${S} .cm-hero-btn{margin-top:31px}
${S} .cm-hero-btn .cm-btn{padding:16px 54px 16px 51px;border:0}

${S} .cm-cta{position:relative;z-index:99;margin-top:-50px}
${S} .cm-cta-box{display:flex;align-items:stretch;background:var(--cm-white)}
${S} .cm-cta-icon{display:flex;flex:0 0 22%;align-items:center;justify-content:center;min-height:90px;padding-right:44px;background-position:center left;background-repeat:no-repeat}
${S} .cm-cta-icon svg{width:42px;height:42px;margin-top:4px;fill:#fff}
${S} .cm-cta-text{display:flex;flex:0 0 53%;align-items:center;justify-content:center;margin-left:35px;color:var(--sb-fg);font-size:21px;line-height:1.4;text-align:center}
${S} .cm-cta-act{display:flex;flex:1 1 0;align-items:center;justify-content:flex-end;padding:24px 26px 26px 0;text-align:right}
${S} .cm-cta-act .cm-btn{padding:17px 55px 15px 52px}

${S} .cm-carousel{container-type:inline-size;margin-top:-50px;padding:150px 0 170px;background:var(--cm-panel)}
${S} .cm-car-box{--cm-v:var(--cm-v-d,4);--cm-g:30px;position:relative}
${S} .cm-view{overflow:hidden}
${S} .cm-track{display:flex;gap:var(--cm-g);cursor:grab;touch-action:pan-y;will-change:transform}
${S} .cm-slide{flex:none;width:calc((100% - (var(--cm-v) - 1)*var(--cm-g))/var(--cm-v))}
${S} .cm-slide img{width:100%;user-select:none;-webkit-user-drag:none}
${S} .cm-dots{position:absolute;top:100%;left:0;right:0;display:flex;justify-content:center;margin-top:75px}
${S} .cm-dot{width:12px;height:12px;margin:0 5px;padding:0;border:0;border-radius:0;background:var(--cm-yellow);cursor:pointer;transition:background-color .3s}
${S} .cm-dot.on,${S} .cm-dot:hover{background:var(--sb-accent)}
@container (max-width:999px){${S} .cm-car-box{--cm-v:var(--cm-v-t,2)}}
@container (max-width:767px){${S} .cm-car-box{--cm-v:var(--cm-v-m,1)}}

${S} .cm-title{padding:var(--cm-top,101px) 0 0;text-align:center}
${S} .cm-title-h{margin:0 0 0 15px;font-size:36px;font-weight:700;line-height:1.2em}
${S} .cm-title.big .cm-title-h{font-size:60px}
${S} .cm-title-sub{width:65.856%;margin:10px auto 0;color:var(--cm-title);font-size:20px;font-weight:500;line-height:1.5}
${S} .cm-orn-img{margin:15px auto 0}
${S} .cm-lines{display:flex;align-items:center;gap:20px;padding-block:15px}
${S} .cm-lines::before,${S} .cm-lines::after{content:"";flex:1 1 20px;border-top:1px solid #E5E5E5}
${S} .cm-lines h2{flex:0 1 auto;font-size:36px;font-weight:700;line-height:24px;text-align:center}
${S} .cm-title.lines .cm-title-sub{margin-top:15px}

${S} .cm-ring{padding-bottom:78px;background-position:50.7% 77%;background-repeat:no-repeat}
${S} .cm-ring-in{display:flex;align-items:center}
${S} .cm-ring-col{display:flex;flex:1 1 0;flex-direction:column;justify-content:center;gap:137px;min-width:0}
${S} .cm-ring-col.left{align-items:flex-end}
${S} .cm-ring-col.right{align-items:flex-start}
${S} .cm-ring-col.right>.cm-chip:nth-child(2){margin-top:5px}
${S} .cm-ring-col.right>.cm-chip:nth-child(3){margin-top:-5px}
${S} .cm-ring-mid{flex:1 1 0;margin:0 -82px 0 -23px;min-width:0}
${S} .cm-ring-mid img{width:100%}
${S} .cm-chip{position:relative;z-index:1;display:flex;align-items:stretch}
${S} .cm-chip-label{padding:13px 30px;background:var(--cm-soft);color:var(--sb-fg);font-family:var(--sb-font-heading);font-size:18px;font-weight:700;line-height:24px;transition:background-color .3s,color .3s}
${S} .cm-chip-num{padding:14px 21px 12px 19px;background:var(--sb-muted);color:#fff;font-size:18px;font-weight:600;line-height:24px;transition:background-color .3s}
${S} .cm-chip-label:hover{background:var(--cm-dark);color:#fff}
${S} .cm-chip-num:hover{background:var(--cm-yellow)}

${S} .cm-pillars{display:grid;grid-template-columns:repeat(3,1fr)}
${S} .cm-pillar{position:relative;padding:80px 0 54px;background-position:center;background-size:cover;text-align:center}
${S} .cm-pillar::before{content:"";position:absolute;inset:0;background:var(--cm-ov);opacity:var(--cm-ov-o,.9)}
${S} .cm-pillar-in{position:relative;padding:29px 20px 20px 24px}
${S} .cm-pillar-icon{display:block;width:63px;height:60px;margin-inline:auto;object-fit:contain}
${S} .cm-pillar h3{margin:0 0 10px;color:#fff;font-size:30px;font-weight:400;line-height:1.167em;transition:color .3s}
${S} .cm-pillar h3:hover{color:var(--cm-hov,#fff)}
${S} .cm-pillar h3 a{color:inherit}
${S} .cm-pillar p{margin:16px 54px 0;color:#fff;line-height:24px}

${S} .cm-plat{padding:30px 0 77px}
${S} .cm-plat-in{display:flex;align-items:center}
${S} .cm-plat-img{flex:0 0 41%;min-width:0;margin:0 7px 0 22px}
${S} .cm-plat-img img{width:100%}
${S} .cm-plat-body{flex:1 1 0;min-width:0;padding:68px 7px 0 71px}
${S} .cm-feats{display:grid;grid-template-columns:1fr 1fr;row-gap:52px}
${S} .cm-feat{display:flex;margin:0 40px 0 10px}
${S} .cm-feat-icon{flex:0 0 30%;max-width:30%;margin-right:23px}
${S} .cm-feat-icon img{width:100%}
${S} .cm-feat h4{margin-bottom:10px;color:var(--sb-fg);font-size:18px;font-weight:700;line-height:1em}
${S} .cm-feat p{line-height:24px}
${S} .cm-plat-cta{margin:52px 0 0 84px}
${S} .cm-plat-cta .cm-btn{padding:17px 68px 15px 63px}

${S} .cm-video{padding:99px 0 0}
${S} .cm-orn{display:grid;grid-template-columns:46% 8% 45.664%;align-items:center}
${S} .cm-orn::before,${S} .cm-orn::after{content:"";display:block;border-top:1px solid #ECECEC;margin-block:18px}
${S} .cm-orn img{margin-inline:auto}
${S} .cm-video-title{margin-top:41px;font-size:36px;font-weight:700;line-height:1.2em;text-align:center}
${S} .cm-video-frame{position:relative;aspect-ratio:16/9;margin-top:20px;background:#000}
${S} .cm-video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}

${S} .cm-tri{padding:20px 0 74px}
${S} .cm-tri-in{display:flex;align-items:flex-start}
${S} .cm-tri-side{flex:0 0 20%;min-width:0;margin-top:61px}
${S} .cm-tri-side img{width:100%;filter:saturate(0%)}
${S} .cm-tri-side.l{margin-left:-6px}
${S} .cm-tri-side.r{flex-basis:19.666%}
${S} .cm-tri-mid{flex:0 0 60%;min-width:0;margin:0 -23px 0 0;text-align:center}
${S} .cm-tri-pic{position:relative;overflow:hidden}
${S} .cm-tri-pic img{width:100%}
${S} .cm-tri-pic::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:all .3s ease-in-out}
${S} .cm-tri-mid:hover .cm-tri-pic::after{opacity:1;visibility:visible}
${S} .cm-tri-cap{padding:20px;font-family:var(--sb-font-heading)}
${S} .cm-tri-cap h4{margin:0 0 10px;font-size:20px;font-weight:600}
${S} .cm-tri-cap a{color:#000;transition:color .3s ease-in-out}
${S} .cm-tri-cap a:hover{color:#3858E9}

${S} .cm-testi{container-type:inline-size;padding-bottom:77px}
${S} .cm-testi-box{position:relative;margin-top:20px;padding:40px 0 30px;border-radius:20px;background:var(--cm-dark)}
${S} .cm-testi-track{display:flex;gap:50px;width:calc(94% - 40px);margin-inline:auto;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .cm-testi-track::-webkit-scrollbar{display:none}
${S} .cm-t-card{flex:0 0 calc((100% - 2*50px)/3);min-width:0;color:#fff;scroll-snap-align:start}
${S} .cm-t-text{font-size:16px;line-height:1.7}
${S} .cm-t-foot{display:flex;align-items:center;gap:15px;margin-top:35px}
${S} .cm-t-foot img{flex:none;width:60px;height:60px;border-radius:50%;object-fit:cover}
${S} .cm-t-name{display:block;color:#fff;font-weight:700;line-height:1.4}
${S} .cm-t-role{display:block;color:#fff;line-height:1.4}
${S} .cm-testi-box .sb-cslider-nav button{position:absolute;top:calc(50% - 25px);width:20px;padding:0;border:0;background:none;color:#fff;font-size:30px;line-height:1;cursor:pointer}
${S} .cm-testi-box .sb-cslider-nav button:first-child{left:10px}
${S} .cm-testi-box .sb-cslider-nav button:last-child{right:10px}
${S} .cm-testi-dots{display:flex;justify-content:center;gap:10px;padding-top:30px}
${S} .cm-testi-dots button{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.4);cursor:pointer}
${S} .cm-testi-dots button.on{background:#fff}
${S} .cm-testi-orn{margin-top:20px}
${S} .cm-testi-orn img{margin-inline:auto}
@container (max-width:1024px){${S} .cm-t-card{flex-basis:calc((100% - 10px)/2)}}
@container (max-width:767px){${S} .cm-t-card{flex-basis:100%}}

${S} .cm-pricing{padding-top:0}
${S} .cm-price-area{position:relative}
${S} .cm-price-area::before{content:"";position:absolute;inset:0;background-image:var(--cm-ov-img,none);background-position:center top;background-repeat:no-repeat;opacity:.1}
${S} .cm-price-in{position:relative;max-width:796px;min-height:572px;margin-inline:auto;padding:60px 0}
${S} .cm-price-cols{display:flex;align-items:flex-start}
${S} .cm-plan-col{flex:1 1 0;min-width:0;padding:1em}
${S} .cm-plan{position:relative;border-radius:7px;background:#fff;box-shadow:20px -20px 80px rgba(0,0,0,.1);text-align:center}
${S} .cm-plan-top{border-radius:7px 7px 0 0;background:var(--cm-plan,#1896FE)}
${S} .cm-plan-head{padding:50px 60px 0}
${S} .cm-plan-head h3{color:#fff;font-family:var(--sb-font-accent);font-size:30px;font-weight:700;line-height:1.2}
${S} .cm-plan-head p{margin-top:6px;color:#fff;font-family:'Lato',sans-serif;font-size:20px;line-height:1.3}
${S} .cm-plan-price{display:flex;align-items:flex-start;justify-content:center;padding:40px 0 50px;color:#fff;font-family:var(--sb-font-accent);font-weight:300;line-height:1}
${S} .cm-plan-int{font-size:72px}
${S} .cm-plan-cur,${S} .cm-plan-dec{font-size:30px;line-height:1.1}
${S} .cm-plan-list{display:flex;flex-direction:column;gap:15px;margin:0;padding:50px 60px;list-style:none;text-align:left}
${S} .cm-plan-list li{display:flex;align-items:center;color:#000;font-family:'Lato',sans-serif;font-size:16px;line-height:22px}
${S} .cm-plan-list svg{flex:none;width:1.3em;height:1.3em;margin-right:10px;fill:var(--cm-plan,#1896FE)}
${S} .cm-plan-foot{padding:0 0 40px;border-radius:0 0 7px 7px}
${S} .cm-plan-foot .cm-btn{padding:14px 36px;border:0;border-radius:30px;background:#1896FE;color:#fff;font-family:var(--sb-font-accent);font-size:14px;font-weight:600}
${S} .cm-plan-foot .cm-btn:hover,${S} .cm-plan-foot .cm-btn:focus{background:var(--sb-accent);color:#fff}
${S} .cm-ribbon{position:absolute;top:0;right:0;z-index:1;width:150px;height:150px;overflow:hidden;transform:rotate(90deg);pointer-events:none}
${S} .cm-ribbon span{position:absolute;top:0;left:0;width:200%;margin-top:35px;background:#1896FE;color:#fff;font-family:var(--sb-font-accent);font-size:14px;line-height:2;text-align:center;text-transform:capitalize;transform:translateY(-50%) translateX(-50%) translateX(35px) rotate(-45deg)}

${S} .cm-faq{padding:100px 0}
${S} .cm-faq-list{margin-top:20px}
${S} .cm-faq-item{margin-top:-1px;interpolate-size:allow-keywords}
${S} .cm-faq-item::details-content{height:0;overflow:clip;transition:height .4s,content-visibility .4s allow-discrete}
${S} .cm-faq-item[open]::details-content{height:auto}
${S} .cm-faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:10px;border:1px solid #D5D8DC;color:#1F2124;font-size:1rem;font-weight:500;line-height:1.5;cursor:pointer;list-style:none}
${S} .cm-faq-item summary::-webkit-details-marker{display:none}
${S} .cm-faq-ic{display:flex;flex:none;width:15px;height:15px}
${S} .cm-faq-ic svg{width:15px;height:15px;fill:currentColor}
${S} .cm-faq-ic .minus,${S} .cm-faq-item[open] .cm-faq-ic .plus{display:none}
${S} .cm-faq-item[open] .cm-faq-ic .minus{display:block}
${S} .cm-faq-a{padding:10px;border:1px solid #D5D8DC;border-top:0;color:#1F2124;line-height:1.7}
${S} .cm-faq-gap{height:55px}

${S} .cm-foot{padding:30px 0;background:var(--cm-dark)}
${S} .cm-foot-in{display:flex;align-items:center}
${S} .cm-foot-line{flex:0 0 25%;padding-block:30px}
${S} .cm-foot-line::before{content:"";display:block;border-top:1px solid #363636}
${S} .cm-foot-text{flex:0 0 49.664%;color:#808080;font-size:14px;font-weight:500;line-height:24px;text-align:center}

${S} .cm-404{padding:100px 0;text-align:center}
${S} .cm-404 h1{font-size:48px;font-weight:700}
${S} .cm-404 p{margin:20px 0 30px;font-size:16px}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`.sb-narrow${S}`)}
${mobile(`.sb-narrow${S}`)}
`;
