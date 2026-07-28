# Riset Tema — Pola Terbukti & Cetak Biru Katalog 30 Tema

Riset Juli 2026: tren desain resto/F&B global (Awwwards, Framer, agensi), data konversi, template terlaris, dan selera pasar UMKM Indonesia. Tujuan: 3 tema Fase 1 yang tepat sasaran + peta jalan katalog 30 tema.

## Pola terbukti (angka dari riset konversi)

1. **Mobile-first bukan opsi** — 70–80% trafik website resto dari HP. Desain mulai dari layar 360px: satu kolom, tap target besar, CTA sticky.
2. **CTA di atas lipatan = pengungkit terbesar** — tombol order/kontak yang terlihat tanpa scroll mengkonversi **2,3×** lebih tinggi. Kita: tombol WA melayang selalu terlihat.
3. **Kecepatan = uang** — delay 1 detik ≈ konversi turun 7%. Validasi arsitektur cache edge kita.
4. **Menu HTML, bukan PDF/gambar** — menu PDF = elemen dengan bounce rate tertinggi di situs resto. Kita memang render menu dari data.
5. **Foto = bintang utama** — foto makanan besar, full-bleed, jadi fokus hero. Whitespace mengalah ke foto. Deskripsi "menggugah selera" di samping foto.
6. **Cerita menjual** — section "tentang" dengan cerita pemilik/asal-usul mengalahkan teks generik. Cocok dengan UMKM: tiap warung punya cerita.
7. **Warna 2026**: dua kutub yang sama-sama menang — (a) **earth tones hangat** (terracotta, krem, hijau daun, coklat) = terasa manusiawi & premium untuk mayoritas; (b) **gelap moody** (charcoal, sage, emas) = kesan mahal untuk segmen atas. Hitam pekat dipakai hemat; abu hangat/coklat yang menopang.
8. **Typography berani** — headline besar (viewport-scaled), font punya kepribadian; body tetap kalem & terbaca. Maks 2 family.
9. **Animasi mikro, bukan sirkus** — fade/slide halus on-scroll cukup memberi rasa premium; animasi berat membunuh Lighthouse.
10. **Pasar Indonesia**: contoh yang dipuji (Kopi Kenangan dkk) = simple, flow terstruktur, promo menonjol, CTA beli jelas, galeri "instagramable". Selera lokal suka warna berani (merah-kuning-coklat) untuk kelas kaki lima, dan bersih-minimal untuk kelas cafe.

## Anti-pattern (dilarang di semua tema)

- Menu PDF / menu berupa foto JPG.
- Hero video berat (bagus di fiber, bunuh diri di sinyal jelek — pakai foto + micro-animation).
- Foto stock generik — lebih baik foto asli seadanya yang dirapikan.
- Musik autoplay, popup, splash screen.
- Font dari CDN eksternal (wajib self-host, subset).

## 3 Tema Fase 1 (kuliner) — final

Tiga tema harus saling **kontras jelas** saat demo theme-switcher, mencakup 3 segmen psikologis terbesar UMKM kuliner:

### 1. `hangat` — warung & rumah makan keluarga
- **Rasa**: earth tones membumi, jujur, bikin lapar. Segmen terbesar.
- Warna: krem `#FFFBF5`, terracotta `#C4501B`, kuning kunyit `#E8A03C`, coklat tua text.
- Font: Fraunces (heading, serif hangat) + Inter (body).
- Hero: foto masakan full-bleed + overlay gradasi hangat, nama besar, CTA WA.
- Layout menu: kartu foto besar 1 kolom (mobile), grid 2 di tablet.

### 2. `arang` — grill, kopi, dining malam, segmen premium
- **Rasa**: gelap moody, elegan, "mahal". Charcoal + emas.
- Warna: charcoal `#1A1815`, krem tulang `#EDE6DA`, emas `#C9A227`, aksen sage.
- Font: Playfair Display / Marcellus (heading serif tipis) + Plus Jakarta Sans (body).
- Hero: foto gelap dramatis, headline serif besar, banyak ruang napas.
- Layout menu: list elegan dengan garis emas tipis, foto muncul saat tap.

### 3. `ceria` — kedai kekinian, dessert, minuman, target anak muda
- **Rasa**: cerah, playful, dopamine design, sangat instagramable.
- Warna: putih + koral `#FF6B57`, mint `#4ECDC4`, kuning `#FFD166` — aksen berani.
- Font: Bricolage Grotesque / Space Grotesk (heading bulat berkarakter) + Inter (body).
- Hero: warna blok berani + foto produk PNG/latar bersih, headline miring/besar.
- Layout menu: grid 2 kolom kartu warna-warni, badge "favorit 🔥".

Ketiganya memakai engine & section yang sama (`theme-spec.md`) — beda token + varian layout saja.

## Cetak biru katalog 30 tema (dibangun bertahap, sesuai permintaan nyata)

Tema = konfigurasi, jadi biaya marginal tema baru rendah. Urutan rilis mengikuti data lead, bukan selera kita. Nama satu kata Bahasa Indonesia = identitas produk.

### Kuliner (12)
| # | Tema | Segmen | Rasa desain |
|---|---|---|---|
| 1 | `hangat` | Warung/RM keluarga | Earth tone, serif hangat — **Fase 1** |
| 2 | `arang` | Grill/dining/kopi premium | Dark moody, emas — **Fase 1** |
| 3 | `ceria` | Kedai kekinian, dessert | Cerah playful, warna berani — **Fase 1** |
| 4 | `kopi` | Coffee shop minimal | Monokrom krem-espresso, grid rapi |
| 5 | `senja` | Cafe rooftop/outdoor | Gradasi sunset, foto suasana |
| 6 | `padi` | Masakan Padang/tradisional | Hijau-emas, ornamen halus |
| 7 | `laut` | Seafood | Biru laut + putih, segar |
| 8 | `manis` | Bakery/kue/dessert box | Pastel lembut, bulat-bulat |
| 9 | `sambal` | Ayam geprek/pedas | Merah berani, tipografi tebal |
| 10 | `kebun` | Healthy/salad/jus | Hijau daun, natural, ringan |
| 11 | `malam` | Angkringan/street food | Gelap + neon, urban |
| 12 | `klasik` | Toko roti/kuliner legendaris | Serif heritage, sepia |

### Bengkel & otomotif (4)
| 13 | `baja` | Bengkel umum | Industrial abu-baja, tegas |
| 14 | `oli` | Ganti oli/servis cepat | Oranye-hitam, energik |
| 15 | `kilat` | Modifikasi/racing | Sporty, garis miring, merah |
| 16 | `presisi` | Bengkel spesialis/AC mobil | Bersih teknis, biru dingin |

### Klinik & kesehatan (4)
| 17 | `sehat` | Klinik umum | Biru-putih bersih, tepercaya |
| 18 | `tenang` | Fisioterapi/akupunktur | Sage kalem, banyak napas |
| 19 | `senyum` | Klinik gigi | Putih + aqua ramah |
| 20 | `bunda` | Bidan/mom & baby | Peach lembut, membulat |

### Laundry & jasa harian (3)
| 21 | `bersih` | Laundry kiloan | Biru segar, ikonografi jelas |
| 22 | `wangi` | Laundry premium/sepatu | Ungu muda, elegan ringan |
| 23 | `kilau` | Cuci mobil/motor | Kuning-biru enerjik |

### Toko & retail (4)
| 24 | `etalase` | Toko kelontong/frozen food | Grid produk, harga menonjol |
| 25 | `butik` | Fashion/hijab | Editorial, serif tipis, netral |
| 26 | `kriya` | Kerajinan/oleh-oleh | Earthy artisan, tekstur kertas |
| 27 | `segar` | Sayur/buah/daging | Hijau pasar, badge harga |

### Jasa profesional (3)
| 28 | `amanah` | Jasa keuangan/agen properti | Navy tepercaya, korporat ringan |
| 29 | `juru` | Tukang/renovasi/servis rumah | Kuning konstruksi, tegas |
| 30 | `pesta` | Catering/dekor/event | Festive elegan, foto galeri besar |

## Aturan main katalog

- Rilis tema baru **hanya** karena permintaan nyata (lead/klien), bukan karena seru.
- Tema baru wajib lolos checklist `theme-spec.md` penuh (Lighthouse ≥ 90 dll).
- Token dan varian layout baru masuk engine dulu, tema tinggal memakai — duplikasi kode antar tema = bug.
- Nama tema tidak mengandung nama vertikal (tema `kopi` boleh dipakai toko teh — segmen itu panduan, bukan pagar).

## Sumber

- https://www.framer.com/blog/restaurant-website-design-examples/
- https://www.sitebuilderreport.com/inspiration/restaurant-websites
- https://www.mobal.io/blog-posts/restaurant-website-design-trends-for-2026-the-future-of-digital-dining
- https://www.nuxa.ai/blog/restaurant-website-design-2026
- https://chowly.com/resources/blogs/restaurant-website-design-7-elements-of-a-high-converting-restaurant-website/
- https://www.awwwards.com/websites/hotel-restaurant/
- https://www.jagoanhosting.com/blog/contoh-website-coffee-shop/
- https://www.hostinger.com/id/tutorial/contoh-website-umkm-dan-bisnis-kecil
- https://www.figma.com/resource-library/web-design-trends/
- https://www.loungelizard.com/blog/web-design-color-trends/
