/**
 * Variante `viralpack` (escopo `.sb-vp`): página de vendas "Viral Pack" (viralpack.centraldomarketing.com — WordPress +
 * Hello Elementor 4.4 + ElementsKit + Jeg Kit, página 569, kit 8). Breakpoints do original: tablet ≤ 1024, celular ≤ 767,
 * repetidos sob `.sb-narrow`. Container 1300px.
 *
 * Tokens do tema: `accent` (amarelo-ouro `#ECB53A`, botões), `bg` (`#111111`), `fg` (`#D8D8D8`), `orange` (`#FFA33E`,
 * traço do hero e FAQ), `gray` (`#3A3A3A`, texto do botão e fundo do "Monetizar"). Fontes: Hind (títulos, botões) e Roboto
 * (corpo) — `VIRALPACK_EXTRA_FONTS`. Oferta, FAQ e rodapé são os blocos comuns `ebook*`.
 *
 * O CSS do mosaico (`.mh-*`, bloco genérico `mosaicHero`) vai junto do CSS da variante.
 */
export const isViralpack = (theme: Record<string, string>) =>
  theme.variant === "viralpack";

/** Fontes fixas da variante (nunca texto do usuário). */
export const VIRALPACK_EXTRA_FONTS = ["Hind", "Roboto"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function viralpackVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--vp-gray": safe(theme.gray, "#3A3A3A"),
    "--vp-orange": safe(theme.orange, "#FFA33E"),
  };
}

const S = ".sb-vp";

const tablet = (x: string) => `
${x} .vp-h1{font-size:2.8rem}
${x} .vp-h2{font-size:2rem}
${x} .vp-btn{font-size:.9rem}
${x} .sb-heading h2{font-size:2rem}
${x} .vp-hl-grid{padding:0 10px}
${x} .vp-hl-item{padding:20px}
${x} .vp-ben-card{padding:200px 20px 40px}
${x} .vp-ben-row{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .vp-show-img{margin-left:-30px;width:75%}
${x} .mh-col:nth-child(4){display:none}
${x} .mh-bg{grid-template-columns:repeat(3,minmax(0,1fr))}
${x} .mh-in{padding:100px 30px 135px}
${x} .mh-p{width:70%}
${x} .vp-split{padding:40px 20px 60px}
`;

const mobile = (x: string) => `
${x} .vp-h1{font-size:2.5rem}
${x} .vp-hl-grid{grid-template-columns:1fr;gap:20px}
${x} .vp-ben-grid{gap:30px}
${x} .vp-ben-row{grid-template-columns:1fr;gap:30px}
${x} .vp-split-in{grid-template-columns:1fr;gap:30px}
${x} .vp-split-img{width:100%}
${x} .vp-split-copy{text-align:center}
${x} .vp-split-p{padding-right:0;font-size:17px}
${x} .vp-show-img{margin-left:0;width:100%}
${x} .mh-in{padding:150px 20px;text-align:center;align-items:center}
${x} .mh-p{width:100%}
${x} .mh-bg{grid-template-columns:repeat(2,minmax(0,1fr))}
${x} .mh-col:nth-child(3){display:none}
`;

export const viralpackCss = `
html:has(${S}){scroll-behavior:smooth}
${S}{font-family:'Roboto',sans-serif;font-size:1rem;font-weight:400;line-height:1.5;color:var(--sb-fg)}
${S} main{padding-top:0!important}
${S} h1,${S} h2,${S} h3,${S} p,${S} figure{margin:0}
${S} .vp-h1,${S} .vp-h2,${S} .vp-h3{color:#fff;font-family:'Hind',sans-serif;font-weight:600}
${S} .vp-h1{font-size:3.6rem;line-height:1}
${S} .vp-h2{font-size:2.6rem;line-height:1}
${S} .vp-h3{font-size:1.3rem;line-height:1.2}
${S} .sb-heading{padding-top:50px}
${S} .sb-heading h2{color:#fff;font-family:'Hind',sans-serif;font-size:2.6rem;font-weight:600;line-height:1;text-transform:none}
${S} .vp-btn{display:inline-block;box-sizing:border-box;padding:18px 25px 15px;border-radius:5px;background:var(--sb-accent,#ECB53A);color:var(--vp-gray,#3A3A3A);font-family:'Hind',sans-serif;font-size:1.2rem;font-weight:500;line-height:1.5;text-decoration:none;transition:background .3s,color .3s}
${S} .vp-btn:hover,${S} .vp-btn:focus{background:#fff;color:var(--vp-gray,#3A3A3A)}
${S} .vp-btn.sm{padding:10px 20px}

/* hero com mosaico (mosaicHero) */
${S} .mh{position:relative;overflow:hidden;background:#111}
${S} .mh-in{position:relative;z-index:2;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;gap:20px;max-width:1300px;margin:0 auto;padding:250px 20px 200px}
${S} .mh-h1{text-transform:uppercase}
${S} .mh-p{width:45%;color:var(--mh-text,#fff)}
${S} .mh-dash{width:150px;height:4px;margin-top:-5px;border:0;background:var(--vp-orange,#FFA33E)}
${S} .mh-logo{position:absolute;top:0;left:0;right:0;z-index:99;box-sizing:border-box;max-width:1300px;margin:0 auto;padding:20px}
${S} .mh-logo img{display:block;width:var(--mh-logo-w,110px);height:auto}
${S} .mh-bg{position:absolute;inset:0;z-index:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:start}
${S} .mh-col{display:flex;flex-direction:column;gap:10px;min-width:0}
${S} .mh-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
${S} .mh-row.l{grid-template-columns:1fr}
${S} .mh-tile{display:block;width:100%;height:auto;aspect-ratio:684/1024;object-fit:cover}
${S} .mh-tile.l{aspect-ratio:1024/746}
${S} .mh-veil{position:absolute;inset:0;z-index:1;background:var(--mh-veil,#000000B8);pointer-events:none}

/* destaques */
${S} .vp-hl{padding:20px 0 50px}
${S} .vp-hl-grid{box-sizing:border-box;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));max-width:1300px;margin:0 auto}
${S} .vp-hl-item{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:15px;padding:40px;text-align:center}
${S} .vp-hl-img{display:block;width:35%;max-width:70px;height:auto}
${S} .vp-hl-t{color:#fff;font-family:'Hind',sans-serif;font-size:1.2rem;font-weight:500;line-height:1.3}

/* copie, cole */
${S} .vp-split{padding:50px 20px 100px}
${S} .vp-split-in{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:20px;max-width:1300px;margin:0 auto}
${S} .vp-split-img{display:block;width:90%;height:auto;border-radius:5px}
${S} .vp-split-copy{display:flex;flex-direction:column;align-items:flex-start;gap:20px}
${S} .vp-split-p{padding-right:30%}
${S} .vp-split .vp-h2{text-transform:none}

/* monetizar */
${S} .vp-show{position:relative;overflow:hidden;padding:100px 20px 0;background:var(--vp-bgc,#3A3A3A) var(--vp-bgi,none) center bottom/cover no-repeat;text-align:center}
${S} .vp-show::before{content:"";position:absolute;inset:0;background:rgba(0,0,0,.45);pointer-events:none}
${S} .vp-show-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:20px;max-width:1300px;margin:0 auto}
${S} .vp-show-img{display:block;max-width:100%;height:auto;margin-left:-50px}
${S} .vp-show u{text-decoration:underline}

/* benefícios */
${S} .vp-ben{padding:100px 20px 50px}
${S} .vp-ben-head{display:flex;flex-direction:column;align-items:center;gap:15px;text-align:center}
${S} .vp-ben-grid{display:flex;flex-direction:column;gap:18px;max-width:1300px;margin:50px auto 0}
${S} .vp-ben-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
${S} .vp-ben-card{position:relative;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:10px;overflow:hidden;padding:300px 30px 50px;border-radius:5px;background:var(--vp-img) center/cover no-repeat;text-align:center}
${S} .vp-ben-card::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 34%,#111 100%);opacity:1;transition:opacity 1s;pointer-events:none}
${S} .vp-ben-card:hover::before,${S} .vp-ben-card:focus-within::before{opacity:.5}
${S} .vp-ben-card>*{position:relative}
${S} .vp-ben-t{font-family:'Hind',sans-serif;font-size:1.3rem;font-weight:600;line-height:1.2;text-transform:capitalize;color:#fff}
${S} .vp-ben-s{font-family:'Hind',sans-serif;font-size:1.2rem;font-weight:500;line-height:1.2;text-transform:capitalize;color:var(--sb-fg)}
${S} .vp-ben-card .vp-btn{margin-top:10px}
@media (prefers-reduced-motion:reduce){${S} .vp-ben-card::before{transition:none}}
@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
${tablet(`${S}.sb-narrow`)}${mobile(`${S}.sb-narrow`)}
`;
