import type { PromoRow } from "@/db/promos";
import type { PublicSite } from "@/db/public-site";
import type { TestimonialRow } from "@/db/testimonials";

export type ThemeConfig = {
  slug: string;
  name: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    primaryContrast: string;
    accent: string;
    heroOverlay: string;
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
    hero: "image-full" | "image-split" | "color-block";
    menu: "cards" | "list" | "grid-2";
  };
};

export type RenderData = {
  site: PublicSite;
  promos: PromoRow[];
  testimonials: TestimonialRow[];
  baseUrl: string;
  appBaseUrl: string;
  path: "/" | "/menu";
  todayWib: string;
  noindex?: boolean;
};
