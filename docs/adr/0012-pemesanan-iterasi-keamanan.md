# ADR-0012: Iterasi Pemesanan (tunai, status siap, snapshot) + hardening keamanan

**Status:** diterima · 2026-07-31 · memperbarui ADR-0010

## Konteks

Setelah Fase 5 (Pemesanan) jalan, muncul kebutuhan nyata + temuan audit menyeluruh
(keamanan, korektness, UI/UX). ADR ini mencatat keputusan iterasi dan pemisahan
mana yang dikerjakan sekarang vs ditunda (beserta pemicunya).

## Keputusan yang diterapkan

### 1. Bayar tunai (memperbarui ADR-0010 #2 "bayar-dulu")
Owner boleh mengaktifkan "bayar di tempat" (`order_settings.cash`). Pembeli memilih
online vs tunai saat checkout. Order tunai: `baru → (mitra "Terima") → diproses`,
melewati `menunggu_bayar/cek_bayar`. Alasan: dine-in di warung Indonesia lazim
bayar-belakang; memaksa bayar-dulu menutup use-case terbesar. Online tetap bayar-dulu.

### 2. Status `siap`
`diproses → siap → selesai` (opsional). Memberi sinyal "siap diambil/disajikan".

### 3. Snapshot tujuan bayar
Detail metode (tipe/label/rekening/QR) disalin ke `orders.payment_snapshot` saat
pembeli bayar → ganti/hapus metode tidak mengubah order lama. File QR tidak dihapus
saat metode dihapus (agar order lama tak rusak; sampah dibersihkan manual kelak).

### 4. Hardening keamanan (dari audit)
- **Turnstile fail-closed di produksi.** `verifyTurnstile(secret, token, ip, environment)`:
  secret kosong → lolos hanya bila `environment !== "production"` (dev/test/self-host).
  Di prod (`ENVIRONMENT=production`) secret wajib, jadi salah-konfigurasi tidak membuka
  gate anti-bot (mis. brute-force PIN mitra).
- `/img/*` kirim `X-Content-Type-Options: nosniff`.
- CSP dasar aman di surface app: `frame-ancestors 'none'; base-uri 'self'; object-src 'none'`.
- `LIMIT` di query order di-bind; cek keunikan kode order jadi global (kolom UNIQUE global).

### 5. Kebersihan operasional
- Auto-cancel `menunggu_bayar` diukur dari `confirmed_at` (jendela bayar dibuka), bukan
  `created_at`. Order `baru` yang tak dikonfirmasi > 48 jam ikut dibatalkan cron.
  `cek_bayar` **tidak** di-auto-cancel (kemungkinan uang sudah masuk — perlu manusia).

## Ditunda (dengan pemicu) — dicatat agar tidak "diingat" saja

- **Rate limit global via Durable Object / Rate Limiting API.** Limiter sekarang
  in-memory per-isolate (best-effort). Untuk gate PIN mitra, Turnstile (kini fail-closed)
  jadi pertahanan utama sehingga risiko turun. **Pemicu implementasi:** volume/abuse nyata,
  atau kebutuhan limit yang benar-benar konsisten. Butuh ADR + binding baru.
- **CSP penuh (script/style-src) di surface publik/tenant/demo.** Halaman ini penuh
  inline script/style dan di-cache edge; menyetel CSP ketat berisiko memecah tampilan dan
  butuh verifikasi browser sungguhan (dev lokal tak bisa render subdomain, lihat memory
  `local-dev-quirks`). **Pemicu:** ada lingkungan uji yang bisa render subdomain.
- **QR di-generate lokal.** Brosur mitra & QR meja pakai layanan eksternal
  (`api.qrserver.com`) — ini **sudah sesuai ADR-0009** (QR via layanan eksternal). Ganti ke
  generator lokal butuh dependensi baru → ADR tersendiri bila offline-print jadi penting.

## Konsekuensi

- (+) Tunai membuka use-case dine-in; snapshot mencegah sengketa "rekening berubah".
- (+) Gate anti-bot tak fail-open di prod.
- (−) Auto-cancel `baru` 48 jam bisa membatalkan order yang akan dikonfirmasi sangat telat
  (dianggap dapat diterima; owner tetap bisa minta pembeli pesan ulang).
- Larangan dijaga: logika transisi murni di `src/domain/` + unit test; order publik `no-store`.
