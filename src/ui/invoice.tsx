import { formatRupiah } from "@/domain/money";

export type InvoiceData = {
  number: string;
  dateLabel: string;
  paid: boolean;
  business: string;
  address?: string;
  lineLabel: string;
  amount: number;
  method?: string;
};

const INVOICE_CSS = `
*{box-sizing:border-box;margin:0}
:root{--ink:#1C1917;--muted:#6B655E;--brand:#C4501B;--line:#E7DFD3;--bg:#FBF7F0}
body{font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink);line-height:1.55;-webkit-font-smoothing:antialiased}
.sheet{max-width:44rem;margin:1.2rem auto;background:#fff;border:1px solid var(--line);border-radius:1rem;overflow:hidden;box-shadow:0 18px 50px -22px rgb(28 25 23 / 0.28)}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;padding:1.6rem 1.8rem;background:linear-gradient(135deg,#C4501B,#E8632C);color:#fff;flex-wrap:wrap}
.brand{font-size:1.4rem;font-weight:800;letter-spacing:-0.02em}
.brand span{opacity:0.85;font-weight:600;font-size:0.85rem;display:block;margin-top:0.15rem}
.inv-meta{text-align:right;font-size:0.85rem}
.inv-meta .num{font-weight:800;font-size:1rem}
.body{padding:1.6rem 1.8rem}
.parties{display:flex;justify-content:space-between;gap:1.2rem;flex-wrap:wrap;margin-bottom:1.4rem}
.parties h3{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);margin-bottom:0.3rem}
.parties strong{font-size:1rem}
.parties p{font-size:0.85rem;color:var(--muted)}
.status{display:inline-block;font-weight:800;font-size:0.8rem;padding:0.3rem 0.9rem;border-radius:9999px}
.status.paid{background:#E7F6EC;color:#1B7C36}
.status.due{background:#FDECEC;color:#B3261E}
table{width:100%;border-collapse:collapse;margin:0.5rem 0 1rem}
th{text-align:left;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted);border-bottom:1px solid var(--line);padding:0.6rem 0}
td{padding:0.8rem 0;border-bottom:1px solid var(--line);font-size:0.92rem;vertical-align:top}
td.amt,th.amt{text-align:right;white-space:nowrap}
.total{display:flex;justify-content:flex-end;gap:2rem;padding:0.6rem 0;font-size:1.1rem;font-weight:800}
.total .lbl{color:var(--muted);font-weight:600}
.note{margin-top:1.2rem;font-size:0.8rem;color:var(--muted);border-top:1px dashed var(--line);padding-top:1rem}
.actions{max-width:44rem;margin:0 auto 2rem;display:flex;gap:0.6rem;justify-content:flex-end;padding:0 0.5rem}
.btn{font-family:inherit;font-size:0.9rem;font-weight:700;border:none;border-radius:0.6rem;padding:0.65rem 1.3rem;cursor:pointer}
.btn.print{background:var(--brand);color:#fff}
.btn.back{background:#fff;color:var(--ink);border:1px solid var(--line);text-decoration:none;display:inline-flex;align-items:center}
@media print{body{background:#fff}.sheet{box-shadow:none;border:none;margin:0;max-width:none}.actions{display:none}}
`;

export type OrderInvoiceData = {
  code: string;
  dateLabel: string;
  business: string;
  address?: string;
  customerName: string;
  fulfillmentLabel: string;
  statusLabel: string;
  paid: boolean;
  items: { name: string; qty: number; unit_price: number; item_note?: string | null }[];
  subtotal: number;
  taxAmount: number;
  feeAmount: number;
  total: number;
  note?: string;
  method?: string;
};

export function renderOrderInvoiceHtml(data: OrderInvoiceData, backHref: string): string {
  const page = (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>{`Struk ${data.code} — ${data.business}`}</title>
        <style dangerouslySetInnerHTML={{ __html: INVOICE_CSS }} />
      </head>
      <body>
        <div class="sheet">
          <div class="top">
            <div class="brand">
              {data.business}
              {data.address ? <span>{data.address}</span> : null}
            </div>
            <div class="inv-meta">
              <div class="num">#{data.code}</div>
              <div>{data.dateLabel}</div>
            </div>
          </div>
          <div class="body">
            <div class="parties">
              <div>
                <h3>Pesanan untuk</h3>
                <strong>{data.customerName}</strong>
                <p>{data.fulfillmentLabel}</p>
              </div>
              <div>
                <span class={`status ${data.paid ? "paid" : "due"}`}>{data.statusLabel}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="amt">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr>
                    <td>
                      {item.qty}× {item.name}
                      {item.item_note ? <div class="muted">{item.item_note}</div> : null}
                    </td>
                    <td class="amt">{formatRupiah(item.unit_price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div class="total">
              <span class="lbl">Subtotal</span>
              <span>{formatRupiah(data.subtotal)}</span>
            </div>
            {data.taxAmount > 0 ? (
              <div class="total">
                <span class="lbl">Pajak</span>
                <span>{formatRupiah(data.taxAmount)}</span>
              </div>
            ) : null}
            {data.feeAmount > 0 ? (
              <div class="total">
                <span class="lbl">Biaya</span>
                <span>{formatRupiah(data.feeAmount)}</span>
              </div>
            ) : null}
            <div class="total">
              <span class="lbl">Total</span>
              <span>{formatRupiah(data.total)}</span>
            </div>
            <p class="note">
              {data.method ? `Metode pembayaran: ${data.method}. ` : ""}
              {data.note ? `Catatan: ${data.note}. ` : ""}
              Dibuat dengan tokoweb.id
            </p>
          </div>
        </div>
        <div class="actions">
          <a class="btn back" href={backHref}>
            ← Kembali
          </a>
          <button type="button" class="btn print" onclick="window.print()">
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </body>
    </html>
  );
  return `<!doctype html>${String(page)}`;
}

export function renderInvoiceHtml(data: InvoiceData, backHref: string): string {
  const page = (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>{`Invoice ${data.number} — tokoweb`}</title>
        <style dangerouslySetInnerHTML={{ __html: INVOICE_CSS }} />
      </head>
      <body>
        <div class="sheet">
          <div class="top">
            <div class="brand">
              tokoweb.id
              <span>Website kilat untuk UMKM Indonesia</span>
            </div>
            <div class="inv-meta">
              <div class="num">{data.number}</div>
              <div>Tanggal: {data.dateLabel}</div>
            </div>
          </div>
          <div class="body">
            <div class="parties">
              <div>
                <h3>Ditagihkan ke</h3>
                <strong>{data.business}</strong>
                {data.address ? <p>{data.address}</p> : null}
              </div>
              <div>
                <span class={`status ${data.paid ? "paid" : "due"}`}>
                  {data.paid ? "LUNAS ✓" : "BELUM DIBAYAR"}
                </span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Deskripsi</th>
                  <th class="amt">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.lineLabel}</td>
                  <td class="amt">{formatRupiah(data.amount)}</td>
                </tr>
              </tbody>
            </table>
            <div class="total">
              <span class="lbl">Total</span>
              <span>{formatRupiah(data.amount)}</span>
            </div>
            <p class="note">
              {data.method ? `Metode pembayaran: ${data.method}. ` : ""}
              Terima kasih telah menjadi bagian dari tokoweb.id. Invoice ini sah tanpa tanda tangan.
            </p>
          </div>
        </div>
        <div class="actions">
          <a class="btn back" href={backHref}>
            ← Kembali
          </a>
          <button type="button" class="btn print" onclick="window.print()">
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </body>
    </html>
  );
  return `<!doctype html>${String(page)}`;
}
