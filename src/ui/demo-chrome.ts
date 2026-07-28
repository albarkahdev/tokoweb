import type { ThemeConfig } from "@/themes/engine/types";

export function demoChromeHtml(
  themes: ThemeConfig[],
  activeTheme: string,
  demoBusinessName: string,
): string {
  const switcher = themes
    .map(
      (theme) =>
        `<a href="/kuliner?tema=${theme.slug}" class="demo-sw${theme.slug === activeTheme ? " on" : ""}" title="${theme.character}">${theme.name}</a>`,
    )
    .join("");
  return `
<style>
.demo-top{position:fixed;top:0;left:0;right:0;z-index:60;background:rgb(20 17 28 / 0.92);backdrop-filter:blur(10px);color:#fff;display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.9rem;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:0.8rem}
.demo-top .lbl{white-space:nowrap;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;font-size:0.68rem;color:#B9B3C8}
.demo-sws{display:flex;gap:0.35rem;overflow-x:auto;scrollbar-width:none;padding:0.15rem 0}
.demo-sws::-webkit-scrollbar{display:none}
.demo-sw{color:#D6D1E2;text-decoration:none;padding:0.28rem 0.85rem;border-radius:9999px;border:1px solid #453F55;white-space:nowrap;font-weight:600;transition:border-color 0.15s ease}
.demo-sw:hover{border-color:#8F86AB}
.demo-sw.on{background:#fff;color:#17141F;font-weight:800;border-color:#fff}
.demo-name{margin-left:auto;flex-shrink:0}
.demo-name input{border-radius:9999px;border:1px solid #453F55;background:#252031;color:#fff;padding:0.35rem 0.85rem;font-size:0.8rem;width:10.5rem;font-family:inherit}
.demo-name input::placeholder{color:#8F86AB}
.demo-name input:focus{outline:2px solid #FF6B57}
body{padding-top:3.1rem;padding-bottom:7rem}
.demo-cta{position:fixed;bottom:0;left:0;right:0;z-index:60;background:rgb(20 17 28 / 0.96);backdrop-filter:blur(10px);color:#fff;padding:0.85rem 0.9rem calc(0.85rem + env(safe-area-inset-bottom));font-family:'Plus Jakarta Sans',system-ui,sans-serif;box-shadow:0 -10px 30px rgb(0 0 0 / 0.25)}
.demo-cta .inner{max-width:36rem;margin:0 auto}
.demo-cta .pitch{margin:0 0 0.55rem;font-size:0.88rem;display:flex;align-items:baseline;gap:0.5rem;flex-wrap:wrap}
.demo-cta .pitch .price{color:#FFD166;font-weight:800}
.demo-cta form{display:flex;gap:0.45rem;flex-wrap:wrap}
.demo-cta input{flex:1 1 8rem;border-radius:0.55rem;border:none;padding:0.6rem 0.7rem;font-size:0.88rem;font-family:inherit}
.demo-cta button{background:linear-gradient(135deg,#FF6B57,#FF8A3D);color:#1D1410;border:none;border-radius:0.55rem;padding:0.6rem 1.2rem;font-weight:800;cursor:pointer;font-family:inherit;font-size:0.9rem;transition:transform 0.15s ease}
.demo-cta button:hover{transform:translateY(-1px)}
.wa-float{display:none}
</style>
<div class="demo-top">
  <span class="lbl">Tema</span>
  <div class="demo-sws">${switcher}</div>
  <span class="demo-name"><input id="demo-name-input" placeholder="✏️ Coba nama usahamu…" maxlength="40"></span>
</div>
<div class="demo-cta">
  <div class="inner">
    <p class="pitch"><strong>Suka website ini?</strong> <span>Punya versimu — jadi ≤ 3 hari,</span> <span class="price">mulai Rp 75rb/bulan.</span></p>
    <form method="post" action="/lead">
      <input name="name" placeholder="Namamu" required>
      <input name="business_name" id="demo-lead-business" placeholder="Nama usahamu" required>
      <input name="wa_number" placeholder="No WhatsApp (62…)" inputmode="tel" required>
      <input type="hidden" name="ref" id="demo-lead-ref">
      <button type="submit">Saya mau! →</button>
    </form>
  </div>
</div>
<script>
(function(){
var params=new URLSearchParams(location.search);
var ref=params.get("ref");
if(ref&&/^[A-HJ-NP-Z2-9]{6}$/.test(ref.toUpperCase())){
  ref=ref.toUpperCase();
  localStorage.setItem("demo_ref",ref);
  if(!localStorage.getItem("demo_scan_"+ref)){
    localStorage.setItem("demo_scan_"+ref,"1");
    try{navigator.sendBeacon("/scan",JSON.stringify({ref:ref}))}catch(_){}
  }
}
var refField=document.getElementById("demo-lead-ref");
if(refField)refField.value=localStorage.getItem("demo_ref")||"";
var ORIGINAL=${JSON.stringify(demoBusinessName)};
function swap(name){
  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  var node;
  while((node=walker.nextNode())){
    if(node.nodeValue.indexOf(ORIGINAL)!==-1)node.nodeValue=node.nodeValue.split(ORIGINAL).join(name);
  }
  document.title=document.title.split(ORIGINAL).join(name);
}
var input=document.getElementById("demo-name-input");
var saved=localStorage.getItem("demo_biz");
if(saved){input.value=saved;swap(saved)}
var biz=document.getElementById("demo-lead-business");
if(biz&&saved)biz.value=saved;
input.addEventListener("input",function(){
  var value=input.value.trim();
  if(!value)return;
  localStorage.setItem("demo_biz",value);
  swap(value);
  if(biz)biz.value=value;
});
var sws=document.querySelector(".demo-sws .on");
if(sws)sws.scrollIntoView({inline:"center",block:"nearest"});
})();
</script>`;
}
