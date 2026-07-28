# Roadmap

## Fase 1 — 60 hari, SCOPE TERKUNCI

Hanya ini. Permintaan di luar daftar = tolak atau tunda ke Fase 2 (butuh konfirmasi eksplisit).

**Scope:**
- 1 vertikal: **kuliner**. 3 tema, lolos checklist `theme-spec.md`.
- Situs publik tenant (subdomain) + edge cache.
- Halaman demo kuliner + theme switcher + personalisasi nama usaha (JS sisi browser) + form lead + pencatatan `?ref`.
- Halaman komisi ojol read-only (`/r/KODE` + PIN): scan, closing per nama klien, status cicilan, total diterima.
- Form intake klien.
- CMS klien mobile-first: 6 menu (Info Usaha, Menu/Layanan, Promo, Galeri, Pesan Masuk*, Statistik) + ganti tema dengan preview. (*Pesan Masuk fase 1 = daftar testimoni pending untuk dimoderasi.)
- Tracker 5 event + agregasi harian + teks laporan siap-copy.
- Admin panel: kelola tenant, verifikasi pembayaran QRIS, kelola referrer & payout komisi, lihat lead.
- Aturan langganan: grace → suspend → arsip (otomatis via cron, aksi manual via admin).
- T&C klien 1 halaman (refund 7 hari, suspend, kepemilikan konten) — dilampirkan saat closing.

**Definition of Done Fase 1 (cek satu per satu):**
- [ ] 3 tema kuliner live, semua lolos Lighthouse mobile ≥ 90 dengan data realistis
- [ ] Demo kuliner live; scan QR `?ref` → tercatat; form lead masuk admin panel
- [ ] Alur referral end-to-end teruji: scan → lead → closing → 3 cicilan komisi muncul → tandai paid → tampil benar di halaman `/r/KODE` ojol
- [ ] 1 tenant demo di-setup dari nol (intake → live) dalam ≤ 30 menit
- [ ] Klien bisa: login dari HP, edit menu, pasang promo (auto-expire terbukti), approve testimoni, ganti tema dengan preview
- [ ] Tracker terbukti: klik WA di situs → angka naik di menu Statistik
- [ ] Suspend teruji: tenant nunggak H+7 → situs "nonaktif", bayar → pulih
- [ ] Semua logika bisnis punya unit test, suite hijau
- [ ] **≥ 1 klien bayar sungguhan** (ini definisi cashflow, bukan teknis)

**Non-goals Fase 1 (eksplisit):** vertikal ke-2, tema ke-4, payment gateway, WA API, akun login penuh untuk ojol (halaman read-only + PIN sudah cukup), custom domain otomatis (Pro pertama boleh disetel manual), otomasi laporan.

## Fase 2 — setelah Fase 1 DoD lengkap + ≥ 10 tenant bayar

- Vertikal ke-2 berdasarkan permintaan nyata (bengkel/laundry/klinik — data lead menentukan).
- Tema ke-4+ hanya jika ada permintaan nyata.
- WA API (Fonnte/sejenis): laporan bulanan otomatis + reminder tagihan.
- Tombol AI terintegrasi di admin panel & CMS ("Rapikan teks", "Buatkan deskripsi menu") — **vendor terpilih: Gemini Flash** (free tier dulu). Butuh ADR saat masuk. Fase 1 sudah pakai AI tanpa API: tombol "Copy Prompt AI" di kurasi (lihat business-rules).
- Generator OG-image ber-branding (kandidat `workers-og`) — Fase 1 cukup foto andalan tenant sebagai og:image.
- Halaman komisi read-only untuk ojol.
- Payment gateway QRIS dinamis jika verifikasi manual > 1 jam/hari.
- Cloudflare for SaaS self-service untuk Pro.

**Selesai jika:** 2 vertikal live, laporan & reminder otomatis, ≥ 30 tenant bayar.

## Fase 3 — skala

- Onboarding self-service penuh (klien bisa mulai tanpa kami).
- Rekrut & kelola jaringan ojol lebih besar (materi + dashboard).
- 3+ vertikal, library tema per vertikal.
- Evaluasi: Analytics Engine untuk tracker, payment gateway penuh, tim pertama.

**Selesai jika:** ≥ 100 tenant bayar, churn bulanan < 5%, operasional ≤ 2 jam/hari.
