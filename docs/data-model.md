# Model Data

Semua tabel di D1 (SQLite). Konten fleksibel disimpan JSON per section — ganti tema tidak menyentuh data.

## Entitas & relasi

```
Vertical 1─* Theme
Vertical 1─* Tenant          Tenant *─1 Theme (aktif)
Tenant   1─1 Content         (JSON per section)
Tenant   1─* Promo
Tenant   1─* Testimonial
Tenant   1─* TrackEvent      → DailyStat (agregat)
Tenant   1─1 Subscription
Tenant   1─* User (owner)    + User admin (kami, tenant_id NULL)
Referrer 1─* Referral        Referral 1─1 Tenant (nullable sampai closing)
Referral 1─* CommissionPayout (3 baris cicilan)
Referrer 1─* Lead            (prospek dari form demo)
Tenant   1─1 IntakeForm      (data mentah klien sebelum diproses)
```

## Tabel

### tenants
`id, slug (subdomain, unik), custom_domain (nullable, unik), name, vertical_id, theme_id, status (draft|active|grace|suspended|archived), created_at`

### verticals
`id, slug (kuliner|bengkel|...), name, required_sections (JSON)` — Fase 1 hanya `kuliner`.

### themes
`id, vertical_id, slug, name, tokens (JSON: warna/font/spacing), status (active|draft)`

### contents
`tenant_id (PK), data (JSON), updated_at` — struktur `data` per vertikal, lihat contoh di bawah.

### promos
`id, tenant_id, title, description, image_key, start_date, end_date, created_at`
Aktif ⟺ `start_date ≤ today ≤ end_date`.

### testimonials
`id, tenant_id, author_name, body, rating (1–5, nullable), status (pending|approved), created_at`

### track_events
`id, tenant_id, type (page_view|click_wa|click_phone|click_maps|click_promo), path, promo_id (nullable), visitor_hash, ts`
Mentah, dipangkas setelah diagregasi > 90 hari.

### daily_stats
`tenant_id, date, type, count` (PK gabungan) — sumber menu Statistik & laporan bulanan.

### subscriptions
`tenant_id (PK), plan (basic|pro), setup_paid_at, monthly_price, next_due_date, status (active|grace|suspended)`

### payments
`id, tenant_id, kind (setup|monthly), amount, period (YYYY-MM), confirmed_at, confirmed_by`
Dibuat manual dari admin panel saat verifikasi QRIS.

### referrers  (ojol)
`id, code (unik, utk QR), name, wa_number, bank_account, status (active|inactive), created_at`

### referrals
`id, referrer_id, tenant_id (nullable), first_scan_at, closed_at (nullable)`

### commission_payouts
`id, referral_id, installment (1|2|3), amount, due_trigger (setup_paid|month2_paid|month3_paid), status (pending|payable|paid|void), paid_at`

### leads
`id, referrer_id (nullable), name, business_name, wa_number, vertical_slug, created_at, status (new|contacted|closed|lost)`
Dari form CTA di halaman demo.

### intake_forms
`id, tenant_id, raw (JSON persis isian klien), processed (bool), created_at`

### users
`id, email (unik), password_hash, role (admin|owner), tenant_id (nullable), created_at`

## Contoh `contents.data` — vertikal kuliner

```json
{
  "info": {
    "name": "Warung Bu Sari",
    "tagline": "Masakan rumahan sejak 1998",
    "about": "Warung keluarga dengan resep turun-temurun...",
    "address": "Jl. Melati No. 3, Bandung",
    "maps_url": "https://maps.app.goo.gl/xxx",
    "wa_number": "6281234567890",
    "phone": "0221234567",
    "instagram": "warungbusari"
  },
  "hours": {
    "mon": ["08:00", "21:00"], "tue": ["08:00", "21:00"],
    "wed": ["08:00", "21:00"], "thu": ["08:00", "21:00"],
    "fri": ["08:00", "21:00"], "sat": ["08:00", "22:00"],
    "sun": null
  },
  "menu": [
    {
      "category": "Makanan",
      "items": [
        { "name": "Nasi Ayam Bakar", "price": 18000, "desc": "Sambal korek", "image_key": "t/warung-bu-sari/menu/ayam-bakar.webp", "featured": true }
      ]
    },
    { "category": "Minuman", "items": [ { "name": "Es Teh", "price": 5000 } ] }
  ],
  "gallery": [
    { "image_key": "t/warung-bu-sari/gallery/01.webp", "alt": "Suasana warung" }
  ]
}
```

Section wajib per vertikal didefinisikan di `verticals.required_sections` — kuliner: `info, hours, menu, gallery`. Validasi saat simpan di CMS.

## Aturan kunci

- `image_key` = path di object storage, bukan URL penuh (storage bisa pindah, ADR-0003).
- Semua tanggal UTC di DB, render pakai Asia/Jakarta.
- Soft delete via status, bukan DELETE (kecuali purge arsip H+90).
