# Spec Fitur Pemesanan (Fase 5)

Modul pemesanan online untuk tenant kuliner. Referensi keputusan: **ADR-0010**.
Bukan Fase 1. Dikerjakan setelah Fase 1 DoD lengkap.

## Ringkasan alur

**Pembeli (tamu, tanpa login):**
1. Masuk via tombol "Pesan" (navbar/hero) **atau** scan QR meja.
2. Isi nama (wajib), email/HP (opsional).
3. Jelajah menu — grid rapat, filter kategori, tombol +/− cepat, catatan per item.
4. Keranjang → pilih jenis: **Dine-in (nomor meja)** / **Pick-up**.
5. Checkout: subtotal + pajak/biaya opsional → total. Kirim.
6. Dapat **struk WA + link `/o/{code}`** untuk memantau status.
7. Setelah mitra buka pembayaran → pilih metode → bayar → **upload bukti (opsional)**.

**Mitra (di CMS):**
1. Notif order baru (badge + suara; Web Push menyusul, lihat ADR-0010).
2. Konfirmasi order (cek stok) → buka pembayaran.
3. Verifikasi bukti bayar → Proses → Selesai.
4. Atur: metode bayar, pajak/biaya, jumlah meja + cetak QR, tandai item habis.
5. Cetak invoice HTML kapan saja.

## State machine

Logika transisi = fungsi murni di `src/domain/order.ts`, wajib unit test.

```
BARU ──(mitra konfirmasi)──────────▶ MENUNGGU_BAYAR
MENUNGGU_BAYAR ──(pembeli bayar)────▶ CEK_BAYAR
CEK_BAYAR ──(mitra verifikasi OK)───▶ DIPROSES
CEK_BAYAR ──(mitra tolak)───────────▶ MENUNGGU_BAYAR
DIPROSES ──(mitra tandai)───────────▶ SELESAI
(BARU|MENUNGGU_BAYAR|CEK_BAYAR) ────▶ DIBATALKAN
```

Transisi ilegal (mis. `BARU → DIPROSES`) ditolak domain, bukan sekadar UI.
Setiap perpindahan mengisi timestamp terkait (`confirmed_at`, `paid_at`, dst).

## Tambahan model data (D1)

Mengikuti gaya `docs/data-model.md`. Semua tanggal UTC, render Asia/Jakarta.
Soft-cancel via status, bukan DELETE.

### orders
`id, tenant_id, code (unik, utk /o/{code}), customer_name, customer_email (nullable),
customer_phone (nullable), fulfillment (dine_in|pickup), table_no (nullable),
status (baru|menunggu_bayar|cek_bayar|diproses|selesai|dibatalkan),
subtotal, tax_amount, fee_amount, total,
payment_method_id (nullable, metode yang dipilih pembeli),
proof_key (nullable, bukti bayar di storage — opsional),
note (nullable, catatan umum),
created_at, confirmed_at, paid_at, verified_at, processed_at, completed_at, cancelled_at`

- `code` acak pendek (mis. 8 char base32), bukan berurut — jangan bocorkan volume.
- `subtotal/tax/fee/total` disimpan hasil hitung (snapshot), bukan dihitung ulang saat render.

### order_items
`id, order_id, name (snapshot), category (snapshot), unit_price (snapshot), qty,
item_note (nullable, catatan/custom per menu)`

- Snapshot: menu berubah tidak mengubah pesanan lama (ADR-0010 #7).

### tenant_payment_methods
`id, tenant_id, type (qris|transfer|ewallet), label,
detail (JSON), image_key (nullable, gambar QR), active, sort`

- `detail` per type: transfer `{bank, account_no, account_name}`; ewallet `{provider, phone}`;
  qris cukup `image_key` gambar QR.
- Situs order menampilkan hanya yang `active`.

### push_subscriptions  *(saat Web Push diaktifkan — butuh ADR tersendiri)*
`id, tenant_id, user_id, endpoint, keys (JSON: p256dh, auth), created_at`

### Setting pesanan → di `contents.data.order_settings` (JSON, bukan tabel)

```json
{
  "order_settings": {
    "enabled": false,
    "tax_percent": 0,
    "fees": [{ "label": "Biaya kemasan", "amount": 0 }],
    "min_order": 0,
    "tables": 0
  }
}
```

- `enabled=false` → tombol Pesan tidak muncul. Default warung kecil bebas ribet.
- `tables` = jumlah meja; QR meja digenerate dari daftar 1..N.

### Perubahan item menu (di `contents.data.menu[].items[]`)
Tambah `available (bool, default true)`. `false` = tampil "Habis", tak bisa dipesan.

## Fungsi domain (murni, `src/domain/`) — wajib test

- `calculateOrderTotal(items, taxPercent, fees)` → `{ subtotal, tax_amount, fee_amount, total }`.
- `canTransition(from, to)` → boolean; `applyTransition(order, to, now)` → order baru + timestamp.
- `validateCheckout(input)` → validasi nama wajib, item ≥ 1, semua item `available`,
  `total ≥ min_order`, meja wajib jika `fulfillment=dine_in`.
- `generateOrderCode()` → kode acak (pakai Web Crypto, bukan Math.random).
- `buildWaMessage(order, publicUrl)` → teks struk WA + link `/o/{code}` (escape aman).

## UI shared component (wajib `src/ui/`, dilarang markup custom di luar)

- `OrderMenuGrid` — grid rapat, filter kategori sticky, kartu kecil +/− + badge Habis.
- `CartSheet` — ringkasan keranjang, edit qty, catatan per item.
- `CheckoutForm` — data pembeli, pilih Dine-in/Pick-up, nomor meja, rincian biaya, total.
- `PaymentPanel` — pilih metode, tampilkan QR/no rek jelas, upload bukti (opsional).
- `OrderStatusView` — halaman publik `/o/{code}`, timeline status.
- `Invoice` — layout printable (kop, item, pajak, total, kode order) + tombol Cetak.
- CMS: `OrderInbox` (badge + suara + sorot "perlu ditangani"), `OrderDetail`,
  `PaymentMethodSettings`, `TableQrManager`.

Loading & error state wajib di setiap permukaan (standar kualitas desain).

## Rute (Hono, `src/routes/`)

Publik (per subdomain tenant):
- `GET /pesan` — halaman order (menu + keranjang + checkout).
- `GET /pesan?meja={n}` — prefilled Dine-in dari QR meja.
- `POST /pesan` — buat order (Turnstile wajib, anti-spam — reuse R16).
- `GET /o/{code}` — status pesanan publik.
- `POST /o/{code}/bayar` — pembeli tandai sudah bayar + upload bukti opsional.

CMS (login mitra):
- `GET /cms/pesanan` — inbox.
- `POST /cms/pesanan/{id}/konfirmasi | verifikasi | tolak | proses | selesai | batal`.
- `GET /cms/pesanan/{id}/invoice` — halaman printable.
- CMS settings: metode bayar, pajak/biaya, jumlah meja + unduh QR.

## Keamanan & privasi

- `POST /pesan` di belakang **Turnstile** (reuse komponen R16).
- Bukti bayar = gambar; validasi tipe/ukuran, simpan sebagai `image_key` di storage
  (ADR-0003), bukan URL penuh.
- Data pembeli (nama/email/HP) **tidak** masuk tracker (larangan data pribadi).
- `code` order acak, tak bisa ditebak; halaman `/o/{code}` hanya baca status, tanpa PII sensitif berlebih.
- Verifikasi bayar hanya oleh mitra terautentikasi (owner tenant terkait).

## Utang teknis (dicatat)

- Verifikasi bayar manual = gesekan; kandidat gateway kelak.
- Web Push butuh ADR + VAPID; sementara pakai badge + suara (polling ringan).
- Bukti opsional → kadang mitra cek mutasi sendiri.

## Definition of Done Fase 5

- [ ] Semua fungsi domain (`calculateOrderTotal`, `canTransition`, `validateCheckout`, ...) punya unit test, suite hijau.
- [ ] Alur end-to-end: buka /pesan → checkout → mitra konfirmasi → pembeli bayar → mitra verifikasi → proses → selesai.
- [ ] QR meja: scan → /pesan?meja=n prefilled Dine-in.
- [ ] Item "Habis" tak bisa dipesan; `enabled=false` → tombol Pesan hilang.
- [ ] Invoice HTML rapi, ter-print jadi PDF dari browser.
- [ ] Halaman /pesan lolos Lighthouse mobile ≥ 90.
- [ ] Turnstile aktif di POST /pesan; tanpa PII di tracker.
