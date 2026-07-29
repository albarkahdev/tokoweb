import { describe, expect, it } from "vitest";
import {
  addItemPhoto,
  addMenuItem,
  countFeatured,
  findMenuItem,
  isItemActive,
  itemPhotos,
  parseHoursForm,
  parseInfoForm,
  parseItemEditForm,
  parseMenuItemForm,
  parsePromoForm,
  removeItemPhoto,
  removeMenuItem,
  updateMenuItem,
} from "@/domain/cms";

describe("parseInfoForm", () => {
  it("accepts minimal valid info", () => {
    const result = parseInfoForm({ name: "Warung Bu Sari", wa_number: "6281234567890" });
    expect(result).toEqual({
      ok: true,
      value: { name: "Warung Bu Sari", wa_number: "6281234567890" },
    });
  });

  it("normalizes wa number and keeps optional fields", () => {
    const result = parseInfoForm({
      name: "Warung",
      wa_number: "+62 812-3456-7890",
      tagline: "Enak",
      maps_url: "https://maps.app.goo.gl/x",
    });
    expect(result.ok && result.value.wa_number).toBe("6281234567890");
    expect(result.ok && result.value.tagline).toBe("Enak");
  });

  it("rejects missing name or bad wa number", () => {
    expect(parseInfoForm({ name: "", wa_number: "6281234567890" }).ok).toBe(false);
    expect(parseInfoForm({ name: "Warung", wa_number: "0812345678" }).ok).toBe(false);
  });

  it("rejects non-https maps url", () => {
    expect(
      parseInfoForm({ name: "Warung", wa_number: "6281234567890", maps_url: "http://x.com" }).ok,
    ).toBe(false);
  });
});

describe("parseHoursForm", () => {
  it("parses open days and closed days", () => {
    const form: Record<string, string> = {};
    for (const day of ["mon", "tue", "wed", "thu", "fri", "sat"]) {
      form[`${day}_open`] = "08:00";
      form[`${day}_close`] = "21:00";
    }
    form.sun_closed = "on";
    const result = parseHoursForm(form);
    expect(result.ok && result.value?.mon).toEqual(["08:00", "21:00"]);
    expect(result.ok && result.value?.sun).toBeNull();
  });

  it("rejects invalid time", () => {
    expect(parseHoursForm({ mon_open: "25:00", mon_close: "21:00" }).ok).toBe(false);
  });
});

describe("menu helpers", () => {
  it("parses item and counts featured", () => {
    const parsed = parseMenuItemForm({
      category: "Makanan",
      item_name: "Ayam Bakar",
      price: "18.000",
      featured: "on",
    });
    expect(parsed.ok && parsed.value.item.price).toBe(18000);
    const menu = addMenuItem(undefined, "Makanan", parsed.ok ? parsed.value.item : {});
    expect(countFeatured(menu)).toBe(1);
  });

  it("appends to existing category case-insensitively", () => {
    const menu = addMenuItem(
      [{ category: "Makanan", items: [{ name: "A", price: 1 }] }],
      "makanan",
      { name: "B", price: 2 },
    );
    expect(menu).toHaveLength(1);
    expect(menu[0]?.items).toHaveLength(2);
  });

  it("removes item and drops empty category", () => {
    const menu = removeMenuItem([{ category: "Makanan", items: [{ name: "A", price: 1 }] }], 0, 0);
    expect(menu).toHaveLength(0);
  });
});

describe("parsePromoForm", () => {
  it("accepts valid promo", () => {
    const result = parsePromoForm({
      title: "Diskon 20%",
      start_date: "2026-08-01",
      end_date: "2026-08-07",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects reversed dates", () => {
    expect(
      parsePromoForm({ title: "Promo", start_date: "2026-08-07", end_date: "2026-08-01" }).ok,
    ).toBe(false);
  });
});

describe("menu v2 — foto per item, aktif, spesial", () => {
  const menu = [
    {
      category: "Makanan",
      items: [
        { name: "Ayam Bakar", price: 18000, image_key: "a.webp" },
        { name: "Rendang", price: 22000 },
      ],
    },
  ];

  it("itemPhotos merges image_key with extra images capped at 3", () => {
    expect(itemPhotos({ image_key: "a", images: ["b", "c", "d"] })).toEqual(["a", "b", "c"]);
    expect(itemPhotos({ images: ["x"] })).toEqual(["x"]);
    expect(itemPhotos({})).toEqual([]);
  });

  it("addItemPhoto appends until limit then rejects", () => {
    const one = addItemPhoto(menu, 0, 0, "b.webp");
    expect(one.ok).toBe(true);
    if (!one.ok) return;
    const two = addItemPhoto(one.value, 0, 0, "c.webp");
    expect(two.ok).toBe(true);
    if (!two.ok) return;
    expect(itemPhotos(findMenuItem(two.value, 0, 0) ?? {})).toEqual(["a.webp", "b.webp", "c.webp"]);
    const three = addItemPhoto(two.value, 0, 0, "d.webp");
    expect(three.ok).toBe(false);
  });

  it("removeItemPhoto promotes next photo to primary and reports removed key", () => {
    const filled = updateMenuItem(menu, 0, 0, { image_key: "a", images: ["b", "c"] });
    const { menu: next, removedKey } = removeItemPhoto(filled, 0, 0, 0);
    expect(removedKey).toBe("a");
    const item = findMenuItem(next, 0, 0);
    expect(item?.image_key).toBe("b");
    expect(item?.images).toEqual(["c"]);
  });

  it("toggles active and special via updateMenuItem without mutating source", () => {
    const off = updateMenuItem(menu, 0, 1, { active: false, special: true });
    expect(findMenuItem(off, 0, 1)?.active).toBe(false);
    expect(findMenuItem(off, 0, 1)?.special).toBe(true);
    expect(findMenuItem(menu, 0, 1)?.active).toBeUndefined();
    expect(isItemActive({ active: false })).toBe(false);
    expect(isItemActive({})).toBe(true);
  });

  it("parseItemEditForm validates name and price", () => {
    expect(parseItemEditForm({ item_name: "Sate", price: "20.000", desc: "" }).ok).toBe(true);
    expect(parseItemEditForm({ item_name: "S", price: "20000" }).ok).toBe(false);
    expect(parseItemEditForm({ item_name: "Sate", price: "0" }).ok).toBe(false);
  });
});
