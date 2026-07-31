export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string;
  readMinutes: number;
  body: string;
};

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "li"; text: string };

export function parseBlogBody(body: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) blocks.push({ type: "h2", text: line.slice(3).trim() });
    else if (line.startsWith("- ")) blocks.push({ type: "li", text: line.slice(2).trim() });
    else blocks.push({ type: "p", text: line });
  }
  return blocks;
}

export function findArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

export function blogSlugs(): string[] {
  return BLOG_ARTICLES.map((article) => article.slug);
}

const CTA =
  "Mau punya website warung seperti contoh di atas — menu online, promo, tombol WhatsApp, jadi kurang dari sehari mulai Rp 75rb/bulan? Lihat contohnya dan gabung di tokoweb.id.";

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "cara-bikin-website-warung-makan",
    title: "Cara Bikin Website Warung Makan Sendiri (Panduan Lengkap)",
    description:
      "Langkah praktis membuat website warung makan: menu online, jam buka, tombol WhatsApp, sampai muncul di Google. Tanpa ribet, tanpa jago teknologi.",
    keywords: ["cara bikin website warung makan", "website warung", "website umkm kuliner"],
    date: "2026-07-31",
    readMinutes: 5,
    body: `Punya warung ramai di dunia nyata belum tentu ketemu di dunia maya. Padahal makin banyak orang cari makan lewat HP dulu sebelum datang. Website warung makan membuat usahamu gampang ditemukan, terlihat rapi, dan pembeli bisa lihat menu kapan saja.

## Kenapa warung butuh website, bukan cuma media sosial
Media sosial bagus untuk update harian, tapi susah dipakai orang yang buru-buru cari "warung nasi dekat sini". Postingan cepat tenggelam, menu susah dicari, dan kamu numpang di rumah orang lain. Website adalah alamat resmi usahamu yang bisa muncul di Google, punya menu tetap, dan bikin usaha terlihat lebih profesional.

## Apa saja yang wajib ada di website warung
- Nama usaha, tagline singkat, dan foto yang menggugah selera
- Daftar menu lengkap dengan harga yang jelas
- Jam buka dan status buka/tutup hari ini
- Alamat plus tombol langsung ke Google Maps
- Tombol WhatsApp supaya pembeli bisa langsung pesan
- Promo yang sedang berjalan

## Langkah membuatnya
Pertama, kumpulkan bahan: nama usaha, daftar menu dan harga, alamat, jam buka, nomor WhatsApp, dan beberapa foto terbaik. Kedua, pilih tampilan yang cocok dengan karakter warungmu. Ketiga, isi data dan tayangkan. Kalau pakai layanan siap pakai, tiga langkah ini bisa selesai dalam hitungan menit karena kamu tinggal mengisi, bukan membangun dari nol.

## Supaya website tidak sia-sia
Website yang cepat, rapi di HP, dan berisi menu yang selalu update jauh lebih berharga daripada tampilan mewah yang lambat. Pastikan halaman terbuka di bawah satu detik, gambar tidak berat, dan informasi penting terlihat tanpa harus menggulir jauh.

${CTA}`,
  },
  {
    slug: "jualan-makanan-online-tanpa-aplikasi-ojol",
    title: "Jualan Makanan Online Tanpa Aplikasi Ojol",
    description:
      "Aplikasi ojol memotong komisi besar. Ini cara jualan makanan online langsung ke pembeli lewat website dan WhatsApp, untung lebih utuh.",
    keywords: ["jualan makanan online", "tanpa aplikasi ojol", "jualan makanan wa"],
    date: "2026-07-31",
    readMinutes: 4,
    body: `Aplikasi pesan-antar memang membawa pembeli, tapi komisinya bisa memakan 20 sampai 30 persen dari setiap pesanan. Untuk warung kecil, itu selisih yang besar. Kabar baiknya, kamu bisa menerima pesanan langsung tanpa perantara.

## Masalah bergantung penuh pada ojol
- Komisi besar memangkas keuntungan
- Kamu tidak punya data pelanggan sendiri
- Harga jadi lebih mahal di aplikasi, pembeli kabur
- Kalah bersaing dengan ribuan warung lain di layar yang sama

## Alurnya kalau jualan langsung
Pembeli membuka website warungmu, melihat menu, lalu menekan tombol WhatsApp. Pesanan masuk langsung ke HP-mu lengkap dengan rincian. Pembayaran pakai QRIS atau transfer. Tidak ada potongan, dan nomor pelanggan tersimpan untuk promo berikutnya.

## Cara mulai
Yang kamu butuhkan cuma dua: tempat memajang menu yang rapi (website) dan saluran pesan (WhatsApp). Sebarkan link website lewat status WA, stiker di kemasan, dan brosur. Pelan-pelan pelanggan terbiasa memesan langsung, dan kamu tetap bisa memakai ojol sebagai tambahan, bukan satu-satunya jalan.

## Tetap manfaatkan ojol dengan bijak
Pakai ojol untuk menjangkau pembeli baru, lalu ajak mereka pesan langsung di pesanan berikutnya dengan menyelipkan kartu kecil berisi link website dan bonus. Untungmu naik tanpa kehilangan jangkauan.

${CTA}`,
  },
  {
    slug: "tips-foto-makanan-pakai-hp",
    title: "10 Tips Foto Makanan Pakai HP biar Menu Terlihat Menggugah",
    description:
      "Foto makanan yang menggugah bikin pembeli lapar dan mau pesan. Ini 10 tips memotret menu cukup pakai HP, tanpa kamera mahal.",
    keywords: ["tips foto makanan", "foto makanan hp", "foto menu warung"],
    date: "2026-07-31",
    readMinutes: 4,
    body: `Foto adalah etalase pertama warungmu di internet. Foto yang tajam dan menggugah bisa menaikkan pesanan tanpa mengubah rasa masakan. Kabar baiknya, HP biasa sudah cukup.

## Cahaya adalah segalanya
- Potret dekat jendela pakai cahaya matahari, hindari lampu kuning
- Jangan pakai flash, hasilnya keras dan pucat
- Waktu terbaik pagi atau sore saat cahaya lembut

## Atur sudut dan komposisi
- Sudut 45 derajat cocok untuk kebanyakan hidangan
- Foto dari atas pas untuk menu berkuah atau banyak lauk
- Isi bingkai dengan makanan, kurangi ruang kosong
- Bersihkan piring dan meja dari remah dan noda

## Sentuhan akhir
- Tambah uap, tetesan saus, atau taburan agar terlihat segar
- Edit seperlunya: naikkan sedikit terang dan ketajaman, jangan berlebihan
- Pakai latar polos supaya makanan jadi bintang utama

Konsisten memotret dengan gaya yang sama membuat menu di website terlihat rapi dan profesional. Pembeli menilai rasa dari mata lebih dulu.

${CTA}`,
  },
  {
    slug: "website-vs-instagram-untuk-umkm",
    title: "Website vs Instagram untuk Jualan Makanan: Mana yang Perlu?",
    description:
      "Instagram untuk membangun kedekatan, website untuk ditemukan dan berjualan. Ini bedanya dan kenapa UMKM kuliner sebaiknya punya keduanya.",
    keywords: ["website vs instagram", "jualan makanan instagram", "website umkm"],
    date: "2026-07-31",
    readMinutes: 4,
    body: `Banyak pemilik warung bertanya: cukup Instagram saja atau perlu website? Jawabannya bukan salah satu, tapi memahami peran masing-masing.

## Kekuatan Instagram
Instagram unggul untuk membangun kedekatan: update harian, cerita di balik dapur, dan interaksi dengan pelanggan. Tapi Instagram punya kelemahan untuk berjualan: menu susah dicari, postingan cepat tenggelam, dan tidak muncul saat orang mencari di Google.

## Kekuatan website
Website adalah alamat tetap usahamu. Ia muncul di pencarian Google, menyimpan menu lengkap yang selalu bisa diakses, memuat jam buka dan lokasi, serta terlihat lebih profesional dan tepercaya. Website juga milikmu sepenuhnya, tidak tergantung aturan platform.

## Kesimpulan
- Instagram untuk menarik perhatian dan menjaga hubungan
- Website untuk ditemukan, dipercaya, dan menerima pesanan
- Idealnya: pasang link website di bio Instagram, arahkan pengikut ke sana untuk lihat menu dan pesan

Punya keduanya membuat usahamu tampil serius tanpa harus mengeluarkan biaya besar. Website tidak harus mahal atau rumit.

${CTA}`,
  },
  {
    slug: "cara-promosi-warung-makan-modal-kecil",
    title: "Cara Promosi Warung Makan dengan Modal Kecil",
    description:
      "Promosi warung tidak harus mahal. Ini cara promosi hemat lewat WhatsApp, Google Maps, promo terjadwal, dan word of mouth.",
    keywords: ["cara promosi warung makan", "promosi umkm murah", "strategi promosi kuliner"],
    date: "2026-07-31",
    readMinutes: 5,
    body: `Promosi efektif tidak selalu butuh iklan mahal. Dengan modal kecil dan konsisten, warung kecil bisa ramai.

## Manfaatkan yang gratis dulu
- Status WhatsApp: pamer menu dan promo ke kontak yang sudah kenal
- Google Maps: daftarkan warung supaya muncul saat orang cari makan terdekat
- Grup warga dan komunitas: tawarkan menu, bukan spam

## Buat promo yang punya alasan
Promo tanpa alasan terlihat murahan. Beri bingkai: promo pembukaan, paket keluarga, diskon jam sepi, atau gratis minum untuk pembelian tertentu. Promo terjadwal yang otomatis berhenti saat masanya habis membuatmu tidak lupa mencabutnya.

## Dorong pelanggan bercerita
- Minta ulasan jujur dari pelanggan yang puas
- Sediakan sudut foto menarik supaya mereka membagikan sendiri
- Beri bonus kecil untuk yang mengajak teman

## Ukur apa yang berhasil
Perhatikan promo mana yang paling banyak menarik pesanan lewat WhatsApp, lalu ulangi yang berhasil. Website dengan statistik sederhana membantumu tahu berapa orang melihat menu dan menekan tombol pesan.

Konsisten selama beberapa minggu biasanya lebih ampuh daripada satu kali promosi besar.

${CTA}`,
  },
  {
    slug: "qris-untuk-warung",
    title: "QRIS untuk Warung: Cara Daftar dan Manfaatnya",
    description:
      "QRIS bikin warung menerima pembayaran nontunai dari semua dompet digital dengan satu kode. Ini manfaat dan cara memakainya untuk usaha kecil.",
    keywords: ["qris untuk warung", "cara daftar qris", "pembayaran nontunai umkm"],
    date: "2026-07-31",
    readMinutes: 4,
    body: `Makin banyak pembeli tidak membawa uang tunai. QRIS memungkinkan warungmu menerima pembayaran dari semua aplikasi dompet digital lewat satu kode saja.

## Kenapa warung sebaiknya pakai QRIS
- Satu kode diterima semua dompet digital dan mobile banking
- Tidak perlu menyiapkan uang kembalian
- Transaksi tercatat, memudahkan pembukuan
- Pembeli merasa lebih praktis dan aman

## Cara memakainya sehari-hari
Cetak kode QRIS dalam ukuran jelas, pajang di kasir atau meja. Pembeli memindai, memasukkan nominal, lalu menunjukkan bukti bayar. Pastikan kode tidak buram supaya cepat terpindai.

## Tips supaya lancar
- Pajang kode di tempat yang terang dan mudah dijangkau
- Cek mutasi secara berkala agar tidak ada yang terlewat
- Tampilkan juga kode QRIS di website supaya pembeli online bisa membayar sebelum mengambil pesanan

Menggabungkan QRIS dengan website membuat alur pesan-bayar-ambil jadi mulus, bahkan untuk warung kecil sekalipun.

${CTA}`,
  },
  {
    slug: "cara-memilih-nama-usaha-kuliner",
    title: "Cara Memilih Nama Usaha Kuliner yang Mudah Diingat",
    description:
      "Nama usaha yang tepat bikin warung gampang diingat dan dicari. Ini prinsip memilih nama kuliner yang singkat, khas, dan mudah ditemukan online.",
    keywords: ["nama usaha kuliner", "cara memilih nama warung", "ide nama makanan"],
    date: "2026-07-31",
    readMinutes: 4,
    body: `Nama adalah kesan pertama. Nama yang bagus membuat warung mudah diingat, mudah diucapkan, dan mudah dicari di internet.

## Ciri nama yang kuat
- Singkat dan gampang diucapkan
- Menggambarkan makanan atau suasana
- Berbeda dari warung sebelah supaya tidak tertukar
- Enak dilihat saat ditulis di spanduk maupun link website

## Hindari jebakan umum
- Nama terlalu panjang atau susah dieja
- Meniru merek terkenal, berisiko dan tidak orisinal
- Nama yang sudah dipakai banyak orang sehingga sulit ditemukan

## Cek ketersediaan online
Sebelum memantapkan nama, cek apakah masih tersedia untuk alamat website dan akun media sosial. Nama yang konsisten di semua tempat membuat pelanggan tidak bingung. Alamat website pendek dan sesuai nama usaha jauh lebih mudah diingat dan dibagikan.

Setelah nama mantap, kunci pemakaiannya di semua saluran: spanduk, kemasan, media sosial, dan website.

${CTA}`,
  },
  {
    slug: "cara-meningkatkan-penjualan-warung-makan",
    title: "7 Cara Meningkatkan Penjualan Warung Makan",
    description:
      "Ingin warung lebih ramai? Ini tujuh cara meningkatkan penjualan warung makan, dari menu andalan sampai kehadiran online.",
    keywords: ["meningkatkan penjualan warung", "cara warung ramai", "tips penjualan kuliner"],
    date: "2026-07-31",
    readMinutes: 5,
    body: `Menaikkan penjualan tidak selalu soal menambah menu. Sering kali soal memperjelas apa yang sudah kamu punya dan memudahkan orang membeli.

## Tujuh cara yang terbukti
- Tonjolkan menu andalan supaya pembeli tidak bingung memilih
- Buat paket hemat yang menaikkan nilai setiap transaksi
- Foto menu dengan menggugah agar orang lapar sebelum datang
- Pasang harga yang jelas, hilangkan keraguan pembeli
- Sediakan pemesanan lewat WhatsApp yang cepat dan ramah
- Kumpulkan ulasan pelanggan puas sebagai bukti sosial
- Hadir online lewat website dan Google Maps agar mudah ditemukan

## Fokus pada yang paling berpengaruh
Dari tujuh cara di atas, kehadiran online dan kejelasan menu biasanya memberi dampak paling cepat. Ketika calon pembeli bisa melihat menu, harga, dan cara pesan dalam beberapa detik, mereka lebih mungkin jadi membeli.

## Jaga pelanggan lama
Pelanggan yang kembali lebih murah daripada mencari yang baru. Simpan nomor mereka, kabari saat ada menu atau promo baru, dan layani dengan konsisten.

${CTA}`,
  },
  {
    slug: "cara-daftar-warung-ke-google-maps",
    title: "Cara Daftar Warung ke Google Maps biar Mudah Ditemukan",
    description:
      "Mendaftarkan warung ke Google Maps bikin usahamu muncul saat orang mencari makan terdekat. Ini langkah dan tips melengkapinya.",
    keywords: ["daftar warung google maps", "google maps umkm", "warung muncul di google"],
    date: "2026-07-31",
    readMinutes: 4,
    body: `Saat orang lapar, mereka sering mengetik "makan dekat sini" di Google. Kalau warungmu terdaftar di Google Maps, kamulah yang muncul.

## Kenapa penting
- Muncul di pencarian lokal saat orang mencari makanan terdekat
- Menampilkan alamat, jam buka, foto, dan ulasan
- Gratis dan menambah kepercayaan calon pembeli

## Langkah mendaftar
Buat profil usaha di Google, isi nama, kategori, alamat, dan jam buka, lalu verifikasi lokasi sesuai petunjuk. Setelah aktif, lengkapi dengan foto dan tautan agar profil terlihat hidup.

## Lengkapi supaya maksimal
- Unggah foto menu dan suasana yang menarik
- Isi jam buka dengan benar, termasuk hari libur
- Tautkan alamat website supaya orang bisa lihat menu lengkap
- Balas ulasan dengan sopan, baik yang positif maupun negatif

Menggabungkan Google Maps dengan website membuat calon pembeli menemukanmu, lalu langsung melihat menu dan memesan. Keduanya saling menguatkan.

${CTA}`,
  },
  {
    slug: "kesalahan-umum-jualan-makanan-online",
    title: "5 Kesalahan Umum Jualan Makanan Online dan Cara Menghindarinya",
    description:
      "Banyak warung gagal maksimal berjualan online karena kesalahan yang sama. Ini lima kesalahan umum dan cara memperbaikinya.",
    keywords: ["kesalahan jualan online", "jualan makanan online", "tips kuliner online"],
    date: "2026-07-31",
    readMinutes: 4,
    body: `Berjualan online membuka peluang besar, tapi kesalahan kecil bisa membuat calon pembeli kabur. Berikut lima yang paling sering terjadi.

## 1. Foto seadanya
Foto gelap dan buram membuat makanan terlihat tidak menggugah. Perbaiki dengan memotret di cahaya alami dan latar bersih.

## 2. Harga tidak jelas
Pembeli malas bertanya harga satu per satu. Cantumkan harga di setiap menu supaya mereka langsung yakin.

## 3. Lambat membalas
Pesanan yang dibalas lama sering batal. Sediakan tombol WhatsApp dan usahakan merespons cepat, terutama di jam ramai.

## 4. Susah ditemukan
Kalau usahamu tidak muncul di Google atau tidak punya alamat website yang jelas, calon pembeli sulit menemukanmu. Hadir di website dan Google Maps mengatasi ini.

## 5. Informasi tidak update
Menu habis tapi masih dipajang, atau jam buka salah, membuat pembeli kecewa. Perbarui informasi secara rutin, tandai menu yang habis, dan cantumkan status buka atau tutup.

Menghindari lima hal ini saja sudah menempatkanmu di atas banyak pesaing yang lengah.

${CTA}`,
  },
];
