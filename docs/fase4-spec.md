# Spec Fase 4 — Polish & Fondasi Pertumbuhan

Paket sebelum modul Pemesanan (Fase 5). Keputusan: **ADR-0011**.
Bukan Fase 1. Dikerjakan setelah Fase 1 DoD lengkap.

## Status implementasi (2026-07-31)

Semua 14 item terimplementasi di branch `feat/fase4` (234 unit test hijau). Catatan:

- **#6 reset via WA:** cek "terdaftar" memakai tabel `leads` (nomor saat daftar) sebagai
  proksi, sebab akun login berbasis email. Founder kirim link set-password (flow `/atur-sandi`
  yang sudah ada). Anti-abuse: Turnstile + rate limit 5/jam/IP.
- **#11 slug:** domain validasi (blocklist/format/ketersediaan/saran) + endpoint
  `/admin/slug-check` + tolak reserved saat buat tenant. Alur "owner pilih slug sendiri saat
  aktivasi" belum diubah karena onboarding masih admin-driven (admin set slug); domain siap
  dipakai bila kelak onboarding self-service.
- Verifikasi visual subdomain tertunda ke deploy (dev lokal miniflare selalu lihat host
  `localhost`, lihat memory `local-dev-quirks`). Perilaku tercakup unit test.

## Daftar item (14)

| # | Item | Ringkas |
|---|------|---------|
| 1 | Tombol dummy di demo | WA/telp/maps di demo → popup "Ini demo, tombol asli aktif di website kamu" |
| 2 | Section pengumuman | Banner tipis 1 baris, opsional, bisa ditutup pengunjung |
| 3 | SEO situs mitra + sitemap | Mitra indexable + sitemap otomatis; demo `noindex` |
| 4 | Section kepercayaan | Halal/rating Google/sertifikat — opsional, rating manual |
| 5 | Disclaimer SEO | Ekspektasi index 1–4 minggu di CMS + panduan klien |
| 6 | Reset password via WA | Manual founder, input HP, anti-abuse |
| 7 | Invoice langganan | HTML printable profesional, rapi di HP |
| 8 | Promo banner posisi | (di-ignore user — sudah paling atas di situs asli) |
| 9 | Blog pusat SEO | 10 artikel manual berkualitas + CTA gabung |
| 10 | Kurasi tema | 15 unggulan (carousel di landing), sisanya terkunci 🔒 di demo |
| 11 | Slug + direktori toko | Wajib pilih slug, auto-saran, dikunci, list "Toko Bergabung" |
| 12 | Upload logo toko | CMS upload → WebP → storage |
| 13 | Fix pill buka/tutup | Lebar ngepas konten, teks tetap |
| 14 | Tutup manual | Toggle override jadwal + alasan opsional |

## Detail per item

### 1. Tombol dummy di demo
Di halaman demo, aksi WA/telp/maps tidak nyata → tampilkan popup
"Ini demo, tombol asli aktif di website kamu" (sekalian jualan). Situs tenant asli tetap nyata.

### 2. Section pengumuman
Banner tipis 1 baris di atas (libur, pindah, jam berubah). Data di
`contents.data.info.announcement = { text, active }`. `active=false`/kosong → tak muncul.
Bisa ditutup pengunjung (state di localStorage per tenant). Komponen `AnnouncementBar` di `src/ui/`.

### 3. SEO situs mitra + sitemap
- Situs mitra: pastikan `<title>`, meta description, canonical, JSON-LD `LocalBusiness`
  (alamat/jam/rating manual) benar dan **indexable** (audit `noindex` tidak keinstal).
- `GET /sitemap.xml` (di apex `tokoweb.id`): sitemap index → tiap subdomain tenant aktif + 10 artikel blog.
- `GET /robots.txt`: allow, tunjuk sitemap. Demo & CMS: `noindex`.
- Sinergi #11: halaman "Toko Bergabung" = internal link ke semua subdomain.

### 4. Section kepercayaan (opsional)
`contents.data.trust = { badges: [{ type, label, value, link }] }`. Tipe: `halal`,
`google_rating` (value manual + link Maps), `higienis`, `lainnya`. Muncul hanya jika terisi.
Rating Google **manual** (tanpa Places API — hindari biaya/key). Komponen `TrustSection` di `src/ui/`.

### 5. Disclaimer SEO
Teks di area SEO CMS: "Index Google butuh 1–4 minggu; wajar belum muncul di awal."
Juga masuk `docs/panduan.md` / T&C klien. Kelola ekspektasi.

### 6. Reset password via WA (lihat ADR-0011 #1)
- Form: input **nomor HP** (bukan email — akun pakai HP).
- Domain: `lookupAccountByPhone(phone)` → ada/tidak.
- Ada → tombol buka WA founder, template prefilled `[RESET PASSWORD] hp: 62xxx`.
- Tidak ada → tombol tak muncul.
- Anti-abuse: **Turnstile** (reuse R16) + rate limit ~5 cek/IP/jam.
- Founder reset manual → kirim kredensial sementara via WA → user **wajib ganti password login pertama**
  (`users.must_change_password` flag).

### 7. Invoice langganan
Invoice pembayaran langganan mitra→kami (data `payments`, ADR-0005). Reuse komponen
`Invoice` (dari Fase 5): kop tokoweb, periode, item (setup/bulanan), total, status.
**Responsif & profesional walau diakses HP.** Tombol Cetak → PDF via browser (ADR-0010 #5).

### 8. Promo banner posisi
Di-ignore. Di situs tenant asli `PromoTicker` sudah paling atas (render.tsx). Tak ada perubahan.

### 9. Blog pusat (SEO)
- 10 artikel **manual, hardcoded**, di `tokoweb.id/blog/{slug}` + index `/blog`.
- Berkualitas & bermanfaat, kata kunci UMKM tepat (mis. "cara bikin website warung",
  "jualan makanan online tanpa aplikasi"), tiap artikel **ditutup CTA gabung tokoweb.id**.
- Masuk `sitemap.xml`. Bukan per-tenant, bukan auto-massal (ADR-0011 #3).
- Komponen artikel dari `src/ui/`.

### 10. Kurasi tema (10 unggulan)
**15 di landing (carousel):** Hangat, Senja, Sambal, Kopi, Manis, Lampion, Pasar, Karnaval, Blueprint, Bara, Loket, Lilin, Sawah, Kunang, Jeruk.
- Flag tema: `featured: boolean` (atau `tier: "featured" | "locked"`) di config tema.
- Landing: hanya 10 featured.
- Demo: semua 60 tampil; yang non-featured **disabled + ikon 🔒** (label "Segera/Premium"),
  tak bisa di-switch. Jalur upsell.

### 11. Slug/subdomain + direktori (lihat ADR-0011 #5)
- Aktivasi owner: **wajib pilih slug** sebelum live.
- `suggestSlug(businessName)` → slugify + variasi jika terpakai (`-2`, `-kota`).
- `isSlugAvailable(slug)` → cek real-time; **blocklist** kata sistem (www, admin, api, cms, app, blog, demo, r, o, ...).
- Slug **dikunci** setelah dipilih; ganti hanya via admin.
- **Halaman "Toko Bergabung"** (`tokoweb.id/toko`): list tenant aktif (nama, vertikal, link subdomain).
  Publik, di-index → bonus SEO (internal link ke subdomain).

### 12. Upload logo toko
- CMS: upload logo → validasi tipe (png/jpg/webp) + ukuran → konversi WebP → simpan `image_key`.
- `contents.data.info.logo_key`. Dipakai: header situs, invoice, fallback OG, favicon tenant.
- Kosong → fallback inisial nama / logo default.

### 13. Fix pill buka/tutup
- Gejala: di tema tertentu (angin dll) pill status melar full-width.
- Fix: `width: fit-content` (inline-flex), rapikan padding — **teks tak diubah**
  (`● Tutup — cek jam buka` tetap). Fix di CSS engine/`src/ui/`, kena tema yang melar.

### 14. Tutup manual (override jadwal)
- `contents.data.info.temp_closed = { active, reason }`.
- Domain `shopStatus(hours, tempClosed, now)` → `open | closed_schedule | closed_manual`.
  Manual menang atas jadwal.
- Situs publik tampil "Tutup" + alasan; tombol Pesan (Fase 5) mati saat tutup.
- Komponen status buka/tutup baca dari sini.

## Fungsi domain (murni, `src/domain/`) — wajib test

- `suggestSlug(name)`, `isSlugAvailable(slug, taken)`, `isSlugReserved(slug)`.
- `shopStatus(hours, tempClosed, now)`.
- `lookupAccountByPhone(phone)` (query di route; validasi format 62 di domain).
- `buildResetWaMessage(phone)` → template `[RESET PASSWORD] ...`.
- `filterFeaturedThemes(all)` → 10 unggulan.

## Keamanan & privasi

- Reset: Turnstile + rate limit; jangan bocorkan status akun secara massal.
- Upload logo: validasi tipe/ukuran, simpan `image_key` (bukan URL), storage ADR-0003.
- Direktori toko: hanya data publik usaha (nama, vertikal, link) — tanpa PII owner.
- Blog/direktori/sitemap: konten publik, aman di-cache edge.

## Definition of Done Fase 4

- [ ] Fungsi domain (slug, shopStatus, reset-wa, featured-themes) punya unit test, suite hijau.
- [ ] Situs mitra indexable + `sitemap.xml` + `robots.txt` benar; demo `noindex`.
- [ ] 10 artikel blog live, ber-CTA, masuk sitemap; lolos Lighthouse mobile ≥ 90.
- [ ] Landing 10 tema; demo 60 tema, non-featured terkunci 🔒 tak bisa di-switch.
- [ ] Aktivasi: pilih slug (saran + cek + blocklist), dikunci; halaman "Toko Bergabung" live.
- [ ] Upload logo jalan; dipakai header/invoice/OG.
- [ ] Reset via WA jalan (HP terdaftar → tombol; tidak → tak muncul) + Turnstile + rate limit.
- [ ] Tutup manual override jadwal; pill buka/tutup ngepas di semua tema.
- [ ] Invoice langganan rapi & profesional di HP, ter-print jadi PDF.
- [ ] Pengumuman & section kepercayaan opsional muncul hanya jika terisi.
