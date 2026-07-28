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
    "about",
    "address",
    "maps_url",
    "phone",
    "instagram",
  ];
  for (const key of optional) {
    const value = (form[key] ?? "").trim();
    if (value) info[key] = value;
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
  if (category.length < 2) return { ok: false, error: "Kategori wajib diisi." };
  if (name.length < 2) return { ok: false, error: "Nama item wajib diisi." };
  if (!Number.isInteger(price) || price <= 0) {
    return { ok: false, error: "Harga wajib angka lebih dari 0." };
  }
  const item: MenuItem = { name, price };
  const desc = (form.desc ?? "").trim();
  if (desc) item.desc = desc;
  if (form.featured === "on") item.featured = true;
  return { ok: true, value: { category, item } };
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
