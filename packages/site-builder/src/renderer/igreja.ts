/**
 * Variante `igreja` (`theme.variant = "igreja"`, escopo `.sb-cv`): site de igreja em cinza claro com azul-petróleo e roxo
 * (WordPress + Elementor): topo com hambúrguer + gaveta, hero com a foto da liderança em recorte diagonal, vídeo de
 * boas-vindas, podcast e app, "Explore mais conteúdo" com marca d'água gigante, banner, rodapé em degradê e as páginas
 * internas (história, agenda em abas, células por bairro, localização). Layout e medidas tirados do site renderizado
 * em 1440/1024/390; **marca, pessoas, textos, fotos e links são próprios** (`templates/igreja-comunidade-viva/`).
 *
 * O hero é montado em CSS (a referência usa uma imagem pronta): a foto é um `clip-path` em paralelogramo, as faixas são
 * `skewX` e o círculo é uma borda de 1px. Assim a foto é trocável no editor. Nunca passa de 100% de largura (a referência
 * tinha rolagem lateral de 1541px em 1440).
 *
 * Tokens do tema: `bg` (`#DFDFDF`), `fg` (`#131313`), `muted` (`#54595F`, textos), `accent` (azul-petróleo `#1E6687`) e os
 * extras `gray`, `purple`, `star`, `watermark`, `overlay`, `footerFrom`, `footerTo`, `barFrom`, `barTo`, `dot`. Configurações
 * globais (lidas pelos blocos): `churchName`, `leaderName`, `welcomeVideo`, `podcastUrl`, `appStoreUrl`, `playStoreUrl`,
 * `showApp`, `contactEmail`, `phone`, `whatsapp`, `waMessage`, `address`.
 * Fontes: Poppins em tudo e Roboto só no botão "Ver mais" (`IGREJA_EXTRA_FONTS`).
 * Breakpoints: tablet ≤ 1024 e celular ≤ 767, repetidos sob `.sb-narrow` (quadro estreito do editor).
 */
export const isIgreja = (theme: Record<string, string>) =>
  theme.variant === "igreja";

/** Fontes fixas da variante (nunca texto do usuário). */
export const IGREJA_EXTRA_FONTS = ["Poppins", "Roboto"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function igrejaVars(
  theme: Record<string, string>
): Record<string, string> {
  const from = safe(theme.footerFrom, "#272727");
  const to = safe(theme.footerTo, "#000000");
  return {
    "--cv-bar-a": safe(theme.barFrom, "#3B3B3B"),
    "--cv-bar-b": safe(theme.barTo, "#4FA3F7"),
    "--cv-bg": safe(theme.bg, "#DFDFDF"),
    "--cv-dot": safe(theme.dot, "#2ECC71"),
    "--cv-footer": `linear-gradient(180deg,${from} 0%,${to} 100%)`,
    "--cv-footer-m": `linear-gradient(188deg,${from} 0,${to} 45%)`,
    "--cv-ink": safe(theme.fg, "#131313"),
    "--cv-muted": safe(theme.gray, "#898989"),
    "--cv-overlay": safe(theme.overlay, "#0000007D"),
    "--cv-purple": safe(theme.purple, "#5A1FD1"),
    "--cv-star": safe(theme.star, "#F99707"),
    "--cv-teal": safe(theme.accent, "#1E6687"),
    "--cv-text": safe(theme.muted, "#54595F"),
    "--cv-watermark": safe(theme.watermark, "#D5D5D529"),
  };
}

const S = ".sb-cv";
const N = `${S}.sb-narrow`;

/** Regras de uma faixa `max-width`, repetidas sob `.sb-narrow` (a media query não enxerga o quadro do editor). */
const upTo = (max: number, rules: (x: string) => string) =>
  `@media (max-width:${max}px){${rules(S)}}\n${rules(N)}`;

/** Padrão claro de linhas onduladas (próprio) do fundo do "Explore". */
const WAVES = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48" viewBox="0 0 160 48"><path d="M0 12Q20 0 40 12T80 12T120 12T160 12M0 36Q20 24 40 36T80 36T120 36T160 36" fill="none" stroke="#bdbdbd" stroke-width="1"/></svg>'
)}")`;

/** Abas sem JS: o rádio `:checked` mostra o painel e marca a aba (até `max` abas). */
const tabRules = (cls: string, max: number) => {
  let out = "";
  for (let i = 1; i <= max; i++) {
    out += `${S} .${cls}-r:nth-of-type(${i}):checked ~ .${cls}-bar .${cls}-t:nth-child(${i}){background:#fff;color:#000}
${S} .${cls}-r:nth-of-type(${i}):checked ~ .${cls}-bar .${cls}-t:nth-child(${i})::after{content:"";position:absolute;left:18%;right:18%;bottom:6px;height:2px;background:var(--cv-dot)}
${S} .${cls}-r:nth-of-type(${i}):checked ~ .${cls}-bar .${cls}-t:nth-child(${i})::before{content:"";position:absolute;left:50%;bottom:2px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--cv-dot);z-index:1}
${S} .${cls}-r:nth-of-type(${i}):focus-visible ~ .${cls}-bar .${cls}-t:nth-child(${i}){outline:3px solid #fff;outline-offset:-5px;box-shadow:0 0 0 2px var(--cv-teal)}
${S} .${cls}-r:nth-of-type(${i}):checked ~ .${cls}-panels .${cls}-p:nth-child(${i}){display:block}
`;
  }
  return out;
};

/* ───────── base: topo, hero ───────── */

const top = `
${S}{font-family:'Poppins',sans-serif;color:var(--cv-ink);background:var(--cv-bg)}
${S} main{padding:0!important}
${S} .cv-vh{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
${S} .cv-burger-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${S} .cv-nav{position:relative;z-index:30}
${S} .cv-bar{display:flex;align-items:center;justify-content:space-between;max-width:1440px;height:100px;margin:0 auto;padding:0 60px}
${S} .cv-bar-l{display:flex;align-items:center;gap:40px}
${S} .cv-burger{display:flex;flex-direction:column;justify-content:space-between;width:60px;height:30px;cursor:pointer}
${S} .cv-burger i{display:block;height:4px;border-radius:2px;background:#000}
${S} .cv-burger i:nth-child(1){width:60px}
${S} .cv-burger i:nth-child(2){width:44px}
${S} .cv-burger i:nth-child(3){width:28px}
${S} .cv-burger-input:focus-visible ~ .cv-bar .cv-burger{outline:2px solid var(--cv-teal);outline-offset:6px}
${S} .cv-short{display:flex;align-items:center;gap:20px}
${S} .cv-short>a,${S} .cv-soc-b{padding:8px 0;border:0;background:none;color:#000;font:600 15px/1 'Poppins',sans-serif;text-transform:uppercase;cursor:pointer}
${S} .cv-short>a:hover,${S} .cv-soc-b:hover{color:var(--cv-teal)}
${S} .cv-soc{position:relative}
${S} .cv-soc-b::after{content:"";display:inline-block;margin-left:8px;border:4px solid transparent;border-top-color:currentColor;border-bottom:0;vertical-align:middle}
${S} .cv-soc-l{position:absolute;top:100%;left:0;z-index:40;display:none;min-width:210px;margin:0;padding:0;list-style:none;background:#fff;box-shadow:0 10px 30px #0000002e}
${S} .cv-soc:hover .cv-soc-l,${S} .cv-soc.is-open .cv-soc-l,${S} .cv-soc:focus-within .cv-soc-l{display:block}
${S} .cv-soc.is-shut .cv-soc-l{display:none!important}
${S} .cv-soc-l a{display:block;padding:12px 25px;color:#000;font:400 14px/1.3 'Poppins',sans-serif;border-bottom:1px solid #EEE}
${S} .cv-soc-l a:hover,${S} .cv-soc-l a:focus-visible{background:#F3F3F3;color:var(--cv-teal)}
${S} .cv-icon{display:block;width:52px}
${S} .cv-icon img{width:52px;height:auto}
${S} .cv-veil{position:fixed;inset:0;z-index:45;display:none}
${S} .cv-burger-input:checked ~ .cv-veil{display:block}
${S} .cv-drawer{position:absolute;top:84px;left:calc(max(0px,(100% - 1440px)/2) + 60px);z-index:50;display:none;width:165px;background:#fff;box-shadow:0 10px 30px #0000002e}
${S} .cv-burger-input:checked ~ .cv-drawer{display:block}
${S} .cv-drawer ul{margin:0;padding:0;list-style:none}
${S} .cv-drawer li a,${S} .cv-d-title{display:block;padding:14px 25px;color:#000;font:500 14px/1.3 'Poppins',sans-serif;text-transform:uppercase;border-bottom:1px solid #EEE}
${S} .cv-d-title{color:var(--cv-text);cursor:default}
${S} .cv-d-soc a{padding:12px 25px 12px 35px;font-weight:400;text-transform:none}
${S} .cv-drawer a:hover,${S} .cv-drawer a:focus-visible{background:#F3F3F3;color:var(--cv-teal)}
${S} .cv-drawer li a[aria-current]{color:var(--cv-teal)}
${S} .cv-drawer-x{display:none}

${S} .cv-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) clamp(380px,39vw,560px) minmax(0,1fr);max-width:1440px;min-height:800px;margin:0 auto;padding-left:60px;overflow:clip}
${S} .cv-hero-l{display:flex;flex-direction:column;align-items:center;gap:30px;width:330px;max-width:100%;padding-top:30px}
${S} .cv-h1{margin:0;font-size:0;line-height:0}
${S} .cv-logo-h{display:block;width:330px;max-width:100%;height:auto}
${S} .cv-name-m{display:none}
${S} .cv-vid{position:relative;display:block;width:232px;height:110px}
${S} .cv-vid-img{width:100%;height:100%;overflow:hidden;border-radius:12px;background:#000}
${S} .cv-vid-img img{width:100%;height:100%;object-fit:cover;filter:brightness(.55)}
${S} .cv-play{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:60px;height:60px;margin:-30px 0 0 -30px;border:2px solid #fff;border-radius:50%;background:#A1A1A1;--glow-size:30px;animation:cv-pulse 2s ease-out infinite}
${S} .cv-play svg{width:22px;height:22px;margin-left:3px;fill:#fff}
@keyframes cv-pulse{0%{box-shadow:0 0 0 0 #ffffff99}100%{box-shadow:0 0 0 var(--glow-size) #ffffff00}}
${S} .cv-app{display:flex;flex-direction:column;align-items:center;gap:12px}
${S} .cv-app-t{margin:0;color:var(--cv-muted);font:600 20px/1.2 'Poppins',sans-serif;text-align:center}
${S} .cv-app-tm{display:none}
${S} .cv-app-s{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
${S} .cv-store{display:inline-flex;align-items:center;gap:7px;width:133px;height:40px;padding:0 9px;border:1px solid #A6A6A6;border-radius:7px;background:#000;color:#fff}
${S} .cv-store svg{flex:none;width:20px;height:20px;fill:#fff}
${S} .cv-store span{display:flex;flex-direction:column;line-height:1}
${S} .cv-store small{font-size:8px;letter-spacing:.02em;opacity:.85}
${S} .cv-store b{font:600 13px/1.15 'Poppins',sans-serif}
${S} .cv-store:hover{background:#222}

${S} .cv-hero-c{position:relative;align-self:end;height:800px;--cv-off:120px}
${S} .cv-photo{position:absolute;inset:0;clip-path:polygon(var(--cv-off) 0,100% 0,calc(100% - var(--cv-off)) 100%,0 100%);background:#222}
${S} .cv-photo img{width:100%;height:100%;object-fit:cover;object-position:center top}
${S} .cv-stripes i{position:absolute;top:0;bottom:0;transform:skewX(-8.5deg);transform-origin:0 100%}
${S} .cv-stripes i:nth-child(1){left:-16px;width:10px;background:#000}
${S} .cv-stripes i:nth-child(2){left:-38px;width:6px;background:var(--cv-purple)}
${S} .cv-stripes i:nth-child(3){left:calc(100% - var(--cv-off) + 14px);width:8px;background:var(--cv-purple)}
${S} .cv-stripes i:nth-child(4){left:calc(100% - var(--cv-off) + 34px);width:6px;background:#000}

${S} .cv-hero-r{position:relative;min-width:0}
${S} .cv-ring{position:absolute;top:150px;left:-110px;width:440px;height:440px;border:1px solid #fff;border-radius:50%}
${S} .cv-listen{position:absolute;top:290px;left:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:180px;height:180px;border-radius:50%;background:#E5E5E5CC;color:#000;text-align:center}
${S} .cv-listen b{font:400 21px/1.15 'Poppins',sans-serif}
${S} .cv-listen svg{width:40px;height:40px;fill:currentColor}
${S} .cv-listen:hover{background:#fff}
${S} .cv-player{position:absolute;top:500px;left:300px;width:92px;height:92px}
${S} .cv-player svg{width:92px;height:92px;fill:none;stroke:#000;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
${S} .cv-rates{position:absolute;right:30px;top:90px;display:flex;flex-direction:column;gap:10px}
${S} .cv-rate{display:flex;align-items:center;gap:8px;padding:8px 18px;border-radius:42px;background:#fff;font:300 12px/1 'Montserrat','Poppins',sans-serif;color:#000}
${S} .cv-rate b{color:var(--cv-star);font:400 11px/1 'Montserrat','Poppins',sans-serif}
${S} .cv-rate svg{width:14px;height:14px;fill:var(--cv-star)}
`;

/* ───────── explore, banner, rodapé ───────── */

const mid = `
${S} .cv-explore{position:relative;padding:90px 30px 110px;overflow:hidden;background:#fff}
${S} .cv-explore::before{content:"";position:absolute;inset:0;background:${WAVES};opacity:.14;pointer-events:none}
${S} .cv-explore::after{content:"";position:absolute;left:0;right:0;top:0;height:19%;background:linear-gradient(180deg,var(--cv-bg) 0%,transparent 100%);pointer-events:none}
${S} .cv-wm{position:absolute;left:0;right:0;top:20px;z-index:1;overflow:hidden;color:var(--cv-watermark);font:700 200px/1.1 'Poppins',sans-serif;text-align:center;white-space:nowrap;pointer-events:none;user-select:none}
${S} .cv-ex-in{position:relative;z-index:2;max-width:1100px;margin:0 auto}
${S} .cv-ex-title{margin:0;padding-top:50px;color:#131313;font:600 43px/1.2 'Poppins',sans-serif;text-align:center}
${S} .cv-ex-m{display:none}
${S} .cv-ex-m[hidden]{display:none!important}
${S} .cv-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px;margin-top:60px}
${S} .cv-card{display:block;color:#000}
${S} .cv-card-img{aspect-ratio:16/9;overflow:hidden;background:#cfcfcf}
${S} .cv-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
${S} .cv-card h3{margin:20px 0 0;font:600 19px/1.3 'Poppins',sans-serif;transition:color .3s}
${S} .cv-card p{margin:10px 0 0;font:400 14px/21px 'Poppins',sans-serif;text-align:left}
${S} .cv-card:hover img,${S} .cv-card:focus-visible img{transform:scale(1.04)}
${S} .cv-card:hover h3,${S} .cv-card:focus-visible h3{color:var(--cv-teal)}
${S} .cv-more-w{display:flex;justify-content:center;margin-top:60px}
${S} .cv-more{display:inline-flex;align-items:center;gap:12px;padding:25px;border:1px solid transparent;border-radius:20px;background:var(--cv-teal);color:#fff;font:500 20px/1 'Roboto','Poppins',sans-serif;transition:background .2s,color .2s,border-color .2s}
${S} .cv-more svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
${S} .cv-more:hover,${S} .cv-more:focus-visible{border-color:#000;background:#DFDFDF;color:#000}

${S} .cv-banner{position:relative;display:flex;align-items:flex-end;justify-content:center;min-height:641px;padding:60px 20px;overflow:hidden;background:#222;color:#fff;text-align:center}
${S} .cv-banner-bg{position:absolute;left:0;right:0;top:-18%;bottom:-18%}
${S} .cv-banner-bg img{width:100%;height:100%;object-fit:cover}
${S} .cv-banner-bg-m{display:none}
${S} .cv-banner::before{content:"";position:absolute;inset:0;z-index:1;background:var(--cv-overlay)}
${S} .cv-banner-t{position:relative;z-index:2;max-width:900px}
${S} .cv-banner h2{margin:0;font:500 31px/1.3 'Poppins',sans-serif;color:#fff}
${S} .cv-banner p{margin:12px 0 0;font:300 19px/1.4 'Poppins',sans-serif;color:#fff}

${S} .cv-foot{padding:80px 20px 30px;border-top:1px solid #ffffff1f;background:var(--cv-footer);color:#fff}
${S} .cv-foot-in{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:center;gap:40px;max-width:1100px;margin:0 auto}
${S} .cv-foot-col{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
${S} .cv-foot-logo{width:100px;height:auto}
${S} .cv-foot-ic{width:32px;height:32px;fill:none;stroke:#fff;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
${S} .cv-foot-col a,${S} .cv-foot-col span{color:#8B8B8B;font:400 12px/1.6 'Poppins',sans-serif}
${S} .cv-foot-col a:hover,${S} .cv-foot-col a:focus-visible{color:#fff}
${S} .cv-foot-app{display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:50px}
${S} .cv-foot-app p{margin:0;color:#ABABAB;font:600 14px/1.4 'Poppins',sans-serif;text-align:center}
${S} .cv-foot-end{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:50px;font:400 12px/1.5 'Poppins',sans-serif;text-align:center}
${S} .cv-foot-end b{color:#9B9B9B;font-weight:700}
${S} .cv-foot-end span{color:#fff}
${S} .cv-foot-end a{color:#9B9B9B;text-decoration:underline}
${S} .cv-foot-end a:hover{color:#fff}
`;

/* ───────── páginas internas ───────── */

const pages = `
${S} .cv-ph{position:relative;display:flex;align-items:center;height:var(--ph,350px);overflow:hidden;background:var(--cv-bg)}
${S} .cv-ph-img{position:absolute;top:0;right:0;bottom:0;width:66%}
${S} .cv-ph-img img{width:100%;height:100%;object-fit:cover}
${S} .cv-ph-img::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--cv-bg) 0%,transparent 75%)}
${S} .cv-ph-in{position:relative;z-index:1;width:100%;max-width:1440px;margin:0 auto;padding:0 60px}
${S} .cv-ph h1{margin:0;color:#666;font:700 48px/1.15 'Poppins',sans-serif}
${S} .cv-ph.is-center .cv-ph-img{left:0;width:auto}
${S} .cv-ph.is-center .cv-ph-img::after{background:#DFDFDFBF}
${S} .cv-ph.is-center .cv-ph-in{text-align:center}
${S} .cv-ph.is-center h1{color:var(--cv-teal);text-transform:uppercase}

${S} .cv-story{max-width:1200px;margin:0 auto;padding:60px 30px 90px}
${S} .cv-story-lead{margin:0 0 40px;color:#000;font:400 30px/1.35 'Poppins',sans-serif;text-align:center}
${S} .cv-story p{margin:0 0 24px;color:#000;font:400 18px/30px 'Poppins',sans-serif;text-align:left}
${S} .cv-story p.cv-sign{margin-top:40px;color:var(--cv-teal);font-weight:600}
${S} .cv-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border-radius:12px;background:var(--cv-teal);color:#fff;font:600 16px/1 'Poppins',sans-serif}
${S} .cv-btn:hover{filter:brightness(1.12)}
${S} .cv-btn svg{width:18px;height:18px;fill:currentColor}
${S} .cv-btn-w{display:flex;justify-content:center;margin-top:40px}

${S} .cv-ag{max-width:1200px;margin:0 auto;padding:40px 30px 90px}
${S} .cv-tab-r,${S} .cv-lt-r{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
${S} .cv-tab-bar{display:flex;gap:6px;padding:20px;border-radius:4px;background:linear-gradient(90deg,var(--cv-bar-a) 0%,var(--cv-bar-b) 100%);overflow-x:auto}
${S} .cv-tab-t{position:relative;flex:1 0 auto;min-width:110px;height:50px;border-radius:4px;background:#ffffff33;color:#fff;font:600 16px/50px 'Poppins',sans-serif;text-align:center;white-space:nowrap;user-select:none}
${S} .cv-tab-t:hover{background:#ffffff59}
${S} .cv-tab-p{display:none;margin-top:20px;padding:30px;background:#fff;box-shadow:0 10px 30px #00000033}
${S} .cv-day{margin:0 0 26px}
${S} .cv-day:last-child{margin-bottom:0}
${S} .cv-day h3{margin:0 0 10px;color:#666;font:400 22px/1.3 'Poppins',sans-serif}
${S} .cv-day ul{margin:0;padding-left:22px;color:#666;font:400 16px/1.8 'Poppins',sans-serif}
${S} .cv-day-none{margin:0;color:#666;font:400 16px/1.8 'Poppins',sans-serif}
${tabRules("cv-tab", 10)}
${tabRules("cv-lt", 6)}

${S} .cv-cells{max-width:1100px;margin:0 auto;padding:50px 30px 100px;text-align:center}
${S} .cv-cells h2{margin:0 0 20px;color:#000;font:400 30px/1.3 'Poppins',sans-serif}
${S} .cv-cells p{margin:0 0 14px;color:#000;font:400 18px/1.6 'Poppins',sans-serif}
${S} .cv-cells h2.cv-cells-q{margin-top:50px}
${S} .cv-hoods{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:30px}
${S} .cv-hood{display:flex;align-items:center;justify-content:center;min-height:55px;padding:8px 12px;border:0;border-radius:8px;background:var(--cv-teal);color:#fff;font:600 16px/1.2 'Poppins',sans-serif;cursor:pointer}
${S} .cv-hood:hover,${S} .cv-hood:focus-visible{filter:brightness(1.15)}
${S} .cv-pop{margin:auto;width:min(440px,calc(100vw - 32px));padding:30px;border:0;border-radius:14px;background:#fff;color:#000;text-align:left;box-shadow:0 20px 60px #0000004d}
${S} .cv-pop::backdrop{background:#000000a6}
${S} .cv-pop h3{margin:0 0 14px;padding-right:36px;color:var(--cv-teal);font:700 22px/1.2 'Poppins',sans-serif}
${S} .cv-pop dl{margin:0 0 20px;font:400 15px/1.6 'Poppins',sans-serif}
${S} .cv-pop dt{margin-top:8px;color:var(--cv-text);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
${S} .cv-pop dd{margin:0}
${S} .cv-pop-x{position:absolute;top:12px;right:12px;width:40px;height:40px;border:0;border-radius:50%;background:#EEE;color:#000;font:24px/40px Arial,sans-serif;cursor:pointer}
${S} .cv-pop.is-static{position:static;display:block;margin:30px auto 0;box-shadow:0 10px 30px #00000026}
${S} .cv-wa{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:10px;background:#1FA855;color:#fff;font:600 15px/1 'Poppins',sans-serif}
${S} .cv-wa svg{width:20px;height:20px;fill:currentColor}
${S} .cv-wa:hover{filter:brightness(1.1)}

${S} .cv-map{display:block;width:100%;height:200px;border:0;background:#ccc}
${S} .cv-loc{max-width:1200px;margin:0 auto;padding:60px 30px 100px}
${S} .cv-loc-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:40px;margin-bottom:50px}
${S} .cv-loc-top h1{margin:0;color:var(--cv-teal);font:700 40px/1.2 'Poppins',sans-serif}
${S} .cv-loc-top img{width:100%;max-height:340px;object-fit:cover;border-radius:14px}
${S} .cv-lt-bar{display:flex;gap:8px;padding:14px;border-radius:4px;background:linear-gradient(90deg,var(--cv-bar-a) 0%,var(--cv-bar-b) 100%);overflow-x:auto}
${S} .cv-lt-t{position:relative;flex:1 0 auto;min-width:130px;height:50px;border-radius:4px;background:#ffffff33;color:#fff;font:600 16px/50px 'Poppins',sans-serif;text-align:center;white-space:nowrap}
${S} .cv-tab-t label,${S} .cv-lt-t label{display:block;height:100%;padding:0 14px;cursor:pointer}
${S} .cv-lt-p{display:none;margin-top:26px}
${S} .cv-sites{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
${S} .cv-site{padding:28px;border-radius:12px;background:#fff;box-shadow:0 10px 30px #0000001f}
${S} .cv-site h3{margin:0 0 8px;color:var(--cv-teal);font:700 22px/1.25 'Poppins',sans-serif}
${S} .cv-site address{margin:0 0 14px;color:#333;font:400 15px/1.6 'Poppins',sans-serif;font-style:normal}
${S} .cv-site h4{margin:0 0 4px;color:var(--cv-text);font:600 12px/1.4 'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.04em}
${S} .cv-site ul{margin:0 0 20px;padding-left:20px;color:#333;font:400 15px/1.7 'Poppins',sans-serif}
${S} .cv-site-btns{display:flex;flex-wrap:wrap;gap:10px}

${S} .cv-nf{display:grid;justify-items:center;gap:20px;max-width:640px;margin:0 auto;padding:70px 30px 100px;text-align:center}
${S} .cv-nf img{width:100%;max-height:300px;object-fit:cover;border-radius:14px}
${S} .cv-nf h1{margin:0;color:var(--cv-teal);font:700 40px/1.2 'Poppins',sans-serif}
${S} .cv-nf p{margin:0;color:var(--cv-text);font:400 18px/1.6 'Poppins',sans-serif}

@media (prefers-reduced-motion:reduce){${S} .cv-play{animation:none}${S} .cv-card-img img{transition:none}${S} .cv-card:hover img{transform:none}}
`;

/* ───────── faixas de tela ───────── */

const tablet = (x: string) => `
${x} .cv-bar{padding:0 30px}
${x} .cv-drawer{left:30px}
${x} .cv-short>a,${x} .cv-soc-b{font-size:13px}
${x} .cv-hero{grid-template-columns:minmax(0,1fr) clamp(300px,46vw,440px);min-height:0;padding:0 56px 0 30px}
${x} .cv-hero-l{padding-top:10px}
${x} .cv-hero-c{height:640px;--cv-off:96px}
${x} .cv-stripes i{transform:skewX(-8.5deg)}
${x} .cv-hero-r{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:20px;padding:24px 30px 40px}
${x} .cv-ring{display:none}
${x} .cv-listen,${x} .cv-player,${x} .cv-rates{position:static}
${x} .cv-listen{flex-direction:row;width:auto;height:auto;padding:14px 26px;border-radius:60px;gap:14px}
${x} .cv-listen b{font-size:18px}
${x} .cv-listen svg{width:30px;height:30px}
${x} .cv-player{width:60px;height:60px}
${x} .cv-player svg{width:60px;height:60px}
${x} .cv-rates{flex-direction:row}
${x} .cv-wm{font-size:82px}
${x} .cv-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px}
${x} .cv-banner{min-height:max(27vh,360px)}
${x} .cv-ph-in{padding:0 30px}
${x} .cv-foot-in{gap:24px}
${x} .cv-hoods{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .cv-sites{grid-template-columns:minmax(0,1fr)}
`;

const mobile = (x: string) => `
${x} .cv-bar{height:72px;padding:0 20px}
${x} .cv-short{display:none}
${x} .cv-burger{width:44px;height:24px}
${x} .cv-burger i{height:3px}
${x} .cv-burger i:nth-child(1){width:44px}
${x} .cv-burger i:nth-child(2){width:32px}
${x} .cv-burger i:nth-child(3){width:20px}
${x} .cv-icon,${x} .cv-icon img{width:44px}
${x} .cv-drawer{position:fixed;inset:0;left:0;top:0;width:auto;overflow:auto;padding:84px 0 40px}
${x} .cv-drawer-x{position:absolute;top:14px;right:14px;display:grid;place-items:center;width:44px;height:44px;color:#000;font:28px/1 Arial,sans-serif;cursor:pointer}
${x} .cv-drawer li a,${x} .cv-d-title{padding:16px 28px;font-size:18px;text-align:center}
${x} .cv-d-soc a{padding:14px 28px;font-size:16px}
${x} .cv-nav.is-home{position:absolute;top:0;left:0;right:0}
${x} .cv-nav.is-home .cv-burger i{background:#fff}
${x} .cv-nav.is-home .cv-icon img{filter:brightness(0) invert(1) drop-shadow(0 1px 3px #0006)}
${x} .cv-hero{display:block;min-height:min(780px,100svh);padding:0}
${x} .cv-hero-c{position:absolute;inset:0;align-self:stretch;height:auto;--cv-off:0px}
${x} .cv-photo{clip-path:none}
${x} .cv-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#0000004d 0%,#00000000 35%,#ffffff00 62%,#fff 100%)}
${x} .cv-stripes{display:none}
${x} .cv-hero-l{position:relative;z-index:2;width:auto;min-height:inherit;justify-content:space-between;padding:96px 20px 28px}
${x} .cv-h1{font-size:36px;line-height:1.15}
${x} .cv-logo-h{display:none}
${x} .cv-name-m{display:block;color:#fff;font:600 36px/1.15 'Poppins',sans-serif;text-align:center;text-shadow:0 2px 12px #00000080}
${x} .cv-vid{display:none}
${x} .cv-app-t{color:#000}
${x} .cv-app-td{display:none}
${x} .cv-app-tm{display:block}
${x} .cv-hero-r{display:none}
${x} .cv-explore{padding:60px 20px 70px}
${x} .cv-wm{top:30px;font-size:43px}
${x} .cv-ex-title{padding-top:20px;font-size:32px}
${x} .cv-ex-m{display:flex;flex-direction:column;align-items:center;gap:16px;margin:26px 0 0;text-align:center}
${x} .cv-ex-m p{margin:0;color:#000;font:400 16px/1.5 'Poppins',sans-serif}
${x} .cv-ex-m .cv-vid{display:block}
${x} .cv-cards{grid-template-columns:minmax(0,1fr);gap:34px;margin-top:40px}
${x} .cv-banner{min-height:47vh;padding:40px 20px}
${x} .cv-banner h2{font-size:23px}
${x} .cv-banner p{font-size:16px}
${x} .cv-banner-bg-d.has-m{display:none}
${x} .cv-banner-bg-m{display:block}
${x} .cv-foot{padding:60px 20px 30px;background:var(--cv-footer-m)}
${x} .cv-foot-in{grid-template-columns:minmax(0,1fr)}
${x} .cv-foot-app,${x} .cv-foot-end{margin-top:36px}
${x} .cv-ph{height:min(var(--ph,350px),240px)}
${x} .cv-ph-in{padding:0 20px}
${x} .cv-ph h1{font-size:34px}
${x} .cv-ph-img{width:80%}
${x} .cv-story{padding:40px 20px 70px}
${x} .cv-story-lead{font-size:24px}
${x} .cv-story p{font-size:16px;line-height:1.75}
${x} .cv-ag{padding:30px 16px 70px}
${x} .cv-tab-bar{padding:12px}
${x} .cv-tab-p{padding:20px}
${x} .cv-cells{padding:40px 20px 80px}
${x} .cv-cells h2{font-size:24px}
${x} .cv-cells p{font-size:16px}
${x} .cv-hoods{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
${x} .cv-hood{font-size:14px}
${x} .cv-loc{padding:40px 20px 70px}
${x} .cv-loc-top{grid-template-columns:minmax(0,1fr);gap:24px}
${x} .cv-loc-top h1{font-size:30px}
${x} .cv-nf h1{font-size:30px}
`;

export const igrejaCss = [
  top,
  mid,
  pages,
  upTo(1024, tablet),
  upTo(767, mobile),
].join("\n");
