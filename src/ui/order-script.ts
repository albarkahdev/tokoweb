export function saveOrderScript(code: string): string {
  return `(function(){try{var k="tw_orders";var a=JSON.parse(localStorage.getItem(k)||"[]");var code=${JSON.stringify(code)};a=a.filter(function(x){return x!==code});a.unshift(code);localStorage.setItem(k,JSON.stringify(a.slice(0,20)));localStorage.removeItem("tw_cart");localStorage.removeItem("tw_checkout");}catch(e){}})();`;
}

export const MY_ORDERS_LIST_SCRIPT = `
(function(){
  var box=document.querySelector("[data-my-orders]");
  var empty=document.querySelector("[data-my-empty]");
  if(!box) return;
  var codes=[];
  try{ codes=JSON.parse(localStorage.getItem("tw_orders")||"[]"); }catch(e){}
  if(!Array.isArray(codes) || !codes.length){ if(empty) empty.hidden=false; return; }
  codes.forEach(function(code){
    if(typeof code!=="string" || !/^[0-9A-Z]{4,12}$/.test(code)) return;
    var a=document.createElement("a");
    a.className="ord-my-item"; a.href="/o/"+encodeURIComponent(code);
    a.textContent="Pesanan #"+code;
    box.appendChild(a);
  });
})();
`;

export const ORDER_SCRIPT = `
(function(){
  var DATA = window.__ORDER__ || { items:{}, tax:0, fees:[], min:0 };
  var lines = [];
  var seq = 1;
  var CART_KEY = "tw_cart", FORM_KEY = "tw_checkout", MAX_QTY = 99;
  function persist(){
    try{ localStorage.setItem(CART_KEY, JSON.stringify(lines.map(function(l){ return {key:l.key,qty:l.qty,note:l.note}; }))); }catch(e){}
  }
  function rehydrate(){
    try{
      var saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if(Array.isArray(saved)){
        saved.forEach(function(s){
          if(s && DATA.items[s.key] && s.qty>0){
            lines.push({ id:seq++, key:s.key, qty:Math.min(MAX_QTY, s.qty|0), note:typeof s.note==="string"?s.note:"" });
          }
        });
      }
    }catch(e){}
  }
  function fmt(n){ return "Rp " + Math.round(n).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."); }
  function feeSum(){ var f=0; (DATA.fees||[]).forEach(function(x){ f += Number(x.amount)||0; }); return f; }
  function qtyOfKey(key){ var q=0; lines.forEach(function(l){ if(l.key===key) q+=l.qty; }); return q; }
  function firstLine(key){ for(var i=0;i<lines.length;i++){ if(lines[i].key===key) return lines[i]; } return null; }
  function totals(){
    var sub=0, count=0;
    lines.forEach(function(l){ var it=DATA.items[l.key]; if(it){ sub += it.price*l.qty; count += l.qty; } });
    var tax = Math.round(sub * (Number(DATA.tax)||0) / 100);
    var fee = count>0 ? feeSum() : 0;
    return { sub:sub, tax:tax, fee:fee, total:sub+tax+fee, count:count };
  }
  function addKey(key){
    if(!DATA.items[key]) return;
    var l = firstLine(key);
    if(l){ if(l.qty < MAX_QTY) l.qty++; } else { lines.push({ id:seq++, key:key, qty:1, note:"" }); }
    renderAll();
  }
  function subKey(key){
    var l = firstLine(key);
    if(!l) return;
    l.qty--;
    if(l.qty<=0) lines = lines.filter(function(x){ return x!==l; });
    renderAll();
  }
  function setLineQty(id, delta){
    var l = null; lines.forEach(function(x){ if(x.id===id) l=x; });
    if(!l) return;
    l.qty = Math.min(MAX_QTY, l.qty + delta);
    if(l.qty<=0) lines = lines.filter(function(x){ return x!==l; });
    renderAll();
  }
  function removeLine(id){ lines = lines.filter(function(x){ return x.id!==id; }); renderAll(); }
  function splitLine(id){
    var src=null; lines.forEach(function(x){ if(x.id===id) src=x; });
    if(!src) return;
    lines.push({ id:seq++, key:src.key, qty:1, note:"" });
    renderAll();
  }
  function renderCards(){
    document.querySelectorAll(".ord-actions").forEach(function(el){
      var key = el.getAttribute("data-key");
      var q = qtyOfKey(key);
      var add = el.querySelector(".ord-add");
      var step = el.querySelector(".ord-step");
      var count = el.querySelector(".ord-count");
      if(count) count.textContent = String(q);
      if(add) add.hidden = q>0;
      if(step) step.hidden = q<=0;
    });
  }
  function renderBar(){
    var t = totals();
    var bar = document.querySelector("[data-open-cart]");
    if(!bar) return;
    bar.hidden = t.count<=0;
    var c = bar.querySelector("[data-cart-count]"); if(c) c.textContent = String(t.count);
    var tt = bar.querySelector("[data-cart-total]"); if(tt) tt.textContent = fmt(t.total);
  }
  function renderSheet(){
    var box = document.querySelector("[data-cart-lines]");
    var empty = document.querySelector("[data-cart-empty]");
    if(!box) return;
    if(empty) empty.hidden = lines.length>0;
    box.innerHTML = "";
    lines.forEach(function(l){
      var it = DATA.items[l.key]; if(!it) return;
      var line = document.createElement("div");
      line.className = "ord-cart-line";
      var top = document.createElement("div");
      top.className = "ord-cart-line-top";
      var name = document.createElement("strong"); name.textContent = it.name;
      var price = document.createElement("span"); price.className="ord-cart-line-price"; price.textContent = fmt(it.price*l.qty);
      top.appendChild(name); top.appendChild(price);
      var ctl = document.createElement("div"); ctl.className="ord-cart-line-ctl";
      var sub = document.createElement("button"); sub.type="button"; sub.textContent="−"; sub.setAttribute("aria-label","Kurangi "+it.name); sub.setAttribute("data-line-sub", String(l.id));
      var cnt = document.createElement("span"); cnt.className="ord-count"; cnt.textContent = String(l.qty);
      var plus = document.createElement("button"); plus.type="button"; plus.textContent="+"; plus.setAttribute("aria-label","Tambah "+it.name); plus.setAttribute("data-line-plus", String(l.id));
      var rm = document.createElement("button"); rm.type="button"; rm.className="rm"; rm.textContent="Hapus"; rm.setAttribute("aria-label","Hapus "+it.name); rm.setAttribute("data-line-rm", String(l.id));
      ctl.appendChild(sub); ctl.appendChild(cnt); ctl.appendChild(plus); ctl.appendChild(rm);
      var note = document.createElement("input"); note.className="ord-cart-note"; note.placeholder="Catatan (mis. pedas, tanpa bawang)"; note.maxLength=140; note.value = l.note||"";
      note.setAttribute("data-line-note", String(l.id));
      var split = document.createElement("button"); split.type="button"; split.className="ord-split"; split.textContent="+ tambah dengan catatan lain"; split.setAttribute("data-line-split", String(l.id));
      line.appendChild(top); line.appendChild(ctl); line.appendChild(note); line.appendChild(split);
      box.appendChild(line);
    });
    var t = totals();
    var setSum = function(name, val){ var e=document.querySelector('[data-sum="'+name+'"]'); if(e) e.textContent = fmt(val); };
    setSum("sub", t.sub); setSum("tax", t.tax); setSum("fee", t.fee); setSum("total", t.total);
    var taxRow = document.querySelector('[data-sum-row="tax"]'); if(taxRow) taxRow.hidden = t.tax<=0;
    var feeRow = document.querySelector('[data-sum-row="fee"]'); if(feeRow) feeRow.hidden = t.fee<=0;
    var submit = document.querySelector("[data-checkout-submit]");
    if(submit){ submit.disabled = t.count<=0 || (DATA.min>0 && t.total<DATA.min); }
  }
  function syncHidden(){
    var hid = document.querySelector("[data-cart-json]");
    if(!hid) return;
    hid.value = JSON.stringify(lines.map(function(l){
      var p = l.key.split(":");
      return { c:Number(p[0]), i:Number(p[1]), qty:l.qty, note:l.note||"" };
    }));
  }
  function renderAll(){ renderCards(); renderBar(); renderSheet(); syncHidden(); persist(); if(modal && modal.classList.contains("open")) renderModalActions(); }
  function openSheet(v){
    var sheet = document.querySelector("[data-cart-sheet]");
    if(sheet) sheet.classList.toggle("open", v);
    document.body.style.overflow = v ? "hidden" : "";
  }
  function filterCat(idx){
    document.querySelectorAll(".ord-cat").forEach(function(sec){
      sec.style.display = (idx==="all" || sec.getAttribute("data-cat")===idx) ? "" : "none";
    });
    document.querySelectorAll("[data-cat-tab]").forEach(function(tab){
      tab.classList.toggle("on", tab.getAttribute("data-cat-tab")===idx);
    });
  }
  var modal=null, modalFotos=[], modalIdx=0;
  function slideModal(d){
    if(!modal || !modalFotos.length) return;
    modalIdx = (modalIdx + d + modalFotos.length) % modalFotos.length;
    var img = modal.querySelector(".ord-modal-media img"); if(img) img.src = modalFotos[modalIdx];
    var c = modal.querySelector(".ord-modal-count"); if(c) c.textContent = (modalIdx+1)+" / "+modalFotos.length;
  }
  function renderModalActions(){
    if(!modal) return;
    var box = modal.querySelector(".ord-modal-actions"); if(!box) return;
    var data = modal.__data;
    if(!data){ box.innerHTML=""; return; }
    if(!data.a){ box.innerHTML='<span class="ord-modal-sold">Menu ini sedang habis</span>'; return; }
    var q = qtyOfKey(data.k);
    if(q<=0){ box.innerHTML='<button type="button" class="ord-btn block" data-modal-add>+ Tambah ke Keranjang</button>'; }
    else { box.innerHTML='<div class="ord-modal-step"><button type="button" data-modal-sub aria-label="Kurangi">−</button><span>'+q+'</span><button type="button" data-modal-plus aria-label="Tambah">+</button></div>'; }
  }
  function buildModal(){
    modal = document.createElement("div"); modal.className="ord-modal";
    modal.innerHTML = '<div class="ord-modal-box" role="dialog" aria-modal="true"><button type="button" class="ord-modal-close" aria-label="Tutup">\\u2715</button><div class="ord-modal-media"><img alt=""><button type="button" class="ord-modal-prev" aria-label="Sebelumnya">\\u2039</button><button type="button" class="ord-modal-next" aria-label="Berikutnya">\\u203A</button><span class="ord-modal-count"></span></div><div class="ord-modal-body"><h3></h3><span class="ord-modal-price"></span><p class="ord-modal-desc"></p><div class="ord-modal-actions"></div></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function(e){
      var t=e.target; if(!(t instanceof Element)) return;
      if(t===modal || t.classList.contains("ord-modal-close")) return closeDetail();
      if(t.classList.contains("ord-modal-prev")) return slideModal(-1);
      if(t.classList.contains("ord-modal-next")) return slideModal(1);
    });
  }
  function openDetail(card){
    if(!modal) buildModal();
    var data; try{ data=JSON.parse(card.getAttribute("data-mi")); }catch(e){ return; }
    modal.__data = data;
    modal.querySelector("h3").textContent = data.n;
    modal.querySelector(".ord-modal-price").textContent = fmt(data.p);
    var desc = modal.querySelector(".ord-modal-desc"); desc.textContent = data.d||""; desc.style.display = data.d ? "" : "none";
    modalFotos = data.f||[]; modalIdx = 0;
    var media = modal.querySelector(".ord-modal-media");
    media.style.display = modalFotos.length ? "" : "none";
    if(modalFotos.length){ var img=media.querySelector("img"); if(img) img.src=modalFotos[0]; }
    var many = modalFotos.length>1;
    ["ord-modal-prev","ord-modal-next","ord-modal-count"].forEach(function(c){ var el=modal.querySelector("."+c); if(el) el.style.display = many ? "" : "none"; });
    if(many){ var cc=modal.querySelector(".ord-modal-count"); if(cc) cc.textContent="1 / "+modalFotos.length; }
    renderModalActions();
    modal.classList.add("open"); document.body.style.overflow="hidden";
  }
  function closeDetail(){ if(modal) modal.classList.remove("open"); document.body.style.overflow=""; }
  function num(el, attr){ return Number(el.getAttribute(attr)); }
  document.addEventListener("click", function(e){
    var t = e.target;
    if(!(t instanceof Element)) return;
    var actions = t.closest(".ord-actions");
    if(actions){
      var key = actions.getAttribute("data-key");
      if(t.classList.contains("ord-add") || t.classList.contains("ord-plus")) addKey(key);
      else if(t.classList.contains("ord-sub")) subKey(key);
      return;
    }
    if(t.hasAttribute("data-line-plus")) return setLineQty(num(t,"data-line-plus"), 1);
    if(t.hasAttribute("data-line-sub")) return setLineQty(num(t,"data-line-sub"), -1);
    if(t.hasAttribute("data-line-rm")) return removeLine(num(t,"data-line-rm"));
    if(t.hasAttribute("data-line-split")) return splitLine(num(t,"data-line-split"));
    if((t.hasAttribute("data-modal-add")||t.hasAttribute("data-modal-plus")) && modal && modal.__data) return addKey(modal.__data.k);
    if(t.hasAttribute("data-modal-sub") && modal && modal.__data) return subKey(modal.__data.k);
    var tab = t.closest("[data-cat-tab]"); if(tab) return filterCat(tab.getAttribute("data-cat-tab"));
    if(t.hasAttribute("data-open-cart") || t.closest("[data-open-cart]")) return openSheet(true);
    if(t.hasAttribute("data-close-cart")) return openSheet(false);
    var oc = t.closest(".ord-item[data-mi]"); if(oc) return openDetail(oc);
  });
  document.addEventListener("keydown", function(e){
    if(e.key==="Escape"){ if(modal && modal.classList.contains("open")) closeDetail(); else openSheet(false); }
  });
  document.addEventListener("input", function(e){
    var t = e.target;
    if(!(t instanceof Element)) return;
    if(t.hasAttribute("data-line-note")){
      var id = num(t, "data-line-note");
      lines.forEach(function(l){ if(l.id===id) l.note = t.value; });
      syncHidden();
      return;
    }
    if(t.hasAttribute("data-menu-filter")){
      var q = t.value.trim().toLowerCase();
      var any = false;
      document.querySelectorAll(".ord-item").forEach(function(card){
        var match = !q || (card.getAttribute("data-name")||"").indexOf(q)>=0;
        card.style.display = match ? "" : "none";
        if(match) any = true;
      });
      document.querySelectorAll(".ord-cat").forEach(function(cat){
        var visible = cat.querySelectorAll('.ord-item:not([style*="display: none"])').length;
        cat.style.display = visible>0 ? "" : "none";
      });
      var emptyMsg = document.querySelector(".ord-empty-filter"); if(emptyMsg) emptyMsg.hidden = any;
    }
  });
  function saveForm(){
    try{
      var f={};
      ["customer_name","customer_phone","note","table_no"].forEach(function(n){var el=document.querySelector('[name="'+n+'"]'); if(el) f[n]=el.value;});
      var ff=document.querySelector('[name="fulfillment"]:checked'); if(ff) f.fulfillment=ff.value;
      var pm=document.querySelector('[name="payment_mode"]:checked'); if(pm) f.payment_mode=pm.value;
      localStorage.setItem(FORM_KEY, JSON.stringify(f));
    }catch(e){}
  }
  function syncFulfillment(){
    var ff=document.querySelector('[name="fulfillment"]:checked');
    var field=document.querySelector("[data-table-field]");
    if(field && ff) field.hidden = ff.value!=="dine_in";
    var pm=document.querySelector('[name="payment_mode"]:checked');
    var hint=document.querySelector("[data-checkout-hint]");
    if(hint) hint.textContent = (pm && pm.value==="cash")
      ? "Penjual konfirmasi dulu, lalu bayar tunai saat ambil/di tempat. Kamu dapat link pantau status."
      : "Penjual konfirmasi dulu, lalu kamu bayar. Kamu dapat link untuk memantau status.";
  }
  function restoreForm(){
    try{
      var f=JSON.parse(localStorage.getItem(FORM_KEY)||"{}");
      ["customer_name","customer_phone","note","table_no"].forEach(function(n){var el=document.querySelector('[name="'+n+'"]'); if(el && typeof f[n]==="string") el.value=f[n];});
      if(f.fulfillment){var r=document.querySelector('[name="fulfillment"][value="'+f.fulfillment+'"]'); if(r) r.checked=true;}
      if(f.payment_mode){var p=document.querySelector('[name="payment_mode"][value="'+f.payment_mode+'"]'); if(p) p.checked=true;}
    }catch(e){}
  }
  document.addEventListener("change", function(e){
    var t = e.target;
    if(!(t instanceof Element)) return;
    if(t.hasAttribute("data-fulfill") || t.getAttribute("name")==="payment_mode"){ syncFulfillment(); saveForm(); }
  });
  document.addEventListener("input", function(e){
    var t = e.target;
    if(t instanceof Element && ["customer_name","customer_phone","note","table_no"].indexOf(t.getAttribute("name")||"")>=0) saveForm();
  });
  var form = document.querySelector("[data-checkout]");
  if(form){
    form.addEventListener("submit", function(e){
      syncHidden();
      if(totals().count<=0){ e.preventDefault(); return; }
      var submit = form.querySelector("[data-checkout-submit]");
      if(submit){ submit.disabled = true; submit.textContent = "Mengirim…"; }
    });
  }
  rehydrate();
  restoreForm();
  syncFulfillment();
  renderAll();
})();
`;
