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

export const REVEAL_SCRIPT = `(function(){if(!("IntersectionObserver" in window))return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:0.08});
document.querySelectorAll(".reveal").forEach(function(el){io.observe(el)})})();`;

export const LIGHTBOX_SCRIPT = `(function(){var imgs=document.querySelectorAll(".gallery-grid img");if(!imgs.length)return;
var ov=document.createElement("div");ov.className="lightbox";
var big=document.createElement("img");var x=document.createElement("button");
x.className="lb-close";x.setAttribute("aria-label","Tutup");x.textContent="\\u00D7";
ov.appendChild(big);ov.appendChild(x);document.body.appendChild(ov);
function close(){ov.classList.remove("show");document.body.style.overflow=""}
imgs.forEach(function(el){el.addEventListener("click",function(){big.src=el.currentSrc||el.src;big.alt=el.alt;ov.classList.add("show");document.body.style.overflow="hidden"})});
ov.addEventListener("click",close);
document.addEventListener("keydown",function(e){if(e.key==="Escape")close()})})();`;
