/**
 * Navegação sem recarregar a página (e cliques do carrossel de vídeos curtos, do popup de vídeo `[data-sb-video]` e do "Mostrar mais"): links internos do site são interceptados. Na prévia (app
 * router do Next) usa `window.next.router`; no site estático busca o HTML da rota e troca só a
 * raiz `.sb`, mantendo o histórico e o título. Qualquer falha cai na navegação normal.
 * Mesmo esquema do `FX_RUNTIME`: inline no HTML publicado e injetado pelo `FxRuntime` na prévia.
 */
export const NAV_RUNTIME = `(function(){
if(window.__sbNav===6)return;
if(window.__sbNavOff)window.__sbNavOff();
window.__sbNav=6;
var off=null,shown=location.pathname+location.search;
function rebind(){
if(!window.sbFx)return;
if(off)off();
off=window.sbFx();
}
function swap(u,push){
fetch(u,{headers:{Accept:"text/html"}}).then(function(r){
if(!r.ok||(r.headers.get("content-type")||"").indexOf("text/html")<0)throw 0;
return r.text();
}).then(function(h){
var d=new DOMParser().parseFromString(h,"text/html");
var n=d.querySelector(".sb"),o=document.querySelector(".sb");
if(!n||!o)throw 0;
if(push)history.pushState(null,"",u);
shown=location.pathname+location.search;
document.title=d.title;
o.replaceWith(n);
n.querySelectorAll("script").forEach(function(s){
var c=document.createElement("script");
c.textContent=s.textContent;
s.replaceWith(c);
});
rebind();
window.scrollTo(0,0);
}).catch(function(){location.href=u});
}
var reels=null;
function closeReel(){
if(!reels)return;
reels.box.remove();
document.documentElement.style.overflow=reels.ov;
reels=null;
}
function showReel(i){
var items=reels.items,n=items.length;
reels.i=(i+n)%n;
var it=items[reels.i],st=reels.stage;
st.textContent="";
var src=it.getAttribute("data-reel");
if(src.indexOf("https://www.youtube-nocookie.com/")===0){
var f=document.createElement("iframe");
f.src=src+(src.indexOf("?")<0?"?":"&")+"autoplay=1&playsinline=1&rel=0";
f.allow="autoplay; encrypted-media; picture-in-picture";
f.allowFullscreen=true;
st.appendChild(f);
}else{
var im=it.querySelector("img");
if(im){var c=document.createElement("img");c.src=im.currentSrc||im.src;c.alt="";st.appendChild(c)}
}
var cap=document.createElement("div");
cap.className="sb-reels-cap";
cap.textContent=it.getAttribute("data-title")||"";
st.appendChild(cap);
}
function openReel(a){
closeReel();
var root=a.closest(".sb");
if(!root)return;
var items=Array.prototype.slice.call(a.parentNode.querySelectorAll(".sb-short[data-reel]"));
var box=document.createElement("div");
box.className="sb-reels";
box.setAttribute("role","dialog");
box.setAttribute("aria-modal","true");
function btn(cls,label,txt){var b=document.createElement("button");b.type="button";b.className=cls;b.setAttribute("aria-label",label);b.textContent=txt;return b}
var stage=document.createElement("div");
stage.className="sb-reels-stage";
box.appendChild(btn("sb-reels-close","Fechar","\u00d7"));
box.appendChild(btn("sb-reels-nav sb-reels-prev","Anterior","\u2039"));
box.appendChild(stage);
box.appendChild(btn("sb-reels-nav sb-reels-next","Pr\u00f3ximo","\u203a"));
root.appendChild(box);
reels={box:box,items:items,stage:stage,i:0,ov:document.documentElement.style.overflow};
document.documentElement.style.overflow="hidden";
showReel(items.indexOf(a));
}
var vpop=null;
function closeVideo(){
if(!vpop)return;
vpop.box.remove();
document.documentElement.style.overflow=vpop.ov;
if(vpop.from&&vpop.from.focus)vpop.from.focus();
vpop=null;
}
function openVideo(a){
var src=a.getAttribute("data-sb-video")||"",root=a.closest(".sb");
if(!root||(src.indexOf("https://www.youtube-nocookie.com/embed/")!==0&&src.indexOf("https://player.vimeo.com/video/")!==0))return false;
closeVideo();
var box=document.createElement("div");
box.className="sb-vpop";
box.setAttribute("role","dialog");
box.setAttribute("aria-modal","true");
box.setAttribute("aria-label",a.getAttribute("aria-label")||"Vídeo");
var stage=document.createElement("div");
stage.className="sb-vpop-stage";
var x=document.createElement("button");
x.type="button";x.className="sb-vpop-close";x.setAttribute("aria-label","Fechar");x.textContent="×";
var f=document.createElement("iframe");
f.src=src+(src.indexOf("?")<0?"?":"&")+"autoplay=1&playsinline=1&rel=0";
f.allow="autoplay; encrypted-media; fullscreen; picture-in-picture";
f.allowFullscreen=true;
f.title=box.getAttribute("aria-label");
stage.appendChild(x);
stage.appendChild(f);
box.appendChild(stage);
root.appendChild(box);
vpop={box:box,from:a,ov:document.documentElement.style.overflow};
document.documentElement.style.overflow="hidden";
requestAnimationFrame(function(){box.classList.add("on");x.focus()});
return true;
}
var hfm=null;
function closeHf(){
if(!hfm)return;
hfm.box.classList.remove("on");
hfm.box.hidden=true;
document.documentElement.style.overflow=hfm.ov;
if(hfm.from&&hfm.from.focus)hfm.from.focus();
hfm=null;
}
function openHf(b){
var box=document.querySelector(".hf-modal");
if(!box)return;
closeHf();
var title=b.getAttribute("data-title")||document.title,url;
try{url=new URL(b.getAttribute("data-url")||location.href,location.href).href}catch(x){url=location.href}
var enc=encodeURIComponent;
var links={facebook:"https://www.facebook.com/sharer/sharer.php?u="+enc(url),twitter:"https://twitter.com/intent/tweet?url="+enc(url)+"&text="+enc(title),pinterest:"https://pinterest.com/pin/create/button/?url="+enc(url)+"&description="+enc(title),whatsapp:"https://api.whatsapp.com/send?text="+enc(title+" "+url),mail:"mailto:?subject="+enc(title)+"&body="+enc(url)};
box.querySelectorAll("[data-net]").forEach(function(a){a.setAttribute("href",links[a.getAttribute("data-net")]||"#")});
var t=box.querySelector(".hf-modal-title");
if(t)t.textContent=title;
box.hidden=false;
hfm={box:box,from:b,ov:document.documentElement.style.overflow};
document.documentElement.style.overflow="hidden";
requestAnimationFrame(function(){box.classList.add("on");var x=box.querySelector(".hf-modal-x");if(x)x.focus()});
}
var hfd=null;
function hfStart(e){
var d=e.target.closest&&e.target.closest(".hf-drawer"),bi=document.getElementById("sb-burger");
if(!d||!bi||!bi.checked)return;
hfd={x:e.touches[0].clientX,d:d,dx:0};
}
function hfMove(e){
if(!hfd)return;
var dx=e.touches[0].clientX-hfd.x;
if(dx<0){hfd.dx=dx;hfd.d.style.transition="none";hfd.d.style.transform="translateX("+dx+"px)"}
}
function hfEnd(){
if(!hfd)return;
var bi=document.getElementById("sb-burger");
hfd.d.style.transition="";
hfd.d.style.transform="";
if(hfd.dx<-60&&bi)bi.checked=false;
hfd=null;
}
function onKey(e){
if(hfm){
if(e.key==="Escape"){closeHf();return}
if(e.key==="Tab"){
var f=Array.prototype.slice.call(hfm.box.querySelectorAll("a[href],button")).filter(function(n){return n.offsetParent!==null||n===document.activeElement});
if(f.length){
var i=f.indexOf(document.activeElement);
if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
else if(!e.shiftKey&&(i<0||i===f.length-1)){e.preventDefault();f[0].focus()}
}
}
return;
}
if(vpop&&e.key==="Escape"){closeVideo();return}
if(!reels)return;
if(e.key==="Escape")closeReel();
else if(e.key==="ArrowLeft")showReel(reels.i-1);
else if(e.key==="ArrowRight")showReel(reels.i+1);
}
function onClick(e){
if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
if(hfm){
if(e.target.closest(".hf-modal-x")||e.target===hfm.box)closeHf();
return;
}
var hs=e.target.closest&&e.target.closest("[data-hf-share]");
if(hs){e.preventDefault();openHf(hs);return}
var hm=e.target.closest&&e.target.closest(".hf-more[data-step]");
if(hm){
var hw=hm.closest("[data-hf-more]"),hn=Number(hm.getAttribute("data-step"))||12,hg=hw&&hw.querySelector(".hf-grid");
if(hg){
var shown=0;
for(var hi=0;hi<hg.children.length&&shown<hn;hi++){
var hc=hg.children[hi];
if(!hc.hasAttribute("hidden"))continue;
hc.removeAttribute("hidden");
if(hc.classList.contains("hf-card"))shown++;
}
if(!hg.querySelector(".hf-card[hidden]"))hm.remove();
}
return;
}
if(vpop){
if(e.target.closest(".sb-vpop-close")||!e.target.closest(".sb-vpop-stage"))closeVideo();
return;
}
var vid=e.target.closest&&e.target.closest("a[data-sb-video]");
if(vid&&openVideo(vid)){e.preventDefault();return}
if(reels){
var t=e.target;
if(t.closest(".sb-reels-prev"))showReel(reels.i-1);
else if(t.closest(".sb-reels-next"))showReel(reels.i+1);
else if(t.closest(".sb-reels-close")||t===reels.box)closeReel();
if(t.closest(".sb-reels"))return;
}
var reel=e.target.closest&&e.target.closest(".sb-short[data-reel]");
if(reel){e.preventDefault();openReel(reel);return}
var arrow=e.target.closest&&e.target.closest(".sb-shorts-nav button,.sb-cslider-nav button");
if(arrow){
var box=arrow.closest(".sb-shorts,.sb-cslider"),track=box&&box.querySelector(".sb-shorts-track,.sb-cslider-track");
if(track){
var dir=Array.prototype.indexOf.call(arrow.parentNode.children,arrow)===0?-1:1;
var max=track.scrollWidth-track.clientWidth,loop=box.classList.contains("sb-cslider");
if(loop&&dir>0&&track.scrollLeft>=max-4)track.scrollTo({left:0,behavior:"smooth"});
else if(loop&&dir<0&&track.scrollLeft<=4)track.scrollTo({left:max,behavior:"smooth"});
else track.scrollBy({left:dir*track.clientWidth*0.8,behavior:"smooth"});
}
return;
}
var share=e.target.closest&&e.target.closest("[data-share]");
if(share){
e.preventDefault();
var su={facebook:"https://www.facebook.com/sharer/sharer.php?u=",twitter:"https://twitter.com/intent/tweet?url=",whatsapp:"https://api.whatsapp.com/send?text=",telegram:"https://t.me/share/url?url=",linkedin:"https://www.linkedin.com/shareArticle?mini=true&url="}[share.getAttribute("data-share")];
if(su)window.open(su+encodeURIComponent(location.href),"_blank","noopener,width=600,height=500");
return;
}
var zm=e.target.closest&&e.target.closest(".zy-more[data-step]");
if(zm){
var zw=zm.closest("[data-zy-archive]"),zs=Number(zm.getAttribute("data-step"))||6;
if(zw){
var zr=zw.querySelectorAll(".zy-card[hidden]");
for(var q=0;q<zs&&q<zr.length;q++)zr[q].removeAttribute("hidden");
if(zr.length<=zs)zm.remove();
}
return;
}
var more=e.target.closest&&e.target.closest(".sb-news-more[data-step]");
if(more){
var wrap=more.closest(".sb-news-feedwrap"),step=Number(more.getAttribute("data-step"))||3;
if(wrap){
var rows=wrap.querySelectorAll(".sb-news-row[hidden]");
for(var k=0;k<step&&k<rows.length;k++)rows[k].removeAttribute("hidden");
if(rows.length<=step)more.remove();
}
return;
}
var a=e.target.closest&&e.target.closest("a[href]");
if(!a||!a.closest(".sb"))return;
if(a.target&&a.target!=="_self"||a.hasAttribute("download"))return;
var u;
try{u=new URL(a.href,location.href)}catch(x){return}
if(u.origin!==location.origin||!/^https?:$/.test(u.protocol))return;
if(u.pathname===location.pathname&&u.search===location.search)return;
e.preventDefault();
var bi=document.getElementById("sb-burger");
if(bi)bi.checked=false;
var hsb=document.getElementById("hf-search");
if(hsb)hsb.checked=false;
var path=u.pathname+u.search+u.hash;
if(window.next&&window.next.router){window.next.router.push(path);window.scrollTo(0,0);return}
swap(path,true);
}
function onPop(){
if(window.next&&window.next.router)return;
// link #ancora também dispara popstate: só troca a página se o caminho mudou
if(location.pathname+location.search===shown)return;
swap(location.pathname+location.search,false);
}
document.addEventListener("keydown",onKey);
document.addEventListener("click",onClick);
window.addEventListener("popstate",onPop);
document.addEventListener("touchstart",hfStart,{passive:true});
document.addEventListener("touchmove",hfMove,{passive:true});
document.addEventListener("touchend",hfEnd);
window.__sbNavOff=function(){
document.removeEventListener("keydown",onKey);
document.removeEventListener("click",onClick);
window.removeEventListener("popstate",onPop);
document.removeEventListener("touchstart",hfStart);
document.removeEventListener("touchmove",hfMove);
document.removeEventListener("touchend",hfEnd);
closeHf();
closeReel();
closeVideo();
};
})();`;
