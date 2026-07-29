import { pruneTrackEvents, upsertDailyStats } from "@/db/daily-stats";
import { invalidateTenantCache } from "@/db/edge-cache";
import { listSubscriptionsWithDueDate, listTenantsWithPromoBoundary } from "@/db/lifecycle";
import { voidUnpaidPayouts } from "@/db/payouts";
import { findClosingByTenant } from "@/db/referrals";
import { setSubscriptionCycle } from "@/db/subscriptions";
import { setTenantStatus } from "@/db/tenants";
import { addDays, pruneCutoffUtc, yesterdayWibWindow } from "@/domain/stats";
import { lifecycleStatusFor, wibDateOf } from "@/domain/subscription";
import type { Bindings } from "@/env";
import { PUBLIC_PAGE_PATHS } from "@/themes/engine/types";

const PUBLIC_PATHS = [...PUBLIC_PAGE_PATHS];

export async function runDailyJobs(env: Bindings, nowMs: number): Promise<void> {
  await upsertDailyStats(env.DB, yesterdayWibWindow(nowMs));
  await pruneTrackEvents(env.DB, pruneCutoffUtc(nowMs));
}

export async function runNightlyMaintenance(env: Bindings, nowMs: number): Promise<void> {
  const today = wibDateOf(nowMs);
  await runSubscriptionLifecycle(env, today);
  await purgePromoBoundaries(env, today);
}

async function runSubscriptionLifecycle(env: Bindings, todayWib: string): Promise<void> {
  const rows = await listSubscriptionsWithDueDate(env.DB);
  for (const row of rows) {
    const nextStatus = lifecycleStatusFor(row.next_due_date, todayWib);
    if (nextStatus === row.tenant_status) continue;

    await setTenantStatus(env.DB, row.tenant_id, nextStatus);
    if (nextStatus === "grace" || nextStatus === "suspended") {
      await setSubscriptionCycle(env.DB, row.tenant_id, row.next_due_date, nextStatus);
    }
    if (nextStatus === "archived") {
      const closing = await findClosingByTenant(env.DB, row.tenant_id);
      if (closing) await voidUnpaidPayouts(env.DB, closing.id);
    }
    await purgeHostnames(env, row.slug, row.custom_domain);
  }
}

async function purgePromoBoundaries(env: Bindings, todayWib: string): Promise<void> {
  const tenants = await listTenantsWithPromoBoundary(env.DB, todayWib, addDays(todayWib, -1));
  for (const tenant of tenants) {
    await purgeHostnames(env, tenant.slug, tenant.custom_domain);
  }
}

async function purgeHostnames(
  env: Bindings,
  slug: string,
  customDomain: string | null,
): Promise<void> {
  const hostnames = [`${slug}.${env.BASE_DOMAIN}`];
  if (customDomain) hostnames.push(customDomain);
  await invalidateTenantCache(hostnames, PUBLIC_PATHS);
}
