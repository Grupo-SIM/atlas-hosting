/**
 * Variante "holofote" (`theme.variant = "holofote"`): portal de famosos e entretenimento, branco/preto/cinza,
 * medido no layout do hugogloss.uol.com.br (tema próprio com Bootstrap 4, sem Elementor); marca e notícias são
 * fictícias. Cabeçalho fixo (busca e redes no desktop; hambúrguer + menu lateral + busca deslizante abaixo de
 * 992px), barra de menu cinza, destaques 1+4, grade com borda preta e anúncios intercalados, lista com rolagem,
 * post em duas colunas, modal de compartilhar e rodapé em duas faixas. Tudo sob `.sb-hf`.
 *
 * Breakpoints do Bootstrap 4 (576/768/992/1200), com a regra de cada faixa repetida sob `.sb-narrow` (a media
 * query não enxerga o quadro do editor). No quadro estreito valem todas as regras de tela pequena (visual de
 * celular): o editor não separa tablet de celular nesta variante.
 */
export const isHolofote = (theme: Record<string, string>) =>
  theme.variant === "holofote";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens da variante (cores medidas no CSS do original). */
export function holofoteVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--hf-bar": safe(theme.bar, "#e1e1e1"),
    "--hf-btn": safe(theme.accent, "#282828"),
    "--hf-code": safe(theme.code, "#3a589b"),
    "--hf-date": safe(theme.date, "#707070"),
    "--hf-foot": safe(theme.foot, "#d0d0d0"),
    "--hf-gray": safe(theme.muted, "#656565"),
    "--hf-hover": safe(theme.hover, "#cccccc"),
    "--hf-page": safe(theme.page, "#f1f1f1"),
    "--hf-text": safe(theme.fg, "#282828"),
  };
}

const S = ".sb-hf";
const N = `${S}.sb-narrow`;
const SQ = ".hf-menu a::before,.hf-drawer a::before";

/** ≤ 1199 (lg). */
const lg = (x: string) => `
${x} .hf-feat{grid-template-columns:470px minmax(0,1fr);--hf-hb:300px;--hf-hs:150px}
${x} .hf-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .hf-card-img img{height:160px}
${x} .hf-twocol{grid-template-columns:minmax(0,8fr) minmax(0,4fr)}
${x} .hf-twocol-a .hf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .hf-twocol-b{height:850px}
${x} .hf-cols-in{grid-template-columns:640px 300px;max-width:960px}
${x} .hf-cols.results .hf-cols-in{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
${x} .hf-pimg{height:400px}
${x} .hf-in,${x} .sb-container{width:min(960px,100% - 30px)}
`;

/** ≤ 991 (md): hambúrguer, menu lateral, busca deslizante. */
const md = (x: string) => `
${x} .hf-bar{min-height:60px;overflow:hidden}
${x} .hf-menu,${x} .hf-sform,${x} .hf-header .hf-social{display:none}
${x} .hf-burger-btn,${x} .hf-lupa{display:flex}
${x} .hf-logo{flex:0 1 150px;height:40px}
${x} .hf-drawer,${x} .hf-veil{display:block}
${x} .hf-smobile{display:flex}
${x} .hf-feat{grid-template-columns:minmax(0,1fr);--hf-hb:300px;--hf-hs:180px}
${x} .hf-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .hf-card-img img{height:125px}
${x} .hf-twocol{grid-template-columns:minmax(0,1fr)}
${x} .hf-twocol-b{display:none}
${x} .hf-twocol-a .hf-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .hf-cols-in{grid-template-columns:minmax(0,1fr);max-width:720px;padding:15px}
${x} .hf-cols.results .hf-cols-in{grid-template-columns:minmax(0,1fr)}
${x} .hf-cols-b{margin-top:20px}
${x} .hf-side .hf-ad-sticky{position:static}
${x} .hf-pimg{height:330px}
${x} .hf-in,${x} .sb-container{width:min(720px,100% - 30px)}
${x} .hf-foot-cols{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .hf-foot-soc{grid-column:1/-1}
`;

/** ≤ 767 (sm). */
const sm = (x: string) => `
${x} .hf-fgrid{grid-template-columns:minmax(0,1fr);--hf-hs:300px}
${x} .hf-feat{--hf-hb:300px}
${x} .hf-grid,${x} .hf-twocol-a .hf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .hf-card-img img{height:140px}
${x} .hf-pmeta{flex-direction:column;align-items:center;text-align:center;gap:10px}
${x} .hf-shrow span{display:none}
${x} .hf-body-ad{float:none;margin:0 auto 30px;order:0}
${x} .hf-body{display:flex;flex-direction:column}
${x} .hf-body>p:first-of-type{order:-1}
${x} .hf-pimg{height:260px}
${x} .hf-list .hf-li h4{border-right:0;border-bottom:2px solid #000;padding-bottom:6px}
${x} .hf-adstrip .sb-ad{max-width:320px}
${x} .hf-adstrip .sb-ad-box{aspect-ratio:320/50}
${x} .hf-crow{flex-direction:column;gap:0}
${x} .hf-crow input{width:100%}
${x} .hf-foot-links a{font-size:.85em}
${x} .hf-foot-col li a{font-size:.85em}
${x} .hf-foot-soc svg{width:22px;height:22px}
${x} .hf-foot-bot-in{flex-direction:column;align-items:center;gap:6px;text-align:center}
${x} .hf-cols.results .hf-listbox{padding-bottom:0}
${x} .sb-post-nav{grid-template-columns:minmax(0,1fr);gap:60px}
${x} .sb-post-nav .sb-post-nav-next{text-align:left;justify-content:flex-start}
`;

/** ≤ 575 (xs). */
const xs = (x: string) => `
${x} .hf-feat{--hf-hb:200px}
${x} .hf-fgrid{--hf-hs:200px}
${x} .hf-grid,${x} .hf-twocol-a .hf-grid{grid-template-columns:minmax(0,1fr)}
${x} .hf-card-img img{height:200px}
${x} .hf-phead h1{font-size:1.4em}
${x} .hf-pimg{height:200px}
${x} .hf-in,${x} .sb-container{width:calc(100% - 30px)}
${x} .hf-foot-cols{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .hf-nf{flex-direction:column;align-items:flex-start;margin:3rem auto}
${x} .hf-nf-code{font-size:6em}
${x} .hf-more{margin:15px auto}
`;

export const holofoteCss = `
${S}{font-family:'Roboto',sans-serif;color:var(--hf-text);background:#fff;font-size:16px;line-height:1.5}
${S} main{padding:0!important}
${S} main:has(.hf-gray){background:var(--hf-page)}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5{font-family:'Roboto',sans-serif;font-weight:500;line-height:1.2;color:var(--hf-text);margin:0}
${S} .sb-text strong{color:inherit}
${S} .sb-container{width:min(1140px,100% - 30px);padding-block:0}
${S} .sb-text.sb-container{padding-block:3px}
${S} .hf-in{width:min(1140px,100% - 30px);margin:0 auto}
${S} .hf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} button{font-family:inherit}

/* anúncios nos tamanhos do original: 728×90, 300×250, 300×600 (no celular o banner vira 320×50) */
${S} .sb-ad{padding-block:0}
${S} .sb-ad-banner{max-width:728px;margin:0 auto}
${S} .sb-ad-banner .sb-ad-box{aspect-ratio:728/90;border-radius:0}
${S} .sb-ad-square{max-width:300px;margin:0 auto}
${S} .sb-ad-square .sb-ad-box{border-radius:0}
${S} .sb-ad-side{max-width:300px;margin:0 auto}
${S} .sb-ad-side .sb-ad-box{border-radius:0}
${S} .sb-ad-wrap{padding:10px 0}
${S} .hf-ad{margin:0 auto}
${S} .hf-ad-sticky{position:sticky;top:calc(var(--sb-sticky-top,0px) + 150px)}

/* cabeçalho fixo: o bloco gruda no topo (a coluna do editor desconta o recuo em --sb-sticky-top) */
${S}>.sb-block[data-block-type=hfHeader]{position:sticky;top:var(--sb-sticky-top,0px);z-index:1040}
${S} .hf-header{position:relative;background:#fff;box-shadow:0 0 5px rgba(0,0,0,.3);transition:all .3s}
${S} .hf-burger-input,${S} .hf-search-input{position:absolute;width:0;height:0;opacity:0;pointer-events:none}
${S} .hf-bar{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:55px;padding:5px 1rem;background:#fff;box-shadow:0 0 6px rgba(0,0,0,.2);transition:all .3s}
${S} .hf-logo{display:block;flex:0 0 185px;height:44px}
${S} .hf-logo img{width:100%;height:100%;object-fit:contain;object-position:left center}
${S} .hf-catname{display:none;margin:0 12px;color:#fff;font-size:.7em;text-transform:uppercase;white-space:nowrap}
${S} .hf-dark .hf-catname{display:inline-block}
${S} .hf-sform{position:relative;flex:0 0 35%;margin:0 auto}
${S} .hf-sform input,${S} .hf-smobile-form input{width:100%;height:36px;padding:0 45px 0 10px;border:1px solid var(--hf-gray);border-radius:4px;background:#fff;color:var(--hf-text);font:inherit;font-size:.9em;outline:0}
${S} .hf-sform input::placeholder{color:var(--hf-date);opacity:1}
${S} .hf-sform button{position:absolute;top:0;right:0;display:flex;align-items:center;justify-content:center;width:40px;height:35px;padding:0;border:0;background:none;color:var(--hf-gray);cursor:pointer}
${S} .hf-sform button svg{width:18px;height:18px}
${S} .hf-social{display:flex;align-items:center}
${S} .hf-social a{display:flex;align-items:center;height:35px;padding:5px;margin:0 5px;color:var(--hf-text);transition:opacity .2s}
${S} .hf-social a:hover{opacity:.5}
${S} .hf-social svg{width:20px;height:20px}
${S} .hf-burger-btn,${S} .hf-lupa{display:none;align-items:center;justify-content:center;color:#000;cursor:pointer}
${S} .hf-burger-btn svg{width:28px;height:28px}
${S} .hf-lupa svg{width:24px;height:24px}
${S} .hf-dark .hf-bar{background:#000}
${S} .hf-dark .hf-social a,${S} .hf-dark .hf-burger-btn,${S} .hf-dark .hf-lupa{color:#fff}
${S} .hf-smobile{position:absolute;inset:0;z-index:2;display:none;align-items:center;background:#282828;transform:translateX(-110%);transition:transform .5s ease-in-out}
${S} .hf-search-input:checked~.hf-bar .hf-smobile{transform:none}
${S} .hf-smobile-form{flex:1}
${S} .hf-smobile-form input{height:60px;border:0;border-radius:0;background:transparent;color:#fff;padding:0 15px}
${S} .hf-smobile-form input::placeholder{color:#fff;opacity:1}
${S} .hf-smobile-x{display:flex;align-items:center;justify-content:center;width:45px;height:50px;color:#fff;font-size:30px;line-height:1;cursor:pointer}

/* barra do menu (desktop) e menu lateral (<992px) */
${S} .hf-menu{height:35px;background:var(--hf-bar)}
${S} .hf-menu ul,${S} .hf-drawer ul{display:flex;height:100%;margin:0;padding:0;list-style:none}
${S} .hf-menu li{width:100%}
${S} .hf-menu a{display:flex;align-items:center;justify-content:center;height:100%;color:var(--hf-gray);font-size:.65em;text-transform:uppercase;transition:background .2s}
${S} ${SQ}{content:"";display:inline-block;flex:none;width:12px;height:12px;margin-right:5px;border:1px solid var(--hf-gray)}
${S} .hf-menu a[aria-current=page]::before,${S} .hf-drawer a[aria-current=page]::before{background:radial-gradient(circle,var(--hf-gray) 0 2px,transparent 2.5px)}
${S} .hf-menu a:hover,${S} .hf-drawer a:hover{background:var(--hf-hover)}
${S} .hf-veil{position:fixed;inset:0;z-index:1050;display:none;background:rgba(0,0,0,.4);opacity:0;visibility:hidden;transition:opacity .2s,visibility 0s .2s}
${S} .hf-drawer{position:fixed;top:0;bottom:0;left:0;z-index:1060;display:none;width:80%;max-width:400px;overflow-y:auto;background:#fff;transform:translateX(-100%);visibility:hidden;transition:transform .3s ease-in-out,visibility 0s .3s}
${S} .hf-burger-input:checked~.hf-veil{opacity:1;visibility:visible;transition-delay:0s}
${S} .hf-burger-input:checked~.hf-drawer{transform:none;visibility:visible;transition-delay:0s}
${S} .hf-drawer-logo{display:flex;justify-content:center;border-bottom:1px solid var(--hf-gray)}
${S} .hf-drawer-logo img{width:auto;height:50px;margin:10px}
${S} .hf-drawer ul{display:block}
${S} .hf-drawer li{border-bottom:1px solid rgba(0,0,0,.1)}
${S} .hf-drawer a{display:flex;align-items:center;padding:8px 15px;color:var(--hf-gray);font-size:1em;text-transform:uppercase}
html:has(.hf-burger-input:checked){overflow:hidden}
${S} .hf-adstrip{padding:5px 0;background:var(--hf-page);box-shadow:0 0 5px rgba(0,0,0,.3);text-align:center}
${S} .hf-adstrip:not(:has(.sb-ad)){display:none}

/* destaques 1 + 4 */
${S} .hf-feat{--hf-hb:400px;--hf-hs:200px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:5px;margin:5px 0;padding:0 15px}
${S} .hf-fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:var(--hf-hs);gap:5px}
${S} .hf-fbig{height:var(--hf-hb)}
${S} .hf-fcard{position:relative;display:block;overflow:hidden;background:#000;min-height:0}
${S} .hf-fcard img,${S} .hf-fcard .sb-img-empty{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 20%}
${S} .hf-fcap{position:absolute;right:0;bottom:0;left:0;z-index:1;display:block;padding:5px 10px;background:linear-gradient(180deg,transparent 0,#000);color:#fff}
${S} .hf-tag{display:inline-block;padding:2px 5px;background:#000;color:#fff;font-size:.7em;text-transform:uppercase}
${S} .hf-fcap strong{display:block;margin-top:10px;color:#fff;font-size:.9em;font-weight:400;line-height:1.3;text-shadow:0 1px 3px rgba(0,0,0,.6)}
${S} .hf-feat.veil .hf-fcard::after{content:"";position:absolute;inset:0;background:#000;opacity:0;transition:opacity .3s;pointer-events:none}
${S} .hf-feat.veil .hf-fcard:hover::after{opacity:.2}

/* Últimas Notícias */
${S} .hf-sec{padding:0 15px}
${S} .hf-h2{margin:20px 0 10px;text-align:center;font-size:1.3em;font-style:italic}
${S} .hf-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${S} .hf-card{min-width:0;border-bottom:2px solid #000;transition:all .3s}
${S} .hf-card-img{display:block}
${S} .hf-card-img img,${S} .hf-card-img .sb-img-empty{width:100%;height:150px;min-height:0;object-fit:cover;object-position:50% 20%}
${S} .hf-card-meta{display:flex;align-items:center;justify-content:space-between;height:35px}
${S} .hf-ago{color:var(--hf-date);font-size:.7em}
${S} .hf-share{display:flex;width:13px;height:13px;padding:0;border:0;background:none;color:var(--hf-date);cursor:pointer;transition:opacity .3s}
${S} .hf-share:hover{opacity:.5}
${S} .hf-share svg{width:13px;height:13px}
${S} .hf-card-title{margin:0;padding:10px 0;font-size:.9em;font-weight:400;line-height:1.3}
${S} .hf-card-title a{color:var(--hf-text)}
${S} .hf-adcell{display:flex;align-items:flex-start;justify-content:center;min-width:0}
${S} .hf-adcell .hf-ad{width:100%}
${S} .hf-adcell[hidden],${S} .hf-card[hidden]{display:none}
${S} .hf-more{display:block;width:150px;height:40px;margin:15px auto;border:0;border-radius:5px;background:var(--hf-btn);color:#fff;font-size:.7em;font-weight:300;text-transform:uppercase;cursor:pointer;transition:opacity .3s}
${S} .hf-more:hover{opacity:.9}

/* categoria: grade + lista com rolagem própria */
${S} .hf-twocol{display:grid;grid-template-columns:minmax(0,9fr) minmax(0,3fr);gap:15px}
${S} .hf-twocol-a .hf-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${S} .hf-twocol-b{height:550px;overflow-y:scroll;scrollbar-width:thin;scrollbar-color:#aaa #fff}
${S} .hf-twocol-b::-webkit-scrollbar{width:5px}
${S} .hf-twocol-b::-webkit-scrollbar-track{background:#fff}
${S} .hf-twocol-b::-webkit-scrollbar-thumb{background:#aaa}

/* lista compacta (barra lateral, tag, busca) */
${S} .hf-li{display:grid;grid-template-columns:90px minmax(0,1fr);gap:15px;padding:15px 0;border-bottom:1px solid rgba(0,0,0,.1)}
${S} .hf-li:last-child{border-bottom:0}
${S} .hf-li-img img,${S} .hf-li-img .sb-img-empty{width:90px;height:90px;min-height:0;aspect-ratio:1;object-fit:cover}
${S} .hf-li .hf-card-meta{height:25px}
${S} .hf-li h4{margin:0;padding-right:10px;border-right:2px solid #000;font-size:.8em;font-weight:400;line-height:1.3}
${S} .hf-li h4 a{color:var(--hf-text)}
${S} .hf-side-title{margin:0 0 10px;font-size:1.5em;font-weight:400}
${S} .hf-listbox.box{margin-bottom:20px;padding:15px 15px 0;background:#fff}

/* duas colunas (post, tag, busca) */
${S} .hf-cols-in{display:grid;grid-template-columns:820px 300px;gap:20px;max-width:1140px;margin:0 auto;padding:15px 0}
${S} .hf-cols.results .hf-cols-in{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
${S} .hf-cols-a,${S} .hf-cols-b{min-width:0}
${S} .hf-cols-b{align-self:stretch}
${S} .hf-cols-b>.sb-block{height:100%}
${S} .hf-side{display:flex;flex-direction:column;gap:20px;height:100%}
${S} .hf-side .hf-ad-sticky{align-self:center;width:100%}
${S} .hf-stack{display:flex;flex-direction:column;gap:var(--hf-gap,0)}

/* post */
${S} .hf-pcat{display:inline-block;margin-bottom:15px;padding:4px 8px 2px;background:#000;color:#fff;font-size:.85em;text-transform:uppercase}
${S} .hf-phead h1{margin:10px 0 20px;color:var(--hf-text);font-size:1.8em;line-height:1.1em}
${S} .hf-pline{margin:0 0 20px;font-size:16px}
${S} .hf-pmeta{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:15px}
${S} .hf-pmeta strong{display:block;font-size:.7em;font-weight:600}
${S} .hf-pmeta span{display:block;font-size:.7em}
${S} .hf-shrow{display:flex;align-items:center;gap:8px}
${S} .hf-shrow>div{display:flex;gap:8px}
${S} .hf-shrow span{font-size:.7em}
${S} .hf-shrow button{display:flex;width:22px;height:22px;padding:0;border:0;background:none;color:var(--hf-text);cursor:pointer;transition:opacity .2s}
${S} .hf-shrow button:hover{opacity:.5}
${S} .hf-shrow svg{width:22px;height:22px}
${S} .hf-pimg{width:100%;height:480px;margin-bottom:20px;object-fit:cover;object-position:50% 20%}
${S} .hf-resume{margin-bottom:30px;padding:15px;border:1px solid #ccc;background:#fff}
${S} .hf-resume summary{display:flex;align-items:center;justify-content:space-between;color:#000;font-size:18px;font-weight:600;list-style:none;cursor:pointer}
${S} .hf-resume summary::-webkit-details-marker{display:none}
${S} .hf-resume summary::after{content:"";width:8px;height:8px;margin-right:4px;border:solid #000;border-width:0 2px 2px 0;transform:rotate(45deg);transition:transform .3s}
${S} .hf-resume[open] summary::after{transform:rotate(-135deg)}
${S} .hf-resume ul{margin:15px 0 0;padding:0;list-style:none}
${S} .hf-resume li{position:relative;margin-bottom:8px;padding-left:20px}
${S} .hf-resume li::before{content:"";position:absolute;top:.5em;left:0;width:8px;height:8px;border-radius:50%;background:#000}
${S} .hf-body{font-size:16px;line-height:1.6}
${S} .hf-body::after{content:"";display:block;clear:both}
${S} .hf-body p{margin:0 0 1.2em}
${S} .hf-body a{padding-bottom:2px;border-bottom:1px solid #000;color:#000}
${S} .hf-body img{max-width:100%;margin:30px auto}
${S} .hf-body-ad{float:left;width:300px;max-width:100%;margin:0 60px 30px 0}
${S} .hf-midad{position:relative;clear:both;margin:30px 0;padding:30px 0;border-top:1px solid #e1dee4;border-bottom:1px solid #e1dee4}
${S} .hf-midad>span{position:absolute;top:0;left:50%;padding:0 10px;background:var(--hf-page);font-size:10px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;transform:translate(-50%,-50%)}
${S} .hf-also{margin:20px 0;padding:15px;background:#fff}
${S} .hf-also strong{display:block;margin-bottom:8px;font-size:18px;font-weight:700}
${S} .hf-also ul{margin:0;padding-left:18px}
${S} .hf-also a{color:#000}
${S} .hf-follow{display:block;width:100%;margin:20px 0;padding:12px 15px;border:1px solid #212529;color:#212529;text-align:center;transition:opacity .3s}
${S} .hf-follow:hover{opacity:.6}
${S} .hf-tags{margin:20px 0}
${S} .hf-tags span{color:var(--hf-gray);font-size:.8em}
${S} .hf-tags a{display:inline-block;margin:3px;padding:2px 5px;border:1px solid #ccc;background:#e4e4e4;color:var(--hf-gray);font-size:.8em;transition:opacity .2s}
${S} .hf-tags a:hover{opacity:.7}
${S} .sb-post-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:80px;width:auto;margin:40px 0;padding:40px 0;border-top:1px solid rgba(0,0,0,.1);border-bottom:1px solid rgba(0,0,0,.1)}
${S} .sb-post-nav i{display:none}
${S} .sb-post-nav small{color:var(--hf-date);font-size:.7em;text-transform:uppercase}
${S} .sb-post-nav b{color:var(--hf-text);font-size:.9em;font-weight:600}
${S} .sb-post-nav .sb-post-nav-next{justify-content:flex-end;text-align:right}

/* resultados, newsletter, páginas de texto, contato */
${S} .hf-rhead{margin:20px 0;font-size:1.3em;font-weight:400;text-align:left;text-transform:uppercase}
${S} .hf-rhead b{margin-left:5px;padding:2px 6px;background:var(--hf-btn);color:#fff;font-weight:400}
${S} .hf-news{padding:15px;background:#fff}
${S} .hf-news h3{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:1.3em;font-style:italic}
${S} .hf-news h3 svg{width:24px;height:24px}
${S} .hf-news p{margin:0 0 12px;font-size:.9em}
${S} .hf-news form{position:relative}
${S} .hf-news input{width:100%;height:40px;padding:0 100px 0 10px;border:1px solid rgba(0,0,0,.2);font:inherit;font-size:.9em;outline:0}
${S} .hf-news button{position:absolute;top:5px;right:5px;height:30px;padding:0 12px;border:0;border-radius:5px;background:var(--hf-btn);color:#fff;font-size:.65em;text-transform:uppercase;cursor:pointer}
${S} .hf-news button:disabled,${S} .hf-contact button:disabled{opacity:.6;cursor:not-allowed}
${S} .hf-note{display:block;margin-top:8px;color:var(--hf-date);font-size:.75em}
${S} .hf-ptitle{width:min(1140px,100% - 30px);margin:30px auto 20px}
${S} .hf-ptitle h1{font-size:2em}
${S} .hf-ptitle hr{margin:1rem 0;border:0;border-top:1px solid rgba(0,0,0,.1)}
${S} .hf-contact{width:min(1140px,100% - 30px);margin:0 auto 40px}
${S} .hf-crow{display:flex;justify-content:space-between;gap:2%}
${S} .hf-crow input{width:49%}
${S} .hf-contact input,${S} .hf-contact textarea{display:block;width:100%;margin-bottom:12px;padding:10px;border:1px solid rgba(0,0,0,.2);border-radius:0;background:#fff;box-shadow:none;font:inherit;outline:0}
${S} .hf-contact button{display:block;width:180px;height:40px;margin:15px 0;border:0;border-radius:5px;background:var(--hf-btn);color:#fff;font-size:.7em;font-weight:300;text-transform:uppercase;cursor:pointer;transition:opacity .3s}
${S} .hf-contact button:not(:disabled):hover{opacity:.9}
${S} .hf-cfall{font-size:.8em}
${S} .hf-cfall a{color:var(--hf-btn);font-weight:500}
${S} .hf-cfall a:hover{text-decoration:underline}

/* 404 */
${S} .hf-nf{display:flex;align-items:center;justify-content:space-between;gap:20px;width:min(1140px,100% - 30px);margin:6rem auto}
${S} .hf-nf h1{margin:0 0 .5rem;font-size:2.2em;font-style:italic}
${S} .hf-nf p{margin:0}
${S} .hf-nf-code{color:var(--hf-code);font-size:10em;font-weight:500;line-height:1}
${S} .hf-btn{display:inline-block;margin-top:20px;padding:12px 20px;border-radius:5px;background:var(--hf-btn);color:#fff;font-size:.7em;text-transform:uppercase;transition:opacity .3s}
${S} .hf-btn:hover{opacity:.9}

/* rodapé e modal de compartilhar */
${S} .hf-foot-top{padding:30px 0;background:var(--hf-bar)}
${S} .hf-foot-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}
${S} .hf-foot-col h4{margin:0 0 10px;font-size:.9em;font-weight:400}
${S} .hf-foot-col ul{margin:0;padding:0;list-style:none}
${S} .hf-foot-col li{margin-bottom:6px}
${S} .hf-foot-col li a{color:var(--hf-text);font-size:.75em}
${S} .hf-foot-col li a:hover{text-decoration:underline}
${S} .hf-foot-soc .hf-social{margin-bottom:6px}
${S} .hf-foot-soc .hf-social a{margin:0 5px 0 0;color:#212529}
${S} .hf-foot-soc svg{width:18px;height:18px}
${S} .hf-foot-bot{padding:15px 0;background:var(--hf-foot)}
${S} .hf-foot-bot-in{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--hf-gray);font-size:.65em}
${S} .hf-modal{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);opacity:0;transition:opacity .15s linear}
${S} .hf-modal[hidden]{display:none}
${S} .hf-modal.on{opacity:1}
${S} .hf-modal-box{position:relative;width:min(500px,100% - 20px);padding:1rem;border-radius:.3rem;background:#fff;text-align:center;transform:translate(0,-50px);transition:transform .3s ease-out}
${S} .hf-modal.on .hf-modal-box{transform:none}
${S} .hf-modal-title{margin:0 25px 10px;color:var(--hf-text);font-size:.9em;font-weight:500;text-align:center}
${S} .hf-modal-x{position:absolute;top:6px;right:12px;padding:0;border:0;background:none;color:#000;font-size:26px;line-height:1;opacity:.5;cursor:pointer}
${S} .hf-modal-x:hover{opacity:.8}
${S} .hf-modal-box p{margin:0 0 12px;color:var(--hf-date);font-size:.8em}
${S} .hf-nets{display:flex;justify-content:center;gap:8px}
${S} .hf-net{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:5px;color:#fff;transition:opacity .2s}
${S} .hf-nets a:hover .hf-net{opacity:.85}
${S} .hf-net svg{width:16px;height:16px}

@media (prefers-reduced-motion:reduce){${S} *{transition:none!important;scroll-behavior:auto!important}}
@media (max-width:1199px){${lg(S)}}
@media (max-width:991px){${md(S)}}
@media (max-width:767px){${sm(S)}}
@media (max-width:575px){${xs(S)}}
${lg(N)}${md(N)}${sm(N)}${xs(N)}
`;
