/**
 * Movimento do template Margem. É uma string porque roda de duas formas, como o `fx-runtime.ts`: inline no
 * HTML publicado (só nas páginas com um bloco `data-mg`) e injetado pelo `FxRuntime` na prévia. Define
 * `window.sbMargem()`, que liga cada bloco `[data-mg]` e devolve a função que desliga tudo.
 *
 * Sem dependências: o túnel é WebGL puro (planos com textura, névoa linear, profundidade de campo por viés
 * de mipmap), a "timeline com scrub" é uma lista de trechos avaliada no tempo do scroll e o pin é
 * `position: sticky` (CSS em `renderer/margem.ts`, ligado pela classe `mg-live`). Não roda no editor
 * (`mode="edit"` não monta o `FxRuntime`) nem em miniaturas escaladas (`transform: scale`): lá os blocos
 * ficam na versão estática. `prefers-reduced-motion`: sem scroll suave, sem cursor, sem suavização da
 * câmera e sem entradas; o túnel continua respondendo ao scroll.
 * Ao mudar o script, suba `MG_VERSION` (a prévia troca a versão carregada sem recarregar a página).
 */
export const MG_VERSION = 2;

export const MARGEM_RUNTIME = `(function(){
if(window.sbMargem&&window.__sbMgV===${MG_VERSION})return;
window.__sbMgV=${MG_VERSION};
window.sbMargem=function(){
var off=[],subs=[],resizers=[],K={};
var mm=function(q){return window.matchMedia?window.matchMedia(q).matches:false};
var reduce=mm("(prefers-reduced-motion: reduce)"),fine=mm("(pointer: fine)");
function clamp(v,a,b){return v<a?a:v>b?b:v}
function sstep(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)}
function on(t,e,f,o){t.addEventListener(e,f,o);off.push(function(){t.removeEventListener(e,f,o)})}
function arr(l){return Array.prototype.slice.call(l)}
/* só o site que é a página: miniaturas (escaladas) ficam estáticas */
function isLive(r){var w=r.offsetWidth;if(!w)return false;var k=r.getBoundingClientRect().width/w;return k>0.98&&k<1.02}
var roots=arr(document.querySelectorAll(".sb")).filter(function(r){return r.querySelector("[data-mg]")&&isLive(r)});
if(!roots.length)return function(){};
/*
 * Área visível. No site publicado é a janela. Na prévia do app o site rola dentro de um contêiner
 * (main com overflow) e tem barras fixas acima (sticky): a altura útil e o topo das seções presas
 * vão para --mg-vh/--mg-top, e as posições passam a contar a partir do topo dessa área (VT).
 */
function scrollerOf(el){for(var p=el.parentElement;p&&p!==document.body&&p!==document.documentElement;p=p.parentElement){var o=getComputedStyle(p).overflowY;if((o==="auto"||o==="scroll")&&p.scrollHeight>p.clientHeight)return p}return null}
function stickyAbove(el,sc){var h=0;for(var n=el;n&&n!==sc;n=n.parentElement)for(var s=n.previousElementSibling;s;s=s.previousElementSibling)if(getComputedStyle(s).position==="sticky")h+=s.offsetHeight;return h}
var scroller=scrollerOf(roots[0]),VT=0,VH=window.innerHeight;
function measure(){
if(!scroller){VT=0;VH=window.innerHeight;return}
var top=stickyAbove(roots[0],scroller);
VT=scroller.getBoundingClientRect().top+top;VH=Math.max(240,scroller.clientHeight-top);
roots.forEach(function(r){r.style.setProperty("--mg-top",top+"px");r.style.setProperty("--mg-vh",VH+"px")});
}
measure();
if(scroller)off.push(function(){roots.forEach(function(r){r.style.removeProperty("--mg-top");r.style.removeProperty("--mg-vh")})});
function vh(){return VH}
var queued=false;
function tick(){queued=false;subs.forEach(function(f){f()})}
function req(){if(!queued){queued=true;requestAnimationFrame(tick)}}
on(document,"scroll",req,{capture:true,passive:true});
on(window,"resize",function(){measure();resizers.forEach(function(f){f()});req()});

/* ── navegação: some ao rolar para baixo (depois de meia tela), volta ao subir, com véu ── */
K.nav=function(el){
var root=el.closest(".sb"),last=null;
subs.push(function(){
var y=VT-root.getBoundingClientRect().top,h=vh();
if(last===null){last=y;return}
var d=y-last;
if(Math.abs(d)<4)return;
if(d>0&&y>h*0.5)el.classList.add("mg-hide");else if(d<0)el.classList.remove("mg-hide");
el.classList.toggle("mg-veil",y>h*0.5&&!el.classList.contains("mg-hide"));
last=y;
});
off.push(function(){el.classList.remove("mg-hide","mg-veil")});
};

/* ── hero + túnel (WebGL) ── */
K.tunnel=function(sec,root){
var data;try{data=JSON.parse(sec.getAttribute("data-mg-wall")||"{}")}catch(e){return}
var wall=(data.wall||[]).filter(function(w){return w&&w.s});
var caseSrc=data.cases||[];
var stage=sec.querySelector(".mg-stage"),cv=sec.querySelector(".mg-canvas");
var caseEls=arr(sec.querySelectorAll(".mg-case")),n=caseEls.length;
if(!stage||!cv||(!wall.length&&!n))return;
var gl=null;
try{gl=cv.getContext("webgl",{alpha:false,antialias:true})}catch(e){}
if(!gl)return;
function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
var vs=sh(gl.VERTEX_SHADER,"attribute vec2 p;uniform mat4 uP;uniform mat4 uMV;varying vec2 vUv;varying float vD;void main(){vUv=p+0.5;vec4 m=uMV*vec4(p,0.0,1.0);vD=-m.z;gl_Position=uP*m;}");
var fs=sh(gl.FRAGMENT_SHADER,"precision mediump float;uniform sampler2D t;uniform float uO;uniform float uB;uniform vec3 uF;uniform vec2 uR;varying vec2 vUv;varying float vD;void main(){vec4 c=texture2D(t,vUv,uB);c.rgb=mix(c.rgb,uF,smoothstep(uR.x,uR.y,vD));gl_FragColor=vec4(c.rgb,uO);}");
if(!vs||!fs)return;
var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
gl.useProgram(pr);
var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-0.5,-0.5,0.5,-0.5,-0.5,0.5,0.5,0.5]),gl.STATIC_DRAW);
var aP=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
var uP=gl.getUniformLocation(pr,"uP"),uMV=gl.getUniformLocation(pr,"uMV"),uO=gl.getUniformLocation(pr,"uO"),uB=gl.getUniformLocation(pr,"uB"),uF=gl.getUniformLocation(pr,"uF"),uR=gl.getUniformLocation(pr,"uR");
gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
var aniso=gl.getExtension("EXT_texture_filter_anisotropic");
/* cor do fundo = cor do tema */
var bg=[0.949,0.941,0.922];
var hex=(getComputedStyle(root).getPropertyValue("--sb-bg")||"").trim();
if(hex.charAt(0)==="#"){if(hex.length===4)hex="#"+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];if(hex.length===7)bg=[1,3,5].map(function(i){return parseInt(hex.substr(i,2),16)/255})}
var dead=false,dirty=false,raf=0;
function kick(){if(!raf&&!dead)raf=requestAnimationFrame(frame)}
/* texturas: uma por arquivo, compartilhada; potência de 2 para ter mipmap também no WebGL1 */
var cache={};
function pot(v){var p=1;while(p*2<=v)p*=2;return p}
function tex(src,max){
if(cache[src])return cache[src];
var o={t:null};cache[src]=o;
var img=new Image();img.crossOrigin="anonymous";img.decoding="async";
img.onload=function(){
if(dead)return;
try{
var w=Math.min(max,pot(img.naturalWidth*1.4)),h=Math.min(max,pot(img.naturalHeight*1.4));
var c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,c);
gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,4);
o.t=t;dirty=true;kick();
}catch(e){}
};
img.src=src;
return o;
}
/* planos: sorteio com semente fixa, então o túnel é sempre o mesmo */
function rng(a){return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var R=rng(2016),planes=[];
var lastZ=n?-14-(n-1)*19:-71,zEnd=Math.min(-96,lastZ-25);
var count=Math.round(78*(3.5-zEnd)/99.5);
if(wall.length)for(var i=0;i<count;i++){
var a=i*2.39996+(R()-0.5)*0.5,rad=3.5+R()*2.1,hh=1.05+R()*1.15,ph=wall[i%wall.length];
if(i<10&&Math.cos(a)<0&&Math.sin(a)<0)a+=Math.PI/2;
planes.push({a:a,r:rad,z:3.5-i/(count-1)*(3.5-zEnd),h:hh,w:hh*clamp(Number(ph.r)||1,0.2,5),tex:tex(ph.s,512)});
}
var hls=caseEls.map(function(_,k){return{a:0.9+k*2.39996,r:4.4,z:-14-k*19,tex:caseSrc[k]?tex(caseSrc[k],2048):{t:null}}});
/* matrizes (coluna-maior) */
function persp(fov,asp,nr,fr){var f=1/Math.tan(fov*Math.PI/360),d=nr-fr;return new Float32Array([f/asp,0,0,0,0,f,0,0,0,0,(fr+nr)/d,-1,0,0,2*fr*nr/d,0])}
function look(ex,ey,ez,tx,ty,tz){
var zx=ex-tx,zy=ey-ty,zz=ez-tz,l=Math.hypot(zx,zy,zz);zx/=l;zy/=l;zz/=l;
var xx=zz,xy=0,xz=-zx;l=Math.hypot(xx,xz);xx/=l;xz/=l;
var yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
return[xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*ex+xy*ey+xz*ez),-(yx*ex+yy*ey+yz*ez),-(zx*ex+zy*ey+zz*ez),1];
}
function mvOf(V,x,y,z,rx,ry,sx,sy){
var ca=Math.cos(rx),sa=Math.sin(rx),cb=Math.cos(ry),sb=Math.sin(ry);
var M=[cb*sx,sa*sb*sx,-ca*sb*sx,0,0,ca*sy,sa*sy,0,sb,-sa*cb,ca*cb,0,x,y,z,1],o=new Float32Array(16);
for(var c=0;c<4;c++)for(var r=0;r<4;r++)o[c*4+r]=V[r]*M[c*4]+V[4+r]*M[c*4+1]+V[8+r]*M[c*4+2]+V[12+r]*M[c*4+3];
return o;
}
/* timeline: trechos sequenciais em unidades relativas, avaliados no tempo do scroll */
var segs=[],T=1,fov=50,asp=1,portrait=false;
function io2(k){return k<0.5?2*k*k:1-Math.pow(2-2*k,2)/2}
function build(){
var W=stage.clientWidth,H=stage.clientHeight;
asp=W/Math.max(1,H);portrait=asp<0.8;fov=portrait?62:50;
var tn=Math.tan(fov*Math.PI/360);
var D=portrait?6/(0.9*2*tn*asp):0.94*Math.min(4/(2*tn),6/(2*tn*asp));
sec.classList.toggle("mg-portrait",portrait);
if(portrait)stage.style.setProperty("--mg-below",Math.round(H*(0.5+2/(2*D*tn))+16)+"px");
segs=[];T=0;var z=6;
function add(d,f){segs.push({a:T,b:T+d,f:f});T+=d}
add(0.9,function(S,k){S.hero=k});
hls.forEach(function(h,i){
var z0=z,z1=h.z+10,z2=h.z+D,z3=h.z-0.6,pv=i-1;
add(Math.max(0.2,Math.abs(z0-z1)/9),function(S,k){S.z=z0+(z1-z0)*k;if(pv>=0)S.pull[pv]=0});
add(1.3,function(S,k){var e=io2(k);S.pull[i]=e;S.z=z1+(z2-z1)*e});
add(0.69,function(S,k){S.tin[i]=k});
add(1,function(){});
add(0.3,function(S,k){S.tout[i]=k});
add(0.9,function(S,k){S.z=z2+(z3-z2)*k*k});
z=z3;
});
var zf=zEnd+8,zs=z,lst=n-1;
add(Math.max(0.2,Math.abs(zs-zf)/9),function(S,k){S.z=zs+(zf-zs)*k;if(lst>=0)S.pull[lst]=0});
add(0.8,function(S,k){S.end=k});
}
function evalAt(t){
var S={z:6,hero:0,end:0,pull:[],tin:[],tout:[]};
for(var i=0;i<n;i++){S.pull.push(0);S.tin.push(0);S.tout.push(0)}
for(var j=0;j<segs.length;j++){var s=segs[j];if(t<=s.a)break;s.f(S,Math.min(1,(t-s.a)/(s.b-s.a)))}
return S;
}
var heroEls=arr(sec.querySelectorAll(".mg-hero-line,.mg-hero-mark,.mg-hero-labels"));
var endEl=sec.querySelector(".mg-end"),bar=sec.querySelector(".mg-progress");
function overlay(S,p){
heroEls.forEach(function(e){e.style.opacity=String(1-S.hero);e.style.translate="0 "+(-30*S.hero).toFixed(1)+"px"});
caseEls.forEach(function(el,i){
var tin=S.tin[i],out=S.tout[i],act=tin>0&&out<1;
el.classList.toggle("is-on",act);
if(!act)return;
var txt=el.querySelector(".mg-case-txt");
txt.style.setProperty("--m",(Math.min(1,tin*2)*(1-out)).toFixed(3));
var it=txt.children;
for(var j=0;j<it.length;j++){
var e=reduce?1:1-Math.pow(1-clamp((tin*0.69-j*0.06)/0.45,0,1),2);
it[j].style.opacity=String(e*(1-out));
it[j].style.translate="0 "+(24*(1-e)).toFixed(1)+"px";
}
});
if(endEl){endEl.classList.toggle("is-on",S.end>0);endEl.style.opacity=String(S.end);endEl.style.translate="0 "+(24*(1-(reduce?1:S.end))).toFixed(1)+"px"}
if(bar)bar.style.setProperty("--p",p.toFixed(4));
}
var tt=0,target=0,mx=0,my=0,cx=0,cy=0,inView=true,list=[];
function push(V,tx,ex,ey,ez,x,y,z,rx,ry,w,h,mul,bias){
var d=Math.hypot(x-ex,y-ey,z-ez),op=sstep(0.4,2.2,d)*mul;
if(op<0.004)return;
var mv=mvOf(V,x,y,z,rx,ry,w,h);
if(mv[14]>0)return;
var b=d<6?(6-d)*0.45:d>22?Math.min(3,(d-22)*0.12):0;
list.push({mv:mv,op:op,b:b*bias,t:tx});
}
function draw(S,maxPull){
var W=cv.clientWidth,H=cv.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);
var bw=Math.max(1,Math.round(W*dpr)),bh=Math.max(1,Math.round(H*dpr));
if(cv.width!==bw||cv.height!==bh){cv.width=bw;cv.height=bh}
gl.viewport(0,0,bw,bh);gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT);
var ex=cx,ey=cy,ez=S.z,V=look(ex,ey,ez,cx*0.3,cy*0.3,ez-12);
gl.uniformMatrix4fv(uP,false,persp(fov,W/Math.max(1,H),0.05,140));
gl.uniform3f(uF,bg[0],bg[1],bg[2]);gl.uniform2f(uR,9,44);
var kx=portrait?0.72:1.45,ky=portrait?1.55:1;list=[];
planes.forEach(function(p){
if(!p.tex.t)return;
push(V,p.tex.t,ex,ey,ez,Math.cos(p.a)*p.r*kx,Math.sin(p.a)*p.r*ky,p.z,Math.sin(p.a)*0.28,-Math.cos(p.a)*0.32,p.w,p.h,1-maxPull*0.88,1);
});
hls.forEach(function(h,i){
if(!h.tex.t)return;
var s=sstep(0,1,S.pull[i]),sc=0.36+0.64*s,oth=maxPull>S.pull[i]?maxPull:0;
push(V,h.tex.t,ex,ey,ez,Math.cos(h.a)*h.r*kx*(1-s),Math.sin(h.a)*h.r*ky*(1-s),h.z,Math.sin(h.a)*0.28*(1-s),-Math.cos(h.a)*0.32*(1-s),6*sc,4*sc,1-oth*0.88,1-s);
});
list.sort(function(a,b){return a.mv[14]-b.mv[14]});
list.forEach(function(o){
gl.uniformMatrix4fv(uMV,false,o.mv);gl.uniform1f(uO,o.op);gl.uniform1f(uB,o.b);
gl.bindTexture(gl.TEXTURE_2D,o.t);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
});
}
/* desenha só quando algo muda: scroll, cursor, textura carregada */
function frame(){
raf=0;
var moving=false;
if(reduce)tt=target;else{tt+=(target-tt)*0.14;if(Math.abs(target-tt)>0.0005)moving=true;else tt=target}
var S=evalAt(tt),maxPull=0;
S.pull.forEach(function(p){if(p>maxPull)maxPull=p});
var str=1-maxPull*0.92,gx=mx*0.55*str,gy=my*0.35*str;
if(reduce){cx=gx;cy=gy}else{cx+=(gx-cx)*0.06;cy+=(gy-cy)*0.06;if(Math.abs(gx-cx)>0.0005||Math.abs(gy-cy)>0.0005)moving=true}
if(inView||dirty){draw(S,maxPull);overlay(S,T?tt/T:0)}
dirty=false;
if(moving)kick();
}
function progress(){var r=sec.getBoundingClientRect(),t=r.top-VT,span=r.height-stage.offsetHeight;inView=t+r.height>0&&t<vh();return span>0?clamp(-t/span,0,1):0}
sec.classList.add("mg-live");
build();
target=tt=progress()*T;
subs.push(function(){target=progress()*T;kick()});
resizers.push(function(){build();target=progress()*T;dirty=true;kick()});
if(fine&&!reduce)on(window,"pointermove",function(e){mx=(e.clientX/window.innerWidth-0.5)*2;my=-(e.clientY/window.innerHeight-0.5)*2;if(inView)kick()},{passive:true});
dirty=true;kick();
off.push(function(){
dead=true;if(raf)cancelAnimationFrame(raf);
sec.classList.remove("mg-live","mg-portrait");stage.style.removeProperty("--mg-below");
heroEls.concat(endEl?[endEl]:[]).forEach(function(e){e.style.opacity="";e.style.translate=""});
caseEls.forEach(function(el){el.classList.remove("is-on");arr(el.querySelectorAll(".mg-case-txt,.mg-case-txt>*")).forEach(function(e){e.style.opacity="";e.style.translate="";e.style.removeProperty("--m")})});
var lose=gl.getExtension("WEBGL_lose_context");if(lose)lose.loseContext();
});
};

/* ── manifesto: palavras em sequência, notas na margem ligadas por fios ── */
K.manifesto=function(sec){
var words=arr(sec.querySelectorAll(".mg-w")),notes=arr(sec.querySelectorAll(".mg-note"));
var svg=sec.querySelector(".mg-threads"),margin=sec.querySelector(".mg-margin"),txt=sec.querySelector(".mg-man-text");
if(!reduce&&"IntersectionObserver" in window&&txt){
sec.classList.add("mg-anim");
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){sec.classList.add("mg-in");io.disconnect()}})},{threshold:0.2});
io.observe(txt);
off.push(function(){io.disconnect();sec.classList.remove("mg-anim","mg-in")});
}
if(!svg||!margin||!notes.length)return;
var items=[];
function layout(){
svg.innerHTML="";items=[];
if(mm("(max-width:767px)")){sec.classList.remove("mg-live");return}
sec.classList.add("mg-live");
notes.forEach(function(note){
var at=note.getAttribute("data-at")||"",w=null;
for(var i=0;i<words.length&&at;i++)if((words[i].getAttribute("data-w")||"").indexOf(at)>=0){w=words[i];break}
if(!w){note.classList.add("is-on");return}
var top=w.offsetTop,end=w;
for(var j=words.indexOf(w)+1;j<words.length;j++){var t=words[j].offsetTop;if(Math.abs(t-top)<4)end=words[j];else if(t>top)break}
var x1=end.offsetLeft+end.offsetWidth+10,y=top+w.offsetHeight*0.55,x2=margin.offsetLeft+24;
note.style.setProperty("--y",(y-margin.offsetTop).toFixed(1)+"px");
var dx=x2-x1,p=document.createElementNS("http://www.w3.org/2000/svg","path");
p.setAttribute("d","M"+x1+" "+y+"C"+(x1+dx*0.35)+" "+(y+26)+" "+(x1+dx*0.7)+" "+(y+26)+" "+x2+" "+y);
svg.appendChild(p);
var len=p.getTotalLength();p.style.strokeDasharray=String(len);p.style.strokeDashoffset=String(len);
items.push({n:note,p:p,len:len,y:y});
});
draw();
}
function draw(){
var r=sec.getBoundingClientRect(),H=vh();
items.forEach(function(it){
var ys=r.top-VT+it.y,k=reduce?(ys<H*0.9?1:0):clamp((H*0.85-ys)/(H*0.3),0,1);
it.p.style.strokeDashoffset=String(it.len*(1-k));
it.n.classList.toggle("is-on",k>=0.98);
});
}
layout();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(sec.isConnected)layout()});
subs.push(draw);resizers.push(layout);
off.push(function(){svg.innerHTML="";sec.classList.remove("mg-live");notes.forEach(function(n){n.classList.remove("is-on");n.style.removeProperty("--y")})});
};

/* ── método: a tira desliza com o scroll, o quadro ativo passa pelo centro ── */
K.method=function(sec){
var stage=sec.querySelector(".mg-method-stage"),view=sec.querySelector(".mg-strip-view"),strip=sec.querySelector(".mg-strip"),line=sec.querySelector(".mg-ruler-line");
var frames=arr(sec.querySelectorAll(".mg-frame")),steps=arr(sec.querySelectorAll(".mg-step")),caps=arr(sec.querySelectorAll(".mg-caps span"));
var n=frames.length;
if(n<2||!stage||!view||!strip)return;
sec.classList.add("mg-live");
var cur=-1;
function upd(){
var r=sec.getBoundingClientRect(),span=r.height-stage.offsetHeight,p=span>0?clamp((VT-r.top)/span,0,1):0;
var pos=p*(n-1),act=Math.round(pos),fw=frames[0].offsetWidth,sw=fw*n,w=view.clientWidth;
var x=sw<=w?(w-sw)/2:clamp(w/2-(pos+0.5)*fw,w-sw,0);
strip.style.transform="translate3d("+x.toFixed(1)+"px,0,0)";
if(line)line.style.setProperty("--p",p.toFixed(4));
if(act!==cur){
cur=act;
[frames,steps,caps].forEach(function(l){l.forEach(function(el,i){el.classList.toggle("is-on",i===act)})});
}
}
upd();
subs.push(upd);resizers.push(upd);
off.push(function(){sec.classList.remove("mg-live");strip.style.transform="";if(line)line.style.removeProperty("--p")});
};

/* ── índice: a foto do projeto segue o cursor (só com mouse) ── */
K.index=function(sec){
var box=sec.querySelector(".mg-follow"),img=box&&box.querySelector("img"),rows=arr(sec.querySelectorAll(".mg-row-in")),list=sec.querySelector(".mg-rows");
if(!box||!img||!list)return;
if("IntersectionObserver" in window){
var io=new IntersectionObserver(function(es){
if(!es.some(function(e){return e.isIntersecting}))return;
rows.forEach(function(r){var s=r.getAttribute("data-img");if(s){var i=new Image();i.src=s}});
io.disconnect();
},{rootMargin:"600px 0px"});
io.observe(sec);off.push(function(){io.disconnect()});
}
var x=0,y=0,tx=0,ty=0,rot=0,raf=0,last=0,shown=false;
function place(){box.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) rotate("+rot+"deg)"}
function loop(t){
raf=0;var dt=last?Math.min(64,t-last):16;last=t;
var k=reduce?1:1-Math.exp(-dt/140);x+=(tx-x)*k;y+=(ty-y)*k;place();
if(Math.abs(tx-x)>0.3||Math.abs(ty-y)>0.3)raf=requestAnimationFrame(loop);else last=0;
}
function aim(px,py){
var r=sec.getBoundingClientRect(),bw=box.offsetWidth,bh=box.offsetHeight;
tx=px-r.left+140;if(tx+bw>r.width)tx=px-r.left-140-bw;
ty=py-r.top-bh/2;
if(!raf)raf=requestAnimationFrame(loop);
}
function show(row,px,py){
var s=row.getAttribute("data-img");
if(!s){hide();return}
if(img.getAttribute("src")!==s)img.src=s;
rot=(Math.random()*10-5).toFixed(2);
aim(px,py);
if(!shown){shown=true;x=tx;y=ty;place();box.classList.add("is-on")}
}
function hide(){shown=false;box.classList.remove("is-on")}
rows.forEach(function(row){
if(fine)on(row,"pointerenter",function(e){if(e.pointerType==="mouse")show(row,e.clientX,e.clientY)});
on(row,"focus",function(){if(!row.matches(":focus-visible"))return;var r=row.getBoundingClientRect();show(row,r.left+r.width*0.6,r.top+r.height/2)});
on(row,"blur",hide);
});
if(fine){
on(sec,"pointermove",function(e){if(shown&&e.pointerType==="mouse")aim(e.clientX,e.clientY)});
on(list,"pointerleave",hide);
}
off.push(function(){hide();if(raf)cancelAnimationFrame(raf);box.style.transform=""});
};

/* ── depoimento: fotos andam com o scroll na proporção da profundidade ── */
K.quote=function(sec){
if(reduce)return;
var imgs=arr(sec.querySelectorAll(".mg-float img"));
function upd(){
var r=sec.getBoundingClientRect(),H=vh();
if(r.bottom-VT<-200||r.top-VT>H+200)return;
var c=clamp((r.top-VT+r.height/2-H/2)/(H/2+r.height/2),-1,1);
imgs.forEach(function(im){var d=Number(im.getAttribute("data-depth"))||0;im.style.setProperty("--mg-py",(c*160*d).toFixed(1)+"px")});
}
upd();subs.push(upd);
off.push(function(){imgs.forEach(function(im){im.style.removeProperty("--mg-py")})});
};

/* ── rodapé: wordmark de borda a borda sobe por baixo ── */
K.footer=function(sec){
if(reduce)return;
var m=sec.querySelector(".mg-foot-mark");
if(!m)return;
function upd(){var r=m.getBoundingClientRect(),H=vh(),k=clamp((H-(r.top-VT))/(r.height*1.05),0,1);m.style.setProperty("--mg-rise",((1-k)*60).toFixed(2)+"%")}
upd();subs.push(upd);
off.push(function(){m.style.removeProperty("--mg-rise")});
};

roots.forEach(function(root){
root.querySelectorAll("[data-mg]").forEach(function(el){
if(el.__mg)return;
var f=K[el.getAttribute("data-mg")];
if(!f)return;
el.__mg=1;off.push(function(){el.__mg=0});
try{f(el,root)}catch(e){if(window.console)console.error(e)}
});
});

/* ── scroll suave (roda do mouse) e âncoras: só quando a página rola a janela ── */
if(!reduce&&fine&&!window.__sbMgSmooth&&!scroller){
window.__sbMgSmooth=1;
var cur=window.scrollY,tgt=cur,anim=false,sraf=0;
var maxY=function(){return document.documentElement.scrollHeight-window.innerHeight};
var stepS=function(){
sraf=0;cur+=(tgt-cur)*0.1;
if(Math.abs(tgt-cur)<0.5){cur=tgt;anim=false}else anim=true;
window.scrollTo(0,cur);
if(anim)sraf=requestAnimationFrame(stepS);
};
var go=function(y){if(!anim)cur=window.scrollY;tgt=clamp(y,0,maxY());anim=true;if(!sraf)sraf=requestAnimationFrame(stepS)};
var stop=function(){anim=false;if(sraf)cancelAnimationFrame(sraf);sraf=0};
on(window,"wheel",function(e){
if(e.ctrlKey||e.defaultPrevented||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
for(var el=e.target;el&&el.nodeType===1&&el!==document.body;el=el.parentElement){var o=getComputedStyle(el).overflowY;if((o==="auto"||o==="scroll")&&el.scrollHeight>el.clientHeight)return}
e.preventDefault();
go((anim?tgt:window.scrollY)+e.deltaY*(e.deltaMode===1?40:e.deltaMode===2?window.innerHeight:1));
},{passive:false});
on(window,"scroll",function(){if(!anim)cur=tgt=window.scrollY},{passive:true});
on(window,"keydown",stop);
on(window,"pointerdown",stop);
on(document,"click",function(e){
var a=e.target&&e.target.closest?e.target.closest("a[href^='#']"):null;
if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey)return;
var id=decodeURIComponent(a.getAttribute("href").slice(1)),el=id?document.getElementById(id):null;
if(!el)return;
e.preventDefault();
go(el.getBoundingClientRect().top+window.scrollY);
});
off.push(function(){stop();window.__sbMgSmooth=0});
}
req();
return function(){off.forEach(function(f){try{f()}catch(e){}})};
};
})();`;
