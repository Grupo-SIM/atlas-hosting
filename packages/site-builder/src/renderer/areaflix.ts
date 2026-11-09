/**
 * Variante "areaflix" (`theme.variant = "areaflix"`): landing escura de plataforma de cursos, medida no
 * areaflix.simintermediacoes.com (Elementor). Tudo fica sob `.sb-af`, então as outras variantes não mudam.
 *
 * Breakpoints do original: tablet ≤ 1024 e celular ≤ 767 (e ≤ 480 para os botões duplos empilharem). O preview
 * estreito do editor (`.sb-narrow`) não enxerga media query, então cada regra de tela pequena existe duas vezes.
 */
export const isAreaflix = (theme: Record<string, string>) =>
  theme.variant === "areaflix";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: segunda cor do gradiente e fundo das seções alternadas. */
export function areaflixVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--af-orange": safe(theme.orange, "#ff5a19"),
    "--af-surface": safe(theme.surface, "#1d1d1d"),
  };
}

const S = ".sb-af";

const tablet = (x: string) => `
${x}{font-size:15px;line-height:1.5em}
${x} h1{font-size:48px}
${x} h2{font-size:36px}
${x} h3{font-size:24px}
${x}>.sb-block[data-block-type=afHeader]{margin-bottom:-105px}
${x} .sb-af-head-in{grid-template-columns:10% 50% 40%}
${x} .sb-af-intro{padding:2em}
${x} .sb-af-cta{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .sb-af-boxes{padding:3em 0}
${x} .sb-af-boxes-col{padding:1em}
${x} .sb-af-box-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-af-box h3{font-size:18px}
${x} .sb-af-box p{font-size:13px}
${x} .sb-af-video{padding:3em 0}
${x} .sb-af-guarantee{font-size:13px}
${x} .sb-af-testi{padding:3em 0}
${x} .sb-af-faq{padding:0 0 5em}
${x} .sb-af-faq-in{grid-template-columns:minmax(0,1fr)}
${x} .sb-af-faq-side{text-align:center}
${x} .sb-af-faq summary{font-size:16px}
${x} .sb-af-faq-a{font-size:15px}
${x} .sb-af-foot{padding:3em 0 2em;font-size:12px}
`;

const mobile = (x: string) => `
${x}{font-size:14px;line-height:1.5em}
${x} h1{font-size:38px}
${x} h2{font-size:28px}
${x}>.sb-block[data-block-type=afHeader]{margin-bottom:-98px}
${x} .sb-af-head-in{grid-template-columns:minmax(0,1fr)}
${x} .sb-af-head-gap{display:block;height:6px}
${x} .sb-af-logo{justify-self:center}
${x} .sb-af-btn{font-size:14px}
${x} .sb-af-hero{padding:12em 0 0}
${x} .sb-af-hero-in{padding:0;justify-items:center}
${x} .sb-af-hero h1{width:90%;max-width:90%}
${x} .sb-af-hero-text{width:86.4%;max-width:86.4%}
${x} .sb-af-hero .sb-af-btns{width:50%}
${x} .sb-af-intro{padding:1em}
${x} .sb-af-cta{grid-template-columns:minmax(0,1fr)}
${x} .sb-af-cta-card{min-height:450px}
${x} .sb-af-boxes{padding:0}
${x} .sb-af-boxes-col{padding:2em 1em}
${x} .sb-af-boxes-text{width:100%;max-width:100%}
${x} .sb-af-box-grid{grid-template-columns:minmax(0,1fr)}
${x} .sb-af-box p{font-size:12px}
${x} .sb-af-video{padding:3em 0 0}
${x} .sb-af-video-in{grid-template-columns:minmax(0,1fr)}
${x} .sb-af-video-text{padding:2em;text-align:center;justify-items:center}
${x} .sb-af-guarantee{font-size:12px}
${x} .sb-af-table{min-width:400px}
${x} .sb-af-testi{padding:2em 0}
${x} .sb-af-testi-in{padding:2em}
${x} .sb-af-car .sb-cslider-track>*{flex-basis:100%}
${x} .sb-af-faq{padding:2em 0}
${x} .sb-af-faq summary{font-size:14px}
${x} .sb-af-faq-a{font-size:14px}
${x} .sb-af-foot{padding:0;font-size:11px}
`;

/** Telas ≤ 480: os botões duplos empilham (`.ekit_double_button{display:block}` do original). */
const phone = (x: string) => `
${x} .sb-af-btns{display:block}
${x} .sb-af-btns .sb-af-btn{display:block;margin:0 0 10px}
`;

export const areaflixCss = `
${S}{font-size:16px;line-height:1.5em}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h5,${S} h6{margin:0;color:#fff}
${S} h1{font-size:72px;font-weight:700;line-height:1;letter-spacing:-2px}
${S} h2{font-size:48px;font-weight:700;line-height:1.1}
${S} h3{font-size:36px;font-weight:600;line-height:1.3}
${S} p{margin:0}
${S} a:hover{color:var(--sb-accent)}
${S} .sb-af-wrap{width:100%;max-width:1280px;margin:0 auto}

${S} .sb-af-btns{display:flex;align-items:center;gap:10px}
${S} .sb-af-btn{display:inline-block;width:100%;padding:10px 0;border-radius:30px;color:#fff;font-size:15px;font-weight:500;line-height:1.5;text-align:center;transition:all .4s ease}
${S} .sb-af-btn.ghost{border:2px solid var(--sb-accent);background:transparent}
${S} .sb-af-btn.ghost:hover{color:var(--sb-accent)}
${S} .sb-af-btn.fill{background-image:linear-gradient(135deg,var(--sb-accent) 0%,var(--af-orange) 100%);border:2px solid transparent;background-origin:border-box}
${S} .sb-af-btn.fill:hover{color:#fff;background-image:linear-gradient(135deg,var(--af-orange) 0%,var(--sb-accent) 100%)}
${S} .sb-af-pill{display:inline-block;padding:12px 24px;border-radius:30px;color:#fff;font-size:15px;font-weight:500;line-height:1;background-image:linear-gradient(135deg,var(--sb-accent) 0%,var(--af-orange) 100%)}
${S} .sb-af-pill:hover{color:#fff;background-image:linear-gradient(135deg,var(--af-orange) 0%,var(--sb-accent) 100%)}

${S}>.sb-block[data-block-type=afHeader]{position:sticky;top:0;z-index:9;margin-bottom:-7%}
${S} .sb-af-head{padding:10px;background:#000}
${S} .sb-af-head-in{display:grid;grid-template-columns:5% 69.333% 25.667%;align-items:center}
${S} .sb-af-logo{display:block;padding:10px;width:max-content}
${S} .sb-af-logo img{display:block;width:auto;height:40px;max-width:100%}
${S} .sb-af-head-btns{padding:10px}

${S} .sb-af-hero{position:relative;margin-top:20px;padding:22em 0 7em;background:center/cover no-repeat var(--af-bg,none)}
${S} .sb-af-hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(180deg,#00000085 0%,var(--sb-bg) 100%)}
${S} .sb-af-hero-in{position:relative;display:grid;grid-template-columns:minmax(0,1fr);gap:10px;justify-items:center;width:100%;max-width:840px;margin:0 auto;padding:3em}
${S} .sb-af-hero h1{width:102.688%;max-width:102.688%;text-align:center}
${S} .sb-af-hero-text{width:75.887%;max-width:75.887%;font-size:20px;text-align:center;margin-bottom:.9rem}
${S} .sb-af-hero .sb-af-btns{width:60%}
${S} .sb-af-hero .sb-af-btn{padding:15px 0}
${S} .sb-af-hero .sb-af-btn.ghost{font-size:14px;font-weight:700}

${S} .sb-af-intro{padding:5em 0;text-align:center}
${S} .sb-af-intro p{margin-bottom:.9rem}
${S} .sb-af-intro .sb-af-wrap{display:grid;gap:20px;padding:10px}

${S} .sb-af-cta{display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}
${S} .sb-af-cta-cell{padding:10px}
${S} .sb-af-cta-card{position:relative;display:flex;flex-wrap:wrap;align-content:flex-end;min-height:425px;padding:16px;overflow:hidden;border-radius:10px;color:#fff;text-align:center}
${S} .sb-af-cta-bg,${S} .sb-af-cta-ov{position:absolute;inset:0;transition:all 1.5s}
${S} .sb-af-cta-bg{background:center/cover no-repeat var(--af-bg,none)}
${S} .sb-af-cta-card:hover .sb-af-cta-bg,${S} .sb-af-cta-card:focus-within .sb-af-cta-bg{transform:scale(1.2)}
${S} .sb-af-cta-card:hover .sb-af-cta-ov,${S} .sb-af-cta-card:focus-within .sb-af-cta-ov{background-color:#000000b0}
${S} .sb-af-cta-item{position:relative;width:100%;opacity:0;transform:translateY(50px);transition:all 1s}
${S} .sb-af-cta-item:not(:last-child){margin-bottom:15px}
${S} .sb-af-cta-card:hover .sb-af-cta-item,${S} .sb-af-cta-card:focus-within .sb-af-cta-item{opacity:1;transform:none}
${S} .sb-af-cta-item svg{display:block;width:50px;height:50px;margin:0 auto}
${S} .sb-af-cta h5{font-size:18px;font-weight:600;line-height:1.5}
${S} .sb-af-cta-btn{display:inline-block;padding:10px 20px;border:1px solid #fff;border-radius:30px;font-size:13px;font-weight:500;line-height:1;color:#fff}
${S} .sb-af-cta-btn:hover{border-color:var(--sb-accent);color:var(--sb-accent)}

${S} .sb-af-boxes{padding:7em 0}
${S} .sb-af-boxes-col{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;padding:10px;text-align:center}
${S} .sb-af-boxes-text{width:59.742%;max-width:59.742%;justify-self:center;margin-bottom:.9rem}
${S} .sb-af-box-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
${S} .sb-af-box-cell{padding:10px}
${S} .sb-af-box img{display:block;width:auto;max-width:100%;height:auto;margin:0 auto;border-radius:30px 30px 0 0}
${S} .sb-af-box-body{padding:2em;border-radius:0 0 30px 30px;background:var(--af-surface)}
${S} .sb-af-box h3{margin:0 0 14px;font-size:24px;line-height:1.4;transition:color .4s}
${S} .sb-af-box:hover h3{color:var(--sb-accent)}
${S} .sb-af-box p{margin:0 0 14px;font-size:14px;line-height:1.6}

${S} .sb-af-video{position:relative;padding:7em 0;background:top right no-repeat var(--af-bg,none),var(--af-surface)}
${S} .sb-af-video::before{content:"";position:absolute;inset:0;background:#000;opacity:.6}
${S} .sb-af-video-in{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
${S} .sb-af-video-text{display:grid;gap:20px;justify-items:start;padding:3em}
${S} .sb-af-video-text p{margin-top:10px}
${S} .sb-af-video-side{padding:10px}
${S} .sb-af-video-frame{position:relative;aspect-ratio:1.77777;background:#000}
${S} .sb-af-video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
${S} .sb-af-video-text .sb-af-pill{justify-self:start}

${S} .sb-af-price{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;width:100%;max-width:1300px;margin:0 auto;padding:10px;text-align:center}
${S} .sb-af-price>h2{margin-top:100px}
${S} .sb-af-price-sub{font-size:17px;margin-bottom:.9rem}
${S} .sb-af-table-box{overflow-x:auto;padding:24px 8px;max-width:100vw}
${S} .sb-af-table{width:100%;min-width:900px;margin:0 0 15px;border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;background:#181818;font-size:.9em}
${S} .sb-af-table th,${S} .sb-af-table td{padding:15px;border:1px solid hsla(0,0%,50%,.502);line-height:1.5;text-align:center;vertical-align:top;color:#fff}
${S} .sb-af-table th{font-size:1.1em;font-weight:700}
${S} .sb-af-table td{background:#181818}
${S} .sb-af-table tr:nth-child(odd)>td,${S} .sb-af-table tr:nth-child(odd)>th{background:hsla(0,0%,50%,.071)}
${S} .sb-af-table tr:hover>td,${S} .sb-af-table tr:hover>th{background:hsla(0,0%,50%,.102)}
${S} .sb-af-table td.feature{font-weight:500;text-align:left}
${S} .sb-af-soon{color:#888;font-size:1.2em}
${S} .sb-af-plan-price{color:#baff7b;font-size:1.2em;font-weight:700}
${S} .sb-af-plan-info{margin-top:2px;color:#aaa;font-size:.95em;white-space:pre-line}
${S} .sb-af-table .sb-af-pill{margin-top:8px;padding:10px 18px;font-size:1em;line-height:1.5;white-space:nowrap}
${S} .sb-af-guarantee{margin-bottom:100px;font-size:20px;line-height:1.6;color:var(--sb-fg)}

${S} .sb-af-testi{padding:2em;background:var(--af-surface)}
${S} .sb-af-testi-in{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;padding:3em;text-align:center}
${S} .sb-af-testi-in>p{margin-bottom:.9rem}
${S} .sb-af-car{position:relative;margin-top:10px;padding:0 20px}
${S} .sb-af-car .sb-cslider-track{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .sb-af-car .sb-cslider-track::-webkit-scrollbar{display:none}
${S} .sb-af-t{flex:0 0 calc((100% - 20px)/3);margin:0;padding:20px;scroll-snap-align:start;text-align:center}
${S} .sb-af-t blockquote{margin:0 0 20px;font-size:1.3em;font-style:italic;line-height:1.5}
${S} .sb-af-t figcaption{display:flex;align-items:center;justify-content:center;gap:20px;text-align:left}
${S} .sb-af-t img{width:50px;height:50px;margin:0;border-radius:999px;object-fit:cover}
${S} .sb-af-t cite{display:flex;flex-direction:column;font-size:14px;font-style:normal;line-height:1.5}
${S} .sb-af-t strong{font-weight:700}
${S} .sb-af-car .sb-cslider-nav button{position:absolute;top:calc(50% - 30px);width:20px;padding:0;border:0;background:none;color:#fff;font-size:30px;line-height:1;cursor:pointer}
${S} .sb-af-car .sb-cslider-nav button:first-child{left:0}
${S} .sb-af-car .sb-cslider-nav button:last-child{right:0}
${S} .sb-af-dots{display:flex;justify-content:center;gap:12px;padding:28px 0}
${S} .sb-af-dots button{width:6px;height:6px;padding:0;border:0;border-radius:50%;background:#fff;cursor:pointer}
${S} .sb-af-dots button.on{background:var(--sb-accent)}

${S} .sb-af-faq{padding:5em 0}
${S} .sb-af-faq-in{display:grid;grid-template-columns:35% 64.665%}
${S} .sb-af-faq-side{display:grid;gap:20px;align-content:start;padding:2em}
${S} .sb-af-faq-side h6{font-size:16px;font-weight:500;line-height:1.4;color:var(--sb-accent)}
${S} .sb-af-faq-list{padding:2em}
${S} .sb-af-faq details:not(:last-child){margin-bottom:10px}
${S} .sb-af-faq summary{position:relative;display:block;padding:25px 60px 25px 25px;border:1px solid transparent;border-radius:10px;background:#fff;color:#141414;font-family:var(--sb-font-heading);font-size:18px;font-weight:600;line-height:1.5;cursor:pointer;list-style:none;transition:all .4s ease}
${S} .sb-af-faq summary::-webkit-details-marker{display:none}
${S} .sb-af-faq summary::after{content:"";position:absolute;top:calc(50% - 7px);right:30px;width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg)}
${S} .sb-af-faq details[open] summary{border-radius:10px 10px 0 0;background-image:linear-gradient(135deg,var(--sb-accent) 0%,var(--af-orange) 100%);color:#fff}
${S} .sb-af-faq details[open] summary::after{top:calc(50% - 2px);transform:rotate(225deg)}
${S} .sb-af-faq-a{padding:25px;border-radius:0 0 10px 10px;background:#fff;color:#141414;font-size:16px;line-height:1.5}

${S} .sb-af-foot{padding:0 0 1em;background:#000;color:#b4b4b4;font-size:15px;font-weight:300;line-height:1.6;text-align:center}
${S} .sb-af-foot p{padding:36px 10px 20px}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
@media (max-width:500px){${S} .sb-af-table-box{padding:6px 0}}
@media (max-width:480px){${phone(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
