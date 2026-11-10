/**
 * Variante "pagatg" (`theme.variant = "pagatg"`): landing escura em roxo e ciano da PagaTG (plataforma de vendas por
 * bot no Telegram), medida em pagatg.com (Astra 4.14 + Elementor 4.4 — kit 911, home 930, cabeçalho 943, rodapé 954).
 * Tudo fica sob `.sb-pg`, então as outras variantes não mudam.
 *
 * Breakpoints do Elementor: tablet ≤ 1024 e celular ≤ 767. O preview estreito do editor (`.sb-narrow`) não enxerga
 * media query, então cada regra de tela pequena existe duas vezes (e ali vale o visual de celular). O menu suspenso do
 * cabeçalho é um checkbox (`#sb-burger`), sem JS; o `fx-runtime` fecha com Esc e ao clicar num link.
 */
export const isPagaTg = (theme: Record<string, string>) =>
  theme.variant === "pagatg";

export const PAGATG_EXTRA_FONTS = ["Be Vietnam Pro", "Roboto"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

/** Tokens do kit: ciano, roxo escuro (seções), roxo médio (conteúdo de cartão), borda cinza e branco 6%. */
export function pagatgVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--pg-cyan": safe(theme.cyan, "#34D6E2"),
    "--pg-line": safe(theme.line, "#44404C"),
    "--pg-panel": safe(theme.panel, "#22143D"),
    "--pg-soft": safe(theme.soft, "#2F2248"),
    "--pg-w6": "#FFFFFF0F",
  };
}

const S = ".sb-pg";

const tablet = (x: string) => `
${x} h1{font-size:46px}
${x} h2{font-size:36px}
${x} h3{font-size:21px}
${x} .pg-lead{font-size:18px}
${x} .pg-head{padding:12px 40px;margin-bottom:-84px}
${x} .pg-head-in{min-height:56px}
${x} .pg-logo{flex:1 1 auto}
${x} .pg-nav{display:none}
${x} .pg-login{flex:none;order:2;margin-right:20px}
${x} .pg-burger{display:flex;order:3}
${x} .pg-drop{position:absolute;left:40px;right:40px;top:100%;display:block;margin-top:20px;border:8px solid var(--pg-panel);background:var(--pg-panel);box-shadow:0 4px 12px rgba(255,255,255,.12);opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s linear .3s}
${x} .pg-burger-input:checked~.pg-drop{opacity:1;visibility:visible;transition:opacity .3s}
${x} .pg-hero{padding:140px 40px 136px}
${x} .pg-hero-row{flex-direction:column;gap:0;text-align:center}
${x} .pg-hero-text{width:100%}
${x} .pg-btns{justify-content:center}
${x} .pg-hero-img{width:100%;margin-top:60px}
${x} .pg-hero-img img{height:460px}
${x} .pg-hl{margin-top:-136px;padding:0 40px}
${x} .pg-hl-item{padding:32px 16px}
${x} .pg-hl-item img{width:48px;height:48px}
${x} .pg-split{padding:0 40px}
${x} .pg-split-row{flex-direction:column}
${x} .pg-split-photo{flex:none;width:100%;margin-top:0}
${x} .pg-split-box{padding:0 80px 80px}
${x} .pg-split-box h2{margin:-72px 0 0;text-align:center}
${x} .pg-ben{padding:236px 28px 240px}
${x} .pg-ben-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px}
${x} .pg-values{padding:0 40px}
${x} .pg-values-box{padding:48px 32px}
${x} .pg-seal{flex-basis:13%}
${x} .pg-how-row{flex-direction:column;gap:0;padding:0 60px}
${x} .pg-how-text,${x} .pg-how-media{width:100%}
${x} .pg-how-media{margin-top:80px}
${x} .pg-sol{padding:80px 40px}
${x} .pg-sol-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:40px 20px}
${x} .pg-price-row{flex-direction:column;gap:0;padding:0 40px}
${x} .pg-price-left{width:100%;flex-direction:row;gap:40px;align-items:center}
${x} .pg-price-left>*{flex:0 0 46%}
${x} .pg-price-photo img{height:330px}
${x} .pg-price-cards{width:100%;margin-top:60px}
${x} .pg-testi-row{flex-direction:column;gap:0}
${x} .pg-testi-left{width:100%;padding:0 40px}
${x} .pg-tcar{margin:0 0 -100px}
${x} .pg-sec{margin-top:0;padding:80px 0 0}
${x} .pg-sec-row{flex-direction:column-reverse;padding:0 40px}
${x} .pg-sec-photo{flex:none;width:100%;height:600px;margin:0 0 -120px}
${x} .pg-sec-text{padding:0}
${x} .pg-sec-text>.pg-btn{display:table;margin:48px auto 0}
${x} .pg-res{padding:226px 40px 120px}
${x} .pg-steps{flex-direction:column;align-items:stretch}
${x} .pg-step-arrow{align-self:center;margin:20px 0 14px;transform:rotate(90deg)}
${x} .pg-pagehead{padding:160px 40px 100px}
${x} .pg-faq-row{flex-direction:column;gap:0;padding:0 40px}
${x} .pg-faq-box,${x} .pg-faq-list{width:100%}
${x} .pg-faq-list{padding:40px 16px 0}
${x} .pg-prose{padding:0 40px}
${x} .pg-foot{padding:0 40px 60px}
${x} .pg-404{min-height:90vh;padding:160px 100px 120px}
`;

const mobile = (x: string) => `
${x} h1{font-size:36px}
${x} h2{font-size:30px}
${x} h3{font-size:19px}
${x} h4{font-size:17px}
${x} h5{font-size:15px}
${x} .pg-head{padding:12px 20px;margin-bottom:-108px}
${x} .pg-head-in{flex-wrap:wrap;min-height:80px}
${x} .pg-logo{order:1;flex:1 1 60%}
${x} .pg-burger{order:2}
${x} .pg-login{order:3;flex:0 0 100%;margin:12px 0 0}
${x} .pg-login .pg-btn{display:block;width:100%}
${x} .pg-drop{left:20px;right:20px;margin-top:8px}
${x} .pg-hero{padding:180px 20px 100px}
${x} .pg-hero-img{margin-top:40px}
${x} .pg-hero-img img{height:340px}
${x} .pg-lead{margin-bottom:40px}
${x} .pg-btns{flex-direction:column;align-items:stretch;gap:20px}
${x} .pg-btns .pg-btn{display:block;width:100%}
${x} .pg-hl{margin-top:-100px;padding:0 20px}
${x} .pg-hl-item{flex-basis:50%;padding:24px 16px}
${x} .pg-split{margin-top:180px;padding:0 20px}
${x} .pg-split-photo{min-height:380px}
${x} .pg-split-box{padding:20px 16px 60px}
${x} .pg-split-box h2{margin:-120px 0 0}
${x} .pg-arrow-up svg{width:28px;height:28px}
${x} .pg-ben{margin-top:-180px;padding:264px 20px 200px}
${x} .pg-ben-grid{grid-template-columns:minmax(0,1fr);gap:32px}
${x} .pg-values{margin-top:-140px;padding:0 20px}
${x} .pg-values-box{padding:40px 20px;flex-wrap:wrap;justify-content:center;gap:16px}
${x} .pg-seal{flex-basis:27%}
${x} .pg-how{margin-top:100px}
${x} .pg-how-row{padding:0 20px}
${x} .pg-how-stats{flex-direction:column;align-items:flex-start;gap:32px}
${x} .pg-how-media{margin-top:60px}
${x} .pg-how-frame img{height:260px;margin:-12px 12px 12px -12px}
${x} .pg-sol{margin-top:100px;padding:80px 20px}
${x} .pg-sol-grid{grid-template-columns:minmax(0,1fr);gap:40px}
${x} .pg-price{margin-top:100px}
${x} .pg-price-row{padding:0 20px}
${x} .pg-price-left{flex-direction:column;gap:32px}
${x} .pg-price-left>*{flex:none;width:100%}
${x} .pg-pcard{flex-direction:column}
${x} .pg-pcard-img{flex:none;min-height:212px}
${x} .pg-testi{margin-top:100px}
${x} .pg-testi-left{padding:0 20px}
${x} .pg-tcar{margin:0 0 -120px}
${x} .pg-testi-photo{min-height:460px}
${x} .pg-sec{padding:100px 0 0}
${x} .pg-sec-row{padding:0 20px}
${x} .pg-sec-photo{height:340px;margin:0 0 -200px}
${x} .pg-res{padding:268px 20px 120px}
${x} .pg-pagehead{padding:160px 20px 80px}
${x} .pg-faq{margin-top:80px}
${x} .pg-faq-row{padding:0 20px}
${x} .pg-faq-list{padding:32px 0 0}
${x} .pg-prose{margin:50px 0;padding:0 20px}
${x} .pg-foot{padding:0 20px 52px}
${x} .pg-foot-row{flex-direction:column;align-items:center;gap:16px;padding-top:32px;text-align:center}
${x} .pg-foot-links{flex-wrap:wrap;justify-content:center}
${x} .pg-404{padding:160px 32px 80px}
${x} .pg-404-in .pg-btn{margin-top:20px}
`;

export const pagatgCss = `
${S}{font-size:16px;line-height:1.5;color:var(--sb-muted);background:var(--sb-bg)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} h4,${S} h5,${S} h6{margin:0;color:#fff;font-family:var(--sb-font-heading)}
${S} h1{font-size:52px;font-weight:800;line-height:1.3;letter-spacing:-.8px}
${S} h2{font-size:38px;font-weight:700;line-height:1.3;letter-spacing:-.6px}
${S} h3{font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-.2px}
${S} h4{font-size:18px;font-weight:700;line-height:1.4}
${S} h5{font-size:16px;font-weight:500;line-height:1.5}
${S} h6{font-size:13px;font-weight:500;line-height:1.4}
${S} p{margin:0}
${S} hr{margin:0;border:0}
${S} a{transition:color .3s}
${S} a:hover{color:var(--pg-cyan)}
${S} img{max-width:100%}
${S} figure{margin:0}
${S} ul{margin:0;padding:0;list-style:none}
${S} .pg-wrap{position:relative;z-index:1;width:100%;max-width:1280px;margin:0 auto}
${S} .pg-lead{font-size:19px;line-height:1.4}
${S} .pg-outline{color:transparent;-webkit-text-fill-color:transparent;-webkit-text-stroke:2px var(--pg-cyan)}
${S} .pg-step .pg-outline{-webkit-text-stroke:1px var(--pg-cyan)}

/* botões: contorno ciano (hover: texto ciano, borda branca) e degradê; sobem 3px no hover */
${S} .pg-btn{display:inline-block;padding:12px 24px;border:2px solid var(--pg-cyan);border-radius:0;background:transparent;color:#fff;font-family:var(--sb-font-heading);font-size:13px;font-weight:700;letter-spacing:.1px;line-height:1.5;text-align:center;text-transform:uppercase;transition:transform .6s,color .3s,border-color .3s,background .3s}
${S} .pg-btn:hover,${S} .pg-btn:focus-visible{border-color:#fff;color:var(--pg-cyan);transform:translateY(-3px)}
${S} .pg-btn.grad{border-color:var(--sb-accent);background:linear-gradient(135deg,var(--sb-accent) 40%,var(--pg-cyan) 100%);color:#fff}
${S} .pg-btn.grad:hover,${S} .pg-btn.grad:focus-visible{border-color:var(--pg-cyan);background:linear-gradient(64deg,var(--pg-cyan) 0%,var(--sb-accent) 60%);color:#fff}
${S} .pg-btn.full{display:block;width:100%}

/* sobretítulo + título + texto */
${S} .pg-eyebrow{display:block;margin-bottom:16px;color:var(--pg-cyan);font-family:var(--sb-font-heading);font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;word-spacing:1px}
${S} .pg-sechead h2,${S} .pg-sechead h1{margin-bottom:16px}
${S} .pg-sechead.center{margin-bottom:60px;text-align:center}
${S} .pg-sechead.center p{max-width:760px;margin:0 auto}

/* camada de fundo: imagem por cima da cor, com opacidade; fixa só no computador */
${S} .pg-layer{position:relative}
${S} .pg-layer::before{content:"";position:absolute;inset:0;background:var(--pg-ov,none) center/cover no-repeat;opacity:var(--pg-ov-o,0);pointer-events:none}
${S} .pg-layer.repeat::before{background-size:auto;background-repeat:repeat}
${S} .pg-layer>*{position:relative;z-index:1}
${S} .pg-layer>.sb-shape{position:absolute;z-index:0}
@media (min-width:1025px){${S} .pg-layer.fixed::before{background-attachment:fixed}}

/* cabeçalho transparente sobre o hero */
${S} .pg-head{position:relative;z-index:999;margin-bottom:-84px;padding:12px 0}
${S} .pg-head-in{display:flex;align-items:center;max-width:1280px;min-height:56px;margin:0 auto}
${S} .pg-logo{flex:0 0 20%}
${S} .pg-logo img{width:var(--pg-logo,180px);height:auto}
${S} .pg-nav{display:flex;flex:1;justify-content:center}
${S} .pg-menu{display:flex;gap:4px}
${S} .pg-menu a{display:block;padding:12px 14px;color:#fff;font-family:var(--sb-font-heading);font-size:15px;font-weight:600;letter-spacing:-.2px}
${S} .pg-menu a:hover,${S} .pg-menu a:focus-visible{color:var(--pg-cyan)}
${S} .pg-login{display:flex;flex:0 0 20%;justify-content:flex-end}
${S} .pg-burger,${S} .pg-drop{display:none}
${S} .pg-burger{align-items:center;justify-content:center;width:24px;height:24px;color:#fff;cursor:pointer;transition:color .3s}
${S} .pg-burger:hover{color:var(--pg-cyan)}
${S} .pg-burger svg{width:24px;height:24px}
${S} .pg-burger-input{position:absolute;opacity:0;pointer-events:none}
${S} .pg-drop a{display:block;padding:10px 16px;color:var(--sb-muted);font-size:14px;font-weight:500}
${S} .pg-drop a:hover,${S} .pg-drop a:focus-visible{color:var(--pg-cyan)}

/* hero */
${S} .pg-hero{position:relative;overflow:hidden;padding:200px 0 140px;background:var(--pg-panel)}
${S} .pg-veil{position:absolute;inset:0;background:linear-gradient(180deg,var(--pg-panel) 64%,var(--sb-accent) 100%);pointer-events:none}
${S} .pg-hero-row{display:flex;align-items:center;gap:80px}
${S} .pg-hero-text{flex:1;min-width:0}
${S} .pg-hero-text h1{margin-bottom:32px}
${S} .pg-hero-text .pg-lead{margin-bottom:48px}
${S} .pg-btns{display:flex;flex-wrap:wrap;gap:24px 32px}
${S} .pg-hero-img{flex:1;min-width:0}
${S} .pg-hero-img img{display:block;width:100%;height:500px;object-fit:cover}

/* faixa de destaques */
${S} .pg-hl{position:relative;z-index:3;margin-top:-140px}
${S} .pg-hl-row{display:flex;flex-wrap:wrap;max-width:1280px;margin:0 auto;background:var(--pg-panel)}
${S} .pg-hl-item{flex:0 0 25%;padding:48px 20px;text-align:center}
${S} .pg-hl-item:nth-child(odd){background:var(--pg-w6)}
${S} .pg-hl-item img{width:64px;height:64px;margin:0 auto 16px;object-fit:contain}

/* foto + caixa com título que invade a foto */
${S} .pg-split{position:relative;margin-top:200px}
${S} .pg-split-row{display:flex;max-width:1280px;margin:0 auto}
${S} .pg-split-photo{flex:0 0 50%;min-height:540px;margin-top:-80px;background:linear-gradient(rgba(10,7,17,var(--pg-veil,.24)),rgba(10,7,17,var(--pg-veil,.24))),var(--pg-img,none) center/cover no-repeat,var(--pg-panel)}
${S} .pg-split-box{flex:1;min-width:0;padding:60px 80px;background:var(--pg-panel)}
${S} .pg-split-box h2{position:relative;z-index:2;margin-left:-220px}
${S} .pg-iconrow{display:flex;gap:24px;margin-top:40px}
${S} .pg-arrow-up{flex:none;display:block;width:40px;height:40px;color:var(--pg-cyan);transform:rotate(320deg)}
${S} .pg-arrow-up svg{display:block;width:100%;height:100%}
${S} .pg-iconrow h3{margin-bottom:8px}
${S} .pg-split-box>.pg-btn{margin-top:40px}

/* benefícios */
${S} .pg-ben{margin-top:-120px;padding:240px 0;background:linear-gradient(180deg,var(--sb-accent) 0%,var(--pg-panel) 21%)}
${S} .pg-ben-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${S} .pg-ben-card{position:relative;display:flex;flex-direction:column;gap:32px;padding:32px 20px;border-top:4px solid var(--sb-accent);background:#834DEB33;text-align:center;transition:transform 1.2s,background-color 1.2s,border-color 1.2s}
${S} .pg-ben-card:hover{border-top-color:var(--pg-cyan);background:#834DEB52;transform:translateY(-6px)}
${S} .pg-ben-ico{width:64px;height:64px;margin:0 auto;object-fit:contain}
${S} .pg-ben-card h3{margin:0}
${S} .pg-ben-card p{flex:1}
${S} .pg-ben-img{height:180px}
${S} .pg-ben-img img{width:100%;height:100%;margin:0 auto;object-fit:contain}

/* seis valores */
${S} .pg-values{position:relative;z-index:3;margin-top:-160px}
${S} .pg-values-box{display:flex;align-items:center;justify-content:space-between;max-width:1280px;margin:0 auto;padding:48px;background:var(--pg-panel)}
${S} .pg-seal{flex:0 0 10%;overflow:visible}
${S} .pg-seal img{display:block;width:100%;height:auto;opacity:.64;transition:opacity .3s,transform .3s}
${S} .pg-seal:hover img{opacity:1;transform:scale(1.1)}

/* como funciona */
${S} .pg-how{margin-top:120px}
${S} .pg-how-row{display:flex;align-items:center;gap:100px}
${S} .pg-how-text,${S} .pg-how-media{flex:1;min-width:0}
${S} .pg-how-stats{display:flex;align-items:center;gap:64px;margin:40px 0 48px}
${S} .pg-count{display:flex;flex-direction:column;gap:12px}
${S} .pg-count b{color:#fff;font-family:var(--sb-font-heading);font-size:52px;font-weight:800;line-height:1.3;letter-spacing:-.8px}
${S} .pg-count span{color:var(--sb-muted);font-family:var(--sb-font-heading);font-size:13px;font-weight:700;text-transform:uppercase}
${S} .pg-checks{display:flex;flex-direction:column;gap:16px}
${S} .pg-checks li{display:flex;align-items:center;gap:12px}
${S} .pg-checks i{display:flex;flex:none;color:var(--pg-cyan)}
${S} .pg-checks svg{width:22px;height:22px}
${S} .pg-how-frame{display:flow-root;background:linear-gradient(160deg,var(--sb-accent) 36%,var(--pg-cyan) 100%)}
${S} .pg-how-frame img{display:block;width:100%;height:500px;margin:-20px 20px 20px -20px;object-fit:cover}

/* soluções */
${S} .pg-sol{margin-top:120px;padding:120px 0}
${S} .pg-sol-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
${S} .pg-sol-item{display:flex;flex-direction:column}
${S} .pg-sol-card{position:relative;z-index:2;display:flex;flex:1;flex-direction:column;border:1px solid var(--pg-line);transition:transform .6s}
${S} .pg-sol-item:hover .pg-sol-card{transform:translateY(-32px)}
${S} .pg-sol-img{position:relative;min-height:224px;overflow:hidden}
${S} .pg-sol-img i{position:absolute;inset:0;background:var(--pg-img,none) center/cover no-repeat;transition:transform 1.5s}
${S} .pg-sol-item:hover .pg-sol-img i{transform:scale(1.2)}
${S} .pg-sol-body{display:flex;flex:1;flex-direction:column;align-items:center;padding:32px 20px;background:var(--pg-soft);text-align:center;transition:background-color .6s}
${S} .pg-sol-item:hover .pg-sol-body{background:var(--pg-panel)}
${S} .pg-sol-body h4{margin-bottom:8px}
${S} .pg-sol-body p{flex:1;margin-bottom:20px}
${S} .pg-sol-tag{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:center;min-height:48px;margin-top:-36px;padding:12px;background:linear-gradient(243deg,var(--pg-cyan) 0%,var(--sb-accent) 65%);color:#fff;font-family:var(--sb-font-heading);font-size:15px;font-weight:900;text-align:center}
${S} .pg-sol-item:first-child .pg-sol-tag{background:linear-gradient(135deg,var(--sb-accent) 50%,var(--pg-cyan) 100%)}

/* taxas */
${S} .pg-price{margin-top:140px;padding-bottom:48px}
${S} .pg-price::after{content:"";position:absolute;inset:0;z-index:0;background:radial-gradient(at bottom center,var(--sb-accent) 0%,var(--sb-bg) 80%);opacity:var(--pg-veil-o,.6);pointer-events:none}
${S} .pg-price-row{display:flex;align-items:flex-start;gap:80px}
${S} .pg-price-left{display:flex;flex:0 0 32%;flex-direction:column}
${S} .pg-price-left .pg-sechead.center{margin-bottom:40px}
${S} .pg-price-photo img{display:block;width:100%;height:445px;object-fit:cover}
${S} .pg-price-cards{display:flex;flex:1;flex-direction:column;gap:24px;min-width:0}
${S} .pg-pcard{display:flex;background:var(--pg-panel)}
${S} .pg-pcard-img{position:relative;flex:0 0 32%;min-height:212px;overflow:hidden}
${S} .pg-pcard-img i{position:absolute;inset:0;background:var(--pg-img,none) center/cover no-repeat;transition:transform 1.5s}
${S} .pg-pcard:hover .pg-pcard-img i{transform:scale(1.2)}
${S} .pg-pcard-body{flex:1;padding:32px;text-align:left}
${S} .pg-pcard-body h3{margin-bottom:0;transition:color .3s}
${S} .pg-pcard:hover h3{color:var(--pg-cyan)}
${S} .pg-pcard-body p{margin:16px 0}

/* depoimentos */
${S} .pg-testi{margin-top:120px}
${S} .pg-testi-row{display:flex;align-items:stretch;gap:80px}
${S} .pg-testi-left{position:relative;z-index:2;flex:0 1 42%;min-width:0}
${S} .pg-testi-left .pg-sechead.left p{margin-bottom:40px}
${S} .pg-tcar{position:relative;z-index:2;margin-right:-164px}
${S} .pg-tcard{border:2px solid var(--pg-line);background:var(--pg-panel)}
${S} .pg-tcard figcaption{display:flex;align-items:center;gap:16px;padding:40px 20px 20px;border-bottom:1px solid var(--pg-line)}
${S} .pg-tcard figcaption img{width:64px;height:64px;flex:none;object-fit:cover}
${S} .pg-tcard figcaption div{flex:1;min-width:0}
${S} .pg-tcard figcaption span{font-size:14px}
${S} .pg-net{display:flex;flex:none;color:#fff}
${S} .pg-net svg{width:20px;height:20px}
${S} .pg-tcard blockquote{margin:0;padding:20px 20px 40px;color:#fff}
${S} .pg-tcar .si-car-dots button{width:8px;height:8px;background:var(--pg-line)}
${S} .pg-tcar .si-car-dots button.on{background:var(--sb-accent)}
${S} .pg-testi-photo{position:relative;flex:1;min-height:580px;background:var(--pg-img,none) center/cover no-repeat,var(--sb-accent)}
${S} .pg-testi-photo::after{content:"";position:absolute;inset:0;background:var(--sb-bg);opacity:.48}

/* praticidade e segurança */
${S} .pg-sec{margin-top:200px;background:radial-gradient(at top center,var(--sb-accent) 0%,var(--pg-panel) 32%)}
${S} .pg-sec-row{display:flex;align-items:stretch;max-width:1280px;margin:0 auto}
${S} .pg-sec-photo{position:relative;z-index:2;flex:0 0 48%;height:760px;margin:-80px 0}
${S} .pg-sec-photo img{display:block;width:100%;height:100%;object-fit:cover}
${S} .pg-sec-text{flex:1;min-width:0;padding:60px}
${S} .pg-sec-text>p{margin:16px 0 48px}
${S} .pg-sec-list li{display:flex;align-items:flex-start;gap:16px;padding:24px 0;border-bottom:1px solid var(--pg-line);color:#fff}
${S} .pg-sec-list li:first-child{padding-top:0}
${S} .pg-sec-list i{display:flex;flex:none;margin-top:2px;color:var(--pg-cyan)}
${S} .pg-sec-list svg{width:20px;height:20px}
${S} .pg-sec-text>.pg-btn{margin-top:48px}

/* resultados */
${S} .pg-res{padding:184px 0 120px;background:radial-gradient(at top center,var(--sb-accent) 0%,var(--sb-bg) 32%)}
${S} .pg-steps{display:flex;align-items:stretch;justify-content:space-between}
${S} .pg-step{flex:1;min-width:0;padding:20px;border:1px solid var(--pg-line)}
${S} .pg-step-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
${S} .pg-step-top img{width:64px;height:64px;object-fit:contain}
${S} .pg-step-top b{font-size:52px;font-weight:800;line-height:1.3;letter-spacing:-.8px}
${S} .pg-step h4{margin-bottom:8px}
${S} .pg-step p{font-size:14px}
${S} .pg-step-arrow{display:flex;flex:none;align-self:center;margin:0 12px -6px;color:var(--pg-cyan)}
${S} .pg-step-arrow svg{width:16px;height:16px}

/* cabeçalho de página (FAQ e legais) */
${S} .pg-pagehead{padding:185px 0 116px;background-color:var(--sb-bg)}
${S} .pg-pagehead::after{content:"";position:absolute;inset:0;z-index:0;background:radial-gradient(at bottom center,var(--sb-accent) 0%,var(--sb-bg) 24%);opacity:.8;pointer-events:none}
${S} .pg-pagehead .pg-wrap{max-width:680px;text-align:center}
${S} .pg-pagehead h1{margin-bottom:16px}
${S} .pg-pagehead.narrow h1{margin-bottom:0}

/* FAQ */
${S} .pg-faq{margin:100px 0}
${S} .pg-faq-row{display:flex;align-items:flex-start;gap:80px}
${S} .pg-faq-box{flex:0 0 28%;padding:20px;background:radial-gradient(at bottom right,var(--sb-accent) 0%,var(--pg-panel) 40%);text-align:center}
${S} .pg-faq-box img{width:64px;height:64px;margin:0 auto 12px;object-fit:contain}
${S} .pg-faq-box h2{font-size:22px;letter-spacing:-.2px}
${S} .pg-faq-list{display:flex;flex:1;flex-direction:column;gap:32px;min-width:0;padding:12px 0}
${S} .pg-q{display:flex;gap:18px}
${S} .pg-q>i,${S} .pg-q summary>i{display:flex;flex:none;margin-top:1px;color:var(--pg-cyan)}
${S} .pg-q svg{width:20px;height:20px}
${S} .pg-q h4{margin-bottom:8px}
${S} details.pg-q{display:block}
${S} details.pg-q summary{display:flex;gap:18px;cursor:pointer;list-style:none}
${S} details.pg-q summary::-webkit-details-marker{display:none}
${S} details.pg-q summary h4{margin:0}
${S} details.pg-q p{margin-top:8px;padding-left:38px}

/* legais */
${S} .pg-prose{margin:100px 0}
${S} .pg-prose-in{max-width:1152px;margin:0 auto}
${S} .pg-prose h3{margin:32px 0 12px}
${S} .pg-prose p{margin-bottom:16px}
${S} .pg-prose ul{margin:0 0 16px;padding-left:22px;list-style:disc}
${S} .pg-prose li{margin-bottom:6px}
${S} .pg-prose a{color:#fff;text-decoration:underline}
${S} .pg-prose a:hover{color:var(--pg-cyan)}

/* rodapé */
${S} .pg-foot{padding-bottom:60px}
${S} .pg-foot-in{max-width:1240px;margin:0 auto}
${S} .pg-dash{border:0;border-top:1px dashed var(--pg-line)}
${S} .pg-foot-row{display:flex;align-items:center;justify-content:space-between;gap:60px;padding-top:40px}
${S} .pg-foot-links{display:flex;gap:20px}
${S} .pg-foot-links a,${S} .pg-copy{display:flex;align-items:center;gap:6px;font-size:14px}
${S} .pg-foot-links svg{width:10px;height:10px}
${S} .pg-copy svg{width:12px;height:12px}

/* 404 */
${S} .pg-404{display:flex;align-items:center;justify-content:center;min-height:88vh;padding:180px 0 120px;background:var(--sb-bg);text-align:center}
${S} .pg-404-in{width:100%;max-width:640px}
${S} .pg-404-in img{width:80px;height:80px;margin:0 auto 16px;object-fit:contain}
${S} .pg-404-in p{margin:16px 0 40px}

/* carrossel (o fx-runtime liga autoplay, bolinhas e arrastar; sem JS/no editor é uma faixa rolável) */
${S} .si-car{--si-pv:var(--si-d);position:relative}
${S} .si-car-view{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
${S} .si-car-view::-webkit-scrollbar{display:none}
${S} .si-car-track{display:flex;gap:var(--si-gap,0)}
${S} .si-slide{flex:0 0 calc((100% - (var(--si-pv) - 1)*var(--si-gap,0px))/var(--si-pv));min-width:0;scroll-snap-align:start}
${S}.sb-js .si-car-view{overflow:hidden}
${S} .si-car-arrow,${S} .si-car-dots{display:none}
${S}.sb-js .si-car:not(.is-static) .si-car-dots{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-top:20px}
${S} .si-car-dots button{padding:0;border:0;border-radius:50%;cursor:pointer}

@media (max-width:1024px){${tablet(S)}${S} .si-car{--si-pv:var(--si-t)}}
@media (max-width:767px){${mobile(S)}${S} .si-car{--si-pv:var(--si-m)}}
@media (max-width:1320px) and (min-width:1025px){${S} .pg-wrap,${S} .pg-split-row,${S} .pg-hl-row,${S} .pg-values-box,${S} .pg-sec-row,${S} .pg-head-in{padding-inline:20px}}
@media (prefers-reduced-motion:reduce){${S} .pg-btn,${S} .pg-ben-card,${S} .pg-sol-card,${S} .pg-sol-img i,${S} .pg-pcard-img i,${S} .pg-seal img{transition:none}}
${tablet(`${S}.sb-narrow`)}
${S}.sb-narrow .si-car{--si-pv:var(--si-t)}
${mobile(`${S}.sb-narrow`)}
${S}.sb-narrow .si-car{--si-pv:var(--si-m)}
`;
