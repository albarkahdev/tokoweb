# Panduan tokoweb.id — A sampai Z

Panduan lengkap untuk semua peran dan fitur platform. Bahasa sederhana, langkah demi langkah.

Alamat penting:
- **Situs jualan / landing**: `https://tokoweb.id`
- **Panel kelola (CMS + Admin)**: `https://app.tokoweb.id`
- **Demo hidup**: `https://demo.tokoweb.id/kuliner`
- **Website klien**: `https://namausaha.tokoweb.id`
- **Halaman komisi mitra**: `https://tokoweb.id/r/KODE`

---

## 1. Empat peran

| Peran | Siapa | Masuk lewat | Butuh login? |
|-------|-------|-------------|--------------|
| **Admin** | Kamu (pemilik platform) | `app.tokoweb.id/masuk` | Ya — email + password |
| **Owner / Klien** | Pemilik warung pelanggan | `app.tokoweb.id/masuk` | Ya — email + password |
| **Mitra** | Pembawa klien (ojol, sales, siapa pun) | `tokoweb.id/r/KODE` | Tidak — cukup kode + PIN 6 digit |
| **Pengunjung** | Calon pembeli warung | `namausaha.tokoweb.id` | Tidak |

Aturan penting: **klien & mitra tidak bisa daftar akun login sendiri**. Owner dibuatkan akun oleh admin. Mitra mendaftar (form) tapi harus disetujui admin dulu.

---

## 2. Panduan ADMIN (kamu)

Masuk: `app.tokoweb.id/masuk` → email + password admin → otomatis ke `/admin`.

### 2.1 Dashboard `/admin`
Ringkasan: jumlah tenant aktif, lead masuk, mitra, pembayaran. Titik awal semua kerja.

### 2.2 Kelola Tenant (klien) `/admin/tenant`
Daftar semua warung pelanggan + statusnya:
- **draft** — baru dibuat, belum tayang
- **active** — langganan lunas, website hidup
- **grace** — jatuh tempo lewat, belum bayar (masih tayang, ada peringatan)
- **suspended** — nonaktif karena nunggak (website mati)

Buka detail tenant untuk:
- **Verifikasi Pembayaran QRIS** — tandai setup fee atau langganan bulanan lunas. Isi jenis, nominal, periode (mis. `2026-08`).
- **Go Live 🚀** — muncul kalau status draft + konten terisi + setup fee lunas. Menayangkan website.
- **Suspend / Pulihkan** — matikan/hidupkan website manual.
- **Refund** — batalkan tenant + void komisi cicilan-1 mitra.
- **Edit CMS Tenant Ini ✏️** — masuk ke CMS klien untuk bantu isi/rapikan konten (lihat 2.7).
- **Akses Klien** — buat akun owner + link atur password, atau link intake (form isi data, berlaku 3 hari).
- **Laporan Bulanan** — teks siap-salin untuk dikirim ke klien via WA tiap tanggal 1.

### 2.3 Lead `/admin/lead`
Calon klien yang mengisi form dari demo atau brosur QR mitra. Dari sini kamu **closing**: ubah lead jadi tenant + langganan. Kalau lead terikat kode mitra, komisi 3 cicilan otomatis dibuat (tarif terkunci saat closing).

### 2.4 Mitra `/admin/referrer`
- Daftar mitra + jumlah scan brosur.
- Mitra yang daftar sendiri muncul badge **menunggu ✋** → tombol **Setujui ✓** / **Tolak**. Sebelum disetujui, kodenya belum berlaku dan halaman komisinya terkunci.
- **Daftarkan Mitra Baru** manual: nama, no WA, rekening, PIN 6 digit → sistem buat kode unik + URL brosur QR.
- Nonaktifkan/aktifkan mitra kapan saja.

### 2.5 Payout `/admin/payout`
Daftar komisi yang jatuh tempo dibayar ke mitra. Tandai sudah dibayar setelah transfer manual.

### 2.6 Intake `/admin/intake`
Kelola link form intake klien (token berlaku 3 hari) untuk klien isi data usaha sendiri.

### 2.7 Mode Admin (bantu edit CMS klien)
Detail tenant → **Edit CMS Tenant Ini ✏️** → kamu masuk penuh ke CMS warung itu (bisa edit menu, promo, foto — bahkan saat tenant suspended). Muncul banner kuning **"Mode Admin — kamu mengedit {nama warung}"** + link **"Selesai, kembali ke Admin →"** untuk keluar. Fitur ini khusus admin; owner tidak bisa memakainya.

---

## 3. Panduan OWNER / KLIEN (pemilik warung)

Cara dapat akun: admin membuatkan + mengirim **link atur password** via WA. Klien klik link → buat password (min 8 karakter) → langsung masuk.

Masuk harian: `app.tokoweb.id/masuk` → email + password.

### 3.1 Beranda CMS `/`
Dibuka kartu **"Mau ngapain hari ini?"** — 6 tombol besar ramah jempol:
Edit Menu · Pasang Promo · Upload Foto · Pratinjau · Ganti Tema · Info & Jam.
Di bawahnya: status langganan (LUNAS / jatuh tempo), alamat website, dan **kartu QR** untuk di-screenshot & dicetak (kasir, meja, brosur).

Navigasi utama ada di bar bawah layar (seperti aplikasi HP): Beranda, Info, Menu, Promo, Galeri, Pesan, Statistik.

### 3.2 Info Usaha `/info`
Nama usaha, tagline, tentang (cerita usaha), alamat, link Google Maps, no WhatsApp (wajib format `62xxxxxxxxxx`), telepon, Instagram, **teks banner atas** (tampil di banner berjalan kalau tidak ada promo), dan jam buka per hari.

### 3.3 Menu `/menu`
- Tambah item: nama, harga, deskripsi, tandai **andalan** (tampil di beranda).
- Tiap item punya halaman **Kelola**: edit, unggah sampai **3 foto** (otomatis dikompres), atur **andalan 🔥** on/off (ganti item mana yang tampil di depan kapan pun), tandai **Spesial Hari Ini ⭐** (tampil menonjol di atas), atau **nonaktifkan** (hilang dari website tapi tetap tersimpan — untuk menu musiman).

### 3.4 Promo `/promo`
Judul, deskripsi, tanggal mulai & berakhir. Promo tampil di website hanya dalam rentang tanggalnya, lalu hilang otomatis. Promo kadaluarsa tetap tersimpan — bisa diaktifkan ulang dengan tanggal baru.

### 3.5 Galeri `/galeri`
Upload foto suasana/makanan. Tampil di beranda + halaman galeri (bisa diklik jadi layar penuh dengan panah kiri/kanan).

### 3.6 Pesan `/pesan`
Testimoni pelanggan yang masuk. Kamu **setujui** dulu sebelum tampil di website, atau hapus kalau spam.

### 3.7 Statistik `/statistik`
Berapa pengunjung, berapa yang klik WhatsApp, promo mana paling diklik — dalam narasi mudah dipahami.

### 3.8 Ganti Tema `/tema`
60 tema premium. Ada kotak **cari** (ketik "gelap", "mewah", "playful", "animasi"…). Ganti kapan pun — data & foto tidak berubah. Ada tombol **Preview dengan datamu**.

### 3.9 Pratinjau Website
Tombol **Pratinjau** (beranda/`/pratinjau`) menampilkan website dengan data terkini sebelum publik melihatnya — termasuk saat masih draft. Tidak terindeks Google, tidak di-cache.

### 3.10 Lupa password?
Belum ada reset mandiri via email. Hubungi admin via WA → admin kirim link atur ulang.

---

## 4. Panduan MITRA (pembawa klien)

Siapa pun boleh: ojol, kurir, sales, mahasiswa. Tanpa modal, bukan MLM. Komisi per klien yang **membayar** (bukan sekadar scan).

### 4.1 Daftar
`tokoweb.id/mitra` → isi nama, no WA (`62…`), PIN 6 digit → submit. Status **pending** dulu; admin verifikasi (anti-spam) lalu hubungi via WA ≤ 1 hari dengan kode unik + brosur QR. Simpan kode & PIN baik-baik.

### 4.2 Cara kerja
1. Tunjukkan brosur QR-mu ke pemilik warung.
2. Mereka scan → demo hidup dengan nama usaha mereka → closing lebih gampang.
3. Klien bayar → komisi masuk.

### 4.3 Komisi
- **Basic**: Rp 50.000 × 3 = Rp 150.000
- **Pro**: Rp 100.000 × 3 = Rp 300.000
- Cicilan-1 cair setelah masa refund klien 7 hari lewat (aman dari pembatalan). Cicilan berikutnya mengikuti pembayaran langganan bulanan klien.
- Klien berhenti/nunggak → cicilan tersisa hangus. Scan doang = Rp 0.

### 4.4 Cek komisi
`tokoweb.id/r/KODEKAMU` → masukkan PIN 6 digit → lihat scan, closing, komisi cair. Read-only, tanpa aplikasi. Salah PIN 5×/menit → tunggu sebentar.

---

## 5. Panduan PENGUNJUNG (pembeli warung)

Buka `namausaha.tokoweb.id`:
- Lihat menu, harga, foto, jam buka, lokasi.
- Klik menu → popup detail (foto geser + tombol **Pesan Menu Ini** langsung ke WhatsApp warung).
- Banner promo berjalan di atas; halaman khusus Menu, Promo, Galeri, Testimoni via navbar.
- Tombol **Bagikan ↗** untuk kirim link ke teman.
- Tombol WhatsApp selalu ada — pesan langsung tanpa aplikasi lain.

---

## 6. Alur lengkap (dari nol sampai jualan)

1. **Mitra** sebar brosur QR → pemilik warung scan → **demo hidup**.
2. Pemilik warung isi form lead (nama, usaha, WA) → masuk ke **Admin › Lead**.
3. **Admin** hubungi via WA, closing → buat **tenant + langganan** + akun owner + link atur password.
4. **Owner** klik link → set password → masuk CMS → isi menu, foto, jam, promo (atau admin bantu via Mode Admin).
5. Owner bayar setup fee (QRIS) → **Admin** verifikasi → **Go Live 🚀**.
6. Website tayang di `namausaha.tokoweb.id`. **Cicilan-1 mitra** cair.
7. Tiap bulan: klien bayar langganan → admin verifikasi → cicilan mitra lanjut + laporan bulanan dikirim.

---

## 7. Istilah singkat

- **Tenant** = satu warung pelanggan (satu website).
- **Setup fee** = biaya sekali di awal (Basic Rp 300rb / Pro Rp 1jt).
- **Langganan** = biaya bulanan (Basic Rp 75rb / Pro Rp 200rb).
- **Grace / Suspend / Arsip** = tahap saat langganan telat: masih tayang (grace) → mati (suspend, H+7) → diarsip (H+90).
- **Closing** = mengubah lead jadi klien berbayar.
- **Cicilan komisi** = komisi mitra dibayar 3 tahap mengikuti pembayaran klien.

Detail aturan bisnis lengkap: lihat `docs/business-rules.md`.
