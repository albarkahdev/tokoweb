import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import {
  findPendingSubmission,
  getSubmissionForPeriod,
  listPendingSubmissions,
  reviewSubmission,
  upsertBillingSubmission,
} from "@/db/billing";

beforeEach(async () => {
  await env.DB.exec("DELETE FROM billing_submissions");
  await env.DB.exec("DELETE FROM tenants");
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung', 1, 1, 'grace'), (2, 'kedai', 'Kedai', 1, 1, 'active')",
  ).run();
});

describe("billing submissions db", () => {
  it("creates a pending submission and reads it back", async () => {
    await upsertBillingSubmission(env.DB, {
      tenantId: 1,
      period: "2026-08",
      amount: 75000,
      proofKey: "t/warung/proof/a.webp",
      note: "dari BCA",
      nowIso: "2026-08-01 09:00:00",
    });
    const row = await getSubmissionForPeriod(env.DB, 1, "2026-08");
    expect(row?.status).toBe("pending");
    expect(row?.amount).toBe(75000);
    expect(row?.proof_key).toBe("t/warung/proof/a.webp");
    expect(row?.note).toBe("dari BCA");
  });

  it("re-upload for the same period replaces proof and resets to pending", async () => {
    await upsertBillingSubmission(env.DB, {
      tenantId: 1,
      period: "2026-08",
      amount: 75000,
      proofKey: "t/warung/proof/old.webp",
      note: null,
      nowIso: "2026-08-01 09:00:00",
    });
    await reviewSubmission(env.DB, 1, "2026-08", "rejected", "2026-08-01 10:00:00");
    await upsertBillingSubmission(env.DB, {
      tenantId: 1,
      period: "2026-08",
      amount: 75000,
      proofKey: "t/warung/proof/new.webp",
      note: null,
      nowIso: "2026-08-02 09:00:00",
    });
    const row = await getSubmissionForPeriod(env.DB, 1, "2026-08");
    expect(row?.status).toBe("pending");
    expect(row?.proof_key).toBe("t/warung/proof/new.webp");
    expect(row?.reviewed_at).toBeNull();
  });

  it("findPendingSubmission ignores matched/rejected", async () => {
    await upsertBillingSubmission(env.DB, {
      tenantId: 1,
      period: "2026-08",
      amount: 75000,
      proofKey: null,
      note: null,
      nowIso: "2026-08-01 09:00:00",
    });
    expect(await findPendingSubmission(env.DB, 1)).not.toBeNull();
    await reviewSubmission(env.DB, 1, "2026-08", "matched", "2026-08-01 10:00:00");
    expect(await findPendingSubmission(env.DB, 1)).toBeNull();
  });

  it("lists pending submissions across tenants with names", async () => {
    await upsertBillingSubmission(env.DB, {
      tenantId: 1,
      period: "2026-08",
      amount: 75000,
      proofKey: null,
      note: null,
      nowIso: "2026-08-01 09:00:00",
    });
    await upsertBillingSubmission(env.DB, {
      tenantId: 2,
      period: "2026-08",
      amount: 200000,
      proofKey: null,
      note: null,
      nowIso: "2026-08-01 08:00:00",
    });
    await reviewSubmission(env.DB, 2, "2026-08", "matched", "2026-08-01 10:00:00");
    const pending = await listPendingSubmissions(env.DB);
    expect(pending).toHaveLength(1);
    expect(pending[0]?.tenant_name).toBe("Warung");
  });
});
