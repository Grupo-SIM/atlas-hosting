/** Tokens de tema → variáveis CSS. Valores vêm do usuário, então só passam sem `;{}<`. */
const safe = (v: string | undefined, fallback: string) =>
  v && !/[;{}<>]/.test(v) ? v : fallback;

export function themeVars(
  theme: Record<string, string>
): Record<string, string> {
  return {
    "--sb-accent": safe(theme.accent, "#5ce1f5"),
    "--sb-bg": safe(theme.bg, "#030712"),
    "--sb-card": safe(theme.card, "#0b1437"),
    "--sb-fg": safe(theme.fg, "#ffffff"),
    "--sb-font-body": safe(theme.fontBody, "system-ui, sans-serif"),
    "--sb-font-heading": safe(theme.fontHeading, "system-ui, sans-serif"),
    "--sb-muted": safe(theme.muted, "#9fb0d0"),
  };
}

export const siteCss = `
.sb{background:var(--sb-bg);color:var(--sb-fg);font-family:var(--sb-font-body);line-height:1.6;min-height:100%}
.sb *{box-sizing:border-box}
.sb a{color:inherit;text-decoration:none}
.sb h1,.sb h2,.sb h3,.sb h4{font-family:var(--sb-font-heading);line-height:1.15;margin:0 0 .5em}
.sb h1{font-size:clamp(2rem,4vw,3rem)}
.sb h2{font-size:clamp(1.6rem,3vw,2.4rem)}
.sb p{margin:0 0 1em}
.sb img{max-width:100%;display:block}
.sb-block{position:relative}
.sb-container{width:min(1100px,100% - 32px);margin-inline:auto;padding-block:20px}
.sb-align-center{text-align:center}
.sb-sub{color:var(--sb-muted)}
.sb-img-empty{background:linear-gradient(135deg,#12204f,#0a1230);min-height:120px;width:100%}
.sb-btn{display:inline-block;border:0;border-radius:6px;padding:10px 22px;font-weight:600;cursor:pointer;font-family:inherit}
.sb-btn-primary{background:linear-gradient(90deg,#5ce1f5,#b6f0ff);color:#04101f!important}
.sb-btn-light{background:#d8f6ff;color:#04101f!important}
.sb-link{color:var(--sb-accent)!important;font-size:.9rem}
.sb-tag{display:inline-block;background:#e8eefc;color:#04101f;border-radius:999px;padding:2px 10px;font-size:.75rem;margin-bottom:8px}
.sb-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.sb-logo{display:flex;align-items:center;gap:8px}
.sb-logo img{height:48px;width:auto}
.sb-nav{display:flex;gap:20px;background:#0a1230;border:1px solid #1c2c66;border-radius:8px;padding:8px 14px;font-size:.8rem;text-transform:uppercase;color:var(--sb-accent)}
.sb-hero{background-size:cover;background-position:center;min-height:70vh;display:flex;align-items:center}
.sb-hero h1{max-width:460px;font-size:clamp(1.4rem,2.4vw,1.9rem);font-weight:500}
.sb-grid{display:grid;gap:16px;margin-block:16px}
.sb-grid-3{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.sb-card{background:linear-gradient(180deg,var(--sb-card),#050a1c);border-radius:14px;overflow:hidden}
.sb-card-body{padding:14px 16px 18px}
.sb-card-body h3{font-size:1rem}
.sb-card-body p{color:var(--sb-muted);font-size:.85rem}
.sb-post-card img,.sb-post-card .sb-img-empty{aspect-ratio:3/2;object-fit:cover;width:100%}
.sb-cat-card{display:flex;justify-content:space-between;gap:12px;padding:18px;font-size:1.2rem;font-family:var(--sb-font-heading)}
.sb-cat-card img,.sb-cat-card .sb-img-empty{width:90px;height:90px;object-fit:contain;min-height:0}
.sb-video{width:100%;aspect-ratio:16/9;border:0;border-radius:8px}
.sb-stats{display:flex;justify-content:space-around;gap:24px;flex-wrap:wrap;background:linear-gradient(180deg,#14275f,#050a1c);border-radius:12px;padding:24px}
.sb-stats strong{display:block;font-size:2.4rem}
.sb-stats small{font-size:1.2rem;margin-left:4px}
.sb-stats span{font-size:.8rem}
.sb-row-between{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.sb-feature{display:flex;align-items:flex-end;position:relative;min-height:260px;margin-block:12px}
.sb-feature-tall{min-height:290px;margin:0}
.sb-feature img,.sb-feature .sb-img-empty{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55}
.sb-feature div{position:relative;padding:20px}
.sb-featured-post{max-width:290px;margin-inline:auto;padding:16px}
.sb-testimonial{padding:18px;margin:0}
.sb-testimonial blockquote{margin:0 0 16px;font-style:italic;font-size:.9rem}
.sb-testimonial figcaption{display:flex;align-items:center;gap:10px}
.sb-testimonial figcaption span{display:block;font-size:.75rem;color:var(--sb-muted)}
.sb-avatar{width:36px;height:36px;min-height:0!important;border-radius:50%;object-fit:cover}
.sb-split{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center}
.sb-filter{display:flex;gap:8px;margin-block:16px;flex-wrap:wrap}
.sb-filter input,.sb-filter select{background:#0a1230;color:inherit;border:1px solid #1c2c66;border-radius:6px;padding:10px 12px;font-family:inherit}
.sb-filter input{flex:1;min-width:140px}
.sb-two-cols{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:32px}
.sb-post-header{text-align:center}
.sb-post-header img{width:100%;border-radius:12px;margin-block:16px}
.sb-post-header time{display:block;color:var(--sb-muted);font-size:.8rem}
.sb-post-content .sb-container{width:100%;padding-block:6px}
.sb-post-content .sb-image img{border-radius:12px}
.sb-sidebar h4{margin-top:20px}
.sb-sidebar ul{list-style:none;padding:0;margin:0}
.sb-sidebar li{padding:4px 0}
.sb-footer{background:linear-gradient(180deg,var(--sb-bg),#07143a);margin-top:48px;padding-top:32px}
.sb-footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:24px}
.sb-footer-grid a,.sb-footer-grid span{display:block;font-size:.85rem;margin-bottom:6px}
.sb-footer-brand{background:var(--sb-card);border-radius:12px;padding:20px;display:flex;align-items:center;gap:12px;font-size:1.4rem}
.sb-footer-brand img{height:80px}
.sb-socials{display:flex;gap:8px;flex-wrap:wrap}
.sb-socials a{background:var(--sb-accent);color:#04101f;border-radius:999px;padding:2px 10px}
.sb-footer-bottom{display:flex;justify-content:space-between;font-size:.8rem;border-top:1px solid #1c2c66;margin-top:24px}
.sb-footer-bottom a{margin-left:12px}
.sb-float{position:fixed;right:16px;bottom:16px;background:#22c55e;color:#fff!important;font-weight:700;font-size:.75rem;border-radius:999px;padding:10px 16px;z-index:50}
@media (max-width:760px){.sb-split,.sb-two-cols,.sb-footer-grid{grid-template-columns:1fr}}
`;
