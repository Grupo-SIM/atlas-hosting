/**
 * CSS dos blocos comuns de página de vendas de e-book (`blocks/ebook.tsx`): `.eb-*`, sem escopo de variante (cores,
 * fonte e alturas chegam por variáveis `--eb-*` no próprio bloco). Entra em `siteCss`. Medidas do cartão de oferta e
 * do acordeão do Elementor da página "Habilidades de Comunicação" (lp.centraldomarketing.com); breakpoints do
 * original: laptop ≤ 1366, tablet ≤ 1024, celular ≤ 767 (no preview estreito do editor, `.sb-narrow` repete as regras
 * de tablet e celular).
 */

/**
 * Opções extras dos blocos (todas opcionais, ver `blocks/ebook.tsx`): cartão de oferta claro (`.eb-light`), botão em
 * pílula, lista com check e selo de desconto; FAQ em cartões e em 2 colunas; rodapé com divisória e imagem de fundo.
 * Medidas do "VSL Milionário" (Elementor, kit 10): cartão 35% (tablet 50%, celular 100% com 10px de margem).
 */
const extras = `
.sb .eb-light .eb-card{width:min(35%,441px);min-width:min(100%,340px);padding:3em;gap:20px;border:1px solid var(--eb-border,#FFFFFF2B);border-radius:10px;background:var(--eb-card,#fff);box-shadow:none}
.sb .eb-light .eb-title{margin:0;font-family:var(--eb-title-font,inherit);font-size:36px;font-weight:600;line-height:1.2;letter-spacing:0}
.sb .eb-light .eb-cash{margin:0;font-size:21px;font-weight:400;line-height:1.5;color:var(--eb-text,#252831)}
.sb .eb-light .eb-from{margin:0;font-size:21px;font-weight:400;line-height:1.5;color:var(--eb-accent,#DE41FF)}
.sb .eb-from del{text-decoration:line-through}
.sb .eb-light .eb-price{margin:0;font-family:var(--eb-title-font,inherit);font-size:72px;font-weight:600;line-height:1;letter-spacing:-2px;color:var(--eb-accent,#DE41FF)}
.sb .eb-discount{margin:0;font-size:13px;font-weight:500;line-height:1;letter-spacing:1px;text-transform:uppercase;color:var(--eb-accent,#DE41FF)}
.sb .eb-list{width:100%;margin:23px 0 0;padding:0;list-style:none}
.sb .eb-list li{display:flex;align-items:center;justify-content:center;gap:5px;padding:0 0 6px;border-bottom:1px solid var(--eb-divider,#F8F8F8);color:var(--eb-text,#fff);font-size:16px;line-height:24px}
.sb .eb-list li+li{margin-top:7px}
.sb .eb-list li:last-child{padding-bottom:0;border-bottom:0}
.sb .eb-check{flex:none;width:18px;height:18px;fill:none;stroke:var(--eb-accent,#DE41FF);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sb .eb-buy.eb-pill{display:block;box-sizing:border-box;width:100%;margin-top:23px;padding:20px 40px;border-radius:30px;background:linear-gradient(135deg,var(--eb-btn-a,#DE41FF) 0%,var(--eb-btn-b,#023131) 100%);box-shadow:none;font-size:18px;font-weight:500;line-height:18px;text-shadow:none;transition:background .3s}
.sb .eb-buy.eb-pill:hover,.sb .eb-buy.eb-pill:focus{background:var(--eb-btn-b,#023131)}

.sb .eb-airy .eb-card{width:min(35%,444px);gap:0;padding-bottom:25px}
.sb .eb-airy .eb-cash{margin:29px 0 0}
.sb .eb-airy .eb-from{margin:20px 0 0;font-size:32px;font-weight:300;line-height:70px}
.sb .eb-airy .eb-price{margin:19px 0 0}
.sb .eb-airy .eb-buy{margin-top:34px}
.sb .eb-airy .eb-stamps{margin-top:30px}
.sb .eb-offer.has-sec{padding-bottom:var(--eb-pb,0)}
.sb .eb-offer.has-sec .eb-card{position:relative;z-index:3;margin-top:calc(var(--eb-pull,0px)*-1)}
.sb .eb-faq-head{display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:720px;margin:20px 0 10px;padding:2em;text-align:center}
.sb .eb-faq-eyebrow{font-family:var(--eb-title-font,inherit);font-size:18px;font-weight:500;line-height:1.5;letter-spacing:2px;text-transform:uppercase;color:var(--eb-accent,#DE41FF)}
.sb .eb-faq:not(.eb-cards) .eb-faq-h{font-family:var(--eb-title-font,inherit)}
.sb .eb-faq.eb-cards{padding-block:3em 5em}
.sb .eb-cards .eb-faq-h{font-family:var(--eb-title-font,inherit);font-size:48px;font-weight:600;line-height:1.1;letter-spacing:-2px;text-transform:none;color:var(--eb-text,#FCFCFC)}
.sb .eb-cards .eb-faq-list{width:100%;max-width:1280px;margin-top:0;border-top:0}
.sb .eb-faq-list.eb-cols{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;padding:1em}
.sb .eb-faq-col{min-width:0}
.sb .eb-cards .eb-faq-item{margin:0 0 10px;border:1px solid var(--eb-line,#FFFFFF2B);border-radius:10px;background:linear-gradient(180deg,#FFFFFF2B 0%,transparent 100%)}
.sb .eb-cards .eb-faq-item summary{justify-content:space-between;gap:16px;padding:28px;color:var(--eb-text,#fff);font-family:var(--eb-title-font,inherit);font-size:18px;font-weight:500;line-height:1.4}
.sb .eb-cards .eb-faq-item[open] summary,.sb .eb-cards .eb-faq-item[open]{color:var(--eb-text,#fff)}
.sb .eb-cards .eb-faq-item summary span{flex:1}
.sb .eb-cards.eb-icon-right .eb-faq-chev{order:2}
.sb .eb-faq-chev{flex:none;width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;transition:transform .3s}
.sb .eb-cards:not(.eb-icon-right) .eb-faq-chev{order:0}
.sb .eb-faq-item[open] .eb-faq-chev{transform:rotate(180deg)}
.sb .eb-cards .eb-faq-a{padding:28px;border-top:1px solid var(--eb-line,#FFFFFF2B);color:var(--eb-text,#fff);font-size:16px;line-height:1.5}

.sb .eb-foot.has-img{background-image:var(--eb-bg-img);background-position:top;background-size:cover}
.sb .eb-foot.has-veil{position:relative;isolation:isolate}
.sb .eb-foot.has-veil::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(at center,transparent 0%,var(--eb-veil,#000) 100%);opacity:var(--eb-veil-o,.5);pointer-events:none}
.sb .eb-foot.roomy{padding:3em 0 2em}
.sb .eb-foot-div{width:100%;height:0;margin:0 0 3px;padding:3px 0;border:0;border-top:1px solid var(--eb-div,#FFFFFF2B)}
.sb .eb-foot.roomy .eb-foot-div{margin:20px 0}
.sb .eb-foot.roomy .eb-foot-in{padding:0}
.sb .eb-foot.roomy .eb-foot-in p{margin:0 0 20px;line-height:1}
`;

const extrasTablet = (x: string) => `
${x}.eb-light .eb-card{width:50%;padding:2em 1em}
${x}.eb-light .eb-cash{font-size:15px}
${x}.eb-light .eb-price{font-size:48px}
${x}.eb-cards .eb-faq-h{font-size:36px}
${x}.eb-faq.eb-cards{padding-block:0 3em}
${x}.eb-offer.has-sec{padding-bottom:var(--eb-pb-t,var(--eb-pb,0))}
${x}.eb-cards .eb-faq-item summary{font-size:16px}
${x}.eb-faq-list.eb-cols{grid-template-columns:1fr}
${x}.eb-cards .eb-faq-list{width:100%}
${x}.eb-foot.roomy{padding:1em 0 2em}
`;

const extrasMobile = (x: string) => `
${x}.eb-light .eb-card{width:calc(100% - 20px);min-height:0;margin:10px;padding:2em}
${x}.eb-light .eb-title{font-size:28px;margin:0}
${x}.eb-light .eb-cash{font-size:14px;margin:0}
${x}.eb-light .eb-from{font-size:21px;margin:0}
${x}.eb-light .eb-price{font-size:38px;margin:0}
${x}.eb-buy.eb-pill{margin-top:5px;font-size:17px}
${x}.eb-faq.eb-cards{padding-block:0 2em}
${x}.eb-offer.has-sec{padding-bottom:var(--eb-pb-m,var(--eb-pb,0))}
${x}.eb-cards .eb-faq-h{font-size:28px}
${x}.eb-cards .eb-faq-item summary{font-size:14px;padding:20px}
${x}.eb-cards .eb-faq-a{padding:20px}
${x}.eb-cards .eb-faq-list{width:100%}
${x}.eb-foot.roomy{padding:0 0 1em}
`;

const laptop = `
.sb .eb-card{width:400px}
.sb .eb-title{font-size:37px;margin-top:21px}
.sb .eb-price{font-size:83px;margin-bottom:-45px}
.sb .eb-buy{margin-top:40px}
.sb .eb-foot-in p{margin:var(--eb-tm,15px) 0}
`;

const tablet = (x: string) => `
${x}.eb-card{width:350px}
${x}.eb-title{font-size:2.4em}
${x}.eb-price{font-size:70px;margin-bottom:-30px}
${x}.eb-stamps{width:69%}
${x}.eb-faq{min-height:var(--eb-h-t,0px)}
${x}.eb-faq-list{width:75%}
`;

const mobile = (x: string) => `
${x}.eb-card{box-sizing:border-box;width:100%;min-height:471px;justify-content:center}
${x}.eb-title{font-size:1.9em;margin:5px 5px 0}
${x}.eb-cash{font-size:20px;margin-bottom:-15px}
${x}.eb-from{margin-top:10px;font-size:28px}
${x}.eb-price{font-size:58px;margin-bottom:5px}
${x}.eb-buy{margin-top:0;font-size:17px}
${x}.eb-faq{min-height:var(--eb-h-m,0px)}
${x}.eb-faq-h{font-size:27px}
${x}.eb-faq-list{width:90%}
${x}.eb-faq-item summary{line-height:1.5}
`;

export const ebookCss = `
.sb .eb-offer{display:flex;justify-content:center;width:100%}
.sb .eb-card{box-sizing:border-box;font-size:16px;line-height:1.5;display:flex;flex-direction:column;align-items:center;gap:20px;width:35%;min-width:min(100%,340px);padding:0 10px 30px;border:solid var(--eb-accent,#DE41FF);border-width:3px 0;border-radius:20px;background:var(--eb-card,rgba(0,0,0,.5));box-shadow:inset 0 0 19px -1px var(--eb-accent,#DE41FF);color:var(--eb-text,#fff);font-family:var(--eb-font,'Montserrat',sans-serif);text-align:center}
.sb .eb-card>*{margin-block:0}
.sb .eb-title{margin-top:30px;font-family:inherit;font-size:2.6em;font-weight:800;line-height:1;letter-spacing:-.9px;color:var(--eb-title-color,var(--eb-text,#fff))}
.sb .eb-cash{margin-bottom:15px;font-size:var(--eb-cash-fs,25px);font-weight:700;line-height:1.5;color:var(--eb-accent,#DE41FF)}
.sb .eb-cash-marker .eb-cash span{padding:0 .2em;background:var(--eb-accent,#DE41FF);color:#000;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.sb .eb-from{margin-top:-16px;font-size:34px;font-weight:700;line-height:36px;color:var(--eb-text,#fff)}
.sb .eb-price{margin-bottom:-26px;font-size:90px;font-weight:700;line-height:1;color:var(--eb-text,#fff)}
.sb .eb-buy{display:inline-block;margin-top:20px;padding:20px 50px;border-radius:3px;background:linear-gradient(180deg,var(--eb-btn-a,#DE41FF) 0%,var(--eb-btn-b,#023131) 100%);box-shadow:0 0 10px 0 var(--eb-btn-a,#DE41FF);color:#fff;font-size:19px;font-weight:700;line-height:1;text-shadow:0 0 10px rgba(0,0,0,.3)}
.sb .eb-stamps{width:55%;max-width:100%;filter:brightness(200%) contrast(18%) saturate(134%) hue-rotate(103deg)}

.sb .eb-faq{box-sizing:border-box;font-size:16px;line-height:1.5;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:var(--eb-h,0px);padding:var(--eb-pt,70px) 16px var(--eb-pbm,70px);background:var(--eb-bg,#0B0B0B);font-family:var(--eb-font,'Roboto',sans-serif)}
.sb .eb-faq-h{margin:0;font-family:inherit;font-size:var(--eb-h-fs,32px);font-weight:700;line-height:32px;text-align:center;text-transform:uppercase;color:var(--eb-accent,#DE41FF)}
.sb .eb-faq-list{width:75%;max-width:960px;margin-top:50px;border-top:1px solid var(--eb-line,#D5D8DC)}
.sb .eb-faq-item{border:1px solid var(--eb-line,#D5D8DC);border-top:0}
.sb .eb-faq-item summary{display:flex;align-items:center;gap:0;padding:15px 20px;cursor:pointer;list-style:none;color:var(--eb-text,#FCFCFC);font-size:16px;font-weight:700;line-height:16px}
.sb .eb-faq-item summary::-webkit-details-marker{display:none}
.sb .eb-faq-item[open] summary{color:var(--eb-accent,#DE41FF)}
.sb .eb-faq-ic{flex:none;width:24px;height:16px;padding-right:8px;box-sizing:border-box;fill:none;stroke:var(--eb-accent,#DE41FF);stroke-width:3;stroke-linecap:butt}
.sb .eb-faq-item[open] .eb-faq-ic .v{display:none}
.sb .eb-faq-a{padding:15px 20px 30px;border-top:1px solid var(--eb-line,#D5D8DC);color:var(--eb-answer,#B8BDC2);font-size:16px;line-height:24px}

.sb .eb-foot{padding:10px;background:var(--eb-bg,#181717);color:var(--eb-text,#fff);font-family:var(--eb-ff,inherit)}
.sb .eb-foot-in{max-width:1200px;margin:0 auto;padding:10px;text-align:center}
.sb .eb-foot-in p{margin:var(--eb-tm,20px) 0;font-size:var(--eb-fs,15px);line-height:15px}
${extras}
@media (min-width:1025px) and (max-width:1366px){${laptop}}
@media (max-width:1366px){.sb .eb-faq{min-height:var(--eb-h-t,0px);padding-block:21px}}
@media (max-width:1024px){${tablet(".sb ")}${extrasTablet(".sb ")}}
@media (max-width:767px){${mobile(".sb ")}${extrasMobile(".sb ")}}
${tablet(".sb.sb-narrow ")}${extrasTablet(".sb.sb-narrow ")}${mobile(".sb.sb-narrow ")}${extrasMobile(".sb.sb-narrow ")}
`;
