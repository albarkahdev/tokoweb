export type SiteInfo = {
  name?: string;
  tagline?: string;
  about?: string;
  address?: string;
  maps_url?: string;
  wa_number?: string;
  phone?: string;
  instagram?: string;
};

export type MenuItem = {
  name?: string;
  price?: number;
  desc?: string;
  image_key?: string;
  featured?: boolean;
};

export type MenuCategory = {
  category?: string;
  items?: MenuItem[];
};

export type SiteContent = {
  info?: SiteInfo;
  hours?: Record<string, [string, string] | null>;
  menu?: MenuCategory[];
  gallery?: { image_key?: string; alt?: string }[];
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
