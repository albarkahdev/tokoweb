# ADR-0004: Edge SSR + cache HTML (bukan SSG per tenant)

**Status:** diterima · 2026-07-28

## Konteks
Situs publik harus < 1 dtk dan tahan traffic tinggi. Konten berubah jarang (edit menu/promo), dibaca sering.

## Opsi
1. SSG per tenant (build & deploy per perubahan) — jatah build habis (tiap edit konten = rebuild), antrian build di jam ramai.
2. SSR per request — latency + beban D1 per pengunjung; rawan di traffic tinggi.
3. **Edge SSR + cache HTML**: render saat cache miss, simpan di Cache API (key: hostname+path), purge saat konten berubah.

## Keputusan
Opsi 3. Perilaku = situs statis, fleksibilitas = SSR.

## Konsekuensi
- (+) Traffic viral dilayani cache, D1 tidak tersentuh. Skala ≈ gratis.
- (+) Edit konten terlihat live dalam hitungan detik (purge → render ulang).
- (−) Disiplin purge wajib: SEMUA jalur tulis konten (CMS, admin, cron promo-expire, ganti tema, suspend) harus purge cache tenant terkait. Helper tunggal `invalidateTenantCache()` — dilarang purge manual tersebar.
- (−) Halaman ber-state (preview tema, CMS) di-bypass dari cache (header no-store).
