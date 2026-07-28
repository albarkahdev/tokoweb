# Spesifikasi Tema

Tema = **konfigurasi**, bukan codebase terpisah. Satu engine render, tema hanya mengubah token desain + varian layout section. Nol duplikasi logika.

## Struktur tema

```
src/themes/
  engine/          ← renderer section, shared components (header, footer, WA button)
  kuliner/
    hangat/        ← tema 1: warung keluarga, earth tone (theme.json + layout varian + css)
    arang/         ← tema 2: premium gelap, charcoal + emas
    ceria/         ← tema 3: kekinian playful, warna berani
                     (arah desain: docs/theme-research.md)
```

### theme.json (design tokens)

```json
{
  "slug": "hangat",
  "vertical": "kuliner",
  "tokens": {
    "color": {
      "bg": "#FFFBF5", "surface": "#FFFFFF", "text": "#2D2A26",
      "muted": "#6B655E", "primary": "#C4501B", "accent": "#E8A03C"
    },
    "font": {
      "heading": "Fraunces", "body": "Inter",
      "scale": { "base": "1rem", "ratio": 1.25 }
    },
    "spacing": { "section": "clamp(4rem, 10vw, 7rem)", "gap": "1.5rem" },
    "radius": { "card": "1rem", "button": "9999px" },
    "shadow": { "card": "0 2px 16px rgb(0 0 0 / 0.06)" }
  },
  "layout": { "hero": "image-full", "menu": "cards", "gallery": "masonry" }
}
```

Token → CSS custom properties saat render. Layout varian dipilih per section dari set yang disediakan engine.

## Section wajib — vertikal kuliner

Urutan default (tema boleh atur ulang, tidak boleh menghilangkan yang wajib):

1. **Hero** — nama, tagline, foto andalan, CTA WA (wajib)
2. **Menu** — homepage hanya menampilkan item `featured` (maks 7, divalidasi CMS), harga format `Rp 18.000`, tiap item punya tombol "Tanya via WA" dengan teks otomatis menyebut nama item (wajib). Total item > 7 → tombol "Lihat Menu Lengkap" ke halaman `/menu`: semua item per kategori, navigasi kategori sticky, tetap di-cache. Total ≤ 7 → halaman `/menu` tidak dibuat.
3. **Jam buka** — status "Buka sekarang / Tutup" dihitung real-time sisi klien (wajib)
4. **Promo** — hanya render bila ada promo aktif
5. **Galeri** (wajib)
6. **Testimoni** — hanya yang `approved`
7. **Lokasi & kontak** — alamat, tombol Maps, WA, telepon (wajib)
8. **Footer** — atribusi platform (link ke situs kami = kanal akuisisi)

Semua tombol WA/telepon/Maps/promo memanggil tracker (lihat `tracker-spec.md`).

## Rasa desain (referensi: Apple, landing page korporat)

- Typography rapi: max 2 font family, hierarchy jelas lewat scale, line-height ≥ 1.5 body.
- Spacing lega: section padding besar (`clamp`), jangan padat.
- Animasi halus & hemat: fade/slide on-scroll via CSS + IntersectionObserver. `prefers-reduced-motion` dihormati. Tanpa library animasi.
- Foto adalah bintangnya (kuliner) — layout mengutamakan foto besar berkualitas.

## Checklist kualitas tema (wajib lolos sebelum tema rilis)

- [ ] Lighthouse mobile ≥ 90 (Performance, Accessibility, Best Practices, SEO) dengan data fixture realistis
- [ ] LCP < 2,5 dtk di throttling 4G, CLS < 0,1
- [ ] Responsive 360 px → 1440 px, tanpa horizontal scroll
- [ ] Gambar: WebP, `loading="lazy"` (kecuali hero), `width/height` eksplisit, `alt` terisi
- [ ] Font: subset + `font-display: swap`, self-hosted (tanpa request ke Google Fonts).
  *Status implementasi: tema memakai system font stack (nol request, nol byte font) dengan
  font brand (Fraunces/Marcellus/Bricolage) di urutan pertama stack — file font self-hosted
  ditambahkan nanti tanpa mengubah kode tema, cukup `@font-face` + file di storage.*
- [ ] Kontras teks AA (4.5:1), fokus keyboard terlihat, HTML semantik + heading berurut
- [ ] SEO otomatis dari data tenant (lihat bagian SEO di bawah)
- [ ] Zero JavaScript blocking; total JS < 30 KB
- [ ] Snapshot test render lulus untuk fixture kuliner

## SEO otomatis (engine, bukan per tema)

Semua di-generate sistem dari data tenant — klien tidak pernah mengurus SEO:

- `<title>`: `{Nama Usaha} — {tagline} | {kota}`.
- Meta description: dari teks "tentang" (draft AI saat kurasi via Copy Prompt, admin finalisasi).
- Open Graph + Twitter card: **og:image Fase 1 = foto andalan tenant** (hero/featured, sudah WebP). Generator OG card ber-branding (nama + foto + logo tokoweb) = Fase 2, butuh ADR (kandidat: `workers-og`).
- JSON-LD `Restaurant`/`LocalBusiness`: nama, alamat, jam buka, telepon, menu — dari JSON konten yang sama.
- Canonical, sitemap.xml + robots.txt per tenant, halaman preview tema = `noindex`.

## Preview & apply

- CMS: menu Info Usaha → "Ganti Tema" → grid 3 tema dengan thumbnail → "Preview" render situs klien dengan tema tsb di URL preview (`?preview_theme=slug`, noindex, tanpa cache) → "Pakai Tema Ini" → update `tenants.theme_id` + purge cache.
- Preview memakai **data asli klien**, bukan dummy — ini momen "wow".
