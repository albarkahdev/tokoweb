# ADR-0005: Pembayaran QRIS statis + verifikasi manual

**Status:** diterima · 2026-07-28

## Konteks
Klien UMKM terbiasa QRIS. Payment gateway (Midtrans/Xendit) memotong ~0,7%+ dan menambah integrasi. Fase 1 volume kecil.

## Opsi
1. **QRIS statis milik kami** — klien scan, transfer, konfirmasi WA; kami cek mutasi, tandai lunas di admin panel.
2. Gateway QRIS dinamis — verifikasi otomatis, tapi biaya + KYC + integrasi + webhook.
3. Transfer bank manual — lebih ribet untuk klien daripada QRIS.

## Keputusan
Opsi 1. Admin panel = sumber kebenaran status bayar (`payments` diisi manual).

## Konsekuensi
- (+) Rp 0 biaya transaksi, jalan hari ini juga.
- (−) Kerja manual per pembayaran (~1–2 menit). Trigger pindah gateway: > 30 tenant aktif ATAU verifikasi > 1 jam/hari.
- (−) Status langganan bergantung kedisiplinan input — reminder H-3 dan cron grace/suspend membaca data ini.
