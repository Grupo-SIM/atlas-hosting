/**
 * Variante visual "portal" (`theme.variant === "portal"`): layout de portal de notícias.
 * Barra vermelha com MENU, logo central e busca; manchete em card branco com duas fotos;
 * feed com imagem à esquerda e coluna lateral de "mais lidas". As cores vêm dos tokens do
 * tema, então trocar `accent`/`bg`/`fg`/`card` já muda o site inteiro.
 */
export const isPortal = (theme: Record<string, string>) =>
  theme.variant === "portal";

/** Token extra da variante: fundo do rodapé. */
export function portalVars(
  theme: Record<string, string>
): Record<string, string> {
  const v = theme.footerBg;
  return { "--sb-footer-bg": v && !/[;{}<>]/.test(v) ? v : "var(--sb-accent)" };
}

const S = ".sb.sb-pt";

const SEARCH_ICON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-4-4'/%3E%3C/svg%3E\")";

const mobile = (scope: string) => `
${scope} .sb-news-front,${scope} .sb-news-feedwrap{grid-template-columns:1fr}
${scope} .sb-news-lead{min-height:0;gap:20px}
${scope} .sb-news-photo{min-height:220px}
${scope} .sb-news-row{grid-template-columns:1fr;gap:12px}
${scope} .sb-news-cards{grid-template-columns:repeat(2,minmax(0,1fr))}
${scope} .sb-burger::after{display:none}
${scope} .sb-burger{width:26px;padding-right:0}
${scope} .sb-header-title{font-size:20px}
${scope} .sb-topbar .sb-container{overflow-x:auto;flex-wrap:nowrap;white-space:nowrap}
${scope} .sb-shorts{width:calc(100% - 32px)}
${scope} .sb-header-search,${scope} .sb-header>.sb-btn{display:none}
${scope} .sb-header .sb-logo{position:static;transform:none;margin:0 auto}
${scope} .sb-header{justify-content:space-between}
${scope} .sb-header .sb-nav{padding-inline:16px;flex-direction:column;gap:0}
`;

export const portalCss = `
${S}{font-size:16px;line-height:1.4;color:var(--sb-fg);-webkit-font-smoothing:antialiased}
${S} h1,${S} h2,${S} h3,${S} h4{font-weight:700;letter-spacing:-.01em;line-height:1.15}
${S} h1{font-size:clamp(2rem,3.6vw,2.75rem)}
${S} h2{font-size:clamp(1.6rem,2.8vw,2.25rem)}
${S} h3{font-size:clamp(1.05rem,1.4vw,1.2rem)}
${S} h4{font-size:15px}
${S} .sb-container{width:min(1190px,100% - 32px);padding-block:16px}
${S}.sb-prose main .sb-container{width:min(820px,100% - 32px)}
${S} .sb-sub{font-size:17px;line-height:1.5}
${S} .sb-text.sb-container{padding-block:6px}
${S} .sb-text p{font-size:18px;line-height:1.7;color:var(--sb-fg)}
${S} .sb-text strong{color:inherit}
${S} .sb-heading{padding-top:24px}
${S} .sb-watermark{display:none}
${S} .sb-img-empty{background:#e9eaec}
${S} .sb-card{background:none;border-radius:0}

/* botões e links */
${S} .sb-btn{border-radius:6px;font-family:var(--sb-font-accent);font-weight:700;font-size:14px;padding:10px 20px}
${S} .sb-btn-primary,${S} .sb-btn-light,${S} .sb-btn-wide{background:var(--sb-accent);color:#fff!important}
${S} .sb-btn-primary:hover,${S} .sb-btn-light:hover,${S} .sb-btn-wide:hover{background:color-mix(in srgb,var(--sb-accent) 82%,#000)}
${S} .sb-link{font-family:var(--sb-font-accent);font-size:13px;font-weight:700}
${S} .sb-inline-link{color:var(--sb-accent)}

/* cabeçalho: barra vermelha com MENU, logo central e busca */
${S} .sb-block[data-block-type=header]{position:relative;background:var(--sb-accent);color:#fff}
${S} .sb-header.sb-container{position:relative;display:flex;flex-wrap:nowrap;align-items:center;gap:12px;width:100%;height:var(--sb-hh,77px);padding:0 max(16px,calc((100% - 1190px)/2))}
${S} .sb-burger{position:relative;display:flex;flex-direction:column;justify-content:center;gap:4px;width:84px;height:44px;padding-right:66px;cursor:pointer}
${S} .sb-burger i{width:18px;height:2px;border-radius:1px;background:#fff}
${S} .sb-burger i:nth-child(2){width:18px}
${S} .sb-burger::after{content:"MENU";position:absolute;left:30px;top:50%;transform:translateY(-50%);font-family:var(--sb-font-accent);font-size:13px;font-weight:700;letter-spacing:.04em}
${S} .sb-logo{position:absolute;left:var(--sb-lx,50%);top:50%;transform:translate(-50%,-50%)}
${S} .sb-logo strong{font-family:var(--sb-font-heading);font-weight:900;font-size:calc(34px*var(--sb-hs,1));letter-spacing:-.045em;line-height:1;white-space:nowrap}
${S} .sb-logo img{height:calc(44px*var(--sb-hs,1))}
/* só a faixa de links do topo navega: sem botão MENU nem painel vermelho */
${S} .sb-burger,${S} .sb-burger-input,${S} .sb-header .sb-nav{display:none!important}
${S} .sb-header-search{display:block;margin-left:auto}
${S} .sb-header-search input{width:calc(150px*var(--sb-hs,1));height:calc(36px*var(--sb-hs,1));padding:0 10px 0 calc(34px*var(--sb-hs,1));border:0;border-radius:4px;background:var(--sb-accent-d,#a6130a) ${SEARCH_ICON} calc(10px*var(--sb-hs,1)) center/calc(16px*var(--sb-hs,1)) no-repeat;color:#fff;font-family:var(--sb-font-accent);font-size:calc(13px*var(--sb-hs,1));font-weight:700;letter-spacing:.04em;outline:0;transition:width .2s}
${S} .sb-header-search input::placeholder{color:#fff;opacity:1}
${S} .sb-header-search input:focus{width:220px}
${S} .sb-header>.sb-btn{background:var(--sb-accent-d,#a6130a);color:#fff!important;border-radius:999px;padding:calc(9px*var(--sb-hs,1)) calc(18px*var(--sb-hs,1));font-size:calc(13px*var(--sb-hs,1))}
${S} .sb-header>.sb-btn:hover{background:color-mix(in srgb,var(--sb-accent-d,#a6130a) 85%,#000)}
${S} .sb-header .sb-nav{position:absolute;left:0;right:0;top:100%;z-index:30;display:none;flex-wrap:wrap;gap:6px 32px;margin:0;padding:24px max(16px,calc((100% - 1190px)/2)) 28px;background:var(--sb-accent-d,#a6130a);border:0;border-radius:0;color:#fff;font-family:var(--sb-font-accent);font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;box-shadow:0 12px 24px rgba(0,0,0,.2)}
${S} .sb-burger-input:checked~.sb-nav{display:flex}
${S} .sb-nav-item>a{padding:8px 0;border-bottom:2px solid transparent}
${S} .sb-nav-item>a:hover{border-bottom-color:#fff}
${S} .sb-nav-sub{background:color-mix(in srgb,var(--sb-accent-d,#a6130a) 85%,#000);border:0;border-radius:4px}
${S} .sb-nav-sub a{color:#fff}
${S} .sb-nav-sub a:hover{background:rgba(0,0,0,.2);color:#fff}
${S}:not(:has(main>.sb-block:first-child .sb-hero)) main{padding-top:0}

/* faixa de links no topo e assunto em destaque */
${S} .sb-topbar{background:#fff}
${S} .sb-topbar .sb-container{display:flex;flex-wrap:wrap;gap:6px 22px;padding-block:11px;font-family:var(--sb-font-accent);font-size:14px;font-weight:700;letter-spacing:-.01em}
${S} .sb-topbar a:nth-child(8n+1){color:#0669de}
${S} .sb-topbar a:nth-child(8n+2){color:#c4170c}
${S} .sb-topbar a:nth-child(8n+3){color:#06aa48}
${S} .sb-topbar a:nth-child(8n+4){color:#ff6a00}
${S} .sb-topbar a:nth-child(8n+5){color:#e0134f}
${S} .sb-topbar a:nth-child(8n+6){color:var(--sb-accent-d,#a6130a)}
${S} .sb-topbar a:nth-child(8n+7){color:#111}
${S} .sb-topbar a:nth-child(8n+8){color:#1c4f9c}
${S} .sb-topbar a:hover{text-decoration:underline}
${S} .sb-subbar{background:var(--sb-bg);border-bottom:1px solid #ececec}
${S} .sb-subbar .sb-container{display:flex;justify-content:flex-end;padding-block:10px}
${S} .sb-subbar a{display:flex;align-items:center;gap:10px;font-family:var(--sb-font-accent);font-size:15px;font-weight:700;color:var(--sb-accent)}
${S} .sb-subbar a::after{content:"";width:18px;height:18px;background:radial-gradient(circle,currentColor 1.7px,transparent 2.2px) 0 0/6px 6px}
${S} .sb-header-section .sb-logo{position:static;transform:none}
${S} .sb-header-section .sb-logo strong{font-size:calc(30px*var(--sb-hs,1))}
${S} .sb-header-section .sb-header-title{display:block;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:var(--sb-font-heading);font-size:calc(30px*var(--sb-hs,1));font-weight:300;letter-spacing:.01em;text-transform:uppercase;white-space:nowrap}

/* chapéu */
${S} .sb-news-kicker{display:block;margin-bottom:6px;font-family:var(--sb-font-accent);font-size:14px;font-weight:400;line-height:1.3;color:#333}

/* manchete: card branco + duas fotos */
${S} .sb-news-front{display:grid;grid-template-columns:minmax(0,1.26fr) minmax(0,1fr);gap:12px;padding-top:28px}
${S} .sb-news-lead{display:flex;flex-direction:column;justify-content:space-between;gap:28px;min-height:520px;padding:22px 26px 26px;background:#fff;border:1px solid #e4e4e4;border-radius:8px}
${S} .sb-news-lead .sb-news-kicker{margin:0}
${S} .sb-news-lead-title{margin-top:auto;font-family:var(--sb-font-heading);font-size:clamp(2rem,3.6vw,2.9rem);font-weight:700;line-height:1.08;letter-spacing:-.02em;color:var(--sb-accent);text-wrap:balance}
${S} .sb-news-lead-title:hover,${S} .sb-news-row h3 a:hover,${S} .sb-news-card:hover h3,${S} .sb-news-lead li a:hover,${S} .sb-news-side a:hover{text-decoration:underline}
${S} .sb-news-lead-img{position:relative;overflow:hidden;border:0;color:#fff;background:#222}
${S} .sb-news-lead-img>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;margin:0}
${S} .sb-news-lead-img::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(0,0,0,.82),rgba(0,0,0,.25))}
${S} .sb-news-lead-img>*:not(img){position:relative;z-index:2}
${S} .sb-news-lead-img .sb-news-kicker,${S} .sb-news-lead-img .sb-news-lead-title,${S} .sb-news-lead-img li,${S} .sb-news-lead-img li a{color:#fff}
${S} .sb-news-lead-img li::before{background:#fff}
${S} .sb-news-lead ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
${S} .sb-news-lead li{position:relative;padding-left:16px;font-size:16px;line-height:1.3;color:var(--sb-accent)}
${S} .sb-news-lead li::before{content:"";position:absolute;left:0;top:.5em;width:4px;height:4px;border-radius:50%;background:#555}
${S} .sb-news-photos{display:grid;grid-template-rows:1fr 1fr;gap:12px}
${S} .sb-news-photo{position:relative;display:flex;flex-direction:column;justify-content:space-between;min-height:254px;padding:20px 24px;overflow:hidden;border-radius:8px;color:#fff;background:#222}
${S} .sb-news-photo img,${S} .sb-news-photo .sb-img-empty{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${S} .sb-news-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.2) 40%,rgba(0,0,0,.72))}
${S} .sb-news-photo>*{position:relative;z-index:1}
${S} .sb-news-photo .sb-news-kicker{margin:0;color:#fff;font-weight:600;font-size:13px;text-shadow:0 1px 2px rgba(0,0,0,.6)}
${S} .sb-news-photo strong{font-family:var(--sb-font-heading);font-size:clamp(1.35rem,2.2vw,1.85rem);font-weight:700;line-height:1.12;text-shadow:0 1px 3px rgba(0,0,0,.8);text-wrap:balance}
${S} .sb-news-photo:hover strong{text-decoration:underline}

/* feed + coluna lateral */
${S} .sb-news-feedwrap{display:grid;grid-template-columns:minmax(0,1fr) 347px;gap:16px 24px;align-items:start;padding-top:8px}
${S} .sb-news-row{display:grid;grid-template-columns:370px minmax(0,1fr);gap:20px;padding-block:28px;border-bottom:1px solid #d9dadc}
${S} .sb-news-row:last-child{border-bottom:0}
${S} .sb-news-row-img{display:block;border-radius:8px;overflow:hidden;background:#e9eaec}
${S} .sb-news-row-img img,${S} .sb-news-row-img .sb-img-empty{width:100%;aspect-ratio:16/9;object-fit:cover;min-height:0;transition:transform .4s}
${S} .sb-news-row-img:hover img{transform:scale(1.03)}
${S} .sb-news-row h3{margin:0 0 8px;font-size:clamp(1.3rem,1.9vw,1.6rem);line-height:1.12;letter-spacing:-.015em;color:var(--sb-accent)}
${S} .sb-news-row p{margin:0 0 10px;font-size:16px;line-height:1.35;color:var(--sb-muted)}
${S} .sb-news-row time,${S} .sb-news-card time{display:block;font-size:12px;color:#777}
${S} .sb-news-side{margin-top:28px;padding:18px 20px 8px;background:#fff;border:1px solid #e4e4e4;border-radius:8px}
${S} .sb-news-side h4{margin:0 0 6px;padding-bottom:12px;border-bottom:1px solid #e4e4e4;color:#333;text-transform:none;letter-spacing:0}
${S} .sb-news-side ol{list-style:none;margin:0;padding:0;counter-reset:mais}
${S} .sb-news-side li{display:flex;gap:14px;align-items:flex-start;padding-block:14px;border-bottom:1px solid #eee;counter-increment:mais}
${S} .sb-news-side li:last-child{border-bottom:0}
${S} .sb-news-side li::before{content:counter(mais);flex:none;width:22px;font-family:var(--sb-font-heading);font-size:30px;font-weight:700;line-height:.95;color:var(--sb-accent)}
${S} .sb-news-side a{font-size:15px;font-weight:700;line-height:1.25;color:#333}

${S} .sb-news-row[hidden]{display:none}
${S} .sb-news-more{grid-column:1;display:block;width:100%;border:0;cursor:pointer;margin-top:8px;padding:17px 20px;background:var(--sb-accent);color:#fff;border-radius:8px;text-align:center;font-family:var(--sb-font-accent);font-size:14px;font-weight:700;letter-spacing:.02em;text-transform:uppercase}
${S} .sb-news-more:hover{background:color-mix(in srgb,var(--sb-accent) 82%,#000)}

/* vídeos curtos */
${S} .sb-shorts{width:min(818px,100% - 32px);margin-left:max(16px,calc((100% - 1190px)/2));margin-right:auto;padding-block:32px 36px;border-block:1px solid #d9dadc}
${S} .sb-shorts-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
${S} .sb-shorts h2{margin:0;font-size:clamp(1.7rem,2.6vw,2.25rem);font-weight:300;letter-spacing:-.01em}
${S} .sb-shorts-nav{display:flex;gap:22px}
${S} .sb-shorts-nav button{border:0;background:none;padding:0;font-size:30px;line-height:1;font-weight:700;color:var(--sb-fg);cursor:pointer}
${S} .sb-shorts-track{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .sb-shorts-track::-webkit-scrollbar{display:none}
${S} .sb-short{position:relative;flex:0 0 150px;aspect-ratio:9/16;overflow:hidden;border-radius:14px;color:#fff;background:#222;scroll-snap-align:start}
${S} .sb-short img,${S} .sb-short .sb-img-empty{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${S} .sb-short::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.1) 0%,transparent 35%,rgba(0,0,0,.78) 100%)}
${S} .sb-short>*:not(img):not(.sb-img-empty){position:absolute;z-index:1}
${S} .sb-short-time{top:12px;left:12px;padding:3px 8px;border-radius:5px;background:rgba(0,0,0,.6);font-family:var(--sb-font-accent);font-size:12px;font-weight:700}
${S} .sb-short-play{left:50%;top:50%;width:0;height:0;margin:-11px 0 0 -8px;border-left:18px solid #fff;border-top:11px solid transparent;border-bottom:11px solid transparent;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
${S} .sb-short strong{left:10px;right:10px;bottom:12px;font-family:var(--sb-font-heading);font-size:12px;font-weight:700;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,.7)}
${S} .sb-short:hover strong{text-decoration:underline}
${S} .sb-reels{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;gap:20px;background:rgba(0,0,0,.86)}
${S} .sb-reels-stage{position:relative;height:min(86vh,calc((100vw - 32px)*16/9));aspect-ratio:9/16;max-width:calc(100vw - 32px);overflow:hidden;border-radius:16px;background:#000;box-shadow:0 20px 60px rgba(0,0,0,.6)}
${S} .sb-reels-stage iframe,${S} .sb-reels-stage>img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover}
${S} .sb-reels-cap{position:absolute;left:0;right:0;bottom:0;padding:48px 18px 20px;background:linear-gradient(transparent,rgba(0,0,0,.8));color:#fff;font-family:var(--sb-font-heading);font-size:16px;font-weight:700;line-height:1.25;pointer-events:none}
${S} .sb-reels button{border:0;cursor:pointer;color:#fff;background:rgba(255,255,255,.16);border-radius:50%;font-size:30px;line-height:1;width:46px;height:46px;display:grid;place-items:center}
${S} .sb-reels button:hover{background:rgba(255,255,255,.3)}
${S} .sb-reels-close{position:absolute;top:18px;right:18px}
@media (max-width:640px){${S} .sb-reels-nav{display:none}}

${S} main>.sb-block:first-child .sb-news-feedwrap{padding-top:32px}

/* editoria */
${S} .sb-news-section{padding-top:24px}
${S} .sb-news-title{margin:0 0 16px;padding-top:14px;border-top:3px solid var(--sb-accent);font-size:clamp(1.3rem,2vw,1.6rem);color:var(--sb-accent)}
${S} .sb-news-title a:hover{text-decoration:underline}
${S} .sb-news-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${S} .sb-news-card{display:block}
${S} .sb-news-card img,${S} .sb-news-card .sb-img-empty{width:100%;aspect-ratio:16/9;object-fit:cover;margin-bottom:10px;border-radius:8px}
${S} .sb-news-card h3{margin:0 0 6px;font-size:18px;line-height:1.2;color:var(--sb-accent)}

/* busca + lista (magazine) */
${S} .sb-mag{gap:24px 32px;margin-top:16px}
${S} .sb-mag-search input,${S} .sb-filter input{background:#fff;border:1px solid #d0d2d6;border-radius:6px;color:var(--sb-fg)}
${S} .sb-mag-cats select,${S} .sb-select,${S} .sb-filter select{background:#fff;color:var(--sb-fg);border:1px solid #d0d2d6;border-radius:6px}
${S} .sb-mag-slide img{border-radius:8px}
${S} .sb-mag-slide small{font-weight:600;color:#333}
${S} .sb-mag-slide h3{font-size:clamp(1.6rem,2.6vw,2.2rem);color:var(--sb-accent)}
${S} .sb-mag-side img{border-radius:8px;width:120px}
${S} .sb-mag-side h3{color:var(--sb-accent)}
${S} .sb-mag-side em{color:var(--sb-accent);text-decoration:none}
${S} .sb-mag-dots button.on{background:var(--sb-accent)}

/* cards de post (categoria, pesquisa, relacionados) */
${S} .sb-grid{gap:28px 24px;margin-block:8px}
${S} .sb-grid-3{grid-template-columns:repeat(auto-fill,minmax(min(100%,270px),1fr))}
${S} .sb-post-card{display:flex;flex-direction:column;gap:10px;overflow:visible}
${S} .sb-post-thumb{display:block;border-radius:8px;overflow:hidden;background:#e9eaec}
${S} .sb-post-card img,${S} .sb-post-card .sb-img-empty{aspect-ratio:16/9;object-fit:cover}
${S} .sb-post-card.compact .sb-tag,${S} .sb-post-card .sb-tag{position:static;display:block;margin:0 0 4px;padding:0;background:none;color:#333;font-family:var(--sb-font-accent);font-size:14px;font-weight:400}
${S} .sb-post-thumb .sb-tag{display:none}
${S} .sb-post-card .sb-card-body,${S} .sb-post-card.compact .sb-card-body{padding:0}
${S} .sb-post-card h3{font-size:20px;line-height:1.15;color:var(--sb-accent)}
${S} .sb-post-card h3 a:hover{text-decoration:underline}
${S} .sb-post-card .sb-card-body p{font-size:15px;color:var(--sb-muted)}
${S} .sb-cat-header{padding-top:28px;border-bottom:3px solid var(--sb-accent)}
${S} .sb-cat-header h1{font-size:clamp(1.6rem,3vw,2.25rem);color:var(--sb-accent)}
${S} .sb-cat-header .sb-btn{background:none;border:1px solid #bbb;color:var(--sb-fg)!important}
${S} .sb-cat-header .sb-btn::before{content:"← "}
${S} .sb-cat-card{min-height:0;padding:0;font-size:inherit;gap:8px}
${S} .sb-cat-card img,${S} .sb-cat-card .sb-img-empty{height:auto;aspect-ratio:16/9;object-fit:cover;margin:0;border-radius:8px}
${S} .sb-cat-card .sb-cat-head{font-size:20px;line-height:1.2;color:var(--sb-accent)}
${S} .sb-cat-card .sb-cat-head b{color:var(--sb-accent)}
${S} .sb-cat-text{color:var(--sb-muted);text-align:left;font-family:var(--sb-font-body);font-size:15px}
${S} .sb-cat-card.plain{background:#fff;border:1px solid #e4e4e4;border-radius:8px;padding:18px;min-height:110px}

/* matéria */
${S} .sb-post-header{text-align:left;padding-top:32px}
${S} .sb-post-header h1{max-width:900px;margin-inline:0;font-size:clamp(2rem,4vw,2.9rem);line-height:1.1;text-wrap:balance}
${S} .sb-post-meta img,${S} .sb-post-header img{border-radius:8px;aspect-ratio:16/9;object-fit:cover}
${S} .sb-post-meta .sb-tag{margin:14px 0 4px;color:#333;text-align:left;letter-spacing:0;font-size:14px;font-weight:400}
${S} .sb-post-meta time{text-align:left;font-size:13px;margin-bottom:24px}
${S} .sb-two-cols{grid-template-columns:minmax(0,1fr) 300px;gap:40px;padding-block:24px}
${S} .sb-col-side{position:sticky;top:16px;align-self:start}
${S} .sb-post-content .sb-container{padding-block:6px}
${S} .sb-post-content .sb-text p{font-size:19px;line-height:1.7}
${S} .sb-post-content .sb-heading{padding-top:18px}
${S} .sb-post-content .sb-heading h2{font-size:clamp(1.4rem,2.2vw,1.8rem)}
${S} .sb-post-content .sb-image img{border-radius:8px}
${S} .sb-sidebar{gap:16px;padding:16px 18px;background:#fff;border:1px solid #e4e4e4;border-radius:8px}
${S} .sb-sidebar img{border-radius:8px;margin-top:0}
${S} .sb-sidebar h4{margin:0;padding-bottom:6px;color:#333}

/* categoria: carrossel de destaques + chips */
${S} .sb-cslider{--cw:min(42vw,640px);position:relative;margin-top:12px}
${S} .sb-cslider-track{display:flex;gap:3px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .sb-cslider-track::-webkit-scrollbar{display:none}
${S} .sb-cslider-card{position:relative;flex:0 0 var(--cw);height:calc(var(--cw)*.6);min-height:220px;scroll-snap-align:start;overflow:hidden;background:#222;color:#fff}
${S} .sb-cslider-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;margin:0}
${S} .sb-cslider-text{position:absolute;left:16px;right:16px;bottom:18px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}
${S} .sb-cslider-text em{padding:2px 8px;border-radius:4px;background:var(--hub-orange);font:700 10px/1.4 inherit;font-style:normal;text-transform:uppercase}
${S} .sb-cslider-text strong{padding:2px 8px;background:var(--sb-accent);font-size:clamp(1rem,1.7vw,1.5rem);font-weight:500;line-height:1.35;box-decoration-break:clone;-webkit-box-decoration-break:clone}
${S} .sb-cslider-nav button{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:64px;border:0;background:transparent;color:#fff;font-size:44px;line-height:1;cursor:pointer;text-shadow:0 1px 6px rgba(0,0,0,.6)}
${S} .sb-cslider-nav button:first-child{left:8px}
${S} .sb-cslider-nav button:last-child{right:8px}
${S} .sb-chips{padding-top:36px}
${S} .sb-chips h2{margin:0 0 14px;font-size:1rem;font-weight:700}
${S} .sb-chips-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
${S} .sb-chips-row::-webkit-scrollbar{display:none}
${S} .sb-chip{flex:0 0 152px;height:92px;display:flex;align-items:flex-end;padding:12px;border-radius:8px;color:#fff!important;font-size:12px;font-weight:700;text-transform:uppercase;text-decoration:none}
${S} .sb-chip{position:relative;overflow:hidden}
${S} .sb-chip.has-img::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,.1))}
${S} .sb-chip img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;margin:0}
${S} .sb-chip span{position:relative;z-index:1}
${S} .sb-chip-0{background:#e62b0c}${S} .sb-chip-1{background:#1b1f5c}${S} .sb-chip-2{background:#d6008f}${S} .sb-chip-3{background:#ea0033}${S} .sb-chip-4{background:#1f4be0}${S} .sb-chip-5{background:#5c6270}
@media (max-width:700px){${S} .sb-cslider{--cw:84vw}${S} .sb-cslider-nav{display:none}}

/* "abas" do portal: cada página troca marca, cabeçalho e cor dos títulos */
${S}:has(.sb-skin[data-skin="ge"]){--sb-accent:#06aa48!important;--sb-accent-d:#058a3a!important;--sb-footer-bg:#06aa48!important;--sb-head:#06aa48;--sb-hfg:#fff;--skin-name:"esporte"}
${S}:has(.sb-skin[data-skin="gshow"]){--sb-accent:#e62b0c!important;--sb-accent-d:#c92308!important;--sb-footer-bg:#e62b0c!important;--sb-head:#ff6a00;--sb-hfg:#fff;--skin-name:"entretenimento"}
${S}:has(.sb-skin[data-skin="receitas"]){--sb-accent:#8b1a9b!important;--sb-accent-d:#e6b400!important;--sb-footer-bg:#8b1a9b!important;--sb-head:#ffc800;--sb-hfg:#8b1a9b;--skin-name:"receitas"}
${S}:has(.sb-skin[data-skin="gnt"]){--sb-accent:#6a2c91!important;--sb-accent-d:#53217a!important;--sb-footer-bg:#6a2c91!important;--sb-head:#6a2c91;--sb-hfg:#fff;--skin-name:"lifestyle"}
${S}:has(.sb-skin[data-skin="redeglobo"]){--sb-accent:#2a35d4!important;--sb-accent-d:#1f29a8!important;--sb-footer-bg:#2a35d4!important;--sb-head:#2a35d4;--sb-hfg:#fff;--skin-name:"tv"}
${S} .sb-skin{display:none}
${S}:has(.sb-skin) .sb-block[data-block-type=header]{background:var(--sb-head);color:var(--sb-hfg)}
${S}:has(.sb-skin) .sb-logo strong{font-size:0}
${S}:has(.sb-skin) .sb-logo strong::after{content:var(--skin-name);font-size:calc(34px*var(--sb-hs,1));color:var(--sb-hfg)}
${S}:has(.sb-skin) .sb-subbar{display:none}
${S}:has(.sb-skin) .sb-burger i{background:var(--sb-hfg)}
${S}:has(.sb-skin) .sb-header-search input{color:var(--sb-hfg)}
${S}:has(.sb-skin) .sb-header-search input::placeholder{color:var(--sb-hfg)}
${S}:has(.sb-skin) .sb-news-row h3 a,${S}:has(.sb-skin) .sb-news-section h3{color:var(--sb-accent)}
/* vitrine 1+2 com texto sobre a foto */
${S} .sb-mosaic{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;height:min(46vw,500px);margin-top:24px}
${S} .sb-mosaic a{position:relative;display:block;overflow:hidden;border-radius:8px;background:#222;color:#fff}
${S} .sb-mosaic a:first-child{grid-row:1/3}
${S} .sb-mosaic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;margin:0}
${S} .sb-mosaic a::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.82))}
${S} .sb-mosaic span{position:absolute;left:20px;right:20px;bottom:18px;z-index:1;display:flex;flex-direction:column;gap:8px}
${S} .sb-mosaic em{font:700 12px/1 var(--sb-font-accent);font-style:normal;text-transform:uppercase;letter-spacing:.04em}
${S} .sb-mosaic strong{font-size:clamp(1.1rem,1.9vw,1.55rem);font-weight:700;line-height:1.2}
${S} .sb-mosaic a:first-child strong{font-size:clamp(1.4rem,2.8vw,2.3rem);line-height:1.15}
${S} .sb-mosaic small{font-size:14px;line-height:1.4;opacity:.92}
/* círculos "navegue por categoria" */
${S} .sb-rounds{padding-top:32px}
${S} .sb-rounds h2{margin:0 0 14px;font-size:.95rem;font-weight:700}
${S} .sb-rounds-row{display:flex;gap:20px;overflow-x:auto;scrollbar-width:none;padding-bottom:6px}
${S} .sb-rounds-row::-webkit-scrollbar{display:none}
${S} .sb-round{flex:0 0 96px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;font-size:12px;font-weight:700;color:var(--sb-fg)}
${S} .sb-round img{width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0}
/* faixa de jogos */
${S} .sb-scores{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-block:12px}
${S} .sb-scores::-webkit-scrollbar{display:none}
${S} .sb-score{flex:0 0 150px;display:flex;flex-direction:column;gap:6px;padding:10px 12px;background:#fff;border:1px solid #e4e4e4;border-radius:8px;font-size:12px;color:#444}
${S} .sb-score b{font-size:13px;color:var(--sb-fg)}
${S} .sb-score small{color:#777}
/* banner da TV */
${S} .sb-tvhero{position:relative;height:min(40vw,450px);margin-top:12px;background:#1b1f5c center/cover no-repeat;color:#fff}
${S} .sb-tvhero::before{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(10,12,60,.85),rgba(10,12,60,.25))}
${S} .sb-tvhero .sb-container{position:relative;height:100%;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding-bottom:32px}
${S} .sb-tvhero strong{max-width:46%;padding:2px 8px;background:var(--sb-accent);font-size:clamp(1.3rem,2.6vw,2rem);line-height:1.5;box-decoration-break:clone;-webkit-box-decoration-break:clone}
${S} .sb-tvhero nav{display:flex;gap:10px}
${S} .sb-tvhero nav a{display:flex;align-items:center;justify-content:center;width:140px;height:80px;padding:8px;border:2px solid rgba(255,255,255,.35);border-radius:8px;background:rgba(255,255,255,.12);color:#fff;font-size:13px;font-weight:700;text-align:center;line-height:1.2}
${S} .sb-tvhero nav a:first-child{background:var(--sb-accent);border-color:#fff}
@media (max-width:700px){${S} .sb-mosaic{grid-template-columns:1fr;grid-template-rows:auto;height:auto}${S} .sb-mosaic a,${S} .sb-mosaic a:first-child{grid-row:auto;height:56vw}${S} .sb-tvhero .sb-container{flex-direction:column;align-items:flex-start}${S} .sb-tvhero strong{max-width:100%}${S} .sb-tvhero nav{display:none}}

/* vitrine "portal.com" */
${S}{--hub-green:#0a9f48;--hub-orange:#ff6a00;--hub-grey:#6b7280}
${S} .sb-hub-top{display:grid;grid-template-columns:minmax(0,1fr) 240px 240px;gap:32px;padding-top:32px}
${S} .sb-hub-main{display:flex;flex-direction:column;gap:24px;min-width:0}
${S} .sb-hub-lead{border-radius:12px;overflow:hidden;background:var(--sb-accent)}
${S} .sb-hub-lead>a{position:relative;display:block;aspect-ratio:16/10;background:#000}
${S} .sb-hub-lead>a img{width:100%;height:100%;object-fit:cover}
${S} .sb-hub-lead>a strong{position:absolute;inset:auto 0 0 0;padding:90px 24px 20px;background:linear-gradient(transparent,rgba(0,0,0,.85));color:#fff;font-size:clamp(1.5rem,2.6vw,2.2rem);line-height:1.1;letter-spacing:-.02em}
${S} .sb-hub-lead ul{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:0;padding:18px 24px;list-style:none}
${S} .sb-hub-lead li a{display:block;color:#fff;font-size:14px;font-weight:700;line-height:1.3}
${S} .sb-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;padding-top:24px;border-top:1px solid #e4e4e4}
${S} .sb-hub-card{display:flex;flex-direction:column;gap:10px}
${S} .sb-hub-card-img{display:block;aspect-ratio:16/10;border-radius:10px;overflow:hidden;background:#e9eaec}
${S} .sb-hub-card-img img{width:100%;height:100%;object-fit:cover}
${S} .sb-hub-card h3{margin:0;font-size:19px;line-height:1.15;color:var(--sb-accent)}
${S} .sb-hub-sub{margin:0;font-size:13px;line-height:1.5;color:var(--sb-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
${S} .sb-hub-col{display:flex;flex-direction:column;gap:28px;padding-left:24px;border-left:1px solid #e4e4e4}
${S} .sb-hub-col-b .sb-hub-card h3{color:var(--hub-green)}
${S} .sb-hub-col-c .sb-hub-card h3{color:var(--hub-orange)}
${S} .sb-hub-title{display:flex;align-items:center;justify-content:space-between;margin:0 0 20px;padding-bottom:10px;border-bottom:1px solid #e4e4e4;font-size:clamp(1.6rem,2.6vw,2.2rem)}
${S} h2.sb-hub-title,${S} .sb-hub-title h2{position:relative;margin:0}
${S} h2.sb-hub-title{display:block;color:var(--sb-accent);box-shadow:inset 0 -1px 0 #e4e4e4}
${S} .sb-hub-title-grey h2{color:var(--hub-grey);padding-bottom:10px;margin-bottom:-11px;border-bottom:2px solid var(--hub-grey)}
${S} .sb-hub-title-blue{color:#1456f5!important}
${S} .sb-hub-pill{padding:8px 14px;border-radius:6px;background:var(--hub-grey);color:#fff;font-size:14px;font-weight:700}
${S} .sb-hub-sections{padding-top:48px}
${S} .sb-hub-rolou{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-bottom:56px}
${S} .sb-hub-rolou-card{display:flex;flex-direction:column;background:#fff;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,.08);overflow:hidden}
${S} .sb-hub-rolou-card img{width:100%;aspect-ratio:16/10;object-fit:cover}
${S} .sb-hub-rolou-card span{padding:14px 16px 18px;font-size:14px;font-weight:700;color:var(--hub-grey);line-height:1.3}
${S} .sb-hub-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:36px}
${S} .sb-hub-e0{--hc:var(--sb-accent)}
${S} .sb-hub-e1{--hc:var(--hub-green)}
${S} .sb-hub-e2{--hc:var(--hub-orange)}
${S} .sb-hub-editoria .sb-hub-title{color:var(--hc)}
${S} .sb-hub-feature{position:relative;display:flex;flex-direction:column;border-radius:10px;overflow:hidden;background:var(--hc);margin-bottom:8px}
${S} .sb-hub-feature img{width:100%;aspect-ratio:16/10;object-fit:cover}
${S} .sb-hub-feature strong{padding:18px 18px 22px;color:#fff;font-size:18px;line-height:1.2}
${S} .sb-hub-item{display:grid;grid-template-columns:130px minmax(0,1fr);gap:14px;align-items:start;padding:16px 0;border-top:1px solid #e4e4e4}
${S} .sb-hub-item img{width:130px;height:92px;object-fit:cover;border-radius:10px}
${S} .sb-hub-item span{color:var(--hc);font-weight:700;font-size:16px;line-height:1.2}
${S} .sb-hub-more{display:block;margin-top:12px;padding:14px;border-radius:8px;background:var(--hc);color:#fff;text-align:center;font-weight:700}
${S} .sb-hub-widgets{padding-top:24px}
${S} .sb-hub-panel{display:flex;flex-direction:column;gap:6px;padding:22px;background:#fff;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,.08);font-size:14px;min-height:260px}
${S} .sb-hub-panel b{color:var(--hc);font-size:16px}
${S} .sb-hub-panel small{color:var(--sb-muted)}
${S} .sb-hub-panel p{margin:4px 0}
${S} .sb-hub-panel span:last-child{color:var(--hc);font-weight:700}
${S} .sb-hub-down{color:var(--sb-accent);font-size:32px;font-weight:700}
${S} .sb-hub-panel dl{display:grid;grid-template-columns:1fr auto;gap:8px 12px;margin:6px 0}
${S} .sb-hub-panel dt{font-weight:700}
${S} .sb-hub-panel dd{margin:0;padding:2px 8px;background:#f0f0f0;border-radius:4px;font-size:12px}
${S} .sb-hub-score{font-size:22px;font-weight:700;text-align:center}
${S} .sb-hub-live{align-self:center;padding:3px 12px;border-radius:4px;background:var(--hub-green);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase}
${S} .sb-hub-videos{padding-top:48px}
${S} .sb-hub-player{display:grid;grid-template-columns:minmax(0,1fr) 340px;background:#2b2b2e;border-radius:14px;overflow:hidden}
${S} .sb-hub-stage{position:relative;display:block;margin:24px;background:#000}
${S} .sb-hub-stage img{width:100%;aspect-ratio:16/9;object-fit:cover}
${S} .sb-hub-play{position:absolute;left:50%;top:42%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;background:rgba(255,255,255,.92)}
${S} .sb-hub-play::after{content:"";position:absolute;left:30px;top:22px;border-left:26px solid #222;border-top:16px solid transparent;border-bottom:16px solid transparent}
${S} .sb-hub-stage strong{display:block;padding:14px 0 0;color:#fff;font-size:18px;font-weight:500;position:absolute;left:0;bottom:-52px}
${S} .sb-hub-stage{margin-bottom:60px}
${S} .sb-hub-playlist{display:flex;flex-direction:column;gap:14px;padding:20px;background:#303033}
${S} .sb-hub-playlist a{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;align-items:center}
${S} .sb-hub-thumb{position:relative;display:block;aspect-ratio:16/9;border-radius:8px;overflow:hidden}
${S} .sb-hub-thumb img{width:100%;height:100%;object-fit:cover}
${S} .sb-hub-thumb em{position:absolute;left:8px;bottom:8px;padding:1px 6px;border-radius:4px;background:rgba(0,0,0,.7);color:#fff;font-size:11px;font-style:normal}
${S} .sb-hub-playlist b{color:#fff;font-size:15px;line-height:1.2}
${S} .sb-hub-top5{padding-top:56px}
${S} .sb-hub-top5 h4{margin:0 0 12px;font-size:18px;font-weight:500;color:var(--sb-fg)}
${S} .sb-hub-top5 ol{margin:0;padding:0;list-style:none;counter-reset:t}
${S} .sb-hub-top5 li{counter-increment:t;display:grid;grid-template-columns:34px minmax(0,1fr);padding:14px 0;border-top:1px solid #eee}
${S} .sb-hub-top5 li::before{content:counter(t);font-size:22px;color:#444}
${S} .sb-hub-top5 li a{color:var(--hc);font-weight:700;font-size:15px;line-height:1.25}
${S} .sb-hub-top5 li:first-child a{font-size:18px}
@media (max-width:1000px){${S} .sb-hub-top{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}${S} .sb-hub-main{grid-column:1/-1}${S} .sb-hub-col{padding-left:0;border-left:0}${S} .sb-hub-rolou{grid-template-columns:repeat(2,minmax(0,1fr))}${S} .sb-hub-cols{grid-template-columns:1fr}${S} .sb-hub-player{grid-template-columns:1fr}}
@media (max-width:760px){${S} .sb-hub-top{grid-template-columns:1fr}${S} .sb-hub-grid,${S} .sb-hub-lead ul{grid-template-columns:1fr}${S} .sb-hub-rolou{grid-template-columns:1fr}}

/* rodapé */
${S} .sb-footer{margin-top:40px;padding-top:0;background:var(--sb-footer-bg);color:#fff}
${S} .sb-footer .sb-footer-grid{grid-template-columns:2fr 1fr 1fr;gap:32px;padding-block:40px 24px}
${S} .sb-footer-brand{padding:0;background:none;border-radius:0;font-family:var(--sb-font-heading);font-weight:900;font-size:34px;letter-spacing:-.045em;color:#fff;align-items:flex-start}
${S} .sb-footer-brand img{height:auto;max-height:64px;margin:0}
${S} .sb-footer-grid h4{font-size:13px;color:rgba(255,255,255,.75);margin:0 0 10px}
${S} .sb-footer-grid h4:not(:first-child){margin-top:18px}
${S} .sb-footer-grid a,${S} .sb-footer-grid span{font-size:15px;color:#fff;margin-bottom:8px}
${S} .sb-footer-grid a:hover{text-decoration:underline}
${S} .sb-socials a{width:34px;height:34px;margin:0;background:none;border:1px solid rgba(255,255,255,.55);color:#fff;border-radius:50%}
${S} .sb-socials a:hover{background:#fff;border-color:#fff;color:var(--sb-accent)}
${S} .sb-footer .sb-footer-bottom{padding-block:18px;border-top:1px solid rgba(255,255,255,.25);margin-top:0;font-size:13px;color:rgba(255,255,255,.85)}
${S} .sb-footer-bottom a{color:#fff}
${S} .sb-footer-bottom a:hover{text-decoration:underline}

@media (max-width:1000px){${S} .sb-news-front,${S} .sb-news-feedwrap{grid-template-columns:1fr}${S} .sb-news-lead{min-height:0}${S} .sb-news-row{grid-template-columns:260px minmax(0,1fr)}${S} .sb-news-cards{grid-template-columns:repeat(2,minmax(0,1fr))}${S} .sb-header-search{display:none}}
@media (max-width:760px){${mobile(S)}${S} .sb-mag{grid-template-columns:1fr}${S} .sb-footer-grid,${S} .sb-two-cols{grid-template-columns:1fr}${S} .sb-col-side{position:static}}
${mobile(`${S}.sb-narrow`)}
${S}.sb-narrow .sb-mag{grid-template-columns:1fr}
${S}.sb-narrow .sb-footer-grid,${S}.sb-narrow .sb-two-cols{grid-template-columns:1fr}
`;
