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
.sbe-pick{position:relative;min-width:0}
.sbe-pickbtn{display:flex;align-items:center;gap:6px;height:28px;padding:0 8px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--ink);font-size:13px;max-width:220px}
.sbe-pickbtn strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.sbe-pickbtn:hover,.sbe-pickbtn[aria-expanded=true]{background:#f3f1ec;border-color:var(--field)}
.sbe-pickmenu{position:absolute;top:calc(100% + 6px);left:0;z-index:40;min-width:240px;max-width:320px;max-height:60vh;overflow:auto;padding:6px;background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:0 12px 32px rgba(30,28,24,.16)}
.sbe-pickgroup{padding:8px 8px 4px;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft)}
.sbe-pickmenu button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:7px 8px;border:0;border-radius:7px;background:transparent;font-size:13px;color:var(--ink);text-align:left;cursor:pointer}
.sbe-pickmenu button span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sbe-pickmenu button:hover{background:#f3f1ec}
.sbe-pickmenu button.on{background:var(--violet-bg);color:#3f33a3}
.sbe-crumb strong{color:var(--ink);font-weight:500;flex-shrink:0}
.sbe-ibtn{width:30px;height:30px;flex-shrink:0;border:0;border-radius:8px;background:transparent;display:flex;align-items:center;justify-content:center;color:var(--ink)}
.sbe-ibtn:hover:not(:disabled){background:var(--chip)}
.sbe-pill{display:flex;flex-shrink:0;align-items:center;gap:7px;border:1px solid var(--field);background:#fff;border-radius:999px;padding:5px 12px;font-size:12px;color:var(--ink)}
.sbe-pill i{width:7px;height:7px;border-radius:50%;background:#8b5cf6;display:block}
.sbe-pill.saving i{background:#d99a1e}
.sbe-pill.error i{background:var(--danger)}
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
.sbe-sw{display:flex;flex-wrap:wrap;gap:6px}
.sbe-sw button{width:22px;height:22px;border:0;padding:0;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.sbe-sw.big button{width:28px;height:28px}
.sbe-sw button.on{box-shadow:0 0 0 2px var(--panel),0 0 0 4px var(--ink)}
.sbe-sw button.none{background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 50%/8px 8px}
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
.sbe-list-item{border:1px dashed #cfcbc2;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px}
.sbe-drop{border:1.5px dashed #cfcbc2;background:#fff;border-radius:12px;padding:16px 12px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;cursor:pointer;color:var(--violet)}
.sbe-drop.over{border-color:var(--violet);background:#f3f0fe}
.sbe-drop b{font-size:13px;font-weight:500;color:var(--ink)}
.sbe-drop small{color:var(--mute);font-size:12px}
.sbe-thumb{width:100%;height:110px;object-fit:cover;border-radius:10px;border:1px solid var(--line);display:block}
.sbe-imgdrop{position:relative;display:block;width:100%;padding:0;border:1px solid var(--field);border-radius:12px;overflow:hidden;background:#f5f4f0;cursor:pointer}
.sbe-imgdrop .sbe-thumb{display:block;width:100%;max-height:180px;object-fit:cover;border:0;border-radius:0}
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
.sbe-modal{position:fixed;inset:0;background:rgba(29,28,26,.4);display:flex;align-items:center;justify-content:center;padding:16px;z-index:60}
.sbe-confirm{width:420px;max-height:none}
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
