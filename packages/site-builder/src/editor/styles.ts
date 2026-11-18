/**
 * CSS do chrome do editor. Visual portado do protótipo "Editor Visual"
 * (neutros quentes, lima #d6f34a nas ações, roxo #6a5ad8 na seleção).
 * Sem `>` nem `&` — vai dentro de <style>.
 */
export const editorCss = `
.sbe{--ink:#1d1c1a;--mute:#6e6b65;--soft:#9a968e;--line:#e5e2db;--line2:#ece9e2;--field:#e0ddd5;--panel:#fcfbf8;--chip:#f1efea;--lime:#d6f34a;--violet:#6a5ad8;--violet-bg:#ebe8f8;--danger:#a3292f;
  display:flex;gap:0;padding:0;box-sizing:border-box;height:calc(100vh - 4rem);min-height:520px;background:#e9e7e1;color:var(--ink);font:13px/1.4 Roboto,system-ui,sans-serif;position:relative;overflow:hidden;-webkit-font-smoothing:antialiased}
.sbe *{box-sizing:border-box}
.sbe button{font:inherit;color:inherit;cursor:pointer}
.sbe button:disabled{opacity:.45;cursor:default}
.sbe button:not([class]){background:#fff;border:1px solid var(--field);border-radius:8px;padding:5px 10px}
.sbe input[type=text],.sbe input[type=date],.sbe input[type=number],.sbe input[type=password],.sbe input:not([type]),.sbe textarea,.sbe select{font:inherit;color:inherit;background:#fff;border:1px solid var(--field);border-radius:8px;padding:6px 10px;outline:none;min-width:0;width:100%}
.sbe input:focus,.sbe textarea:focus,.sbe select:focus{border-color:#b9b4a8}
.sbe input[type=range]{accent-color:var(--ink);padding:0;border:0;background:transparent;width:110px;flex:none}

.sbe-panel-card{background:var(--panel);border:0;border-radius:0;display:flex;flex-direction:column;overflow:hidden;min-height:0;flex-shrink:0}
.sbe-left{width:clamp(240px,22vw,300px);border-right:1px solid var(--line)}
.sbe-right{width:clamp(240px,22vw,290px);border-left:1px solid var(--line)}
.sbe-resizer{flex:none;width:9px;margin:0 -4px;position:relative;z-index:12;cursor:col-resize;touch-action:none}
.sbe-resizer::after{content:"";position:absolute;top:0;bottom:0;left:4px;width:2px;background:transparent;transition:background-color .15s}
.sbe-resizer:hover::after,.sbe-resizer:active::after{background:var(--violet)}
.sbe-right[hidden]{display:none}
.sbe-center{flex:1;min-width:0;background:var(--panel);border:0;border-radius:0;display:flex;flex-direction:column;overflow:hidden;position:relative}
.sbe-scroll{flex:1;overflow:auto;min-height:0}

.sbe-seg{display:flex;gap:2px;background:var(--chip);padding:3px;border-radius:10px}
.sbe-seg button{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;border:0;border-radius:8px;padding:7px 6px;background:transparent;color:var(--mute)}
.sbe-seg button.on{background:#fff;color:var(--ink);font-weight:500;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.sbe-seg.mini{padding:2px;border-radius:8px}
.sbe-seg.mini button{padding:0 6px;height:26px;min-width:28px;border-radius:6px;font-size:11px;flex:1}
.sbe-seg.mini button.on{box-shadow:0 1px 2px rgba(0,0,0,.08)}
.sbe-soon{font-size:9px;font-weight:500;background:var(--ink);color:var(--lime);padding:2px 5px;border-radius:999px}

.sbe-top{height:48px;flex-shrink:0;display:flex;align-items:center;gap:8px;padding:0 12px 0 10px;font-size:13px;color:var(--mute);white-space:nowrap}
.sbe-crumb{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
.sbe-crumb span{overflow:hidden;text-overflow:ellipsis}
.sbe-crumb strong{color:var(--ink);font-weight:500}
.sbe-where{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
.sbe-ibtn{width:30px;height:30px;flex-shrink:0;border:0;border-radius:8px;background:transparent;display:flex;align-items:center;justify-content:center;color:var(--ink)}
.sbe-ibtn:hover:not(:disabled){background:var(--chip)}
.sbe-ibtn.on{background:var(--chip);box-shadow:inset 0 0 0 1px var(--field);color:var(--violet)}
.sbe-tools{display:flex;flex-shrink:0;gap:2px;padding:2px;border-radius:10px;border:1px solid var(--field)}
.sbe-pill{display:flex;flex-shrink:0;align-items:center;gap:7px;border:1px solid var(--field);background:#fff;border-radius:999px;padding:5px 12px;font-size:12px;color:var(--ink)}
.sbe-pill i{width:7px;height:7px;border-radius:50%;background:#8b5cf6;display:block}
.sbe-pill.saving i{background:#d99a1e}
.sbe-pill.error i{background:var(--danger)}
.sbe-pill.live i{background:#22a06b}
.sbe-pill.wait i{background:#d99a1e;animation:sbe-pulse 1.2s ease-in-out infinite}
.sbe-pill.idle i{background:#9a968e;animation:sbe-pulse 1.2s ease-in-out infinite}
@keyframes sbe-pulse{50%{opacity:.35}}
.sbe-ads{display:flex;flex-shrink:0;align-items:center;gap:8px;border-radius:999px!important;padding:7px 14px 7px 12px;font-size:13px;font-weight:500;transition:box-shadow .2s,background-color .2s,color .2s}
.sbe-ads i{flex:none;width:9px;height:9px;border-radius:50%;transition:background-color .2s,box-shadow .2s}
.sbe-ads.on{background:var(--lime)!important;border:0!important;color:var(--ink);box-shadow:0 0 0 2px rgba(214,243,74,.45),0 0 14px 3px rgba(214,243,74,.6)}
.sbe-ads.on i{background:#16a34a;box-shadow:0 0 0 2px rgba(22,163,74,.22),0 0 6px 1px rgba(22,163,74,.7)}
.sbe-ads.off{background:#ecebe6!important;border:1px solid #dcdad2!important;color:#8a877f}
.sbe-ads.off i{background:#dc2626}
.sbe-lime{display:flex;flex-shrink:0;align-items:center;gap:6px;background:var(--lime)!important;border:0!important;border-radius:999px!important;padding:7px 14px;font-size:13px;font-weight:500;color:var(--ink)}
.sbe-bar2{min-height:40px;flex-shrink:0;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:4px 12px;border-bottom:1px solid var(--line2);white-space:nowrap}
.sbe-bar2 .sbe-seg{padding:2px;border-radius:8px}
.sbe-bar2 .sbe-seg button{padding:0;width:30px;height:26px;border-radius:6px}
.sbe-bar2 select{width:auto;height:28px;padding:0 8px;font-size:12px}
.sbe-muted{font-size:12px;color:var(--soft);overflow:hidden;text-overflow:ellipsis;min-width:0}
.sbe-link{background:transparent;border:0;font-size:12px;color:#55524c;text-decoration:underline;padding:0}
.sbe-spacer{flex:1}

.sbe-canvas{flex:1;overflow:auto;background:#f3f1ec;padding:16px;min-height:0}
.sbe-frame{position:relative;isolation:isolate;contain:layout;margin:0 auto;border-radius:10px;overflow:clip;box-shadow:0 0 0 1px var(--field),0 10px 30px rgba(30,28,24,.08)}
.sbe-canvas .sb-block{cursor:default}
.sbe-frame .sb-block[data-block-type=whatsappFloat]{position:sticky;bottom:0;height:0;z-index:4}
.sbe-frame .sb-float{position:absolute}
.sbe-canvas .sb-header .sb-logo,.sbe-canvas .sb-header .sb-logo-img{cursor:grab;touch-action:none;user-select:none}
.sbe-canvas img{-webkit-user-drag:none;user-select:none}
.sbe-canvas iframe{pointer-events:none}
.sbe-canvas.framing img{cursor:grab}
.sbe-canvas.hand,.sbe-canvas.hand *{cursor:grab!important;user-select:none}
.sbe-canvas.hand.panning,.sbe-canvas.hand.panning *{cursor:grabbing!important}
.sbe-canvas [data-sbe-editing]{cursor:text;outline:2px solid var(--violet);outline-offset:2px;border-radius:2px;user-select:text;-webkit-user-select:text;min-width:1ch}
.sbe-canvas.panning,.sbe-canvas.panning *{cursor:grabbing!important;user-select:none}
.sbe-framebar{position:fixed;z-index:20;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:6px 8px 6px 12px;border-radius:999px;background:#1b1b1f;color:#fff;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,.3)}
.sbe-framebar button{border:0;border-radius:999px;padding:5px 11px;background:#d6f34a;color:#111;font-weight:700;font-size:12px;cursor:pointer}
.sbe-mediabox{display:none;position:fixed;z-index:7;pointer-events:none;box-sizing:border-box;border:1px dashed var(--violet)}
.sbe-mediabox .h{position:absolute;display:block;width:12px;height:12px;box-sizing:border-box;background:#fff;border:2px solid var(--violet);border-radius:3px;pointer-events:auto;touch-action:none}
.sbe-mediabox .nw{left:-7px;top:-7px;cursor:nwse-resize}
.sbe-mediabox .ne{right:-7px;top:-7px;cursor:nesw-resize}
.sbe-mediabox .sw{left:-7px;bottom:-7px;cursor:nesw-resize}
.sbe-mediabox .se{right:-7px;bottom:-7px;cursor:nwse-resize}
.sbe-mediabox .w,.sbe-mediabox .e{top:50%;width:10px;height:30px;margin-top:-15px;cursor:ew-resize}
.sbe-mediabox .w{left:-7px}
.sbe-mediabox .e{right:-7px}
.sbe-mediabox .s{left:50%;bottom:-7px;width:30px;height:10px;margin-left:-15px;cursor:ns-resize}
.sbp{display:flex;flex-direction:column;gap:10px;width:208px}
.sbp-box{position:relative;height:140px;border-radius:10px;cursor:crosshair;touch-action:none;background-image:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent)}
.sbp-hue{position:relative;height:14px;border-radius:999px;cursor:pointer;touch-action:none;background:linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)}
.sbp-dot{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35),0 2px 6px rgba(0,0,0,.35);pointer-events:none}
.sbp-hue .sbp-dot{top:50%}
.sbp-row{display:flex;align-items:center;gap:8px}
.sbp-hex{flex:1;min-width:0;display:flex;align-items:center;gap:8px;height:34px;padding:0 8px;border:1px solid var(--field);border-radius:8px;background:#fff}
.sbp-hex i{flex:none;width:18px;height:18px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)}
.sbe .sbp-hex input{flex:1;min-width:0;width:auto;height:30px;padding:0;border:0;border-radius:0;background:transparent;font-family:ui-monospace,monospace;text-transform:uppercase}
.sbp-eye{flex:none;display:flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border:1px solid var(--field);border-radius:8px;background:#fff;color:var(--ink)}
.sbp-wrap{display:inline-flex}
.sbp-pop{position:fixed;z-index:80;padding:12px;background:#fff;border:1px solid var(--field);border-radius:14px;box-shadow:0 16px 40px rgba(30,28,24,.24)}
.sbp-add{flex:none;display:flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:50%;color:#fff;background:conic-gradient(#f43f5e,#f59e0b,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#f43f5e);box-shadow:0 0 0 2px #fff inset}
.sbp-add svg{color:#111;background:#fff;border-radius:50%;padding:1px}
.sbp-square{flex:none;width:28px;height:28px;padding:0;border:0;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)}
.sbq-bar{position:fixed;z-index:30;left:-9999px;top:0;display:flex;align-items:center;flex-wrap:wrap;gap:6px;max-width:calc(100vw - 24px);padding:6px 8px;background:#fff;border:1px solid var(--field);border-radius:12px;box-shadow:0 8px 24px rgba(30,28,24,.16);font-size:12px}
.sbq-menu{position:relative}
.sbq-btn{display:flex;align-items:center;gap:6px;height:30px;padding:0 9px;border:1px solid var(--field);border-radius:8px;background:#fff;color:var(--ink);font-size:12px;white-space:nowrap}
.sbq-btn.on{background:var(--chip)}
.sbq-dot{flex:none;width:14px;height:14px;border-radius:4px;border:1px solid rgba(0,0,0,.2);background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/8px 8px}
.sbq-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:31;width:240px;display:flex;flex-direction:column;gap:8px;padding:10px;background:#fff;border:1px solid var(--field);border-radius:12px;box-shadow:0 12px 32px rgba(30,28,24,.2)}
.sbq-bar[data-pop=up] .sbq-pop{top:auto;bottom:calc(100% + 6px)}
.sbq-media{width:270px}
.sbq-colors b{font-size:11px;font-weight:500;color:var(--mute)}
.sbq-sw{display:flex;flex-wrap:wrap;gap:6px}
.sbq-sw>button{width:22px;height:22px;padding:0;border:1px solid rgba(0,0,0,.18);border-radius:6px}
.sbq-sw>.none{background:linear-gradient(135deg,#fff 45%,#f43f5e 45% 55%,#fff 55%)}
.sbq-custom{display:flex;align-items:center;gap:6px}
.sbq-custom input[type=color]{flex:none;width:34px;height:30px;padding:0;border:1px solid var(--field);border-radius:8px;background:#fff}
.sbe .sbq-custom input[type=text]{flex:1;min-width:0;height:30px}
.sbq-use{flex:none;height:30px;padding:0 10px;border:0;border-radius:8px;background:var(--ink);color:#fff}
.sbq-use:disabled{opacity:.4}
.sbe .sbq-font{width:130px;height:30px;padding:0 6px}
.sbq-size{display:flex;align-items:center;border:1px solid var(--field);border-radius:8px;overflow:hidden}
.sbq-size button{width:24px;height:28px;border:0;background:#fff;color:var(--ink);font-size:14px}
.sbe .sbq-size input[type=number]{width:46px;height:28px;padding:0;border:0;border-radius:0;text-align:center}
.sbq-tog{width:30px;height:30px;border:1px solid var(--field);border-radius:8px;background:#fff;color:var(--ink)}
.sbq-tog.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.sbq-layers{width:250px}
.sbq-layers b{font-size:11px;font-weight:500;color:var(--mute)}
.sbq-ops{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sbq-ops button{padding:7px 6px;border:1px solid var(--field);border-radius:8px;background:#fff;color:var(--ink);font-size:12px}
.sbq-ops button:hover{background:var(--chip)}
.sbq-stack-list{display:flex;flex-direction:column;gap:2px;max-height:200px;overflow:auto}
.sbq-stack-list button{padding:6px 8px;border:0;border-radius:6px;background:transparent;color:var(--ink);font-size:12px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sbq-stack-list button:hover{background:var(--chip)}
.sbq-stack-list button.on{background:var(--violet-bg);color:var(--violet)}
.sbe-layer .lay{margin-left:auto;display:flex;gap:2px;flex:none}
.sbe-layer .lay button{display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--mute)}
.sbe-layer .lay button:hover{background:#fff;color:var(--ink)}
.sbq-note{padding:0 6px;color:var(--mute)}
.sbq-stack{display:flex;flex-direction:column;gap:8px}
.sbq-file{display:flex;align-items:center;gap:6px;min-width:0}
.sbq-file span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sbq-staged{padding:8px;background:var(--violet-bg);border-radius:10px}
.sbq-staged p{margin:0 0 6px;line-height:1.4}
.sbe-guide{display:none;position:fixed;z-index:6;pointer-events:none;background:#ff3d8b}
.sbe-guide.v{width:1px}
.sbe-guide.h{height:1px}
.sbe-hoverbox{display:none;position:fixed;z-index:5;pointer-events:none;box-sizing:border-box;border:2px solid #8b7ff0;background:rgba(139,127,240,.08)}
.sbe-hoverbox span{position:absolute;left:-2px;top:-20px;background:#8b7ff0;color:#fff;font-size:11px;line-height:18px;padding:0 6px;border-radius:4px 4px 0 0;white-space:nowrap}
.sbe-canvas .sb-block[data-selected]{outline:2px solid var(--violet);outline-offset:-2px}

.sbe-tabs2{display:flex;gap:4px;flex-wrap:wrap}
.sbe-tabs2 button{border:1px solid var(--field);background:#fff;border-radius:999px;padding:4px 10px;font-size:12px;color:var(--mute)}
.sbe-tabs2 button.on{background:var(--ink);border-color:var(--ink);color:#fff}

.sbe-pad{padding:12px;display:flex;flex-direction:column;gap:10px}
.sbe-h{font-size:11px;font-weight:500;color:var(--mute);letter-spacing:.06em;text-transform:uppercase;margin:0}
.sbe-hint{color:var(--mute);font-size:12px;margin:0;line-height:1.5}
.sbe-sec{padding:14px 16px;border-bottom:1px solid var(--line2);display:flex;flex-direction:column;gap:12px}
.sbe-sec:last-child{border-bottom:0}
.sbe-sec.closed{padding-block:11px;gap:0}
.sbe-sec-head{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:0;border:0;background:transparent;color:var(--ink);text-align:left}
.sbe-sec-head .sbe-h{margin:0}
.sbe-sec-head svg{color:var(--soft);flex:none}
.sbe-sec-head:hover svg{color:var(--ink)}
.sbe-sec-body{display:flex;flex-direction:column;gap:12px}
.sbe-line{display:flex;align-items:center;gap:8px}
.sbe-line>span:first-child{font-size:12px;color:#55524c;flex:1}
.sbe-num{width:44px!important;height:28px;padding:0 6px!important;font-size:12px;text-align:center}
.sbe-sm{height:28px;padding:0 8px!important;font-size:12px}
.sbe-mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;height:30px;padding:0 10px!important}
.sbe-more{margin-top:4px}
.sbe-more>summary{cursor:pointer;font-size:12px;color:#55524c;padding:6px 0}
.sbe-tip{font-size:11px;color:var(--mute)}
.sbe-tip summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:4px;color:var(--mute)}
.sbe-tip summary::-webkit-details-marker{display:none}
.sbe-tip summary::before{content:"?";display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;border:1px solid var(--soft);font-size:9px;font-weight:600}
.sbe-tip summary:hover{color:var(--ink)}
.sbe-tip>div{margin-top:4px;line-height:1.45}
.sbe-tip b{color:var(--ink);font-weight:500}
.sbe-fold{border-top:1px solid var(--line2)}
.sbe-fold:first-of-type{border-top:0}
.sbe-fold>button{width:100%;display:flex;align-items:center;gap:8px;padding:7px 0;background:transparent!important;border:0!important;border-radius:0!important;font-size:12px;color:var(--ink);text-align:left}
.sbe-fold>button b{flex:none;font-weight:500}
.sbe-fold>button span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mute);text-align:right}
.sbe-fold>button svg{margin-left:auto;color:var(--soft)}
.sbe-fold>button span+svg{margin-left:0}
.sbe-fold-body{display:flex;flex-direction:column;gap:6px;padding:0 0 8px}
.sbe-field>span:empty{display:none}
.sbe-spec{display:block;margin-top:2px;font-size:11px;line-height:1.45;color:var(--mute)}
.sbe-spec b{color:var(--ink);font-weight:500}
.sbe-colorrow{display:flex;align-items:center;gap:8px}
.sbe-colorrow input[type=color]{flex:none;width:36px;height:30px;padding:0!important;border:1px solid rgba(0,0,0,.18)!important;border-radius:8px;background:none;cursor:pointer}
.sbe-colorrow .sbe-mono{flex:1;min-width:0}
.sbe-link{margin-left:8px;padding:0;border:0;background:none;color:#6a5ad8;font-size:12px;cursor:pointer;text-decoration:underline}
.sbe-sw{display:flex;flex-wrap:wrap;gap:6px}
.sbe-sw>button{width:22px;height:22px;border:0;padding:0;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.sbe-sw.big>button{width:28px;height:28px}
.sbe-sw>button.on{box-shadow:0 0 0 2px var(--panel),0 0 0 4px var(--ink)}
.sbe-sw>button.none{background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 50%/8px 8px}
.sbe-toggle{width:34px;height:20px;border-radius:999px;border:0;padding:2px;background:#dcd9d1;display:flex;justify-content:flex-start}
.sbe-toggle.on{background:var(--ink);justify-content:flex-end}
.sbe-toggle span{width:16px;height:16px;border-radius:50%;background:#fff;display:block}

.sbe-selbox{display:none;position:fixed;z-index:5;pointer-events:none;box-sizing:border-box;border:2px solid var(--violet)}
.sbe-selhead{padding:14px 16px 12px;border-bottom:1px solid var(--line2);display:flex;flex-direction:column;gap:6px}
.sbe-selhead .row{display:flex;align-items:center;gap:8px}
.sbe-selhead .name{font-size:14px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sbe-chip{font-size:11px;color:var(--mute);background:var(--chip);padding:3px 8px;border-radius:999px;white-space:nowrap}
.sbe-crumbs{display:flex;flex-wrap:wrap;gap:2px;align-items:center;font-size:11px;color:var(--soft)}
.sbe-crumbs button{border:0;background:transparent;padding:0;color:inherit;display:flex;align-items:center;gap:2px;font-size:11px}
.sbe-crumbs button:hover{color:var(--ink)}
.sbe-actions{display:flex;gap:4px;padding:10px 16px;border-bottom:1px solid var(--line2)}
.sbe-actions button{flex:1;height:32px;border:1px solid var(--field);border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center}
.sbe-actions button.danger{color:var(--danger)}

.sbe-layers{padding:8px 6px 16px}
.sbe-layer{display:flex;align-items:center;gap:6px;height:28px;padding-right:6px;border-radius:7px;font-size:12.5px;cursor:pointer;color:var(--ink)}
.sbe-layer:hover{background:#f3f1ec}
.sbe-layer.on{background:var(--violet-bg);color:#3f33a3}
.sbe-layer.off{color:#b5b1a8}
.sbe-layer.el{height:25px;font-size:12px;color:var(--mute)}
.sbe-layer.el.on{color:#3f33a3}
.sbe-layer.dragging{opacity:.4}
.sbe-layer.drop-before{box-shadow:0 -2px 0 #6a5ad8}
.sbe-layer.drop-after{box-shadow:0 2px 0 #6a5ad8}
.sbe-layer.drop-inside{outline:2px solid #6a5ad8;outline-offset:-2px;background:var(--violet-bg)}
.sbe-dropend{height:14px;margin:2px 6px;border-radius:6px}
.sbe-dropend.over{box-shadow:0 2px 0 #6a5ad8;background:var(--violet-bg)}
.sbe-layer.group{cursor:default;color:var(--mute);font-size:11px;letter-spacing:.06em;text-transform:uppercase;margin-top:6px}
.sbe-layer.group:hover{background:transparent}
.sbe-layer .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sbe-layer .ico{color:var(--soft);display:flex}
.sbe-layer .eye{display:flex;padding:2px;color:#c3bfb6;border:0;background:transparent}
.sbe-layer .eye.off{color:var(--soft)}
.sbe-layer .gap{width:14px;flex-shrink:0}
.sbe-addgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sbe-addgrid button,.sbe-btn{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--field);border-radius:8px;padding:8px 10px;font-size:12px;text-align:left}
.sbe-addgrid button:hover,.sbe-btn:hover:not(:disabled){border-color:#c9c5bc}
.sbe-btn.danger{color:var(--danger)}
.sbe-btn.dark{background:var(--ink);color:#fff;border-color:var(--ink)}
.sbe-btn.round{border-radius:999px;padding:9px 16px;font-size:13px;justify-content:center}

.sbe-list-row{display:flex;gap:6px;align-items:center}
.sbe-items{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.sbe-items button{width:100%;text-align:left;border:0;background:transparent;border-radius:8px;padding:7px 10px}
.sbe-items li.on button{background:var(--violet-bg);color:#3f33a3}
.sbe-items em{color:var(--soft);font-size:11px}
.sbe-box{border:1px solid var(--line);border-radius:12px;background:#fff;padding:10px;display:flex;flex-direction:column;gap:8px}
.sbe-field{display:flex;flex-direction:column;gap:4px;font-size:12px;color:#55524c}
.sbe-field small{color:var(--mute)}
.sbe-error{color:var(--danger)!important}
.sbe-chan-ok{color:#1f7a3d!important;font-weight:600}
.sbe-list{display:flex;flex-direction:column;gap:8px}
.sbe-replicate{margin:10px 16px 0;padding:10px;border:1px solid var(--violet);border-radius:10px;background:rgba(106,90,216,.06);display:flex;flex-direction:column;gap:8px}
.sbe-replicate button{display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 10px;border:0;border-radius:8px;background:var(--violet);color:#fff;font-size:12.5px;font-weight:600;cursor:pointer}
.sbe-list-item{border:1px dashed #cfcbc2;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px}
.sbe-drop{border:1.5px dashed #cfcbc2;background:#fff;border-radius:12px;padding:16px 12px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;cursor:pointer;color:var(--violet)}
.sbe-drop.over{border-color:var(--violet);background:#f3f0fe}
.sbe-drop b{font-size:13px;font-weight:500;color:var(--ink)}
.sbe-drop small{color:var(--mute);font-size:12px}
.sbe-thumb{width:100%;height:110px;object-fit:cover;border-radius:10px;border:1px solid var(--line);display:block}
.sbe-imgdrop{position:relative;display:block;width:100%;padding:0;border:1px solid var(--field);border-radius:12px;overflow:hidden;background:#f5f4f0;cursor:pointer}
.sbe-imgdrop .sbe-thumb{display:block;width:100%;max-height:120px;object-fit:cover;border:0;border-radius:0}
.sbe-imgdrop .cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(29,28,26,.55);color:#fff;font-size:12.5px;opacity:0;transition:opacity .12s}
.sbe-imgdrop:hover .cover,.sbe-imgdrop:focus-visible .cover,.sbe-imgdrop.over .cover{opacity:1}

.sbe-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:32px 24px;text-align:center}
.sbe-empty .ico{width:44px;height:44px;border-radius:12px;background:var(--violet-bg);color:var(--violet);display:flex;align-items:center;justify-content:center}
.sbe-empty .tag{font-size:11px;font-weight:500;letter-spacing:.06em;background:var(--ink);color:var(--lime);padding:4px 10px;border-radius:999px}
.sbe-empty h4{font-size:16px;font-weight:500;margin:0}
.sbe-empty p{font-size:13px;color:var(--mute);line-height:1.5;max-width:220px;margin:0}
.sbe-fake-input{margin:10px;background:#f5f4f0;border:1px dashed #dcd9d1;border-radius:14px;padding:12px;font-size:13px;color:#b5b1a8;display:flex;align-items:center;justify-content:space-between}
.sbe-fake-input span{width:28px;height:28px;border-radius:50%;background:#dcd9d1;color:#fff;display:flex;align-items:center;justify-content:center}

.sbe-scrim{position:absolute;inset:0;background:rgba(29,28,26,.28);display:flex;align-items:flex-start;justify-content:flex-end;padding:52px 12px 12px;z-index:50}
.sbe-banner{flex-shrink:0;padding:8px 14px;background:#fdf1e0;border-bottom:1px solid #f1d3a6;color:#92550c;font-size:12px;line-height:1.45}
.sbe-banner b{font-weight:600}
.sbe-banner code{font-family:'JetBrains Mono',ui-monospace,monospace;background:#1d1c1a;color:#d6f34a;border-radius:4px;padding:1px 5px;font-size:11px;margin-right:4px}
.sbe-devbar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.sbe-devbar>div:first-child{flex:1;min-width:260px}
.sbe-devstatus{display:block;margin-top:2px;font-weight:600}
.sbe-devactions{display:flex;gap:8px;flex-shrink:0}
.sbe-devactions button:disabled{opacity:.45;cursor:not-allowed}
.sbe-leftfoot{flex:none;padding:10px;border-top:1px solid var(--line2);background:var(--panel)}
.sbe-leftfoot .sbe-btn{width:100%}
.sbe-postdialog{width:480px}
.sbe-check{display:flex;align-items:center;gap:8px;font-size:12px;color:#55524c;cursor:pointer}
.sbe-check input{width:auto;flex:none}
.sbe-modal{position:fixed;inset:0;background:rgba(29,28,26,.4);display:flex;align-items:center;justify-content:center;padding:16px;z-index:60}
.sbe-confirm{width:420px;max-height:none}
.sbe-adprev{width:760px;max-height:calc(100vh - 32px)}
.sbe-adprev-body{padding:8px 20px 4px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start;overflow:auto}
.sbe-adprev-body h4{font-size:12px;font-weight:500;color:var(--mute);margin:0 0 8px;text-transform:none}
.sbe-adprev-slot{position:relative;width:100%;overflow:hidden;border-radius:8px;background:#e9e7e1;box-shadow:0 0 0 1px rgba(0,0,0,.12)}
.sbe-adprev-whole{position:relative;width:100%;max-width:300px;overflow:hidden;border-radius:6px;background:#e9e7e1;box-shadow:0 0 0 1px rgba(0,0,0,.12)}
.sbe-adprev-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sbe-adprev-media.full{object-fit:fill}
.sbe-adprev-keep{position:absolute;box-shadow:0 0 0 999px rgba(20,20,20,.58);outline:2px solid var(--lime);outline-offset:-2px}
.sbe-adprev-cap{display:block;margin-top:6px;font-size:11px;color:var(--mute)}
.sbe-adprev-facts{margin:8px 20px 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:12px;color:#55524c}
.sbe-adprev-facts .warn{color:#92550c}
@media (max-width:720px){.sbe-adprev-body{grid-template-columns:1fr}}
.sbe-vpop{background:rgba(11,11,11,.8);padding:56px 12px 16px}
.sbe-vpop-stage{position:relative;width:min(900px,100%);aspect-ratio:16/9;background:#000;box-shadow:0 0 8px rgba(0,0,0,.6)}
.sbe-vpop-stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.sbe-vpop-close{position:absolute;top:-44px;right:-6px;width:44px;height:44px;padding:0;border:0;background:none;color:#fff;font:28px/44px Arial,sans-serif;cursor:pointer;opacity:.7}
.sbe-vpop-close:hover,.sbe-vpop-close:focus-visible{opacity:1}
.sbe-relink{padding:4px 20px 0;display:flex;flex-direction:column;gap:12px}
.sbe-relink ul{margin:0;padding:10px 12px 10px 28px;background:#f3f1ec;border-radius:10px;font-size:12px;color:#55524c;display:flex;flex-direction:column;gap:3px}
.sbe-dialog{width:400px;max-width:100%;max-height:100%;background:var(--panel);border:1px solid var(--line);border-radius:16px;box-shadow:0 20px 50px rgba(30,28,24,.18);display:flex;flex-direction:column;overflow:hidden}
.sbe-dialog header{padding:18px 20px 6px;display:flex;justify-content:space-between;align-items:flex-start}
.sbe-dialog header h3{font-size:18px;font-weight:500;margin:0 0 4px}
.sbe-dialog header p{font-size:13px;color:var(--mute);margin:0}
.sbe-dialog .body{padding:12px 20px;display:flex;flex-direction:column;gap:8px;overflow:auto}
.sbe-log{border:1px solid var(--line);border-radius:12px;background:#fff}
.sbe-log button{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;font-size:13px;border:0;background:transparent;text-align:left;border-top:1px solid #f0eee9}
.sbe-log button:first-child{border-top:0}
.sbe-log .lbl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sbe-kind{font-size:11px;padding:2px 7px;border-radius:6px;flex-shrink:0;color:#6a4fd0;background:#efeafd}
.sbe-kind.Novo{color:#1f7a4d;background:#e6f5ec}
.sbe-kind.Removido{color:var(--danger);background:#fbe7e8}
.sbe-kind.Oculto{color:#8a5a00;background:#fbf0d9}
.sbe-kind.Tema{color:var(--ink);background:#eef7c9}
.sbe-target{margin:4px 20px 0;padding:12px;background:#f3f1ec;border-radius:10px;display:flex;align-items:center;gap:8px;font-size:13px}
.sbe-dialog footer{padding:16px 20px 18px;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.sbe-toast{position:absolute;top:18px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;font-size:13px;padding:10px 16px;border-radius:999px;display:flex;align-items:center;gap:8px;z-index:30}
.sbe-toast svg{color:var(--lime)}

.sbe-ailock .sbe-canvas,.sbe-ailock .sbe-right{pointer-events:none}
.sbe-ailock .sbe-canvas{opacity:.88}
.sbe-ai-note{margin:0 12px;padding:6px 10px;font-size:12px;color:var(--mute);display:flex;align-items:center;gap:6px}
.sbe-ai-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line2);font-size:12px;color:var(--mute)}
.sbe-ai-head span{display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sbe-ai-head svg{color:#2f9e5f;flex:none}
.sbe-ai-list{display:flex;flex-direction:column;gap:10px;padding:12px}
.sbe-ai-hello{display:flex;flex-direction:column;gap:8px}
.sbe-ai-hello p{margin:0 0 4px;font-size:13px;color:var(--mute)}
.sbe-ai-msg{max-width:92%;font-size:13px;line-height:1.5;padding:8px 11px;border-radius:12px;white-space:pre-wrap;overflow-wrap:anywhere}
.sbe-ai-msg p{margin:0}
.sbe-ai-msg code{background:var(--chip);border-radius:4px;padding:0 4px;font-size:12px}
.sbe-ai-msg.user{align-self:flex-end;background:var(--ink);color:#fff;border-bottom-right-radius:4px}
.sbe-ai-msg.assistant{align-self:flex-start;background:#fff;border:1px solid var(--line);border-bottom-left-radius:4px}
.sbe-ai-msg.failed{border-color:#e7b7ba;color:var(--danger)}
.sbe-ai-msg ul{margin:6px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--mute)}
.sbe-ai-msg li:before{content:"✓ ";color:#2f9e5f}
.sbe-ai-input{margin:10px;display:flex;align-items:flex-end;gap:6px;background:#fff;border:1px solid var(--field);border-radius:14px;padding:6px 6px 6px 10px}
.sbe-ai-input textarea{flex:1;border:0!important;background:transparent!important;resize:none;padding:4px 0!important;max-height:120px;outline:none}
.sbe-ai-input button{flex:none;min-width:28px;height:28px;border-radius:999px!important;border:0!important;background:var(--ink)!important;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 10px!important}
.sbe-ai-input button.stop{font-size:12px;background:var(--danger)!important}
.sbe-ai-login{display:flex;flex-direction:column;gap:8px;width:100%;align-items:stretch;text-align:left}
.sbe-ai-err{color:var(--danger);padding:0 12px}
.sbe-ai-drop{display:flex;flex-direction:column;flex:1;min-height:0;position:relative}
.sbe-ai-drop.on:after{content:"Solte a imagem aqui";position:absolute;inset:6px;border:2px dashed var(--violet);border-radius:14px;background:rgba(235,232,248,.9);color:var(--violet);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;z-index:5}
.sbe-ai-imgs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.sbe-ai-imgs img{width:72px;height:72px;object-fit:cover;border-radius:8px}
.sbe-ai-thumbs{display:flex;flex-wrap:wrap;gap:8px;padding:0 12px}
.sbe-ai-thumbs div{position:relative}
.sbe-ai-thumbs img{width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--line);display:block}
.sbe-ai-thumbs button{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%!important;border:0!important;background:var(--ink)!important;color:#fff;font-size:12px;line-height:1;padding:0!important;display:flex;align-items:center;justify-content:center}
.sbe-ai-input button.attach{background:transparent!important;color:var(--mute)}
.sbe-ai-input button.attach:hover:not(:disabled){color:var(--ink)}
`;
