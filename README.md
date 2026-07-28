# tokoweb.id

Platform website kilat untuk UMKM Indonesia. Multi-tenant, berbasis tema, distribusi via referral ojol. Website premium, load < 1 detik, harga terjangkau.

## Status

🏗️ **Fase fondasi** — dokumen selesai, scaffolding kode belum dimulai. Roadmap: [docs/roadmap.md](docs/roadmap.md).

## Cara kerja (ringkas)

Satu engine, banyak tema. Data usaha (menu, jam buka, promo, galeri) terpisah dari presentasi — ganti tema, data tetap. Situs publik disajikan dari cache edge Cloudflare: perilaku statis, skala ≈ gratis.

```
Ojol sebar brosur QR → prospek lihat demo hidup → closing →
intake form → kurasi → website live ≤ 30 menit → klien kelola via CMS mobile
```

## Stack

| Lapisan | Teknologi |
|---|---|
| Runtime | Cloudflare Workers + Hono + TypeScript strict |
| Database | Cloudflare D1 (SQLite) |
| Storage foto | IDCloudHost S3 (via `StoragePort`, S3-compatible) |
| Render | Edge SSR + cache HTML, purge saat konten berubah |
| Test | Vitest + `@cloudflare/vitest-pool-workers` |
| Email | Resend (reset password) |

Alasan tiap keputusan: [docs/adr/](docs/adr/).

## Dokumen

| Dokumen | Isi |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Konstitusi proyek: prinsip, konvensi, DoD, larangan |
| [docs/business-rules.md](docs/business-rules.md) | Harga, komisi, suspend, promo, testimoni |
| [docs/architecture.md](docs/architecture.md) | Arsitektur + proyeksi biaya |
| [docs/data-model.md](docs/data-model.md) | Skema entitas + contoh JSON |
| [docs/theme-spec.md](docs/theme-spec.md) | Kontrak tema + checklist kualitas (Lighthouse ≥ 90) |
| [docs/tracker-spec.md](docs/tracker-spec.md) | Event, privasi, laporan bulanan |
| [docs/referral-spec.md](docs/referral-spec.md) | QR → demo → closing → komisi |
| [docs/flows.md](docs/flows.md) | Diagram alur (sequencediagram.org) |
| [docs/roadmap.md](docs/roadmap.md) | Fase 1–3 + Definition of Done |

## Perintah

Diisi saat scaffolding: `npm run dev` · `npm test` · `npm run deploy`.

## Konvensi penting

TypeScript strict, tanpa komentar kode, UI dari shared component (`src/ui/`), import absolute (`@/`), unit test wajib untuk logika bisnis, husky pre-commit, PR pakai template. Detail: [CLAUDE.md](CLAUDE.md).
