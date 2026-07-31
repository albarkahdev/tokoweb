# ADR-0010: Fitur Pemesanan Online — tamu, bayar-dulu, verifikasi manual

**Status:** diterima · 2026-07-30

## Konteks

Mitra kuliner ingin menerima pesanan langsung dari website tenant, bukan sekadar
etalase. Pembeli memilih menu, checkout, bayar, lalu mitra memproses. Kebutuhan:
biaya per tenant tetap mendekati nol, tanpa payment gateway (butuh badan usaha +
KYC), dan tetap ringan di sinyal jelek.

Fitur ini = **Fase 5** (modul Pemesanan), dikerjakan setelah Fase 1 DoD lengkap.
Login/riwayat/reorder ditahan ke fase berikutnya.

## Keputusan

### 1. Pembeli = tamu, tanpa login/OTP
Checkout cukup nama (wajib) + email/HP (opsional). OTP WA mahal (WA Business API
~Rp300–600/pesan) dan bot tak resmi rawan blokir Meta; OTP email berfriksi tinggi
untuk "sekadar pesan makan". Login/riwayat/reorder ditahan ke fitur lanjutan.

### 2. Bayar-dulu untuk kedua jenis pesanan
Dine-in dan Pick-up **sama-sama bayar dulu** baru diproses. `fulfillment`
(dine_in|pickup) hanya label pada pesanan, bukan alur terpisah — satu state machine.

### 3. Pembayaran manual (lanjutan ADR-0005)
Mitra memajang metodenya sendiri (QRIS statis / transfer / e-wallet) di CMS.
Pembeli memilih satu, membayar di aplikasi masing-masing, lalu **upload bukti
(opsional)**. Mitra memverifikasi manual. Tanpa gateway, tanpa biaya transaksi.
Sumber kebenaran status bayar = aksi mitra di CMS.

### 4. Mitra konfirmasi dulu sebelum pembayaran dibuka
Pesanan masuk berstatus `BARU`. Mitra cek stok/kesanggupan → konfirmasi →
`MENUNGGU_BAYAR`. Mencegah pembeli membayar untuk item yang tak bisa dibuat.

### 5. Invoice = halaman HTML printable, bukan PDF server
Generate PDF di Workers berat (lib besar / layanan luar) — lawan prinsip boring &
murah. Invoice dirender sebagai halaman HTML rapi (`src/ui/`) + tombol Cetak;
browser yang mengubah ke PDF (Print → Save as PDF). Ringan, bisa cetak thermal.

### 6. QR meja via layanan eksternal (mengikuti ADR-0009)
Mitra generate & cetak QR per meja dari CMS. QR hanya berisi URL publik order
+ kode meja (bukan data pribadi). Scan QR → Dine-in + nomor meja terisi otomatis.

### 7. Harga & item pesanan di-snapshot
`order_items` menyimpan salinan nama, harga, kategori saat dipesan. Menu berubah
tidak mengubah pesanan lama. Sesuai prinsip data-model: pesanan = fakta historis.

## Konsekuensi

- (+) Rp 0 biaya transaksi, jalan tanpa badan usaha/gateway.
- (+) Satu state machine, kompleksitas rendah.
- (−) Verifikasi bayar manual = titik gesekan (~1–2 menit/pesanan). Trigger pindah
  gateway kelak: verifikasi > 1 jam/hari ATAU volume tinggi.
- (−) Bukti opsional → kadang mitra harus cek mutasi rekening sendiri.
- (−) Notifikasi "order masuk sangat jelas" butuh Web Push. **Web Push butuh ADR
  tersendiri** (VAPID + kripto Web Crypto / dependensi `web-push`) sebelum
  diimplementasi. Sampai itu ada, notif = badge + suara di CMS (polling ringan).
- Larangan tetap dijaga: logika transisi status murni di `src/domain/` + unit test;
  situs order publik tetap ramah cache; tanpa data pribadi di tracker.
