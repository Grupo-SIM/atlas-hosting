/**
 * Variante "sim" (`theme.variant = "sim"`): site institucional escuro com roxo da SIM Intermediações, medido em
 * simintermediacoes.com (Astra + Elementor + ElementsKit). Tudo fica sob `.sb-si`, então as outras variantes não mudam.
 *
 * Breakpoints do original: tablet ≤ 1024 e celular ≤ 767 (a raiz do Astra encolhe para 91,2 % até 921 px, e as
 * medidas em `em` do Elementor acompanham). O preview estreito do editor (`.sb-narrow`) não enxerga media query,
 * então cada regra de tela pequena existe duas vezes. O menu lateral é um checkbox (`#sb-burger`), sem JS.
 */
export const isSim = (theme: Record<string, string>) => theme.variant === "sim";

export const SIM_EXTRA_FONTS = ["Poppins", "DM Sans"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: roxo translúcido (cartões, bordas), brancos translúcidos, verde dos checks e roxo do marketing. */
export function simVars(theme: Record<string, string>): Record<string, string> {
  return {
    "--si-green": safe(theme.green, "#41B84F"),
    "--si-lilac": safe(theme.lilac, "#8975C6"),
    "--si-p9": safe(theme.soft, "#8351F117"),
    "--si-p28": safe(theme.line, "#8351F147"),
    "--si-rose": safe(theme.rose, "#DCB8C0"),
    "--si-w11": "#FFFFFF1C",
    "--si-w14": "#FFFFFF24",
    "--si-w15": "#FFFFFF26",
    "--si-w28": "#FFFFFF47",
  };
}

const S = ".sb-si";

const tablet = (x: string) => `
${x}{font-size:14.592px}
${x} .si-head{padding:20px 30px 0}
${x} .si-head-in{padding:0}
${x} .si-logo{flex-basis:500px}
${x} .si-logo img{width:90%;height:139px}
${x} .si-nav{display:none}
${x} .si-burger{display:flex;font-size:27px}
${x} h1{font-size:3.5em;line-height:1.1em}
${x} h2{font-size:2.5em;line-height:1.2em}
${x} h4{font-size:1.3em;line-height:1.6em}
${x} .si-hero.home{padding:200px 30px 0}
${x} .si-hero.page{min-height:293px;padding:200px 30px 100px}
${x} .si-hero h1{padding:0}
${x} .si-orbit{padding:0 30px}
${x} .si-orbit-in{flex-wrap:wrap}
${x} .si-orbit-mid{display:none}
${x} .si-orbit-col{width:50%;padding:100px 0}
${x} .si-orbit-item,${x} .si-orbit-col.left .si-orbit-item{flex-direction:column;margin:0;text-align:center}
${x} .si-gt{padding:0 30px 120px}
${x} .si-gt h2{font-size:3.2em;line-height:1.6em}
${x} .si-about{padding:120px 30px 100px}
${x} .si-about-in{flex-direction:column}
${x} .si-about-text{width:100%;padding:0}
${x} .si-about-text h2{margin:0}
${x} .si-about-text>p{font-size:15px;margin-bottom:-18px}
${x} .si-link{font-size:1.2em}
${x} .si-about-photo{width:100%;height:283px;background-position:0 0}
${x} .si-feats{flex-direction:column}
${x} .si-divider{padding:3px 0}
${x} .si-sq{font-size:25px}
${x} .si-services{padding:70px 30px 120px}
${x} .si-services h2{padding:0 150px}
${x} .si-cards{grid-template-columns:minmax(0,1fr)}
${x} .si-card[data-on=tablet]{display:block}
${x} .si-card[data-on=notTablet]{display:none}
${x} .si-plan[data-on=tablet]{display:block}
${x} .si-plan[data-on=notTablet]{display:none}
${x} .si-cta{margin-top:-100px;margin-bottom:0}
${x} .si-testi-in{flex-direction:column}
${x} .si-testi-side{position:static;width:100%;padding:0}
${x} .si-plans{padding:120px 30px}
${x} .si-plans h2{padding:0 100px}
${x} .si-plan-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .si-faq{padding:120px 30px}
${x} .si-faq-list{padding:0 40px}
${x} .si-foot{padding:50px 30px 40px}
${x} .si-foot-in{flex-direction:column}
${x} .si-foot-logo{width:50%;padding:0}
${x} .si-foot-cols{flex-wrap:wrap}
${x} .si-team-in,${x} .si-feature-in{flex-direction:column}
${x} .si-team-card,${x} .si-team-text,${x} .si-feature-car,${x} .si-feature-text{width:100%;padding:0}
${x} .si-feature-decor{left:-377px;top:64px}
${x} .si-title h2{font-size:3em}
${x} .si-hero.page .si-hero-in{padding:0}
${x} .si-testi.cards .si-tcards{grid-template-columns:minmax(0,1fr)}
${x} .si-prose{padding:100px 30px}
`;

const mobile = (x: string) => `
${x} .si-head{padding:20px 20px 0}
${x} .si-logo{flex-basis:67%}
${x} .si-logo img{width:79%;height:auto;margin:0}
${x} .si-burger{font-size:24px}
${x} .si-drawer{width:50%;min-width:190px}
${x} h1{font-size:2.5em}
${x} h2{font-size:2em}
${x} .si-hero.home{padding:120px 20px 0}
${x} .si-hero.page{min-height:0;padding:200px 20px 100px}
${x} .si-badge{padding:10px 13px}
${x} .si-orbit{padding:100px 20px 50px}
${x} .si-orbit-col{width:100%;padding:0}
${x} .si-orbit-col.left{padding-bottom:20px}
${x} .si-gt{padding:0 20px 120px}
${x} .si-gt h2{font-size:2.6em;line-height:1em;margin-bottom:-70px}
${x} .si-about{padding:12px 12px 70px}
${x} .si-about-in{flex-direction:column-reverse}
${x} .si-about-text{padding:50px 0 0;text-align:center}
${x} .si-about-text>p{padding:0 10px}
${x} .si-about-text h2{font-size:2.6em}
${x} .si-about-photo{height:233px;margin-top:20px;background-position:0 0}
${x} .si-link{align-self:center;justify-content:center}
${x} .si-services{padding:70px 20px 120px}
${x} .si-services h2{padding:0}
${x} .si-card-head h4{max-width:50%}
${x} .si-card[data-on=tablet]{display:none}
${x} .si-card[data-on=notTablet]{display:block}
${x} .si-plan[data-on=tablet]{display:none}
${x} .si-plan[data-on=notTablet]{display:block}
${x} .si-plans{padding:120px 20px}
${x} .si-plans h2{padding:0}
${x} .si-plan-grid{grid-template-columns:minmax(0,1fr)}
${x} .si-faq{padding:120px 20px}
${x} .si-faq-list{padding:0}
${x} .si-foot{padding:50px 20px 40px}
${x} .si-foot-logo{width:69%;margin:0 auto}
${x} .si-fcol{width:100%;text-align:center}
${x} .si-fcol h4{font-size:25px}
${x} .si-fcontact li,${x} .si-socials{justify-content:center}
${x} .si-foot-end{flex-direction:column;align-items:center;text-align:center}
${x} .si-title h2{font-size:35px}
${x} .si-feature-decor{display:none}
${x} .si-grid{grid-template-columns:repeat(var(--si-c-m,2),minmax(0,1fr))}
${x} .si-car{--si-pv:var(--si-m)}
${x} .si-vidcar.tall .si-vid{height:auto}
${x} .si-team{padding:60px 20px}
${x} .si-prose{padding:100px 20px}
`;

export const simCss = `
${S}{font-size:16px;line-height:1.65;color:var(--sb-muted);background:var(--sb-bg)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5,${S} h6{margin:0;color:var(--sb-fg);font-family:var(--sb-font-heading);font-weight:400}
${S} h1{font-size:6.5em;line-height:100px}
${S} h2{font-size:4em;line-height:63px}
${S} h4{font-size:1.5em;line-height:29px}
${S} p{margin:0}
${S} hr{margin:0;border:0}
${S} img{max-width:100%}
${S} a:hover{color:inherit}
${S} .poppins{font-family:'Poppins',sans-serif!important;font-weight:400}
${S} .si-wrap{width:100%;max-width:1300px;margin:0 auto}
${S} .si-car{--si-pv:var(--si-d)}
${S} .grad{background-image:linear-gradient(107deg,var(--si-lilac) 0%,var(--si-rose) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}

/* botões (kit): pílula roxa que vira contorno branco; "outline" faz o inverso */
${S} .si-btn{display:inline-block;padding:16px 40px;border:1px solid var(--sb-accent);border-radius:50px;background:var(--sb-accent);color:#fff;font-size:16px;line-height:1.65;text-align:center;transition:all .3s}
${S} .si-btn:hover,${S} .si-btn:focus{border-color:#fff;background:transparent;color:#fff}
${S} .si-btn.outline{border-color:#fff;background:transparent}
${S} .si-btn.outline:hover,${S} .si-btn.outline:focus{border-color:var(--sb-accent);background:var(--sb-accent)}
${S} .si-divider{display:block;width:100%;height:0;margin:15px 0;border:0;border-top:1px solid var(--si-w15)}

/* ícone quadrado (borda + fundo que troca no hover) */
${S} .si-sq{display:inline-block;flex:none;margin-bottom:-5px;border:1px solid var(--si-w28);border-radius:10px;color:#fff;font-size:29px;font-style:normal;line-height:0}
${S} .si-sq svg{box-sizing:content-box;display:block;width:1em;height:1em;padding:.5em;border-radius:10px;background:var(--si-w11);transition:background-color .3s}
${S} .si-sq.on svg,${S} .si-sq:hover svg{background:var(--sb-accent)}
${S} .si-sq.on:hover svg{background:var(--si-w11)}

/* botão de vídeo pulsante (glow-ripple do ElementsKit) */
${S} .si-vbtn{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;color:#fff;background:transparent;font-size:15px}
${S} .si-vbtn i{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-style:normal}
${S} .si-vbtn svg{width:15px;height:15px;fill:currentColor;margin-left:2px}
${S} .si-glow::before,${S} .si-glow::after,${S} .si-glow i::after{content:" ";position:absolute;inset:0;border-radius:50%;color:var(--sb-accent);box-shadow:0 0 0 0 currentColor;opacity:.6;z-index:-1;animation:si-ripple 3s infinite}
${S} .si-glow::before{animation-delay:.9s}
${S} .si-glow::after{animation-delay:.3s}
${S} .si-vbtn:not(.si-glow){border:1px solid var(--si-w28)}
@keyframes si-ripple{70%{box-shadow:0 0 0 15px currentColor;opacity:0}100%{box-shadow:0 0 0 0 currentColor;opacity:0}}

/* cabeçalho: faixa transparente, logo grande com compensação, menu à direita; menu lateral abaixo de 1024px */
${S} .si-head{position:relative;z-index:1;padding:0}
${S} .si-head-in{display:flex;align-items:center;width:100%;max-width:1300px;margin:0 auto}
${S} .si-logo{display:block;flex:0 0 25%;margin:var(--si-logo-t) 0 var(--si-logo-b)}
${S} .si-logo img{display:block;width:100%;height:var(--si-logo-h);object-fit:contain;object-position:left center}
${S} .si-nav{flex:1;display:flex;justify-content:flex-end;margin-bottom:-10px}
${S} .si-menu{display:flex;gap:25px;margin:0;padding:0;list-style:none}
${S} .si-menu a{display:block;padding:17px 15px;color:#fff;font-family:var(--sb-font-heading);font-size:1.2em;line-height:1.65;transition:color .3s}
${S} .si-menu a:hover,${S} .si-menu a[aria-current=page],${S} .si-menu a:focus{color:var(--sb-accent)}
${S} .si-burger{display:none;margin-left:auto;align-items:center;justify-content:center;color:#fff;cursor:pointer}
${S} .si-burger svg,${S} .si-drawer-x svg{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
${S} .si-burger-input{position:absolute;opacity:0;pointer-events:none}
${S} .si-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .si-veil{position:fixed;inset:0;z-index:2147483629;display:block;background:rgba(0,0,0,.8);opacity:0;pointer-events:none;transition:opacity .5s}
${S} .si-drawer{position:fixed;top:0;left:0;z-index:2147483630;display:flex;flex-direction:column;gap:20px;width:400px;max-width:100vw;height:100vh;padding:20px;overflow:auto;background:#fff;box-shadow:2px 8px 23px 3px rgba(0,0,0,.2);transform:translateX(-100%);visibility:hidden;transition:transform .5s,visibility 0s linear .5s}
${S} .si-burger-input:checked~.si-veil{opacity:1;pointer-events:auto}
${S} .si-burger-input:checked~.si-drawer{transform:none;visibility:visible;transition:transform 1.5s,visibility 0s}
${S} .si-drawer-x{align-self:flex-end;color:#000;font-size:24px;cursor:pointer}
${S} .si-drawer-logo img{display:block;width:60%;height:auto;margin:-40px 0 -30px}
${S} .si-drawer-menu{margin:0;padding:0;list-style:none}
${S} .si-drawer-menu a{position:relative;display:block;padding:13px 20px;color:#000;font-family:var(--sb-font-body);font-size:1em}
${S} .si-drawer-menu a::after{content:"";position:absolute;left:20px;right:20px;bottom:6px;height:3px;background:var(--sb-accent);opacity:0;transition:opacity .3s}
${S} .si-drawer-menu a:hover::after,${S} .si-drawer-menu a[aria-current=page]::after{opacity:1}

/* hero */
${S} .si-hero{position:relative;overflow:hidden;background:var(--sb-bg);text-align:center}
${S} .si-hero::before,${S} .si-about::before,${S} .si-card::before,${S} .si-t::before,${S} .si-foot::before,${S} .si-plan.featured::before,${S} .si-team-card::before,${S} .si-plans::before{content:"";position:absolute;inset:0;pointer-events:none;background:var(--si-tex,none) center/cover no-repeat;opacity:var(--si-tex-o,0)}
${S} .si-hero::before{background-position:0 var(--si-tex-y,0)}
${S} .si-hero.home{padding:230px 0 30px}
${S} .si-hero.page{min-height:680px;padding:200px 0 120px;border-bottom:1px solid var(--si-p28)}
${S} .si-hero-in{position:relative;display:flex;flex-direction:column;align-items:center;max-width:1300px;margin:0 auto}
${S} .si-hero.page .si-hero-in{gap:20px}
${S} .si-hero h1{margin-top:20px;padding:0 100px}
${S} .si-badge{display:inline-flex;align-items:center;gap:13px;padding:5px 20px 5px 8px;border:1px solid var(--si-w14);border-radius:30px;background:var(--si-p9)}
${S} .si-badge i{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--sb-accent);color:#fff}
${S} .si-badge svg{width:17px;height:17px}
${S} .si-badge span{color:#fff;font-family:var(--sb-font-heading);font-size:1.5em;font-weight:300}
${S} .si-hero-row{display:flex;align-items:center;justify-content:center;gap:30px;margin-top:20px}

/* benefícios em arco */
${S} .si-orbit{padding:80px 0 0;background:radial-gradient(at center center,var(--sb-accent) 0%,var(--sb-bg) 65%);position:relative}
${S} .si-orbit::before{content:"";position:absolute;inset:0;background:var(--sb-bg);opacity:.66}
${S} .si-orbit-in{position:relative;display:flex;width:100%;max-width:1300px;margin:0 auto}
${S} .si-orbit-col{display:flex;flex-direction:column;justify-content:space-between;width:24.611%;padding:100px 0}
${S} .si-orbit-col.right{flex:1;padding-bottom:120px}
${S} .si-orbit-mid{display:flex;width:48.029%}
${S} .si-orbit-mid img{display:block;width:100%;height:auto}
${S} .si-orbit-item{display:flex;align-items:center;gap:15px;margin:0 calc(var(--si-off,0px)*-1) 0 var(--si-off,0px);padding:10px;border:1px solid var(--si-p28);border-radius:50px}
${S} .si-orbit-col.left .si-orbit-item{flex-direction:row-reverse;text-align:right}
${S} .si-orbit-item i{display:flex;flex:none;align-items:center;justify-content:center;width:54px;height:54px;border-radius:50%;background:var(--si-p28);color:#fff}
${S} .si-orbit-item svg{width:27px;height:27px}

/* título em degradê */
${S} .si-gt{padding:80px 0 120px;border-bottom:1px solid var(--si-p28);background:var(--sb-bg);text-align:center}
${S} .si-gt h2{margin:0 0 -45px;padding-top:30px;font-size:4.5em;font-weight:300;line-height:140px}
${S} .si-gt h2 span{background-image:linear-gradient(152deg,var(--sb-accent) 0%,var(--sb-muted) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}

/* somos especialistas */
${S} .si-about{position:relative;overflow:hidden;padding:0 0 70px;background:var(--sb-bg)}
${S} .si-about::before{opacity:var(--si-tex-o,0)}
${S} .si-about::after{content:"";position:absolute;inset:0;background:radial-gradient(at bottom center,var(--si-p28) 0%,var(--si-p9) 47%);pointer-events:none}
${S} .si-about-in{position:relative;z-index:1;display:flex;width:100%;max-width:1300px;margin:0 auto}
${S} .si-about-text{display:flex;flex:1;flex-direction:column;justify-content:center;padding:120px 50px 120px 0}
${S} .si-about-text h2{margin-bottom:30px;font-size:3.6em;line-height:63px}
${S} .si-about-text>p{font-size:19px}
${S} .si-link{display:inline-flex;align-items:center;gap:15px;margin:21px 0 0;align-self:flex-start;color:#fff;font-family:var(--sb-font-heading);font-size:1.3em}
${S} .si-link i{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--sb-accent);color:#fff}
${S} .si-link svg{width:20px;height:20px}
${S} .si-feats{display:flex;gap:20px}
${S} .si-feat{display:flex;flex:1;align-items:flex-end;gap:20px}
${S} .si-feat h4{font-size:1.5em}
${S} .si-about-photo{flex:0 0 48%;min-height:599px;margin:120px 0 120px 50px;border:1px solid #281949;border-radius:20px;background:var(--si-bg,none) var(--si-photo-x,0) 0/cover no-repeat,var(--si-p9)}
${S} .si-curve{position:absolute;left:0;bottom:-1px;z-index:2;display:block;width:100%;height:70px;transform:rotate(180deg);fill:var(--sb-bg)}

/* logos */
${S} .si-logos{padding:30px 0 80px;background:var(--sb-bg)}
${S} .si-logos-box{max-width:1300px;margin:0 auto;padding:30px}
${S} .si-logos .si-slide img{display:block;width:100%;height:auto;object-fit:contain}

/* serviços e cartões */
${S} .si-services{padding:70px 0 120px;border-bottom:1px solid var(--si-p28);background:var(--sb-bg)}
${S} .si-services h2{padding:0 350px;text-align:center}
${S} .si-cards{display:grid;grid-template-columns:repeat(var(--si-cols,2),minmax(0,1fr));gap:20px;margin-top:20px}
${S} .si-card[data-on=tablet],${S} .si-plan[data-on=tablet]{display:none}
${S} .si-card{position:relative;overflow:hidden;padding:30px;border:1px solid var(--si-p28);border-radius:20px;background:var(--si-p9)}
${S} .si-card::before{transition:opacity 2s;opacity:0}
${S} .si-card.tex::before{opacity:.15}
${S} .si-card:hover::before{opacity:var(--si-tex-o,.12)}
${S} .si-card>*{position:relative}
${S} .si-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
${S} .si-card-head h4{max-width:68%;margin-bottom:-7px}
${S} .si-card .si-divider{margin:10px 0}
${S} .si-card-actions{display:flex;align-items:center;gap:20px;margin-top:20px}
${S} .si-cta{display:flex;flex-direction:column;justify-content:center;min-height:var(--si-cta-h,120px);margin:var(--si-cta-t,0) 0 var(--si-cta-b,0);position:relative}
${S} .si-cta.center{align-items:center}
${S} .si-cta.left{align-items:flex-start;padding-left:20px}
${S} .si-cta.right{align-items:flex-end;padding-right:20px}

/* depoimentos */
${S} .si-testi{position:relative;padding:0 0 120px;background:var(--sb-bg)}
${S} .si-testi-in{display:flex;align-items:flex-start}
${S} .si-testi-side{position:sticky;top:calc(50px + var(--sb-sticky-top,0px));flex:0 0 40%;padding-right:50px}
${S} .si-testi-side h2{font-size:3.2em;margin-bottom:20px}
${S} .si-testi-side img{width:80%;height:auto}
${S} .si-tgrid{display:grid;flex:1;grid-template-columns:repeat(2,minmax(0,1fr))}
${S} .si-t{position:relative;margin:0;padding:40px;overflow:hidden;border:solid var(--si-w15);border-width:0 1px 0 1px;transition:background-color .3s}
${S} .si-t:nth-child(2){border-width:0 1px 1px 0}
${S} .si-t:nth-child(4){border-width:0 1px 0 0}
${S} .si-t:hover{background:var(--si-p9)}
${S} .si-t:hover::before{opacity:var(--si-tex-o,.23)}
${S} .si-t::before{opacity:0;transition:opacity .5s}
${S} .si-t>*{position:relative}
${S} .si-quote{position:absolute;right:30px;bottom:30px;width:21px;height:21px;fill:var(--si-w11);color:var(--si-w11)}
${S} .si-t blockquote{margin:0 0 20px}
${S} .si-t blockquote p+p{margin-top:10px}
${S} .si-t figcaption{display:flex;align-items:center;gap:15px}
${S} .si-t figcaption img{width:70px;height:70px;border-radius:50%;object-fit:cover}
${S} .si-t strong{display:block;color:#fff;font-family:var(--sb-font-heading);font-size:1.2em;font-weight:400}
${S} .si-t figcaption span{font-size:.9em}
${S} .si-stars{display:flex;gap:3px;margin-top:15px;color:#F0AD4E}
${S} .si-stars svg{width:16px;height:16px}
${S} .si-arrows{margin:0;padding:0;list-style:none}
${S} .si-arrows li{position:relative;margin:0 0 10px;padding-left:22px}
${S} .si-arrows li::before{content:"";position:absolute;left:0;top:.7em;width:12px;height:2px;background:var(--sb-accent)}
${S} .si-testi.cards{padding:120px 0;background:radial-gradient(at top center,var(--si-p28) 0%,transparent 100%),var(--sb-bg)}
${S} .si-testi.cards .si-wrap{padding:0 20px}
${S} .si-testi.cards h2{margin-bottom:40px;text-align:center;font-size:3.2em}
${S} .si-tcards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
${S} .si-testi.cards .si-t{padding:40px;border:1px solid var(--si-w14);border-radius:20px;background:var(--si-p9)}
${S} .si-testi.cards .si-t figcaption{margin-top:20px}
${S} .si-testi.slider{padding:80px 0}
${S} .si-testi.slider .si-testi-in{align-items:center;gap:40px}
${S} .si-testi.slider .si-testi-side{position:static;flex:0 0 40%}
${S} .si-testi.slider .si-testi-side h2{font-size:3.5em}
${S} .si-tcar{flex:1;min-width:0}
${S} .si-tcar .si-t{border:1px solid var(--si-w14);border-radius:20px;background:var(--si-p9)}

/* planos */
${S} .si-plans{position:relative;padding:120px 0;border-top:1px solid var(--si-p28);border-bottom:1px solid var(--si-p28);background:radial-gradient(at top center,var(--si-p28) 0%,transparent 100%),var(--sb-bg)}
${S} .si-plans::before{display:none}
${S} .si-plans h2{padding:0 300px;text-align:center}
${S} .si-plan-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:40px}
${S} .si-plan{position:relative;overflow:hidden;padding:50px 0;border:1px solid var(--si-w14);border-radius:20px;background:var(--si-p9)}
${S} .si-plan.featured{background:linear-gradient(180deg,var(--si-p28) 0%,var(--si-p9) 100%)}
${S} .si-plan.featured::before{opacity:.1;background-position:bottom center}
${S} .si-plan>*{position:relative}
${S} .si-plan header{padding:0 30px 30px;border-bottom:1px solid var(--si-w14)}
${S} .si-plan h4{color:#fff}
${S} .si-plan-body{padding:30px 30px 0}
${S} .si-plan-body .si-btn{display:block;width:100%}
${S} .si-checks{margin:10px 0 0;padding:0;list-style:none}
${S} .si-checks li{display:flex;gap:10px;margin:0 0 10px}
${S} .si-checks i{flex:none;color:var(--si-green)}
${S} .si-checks svg{display:block;width:18px;height:18px;margin-top:4px;fill:none;stroke:currentColor;stroke-width:2.6}

/* perguntas frequentes */
${S} .si-faq{padding:120px 0;background:var(--sb-bg)}
${S} .si-faq h2{text-align:center}
${S} .si-faq-list{margin-top:30px;padding:0 130px}
${S} .si-faq details{margin-bottom:10px;overflow:hidden;border:1px solid var(--si-p28);border-radius:20px;background:var(--si-p9)}
${S} .si-faq summary{display:flex;align-items:center;gap:15px;padding:25px 20px;border-top:1px solid var(--si-w14);border-bottom:1px solid var(--si-w14);color:#fff;font-family:var(--sb-font-heading);font-size:1.1em;cursor:pointer;list-style:none}
${S} .si-faq summary::-webkit-details-marker{display:none}
${S} .si-faq summary i{display:flex;color:currentColor}
${S} .si-faq summary svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.4}
${S} .si-faq details[open] summary{color:var(--sb-accent)}
${S} .si-faq details[open] summary .v{display:none}
${S} .si-faq-a{padding:25px 20px;animation:si-faq .3s ease}
${S} .si-faq-a p+p{margin-top:10px}
${S} .si-faq-a a{color:var(--sb-accent);text-decoration:underline}
@keyframes si-faq{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}

/* rodapé */
${S} .si-foot{position:relative;padding:120px 0 40px;border-top:1px solid var(--si-p28);background:var(--si-p9)}
${S} .si-foot>*{position:relative}
${S} .si-foot-in{display:flex;width:100%;max-width:1300px;margin:0 auto}
${S} .si-foot-logo{flex:0 0 26%;padding-right:50px}
${S} .si-foot-logo img{display:block;width:100%;height:auto}
${S} .si-foot-cols{display:flex;flex:1;gap:20px}
${S} .si-fcol{flex:1}
${S} .si-fcol h4{margin-bottom:15px}
${S} .si-flinks,${S} .si-fcontact{margin:0;padding:0;list-style:none}
${S} .si-flinks li{margin-bottom:7px}
${S} .si-flinks a,${S} .si-fcontact a{color:#fff;transition:color .3s}
${S} .si-flinks a:hover,${S} .si-fcontact a:hover{color:var(--sb-accent)}
${S} .si-fcontact li{display:flex;align-items:center;gap:10px;margin-bottom:10px}
${S} .si-fcontact i{color:var(--sb-accent)}
${S} .si-fcontact svg{display:block;width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2}
${S} .si-socials{display:flex;flex-wrap:wrap;gap:3px;margin-top:10px}
${S} .si-socials a{display:flex;align-items:center;justify-content:center;padding:10px;border-radius:50%;background:var(--sb-accent);color:#fff}
${S} .si-socials svg{width:16px;height:16px}
${S} .si-foot .si-divider{width:min(1300px,100%);margin:35px auto 20px}
${S} .si-foot-end{display:flex;justify-content:space-between;width:100%;max-width:1300px;margin:0 auto}

/* páginas internas */
${S} .si-team{padding:120px 20px;background:var(--sb-bg)}
${S} .si-team-in{display:flex;align-items:center}
${S} .si-team-card{position:relative;flex:0 0 40%;margin-right:50px;padding:30px;overflow:hidden;border:1px solid var(--si-p28);border-radius:20px;background:var(--si-p9)}
${S} .si-team-card::before{opacity:.34;background-position:bottom left}
${S} .si-team-card>*{position:relative}
${S} .si-member{text-align:center}
${S} .si-member-photo{position:relative;overflow:hidden;border-radius:20px}
${S} .si-member-photo img{display:block;width:100%;height:auto}
${S} .si-member-soc{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:center;gap:6px;padding:20px;background:linear-gradient(0deg,rgba(8,4,17,.85),transparent);opacity:0;transition:opacity .4s}
${S} .si-member-photo:hover .si-member-soc,${S} .si-member-photo:focus-within .si-member-soc{opacity:1}
${S} .si-member-soc a{display:flex;padding:10px;border-radius:50%;background:var(--sb-accent);color:#fff}
${S} .si-member-soc svg{width:16px;height:16px}
${S} .si-member h4{margin-top:20px}
${S} .si-team-text{flex:1}
${S} .si-team-text h2{margin-bottom:20px;font-size:50px;line-height:1.2}
${S} .si-team-lists{display:flex;gap:30px;margin:20px 0 30px}
${S} .si-team-lists .si-checks{flex:1}
${S} .si-title{margin-top:var(--si-mt,0);padding:0 20px;background:var(--sb-bg)}
${S} .si-title.center{text-align:center}
${S} .si-title h2{font-family:'DM Sans',sans-serif;font-size:3.5em;font-weight:600;line-height:1.1em;text-transform:capitalize}
${S} .si-title p{margin-top:15px}
${S} .si-carsec{padding:30px 20px;background:var(--sb-bg)}
${S} .si-carsec h3{margin-bottom:20px;text-align:center;font-size:2em}
${S} .si-carwrap{max-width:1300px;margin:0 auto}
${S} .si-feature{padding:80px 20px;background:var(--sb-bg)}
${S} .si-feature-in{position:relative;display:flex;align-items:center}
${S} .si-feature-car{flex:0 0 58.462%;margin-right:30px}
${S} .si-feature-text{flex:1;z-index:3}
${S} .si-feature-text h2{margin-bottom:15px;font-family:'DM Sans',sans-serif;font-size:3.5em;font-weight:600}
${S} .si-feature-text p{margin-bottom:12px}
${S} .si-feature-decor{position:absolute;left:-767px;top:10px;z-index:0;width:100%;pointer-events:none}
${S} .si-feature-decor img{width:77%;height:auto}
${S} .si-sites,${S} .si-socials-sec{padding:20px;background:var(--sb-bg)}
${S} .si-grid{display:grid;grid-template-columns:repeat(var(--si-c-d,5),minmax(0,1fr));gap:20px}
${S} .si-site{display:flex;align-items:center;gap:15px;padding:25px;border:1px solid var(--si-p28);border-radius:25px;background:var(--si-p9);transition:background-color .5s}
${S} .si-site:hover{background:var(--si-p28)}
${S} .si-site-logo{flex:0 0 25%}
${S} .si-site-logo img{display:block;width:100%;height:auto}
${S} .si-site h4{flex:1;font-size:1.2em;line-height:1.3}
${S} .si-round{display:flex;flex:none;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--sb-accent);color:#fff}
${S} .si-round svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2}
${S} .si-prof{padding:25px;text-align:center;border:1px solid var(--si-p28);border-radius:25px;background:var(--si-p9)}
${S} .si-prof img{display:block;width:100%;height:auto;margin:0 auto 15px;border-radius:20px}
${S} .si-prof .si-socials{justify-content:center}
${S} .si-prose{padding:200px 20px 120px;background:var(--sb-bg)}
${S} .si-prose-in{max-width:1000px;margin:0 auto}
${S} .si-prose h1{margin-bottom:30px;font-size:3.5em;line-height:1.1}
${S} .si-prose h3{margin:30px 0 10px;font-size:1.8em}
${S} .si-prose h4{margin:20px 0 10px}
${S} .si-prose p{margin-bottom:15px}
${S} .si-prose ul{margin:0 0 15px;padding-left:22px}
${S} .si-prose li{margin-bottom:6px}
${S} .si-prose a{color:var(--sb-accent);text-decoration:underline}
${S} .si-404{padding:260px 20px 160px;text-align:center;background:var(--sb-bg)}
${S} .si-404 h1{margin-bottom:20px;font-size:4em;line-height:1.1}
${S} .si-404 p{margin-bottom:30px}

/* carrossel (publicado: o fx-runtime liga autoplay, setas e bolinhas; sem JS é uma faixa rolável) */
${S} .si-car{position:relative}
${S} .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .si-car-view::-webkit-scrollbar{display:none}
${S} .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .si-slide{flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S} .si-slide img{display:block;width:100%;height:auto}
${S} .sb-js .si-car-view{overflow:hidden}
${S} .si-car-arrow,${S} .si-car-dots{display:none}
${S} .sb-js .si-car:not(.is-static) .si-car-arrow{position:absolute;top:calc(50% - 20px);z-index:2;display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:0;background:none;color:var(--si-lilac);cursor:pointer}
${S} .si-car-arrow svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
${S} .si-car.arrows-outside{padding:0 45px}
${S} .si-car-arrow.prev{left:0}
${S} .si-car-arrow.next{right:0}
${S} .si-car.arrows-inside .si-car-arrow{color:#fff;filter:drop-shadow(0 0 4px rgba(0,0,0,.6))}
${S} .si-car.arrows-inside .si-car-arrow.prev{left:10px}
${S} .si-car.arrows-inside .si-car-arrow.next{right:10px}
${S} .sb-js .si-car:not(.is-static) .si-car-dots{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-top:12px}
${S} .si-car-dots button{width:10px;height:10px;padding:0;border:0;border-radius:50%;background:#fff;cursor:pointer}
${S} .si-car-dots button.on{background:var(--si-lilac)}
${S} .si-imgcar .si-slide img{border-radius:20px}
${S} .si-vid{position:relative;display:block;overflow:hidden;border-radius:30px;background:#000}
${S} .si-vidcar.wide .si-vid{aspect-ratio:16/9}
${S} .si-vidcar.tall .si-vid{aspect-ratio:9/16;max-height:500px;margin:0 auto}
${S} .si-vid img{width:100%;height:100%;object-fit:cover}
${S} .si-vid-play{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#fff;background:rgba(0,0,0,.25);transition:background-color .3s}
${S} .si-vid:hover .si-vid-play{background:rgba(0,0,0,.5)}
${S} .si-vid-play svg{width:34px;height:34px;fill:currentColor}
${S} .si-vid-play b{font-size:13px;font-weight:500}

@media (max-width:1024px){${tablet(S)}${S} .si-car{--si-pv:var(--si-t)}${S} .si-grid{grid-template-columns:repeat(var(--si-c-t,3),minmax(0,1fr))}${S} .si-site{flex-direction:column;text-align:center}}
@media (max-width:921px){${S}{font-size:14.592px}}
@media (max-width:767px){${mobile(S)}}
@media (prefers-reduced-motion:reduce){${S} .si-glow::before,${S} .si-glow::after,${S} .si-glow i::after{animation:none}${S} .si-faq-a{animation:none}${S} .si-drawer{transition:none}}
${tablet(`${S}.sb-narrow`)}
${S}.sb-narrow .si-car{--si-pv:var(--si-t)}
${S}.sb-narrow .si-grid{grid-template-columns:repeat(var(--si-c-t,3),minmax(0,1fr))}
${mobile(`${S}.sb-narrow`)}
`;
