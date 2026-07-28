# ADR-0002: Cloudflare D1 sebagai database

**Status:** diterima · 2026-07-28

## Konteks
Butuh SQL relational (tenant, langganan, komisi, event) dengan biaya ~nol dan dekat dengan Worker.

## Opsi
1. **D1 (SQLite managed)** — binding native, free tier 5 GB / 5 juta read per hari.
2. Supabase/Neon (Postgres) — lebih kaya fitur, tapi vendor kedua + koneksi keluar edge (latency) + free tier bisa berubah.
3. KV/durable objects saja — tidak relational, query komisi/laporan jadi menyakitkan.

## Keputusan
D1. Data model kita kecil dan relational sederhana; SQLite lebih dari cukup.

## Konsekuensi
- (+) Nol biaya sampai skala besar, query dari Worker tanpa network hop signifikan.
- (−) Single-writer SQLite — tulis masif (tracker) harus batch + `waitUntil`; jalur upgrade di ADR-0007.
- (−) Migrasi skema manual via wrangler migrations — disiplin file migrasi wajib.
