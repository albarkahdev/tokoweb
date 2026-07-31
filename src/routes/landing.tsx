import { Hono } from "hono";
import { matchCachedPage, putCachedPage } from "@/db/edge-cache";
import { createReferrer, findReferrerByCode, findReferrerByWa } from "@/db/referrers";
import { listTenants } from "@/db/tenants";
import { BLOG_ARTICLES, blogSlugs, findArticle, parseBlogBody } from "@/domain/blog";
import { formDataToValues } from "@/domain/cms";
import { hashOneTimeToken } from "@/domain/one-time-token";
import { createFixedWindowLimiter } from "@/domain/rate-limit";
import { generateReferralCode, isValidPin } from "@/domain/referral-code";
import { buildSiteSitemap } from "@/domain/sitemap";
import { verifyTurnstile } from "@/domain/turnstile";
import type { AppEnv } from "@/env";
import { featuredThemes, themeSwatch } from "@/themes/kuliner/configs";
import { AppLayout } from "@/ui/app-layout";
import { Card, PageTitle, Text, TextLink } from "@/ui/display";
import {
  ArticleBody,
  ArticleHeader,
  BlogGrid,
  CtaBand,
  CtaRow,
  DirectoryGrid,
  FaqList,
  FeatureGrid,
  Hero,
  LandingFooter,
  LandingSection,
  LandingShell,
  MetricBand,
  MitraForm,
  PriceCard,
  PricingGrid,
  SectionHeader,
  StepList,
  ThemeStrip,
  TopBar,
} from "@/ui/landing";

const daftarLimiter = createFixedWindowLimiter(3, 60_000);

const TITLE = "tokoweb.id — Website untuk Warung & UMKM, Jadi ≤ 1 Hari, Mulai Rp 75rb/bulan";
const DESCRIPTION =
  "Jasa pembuatan website UMKM kuliner: menu online, promo otomatis, tombol WhatsApp, statistik pengunjung. Jadi dalam sehari, kelola sendiri dari HP, mulai Rp 75rb/bulan.";

function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function mitraResultPage(props: { code?: string; error?: string }): string {
  return `<!doctype html>${String(
    <AppLayout title="Pendaftaran Mitra — tokoweb">
      <Card>
        {props.error ? (
          <>
            <PageTitle>Ups!</PageTitle>
            <Text>{props.error}</Text>
            <Text last>
              <TextLink href="/mitra">← Kembali</TextLink>
            </Text>
          </>
        ) : (
          <>
            <PageTitle>Terdaftar! 🎉</PageTitle>
            <Text>
              Kode mitramu: <strong>{props.code}</strong>. Simpan baik-baik bersama PIN-mu.
            </Text>
            <Text>
              Kami verifikasi dulu (anti-spam), lalu hubungi kamu via WhatsApp ≤ 1 hari. Setelah
              aktif, brosur QR-mu siap dan komisimu bisa dipantau di{" "}
              <strong>tokoweb.id/r/{props.code}</strong>.
            </Text>
            <Text last>
              <TextLink href="/">← Ke beranda</TextLink>
            </Text>
          </>
        )}
      </Card>
    </AppLayout>,
  )}`;
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

function contentTopBarLinks(baseDomain: string) {
  return [
    { href: "/#fitur", label: "Fitur" },
    { href: "/#harga", label: "Harga" },
    { href: "/blog", label: "Blog" },
    { href: "/toko", label: "Toko" },
    { href: `https://app.${baseDomain}/masuk`, label: "Masuk" },
  ];
}

function footerLinks(baseDomain: string) {
  return [
    { href: "/", label: "Beranda" },
    { href: "/blog", label: "Blog" },
    { href: "/toko", label: "Toko Bergabung" },
    { href: "/mitra", label: "Jadi Mitra" },
    { href: `https://app.${baseDomain}/masuk`, label: "Masuk" },
  ];
}

function contentCtaHref(c: { env: AppEnv["Bindings"] }): string {
  return c.env.CONTACT_WA_NUMBER
    ? waLink(c.env.CONTACT_WA_NUMBER, "Halo tokoweb, saya mau tanya website untuk usaha saya.")
    : `https://demo.${c.env.BASE_DOMAIN}/kuliner`;
}

function articleJsonLd(baseDomain: string, article: (typeof BLOG_ARTICLES)[number]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    keywords: article.keywords.join(", "),
    author: { "@type": "Organization", name: "tokoweb.id" },
    publisher: { "@type": "Organization", name: "tokoweb.id" },
    mainEntityOfPage: `https://${baseDomain}/blog/${article.slug}`,
  }).replace(/</g, "\\u003c");
}

const BLOG_TITLE = "Blog tokoweb.id — Tips Jualan & Website untuk Warung & UMKM Kuliner";
const BLOG_DESC =
  "Panduan praktis untuk pemilik warung dan UMKM kuliner: bikin website, jualan online, foto makanan, promosi hemat, dan tips agar mudah ditemukan di Google.";

export const landing = new Hono<AppEnv>()
  .get("/", async (c) => {
    const url = new URL(c.req.url);
    const cached = await matchCachedPage(url.hostname, "/landing-v10");
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
            { href: "/blog", label: "Blog" },
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
            sub="Lima belas tema unggulan di bawah — geser carousel-nya, klik untuk demo hidup, lalu jelajahi selengkapnya dengan nama usahamu."
          />
          <ThemeStrip
            themes={featuredThemes().map((theme) => {
              const swatch = themeSwatch(theme);
              return {
                slug: theme.slug,
                name: theme.name,
                character: theme.character,
                gradient: swatch.gradient,
                textColor: swatch.textColor,
                demoUrl: `${demoUrl}?tema=${theme.slug}`,
              };
            })}
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
        <LandingSection id="mitra">
          <SectionHeader
            kicker="Program Mitra"
            title="Kenal pemilik warung? Itu komisi."
            sub="Rekomendasikan tokoweb, klien bayar, kamu terima sampai Rp 300rb per klien. Ojol, sales, mahasiswa — siapa pun bisa. Tanpa modal, bukan MLM."
          />
          <CtaRow links={[{ href: "/mitra", label: "Pelajari Program Mitra →", fill: true }]} />
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
        <LandingSection id="blog">
          <SectionHeader
            kicker="Blog"
            title="Tips jualan & bikin website warung"
            sub="Panduan singkat dan praktis biar usahamu makin ramai — online maupun offline."
          />
          <BlogGrid
            items={BLOG_ARTICLES.slice(0, 3).map((article) => ({
              href: `/blog/${article.slug}`,
              title: article.title,
              description: article.description,
              meta: `${article.readMinutes} menit baca`,
            }))}
          />
          <CtaRow links={[{ href: "/blog", label: "Baca semua artikel →", fill: true }]} />
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
            { href: "/blog", label: "Blog" },
            { href: "/toko", label: "Toko Bergabung" },
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
    c.executionCtx.waitUntil(putCachedPage(url.hostname, "/landing-v10", response.clone()));
    return response;
  })
  .get("/mitra", async (c) => {
    const url = new URL(c.req.url);
    const cached = await matchCachedPage(url.hostname, "/mitra-v5");
    if (cached) return cached;

    const wa = c.env.CONTACT_WA_NUMBER
      ? waLink(c.env.CONTACT_WA_NUMBER, "Halo tokoweb, saya mau daftar jadi mitra.")
      : `https://demo.${c.env.BASE_DOMAIN}/kuliner`;

    const html = `<!doctype html>${String(
      <LandingShell
        title="Jadi Mitra tokoweb.id — Bawa Klien, Terima Komisi s/d Rp 300rb"
        description="Program mitra tokoweb.id: rekomendasikan website ke pemilik warung, terima komisi per klien yang membayar. Tanpa modal, bukan MLM, komisi cair setelah masa refund 7 hari."
        canonical={`https://${c.env.BASE_DOMAIN}/mitra`}
        jsonLd={landingJsonLd(c.env.BASE_DOMAIN)}
      >
        <TopBar
          ctaHref="/mitra/daftar"
          ctaLabel="Daftar Jadi Mitra"
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
          <CtaRow
            links={[{ href: "/mitra/daftar", label: "Daftar Jadi Mitra — gratis →", fill: true }]}
          />
        </LandingSection>
        <MetricBand
          metrics={[
            { num: "Rp 150rb", cap: "komisi per klien Basic (3 cicilan bulanan)" },
            { num: "Rp 300rb", cap: "komisi per klien Pro (3 cicilan bulanan)" },
            { num: "7 hari", cap: "cicilan pertama cair setelah masa refund lewat" },
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
                a: "Cicilan pertama cair setelah masa refund klien 7 hari lewat (jadi aman dari pembatalan). Cicilan 2 dan 3 mengikuti pembayaran langganan bulanan klien berikutnya.",
              },
              {
                q: "Cek komisi di mana?",
                a: "Halaman khususmu: tokoweb.id/r/KODEKAMU + PIN 6 digit. Berapa scan, berapa closing, berapa cair — semua transparan.",
              },
            ]}
          />
        </LandingSection>
        <LandingSection>
          <CtaBand
            title="Mulai hari ini, modal nol."
            sub="Daftar sendiri 1 menit — kode unik + brosur QR-mu jadi dalam hitungan menit."
            primary={{ href: "/mitra/daftar", label: "Daftar Jadi Mitra" }}
            secondary={
              c.env.CONTACT_WA_NUMBER ? { href: wa, label: "Tanya via WhatsApp" } : undefined
            }
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
    c.executionCtx.waitUntil(putCachedPage(url.hostname, "/mitra-v5", response.clone()));
    return response;
  })
  .get("/mitra/daftar", (c) => {
    const html = `<!doctype html>${String(
      <LandingShell
        title="Daftar Jadi Mitra tokoweb.id"
        description="Daftar jadi mitra tokoweb.id: isi nama, nomor WhatsApp, dan PIN. Kami verifikasi lalu kirim kode unik + brosur QR via WhatsApp."
        canonical={`https://${c.env.BASE_DOMAIN}/mitra/daftar`}
        jsonLd={landingJsonLd(c.env.BASE_DOMAIN)}
        noindex
      >
        <TopBar
          ctaHref="/mitra"
          ctaLabel="← Program Mitra"
          links={[
            { href: "/mitra", label: "Program Mitra" },
            { href: "/", label: "Beranda" },
          ]}
        />
        <LandingSection>
          <SectionHeader
            kicker="Daftar"
            title="Daftar sendiri, 1 menit selesai"
            sub="Isi form ini — kami verifikasi dulu (anti-spam), lalu hubungi kamu via WA ≤ 1 hari dengan kode unik + brosur QR siap pakai."
          />
          <MitraForm action="/mitra/daftar" siteKey={c.env.TURNSTILE_SITE_KEY} />
        </LandingSection>
        <LandingFooter links={[{ href: "/mitra", label: "← Kembali ke Program Mitra" }]} />
      </LandingShell>,
    )}`;
    return c.html(html, 200, { "cache-control": "public, max-age=300, s-maxage=1800" });
  })
  .post("/mitra/daftar", async (c) => {
    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    const values = formDataToValues(await c.req.formData());
    const name = (values.name ?? "").trim();
    const waNumber = (values.wa_number ?? "").replace(/\D/g, "");
    const pin = (values.pin ?? "").trim();

    const humanOk = await verifyTurnstile(
      c.env.TURNSTILE_SECRET,
      values["cf-turnstile-response"] ?? "",
      c.req.header("cf-connecting-ip"),
    );
    if (!humanOk) {
      return c.html(mitraResultPage({ error: "Verifikasi anti-robot gagal. Coba lagi." }), 400);
    }

    if (
      !daftarLimiter.allow(ip, Date.now()) ||
      name.length < 2 ||
      name.length > 60 ||
      !/^62\d{8,13}$/.test(waNumber) ||
      !isValidPin(pin)
    ) {
      return c.html(
        mitraResultPage({
          error: "Isi nama, no WA format 62xxxxxxxxxx, dan PIN 6 digit — lalu coba lagi.",
        }),
        400,
      );
    }

    const existing = await findReferrerByWa(c.env.DB, waNumber);
    if (existing) {
      return c.html(
        mitraResultPage({
          error:
            existing.status === "pending"
              ? "Nomor ini sudah terdaftar dan sedang kami verifikasi. Tunggu kabar via WA ya."
              : "Nomor ini sudah terdaftar sebagai mitra. Cek halaman komisimu di tokoweb.id/r/KODEKAMU.",
        }),
        409,
      );
    }

    let code = generateReferralCode(Math.random);
    for (let attempt = 0; attempt < 5 && (await findReferrerByCode(c.env.DB, code)); attempt++) {
      code = generateReferralCode(Math.random);
    }
    await createReferrer(c.env.DB, {
      code,
      name,
      waNumber,
      bankAccount: null,
      pinHash: await hashOneTimeToken(`${pin}:${c.env.AUTH_SECRET}`),
      status: "pending",
    });
    return c.html(mitraResultPage({ code }));
  })
  .get("/blog", (c) => {
    const base = c.env.BASE_DOMAIN;
    const html = `<!doctype html>${String(
      <LandingShell
        title={BLOG_TITLE}
        description={BLOG_DESC}
        canonical={`https://${base}/blog`}
        jsonLd={landingJsonLd(base)}
      >
        <TopBar
          ctaHref={contentCtaHref(c)}
          ctaLabel="Buat Website"
          links={contentTopBarLinks(base)}
        />
        <LandingSection>
          <SectionHeader
            kicker="Blog"
            title="Tips jualan & website untuk warung"
            sub="Panduan singkat dan praktis biar usahamu makin ramai — online maupun offline."
          />
          <BlogGrid
            items={BLOG_ARTICLES.map((article) => ({
              href: `/blog/${article.slug}`,
              title: article.title,
              description: article.description,
              meta: `${article.readMinutes} menit baca`,
            }))}
          />
        </LandingSection>
        <CtaBand
          title="Siap punya website untuk usahamu?"
          sub="Menu online, promo, tombol WhatsApp — jadi kurang dari sehari."
          primary={{ href: contentCtaHref(c), label: "Mulai Sekarang" }}
        />
        <LandingFooter links={footerLinks(base)} />
      </LandingShell>,
    )}`;
    return c.html(html, 200, { "cache-control": "public, max-age=3600, s-maxage=86400" });
  })
  .get("/blog/:slug", (c) => {
    const base = c.env.BASE_DOMAIN;
    const article = findArticle(c.req.param("slug"));
    if (!article) return c.notFound();
    const meta = `${new Date(article.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · ${article.readMinutes} menit baca`;
    const html = `<!doctype html>${String(
      <LandingShell
        title={`${article.title} — tokoweb.id`}
        description={article.description}
        canonical={`https://${base}/blog/${article.slug}`}
        jsonLd={articleJsonLd(base, article)}
      >
        <TopBar
          ctaHref={contentCtaHref(c)}
          ctaLabel="Buat Website"
          links={contentTopBarLinks(base)}
        />
        <article class="prose-wrap">
          <ArticleHeader title={article.title} meta={meta} />
          <ArticleBody blocks={parseBlogBody(article.body)} />
        </article>
        <CtaBand
          title="Punya website warung seperti ini"
          sub="Menu online, promo otomatis, tombol WhatsApp — mulai Rp 75rb/bulan."
          primary={{ href: contentCtaHref(c), label: "Lihat & Gabung" }}
        />
        <LandingFooter links={footerLinks(base)} />
      </LandingShell>,
    )}`;
    return c.html(html, 200, { "cache-control": "public, max-age=3600, s-maxage=86400" });
  })
  .get("/toko", async (c) => {
    const base = c.env.BASE_DOMAIN;
    const tenants = (await listTenants(c.env.DB)).filter((t) => t.status === "active");
    const html = `<!doctype html>${String(
      <LandingShell
        title="Toko Bergabung — tokoweb.id"
        description="Daftar warung, kedai, dan restoran yang sudah punya website bersama tokoweb.id. Temukan dan pesan langsung dari mereka."
        canonical={`https://${base}/toko`}
        jsonLd={landingJsonLd(base)}
      >
        <TopBar
          ctaHref={contentCtaHref(c)}
          ctaLabel="Buat Website"
          links={contentTopBarLinks(base)}
        />
        <LandingSection>
          <SectionHeader
            kicker="Toko Bergabung"
            title={`${tenants.length} usaha sudah online`}
            sub="Warung, kedai, dan resto yang sudah punya website bersama tokoweb.id."
          />
          <DirectoryGrid
            items={tenants.map((t) => ({
              href: `https://${t.slug}.${base}/`,
              name: t.name,
              vertical: "Kuliner",
              initial: (t.name.trim()[0] ?? "T").toUpperCase(),
            }))}
          />
        </LandingSection>
        <CtaBand
          title="Mau usahamu tampil di sini?"
          sub="Bikin website warungmu, langsung masuk daftar Toko Bergabung."
          primary={{ href: contentCtaHref(c), label: "Gabung Sekarang" }}
        />
        <LandingFooter links={footerLinks(base)} />
      </LandingShell>,
    )}`;
    return c.html(html, 200, { "cache-control": "public, max-age=300, s-maxage=1800" });
  })
  .get("/robots.txt", (c) =>
    c.text(`User-agent: *\nAllow: /\nSitemap: https://${c.env.BASE_DOMAIN}/sitemap.xml\n`, 200, {
      "cache-control": "public, max-age=86400",
    }),
  )
  .get("/sitemap.xml", async (c) => {
    const tenants = (await listTenants(c.env.DB)).filter((t) => t.status === "active");
    return c.text(
      buildSiteSitemap(
        c.env.BASE_DOMAIN,
        tenants.map((t) => t.slug),
        blogSlugs(),
      ),
      200,
      { "content-type": "application/xml", "cache-control": "public, max-age=3600" },
    );
  });
