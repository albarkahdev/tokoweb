# CLAUDE.md — Konstitusi Proyek

Platform website kilat untuk UMKM Indonesia. Multi-tenant, berbasis tema, distribusi via referral ojol.
Semua sesi coding WAJIB baca file ini + ADR terkait sebelum menulis kode.

## Konteks bisnis (ringkas)

- Satu engine, banyak tema. Data usaha terpisah dari presentasi — ganti tema, data tetap.
- Kualitas premium dengan harga murah. Load < 1 detik di sinyal jelek. Lighthouse mobile ≥ 90 = requirement.
- Tema per vertikal. **Fase 1: HANYA vertikal kuliner, 3 tema.** Scope terkunci (lihat `docs/roadmap.md`).
- Distribusi: brosur QR unik per ojol → demo hidup → closing → komisi per klien (bukan gaji).
- Solo founder, budget nyaris nol, target cashflow 60 hari.
- Harga & aturan bisnis lengkap: `docs/business-rules.md`.

## Prinsip kerja

1. **Boring technology menang.** Stabil, murah, bisa di-maintain sendirian.
2. **Biaya per tenant mendekati nol.** Cloudflare Workers + D1, storage IDCloudHost (ada kredit).
3. **Kecepatan = fitur bisnis.** Situs publik disajikan dari cache edge, bukan render per request.
4. **Keputusan dicatat di ADR** (`docs/adr/`), bukan diingat.
5. **Tantang keputusan yang salah.** Jangan jadi yes-man.

## Alur kerja sesi coding

1. Baca CLAUDE.md + ADR relevan.
2. Buat rencana singkat, minta persetujuan.
3. Baru coding.

## Konvensi kode

- TypeScript strict. Runtime: Cloudflare Workers. Framework HTTP: Hono.
- Monorepo sederhana: `src/domain/` (logika bisnis murni, tanpa dependensi framework), `src/routes/`, `src/themes/`, `src/db/`.
- Logika bisnis = fungsi murni yang bisa dites tanpa Miniflare.
- Test: Vitest + `@cloudflare/vitest-pool-workers`. Logika bisnis baru tanpa test = tidak selesai.
- Bahasa: kode & identifier Inggris, copy/UI Bahasa Indonesia, dokumen Bahasa Indonesia.

## Perintah (diisi final saat scaffolding)

- Dev: `npm run dev` (wrangler dev)
- Test: `npm test` (vitest)
- Deploy: `npm run deploy` (wrangler deploy) — hanya setelah test hijau.

## Definition of Done (per perubahan)

- [ ] Test logika bisnis lulus (baru + lama).
- [ ] Situs publik yang terdampak masih lolos Lighthouse mobile ≥ 90.
- [ ] Tidak menambah dependensi tanpa ADR.
- [ ] Dokumen terkait di-update jika aturan berubah.

## Larangan

- ❌ Dependensi baru tanpa ADR.
- ❌ Fitur di luar scope Fase 1 tanpa konfirmasi eksplisit user (ingatkan kalau diminta pun).
- ❌ Logika bisnis di dalam route handler (harus di `src/domain/`).
- ❌ Menyimpan data pribadi pengunjung di tracker (lihat `docs/tracker-spec.md`).
- ❌ Query D1 per-request untuk situs publik yang bisa di-cache.
