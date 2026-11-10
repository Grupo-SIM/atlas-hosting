/**
 * CSS dos blocos comuns de página de vendas de e-book (`blocks/ebook.tsx`): `.eb-*`, sem escopo de variante (cores,
 * fonte e alturas chegam por variáveis `--eb-*` no próprio bloco). Entra em `siteCss`. Medidas do cartão de oferta e
 * do acordeão do Elementor da página "Habilidades de Comunicação" (lp.centraldomarketing.com); breakpoints do
 * original: laptop ≤ 1366, tablet ≤ 1024, celular ≤ 767 (no preview estreito do editor, `.sb-narrow` repete as regras
 * de tablet e celular).
 */

const laptop = `
.sb .eb-card{width:400px}
.sb .eb-title{font-size:37px;margin-top:21px}
.sb .eb-price{font-size:83px;margin-bottom:-45px}
.sb .eb-buy{margin-top:40px}
.sb .eb-foot-in p{margin:15px 0}
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
.sb .eb-title{margin-top:30px;font-family:inherit;font-size:2.6em;font-weight:800;line-height:1;letter-spacing:-.9px;color:var(--eb-text,#fff)}
.sb .eb-cash{margin-bottom:15px;font-size:25px;font-weight:700;line-height:1.5;color:var(--eb-accent,#DE41FF)}
.sb .eb-cash-marker .eb-cash span{padding:0 .2em;background:var(--eb-accent,#DE41FF);color:#000;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.sb .eb-from{margin-top:-16px;font-size:34px;font-weight:700;line-height:36px;color:var(--eb-text,#fff)}
.sb .eb-price{margin-bottom:-26px;font-size:90px;font-weight:700;line-height:1;color:var(--eb-text,#fff)}
.sb .eb-buy{display:inline-block;margin-top:20px;padding:20px 50px;border-radius:3px;background:linear-gradient(180deg,var(--eb-btn-a,#DE41FF) 0%,var(--eb-btn-b,#023131) 100%);box-shadow:0 0 10px 0 var(--eb-btn-a,#DE41FF);color:#fff;font-size:19px;font-weight:700;line-height:1;text-shadow:0 0 10px rgba(0,0,0,.3)}
.sb .eb-stamps{width:55%;max-width:100%;filter:brightness(200%) contrast(18%) saturate(134%) hue-rotate(103deg)}

.sb .eb-faq{box-sizing:border-box;font-size:16px;line-height:1.5;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:var(--eb-h,0px);padding:70px 16px;background:var(--eb-bg,#0B0B0B);font-family:var(--eb-font,'Roboto',sans-serif)}
.sb .eb-faq-h{margin:0;font-family:inherit;font-size:32px;font-weight:700;line-height:32px;text-align:center;text-transform:uppercase;color:var(--eb-accent,#DE41FF)}
.sb .eb-faq-list{width:75%;max-width:960px;margin-top:50px;border-top:1px solid var(--eb-line,#D5D8DC)}
.sb .eb-faq-item{border:1px solid var(--eb-line,#D5D8DC);border-top:0}
.sb .eb-faq-item summary{display:flex;align-items:center;gap:0;padding:15px 20px;cursor:pointer;list-style:none;color:var(--eb-text,#FCFCFC);font-size:16px;font-weight:700;line-height:16px}
.sb .eb-faq-item summary::-webkit-details-marker{display:none}
.sb .eb-faq-item[open] summary{color:var(--eb-accent,#DE41FF)}
.sb .eb-faq-ic{flex:none;width:24px;height:16px;padding-right:8px;box-sizing:border-box;fill:none;stroke:var(--eb-accent,#DE41FF);stroke-width:3;stroke-linecap:butt}
.sb .eb-faq-item[open] .eb-faq-ic .v{display:none}
.sb .eb-faq-a{padding:15px 20px 30px;border-top:1px solid var(--eb-line,#D5D8DC);color:var(--eb-answer,#B8BDC2);font-size:16px;line-height:24px}

.sb .eb-foot{padding:10px;background:var(--eb-bg,#181717);color:var(--eb-text,#fff)}
.sb .eb-foot-in{max-width:1200px;margin:0 auto;padding:10px;text-align:center}
.sb .eb-foot-in p{margin:20px 0;font-size:15px;line-height:15px}

@media (min-width:1025px) and (max-width:1366px){${laptop}}
@media (max-width:1366px){.sb .eb-faq{min-height:var(--eb-h-t,0px)}}
@media (max-width:1024px){${tablet(".sb ")}}
@media (max-width:767px){${mobile(".sb ")}}
${tablet(".sb.sb-narrow ")}${mobile(".sb.sb-narrow ")}
`;
