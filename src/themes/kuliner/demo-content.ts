import type { SiteContent } from "@/domain/content";

export const DEMO_BUSINESS_NAME = "Warung Bu Sari";

export const DEMO_CONTENT: SiteContent = {
  info: {
    name: DEMO_BUSINESS_NAME,
    tagline: "Resep tiga generasi, dimasak pagi — biasanya habis sebelum petang",
    about:
      "Sejak 1998, dapur kami tidak pernah pakai bumbu instan. Ayam kampung dipilih subuh-subuh, sambal diulek saat kamu memesan, dan rendang dimasak lima jam sampai santannya jadi karamel. Datang sebagai pembeli, pulang sebagai langganan.",
    address: "Jl. Melati No. 3, Bandung",
    maps_url: "https://maps.app.goo.gl/contoh",
    wa_number: "6281234567890",
    phone: "0221234567",
    instagram: "warungbusari",
  },
  hours: {
    mon: ["08:00", "21:00"],
    tue: ["08:00", "21:00"],
    wed: ["08:00", "21:00"],
    thu: ["08:00", "21:00"],
    fri: ["08:00", "21:00"],
    sat: ["08:00", "22:00"],
    sun: null,
  },
  menu: [
    {
      category: "Makanan",
      items: [
        {
          name: "Nasi Ayam Bakar",
          price: 18000,
          desc: "Ayam kampung bakar arang, sambal korek dadakan, lalapan segar",
          image_key: "t/demo/menu/ayam-bakar.webp",
          images: ["t/demo/gallery/hero-sate.webp", "t/demo/gallery/suasana-3.webp"],
          featured: true,
          special: true,
        },
        {
          name: "Nasi Rendang",
          price: 22000,
          desc: "Dimasak 5 jam sampai santan jadi karamel — daging lumer",
          image_key: "t/demo/menu/rendang.webp",
          images: ["t/demo/gallery/suasana-2.webp"],
          featured: true,
        },
        {
          name: "Ayam Goreng Lengkuas",
          price: 17000,
          desc: "Renyah gurih rempah",
          image_key: "t/demo/menu/ayam-goreng.webp",
          featured: true,
        },
        { name: "Pecel Lele", price: 15000, image_key: "t/demo/menu/pecel-lele.webp" },
        { name: "Soto Ayam", price: 14000, image_key: "t/demo/menu/soto.webp" },
        { name: "Nasi Goreng Kampung", price: 15000, image_key: "t/demo/menu/nasi-goreng.webp" },
      ],
    },
    {
      category: "Minuman",
      items: [
        { name: "Es Teh Manis", price: 5000 },
        { name: "Es Jeruk", price: 7000 },
        { name: "Kopi Tubruk", price: 6000 },
      ],
    },
  ],
  gallery: [
    { image_key: "t/demo/gallery/hero-sate.webp", alt: "Sate bakaran langsung dari arang" },
    { image_key: "t/demo/gallery/suasana-1.webp", alt: "Suasana warung ramai" },
    { image_key: "t/demo/gallery/suasana-2.webp", alt: "Etalase menu segar" },
    { image_key: "t/demo/gallery/suasana-3.webp", alt: "Hidangan lengkap untuk keluarga" },
  ],
};
