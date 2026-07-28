import type { SiteContent } from "@/domain/content";

export const DEMO_BUSINESS_NAME = "Warung Bu Sari";

export const DEMO_CONTENT: SiteContent = {
  info: {
    name: DEMO_BUSINESS_NAME,
    tagline: "Masakan rumahan sejak 1998",
    about:
      "Warung keluarga dengan resep turun-temurun dari Bandung. Semua masakan dibuat segar setiap hari dengan bumbu racikan sendiri.",
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
          desc: "Sambal korek, lalapan segar",
          featured: true,
        },
        { name: "Nasi Rendang", price: 22000, desc: "Daging empuk bumbu meresap", featured: true },
        { name: "Ayam Goreng Lengkuas", price: 17000, desc: "Renyah gurih rempah", featured: true },
        { name: "Pecel Lele", price: 15000 },
        { name: "Soto Ayam", price: 14000 },
        { name: "Nasi Goreng Kampung", price: 15000 },
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
  gallery: [],
};
