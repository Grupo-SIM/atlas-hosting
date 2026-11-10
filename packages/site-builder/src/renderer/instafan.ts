/**
 * Variante `instafan` (escopo `.sb-if`): página de vendas "InstaFanFortune" (lp.centraldomarketing.com/instafanfortune/ —
 * WordPress + Hello Elementor, modelo Canvas, post 47264). Medidas conferidas no site renderizado (Chromium,
 * 1440/1024/767/390): contêineres do Elementor com `padding: 10px` e `gap: 20px`, Montserrat. Breakpoints 1024/767
 * repetidos sob `.sb-narrow` (no preview estreito do editor o tablet e o celular valem os dois).
 *
 * Tokens do tema: `accent` (azul `#377AF7`: botões, destaques, contornos), `bg` (`#020717`), `dark` (`#1C244D`, botão
 * "ADQUIRIR AGORA" do hero) e `panel` (`#010921`, cartões dos 4 passos).
 *
 * As camadas decorativas (brilhos roxos/azuis e a grade de quadrados) pertencem ao hero e transbordam por trás das
 * seções seguintes, como no original (`.if-decor`, posições em % da largura por breakpoint).
 */
export const isInstafan = (theme: Record<string, string>) =>
  theme.variant === "instafan";

/** Fontes fixas da variante (nunca texto do usuário). */
export const INSTAFAN_EXTRA_FONTS = ["Montserrat"];

const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function instafanVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--if-dark": safe(theme.dark, "#1C244D"),
    "--if-panel": safe(theme.panel, "#010921"),
  };
}

const S = ".sb-if";

/** Tablet (≤ 1024px). `x` = seletor da raiz (`.sb-if` ou `.sb-if.sb-narrow`). */
const tablet = (x: string) => `
${x} .if-head{min-height:101px;padding-right:92px}
${x} .if-logo{width:56px;height:41px}
${x} .if-brand{font-size:19px;line-height:19px;margin-left:0}
${x} .if-hero{min-height:714px}
${x} .if-hero-copy{top:133px;left:4.4%;width:77%}
${x} .if-t{font-size:55px;line-height:60px}
${x} .if-hero-img img{width:100%}
${x} .if-d1{--l:30.7%;--w:23.4%;--t:682px}
${x} .if-d2{--l:28.7%;--w:41.2%;--t:1177px}
${x} .if-d3{--l:18.4%;--w:44.3%;--t:3069px}
${x} .if-d4{--l:-43.9%;--t:1593px}
${x} .if-d5{--l:-43.9%;--t:3500px}
${x} .if-d6{--l:-36.5%;--t:204px}
${x} .if-d7{--l:-36.5%;--t:204px}
${x} .if-d8{--l:-36.5%;--w:55%;--t:204px}
${x} .if-ben-title{font-size:32px;line-height:32px}
${x} .if-tab-t{font-size:22px;line-height:22px}
${x} .if-tab:nth-child(n){flex:1 1 auto}
${x} .if-box{width:min(535px,100%)}
${x} .if-box-t{font-size:52px;line-height:52px}
${x} .if-item{--r:20px!important;flex-direction:column;justify-content:center}
${x} .if-item-txt{width:100%!important;margin-left:0!important;align-items:center;text-align:center}
${x} .if-item-t{margin-top:0;font-size:30px}
${x} .if-about-row{margin-left:0;justify-content:center}
${x} .if-about-txt{margin:20px 30px}
${x} .if-pill-t{font-size:20px}
${x} .if-steps{gap:20px}
${x} .if-step-n{font-size:38px;line-height:38px}
${x} .if-step-l{font-size:16px;line-height:16px}
${x} .if-feat-title{font-size:40px;line-height:40px}
${x} .if-fc{position:relative!important;left:auto!important;top:auto!important;width:min(300px,100%)!important}
${x} .if-fcs{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:30px;height:auto!important}
${x} .if-arrow{display:none}
${x} .if-risk-t{font-size:50px;line-height:50px}
${x} .if-card{width:350px}
${x} .if-card-t{font-size:30px;line-height:30px}
${x} .if-cash{font-size:22px;line-height:33px}
${x} .if-price{font-size:70px;line-height:70px}
${x} .if-faq-in{margin-inline:0}
`;

/** Celular (≤ 767px). */
const mobile = (x: string) => `
${x} .if-head{flex-direction:column;gap:10px;min-height:140px;padding-right:10px}
${x} .if-hero{min-height:0;justify-content:flex-start;align-items:center;gap:4px;padding:24px 10px 30px;text-align:center}
${x} .if-hero-copy{display:contents}
${x} .if-t{position:relative;z-index:1;font-size:29px;line-height:35px}
${x} .if-sub{position:relative;z-index:1;margin:16px 0;padding:0 20px;font-size:16px;line-height:30px}
${x} .if-spacer{display:none}
${x} .if-hero-img{order:3;max-width:370px;padding:10px 0}
${x} .if-hero-img img{width:100%}
${x} .if-btns{order:4;position:relative;z-index:1;flex-direction:column;gap:20px;margin-top:20px}
${x} .if-btn.a{width:242px;height:50px;font-size:22px;line-height:22px}
${x} .if-btn.b{font-size:15px}
${x} .if-d1{--l:30.5%;--w:61.5%;--t:395px}
${x} .if-d2{--l:-9%;--w:100%;--t:1177px}
${x} .if-d3{--l:2%;--w:100%;--t:2200px}
${x} .if-d4{--l:-17.7%;--t:1800px}
${x} .if-d5{--l:-3.8%;--t:3500px}
${x} .if-d6{--l:-45.9%;--t:19px}
${x} .if-d7{--l:-59.5%;--t:704px}
${x} .if-d8{--l:41.3%;--w:54.9%;--t:876px}
${x} .if-ben-title{font-size:29px;line-height:29px;padding:0 10px}
${x} .if-tabs{flex-direction:column;gap:20px;min-height:0;margin-top:60px;padding:0 0 10px;background-size:100% auto;background-position:50% 100%}
${x} .if-tab{width:100%;padding:0}
${x} .if-tab-t{font-size:22px}
${x} .if-box-row{margin:100px 0 0}
${x} .if-box{width:100%;min-height:0;padding:27px}
${x} .if-box-t{font-size:23px;line-height:23px;text-align:center}
${x} .if-item-t{font-size:21px;line-height:30px}
${x} .if-item-s{font-size:16px;line-height:19.2px}
${x} .if-item-img{width:95px!important;height:auto;margin:0}
${x} .if-about{margin-top:0}
${x} .if-about-box{width:100%;height:auto;padding:27px}
${x} .if-about-t{font-size:35px;line-height:35px}
${x} .if-about-txt{margin:20px 10px;font-size:20px;line-height:28px;text-align:center}
${x} .if-pil-in{width:100%;min-height:585px}
${x} .if-t1{font-size:37px;line-height:37px}
${x} .if-t2{font-size:24px;line-height:24px;margin:30px}
${x} .if-t3{font-size:16px;line-height:16px;margin-bottom:30px}
${x} .if-pill{flex-direction:column;width:100%;gap:0}
${x} .if-pill-col{width:100%!important}
${x} .if-pill-t{width:100%!important;font-size:20px;margin:10px 0}
${x} .if-pill-p{font-size:17px;line-height:27.2px;text-align:center}
${x} .if-steps{flex-direction:column;align-items:center}
${x} .if-step{width:78%;min-height:135px}
${x} .if-step-n{font-size:29px;line-height:29px}
${x} .if-step-l{font-size:28px;line-height:28px}
${x} .if-feat-box{justify-content:center;width:100%;min-height:0;padding:20px}
${x} .if-feat-title{margin-bottom:0}
${x} .if-feat-title{font-size:30px;line-height:30px;text-align:center}
${x} .if-fcs{flex-direction:column;align-items:center;gap:0}
${x} .if-fc-wrap{display:flex;flex-direction:column;align-items:center;gap:20px;width:100%}
${x} .if-arrow{display:block;width:219px;height:219px;margin:-20px 0;object-fit:contain;transform:rotate(45deg)}
${x} .if-fc{width:min(305px,100%)!important}
${x} .if-fc-row{flex-direction:column;align-items:center;gap:0;padding:20px 10px;text-align:center}
${x} .if-fc-txt{width:100%!important;text-align:center}
${x} .if-offer{padding-top:100px}
${x} .if-risk-t{font-size:40px;line-height:44px}
${x} .if-risk-p{font-size:17px;line-height:18.7px;padding:0 20px}
${x} .if-card{width:min(330px,100%);margin-top:50px}
${x} .if-card-t{font-size:32px;line-height:32px}
${x} .if-cash{font-size:21px;line-height:31.5px}
${x} .if-from{font-size:35px}
${x} .if-price{font-size:68px;line-height:68px}
${x} .if-buy{font-size:18px;line-height:18px}
${x} .if-faq-h{font-size:36px;line-height:36px}
${x} .if-faq-item summary{padding:12px 15px}
${x} .if-faq-a{padding:15px}
${x} .if-foot{min-height:140px}
`;

export const instafanCss = `
${S}{font-family:var(--sb-font-body);font-size:16px;line-height:1.5;color:#fff;background:var(--sb-bg);overflow-x:clip}
${S} main{padding-top:0!important}
${S} p,${S} h1,${S} h2,${S} h3{margin:0}
${S} img{max-width:100%}
${S} b,${S} strong{font-weight:700}
${S} .if-h{font-family:var(--sb-font-heading);font-weight:400;color:#fff}

/* cabeçalho */
${S} .if-head{position:relative;display:flex;align-items:center;justify-content:center;gap:20px;min-height:130px;padding:20px 112px 20px 10px;background:linear-gradient(178deg,#14263D 0%,#010124 100%)}
${S} .if-head::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,0) 0%,#000 100%);opacity:.5;pointer-events:none}
${S} .if-head>*{position:relative}
${S} .if-logo{display:block;width:90px;height:70px;object-fit:contain;object-position:left center}
${S} .if-brand{margin-left:17px;font-size:26px;line-height:26px;font-weight:400}

/* hero + camadas decorativas */
${S} .if-hero{position:relative;z-index:0;display:flex;flex-direction:column;justify-content:center;min-height:816px;padding:10px}
${S} .if-decor{position:absolute;z-index:0;left:var(--l);top:var(--t);width:var(--w,100%);height:900px;pointer-events:none}
${S} .if-d1{--l:35.56%;--w:70.55%;--t:609px;background:radial-gradient(#182749 0%,rgba(242,41,91,0) 68%)}
${S} .if-d2{--l:24.72%;--w:79.6%;--t:1000px;background:var(--if-grid,none) 50% 50%/contain no-repeat}
${S} .if-d3{--l:0%;--t:2995px;background:var(--if-grid,none) 50% 50%/contain no-repeat}
${S} .if-d4{--l:-31.25%;--t:1593px;background:var(--if-grid,none) 50% 50%/contain no-repeat;transform:rotate(180deg)}
${S} .if-d5{--l:-31.25%;--t:3500px;background:var(--if-grid,none) 50% 50%/contain no-repeat;transform:rotate(180deg)}
${S} .if-d6{--l:-50.56%;--t:364px;background:radial-gradient(#391B52 0%,rgba(242,41,91,0) 64%)}
${S} .if-d7{--l:-21.32%;--t:3152px;background:radial-gradient(#391B52 0%,rgba(242,41,91,0) 64%)}
${S} .if-d8{--l:53.54%;--w:55%;--t:1800px;background:radial-gradient(rgba(57,27,82,.64) 0%,rgba(242,41,91,0) 64%)}
${S} .if-hero-copy{position:absolute;z-index:1;top:133px;left:10.83%;width:64%;display:flex;flex-direction:column;gap:20px}
${S} .if-t{font-family:var(--sb-font-heading);font-size:80px;line-height:80px;font-weight:400;color:#fff}
${S} .if-sub{width:min(570px,100%);margin:20px 0;font-size:22px;line-height:30px;font-weight:300;color:#E4E4E4}
${S} .if-spacer{height:50px}
${S} .if-btns{display:flex;align-items:center;gap:20px;margin-top:7px}
${S} .if-btn-wrap{padding:10px}
${S} .if-btn{display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:15px 45px;border-radius:20px;color:#fff;font-family:var(--sb-font-body);font-size:15px;line-height:15px;text-align:center;text-transform:uppercase;transition:transform .3s}
${S} .if-btn:hover{transform:scale(1.05)}
${S} .if-btn.a{width:183px;height:60px;background:var(--sb-accent);font-weight:600}
${S} .if-btn.b{background:var(--if-dark);font-weight:800;box-shadow:0 0 10px rgba(255,255,255,.5)}
${S} .if-hero-img{position:relative;z-index:1;display:flex;justify-content:flex-end;width:100%;max-width:1280px;margin:0 auto;padding:10px 0}
${S} .if-hero-img img{display:block;width:50%;height:auto}

/* método atemporal */
${S} .if-ben{position:relative;padding:20px 10px 10px}
${S} .if-ben-title{max-width:1280px;margin:0 auto;font-size:43px;line-height:43px;text-align:center}
${S} .if-tabs{display:flex;width:100%;max-width:1280px;min-height:136px;margin:101px auto 0;padding:0 10px;box-sizing:border-box;gap:20px;background:var(--if-tabs,none) 50% 50%/cover no-repeat}
${S} .if-tab{display:flex;align-items:center;justify-content:center;padding:10px;box-sizing:border-box}
${S} .if-tab:nth-child(1){flex:0 0 378px}
${S} .if-tab:nth-child(2){flex:0 0 466px}
${S} .if-tab:nth-child(3){flex:0 0 317px}
${S} .if-tab-t{font-size:34px;line-height:34px;font-weight:600;color:#787A84;text-align:center}
${S} .if-box-row{display:flex;justify-content:flex-end;margin:139px 10px 0}
${S} .if-box{position:relative;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;width:616px;min-height:172px;padding:27px;border-radius:10px;background:var(--if-frame,none) 50% 0/contain no-repeat;box-shadow:0 0 10px rgba(255,255,255,.16)}
${S} .if-box::before,${S} .if-about-box::before,${S} .if-feat-box::before{content:"";position:absolute;inset:0;border-radius:inherit;background:rgba(11,18,35,.6);opacity:.32;pointer-events:none}
${S} .if-box>*,${S} .if-about-box>*,${S} .if-feat-box>*{position:relative}
${S} .if-box-t{max-width:535px;margin-bottom:14px;font-size:52px;line-height:52px}
${S} .if-items{display:flex;flex-direction:column;gap:20px;width:100%;max-width:1280px;margin:40px auto 0;padding:10px 10px 30px}
${S} .if-item{display:flex;align-items:center;justify-content:flex-end;gap:20px;min-height:140px;padding:10px var(--r,10px) 10px 0;box-sizing:border-box}
${S} .if-item-img{flex:none;display:block;width:var(--iw,95px);height:auto;margin:0 var(--im,30px)}
${S} .if-item-txt{display:flex;flex-direction:column;justify-content:flex-start;gap:20px;width:var(--tw,794px);margin-left:var(--ml,0)}
${S} .if-item-t{margin-top:20px;font-size:30px;line-height:30px;font-weight:600;color:#fff}
${S} .if-item-s{margin-bottom:20px;font-size:22px;line-height:30px;font-weight:400;color:#D1D1D1}
${S} .if-about-row{display:flex;margin-left:87px;padding:20px 0 10px}
${S} .if-about-box{position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:374px;height:183px;padding:27px;border-radius:10px;background:var(--if-frame,none) 50% 50%/contain no-repeat;box-shadow:0 0 10px rgba(255,255,255,.16)}
${S} .if-about-t{font-size:60px;line-height:60px}
${S} .if-about-txt{max-width:985px;margin:40px 0 20px 250px;font-size:22px;line-height:30px;font-weight:300;color:#D1D1D1}
${S} .if-about-txt p+p{margin-top:30px}

/* pilares + passos */
${S} .if-pil{position:relative;padding:10px}
${S} .if-pil-in{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;min-height:900px;padding:10px;box-sizing:border-box}
${S} .if-pil-in::before{content:"";position:absolute;inset:0;background:var(--if-tri,none) 50% 50%/contain no-repeat;opacity:.19;pointer-events:none}
${S} .if-pil-in>*{position:relative}
${S} .if-line{display:block;width:100%;height:auto}
${S} .if-t1{margin-top:30px;font-size:50px;line-height:50px;font-weight:400}
${S} .if-t2{margin:50px 30px 30px;font-size:50px;line-height:50px;font-weight:900}
${S} .if-t3{margin-bottom:80px;font-size:22px;line-height:22px;font-weight:300;text-align:center}
${S} .if-pill{display:flex;align-items:center;justify-content:center;gap:20px;box-sizing:border-box;width:min(1050px,100%);padding:10px;border:1px solid #fff;border-radius:30px;background:rgba(19,46,91,.55)}
${S} .if-pill-col{display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;padding:10px}
${S} .if-pill-col.t{width:223px}
${S} .if-pill-col.p{width:681px}
${S} .if-pill-col.i{width:103px;align-items:center}
${S} .if-pill-t{margin:20px 0;font-size:26px;line-height:30px;font-weight:600;text-align:center}
${S} .if-pill-p{margin:20px 0;font-size:20px;line-height:30px;font-weight:600}
${S} .if-pill-i{width:30px;height:36px;fill:#fff}
${S} .if-steps{display:flex;gap:20px;width:100%;max-width:1280px;margin:20px auto 0;padding:10px 0;box-sizing:border-box}
${S} .if-step{flex:1 1 0;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;min-height:160px;padding:10px;border:1px solid #333;border-radius:30px;background:var(--if-panel);text-align:center}
${S} .if-step-n{margin:0;font-size:51px;line-height:51px;font-weight:600}
${S} .if-step-l{margin-top:20px;font-size:30px;line-height:30px;font-weight:400}

/* rumo ao sucesso */
${S} .if-feat{position:relative;min-height:900px;padding:10px;box-sizing:border-box}
${S} .if-feat-row{display:flex;justify-content:flex-end;width:100%;max-width:1400px;margin:0 auto;padding:10px 0}
${S} .if-feat-box{position:relative;display:flex;align-items:center;box-sizing:border-box;width:490px;min-height:152px;padding:27px 27px 27px 40px;border-radius:10px;background:var(--if-frame,none) 50% 50%/contain no-repeat;box-shadow:0 0 10px rgba(255,255,255,.16)}
${S} .if-feat-title{margin-bottom:14px;font-size:45px;line-height:45px}
${S} .if-fcs{position:relative;width:auto;height:430px;margin:20px -10px 0}
${S} .if-fc-wrap{display:contents}
${S} .if-arrow{display:none}
${S} .if-fc{position:absolute;box-sizing:border-box;width:var(--w);left:var(--x);top:var(--y);padding:10px;border-radius:30px;background:linear-gradient(#07112B 0%,#14263C 100%)}
${S} .if-fc.a{--w:284px;--x:0px;--y:0px;padding:15px 10px 0}
${S} .if-fc.b{--w:284px;--x:31.9%;--y:163px}
${S} .if-fc.c{--w:332px;--x:64.7%;--y:358px}
${S} .if-fc-row{display:flex;align-items:flex-start;gap:20px;padding:10px;margin-bottom:20px}
${S} .if-fc-row:last-child{margin-bottom:0}
${S} .if-fc-ic{flex:none;width:30px;height:30px;margin-top:2px;fill:none;stroke:var(--sb-accent);stroke-width:84;stroke-linecap:round;stroke-linejoin:round}
${S} .if-fc-txt{flex:1;min-width:0;min-height:55px;font-size:17px;line-height:20.4px;font-weight:400;color:#D0D0D0}

/* risco zero + oferta */
${S} .if-offer{position:relative;padding:40px 10px 10px}
${S} .if-risk{max-width:744px;margin:0 auto;text-align:center}
${S} .if-risk-t{margin-bottom:9px;font-size:65px;line-height:97.5px;font-weight:700}
${S} .if-risk-p{font-size:22px;line-height:33px;font-weight:500}
${S} .if-card{display:flex;flex-direction:column;align-items:center;gap:20px;box-sizing:border-box;width:422px;margin:73px auto 0;padding:31px 0 37px;border:3px solid var(--sb-accent);border-radius:20px;box-shadow:inset 0 0 19px -1px var(--sb-accent),0 0 22px rgba(55,122,247,.35);text-align:center}
${S} .if-card-t{font-size:38.4px;line-height:38.4px;font-weight:800;letter-spacing:-.9px}
${S} .if-cash{margin:6px 0 0;padding:0 20px;font-size:26px;line-height:39px;font-weight:700;color:var(--sb-accent)}
${S} .if-from{margin-top:14px;font-size:33px;line-height:40px;font-weight:700}
${S} .if-from del{font-weight:700}
${S} .if-price{margin-top:17px;font-size:87px;line-height:87px;font-weight:700}
${S} .if-buy{display:inline-block;margin-top:12px;padding:20px 50px;border-radius:3px;background:var(--sb-accent);color:#fff;font-family:var(--sb-font-body);font-size:23px;line-height:23px;font-weight:700;box-shadow:0 0 37px -2px var(--sb-accent)}
${S} .if-stamps{display:block;width:232px;margin-top:7px}

/* FAQ */
${S} .if-faq{padding:100px 10px 110px}
${S} .if-faq-in{max-width:854px;margin:0 auto}
${S} .if-faq-h{margin-bottom:60px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;font-size:36px;line-height:36px;font-weight:500;text-align:center;text-transform:uppercase;color:var(--sb-accent)}
${S} .if-faq-item{border:1px solid #D5D8DC;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}
${S} .if-faq-item+.if-faq-item{margin-top:-1px}
${S} .if-faq-item summary{display:flex;align-items:center;gap:10px;padding:15px 20px;cursor:pointer;list-style:none;font-size:16px;line-height:16px;font-weight:700;color:#fff}
${S} .if-faq-item summary::-webkit-details-marker{display:none}
${S} .if-faq-item[open] summary{color:var(--sb-accent)}
${S} .if-faq-ic{flex:none;width:16px;height:16px;fill:none;stroke:var(--sb-accent);stroke-width:3.2;stroke-linecap:butt}
${S} .if-faq-item[open] .if-faq-ic .v{display:none}
${S} .if-faq-a{padding:15px 20px;border-top:1px solid #D5D8DC;font-size:16px;line-height:24px;color:#CCC}
${S} .if-faq-a p{margin:0 0 15px}

/* rodapé */
${S} .if-foot{display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:120px;padding:50px 10px;background:linear-gradient(#14263D 0%,#010124 100%)}
${S} .if-foot p{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;font-size:20px;line-height:20px;font-weight:300;text-align:center}

@media (max-width:1024px){${tablet(S)}}
@media (max-width:767px){${mobile(S)}}
@media (prefers-reduced-motion:reduce){${S} .if-btn{transition:none}}
${tablet(`${S}.sb-narrow`)}
${mobile(`${S}.sb-narrow`)}
`;
