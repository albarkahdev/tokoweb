export function trackerScript(appBaseUrl: string): string {
  return `(function(){var s={};function t(e,p){var k=e+":"+(p||"");if(s[k])return;s[k]=1;try{navigator.sendBeacon("${appBaseUrl}/t",JSON.stringify({t:e,p:location.pathname,pid:p||null}))}catch(_){}}
document.addEventListener("click",function(ev){var el=ev.target.closest("[data-track]");if(el)t(el.getAttribute("data-track"),el.getAttribute("data-pid")?Number(el.getAttribute("data-pid")):null)});
t("page_view",null)})();`;
}

export const OPEN_NOW_SCRIPT = `(function(){var el=document.getElementById("open-badge");if(!el)return;
if(el.getAttribute("data-forced"))return;
var hours=JSON.parse(el.getAttribute("data-hours"));
var f=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false});
var parts=f.formatToParts(new Date()),map={};parts.forEach(function(p){map[p.type]=p.value});
var days={Mon:"mon",Tue:"tue",Wed:"wed",Thu:"thu",Fri:"fri",Sat:"sat",Sun:"sun"};
var today=hours[days[map.weekday]];var now=map.hour+":"+map.minute;
var open=today&&now>=today[0]&&now<=today[1];
el.textContent=open?"● Buka sekarang":"● Tutup — cek jam buka";
el.classList.add(open?"open":"closed")})();`;

export const ANNOUNCE_SCRIPT = `(function(){var el=document.getElementById("announce-bar");if(!el)return;
var t=el.querySelector(".announce-text");var txt=t?t.textContent:"";var key="announce_"+el.getAttribute("data-key");
if(localStorage.getItem(key)===txt){el.remove();return;}
var btn=document.getElementById("announce-close");
if(btn)btn.addEventListener("click",function(){try{localStorage.setItem(key,txt)}catch(_){}el.remove();});})();`;

export const REVEAL_SCRIPT = `(function(){var els=document.querySelectorAll(".reveal");
function showAll(){els.forEach(function(el){el.classList.add("in")})}
if(!("IntersectionObserver" in window)){showAll();return}
var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("in");io.unobserve(entry.target)}})},{threshold:0.3,rootMargin:"0px 0px -10% 0px"});
els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight*0.85){el.classList.add("in")}else{io.observe(el)}})})();`;

export const MENU_POPUP_SCRIPT = `(function(){var cards=document.querySelectorAll(".menu-item[data-mi]");if(!cards.length)return;
var ov=document.createElement("div");ov.className="mi-pop";
ov.innerHTML='<div class="mp-box" role="dialog" aria-modal="true"><button class="mp-close" aria-label="Tutup">\\u00D7</button><div class="mp-media"><img alt=""><button class="mp-prev" aria-label="Sebelumnya">\\u2039</button><button class="mp-next" aria-label="Berikutnya">\\u203A</button><span class="mp-count"></span></div><div class="mp-body"><h3></h3><span class="mp-price"></span><p></p><a class="btn-wa" data-track="click_wa" href="#">\\uD83D\\uDCAC Pesan Menu Ini</a></div></div>';
document.body.appendChild(ov);
var img=ov.querySelector(".mp-media img"),media=ov.querySelector(".mp-media"),h3=ov.querySelector("h3"),price=ov.querySelector(".mp-price"),desc=ov.querySelector("p"),wa=ov.querySelector(".btn-wa"),count=ov.querySelector(".mp-count"),prev=ov.querySelector(".mp-prev"),next=ov.querySelector(".mp-next");
var fotos=[],idx=0;
function slide(i){if(!fotos.length)return;idx=(i+fotos.length)%fotos.length;img.src=fotos[idx];count.textContent=(idx+1)+" / "+fotos.length;
var many=fotos.length>1;prev.style.display=next.style.display=count.style.display=many?"":"none"}
function open(data){h3.textContent=data.n;price.textContent=data.p;desc.textContent=data.d;wa.href=data.o||data.w;
if(data.o){wa.removeAttribute("data-track")}else{wa.setAttribute("data-track","click_wa")}
fotos=data.f||[];media.style.display=fotos.length?"":"none";slide(0);
ov.classList.add("show");document.body.style.overflow="hidden"}
function close(){ov.classList.remove("show");document.body.style.overflow=""}
cards.forEach(function(card){var trigger=card.querySelector(".mi-open");if(!trigger)return;
trigger.addEventListener("click",function(){try{open(JSON.parse(card.getAttribute("data-mi")))}catch(_){}})});
prev.addEventListener("click",function(){slide(idx-1)});
next.addEventListener("click",function(){slide(idx+1)});
ov.querySelector(".mp-close").addEventListener("click",close);
ov.addEventListener("click",function(e){if(e.target===ov)close()});
document.addEventListener("keydown",function(e){if(!ov.classList.contains("show"))return;
if(e.key==="Escape")close();if(e.key==="ArrowLeft")slide(idx-1);if(e.key==="ArrowRight")slide(idx+1)})})();`;

export const PROMO_POPUP_SCRIPT = `(function(){var cards=document.querySelectorAll(".promo-card[data-pr]");if(!cards.length)return;
var ov=document.createElement("div");ov.className="mi-pop pr-pop";
ov.innerHTML='<div class="mp-box" role="dialog" aria-modal="true"><button class="mp-close" aria-label="Tutup">\\u00D7</button><div class="mp-body"><span class="mp-tag">Promo \\uD83D\\uDD25</span><h3></h3><p></p><span class="mp-until"></span><button class="share-btn mp-share" type="button" data-share-title="">Bagikan Promo \\u2197</button></div></div>';
document.body.appendChild(ov);
var h3=ov.querySelector("h3"),desc=ov.querySelector("p"),until=ov.querySelector(".mp-until"),share=ov.querySelector(".mp-share");
function open(data){h3.textContent=data.t;desc.textContent=data.d;until.textContent="Berlaku s/d "+data.u;
share.setAttribute("data-share-title",data.t);
ov.classList.add("show");document.body.style.overflow="hidden"}
function close(){ov.classList.remove("show");document.body.style.overflow=""}
cards.forEach(function(card){var trigger=card.querySelector(".pr-open");if(!trigger)return;
trigger.addEventListener("click",function(){try{open(JSON.parse(card.getAttribute("data-pr")))}catch(_){}})});
ov.querySelector(".mp-close").addEventListener("click",close);
ov.addEventListener("click",function(e){if(e.target===ov)close()});
document.addEventListener("keydown",function(e){if(ov.classList.contains("show")&&e.key==="Escape")close()})})();`;

export const SHARE_SCRIPT = `(function(){var btns=document.querySelectorAll("[data-share-title]");if(!btns.length)return;
btns.forEach(function(btn){btn.addEventListener("click",function(){
var payload={title:btn.getAttribute("data-share-title"),url:location.href};
if(navigator.share){navigator.share(payload).catch(function(){})}
else if(navigator.clipboard){navigator.clipboard.writeText(location.href).then(function(){
var old=btn.textContent;btn.textContent="Link tersalin \\u2713";setTimeout(function(){btn.textContent=old},2000)})}})})})();`;

export const LIGHTBOX_SCRIPT = `(function(){var imgs=Array.prototype.slice.call(document.querySelectorAll(".gallery-grid img"));if(!imgs.length)return;
var ov=document.createElement("div");ov.className="lightbox";
var big=document.createElement("img");
function btn(cls,label,txt){var b=document.createElement("button");b.className=cls;b.setAttribute("aria-label",label);b.textContent=txt;return b}
var x=btn("lb-close","Tutup","\\u00D7"),prev=btn("lb-prev","Sebelumnya","\\u2039"),next=btn("lb-next","Berikutnya","\\u203A");
var count=document.createElement("span");count.className="lb-count";
ov.appendChild(big);ov.appendChild(x);ov.appendChild(prev);ov.appendChild(next);ov.appendChild(count);
document.body.appendChild(ov);
var idx=0;
function show(i){idx=(i+imgs.length)%imgs.length;var el=imgs[idx];big.src=el.currentSrc||el.src;big.alt=el.alt;count.textContent=(idx+1)+" / "+imgs.length;
prev.style.display=next.style.display=count.style.display=imgs.length>1?"":"none"}
function open(i){show(i);ov.classList.add("show");document.body.style.overflow="hidden"}
function close(){ov.classList.remove("show");document.body.style.overflow=""}
imgs.forEach(function(el,i){el.addEventListener("click",function(){open(i)})});
prev.addEventListener("click",function(e){e.stopPropagation();show(idx-1)});
next.addEventListener("click",function(e){e.stopPropagation();show(idx+1)});
big.addEventListener("click",function(e){e.stopPropagation()});
ov.addEventListener("click",close);
document.addEventListener("keydown",function(e){if(!ov.classList.contains("show"))return;
if(e.key==="Escape")close();if(e.key==="ArrowLeft")show(idx-1);if(e.key==="ArrowRight")show(idx+1)})})();`;
