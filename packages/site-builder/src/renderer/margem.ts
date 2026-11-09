import { MG_MAX_FILTERS } from "../blocks/margem.js";

/**
 * Variante "margem" (`theme.variant = "margem"`): estúdio de marcas off-white e tipográfico, com túnel
 * de projetos em 3D. Tudo fica sob `.sb-mg`, então sites sem a variante não mudam. Os blocos `mg*`
 * (`blocks/margem.tsx`) ganham movimento pelo `renderer/margem-runtime.ts`; sem ele (editor, miniaturas,
 * sem JS, sem WebGL) ficam na versão estática descrita aqui. O runtime liga a versão viva pondo `mg-live`
 * em cada seção (túnel preso e câmera, método em tira de filme, notas com fios).
 *
 * Medidas da especificação em `vw` viram `cqw`: cada seção é um container de largura total, então no
 * canvas do editor (largura e zoom próprios) as proporções ficam iguais às do site publicado.
 * Breakpoints: tablet ≤ 1024 e celular ≤ 767; o preview estreito do editor (`.sb-narrow`) não enxerga
 * media query, então as regras de celular existem duas vezes.
 */
export const isMargem = (theme: Record<string, string>) =>
  theme.variant === "margem";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras da variante: fios e o verde-mata (o terracota é a cor principal do tema). */
export function margemVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--mg-green": safe(theme.green, "#2f4a3a"),
    "--mg-line": safe(theme.line, "#dcd8cf"),
  };
}

const S = ".sb-mg";

/** Filtros do índice em CSS puro (rádios + `:has`): funcionam no editor, na prévia e sem JS. */
const filterRules = Array.from({ length: MG_MAX_FILTERS + 1 }, (_, k) =>
  [
    k > 0
      ? `.mg-ix:has(.mg-fi-${k}:checked) .mg-row:not(.f-${k}){display:none}`
      : "",
    `.mg-ix:has(.mg-fi-${k}:checked) .mg-cnt.c-${k}{display:inline}`,
  ].join("")
).join("\n");

/** Tablet (≤ 1024). */
const tablet = (x: string) => `
${x} .mg-foot-cols{grid-template-columns:1fr 1fr}
${x} .mg-foot-cta{grid-column:1/-1}
${x} .mg-man{grid-template-columns:minmax(0,1fr) 30%}
`;

/** Celular (≤ 767). */
const mobile = (x: string) => `
${x} .mg-pill,${x} .mg-fpill span{height:30px;padding:0 11px}
${x} .mg-nav{padding:14px var(--mg-gut)}
${x} .mg-nav-logo{width:80px}
${x} .mg-pills{gap:4px}
${x} .mg-hero-mark{width:calc(100cqw - 2 * var(--mg-gut))}
${x} .mg-hero-labels{left:var(--mg-gut);bottom:calc(var(--mg-gut) + (100cqw - 2 * var(--mg-gut)) * .214 + 10px)}
${x} .mg-collage img{width:calc(var(--w) * 1.9cqw)}
${x} .mg-collage img:nth-child(n+5){display:none}
${x} .mg-tunnel:not(.mg-live) .mg-case-txt{position:static;display:block;padding:14px 0 0}
${x} .mg-tunnel:not(.mg-live) .mg-case-txt::before{display:none}
${x} .mg-tunnel:not(.mg-live) .mg-case-n{position:static;display:block;margin-bottom:10px}
${x} .mg-case-name{font-size:clamp(44px,14cqw,72px)}
${x} .mg-case-txt .mg-pill{margin-top:16px}
${x} .mg-man{grid-template-columns:minmax(0,1fr)}
${x} .mg-man-col{padding:0 var(--mg-gut);border-right:0}
${x} .mg-margin{display:flex!important;flex-direction:column;gap:.6em;padding:2.2em var(--mg-gut) 0}
${x} .mg-note{position:static!important;transform:none!important;opacity:1!important}
${x} .mg-threads{display:none!important}
${x} .mg-strip-view{margin-inline:calc(-1 * var(--mg-gut));padding-inline:var(--mg-gut)}
${x} .mg-method:not(.mg-live) .mg-strip-view{overflow-x:auto}
${x} .mg-method:not(.mg-live) .mg-frame{flex:none;width:62cqw}
${x} .mg-step{font-size:12px}
${x} .mg-step span{display:none}
${x} .mg-caps{display:grid}
${x} .mg-row-in{grid-template-columns:minmax(0,1fr) 64px;grid-template-areas:"y th" "c th" "d th";column-gap:14px;align-items:center}
${x} .mg-r-y{grid-area:y;font-size:12px;color:var(--sb-muted)}
${x} .mg-r-c{grid-area:c;font-size:30px}
${x} .mg-r-d{grid-area:d;font-size:13px;color:var(--sb-muted)}
${x} .mg-row-in:hover .mg-r-y,${x} .mg-row-in:hover .mg-r-d{color:inherit}
${x} .mg-r-t{display:none}
${x} .mg-r-thumb{display:block;grid-area:th;width:64px;height:64px;object-fit:cover;border-radius:2px}
${x} .mg-follow{display:none}
${x} .mg-float img{width:calc(var(--s) * 1.8cqw)}
${x} .mg-foot-cols{grid-template-columns:minmax(0,1fr)}
`;

export const margemCss = `
${S}{--mg-gut:clamp(16px,2.2vw,40px);--mg-pill:var(--sb-card);font-size:16px;line-height:1.4;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
${S} h1,${S} h2,${S} h3{margin:0;font-family:inherit;font-weight:400;line-height:inherit}
${S} p{margin:0}
${S} ::selection{background:var(--sb-accent);color:#fff}
${S} :focus-visible{outline:2px solid var(--sb-accent);outline-offset:2px}
/* a nav fica por cima do conteúdo (sticky de altura zero): sem a folga de 96px que o CSS base dá ao main */
${S} main{padding-top:0!important}

/* pílulas */
${S} .mg-pill{display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:var(--mg-pill);color:var(--sb-fg);font-size:13px;font-weight:500;line-height:1;white-space:nowrap;transition:background .2s,color .2s}
${S} .mg-pill:hover{background:var(--sb-fg);color:var(--sb-bg)}
${S} .mg-pill-dark{background:var(--sb-fg);color:var(--sb-bg)}
${S} .mg-pill-dark:hover{background:var(--sb-accent);color:#fff}
${S} .mg-pill-lg{height:52px;padding:0 26px;font-size:16px}
${S} .mg-mark{display:block;width:100%;height:auto}
${S} img.mg-mark{object-fit:contain;object-position:left bottom}
${S} .mg-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* navegação: fixa em todas as seções (sticky de altura zero, então fica por cima do conteúdo) */
${S} .sb-block[data-block-type=mgNav]{position:sticky;top:calc(var(--sb-sticky-top,0px) + var(--mg-top,0px));z-index:60;height:0}
${S} .mg-nav-wrap{position:relative;container-type:inline-size}
${S} .mg-nav{position:absolute;inset:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px var(--mg-gut);pointer-events:none;transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .3s}
${S} .mg-nav>*{pointer-events:auto}
${S} .mg-nav::before{content:"";position:absolute;inset:0 0 -40px;z-index:-1;background:linear-gradient(var(--sb-bg) 40%,transparent);opacity:0;transition:opacity .3s;pointer-events:none}
${S} .mg-nav-wrap.mg-veil .mg-nav::before{opacity:1}
${S} .mg-nav-wrap.mg-hide .mg-nav{transform:translateY(-110%);opacity:0;visibility:hidden;transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .3s,visibility 0s linear .45s}
${S} .mg-nav-logo{display:block;width:104px;color:var(--sb-fg)}
${S} .mg-pills{display:flex;gap:6px;margin:0;padding:0;list-style:none}

/* hero + túnel — estático: hero de uma tela com colagem de fotos, cases empilhados, fim */
${S} .mg-tunnel{position:relative;container-type:inline-size}
${S} .mg-stage{position:relative}
${S} .mg-canvas{display:none}
${S} .mg-hero,${S} .mg-collage{height:var(--mg-vh,100svh);min-height:520px}
${S} .mg-hero{position:relative;overflow:hidden}
${S} .mg-collage{position:absolute;inset:0 0 auto;overflow:hidden;pointer-events:none}
${S} .mg-collage img{position:absolute;width:calc(var(--w) * 1cqw);height:auto;object-fit:cover;border-radius:2px}
${S} .mg-collage img:nth-child(1){--w:11;left:6%;top:13%}
${S} .mg-collage img:nth-child(2){--w:7;left:24%;top:5%;opacity:.5;filter:blur(1.5px)}
${S} .mg-collage img:nth-child(3){--w:13;right:7%;top:10%}
${S} .mg-collage img:nth-child(4){--w:6;right:28%;top:17%;opacity:.45;filter:blur(2px)}
${S} .mg-collage img:nth-child(5){--w:10;right:3%;top:47%}
${S} .mg-collage img:nth-child(6){--w:8;left:3%;top:42%;opacity:.8}
${S} .mg-collage img:nth-child(7){--w:5;left:40%;top:12%;opacity:.4;filter:blur(2.5px)}
${S} .mg-collage img:nth-child(8){--w:6;right:36%;top:66%;opacity:.45;filter:blur(2px)}
${S} .mg-collage img:nth-child(9){--w:8;right:17%;top:62%;opacity:.7;filter:blur(1px)}
${S} .mg-hero-line{position:absolute;left:50%;top:50%;z-index:2;width:max-content;max-width:calc(100% - 2 * var(--mg-gut));transform:translate(-50%,-50%);font-size:clamp(24px,2.9cqw,52px);line-height:1.12;text-align:center;letter-spacing:-.015em}
${S} .mg-hero-line span{display:block}
${S} .mg-hero-line::before{content:"";position:absolute;inset:-70% -22%;z-index:-1;background:radial-gradient(closest-side,var(--sb-bg) 52%,transparent);pointer-events:none}
${S} .mg-hero-mark{position:absolute;left:var(--mg-gut);bottom:var(--mg-gut);z-index:2;width:49cqw;color:var(--sb-fg)}
${S} .mg-hero-labels{position:absolute;left:53cqw;right:var(--mg-gut);bottom:calc(var(--mg-gut) + 49cqw * .068);z-index:2;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:8px}
${S} .mg-chip{display:inline-block;padding:6px 12px;border-radius:999px;background:color-mix(in srgb,var(--sb-bg) 82%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);font-size:13px;line-height:1.2}
${S} .mg-cases{display:grid;gap:var(--mg-gut);margin:0;padding:0 var(--mg-gut);list-style:none}
${S} .mg-case{position:relative;overflow:hidden}
${S} .mg-case-img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover}
${S} .mg-case-txt{position:absolute;inset:0;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:1fr auto auto auto;column-gap:24px;padding:clamp(16px,2.4cqw,40px);color:var(--sb-fg)}
${S} .mg-case-txt::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,color-mix(in srgb,var(--sb-bg) 92%,transparent),transparent 45%);opacity:var(--m,1);pointer-events:none}
${S} .mg-case-n{position:absolute;top:clamp(16px,2.4cqw,40px);left:clamp(16px,2.4cqw,40px);font-size:13px}
${S} .mg-case-meta{grid-row:2;grid-column:1;margin-bottom:.7em;font-size:13px}
${S} .mg-case-name{grid-row:3;grid-column:1;font-size:clamp(56px,8.4cqw,150px);font-weight:500;line-height:.9;letter-spacing:-.045em}
${S} .mg-case-sum{grid-row:4;grid-column:1;max-width:30em;margin-top:.8em;font-size:clamp(14px,1.1cqw,18px);line-height:1.35}
${S} .mg-case-txt .mg-pill{grid-row:4;grid-column:2;align-self:end;justify-self:end}
${S} .mg-end{display:flex;flex-direction:column;align-items:center;gap:22px;padding:clamp(72px,10cqw,160px) var(--mg-gut);text-align:center}
${S} .mg-end-title{font-size:clamp(32px,4cqw,72px);line-height:1;letter-spacing:-.035em}
${S} .mg-progress{display:none}

/* túnel vivo (runtime + WebGL): seção presa por N telas, câmera no canvas, textos por cima */
${S} .mg-tunnel.mg-live{height:calc((var(--mg-screens) + 1) * var(--mg-vh,100svh))}
${S} .mg-live .mg-stage{position:sticky;top:var(--mg-top,0px);height:var(--mg-vh,100svh);overflow:hidden}
${S} .mg-live .mg-canvas{position:absolute;inset:0;display:block;width:100%;height:100%}
${S} .mg-live .mg-collage{display:none}
${S} .mg-live .mg-hero{position:absolute;inset:0;height:auto;min-height:0;pointer-events:none}
${S} .mg-live .mg-cases{position:absolute;inset:0;display:block;padding:0;pointer-events:none}
${S} .mg-live .mg-case{position:absolute;inset:0;visibility:hidden}
${S} .mg-live .mg-case.is-on{visibility:visible}
${S} .mg-live .mg-case-img{display:none}
${S} .mg-live .mg-case-txt>*{opacity:0}
${S} .mg-live .mg-case-txt a{pointer-events:auto}
${S} .mg-live.mg-portrait .mg-case-txt{inset:var(--mg-below,62%) 0 auto;display:block;padding:0 var(--mg-gut)}
${S} .mg-live.mg-portrait .mg-case-txt::before{display:none}
${S} .mg-live.mg-portrait .mg-case-n{position:static;display:block;margin-bottom:10px}
${S} .mg-live.mg-portrait .mg-case-name{font-size:clamp(40px,12cqw,72px)}
${S} .mg-live.mg-portrait .mg-case-txt .mg-pill{margin-top:16px}
${S} .mg-live .mg-end{position:absolute;inset:0;justify-content:center;padding:var(--mg-gut);visibility:hidden;opacity:0}
${S} .mg-live .mg-end.is-on{visibility:visible}
${S} .mg-live .mg-progress{position:absolute;inset:auto 0 0;display:block;height:1px;background:color-mix(in srgb,var(--sb-fg) 10%,transparent)}
${S} .mg-progress i{display:block;height:100%;background:var(--sb-fg);transform:scaleX(var(--p,0));transform-origin:left}

/* manifesto com marginália */
${S} .mg-man{position:relative;container-type:inline-size;display:grid;grid-template-columns:minmax(0,1fr) 27%;padding:clamp(88px,10cqw,180px) 0}
${S} .mg-man-col{padding:0 clamp(24px,4cqw,72px) 0 var(--mg-gut);border-right:1px solid var(--sb-fg)}
${S} .mg-label{margin-bottom:1.6em;color:var(--sb-muted);font-size:13px}
${S} .mg-man-text{font-size:clamp(40px,5.5cqw,92px);line-height:1.08;letter-spacing:-.035em}
${S} .mg-w{display:inline-block}
${S} .mg-inph{display:inline-block;width:2.5em;height:.82em;border-radius:.12em;object-fit:cover;vertical-align:-.08em}
${S} .mg-dots{display:flex;flex-wrap:wrap;gap:10px;margin:clamp(36px,4cqw,64px) 0 0;padding:0;list-style:none}
${S} .mg-dots li{width:24px;height:24px;border-radius:50%;background:var(--c)}
${S} .mg-margin{display:flex;flex-direction:column;gap:2.2em;margin:0;padding:5em var(--mg-gut) 0 24px;list-style:none}
${S} .mg-note{position:relative;display:flex;align-items:center;gap:10px;font-size:clamp(13px,1.1cqw,19px);line-height:1.2}
${S} .mg-note i{flex:none;width:7px;height:7px;border-radius:50%;background:var(--sb-fg)}
${S} .mg-threads{position:absolute;inset:0;display:none;width:100%;height:100%;overflow:visible;pointer-events:none}
${S} .mg-threads path{fill:none;stroke:var(--sb-fg);stroke-width:1}
${S} .mg-man.mg-live .mg-threads{display:block}
${S} .mg-man.mg-live .mg-margin{display:block;position:relative;padding-top:0}
${S} .mg-man.mg-live .mg-note{position:absolute;left:24px;top:var(--y,0);transform:translateY(-50%);opacity:0;transition:opacity .45s}
${S} .mg-man.mg-live .mg-note.is-on{opacity:1}
${S} .mg-anim .mg-w{opacity:0;translate:0 45%;transition:opacity .8s cubic-bezier(.2,.7,.2,1),translate .8s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i) * 22ms)}
${S} .mg-anim.mg-in .mg-w{opacity:1;translate:0 0}
${S} .mg-anim .mg-dots li{transform:scale(0)}
${S} .mg-anim.mg-in .mg-dots li{transform:scale(1);transition:transform .55s cubic-bezier(.34,1.9,.5,1) calc(500ms + var(--i) * 70ms)}

/* método: tira de filme e régua */
${S} .mg-method{position:relative;container-type:inline-size}
${S} .mg-method-stage{display:flex;flex-direction:column;gap:clamp(28px,3cqw,48px);padding:clamp(88px,9cqw,160px) var(--mg-gut)}
${S} .mg-method-title{font-size:clamp(32px,3.3cqw,56px);line-height:1.05;letter-spacing:-.03em}
${S} .mg-strip-view{overflow:hidden}
${S} .mg-strip{display:flex}
${S} .mg-frame{flex:1 1 0;min-width:0;margin:0;aspect-ratio:3/4;overflow:hidden;background:var(--mg-line)}
${S} .mg-frame>img,${S} .mg-frame>svg,${S} .mg-frame>div{display:block;width:100%;height:100%;object-fit:cover}
${S} .mg-ruler{position:relative}
${S} .mg-ruler-line{position:relative;height:1px;background:var(--mg-line)}
${S} .mg-ruler-line i{position:absolute;inset:0;background:var(--sb-fg);transform:scaleX(var(--p,0));transform-origin:left}
${S} .mg-ruler ol{position:relative;height:5.6em;margin:0;padding:0;list-style:none}
${S} .mg-step{position:absolute;top:0;left:calc(var(--k) * 100%);width:max-content;max-width:min(24em,30%);font-size:13px;line-height:1.3;transition:color .3s}
${S} .mg-step::before{content:"";position:absolute;left:0;bottom:100%;width:1px;height:8px;background:currentColor;transition:height .3s}
${S} .mg-step:last-child{transform:translateX(-100%);text-align:right}
${S} .mg-step:last-child::before{left:auto;right:0}
${S} .mg-step b{display:block;padding-top:12px;font-weight:500}
${S} .mg-step span{display:block;margin-top:6px}
/* estático (editor, sem JS): etapas em colunas iguais, todas as frases visíveis */
${S} .mg-method:not(.mg-live) .mg-ruler ol{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:16px;height:auto}
${S} .mg-method:not(.mg-live) .mg-step{position:relative;left:auto;width:auto;max-width:none}
${S} .mg-method:not(.mg-live) .mg-step:last-child{transform:none}
${S} .mg-caps{display:none;font-size:14px}
${S} .mg-caps span{grid-area:1/1}
${S} .mg-method:not(.mg-live) .mg-caps span:not(.is-on){visibility:hidden}
${S} .mg-method.mg-live{height:calc((var(--mg-screens) + 1) * var(--mg-vh,100svh))}
${S} .mg-live .mg-method-stage{position:sticky;top:var(--mg-top,0px);height:var(--mg-vh,100svh);justify-content:center;gap:clamp(16px,3svh,36px);padding-block:clamp(56px,8svh,100px) clamp(12px,3svh,32px)}
${S} .mg-live .mg-strip{width:max-content;will-change:transform}
${S} .mg-live .mg-frame{flex:none;width:auto;height:clamp(220px,60svh,760px);opacity:.72;transition:opacity .4s}
${S} .mg-live .mg-frame.is-on{opacity:1}
${S} .mg-live .mg-step{color:var(--sb-muted)}
${S} .mg-live .mg-step.is-on{color:var(--sb-fg)}
${S} .mg-live .mg-step.is-on::before{height:16px}
${S} .mg-live .mg-step span{opacity:0;transition:opacity .3s}
${S} .mg-live .mg-step.is-on span{opacity:1}
${S} .mg-live .mg-caps span{opacity:0;transition:opacity .3s}
${S} .mg-live .mg-caps span.is-on{opacity:1}

/* índice de projetos */
${S} .mg-ix{position:relative;container-type:inline-size;padding:clamp(88px,9cqw,160px) var(--mg-gut) clamp(48px,6cqw,96px)}
${S} .mg-ix-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px 32px;margin-bottom:clamp(28px,3cqw,48px)}
${S} .mg-ix-title{font-size:clamp(44px,5.4cqw,92px);line-height:1;letter-spacing:-.045em}
${S} .mg-filters{display:flex;flex-wrap:wrap;gap:6px;min-width:0;margin:0;padding:0;border:0}
${S} .mg-fpill{position:relative;cursor:pointer}
${S} .mg-fpill input{position:absolute;width:1px;height:1px;margin:0;opacity:0}
${S} .mg-fpill span{display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:var(--mg-pill);font-size:13px;font-weight:500;transition:background .2s,color .2s}
${S} .mg-fpill:hover span,${S} .mg-fpill input:checked+span{background:var(--sb-fg);color:var(--sb-bg)}
${S} .mg-fpill input:focus-visible+span{outline:2px solid var(--sb-accent);outline-offset:2px}
${S} .mg-rows{margin:0;padding:0;border-top:1px solid var(--mg-line);list-style:none}
${S} .mg-row{border-bottom:1px solid var(--mg-line)}
${S} .mg-row-in{position:relative;isolation:isolate;display:grid;grid-template-columns:9% 37% minmax(0,1fr) 15%;align-items:baseline;padding:clamp(10px,1.1cqw,18px) 0;color:var(--sb-fg);font-size:clamp(13px,1.05cqw,17px);transition:color .25s}
${S} .mg-row-in:focus-visible{outline:none}
${S} .mg-row-in::before{content:"";position:absolute;inset:-1px calc(-1 * var(--mg-gut));z-index:-1;background:var(--sb-accent);transform:scaleY(0);transition:transform .35s cubic-bezier(.2,.7,.2,1)}
${S} .mg-row-in:hover,${S} .mg-row-in:focus-visible{color:#fff}
${S} .mg-row-in:hover::before,${S} .mg-row-in:focus-visible::before{transform:scaleY(1)}
${S} .mg-r-c{font-size:clamp(26px,2.9cqw,46px);line-height:1.05;letter-spacing:-.045em}
${S} .mg-r-t{text-align:right}
${S} .mg-r-thumb{display:none}
${S} .mg-count{margin-top:18px;color:var(--sb-muted);font-size:13px;text-align:right}
${S} .mg-cnt{display:none}
${filterRules}
${S} .mg-follow{position:absolute;top:0;left:0;z-index:5;width:19cqw;aspect-ratio:4/5;overflow:hidden;border-radius:2px;box-shadow:0 22px 60px rgba(20,20,20,.18);opacity:0;scale:.6;pointer-events:none;transition:opacity .3s,scale .4s cubic-bezier(.2,.7,.2,1)}
${S} .mg-follow img{display:block;width:100%;height:100%;object-fit:cover}
${S} .mg-follow.is-on{opacity:1;scale:1}

/* depoimento com fotos em profundidade */
${S} .mg-quote{position:relative;container-type:inline-size;display:grid;place-items:center;min-height:max(110svh,640px);padding:clamp(88px,10cqw,160px) var(--mg-gut);overflow:hidden}
${S} .mg-float{position:absolute;inset:0;pointer-events:none}
${S} .mg-float img{position:absolute;left:calc(var(--x) * 1%);top:calc(var(--y) * 1%);z-index:calc(var(--d) * 10);width:calc(var(--s) * 1cqw);height:auto;border-radius:2px;opacity:calc(.45 + var(--d) * .55);filter:blur(calc((1 - var(--d)) * 6px));translate:-50% calc(-50% + var(--mg-py,0px))}
${S} .mg-quote-in{position:relative;z-index:20;max-width:min(30em,100%);margin:0;text-align:center}
${S} .mg-quote-in::before{content:"";position:absolute;inset:-45% -18%;z-index:-1;background:radial-gradient(closest-side,var(--sb-bg) 55%,transparent);pointer-events:none}
${S} .mg-quote blockquote{margin:0;font-size:clamp(28px,2.7cqw,46px);line-height:1.18;letter-spacing:-.02em}
${S} .mg-quote figcaption{margin-top:1.4em;color:var(--sb-muted);font-size:13px}

/* rodapé */
${S} .mg-foot{container-type:inline-size;padding:clamp(64px,8cqw,140px) var(--mg-gut) var(--mg-gut);border-top:1px solid var(--mg-line)}
${S} .mg-foot-cols{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:32px;align-items:start;font-size:15px}
${S} .mg-foot-cta p{margin-bottom:20px;font-size:clamp(22px,2cqw,34px);line-height:1.15;letter-spacing:-.02em}
${S} .mg-foot-contact{display:flex;flex-direction:column;gap:4px;font-style:normal}
${S} .mg-foot-social{display:flex;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none}
${S} .mg-uline{background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .35s}
${S} .mg-uline:hover,${S} .mg-uline:focus-visible{background-size:100% 1px}
${S} .mg-foot-mark{margin-top:clamp(64px,9cqw,160px);overflow:hidden;color:var(--sb-fg)}
${S} .mg-foot-mark .mg-mark{translate:0 var(--mg-rise,0%)}

/* blocos genéricos (página 404) */
${S} .sb-container{width:min(1400px,100% - 2 * var(--mg-gut))}
${S} .sb-heading h1,${S} .sb-heading h2{font-size:clamp(44px,5.4vw,92px);line-height:1;letter-spacing:-.045em}
${S} .sb-btn-primary{border-radius:999px;background:var(--sb-fg);color:var(--sb-bg)!important;font-family:inherit;font-size:14px;font-weight:500}
${S} .sb-btn-primary:hover{background:var(--sb-accent);color:#fff!important}
${S} .sb-block[data-block-type=button] .sb-align-center{text-align:left}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
