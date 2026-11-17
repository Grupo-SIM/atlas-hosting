/**
 * Variante `saut` (escopo `.sb-sa`): agência de marketing e tecnologia branca com azul e verde-limão, no layout do
 * sautmarketing.com (WordPress + Elementor 4.4 + ElementsKit; o site foi montado sobre um kit comercial, por isso as
 * imagens e os logos de terceiros do kit/clientes não vêm no template: ver `templates/saut-marketing/`).
 * Breakpoints do original: tablet ≤ 1024 e celular ≤ 767 (o kit ainda tem um em 1280 que o builder não repete),
 * repetidos sob `.sb-narrow` (no preview estreito do editor tablet e celular valem os dois). Medidas em 1440px.
 *
 * Tokens do tema: `accent` (azul `#5584FB`), `bg` (`#FFFFFF`), `fg`/`ink` (`#131313`: títulos e fundos escuros), `muted`
 * (`#7C7C7C`: parágrafos) e os extras `lime`, `green`, `orange`, `sky`, `sky2`, `gray`, `line`, `teal` (só o 95%).
 * Fontes: Inter Tight (tudo) e Newsreader (só o título do hero) — `SAUT_EXTRA_FONTS`.
 *
 * Visual em "caixas": a página tem 10px de margem lateral e hero, serviços, "Por que escolher", faixa verde e rodapé são
 * caixas de raio 20px separadas por 10px. O menu em gaveta é um checkbox (`#sb-burger`), sem JS; os contadores usam o
 * runtime genérico (`data-sb-count`); o padrão de pontos é `radial-gradient` (classe `.sa-dots`).
 */
export const isSaut = (theme: Record<string, string>) =>
  theme.variant === "saut";

/** Fontes fixas da variante (nunca texto do usuário). */
export const SAUT_EXTRA_FONTS = ["Inter Tight", "Newsreader"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function sautVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--sa-blue": safe(theme.accent, "#5584FB"),
    "--sa-gray": safe(theme.gray, "#F2F2F2"),
    "--sa-green": safe(theme.green, "#00C22A"),
    "--sa-ink": safe(theme.ink, safe(theme.fg, "#131313")),
    "--sa-lime": safe(theme.lime, "#CCFB55"),
    "--sa-line": safe(theme.line, "#E7E7E7"),
    "--sa-orange": safe(theme.orange, "#FF3C00"),
    "--sa-sky": safe(theme.sky, "#DAF0FF"),
    "--sa-sky2": safe(theme.sky2, "#EEF8FF"),
    "--sa-teal": safe(theme.teal, "#2DD4A0"),
    "--sa-text": safe(theme.muted, "#7C7C7C"),
    "--sa-w20": "#FFFFFF33",
  };
}

const S = ".sb-sa";

/** Tablet (≤ 1024px). `x` = seletor da raiz (`.sb-sa` ou `.sb-sa.sb-narrow`). */
const tablet = (x: string) => `
${x}{--sa-gut:30px}
${x} h2{font-size:40px}
${x} h3{font-size:22px}
${x} .sa-head-box{min-height:88px;padding:0 24px}
${x} .sa-logo{width:160px}
${x} .sa-nav,${x} .sa-head-box>.sa-btn{display:none}
${x} .sa-burger{display:grid}
${x} .sa-hero{min-height:0}
${x} .sa-hero-in{padding-top:80px}
${x} .sa-hero h1{font-size:42px}
${x} .sa-cards{gap:20px;padding-top:60px}
${x} .sa-card{height:280px}
${x} .sa-tag{width:min(230px,calc(100% - 12px));padding:12px 16px;gap:12px}
${x} .sa-leads-n,${x} .sa-sat-n,${x} .sa-float-n,${x} .sa-wc-n,${x} .sa-n{font-size:48px}
${x} .sa-logos{padding:80px 0}
${x} .sa-logos h2{font-size:34px}
${x} .sa-logo-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .sa-about{padding:80px 0}
${x} .sa-about-in{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:50px}
${x} .sa-about h2{font-size:34px}
${x} .sa-float{width:220px;height:220px}
${x} .sa-services,${x} .sa-why{padding:80px 0}
${x} .sa-svc-head{grid-template-columns:1fr;gap:20px}
${x} .sa-svc-list{gap:50px;padding-top:50px}
${x} .sa-svc{gap:24px}
${x} .sa-svc-l h3{font-size:26px}
${x} .sa-svc-img{height:380px}
${x} .sa-process,${x} .sa-cases{padding:80px 0}
${x} .sa-steps{grid-template-columns:repeat(6,minmax(0,1fr))}
${x} .sa-step{grid-column:span 2}
${x} .sa-step:nth-child(n+4){grid-column:span 3}
${x} .sa-why-top{grid-template-columns:1fr;gap:36px}
${x} .sa-why-cards{gap:20px}
${x} .sa-wc-1{padding:24px 20px 30px}
${x} .sa-wc-1 p{font-size:17px}
${x} .sa-wc-in{padding:22px}
${x} .sa-case-top{padding:24px 20px}
${x} .sa-case h3{font-size:34px}
${x} .sa-case-grid{gap:20px}
${x} .sa-impact{padding:50px 0 80px}
${x} .sa-imp-top{grid-template-columns:1fr;gap:20px}
${x} .sa-imp-body{grid-template-columns:1fr;gap:50px}
${x} .sa-imp-photo{height:auto;aspect-ratio:500/382;max-width:560px}
${x} .sa-cta{padding:80px 0}
${x} .sa-cta-in{grid-template-columns:1fr;gap:50px}
${x} .sa-cta-photo{height:auto;aspect-ratio:580/429;max-width:640px}
${x} .sa-band{height:auto;min-height:240px;padding:50px 30px}
${x} .sa-band h2{font-size:40px}
${x} .sa-footer{padding:50px 30px 26px}
${x} .sa-fgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:44px 30px}
${x} .sa-fcol h3{font-size:26px}
`;

/** Celular (≤ 767px). */
const mobile = (x: string) => `
${x}{--sa-gut:20px}
${x} p{font-size:15px}
${x} h2{font-size:32px}
${x} h3{font-size:20px}
${x} .sa-head{padding:10px}
${x} .sa-head-box{min-height:62px;padding:0 16px 0 20px}
${x} .sa-logo{width:110px}
${x} .sa-hero-in{padding-top:56px}
${x} .sa-hero-text{gap:22px}
${x} .sa-hero h1{font-size:34px}
${x} .sa-hero-btns{flex-direction:column;width:100%}
${x} .sa-hero-btns .sa-btn{width:100%}
${x} .sa-cards{grid-template-columns:minmax(0,1fr);padding-top:50px}
${x} .sa-card{height:300px}
${x} .sa-leads-n,${x} .sa-sat-n,${x} .sa-float-n,${x} .sa-wc-n,${x} .sa-n{font-size:36px}
${x} .sa-logos{padding:60px 0}
${x} .sa-logos h2{font-size:28px}
${x} .sa-logo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .sa-about{padding:60px 0}
${x} .sa-about-in{grid-template-columns:minmax(0,1fr);gap:40px}
${x} .sa-about h2{font-size:28px}
${x} .sa-about-photo{width:100%}
${x} .sa-float{top:auto;bottom:-20px;width:200px;height:190px;padding:8px}
${x} .sa-services,${x} .sa-why{padding:60px 0}
${x} .sa-svc{grid-template-columns:minmax(0,1fr);gap:18px}
${x} .sa-svc-img{order:3;height:auto;aspect-ratio:4/3}
${x} .sa-svc-l h3{font-size:24px}
${x} .sa-process,${x} .sa-cases{padding:60px 0}
${x} .sa-steps{grid-template-columns:minmax(0,1fr)}
${x} .sa-step,${x} .sa-step:nth-child(n+4){grid-column:auto}
${x} .sa-step{min-height:0}
${x} .sa-step-ic{margin-bottom:30px}
${x} .sa-fbrand img{width:300px;margin:-12px 0 -12px -86px}
${x} .sa-note{padding:64px 22px 34px}
${x} .sa-note-badge{width:max-content;max-width:calc(100% - 24px);padding:12px 20px;white-space:normal}
${x} .sa-note h3{font-size:24px}
${x} .sa-why-cards{grid-template-columns:minmax(0,1fr)}
${x} .sa-case-grid{grid-template-columns:minmax(0,1fr)}
${x} .sa-case h3{font-size:28px}
${x} .sa-stats{gap:14px}
${x} .sa-stats strong{font-size:22px}
${x} .sa-case-img{height:220px}
${x} .sa-impact{padding:40px 0 60px}
${x} .sa-imp-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 20px}
${x} .sa-cta{padding:60px 0}
${x} .sa-badges{gap:10px 20px}
${x} .sa-band{padding:50px 20px}
${x} .sa-band-in{flex-direction:column;align-items:flex-start}
${x} .sa-band h2{font-size:32px}
${x} .sa-footer{padding:44px 20px 24px}
${x} .sa-fgrid{grid-template-columns:minmax(0,1fr)}
${x} .sa-fcol h3{font-size:24px}
${x} .sa-nf{min-height:420px}
${x} .sa-nf h1{font-size:34px}
${x} .sa-legal{padding:50px 0 70px}
${x} .sa-legal h1{font-size:32px}
`;

const baseCss = `
${S}{--sa-gut:30px;background:#fff;color:var(--sa-ink);font-family:var(--sb-font-body);font-size:16px;line-height:1.6;overflow-x:clip}
${S} *{box-sizing:border-box}
${S} main{padding-top:0!important}
${S} a{color:inherit;text-decoration:none}
${S} h1,${S} h2,${S} h3,${S} p,${S} ul,${S} ol,${S} hr{margin:0;padding:0}
${S} ul,${S} ol{list-style:none}
${S} img{display:block;max-width:100%}
${S} svg{flex:none}
${S} i,${S} u{font-style:normal;text-decoration:none}
${S} h1,${S} h2,${S} h3{font-family:var(--sb-font-heading);font-weight:500;line-height:1.2;letter-spacing:-.02em;color:var(--sa-ink)}
${S} h2{font-size:50px;margin-top:18px}
${S} h3{font-size:24px}
${S} p{color:var(--sa-text);font-size:16px;line-height:1.6}
${S} .sa-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
${S} .sa-in{width:min(1280px,100% - 2 * var(--sa-gut));margin-inline:auto}
${S} .sa-box{margin-inline:10px;border-radius:20px}
${S} .sa-img-empty,${S} .sb-img-empty{background:var(--sa-gray)}

/* padrão de pontos (liga/desliga por seção) */
${S} .sa-dots{position:relative;isolation:isolate;--sa-dot:#00000014}
${S} .sa-dots::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:inherit;background:radial-gradient(var(--sa-dot) 2px,transparent 2.6px) 0 0/16px 16px;-webkit-mask-image:radial-gradient(ellipse at center,#000 28%,transparent 76%);mask-image:radial-gradient(ellipse at center,#000 28%,transparent 76%)}

/* pílula de rótulo */
${S} .sa-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border:1px solid var(--sa-sky);border-radius:90px;background:var(--sa-sky);color:var(--sa-ink);font-size:14px;font-weight:500;letter-spacing:-.28px;line-height:1.3}
${S} .sa-pill svg{width:14px;height:14px}
${S} .sa-pill.glass{padding:6px 12px;border-color:var(--sa-w20);background:var(--sa-w20);color:#fff}
${S} .sa-pill.white{border-color:#fff;background:#fff}
${S} .sa-pill.soft{border-color:var(--sa-sky);background:var(--sa-sky2)}
${S} .sa-pill.outline{border-color:var(--sa-line);background:transparent;color:var(--sa-blue);font-size:13px;font-weight:800;letter-spacing:0}
${S} .sa-leads-top .sa-pill.white{color:var(--sa-text)}

/* botões */
${S} .sa-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 26px;border:1px solid transparent;border-radius:90px;font-family:var(--sb-font-body);font-size:15px;font-weight:600;line-height:1.2;text-align:center;cursor:pointer;transition:background-color .3s,color .3s,border-color .3s}
${S} .sa-btn svg{width:18px;height:18px}
${S} .sa-btn.dark{background:var(--sa-ink);color:#fff}
${S} .sa-btn.dark:hover{background:var(--sa-blue)}
${S} .sa-btn.lime{padding:16px 28px;background:var(--sa-lime);color:var(--sa-ink)}
${S} .sa-btn.lime:hover{background:#fff}
${S} .sa-btn.ghost{padding:16px 28px;border-color:#fff;color:#fff}
${S} .sa-btn.ghost:hover{background:var(--sa-w20)}

/* ícone check num quadrado */
${S} .sa-check{display:grid;place-items:center;flex:none;width:30px;height:30px;border-radius:8px;background:var(--sa-lime);color:var(--sa-ink)}
${S} .sa-check svg{width:16px;height:16px;stroke-width:3}
${S} .sa-checks{display:grid;gap:20px}
${S} .sa-checks h3{display:flex;align-items:center;gap:14px}
${S} .sa-checks p{padding-left:44px;margin-top:6px}

/* distintivos e etiquetas sobre foto */
${S} .sa-badge{position:absolute;top:6px;left:6px;display:grid;place-items:center;width:50px;height:50px;border-radius:10px;background:#fff;color:var(--sa-orange)}
${S} .sa-badge.shield{left:auto;right:6px}
${S} .sa-badge svg{width:24px;height:24px}
${S} .sa-tag{position:absolute;right:6px;bottom:6px;display:flex;align-items:center;gap:16px;width:260px;max-width:calc(100% - 12px);height:68px;padding:16px 24px;border-radius:14px;background:#fff;color:var(--sa-ink);font-size:15px;font-weight:500}
${S} .sa-tag>span:first-child{color:var(--sa-blue);font-weight:600;white-space:nowrap}
${S} .sa-tag u{align-self:stretch;width:1px;background:#D2D2D2}
${S} .sa-wc-3 .sa-tag{right:auto;left:6px;width:auto}
${S} .sa-avs{display:flex}
${S} .sa-av{width:40px;height:40px;margin-left:-12px;border:1px solid var(--sa-ink);border-radius:50%;object-fit:cover}
${S} .sa-av:first-child{margin-left:0}
${S} .sa-av.ini{display:grid;place-items:center;background:var(--sa-lime);color:var(--sa-ink);font-size:14px;font-weight:600}
${S} .sa-sfx,${S} .sa-pfx{font-style:normal}

/* cabeçalho */
${S} .sa-head{position:relative;z-index:5;padding:10px;background:#fff}
${S} .sb-block:has(>.sa-head.is-sticky){position:sticky;top:0;z-index:60}
${S} .sa-head-box{display:flex;align-items:center;gap:32px;min-height:96px;padding:0 40px;border-radius:20px;background:var(--sa-gray)}
${S} .sa-logo{display:block;width:180px;margin-right:auto}
${S} .sa-logo img{width:100%;height:auto}
${S} .sa-menu{display:flex;gap:32px}
${S} .sa-menu a{color:var(--sa-ink);font-size:15px;font-weight:500;transition:color .3s}
${S} .sa-menu a:hover{color:var(--sa-blue)}
${S} .sa-burger{display:none;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--sa-ink);color:#fff;cursor:pointer;transition:background-color .3s}
${S} .sa-burger:hover{background:var(--sa-blue)}
${S} .sa-burger svg,${S} .sa-drawer-x svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
${S} .sa-burger-input{position:absolute;opacity:0;pointer-events:none}
${S} .sa-veil{position:fixed;inset:0;z-index:2147483629;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .3s}
${S} .sa-drawer{position:fixed;top:0;right:0;z-index:2147483630;display:flex;flex-direction:column;gap:22px;width:min(340px,86vw);height:100vh;padding:24px;overflow:auto;background:#fff;box-shadow:-8px 0 30px rgba(0,0,0,.15);transform:translateX(100%);visibility:hidden;transition:transform .35s,visibility 0s linear .35s}
${S} .sa-burger-input:checked~.sa-veil{opacity:1;pointer-events:auto}
${S} .sa-burger-input:checked~.sa-drawer{transform:none;visibility:visible;transition:transform .35s,visibility 0s}
${S} .sa-drawer-x{align-self:flex-end;display:grid;place-items:center;width:40px;height:40px;border-radius:10px;background:var(--sa-gray);cursor:pointer}
${S} .sa-drawer-logo img{width:130px;height:auto}
${S} .sa-drawer-menu{display:grid;gap:4px}
${S} .sa-drawer-menu a{display:block;padding:12px 0;border-bottom:1px solid var(--sa-line);font-size:17px;font-weight:500}
${S} .sa-drawer-menu a:hover{color:var(--sa-blue)}

/* hero */
${S} .sa-hero{position:relative;display:flex;min-height:990px;overflow:hidden;background:#78b0ec center/cover no-repeat;color:#fff}
${S} .sa-hero-in{display:flex;flex:1;flex-direction:column;align-items:center;padding:100px 0 30px}
${S} .sa-hero-text{display:flex;flex-direction:column;align-items:center;gap:28px;max-width:100%;text-align:center}
${S} .sa-hero h1{max-width:600px;color:#fff;font-family:var(--sb-font-accent);font-size:51px;font-weight:500;line-height:1.1;letter-spacing:-.04em}
${S} .sa-hero-text p{max-width:600px;color:#fff;font-weight:400}
${S} .sa-hero-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
${S} .sa-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px;width:100%;margin-top:auto;padding-top:80px}
${S} .sa-card{position:relative;height:300px;overflow:hidden;border-radius:20px}
${S} .sa-c-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${S} .sa-c-leads{display:flex;flex-direction:column;justify-content:space-between;gap:16px;padding:20px;background:var(--sa-sky);color:var(--sa-ink)}
${S} .sa-leads-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
${S} .sa-leads-top b{color:var(--sa-blue);font-size:15px;font-weight:600}
${S} .sa-leads-n,${S} .sa-sat-n,${S} .sa-float-n,${S} .sa-wc-n,${S} .sa-n{font-family:var(--sb-font-heading);font-size:60px;font-weight:500;line-height:1;letter-spacing:-.02em}
${S} .sa-squares{display:grid;grid-template-columns:repeat(15,minmax(0,1fr));gap:3px}
${S} .sa-squares i{aspect-ratio:1;border-radius:3px;background:var(--sa-blue)}
${S} .sa-squares .t1{background:#8FB0FD}
${S} .sa-squares .t2{background:#C3D4FE}
@keyframes sa-sq{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}
${S} .sa-squares.wave i{animation:sa-sq .3s both;animation-delay:calc(var(--i) * 15ms)}
${S} .sa-c-sat{display:flex;flex-direction:column;justify-content:space-between;padding:10px;border:6px solid #fff;background:var(--sa-ink)}
${S} .sa-sat-n{align-self:center;color:var(--sa-teal)}
${S} .sa-sat-l{align-self:flex-end;color:#fff;font-size:15px;font-weight:600}

/* marcas */
${S} .sa-logos{padding:100px 0}
${S} .sa-logos h2{max-width:780px;margin:0 auto;font-size:44px;font-weight:600;letter-spacing:-.88px;text-align:center}
${S} .sa-logo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:56px}
${S} .sa-logo-cell{display:grid;place-items:center;aspect-ratio:312/180;padding:20px;border-radius:20px;background:var(--sa-gray)}
${S} .sa-logo-cell img{width:auto;max-width:60%;max-height:60%;object-fit:contain;transition:filter .3s}
${S} .sa-logos.gray .sa-logo-cell img{filter:grayscale(1)}
${S} .sa-logos.gray .sa-logo-cell:hover img{filter:none}

/* sobre */
${S} .sa-about{padding:100px 0}
${S} .sa-about-in{display:grid;grid-template-columns:minmax(0,630px) minmax(0,560px);justify-content:space-between;gap:60px;align-items:start}
${S} .sa-about-l{position:relative}
${S} .sa-about-photo{width:500px;max-width:100%;aspect-ratio:4/5;overflow:hidden;border-radius:20px}
${S} .sa-about-photo img,${S} .sa-svc-img img,${S} .sa-case-img img,${S} .sa-imp-photo img,${S} .sa-cta-photo img,${S} .sa-wc-3>img{width:100%;height:100%;object-fit:cover}
${S} .sa-float{position:absolute;top:130px;right:0;display:flex;flex-direction:column;justify-content:space-between;width:260px;height:248px;padding:10px;border:6px solid var(--sa-gray);border-radius:20px;background:#fff}
${S} .sa-float-top{color:var(--sa-blue);font-size:14px;font-weight:500}
${S} .sa-float-n{align-self:center}
${S} .sa-float-n .sa-sfx{color:var(--sa-orange)}
${S} .sa-float-l{align-self:flex-end;color:var(--sa-text);font-size:15px;font-weight:600}
${S} .sa-about h2{margin:18px 0 20px;font-size:40px}
${S} .sa-about-r>p+p{margin-top:14px}
${S} .sa-about-r .sa-checks{margin-top:30px}

/* serviços */
${S} .sa-services{margin-top:10px;padding:100px 0;background:var(--sa-ink);color:#fff}
${S} .sa-services h2,${S} .sa-services h3{color:#fff}
${S} .sa-svc-head{display:grid;grid-template-columns:minmax(0,640px) minmax(0,370px);justify-content:space-between;align-items:center;gap:40px}
${S} .sa-svc-head>p{color:#FFFFFF99;font-size:14px}
${S} .sa-svc-list{display:grid;gap:40px;padding-top:60px}
${S} .sa-svc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px;align-items:stretch}
${S} .sa-svc-l{display:flex;flex-direction:column;align-items:flex-start;gap:20px}
${S} .sa-svc-l h3{font-size:30px}
${S} .sa-svc-img{height:450px;overflow:hidden;border-radius:20px}
${S} .sa-svc-img img{transition:transform .4s}
${S} .sa-svc:hover .sa-svc-img img{transform:scale(1.03)}
${S} .sa-svc-p{align-self:end;color:#fff;font-weight:400}

/* como funciona */
${S} .sa-process{padding:100px 0}
${S} .sa-head-t.center{max-width:700px;margin-inline:auto;text-align:center}
${S} .sa-head-t.center p{margin-top:20px}
${S} .sa-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:60px;padding:10px;border-radius:20px;background:var(--sa-gray)}
${S} .sa-step{display:flex;flex-direction:column;min-height:260px;padding:20px 18px;border-radius:14px;background:#fff}
${S} .sa-step-ic{display:grid;place-items:center;width:40px;height:26px;border-radius:90px;background:var(--sa-lime);color:var(--sa-ink)}
${S} .sa-step-ic{margin-bottom:64px}
${S} .sa-step-ic svg{width:16px;height:16px}
${S} .sa-step h3{margin-bottom:10px}
${S} .sa-step p{font-size:14px}
${S} .sa-note{position:relative;max-width:700px;margin:80px auto 0;padding:70px 40px 50px;border:1px solid var(--sa-sky);border-radius:20px;background:var(--sa-sky2);text-align:center}
${S} .sa-note-badge{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);padding:14px 30px;border:2px solid var(--sa-sky);border-radius:90px;background:var(--sa-blue);color:#fff;font-size:15px;font-weight:600;white-space:nowrap}
${S} .sa-note h3{font-size:30px}
${S} .sa-note p{margin-top:14px}

/* por que escolher */
${S} .sa-why{margin-top:10px;padding:100px 0;border:1px solid var(--sa-sky);background:var(--sa-sky2)}
${S} .sa-why-top{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:80px;align-items:start}
${S} .sa-why-l p{margin-top:14px}
${S} .sa-why-l h2+p{margin-top:20px}
${S} .sa-why-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px;margin-top:60px}
${S} .sa-wc{position:relative;height:373px;overflow:hidden;border-radius:20px}
${S} .sa-wc-1{display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:30px 30px 40px;background:#fff;text-align:center}
${S} .sa-wc-1 p{color:var(--sa-ink);font-size:20px;font-weight:500;line-height:1.4}
${S} .sa-wc-2{padding:10px;background:#fff}
${S} .sa-wc-in{display:flex;flex-direction:column;height:100%;padding:30px;border-radius:14px;background:var(--sa-ink);color:#fff}
${S} .sa-wc-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
${S} .sa-wc-n{color:var(--sa-lime)}
${S} .sa-wc-in hr{height:1px;margin:24px 0;border:0;background:#FFFFFF1A}
${S} .sa-wc-in h3{color:#fff}
${S} .sa-wc-in p{margin-top:10px;color:#FFFFFF80;font-size:15px}
${S} .sa-wc-3>img{position:absolute;inset:0}

/* resultados */
${S} .sa-cases{padding:100px 0}
${S} .sa-case-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px;padding-top:40px}
${S} .sa-case{display:flex;flex-direction:column;padding:10px;border:1px solid var(--sa-sky);border-radius:20px;background:#fff;transition:border-color .3s}
${S} .sa-case:hover{border-color:var(--sa-blue)}
${S} .sa-case-top{display:flex;flex:1;flex-direction:column;align-items:flex-start;gap:16px;padding:30px}
${S} .sa-case h3{font-size:40px}
${S} .sa-stats{display:flex;gap:30px;width:100%;margin-top:auto;padding-top:10px}
${S} .sa-stats li{flex:1 1 0;min-width:0}
${S} .sa-stats strong{display:block;font-family:var(--sb-font-heading);font-size:28px;font-weight:500;line-height:1.15;letter-spacing:-.02em}
${S} .sa-stats .green{color:var(--sa-green)}
${S} .sa-stats .orange{color:var(--sa-orange)}
${S} .sa-stats .blue{color:var(--sa-blue)}
${S} .sa-stats span{display:block;margin-top:4px;color:var(--sa-ink);font-size:15px;font-weight:600;line-height:1.35}
${S} .sa-case-img{height:300px;overflow:hidden;border-radius:14px}
${S} .sa-case-img img{transition:transform .4s}
${S} .sa-case:hover .sa-case-img img{transform:scale(1.03)}

/* impacto */
${S} .sa-impact{padding:60px 0 100px}
${S} .sa-imp-top{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:80px;align-items:center}
${S} .sa-imp-body{display:grid;grid-template-columns:minmax(0,740px) minmax(0,500px);justify-content:space-between;gap:40px;align-items:center;padding-top:60px}
${S} .sa-imp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px}
${S} .sa-n{display:block;color:var(--sa-blue)}
${S} .sa-imp-n h3{margin-top:14px}
${S} .sa-imp-n p{margin-top:8px}
${S} .sa-imp-photo{height:382px;overflow:hidden;border-radius:20px}

/* chamada final */
${S} .sa-cta{padding:100px 0}
${S} .sa-cta-in{display:grid;grid-template-columns:minmax(0,580px) minmax(0,1fr);gap:100px;align-items:center}
${S} .sa-cta-photo{height:429px;overflow:hidden;border-radius:20px}
${S} .sa-cta-r>p{margin-top:20px}
${S} .sa-badges{display:flex;flex-wrap:wrap;gap:12px 30px;margin:26px 0 32px}
${S} .sa-badges li{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500}
${S} .sa-badges .sa-check{width:18px;height:18px;border-radius:4px;background:var(--sa-blue);color:#fff}
${S} .sa-badges .sa-check svg{width:11px;height:11px}

/* faixa verde e rodapé */
${S} .sa-foot{padding-bottom:10px}
${S} .sa-band{display:flex;align-items:center;height:280px;padding:0 30px;background:var(--sa-lime);--sa-dot:#00000024}
${S} .sa-band.sa-dots::before{-webkit-mask-image:radial-gradient(circle at 88% 50%,#000 0,transparent 55%);mask-image:radial-gradient(circle at 88% 50%,#000 0,transparent 55%)}
${S} .sa-band-in{display:flex;align-items:center;justify-content:space-between;gap:40px;width:min(1280px,100%);margin-inline:auto}
${S} .sa-band h2{max-width:594px;margin:0;font-size:50px}
${S} .sa-footer{margin-top:10px;padding:60px 30px 30px;background:var(--sa-ink);color:#fff}
${S} .sa-fgrid{display:grid;grid-template-columns:1.1fr .9fr 1.2fr 1fr;gap:40px}
${S} .sa-fbrand img{width:340px;max-width:none;height:auto;margin:-14px 0 -14px -98px}
${S} .sa-pill-lines{display:block;text-align:center}
${S} .sa-fbrand p{margin-top:20px;color:#FFFFFF99}
${S} .sa-socials{display:flex;gap:10px;margin-top:22px}
${S} .sa-socials a{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--sa-lime);color:var(--sa-ink);transition:background-color .3s}
${S} .sa-socials a:hover{background:#fff}
${S} .sa-socials svg{width:16px;height:16px}
${S} .sa-fcol h3{margin-bottom:20px;color:#fff;font-size:30px}
${S} .sa-fcol h3.sa-fsub{margin-top:40px}
${S} .sa-fcol ul{display:grid;gap:10px}
${S} .sa-fcol li,${S} .sa-fcol li a,${S} .sa-fcol li>span{color:#FFFFFF99;font-size:15px;line-height:1.5;transition:color .3s}
${S} .sa-fcol li a:hover{color:#fff}
${S} .sa-fcol li p{margin-top:2px;color:#FFFFFF80;font-size:14px}
${S} .sa-fbottom{display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:50px;padding-top:24px;border-top:1px solid #FFFFFF1A;text-align:center}
${S} .sa-fbottom p{color:#FFFFFF80;font-size:14px}
${S} .sa-fbottom ul{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 22px}
${S} .sa-fbottom a{color:#FFFFFF80;font-size:14px;transition:color .3s}
${S} .sa-fbottom a:hover{color:#fff}

/* 404 e páginas legais */
${S} .sa-nf{display:flex;align-items:center;justify-content:center;min-height:520px;padding:60px 0;background:#78b0ec center/cover no-repeat;color:#fff;text-align:center}
${S} .sa-nf .sa-in{display:flex;flex-direction:column;align-items:center;gap:22px}
${S} .sa-nf h1{color:#fff;font-family:var(--sb-font-accent);font-size:51px;line-height:1.1;letter-spacing:-.04em}
${S} .sa-nf p{color:#fff}
${S} .sa-legal{padding:80px 0 100px}
${S} .sa-legal .sa-in{width:min(860px,100% - 2 * var(--sa-gut))}
${S} .sa-legal h1{font-size:44px}
${S} .sa-legal-intro{margin-top:18px}
${S} .sa-legal-sec{margin-top:36px}
${S} .sa-legal-sec h2{margin:0 0 12px;font-size:24px}
${S} .sa-legal-sec p+p,${S} .sa-legal-sec p+ul,${S} .sa-legal-sec ul+p{margin-top:12px}
${S} .sa-legal-sec ul{padding-left:22px;list-style:disc;color:var(--sa-text)}

`;

/** Regras de tela pequena: media queries na página publicada, mesma lista sob `.sb-narrow` no preview estreito do editor. */
const MEDIA = `
@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
@media (prefers-reduced-motion:reduce){${S} .sa-squares.wave i{animation:none}${S} .sa-drawer,${S} .sa-veil,${S} .sa-svc-img img,${S} .sa-case-img img{transition:none}}
`;

export const sautCss = baseCss + MEDIA;
