export function trackerScript(appBaseUrl: string): string {
  return `(function(){var s={};function t(e,p){var k=e+":"+(p||"");if(s[k])return;s[k]=1;try{navigator.sendBeacon("${appBaseUrl}/t",JSON.stringify({t:e,p:location.pathname,pid:p||null}))}catch(_){}}
document.addEventListener("click",function(ev){var el=ev.target.closest("[data-track]");if(el)t(el.getAttribute("data-track"),el.getAttribute("data-pid")?Number(el.getAttribute("data-pid")):null)});
t("page_view",null)})();`;
}

export const OPEN_NOW_SCRIPT = `(function(){var el=document.getElementById("open-badge");if(!el)return;
var hours=JSON.parse(el.getAttribute("data-hours"));
var f=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false});
var parts=f.formatToParts(new Date()),map={};parts.forEach(function(p){map[p.type]=p.value});
var days={Mon:"mon",Tue:"tue",Wed:"wed",Thu:"thu",Fri:"fri",Sat:"sat",Sun:"sun"};
var today=hours[days[map.weekday]];var now=map.hour+":"+map.minute;
var open=today&&now>=today[0]&&now<=today[1];
el.textContent=open?"● Buka sekarang":"● Tutup — cek jam buka";
el.classList.add(open?"open":"closed")})();`;

export const REVEAL_SCRIPT = `(function(){var els=document.querySelectorAll(".reveal");
function showAll(){els.forEach(function(el){el.classList.add("in")})}
if(!("IntersectionObserver" in window)){showAll();return}
var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("in");io.unobserve(entry.target)}})},{threshold:0.3,rootMargin:"0px 0px -10% 0px"});
els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight*0.85){el.classList.add("in")}else{io.observe(el)}})})();`;

export const LIGHTBOX_SCRIPT = `(function(){var imgs=Array.prototype.slice.call(document.querySelectorAll(".gallery-grid img"));if(!imgs.length)return;
var ov=document.createElement("div");ov.className="lightbox";
var big=document.createElement("img");
function btn(cls,label,txt){var b=document.createElement("button");b.className=cls;b.setAttribute("aria-label",label);b.textContent=txt;return b}
var x=btn("lb-close","Tutup","\\u00D7"),prev=btn("lb-prev","Sebelumnya","\\u2190"),next=btn("lb-next","Berikutnya","\\u2192");
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
