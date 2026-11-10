/**
 * Script dos efeitos (entrada ao rolar, parallax, seguir o mouse, contador). É uma string porque roda de
 * duas formas: inline no HTML publicado e injetado pelo `FxRuntime` na prévia. Define `window.sbFx()`, que
 * liga os efeitos de todos os blocos com `data-fx` e devolve a função que desliga tudo.
 * Ao mudar o script, suba `FX_VERSION` (a prévia troca a versão carregada sem recarregar a página).
 */
export const FX_VERSION = 12;

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
document.querySelectorAll(".sb-af-car,.sg-car").forEach(function(c){
if(c.getAttribute("data-car-ready"))return;
c.setAttribute("data-car-ready","1");
off.push(function(){c.removeAttribute("data-car-ready")});
var tr=c.querySelector(".sb-cslider-track"),ds=Array.prototype.slice.call(c.querySelectorAll(".sb-af-dots button,.sg-dots button")),hov=false;
if(!tr||!tr.children.length)return;
function step(){return tr.children[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(tr).columnGap)||10)}
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
var pre=el.getAttribute("data-prefix")||"",suf=el.getAttribute("data-suffix")||"",sep=el.getAttribute("data-sep")||"";
function fmt(n){var t=String(n);if(sep)t=t.replace(/\\B(?=(\\d{3})+(?!\\d))/g,sep);return pre+t+suf}
off.push(function(){el.removeAttribute("data-cnt-ready");el.__sbn=null;el.textContent=orig});
if(!io)return;
el.textContent=fmt(0);
el.__sbn=function(){
var t0=null;
function step(t){
if(t0===null)t0=t;
var k=Math.min(1,(t-t0)/ms);
el.textContent=fmt(Math.round(end*k));
if(k<1)requestAnimationFrame(step);
}
requestAnimationFrame(step);
};
io.observe(el);
});
document.querySelectorAll("[data-sb-slider]").forEach(function(box){
if(box.getAttribute("data-sl-ready"))return;
box.setAttribute("data-sl-ready","1");
var track=box.querySelector(".cp-slider-track,.cm-track"),dots=Array.prototype.slice.call(box.querySelectorAll(".cp-dot,.cm-dot"));
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
/* SIM: carrossel em laço ([data-si-car]) e Esc fecha o menu lateral (#sb-burger) */
document.querySelectorAll("[data-si-car]").forEach(function(box){
if(box.getAttribute("data-si-ready"))return;
box.setAttribute("data-si-ready","1");
var view=box.querySelector(".si-car-view"),track=box.querySelector(".si-car-track"),dotsEl=box.querySelector(".si-car-dots");
var orig=Array.prototype.slice.call(track.children),n=orig.length;
var pb=box.querySelector(".si-car-arrow.prev"),nb=box.querySelector(".si-car-arrow.next");
var speed=Number(box.getAttribute("data-speed"))||500,delay=Number(box.getAttribute("data-delay"))||5000;
var pause=box.getAttribute("data-pause")!=="0",max=Number(box.getAttribute("data-max"))||1;
var ac=new AbortController(),opt={signal:ac.signal};
var cur=0,t=null,clones=[],pv=1,stat=false,dots=[],hov=false;
function pvNow(){return Math.max(1,parseInt(getComputedStyle(box).getPropertyValue("--si-pv"),10)||1)}
function step(){return orig.length>1?orig[1].offsetLeft-orig[0].offsetLeft:orig[0].offsetWidth}
function place(px,anim){track.style.transition=anim?"transform "+speed+"ms ease":"none";track.style.transform="translate3d("+px+"px,0,0)"}
function mark(){dots.forEach(function(d,k){d.classList.toggle("on",k===cur%n)})}
function go(i,anim){cur=i;place(-i*step(),anim);mark()}
function wrap(){if(cur>=n){go(cur-n,false);track.offsetHeight}}
function stop(){clearTimeout(t);t=null}
function play(){stop();if(reduce||stat)return;t=setTimeout(function(){wrap();go(cur+1,true);play()},delay+speed)}
function build(){
clones.forEach(function(c){c.remove()});clones=[];
pv=pvNow();stat=n<=pv;
box.classList.toggle("is-static",stat);
if(stat){track.style.transform="";stop();return}
clones=orig.slice(0,Math.min(n,max)).map(function(s){var c=s.cloneNode(true);c.setAttribute("aria-hidden","true");track.appendChild(c);return c});
if(dotsEl&&box.getAttribute("data-dots")&&!dots.length){
for(var k=0;k<n;k++){(function(k){var b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Slide "+(k+1));b.addEventListener("click",function(){wrap();go(k,true);play()},opt);dotsEl.appendChild(b);dots.push(b)})(k)}
}
go(cur%n,false);
}
build();
track.addEventListener("transitionend",function(e){if(e.target===track)wrap()},opt);
if(nb)nb.addEventListener("click",function(){wrap();go(cur+1,true);play()},opt);
if(pb)pb.addEventListener("click",function(){if(cur===0){go(n,false);track.offsetHeight}go(cur-1,true);play()},opt);
if(pause){box.addEventListener("mouseenter",function(){hov=true;stop()},opt);box.addEventListener("mouseleave",function(){hov=false;play()},opt)}
window.addEventListener("resize",function(){if(pvNow()!==pv||stat)build();else go(cur,false)},opt);
var sx=null,dx=0,moved=false;
track.addEventListener("dragstart",function(e){e.preventDefault()},opt);
track.addEventListener("pointerdown",function(e){if(stat)return;wrap();sx=e.clientX;dx=0;moved=false;stop()},opt);
window.addEventListener("pointermove",function(e){if(sx===null)return;dx=e.clientX-sx;if(Math.abs(dx)>5)moved=true;place(-cur*step()+dx,false)},opt);
function release(){if(sx===null)return;sx=null;if(dx<-40)go(cur+1,true);else if(dx>40){if(cur===0){go(n,false);track.offsetHeight}go(cur-1,true)}else go(cur,true);if(!hov)play()}
window.addEventListener("pointerup",release,opt);
window.addEventListener("pointercancel",release,opt);
track.addEventListener("click",function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},{capture:true,signal:ac.signal});
play();
off.push(function(){stop();ac.abort();clones.forEach(function(c){c.remove()});dots.forEach(function(d){d.remove()});box.removeAttribute("data-si-ready");box.classList.remove("is-static");track.style.transition="";track.style.transform=""});
});
var siBurger=document.getElementById("sb-burger");
if(siBurger&&document.querySelector(".si-drawer,.pg-drop")){
var siKey=function(e){if(e.key==="Escape")siBurger.checked=false};
document.addEventListener("keydown",siKey);
off.push(function(){document.removeEventListener("keydown",siKey)});
}
/* PagaTG: o menu suspenso fecha ao clicar num item (âncora da própria página não recarrega) */
document.querySelectorAll(".pg-drop a").forEach(function(a){
var pgClose=function(){var b=document.getElementById("sb-burger");if(b)b.checked=false};
a.addEventListener("click",pgClose);
off.push(function(){a.removeEventListener("click",pgClose)});
});
/* O Outro Lado da Internet: a capa do vídeo vira o player no mesmo lugar, com autoplay */
document.querySelectorAll("[data-ol-video]").forEach(function(a){
var go=function(e){
var src=a.getAttribute("data-ol-video")||"";
if(!/^https:\\/\\/(player\\.vimeo\\.com\\/video\\/|www\\.youtube-nocookie\\.com\\/embed\\/)/.test(src))return;
e.preventDefault();
var f=document.createElement("iframe");
f.src=src+(src.indexOf("?")<0?"?":"&")+"autoplay=1";
f.allow="autoplay; fullscreen; picture-in-picture";f.allowFullscreen=true;f.title="Vídeo";
a.parentNode.replaceChild(f,a);
off.push(function(){if(f.parentNode)f.parentNode.replaceChild(a,f)});
};
a.addEventListener("click",go);
off.push(function(){a.removeEventListener("click",go)});
});
/* Lottie: o player (lottie_light) só é baixado quando a página tem [data-sb-lottie] */
var lots=document.querySelectorAll("[data-sb-lottie]");
if(lots.length&&!reduce){
var anims=[];
off.push(function(){anims.forEach(function(a){try{a.destroy()}catch(e){}});anims=[]});
var startLot=function(){
lots.forEach(function(el){
if(el.getAttribute("data-lot-ready")||!window.lottie)return;
el.setAttribute("data-lot-ready","1");
var url=el.getAttribute("data-sb-lottie")||"";
if(!/^(https?:\\/\\/|\\/)/.test(url))return;
try{anims.push(window.lottie.loadAnimation({container:el,renderer:"svg",loop:el.getAttribute("data-loop")!=="no",autoplay:el.getAttribute("data-autoplay")!=="no",path:url}));var a=anims[anims.length-1];a.setSpeed(Number(el.getAttribute("data-speed"))||1)}catch(e){}
});
};
off.push(function(){lots.forEach(function(el){el.removeAttribute("data-lot-ready");el.textContent=""})});
if(window.lottie)startLot();
else{
var ls=document.getElementById("sb-lottie-js");
if(!ls){ls=document.createElement("script");ls.id="sb-lottie-js";ls.async=true;ls.src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js";document.head.appendChild(ls)}
ls.addEventListener("load",startLot);
}
}
/* Seguidores em Alta: cabeçalho transparente -> branco após 60px; some ao descer e volta ao subir */
document.querySelectorAll(".sg-head").forEach(function(h){
var last=0,ticking=false;
function y(e){var t=e&&e.target;return t&&t!==document&&typeof t.scrollTop==="number"?t.scrollTop:(window.pageYOffset||0)}
function upd(e){
ticking=false;
var v=y(e),open=h.querySelector(".sb-burger-input");
h.classList.toggle("is-scrolled",v>60);
if(v>60&&v>last&&!(open&&open.checked))h.classList.add("is-hidden");
else if(v<last||v<=60)h.classList.remove("is-hidden");
last=v;
}
function on(e){if(!ticking){ticking=true;requestAnimationFrame(function(){upd(e)})}}
document.addEventListener("scroll",on,{capture:true,passive:true});
off.push(function(){document.removeEventListener("scroll",on,{capture:true});h.classList.remove("is-scrolled","is-hidden")});
});
/* Seguidores em Alta: "carregar mais" nas listas (sem JS aparece tudo) */
document.querySelectorAll(".sg-grid-wrap[data-step]").forEach(function(w){
var step=Number(w.getAttribute("data-step"))||6,btn=w.querySelector(".sg-more");
function hid(){return Array.prototype.filter.call(w.querySelectorAll("[data-sg-hide]"),function(c){return c.style.display!=="none"})}
function shown(){return Array.prototype.filter.call(w.querySelectorAll(".sb-post-card:not([data-sg-hide])"),function(c){return c.style.display!=="none"}).length}
function reveal(){
var h=hid();
for(var i=0;i<step&&i<h.length;i++)h[i].removeAttribute("data-sg-hide");
if(btn&&!hid().length)btn.hidden=true;
}
function click(e){if(e.target.closest(".sg-more"))reveal()}
w.addEventListener("click",click);
var t=setTimeout(function(){if(shown()<step)reveal();if(btn)btn.hidden=!hid().length},0);
off.push(function(){clearTimeout(t);w.removeEventListener("click",click);if(btn)btn.hidden=false});
});
/* Seguidores em Alta: o seletor de categoria navega direto */
function selNav(e){
var s=e.target;
if(!s||!s.matches||!s.matches(".sg-search select,.sg-side-cats select")||!s.value)return;
var o=s.options[s.selectedIndex],u=o&&o.getAttribute("data-href");
if(u)location.href=u;
}
document.addEventListener("change",selNav);
off.push(function(){document.removeEventListener("change",selNav)});
/* Holofote: data relativa dos cartões ("há 10 horas"); o HTML estático leva a data absoluta */
document.querySelectorAll("[data-hf-ago]").forEach(function(el){
var t=Date.parse(el.getAttribute("datetime")||"");
if(isNaN(t))return;
var s=(Date.now()-t)/1000,n,u;
if(s<0)return;
if(s<3600){n=Math.max(1,Math.floor(s/60));u=n===1?"minuto":"minutos"}
else if(s<86400){n=Math.floor(s/3600);u=n===1?"hora":"horas"}
else if(s<604800){n=Math.floor(s/86400);u=n===1?"dia":"dias"}
else if(s<2592000){n=Math.floor(s/604800);u=n===1?"semana":"semanas"}
else{n=Math.floor(s/2592000);u=n===1?"mês":"meses"}
el.textContent="há "+n+" "+u;
});
/* Zyrion: data de hoje, slider do destaque, carrossel das seções, busca em tela cheia */
document.querySelectorAll("[data-sb-today]").forEach(function(el){
try{el.textContent=new Intl.DateTimeFormat("pt-BR",{day:"numeric",month:"long",year:"numeric"}).format(new Date())}catch(x){}
});
function zyRun(box,trackSel,opt){
if(box.getAttribute("data-zy-ready"))return;
box.setAttribute("data-zy-ready","1");
var track=box.querySelector(trackSel);
if(!track||track.children.length<2){return}
var n=track.children.length,cur=0,t=null,hov=false,ac=new AbortController(),o={signal:ac.signal};
var speed=Number(box.getAttribute("data-speed"))||opt.speed,delay=Number(box.getAttribute("data-delay"))||opt.delay;
var clone=null;
if(opt.loop){clone=track.children[0].cloneNode(true);clone.setAttribute("aria-hidden","true");track.appendChild(clone)}
function per(){return Number(getComputedStyle(box).getPropertyValue("--zy-per"))||1}
function span(){var a=track.children[0],b=track.children[1];return b.offsetLeft-a.offsetLeft}
function maxI(){return opt.loop?n:Math.max(0,n-per())}
function place(i,anim){track.style.transition=anim?"transform "+speed+"ms ease":"none";track.style.transform="translate3d("+(-i*span())+"px,0,0)"}
function go(i,anim){cur=i;place(i,anim)}
function fix(){if(opt.loop&&cur>=n){go(0,false);track.offsetHeight}}
function next(){fix();if(!opt.loop&&cur>=maxI()){go(0,true)}else go(cur+1,true)}
function prev(){fix();if(cur<=0){if(opt.loop){go(n,false);track.offsetHeight;go(n-1,true)}else go(maxI(),true)}else go(cur-1,true)}
function stop(){clearTimeout(t);t=null}
function play(){stop();if(reduce||hov)return;t=setTimeout(function(){next();play()},delay+speed)}
track.addEventListener("transitionend",fix,o);
if(opt.hover){box.addEventListener("mouseenter",function(){hov=true;stop()},o);box.addEventListener("mouseleave",function(){hov=false;play()},o)}
var arrows=box.querySelectorAll(".zy-car-nav button");
if(arrows[0])arrows[0].addEventListener("click",function(){prev();play()},o);
if(arrows[1])arrows[1].addEventListener("click",function(){next();play()},o);
window.addEventListener("resize",function(){go(Math.min(cur,maxI()),false)},o);
var sx=null,dx=0,moved=false;
track.addEventListener("dragstart",function(e){e.preventDefault()},o);
track.addEventListener("pointerdown",function(e){fix();sx=e.clientX;dx=0;moved=false;stop();track.style.cursor="grabbing"},o);
window.addEventListener("pointermove",function(e){if(sx===null)return;dx=e.clientX-sx;if(Math.abs(dx)>5)moved=true;place(cur-dx/span(),false)},o);
function release(){if(sx===null)return;sx=null;track.style.cursor="";if(dx<-40)next();else if(dx>40)prev();else go(cur,true);play()}
window.addEventListener("pointerup",release,o);
window.addEventListener("pointercancel",release,o);
track.addEventListener("click",function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},{capture:true,signal:ac.signal});
play();
off.push(function(){stop();ac.abort();if(clone)clone.remove();track.style.transition="";track.style.transform="";track.style.cursor="";box.removeAttribute("data-zy-ready")});
}
document.querySelectorAll("[data-zy-slider]").forEach(function(b){zyRun(b,".zy-sl-track",{loop:true,speed:800,delay:5000,hover:false})});
document.querySelectorAll("[data-zy-car]").forEach(function(b){zyRun(b,".zy-car-track",{loop:false,speed:500,delay:5000,hover:true})});
var zySearch=document.getElementById("zy-search");
if(zySearch){
var zyKey=function(e){if(e.key==="Escape"&&zySearch.checked)zySearch.checked=false};
var zyChg=function(){if(zySearch.checked){var i=document.querySelector(".zy-overlay input[type=search]");if(i)setTimeout(function(){i.focus()},60)}};
document.addEventListener("keydown",zyKey);
zySearch.addEventListener("change",zyChg);
off.push(function(){document.removeEventListener("keydown",zyKey);zySearch.removeEventListener("change",zyChg)});
}
/* Marketing Raiz: paginação numerada da grade (sem JS aparece tudo) */
document.querySelectorAll("[data-mr-pages]").forEach(function(w){
var per=Number(w.getAttribute("data-mr-pages"))||10,pager=w.querySelector(".mr-pager");
if(!pager||w.getAttribute("data-mr-ready"))return;
w.setAttribute("data-mr-ready","1");
var cur=1;
function cards(){return Array.prototype.filter.call(w.querySelectorAll(".mr-card"),function(c){return c.style.display!=="none"})}
function show(n){
var list=cards(),pages=Math.max(1,Math.ceil(list.length/per));
cur=Math.min(Math.max(1,n),pages);
list.forEach(function(c,i){if(Math.floor(i/per)+1===cur)c.removeAttribute("data-mr-hide");else c.setAttribute("data-mr-hide","")});
Array.prototype.forEach.call(pager.children,function(b,k){b.hidden=k>=pages;b.classList.toggle("on",k+1===cur)});
}
function click(e){
var b=e.target.closest&&e.target.closest("[data-mr-go]");
if(!b)return;
show(Number(b.getAttribute("data-mr-go")));
try{w.scrollIntoView({behavior:"smooth",block:"start"})}catch(x){}
}
pager.addEventListener("click",click);
show(1);
off.push(function(){
w.removeAttribute("data-mr-ready");
pager.removeEventListener("click",click);
w.querySelectorAll("[data-mr-hide]").forEach(function(c){c.removeAttribute("data-mr-hide")});
Array.prototype.forEach.call(pager.children,function(b,k){b.hidden=false;b.classList.toggle("on",k===0)});
});
});
/* Marketing Raiz: carrossel de mídia com miniaturas (efeito slide, autoplay, laço, pausa no hover, setas) */
document.querySelectorAll("[data-mr-media]").forEach(function(box){
if(box.getAttribute("data-mr-ready"))return;
box.setAttribute("data-mr-ready","1");
var track=box.querySelector(".mr-media-track"),th=Array.prototype.slice.call(box.querySelectorAll(".mr-thumb-btn")),n=track?track.children.length:0;
off.push(function(){box.removeAttribute("data-mr-ready")});
if(n<2)return;
var sec=(Number(box.getAttribute("data-mr-media"))||5)*1000,speed=Number(box.getAttribute("data-speed"))||500;
var cur=0,t=null,ac=new AbortController(),o={signal:ac.signal};
track.style.transition="transform "+speed+"ms ease";
function go(i){cur=(i+n)%n;track.style.transform="translate3d("+(-cur*100)+"%,0,0)";th.forEach(function(b,k){b.classList.toggle("on",k===cur)})}
function stop(){clearTimeout(t);t=null}
function play(){stop();if(reduce)return;t=setTimeout(function(){go(cur+1);play()},sec)}
th.forEach(function(b,k){b.addEventListener("click",function(){go(k);play()},o)});
box.querySelectorAll(".mr-arrows button").forEach(function(b,k){b.addEventListener("click",function(){go(cur+(k===0?-1:1));play()},o)});
box.addEventListener("mouseenter",stop,o);
box.addEventListener("mouseleave",play,o);
go(0);
play();
off.push(function(){stop();ac.abort();track.style.transition="";track.style.transform="";th.forEach(function(b,k){b.classList.toggle("on",k===0)})});
});
/* Marketing Raiz: botão que aparece depois de N segundos (e então pulsa) */
document.querySelectorAll("[data-mr-delay]").forEach(function(el){
if(el.getAttribute("data-mr-ready"))return;
el.setAttribute("data-mr-ready","1");
var t=setTimeout(function(){el.classList.add("on")},(Number(el.getAttribute("data-mr-delay"))||0)*1000);
off.push(function(){clearTimeout(t);el.classList.remove("on");el.removeAttribute("data-mr-ready")});
});
/* Marketing Raiz: telas do funil e do quiz (fade de ~600 ms entre telas; a tela "analisando" roda a barra e avança sozinha) */
document.querySelectorAll("[data-mr-flow]").forEach(function(fl){
if(fl.getAttribute("data-mr-ready"))return;
fl.setAttribute("data-mr-ready","1");
var sc=Array.prototype.filter.call(fl.children,function(c){return c.classList.contains("mr-step")});
if(!sc.length)return;
var cur=0,busy=false,timers=[],iv=null;
function clear(){timers.forEach(clearTimeout);timers=[];if(iv){clearInterval(iv);iv=null}}
function bar(b,i){
var fill=b.querySelector(".mr-bar-fill"),v=Number(b.getAttribute("data-start"));
if(!isFinite(v))v=5;
var st=Number(b.getAttribute("data-step"))||3.7,ms=Number(b.getAttribute("data-interval"))||250;
b.classList.remove("done");
function paint(){var w=Math.min(100,v);fill.style.width=w+"%";fill.textContent=(Math.round(w*10)/10)+"%"}
paint();
iv=setInterval(function(){
v+=st;
if(v>=100){
v=100;clearInterval(iv);iv=null;paint();b.classList.add("done");
timers.push(setTimeout(function(){go(i+1)},2000));
return;
}
paint();
},ms);
}
function enter(i){
var s=sc[i];
s.classList.add("show");
void s.offsetHeight;
s.classList.add("vis");
busy=false;
var b=s.querySelector(".mr-bar");
if(b)bar(b,i);
}
function go(i){
if(i>=sc.length)return;
busy=true;
var from=sc[cur];
clear();
from.classList.remove("vis");
timers.push(setTimeout(function(){from.classList.remove("show");cur=i;enter(i)},600));
}
function click(e){
var b=e.target.closest&&e.target.closest("[data-mr-next]");
if(!b||!fl.contains(b)||busy)return;
go(cur+1);
}
fl.addEventListener("click",click);
enter(0);
off.push(function(){
clear();
fl.removeEventListener("click",click);
fl.removeAttribute("data-mr-ready");
sc.forEach(function(s){s.classList.remove("show","vis")});
fl.querySelectorAll(".mr-bar").forEach(function(b){b.classList.remove("done");var f=b.querySelector(".mr-bar-fill");if(f){f.style.width="";f.textContent=(b.getAttribute("data-start")||"5")+"%"}});
});
});
/* Voltar ao topo (scrollTop): aparece depois de data-at px de rolagem; clique rola até o topo (easeInOutExpo, 1000ms) */
document.querySelectorAll("[data-sb-top]").forEach(function(b){
if(b.getAttribute("data-top-ready"))return;
b.setAttribute("data-top-ready","1");
var at=Number(b.getAttribute("data-at")),src=null,raf=0;
if(!isFinite(at))at=200;
function pos(t){return t&&t!==document&&typeof t.scrollTop==="number"?t.scrollTop:(window.pageYOffset||0)}
function upd(e){if(e&&e.target&&e.target!==document&&typeof e.target.scrollTop==="number")src=e.target;b.classList.toggle("on",pos(e&&e.target)>at)}
function ease(k){return k===0?0:k===1?1:k<0.5?Math.pow(2,20*k-10)/2:(2-Math.pow(2,-20*k+10))/2}
function to(y){if(src)src.scrollTop=y;else window.scrollTo(0,y)}
function click(e){
e.preventDefault();
cancelAnimationFrame(raf);
var from=src?src.scrollTop:(window.pageYOffset||0);
if(reduce||from<=0){to(0);return}
var t0=null;
function step(t){
if(t0===null)t0=t;
var k=Math.min(1,(t-t0)/1000);
to(from*(1-ease(k)));
if(k<1)raf=requestAnimationFrame(step);
}
raf=requestAnimationFrame(step);
}
document.addEventListener("scroll",upd,{capture:true,passive:true});
b.addEventListener("click",click);
upd();
off.push(function(){cancelAnimationFrame(raf);document.removeEventListener("scroll",upd,{capture:true});b.removeEventListener("click",click);b.removeAttribute("data-top-ready");b.classList.remove("on")});
});
return function(){off.forEach(function(f){f()})};
};
})();`;
