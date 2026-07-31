import { formatRupiah } from "@/domain/money";
import { PLAN_PRICES, setupFee } from "@/domain/plan";

const BROCHURE_CSS = `
*{box-sizing:border-box;margin:0}
:root{--ink:#1C1917;--muted:#6B655E;--brand:#C4501B;--hot:#E8632C;--line:#E7DFD3;--bg:#FBF7F0;--gold:#E8B04B}
body{font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
.sheet{max-width:40rem;margin:1.2rem auto;background:#fff;border-radius:1.4rem;overflow:hidden;box-shadow:0 24px 60px -30px rgb(28 25 23 / 0.4);border:1px solid var(--line)}
.head{background:linear-gradient(135deg,var(--brand),var(--hot));color:#fff;padding:2.2rem 2rem 1.8rem;text-align:center;position:relative}
.head .kick{font-weight:800;letter-spacing:0.16em;text-transform:uppercase;font-size:0.78rem;opacity:0.9}
.head h1{font-size:2rem;line-height:1.12;margin:0.5rem 0 0.4rem;letter-spacing:-0.02em}
.head p{font-size:1rem;opacity:0.95;max-width:26rem;margin:0 auto}
.qr-wrap{background:#fff;text-align:center;padding:2rem}
.qr-wrap img{width:230px;height:230px;border:6px solid var(--ink);border-radius:1rem;padding:0.5rem;background:#fff}
.qr-cta{margin-top:1rem;font-size:1.25rem;font-weight:800}
.qr-sub{color:var(--muted);font-size:0.95rem;margin-top:0.25rem}
.perks{padding:0 2rem 1.4rem;display:grid;gap:0.7rem}
.perk{display:flex;gap:0.7rem;align-items:flex-start;font-size:0.98rem}
.perk b{color:var(--brand)}
.perk .tick{flex-shrink:0;width:1.5rem;height:1.5rem;border-radius:50%;background:#FDEEDF;color:var(--brand);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem}
.price{margin:0 2rem 1.6rem;background:#FFF7EE;border:1px dashed var(--gold);border-radius:1rem;padding:1rem 1.2rem;text-align:center}
.price b{color:var(--brand);font-size:1.3rem}
.foot{background:var(--ink);color:#F3ECE0;padding:1.3rem 2rem;text-align:center}
.foot .logo{font-size:1.3rem;font-weight:800}
.foot .logo span{color:var(--gold)}
.foot .code{margin-top:0.5rem;font-size:0.85rem;opacity:0.85}
.foot .code b{color:#fff;letter-spacing:0.08em}
.actions{max-width:40rem;margin:0 auto 2rem;text-align:center}
.btn{font-family:inherit;font-size:0.95rem;font-weight:800;border:none;border-radius:9999px;padding:0.8rem 1.8rem;cursor:pointer;background:var(--brand);color:#fff}
@media print{body{background:#fff}.sheet{box-shadow:none;border:none;margin:0;border-radius:0}.actions{display:none}}
`;

export function renderBrochureHtml(props: {
  code: string;
  demoUrl: string;
  referrerName?: string;
}): string {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=460x460&margin=6&data=${encodeURIComponent(props.demoUrl)}`;
  const page = (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>{`Brosur tokoweb — ${props.code}`}</title>
        <style dangerouslySetInnerHTML={{ __html: BROCHURE_CSS }} />
      </head>
      <body>
        <div class="sheet">
          <div class="head">
            <div class="kick">Buat Warung, Kedai & Resto</div>
            <h1>Warung sebelah udah online. Punyamu?</h1>
            <p>
              Orang sekarang nyari makan sambil rebahan — dari HP. Kalau warungmu belum ada di
              internet, kamu kehilangan pembeli tiap hari. Yuk benahi hari ini.
            </p>
          </div>
          <div class="qr-wrap">
            <img src={qrSrc} alt={`QR demo ${props.code}`} width="230" height="230" />
            <div class="qr-cta">Scan, lihat contoh website warungmu</div>
            <div class="qr-sub">Gratis, tanpa daftar — langsung jadi dengan nama usahamu.</div>
          </div>
          <div class="perks">
            <div class="perk">
              <span class="tick">✓</span>
              <span>
                <b>Ketemu di Google.</b> Pembeli ketik "makan dekat sini", warungmu muncul — lengkap
                dengan menu & jam buka.
              </span>
            </div>
            <div class="perk">
              <span class="tick">✓</span>
              <span>
                <b>Pesan online + tombol WhatsApp.</b> Pelanggan pesan dari rumah, kamu tinggal
                siapkan. Nggak pakai aplikasi ribet.
              </span>
            </div>
            <div class="perk">
              <span class="tick">✓</span>
              <span>
                <b>Kelola sendiri dari HP.</b> Ganti harga, pasang promo, upload foto — semudah
                kirim pesan WA.
              </span>
            </div>
            <div class="perk">
              <span class="tick">✓</span>
              <span>
                <b>Ngebut walau sinyal jelek.</b> Buka di bawah 1 detik. Pembeli nggak kabur.
              </span>
            </div>
          </div>
          <div class="price">
            Setup <s>{formatRupiah(PLAN_PRICES.basic.setup)}</s>{" "}
            <b>{formatRupiah(setupFee("basic", true))}</b> lewat brosur ini (hemat 30%).
            <br />
            Mulai <b>Rp 75.000/bulan</b> — jadi kurang dari sehari, bisa berhenti kapan saja.
            <br />7 hari nggak cocok? Uang balik 100%.
          </div>
          <div class="foot">
            <div class="logo">
              toko<span>web</span>.id
            </div>
            <div class="code">
              {props.referrerName ? `Diperkenalkan oleh ${props.referrerName} · ` : ""}
              Kode: <b>{props.code}</b>
            </div>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="btn" onclick="window.print()">
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </body>
    </html>
  );
  return `<!doctype html>${String(page)}`;
}
