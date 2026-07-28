import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { runNightlyMaintenance } from "@/cron";

const NOW = Date.UTC(2026, 6, 29, 17, 5);

async function tenantStatus(id: number): Promise<string | undefined> {
  const row = await env.DB.prepare("SELECT status FROM tenants WHERE id = ?1")
    .bind(id)
    .first<{ status: string }>();
  return row?.status;
}

beforeAll(async () => {
  await env.DB.prepare(
    `INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES
     (1, 'lancar', 'Warung Lancar', 1, 1, 'active'),
     (2, 'telat', 'Warung Telat', 1, 1, 'active'),
     (3, 'nunggak', 'Warung Nunggak', 1, 1, 'grace'),
     (4, 'hilang', 'Warung Hilang', 1, 1, 'suspended')`,
  ).run();
  await env.DB.prepare(
    `INSERT INTO subscriptions (tenant_id, plan, monthly_price, next_due_date, status) VALUES
     (1, 'basic', 75000, '2026-08-15', 'active'),
     (2, 'basic', 75000, '2026-07-29', 'active'),
     (3, 'basic', 75000, '2026-07-20', 'grace'),
     (4, 'basic', 75000, '2026-04-25', 'suspended')`,
  ).run();

  await env.DB.prepare(
    "INSERT INTO referrers (id, code, name, wa_number, status) VALUES (1, 'K7M3XR', 'Pak Ojol', '628990011223', 'active')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO referrals (id, referrer_id, tenant_id, closed_at) VALUES (1, 1, 4, '2026-04-01 00:00:00')",
  ).run();
  await env.DB.prepare(
    `INSERT INTO commission_payouts (referral_id, installment, amount, due_trigger, status) VALUES
     (1, 1, 50000, 'setup_paid', 'paid'),
     (1, 2, 50000, 'month2_paid', 'payable'),
     (1, 3, 50000, 'month3_paid', 'pending')`,
  ).run();
});

describe("runNightlyMaintenance — lifecycle langganan", () => {
  it("applies grace, suspend, and archive transitions", async () => {
    await runNightlyMaintenance(env, NOW);

    expect(await tenantStatus(1)).toBe("active");
    expect(await tenantStatus(2)).toBe("grace");
    expect(await tenantStatus(3)).toBe("suspended");
    expect(await tenantStatus(4)).toBe("archived");
  });

  it("voids unpaid installments when tenant is archived, keeps paid", async () => {
    const payouts = await env.DB.prepare(
      "SELECT installment, status FROM commission_payouts ORDER BY installment",
    ).all<{ installment: number; status: string }>();
    expect(payouts.results).toEqual([
      { installment: 1, status: "paid" },
      { installment: 2, status: "void" },
      { installment: 3, status: "void" },
    ]);
  });

  it("is idempotent on re-run", async () => {
    await runNightlyMaintenance(env, NOW);
    expect(await tenantStatus(2)).toBe("grace");
    expect(await tenantStatus(4)).toBe("archived");
  });
});
