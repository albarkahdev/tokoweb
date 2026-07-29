import { Hono } from "hono";
import { matchCachedPage, putCachedPage } from "@/db/edge-cache";
import type { AppEnv } from "@/env";
import {
  CtaBand,
  FaqList,
  FeatureGrid,
  Hero,
  LandingFooter,
  LandingSection,
  LandingShell,
  MetricBand,
  PriceCard,
  PricingGrid,
  SectionHeader,
  StepList,
  ThemeStrip,
  TopBar,
} from "@/ui/landing";

const TITLE = "tokoweb.id — Website untuk Warung & UMKM, Jadi ≤ 1 Hari, Mulai Rp 75rb/bulan";
const DESCRIPTION =
  "Jasa pembuatan website UMKM kuliner: menu online, promo otomatis, tombol WhatsApp, statistik pengunjung. Jadi dalam sehari, kelola sendiri dari HP, mulai Rp 75rb/bulan.";

function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function landingJsonLd(baseDomain: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "tokoweb.id",
    url: `https://${baseDomain}`,
    description:
      "Jasa pembuatan website untuk UMKM kuliner Indonesia. Jadi dalam sehari, mulai Rp 75.000/bulan, kelola sendiri dari HP.",
  });
}

export const landing = new Hono<AppEnv>()
  .get("/", async (c) => {
    const url = new URL(c.req.url);
    const cached = await matchCachedPage(url.hostname, "/landing-v6");
    if (cached) return cached;

    const demoUrl = `https://demo.${c.env.BASE_DOMAIN}/kuliner`;
    const wa = c.env.CONTACT_WA_NUMBER
      ? waLink(c.env.CONTACT_WA_NUMBER, "Halo tokoweb, saya mau tanya website untuk usaha saya.")
      : demoUrl;
    const ctaLabel = c.env.CONTACT_WA_NUMBER ? "Chat WhatsApp" : "Lihat Demo";

    const html = `<!doctype html>${String(
      <LandingShell
        title={TITLE}
        description={DESCRIPTION}
        canonical={`https://${c.env.BASE_DOMAIN}/`}
        jsonLd={landingJsonLd(c.env.BASE_DOMAIN)}
      >
        <TopBar
          ctaHref={wa}
          ctaLabel={ctaLabel}
          links={[
            { href: "#fitur", label: "Fitur" },
            { href: "#tema", label: "Tema" },
            { href: "#harga", label: "Harga" },
            { href: "/mitra", label: "Jadi Mitra" },
            { href: `https://app.${c.env.BASE_DOMAIN}/masuk`, label: "Masuk" },
          ]}
        />
        <Hero
          eyebrow="🍜 Untuk warung, kedai & resto"
          headline={
            <>
              Websitemu jadi <span class="accent">≤ 1 hari.</span>
              <br />
              Pembeli tinggal klik WA.
            </>
          }
          lede={
            <>
              Pembeli sekarang cari makan lewat Google dan link Instagram. Website profesional tidak
              lagi mahal — <strong>mulai Rp 75 ribu/bulan</strong>, semua kami urus, kamu tinggal
              jualan.
            </>
          }
          primary={{
            href: wa,
            label: c.env.CONTACT_WA_NUMBER ? "Chat Kami Sekarang" : "Coba Demo Langsung",
          }}
          secondary={{ href: demoUrl, label: "Lihat Contoh Website →" }}
          trust={["Refund 7 hari", "Tanpa kontrak", "Datamu tetap milikmu"]}
          mock={{
            name: "Bakmi Lampion Jaya",
            tagline: "Resep bakmi pecinan sejak 1975",
            items: [
              { name: "Bakmi Ayam Jamur", price: "Rp 18.000" },
              { name: "Dimsum Mentai (4 pcs)", price: "Rp 15.000" },
              { name: "Es Liang Teh", price: "Rp 8.000" },
            ],
            promo: "Diskon 20% Menu Andalan — minggu ini",
          }}
          chipA="Buka < 1 detik"
          chipB="12 klik WA minggu ini"
        />
        <MetricBand
          metrics={[
            { num: "≤ 1 hari", cap: "janji maksimal — bisa cuma hitungan jam" },
            { num: "100/100", cap: "skor kecepatan Google PageSpeed" },
            { num: "< 1 dtk", cap: "terbuka bahkan di sinyal jelek" },
            { num: "Rp 75rb", cap: "per bulan, tanpa biaya tersembunyi" },
          ]}
        />
        <LandingSection id="fitur">
          <SectionHeader
            kicker="Kenapa perlu"
            title="Website yang benar-benar kerja untukmu"
            sub="Bukan sekadar pajangan — tiap bagian dirancang supaya pengunjung jadi pembeli."
          />
          <FeatureGrid
            features={[
              {
                icon: "search",
                title: "Ditemukan di Google",
                body: 'Orang ketik "ayam bakar dekat sini" — menu, jam buka, dan lokasimu langsung terbaca Google.',
              },
              {
                icon: "chat",
                title: "Satu ketuk langsung chat WA",
                body: 'Setiap menu punya tombol "Tanya via WA" yang sudah menyebut nama menunya. Pembeli tidak perlu mikir.',
              },
              {
                icon: "chart",
                title: "Kamu tahu hasilnya",
                body: "Laporan bulanan: berapa yang berkunjung, berapa yang klik WhatsApp. Kelihatan kerjanya, bukan katanya.",
              },
              {
                icon: "bolt",
                title: "Ngebut di sinyal jelek",
                body: "Terbuka di bawah 1 detik bahkan di 4G pas-pasan. Pembeli tidak sempat kabur.",
              },
              {
                icon: "phone",
                title: "Update sendiri dari HP",
                body: "Ganti harga, pasang promo, upload foto — semudah pakai WhatsApp. Promo hilang otomatis saat masanya habis.",
              },
              {
                icon: "palette",
                title: "Ganti tampilan sekali klik",
                body: "60 tema desain premium. Ganti kapan pun, data dan fotomu tidak berubah.",
              },
            ]}
          />
        </LandingSection>
        <LandingSection id="tema">
          <SectionHeader
            kicker="Pilih gayamu"
            title="60 tema premium, satu klik ganti"
            sub="Tiga contoh di bawah — klik untuk demo hidup, lalu jelajahi semua 60 tema dengan nama usahamu."
          />
          <ThemeStrip
            themes={[
              {
                slug: "hangat",
                name: "Hangat",
                character: "Earth tone membumi — untuk warung & rumah makan keluarga.",
                gradient: "linear-gradient(135deg, #FFFBF5 0%, #E8A03C 60%, #C4501B 100%)",
                textColor: "#3B2413",
                demoUrl: `${demoUrl}?tema=hangat`,
              },
              {
                slug: "arang",
                name: "Arang",
                character: "Gelap elegan berlapis emas — untuk grill, kopi, dining malam.",
                gradient: "linear-gradient(135deg, #1A1815 0%, #242019 55%, #C9A227 130%)",
                textColor: "#EDE6DA",
                demoUrl: `${demoUrl}?tema=arang`,
              },
              {
                slug: "ceria",
                name: "Ceria",
                character: "Cerah playful — untuk kedai kekinian, dessert & minuman.",
                gradient: "linear-gradient(135deg, #FFFDF7 0%, #4ECDC4 55%, #FF6B57 115%)",
                textColor: "#27221C",
                demoUrl: `${demoUrl}?tema=ceria`,
              },
            ]}
          />
        </LandingSection>
        <LandingSection>
          <SectionHeader kicker="Caranya" title="Tiga langkah, tidak pakai ribet" />
          <StepList
            steps={[
              {
                title: "Chat kami",
                body: "Ceritakan usahamu. Kami tunjukkan demo hidup dengan nama usahamu langsung terpasang.",
              },
              {
                title: "Isi form dari HP — ± 10 menit",
                body: "Nama menu, harga, foto, jam buka. Tim kami yang merapikan sampai layak tayang.",
              },
              {
                title: "Tayang ≤ 1 hari",
                body: "Terima link website + akses kelola. Bayar lewat QRIS, langsung jalan.",
              },
            ]}
          />
        </LandingSection>
        <LandingSection id="harga">
          <SectionHeader
            kicker="Investasi"
            title="Harga jujur, tanpa biaya tersembunyi"
            sub="Setup sekali di awal, langganan bulanan bisa berhenti kapan saja. Refund 7 hari kalau tidak puas."
          />
          <PricingGrid>
            <PriceCard
              plan="Basic"
              amount="75rb"
              per="/bulan · setup sekali Rp 300rb"
              items={[
                "Website lengkap: menu, promo, galeri, testimoni",
                "Alamat namausahamu.tokoweb.id",
                "Kelola sendiri dari HP",
                "Statistik pengunjung & klik WA",
                "Laporan bulanan via WA",
              ]}
              cta={{ href: wa, label: "Pilih Basic" }}
            />
            <PriceCard
              plan="Pro"
              amount="200rb"
              per="/bulan · setup sekali Rp 1jt"
              items={[
                "Semua fitur Basic",
                "Domain sendiri (namausahamu.com)",
                "Konten ditulis penuh oleh tim kami",
                "Google Business Profile dioptimasi",
              ]}
              cta={{ href: wa, label: "Pilih Pro" }}
              featured
              tag="Paling lengkap"
            />
          </PricingGrid>
        </LandingSection>
        <LandingSection id="faq">
          <SectionHeader kicker="FAQ" title="Pertanyaan yang sering muncul" />
          <FaqList
            items={[
              {
                q: "Saya gaptek, bisa?",
                a: "Bisa. Kamu cuma isi form dari HP — sisanya kami kerjakan. Update harian (ganti harga, pasang promo) semudah pakai WhatsApp.",
              },
              {
                q: "Perlu beli domain atau hosting?",
                a: "Tidak. Paket Basic sudah termasuk alamat namausahamu.tokoweb.id. Mau domain sendiri (.com)? Ada di paket Pro.",
              },
              {
                q: "Kalau mau berhenti?",
                a: "Berhenti kapan saja tanpa penalti. 7 hari pertama tidak puas → uang setup kembali 100%. Konten dan fotomu tetap milikmu.",
              },
              {
                q: "Websitenya cepat tidak?",
                a: "Skor Google PageSpeed 100/100 di HP. Coba sendiri demonya dari sinyal paling jelek sekalipun.",
              },
            ]}
          />
        </LandingSection>
        <LandingSection>
          <CtaBand
            title="Websitemu bisa tayang hari ini."
            sub="Mulai dari demo — coba dengan nama usahamu sendiri, gratis, tanpa daftar."
            primary={{
              href: wa,
              label: c.env.CONTACT_WA_NUMBER ? "Chat Kami di WhatsApp" : "Buka Demo Sekarang",
            }}
            secondary={{ href: demoUrl, label: "Lihat Demo" }}
          />
        </LandingSection>
        <LandingFooter
          links={[
            { href: demoUrl, label: "Demo" },
            { href: "/mitra", label: "Jadi Mitra" },
            { href: `https://app.${c.env.BASE_DOMAIN}/masuk`, label: "Masuk CMS" },
          ]}
        />
      </LandingShell>,
    )}`;

    const response = new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=86400",
      },
    });
    c.executionCtx.waitUntil(putCachedPage(url.hostname, "/landing-v6", response.clone()));
    return response;
  })
  .get("/mitra", async (c) => {
    const url = new URL(c.req.url);
    const cached = await matchCachedPage(url.hostname, "/mitra-v1");
    if (cached) return cached;

    const wa = c.env.CONTACT_WA_NUMBER
      ? waLink(c.env.CONTACT_WA_NUMBER, "Halo tokoweb, saya mau daftar jadi mitra.")
      : `https://demo.${c.env.BASE_DOMAIN}/kuliner`;
    const ctaLabel = c.env.CONTACT_WA_NUMBER ? "Daftar via WhatsApp" : "Lihat Demo Dulu";

    const html = `<!doctype html>${String(
      <LandingShell
        title="Jadi Mitra tokoweb.id — Bawa Klien, Terima Komisi s/d Rp 300rb"
        description="Program mitra tokoweb.id: rekomendasikan website ke pemilik warung, terima komisi per klien yang membayar. Tanpa modal, bukan MLM, komisi cair ≤ 1 hari."
        canonical={`https://${c.env.BASE_DOMAIN}/mitra`}
        jsonLd={landingJsonLd(c.env.BASE_DOMAIN)}
      >
        <TopBar
          ctaHref={wa}
          ctaLabel={ctaLabel}
          links={[
            { href: "/", label: "Beranda" },
            { href: `https://app.${c.env.BASE_DOMAIN}/masuk`, label: "Masuk" },
          ]}
        />
        <LandingSection>
          <SectionHeader
            kicker="Program Mitra"
            title="Kenal pemilik warung? Itu komisi."
            sub="Siapa pun bisa jadi mitra — ojol, sales, mahasiswa, pemilik warung yang punya kenalan. Rekomendasikan website tokoweb, klien bayar, kamu terima komisi. Tanpa modal, bukan MLM."
          />
        </LandingSection>
        <MetricBand
          metrics={[
            { num: "Rp 150rb", cap: "komisi per klien Basic (3 cicilan bulanan)" },
            { num: "Rp 300rb", cap: "komisi per klien Pro (3 cicilan bulanan)" },
            { num: "≤ 1 hari", cap: "cicilan pertama cair setelah klien bayar" },
            { num: "Rp 0", cap: "modal — cukup brosur QR dari kami" },
          ]}
        />
        <LandingSection>
          <SectionHeader kicker="Caranya" title="Tiga langkah jadi mitra" />
          <StepList
            steps={[
              {
                title: "Daftar — gratis",
                body: "Chat kami. Kamu langsung dapat kode unik + brosur QR atas namamu.",
              },
              {
                title: "Tunjukkan demo ke pemilik warung",
                body: "Scan QR-mu → demo hidup dengan nama usaha mereka. Websitenya kelihatan nyata, closing jauh lebih gampang.",
              },
              {
                title: "Klien bayar, komisi masuk",
                body: "Komisi dicicil 3 bulan mengikuti pembayaran klien. Pantau transparan di halaman komisimu sendiri — cukup kode + PIN, tanpa aplikasi.",
              },
            ]}
          />
        </LandingSection>
        <LandingSection id="faq">
          <SectionHeader kicker="FAQ" title="Yang sering ditanya mitra" />
          <FaqList
            items={[
              {
                q: "Siapa saja bisa ikut?",
                a: "Siapa pun yang kenal pemilik usaha kuliner: ojol, kurir, sales, mahasiswa, ibu rumah tangga. Tidak ada syarat, tidak ada target.",
              },
              {
                q: "Ini MLM?",
                a: "Bukan. Satu tingkat saja: kamu bawa klien, kamu dapat komisi. Tidak ada rekrut-merekrut, tidak ada beli paket.",
              },
              {
                q: "Kapan komisi cair?",
                a: "Cicilan pertama cair ≤ 1 hari setelah klien bayar biaya setup. Cicilan 2 dan 3 mengikuti pembayaran langganan bulan ke-2 dan ke-3.",
              },
              {
                q: "Cek komisi di mana?",
                a: "Halaman khususmu: tokoweb.id/r/KODEKAMU + PIN 4 digit. Berapa scan, berapa closing, berapa cair — semua transparan.",
              },
            ]}
          />
        </LandingSection>
        <LandingSection>
          <CtaBand
            title="Mulai hari ini, modal nol."
            sub="Chat kami — kode unik + brosur QR-mu jadi dalam hitungan menit."
            primary={{ href: wa, label: ctaLabel }}
          />
        </LandingSection>
        <LandingFooter links={[{ href: "/", label: "Beranda" }]} />
      </LandingShell>,
    )}`;

    const response = new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=86400",
      },
    });
    c.executionCtx.waitUntil(putCachedPage(url.hostname, "/mitra-v1", response.clone()));
    return response;
  })
  .get("/robots.txt", (c) =>
    c.text(`User-agent: *\nAllow: /\nSitemap: https://${c.env.BASE_DOMAIN}/sitemap.xml\n`, 200, {
      "cache-control": "public, max-age=86400",
    }),
  )
  .get("/sitemap.xml", (c) =>
    c.text(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${c.env.BASE_DOMAIN}/</loc></url><url><loc>https://${c.env.BASE_DOMAIN}/mitra</loc></url></urlset>\n`,
      200,
      { "content-type": "application/xml", "cache-control": "public, max-age=86400" },
    ),
  );
