# ADR-0007: Tracker sendiri di D1, agregasi cron

**Status:** diterima · 2026-07-28

## Konteks
Statistik (view, klik WA/telp/Maps/promo) = alat retensi inti. Harus murah, privasi bersih, tidak memperlambat situs.

## Opsi
1. Google Analytics — gratis tapi berat di halaman, data bukan milik kita, tidak cocok jadi laporan WA sederhana.
2. Plausible/Umami self-host — butuh server sendiri (VPS) = biaya + ops.
3. **Endpoint Worker → D1** — beacon < 1 KB, `waitUntil`, agregasi cron harian ke `daily_stats`.
4. Workers Analytics Engine — dibuat untuk write masif, tapi API query terbatas & menambah konsep baru di fase awal.

## Keputusan
Opsi 3. Event mentah dipangkas > 90 hari; laporan baca agregat saja.

## Konsekuensi
- (+) Data milik sendiri, query SQL bebas, nol biaya tambahan.
- (−) Batas tulis D1 → insert dibatch; jika event > ~1 juta/hari, migrasi jalur tulis ke Analytics Engine (opsi 4) TANPA mengubah `daily_stats` & laporan (hanya sumber agregasi berganti).
