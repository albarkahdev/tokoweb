# ADR-0001: Cloudflare Workers + Hono + TypeScript

**Status:** diterima · 2026-07-28

## Konteks
Solo founder, budget ~nol, situs publik harus < 1 dtk di sinyal jelek, target 500+ tenant dengan biaya tetap rendah.

## Opsi
1. **Cloudflare Workers + Hono** — edge, free tier besar, satu runtime untuk situs publik/CMS/admin/tracker.
2. Next.js di Vercel — DX bagus, tapi biaya naik tajam di traffic tinggi, berat untuk kebutuhan ini.
3. VPS + Node/Laravel — kontrol penuh, tapi ops (patching, scaling, uptime) jadi beban solo founder.
4. WordPress multisite — cepat mulai, tapi lambat, rawan, maintenance tinggi, tema premium sulit dijaga.

## Keputusan
Opsi 1. Hono: micro-framework stabil, first-class Workers, JSX server-side untuk template tema tanpa React runtime.

## Konsekuensi
- (+) $0 sampai ~100 tenant; naik ke $5/bln setelahnya. Deploy detik-an, nol server ops.
- (−) Vendor lock-in Cloudflare (dimitigasi: logika bisnis murni di `src/domain/`, storage di balik port).
- (−) Runtime Workers ≠ Node penuh — dependensi harus kompatibel (justru memaksa disiplin dependensi minim).
