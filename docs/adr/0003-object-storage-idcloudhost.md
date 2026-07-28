# ADR-0003: Object storage IDCloudHost via StoragePort (S3-compatible)

**Status:** diterima · 2026-07-28

## Konteks
Foto menu/galeri butuh object storage. Founder punya **kredit besar di IDCloudHost**. R2 tidak bisa dipakai saat ini: aktivasi R2 butuh kartu terdaftar di Cloudflare dan **kartu founder ditolak** — R2 praktis tidak tersedia.

## Opsi
1. R2 — binding native, egress $0, latency terbaik dari Worker.
2. **IDCloudHost S3** — pakai kredit yang sudah ada, data di Indonesia.
3. Cloudinary/Uploadcare — fitur transformasi bagus, free tier sempit, mahal saat skala.

## Keputusan
IDCloudHost sebagai primary, **wajib lewat interface `StoragePort`** (put/get/delete/signedUrl) memakai S3 API generik (`aws4fetch`). R2 juga S3-compatible → pindah = ganti endpoint + kredensial, nol perubahan kode. DB hanya simpan `image_key`, bukan URL penuh.

## Konsekuensi
- (+) Biaya storage ditutup kredit existing; opsi keluar tetap terbuka.
- (−) Fetch origin dari Worker ke Jakarta lebih lambat dari R2 → **wajib** dimitigasi: gambar disajikan lewat Worker dengan cache edge + `Cache-Control: immutable` (origin jarang kena hit).
- (−) Signing S3 manual (aws4fetch, dependensi kecil — disetujui lewat ADR ini).
- Trigger evaluasi ulang: kredit habis ATAU latency first-hit terbukti mengganggu, DAN masalah kartu Cloudflare sudah beres → pindah ke R2.
