# Diagram Alur

Source untuk https://sequencediagram.org — paste ke editor, diagram langsung jadi.

## Alur utama: Referral → Closing → Komisi 3 cicilan

```
title Referral → Closing → Komisi (3 cicilan)

actor Ojol
actor "Prospek / Klien" as Klien
participant "Demo\ndemo.tokoweb.id/kuliner" as Demo
participant "Worker (sistem)" as Sys
database "D1" as DB
actor "Admin (kamu)" as Admin

note over Ojol,Demo: TAHAP 1 — SCAN & LEAD
Ojol->Klien: kasih brosur QR (kode K7M3XR)
Klien->Demo: scan QR → ?ref=K7M3XR
Demo->Sys: catat scan
Sys->DB: referrals.first_scan_at
Demo-->Klien: demo hidup + switcher 3 tema
Klien->Demo: ketik nama usaha ("Bakso Mas Joko")
Demo-->Klien: JS ganti nama di halaman seketika\n(tanpa server, tetap cache)
Klien->Demo: isi form CTA (nama terbawa otomatis, no WA)
Demo->Sys: submit lead (dedup by no WA)
Sys->DB: leads (terikat kode ojol, first-touch menang)

note over Klien,Admin: TAHAP 2 — CLOSING
Admin->Klien: follow-up via WA
Klien->Admin: deal, bayar setup via QRIS statis
Admin->Sys: verifikasi bayar di admin panel
Sys->DB: payments(setup) + tenant dibuat + referral↔tenant
Sys->DB: commission_payouts ×3 dibuat\ncicilan-1 = payable
Admin->Ojol: transfer cicilan-1 (≤ 1 hari)
Admin->Sys: tandai paid
Sys->DB: payout-1 = paid

note over Klien,Admin: TAHAP 3 — BULAN 2 & 3
Klien->Admin: bayar langganan bulan-2
Admin->Sys: verifikasi
Sys->DB: payments(bulanan) → payout-2 = payable
Admin->Ojol: transfer cicilan-2
Klien->Admin: bayar langganan bulan-3
Admin->Sys: verifikasi
Sys->DB: payout-3 = payable
Admin->Ojol: transfer cicilan-3

note over Ojol,Sys: KAPAN SAJA — TRANSPARANSI
Ojol->Sys: buka /r/K7M3XR + PIN
Sys->DB: baca referral, closing, cicilan
Sys-->Ojol: scan, closing (nama klien),\nstatus cicilan, total diterima

alt Klien berhenti / nunggak melewati arsip
Sys->DB: sisa cicilan = void (hangus)
Sys-->Ojol: status "hangus" terlihat di /r/K7M3XR
else Klien telat bayar tapi akhirnya bayar (masa grace/suspend)
Admin->Sys: verifikasi pembayaran telat
Sys->DB: cicilan bulan tsb tetap payable — bayar = bayar
else Klien refund ≤ 7 hari setelah setup
Sys->DB: cicilan-1 void / dipotong payout berikutnya
end
```

## Alur pendukung: Pengunjung buka situs (edge cache)

```
title Pengunjung buka situs tenant

actor Pengunjung
participant "Cloudflare Edge\n(cache)" as Edge
participant "Worker" as Sys
database "D1" as DB
participant "IDCloudHost S3" as S3

Pengunjung->Edge: buka warungbusari.tokoweb.id
alt Cache HIT (99% kasus)
Edge-->Pengunjung: HTML dari fotokopi (instan)
else Cache MISS (habis konten diubah)
Edge->Sys: render
Sys->DB: ambil tenant + konten + promo aktif
Sys->S3: (foto: hanya saat cache miss juga)
Sys-->Edge: HTML jadi → simpan fotokopi
Edge-->Pengunjung: HTML
end
Pengunjung->Sys: klik tombol WA → beacon tracker
Sys-->Pengunjung: 204 (tidak menahan halaman)
Sys->DB: tulis event (background, waitUntil)
```

## Alur onboarding: Closing → Intake → Live (target ≤ 30 menit)

```
title Onboarding: Closing → Intake → Live (≤ 30 menit)

actor "Klien (Bu Sari)" as Klien
participant "Form Intake\n(link unik via WA)" as Form
participant "Worker (sistem)" as Sys
database "D1" as DB
participant "IDCloudHost S3" as S3
actor "Admin (kamu)" as Admin

note over Klien,Admin: TAHAP 1 — INTAKE (klien, dari HP)
Admin->Klien: kirim link intake unik via WA\n(setelah setup dibayar)
Klien->Form: buka dari HP
Klien->Form: isi: nama usaha, tentang, alamat,\nno WA, jam buka, email (utk login CMS)
Klien->Form: tambah menu: nama, harga, foto
Form->Form: foto di-resize + WebP\ndi browser (sebelum upload)
Form->S3: upload foto
Form->Sys: submit intake
Sys->DB: intake_forms (raw JSON)\n+ tenant status = draft
Sys-->Admin: notifikasi: intake baru masuk

note over Sys,Admin: TAHAP 2 — KURASI (kamu, di admin panel)
Admin->Sys: buka intake di admin panel
Admin->Sys: klik "Copy Prompt AI"\n(prompt berisi data intake + instruksi)
Sys-->Admin: prompt siap-tempel
Admin->Admin: paste ke Gemini (gratis) →\ndeskripsi menu, tagline, meta description
Admin->Sys: tempel hasil AI, rapikan final,\ncrop foto, pilih ≤ 7 item featured
Admin->Sys: set subdomain (warungbusari)\n+ pilih tema awal (preview 3 tema)
Admin->Sys: klik "Go Live"
Sys->DB: contents (JSON rapi) + tenant = active
Sys->Sys: generate SEO otomatis:\ntitle, meta, OG (og:image = foto andalan),\nJSON-LD LocalBusiness, sitemap
Sys->Sys: render + cache halaman
Sys-->Admin: warungbusari.tokoweb.id LIVE

note over Klien,Admin: TAHAP 3 — SERAH TERIMA
Admin->Klien: WA: link website + link set password CMS
Klien->Sys: set password → masuk CMS dari HP
Sys-->Klien: beranda CMS: kartu status langganan\n+ 6 menu + statistik mulai berjalan

alt Intake tidak lengkap / foto jelek
Admin->Klien: follow-up WA minta kekurangan
Klien->Form: lengkapi via link yang sama
else Klien buntu / tidak paham form
Admin->Klien: telepon, pandu isi bareng\n(atau kamu isikan langsung di admin panel)
end
```
