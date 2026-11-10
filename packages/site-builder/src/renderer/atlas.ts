/**
 * Variante `atlas` (escopo `.sb-at`): visual do atlashosting.com.br — escuro (#00050A), destaque azul-céu
 * (#00A3FF), Roboto, cartões de vidro e cantos bem arredondados. Menu, chave de backup e menu do celular
 * são só CSS; o contador e o mapa usam o runtime genérico (`data-sb-count`, `data-sb-lottie`).
 * Breakpoints do original: 768 (md), 1024 (lg), 1280 (xl); no preview estreito do editor valem via `.sb-narrow`.
 */
export const isAtlas = (theme: Record<string, string>) =>
  theme.variant === "atlas";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: painel dos cartões, azul de apoio e cor de vidro. */
export function atlasVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--at-glass": "rgba(255,255,255,.05)",
    "--at-line": "rgba(255,255,255,.1)",
    "--at-muted": safe(theme.soft, "#94a3b8"),
    "--at-panel": safe(theme.panel, "#00111a"),
    "--at-white": safe(theme.card, "#ffffff"),
  };
}

const S = ".sb-at";

export const atlasCss = `
${S}{font-size:16px;line-height:1.5;color:#fff;background:var(--sb-bg);font-family:var(--sb-font-body);overflow-x:hidden}
${S} *{box-sizing:border-box}
${S} main{padding-top:0!important}
${S} a{color:inherit;text-decoration:none}
${S} h1,${S} h2,${S} h3,${S} h4,${S} p,${S} ul,${S} figure,${S} blockquote{margin:0;padding:0}
${S} ul{list-style:none}
${S} em{font-style:normal;color:var(--sb-accent)}
${S} svg{flex:none}
${S} .at-wrap{position:relative;z-index:2;width:100%;max-width:1280px;margin-inline:auto;padding-inline:16px}
${S} .at-wrap-wide{max-width:1760px}
${S} .at-btn{display:inline-block;padding:14px 32px;border-radius:12px;background:var(--sb-accent);color:#fff;font-family:var(--sb-font-heading);font-size:14px;font-weight:900;letter-spacing:.12em;text-align:center;text-transform:uppercase;box-shadow:0 10px 25px rgba(0,163,255,.2);transition:background-color .2s,transform .2s}
${S} .at-btn:hover{background:#38bdf8}
${S} .at-btn.outline{border:2px solid var(--at-line);background:var(--at-glass);color:#cbd5e1;box-shadow:none}
${S} .at-btn.outline:hover{background:rgba(255,255,255,.1);color:#fff}
${S} .at-btn.ghost{border:2px solid #fff;background:transparent;box-shadow:none;font-weight:700;padding:16px 48px}
${S} .at-btn.ghost:hover{background:rgba(255,255,255,.1)}
${S} .at-btn-sm{padding:10px 22px;font-size:13px}
${S} .at-pill{display:inline-flex;align-items:center;margin-bottom:20px;padding:6px 14px;border:1px solid rgba(14,165,233,.25);border-radius:999px;background:rgba(14,165,233,.1);color:#38bdf8;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
${S} .at-pill-dot::before{content:"";width:8px;height:8px;margin-right:8px;border-radius:50%;background:#0ea5e9;box-shadow:0 0 8px rgba(14,165,233,.5);animation:at-pulse 2s infinite}
@keyframes at-pulse{50%{opacity:.4}}
@keyframes at-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
${S} .at-head-text{text-align:center;margin-bottom:48px}
${S} .at-head-text h2{font-family:var(--sb-font-heading);font-size:3.1rem;font-weight:700;line-height:1.05;letter-spacing:-.02em;margin-bottom:20px}
${S} .at-head-text p{max-width:42rem;margin-inline:auto;color:#94a3b8;font-size:1.125rem;font-weight:500}
${S} .at-stars{display:flex;justify-content:center;gap:6px}
${S} .at-stars svg{width:18px;height:18px;fill:#ffb800;stroke:#ffb800}

/* cabeçalho */
${S} .at-head{position:fixed;top:0;left:0;z-index:500;width:100%;padding-top:16px}
${S}.sb-bare .at-head,${S} .at-head{pointer-events:none}
${S} .at-nav{pointer-events:auto;display:flex;align-items:center;justify-content:space-between;height:64px;width:100%;max-width:1280px;margin-inline:auto;padding-inline:32px;border:1px solid transparent;border-radius:0;transition:all .5s}
${S} .at-head.is-scrolled .at-nav{width:min(1180px,calc(100% - 32px));padding-inline:24px;border-color:rgba(255,255,255,.08);border-radius:999px;background:rgba(0,8,13,.85);backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.4)}
${S} .at-logo img{display:block;height:45px;width:auto;filter:brightness(0) invert(1)}
${S} .at-links{display:flex;flex:1;align-items:center;justify-content:center;gap:32px}
${S} .at-links>a,${S} .at-drop>a{display:flex;align-items:center;gap:6px;padding:8px 0;color:rgba(255,255,255,.9);font-family:var(--sb-font-heading);font-size:15px;font-weight:700;transition:color .2s}
${S} .at-links>a:hover,${S} .at-drop>a:hover{color:#38bdf8}
${S} .at-drop{position:relative}
${S} .at-drop svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.5;transition:transform .3s}
${S} .at-drop:hover svg{transform:rotate(180deg)}
${S} .at-drop-menu{position:absolute;top:100%;left:0;min-width:280px;margin-top:4px;overflow:hidden;border:1px solid rgba(255,255,255,.05);border-radius:16px;background:#00080d;box-shadow:0 20px 40px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(10px) scale(.95);transition:all .2s ease-out}
${S} .at-drop:hover .at-drop-menu,${S} .at-drop:focus-within .at-drop-menu{opacity:1;visibility:visible;transform:none}
${S} .at-drop-menu a{display:block;padding:12px 20px;border-top:1px solid rgba(255,255,255,.05);color:rgba(255,255,255,.8);font-size:15px;font-weight:700}
${S} .at-drop-menu a:first-child{border-top:0}
${S} .at-drop-menu a:hover{background:rgba(255,255,255,.05);color:#38bdf8}
${S} .at-actions{display:flex;align-items:center;gap:20px}
${S} .at-login{color:rgba(255,255,255,.9);font-size:15px;font-weight:700}
${S} .at-login:hover{color:#38bdf8}
${S} .at-burger-input{position:absolute;opacity:0;pointer-events:none}
${S} .at-burger{display:none;pointer-events:auto;flex-direction:column;gap:5px;padding:10px;cursor:pointer}
${S} .at-burger span{display:block;width:24px;height:2px;border-radius:2px;background:#fff;transition:transform .3s,opacity .3s}
${S} .at-drawer{display:none}

/* topo */
${S} .at-hero{position:relative;overflow:hidden;padding:144px 16px 48px}
${S} .at-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(74% 46% at 50% 56%,rgba(0,163,255,.08),rgba(0,163,255,.03) 36%,rgba(0,163,255,0) 74%)}
${S} .at-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
${S} .at-hero-in{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:48px;max-width:2400px;margin-inline:auto}
${S} .at-search{display:flex;align-items:center;gap:8px;width:100%;max-width:672px;padding:6px 6px 6px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 8px 30px rgba(0,0,0,.04)}
${S} .at-search svg{width:16px;height:16px;fill:none;stroke:#94a3b8;stroke-width:2}
${S} .at-search input{flex:1;min-width:0;height:40px;border:0;background:transparent;color:#334155;font-family:var(--sb-font-heading);font-size:15px;outline:0}
${S} .at-search button{padding:10px 24px;border:0;border-radius:8px;background:#00a3ff;color:#fff;font-family:var(--sb-font-heading);font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 8px 20px rgba(14,165,233,.2);cursor:pointer;transition:background-color .2s}
${S} .at-search button:hover{background:#0091e6}
${S} .at-video{position:relative;width:100%;max-height:68vh;aspect-ratio:16/9;overflow:hidden;border:1px solid #f1f5f9;border-radius:48px;box-shadow:0 20px 50px rgba(0,0,0,.1)}
${S} .at-video video,${S} .at-video>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${S} .at-video-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.6),transparent),linear-gradient(0deg,rgba(0,0,0,.6),transparent)}
${S} .at-video-copy{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 clamp(24px,6vw,80px);max-width:calc(580px + clamp(24px,6vw,80px)*2)}
${S} .at-video-copy h1{margin-bottom:24px;font-family:var(--sb-font-heading);font-size:3.8rem;font-weight:700;line-height:1.1;text-shadow:0 10px 25px rgba(0,0,0,.5);animation:at-rise .7s both}
${S} .at-video-copy p{max-width:440px;margin-bottom:40px;color:rgba(255,255,255,.9);font-size:1.05rem;line-height:1.6;animation:at-rise .7s .1s both}
${S} .at-video-actions{display:flex;align-items:center;gap:16px;animation:at-rise .7s .2s both}
${S} .at-note{display:flex;align-items:center;gap:8px;color:rgba(255,255,255,.7);font-size:13px}
${S} .at-note svg{width:16px;height:16px;fill:none;stroke:#34d399;stroke-width:2}

/* números */
${S} .at-stats{position:relative;overflow:hidden;padding:96px 0 0}
${S} .at-map{position:absolute;top:-10%;left:50%;z-index:1;width:150%;max-width:1700px;transform:translateX(-50%) scale(1.25);opacity:.55;pointer-events:none}
${S} .at-map-solo{position:relative;top:auto;left:auto;margin:0 auto;transform:scale(1.3);opacity:.4;min-height:220px;width:150%}
${S} .at-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:1152px;margin:0 auto 96px}
${S} .at-stat{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;overflow:hidden;padding:48px 20px;border:1px solid rgba(255,255,255,.05);border-radius:16px;background:#00050a;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);transition:transform .2s}
${S} .at-stat:hover{transform:translateY(-4px)}
${S} .at-stat::after{content:"";position:absolute;inset:auto 0 0;height:4px;background:#00a3ff;box-shadow:0 0 15px rgba(0,163,255,.5)}
${S} .at-stat strong{font-family:var(--sb-font-heading);font-size:52px;font-weight:700;letter-spacing:-.02em}
${S} .at-stat>span{color:rgba(255,255,255,.6);font-size:14px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}

/* planos */
${S} .at-plans{position:relative;padding:128px 32px;background-image:linear-gradient(to right,#ffffff02 1px,transparent 1px),linear-gradient(to bottom,#ffffff02 1px,transparent 1px);background-size:40px 40px}
${S} .at-plans .at-head-text h2{font-size:3.75rem}
${S} .at-bk-input{position:absolute;opacity:0;pointer-events:none}
${S} .at-bk{display:none;align-items:center;gap:12px;margin-bottom:16px;padding:16px 20px;border:1px solid var(--at-line);border-radius:16px;background:var(--at-glass);cursor:pointer}
${S} .at-switch,${S} .at-spec-head .at-switch{position:relative;flex:none;width:44px;height:24px;border-radius:999px;background:rgba(255,255,255,.1);transition:background-color .2s}
${S} .at-switch::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}
${S} .at-bk-input:checked~.at-bk .at-switch{background:#0ea5e9}
${S} .at-bk-input:checked~.at-bk .at-switch::after{transform:translateX(20px)}
${S} .at-bk b{display:block;font-size:14px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
${S} .at-bk small{color:#94a3b8;font-size:12px}
${S} .at-bk .at-on,${S} .at-bk-input:checked~.at-bk .at-off{display:none}
${S} .at-bk-input:checked~.at-bk .at-on{display:inline}
${S} .at-plan-row{display:flex;align-items:stretch;gap:16px}
${S} .at-spec-col{flex:none;width:280px;border:1px solid var(--at-line);border-radius:16px;background:var(--at-glass);backdrop-filter:blur(12px);box-shadow:0 25px 50px rgba(0,0,0,.4)}
${S} .at-spec-head{padding-block:32px;display:flex;height:330px;flex-direction:column;align-items:center;justify-content:space-between;padding:32px;border-bottom:1px solid var(--at-line);color:#38bdf8;font-size:20px;letter-spacing:.2em;text-transform:uppercase}
${S} .at-bk-desk{display:flex;flex-direction:column;align-items:center;gap:16px;color:#fff;cursor:pointer}
${S} .at-bk-desk-title{font-size:24px;font-weight:900;letter-spacing:-.02em;text-transform:uppercase;text-align:center}
${S} .at-bk-desk-row{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700}
${S} .at-bk-desk small{color:#fff;font-size:18px}
${S} .at-bk-input:checked~.at-plan-row .at-bk-desk .at-switch{background:#0ea5e9}
${S} .at-bk-input:checked~.at-plan-row .at-bk-desk .at-switch::after{transform:translateX(20px)}
${S} .at-bk-desk .at-on,${S} .at-bk-input:checked~.at-plan-row .at-bk-desk .at-off{display:none}
${S} .at-bk-input:checked~.at-plan-row .at-bk-desk .at-on{display:inline}
${S} .at-spec-row{display:flex;height:72px;align-items:center;justify-content:center;padding:0 32px;border-top:1px solid var(--at-line);font-size:16px;font-weight:900;letter-spacing:.1em;text-align:center;text-transform:uppercase}
${S} .at-plan-list{display:flex;flex:1;gap:16px;min-width:0;overflow-x:auto;padding:8px;scroll-snap-type:x proximity;scrollbar-width:thin}
${S} .at-plan{display:flex;flex:0 0 24%;min-width:250px;flex-direction:column;border:1px solid var(--at-line);border-radius:16px;background:#00050a;box-shadow:0 25px 50px rgba(0,0,0,.4);scroll-snap-align:start;transition:border-color .3s}
${S} .at-plan:hover{border-color:rgba(255,255,255,.2)}
${S} .at-plan.pop{border-color:#0ea5e9;box-shadow:0 0 0 2px rgba(14,165,233,.2),0 25px 50px rgba(0,0,0,.4)}
${S} .at-plan-top{position:relative;display:flex;height:330px;flex-direction:column;gap:4px;padding:32px;border-bottom:1px solid var(--at-line)}
${S} .at-plan-top h3{margin-bottom:12px;font-family:var(--sb-font-heading);font-size:28px;font-weight:900;letter-spacing:-.04em;text-transform:uppercase}
${S} .at-plan-top s{color:#f43f5e;opacity:.7}
${S} .at-tag{position:absolute;top:10px;left:32px;padding:4px 12px;border-radius:999px;background:#0ea5e9;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
${S} .at-price{display:flex;align-items:baseline;gap:4px;white-space:nowrap}
${S} .at-price-cur{font-size:18px;font-weight:700}
${S} .at-price-main{font-size:clamp(40px,3.4vw,56px);font-weight:900;line-height:1}
${S} .at-price-cents{font-size:28px;font-weight:900}
${S} .at-price-per{margin-left:6px;font-size:16px;opacity:.4}
${S} .at-plan .at-price-bk,${S} .at-plan .at-plan-btn-bk{display:none}
${S} .at-period{margin:4px 0 16px;color:#64748b;font-size:14px;letter-spacing:.08em;text-transform:uppercase}
${S} .at-plan-btn{margin-top:auto;width:100%}
${S} .at-bk-input:checked~.at-plan-row .at-plan .at-price:not(.at-price-bk){display:none}
${S} .at-bk-input:checked~.at-plan-row .at-plan .at-price-bk{display:flex}
${S} .at-bk-input:checked~.at-plan-row .at-plan .at-plan-btn:not(.at-plan-btn-bk){display:none}
${S} .at-bk-input:checked~.at-plan-row .at-plan .at-plan-btn-bk{display:block}
${S} .at-plan-specs{flex:1}
${S} .at-spec{display:flex;min-height:72px;align-items:center;justify-content:center;gap:4px;padding:0 24px;border-top:1px solid var(--at-line);text-align:center}
${S} .at-spec:first-child{border-top:0}
${S} .at-spec small{display:none;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
${S} .at-spec span{font-size:18px;font-weight:900;letter-spacing:-.04em;text-transform:uppercase}
${S} .at-perks{display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px;border-top:1px solid var(--at-line)}
${S} .at-perks li{display:flex;align-items:center;gap:8px;color:#38bdf8;font-size:15px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
${S} .at-perks svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:4}
${S} .at-plans-foot{margin-top:64px;text-align:right}
${S} .at-plans-foot a{color:#38bdf8;font-weight:700}
${S} .at-plans-foot a:hover{text-decoration:underline}

/* depoimentos */
${S} .at-depo{position:relative;padding:96px 16px}
${S} .at-depo-box{position:relative;max-width:1440px;margin-inline:auto;padding:96px 64px;border-radius:48px;background:#00111a;box-shadow:0 30px 100px rgba(0,0,0,.4)}
${S} .at-depo-box .at-head-text{margin-bottom:64px}
${S} .at-depo-box .at-head-text h2{font-size:3rem;font-weight:900}
${S} .at-depo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
${S} .at-depo-card blockquote{position:relative;margin-bottom:32px;padding:32px;border-radius:16px;background:#fff;color:#0f172a;font-size:15px;font-weight:500;line-height:1.6;box-shadow:0 20px 25px rgba(0,0,0,.1)}
${S} .at-depo-card blockquote::after{content:"";position:absolute;bottom:-12px;left:40px;width:24px;height:24px;background:#fff;transform:rotate(45deg)}
${S} .at-depo-card figcaption{display:flex;align-items:center;gap:16px;padding:0 16px}
${S} .at-depo-card img{width:48px;height:48px;border:2px solid rgba(255,255,255,.1);border-radius:8px;object-fit:cover}
${S} .at-depo-card b{display:block;font-size:15px}
${S} .at-depo-card small{color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}

${S} .at-bubble{max-width:80%;padding:12px 16px;border-radius:20px;background:#f1f5f9;font-size:16px}

/* rodapé */
${S} .at-foot{position:relative;z-index:20;padding:32px 32px 24px}
${S} .at-foot-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;padding:40px 16px}
${S} .at-foot-brand{display:flex;flex-direction:column;align-items:center;text-align:center}
${S} .at-foot-brand img{display:block;height:45px;width:auto;margin-bottom:32px;filter:brightness(0) invert(1)}
${S} .at-foot-brand p{max-width:250px;margin-bottom:32px;font-size:15px;line-height:1.6}
${S} .at-socials{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
${S} .at-socials a{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(255,255,255,.1);border-radius:50%;background:rgba(255,255,255,.05);color:#38bdf8;font-size:11px;font-weight:700;text-transform:uppercase;transition:all .3s}
${S} .at-socials a:hover{background:#0ea5e9;color:#fff}
${S} .at-foot-col h4{margin-bottom:24px;color:#00a3ff;font-size:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
${S} .at-foot-col li{display:flex;align-items:center;gap:10px;margin-bottom:14px}
${S} .at-foot-col svg{width:16px;height:16px;fill:rgba(14,165,233,.1);stroke:#0ea5e9;stroke-width:2.5}
${S} .at-foot-col a{font-size:16px;transition:color .2s}
${S} .at-foot-col a:hover{color:#38bdf8}
${S} .at-foot-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 16px 0;color:rgba(255,255,255,.6);font-size:15px}
${S} .at-foot-bar span{display:flex;gap:20px}
${S} .at-foot-bar a:hover{color:#38bdf8}

/* produto */
${S} .at-phero{padding:112px 16px 24px;background-image:linear-gradient(to right,#ffffff08 1px,transparent 1px),linear-gradient(to bottom,#ffffff08 1px,transparent 1px);background-size:40px 40px}
${S} .at-phero-in{max-width:768px;margin:32px auto 0}
${S} .at-back{display:inline-block;margin-bottom:32px;color:#0ea5e9;font-size:14px;font-weight:700}
${S} .at-back:hover{color:#38bdf8}
${S} .at-phero .at-pill{display:flex;width:fit-content;margin:0 0 20px;border:1px solid rgba(255,255,255,.2);border-radius:4px;background:rgba(255,255,255,.05);font-size:11px;letter-spacing:.1em}
${S} .at-phero h1{font-family:var(--sb-font-heading);font-size:3rem;font-weight:900;line-height:1.15;letter-spacing:-.02em;text-transform:uppercase}
${S} .at-bullets{display:flex;max-width:36rem;flex-direction:column;gap:12px;margin-top:24px;color:#94a3b8}
${S} .at-bullets li{display:flex;align-items:flex-start;gap:10px}
${S} .at-bullets svg{width:16px;height:16px;margin-top:4px;fill:none;stroke:#0ea5e9;stroke-width:2.5}
${S} .at-rating{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:32px;color:#94a3b8}
${S} .at-rating b{color:#fff;font-weight:600}
${S} .at-rating .at-stars svg{width:16px;height:16px;fill:#0ea5e9;stroke:#0ea5e9}
${S} .at-rating small{color:#64748b;font-size:16px}
${S} .at-phero+.at-plans{padding-top:16px}
${S} .at-benefits{padding:80px 16px 16px}
${S} .at-benefits .at-head-text h2{font-size:2.8rem;font-weight:900;text-transform:uppercase}
${S} .at-benefit-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:1024px;margin:40px auto 0;padding:32px;border:1px solid var(--at-line);border-radius:16px;background:var(--at-glass);backdrop-filter:blur(12px);box-shadow:0 25px 50px rgba(0,0,0,.4)}
${S} .at-benefit{display:flex;align-items:flex-start;gap:16px}
${S} .at-benefit-ico{padding:10px;border:1px solid rgba(14,165,233,.35);border-radius:12px;background:rgba(14,165,233,.1);color:#38bdf8}
${S} .at-benefit-ico svg{display:block;width:20px;height:20px}
${S} .at-benefit h3{font-size:20px;font-weight:700;line-height:1.2}
${S} .at-benefit p{margin-top:4px;color:#94a3b8;font-size:16px;line-height:1.6}
${S} .at-region{margin-top:96px;margin-bottom:0}
${S} .at-region h3{max-width:64rem;margin-inline:auto;font-family:var(--sb-font-heading);font-size:3.5rem;font-weight:900;line-height:1.05;letter-spacing:-.02em;text-transform:uppercase}
${S} .at-region p{margin-top:32px;color:#cbd5e1;font-size:1.25rem}
${S} .at-benefits .at-map-solo{margin-top:40px;margin-bottom:0;min-height:480px;overflow:hidden}

/* legal e 404 */
${S} .at-legal{padding:140px 16px 96px}
${S} .at-legal-in{max-width:768px;margin-inline:auto}
${S} .at-legal h1{font-family:var(--sb-font-heading);font-size:2.5rem;font-weight:900;line-height:1.1}
${S} .at-legal-desc{margin-top:12px;color:#94a3b8;font-size:1.125rem}
${S} .at-legal small{display:block;margin-top:8px;color:#64748b}
${S} .at-legal-sec{margin-top:40px;padding:28px;border:1px solid var(--at-line);border-radius:16px;background:var(--at-glass)}
${S} .at-legal-sec h2{margin-bottom:14px;font-size:20px;font-weight:700}
${S} .at-legal-sec p{margin-bottom:12px;color:#cbd5e1;line-height:1.7}
${S} .at-legal-sec ul{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;padding-left:20px;color:#cbd5e1;list-style:disc}
${S} .at-legal-sec li::marker{color:#38bdf8}
${S} .at-404{display:flex;min-height:80vh;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:140px 16px;text-align:center}
${S} .at-404 h1{font-family:var(--sb-font-heading);font-size:2.5rem;font-weight:900}
${S} .at-404 p{color:#94a3b8}

/* tablet e celular */
@media (max-width:1279px){
${S} .at-plan-top{height:auto;min-height:0}
${S} .at-plan-row{flex-direction:column}
${S} .at-spec-col{display:none}
${S} .at-bk{display:flex}
${S} .at-plan{flex:0 0 31%}
${S} .at-spec small{display:block}
${S} .at-spec{flex-direction:column;gap:4px;padding:12px 24px}
}
@media (max-width:1023px){
${S} .at-plan{flex:0 0 45%}
${S} .at-stat-grid{grid-template-columns:repeat(2,1fr)}
${S} .at-foot-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:767px){
${S} .at-links,${S} .at-actions{display:none}
${S} .at-burger{display:flex}
${S} .at-nav{padding-inline:20px;justify-content:space-between}
${S} .at-logo img{height:33px}
${S} .at-drawer{pointer-events:auto;position:fixed;inset:80px 12px auto;display:none;flex-direction:column;gap:10px;max-height:calc(100vh - 100px);overflow:auto;padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:24px;background:#00080d;box-shadow:0 20px 40px rgba(0,0,0,.6)}
${S} .at-drawer p{margin-top:6px;color:#38bdf8;font-size:13px;font-weight:900;letter-spacing:.2em;text-transform:uppercase}
${S} .at-drawer>a:not(.at-btn){padding:10px 8px;font-size:16px;font-weight:700}
${S} .at-burger-input:checked~.at-drawer{display:flex}
${S} .at-burger-input:checked~.at-nav .at-burger span:nth-child(1){transform:translateY(7px) rotate(45deg)}
${S} .at-burger-input:checked~.at-nav .at-burger span:nth-child(2){opacity:0}
${S} .at-burger-input:checked~.at-nav .at-burger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
${S} .at-hero{padding:112px 16px 32px}
${S} .at-video{aspect-ratio:4/5;border-radius:48px}
${S} .at-video-copy{max-width:none;text-align:center;align-items:center}
${S} .at-video-copy h1{font-size:2rem}
${S} .at-video-copy p{font-size:14px;margin-bottom:32px}
${S} .at-video-actions{flex-direction:column}
${S} .at-head-text h2,${S} .at-plans .at-head-text h2,${S} .at-benefits .at-head-text h2{font-size:2.2rem}
${S} .at-stat-grid{grid-template-columns:1fr;margin-bottom:48px}
${S} .at-stat strong{font-size:42px}
${S} .at-plans{padding:80px 16px}
${S} .at-plan{flex:0 0 100%}
${S} .at-depo-box{padding:64px 24px;border-radius:32px}
${S} .at-depo-box .at-head-text h2{font-size:1.9rem}
${S} .at-depo-grid{grid-template-columns:1fr}
${S} .at-foot-grid{grid-template-columns:1fr;text-align:center}
${S} .at-foot-col{align-items:center}
${S} .at-foot-col ul{display:inline-block;text-align:left}
${S} .at-foot-bar{flex-direction:column;text-align:center}
${S} .at-phero h1{font-size:1.9rem}
${S} .at-benefit-grid{grid-template-columns:1fr;padding:20px}
${S} .at-region h3{font-size:1.9rem}
${S} .at-legal h1{font-size:2rem}
}
`;
