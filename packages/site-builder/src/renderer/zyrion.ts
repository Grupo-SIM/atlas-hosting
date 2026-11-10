/**
 * Variante "zyrion" (`theme.variant = "zyrion"`): portal de notícias claro e preto, medido no
 * zyrionbrazil.com (Elementor). Cabeçalho em duas faixas (data + redes / barra sticky com busca em tela
 * cheia), divisores de seção com linha, listas com miniatura, cartões, grade escura com véu e rodapé com
 * caixa CTA sobreposta. Tudo fica sob `.sb-zy`, então sites com outro estilo não mudam.
 *
 * Breakpoints do original (Elementor): tablet ≤ 1024 e celular ≤ 767. O preview estreito do editor
 * (`.sb-narrow`) não enxerga media query, então cada regra de tela pequena existe duas vezes.
 * Contêiner "boxed" medido: 1280px.
 */
export const isZyrion = (theme: Record<string, string>) =>
  theme.variant === "zyrion";

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens da variante (kit 12799 do original). */
export function zyrionVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--zy-accent": safe(theme.accent, "#000000"),
    "--zy-blue": safe(theme.blue, "#004cff99"),
    "--zy-dark": safe(theme.dark, "#141414"),
    "--zy-line": safe(theme.line, "#c6cedd"),
    "--zy-meta": safe(theme.meta, "#656b77"),
    "--zy-purple": safe(theme.purple, "#540cf19c"),
    "--zy-secondary": safe(theme.title, "#020817"),
    "--zy-soft": safe(theme.soft, "#ecf1ff"),
    "--zy-soft2": safe(theme.soft2, "#f1edfd"),
    "--zy-text": safe(theme.text, "#3c414c"),
  };
}

const S = ".sb-zy";
const W = 1280;

/** Tablet e celular (≤ 1024). */
const tablet = (x: string) => `
${x} .zy-top .zy-in{padding:0 40px}
${x} .zy-bar .zy-in{padding:16px 40px;gap:32px}
${x} .zy-logo{flex:0 0 48%}
${x} .zy-right{flex:0 0 47%;justify-content:flex-end}
${x} .zy-nav-toggle{display:flex}
${x} .zy-nav{position:absolute;top:100%;left:0;right:0;display:block;max-height:0;overflow:hidden;background:#fff;border:0 solid #fff;box-shadow:0 0 20px rgba(12,8,40,.1);transform:scaleY(0);transform-origin:top;transition:max-height .3s ease,transform .3s ease}
${x} .zy-nav-input:checked~.zy-nav{max-height:600px;transform:scaleY(1);border-width:8px}
${x} .zy-nav a{display:block;padding:10px 32px}
${x} .zy-nav a:hover,${x} .zy-nav a[aria-current=page]{background:var(--zy-soft)}
${x} .zy-pl{grid-template-columns:repeat(var(--zy-cols-t,var(--zy-cols,1)),minmax(0,1fr))}
${x} .zy-pl-item>a{flex-basis:var(--zy-thumb-t,var(--zy-thumb,24%))}
${x} .zy-foot-cols{flex-wrap:wrap;gap:48px}
${x} .zy-foot-cols>*{flex:0 0 46%;padding:0 40px}
`;

/** Celular (≤ 767). */
const mobile = (x: string) => `
${x} .zy-top .zy-in{padding:0 20px}
${x} .zy-bar .zy-in{padding:8px 20px;gap:24px}
${x} .zy-logo{flex-basis:41%}
${x} .zy-right{flex-basis:47.6%;gap:16px}
${x} .zy-nav a{padding:9px 20px}
${x} .zy-pl{grid-template-columns:repeat(var(--zy-cols-m,var(--zy-cols,1)),minmax(0,1fr))}
${x} .zy-pl-item>a{flex-basis:var(--zy-thumb-m,var(--zy-thumb,24%))}
${x} .zy-foot-cols>*{flex-basis:100%;padding:0}
`;

const tabletX = (x: string) => `
${x} .zy-pad{padding-left:40px;padding-right:40px}
${x} .zy-hero{padding:40px}
${x} .zy-hero-in{padding:0}
${x} .zy-hero-l,${x} .zy-hero-r{flex-basis:100%}
${x} .zy-hero-r{margin-top:4px}
${x} .zy-slider .zy-sl-track{gap:30px}
${x} .zy-sl-body h2{font-size:23px}
${x} .zy-trend-row{flex-direction:column}
${x} .zy-trend-l,${x} .zy-trend-r{flex:none}
${x} .zy-trend-r{margin-top:20px}
${x} .zy-boxes-grid{gap:24px}
${x} .zy-box{flex-basis:100%}
${x} .zy-dark-sec{padding:60px 0}
${x} .zy-ov-grid{--zy-cols:2}
${x} .zy-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .zy-car{--zy-per:1}
${x} .zy-split-in{flex-direction:column}
${x} .zy-split-a{flex:none}
${x} .zy-gbox{padding:var(--zy-pad-t,40px)}
${x} .zy-arch-head{padding:48px 0 40px}
${x} .zy-arch-in{width:80%}
${x} .zy-arch-grid{--zy-cols:2}
${x} .zy-post-head{text-align:center}
${x} .zy-post-meta{justify-content:center}
${x} .zy-post-head h1{font-size:32px}
${x} .zy-more-grid{--zy-cols:2}
${x} .zy-nf{margin-bottom:-110px;padding:60px 40px 196px}
${x} .zy-comm-row{flex-direction:column}
${x} .zy-comm-l{flex:none}
${x} .zy-comm-r img{min-height:738px;object-fit:cover}
${x} .zy-price{margin-left:0;margin-right:0}
${x} .zy-nf .zy-sform button{min-width:56px}
`;

const mobileX = (x: string) => `
${x} .zy-pad{padding-left:16px;padding-right:16px}
${x} .zy-hero{padding:16px}
${x} .zy-hero-r{padding:20px}
${x} .zy-ov strong{font-size:23px}
${x} .zy-ov{padding:20px}
${x} .zy-ov-grid{--zy-cols:1}
${x} .zy-tiles{display:flex}
${x} .zy-trend-l,${x} .zy-trend-r{--zy-cols:1}
${x} .zy-trend-r{--zy-cols:2;--zy-gap:8px}
${x} .zy-box{padding:20px}
${x} .zy-car{--zy-off:24px}
${x} .zy-gbox{padding:var(--zy-pad-m,20px)}
${x} .zy-cards-grid{--zy-cols:1}
${x} .zy-arch-head{padding:48px 0 20px}
${x} .zy-arch-grid{--zy-cols:1}
${x} .zy-card.v-archive .zy-card-img img{aspect-ratio:.5}
${x} .zy-post-head h1{font-size:32px}
${x} .zy-post-meta{flex-direction:column;gap:12px}
${x} .zy-avatar.sm{width:24px;height:24px}
${x} .zy-share{flex-direction:column;align-items:flex-start}
${x} .zy-brandbox{margin:0 0 40px}
${x} .zy-brandbox img{width:140px}
${x} .zy-more-sec{padding:32px 12px}
${x} .zy-more-grid{--zy-gap:12px;padding:0}
${x} .zy-div.big{gap:16px}
${x} .zy-nf{margin-bottom:-190px}
${x} .zy-nf-grid{--zy-cols:2;--zy-gap:12px}
${x} .zy-nf .zy-sform button{min-width:44px}
${x} .zy-comm{padding:0 16px 60px}
${x} .zy-comm-mobile{display:block}
${x} .zy-comm-r{display:none}
${x} .zy-comm-others a{flex-basis:calc(50% - 10px)}
${x} .zy-bio-pic{width:115px;height:115px}
`;

export const zyrionCss = `
${S}{--zy-w:${W}px;font-family:'Inter',sans-serif;color:var(--zy-text);background:#fff;font-size:16px;line-height:1.6}
${S} a{color:var(--zy-secondary)}
${S} a:hover{color:var(--zy-accent)}
${S} img{border-radius:0}
${S} main{padding:0!important}
${S} .zy-in{width:100%;max-width:var(--zy-w);margin:0 auto}
${S} .sb-block[data-block-type=zyHeader]{position:sticky;top:calc(var(--sb-sticky-top,0px) - var(--zy-top-h,38px));z-index:99}
${S} .zy-top{height:var(--zy-top-h,38px);background:#000;color:rgba(255,255,255,.8)}
${S} .zy-top .zy-in{display:flex;height:100%;align-items:center;justify-content:space-between}
${S} .zy-date{display:flex;align-items:center;gap:6px;font:600 11px/1.3 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px}
${S} .zy-date svg{width:12px;height:12px}
${S} .zy-social{display:flex;gap:12px}
${S} .zy-social a{display:flex;color:rgba(255,255,255,.8);transition:color .3s,transform .3s}
${S} .zy-social a:hover{color:#fff;transform:scale(1.1)}
${S} .zy-social svg{width:13px;height:13px}
${S} .zy-bar{position:relative;background:#fff;box-shadow:0 3px 16px rgba(15,24,63,.08)}
${S} .zy-bar .zy-in{display:flex;align-items:center;padding:20px 0;gap:32px}
${S} .zy-logo{flex:0 0 11.932%}
${S} .zy-logo img{width:47%;height:auto;display:block}
${S} .zy-right{flex:1;display:flex;align-items:center;justify-content:space-evenly;gap:32px}
${S} .zy-nav{display:flex;flex:1;justify-content:flex-end}
${S} .zy-nav a{padding:12px;margin:0 2px;color:var(--zy-text);font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;text-decoration:none;transition:color .3s}
${S} .zy-nav a:hover,${S} .zy-nav a[aria-current=page]{color:var(--zy-accent)}
${S} .zy-nav-input,${S} .zy-search-input{position:absolute;opacity:0;pointer-events:none}
${S} .zy-nav-toggle{display:none;width:24px;height:24px;flex-direction:column;justify-content:center;gap:5px;cursor:pointer}
${S} .zy-nav-toggle i{display:block;height:2px;background:var(--zy-text);transition:background .3s}
${S} .zy-nav-toggle:hover i{background:var(--zy-accent)}
${S} .zy-search-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:var(--zy-accent);color:#fff;cursor:pointer;transition:background .3s}
${S} .zy-search-btn svg{width:13px;height:13px}
${S} .zy-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:var(--zy-secondary);opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s linear .3s}
${S} .zy-search-input:checked~.zy-overlay{opacity:1;visibility:visible;transition:opacity .3s}
${S} .zy-overlay form{width:min(80%,900px)}
${S} .zy-overlay input[type=search]{width:100%;padding:12px 24px;border:4px solid #fff;border-radius:0;background:transparent;color:#fff;font:600 16px/1.3 'Inter',sans-serif;outline:0}
${S} .zy-close{position:absolute;top:24px;right:28px;color:#fff;font-size:32px;line-height:1;cursor:pointer}

/* divisor de seção */
${S} .zy-div{display:flex;align-items:center;gap:16px;margin-bottom:24px}
${S} .zy-div.center{justify-content:center}
${S} .zy-div h2,${S} .zy-div h3{margin:0;font:700 18px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.4px;color:var(--zy-secondary);white-space:nowrap}
${S} .zy-div::after{content:"";flex:1;border-top:2.4px solid var(--zy-line)}
${S} .zy-div.center::before{content:"";flex:1;border-top:2.4px solid var(--zy-line)}
${S} .zy-div.thin::after,${S} .zy-div.thin::before{border-top-width:1px}
${S} .zy-div.dark h2,${S} .zy-div.dark h3{color:#fff}
${S} .zy-div.dark::after,${S} .zy-div.dark::before{border-top-color:rgba(255,255,255,.16)}

/* lista com miniatura */
${S} .zy-pl{display:grid;grid-template-columns:repeat(var(--zy-cols,1),minmax(0,1fr));gap:var(--zy-gap,20px)}
${S} .zy-pl-item{display:flex;align-items:flex-start;gap:var(--zy-mgap,12px)}
${S} .zy-pl-item>a{flex:0 0 var(--zy-thumb,24%);display:block;overflow:hidden}
${S} .zy-pl-item img{display:block;width:100%;aspect-ratio:var(--zy-ratio,1);object-fit:cover;transition:filter .3s}
${S} .zy-pl-item:hover img{filter:brightness(88%)}
${S} .zy-pl-item h4{margin:0 0 4px;font:600 16px/1.3 'Inter',sans-serif}
${S} .zy-pl-item h4 a{text-decoration:none}
${S} .zy-pl-meta{font:400 12px/1.6 'Inter',sans-serif;color:var(--zy-meta)}
${S} .zy-pl.dark h4 a{color:#fff}
${S} .zy-pl.dark .zy-pl-meta{color:rgba(255,255,255,.8)}
${S} .zy-btn{display:flex;justify-content:center;margin-top:24px;padding:10px 20px;border:1px solid var(--zy-accent);background:var(--zy-accent);color:#fff;font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;text-decoration:none}
${S} .zy-btn:hover{color:#fff}

/* rodapé */
${S} .zy-foot{position:relative}
${S} .zy-cta{position:relative;z-index:10}
${S} .zy-cta-box{max-width:var(--zy-w);margin:0 auto -136px;padding:48px;background:var(--zy-dark);color:#fff;text-align:center}
${S} .zy-cta-box h2{margin:0 0 12px;color:#fff;font:700 28px/1.3 'Inter',sans-serif}
${S} .zy-cta-box p{margin:0 0 24px;color:#fff}
${S} .zy-cta-box a.zy-cta-btn{display:inline-block;padding:10px 20px;border:1px solid #fff;color:#fff;font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;text-decoration:none;box-shadow:0 0 10px rgba(0,0,0,.5)}
${S} .zy-dark{position:relative;z-index:2;min-height:360px;padding:136px 0 80px;background:#000;color:rgba(255,255,255,.8)}
${S} .zy-brand{width:44%;margin:80px auto;text-align:center}
${S} .zy-brand img{width:180px;height:auto;transition:transform .6s}
${S} .zy-brand a:hover img{transform:translateY(-2px)}
${S} .zy-brand strong{display:block;margin:28px 0 8px;color:#fff;font:600 16px/1.3 'Inter',sans-serif}
${S} .zy-brand p{margin:0;font:400 14px/1.5 'Inter',sans-serif}
${S} .zy-brand .zy-social{justify-content:center;margin-top:32px;gap:20px}
${S} .zy-brand .zy-social svg{width:20px;height:20px}
${S} .zy-foot-cols{display:flex;gap:60px;max-width:var(--zy-w);margin:0 auto}
${S} .zy-foot-cols>*{flex:1}
${S} .zy-foot-cols h3{display:flex;align-items:center;gap:20px;margin:0 0 24px;color:rgba(255,255,255,.8);font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px}
${S} .zy-foot-cols h3::after{content:"";flex:1;border-top:1px solid rgba(255,255,255,.16)}
${S} .zy-foot-cols ul{margin:0;padding:0;list-style:none}
${S} .zy-foot-cols li{margin-bottom:12px;font:400 14px/1.5 'Inter',sans-serif}
${S} .zy-foot-cols li a{color:rgba(255,255,255,.8);text-decoration:none;transition:color .3s}
${S} .zy-foot-cols li a:hover{color:#fff}
${S} .zy-foot-cols .zy-pl-item a{color:rgba(255,255,255,.8);font:500 13px/1.3 'Inter',sans-serif}
${S} .zy-copy{padding:16px 0;background:#000;color:var(--zy-line);text-align:center;font:500 13px/1.2 'Inter',sans-serif}
${S} .zy-copy .zy-in{padding:0}

${S} .sb-container{width:min(var(--zy-w),100% - 32px);padding-block:0}
${S} .zy-split .sb-container,${S} .sb-post-content .sb-container{width:100%;padding-block:6px}
${S} .zy-sec{position:relative}
${S} .zy-grid{display:grid;grid-template-columns:repeat(var(--zy-cols,2),minmax(0,1fr));gap:var(--zy-gap,20px)}

/* destaque */
${S} .zy-hero{padding:40px 0;background:linear-gradient(135deg,#ecf1ff 0%,#f1edfd 51%)}
${S} .zy-hero-in{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px}
${S} .zy-hero-l{flex:0 0 60%;min-width:0;display:flex;flex-direction:column;justify-content:space-between}
${S} .zy-hero-r{flex:0 0 38%;min-width:0;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;padding:28px;background:#000}
${S} .zy-sl-vp{overflow:hidden}
${S} .zy-sl-track{display:flex;touch-action:pan-y;cursor:grab}
${S} .zy-slide{flex:0 0 100%;min-width:0}
${S} .zy-sl-img{position:relative;display:block;overflow:hidden}
${S} .zy-sl-img img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;transform:scale(1.005);transition:transform .35s cubic-bezier(.25,.46,.45,.94)}
${S} .zy-slide:hover .zy-sl-img img{transform:scale(1.03)}
${S} .zy-sl-date{position:absolute;top:0;right:0;padding:12px 18px;background:#111;color:#fff;font:600 14px/1.2 'Inter',sans-serif}
${S} .zy-sl-body{padding-top:27px}
${S} .zy-sl-info{font-size:.9em;color:#111}
${S} .zy-sl-info a{color:#111;text-decoration:none}
${S} .zy-sl-info a:hover{color:#3c3c3c}
${S} .zy-sl-info i{margin:0 12px;font-style:normal}
${S} .zy-sl-body h2{margin:0 0 .5em;font:700 28px/1.3 'Inter',sans-serif}
${S} .zy-sl-body h2 a{text-decoration:none}
${S} .zy-tick-wrap{width:100%;margin-top:12px;padding:6px;box-sizing:border-box;background:#fff}
${S} .zy-tick{display:flex;height:45px;overflow:hidden;background:#111;border-bottom:3px solid #f00}
${S} .zy-tick-label{position:relative;z-index:2;flex:none;padding:0 15px;background:#f00;color:#fff;font:700 14px/42px 'Inter',sans-serif;white-space:nowrap;box-shadow:5px 0 15px rgba(0,0,0,.5)}
${S} .zy-tick-vp{flex:1;min-width:0;overflow:hidden}
${S} .zy-tick-track{display:inline-flex;padding-left:100%;white-space:nowrap;animation:zy-tick 80s linear infinite}
${S} .zy-tick-track.still{padding-left:0;animation:none}
${S} .zy-tick-vp:hover .zy-tick-track{animation-play-state:paused}
${S} .zy-tick-track a{padding-left:40px;color:#fff;font:400 15px/42px 'Inter',sans-serif;text-decoration:none}
${S} .zy-dot{margin-left:40px;color:#f00;font-style:normal}
@keyframes zy-tick{from{transform:translate3d(0,0,0)}to{transform:translate3d(-100%,0,0)}}

/* cartões */
${S} .zy-card{position:relative;display:flex;flex-direction:column;background:#fff}
${S} .zy-card[hidden]{display:none}
${S} .zy-card-img{position:relative;display:block;overflow:hidden}
${S} .zy-card-img img{display:block;width:100%;aspect-ratio:.8;object-fit:cover;transition:filter .3s}
${S} .zy-card:hover .zy-card-img img{filter:brightness(88%)}
${S} .zy-badge{position:absolute;top:16px;left:16px;padding:4px 8px;background:#000;color:#fff;font:600 11px/1.3 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px}
${S} .zy-avatar{position:relative;display:block;width:36px;height:36px;margin:-18px 0 0 20px;overflow:hidden;border-radius:50%;background:#ddd}
${S} .zy-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
${S} .zy-card-text{margin-top:20px;padding:0 20px}
${S} .zy-card h3{margin:0 0 12px;font:600 19px/1.3 'Inter',sans-serif}
${S} .zy-card h5{margin:0;font:500 14px/1.3 'Inter',sans-serif}
${S} .zy-card h3 a,${S} .zy-card h5 a{text-decoration:none}
${S} .zy-card p{margin:0 0 12px;font:400 14px/1.5 'Inter',sans-serif}
${S} .zy-more-link{display:inline-block;margin-bottom:8px;font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;text-decoration:none}
${S} .zy-card-meta{margin-top:auto;padding:10px 20px;border-top:1px solid #fff;color:var(--zy-meta);font:400 12px/1.6 'Inter',sans-serif}
${S} .zy-card-meta i{margin:0 6px;color:var(--zy-line);font-style:normal}
${S} .zy-card.v-small .zy-badge{top:12px;left:12px;font-size:9px}
${S} .zy-card.v-small .zy-avatar{width:24px;height:24px;margin:-12px 0 0 12px}
${S} .zy-card.v-small .zy-card-text{margin-top:12px;padding:0 12px}
${S} .zy-card.v-plain .zy-card-img img{aspect-ratio:.66}
${S} .zy-card.v-plain .zy-card-text{margin-top:12px;padding:0 var(--zy-cp,28px)}
${S} .zy-card.v-plain .zy-card-meta{padding:10px var(--zy-cp,28px)}
${S} .zy-card.v-archive .zy-card-img img{aspect-ratio:.66}
${S} .zy-card.v-archive .zy-badge{left:auto;right:20px;top:20px}
${S} .zy-card.v-archive .zy-card-text,${S} .zy-card.v-archive .zy-card-meta{padding-left:0;padding-right:0}
${S} .zy-trend{margin-top:80px}
${S} .zy-trend-row{display:flex;gap:20px}
${S} .zy-trend-l{flex:0 0 calc(57% - 10px);--zy-cols:2;--zy-gap:20px}
${S} .zy-trend-r{flex:1;min-width:0;--zy-cols:2;--zy-gap:16px;align-content:start}
${S} .zy-cards-grid{--zy-gap:28px}

/* caixas por categoria */
${S} .zy-boxes{margin-top:80px}
${S} .zy-boxes .zy-in{max-width:calc(var(--zy-w) + 80px)}
${S} .zy-boxes-grid{display:flex;flex-wrap:wrap;gap:20px;padding:0 40px}
${S} .zy-box{flex:0 0 calc(50% - 10px);box-sizing:border-box;padding:36px;background:linear-gradient(135deg,#fff 0%,#f7f6ff 64%)}
${S} .zy-box .zy-pl-item img{aspect-ratio:1}

/* grade escura / cartões com fundo */
${S} .zy-dark-sec{margin-top:80px;padding:60px 0;background:#000}
${S} .zy-ov-grid{display:grid;grid-template-columns:repeat(var(--zy-cols,3),minmax(0,1fr));grid-auto-rows:1fr;gap:12px}
${S} .zy-ov{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;min-height:400px;padding:32px;overflow:hidden;background-image:var(--zy-bg);background-size:cover;background-position:center center;background-color:#222;color:#fff;text-decoration:none;transition:background-position .8s}
${S} .zy-ov.wide{grid-column:span min(2,var(--zy-cols,3))}
${S} .zy-ov::before,${S} .zy-ov::after{content:"";position:absolute;inset:0;z-index:-1;transition:opacity .8s}
${S} .zy-ov::before{background:linear-gradient(180deg,transparent 36%,#020817 96%);opacity:.72}
${S} .zy-ov::after{background:linear-gradient(180deg,transparent 36%,#000 92%);opacity:0}
${S} .zy-ov:hover{background-position:bottom center;color:#fff}
${S} .zy-ov:hover::after{opacity:.72}
${S} .zy-ov-badge{align-self:flex-start;padding:4px 8px;background:var(--zy-blue);color:#fff;font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;transition:background .6s}
${S} .zy-ov-badge:hover{background:var(--zy-purple)}
${S} .zy-ov strong{display:block;color:#fff;font:700 26px/1.3 'Inter',sans-serif}
${S} .zy-ov-meta{display:flex;gap:16px;margin-top:12px;color:rgba(255,255,255,.8);font:500 13px/1.2 'Inter',sans-serif}
${S} .zy-ov-meta svg{margin-right:4px;vertical-align:-2px}

/* tiles */
${S} .zy-tiles{display:flex;flex-direction:column;gap:12px}
${S} .zy-tile{position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:100px;padding:16px;overflow:hidden;color:#fff;text-align:center;text-decoration:none}
${S} .zy-tile-bg{position:absolute;inset:0;background-color:#222;background-size:cover;background-position:center;transition:transform 1.6s}
${S} .zy-tile-veil{position:absolute;inset:0;background:#02081752;transition:background 1.6s}
${S} .zy-tile:hover .zy-tile-bg{transform:scale(1.2)}
${S} .zy-tile:hover .zy-tile-veil{background:#004cff99}
${S} .zy-tile h3{position:relative;margin:0;color:#fff;font:600 19px/1.3 'Inter',sans-serif;text-transform:uppercase}

/* carrossel */
${S} .zy-car{--zy-per:3;--zy-off:100px;--zy-cgap:4px;margin-top:80px}
${S} .zy-car-vp{position:relative;overflow:hidden}
${S} .zy-car-track{display:flex;gap:var(--zy-cgap);margin:0 var(--zy-off);touch-action:pan-y;cursor:grab}
${S} .zy-car-track>*{flex:0 0 calc((100% - (var(--zy-per) - 1)*var(--zy-cgap))/var(--zy-per));min-width:0}
${S} .zy-car-nav button{position:absolute;top:50%;z-index:3;width:44px;height:44px;margin-top:-22px;border:0;background:rgba(0,0,0,.6);color:#fff;font-size:28px;line-height:1;cursor:pointer}
${S} .zy-car-nav button:first-child{left:0}
${S} .zy-car-nav button:last-child{right:0}

/* contêineres */
${S} .zy-split{margin:80px 0}
${S} .zy-split-in{display:flex;gap:var(--zy-gap,60px)}
${S} .zy-split-a{flex:0 0 calc((100% - var(--zy-gap,60px))*var(--zy-left,.72));min-width:0}
${S} .zy-split-b{flex:1;min-width:0}
${S} .zy-stack{display:flex;flex-direction:column;gap:var(--zy-gap,12px)}
${S} .zy-gbox{padding:var(--zy-pad,36px);background:linear-gradient(180deg,var(--zy-soft),var(--zy-soft2))}
${S} .zy-gbox .zy-div{margin-bottom:20px}
${S} .zy-gbox .zy-div h2{font-size:14px}
${S} .zy-catmenu{display:flex;flex-direction:column;gap:4px}
${S} .zy-catmenu a{padding:6px 12px;color:var(--zy-secondary);font:400 14px/1.5 'Inter',sans-serif;text-decoration:none;transition:background .3s,color .3s}
${S} .zy-catmenu a:hover,${S} .zy-catmenu a[aria-current=page]{background:#000;color:#fff}
${S} .zy-news{display:flex;flex-direction:column;gap:8px}
${S} .zy-news input{padding:10px 12px;border:1px solid var(--zy-line);border-radius:0;background:#fff;font:400 14px/1.5 'Inter',sans-serif;transition:border-color .4s}
${S} .zy-news input:focus{border-color:#000;outline:0}
${S} .zy-news button{padding:10px 20px;border:1px solid #000;background:#000;color:#fff;font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;cursor:pointer}
${S} .zy-news button:disabled{opacity:.6;cursor:not-allowed}
${S} .zy-news small{color:var(--zy-meta);font:400 12px/1.6 'Inter',sans-serif}

/* arquivo, busca, post */
${S} .zy-arch-head{position:relative;overflow:hidden;padding:60px 0 44px;background:linear-gradient(135deg,#000 0%,#000 53%)}
${S} .zy-arch-head::before{content:"";position:absolute;inset:0;background:var(--zy-bg) center/cover no-repeat;opacity:.08}
@media (min-width:1025px){${S} .zy-arch-head::before{background-attachment:fixed}}
${S} .zy-arch-in{position:relative;width:40%;margin:0 auto;color:#fff;text-align:center}
${S} .zy-arch-in h1{margin:0;color:#fff;font:700 40px/1.2 'Inter',sans-serif}
${S} .zy-arch-in p{margin:20px 0 0;font:400 14px/1.5 'Inter',sans-serif}
${S} .zy-archive{margin:60px 0}
${S} .zy-arch-grid{--zy-cols:3;row-gap:35px;column-gap:30px}
${S} .zy-more{display:block;margin:40px auto 0;padding:10px 20px;border:1px solid #000;background:#000;color:#fff;font:700 12px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;cursor:pointer;transition:background .3s}
${S} .zy-more:hover{background:var(--zy-text)}
${S} .zy-search{padding:40px 16px 0}
${S} .zy-sform{display:flex;max-width:600px;height:40px;margin:0 auto}
${S} .zy-sform input{flex:1;min-width:0;padding:0 12px;border:1px solid var(--zy-line);border-radius:0;background:#fff;font:400 14px/1.5 'Inter',sans-serif}
${S} .zy-sform button{min-width:80px;border:0;background:#000;color:#fff;cursor:pointer}
${S} .zy-post-head{text-align:left}
${S} .zy-post-cat{display:inline-flex;align-items:center;gap:6px;margin-bottom:20px;color:var(--zy-meta);font:600 11px/1.3 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.2px;text-decoration:none}
${S} .zy-post-head h1{margin:0;color:var(--zy-secondary);font:700 40px/1.2 'Inter',sans-serif}
${S} .zy-post-meta{display:flex;flex-wrap:wrap;align-items:center;gap:20px 32px;margin-top:20px;color:var(--zy-meta);font:400 12px/1.6 'Inter',sans-serif}
${S} .zy-post-meta svg{margin-right:6px;vertical-align:-2px}
${S} .zy-post-author{display:inline-flex;align-items:center;gap:8px}
${S} .zy-post-author u{color:var(--zy-secondary);font:500 14px/1.3 'Inter',sans-serif}
${S} .zy-avatar.sm{display:inline-block;width:32px;height:32px;margin:0}
${S} .zy-post-head hr{margin:32px 0;border:0;border-top:1px solid var(--zy-line)}
${S} .zy-post-img{display:block;width:100%;margin-bottom:40px}
${S} .zy-share{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:40px 0;padding:24px 32px;background:linear-gradient(180deg,var(--zy-soft),var(--zy-soft2))}
${S} .zy-share span{font:600 16px/1.3 'Inter',sans-serif}
${S} .zy-share div{display:flex;gap:8px}
${S} .zy-share button{display:flex;padding:8px;border:0;background:linear-gradient(180deg,#333,#000);color:#fff;cursor:pointer;transition:transform .3s}
${S} .zy-share button:hover{transform:translateY(-2px)}
${S} .zy-share svg{width:20px;height:20px}
${S} .zy-brandbox{margin:80px 0;text-align:center}
${S} .zy-brandbox a{display:block}
${S} .zy-brandbox img{width:180px;height:auto;transition:transform .6s}
${S} .zy-brandbox a:hover img{transform:translateY(-2px)}
${S} .zy-brandbox strong{display:block;margin-top:28px;font:600 16px/1.3 'Inter',sans-serif}
${S} .zy-more-sec{width:min(var(--zy-w),100% - 32px);margin:80px auto 0;padding:40px 0;border-radius:8px;background:linear-gradient(135deg,var(--zy-soft) 0%,var(--zy-soft2) 100%)}
${S} .zy-div.big{gap:32px;margin-bottom:40px}
${S} .zy-div.big h2{font-size:28px;letter-spacing:0;text-transform:none}
${S} .zy-more-grid{--zy-cols:4;--zy-gap:24px;--zy-cp:0px;padding:0 40px}
${S} .zy-more-grid h3{margin:6px 0 0;font:500 14px/1.3 'Inter',sans-serif}
${S} .zy-more-grid .zy-card{background:transparent}
${S} .zy-more-grid .zy-card:hover .zy-card-img img{filter:brightness(92%)}

/* 404 */
${S} .zy-nf{margin-bottom:-136px;padding:80px 0 216px;background:linear-gradient(135deg,var(--zy-soft) 0%,var(--zy-soft2) 50%)}
${S} .zy-nf-in{max-width:700px;margin:0 auto;text-align:center}
${S} .zy-nf-title{margin-bottom:20px;color:var(--zy-secondary);font:700 18px/1.2 'Inter',sans-serif;text-transform:uppercase;letter-spacing:.4px}
${S} .zy-nf h1{margin:0;font:700 40px/1.2 'Inter',sans-serif}
${S} .zy-nf .zy-sform{margin:24px auto 20px}
${S} .zy-nf .zy-div{margin:20px 0}
${S} .zy-nf-grid{--zy-cols:4;--zy-gap:16px;--zy-cp:0px;text-align:left}
${S} .zy-nf-grid h3{margin:0;font:500 13px/1.3 'Inter',sans-serif}
${S} .zy-nf .zy-btn{margin-top:32px}

/* comunidade */
${S} .zy-comm{padding:50px 16px 100px}
${S} .zy-comm-mobile{display:none;width:100%;margin-bottom:20px}
${S} .zy-comm-row{display:flex;gap:40px;max-width:var(--zy-w);margin:0 auto}
${S} .zy-comm-l{flex:0 0 50%;min-width:0}
${S} .zy-comm-r{flex:1;min-width:0}
${S} .zy-comm-r img{display:block;width:100%;min-height:1206px;margin-top:50px;border-radius:25px;object-fit:contain}
${S} .zy-comm h2{margin:0 0 20px;font:700 28px/1.3 'Inter',sans-serif;color:var(--zy-secondary)}
${S} .zy-comm h3{margin:32px 0 12px;font:700 18px/1.3 'Inter',sans-serif;color:var(--zy-secondary)}
${S} .zy-comm-list{margin:0;padding-left:20px}
${S} .zy-comm-list li{margin-bottom:8px;font:400 14px/1.5 'Inter',sans-serif}
${S} .zy-comm-join{font-size:24px}
${S} .zy-price{margin:24px 150px 0;overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 0 12px rgba(0,0,0,.12);text-align:center}
${S} .zy-price-head{padding:20px;background:#000;color:#fff;font:700 18px/1.3 'Inter',sans-serif}
${S} .zy-price-val{padding:24px 0 8px;color:#000}
${S} .zy-price-val sup{margin-right:4px;font:600 18px/1 'Inter',sans-serif;vertical-align:top}
${S} .zy-price-val b{font:700 48px/1 'Inter',sans-serif}
${S} .zy-price-val span{margin-left:4px;font:400 14px/1 'Inter',sans-serif}
${S} .zy-price ul{margin:0;padding:0 24px;list-style:none}
${S} .zy-price li{padding:15px 0;border-bottom:2px solid #ddd;color:#000;font:400 14px/1.5 'Inter',sans-serif}
${S} .zy-price .zy-btn{margin:24px}
${S} .zy-comm-others{max-width:var(--zy-w);margin:60px auto 0;text-align:center}
${S} .zy-comm-others h3{margin:0 0 24px}
${S} .zy-comm-others>div{display:flex;flex-wrap:wrap;justify-content:center;gap:20px}
${S} .zy-comm-others a{flex:0 0 calc(25% - 15px);text-decoration:none}
${S} .zy-comm-others img{width:calc(100% - 20px);margin:10px;aspect-ratio:1;object-fit:cover}
${S} .zy-comm-others span{display:block;font:600 20px/1.3 'Inter',sans-serif}

/* link da bio */
${S} .zy-bio{position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:100vh;padding:40px 16px;overflow:hidden;background:#020817}
${S} .zy-bio-bg{position:absolute;inset:0}
${S} .zy-bio-bg::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.5)}
${S} .zy-bio-slide{position:absolute;inset:0;background-size:cover;background-position:center}
${S} .zy-bio-slide.fade{opacity:0}
${S} .zy-bio-card{position:relative;width:min(100%,480px);color:#fff;text-align:center}
${S} .zy-bio-pic{width:150px;height:150px;border-radius:50%;object-fit:cover}
${S} .zy-bio-card h1{margin:16px 0 8px;color:#fff;font:700 24px/1.3 'Inter',sans-serif}
${S} .zy-bio-card p{margin:0 0 20px;font:400 14px/1.5 'Inter',sans-serif;color:rgba(255,255,255,.9)}
${S} .zy-bio-btn{display:block;margin-top:12px;padding:16px;background:#020817;color:#fff;font:600 16px/1.3 'Inter',sans-serif;text-decoration:none;transition:background .3s}
${S} .zy-bio-btn:hover{background:#000;color:#fff}

@media (max-width:1024px){${tablet(S)}${tabletX(S)}${S} .zy-cta-box{margin-bottom:-110px;padding:40px 28px}${S} .zy-dark{padding:110px 40px 60px}${S} .zy-brand{width:80%}${S} .zy-bar .zy-in{padding:16px 40px}}
@media (max-width:767px){${mobile(S)}${mobileX(S)}${S} .zy-top{--zy-top-h:34px}${S} .zy-cta-box{margin-bottom:-190px;padding:40px 24px}${S} .zy-dark{padding:190px 0 60px}${S} .zy-brand{margin-bottom:40px;padding:0 20px;width:100%}${S} .zy-brand img{width:140px}}
${tablet(`${S}.sb-narrow`)}${tabletX(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}${mobileX(`${S}.sb-narrow`)}
`;
