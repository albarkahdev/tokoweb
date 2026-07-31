export const ORDER_CSS = `
.ord-nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.85rem 1.1rem;background:var(--surface);border-bottom:1px solid rgba(0,0,0,0.08);box-shadow:var(--shadow-card)}
.ord-brand{display:flex;align-items:center;gap:0.5rem;font-family:var(--f-heading);font-weight:800;font-size:1.05rem;color:var(--text);text-decoration:none}
.ord-logo{width:30px;height:30px;object-fit:contain;border-radius:6px}
.ord-back{font-size:0.85rem;color:var(--muted);text-decoration:none}
.ord-back:hover{color:var(--primary)}
.ord-nav-links{display:flex;gap:0.9rem;align-items:center}
.ord-my-list{display:flex;flex-direction:column;gap:0.6rem;margin:0.9rem 0}
.ord-my-item{display:block;background:var(--surface);border:1px solid rgba(0,0,0,0.08);border-radius:var(--r-card);padding:0.8rem 1rem;text-decoration:none;color:var(--text);font-weight:700;box-shadow:var(--shadow-card)}
.ord-wrap{max-width:760px;margin:0 auto;padding:1.1rem 1.1rem 7rem}
.ord-lede{color:var(--muted);font-size:0.95rem;margin:0 0 1.1rem}
[hidden]{display:none!important}
.ord-sticky{position:sticky;top:57px;z-index:10;background:var(--bg);padding:0.5rem 0 0.5rem}
.ord-filter input{width:100%;box-sizing:border-box;padding:0.7rem 0.95rem;border:1px solid rgba(0,0,0,0.14);border-radius:99px;font:inherit;background:var(--surface);color:var(--text)}
.ord-tabs{display:flex;gap:0.45rem;overflow-x:auto;margin-top:0.55rem;padding-bottom:0.15rem;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.ord-tabs::-webkit-scrollbar{display:none}
.ord-tab{flex:0 0 auto;border:1px solid rgba(0,0,0,0.14);background:var(--surface);color:var(--muted);font:inherit;font-size:0.85rem;font-weight:700;padding:0.45rem 0.95rem;border-radius:99px;cursor:pointer;white-space:nowrap}
.ord-tab.on{background:var(--primary);color:var(--primary-contrast);border-color:var(--primary)}
.ord-cat{margin:0 0 1.4rem}
.ord-cat-title{font-family:var(--f-heading);font-size:1.1rem;margin:0.4rem 0 0.7rem;color:var(--text)}
.ord-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.7rem}
.ord-item{position:relative;display:flex;flex-direction:column;background:var(--surface);border:1px solid rgba(0,0,0,0.07);border-radius:var(--r-card);overflow:hidden;box-shadow:var(--shadow-card)}
.ord-item.sold{opacity:0.65}
.ord-item-open{position:absolute;inset:0;z-index:1;width:100%;height:100%;padding:0;border:none;background:transparent;cursor:pointer}
.ord-item-photo{position:relative;flex:0 0 auto;aspect-ratio:1/1;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden}
.ord-item-img{width:100%;height:100%;object-fit:cover;display:block}
.ord-item-ph{font-size:2rem;opacity:0.45}
.ord-item-body{display:flex;flex-direction:column;gap:0.4rem;padding:0.6rem 0.7rem 0.7rem;flex:1}
.ord-item-body h3{margin:0;font-size:0.92rem;font-family:var(--f-heading);color:var(--text);line-height:1.25}
.ord-item-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:0.4rem 0.5rem;flex-wrap:wrap}
.ord-item-foot .ord-actions{margin-left:auto}
.ord-item-price{font-weight:800;color:var(--text);font-size:0.9rem;white-space:nowrap}
.ord-item-body h3{-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
.ord-sold-badge{position:absolute;top:0.5rem;left:0.5rem;font-size:0.72rem;font-weight:700;color:#b42318;background:#fee4e2;padding:0.2rem 0.5rem;border-radius:99px}
.ord-actions{position:relative;z-index:2;flex-shrink:0}
.ord-add{width:36px;height:36px;border-radius:50%;border:none;background:var(--primary);color:var(--primary-contrast);font-size:1.45rem;font-weight:700;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15)}
.ord-step{display:flex;align-items:center;gap:0.3rem}
.ord-step button{width:30px;height:30px;border-radius:50%;border:none;background:var(--primary);color:var(--primary-contrast);font-size:1.05rem;font-weight:800;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center}
.ord-count{min-width:0.9rem;text-align:center;font-weight:800;color:var(--text);font-size:0.9rem}
.ord-empty-filter{text-align:center;color:var(--muted);padding:2rem 0}
.ord-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:1rem;z-index:30;display:flex;align-items:center;gap:0.7rem;width:min(92%,600px);border:none;cursor:pointer;padding:0.9rem 1.1rem;border-radius:99px;background:var(--primary);color:var(--primary-contrast);font:inherit;font-weight:700;box-shadow:var(--shadow-pop,0 10px 30px rgba(0,0,0,0.2))}
.ord-bar-count{background:var(--primary-contrast);color:var(--primary);min-width:1.5rem;height:1.5rem;border-radius:99px;display:flex;align-items:center;justify-content:center;font-weight:800}
.ord-bar-total{margin-left:auto}
.ord-sheet{position:fixed;inset:0;z-index:40;visibility:hidden}
.ord-sheet.open{visibility:visible}
.ord-sheet-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.45);opacity:0;transition:opacity 0.2s ease}
.ord-sheet.open .ord-sheet-backdrop{opacity:1}
.ord-sheet-panel{position:absolute;left:0;right:0;bottom:0;max-height:92vh;overflow-y:auto;background:var(--bg);border-radius:1.2rem 1.2rem 0 0;padding:1.1rem 1.1rem 2rem;max-width:600px;margin:0 auto;transform:translateY(100%);transition:transform 0.25s ease}
.ord-sheet.open .ord-sheet-panel{transform:translateY(0)}
.ord-sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem}
.ord-sheet-head h2{margin:0;font-family:var(--f-heading);font-size:1.2rem;color:var(--text)}
.ord-close{border:none;background:transparent;font-size:1.2rem;cursor:pointer;color:var(--muted);min-width:40px;min-height:40px}
.ord-empty-menu{text-align:center;padding:3rem 1rem;color:var(--muted)}
.ord-empty-emoji{font-size:2.6rem}
.ord-empty-menu h2{font-family:var(--f-heading);color:var(--text);margin:0.6rem 0 0.3rem}
.ord-cart-lines{display:flex;flex-direction:column;gap:0.7rem;margin-bottom:0.5rem}
.ord-cart-line{background:var(--surface);border:1px solid rgba(0,0,0,0.07);border-radius:var(--r-card);padding:0.7rem}
.ord-cart-line-top{display:flex;justify-content:space-between;gap:0.6rem;align-items:flex-start}
.ord-cart-line-top strong{font-size:0.95rem;color:var(--text)}
.ord-cart-line-price{font-weight:800;white-space:nowrap;color:var(--text)}
.ord-cart-line-ctl{display:flex;align-items:center;gap:0.6rem;margin-top:0.5rem}
.ord-cart-line-ctl button{width:40px;height:40px;border-radius:50%;border:1px solid var(--primary);background:var(--primary);color:var(--primary-contrast);font-weight:800;cursor:pointer}
.ord-cart-line-ctl .rm{border-color:transparent;background:transparent;color:var(--muted);margin-left:auto;font-size:0.82rem;width:auto;min-height:40px;padding:0 0.4rem}
.ord-cart-note{margin-top:0.5rem;width:100%;box-sizing:border-box;padding:0.5rem 0.7rem;border:1px solid rgba(0,0,0,0.14);border-radius:var(--r-btn);font:inherit;font-size:0.85rem;background:var(--bg);color:var(--text)}
.ord-split{margin-top:0.4rem;background:none;border:none;color:var(--primary);font:inherit;font-size:0.8rem;font-weight:600;cursor:pointer;padding:0.1rem 0}
.ord-cart-empty{color:var(--muted);text-align:center;padding:1.2rem 0}
.ord-totals{margin:0.8rem 0;padding:0.8rem 0;border-top:1px dashed rgba(0,0,0,0.15);border-bottom:1px dashed rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:0.35rem}
.ord-total-row{display:flex;justify-content:space-between;font-size:0.92rem;color:var(--muted)}
.ord-total-row.grand{font-size:1.05rem;font-weight:800;color:var(--text)}
.ord-min{color:#b54708;font-size:0.83rem;margin:0.2rem 0}
.ord-field{display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.7rem}
.ord-field label{font-size:0.85rem;font-weight:600;color:var(--text)}
.ord-field input{padding:0.7rem 0.9rem;border:1px solid rgba(0,0,0,0.14);border-radius:var(--r-btn);font:inherit;background:var(--surface);color:var(--text)}
.ord-field-hint{font-size:0.78rem;color:var(--muted)}
.ord-fulfill{display:flex;gap:0.6rem;margin-bottom:0.8rem}
.ord-radio{flex:1;display:flex;align-items:center;gap:0.5rem;min-height:52px;padding:0.7rem 0.85rem;border:1px solid rgba(0,0,0,0.14);border-radius:var(--r-btn);cursor:pointer;font-size:0.9rem;line-height:1.25;color:var(--text);background:var(--surface);transition:border-color 0.15s,background 0.15s}
.ord-radio:has(input:checked){border-color:var(--primary);background:color-mix(in srgb,var(--primary) 8%,var(--surface))}
.ord-radio input{accent-color:var(--primary);flex-shrink:0}
.ord-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;padding:0.85rem 1.4rem;border:none;border-radius:var(--r-btn);background:var(--primary);color:var(--primary-contrast);font:inherit;font-weight:800;cursor:pointer;text-decoration:none}
.ord-btn.secondary{background:transparent;color:var(--primary);border:1px solid var(--primary)}
.ord-btn.block{display:flex;width:100%;box-sizing:border-box;margin-top:0.4rem}
.ord-btn:disabled{opacity:0.5;cursor:not-allowed}
.ord-checkout-hint{font-size:0.8rem;color:var(--muted);text-align:center;margin:0.6rem 0 0}
.ord-closed{min-height:70vh;display:flex;align-items:center;justify-content:center;padding:2rem 1.1rem}
.ord-closed-card{text-align:center;max-width:380px;background:var(--surface);border-radius:var(--r-card);padding:2rem 1.5rem;box-shadow:var(--shadow-card)}
.ord-closed-emoji{font-size:2.6rem}
.ord-closed-card h1{font-family:var(--f-heading);font-size:1.4rem;margin:0.6rem 0 0.4rem;color:var(--text)}
.ord-closed-card p{color:var(--muted);margin:0 0 1.2rem}
.ord-status{max-width:560px;margin:0 auto;padding:1.2rem 1.1rem 3rem}
.ord-status-flush{padding-bottom:0}
.ord-flash{background:#ecfdf3;color:#027a48;border:1px solid #a6f4c5;border-radius:var(--r-card);padding:0.8rem 1rem;margin-bottom:1rem;font-size:0.9rem}
.ord-demo-note{background:#fffaeb;color:#b54708;border:1px solid #fedf89;border-radius:var(--r-card);padding:0.75rem 1rem;margin-bottom:0.9rem;font-size:0.88rem;font-weight:600}
.ord-status-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.ord-code{font-family:var(--f-heading);font-weight:800;font-size:1.3rem;color:var(--text)}
.ord-badge{font-size:0.8rem;font-weight:700;padding:0.3rem 0.7rem;border-radius:99px;background:var(--surface);color:var(--text);border:1px solid rgba(0,0,0,0.1)}
.ord-badge.s-diproses{background:#eff8ff;color:#175cd3;border-color:#b2ddff}
.ord-badge.s-siap{background:#fef0c7;color:#b54708;border-color:#fedf89}
.ord-badge.s-selesai{background:#ecfdf3;color:#027a48;border-color:#a6f4c5}
.ord-badge.s-dibatalkan{background:#fef3f2;color:#b42318;border-color:#fecdca}
.ord-timeline{list-style:none;display:flex;justify-content:space-between;padding:0;margin:0 0 1.4rem;position:relative}
.ord-timeline li{flex:1;text-align:center;font-size:0.72rem;color:var(--muted);position:relative}
.ord-timeline li::before{content:"";position:absolute;top:6px;right:50%;width:100%;height:3px;border-radius:2px;background:rgba(0,0,0,0.12);z-index:0}
.ord-timeline li:first-child::before{display:none}
.ord-timeline li.done::before{background:var(--primary)}
.ord-timeline .ord-dot{position:relative;z-index:1;display:block;width:14px;height:14px;border-radius:50%;background:var(--surface);border:2px solid rgba(0,0,0,0.2);margin:0 auto 0.35rem;transition:background 0.3s ease,border-color 0.3s ease}
.ord-timeline li.done{color:var(--text);font-weight:700}
.ord-timeline li.done .ord-dot{background:var(--primary);border-color:var(--primary)}
.ord-cancelled{text-align:center;color:#b42318;font-weight:600;margin:1rem 0}
.ord-card{background:var(--surface);border:1px solid rgba(0,0,0,0.07);border-radius:var(--r-card);padding:1rem;box-shadow:var(--shadow-card)}
.ord-summary-head{display:flex;justify-content:space-between;font-size:0.85rem;color:var(--muted);margin-bottom:0.7rem;gap:0.6rem}
.ord-lines{list-style:none;padding:0;margin:0 0 0.5rem;display:flex;flex-direction:column;gap:0.45rem}
.ord-lines li{display:flex;justify-content:space-between;gap:0.6rem;font-size:0.9rem;color:var(--text)}
.ord-lines em{color:var(--muted);font-style:normal;font-size:0.82rem}
.ord-meta{font-size:0.78rem;color:var(--muted);margin:0.6rem 0 0}
.ord-hint{background:var(--surface);border:1px solid rgba(0,0,0,0.07);border-radius:var(--r-card);padding:0.8rem 1rem;color:var(--muted);font-size:0.88rem;margin:1rem 0}
.ord-pay{margin-top:1rem}
.ord-pay-title{font-family:var(--f-heading);font-size:1.1rem;margin:0 0 0.7rem;color:var(--text)}
.ord-methods{display:flex;flex-direction:column;gap:0.7rem}
.ord-method{display:flex;gap:0.7rem;background:var(--surface);border:1px solid rgba(0,0,0,0.1);border-radius:var(--r-card);padding:0.8rem;cursor:pointer}
.ord-method input{margin-top:0.2rem;accent-color:var(--primary)}
.ord-method-body{flex:1;min-width:0}
.ord-method-head{display:flex;justify-content:space-between;gap:0.5rem;align-items:center}
.ord-method-type{font-size:0.75rem;color:var(--muted);background:var(--bg);padding:0.15rem 0.5rem;border-radius:99px}
.ord-qr{display:block;max-width:220px;width:100%;margin:0.7rem auto 0;border-radius:8px}
.ord-method-lines{margin:0.6rem 0 0;display:flex;flex-direction:column;gap:0.3rem}
.ord-method-lines div{display:flex;justify-content:space-between;gap:0.6rem;font-size:0.88rem}
.ord-method-lines dt{color:var(--muted);margin:0}
.ord-method-lines dd{margin:0;font-weight:700;color:var(--text)}
.ord-modal{position:fixed;inset:0;z-index:50;visibility:hidden;display:flex;align-items:flex-end;justify-content:center}
.ord-modal.open{visibility:visible}
.ord-modal::before{content:"";position:absolute;inset:0;background:rgba(0,0,0,0.5);opacity:0;transition:opacity 0.2s ease}
.ord-modal.open::before{opacity:1}
.ord-modal-box{position:relative;z-index:1;width:100%;max-width:480px;background:var(--bg);border-radius:1.2rem 1.2rem 0 0;overflow-y:auto;max-height:92vh;transform:translateY(100%);transition:transform 0.25s ease}
.ord-modal.open .ord-modal-box{transform:translateY(0)}
.ord-modal-media{position:relative;aspect-ratio:4/3;background:var(--surface)}
.ord-modal-media img{width:100%;height:100%;object-fit:cover;display:block}
.ord-modal-close{position:absolute;top:0.7rem;right:0.7rem;z-index:2;width:38px;height:38px;border-radius:50%;border:none;background:rgba(0,0,0,0.55);color:#fff;font-size:1.05rem;cursor:pointer}
.ord-modal-prev,.ord-modal-next{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(0,0,0,0.45);color:#fff;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
.ord-modal-prev{left:0.6rem}
.ord-modal-next{right:0.6rem}
.ord-modal-count{position:absolute;bottom:0.6rem;right:0.6rem;background:rgba(0,0,0,0.6);color:#fff;font-size:0.75rem;padding:0.15rem 0.55rem;border-radius:99px}
.ord-modal-body{padding:1rem 1.1rem 1.5rem}
.ord-modal-body h3{margin:0;font-family:var(--f-heading);font-size:1.3rem;color:var(--text)}
.ord-modal-price{display:block;font-weight:800;color:var(--primary);font-size:1.1rem;margin:0.3rem 0 0.7rem}
.ord-modal-desc{margin:0 0 1.1rem;color:var(--muted);line-height:1.55;font-size:0.92rem}
.ord-modal-sold{display:block;text-align:center;color:#b42318;font-weight:700;padding:0.7rem}
.ord-modal-step{display:flex;align-items:center;justify-content:center;gap:1.3rem}
.ord-modal-step button{width:46px;height:46px;border-radius:50%;border:none;background:var(--primary);color:var(--primary-contrast);font-size:1.4rem;font-weight:800;cursor:pointer;line-height:1}
.ord-modal-step span{font-size:1.2rem;font-weight:800;min-width:1.6rem;text-align:center;color:var(--text)}
`;
