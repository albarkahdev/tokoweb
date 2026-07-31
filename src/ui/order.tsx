import { formatRupiah } from "@/domain/money";
import { ORDER_STATUS_LABELS, type OrderStatus, statusLabelFor } from "@/domain/order";
import type { PaymentLine } from "@/domain/payment-method";
import { TurnstileWidget } from "@/ui/turnstile-widget";

export type OrderMenuItem = {
  key: string;
  name: string;
  price: number;
  desc?: string;
  imageSrc?: string | null;
  available: boolean;
};

export type OrderMenuCategory = {
  label: string;
  items: OrderMenuItem[];
};

export function OrderTopNav(props: { brand: string; homeHref: string; logoSrc?: string | null }) {
  return (
    <nav class="ord-nav">
      <a class="ord-brand" href={props.homeHref}>
        {props.logoSrc ? (
          <img class="ord-logo" src={props.logoSrc} alt={props.brand} width="30" height="30" />
        ) : null}
        {props.brand}
      </a>
      <a class="ord-back" href={props.homeHref}>
        ← Kembali ke website
      </a>
    </nav>
  );
}

export function OrderClosedNotice(props: { reason?: string; homeHref: string }) {
  return (
    <div class="ord-closed">
      <div class="ord-closed-card">
        <span class="ord-closed-emoji" aria-hidden="true">
          😴
        </span>
        <h1>Pesanan sedang tutup</h1>
        <p>{props.reason?.trim() ? props.reason : "Kami sedang tidak menerima pesanan online."}</p>
        <a class="ord-btn" href={props.homeHref}>
          ← Kembali ke website
        </a>
      </div>
    </div>
  );
}

function MenuCard(props: { item: OrderMenuItem }) {
  const { item } = props;
  return (
    <article class={`ord-item${item.available ? "" : " sold"}`} data-name={item.name.toLowerCase()}>
      {item.imageSrc ? (
        <img class="ord-item-img" src={item.imageSrc} alt={item.name} loading="lazy" />
      ) : null}
      <div class="ord-item-body">
        <h3>{item.name}</h3>
        {item.desc ? <p class="ord-item-desc">{item.desc}</p> : null}
        <div class="ord-item-foot">
          <span class="ord-item-price">{formatRupiah(item.price)}</span>
          {item.available ? (
            <div class="ord-actions" data-key={item.key}>
              <button type="button" class="ord-add">
                Tambah
              </button>
              <div class="ord-step" hidden>
                <button type="button" class="ord-sub" aria-label="Kurangi">
                  −
                </button>
                <span class="ord-count">0</span>
                <button type="button" class="ord-plus" aria-label="Tambah">
                  +
                </button>
              </div>
            </div>
          ) : (
            <span class="ord-sold-badge">Habis</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function OrderMenuGrid(props: { categories: OrderMenuCategory[] }) {
  return (
    <div class="ord-menu">
      <div class="ord-filter">
        <input type="search" placeholder="Cari menu…" data-menu-filter aria-label="Cari menu" />
      </div>
      {props.categories.map((category, index) => (
        <section class="ord-cat" id={`ord-cat-${index}`}>
          <h2 class="ord-cat-title">{category.label}</h2>
          <div class="ord-cat-grid">
            {category.items.map((item) => (
              <MenuCard item={item} />
            ))}
          </div>
        </section>
      ))}
      <p class="ord-empty-filter" hidden>
        Menu tidak ditemukan. Coba kata lain.
      </p>
    </div>
  );
}

function TotalsSkeleton() {
  return (
    <div class="ord-totals">
      <div class="ord-total-row">
        <span>Subtotal</span>
        <span data-sum="sub">Rp 0</span>
      </div>
      <div class="ord-total-row" data-sum-row="tax" hidden>
        <span>Pajak</span>
        <span data-sum="tax">Rp 0</span>
      </div>
      <div class="ord-total-row" data-sum-row="fee" hidden>
        <span>Biaya</span>
        <span data-sum="fee">Rp 0</span>
      </div>
      <div class="ord-total-row grand">
        <span>Total</span>
        <span data-sum="total">Rp 0</span>
      </div>
    </div>
  );
}

export function OrderCartSheet(props: {
  action: string;
  tables: number;
  prefillTable?: string;
  minOrder: number;
  cashEnabled?: boolean;
  siteKey?: string;
}) {
  return (
    <>
      <button type="button" class="ord-bar" data-open-cart hidden>
        <span class="ord-bar-count" data-cart-count>
          0
        </span>
        <span>Lihat keranjang</span>
        <span class="ord-bar-total" data-cart-total>
          Rp 0
        </span>
      </button>
      <div class="ord-sheet" data-cart-sheet hidden>
        <div class="ord-sheet-backdrop" data-close-cart />
        <div class="ord-sheet-panel">
          <div class="ord-sheet-head">
            <h2>Keranjang</h2>
            <button type="button" class="ord-close" data-close-cart aria-label="Tutup">
              ✕
            </button>
          </div>
          <div class="ord-cart-lines" data-cart-lines />
          <p class="ord-cart-empty" data-cart-empty>
            Keranjang masih kosong. Pilih menu dulu ya.
          </p>
          <form class="ord-checkout" method="post" action={props.action} data-checkout>
            <input type="hidden" name="cart" data-cart-json value="[]" />
            <TotalsSkeleton />
            {props.minOrder > 0 ? (
              <p class="ord-min">Minimum pesanan {formatRupiah(props.minOrder)}.</p>
            ) : null}
            <div class="ord-field">
              <label for="ord-name">Nama kamu</label>
              <input
                id="ord-name"
                name="customer_name"
                required
                maxlength={60}
                placeholder="Nama"
              />
            </div>
            <div class="ord-field">
              <label for="ord-phone">No. WhatsApp (opsional)</label>
              <input
                id="ord-phone"
                name="customer_phone"
                inputmode="tel"
                maxlength={20}
                placeholder="08…"
              />
            </div>
            <div class="ord-fulfill">
              <label class="ord-radio">
                <input
                  type="radio"
                  name="fulfillment"
                  value="dine_in"
                  checked={props.tables > 0}
                  data-fulfill
                />
                <span>Makan di tempat</span>
              </label>
              <label class="ord-radio">
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  checked={props.tables <= 0}
                  data-fulfill
                />
                <span>Ambil sendiri</span>
              </label>
            </div>
            {props.cashEnabled ? (
              <div class="ord-fulfill">
                <label class="ord-radio">
                  <input type="radio" name="payment_mode" value="online" checked />
                  <span>Bayar online</span>
                </label>
                <label class="ord-radio">
                  <input type="radio" name="payment_mode" value="cash" />
                  <span>Bayar tunai di tempat</span>
                </label>
              </div>
            ) : (
              <input type="hidden" name="payment_mode" value="online" />
            )}
            <div class="ord-field" data-table-field hidden={props.tables <= 0}>
              <label for="ord-table">Nomor meja</label>
              <input
                id="ord-table"
                name="table_no"
                inputmode="numeric"
                maxlength={10}
                value={props.prefillTable ?? ""}
                placeholder="Contoh: 5"
              />
            </div>
            <div class="ord-field">
              <label for="ord-note">Catatan (opsional)</label>
              <input
                id="ord-note"
                name="note"
                maxlength={140}
                placeholder="Alergi, level pedas, dll"
              />
            </div>
            <TurnstileWidget siteKey={props.siteKey} />
            <button type="submit" class="ord-btn block" data-checkout-submit disabled>
              Kirim Pesanan
            </button>
            <p class="ord-checkout-hint">
              Penjual konfirmasi dulu, lalu kamu bayar. Kamu dapat link untuk memantau status.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export function OrderStatusView(props: {
  code: string;
  status: OrderStatus;
  cash?: boolean;
  customerName: string;
  fulfillment: "dine_in" | "pickup";
  tableNo?: string | null;
  items: { name: string; qty: number; unit_price: number; item_note?: string | null }[];
  subtotal: number;
  taxAmount: number;
  feeAmount: number;
  total: number;
  createdLabel: string;
  waReceiptHref: string;
  justCreated?: boolean;
  children?: unknown;
}) {
  const steps: { key: OrderStatus; label: string }[] = props.cash
    ? [
        { key: "baru", label: "Diterima" },
        { key: "diproses", label: "Dibuat" },
        { key: "siap", label: props.fulfillment === "dine_in" ? "Disajikan" : "Siap" },
        { key: "selesai", label: "Selesai" },
      ]
    : [
        { key: "baru", label: "Diterima" },
        { key: "menunggu_bayar", label: "Konfirmasi" },
        { key: "cek_bayar", label: "Bayar" },
        { key: "diproses", label: "Dibuat" },
        { key: "siap", label: props.fulfillment === "dine_in" ? "Disajikan" : "Siap" },
        { key: "selesai", label: "Selesai" },
      ];
  const order = steps.map((step) => step.key);
  const activeIndex =
    props.status === "dibatalkan" ? -1 : order.indexOf(props.status as OrderStatus);
  return (
    <div class="ord-status">
      {props.justCreated ? (
        <div class="ord-flash">✅ Pesanan terkirim! Tunjukkan halaman ini atau simpan linknya.</div>
      ) : null}
      <div class="ord-status-head">
        <span class="ord-code">#{props.code}</span>
        <span class={`ord-badge s-${props.status}`}>
          {statusLabelFor(props.status, props.fulfillment)}
        </span>
      </div>
      {props.status === "dibatalkan" ? (
        <p class="ord-cancelled">Pesanan ini dibatalkan.</p>
      ) : (
        <ol class="ord-timeline">
          {steps.map((step, index) => (
            <li class={index <= activeIndex ? "done" : ""}>
              <span class="ord-dot" aria-hidden="true" />
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      )}
      <div class="ord-card">
        <div class="ord-summary-head">
          <span>{props.customerName}</span>
          <span>
            {props.fulfillment === "dine_in"
              ? `Makan di tempat · Meja ${props.tableNo ?? "-"}`
              : "Ambil sendiri"}
          </span>
        </div>
        <ul class="ord-lines">
          {props.items.map((item) => (
            <li>
              <span>
                {item.qty}× {item.name}
                {item.item_note ? <em> · {item.item_note}</em> : null}
              </span>
              <span>{formatRupiah(item.unit_price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div class="ord-totals">
          <div class="ord-total-row">
            <span>Subtotal</span>
            <span>{formatRupiah(props.subtotal)}</span>
          </div>
          {props.taxAmount > 0 ? (
            <div class="ord-total-row">
              <span>Pajak</span>
              <span>{formatRupiah(props.taxAmount)}</span>
            </div>
          ) : null}
          {props.feeAmount > 0 ? (
            <div class="ord-total-row">
              <span>Biaya</span>
              <span>{formatRupiah(props.feeAmount)}</span>
            </div>
          ) : null}
          <div class="ord-total-row grand">
            <span>Total</span>
            <span>{formatRupiah(props.total)}</span>
          </div>
        </div>
        <p class="ord-meta">Dibuat {props.createdLabel}</p>
      </div>
      {props.children as never}
      <a class="ord-btn secondary block" href={props.waReceiptHref} target="_blank" rel="noopener">
        💬 Kirim struk ke WhatsApp
      </a>
    </div>
  );
}

export function OrderStatusHint(props: {
  status: OrderStatus;
  cash?: boolean;
  fulfillment: "dine_in" | "pickup";
}) {
  const cashPay = props.cash
    ? props.fulfillment === "dine_in"
      ? " Bayar tunai di kasir/meja ya."
      : " Bayar tunai saat ambil ya."
    : "";
  const map: Partial<Record<OrderStatus, string>> = {
    baru: `Menunggu penjual menerima pesananmu.${cashPay} Halaman ini diperbarui otomatis.`,
    cek_bayar: "Bukti bayar terkirim. Penjual sedang memverifikasi pembayaranmu.",
    diproses: `Pesananmu sedang disiapkan 🍳${cashPay}`,
    siap:
      props.fulfillment === "dine_in"
        ? "Pesananmu siap disajikan 🎉"
        : `Pesananmu siap diambil 🎉${cashPay}`,
    selesai: "Pesanan selesai. Terima kasih! 🙏",
  };
  const text = map[props.status];
  if (!text) return null;
  return <p class="ord-hint">{text}</p>;
}

export function PaymentPanel(props: {
  action: string;
  methods: {
    id: number;
    type: "qris" | "transfer" | "ewallet";
    typeLabel: string;
    label: string;
    imageSrc?: string | null;
    lines: PaymentLine[];
  }[];
  siteKey?: string;
}) {
  return (
    <form
      class="ord-pay"
      method="post"
      action={props.action}
      data-webp-upload
      enctype="multipart/form-data"
    >
      <h2 class="ord-pay-title">Pilih metode pembayaran</h2>
      {props.methods.length === 0 ? (
        <p class="ord-hint">
          Penjual belum memasang metode pembayaran. Hubungi penjual via WhatsApp ya.
        </p>
      ) : (
        <div class="ord-methods">
          {props.methods.map((method, index) => (
            <label class="ord-method">
              <input
                type="radio"
                name="payment_method_id"
                value={String(method.id)}
                required
                checked={index === 0}
              />
              <div class="ord-method-body">
                <div class="ord-method-head">
                  <strong>{method.label}</strong>
                  <span class="ord-method-type">{method.typeLabel}</span>
                </div>
                {method.imageSrc ? (
                  <img class="ord-qr" src={method.imageSrc} alt={`QR ${method.label}`} />
                ) : null}
                {method.lines.length > 0 ? (
                  <dl class="ord-method-lines">
                    {method.lines.map((line) => (
                      <div>
                        <dt>{line.label}</dt>
                        <dd>{line.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </label>
          ))}
          <div class="ord-field">
            <label for="ord-proof">Upload bukti bayar (opsional)</label>
            <input id="ord-proof" name="proof" type="file" accept="image/*" />
            <span class="ord-field-hint">Otomatis dikompres. Boleh dilewati.</span>
          </div>
          <TurnstileWidget siteKey={props.siteKey} />
          <button type="submit" class="ord-btn block">
            Sudah Bayar
          </button>
        </div>
      )}
    </form>
  );
}
