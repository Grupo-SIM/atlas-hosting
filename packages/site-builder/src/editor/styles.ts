/** CSS do chrome do editor (barra, painéis). Sem `>` nem `&` — vai dentro de <style>. */
export const editorCss = `
.sbe{display:flex;flex-direction:column;height:calc(100vh - 4rem);min-height:520px;background:#f4f5f7;color:#111827;font:14px system-ui,sans-serif}
.sbe button{cursor:pointer;border:1px solid #cbd0d8;background:#fff;border-radius:6px;padding:5px 10px;font:inherit}
.sbe button:disabled{opacity:.45;cursor:default}
.sbe button.sbe-primary{background:#111827;color:#fff;border-color:#111827}
.sbe button.sbe-danger{color:#b91c1c;border-color:#f0b4b4}
.sbe input[type=text],.sbe input[type=date],.sbe input[type=number],.sbe textarea,.sbe select{width:100%;border:1px solid #cbd0d8;border-radius:6px;padding:6px 8px;font:inherit;background:#fff}
.sbe-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border-bottom:1px solid #e1e4ea}
.sbe-path{color:#6b7280;font-size:12px}
.sbe-spacer{flex:1}
.sbe-status{color:#6b7280;font-size:12px}
.sbe-body{display:flex;flex:1;min-height:0}
.sbe-left{width:280px;background:#fff;border-right:1px solid #e1e4ea;display:flex;flex-direction:column;min-height:0}
.sbe-right{width:300px;background:#fff;border-left:1px solid #e1e4ea;overflow-y:auto}
.sbe-tabs{display:flex;flex-wrap:wrap;gap:4px;padding:8px;border-bottom:1px solid #e1e4ea}
.sbe-tabs button.active{background:#111827;color:#fff}
.sbe-panel{padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
.sbe-panel h3,.sbe-panel h4{margin:6px 0 2px;font-size:13px}
.sbe-hint{color:#6b7280;font-size:12px;margin:0}
.sbe-field{display:flex;flex-direction:column;gap:4px;font-size:12px;color:#374151}
.sbe-field small{color:#6b7280}
.sbe-error{color:#b91c1c!important}
.sbe-thumb{max-height:70px;object-fit:contain;align-self:flex-start;border:1px solid #e1e4ea;border-radius:4px}
.sbe-row{display:flex;gap:6px;align-items:center}
.sbe-box{border:1px solid #e1e4ea;border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px}
.sbe-list{display:flex;flex-direction:column;gap:8px}
.sbe-list-item{border:1px dashed #cbd0d8;border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px}
.sbe-items,.sbe-outline{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.sbe-items button,.sbe-outline button{width:100%;text-align:left;border-color:transparent;background:transparent}
.sbe-items li.active button,.sbe-outline button.active{background:#e8eefc;border-color:#b6c7f5}
.sbe-items em{color:#9ca3af;font-size:11px}
.sbe-canvas{flex:1;overflow:auto;background:#030712;position:relative}
.sbe-canvas .sb-block{cursor:pointer}
.sbe-canvas .sb-block:hover{outline:1px dashed #5ce1f5;outline-offset:-1px}
.sbe-canvas .sb-block[data-selected]{outline:2px solid #3b82f6;outline-offset:-2px}
`;
