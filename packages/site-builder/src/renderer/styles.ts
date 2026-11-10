/** Tokens de tema → variáveis CSS. Valores vêm do usuário, então só passam sem `;{}<`. */
const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function themeVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--sb-accent": safe(theme.accent, "#5ce1f5"),
    "--sb-bg": safe(theme.bg, "#030712"),
    "--sb-card": safe(theme.card, "#0b1437"),
    "--sb-fg": safe(theme.fg, "#ffffff"),
    "--sb-font-accent": safe(
      theme.fontAccent,
      safe(theme.fontBody, "system-ui, sans-serif")
    ),
    "--sb-font-body": safe(theme.fontBody, "system-ui, sans-serif"),
    "--sb-font-heading": safe(theme.fontHeading, "system-ui, sans-serif"),
    "--sb-muted": safe(theme.muted, "#9fb0d0"),
  };
}

const mobileRules = (scope: string) => `
${scope} .sb-header{flex-wrap:wrap;gap:12px 16px}
${scope} .sb-burger{display:flex;flex-direction:column;justify-content:center;gap:5px;width:26px;height:36px;cursor:pointer;order:0}
${scope} .sb-burger i{display:block;height:3px;width:100%;background:#fff;border-radius:2px}
${scope} .sb-burger i:nth-child(2){width:70%}
${scope} .sb-header .sb-logo{order:1;margin-right:auto}
${scope} .sb-header>.sb-btn{order:2}
${scope} .sb-header .sb-nav{order:3;display:none;flex:0 0 100%;flex-direction:column;gap:14px}
${scope} .sb-burger-input:checked~.sb-nav{display:flex}
${scope} .sb-nav-sub{display:block;position:static;min-width:0;margin:6px 0 0;padding:0 0 0 12px;background:none;border:0;box-shadow:none}
${scope} .sb-nav-sub::before{display:none}
${scope} .sb-nav-item>a i{display:none}
${scope} .sb-hero{background-position:center bottom}
${scope} .sb-hero .sb-btn{display:block;width:100%;text-align:center}
${scope} .sb-stats{flex-direction:column;align-items:center;gap:32px}
`;

export const siteCss = `
.sb{position:relative;overflow-x:clip;background:var(--sb-bg);color:var(--sb-fg);font-family:var(--sb-font-body);font-size:18px;line-height:1.4;min-height:100%}
.sb *{box-sizing:border-box}
.sb a{color:inherit;text-decoration:none}
/* popup de vídeo (links com data-sb-video; aberto pelo nav-runtime) */
.sb .sb-vpop{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:40px 8px;background:rgba(11,11,11,.8);opacity:0;transition:opacity .15s ease-out}
.sb .sb-vpop.on{opacity:1}
.sb .sb-vpop-stage{position:relative;width:min(900px,100%);aspect-ratio:16/9;background:#000;box-shadow:0 0 8px rgba(0,0,0,.6)}
.sb .sb-vpop-stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.sb .sb-vpop-close{position:absolute;top:-44px;right:-6px;width:44px;height:44px;padding:0;border:0;background:none;color:#fff;font:28px/44px Arial,sans-serif;cursor:pointer;opacity:.65}
.sb .sb-vpop-close:hover,.sb .sb-vpop-close:focus-visible{opacity:1}
.sb h1,.sb h2,.sb h3,.sb h4{font-family:var(--sb-font-heading);font-weight:600;line-height:1.05;margin:0 0 .4em}
.sb h1{font-size:clamp(2.5rem,4.5vw,4.0625rem)}
.sb h2{font-size:clamp(2.25rem,4.17vw,3.75rem)}
.sb h3{font-size:clamp(1.5rem,2.2vw,2rem);line-height:1.1}
.sb h4{font-size:1.5rem}
.sb p{margin:0 0 1em}
.sb img{max-width:100%;display:block}
.sb-block{position:relative}
.sb-container{width:min(1400px,100% - 32px);margin-inline:auto;padding-block:56px}
.sb-align-center{text-align:center}
.sb-sub{color:var(--sb-muted);font-size:20px;line-height:1.3}
.sb-img-empty{background:linear-gradient(135deg,#12204f,#0a1230);min-height:120px;width:100%}
.sb-ad{display:block;padding-block:12px}
.sb-ad-wrap{padding-block:0}
.sb-ad-label{display:block;margin-bottom:4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
.sb-ad>a{display:block}
.sb-ad-box{position:relative;width:100%;overflow:hidden;border-radius:8px;background:rgba(127,127,127,.15)}
.sb-ad-banner .sb-ad-box{aspect-ratio:970/150}
.sb-ad-side .sb-ad-box{aspect-ratio:300/600}
.sb-ad-square .sb-ad-box{aspect-ratio:300/250}
.sb-ad-item{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s ease;pointer-events:none}
.sb-ad-item.on{opacity:1}
.sb-ad-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;text-align:center;font-size:14px;opacity:.6;border:2px dashed currentColor;border-radius:8px}
.sb-news-sidecol{display:flex;flex-direction:column;gap:16px;min-width:0}
.sb-btn{display:inline-block;border:0;border-radius:6px;padding:10px 22px;font-weight:600;font-size:16px;cursor:pointer;font-family:var(--sb-font-heading)}
.sb-btn-lg{font-size:24px;padding:14px 26px}
.sb-btn-primary{background:linear-gradient(90deg,#5ce1f5,#b6f0ff);color:#04101f!important}
.sb-btn-wide{display:block;width:min(280px,100%);margin:0 auto;background:#1d4852;color:#fff!important;border-radius:16px;padding:16px 20px;font-weight:500;text-align:center}
.sb-btn-light{background:#d8f6ff;color:#04101f!important}
.sb-link{color:var(--sb-accent)!important;font-size:16px;font-weight:600;font-family:var(--sb-font-heading)}
.sb-tag{display:inline-block;background:#e8eefc;color:#04101f;border-radius:999px;padding:2px 12px;font-size:16px;font-weight:600;font-family:var(--sb-font-heading);margin-bottom:8px}
.sb-block[data-block-type=header]{position:absolute;left:0;right:0;top:0;z-index:10}
.sb:not(:has(main>.sb-block:first-child .sb-hero)) main{padding-top:96px}
.sb-header{padding-top:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.sb-logo{display:flex;align-items:center;gap:8px}
.sb-logo img{height:84px;width:auto}
.sb-header.sb-container{width:min(1400px,100% - 32px);padding-inline:16px}
.sb-prose main .sb-container{width:min(1140px,100% - 32px)}
.sb-inline-link{color:var(--sb-accent);text-decoration:underline;text-underline-offset:3px}
.sb-text strong{color:#fff}
.sb-burger,.sb-burger-input,.sb-burger-backdrop,.sb-header-search,.sb-header-title{display:none}
.sb-burger-input:focus-visible+.sb-burger{outline:2px solid var(--sb-accent)}
.sb-nav{position:relative;display:flex;gap:20px;background:#0a1230;border:1px solid #1c2c66;border-radius:8px;padding:8px 14px;font-size:14px;text-transform:uppercase;color:var(--sb-accent)}
.sb-nav-item{position:relative}
.sb-nav-item>a{display:flex;align-items:center;gap:8px;padding-block:2px}
.sb-nav-item>a i{width:0;height:0;border:4px solid transparent;border-top-color:currentColor;border-bottom:0;opacity:.6}
.sb-nav-sub{display:none;position:absolute;top:100%;left:-14px;z-index:20;min-width:230px;margin-top:14px;padding:6px;background:#06122b;border:1px solid #14234f;border-radius:12px;box-shadow:0 14px 30px rgba(0,0,0,.5)}
.sb-nav-sub::before{content:"";position:absolute;inset:-16px 0 auto 0;height:16px}
.sb-nav-item.has-sub:hover .sb-nav-sub,.sb-nav-item.has-sub:focus-within .sb-nav-sub{display:block}
.sb-nav-sub a{display:block;padding:12px 14px;border-radius:8px;color:#fff;font-size:14px;text-transform:uppercase;white-space:nowrap}
.sb-nav-sub a:hover{background:#14275f;color:var(--sb-accent)}
.sb-hero{position:relative;background-size:cover;background-position:center;min-height:100vh;display:flex;align-items:center}
.sb-hero::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,7,18,.78) 0%,rgba(3,7,18,.35) 55%,rgba(3,7,18,.15) 100%),linear-gradient(180deg,transparent 60%,var(--sb-bg) 100%)}
.sb-hero .sb-container{position:relative}
.sb-hero h1{max-width:766px;font-size:clamp(1.75rem,2.8vw,2.5rem);font-weight:600;line-height:1}
.sb-grid{display:grid;gap:16px;margin-block:16px}
.sb-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.sb-card{background:linear-gradient(180deg,var(--sb-card),#050a1c);border-radius:14px;overflow:hidden}
.sb-card-body{padding:14px 16px 18px}
.sb-card-body h3{font-size:clamp(1.25rem,1.6vw,1.5rem)}
.sb-card-body p{color:var(--sb-muted);font-size:16px}
.sb-post-card img,.sb-post-card .sb-img-empty{aspect-ratio:3/2;object-fit:cover;width:100%}
.sb-cat-card{display:flex;flex-direction:column;gap:12px;min-height:482px;padding:16px 32px;font-size:clamp(1.5rem,2.2vw,2rem);font-family:var(--sb-font-heading)}
.sb-cat-card.plain{min-height:0}
.sb-cat-header{display:flex;align-items:center;justify-content:space-between;gap:16px}
.sb-cat-header h1{margin:0}
.sb-cat-search{margin-bottom:8px}
.sb-link-cards{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-block:16px}
.sb-link-card{flex:0 0 calc((100% - 32px)/3);display:flex;flex-direction:column;overflow:hidden}
.sb-link-card img{width:100%;aspect-ratio:16/10;object-fit:cover}
.sb-link-card .sb-cat-head{padding:14px 18px;font-size:1.15rem;font-family:var(--sb-font-heading)}
.sb-post-thumb{position:relative;display:block}
.sb-post-card.compact .sb-tag{position:absolute;top:12px;right:12px;margin:0;background:var(--sb-accent);text-transform:uppercase;font-size:.65rem;font-weight:700}
.sb-post-card.compact .sb-card-body{padding:18px 22px 20px}
.sb-post-card.compact .sb-link{font-size:.7rem;font-weight:700}
.sb-cat-head{display:flex;justify-content:space-between;gap:12px;font-weight:600;line-height:1.1}
.sb-cat-head b{color:var(--sb-accent);font-size:1rem}
.sb-cat-head svg{flex:none;width:1rem;height:1rem;color:var(--sb-accent)}
.sb-cat-card img,.sb-cat-card .sb-img-empty{width:100%;height:200px;object-fit:contain;min-height:0;margin:auto 0}
.sb-cat-text{color:var(--sb-accent);text-align:right;font-size:18px;line-height:1.4;font-family:var(--sb-font-accent,var(--sb-font-body))}
.sb-video{width:100%;aspect-ratio:16/9;border:0;border-radius:8px}
.sb-channel-video{margin:0;min-width:0}
.sb-channel-video figcaption{margin-top:8px;font-size:15px;color:var(--sb-muted)}
.sb-channel-empty{display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;border:1px dashed currentColor;border-radius:8px;opacity:.5;font-size:15px}
.sb-stats{display:flex;justify-content:space-around;gap:24px;flex-wrap:wrap;background:linear-gradient(180deg,rgba(22,40,101,.85),rgba(5,10,28,.2));border-radius:12px;padding:24px}
.sb-stats strong{display:block;font-size:clamp(2.5rem,4.2vw,3.75rem);font-family:var(--sb-font-heading);line-height:1}
.sb-stats small{font-size:clamp(1.5rem,2.2vw,2rem);margin-left:4px}
.sb-stats span{font-size:16px;font-family:var(--sb-font-heading);font-weight:600}
.sb-row-between{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.sb-feature{display:flex;align-items:flex-end;position:relative;min-height:500px;margin-block:12px}
.sb-feature-tall{min-height:500px;margin:0;align-items:flex-start}
.sb-feature-tall::after{background:linear-gradient(180deg,rgba(3,7,18,.7),transparent 55%)}
.sb-feature img,.sb-feature .sb-img-empty{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sb-feature::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(3,7,18,.78))}
.sb-feature div{position:relative;z-index:1;padding:24px 32px}
.sb-feature h3{font-size:clamp(1.75rem,2.8vw,2.5rem)}
.sb-feature-tall h3{font-size:clamp(1.5rem,2.2vw,2rem)}
.sb-featured-post{max-width:min(500px,100%);width:100%;padding:24px 32px 32px}
.sb-featured-post h3{display:flex;align-items:center;gap:8px;font-size:clamp(1.25rem,1.8vw,1.75rem)}
.sb-featured-post p{font-family:var(--sb-font-heading);font-weight:600;font-size:clamp(1.15rem,1.5vw,1.375rem);line-height:1.25}
.sb-featured-post h3 i{flex:1;height:0;border-top:2px solid rgba(255,255,255,.5)}
.sb-featured-wrap{position:relative;overflow:hidden;min-height:600px;display:flex;align-items:center;margin-block:24px}
.sb-featured-wrap>img{position:absolute;left:0;width:100%;height:auto;max-width:none}
.sb-featured-wrap>img.w1{top:60px}
.sb-featured-wrap>img.w3{top:125px;z-index:1}
.sb-featured-wrap>img.w2{bottom:100px;z-index:2}
.sb-featured-inner{position:relative;z-index:3;width:100%;display:flex;flex-direction:row-reverse;align-items:center;justify-content:center;gap:clamp(40px,10vw,200px)}
.sb-featured-inner>img{width:clamp(180px,28vw,413px);height:auto}
.sb-heading{position:relative}
.sb-heading>*{position:relative}
.sb-heading.sb-align-left .sb-watermark,.sb-post-header .sb-watermark{left:0;top:0;transform:none;line-height:1}
.sb-heading:has(.sb-watermark){padding-top:clamp(70px,9vw,130px)}
.sb-heading.sb-align-center:has(.sb-watermark){padding-top:20px}
.sb-text.sb-container{padding-block:3px}
.sb-text p{margin:0 0 .6em}
.sb-watermark{position:absolute!important;left:50%;top:50%;transform:translate(-50%,-25%);font-family:var(--sb-font-heading);font-weight:700;font-size:clamp(4rem,12.5vw,11.25rem);white-space:nowrap;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.1);pointer-events:none;user-select:none}
.sb-stats-wrap{position:relative;min-height:600px;padding-bottom:0}
.sb-stats-wrap>img{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(1150px,92%);height:auto;z-index:0}
.sb-stats-wrap .sb-stats{position:relative;z-index:1}
.sb-testimonial{padding:18px;margin:0}
.sb-testimonial{display:flex;flex-direction:column;justify-content:space-between;padding:40px;min-height:331px}
.sb-testimonial blockquote{margin:0 0 20px;font-style:italic;font-size:18px}
.sb-testimonial figcaption strong{font-family:var(--sb-font-heading);font-weight:600;font-size:24px}
.sb-testimonial figcaption{display:flex;align-items:center;gap:10px}
.sb-testimonial figcaption span{display:block;font-size:14px;color:var(--sb-muted)}
.sb-avatar{width:56px;height:56px;min-height:0!important;border-radius:50%;object-fit:cover}
.sb-split{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,479px);gap:32px;align-items:center;min-height:556px}
.sb-split-deco{position:absolute;z-index:0;left:40%;bottom:-24px;width:min(250px,18%);height:auto;opacity:.55;pointer-events:none}
.sb-split>div{position:relative;z-index:1}
.sb-split>div>p{max-width:520px;margin-bottom:44px}
.sb-split>img:not(.sb-split-deco){width:min(479px,100%);margin-left:auto}
.sb-filter{display:flex;gap:8px;margin-block:16px;flex-wrap:wrap}
.sb-filter input,.sb-filter select{background:#0a1230;color:inherit;border:1px solid #1c2c66;border-radius:6px;padding:10px 12px;font-family:inherit}
.sb-filter input{flex:1;min-width:140px}
.sb-two-cols{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:32px}
.sb-post-header{text-align:center}
.sb-post-meta{margin-bottom:16px}
.sb-post-meta .sb-tag{display:block;background:transparent;color:var(--sb-fg);text-align:center;text-transform:uppercase;letter-spacing:.35em;font-size:.7rem;margin-top:14px}
.sb-post-meta time{display:block;text-align:center;color:var(--sb-muted);font-size:.8rem}
.sb-post-meta img{width:100%;border-radius:12px}
.sb-select{width:100%;background:#fff;color:#111;border:0;border-radius:4px;padding:8px;font-family:inherit}
.sb-sidebar{display:flex;flex-direction:column;gap:6px}
.sb-sidebar img{border-radius:14px;margin-top:12px;width:100%}
.sb-post-header img{width:100%;border-radius:12px;margin-block:16px}
.sb-post-header time{display:block;color:var(--sb-muted);font-size:.8rem}
.sb-post-content .sb-container{width:100%;padding-block:6px}
.sb-post-content .sb-image img{border-radius:12px}
.sb-sidebar h4{margin-top:20px}
.sb-sidebar ul{list-style:none;padding:0;margin:0}
.sb-sidebar li{padding:4px 0}
.sb-footer{background:linear-gradient(180deg,var(--sb-bg),#07143a);margin-top:48px;padding-top:32px}
.sb-footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:24px}
.sb-footer-grid a,.sb-footer-grid span{display:block;font-size:.85rem;margin-bottom:6px}
.sb-footer-brand{background:linear-gradient(180deg,#162865,#050a1c);border-radius:18px;padding:12px 24px;display:flex;align-items:center;gap:12px;font-size:1.4rem}
.sb-footer-brand img{height:283px;max-width:100%;width:auto;margin-inline:auto}
.sb-socials{display:flex;gap:8px;flex-wrap:wrap}
.sb-socials a{background:var(--sb-accent);color:#04101f;border-radius:999px;padding:2px 10px}
.sb-footer-bottom{display:flex;justify-content:space-between;font-size:.8rem;border-top:1px solid #1c2c66;margin-top:24px}
.sb-footer-bottom a{margin-left:12px}
.sb-float{position:fixed;right:16px;bottom:16px;background:#22c55e;color:#fff!important;font-weight:700;font-size:.75rem;border-radius:999px;padding:10px 16px;z-index:50}
.sb-mag{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:20px 32px;align-items:start;margin-top:20px}
.sb-mag-search{display:flex;gap:6px;align-self:end}
.sb-mag-search input{flex:1;min-width:0;background:#0a1230;color:inherit;border:1px solid #1c2c66;border-radius:6px;padding:10px 12px;font-family:inherit}
.sb-mag-cats{display:flex;flex-direction:column;gap:6px;align-self:end}
.sb-mag-cats select{background:#fff;color:#111;border:0;border-radius:6px;padding:10px 8px;font-family:inherit}
.sb-mag-main{min-width:0}
.sb-mag-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.sb-mag-track::-webkit-scrollbar{display:none}
.sb-mag-slide{flex:0 0 100%;scroll-snap-align:start;min-width:0;display:block}
.sb-mag-slide img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:14px;margin-bottom:12px}
.sb-mag-slide small{text-transform:uppercase;font-size:.7rem}
.sb-mag-slide h3{font-size:clamp(1.75rem,2.8vw,2.5rem);margin:.2em 0 .3em}
.sb-mag-slide p{color:var(--sb-muted);font-size:18px}
.sb-mag-slide small{font-size:14px}
.sb-mag-dots{display:flex;justify-content:center;gap:6px;margin-top:10px}
.sb-mag-dots button{width:6px;height:6px;padding:0;border:0;border-radius:50%;background:#344460;cursor:pointer}
.sb-mag-dots button.on{background:var(--sb-accent)}
.sb-mag-side{display:flex;flex-direction:column;gap:22px}
.sb-mag-side a{display:flex;gap:14px;align-items:center}
.sb-mag-side img{width:150px;aspect-ratio:3/2;object-fit:cover;border-radius:10px;flex:none}
.sb-mag-side h3{font-size:clamp(1.5rem,2.2vw,2rem);margin:0 0 4px}
.sb-mag-side em{font-style:normal;font-size:16px;font-family:var(--sb-font-heading);font-weight:600;color:var(--sb-accent);text-decoration:underline}
.sb-social-row{display:flex;justify-content:center;gap:28px;padding-block:8px}
.sb-social-row a{display:flex;color:#fff}
.sb-social-row svg{width:26px;height:26px}
.sb-pager{display:flex;justify-content:center;gap:12px;margin-top:24px}
.sb-list{list-style:none;padding:0;margin:0}
.sb-list li{margin:0 0 .6em}
.sb-list li::before{content:"• "}
.sb-footer-mail svg,.sb-float svg{display:none}
.sb-share{display:flex;align-items:center;gap:16px}
.sb-share>div{display:flex;gap:12px}
.sb-share svg{width:20px;height:20px}
.sb-share button{display:flex;padding:0;background:none;border:0;color:inherit;cursor:pointer}
.sb-post-nav{display:flex;justify-content:space-between;gap:16px}
.sb-post-nav a{display:flex;align-items:center;gap:10px}
.sb-post-nav span{display:flex;flex-direction:column}
.sb-post-nav i{font-style:normal}
.sb-excerpt-card{display:flex;flex-direction:column;gap:8px}
.sb-excerpt-card img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:10px}
.sb-excerpt-card h3{font-size:1.15rem;margin:0}
.sb-excerpt-card p{color:var(--sb-muted);font-size:15px;margin:0}
.sb-excerpt-btn{align-self:flex-start;background:var(--sb-accent);color:#04101f!important;border-radius:999px;padding:8px 28px;font-weight:600}
.sb-footer-grid h4{font-size:24px}
.sb-footer-grid a,.sb-footer-grid span{font-size:18px}
.sb-footer-bottom{font-size:16px}
.sb-socials a{display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;font-size:.7rem;font-weight:700}
@media (max-width:760px){${mobileRules(".sb")}.sb-mag{grid-template-columns:1fr}.sb-grid-3{grid-template-columns:1fr}.sb-split,.sb-two-cols,.sb-footer-grid{grid-template-columns:1fr}}
${mobileRules(".sb-narrow")}
.sb-narrow .sb-link-card{flex-basis:100%}
.sb-narrow .sb-mag,.sb-narrow .sb-grid-3{grid-template-columns:1fr}
.sb-narrow .sb-split,.sb-narrow .sb-two-cols,.sb-narrow .sb-footer-grid{grid-template-columns:1fr}
.sb-narrow .sb-featured-inner{flex-direction:column;gap:24px}
.sb-narrow .sb-float{position:sticky;margin-left:auto;width:max-content}
/* botão flutuante "pílula" (whatsappFloat layout=pill): ícone + texto; até 600px vira círculo e o texto sobe para fora dele */
.sb .sb-float.sb-float-pill{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;margin:0;width:auto;padding:10px 16px;border-radius:40px;background:var(--fl-bg,#25d366);box-shadow:0 4px 8px rgba(0,0,0,.2);font-family:'Inter',sans-serif;font-size:14px;font-weight:700;line-height:1.2;transition:background .3s}
.sb .sb-float.sb-float-pill:hover{background:var(--fl-hover,#1ebe5d)}
.sb .sb-float.sb-float-pill svg{display:block;flex:none;width:44px;height:47px;margin-right:7px}
.sb .sb-float.sb-float-pill .sb-float-note{display:none}
@media (max-width:600px){.sb .sb-float.sb-float-pill{width:48px;height:48px;padding:12px;justify-content:center;border-radius:50%}.sb .sb-float.sb-float-pill svg{width:24px;height:24px;margin:0}.sb .sb-float.sb-float-pill .sb-float-text{display:none}.sb .sb-float.sb-float-pill .sb-float-note{display:block;position:fixed;right:20px;bottom:78px;font-size:12px;font-weight:600;line-height:1.1;text-align:right;color:var(--fl-bg,#25d366)}}
/* letreiro de texto (textMarquee): CSS puro, a lista vem duplicada para o laço não ter emenda */
.sb-tmq{container-type:inline-size;overflow:hidden;width:100%;padding-block:20px}
.sb-tmq-track{display:flex;width:max-content;color:var(--tmq-color);font-family:var(--sb-font-heading);font-weight:600;font-size:var(--tmq-d);line-height:.9;text-transform:uppercase;white-space:nowrap;animation:sb-tmq var(--tmq-dur,55s) linear infinite}
.sb-tmq.dir-right .sb-tmq-track{animation-direction:reverse}
.sb-tmq-track.is-still{animation:none}
.sb-tmq-group,.sb-tmq-group>span{display:flex;flex:none;align-items:center}
.sb-tmq-item,.sb-tmq-sep{padding-inline:20px}
@keyframes sb-tmq{to{transform:translateX(-50%)}}
@container (max-width:1024px){.sb-tmq-track{font-size:var(--tmq-t)}}
@container (max-width:767px){.sb-tmq-track{font-size:var(--tmq-m)}}
@media (prefers-reduced-motion:reduce){.sb-tmq-track{animation:none}}
/* site incorporado (siteEmbed) */
.sb-embed iframe{display:block;width:100%;border:0;background:#fff}
.sb-embed-empty{display:grid;place-items:center;min-height:200px;border:1px dashed currentColor;opacity:.6}
.sb-embed-link{margin:12px auto 0;width:min(1400px,100% - 32px);text-align:center;font-size:15px}
.sb-embed-link a{text-decoration:underline}
/* voltar ao topo (scrollTop): fixo no canto, entra subindo de -60px quando passa do limite de rolagem */
.sb-top{position:fixed;bottom:-60px;z-index:9990;display:flex;align-items:center;justify-content:center;width:var(--top-s,50px);height:var(--top-s,50px);padding:0;border:0;border-radius:var(--top-r,5px);background:var(--top-bg,#137bc0);color:var(--top-fg,#fff);cursor:pointer;opacity:0;visibility:hidden;transition:bottom .3s ease,opacity .3s ease,background-color .3s ease,visibility .3s}
.sb-top:hover,.sb-top:focus-visible{background:var(--top-hover,#e8b006)}
.sb-top svg{width:15px;height:15px;fill:currentColor}
.sb-top.on{bottom:var(--top-b,60px);opacity:1;visibility:visible}
.sb-top.is-edit{position:relative;bottom:auto;margin:12px 15px 12px auto;transition:background-color .3s ease}
@media (prefers-reduced-motion:reduce){.sb-top{transition:background-color .3s ease}}
@keyframes sb-fx-pop{50%{scale:1.2}}
@keyframes sb-fx-push{50%{scale:.8}}
@keyframes sb-fx-hang-sink{100%{translate:0 8px}}
@keyframes sb-fx-hang{0%{translate:0 8px}50%{translate:0 4px}100%{translate:0 8px}}
[data-sb-par],[data-sb-mouse]{translate:var(--sb-mx,0px) calc(var(--sb-py,0px) + var(--sb-my,0px));will-change:translate}
[data-sb-par=bg]{translate:var(--sb-mx,0px) var(--sb-my,0px);background-position-y:calc(50% + var(--sb-py,0px))}
`;
