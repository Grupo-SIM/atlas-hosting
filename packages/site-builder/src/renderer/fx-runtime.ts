/**
 * Script dos efeitos (entrada ao rolar, parallax, seguir o mouse, contador). É uma string porque roda de
 * duas formas: inline no HTML publicado e injetado pelo `FxRuntime` na prévia. Define `window.sbFx()`, que
 * liga os efeitos de todos os blocos com `data-fx` e devolve a função que desliga tudo.
 * Ao mudar o script, suba `FX_VERSION` (a prévia troca a versão carregada sem recarregar a página).
 */
export const FX_VERSION = 4;

export const FX_RUNTIME = `(function(){
if(window.sbFx&&window.__sbFxV===${FX_VERSION})return;
window.__sbFxV=${FX_VERSION};
window.sbFx=function(){
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".sb").forEach(function(r){r.classList.add("sb-js")});
var par=[],mice=[],counted=[],off=[];
function resolve(blk,p){
if(!p)return blk;
var n=blk,ix=p.split(".");
for(var i=0;i<ix.length&&n;i++)n=n.children[Number(ix[i])-1];
return n||null;
}
function textNodes(el){
var out=[],w=document.createTreeWalker(el,4),n;
while((n=w.nextNode())){var m=/^\\s*(\\d[\\d.,]*)\\s*$/.exec(n.nodeValue||"");if(m)out.push({node:n,txt:m[1]})}
return out;
}
function prep(el){
var items=textNodes(el).map(function(t){
var end=parseInt(t.txt.replace(/\\D/g,""),10);
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
if(e.target.__sbn)e.target.__sbn();
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
if(f.m&&!reduce){
t.setAttribute("data-sb-mouse","1");
mice.push({el:t,m:f.m,x:0,y:0});
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
/* seguir o mouse: alvo = distância do ponteiro ao centro da tela (-1..1) x força x 6px, com suavização */
if(mice.length){
var tx=0,ty=0,raf=0;
function glide(){
raf=0;
var moving=false;
mice.forEach(function(p){
var gx=tx*p.m*6,gy=ty*p.m*6;
p.x+=(gx-p.x)*0.12;p.y+=(gy-p.y)*0.12;
if(Math.abs(gx-p.x)>0.2||Math.abs(gy-p.y)>0.2)moving=true;
p.el.style.setProperty("--sb-mx",p.x.toFixed(1)+"px");
p.el.style.setProperty("--sb-my",p.y.toFixed(1)+"px");
});
if(moving)raf=requestAnimationFrame(glide);
}
function onMove(e){
tx=(e.clientX/window.innerWidth-0.5)*2;ty=(e.clientY/window.innerHeight-0.5)*2;
if(!raf)raf=requestAnimationFrame(glide);
}
window.addEventListener("mousemove",onMove,{passive:true});
off.push(function(){
window.removeEventListener("mousemove",onMove);
if(raf)cancelAnimationFrame(raf);
mice.forEach(function(p){p.el.removeAttribute("data-sb-mouse");p.el.style.removeProperty("--sb-mx");p.el.style.removeProperty("--sb-my")});
});
}
document.querySelectorAll(".sb-ad[data-ads]").forEach(function(ad){
if(ad.getAttribute("data-ad-ready"))return;
ad.setAttribute("data-ad-ready","1");
off.push(function(){ad.removeAttribute("data-ad-ready")});
var its=Array.prototype.slice.call(ad.querySelectorAll(".sb-ad-item"));
function play(v){var p=v.play();if(p&&p.catch)p.catch(function(){})}
if(its.length<2){if(its[0]&&its[0].tagName==="VIDEO")play(its[0]);return}
var sec=(Number(ad.getAttribute("data-sec"))||6)*1000,cur=0,t=null;
function show(n){
cur=n;
its.forEach(function(el,k){
var on=k===n;
el.classList.toggle("on",on);
if(el.tagName==="VIDEO"){if(on){el.currentTime=0;play(el)}else el.pause()}
});
clearTimeout(t);
t=setTimeout(next,its[n].tagName==="VIDEO"?60000:sec);
}
function next(){show((cur+1)%its.length)}
its.forEach(function(el,k){if(el.tagName==="VIDEO")el.addEventListener("ended",function(){if(cur===k)next()})});
show(0);
off.push(function(){clearTimeout(t)});
});
/* carrossel de depoimentos: as setas ficam no NAV_RUNTIME; aqui passa sozinho, para no hover e liga as bolinhas */
document.querySelectorAll(".sb-af-car").forEach(function(c){
if(c.getAttribute("data-car-ready"))return;
c.setAttribute("data-car-ready","1");
off.push(function(){c.removeAttribute("data-car-ready")});
var tr=c.querySelector(".sb-cslider-track"),ds=Array.prototype.slice.call(c.querySelectorAll(".sb-af-dots button")),hov=false;
if(!tr||!tr.children.length)return;
function step(){return tr.children[0].getBoundingClientRect().width+10}
function max(){return tr.scrollWidth-tr.clientWidth}
function mark(){var m=tr.scrollLeft>=max()-4?ds.length-1:Math.round(tr.scrollLeft/step());ds.forEach(function(d,k){d.classList.toggle("on",k===m)})}
function dot(e){var k=ds.indexOf(e.target);if(k>=0)tr.scrollTo({left:k*step(),behavior:"smooth"})}
function enter(){hov=true}
function leave(){hov=false}
tr.addEventListener("scroll",mark,{passive:true});
c.addEventListener("click",dot);
c.addEventListener("mouseenter",enter);
c.addEventListener("mouseleave",leave);
var iv=reduce?0:setInterval(function(){
if(hov||document.hidden)return;
if(tr.scrollLeft>=max()-4)tr.scrollTo({left:0,behavior:"smooth"});
else tr.scrollBy({left:step(),behavior:"smooth"});
},(Number(c.getAttribute("data-sec"))||5)*1000);
off.push(function(){clearInterval(iv);tr.removeEventListener("scroll",mark);c.removeEventListener("click",dot);c.removeEventListener("mouseenter",enter);c.removeEventListener("mouseleave",leave)});
});
document.querySelectorAll("[data-sb-count]").forEach(function(el){
if(el.getAttribute("data-cnt-ready"))return;
el.setAttribute("data-cnt-ready","1");
var orig=el.textContent,end=Number(el.getAttribute("data-sb-count"))||0,ms=Number(el.getAttribute("data-ms"))||2000;
off.push(function(){el.removeAttribute("data-cnt-ready");el.__sbn=null;el.textContent=orig});
if(!io)return;
el.textContent="0";
el.__sbn=function(){
var t0=null;
function step(t){
if(t0===null)t0=t;
var k=Math.min(1,(t-t0)/ms);
el.textContent=String(Math.round(end*k));
if(k<1)requestAnimationFrame(step);
}
requestAnimationFrame(step);
};
io.observe(el);
});
document.querySelectorAll("[data-sb-slider]").forEach(function(box){
if(box.getAttribute("data-sl-ready"))return;
box.setAttribute("data-sl-ready","1");
var track=box.querySelector(".cp-slider-track"),dots=Array.prototype.slice.call(box.querySelectorAll(".cp-dot"));
var orig=Array.prototype.slice.call(track.children),n=orig.length;
off.push(function(){box.removeAttribute("data-sl-ready")});
if(n<2)return;
var speed=Number(box.getAttribute("data-speed"))||1000,delay=Number(box.getAttribute("data-delay"))||3000;
var cur=0,t=null,ac=new AbortController(),opt={signal:ac.signal};
var clones=orig.slice(0,Math.min(n,4)).map(function(s){var c=s.cloneNode(true);c.setAttribute("aria-hidden","true");track.appendChild(c);return c});
function gap(){return orig[1].offsetLeft-orig[0].offsetLeft}
function place(px,anim){track.style.transition=anim?"transform "+speed+"ms ease":"none";track.style.transform="translate3d("+px+"px,0,0)"}
function mark(){dots.forEach(function(d,k){d.classList.toggle("on",k===cur%n)})}
function go(i,anim){cur=i;place(-i*gap(),anim);mark()}
function wrap(){if(cur>=n){go(cur-n,false);track.offsetHeight}}
function stop(){clearTimeout(t);t=null}
function play(){stop();if(reduce)return;t=setTimeout(function(){wrap();go(cur+1,true);play()},delay+speed)}
track.addEventListener("transitionend",wrap,opt);
dots.forEach(function(d,k){d.addEventListener("click",function(){wrap();go(k,true);play()},opt)});
box.addEventListener("mouseenter",stop,opt);
box.addEventListener("mouseleave",play,opt);
window.addEventListener("resize",function(){go(cur,false)},opt);
var sx=null,dx=0,moved=false;
track.addEventListener("dragstart",function(e){e.preventDefault()},opt);
track.addEventListener("pointerdown",function(e){wrap();sx=e.clientX;dx=0;moved=false;stop();track.style.cursor="grabbing"},opt);
window.addEventListener("pointermove",function(e){if(sx===null)return;dx=e.clientX-sx;if(Math.abs(dx)>5)moved=true;place(-cur*gap()+dx,false)},opt);
function release(){
if(sx===null)return;
sx=null;track.style.cursor="";
if(dx<-40)go(cur+1,true);
else if(dx>40){if(cur===0){go(n,false);track.offsetHeight}go(cur-1,true)}
else go(cur,true);
play();
}
window.addEventListener("pointerup",release,opt);
window.addEventListener("pointercancel",release,opt);
track.addEventListener("click",function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},{capture:true,signal:ac.signal});
play();
off.push(function(){stop();ac.abort();clones.forEach(function(c){c.remove()});track.style.transition="";track.style.transform="";track.style.cursor="";cur=0;mark()});
});
return function(){off.forEach(function(f){f()})};
};
})();`;
