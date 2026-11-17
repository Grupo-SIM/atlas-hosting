/**
 * Variante "sorveteria" (`theme.variant = "sorveteria"`, escopo `.sb-fr`): sorveteria, açaí e pizzaria em azul e
 * amarelo — cabeçalho fixo com logo maior que a barra, hero em slides coloridos (produto flutuando em 3D, fumaça na
 * pizza, onda listrada no pé), cartões de pedido por unidade com inclinação 3D, "Fale com a gente" com seletor de
 * unidade, rodapé com status de aberto/fechado e página de história com linha do tempo. Layout e medidas tirados do
 * CSS de um site real de sorveteria (CSS curto, lido inteiro; screenshots em 1440, 1024 e 390); **marca, textos,
 * fotos e contatos são próprios**. Breakpoints repetidos sob `.sb-narrow` (quadro estreito do editor = celular).
 *
 * Tokens do tema: `accent` = azul da marca `#0012FF`; extras `blueLight`, `blueDark`, `yellow`, `yellowDark`,
 * `yellowSoft`, `cyan`, `red`; `fg` = texto. Configurações lidas pelos blocos (não pelo CSS): `timezone` (fuso dos
 * horários de funcionamento) e `waMessage` (mensagem do WhatsApp).
 */
export const isSorveteria = (theme: Record<string, string>) =>
  theme.variant === "sorveteria";

/** Fontes fixas da variante (nunca texto do usuário). */
export const SORVETERIA_EXTRA_FONTS = ["Luckiest Guy", "Outfit"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function sorveteriaVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--fr-blue": safe(theme.accent, "#0012FF"),
    "--fr-blue-dark": safe(theme.blueDark, "#0008CC"),
    "--fr-blue-light": safe(theme.blueLight, "#3342FF"),
    "--fr-cyan": safe(theme.cyan, "#00E5FF"),
    "--fr-ink": safe(theme.fg, "#1A1A2E"),
    "--fr-page": safe(theme.bg, "#FFFFFF"),
    "--fr-red": safe(theme.red, "#E33E2B"),
    "--fr-yellow": safe(theme.yellow, "#FFED00"),
    "--fr-yellow-dark": safe(theme.yellowDark, "#E6D600"),
    "--fr-yellow-soft": safe(theme.yellowSoft, "#FFF9C4"),
  };
}

/**
 * Status de horário (roda no navegador, a cada minuto, no `fx-runtime`). Fica como texto puro (ES5, sem barras
 * invertidas) para ser a **mesma** função no site e no teste: o teste a avalia com `new Function`.
 * `frParts` lê dia da semana e minutos no **fuso configurado** (`Intl`), não no do aparelho nem em Brasília.
 * `frCalc`: aberto; "abre em X min" na última hora antes de abrir; fechado. Horário que passa da meia-noite
 * (`fecha <= abre`) vale também na madrugada do dia seguinte.
 */
export const FR_STATUS_JS = `function frParts(tz,ms){
var d=new Date(ms);
try{
var f=new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
var o={};
f.formatToParts(d).forEach(function(p){o[p.type]=p.value});
var wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];
return {d:wd,m:(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10)};
}catch(e){return {d:d.getDay(),m:d.getHours()*60+d.getMinutes()}}
}
function frCalc(days,o,c,dow,min){
function has(x){return days.indexOf((x+7)%7)>=0}
var over=c<=o,open;
if(!over)open=has(dow)&&min>=o&&min<c;
else open=(has(dow)&&min>=o)||(has(dow-1)&&min<c);
if(open)return {s:"open",n:0};
if(has(dow)&&min<o&&o-min<=60)return {s:"soon",n:o-min};
return {s:"closed",n:0};
}
function frStatusAt(spec,ms){var p=frParts(spec.tz,ms);return frCalc(spec.d,spec.o,spec.c,p.d,p.m)}`;

const S = ".sb-fr";
const N = `${S}.sb-narrow`;

/** Regras de uma faixa `max-width`, repetidas sob `.sb-narrow` (a media query não enxerga o quadro do editor). */
const upTo = (max: number, rules: (x: string) => string) =>
  `@media (max-width:${max}px){${rules(S)}}\n${rules(N)}`;

/* ───────── faixas de tela ───────── */

const w1200 = (x: string) => `
${x} .fr-word{font-size:88px}
${x} .fr-h2{font-size:40px}
`;

const w992 = (x: string) => `
${x} .fr-word{font-size:72px}
${x} .fr-sub{font-size:26px}
${x} .fr-card-title{font-size:32px}
${x} .fr-story-in{grid-template-columns:minmax(0,1fr);gap:48px}
${x} .fr-tl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .fr-tl-grid::before{display:none}
`;

const w768 = (x: string) => `
${x} .fr-bar{height:90px}
${x} .fr-nav{display:none}
${x} .fr-burger-btn{display:flex}
${x} .fr-full{display:flex}
${x} .fr-logo{width:130px;margin-top:25px}
${x} .fr-hero{height:75vh;min-height:480px}
${x} .fr-slide-in{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto;align-content:center;justify-items:center;gap:16px;padding:64px 24px 104px;text-align:center}
${x} .fr-slide-txt{display:contents}
${x} .fr-word{order:1;font-size:56px}
${x} .fr-sub{order:2;font-size:21px}
${x} .fr-prod{order:3}
${x} .fr-prod-img{max-height:40vh}
${x} .fr-cta{order:4}
${x} .fr-wave{height:60px}
${x} .fr-hero .si-car-dots{bottom:72px!important}
${x} .fr-prod{max-width:100%}
${x} .fr-prod-img{max-width:100%}
${x} .fr-hero .si-car-arrow{display:none!important}
${x} .fr-order{padding:48px 24px}
${x} .fr-h2{font-size:32px}
${x} .fr-grid{grid-template-columns:minmax(0,1fr)}
${x} .fr-grid>.fr-card:last-child:nth-child(odd){grid-column:auto}
${x} .fr-card{height:auto;min-height:280px}
${x} .fr-card-in{flex-direction:column;justify-content:center;gap:20px;padding:40px 24px;text-align:center}
${x} .fr-card-img{order:-1;flex:none;max-width:100%}
${x} .fr-card-img img{max-height:200px}
${x} .fr-c-club .fr-card-in{flex-direction:column}
${x} .fr-card-txt{align-items:center}
${x} .fr-card-btns{width:100%;max-width:340px}
${x} .fr-contact-title{font-size:32px}
${x} .fr-hh{padding:120px 24px 60px}
${x} .fr-hh-title{font-size:56px}
${x} .fr-hh-sub{font-size:20px}
${x} .fr-tl-grid{grid-template-columns:minmax(0,1fr);gap:48px}
${x} .fr-nf-title{font-size:48px}
`;

const w480 = (x: string) => `
${x} .fr-logo{width:110px;margin-top:0;margin-left:-15px}
${x} .fr-word{font-size:48px}
${x} .fr-sub{font-size:18px}
${x} .fr-prod-img{max-height:34vh}
${x} .fr-tl-title{font-size:40px;margin-bottom:40px}
${x} .fr-story-title{font-size:40px}
${x} .fr-card-title{font-size:29px}
${x} .fr-card-img img{max-height:170px}
`;

/* ───────── CSS ───────── */

export const sorveteriaCss = `
${S}{background:var(--fr-page);color:var(--fr-ink);font-family:'Outfit',sans-serif;font-size:16px;line-height:1.5}
${S} main{padding:0!important}
${S} h1,${S} h2,${S} h3{margin:0;font-weight:400;line-height:1.1;color:inherit}
${S} p{margin:0}
${S} ul,${S} ol{margin:0;padding:0;list-style:none}
${S} button,${S} select,${S} input{font-family:inherit}
${S} a{text-decoration:none}
${S} .fr-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .sb-block[id]{scroll-margin-top:90px}
${S} .sb-container{width:min(860px,100% - 48px);padding-block:20px}
${S} .sb-container h2{margin:28px 0 10px;font-family:'Luckiest Guy',cursive;font-size:32px;letter-spacing:1px;color:var(--fr-blue)}
${S} .sb-container p{margin:0 0 14px;font-size:17px;line-height:1.8}
${S} .fr-display{font-family:'Luckiest Guy',cursive;font-weight:400}

/* botões em pílula */
${S} .fr-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 26px;border:0;border-radius:50px;font:800 14px/1.3 'Outfit',sans-serif;letter-spacing:.5px;text-align:center;text-transform:uppercase;cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-btn:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 6px 20px #00000026}
${S} .fr-btn:active{transform:scale(.98)}
${S} .fr-btn svg{width:20px;height:20px;flex:none;fill:currentColor}
${S} .fr-btn-blue{background:var(--fr-blue);color:#fff}
${S} .fr-btn-yellow{background:var(--fr-yellow);color:var(--fr-blue)}
${S} .fr-btn-yellow:hover{background:var(--fr-yellow-dark)}
${S} .fr-btn-white{background:#fff;color:var(--fr-blue)}
${S} .fr-btn-wa{background:#25D366;color:#fff}
${S} .fr-btn-wa:hover{background:#1EBE5D}
${S} .fr-btn:focus-visible,${S} .fr-pill:focus-visible,${S} .fr-logo:focus-visible{outline:3px solid var(--fr-blue);outline-offset:3px}

/* cabeçalho (o bloco gruda no topo e sobrepõe o hero) */
${S}>.sb-block[data-block-type=frHeader]{position:sticky;top:var(--sb-sticky-top,0px);z-index:50;height:0}
${S} .fr-head{position:relative}
${S} .fr-bar{position:relative;z-index:2;height:90px;background:#fff;box-shadow:0 2px 20px #0000000F;transition:box-shadow .3s}
${S} .fr-bar.is-scrolled{box-shadow:0 4px 30px #0000001A}
${S} .fr-bar-in{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;max-width:1200px;height:100%;margin:0 auto;padding:0 32px}
${S} .fr-logo{display:block;flex:none;width:160px;margin-top:30px;filter:drop-shadow(0 3px 6px #00000026);transition:transform .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-logo:hover{transform:scale(1.08) rotate(-3deg)}
${S} .fr-logo img{display:block;width:100%;height:auto}
${S} .fr-nav{align-self:center}
${S} .fr-nav ul{display:flex;align-items:center;gap:16px}
${S} .fr-pill{display:inline-flex;align-items:center;padding:10px 26px;border-radius:50px;color:var(--fr-blue);font:800 14px/1.3 'Outfit',sans-serif;letter-spacing:.5px;text-transform:uppercase;transition:all .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-pill:hover{background:#0012FF14;transform:translateY(-2px)}
${S} .fr-pill[aria-current=page]{background:var(--fr-blue);color:#fff}
${S} .fr-pill.is-cta{background:var(--fr-yellow);color:var(--fr-blue)}
${S} .fr-pill.is-cta:hover{background:var(--fr-yellow-dark)}
${S} .fr-burger-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${S} .fr-burger-btn{display:none;align-items:center;justify-content:center;align-self:center;width:40px;height:40px;color:var(--fr-blue);cursor:pointer}
${S} .fr-burger-btn svg{width:32px;height:32px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
${S} #sb-burger:focus-visible~.fr-bar .fr-burger-btn{outline:3px solid var(--fr-blue);outline-offset:2px;border-radius:8px}
${S} .fr-full{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:#0012FFF2;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;visibility:hidden;transition:opacity .4s ease,visibility 0s .4s}
${S} .fr-full-bg{position:absolute;inset:0;cursor:pointer}
${S} .fr-full-x{position:absolute;top:20px;right:20px;z-index:2;display:flex;align-items:center;justify-content:center;width:40px;height:40px;color:#fff;cursor:pointer;transition:transform .3s}
${S} .fr-full-x:hover{transform:rotate(90deg)}
${S} .fr-full-x svg{width:40px;height:40px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
${S} .fr-full-in{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:24px;pointer-events:none}
${S} .fr-full-in>*{pointer-events:auto}
${S} .fr-full-logo{display:block;width:140px}
${S} .fr-full-logo img{display:block;width:100%;height:auto}
${S} .fr-full ul{display:flex;flex-direction:column;align-items:center;gap:24px}
${S} .fr-full .fr-pill{padding:16px 40px;background:#fff;font-size:19px}
${S} .fr-full .fr-pill[aria-current=page]{background:var(--fr-yellow);color:var(--fr-blue)}
${S} .fr-full .fr-pill.is-cta{background:var(--fr-yellow)}
${S} #sb-burger:checked~.fr-full{opacity:1;visibility:visible;transition:opacity .4s ease}
body:has(.sb-fr #sb-burger:checked){overflow:hidden}

/* hero em slides */
${S} .fr-hero{position:relative;height:calc(100vh - 90px);height:calc(100svh - 90px);min-height:600px;margin-top:90px;overflow:hidden;background:var(--fr-blue)}
${S} .fr-hero .si-car,${S} .fr-hero .si-car-view,${S} .fr-hero .si-car-track,${S} .fr-hero .si-slide{height:100%}
${S} .fr-hero .si-car{position:relative}
${S} .fr-slide{height:100%;background:var(--fr-grad);color:#fff}
${S} .fr-slide-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:48px;max-width:1300px;height:100%;margin:0 auto;padding:80px 64px 96px}
${S} .fr-slide-txt{display:flex;flex-direction:column;align-items:flex-start;gap:24px}
${S} .fr-word{font-family:'Luckiest Guy',cursive;font-size:112px;line-height:.9;letter-spacing:4px;color:#FFFFFFF2;text-shadow:0 6px 20px #00000014}
${S} .fr-sub{font-family:'Luckiest Guy',cursive;font-size:32px;line-height:1.2;color:#fff;text-shadow:2px 2px 0 #00000014}
${S} .fr-cta{display:inline-block;padding:19px 48px;border-radius:50px;background:var(--fr-cta-bg);color:var(--fr-cta-fg);font-family:'Luckiest Guy',cursive;font-size:24px;line-height:1.2;box-shadow:0 8px 25px #00000033;transition:all .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-cta:hover{transform:translateY(-3px) scale(1.05)}
${S} .fr-prod{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;perspective:800px}
${S} .fr-prod-img{display:block;max-width:min(100%,55vh);max-height:55vh;object-fit:contain;border-radius:36px;filter:drop-shadow(0 25px 35px #00000026)}
${S} .fr-smoke{position:absolute;left:50%;top:40%;width:0;height:0;pointer-events:none}
${S} .fr-smoke i{position:absolute;display:block;border-radius:50%;background:#FFFFFF66;filter:blur(18px);opacity:0}
${S} .fr-smoke i:nth-child(1){left:-60px;width:80px;height:80px}
${S} .fr-smoke i:nth-child(2){left:-20px;width:100px;height:100px}
${S} .fr-smoke i:nth-child(3){left:20px;width:60px;height:60px}
${S} .fr-smoke i:nth-child(4){left:-90px;width:70px;height:70px}
${S} .fr-smoke i:nth-child(5){left:50px;width:90px;height:90px}
${S} .fr-smoke i:nth-child(6){left:-40px;width:50px;height:50px}
${S} .fr-smoke i:nth-child(7){left:0;width:75px;height:75px}
${S} .fr-smoke i:nth-child(8){left:80px;width:60px;height:60px}
@media (prefers-reduced-motion:no-preference){
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-prod-img{animation:fr-pop .6s cubic-bezier(.34,1.56,.64,1) both,fr-float 4s ease-in-out .6s infinite}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(3n+1){animation:fr-smoke1 3.2s ease-out infinite}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(3n+2){animation:fr-smoke2 3.8s ease-out infinite}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(3n){animation:fr-smoke3 2.5s ease-out infinite}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(1){animation-delay:0s}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(2){animation-delay:.3s}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(3){animation-delay:.6s}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(4){animation-delay:.9s}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(5){animation-delay:1.2s}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(6){animation-delay:1.5s}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(7){animation-delay:1.8s}
${S}.sb-js .fr-hero:not(.is-edit) .si-slide.on .fr-smoke i:nth-child(8){animation-delay:2.1s}
}
@keyframes fr-pop{from{opacity:0;transform:scale(.85) translateY(20px) rotateY(15deg)}to{opacity:1;transform:none}}
@keyframes fr-float{0%{transform:translateY(0) rotateY(0) rotateX(0)}25%{transform:translateY(-12px) rotateY(5deg) rotateX(3deg)}50%{transform:translateY(0) rotateY(0) rotateX(0)}75%{transform:translateY(-8px) rotateY(-5deg) rotateX(-3deg)}100%{transform:translateY(0) rotateY(0) rotateX(0)}}
@keyframes fr-smoke1{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(-160px) scale(2)}}
@keyframes fr-smoke2{0%{opacity:0;transform:translateY(0) scale(.7)}20%{opacity:1}100%{opacity:0;transform:translateY(-200px) translateX(12px) scale(2)}}
@keyframes fr-smoke3{0%{opacity:0;transform:translateY(0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translateY(-180px) translateX(-10px) scale(2)}}
${S} .fr-hero .si-car-arrow,${S} .fr-hero .si-car-dots{display:none}
${S}.sb-js .fr-hero .si-car:not(.is-static) .si-car-arrow{position:absolute;top:calc(50% - 24px);z-index:3;display:flex;align-items:center;justify-content:center;width:48px;height:48px;padding:0;border:0;background:none;color:#fff;opacity:.7;cursor:pointer;transition:opacity .3s,transform .3s}
${S}.sb-js .fr-hero .si-car-arrow:hover,${S}.sb-js .fr-hero .si-car-arrow:focus-visible{opacity:1;transform:scale(1.15)}
${S} .fr-hero .si-car-arrow.prev{left:16px}
${S} .fr-hero .si-car-arrow.next{right:16px}
${S} .fr-hero .si-car-arrow svg{width:40px;height:40px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 2px 4px #00000033)}
${S}.sb-js .fr-hero .si-car:not(.is-static) .si-car-dots{position:absolute;left:0;right:0;bottom:8%;z-index:3;display:flex;align-items:center;justify-content:center;gap:10px}
${S} .fr-hero .si-car-dots button{width:10px;height:10px;padding:0;border:0;border-radius:5px;background:#fff;opacity:.4;cursor:pointer;transition:all .3s}
${S} .fr-hero .si-car-dots button.on{width:28px;opacity:1}
${S} .fr-wave{position:absolute;left:0;right:0;bottom:-1px;z-index:2;height:100px;pointer-events:none}
${S} .fr-wave svg{display:block;width:100%;height:100%;overflow:visible}

/* seções com título */
${S} .fr-h2{font-family:'Luckiest Guy',cursive;font-size:48px;letter-spacing:2px;color:var(--fr-blue)}
${S} .fr-lead{margin-top:8px;font-size:17.6px;font-weight:600;color:#666}

/* cartões de pedido */
${S} .fr-order{padding:80px 32px}
${S} .fr-order-in{max-width:1200px;margin:0 auto;text-align:center}
${S} .fr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;margin-top:48px;text-align:left}
${S} .fr-grid>.fr-card:last-child:nth-child(odd){grid-column:1/-1}
${S} .fr-card{position:relative;height:300px;overflow:hidden;border-radius:30px;background:var(--fr-card-bg);color:#fff;box-shadow:0 8px 30px #00000014;transition:box-shadow .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-card:hover{box-shadow:0 12px 40px #0000001F}
${S} .fr-card::before{content:"";position:absolute;inset:0;z-index:0;background:radial-gradient(circle at 0 0,#ffffff14,transparent 50%),radial-gradient(circle at 100% 100%,#ffffff0f,transparent 50%);pointer-events:none}
${S} .fr-c-blue{--fr-card-bg:linear-gradient(135deg,var(--fr-blue),var(--fr-blue-light))}
${S} .fr-c-cyan{--fr-card-bg:linear-gradient(135deg,var(--fr-cyan),#00B4D8)}
${S} .fr-c-yellow{--fr-card-bg:linear-gradient(135deg,var(--fr-yellow),var(--fr-yellow-dark));color:var(--fr-blue)}
${S} .fr-c-club{--fr-card-bg:radial-gradient(circle,#FFED00 0%,#FFB800 100%);color:var(--fr-blue)}
${S} .fr-c-insta{--fr-card-bg:linear-gradient(45deg,#F09433,#E6683C,#DC2743,#CC2366,#BC1888)}
${S} .fr-card-in{position:relative;z-index:1;display:flex;align-items:center;gap:24px;height:100%;padding:32px;transform-style:preserve-3d}
${S} .fr-card-img{flex:0 1 44%;display:flex;align-items:center;justify-content:center;min-width:0}
${S} .fr-card-img img{display:block;width:auto;max-width:100%;max-height:250px;border-radius:24px;object-fit:cover;filter:drop-shadow(0 10px 20px #00000026);scale:1;transition:scale .4s cubic-bezier(.4,0,.2,1)}
${S} .fr-card:hover .fr-card-img img{scale:1.05}
@media (prefers-reduced-motion:no-preference){
${S} .fr-card:nth-child(odd) .fr-card-img img{animation:fr-bob-slow 6s ease-in-out infinite}
${S} .fr-card:nth-child(even) .fr-card-img img{animation:fr-bob-fast 4s ease-in-out infinite}
}
@keyframes fr-bob-slow{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-15px) rotate(2deg)}}
@keyframes fr-bob-fast{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-20px) rotate(-2deg)}}
${S} .fr-card-txt{flex:1;display:flex;flex-direction:column;align-items:flex-start;min-width:0;transform:translateZ(30px)}
${S} .fr-card-title{margin-bottom:24px;font-family:'Luckiest Guy',cursive;font-size:48px;line-height:1.05;letter-spacing:1px}
${S} .fr-card-btns{display:flex;flex-direction:column;gap:10px;width:100%}
${S} .fr-card-btns .fr-btn{width:100%;font-size:13.6px}
${S} .fr-c-yellow .fr-btn-white,${S} .fr-c-yellow .fr-btn-blue{background:var(--fr-blue);color:#fff}
${S} .fr-c-club .fr-btn{background:var(--fr-blue);color:#fff}
${S} .fr-c-club .fr-card-in{flex-direction:row-reverse}
${S} .fr-c-insta .fr-btn-white{color:#BC1888}
${S} .fr-ig-ico{display:block;width:128px;height:128px;fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:round}
${S} .fr-card .fr-card-img svg.fr-ig-ico{filter:drop-shadow(0 10px 20px #00000026)}
${S} .fr-card .fr-sparkle{position:absolute}

/* Fale com a gente */
${S} .fr-contact{padding:64px 32px;background:linear-gradient(135deg,var(--fr-blue) 0%,var(--fr-blue-dark) 100%);color:#fff;text-align:center}
${S} .fr-contact-in{display:flex;flex-direction:column;align-items:center;gap:16px;max-width:600px;margin:0 auto}
${S} .fr-contact-ico{width:64px;height:64px;fill:#25D366}
${S} .fr-contact-title{font-family:'Luckiest Guy',cursive;font-size:40px;letter-spacing:1px;color:#fff}
${S} .fr-contact-text{font-size:17.6px;font-weight:600;color:#FFFFFFCC}
${S} .fr-pick{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;margin-top:8px}
${S} .fr-pick label{font-size:17.6px;font-weight:600;color:#fff}
${S} .fr-select{width:100%;max-width:400px;padding:15px 20px;border:2px solid transparent;border-radius:50px;background:#fff;color:var(--fr-blue);font-size:16px;font-weight:600;box-shadow:0 4px 15px #00000026;cursor:pointer;outline:0}
${S} .fr-select:focus{border-color:var(--fr-yellow)}
${S} .fr-select-wrap{display:flex}
${S} .fr-pick-btns{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%}
${S} .fr-wa{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;max-width:400px;padding:19px 32px;border-radius:50px;background:#25D366;color:#fff;font-family:'Luckiest Guy',cursive;font-size:22px;letter-spacing:.5px;transition:all .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-wa:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 8px 30px #25D36666}
${S} .fr-wa svg{width:26px;height:26px;fill:currentColor;flex:none}
${S}:not(.sb-js) .fr-select-wrap{display:none}
${S}.sb-js .fr-wa:not(.on){display:none}
${S} .fr-contact.is-edit .fr-select-wrap{display:flex}
${S} .fr-contact.is-edit .fr-wa{display:flex}
@media (prefers-reduced-motion:no-preference){${S}.sb-js .fr-wa.on{animation:fr-bob-slow 5s ease-in-out infinite}}
${S} .fr-contact-last{margin-top:12px;font-size:16px;color:#FFFFFFCC}
${S} .fr-contact-last a{color:var(--fr-yellow);text-decoration:underline;font-weight:800;transition:color .3s}
${S} .fr-contact-last a:hover{color:#fff}
${S} .fr-contact-last svg{display:inline-block;width:16px;height:16px;margin-left:4px;vertical-align:-2px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}

/* rodapé */
${S} .fr-foot{padding:64px 32px 16px;background:var(--fr-blue);color:#fff}
${S} .fr-foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:48px;max-width:1200px;margin:0 auto}
${S} .fr-foot-col h3{display:flex;align-items:center;gap:8px;margin-bottom:12px;font:800 19px/1.3 'Outfit',sans-serif;color:var(--fr-yellow)}
${S} .fr-foot-col h3 svg{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
${S} .fr-foot-addr{font-size:15px;opacity:.75}
${S} .fr-foot-line{height:1px;margin:14px 0;background:#FFFFFF1A}
${S} .fr-status{margin-bottom:4px;font-size:15px;font-weight:800}
${S} .fr-status:not([data-state]){display:none}
${S} .fr-status[data-state=open]{color:#4ADE80}
${S} .fr-status[data-state=soon]{color:#FFED00}
${S} .fr-status[data-state=closed]{color:#F87171}
@media (prefers-reduced-motion:no-preference){${S} .fr-status[data-state=soon]{animation:fr-blink 1.5s ease-in-out infinite}}
@keyframes fr-blink{0%,100%{opacity:1}50%{opacity:.45}}
${S} .fr-foot-hours{font-size:15px;opacity:.9}
${S} .fr-foot-links a,${S} .fr-foot-links span{display:block;padding:4px 0;font-size:15px;color:#fff;opacity:.85;transition:transform .3s,opacity .3s}
${S} .fr-foot-links a:hover{opacity:1;transform:translateX(4px)}
${S} .fr-socials{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
${S} .fr-socials a{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:#FFFFFF1A;color:#fff;transition:all .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-socials a:hover{background:var(--fr-yellow);color:var(--fr-blue);transform:translateY(-3px)}
${S} .fr-socials svg{width:20px;height:20px}
${S} .fr-copy{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 24px;max-width:1200px;margin:48px auto 0;padding-top:16px;border-top:1px solid #FFFFFF1A;font-size:13.6px;opacity:.6}
${S} .fr-copy a{color:#fff;text-decoration:underline}

/* Nossa História */
${S} .fr-hh{position:relative;padding:150px 32px 80px;background:linear-gradient(135deg,var(--fr-blue) 0%,var(--fr-blue-light) 100%);color:#fff;text-align:center}
${S} .fr-hh-title{font-family:'Luckiest Guy',cursive;font-size:72px;letter-spacing:2px;color:#fff}
${S} .fr-hh-sub{margin:12px auto 0;max-width:720px;font-size:24px;font-weight:600;opacity:.9}
${S} .fr-hh-wave{position:absolute;left:0;right:0;bottom:-1px;height:80px;pointer-events:none}
${S} .fr-hh-wave svg{display:block;width:100%;height:100%;overflow:visible}
${S} .fr-story{padding:0 32px}
${S} .fr-story-in{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:center;gap:64px;max-width:1200px;margin:64px auto}
${S} .fr-story-title{margin-bottom:24px;font-family:'Luckiest Guy',cursive;font-size:48px;line-height:1.1;color:var(--fr-blue)}
${S} .fr-story-txt p{margin-bottom:16px;font-size:17.6px;line-height:1.8}
${S} .fr-gal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
${S} .fr-gal figure{margin:0;overflow:hidden;border-radius:20px;box-shadow:0 10px 30px #0000001F;transition:transform .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-gal figure:hover{transform:translateY(-5px)}
${S} .fr-gal img{display:block;width:100%;height:100%;aspect-ratio:1;object-fit:cover}
${S} .fr-gal figure:first-child{grid-column:1/-1}
${S} .fr-gal figure:first-child img{aspect-ratio:2/1.2}
${S} .fr-tl{padding:96px 32px;background:var(--fr-yellow-soft);text-align:center}
${S} .fr-tl-title{margin-bottom:64px;font-family:'Luckiest Guy',cursive;font-size:56px;color:var(--fr-blue)}
${S} .fr-tl-grid{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px;max-width:1000px;margin:0 auto}
${S} .fr-tl-grid::before{content:"";position:absolute;top:40px;left:10%;right:10%;height:4px;background:var(--fr-blue)}
${S} .fr-tl-item{position:relative;display:flex;flex-direction:column;align-items:center;gap:20px}
${S} .fr-tl-year{display:flex;align-items:center;justify-content:center;width:80px;height:80px;border:4px solid var(--fr-yellow);border-radius:50%;background:#fff;color:var(--fr-blue);font-family:'Luckiest Guy',cursive;font-size:29px;box-shadow:0 6px 20px #0000001F;transition:all .3s cubic-bezier(.4,0,.2,1)}
${S} .fr-tl-item:hover .fr-tl-year{transform:scale(1.1) rotate(5deg);background:var(--fr-blue);color:#fff}
${S} .fr-tl-card{width:100%;padding:24px;border-radius:15px;background:#fff;box-shadow:0 8px 30px #00000014}
${S} .fr-tl-card h3{margin-bottom:8px;font:800 17.6px/1.3 'Outfit',sans-serif;color:var(--fr-blue)}
${S} .fr-tl-card p{font-size:15px;color:#64748B}

/* 404 */
${S} .fr-nf{position:relative;display:flex;align-items:center;justify-content:center;min-height:80vh;padding:150px 32px 120px;background:linear-gradient(135deg,var(--fr-blue) 0%,var(--fr-blue-light) 100%);color:#fff;text-align:center}
${S} .fr-nf-in{display:flex;flex-direction:column;align-items:center;gap:24px;max-width:640px}
${S} .fr-nf-title{font-family:'Luckiest Guy',cursive;font-size:72px;letter-spacing:2px;color:#fff}
${S} .fr-nf-text{font-size:20px;font-weight:600;opacity:.9}
${S} .fr-nf .fr-hh-wave{height:80px}

${upTo(1200, w1200)}
${upTo(992, w992)}
${upTo(768, w768)}
${upTo(480, w480)}
`;
