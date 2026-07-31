# ADR-0014: Keputusan Fase 6 — statistik pesanan, diskon setup referral, panduan

**Status:** diterima · 2026-07-31

## Konteks

Setelah Fase 5 (Pemesanan) jalan, dibutuhkan: (1) statistik pesanan untuk owner &
admin, (2) insentif closing lewat mitra, (3) panduan yang mencakup fitur baru.
"Fase 6" lama (akun pembeli/riwayat/reorder) digeser jadi **Fase 7**.

## Keputusan

### 1. Statistik pesanan — TANPA nominal rupiah (privasi)
Fokus **hitungan & tren**, bukan omzet. Alasan: privasi pendapatan tenant (terutama
di sisi admin lintas tenant) dan pembayaran manual/tunai membuat "omzet" tak selalu
akurat. Yang ditampilkan: pesanan masuk, selesai, dibatalkan, konversi (selesai/masuk),
menu terlaris (by qty), jam ramai (WIB).
- Owner `/statistik`: kartu Pesanan 30 hari + narasi (muncul hanya bila ordering aktif).
- Admin beranda: volume pesanan platform 30 hari (lintas tenant, jumlah saja).
- Admin detail tenant: kartu "Statistik Toko" (drilldown ringkas).
- Query di `db/stats-read` (rentang `created_at`, kecuali `dibatalkan` untuk terlaris,
  jam dikonversi ke WIB `+7 hours`). Narasi/konversi murni di `domain/order-stats` + test.

### 2. Diskon setup 30% untuk klien referral
Tenant yang punya closing/mitra → biaya setup 70% (`setupFee(plan, referred)`,
dibulatkan ribuan: Basic 210rb, Pro 700rb). **Auto** (bukan kode manual). Ditampilkan
sebagai rekomendasi + badge "klien referral" di form verifikasi admin; admin tetap
mengetik nominal (sumber kebenaran = aksi admin).
**Komisi mitra tetap penuh** — `COMMISSION_PER_INSTALLMENT` berbasis plan, bukan nominal
setup, jadi tidak berubah. Diskon murni ditanggung owner (insentif closing maksimal).

### 3. Panduan diperbarui
`GUIDE_OWNER`: Statistik (data pesanan), section "Terima Pesanan Online", "Langganan &
Bayar" (upload bukti). `GUIDE_MITRA`: section "Nilai jual" (Pesan Online + diskon 30%).
`GUIDE_ADMIN`: verifikasi bukti bayar langganan (prefill/tolak), diskon setup referral,
section "Statistik & pemantauan".

## Konsekuensi

- (+) Owner dapat insight operasional (stok/jam ramai) tanpa membuka data uang.
- (+) Mitra punya alat closing kuat (diskon 30%) tanpa memotong komisinya.
- (−) Statistik berbasis `created_at` UTC vs tanggal WIB bisa geser di batas hari
  (diterima untuk agregat mingguan/bulanan).
- Larangan dijaga: logika murni di `domain/` + unit test; UI dari `src/ui/`; tanpa
  dependensi baru; tanpa query D1 per-request untuk situs publik (statistik hanya di CMS/admin).
