/**
 * Variante "resolvit" (`theme.variant = "resolvit"`): landing clara de método de saúde (azul `#0028ff`), medida no
 * resolvit.centraldomarketing.com (Elementor + Hello). Tudo fica sob `.sb-rv`, então as outras variantes não mudam.
 *
 * Breakpoints do original: tablet ≤ 1024 e celular ≤ 767. O preview estreito do editor (`.sb-narrow`) não enxerga
 * media query, então cada regra de tela pequena existe duas vezes.
 */
export const isResolvit = (theme: Record<string, string>) =>
  theme.variant === "resolvit";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens extras: azul escuro (títulos/hover), azul médio (gradientes), fundo claro e borda. */
export function resolvitVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--rv-dark": safe(theme.dark, "#062d92"),
    "--rv-ink": safe(theme.ink, "#1b262c"),
    "--rv-line": safe(theme.line, "#becbff"),
    "--rv-mid": safe(theme.mid, "#0962ea"),
    "--rv-soft": safe(theme.soft, "#f2f7ff"),
  };
}

const S = ".sb-rv";

const tablet = (x: string) => `
${x} h1{font-size:60px}
${x} h2{font-size:50px}
${x} .sb-rv-logo img{max-width:45%}
${x} .sb-rv-hero{padding:80px 20px}
${x} .sb-rv-pain-title h2{font-size:45px}
${x} .sb-rv-pain{grid-template-columns:minmax(0,1fr);margin-bottom:70px}
${x} .sb-rv-pain-img.a,${x} .sb-rv-pain-img.b{display:none}
${x} .sb-rv-trust{grid-template-columns:minmax(0,1fr)}
${x} .sb-rv-photo{margin:0 0 40px 20px}
${x} .sb-rv-method{margin-bottom:70px;padding:0}
${x} .sb-rv-method-in{margin-left:10px}
${x} .sb-rv-method h2{font-size:50px}
${x} .sb-rv-change{grid-template-columns:minmax(0,1fr);margin-top:100px}
${x} .sb-rv-change-img{display:none}
${x} .sb-rv-receive{margin-bottom:70px}
${x} .sb-rv-receive>h2{margin-top:0}
${x} .sb-rv-rgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sb-rv-results{grid-template-columns:minmax(0,1fr);margin-bottom:70px}
${x} .sb-rv-results-photo{padding-top:0}
${x} .sb-rv-results-photo img{margin-top:0}
${x} .sb-rv-results-copy h2{font-size:50px}
${x} .sb-rv-car{margin-left:0}
${x} .sb-rv-t{flex-basis:calc((100% - 10px)/2)}
${x} .sb-rv-steps{margin:30px 0}
${x} .sb-rv-steps h2{font-size:50px}
${x} .sb-rv-offer-title h2{font-size:50px}
${x} .sb-rv-offer{grid-template-columns:minmax(0,1fr)}
${x} .sb-rv-price{width:50%;justify-self:center}
${x} .sb-rv-faq{padding:30px 20px}
${x} .sb-rv-faq-body{grid-template-columns:minmax(0,1fr)}
`;

const mobile = (x: string) => `
${x}{font-size:14px;line-height:1.6em}
${x} h1,${x} h2{font-size:40px;line-height:1.3em}
${x}>.sb-block[data-block-type=rvHeader]{position:static}
${x} .sb-rv-head-in{flex-wrap:wrap;justify-content:center;gap:8px;padding-top:20px}
${x} .sb-rv-logo img{max-width:50%;margin:0 auto}
${x} .sb-rv-hero{padding:50px 0}
${x} .sb-rv-hero h1{font-size:40px;text-align:center}
${x} .sb-rv-hero-text{font-size:15px;text-align:center}
${x} .sb-rv-hero-in{text-align:center}
${x} .sb-rv-btn{font-size:14px;line-height:1.5em}
${x} .sb-rv-hero .sb-rv-btn{margin-bottom:40px}
${x} .sb-rv-tcard{margin:0 0 40px;text-align:center}
${x} .sb-rv-tcard .sb-rv-ticon{margin:0 auto -50px}
${x} .sb-rv-photo{margin:50px 10px 20px 20px}
${x} .sb-rv-pain-title h2{font-size:40px;line-height:48px}
${x} .sb-rv-pain-title{text-align:start}
${x} .sb-rv-pain-copy{margin-bottom:0}
${x} .sb-rv-pain-copy p{font-size:15px}
${x} .sb-rv-method{padding:100px 20px 50px;margin-bottom:50px}
${x} .sb-rv-method-in{margin:0;text-align:center}
${x} .sb-rv-method h2{font-size:40px;line-height:48px}
${x} .sb-rv-method p{font-size:15px}
${x} .sb-rv-method .sb-rv-btn{margin-bottom:40px}
${x} .sb-rv-change{margin-top:0}
${x} .sb-rv-change-title{margin:0;padding:60px 0;text-align:center}
${x} .sb-rv-change-title .sb-rv-ticon{margin:0 auto}
${x} .sb-rv-change-box{margin:0;padding:60px 20px;text-align:center}
${x} .sb-rv-receive{margin-bottom:50px}
${x} .sb-rv-receive>h2{margin:0;font-size:40px;text-align:center;line-height:1.4em}
${x} .sb-rv-rgrid{grid-template-columns:minmax(0,1fr)}
${x} .sb-rv-rcard{margin-bottom:20px}
${x} .sb-rv-results{margin:150px 0 50px}
${x} .sb-rv-results-copy{text-align:center;padding:0}
${x} .sb-rv-results-copy h2{font-size:38px;line-height:1.4em}
${x} .sb-rv-results-copy h2.blue{font-size:35px}
${x} .sb-rv-results-copy p{font-size:15px}
${x} .sb-rv-t{flex-basis:100%}
${x} .sb-rv-steps{margin:30px 0}
${x} .sb-rv-steps-in{padding:30px 20px}
${x} .sb-rv-steps h2{font-size:40px;line-height:.9em;text-align:center}
${x} .sb-rv-steps-sub{text-align:center;font-size:15px}
${x} .sb-rv-steps-list{grid-template-columns:minmax(0,1fr);justify-items:center}
${x} .sb-rv-step{text-align:center}
${x} .sb-rv-step p{font-size:15px}
${x} .sb-rv-banner img{height:500px;object-fit:cover;object-position:center left}
${x} .sb-rv-offer{margin-bottom:50px}
${x} .sb-rv-offer-title h2{font-size:36px;line-height:1.3em}
${x} .sb-rv-offer-title h2.blue{font-size:30px;line-height:1.4em}
${x} .sb-rv-price{width:100%}
${x} .sb-rv-price h3{font-size:30px;line-height:1.2em}
${x} .sb-rv-faq{padding:20px 10px}
${x} .sb-rv-faq-img{min-height:1000px;padding:60px 100px}
`;

export const resolvitCss = `
${S}{background:#fff;font-size:17px;line-height:1.7em}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h5,${S} h6{margin:0;color:var(--rv-ink);font-family:var(--sb-font-heading)}
${S} h1{color:var(--rv-dark);font-size:70px;font-weight:800;line-height:1.2em}
${S} h2{font-size:60px;font-weight:800;line-height:1.2em}
${S} h2.blue{color:var(--rv-dark)}
${S} h3{font-size:40px;font-weight:800;line-height:1.2em}
${S} h5{font-size:24px;font-weight:700;line-height:1.25em}
${S} h6{font-size:18px;font-weight:600;line-height:1.5em}
${S} p{margin:0}
${S} .sb-rv-wrap{width:100%;max-width:1140px;margin:0 auto}

${S} .sb-rv-btn{display:inline-block;padding:15px 60px;border:1px solid var(--sb-accent);border-radius:50px;background:var(--sb-accent);color:#fff;font-family:var(--sb-font-heading);font-size:18px;font-weight:600;line-height:28px;text-align:center;transition:all .3s}
${S} .sb-rv-btn:hover{border-color:var(--rv-dark);border-radius:0 20px 0 20px;background:var(--rv-dark);color:#fff}
${S} .sb-rv-btn.shadow{text-shadow:0 0 10px rgba(0,0,0,.3);box-shadow:0 0 10px rgba(0,0,0,.5)}

${S}>.sb-block[data-block-type=rvHeader]{position:sticky;top:var(--sb-sticky-top,0px);z-index:9}
${S} .sb-rv-head{background:#fff;box-shadow:0 10px 20px rgba(0,40,255,.08)}
${S} .sb-rv-head-in{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px}
${S} .sb-rv-logo{display:block;flex:1}
${S} .sb-rv-logo img{display:block;width:auto;max-width:25%;height:auto;min-width:100px}
${S} .sb-rv-head .sb-rv-btn{padding:10px 30px;font-size:15px}

${S} .sb-rv-hero{padding:100px 0;background-image:linear-gradient(360deg,#fff 32%,var(--rv-soft) 53%)}
${S} .sb-rv-hero-in{display:grid;justify-items:start;padding:0 10px}
${S} .sb-rv-hero h1{margin-bottom:20px;font-size:69px}
${S} .sb-rv-hero-text{max-width:720px;margin-bottom:40px}
${S} .sb-rv-hero .sb-rv-btn{margin-bottom:70px}

${S} .sb-rv-trust{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
${S} .sb-rv-trust-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-content:start}
${S} .sb-rv-tcard{margin:10px;padding:40px 20px 20px 40px;border-radius:30px 0 30px 0;background:#fff;box-shadow:0 0 15px rgba(0,40,255,.13);transition:border-radius .3s}
${S} .sb-rv-tcard:hover{border-radius:0 30px 0 30px}
${S} .sb-rv-ticon{display:block;width:60px;height:60px;margin-bottom:-50px;color:var(--sb-accent)}
${S} .sb-rv-ticon svg{display:block;width:100%;height:100%;fill:currentColor}
${S} .sb-rv-ticon.plain{width:36px;height:36px;margin:0}
${S} .sb-rv-tcard h5{margin-top:60px;margin-bottom:6px}
${S} .sb-rv-photo{margin:50px 0 0 50px;padding:0 30px 30px 0;border-radius:100px 0 100px 0;background:var(--sb-accent)}
${S} .sb-rv-photo img{display:block;width:100%;height:auto;margin:-30px 0 0 -30px;border-radius:100px 0 100px 0;transition:filter .3s}
${S} .sb-rv-photo:hover img{filter:saturate(1.26)}

${S} .sb-rv-pain{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:100px}
${S} .sb-rv-pain-title{grid-column:1/-1;text-align:center;margin-bottom:20px}
${S} .sb-rv-pain-title h2:first-child{margin-bottom:-20px}
${S} .sb-rv-pain-copy{display:flex;flex-direction:column;align-items:flex-start;padding:10px}
${S} .sb-rv-pain-copy h2{margin-bottom:15px;font-size:40px}
${S} .sb-rv-pain-copy p{margin-bottom:40px}
${S} .sb-rv-pain-copy h6{margin-bottom:10px;font-size:24px}
${S} .sb-rv-play{display:block;width:60px;height:60px;color:var(--sb-accent);animation:sb-rv-pulse 1s infinite alternate}
${S} .sb-rv-play svg{display:block;width:100%;height:100%;fill:currentColor}
${S} .sb-rv-play:hover{color:var(--rv-dark)}
${S} .sb-rv-pain-img{display:flex;align-items:center;justify-content:flex-end}
${S} .sb-rv-pain-img img{display:block;width:100%;height:auto;box-shadow:0 0 40px rgba(0,40,255,.17);transition:filter .3s}
${S} .sb-rv-pain-img.a{position:relative;z-index:2;margin-right:-100px}
${S} .sb-rv-pain-img:hover img{filter:saturate(1.2)}
@keyframes sb-rv-pulse{from{transform:scale(1)}to{transform:scale(1.1)}}

${S} .sb-rv-method{margin-bottom:180px;padding-top:100px;background:center/cover no-repeat var(--rv-bg,none)}
${S} .sb-rv-method-in{max-width:600px;margin-left:max(10px,calc((100% - 1140px)/2));padding:0 10px}
${S} .sb-rv-method h2{margin-bottom:15px;font-size:60px}
${S} .sb-rv-method p{margin-bottom:30px;color:#000}

${S} .sb-rv-change{display:grid;grid-template-columns:1fr 1.2fr 1fr;align-items:stretch;margin-top:120px;margin-bottom:100px}
${S} .sb-rv-change-title{position:relative;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;margin:-60px 0 -80px;padding:80px 0 80px 30px;background:center/cover no-repeat var(--rv-bg,none)}
${S} .sb-rv-change-title::before{content:"";position:absolute;inset:0;background:#fff;opacity:.5;transition:opacity .3s}
${S} .sb-rv-change-title:hover::before{opacity:.7}
${S} .sb-rv-change-title>*{position:relative}
${S} .sb-rv-change-title h2{font-size:48px}
${S} .sb-rv-change-title h2.blue{color:var(--sb-accent)}
${S} .sb-rv-change-title h2:nth-child(2){margin-bottom:10px;color:#000}
${S} .sb-rv-change-box{display:flex;align-items:center;justify-content:center;padding:60px 15px 60px 30px;background-image:linear-gradient(170deg,var(--sb-accent) 0%,var(--rv-mid) 100%);transition:background .5s}
${S} .sb-rv-change-box:hover{background-image:linear-gradient(340deg,var(--sb-accent) 0%,var(--rv-dark) 100%)}
${S} .sb-rv-change-box h5{color:#fff;font-weight:600}
${S} .sb-rv-change-img img{display:block;width:100%;height:100%;object-fit:cover}

${S} .sb-rv-receive{margin-bottom:100px}
${S} .sb-rv-receive>h2{margin-top:200px;margin-bottom:50px;font-size:48px}
${S} .sb-rv-rgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px 10px}
${S} .sb-rv-rcard{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:500px;padding:350px 20px 40px;overflow:hidden;background:center/cover no-repeat var(--rv-bg,none);color:#fff}
${S} .sb-rv-rcard::before{content:"";position:absolute;inset:0;background-image:linear-gradient(190deg,#ffffff0d 45%,var(--sb-accent) 73%);transition:all .3s}
${S} .sb-rv-rcard:hover::before{background-image:none;background-color:var(--sb-accent);opacity:.6}
${S} .sb-rv-rcard>*{position:relative}
${S} .sb-rv-rcard h5{margin-bottom:10px;color:#fff}
${S} .sb-rv-rcard p{color:var(--rv-soft)}
${S} .sb-rv-rcard:hover{color:#fff}

${S} .sb-rv-results{display:grid;grid-template-columns:39.988fr 59.653fr;margin-bottom:100px}
${S} .sb-rv-results-photo{display:flex;justify-content:flex-end;background-image:linear-gradient(230deg,var(--rv-mid) 0%,var(--sb-accent) 100%)}
${S} .sb-rv-results-photo img{display:block;width:100%;height:auto;margin-top:-100px}
${S} .sb-rv-results-copy{display:flex;flex-direction:column;justify-content:center;min-width:0;padding-left:30px}
${S} .sb-rv-results-copy h2{font-size:48px}
${S} .sb-rv-results-copy h2.blue{margin-bottom:40px}
${S} .sb-rv-results-copy>p{margin-bottom:40px}
${S} .sb-rv-car{position:relative;margin-left:-120px}
${S} .sb-rv-car .sb-cslider-track{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .sb-rv-car .sb-cslider-track::-webkit-scrollbar{display:none}
${S} .sb-rv-t{flex:0 0 calc((100% - 40px)/3);margin:0;padding:40px 20px 40px 30px;border:1px solid var(--rv-line);border-radius:20px;background:#fff;scroll-snap-align:start}
${S} .sb-rv-t blockquote{margin:0 0 20px;color:#52575d;font-size:17px;font-weight:600}
${S} .sb-rv-t figcaption{display:flex;align-items:center;gap:10px}
${S} .sb-rv-t img{width:50px;height:50px;margin:0;border-radius:50%;object-fit:cover}
${S} .sb-rv-t cite{display:flex;flex-direction:column;color:#52575d;font-style:normal;line-height:1.4}
${S} .sb-rv-t cite span{color:var(--rv-mid);font-style:italic;font-weight:300}
${S} .sb-rv-dots{display:flex;justify-content:center;gap:10px;padding:24px 0}
${S} .sb-rv-dots button{width:12px;height:12px;padding:0;border:0;border-radius:50%;background:#ccc;cursor:pointer}
${S} .sb-rv-dots button.on{background:var(--rv-mid)}

${S} .sb-rv-steps{position:relative;margin:0 8%;background:center/cover no-repeat var(--rv-bg,none);z-index:2}
${S} .sb-rv-steps-ov{position:absolute;inset:0;background-image:linear-gradient(290deg,var(--rv-mid) 0%,var(--sb-accent) 100%);opacity:.85}
${S} .sb-rv-steps-in{position:relative;padding:6% 8%}
${S} .sb-rv-steps h2{color:#fff;font-size:60px}
${S} .sb-rv-steps-sub{margin-bottom:40px;color:#fff;font-weight:700}
${S} .sb-rv-steps-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
${S} .sb-rv-step{display:flex;flex-direction:column;align-items:flex-start}
${S} .sb-rv-num{display:inline-flex;align-items:center;justify-content:center;width:100px;height:100px;max-width:47%;border:1px solid #fff;border-radius:100px;color:#fff;font-family:var(--sb-font-heading);font-size:30px;font-weight:700}
${S} .sb-rv-step h6{margin:10px 0;color:var(--rv-soft);font-size:18px}
${S} .sb-rv-step p{color:#fff}

${S} .sb-rv-banner{margin-top:-200px;margin-bottom:100px;max-width:none}
${S} .sb-rv-banner img{display:block;width:100%;height:500px;object-fit:cover}

${S} .sb-rv-offer{display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;margin-bottom:50px}
${S} .sb-rv-offer-title{text-align:center;margin-bottom:40px}
${S} .sb-rv-offer-title h2.blue{margin-top:0}
${S} .sb-rv-price{position:relative;z-index:2;width:35%;min-width:300px;overflow:hidden;border-radius:30px;background:var(--sb-accent);box-shadow:0 0 40px rgba(0,40,255,.26);text-align:center}
${S} .sb-rv-price h3{padding:90px 20px 0;color:var(--rv-soft);font-size:30px;line-height:38px;font-weight:700}
${S} .sb-rv-price-v{display:flex;align-items:flex-start;justify-content:center;gap:2px;padding:40px 0 20px;color:#fff;font-family:var(--sb-font-heading);font-weight:800;line-height:50px}
${S} .sb-rv-price-v .cur{font-size:50px}
${S} .sb-rv-price-v .int{font-size:100px}
${S} .sb-rv-price-v .per{align-self:flex-end;color:var(--rv-line);font-family:var(--sb-font-body);font-size:17px;font-weight:400;line-height:26px}
${S} .sb-rv-price ul{margin:0;padding:0 0 40px;list-style:none;color:var(--rv-soft);line-height:26px}
${S} .sb-rv-price li{padding:15px 20px;position:relative}
${S} .sb-rv-price li::before{content:"";position:absolute;top:0;left:0;right:0;border-top:1px solid var(--rv-line)}
${S} .sb-rv-price-btn{display:inline-block;margin-bottom:90px;padding:15px 60px;border-radius:50px;background:var(--rv-soft);color:var(--sb-accent);font-family:var(--sb-font-heading);font-size:18px;font-weight:600;line-height:28px;transition:background .3s}
${S} .sb-rv-price-btn:hover{background:var(--rv-line);color:var(--sb-accent)}

${S} .sb-rv-faq{padding:150px 0 0;background-image:linear-gradient(0deg,#fff 0%,var(--rv-soft) 81%)}
${S} .sb-rv-faq-head{margin-bottom:50px;padding-left:12px}
${S} .sb-rv-faq-head h2{margin-bottom:20px;color:var(--rv-ink);font-weight:600}
${S} .sb-rv-faq-body{display:grid;grid-template-columns:60fr 40fr;gap:10px;margin-bottom:100px}
${S} .sb-rv-faq details{margin-bottom:10px;background:#fff}
${S} .sb-rv-faq summary{position:relative;display:block;padding:15px 60px 15px 15px;border:1px solid #fff;background:var(--rv-soft);color:var(--rv-ink);font-family:var(--sb-font-heading);font-size:18px;font-weight:500;line-height:28px;cursor:pointer;list-style:none;transition:color .3s}
${S} .sb-rv-faq summary::-webkit-details-marker{display:none}
${S} .sb-rv-faq summary::after{content:"+";position:absolute;top:15px;right:20px;font-size:22px}
${S} .sb-rv-faq details[open] summary{color:var(--sb-accent)}
${S} .sb-rv-faq details[open] summary::after{content:"−"}
${S} .sb-rv-faq-a{padding:15px 0 20px 15px;background:#fff}
${S} .sb-rv-faq-img{min-height:500px;border:1px solid var(--rv-line);background:center/cover no-repeat var(--rv-bg,none);position:relative}
${S} .sb-rv-faq-img::before{content:"";position:absolute;inset:0;background:#fff;opacity:.25}

${S} .sb-rv-foot{padding:30px 0;background:#fff;color:#000;text-align:center}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
