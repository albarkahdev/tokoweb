# ADR-0013: Bayar langganan mandiri (transfer + upload bukti)

**Status:** diterima · 2026-07-31 · memperbarui ADR-0005 (pembayaran manual)

## Konteks

Sebelumnya owner tidak punya cara bayar langganan dari dalam app. Alur bergantung
founder japri manual: ingatkan via WA, kirim rekening, owner transfer, founder cek
mutasi lalu tandai lunas di admin. Owner sering tidak tahu ke mana bayar dan berapa.

## Keputusan

### 1. Halaman `/bayar` di CMS (owner)
Menampilkan **total tagihan** (`subscription.monthly_price`), **jatuh tempo**, **periode**,
dan **rekening tujuan TokoWeb**. Owner upload **bukti transfer**. Tidak ada payment
gateway (tetap sesuai ADR-0005) — pembayaran manual, verifikasi manusia.

### 2. Tujuan bayar = transfer bank, dari env
`BILLING_BANK`, `BILLING_ACCOUNT_NO`, `BILLING_ACCOUNT_NAME` (bukan per-tenant; satu
akun penerima milik founder). QRIS tidak dipakai untuk langganan (keputusan user).
Bila env kosong → halaman menyembunyikan form dan mengarahkan ke chat admin.

### 3. Tabel terpisah `billing_submissions` (migrasi 0013)
Bukti pending disimpan terpisah dari `payments`. Alasan: `payments` = sumber kebenaran
pembayaran **terkonfirmasi** (`confirmed_at`/`confirmed_by` wajib, UNIQUE per periode).
Menyisipkan submission pending ke situ akan merusak invariannya. `billing_submissions`
UNIQUE(tenant_id, period): upload ulang me-*replace* (status kembali `pending`).

### 4. Nominal dihitung server (anti-tamper)
Owner tidak mengetik nominal; server memakai `monthly_price`. Owner hanya upload bukti
+ catatan opsional.

### 5. Validasi upload = pola yang sudah ada
Client `webpUpload` konversi ke WebP; server tetap gerbang: `isBillingProofValid`
(WebP only, > 0, ≤ 512 KB). Sama seperti bukti bayar pesanan/logo/galeri.

### 6. Admin
Detail tenant menampilkan bukti pending (gambar + periode + nominal + catatan). Form
"Tandai Lunas" ter-prefill periode & nominal. Verifikasi `monthly` sukses → submission
ditandai `matched` (nyambung ke `verifyPayment` lama: cycle, reaktivasi, cicilan komisi).
Tombol "Tolak Bukti" → status `rejected`, owner diminta upload ulang.

### 7. Kartu "Chat admin" di Bantuan
WA ke `PHONE_NUMBER_ADMIN`, teks prefilled (nama usaha + subdomain). Kanal bantuan
langsung, sesuai prinsip Fase 1 (WA = kanal utama).

## Konsekuensi

- (+) Owner tahu berapa & ke mana bayar; bukti masuk terstruktur, bukan tersebar di chat.
- (+) `payments` tetap bersih sebagai catatan terkonfirmasi.
- (−) Masih manusia-in-the-loop untuk cek mutasi (disengaja — tanpa gateway).
- Larangan dijaga: logika murni di `src/domain/billing.ts` + unit test; UI dari `src/ui/`;
  import `@/`; tanpa komentar; tanpa dependensi baru.
