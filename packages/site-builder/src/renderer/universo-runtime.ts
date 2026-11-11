/**
 * Movimento do template Universo (hub de links em cartas). É uma string porque roda de duas formas, como o
 * `margem-runtime.ts`: inline no HTML publicado (só nas páginas com um bloco `data-uv`) e injetado pelo `FxRuntime`
 * na prévia. Define `window.sbUniverso(raiz?)`, que liga cada `[data-uv]` e devolve a função que desliga tudo.
 *
 * `uvStage`: carregamento (2,5 s; com `data-once="1"` só na primeira visita da sessão, chave `uv_seen`) → leque
 * (1º clique seleciona, 2º vira as três cartas e abre o carrossel 900 ms depois) → carrossel (arrastar com Pointer
 * Events, pontos, ← →, cronômetro que volta ao máximo a cada clique e, ao zerar, devolve o leque do início) e virada
 * frente/verso de cada opção. Contagem (`uvStage` e `uvPanel`): links `a[data-uv-go]` abrem a camada `.uv-cd` com o
 * `href` do próprio link (nunca da query string), contam `data-count` segundos e fazem `location.assign`; Voltar e Esc
 * cancelam. Com `prefers-reduced-motion` o palco fica estático (lista empilhada) e só a contagem liga, sem animação.
 * Em miniatura escalada (galeria de templates) mostra o leque parado. Não roda no editor (`mode="edit"`).
 * Ao mudar o script, suba `UV_VERSION` (a prévia troca a versão carregada sem recarregar).
 */
export const UV_VERSION = 2;

export const UNIVERSO_RUNTIME = `(function(){
if(window.sbUniverso&&window.__sbUvV===${UV_VERSION})return;
window.__sbUvV=${UV_VERSION};
window.sbUniverso=function(root){
var off=[];
var mm=function(q){return window.matchMedia?window.matchMedia(q).matches:false};
var reduce=mm("(prefers-reduced-motion: reduce)");
var arr=function(l){return Array.prototype.slice.call(l||[])};
var on=function(el,ev,fn,o){el.addEventListener(ev,fn,o);off.push(function(){el.removeEventListener(ev,fn,o)})};
var later=function(fn,ms){var t=setTimeout(fn,ms);off.push(function(){clearTimeout(t)});return t};
var pad=function(n){return(n<10?"0":"")+n};
var scaled=function(el){var w=el.offsetWidth;return w>0&&Math.abs(el.getBoundingClientRect().width/w-1)>.02};
var store=function(k,v){try{if(arguments.length<2)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){}return null};

function countdown(b){
var cd=b.querySelector(".uv-cd");if(!cd)return;
var total=Math.max(0,parseInt(b.getAttribute("data-count")||"0",10)||0);
var box=cd.querySelector(".uv-count"),ttl=cd.querySelector(".uv-cd-title"),back=cd.querySelector(".uv-cd-back");
var goText=cd.getAttribute("data-go")||"";
var iv=null,tm=null,url="",from=null,n=0,spans={};
function stop(){if(iv){clearInterval(iv);iv=null}if(tm){clearTimeout(tm);tm=null}}
off.push(stop);
function draw(){
if(n<=0){box.innerHTML="";spans={};var g=document.createElement("span");g.className="uv-num go";g.textContent=goText;box.appendChild(g);return}
var want=[n+2,n+1,n].filter(function(k){return k>=1&&k<=Math.min(5,total)});
Object.keys(spans).forEach(function(k){if(want.indexOf(+k)<0){spans[k].remove();delete spans[k]}});
want.forEach(function(k,i){var s=spans[k];if(!s){s=document.createElement("span");s.textContent=k+"\\u2026";spans[k]=s}s.className="uv-num "+(i===want.length-1?"cur":"old");box.appendChild(s)});
}
function close(){if(cd.hidden)return;stop();cd.hidden=true;b.dispatchEvent(new CustomEvent("uv:cdclose"));if(from&&from.focus)from.focus()}
function open(u,title,a){
url=u;from=a;n=Math.min(total,99);
if(n<=0){location.assign(url);return}
stop();box.innerHTML="";spans={};
if(ttl)ttl.textContent=title;
cd.hidden=false;b.dispatchEvent(new CustomEvent("uv:cdopen"));
draw();if(back)back.focus();
iv=setInterval(function(){n-=1;draw();if(n<=0){clearInterval(iv);iv=null;tm=setTimeout(function(){tm=null;location.assign(url)},900)}},1000);
}
on(b,"click",function(e){
var a=e.target&&e.target.closest?e.target.closest("a[data-uv-go]"):null;
if(!a||!b.contains(a)||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
if(!/^https?:/i.test(a.href))return;
e.preventDefault();e.stopPropagation();
open(a.href,a.getAttribute("data-uv-title")||"",a);
});
if(back)on(back,"click",function(e){e.preventDefault();close()});
on(document,"keydown",function(e){if(e.key==="Escape"&&!cd.hidden){e.preventDefault();close()}});
}

function stage(b){
var fan=b.querySelector(".uv-fan"),cardsBox=b.querySelector(".uv-cards"),cards=arr(b.querySelectorAll(".uv-card"));
var car=b.querySelector(".uv-car"),view=b.querySelector(".uv-view"),track=b.querySelector(".uv-track");
var slides=arr(b.querySelectorAll(".uv-slide")),dots=arr(b.querySelectorAll(".uv-dot"));
var loader=b.querySelector(".uv-loader"),tOut=b.querySelector(".uv-timer-t"),bar=b.querySelector(".uv-timer-bar i");
var copy=b.querySelector(".uv-copy");
if(!fan||!car||!view||!track)return;
var initial=b.getAttribute("data-state");
b.classList.add("uv-live");
off.push(function(){b.classList.remove("uv-live","uv-still");if(initial)b.setAttribute("data-state",initial);else b.removeAttribute("data-state");fan.classList.remove("is-enter","is-flip","is-words");cardsBox.classList.remove("is-in")});
var setState=function(s){b.setAttribute("data-state",s)};
/* o palco corta o que passa da tela; o foco numa carta não pode rolá-lo (overflow: clip onde houver) */
on(b,"scroll",function(){b.scrollTop=0;b.scrollLeft=0});
if(scaled(b)){b.classList.add("uv-still");setState("fan");cardsBox.classList.add("is-in");return}

/* leque */
var sel=null,flipping=false,io=null;
function words(){
fan.classList.remove("is-words");
if(io){io.disconnect();io=null}
if(!copy||!window.IntersectionObserver){void fan.offsetWidth;fan.classList.add("is-words");return}
io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){void fan.offsetWidth;fan.classList.add("is-words");io.disconnect();io=null}})},{threshold:.2});
io.observe(copy);
}
off.push(function(){if(io)io.disconnect()});
function startFan(enter){
flipping=false;sel=null;
cards.forEach(function(c){c.classList.remove("is-sel")});
fan.classList.remove("is-flip","is-enter");
cardsBox.classList.remove("is-in");
setState("fan");
void fan.offsetWidth;
if(enter)fan.classList.add("is-enter");
requestAnimationFrame(function(){requestAnimationFrame(function(){cardsBox.classList.add("is-in")})});
words();
}
cards.forEach(function(c){
on(c,"click",function(){
if(b.getAttribute("data-state")!=="fan"||flipping)return;
if(sel!==c){if(sel)sel.classList.remove("is-sel");sel=c;c.classList.add("is-sel");return}
c.classList.remove("is-sel");sel=null;flipping=true;
fan.classList.add("is-flip");
later(openCarousel,900);
});
});

/* carrossel */
var idx=0,n=slides.length,T=Math.max(0,parseInt(b.getAttribute("data-timer")||"0",10)||0),left=T,iv=null;
function place(dx,anim){track.style.transition=anim?"":"none";track.style.transform="translateX(calc("+(-idx*100)+"% + "+(dx||0)+"px))"}
function go(i){
idx=Math.max(0,Math.min(n-1,i));place(0,true);
dots.forEach(function(d,k){d.classList.toggle("on",k===idx);if(k===idx)d.setAttribute("aria-current","true");else d.removeAttribute("aria-current")});
slides.forEach(function(s,k){if(k===idx)s.removeAttribute("aria-hidden");else s.setAttribute("aria-hidden","true");arr(s.querySelectorAll("a,button")).forEach(function(x){if(k===idx)x.removeAttribute("tabindex");else x.setAttribute("tabindex","-1")})});
}
function drawTimer(){if(!tOut)return;tOut.textContent=pad(Math.floor(left/60))+":"+pad(left%60);if(bar)bar.style.setProperty("--uv-p",T?String(left/T):"1")}
function stopTimer(){if(iv){clearInterval(iv);iv=null}}
off.push(stopTimer);
function startTimer(){stopTimer();if(!T)return;left=T;drawTimer();iv=setInterval(function(){left=Math.max(0,left-1);drawTimer();if(left===0){stopTimer();timeout()}},1000)}
function bump(){if(iv){left=T;drawTimer()}}
function resetFaces(){arr(b.querySelectorAll(".uv-opt")).forEach(function(o){o.classList.remove("is-back");arr(o.querySelectorAll(".uv-face")).forEach(function(f){f.classList.remove("is-in","is-out")})})}
function openCarousel(){
flipping=false;resetFaces();
setState("carousel");
go(0);
startTimer();
try{car.focus({preventScroll:true})}catch(e){}
}
function timeout(){
var cd=b.querySelector(".uv-cd");if(cd&&!cd.hidden)return;
startFan(false);
}
on(b,"uv:cdopen",stopTimer);
on(b,"uv:cdclose",function(){if(b.getAttribute("data-state")==="carousel")startTimer()});
on(car,"pointerdown",bump,true);
on(car,"keydown",function(e){
bump();
if(e.key==="ArrowLeft"){e.preventDefault();go(idx-1)}
else if(e.key==="ArrowRight"){e.preventDefault();go(idx+1)}
});
dots.forEach(function(d,k){on(d,"click",function(){go(k)})});

/* arrastar: o mouse só captura depois de 6 px; o toque, logo de cara (touch-action: pan-y) */
var st={active:false},swallow=false;
function end(e){
if(!st.active)return;
st.active=false;
if(st.cap&&view.hasPointerCapture&&view.hasPointerCapture(st.id))view.releasePointerCapture(st.id);
var j=idx;
if(st.dx<-.18*st.w&&idx<n-1)j=idx+1;else if(st.dx>.18*st.w&&idx>0)j=idx-1;
if(Math.abs(st.dx)>6)swallow=true;
go(j);
}
on(view,"pointerdown",function(e){
if(e.button)return;
st={active:true,x0:e.clientX,w:view.clientWidth||1,dx:0,cap:false,id:e.pointerId,mouse:e.pointerType==="mouse"};
swallow=false;
if(!st.mouse){try{view.setPointerCapture(e.pointerId);st.cap=true}catch(x){}}
});
on(view,"pointermove",function(e){
if(!st.active)return;
var dx=e.clientX-st.x0;
if(st.mouse&&!st.cap){if(Math.abs(dx)<6)return;try{view.setPointerCapture(e.pointerId)}catch(x){}st.cap=true}
st.dx=dx;place(dx,false);
});
on(view,"pointerup",end);
on(view,"pointercancel",end);
on(view,"pointerleave",function(e){if(st.active&&!st.cap)end(e)});
/* depois de arrastar, o clique que o navegador manda no fim não aciona botão nem link */
on(view,"click",function(e){if(swallow){swallow=false;e.preventDefault();e.stopPropagation()}},true);
/* o toque com captura manda o clique para o carrossel: repassa ao botão/link que estava embaixo do dedo */
on(view,"pointerup",function(e){
if(e.pointerType==="mouse"||Math.abs(st.dx||0)>6)return;
var t=document.elementFromPoint(e.clientX,e.clientY);
var hit=t&&t.closest?t.closest("a,button"):null;
if(hit&&view.contains(hit)&&hit!==e.target&&!(e.target.closest&&e.target.closest("a,button"))){swallow=true;later(function(){swallow=false;hit.click()},0)}
});

/* frente ↔ verso */
var busy=false;
function flipTo(opt,toBack){
if(busy)return;
var from=opt.querySelector(toBack?".uv-front":".uv-verso"),to=opt.querySelector(toBack?".uv-verso":".uv-front");
if(!from||!to)return;
busy=true;from.classList.add("is-out");
later(function(){
from.classList.remove("is-out");
opt.classList.toggle("is-back",toBack);
to.classList.add("is-in");
var f=to.querySelector("a,button");if(f)try{f.focus({preventScroll:true})}catch(e){}
later(function(){to.classList.remove("is-in");busy=false},380);
},380);
}
arr(b.querySelectorAll("[data-uv-flip]")).forEach(function(x){on(x,"click",function(){var o=x.closest(".uv-opt");if(o)flipTo(o,true)})});
arr(b.querySelectorAll("[data-uv-unflip]")).forEach(function(x){on(x,"click",function(){var o=x.closest(".uv-opt");if(o)flipTo(o,false)})});

/* carregamento */
if(b.getAttribute("data-once")==="1"&&store("uv_seen")){startFan(true);return}
setState("loader");
later(function(){
if(loader)loader.classList.add("is-out");
later(function(){if(loader)loader.classList.remove("is-out");store("uv_seen","1");startFan(true)},1000);
},2500);
}

arr((root||document).querySelectorAll("[data-uv]")).forEach(function(b){
if(b.classList.contains("uv-still"))return;
countdown(b);
if(b.getAttribute("data-uv")==="stage"&&!reduce)stage(b);
});
return function(){off.splice(0).forEach(function(f){f()})};
};
})();`;
