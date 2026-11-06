/**
 * Variante "spyhacker" (`theme.variant = "spyhacker"`): medidas copiadas do 007spyhacker.com
 * (Elementor) para categorias, páginas de categoria, posts, cabeçalho e rodapé. Tudo fica sob
 * `.sb-sh`, então os outros sites que usam o estilo padrão não mudam.
 */
export const isSpy = (theme: Record<string, string>) =>
  theme.variant === "spyhacker";

/** Fontes que só a variante usa (relacionados e "Voltar"/"Mais conteúdos" no original). */
export const SPY_EXTRA_FONTS = ["Nunito", "Roboto", "Inter"];

const GRAD_BTN = "linear-gradient(65deg,#5dd7f2 0%,#c8f4fe 100%)";
const ARROW_RIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z'/%3E%3C/svg%3E")`;

/** Telas estreitas: no celular (media query) e no preview estreito do editor (`.sb-narrow`). */
const spyMobile = (x: string) => `
${x} main{padding-top:96px!important}
${x} .sb-header.sb-container{padding:16px 0;min-height:0;align-items:center}
${x} .sb-logo{margin-top:0}
${x} .sb-logo img{height:48px}
${x} .sb-header>.sb-btn{padding:10px 16px;font-size:14px}
${x} .sb-nav{margin-top:0;background:none;border:0;padding:0}
${x} .sb-nav-item>a{padding:6px 0}
${x} .sb-nav-sub{background:none;margin:0}
${x} .sb-nav-sub a{padding:8px 12px}
${x} .sb-block[data-block-type=header]:has(.sb-burger-input:checked){z-index:100}
${x} .sb-burger{position:relative;z-index:62}
${x} .sb-burger i{transition:transform .25s,opacity .25s}
${x} .sb-burger-input:checked+.sb-burger i:nth-child(1){transform:translateY(8px) rotate(45deg)}
${x} .sb-burger-input:checked+.sb-burger i:nth-child(2){opacity:0}
${x} .sb-burger-input:checked+.sb-burger i:nth-child(3){transform:translateY(-8px) rotate(-45deg)}
${x} .sb-header .sb-nav{position:fixed;top:0;left:0;bottom:0;z-index:61;display:flex;flex-direction:column;align-items:stretch;gap:4px;width:min(320px,85vw);margin:0;padding:88px 24px 32px;overflow-y:auto;background:var(--sb-menu-bg,#00060b);border:0;border-radius:0;box-shadow:none;transform:translateX(-100%);visibility:hidden;transition:transform .3s ease,visibility 0s linear .3s}
${x} .sb-burger-input:checked~.sb-nav{transform:none;visibility:visible;box-shadow:8px 0 32px rgba(0,0,0,.55);transition:transform .3s ease}
${x} .sb-burger-backdrop{display:block;position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .3s}
${x} .sb-burger-input:checked~.sb-burger-backdrop{opacity:1;pointer-events:auto}
${x} .sb-header .sb-nav-item>a i{display:none}
${x} .sb-watermark{font-size:64px;line-height:70px}
${x} .sb-block[data-block-type=heading]:has(>.sb-heading>h1){margin-top:-96px}
${x} .sb-heading:not(.sb-post-header):has(>h1){width:calc(100% - 32px);min-height:0;padding:150px 0 24px!important}
${x} .sb-heading:not(.sb-post-header):has(>h1) .sb-watermark{top:96px!important}
${x} .sb-heading>h1,${x} .sb-post-header h1,${x} .sb-cat-header h1{font-size:32px;line-height:1.15}
${x} .sb-heading:not(.sb-post-header):has(>h1)>.sb-sub{font-size:16px;line-height:1.4;margin:0}
${x} .sb-block[data-block-type=categoryGrid]:has(.sb-cat-card.plain)>.sb-container{width:calc(100% - 32px);padding:24px 16px 60px}
${x} .sb-grid:has(>.sb-cat-card.plain){grid-template-columns:1fr;gap:16px}
${x} .sb-cat-card.plain{min-height:80px}
${x} .sb-cat-card.plain .sb-cat-head{flex:1;justify-content:space-between;font-size:22px;line-height:1.15}
${x} .sb-cat-card.plain .sb-cat-head>span{width:auto}
${x} .sb-cat-card.plain .sb-cat-head svg{margin-top:0}
${x} .sb-featured-text{height:auto;min-height:0}
${x} .sb-featured-text .sb-featured-inner{flex-direction:column;align-items:center;gap:24px;padding:48px 0}
${x} .sb-featured-text .sb-featured-inner>img{width:160px;max-width:50%;margin:0}
${x} .sb-featured-post>p{font-size:24px;line-height:1.15}
${x} .sb-featured-post>.sb-btn{align-self:stretch;justify-content:center;font-size:18px}
${x} .sb-cat-search.sb-container{width:calc(100% - 32px);grid-template-columns:1fr;gap:16px;padding:16px 0}
${x} .sb-mag-search input{min-height:56px}
${x} .sb-cat-header.sb-container{width:calc(100% - 32px);padding:16px 0;flex-wrap:wrap}
${x} .sb-cat-header .sb-btn{padding:10px 24px;font-size:16px}
${x} .sb-block[data-block-type=postList]>.sb-container{width:calc(100% - 32px);padding:16px 0 48px}
${x} .sb-grid-3:has(>.sb-post-card.compact){grid-template-columns:1fr;gap:20px}
${x} .sb-post-header.sb-container{width:calc(100% - 32px);margin-top:-96px;padding:150px 0 0;margin-bottom:24px}
${x} .sb-post-header .sb-watermark{top:96px}
${x} .sb-post-header h1{text-align:left;font-size:36px}
${x} .sb-post-content .sb-text p,${x} .sb-post-content .sb-list li{font-size:15px;line-height:26px}
${x} .sb-two-cols.sb-container{width:calc(100% - 32px);grid-template-columns:1fr}
${x} .sb-col-main{padding:0}
${x} .sb-sidebar{position:static;padding-top:0}
${x} .sb-post-meta img{height:auto;margin-bottom:24px}
${x} .sb-post-content{padding-bottom:24px}
${x} .sb-post-content .sb-heading>h2{font-size:32px;line-height:1.1}
${x} .sb-post-content .sb-heading>h3{font-size:26px;line-height:1.1}
${x} .sb-post-content .sb-heading>h4{font-size:22px;line-height:1.1}
${x} .sb-share.sb-container,${x} .sb-post-nav.sb-container{width:calc(100% - 32px)}
${x} .sb-share.sb-container{padding-top:32px}
${x} .sb-post-nav{flex-direction:column;gap:16px}
${x} .sb-post-nav>*{flex-basis:auto}
${x} .sb-block[data-block-type=postList]:has(.sb-related)>.sb-container{width:calc(100% - 32px);padding:40px 0 60px}
${x} .sb-block[data-block-type=postList]:has(.sb-related) h2{font-size:32px;line-height:1.2}
${x} .sb-related.sb-grid-3{grid-template-columns:1fr}
${x} .sb-excerpt-card{margin:0 0 20px}
${x} .sb-footer{padding-top:48px}
${x} .sb-footer .sb-container{width:calc(100% - 32px)}
${x} .sb-footer-grid.sb-container{grid-template-columns:1fr;row-gap:24px;margin-bottom:32px}
${x} .sb-footer-grid>div:nth-child(2),${x} .sb-footer-grid>div:nth-child(3){grid-column:auto}
${x} .sb-footer-grid>div:not(.sb-footer-brand){padding-top:0;align-items:center;text-align:center}
${x} .sb-footer-brand{min-height:0}
${x} .sb-footer-brand img{margin-top:0}
${x} .sb-footer-bottom.sb-container{flex-direction:column;align-items:center;gap:8px;padding:24px 0}
${x} .sb-float{font-size:11px;padding:6px 10px}
${x} .sb-float::before{width:30px;height:32px}
`;

export const spyCss = `
.sb-sh{color:#d8d8d8;font-size:18px;line-height:1.4}
.sb-sh h1,.sb-sh h2,.sb-sh h3,.sb-sh h4{color:#fff}
.sb-sh main{padding-top:160px!important}
.sb-sh:has(main>.sb-block:first-child .sb-hero) main{padding-top:0!important}

.sb-sh .sb-header.sb-container{width:min(1400px,100% - 40px);padding:40px 0;align-items:flex-start;min-height:160px}
.sb-sh .sb-logo{margin-top:-20px}
.sb-sh .sb-logo img{height:100px;width:auto}
.sb-sh .sb-nav{gap:0;margin-top:16px;padding:0;background:linear-gradient(180deg,#162865 0%,#00060b 100%);border:1px solid #162865;border-radius:16px;font-family:'Mulish',sans-serif;font-size:14px;line-height:19.6px}
.sb-sh .sb-nav-item>a{gap:0;padding:13px 16px;padding-block:13px}
.sb-sh .sb-nav-item.has-sub>a{padding-right:0}
.sb-sh .sb-nav-item>a i{display:inline-flex;justify-content:center;width:24px;border:0;opacity:1}
.sb-sh .sb-nav-item>a i::before{content:"";width:0;height:0;border:5px solid transparent;border-top:5px solid #000;border-bottom:0;margin-top:2px}
.sb-sh .sb-nav-sub{left:0;margin-top:13px;padding:0;min-width:0;background:#07142d;border:0;border-radius:12px;box-shadow:none}
.sb-sh .sb-nav-sub::before{inset:-14px 0 auto 0;height:14px}
.sb-sh .sb-nav-sub a{padding:13px 20px;border-radius:0;line-height:20px;font-family:'Mulish',sans-serif}
.sb-sh .sb-nav-sub a:first-child{border-radius:12px 12px 0 0}
.sb-sh .sb-nav-sub a:last-child{border-radius:0 0 12px 12px}
.sb-sh .sb-nav-sub a:hover{background:#162865;color:#5dd7f2}
.sb-sh .sb-header>.sb-btn{background:linear-gradient(55deg,#5dd7f2 0%,#c8f4fe 100%);border-radius:12px;padding:14px 32px;font-size:16px;line-height:20.8px;font-weight:600;color:#00060b!important;transition:transform .3s}
.sb-sh .sb-header>.sb-btn:hover{transform:scale(.9)}

.sb-sh .sb-watermark{font-weight:600;font-size:180px;line-height:198px;-webkit-text-stroke:1px #1d4852}
.sb-sh .sb-block[data-block-type=heading]:has(>.sb-heading>h1){margin-top:-128px;background:linear-gradient(180deg,#00060b 0%,#07142d 100%)}
.sb-sh .sb-heading:not(.sb-post-header):has(>h1){width:min(1400px,100% - 40px);min-height:445px;padding:268px 0 20px!important;display:flex;flex-direction:column;justify-content:flex-end}
.sb-sh .sb-heading:not(.sb-post-header):has(>h1) .sb-watermark{top:120px!important;left:0;transform:none}
.sb-sh .sb-heading>h1{font-size:60px;line-height:69px;font-weight:600;margin:0 0 16px}
.sb-sh .sb-heading:not(.sb-post-header):has(>h1)>.sb-sub{color:#d8d8d8;font-size:20px;line-height:26px;margin:0 0 46px}
.sb-sh .sb-heading.sb-align-center:has(>h1){align-items:center;text-align:center}

.sb-sh .sb-block[data-block-type=categoryGrid]:has(.sb-cat-card.plain){position:relative}
.sb-sh .sb-block[data-block-type=categoryGrid]:has(.sb-cat-card.plain)::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#0a214d 0%,rgba(242,41,91,0) 100%);opacity:.5;pointer-events:none}
.sb-sh .sb-block[data-block-type=categoryGrid]:has(.sb-cat-card.plain)>.sb-container{position:relative;width:min(1400px,100% - 40px);padding:48px 32px 188px}
.sb-sh .sb-cat-card.plain{flex-direction:row;align-items:flex-start;gap:16px;min-height:102px;padding:16px;border-radius:0;background:linear-gradient(180deg,rgba(22,40,101,.68) 0%,#00060b 100%)}
.sb-sh .sb-grid:has(>.sb-cat-card.plain){gap:48px 16px;margin:0}
.sb-sh .sb-cat-card.plain .sb-cat-head{justify-content:flex-start;gap:16px;font-size:32px;line-height:35.2px;font-weight:600;color:#fff}
.sb-sh .sb-cat-card.plain .sb-cat-head>span{width:260px;max-width:100%}
.sb-sh .sb-cat-card.plain .sb-cat-head svg{flex:none;width:24px;height:24px;margin-top:8px;color:#5dd7f2}

.sb-sh .sb-featured-text{align-items:flex-start;margin:0;height:600px;min-height:0}
.sb-sh .sb-featured-text>img.w1{top:35px}
.sb-sh .sb-featured-text>img.w3{top:125px}
.sb-sh .sb-featured-text>img.w2{top:320px;bottom:auto}
.sb-sh .sb-featured-text .sb-featured-inner{gap:114px;align-items:flex-start;padding:184px 0 0}
.sb-sh .sb-featured-text .sb-featured-inner>img{width:280px;max-width:30%;margin:176px 0 0}
.sb-sh .sb-featured-post{max-width:500px;padding:40px;border-radius:24px;background:linear-gradient(180deg,#162865 0%,#00060b 100%);display:flex;flex-direction:column;gap:24px}
.sb-sh .sb-featured-post>p{font-size:32px;line-height:35.2px;font-weight:600;margin:0;width:420px;max-width:100%;color:#fff}
.sb-sh .sb-featured-post>.sb-btn{align-self:flex-start;display:inline-flex;align-items:center;gap:16px;background:${GRAD_BTN};border-radius:12px;padding:14px 32px;font-size:24px;line-height:26.4px;font-weight:600;color:#00060b!important}
.sb-sh .sb-featured-post>.sb-btn::after{content:"";width:21px;height:24px;background:currentColor;-webkit-mask:${ARROW_RIGHT} center/contain no-repeat;mask:${ARROW_RIGHT} center/contain no-repeat}

.sb-sh .sb-cat-search.sb-container{width:min(1400px,100% - 40px);grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 48px;margin:0 auto;padding:48px 32px}
.sb-sh .sb-mag-search{gap:0}
.sb-sh .sb-mag-search input,.sb-sh .sb-filter input{background:#101c32;border:1px solid #101c32;border-radius:12px;padding:14px 16px;min-height:71px;font-size:16px;line-height:22.4px;color:#fff;font-family:'Mulish',sans-serif}
.sb-sh .sb-mag-search input::placeholder,.sb-sh .sb-filter input::placeholder{color:#fff;opacity:1}
.sb-sh .sb-mag-search .sb-btn,.sb-sh .sb-filter .sb-btn{margin-left:8px;padding:0 24px;border-radius:10px;background:${GRAD_BTN};font-size:18px;line-height:23.4px;font-weight:600;color:#00060b!important}
.sb-sh .sb-mag-cats{gap:0}
.sb-sh .sb-mag-cats strong,.sb-sh .sb-sidebar h4{font-family:var(--sb-font-heading);font-size:24px;line-height:26.4px;font-weight:600;color:#fff;margin:8px 0 16px}
.sb-sh .sb-mag-cats select,.sb-sh .sb-select{height:40px;padding:8px 16px;background:#fff;color:#000;border:1px solid #666;border-radius:3px;font-size:16px;font-family:'Mulish',sans-serif}

.sb-sh .sb-cat-header.sb-container{width:min(1400px,100% - 40px);padding:32px 16px}
.sb-sh .sb-cat-header h1{font-size:53px;line-height:60.95px;font-weight:600}
.sb-sh .sb-cat-header .sb-btn{background:${GRAD_BTN};border:1px solid transparent;border-radius:12px;padding:16px 40px;font-family:'Roboto',sans-serif;font-size:20px;line-height:26px;font-weight:500;color:#00060b!important}

.sb-sh .sb-block[data-block-type=postList]>.sb-container{width:min(1400px,100% - 40px);padding:16px 0 98px}
.sb-sh .sb-empty{text-align:left;margin:0;font-size:18px;line-height:25.2px}
.sb-sh .sb-grid-3:has(>.sb-post-card.compact){gap:28px 31px;margin:0}
.sb-sh .sb-post-card.compact{display:flex;flex-direction:column;background:#00060b;border:1px solid #202020;border-radius:20px;box-shadow:0 0 10px rgba(0,0,0,.15)}
.sb-sh .sb-post-card.compact .sb-post-thumb{margin-bottom:20px;aspect-ratio:444/266;overflow:hidden}
.sb-sh .sb-post-card.compact .sb-post-thumb img,.sb-sh .sb-post-card.compact .sb-post-thumb .sb-img-empty{width:100%;height:100%;aspect-ratio:auto;object-fit:cover}
.sb-sh .sb-post-card.compact .sb-tag{top:0;right:0;margin:20px;padding:7.2px 14.4px;background:#5dd7f2;color:#00060b;border-radius:999px;font-family:'Mulish',sans-serif;font-size:12px;line-height:12px;font-weight:700}
.sb-sh .sb-post-card.compact .sb-card-body{padding:21px 30px 0}
.sb-sh .sb-post-card.compact h3{font-size:21px;line-height:21px;font-weight:600;margin:0 0 25px}
.sb-sh .sb-post-card.compact .sb-link{font-family:'Mulish',sans-serif;font-size:12px;line-height:25.2px;font-weight:700;color:#5dd7f2!important;display:inline-block;margin-bottom:20px}

.sb-sh .sb-post-header.sb-container{width:min(1400px,100% - 40px);margin-top:-187px;padding:368px 0 0;margin-bottom:60px}
.sb-sh .sb-post-header .sb-watermark{top:120px}
.sb-sh .sb-post-header h1{font-size:60px;line-height:69px;font-weight:600;margin:0}
.sb-sh .sb-two-cols.sb-container{width:min(1200px,100% - 40px);grid-template-columns:minmax(0,880px) 300px;gap:20px;padding:0}
.sb-sh .sb-col-main{padding:20px;min-width:0}
.sb-sh .sb-post-meta{margin:0 0 16px}
.sb-sh .sb-post-meta img{height:530px;object-fit:cover;border-radius:20px;margin:0 auto 83px}
.sb-sh .sb-post-meta .sb-tag{margin:0 0 16px;padding:0;font-family:'Poppins',sans-serif;font-size:16px;line-height:24px;font-weight:300;letter-spacing:10px;color:#fff}
.sb-sh .sb-post-meta time{font-family:'Poppins',sans-serif;font-size:16px;line-height:24px;font-weight:300;color:#324a6d}
.sb-sh .sb-post-content{padding-bottom:67px}
.sb-sh .sb-post-content .sb-container{padding:0}
.sb-sh .sb-post-content .sb-text p,.sb-sh .sb-post-content .sb-list li{font-family:'Poppins',sans-serif;font-size:17px;line-height:30.6px;font-weight:300;letter-spacing:.2px;color:#fff}
.sb-sh .sb-post-content .sb-text p{margin:0 0 16px}
.sb-sh .sb-post-content .sb-text strong,.sb-sh .sb-post-content .sb-text em{font-weight:400;color:inherit}
.sb-sh .sb-post-content .sb-text p,.sb-sh .sb-post-content .sb-text li{color:#fff}
.sb-sh .sb-post-content .sb-inline-link{color:#5dd7f2;text-decoration:none}
.sb-sh .sb-post-content .sb-list{list-style:disc;padding:0 0 0 40px;margin:0 0 16px}
.sb-sh .sb-post-content .sb-list li::before{content:none}
.sb-sh .sb-post-content .sb-heading{padding:0}
.sb-sh .sb-post-content .sb-heading>h2{font-size:60px;line-height:60px;margin:8px 0 16px;letter-spacing:.2px}
.sb-sh .sb-post-content .sb-heading>h3{font-size:40px;line-height:40px;margin:8px 0 16px;letter-spacing:.2px}
.sb-sh .sb-post-content .sb-heading>h4{font-size:32px;line-height:32px;margin:8px 0 16px;letter-spacing:.2px}
.sb-sh .sb-post-content .sb-image{padding:0;margin:0 0 17px}
.sb-sh .sb-post-content .sb-image img{margin-inline:auto;border-radius:20px}
.sb-sh .sb-sidebar{position:sticky;top:20px;align-self:start;gap:0;padding-top:66px}
.sb-sh .sb-col-side{display:flex;flex-direction:column}
.sb-sh .sb-sidebar .sb-filter{margin:25px 0 20px;gap:0;flex-wrap:nowrap}
.sb-sh .sb-sidebar .sb-filter input{min-width:0;min-height:56px}
.sb-sh .sb-sidebar .sb-filter .sb-btn{margin-left:5px;padding:7px;min-width:99px;color:#000!important}
.sb-sh .sb-sidebar h4{margin-top:23px}
.sb-sh .sb-sidebar form:has(.sb-select){margin-bottom:48px}
.sb-sh .sb-sidebar img{margin:0;border-radius:20px}

.sb-sh .sb-share.sb-container{width:min(1125px,100% - 40px);padding:79px 0 0;display:flex;flex-direction:column;align-items:flex-start;gap:20px}
.sb-sh .sb-share>span{font-family:'Poppins',sans-serif;font-size:16px;line-height:24px;font-weight:300;color:#fff}
.sb-sh .sb-share>div{display:flex;gap:22px;margin:45px 0}
.sb-sh .sb-share button{display:flex;width:23px;height:23px;padding:0;background:none;border:0;cursor:pointer;color:#fff}
.sb-sh .sb-share svg{width:22px;height:22px}
.sb-sh .sb-post-nav.sb-container{width:min(1125px,100% - 40px);padding:20px 0 0;margin-top:30px;border-top:1px solid #2b2b2b;padding-top:32px;display:flex;justify-content:space-between;gap:0}
.sb-sh .sb-post-nav>*{flex:0 0 50%;min-width:0}
.sb-sh .sb-post-nav a{display:flex;align-items:center;gap:15px;color:#5dd7f2}
.sb-sh .sb-post-nav-next{justify-content:flex-end;text-align:right}
.sb-sh .sb-post-nav i{font-style:normal;font-size:16px;color:#fff}
.sb-sh .sb-post-nav span{display:flex;flex-direction:column;min-width:0;font-family:'Poppins',sans-serif;font-size:16px;line-height:25.2px;color:#fff}
.sb-sh .sb-post-nav small{font-size:16px;font-weight:300}
.sb-sh .sb-post-nav b{font-weight:500;text-transform:capitalize;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.sb-sh .sb-block[data-block-type=postList]:has(.sb-related)>.sb-container{width:calc(70% + 115.2px);max-width:none;padding:72px 57.6px 120px}
.sb-sh .sb-block[data-block-type=postList]:has(.sb-related) h2{font-family:'Roboto',sans-serif;font-size:59px;line-height:70.8px;font-weight:600;text-align:center;margin:10px 0 30px}
.sb-sh .sb-related.sb-grid-3{gap:0;margin:0}
.sb-sh .sb-excerpt-card{margin:0 15px 30px;display:flex;flex-direction:column;gap:0;padding:15px 15px 24px;background:#000;border:1px solid #1f1f1f;border-radius:10px;box-shadow:0 0 2px rgba(0,0,0,.3)}
.sb-sh .sb-excerpt-card .sb-post-thumb{margin-bottom:10px}
.sb-sh .sb-excerpt-card .sb-post-thumb img,.sb-sh .sb-excerpt-card .sb-post-thumb .sb-img-empty{width:100%;height:200px;aspect-ratio:auto;object-fit:cover;border-radius:10px}
.sb-sh .sb-excerpt-card h3{font-family:'Nunito',sans-serif;font-size:18px;line-height:21.6px;font-weight:700;margin:12px 0 20px}
.sb-sh .sb-excerpt-card p{font-family:'Nunito',sans-serif;font-size:16px;line-height:25.2px;font-weight:500;color:#959697;margin:0 0 15px}
.sb-sh .sb-excerpt-btn{align-self:flex-start;display:inline-flex;margin:0 0 25px;padding:10px 40px;border-radius:30px;background:#5dd7f2;color:#00060b!important;font-family:'Nunito',sans-serif;font-size:16px;line-height:28.8px;font-weight:500}

.sb-sh .sb-footer{margin-top:0;padding-top:90px;background:linear-gradient(180deg,#00060b 0,rgba(0,6,11,0) 160px),linear-gradient(180deg,#07142d 0%,#00060b 100%)}
.sb-sh .sb-footer .sb-container{width:min(1400px,100% - 40px)}
.sb-sh .sb-footer-grid.sb-container{padding:0;margin-bottom:86px;grid-template-columns:minmax(0,582fr) 120px minmax(0,341fr) 16px minmax(0,341fr);column-gap:0}
.sb-sh .sb-footer-grid>div:nth-child(2){grid-column:3}
.sb-sh .sb-footer-grid>div:nth-child(3){grid-column:5}
.sb-sh .sb-footer-grid>div:not(.sb-footer-brand){padding-top:50px;display:flex;flex-direction:column;gap:16px}
.sb-sh .sb-footer-grid h4{font-size:24px;line-height:26.4px;margin:0}
.sb-sh .sb-footer-grid>div:nth-child(2) a+a{margin-top:-5px}
.sb-sh .sb-footer-grid a,.sb-sh .sb-footer-grid span{margin:0;font-size:18px;line-height:25.2px;color:#fff}
.sb-sh .sb-footer-brand{min-height:267px;padding:16px;border-radius:24px;background:linear-gradient(180deg,rgba(22,40,101,.68) 0%,#00060b 100%);align-items:flex-start;justify-content:center;overflow:visible}
.sb-sh .sb-footer-brand img{height:auto;width:506px;max-width:92%;margin-top:-55px}
.sb-sh .sb-footer-mail{display:flex!important;align-items:center;gap:8px;font-family:var(--sb-font-heading);font-size:16px!important;line-height:20.8px!important;font-weight:600;color:#d8d8d8!important}
.sb-sh .sb-footer-mail svg{display:block;width:18px;height:18px;color:#5dd7f2}
.sb-sh .sb-footer-grid>div:nth-child(3) h4:last-of-type{margin-top:20px}
.sb-sh .sb-socials{gap:5px}
.sb-sh .sb-socials a{width:34px;height:34px;background:#5dd7f2;border:1px solid #5dd7f2;color:#000}
.sb-sh .sb-socials svg{width:16px;height:16px}
.sb-sh .sb-footer-bottom.sb-container{margin-top:0;padding:31px 16px 40px;border-top:1px solid #344460;font-size:16px;line-height:22.4px}
.sb-sh .sb-footer-bottom>span:first-child{color:#d8d8d8}
.sb-sh .sb-footer-bottom a{color:#fff;margin-left:16px}
.sb-sh .sb-float{display:flex;align-items:center;gap:8px;right:20px;bottom:20px;padding:10px 16px;border-radius:40px;background:#25d366;box-shadow:0 4px 8px rgba(0,0,0,.2);font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:25.2px;font-weight:700}
.sb-sh .sb-float svg{display:none}
.sb-sh .sb-float::before{content:"";flex:none;width:44px;height:47px;background:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M3.516 3.516c4.686-4.686 12.284-4.686 16.97 0s4.686 12.283 0 16.97a12 12 0 0 1-13.754 2.299l-5.814.735a.392.392 0 0 1-.438-.44l.748-5.788A12 12 0 0 1 3.517 3.517zm3.61 17.043.3.158a9.85 9.85 0 0 0 11.534-1.758c3.843-3.843 3.843-10.074 0-13.918s-10.075-3.843-13.918 0a9.85 9.85 0 0 0-1.747 11.554l.16.303-.51 3.942a.196.196 0 0 0 .219.22zm6.534-7.003-.933 1.164a9.84 9.84 0 0 1-3.497-3.495l1.166-.933a.79.79 0 0 0 .23-.94L9.561 6.96a.79.79 0 0 0-.924-.445l-2.023.524a.797.797 0 0 0-.588.88 11.754 11.754 0 0 0 10.005 10.005.797.797 0 0 0 .88-.587l.525-2.023a.79.79 0 0 0-.445-.923L14.6 13.327a.79.79 0 0 0-.94.23z'/%3E%3C/svg%3E") center/contain no-repeat}

@media (max-width:760px){${spyMobile(".sb-sh")}}
${spyMobile(".sb-sh.sb-narrow")}
`;
