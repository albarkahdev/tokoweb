import type { ThemeConfig } from "@/themes/engine/types";

export function demoChromeHtml(
  themes: ThemeConfig[],
  activeTheme: string,
  demoBusinessName: string,
  currentPath: string,
): string {
  const active = themes.find((theme) => theme.slug === activeTheme);
  const items = themes
    .map(
      (theme) =>
        `<a href="${currentPath}?tema=${theme.slug}" class="demo-tp-item${theme.slug === activeTheme ? " on" : ""}" data-f="${`${theme.name} ${theme.character} ${(theme.tags ?? []).join(" ")}`.toLowerCase()}"><b>${theme.name}</b><span>${theme.character}</span></a>`,
    )
    .join("");
  return `
<style>
.demo-top{position:fixed;top:0;left:0;right:0;z-index:60;background:rgb(20 17 28 / 0.92);backdrop-filter:blur(10px);color:#fff;display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.9rem;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:0.8rem}
.demo-top .lbl{white-space:nowrap;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;font-size:0.68rem;color:#B9B3C8}
.demo-theme-btn{display:inline-flex;align-items:center;gap:0.45rem;font-family:inherit;font-size:0.8rem;font-weight:700;color:#fff;background:#252031;border:1px solid #453F55;border-radius:9999px;padding:0.35rem 0.95rem;cursor:pointer;white-space:nowrap;transition:border-color 0.15s ease;max-width:60vw;overflow:hidden}
.demo-theme-btn:hover{border-color:#8F86AB}
.demo-theme-btn b{color:#FFD166;overflow:hidden;text-overflow:ellipsis}
.demo-name{margin-left:auto;flex-shrink:1;min-width:0}
.demo-name input{border-radius:9999px;border:1px solid #453F55;background:#252031;color:#fff;padding:0.35rem 0.85rem;font-size:0.8rem;width:10.5rem;max-width:100%;font-family:inherit}
.demo-name input::placeholder{color:#8F86AB}
.demo-name input:focus{outline:2px solid #FF6B57}
.demo-tp{position:fixed;inset:0;z-index:80;display:none;align-items:flex-end;justify-content:center;background:rgb(0 0 0 / 0.6);backdrop-filter:blur(3px);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.demo-tp.show{display:flex}
@media (min-width:40rem){.demo-tp{align-items:center;padding:1.5rem}}
.demo-tp-box{background:#17141F;color:#fff;width:100%;max-width:30rem;max-height:82dvh;display:flex;flex-direction:column;border-radius:1.2rem 1.2rem 0 0;border:1px solid #453F55;box-shadow:0 30px 80px rgb(0 0 0 / 0.6)}
@media (min-width:40rem){.demo-tp-box{border-radius:1.2rem}}
.demo-tp-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.2rem 0.6rem}
.demo-tp-head strong{font-size:1rem}
.demo-tp-close{background:none;border:none;color:#B9B3C8;font-size:1.6rem;line-height:1;cursor:pointer;padding:0.2rem}
.demo-tp-search{margin:0 1.2rem 0.8rem;border-radius:0.7rem;border:1px solid #453F55;background:#252031;color:#fff;padding:0.6rem 0.9rem;font-size:0.88rem;font-family:inherit}
.demo-tp-search::placeholder{color:#8F86AB}
.demo-tp-search:focus{outline:2px solid #FF6B57}
.demo-tp-list{overflow-y:auto;padding:0 0.7rem 0.9rem;display:grid;gap:0.35rem}
.demo-tp-item{display:flex;flex-direction:column;gap:0.1rem;text-decoration:none;color:#fff;padding:0.6rem 0.7rem;border-radius:0.7rem;border:1px solid transparent}
.demo-tp-item:hover{background:#252031;border-color:#453F55}
.demo-tp-item.on{background:#252031;border-color:#FF6B57}
.demo-tp-item b{font-size:0.92rem}
.demo-tp-item.on b::after{content:" ✓ dipakai";color:#FFD166;font-size:0.75rem}
.demo-tp-item span{color:#8F86AB;font-size:0.78rem}
body{padding-top:3.1rem;padding-bottom:7rem}
.promo-ticker{top:3.1rem}
.site-nav{top:3.1rem}
.site-nav.with-ticker{top:calc(3.1rem + var(--tk-h, 2.3rem))}
.catnav{top:calc(3.1rem + var(--nav-h, 3.5rem))}
.demo-cta{position:fixed;bottom:0;left:0;right:0;z-index:60;background:rgb(20 17 28 / 0.96);backdrop-filter:blur(10px);color:#fff;padding:0.85rem 0.9rem calc(0.85rem + env(safe-area-inset-bottom));font-family:'Plus Jakarta Sans',system-ui,sans-serif;box-shadow:0 -10px 30px rgb(0 0 0 / 0.25)}
.demo-cta .inner{max-width:36rem;margin:0 auto}
.demo-cta .pitch{margin:0 0 0.55rem;font-size:0.88rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap}
.demo-cta .pitch .price{color:#FFD166;font-weight:800}
.demo-cta .cta-hide{margin-left:auto;background:#252031;border:1px solid #453F55;color:#D6D1E2;border-radius:9999px;width:2.3rem;height:2.3rem;padding:0;display:inline-flex;align-items:center;justify-content:center;line-height:1;cursor:pointer;font-size:1.15rem;flex-shrink:0;transition:transform 0.2s ease}
.demo-cta .cta-hide:hover{border-color:#8F86AB}
.demo-cta .cta-mini-btn{display:none;background:linear-gradient(135deg,#FF6B57,#FF8A3D);color:#1D1410;border:none;border-radius:9999px;padding:0.45rem 1.1rem;font-weight:800;cursor:pointer;font-family:inherit;font-size:0.85rem}
.demo-cta.min form{display:none}
.demo-cta.min .pitch{margin:0}
.demo-cta.min .cta-mini-btn{display:inline-flex}
.demo-cta.min .cta-hide{transform:rotate(180deg)}
.demo-cta form{display:flex;gap:0.45rem;flex-wrap:wrap}
.demo-cta input{flex:1 1 8rem;border-radius:0.55rem;border:none;padding:0.6rem 0.7rem;font-size:0.88rem;font-family:inherit}
.demo-cta button{background:linear-gradient(135deg,#FF6B57,#FF8A3D);color:#1D1410;border:none;border-radius:0.55rem;padding:0.6rem 1.2rem;font-weight:800;cursor:pointer;font-family:inherit;font-size:0.9rem;transition:transform 0.15s ease}
.demo-cta button:hover{transform:translateY(-1px)}
.wa-float{display:none}
</style>
<div class="demo-top">
  <span class="lbl">Tema</span>
  <button type="button" id="demo-theme-btn" class="demo-theme-btn">🎨 <b>${active?.name ?? activeTheme}</b> · Ganti ▾</button>
  <span class="demo-name"><input id="demo-name-input" placeholder="✏️ Coba nama usahamu…" maxlength="40"></span>
</div>
<div class="demo-tp" id="demo-tp">
  <div class="demo-tp-box" role="dialog" aria-modal="true" aria-label="Pilih tema">
    <div class="demo-tp-head"><strong>Pilih Tema (${themes.length})</strong><button type="button" class="demo-tp-close" aria-label="Tutup">×</button></div>
    <input class="demo-tp-search" id="demo-tp-search" placeholder="Cari: gelap, mewah, playful, animasi…">
    <div class="demo-tp-list">${items}</div>
  </div>
</div>
<div class="demo-cta" id="demo-cta">
  <div class="inner">
    <p class="pitch"><strong>Suka website ini?</strong> <span>Punya versimu — jadi ≤ 1 hari,</span> <span class="price">mulai Rp 75rb/bulan.</span> <button type="button" id="demo-cta-mau" class="cta-mini-btn">Saya mau! →</button> <button type="button" id="demo-cta-toggle" class="cta-hide" aria-label="Sembunyikan form">▾</button></p>
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
var cta=document.getElementById("demo-cta");
var ctaToggle=document.getElementById("demo-cta-toggle");
var ctaMau=document.getElementById("demo-cta-mau");
function setCta(min){cta.classList.toggle("min",min);localStorage.setItem("demo_cta_min",min?"1":"")}
if(localStorage.getItem("demo_cta_min")==="1")cta.classList.add("min");
ctaToggle.addEventListener("click",function(){setCta(!cta.classList.contains("min"))});
ctaMau.addEventListener("click",function(){setCta(false);var first=cta.querySelector("input[name=name]");if(first)first.focus()});
var tp=document.getElementById("demo-tp");
var tpBtn=document.getElementById("demo-theme-btn");
var tpSearch=document.getElementById("demo-tp-search");
var tpItems=Array.prototype.slice.call(tp.querySelectorAll(".demo-tp-item"));
function openTp(){tp.classList.add("show");document.body.style.overflow="hidden";
var on=tp.querySelector(".demo-tp-item.on");if(on)on.scrollIntoView({block:"center"});
tpSearch.focus()}
function closeTp(){tp.classList.remove("show");document.body.style.overflow=""}
tpBtn.addEventListener("click",openTp);
tp.querySelector(".demo-tp-close").addEventListener("click",closeTp);
tp.addEventListener("click",function(e){if(e.target===tp)closeTp()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&tp.classList.contains("show"))closeTp()});
tpSearch.addEventListener("input",function(){
  var q=tpSearch.value.trim().toLowerCase();
  tpItems.forEach(function(item){
    item.style.display=!q||(item.getAttribute("data-f")||"").toLowerCase().indexOf(q)!==-1?"":"none";
  });
});
})();
</script>`;
}
