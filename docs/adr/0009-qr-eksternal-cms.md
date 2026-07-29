# ADR-0009: QR code via layanan eksternal di CMS

## Status

Diterima (2026-07-29)

## Konteks

Klien butuh QR untuk membagikan URL websitenya (ditempel di kasir/meja/brosur).
Membuat QR sendiri butuh implementasi Reed-Solomon (±400 baris rawan bug) atau
dependensi npm baru. QR hanya tampil di halaman beranda CMS (setelah login),
bukan di situs publik, sehingga bukan jalur performa kritis.

## Keputusan

Pakai layanan gambar QR eksternal `api.qrserver.com` (goqr.me), dirender sebagai
`<img>` di beranda CMS. Data yang dikirim hanya URL publik website klien —
bukan data pribadi.

## Konsekuensi

- Tanpa dependensi npm baru dan tanpa kode kripto sendiri.
- Jika layanan mati, hanya gambar QR di CMS yang gagal — situs publik tidak
  terpengaruh. Klien tetap bisa memakai QR yang sudah dicetak.
- Kalau nanti QR dibutuhkan di jalur publik (brosur ojol otomatis), pertimbangkan
  generator QR sendiri lewat ADR baru.
