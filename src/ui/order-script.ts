export const ORDER_SCRIPT = `
(function(){
  var DATA = window.__ORDER__ || { items:{}, tax:0, fees:[], min:0 };
  var cart = {};
  function fmt(n){ return "Rp " + Math.round(n).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."); }
  function feeSum(){ var f=0; (DATA.fees||[]).forEach(function(x){ f += Number(x.amount)||0; }); return f; }
  function totals(){
    var sub=0, count=0;
    Object.keys(cart).forEach(function(k){ var it=DATA.items[k]; if(it){ sub += it.price*cart[k].qty; count += cart[k].qty; } });
    var tax = Math.round(sub * (Number(DATA.tax)||0) / 100);
    var fee = count>0 ? feeSum() : 0;
    return { sub:sub, tax:tax, fee:fee, total:sub+tax+fee, count:count };
  }
  function qtyOf(k){ return cart[k] ? cart[k].qty : 0; }
  function setQty(k, q){
    if(!DATA.items[k]) return;
    if(q<=0){ delete cart[k]; }
    else { cart[k] = cart[k] || { qty:0, note:"" }; cart[k].qty = q; }
    renderCards(); renderBar(); renderSheet(); syncHidden();
  }
  function renderCards(){
    document.querySelectorAll(".ord-actions").forEach(function(el){
      var k = el.getAttribute("data-key");
      var q = qtyOf(k);
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
    var keys = Object.keys(cart);
    if(empty) empty.hidden = keys.length>0;
    box.innerHTML = "";
    keys.forEach(function(k){
      var it = DATA.items[k]; if(!it) return;
      var line = document.createElement("div");
      line.className = "ord-cart-line";
      var top = document.createElement("div");
      top.className = "ord-cart-line-top";
      var name = document.createElement("strong"); name.textContent = it.name;
      var price = document.createElement("span"); price.className="ord-cart-line-price"; price.textContent = fmt(it.price*cart[k].qty);
      top.appendChild(name); top.appendChild(price);
      var ctl = document.createElement("div"); ctl.className="ord-cart-line-ctl";
      var sub = document.createElement("button"); sub.type="button"; sub.textContent="−"; sub.setAttribute("data-cart-sub", k);
      var cnt = document.createElement("span"); cnt.className="ord-count"; cnt.textContent = String(cart[k].qty);
      var plus = document.createElement("button"); plus.type="button"; plus.textContent="+"; plus.setAttribute("data-cart-plus", k);
      var rm = document.createElement("button"); rm.type="button"; rm.className="rm"; rm.textContent="Hapus"; rm.setAttribute("data-cart-rm", k);
      ctl.appendChild(sub); ctl.appendChild(cnt); ctl.appendChild(plus); ctl.appendChild(rm);
      var note = document.createElement("input"); note.className="ord-cart-note"; note.placeholder="Catatan (opsional)"; note.maxLength=140; note.value = cart[k].note||"";
      note.setAttribute("data-cart-note", k);
      line.appendChild(top); line.appendChild(ctl); line.appendChild(note);
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
    var arr = Object.keys(cart).map(function(k){
      var p = k.split(":");
      return { c:Number(p[0]), i:Number(p[1]), qty:cart[k].qty, note:cart[k].note||"" };
    });
    hid.value = JSON.stringify(arr);
  }
  function openSheet(v){
    var sheet = document.querySelector("[data-cart-sheet]");
    if(sheet) sheet.hidden = !v;
    document.body.style.overflow = v ? "hidden" : "";
  }
  document.addEventListener("click", function(e){
    var t = e.target;
    if(!(t instanceof Element)) return;
    var actions = t.closest(".ord-actions");
    if(actions){
      var k = actions.getAttribute("data-key");
      if(t.classList.contains("ord-add") || t.classList.contains("ord-plus")) setQty(k, qtyOf(k)+1);
      else if(t.classList.contains("ord-sub")) setQty(k, qtyOf(k)-1);
      return;
    }
    if(t.hasAttribute("data-cart-plus")) return setQty(t.getAttribute("data-cart-plus"), qtyOf(t.getAttribute("data-cart-plus"))+1);
    if(t.hasAttribute("data-cart-sub")) return setQty(t.getAttribute("data-cart-sub"), qtyOf(t.getAttribute("data-cart-sub"))-1);
    if(t.hasAttribute("data-cart-rm")) return setQty(t.getAttribute("data-cart-rm"), 0);
    if(t.hasAttribute("data-open-cart") || t.closest("[data-open-cart]")) return openSheet(true);
    if(t.hasAttribute("data-close-cart")) return openSheet(false);
  });
  document.addEventListener("input", function(e){
    var t = e.target;
    if(!(t instanceof Element)) return;
    if(t.hasAttribute("data-cart-note")){
      var k = t.getAttribute("data-cart-note");
      if(cart[k]){ cart[k].note = t.value; syncHidden(); }
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
  document.addEventListener("change", function(e){
    var t = e.target;
    if(!(t instanceof Element) || !t.hasAttribute("data-fulfill")) return;
    var field = document.querySelector("[data-table-field]");
    if(field) field.hidden = t.value !== "dine_in";
  });
  var form = document.querySelector("[data-checkout]");
  if(form){
    form.addEventListener("submit", function(e){
      syncHidden();
      var t = totals();
      if(t.count<=0){ e.preventDefault(); return; }
    });
  }
  renderCards(); renderBar(); renderSheet(); syncHidden();
})();
`;
