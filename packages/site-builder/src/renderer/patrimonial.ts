/**
 * Variante `patrimonial` (escopo `.sb-cp`): medidas do controlepatrimonial.simintermediacoes.com
 * (Elementor + RomeTheme Kit). Breakpoints do original: tablet ≤ 1024, celular ≤ 767; no preview estreito do
 * editor as mesmas regras valem via `.sb-narrow`.
 */
export const isPatrimonial = (theme: Record<string, string>) =>
  theme.variant === "patrimonial";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: fundo escuro, cinza claro de texto e painel claro dos cartões. */
export function patrimonialVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--cp-dark": safe(theme.dark, "#131313"),
    "--cp-panel": safe(theme.panel, "#ECECE7"),
    "--cp-soft": safe(theme.soft, "#C8C8C8"),
    "--cp-white": safe(theme.card, "#FDFDFD"),
  };
}

const S = ".sb-cp";

const tablet = (x: string) => `
${x} .cp-wrap{max-width:90%}
${x} .cp-head-logo{width:33%}
${x} .cp-head-logo img{max-width:80%}
${x} .cp-hero{flex-direction:column}
${x} .cp-hero-text,${x} .cp-hero-media{flex:none;width:100%}
${x} .cp-eyebrow{font-size:1rem}
${x} .cp-stats-box{flex-direction:column}
${x} .cp-stat-top,${x} .cp-stat-label{justify-content:center;text-align:center}
${x} .cp-h2{font-size:3.5rem}
${x} .cp-h3{font-size:2.5rem}
${x} .cp-h4{font-size:1.5rem}
${x} .cp-slider-title{width:62%}
${x} .cp-slider-action{width:auto;flex:1 0 19%}
${x} .cp-slider-box{--cp-v:2;--cp-g:10px}
${x} .cp-about{flex-wrap:wrap;gap:30px}
${x} .cp-about-media,${x} .cp-about-text{flex:none;width:100%}
${x} .cp-about-main{margin-top:8em}
${x} .cp-split{flex-direction:column;padding-inline:2em}
${x} .cp-split-text{flex:none;width:100%;padding:5em 0}
${x} .cp-split-img{flex:none;width:100%;min-height:40vh}
${x} .cp-split h3.cp-split-title{font-size:2.5rem}
${x} .cp-ibox{gap:30px}
${x} .cp-ibox-icon{font-size:55px}
${x} .cp-steps{padding:4em 0 5em}
${x} .cp-steps .cp-center-text{width:100%}
${x} .cp-step{flex:none;width:100%}
${x} .cp-video-title{font-size:38px}
${x} .cp-depo{padding:1em 0 10em}
${x} .cp-depo .cp-center-text{width:100%}
${x} .cp-depo-grid{justify-content:center}
${x} .cp-depo-card{width:60%}
${x} .cp-offer-box{flex-wrap:wrap}
${x} .cp-offer-left,${x} .cp-offer-right{flex:none;width:100%}
${x} .cp-offer-right{padding:0 0 4em;align-items:center;text-align:center}
${x} .cp-faq{padding:4em 0 3em}
${x} .cp-faq-in{flex-wrap:wrap}
${x} .cp-faq-text,${x} .cp-faq-list{flex:none;width:100%}
${x} .cp-faq-text{text-align:center}
${x} .cp-faq-text p{width:100%}
${x} .cp-faq-list{padding-top:2em}
`;

const mobile = (x: string) => `
${x}{line-height:1.5em}
${x} .cp-head-in{flex-wrap:wrap;gap:10px}
${x} .cp-head-logo{width:95%}
${x} .cp-head-logo img{max-width:100%;margin-inline:auto}
${x} .cp-head-action{order:-1;width:100%}
${x} .cp-head-action .cp-btn{display:block;text-align:center}
${x} .cp-hero{padding-top:3em}
${x} .cp-eyebrow{line-height:1.5em}
${x} .cp-hero-title{font-size:2.8rem}
${x} .cp-hero-btns{flex-wrap:wrap}
${x} .cp-hero-btns>:first-child,${x} .cp-hero-btns>:last-child{width:100%;text-align:center}
${x} .cp-hero-btns .cp-btn{font-size:1.2rem}
${x} .cp-hero-img{margin:0 0 7em}
${x} .cp-hero-badge{display:none}
${x} .cp-stats-box{padding:3em 1em}
${x} .cp-h2{font-size:2.5rem}
${x} .cp-h3{font-size:2rem}
${x} .cp-slider-title{width:100%;font-size:2rem}
${x} .cp-slider-action{width:100%;flex:none;text-align:left}
${x} .cp-slider-box{--cp-v:1}
${x} .cp-about-media{flex-wrap:wrap}
${x} .cp-about-main,${x} .cp-about-side{margin:0}
${x} .cp-about-text .cp-about-list{width:100%}
${x} .cp-split{padding-inline:0}
${x} .cp-split-text{padding:5em 2em}
${x} .cp-split .cp-eyebrow,${x} .cp-split-title,${x} .cp-split-lead{text-align:center}
${x} .cp-split h3.cp-split-title{font-size:2rem;line-height:1.5em}
${x} .cp-ibox{flex-direction:column;text-align:center;gap:15px}
${x} .cp-steps{padding:4em 0 0}
${x} .cp-step{padding:10em 1em 1em}
${x} .cp-step-in{flex-wrap:wrap;padding:2em 1em;text-align:center;justify-content:center}
${x} .cp-step-text{width:100%}
${x} .cp-step-action{width:100%;text-align:center}
${x} .cp-depo{padding:0 0 5em}
${x} .cp-depo-card{width:100%;padding:3em 1em}
${x} .cp-offer-box{padding-inline:1em}
${x} .cp-offer-tag{left:80px;top:-10px;font-size:12px}
${x} .cp-offer-title{font-size:35px}
${x} .cp-offer-sub{width:80%;font-size:17px}
${x} .cp-offer-price{font-size:3.5em;line-height:1.3em}
${x} .cp-offer-period{font-size:15px}
${x} .cp-faq{padding:3em 0}
${x} .cp-faq-item summary h5{padding:0}
`;

export const patrimonialCss = `
${S}{font-size:16px;line-height:1.9;color:var(--sb-fg);background:var(--sb-bg)}
${S} p{margin:0 0 20px}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5,${S} h6{margin:0;color:var(--cp-dark);font-family:var(--sb-font-heading)}
${S} main{padding-top:0!important}
${S} .cp-wrap{width:100%;max-width:1340px;margin-inline:auto}
${S} .cp-btn{display:inline-block;padding:16px 32px;border-radius:12px;background:var(--sb-accent);color:var(--sb-bg);font-family:var(--sb-font-accent);font-size:1.1rem;font-weight:500;line-height:1.5em;text-align:center;transition:transform .3s,background-color .3s,color .3s}
${S} .cp-btn:hover,${S} .cp-btn:focus{transform:scale(.9)}
${S} .cp-btn.outline{border:1px solid var(--sb-accent);background:transparent;color:var(--sb-accent)}
${S} .cp-btn.outline:hover,${S} .cp-btn.outline:focus{background:var(--sb-bg);color:var(--cp-dark)}
${S} .cp-eyebrow{margin:0 0 20px;color:var(--sb-accent);font-size:1.2rem;font-weight:400;line-height:1.2em}
${S} .cp-h2{font-size:4rem;font-weight:700;line-height:1.5em}
${S} .cp-h3{font-size:3.5rem;font-weight:700;line-height:1.5em}
${S} .cp-h4{font-size:1.6rem;font-weight:600;line-height:1.5em}
${S} .cp-center{text-align:center}
${S} .cp-center>.cp-eyebrow,${S} .cp-center>h2,${S} .cp-center>h3{width:100%}
${S} .cp-center-text{margin-inline:auto}
${S} .cp-check{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
${S} .cp-check li{display:flex;align-items:center;gap:8px;color:var(--cp-dark);line-height:1.5}
${S} .cp-check svg{flex:none;width:20px;height:20px;fill:var(--sb-accent)}

${S} .cp-head{position:relative;z-index:2;padding:1em 0;background:var(--cp-white)}
${S} .cp-head-in{display:flex;justify-content:space-between;align-items:center}
${S} .cp-head-logo{display:block;width:22%}
${S} .cp-head-logo img{max-width:185px}
${S} .cp-head-action{text-align:right}

${S} .cp-hero{display:flex;padding-top:5em}
${S} .cp-hero-text{flex:0 1 65%;min-width:0;padding:10px}
${S} .cp-hero .cp-eyebrow{color:var(--cp-dark)}
${S} .cp-hero-title{margin-bottom:20px;font-family:var(--sb-font-accent);font-size:5rem;font-weight:600;line-height:1.3em;letter-spacing:-2px}
${S} .cp-hero-lead p{margin:0}
${S} .cp-hero-lead .note{text-decoration:underline}
${S} .cp-hero-btns{display:flex;gap:20px;margin-top:20px}
${S} .cp-hero-btns>:first-child{width:41%;text-align:center}
${S} .cp-hero-btns>:last-child{width:43%}
${S} .cp-hero-media{display:flex;flex:0 1 50%;flex-direction:column;justify-content:center;min-width:0}
${S} .cp-hero-img{width:100%;margin:5em 0 -5em}
${S} .cp-hero-img img{width:100%}
${S} .cp-hero-badge{position:relative;align-self:flex-end;width:46%;margin:-12em 0 12em;padding:15px 15px 15px 30px;border:1px solid var(--cp-soft);border-radius:12px;background:#FDFDFDD1;color:var(--cp-dark)}
${S} .cp-hero-badge h3{font-size:1.5rem;font-weight:600;line-height:1.2em}
${S} .cp-hero-badge p{margin:0}

${S} .cp-stats{position:relative;margin-top:-7em;padding-bottom:3em}
${S} .cp-stats-box{display:flex;gap:20px;padding:3em;border-radius:25px;background:#000}
${S} .cp-stat{flex:1;min-width:0;padding:10px}
${S} .cp-stat-top{display:flex;gap:20px}
${S} .cp-stat-icon{margin-top:10px;color:var(--sb-accent)}
${S} .cp-stat-icon svg{display:block;width:50px;height:50px;fill:currentColor}
${S} .cp-stat-icon svg.line{fill:none;stroke:currentColor;stroke-width:1}
${S} .cp-stat-num{color:#fff;font-family:var(--sb-font-accent);font-size:69px;font-weight:600;line-height:1}
${S} .cp-stat-label{display:flex;margin-top:-10px;padding:10px 0 0;color:#fff;font-family:var(--sb-font-heading);font-size:20px}

${S} .cp-slider{padding:3em 0 7em}
${S} .cp-slider-head{display:flex;flex-wrap:wrap;justify-content:space-between;padding-inline:10px}
${S} .cp-slider-head .cp-eyebrow{width:100%}
${S} .cp-slider-title{width:77%;font-family:var(--sb-font-accent);font-size:3rem;font-weight:600;line-height:1.5em}
${S} .cp-slider-action{align-self:center;width:21%;text-align:right}
${S} .cp-slider-box{--cp-v:4;--cp-g:20px;padding:20px}
${S} .cp-slider-view{overflow:hidden}
${S} .cp-slider-track{display:flex;gap:var(--cp-g);cursor:grab;touch-action:pan-y;will-change:transform}
${S} .cp-slide{flex:none;width:calc((100% - (var(--cp-v) - 1)*var(--cp-g))/var(--cp-v))}
${S} .cp-slide img{width:100%;object-fit:cover;object-position:center;user-select:none;-webkit-user-drag:none}
${S} .cp-card{height:100%;overflow:hidden;border-radius:25px;background:var(--cp-dark)}
${S} .cp-card-body{display:flex;flex-direction:column;padding:30px}
${S} .cp-card-head{display:flex;flex-direction:column;align-items:start;margin-bottom:.5rem}
${S} .cp-card h6{color:var(--cp-white);font-size:1.5rem;font-weight:600;line-height:1.2em}
${S} .cp-card-sub{color:var(--sb-accent);font-family:var(--sb-font-accent);font-size:1.1rem;font-weight:500;line-height:1.5em}
${S} .cp-card p{margin:0;color:var(--sb-fg);text-align:left}
${S} .cp-dots{display:flex;justify-content:center;align-items:center;gap:.5rem;padding:1rem}
${S} .cp-dot{width:8px;height:8px;padding:0;border:0;border-radius:12px;background:#aaa;cursor:pointer;transition:all .5s ease}
${S} .cp-dot.on{width:24px;background:#161616}

${S} .cp-about{display:flex;justify-content:space-between;align-items:center;padding-bottom:7em}
${S} .cp-about-media{display:flex;flex:0 1 50%;gap:20px;min-width:0}
${S} .cp-about-main{position:relative;z-index:1;margin-top:5em}
${S} .cp-about-side{position:relative;z-index:9;margin-left:-7em}
${S} .cp-about-media img{border-radius:25px}
${S} .cp-about-text{display:flex;flex:0 1 43%;flex-wrap:wrap;justify-content:space-between;gap:20px 0;min-width:0}
${S} .cp-about-text>*{width:100%}
${S} .cp-about-text .cp-eyebrow,${S} .cp-about-text p{margin:0}
${S} .cp-about-text .cp-about-list{width:48%}
${S} .cp-about-action{padding-top:1em}

${S} .cp-split{display:flex;justify-content:space-between;background:var(--cp-dark)}
${S} .cp-split-text{display:flex;flex:0 0 50%;flex-direction:column;gap:20px;min-width:0;padding:7em}
${S} .cp-split .cp-eyebrow{margin:0}
${S} h3.cp-split-title{color:var(--sb-bg);font-size:3.4rem;font-weight:700;line-height:1.2em}
${S} .cp-split-lead{margin:0 0 14.4px;color:var(--cp-panel)}
${S} .cp-ibox{display:flex;align-items:center;gap:40px}
${S} .cp-ibox-icon{display:inline-flex;flex:none;padding:25px;border-radius:50%;background:var(--sb-bg);color:var(--sb-accent);font-size:35px}
${S} .cp-ibox-icon svg{display:block;width:1em;height:1em;fill:currentColor}
${S} .cp-ibox h4{margin-bottom:5px;color:var(--sb-bg)}
${S} .cp-ibox p{margin:0;color:var(--cp-soft)}
${S} .cp-split-img{flex:0 0 50%;background-position:center;background-size:cover}

${S} .cp-steps{padding:7em 0}
${S} .cp-steps .cp-center-text{width:75%}
${S} .cp-section-eyebrow{margin-bottom:20px}
${S} .cp-steps-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin-top:20px}
${S} .cp-step{display:flex;flex:0 1 49%;flex-direction:column;justify-content:flex-end;padding:15em 2em 2em;border-radius:25px;background-position:center;background-size:cover}
${S} .cp-step-in{display:flex;align-items:center;gap:20px;padding:2em;border-radius:12px;background:var(--cp-panel)}
${S} .cp-step-text{flex:1 1 0;min-width:0}
${S} .cp-step h4{margin-bottom:5px}
${S} .cp-step p{margin:0}
${S} .cp-step-action{flex:none;width:41.5%;text-align:right}

${S} .cp-video{padding:10px}
${S} .cp-video-title{margin-bottom:20px;font-size:55px;font-weight:700;line-height:1.5em;text-align:center}
${S} .cp-video-frame{position:relative;aspect-ratio:16/9;background:#000}
${S} .cp-video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
${S} .cp-video-space{height:50px}

${S} .cp-depo{padding:5em 0 10em}
${S} .cp-depo .cp-center-text{width:65%}
${S} .cp-depo-grid{display:flex;flex-wrap:wrap;justify-content:space-between;gap:20px 0;padding-top:1em}
${S} .cp-depo-card{width:32%;padding:3em;border-radius:25px;text-align:center}
${S} .cp-depo-card.dark{background:var(--cp-dark);color:#fff}
${S} .cp-depo-card.light{background:var(--cp-white)}
${S} .cp-depo-card.accent{background:var(--sb-accent);color:var(--cp-white)}
${S} .cp-depo-card img{width:60px;height:60px;margin:20px auto 20px;border-radius:50%;object-fit:cover}
${S} .cp-depo-name{display:block;color:var(--sb-accent);font-family:var(--sb-font-accent);font-size:1.1rem;font-weight:500;line-height:1.5em}
${S} .cp-depo-card.accent .cp-depo-name{color:var(--cp-dark)}
${S} .cp-depo-role{display:block;color:var(--sb-fg)}
${S} .cp-depo-card.accent .cp-depo-role{color:var(--cp-white)}

${S} .cp-offer{padding-bottom:100px}
${S} .cp-offer-box{display:flex;justify-content:space-between;gap:20px;padding:0 3em;border-radius:25px;background:var(--cp-dark)}
${S} .cp-offer-left{display:flex;flex:0 1 60%;justify-content:center;align-items:center;min-width:0;padding:4em 0}
${S} .cp-offer-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:20px;width:60%;padding:50px 3px;border-radius:10px;background:var(--sb-accent);color:var(--sb-bg);text-align:center}
${S} .cp-offer-tag{position:absolute;top:-15px;left:100px;padding:0 10px;border-radius:5px;background:var(--sb-bg);color:var(--sb-accent);font-weight:700}
${S} h1.cp-offer-title{color:var(--sb-bg);font-size:40px;font-weight:700;line-height:1.2}
${S} h2.cp-offer-sub{width:70%;color:var(--sb-bg);font-family:var(--sb-font-body);font-size:20px;font-weight:400;line-height:1.2}
${S} h2.cp-offer-price{margin-bottom:-20px;color:var(--sb-bg);font-size:4.1rem;font-weight:700;line-height:1.2em}
${S} h2.cp-offer-period{color:var(--sb-bg);font-family:var(--sb-font-body);font-size:17px;font-weight:400;line-height:1.2}
${S} .cp-offer-card .cp-check{align-items:center;margin:15px 0;gap:10px}
${S} .cp-offer-card .cp-check li{color:var(--sb-bg)}
${S} .cp-offer-card .cp-check svg{width:14px;height:14px;fill:var(--sb-bg)}
${S} .cp-btn.light{background:var(--sb-bg);color:var(--sb-accent);font-weight:700}
${S} .cp-offer-right{display:flex;flex:0 1 60%;flex-direction:column;justify-content:center;gap:20px;min-width:0;padding:4em 0}
${S} .cp-offer-right h3{color:var(--sb-bg)}
${S} .cp-offer-right p{width:85%;margin:0;color:var(--cp-soft)}

${S} .cp-faq{position:relative;padding:7em 0;background-position:center;background-size:cover}
${S} .cp-faq::before{content:"";position:absolute;inset:0;background:var(--cp-dark);opacity:.9}
${S} .cp-faq-in{position:relative;display:flex;justify-content:space-between}
${S} .cp-faq-text{flex:0 0 50%;min-width:0}
${S} .cp-faq-text h3{margin-bottom:20px;color:var(--sb-bg)}
${S} .cp-faq-text p{width:90%;margin:0;color:var(--cp-soft)}
${S} .cp-faq-list{display:flex;flex:0 0 50%;flex-direction:column;gap:.5rem;min-width:0}
${S} .cp-faq-item{interpolate-size:allow-keywords}
${S} .cp-faq-item::details-content{height:0;overflow:clip;transition:height .1s,content-visibility .1s allow-discrete}
${S} .cp-faq-item[open]::details-content{height:auto}
${S} .cp-faq-item summary{display:flex;align-items:center;padding:10px;border-radius:12px;background:var(--sb-accent);cursor:pointer;list-style:none;transition:all .5s}
${S} .cp-faq-item summary::-webkit-details-marker{display:none}
${S} .cp-faq-item[open] summary{background:var(--cp-white)}
${S} .cp-faq-item summary h5{width:100%;padding:7px 20px 0;color:var(--cp-white);font-size:1.2rem;font-weight:400;line-height:1.2em;text-align:left;transition:all .5s}
${S} .cp-faq-item[open] summary h5{color:var(--cp-dark)}
${S} .cp-faq-chev{flex:none;width:16px;height:16px;margin:0 20px;fill:none;stroke:var(--cp-dark);stroke-width:2;transition:transform .2s}
${S} .cp-faq-item[open] .cp-faq-chev{transform:rotate(180deg)}
${S} .cp-faq-a{padding:15px 30px;background:var(--cp-dark);color:var(--cp-soft);text-align:left}
${S} .cp-faq-a p{margin:0 0 7px}

${S} .cp-foot{padding:10px 0 1em;background:var(--cp-dark)}
${S} .cp-foot hr{margin:0 0 30px;border:0;border-top:1px solid var(--sb-fg)}
${S} .cp-foot p{margin:0;color:var(--sb-bg);text-align:center}

${S} .cp-404{padding:7em 0;text-align:center}
${S} .cp-404 p{margin:20px 0}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`.sb-narrow${S}`)}
${mobile(`.sb-narrow${S}`)}
`;
