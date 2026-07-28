import { Hono } from "hono";
import { matchCachedPage, putCachedPage } from "@/db/edge-cache";
import type { AppEnv } from "@/env";
import { Feature, LandingShell, Step } from "@/ui/landing";

function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function LandingPage(props: { baseDomain: string; contactWa: string }) {
  const demoUrl = `https://demo.${props.baseDomain}/kuliner`;
  const wa = props.contactWa
    ? waLink(props.contactWa, "Halo tokoweb, saya mau tanya website untuk usaha saya.")
    : demoUrl;
  return (
    <main>
      <section class="hero">
        <span class="eyebrow">Untuk warung, kedai &amp; resto di Indonesia</span>
        <h1>
          Website keren untuk usahamu.
          <br />
          Jadi ≤ 3 hari.
        </h1>
        <p class="lead">
          Pembeli makin sering cari lewat Google dan link Instagram. Punya website profesional
          sekarang tidak perlu mahal — mulai <strong>Rp 75 ribu/bulan</strong>, semua kami urus.
        </p>
        <div class="cta-row">
          <a class="btn-primary" href={wa}>
            {props.contactWa ? "Chat Kami di WhatsApp" : "Lihat Contoh Website"}
          </a>
          <a class="btn-outline" href={demoUrl}>
            Coba Demo Langsung
          </a>
        </div>
        <p class="trust">
          Tanpa kontrak jangka panjang · Refund 7 hari · Data usahamu tetap milikmu
        </p>
      </section>

      <div class="section-alt">
        <section>
          <div>
            <h2>Kenapa usaha kuliner butuh website?</h2>
            <div class="grid">
              <Feature emoji="🔍" title="Ditemukan di Google">
                Orang ketik "ayam bakar dekat sini" — yang muncul yang punya website. Menu, jam
                buka, dan lokasimu langsung terbaca Google.
              </Feature>
              <Feature emoji="💬" title="Pembeli langsung chat WA">
                Setiap menu ada tombol "Tanya via WA". Dari lihat menu ke chat kamu: satu ketuk.
              </Feature>
              <Feature emoji="📊" title="Kamu tahu hasilnya">
                Laporan tiap bulan: berapa orang berkunjung, berapa yang klik WhatsApp. Bukan
                sekadar "punya website" — kelihatan kerjanya.
              </Feature>
              <Feature emoji="⚡" title="Ngebut di sinyal jelek">
                Dibangun untuk HP dan sinyal pas-pasan. Buka di bawah 1 detik — pembeli tidak kabur
                duluan.
              </Feature>
              <Feature emoji="📱" title="Update sendiri dari HP">
                Ganti harga, pasang promo, upload foto — semua dari HP-mu. Promo hilang otomatis pas
                masa berlakunya habis.
              </Feature>
              <Feature emoji="🎨" title="Ganti tampilan sekali klik">
                3 tema desain premium. Bosan? Ganti sendiri, data tidak berubah.
              </Feature>
            </div>
          </div>
        </section>
      </div>

      <section>
        <h2>Caranya gampang</h2>
        <div class="steps">
          <Step title="Chat kami">
            Ceritakan usahamu. Kami tunjukkan demo langsung dengan nama usahamu terpasang.
          </Step>
          <Step title="Isi form dari HP (± 10 menit)">
            Nama menu, harga, foto, jam buka. Tim kami yang merapikan semuanya sampai layak tayang.
          </Step>
          <Step title="Website tayang ≤ 3 hari">
            Kamu terima link website + akses kelola. Bayar lewat QRIS, beres.
          </Step>
        </div>
      </section>

      <div class="section-alt">
        <section>
          <div>
            <h2 style="text-align:center;">Harga jujur, tanpa biaya tersembunyi</h2>
            <div class="pricing" style="margin-top:2.5rem;">
              <div class="price-card">
                <h3>Basic</h3>
                <p class="amount">Rp 75rb</p>
                <p class="per">/bulan · setup sekali Rp 300rb</p>
                <ul>
                  <li>Website lengkap: menu, promo, galeri, testimoni</li>
                  <li>Alamat namausahamu.tokoweb.id</li>
                  <li>Kelola sendiri dari HP</li>
                  <li>Statistik pengunjung &amp; klik WA</li>
                  <li>Laporan bulanan via WA</li>
                </ul>
                <a class="btn-outline" href={wa}>
                  Pilih Basic
                </a>
              </div>
              <div class="price-card featured">
                <span class="tag">Paling lengkap</span>
                <h3>Pro</h3>
                <p class="amount">Rp 200rb</p>
                <p class="per">/bulan · setup sekali Rp 1jt</p>
                <ul>
                  <li>Semua fitur Basic</li>
                  <li>Domain sendiri (namausahamu.com)</li>
                  <li>Konten ditulis penuh oleh tim kami</li>
                  <li>Google Business Profile dioptimasi</li>
                </ul>
                <a class="btn-primary" href={wa}>
                  Pilih Pro
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="faq">
        <h2>Pertanyaan yang sering muncul</h2>
        <details>
          <summary>Saya gaptek, bisa?</summary>
          <p>
            Bisa. Kamu cuma isi form dari HP — sisanya kami yang kerjakan. Update harian (ganti
            harga, promo) semudah pakai WhatsApp.
          </p>
        </details>
        <details>
          <summary>Perlu beli domain atau hosting?</summary>
          <p>
            Tidak. Paket Basic sudah termasuk alamat namausahamu.tokoweb.id. Mau domain sendiri
            (.com)? Ada di paket Pro.
          </p>
        </details>
        <details>
          <summary>Kalau mau berhenti?</summary>
          <p>
            Berhenti kapan saja, tanpa penalti. 7 hari pertama tidak puas → uang setup kembali 100%.
            Konten dan fotomu tetap milikmu.
          </p>
        </details>
        <details>
          <summary>Websitenya cepat tidak?</summary>
          <p>
            Skor Google PageSpeed 100/100 di HP. Coba sendiri demonya — buka dari sinyal paling
            jelek sekalipun.
          </p>
        </details>
      </section>

      <footer>
        <p>
          <strong>tokoweb.id</strong> — website kilat untuk UMKM Indonesia
          <br />
          <a href={demoUrl}>Demo</a>
          {props.contactWa ? (
            <>
              {" · "}
              <a href={wa}>WhatsApp</a>
            </>
          ) : null}
        </p>
      </footer>
    </main>
  );
}

function landingJsonLd(baseDomain: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "tokoweb.id",
    url: `https://${baseDomain}`,
    description:
      "Jasa pembuatan website untuk UMKM kuliner Indonesia. Jadi 3 hari, mulai Rp 75.000/bulan, kelola sendiri dari HP.",
  });
}

const TITLE = "tokoweb.id — Website untuk Warung & UMKM, Jadi ≤ 3 Hari, Mulai Rp 75rb/bulan";
const DESCRIPTION =
  "Jasa pembuatan website UMKM kuliner: menu online, promo otomatis, tombol WhatsApp, statistik pengunjung. Jadi 3 hari, kelola sendiri dari HP, mulai Rp 75rb/bulan.";

export const landing = new Hono<AppEnv>()
  .get("/", async (c) => {
    const url = new URL(c.req.url);
    const cached = await matchCachedPage(url.hostname, "/");
    if (cached) return cached;

    const html = `<!doctype html>${String(
      <LandingShell
        title={TITLE}
        description={DESCRIPTION}
        canonical={`https://${c.env.BASE_DOMAIN}/`}
        jsonLd={landingJsonLd(c.env.BASE_DOMAIN)}
      >
        <LandingPage baseDomain={c.env.BASE_DOMAIN} contactWa={c.env.CONTACT_WA_NUMBER} />
      </LandingShell>,
    )}`;
    const response = new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=86400",
      },
    });
    c.executionCtx.waitUntil(putCachedPage(url.hostname, "/", response.clone()));
    return response;
  })
  .get("/robots.txt", (c) =>
    c.text(`User-agent: *\nAllow: /\nSitemap: https://${c.env.BASE_DOMAIN}/sitemap.xml\n`, 200, {
      "cache-control": "public, max-age=86400",
    }),
  )
  .get("/sitemap.xml", (c) =>
    c.text(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${c.env.BASE_DOMAIN}/</loc></url></urlset>\n`,
      200,
      { "content-type": "application/xml", "cache-control": "public, max-age=86400" },
    ),
  );
