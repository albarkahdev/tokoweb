# Arsitektur

## Gambaran

Satu Worker Cloudflare, satu codebase. Routing berdasarkan hostname. Bukan microservice — solo founder.

```
                        Cloudflare
┌─────────────────────────────────────────────────────────────┐
│  *.tokoweb.id ───┐                                      │
│  domain-klien.com ───┤ (wildcard DNS + CF for SaaS)         │
│                      ▼                                      │
│               ┌─────────────┐    ┌──────────┐               │
│               │  WORKER     │───▶│ D1 (SQL) │ tenant,       │
│               │  (Hono)     │    └──────────┘ konten, event │
│               │             │    ┌───────────────────┐      │
│               │ - situs     │───▶│ IDCloudHost S3    │ foto │
│               │   publik    │    │ (via StoragePort) │      │
│               │ - CMS klien │    └───────────────────┘      │
│               │ - admin     │                               │
│               │ - tracker   │  Cache edge: HTML + gambar    │
│               └─────────────┘  di-cache, purge saat update  │
│                      │                                      │
│         Cron Trigger: agregasi event harian,                │
│         auto-expire promo, cek jatuh tempo                  │
└─────────────────────────────────────────────────────────────┘
```

## Permukaan (routing by hostname)

| Hostname | Fungsi |
|---|---|
| `{tenant}.tokoweb.id` | Situs publik tenant (edge-cached) |
| `domain-klien.com` | Situs publik tenant Pro (CF for SaaS, CNAME) |
| `demo.tokoweb.id/{vertikal}?ref=KODE` | Demo hidup per vertikal + pencatatan referral |
| `app.tokoweb.id` | CMS klien (mobile-first) + admin panel (role admin) |
| `app.tokoweb.id/t/...` | Endpoint tracker (POST event) |

## Strategi render & performa (bulletproof traffic)

1. **Situs publik = edge SSR + cache HTML.** Render sekali per perubahan konten, simpan di Cache API dengan key hostname+path. Request berikutnya dilayani dari cache tanpa sentuh D1. Traffic viral → tetap statis.
2. **Purge saat konten berubah**: simpan konten → purge cache tenant tsb → render ulang lazy.
3. **Gambar**: resize + konversi WebP **di browser saat upload** (gratis), simpan ke IDCloudHost S3, disajikan lewat Worker dengan `Cache-Control: immutable` + cache edge. Origin IDCloudHost cuma kena hit sesekali (cache miss).
4. **Tracker non-blocking**: `ctx.waitUntil()` — tulis event tidak pernah menahan respons halaman. Batch insert ke D1. Volume meledak → jalur upgrade: Workers Analytics Engine (ADR-0007).
5. **Lookup tenant by hostname** di-cache (in-memory per isolate + KV bila perlu).
6. Situs publik dilarang query D1 per-request kecuali cache miss.

## Stack (alasan & alternatif ditolak → detail di ADR)

| Komponen | Pilihan | ADR |
|---|---|---|
| Runtime + framework | Cloudflare Workers + Hono + TypeScript | 0001 |
| Database | Cloudflare D1 (SQLite) | 0002 |
| Object storage | IDCloudHost S3 di balik `StoragePort` (R2 = swap kredensial) | 0003 |
| Render | Edge SSR + cache HTML | 0004 |
| Pembayaran | QRIS statis manual | 0005 |
| Auth | Email + password (scrypt), session cookie, reset via email (Resend) | 0006 |
| Tracker | Endpoint sendiri → D1, agregasi cron | 0007 |

## Multi-tenancy & domain

- Wildcard `*.tokoweb.id` → Worker. Kolom `tenants.slug` = subdomain, `tenants.custom_domain` = domain Pro.
- Custom domain: **Cloudflare for SaaS** (100 hostname pertama gratis, lalu $0.10/bln). Klien pasang CNAME, SSL otomatis.
- Domain utama: **tokoweb.id** (sudah dibeli di Hostinger) → nameserver dipindah ke Cloudflare. Jangan beli hosting registrar, hanya domain.
- Tenant `suspended` → situs publik render halaman "sementara nonaktif" (di-cache juga), CMS read-only.

## Testing (requirement, bukan opsional)

- **Unit** (mayoritas): logika bisnis murni di `src/domain/` — komisi, status langganan, promo expire, moderasi. Tanpa mock framework.
- **Render**: tiap tema × fixture data → snapshot HTML + asersi section wajib ada.
- **Integrasi**: routing hostname, auth, tracker endpoint via `@cloudflare/vitest-pool-workers` (Miniflare).
- CI sederhana: test wajib hijau sebelum deploy.

## Proyeksi biaya bulanan

| Komponen | 10 tenant | 100 tenant | 500 tenant |
|---|---|---|---|
| Workers | $0 | $5 | $5 |
| D1 | $0 | $0 | ~$1–3 |
| IDCloudHost storage | pakai kredit | pakai kredit | pakai kredit / ~Rp 25–100rb |
| CF for SaaS | $0 | $0 | ~$5–15 (tergantung jumlah Pro) |
| Resend (email) | $0 | $0 | $0 |
| Domain | ~Rp 20rb | ~Rp 20rb | ~Rp 20rb |
| **Total** | **~Rp 20rb** | **~Rp 100rb** | **~Rp 250–400rb** |

Margin infra di 500 tenant (misal rata-rata Rp 75rb/tenant): biaya < 1,5% revenue.
