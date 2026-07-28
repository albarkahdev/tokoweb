import { describe, expect, it } from "vitest";
import {
  addMenuItem,
  countFeatured,
  parseHoursForm,
  parseInfoForm,
  parseMenuItemForm,
  parsePromoForm,
  removeMenuItem,
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
