# Spesifikasi Referral (Ojol)

Referral **satu tingkat**, komisi per closing per klien. Bukan MLM, bukan gaji.

## Alur end-to-end

```
Daftar ojol → kode unik → brosur QR dicetak
   │
Scan QR → demo.tokoweb.id/kuliner?ref=KODE
   │         (scan tercatat: referrals.first_scan_at)
   │
Prospek tertarik → isi form CTA di demo (nama, usaha, no WA)
   │         → leads (terikat referrer via kode)
   │
Kami follow-up via WA → closing → klien bayar setup (QRIS)
   │
Admin panel: tandai lead closed → buat tenant → link referral
   │         → 3 baris commission_payouts dibuat
   │
Cicilan-1 payable → transfer ≤ 1 hari → tandai paid
Cicilan-2/3 payable saat klien bayar bulan 2/3
```

## Kode referral

- Format: 6 karakter alfanumerik kapital tanpa karakter ambigu (`O/0`, `I/1`), contoh: `K7M3XR`.
- URL QR: `https://demo.tokoweb.id/kuliner?ref=K7M3XR`.
- Kode salah/kadaluarsa → demo tetap terbuka tanpa ref (jangan matikan funnel).
- `ref` disimpan di `localStorage` halaman demo — kalau prospek isi form beberapa hari kemudian dari device sama, atribusi tetap.

## Halaman demo

- Statis per vertikal, data dummy realistis ("Warung Bu Sari"), di-cache penuh — scan massal tidak berbiaya.
- **Personalisasi instan sisi browser**: kotak "Coba dengan nama usahamu" → prospek ketik nama → JavaScript mengganti semua nama di halaman detik itu juga. Server tetap kirim halaman cache yang sama (biaya nol). Nama tersimpan `localStorage` + otomatis terbawa ke form lead.
- Bar CTA melayang: "Suka website ini? Punya versimu sendiri mulai Rp 75rb/bulan" → form: nama, nama usaha, no WA. Submit → `leads` + notifikasi ke kami (fase 1: cek admin panel / email).
- Lead dobel (no WA sama submit berulang) → dedup, hitung satu, `ref` pertama menang.
- Demo bisa ganti-ganti 3 tema langsung dari halaman (switcher) — memamerkan fitur ganti tema.

## Atribusi & sengketa

- Lead menyimpan `referrer_id` dari `ref` saat submit form.
- Closing tanpa lead form (prospek langsung WA kami): tanya "tahu dari siapa?" → admin set referrer manual. Tidak tahu → tanpa referrer.
- Satu tenant = maksimal satu referral. First-touch menang (scan pertama yang tercatat di lead).

## Anti-fraud (sederhana, sepadan skala)

- Scan = Rp 0. Komisi hanya lahir dari **pembayaran nyata klien** — fraud otomatis tidak menguntungkan.
- Self-referral: no WA lead = no WA referrer → tolak, tandai manual review.
- Satu no WA klien = satu closing berkomisi (cek duplikat di `leads.wa_number` + `tenants`).
- Klien refund/batal < 7 hari → cicilan-1 di-void (kalau belum cair) atau dipotong dari payout berikutnya.
- Rate limit form demo per IP (anti spam lead).

## Halaman komisi ojol (Fase 1)

- **Read-only, tanpa akun**: `https://tokoweb.id/r/K7M3XR` + PIN 4 digit (dibagikan saat ojol daftar).
- Isi: jumlah scan, daftar closing **dengan nama usaha klien**, status tiap cicilan (menunggu / siap cair / sudah ditransfer / hangus), total yang sudah diterima.
- Bukan CMS, bukan login email — satu halaman, rate-limit percobaan PIN.
- Admin panel tetap punya halaman "Payout": daftar cicilan `payable`, tombol tandai `paid`.
- Fase 2: notifikasi WA otomatis saat cicilan cair.

## Brosur

- Konten: contoh screenshot situs, harga mulai, QR besar, kode ojol tercetak ("sebutkan kode ini").
- QR = URL langsung (tanpa shortener pihak ketiga — jangan tambah dependensi + tracking orang lain).
