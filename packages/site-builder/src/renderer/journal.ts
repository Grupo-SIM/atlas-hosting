/**
 * Variante visual "journal" (`theme.variant === "journal"`): layout editorial claro,
 * portado do protótipo "Blog Viagens". Vale só para sites que a escolhem; sem ela o
 * renderer continua no visual clássico. As cores vêm dos tokens do tema, então trocar
 * `accent`/`bg`/`fg`/`card` e as fontes já muda o site inteiro.
 */
export const isJournal = (theme: Record<string, string>) =>
  theme.variant === "journal";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras da variante: fundo do rodapé e foto da página de links. */
export function journalVars(
  theme: Record<string, string>
): Record<string, string> {
  const photo = safe(theme.linksBg, "");
  return {
    "--sb-footer-bg": safe(theme.footerBg, "#1b2430"),
    "--sb-links-bg": photo ? `url(${JSON.stringify(photo)})` : "none",
  };
}

const S = ".sb.sb-j";

const mobile = (scope: string) => `
${scope} .sb-featured-post{grid-template-columns:1fr;grid-template-rows:none}
${scope} .sb-featured-post>*{grid-column:1!important;grid-row:auto!important}
${scope} .sb-featured-post>img{min-height:260px;height:260px}
${scope} .sb-featured-post>h3,${scope} .sb-featured-post>p,${scope} .sb-featured-post>a{margin-inline:28px!important}
${scope} .sb-featured-post>a{margin-bottom:32px!important}
${scope} .sb-featured-post>h3{margin-top:28px!important}
${scope} .sb-grid-3{grid-template-columns:1fr}
${scope} .sb-mag-side img{width:96px}
${scope} .sb-burger i{background:currentColor}
`;

export const journalCss = `
${S}{--j-line:color-mix(in srgb,var(--sb-fg) 10%,transparent);--j-tint:color-mix(in srgb,var(--sb-bg),var(--sb-fg) 5%);--j-ph:color-mix(in srgb,var(--sb-bg),var(--sb-fg) 9%);--j-accent-dk:color-mix(in srgb,var(--sb-accent) 82%,#000);--j-accent-lt:color-mix(in srgb,var(--sb-accent) 60%,#fff);--j-body:color-mix(in srgb,var(--sb-fg) 88%,var(--sb-bg));--j-shadow:0 1px 0 color-mix(in srgb,var(--sb-fg) 6%,transparent),0 24px 60px -30px color-mix(in srgb,var(--sb-fg) 25%,transparent);font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased}
${S} .sb-container{width:min(1280px,100% - 48px);padding-block:40px}
${S}.sb-prose main .sb-container{width:min(860px,100% - 48px)}
${S} h1,${S} h2,${S} h3,${S} h4{font-family:var(--sb-font-heading);font-weight:600;letter-spacing:-.015em}
${S} h1{font-size:clamp(2.6rem,5vw,4.25rem);line-height:1.05;letter-spacing:-.02em}
${S} h2{font-size:clamp(2.2rem,4vw,3.5rem);line-height:1.08;text-wrap:balance}
${S} h3{font-size:clamp(1.4rem,2vw,1.75rem);line-height:1.15}
${S} h4{font-family:var(--sb-font-accent);font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--sb-muted)}
${S} .sb-sub{font-size:19px;line-height:1.5;color:var(--sb-muted);margin-top:14px}
${S} .sb-text strong{color:inherit}
${S} .sb-text.sb-container{padding-block:7px}
${S} .sb-text p{font-size:18px;line-height:1.7;color:var(--j-body);margin-bottom:.6em}
${S}.sb-prose .sb-heading{padding-top:20px}
${S}.sb-prose .sb-heading:has(.sb-watermark){padding-top:96px}
${S}.sb-prose .sb-heading h2{font-size:28px;line-height:1.2;margin-bottom:0}
${S} .sb-img-empty{background:var(--j-ph)}
${S} .sb-heading{padding-top:72px}
${S} .sb-heading.sb-align-center:has(.sb-watermark){padding-top:96px}
${S} .sb-watermark{font-family:var(--sb-font-heading);-webkit-text-stroke:1.5px color-mix(in srgb,var(--sb-fg) 9%,transparent)}
${S} .sb-card{background:var(--sb-card);border-radius:22px}

/* botões */
${S} .sb-btn{border-radius:999px;font-family:var(--sb-font-accent);font-weight:600;font-size:15px;padding:13px 26px;transition:background .2s,color .2s}
${S} .sb-btn-primary{background:var(--sb-accent);color:#fff!important}
${S} .sb-btn-primary:hover{background:var(--sb-fg);color:var(--sb-bg)!important}
${S} .sb-btn-lg{font-size:16px;padding:15px 30px}
${S} .sb-btn-light{background:var(--sb-fg);color:var(--sb-bg)!important}
${S} .sb-btn-light:hover{background:var(--sb-accent);color:#fff!important}
${S} .sb-btn-wide{width:100%;background:var(--sb-fg);color:var(--sb-bg)!important;border-radius:999px;padding:18px 20px;font-family:var(--sb-font-accent);font-weight:600;font-size:16px}
${S} .sb-btn-wide:hover{background:var(--sb-accent);color:#fff!important}
${S} .sb-mag .sb-btn,${S} .sb-filter .sb-btn,${S} .sb-sidebar .sb-btn,${S} .sb-pager .sb-btn{background:var(--sb-fg);color:var(--sb-bg)!important}
${S} .sb-mag .sb-btn:hover,${S} .sb-filter .sb-btn:hover,${S} .sb-sidebar .sb-btn:hover,${S} .sb-pager .sb-btn:hover{background:var(--sb-accent);color:#fff!important}
${S} .sb-cat-header .sb-btn,${S} [data-block-type=categoryGrid] .sb-align-center .sb-btn{background:none;border:1.5px solid var(--sb-fg);color:var(--sb-fg)!important}
${S} .sb-cat-header .sb-btn:hover,${S} [data-block-type=categoryGrid] .sb-align-center .sb-btn:hover{background:var(--sb-fg);color:var(--sb-bg)!important}
${S} .sb-cat-header .sb-btn::before{content:"← "}
${S} [data-block-type=categoryGrid] .sb-align-center{margin-top:24px}
${S} .sb-link{color:var(--j-accent-dk)!important;font-family:var(--sb-font-accent);font-size:13px;letter-spacing:.08em}

/* cabeçalho */
${S} .sb-header.sb-container{width:min(1280px,100% - 48px);padding:28px 0 0}
${S} .sb-logo strong{font-family:var(--sb-font-heading);font-weight:700;font-size:26px;letter-spacing:-.01em}
${S} .sb-logo img{height:48px}
${S} .sb-nav{gap:4px;padding:5px;border-radius:999px;background:var(--sb-card);border:1px solid var(--j-line);color:var(--sb-fg);font-family:var(--sb-font-accent);font-size:14px;font-weight:500;letter-spacing:.02em;text-transform:none;backdrop-filter:blur(12px)}
${S} .sb-nav-item>a{padding:9px 18px;border-radius:999px;gap:8px}
${S} .sb-nav-item>a:hover{background:var(--j-tint)}
${S} .sb-nav-sub{left:50%;transform:translateX(-50%);min-width:240px;margin-top:12px;padding:8px;background:var(--sb-card);border:0;border-radius:16px;box-shadow:0 20px 50px color-mix(in srgb,var(--sb-fg) 18%,transparent)}
${S} .sb-nav-sub a{color:var(--sb-fg);text-transform:none;font-size:15px;font-weight:500;padding:11px 14px;border-radius:10px}
${S} .sb-nav-sub a:hover{background:var(--j-tint);color:var(--j-accent-dk)}
${S} .sb-header>.sb-btn{background:var(--sb-fg);color:var(--sb-bg)!important;padding:11px 22px;font-size:14px}
${S} .sb-header>.sb-btn:hover{background:var(--sb-accent);color:#fff!important}
${S}:not(:has(main>.sb-block:first-child .sb-hero)) main{padding-top:112px}
${S}:has(main>.sb-block:first-child .sb-hero) .sb-header{color:#fff}
${S}:has(main>.sb-block:first-child .sb-hero) .sb-nav{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.22);color:#fff}
${S}:has(main>.sb-block:first-child .sb-hero) .sb-nav-item>a:hover{background:rgba(255,255,255,.14)}
${S}:has(main>.sb-block:first-child .sb-hero) .sb-header>.sb-btn{background:#fff;color:#1f2937!important}
${S}:has(main>.sb-block:first-child .sb-hero) .sb-header>.sb-btn:hover{background:var(--sb-accent);color:#fff!important}

/* hero */
${S} .sb-hero{min-height:max(100vh,680px);align-items:flex-end}
${S} .sb-hero::before{background:linear-gradient(180deg,rgba(17,24,39,.55) 0%,rgba(17,24,39,.1) 35%,rgba(17,24,39,.55) 75%,rgba(17,24,39,.8) 100%)}
${S} .sb-hero .sb-container{padding-block:0 120px}
${S} .sb-hero h1{max-width:860px;font-size:clamp(2.4rem,5vw,4.25rem);line-height:1.08;color:#fff;text-wrap:balance}
${S} .sb-hero .sb-btn{margin-top:36px;background:var(--sb-accent);color:#fff!important;box-shadow:0 10px 30px color-mix(in srgb,var(--sb-accent) 35%,transparent)}
${S} .sb-hero .sb-btn:hover{background:#fff;color:#1f2937!important}

/* categorias */
${S} .sb-grid{gap:28px 24px;margin-block:0}
${S} .sb-grid-3{grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))}
${S} .sb-cat-card{position:relative;display:flex;flex-direction:column;gap:6px;min-height:0;padding:0;background:none;border-radius:0;overflow:visible;font-size:inherit}
${S} .sb-cat-card img,${S} .sb-cat-card .sb-img-empty{order:0;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:20px;margin:0 0 12px;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
${S} .sb-cat-card:hover img{transform:scale(1.04)}
${S} .sb-cat-card .sb-cat-head{display:contents}
${S} .sb-cat-card .sb-cat-head>span{order:1;font-family:var(--sb-font-heading);font-weight:600;font-size:26px;line-height:1.15;padding-inline:4px}
${S} .sb-cat-card .sb-cat-head b{position:absolute;top:16px;right:16px;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--sb-card);color:var(--sb-accent);font-size:17px}
${S} .sb-cat-card .sb-cat-text{order:2;display:block;text-align:left;color:var(--sb-muted);font-family:var(--sb-font-body);font-size:16px;line-height:1.5;padding-inline:4px}
${S} .sb-cat-cardplain,${S} .sb-cat-card.plain{display:flex;flex-direction:column;justify-content:space-between;min-height:200px;padding:28px 28px 24px;border:1px solid var(--j-line);font-family:var(--sb-font-heading);font-size:30px;transition:transform .3s,box-shadow .3s}
${S} .sb-cat-cardplain:hover,${S} .sb-cat-card.plain:hover{transform:translateY(-4px);box-shadow:0 24px 50px -28px color-mix(in srgb,var(--sb-fg) 30%,transparent)}
${S} .sb-cat-cardplain .sb-cat-head,${S} .sb-cat-card.plain .sb-cat-head{font-size:30px;line-height:1.1;font-weight:600}
${S} .sb-cat-cardplain .sb-cat-head b,${S} .sb-cat-card.plain .sb-cat-head b{display:flex;align-items:center;justify-content:center;flex:none;width:40px;height:40px;border-radius:50%;background:var(--j-tint);color:var(--sb-accent);font-size:17px}

/* contadores */
${S} .sb-stats-wrap{position:relative;display:flex;align-items:flex-end;min-height:460px;margin-block:48px;padding:0;border-radius:28px;overflow:hidden;background:var(--sb-footer-bg)}
${S} .sb-stats-wrap>img{position:absolute;inset:0;left:0;bottom:auto;transform:none;width:100%;height:100%;max-width:none;object-fit:cover}
${S} .sb-stats-wrap::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(17,24,39,0) 20%,rgba(17,24,39,.78) 100%)}
${S} .sb-stats-wrap .sb-stats{z-index:2;width:100%;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0;padding:40px 24px;background:none;border-radius:0;color:#fff}
${S} .sb-stats>div{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px}
${S} .sb-stats strong{font-weight:600;font-size:clamp(3rem,6vw,5rem);letter-spacing:-.02em}
${S} .sb-stats small{margin-left:2px;font-size:.6em;color:var(--j-accent-lt)}
${S} .sb-stats span{font-family:var(--sb-font-accent);font-size:14px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}

/* post em destaque */
${S} .sb-featured-wrap{display:block;min-height:0;overflow:visible;margin-block:0}
${S} .sb-featured-wrap>img,${S} .sb-featured-inner>img{display:none}
${S} .sb-featured-inner{display:block;padding-block:72px}
${S} .sb-featured-post{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto auto auto 1fr;max-width:none;padding:0;border-radius:28px;overflow:hidden;box-shadow:var(--j-shadow)}
${S} .sb-featured-post>img{grid-column:1;grid-row:1/-1;width:100%;height:100%;min-height:420px;object-fit:cover}
${S} .sb-featured-post>h3{grid-column:2;grid-row:2;margin:0 clamp(32px,5vw,64px) 24px;font-family:var(--sb-font-accent);font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--j-accent-dk)}
${S} .sb-featured-post>h3 i{border-top:1px solid color-mix(in srgb,var(--sb-accent) 30%,#fff)}
${S} .sb-featured-post>p{grid-column:2;grid-row:3;margin:0 clamp(32px,5vw,64px) 24px;font-size:clamp(1.9rem,3vw,2.75rem);line-height:1.12;letter-spacing:-.01em;text-wrap:balance}
${S} .sb-featured-post>a{grid-column:2;grid-row:4;justify-self:start;margin-inline:clamp(32px,5vw,64px)}

/* depoimentos */
${S} [data-block-type=testimonials]{background:var(--j-tint);padding-block:64px}
${S} [data-block-type=testimonials] .sb-grid-3{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:20px;margin-top:40px}
${S} .sb-testimonial{min-height:0;padding:32px;gap:32px;border-radius:22px}
${S} .sb-testimonial::before{content:"“";font-family:var(--sb-font-heading);font-size:56px;line-height:.6;height:28px;color:var(--sb-accent)}
${S} .sb-testimonial blockquote{margin:0;font-family:var(--sb-font-heading);font-weight:500;font-size:18px;line-height:1.5;text-wrap:pretty}
${S} .sb-testimonial figcaption{padding-top:20px;border-top:1px solid var(--j-line);gap:12px}
${S} .sb-avatar{width:48px;height:48px}
${S} .sb-testimonial figcaption strong{font-family:var(--sb-font-body);font-size:16px}

/* texto + imagem */
${S} .sb-split{grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:clamp(40px,6vw,96px);min-height:0;padding-block:96px}
${S} .sb-split>div>p{max-width:520px;margin-bottom:24px;font-size:19px;line-height:1.6;color:var(--j-body)}
${S} .sb-split>img:not(.sb-split-deco){width:100%;margin:0;aspect-ratio:4/5;max-height:620px;object-fit:cover;border-radius:28px}

/* busca + lista (magazine) */
${S} .sb-mag{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;margin-top:40px}
${S} .sb-mag-search,${S} .sb-mag-cats{align-self:stretch;align-items:center;gap:10px;padding:8px;background:var(--sb-card);border-radius:999px;box-shadow:var(--j-shadow)}
${S} .sb-mag-cats{flex-direction:row;padding-left:22px}
${S} .sb-mag-cats strong{font-family:var(--sb-font-accent);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--sb-muted)}
${S} .sb-mag-search input{border:0;outline:0;background:transparent;padding:10px 16px;font-size:16px}
${S} .sb-mag-cats select,${S} .sb-select,${S} .sb-filter select{flex:1;min-width:0;border:0;outline:0;background:var(--sb-bg);color:var(--sb-fg);border-radius:999px;padding:11px 16px;font-size:15px;cursor:pointer}
${S} .sb-mag-track{border-radius:22px}
${S} .sb-mag-slide img{aspect-ratio:16/10;border-radius:22px;margin-bottom:8px}
${S} .sb-mag-slide small{font-family:var(--sb-font-accent);font-size:13px;font-weight:600;letter-spacing:.12em;color:var(--j-accent-dk)}
${S} .sb-mag-slide h3{font-size:clamp(1.75rem,2.6vw,2.4rem);line-height:1.12;margin:.3em 0}
${S} .sb-mag-slide p{font-size:17px;color:var(--sb-muted)}
${S} .sb-mag-dots{justify-content:flex-start;gap:8px;margin-top:20px}
${S} .sb-mag-dots button{width:8px;height:8px;background:color-mix(in srgb,var(--sb-fg) 18%,var(--sb-bg));transition:width .2s}
${S} .sb-mag-dots button.on{width:28px;border-radius:999px;background:var(--sb-accent)}
${S} .sb-mag-side{gap:0}
${S} .sb-mag-side a{gap:20px;padding-block:22px;border-bottom:1px solid var(--j-line)}
${S} .sb-mag-side a:hover h3{color:var(--j-accent-dk)}
${S} .sb-mag-side img{width:150px;aspect-ratio:1/1;border-radius:16px}
${S} .sb-mag-side h3{font-size:clamp(1.3rem,1.8vw,1.6rem);line-height:1.2;margin:0 0 10px;text-wrap:balance}
${S} .sb-mag-side em{font-family:var(--sb-font-accent);font-size:14px;color:var(--j-accent-dk);text-decoration:none}
${S} .sb-filter{padding:10px;background:var(--sb-card);border-radius:999px;box-shadow:var(--j-shadow)}
${S} .sb-filter input{border:0;outline:0;background:transparent;padding:12px 20px;font-size:16px}

/* cards de post */
${S} .sb-post-card{background:none;border-radius:0;overflow:visible;display:flex;flex-direction:column;gap:16px}
${S} .sb-post-thumb{border-radius:20px;overflow:hidden;background:var(--j-ph)}
${S} .sb-post-card img,${S} .sb-post-card .sb-img-empty{aspect-ratio:3/2;border-radius:0;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
${S} .sb-post-card:hover img{transform:scale(1.05)}
${S} .sb-post-card.compact .sb-tag,${S} .sb-post-thumb .sb-tag{top:14px;left:14px;right:auto;padding:6px 12px;background:var(--sb-card);color:var(--sb-fg);font-family:var(--sb-font-accent);font-size:11px;letter-spacing:.1em}
${S} .sb-post-card .sb-card-body{padding:0 4px}
${S} .sb-post-card .sb-card-body .sb-tag{background:none;padding:0;color:var(--j-accent-dk);font-family:var(--sb-font-accent);font-size:12px;letter-spacing:.12em;text-transform:uppercase}
${S} .sb-post-card.compact .sb-card-body{padding:0 4px}
${S} .sb-post-card h3{font-size:24px;line-height:1.2;text-wrap:balance}
${S} .sb-post-card h3 a:hover{color:var(--j-accent-dk)}
${S} .sb-post-card .sb-card-body p{color:var(--sb-muted);font-size:16px}
${S} .sb-cat-header{padding-top:40px}
${S} .sb-cat-search.sb-mag{padding-block:0}

/* post */
${S} .sb-post-header{padding-top:clamp(40px,6vw,80px)}
${S} .sb-post-header h1{position:relative;max-width:960px;margin-inline:auto;font-size:clamp(2.4rem,4.6vw,4rem);line-height:1.08;text-wrap:balance}
${S} .sb-post-header .sb-watermark{left:50%;top:0;transform:translateX(-50%)}
${S} .sb-two-cols{grid-template-columns:minmax(0,1fr) 300px;gap:56px;padding-block:56px}
${S} .sb-col-side{position:sticky;top:24px;align-self:start}
${S} .sb-post-meta img,${S} .sb-post-header img{border-radius:24px;aspect-ratio:16/9;object-fit:cover}
${S} .sb-post-meta .sb-tag{display:block;margin:22px 0 4px;color:var(--j-accent-dk);font-family:var(--sb-font-accent);font-size:12px;letter-spacing:.3em}
${S} .sb-post-meta time{font-size:15px;margin-bottom:40px}
${S} .sb-post-content .sb-text,${S} .sb-post-content .sb-heading,${S} .sb-post-content .sb-image{max-width:720px;margin-inline:auto}
${S} .sb-post-content .sb-container{padding-block:9px}
${S} .sb-post-content .sb-heading{padding-top:22px}
${S} .sb-post-content .sb-heading h2{font-size:clamp(1.6rem,2.4vw,2.1rem);line-height:1.15;letter-spacing:-.01em}
${S} .sb-post-content .sb-text p{font-size:18px;line-height:1.7;color:var(--j-body)}
${S} .sb-post-meta+.sb-block .sb-text p:first-child{font-family:var(--sb-font-heading);font-size:22px;line-height:1.55;color:var(--sb-fg)}
${S} .sb-post-content .sb-image img{border-radius:20px}
${S} .sb-sidebar{gap:20px}
${S} .sb-sidebar .sb-filter{padding:6px;gap:6px;margin:0;box-shadow:none;border:1px solid var(--j-line)}
${S} .sb-sidebar .sb-filter input{padding:10px 14px;font-size:15px}
${S} .sb-sidebar .sb-btn{padding:10px 18px;font-size:14px}
${S} .sb-sidebar h4{margin:0}
${S} .sb-select{border-radius:12px;padding:12px 14px}
${S} .sb-sidebar img{aspect-ratio:4/5;object-fit:cover;border-radius:20px;margin-top:0}

/* rodapé */
${S} .sb-footer{margin-top:48px;padding-top:0;background:var(--sb-footer-bg);color:#e5e7eb}
${S} .sb-footer .sb-footer-grid{grid-template-columns:2fr 1fr 1fr;gap:40px;padding-block:80px 48px}
${S} .sb-footer-brand{padding:0;background:none;border-radius:0;font-family:var(--sb-font-heading);font-weight:700;font-size:34px;color:#fff;align-items:flex-start}
${S} .sb-footer-brand img{height:auto;max-height:96px;margin:0}
${S} .sb-footer-grid h4{font-size:13px;color:#9ca3af;margin:0 0 12px}
${S} .sb-footer-grid h4:not(:first-child){margin-top:20px}
${S} .sb-footer-grid a,${S} .sb-footer-grid span{font-size:17px;color:#fff;margin-bottom:12px}
${S} .sb-footer-grid a:hover{color:var(--j-accent-lt)}
${S} .sb-socials{gap:8px}
${S} .sb-socials a{width:40px;height:40px;margin:0;background:none;border:1px solid rgba(255,255,255,.2);color:#fff}
${S} .sb-socials a:hover{background:var(--sb-accent);border-color:var(--sb-accent);color:#fff}
${S} .sb-socials svg{width:16px;height:16px}
${S} .sb-footer .sb-footer-bottom{padding-block:24px;border-top:1px solid rgba(255,255,255,.1);margin-top:0;font-size:15px;color:#9ca3af}
${S} .sb-footer-bottom a{color:#9ca3af}
${S} .sb-footer-bottom a:hover{color:#fff}

/* página de links (sem cabeçalho/rodapé) */
${S}.sb-bare{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:64px 24px;background:linear-gradient(180deg,rgba(17,24,39,.55),rgba(17,24,39,.75)),var(--sb-links-bg) center/cover,var(--sb-footer-bg)}
${S}.sb-bare main{width:min(440px,100%);padding:48px 32px;border-radius:32px;background:color-mix(in srgb,var(--sb-bg) 96%,transparent);text-align:center;box-shadow:0 40px 80px -30px rgba(0,0,0,.5)}
${S}.sb-bare main .sb-container{width:100%;padding-block:0}
${S}.sb-bare main .sb-block{margin-bottom:24px}
${S}.sb-bare main .sb-block:last-child{margin-bottom:0}
${S}.sb-bare main .sb-block:has(.sb-btn-wide){margin-bottom:12px}
${S}.sb-bare .sb-heading{padding-top:0}
${S}.sb-bare h1{font-weight:700;font-size:44px;line-height:1.05;margin-bottom:10px}
${S}.sb-bare .sb-sub{font-size:18px;margin:0}
${S}.sb-bare .sb-social-row{gap:12px;padding-block:0}
${S}.sb-bare .sb-social-row a{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:var(--sb-card);border:1px solid var(--j-line);color:var(--sb-fg)}
${S}.sb-bare .sb-social-row a:hover{background:var(--sb-accent);border-color:var(--sb-accent);color:#fff}
${S}.sb-bare .sb-social-row svg{width:20px;height:20px}
${S}.sb-bare .sb-image img{margin-inline:auto}

@media (max-width:760px){${mobile(S)}${S} .sb-mag{grid-template-columns:1fr;gap:16px}${S} .sb-footer-grid,${S} .sb-two-cols{grid-template-columns:1fr}${S} .sb-hero .sb-container{padding-bottom:72px}${S} .sb-col-side{position:static}}
${mobile(`${S}.sb-narrow`)}
${S}.sb-narrow .sb-mag{grid-template-columns:1fr;gap:16px}
${S}.sb-narrow .sb-footer-grid,${S}.sb-narrow .sb-two-cols{grid-template-columns:1fr}
`;
