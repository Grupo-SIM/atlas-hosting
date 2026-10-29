/**
 * Script dos efeitos (entrada ao rolar, parallax, contador). É uma string porque roda de duas formas:
 * inline no HTML publicado e injetado pelo `FxRuntime` na prévia. Define `window.sbFx()`, que liga os
 * efeitos de todos os blocos com `data-fx` e devolve a função que desliga tudo.
 */
export const FX_RUNTIME = `(function(){
if(window.sbFx)return;
window.sbFx=function(){
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".sb").forEach(function(r){r.classList.add("sb-js")});
var par=[],counted=[],off=[];
function resolve(blk,p){
if(!p)return blk;
var n=blk,ix=p.split(".");
for(var i=0;i<ix.length&&n;i++)n=n.children[Number(ix[i])-1];
return n||null;
}
function textNodes(el){
var out=[],w=document.createTreeWalker(el,4),n;
while((n=w.nextNode())){var m=/^s*(d[d.,]*)s*$/.exec(n.nodeValue||"");if(m)out.push({node:n,txt:m[1]})}
return out;
}
function prep(el){
var items=textNodes(el).map(function(t){
var end=parseInt(t.txt.replace(/D/g,""),10);
return {node:t.node,end:end,fmt:/[.,]/.test(t.txt),orig:t.node.nodeValue};
}).filter(function(i){return isFinite(i.end)});
el.__sbc=items;
items.forEach(function(i){i.node.nodeValue="0"});
off.push(function(){items.forEach(function(i){i.node.nodeValue=i.orig})});
}
function run(el){
var items=el.__sbc||[];
if(!items.length)return;
var t0=null;
function step(t){
if(t0===null)t0=t;
var k=Math.min(1,(t-t0)/1600),e=1-Math.pow(1-k,3);
items.forEach(function(i){
var v=Math.round(i.end*e);
i.node.nodeValue=i.fmt?v.toLocaleString("pt-BR"):String(v);
});
if(k<1)requestAnimationFrame(step);
}
requestAnimationFrame(step);
}
var io=null;
if("IntersectionObserver" in window&&!reduce){
io=new IntersectionObserver(function(es){
es.forEach(function(e){
if(!e.isIntersecting)return;
io.unobserve(e.target);
e.target.classList.add("sb-in");
if(e.target.__sbc)run(e.target);
});
},{threshold:0.15});
off.push(function(){io.disconnect()});
}
document.querySelectorAll("[data-fx]").forEach(function(blk){
if(blk.getAttribute("data-fx-ready"))return;
blk.setAttribute("data-fx-ready","1");
off.push(function(){blk.removeAttribute("data-fx-ready")});
var cfg=[];
try{cfg=JSON.parse(blk.getAttribute("data-fx")||"[]")}catch(e){return}
cfg.forEach(function(f){
var el=resolve(blk,f.p);
if(!el)return;
var list=f.each?Array.prototype.slice.call(el.children):[el];
list.forEach(function(t){
if(f.s&&!reduce){
t.setAttribute("data-sb-par",getComputedStyle(t).backgroundImage!=="none"?"bg":"el");
par.push({el:t,s:f.s});
}
if(!io){if(f.e)t.classList.add("sb-in");return}
if(f.c){prep(t)}
if(f.e||f.c)io.observe(t);
});
});
});
var ticking=false;
function frame(){
ticking=false;
var vh=window.innerHeight;
par.forEach(function(p){
var r=p.el.getBoundingClientRect();
if(r.bottom<-300||r.top>vh+300)return;
var d=(r.top+r.height/2-vh/2)*p.s*0.1;
var lim=p.el.getAttribute("data-sb-par")==="bg"?80:240;
p.el.style.setProperty("--sb-py",Math.max(-lim,Math.min(lim,d)).toFixed(1)+"px");
});
}
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
if(par.length){
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",onScroll);
off.push(function(){window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll)});
frame();
}
return function(){off.forEach(function(f){f()})};
};
})();`;
