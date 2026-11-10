/**
 * Variante "seguidores" (`theme.variant = "seguidores"`): blog de marketing claro com roxo `#6F4CCE`, marca-texto
 * amarelo-limão e cabeçalho que some ao rolar, medida no seguidoresemalta.com (WordPress + Elementor). Tudo fica sob
 * `.sb-sg`, então as outras variantes não mudam.
 *
 * Breakpoints do original: tablet ≤ 1024 e celular ≤ 767. O preview estreito do editor (`.sb-narrow`) não enxerga
 * media query, então cada regra de tela pequena existe duas vezes. Inventário: `plans/seguidoresemalta-inventario.md`.
 */
export const isSeguidores = (theme: Record<string, string>) =>
  theme.variant === "seguidores";

/** Fontes que a variante usa fora do tema (cards, banners, menu, post); fixas, nunca texto do usuário. */
export const SEGUIDORES_EXTRA_FONTS = ["Nunito", "Roboto", "Poppins"] as const;

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: marca-texto, fundo lilás, títulos, roxos de hover e resumo dos cards. */
export function seguidoresVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--sg-active": safe(theme.active, "#6617ff"),
    "--sg-blue": safe(theme.blue, "#2962ff"),
    "--sg-lime": safe(theme.lime, "#ebfe00"),
    "--sg-soft": safe(theme.soft, "#f7f4ff"),
    "--sg-sum": safe(theme.summary, "#2c495f"),
    "--sg-title": safe(theme.title, "#000000"),
    "--sg-violet": safe(theme.violet, "#8261db"),
  };
}

const S = ".sb-sg";

const tablet = (x: string) => `
${x} .sg-h,${x} .sg-heading h1,${x} .sg-heading h2,${x} .sg-heading h3{font-size:50px}
${x} .sg-sec{padding:70px 30px}
${x} .sg-head-in{padding:18px 30px 19px}
${x} .sg-logo{width:30%}
${x} .sg-burger{display:flex}
${x} .sg-nav{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;padding:0;background:#fff}
${x} .sg-nav a{display:block;padding:12px 0;font-size:15px;text-align:center}
${x} .sg-nav a:hover{background:#fff}
${x} .sg-head>.sb-burger-input:checked~.sg-head-in .sg-nav{display:flex}
${x} .sg-hero-in{flex-direction:column;padding:100px 30px 0}
${x} .sg-hero-copy{width:100%;padding-bottom:70px;align-items:center;text-align:center}
${x} .sg-hero h1{font-size:50px}
${x} .sg-hero-text{width:701px;max-width:100%;margin:0 auto;font-size:14px}
${x} .sg-hero-art{width:80%;align-self:center;margin:0 0 160px}
${x} .sg-grid.c3,${x} .sg-grid.c4{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sg-sc-title{font-size:22px;line-height:26px}
${x} .sg-posts.side .sg-posts-in{display:block}
${x} .sg-posts.side .sg-posts-copy{padding:0 0 70px;text-align:center}
${x} .sg-posts.side .sg-posts-cta{text-align:center;margin-top:30px}
${x} .sg-counters-in{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sg-products-in{grid-template-columns:minmax(0,1fr)}
${x} .sg-pcol.right{padding:30px 0 0}
${x} .sg-pcol.left{padding-right:0}
${x} .sg-social-in{flex-direction:column}
${x} .sg-social-in>*{width:100%}
${x} .sg-social-copy{padding:30px 0 0;text-align:center}
${x} .sg-comm-in{flex-direction:column-reverse}
${x} .sg-comm-in>*{width:100%}
${x} .sg-comm-copy{padding:0 0 70px;text-align:center}
${x} .sg-comm-copy p{margin-left:70px;margin-right:70px}
${x} .sg-comm-art img{width:55%}
${x} .sg-t{flex-basis:100%}
${x} .sg-blogs-sec{padding:70px 40px}
${x} .sg-blog{flex-basis:calc((100% - 30px)/2)}
${x} .sg-ccards-in{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sg-banner-title h1{font-size:55px}
${x} .sg-banner-box{background-position:0 -120px}
${x} .sg-foot-cols{flex-wrap:wrap;padding:0 30px}
${x} .sg-foot-cols>*{width:100%}
${x} .sg-foot-cols>.c2{width:35%}
${x} .sg-foot-cols>.c3{width:40%}
${x} .sg-foot-cols>.c4{width:25%}
${x} .sg-foot-cta{padding:50px;margin-left:30px;margin-right:30px}
${x} .sg-foot-dark{padding-top:230px}
${x} .sg-post{grid-template-columns:minmax(0,1fr)}
${x} .sg-post-cover{height:470px}
${x} .sg-post-cat{font-size:14px}
${x} .sg-post-content{font-size:14px}
`;

const mobile = (x: string) => `
${x} .sg-h,${x} .sg-heading h1,${x} .sg-heading h2,${x} .sg-heading h3{font-size:45px}
${x} .sg-sec{padding:70px 20px}
${x} .sg-head-in{padding:12px 20px}
${x} .sg-logo{width:65%}
${x} .sg-hero-in{padding:100px 20px 0}
${x} .sg-hero h1{font-size:37px}
${x} .sg-hero-text{width:321px}
${x} .sg-hero-btn .sg-btn{width:316px;max-width:100%}
${x} .sg-hero-art{width:100%}
${x} .sg-grid.c1,${x} .sg-grid.c2,${x} .sg-grid.c3,${x} .sg-grid.c4{grid-template-columns:minmax(0,1fr)}
${x} .sg-counters-in{grid-template-columns:minmax(0,1fr)}
${x} .sg-counter{padding-bottom:50px}
${x} .sg-pcard{padding-top:200px}
${x} .sg-pcard-btn{justify-content:flex-start}
${x} .sg-social-copy{order:-1;padding:0 0 70px}
${x} .sg-collage{order:2}
${x} .sg-blogs-sec{padding:70px 20px 70px}
${x} .sg-blog{flex-basis:100%}
${x} .sg-ccards-in{grid-template-columns:minmax(0,1fr);width:100%}
${x} .sg-banner-box{padding:1em;background-position:0 0}
${x} .sg-banner-title{width:100%;padding:1em}
${x} .sg-banner-title h1{font-size:45px}
${x} .sg-search h2{font-size:30px}
${x} .sg-search-row{flex-direction:column;align-items:stretch}
${x} .sg-foot-cols>*,${x} .sg-foot-cols>.c2,${x} .sg-foot-cols>.c3,${x} .sg-foot-cols>.c4{width:100%;text-align:center;margin-bottom:50px}
${x} .sg-foot-social{justify-content:center}
${x} .sg-foot-cta{padding:50px 30px;margin-left:20px;margin-right:20px}
${x} .sg-foot-cta p{width:100%}
${x} .sg-foot-dark{padding:230px 20px 0}
${x} .sg-foot-bar{flex-direction:column-reverse;gap:10px;text-align:center}
${x} .sg-post-cover{height:250px}
${x} .sg-post-title{font-size:23px;margin:12% 0}
${x} .sg-post-main{padding:15px}
${x} .sg-cat-bar{display:none}
`;

export const seguidoresCss = `
${S}{font-family:var(--sb-font-body);font-size:14px;font-weight:500;line-height:1.8em;color:var(--sb-fg)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} p{margin:0}
${S} img{max-width:100%}
${S} .sg-wrap{width:100%;max-width:1200px;margin:0 auto}
${S} .sg-sec{padding:100px 20px}
${S} .sg-soft{background:var(--sg-soft)}
${S} .sg-h,${S} .sg-heading h1,${S} .sg-heading h2,${S} .sg-heading h3{font-family:var(--sb-font-heading);font-size:58px;font-weight:700;line-height:1.3em;color:var(--sg-title)}
${S} .sg-hl{padding:0 .12em;background:var(--sg-lime);color:#000;box-decoration-break:clone;-webkit-box-decoration-break:clone}
${S} .sg-heading.center{text-align:center}
${S} .sg-heading.white h1,${S} .sg-heading.white h2,${S} .sg-heading.white h3{color:#fff}
${S} .sg-lead{font-size:18px;font-weight:500;line-height:1.8em}
${S} .sg-btn{display:inline-block;padding:15px 30px;border:0;border-radius:30px;background:#000;color:#fff!important;font-family:var(--sb-font-heading);font-size:15px;font-weight:600;line-height:1.2;text-align:center;cursor:pointer;transition:background-color .3s,color .3s}
${S} .sg-btn:hover{background:var(--sb-accent)}
${S} .sg-btn.white{background:#fff;color:#000!important}
${S} .sg-btn.white:hover{background:var(--sb-accent);color:#fff!important}
${S} .sb-lottie{display:block;width:100%;min-height:1px}
${S} .sb-lottie svg{display:block;width:100%;height:100%}
${S} .sb-lottie-ph{display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:80px;border:2px dashed var(--sb-accent);border-radius:12px;color:var(--sb-accent);font-size:13px;text-align:center}

${S}>.sb-block[data-block-type=sgHeader]{position:sticky;top:var(--sb-sticky-top,0px);z-index:60;height:0}
${S} .sg-head{position:absolute;top:0;left:0;right:0;background:transparent;transition:transform .35s ease,background-color .3s ease}
${S} .sg-head.is-scrolled{background:#fff}
${S} .sg-head.is-hidden{transform:translateY(-100%)}
${S} .sg-head-in{display:flex;align-items:stretch;justify-content:space-between;gap:10px;width:100%;max-width:1200px;margin:0 auto;padding:10px 0 15px}
${S} .sg-logo{width:20%;margin-top:10px;text-align:center}
${S} .sg-logo a{display:block}
${S} .sg-logo img{display:block;width:auto;max-width:100%;max-height:72px;margin:0 auto}
${S} .sg-nav{display:flex;flex-wrap:wrap;align-self:flex-end;justify-content:flex-end;gap:4px 14px;font-family:'Roboto',sans-serif;font-size:16px;font-weight:600;line-height:1.5}
${S} .sg-nav a{color:#000;transition:color .3s}
${S} .sg-nav a:hover,${S} .sg-nav a:focus{color:var(--sb-accent)}
${S} .sg-nav a[aria-current=page]{color:var(--sg-active)}
${S} .sg-burger{display:none;align-self:center;flex-direction:column;justify-content:center;gap:5px;width:28px;height:28px;cursor:pointer}
${S} .sg-burger i{display:block;height:3px;background:#000;border-radius:2px}

${S} .sg-hero{position:relative;background:var(--sg-soft)}
${S} .sg-hero::before{content:"";position:absolute;inset:0;background:var(--sg-ov,none) bottom right/cover no-repeat}
${S} .sg-hero-in{position:relative;display:flex;max-width:1200px;margin:0 auto;padding:150px 0}
${S} .sg-hero-copy{display:flex;flex-direction:column;justify-content:flex-end;width:60%}
${S} .sg-hero h1{margin-top:-20px;font-family:var(--sb-font-heading);font-size:60px;font-weight:700;line-height:1.3em;color:var(--sg-title)}
${S} .sg-hero-text{margin:0 200px 0 0;font-size:18px;line-height:1.8em}
${S} .sg-hero-btn{margin-top:20px}
${S} .sg-hero-art{position:relative;display:flex;flex-direction:column;width:40%}
${S} .sg-hero-art>.sb-lottie:first-child{position:relative;z-index:10;margin:-80px 0 -100px}
${S} .sg-hero-art>.sb-lottie:last-child{position:relative;z-index:10;width:auto;margin:-170px -50px -65px 240px}
${S} .sg-hero-photo{position:relative;z-index:5;display:block;width:100%;margin:-10px 0 -105px;border-radius:48px}

${S} .sg-posts-head{text-align:center}
${S} .sg-posts-copy .sg-lead{margin:0 0 30px}
${S} .sg-posts-in{display:flex;flex-direction:column;max-width:1200px;margin:0 auto}
${S} .sg-posts-cta{margin-top:40px;text-align:center}
${S} .sg-posts.side .sg-posts-in{display:grid;grid-template-columns:55% 45%;grid-template-areas:"grid copy" "grid cta"}
${S} .sg-posts.side .sg-grid-wrap{grid-area:grid;padding-right:30px}
${S} .sg-posts.side .sg-posts-copy{grid-area:copy;align-self:end;padding-left:70px;text-align:left}
${S} .sg-posts.side .sg-posts-cta{grid-area:cta;align-self:start;padding-left:70px;margin-top:0;text-align:left}
${S} .sg-posts.center-title .sg-posts-copy{max-width:700px;margin:0 auto 50px}
${S} .sg-grid{display:grid;gap:30px}
${S} .sg-grid.c1{grid-template-columns:minmax(0,1fr)}
${S} .sg-grid.c2{grid-template-columns:repeat(2,minmax(0,1fr))}
${S} .sg-grid.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
${S} .sg-grid.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
${S} .sg-card{display:flex;flex-direction:column;min-width:0;border-radius:10px;font-family:'Nunito',sans-serif}
${S} .sg-thumb{position:relative;display:block;margin-bottom:10px;overflow:hidden;border-radius:10px}
${S} .sg-thumb img,${S} .sg-thumb .sb-img-empty{display:block;width:100%;height:200px;border-radius:10px;object-fit:cover;transition:transform .5s ease}
${S} .sg-card:hover .sg-thumb img{transform:scale(1.04)}
${S} .sg-cbody{display:flex;flex:1;flex-direction:column;align-items:flex-start;gap:8px}
${S} .sg-sc-title{font-size:18px;font-weight:700;line-height:120%;color:#000}
${S} .sg-sc-title a{color:inherit;transition:color .3s}
${S} .sg-sc-title a:hover{color:var(--sb-accent)}
${S} .sg-sum{font-size:16px;font-weight:500;line-height:1.5;color:var(--sg-sum)}
${S} .sg-cat{font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--sb-accent)}
${S} .sg-more-link{font-size:16px;font-weight:500;color:var(--sb-accent)!important}
${S} .sg-l-side .sg-sc-title{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
${S} .sg-l-dark{padding:15px;background:var(--sb-accent)}
${S} .sg-l-dark .sg-sc-title,${S} .sg-l-dark .sg-sum{color:var(--sg-soft)}
${S} .sg-l-dark .sg-sc-title a:hover{color:var(--sg-lime)}
${S} .sg-l-dark .sg-more-link{padding:5px 40px;border:1px solid transparent;border-radius:30px;background:var(--sg-lime);color:var(--sb-accent)!important;transition:border-color .3s}
${S} .sg-l-dark .sg-more-link:hover{border-color:#7a64f2}
${S} .sg-l-list .sg-more-link,${S} .sg-l-archive .sg-pill{padding:10px 40px;border-radius:30px;background:var(--sb-accent);color:var(--sg-soft)!important;transition:background-color .3s}
${S} .sg-l-list .sg-more-link:hover{background:var(--sg-violet)}
${S} .sg-l-archive .sg-badge{position:absolute;left:12px;top:12px;padding:2px 12px;border-radius:30px;background:var(--sb-accent);color:#fff;font-size:13px;font-weight:700}
${S} .sg-l-archive .sg-more-link{font-weight:700}
${S} .sg-more{display:none;margin:40px auto 0}
${S}.sb-js .sg-more{display:block}
${S}.sb-js [data-sg-hide]{display:none}
${S} .sg-empty{padding:40px 0;text-align:center}

${S} .sg-counters-in{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));max-width:1200px;margin:0 auto}
${S} .sg-counter{text-align:center}
${S} .sg-num{display:block;font-family:var(--sb-font-heading);font-size:58px;font-weight:700;line-height:.8em;color:#000}
${S} .sg-ctitle{margin-top:20px;font-size:15px;font-weight:600;color:var(--sb-accent)}

${S} .sg-products-in{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));max-width:1200px;margin:0 auto}
${S} .sg-pcol{display:flex;flex-direction:column;gap:30px}
${S} .sg-pcol.left{justify-content:flex-end;padding-right:15px}
${S} .sg-pcol.right{padding-left:15px}
${S} .sg-pcol.left h2{margin-right:100px}
${S} .sg-pcol.left>.sg-lead{font-size:19px}
${S} .sg-pcard.first{margin-top:40px}
${S} .sg-pcard{position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:300px 30px 35px;overflow:hidden;border-radius:30px;background:var(--sg-img,#000) center/cover no-repeat}
${S} .sg-pcard::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,#000 100%);opacity:.8}
${S} .sg-pcard-btn{position:relative;display:flex;justify-content:flex-end}

${S} .sg-social-in{display:flex;align-items:center;max-width:1200px;margin:0 auto}
${S} .sg-collage{position:relative;display:grid;grid-template-columns:60% 40%;width:50%;padding:20px 0;background:#fff}
${S} .sg-collage::before{content:"";position:absolute;inset:0;background:var(--sg-ov,none) center/cover no-repeat;opacity:.1}
${S} .sg-collage a{position:relative;display:block}
${S} .sg-collage img{display:block;width:100%;transition:transform .3s ease}
${S} .sg-collage a:hover img{transform:scale(1.1)}
${S} .sg-collage a:nth-child(1){justify-self:end;width:80%;padding:30px 0 0}
${S} .sg-collage a:nth-child(2){justify-self:start;width:90%;padding:20px 0 0}
${S} .sg-collage a:nth-child(3){justify-self:center;width:77%}
${S} .sg-collage a:nth-child(4){justify-self:start;width:87%;margin-top:-30px;padding-left:10px}
${S} .sg-social-copy{width:50%;padding-left:70px}
${S} .sg-social-copy .sg-lead{margin-top:20px}

${S} .sg-comm-in{display:flex;align-items:center;max-width:1200px;margin:0 auto}
${S} .sg-comm-art{position:relative;width:55%;text-align:center;background:var(--sg-ov,none) center/cover no-repeat}
${S} .sg-comm-art img{width:85%;transition:transform .3s ease}
${S} .sg-comm-art:hover img{transform:translateY(-8px)}
${S} .sg-comm-copy{width:45%;padding-left:70px}
${S} .sg-comm-copy p{margin:20px 0 30px;font-size:18px}

${S} .sg-reviews{position:relative;padding:100px 30px;background:var(--sg-img,#6f4cce) center/cover no-repeat}
${S} .sg-reviews::before{content:"";position:absolute;inset:0;background:var(--sb-accent);opacity:.5}
${S} .sg-reviews-in{position:relative;max-width:1200px;margin:0 auto}
${S} .sg-car{position:relative;margin-top:40px;padding:0 40px}
${S} .sg-car .sb-cslider-track{display:flex;gap:30px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .sg-car .sb-cslider-track::-webkit-scrollbar{display:none}
${S} .sg-t{flex:0 0 calc((100% - 30px)/2);margin:0;padding:30px;border-radius:10px;background:#fff;scroll-snap-align:start}
${S} .sg-t-head{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #eee}
${S} .sg-t-head img{width:50px;height:50px;border-radius:50%;object-fit:cover}
${S} .sg-t-name{display:block;font-size:16px;font-weight:700;color:#000}
${S} .sg-stars{color:#f5b400;font-size:15px;letter-spacing:2px}
${S} .sg-t p{font-size:15px;line-height:1.7}
${S} .sg-car .sb-cslider-nav button{position:absolute;top:calc(50% - 30px);width:20px;padding:0;border:0;background:none;color:#fff;font-size:30px;line-height:1;cursor:pointer}
${S} .sg-car .sb-cslider-nav button:first-child{left:0}
${S} .sg-car .sb-cslider-nav button:last-child{right:0}
${S} .sg-dots{display:flex;justify-content:center;gap:10px;padding:26px 0 0}
${S} .sg-dots button{width:9px;height:9px;padding:0;border:0;border-radius:50%;background:#fff;opacity:.5;cursor:pointer}
${S} .sg-dots button.on{background:var(--sg-lime);opacity:1}

${S} .sg-blogs-sec{padding:100px 20px}
${S} .sg-blogs-sec h2{text-align:center;margin-bottom:50px}
${S} .sg-blogs{display:flex;flex-wrap:wrap;justify-content:center;gap:30px;max-width:1200px;margin:0 auto}
${S} .sg-blog{display:block;flex:0 0 calc((100% - 60px)/3);padding:20px;border:2px solid var(--sb-accent);border-radius:27px;text-align:center;transition:background-color .3s,transform .3s}
${S} .sg-blog:hover{background:var(--sg-soft);transform:translateY(-4px)}
${S} .sg-blog img,${S} .sg-blog .sb-img-empty{display:block;width:100%;height:auto;min-height:60px;border-radius:10px}
${S} .sg-blog strong{display:block;margin-top:20px;font-family:var(--sb-font-heading);font-size:30px;font-weight:700;line-height:1.3;color:#000}

${S} .sg-banner{padding:calc(150px + 2em) 1em 2em}
${S} .sg-banner-box{position:relative;display:flex;justify-content:center;max-width:1200px;margin:0 auto;padding:4em 2em;overflow:hidden;border-radius:25px;background:var(--sg-img,#6f4cce) var(--sg-pos,0 -220px)/cover no-repeat}
${S} .sg-banner-box::before{content:"";position:absolute;inset:0;background:var(--sg-veil,#000);opacity:.5}
${S} .sg-banner-title{position:relative;width:70%;padding:2em;border-radius:25px;text-align:center}
${S} .sg-banner-title h1{font-family:'Nunito',sans-serif;font-size:80px;font-weight:700;line-height:120%;color:var(--sg-soft)}

${S} .sg-search{max-width:1200px;margin:0 auto;padding:50px 20px 10px}
${S} .sg-search h2{font-family:'Roboto',sans-serif;font-size:40px;font-weight:900;line-height:1.3;color:#000;text-align:center}
${S} .sg-search-row{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:30px}
${S} .sg-search-box{display:flex;flex:1;max-width:620px}
${S} .sg-search input[type=search]{flex:1;min-width:0;padding:14px 20px;border:1px solid var(--sg-soft);border-radius:7px 0 0 7px;background:var(--sg-soft);color:#000;font:inherit;outline:0}
${S} .sg-search input[type=search]:focus{border-color:var(--sb-accent)}
${S} .sg-search-box button{padding:0 30px;border:0;border-radius:7px;background:#000;color:#fff;font:inherit;font-weight:600;cursor:pointer;transition:background-color .3s}
${S} .sg-search-box button:hover{background:var(--sb-accent)}
${S} .sg-search-cats{display:flex;align-items:center;gap:12px}
${S} .sg-search-cats strong{color:#000}
${S} .sg-search select{padding:14px 20px;border:1px solid var(--sg-soft);border-radius:30px;background:var(--sg-soft);color:#000;font:inherit}
${S} .sg-cat-bar{display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:30px 20px 0;font-size:20px;color:#000}
${S} .sg-cat-bar strong{font-weight:800}

${S} .sg-ccards-in{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:30px;width:80%;max-width:1200px;margin:0 auto;padding:20px 0 100px}
${S} .sg-ccard{display:block;overflow:hidden;border:1px solid #e4e4e4;border-radius:25px;background:#fff;transition:border-color .3s}
${S} .sg-ccard:hover{border-color:var(--sg-blue)}
${S} .sg-ccard-img{padding:10px 10px 0}
${S} .sg-ccard-img img,${S} .sg-ccard-img .sb-img-empty{display:block;width:100%;height:170px;border-radius:10px;object-fit:cover;background:var(--sg-soft);transition:transform .5s}
${S} .sg-ccard-name{display:flex;align-items:center;justify-content:center;min-height:120px;padding:10px;font-family:var(--sb-font-heading);font-size:24px;font-weight:700;line-height:1.3;color:#000;text-align:center}

${S} .sg-foot{position:relative}
${S} .sg-foot-cta-wrap{position:relative;z-index:5;max-width:1200px;margin:0 auto}
${S} .sg-foot-cta{position:relative;margin-bottom:-160px;padding:60px;overflow:hidden;border-radius:20px;background:var(--sb-accent);text-align:center}
${S} .sg-foot-cta::before{content:"";position:absolute;inset:0;background:var(--sg-ov,none) bottom right/cover no-repeat;opacity:.1}
${S} .sg-foot-cta>*{position:relative}
${S} .sg-foot-cta p{width:55%;margin:20px auto 0;font-size:17px;font-weight:500;line-height:1.8em;color:#efefef}
${S} .sg-foot-dark{padding:260px 0 0;background:#000;color:#bdbdbd}
${S} .sg-foot-cols{display:flex;max-width:1200px;margin:0 auto 70px}
${S} .sg-foot-cols>.c1{width:47.2%;padding-right:40px}
${S} .sg-foot-cols>.c2{width:17%}
${S} .sg-foot-cols>.c3{width:20%}
${S} .sg-foot-cols>.c4{width:15.8%}
${S} .sg-foot-logo img{display:block;width:55%;height:auto;margin:0 0 20px -25px}
${S} .sg-foot-dark h4{margin-bottom:14px;font-family:var(--sb-font-heading);font-size:25px;font-weight:700;line-height:1.4;color:#fff}
${S} .sg-foot-dark a{color:#bdbdbd;overflow-wrap:anywhere;transition:color .3s}
${S} .sg-foot-dark a:hover{color:var(--sb-accent)}
${S} .sg-foot-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
${S} .sg-foot-about{margin:0 170px 20px 0}
${S} .sg-foot-social{display:flex;flex-wrap:wrap;gap:12px}
${S} .sg-foot-social a{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#fff;color:var(--sb-accent);transition:background-color .3s,color .3s}
${S} .sg-foot-social a:hover{background:var(--sb-accent);color:var(--sg-soft)}
${S} .sg-foot-bar{display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:20px 0;border-top:1px solid #ffffff2e}
${S} .sg-foot-bar nav{display:flex;gap:20px}

${S} .sg-post{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px;max-width:1200px;margin:0 auto 60px;padding:150px 20px 0}
${S} .sg-post img{border-radius:20px}
${S} .sg-post-main{min-width:0;padding:20px;border-radius:30px;background:#fff;box-shadow:0 0 24px rgba(0,0,0,.07)}
${S} .sg-post-cover{display:block;width:100%;height:530px;margin-bottom:8%;object-fit:cover;filter:brightness(105%)}
${S} .sg-post-cat{margin:0;font-family:'Poppins',sans-serif;font-size:16px;font-weight:300;letter-spacing:10px;text-align:center;text-transform:uppercase;color:#000}
${S} .sg-post-title{margin:4%  0;font-family:'Poppins',sans-serif;font-size:40px;font-weight:600;line-height:1em;text-align:center;color:#000}
${S} .sg-post-date{margin:0 0 12%;font-family:'Poppins',sans-serif;font-size:16px;font-weight:300;text-align:center;color:#000}
${S} .sg-post-content{font-family:'Poppins',sans-serif;font-size:17px;font-weight:300;line-height:1.8;letter-spacing:.2px;word-spacing:1px;color:var(--sb-fg)}
${S} .sg-post-content .sb-container{width:100%;max-width:none;margin:0;padding:0}
${S} .sg-post-content p{margin:0 0 1.2em}
${S} .sg-post-content h2,${S} .sg-post-content h3,${S} .sg-post-content h4{margin:2.5rem 0 1rem;font-family:'Poppins',sans-serif;line-height:1.3;color:#000}
${S} .sg-post-content h2{font-size:clamp(1.5rem,5vw,2rem)}
${S} .sg-post-content .sb-block:first-child h2{margin-top:0}
${S} .sg-post-content figure,${S} .sg-post-content .sb-image{margin:1rem 0 1.5rem;text-align:center}
${S} .sg-post-content img{display:block;max-width:100%;height:auto;margin:0 auto}
${S} .sg-post-content a{color:var(--sb-accent)}
${S} .sg-post-content a:hover{color:#000}
${S} .sg-side{position:relative}
${S} .sg-side form{margin-bottom:25px}
${S} .sg-side input[type=search]{width:100%;padding:12px 16px;border:1px solid var(--sg-soft);border-radius:30px;background:var(--sg-soft);font:inherit}
${S} .sg-side .sg-btn{width:100%;margin-top:10px}
${S} .sg-side-cats{position:sticky;top:calc(var(--sb-sticky-top,0px) + 100px);margin-bottom:25px}
${S} .sg-side-cats strong{display:block;margin-bottom:8px;color:#000}
${S} .sg-side-cats select{width:100%;padding:12px 16px;border:1px solid var(--sg-soft);border-radius:30px;background:var(--sg-soft);font:inherit}
${S} .sg-side-banner{position:sticky;top:calc(var(--sb-sticky-top,0px) + 200px)}
${S} .sg-side-banner img{display:block;width:100%}

${S} .sg-bio{display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:60px 20px;background:var(--sg-img,var(--sg-soft)) center/cover no-repeat;text-align:center}
${S} .sg-bio-in{width:100%;max-width:560px}
${S} .sg-bio img.sg-avatar{display:block;width:110px;height:110px;margin:0 auto 18px;border-radius:50%;object-fit:cover}
${S} .sg-bio h1{font-family:var(--sb-font-heading);font-size:26px;font-weight:700;color:#000}
${S} .sg-bio p{margin:8px 0 28px;font-size:15px}
${S} .sg-bio-links{display:flex;flex-direction:column;gap:14px}
${S} .sg-bio-links .sg-btn{display:block;width:100%;padding:16px 20px}

${S}.sb-prose main .sb-container{width:min(900px,100% - 40px)}
${S}.sb-prose main .sb-text p{margin-bottom:1em;font-size:16px;line-height:1.8}
${S}.sb-prose main .sb-container h2{margin:1.6em 0 .5em;font-size:28px;line-height:1.4;color:#000}
${S}.sb-prose main .sb-list{margin:0 0 1em 1.2em;padding:0}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
