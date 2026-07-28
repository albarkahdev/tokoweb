# Spesifikasi Tracker

Tracker milik sendiri. Tujuan: bukti nilai ke klien (alat retensi), bukan surveillance.

## Event

| Type | Kapan |
|---|---|
| `page_view` | Halaman situs publik dimuat |
| `click_wa` | Tombol WhatsApp diklik |
| `click_phone` | Tombol telepon diklik |
| `click_maps` | Tombol Maps diklik |
| `click_promo` | Kartu promo diklik (bawa `promo_id`) |

## Payload

`POST https://app.tokoweb.id/t`

```json
{ "t": "click_wa", "p": "/", "pid": null }
```

- `tenant_id` di-resolve server-side dari header `Origin`/`Referer` — klien tidak bisa memalsukan tenant lain.
- Dikirim via `navigator.sendBeacon` (tidak menahan navigasi). Script inline < 1 KB, tanpa library.

## Privasi (aturan keras)

- **Tanpa cookie, tanpa fingerprinting, tanpa data pribadi.**
- Dedup pengunjung: `visitor_hash = SHA-256(IP + UA + tenant_id + salt_harian)` — salt berganti tiap hari, hash tidak bisa dibalik, otomatis "lupa" pengunjung setelah 24 jam.
- IP mentah tidak pernah disimpan.
- Bot filter sederhana: UA bot dikenal di-skip.
- **Tanpa lokasi** — geo (kota/negara) tidak dikumpulkan. Keputusan final; kalau berubah, update spec ini dulu.

## Anti-abuse

Semua penolakan tetap balas `204` — tidak memberi sinyal ke penyerang.

- Validasi keras: `t` wajib salah satu dari 5 type, `p` wajib diawali `/` max 200 char, `pid` wajib integer positif dan hanya untuk `click_promo`. Body > 1 KB = drop.
- Tenant resolve server-side dari `Origin`/`Referer` — origin asing atau tenant non-aktif = drop.
- Rate limit per `visitor_hash`: 60 event/menit, fixed window in-memory per isolate (bukan bulletproof lintas isolate — cukup untuk abuse kasar).
- Botnet serius: Cloudflare WAF rate rule di `/t` (config dashboard, bukan kode).
- Debounce client-side: flag "sudah kirim" per tombol per pageload — klik ganda = 1 event. (Masuk script tema saat tema dibangun.)
- Opsi lanjutan saat agregasi: exclude hash dengan volume tidak wajar per hari (belum diimplementasi).

## Penulisan (tidak boleh memperlambat situs)

- Endpoint tracker balas `204` instan; insert D1 lewat `ctx.waitUntil()`.
- Event mentah > 90 hari dihapus (agregat tetap).

## Agregasi

- Cron harian (00:30 WIB = 17:30 UTC): rekap `track_events` kemarin (hari WIB, window 17:00 UTC – 17:00 UTC) → `daily_stats (tenant_id, date, type, count)`.
- `unique_visitors` disimpan sebagai baris `type = 'unique_visitors'` di `daily_stats` (COUNT DISTINCT `visitor_hash`).
- `daily_stats.date` = label tanggal WIB (hari yang dilihat pemilik usaha), timestamp mentah tetap UTC.
- Agregasi idempotent (upsert) — cron boleh jalan ulang tanpa dobel hitung.
- Menu Statistik CMS baca `daily_stats` saja — murah, cepat.

## Laporan bulanan (alat retensi)

Cron tanggal 1: hitung rekap bulan lalu per tenant, simpan + tampilkan di CMS. Fase 1 pengiriman WA manual — admin panel menyediakan **teks siap-copy**:

```
Laporan {Nama Usaha} — {Bulan}
👀 {n} kunjungan ({delta}% vs bulan lalu)
💬 {n} klik WhatsApp
📞 {n} klik telepon
📍 {n} klik lokasi
🔥 Promo terpopuler: {judul} ({n} klik)
Websitemu bekerja untukmu. Lanjutkan! 💪
```

Fase 2: kirim otomatis via WA API.
