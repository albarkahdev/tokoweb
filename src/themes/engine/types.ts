import type { PromoRow } from "@/db/promos";
import type { PublicSite } from "@/db/public-site";
import type { TestimonialRow } from "@/db/testimonials";

export type ThemeConfig = {
  slug: string;
  name: string;
  character: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    primaryContrast: string;
    accent: string;
    heroOverlay: string;
    heroBg: string;
  };
  fonts: {
    heading: string;
    body: string;
    headingWeight: number;
  };
  radius: {
    card: string;
    button: string;
  };
  layout: {
    hero: "photo" | "typo" | "color-block" | "split" | "poster" | "frame";
    menu: "cards" | "list" | "grid-2" | "magazine" | "polaroid";
  };
  flair?:
    | "batik"
    | "neon"
    | "brutal"
    | "zen"
    | "tropis"
    | "royal"
    | "retro"
    | "mono"
    | "lampion"
    | "sketsa"
    | "blueprint"
    | "koran"
    | "aurora"
    | "keramik"
    | "pixel"
    | "stempel"
    | "disko"
    | "hutan"
    | "teraso"
    | "krim"
    | "ombak"
    | "rempah"
    | "kelopak"
    | "gerabah"
    | "beku"
    | "api"
    | "anyaman"
    | "sutra"
    | "segar"
    | "bulu"
    | "sinar"
    | "kunang"
    | "uap"
    | "denyut"
    | "melayang"
    | "tinta"
    | "prisma"
    | "loket"
    | "sawah"
    | "kilau"
    | "gelembung"
    | "lilin"
    | "orbit"
    | "gugur"
    | "sirup"
    | "jendela"
    | "komet"
    | "angin"
    | "aksara"
    | "karnaval";
};

export const PUBLIC_PAGE_PATHS = ["/", "/menu", "/galeri", "/promo", "/testimoni"] as const;

export type PublicPagePath = (typeof PUBLIC_PAGE_PATHS)[number];

export type RenderData = {
  site: PublicSite;
  promos: PromoRow[];
  testimonials: TestimonialRow[];
  baseUrl: string;
  appBaseUrl: string;
  path: PublicPagePath;
  todayWib: string;
  noindex?: boolean;
  pageQuery?: string;
};
