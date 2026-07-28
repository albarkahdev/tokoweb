export function buildCurationPrompt(businessName: string, rawIntakeJson: string): string {
  return [
    `Kamu adalah copywriter untuk website UMKM kuliner Indonesia bernama "${businessName}".`,
    "Berikut data mentah dari pemilik usaha (JSON):",
    "",
    rawIntakeJson,
    "",
    "Tugasmu, jawab dalam format persis di bawah:",
    "1. TAGLINE: satu kalimat pendek (maks 8 kata) yang menjual.",
    '2. TENTANG: rapikan teks "tentang" jadi 2-3 kalimat hangat dan meyakinkan.',
    "3. DESKRIPSI MENU: untuk tiap item menu, satu kalimat deskripsi menggugah selera (maks 12 kata).",
    "4. META DESCRIPTION: 150-160 karakter untuk SEO, sebut nama usaha + kota + menu andalan.",
    "Gunakan Bahasa Indonesia santai tapi profesional. Jangan mengarang fakta yang tidak ada di data.",
  ].join("\n");
}
