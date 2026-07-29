import type { MenuCategory, MenuItem, SiteContent, SiteInfo } from "@/domain/content";

export const MAX_FEATURED_ITEMS = 7;
export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export const DAY_LABELS: Record<(typeof DAY_KEYS)[number], string> = {
  mon: "Senin",
  tue: "Selasa",
  wed: "Rabu",
  thu: "Kamis",
  fri: "Jumat",
  sat: "Sabtu",
  sun: "Minggu",
};

export type FormValues = Record<string, string>;

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const WA_PATTERN = /^62\d{8,13}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const MAX_NAME = 80;
export const MAX_DESC = 500;
export const MAX_ABOUT = 1000;
export const MAX_TAGLINE = 160;
export const MAX_CATEGORY = 40;
export const MAX_PRICE = 100_000_000;

const FIELD_CAPS: Partial<Record<keyof SiteInfo, number>> = {
  tagline: MAX_TAGLINE,
  ticker_text: MAX_TAGLINE,
  about: MAX_ABOUT,
  address: MAX_ABOUT,
  phone: 20,
  instagram: 40,
  maps_url: 500,
};

export function parseInfoForm(form: FormValues): ParseResult<SiteInfo> {
  const name = (form.name ?? "").trim();
  const waNumber = (form.wa_number ?? "").trim().replace(/\D/g, "");
  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Nama usaha wajib diisi (2–80 karakter)." };
  }
  if (!WA_PATTERN.test(waNumber)) {
    return { ok: false, error: "Nomor WA wajib format 62xxxxxxxxxx." };
  }
  const info: SiteInfo = { name, wa_number: waNumber };
  const optional: (keyof SiteInfo)[] = [
    "tagline",
    "ticker_text",
    "about",
    "address",
    "maps_url",
    "phone",
    "instagram",
  ];
  for (const key of optional) {
    const value = (form[key] ?? "").trim();
    if (!value) continue;
    const cap = FIELD_CAPS[key] ?? MAX_ABOUT;
    if (value.length > cap) {
      return { ok: false, error: `${key} terlalu panjang (maks ${cap} karakter).` };
    }
    info[key] = value;
  }
  if (info.maps_url && !info.maps_url.startsWith("https://")) {
    return { ok: false, error: "Link Maps harus diawali https://" };
  }
  return { ok: true, value: info };
}

export function parseHoursForm(form: FormValues): ParseResult<SiteContent["hours"]> {
  const hours: NonNullable<SiteContent["hours"]> = {};
  for (const day of DAY_KEYS) {
    if (form[`${day}_closed`] === "on") {
      hours[day] = null;
      continue;
    }
    const open = (form[`${day}_open`] ?? "").trim();
    const close = (form[`${day}_close`] ?? "").trim();
    if (!TIME_PATTERN.test(open) || !TIME_PATTERN.test(close)) {
      return { ok: false, error: `Jam ${DAY_LABELS[day]} tidak valid (format 08:00).` };
    }
    hours[day] = [open, close];
  }
  return { ok: true, value: hours };
}

export function parseMenuItemForm(form: FormValues): ParseResult<{
  category: string;
  item: MenuItem;
}> {
  const category = (form.category ?? "").trim();
  const name = (form.item_name ?? "").trim();
  const price = Number((form.price ?? "").replace(/\D/g, ""));
  if (category.length < 2 || category.length > MAX_CATEGORY) {
    return { ok: false, error: `Kategori wajib diisi (maks ${MAX_CATEGORY} karakter).` };
  }
  if (name.length < 2 || name.length > MAX_NAME) {
    return { ok: false, error: `Nama item wajib diisi (maks ${MAX_NAME} karakter).` };
  }
  if (!Number.isInteger(price) || price <= 0 || price > MAX_PRICE) {
    return { ok: false, error: "Harga wajib angka wajar lebih dari 0." };
  }
  const desc = (form.desc ?? "").trim();
  if (desc.length > MAX_DESC) {
    return { ok: false, error: `Deskripsi terlalu panjang (maks ${MAX_DESC} karakter).` };
  }
  const item: MenuItem = { name, price };
  if (desc) item.desc = desc;
  if (form.featured === "on") item.featured = true;
  return { ok: true, value: { category, item } };
}

export const MAX_ITEM_PHOTOS = 3;

export function isItemActive(item: MenuItem): boolean {
  return item.active !== false;
}

export function itemPhotos(item: MenuItem): string[] {
  const keys = [item.image_key, ...(item.images ?? [])].filter((key): key is string =>
    Boolean(key),
  );
  return [...new Set(keys)].slice(0, MAX_ITEM_PHOTOS);
}

function cloneMenu(menu: MenuCategory[] | undefined): MenuCategory[] {
  return (menu ?? []).map((entry) => ({
    category: entry.category,
    items: (entry.items ?? []).map((item) => ({ ...item })),
  }));
}

export function findMenuItem(
  menu: MenuCategory[] | undefined,
  categoryIndex: number,
  itemIndex: number,
): MenuItem | null {
  return (menu ?? [])[categoryIndex]?.items?.[itemIndex] ?? null;
}

export function updateMenuItem(
  menu: MenuCategory[] | undefined,
  categoryIndex: number,
  itemIndex: number,
  patch: Partial<MenuItem>,
): MenuCategory[] {
  const next = cloneMenu(menu);
  const item = next[categoryIndex]?.items?.[itemIndex];
  if (item) Object.assign(item, patch);
  return next;
}

export function addItemPhoto(
  menu: MenuCategory[] | undefined,
  categoryIndex: number,
  itemIndex: number,
  imageKey: string,
): ParseResult<MenuCategory[]> {
  const item = findMenuItem(menu, categoryIndex, itemIndex);
  if (!item) return { ok: false, error: "Item tidak ditemukan." };
  if (itemPhotos(item).length >= MAX_ITEM_PHOTOS) {
    return {
      ok: false,
      error: `Maksimal ${MAX_ITEM_PHOTOS} foto per menu. Hapus salah satu dulu.`,
    };
  }
  const images = itemPhotos(item).concat(imageKey);
  return {
    ok: true,
    value: updateMenuItem(menu, categoryIndex, itemIndex, {
      image_key: images[0],
      images: images.slice(1),
    }),
  };
}

export function removeItemPhoto(
  menu: MenuCategory[] | undefined,
  categoryIndex: number,
  itemIndex: number,
  photoIndex: number,
): { menu: MenuCategory[]; removedKey: string | null } {
  const item = findMenuItem(menu, categoryIndex, itemIndex);
  if (!item) return { menu: cloneMenu(menu), removedKey: null };
  const photos = itemPhotos(item);
  const removedKey = photos[photoIndex] ?? null;
  const rest = photos.filter((_, index) => index !== photoIndex);
  return {
    menu: updateMenuItem(menu, categoryIndex, itemIndex, {
      image_key: rest[0],
      images: rest.slice(1),
    }),
    removedKey,
  };
}

export function parseItemEditForm(form: FormValues): ParseResult<Partial<MenuItem>> {
  const name = (form.item_name ?? "").trim();
  const price = Number((form.price ?? "").replace(/\D/g, ""));
  if (name.length < 2 || name.length > MAX_NAME) {
    return { ok: false, error: `Nama item wajib diisi (maks ${MAX_NAME} karakter).` };
  }
  if (!Number.isInteger(price) || price <= 0 || price > MAX_PRICE) {
    return { ok: false, error: "Harga wajib angka wajar lebih dari 0." };
  }
  const desc = (form.desc ?? "").trim();
  if (desc.length > MAX_DESC) {
    return { ok: false, error: `Deskripsi terlalu panjang (maks ${MAX_DESC} karakter).` };
  }
  return { ok: true, value: { name, price, desc: desc || undefined } };
}

export function countFeatured(menu: MenuCategory[] | undefined): number {
  return (menu ?? []).flatMap((category) => category.items ?? []).filter((item) => item.featured)
    .length;
}

export function addMenuItem(
  menu: MenuCategory[] | undefined,
  category: string,
  item: MenuItem,
): MenuCategory[] {
  const next = (menu ?? []).map((entry) => ({
    category: entry.category,
    items: [...(entry.items ?? [])],
  }));
  const existing = next.find(
    (entry) => (entry.category ?? "").toLowerCase() === category.toLowerCase(),
  );
  if (existing) {
    existing.items.push(item);
  } else {
    next.push({ category, items: [item] });
  }
  return next;
}

export function removeMenuItem(
  menu: MenuCategory[] | undefined,
  categoryIndex: number,
  itemIndex: number,
): MenuCategory[] {
  const next = (menu ?? []).map((entry) => ({
    category: entry.category,
    items: [...(entry.items ?? [])],
  }));
  next[categoryIndex]?.items.splice(itemIndex, 1);
  return next.filter((entry) => entry.items.length > 0);
}

export function parsePromoForm(form: FormValues): ParseResult<{
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
}> {
  const title = (form.title ?? "").trim();
  const startDate = (form.start_date ?? "").trim();
  const endDate = (form.end_date ?? "").trim();
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (title.length < 3) return { ok: false, error: "Judul promo wajib diisi." };
  if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
    return { ok: false, error: "Tanggal mulai dan berakhir wajib diisi." };
  }
  if (startDate > endDate) {
    return { ok: false, error: "Tanggal berakhir harus setelah tanggal mulai." };
  }
  const description = (form.description ?? "").trim();
  return { ok: true, value: { title, description: description || null, startDate, endDate } };
}

export function formDataToValues(formData: FormData): FormValues {
  const values: FormValues = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") values[key] = value;
  });
  return values;
}
