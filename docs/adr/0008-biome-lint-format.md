# ADR-0008: Biome untuk lint + format

**Status:** diterima · 2026-07-28

## Konteks
Butuh lint + format konsisten yang dijalankan di pre-commit setiap kali. Solo founder — tooling harus cepat dan nol perawatan. Pre-commit lambat = kebiasaan `--no-verify` = aturan mati.

## Opsi
1. ESLint + Prettier — standar industri, ekosistem plugin luas, tapi dua tool + config yang bisa saling bentrok, lambat di pre-commit.
2. **Biome** — satu tool untuk lint + format, satu file config, Rust (milidetik), aturan recommended setara ESLint core.
3. Tanpa linter, format saja — murah, tapi kehilangan aturan yang menjaga konvensi (larangan import relatif, dependency tak terdeklarasi).

## Keputusan
Biome. Satu dev-dependency menggantikan lima+ (eslint, prettier, plugin, config). Aturan proyek yang ditegakkan otomatis: larangan import relatif ke atas (`noRestrictedImports`), dependensi wajib terdeklarasi (`noUndeclaredDependencies`).

## Konsekuensi
- (+) Pre-commit tetap cepat → tidak ada alasan skip.
- (+) Satu config (`biome.json`), nol konflik lint vs format.
- (−) Ekosistem plugin lebih kecil dari ESLint — aturan niche (mis. plugin a11y JSX tertentu) belum tentu ada. Cukup untuk kebutuhan sekarang.
- Trigger evaluasi ulang: butuh aturan lint yang Biome tidak punya dan itu menjaga requirement nyata.
