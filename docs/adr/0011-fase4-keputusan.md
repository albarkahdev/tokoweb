# ADR-0011: Fase 4 — reset via WA, SEO/sitemap, kurasi tema, slug & direktori

**Status:** diterima · 2026-07-30

## Konteks

Fase 4 = paket polish + fondasi pertumbuhan sebelum modul Pemesanan (Fase 5).
Beberapa keputusan punya trade-off nyata, dicatat di sini. Detail implementasi
seluruh 14 item ada di `docs/fase4-spec.md`.

## Keputusan

### 1. Reset password = manual via WA founder (tanpa email/OTP)
Layanan email (Resend) free tier ~3rb/bulan dinilai kekecilan + nambah dependensi.
Alur: user isi **nomor HP**; sistem cek terdaftar; kalau ada → tombol buka WA
founder dengan template `[RESET PASSWORD] hp: 62xxx`. Founder reset manual, kirim
kredensial sementara; user **wajib ganti password di login pertama**.

Anti-abuse (cegah enumerasi HP terdaftar): **Turnstile** (reuse R16) + **rate limit
~5 cek/IP/jam**. Kebocoran 1-1 diterima; pemanenan massal diblok.

- (+) Rp 0, tanpa dependensi email.
- (−) Founder = leher botol tiap reset. Trigger pindah ke email OTP: volume reset tinggi.

### 2. Situs mitra indexable + sitemap; demo `noindex`
Situs mitra asli = target index Google (unik per usaha). Demo = `noindex`
(hindari duplikat & saingan dengan situs mitra). Sitemap index otomatis dari
daftar tenant aktif, disubmit ke Search Console terpusat (sudah terdaftar).
Halaman "Toko Bergabung" (direktori) = internal link ke semua subdomain → bantu crawl.

Temuan: situs mitra sebelumnya belum masuk sitemap & audit SEO belum tuntas —
Fase 4 menuntaskannya (title/meta/canonical/JSON-LD + indexable).

### 3. Blog pusat manual, bukan per-tenant / bukan auto-massal
10 artikel berkualitas di `tokoweb.id` (bukan subdomain), SEO + kata kunci benar,
tiap artikel ditutup CTA gabung. Blog per-tenant ditolak (beban konten ke owner);
auto-generate massal ditolak (risiko penalti konten tipis/duplikat Google).

### 4. Kurasi tema — 10 unggulan di landing, 50 sisanya terkunci di demo
Dari 60 tema: 10 tampil di landing; sisanya tampil di demo tapi **disabled + ikon
gembok** (tier terkunci). Sekaligus jalur upsell. 10 terpilih tercatat di spec.

### 5. Slug/subdomain wajib saat aktivasi, dikunci setelah dipilih
Owner aktif wajib pilih slug sebelum situs live (cegah rebutan). Auto-saran dari
nama toko, cek ketersediaan real-time, blocklist kata sistem. Slug **dikunci** —
ganti hanya via admin (ubah slug = rusak link & SEO).

### 6. Tutup manual override jadwal
Owner bisa menutup toko walau jadwal buka (toggle "Tutup Sementara" + alasan
opsional). Situs publik & tombol Pesan (Fase 5) mengikuti status ini.

## Konsekuensi

- Larangan tetap dijaga: logika (slug-validasi, status-toko, jadwal) murni di
  `src/domain/` + unit test; UI dari `src/ui/`; tanpa PII di tracker.
- Tanpa dependensi baru: reset via WA (link manual), QR via layanan eksternal
  (ADR-0009), tanpa Resend. Bila email OTP kelak dibutuhkan → ADR baru.
