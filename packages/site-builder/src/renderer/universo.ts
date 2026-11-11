/**
 * Variante `universo` (escopo `.sb-uv`): hub de links em cartas, preto com vermelho neon. Mecânica, fluxo, medidas e
 * tempos vêm do olucasacre.marketingraiz.com (Next + Framer Motion, medido em 2026-11-11 no bundle e no CSS); a arte é
 * própria — aquele site recria a interface de um jogo de terceiros, então moldura, cartas, selo, fita, cronômetro e
 * ícones foram redesenhados ("portal / órbita"). Blocos em `blocks/universo.tsx`, movimento em `universo-runtime.ts`.
 *
 * Estados: sem `.uv-live` (sem JS, `prefers-reduced-motion`) o `uvStage` é uma lista estática — carrossel empilhado,
 * frente e verso de cada opção, sem carregamento, leque nem cronômetro. Com `.uv-live` (o runtime liga; no editor o
 * bloco liga sozinho com `.uv-still`) só a tela de `data-state` aparece. Tamanhos de texto ≥ 768 px por container query
 * (`container: uv`), então o canvas do editor e o preview estreito acertam sem repetir regras sob `.sb-narrow`.
 *
 * Tokens: `bg` (`--uv-bg`), `card` (`--uv-bg2`, interior da coluna), `accent` (`--uv-red`), `fg` (`--uv-ink`), `muted`
 * (`--uv-ink-dim`) e os extras `redBright`, `redDeep`, `redDim`, `redFaint`, `neon`.
 */
export const isUniverso = (theme: Record<string, string>) =>
  theme.variant === "universo";

/** Fontes fixas da variante (nunca texto do usuário). Oswald só tem 200–700 no Google: 800/900 caem no 700. */
export const UNIVERSO_EXTRA_FONTS = ["Oswald"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function universoVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--uv-bg": safe(theme.bg, "#050000"),
    "--uv-bg2": safe(theme.card, "#0a0505"),
    "--uv-ink": safe(theme.fg, "#efe7df"),
    "--uv-ink-dim": safe(theme.muted, "#b7ada6"),
    "--uv-neon": safe(theme.neon, "#ff0033"),
    "--uv-red": safe(theme.accent, "#e11d3a"),
    "--uv-red-bright": safe(theme.redBright, "#ff2c49"),
    "--uv-red-deep": safe(theme.redDeep, "#8e0f22"),
    "--uv-red-dim": safe(theme.redDim, "#e11d3a57"),
    "--uv-red-faint": safe(theme.redFaint, "#e11d3a29"),
  };
}

const S = ".sb-uv";

/** `color-mix` do vermelho do tema com transparência (os brilhos acompanham a cor escolhida). */
const red = (pct: number) =>
  `color-mix(in srgb,var(--uv-red) ${pct}%,transparent)`;

/** Granulado: tile SVG `feTurbulence` em tons de cinza (no lugar do canvas redesenhado a cada 2 quadros). */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

const PAGE_BG =
  "radial-gradient(130% 75% at 50% 6%,#3a0c12 0%,#210709 38%,#120406 68%,#080304 100%)";

/** Mola da referência (stiffness 300, damping 26 → ζ ≈ 0,75; a rotação, damping 30 → ζ ≈ 0,87). */
const SPRING = "cubic-bezier(.3,1.18,.5,1)";
const SPRING_ROT = "cubic-bezier(.3,1.04,.5,1)";

const LIVE = `${S} .uv-live`;
const STATIC = `${S} .uv-stage:not(.uv-live)`;

export const universoCss = `
${S}{background:var(--uv-bg);color:var(--uv-ink)}
${S} main{padding-top:0!important}
${S} .uv-stage,${S} .uv-page{position:relative;isolation:isolate;overflow:hidden;overflow:clip;container:uv/inline-size;font-family:var(--sb-font-heading);color:var(--uv-ink);-webkit-tap-highlight-color:transparent}
${S} .uv-stage *,${S} .uv-page *{box-sizing:border-box}
${S} .uv-stage{min-height:100dvh;background:var(--uv-bg)}
${S} .uv-live{height:100dvh;min-height:0}
${S} :where(.uv-stage,.uv-page) :where(p,h1,h2){margin:0}
${S} .uv-grain{position:absolute;inset:-60px;z-index:70;pointer-events:none;opacity:.12;mix-blend-mode:screen;background:${GRAIN} 0 0/200px 200px;animation:uv-grain .25s steps(1) infinite}
${S} .uv-page>.uv-grain{opacity:.07}
${S} .uv-vig{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 90% at 50% 38%,#0000 55%,#0000008c 100%)}
${S} .uv-still .uv-grain{animation:none}
@keyframes uv-grain{0%{transform:translate(0,0)}25%{transform:translate(-38px,22px)}50%{transform:translate(27px,-31px)}75%{transform:translate(-14px,-19px)}}

/* ── carregamento ── */
${S} .uv-loader{position:absolute;inset:0;z-index:50;display:none;background:var(--uv-bg);transition:opacity 1s ease}
${LIVE}[data-state=loader] .uv-loader{display:block}
${S} .uv-loader.is-out{opacity:0}
${S} .uv-loader-art{position:absolute;inset:0 0 25%;display:grid;place-items:center;overflow:hidden}
${S} .uv-loader-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:screen;filter:contrast(2) brightness(.9) saturate(4)}
@supports (-webkit-touch-callout:none){${S} .uv-loader-video{mix-blend-mode:normal;filter:brightness(.7);opacity:.92}${S} .uv-loader-art:has(.uv-loader-video)::after{content:"";position:absolute;inset:0;background:radial-gradient(closest-side,#0000 60%,var(--uv-bg))}}
${S} .uv-portal{width:min(82%,540px);height:auto;max-height:92%;color:var(--uv-red);overflow:visible;filter:drop-shadow(0 0 14px ${red(55)})}
${LIVE}[data-state=loader] .uv-portal{animation:uv-portal 2.5s cubic-bezier(.2,.7,.2,1) both}
${S} .uv-portal .uv-spin{animation:uv-spin 14s linear infinite}
${S} .uv-portal .uv-spin.s2{animation-duration:22s;animation-direction:reverse}
${S} .uv-portal .uv-spin.s3{animation-duration:34s}
${S} .uv-portal .uv-spin.s4{animation-duration:9s;animation-direction:reverse}
${S} .uv-portal .uv-flow{animation:uv-flow 3s linear infinite}
${S} .uv-portal .uv-core{fill:var(--uv-neon);animation:uv-core 1.6s ease-in-out infinite alternate}
${S} .uv-still .uv-portal *{animation:none!important}
${S} .uv-loader-fade{position:absolute;inset:0;background:linear-gradient(to bottom,#0000 35%,var(--uv-bg) 60%)}
${S} .uv-loader-txt{position:absolute;left:0;right:0;top:50%;z-index:2;padding:0 16px;text-align:center;transform:translateY(10%)}
${LIVE}:not(.uv-still)[data-state=loader] .uv-loader-in{animation:uv-rise 1s ease .6s both}
${S} .uv-loader-title{font-size:26px;font-weight:900;line-height:1.25;letter-spacing:.1em;color:var(--uv-neon);white-space:pre-line;text-shadow:0 0 12px color-mix(in srgb,var(--uv-neon) 90%,transparent),0 0 30px color-mix(in srgb,var(--uv-neon) 50%,transparent),0 0 60px color-mix(in srgb,var(--uv-neon) 30%,transparent)}
${S} .uv-loader-sub{margin-top:14px;font-size:10px;font-weight:700;letter-spacing:.22em;color:var(--uv-neon)}
${S} .uv-loader-sub b{font-weight:700;color:#f0e8e8}
@keyframes uv-portal{0%{transform:scale(.8);opacity:0}30%{opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes uv-spin{to{transform:rotate(360deg)}}
@keyframes uv-flow{to{stroke-dashoffset:-120}}
@keyframes uv-core{from{transform:scale(.88);opacity:.75}to{transform:scale(1.08);opacity:1}}
@keyframes uv-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

/* ── leque ── */
${S} .uv-fan{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;padding-top:32px}
${LIVE}[data-state=loader] .uv-fan{visibility:hidden}
${S} .uv-fan.is-enter{animation:uv-enter .8s ease-in-out .2s both}
${S} .uv-col{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;width:100%;max-width:448px;margin:0 auto}
${S} .uv-col-bg{position:absolute;inset:0;overflow:hidden;border:1.5px solid var(--uv-red);border-bottom:0;border-radius:50% 50% 0 0/130px 130px 0 0;background:var(--uv-bg2);box-shadow:0 0 30px ${red(60)},inset 0 0 20px ${red(20)}}
${S} .uv-col-bg::after{content:"";position:absolute;inset:6px 6px 0;border:1px solid var(--uv-red-dim);border-bottom:0;border-radius:50% 50% 0 0/124px 124px 0 0}
${S} .uv-orbits{position:absolute;inset:0;width:100%;height:100%;color:var(--uv-red-faint)}
${S} .uv-orbits .uv-star{fill:var(--uv-red);opacity:.75}
${S} .uv-label{position:absolute;top:0;left:50%;z-index:20;display:flex;align-items:center;gap:10px;height:30px;padding:0 14px;border-radius:999px;background:var(--uv-bg2);box-shadow:inset 0 0 0 1.5px var(--uv-red),0 0 15px ${red(60)};transform:translate(-50%,-50%)}
${S} .uv-label i{width:5px;height:5px;border-radius:50%;background:var(--uv-red);box-shadow:0 0 6px var(--uv-red)}
${S} .uv-label span{margin-right:-.2em;font-size:13px;font-weight:700;letter-spacing:.2em;color:var(--uv-red);text-transform:uppercase;transition:opacity .3s}
${S} .uv-fan.is-flip .uv-label span,${LIVE}[data-state=carousel] .uv-label span{opacity:0}
${S} .uv-copy{position:relative;z-index:10;flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;width:100%;max-width:380px;margin:0 auto;padding:40px 16px 0;text-align:center;transition:opacity .25s}
${S} .uv-fan.is-flip .uv-copy{opacity:0}
${S} .uv-copy-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:space-around;width:100%;margin:12px 0;padding:24px 8px}
${S} .uv-halo{position:absolute;inset:0;z-index:-1;border-radius:100px;background:radial-gradient(circle,color-mix(in srgb,var(--uv-bg) 95%,transparent) 0%,color-mix(in srgb,var(--uv-bg) 70%,transparent) 40%,transparent 80%);filter:blur(4px);transform:scale(1.1);pointer-events:none}
${S} .uv-title{font-size:20px;font-weight:700;line-height:1.6;letter-spacing:.15em;color:#fff;white-space:pre-line;filter:drop-shadow(0 0 10px #fff3)}
${S} .uv-lines{display:flex;flex-direction:column;align-items:center;padding:0 16px;font-size:12px;font-weight:700;line-height:2.2;letter-spacing:.25em;color:#fff;text-transform:uppercase}
${S} .uv-cta{display:flex;flex-direction:column;align-items:center;gap:12px;padding-bottom:6px}
${S} .uv-choose{font-size:12px;font-weight:700;line-height:1.625;letter-spacing:.2em;color:var(--uv-red);text-transform:uppercase}
${S} .uv-chev{width:14px;height:14px;color:var(--uv-red);animation:uv-bob 2s ease-in-out infinite}
${S} .uv-still .uv-chev{animation:none}
${S} .uv-w{display:inline-block}
${LIVE}:not(.uv-still) .uv-fan:not(.is-words) .uv-w{opacity:0}
${S} .uv-fan.is-words .uv-w{animation:uv-wt .8s both;animation-delay:var(--d)}
${S} .uv-fan.is-words .uv-choose .uv-w{animation-name:uv-wb;animation-duration:.7s}
@keyframes uv-wt{0%{filter:blur(10px);opacity:0;transform:translateY(-50px);animation-timing-function:ease-out}50%{filter:blur(5px);opacity:.5;transform:translateY(5px);animation-timing-function:ease-out}100%{filter:blur(0);opacity:1;transform:none}}
@keyframes uv-wb{0%{filter:blur(10px);opacity:0;transform:translateY(50px);animation-timing-function:ease-out}50%{filter:blur(5px);opacity:.5;transform:translateY(-5px);animation-timing-function:ease-out}100%{filter:blur(0);opacity:1;transform:none}}
@keyframes uv-bob{50%{transform:translateY(5px)}}
@keyframes uv-enter{from{opacity:0;transform:scale(1.05);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}
@container uv (min-width:768px){
${S} .uv-loader-title{font-size:38px}
${S} .uv-loader-sub{font-size:11px}
${S} .uv-title{font-size:24px}
${S} .uv-lines,${S} .uv-choose{font-size:13px}
}
@container uv (max-width:767px){${S} .uv-col{max-width:none}}

/* cartas do leque */
${S} .uv-cards{position:relative;z-index:30;flex:none;height:340px;margin-top:auto}
${S} .uv-card{--x:0px;--y:60px;--r:0deg;--s:1;--fd:.12s;position:absolute;left:50%;bottom:-20px;z-index:30;width:260px;margin:0 0 0 -130px;padding:0;border:0;background:none;aspect-ratio:2/3;font:inherit;color:#8c2a37;cursor:pointer;transform-origin:50% 100%;translate:var(--x) var(--y);rotate:var(--r);scale:var(--s);perspective:1000px;filter:drop-shadow(0 0 20px #000e);transition:translate .55s ${SPRING},rotate .5s ${SPRING_ROT},scale .2s ease,color .2s,filter .2s;-webkit-tap-highlight-color:transparent}
${S} .uv-card[data-pos=l]{--x:-150px;--y:180px;--r:-12deg;--fd:0s;z-index:20}
${S} .uv-card[data-pos=r]{--x:150px;--y:180px;--r:12deg;--fd:.24s;z-index:20}
${S} .uv-card:focus-visible{outline:2px solid var(--uv-red-bright);outline-offset:4px}
@media (hover:hover){
${LIVE} .uv-fan:not(.is-flip) .uv-cards.is-in .uv-card:not(.is-sel):hover{--y:30px;--s:1.05;z-index:40;color:#c23a4c;filter:drop-shadow(0 0 20px #000e) drop-shadow(0 0 14px ${red(35)})}
${LIVE} .uv-fan:not(.is-flip) .uv-cards.is-in .uv-card:not(.is-sel):not([data-pos=c]):hover{--y:120px;--r:0deg}
}
${S} .uv-cards.is-in .uv-card.is-sel{--y:-20px;--s:1.08;z-index:50;color:#c23a4c;filter:drop-shadow(0 0 20px #000e) drop-shadow(0 0 16px ${red(45)})}
${S} .uv-cards.is-in .uv-card.is-sel:not([data-pos=c]){--y:110px;--r:0deg}
${LIVE}:not(.uv-still) .uv-cards:not(.is-in) .uv-card{--y:300px}
${S} .uv-fan.is-flip .uv-card{--x:0px!important;--y:-180px!important;--r:0deg!important;--s:.8!important;transition:translate .4s ease-out var(--fd),rotate .3s ease var(--fd),scale .3s ease var(--fd)}
${S} .uv-card-in{position:absolute;inset:0;display:block;transform-style:preserve-3d;transition:transform .45s ease}
${S} .uv-fan.is-flip .uv-card-in{transform:rotateY(180deg);transition-delay:calc(var(--fd) + .25s)}
${S} .uv-card-a,${S} .uv-card-b{position:absolute;inset:0;display:block;overflow:hidden;border-radius:12px;background:radial-gradient(120% 80% at 50% 32%,#4a0f18 0%,#220709 55%,#120406 100%);backface-visibility:hidden;-webkit-backface-visibility:hidden}
${S} .uv-card-b{transform:rotateY(180deg)}
${S} .uv-card-art{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
${S} .uv-card-art .f{fill:currentColor}
${S} .uv-card-art .p{fill:#1b0609}
${S} .uv-card-num{position:absolute;top:11.33%;left:50%;font-size:19px;font-weight:700;line-height:1;color:var(--uv-ink-dim);transform:translate(-50%,-50%);transition:color .2s,text-shadow .2s}
${S} .uv-card:hover .uv-card-num,${S} .uv-card.is-sel .uv-card-num{color:#fff;text-shadow:0 0 10px #fff9}

/* ── carrossel ── */
${S} .uv-car{position:absolute;inset:0;z-index:40;display:none;flex-direction:column;background:var(--uv-bg)}
${LIVE}[data-state=carousel] .uv-car{display:flex;animation:uv-fade .3s ease .1s both}
${S} .uv-still .uv-car{animation:none!important}
${S} .uv-car:focus{outline:0}
${S} .uv-car-stage{position:relative;z-index:3;flex:1;min-height:0;display:flex;flex-direction:column;width:100%;max-width:414px;margin:0 auto;padding:0 22px}
${S} .uv-timer{display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:30px}
${S} .uv-timer-pill{position:relative;display:grid;place-items:center;width:230px;height:44px;border-radius:999px;background:linear-gradient(#1a0f11,#100a0b);box-shadow:inset 0 0 0 1.5px var(--uv-red),0 0 16px ${red(25)}}
${S} .uv-timer-pill::before{content:"";position:absolute;inset:4px;border-radius:999px;box-shadow:inset 0 0 0 1px var(--uv-red-dim)}
${S} .uv-timer-t{position:relative;font-size:23px;font-weight:700;letter-spacing:2px;color:#fff;font-variant-numeric:tabular-nums;text-shadow:0 0 10px #ff284659}
${S} .uv-timer-bar{width:190px;height:2px;overflow:hidden;border-radius:2px;background:var(--uv-red-faint)}
${S} .uv-timer-bar i{display:block;height:100%;background:var(--uv-red);box-shadow:0 0 8px var(--uv-red);transform:scaleX(var(--uv-p,1));transform-origin:left;transition:transform 1s linear}
${S} .uv-stage[data-timer="0"] .uv-timer,${STATIC} .uv-timer{display:none}
${S} .uv-heading{margin:42px 0 26px;text-align:center;font-size:25px;font-weight:800;letter-spacing:2.5px;color:var(--uv-red);text-transform:uppercase;text-shadow:0 0 18px ${red(30)}}
${S} .uv-view{position:relative;flex:1;min-height:0;overflow:hidden;touch-action:pan-y;container-type:size}
${S} .uv-track{display:flex;height:100%;transition:transform .42s cubic-bezier(.22,1,.36,1);will-change:transform}
${S} .uv-slide{flex:0 0 100%;min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:0 2px}
${S} .uv-opt{position:relative;width:min(100%,calc((100cqh - 24px) * 300 / 392));aspect-ratio:300/392;perspective:1200px}
${S} .uv-face{position:absolute;inset:0;border-radius:16px;background:linear-gradient(#150c0e,#0b0708);box-shadow:inset 0 0 0 1.5px var(--uv-red),0 0 24px ${red(18)}}
${S} .uv-face::before{content:"";position:absolute;inset:6px;border-radius:11px;box-shadow:inset 0 0 0 1px var(--uv-red-dim);pointer-events:none}
${S} .uv-opt:not(.is-back) .uv-verso,${S} .uv-opt.is-back .uv-front{display:none}
${S} .uv-face.is-out{animation:uv-out .38s ease-in-out forwards}
${S} .uv-face.is-in{animation:uv-in .38s ease-in-out both}
${S} .uv-corner{position:absolute;width:7px;height:7px;border-radius:50%;background:var(--uv-bg);box-shadow:inset 0 0 0 1.2px var(--uv-red),0 0 6px ${red(50)}}
${S} .uv-corner.tl{top:11px;left:11px}${S} .uv-corner.tr{top:11px;right:11px}${S} .uv-corner.bl{bottom:11px;left:11px}${S} .uv-corner.br{bottom:11px;right:11px}
${S} .uv-badge{position:absolute;top:0;left:50%;z-index:2;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:linear-gradient(#160d0f,#0d0809);box-shadow:inset 0 0 0 1.6px var(--uv-red),0 0 14px ${red(40)};transform:translate(-50%,-50%)}
${S} .uv-badge::after{content:"";position:absolute;inset:4px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--uv-red-dim)}
${S} .uv-badge span{font-size:15px;font-weight:700;line-height:1;color:var(--uv-ink)}
${S} .uv-opt-in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:13% 12% 9%}
${S} .uv-arcs{flex:none;width:52%;height:auto;color:var(--uv-red-dim);overflow:visible}
${S} .uv-arcs .f{fill:var(--uv-red)}
${S} .uv-ribbon{flex:none;max-width:100%;margin-top:1%;padding:7px 26px;border-radius:999px;background:linear-gradient(#e7223f,#a8102a);box-shadow:inset 0 0 0 1px #ff8a9a66,0 0 14px ${red(35)}}
${S} .uv-ribbon span{display:block;overflow:hidden;font-size:13px;font-weight:700;letter-spacing:2.5px;color:#ffd9de;white-space:nowrap;text-overflow:ellipsis;text-shadow:0 1px #0006}
${S} .uv-body{flex:1;display:flex;align-items:center;justify-content:center;padding:4% 2%;font-size:15px;font-weight:600;line-height:1.5;color:var(--uv-ink-dim);text-align:center;white-space:pre-line;text-wrap:balance}
${S} .uv-q{flex:1;display:flex;align-items:center;justify-content:center;padding:4% 2%;font-size:16px;font-weight:700;line-height:1.5;letter-spacing:1px;color:var(--uv-red);text-align:center;text-transform:uppercase}
${S} .uv-acts{display:flex;flex-direction:column;gap:10px;width:100%;padding-bottom:2%}
${S} .uv-verso .uv-acts{flex:1;justify-content:center}
${S} .uv-acts.row{flex:none;flex-direction:row;justify-content:center;gap:12px}
${S} .uv-acts.row .uv-btn{width:auto;min-width:80px}
${S} .uv-btn{display:block;width:100%;padding:10px 30px;border:0;border-radius:999px;background:none;box-shadow:inset 0 0 0 1.6px var(--uv-red);font:700 13px/1.35 var(--sb-font-heading);letter-spacing:2.5px;color:var(--uv-red);text-align:center;text-decoration:none;text-transform:uppercase;cursor:pointer;transition:all .18s}
${S} .uv-btn:hover,${S} .uv-btn:focus-visible{outline:0;color:#fff;background:linear-gradient(#e7223f,#a8102a);box-shadow:inset 0 0 0 1.6px var(--uv-red-bright),0 0 18px ${red(40)}}
${S} .uv-link-back{align-self:center;margin-top:2px;padding:6px;border:0;background:none;font:500 12px var(--sb-font-heading);letter-spacing:2px;color:#fff;text-transform:uppercase;opacity:.85;cursor:pointer}
${S} .uv-link-back:hover,${S} .uv-link-back:focus-visible{opacity:1;text-decoration:underline;text-underline-offset:4px}
${S} .uv-dots{display:flex;justify-content:center;gap:13px;padding:26px 0 30px}
${S} .uv-dot{width:9px;height:9px;padding:0;border:0;border-radius:50%;background:#5a3236;cursor:pointer;transition:all .25s}
${S} .uv-dot.on{width:11px;height:11px;background:var(--uv-ink);box-shadow:0 0 10px #fff6}
${S} .uv-dot:focus-visible{outline:2px solid var(--uv-red-bright);outline-offset:3px}
@keyframes uv-fade{from{opacity:0}to{opacity:1}}
@keyframes uv-out{from{transform:rotateY(0)}to{transform:rotateY(-90deg)}}
@keyframes uv-in{from{transform:rotateY(90deg)}to{transform:rotateY(0)}}

/* sem JS / movimento reduzido: carrossel empilhado, frente e verso de cada opção */
${STATIC} .uv-loader,${STATIC} .uv-fan,${STATIC} .uv-dots,${STATIC} [data-uv-flip],${STATIC} [data-uv-unflip]{display:none}
${STATIC} .uv-car{position:relative;inset:auto;display:flex;min-height:100dvh}
${STATIC} .uv-heading{margin-top:56px}
${STATIC} .uv-view{overflow:visible;container-type:normal}
${STATIC} .uv-track{flex-direction:column;align-items:center;gap:64px;padding:28px 0 64px;transform:none!important}
${STATIC} .uv-slide{height:auto}
${STATIC} .uv-opt{display:flex;flex-direction:column;gap:44px;width:100%;max-width:370px;aspect-ratio:auto}
${STATIC} .uv-face{position:relative;inset:auto;aspect-ratio:300/392}
${STATIC} .uv-opt .uv-verso,${STATIC} .uv-opt .uv-front{display:block}

/* ── páginas internas e contagem ── */
${S} .uv-page{min-height:100dvh;display:flex;flex-direction:column;align-items:center;background:${PAGE_BG}}
${S} .uv-cd{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;background:${PAGE_BG}}
${S} .uv-cd[hidden]{display:none}
${S} .uv-frame{position:absolute;inset:12px;z-index:2;border-radius:22px;box-shadow:inset 0 0 0 1.6px var(--uv-red),0 0 18px ${red(20)};pointer-events:none}
${S} .uv-frame::before{content:"";position:absolute;inset:5px;border-radius:17px;box-shadow:inset 0 0 0 1px var(--uv-red-dim)}
@container uv (min-width:768px){${S} .uv-frame{inset:24px}}
@container uv (min-width:1024px){${S} .uv-frame{inset:44px}}
${S} .uv-pg-col{position:relative;z-index:3;flex:1;display:flex;flex-direction:column;width:100%;max-width:414px;min-height:100dvh}
${S} .uv-cd .uv-pg-col{position:sticky;top:0;height:100dvh;min-height:0}
${S} .uv-pg-main{flex:1;display:flex;flex-direction:column;align-items:center;padding-top:24px}
${S} .uv-banner{position:relative;flex:none;display:flex;align-items:center;justify-content:center;width:248px;height:38px;border-radius:999px;background:linear-gradient(#1c0a0d,#120708);box-shadow:inset 0 0 0 1.8px var(--uv-red),0 0 16px ${red(25)}}
${S} .uv-banner::before{content:"";position:absolute;inset:4px;border-radius:999px;box-shadow:inset 0 0 0 1px var(--uv-red-dim)}
${S} .uv-banner i{position:absolute;top:50%;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;background:var(--uv-red);box-shadow:0 0 7px ${red(60)}}
${S} .uv-banner i:first-child{left:14px}${S} .uv-banner i:last-child{right:14px}
${S} .uv-banner span{position:relative;max-width:180px;overflow:hidden;font-size:15px;font-weight:700;letter-spacing:3px;color:var(--uv-red);white-space:nowrap;text-overflow:ellipsis;text-transform:uppercase;text-shadow:0 0 10px ${red(40)}}
${S} .uv-iconrow{flex:none;display:flex;align-items:center;justify-content:center;width:62%;margin-top:34px}
${S} .uv-side{flex:1;display:flex;align-items:center}
${S} .uv-side i{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--uv-red-dim))}
${S} .uv-side.r i{background:linear-gradient(90deg,var(--uv-red-dim),transparent)}
${S} .uv-side b{flex:none;width:6px;height:6px;margin:0 8px;border-radius:50%;background:var(--uv-red);box-shadow:0 0 6px ${red(60)}}
${S} .uv-icon{position:relative;flex:none;width:60px;height:60px;margin:0 6px;color:var(--uv-red)}
${S} .uv-icon svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
${S} .uv-icon .d{color:var(--uv-red-dim)}
${S} .uv-icon img{position:absolute;top:50%;left:50%;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:50%;object-fit:cover}
${S} .uv-cd .uv-icon{width:96px;height:96px;margin:0 10px}
${S} .uv-panel-wrap{position:relative;flex:1;display:flex;flex-direction:column;width:calc(100% - 56px);margin:22px 28px 0}
${S} .uv-panel{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:20px;padding:11% 9% 12%;overflow:hidden;border-radius:14px;background:linear-gradient(#100a0b,#0a0708);box-shadow:inset 0 0 0 1px var(--uv-red-faint)}
${S} .uv-panel::before{content:"";position:absolute;inset:6px;border-radius:9px;box-shadow:inset 0 0 0 1px var(--uv-red-faint);pointer-events:none}
${S} .uv-panel.is-list{justify-content:center;gap:28px;padding:7% 8% 9%}
${S} .uv-panel.is-phrase{justify-content:flex-start;gap:24px;padding:9% 8% 14%}
${S} .uv-pn-title{margin-top:4%;font-size:23px;font-weight:800;letter-spacing:1px;color:var(--uv-ink);text-align:center;text-transform:uppercase;text-wrap:balance}
${S} .uv-panel.is-scroll .uv-pn-title{margin-top:2%;font-size:19px}
${S} .uv-pn-phrase{font-size:18px;font-weight:700;line-height:1.5;color:var(--uv-ink);text-align:center;text-wrap:balance}
${S} .uv-items{display:flex;flex-direction:column;align-items:center;gap:13px;width:100%;margin:0;padding:0;list-style:none}
${S} .uv-panel.is-phrase .uv-items{gap:14px}
${S} .uv-items li{display:flex;width:84%;flex:none}
${S} .uv-item{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:13px 16px 12px;border-radius:13px;background:linear-gradient(#1a0c0f,#0e0809);box-shadow:inset 0 0 0 1.4px var(--uv-red);color:inherit;text-align:center;text-decoration:none;transition:transform .16s ease,box-shadow .16s ease,background .16s ease}
${S} a.uv-item:hover,${S} a.uv-item:focus-visible{outline:0;background:linear-gradient(#240e12,#120809);box-shadow:inset 0 0 0 1.4px var(--uv-red-bright),0 0 18px ${red(35)};transform:translateY(-2px)}
${S} a.uv-item:active{transform:none}
${S} .uv-nm{font-size:15px;font-weight:700;letter-spacing:.5px;color:var(--uv-ink);text-transform:uppercase}
${S} .uv-sub{font-size:8.5px;font-weight:500;letter-spacing:1.6px;color:var(--uv-ink-dim);text-transform:uppercase}
${S} .uv-item.is-soon{opacity:.55;cursor:default}
${S} .uv-soon{position:absolute;top:-8px;right:-6px;padding:2px 6px;border:1px solid var(--uv-red);border-radius:4px;background:linear-gradient(135deg,#1a0c0f,#0e0809);font-size:8px;font-weight:700;letter-spacing:1.5px;color:var(--uv-red);box-shadow:0 0 8px ${red(30)}}
${S} .uv-scroll{position:relative;flex:none;width:100%}
${S} .uv-scroll::before,${S} .uv-scroll::after{content:"";position:absolute;left:0;right:0;z-index:2;height:40px;pointer-events:none}
${S} .uv-scroll::before{top:0;background:linear-gradient(to bottom,#0d090b,transparent)}
${S} .uv-scroll::after{bottom:0;background:linear-gradient(to top,#0a0708,transparent)}
${S} .uv-scroll .uv-items{height:var(--uv-h);gap:8px;padding:16px 0 8px;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--uv-red-dim) transparent}
${S} .uv-panel.is-scroll .uv-item{gap:1px;padding:8px 16px 7px;border-radius:10px}
${S} .uv-panel.is-scroll .uv-nm{font-size:13px}
${S} .uv-panel.is-scroll .uv-sub{font-size:7.5px}
${S} .uv-note{font-size:12.5px;font-weight:600;line-height:1.5;letter-spacing:1.5px;color:var(--uv-red);text-align:center;text-transform:uppercase;text-wrap:balance;text-shadow:0 0 10px ${red(25)}}
${S} .uv-back{position:absolute;left:50%;bottom:0;z-index:8;display:grid;place-items:center;width:38px;height:38px;padding:0;border:0;border-radius:50%;background:linear-gradient(#160c0e,#0c0708);box-shadow:inset 0 0 0 1.6px var(--uv-red),0 0 14px ${red(25)};color:var(--uv-red);cursor:pointer;transform:translate(-50%,50%);transition:box-shadow .18s}
${S} .uv-back:hover,${S} .uv-back:focus-visible{outline:0;box-shadow:inset 0 0 0 1.6px var(--uv-red-bright),0 0 20px ${red(50)}}
${S} .uv-back svg{width:14px;height:14px}
${S} .uv-foot{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:5px;padding:26px 0 28px}
${S} .uv-by{font-size:11px;font-weight:600;letter-spacing:3px;color:#b9aca8;text-transform:uppercase}
${S} .uv-code{font-size:10px;letter-spacing:2px;color:#6e5f5c}
${S} .uv-cd .uv-foot{min-height:40px}
@container uv (min-width:768px){${S} .uv-foot{padding-bottom:40px}}
@container uv (min-width:1024px){${S} .uv-foot{padding-bottom:58px}${S} .uv-pg-main{padding-top:24px}}
${S} .uv-ready{font-size:22px;font-weight:700;letter-spacing:1.5px;color:var(--uv-ink);text-align:center;text-transform:uppercase}
${S} .uv-mid{display:flex;flex-direction:column;align-items:center;gap:22px}
${S} .uv-lead{font-size:21px;font-weight:700;line-height:1.32;letter-spacing:1px;color:var(--uv-ink);text-align:center;text-transform:uppercase;text-wrap:balance;white-space:pre-line}
${S} .uv-count{display:flex;justify-content:center;align-items:baseline;gap:14px;min-height:60px;perspective:650px}
${S} .uv-num{font-size:33px;font-weight:800;line-height:1;color:var(--uv-red);white-space:nowrap;opacity:.34;transform-origin:50% 100%;transition:font-size .6s cubic-bezier(.25,.8,.3,1),opacity .6s ease}
${S} .uv-num.cur{font-size:48px;opacity:1;text-shadow:0 0 22px ${red(60)};animation:uv-flipin .72s cubic-bezier(.2,.7,.2,1)}
${S} .uv-num.go{font-size:24px;font-weight:700;letter-spacing:3px;opacity:1;animation:uv-pulse 1s ease-in-out infinite}
${S} .uv-still .uv-num{animation:none}
@keyframes uv-flipin{0%{opacity:0;transform:rotateX(-88deg) translateY(-6px)}45%{opacity:1}100%{opacity:1;transform:none}}
@keyframes uv-pulse{50%{opacity:.5}}

@media (prefers-reduced-motion:reduce){
${S} .uv-grain,${S} .uv-chev,${S} .uv-portal *,${S} .uv-num{animation:none!important}
${S} .uv-num{transition:none}
${S} .uv-track{transition:none}
}
`;
