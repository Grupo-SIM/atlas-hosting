/**
 * Variante "marketplace" (`theme.variant = "marketplace"`): vitrine de produtos digitais escura com
 * gradiente laranja→rosa, medida no marketplace.centraldomarketing.com (Elementor): cabeçalho fixo com
 * gaveta à direita no celular, hero com foto inclinada, cartões altos com etiqueta, ranking, categorias,
 * banner de título em 3 painéis, grade de produtos, letreiro, rodapé. Tudo fica sob `.sb-mk`, então os
 * sites que usam o estilo padrão (ou outras variantes) não mudam.
 *
 * Breakpoints do original (Elementor): tablet ≤ 1024 e celular ≤ 767. O preview estreito do editor
 * (`.sb-narrow`) não enxerga media query, então cada regra de tela pequena existe duas vezes.
 */
export const isMarketplace = (theme: Record<string, string>) =>
  theme.variant === "marketplace";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras da variante: títulos, rosa do gradiente, linhas, texto claro e item de menu ativo. */
export function marketplaceVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--mk-active": safe(theme.active, "#ff7c03"),
    "--mk-line": safe(theme.line, "#424242"),
    "--mk-pink": safe(theme.pink, "#f2295b"),
    "--mk-soft": safe(theme.soft, "#bbbbbb"),
    "--mk-title": safe(theme.title, "#ffffff"),
  };
}

const S = ".sb-mk";

/** Tablet e celular (≤ 1024): gaveta do menu, hero sem foto, grades com menos colunas. */
const tablet = (x: string) => `
${x} .sb-header.sb-container{width:calc(100% - 40px);min-height:108px}
${x} .sb-header .sb-burger{display:flex;order:3;flex-direction:column;justify-content:center;gap:6px;width:30px;height:30px;margin-left:auto;cursor:pointer}
${x} .sb-header .sb-burger i{display:block;width:100%;height:3px;border-radius:2px;background:var(--mk-title)}
${x} .sb-header .sb-nav{position:fixed;top:0;right:0;bottom:0;z-index:61;display:flex;flex-direction:column;align-items:center;gap:0;width:50%;min-width:190px;margin:0;padding:40px 10px;overflow-y:auto;background:#242424;transform:translateX(100%);visibility:hidden;transition:transform .5s ease,visibility 0s linear .5s}
${x} .sb-header .sb-nav::before{content:"";display:block;width:100%;height:84px;margin-bottom:60px;background:var(--sb-logo,none) center/contain no-repeat}
${x} .sb-header .sb-nav-item>a{padding:25px 10px}
${x} .sb-burger-input:checked~.sb-nav{transform:none;visibility:visible;transition:transform .5s ease}
${x} .sb-burger-backdrop{position:fixed;inset:0;z-index:60;display:block;background:rgba(0,0,0,.8);opacity:0;pointer-events:none;transition:opacity .5s}
${x} .sb-burger-input:checked~.sb-burger-backdrop{opacity:1;pointer-events:auto}
${x} .sb-mk-hero.v-hero .sb-mk-hero-in{grid-template-columns:minmax(0,1fr)}
${x} .sb-mk-hero.v-hero .sb-mk-hero-media{display:none}
${x} .sb-mk-hero.v-hero{padding:80px 20px}
${x} .sb-mk-hero.v-error .sb-mk-hero-in{grid-template-columns:minmax(0,1fr);padding:60px 40px}
${x} .sb-mk-hero.v-error .sb-mk-hero-media{position:absolute;inset:0;opacity:.6}
${x} .sb-mk-decor{display:none}
${x} .sb-mk-cards-grid{grid-template-columns:repeat(min(var(--mk-cols),2),minmax(0,1fr))}
${x} .sb-mk-rank-list{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-cat-l-caption .sb-grid,${x} .sb-cat-l-tag .sb-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${x} .sb-ct-fg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-mk-banner{grid-template-columns:1fr 2fr 1fr;min-height:340px}
${x} .sb-mk-banner h1{font-size:36px;line-height:40px}
${x} .sb-grid-3:has(>.sb-post-card.product){grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-mk-video-box{height:420px}
${x} .sb-ct-foot{grid-template-columns:1fr 1fr 1fr;gap:30px}
${x} .sb-ct-foot-brand{padding-left:0}
`;

/** Celular (≤ 767). */
const mobile = (x: string) => `
${x} .sb-heading{padding:70px 0 24px}
${x} .sb-heading>h2{font-size:30px;line-height:36px}
${x} .sb-mk-hero.v-hero{padding:60px 20px}
${x} .sb-mk-hero h1,${x} .sb-mk-hero h2{font-size:34px;line-height:40px}
${x} .sb-mk-hero-text p{font-size:17px;line-height:23.8px}
${x} .sb-mk-btns{flex-direction:column;align-items:stretch}
${x} .sb-mk-btns .sb-btn{text-align:center}
${x} .sb-mk-hero.v-error .sb-mk-hero-in{padding:40px 20px}
${x} .sb-mk-cards-grid{grid-template-columns:minmax(0,1fr)}
${x} .sb-mk-rank-list{grid-template-columns:minmax(0,1fr)}
${x} .sb-mk-rank-list a{padding:25px 20px;gap:25px}
${x} .sb-cat-l-caption .sb-grid,${x} .sb-cat-l-tag .sb-grid{grid-template-columns:minmax(0,1fr)}
${x} .sb-ct-fg-grid{grid-template-columns:minmax(0,1fr)}
${x} .sb-mk-banner{grid-template-columns:minmax(0,1fr);min-height:0}
${x} .sb-mk-banner .side{display:none}
${x} .sb-mk-banner .mid{min-height:260px;margin:20px}
${x} .sb-mk-banner h1{font-size:34px;line-height:40px}
${x} form.sb-mag.sb-container{flex-direction:column;align-items:stretch}
${x} .sb-grid-3:has(>.sb-post-card.product){grid-template-columns:minmax(0,1fr)}
${x} .sb-mk-video-box{height:240px}
${x} .sb-mk-play{width:72px;height:72px}
${x} .sb-ct-foot{grid-template-columns:minmax(0,1fr);text-align:center}
${x} .sb-ct-foot-brand{align-items:center}
${x} .sb-ct-foot-brand .sb-logo{justify-content:center}
`;

export const marketplaceCss = `
${S}{font-family:var(--sb-font-body);font-size:15px;line-height:1.4}
${S} h1,${S} h2,${S} h3,${S} h4{font-family:var(--sb-font-heading);font-weight:600;color:var(--mk-title);letter-spacing:0}
${S} p{margin:0 0 15px}
${S} .sb-container{width:min(1400px,100% - 40px);padding-block:0}
${S} main{padding-top:0!important}
${S} .sb-img-empty{background:#1b1b1b}
${S} .sb-float{display:none}

/* botões: gradiente (principal) ou contorno; "push" no hover, como o Elementor */
${S} .sb-btn{display:inline-block;padding:15px 35px;border:1px solid transparent;border-radius:10px;background:linear-gradient(150deg,var(--sb-accent) 5%,#f9075e 80%);color:#fff!important;font-family:var(--sb-font-heading);font-size:15px;font-weight:600;line-height:19.95px;text-align:center;transition:.3s}
${S} .sb-btn:hover{animation:sb-fx-push .3s linear;background:linear-gradient(150deg,var(--sb-accent) 0%,#f9075e 60%)}
${S} .sb-btn-light{border-color:var(--mk-line);background:transparent}
${S} .sb-btn-light:hover{background:transparent}
${S} .sb-btn-light:hover{border-color:var(--sb-accent)}
${S} .sb-btn-wide{display:block;width:min(420px,100%);margin:0 auto 16px}
${S} .sb-link{color:#fff!important;font-family:var(--sb-font-body);font-size:12px;font-weight:700}

/* cabeçalho fixo no topo */
${S} .sb-block[data-block-type=header]{position:sticky;top:var(--sb-sticky-top,0px);z-index:50;background:var(--sb-bg);border-bottom:1px solid #2a2a2a}
${S} .sb-header.sb-container{width:min(810px,100% - 40px);min-height:108px;padding:0;flex-wrap:nowrap;gap:20px}
${S} .sb-logo{flex:none}
${S} .sb-logo img{width:auto;height:58px}
${S} .sb-logo strong{font-family:var(--sb-font-heading);font-size:20px;font-weight:600;color:var(--mk-title)}
${S} .sb-header>.sb-btn{display:none}
${S} .sb-nav{margin-left:auto;padding:0;gap:0;border:0;border-radius:0;background:none;color:var(--mk-title);font-family:var(--sb-font-heading);font-size:15px;font-weight:600;line-height:19.95px;text-transform:none}
${S} .sb-nav-item>a{padding:0 12.5px;transition:color .3s}
${S} .sb-nav-item>a:hover,${S} .sb-nav-item>a[aria-current=page]{color:var(--mk-active)}
${S} .sb-nav-sub{border:1px solid var(--mk-line);border-radius:10px;background:#1b1b1b}
${S} .sb-nav-sub a{text-transform:none}

/* títulos de seção */
${S} .sb-heading{padding:110px 0 30px}
${S} .sb-heading>h1,${S} .sb-heading>h2,${S} .sb-heading>h3{margin:0;font-size:38px;line-height:43.7px}
${S} .sb-heading>.sb-sub{margin:12px 0 0;font-size:17px}
${S} .sb-text{font-size:15px;line-height:21px}
${S} .sb-text strong{color:var(--mk-title)}
${S} .sb-image img{margin-inline:auto}

/* hero */
${S} .sb-mk-hero{position:relative;overflow:hidden;padding:110px 20px;background:linear-gradient(rgba(17,17,17,.05) 30%,var(--sb-bg) 80%),linear-gradient(rgba(17,17,17,.72),rgba(17,17,17,.72)),var(--mk-bg,none) center/cover no-repeat,var(--sb-bg)}
${S} .sb-mk-hero-in{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;width:min(1400px,100%);margin:0 auto}
${S} .sb-mk-hero-media{position:relative;padding:14px 110px 14px 10px}
${S} .sb-mk-hero-band{position:absolute;inset:0 100px 0 -10px;border-radius:10px;background:linear-gradient(150deg,var(--sb-accent) 5%,#f9075e 80%);rotate:-3deg}
${S} .sb-mk-hero-photo{position:relative;width:100%;aspect-ratio:570/771;object-fit:cover;border-radius:10px}
${S} .sb-mk-hero-alt{position:absolute;top:14px;left:10px;width:calc(100% - 120px);opacity:0;transition:opacity .3s ease-in-out}
${S} .sb-mk-hero-alt:hover{opacity:1}
${S} .sb-mk-hero-text h1,${S} .sb-mk-hero-text h2{margin:0 0 40px;font-size:45px;line-height:49.5px}
${S} .sb-mk-hero-text p{margin:0 0 6px;color:var(--sb-muted);font-family:var(--sb-font-heading);font-size:19px;line-height:24.7px}
${S} .sb-mk-btns{display:flex;flex-wrap:wrap;gap:20px;margin-top:50px}
${S} .sb-mk-decor{position:absolute;z-index:0;pointer-events:none;opacity:.5}
${S} .sb-mk-decor.a{right:-60px;bottom:-140px;width:550px}
${S} .sb-mk-decor.b{right:60px;top:0;width:267px}
${S} .sb-mk-hero.v-error{padding:110px 20px 0;background:none}
${S} .sb-mk-hero.v-error .sb-mk-hero-in{overflow:hidden;width:min(1400px,100%);min-height:580px;padding:80px;border-radius:10px;background:linear-gradient(90deg,rgba(22,22,22,.94),rgba(22,22,22,.84)),var(--mk-bg,none) center/cover no-repeat,#161616}
${S} .sb-mk-hero.v-error .sb-mk-hero-media{order:2;padding:0;opacity:.06}
${S} .sb-mk-hero.v-error .sb-mk-hero-band{display:none}
${S} .sb-mk-hero.v-error .sb-mk-hero-photo{aspect-ratio:1;object-fit:contain}
${S} .sb-mk-hero.v-error .sb-mk-btns{margin-top:40px}

/* cartões altos com foto (TOP produtos, parceiros) */
${S} .sb-mk-cards-grid{display:grid;grid-template-columns:repeat(var(--mk-cols,3),minmax(0,1fr));gap:50px 20px}
${S} .sb-mk-card{display:block;padding:20px;border:1px solid var(--mk-line);border-radius:10px;transition:border-color .3s}
${S} .sb-mk-card:hover{border-color:var(--sb-accent)}
${S} .sb-mk-card-in{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:space-between;min-height:554px;padding:20px;overflow:hidden;border-radius:10px;background:var(--sb-bg)}
${S} .sb-mk-card-in::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(rgba(17,17,17,0) 45%,var(--sb-bg) 75%)}
${S} .sb-mk-card-img{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover}
${S} .sb-mk-tag{align-self:flex-start;padding:7px 15px;border-radius:5px;background:linear-gradient(150deg,var(--sb-accent) 5%,var(--mk-pink) 80%);color:#fff;font-family:var(--sb-font-body);font-size:15px;font-weight:600;line-height:21px}
${S} .sb-mk-card-body h3{margin:0 0 22px;font-size:21px;line-height:27.3px}
${S} .sb-mk-card-body p{margin:0;color:var(--mk-soft);font-size:17px;line-height:23.8px}
${S} .sb-mk-pill{display:inline-flex;align-items:center;gap:20px;margin-top:22px;padding:10px 20px 10px 10px;border-radius:100px;background:#161616;color:var(--sb-muted);font-size:17px;line-height:23.8px}
${S} .sb-mk-pill img{width:34px;height:34px;border-radius:50%;object-fit:cover}
${S} .sb-mk-pill span{transition:color .3s}
${S} .sb-mk-pill:hover span{color:var(--sb-accent)}

/* ranking "mais quentes" */
${S} .sb-mk-rank{padding-inline:10px}
${S} .sb-mk-rank-list{display:grid;grid-template-columns:repeat(var(--mk-cols,5),minmax(0,1fr));gap:20px;margin:0;padding:0;list-style:none}
${S} .sb-mk-rank-list a{display:flex;align-items:center;gap:15px;height:100%;padding:20px;border:1px solid var(--mk-line);border-radius:10px;transition:border-color .3s}
${S} .sb-mk-rank-list a:hover{border-color:var(--sb-accent)}
${S} .sb-mk-rank-list .n{flex:none;color:var(--sb-muted);font-size:15px;line-height:21px}
${S} .sb-mk-rank-list .th{position:relative;flex:none;width:50px;height:50px}
${S} .sb-mk-rank-list .th img,${S} .sb-mk-rank-list .th .sb-img-empty{width:50px;height:50px;border-radius:50%;object-fit:cover}
${S} .sb-mk-rank-list .th i{position:absolute;right:-4px;bottom:-4px;font-size:16px;font-style:normal;line-height:1}
${S} .sb-mk-rank-list strong{color:var(--mk-title);font-size:15px;font-weight:600;line-height:21px}

/* grade de categorias: legenda embaixo (home) ou etiqueta sobre a foto (/categorias/) */
${S} .sb-cat-l-caption .sb-grid,${S} .sb-cat-l-tag .sb-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:40px;margin:0}
${S} .sb-cat-l-caption,${S} .sb-cat-l-tag{padding-inline:20px}
${S} .sb-cat-l-caption .sb-cat-card,${S} .sb-cat-l-tag .sb-cat-card{min-height:0;padding:0;gap:0;border-radius:10px;background:none;overflow:visible}
${S} .sb-cat-card .sb-cat-head svg{display:none}
${S} .sb-cat-l-caption .sb-cat-card img,${S} .sb-cat-l-caption .sb-cat-card .sb-img-empty{order:1;height:auto;aspect-ratio:1;margin:0;object-fit:cover;border-radius:10px}
${S} .sb-cat-l-caption .sb-cat-head{order:2;justify-content:center;padding:20px 0 0;color:var(--mk-title);font-family:var(--sb-font-heading);font-size:14px;line-height:18.2px;text-align:center}
${S} .sb-cat-count{color:var(--sb-accent);font-style:normal}
${S} .sb-cat-l-tag .sb-grid{gap:50px 15px}
${S} .sb-cat-l-tag .sb-cat-card{position:relative;padding:20px;border:1px solid var(--mk-line);transition:border-color .3s}
${S} .sb-cat-l-tag .sb-cat-card:hover{border-color:var(--sb-accent)}
${S} .sb-cat-l-tag .sb-cat-card img,${S} .sb-cat-l-tag .sb-cat-card .sb-img-empty{height:auto;aspect-ratio:294/362;margin:0;object-fit:cover;border-radius:10px;-webkit-mask:linear-gradient(#000 50%,rgba(0,0,0,.35) 95%);mask:linear-gradient(#000 50%,rgba(0,0,0,.35) 95%)}
${S} .sb-cat-l-tag .sb-cat-head{position:absolute;top:40px;left:40px;z-index:1;max-width:calc(100% - 80px);padding:7px 15px;border-radius:5px;background:linear-gradient(150deg,var(--sb-accent) 5%,var(--mk-pink) 80%);color:#fff;font-family:var(--sb-font-body);font-size:15px;line-height:21px}

/* tipos de produto (featureGrid "ícone") */
${S} .sb-ct-fg{padding:50px 0 110px}
${S} .sb-ct-fg-grid{display:grid;grid-template-columns:repeat(var(--ct-cols,4),minmax(0,1fr))}
${S} .sb-ct-fg .item{display:block;padding:20px}
${S} .sb-ct-fg .ic{display:block;width:max-content;color:var(--mk-active);transition:color .3s}
${S} .sb-ct-fg .ic:hover{color:#d80000}
${S} .sb-ct-fg .ic svg{width:50px;height:50px}
${S} .sb-ct-fg h3{margin:0;padding:30px 0 10px;font-size:21px;line-height:27.3px}
${S} .sb-ct-fg p{margin:15px 0 0;color:var(--sb-muted);font-size:17px;line-height:23.8px}

/* capa de vídeo com play */
${S} .sb-mk-video{padding-bottom:110px}
${S} .sb-mk-video-box{display:grid;place-items:center;height:600px;border-radius:10px;background:#1b1b1b center/cover no-repeat}
${S} .sb-mk-play{position:relative;display:grid;place-items:center;width:110px;height:110px;border-radius:50%;background:linear-gradient(150deg,var(--sb-accent) 5%,#f9075e 80%);color:#fff;box-shadow:0 0 0 0 rgba(249,7,94,.5);animation:sb-mk-pulse 2s infinite;transition:scale .3s}
${S} .sb-mk-play:hover{scale:1.08}
${S} .sb-mk-play svg{width:40%;height:40%;margin-left:6%}
${S} .sb-mk-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes sb-mk-pulse{70%{box-shadow:0 0 0 22px rgba(249,7,94,0)}100%{box-shadow:0 0 0 0 rgba(249,7,94,0)}}
@media (prefers-reduced-motion:reduce){${S} .sb-mk-play{animation:none}}

/* banner de título em 3 painéis */
${S} .sb-mk-banner{display:grid;grid-template-columns:360fr 720fr 360fr;min-height:432px}
${S} .sb-mk-banner .side{position:relative;overflow:hidden}
${S} .sb-mk-banner .side img,${S} .sb-mk-banner .side .sb-img-empty{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${S} .sb-mk-banner .side::after{content:"";position:absolute;inset:0;background:linear-gradient(rgba(27,27,27,.06),var(--sb-bg))}
${S} .sb-mk-banner .mid{display:grid;place-items:center;margin:20px;padding:20px;border-radius:10px;background:#1b1b1b;text-align:center}
${S} .sb-mk-banner h1{margin:0;font-size:45px;line-height:49.5px}

/* busca + categorias (produtos, categoria, pesquisa) */
${S} form.sb-mag.sb-container{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:70px}
${S} form.sb-mag .sb-mag-search{display:flex;gap:8px;width:min(450px,100%)}
${S} form.sb-mag .sb-mag-search input{flex:1;min-width:0;height:68px;padding:0 20px;border:1px solid var(--mk-line);border-radius:10px;background:transparent;color:var(--mk-title);font:15px var(--sb-font-body)}
${S} form.sb-mag .sb-mag-search .sb-btn{padding:0 25px}
${S} form.sb-mag .sb-mag-cats{display:flex;flex-direction:column;gap:20px;width:min(250px,100%)}
${S} form.sb-mag .sb-mag-cats strong{color:var(--mk-title);font-family:var(--sb-font-heading);font-size:21px;font-weight:600;line-height:27.3px}
${S} form.sb-mag .sb-mag-cats select{height:43px;padding:0 15px;border:0;border-radius:10px;background:#fff;color:#111;font:600 14px var(--sb-font-heading)}

/* grade de produtos (postList "product") */
${S} .sb-block[data-block-type=postList]>.sb-container{padding:50px 0 110px}
${S} .sb-grid-3:has(>.sb-post-card.product){gap:60px 33px;margin:0}
${S} .sb-post-card.product{border-radius:0;background:none;overflow:visible}
${S} .sb-post-card.product img,${S} .sb-post-card.product .sb-img-empty{aspect-ratio:16/9;border-radius:10px;object-fit:cover}
${S} .sb-post-card.product h3{margin:10px 0 0;font-size:21px;line-height:27.3px}
${S} .sb-post-card.product h3 a,${S} .sb-post-card.product .sb-link{transition:color .3s}
${S} .sb-post-card.product h3 a:hover,${S} .sb-post-card.product .sb-link:hover{color:var(--sb-accent)!important}
${S} .sb-post-card.product:has(.sb-link) h3{font-size:18px;line-height:20.7px}
${S} .sb-post-card.product .sb-link{display:inline-block;margin-top:5px}
${S} .sb-empty{color:var(--sb-muted)}

/* letreiro: espaço acima, como na home */
${S} .sb-tmq{padding-block:20px 0}

/* páginas de texto (termos, política) */
${S}.sb-prose main .sb-container{width:min(1140px,100% - 40px)}
${S}.sb-prose .sb-text{color:var(--mk-title)}
${S}.sb-prose .sb-heading{padding:30px 0 10px}
${S}.sb-prose .sb-heading>h2{font-size:24px;line-height:31px}
${S}.sb-prose .sb-mk-banner{margin-bottom:40px}
${S}.sb-prose .sb-block[data-block-type=button]{padding:50px 0 80px}

/* página do produto: o site incorporado ocupa a largura toda */
${S} .sb-embed{padding-bottom:40px}
${S} .sb-embed-link a{color:var(--sb-muted)}

/* rodapé (ctFooter) */
${S} .sb-ct-footer{margin:0;padding:0;border-top:1px solid #2a2a2a;background:none}
${S} .sb-ct-foot{display:grid;grid-template-columns:660fr 365fr 375fr;gap:0;padding:75px 0}
${S} .sb-ct-foot-brand{display:flex;flex-direction:column;align-items:flex-start;padding-left:min(164px,12%)}
${S} .sb-ct-foot-brand .sb-logo img{width:auto;height:160px}
${S} .sb-ct-foot-brand .sb-socials:empty{display:none}
${S} .sb-ct-foot h4{margin:0;padding:0 0 20px;font-size:19px;line-height:24.7px}
${S} .sb-ct-foot a,${S} .sb-ct-foot span{display:block;color:var(--mk-soft);font-size:15px;line-height:26px;transition:color .3s}
${S} .sb-ct-foot a:hover{color:var(--sb-accent)}
${S} .sb-ct-foot-bottom{padding:25px 0 35px;border-top:1px solid #2a2a2a;color:var(--sb-muted);text-align:center;width:100%!important}
${S} .sb-ct-foot-bottom span{font-size:15px}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
