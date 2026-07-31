export type GuideSection = { title: string; body: string };
export type Guide = { title: string; intro: string; sections: GuideSection[] };

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "step"; text: string }
  | { type: "li"; text: string };

export function parseGuideBody(body: string): GuideBlock[] {
  const blocks: GuideBlock[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\d+\.\s/.test(line)) blocks.push({ type: "step", text: line.replace(/^\d+\.\s/, "") });
    else if (line.startsWith("- ")) blocks.push({ type: "li", text: line.slice(2).trim() });
    else blocks.push({ type: "p", text: line });
  }
  return blocks;
}

export const GUIDE_OWNER: Guide = {
  title: "Panduan Pemilik Usaha",
  intro:
    "Semua yang kamu butuh untuk mengelola websitemu sendiri dari HP. Ikuti bagian yang kamu perlukan — tidak harus urut.",
  sections: [
    {
      title: "Masuk & keluar",
      body: `1. Buka alamat CMS yang kami kirim (app.tokoweb.id/masuk).
2. Isi email dan password, tekan Masuk.
3. Selesai kelola? Tekan Keluar di menu supaya akun aman, apalagi kalau pakai HP orang lain.
Lupa password? Buka halaman Masuk, tekan "Lupa password?", masukkan nomor WhatsApp yang kamu pakai saat daftar. Kalau terdaftar, muncul tombol minta reset lewat WhatsApp — kami kirim link buat bikin password baru.`,
    },
    {
      title: "Edit Menu",
      body: `Ini bagian paling penting — daftar makanan/minuman yang tampil di websitemu.
- Tambah item: isi kategori (mis. Makanan), nama, harga, lalu simpan.
- Foto: upload foto tiap menu (otomatis dikompres). Foto yang menggugah bikin pembeli lapar.
- Tandai "favorit" untuk menu andalan supaya tampil menonjol.
- Menu habis? Nonaktifkan item — dia tetap tersimpan tapi tidak tampil ke pembeli.
Tips: harga wajib jelas. Pembeli malas bertanya satu-satu.`,
    },
    {
      title: "Pasang Promo",
      body: `Promo tampil di banner berjalan paling atas dan halaman Promo.
1. Isi judul promo, keterangan, tanggal mulai dan tanggal selesai.
2. Simpan. Promo muncul otomatis di rentang tanggal itu.
3. Lewat tanggal selesai, promo hilang sendiri — tidak perlu dihapus manual.`,
    },
    {
      title: "Upload Foto Galeri",
      body: `Galeri = foto suasana tempat dan makanan yang memperkuat kepercayaan.
- Upload beberapa foto terbaik, beri keterangan singkat.
- Foto otomatis dikompres supaya website tetap cepat.`,
    },
    {
      title: "Info Usaha, Jam, Logo",
      body: `Di menu Info kamu atur identitas usaha:
- Nama usaha, tagline, tentang, alamat, link Google Maps, nomor WhatsApp, Instagram.
- Logo: upload logo (bentuk persegi paling bagus). Tampil di header website. Kosong = pakai nama.
- Jam buka: atur per hari. Website otomatis menampilkan "Buka sekarang" atau "Tutup".
- Pengumuman: teks singkat 1 baris (mis. "Libur Idul Fitri"). Centang "Tampilkan" supaya muncul di banner atas; pengunjung bisa menutupnya.
- Tutup sementara: nyalakan kalau mendadak tidak buka (sakit, libur). Website menampilkan "Tutup sementara" walau jadwalnya buka. Matikan lagi saat sudah buka.`,
    },
    {
      title: "Kepercayaan (rating & sertifikat)",
      body: `Opsional, tapi menaikkan keyakinan pembeli. Muncul hanya kalau diisi.
- Rating Google: ketik angka sendiri (mis. 4.8) + link Google Maps-mu.
- Halal: centang kalau bersertifikat.
- Sertifikat lain: tulis satu per baris (mis. Higienis, PIRT).`,
    },
    {
      title: "Ganti Tema",
      body: `Tema = tampilan/gaya website. Ganti kapan saja tanpa mengubah datamu.
1. Buka menu Ganti Tema.
2. Lihat pratinjau, pilih yang cocok dengan karakter usahamu.
3. Simpan. Menu, foto, dan promomu tetap — hanya tampilannya yang berubah.`,
    },
    {
      title: "Statistik",
      body: `Lihat berapa orang membuka websitemu dan menekan tombol WhatsApp/telepon/Maps.
Kalau Pesan Online aktif, ada juga ringkasan pesanan 30 hari: berapa masuk, berapa selesai,
berapa dibatalkan, menu terlaris, dan jam paling ramai. Pakai ini untuk atur stok & jam sibuk.
Statistik tidak menampilkan nominal uang — hanya jumlah dan tren.`,
    },
    {
      title: "Terima Pesanan Online",
      body: `Kalau fitur Pesan Online kamu aktifkan (menu Pesanan → Setelan):
- Atur metode bayar (QRIS/transfer/e-wallet), pajak/biaya bila ada, dan jumlah meja untuk QR makan di tempat.
- Pesanan masuk muncul di menu Pesanan dengan tanda + suara. Konfirmasi → proses → tandai siap → selesai.
- Pembeli tidak perlu login. Bukti bayar (bila diunggah) tampil di detail pesanan.
- Kalau menu habis/tak sanggup, batalkan pesanan dengan memilih alasan (mis. "Menu/stok habis"). Alasan itu tampil ke pembeli di halaman status. Pembeli baru bisa bayar setelah kamu konfirmasi, jadi kalau dibatalkan sebelum itu, dia tidak keburu bayar.
- Tombol "Pesan Online" & "Pesan" di websitemu menggantikan "Tanya via WA" saat fitur ini aktif.`,
    },
    {
      title: "Langganan, Invoice & Bayar",
      body: `Di menu Langganan kamu lihat status langganan dan riwayat pembayaran.
- Tekan "Bayar Sekarang" → halaman Bayar menampilkan total tagihan + rekening TokoWeb.
- Transfer sesuai nominal, lalu upload bukti transfer (foto/tangkapan layar). Kami cek dan tandai lunas.
- Tekan "Invoice" pada tiap pembayaran untuk membuka versi cetak / simpan PDF.
Kalau tagihan jatuh tempo, segera bayar agar website tidak dinonaktifkan.`,
    },
    {
      title: "Bagikan & muncul di Google",
      body: `- Bagikan website: di Beranda ada QR — tunjukkan di kasir/meja/brosur, pelanggan scan langsung buka websitemu. Screenshot untuk dicetak.
- Google: website baru butuh 1–4 minggu untuk mulai muncul di pencarian Google. Wajar kalau di awal belum muncul. Isi menu selengkap mungkin dan sebarkan linknya untuk mempercepat.`,
    },
  ],
};

export const GUIDE_MITRA: Guide = {
  title: "Panduan Mitra",
  intro:
    "Kamu bawa klien, kamu dapat komisi — tanpa gaji, tanpa rekrut-merekrut. Begini cara kerjanya.",
  sections: [
    {
      title: "Cara kerja singkat",
      body: `1. Sebarkan brosur QR unikmu ke pemilik warung/kedai.
2. Mereka scan → lihat demo website hidup.
3. Tertarik? Mereka isi form "Saya mau" di halaman demo.
4. Tim kami menghubungi & meng-closing. Begitu jadi klien, komisimu otomatis tercatat.`,
    },
    {
      title: "Nilai jual ke calon klien",
      body: `Yang bikin mereka tertarik:
- Website jadi cepat, mulai Rp75rb/bulan — jauh lebih murah dari bikin sendiri.
- Bisa terima Pesan Online langsung dari website (makan di tempat via QR meja / ambil sendiri), bukan cuma etalase.
- Muncul rapi di HP pelanggan, ada tombol WhatsApp & lokasi Maps.
- Bonus: klien yang daftar lewat kamu dapat diskon 30% biaya setup. Ini alasan kuat untuk closing saat itu juga.`,
    },
    {
      title: "Brosur & QR unikmu",
      body: `- Tiap mitra punya kode unik. QR di brosurmu sudah berisi kode itu.
- Penting: calon klien harus membuka demo lewat QR/link-mu, lalu isi form di HP yang sama. Kalau mereka buka di HP berbeda atau menghapus data browser sebelum isi form, komisi bisa lepas.
- Ajak mereka isi form saat itu juga selagi tertarik.`,
    },
    {
      title: "Pantau komisi",
      body: `Buka halaman komisimu (tokoweb.id/r/KODEKAMU), masukkan PIN.
Di situ kamu lihat: jumlah scan brosur, klien yang sudah closing, dan total komisi diterima.`,
    },
    {
      title: "Kapan komisi cair",
      body: `Tiap klien = 3 cicilan komisi:
- Cicilan 1: cair setelah klien bayar biaya setup.
- Cicilan 2: setelah klien bayar bulan ke-2.
- Cicilan 3: setelah klien bayar bulan ke-3.
Status tiap cicilan tampil di halaman komisimu. "Dibayar" = sudah masuk ke kamu.`,
    },
    {
      title: "Aturan main",
      body: `- Satu tingkat saja: kamu bawa klien, kamu dapat komisi. Tidak ada beli paket, tidak ada rekrut bawahan.
- Dilarang mendaftar usahamu sendiri sebagai klien untuk cari komisi (self-referral) — otomatis ditolak.
- Jaga PIN-mu rahasia. Kalau lupa PIN atau kode, hubungi kami via WhatsApp.`,
    },
  ],
};

export const GUIDE_ADMIN: Guide = {
  title: "Panduan Admin",
  intro: "Operasional platform dari A sampai Z: klien, pembayaran, mitra, dan langganan.",
  sections: [
    {
      title: "Alur onboarding klien",
      body: `1. Buat tenant: menu Tenant → isi nama + subdomain (slug) + paket → status draft. Hindari slug kata sistem (app, api, blog, dst) — sistem menolak otomatis. Cek ketersediaan lewat endpoint slug-check bila perlu.
2. Kirim link intake ke klien (via WhatsApp). Klien mengisi info usaha, WA (wajib), email (wajib), menu, foto.
3. Proses intake → rapikan konten.
4. Kirim link atur password ke email klien (tombol di halaman tenant). Nomor WA klien otomatis tersimpan di akun untuk keperluan reset.
5. Go Live setelah konten siap dan biaya setup lunas → status active, website tayang.`,
    },
    {
      title: "Verifikasi pembayaran (transfer)",
      body: `Pembayaran manual — admin sumber kebenaran status.
1. Klien transfer lalu upload bukti di CMS (menu Bayar). Buktinya muncul di halaman tenant sebagai "Bukti Bayar dari Klien".
2. Cek mutasi rekening. Cocok → form "Tandai Lunas" sudah ter-prefill periode & nominal → catat (setup atau bulanan). Tidak cocok → "Tolak Bukti", klien diminta upload ulang.
3. Setup untuk klien referral (ada mitra) dapat diskon 30% — nominal rekomendasi tampil di kartu verifikasi. Diskon ditanggung owner; komisi mitra tetap penuh.
4. Sistem otomatis: update jatuh tempo, reaktivasi bila sempat suspended, dan membuka cicilan komisi mitra terkait.`,
    },
    {
      title: "Statistik & pemantauan",
      body: `- Beranda admin: ringkasan platform — tenant aktif, lead baru, intake, payout siap cair, dan volume pesanan 30 hari lintas tenant (jumlah saja, tanpa nominal).
- Halaman tiap tenant: kartu "Statistik Toko" (pesanan masuk/selesai/batal + menu terlaris) untuk pantau kesehatan toko.`,
    },
    {
      title: "Closing lead → komisi mitra",
      body: `1. Menu Lead → pilih lead yang siap closing → isi slug + paket → Closing.
2. Sistem membuat tenant dari lead, dan bila lead punya mitra (referrer), otomatis membuat penautan mitra↔tenant + 3 cicilan komisi.
3. Self-referral (WA lead sama dengan WA mitra) otomatis ditolak.
Catatan: lead tanpa referrer tetap bisa closing, tapi tanpa komisi.`,
    },
    {
      title: "Kelola mitra & payout",
      body: `- Mitra mendaftar sendiri (pending) → verifikasi → set active.
- Komisi cair bertahap mengikuti pembayaran klien (setup, bulan-2, bulan-3).
- Tandai cicilan sebagai "paid" setelah kamu transfer ke rekening mitra.`,
    },
    {
      title: "Leads",
      body: `Daftar prospek dari form demo. Yang membawa kode mitra sudah tertaut ke mitranya. Hubungi, kualifikasi, lalu closing bila cocok.`,
    },
    {
      title: "Siklus langganan",
      body: `Otomatis via cron, aksi manual via admin:
- Jatuh tempo lewat → grace (masa tenggang), website masih tayang.
- Grace habis → suspended, website dinonaktifkan (CMS jadi mode baca).
- Bayar → aktif kembali otomatis saat pembayaran dicatat.
- Lama tidak aktif → arsip.`,
    },
    {
      title: "Reset password klien",
      body: `Klien meminta reset lewat halaman "Lupa password?" (mereka masukkan nomor WA). Kamu menerima pesan WA "[RESET PASSWORD]" berisi nomornya. Verifikasi orangnya, lalu kirim link atur password dari halaman tenant klien tersebut.`,
    },
  ],
};
