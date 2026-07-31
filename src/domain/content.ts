export type SiteInfo = {
  name?: string;
  tagline?: string;
  ticker_text?: string;
  about?: string;
  address?: string;
  maps_url?: string;
  wa_number?: string;
  phone?: string;
  instagram?: string;
  logo_key?: string;
  announcement?: { text?: string; active?: boolean };
  temp_closed?: { active?: boolean; reason?: string };
};

export type MenuItem = {
  name?: string;
  price?: number;
  desc?: string;
  image_key?: string;
  images?: string[];
  featured?: boolean;
  special?: boolean;
  active?: boolean;
  available?: boolean;
};

export type OrderFeeSetting = { label?: string; amount?: number };

export type OrderSettings = {
  enabled?: boolean;
  cash?: boolean;
  tax_percent?: number;
  fees?: OrderFeeSetting[];
  min_order?: number;
  tables?: number;
};

export type MenuCategory = {
  category?: string;
  items?: MenuItem[];
};

export type SiteTrust = {
  google_rating?: string;
  google_url?: string;
  halal?: boolean;
  certs?: string;
};

export type SiteContent = {
  info?: SiteInfo;
  hours?: Record<string, [string, string] | null>;
  menu?: MenuCategory[];
  gallery?: { image_key?: string; alt?: string }[];
  trust?: SiteTrust;
  order_settings?: OrderSettings;
};

export function parseSiteContent(json: string | null): SiteContent {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as SiteContent;
  } catch {
    return {};
  }
}
