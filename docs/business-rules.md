# Aturan Bisnis

## Paket harga

| | Basic | Pro |
|---|---|---|
| Setup (sekali) | Rp 300.000 | Rp 1.000.000 |
| Langganan/bulan | Rp 75.000 | Rp 200.000 |
| Domain | Subdomain `namausaha.tokoweb.id` | Custom domain milik klien |
| Konten | Klien isi form intake, kami rapikan | Konten dibuatkan penuh |
| Ekstra | — | Google Business Profile dioptimasi |

Subdomain = default. Custom domain = upsell (Cloudflare for SaaS).

## Pembayaran

- **QRIS statis** milik kami. Verifikasi manual (cek mutasi), tandai lunas di admin panel.
- Payment gateway = ditunda (ADR-0005). Evaluasi ulang saat > 30 tenant aktif.
- Siklus tagihan: bulanan, jatuh tempo di tanggal yang sama dengan tanggal live.

## Tenant nunggak

| Waktu | Aksi |
|---|---|
| H-3 sebelum jatuh tempo | Reminder via WA (manual fase 1) |
| H+0 belum bayar | Status `grace`. Situs tetap normal. Banner tagihan di CMS (bukan di situs publik). |
| H+7 | Status `suspended`. Situs publik → halaman "sementara nonaktif". CMS read-only. |
| H+90 | Data diarsipkan (export JSON + foto), tenant dihapus dari produksi. |

Bayar kapan pun sebelum H+90 → aktif lagi hari itu juga, tanpa biaya setup ulang.

## Komisi ojol (referral satu tingkat, BUKAN MLM)

- Komisi **per closing per klien**, dicicil 3 bulan:
  - **Basic**: Rp 50.000 × 3 = total Rp 150.000
  - **Pro**: Rp 100.000 × 3 = total Rp 300.000
- Cicilan-1 sah saat **klien bayar setup fee** → cair ≤ 1 hari (transfer manual).
- Cicilan-2 sah saat klien **bayar langganan bulan ke-2**. Cicilan-3 saat bayar bulan ke-3.
- Klien berhenti/nunggak → cicilan tersisa **hangus**. (Insentif ojol bawa klien serius.)
- Scan QR saja = Rp 0. Komisi hanya dari klien yang membayar.
- **Klien telat bayar tapi akhirnya bayar** (dalam grace/suspend, sebelum arsip H+90) → cicilan tetap sah saat pembayaran terverifikasi. Bayar = bayar, kapan pun.
- **Tarif komisi terkunci saat closing.** Klien upgrade Basic→Pro di tengah jalan → komisi tetap tarif Basic. (Sederhana, tidak bisa diakali.)
- **Ojol berhenti jadi mitra** → cicilan yang sudah jadi haknya (klien sudah bayar) tetap dibayarkan; cicilan masa depan mengikuti aturan normal.
- **Refund klien: 7 hari** setelah bayar setup, uang kembali, tenant dibatalkan → cicilan-1 ojol di-void (atau dipotong dari payout berikutnya bila terlanjur cair). Aturan refund dicantumkan di **T&C klien**.
- Transparansi: ojol punya halaman komisi read-only (`/r/KODE` + PIN) — lihat `referral-spec.md`.
- Anti-fraud: lihat `referral-spec.md`.

## Promo

- Field wajib: judul, `start_date`, `end_date`.
- Tampil hanya dalam rentang tanggal. Auto-expire: cek saat render + **cron 00:05 WIB** purge cache tenant yang promonya baru kadaluarsa/mulai — promo hilang ≤ 5 menit setelah tengah malam.
- Promo expired tetap tersimpan (bisa diaktifkan ulang dengan tanggal baru).

## Testimoni

- Semua testimoni masuk status `pending`. Tampil di situs hanya setelah **pemilik usaha approve** via CMS.
- Admin (kami) bisa hapus testimoni apa pun (spam/abuse).

## CMS klien

- Maksimal 6 menu: Info Usaha, Menu/Layanan, Promo, Galeri, Pesan Masuk, Statistik.
- **Kartu status langganan di beranda CMS** (bukan menu ke-7): "Aktif sejak {bulan} · Jatuh tempo {tanggal} · LUNAS ✓ / Belum bayar ⚠". Klien selalu tahu posisinya sebelum kena suspend.
- Mobile-first — mayoritas klien buka dari HP.
- Klien boleh ganti tema sendiri, ada preview sebelum apply.
- Login email + password, reset via email. Fallback: admin reset manual.
- Onboarding: klien isi **form intake** (nama usaha, menu, deskripsi, foto, kontak) → kami proses & rapikan → live. Target setup ≤ 30 menit.
- Link intake unik, **berlaku 3 hari**, bisa dibuat ulang 1 klik dari admin panel jika kadaluarsa.
- Konten per paket — **Basic**: teks klien dirapikan, foto seadanya yang terbaik + saran perbaikan via WA. **Pro**: teks dituliskan penuh, foto diarahkan/dibantu ulang (bagian "konten dibuatkan").
- **AI saat kurasi (Fase 1, tanpa API)**: admin panel punya tombol **"Copy Prompt AI"** — prompt siap-tempel berisi data intake mentah + instruksi (rapikan teks, buat deskripsi menu, tagline, meta description). Paste ke Gemini (gratis) → hasil ditempel balik ke form kurasi. Integrasi API Gemini Flash = Fase 2 (butuh ADR).
- **Nomor WA wajib** saat onboarding — kanal utama pembeli bertanya. Tombol "Tanya via WA" di situs memakai teks otomatis (mis. menyebut nama menu yang dilihat). Form pesan tersimpan di CMS = Fase 2, hanya jika ada permintaan nyata.

## Laporan bulanan

- Statistik selalu tersedia di CMS (menu Statistik).
- Rekap bulanan dikirim manual via WA/email (fase 1). Otomasi = fase 2.
- Laporan = alat retensi: tunjukkan nilai (berapa orang lihat, klik WA, dll) setiap bulan.
